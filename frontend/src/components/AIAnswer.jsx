import { useState, useEffect } from 'react';
import axios from 'axios';

const AIAnswer = ({ doubt }) => {
  const [aiAnswer, setAiAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (doubt) {
      generateAIAnswer();
    }
  }, [doubt]);

  const generateAIAnswer = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('/api/ai/answer', {
        questionId: doubt.id
      });
      
      setAiAnswer(response.data.aiAnswer);
    } catch (error) {
      setError('Failed to generate AI answer');
      console.error('AI Answer Error:', error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="ai-answer-section">
        <div className="ai-answer-header">
          <h2>🤖 AI Assistant</h2>
        </div>
        <div className="ai-answer-loading">
          <div className="ai-loading-spinner"></div>
          <p>AI is generating an answer...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ai-answer-section">
        <div className="ai-answer-header">
          <h2>🤖 AI Assistant</h2>
        </div>
        <div className="ai-answer-error">
          <p>{error}</p>
          <button onClick={generateAIAnswer} className="retry-btn">
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!aiAnswer) return null;

  return (
    <div className="ai-answer-section">
      <div className="ai-answer-header">
        <h2>🤖 AI Assistant</h2>
        <div className="ai-badge">Instant AI Response</div>
      </div>

      <div className="ai-answer-card">
        <div className="ai-answer-content">
          <div className="ai-answer-text">{aiAnswer}</div>
          <div className="ai-answer-footer">
            <div className="ai-answer-author">
              <div className="author-avatar ai-avatar">
                🤖
              </div>
              <div>
                <span className="author-name">AI Assistant</span>
                <span className="ai-tag">🤖 Powered by Groq AI</span>
              </div>
            </div>
            <span className="answer-date">{formatDate(new Date().toISOString())}</span>
          </div>
        </div>
        <div className="ai-disclaimer">
          <p>⚠️ This is an AI-generated response. Please verify the information and consider mentor/community answers as well.</p>
        </div>
      </div>
    </div>
  );
};

export default AIAnswer;