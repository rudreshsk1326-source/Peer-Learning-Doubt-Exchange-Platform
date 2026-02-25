const express = require('express');
const jwt = require('jsonwebtoken');
const { readFile, writeFile, generateId } = require('../utils/fileStorage');
const { generateQuestionAnalysis } = require('../utils/aiAnalysis');

const router = express.Router();

// Auth middleware
const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const users = readFile('users.json');
    const user = users.find(u => u.id === decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get all doubts
router.get('/', (req, res) => {
  try {
    const doubts = readFile('doubts.json');
    const users = readFile('users.json');
    const answers = readFile('answers.json');

    const doubtsWithDetails = doubts.map(doubt => {
      const author = users.find(u => u.id === doubt.authorId);
      const doubtAnswers = answers.filter(a => a.doubtId === doubt.id);
      
      return {
        ...doubt,
        author: author ? { name: author.name, role: author.role, isVerified: author.isVerified } : null,
        answerCount: doubtAnswers.length,
        voteScore: doubt.upvotes.length - doubt.downvotes.length
      };
    });

    res.json({ doubts: doubtsWithDetails.reverse() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single doubt
router.get('/:id', (req, res) => {
  try {
    const doubts = readFile('doubts.json');
    const users = readFile('users.json');
    const answers = readFile('answers.json');

    const doubt = doubts.find(d => d.id === req.params.id);
    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }

    const author = users.find(u => u.id === doubt.authorId);
    const doubtAnswers = answers.filter(a => a.doubtId === doubt.id).map(answer => {
      const answerAuthor = users.find(u => u.id === answer.authorId);
      return {
        ...answer,
        author: answerAuthor ? { 
          name: answerAuthor.name, 
          role: answerAuthor.role, 
          isVerified: answerAuthor.isVerified 
        } : null,
        voteScore: answer.upvotes.length - answer.downvotes.length
      };
    }).sort((a, b) => {
      // Sort mentor answers first, then by creation date
      if (a.isMentorAnswer && !b.isMentorAnswer) return -1;
      if (!a.isMentorAnswer && b.isMentorAnswer) return 1;
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

    // Increment views
    doubt.views = (doubt.views || 0) + 1;
    writeFile('doubts.json', doubts);

    res.json({
      ...doubt,
      author: author ? { 
        name: author.name, 
        role: author.role, 
        isVerified: author.isVerified 
      } : null,
      answers: doubtAnswers,
      voteScore: doubt.upvotes.length - doubt.downvotes.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create doubt
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, subject, tags } = req.body;

    const doubt = {
      id: generateId(),
      title,
      description,
      subject,
      tags: tags || [],
      authorId: req.user.id,
      status: 'open',
      upvotes: [],
      downvotes: [],
      views: 0,
      createdAt: new Date().toISOString()
    };

    // Generate AI analysis
    const aiAnalysis = await generateQuestionAnalysis(title, description);
    doubt.aiSummary = aiAnalysis.aiSummary;
    doubt.difficultyLevel = aiAnalysis.difficultyLevel;

    const doubts = readFile('doubts.json');
    doubts.push(doubt);
    writeFile('doubts.json', doubts);

    res.status(201).json({
      ...doubt,
      author: { 
        name: req.user.name, 
        role: req.user.role, 
        isVerified: req.user.isVerified 
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Vote on doubt
router.post('/:id/vote', auth, (req, res) => {
  try {
    const { type } = req.body;
    const doubts = readFile('doubts.json');
    const doubt = doubts.find(d => d.id === req.params.id);

    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }

    // Remove existing votes
    doubt.upvotes = doubt.upvotes.filter(id => id !== req.user.id);
    doubt.downvotes = doubt.downvotes.filter(id => id !== req.user.id);

    // Add new vote
    if (type === 'up') {
      doubt.upvotes.push(req.user.id);
    } else if (type === 'down') {
      doubt.downvotes.push(req.user.id);
    }

    writeFile('doubts.json', doubts);
    res.json({ voteScore: doubt.upvotes.length - doubt.downvotes.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;