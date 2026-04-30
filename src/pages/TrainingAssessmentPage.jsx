import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Shell from "../components/Shell";
import { findAssessment, scoreAssessment } from "../../shared/trainingProgram";
import { saveAssessmentAttempt } from "../lib/trainingLocalStore";
import "../styles/training.css";

function TrainingAssessmentPage() {
  const { id } = useParams();
  const assessment = findAssessment(id);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  if (!assessment) {
    return (
      <Shell compact>
        <section className="section training-page">
          <div className="card training-card">Assessment not found.</div>
        </section>
      </Shell>
    );
  }

  function handleSubmit(event) {
    event.preventDefault();
    const scored = scoreAssessment(assessment, answers);
    saveAssessmentAttempt({
      assessmentId: assessment.id,
      score: scored.score,
      passed: scored.passed,
      answers,
      attemptedAt: new Date().toISOString(),
    });
    setResult(scored);
  }

  return (
    <Shell compact>
      <section className="section training-page">
        <Link className="back-link" to="/training">
          Back to training
        </Link>
        <form className="training-assessment card" onSubmit={handleSubmit}>
          <span className="eyebrow">Assessment</span>
          <h1>{assessment.title}</h1>
          <p>Passing score: {assessment.passingScore}%. Retakes are {assessment.retakesAllowed ? "allowed" : "locked"}.</p>

          {assessment.questions.map((question) => (
            <fieldset className="training-question" key={question.id}>
              <legend>{question.prompt}</legend>
              {question.choices.map((choice, index) => (
                <label key={choice}>
                  <input
                    type="radio"
                    name={question.id}
                    value={index}
                    checked={Number(answers[question.id]) === index}
                    onChange={() => setAnswers((current) => ({ ...current, [question.id]: index }))}
                    required
                  />
                  <span>{choice}</span>
                </label>
              ))}
              {result ? <p className="training-explanation">{question.explanation}</p> : null}
            </fieldset>
          ))}

          {result ? (
            <div className={`training-result ${result.passed ? "is-pass" : "is-fail"}`}>
              <strong>{result.passed ? "Passed" : "Retake needed"}: {result.score}%</strong>
              <span>{result.correct} of {result.total} correct</span>
            </div>
          ) : null}

          <button className="button button--primary" type="submit">
            Submit assessment
          </button>
        </form>
      </section>
    </Shell>
  );
}

export default TrainingAssessmentPage;
