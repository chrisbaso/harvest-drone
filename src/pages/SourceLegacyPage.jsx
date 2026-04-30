import { useMemo, useRef, useState } from "react";
import Shell from "../components/Shell";
import { submitSourceOrder } from "../lib/submissions";

const formFields = [
  { label: "First name", name: "firstName", required: true, placeholder: "Emma", autoComplete: "given-name" },
  { label: "Email", name: "email", type: "email", required: true, placeholder: "emma@collinsfarms.com", autoComplete: "email", inputMode: "email" },
  { label: "State", name: "state", required: true, placeholder: "Illinois", autoComplete: "address-level1" },
  { label: "Crop type", name: "cropType", required: true, placeholder: "Corn, soybeans" },
  { label: "Total acres", name: "acres", type: "number", required: true, placeholder: "500", inputMode: "numeric", min: "0", step: "1" },
  {
    label: "Product",
    name: "product",
    type: "select",
    required: true,
    options: [
      "SOURCE only - $15/acre",
      "BLUEPRINT only - $11/acre",
      "Both (bundle) - $25/acre",
      "Both + Harvest Drone application - $23/acre",
    ],
  },
];

const faqs = [
  {
    q: "What is SOURCE?",
    a: "SOURCE is a synthetic soil activator from Sound Agriculture. It helps crops access nutrients already present in the field so growers can reduce dependency on synthetic fertilizer while maintaining or improving yield.",
  },
  {
    q: "How much does it cost per acre?",
    a: "Harvest Drone sells SOURCE and BLUEPRINT together for about $25 per acre. On a typical 500-acre order, that works out to roughly $12,500 total.",
  },
  {
    q: "When should I apply it?",
    a: "SOURCE is applied as a single foliar application during the growing season. We will follow up after your order to confirm crop timing, acres, and delivery details.",
  },
  {
    q: "Does it replace my current fertilizer program?",
    a: "It is designed to reduce dependency on synthetic fertilizer, not force a blind replacement. Many growers start with part of the program, evaluate results, and then dial in the next season based on field performance.",
  },
  {
    q: "How do I get it delivered?",
    a: "Harvest Drone follows up directly after the order comes in. We confirm acres, timing, and shipping details, then coordinate delivery or local fulfillment from current inventory.",
  },
];

const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Instrument+Sans:wght@400;500;600;700&display=swap');

.sp {
  --bg: #0C0F0A;
  --surface: #151A12;
  --card: #1A2015;
  --border: rgba(255,255,255,0.06);
  --text: #E8E6E1;
  --text-muted: #727966;
  --accent: #A3D977;
  --accent-dim: rgba(163,217,119,0.10);
  --accent-hover: #B8E68A;
  --danger: #F87171;
  --sans: 'Instrument Sans', system-ui, sans-serif;
  --serif: 'DM Serif Display', Georgia, serif;

  background: var(--bg);
  color: var(--text);
  font-family: var(--sans);
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
}

.sp__hero {
  max-width: 1200px;
  margin: 0 auto;
  padding: 56px 32px 64px;
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 56px;
  align-items: start;
}
.sp__hero-copy {
  padding-top: 16px;
}
.sp__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 20px;
}
.sp__eyebrow::before {
  content: '';
  width: 28px;
  height: 1px;
  background: var(--accent);
}
.sp__hero h1 {
  font-family: var(--serif);
  font-size: clamp(2rem, 4.5vw, 3.2rem);
  font-weight: 400;
  line-height: 1.12;
  color: #fff;
  margin: 0 0 20px;
  max-width: 720px;
}
.sp__hero h1 em {
  font-style: normal;
  color: var(--accent);
}
.sp__hero-sub {
  font-size: 17px;
  color: var(--text-muted);
  line-height: 1.7;
  max-width: 560px;
  margin: 0 0 28px;
}
.sp__hero-proof {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}
.sp__hero-proof-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.sp__hero-proof-item strong {
  font-family: var(--serif);
  font-size: 1.6rem;
  color: #fff;
}
.sp__hero-proof-item span {
  font-size: 12px;
  color: var(--text-muted);
}

