import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useParams } from "react-router-dom";
import Shell from "../components/Shell";
import EnterpriseStyles from "../components/enterprise/EnterpriseStyles";
import { useAuth } from "../context/AuthContext";
import {
  enterpriseDemoMetadata,
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
import { isEnterpriseDemoProfile } from "../../shared/accessControl";

const rdoDemoNav = [
  { label: "Overview", view: "division", path: "/enterprise/rdo/division" },
  { label: "Training", view: "training", path: "/enterprise/rdo/training" },
  { label: "Operations", view: "spray-calendar", path: "/enterprise/rdo/spray-calendar" },
  { label: "Readiness", view: "readiness", path: "/enterprise/rdo/readiness" },
  { label: "Records", view: "application-records", path: "/enterprise/rdo/application-records" },
];

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
      {rdoDemoNav.map((route) => (
        <NavLink
          className={route.view === view ? "is-active" : undefined}
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
          reporting in one readiness workflow. The HYL-300 Atlas is the flagship model
          for large-acre operations with swarming support, backed by the HYL-150 Ares
          for smaller jobs and training paths.
        </p>
        <div className="enterprise-actions">
          <Link className="button button--primary button--small" to="/enterprise/rdo/training">
            Open RDO training
          </Link>
          <Link className="button button--secondary button--small" to="/enterprise/rdo/readiness">
            Check readiness
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
  const { profile } = useAuth();
  const isEnterpriseDemo = isEnterpriseDemoProfile(profile);
  const [form, setForm] = useState({
    name: "",
    role: "Operator trainee",
    state: "North Dakota",
    base: "Grand Forks Valley Unit",
    aircraftModels: "HYL-300 Atlas",
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
                {isEnterpriseDemo ? null : (
                  <Link className="button button--secondary button--small" to={`/operators/${operator.id}/training`}>
                    Training profile
                  </Link>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function RdoTrainingView({ demo }) {
  const foundations = trainingCourses.find((course) => course.slug === "hylio-operator-foundations");
  const potato = trainingCourses.find((course) => course.slug === "potato-application-specialist");
  const practical = trainingCourses.find((course) => course.slug === "hylio-practical-qualification");

  const trainingCards = [foundations, potato, practical].filter(Boolean);

  return (
    <div className="enterprise-stack">
      <section className="enterprise-panel card">
        <div className="enterprise-panel__header">
          <span className="eyebrow">RDO Demo Training</span>
          <h2>Operator onboarding, potato application, and field review in one demo lane</h2>
          <p>
            This is the RDO-facing training story: assigned operator modules, crop-specific potato lessons,
            SOP review, practical signoff, and certification readiness before any field launch.
          </p>
        </div>
        <div className="enterprise-grid--three">
          {trainingCards.map((course) => {
            const lessonCount = course.modules.reduce((total, module) => total + module.lessons.length, 0);
            return (
              <article className="enterprise-card" key={course.slug}>
                <span className="enterprise-card__label">{course.status}</span>
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                <div className="enterprise-chip-row">
                  <span className="enterprise-status enterprise-status--ready">{lessonCount} lessons</span>
                  <span className="enterprise-status enterprise-status--watching">{course.estimatedDurationMinutes} min</span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="enterprise-panel card">
        <div className="enterprise-panel__header">
          <span className="eyebrow">RDO operator training status</span>
          <h2>Who is ready for field review?</h2>
        </div>
        <div className="enterprise-table-wrap">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Operator</th>
                <th>Foundations</th>
                <th>Credentials</th>
                <th>Practical</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {demo.operators.map((operator) => {
                const progress = foundations ? getCourseProgress(operator, foundations) : { percentage: 0 };
                const credentialsReady = operator.credentials?.length || 0;
                const practicalReady = operator.practicalEvaluations?.every((evaluation) => evaluation.status === "passed");
                const ready = progress.percentage === 100 && credentialsReady > 0 && practicalReady;

                return (
                  <tr key={operator.id}>
                    <td>{operator.name}</td>
                    <td>{progress.percentage}%</td>
                    <td>{credentialsReady} records</td>
                    <td>{practicalReady ? "Passed" : "Pending"}</td>
                    <td><Status value={ready ? "ready" : "blocked"} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function FleetView({ demo, actions }) {
  const [form, setForm] = useState({
    tailNumber: "",
    model: "HYL-300 Atlas",
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
            <option>HYL-300 Atlas</option>
            <option>HYL-150 Ares</option>
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
      aircraftModel: demo.aircraft.find((aircraft) => aircraft.id === newJob.aircraftId)?.model || "HYL-300 Atlas",
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

const landingCss = `
.enterprise-landing{--bg:#0C0F0A;--surface:#151A12;--card:#1A2015;--border:rgba(255,255,255,0.06);--text:#E8E6E1;--text-muted:#727966;--accent:#A3D977;font-family:'Instrument Sans',system-ui,sans-serif;color:var(--text);display:grid;gap:18px}
.enterprise-landing h1,.enterprise-landing h2,.enterprise-landing h3{font-family:'DM Serif Display',Georgia,serif;font-weight:400;line-height:1.04;margin:0;color:#fff;letter-spacing:0}
.enterprise-landing p{margin:0;color:var(--text-muted)}
.el-hero,.el-band,.el-card,.el-preview,.el-contact,.el-footer{border:1px solid var(--border);border-radius:8px;background:var(--surface)}
.el-hero{position:relative;overflow:hidden;min-height:calc(100vh - 150px);display:grid;align-items:center;padding:28px;background:linear-gradient(135deg,rgba(12,15,10,.98),rgba(21,26,18,.94))}
.el-hero h1{font-size:clamp(3rem,9vw,6.8rem);max-width:10ch}
.el-hero p{max-width:760px;font-size:1.05rem;color:#c9d2c4}
.el-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}
.el-section{display:grid;gap:14px;padding:18px 0}
.el-section__head{display:grid;gap:8px;max-width:760px}
.el-grid{display:grid;gap:12px}
.el-card{padding:18px;background:var(--card)}
.el-card h3{font-size:1.45rem}
.el-icon{width:38px;height:38px;display:grid;place-items:center;border-radius:8px;background:rgba(163,217,119,.12);border:1px solid rgba(163,217,119,.22);color:var(--accent);font-weight:900}
.el-roi{display:grid;gap:16px;align-items:center}
.el-roi-number{font-family:'DM Serif Display',Georgia,serif;font-size:clamp(2.8rem,8vw,5.2rem);line-height:.95;color:var(--accent)}
.el-preview{padding:16px;background:linear-gradient(180deg,rgba(26,32,21,.96),rgba(12,15,10,.98));display:grid;gap:12px}
.el-preview__chrome{display:flex;gap:6px}
.el-preview__chrome span{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.24)}
.el-preview__grid{display:grid;gap:9px}
.el-preview__row{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;padding:10px;border-radius:8px;background:rgba(255,255,255,.045);border:1px solid var(--border)}
.el-preview__bar{height:8px;border-radius:999px;background:rgba(255,255,255,.08);overflow:hidden}
.el-preview__bar span{display:block;height:100%;width:var(--fill);background:var(--accent)}
.el-system{display:grid;gap:12px}
.el-contact{padding:20px;display:grid;gap:16px}
.el-form{display:grid;gap:12px}
.el-form-grid{display:grid;gap:12px}
.el-note{color:#f2efcf}
.el-footer{padding:16px;display:flex;flex-wrap:wrap;gap:10px}
.el-footer span{padding:8px 10px;border-radius:999px;background:rgba(255,255,255,.05);border:1px solid var(--border);font-size:13px;color:#dce6d7}
@media(min-width:800px){.el-hero{padding:44px}.el-grid--three{grid-template-columns:repeat(3,1fr)}.el-grid--six{grid-template-columns:repeat(3,1fr)}.el-roi{grid-template-columns:1fr 1fr}.el-system{grid-template-columns:repeat(2,1fr)}.el-form-grid{grid-template-columns:repeat(2,1fr)}}
`;

function PublicEnterpriseLanding() {
  const [form, setForm] = useState({ contactName: "", email: "", company: "", phone: "", message: "" });
  const [status, setStatus] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("Sending...");
    const response = await fetch("/api/enterprise-inquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      setStatus(result?.error || "Unable to send right now. Jake is at 612-258-0582.");
      return;
    }
    setStatus("Thanks. Jake will follow up shortly.");
    setForm({ contactName: "", email: "", company: "", phone: "", message: "" });
  }

  return (
    <Shell compact>
      <style>{landingCss}</style>
      <section className="enterprise-landing">
        <header className="el-hero">
          <div>
            <span className="eyebrow">Enterprise drone operations</span>
            <h1>Build a drone division inside your operation.</h1>
            <p>Equipment procurement, pilot training, compliance management, operational software, and maintenance support - everything you need to own precision application at scale.</p>
            <div className="el-actions">
              <Link className="button button--primary button--small" to="/roi-calculator">See the economics</Link>
              <a className="button button--secondary button--small" href="#enterprise-contact">Contact us</a>
            </div>
          </div>
        </header>

        <section className="el-section">
          <div className="el-section__head">
            <span className="eyebrow">The problem</span>
            <h2>Applicator dependency gets expensive when timing matters.</h2>
          </div>
          <div className="el-grid el-grid--three">
            {[
              ["Rising applicator costs", "Third-party spraying gets more expensive every season."],
              ["Missed spray windows", "You compete for limited applicator availability during critical timing."],
              ["Labor and control", "You cannot control quality, timing, or consistency when you hire it out."],
            ].map(([title, copy]) => <article className="el-card" key={title}><h3>{title}</h3><p>{copy}</p></article>)}
          </div>
        </section>

        <section className="el-section">
          <div className="el-section__head">
            <span className="eyebrow">Six pillars</span>
            <h2>Harvest Drone provides the operating layer, not just the aircraft.</h2>
          </div>
          <div className="el-grid el-grid--six">
            {[
              ["Fleet procurement", "HYL-300 Atlas flagship swarms and HYL-150 Ares aircraft, American-made and sized for your operation."],
              ["Training and certification", "11-lesson program, Part 107/137, pesticide licensing, and field checklists."],
              ["Operational software", "Scheduling, dispatch, fleet tracking, and compliance documentation."],
              ["Maintenance and support", "Ongoing repair, parts, and field service support."],
              ["Input distribution", "SOURCE, BLUEPRINT, and EarthOptics integration."],
              ["Regulatory compliance", "2027-ready equipment, credential tracking, and audit trail."],
            ].map(([title, copy], index) => <article className="el-card" key={title}><span className="el-icon">{index + 1}</span><h3>{title}</h3><p>{copy}</p></article>)}
          </div>
        </section>

        <section className="el-section el-roi">
          <div className="el-section__head">
            <span className="eyebrow">ROI</span>
            <h2>The math works.</h2>
            <p>At 5,000 acres and 10 applications per season, a three-drone division can turn recurring hire-out spend into owned operational capacity.</p>
            <Link className="button button--primary button--small" to="/roi-calculator">Run your own numbers</Link>
          </div>
          <aside className="el-preview">
            <div className="el-preview__chrome"><span /><span /><span /></div>
            <span className="el-roi-number">$414,000</span>
            <p>Projected annual savings after equipment purchase with the default calculator model.</p>
            <div className="el-preview__row"><span>Own cost per acre</span><strong>$3.72</strong></div>
            <div className="el-preview__row"><span>Hire cost per acre</span><strong>$12.00</strong></div>
          </aside>
        </section>

        <section className="el-section">
          <div className="el-section__head">
            <span className="eyebrow">The system</span>
            <h2>Every flight documented. Every pilot certified. Every drone tracked.</h2>
          </div>
          <div className="el-system">
            {[
              ["Fleet dashboard", "Alpha | available | 22.5 of 50 service hours", "45%"],
              ["Scheduler", "North 40 | Fungicide | Application 7 of 12", "58%"],
              ["Training system", "Pilot readiness | 11 lessons | credential vault", "82%"],
              ["Compliance record", "Application logs | weather | checklist evidence", "100%"],
            ].map(([title, copy, fill]) => (
              <article className="el-preview" key={title}>
                <div className="el-preview__chrome"><span /><span /><span /></div>
                <h3>{title}</h3>
                <div className="el-preview__row"><span>{copy}</span><strong>{fill}</strong></div>
                <div className="el-preview__bar"><span style={{ "--fill": fill }} /></div>
              </article>
            ))}
          </div>
        </section>

        <section className="el-contact" id="enterprise-contact">
          <div className="el-section__head">
            <span className="eyebrow">Start with one location. One season.</span>
            <h2>Pick the operation where timing is hardest.</h2>
            <p>We will size the fleet, train the team, install the software, and run it for one season. Jake is also reachable at 612-258-0582 or jake@harvestdrone.com.</p>
          </div>
          <form className="el-form" onSubmit={handleSubmit}>
            <div className="el-form-grid">
              <label className="field"><span>Name</span><input value={form.contactName} onChange={(event) => setForm((current) => ({ ...current, contactName: event.target.value }))} required /></label>
              <label className="field"><span>Email</span><input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} required /></label>
              <label className="field"><span>Company</span><input value={form.company} onChange={(event) => setForm((current) => ({ ...current, company: event.target.value }))} /></label>
              <label className="field"><span>Phone</span><input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} /></label>
            </div>
            <label className="field"><span>Message</span><textarea rows="5" value={form.message} onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} placeholder="Tell us about acreage, crops, timing constraints, and current applicator spend." /></label>
            <div className="inline-actions">
              <button className="button button--primary button--small" type="submit">Send inquiry</button>
              {status ? <span className="el-note">{status}</span> : null}
            </div>
          </form>
        </section>

        <footer className="el-footer">
          <span>American-made equipment (Hylio)</span>
          <span>2027-compliant from day one</span>
          <span>Full training and compliance infrastructure</span>
          <span>Operational software included</span>
        </footer>
      </section>
    </Shell>
  );
}

function EnterpriseView({ view, demo, summary, actions }) {
  switch (view) {
    case "division":
      return <DashboardView demo={demo} summary={summary} onResetWorkspace={actions.resetWorkspace} />;
    case "training":
      return <RdoTrainingView demo={demo} />;
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

  if (view === "landing" || view === "home") {
    return <PublicEnterpriseLanding />;
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
