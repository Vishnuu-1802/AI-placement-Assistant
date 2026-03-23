import { Navigate } from "react-router-dom";
import { useAuth } from "./auth.jsx";
import SiteShell from "./SiteShell";

function ProtectedRoute({ children }) {
  const { isAuthenticated, initializing } = useAuth();

  if (initializing) {
    return (
      <SiteShell title="Loading" subtitle="Checking your session...">
        <section className="card">
          <h2>Preparing your workspace...</h2>
        </section>
      </SiteShell>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
