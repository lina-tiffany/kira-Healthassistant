import { useState } from "react";
import api from "./api";
import App from "./App";
import { Heart, LockKeyhole, Mail } from "lucide-react";
import "./AuthGate.css";

export default function AuthGate() {
  const [authenticated, setAuthenticated] = useState(
    Boolean(localStorage.getItem("kira_access_token"))
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/accounts/login/", {
        email,
        password,
      });

      const { access, refresh } = response.data;

      if (!access) {
        throw new Error("The server did not return an access token.");
      }

      localStorage.setItem("kira_access_token", access);
      if (refresh) {
        localStorage.setItem("kira_refresh_token", refresh);
      }

      setAuthenticated(true);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Login failed. Please check your details."
      );
    } finally {
      setLoading(false);
    }
  }

  if (authenticated) return <App />;

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">
          <div className="login-logo"><Heart size={27} /></div>
          <h1>KIRA</h1>
          <span>HEALTH ASSISTANT</span>
        </div>

        <div className="login-heading">
          <h2>Welcome back</h2>
          <p>Sign in to continue your health journey.</p>
        </div>

        <form onSubmit={handleLogin}>
          <label htmlFor="email">Email address</label>
          <div className="login-input">
            <Mail size={18} />
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <label htmlFor="password">Password</label>
          <div className="login-input">
            <LockKeyhole size={18} />
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button className="login-submit" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="login-security">
          <LockKeyhole size={14} /> Your health information is protected.
        </p>
        <p className="login-footer">Your health. Your journey. Your KIRA.</p>
      </section>
    </main>
  );
}
