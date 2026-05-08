import { useMemo, useState } from "react";
import Shell from "../components/Shell";
import {
  ACADEMY_CATEGORIES,
  academySeedModules,
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
  };
}

function AdminAcademyPage() {
  const [modules, setModules] = useState(() => academySeedModules.map((module) => ({ ...module, lessons: [...module.lessons], resources: [...module.resources] })));
  const [selectedId, setSelectedId] = useState(modules[0]?.id);
  const selectedModule = modules.find((module) => module.id === selectedId) || modules[0];
  const resources = useMemo(() => getAcademyResources(modules), [modules]);

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
