import { useState } from 'react';
import axios from 'axios';

const TagSuggestions = ({ title, description, onTagSelect }) => {
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSuggestTags = async () => {
    if (!title || title.trim().length < 3) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/ai/suggest-tags', {
        title,
        description
      });
      setSuggestedTags(response.data.tags || []);
    } catch (error) {
      console.error('Error fetching tag suggestions:', error);
      setSuggestedTags([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tag-suggestions">
      <button 
        type="button" 
        onClick={handleSuggestTags}
        disabled={loading || !title || title.trim().length < 3}
        className="suggest-tags-btn"
      >
        {loading ? 'Suggesting...' : 'Suggest Tags with AI'}
      </button>
      
      {suggestedTags.length > 0 && (
        <div className="suggested-tags">
          <small>Suggested tags (click to add):</small>
          <div className="tag-chips">
            {suggestedTags.map((tag, index) => (
              <button
                key={index}
                type="button"
                className="tag-chip"
                onClick={() => onTagSelect(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TagSuggestions;