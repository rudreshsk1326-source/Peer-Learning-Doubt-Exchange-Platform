import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AISummary from '../components/AISummary';
import DifficultyBadge from '../components/DifficultyBadge';
import AIAnswer from '../components/AIAnswer';

const DoubtDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [doubt, setDoubt] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [mentorAnswer, setMentorAnswer] = useState(null);
  const [newAnswer, setNewAnswer] = useState('');
  const [newMentorAnswer, setNewMentorAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittingMentor, setSubmittingMentor] = useState(false);
  const [error, setError] = useState('');
  const [aiAnswer, setAiAnswer] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchDoubtDetail();
  }, [id]);

  const fetchDoubtDetail = async () => {
    try {
      const [doubtResponse, mentorAnswerResponse] = await Promise.allSettled([
        axios.get(`/api/doubts/${id}`),
        axios.get(`/api/answers/mentor/${id}`)
      ]);
      
      if (doubtResponse.status === 'fulfilled') {
        setDoubt(doubtResponse.value.data);
        setAnswers(doubtResponse.value.data.answers || []);
      }
      
      if (mentorAnswerResponse.status === 'fulfilled') {
        setMentorAnswer(mentorAnswerResponse.value.data);
      }
    } catch (error) {
      setError('Failed to load doubt details');
    } finally {
      setLoading(false);
    }
  };

  const handleVoteDoubt = async (type) => {
    if (!user) return;
    
    try {
      const response = await axios.post(`/api/doubts/${id}/vote`, { type });
      setDoubt(prev => ({ ...prev, voteScore: response.data.voteScore }));
    } catch (error) {
      console.error('Vote failed:', error);
    }
  };

  const handleVoteAnswer = async (answerId, type) => {
    if (!user) return;
    
    try {
      const response = await axios.post(`/api/answers/${answerId}/vote`, { type });
      setAnswers(prev => prev.map(answer => 
        answer.id === answerId 
          ? { ...answer, voteScore: response.data.voteScore }
          : answer
      ));
    } catch (error) {
      console.error('Vote failed:', error);
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!newAnswer.trim() || !user) return;

    setSubmitting(true);
    try {
      const response = await axios.post('/api/answers', {
        content: newAnswer,
        doubtId: id
      });
      
      setAnswers(prev => [...prev, response.data]);
      setNewAnswer('');
    } catch (error) {
      setError('Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitMentorAnswer = async (e) => {
    e.preventDefault();
    if (!newMentorAnswer.trim() || !user) return;

    setSubmittingMentor(true);
    try {
      const response = await axios.post(`/api/answers/mentor/${id}`, {
        content: newMentorAnswer
      });
      
      setMentorAnswer(response.data);
      setNewMentorAnswer('');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit mentor answer');
    } finally {
      setSubmittingMentor(false);
    }
  };

  const handleAcceptAnswer = async (answerId) => {
    if (!user || doubt.author?.name !== user.name) return;

    try {
      await axios.post(`/api/answers/${answerId}/accept`);
      setAnswers(prev => prev.map(answer => ({
        ...answer,
        isAccepted: answer.id === answerId
      })));
      setDoubt(prev => ({ ...prev, status: 'resolved' }));
    } catch (error) {
      console.error('Accept failed:', error);
    }
  };

  const handleAskAI = async () => {
    setAiLoading(true);
    try {
      const response = await axios.post('/api/ai/answer', {
        questionId: id
      });
      setAiAnswer(response.data.aiAnswer);
    } catch (error) {
      console.error('AI request failed:', error);
      setError('Failed to get AI response');
    } finally {
      setAiLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <div className="loading">Loading doubt details...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!doubt) return <div className="error">Doubt not found</div>;

  return (
    <div className="doubt-detail-container modern-doubt-detail">
      {/* Doubt Header */}
      <div className="doubt-header-card modern-header">
        <div className="doubt-title-section">
          <div className="title-row">
            <h1 className="modern-title">{doubt.title}</h1>
            <DifficultyBadge level={doubt.difficultyLevel} />
          </div>
          <AISummary summary={doubt.aiSummary} />
          <div className="doubt-badges modern-badges">
            <span className={`status-badge modern-status status-${doubt.status}`}>
              {doubt.status === 'open' ? '🔓 Open' : '✅ Resolved'}
            </span>
            <span className="subject-badge modern-subject">
              📚 {doubt.subject}
            </span>
            {doubt.author?.isVerified && (
              <span className="verified-badge">✓ Verified Author</span>
            )}
          </div>
        </div>
        
        <div className="doubt-meta-info modern-meta">
          <div className="author-info modern-author">
            <div className="author-avatar modern-avatar">
              {doubt.author?.name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="author-details">
              <p className="author-name">{doubt.author?.name || 'Unknown'}</p>
              <p className="author-role">
                {doubt.author?.role === 'mentor' ? '🎓 Mentor' : '👤 Student'}
              </p>
            </div>
          </div>
          <div className="doubt-stats-mini modern-stats">
            <div className="stat-item">
              <span className="stat-icon">👁️</span>
              <span className="stat-value">{doubt.views || 0}</span>
              <span className="stat-label">views</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">📅</span>
              <span className="stat-value">{formatDate(doubt.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Doubt Content */}
      <div className="doubt-content-card modern-content">
        <div className="vote-section">
          <button 
            className={`vote-btn vote-up ${user ? '' : 'disabled'}`}
            onClick={() => handleVoteDoubt('up')}
            disabled={!user}
          >
            ▲
          </button>
          <span className="vote-count">{doubt.voteScore || 0}</span>
          <button 
            className={`vote-btn vote-down ${user ? '' : 'disabled'}`}
            onClick={() => handleVoteDoubt('down')}
            disabled={!user}
          >
            ▼
          </button>
        </div>
        
        <div className="doubt-body">
          <div className="doubt-description">
            {doubt.description}
          </div>
          
          {doubt.tags && doubt.tags.length > 0 && (
            <div className="tags-section">
              {doubt.tags.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI Assistant Section */}
      <div className="ai-assistant-section">
        <div className="ai-assistant-header">
          <h2>🤖 AI Assistant</h2>
          {!aiAnswer && (
            <button 
              className="ask-ai-btn"
              onClick={handleAskAI}
              disabled={aiLoading}
            >
              {aiLoading ? '🔄 Asking AI...' : '🤖 Ask AI Assistant'}
            </button>
          )}
        </div>

        {aiLoading && (
          <div className="ai-loading">
            <div className="loading-spinner"></div>
            <p>AI is generating an answer...</p>
          </div>
        )}

        {aiAnswer && (
          <div className="ai-answer-box">
            <div className="ai-answer-header">
              <h3>AI Assistant Response</h3>
            </div>
            <div className="ai-answer-content">
              {aiAnswer}
            </div>
            <div className="ai-answer-note">
              <small>Generated by AI – not a mentor answer</small>
            </div>
          </div>
        )}
      </div>

      {/* Mentor Answer Section */}
      {(user?.role === 'mentor' || user?.isVerifiedMentor || mentorAnswer) && (
        <div className="modern-mentor-section">
          <div className="mentor-answer-header">
            <h2>🎓 Mentor Answer</h2>
            {user?.role === 'mentor' && !mentorAnswer && (
              <div className="mentor-badge">You can provide an official answer</div>
            )}
          </div>

          {mentorAnswer ? (
            <div className="mentor-answer-card modern-mentor-display-card">
              <div className="mentor-display-banner">
                🎓 Official Mentor Solution
              </div>
              <div className="mentor-display-layout">
                <div className="mentor-display-badge">
                  <div className="mentor-badge-icon">🎓</div>
                  <div className="mentor-badge-text">Official</div>
                </div>
                <div className="mentor-display-content">
                  <div className="mentor-display-text">{mentorAnswer.content}</div>
                  <div className="mentor-display-footer">
                    <div className="mentor-display-author">
                      <div className="mentor-display-avatar">
                        {mentorAnswer.author?.name?.charAt(0).toUpperCase() || 'M'}
                      </div>
                      <div className="mentor-author-info">
                        <div className="mentor-author-name">{mentorAnswer.author?.name || 'Mentor'}</div>
                        <div className="mentor-author-role">🎓 Verified Mentor</div>
                        <div className="mentor-answer-date">{formatDate(mentorAnswer.createdAt)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            user?.role === 'mentor' && (
              <div className="modern-mentor-section">
                <div className="mentor-section-header">
                  <div className="mentor-title">
                    <h2>🎓 Provide Official Answer</h2>
                    <span className="mentor-privilege-badge">Mentor Privileges</span>
                  </div>
                </div>
                <div className="mentor-answer-form-container">
                  <div className="mentor-form-header">
                    <h3>Share Your Expertise</h3>
                    <p>Your answer will be marked as an official mentor response and given priority visibility.</p>
                  </div>
                  <form onSubmit={handleSubmitMentorAnswer} className="mentor-answer-form">
                    <textarea
                      value={newMentorAnswer}
                      onChange={(e) => setNewMentorAnswer(e.target.value)}
                      placeholder="Provide a comprehensive, step-by-step solution that helps the student understand the concept thoroughly..."
                      rows="8"
                      className="mentor-textarea"
                      required
                    />
                    <div className="mentor-form-footer">
                      <div className="mentor-tips">
                        <span>Mentor Guidelines:</span>
                        <ul>
                          <li>Provide detailed explanations</li>
                          <li>Include examples when helpful</li>
                          <li>Encourage further learning</li>
                        </ul>
                      </div>
                      <div className="mentor-form-actions">
                        <button 
                          type="button" 
                          className="mentor-clear-btn"
                          onClick={() => setNewMentorAnswer('')}
                        >
                          🗑️ Clear
                        </button>
                        <button 
                          type="submit" 
                          className="submit-mentor-answer-btn"
                          disabled={submittingMentor || !newMentorAnswer.trim()}
                        >
                          {submittingMentor ? '🔄 Publishing...' : '🎓 Publish Official Answer'}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* Answers Section */}
      <div className="answers-section modern-answers-section">
        <div className="answers-header modern-answers-header">
          <h2>💡 Community Answers ({answers.length})</h2>
          <div className="answers-stats">
            <span className="total-answers">{answers.length} responses</span>
          </div>
        </div>

        {answers.length === 0 ? (
          <div className="no-answers modern-no-answers">
            <div className="no-answers-content">
              <div className="no-answers-icon">🤔</div>
              <h3>No community answers yet</h3>
              <p>Be the first to share your knowledge and help solve this doubt!</p>
            </div>
          </div>
        ) : (
          <div className="answers-list modern-answers-list">
            {answers.map(answer => (
              <div key={answer.id} className={`answer-card modern-answer-card ${answer.isAccepted ? 'accepted' : ''} ${answer.isMentorAnswer ? 'mentor-answer' : ''} ${answer.isAIAnswer ? 'ai-answer' : ''}`}>
                {answer.isAccepted && (
                  <div className="accepted-banner modern-accepted-banner">
                    ✅ Accepted Solution
                  </div>
                )}
                {answer.isMentorAnswer && (
                  <div className="mentor-answer-banner modern-mentor-banner">
                    🎓 Official Mentor Answer
                  </div>
                )}
                {answer.isAIAnswer && (
                  <div className="ai-answer-banner modern-ai-banner">
                    🤖 AI Generated Answer
                  </div>
                )}
                
                <div className="answer-layout">
                  <div className="answer-vote-section modern-vote-section">
                    {!answer.isAIAnswer ? (
                      <div className="vote-controls">
                        <button 
                          className={`vote-btn vote-up modern-vote-btn ${user ? '' : 'disabled'}`}
                          onClick={() => handleVoteAnswer(answer.id, 'up')}
                          disabled={!user}
                        >
                          ▲
                        </button>
                        <span className="vote-count modern-vote-count">{answer.voteScore || 0}</span>
                        <button 
                          className={`vote-btn vote-down modern-vote-btn ${user ? '' : 'disabled'}`}
                          onClick={() => handleVoteAnswer(answer.id, 'down')}
                          disabled={!user}
                        >
                          ▼
                        </button>
                      </div>
                    ) : (
                      <div className="ai-vote-placeholder modern-ai-placeholder">
                        <div className="ai-vote-info">
                          <span className="ai-icon">🤖</span>
                          <span className="ai-label">AI</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="answer-content modern-answer-content">
                    <div className="answer-text modern-answer-text">
                      {answer.content}
                    </div>
                    
                    <div className="answer-footer modern-answer-footer">
                      <div className="answer-author modern-answer-author">
                        <div className="author-avatar modern-author-avatar">
                          {answer.author?.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="author-info">
                          <div className="author-name-row">
                            <span className="author-name">{answer.author?.name || 'Unknown'}</span>
                            {answer.author?.role === 'mentor' && (
                              <span className="mentor-tag modern-mentor-tag">🎓 Mentor</span>
                            )}
                            {answer.author?.role === 'ai' && (
                              <span className="ai-tag modern-ai-tag">🤖 AI Assistant</span>
                            )}
                            {answer.author?.isVerified && (
                              <span className="verified-tag modern-verified-tag">✓ Verified</span>
                            )}
                          </div>
                          <div className="answer-meta">
                            <span className="answer-date">{formatDate(answer.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="answer-actions modern-answer-actions">
                        {user && doubt.author?.name === user.name && !answer.isAccepted && doubt.status !== 'resolved' && (
                          <button 
                            className="accept-btn modern-accept-btn"
                            onClick={() => handleAcceptAnswer(answer.id)}
                          >
                            ✅ Accept as Solution
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Answer Form */}
      {user ? (
        <div className="answer-form-section">
          <div className="answer-form-header">
            <h3>💭 {user.role === 'mentor' ? 'Mentor Response' : 'Your Answer'}</h3>
            <div className="user-role-badge">
              {user.role === 'mentor' ? '🎓 Mentor' : '👤 Student'}
            </div>
          </div>
          <form onSubmit={handleSubmitAnswer} className="answer-form advanced-form">
            <textarea
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder={user.role === 'mentor' 
                ? "Provide a comprehensive answer with detailed explanations..."
                : "Share your knowledge and help solve this doubt..."}
              rows="8"
              className="advanced-textarea"
              required
            />
            <div className="form-footer advanced-footer">
              <div className="form-stats">
                <span className="char-count">{newAnswer.length} characters</span>
              </div>
              <div className="form-actions">
                <button 
                  type="button" 
                  className="clear-btn"
                  onClick={() => setNewAnswer('')}
                >
                  🗑️ Clear
                </button>
                <button 
                  type="submit" 
                  className={`submit-answer-btn ${user.role === 'mentor' ? 'mentor-submit' : 'student-submit'}`}
                  disabled={submitting || !newAnswer.trim()}
                >
                  {submitting ? '📤 Posting...' : (user.role === 'mentor' ? '🎓 Post Answer' : '🚀 Post Answer')}
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : (
        <div className="login-prompt advanced-prompt">
          <div className="prompt-icon">🔐</div>
          <h3>Join the Discussion</h3>
          <p>Please <Link to="/login" className="login-link">login</Link> to share your knowledge</p>
        </div>
      )}
    </div>
  );
};

export default DoubtDetail;