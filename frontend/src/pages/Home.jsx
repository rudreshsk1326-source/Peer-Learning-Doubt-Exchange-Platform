import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MotivationalQuotes from '../components/MotivationalQuotes';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Peer Learning Doubt Exchange Platform</h1>
        <p>Connect with peers, ask doubts, and learn together in a collaborative environment.</p>
        
        <div className="hero-actions">
          {user ? (
            <>
              <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
              <Link to="/ask" className="btn btn-secondary">Ask a Doubt</Link>
            </>
          ) : (
            <>
              <Link to="/signup" className="btn btn-primary">Get Started</Link>
              <Link to="/login" className="btn btn-secondary">Login</Link>
            </>
          )}
        </div>
      </div>

      <div className="features-section">
        <h2>Platform Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Ask Doubts</h3>
            <p>Post your academic questions and get help from peers and mentors.</p>
          </div>
          <div className="feature-card">
            <h3>Answer & Help</h3>
            <p>Share your knowledge by answering questions and helping others learn.</p>
          </div>
          <div className="feature-card">
            <h3>Reputation System</h3>
            <p>Build your reputation by providing quality answers and getting upvotes.</p>
          </div>
          <div className="feature-card">
            <h3>Subject Categories</h3>
            <p>Organize doubts by subjects like Math, Physics, Chemistry, and more.</p>
          </div>
        </div>
      </div>

      <div className="motivation-section">
        <MotivationalQuotes />
      </div>
    </div>
  );
};

export default Home;