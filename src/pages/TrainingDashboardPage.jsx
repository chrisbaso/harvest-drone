import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Shell from "../components/Shell";
import {
  computeHylioJobReadiness,
  demoHylioJob,
  demoOperators,
  findCourse,
  getCourseProgress,
  getExpiringCredentials,
  mapTrainingRowsToOperator,
  trainingCourses,
} from "../../shared/trainingProgram";
import TrainingStyles from "../components/training/TrainingStyles";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

const DEMO_OPERATOR = demoOperators[1];

async function maybeLoadOperatorTable(tableName, operatorId, select = "*") {
  const { data, error } = await supabase
    .from(tableName)
    .select(select)
    .eq("operator_id", operatorId);

  if (error) {
    console.warn(`Unable to load ${tableName}`, error.message);
    return [];
  }

  return data ?? [];
}

function TrainingDashboardPage() {
  const { profile, user, isDemo, isOperator } = useAuth();
  const [liveOperator, setLiveOperator] = useState(null);
  const [isTrainingLoading, setIsTrainingLoading] = useState(false);
  const [trainingSource, setTrainingSource] = useState("demo");

  useEffect(() => {
    let isMounted = true;

    async function loadTrainingProfile() {
      if (!isOperator || isDemo || !profile?.email) {
        setLiveOperator(null);
        setTrainingSource("demo");
        setIsTrainingLoading(false);
        return;
      }

      setIsTrainingLoading(true);

      try {
        const { data: operatorLead, error: operatorError } = await supabase
          .from("operator_leads")
          .select("*")
          .eq("email", profile.email)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (operatorError || !operatorLead) {
          if (operatorError) console.warn("Unable to load operator lead", operatorError.message);
          if (!isMounted) return;
          setLiveOperator(null);
          setTrainingSource("demo");
          return;
        }

        const [
          enrollments,
          lessonProgress,
          assessmentAttempts,
          credentials,
          practicalEvaluations,
        ] = await Promise.all([
          maybeLoadOperatorTable("training_enrollments", operatorLead.id, "*, training_courses(slug,title)"),
          maybeLoadOperatorTable("lesson_progress", operatorLead.id, "*, training_lessons(slug,title)"),
          maybeLoadOperatorTable("assessment_attempts", operatorLead.id, "*, training_assessments(slug,title)"),
          maybeLoadOperatorTable("operator_credentials", operatorLead.id),
          maybeLoadOperatorTable("practical_evaluations", operatorLead.id),
        ]);

        const hasTrainingRows = [
          enrollments,
          lessonProgress,
          assessmentAttempts,
          credentials,
          practicalEvaluations,
        ].some((rows) => rows.length > 0);

        if (!isMounted) return;

        if (!hasTrainingRows) {
          setLiveOperator(null);
          setTrainingSource("demo");
          return;
        }

        setLiveOperator(
          mapTrainingRowsToOperator({
            profile: { ...profile, id: user?.id ?? profile.id },
            operatorLead,
            enrollments,
            lessonProgress,
            assessmentAttempts,
            credentials,
            practicalEvaluations,
          }),
        );
        setTrainingSource("live");
      } finally {
        if (isMounted) {
          setIsTrainingLoading(false);
        }
      }
    }

    loadTrainingProfile();

    return () => {
      isMounted = false;
    };
  }, [isDemo, isOperator, profile, user]);

  const operator = liveOperator ?? DEMO_OPERATOR;
  const readiness = useMemo(() => computeHylioJobReadiness({ operator, job: demoHylioJob }), [operator]);
  const expiring = useMemo(() => getExpiringCredentials(operator), [operator]);
  const featuredCourses = trainingCourses.slice(0, 3);

  return (
    <Shell compact>
      <section className="section training-page">
        <TrainingStyles />
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
              <Link className="button button--secondary" to="/training/courses/potato-application-specialist">
                Potato specialist
              </Link>
              <Link className="button button--secondary" to="/training/qualification">
                Open qualification module
              </Link>
            </div>
          </div>
          <aside className="training-status-panel">
            <span>{trainingSource === "live" ? "Live Supabase profile" : "Demo training profile"}</span>
            <strong>{operator.name}</strong>
            <p>{readiness.level.replaceAll("_", " ")}</p>
            <div className={`training-ready-badge ${readiness.ready ? "is-ready" : "is-blocked"}`}>
              {readiness.ready ? "Ready for assignment" : `${readiness.blockers.length} blockers`}
            </div>
          </aside>
        </div>

        {isTrainingLoading ? (
          <article className="training-card card">
            <span className="training-card__meta">Loading live training records</span>
            <h2>Checking enrollments, lessons, assessments, and credentials.</h2>
            <div className="training-progress">
              <span style={{ width: "68%" }} />
            </div>
          </article>
        ) : null}

        <div className="training-tabs" aria-label="Training sections">
          <Link className="training-tab is-active" to="/training">Classroom</Link>
          <Link className="training-tab" to="/training/qualification">Qualification</Link>
          <Link className="training-tab" to="/compliance/credentials">Credentials</Link>
          <Link className="training-tab" to="/jobs/1842/readiness">Job readiness</Link>
        </div>

        <div className="training-classroom">
          <main className="training-classroom__main">
            <div className="training-section-title">
              <div>
                <span className="eyebrow">Courses</span>
                <h2>Operator classroom</h2>
              </div>
              <span className="training-chip">{trainingCourses.length} courses</span>
            </div>

            <div className="training-grid">
              {featuredCourses.map((course, index) => {
                const progress = getCourseProgress(operator, course);
                return (
                  <article className="training-card training-course-card card" key={course.slug}>
                    <div className="training-course-card__icon">{String(index + 1).padStart(2, "0")}</div>
                    <div className="training-course-card__body">
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
                    </div>
                  </article>
                );
              })}
            </div>

            <article className="training-card card">
              <div className="training-section-title">
                <h2>All learning paths</h2>
                <span className="training-chip">Sequenced</span>
              </div>
              <div className="training-rail-list">
                {trainingCourses.map((course) => {
                  const progress = getCourseProgress(operator, course);
                  return (
                    <div className="training-lesson-row" key={`${course.slug}-row`}>
                      <div>
                        <strong>{course.title}</strong>
                        <span>{progress.completed} of {progress.total} required lessons complete | {course.estimatedDurationMinutes} min</span>
                      </div>
                      <Link className="button button--secondary button--small" to={`/training/courses/${course.slug}`}>
                        View
                      </Link>
                    </div>
                  );
                })}
              </div>
            </article>
          </main>

          <aside className="training-classroom__rail">
            <article className="training-card card">
              <span className="training-card__meta">Current operator</span>
              <h2>{operator.name}</h2>
              <div className="training-rail-list">
                <div className="training-rail-item">
                  <span>Qualification level</span>
                  <strong>{readiness.level.replaceAll("_", " ")}</strong>
                </div>
                <div className="training-rail-item">
                  <span>Assignment status</span>
                  <strong>{readiness.ready ? "Ready" : `${readiness.blockers.length} blockers`}</strong>
                </div>
                <div className="training-rail-item">
                  <span>Credential watch</span>
                  <strong>{expiring.length ? `${expiring.length} expiring soon` : "Current"}</strong>
                </div>
              </div>
            </article>

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
              <Link className="button button--secondary button--small" to="/training/qualification">
                Review gates
              </Link>
            </article>
          </aside>
        </div>
      </section>
    </Shell>
  );
}

export default TrainingDashboardPage;
