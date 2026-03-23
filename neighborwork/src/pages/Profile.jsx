// src/pages/Profile.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import { getUserById, updateUserProfile, getJobsByUser } from "../services/jobService";

export default function Profile() {
  const { user } = useAuth();
  const { t } = useLang();
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
      setToast(t.profileSaved);
    } catch {
      setToast(t.profileError);
    } finally {
      setSaving(false);
      setTimeout(() => setToast(""), 3000);
    }
  };

  if (!profile) return <div className="loading">{t.loadingProfile}</div>;

  return (
    <div className="profile-page">
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
              : t.locationNotSet}
          </div>
          {profile.rating > 0 && (
            <div className="profile-sub" style={{ marginTop: "0.2rem" }}>
              ⭐ {profile.rating} ({profile.reviewCount} {t.reviews})
            </div>
          )}
          {profile.skillsOffered?.length > 0 && (
            <div className="skill-chips" style={{ marginTop: "0.5rem" }}>
              {profile.skillsOffered.map((s) => <span key={s} className="chip offer">{s}</span>)}
            </div>
          )}
          {profile.skillsNeeded?.length > 0 && (
            <div className="skill-chips">
              {profile.skillsNeeded.map((s) => <span key={s} className="chip need">{t.needsLabel} {s}</span>)}
            </div>
          )}
        </div>
        <button className="filter-btn" onClick={() => setEditing(!editing)}>
          {editing ? t.cancelEdit : t.editProfile}
        </button>
      </div>

      {editing && (
        <div className="form-card" style={{ marginBottom: "1.5rem" }}>
          <div className="form-row">
            <div className="form-group">
              <label>{t.areaLocalityLabel}</label>
              <input type="text" value={form.area} onChange={set("area")} placeholder={t.areaPlaceholder} />
            </div>
            <div className="form-group">
              <label>{t.cityLabel}</label>
              <input type="text" value={form.city} onChange={set("city")} placeholder={t.cityPlaceholder} />
            </div>
          </div>
          <div className="form-group">
            <label>{t.phoneLabel}</label>
            <input type="tel" value={form.phone} onChange={set("phone")} placeholder={t.contactPhonePlaceholder} />
          </div>
          <div className="form-group">
            <label>{t.skillsOfferedLabel}</label>
            <input type="text" value={form.skillsOffered} onChange={set("skillsOffered")} placeholder={t.skillsOfferedPlaceholder} />
          </div>
          <div className="form-group">
            <label>{t.skillsNeededLabel}</label>
            <input type="text" value={form.skillsNeeded} onChange={set("skillsNeeded")} placeholder={t.skillsNeededPlaceholder} />
          </div>
          <button className="btn-primary" onClick={saveProfile} disabled={saving}>
            {saving ? t.saving : t.saveProfile}
          </button>
        </div>
      )}

      <div className="section-title">{t.myPosts} ({jobs.length})</div>
      {jobs.length === 0 ? (
        <div className="empty-state" style={{ padding: "2rem 0" }}>
          <p>{t.noPostsYet} <Link to="/post" style={{ color: "var(--accent)" }}>{t.postAJob}</Link></p>
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
                {job.isUrgent && <span className="badge urgent">{t.urgent}</span>}
                <span className="badge open">{t.open}</span>
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