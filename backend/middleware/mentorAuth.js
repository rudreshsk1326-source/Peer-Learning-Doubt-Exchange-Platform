const jwt = require('jsonwebtoken');
const User = require('../models/User');

const requireMentor = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'User not found' });

    if (user.role !== 'mentor' && user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Mentor privileges required.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = { requireMentor };
