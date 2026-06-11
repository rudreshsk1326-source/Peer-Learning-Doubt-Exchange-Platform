import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          PeerLearn
        </Link>
        
        <div className="nav-links">
          <Link to="/doubts">Doubts</Link>
          {user ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/ask">Ask</Link>
              <Link to={`/profile/${user.id}`}>Profile</Link>
              {user.role === 'admin' && (
                <>
                  <Link to="/admin">Admin</Link>
                  <Link to="/admin/insights">Insights</Link>
                </>
              )}
              <NotificationBell />
              <span className="nav-user">Hi, {user.name}</span>
              <button onClick={handleLogout} className="nav-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;