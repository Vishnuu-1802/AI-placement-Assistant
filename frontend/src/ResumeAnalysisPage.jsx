import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SiteShell from "./SiteShell";

function RingScore({ score }) {
  const pct = Math.max(0, Math.min(100, score || 0));
  return (
    <div className="score-ring-wrap">
      <div
        className="score-ring"
        style={{ "--score-angle": `${Math.round((pct / 100) * 360)}deg` }}
      >
        <div className="score-ring-inner">
          <strong>{pct}</strong>
          <span>/100</span>
        </div>
      </div>
    </div>
  );
}

function ResumeAnalysisPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const analysis = useMemo(() => {
    if (location.state?.analysis) return location.state.analysis;
    const cached = sessionStorage.getItem("resumeAnalysis");
    return cached ? JSON.parse(cached) : null;
  }, [location.state]);

  if (!analysis) {
    return (
      <SiteShell title="Resume Analysis" subtitle="No report found.">
        <section className="card">
          <h2>No analysis data available</h2>
          <p className="muted">Please run Analyze Resume from dashboard first.</p>
          <button className="btn btn-primary" onClick={() => navigate("/")}>Back to Dashboard</button>
        </section>
      </SiteShell>
    );
  }

  const roleInsight = analysis.target_role_insight || {};
  const metrics = analysis.metrics || {};
  const sections = analysis.section_presence || {};
  const categories = analysis.skill_category_counts || {};

  return (
    <SiteShell
      title="Detailed Resume Report"
      subtitle={analysis.summary || "AI generated diagnostics and improvement plan."}
    >
      <section className="layout-grid">
        <article className="card elevate analysis-score-card">
          <div className="analysis-score-head">
            <div>
              <h2>Overall Resume Score</h2>
              <p className="muted">Quality Band: <strong>{analysis.quality_band || "N/A"}</strong></p>
            </div>
            <RingScore score={analysis.resume_score} />
          </div>
        </article>
      </section>

      <section className="layout-grid">
        <article className="card elevate">
          <h3>Metric Breakdown</h3>
          <div className="metric-bars">
            {[
              ["Skill Depth", metrics.skill_depth],
              ["Detail Depth", metrics.detail_depth],
              ["Structure", metrics.structure_score],
              ["Action Verbs", metrics.action_verb_score],
            ].map(([label, value]) => (
              <div className="metric-bar-row" key={label}>
                <span>{label}</span>
                <div className="metric-bar-track">
                  <div className="metric-bar-fill" style={{ width: `${value || 0}%` }} />
                </div>
                <strong>{value || 0}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="card elevate">
          <h3>Section Completeness</h3>
          <div className="chip-wrap">
            {Object.entries(sections).map(([section, present]) => (
              <span key={section} className={`chip ${present ? "success" : ""}`}>
                {section}: {present ? "Present" : "Missing"}
              </span>
            ))}
          </div>
        </article>
      </section>

      <section className="layout-grid">
        <article className="card elevate">
          <h3>Strengths</h3>
          <ul>{(analysis.strengths || []).map((item, idx) => <li key={idx}>{item}</li>)}</ul>

          <h3>Weaknesses</h3>
          <ul>{(analysis.weaknesses || []).map((item, idx) => <li key={idx}>{item}</li>)}</ul>
        </article>

        <article className="card elevate">
          <h3>Skill Categories</h3>
          <div className="stats-grid">
            {Object.entries(categories).map(([key, value]) => (
              <p key={key}>
                <strong>{key.replace("_", " ")}:</strong> {value}
              </p>
            ))}
          </div>

          <h3>Top Skills</h3>
          <div className="chip-wrap">
            {(analysis.extracted_skills || []).slice(0, 20).map((skill, idx) => (
              <span className="chip" key={idx}>{skill}</span>
            ))}
          </div>
        </article>
      </section>

      <section className="layout-grid">
        <article className="card elevate">
          <h3>Skill Gap Analysis</h3>
          <p><strong>Predicted Role:</strong> {roleInsight.predicted_role || "Not enough data"}</p>
          <p><strong>Role Fit:</strong> {roleInsight.fit_percentage || 0}%</p>
          <h4>Missing Skills</h4>
          <div className="chip-wrap">
            {(roleInsight.missing_skills || []).map((skill, idx) => (
              <span key={idx} className="chip">{skill}</span>
            ))}
          </div>
          <div className="button-row">
            <button
              className="btn btn-accent"
              onClick={() => navigate("/learning-courses", { state: { skills: roleInsight.missing_skills || [] } })}
              disabled={!roleInsight.missing_skills || roleInsight.missing_skills.length === 0}
            >
              Courses To Learn
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/roadmaps", { state: { skills: roleInsight.missing_skills || [] } })}
              disabled={!roleInsight.missing_skills || roleInsight.missing_skills.length === 0}
            >
              Roadmaps
            </button>
          </div>
        </article>

        <article className="card elevate">
          <h3>Improvement Recommendations</h3>
          <ul>{(analysis.suggestions || []).map((item, idx) => <li key={idx}>{item}</li>)}</ul>
          <h4>Priority Plan</h4>
          <div className="priority-list">
            {(analysis.priority_plan || []).map((item, idx) => (
              <div className="priority-item" key={idx}>
                <span className="priority-pill">{item.priority}</span>
                <div>
                  <strong>{item.title}</strong>
                  <p className="muted">{item.why}</p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="card elevate">
        <h3>Keyword Focus</h3>
        <div className="chip-wrap">
          {(analysis.keyword_focus || []).map((keyword, idx) => (
            <span className="chip" key={idx}>{keyword}</span>
          ))}
        </div>
        <div className="button-row">
          <button className="btn btn-primary" onClick={() => navigate("/")}>Back to Dashboard</button>
        </div>
      </section>
    </SiteShell>
  );
}

export default ResumeAnalysisPage;