.sp__form-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 36px 32px 32px;
  position: sticky;
  top: 24px;
}
.sp__form-header {
  margin-bottom: 24px;
}
.sp__form-header h2 {
  font-family: var(--serif);
  font-size: 1.35rem;
  font-weight: 400;
  color: #fff;
  margin: 0 0 6px;
}
.sp__form-header p {
  font-size: 14px;
  color: var(--text-muted);
  margin: 0;
}
.sp__form-grid {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.sp__field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.sp__field-label {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-muted);
  padding-left: 2px;
}
.sp__required {
  color: var(--accent);
  margin-left: 2px;
}
.sp__input {
  font-family: var(--sans);
  font-size: 15px;
  color: var(--text);
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px 14px;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  width: 100%;
}
.sp__input::placeholder {
  color: rgba(114,121,102,0.6);
}
.sp__input:focus {
  border-color: rgba(163,217,119,0.4);
  box-shadow: 0 0 0 3px var(--accent-dim);
}
.sp__order-note {
  font-size: 12px;
  color: var(--accent);
  background: var(--accent-dim);
  border: 1px solid rgba(163,217,119,0.14);
  border-radius: 8px;
  padding: 10px 12px;
  line-height: 1.6;
}
.sp__form-error {
  font-size: 13px;
  color: var(--danger);
  margin: 4px 0 0;
}
.sp__submit {
  width: 100%;
  padding: 14px;
  font-family: var(--sans);
  font-size: 15px;
  font-weight: 700;
  color: var(--bg);
  background: var(--accent);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
  margin-top: 6px;
}
.sp__submit:hover:not(:disabled) {
  background: var(--accent-hover);
  transform: translateY(-1px);
}
.sp__submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.sp__form-footer {
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 10px;
}

.sp__success {
  text-align: center;
  padding: 24px 0;
}
.sp__success-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--accent-dim);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}
.sp__success h2 {
  font-family: var(--serif);
  font-size: 1.3rem;
  font-weight: 400;
  color: #fff;
  margin: 0 0 10px;
}
.sp__success p {
  font-size: 14px;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.6;
}

.sp__section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px 72px;
}
.sp__section-title {
  font-family: var(--serif);
  font-size: clamp(1.4rem, 3vw, 2rem);
  font-weight: 400;
  color: #fff;
  margin: 0 0 40px;
  max-width: 560px;
  line-height: 1.25;
}

