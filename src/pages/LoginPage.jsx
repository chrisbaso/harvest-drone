import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import Shell from "../components/Shell";
import { useAuth } from "../context/AuthContext";

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
`;

function redirectForRole(role) {
  if (role === "admin") return "/admin";
  if (role === "network_manager") return "/network";
  if (role === "dealer") return "/dealer";
  if (role === "operator") return "/training";
  return "/training";
}

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, isLoading, signIn } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLoading && user && profile) {
    return <Navigate to={location.state?.from || redirectForRole(profile.role)} replace />;
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

  return (
    <Shell compact>
      <style>{css}</style>
      <section className="login">
        <div className="login__card">
          <h1>Dealer portal login</h1>
          <p>Sign in to see your leads, dealer dashboard, training, and network performance.</p>
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
        </div>
      </section>
    </Shell>
  );
}

export default LoginPage;
