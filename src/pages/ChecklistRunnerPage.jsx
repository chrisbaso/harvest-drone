import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Shell from "../components/Shell";
import { checklistTemplates } from "../../shared/trainingProgram";
import { saveChecklistRun } from "../lib/trainingLocalStore";
import "../styles/training.css";

function ChecklistRunnerPage() {
  const { slug } = useParams();
  const checklist = checklistTemplates.find((item) => item.slug === slug);
  const [checked, setChecked] = useState({});
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const completeCount = useMemo(() => Object.values(checked).filter(Boolean).length, [checked]);

  if (!checklist) {
    return (
      <Shell compact>
        <section className="section training-page">
          <div className="card training-card">Checklist not found.</div>
        </section>
      </Shell>
    );
  }

  function handleSubmit(event) {
    event.preventDefault();
    saveChecklistRun({
      checklistSlug: checklist.slug,
      checked,
      notes,
      completedAt: new Date().toISOString(),
      acknowledgedBy: "Demo operator",
    });
    setSaved(true);
  }

  return (
    <Shell compact>
      <section className="section training-page">
        <Link className="back-link" to="/training">
          Back to training
        </Link>
        <form className="training-checklist card" onSubmit={handleSubmit}>
          <span className="eyebrow">Checklist runner</span>
          <h1>{checklist.title}</h1>
          <p>{completeCount} of {checklist.items.length} required items checked.</p>

          {checklist.items.map((item) => (
            <label className="training-check-item" key={item.id}>
              <input
                type="checkbox"
                checked={Boolean(checked[item.id])}
                onChange={(event) => setChecked((current) => ({ ...current, [item.id]: event.target.checked }))}
                required={item.required}
              />
              <span>{item.label}</span>
            </label>
          ))}

          <label className="field">
            <span>Notes / evidence reference</span>
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows="4" placeholder="Photo URL, file reference, job note, or exception detail" />
          </label>

          {saved ? <p className="training-result is-pass">Checklist saved locally with timestamp and acknowledgement.</p> : null}
          <button className="button button--primary" type="submit">
            Save checklist
          </button>
        </form>
      </section>
    </Shell>
  );
}

export default ChecklistRunnerPage;
