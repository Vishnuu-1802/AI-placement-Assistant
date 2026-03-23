import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./App.css";
import SiteShell from "./SiteShell";

const API_BASE = "http://127.0.0.1:8000";

function App() {
  const navigate = useNavigate();
  const [resumeText, setResumeText] = useState("");
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [uploadMeta, setUploadMeta] = useState(null);

  const handlePdfUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("resume", file);

    try {
      setPdfLoading(true);
      const res = await axios.post(`${API_BASE}/extract_resume_pdf`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResumeText(res.data.resume_text || "");
      sessionStorage.setItem("latestResumeText", res.data.resume_text || "");
      setUploadMeta({
        pageCount: res.data.page_count || 0,
        wordCount: res.data.word_count || 0,
        fileName: file.name,
      });
      setPrediction(null);
    } catch (err) {
      console.error("PDF upload failed:", err);
      alert(err?.response?.data?.error || "PDF extraction failed.");
    } finally {
      setPdfLoading(false);
    }
  };

  const extractSkills = async () => {
    if (!resumeText.trim()) return alert("Paste resume text or upload a PDF first.");
    try {
      const response = await axios.post(`${API_BASE}/extract_skills`, {
        resume_text: resumeText,
      });
      setSkills(response.data.skills || []);
      sessionStorage.setItem("latestExtractedSkills", JSON.stringify(response.data.skills || []));
    } catch (error) {
      console.error("Error extracting skills:", error);
      alert("Skill extraction failed.");
    }
  };

  const analyzeResume = async () => {
    if (!resumeText.trim()) return alert("Paste resume text or upload a PDF first.");
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE}/analyze_resume_detailed`, {
        resume_text: resumeText,
      });

      sessionStorage.setItem("resumeAnalysis", JSON.stringify(res.data));
      sessionStorage.setItem("latestResumeText", resumeText);
      navigate("/resume-analysis", {
        state: { analysis: res.data, source: uploadMeta?.fileName || "Pasted resume" },
      });
    } catch (error) {
      console.error("Detailed analysis failed:", error);
      alert(error?.response?.data?.error || "Detailed resume analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  const predictCareer = async () => {
    try {
      const localSkills = skills.length
        ? skills
        : (await axios.post(`${API_BASE}/extract_skills`, { resume_text: resumeText })).data.skills || [];

      if (!localSkills.length) return alert("No skills detected from this resume.");
      setSkills(localSkills);

      const res = await axios.post(`${API_BASE}/predict_role`, { skills: localSkills });
      setPrediction(res.data);
    } catch (err) {
      console.error("Prediction failed", err);
      alert("Career prediction failed.");
    }
  };

  return (
    <SiteShell
      title="Career Intelligence Workspace"
      subtitle="Upload resume PDF or paste content, then run full AI analysis on a dedicated report screen."
    >
      <section className="layout-grid">
        <article className="card kpi-card">
          <h3>Capabilities</h3>
          <div className="chip-wrap">
            <span className="chip">PDF Resume Parsing</span>
            <span className="chip">Detailed Resume Diagnostics</span>
            <span className="chip">Role Fit Analytics</span>
            <span className="chip">Skill Assessments</span>
            <span className="chip">ATS Resume Builder</span>
          </div>
          <div className="button-row" style={{ marginTop: "12px" }}>
            <button className="btn btn-primary" type="button" onClick={() => navigate("/resume-builder")}>
              Build Resume
            </button>
          </div>
        </article>
      </section>

      <section className="layout-grid">
        <article className="card card-lg elevate">
          <h2>Resume Analyzer</h2>
          <p className="muted">Upload a PDF or paste resume text. Detailed analysis opens in a separate report page.</p>

          <label className="file-drop" htmlFor="resume-pdf">
            <input
              id="resume-pdf"
              type="file"
              accept=".pdf,application/pdf"
              onChange={handlePdfUpload}
              disabled={pdfLoading}
            />
            <span>{pdfLoading ? "Extracting PDF..." : "Upload Resume PDF"}</span>
            <small className="muted">Supports text-based PDF resumes.</small>
          </label>

          {uploadMeta && (
            <div className="upload-meta">
              <span>{uploadMeta.fileName}</span>
              <span>{uploadMeta.pageCount} pages</span>
              <span>{uploadMeta.wordCount} words</span>
            </div>
          )}

          <textarea
            className="text-input"
            placeholder="Or paste your resume text here..."
            value={resumeText}
            onChange={(e) => {
              setResumeText(e.target.value);
              sessionStorage.setItem("latestResumeText", e.target.value);
            }}
          />

          <div className="button-row">
            <button className="btn btn-primary" onClick={analyzeResume} disabled={loading || pdfLoading}>
              {loading ? "Generating Detailed Report..." : "Analyze Resume"}
            </button>
            <button className="btn btn-secondary" onClick={extractSkills} disabled={pdfLoading}>
              Extract Skills
            </button>
            <button className="btn btn-accent" onClick={predictCareer} disabled={pdfLoading}>
              Predict Career Role
            </button>
          </div>
        </article>

        <article className="card elevate">
          <h2>Extracted Skills</h2>
          {skills.length === 0 ? (
            <p className="muted">No skills extracted yet.</p>
          ) : (
            <div className="chip-wrap">
              {skills.map((skill, index) => (
                <span className="chip" key={index}>
                  {skill}
                </span>
              ))}
            </div>
          )}
        </article>
      </section>

      {prediction && (
        <section className="card elevate">
          <h2>{prediction.predicted_role}</h2>
          <div className="stats-grid">
            <p><strong>Fit:</strong> {prediction.fit_percentage}%</p>
            <p><strong>Salary:</strong> {prediction.salary_range}</p>
            <p><strong>Experience:</strong> {prediction.experience_required} years</p>
            <p><strong>Level:</strong> {prediction.job_level}</p>
            <p><strong>Location:</strong> {prediction.location}</p>
            <p><strong>Certification:</strong> {prediction.recommended_certifications}</p>
          </div>

          <h3>Matched Skills</h3>
          <div className="chip-wrap">
            {prediction.matched_skills.map((s, i) => (
              <span className="chip success" key={i}>{s}</span>
            ))}
          </div>

          <h3>Missing Skills</h3>
          <div className="skill-list">
            {prediction.missing_skills.map((s, i) => (
              <div className="skill-row" key={i}>
                <span>{s}</span>
                <Link to={`/test?skill=${s}`}>
                  <button className="btn btn-primary">Take Skill Test</button>
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </SiteShell>
  );
}

export default App;
