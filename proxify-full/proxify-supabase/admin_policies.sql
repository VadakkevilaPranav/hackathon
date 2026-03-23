-- ============================================================
-- PROXIFY — Admin RLS Policies
-- Run this in: Supabase Dashboard → SQL Editor
-- This allows the admin (dptrabhay@gmail.com) to delete any row.
-- ============================================================

-- Allow admin to delete any job
CREATE POLICY "Admin can delete any job"
  ON public.jobs FOR DELETE
  USING (
    auth.jwt() ->> 'email' = 'dptrabhay@gmail.com'
  );

-- Allow admin to update any job
CREATE POLICY "Admin can update any job"
  ON public.jobs FOR UPDATE
  USING (
    auth.jwt() ->> 'email' = 'dptrabhay@gmail.com'
  );

-- Allow admin to delete any user
CREATE POLICY "Admin can delete any user"
  ON public.users FOR DELETE
  USING (
    auth.jwt() ->> 'email' = 'dptrabhay@gmail.com'
  );

-- Allow admin to update any user
CREATE POLICY "Admin can update any user"
  ON public.users FOR UPDATE
  USING (
    auth.jwt() ->> 'email' = 'dptrabhay@gmail.com'
  );

-- Allow admin to delete any review
CREATE POLICY "Admin can delete any review"
  ON public.reviews FOR DELETE
  USING (
    auth.jwt() ->> 'email' = 'dptrabhay@gmail.com'
  );
