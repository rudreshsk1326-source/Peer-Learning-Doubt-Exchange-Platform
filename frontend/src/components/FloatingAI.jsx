import { useState } from 'react';
import { Link } from 'react-router-dom';

const FloatingAI = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link 
      to="/ai-assistant"
      className="floating-ai-button"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="ai-icon">🤖</div>
      {isHovered && (
        <div className="ai-tooltip">
          AI Assistant
        </div>
      )}
    </Link>
  );
};

export default FloatingAI;