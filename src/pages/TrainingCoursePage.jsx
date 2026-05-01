import { Link, useParams } from "react-router-dom";
import Shell from "../components/Shell";
import { demoOperators, findCourse, getCourseProgress } from "../../shared/trainingProgram";
import TrainingStyles from "../components/training/TrainingStyles";

function TrainingCoursePage() {
  const { slug } = useParams();
  const course = findCourse(slug);
  const operator = demoOperators[1];

  if (!course) {
    return (
      <Shell compact>
        <section className="section training-page">
        <TrainingStyles />
          <div className="card training-card">Course not found.</div>
        </section>
      </Shell>
    );
  }

  const progress = getCourseProgress(operator, course);

  return (
    <Shell compact>
      <section className="section training-page">
        <TrainingStyles />
        <Link className="back-link" to="/training">
          Back to training
        </Link>
        <div className="training-header card">
          <span className="eyebrow">Course</span>
          <h1>{course.title}</h1>
          <p>{course.description}</p>
          <div className="training-progress">
            <span style={{ width: `${progress.percentage}%` }} />
          </div>
          <strong>{progress.completed} of {progress.total} required lessons complete</strong>
        </div>

        <div className="training-module-list">
          {course.modules.map((module, index) => (
            <article className="training-module card" key={module.slug}>
              <div className="training-module__number">{String(index + 1).padStart(2, "0")}</div>
              <div>
                <h2>{module.title}</h2>
                {module.lessons.map((lesson) => (
                  <div className="training-lesson-row" key={lesson.id}>
                    <div>
                      <strong>{lesson.title}</strong>
                      <span>{lesson.type.replace("_", " ")} | {lesson.minutes} min{lesson.officialMaterialRequired ? " | official Hylio material link required" : ""}</span>
                    </div>
                    <Link className="button button--secondary button--small" to={`/training/lessons/${lesson.id}`}>
                      Start
                    </Link>
                  </div>
                ))}
                {module.assessmentId ? (
                  <Link className="button button--primary button--small" to={`/training/assessments/${module.assessmentId}`}>
                    Take assessment
                  </Link>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </Shell>
  );
}

export default TrainingCoursePage;
