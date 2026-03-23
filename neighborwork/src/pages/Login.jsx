// src/pages/Login.jsx
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

export default function Login() {
  const { loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/");
  }, [user]);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="brand">⚡ NeighborWork</div>
        <p className="tagline">
          Find micro-jobs, swap skills, and connect with people in your neighborhood.
        </p>
        <button className="btn-google" onClick={handleLogin}>
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            width="20"
          />
          Continue with Google
        </button>
      </div>
    </div>
  );
}
