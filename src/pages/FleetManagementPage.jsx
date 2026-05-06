import { useEffect, useMemo, useState } from "react";
import Shell from "../components/Shell";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

const DEMO_DRONES = [
  {
    id: "demo-alpha",
    serial_number: "HY-AG272-0041",
    model: "Hylio AG-272",
    nickname: "Alpha",
    assigned_pilot_name: "Jody Bjornson",
    status: "available",
    location_description: "Marshall, MN - Main Shop",
    total_flight_hours: 127.5,
    hours_since_maintenance: 22.5,
    maintenance_due_hours: 50,
    last_maintenance_date: "2026-03-15",
    faa_registration: "FA3XXHD041",
  },
  {
    id: "demo-bravo",
    serial_number: "HY-AG272-0042",
    model: "Hylio AG-272",
    nickname: "Bravo",
    assigned_pilot_name: "Jody Bjornson",
    status: "available",
    location_description: "Marshall, MN - Main Shop",
    total_flight_hours: 98.3,
    hours_since_maintenance: 48.3,
    maintenance_due_hours: 50,
    last_maintenance_date: "2026-02-20",
    faa_registration: "FA3XXHD042",
  },
  {
    id: "demo-charlie",
    serial_number: "HY-AG272-0043",
    model: "Hylio AG-272",
    nickname: "Charlie",
    assigned_pilot_name: null,
    status: "maintenance",
    location_description: "HD Shop - Waconia",
    total_flight_hours: 156.7,
    hours_since_maintenance: 6.7,
    maintenance_due_hours: 50,
    last_maintenance_date: "2026-04-01",
    faa_registration: "FA3XXHD043",
  },
  {
    id: "demo-delta",
    serial_number: "HY-AG272-0044",
    model: "Hylio AG-272",
    nickname: "Delta",
    assigned_pilot_name: null,
    status: "available",
    location_description: "Marshall, MN - Training",
    total_flight_hours: 45.2,
    hours_since_maintenance: 45.2,
    maintenance_due_hours: 50,
    last_maintenance_date: "2026-01-10",
    faa_registration: "FA3XXHD044",
  },
];

const DEMO_MAINTENANCE = [
  { id: "m1", drone_id: "demo-alpha", maintenance_type: "scheduled", description: "50-hour inspection: prop balance, motor temps, battery health check", performed_by: "Jody Bjornson", hours_at_service: 105, cost: 350, completed_at: "2026-03-15T12:00:00Z" },
  { id: "m2", drone_id: "demo-bravo", maintenance_type: "scheduled", description: "50-hour inspection: full teardown and reassembly", performed_by: "Jody Bjornson", hours_at_service: 50, cost: 450, completed_at: "2026-02-20T12:00:00Z" },
  { id: "m3", drone_id: "demo-charlie", maintenance_type: "repair", description: "Pump seal replacement - spray nozzle 3 leaking under pressure", performed_by: "Jody Bjornson", hours_at_service: 150, cost: 180, completed_at: "2026-04-01T12:00:00Z" },
];

