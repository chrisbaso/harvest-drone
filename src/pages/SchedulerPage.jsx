import { useEffect, useMemo, useState } from "react";
import Shell from "../components/Shell";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

const DEMO_FIELDS = [
  { id: "field-north", name: "North 40", location_description: "Section 12, Lyon County", total_acres: 320, crop_type: "Potatoes", applications_per_season: 12 },
  { id: "field-south", name: "South 80", location_description: "Section 24, Lyon County", total_acres: 640, crop_type: "Potatoes", applications_per_season: 10 },
  { id: "field-west", name: "West Quarter", location_description: "Section 8, Redwood County", total_acres: 160, crop_type: "Potatoes", applications_per_season: 12 },
  { id: "field-river", name: "River Bottom", location_description: "Section 31, Yellow Medicine County", total_acres: 480, crop_type: "Potatoes", applications_per_season: 8 },
  { id: "field-training", name: "Training Field", location_description: "Marshall Airport Ag Plot", total_acres: 40, crop_type: "Soybeans", applications_per_season: 3 },
];

const now = new Date("2026-05-05T12:00:00");
const addDays = (days) => new Date(now.getTime() + days * 86400000).toISOString();

const DEMO_SCHEDULE = [
  { id: "s1", field_name: "North 40", field_location: "Lyon County, MN", field_acres: 320, crop_type: "Potatoes", product_to_apply: "Fungicide - Chlorothalonil", application_number: 7, total_applications: 12, window_opens: addDays(1), window_closes: addDays(3), priority: "urgent", status: "scheduled" },
  { id: "s2", field_name: "South 80", field_location: "Lyon County, MN", field_acres: 640, crop_type: "Potatoes", product_to_apply: "Insecticide - Imidacloprid", application_number: 5, total_applications: 10, window_opens: addDays(2), window_closes: addDays(5), priority: "normal", status: "scheduled" },
  { id: "s3", field_name: "West Quarter", field_location: "Redwood County, MN", field_acres: 160, crop_type: "Potatoes", product_to_apply: "Fungicide - Mancozeb", application_number: 8, total_applications: 12, window_opens: addDays(0), window_closes: addDays(2), priority: "urgent", status: "assigned", assigned_pilot_name: "Jody Bjornson", assigned_drone_id: "demo-alpha", assigned_drone_serial: "HY-AG272-0041" },
  { id: "s4", field_name: "North 40", field_location: "Lyon County, MN", field_acres: 320, crop_type: "Potatoes", product_to_apply: "Fungicide - Chlorothalonil", application_number: 6, total_applications: 12, window_opens: addDays(-5), window_closes: addDays(-3), priority: "normal", status: "completed", assigned_pilot_name: "Jody Bjornson" },
  { id: "s5", field_name: "South 80", field_location: "Lyon County, MN", field_acres: 640, crop_type: "Potatoes", product_to_apply: "Insecticide - Imidacloprid", application_number: 4, total_applications: 10, window_opens: addDays(-8), window_closes: addDays(-6), priority: "normal", status: "completed", assigned_pilot_name: "Jody Bjornson" },
  { id: "s6", field_name: "River Bottom", field_location: "Yellow Medicine County, MN", field_acres: 480, crop_type: "Potatoes", product_to_apply: "Desiccant - Reglone", application_number: 1, total_applications: 1, window_opens: addDays(21), window_closes: addDays(25), priority: "flexible", status: "scheduled" },
  { id: "s7", field_name: "Training Field", field_location: "Marshall, MN", field_acres: 40, crop_type: "Soybeans", product_to_apply: "SOURCE", application_number: 1, total_applications: 2, window_opens: addDays(7), window_closes: addDays(10), priority: "normal", status: "scheduled" },
];

const DEMO_DRONES = [
  { id: "demo-alpha", serial_number: "HY-AG272-0041", nickname: "Alpha", status: "available", assigned_pilot_name: "Jody Bjornson" },
  { id: "demo-bravo", serial_number: "HY-AG272-0042", nickname: "Bravo", status: "available", assigned_pilot_name: "Jody Bjornson" },
  { id: "demo-delta", serial_number: "HY-AG272-0044", nickname: "Delta", status: "available", assigned_pilot_name: "" },
];

