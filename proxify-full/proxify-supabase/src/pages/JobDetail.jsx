// src/pages/JobDetail.jsx
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getJobById, getUserById, expressInterest, addReview } from '../services/jobService'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LanguageContext'
import whatsappIcon from '../assets/whatsapp.png'

function StarPicker({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '6px', marginBottom: '0.5rem' }}>
      {[1,2,3,4,5].map(s => (
        <span key={s} style={{ fontSize: '1.5rem', cursor: 'pointer', opacity: s <= value ? 1 : 0.3 }} onClick={() => onChange(s)}>⭐</span>
      ))}
    </div>
  )
}

// Simple inline SVG icons — no extra package needed
const IconMapPin    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
const IconTag       = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
const IconCalendar  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
const IconClock     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
const IconUsers     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
const IconRefresh   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
const IconAlertCircle = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
const IconCheck     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
const IconHand      = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 11V6a2 2 0 00-2-2v0a2 2 0 00-2 2v0"/><path d="M14 10V4a2 2 0 00-2-2v0a2 2 0 00-2 2v2"/><path d="M10 10.5V6a2 2 0 00-2-2v0a2 2 0 00-2 2v8"/><path d="M18 8a2 2 0 114 0v6a8 8 0 01-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 012.83-2.82L7 15"/></svg>
const IconStar      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>

export default function JobDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { t } = useLang()
  const [job, setJob] = useState(null)
  const [poster, setPoster] = useState(null)
  const [loading, setLoading] = useState(true)
  const [interested, setInterested] = useState(false)
  const [toast, setToast] = useState('')
  const [showReview, setShowReview] = useState(false)
  const [stars, setStars] = useState(5)
  const [comment, setComment] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)

  useEffect(() => {
    const load = async () => {
      const j = await getJobById(id)
      setJob(j)
      if (j) {
        const p = await getUserById(j.posted_by)
        setPoster(p)
        if (user && j.interested_users?.includes(user.id)) setInterested(true)
      }
      setLoading(false)
    }
    load()
  }, [id, user])

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const handleInterest = async () => {
    if (!user) return showToast(t.signInFirst)
    await expressInterest(id, user.id)
    setInterested(true)
    showToast(t.interestToast)
  }

  const handleReview = async () => {
    if (!user) return
    setReviewSubmitting(true)
    try {
      await addReview({ jobId: id, reviewerId: user.id, revieweeId: job.posted_by, stars, comment })
      showToast(t.reviewSuccess)
      setShowReview(false)
    } catch { showToast(t.reviewError) }
    finally { setReviewSubmitting(false) }
  }

  const renderStars = r => '★'.repeat(Math.round(r)) + '☆'.repeat(5 - Math.round(r))

  if (loading) return <div className="loading">{t.loading}</div>
  if (!job) return <div className="loading">{t.jobNotFound}</div>

  const whatsappLink = poster?.phone
    ? `https://wa.me/91${poster.phone}?text=Hi, I saw your post "${job.title}" on Proxify. I'm interested!`
    : null

  return (
    <div className="detail-page">
      <div className="detail-header">
        <div className="detail-badges">
          {job.is_urgent && (
            <span className="badge urgent">
              <IconAlertCircle /> {t.urgent.replace('🔴 ', '')}
            </span>
          )}
          {job.type === 'skillswap' && (
            <span className="badge skillswap">
              <IconRefresh /> {t.skillSwap}
            </span>
          )}
          <span className="badge open">{t.open}</span>
        </div>

        <h1 className="detail-title">{job.title}</h1>

        <div className="detail-meta">
          <span className="meta-tag"><IconMapPin /> {job.area}{job.city ? `, ${job.city}` : ''}</span>
          <span className="meta-tag"><IconTag /> {job.category}</span>
          {job.price && <span className="meta-tag price">₹{job.price}</span>}
          {job.date && <span className="meta-tag"><IconCalendar /> {job.date}</span>}
          {job.time && <span className="meta-tag"><IconClock /> {job.time}</span>}
          {job.interested_users?.length > 0 && (
            <span className="meta-tag"><IconUsers /> {job.interested_users.length} {t.interested}</span>
          )}
        </div>
      </div>

      <div className="detail-card"><h3>{t.description}</h3><p>{job.description}</p></div>

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
                  ? <><span className="stars">{renderStars(poster.rating)}</span> {poster.rating} ({poster.review_count} {t.reviews})</>
                  : t.noReviews
                }
              </div>
              {poster.skills_offered?.length > 0 && (
                <div style={{ marginTop: '0.4rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {t.skills}: {poster.skills_offered.join(', ')}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {user && user.id !== job.posted_by && (
        <div className="action-area" style={{ marginBottom: '1rem' }}>
          {whatsappLink && (
            <a href={whatsappLink} target="_blank" rel="noreferrer" className="btn-whatsapp">
              <img src={whatsappIcon} alt="WhatsApp" width={20} height={20} style={{ borderRadius: '4px' }} />
              Contact on WhatsApp
            </a>
          )}
          <button className="btn-interest" onClick={handleInterest} disabled={interested}>
            {interested
              ? <><IconCheck /> {t.interestExpressed}</>
              : <><IconHand /> {t.expressInterest}</>
            }
          </button>
          <button className="filter-btn" style={{ textAlign: 'center' }} onClick={() => setShowReview(!showReview)}>
            <IconStar /> {t.leaveReview.replace('⭐ ', '')}
          </button>
        </div>
      )}

      {showReview && (
        <div className="detail-card">
          <h3>{t.leaveReview.replace('⭐ ', '')}</h3>
          <StarPicker value={stars} onChange={setStars} />
          <textarea
            rows={3}
            placeholder={t.shareExperience}
            value={comment}
            onChange={e => setComment(e.target.value)}
            style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '8px', padding: '10px 14px', fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', marginTop: '0.5rem' }}
          />
          <button className="btn-primary" style={{ marginTop: '0.8rem' }} onClick={handleReview} disabled={reviewSubmitting}>
            {reviewSubmitting ? t.submitting : t.submitReview}
          </button>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}