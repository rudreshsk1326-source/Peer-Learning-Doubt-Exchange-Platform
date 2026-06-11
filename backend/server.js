const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

// Routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend connected successfully!' });
});

// Auth routes
app.use('/api/auth', require('./routes/authRoutes'));

// Doubt routes
app.use('/api/doubts', require('./routes/doubtRoutes'));

// Answer routes
app.use('/api/answers', require('./routes/answerRoutes'));

// User routes
app.use('/api/users', require('./routes/userRoutes'));

// Notification routes
app.use('/api/notifications', require('./routes/notificationRoutes'));

// AI routes
app.use('/api/ai', require('./routes/aiRoutes'));

// Admin routes
app.use('/api/admin', require('./routes/adminRoutes'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});