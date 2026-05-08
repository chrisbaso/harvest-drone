import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Shell from "../components/Shell";
import { useAuth } from "../context/AuthContext";
import { getLessonContent } from "../lib/trainingContent";
import {
  ACADEMY_CATEGORIES,
  academySeedComments,
  academySeedModules,
  computeAcademyCertification,
  getAcademyCategoryCounts,
  getAcademyModuleProgress,
  getAcademyResources,
  getAssignedAcademyModules,
} from "../../shared/academy";

const css = `
  .academy {
    --academy-ink: #111812;
    --academy-muted: #667067;
    --academy-line: #dde5dc;
    --academy-soft: #f5f8f2;
    --academy-green: #04783d;
    --academy-green-soft: #e7f5ec;
    --academy-gold: #d97706;
    --academy-red: #b91c1c;
    --academy-panel: #ffffff;
    color: var(--academy-ink);
    display: grid;
    gap: 1rem;
  }

  .academy button,
  .academy input,
  .academy textarea,
  .academy select {
    font: inherit;
  }

  .academy__layout {
    display: grid;
    gap: 1rem;
  }

  .academy__side,
  .academy__panel,
  .academy__hero,
  .academy__course,
  .academy__module,
  .academy__resource-table,
  .academy__discussion {
    border: 1px solid var(--academy-line);
    border-radius: 8px;
    background: var(--academy-panel);
    box-shadow: 0 18px 50px rgba(11, 24, 16, 0.08);
  }

  .academy__side {
    background: #07140f;
    color: #ecfdf3;
    padding: 1rem;
  }

  .academy__brand {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    margin-bottom: 1rem;
  }

  .academy__logo {
    display: grid;
    width: 2.2rem;
    height: 2.2rem;
    place-items: center;
    border-radius: 8px;
    background: #0b8f48;
    font-weight: 800;
  }

  .academy__brand strong,
  .academy h1,
  .academy h2,
  .academy h3,
  .academy h4 {
    margin: 0;
    letter-spacing: 0;
  }

  .academy__brand small,
  .academy p {
    margin: 0;
  }

  .academy__brand small,
  .academy__muted,
  .academy p {
    color: var(--academy-muted);
  }

  .academy__side .academy__muted {
    color: rgba(236, 253, 243, 0.68);
  }

  .academy__nav {
    display: grid;
    gap: 0.35rem;
  }

  .academy__nav button,
  .academy__tab,
  .academy__ghost-button,
  .academy__primary-button {
    min-height: 2.55rem;
    border-radius: 7px;
    border: 1px solid transparent;
    cursor: pointer;
  }

  .academy__nav button {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
    background: transparent;
    color: rgba(236, 253, 243, 0.78);
    padding: 0.65rem 0.75rem;
    text-align: left;
  }

  .academy__nav button.is-active,
  .academy__nav button:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #ffffff;
  }

  .academy__main {
    display: grid;
    gap: 1rem;
  }

  .academy__hero {
    display: grid;
    gap: 1rem;
    padding: 1rem;
  }

  .academy__hero-head {
    display: grid;
    gap: 0.45rem;
  }

  .academy__hero h1 {
    font-size: clamp(2rem, 5vw, 4.25rem);
    line-height: 0.95;
  }

  .academy__stats {
    display: grid;
    gap: 0.7rem;
  }

  .academy__stat {
    padding: 0.9rem;
    border: 1px solid var(--academy-line);
    border-radius: 8px;
    background: var(--academy-soft);
  }

  .academy__stat strong {
    display: block;
    font-size: 1.55rem;
  }

  .academy__progress {
    height: 0.45rem;
    overflow: hidden;
    border-radius: 999px;
    background: #e4eadf;
  }

  .academy__progress span {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: var(--academy-green);
  }

  .academy__grid {
    display: grid;
    gap: 1rem;
  }

  .academy__course-list,
  .academy__lesson-list,
  .academy__resource-list,
  .academy__checklist,
  .academy__comments {
    display: grid;
    gap: 0.7rem;
  }

  .academy__course {
    display: grid;
    gap: 0.7rem;
    padding: 0.9rem;
    text-align: left;
    border-color: var(--academy-line);
    cursor: pointer;
  }

  .academy__course.is-active {
    border-color: rgba(4, 120, 61, 0.45);
    background: var(--academy-green-soft);
  }

  .academy__course-top,
  .academy__row,
  .academy__section-head,
  .academy__resource-row,
  .academy__comment-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .academy__badge {
    display: inline-flex;
    align-items: center;
    width: fit-content;
    min-height: 1.65rem;
    padding: 0.2rem 0.55rem;
    border-radius: 999px;
    background: var(--academy-soft);
    color: var(--academy-green);
    font-size: 0.76rem;
    font-weight: 800;
  }

  .academy__course.is-active .academy__badge {
    background: #ffffff;
  }

  .academy__module,
  .academy__panel,
  .academy__discussion {
    padding: 1rem;
  }

  .academy__module {
    display: grid;
    gap: 1rem;
  }

  .academy__video {
    position: relative;
    overflow: hidden;
    border-radius: 8px;
    border: 1px solid var(--academy-line);
    background: #111812;
    aspect-ratio: 16 / 9;
  }

  .academy__video iframe {
    width: 100%;
    height: 100%;
    border: 0;
  }

  .academy__tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem;
    border-bottom: 1px solid var(--academy-line);
    padding-bottom: 0.55rem;
  }

  .academy__tab {
    padding: 0 0.8rem;
    background: transparent;
    color: var(--academy-muted);
  }

  .academy__tab.is-active {
    border-color: rgba(4, 120, 61, 0.28);
    background: var(--academy-green-soft);
    color: var(--academy-green);
  }

  .academy__lesson {
    display: grid;
    gap: 0.5rem;
    width: 100%;
    padding: 0.8rem;
    border: 1px solid var(--academy-line);
    border-left: 4px solid transparent;
    border-radius: 8px;
    background: #fff;
    text-align: left;
    cursor: pointer;
  }

  .academy__lesson.is-active {
    border-left-color: var(--academy-green);
    background: var(--academy-green-soft);
  }

  .academy__lesson.is-complete {
    border-left-color: #74b84d;
  }

  .academy__lesson-status {
    display: inline-grid;
    width: 1.4rem;
    height: 1.4rem;
    place-items: center;
    border-radius: 999px;
    border: 1px solid var(--academy-line);
    background: #fff;
    color: var(--academy-green);
    font-weight: 800;
  }

  .academy__content {
    display: grid;
    gap: 0.75rem;
    line-height: 1.65;
  }

  .academy__content h1,
  .academy__content h2,
  .academy__content h3 {
    margin-top: 0.35rem;
  }

  .academy__content ul {
    margin: 0;
    padding-left: 1.2rem;
  }

  .academy__resource-row,
  .academy__check-item,
  .academy__comment,
  .academy__cert-step {
    padding: 0.8rem;
    border: 1px solid var(--academy-line);
    border-radius: 8px;
    background: #fff;
  }

  .academy__resource-row a {
    color: var(--academy-green);
    font-weight: 800;
    text-decoration: none;
  }

  .academy__check-item {
    display: flex;
    align-items: center;
    gap: 0.65rem;
  }

  .academy__check {
    display: grid;
    flex: 0 0 auto;
    width: 1.35rem;
    height: 1.35rem;
    place-items: center;
    border-radius: 6px;
    border: 1px solid #93c5a8;
    background: var(--academy-green-soft);
    color: var(--academy-green);
    font-weight: 900;
  }

  .academy__primary-button,
  .academy__ghost-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    width: fit-content;
    padding: 0 0.9rem;
    font-weight: 800;
  }

  .academy__primary-button {
    border-color: var(--academy-green);
    background: var(--academy-green);
    color: #fff;
  }

  .academy__ghost-button {
    border-color: var(--academy-line);
    background: #fff;
    color: var(--academy-ink);
    text-decoration: none;
  }

  .academy__cert {
    display: grid;
    gap: 0.8rem;
  }

  .academy__cert-status {
    padding: 0.9rem;
    border-radius: 8px;
    background: #fff7ed;
    color: var(--academy-gold);
    font-weight: 900;
  }

  .academy__cert-status.is-certified {
    background: var(--academy-green-soft);
    color: var(--academy-green);
  }

  .academy__comment {
    display: grid;
    gap: 0.6rem;
  }

  .academy__reply {
    margin-left: 1rem;
    padding-left: 0.75rem;
    border-left: 3px solid var(--academy-green-soft);
  }

  .academy__question {
    display: grid;
    gap: 0.6rem;
  }

  .academy__question textarea {
    min-height: 6rem;
    resize: vertical;
    border: 1px solid var(--academy-line);
    border-radius: 8px;
    padding: 0.8rem;
    color: var(--academy-ink);
  }

  .academy__resource-table {
    overflow: hidden;
  }

  .academy__resource-table header,
  .academy__resource-table .academy__resource-row {
    border: 0;
    border-bottom: 1px solid var(--academy-line);
    border-radius: 0;
  }

  .academy__resource-table header {
    padding: 1rem;
  }

  .academy__resource-table .academy__resource-row:last-child {
    border-bottom: 0;
  }

  @media (min-width: 760px) {
    .academy__stats {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .academy__grid {
      grid-template-columns: minmax(17rem, 0.8fr) minmax(0, 1.5fr) minmax(18rem, 0.85fr);
      align-items: start;
    }
  }

  @media (min-width: 1080px) {
    .academy__layout {
      grid-template-columns: 15.5rem minmax(0, 1fr);
      align-items: start;
    }

    .academy__side {
      position: sticky;
      top: 1rem;
    }
  }
`;