const PILOTS = ["Jody Bjornson", "Ada Miller", "Noah Petersen", "Backup operator"];

const css = `
.scheduler{--bg:#0C0F0A;--surface:#151A12;--card:#1A2015;--border:rgba(255,255,255,0.06);--text:#E8E6E1;--text-muted:#727966;--accent:#A3D977;font-family:'Instrument Sans',system-ui,sans-serif;color:var(--text);display:grid;gap:18px}
.scheduler h1,.scheduler h2,.scheduler h3{font-family:'DM Serif Display',Georgia,serif;font-weight:400;line-height:1.08;margin:0;color:#fff;letter-spacing:0}
.scheduler p{margin:0;color:var(--text-muted)}
.scheduler__hero,.scheduler__panel,.scheduler__kpi,.scheduler__col,.scheduler__card{border:1px solid var(--border);border-radius:8px;background:var(--surface)}
.scheduler__hero{padding:24px;display:grid;gap:10px}
.scheduler__hero h1{font-size:clamp(2.3rem,7vw,4.4rem)}
.scheduler__kpis,.scheduler__board,.scheduler__bottom,.scheduler__timeline,.scheduler__progress-list{display:grid;gap:12px}
.scheduler__kpi{padding:18px;background:var(--card)}
.scheduler__kpi span,.scheduler__label{display:block;color:var(--text-muted);font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}
.scheduler__kpi strong{display:block;margin-top:8px;font-size:1.7rem;line-height:1;color:#fff}
.scheduler__board{grid-template-columns:1fr}
.scheduler__col{display:flex;flex-direction:column;min-height:260px;overflow:hidden}
.scheduler__col-header{display:flex;justify-content:space-between;gap:10px;padding:16px;border-bottom:1px solid var(--border)}
.scheduler__col-title{display:flex;align-items:center;gap:8px;font-weight:800}
.scheduler__dot{width:8px;height:8px;border-radius:50%;background:var(--dot)}
.scheduler__stack{display:grid;gap:8px;padding:10px;align-content:start}
.scheduler__card{display:grid;gap:9px;padding:13px;background:var(--card);color:var(--text);text-align:left;cursor:pointer}
.scheduler__card:hover{background:#1F261A}
.scheduler__card-top{display:flex;justify-content:space-between;gap:10px}
.scheduler__card strong{color:#fff}
.scheduler__meta{display:flex;flex-wrap:wrap;gap:8px;color:var(--text-muted);font-size:12px}
.scheduler__app-progress{height:7px;border:1px solid var(--border);border-radius:999px;background:rgba(255,255,255,.06);overflow:hidden}
.scheduler__app-progress span{display:block;height:100%;background:var(--accent);width:var(--fill)}
.scheduler__badge{display:inline-flex;align-items:center;border-radius:999px;border:1px solid rgba(255,255,255,.1);padding:4px 8px;font-size:11px;font-weight:800;text-transform:uppercase}
.scheduler__badge--urgent{color:#ffdcdc;background:rgba(248,113,113,.14);border-color:rgba(248,113,113,.28)}
.scheduler__badge--normal{color:#e8e6e1;background:rgba(255,255,255,.06)}
.scheduler__badge--flexible{color:#dcecff;background:rgba(96,165,250,.14);border-color:rgba(96,165,250,.28)}
.scheduler__window.is-tight{color:#F87171;font-weight:800}
.scheduler__panel{padding:20px;display:grid;gap:14px}
.scheduler__timeline-row,.scheduler__field-row{display:grid;gap:8px;padding:12px;border:1px solid var(--border);border-radius:8px;background:rgba(255,255,255,.035)}
.scheduler__field-top,.scheduler__timeline-top{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
.scheduler__empty{padding:14px;border:1px dashed var(--border);border-radius:8px;color:var(--text-muted)}
.scheduler__modal{position:fixed;inset:0;z-index:40;display:grid;place-items:center;padding:18px;background:rgba(2,5,4,.72)}
.scheduler__modal-card{width:min(680px,100%);max-height:90vh;overflow:auto;border:1px solid var(--border);border-radius:8px;background:#151A12;padding:20px;display:grid;gap:14px}
.scheduler__form-grid{display:grid;gap:12px}
.scheduler__message{color:#f2efcf}
@media(min-width:760px){.scheduler__kpis{grid-template-columns:repeat(4,1fr)}.scheduler__board{grid-template-columns:repeat(2,1fr)}.scheduler__bottom{grid-template-columns:1.1fr .9fr}.scheduler__form-grid{grid-template-columns:repeat(2,1fr)}}
@media(min-width:1120px){.scheduler__board{grid-template-columns:repeat(4,1fr)}}
`;

