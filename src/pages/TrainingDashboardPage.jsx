import { Link } from "react-router-dom";
import Shell from "../components/Shell";
import {
  computeHylioJobReadiness,
  demoHylioJob,
  demoOperators,
  findCourse,
  getCourseProgress,
  getExpiringCredentials,
  trainingCourses,
} from "../../shared/trainingProgram";
import "../styles/training.css";

function TrainingDashboardPage() {
  const operator = demoOperators[1];
  const readiness = computeHylioJobReadiness({ operator, job: demoHylioJob });
  const expiring = getExpiringCredentials(operator);

  return (
    <Shell compact>
      <section className="section training-page">
        <div className="training-hero card">
          <div>
            <span className="eyebrow">Training + qualification</span>
            <h1>Hylio readiness lives inside Harvest OS.</h1>
            <p>
              Complete lessons, prove field skills, upload credentials, and see what blocks
              assignment before a Hylio mission reaches dispatch.
            </p>
            <div className="training-actions">
              <Link className="button button--primary" to="/training/courses/hylio-operator-foundations">
                Continue training
              </Link>
              <Link className="button button--secondary" to="/training/qualification">
                Open qualification module
              </Link>
              <Link className="button button--secondary" to="/jobs/1842/readiness">
                View job readiness
              </Link>
            </div>
          </div>
          <aside className="training-status-panel">
            <span>Current operator</span>
            <strong>{operator.name}</strong>
            <p>{readiness.level.replaceAll("_", " ")}</p>
            <div className={`training-ready-badge ${readiness.ready ? "is-ready" : "is-blocked"}`}>
              {readiness.ready ? "Ready for assignment" : `${readiness.blockers.length} blockers`}
            </div>
          </aside>
        </div>

        <div className="training-grid">
          {trainingCourses.map((course) => {
            const progress = getCourseProgress(operator, course);
            return (
              <article className="training-card card" key={course.slug}>
                <span className="training-card__meta">{course.audience}</span>
                <h2>{course.title}</h2>
                <p>{course.description}</p>
                <div className="training-progress">
                  <span style={{ width: `${progress.percentage}%` }} />
                </div>
                <div className="training-card__footer">
                  <strong>{progress.percentage}% complete</strong>
                  <Link className="button button--secondary button--small" to={`/training/courses/${course.slug}`}>
                    Open
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        <div className="training-grid training-grid--two">
          <article className="training-card card">
            <h2>Readiness blockers</h2>
            {readiness.blockers.length ? (
              <ul className="training-list">
                {readiness.blockers.slice(0, 5).map((blocker) => (
                  <li key={blocker}>{blocker}</li>
                ))}
              </ul>
            ) : (
              <p>No assignment blockers for {demoHylioJob.title}.</p>
            )}
          </article>
          <article className="training-card card">
            <h2>Credentials</h2>
            <p>
              {expiring.length
                ? `${expiring.length} credential(s) expire in the next 45 days.`
                : "No credentials expire in the next 45 days for this demo operator."}
            </p>
            <Link className="button button--secondary button--small" to="/compliance/credentials">
              Open credential vault
            </Link>
          </article>
        </div>
      </section>
    </Shell>
  );
}

export default TrainingDashboardPage;
