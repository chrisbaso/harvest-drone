import { useEffect, useMemo, useState } from "react";
import {
  ACREAGE_OPTIONS,
  APPLICATION_METHOD_OPTIONS,
  CONTACT_METHOD_OPTIONS,
  CROP_OPTIONS,
  INTEREST_LEVEL_OPTIONS,
  PRIMARY_GOAL_OPTIONS,
  SMS_CONSENT_DISCLOSURE,
  TIMING_OPTIONS,
  createEmptyLeadDraft,
} from "../../../shared/harvestLeadEngine";
import { clearDraft, loadDraft, saveDraft } from "../../lib/harvestLocalStore";
import { SourceButton, SourceCard, SourceField } from "../source-review/SourceReviewPrimitives";

const STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
  "Wisconsin", "Wyoming",
];

const PRODUCT_OPTIONS = [
  "SOURCE only - $15/acre",
  "BLUEPRINT only - $11/acre",
  "Both (bundle) - $25/acre",
  "Both + Harvest Drone application - $23/acre",
];

const stepMeta = [
  { key: "acreageRange", title: "How many acres do you farm or manage?", helper: "This helps us understand opportunity size and how quickly a human review should happen." },
  { key: "crops", title: "What crops are you primarily focused on?", helper: "Pick the crop mix that best matches the acres you want reviewed." },
  { key: "location", title: "Where are your acres located?", helper: "Location helps us review application fit, timing, and practical follow-up." },
  { key: "applicationMethod", title: "How are you currently applying crop inputs?", helper: "This helps us understand how SOURCE could fit into your current operation." },
  { key: "product", title: "Which SOURCE offer are you considering?", helper: "Choose the product path you want Harvest Drone to price and review." },
  { key: "primaryGoal", title: "What are you most interested in?", helper: "Tell us what would make this conversation worth your time." },
  { key: "decisionTiming", title: "When are you looking to make a decision?", helper: "Timing matters when the next step is a real fit review instead of generic follow-up." },
  { key: "interestLevel", title: "How open are you to testing SOURCE or a drone-applied plan?", helper: "This helps us route strong-fit conversations quickly and educational leads more appropriately." },
  { key: "contact", title: "Where should we send the fit check?", helper: "We keep typing light until the final step so the process stays quick on mobile." },
];

const AUTO_ADVANCE_STEPS = new Set([
  "acreageRange",
  "applicationMethod",
  "primaryGoal",
  "decisionTiming",
  "interestLevel",
]);

function ChoiceGrid({ options, value, onSelect, multiSelect = false }) {
  const selectedValues = Array.isArray(value) ? value : [value];

  return (
    <div className="harvest-quiz__choice-grid">
      {options.map((option) => {
        const selected = selectedValues.includes(option);

        return (
          <button
            key={option}
            type="button"
            className={`harvest-quiz__choice${selected ? " is-selected" : ""}`}
            onClick={() => onSelect(option)}
          >
            <span>{option}</span>
            {multiSelect ? <small>{selected ? "Selected" : "Tap to add"}</small> : null}
          </button>
        );
      })}
    </div>
  );
}