const tabLabels = ["Overview", "Lessons", "Resources", "Checklist", "Q&A"];

function getStorageKey(userId) {
  return `harvest_academy_progress_v1:${userId || "demo"}`;
}

function loadCompletedLessonIds(key) {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function renderLessonContent(content) {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      if (line.startsWith("### ")) return <h3 key={index}>{line.replace("### ", "")}</h3>;
      if (line.startsWith("## ")) return <h2 key={index}>{line.replace("## ", "")}</h2>;
      if (line.startsWith("# ")) return <h1 key={index}>{line.replace("# ", "")}</h1>;
      if (line.startsWith("- ")) return <li key={index}>{line.replace("- ", "")}</li>;
      return <p key={index}>{line}</p>;
    });
}

function AcademyPage() {
  const { profile } = useAuth();
  const role = profile?.role || "operator";
  const assignedModules = useMemo(() => getAssignedAcademyModules({ role }), [role]);
  const categoryCounts = useMemo(() => getAcademyCategoryCounts(assignedModules), [assignedModules]);
  const resources = useMemo(() => getAcademyResources(assignedModules), [assignedModules]);
  const [activeCategory, setActiveCategory] = useState("Start Here");
  const [selectedModuleId, setSelectedModuleId] = useState(assignedModules[0]?.id);
  const selectedModule = assignedModules.find((module) => module.id === selectedModuleId) || assignedModules[0];
  const [selectedLessonId, setSelectedLessonId] = useState(selectedModule?.lessons?.[0]?.id);
  const selectedLesson = selectedModule?.lessons?.find((lesson) => lesson.id === selectedLessonId) || selectedModule?.lessons?.[0];
  const [activeTab, setActiveTab] = useState("Overview");
  const [question, setQuestion] = useState("");
  const [localQuestions, setLocalQuestions] = useState([]);
  const storageKey = getStorageKey(profile?.id);
  const [completedLessonIds, setCompletedLessonIds] = useState(() => loadCompletedLessonIds(storageKey));

  useEffect(() => {
    if (!selectedModule?.lessons?.some((lesson) => lesson.id === selectedLessonId)) {
      setSelectedLessonId(selectedModule?.lessons?.[0]?.id);
    }
  }, [selectedLessonId, selectedModule]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, JSON.stringify(completedLessonIds));
    }
  }, [completedLessonIds, storageKey]);

  const filteredModules = assignedModules.filter((module) => activeCategory === "All" || module.category === activeCategory);
  const certification = computeAcademyCertification({ modules: assignedModules, completedLessonIds });
  const selectedProgress = getAcademyModuleProgress(selectedModule, { completedLessonIds });
  const overallProgress = assignedModules.length
    ? Math.round(
        assignedModules.reduce((total, module) => total + getAcademyModuleProgress(module, { completedLessonIds }).percentage, 0) /
          assignedModules.length,
      )
    : 0;
  const continueModule = assignedModules.find((module) => !getAcademyModuleProgress(module, { completedLessonIds }).complete) || assignedModules[0];
  const moduleComments = [
    ...academySeedComments.filter((comment) => comment.moduleId === selectedModule?.id),
    ...localQuestions.filter((comment) => comment.moduleId === selectedModule?.id),
  ];
  const lessonContent = selectedLesson ? getLessonContent(selectedLesson) : "";

  function markLessonComplete() {
    if (!selectedLesson?.id) return;
    setCompletedLessonIds((current) => (current.includes(selectedLesson.id) ? current : [...current, selectedLesson.id]));
  }

  function submitQuestion(event) {
    event.preventDefault();
    const text = question.trim();
    if (!text || !selectedModule) return;

    setLocalQuestions((current) => [
      {
        id: `local-${Date.now()}`,
        moduleId: selectedModule.id,
        author: profile?.full_name || "Demo Operator",
        role: role === "admin" ? "Admin" : "Operator",
        text,
        replies: [],
        pinned: false,
      },
      ...current,
    ]);
    setQuestion("");
  }

  return (
    <Shell compact>
      <style>{css}</style>
      <section className="academy">
        <div className="academy__layout">
          <aside className="academy__side">
            <div className="academy__brand">
              <span className="academy__logo">HD</span>
              <span>
                <strong>Harvest Academy</strong>
                <small>Operator certification</small>
              </span>
            </div>
            <nav className="academy__nav" aria-label="Academy sections">
              <button className={activeCategory === "All" ? "is-active" : ""} type="button" onClick={() => setActiveCategory("All")}>
                <span>All Modules</span>
                <strong>{assignedModules.length}</strong>
              </button>
              {ACADEMY_CATEGORIES.map((category) => (
                <button
                  className={activeCategory === category ? "is-active" : ""}
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                >
                  <span>{category}</span>
                  <strong>{categoryCounts[category] || 0}</strong>
                </button>
              ))}
            </nav>
          </aside>

          <div className="academy__main">
            <section className="academy__hero">
              <div className="academy__hero-head">
                <span className="academy__badge">Harvest Drone OS Academy</span>
                <h1>Train operators like the operation depends on it.</h1>
                <p>
                  Assigned modules, SOPs, field guides, Q&A, and certification status in one clean command center.
                </p>
              </div>
              <div className="academy__stats">
                <div className="academy__stat">
                  <strong>{overallProgress}%</strong>
                  <span className="academy__muted">Overall progress</span>
                  <div className="academy__progress" aria-label="Overall progress">
                    <span style={{ width: `${overallProgress}%` }} />
                  </div>
                </div>
                <div className="academy__stat">
                  <strong>{certification.status}</strong>
                  <span className="academy__muted">Certification status</span>
                </div>
                <div className="academy__stat">
                  <strong>{resources.length}</strong>
                  <span className="academy__muted">Linked resources and SOPs</span>
                </div>
              </div>
            </section>

            <div className="academy__grid">
              <section className="academy__panel">
                <div className="academy__section-head">
                  <div>
                    <h2>Assigned Modules</h2>
                    <p>{activeCategory === "All" ? "All training assigned to your role." : activeCategory}</p>
                  </div>
                  <Link className="academy__ghost-button" to="/training/qualification">
                    Qualification
                  </Link>
                </div>
                <div className="academy__course-list">
                  {filteredModules.map((module) => {
                    const progress = getAcademyModuleProgress(module, { completedLessonIds });
                    return (
                      <button
                        className={`academy__course ${module.id === selectedModule?.id ? "is-active" : ""}`}
                        key={module.id}
                        type="button"
                        onClick={() => {
                          setSelectedModuleId(module.id);
                          setSelectedLessonId(module.lessons[0]?.id);
                          setActiveTab("Overview");
                        }}
                      >
                        <div className="academy__course-top">
                          <div>
                            <h3>{module.title}</h3>
                            <p>{module.description}</p>
                          </div>
                          <span className="academy__badge">{progress.percentage}%</span>
                        </div>
                        <div className="academy__progress">
                          <span style={{ width: `${progress.percentage}%` }} />
                        </div>
                        <small className="academy__muted">
                          {module.lessons.length} lessons | {module.estimatedMinutes} min | {module.category}
                        </small>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="academy__module">
                <div className="academy__section-head">
                  <div>
                    <span className="academy__badge">{selectedModule?.category}</span>
                    <h2>{selectedModule?.title}</h2>
                    <p>{selectedModule?.description}</p>
                  </div>
                  <span className="academy__badge">{selectedProgress.completedLessons} of {selectedProgress.totalLessons}</span>
                </div>

                {selectedLesson?.videoUrl ? (
                  <div className="academy__video">
                    <iframe
                      src={selectedLesson.videoUrl}
                      title={selectedLesson.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : null}

                <div className="academy__tabs">
                  {tabLabels.map((tab) => (
                    <button
                      className={`academy__tab ${activeTab === tab ? "is-active" : ""}`}
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {activeTab === "Overview" ? (
                  <div className="academy__content">
                    <h3>{selectedLesson?.title}</h3>
                    <p>{selectedLesson?.description}</p>
                    {renderLessonContent(lessonContent)}
                    <button className="academy__primary-button" type="button" onClick={markLessonComplete}>
                      Mark Lesson Complete
                    </button>
                  </div>
                ) : null}

                {activeTab === "Lessons" ? (
                  <div className="academy__lesson-list">
                    {selectedModule?.lessons.map((lesson) => {
                      const complete = completedLessonIds.includes(lesson.id);
                      return (
                        <button
                          className={`academy__lesson ${lesson.id === selectedLesson?.id ? "is-active" : ""} ${complete ? "is-complete" : ""}`}
                          key={lesson.id}
                          type="button"
                          onClick={() => {
                            setSelectedLessonId(lesson.id);
                            setActiveTab("Overview");
                          }}
                        >
                          <div className="academy__row">
                            <div>
                              <h3>{lesson.title}</h3>
                              <p>{lesson.description}</p>
                            </div>
                            <span className="academy__lesson-status">{complete ? "OK" : ""}</span>
                          </div>
                          <small className="academy__muted">{lesson.estimatedMinutes} min</small>
                        </button>
                      );
                    })}
                  </div>
                ) : null}

                {activeTab === "Resources" ? (
                  <div className="academy__resource-list">
                    {selectedModule?.resources.map((resource) => (
                      <div className="academy__resource-row" key={resource.id}>
                        <div>
                          <strong>{resource.title}</strong>
                          <p>{resource.category} | {resource.type}</p>
                        </div>
                        <Link to={resource.url}>Open</Link>
                      </div>
                    ))}
                  </div>
                ) : null}

                {activeTab === "Checklist" ? (
                  <div className="academy__checklist">
                    {selectedModule?.completionChecklist.map((item) => (
                      <div className="academy__check-item" key={item}>
                        <span className="academy__check">OK</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                ) : null}

                {activeTab === "Q&A" ? (
                  <div className="academy__discussion">
                    <form className="academy__question" onSubmit={submitQuestion}>
                      <h3>Ask a module question</h3>
                      <textarea value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="What should the lead operator clarify?" />
                      <button className="academy__primary-button" type="submit">Ask Question</button>
                    </form>
                    <div className="academy__comments">
                      {moduleComments.map((comment) => (
                        <article className="academy__comment" key={comment.id}>
                          <div className="academy__comment-head">
                            <strong>{comment.author}</strong>
                            <span className="academy__badge">{comment.pinned ? "Pinned" : comment.role}</span>
                          </div>
                          <p>{comment.text}</p>
                          {comment.replies?.map((reply) => (
                            <div className="academy__reply" key={reply.id}>
                              <strong>{reply.author}</strong>
                              <p>{reply.text}</p>
                            </div>
                          ))}
                        </article>
                      ))}
                    </div>
                  </div>
                ) : null}
              </section>

              <aside className="academy__cert">
                <section className="academy__panel">
                  <h2>Certification</h2>
                  <div className={`academy__cert-status ${certification.certified ? "is-certified" : ""}`}>{certification.status}</div>
                  <div className="academy__progress">
                    <span style={{ width: `${certification.percentage}%` }} />
                  </div>
                  <p>{certification.completedSteps} of {certification.totalSteps} required lessons complete</p>
                  <div className="academy__cert-step">Training modules complete</div>
                  <div className="academy__cert-step">Knowledge check passed</div>
                  <div className="academy__cert-step">Field review scheduled</div>
                  <button className="academy__primary-button" type="button" disabled={!certification.readyForFieldReview}>
                    Schedule Field Review
                  </button>
                </section>

                <section className="academy__resource-table">
                  <header>
                    <h2>SOP Library</h2>
                    <p>Resources linked to the assigned modules.</p>
                  </header>
                  {resources.slice(0, 7).map((resource) => (
                    <div className="academy__resource-row" key={resource.id}>
                      <div>
                        <strong>{resource.title}</strong>
                        <p>{resource.category} | {resource.moduleTitle}</p>
                      </div>
                      <Link to={resource.url}>{resource.type}</Link>
                    </div>
                  ))}
                </section>
              </aside>
            </div>
          </div>
        </div>
      </section>
    </Shell>
  );
}

export default AcademyPage;
