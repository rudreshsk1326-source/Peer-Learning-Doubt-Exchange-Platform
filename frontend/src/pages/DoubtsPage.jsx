import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AISummary from '../components/AISummary';
import DifficultyBadge from '../components/DifficultyBadge';

const DoubtsPage = () => {
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    subject: ''
  });
  
  const { user } = useAuth();

  useEffect(() => {
    fetchDoubts();
  }, []);

  const fetchDoubts = async () => {
    try {
      const response = await axios.get('/api/doubts');
      setDoubts(response.data.doubts);
    } catch (error) {
      console.error('Error fetching doubts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoubts = doubts.filter(doubt => {
    const matchesSearch = doubt.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                         doubt.description.toLowerCase().includes(filters.search.toLowerCase());
    const matchesSubject = !filters.subject || doubt.subject === filters.subject;
    return matchesSearch && matchesSubject;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) return <div className="loading">Loading doubts...</div>;

  return (
    <div className="doubts-page">
      <div className="page-header">
        <h1>All Doubts</h1>
        {user && (
          <Link to="/ask" className="btn btn-primary">Ask a Doubt</Link>
        )}
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search doubts..."
          value={filters.search}
          onChange={(e) => setFilters({...filters, search: e.target.value})}
        />
        <select
          value={filters.subject}
          onChange={(e) => setFilters({...filters, subject: e.target.value})}
        >
          <option value="">All Subjects</option>
          <option value="Mathematics">Mathematics</option>
          <option value="Physics">Physics</option>
          <option value="Chemistry">Chemistry</option>
          <option value="Biology">Biology</option>
          <option value="Computer Science">Computer Science</option>
          <option value="English">English</option>
          <option value="History">History</option>
          <option value="Geography">Geography</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="doubts-list">
        {filteredDoubts.length === 0 ? (
          <div className="no-doubts">
            <h3>No doubts found</h3>
            <p>Be the first to ask a question!</p>
          </div>
        ) : (
          filteredDoubts.map(doubt => (
            <div key={doubt.id} className="doubt-card">
              <div className="doubt-stats">
                <div className="stat">
                  <span className="count">{doubt.voteScore}</span>
                  <span className="label">votes</span>
                </div>
                <div className="stat">
                  <span className="count">{doubt.answerCount}</span>
                  <span className="label">answers</span>
                </div>
                <div className="stat">
                  <span className="count">{doubt.views || 0}</span>
                  <span className="label">views</span>
                </div>
              </div>
              
              <div className="doubt-content">
                <h3>
                  <Link to={`/doubts/${doubt.id}`}>{doubt.title}</Link>
                  <DifficultyBadge level={doubt.difficultyLevel} />
                </h3>
                <AISummary summary={doubt.aiSummary} />
                <p className="doubt-description">
                  {doubt.description.substring(0, 200)}...
                </p>
                
                <div className="doubt-meta">
                  <span className={`status status-${doubt.status}`}>
                    {doubt.status}
                  </span>
                  <span className="subject">{doubt.subject}</span>
                  <span className="author">
                    by {doubt.author?.name || 'Unknown'}
                    {doubt.author?.isVerified && ' ✓'}
                  </span>
                  <span className="date">{formatDate(doubt.createdAt)}</span>
                </div>
                
                {doubt.tags && doubt.tags.length > 0 && (
                  <div className="tags">
                    {doubt.tags.map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DoubtsPage;