const columns = [
  { id: "scheduled", label: "Scheduled", color: "#727966" },
  { id: "assigned", label: "Assigned", color: "#60A5FA" },
  { id: "in_progress", label: "In Progress", color: "#FBBF24" },
  { id: "completed", label: "Completed", color: "#A3D977" },
];

function formatWindow(start, end) {
  const options = { month: "short", day: "numeric" };
  if (!start || !end) return "-";
  return `${new Date(start).toLocaleDateString(undefined, options)} - ${new Date(end).toLocaleDateString(undefined, options)}`;
}

function isClosingSoon(end) {
  if (!end) return false;
  const delta = new Date(end).getTime() - Date.now();
  return delta > 0 && delta <= 86400000;
}

function SchedulerPage() {
  const { isDemo } = useAuth();
  const [schedule, setSchedule] = useState([]);
  const [fields, setFields] = useState([]);
  const [drones, setDrones] = useState([]);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");
  const [assignForm, setAssignForm] = useState({ droneId: "", pilot: "Jody Bjornson", actualAcres: "" });

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      const [{ data: scheduleRows, error }, { data: fieldRows }, { data: droneRows }] = await Promise.all([
        supabase.from("application_schedule").select("*").order("window_opens"),
        supabase.from("application_fields").select("*").order("name"),
        supabase.from("fleet_drones").select("id, serial_number, nickname, status, assigned_pilot_name").order("nickname"),
      ]);

      if (!isMounted) return;
      const fallback = isDemo && (!scheduleRows?.length || error);
      setSchedule(fallback ? DEMO_SCHEDULE : scheduleRows || []);
      setFields(fallback ? DEMO_FIELDS : fieldRows || []);
      setDrones(fallback ? DEMO_DRONES : droneRows || []);
      if (error && !fallback) setMessage(error.message);
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [isDemo]);

  const kpis = useMemo(() => {
    const totalAcres = fields.reduce((sum, field) => sum + Number(field.total_acres || 0), 0);
    const weekEnd = Date.now() + 7 * 86400000;
    const applicationsThisWeek = schedule.filter((item) => {
      const opens = new Date(item.window_opens).getTime();
      return opens >= Date.now() && opens <= weekEnd;
    }).length;
    const completed = schedule.filter((item) => item.status === "completed").length;
    const completionRate = schedule.length ? Math.round((completed / schedule.length) * 100) : 0;
    return { fields: fields.length, totalAcres, applicationsThisWeek, completionRate };
  }, [fields, schedule]);

  const availableDrones = drones.filter((drone) => drone.status === "available");

  function openCard(item) {
    setSelected(item);
    setAssignForm({
      droneId: availableDrones[0]?.id || "",
      pilot: item.assigned_pilot_name || availableDrones[0]?.assigned_pilot_name || "Jody Bjornson",
      actualAcres: item.field_acres || "",
    });
  }

  async function updateSchedule(id, updates) {
    if (String(id).startsWith("s")) {
      setSchedule((current) => current.map((item) => (item.id === id ? { ...item, ...updates } : item)));
      setMessage("Demo schedule updated.");
      return { ok: true };
    }

    const { data, error } = await supabase.from("application_schedule").update(updates).eq("id", id).select("*").single();
    if (error) {
      setMessage(error.message);
      return { ok: false };
    }
    setSchedule((current) => current.map((item) => (item.id === id ? data : item)));
    return { ok: true };
  }

  async function assignApplication(event) {
    event.preventDefault();
    if (!selected || !assignForm.droneId) return;
    const drone = drones.find((item) => item.id === assignForm.droneId);
    const result = await updateSchedule(selected.id, {
      status: "assigned",
      assigned_drone_id: drone?.id,
      assigned_drone_serial: drone?.serial_number,
      assigned_pilot_name: assignForm.pilot,
    });
    if (result.ok) {
      setSelected(null);
      setMessage("Application assigned.");
    }
  }

  async function markComplete(event) {
    event.preventDefault();
    if (!selected) return;
    const result = await updateSchedule(selected.id, {
      status: "completed",
      completed_at: new Date().toISOString(),
      actual_acres_sprayed: Number(assignForm.actualAcres || selected.field_acres || 0),
    });
    if (result.ok) {
      setSelected(null);
      setMessage("Application marked complete.");
    }
  }

  const upcoming = schedule
    .filter((item) => item.window_opens && new Date(item.window_opens).getTime() <= Date.now() + 21 * 86400000 && item.status !== "completed")
    .sort((a, b) => new Date(a.window_opens) - new Date(b.window_opens));

  const fieldProgress = fields.map((field) => {
    const fieldItems = schedule.filter((item) => item.field_name === field.name);
    const completed = fieldItems.filter((item) => item.status === "completed").length;
    const total = field.applications_per_season || Math.max(...fieldItems.map((item) => item.total_applications || 0), 0) || 1;
    return { field, completed, total, remaining: Math.max(total - completed, 0), percent: Math.min(100, Math.round((completed / total) * 100)) };
  });

  return (
    <Shell compact>
      <style>{css}</style>
      <section className="scheduler">
        <header className="scheduler__hero">
          <span className="eyebrow">Spray operations</span>
          <h1>Application scheduler</h1>
          <p>Manage spray windows, assign drones, and track field coverage across the season.</p>
        </header>

        <div className="scheduler__kpis">
          <div className="scheduler__kpi"><span>Fields managed</span><strong>{kpis.fields}</strong></div>
          <div className="scheduler__kpi"><span>Total acres</span><strong>{kpis.totalAcres.toLocaleString()}</strong></div>
          <div className="scheduler__kpi"><span>Applications this week</span><strong>{kpis.applicationsThisWeek}</strong></div>
          <div className="scheduler__kpi"><span>Completion rate</span><strong>{kpis.completionRate}%</strong></div>
        </div>
        {message ? <p className="scheduler__message">{message}</p> : null}

        <section className="scheduler__board">
          {columns.map((column) => {
            const items = schedule.filter((item) => item.status === column.id);
            return (
              <article className="scheduler__col" key={column.id}>
                <header className="scheduler__col-header">
                  <span className="scheduler__col-title"><span className="scheduler__dot" style={{ "--dot": column.color }} />{column.label}</span>
                  <strong>{items.length}</strong>
                </header>
                <div className="scheduler__stack">
                  {items.length ? items.map((item) => {
                    const progress = Math.min(100, ((item.application_number || 0) / (item.total_applications || 1)) * 100);
                    const assignedDrone = drones.find((drone) => drone.id === item.assigned_drone_id);
                    return (
                      <button className="scheduler__card" type="button" key={item.id} onClick={() => openCard(item)}>
                        <div className="scheduler__card-top">
                          <strong>{item.field_name}</strong>
                          <span className={`scheduler__badge scheduler__badge--${item.priority}`}>{item.priority}</span>
                        </div>
                        <p>{item.field_location}</p>
                        <div className="scheduler__meta">
                          <span>{Number(item.field_acres || 0).toLocaleString()} acres</span>
                          <span>{item.product_to_apply}</span>
                        </div>
                        <div>
                          <div className="scheduler__meta">
                            <span>Application {item.application_number || "-"} of {item.total_applications || "-"}</span>
                          </div>
                          <div className="scheduler__app-progress"><span style={{ "--fill": `${progress}%` }} /></div>
                        </div>
                        <span className={`scheduler__window ${isClosingSoon(item.window_closes) ? "is-tight" : ""}`}>{formatWindow(item.window_opens, item.window_closes)}</span>
                        {item.assigned_pilot_name ? <p>{assignedDrone?.nickname || item.assigned_drone_serial || "Assigned drone"} | {item.assigned_pilot_name}</p> : null}
                      </button>
                    );
                  }) : <p className="scheduler__empty">No applications in this stage.</p>}
                </div>
              </article>
            );
          })}
        </section>

        <div className="scheduler__bottom">
          <section className="scheduler__panel">
            <div>
              <span className="eyebrow">Upcoming timeline</span>
              <h2>Next 21 days</h2>
            </div>
            <div className="scheduler__timeline">
              {upcoming.length ? upcoming.map((item) => (
                <article className="scheduler__timeline-row" key={`${item.id}-timeline`}>
                  <div className="scheduler__timeline-top">
                    <strong>{item.field_name}</strong>
                    <span className={`scheduler__badge scheduler__badge--${item.priority}`}>{item.priority}</span>
                  </div>
                  <p>{formatWindow(item.window_opens, item.window_closes)} | {item.product_to_apply}</p>
                </article>
              )) : <p className="scheduler__empty">No upcoming scheduled applications.</p>}
            </div>
          </section>

          <section className="scheduler__panel">
            <div>
              <span className="eyebrow">Season progress</span>
              <h2>Field coverage</h2>
            </div>
            <div className="scheduler__progress-list">
              {fieldProgress.map(({ field, completed, total, remaining, percent }) => (
                <article className="scheduler__field-row" key={field.id || field.name}>
                  <div className="scheduler__field-top">
                    <div>
                      <strong>{field.name}</strong>
                      <p>{field.crop_type} | {completed} of {total} complete | {remaining} remaining</p>
                    </div>
                    <span>{percent}%</span>
                  </div>
                  <div className="scheduler__app-progress"><span style={{ "--fill": `${percent}%` }} /></div>
                </article>
              ))}
            </div>
          </section>
        </div>

        {selected ? (
          <div className="scheduler__modal" role="dialog" aria-modal="true">
            <form className="scheduler__modal-card" onSubmit={selected.status === "scheduled" ? assignApplication : markComplete}>
              <div>
                <span className="eyebrow">Application detail</span>
                <h2>{selected.field_name}</h2>
                <p>{selected.product_to_apply} | {Number(selected.field_acres || 0).toLocaleString()} acres | {formatWindow(selected.window_opens, selected.window_closes)}</p>
              </div>

              {selected.status === "scheduled" ? (
                <div className="scheduler__form-grid">
                  <label className="field">
                    <span>Available drone</span>
                    <select value={assignForm.droneId} onChange={(event) => setAssignForm((current) => ({ ...current, droneId: event.target.value }))}>
                      {availableDrones.map((drone) => (
                        <option key={drone.id} value={drone.id}>{drone.nickname || drone.serial_number} | {drone.serial_number}</option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    <span>Qualified pilot</span>
                    <select value={assignForm.pilot} onChange={(event) => setAssignForm((current) => ({ ...current, pilot: event.target.value }))}>
                      {PILOTS.map((pilot) => <option key={pilot}>{pilot}</option>)}
                    </select>
                  </label>
                </div>
              ) : (
                <label className="field">
                  <span>Actual acres sprayed</span>
                  <input inputMode="decimal" value={assignForm.actualAcres} onChange={(event) => setAssignForm((current) => ({ ...current, actualAcres: event.target.value }))} />
                </label>
              )}

              <div className="inline-actions">
                {selected.status === "scheduled" ? (
                  <button className="button button--primary button--small" type="submit" disabled={!availableDrones.length}>Assign</button>
                ) : (
                  <button className="button button--primary button--small" type="submit">Mark complete</button>
                )}
                {selected.status === "assigned" ? (
                  <button className="button button--secondary button--small" type="button" onClick={() => updateSchedule(selected.id, { status: "in_progress", started_at: new Date().toISOString() }).then((result) => result.ok && setSelected(null))}>Start job</button>
                ) : null}
                <button className="button button--secondary button--small" type="button" onClick={() => setSelected(null)}>Close</button>
              </div>
            </form>
          </div>
        ) : null}
      </section>
    </Shell>
  );
}

export default SchedulerPage;
