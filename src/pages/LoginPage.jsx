import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import Shell from "../components/Shell";
import { useAuth } from "../context/AuthContext";
import { getDemoAccessConfig } from "../lib/demoAccessApi";
import { getLoginRedirectPath, redirectForRole } from "../../shared/accessControl";

const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Instrument+Sans:wght@400;500;600;700&display=swap');
.login{--bg:#0C0F0A;--surface:#151A12;--border:rgba(255,255,255,0.06);--text:#E8E6E1;--text-muted:#727966;--accent:#A3D977;font-family:'Instrument Sans',system-ui,sans-serif;color:var(--text)}
.login__card{max-width:440px;margin:56px auto;padding:32px;border:1px solid var(--border);border-radius:16px;background:var(--surface)}
.login__card h1{font-family:'DM Serif Display',Georgia,serif;font-weight:400;font-size:2rem;line-height:1.1;margin:0 0 8px;color:#fff}
.login__card p{margin:0 0 24px;color:var(--text-muted)}
.login__form{display:grid;gap:14px}
.login__field{display:grid;gap:6px}
.login__field span{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text-muted)}
.login__field input{min-height:46px;border-radius:8px;border:1px solid var(--border);background:#0C0F0A;color:var(--text);padding:11px 12px}
.login__error{color:#FCA5A5;margin:0;font-size:14px}
.login__form + .login__demo{margin-top:18px}
.login__divider{display:flex;align-items:center;gap:12px;margin:4px 0;color:var(--text-muted);font-size:12px;text-transform:uppercase;letter-spacing:.08em}
.login__divider::before,.login__divider::after{content:"";height:1px;flex:1;background:var(--border)}
.login__demo{display:grid;gap:8px}
.login__demo p{margin:0;color:var(--text-muted);font-size:13px}
.login__hint{margin:0;color:var(--accent);font-size:13px}
`;

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, isLoading, signIn, signInDemo, signInSharedDemo, canUseLocalDemoAuth } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [demoForm, setDemoForm] = useState({ email: "", password: "" });
  const [demoAccessConfig, setDemoAccessConfig] = useState({ enabled: false, email: "", label: "Enterprise demo access" });
  const [errorMessage, setErrorMessage] = useState("");
  const [demoErrorMessage, setDemoErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDemoSubmitting, setIsDemoSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadDemoAccessConfig() {
      try {
        const config = await getDemoAccessConfig();
        if (!isMounted) return;
        setDemoAccessConfig(config);
        setDemoForm((current) => ({ ...current, email: config.email || current.email }));
      } catch (_error) {
        if (isMounted && canUseLocalDemoAuth) {
          setDemoAccessConfig({
            enabled: true,
            email: "rdo-demo@harvestdrone.local",
            label: "Local shared enterprise demo",
            localFallback: true,
          });
          setDemoForm((current) => ({ ...current, email: "rdo-demo@harvestdrone.local" }));
        }
      }
    }

    loadDemoAccessConfig();

    return () => {
      isMounted = false;
    };
  }, [canUseLocalDemoAuth]);

  if (!isLoading && user && profile) {
    return <Navigate to={getLoginRedirectPath(profile, location.state?.from)} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await signIn(form.email, form.password);
      navigate(location.state?.from || "/training", { replace: true });
    } catch (error) {
      setErrorMessage(error.message || "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleDemoSignIn() {
    setErrorMessage("");

    try {
      signInDemo();
      navigate(location.state?.from || redirectForRole("admin"), { replace: true });
    } catch (error) {
      setErrorMessage(error.message || "Unable to start local demo mode.");
    }
  }

  async function handleSharedDemoSubmit(event) {
    event.preventDefault();
    setIsDemoSubmitting(true);
    setDemoErrorMessage("");
    setErrorMessage("");

    try {
      await signInSharedDemo(demoForm);
      navigate("/enterprise/rdo/division", { replace: true });
    } catch (error) {
      setDemoErrorMessage(error.message || "Unable to open enterprise demo.");
    } finally {
      setIsDemoSubmitting(false);
    }
  }

  return (
    <Shell compact>
      <style>{css}</style>
      <section className="login">
        <div className="login__card">
          <h1>Dealer portal login</h1>
          <p>Sign in to see your leads, dealer dashboard, training, and network performance.</p>

          {demoAccessConfig.enabled ? (
            <div className="login__demo">
              <div className="login__divider">{demoAccessConfig.label || "Enterprise demo access"}</div>
              <form className="login__form" onSubmit={handleSharedDemoSubmit}>
                <label className="login__field">
                  <span>Demo email</span>
                  <input
                    type="email"
                    value={demoForm.email}
                    onChange={(event) => setDemoForm((current) => ({ ...current, email: event.target.value }))}
                    required
                  />
                </label>
                <label className="login__field">
                  <span>Demo password</span>
                  <input
                    type="password"
                    value={demoForm.password}
                    onChange={(event) => setDemoForm((current) => ({ ...current, password: event.target.value }))}
                    required
                  />
                </label>
                {demoErrorMessage ? <p className="login__error">{demoErrorMessage}</p> : null}
                {demoAccessConfig.localFallback ? <p className="login__hint">Local password: harvest-demo</p> : null}
                <button className="button button--primary" type="submit" disabled={isDemoSubmitting}>
                  {isDemoSubmitting ? "Opening demo..." : "Open enterprise demo"}
                </button>
              </form>
            </div>
          ) : null}

          <div className="login__divider">Team login</div>
          <form className="login__form" onSubmit={handleSubmit}>
            <label className="login__field">
              <span>Email</span>
              <input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} required />
            </label>
            <label className="login__field">
              <span>Password</span>
              <input type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} required />
            </label>
            {errorMessage ? <p className="login__error">{errorMessage}</p> : null}
            <button className="button button--primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {canUseLocalDemoAuth ? (
            <div className="login__demo">
              <div className="login__divider">Local demo</div>
              <button className="button button--secondary" type="button" onClick={handleDemoSignIn}>
                Enter demo mode
              </button>
              <p>Available only on the local dev server. Production routes still require real Supabase Auth.</p>
            </div>
          ) : null}
        </div>
      </section>
    </Shell>
  );
}

export default LoginPage;
