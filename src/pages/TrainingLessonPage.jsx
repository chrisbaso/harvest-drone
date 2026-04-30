import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Shell from "../components/Shell";
import { findLesson, flattenLessons } from "../../shared/trainingProgram";
import { getCompletedLessons, markLessonComplete } from "../lib/trainingLocalStore";
import "../styles/training.css";

function TrainingLessonPage() {
  const { id } = useParams();
  const lesson = findLesson(id);
  const lessons = useMemo(() => flattenLessons().filter((item) => item.courseSlug === lesson?.courseSlug), [lesson]);
  const lessonIndex = lessons.findIndex((item) => item.id === id);
  const [completedLessons, setCompletedLessons] = useState(getCompletedLessons);

  if (!lesson) {
    return (
      <Shell compact>
        <section className="section training-page">
          <div className="card training-card">Lesson not found.</div>
        </section>
      </Shell>
    );
  }

  const previousLesson = lessonIndex > 0 ? lessons[lessonIndex - 1] : null;
  const nextLesson = lessonIndex >= 0 && lessonIndex < lessons.length - 1 ? lessons[lessonIndex + 1] : null;
  const isComplete = completedLessons.includes(lesson.id);

  function handleComplete() {
    setCompletedLessons(markLessonComplete(lesson.id));
  }

  return (
    <Shell compact>
      <section className="section training-page">
        <Link className="back-link" to={`/training/courses/${lesson.courseSlug}`}>
          Back to course
        </Link>
        <article className="training-reader card">
          <span className="eyebrow">{lesson.type.replace("_", " ")}</span>
          <h1>{lesson.title}</h1>
          <p className="training-reader__meta">{lesson.courseTitle} | {lesson.moduleTitle}</p>
          <div className="training-reader__body">
            <p>{lesson.content}</p>
            {lesson.officialMaterialRequired ? (
              <div className="training-callout">
                <strong>Official Hylio material required</strong>
                <p>
                  This Harvest lesson wraps official Hylio materials without copying them into the repo.
                  Use the external material link or upload slot before supervisor signoff.
                </p>
                {lesson.officialLink ? (
                  <a className="button button--secondary button--small" href={lesson.officialLink} target="_blank" rel="noreferrer">
                    Open official material
                  </a>
                ) : null}
              </div>
            ) : null}
            {lesson.checklistSlug ? (
              <Link className="button button--secondary" to={`/training/checklists/${lesson.checklistSlug}`}>
                Open checklist runner
              </Link>
            ) : null}
          </div>
          <div className="training-reader__actions">
            {previousLesson ? <Link className="button button--secondary" to={`/training/lessons/${previousLesson.id}`}>Previous</Link> : <span />}
            <button className="button button--primary" type="button" onClick={handleComplete}>
              {isComplete ? "Completed" : "Mark complete"}
            </button>
            {nextLesson ? <Link className="button button--secondary" to={`/training/lessons/${nextLesson.id}`}>Next</Link> : <span />}
          </div>
        </article>
      </section>
    </Shell>
  );
}

export default TrainingLessonPage;
