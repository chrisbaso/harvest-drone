import { Link } from "react-router-dom";
import Shell from "../components/Shell";
import {
  assessments,
  computeHylioJobReadiness,
  demoHylioJob,
  demoOperators,
  getCourseProgress,
  practicalEvaluationTemplates,
  trainingCourses,
} from "../../shared/trainingProgram";
import "../styles/training.css";

function AdminTrainingPage() {
  const rows = demoOperators.map((operator) => ({
    operator,
    readiness: computeHylioJobReadiness({ operator, job: demoHylioJob }),
    foundations: getCourseProgress(operator, trainingCourses[0]),
  }));

  return (
    <Shell compact>
      <section className="section training-page">
        <div className="training-header card">
          <span className="eyebrow">Admin training</span>
          <h1>Qualification matrix</h1>
          <p>
            Admins, lead operators, chief pilots, and compliance users can review training progress,
            failed assessments, missing credentials, practical signoffs, and readiness blockers.
          </p>
        </div>

        <div className="training-grid">
          <article className="training-card card">
            <span className="training-card__meta">Curriculum</span>
            <strong>{trainingCourses.length}</strong>
            <p>Seeded Hylio courses</p>
          </article>
          <article className="training-card card">
            <span className="training-card__meta">Assessments</span>
            <strong>{assessments.length}</strong>
            <p>Quiz/scenario engines</p>
          </article>
          <article className="training-card card">
            <span className="training-card__meta">Rubrics</span>
            <strong>{practicalEvaluationTemplates.length}</strong>
            <p>Practical signoff templates</p>
          </article>
        </div>

        <article className="table-card card">
          <div className="table-card__header">
            <h3>Operators</h3>
            <div className="inline-actions">
              <Link className="button button--secondary button--small" to="/training/qualification">
                Qualification module
              </Link>
              <Link className="button button--secondary button--small" to="/compliance/credentials">
                Credential vault
              </Link>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Operator</th>
                  <th>Role</th>
                  <th>Foundations</th>
                  <th>Level</th>
                  <th>Readiness</th>
                  <th>Profile</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ operator, readiness, foundations }) => (
                  <tr key={operator.id}>
                    <td>{operator.name}</td>
                    <td>{operator.role}</td>
                    <td>{foundations.percentage}%</td>
                    <td>{readiness.level.replaceAll("_", " ")}</td>
                    <td>{readiness.ready ? "Ready" : `${readiness.blockers.length} blockers`}</td>
                    <td>
                      <Link className="button button--secondary button--small" to={`/operators/${operator.id}/training`}>
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </Shell>
  );
}

export default AdminTrainingPage;
