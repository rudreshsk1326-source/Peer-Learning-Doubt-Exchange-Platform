import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const AdminInsights = () => {
  const { user } = useAuth();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchInsights();
    }
  }, [user]);

  const fetchInsights = async () => {
    try {
      const response = await axios.get('/api/admin/ai-insights');
      setInsights(response.data);
    } catch (error) {
      setError('Failed to load insights');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>Admin privileges required to view this page.</p>
      </div>
    );
  }

  if (loading) return <div className="loading">Loading insights...</div>;
  if (error) return <div className="error">{error}</div>;

  const { metrics, aiSummary } = insights || {};

  return (
    <div className="admin-insights">
      <div className="insights-header">
        <h1>🤖 AI Platform Insights</h1>
        <p>AI-powered analysis of platform usage and learning patterns</p>
      </div>

      {aiSummary && (
        <div className="ai-summary-card">
          <h3>🧠 AI Analysis Summary</h3>
          <p>{aiSummary}</p>
        </div>
      )}

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">📊</div>
          <div className="metric-info">
            <h3>{metrics?.totalQuestions || 0}</h3>
            <p>Total Questions</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">❓</div>
          <div className="metric-info">
            <h3>{metrics?.unresolvedQuestions || 0}</h3>
            <p>Unresolved Questions</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">✅</div>
          <div className="metric-info">
            <h3>{metrics?.resolutionRate || 0}%</h3>
            <p>Resolution Rate</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">💬</div>
          <div className="metric-info">
            <h3>{metrics?.totalAnswers || 0}</h3>
            <p>Total Answers</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🎓</div>
          <div className="metric-info">
            <h3>{metrics?.mentorAnswers || 0}</h3>
            <p>Mentor Answers</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">⏱️</div>
          <div className="metric-info">
            <h3>{Math.round(metrics?.avgTimeToFirstAnswer || 0)}h</h3>
            <p>Avg Time to First Answer</p>
          </div>
        </div>
      </div>

      <div className="insights-sections">
        <div className="section">
          <h3>📚 Top Subjects</h3>
          <div className="list-items">
            {metrics?.topSubjects?.map((subject, index) => (
              <div key={index} className="list-item">
                <span className="item-name">{subject.subject}</span>
                <span className="item-count">{subject.count} questions</span>
              </div>
            ))}
          </div>
        </div>

        <div className="section">
          <h3>🏷️ Common Learning Areas</h3>
          <div className="tag-cloud">
            {metrics?.topTags?.map((tag, index) => (
              <span key={index} className="tag-item" style={{fontSize: `${1 + (tag.count / 10)}rem`}}>
                {tag.tag} ({tag.count})
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminInsights;