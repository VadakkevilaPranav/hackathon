// src/pages/JobDetail.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getJobById, getUserById, expressInterest, addReview } from "../services/jobService";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";

function StarPicker({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: "6px", marginBottom: "0.5rem" }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          style={{ fontSize: "1.5rem", cursor: "pointer", opacity: s <= value ? 1 : 0.3 }}
          onClick={() => onChange(s)}
        >⭐</span>
      ))}
    </div>
  );
}

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { t } = useLang();
  const [job, setJob] = useState(null);
  const [poster, setPoster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [interested, setInterested] = useState(false);
  const [toast, setToast] = useState("");
  const [showReview, setShowReview] = useState(false);
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      const j = await getJobById(id);
      setJob(j);
      if (j) {
        const p = await getUserById(j.postedBy);
        setPoster(p);
        if (user && j.interestedUsers?.includes(user.uid)) setInterested(true);
      }
      setLoading(false);
    };
    load();
  }, [id, user]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleInterest = async () => {
    if (!user) return showToast(t.signInFirst);
    await expressInterest(id, user.uid);
    setInterested(true);
    showToast(t.interestToast);
  };

  const handleReview = async () => {
    if (!user) return;
    setReviewSubmitting(true);
    try {
      await addReview({ jobId: id, reviewerId: user.uid, revieweeId: job.postedBy, stars, comment });
      showToast(t.reviewSuccess);
      setShowReview(false);
    } catch {
      showToast(t.reviewError);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const renderStars = (rating) => {
    const full = Math.round(rating);
    return "★".repeat(full) + "☆".repeat(5 - full);
  };

  if (loading) return <div className="loading">{t.loading}</div>;
  if (!job) return <div className="loading">{t.jobNotFound}</div>;

  const whatsappLink = poster?.phone
    ? `https://wa.me/91${poster.phone}?text=Hi, I saw your post "${job.title}" on Proxify. I'm interested!`
    : null;

  return (
    <div className="detail-page">
      <div className="detail-header">
        <div className="detail-badges">
          {job.isUrgent && <span className="badge urgent">{t.urgent}</span>}
          {job.type === "skillswap" && <span className="badge skillswap">🔄 {t.skillSwap}</span>}
          <span className="badge open">{t.open}</span>
        </div>

        <h1 className="detail-title">{job.title}</h1>

        <div className="detail-meta">
          <span className="meta-tag">📍 {job.area}{job.city ? `, ${job.city}` : ""}</span>
          <span className="meta-tag">🏷️ {job.category}</span>
          {job.price && <span className="meta-tag price">₹{job.price}</span>}
          {job.date && <span className="meta-tag">📅 {job.date}</span>}
          {job.time && <span className="meta-tag">🕐 {job.time}</span>}
          {job.interestedUsers?.length > 0 && (
            <span className="meta-tag">👥 {job.interestedUsers.length} {t.interested}</span>
          )}
        </div>
      </div>

      <div className="detail-card">
        <h3>{t.description}</h3>
        <p>{job.description}</p>
      </div>

      {poster && (
        <div className="detail-card">
          <h3>{t.postedBy}</h3>
          <div className="poster-row">
            {poster.photo
              ? <img src={poster.photo} alt={poster.name} className="poster-avatar" />
              : <div className="poster-avatar-fallback">{poster.name?.[0]}</div>
            }
            <div>
              <div className="poster-name">{poster.name}</div>
              <div className="poster-rating">
                {poster.rating > 0
                  ? <><span className="stars">{renderStars(poster.rating)}</span> {poster.rating} ({poster.reviewCount} {t.reviews})</>
                  : t.noReviews
                }
              </div>
              {poster.skillsOffered?.length > 0 && (
                <div style={{ marginTop: "0.4rem", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  {t.skills}: {poster.skillsOffered.join(", ")}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {user && user.uid !== job.postedBy && (
        <div className="action-area" style={{ marginBottom: "1rem" }}>
          {whatsappLink && (
            <a href={whatsappLink} target="_blank" rel="noreferrer" className="btn-whatsapp">
              {t.contactWhatsapp}
            </a>
          )}
          <button className="btn-interest" onClick={handleInterest} disabled={interested}>
            {interested ? t.interestExpressed : t.expressInterest}
          </button>
          <button className="filter-btn" style={{ textAlign: "center" }} onClick={() => setShowReview(!showReview)}>
            {t.leaveReview}
          </button>
        </div>
      )}

      {showReview && (
        <div className="detail-card">
          <h3>{t.leaveReview}</h3>
          <StarPicker value={stars} onChange={setStars} />
          <textarea
            rows={3}
            placeholder={t.shareExperience}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            style={{
              width: "100%", background: "var(--surface2)", border: "1px solid var(--border)",
              color: "var(--text)", borderRadius: "8px", padding: "10px 14px",
              fontFamily: "DM Sans, sans-serif", fontSize: "0.9rem", marginTop: "0.5rem"
            }}
          />
          <button className="btn-primary" style={{ marginTop: "0.8rem" }} onClick={handleReview} disabled={reviewSubmitting}>
            {reviewSubmitting ? t.submitting : t.submitReview}
          </button>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}