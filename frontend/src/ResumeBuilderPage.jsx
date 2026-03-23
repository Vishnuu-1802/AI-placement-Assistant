import { useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SiteShell from "./SiteShell";
import { useAuth } from "./auth.jsx";

const API_BASE = "http://127.0.0.1:8000";

function ResumeBuilderPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const passedAssessments = useMemo(() => {
    try {
      const raw = JSON.parse(localStorage.getItem("acp_passed_tests") || "[]");
      return Array.isArray(raw) ? raw.filter((item) => item?.passed) : [];
    } catch {
      return [];
    }
  }, []);

  const defaultSkills = useMemo(() => {
    const fromProfile = user?.profile?.skills || [];
    try {
      const fromAnalysis = JSON.parse(sessionStorage.getItem("latestExtractedSkills") || "[]");
      const merged = [...fromProfile, ...fromAnalysis].map((s) => String(s).trim()).filter(Boolean);
      return [...new Set(merged)].join(", ");
    } catch {
      return fromProfile.join(", ");
    }
  }, [user]);

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    location: user?.profile?.location || "",
    linkedin: user?.profile?.linkedin || "",
    github: user?.profile?.github || "",
    target_company: "",
    target_role: user?.profile?.targetRole || "",
    summary: user?.profile?.bio || "",
    skills: defaultSkills,
    projects: "",
    experience: "",
    education: "",
    certifications: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const downloadResume = async () => {
    try {
      setLoading(true);
      setError("");
      const payload = {
        ...form,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        passed_assessments: passedAssessments,
      };

      const res = await axios.post(`${API_BASE}/build_resume_docx`, payload, {
        responseType: "blob",
      });

      const blob = new Blob(
        [res.data],
        { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${(form.name || "candidate").replace(/\s+/g, "_")}_ATS_Resume.docx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to generate Word resume. Ensure ai-service has python-docx installed.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteShell
      title="ATS Resume Builder"
      subtitle="Generate a placement-ready, ATS-friendly Word resume using your profile, skills, and passed tests."
    >
      <section className="card elevate">
        <h2>Target Details</h2>
        {error && <p className="form-error">{error}</p>}
        <div className="resume-builder-grid">
          <label>Full Name<input value={form.name} onChange={(e) => update("name", e.target.value)} /></label>
          <label>Email<input value={form.email} onChange={(e) => update("email", e.target.value)} /></label>
          <label>Phone<input value={form.phone} onChange={(e) => update("phone", e.target.value)} /></label>
          <label>Location<input value={form.location} onChange={(e) => update("location", e.target.value)} /></label>
          <label>Target Company<input value={form.target_company} onChange={(e) => update("target_company", e.target.value)} /></label>
          <label>Target Role<input value={form.target_role} onChange={(e) => update("target_role", e.target.value)} /></label>
          <label>LinkedIn URL<input value={form.linkedin} onChange={(e) => update("linkedin", e.target.value)} /></label>
          <label>GitHub URL<input value={form.github} onChange={(e) => update("github", e.target.value)} /></label>
        </div>
      </section>

      <section className="card elevate">
        <h2>Resume Content</h2>
        <div className="resume-builder-stack">
          <label>Professional Summary<textarea value={form.summary} onChange={(e) => update("summary", e.target.value)} /></label>
          <label>Skills (comma-separated)<input value={form.skills} onChange={(e) => update("skills", e.target.value)} /></label>
          <label>Projects (one per line)<textarea value={form.projects} onChange={(e) => update("projects", e.target.value)} /></label>
          <label>Experience (one per line)<textarea value={form.experience} onChange={(e) => update("experience", e.target.value)} /></label>
          <label>Education (one per line)<textarea value={form.education} onChange={(e) => update("education", e.target.value)} /></label>
          <label>Certifications (one per line)<textarea value={form.certifications} onChange={(e) => update("certifications", e.target.value)} /></label>
        </div>
      </section>

      <section className="card elevate">
        <h2>Passed Skill Tests Included</h2>
        {passedAssessments.length ? (
          <div className="chip-wrap">
            {passedAssessments.map((item, idx) => (
              <span className="chip success" key={idx}>{item.skill} ({item.percentage}%)</span>
            ))}
          </div>
        ) : (
          <p className="muted">No passed tests found yet. Pass skill tests to auto-include them in resume.</p>
        )}

        <div className="button-row">
          <button className="btn btn-primary" type="button" disabled={loading} onClick={downloadResume}>
            {loading ? "Generating Word File..." : "Download ATS Resume (.docx)"}
          </button>
          <button className="btn btn-secondary" type="button" onClick={() => navigate("/")}>Back to Dashboard</button>
        </div>
      </section>
    </SiteShell>
  );
}

export default ResumeBuilderPage;
