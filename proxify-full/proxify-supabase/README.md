# ⚡ Proxify — Hackathon Starter (Supabase Edition)

Hyperlocal jobs & skill swap platform. React + Supabase.

---

## 🚀 Setup in 10 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Supabase Project
1. Go to https://supabase.com → New Project
2. Give it a name (e.g. "proxify"), set a DB password, choose a region

### 3. Run the Database Schema
1. In your Supabase dashboard → **SQL Editor**
2. Paste and run the entire contents of `supabase_setup.sql`
3. This creates the `users`, `jobs`, and `reviews` tables with RLS policies

### 4. Enable Google Auth
1. Supabase Dashboard → **Authentication → Providers → Google → Enable**
2. Go to https://console.cloud.google.com → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID → Web application
4. Add to **Authorized redirect URIs**:
   ```
   https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback
   ```
5. Copy the Client ID and Secret back into Supabase

### 5. Add Your Supabase Credentials
Open `src/supabase.js` and replace:
```js
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co'
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY'   // Project Settings → API → anon/public key
```

### 6. Run the App
```bash
npm run dev
# or
npm start
```
Opens at http://localhost:5173

---

## 📁 Project Structure
```
src/
  supabase.js              ← Supabase client (add your credentials here)
  App.jsx                  ← Routing + Navbar
  App.css                  ← All styles
  main.jsx                 ← Entry point
  context/
    AuthContext.jsx        ← Supabase Google auth
    LanguageContext.jsx    ← English / Malayalam toggle
  pages/
    Login.jsx
    Feed.jsx
    PostJob.jsx
    JobDetail.jsx
    Profile.jsx
  services/
    jobService.js          ← All Supabase DB operations
supabase_setup.sql         ← Run this in Supabase SQL Editor
```

---

## 🗄️ Database Tables

| Table | Key Columns |
|---|---|
| `users` | id, name, email, photo, area, city, phone, skills_offered[], skills_needed[], rating |
| `jobs` | id, title, description, category, type, price, is_urgent, posted_by, interested_users[], status |
| `reviews` | id, job_id, reviewer_id, reviewee_id, stars, comment |

---

## ✅ Features
- Google Sign-in via Supabase Auth
- Browse jobs + skill swap feed
- Category filter + urgent filter
- Post jobs/skill swaps with urgent toggle
- Job detail + WhatsApp contact button
- Express interest
- Star ratings & reviews
- Editable profile with skills
- English ↔ Malayalam language toggle
- Fully mobile responsive

## 🚀 Deploy
```bash
npm run build
# Upload the dist/ folder to Vercel, Netlify, or Firebase Hosting
```
