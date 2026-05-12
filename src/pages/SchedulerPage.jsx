import { useEffect, useMemo, useState } from "react";
import { evaluateFlightReadiness, generateComplianceRecord } from "../../shared/flightReadiness";
import FlightReadinessPanel from "../components/FlightReadinessPanel";
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
  { id: "demo-alpha", serial_number: "HY-AG272-0041", model: "HYL-300 Atlas", nickname: "Alpha", status: "available", assigned_pilot_name: "Jody Bjornson", total_flight_hours: 127.5, hours_since_maintenance: 22.5, maintenance_due_hours: 50, faa_registration: "FA3XXHD041", insurance_expiry: "2027-02-01" },
  { id: "demo-bravo", serial_number: "HY-AG272-0042", model: "HYL-300 Atlas", nickname: "Bravo", status: "available", assigned_pilot_name: "Jody Bjornson", total_flight_hours: 98.3, hours_since_maintenance: 48.3, maintenance_due_hours: 50, faa_registration: "FA3XXHD042", insurance_expiry: "2027-02-01" },
  { id: "demo-delta", serial_number: "HY-AG272-0044", model: "HYL-300 Atlas", nickname: "Delta", status: "available", assigned_pilot_name: "", total_flight_hours: 45.2, hours_since_maintenance: 45.2, maintenance_due_hours: 50, faa_registration: "FA3XXHD044", insurance_expiry: "2027-02-01" },
];

const DEMO_PILOTS = [
  { id: "pilot-jody", name: "Jody Bjornson", part107Number: "RP-107-4412", part107ExpiryDate: "2027-04-30", pesticideLicenseNumber: "MN-POTATO-118", pesticideLicenseExpiryDate: "2027-03-31", trainingComplete: true, trainingProgressPct: 100, insuranceExpiryDate: "2027-01-31" },
  { id: "pilot-ada", name: "Ada Miller", part107Number: "RP-107-9921", part107ExpiryDate: "2026-05-25", pesticideLicenseNumber: "MN-POTATO-202", pesticideLicenseExpiryDate: "2027-02-15", trainingComplete: true, trainingProgressPct: 100, insuranceExpiryDate: "2026-12-31" },
  { id: "pilot-noah", name: "Noah Petersen", part107Number: "RP-107-7720", part107ExpiryDate: "2027-06-15", pesticideLicenseNumber: "", pesticideLicenseExpiryDate: "", trainingComplete: true, trainingProgressPct: 100, insuranceExpiryDate: "2026-11-01" },
  { id: "pilot-backup", name: "Backup operator", part107Number: "", part107ExpiryDate: "", pesticideLicenseNumber: "", pesticideLicenseExpiryDate: "", trainingComplete: false, trainingProgressPct: 45, insuranceExpiryDate: "" },
];

