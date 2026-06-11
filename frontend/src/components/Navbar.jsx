import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      {/* Render-style rainbow gradient line at top */}
      <div className="navbar-gradient-line" />

      <div className="nav-container">

        {/* Logo */}
        <Link to="/" className="nav-logo">
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#7c3aed"/>
                <stop offset="100%" stopColor="#22c55e"/>
              </linearGradient>
            </defs>
            <rect width="30" height="30" rx="8" fill="url(#logoGrad)"/>
            <circle cx="15" cy="10" r="3.5" fill="white"/>
            <circle cx="8.5" cy="20" r="3" fill="white" opacity="0.9"/>
            <circle cx="21.5" cy="20" r="3" fill="white" opacity="0.9"/>
            <line x1="15" y1="13.5" x2="8.5" y2="17" stroke="white" strokeWidth="1.5" strokeOpacity="0.7"/>
            <line x1="15" y1="13.5" x2="21.5" y2="17" stroke="white" strokeWidth="1.5" strokeOpacity="0.7"/>
          </svg>
          <span>PeerLearn</span>
        </Link>

        {/* Nav Links */}
        <div className="nav-links">
          <Link to="/doubts" className={`nav-link ${isActive('/doubts') ? 'nav-link-active' : ''}`}>
            Doubts
          </Link>
          {user ? (
            <>
              <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'nav-link-active' : ''}`}>
                Dashboard
              </Link>
              <Link to="/ask" className={`nav-link nav-link-ask ${isActive('/ask') ? 'nav-link-active' : ''}`}>
                Ask
              </Link>
              <Link to={`/profile/${user.id}`} className={`nav-link ${isActive(`/profile/${user.id}`) ? 'nav-link-active' : ''}`}>
                Profile
              </Link>
              {user.role === 'admin' && (
                <>
                  <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'nav-link-active' : ''}`}>
                    Admin
                  </Link>
                  <Link to="/admin/insights" className={`nav-link ${isActive('/admin/insights') ? 'nav-link-active' : ''}`}>
                    Insights
                  </Link>
                </>
              )}
            </>
          ) : (
            <>
              <Link to="/login" className={`nav-link ${isActive('/login') ? 'nav-link-active' : ''}`}>
                Login
              </Link>
              <Link to="/signup" className="nav-link nav-signup-btn">
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Right side */}
        <div className="nav-right">
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
            {theme === 'dark' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>

          {user && (
            <>
              <NotificationBell />
              <div className="nav-user-pill">
                <div className="nav-user-avatar">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="nav-user-name">{user.name}</span>
              </div>
              <button onClick={handleLogout} className="nav-btn">Logout</button>
            </>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
