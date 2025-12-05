// src/components/Navbar.jsx
import { useNavigate, NavLink } from "react-router-dom";
import "./navbar.css";

export default function Navbar() {
  const navigate = useNavigate();

  let user = null;
  try {
    const raw = localStorage.getItem("user");
    user = raw ? JSON.parse(raw) : null;
  } catch {
    user = null;
  }

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="nav-left">
        <div className="nav-logo" onClick={() => navigate("/")}>
          Bookflix
        </div>

        <nav className="nav-links">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Ana Sayfa
          </NavLink>

          <NavLink
            to="/search"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Arama
          </NavLink>

          {user && (
            <NavLink
              to={`/profile/${user.id}`}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Profil
            </NavLink>
          )}
        </nav>
      </div>

      <div className="nav-right">
        {user && (
          <div
            className="nav-user"
            onClick={() => navigate(`/profile/${user.id}`)}
          >
            <span className="nav-username">{user.username}</span>
          </div>
        )}

        <button className="logout-btn" onClick={handleLogout}>
          Çıkış
        </button>
      </div>
    </header>
  );
}
