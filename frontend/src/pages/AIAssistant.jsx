import { useState } from 'react';
import axios from 'axios';

const AIAssistant = () => {
  const [question, setQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAskAI = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError('');
    setAiAnswer('');

    try {
      const response = await axios.post('/api/ai/direct-answer', {
        question: question.trim()
      });
      setAiAnswer(response.data.aiAnswer);
    } catch (error) {
      setError('Failed to get AI response. Please try again.');
      console.error('AI request failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearConversation = () => {
    setQuestion('');
    setAiAnswer('');
    setError('');
  };

  return (
    <div className="ai-assistant-page">
      <div className="ai-assistant-container">
        <div className="ai-assistant-header">
          <div className="ai-header-content">
            <h1>🤖 AI Assistant</h1>
            <p>Ask me anything and get instant answers!</p>
          </div>
          <button 
            className="close-ai-btn"
            onClick={() => window.history.back()}
            title="Close AI Assistant"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleAskAI} className="ai-question-form">
          <div className="form-group">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Type your question here..."
              rows="4"
              required
            />
          </div>
          <div className="ai-form-actions">
            <button 
              type="submit" 
              className="ask-ai-btn"
              disabled={loading || !question.trim()}
            >
              {loading ? '🔄 Thinking...' : '🤖 Ask AI'}
            </button>
            {(question || aiAnswer || error) && (
              <button 
                type="button" 
                className="clear-ai-btn"
                onClick={handleClearConversation}
                disabled={loading}
              >
                ❌ Clear
              </button>
            )}
          </div>
        </form>

        {loading && (
          <div className="ai-loading">
            <div className="loading-spinner"></div>
            <p>AI is thinking...</p>
          </div>
        )}

        {error && (
          <div className="ai-error">
            <p>{error}</p>
          </div>
        )}

        {aiAnswer && (
          <div className="ai-response">
            <h3>AI Response:</h3>
            <div className="ai-answer-content">
              {aiAnswer}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistant;