const User = require('../models/User');

const REPUTATION_POINTS = {
  ANSWER_UPVOTE: 10,
  QUESTION_UPVOTE: 5
};

const BADGE_THRESHOLDS = {
  'Rookie Helper': 50,
  'Active Mentor': 200,
  'Top Contributor': 500
};

const updateReputationAndBadges = async (userId, points) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    // Update reputation points
    user.reputationPoints += points;

    // Check and assign badges
    const newBadges = [];
    for (const [badge, threshold] of Object.entries(BADGE_THRESHOLDS)) {
      if (user.reputationPoints >= threshold && !user.badges.includes(badge)) {
        newBadges.push(badge);
      }
    }

    if (newBadges.length > 0) {
      user.badges.push(...newBadges);
    }

    await user.save();
    return { reputationPoints: user.reputationPoints, newBadges };
  } catch (error) {
    console.error('Error updating reputation:', error);
    return null;
  }
};

module.exports = {
  updateReputationAndBadges,
  REPUTATION_POINTS
};