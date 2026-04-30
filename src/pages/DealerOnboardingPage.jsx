import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Shell from "../components/Shell";
import { supabase } from "../lib/supabase";

const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Instrument+Sans:wght@400;500;600;700&display=swap');
.join{--surface:#151A12;--border:rgba(255,255,255,0.06);--text:#E8E6E1;--text-muted:#727966;--accent:#A3D977;font-family:'Instrument Sans',system-ui,sans-serif;color:var(--text)}
.join__card{max-width:760px;margin:32px auto;padding:28px;border:1px solid var(--border);border-radius:16px;background:var(--surface)}
.join h1{font-family:'DM Serif Display',Georgia,serif;font-weight:400;font-size:2.2rem;line-height:1.1;margin:0 0 10px;color:#fff}
.join p{color:var(--text-muted)}
.join__grid{display:grid;gap:14px}.join__field{display:grid;gap:6px}.join__field span{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text-muted)}
.join input,.join select,.join textarea{min-height:46px;border-radius:8px;border:1px solid var(--border);background:#0C0F0A;color:var(--text);padding:11px 12px}
.join__actions{display:flex;justify-content:space-between;gap:10px;margin-top:18px}.join__error{color:#FCA5A5}
@media(min-width:720px){.join__grid{grid-template-columns:repeat(2,1fr)}.join__span{grid-column:span 2}}
`;

function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function DealerOnboardingPage() {
  const navigate = useNavigate();
  const { networkSlug } = useParams();
  const [step, setStep] = useState(0);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    state: "",
    counties: "",
    businessType: "Ag dealer",
    acresServiced: "",
    capabilities: "",
    interestType: "All",
    password: "",
  });

  const title = useMemo(() => ["Business information", "Qualification", "Account creation", "Confirmation"][step], [step]);

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (step < 2) {
      setStep((current) => current + 1);
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      let networkId = null;

      if (networkSlug) {
        const { data: network } = await supabase.from("dealer_networks").select("id").eq("slug", networkSlug).single();
        networkId = network?.id || null;
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });
      if (authError) throw authError;

      const dealerSlug = slugify(`${form.companyName}-${form.state}`);
      const { data: dealer, error: dealerError } = await supabase
        .from("dealers")
        .insert({
          name: form.companyName,
          slug: dealerSlug,
          contact_name: form.contactName,
          contact_email: form.email,
          contact_phone: form.phone,
          state: form.state,
          counties_served: form.counties.split(",").map((county) => county.trim()).filter(Boolean),
          territory_description: `${form.businessType} | ${form.acresServiced} acres | ${form.interestType}`,
          network_id: networkId,
          training_status: "pending",
        })
        .select("*")
        .single();
      if (dealerError) throw dealerError;

      const { error: profileError } = await supabase.from("user_profiles").insert({
        id: authData.user.id,
        email: form.email,
        full_name: form.contactName,
        role: "dealer",
        dealer_id: dealer.id,
        network_id: networkId,
      });
      if (profileError) throw profileError;

      setStep(3);
      setMessage(`Your dealer account is active. Lead capture URL: ${window.location.origin}/d/${dealer.slug}`);
    } catch (error) {
      setMessage(error.message || "Unable to create dealer account.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Shell compact>
      <style>{css}</style>
      <section className="join">
        <form className="join__card" onSubmit={handleSubmit}>
          <span className="eyebrow">Become a dealer{networkSlug ? ` | ${networkSlug}` : ""}</span>
          <h1>{title}</h1>
          <p>Step {Math.min(step + 1, 4)} of 4</p>

          {step === 0 ? (
            <div className="join__grid">
              <label className="join__field"><span>Company name</span><input name="companyName" value={form.companyName} onChange={handleChange} required /></label>
              <label className="join__field"><span>Contact name</span><input name="contactName" value={form.contactName} onChange={handleChange} required /></label>
              <label className="join__field"><span>Email</span><input name="email" type="email" value={form.email} onChange={handleChange} required /></label>
              <label className="join__field"><span>Phone</span><input name="phone" value={form.phone} onChange={handleChange} required /></label>
              <label className="join__field"><span>State</span><input name="state" value={form.state} onChange={handleChange} required /></label>
              <label className="join__field"><span>Counties served</span><input name="counties" value={form.counties} onChange={handleChange} placeholder="Lyon, Redwood, Yellow Medicine" required /></label>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="join__grid">
              <label className="join__field"><span>Business type</span><select name="businessType" value={form.businessType} onChange={handleChange}><option>Ag dealer</option><option>Service provider</option><option>Drone operator</option><option>Crop consultant</option></select></label>
              <label className="join__field"><span>Existing acres serviced</span><input name="acresServiced" type="number" value={form.acresServiced} onChange={handleChange} required /></label>
              <label className="join__field"><span>Interest</span><select name="interestType" value={form.interestType} onChange={handleChange}><option>All</option><option>SOURCE distribution</option><option>Drone services</option><option>EarthOptics</option></select></label>
              <label className="join__field join__span"><span>Capabilities</span><textarea name="capabilities" value={form.capabilities} onChange={handleChange} rows="4" /></label>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="join__grid">
              <label className="join__field"><span>Email</span><input value={form.email} readOnly /></label>
              <label className="join__field"><span>Password</span><input name="password" type="password" value={form.password} onChange={handleChange} required minLength="6" /></label>
            </div>
          ) : null}

          {step === 3 ? (
            <div>
              <p>{message}</p>
              <button className="button button--primary" type="button" onClick={() => navigate("/dealer")}>Open dealer dashboard</button>
            </div>
          ) : null}

          {message && step !== 3 ? <p className="join__error">{message}</p> : null}
          {step < 3 ? (
            <div className="join__actions">
              <button className="button button--secondary" type="button" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0}>Back</button>
              <button className="button button--primary" type="submit" disabled={isSubmitting}>{step === 2 ? (isSubmitting ? "Creating..." : "Create account") : "Continue"}</button>
            </div>
          ) : null}
        </form>
      </section>
    </Shell>
  );
}

export default DealerOnboardingPage;
