import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SiteShell from "./SiteShell";
import { useAuth } from "./auth.jsx";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(form);
      navigate("/");
    } catch (err) {
      if (err?.code === "ERR_NETWORK") {
        setError("Cannot reach backend at http://127.0.0.1:5000. Start backend server first.");
      } else {
        setError(err?.response?.data?.error || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteShell
      title="Welcome Back"
      subtitle="Sign in to continue assessments, tutoring, and profile tracking."
    >
      <section className="card auth-card">
        <h2>Login</h2>
        {error && <p className="form-error">{error}</p>}
        <form className="auth-form" onSubmit={onSubmit}>
          <label>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />
          <label>Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
          />
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
        <p className="muted">
          New user? <Link to="/signup">Create an account</Link>
        </p>
      </section>
    </SiteShell>
  );
}

export default LoginPage;
