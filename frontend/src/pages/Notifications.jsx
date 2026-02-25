import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Notifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(`/api/notifications/${notificationId}/read`);
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };

  const formatTime = (dateString) => {
    const now = new Date();
    const notificationTime = new Date(dateString);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (!user) {
    return (
      <div className="notifications-page">
        <div className="notifications-container">
          <div className="auth-required">
            <h2>Login Required</h2>
            <p>Please login to view your notifications.</p>
            <Link to="/login" className="btn btn-primary">Login</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="notifications-container">
        <div className="notifications-header">
          <div className="header-content">
            <h1>🔔 Notifications</h1>
            <p>Stay updated with your learning journey</p>
          </div>
          <button 
            className="close-notifications-btn"
            onClick={() => navigate(-1)}
            title="Go Back"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="notifications-loading">
            <div className="loading-spinner"></div>
            <p>Loading notifications...</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <div className="empty-icon">🔕</div>
                <h3>No Notifications Yet</h3>
                <p>You'll see notifications here when mentors answer your questions or when there are updates.</p>
                <Link to="/ask" className="btn btn-primary">Ask Your First Question</Link>
              </div>
            ) : (
              notifications.map(notification => (
                <Link
                  key={notification.id}
                  to={`/doubts/${notification.questionId}`}
                  className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-icon">
                    {notification.type === 'MENTOR_ANSWER' ? '🎓' : '📢'}
                  </div>
                  <div className="notification-content">
                    <p className="notification-message">{notification.message}</p>
                    <span className="notification-time">{formatTime(notification.createdAt)}</span>
                  </div>
                  {!notification.isRead && <div className="unread-dot"></div>}
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;