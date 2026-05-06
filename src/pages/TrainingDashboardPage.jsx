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
              <Link className="button button--secondary" to="/training/qualification">
                Open qualification module
              </Link>
              <Link className="button button--secondary" to="/jobs/1842/readiness">
                View job readiness
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
