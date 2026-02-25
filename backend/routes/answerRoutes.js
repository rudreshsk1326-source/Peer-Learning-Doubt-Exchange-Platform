const express = require('express');
const jwt = require('jsonwebtoken');
const { readFile, writeFile, generateId } = require('../utils/fileStorage');
const { requireMentor } = require('../middleware/mentorAuth');

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

// Create answer
router.post('/', auth, (req, res) => {
  try {
    const { content, doubtId } = req.body;

    const doubts = readFile('doubts.json');
    const doubt = doubts.find(d => d.id === doubtId);

    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }

    // Prevent user from answering their own doubt
    if (doubt.authorId === req.user.id) {
      return res.status(400).json({ message: 'You cannot answer your own doubt' });
    }

    const answer = {
      id: generateId(),
      content,
      authorId: req.user.id,
      doubtId,
      upvotes: [],
      downvotes: [],
      isAccepted: false,
      isMentorAnswer: false,
      createdAt: new Date().toISOString()
    };

    const answers = readFile('answers.json');
    answers.push(answer);
    writeFile('answers.json', answers);

    res.status(201).json({
      ...answer,
      author: {
        name: req.user.name,
        role: req.user.role,
        isVerified: req.user.isVerified
      },
      voteScore: 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create mentor answer
router.post('/mentor/:doubtId', requireMentor, (req, res) => {
  try {
    const { content } = req.body;
    const { doubtId } = req.params;

    const doubts = readFile('doubts.json');
    const doubt = doubts.find(d => d.id === doubtId);

    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }

    // Prevent mentor from answering their own doubt
    if (doubt.authorId === req.user.id) {
      return res.status(400).json({ message: 'You cannot answer your own doubt' });
    }

    // Check if mentor answer already exists
    const answers = readFile('answers.json');
    const existingMentorAnswer = answers.find(a => a.doubtId === doubtId && a.isMentorAnswer);
    
    if (existingMentorAnswer) {
      return res.status(400).json({ message: 'Mentor answer already exists for this doubt' });
    }

    const answer = {
      id: generateId(),
      content,
      authorId: req.user.id,
      doubtId,
      upvotes: [],
      downvotes: [],
      isAccepted: false,
      isMentorAnswer: true,
      createdAt: new Date().toISOString()
    };

    answers.push(answer);
    writeFile('answers.json', answers);

    // Create notification for the student who asked the doubt
    const Notification = require('../models/Notification');
    Notification.create({
      userId: doubt.authorId,
      type: 'MENTOR_ANSWER',
      questionId: doubtId,
      answerId: answer.id,
      message: `A mentor has answered your question: "${doubt.title}"`
    });

    res.status(201).json({
      ...answer,
      author: {
        name: req.user.name,
        role: req.user.role,
        isVerified: req.user.isVerified
      },
      voteScore: 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get mentor answer for a doubt
router.get('/mentor/:doubtId', (req, res) => {
  try {
    const { doubtId } = req.params;
    const answers = readFile('answers.json');
    const users = readFile('users.json');
    
    const mentorAnswer = answers.find(a => a.doubtId === doubtId && a.isMentorAnswer);
    
    if (!mentorAnswer) {
      return res.status(404).json({ message: 'No mentor answer found' });
    }

    const author = users.find(u => u.id === mentorAnswer.authorId);
    
    res.json({
      ...mentorAnswer,
      author: author ? {
        name: author.name,
        role: author.role,
        isVerified: author.isVerified
      } : null,
      voteScore: mentorAnswer.upvotes.length - mentorAnswer.downvotes.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Vote on answer
router.post('/:id/vote', auth, (req, res) => {
  try {
    const { type } = req.body;
    const answers = readFile('answers.json');
    const answer = answers.find(a => a.id === req.params.id);

    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    // Don't allow voting on AI answers
    if (answer.isAIAnswer) {
      return res.status(400).json({ message: 'Cannot vote on AI answers' });
    }

    // Remove existing votes
    answer.upvotes = answer.upvotes.filter(id => id !== req.user.id);
    answer.downvotes = answer.downvotes.filter(id => id !== req.user.id);

    // Add new vote
    if (type === 'up') {
      answer.upvotes.push(req.user.id);
    } else if (type === 'down') {
      answer.downvotes.push(req.user.id);
    }

    writeFile('answers.json', answers);
    res.json({ voteScore: answer.upvotes.length - answer.downvotes.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all answers
router.get('/', (req, res) => {
  try {
    const answers = readFile('answers.json');
    const users = readFile('users.json');
    
    const answersWithAuthors = answers.map(answer => {
      const author = users.find(u => u.id === answer.authorId);
      return {
        ...answer,
        author: author ? {
          name: author.name,
          role: author.role,
          isVerified: author.isVerified
        } : null,
        voteScore: answer.upvotes.length - answer.downvotes.length
      };
    });
    
    res.json({ answers: answersWithAuthors });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Accept answer
router.post('/:id/accept', auth, (req, res) => {
  try {
    const answers = readFile('answers.json');
    const doubts = readFile('doubts.json');
    const users = readFile('users.json');

    const answer = answers.find(a => a.id === req.params.id);
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    const doubt = doubts.find(d => d.id === answer.doubtId);
    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }

    // Check if user is doubt author
    if (doubt.authorId !== req.user.id) {
      return res.status(403).json({ message: 'Only doubt author can accept answers' });
    }

    // Remove previous accepted answer
    answers.forEach(a => {
      if (a.doubtId === doubt.id) {
        a.isAccepted = false;
      }
    });

    // Accept this answer
    answer.isAccepted = true;
    doubt.status = 'resolved';

    // Update reputation
    const answerAuthor = users.find(u => u.id === answer.authorId);
    if (answerAuthor) {
      answerAuthor.reputation = (answerAuthor.reputation || 0) + 15;
    }
    req.user.reputation = (req.user.reputation || 0) + 2;

    writeFile('answers.json', answers);
    writeFile('doubts.json', doubts);
    writeFile('users.json', users);

    res.json({ message: 'Answer accepted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;