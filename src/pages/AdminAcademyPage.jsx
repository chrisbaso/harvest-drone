import { useMemo, useState } from "react";
import Shell from "../components/Shell";
import {
  ACADEMY_CATEGORIES,
  academySeedModules,
  getAcademyModuleQuizIssues,
  getAcademyResources,
} from "../../shared/academy";

const css = `
  .academy-admin {
    --admin-ink: #101610;
    --admin-muted: #647067;
    --admin-line: #dce5dc;
    --admin-panel: #ffffff;
    --admin-soft: #f5f8f2;
    --admin-green: #04783d;
    color: var(--admin-ink);
    display: grid;
    gap: 1rem;
  }

  .academy-admin h1,
  .academy-admin h2,
  .academy-admin h3,
  .academy-admin p {
    margin: 0;
    letter-spacing: 0;
  }

  .academy-admin p,
  .academy-admin small {
    color: var(--admin-muted);
  }

  .academy-admin button,
  .academy-admin input,
  .academy-admin textarea,
  .academy-admin select {
    font: inherit;
  }

  .academy-admin__hero,
  .academy-admin__panel,
  .academy-admin__list-item {
    border: 1px solid var(--admin-line);
    border-radius: 8px;
    background: var(--admin-panel);
    box-shadow: 0 18px 48px rgba(11, 24, 16, 0.08);
  }

  .academy-admin__hero {
    display: grid;
    gap: 0.75rem;
    padding: 1.2rem;
  }

  .academy-admin__hero h1 {
    max-width: 14ch;
    font-size: clamp(2rem, 5vw, 4rem);
    line-height: 0.95;
  }

  .academy-admin__grid {
    display: grid;
    gap: 1rem;
  }

  .academy-admin__panel {
    display: grid;
    gap: 0.8rem;
    padding: 1rem;
  }

  .academy-admin__section-head,
  .academy-admin__row,
  .academy-admin__actions {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .academy-admin__actions {
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .academy-admin__list {
    display: grid;
    gap: 0.6rem;
  }

  .academy-admin__list-item {
    display: grid;
    gap: 0.55rem;
    width: 100%;
    padding: 0.85rem;
    text-align: left;
  }

  button.academy-admin__list-item {
    cursor: pointer;
  }

  .academy-admin__list-item.is-active {
    border-color: rgba(4, 120, 61, 0.45);
    background: #e7f5ec;
  }

  .academy-admin__badge {
    display: inline-flex;
    align-items: center;
    width: fit-content;
    min-height: 1.55rem;
    padding: 0.2rem 0.5rem;
    border-radius: 999px;
    background: var(--admin-soft);
    color: var(--admin-green);
    font-size: 0.74rem;
    font-weight: 800;
  }

  .academy-admin__form {
    display: grid;
    gap: 0.75rem;
  }

  .academy-admin__field {
    display: grid;
    gap: 0.35rem;
  }

  .academy-admin__field label {
    font-size: 0.78rem;
    font-weight: 800;
    color: var(--admin-muted);
    text-transform: uppercase;
  }

  .academy-admin__field input,
  .academy-admin__field textarea,
  .academy-admin__field select {
    width: 100%;
    border: 1px solid var(--admin-line);
    border-radius: 8px;
    padding: 0.75rem;
    color: var(--admin-ink);
    background: #ffffff;
  }

  .academy-admin__field textarea {
    min-height: 6rem;
    resize: vertical;
  }

  .academy-admin__button,
  .academy-admin__button-secondary {
    min-height: 2.45rem;
    border-radius: 7px;
    padding: 0 0.85rem;
    border: 1px solid var(--admin-line);
    cursor: pointer;
    font-weight: 800;
  }

  .academy-admin__button {
    border-color: var(--admin-green);
    background: var(--admin-green);
    color: #fff;
  }

  .academy-admin__button-secondary {
    background: #fff;
    color: var(--admin-ink);
  }

  .academy-admin__button:disabled,
  .academy-admin__button-secondary:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }

  .academy-admin__issues {
    display: grid;
    gap: 0.4rem;
    padding: 0.75rem;
    border: 1px solid #f4b740;
    border-radius: 8px;
    background: #fff7df;
  }

  .academy-admin__issues--ok {
    border-color: #b7e3c6;
    background: #edf8f0;
  }

  .academy-admin__issue {
    color: #7a4b00;
    font-size: 0.82rem;
    font-weight: 700;
  }

  .academy-admin__issues--ok .academy-admin__issue {
    color: var(--admin-green);
  }

  .academy-admin__option-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 0.5rem;
    align-items: center;
  }

  .academy-admin__resource {
    display: grid;
    gap: 0.25rem;
    padding: 0.75rem;
    border: 1px solid var(--admin-line);
    border-radius: 8px;
    background: var(--admin-soft);
  }

  @media (min-width: 980px) {
    .academy-admin__grid {
      grid-template-columns: minmax(18rem, 0.75fr) minmax(0, 1.25fr);
      align-items: start;
    }
  }
`;