const css = `
.fleet{--bg:#0C0F0A;--surface:#151A12;--card:#1A2015;--border:rgba(255,255,255,0.06);--text:#E8E6E1;--text-muted:#727966;--accent:#A3D977;font-family:'Instrument Sans',system-ui,sans-serif;color:var(--text);display:grid;gap:18px}
.fleet h1,.fleet h2,.fleet h3{font-family:'DM Serif Display',Georgia,serif;font-weight:400;line-height:1.08;margin:0;color:#fff;letter-spacing:0}
.fleet p{margin:0;color:var(--text-muted)}
.fleet__hero,.fleet__panel,.fleet__kpi,.fleet__drone{border:1px solid var(--border);border-radius:8px;background:var(--surface)}
.fleet__hero{display:flex;flex-direction:column;gap:16px;padding:24px}
.fleet__hero h1{font-size:clamp(2.3rem,7vw,4.4rem)}
.fleet__hero-actions{display:flex;flex-wrap:wrap;gap:10px}
.fleet__kpis,.fleet__grid,.fleet__split,.fleet__form-grid{display:grid;gap:12px}
.fleet__kpi{padding:18px;background:var(--card)}
.fleet__kpi span,.fleet__label{display:block;color:var(--text-muted);font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase}
.fleet__kpi strong{display:block;margin-top:8px;font-size:1.8rem;line-height:1;color:#fff}
.fleet__grid{grid-template-columns:1fr}
.fleet__drone{position:relative;display:grid;gap:14px;padding:18px;text-align:left;color:var(--text);border-left:4px solid var(--status-color,var(--accent));cursor:pointer}
.fleet__drone:hover{background:#1F261A}
.fleet__drone-top{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
.fleet__drone h3{font-size:1.45rem}
.fleet__serial{color:#fff;font-weight:700}
.fleet__meta{display:grid;gap:8px}
.fleet__meta-row{display:flex;justify-content:space-between;gap:12px;border-top:1px solid var(--border);padding-top:8px}
.fleet__pill{display:inline-flex;align-items:center;justify-content:center;border:1px solid color-mix(in srgb,var(--status-color) 40%,transparent);border-radius:999px;background:color-mix(in srgb,var(--status-color) 16%,transparent);color:#fff;padding:5px 9px;font-size:12px;font-weight:800;text-transform:capitalize}
.fleet__progress{display:grid;gap:7px}
.fleet__progress-track{height:10px;border-radius:999px;background:rgba(255,255,255,.06);border:1px solid var(--border);overflow:hidden}
.fleet__progress-track span{display:block;height:100%;width:var(--fill);background:var(--bar,#A3D977)}
.fleet__panel{padding:20px;display:grid;gap:14px}
.fleet__alerts{display:grid;gap:10px}
.fleet__alert{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:12px;border-radius:8px;border:1px solid rgba(251,191,36,.22);background:rgba(251,191,36,.08)}
.fleet__alert.is-overdue{border-color:rgba(248,113,113,.34);background:rgba(248,113,113,.1)}
.fleet__empty{padding:14px;border:1px dashed var(--border);border-radius:8px;color:var(--text-muted)}
.fleet__details{display:grid;gap:12px;margin-top:4px;padding-top:12px;border-top:1px solid var(--border)}
.fleet__log{padding:12px;border-radius:8px;background:rgba(255,255,255,.035);border:1px solid var(--border)}
.fleet__log strong{display:block;color:#fff}
.fleet__modal{position:fixed;inset:0;z-index:40;display:grid;place-items:center;padding:18px;background:rgba(2,5,4,.72)}
.fleet__modal-card{width:min(620px,100%);max-height:90vh;overflow:auto;border:1px solid var(--border);border-radius:8px;background:#151A12;padding:20px;display:grid;gap:14px}
.fleet__form-grid{grid-template-columns:1fr}
.fleet__message{color:#f2efcf}
@media(min-width:760px){.fleet__hero{flex-direction:row;align-items:end;justify-content:space-between}.fleet__kpis{grid-template-columns:repeat(4,1fr)}.fleet__grid{grid-template-columns:repeat(2,minmax(0,1fr))}.fleet__form-grid{grid-template-columns:repeat(2,1fr)}}
`;

const statusColors = {
  available: "#A3D977",
  in_flight: "#60A5FA",
  maintenance: "#FBBF24",
  grounded: "#F87171",
  retired: "#727966",
};

