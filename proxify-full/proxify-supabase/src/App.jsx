// src/App.jsx
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LanguageProvider, useLang } from './context/LanguageContext'
import Feed from './pages/Feed'
import PostJob from './pages/PostJob'
import JobDetail from './pages/JobDetail'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Admin from './pages/Admin'
import { isAdmin } from './services/adminService'
import './App.css'
import logo from './assets/logo.svg'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

function Navbar() {
  const { user, logout } = useAuth()
  const { t, lang, toggleLang } = useLang()
  return (
    <nav className="navbar">
      <NavLink to="/" className="nav-logo">
        <img src={logo} alt="Proxify" width={32} height={32} />
        <span>{t.brand}</span>
      </NavLink>
      <div className="nav-links">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>{t.browse}</NavLink>
        <NavLink to="/skillswap" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>{t.skillSwap}</NavLink>
        {user && (
          <>
            <NavLink to="/post" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>{t.post}</NavLink>
            <NavLink to="/profile" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>{t.profile}</NavLink>
            {isAdmin(user) && (
              <NavLink to="/admin" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>⚙️ {t.admin || 'Admin'}</NavLink>
            )}
            <button className="btn-logout" onClick={logout}>{t.logout}</button>
          </>
        )}
        {!user && <NavLink to="/login" className="btn-signin">{t.signIn}</NavLink>}
        <button className="btn-lang" onClick={toggleLang}>{lang === 'en' ? 'മലയാളം' : 'English'}</button>
      </div>
    </nav>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Feed type="job" />} />
              <Route path="/skillswap" element={<Feed type="skillswap" />} />
              <Route path="/job/:id" element={<JobDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/post" element={<PrivateRoute><PostJob /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
            </Routes>
          </main>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  )
}
