import { useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Shell from "../components/Shell";
import { submitOperatorLead } from "../lib/submissions";

const formFields = [
  { label: "First name", name: "firstName", required: true, placeholder: "Landon", autoComplete: "given-name" },
  { label: "Company", name: "companyName", required: true, placeholder: "Pierce Aero Ag", autoComplete: "organization" },
  { label: "Email", name: "email", type: "email", required: true, placeholder: "landon@pierceaero.com", autoComplete: "email", inputMode: "email" },
  { label: "Primary state", name: "state", required: true, placeholder: "Kansas", autoComplete: "address-level1" },
  { label: "Estimated weekly acre capacity", name: "weeklyCapacity", type: "number", required: true, placeholder: "3,500", inputMode: "numeric", min: "0", step: "1" },
];

const revenueStreams = [
  {
    label: "Application services",
    title: "Get paid $8-14 per acre you spray.",
    desc: "Drone application at $8-14 per acre. You service the fields, Harvest Drone routes the demand. No cold calling, no quoting - jobs come to you based on territory and capacity.",
    accent: "#FBBF24",
  },
  {
    label: "Input distribution",
    title: "Earn $2-9 per acre on every reorder.",
    desc: "Distribute SOURCE and BLUEPRINT biologicals to your grower relationships. $9/acre margin on direct sales, $2/acre when sold through the network. Recurring annually on the same acres.",
    accent: "#A3D977",
  },
  {
    label: "EarthOptics data",
    title: "Add soil intelligence as a service.",
    desc: "Offer EarthOptics subsurface scanning to your grower base. Harvest Drone holds the distributor contract - you sell at dealer pricing and earn the spread on every acre scanned.",
    accent: "#60A5FA",
  },
];

const steps = [
  { num: "01", title: "Tell us about your operation", desc: "Five fields. Takes 30 seconds. We need your state, capacity, and company - the rest comes later." },
  { num: "02", title: "We review your territory", desc: "We check grower demand density, existing operator coverage, and how your capacity fits the network." },
  { num: "03", title: "Get your territory plan", desc: "You receive a clear picture of available acres, revenue potential, and how the three revenue streams apply to your area." },
];

const objections = [
  {
    q: "How is this different from just getting spray jobs?",
    a: "Traditional spray work is one-and-done - you get paid per job, then start over. This model adds two recurring revenue streams (inputs and soil data) on top of application services. Once a grower is enrolled, you earn on the same acres every season without re-selling.",
  },
  {
    q: "Do I need my own equipment?",
    a: "Existing equipment helps, but it's not required for the inputs and EarthOptics distribution side. If you're an ag service provider or dealer without drones, you can still participate in the network through input distribution and data services.",
  },
  {
    q: "What territory protection do I get?",
    a: "We route demand based on geography and capacity. Your territory plan will show the specific counties where demand exists and how you'd be positioned within the operator network. We don't stack operators on top of each other.",
  },
  {
    q: "What's the revenue potential per acre?",
    a: "Stacked across all three streams: $8-14 for application, up to $9 for inputs, and $1-3 for EarthOptics data. On a 500-acre grower relationship, that's $9,000-$13,000 annually from a single account - recurring.",
  },
  {
    q: "Is there a cost to join?",
    a: "No franchise fee or buy-in. The territory review is free. If it's a fit, we onboard you into the network and start routing demand. You invest in your own equipment and operations - we provide the demand, products, and infrastructure.",
  },
];

const whoFor = [
  { title: "Drone operators", desc: "Already flying ag drones and want more consistent demand plus recurring revenue on top of spray jobs." },
  { title: "Ag service providers", desc: "Running a crop consulting or custom application business and want to add inputs distribution and soil data services." },
  { title: "Dealers & distributors", desc: "Selling into the ag channel already and want to add EarthOptics, SOURCE, and BLUEPRINT to your lineup with margin built in." },
];

const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Instrument+Sans:wght@400;500;600;700&display=swap');

.op{--op-bg:#0C0F0A;--op-surface:#151A12;--op-border:rgba(255,255,255,0.06);--op-text:#E8E6E1;--op-text-muted:#727966;--op-accent:#60A5FA;--op-accent-hover:#7DB8FC;--op-accent-dim:rgba(96,165,250,0.10);--op-green:#A3D977;--op-danger:#F87171;--op-sans:'Instrument Sans',system-ui,sans-serif;--op-serif:'DM Serif Display',Georgia,serif;background:var(--op-bg);color:var(--op-text);font-family:var(--op-sans);-webkit-font-smoothing:antialiased;min-height:100vh}

.op__hero{max-width:1200px;margin:0 auto;padding:56px 32px 64px;display:grid;grid-template-columns:1fr 420px;gap:56px;align-items:start}
.op__hero-copy{padding-top:16px}
.op__hero-eyebrow{display:inline-flex;align-items:center;gap:10px;font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--op-accent);margin-bottom:20px}
.op__hero-eyebrow::before{content:'';width:28px;height:1px;background:var(--op-accent)}
.op__hero h1{font-family:var(--op-serif);font-size:clamp(2rem,4.5vw,3rem);font-weight:400;line-height:1.12;color:#fff;margin:0 0 20px}
.op__hero h1 em{font-style:normal;color:var(--op-accent)}
.op__hero-sub{font-size:17px;color:var(--op-text-muted);line-height:1.7;max-width:500px;margin:0 0 28px}
.op__hero-proof{display:flex;gap:24px;flex-wrap:wrap}
.op__hero-proof-item{display:flex;flex-direction:column;gap:2px}
.op__hero-proof-item strong{font-family:var(--op-serif);font-size:1.6rem;color:#fff}
.op__hero-proof-item span{font-size:12px;color:var(--op-text-muted)}

.op__form-card{background:var(--op-surface);border:1px solid var(--op-border);border-radius:16px;padding:36px 32px 32px;position:sticky;top:24px}
.op__form-header{margin-bottom:24px}
.op__form-header h2{font-family:var(--op-serif);font-size:1.35rem;font-weight:400;color:#fff;margin:0 0 6px}
.op__form-header p{font-size:14px;color:var(--op-text-muted);margin:0}
.op__form-grid{display:flex;flex-direction:column;gap:14px}
.op__field{display:flex;flex-direction:column;gap:5px}
.op__field-label{font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--op-text-muted);padding-left:2px}
.op__field-label .op__required{color:var(--op-accent);margin-left:2px}
.op__input{font-family:var(--op-sans);font-size:15px;color:var(--op-text);background:var(--op-bg);border:1px solid var(--op-border);border-radius:8px;padding:12px 14px;outline:none;transition:border-color .15s,box-shadow .15s;width:100%}
.op__input::placeholder{color:rgba(114,121,102,0.6)}
.op__input:focus{border-color:rgba(96,165,250,0.4);box-shadow:0 0 0 3px var(--op-accent-dim)}
.op__form-error{font-size:13px;color:var(--op-danger);margin:4px 0 0}
.op__submit{width:100%;padding:14px;font-family:var(--op-sans);font-size:15px;font-weight:700;color:#fff;background:var(--op-accent);border:none;border-radius:10px;cursor:pointer;transition:background .15s,transform .1s;margin-top:6px}
.op__submit:hover:not(:disabled){background:var(--op-accent-hover);transform:translateY(-1px)}
.op__submit:disabled{opacity:.5;cursor:not-allowed}
.op__form-footer{text-align:center;font-size:12px;color:var(--op-text-muted);margin-top:10px}

.op__success{text-align:center;padding:24px 0}
.op__success-icon{width:56px;height:56px;border-radius:50%;background:var(--op-accent-dim);display:flex;align-items:center;justify-content:center;margin:0 auto 20px}
.op__success h2{font-family:var(--op-serif);font-size:1.3rem;font-weight:400;color:#fff;margin:0 0 10px}
.op__success p{font-size:14px;color:var(--op-text-muted);margin:0;line-height:1.6}

.op__section{max-width:1200px;margin:0 auto;padding:0 32px 72px}
.op__section-eyebrow{display:inline-flex;align-items:center;gap:10px;font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--op-accent);margin-bottom:12px}
.op__section-eyebrow::before{content:'';width:20px;height:1px;background:var(--op-accent)}
.op__section-title{font-family:var(--op-serif);font-size:clamp(1.4rem,3vw,2rem);font-weight:400;color:#fff;margin:0 0 40px;max-width:520px;line-height:1.25}

.op__revenue-grid{display:flex;flex-direction:column;gap:16px}
.op__revenue-card{display:grid;grid-template-columns:72px 1fr;gap:28px;background:var(--op-surface);border:1px solid var(--op-border);border-radius:12px;padding:36px 36px;align-items:start;transition:border-color .3s,background .3s}
.op__revenue-card:hover{border-color:rgba(255,255,255,.12);background:#1A2015}
.op__revenue-icon{width:56px;height:56px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-family:var(--op-serif);font-size:1.4rem;color:#fff}
.op__revenue-content{display:flex;flex-direction:column;gap:6px}
.op__revenue-label{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
.op__revenue-title{font-size:17px;font-weight:700;color:#fff;margin:0}
.op__revenue-desc{font-size:14px;color:var(--op-text-muted);line-height:1.65;margin:0}

.op__who-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--op-border);border:1px solid var(--op-border);border-radius:12px;overflow:hidden}
.op__who-card{background:var(--op-surface);padding:32px 28px;display:flex;flex-direction:column;gap:8px}
.op__who-title{font-size:15px;font-weight:700;color:#fff}
.op__who-desc{font-size:13px;color:var(--op-text-muted);line-height:1.6}

.op__steps-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--op-border);border:1px solid var(--op-border);border-radius:12px;overflow:hidden}
.op__step{background:var(--op-surface);padding:36px 32px}
.op__step-num{font-family:var(--op-serif);font-size:2.4rem;color:var(--op-accent);opacity:.3;line-height:1;margin-bottom:16px}
.op__step-title{font-size:16px;font-weight:700;color:#fff;margin-bottom:8px}
.op__step-desc{font-size:14px;color:var(--op-text-muted);line-height:1.6}

.op__video-card{background:var(--op-surface);border:1px solid var(--op-border);border-radius:16px;padding:32px;text-align:center}
.op__video-card .op__section-eyebrow{justify-content:center}
.op__video-frame{position:relative;padding-bottom:56.25%;border-radius:10px;overflow:hidden;margin-top:20px;background:#000}
.op__video-frame iframe{position:absolute;top:0;left:0;width:100%;height:100%;border:none}

.op__faq-list{display:flex;flex-direction:column;gap:12px}
.op__faq{background:var(--op-surface);border:1px solid var(--op-border);border-radius:12px;overflow:hidden}
.op__faq-q{width:100%;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:20px 24px;font-family:var(--op-sans);font-size:15px;font-weight:600;color:#fff;background:transparent;border:none;cursor:pointer;text-align:left;transition:background .15s}
.op__faq-q:hover{background:rgba(255,255,255,.02)}
.op__faq-chevron{flex-shrink:0;transition:transform .2s;color:var(--op-text-muted)}
.op__faq-chevron.is-open{transform:rotate(180deg)}
.op__faq-a{padding:0 24px 20px;font-size:14px;color:var(--op-text-muted);line-height:1.65;margin:0}

.op__bottom{max-width:1200px;margin:0 auto;padding:0 32px 80px}
.op__bottom-card{background:linear-gradient(135deg,rgba(96,165,250,.08) 0%,transparent 60%);border:1px solid var(--op-border);border-radius:16px;padding:56px 48px;text-align:center;display:flex;flex-direction:column;align-items:center}
.op__bottom-card h2{font-family:var(--op-serif);font-size:clamp(1.4rem,3vw,2rem);font-weight:400;color:#fff;margin:0 0 12px;max-width:560px;line-height:1.25}
.op__bottom-card p{font-size:15px;color:var(--op-text-muted);margin:0 0 28px;max-width:480px}
.op__bottom-btn{display:inline-flex;align-items:center;gap:8px;font-family:var(--op-sans);font-size:15px;font-weight:700;color:#fff;background:var(--op-accent);border:none;border-radius:10px;padding:14px 32px;cursor:pointer;transition:background .15s,transform .1s}
.op__bottom-btn:hover{background:var(--op-accent-hover);transform:translateY(-1px)}

@media(max-width:900px){.op__hero{grid-template-columns:1fr;gap:32px;padding:40px 20px 48px}.op__form-card{position:static}.op__steps-grid,.op__who-grid{grid-template-columns:1fr}.op__revenue-card{grid-template-columns:1fr;gap:16px}}
@media(max-width:600px){.op__hero{padding:32px 16px 36px}.op__form-card{padding:28px 20px 24px}.op__section,.op__bottom{padding-left:16px;padding-right:16px}.op__bottom-card{padding:40px 24px}}
`;

function buildInitialValues(searchParams) {
  return {
    firstName: searchParams.get("firstName") ?? "",
    companyName: searchParams.get("companyName") ?? "",
    email: searchParams.get("email") ?? "",
    state: searchParams.get("state") ?? "",
    weeklyCapacity: searchParams.get("weeklyCapacity") ?? "",
  };
}

function OperatorPage() {
  const [searchParams] = useSearchParams();
  const initialValues = useMemo(() => buildInitialValues(searchParams), [searchParams]);
  const [formData, setFormData] = useState(initialValues);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [openFaq, setOpenFaq] = useState(null);
  const formRef = useRef(null);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      await submitOperatorLead(formData);
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
      <div className="op">
        <section className="op__hero">
          <div className="op__hero-copy">
            <span className="op__hero-eyebrow">Operator network</span>
            <h1>Stop chasing spray jobs. Build <em>recurring revenue</em> per acre.</h1>
            <p className="op__hero-sub">
              Join a distribution network where every acre you service generates
              revenue from application, inputs, and soil data - not just a
              one-time spray fee. Same growers, three revenue streams, every season.
            </p>
            <div className="op__hero-proof">
              <div className="op__hero-proof-item"><strong>$10-26</strong><span>Stacked revenue per acre</span></div>
              <div className="op__hero-proof-item"><strong>3</strong><span>Revenue streams per grower</span></div>
              <div className="op__hero-proof-item"><strong>Annual</strong><span>Recurring on same acres</span></div>
            </div>
          </div>

          <div className="op__form-card" ref={formRef} id="operator-qualification-form">
            {submitted ? (
              <div className="op__success">
                <div className="op__success-icon">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 14.5l5.5 5.5L22 9" /></svg>
                </div>
                <h2>We're reviewing your territory.</h2>
                <p>Expect to hear from us within one business day with your territory plan and revenue potential analysis.</p>
              </div>
            ) : (
              <form className="op__form-grid" onSubmit={handleSubmit}>
                <div className="op__form-header">
                  <h2>Check your territory</h2>
                  <p>Five fields. Takes 30 seconds.</p>
                </div>
                {formFields.map((field) => (
                  <div className="op__field" key={field.name}>
                    <label className="op__field-label">{field.label}{field.required && <span className="op__required">*</span>}</label>
                    <input className="op__input" name={field.name} type={field.type ?? "text"} required={field.required} placeholder={field.placeholder} autoComplete={field.autoComplete} inputMode={field.inputMode} min={field.min} step={field.step} value={formData[field.name]} onChange={handleChange} />
                  </div>
                ))}
                {errorMessage && <p className="op__form-error">{errorMessage}</p>}
                <button className="op__submit" type="submit" disabled={isSubmitting}>{isSubmitting ? "Reviewing your territory..." : "Check My Territory ->"}</button>
                <p className="op__form-footer">Free. No commitment. We'll follow up within one business day.</p>
              </form>
            )}
          </div>
        </section>

        <section className="op__section">
          <span className="op__section-eyebrow">The model</span>
          <h2 className="op__section-title">Three revenue streams on the same acre. Every season.</h2>
          <div className="op__revenue-grid">
            {revenueStreams.map((stream) => (
              <div className="op__revenue-card" key={stream.label}>
                <div className="op__revenue-icon" style={{ background: `${stream.accent}15` }}>
                  <span style={{ color: stream.accent }}>$</span>
                </div>
                <div className="op__revenue-content">
                  <span className="op__revenue-label" style={{ color: stream.accent }}>{stream.label}</span>
                  <h3 className="op__revenue-title">{stream.title}</h3>
                  <p className="op__revenue-desc">{stream.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="op__section">
          <span className="op__section-eyebrow">Who this is for</span>
          <h2 className="op__section-title">Built for operators who think like business owners.</h2>
          <div className="op__who-grid">
            {whoFor.map((item) => (
              <div className="op__who-card" key={item.title}>
                <span className="op__who-title">{item.title}</span>
                <span className="op__who-desc">{item.desc}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="op__section">
          <div className="op__video-card">
            <span className="op__section-eyebrow">See it in action</span>
            <div className="op__video-frame">
              <iframe src="https://app.heygen.com/embeds/e17cd813574f4e10b693dc473761669e" title="Harvest Drone - operator opportunity" allow="encrypted-media; fullscreen;" allowFullScreen />
            </div>
          </div>
        </section>

        <section className="op__section">
          <span className="op__section-eyebrow">How it works</span>
          <h2 className="op__section-title">From application to territory plan in three steps.</h2>
          <div className="op__steps-grid">
            {steps.map((step) => (
              <div className="op__step" key={step.num}>
                <div className="op__step-num">{step.num}</div>
                <div className="op__step-title">{step.title}</div>
                <div className="op__step-desc">{step.desc}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="op__section">
          <span className="op__section-eyebrow">Common questions</span>
          <h2 className="op__section-title">What operators ask before joining.</h2>
          <div className="op__faq-list">
            {objections.map((obj, i) => (
              <div className="op__faq" key={i}>
                <button type="button" className="op__faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  {obj.q}
                  <svg className={`op__faq-chevron${openFaq === i ? " is-open" : ""}`} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6l4 4 4-4" /></svg>
                </button>
                {openFaq === i && <p className="op__faq-a">{obj.a}</p>}
              </div>
            ))}
          </div>
        </section>

        <section className="op__bottom">
          <div className="op__bottom-card">
            <h2>The best territories go to operators who move first.</h2>
            <p>Check your area's demand density and see what three revenue streams look like on your existing grower relationships.</p>
            <button type="button" className="op__bottom-btn" onClick={scrollToForm}>Check My Territory -&gt;</button>
          </div>
        </section>
      </div>
    </Shell>
  );
}

export default OperatorPage;
