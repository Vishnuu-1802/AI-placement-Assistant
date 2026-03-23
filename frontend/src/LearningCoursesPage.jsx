import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import SiteShell from "./SiteShell";

const API_BASE = "http://127.0.0.1:8000";

function LearningCoursesPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [learningPath, setLearningPath] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const missingSkills = useMemo(() => {
    if (Array.isArray(location.state?.skills) && location.state.skills.length) {
      return location.state.skills;
    }
    const cached = sessionStorage.getItem("resumeAnalysis");
    if (!cached) return [];
    try {
      const parsed = JSON.parse(cached);
      return parsed?.target_role_insight?.missing_skills || [];
    } catch {
      return [];
    }
  }, [location.state]);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!missingSkills.length) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const res = await axios.post(`${API_BASE}/learning_courses`, {
          skills: missingSkills,
        });
        setLearningPath(res.data.learning_path || {});
      } catch (err) {
        setError(err?.response?.data?.error || "Failed to load learning courses.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [missingSkills]);

  if (loading) {
    return (
      <SiteShell title="Courses To Learn" subtitle="Building a focused learning plan from your skill gaps...">
        <section className="card"><h2>Loading course recommendations...</h2></section>
      </SiteShell>
    );
  }

  if (!missingSkills.length) {
    return (
      <SiteShell title="Courses To Learn" subtitle="No missing skills found in the latest analysis.">
        <section className="card">
          <h2>No missing skills available</h2>
          <p className="muted">Run a resume analysis first to generate targeted course recommendations.</p>
          <button className="btn btn-primary" onClick={() => navigate("/resume-analysis")}>Back to Analysis</button>
        </section>
      </SiteShell>
    );
  }

  return (
    <SiteShell
      title="Courses To Learn"
      subtitle="Industry-focused course recommendations mapped to your missing skills."
    >
      {error && (
        <section className="card">
          <p className="form-error">{error}</p>
        </section>
      )}

      <section className="layout-grid">
        {Object.entries(learningPath).map(([skill, links], idx) => (
          <article key={skill} className="card elevate course-card" style={{ animationDelay: `${idx * 90}ms` }}>
            <div className="course-head">
              <h3>{skill}</h3>
              <span className="course-badge">Skill Gap</span>
            </div>
            <p className="muted">Recommended learning tracks:</p>
            <div className="course-link-list">
              {(links || []).map((link, i) => (
                <a
                  key={`${skill}-${i}`}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="course-link"
                >
                  <span>{`Resource ${i + 1}`}</span>
                  <small>{link}</small>
                </a>
              ))}
            </div>
            <div className="course-actions">
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => navigate(`/test?skill=${encodeURIComponent(skill)}`)}
              >
                Take Skill Test
              </button>
            </div>
          </article>
        ))}
      </section>

      <section className="card">
        <div className="button-row">
          <button
            className="btn btn-accent"
            onClick={() => navigate(`/test?skill=${encodeURIComponent(missingSkills[0])}`)}
            disabled={!missingSkills.length}
          >
            Start Tests
          </button>
          <button className="btn btn-primary" onClick={() => navigate("/resume-analysis")}>Back to Analysis</button>
          <button className="btn btn-secondary" onClick={() => navigate("/")}>Dashboard</button>
        </div>
      </section>
    </SiteShell>
  );
}

export default LearningCoursesPage;
