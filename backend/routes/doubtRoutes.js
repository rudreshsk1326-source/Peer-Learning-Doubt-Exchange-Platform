const express = require('express');
const auth = require('../middleware/auth');
const Doubt = require('../models/Doubt');
const { generateQuestionAnalysis } = require('../utils/aiAnalysis');

const router = express.Router();

// Get all doubts
router.get('/', async (req, res) => {
  try {
    const doubts = await Doubt.find()
      .populate('author', 'name role isVerified')
      .sort({ createdAt: -1 })
      .lean();

    const result = doubts.map(d => ({
      ...d,
      id: d._id,
      answerCount: d.answers.length,
      voteScore: d.votes.upvotes.length - d.votes.downvotes.length
    }));

    res.json({ doubts: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single doubt
router.get('/:id', async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id)
      .populate('author', 'name role isVerified')
      .populate({
        path: 'answers',
        populate: { path: 'author', select: 'name role isVerified' }
      })
      .lean();

    if (!doubt) return res.status(404).json({ message: 'Doubt not found' });

    await Doubt.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    res.json({
      ...doubt,
      id: doubt._id,
      voteScore: doubt.votes.upvotes.length - doubt.votes.downvotes.length,
      answers: doubt.answers.map(a => ({
        ...a,
        id: a._id,
        voteScore: a.votes.upvotes.length - a.votes.downvotes.length
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create doubt
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, subject, tags } = req.body;

    const aiAnalysis = await generateQuestionAnalysis(title, description);

    const doubt = await Doubt.create({
      title, description, subject,
      tags: tags || [],
      author: req.user._id,
      aiSummary: aiAnalysis.aiSummary,
      difficultyLevel: aiAnalysis.difficultyLevel
    });

    await doubt.populate('author', 'name role isVerified');

    res.status(201).json({ ...doubt.toObject(), id: doubt._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Vote on doubt
router.post('/:id/vote', auth, async (req, res) => {
  try {
    const { type } = req.body;
    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) return res.status(404).json({ message: 'Doubt not found' });

    doubt.votes.upvotes = doubt.votes.upvotes.filter(id => !id.equals(req.user._id));
    doubt.votes.downvotes = doubt.votes.downvotes.filter(id => !id.equals(req.user._id));

    if (type === 'up') doubt.votes.upvotes.push(req.user._id);
    else if (type === 'down') doubt.votes.downvotes.push(req.user._id);

    await doubt.save();
    res.json({ voteScore: doubt.votes.upvotes.length - doubt.votes.downvotes.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
