import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Navigate, useParams } from "react-router-dom";
import Shell from "../components/Shell";
import EnterpriseStyles from "../components/enterprise/EnterpriseStyles";
import {
  enterpriseDemoMetadata,
  enterpriseRoutes,
  getEnterpriseDemoPath,
  getSprayWindowReadiness,
} from "../../shared/enterpriseDivision";
import {
  addAircraft,
  addApplicationJob,
  addApplicationRecord,
  addOperatorCredential,
  addOperator,
  addSupportTicket,
  completeApplicationJobEvidence,
  getWorkspaceApplicationJobReadiness,
  getWorkspaceDivisionSummary,
  markAircraftReady,
  markOperatorPracticalsComplete,
  markOperatorTrainingComplete,
} from "../../shared/enterpriseWorkspace";
import { CREDENTIAL_TYPES, getCourseProgress, trainingCourses } from "../../shared/trainingProgram";
import {
  loadEnterpriseWorkspace,
  resetEnterpriseWorkspace,
  saveEnterpriseWorkspace,
} from "../lib/enterpriseLocalStore";

function titleCaseStatus(status = "") {
  return status.replaceAll("_", " ");
}

function Status({ value }) {
  return <span className={`enterprise-status enterprise-status--${value}`}>{titleCaseStatus(value)}</span>;
}

function FormActions({ children }) {
  return <div className="enterprise-form-actions">{children}</div>;
}

function KpiCard({ label, value, detail }) {
  return (
    <article className="enterprise-card enterprise-kpi">
      <span className="enterprise-card__label">{label}</span>
      <strong>{value}</strong>
      <span>{detail}</span>
    </article>
  );
}

function EnterpriseNav({ orgId, view }) {
  return (
    <nav className="enterprise-nav" aria-label="Enterprise division navigation">
      {enterpriseRoutes.map((route) => (
        <NavLink
          className={route.path.endsWith(`/${view}`) ? "is-active" : undefined}
          key={route.path}
          to={route.path.replace("/rdo/", `/${orgId}/`)}
        >
          {route.label}
        </NavLink>
      ))}
    </nav>
  );
}

function EnterpriseHero({ demo, summary }) {
  return (
    <div className="enterprise-hero card">
      <div className="enterprise-stack">
        <span className="eyebrow">Enterprise Drone Division</span>
        <h1>{demo.organization.name} drone command center</h1>
        <p>
          Build and operate an internal Hylio application division for potato operations:
          equipment, operators, SOPs, credentials, support, application records, and performance
          reporting in one readiness workflow.
        </p>
        <div className="enterprise-actions">
          <Link className="button button--primary button--small" to="/enterprise/rdo/readiness">
            Open readiness gate
          </Link>
          <Link className="button button--secondary button--small" to="/enterprise/rdo/spray-calendar">
            View spray calendar
          </Link>
        </div>
        <p className="enterprise-demo-note">{enterpriseDemoMetadata.disclaimer}</p>
      </div>
      <aside className="enterprise-card">
        <span className="enterprise-card__label">{enterpriseDemoMetadata.label}</span>
        <span className="enterprise-card__label">RDO operating model</span>
        <h2>{demo.organization.division.status}</h2>
        <p>{demo.organization.ownerPositioning}</p>
        <div className="enterprise-chip-row">
          <Status value={summary.blockedJobs ? "blocked" : "ready"} />
          <span className="enterprise-status enterprise-status--watching">
            {summary.readyJobs} ready jobs
          </span>
        </div>
      </aside>
    </div>
  );
}

function DashboardView({ demo, summary, onResetWorkspace }) {
  const nextWindow = getSprayWindowReadiness(demo.organization.id, summary.nextSprayWindow.id);
  const demoPath = getEnterpriseDemoPath(demo.organization.id);

  return (
    <>
      <div className="enterprise-grid--three">
        <KpiCard label="Operator readiness" value={`${summary.operatorReadyCount}/${summary.operatorTotal}`} detail="Ready under Harvest rules" />
        <KpiCard label="Fleet readiness" value={`${summary.aircraftReadyCount}/${summary.aircraftTotal}`} detail="Active, verified, unblocked aircraft" />
        <KpiCard label="Next 7-day jobs" value={`${summary.readyJobs} ready`} detail={`${summary.blockedJobs} blocked or watching`} />
        <KpiCard label="Support load" value={summary.openSupportTickets} detail="Open maintenance/support tickets" />
      </div>

      <div className="enterprise-grid">
        <section className="enterprise-panel card">
          <span className="eyebrow">Spray window</span>
          <h2>{summary.nextSprayWindow.title}</h2>
          <p>{summary.nextSprayWindow.dateRange} | {summary.nextSprayWindow.weather}</p>
          {nextWindow.ready ? (
            <div className="enterprise-success">Ready to dispatch under configured Harvest rules.</div>
          ) : (
            <div className="enterprise-alert">
              <strong>Cannot release every assignment yet.</strong>
              <ul className="enterprise-list">
                {nextWindow.blockers.slice(0, 4).map((blocker) => (
                  <li key={blocker}>{blocker}</li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <aside className="enterprise-panel card">
          <span className="eyebrow">Division blueprint</span>
          <h2>{demo.blueprint.phase}</h2>
          <div className="enterprise-progress">
            <span style={{ width: "68%" }} />
          </div>
          <p>Implementation is moving from setup into readiness validation and dispatch practice.</p>
        </aside>
      </div>

      <section className="enterprise-panel card">
        <span className="eyebrow">Guided demo path</span>
        <div className="enterprise-panel__header">
          <h2>RDO pilot story sequence</h2>
          <button className="button button--secondary button--small" type="button" onClick={onResetWorkspace}>
            Reset demo data
          </button>
        </div>
        <div className="enterprise-demo-path">
          {demoPath.map((step, index) => (
            <Link className="enterprise-demo-step" to={step.route} key={step.id}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step.title}</strong>
              <small>{step.successCue}</small>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

function BlueprintView({ demo }) {
  return (
    <section className="enterprise-panel card">
      <span className="eyebrow">Drone Division Blueprint</span>
      <h2>{demo.blueprint.phase}</h2>
      <div className="enterprise-grid--two">
        {demo.blueprint.steps.map((step, index) => (
          <article className="enterprise-card" key={step.id}>
            <span className="enterprise-card__label">Phase {index + 1}</span>
            <h3>{step.title}</h3>
            <p>{step.owner}</p>
            <Status value={step.status} />
          </article>
        ))}
      </div>
    </section>
  );
}

function SprayCalendarView({ demo }) {
  return (
    <section className="enterprise-panel card">
      <span className="eyebrow">Spray program</span>
      <h2>Potato application calendar</h2>
      <div className="enterprise-grid--two">
        {demo.sprayWindows.map((sprayWindow) => {
          const readiness = getSprayWindowReadiness(demo.organization.id, sprayWindow.id);
          return (
            <article className="enterprise-card" key={sprayWindow.id}>
              <div className="enterprise-chip-row">
                <Status value={readiness.ready ? "ready" : "blocked"} />
                <span className="enterprise-status enterprise-status--watching">{sprayWindow.state}</span>
              </div>
              <h3>{sprayWindow.title}</h3>
              <p>{sprayWindow.dateRange} | {sprayWindow.weather}</p>
              {readiness.blockers.length ? (
                <ul className="enterprise-list">
                  {readiness.blockers.slice(0, 3).map((blocker) => (
                    <li key={blocker}>{blocker}</li>
                  ))}
                </ul>
              ) : (
                <p>Operator, aircraft, documents, checklists, and state credential gates are ready.</p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function OperatorsView({ demo, actions }) {
  const [form, setForm] = useState({
    name: "",
    role: "Operator trainee",
    state: "North Dakota",
    base: "Grand Forks Valley Unit",
    aircraftModels: "Hylio AG-272",
    payloadTypes: "liquid",
  });

  function handleSubmit(event) {
    event.preventDefault();
    if (!form.name.trim()) return;
    actions.addOperator(form);
    setForm((current) => ({ ...current, name: "" }));
  }

  return (
    <section className="enterprise-panel card">
      <span className="eyebrow">Operator training + qualification</span>
      <h2>RDO operator bench</h2>
      <form className="enterprise-inline-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Name</span>
          <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Add pilot operator" />
        </label>
        <label className="field">
          <span>Role</span>
          <select value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}>
            <option>Operator trainee</option>
            <option>Lead Operator</option>
            <option>Backup Operator</option>
          </select>
        </label>
        <label className="field">
          <span>Aircraft models</span>
          <input value={form.aircraftModels} onChange={(event) => setForm((current) => ({ ...current, aircraftModels: event.target.value }))} />
        </label>
        <FormActions>
          <button className="button button--primary button--small" type="submit">Add operator</button>
        </FormActions>
      </form>
      <div className="enterprise-grid--three">
        {demo.operators.map((operator) => {
          const progress = getCourseProgress(operator, trainingCourses[0]);
          const assignedJob = demo.applicationJobs.find((job) => job.assignedOperatorId === operator.id) || demo.applicationJobs[0];
          const readiness = getWorkspaceApplicationJobReadiness(demo, assignedJob.id, {
            operatorId: operator.id,
            aircraftId: assignedJob.aircraftId,
          });

          return (
            <article className="enterprise-card" key={operator.id}>
              <span className="enterprise-card__label">{operator.base}</span>
              <h3>{operator.name}</h3>
              <p>{operator.role} | {titleCaseStatus(readiness.level || "not_ready")}</p>
              <div className="enterprise-progress">
                <span style={{ width: `${progress.percentage}%` }} />
              </div>
              <p>
                {progress.percentage}% training complete | {(operator.credentials || []).filter((credential) => credential.status === "verified").length} tracked credentials
              </p>
              {!readiness.ready ? (
                <div className="enterprise-action-strip" aria-label={`${operator.name} pilot readiness actions`}>
                  <button className="button button--secondary button--small" type="button" onClick={() => actions.markOperatorTrainingComplete(operator.id)}>
                    Complete training
                  </button>
                  <button className="button button--secondary button--small" type="button" onClick={() => actions.markOperatorPracticalsComplete(operator.id)}>
                    Sign practicals
                  </button>
                  <button
                    className="button button--secondary button--small"
                    type="button"
                    onClick={() =>
                      actions.addOperatorCredential(operator.id, {
                        type: CREDENTIAL_TYPES.PESTICIDE_APPLICATOR_LICENSE,
                        status: "verified",
                        state: operator.state || "North Dakota",
                        category: "Ag aerial application",
                        expiresAt: "2027-12-31",
                        evidenceLabel: `${operator.state || "North Dakota"} pesticide license evidence`,
                      })
                    }
                  >
                    Track pesticide credential
                  </button>
                </div>
              ) : null}
              <div className="enterprise-chip-row">
                <Status value={readiness.ready ? "ready" : "blocked"} />
                <Link className="button button--secondary button--small" to={`/operators/${operator.id}/training`}>
                  Training profile
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function FleetView({ demo, actions }) {
  const [form, setForm] = useState({
    tailNumber: "",
    model: "Hylio AG-272",
    maintenanceBlocked: "false",
    calibrationStatus: "current",
    batteryChecklistStatus: "complete",
  });

  function handleSubmit(event) {
    event.preventDefault();
    if (!form.tailNumber.trim()) return;
    actions.addAircraft({
      ...form,
      maintenanceBlocked: form.maintenanceBlocked === "true",
    });
    setForm((current) => ({ ...current, tailNumber: "" }));
  }

  return (
    <section className="enterprise-panel card">
      <span className="eyebrow">Fleet and equipment readiness</span>
      <h2>Aircraft, calibration, and maintenance state</h2>
      <form className="enterprise-inline-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Tail number</span>
          <input value={form.tailNumber} onChange={(event) => setForm((current) => ({ ...current, tailNumber: event.target.value }))} placeholder="RDO-HY-04" />
        </label>
        <label className="field">
          <span>Model</span>
          <select value={form.model} onChange={(event) => setForm((current) => ({ ...current, model: event.target.value }))}>
            <option>Hylio AG-272</option>
            <option>Hylio AG-230</option>
          </select>
        </label>
        <label className="field">
          <span>Maintenance blocker</span>
          <select value={form.maintenanceBlocked} onChange={(event) => setForm((current) => ({ ...current, maintenanceBlocked: event.target.value }))}>
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </label>
        <FormActions>
          <button className="button button--primary button--small" type="submit">Add aircraft</button>
        </FormActions>
      </form>
      <div className="enterprise-grid--three">
        {demo.aircraft.map((aircraft) => (
          <article className="enterprise-card" key={aircraft.id}>
            <span className="enterprise-card__label">{aircraft.tailNumber}</span>
            <h3>{aircraft.model}</h3>
            <p>Last inspection: {aircraft.readiness.lastInspectionAt}</p>
            {aircraft.maintenanceBlocked || aircraft.readiness.calibrationStatus !== "current" || aircraft.readiness.batteryChecklistStatus !== "complete" ? (
              <div className="enterprise-action-strip">
                <button className="button button--secondary button--small" type="button" onClick={() => actions.markAircraftReady(aircraft.id)}>
                  Mark ready after service
                </button>
              </div>
            ) : null}
            <div className="enterprise-chip-row">
              <Status value={aircraft.maintenanceBlocked ? "blocked" : "ready"} />
              <span className="enterprise-status enterprise-status--watching">
                Calibration {aircraft.readiness.calibrationStatus}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ReadinessView({ demo, actions }) {
  const [jobId, setJobId] = useState("rdo-job-002");
  const selectedJob = demo.applicationJobs.find((job) => job.id === jobId) || demo.applicationJobs[0];
  const [operatorId, setOperatorId] = useState(selectedJob.assignedOperatorId);
  const [aircraftId, setAircraftId] = useState(selectedJob.aircraftId);
  const readiness = getWorkspaceApplicationJobReadiness(demo, jobId, {
    jobId,
    operatorId,
    aircraftId,
  });
  const [newJob, setNewJob] = useState({
    title: "",
    fieldId: demo.fields[0]?.id || "",
    assignedOperatorId: demo.operators[1]?.id || demo.operators[0]?.id || "",
    aircraftId: demo.aircraft[1]?.id || demo.aircraft[0]?.id || "",
    state: "North Dakota",
    acres: "40",
    documentsAttached: "false",
    weatherAcknowledged: "false",
  });

  function handleJobSubmit(event) {
    event.preventDefault();
    if (!newJob.title.trim()) return;
    actions.addApplicationJob({
      ...newJob,
      aircraftModel: demo.aircraft.find((aircraft) => aircraft.id === newJob.aircraftId)?.model || "Hylio AG-272",
      payloadType: "liquid",
      operationType: "pesticide_application",
      documentsAttached: newJob.documentsAttached === "true",
      weatherAcknowledged: newJob.weatherAcknowledged === "true",
      requiredChecklistSlugs: ["preflight", "drift-weather-review", "chemical-mixing-loading"],
      completedChecklistSlugs: [],
    });
    setNewJob((current) => ({ ...current, title: "" }));
  }

  function handleJobChange(nextJobId) {
    const nextJob = demo.applicationJobs.find((job) => job.id === nextJobId);
    setJobId(nextJobId);
    setOperatorId(nextJob?.assignedOperatorId || operatorId);
    setAircraftId(nextJob?.aircraftId || aircraftId);
  }

  return (
    <section className="enterprise-panel card">
      <span className="eyebrow">Job readiness gate</span>
      <h2>Block unsafe or non-compliant assignments</h2>
      <div className="enterprise-select-grid">
        <label className="field">
          <span>Application job</span>
          <select value={jobId} onChange={(event) => handleJobChange(event.target.value)}>
            {demo.applicationJobs.map((job) => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Candidate operator</span>
          <select value={operatorId} onChange={(event) => setOperatorId(event.target.value)}>
            {demo.operators.map((operator) => (
              <option key={operator.id} value={operator.id}>{operator.name}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Aircraft</span>
          <select value={aircraftId} onChange={(event) => setAircraftId(event.target.value)}>
            {demo.aircraft.map((aircraft) => (
              <option key={aircraft.id} value={aircraft.id}>{aircraft.tailNumber} | {aircraft.model}</option>
            ))}
          </select>
        </label>
      </div>

      {readiness.ready ? (
        <div className="enterprise-success">
          <strong>Ready under Harvest rules.</strong>
          <p>Training, practical signoff, tracked credentials, aircraft readiness, documents, and required checklists pass for this assignment.</p>
        </div>
      ) : (
        <div className="enterprise-alert">
          <strong>Cannot assign this job:</strong>
          <ul className="enterprise-list">
            {readiness.blockers.map((blocker) => (
              <li key={blocker}>{blocker}</li>
            ))}
          </ul>
        </div>
      )}

      {!readiness.ready ? (
        <div className="enterprise-action-strip enterprise-action-strip--panel" aria-label="Selected job evidence actions">
          <button className="button button--secondary button--small" type="button" onClick={() => actions.completeApplicationJobEvidence(jobId, { documentsAttached: true })}>
            Attach documents
          </button>
          <button className="button button--secondary button--small" type="button" onClick={() => actions.completeApplicationJobEvidence(jobId, { completedChecklistSlugs: "all" })}>
            Complete checklists
          </button>
          <button className="button button--secondary button--small" type="button" onClick={() => actions.completeApplicationJobEvidence(jobId, { weatherAcknowledged: true })}>
            Acknowledge weather
          </button>
        </div>
      ) : null}

      <form className="enterprise-inline-form enterprise-inline-form--wide" onSubmit={handleJobSubmit}>
        <label className="field">
          <span>New pilot job</span>
          <input value={newJob.title} onChange={(event) => setNewJob((current) => ({ ...current, title: event.target.value }))} placeholder="Add application job" />
        </label>
        <label className="field">
          <span>Operator</span>
          <select value={newJob.assignedOperatorId} onChange={(event) => setNewJob((current) => ({ ...current, assignedOperatorId: event.target.value }))}>
            {demo.operators.map((operator) => <option key={operator.id} value={operator.id}>{operator.name}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Aircraft</span>
          <select value={newJob.aircraftId} onChange={(event) => setNewJob((current) => ({ ...current, aircraftId: event.target.value }))}>
            {demo.aircraft.map((aircraft) => <option key={aircraft.id} value={aircraft.id}>{aircraft.tailNumber}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Acres</span>
          <input value={newJob.acres} onChange={(event) => setNewJob((current) => ({ ...current, acres: event.target.value }))} inputMode="numeric" />
        </label>
        <FormActions>
          <button className="button button--primary button--small" type="submit">Create readiness job</button>
        </FormActions>
      </form>
    </section>
  );
}

function RecordsView({ demo, onAddApplicationRecord }) {
  const [form, setForm] = useState({
    field: "",
    operator: "Ada Miller",
    aircraft: "RDO-HY-01",
    acresApplied: "25",
    status: "draft",
    attachments: "application log",
  });

  function handleSubmit(event) {
    event.preventDefault();
    if (!form.field.trim()) return;
    onAddApplicationRecord(form);
    setForm((current) => ({ ...current, field: "" }));
  }

  return (
    <section className="enterprise-panel card">
      <span className="eyebrow">Application records</span>
      <h2>Closed potato application records</h2>
      <form className="enterprise-inline-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Field</span>
          <input value={form.field} onChange={(event) => setForm((current) => ({ ...current, field: event.target.value }))} placeholder="Pilot field" />
        </label>
        <label className="field">
          <span>Operator</span>
          <input value={form.operator} onChange={(event) => setForm((current) => ({ ...current, operator: event.target.value }))} />
        </label>
        <label className="field">
          <span>Acres</span>
          <input value={form.acresApplied} onChange={(event) => setForm((current) => ({ ...current, acresApplied: event.target.value }))} inputMode="numeric" />
        </label>
        <FormActions>
          <button className="button button--primary button--small" type="submit">Add record</button>
        </FormActions>
      </form>
      <div className="enterprise-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Record</th>
              <th>Field</th>
              <th>Operator</th>
              <th>Acres</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {demo.applicationRecords.map((record) => (
              <tr key={record.id}>
                <td>{record.completedAt}</td>
                <td>{record.field}</td>
                <td>{record.operator}</td>
                <td>{record.acresApplied}</td>
                <td><Status value={record.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SupportView({ demo, onAddSupportTicket }) {
  const [form, setForm] = useState({
    title: "",
    priority: "Normal",
    owner: "Harvest support",
    status: "open",
  });

  function handleSubmit(event) {
    event.preventDefault();
    if (!form.title.trim()) return;
    onAddSupportTicket(form);
    setForm((current) => ({ ...current, title: "" }));
  }

  return (
    <div className="enterprise-grid--two">
      <section className="enterprise-panel card">
        <span className="eyebrow">Support tickets</span>
        <h2>Harvest assistance queue</h2>
        <form className="enterprise-inline-form enterprise-inline-form--compact" onSubmit={handleSubmit}>
          <label className="field">
            <span>Ticket</span>
            <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Add support issue" />
          </label>
          <label className="field">
            <span>Priority</span>
            <select value={form.priority} onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}>
              <option>Normal</option>
              <option>High</option>
              <option>Urgent</option>
            </select>
          </label>
          <FormActions>
            <button className="button button--primary button--small" type="submit">Add ticket</button>
          </FormActions>
        </form>
        <div className="enterprise-stack">
          {demo.supportTickets.map((ticket) => (
            <article className="enterprise-card" key={ticket.id}>
              <span className="enterprise-card__label">{ticket.id} | {ticket.priority}</span>
              <h3>{ticket.title}</h3>
              <p>{ticket.owner}</p>
              <Status value={ticket.status} />
            </article>
          ))}
        </div>
      </section>
      <section className="enterprise-panel card">
        <span className="eyebrow">Maintenance records</span>
        <h2>Aircraft support state</h2>
        <div className="enterprise-stack">
          {demo.maintenanceRecords.map((record) => (
            <article className="enterprise-card" key={record.id}>
              <span className="enterprise-card__label">Due {record.due}</span>
              <h3>{record.title}</h3>
              <Status value={record.status} />
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function PerformanceView({ demo }) {
  return (
    <section className="enterprise-panel card">
      <span className="eyebrow">ROI and performance</span>
      <h2>Division performance reporting</h2>
      <div className="enterprise-grid--three">
        {demo.performanceMetrics.map((metric) => (
          <KpiCard key={metric.id} label={metric.label} value={metric.value} detail={metric.period} />
        ))}
      </div>
    </section>
  );
}

function EnterpriseView({ view, demo, summary, actions }) {
  switch (view) {
    case "division":
      return <DashboardView demo={demo} summary={summary} onResetWorkspace={actions.resetWorkspace} />;
    case "blueprint":
      return <BlueprintView demo={demo} />;
    case "spray-calendar":
      return <SprayCalendarView demo={demo} />;
    case "operators":
      return <OperatorsView demo={demo} actions={actions} />;
    case "fleet":
      return <FleetView demo={demo} actions={actions} />;
    case "readiness":
      return <ReadinessView demo={demo} actions={actions} />;
    case "application-records":
      return <RecordsView demo={demo} onAddApplicationRecord={actions.addApplicationRecord} />;
    case "support":
      return <SupportView demo={demo} onAddSupportTicket={actions.addSupportTicket} />;
    case "performance":
      return <PerformanceView demo={demo} />;
    default:
      return <DashboardView demo={demo} summary={summary} onResetWorkspace={actions.resetWorkspace} />;
  }
}

function EnterprisePage({ view = "division" }) {
  const { orgId = "rdo" } = useParams();
  const [demo, setDemo] = useState(() => loadEnterpriseWorkspace(orgId));
  const summary = useMemo(() => getWorkspaceDivisionSummary(demo), [demo]);

  useEffect(() => {
    setDemo(loadEnterpriseWorkspace(orgId));
  }, [orgId]);

  useEffect(() => {
    saveEnterpriseWorkspace(orgId, demo);
  }, [demo, orgId]);

  const actions = useMemo(() => ({
    addOperator: (input) => setDemo((current) => addOperator(current, input)),
    addAircraft: (input) => setDemo((current) => addAircraft(current, input)),
    addApplicationJob: (input) => setDemo((current) => addApplicationJob(current, input)),
    addApplicationRecord: (input) => setDemo((current) => addApplicationRecord(current, input)),
    addOperatorCredential: (operatorId, input) => setDemo((current) => addOperatorCredential(current, operatorId, input)),
    completeApplicationJobEvidence: (jobId, input) => setDemo((current) => completeApplicationJobEvidence(current, jobId, input)),
    markAircraftReady: (aircraftId) => setDemo((current) => markAircraftReady(current, aircraftId)),
    markOperatorPracticalsComplete: (operatorId) => setDemo((current) => markOperatorPracticalsComplete(current, operatorId, {
      evaluatorRole: "Chief Pilot",
      signedAt: "2026-05-05",
    })),
    markOperatorTrainingComplete: (operatorId) => setDemo((current) => markOperatorTrainingComplete(current, operatorId)),
    addSupportTicket: (input) => setDemo((current) => addSupportTicket(current, input)),
    resetWorkspace: () => setDemo(resetEnterpriseWorkspace(orgId)),
  }), [orgId]);

  if (view === "home") {
    return <Navigate to="/enterprise/rdo/division" replace />;
  }

  return (
    <Shell compact>
      <EnterpriseStyles />
      <section className="section enterprise-page">
        <EnterpriseHero demo={demo} summary={summary} />
        <EnterpriseNav orgId={orgId} view={view} />
        <EnterpriseView view={view} demo={demo} summary={summary} actions={actions} />
      </section>
    </Shell>
  );
}

export default EnterprisePage;
