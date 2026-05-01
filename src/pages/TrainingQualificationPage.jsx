import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Shell from "../components/Shell";
import {
  demoHylioJob,
  demoOperators,
  getOperatorQualificationPlan,
  getQualificationQueue,
} from "../../shared/trainingProgram";

const REVIEW_DATE = new Date("2026-04-30");

const css = `
.qualification-page {
  display: grid;
  gap: 1.1rem;
}

.qualification-hero {
  display: grid;
  gap: 1rem;
  padding: 1.25rem;
  background:
    radial-gradient(circle at top right, rgba(136, 214, 108, 0.14), transparent 28%),
    linear-gradient(180deg, rgba(24, 39, 32, 0.98), rgba(10, 17, 14, 0.98));
}

.qualification-hero__copy {
  display: grid;
  gap: 0.85rem;
  align-content: start;
}

.qualification-hero h1,
.qualification-card h2 {
  margin: 0;
  font-family: "Space Grotesk", sans-serif;
  line-height: 1;
  letter-spacing: -0.04em;
}

.qualification-hero h1 {
  max-width: 13ch;
  font-size: clamp(2rem, 6vw, 4rem);
}

.qualification-hero p,
.qualification-review-panel p,
.qualification-metric p,
.qualification-gate-row span,
.qualification-action-list p,
.qualification-review-callout p,
.qualification-card p {
  color: var(--muted);
}

.qualification-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
}

.qualification-review-panel,
.qualification-card {
  display: grid;
  gap: 1rem;
  padding: 1rem;
  border-radius: 1rem;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.04);
}

.qualification-review-panel strong {
  display: block;
  margin-top: 0.35rem;
  font-family: "Space Grotesk", sans-serif;
  line-height: 1.05;
  font-size: 1.5rem;
}

.qualification-meta,
.qualification-metric span,
.qualification-action-list span,
.qualification-review-callout span {
  display: block;
  color: var(--accent-warm);
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-weight: 700;
}

.qualification-metrics,
.qualification-layout,
.qualification-gate-groups,
.qualification-action-list {
  display: grid;
  gap: 1rem;
}

.qualification-metric {
  padding: 1rem;
}

.qualification-metric strong {
  display: block;
  margin-top: 0.35rem;
  font-family: "Space Grotesk", sans-serif;
  line-height: 1;
  font-size: clamp(1.6rem, 5vw, 2.5rem);
}

.qualification-gate-group {
  display: grid;
  gap: 0.65rem;
}

.qualification-gate-group h3 {
  margin: 0;
  color: var(--accent-warm);
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.qualification-gate-row {
  display: grid;
  gap: 0.75rem;
  padding: 0.95rem 0;
  border-bottom: 1px solid var(--line);
}

.qualification-gate-row:last-child {
  border-bottom: 0;
}

.qualification-gate-row strong,
.qualification-gate-row span {
  display: block;
}

.qualification-gate-row strong {
  color: var(--text);
}

.qualification-action-list {
  margin: 0;
  padding-left: 1.25rem;
}

.qualification-action-list li + li {
  margin-top: 0.85rem;
}

.qualification-action-list strong {
  display: block;
  margin-top: 0.15rem;
}

.qualification-action-list p {
  margin: 0.3rem 0 0;
}

.qualification-review-callout {
  display: grid;
  gap: 0.4rem;
  padding: 1rem;
  border-radius: 1rem;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.035);
}

.qualification-review-callout.is-ready {
  border-color: rgba(90, 197, 136, 0.28);
  background: rgba(90, 197, 136, 0.1);
}

.qualification-review-callout.is-blocked {
  border-color: rgba(255, 124, 124, 0.24);
  background: rgba(255, 124, 124, 0.08);
}

@media (min-width: 800px) {
  .qualification-hero {
    grid-template-columns: minmax(0, 1fr) 340px;
    align-items: start;
    padding: 1.75rem;
  }

  .qualification-metrics {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .qualification-layout {
    grid-template-columns: minmax(0, 1fr) 360px;
    align-items: start;
  }

  .qualification-gate-row {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
  }
}
`;

function statusClass(status) {
  if (status === "pass") {
    return "status-pill--success";
  }

  if (status === "warning") {
    return "status-pill--highlight";
  }

  return "status-pill--danger";
}

