// Simple keyword extraction and tag suggestion
const suggestTags = (title, description) => {
  const text = `${title} ${description}`.toLowerCase();
  
  // Subject-based keywords
  const subjectKeywords = {
    'Physics': ['physics', 'force', 'motion', 'energy', 'velocity', 'acceleration', 'gravity', 'momentum', 'wave', 'light', 'electricity', 'magnetism', 'thermodynamics', 'quantum', 'mechanics'],
    'Mathematics': ['math', 'algebra', 'calculus', 'geometry', 'trigonometry', 'equation', 'function', 'derivative', 'integral', 'matrix', 'probability', 'statistics', 'number', 'theorem'],
    'Chemistry': ['chemistry', 'molecule', 'atom', 'reaction', 'compound', 'element', 'bond', 'acid', 'base', 'organic', 'inorganic', 'solution', 'catalyst', 'oxidation'],
    'Biology': ['biology', 'cell', 'dna', 'gene', 'protein', 'organism', 'evolution', 'ecosystem', 'photosynthesis', 'respiration', 'anatomy', 'physiology'],
    'Computer Science': ['programming', 'algorithm', 'data structure', 'array', 'loop', 'function', 'class', 'object', 'database', 'sql', 'javascript', 'python', 'java', 'html', 'css', 'api', 'framework'],
    'Data Structures': ['array', 'linked list', 'stack', 'queue', 'tree', 'graph', 'hash', 'sorting', 'searching', 'binary tree', 'heap'],
    'Algorithms': ['sorting', 'searching', 'recursion', 'dynamic programming', 'greedy', 'backtracking', 'divide and conquer', 'complexity'],
    'Web Development': ['html', 'css', 'javascript', 'react', 'node', 'express', 'mongodb', 'api', 'frontend', 'backend', 'responsive'],
    'Database': ['sql', 'mysql', 'mongodb', 'database', 'query', 'join', 'index', 'normalization', 'transaction', 'dbms'],
    'Networking': ['network', 'protocol', 'tcp', 'udp', 'http', 'routing', 'switch', 'router', 'ip', 'dns'],
    'Operating Systems': ['os', 'process', 'thread', 'memory', 'cpu', 'scheduling', 'deadlock', 'synchronization'],
    'Machine Learning': ['ml', 'ai', 'neural network', 'regression', 'classification', 'clustering', 'supervised', 'unsupervised']
  };
  
  const suggestedTags = [];
  
  // Check for subject matches
  for (const [subject, keywords] of Object.entries(subjectKeywords)) {
    const matchCount = keywords.filter(keyword => text.includes(keyword)).length;
    if (matchCount > 0) {
      suggestedTags.push({ tag: subject, score: matchCount });
    }
  }
  
  // Extract specific technical terms
  const technicalTerms = text.match(/\b(array|loop|function|class|object|algorithm|database|api|html|css|javascript|python|java|react|node|sql|mongodb)\b/g) || [];
  technicalTerms.forEach(term => {
    const capitalizedTerm = term.charAt(0).toUpperCase() + term.slice(1);
    if (!suggestedTags.find(t => t.tag.toLowerCase() === term)) {
      suggestedTags.push({ tag: capitalizedTerm, score: 1 });
    }
  });
  
  // Sort by score and return top 5
  return suggestedTags
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(item => item.tag);
};

module.exports = { suggestTags };