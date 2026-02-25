const express = require('express');
const jwt = require('jsonwebtoken');
const { readFile, writeFile } = require('../utils/fileStorage');

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

// Get user profile
router.get('/:id', (req, res) => {
  try {
    const users = readFile('users.json');
    const doubts = readFile('doubts.json');
    const answers = readFile('answers.json');

    const user = users.find(u => u.id === req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userDoubts = doubts.filter(d => d.authorId === user.id);
    const userAnswers = answers.filter(a => a.authorId === user.id);
    const acceptedAnswers = userAnswers.filter(a => a.isAccepted);

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        reputation: user.reputation || 0,
        createdAt: user.createdAt
      },
      stats: {
        doubtsAsked: userDoubts.length,
        answersGiven: userAnswers.length,
        acceptedAnswers: acceptedAnswers.length,
        reputation: user.reputation || 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all users
router.get('/', (req, res) => {
  try {
    const users = readFile('users.json');
    const usersWithoutPassword = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      reputation: user.reputation || 0,
      createdAt: user.createdAt
    }));

    res.json({ users: usersWithoutPassword });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Verify user (admin only)
router.patch('/:id/verify', auth, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const users = readFile('users.json');
    const user = users.find(u => u.id === req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isVerified = true;
    writeFile('users.json', users);

    res.json({ message: 'User verified successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;