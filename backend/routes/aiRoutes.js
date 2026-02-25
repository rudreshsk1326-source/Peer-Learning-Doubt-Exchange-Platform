const express = require('express');
const { readFile } = require('../utils/fileStorage');
const { findSimilarQuestions } = require('../utils/aiSimilarity');
const { suggestTags } = require('../utils/tagSuggestion');

const router = express.Router();

// Similar questions endpoint
router.post('/similar-questions', async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    
    if (!title || title.trim().length < 3) {
      return res.json({ similarQuestions: [] });
    }
    
    // Get existing questions
    const doubts = readFile('doubts.json');
    
    // Find similar questions
    const similarQuestions = findSimilarQuestions(
      title,
      description || '',
      doubts,
      5
    );
    
    res.json({ similarQuestions });
  } catch (error) {
    console.error('Error finding similar questions:', error);
    res.status(500).json({ message: 'Failed to find similar questions' });
  }
});

// Tag suggestion endpoint
router.post('/suggest-tags', async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title || title.trim().length < 3) {
      return res.json({ tags: [] });
    }
    
    const tags = suggestTags(title, description || '');
    res.json({ tags });
  } catch (error) {
    console.error('Error suggesting tags:', error);
    res.status(500).json({ message: 'Failed to suggest tags' });
  }
});

// AI Answer generation endpoint
router.post('/generate-answer', async (req, res) => {
  try {
    const { title, description, subject, doubtId } = req.body;
    
    if (!title || !doubtId) {
      return res.status(400).json({ message: 'Title and doubtId are required' });
    }

    const { generateAIAnswer } = require('../utils/aiAssistant');
    const { readFile, writeFile, generateId } = require('../utils/fileStorage');
    
    // Check if AI answer already exists for this doubt
    const answers = readFile('answers.json');
    const existingAIAnswer = answers.find(a => a.doubtId === doubtId && a.isAIAnswer);
    
    if (existingAIAnswer) {
      return res.json(existingAIAnswer);
    }

    // Generate AI answer
    const aiContent = await generateAIAnswer(title, description || '', subject || 'General');
    
    // Create AI answer object
    const aiAnswer = {
      id: generateId(),
      content: aiContent,
      authorId: 'ai-assistant',
      doubtId,
      upvotes: [],
      downvotes: [],
      isAccepted: false,
      isMentorAnswer: false,
      isAIAnswer: true,
      createdAt: new Date().toISOString()
    };

    // Save AI answer
    answers.push(aiAnswer);
    writeFile('answers.json', answers);

    res.json({
      ...aiAnswer,
      author: {
        name: 'AI Assistant',
        role: 'ai',
        isVerified: true
      },
      voteScore: 0
    });
  } catch (error) {
    console.error('Error generating AI answer:', error);
    res.status(500).json({ message: 'Failed to generate AI answer' });
  }
});

// New AI Answer endpoint - dynamic only, not stored
router.post('/answer', async (req, res) => {
  try {
    const { questionId } = req.body;
    
    if (!questionId) {
      return res.status(400).json({ message: 'questionId is required' });
    }

    const { generateAIAnswer } = require('../utils/aiHelper');
    const { readFile } = require('../utils/fileStorage');
    
    // Fetch question from DB
    const doubts = readFile('doubts.json');
    const question = doubts.find(d => d.id === questionId);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Construct prompt
    const tags = question.tags ? question.tags.join(', ') : 'none';
    const prompt = `Answer this student doubt clearly: ${question.title} | ${question.description} | tags: ${tags}`;
    
    // Generate AI answer (not stored)
    const aiAnswer = await generateAIAnswer(prompt);
    
    res.json({ aiAnswer });
  } catch (error) {
    console.error('Error generating AI answer:', error);
    res.status(500).json({ message: 'Failed to generate AI answer' });
  }
});

// Direct AI Answer endpoint for AI Assistant page
router.post('/direct-answer', async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({ message: 'question is required' });
    }

    const { generateAIAnswer } = require('../utils/aiHelper');
    
    // Generate AI answer directly
    const aiAnswer = await generateAIAnswer(question);
    
    res.json({ aiAnswer });
  } catch (error) {
    console.error('Error generating AI answer:', error);
    res.status(500).json({ message: 'Failed to generate AI answer' });
  }
});

module.exports = router;