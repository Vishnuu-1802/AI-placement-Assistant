import { useEffect, useMemo, useState } from "react";
import SiteShell from "./SiteShell";
import { useAuth } from "./auth.jsx";

function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [saved, setSaved] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const initialForm = useMemo(
    () => ({
      name: user?.name || "",
      headline: user?.profile?.headline || "",
      bio: user?.profile?.bio || "",
      location: user?.profile?.location || "",
      experienceLevel: user?.profile?.experienceLevel || "",
      targetRole: user?.profile?.targetRole || "",
      github: user?.profile?.github || "",
      linkedin: user?.profile?.linkedin || "",
      skills: (user?.profile?.skills || []).join(", "),
    }),
    [user]
  );

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    setForm(initialForm);
  }, [initialForm]);

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setSaved("");
    setError("");

    try {
      await updateProfile({
        ...form,
        skills: form.skills
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
      });
      setSaved("Profile updated successfully.");
    } catch (err) {
      setError(err?.response?.data?.error || "Profile update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteShell
      title="User Profile"
      subtitle="Maintain your personal details, target role, and skill focus."
    >
      <section className="card">
        <h2>Profile Details</h2>
        {saved && <p className="form-success">{saved}</p>}
        {error && <p className="form-error">{error}</p>}
        <form className="profile-form" onSubmit={onSubmit}>
          <label>Full Name</label>
          <input value={form.name} onChange={(event) => setField("name", event.target.value)} />

          <label>Headline</label>
          <input value={form.headline} onChange={(event) => setField("headline", event.target.value)} />

          <label>Bio</label>
          <textarea value={form.bio} onChange={(event) => setField("bio", event.target.value)} />

          <label>Location</label>
          <input value={form.location} onChange={(event) => setField("location", event.target.value)} />

          <label>Experience Level</label>
          <input
            value={form.experienceLevel}
            onChange={(event) => setField("experienceLevel", event.target.value)}
            placeholder="Beginner / Intermediate / Advanced"
          />

          <label>Target Role</label>
          <input value={form.targetRole} onChange={(event) => setField("targetRole", event.target.value)} />

          <label>Skills (comma-separated)</label>
          <input value={form.skills} onChange={(event) => setField("skills", event.target.value)} />

          <label>GitHub URL</label>
          <input value={form.github} onChange={(event) => setField("github", event.target.value)} />

          <label>LinkedIn URL</label>
          <input value={form.linkedin} onChange={(event) => setField("linkedin", event.target.value)} />

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </section>
    </SiteShell>
  );
}

export default ProfilePage;
