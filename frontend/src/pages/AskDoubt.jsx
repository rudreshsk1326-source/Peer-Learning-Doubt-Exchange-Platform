import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import SimilarQuestions from '../components/SimilarQuestions';
import TagSuggestions from '../components/TagSuggestions';
import useDebounce from '../utils/useDebounce';

const AskDoubt = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    tags: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [similarQuestions, setSimilarQuestions] = useState([]);
  const [similarLoading, setSimilarLoading] = useState(false);
  
  const debouncedTitle = useDebounce(formData.title, 500);
  const debouncedDescription = useDebounce(formData.description, 500);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="auth-required">
        <h2>Login Required</h2>
        <p>Please login to ask a doubt.</p>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleTagSelect = (selectedTag) => {
    const currentTags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    if (!currentTags.includes(selectedTag)) {
      const newTags = [...currentTags, selectedTag].join(', ');
      setFormData({ ...formData, tags: newTags });
    }
  };

  // Search for similar questions when title changes
  useEffect(() => {
    const searchSimilarQuestions = async () => {
      if (debouncedTitle.trim().length < 3) {
        setSimilarQuestions([]);
        return;
      }

      setSimilarLoading(true);
      try {
        const response = await axios.post('/api/ai/similar-questions', {
          title: debouncedTitle,
          description: debouncedDescription,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        });
        setSimilarQuestions(response.data.similarQuestions || []);
      } catch (error) {
        console.error('Error fetching similar questions:', error);
        setSimilarQuestions([]);
      } finally {
        setSimilarLoading(false);
      }
    };

    searchSimilarQuestions();
  }, [debouncedTitle, debouncedDescription]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      const response = await axios.post('/api/doubts', {
        title: formData.title,
        description: formData.description,
        subject: formData.subject,
        tags: tagsArray
      });

      navigate(`/doubts/${response.data.id}`);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create doubt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ask-doubt-page">
      <h1>Ask a Doubt</h1>
      
      <div className="doubt-container">
        <form className="doubt-form" onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            name="title"
            placeholder="What's your question? Be specific."
            value={formData.title}
            onChange={handleChange}
            required
          />
          <small>Make your title clear and descriptive</small>
        </div>
        
        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            placeholder="Provide more details about your doubt..."
            value={formData.description}
            onChange={handleChange}
            rows="6"
            required
          />
          <small>Explain your doubt in detail. Include what you've tried and where you're stuck.</small>
        </div>
        
        <div className="form-group">
          <label>Subject</label>
          <select
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
          >
            <option value="">Select a subject</option>
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
        
        <div className="form-group">
          <label>Tags (Optional)</label>
          <input
            type="text"
            name="tags"
            placeholder="algebra, equations, homework (comma separated)"
            value={formData.tags}
            onChange={handleChange}
          />
          <small>Add relevant tags separated by commas</small>
          <TagSuggestions 
            title={formData.title}
            description={formData.description}
            onTagSelect={handleTagSelect}
          />
        </div>
        
        <div className="form-actions">
          <button type="button" onClick={() => navigate('/doubts')} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Posting...' : 'Post Doubt'}
          </button>
        </div>
        </form>
        
        {(formData.title.length >= 3 || similarQuestions.length > 0) && (
          <SimilarQuestions 
            questions={similarQuestions} 
            loading={similarLoading} 
          />
        )}
      </div>
    </div>
  );
};

export default AskDoubt;