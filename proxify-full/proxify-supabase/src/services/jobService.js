// src/services/jobService.js
import { supabase } from '../supabase'

// ─── JOBS ─────────────────────────────────────────────────────────────────────

export const createJob = async (userId, jobData) => {
  // Generate UUID client-side — avoids depending on select-back
  const jobId = crypto.randomUUID()
  console.log('[createJob] Starting insert with id:', jobId, 'userId:', userId)

  // Wrap in a timeout to prevent infinite hangs
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Request timed out after 15 seconds')), 15000)
  )

  const insertPromise = supabase
    .from('jobs')
    .insert({
      id: jobId,
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
      posted_by: userId,
      status: 'open',
    })

  const { error } = await Promise.race([insertPromise, timeoutPromise])

  if (error) {
    console.error('[createJob] Supabase insert error:', error)
    throw error
  }

  console.log('[createJob] Insert successful, jobId:', jobId)
  return jobId
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
  const { data: job, error: fetchError } = await supabase
    .from('jobs')
    .select('interested_users')
    .eq('id', jobId)
    .single()

  if (fetchError) throw fetchError

  // Prevent duplicate entries
  const current = job?.interested_users || []
  if (current.includes(userId)) return

  const updated = [...current, userId]

  const { error } = await supabase
    .from('jobs')
    .update({ interested_users: updated })
    .eq('id', jobId)

  if (error) {
    console.error('Express interest error:', error)
    throw error
  }
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
