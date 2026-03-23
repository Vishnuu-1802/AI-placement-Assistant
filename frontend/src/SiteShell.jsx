import { Link } from "react-router-dom";
import { useTheme } from "./useTheme";
import illustration from "./assets/dashboard-illustration.svg";
import { useAuth } from "./auth.jsx";

function IconSpark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2l2.2 5.8L20 10l-5.8 2.2L12 18l-2.2-5.8L4 10l5.8-2.2L12 2z" />
    </svg>
  );
}

function IconChat() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 4h16v11H8l-4 4V4zm3 4h10M7 11h7" />
    </svg>
  );
}

function SiteShell({ title, subtitle, children }) {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="page-bg">
      <div className="bg-orb orb-a" />
      <div className="bg-orb orb-b" />
      <div className="page-shell">
        <header className="topbar">
          <div className="brand">
            <span className="brand-dot" />
            <span>AI Career Platform</span>
            <span className="status-pill">Live</span>
          </div>
          <nav className="nav-links">
            {isAuthenticated ? (
              <>
                <Link to="/" className="nav-icon-link">
                  <IconSpark />
                  <span>Dashboard</span>
                </Link>
                <Link to="/chat" className="nav-icon-link">
                  <IconChat />
                  <span>AI Tutor</span>
                </Link>
                <Link to="/profile" className="nav-icon-link">
                  <span>Profile</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-icon-link">
                  <span>Login</span>
                </Link>
                <Link to="/signup" className="nav-icon-link">
                  <span>Signup</span>
                </Link>
              </>
            )}
          </nav>
          <div className="topbar-actions">
            {isAuthenticated && (
              <button className="theme-btn" onClick={logout} type="button">
                Logout {user?.name ? `(${user.name.split(" ")[0]})` : ""}
              </button>
            )}
            <button className="theme-btn" onClick={toggleTheme} type="button">
              {theme === "dark" ? "Light" : "Dark"} Mode
            </button>
          </div>
        </header>

        <section className="hero hero-grid">
          <div className="hero-copy">
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <div className="hero-media">
            <img src={illustration} alt="Analytics dashboard preview" />
          </div>
        </section>

        {children}
      </div>
    </div>
  );
}

export default SiteShell;
