import { Link } from 'react-router-dom';

const SimilarQuestions = ({ questions, loading }) => {
  if (loading) {
    return (
      <div className="similar-questions">
        <h3>Similar Existing Questions</h3>
        <div className="loading">Searching for similar questions...</div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="similar-questions">
        <h3>Similar Existing Questions</h3>
        <div className="no-results">
          No similar doubts found. You can post this new doubt.
        </div>
      </div>
    );
  }

  return (
    <div className="similar-questions">
      <h3>Similar Existing Questions</h3>
      <div className="questions-list">
        {questions.map((question) => (
          <div key={question._id} className="question-item">
            <Link to={`/doubts/${question._id}`} target="_blank" rel="noopener noreferrer">
              <h4>{question.title}</h4>
              {question.description && (
                <p className="description">{question.description}</p>
              )}
              {question.tags && question.tags.length > 0 && (
                <div className="tags">
                  {question.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              )}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimilarQuestions;