import { useMemo, useRef, useState } from "react";
import Shell from "../components/Shell";
import {
  calculateHylioRevenuePotential,
  HYLIO_CALCULATOR_DEFAULTS,
} from "../lib/hylioPipeline";
import { submitHylioLead } from "../lib/submissions";

/* -------------------------------------------
   FORM FIELDS (reduced)
   ------------------------------------------- */

const formFields = [
  { label: "Name", name: "name", required: true, placeholder: "Landon Pierce", autoComplete: "name" },
  { label: "Email", name: "email", type: "email", required: true, placeholder: "landon@agbusiness.com", autoComplete: "email", inputMode: "email" },
  { label: "State", name: "state", required: true, placeholder: "Kansas", autoComplete: "address-level1" },
  { label: "Acreage access", name: "acreageAccess", type: "number", required: true, placeholder: "5,000", inputMode: "numeric", min: "0", step: "1" },
  {
    label: "Budget range", name: "budgetRange", required: true, type: "select",
    options: ["$25k-$35k", "$35k-$50k", "$50k-$65k", "$65k+"],
  },
];

const calculatorFields = [
  { label: "Acres per month", name: "acresPerMonth", min: "0", step: "1" },
  { label: "Revenue per acre ($)", name: "revenuePerAcre", min: "0", step: "0.01" },
  { label: "Active months/year", name: "monthsActivePerYear", min: "1", step: "1" },
  { label: "Equipment cost ($)", name: "equipmentCost", min: "0", step: "1" },
  { label: "Annual growth (%)", name: "growthFactor", min: "0", step: "1" },
];

/* -------------------------------------------
   CONTENT
   ------------------------------------------- */

const advantages = [
  { label: "Made in USA", title: "American-built for American agriculture.", desc: "Starting in 2027, regulations require all commercial ag drones to be American-made. Hylio is already compliant - no transition risk, no scramble to replace equipment.", accent: "#F87171" },
  { label: "Built for ag", title: "Purpose-designed for row-crop application.", desc: "Not a camera drone repurposed for spraying. Hylio AG Series is engineered specifically for agricultural application - autonomous flight, high-capacity tanks, and commercial-grade reliability.", accent: "#FBBF24" },
  { label: "Revenue asset", title: "Think ROI per acre, not just equipment cost.", desc: "A Hylio drone isn't a purchase - it's a revenue-generating asset. Application fees, input distribution margin, and data services stack on every acre you fly.", accent: "#A3D977" },
];

const objections = [
  { q: "What happens in 2027 with the drone regulations?", a: "Starting in 2027, new regulations will require all commercial agricultural drones operating in the US to be American-made. DJI and other Chinese-manufactured drones - which currently dominate the market - will no longer be compliant. Hylio is already American-built, so operators who invest now won't face a forced equipment replacement later." },
  { q: "What's the real payback timeline?", a: "It depends on your acreage and pricing, but the calculator above gives you a personalized estimate. Most operators see payback within 6-14 months at moderate utilization. After payback, the drone generates pure margin on every acre serviced." },
  { q: "Can I stack revenue beyond just spraying?", a: "Yes - that's the model. Application fees are the base layer. On top of that, you can distribute SOURCE and BLUEPRINT biologicals ($2-9/acre margin) and offer EarthOptics soil scanning services. The same grower relationship generates three revenue streams annually." },
  { q: "Do I need drone experience?", a: "It helps, but it's not required. Hylio drones are designed for autonomous operation. Harvest Drone provides onboarding support, and the network gives you access to demand and routing infrastructure from day one." },
  { q: "What if demand in my area is low?", a: "That's what the territory review is for. We check demand density, existing operator coverage, and acreage potential before you commit. If the numbers don't support the investment, we'll tell you." },
];

/* -------------------------------------------
   HELPERS
   ------------------------------------------- */

function fmt(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function fmtMonths(value) {
  if (!value || !Number.isFinite(value)) return "-";
  return `${value.toFixed(1)} mo`;
}

/* -------------------------------------------
   STYLES
   ------------------------------------------- */

const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Instrument+Sans:wght@400;500;600;700&display=swap');

.hp{--hp-bg:#0C0F0A;--hp-surface:#151A12;--hp-card:#1A2015;--hp-border:rgba(255,255,255,0.06);--hp-border-hover:rgba(255,255,255,0.12);--hp-text:#E8E6E1;--hp-text-muted:#727966;--hp-accent:#FBBF24;--hp-accent-hover:#FCD34D;--hp-accent-dim:rgba(251,191,36,0.10);--hp-green:#A3D977;--hp-danger:#F87171;--hp-sans:'Instrument Sans',system-ui,sans-serif;--hp-serif:'DM Serif Display',Georgia,serif;background:var(--hp-bg);color:var(--hp-text);font-family:var(--hp-sans);-webkit-font-smoothing:antialiased;min-height:100vh}

/* Hero */
.hp__hero{max-width:1200px;margin:0 auto;padding:56px 32px 40px}
.hp__hero-eyebrow{display:inline-flex;align-items:center;gap:10px;font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--hp-accent);margin-bottom:20px}
.hp__hero-eyebrow::before{content:'';width:28px;height:1px;background:var(--hp-accent)}
.hp__hero h1{font-family:var(--hp-serif);font-size:clamp(2rem,4.5vw,3rem);font-weight:400;line-height:1.12;color:#fff;margin:0 0 16px;max-width:720px}
.hp__hero h1 em{font-style:normal;color:var(--hp-accent)}
.hp__hero-sub{font-size:17px;color:var(--hp-text-muted);line-height:1.7;max-width:600px;margin:0}

/* Section */
.hp__section{max-width:1200px;margin:0 auto;padding:0 32px 72px}
.hp__section-eyebrow{display:inline-flex;align-items:center;gap:10px;font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--hp-accent);margin-bottom:12px}
.hp__section-eyebrow::before{content:'';width:20px;height:1px;background:var(--hp-accent)}
.hp__section-title{font-family:var(--hp-serif);font-size:clamp(1.4rem,3vw,2rem);font-weight:400;color:#fff;margin:0 0 40px;max-width:520px;line-height:1.25}

/* Calculator */
.hp__calc{max-width:1200px;margin:0 auto;padding:40px 32px 72px}
.hp__calc-card{background:var(--hp-surface);border:1px solid var(--hp-border);border-radius:16px;overflow:hidden}
.hp__calc-header{padding:32px 36px 24px;border-bottom:1px solid var(--hp-border)}
.hp__calc-header h2{font-family:var(--hp-serif);font-size:1.5rem;font-weight:400;color:#fff;margin:0 0 6px}
.hp__calc-header p{font-size:14px;color:var(--hp-text-muted);margin:0}
.hp__calc-layout{display:grid;grid-template-columns:1fr 1fr;gap:0}
.hp__calc-inputs{padding:32px 36px;border-right:1px solid var(--hp-border);display:flex;flex-direction:column;gap:16px}
.hp__calc-field{display:flex;flex-direction:column;gap:5px}
.hp__calc-label{font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--hp-text-muted)}
.hp__calc-input{font-family:var(--hp-sans);font-size:15px;color:var(--hp-text);background:var(--hp-bg);border:1px solid var(--hp-border);border-radius:8px;padding:11px 14px;outline:none;transition:border-color .15s,box-shadow .15s;width:100%}
.hp__calc-input:focus{border-color:rgba(251,191,36,0.4);box-shadow:0 0 0 3px var(--hp-accent-dim)}
.hp__calc-results{padding:32px 36px;display:flex;flex-direction:column;gap:12px}
.hp__calc-metric{background:var(--hp-card);border:1px solid var(--hp-border);border-radius:10px;padding:18px 20px;display:flex;align-items:center;justify-content:space-between;transition:border-color .15s}
.hp__calc-metric:hover{border-color:var(--hp-border-hover)}
.hp__calc-metric span{font-size:13px;color:var(--hp-text-muted)}
.hp__calc-metric strong{font-family:var(--hp-serif);font-size:1.3rem;color:#fff}
.hp__calc-metric--highlight{background:var(--hp-accent-dim);border-color:rgba(251,191,36,0.15)}
.hp__calc-metric--highlight strong{color:var(--hp-accent)}
.hp__calc-disclaimer{padding:16px 36px 24px;font-size:12px;color:var(--hp-text-muted);margin:0}

/* Advantages */
.hp__adv-grid{display:flex;flex-direction:column;gap:16px}
.hp__adv-card{display:grid;grid-template-columns:56px 1fr;gap:24px;background:var(--hp-surface);border:1px solid var(--hp-border);border-radius:12px;padding:32px 32px;align-items:start;transition:border-color .3s}
.hp__adv-card:hover{border-color:var(--hp-border-hover)}
.hp__adv-icon{width:48px;height:48px;border-radius:10px;display:flex;align-items:center;justify-content:center}
.hp__adv-content{display:flex;flex-direction:column;gap:6px}
.hp__adv-label{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
.hp__adv-title{font-size:16px;font-weight:700;color:#fff;margin:0}
.hp__adv-desc{font-size:14px;color:var(--hp-text-muted);line-height:1.65;margin:0}

/* Regulation banner */
.hp__reg-banner{max-width:1200px;margin:0 auto;padding:0 32px 72px}
.hp__reg-card{background:linear-gradient(135deg,rgba(248,113,113,0.06) 0%,transparent 50%);border:1px solid rgba(248,113,113,0.15);border-radius:16px;padding:40px 40px;display:flex;align-items:center;gap:32px}
.hp__reg-icon{width:56px;height:56px;border-radius:50%;background:rgba(248,113,113,0.1);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#F87171}
.hp__reg-copy h3{font-family:var(--hp-serif);font-size:1.3rem;font-weight:400;color:#fff;margin:0 0 8px}
.hp__reg-copy p{font-size:14px;color:var(--hp-text-muted);margin:0;line-height:1.65;max-width:560px}

/* Form */
.hp__form-section{max-width:1200px;margin:0 auto;padding:0 32px 72px}
.hp__form-card{background:var(--hp-surface);border:1px solid var(--hp-border);border-radius:16px;padding:40px 40px;max-width:560px;margin:0 auto}
.hp__form-header{margin-bottom:28px;text-align:center}
.hp__form-header h2{font-family:var(--hp-serif);font-size:1.4rem;font-weight:400;color:#fff;margin:0 0 6px}
.hp__form-header p{font-size:14px;color:var(--hp-text-muted);margin:0}
.hp__form-grid{display:flex;flex-direction:column;gap:14px}
.hp__field{display:flex;flex-direction:column;gap:5px}
.hp__field-label{font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--hp-text-muted)}
.hp__field-label .hp__req{color:var(--hp-accent);margin-left:2px}
.hp__input,.hp__select{font-family:var(--hp-sans);font-size:15px;color:var(--hp-text);background:var(--hp-bg);border:1px solid var(--hp-border);border-radius:8px;padding:12px 14px;outline:none;transition:border-color .15s,box-shadow .15s;width:100%}
.hp__input:focus,.hp__select:focus{border-color:rgba(251,191,36,0.4);box-shadow:0 0 0 3px var(--hp-accent-dim)}
.hp__select{appearance:none;background-image:url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23727966' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:32px;cursor:pointer}
.hp__form-error{font-size:13px;color:var(--hp-danger);margin:4px 0 0}
.hp__submit{width:100%;padding:14px;font-family:var(--hp-sans);font-size:15px;font-weight:700;color:var(--hp-bg);background:var(--hp-accent);border:none;border-radius:10px;cursor:pointer;transition:background .15s,transform .1s;margin-top:6px}
.hp__submit:hover:not(:disabled){background:var(--hp-accent-hover);transform:translateY(-1px)}
.hp__submit:disabled{opacity:.5;cursor:not-allowed}
.hp__form-footer{text-align:center;font-size:12px;color:var(--hp-text-muted);margin-top:10px}
.hp__success{text-align:center;padding:24px 0}
.hp__success-icon{width:56px;height:56px;border-radius:50%;background:var(--hp-accent-dim);display:flex;align-items:center;justify-content:center;margin:0 auto 20px}
.hp__success h2{font-family:var(--hp-serif);font-size:1.3rem;font-weight:400;color:#fff;margin:0 0 10px}
.hp__success p{font-size:14px;color:var(--hp-text-muted);margin:0;line-height:1.6}

/* Video */
.hp__video-card{background:var(--hp-surface);border:1px solid var(--hp-border);border-radius:16px;padding:32px;text-align:center}
.hp__video-card .hp__section-eyebrow{justify-content:center}
.hp__video-frame{position:relative;padding-bottom:56.25%;border-radius:10px;overflow:hidden;margin-top:20px;background:#000}
.hp__video-frame iframe{position:absolute;top:0;left:0;width:100%;height:100%;border:none}

/* FAQ */
.hp__faq-list{display:flex;flex-direction:column;gap:12px}
.hp__faq{background:var(--hp-surface);border:1px solid var(--hp-border);border-radius:12px;overflow:hidden}
.hp__faq-q{width:100%;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:20px 24px;font-family:var(--hp-sans);font-size:15px;font-weight:600;color:#fff;background:transparent;border:none;cursor:pointer;text-align:left;transition:background .15s}
.hp__faq-q:hover{background:rgba(255,255,255,.02)}
.hp__faq-chevron{flex-shrink:0;transition:transform .2s;color:var(--hp-text-muted)}
.hp__faq-chevron.is-open{transform:rotate(180deg)}
.hp__faq-a{padding:0 24px 20px;font-size:14px;color:var(--hp-text-muted);line-height:1.65;margin:0}

/* Bottom CTA */
.hp__bottom{max-width:1200px;margin:0 auto;padding:0 32px 80px}
.hp__bottom-card{background:linear-gradient(135deg,rgba(251,191,36,.08) 0%,transparent 60%);border:1px solid var(--hp-border);border-radius:16px;padding:56px 48px;text-align:center;display:flex;flex-direction:column;align-items:center}
.hp__bottom-card h2{font-family:var(--hp-serif);font-size:clamp(1.4rem,3vw,2rem);font-weight:400;color:#fff;margin:0 0 12px;max-width:560px;line-height:1.25}
.hp__bottom-card p{font-size:15px;color:var(--hp-text-muted);margin:0 0 28px;max-width:480px}
.hp__bottom-btn{display:inline-flex;align-items:center;gap:8px;font-family:var(--hp-sans);font-size:15px;font-weight:700;color:var(--hp-bg);background:var(--hp-accent);border:none;border-radius:10px;padding:14px 32px;cursor:pointer;transition:background .15s,transform .1s}
.hp__bottom-btn:hover{background:var(--hp-accent-hover);transform:translateY(-1px)}

/* Responsive */
@media(max-width:900px){.hp__calc-layout{grid-template-columns:1fr}.hp__calc-inputs{border-right:none;border-bottom:1px solid var(--hp-border)}.hp__adv-card{grid-template-columns:1fr;gap:12px}.hp__reg-card{flex-direction:column;text-align:center}}
@media(max-width:600px){.hp__hero,.hp__calc,.hp__section,.hp__form-section,.hp__reg-banner,.hp__bottom{padding-left:16px;padding-right:16px}.hp__calc-inputs,.hp__calc-results{padding:24px 20px}.hp__form-card{padding:28px 20px}.hp__bottom-card{padding:40px 24px}.hp__reg-card{padding:28px 24px}}
`;

/* -------------------------------------------
   COMPONENT
   ------------------------------------------- */

function HylioPage() {
  const [formData, setFormData] = useState({ name: "", email: "", state: "", acreageAccess: "", budgetRange: "" });
  const [calculatorInputs, setCalculatorInputs] = useState(HYLIO_CALCULATOR_DEFAULTS);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [openFaq, setOpenFaq] = useState(null);
  const formRef = useRef(null);

  const results = useMemo(() => calculateHylioRevenuePotential(calculatorInputs), [calculatorInputs]);

  function handleChange(e) { setFormData((c) => ({ ...c, [e.target.name]: e.target.value })); }
  function handleCalcChange(e) { setCalculatorInputs((c) => ({ ...c, [e.target.name]: e.target.value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      await submitHylioLead({ ...formData, calculatorInputs });
      setSubmitted(true);
    } catch (err) {
      setErrorMessage(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function scrollToForm() { formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); }

  return (
    <Shell compact>
      <style>{css}</style>
      <div className="hp">

        {/* --- HERO --- */}
        <section className="hp__hero">
          <span className="hp__hero-eyebrow">Hylio AG Series</span>
          <h1>A drone is a <em>revenue asset.</em> Run the numbers before you buy one.</h1>
          <p className="hp__hero-sub">
            Hylio AG drones are American-built, purpose-designed for row-crop agriculture,
            and positioned as the only compliant option when 2027 regulations take effect.
            Use the calculator below to see what the investment looks like on your acres.
          </p>
        </section>

        {/* --- CALCULATOR --- */}
        <section className="hp__calc">
          <div className="hp__calc-card" id="hylio-revenue-calculator">
            <div className="hp__calc-header">
              <h2>Revenue potential calculator</h2>
              <p>Adjust the inputs below to model payback and annual revenue for your territory.</p>
            </div>
            <div className="hp__calc-layout">
              <div className="hp__calc-inputs">
                {calculatorFields.map((f) => (
                  <div className="hp__calc-field" key={f.name}>
                    <span className="hp__calc-label">{f.label}</span>
                    <input className="hp__calc-input" type="number" name={f.name} min={f.min} step={f.step} inputMode="numeric" value={calculatorInputs[f.name]} onChange={handleCalcChange} />
                  </div>
                ))}
              </div>
              <div className="hp__calc-results">
                <div className="hp__calc-metric hp__calc-metric--highlight"><span>Monthly revenue</span><strong>{fmt(results.monthlyRevenue)}</strong></div>
                <div className="hp__calc-metric"><span>Annual revenue</span><strong>{fmt(results.annualRevenue)}</strong></div>
                <div className="hp__calc-metric hp__calc-metric--highlight"><span>Payback period</span><strong>{fmtMonths(results.paybackPeriodMonths)}</strong></div>
                <div className="hp__calc-metric"><span>Year 1 net</span><strong>{fmt(results.yearOneNet)}</strong></div>
                <div className="hp__calc-metric"><span>Year 2+ profit</span><strong>{fmt(results.yearTwoProfit)}</strong></div>
              </div>
            </div>
            <p className="hp__calc-disclaimer">Simplified estimate. Actual results depend on acreage, pricing, and utilization.</p>
          </div>
        </section>

        {/* --- 2027 REGULATION BANNER --- */}
        <div className="hp__reg-banner">
          <div className="hp__reg-card">
            <div className="hp__reg-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v4M12 17h.01" /><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
            </div>
            <div className="hp__reg-copy">
              <h3>2027: All commercial ag drones must be American-made.</h3>
              <p>New regulations will require American-manufactured drones for all commercial agricultural operations. DJI and other foreign-built drones will no longer be compliant. Hylio is already American-built - operators who invest now avoid a forced equipment replacement later.</p>
            </div>
          </div>
        </div>

        {/* --- ADVANTAGES --- */}
        <section className="hp__section">
          <span className="hp__section-eyebrow">Why Hylio</span>
          <h2 className="hp__section-title">Not just a drone. A territory business.</h2>
          <div className="hp__adv-grid">
            {advantages.map((adv) => (
              <div className="hp__adv-card" key={adv.label}>
                <div className="hp__adv-icon" style={{ background: `${adv.accent}15` }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={adv.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10l2 2 4-4" /><circle cx="10" cy="10" r="8" /></svg>
                </div>
                <div className="hp__adv-content">
                  <span className="hp__adv-label" style={{ color: adv.accent }}>{adv.label}</span>
                  <h3 className="hp__adv-title">{adv.title}</h3>
                  <p className="hp__adv-desc">{adv.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- VIDEO --- */}
        <section className="hp__section">
          <div className="hp__video-card">
            <span className="hp__section-eyebrow">See the opportunity</span>
            <div className="hp__video-frame">
              <iframe src="https://app.heygen.com/embeds/c9ba358fe68f4b48a836c26a44e89a6a" title="Hylio territory opportunity" allow="encrypted-media; fullscreen;" allowFullScreen />
            </div>
          </div>
        </section>

        {/* --- FORM --- */}
        <section className="hp__form-section" ref={formRef}>
          <div className="hp__form-card">
            {submitted ? (
              <div className="hp__success">
                <div className="hp__success-icon">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 14.5l5.5 5.5L22 9" /></svg>
                </div>
                <h2>We're reviewing your territory.</h2>
                <p>Expect a follow-up within one business day with your territory analysis and next steps on the Hylio opportunity.</p>
              </div>
            ) : (
              <form className="hp__form-grid" onSubmit={handleSubmit}>
                <div className="hp__form-header">
                  <h2>See if your territory qualifies</h2>
                  <p>Five fields. We'll review demand density and follow up.</p>
                </div>
                {formFields.map((field) => (
                  <div className="hp__field" key={field.name}>
                    <label className="hp__field-label">{field.label}{field.required && <span className="hp__req">*</span>}</label>
                    {field.type === "select" ? (
                      <select className="hp__select" name={field.name} required value={formData[field.name]} onChange={handleChange}>
                        <option value="">Select...</option>
                        {field.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : (
                      <input className="hp__input" name={field.name} type={field.type ?? "text"} required={field.required} placeholder={field.placeholder} autoComplete={field.autoComplete} inputMode={field.inputMode} min={field.min} step={field.step} value={formData[field.name]} onChange={handleChange} />
                    )}
                  </div>
                ))}
                {errorMessage && <p className="hp__form-error">{errorMessage}</p>}
                <button className="hp__submit" type="submit" disabled={isSubmitting}>{isSubmitting ? "Reviewing..." : "Check My Territory ->"}</button>
                <p className="hp__form-footer">For serious buyers evaluating a real territory opportunity.</p>
              </form>
            )}
          </div>
        </section>

        {/* --- FAQ --- */}
        <section className="hp__section">
          <span className="hp__section-eyebrow">Common questions</span>
          <h2 className="hp__section-title">What operators ask before investing.</h2>
          <div className="hp__faq-list">
            {objections.map((obj, i) => (
              <div className="hp__faq" key={i}>
                <button type="button" className="hp__faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  {obj.q}
                  <svg className={`hp__faq-chevron${openFaq === i ? " is-open" : ""}`} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6l4 4 4-4" /></svg>
                </button>
                {openFaq === i && <p className="hp__faq-a">{obj.a}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* --- BOTTOM CTA --- */}
        <section className="hp__bottom">
          <div className="hp__bottom-card">
            <h2>The 2027 deadline is coming. The best territories won't wait.</h2>
            <p>Run the numbers, check your territory, and see if a Hylio AG drone makes sense for your operation.</p>
            <button type="button" className="hp__bottom-btn" onClick={scrollToForm}>{"Check My Territory ->"}</button>
          </div>
        </section>

      </div>
    </Shell>
  );
}

export default HylioPage;