function formatDate(value) {
  if (!value) return "-";
  const [dateOnly] = String(value).split("T");
  const [year, month, day] = dateOnly.split("-").map(Number);
  const date = year && month && day ? new Date(year, month - 1, day) : new Date(value);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function maintenanceColor(percent) {
  if (percent >= 100) return "#F87171";
  if (percent >= 80) return "#FBBF24";
  return "#A3D977";
}

function FleetManagementPage() {
  const { dealerId, networkId, isDemo } = useAuth();
  const [drones, setDrones] = useState([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [flightLogs, setFlightLogs] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [modal, setModal] = useState(null);
  const [message, setMessage] = useState("");
  const [addForm, setAddForm] = useState({
    serial_number: "",
    model: "Hylio AG-272",
    nickname: "",
    assigned_pilot_name: "",
    location_description: "",
    faa_registration: "",
  });
  const [maintenanceForm, setMaintenanceForm] = useState({
    maintenance_type: "scheduled",
    description: "",
    performed_by: "Jody Bjornson",
    parts_used: "",
    cost: "",
  });

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      const [{ data: droneRows, error: droneError }, { data: maintenanceRows }, { data: flightRows }] = await Promise.all([
        supabase.from("fleet_drones").select("*").order("nickname"),
        supabase.from("fleet_maintenance_logs").select("*").order("completed_at", { ascending: false }).limit(50),
        supabase.from("fleet_flight_logs").select("*").order("completed_at", { ascending: false }).limit(50),
      ]);

      if (!isMounted) return;
      const fallback = isDemo && (!droneRows?.length || droneError);
      setDrones(fallback ? DEMO_DRONES : droneRows || []);
      setMaintenanceLogs(fallback ? DEMO_MAINTENANCE : maintenanceRows || []);
      setFlightLogs(fallback ? [] : flightRows || []);
      if (droneError && !fallback) setMessage(droneError.message);
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [isDemo]);

  const kpis = useMemo(() => {
    const totalHours = drones.reduce((sum, drone) => sum + Number(drone.total_flight_hours || 0), 0);
    const alerts = drones.filter((drone) => Number(drone.hours_since_maintenance || 0) > Number(drone.maintenance_due_hours || 50) - 5);
    return {
      total: drones.length,
      available: drones.filter((drone) => drone.status === "available").length,
      totalHours,
      alerts: alerts.length,
    };
  }, [drones]);

  const alerts = useMemo(() => (
    drones
      .filter((drone) => Number(drone.hours_since_maintenance || 0) > Number(drone.maintenance_due_hours || 50) - 5)
      .sort((a, b) => (Number(b.hours_since_maintenance || 0) - Number(b.maintenance_due_hours || 50)) - (Number(a.hours_since_maintenance || 0) - Number(a.maintenance_due_hours || 50)))
  ), [drones]);

  async function addDrone(event) {
    event.preventDefault();
    if (!addForm.serial_number.trim()) return;

    const record = {
      ...addForm,
      dealer_id: dealerId,
      network_id: networkId,
      assigned_pilot_name: addForm.assigned_pilot_name || null,
      status: "available",
    };
    const { data, error } = await supabase.from("fleet_drones").insert(record).select("*").single();
    if (error) {
      setMessage(error.message);
      return;
    }
    setDrones((current) => [...current, data].sort((a, b) => String(a.nickname || "").localeCompare(String(b.nickname || ""))));
    setAddForm({ serial_number: "", model: "Hylio AG-272", nickname: "", assigned_pilot_name: "", location_description: "", faa_registration: "" });
    setModal(null);
    setMessage("Drone added to fleet.");
  }

  async function logMaintenance(event) {
    event.preventDefault();
    if (!modal?.drone || !maintenanceForm.description.trim()) return;

    const drone = modal.drone;
    const logRecord = {
      drone_id: drone.id,
      maintenance_type: maintenanceForm.maintenance_type,
      description: maintenanceForm.description,
      performed_by: maintenanceForm.performed_by || null,
      parts_used: maintenanceForm.parts_used || null,
      cost: Number(maintenanceForm.cost || 0),
      hours_at_service: Number(drone.total_flight_hours || 0),
    };

    const { data, error } = await supabase.from("fleet_maintenance_logs").insert(logRecord).select("*").single();
    if (error) {
      setMessage(error.message);
      return;
    }

    const updates = { hours_since_maintenance: 0, last_maintenance_date: new Date().toISOString().slice(0, 10), status: drone.status === "maintenance" ? "available" : drone.status };
    const { data: updatedDrone, error: updateError } = await supabase.from("fleet_drones").update(updates).eq("id", drone.id).select("*").single();
    if (updateError) {
      setMessage(updateError.message);
      return;
    }

    setMaintenanceLogs((current) => [data, ...current]);
    setDrones((current) => current.map((item) => (item.id === drone.id ? updatedDrone : item)));
    setMaintenanceForm({ maintenance_type: "scheduled", description: "", performed_by: "Jody Bjornson", parts_used: "", cost: "" });
    setModal(null);
    setMessage("Maintenance logged and hours reset.");
  }

  return (
    <Shell compact>
      <style>{css}</style>
      <section className="fleet">
        <header className="fleet__hero">
          <div>
            <span className="eyebrow">Drone operations</span>
            <h1>Fleet management</h1>
            <p>Track every drone across the operation. Hours, maintenance, assignments, and compliance.</p>
          </div>
          <div className="fleet__hero-actions">
            <button className="button button--primary button--small" type="button" onClick={() => setModal({ type: "add" })}>Add drone</button>
          </div>
        </header>

        <div className="fleet__kpis">
          <div className="fleet__kpi"><span>Total drones</span><strong>{kpis.total}</strong></div>
          <div className="fleet__kpi"><span>Available now</span><strong>{kpis.available}</strong></div>
          <div className="fleet__kpi"><span>Total flight hours</span><strong>{kpis.totalHours.toFixed(1)}</strong></div>
          <div className="fleet__kpi"><span>Maintenance alerts</span><strong>{kpis.alerts}</strong></div>
        </div>

        {message ? <p className="fleet__message">{message}</p> : null}

        <section className="fleet__grid">
          {drones.map((drone) => {
            const due = Number(drone.maintenance_due_hours || 50);
            const since = Number(drone.hours_since_maintenance || 0);
            const percent = Math.min(120, due ? (since / due) * 100 : 0);
            const droneLogs = maintenanceLogs.filter((log) => log.drone_id === drone.id);
            const droneFlights = flightLogs.filter((log) => log.drone_id === drone.id);
            const expanded = expandedId === drone.id;

            return (
              <article className="fleet__drone" key={drone.id} style={{ "--status-color": statusColors[drone.status] || "#A3D977" }} onClick={() => setExpandedId(expanded ? null : drone.id)}>
                <div className="fleet__drone-top">
                  <div>
                    <span className="fleet__serial">{drone.serial_number}</span>
                    <h3>{drone.nickname || "Unnamed drone"}</h3>
                    <p>{drone.model || "Hylio AG-272"}</p>
                  </div>
                  <span className="fleet__pill">{String(drone.status || "available").replaceAll("_", " ")}</span>
                </div>

                <div className="fleet__meta">
                  <div className="fleet__meta-row"><span>Pilot</span><strong>{drone.assigned_pilot_name || "Unassigned"}</strong></div>
                  <div className="fleet__meta-row"><span>Location</span><strong>{drone.location_description || "-"}</strong></div>
                  <div className="fleet__meta-row"><span>Flight hours</span><strong>{Number(drone.total_flight_hours || 0).toFixed(1)} hrs</strong></div>
                </div>

                <div className="fleet__progress">
                  <div className="fleet__meta-row"><span>Maintenance</span><strong>{since.toFixed(1)} / {due.toFixed(0)} hrs</strong></div>
                  <div className="fleet__progress-track"><span style={{ "--fill": `${Math.min(percent, 100)}%`, "--bar": maintenanceColor(percent) }} /></div>
                </div>

                <div className="fleet__meta">
                  <div className="fleet__meta-row"><span>Last maintenance</span><strong>{formatDate(drone.last_maintenance_date)}</strong></div>
                  <div className="fleet__meta-row"><span>FAA registration</span><strong>{drone.faa_registration || "-"}</strong></div>
                </div>

                {expanded ? (
                  <div className="fleet__details">
                    <button className="button button--secondary button--small" type="button" onClick={(event) => { event.stopPropagation(); setModal({ type: "maintenance", drone }); }}>
                      Log maintenance
                    </button>
                    <div>
                      <span className="fleet__label">Maintenance log</span>
                      {droneLogs.length ? droneLogs.slice(0, 4).map((log) => (
                        <div className="fleet__log" key={log.id}>
                          <strong>{log.maintenance_type} | {formatDate(log.completed_at)}</strong>
                          <p>{log.description}</p>
                        </div>
                      )) : <p className="fleet__empty">No maintenance history yet.</p>}
                    </div>
                    <div>
                      <span className="fleet__label">Recent flights</span>
                      {droneFlights.length ? droneFlights.slice(0, 3).map((log) => (
                        <div className="fleet__log" key={log.id}>
                          <strong>{log.field_name || "Flight"} | {Number(log.acres_sprayed || 0).toFixed(0)} acres</strong>
                          <p>{log.pilot_name} | {formatDate(log.completed_at)}</p>
                        </div>
                      )) : <p className="fleet__empty">No flight logs yet.</p>}
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </section>

        <section className="fleet__panel">
          <div>
            <span className="eyebrow">Maintenance alerts</span>
            <h2>Service windows coming due</h2>
          </div>
          <div className="fleet__alerts">
            {alerts.length ? alerts.map((drone) => {
              const dueIn = Number(drone.maintenance_due_hours || 50) - Number(drone.hours_since_maintenance || 0);
              return (
                <div className={`fleet__alert ${dueIn <= 0 ? "is-overdue" : ""}`} key={drone.id}>
                  <div>
                    <strong>{drone.nickname || drone.serial_number}</strong>
                    <p>{Number(drone.hours_since_maintenance || 0).toFixed(1)} hours since service. Due at {Number(drone.maintenance_due_hours || 50).toFixed(0)}.</p>
                  </div>
                  <span className="fleet__pill" style={{ "--status-color": dueIn <= 0 ? "#F87171" : "#FBBF24" }}>{dueIn <= 0 ? "OVERDUE" : `Due in ${dueIn.toFixed(1)} hrs`}</span>
                </div>
              );
            }) : <p className="fleet__empty">No drones are within five hours of maintenance.</p>}
          </div>
        </section>

        {modal?.type === "add" ? (
          <div className="fleet__modal" role="dialog" aria-modal="true">
            <form className="fleet__modal-card" onSubmit={addDrone}>
              <h2>Add drone</h2>
              <div className="fleet__form-grid">
                {[
                  ["serial_number", "Serial number"],
                  ["model", "Model"],
                  ["nickname", "Nickname"],
                  ["assigned_pilot_name", "Assigned pilot"],
                  ["location_description", "Location"],
                  ["faa_registration", "FAA registration"],
                ].map(([key, label]) => (
                  <label className="field" key={key}>
                    <span>{label}</span>
                    <input value={addForm[key]} onChange={(event) => setAddForm((current) => ({ ...current, [key]: event.target.value }))} required={key === "serial_number"} />
                  </label>
                ))}
              </div>
              <div className="inline-actions">
                <button className="button button--primary button--small" type="submit">Save drone</button>
                <button className="button button--secondary button--small" type="button" onClick={() => setModal(null)}>Cancel</button>
              </div>
            </form>
          </div>
        ) : null}

        {modal?.type === "maintenance" ? (
          <div className="fleet__modal" role="dialog" aria-modal="true">
            <form className="fleet__modal-card" onSubmit={logMaintenance}>
              <h2>Log maintenance for {modal.drone.nickname || modal.drone.serial_number}</h2>
              <div className="fleet__form-grid">
                <label className="field">
                  <span>Maintenance type</span>
                  <select value={maintenanceForm.maintenance_type} onChange={(event) => setMaintenanceForm((current) => ({ ...current, maintenance_type: event.target.value }))}>
                    <option value="scheduled">Scheduled</option>
                    <option value="repair">Repair</option>
                    <option value="inspection">Inspection</option>
                    <option value="firmware">Firmware</option>
                    <option value="calibration">Calibration</option>
                  </select>
                </label>
                <label className="field">
                  <span>Performed by</span>
                  <input value={maintenanceForm.performed_by} onChange={(event) => setMaintenanceForm((current) => ({ ...current, performed_by: event.target.value }))} />
                </label>
                <label className="field field-span-2">
                  <span>Description</span>
                  <textarea rows="4" value={maintenanceForm.description} onChange={(event) => setMaintenanceForm((current) => ({ ...current, description: event.target.value }))} required />
                </label>
                <label className="field">
                  <span>Parts used</span>
                  <input value={maintenanceForm.parts_used} onChange={(event) => setMaintenanceForm((current) => ({ ...current, parts_used: event.target.value }))} />
                </label>
                <label className="field">
                  <span>Cost</span>
                  <input inputMode="decimal" value={maintenanceForm.cost} onChange={(event) => setMaintenanceForm((current) => ({ ...current, cost: event.target.value }))} />
                </label>
              </div>
              <div className="inline-actions">
                <button className="button button--primary button--small" type="submit">Save maintenance</button>
                <button className="button button--secondary button--small" type="button" onClick={() => setModal(null)}>Cancel</button>
              </div>
            </form>
          </div>
        ) : null}
      </section>
    </Shell>
  );
}

export default FleetManagementPage;
