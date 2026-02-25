const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Initialize JSON files
const initFiles = () => {
  const files = ['users.json', 'doubts.json', 'answers.json'];
  files.forEach(file => {
    const filePath = path.join(dataDir, file);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([]));
    }
  });
};

initFiles();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
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