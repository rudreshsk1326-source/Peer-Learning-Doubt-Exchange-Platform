const express = require('express');
const auth = require('../middleware/auth');
const { requireMentor } = require('../middleware/mentorAuth');
const Answer = require('../models/Answer');
const Doubt = require('../models/Doubt');
const User = require('../models/User');
const Notification = require('../models/Notification');

const router = express.Router();

// Create answer
router.post('/', auth, async (req, res) => {
  try {
    const { content, doubtId } = req.body;

    const doubt = await Doubt.findById(doubtId);
    if (!doubt) return res.status(404).json({ message: 'Doubt not found' });

    if (doubt.author.equals(req.user._id)) {
      return res.status(400).json({ message: 'You cannot answer your own doubt' });
    }

    const answer = await Answer.create({ content, author: req.user._id, doubt: doubtId });
    doubt.answers.push(answer._id);
    await doubt.save();
    await answer.populate('author', 'name role isVerified');

    res.status(201).json({ ...answer.toObject(), id: answer._id, voteScore: 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create mentor answer
router.post('/mentor/:doubtId', requireMentor, async (req, res) => {
  try {
    const { content } = req.body;
    const { doubtId } = req.params;

    const doubt = await Doubt.findById(doubtId);
    if (!doubt) return res.status(404).json({ message: 'Doubt not found' });

    if (doubt.author.equals(req.user._id)) {
      return res.status(400).json({ message: 'You cannot answer your own doubt' });
    }

    const existing = await Answer.findOne({ doubt: doubtId, isMentorAnswer: true });
    if (existing) return res.status(400).json({ message: 'Mentor answer already exists' });

    const answer = await Answer.create({ content, author: req.user._id, doubt: doubtId, isMentorAnswer: true });
    doubt.answers.push(answer._id);
    await doubt.save();
    await answer.populate('author', 'name role isVerified');

    await Notification.create({
      userId: doubt.author,
      type: 'MENTOR_ANSWER',
      questionId: doubtId,
      answerId: answer._id,
      message: `A mentor has answered your question: "${doubt.title}"`
    });

    res.status(201).json({ ...answer.toObject(), id: answer._id, voteScore: 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get mentor answer for a doubt
router.get('/mentor/:doubtId', async (req, res) => {
  try {
    const answer = await Answer.findOne({ doubt: req.params.doubtId, isMentorAnswer: true })
      .populate('author', 'name role isVerified');
    if (!answer) return res.status(404).json({ message: 'No mentor answer found' });
    res.json({ ...answer.toObject(), id: answer._id, voteScore: answer.votes.upvotes.length - answer.votes.downvotes.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Vote on answer
router.post('/:id/vote', auth, async (req, res) => {
  try {
    const { type } = req.body;
    const answer = await Answer.findById(req.params.id);
    if (!answer) return res.status(404).json({ message: 'Answer not found' });
    if (answer.isAIAnswer) return res.status(400).json({ message: 'Cannot vote on AI answers' });

    answer.votes.upvotes = answer.votes.upvotes.filter(id => !id.equals(req.user._id));
    answer.votes.downvotes = answer.votes.downvotes.filter(id => !id.equals(req.user._id));

    if (type === 'up') answer.votes.upvotes.push(req.user._id);
    else if (type === 'down') answer.votes.downvotes.push(req.user._id);

    await answer.save();
    res.json({ voteScore: answer.votes.upvotes.length - answer.votes.downvotes.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all answers
router.get('/', async (req, res) => {
  try {
    const answers = await Answer.find().populate('author', 'name role isVerified').lean();
    res.json({ answers: answers.map(a => ({ ...a, id: a._id, voteScore: a.votes.upvotes.length - a.votes.downvotes.length })) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Accept answer
router.post('/:id/accept', auth, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) return res.status(404).json({ message: 'Answer not found' });

    const doubt = await Doubt.findById(answer.doubt);
    if (!doubt) return res.status(404).json({ message: 'Doubt not found' });

    if (!doubt.author.equals(req.user._id)) {
      return res.status(403).json({ message: 'Only doubt author can accept answers' });
    }

    await Answer.updateMany({ doubt: doubt._id }, { isAccepted: false });
    answer.isAccepted = true;
    await answer.save();

    doubt.status = 'resolved';
    doubt.acceptedAnswer = answer._id;
    await doubt.save();

    await User.findByIdAndUpdate(answer.author, { $inc: { reputation: 15 } });
    await User.findByIdAndUpdate(req.user._id, { $inc: { reputation: 2 } });

    res.json({ message: 'Answer accepted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
