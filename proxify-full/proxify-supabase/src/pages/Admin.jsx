// src/pages/Admin.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LanguageContext'
import {
  isAdmin, getAdminStats, getAllUsers, getAllJobsAdmin,
  getAllReviews, deleteJob, deleteUser, deleteReview
} from '../services/adminService'

export default function Admin() {
  const { user } = useAuth()
  const { t } = useLang()
  const navigate = useNavigate()
  const [tab, setTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [jobs, setJobs] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null) // { type, id, name }
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (!user || !isAdmin(user)) { navigate('/'); return }
    loadData()
  }, [user])

  const loadData = async () => {
    setLoading(true)
    try {
      const [s, u, j, r] = await Promise.all([
        getAdminStats(), getAllUsers(), getAllJobsAdmin(), getAllReviews()
      ])
      setStats(s); setUsers(u); setJobs(j); setReviews(r)
    } catch (e) { console.error('Admin load error:', e) }
    setLoading(false)
  }

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const handleDelete = async () => {
    if (!confirmDelete) return
    try {
      if (confirmDelete.type === 'job') await deleteJob(confirmDelete.id)
      else if (confirmDelete.type === 'user') await deleteUser(confirmDelete.id)
      else if (confirmDelete.type === 'review') await deleteReview(confirmDelete.id)
      showToast(`${confirmDelete.type} deleted successfully`)
      setConfirmDelete(null)
      loadData()
    } catch (e) {
      showToast(`Failed to delete: ${e.message}`)
      setConfirmDelete(null)
    }
  }

  const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

  if (loading) return <div className="loading">{t.loading}</div>

  const filteredUsers = users.filter(u => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.area?.toLowerCase().includes(q) || u.city?.toLowerCase().includes(q)
  })

  const filteredJobs = jobs.filter(j => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return j.title?.toLowerCase().includes(q) || j.category?.toLowerCase().includes(q) || j.area?.toLowerCase().includes(q) || j.city?.toLowerCase().includes(q)
  })

  const filteredReviews = reviews.filter(r => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return r.comment?.toLowerCase().includes(q)
  })

  // Map user IDs to names for display
  const userMap = {}
  users.forEach(u => { userMap[u.id] = u.name || u.email })

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>⚙️ {t.adminTitle || 'Admin Dashboard'}</h1>
        <p className="subtitle">{t.adminSubtitle || 'Manage users, jobs, and reviews'}</p>
      </div>

      {/* Stats Cards */}
      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{stats?.totalUsers ?? 0}</div>
          <div className="stat-label">{t.adminUsers || 'Users'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💼</div>
          <div className="stat-value">{stats?.totalJobs ?? 0}</div>
          <div className="stat-label">{t.adminJobs || 'Total Jobs'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🟢</div>
          <div className="stat-value">{stats?.openJobs ?? 0}</div>
          <div className="stat-label">{t.adminOpenJobs || 'Open'}</div>
        </div>
        <div className="stat-card urgent">
          <div className="stat-icon">🔴</div>
          <div className="stat-value">{stats?.urgentJobs ?? 0}</div>
          <div className="stat-label">{t.adminUrgentJobs || 'Urgent'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔄</div>
          <div className="stat-value">{stats?.skillSwaps ?? 0}</div>
          <div className="stat-label">{t.adminSkillSwaps || 'Skill Swaps'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-value">{stats?.totalReviews ?? 0}</div>
          <div className="stat-label">{t.adminReviews || 'Reviews'}</div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="admin-tabs">
        {['overview', 'users', 'jobs', 'reviews'].map(t2 => (
          <button
            key={t2}
            className={`admin-tab ${tab === t2 ? 'active' : ''}`}
            onClick={() => { setTab(t2); setSearch('') }}
          >
            {t2 === 'overview' ? '📊' : t2 === 'users' ? '👥' : t2 === 'jobs' ? '💼' : '⭐'}{' '}
            {t[`adminTab_${t2}`] || t2.charAt(0).toUpperCase() + t2.slice(1)}
          </button>
        ))}
      </div>

      {/* Search (for non-overview tabs) */}
      {tab !== 'overview' && (
        <div className="admin-search">
          <span className="search-icon">🔍</span>
          <input
            className="search-bar"
            type="text"
            placeholder={`Search ${tab}...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button className="search-clear" onClick={() => setSearch('')}>✕</button>}
        </div>
      )}

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div className="admin-overview">
          <div className="admin-section">
            <h3>📅 {t.adminRecentJobs || 'Recent Jobs'}</h3>
            <div className="admin-list">
              {jobs.slice(0, 5).map(job => (
                <div key={job.id} className="admin-list-item">
                  <div>
                    <strong>{job.title}</strong>
                    <span className="admin-list-meta">{job.category} · {job.area} · {fmtDate(job.created_at)}</span>
                  </div>
                  <div className="admin-list-badges">
                    {job.is_urgent && <span className="badge urgent">Urgent</span>}
                    <span className={`badge ${job.status === 'open' ? 'open' : ''}`}>{job.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="admin-section">
            <h3>👤 {t.adminRecentUsers || 'Recent Users'}</h3>
            <div className="admin-list">
              {users.slice(0, 5).map(u => (
                <div key={u.id} className="admin-list-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    {u.photo
                      ? <img src={u.photo} alt="" className="admin-avatar" />
                      : <div className="admin-avatar-fallback">{u.name?.[0] || '?'}</div>
                    }
                    <div>
                      <strong>{u.name}</strong>
                      <span className="admin-list-meta">{u.email}</span>
                    </div>
                  </div>
                  <span className="admin-list-meta">{fmtDate(u.created_at)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {tab === 'users' && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t.adminColName || 'Name'}</th>
                <th>{t.adminColEmail || 'Email'}</th>
                <th>{t.adminColArea || 'Area'}</th>
                <th>{t.adminColRating || 'Rating'}</th>
                <th>{t.adminColJoined || 'Joined'}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {u.photo
                        ? <img src={u.photo} alt="" className="admin-avatar-sm" />
                        : <div className="admin-avatar-fallback-sm">{u.name?.[0] || '?'}</div>
                      }
                      {u.name}
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>{[u.area, u.city].filter(Boolean).join(', ') || '—'}</td>
                  <td>{u.rating > 0 ? `⭐ ${u.rating} (${u.review_count})` : '—'}</td>
                  <td>{fmtDate(u.created_at)}</td>
                  <td>
                    <button
                      className="btn-delete"
                      onClick={() => setConfirmDelete({ type: 'user', id: u.id, name: u.name || u.email })}
                    >🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && <div className="admin-empty">No users found</div>}
        </div>
      )}

      {/* Jobs Tab */}
      {tab === 'jobs' && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t.adminColTitle || 'Title'}</th>
                <th>{t.adminColType || 'Type'}</th>
                <th>{t.adminColCategory || 'Category'}</th>
                <th>{t.adminColArea || 'Area'}</th>
                <th>{t.adminColPrice || 'Price'}</th>
                <th>{t.adminColStatus || 'Status'}</th>
                <th>{t.adminColPostedBy || 'Posted By'}</th>
                <th>{t.adminColDate || 'Date'}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map(j => (
                <tr key={j.id} className={j.is_urgent ? 'row-urgent' : ''}>
                  <td><strong>{j.title}</strong></td>
                  <td><span className={`badge ${j.type === 'skillswap' ? 'skillswap' : 'open'}`}>{j.type}</span></td>
                  <td>{j.category}</td>
                  <td>{[j.area, j.city].filter(Boolean).join(', ')}</td>
                  <td>{j.price ? `₹${j.price}` : '—'}</td>
                  <td><span className={`badge ${j.status === 'open' ? 'open' : ''}`}>{j.status}</span></td>
                  <td>{userMap[j.posted_by] || j.posted_by?.slice(0, 8)}</td>
                  <td>{fmtDate(j.created_at)}</td>
                  <td>
                    <button
                      className="btn-delete"
                      onClick={() => setConfirmDelete({ type: 'job', id: j.id, name: j.title })}
                    >🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredJobs.length === 0 && <div className="admin-empty">No jobs found</div>}
        </div>
      )}

      {/* Reviews Tab */}
      {tab === 'reviews' && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t.adminColReviewer || 'Reviewer'}</th>
                <th>{t.adminColReviewee || 'Reviewee'}</th>
                <th>{t.adminColStars || 'Stars'}</th>
                <th>{t.adminColComment || 'Comment'}</th>
                <th>{t.adminColDate || 'Date'}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.map(r => (
                <tr key={r.id}>
                  <td>{userMap[r.reviewer_id] || r.reviewer_id?.slice(0, 8)}</td>
                  <td>{userMap[r.reviewee_id] || r.reviewee_id?.slice(0, 8)}</td>
                  <td>{'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}</td>
                  <td className="admin-comment-cell">{r.comment || '—'}</td>
                  <td>{fmtDate(r.created_at)}</td>
                  <td>
                    <button
                      className="btn-delete"
                      onClick={() => setConfirmDelete({ type: 'review', id: r.id, name: `${r.stars}★ review` })}
                    >🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredReviews.length === 0 && <div className="admin-empty">No reviews found</div>}
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="admin-modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h3>⚠️ {t.adminConfirmDelete || 'Confirm Delete'}</h3>
            <p>{t.adminDeleteMsg || 'Are you sure you want to delete'} <strong>{confirmDelete.name}</strong>?</p>
            {confirmDelete.type === 'user' && (
              <p style={{ fontSize: '0.82rem', color: 'var(--urgent)', marginTop: '0.5rem' }}>
                This will also delete all their jobs and reviews.
              </p>
            )}
            <div className="admin-modal-actions">
              <button className="filter-btn" onClick={() => setConfirmDelete(null)}>
                {t.cancelEdit || 'Cancel'}
              </button>
              <button className="btn-danger" onClick={handleDelete}>
                🗑️ {t.adminDeleteBtn || 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
