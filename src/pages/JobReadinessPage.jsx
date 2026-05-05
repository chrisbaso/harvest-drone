import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Shell from "../components/Shell";
import { computeHylioJobReadiness, demoHylioJob, demoOperators } from "../../shared/trainingProgram";
import { getApplicationJobReadiness, rdoEnterpriseDemo } from "../../shared/enterpriseDivision";
import TrainingStyles from "../components/training/TrainingStyles";

function JobReadinessPage() {
  const { id } = useParams();
  const enterpriseJob = rdoEnterpriseDemo.applicationJobs.find((job) => job.id === id);
  const [operatorId, setOperatorId] = useState(enterpriseJob?.assignedOperatorId || demoOperators[1].id);
  const [aircraftId, setAircraftId] = useState(enterpriseJob?.aircraftId || "");
  const operatorOptions = enterpriseJob ? rdoEnterpriseDemo.operators : demoOperators;
  const operator = operatorOptions.find((item) => item.id === operatorId) || operatorOptions[0];
  const readiness = enterpriseJob
    ? getApplicationJobReadiness({
        orgId: "rdo",
        jobId: enterpriseJob.id,
        operatorId,
        aircraftId,
      })
    : computeHylioJobReadiness({ operator, job: demoHylioJob });
  const jobTitle = enterpriseJob?.title || demoHylioJob.title;

  return (
    <Shell compact>
      <section className="section training-page">
        <TrainingStyles />
        <Link className="back-link" to={enterpriseJob ? "/enterprise/rdo/readiness" : "/training"}>
          {enterpriseJob ? "Back to enterprise readiness" : "Back to training"}
        </Link>
        <div className="training-header card">
          <span className="eyebrow">Job readiness</span>
          <h1>Job #{id || demoHylioJob.id}: {jobTitle}</h1>
          <p>
            Assignment is blocked for legal and safety-critical failures. Administrative items can
            be surfaced as warnings according to Harvest policy.
          </p>
          <label className="field">
            <span>Candidate operator</span>
            <select value={operatorId} onChange={(event) => setOperatorId(event.target.value)}>
              {operatorOptions.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </label>
          {enterpriseJob ? (
            <label className="field">
              <span>Aircraft</span>
              <select value={aircraftId} onChange={(event) => setAircraftId(event.target.value)}>
                {rdoEnterpriseDemo.aircraft.map((aircraft) => (
                  <option key={aircraft.id} value={aircraft.id}>
                    {aircraft.tailNumber} | {aircraft.model}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
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
