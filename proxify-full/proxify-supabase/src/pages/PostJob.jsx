// src/pages/PostJob.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LanguageContext'
import { createJob } from '../services/jobService'

const CATEGORY_KEYS = ['plumbing','electrical','music','tutoring','delivery','cleaning','carpentry','cooking','other']

export default function PostJob() {
  const { user } = useAuth()
  const { t } = useLang()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')
  const [form, setForm] = useState({
    title: '', description: '', category: 'plumbing', type: 'job',
    price: '', date: '', time: '', area: '', city: '', isUrgent: false, contactPhone: '',
  })

  const set = field => e => setForm(f => ({ ...f, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.title || !form.description || !form.area) return showToast(t.fillRequired)
    setLoading(true)
    try {
      const jobId = await createJob(user.id, form)
      showToast(t.postSuccess)
      setTimeout(() => navigate(`/job/${jobId}`), 1000)
    } catch { showToast(t.postError) }
    finally { setLoading(false) }
  }

  return (
    <div className="form-page">
      <h1>{form.type === 'skillswap' ? t.postSkillSwapTitle : t.postJobTitle}</h1>
      <p className="subtitle">{t.postJobSubtitle}</p>
      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>{t.typeLabel}</label>
          <div className="filter-bar" style={{ marginBottom: 0 }}>
            <button type="button" className={`filter-btn ${form.type === 'job' ? 'active' : ''}`} onClick={() => setForm(f => ({ ...f, type: 'job' }))}>{t.jobTask}</button>
            <button type="button" className={`filter-btn ${form.type === 'skillswap' ? 'active' : ''}`} onClick={() => setForm(f => ({ ...f, type: 'skillswap' }))}>{t.skillSwapType}</button>
          </div>
        </div>
        <div className="form-group">
          <label>{t.titleLabel} *</label>
          <input type="text" placeholder={form.type === 'skillswap' ? t.titlePlaceholderSkill : t.titlePlaceholderJob} value={form.title} onChange={set('title')} maxLength={80} />
        </div>
        <div className="form-group">
          <label>{t.descriptionLabel} *</label>
          <textarea rows={4} placeholder={t.descriptionPlaceholder} value={form.description} onChange={set('description')} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>{t.categoryLabel}</label>
            <select value={form.category} onChange={set('category')}>
              {CATEGORY_KEYS.map(key => <option key={key} value={key}>{t[key]}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>{t.priceLabel}</label>
            <input type="number" placeholder={t.pricePlaceholder} value={form.price} onChange={set('price')} min={0} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>{t.dateLabel}</label><input type="date" value={form.date} onChange={set('date')} /></div>
          <div className="form-group"><label>{t.timeLabel}</label><input type="time" value={form.time} onChange={set('time')} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>{t.areaLabel} *</label><input type="text" placeholder={t.areaPlaceholder} value={form.area} onChange={set('area')} /></div>
          <div className="form-group"><label>{t.cityLabel}</label><input type="text" placeholder={t.cityPlaceholder} value={form.city} onChange={set('city')} /></div>
        </div>
        <div className="form-group">
          <label>{t.contactPhoneLabel}</label>
          <input type="tel" placeholder={t.contactPhonePlaceholder} value={form.contactPhone} onChange={set('contactPhone')} />
        </div>
        <div className="toggle-row">
          <div><div className="toggle-label">{t.urgentLabel}</div><div className="toggle-desc">{t.urgentDesc}</div></div>
          <label className="toggle"><input type="checkbox" checked={form.isUrgent} onChange={set('isUrgent')} /><span className="toggle-slider"></span></label>
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>{loading ? t.posting : t.postNow}</button>
      </form>
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
