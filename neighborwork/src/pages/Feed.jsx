// src/pages/Feed.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllJobs } from "../services/jobService";
import { useLang } from "../context/LanguageContext";

const CATEGORY_KEYS = ["all", "plumbing", "electrical", "music", "tutoring", "delivery", "cleaning", "carpentry", "cooking", "other"];

function JobCard({ job, t }) {
  const isUrgent = job.isUrgent;
  const isSkillSwap = job.type === "skillswap";

  return (
    <Link to={`/job/${job.id}`} className={`job-card ${isUrgent ? "urgent" : ""}`}>
      <div className="card-top">
        <span className="card-title">{job.title}</span>
        <span className={`badge ${isUrgent ? "urgent" : isSkillSwap ? "skillswap" : "open"}`}>
          {isUrgent ? t.urgent : isSkillSwap ? t.skillSwap : t.open}
        </span>
      </div>
      <p className="card-desc">
        {job.description?.slice(0, 100)}{job.description?.length > 100 ? "…" : ""}
      </p>
      <div className="card-meta">
        <span className="meta-tag">📍 {job.area}</span>
        <span className="meta-tag">🏷️ {job.category}</span>
        {job.price && <span className="meta-tag price">₹{job.price}</span>}
        {job.date && <span className="meta-tag">📅 {job.date}</span>}
        {job.time && <span className="meta-tag">🕐 {job.time}</span>}
      </div>
    </Link>
  );
}

export default function Feed({ type }) {
  const { t } = useLang();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [showUrgentOnly, setShowUrgentOnly] = useState(false);

  useEffect(() => {
    setLoading(true);
    getAllJobs({ type })
      .then(setJobs)
      .finally(() => setLoading(false));
  }, [type]);

  const filtered = jobs.filter((j) => {
    if (category !== "all" && j.category?.toLowerCase() !== category) return false;
    if (showUrgentOnly && !j.isUrgent) return false;
    return true;
  });

  return (
    <div>
      <div className="feed-header">
        <h1>{type === "skillswap" ? t.skillSwapTitle : t.browseJobsTitle}</h1>
        <p>{type === "skillswap" ? t.skillSwapSubtitle : t.browseJobsSubtitle}</p>
      </div>

      <div className="filter-bar">
        {CATEGORY_KEYS.map((key) => (
          <button
            key={key}
            className={`filter-btn ${category === key ? "active" : ""}`}
            onClick={() => setCategory(key)}
          >
            {t[key]}
          </button>
        ))}
        <button
          className={`filter-btn ${showUrgentOnly ? "active" : ""}`}
          style={showUrgentOnly ? { borderColor: "var(--urgent)", color: "var(--urgent)", background: "var(--urgent-dim)" } : {}}
          onClick={() => setShowUrgentOnly((v) => !v)}
        >
          {t.urgentOnly}
        </button>
      </div>

      {loading ? (
        <div className="loading">{t.loadingJobs}</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <p>{t.noJobsFound}</p>
        </div>
      ) : (
        <div className="jobs-grid">
          {filtered.map((job) => (
            <JobCard key={job.id} job={job} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}