function createDraftModule(index) {
  return {
    id: `academy-draft-${Date.now()}`,
    slug: `new-module-${index}`,
    title: "New Academy Module",
    description: "Describe the outcome operators should achieve.",
    category: "Operator Training",
    estimatedMinutes: 30,
    assignedRoles: ["operator", "dealer", "admin"],
    certificationRequired: false,
    sortOrder: index,
    moduleQuizPassingScorePct: 80,
    lessons: [
      {
        id: `academy-draft-lesson-${Date.now()}`,
        title: "New lesson",
        description: "Lesson description",
        estimatedMinutes: 10,
        content: "Add lesson content, video URL, checklist expectations, and linked resources.",
      },
    ],
    resources: [],
    completionChecklist: ["Review lesson", "Attach SOP or field guide"],
    moduleQuiz: [
      {
        question: "What must the operator demonstrate to pass this module?",
        options: ["The required operating standard for this module.", "Only that the page was opened.", "Only that a video exists."],
        correctIndex: 0,
      },
    ],
  };
}

function AdminAcademyPage() {
  const [modules, setModules] = useState(() =>
    academySeedModules.map((module) => ({
      ...module,
      lessons: [...module.lessons],
      resources: [...module.resources],
      moduleQuiz: (module.moduleQuiz || []).map((question) => ({ ...question, options: [...question.options] })),
    })),
  );
  const [selectedId, setSelectedId] = useState(modules[0]?.id);
  const selectedModule = modules.find((module) => module.id === selectedId) || modules[0];
  const resources = useMemo(() => getAcademyResources(modules), [modules]);
  const selectedQuizIssues = useMemo(() => getAcademyModuleQuizIssues(selectedModule), [selectedModule]);

  function updateSelected(patch) {
    setModules((current) => current.map((module) => (module.id === selectedModule.id ? { ...module, ...patch } : module)));
  }

  function addModule() {
    const draft = createDraftModule(modules.length + 1);
    setModules((current) => [...current, draft]);
    setSelectedId(draft.id);
  }

  function moveModule(direction) {
    const index = modules.findIndex((module) => module.id === selectedModule.id);
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= modules.length) return;

    setModules((current) => {
      const copy = [...current];
      const [item] = copy.splice(index, 1);
      copy.splice(nextIndex, 0, item);
      return copy.map((module, orderIndex) => ({ ...module, sortOrder: orderIndex + 1 }));
    });
  }

  function addLesson() {
    const lesson = {
      id: `${selectedModule.id}-lesson-${Date.now()}`,
      title: "New lesson",
      description: "Add a concise lesson outcome.",
      estimatedMinutes: 10,
      content: "Add written lesson content here.",
    };
    updateSelected({ lessons: [...selectedModule.lessons, lesson] });
  }

  function updateLesson(lessonId, patch) {
    updateSelected({
      lessons: selectedModule.lessons.map((lesson) => (lesson.id === lessonId ? { ...lesson, ...patch } : lesson)),
    });
  }

  function addQuizQuestion() {
    const question = {
      question: "New module quiz question",
      options: ["Correct answer", "Distractor answer", "Distractor answer"],
      correctIndex: 0,
    };
    updateSelected({ moduleQuiz: [...(selectedModule.moduleQuiz || []), question] });
  }

  function removeQuizQuestion(questionIndex) {
    if ((selectedModule.moduleQuiz || []).length <= 1) return;
    updateSelected({ moduleQuiz: (selectedModule.moduleQuiz || []).filter((_, index) => index !== questionIndex) });
  }

  function updateQuizQuestion(questionIndex, patch) {
    updateSelected({
      moduleQuiz: (selectedModule.moduleQuiz || []).map((question, index) => (index === questionIndex ? { ...question, ...patch } : question)),
    });
  }

  function updateQuizOption(questionIndex, optionIndex, value) {
    updateSelected({
      moduleQuiz: (selectedModule.moduleQuiz || []).map((question, index) => {
        if (index !== questionIndex) return question;
        const options = [...question.options];
        options[optionIndex] = value;
        return { ...question, options };
      }),
    });
  }

  function addQuizOption(questionIndex) {
    updateSelected({
      moduleQuiz: (selectedModule.moduleQuiz || []).map((question, index) => (
        index === questionIndex ? { ...question, options: [...question.options, "New option"] } : question
      )),
    });
  }

  function removeQuizOption(questionIndex, optionIndex) {
    updateSelected({
      moduleQuiz: (selectedModule.moduleQuiz || []).map((question, index) => {
        if (index !== questionIndex || question.options.length <= 2) return question;
        const options = question.options.filter((_, currentIndex) => currentIndex !== optionIndex);
        const correctIndex = question.correctIndex === optionIndex
          ? 0
          : question.correctIndex > optionIndex
            ? question.correctIndex - 1
            : question.correctIndex;
        return {
          ...question,
          options,
          correctIndex: Math.min(correctIndex, options.length - 1),
        };
      }),
    });
  }

  function updatePassingScore(value) {
    const numericValue = Number(value);
    const clampedValue = Number.isFinite(numericValue) ? Math.min(100, Math.max(1, Math.round(numericValue))) : 80;
    updateSelected({ moduleQuizPassingScorePct: clampedValue });
  }

  return (
    <Shell compact>
      <style>{css}</style>
      <section className="academy-admin">
        <div className="academy-admin__hero">
          <span className="academy-admin__badge">Academy Admin</span>
          <h1>Build operator training without clutter.</h1>
          <p>
            Create, edit, reorder, and review modules for the Harvest Drone OS Academy. Demo edits are local until saved through the Academy tables.
          </p>
          <div className="academy-admin__actions">
            <button className="academy-admin__button" type="button" onClick={addModule}>Add Module</button>
            <button className="academy-admin__button-secondary" type="button" onClick={() => moveModule(-1)}>Move Up</button>
            <button className="academy-admin__button-secondary" type="button" onClick={() => moveModule(1)}>Move Down</button>
          </div>
        </div>

        <div className="academy-admin__grid">
          <section className="academy-admin__panel">
            <div className="academy-admin__section-head">
              <div>
                <h2>Modules</h2>
                <p>{modules.length} seeded modules</p>
              </div>
              <span className="academy-admin__badge">{resources.length} resources</span>
            </div>
            <div className="academy-admin__list">
              {modules.map((module) => (
                <button
                  className={`academy-admin__list-item ${module.id === selectedModule?.id ? "is-active" : ""}`}
                  key={module.id}
                  type="button"
                  onClick={() => setSelectedId(module.id)}
                >
                  <div className="academy-admin__row">
                    <div>
                      <h3>{module.title}</h3>
                      <p>{module.category}</p>
                    </div>
                    <span className="academy-admin__badge">{module.lessons.length} lessons</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="academy-admin__panel">
            <div className="academy-admin__section-head">
              <div>
                <h2>Edit Module</h2>
                <p>{selectedModule?.slug}</p>
              </div>
              <span className="academy-admin__badge">{selectedModule?.estimatedMinutes} min</span>
            </div>

            <div className="academy-admin__form">
              <div className="academy-admin__field">
                <label htmlFor="module-title">Title</label>
                <input id="module-title" value={selectedModule?.title || ""} onChange={(event) => updateSelected({ title: event.target.value })} />
              </div>
              <div className="academy-admin__field">
                <label htmlFor="module-description">Description</label>
                <textarea id="module-description" value={selectedModule?.description || ""} onChange={(event) => updateSelected({ description: event.target.value })} />
              </div>
              <div className="academy-admin__field">
                <label htmlFor="module-category">Category</label>
                <select id="module-category" value={selectedModule?.category || ""} onChange={(event) => updateSelected({ category: event.target.value })}>
                  {ACADEMY_CATEGORIES.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="academy-admin__field">
                <label htmlFor="module-minutes">Estimated minutes</label>
                <input
                  id="module-minutes"
                  min="1"
                  type="number"
                  value={selectedModule?.estimatedMinutes || 0}
                  onChange={(event) => updateSelected({ estimatedMinutes: Number(event.target.value) })}
                />
              </div>
              <div className="academy-admin__field">
                <label htmlFor="module-quiz-score">Module quiz passing score</label>
                <input
                  id="module-quiz-score"
                  max="100"
                  min="1"
                  type="number"
                  value={selectedModule?.moduleQuizPassingScorePct || 80}
                  onChange={(event) => updatePassingScore(event.target.value)}
                />
              </div>
            </div>

            <div className="academy-admin__section-head">
              <div>
                <h2>Lessons</h2>
                <p>Add written content, embedded video URLs, and resources.</p>
              </div>
              <button className="academy-admin__button-secondary" type="button" onClick={addLesson}>Add Lesson</button>
            </div>
            <div className="academy-admin__list">
              {selectedModule?.lessons.map((lesson) => (
                <article className="academy-admin__list-item" key={lesson.id}>
                  <div className="academy-admin__field">
                    <label htmlFor={`${lesson.id}-title`}>Lesson title</label>
                    <input id={`${lesson.id}-title`} value={lesson.title} onChange={(event) => updateLesson(lesson.id, { title: event.target.value })} />
                  </div>
                  <div className="academy-admin__field">
                    <label htmlFor={`${lesson.id}-description`}>Description</label>
                    <input id={`${lesson.id}-description`} value={lesson.description || ""} onChange={(event) => updateLesson(lesson.id, { description: event.target.value })} />
                  </div>
                  <div className="academy-admin__field">
                    <label htmlFor={`${lesson.id}-video`}>Embedded video URL</label>
                    <input id={`${lesson.id}-video`} value={lesson.videoUrl || ""} onChange={(event) => updateLesson(lesson.id, { videoUrl: event.target.value })} />
                  </div>
                  <small>{lesson.contentPath ? `Linked content file: ${lesson.contentPath}` : "Written content is stored with this lesson."}</small>
                </article>
              ))}
            </div>

            <div className="academy-admin__section-head">
              <div>
                <h2>Module Quiz</h2>
                <p>Pilots must pass this quiz before the module is complete.</p>
              </div>
              <button className="academy-admin__button-secondary" type="button" onClick={addQuizQuestion}>Add Question</button>
            </div>
            <div className={`academy-admin__issues ${selectedQuizIssues.length === 0 ? "academy-admin__issues--ok" : ""}`}>
              {selectedQuizIssues.length === 0 ? (
                <div className="academy-admin__issue">Quiz gate is valid and can be used for certification evidence.</div>
              ) : (
                selectedQuizIssues.map((issue) => (
                  <div className="academy-admin__issue" key={issue}>{issue}</div>
                ))
              )}
            </div>
            <div className="academy-admin__list">
              {(selectedModule?.moduleQuiz || []).map((question, questionIndex) => (
                <article className="academy-admin__list-item" key={`${selectedModule.id}-quiz-${questionIndex}`}>
                  <div className="academy-admin__row">
                    <strong>Question {questionIndex + 1}</strong>
                    <button
                      className="academy-admin__button-secondary"
                      disabled={(selectedModule.moduleQuiz || []).length <= 1}
                      type="button"
                      onClick={() => removeQuizQuestion(questionIndex)}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="academy-admin__field">
                    <label htmlFor={`${selectedModule.id}-quiz-${questionIndex}`}>Question</label>
                    <input
                      id={`${selectedModule.id}-quiz-${questionIndex}`}
                      value={question.question}
                      onChange={(event) => updateQuizQuestion(questionIndex, { question: event.target.value })}
                    />
                  </div>
                  {question.options.map((option, optionIndex) => (
                    <div className="academy-admin__field" key={`${selectedModule.id}-quiz-${questionIndex}-option-${optionIndex}`}>
                      <label htmlFor={`${selectedModule.id}-quiz-${questionIndex}-option-${optionIndex}`}>
                        {optionIndex === question.correctIndex ? "Correct answer" : `Option ${optionIndex + 1}`}
                      </label>
                      <div className="academy-admin__option-row">
                        <input
                          id={`${selectedModule.id}-quiz-${questionIndex}-option-${optionIndex}`}
                          value={option}
                          onChange={(event) => updateQuizOption(questionIndex, optionIndex, event.target.value)}
                        />
                        <button
                          className="academy-admin__button-secondary"
                          disabled={question.options.length <= 2}
                          type="button"
                          onClick={() => removeQuizOption(questionIndex, optionIndex)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  <button className="academy-admin__button-secondary" type="button" onClick={() => addQuizOption(questionIndex)}>Add Option</button>
                  <div className="academy-admin__field">
                    <label htmlFor={`${selectedModule.id}-quiz-${questionIndex}-correct`}>Correct option</label>
                    <select
                      id={`${selectedModule.id}-quiz-${questionIndex}-correct`}
                      value={question.correctIndex}
                      onChange={(event) => updateQuizQuestion(questionIndex, { correctIndex: Number(event.target.value) })}
                    >
                      {question.options.map((_, optionIndex) => (
                        <option key={optionIndex} value={optionIndex}>Option {optionIndex + 1}</option>
                      ))}
                    </select>
                  </div>
                </article>
              ))}
            </div>

            <div className="academy-admin__section-head">
              <div>
                <h2>Resource Library Preview</h2>
                <p>SOPs, field guides, SOURCE materials, and certification resources.</p>
              </div>
            </div>
            <div className="academy-admin__list">
              {resources.slice(0, 8).map((resource) => (
                <div className="academy-admin__resource" key={resource.id}>
                  <strong>{resource.title}</strong>
                  <small>{resource.category} | {resource.type} | {resource.moduleTitle}</small>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </Shell>
  );
}

export default AdminAcademyPage;
