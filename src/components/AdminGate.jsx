import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function AdminGate({ children }) {
  const { isAuthenticated, isLoading, signIn, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [mode, setMode] = useState("signin");

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setInfoMessage("");

    try {
      if (mode === "signin") {
        await signIn(email, password);
      } else {
        const data = await signUp({ email, password });

        if (!data?.session) {
          setInfoMessage(
            "Account created. If email confirmations are enabled in Supabase, verify your email before signing in."
          );
        }
      }
    } catch (error) {
      setErrorMessage(error.message || "Unable to authenticate.");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
  }

  if (isLoading) {
    return (
      <section className="auth-card card">
        <span className="eyebrow">Admin access</span>
        <h1>Checking secure dashboard access...</h1>
      </section>
    );
  }

  if (isAuthenticated) {
    return children;
  }

  return (
    <section className="auth-card card">
      <span className="eyebrow">Admin access</span>
      <h1>Sign in to view the live Harvest Drone pipeline.</h1>
      <p>
        This lightweight gate uses Supabase Auth so the dashboard can stay private
        while the public grower and operator funnels remain open.
      </p>

      <div className="auth-toggle">
        <button
          className={mode === "signin" ? "button button--secondary auth-toggle__button is-active" : "button button--secondary auth-toggle__button"}
          type="button"
          onClick={() => setMode("signin")}
        >
          Sign in
        </button>
        <button
          className={mode === "signup" ? "button button--secondary auth-toggle__button is-active" : "button button--secondary auth-toggle__button"}
          type="button"
          onClick={() => setMode("signup")}
        >
          Create admin account
        </button>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Work email</span>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@harvestdrone.com"
            required
            autoComplete="email"
            inputMode="email"
          />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            type="password"
            name="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your dashboard password"
            required
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
          />
        </label>

        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
        {infoMessage ? <p className="table-subtle">{infoMessage}</p> : null}
        {mode === "signup" ? (
          <p className="table-subtle">
            Use this once to create your admin login if Supabase email/password signups are enabled.
          </p>
        ) : null}

        <button className="button button--primary button--full" type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? mode === "signin"
              ? "Opening dashboard..."
              : "Creating dashboard access..."
            : mode === "signin"
              ? "Open dashboard"
              : "Create dashboard access"}
        </button>
      </form>
    </section>
  );
}

export default AdminGate;
