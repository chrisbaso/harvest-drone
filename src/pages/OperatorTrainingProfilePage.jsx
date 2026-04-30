import { Link, useParams } from "react-router-dom";
import Shell from "../components/Shell";
import {
  assessments,
  computeHylioJobReadiness,
  demoHylioJob,
  demoOperators,
  getCourseProgress,
  getLatestAttempt,
  normalizeCredentialStatus,
  practicalEvaluationTemplates,
  trainingCourses,
} from "../../shared/trainingProgram";
import "../styles/training.css";

function OperatorTrainingProfilePage() {
  const { id } = useParams();
  const operator = demoOperators.find((item) => item.id === id) || demoOperators[1];
  const readiness = computeHylioJobReadiness({ operator, job: demoHylioJob });

  return (
    <Shell compact>
      <section className="section training-page">
        <Link className="back-link" to="/admin/training">
          Back to admin training
        </Link>
        <div className="training-header card">
          <span className="eyebrow">Operator profile</span>
          <h1>{operator.name}</h1>
          <p>{operator.role} | {operator.state} | {readiness.level.replaceAll("_", " ")}</p>
        </div>

        <div className="training-grid training-grid--two">
          <article className="training-card card">
            <h2>Courses</h2>
            {trainingCourses.map((course) => {
              const progress = getCourseProgress(operator, course);
              return (
                <div className="training-mini-row" key={course.slug}>
                  <span>{course.title}</span>
                  <strong>{progress.percentage}%</strong>
                </div>
              );
            })}
          </article>

          <article className="training-card card">
            <h2>Assessments</h2>
            {assessments.map((assessment) => {
              const attempt = getLatestAttempt(operator, assessment.id);
              return (
                <div className="training-mini-row" key={assessment.id}>
                  <span>{assessment.title}</span>
                  <strong>{attempt ? `${attempt.score}%` : "Not started"}</strong>
                </div>
              );
            })}
          </article>

          <article className="training-card card">
            <h2>Practical signoffs</h2>
            {practicalEvaluationTemplates.map((template) => {
              const evaluation = operator.practicalEvaluations?.find((item) => item.templateId === template.id);
              return (
                <div className="training-mini-row" key={template.id}>
                  <span>{template.title}</span>
                  <strong>{evaluation?.status || "Needed"}</strong>
                </div>
              );
            })}
          </article>

          <article className="training-card card">
            <h2>Credentials</h2>
            {operator.credentials.map((credential, index) => (
              <div className="training-mini-row" key={`${credential.type}-${index}`}>
                <span>{credential.type.replaceAll("_", " ")}</span>
                <strong>{normalizeCredentialStatus(credential)}</strong>
              </div>
            ))}
          </article>
        </div>
      </section>
    </Shell>
  );
}

export default OperatorTrainingProfilePage;
