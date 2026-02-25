// AI analysis for question summary and difficulty
const generateQuestionAnalysis = async (title, description) => {
  try {
    // Simple rule-based analysis (can be replaced with actual LLM API call)
    const text = `${title} ${description}`.toLowerCase();
    
    // Generate summary (first sentence or truncated description)
    let summary = description.split('.')[0];
    if (summary.length > 100) {
      summary = summary.substring(0, 97) + '...';
    }
    if (!summary || summary.length < 10) {
      summary = `Question about ${title.toLowerCase()}`;
    }
    
    // Determine difficulty based on keywords and complexity
    let difficulty = 'Medium';
    
    const easyKeywords = ['what is', 'define', 'basic', 'simple', 'introduction', 'beginner'];
    const hardKeywords = ['advanced', 'complex', 'algorithm', 'optimization', 'implementation', 'design pattern', 'architecture'];
    
    const easyCount = easyKeywords.filter(keyword => text.includes(keyword)).length;
    const hardCount = hardKeywords.filter(keyword => text.includes(keyword)).length;
    
    if (easyCount > hardCount && easyCount > 0) {
      difficulty = 'Easy';
    } else if (hardCount > easyCount && hardCount > 0) {
      difficulty = 'Hard';
    }
    
    // Additional complexity indicators
    if (text.length > 500 || text.split(' ').length > 100) {
      difficulty = difficulty === 'Easy' ? 'Medium' : 'Hard';
    }
    
    return {
      aiSummary: summary,
      difficultyLevel: difficulty
    };
  } catch (error) {
    console.error('Error generating AI analysis:', error);
    return {
      aiSummary: 'AI analysis unavailable',
      difficultyLevel: 'Medium'
    };
  }
};

module.exports = { generateQuestionAnalysis };