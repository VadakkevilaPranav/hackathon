// src/App.jsx
import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Feed from "./pages/Feed";
import PostJob from "./pages/PostJob";
import JobDetail from "./pages/JobDetail";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import "./App.css";

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function Navbar() {
  const { user, logout } = useAuth();
  return (
    <nav className="navbar">
      <NavLink to="/" className="nav-logo">
        <span className="logo-icon">⚡</span> NeighborWork
      </NavLink>
      <div className="nav-links">
        <NavLink to="/" end className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          Browse
        </NavLink>
        <NavLink to="/skillswap" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          Skill Swap
        </NavLink>
        {user && (
          <>
            <NavLink to="/post" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              + Post
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              Profile
            </NavLink>
            <button className="btn-logout" onClick={logout}>Logout</button>
          </>
        )}
        {!user && (
          <NavLink to="/login" className="btn-signin">Sign In</NavLink>
        )}
      </div>
    </nav>
  );
}

function App() {
  return (
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
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;