function validateStep(stepIndex, draft) {
  const currentStep = stepMeta[stepIndex];

  if (!currentStep) {
    return "";
  }

  if (currentStep.key === "acreageRange" && !draft.acreageRange) {
    return "Choose the acreage range that best matches the farm.";
  }

  if (currentStep.key === "crops" && (!Array.isArray(draft.crops) || draft.crops.length === 0)) {
    return "Choose at least one crop focus.";
  }

  if (currentStep.key === "location") {
    if (!draft.state || !draft.county || !draft.zip) {
      return "State, county, and ZIP all help us route the review correctly.";
    }
  }

  if (currentStep.key === "applicationMethod" && !draft.applicationMethod) {
    return "Choose the application method that is closest to your current setup.";
  }

  if (currentStep.key === "product" && !draft.product) {
    return "Choose the SOURCE product path you want reviewed.";
  }

  if (currentStep.key === "primaryGoal" && !draft.primaryGoal) {
    return "Choose the goal that best describes what you want to evaluate.";
  }

  if (currentStep.key === "decisionTiming" && !draft.decisionTiming) {
    return "Choose the timing window that fits your decision horizon.";
  }

  if (currentStep.key === "interestLevel" && !draft.interestLevel) {
    return "Choose the interest level that best matches where you are today.";
  }

  if (currentStep.key === "contact") {
    if (!draft.firstName || !draft.lastName || !draft.email || !draft.phone || !draft.preferredContactMethod) {
      return "First name, last name, email, phone, and preferred contact method are required.";
    }

    if (draft.preferredContactMethod === "Text" && !draft.smsConsent) {
      return "Please confirm text-message consent if you want Harvest Drone to follow up by text.";
    }
  }

  return "";
}

function normalizeCropSelection(option, currentValue) {
  const current = Array.isArray(currentValue) ? currentValue : [];

  if (option === "Corn and soybeans") {
    return ["Corn and soybeans"];
  }

  const withoutCombined = current.filter((item) => item !== "Corn and soybeans");
  const exists = withoutCombined.includes(option);
  const next = exists
    ? withoutCombined.filter((item) => item !== option)
    : [...withoutCombined, option];

  if (next.includes("Corn") && next.includes("Soybeans")) {
    return ["Corn and soybeans"];
  }

  return next;
}

