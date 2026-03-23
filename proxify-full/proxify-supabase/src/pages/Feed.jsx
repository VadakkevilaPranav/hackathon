// src/pages/Feed.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllJobs } from '../services/jobService'
import { useLang } from '../context/LanguageContext'

const CATEGORY_KEYS = ['all','plumbing','electrical','music','tutoring','delivery','cleaning','carpentry','cooking','other']

function JobCard({ job, t }) {
  const isUrgent = job.is_urgent
  const isSkillSwap = job.type === 'skillswap'
  return (
    <Link to={`/job/${job.id}`} className={`job-card ${isUrgent ? 'urgent' : ''}`}>
      <div className="card-top">
        <span className="card-title">{job.title}</span>
        <span className={`badge ${isUrgent ? 'urgent' : isSkillSwap ? 'skillswap' : 'open'}`}>
          {isUrgent ? t.urgent : isSkillSwap ? t.skillSwap : t.open}
        </span>
      </div>
      <p className="card-desc">{job.description?.slice(0, 100)}{job.description?.length > 100 ? '…' : ''}</p>
      <div className="card-meta">
        <span className="meta-tag">📍 {job.area}</span>
        <span className="meta-tag">🏷️ {job.category}</span>
        {job.price && <span className="meta-tag price">₹{job.price}</span>}
        {job.date && <span className="meta-tag">📅 {job.date}</span>}
        {job.time && <span className="meta-tag">🕐 {job.time}</span>}
      </div>
    </Link>
  )
}

export default function Feed({ type }) {
  const { t } = useLang()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('all')
  const [urgentOnly, setUrgentOnly] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    setLoading(true)
    getAllJobs({ type }).then(setJobs).finally(() => setLoading(false))
  }, [type])

  const filtered = jobs.filter(j => {
    if (category !== 'all' && j.category?.toLowerCase() !== category) return false
    if (urgentOnly && !j.is_urgent) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      const matches =
        j.title?.toLowerCase().includes(q) ||
        j.description?.toLowerCase().includes(q) ||
        j.area?.toLowerCase().includes(q) ||
        j.city?.toLowerCase().includes(q) ||
        j.category?.toLowerCase().includes(q)
      if (!matches) return false
    }
    return true
  })

  return (
    <div>
      <div className="feed-header">
        <h1>{type === 'skillswap' ? t.skillSwapTitle : t.browseJobsTitle}</h1>
        <p>{type === 'skillswap' ? t.skillSwapSubtitle : t.browseJobsSubtitle}</p>
      </div>

      {/* Search Bar */}
      <div className="search-bar-wrap">
        <span className="search-icon">🔍</span>
        <input
          className="search-bar"
          type="text"
          placeholder={type === 'skillswap' ? 'Search skills, areas...' : 'Search jobs, areas, categories...'}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button className="search-clear" onClick={() => setSearch('')}>✕</button>
        )}
      </div>

      <div className="filter-bar">
        {CATEGORY_KEYS.map(key => (
          <button key={key} className={`filter-btn ${category === key ? 'active' : ''}`} onClick={() => setCategory(key)}>{t[key]}</button>
        ))}
        <button
          className={`filter-btn ${urgentOnly ? 'active' : ''}`}
          style={urgentOnly ? { borderColor: 'var(--urgent)', color: 'var(--urgent)', background: 'var(--urgent-dim)' } : {}}
          onClick={() => setUrgentOnly(v => !v)}
        >{t.urgentOnly}</button>
      </div>

      {/* Result count when searching */}
      {search.trim() && (
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"
        </p>
      )}

      {loading ? <div className="loading">{t.loadingJobs}</div>
        : filtered.length === 0 ? <div className="empty-state"><div className="empty-icon">🔍</div><p>{t.noJobsFound}</p></div>
        : <div className="jobs-grid">{filtered.map(job => <JobCard key={job.id} job={job} t={t} />)}</div>
      }
    </div>
  )
}