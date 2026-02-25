import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [userDoubts, setUserDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchUserProfile();
  }, [id]);

  const fetchUserProfile = async () => {
    try {
      const [doubtsResponse, answersResponse, usersResponse] = await Promise.all([
        axios.get('/api/doubts'),
        axios.get('/api/answers'),
        axios.get('/api/users')
      ]);

      const allDoubts = doubtsResponse.data.doubts || [];
      const allAnswers = answersResponse.data.answers || [];
      const allUsers = usersResponse.data.users || [];
      const profileDoubts = allDoubts.filter(doubt => doubt.authorId === id);
      
      // Find user from users data
      const userData = allUsers.find(u => u.id === id) || { name: 'Unknown User', role: 'student' };
      
      // Calculate mentor stats
      let mentorStats = { questionsAnswered: 0, studentsHelped: 0 };
      if (userData.role === 'mentor') {
        const mentorAnswers = allAnswers.filter(answer => answer.authorId === id && answer.isMentorAnswer);
        mentorStats.questionsAnswered = mentorAnswers.length;
        const uniqueStudents = new Set(mentorAnswers.map(answer => {
          const doubt = allDoubts.find(d => d.id === answer.doubtId);
          return doubt ? doubt.authorId : null;
        }).filter(Boolean));
        mentorStats.studentsHelped = uniqueStudents.size;
      }
      
      // Find primary mentor (mentor who answered most questions for this student)
      let primaryMentor = null;
      if (userData.role === 'student' && profileDoubts.length > 0) {
        const mentorAnswers = {};
        profileDoubts.forEach(doubt => {
          const doubtAnswers = allAnswers.filter(answer => answer.doubtId === doubt.id && answer.isMentorAnswer);
          doubtAnswers.forEach(answer => {
            const mentorId = answer.authorId;
            mentorAnswers[mentorId] = (mentorAnswers[mentorId] || 0) + 1;
          });
        });
        
        if (Object.keys(mentorAnswers).length > 0) {
          const topMentorId = Object.keys(mentorAnswers).reduce((a, b) => 
            mentorAnswers[a] > mentorAnswers[b] ? a : b
          );
          primaryMentor = allUsers.find(u => u.id === topMentorId);
        }
      }
      
      setUser({ ...userData, primaryMentor, mentorStats });
      setUserDoubts(profileDoubts);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-profile">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-not-found">
        <h2>Profile Not Found</h2>
        <p>The user profile you're looking for doesn't exist.</p>
        <Link to="/doubts" className="btn btn-primary">Browse Questions</Link>
      </div>
    );
  }

  const resolvedQuestions = userDoubts.filter(doubt => doubt.status === 'resolved').length;
  const totalQuestions = userDoubts.length;
  const successRate = totalQuestions > 0 ? Math.round((resolvedQuestions / totalQuestions) * 100) : 0;

  return (
    <div className="modern-profile">
      {/* Profile Header */}
      <div className="profile-hero">
        <div className="profile-banner">
          <div className="banner-pattern"></div>
        </div>
        <div className="profile-info">
          <div className="profile-avatar-section">
            <div className="profile-avatar-large">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="avatar-badge">
              {user.role === 'mentor' ? '🎓' : '📚'}
            </div>
          </div>
          <div className="profile-details">
            <h1>{user.name}</h1>
            <div className="profile-badges">
              <span className={`role-badge ${user.role}`}>
                {user.role === 'mentor' ? '🎓 Mentor' : '📚 Student'}
              </span>
              {user.isVerified && (
                <span className="verified-badge">✅ Verified</span>
              )}
              {id === currentUser?.id && (
                <span className="own-profile-badge">👤 Your Profile</span>
              )}
            </div>
            <div className="profile-stats-mini">
              <div className="mini-stat">
                <span className="mini-icon">📅</span>
                <span>Joined {new Date().getFullYear()}</span>
              </div>
              <div className="mini-stat">
                <span className="mini-icon">⭐</span>
                <span>{user.reputation || 0} reputation</span>
              </div>
              {user.role === 'student' && user.primaryMentor && (
                <div className="mini-stat">
                  <span className="mini-icon">🎓</span>
                  <span>Mentor: {user.primaryMentor.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Navigation */}
      <div className="profile-nav">
        <button 
          className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`nav-tab ${activeTab === 'questions' ? 'active' : ''}`}
          onClick={() => setActiveTab('questions')}
        >
          ❓ Questions ({totalQuestions})
        </button>
        <button 
          className={`nav-tab ${activeTab === 'achievements' ? 'active' : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          🏆 Achievements
        </button>
      </div>

      {/* Profile Content */}
      <div className="profile-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            {/* Stats Row */}
            <div className="profile-stats-row">
              {user.role === 'mentor' ? (
                // Mentor Stats Row
                <>
                  <div className="profile-stat-item mentor">
                    <div className="stat-icon mentor-icon">🎓</div>
                    <div className="stat-number">{user.mentorStats?.questionsAnswered || 0}</div>
                    <div className="stat-label">Questions Answered</div>
                  </div>
                  <div className="profile-stat-item mentor">
                    <div className="stat-icon mentor-icon">✅</div>
                    <div className="stat-number">{resolvedQuestions}</div>
                    <div className="stat-label">Resolved</div>
                  </div>
                  <div className="profile-stat-item mentor">
                    <div className="stat-icon mentor-icon">⭐</div>
                    <div className="stat-number">{user.reputation || 0}</div>
                    <div className="stat-label">Reputation</div>
                  </div>
                </>
              ) : (
                // Student Stats Row
                <>
                  <div className="profile-stat-item student">
                    <div className="stat-icon student-icon">❓</div>
                    <div className="stat-number">{totalQuestions}</div>
                    <div className="stat-label">Questions Asked</div>
                  </div>
                  <div className="profile-stat-item student">
                    <div className="stat-icon student-icon">✅</div>
                    <div className="stat-number">{resolvedQuestions}</div>
                    <div className="stat-label">Resolved</div>
                  </div>
                  <div className="profile-stat-item student">
                    <div className="stat-icon student-icon">⭐</div>
                    <div className="stat-number">{user.reputation || 0}</div>
                    <div className="stat-label">Reputation</div>
                  </div>
                </>
              )}
            </div>

            {/* Activity Chart */}
            <div className="activity-chart">
              <h3>{user.role === 'mentor' ? '🎯 Mentoring Impact' : '📈 Learning Progress'}</h3>
              <div className="progress-visualization">
                {user.role === 'mentor' ? (
                  <>
                    <div className="progress-item">
                      <span className="progress-label">Mentoring Excellence</span>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill mentor" 
                          style={{width: '92%'}}
                        ></div>
                      </div>
                      <span className="progress-value">92%</span>
                    </div>
                    <div className="mentor-highlights">
                      <div className="highlight-item">
                        <span className="highlight-icon">🎓</span>
                        <span className="highlight-text">Verified Mentor</span>
                      </div>
                      <div className="highlight-item">
                        <span className="highlight-icon">⭐</span>
                        <span className="highlight-text">Top Rated</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="progress-item">
                    <span className="progress-label">Questions Resolved</span>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill success" 
                        style={{width: `${successRate}%`}}
                      ></div>
                    </div>
                    <span className="progress-value">{successRate}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'questions' && (
          <div className="modern-questions-section">
            <div className="modern-questions-header">
              <div className="section-title">
                <div className="title-icon">📚</div>
                <h3>Questions by {user.name}</h3>
              </div>
              <div className="questions-stats">
                <div className="stat-badge">
                  <span className="badge-icon">📊</span>
                  <span className="badge-text">{totalQuestions} Total</span>
                </div>
                <div className="stat-badge resolved">
                  <span className="badge-icon">✅</span>
                  <span className="badge-text">{resolvedQuestions} Resolved</span>
                </div>
              </div>
            </div>
            <div className="modern-questions-list">
              {userDoubts.length > 0 ? (
                userDoubts.map(doubt => (
                  <Link key={doubt.id} to={`/doubts/${doubt.id}`} className="modern-question-card">
                    <div className="question-icon-section">
                      <div className={`question-status-icon ${doubt.status}`}>
                        {doubt.status === 'resolved' ? '✅' : '❓'}
                      </div>
                    </div>
                    <div className="question-main-content">
                      <div className="question-title-row">
                        <h4>{doubt.title}</h4>
                        <div className="question-badges">
                          <span className="subject-badge">{doubt.subject}</span>
                          <span className={`status-badge ${doubt.status}`}>{doubt.status}</span>
                        </div>
                      </div>
                      <p className="question-description">{doubt.description.substring(0, 120)}...</p>
                      <div className="question-footer">
                        <div className="question-meta">
                          <span className="meta-item">
                            <span className="meta-icon">📅</span>
                            {new Date(doubt.createdAt).toLocaleDateString()}
                          </span>
                          <span className="meta-item">
                            <span className="meta-icon">👁️</span>
                            {doubt.views || 0} views
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="modern-empty-questions">
                  <div className="empty-illustration">
                    <div className="empty-icon-large">🤔</div>
                    <div className="empty-pattern"></div>
                  </div>
                  <h3>No Questions Yet</h3>
                  <p>{id === currentUser?.id ? "Ready to start your learning journey?" : "This user hasn't asked any questions yet."}</p>
                  {id === currentUser?.id && (
                    <Link to="/ask" className="modern-cta-btn">
                      <span className="btn-icon">✨</span>
                      Ask Your First Question
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="modern-achievements-section">
            <div className="achievements-header">
              <div className="section-title">
                <div className="title-icon">🏆</div>
                <h3>Achievements & Badges</h3>
              </div>
              <div className="achievement-progress">
                <div className="progress-ring">
                  <div className="progress-text">
                    {[totalQuestions > 0 ? 1 : 0, resolvedQuestions > 0 ? 1 : 0, user.role === 'mentor' ? 1 : 0, (user.reputation || 0) > 50 ? 1 : 0].reduce((a, b) => a + b, 0)}/5
                  </div>
                </div>
                <span className="progress-label">Unlocked</span>
              </div>
            </div>
            <div className="modern-achievements-grid">
              <div className={`modern-achievement-card ${totalQuestions > 0 ? 'earned' : 'locked'}`}>
                <div className="achievement-glow"></div>
                <div className="achievement-icon-wrapper">
                  <div className="achievement-icon">🎯</div>
                </div>
                <div className="achievement-content">
                  <h4>First Question</h4>
                  <p>Asked your first question</p>
                  <div className="achievement-reward">+10 XP</div>
                </div>
                <div className="achievement-status">
                  {totalQuestions > 0 ? '✅' : '🔒'}
                </div>
              </div>
              
              <div className={`modern-achievement-card ${resolvedQuestions > 0 ? 'earned' : 'locked'}`}>
                <div className="achievement-glow"></div>
                <div className="achievement-icon-wrapper">
                  <div className="achievement-icon">✅</div>
                </div>
                <div className="achievement-content">
                  <h4>Problem Solver</h4>
                  <p>Got your first question resolved</p>
                  <div className="achievement-reward">+25 XP</div>
                </div>
                <div className="achievement-status">
                  {resolvedQuestions > 0 ? '✅' : '🔒'}
                </div>
              </div>
              
              <div className={`modern-achievement-card ${user.role === 'mentor' ? 'earned' : 'locked'}`}>
                <div className="achievement-glow"></div>
                <div className="achievement-icon-wrapper">
                  <div className="achievement-icon">🎓</div>
                </div>
                <div className="achievement-content">
                  <h4>Mentor Status</h4>
                  <p>Achieved mentor privileges</p>
                  <div className="achievement-reward">+100 XP</div>
                </div>
                <div className="achievement-status">
                  {user.role === 'mentor' ? '✅' : '🔒'}
                </div>
              </div>
              
              <div className={`modern-achievement-card ${(user.reputation || 0) > 50 ? 'earned' : 'locked'}`}>
                <div className="achievement-glow"></div>
                <div className="achievement-icon-wrapper">
                  <div className="achievement-icon">⭐</div>
                </div>
                <div className="achievement-content">
                  <h4>Rising Star</h4>
                  <p>Earned 50+ reputation points</p>
                  <div className="achievement-reward">+50 XP</div>
                </div>
                <div className="achievement-status">
                  {(user.reputation || 0) > 50 ? '✅' : '🔒'}
                </div>
              </div>
              
              <div className="modern-achievement-card locked">
                <div className="achievement-glow"></div>
                <div className="achievement-icon-wrapper">
                  <div className="achievement-icon">🔥</div>
                </div>
                <div className="achievement-content">
                  <h4>Expert Level</h4>
                  <p>Earn 100+ reputation points</p>
                  <div className="achievement-reward">+200 XP</div>
                </div>
                <div className="achievement-status">🔒</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;