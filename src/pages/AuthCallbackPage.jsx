import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Shell from "../components/Shell";
import { supabase } from "../lib/supabase";

const css = `
.auth-callback{--bg:#0C0F0A;--surface:#151A12;--border:rgba(255,255,255,0.06);--text:#E8E6E1;--muted:#727966;--accent:#A3D977;font-family:'Instrument Sans',system-ui,sans-serif;color:var(--text)}
.auth-callback__card{max-width:460px;margin:56px auto;padding:32px;border:1px solid var(--border);border-radius:16px;background:var(--surface)}
.auth-callback__card h1{font-family:'DM Serif Display',Georgia,serif;font-weight:400;font-size:2rem;line-height:1.1;margin:0 0 8px;color:#fff}
.auth-callback__card p{margin:0 0 22px;color:var(--muted);line-height:1.55}
.auth-callback__form{display:grid;gap:14px}
.auth-callback__field{display:grid;gap:6px}
.auth-callback__field span{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)}
.auth-callback__field input{min-height:46px;border-radius:8px;border:1px solid var(--border);background:#0C0F0A;color:var(--text);padding:11px 12px}
.auth-callback__message{margin:0 0 16px;color:var(--accent);font-size:14px}
.auth-callback__error{margin:0 0 16px;color:#FCA5A5;font-size:14px}
`;

function getHashParams() {
  if (typeof window === "undefined") return new URLSearchParams();
  return new URLSearchParams(window.location.hash.replace(/^#/, ""));
}

const authSetupClient = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: true,
    storageKey: "harvest-drone-password-setup",
  },
});

function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isReady, setIsReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("Checking your secure setup link...");
  const [error, setError] = useState("");
  const nextPath = useMemo(() => searchParams.get("next") || "/admin/blog", [searchParams]);

  useEffect(() => {
    document.title = "Set Password | Harvest Drone";

    async function establishSession() {
      try {
        const hashParams = getHashParams();
        const code = searchParams.get("code");
        const tokenHash = searchParams.get("token_hash") || hashParams.get("token_hash");
        const emailOtp = searchParams.get("otp") || hashParams.get("otp");
        const emailParam = searchParams.get("email") || hashParams.get("email");
        const type = searchParams.get("type") || hashParams.get("type") || "recovery";
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (emailOtp && emailParam) {
          const { error: otpError } = await authSetupClient.auth.verifyOtp({
            email: emailParam,
            token: emailOtp,
            type,
          });
          if (otpError) throw otpError;
        } else if (tokenHash) {
          const { error: otpError } = await authSetupClient.auth.verifyOtp({
            token_hash: tokenHash,
            type,
          });
          if (otpError) throw otpError;
        } else if (code) {
          const { error: exchangeError } = await authSetupClient.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        } else if (accessToken && refreshToken) {
          const { error: sessionError } = await authSetupClient.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (sessionError) throw sessionError;
        }

        if (window.location.hash) {
          window.history.replaceState({}, document.title, `${window.location.pathname}${window.location.search}`);
        }

        const {
          data: { session },
          error: sessionError,
        } = await authSetupClient.auth.getSession();

        if (sessionError) throw sessionError;
        if (!session?.user) {
          throw new Error("This setup link has expired or was already used. Send yourself a fresh password setup email and try again.");
        }

        setEmail(session.user.email || "");
        setMessage("Create your password to finish the Harvest Drone admin setup.");
        setIsReady(true);
      } catch (callbackError) {
        setMessage("");
        setError(callbackError.message || "Unable to verify this setup link.");
      }
    }

    establishSession();

    return () => {
      document.title = "Harvest Drone";
    };
  }, [searchParams]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Those passwords do not match.");
      return;
    }

    setIsSaving(true);

    try {
      const { error: updateError } = await authSetupClient.auth.updateUser({ password });
      if (updateError) throw updateError;

      if (email) {
        await supabase.auth.signInWithPassword({ email, password });
      }
      await authSetupClient.auth.signOut();

      setMessage("Password saved. Opening your admin workspace...");
      navigate(nextPath, { replace: true });
    } catch (updateError) {
      setError(updateError.message || "Unable to save that password.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Shell compact>
      <style>{css}</style>
      <section className="auth-callback">
        <div className="auth-callback__card">
          <h1>Set your password</h1>
          <p>{email ? `You are setting up access for ${email}.` : "Finish your secure Harvest Drone team login."}</p>

          {message ? <p className="auth-callback__message">{message}</p> : null}
          {error ? <p className="auth-callback__error">{error}</p> : null}

          {isReady ? (
            <form className="auth-callback__form" onSubmit={handleSubmit}>
              <label className="auth-callback__field">
                <span>New password</span>
                <input
                  autoComplete="new-password"
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  type="password"
                  value={password}
                />
              </label>
              <label className="auth-callback__field">
                <span>Confirm password</span>
                <input
                  autoComplete="new-password"
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  type="password"
                  value={confirmPassword}
                />
              </label>
              <button className="button button--primary" disabled={isSaving} type="submit">
                {isSaving ? "Saving..." : "Save password"}
              </button>
            </form>
          ) : (
            <Link className="button button--secondary" to="/login">
              Back to login
            </Link>
          )}
        </div>
      </section>
    </Shell>
  );
}

export default AuthCallbackPage;
