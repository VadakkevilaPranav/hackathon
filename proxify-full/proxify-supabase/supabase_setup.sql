-- ============================================================
-- PROXIFY — Supabase Database Setup
-- Run this entire file in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── USERS TABLE ──────────────────────────────────────────────
create table if not exists public.users (
  id          uuid primary key,           -- matches Supabase auth user id
  name        text,
  email       text,
  photo       text,
  area        text default '',
  city        text default '',
  phone       text default '',
  skills_offered  text[] default '{}',
  skills_needed   text[] default '{}',
  rating          numeric default 0,
  review_count    integer default 0,
  created_at  timestamptz default now()
);

-- ── JOBS TABLE ───────────────────────────────────────────────
create table if not exists public.jobs (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  description     text,
  category        text,
  type            text default 'job',       -- 'job' or 'skillswap'
  price           numeric,
  date            text,
  time            text,
  area            text,
  city            text,
  is_urgent       boolean default false,
  contact_phone   text,
  posted_by       uuid references public.users(id),
  interested_users uuid[] default '{}',
  status          text default 'open',      -- 'open' or 'closed'
  created_at      timestamptz default now()
);

-- ── REVIEWS TABLE ────────────────────────────────────────────
create table if not exists public.reviews (
  id            uuid primary key default gen_random_uuid(),
  job_id        uuid references public.jobs(id),
  reviewer_id   uuid references public.users(id),
  reviewee_id   uuid references public.users(id),
  stars         integer check (stars between 1 and 5),
  comment       text,
  created_at    timestamptz default now()
);

-- ── ROW LEVEL SECURITY ───────────────────────────────────────
-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.jobs enable row level security;
alter table public.reviews enable row level security;

-- Users: anyone logged in can read, only self can update
create policy "Users are viewable by all" on public.users for select using (auth.role() = 'authenticated');
create policy "Users can insert own profile" on public.users for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);

-- Jobs: anyone logged in can read and create, only poster can update
create policy "Jobs viewable by all" on public.jobs for select using (auth.role() = 'authenticated');
create policy "Authenticated users can post jobs" on public.jobs for insert with check (auth.uid() = posted_by);
create policy "Job poster can update" on public.jobs for update using (auth.uid() = posted_by);

-- Reviews: anyone logged in can read and insert
create policy "Reviews viewable by all" on public.reviews for select using (auth.role() = 'authenticated');
create policy "Authenticated users can review" on public.reviews for insert with check (auth.uid() = reviewer_id);

-- ── ENABLE GOOGLE AUTH (do this in the Dashboard) ────────────
-- Go to: Authentication → Providers → Google → Enable
-- Add your Google OAuth Client ID and Secret
-- Authorized redirect URI to add in Google Console:
--   https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback
