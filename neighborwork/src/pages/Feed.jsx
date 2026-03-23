// src/pages/Feed.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllJobs } from "../services/jobService";

const CATEGORIES = ["All", "Plumbing", "Electrical", "Music", "Tutoring", "Delivery", "Cleaning", "Carpentry", "Cooking", "Other"];

function JobCard({ job }) {
  const isUrgent = job.isUrgent;
  const isSkillSwap = job.type === "skillswap";

  const formatDate = (ts) => {
    if (!ts) return "";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  return (
    <Link to={`/job/${job.id}`} className={`job-card ${isUrgent ? "urgent" : ""}`}>
      <div className="card-top">
        <span className="card-title">{job.title}</span>
        <span className={`badge ${isUrgent ? "urgent" : isSkillSwap ? "skillswap" : "open"}`}>
          {isUrgent ? "🔴 Urgent" : isSkillSwap ? "Skill Swap" : "Open"}
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
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [showUrgentOnly, setShowUrgentOnly] = useState(false);

  useEffect(() => {
    setLoading(true);
    getAllJobs({ type })
      .then(setJobs)
      .finally(() => setLoading(false));
  }, [type]);

  const filtered = jobs.filter((j) => {
    if (category !== "All" && j.category !== category) return false;
    if (showUrgentOnly && !j.isUrgent) return false;
    return true;
  });

  return (
    <div>
      <div className="feed-header">
        <h1>{type === "skillswap" ? "🔄 Skill Swap" : "💼 Browse Jobs"}</h1>
        <p>
          {type === "skillswap"
            ? "Exchange skills with people in your city"
            : "Find micro-jobs and tasks near you"}
        </p>
      </div>

      <div className="filter-bar">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            className={`filter-btn ${category === c ? "active" : ""}`}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
        <button
          className={`filter-btn ${showUrgentOnly ? "active" : ""}`}
          style={showUrgentOnly ? { borderColor: "var(--urgent)", color: "var(--urgent)", background: "var(--urgent-dim)" } : {}}
          onClick={() => setShowUrgentOnly((v) => !v)}
        >
          🔴 Urgent Only
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading jobs...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <p>No jobs found. Try a different filter or be the first to post!</p>
        </div>
      ) : (
        <div className="jobs-grid">
          {filtered.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
