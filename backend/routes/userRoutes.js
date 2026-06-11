const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Doubt = require('../models/Doubt');
const Answer = require('../models/Answer');

const router = express.Router();

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    const [doubtsAsked, answersGiven] = await Promise.all([
      Doubt.countDocuments({ author: user._id }),
      Answer.countDocuments({ author: user._id })
    ]);
    const acceptedAnswers = await Answer.countDocuments({ author: user._id, isAccepted: true });

    res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified, reputation: user.reputation || 0, createdAt: user.createdAt },
      stats: { doubtsAsked, answersGiven, acceptedAnswers, reputation: user.reputation || 0 }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password').lean();
    res.json({ users: users.map(u => ({ ...u, id: u._id })) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Verify user (admin only)
router.patch('/:id/verify', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

    const user = await User.findByIdAndUpdate(req.params.id, { isVerified: true });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User verified successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