.sp__roi-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
}
.sp__roi-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
.sp__roi-inputs {
  padding: 32px;
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.sp__roi-results {
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.sp__metric {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.sp__metric span {
  font-size: 13px;
  color: var(--text-muted);
}
.sp__metric strong {
  font-family: var(--serif);
  font-size: 1.3rem;
  color: #fff;
}
.sp__metric--highlight {
  background: var(--accent-dim);
  border-color: rgba(163,217,119,0.15);
}
.sp__metric--highlight strong {
  color: var(--accent);
}
.sp__roi-note {
  font-size: 12px;
  color: var(--text-muted);
  margin: 4px 0 0;
  line-height: 1.6;
}

.sp__steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: var(--border);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}
.sp__step {
  background: var(--surface);
  padding: 36px 32px;
}
.sp__step-num {
  font-family: var(--serif);
  font-size: 2.4rem;
  color: var(--accent);
  opacity: 0.3;
  line-height: 1;
  margin-bottom: 16px;
}
.sp__step-title {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8px;
}
.sp__step-desc {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.6;
}

.sp__paths {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.sp__path-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 32px 28px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.sp__path-card h3 {
  font-size: 17px;
  font-weight: 700;
  color: #fff;
  margin: 0;
}
.sp__path-card p {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.65;
  margin: 0;
}
.sp__path-chip {
  width: fit-content;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent);
}
.sp__path-btn {
  width: fit-content;
  margin-top: 8px;
  padding: 12px 20px;
  font-family: var(--sans);
  font-size: 14px;
  font-weight: 700;
  color: var(--bg);
  background: var(--accent);
  border: none;
  border-radius: 10px;
  cursor: pointer;
}
.sp__path-btn:hover {
  background: var(--accent-hover);
}

.sp__faq-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.sp__faq {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}
.sp__faq-q {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px;
  font-family: var(--sans);
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
}
.sp__faq-chevron {
  flex-shrink: 0;
  transition: transform 0.2s;
  color: var(--text-muted);
}
.sp__faq-chevron.is-open {
  transform: rotate(180deg);
}
.sp__faq-a {
  padding: 0 24px 20px;
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.65;
  margin: 0;
}

.sp__bottom {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px 80px;
}
.sp__bottom-card {
  background: linear-gradient(135deg, rgba(163,217,119,0.08) 0%, transparent 60%);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 56px 48px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.sp__bottom-card h2 {
  font-family: var(--serif);
  font-size: clamp(1.4rem, 3vw, 2rem);
  font-weight: 400;
  color: #fff;
  margin: 0 0 12px;
  max-width: 620px;
  line-height: 1.25;
}
.sp__bottom-card p {
  font-size: 15px;
  color: var(--text-muted);
  margin: 0 0 28px;
  max-width: 520px;
}
.sp__bottom-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--sans);
  font-size: 15px;
  font-weight: 700;
  color: var(--bg);
  background: var(--accent);
  border: none;
  border-radius: 10px;
  padding: 14px 32px;
  cursor: pointer;
}
.sp__bottom-btn:hover {
  background: var(--accent-hover);
}

@media (max-width: 900px) {
  .sp__hero {
    grid-template-columns: 1fr;
    gap: 32px;
    padding: 40px 20px 48px;
  }
  .sp__form-card {
    position: static;
  }
  .sp__roi-layout,
  .sp__paths,
  .sp__steps {
    grid-template-columns: 1fr;
  }
  .sp__roi-inputs {
    border-right: none;
    border-bottom: 1px solid var(--border);
  }
}

@media (max-width: 600px) {
  .sp__hero {
    padding: 32px 16px 36px;
  }
  .sp__form-card {
    padding: 28px 20px 24px;
  }
  .sp__section,
  .sp__bottom {
    padding-left: 16px;
    padding-right: 16px;
  }
  .sp__bottom-card {
    padding: 40px 24px;
  }
}
`;

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function SourceLegacyPage() {
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    firstName: "",
    email: "",
    state: "",
    cropType: "",
    acres: "500",
    product: "Both (bundle) - $25/acre",
  });
  const [calculator, setCalculator] = useState({
    acres: "500",
    syntheticCostPerAcre: "120",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [openFaq, setOpenFaq] = useState(null);

  const orderType = Number(formData.acres) >= 1000 ? "volume_quote" : "standard";

  const roi = useMemo(() => {
    const acres = Number(calculator.acres) || 0;
    const syntheticCostPerAcre = Number(calculator.syntheticCostPerAcre) || 0;
    const sourceCost = acres * 25;
    const estimatedSavings = acres * Math.min(45, syntheticCostPerAcre * 0.35 || 0);
    const netBenefit = estimatedSavings - sourceCost;
    return { acres, sourceCost, estimatedSavings, netBenefit };
  }, [calculator]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  function handleCalculatorChange(event) {
    const { name, value } = event.target;
    setCalculator((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await submitSourceOrder(formData);
      setSubmitted(true);
    } catch (error) {
      setErrorMessage(error.message ?? "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <Shell compact>
      <style>{css}</style>
      <div className="sp">
        <section className="sp__hero">
          <div className="sp__hero-copy">
            <span className="sp__eyebrow">SOURCE by Sound Agriculture</span>
            <h1>Spend less on <em>synthetic fertilizer.</em> Get the same yield or better.</h1>
            <p className="sp__hero-sub">
              SOURCE is a synthetic soil activator that helps crops access nutrients
              already present in the field, giving growers a simpler way to
              cut synthetic input dependency without sacrificing performance.
            </p>
            <div className="sp__hero-proof">
              <div className="sp__hero-proof-item"><strong>~$25/acre</strong><span>SOURCE + BLUEPRINT combined</span></div>
              <div className="sp__hero-proof-item"><strong>Up to $45</strong><span>Synthetic savings per acre in some cases</span></div>
              <div className="sp__hero-proof-item"><strong>1 pass</strong><span>Single foliar application</span></div>
            </div>
          </div>

          <div className="sp__form-card" ref={formRef}>
            {submitted ? (
              <div className="sp__success">
                <div className="sp__success-icon">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#A3D977" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 14.5l5.5 5.5L22 9" />
                  </svg>
                </div>
                <h2>Your SOURCE order is in review.</h2>
                <p>
                  Jake will follow up to confirm acres, timing, and delivery details.
                  Current inventory is moving now, so we will reach out quickly.
                </p>
              </div>
            ) : (
              <form className="sp__form-grid" onSubmit={handleSubmit}>
                <div className="sp__form-header">
                  <h2>{orderType === "volume_quote" ? "Request your volume quote" : "Place your order"}</h2>
                  <p>{orderType === "volume_quote" ? "Large-acreage request. Jake will follow up with custom pricing and logistics." : "Current inventory is in stock and ready to allocate."}</p>
                </div>

                {formFields.map((field) => (
                  <div className="sp__field" key={field.name}>
                    <label className="sp__field-label">
                      {field.label}
                      {field.required && <span className="sp__required">*</span>}
                    </label>
                    {field.type === "select" ? (
                      <select
                        className="sp__input"
                        name={field.name}
                        required={field.required}
                        value={formData[field.name]}
                        onChange={handleChange}
                      >
                        {field.options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        className="sp__input"
                        name={field.name}
                        type={field.type ?? "text"}
                        required={field.required}
                        placeholder={field.placeholder}
                        autoComplete={field.autoComplete}
                        inputMode={field.inputMode}
                        min={field.min}
                        step={field.step}
                        value={formData[field.name]}
                        onChange={handleChange}
                      />
                    )}
                  </div>
                ))}

                {orderType === "volume_quote" && (
                  <div className="sp__order-note">
                    Orders over 1,000 acres are handled as a volume quote. Jake will
                    follow up directly with acreage planning, fulfillment timing, and
                    custom pricing.
                  </div>
                )}

                {errorMessage && <p className="sp__form-error">{errorMessage}</p>}

                <button className="sp__submit" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : orderType === "volume_quote" ? "Request My Volume Quote ->" : "Place My Order ->"}
                </button>

                <p className="sp__form-footer">Harvest Drone currently has 110 gallons available for immediate allocation.</p>
              </form>
            )}
          </div>
        </section>

        <section className="sp__section">
          <span className="sp__eyebrow">ROI math</span>
          <h2 className="sp__section-title">Model what a SOURCE program can look like on your acres.</h2>
          <div className="sp__roi-card">
            <div className="sp__roi-layout">
              <div className="sp__roi-inputs">
                <div className="sp__field">
                  <label className="sp__field-label">Total acres</label>
                  <input className="sp__input" type="number" name="acres" min="0" step="1" value={calculator.acres} onChange={handleCalculatorChange} />
                </div>
                <div className="sp__field">
                  <label className="sp__field-label">Current synthetic fertilizer cost per acre</label>
                  <input className="sp__input" type="number" name="syntheticCostPerAcre" min="0" step="1" value={calculator.syntheticCostPerAcre} onChange={handleCalculatorChange} />
                </div>
                <p className="sp__roi-note">This is a directional calculator. It uses the $25/acre SOURCE + BLUEPRINT price and a simplified savings estimate based on the input cost you provide.</p>
              </div>
              <div className="sp__roi-results">
                <div className="sp__metric sp__metric--highlight"><span>SOURCE cost</span><strong>{formatCurrency(roi.sourceCost)}</strong></div>
                <div className="sp__metric"><span>Estimated savings</span><strong>{formatCurrency(roi.estimatedSavings)}</strong></div>
                <div className="sp__metric sp__metric--highlight"><span>Net benefit</span><strong>{formatCurrency(roi.netBenefit)}</strong></div>
              </div>
            </div>
          </div>
        </section>

        <section className="sp__section">
          <span className="sp__eyebrow">How it works</span>
          <h2 className="sp__section-title">Three simple steps from foliar pass to lower input pressure.</h2>
          <div className="sp__steps">
            <div className="sp__step">
              <div className="sp__step-num">01</div>
              <div className="sp__step-title">Apply SOURCE as a foliar spray</div>
              <div className="sp__step-desc">One application, timed for the crop, layered into the season without adding operational complexity.</div>
            </div>
            <div className="sp__step">
              <div className="sp__step-num">02</div>
              <div className="sp__step-title">Microbes go to work</div>
              <div className="sp__step-desc">SOURCE activates soil microbes to fix atmospheric nitrogen and solubilize phosphorus your soil already holds.</div>
            </div>
            <div className="sp__step">
              <div className="sp__step-num">03</div>
              <div className="sp__step-title">Reduce synthetics based on results</div>
              <div className="sp__step-desc">Use field performance and economics to decide how aggressively to reduce your synthetic fertilizer program next season.</div>
            </div>
          </div>
        </section>

        <section className="sp__section">
          <span className="sp__eyebrow">Order paths</span>
          <h2 className="sp__section-title">Fast path for standard orders. Human follow-up for larger acreage.</h2>
          <div className="sp__paths">
            <div className="sp__path-card">
              <span className="sp__path-chip">Under 1,000 acres</span>
              <h3>Place the order now.</h3>
              <p>Send your acreage, crop, and state through the order form. We will review the request and lock in inventory while it is still available.</p>
            </div>
            <div className="sp__path-card">
              <span className="sp__path-chip">Over 1,000 acres</span>
              <h3>Request a volume quote.</h3>
              <p>Large-acreage orders are handled directly so Jake can confirm fulfillment timing, pricing, and any logistics questions before invoicing.</p>
              <button type="button" className="sp__path-btn" onClick={scrollToForm}>{"Request Volume Quote ->"}</button>
            </div>
          </div>
        </section>

        <section className="sp__section">
          <span className="sp__eyebrow">Grower proof</span>
          <h2 className="sp__section-title">What growers keep coming back for after the first season.</h2>
          <div className="sp__paths">
            <div className="sp__path-card">
              <h3>Yield upside without more synthetic spend</h3>
              <p>Growers have reported 3-4 bushel corn lift in some cases, plus meaningful fertilizer savings where SOURCE fit the operation well.</p>
            </div>
            <div className="sp__path-card">
              <h3>Performance that holds up in tough conditions</h3>
              <p>Results have stayed compelling enough that some growers move SOURCE across all acres after the first season once they see the field-by-field economics.</p>
            </div>
          </div>
        </section>

        <section className="sp__section">
          <span className="sp__eyebrow">Common questions</span>
          <h2 className="sp__section-title">What growers ask before they place an order.</h2>
          <div className="sp__faq-list">
            {faqs.map((faq, index) => (
              <div className="sp__faq" key={faq.q}>
                <button type="button" className="sp__faq-q" onClick={() => setOpenFaq(openFaq === index ? null : index)}>
                  {faq.q}
                  <svg className={`sp__faq-chevron${openFaq === index ? " is-open" : ""}`} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 6l4 4 4-4" />
                  </svg>
                </button>
                {openFaq === index && <p className="sp__faq-a">{faq.a}</p>}
              </div>
            ))}
          </div>
        </section>

        <section className="sp__bottom">
          <div className="sp__bottom-card">
            <h2>110 gallons available now. Once it is gone, lead times are 6-8 weeks.</h2>
            <p>Use current inventory while it is on hand. Every delayed decision risks pushing delivery into the next availability window.</p>
            <button type="button" className="sp__bottom-btn" onClick={scrollToForm}>{"Place My Order ->"}</button>
          </div>
        </section>
      </div>
    </Shell>
  );
}

export default SourceLegacyPage;
