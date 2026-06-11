import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const FloatingAI = () => {
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();

  if (location.pathname === '/ai-assistant') return null;

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