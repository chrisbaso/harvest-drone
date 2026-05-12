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
  const totalLessons = course.modules.flatMap((module) => module.lessons).length;

  return (
    <Shell compact>
      <section className="section training-page">
        <TrainingStyles />
        <Link className="back-link" to="/training">
          Back to training
        </Link>
        <div className="training-course-shell">
          <aside className="training-course-sidebar training-classroom__rail">
            <article className="training-card card">
              <span className="training-card__meta">Course</span>
              <h2>{course.title}</h2>
              <p>{course.audience}</p>
              <div className="training-progress">
                <span style={{ width: `${progress.percentage}%` }} />
              </div>
              <div className="training-rail-list">
                <div className="training-rail-item">
                  <span>Progress</span>
                  <strong>{progress.percentage}%</strong>
                </div>
                <div className="training-rail-item">
                  <span>Lessons</span>
                  <strong>{totalLessons}</strong>
                </div>
                <div className="training-rail-item">
                  <span>Required complete</span>
                  <strong>{progress.completed} / {progress.total}</strong>
                </div>
              </div>
            </article>
          </aside>

          <main className="training-classroom__main">
            <div className="training-header card">
              <span className="eyebrow">Classroom course</span>
              <h1>{course.title}</h1>
              <p>{course.description}</p>
              <strong>{progress.completed} of {progress.total} required lessons complete</strong>
            </div>

            <div className="training-tabs" aria-label="Course sections">
              <a className="training-tab is-active" href="#modules">Modules</a>
              <Link className="training-tab" to="/training/qualification">Qualification</Link>
              <Link className="training-tab" to="/compliance/credentials">Credentials</Link>
            </div>

            <div className="training-module-list" id="modules">
              {course.modules.map((module, index) => (
                <article className="training-module card" key={module.slug}>
                  <div className="training-module__number">{String(index + 1).padStart(2, "0")}</div>
                  <div>
                    <div className="training-section-title">
                      <h2>{module.title}</h2>
                      <span className="training-chip">{module.lessons.length} lesson{module.lessons.length === 1 ? "" : "s"}</span>
                    </div>
                    {module.lessons.map((lesson, lessonIndex) => (
                      <div className="training-lesson-row" key={lesson.id}>
                        <span className="training-lesson-index">{lessonIndex + 1}</span>
                        <div>
                          <strong>{lesson.title}</strong>
                          <span>{lesson.type.replace("_", " ")} | {lesson.minutes} min{lesson.contentPath ? " | folder content linked" : ""}{lesson.officialMaterialRequired ? " | official Hylio material required" : ""}</span>
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
          </main>
        </div>
      </section>
    </Shell>
  );
}

export default TrainingCoursePage;
