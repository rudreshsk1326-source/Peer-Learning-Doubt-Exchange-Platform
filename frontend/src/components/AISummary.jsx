const AISummary = ({ summary }) => {
  if (!summary || summary === 'AI analysis unavailable') {
    return null;
  }

  return (
    <div className="ai-summary">
      <span className="ai-summary-text">{summary}</span>
    </div>
  );
};

export default AISummary;