function TrainingQualificationPage() {
  const queue = useMemo(() => getQualificationQueue(demoOperators, demoHylioJob, REVIEW_DATE), []);
  const [operatorId, setOperatorId] = useState(queue[0]?.operatorId || demoOperators[0].id);
  const operator = demoOperators.find((item) => item.id === operatorId) || demoOperators[0];
  const plan = getOperatorQualificationPlan({ operator, job: demoHylioJob, now: REVIEW_DATE });
  const groupedGates = plan.gates.reduce((groups, gate) => {
    groups[gate.group] = [...(groups[gate.group] || []), gate];
    return groups;
  }, {});

  return (
    <Shell compact>
      <section className="section qualification-page">
        <Link className="back-link" to="/training">
          Back to training
        </Link>

        <div className="qualification-hero card">
          <div className="qualification-hero__copy">
            <span className="eyebrow">Operator qualification</span>
            <h1>Review, block, or clear operators before dispatch.</h1>
            <p>
              One workspace combines course completion, assessments, practical signoffs, credentials,
              aircraft authorization, payload scope, and job readiness gates.
            </p>
            <div className="qualification-actions">
              <Link className="button button--primary" to={`/operators/${operator.id}/training`}>
                Open operator file
              </Link>
              <Link className="button button--secondary" to="/jobs/1842/readiness">
                Compare job readiness
              </Link>
            </div>
          </div>

          <aside className="qualification-review-panel">
            <label className="field">
              <span>Candidate</span>
              <select value={operatorId} onChange={(event) => setOperatorId(event.target.value)}>
                {queue.map((item) => (
                  <option key={item.operatorId} value={item.operatorId}>
                    {item.operatorName}
                  </option>
                ))}
              </select>
            </label>
            <div>
              <span className="qualification-meta">Review state</span>
              <strong>{plan.reviewStatus.replaceAll("_", " ")}</strong>
              <p>{plan.summary}</p>
            </div>
          </aside>
        </div>

        <div className="qualification-metrics">
          <article className="qualification-metric card">
            <span>Completion</span>
            <strong>{plan.completionScore}%</strong>
            <p>{plan.counts.passed} of {plan.counts.total} gates passing</p>
          </article>
          <article className="qualification-metric card">
            <span>Blockers</span>
            <strong>{plan.counts.blockers}</strong>
            <p>Legal, safety, training, or authorization gates</p>
          </article>
          <article className="qualification-metric card">
            <span>Warnings</span>
            <strong>{plan.counts.warnings}</strong>
            <p>Administrative items to close before launch</p>
          </article>
          <article className="qualification-metric card">
            <span>Qualification</span>
            <strong>{plan.level.replaceAll("_", " ")}</strong>
            <p>{plan.canAssignToJob ? "Assignable for this job" : "Not assignable yet"}</p>
          </article>
        </div>

        <div className="qualification-layout">
          <article className="qualification-card card">
            <div className="table-card__header">
              <h2>Qualification gates</h2>
              <span>{demoHylioJob.aircraftModel} | {demoHylioJob.payloadType}</span>
            </div>

            <div className="qualification-gate-groups">
              {Object.entries(groupedGates).map(([group, gates]) => (
                <section className="qualification-gate-group" key={group}>
                  <h3>{group}</h3>
                  {gates.map((gate) => (
                    <div className="qualification-gate-row" key={gate.id}>
                      <div>
                        <strong>{gate.label}</strong>
                        <span>{gate.evidence}</span>
                      </div>
                      <span className={`status-pill ${statusClass(gate.status)}`}>{gate.status}</span>
                    </div>
                  ))}
                </section>
              ))}
            </div>
          </article>

          <aside className="qualification-card card">
            <h2>Next actions</h2>
            {plan.nextActions.length ? (
              <ol className="qualification-action-list">
                {plan.nextActions.map((item) => (
                  <li key={item.gateId}>
                    <span>{item.group}</span>
                    <strong>{item.label}</strong>
                    <p>{item.action}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p>No open actions. Submit the review package for lead/chief pilot approval.</p>
            )}

            <div className={`qualification-review-callout ${plan.canRequestReview ? "is-ready" : "is-blocked"}`}>
              <span>{plan.canRequestReview ? "Review package ready" : "Review package blocked"}</span>
              <strong>{plan.canRequestReview ? "Request qualification review" : "Close blockers first"}</strong>
              <p>
                {plan.canRequestReview
                  ? "A reviewer can approve the internal qualification and set expiration scope."
                  : "The review should stay locked until hard gates are cleared."}
              </p>
            </div>
          </aside>
        </div>
        <style>{css}</style>
      </section>
    </Shell>
  );
}

export default TrainingQualificationPage;
