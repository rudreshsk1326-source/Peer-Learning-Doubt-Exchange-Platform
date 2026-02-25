import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AdminPanel = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyUser = async (userId) => {
    try {
      await axios.patch(`/api/users/${userId}/verify`);
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, isVerified: true } : u
      ));
    } catch (error) {
      console.error('Verification failed:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="admin-panel">
        <div className="access-denied">
          <h2>🚫 Access Denied</h2>
          <p>You need admin privileges to access this panel.</p>
        </div>
      </div>
    );
  }

  if (loading) return <div className="loading">Loading admin panel...</div>;

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>👑 Admin Panel</h1>
        <p>Manage users and platform settings</p>
      </div>

      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{users.length}</h3>
            <p>Total Users</p>
          </div>
        </div>
        
        <div className="admin-stat-card">
          <div className="stat-icon">🎓</div>
          <div className="stat-info">
            <h3>{users.filter(u => u.role === 'mentor').length}</h3>
            <p>Mentors</p>
          </div>
        </div>
        
        <div className="admin-stat-card">
          <div className="stat-icon">👨🎓</div>
          <div className="stat-info">
            <h3>{users.filter(u => u.role === 'student').length}</h3>
            <p>Students</p>
          </div>
        </div>
        
        <div className="admin-stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{users.filter(u => u.isVerified).length}</h3>
            <p>Verified Users</p>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="users-section">
        <h2>👥 User Management</h2>
        <div className="users-table">
          <div className="table-header">
            <span>User</span>
            <span>Role</span>
            <span>Status</span>
            <span>Joined</span>
            <span>Actions</span>
          </div>
          
          {users.map(userItem => (
            <div key={userItem.id} className="table-row">
              <div className="user-info">
                <div className="user-avatar-small">
                  {userItem.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="user-name">{userItem.name}</div>
                  <div className="user-email">{userItem.email}</div>
                </div>
              </div>
              
              <span className={`role-tag role-${userItem.role}`}>
                {userItem.role === 'mentor' ? '🎓 Mentor' : 
                 userItem.role === 'admin' ? '👑 Admin' : '👨🎓 Student'}
              </span>
              
              <span className={`status-tag ${userItem.isVerified ? 'verified' : 'unverified'}`}>
                {userItem.isVerified ? '✅ Verified' : '⏳ Pending'}
              </span>
              
              <span className="join-date">{formatDate(userItem.createdAt)}</span>
              
              <div className="user-actions">
                {!userItem.isVerified && userItem.role !== 'admin' && (
                  <button 
                    className="verify-btn"
                    onClick={() => handleVerifyUser(userItem.id)}
                  >
                    ✅ Verify
                  </button>
                )}
                {userItem.isVerified && (
                  <span className="verified-text">Verified ✓</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;