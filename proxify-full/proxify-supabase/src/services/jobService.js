// src/services/jobService.js
import { supabase } from '../supabase'

// ─── JOBS ─────────────────────────────────────────────────────────────────────

export const createJob = async (userId, jobData) => {
  const { data, error } = await supabase
    .from('jobs')
    .insert({
      title: jobData.title,
      description: jobData.description,
      category: jobData.category,
      type: jobData.type,
      price: jobData.price ? Number(jobData.price) : null,
      date: jobData.date || null,
      time: jobData.time || null,
      area: jobData.area,
      city: jobData.city,
      is_urgent: jobData.isUrgent,
      contact_phone: jobData.contactPhone,
      posted_by: userId,
      interested_users: [],
      status: 'open',
    })
    .select('id')
    .single()

  if (error) throw error
  return data.id
}

export const getAllJobs = async ({ type } = {}) => {
  let query = supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false })

  if (type) query = query.eq('type', type)

  const { data, error } = await query
  if (error) throw error
  return data
}

export const getJobById = async (jobId) => {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .single()

  if (error) return null
  return data
}

export const expressInterest = async (jobId, userId) => {
  // Fetch current interested_users array then append
  const { data: job } = await supabase
    .from('jobs')
    .select('interested_users')
    .eq('id', jobId)
    .single()

  const updated = [...(job?.interested_users || []), userId]

  const { error } = await supabase
    .from('jobs')
    .update({ interested_users: updated })
    .eq('id', jobId)

  if (error) throw error
}

export const updateJobStatus = async (jobId, status) => {
  const { error } = await supabase
    .from('jobs')
    .update({ status })
    .eq('id', jobId)

  if (error) throw error
}

export const getJobsByUser = async (userId) => {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('posted_by', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// ─── USERS ────────────────────────────────────────────────────────────────────

export const getUserById = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) return null
  return data
}

export const updateUserProfile = async (userId, formData) => {
  const { error } = await supabase
    .from('users')
    .update({
      area: formData.area,
      city: formData.city,
      phone: formData.phone,
      skills_offered: formData.skillsOffered,
      skills_needed: formData.skillsNeeded,
    })
    .eq('id', userId)

  if (error) throw error
}

// ─── REVIEWS ──────────────────────────────────────────────────────────────────

export const addReview = async ({ jobId, reviewerId, revieweeId, stars, comment }) => {
  const { error } = await supabase.from('reviews').insert({
    job_id: jobId,
    reviewer_id: reviewerId,
    reviewee_id: revieweeId,
    stars,
    comment,
  })

  if (error) throw error

  // Recalculate average rating for reviewee
  const { data: reviews } = await supabase
    .from('reviews')
    .select('stars')
    .eq('reviewee_id', revieweeId)

  if (reviews?.length) {
    const avg = reviews.reduce((sum, r) => sum + r.stars, 0) / reviews.length
    await supabase
      .from('users')
      .update({
        rating: Math.round(avg * 10) / 10,
        review_count: reviews.length,
      })
      .eq('id', revieweeId)
  }
}

export const getReviewsForUser = async (userId) => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('reviewee_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}
