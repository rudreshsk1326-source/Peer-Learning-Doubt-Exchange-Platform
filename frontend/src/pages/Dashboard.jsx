import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalQuestions: 0,
    myQuestions: 0,
    resolvedQuestions: 0,
    reputation: 0
  });
  const [recentDoubts, setRecentDoubts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [doubtsResponse, answersResponse] = await Promise.all([
        axios.get('/api/doubts'),
        axios.get('/api/answers')
      ]);
      
      const allDoubts = doubtsResponse.data.doubts || [];
      const allAnswers = answersResponse.data.answers || [];
      
      if (user.role === 'mentor') {
        // Mentor stats
        const mentorAnswers = allAnswers.filter(answer => answer.authorId === user.id && answer.isMentorAnswer);
        const helpedStudents = new Set(mentorAnswers.map(answer => answer.doubtId)).size;
        const unresolvedQuestions = allDoubts.filter(doubt => doubt.status === 'open').length;
        
        setStats({
          totalQuestions: allDoubts.length,
          myAnswers: mentorAnswers.length,
          helpedStudents,
          unresolvedQuestions,
          reputation: user.reputation || 0
        });
        
        setRecentDoubts(allDoubts.filter(doubt => doubt.status === 'open').slice(0, 4));
      } else {
        // Student stats
        const userDoubts = allDoubts.filter(doubt => doubt.authorId === user.id);
        const resolvedQuestions = userDoubts.filter(doubt => doubt.status === 'resolved').length;
        
        setStats({
          totalQuestions: allDoubts.length,
          myQuestions: userDoubts.length,
          resolvedQuestions,
          reputation: user.reputation || 0
        });
        
        setRecentDoubts(userDoubts.slice(0, 4));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="auth-required-card">
        <div className="auth-icon">🔐</div>
        <h2>Access Required</h2>
        <p>Please login to view your personalized dashboard</p>
        <Link to="/login" className="btn btn-primary">Login Now</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-dashboard">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="modern-dashboard">
      {/* Header Section */}
      <div className="dashboard-hero">
        <div className="hero-content">
          <div className="user-greeting">
            <div className="user-avatar-large">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="greeting-text">
              <h1>Welcome back, {user.name}!</h1>
              <p className="user-role">{user.role === 'mentor' ? '🎓 Mentor' : '📚 Student'}</p>
            </div>
          </div>
          <div className="quick-actions">
            <Link to="/ask" className="quick-btn primary">
              <span>➕</span> Ask Question
            </Link>
            <Link to="/doubts" className="quick-btn secondary">
              <span>🔍</span> Browse
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-section">
        {user.role === 'mentor' ? (
          // Mentor Stats
          <>
            <div className="stat-card mentor-answers">
              <div className="stat-header">
                <span className="stat-icon">🎓</span>
                <span className="stat-label">Mentor Answers</span>
              </div>
              <div className="stat-value">{stats.myAnswers || 0}</div>
              <div className="stat-trend">Official responses</div>
            </div>
            
            <div className="stat-card helped">
              <div className="stat-header">
                <span className="stat-icon">👥</span>
                <span className="stat-label">Students Helped</span>
              </div>
              <div className="stat-value">{stats.helpedStudents || 0}</div>
              <div className="stat-trend">Unique students</div>
            </div>
            
            <div className="stat-card pending">
              <div className="stat-header">
                <span className="stat-icon">⏳</span>
                <span className="stat-label">Pending Questions</span>
              </div>
              <div className="stat-value">{stats.unresolvedQuestions || 0}</div>
              <div className="stat-trend">Need attention</div>
            </div>
            
            <div className="stat-card reputation">
              <div className="stat-header">
                <span className="stat-icon">⭐</span>
                <span className="stat-label">Reputation</span>
              </div>
              <div className="stat-value">{stats.reputation}</div>
              <div className="stat-trend">Mentor points</div>
            </div>
          </>
        ) : (
          // Student Stats
          <>
            <div className="stat-card questions">
              <div className="stat-header">
                <span className="stat-icon">❓</span>
                <span className="stat-label">My Questions</span>
              </div>
              <div className="stat-value">{stats.myQuestions}</div>
              <div className="stat-trend">Total asked</div>
            </div>
            
            <div className="stat-card resolved">
              <div className="stat-header">
                <span className="stat-icon">✅</span>
                <span className="stat-label">Resolved</span>
              </div>
              <div className="stat-value">{stats.resolvedQuestions}</div>
              <div className="stat-trend">Problems solved</div>
            </div>
            
            <div className="stat-card reputation">
              <div className="stat-header">
                <span className="stat-icon">⭐</span>
                <span className="stat-label">Reputation</span>
              </div>
              <div className="stat-value">{stats.reputation}</div>
              <div className="stat-trend">Community points</div>
            </div>
            
            <div className="stat-card success-rate">
              <div className="stat-header">
                <span className="stat-icon">📊</span>
                <span className="stat-label">Success Rate</span>
              </div>
              <div className="stat-value">
                {stats.myQuestions > 0 ? Math.round((stats.resolvedQuestions / stats.myQuestions) * 100) : 0}%
              </div>
              <div className="stat-trend">Resolution rate</div>
            </div>
          </>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Recent Activity */}
        <div className="dashboard-card recent-activity">
          <div className="card-header">
            <h3>{user.role === 'mentor' ? '⏳ Questions Needing Help' : '📝 My Recent Questions'}</h3>
            <Link to="/doubts" className="view-all">View All</Link>
          </div>
          <div className="card-content">
            {recentDoubts.length > 0 ? (
              recentDoubts.map(doubt => (
                <Link key={doubt.id} to={`/doubts/${doubt.id}`} className="activity-item">
                  <div className="activity-icon">
                    <span className={`status-dot ${doubt.status}`}></span>
                  </div>
                  <div className="activity-content">
                    <h4>{doubt.title}</h4>
                    <p>{doubt.description.substring(0, 80)}...</p>
                    <div className="activity-meta">
                      <span className="subject">{doubt.subject}</span>
                      <span className="author">{user.role === 'mentor' ? `by ${doubt.author?.name}` : ''}</span>
                      <span className="date">{new Date(doubt.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {user.role === 'mentor' && (
                    <div className="mentor-action">
                      <span className="help-badge">Help Needed</span>
                    </div>
                  )}
                </Link>
              ))
            ) : (
              <div className="empty-state">
                <span className="empty-icon">{user.role === 'mentor' ? '🎯' : '💭'}</span>
                <p>{user.role === 'mentor' ? 'All questions are resolved! Great work.' : 'No questions yet. Start by asking your first question!'}</p>
                {user.role !== 'mentor' && (
                  <Link to="/ask" className="btn btn-primary">Ask Question</Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Progress/Impact */}
        <div className="dashboard-card learning-progress">
          <div className="card-header">
            <h3>{user.role === 'mentor' ? '🎯 Mentoring Impact' : '🎯 Learning Progress'}</h3>
          </div>
          <div className="card-content">
            {user.role === 'mentor' ? (
              <>
                <div className="progress-item">
                  <div className="progress-label">
                    <span>Students Helped</span>
                    <span>{stats.helpedStudents || 0}</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill mentor" 
                      style={{width: `${Math.min((stats.helpedStudents || 0) * 10, 100)}%`}}
                    ></div>
                  </div>
                </div>
                <div className="mentor-stats">
                  <div className="mentor-stat">
                    <span className="stat-number">{stats.myAnswers || 0}</span>
                    <span className="stat-label">Official Answers</span>
                  </div>
                  <div className="mentor-stat">
                    <span className="stat-number">{stats.unresolvedQuestions || 0}</span>
                    <span className="stat-label">Pending Questions</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="progress-item">
                <div className="progress-label">
                  <span>Questions Resolved</span>
                  <span>{stats.resolvedQuestions}/{stats.myQuestions}</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{width: `${stats.myQuestions > 0 ? (stats.resolvedQuestions / stats.myQuestions) * 100 : 0}%`}}
                  ></div>
                </div>
              </div>
            )}
            
            <div className="achievement-badges">
              <div className="badge">
                <span className="badge-icon">🏆</span>
                <span className="badge-text">{user.role === 'mentor' ? 'Mentor' : 'Problem Solver'}</span>
              </div>
              {user.role === 'mentor' && (
                <div className="badge mentor">
                  <span className="badge-icon">🎓</span>
                  <span className="badge-text">Official Mentor</span>
                </div>
              )}
              {stats.reputation > 50 && (
                <div className="badge expert">
                  <span className="badge-icon">⭐</span>
                  <span className="badge-text">Expert</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;