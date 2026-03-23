import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SiteShell from "./SiteShell";
import { useAuth } from "./auth.jsx";

function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signup(form);
      navigate("/profile");
    } catch (err) {
      if (err?.code === "ERR_NETWORK") {
        setError("Cannot reach backend at http://127.0.0.1:5000. Start backend server first.");
      } else {
        setError(err?.response?.data?.error || "Signup failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteShell
      title="Create Account"
      subtitle="Set up your account and start building your learning profile."
    >
      <section className="card auth-card">
        <h2>Signup</h2>
        {error && <p className="form-error">{error}</p>}
        <form className="auth-form" onSubmit={onSubmit}>
          <label>Full Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
          />
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
            minLength={6}
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
          />
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>
        <p className="muted">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </section>
    </SiteShell>
  );
}

export default SignupPage;
