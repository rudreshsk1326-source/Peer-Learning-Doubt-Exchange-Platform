const express = require('express');
const jwt = require('jsonwebtoken');
const { readFile } = require('../utils/fileStorage');
const { generateInsights, computePlatformMetrics } = require('../utils/aiInsights');

const router = express.Router();

// Admin auth middleware
const adminAuth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const users = readFile('users.json');
    const user = users.find(u => u.id === decoded.id);

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// AI insights endpoint
router.get('/ai-insights', adminAuth, async (req, res) => {
  try {
    const doubts = readFile('doubts.json');
    const answers = readFile('answers.json');
    const users = readFile('users.json');

    const metrics = computePlatformMetrics(doubts, answers, users);
    const aiSummary = generateInsights(metrics);

    res.json({ metrics, aiSummary });
  } catch (error) {
    console.error('Error generating AI insights:', error);
    res.status(500).json({ message: 'Failed to generate insights' });
  }
});

module.exports = router;