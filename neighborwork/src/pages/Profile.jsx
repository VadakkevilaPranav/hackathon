// src/pages/Profile.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserById, updateUserProfile, getJobsByUser } from "../services/jobService";

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const [form, setForm] = useState({
    area: "", city: "", phone: "",
    skillsOffered: "",
    skillsNeeded: "",
  });

  useEffect(() => {
    if (!user) return;
    getUserById(user.uid).then((p) => {
      setProfile(p);
      setForm({
        area: p.area || "",
        city: p.city || "",
        phone: p.phone || "",
        skillsOffered: p.skillsOffered?.join(", ") || "",
        skillsNeeded: p.skillsNeeded?.join(", ") || "",
      });
    });
    getJobsByUser(user.uid).then(setJobs);
  }, [user]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const saveProfile = async () => {
    setSaving(true);
    try {
      const data = {
        area: form.area,
        city: form.city,
        phone: form.phone,
        skillsOffered: form.skillsOffered.split(",").map((s) => s.trim()).filter(Boolean),
        skillsNeeded: form.skillsNeeded.split(",").map((s) => s.trim()).filter(Boolean),
      };
      await updateUserProfile(user.uid, data);
      setProfile((p) => ({ ...p, ...data }));
      setEditing(false);
      setToast("Profile updated!");
    } catch {
      setToast("Failed to save. Try again.");
    } finally {
      setSaving(false);
      setTimeout(() => setToast(""), 3000);
    }
  };

  if (!profile) return <div className="loading">Loading profile...</div>;

  return (
    <div className="profile-page">
      {/* Hero */}
      <div className="profile-hero">
        {profile.photo
          ? <img src={profile.photo} alt={profile.name} className="profile-avatar" />
          : <div className="poster-avatar-fallback" style={{ width: 72, height: 72, fontSize: "1.5rem" }}>{profile.name?.[0]}</div>
        }
        <div style={{ flex: 1 }}>
          <div className="profile-name">{profile.name}</div>
          <div className="profile-sub">
            {profile.area || profile.city
              ? `📍 ${[profile.area, profile.city].filter(Boolean).join(", ")}`
              : "📍 Location not set"}
          </div>
          {profile.rating > 0 && (
            <div className="profile-sub" style={{ marginTop: "0.2rem" }}>
              ⭐ {profile.rating} ({profile.reviewCount} reviews)
            </div>
          )}
          {profile.skillsOffered?.length > 0 && (
            <div className="skill-chips" style={{ marginTop: "0.5rem" }}>
              {profile.skillsOffered.map((s) => <span key={s} className="chip offer">{s}</span>)}
            </div>
          )}
          {profile.skillsNeeded?.length > 0 && (
            <div className="skill-chips">
              {profile.skillsNeeded.map((s) => <span key={s} className="chip need">needs: {s}</span>)}
            </div>
          )}
        </div>
        <button className="filter-btn" onClick={() => setEditing(!editing)}>
          {editing ? "Cancel" : "✏️ Edit"}
        </button>
      </div>

      {/* Edit Form */}
      {editing && (
        <div className="form-card" style={{ marginBottom: "1.5rem" }}>
          <div className="form-row">
            <div className="form-group">
              <label>Area / Locality</label>
              <input type="text" value={form.area} onChange={set("area")} placeholder="e.g. Kozhikode Beach" />
            </div>
            <div className="form-group">
              <label>City</label>
              <input type="text" value={form.city} onChange={set("city")} placeholder="e.g. Kozhikode" />
            </div>
          </div>
          <div className="form-group">
            <label>Phone (for WhatsApp contact)</label>
            <input type="tel" value={form.phone} onChange={set("phone")} placeholder="e.g. 9876543210" />
          </div>
          <div className="form-group">
            <label>Skills I Offer (comma separated)</label>
            <input type="text" value={form.skillsOffered} onChange={set("skillsOffered")} placeholder="e.g. Plumbing, Guitar, Cooking" />
          </div>
          <div className="form-group">
            <label>Skills I Want to Learn (comma separated)</label>
            <input type="text" value={form.skillsNeeded} onChange={set("skillsNeeded")} placeholder="e.g. Driving, Tailoring" />
          </div>
          <button className="btn-primary" onClick={saveProfile} disabled={saving}>
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      )}

      {/* My Jobs */}
      <div className="section-title">My Posts ({jobs.length})</div>
      {jobs.length === 0 ? (
        <div className="empty-state" style={{ padding: "2rem 0" }}>
          <p>You haven't posted anything yet. <Link to="/post" style={{ color: "var(--accent)" }}>Post a job →</Link></p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
          {jobs.map((job) => (
            <Link
              key={job.id}
              to={`/job/${job.id}`}
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: "10px", padding: "1rem 1.2rem", textDecoration: "none", color: "inherit"
              }}
            >
              <div>
                <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, marginBottom: "0.2rem" }}>
                  {job.title}
                </div>
                <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  {job.category} · ₹{job.price || "—"} · {job.area}
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                {job.isUrgent && <span className="badge urgent">Urgent</span>}
                <span className="badge open">{job.status}</span>
                <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  👥 {job.interestedUsers?.length || 0}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
