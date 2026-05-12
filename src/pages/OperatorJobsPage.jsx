import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import FieldMapPreview from "../components/FieldMapPreview";
import Shell from "../components/Shell";
import { useAuth } from "../context/AuthContext";
import { addFieldOpsJobNote, createFleetLocationCheckin, loadFieldOpsState, updateFieldOpsChecklist, updateFieldOpsJob } from "../lib/fieldOpsApi";
import { usePageMeta } from "../lib/pageMeta";
import {
  FIELD_OPS_JOB_STATUSES,
  enrichOpsJob,
  formatFleetStatus,
  formatFieldOpsStatus,
  getFleetTrackingSummary,
  getJobDispatchPacket,
  getJobReadiness,
  getRelevantSops,
  getVisibleJobsForProfile,
  toggleChecklistItem,
} from "../../shared/fieldOps";
import "../styles/field-ops.css";

function formatDate(value) {
  if (!value) return "Unscheduled";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function StatusBadge({ status }) {
  return <span className={`ops-status ops-status--${status}`}>{formatFieldOpsStatus(status)}</span>;
}

function ReadinessBadge({ readiness }) {
  return <span className={`ops-readiness ops-readiness--${readiness.status}`}>{readiness.status.replaceAll("_", " ")} - {readiness.score}</span>;
}

function getChecklistProgress(jobId, state = {}, checklistType = null) {
  const checklists = (state.jobChecklists || []).filter((checklist) =>
    checklist.job_id === jobId && (!checklistType || checklist.checklist_type === checklistType),
  );
  const items = checklists.flatMap((checklist) => checklist.items_json || []);
  if (!items.length) return { completed: 0, total: 0, percent: 0 };
  const completed = items.filter((item) => item.completed).length;
  return { completed, total: items.length, percent: Math.round((completed / items.length) * 100) };
}

function copyText(value) {
  navigator.clipboard?.writeText(value);
}

function buildDirectionsUrl(packet = {}) {
  const query = packet.farm?.address || packet.farm?.name || packet.field?.name || "";
  return query ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}` : null;
}

function getCurrentPosition() {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy_meters: position.coords.accuracy,
      }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 7000, maximumAge: 60000 },
    );
  });
}

function getJobFallbackLocation(job = {}) {
  const latitude = job.farm?.latitude ?? job.farm_latitude ?? null;
  const longitude = job.farm?.longitude ?? job.farm_longitude ?? null;
  return latitude != null && longitude != null
    ? { latitude: Number(latitude), longitude: Number(longitude), accuracy_meters: null }
    : null;
}

function FleetStatusBadge({ status }) {
  return <span className={`ops-fleet-status ops-fleet-status--${status || "offline"}`}>{formatFleetStatus(status)}</span>;
}

function buildOperatorCompletionReport(job = {}, state = {}) {
  const packet = getJobDispatchPacket(job, state);
  const completion = getChecklistProgress(job.id, state, "completion");
  return [
    `Completion report: ${job.title}`,
    `Grower: ${packet.client.name}`,
    `Farm/Field: ${packet.farm.name} / ${packet.field.name}`,
    `Service: ${packet.operation.service}`,
    `Acres: ${Number(packet.field.acres || 0).toLocaleString()}`,
    `Crop: ${packet.field.crop || "Crop TBD"}`,
    `Product: ${packet.operation.product || "Not documented"}`,
    `Operator: ${packet.operator.name}`,
    `Completion checklist: ${completion.completed}/${completion.total}`,
    `Notes: ${job.notes || "No customer notes captured."}`,
  ].join("\n");
}

function OperatorDispatchPacket({ packet }) {
  return (
    <div className="ops-dispatch-packet">
      <div className="ops-detail-list">
        <div><span>Grower contact</span><strong>{packet.client.phone || packet.client.email || "Contact missing"}</strong></div>
        <div><span>Staging</span><p>{packet.flightPlan.stagingArea}</p></div>
        <div><span>Access</span><p>{packet.flightPlan.accessNotes}</p></div>
        <div><span>Weather</span><strong>{packet.flightPlan.weatherWindow}</strong></div>
        <div><span>Wind limit</span><strong>{packet.flightPlan.windLimitMph ? `${packet.flightPlan.windLimitMph} mph` : "Not set"}</strong></div>
        <div><span>Product / rate</span><p>{[packet.operation.product, packet.operation.applicationRate, packet.operation.sprayVolumeGpa ? `${packet.operation.sprayVolumeGpa} GPA` : ""].filter(Boolean).join(" | ") || "Details pending"}</p></div>
      </div>
      <div className="ops-loadout">
        {packet.loadout.map((item) => <span key={item}>{item}</span>)}
      </div>
    </div>
  );
}

function OperatorJobCard({ job, state }) {
  const readiness = getJobReadiness(job, state);
  const preflight = getChecklistProgress(job.id, state, "pre_flight");
  return (
    <Link className="ops-record-card card" to={`/operator/jobs/${job.id}`}>
      <div className="ops-row" style={{ padding: 0, border: 0, background: "transparent" }}>
        <div>
          <strong>{job.title}</strong>
          <p>{job.client_name || "Client TBD"} | {job.field_name || "Field TBD"}</p>
        </div>
        <StatusBadge status={job.status} />
      </div>
      <ReadinessBadge readiness={readiness} />
      <p className="ops-next-action">Next: {readiness.nextAction.label}</p>
      <div className="ops-checklist-progress">
        <div><span>Pre-flight</span><strong>{preflight.completed}/{preflight.total}</strong></div>
        <div className="ops-progress"><span style={{ width: `${preflight.percent}%` }} /></div>
      </div>
      <div className="ops-record-card__stats">
        <span>{Number(job.acres || 0).toLocaleString()} acres</span>
        <span>{job.crop_type || "Crop TBD"}</span>
        <span>{formatDate(job.scheduled_start)}</span>
      </div>
    </Link>
  );
}

function OperatorJobDetail({ state, job, profile, onState, onMessage }) {
  const [completionNote, setCompletionNote] = useState("");
  const checklists = (state.jobChecklists || []).filter((checklist) => checklist.job_id === job.id);
  const notes = (state.jobNotes || []).filter((note) => note.job_id === job.id);
  const attachments = (state.jobAttachments || []).filter((attachment) => attachment.job_id === job.id);
  const readiness = getJobReadiness(job, state);
  const dispatchPacket = getJobDispatchPacket(job, state);
  const preflightProgress = getChecklistProgress(job.id, state, "pre_flight");
  const completionProgress = getChecklistProgress(job.id, state, "completion");
  const directionsUrl = buildDirectionsUrl(dispatchPacket);
  const canComplete = completionNote.trim() || completionProgress.percent === 100;
  const fleetSummary = useMemo(() => getFleetTrackingSummary(state), [state]);
  const assignedDrone = fleetSummary.trackedAssets.find((asset) => asset.currentJob?.id === job.id)
    || fleetSummary.trackedAssets.find((asset) => asset.assigned_operator_id && asset.assigned_operator_id === job.assigned_operator_id);

  async function runUpdate(action, message) {
    try {
      const result = await action();
      if (result?.state) onState(result.state);
      onMessage(result?.warning || message);
    } catch (error) {
      onMessage(error.message || "Update failed.");
    }
  }

  function updateStatus(status) {
    runUpdate(
      () => updateFieldOpsJob(job.id, { status }, { state, profile }),
      "Job status updated.",
    );
  }

  function markComplete() {
    runUpdate(
      () => updateFieldOpsJob(job.id, { status: "completed" }, { state, profile }),
      "Job marked complete.",
    );
  }

  function checkInDrone(status) {
    runUpdate(async () => {
      const position = await getCurrentPosition();
      const location = position || getJobFallbackLocation(job) || {};
      return createFleetLocationCheckin({
        fleet_asset_id: assignedDrone?.id || null,
        operator_id: job.assigned_operator_id || assignedDrone?.assigned_operator_id || null,
        job_id: job.id,
        status,
        latitude: location.latitude ?? null,
        longitude: location.longitude ?? null,
        accuracy_meters: location.accuracy_meters ?? null,
        note: position ? "Operator GPS check-in" : "Operator check-in using job location fallback",
        source: position ? "operator_gps" : "operator_checkin",
      }, { state, profile });
    }, `Drone check-in saved: ${formatFleetStatus(status)}.`);
  }

  function saveCompletionNote() {
    if (!completionNote.trim()) return;
    runUpdate(
      () => addFieldOpsJobNote(job.id, { note: completionNote, visibility: "internal" }, { state, profile }),
      "Completion note added.",
    );
    setCompletionNote("");
  }

  function saveNoteAndComplete() {
    runUpdate(async () => {
      let workingState = state;
      if (completionNote.trim()) {
        const noteResult = await addFieldOpsJobNote(job.id, { note: completionNote, visibility: "internal" }, { state: workingState, profile });
        workingState = noteResult.state;
      }
      return updateFieldOpsJob(job.id, { status: "completed" }, { state: workingState, profile });
    }, "Completion note saved and job marked complete.");
    setCompletionNote("");
  }

  function toggleItem(checklist, itemId, completed) {
    const updated = toggleChecklistItem(checklist, itemId, completed, { userId: profile?.id });
    runUpdate(
      () => updateFieldOpsChecklist(checklist.id, updated, { state, profile }),
      "Checklist updated.",
    );
  }

  return (
    <div className="ops-stack">
      <header className="ops-header card">
        <div>
          <span className="ops-eyebrow">Operator job</span>
          <h1>{job.title}</h1>
          <p>{job.client_name || "Client TBD"} | {job.farm_name || "Farm TBD"} | {job.field_name || "Field TBD"}</p>
        </div>
        <Link className="button button--secondary" to="/operator/jobs">Back to my jobs</Link>
      </header>

      <section className="ops-operator-launch card">
        <div>
          <span className="ops-eyebrow">Do next</span>
          <h2>{readiness.nextAction.label}</h2>
          <p>{readiness.nextAction.detail}</p>
        </div>
        <div className="ops-operator-launch__facts">
          <div><span>Status</span><StatusBadge status={job.status} /></div>
          <div><span>Pre-flight</span><strong>{preflightProgress.completed}/{preflightProgress.total}</strong></div>
          <div><span>Completion</span><strong>{completionProgress.completed}/{completionProgress.total}</strong></div>
        </div>
        <div className="ops-actions ops-operator-actions">
          {dispatchPacket.client.phone ? <a className="button button--secondary button--small" href={`tel:${dispatchPacket.client.phone}`}>Call grower</a> : null}
          {directionsUrl ? <a className="button button--secondary button--small" href={directionsUrl} target="_blank" rel="noreferrer">Directions</a> : null}
          <button className="button button--secondary button--small" type="button" onClick={() => updateStatus("pre_flight")}>Pre-flight</button>
          <button className="button button--secondary button--small" type="button" onClick={() => updateStatus("in_progress")}>Start job</button>
          <button className="button button--primary button--small" type="button" onClick={saveNoteAndComplete} disabled={!canComplete}>Complete</button>
        </div>
        {!canComplete ? <p className="ops-muted">Add a completion note or finish the completion checklist before closing the job.</p> : null}
      </section>

      <section className="ops-detail-grid">
        <article className="ops-panel card">
          <h2>Drone check-in</h2>
          <div className="ops-drone-checkin">
            <div className="ops-row" style={{ padding: 0, border: 0, background: "transparent" }}>
              <div>
                <strong>{assignedDrone?.name || "No drone linked"}</strong>
                <p>{assignedDrone ? `${assignedDrone.model || "Drone"} | ${assignedDrone.jobTitle}` : "Ask dispatch to link a drone so location updates appear on the fleet map."}</p>
              </div>
              {assignedDrone ? <FleetStatusBadge status={assignedDrone.status} /> : null}
            </div>
            {assignedDrone ? (
              <div className="ops-actions ops-drone-checkin__buttons">
                <button className="button button--secondary button--small" type="button" onClick={() => checkInDrone("in_transit")}>In transit</button>
                <button className="button button--secondary button--small" type="button" onClick={() => checkInDrone("on_site")}>On site</button>
                <button className="button button--primary button--small" type="button" onClick={() => checkInDrone("flying")}>Flying</button>
                <button className="button button--secondary button--small" type="button" onClick={() => checkInDrone("complete")}>Drone done</button>
              </div>
            ) : null}
            <p className="ops-muted">Check-ins use phone GPS when available, then fall back to the job location.</p>
          </div>
        </article>

        <article className="ops-panel card">
          <h2>Launch readiness</h2>
          <div className="ops-readiness-panel">
            <div className="ops-readiness-panel__top">
              <ReadinessBadge readiness={readiness} />
              <strong>{readiness.nextAction.label}</strong>
            </div>
            <div className="ops-list">
              {[...readiness.blockers, ...readiness.warnings].map((item) => (
                <div className={`ops-row ops-row--${item.severity}`} key={`${item.action}-${item.label}`}>
                  <div>
                    <strong>{item.label}</strong>
                    <p>{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="ops-panel card">
          <h2>Field map</h2>
          <FieldMapPreview job={job} state={state} />
        </article>

        <article className="ops-panel card">
          <h2>Dispatch packet</h2>
          <OperatorDispatchPacket packet={dispatchPacket} />
        </article>

        <article className="ops-panel card">
          <h2>Job details</h2>
          <div className="ops-detail-list">
            <div><span>Status</span><StatusBadge status={job.status} /></div>
            <div><span>Scheduled</span><strong>{formatDate(job.scheduled_start)}</strong></div>
            <div><span>Service</span><strong>{job.service_type}</strong></div>
            <div><span>Acres</span><strong>{Number(job.acres || 0).toLocaleString()}</strong></div>
            <div><span>Crop</span><strong>{job.crop_type || "-"}</strong></div>
            <div><span>Product</span><strong>{job.application_product || "-"}</strong></div>
            <div><span>Notes</span><p>{job.notes || "-"}</p></div>
          </div>
          <div className="ops-actions">
            <select value={job.status} onChange={(event) => updateStatus(event.target.value)}>
              {FIELD_OPS_JOB_STATUSES.filter((status) => !["invoice_needed", "closed"].includes(status.id)).map((status) => (
                <option key={status.id} value={status.id}>{status.label}</option>
              ))}
            </select>
            <button className="button button--secondary button--small" type="button" onClick={markComplete} disabled={!canComplete}>Complete</button>
          </div>
        </article>

        <article className="ops-panel card">
          <h2>Field closeout</h2>
          <label className="field">
            <span>Completion notes</span>
            <textarea rows="4" value={completionNote} onChange={(event) => setCompletionNote(event.target.value)} placeholder="Acres completed, skipped areas, product/runout notes, photos needed, grower updates" />
          </label>
          <div className="ops-actions">
            <button className="button button--secondary button--small" type="button" onClick={saveCompletionNote}>Save note</button>
            <button className="button button--primary button--small" type="button" onClick={saveNoteAndComplete}>Save and complete</button>
            <button className="button button--secondary button--small" type="button" onClick={() => copyText(buildOperatorCompletionReport(job, state))}>Copy report</button>
          </div>
        </article>

        <article className="ops-panel card">
          <h2>Checklist</h2>
          <div className="ops-checklist-stack">
            {checklists.map((checklist) => (
              <div className="ops-checklist" key={checklist.id}>
                <strong>{checklist.checklist_type.replaceAll("_", " ")}</strong>
                {(checklist.items_json || []).map((item) => (
                  <label className="ops-checkline" key={item.id}>
                    <input type="checkbox" checked={Boolean(item.completed)} onChange={(event) => toggleItem(checklist, item.id, event.target.checked)} />
                    {item.label}
                  </label>
                ))}
              </div>
            ))}
          </div>
        </article>

        <article className="ops-panel card">
          <h2>Relevant SOPs</h2>
          <div className="ops-list">
            {getRelevantSops(job).map((sop) => <a className="ops-row" href={sop.href} key={sop.href}>{sop.label}</a>)}
          </div>
        </article>

        <article className="ops-panel card">
          <h2>Notes and attachments</h2>
          <div className="ops-list">
            {notes.length ? notes.map((note) => <div className="ops-row" key={note.id}><p>{note.note}</p></div>) : <p className="ops-muted">No job notes yet.</p>}
            {attachments.map((attachment) => <a className="ops-row" key={attachment.id} href={attachment.file_url}>{attachment.file_name}</a>)}
          </div>
        </article>
      </section>
    </div>
  );
}

function OperatorJobsPage() {
  const { profile } = useAuth();
  const { jobId } = useParams();
  const [state, setState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  usePageMeta({
    title: "My Harvest Drone Jobs",
    description: "Assigned field operations jobs for Harvest Drone operators.",
  });

  useEffect(() => {
    let mounted = true;
    async function load() {
      setIsLoading(true);
      const result = await loadFieldOpsState(profile);
      if (mounted) {
        setState(result);
        setMessage(result.warning || "");
        setIsLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [profile]);

  const visibleJobs = useMemo(() => {
    if (!state) return [];
    return getVisibleJobsForProfile(state, profile).map((job) => enrichOpsJob(job, state));
  }, [profile, state]);

  const selectedJob = visibleJobs.find((job) => job.id === jobId);
  const today = new Date().toDateString();
  const todayJobs = visibleJobs
    .filter((job) => job.scheduled_start && new Date(job.scheduled_start).toDateString() === today)
    .sort((a, b) => new Date(a.scheduled_start) - new Date(b.scheduled_start));
  const upcomingJobs = visibleJobs
    .filter((job) => job.scheduled_start && new Date(job.scheduled_start).getTime() > Date.now() && !["completed", "invoice_needed", "closed"].includes(job.status))
    .sort((a, b) => new Date(a.scheduled_start) - new Date(b.scheduled_start));
  const completedJobs = visibleJobs.filter((job) => ["completed", "invoice_needed", "closed"].includes(job.status));

  if (isLoading) {
    return (
      <Shell compact>
        <section className="field-ops"><div className="card ops-loading">Loading assigned jobs...</div></section>
      </Shell>
    );
  }

  return (
    <Shell compact>
      <section className="field-ops">
        {message ? <div className="ops-message card">{message}</div> : null}
        {selectedJob ? (
          <OperatorJobDetail state={state} job={selectedJob} profile={profile} onState={setState} onMessage={setMessage} />
        ) : (
          <div className="ops-stack">
            <header className="ops-header card">
              <div>
                <span className="ops-eyebrow">Operator workspace</span>
                <h1>My assigned jobs</h1>
                <p>View job details, finish checklists, update status, and mark field work complete.</p>
              </div>
            </header>
            <section className="ops-stat-grid">
              <article className="ops-stat card"><span>Today</span><strong>{todayJobs.length}</strong></article>
              <article className="ops-stat card"><span>Upcoming</span><strong>{upcomingJobs.length}</strong></article>
              <article className="ops-stat card"><span>Completed</span><strong>{completedJobs.length}</strong></article>
            </section>
            <section className="ops-detail-grid">
              <article className="ops-panel card">
                <h2>Today</h2>
                <div className="ops-list">{todayJobs.length ? todayJobs.map((job) => <OperatorJobCard key={job.id} job={job} state={state} />) : <p className="ops-muted">No assigned jobs today.</p>}</div>
              </article>
              <article className="ops-panel card">
                <h2>Upcoming</h2>
                <div className="ops-list">{upcomingJobs.length ? upcomingJobs.map((job) => <OperatorJobCard key={job.id} job={job} state={state} />) : <p className="ops-muted">No upcoming assigned jobs.</p>}</div>
              </article>
              <article className="ops-panel card">
                <h2>Completed</h2>
                <div className="ops-list">{completedJobs.length ? completedJobs.map((job) => <OperatorJobCard key={job.id} job={job} state={state} />) : <p className="ops-muted">No completed jobs yet.</p>}</div>
              </article>
            </section>
          </div>
        )}
      </section>
    </Shell>
  );
}

export default OperatorJobsPage;
