// src/services/adminService.js
import { supabase } from '../supabase'

export const ADMIN_EMAIL = 'dptrabhay@gmail.com'

export const isAdmin = (user) => user?.email === ADMIN_EMAIL

// ─── STATS ────────────────────────────────────────────────────────────────────

export const getAdminStats = async () => {
  const [
    { count: totalUsers },
    { count: totalJobs },
    { count: openJobs },
    { count: urgentJobs },
    { count: totalReviews },
    { count: skillSwaps },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }).then(r => ({ count: r.count || 0 })),
    supabase.from('jobs').select('*', { count: 'exact', head: true }).then(r => ({ count: r.count || 0 })),
    supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'open').then(r => ({ count: r.count || 0 })),
    supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('is_urgent', true).then(r => ({ count: r.count || 0 })),
    supabase.from('reviews').select('*', { count: 'exact', head: true }).then(r => ({ count: r.count || 0 })),
    supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('type', 'skillswap').then(r => ({ count: r.count || 0 })),
  ])

  return { totalUsers, totalJobs, openJobs, urgentJobs, totalReviews, skillSwaps }
}

// ─── USERS ────────────────────────────────────────────────────────────────────

export const getAllUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export const deleteUser = async (userId) => {
  // Delete user's reviews first
  await supabase.from('reviews').delete().or(`reviewer_id.eq.${userId},reviewee_id.eq.${userId}`)
  // Delete user's jobs
  await supabase.from('jobs').delete().eq('posted_by', userId)
  // Delete user
  const { error } = await supabase.from('users').delete().eq('id', userId)
  if (error) throw error
}

// ─── JOBS ─────────────────────────────────────────────────────────────────────

export const getAllJobsAdmin = async () => {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export const deleteJob = async (jobId) => {
  // Delete related reviews first
  await supabase.from('reviews').delete().eq('job_id', jobId)
  // Delete the job
  const { error } = await supabase.from('jobs').delete().eq('id', jobId)
  if (error) throw error
}

// ─── REVIEWS ──────────────────────────────────────────────────────────────────

export const getAllReviews = async () => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export const deleteReview = async (reviewId) => {
  const { error } = await supabase.from('reviews').delete().eq('id', reviewId)
  if (error) throw error
}
