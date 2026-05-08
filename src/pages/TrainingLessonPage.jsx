import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Shell from "../components/Shell";
import { findLesson, flattenLessons } from "../../shared/trainingProgram";
import { getLessonContent } from "../lib/trainingContent";
import { getCompletedLessons, markLessonComplete } from "../lib/trainingLocalStore";
import TrainingStyles from "../components/training/TrainingStyles";

function renderInline(text) {
  const parts = String(text).split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function MarkdownContent({ content }) {
  const blocks = String(content || "")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks.map((block, index) => {
    if (block.startsWith("# ")) {
      return <h2 key={index}>{block.replace(/^#\s+/, "")}</h2>;
    }
    if (block.startsWith("## ")) {
      return <h2 key={index}>{block.replace(/^##\s+/, "")}</h2>;
    }
    if (block.startsWith("### ")) {
      return <h3 key={index}>{block.replace(/^###\s+/, "")}</h3>;
    }
    if (block.split("\n").every((line) => line.trim().startsWith("- "))) {
      return (
        <ul className="training-markdown-list" key={index}>
          {block.split("\n").map((line, itemIndex) => (
            <li key={itemIndex}>{renderInline(line.trim().replace(/^-\s+/, ""))}</li>
          ))}
        </ul>
      );
    }
    return <p key={index}>{renderInline(block)}</p>;
  });
}

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
        <TrainingStyles />
          <div className="card training-card">Lesson not found.</div>
        </section>
      </Shell>
    );
  }

  const previousLesson = lessonIndex > 0 ? lessons[lessonIndex - 1] : null;
  const nextLesson = lessonIndex >= 0 && lessonIndex < lessons.length - 1 ? lessons[lessonIndex + 1] : null;
  const isComplete = completedLessons.includes(lesson.id);
  const content = getLessonContent(lesson);

  function handleComplete() {
    setCompletedLessons(markLessonComplete(lesson.id));
  }

  return (
    <Shell compact>
      <section className="section training-page">
        <TrainingStyles />
        <Link className="back-link" to={`/training/courses/${lesson.courseSlug}`}>
          Back to course
        </Link>
        <div className="training-reader-shell">
          <article className="training-reader card">
            <span className="eyebrow">{lesson.type.replace("_", " ")}</span>
            <h1>{lesson.title}</h1>
            <p className="training-reader__meta">{lesson.courseTitle} | {lesson.moduleTitle} | {lesson.minutes} min</p>
            <div className="training-reader__body">
              {lesson.contentPath ? <p className="training-reader__source">Folder content: {lesson.contentPath}</p> : null}
              <MarkdownContent content={content} />
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

          <aside className="training-reader-sidebar training-classroom__rail">
            <article className="training-card card">
              <span className="training-card__meta">Lesson path</span>
              <h2>{lesson.courseTitle}</h2>
              <div className="training-rail-list">
                <div className="training-rail-item">
                  <span>Module</span>
                  <strong>{lesson.moduleTitle}</strong>
                </div>
                <div className="training-rail-item">
                  <span>Status</span>
                  <strong>{isComplete ? "Completed" : "In progress"}</strong>
                </div>
              </div>
            </article>
            <nav className="training-lesson-nav card" aria-label="Course lessons">
              {lessons.map((item, index) => (
                <Link className={item.id === lesson.id ? "is-active" : ""} key={item.id} to={`/training/lessons/${item.id}`}>
                  <strong>{String(index + 1).padStart(2, "0")} {item.title}</strong>
                  <span>{item.moduleTitle}</span>
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      </section>
    </Shell>
  );
}

export default TrainingLessonPage;