function LocationFields({ draft, onChange }) {
  return (
    <div className="harvest-quiz__field-grid">
      <SourceField label="State" htmlFor="state" required>
        <select
          id="state"
          name="state"
          className="source-ui__select"
          value={draft.state}
          onChange={onChange}
          required
        >
          <option value="">Select a state</option>
          {STATES.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </SourceField>

      <SourceField label="County" htmlFor="county" required>
        <input
          id="county"
          name="county"
          className="source-ui__input"
          value={draft.county}
          onChange={onChange}
          placeholder="McLeod County"
          required
        />
      </SourceField>

      <SourceField label="ZIP code" htmlFor="zip" required>
        <input
          id="zip"
          name="zip"
          className="source-ui__input"
          value={draft.zip}
          onChange={onChange}
          inputMode="numeric"
          placeholder="55336"
          required
        />
      </SourceField>
    </div>
  );
}

function ContactFields({ draft, onChange }) {
  return (
    <div className="harvest-quiz__contact-grid">
      <div className="harvest-quiz__field-grid harvest-quiz__field-grid--two">
        <SourceField label="First name" htmlFor="firstName" required>
          <input
            id="firstName"
            name="firstName"
            className="source-ui__input"
            value={draft.firstName}
            onChange={onChange}
            autoComplete="given-name"
            placeholder="Jake"
            required
          />
        </SourceField>
        <SourceField label="Last name" htmlFor="lastName" required>
          <input
            id="lastName"
            name="lastName"
            className="source-ui__input"
            value={draft.lastName}
            onChange={onChange}
            autoComplete="family-name"
            placeholder="Collins"
            required
          />
        </SourceField>
      </div>

      <div className="harvest-quiz__field-grid harvest-quiz__field-grid--two">
        <SourceField label="Email" htmlFor="email" required>
          <input
            id="email"
            name="email"
            type="email"
            className="source-ui__input"
            value={draft.email}
            onChange={onChange}
            autoComplete="email"
            inputMode="email"
            placeholder="jake@farm.com"
            required
          />
        </SourceField>
        <SourceField label="Phone" htmlFor="phone" required>
          <input
            id="phone"
            name="phone"
            className="source-ui__input"
            value={draft.phone}
            onChange={onChange}
            autoComplete="tel"
            inputMode="tel"
            placeholder="218-255-9111"
            required
          />
        </SourceField>
      </div>

      <div className="harvest-quiz__field-grid harvest-quiz__field-grid--two">
        <SourceField label="Farm / business name" htmlFor="farmName">
          <input
            id="farmName"
            name="farmName"
            className="source-ui__input"
            value={draft.farmName}
            onChange={onChange}
            placeholder="Collins Family Farms"
          />
        </SourceField>

        <SourceField label="Preferred contact method" htmlFor="preferredContactMethod" required>
          <select
            id="preferredContactMethod"
            name="preferredContactMethod"
            className="source-ui__select"
            value={draft.preferredContactMethod}
            onChange={onChange}
            required
          >
            <option value="">Choose a method</option>
            {CONTACT_METHOD_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </SourceField>
      </div>

      <SourceField
        label="Anything we should know about your acres, crop plan, or timing?"
        htmlFor="notes"
        hint="Optional, but helpful if timing, fertility, or application details need context."
      >
        <textarea
          id="notes"
          name="notes"
          className="source-ui__textarea"
          value={draft.notes}
          onChange={onChange}
          placeholder="Optional notes about acres, crop plan, field conditions, or timing."
        />
      </SourceField>

      <label className="harvest-quiz__consent">
        <input
          type="checkbox"
          name="smsConsent"
          checked={Boolean(draft.smsConsent)}
          onChange={onChange}
        />
        <span>{SMS_CONSENT_DISCLOSURE}</span>
      </label>
    </div>
  );
}

function renderStep(stepIndex, draft, onChange, onChoiceSelect) {
  const currentStep = stepMeta[stepIndex];

  if (!currentStep) {
    return null;
  }

  if (currentStep.key === "acreageRange") {
    return (
      <ChoiceGrid
        options={ACREAGE_OPTIONS}
        value={draft.acreageRange}
        onSelect={(option) => onChoiceSelect("acreageRange", option)}
      />
    );
  }

  if (currentStep.key === "crops") {
    return (
      <ChoiceGrid
        options={CROP_OPTIONS}
        value={draft.crops}
        multiSelect
        onSelect={(option) => onChoiceSelect("crops", option)}
      />
    );
  }

  if (currentStep.key === "location") {
    return <LocationFields draft={draft} onChange={onChange} />;
  }

  if (currentStep.key === "applicationMethod") {
    return (
      <ChoiceGrid
        options={APPLICATION_METHOD_OPTIONS}
        value={draft.applicationMethod}
        onSelect={(option) => onChoiceSelect("applicationMethod", option)}
      />
    );
  }

  if (currentStep.key === "product") {
    return (
      <ChoiceGrid
        options={PRODUCT_OPTIONS}
        value={draft.product}
        onSelect={(option) => onChoiceSelect("product", option)}
      />
    );
  }

  if (currentStep.key === "primaryGoal") {
    return (
      <ChoiceGrid
        options={PRIMARY_GOAL_OPTIONS}
        value={draft.primaryGoal}
        onSelect={(option) => onChoiceSelect("primaryGoal", option)}
      />
    );
  }

  if (currentStep.key === "decisionTiming") {
    return (
      <ChoiceGrid
        options={TIMING_OPTIONS}
        value={draft.decisionTiming}
        onSelect={(option) => onChoiceSelect("decisionTiming", option)}
      />
    );
  }

  if (currentStep.key === "interestLevel") {
    return (
      <ChoiceGrid
        options={INTEREST_LEVEL_OPTIONS}
        value={draft.interestLevel}
        onSelect={(option) => onChoiceSelect("interestLevel", option)}
      />
    );
  }

  return <ContactFields draft={draft} onChange={onChange} />;
}

function isAutoAdvanceStep(stepIndex) {
  return AUTO_ADVANCE_STEPS.has(stepMeta[stepIndex]?.key);
}

function QualificationFlow({ onSubmit, onTrackEvent }) {
  const [draft, setDraft] = useState(() => loadDraft() || createEmptyLeadDraft());
  const [currentStep, setCurrentStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const progress = useMemo(
    () => Math.round(((currentStep + 1) / stepMeta.length) * 100),
    [currentStep],
  );

  useEffect(() => {
    saveDraft(draft);
  }, [draft]);

  useEffect(() => {
    function handleBeforeUnload(event) {
      const isDirty = Object.values(draft).some((value) => {
        if (Array.isArray(value)) {
          return value.length > 0;
        }

        return Boolean(value);
      });

      if (!isDirty || isSubmitting) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [draft, isSubmitting]);

  function updateDraft(nextValues) {
    setDraft((current) => ({
      ...current,
      ...nextValues,
    }));
  }

  function handleChange(event) {
    updateDraft({
      [event.target.name]:
        event.target.type === "checkbox" ? event.target.checked : event.target.value,
    });
  }

  function markStepComplete(stepIndex) {
    if (!hasStarted) {
      setHasStarted(true);
      onTrackEvent?.("quiz_started", { step: stepIndex + 1 });
    }

    onTrackEvent?.("quiz_step_completed", {
      step: stepIndex + 1,
      step_key: stepMeta[stepIndex].key,
    });
  }

  function handleChoiceSelect(fieldName, option) {
    setErrorMessage("");

    if (fieldName === "crops") {
      updateDraft({
        crops: normalizeCropSelection(option, draft.crops),
      });
      return;
    }

    updateDraft({
      [fieldName]: option,
    });

    if (isAutoAdvanceStep(currentStep)) {
      markStepComplete(currentStep);
      setCurrentStep((value) => Math.min(value + 1, stepMeta.length - 1));
    }
  }

  async function handleNext() {
    const message = validateStep(currentStep, draft);

    if (message) {
      setErrorMessage(message);
      return;
    }

    markStepComplete(currentStep);
    setErrorMessage("");
    setCurrentStep((value) => Math.min(value + 1, stepMeta.length - 1));
  }

  function handleBack() {
    setErrorMessage("");
    setCurrentStep((value) => Math.max(value - 1, 0));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const message = validateStep(currentStep, draft);

    if (message) {
      setErrorMessage(message);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const result = await onSubmit(draft);
      clearDraft();
      return result;
    } catch (error) {
      setErrorMessage(error.message || "We couldn’t submit the fit check right now.");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SourceCard className="harvest-quiz" tone="strong">
      <div className="harvest-quiz__header">
        <div>
          <span className="source-ui__eyebrow">Qualification flow</span>
          <h3>{stepMeta[currentStep].title}</h3>
          <p>{stepMeta[currentStep].helper}</p>
        </div>
        <div className="harvest-quiz__progress-copy">
          Step {currentStep + 1} of {stepMeta.length}
        </div>
      </div>

      <div className="harvest-quiz__progress" aria-hidden="true">
        <div className="harvest-quiz__progress-bar" style={{ width: `${progress}%` }} />
      </div>

      <form className="harvest-quiz__form" onSubmit={handleSubmit}>
        {renderStep(currentStep, draft, handleChange, handleChoiceSelect)}

        {errorMessage ? <p className="harvest-quiz__error">{errorMessage}</p> : null}

        <div className="harvest-quiz__actions">
          <SourceButton
            type="button"
            variant="secondary"
            onClick={handleBack}
            disabled={currentStep === 0 || isSubmitting}
          >
            Back
          </SourceButton>

          {currentStep === stepMeta.length - 1 ? (
            <SourceButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Scoring your acres..." : "Check My Acres"}
            </SourceButton>
          ) : !isAutoAdvanceStep(currentStep) ? (
            <SourceButton type="button" onClick={handleNext}>
              Continue
            </SourceButton>
          ) : null}
        </div>
      </form>
    </SourceCard>
  );
}

export default QualificationFlow;
