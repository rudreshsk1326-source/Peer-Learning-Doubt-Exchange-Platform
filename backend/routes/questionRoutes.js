const express = require('express');
const Doubt = require('../models/Doubt');
const authMiddleware = require('../middleware/authMiddleware');
const { updateReputationAndBadges, REPUTATION_POINTS } = require('../utils/reputationHelper');

const router = express.Router();

// POST /api/questions - Create a question
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, tags } = req.body;

    const question = new Doubt({
      title,
      description,
      tags,
      createdBy: req.user._id,
      author: req.user._id
    });

    await question.save();
    await question.populate('createdBy', 'name email');

    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/questions - List questions with filters
router.get('/', async (req, res) => {
  try {
    const { search, tag, sort = 'newest', page = 1, limit = 10 } = req.query;
    let query = {};
    
    // Case-insensitive partial search on title and description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by tag (exact match in tags array)
    if (tag) {
      query.tags = { $in: [tag] };
    }

    // Sort options
    let sortOption = { createdAt: -1 }; // newest (default)
    let pipeline = [];
    
    if (sort === 'mostUpvoted') {
      // Sort by upvote count (length of upvotes array)
      pipeline = [
        { $match: query },
        { $addFields: { upvoteCount: { $size: '$upvotes' } } },
        { $sort: { upvoteCount: -1, createdAt: -1 } }
      ];
    } else if (sort === 'recentActivity') {
      // Sort by last answer date, then creation date
      pipeline = [
        { $match: query },
        {
          $lookup: {
            from: 'answers',
            localField: 'answers',
            foreignField: '_id',
            as: 'answerDocs'
          }
        },
        {
          $addFields: {
            lastAnswerDate: {
              $max: '$answerDocs.createdAt'
            }
          }
        },
        {
          $sort: {
            lastAnswerDate: -1,
            createdAt: -1
          }
        }
      ];
    }

    let questions;
    if (pipeline.length > 0) {
      // Use aggregation pipeline for complex sorting
      const skip = (page - 1) * limit;
      pipeline.push(
        { $skip: skip },
        { $limit: parseInt(limit) },
        {
          $lookup: {
            from: 'users',
            localField: 'createdBy',
            foreignField: '_id',
            as: 'createdBy'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'author',
            foreignField: '_id',
            as: 'author'
          }
        },
        {
          $addFields: {
            createdBy: { $arrayElemAt: ['$createdBy', 0] },
            author: { $arrayElemAt: ['$author', 0] }
          }
        }
      );
      questions = await Doubt.aggregate(pipeline);
    } else {
      // Use simple find for newest sort
      const skip = (page - 1) * limit;
      questions = await Doubt.find(query)
        .populate('createdBy', 'name email')
        .populate('author', 'name email')
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit));
    }

    const total = await Doubt.countDocuments(query);

    res.json({
      questions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/questions/:id - Get single question details
router.get('/:id', async (req, res) => {
  try {
    const question = await Doubt.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('author', 'name email')
      .populate({
        path: 'answers',
        populate: { path: 'author', select: 'name email' }
      });

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json(question);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/questions/:id/upvote - Upvote a question
router.post('/:id/upvote', authMiddleware, async (req, res) => {
  try {
    const question = await Doubt.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const userId = req.user._id;
    const hasUpvoted = question.upvotes.includes(userId);
    
    if (hasUpvoted) {
      question.upvotes = question.upvotes.filter(id => !id.equals(userId));
    } else {
      question.downvotes = question.downvotes.filter(id => !id.equals(userId));
      question.upvotes.push(userId);
      
      // Update author's reputation and badges
      await updateReputationAndBadges(question.createdBy, REPUTATION_POINTS.QUESTION_UPVOTE);
    }

    await question.save();
    
    res.json({ 
      upvotes: question.upvotes.length,
      downvotes: question.downvotes.length,
      hasUpvoted: !hasUpvoted
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/questions/similar - Find similar questions
router.get('/similar', async (req, res) => {
  try {
    const { title, tags } = req.query;
    
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    let query = {};
    let pipeline = [];
    
    // Text search on title and description
    if (title.length > 3) {
      query.$text = { $search: title };
      pipeline = [
        { $match: query },
        { $addFields: { score: { $meta: 'textScore' } } },
        { $sort: { score: { $meta: 'textScore' } } }
      ];
    } else {
      // Fallback to regex for short titles
      query.title = { $regex: title, $options: 'i' };
    }

    // Add tag matching boost
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
      if (tagArray.length > 0) {
        if (pipeline.length > 0) {
          // Add tag scoring to existing pipeline
          pipeline.splice(1, 0, {
            $addFields: {
              tagMatches: {
                $size: {
                  $setIntersection: ['$tags', tagArray]
                }
              }
            }
          });
          pipeline[pipeline.length - 1] = {
            $sort: { tagMatches: -1, score: { $meta: 'textScore' } }
          };
        } else {
          query.tags = { $in: tagArray };
        }
      }
    }

    let similarQuestions;
    if (pipeline.length > 0) {
      pipeline.push(
        { $limit: 5 },
        {
          $project: {
            _id: 1,
            title: 1,
            description: { $substr: ['$description', 0, 150] },
            tags: 1,
            createdAt: 1,
            upvotes: { $size: '$upvotes' }
          }
        }
      );
      similarQuestions = await Doubt.aggregate(pipeline);
    } else {
      similarQuestions = await Doubt.find(query)
        .select('_id title description tags createdAt upvotes')
        .limit(5)
        .lean();
      
      // Add snippet and upvote count
      similarQuestions = similarQuestions.map(q => ({
        ...q,
        description: q.description.substring(0, 150),
        upvotes: q.upvotes?.length || 0
      }));
    }

    res.json(similarQuestions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;