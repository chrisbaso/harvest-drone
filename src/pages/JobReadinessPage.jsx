import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Shell from "../components/Shell";
import { computeHylioJobReadiness, demoHylioJob, demoOperators } from "../../shared/trainingProgram";
import TrainingStyles from "../components/training/TrainingStyles";

function JobReadinessPage() {
  const { id } = useParams();
  const [operatorId, setOperatorId] = useState(demoOperators[1].id);
  const operator = demoOperators.find((item) => item.id === operatorId);
  const readiness = computeHylioJobReadiness({ operator, job: demoHylioJob });

  return (
    <Shell compact>
      <section className="section training-page">
        <TrainingStyles />
        <Link className="back-link" to="/training">
          Back to training
        </Link>
        <div className="training-header card">
          <span className="eyebrow">Job readiness</span>
          <h1>Job #{id || demoHylioJob.id}: {demoHylioJob.title}</h1>
          <p>
            Assignment is blocked for legal and safety-critical failures. Administrative items can
            be surfaced as warnings according to Harvest policy.
          </p>
          <label className="field">
            <span>Candidate operator</span>
            <select value={operatorId} onChange={(event) => setOperatorId(event.target.value)}>
              {demoOperators.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </label>
        </div>

        <article className={`training-readiness card ${readiness.ready ? "is-ready" : "is-blocked"}`}>
          <h2>{readiness.ready ? "Ready to assign" : `Cannot assign ${operator.name} to Job #${id || demoHylioJob.id}`}</h2>
          {readiness.blockers.length ? (
            <ul className="training-list">
              {readiness.blockers.map((blocker) => (
                <li key={blocker}>{blocker}</li>
              ))}
            </ul>
          ) : (
            <p>All hard readiness gates pass for this operator, aircraft, payload, and state.</p>
          )}
          {readiness.warnings.length ? (
            <>
              <h3>Warnings</h3>
              <ul className="training-list">
                {readiness.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </>
          ) : null}
        </article>
      </section>
    </Shell>
  );
}

export default JobReadinessPage;