const DEMO_WEATHER = { conditions: "Clear", windSpeedMph: 7, isRaining: false, temperatureF: 66, humidityPct: 54 };

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
.scheduler__modal-card.is-wide{width:min(860px,100%)}
.scheduler__form-grid{display:grid;gap:12px}
.scheduler__message{color:#f2efcf}
.scheduler__readiness-chip{display:inline-flex;align-items:center;gap:7px;color:#E8E6E1;font-size:12px;font-weight:800}
.scheduler__readiness-chip span{width:9px;height:9px;border-radius:50%;background:var(--chip)}
.scheduler__blockers{display:grid;gap:6px;margin:0;padding-left:18px;color:#FFD7D7}
.scheduler__checklist-box{display:grid;gap:8px;padding:12px;border:1px solid rgba(255,255,255,.08);border-radius:8px;background:rgba(255,255,255,.035)}
.scheduler__override{display:grid;gap:8px;padding:12px;border:1px solid rgba(251,191,36,.22);border-radius:8px;background:rgba(251,191,36,.08)}
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

function missionForReadiness(item, overrides = {}) {
  return {
    id: item.id,
    fieldName: item.field_name,
    fieldLocation: item.field_location,
    fieldAcres: item.field_acres,
    cropType: item.crop_type,
    productToApply: item.product_to_apply,
    applicationRate: item.application_rate,
    applicationNumber: item.application_number,
    totalApplications: item.total_applications,
    windowOpens: item.window_opens,
    windowCloses: item.window_closes,
    maxWindMph: item.wind_max_mph || 10,
    requiresPesticideLicense: !String(item.product_to_apply || "").toLowerCase().includes("source"),
    ...overrides,
  };
}

function aircraftForReadiness(drone) {
  if (!drone) return {};
  return {
    id: drone.id,
    serialNumber: drone.serial_number,
    model: drone.model,
    status: drone.status,
    faaRegistration: drone.faa_registration,
    insuranceExpiry: drone.insurance_expiry,
    totalFlightHours: drone.total_flight_hours,
    hoursSinceMaintenance: drone.hours_since_maintenance,
    maintenanceDueHours: drone.maintenance_due_hours,
  };
}

function readinessChip(readiness) {
  if (!readiness) return { color: "#727966", label: "Unassigned" };
  if (readiness.blockerCount > 0) return { color: "#F87171", label: `${readiness.blockerCount} blockers` };
  if (readiness.warningCount > 0) return { color: "#FBBF24", label: `${readiness.warningCount} warning${readiness.warningCount === 1 ? "" : "s"}` };
  return { color: "#A3D977", label: "Cleared" };
}

function SchedulerPage() {
  const { isDemo, isAdmin, profile, dealerId, networkId } = useAuth();
  const [schedule, setSchedule] = useState([]);
  const [fields, setFields] = useState([]);
  const [drones, setDrones] = useState([]);
  const [pilots, setPilots] = useState(DEMO_PILOTS);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");
  const [assignForm, setAssignForm] = useState({ droneId: "", pilotId: "pilot-jody", actualAcres: "", overrideReason: "", preflightCompleted: false, postflightCompleted: false, anomalies: "" });

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
      setPilots(DEMO_PILOTS);
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
    const assignedPilot = DEMO_PILOTS.find((pilot) => pilot.name === item.assigned_pilot_name) || DEMO_PILOTS[0];
    setSelected(item);
    setAssignForm({
      droneId: availableDrones[0]?.id || "",
      pilotId: assignedPilot.id,
      actualAcres: item.field_acres || "",
      overrideReason: "",
      preflightCompleted: Boolean(item.preflight_completed),
      postflightCompleted: Boolean(item.postflight_completed),
      anomalies: "",
    });
  }

  function getReadinessFor(item, { requirePreflightNow = false, preflightCompleted = false, droneId, pilotId } = {}) {
    const drone = drones.find((entry) => entry.id === (droneId || item.assigned_drone_id));
    const pilot = pilots.find((entry) => entry.id === pilotId) || pilots.find((entry) => entry.name === item.assigned_pilot_name);
    if (!drone || !pilot) return null;
    return evaluateFlightReadiness({
      pilot,
      aircraft: aircraftForReadiness(drone),
      mission: missionForReadiness(item, { requirePreflightNow, preflightCompleted }),
      weather: DEMO_WEATHER,
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
    const pilot = pilots.find((item) => item.id === assignForm.pilotId);
    const readiness = getReadinessFor(selected, { droneId: assignForm.droneId, pilotId: assignForm.pilotId });
    const overrideUsed = !readiness?.cleared && isAdmin && assignForm.overrideReason.trim();
    if (!readiness?.cleared && !overrideUsed) {
      setMessage("Mission cannot be assigned until readiness blockers are cleared or an admin override is documented.");
      return;
    }
    const result = await updateSchedule(selected.id, {
      status: "assigned",
      assigned_drone_id: drone?.id,
      assigned_drone_serial: drone?.serial_number,
      assigned_pilot_name: pilot?.name,
      override_used: Boolean(overrideUsed),
      override_reason: overrideUsed ? assignForm.overrideReason.trim() : null,
      override_authorized_by: overrideUsed ? profile?.full_name || profile?.email || "Admin" : null,
    });
    if (result.ok) {
      setSelected(null);
      setMessage(overrideUsed ? "Application assigned with documented admin override." : "Application assigned.");
    }
  }

  async function startMission() {
    if (!selected) return;
    const readiness = getReadinessFor(selected, {
      requirePreflightNow: true,
      preflightCompleted: assignForm.preflightCompleted,
      droneId: selected.assigned_drone_id,
    });
    if (!readiness?.cleared) {
      setMessage("Mission launch is blocked until every readiness gate passes, including pre-flight.");
      return;
    }
    const result = await updateSchedule(selected.id, {
      status: "in_progress",
      started_at: new Date().toISOString(),
      preflight_completed: true,
      readiness_evaluated_at: new Date().toISOString(),
    });
    if (result.ok) {
      setSelected(null);
      setMessage("Mission launched after readiness confirmation.");
    }
  }

  async function markComplete(event) {
    event.preventDefault();
    if (!selected || !assignForm.postflightCompleted) {
      setMessage("Post-flight inspection is required before completing the mission.");
      return;
    }
    const drone = drones.find((item) => item.id === selected.assigned_drone_id);
    const pilot = pilots.find((item) => item.name === selected.assigned_pilot_name) || pilots[0];
    const completedAt = new Date().toISOString();
    const startedAt = selected.started_at || new Date(Date.now() - 60 * 60000).toISOString();
    const flightDurationMinutes = Math.max(1, Math.round((new Date(completedAt) - new Date(startedAt)) / 60000));
    const flightLog = {
      acresSprayed: Number(assignForm.actualAcres || selected.field_acres || 0),
      preflightChecklistCompleted: true,
      postflightInspectionCompleted: true,
      startedAt,
      completedAt,
      flightDurationMinutes,
      readinessEvaluatedAt: selected.readiness_evaluated_at,
    };
    const complianceRecord = generateComplianceRecord({
      pilot,
      aircraft: aircraftForReadiness(drone),
      mission: missionForReadiness(selected),
      flightLog,
      weather: DEMO_WEATHER,
      override: {
        used: Boolean(selected.override_used),
        reason: selected.override_reason,
        authorizedBy: selected.override_authorized_by,
      },
    });
    const result = await updateSchedule(selected.id, {
      status: "completed",
      completed_at: completedAt,
      actual_acres_sprayed: Number(assignForm.actualAcres || selected.field_acres || 0),
      postflight_completed: true,
      notes: assignForm.anomalies || selected.notes || null,
    });
    if (result.ok) {
      if (!String(selected.id).startsWith("s")) {
        await supabase.from("compliance_records").insert({
          record_number: complianceRecord.recordNumber,
          mission_id: selected.id,
          drone_id: drone?.id,
          field_name: complianceRecord.fieldName,
          field_location: complianceRecord.fieldLocation,
          field_acres: complianceRecord.fieldAcres,
          crop_type: complianceRecord.cropType,
          application_number: complianceRecord.applicationNumber,
          total_applications: complianceRecord.totalApplications,
          product_applied: complianceRecord.productApplied,
          application_rate: complianceRecord.applicationRate,
          actual_acres_sprayed: complianceRecord.actualAcresSprayed,
          pilot_name: complianceRecord.pilotName,
          part107_current: true,
          pesticide_license_current: true,
          training_complete: complianceRecord.pilotTrainingComplete,
          insurance_current: true,
          drone_serial_number: complianceRecord.droneSerialNumber,
          drone_model: complianceRecord.droneModel,
          faa_registration: complianceRecord.faaRegistration,
          flight_hours_at_mission: complianceRecord.flightHoursAtMission,
          maintenance_current: complianceRecord.maintenanceCurrent,
          preflight_completed: true,
          postflight_completed: true,
          weather_conditions: complianceRecord.weatherConditions,
          wind_speed_mph: complianceRecord.windSpeedMph,
          temperature_f: complianceRecord.temperatureF,
          humidity_pct: complianceRecord.humidityPct,
          mission_started: startedAt,
          mission_completed: completedAt,
          flight_duration_minutes: flightDurationMinutes,
          all_gates_passed: !selected.override_used,
          override_used: Boolean(selected.override_used),
          override_reason: selected.override_reason,
          override_authorized_by: selected.override_authorized_by,
          dealer_id: dealerId,
          network_id: networkId,
        });
      }
      setSelected(null);
      setMessage(`Application marked complete. Compliance record ${complianceRecord.recordNumber} generated.`);
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

  const selectedReadiness = selected?.status === "scheduled"
    ? getReadinessFor(selected, { droneId: assignForm.droneId, pilotId: assignForm.pilotId })
    : selected
      ? getReadinessFor(selected, { requirePreflightNow: selected.status === "assigned", preflightCompleted: assignForm.preflightCompleted, droneId: selected.assigned_drone_id })
      : null;
  const selectedPilot = pilots.find((pilot) => pilot.id === assignForm.pilotId);
  const canAssign = selected?.status === "scheduled" && (selectedReadiness?.cleared || (isAdmin && selectedReadiness && assignForm.overrideReason.trim()));
  const canLaunch = selected?.status === "assigned" && selectedReadiness?.cleared;

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
                    const cardReadiness = ["assigned", "in_progress"].includes(item.status) ? getReadinessFor(item, { droneId: item.assigned_drone_id }) : null;
                    const chip = readinessChip(cardReadiness);
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
                        {cardReadiness ? <span className="scheduler__readiness-chip" style={{ "--chip": chip.color }}><span />{chip.label}</span> : null}
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
            <form className="scheduler__modal-card is-wide" onSubmit={selected.status === "scheduled" ? assignApplication : markComplete}>
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
                    <select value={assignForm.pilotId} onChange={(event) => setAssignForm((current) => ({ ...current, pilotId: event.target.value }))}>
                      {pilots.map((pilot) => <option key={pilot.id} value={pilot.id}>{pilot.name}</option>)}
                    </select>
                  </label>
                </div>
              ) : (
                <div className="scheduler__form-grid">
                  <label className="field">
                    <span>Actual acres sprayed</span>
                    <input inputMode="decimal" value={assignForm.actualAcres} onChange={(event) => setAssignForm((current) => ({ ...current, actualAcres: event.target.value }))} />
                  </label>
                  <label className="field">
                    <span>Anomalies noted</span>
                    <input value={assignForm.anomalies} onChange={(event) => setAssignForm((current) => ({ ...current, anomalies: event.target.value }))} placeholder="None" />
                  </label>
                </div>
              )}

              {selectedReadiness ? <FlightReadinessPanel readiness={selectedReadiness} compact={selected.status === "completed"} /> : null}

              {selected.status === "scheduled" && selectedReadiness && !selectedReadiness.cleared ? (
                <div className="scheduler__override">
                  <strong>Admin override</strong>
                  <p>Overrides require a documented reason and are carried into the compliance record.</p>
                  <textarea rows="3" value={assignForm.overrideReason} onChange={(event) => setAssignForm((current) => ({ ...current, overrideReason: event.target.value }))} disabled={!isAdmin} placeholder={isAdmin ? "Type reason for override" : "Admin only"} />
                </div>
              ) : null}

              {selected.status === "assigned" ? (
                <div className="scheduler__checklist-box">
                  <label>
                    <input type="checkbox" checked={assignForm.preflightCompleted} onChange={(event) => setAssignForm((current) => ({ ...current, preflightCompleted: event.target.checked }))} /> Pre-flight checklist completed for this mission
                  </label>
                  <a className="button button--secondary button--small" href="/training/checklists/hylio-preflight-checklist">Open pre-flight checklist</a>
                </div>
              ) : null}

              {selected.status === "in_progress" ? (
                <div className="scheduler__checklist-box">
                  <label>
                    <input type="checkbox" checked={assignForm.postflightCompleted} onChange={(event) => setAssignForm((current) => ({ ...current, postflightCompleted: event.target.checked }))} /> Post-flight inspection completed
                  </label>
                  <a className="button button--secondary button--small" href="/training/checklists/hylio-postflight-checklist">Open post-flight checklist</a>
                </div>
              ) : null}

              <div className="inline-actions">
                {selected.status === "scheduled" ? (
                  <button className="button button--primary button--small" type="submit" disabled={!canAssign}>{selectedReadiness?.cleared ? "Assign Mission" : `Cannot Assign - ${selectedReadiness?.blockerCount || 0} blockers`}</button>
                ) : selected.status === "in_progress" ? (
                  <button className="button button--primary button--small" type="submit" disabled={!assignForm.postflightCompleted}>Mark complete</button>
                ) : (
                  null
                )}
                {selected.status === "assigned" ? (
                  <button className="button button--secondary button--small" type="button" disabled={!canLaunch} onClick={startMission}>Confirm Launch</button>
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
