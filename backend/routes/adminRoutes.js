const express = require('express');
const auth = require('../middleware/auth');
const Doubt = require('../models/Doubt');
const Answer = require('../models/Answer');
const User = require('../models/User');
const { generateInsights, computePlatformMetrics } = require('../utils/aiInsights');

const router = express.Router();

const adminAuth = async (req, res, next) => {
  await auth(req, res, () => {
    if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    next();
  });
};

router.get('/ai-insights', adminAuth, async (req, res) => {
  try {
    const [doubts, answers, users] = await Promise.all([
      Doubt.find().lean(),
      Answer.find().lean(),
      User.find().lean()
    ]);

    const metrics = computePlatformMetrics(doubts, answers, users);
    const aiSummary = generateInsights(metrics);

    res.json({ metrics, aiSummary });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate insights' });
  }
});

module.exports = router;
