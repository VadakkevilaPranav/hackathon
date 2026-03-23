// src/pages/PostJob.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createJob } from "../services/jobService";

const CATEGORIES = ["Plumbing", "Electrical", "Music", "Tutoring", "Delivery", "Cleaning", "Carpentry", "Cooking", "Other"];

export default function PostJob() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Plumbing",
    type: "job",
    price: "",
    date: "",
    time: "",
    area: "",
    city: "",
    isUrgent: false,
    contactPhone: "",
  });

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.area) {
      setToast("Please fill in all required fields.");
      setTimeout(() => setToast(""), 3000);
      return;
    }
    setLoading(true);
    try {
      const jobId = await createJob(user.uid, form);
      setToast("Job posted successfully!");
      setTimeout(() => navigate(`/job/${jobId}`), 1000);
    } catch (err) {
      console.error(err);
      setToast("Something went wrong. Try again.");
    } finally {
      setLoading(false);
      setTimeout(() => setToast(""), 3000);
    }
  };

  return (
    <div className="form-page">
      <h1>Post a {form.type === "skillswap" ? "Skill Swap" : "Job"}</h1>
      <p className="subtitle">Fill in the details — people nearby will see it instantly.</p>

      <form className="form-card" onSubmit={handleSubmit}>

        {/* Type Toggle */}
        <div className="form-group">
          <label>Type</label>
          <div className="filter-bar" style={{ marginBottom: 0 }}>
            <button type="button" className={`filter-btn ${form.type === "job" ? "active" : ""}`} onClick={() => setForm(f => ({ ...f, type: "job" }))}>
              💼 Job / Task
            </button>
            <button type="button" className={`filter-btn ${form.type === "skillswap" ? "active" : ""}`} onClick={() => setForm(f => ({ ...f, type: "skillswap" }))}>
              🔄 Skill Swap
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Title *</label>
          <input
            type="text"
            placeholder={form.type === "skillswap" ? "e.g. Guitar lessons for cooking lessons" : "e.g. Fix leaky kitchen tap"}
            value={form.title}
            onChange={set("title")}
            maxLength={80}
          />
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea
            rows={4}
            placeholder="Describe the work in detail — what needs to be done, any special requirements..."
            value={form.description}
            onChange={set("description")}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Category</label>
            <select value={form.category} onChange={set("category")}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Price (₹)</label>
            <input
              type="number"
              placeholder="e.g. 500"
              value={form.price}
              onChange={set("price")}
              min={0}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Date</label>
            <input type="date" value={form.date} onChange={set("date")} />
          </div>
          <div className="form-group">
            <label>Time</label>
            <input type="time" value={form.time} onChange={set("time")} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Area / Locality *</label>
            <input type="text" placeholder="e.g. Kozhikode Beach" value={form.area} onChange={set("area")} />
          </div>
          <div className="form-group">
            <label>City</label>
            <input type="text" placeholder="e.g. Kozhikode" value={form.city} onChange={set("city")} />
          </div>
        </div>

        <div className="form-group">
          <label>Contact Phone (for WhatsApp)</label>
          <input type="tel" placeholder="e.g. 9876543210" value={form.contactPhone} onChange={set("contactPhone")} />
        </div>

        {/* Urgent Toggle */}
        <div className="toggle-row">
          <div>
            <div className="toggle-label">🔴 Mark as Urgent</div>
            <div className="toggle-desc">Highlights your post — use only if time-critical</div>
          </div>
          <label className="toggle">
            <input type="checkbox" checked={form.isUrgent} onChange={set("isUrgent")} />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Posting..." : "Post Now →"}
        </button>
      </form>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
