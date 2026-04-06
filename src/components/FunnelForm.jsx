import { useEffect, useState } from "react";
import FormField from "./FormField";

function buildInitialState(fields, initialValues = {}) {
  return fields.reduce((accumulator, field) => {
    accumulator[field.name] = initialValues[field.name] ?? "";
    return accumulator;
  }, {});
}

function FunnelForm({
  eyebrow = "Live funnel",
  title,
  description,
  fields,
  summaryTitle,
  nextSteps,
  successMessage,
  successDescription,
  onSubmitLead,
  initialValues,
  ctaLabel = "Submit",
  trustTitle,
  trustPoints = [],
  howItWorksTitle,
  howItWorksSteps = [],
  supportNote,
  introCtaLabel,
  formId = "funnel-form",
  submitInFlightLabel = "Sending your request...",
  successEyebrow = "Request received",
}) {
  const [formData, setFormData] = useState(() => buildInitialState(fields, initialValues));
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setFormData(buildInitialState(fields, initialValues));
  }, [fields, initialValues]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await onSubmitLead(formData);

      // Future CRM integration:
      // mirror the stored lead to HubSpot, Salesforce, or another CRM here.
      // Future messaging integration:
      // trigger post-submit email or SMS follow-up after the database write succeeds here.
      // Future routing integration:
      // hand off qualified leads to assignment, dispatch, or territory-routing workflows here.
      setSubmitted(true);
    } catch (error) {
      setErrorMessage(error.message ?? "Something went wrong while saving the lead.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="success-panel card">
        <span className="eyebrow">{successEyebrow}</span>
        <h2>{successMessage}</h2>
        <p>{successDescription}</p>
        <div className="summary-box">
          <span className="success-panel__status">Next step</span>
          <h3>{summaryTitle}</h3>
          <ul className="next-steps">
            {nextSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="funnel-stack">
      <div className="funnel-layout">
        <section className="funnel-copy card">
          <span className="eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>

          {supportNote ? <div className="funnel-support-note">{supportNote}</div> : null}

          {introCtaLabel ? (
            <a className="button button--primary funnel-intro-cta" href={`#${formId}`}>
              {introCtaLabel}
            </a>
          ) : null}
        </section>

        <section className="card">
          <form className="funnel-form" id={formId} onSubmit={handleSubmit}>
            <div className="funnel-form__header">
              <h2>Quick qualification</h2>
              <p>Share the essentials and we will move fast.</p>
            </div>
            <div className="form-grid">
              {fields.map((field) => (
                <div
                  key={field.name}
                  className={field.fullWidth ? "field-span-2" : ""}
                >
                  <FormField
                    {...field}
                    value={formData[field.name]}
                    onChange={handleChange}
                  />
                </div>
              ))}
            </div>

            {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

            <button
              className="button button--primary button--full"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? submitInFlightLabel : ctaLabel}
            </button>
            <p className="funnel-form__confidence">
              Built for fast follow-up. We only ask for what helps us route and qualify your request.
            </p>
          </form>
        </section>
      </div>

      <section className="funnel-detail-grid">
        <div className="summary-box">
          <h3>{summaryTitle}</h3>
          <ul className="next-steps">
            {nextSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </div>

        {howItWorksSteps.length ? (
          <div className="summary-box summary-box--secondary">
            <h3>{howItWorksTitle || "How it works"}</h3>
            <ol className="next-steps next-steps--ordered">
              {howItWorksSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        ) : null}

        {trustPoints.length ? (
          <div className="trust-stack">
            <h3>{trustTitle || "Why growers use Harvest Drone"}</h3>
            <div className="trust-grid">
              {trustPoints.map((point) => (
                <article className="trust-chip" key={point.title}>
                  <strong>{point.title}</strong>
                  <p>{point.description}</p>
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}

export default FunnelForm;
