import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import SiteShell from "./SiteShell";
import roadmapIllustration from "./assets/roadmap-illustration.svg";

const API_BASE = "http://127.0.0.1:8000";

function RoadmapPlannerPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedSkill, setSelectedSkill] = useState("");
  const [durationDays, setDurationDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [roadmap, setRoadmap] = useState([]);

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
    if (missingSkills.length && !selectedSkill) {
      setSelectedSkill(missingSkills[0]);
    }
  }, [missingSkills, selectedSkill]);

  const generateRoadmap = async () => {
    if (!selectedSkill) {
      setError("Select one skill to generate roadmap.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await axios.post(`${API_BASE}/generate_skill_roadmap`, {
        skill: selectedSkill,
        duration_days: Number(durationDays),
      });
      setRoadmap(res.data.roadmap || []);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to generate roadmap.");
    } finally {
      setLoading(false);
    }
  };

  if (!missingSkills.length) {
    return (
      <SiteShell title="Roadmap Planner" subtitle="No missing skills found in latest analysis.">
        <section className="card">
          <h2>No skills available for roadmap</h2>
          <p className="muted">Run detailed resume analysis first to identify skill gaps.</p>
          <button className="btn btn-primary" onClick={() => navigate("/resume-analysis")}>Back to Analysis</button>
        </section>
      </SiteShell>
    );
  }

  return (
    <SiteShell
      title="Custom Roadmap Planner"
      subtitle="Choose one missing skill, set timeline, and get a specific day-by-day plan."
    >
      <section className="card elevate roadmap-hero">
        <div>
          <h2>Specific Study Plan Generator</h2>
          <p className="muted">
            Plans now include concrete topics per day, practice tasks, and structured progression from fundamentals to interview-ready level.
          </p>
        </div>
        <img src={roadmapIllustration} alt="Roadmap planning visual" />
      </section>

      <section className="card elevate roadmap-controls">
        <h2>Generate Your Roadmap</h2>
        {error && <p className="form-error">{error}</p>}
        <div className="roadmap-form-grid">
          <label>
            Skill from gap list
            <select value={selectedSkill} onChange={(e) => setSelectedSkill(e.target.value)}>
              {missingSkills.map((skill) => (
                <option key={skill} value={skill}>{skill}</option>
              ))}
            </select>
          </label>

          <label>
            Duration (days)
            <input
              type="number"
              min={3}
              max={120}
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
            />
          </label>
        </div>

        <div className="button-row">
          <button className="btn btn-primary" onClick={generateRoadmap} disabled={loading}>
            {loading ? "Generating..." : "Generate Roadmap"}
          </button>
          <button className="btn btn-secondary" onClick={() => navigate("/resume-analysis")}>Back to Analysis</button>
        </div>
      </section>

      {roadmap.length > 0 && (
        <section className="layout-grid roadmap-timeline">
          {roadmap.map((item, idx) => (
            <article
              key={item.day}
              className="card elevate day-plan-card"
              style={{ animationDelay: `${idx * 25}ms` }}
            >
              <div className="day-plan-head">
                <h3>Day {item.day}</h3>
                <span className={`phase-pill phase-${String(item.phase).toLowerCase().replace(/[^a-z]+/g, "-")}`}>
                  {item.phase}
                </span>
              </div>
              <p><strong>Focus:</strong> {item.focus}</p>
              <ul>
                {(item.tasks || []).map((task, taskIdx) => <li key={taskIdx}>{task}</li>)}
              </ul>
            </article>
          ))}
        </section>
      )}
    </SiteShell>
  );
}

export default RoadmapPlannerPage;
