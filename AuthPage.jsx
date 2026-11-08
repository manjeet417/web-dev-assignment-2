import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";

const Svg = ({ children, size = 18, className }) => (
  <svg className={className} viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

export default function AuthPage({ mode }) {
  const isLogin = mode === "login";
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [errKey, setErrKey] = useState(0);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        const data = await api("/user/login", { method: "POST", body: { email: form.email, password: form.password } });
        login(data.token, data.name);
        navigate("/");
      } else {
        await api("/user/register", { method: "POST", body: form });
        // sign in right after signing up
        const data = await api("/user/login", { method: "POST", body: { email: form.email, password: form.password } });
        login(data.token, data.name);
        navigate("/");
      }
    } catch (err) {
      setError(err.message);
      setErrKey((k) => k + 1); // replays the shake animation
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth">
      <section className="auth-art" aria-hidden="true">
        <span className="glow g1" />
        <span className="glow g2" />

        <div className="sticky s1"><b>Call the plumber</b><span>Thursday, before 5. Ask about the kitchen tap too.</span></div>
        <div className="sticky s2"><b>Ideas for the trip</b><span>Night train to Jaipur. Book the stepwell tour.</span></div>
        <div className="sticky s3">
          <b>Groceries</b>
          <ul className="ticks">
            <li style={{ "--d": "1.3s" }}>Lemons</li>
            <li style={{ "--d": "2s" }}>Rice</li>
            <li style={{ "--d": "2.7s" }}>Coriander</li>
            <li style={{ "--d": "3.4s" }}>Curd</li>
          </ul>
        </div>

        <p className="auth-tagline">Capture it<span className="caret" /></p>
      </section>

      <section className="auth-panel" key={mode}>
        <span className="auth-badge">{isLogin ? "Welcome back" : "Get started"}</span>
        <h1>{isLogin ? "Log in to your notes" : "Create your notes account"}</h1>
        <p className="muted">
          {isLogin ? "Pick up where you left off." : "Write things down once. Find them when you need them."}
        </p>

        <form onSubmit={submit} className="stack">
          {!isLogin && (
            <label>
              Name
              <span className="input-wrap">
                <Svg className="input-icon"><circle cx="12" cy="8" r="4" /><path d="M4 21c1-4 4-6 8-6s7 2 8 6" /></Svg>
                <input name="name" value={form.name} onChange={update} autoComplete="name" required />
              </span>
            </label>
          )}
          <label>
            Email
            <span className="input-wrap">
              <Svg className="input-icon"><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M4 7l8 6 8-6" /></Svg>
              <input type="email" name="email" value={form.email} onChange={update} autoComplete="email" required />
            </span>
          </label>
          <label>
            Password
            <span className="input-wrap">
              <Svg className="input-icon"><rect x="5" y="11" width="14" height="10" rx="3" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></Svg>
              <input
                type={showPw ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={update}
                autoComplete={isLogin ? "current-password" : "new-password"}
                minLength={isLogin ? undefined : 6}
                required
              />
              <button
                type="button"
                className="eye"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? (
                  <Svg size={20}><path d="M3 3l18 18" /><path d="M10.6 6.1A9.8 9.8 0 0 1 12 6c5 0 8.5 4 9.5 6a13 13 0 0 1-2.6 3.4M6.5 6.9A13.3 13.3 0 0 0 2.5 12c1 2 4.5 6 9.5 6 1.4 0 2.7-.3 3.8-.8" /><path d="M9.9 10a3 3 0 0 0 4.1 4.1" /></Svg>
                ) : (
                  <Svg size={20}><path d="M2.5 12C3.5 10 7 6 12 6s8.5 4 9.5 6c-1 2-4.5 6-9.5 6s-8.5-4-9.5-6z" /><circle cx="12" cy="12" r="3" /></Svg>
                )}
              </button>
            </span>
            {!isLogin && <small className="muted">At least 6 characters</small>}
          </label>

          {error && <p className="error" role="alert" key={errKey}>{error}</p>}

          <button className="btn primary" disabled={loading}>
            {loading ? (<><span className="spinner" aria-hidden="true" /> Please wait...</>) : isLogin ? "Log in" : "Create account"}
          </button>
        </form>

        <p className="muted switch">
          {isLogin ? "New here? " : "Already have an account? "}
          <Link to={isLogin ? "/register" : "/login"}>{isLogin ? "Create an account" : "Log in"}</Link>
        </p>
      </section>
    </main>
  );
}
