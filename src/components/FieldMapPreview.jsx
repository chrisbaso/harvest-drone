import { enrichOpsJob } from "../../shared/fieldOps";

function safeParseJson(value) {
  if (!value) return null;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch (_error) {
    return null;
  }
}

function getMetadata(job = {}) {
  return safeParseJson(job.metadata_json) || safeParseJson(job.metadata) || {};
}

function numberOrNull(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getFarmAddress(farm = {}) {
  return [farm.address_line_1, farm.city, farm.state, farm.zip].filter(Boolean).join(", ");
}

function getGeometry(value) {
  const geojson = safeParseJson(value);
  if (!geojson) return null;
  if (geojson.type === "FeatureCollection") {
    return (geojson.features || []).map((feature) => feature.geometry).find((geometry) => geometry?.type === "Polygon" || geometry?.type === "MultiPolygon") || null;
  }
  if (geojson.type === "Feature") return geojson.geometry || null;
  if (geojson.type === "Polygon" || geojson.type === "MultiPolygon") return geojson;
  return null;
}

function getRings(geometry) {
  if (!geometry) return [];
  if (geometry.type === "Polygon") return geometry.coordinates || [];
  if (geometry.type === "MultiPolygon") return (geometry.coordinates || []).flatMap((polygon) => polygon || []);
  return [];
}

function validCoord(coord) {
  return Array.isArray(coord) && Number.isFinite(Number(coord[0])) && Number.isFinite(Number(coord[1]));
}

function getBounds(rings) {
  const coords = rings.flat().filter(validCoord);
  if (!coords.length) return null;
  const lons = coords.map((coord) => Number(coord[0]));
  const lats = coords.map((coord) => Number(coord[1]));
  return {
    minLon: Math.min(...lons),
    maxLon: Math.max(...lons),
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
  };
}

function scaleCoord(coord, bounds) {
  const lonRange = bounds.maxLon - bounds.minLon || 1;
  const latRange = bounds.maxLat - bounds.minLat || 1;
  const x = 10 + ((Number(coord[0]) - bounds.minLon) / lonRange) * 80;
  const y = 90 - ((Number(coord[1]) - bounds.minLat) / latRange) * 80;
  return [x, y];
}

function getBoundaryPaths(geometry) {
  const rings = getRings(geometry);
  const bounds = getBounds(rings);
  if (!bounds) return [];
  return rings
    .map((ring) => ring.filter(validCoord))
    .filter((ring) => ring.length >= 3)
    .map((ring) => {
      const commands = ring.map((coord, index) => {
        const [x, y] = scaleCoord(coord, bounds);
        return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      });
      return `${commands.join(" ")} Z`;
    });
}

function asList(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (typeof value === "string") return value.split(/[;,]/).map((item) => item.trim()).filter(Boolean);
  return [];
}

function uniqueList(values) {
  const seen = new Set();
  return values.filter((value) => {
    const key = String(value || "").trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildMapUrl(query, mode = "search") {
  if (!query) return null;
  const encoded = encodeURIComponent(query);
  return mode === "directions"
    ? `https://www.google.com/maps/dir/?api=1&destination=${encoded}`
    : `https://www.google.com/maps/search/?api=1&query=${encoded}`;
}

function getMapData({ job, state = {}, farm, field }) {
  const enrichedJob = job ? (job.client || job.farm || job.field ? job : enrichOpsJob(job, state)) : {};
  const metadata = getMetadata(enrichedJob);
  const mapMetadata = metadata.map || {};
  const farmRecord = farm || enrichedJob.farm || (state.farms || []).find((item) => item.id === enrichedJob.farm_id) || {};
  const fieldRecord = field || enrichedJob.field || (state.fields || []).find((item) => item.id === enrichedJob.field_id) || {};
  const geometry = getGeometry(fieldRecord.boundary_geojson || mapMetadata.boundary_geojson || mapMetadata.boundary);
  const farmLat = numberOrNull(farmRecord.latitude);
  const farmLng = numberOrNull(farmRecord.longitude);
  const centerLat = numberOrNull(mapMetadata.center?.lat ?? mapMetadata.center?.latitude ?? metadata.field_center_lat ?? metadata.latitude ?? farmLat);
  const centerLng = numberOrNull(mapMetadata.center?.lng ?? mapMetadata.center?.longitude ?? metadata.field_center_lng ?? metadata.longitude ?? farmLng);
  const address = getFarmAddress(farmRecord);
  const query = centerLat !== null && centerLng !== null ? `${centerLat},${centerLng}` : address || farmRecord.name || fieldRecord.name || "";
  const hazards = uniqueList([
    ...asList(mapMetadata.hazards),
    ...asList(metadata.hazards),
    ...asList(metadata.obstacles),
    ...asList(metadata.sensitive_areas),
    ...asList(metadata.no_spray_zones),
  ]);

  return {
    jobTitle: enrichedJob.title || "",
    farmName: farmRecord.name || enrichedJob.farm_name || "Farm TBD",
    fieldName: fieldRecord.name || enrichedJob.field_name || "Field TBD",
    acres: Number(enrichedJob.acres || fieldRecord.acres || 0),
    crop: enrichedJob.crop_type || fieldRecord.crop_type || fieldRecord.crop || "Crop TBD",
    address,
    centerLat,
    centerLng,
    hasCoordinates: centerLat !== null && centerLng !== null,
    geometry,
    hasBoundary: Boolean(geometry),
    mapUrl: buildMapUrl(query),
    directionsUrl: buildMapUrl(query, "directions"),
    stagingArea: metadata.staging_area || mapMetadata.staging_area || "Staging area not documented.",
    accessNotes: metadata.access_notes || fieldRecord.notes || farmRecord.notes || "Access notes not documented.",
    hazards,
    boundaryNotes: mapMetadata.boundary_notes || fieldRecord.notes || "Use grower-confirmed boundary before application.",
  };
}

function buildMapPacket(mapData) {
  return [
    `Field map: ${mapData.farmName} / ${mapData.fieldName}`,
    `Acres/Crop: ${mapData.acres.toLocaleString()} acres / ${mapData.crop}`,
    `Address: ${mapData.address || "Not documented"}`,
    `Coordinates: ${mapData.hasCoordinates ? `${mapData.centerLat}, ${mapData.centerLng}` : "Not documented"}`,
    `Boundary: ${mapData.hasBoundary ? "GeoJSON boundary on file" : "Boundary needed before application"}`,
    `Staging: ${mapData.stagingArea}`,
    `Access: ${mapData.accessNotes}`,
    `Hazards: ${mapData.hazards.length ? mapData.hazards.join(", ") : "None documented"}`,
  ].join("\n");
}

function copyMapPacket(mapData) {
  navigator.clipboard?.writeText(buildMapPacket(mapData));
}

function PlaceholderBoundary({ acres }) {
  const wide = acres >= 200;
  const path = wide
    ? "M 8 28 L 82 15 L 94 68 L 27 88 L 12 72 Z"
    : "M 20 18 L 78 24 L 88 76 L 34 86 L 12 56 Z";
  return <path className="ops-map__boundary ops-map__boundary--placeholder" d={path} />;
}

export default function FieldMapPreview({ job, state = {}, farm, field, compact = false, showActions = true }) {
  const mapData = getMapData({ job, state, farm, field });
  const paths = getBoundaryPaths(mapData.geometry);
  const lanes = compact ? [34, 48, 62] : [25, 37, 49, 61, 73];
  const hazards = mapData.hazards.slice(0, compact ? 2 : 4);

  return (
    <div className={`ops-map ${compact ? "ops-map--compact" : ""}`}>
      <div className="ops-map__canvas" aria-label={`Map preview for ${mapData.fieldName}`}>
        <svg viewBox="0 0 100 100" role="img">
          <rect className="ops-map__bg" x="0" y="0" width="100" height="100" rx="6" />
          {[20, 40, 60, 80].map((line) => (
            <g key={line}>
              <line className="ops-map__grid" x1={line} y1="0" x2={line} y2="100" />
              <line className="ops-map__grid" x1="0" y1={line} x2="100" y2={line} />
            </g>
          ))}
          {paths.length ? paths.map((path) => <path className="ops-map__boundary" d={path} key={path} />) : <PlaceholderBoundary acres={mapData.acres} />}
          {lanes.map((y) => <line className="ops-map__lane" key={y} x1="16" x2="84" y1={y} y2={y + 7} />)}
          <circle className="ops-map__pin" cx="50" cy="50" r="3.5" />
          {hazards.map((hazard, index) => (
            <g className="ops-map__hazard" key={hazard} transform={`translate(${24 + index * 18} ${72 - (index % 2) * 34})`}>
              <circle r="4" />
              <text x="0" y="1.8">!</text>
            </g>
          ))}
        </svg>
        <div className={`ops-map__badge ${mapData.hasBoundary ? "ops-map__badge--ready" : "ops-map__badge--needed"}`}>
          {mapData.hasBoundary ? "Boundary saved" : "Boundary needed"}
        </div>
      </div>
      <div className="ops-map__content">
        <div>
          <span className="ops-eyebrow">Field map</span>
          <h3>{mapData.fieldName}</h3>
          <p>{mapData.farmName} | {mapData.acres.toLocaleString()} acres | {mapData.crop}</p>
        </div>
        <div className="ops-map__facts">
          <div><span>Location</span><strong>{mapData.hasCoordinates ? `${mapData.centerLat}, ${mapData.centerLng}` : mapData.address || "Location needed"}</strong></div>
          {!compact ? <div><span>Staging</span><p>{mapData.stagingArea}</p></div> : null}
          {!compact ? <div><span>Access</span><p>{mapData.accessNotes}</p></div> : null}
          <div><span>Hazards</span><p>{mapData.hazards.length ? mapData.hazards.join(", ") : "None documented"}</p></div>
        </div>
        {showActions ? (
          <div className="ops-actions">
            {mapData.mapUrl ? <a className="button button--secondary button--small" href={mapData.mapUrl} target="_blank" rel="noreferrer">Open map</a> : null}
            {mapData.directionsUrl ? <a className="button button--secondary button--small" href={mapData.directionsUrl} target="_blank" rel="noreferrer">Directions</a> : null}
            <button className="button button--secondary button--small" type="button" onClick={() => copyMapPacket(mapData)}>Copy map packet</button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
