import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const NotificationBell = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications');
      setUnreadCount(response.data.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };



  if (!user) return null;

  return (
    <div className="notification-bell">
      <button 
        className="modern-bell-button"
        onClick={() => navigate('/notifications')}
      >
        <div className="bell-icon">🔔</div>
        {unreadCount > 0 && (
          <span className="modern-notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        <div className="bell-ripple"></div>
      </button>


    </div>
  );
};

export default NotificationBell;