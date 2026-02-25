// Simple text preprocessing
const preprocessText = (text) => {
  return text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

// Simple word-based embedding (TF-IDF like approach)
const createSimpleEmbedding = (text, vocabulary) => {
  const words = preprocessText(text).split(' ');
  const embedding = new Array(vocabulary.length).fill(0);
  
  words.forEach(word => {
    const index = vocabulary.indexOf(word);
    if (index !== -1) {
      embedding[index]++;
    }
  });
  
  // Normalize
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return magnitude > 0 ? embedding.map(val => val / magnitude) : embedding;
};

// Build vocabulary from all questions
const buildVocabulary = (questions) => {
  const wordSet = new Set();
  questions.forEach(q => {
    const text = `${q.title} ${q.description || ''}`;
    preprocessText(text).split(' ').forEach(word => {
      if (word.length > 2) wordSet.add(word);
    });
  });
  return Array.from(wordSet);
};

// Cosine similarity
const cosineSimilarity = (vecA, vecB) => {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
};

// Main similarity search function
const findSimilarQuestions = (inputTitle, inputDescription = '', existingQuestions, limit = 5) => {
  if (existingQuestions.length === 0) return [];
  
  const vocabulary = buildVocabulary(existingQuestions);
  const inputText = `${inputTitle} ${inputDescription}`;
  const inputEmbedding = createSimpleEmbedding(inputText, vocabulary);
  
  const similarities = existingQuestions.map(question => {
    const questionText = `${question.title} ${question.description || ''}`;
    const questionEmbedding = createSimpleEmbedding(questionText, vocabulary);
    const similarity = cosineSimilarity(inputEmbedding, questionEmbedding);
    
    return {
      question,
      similarity
    };
  });
  
  return similarities
    .filter(item => item.similarity > 0.1) // Minimum similarity threshold
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
    .map(item => ({
      _id: item.question.id,
      title: item.question.title,
      description: item.question.description?.substring(0, 100) + (item.question.description?.length > 100 ? '...' : ''),
      tags: item.question.tags || [],
      similarity: item.similarity
    }));
};

module.exports = {
  findSimilarQuestions
};