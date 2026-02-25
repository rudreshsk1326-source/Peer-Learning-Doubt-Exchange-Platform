# Peer Learning Doubt Exchange Platform

A complete MERN stack web application for peer learning and doubt exchange with authentication, voting, and real-time features.

## 🚀 Features

### Authentication & User Management
- ✅ JWT-based authentication with bcrypt password hashing
- ✅ User registration and login
- ✅ Protected routes and middleware
- ✅ User profiles with statistics
- ✅ Role-based access (student/admin)

### Doubt Management
- ✅ Post questions with title, description, subject, and tags
- ✅ Browse and search doubts by subject, status, or keywords
- ✅ Filter doubts by open/resolved/closed status
- ✅ Detailed doubt view with answers
- ✅ Vote on questions (upvote/downvote)

### Answer System
- ✅ Answer questions with rich text
- ✅ Vote on answers (upvote/downvote)
- ✅ Accept best answers (by question author)
- ✅ Track accepted answers for reputation

### User Experience
- ✅ Responsive design for all devices
- ✅ Real-time notifications with toast messages
- ✅ Clean and intuitive UI
- ✅ Loading states and error handling
- ✅ User dashboard with activity tracking

## 🏗️ Project Structure

```
Peer-Learning-Doubt-Exchange-Platform/
├── backend/
│   ├── models/
│   │   ├── User.js         # User schema
│   │   ├── Doubt.js        # Question schema
│   │   ├── Answer.js       # Answer schema
│   │   └── Chat.js         # Chat schema (future)
│   ├── routes/
│   │   ├── authRoutes.js   # Authentication endpoints
│   │   ├── doubtRoutes.js  # Doubt CRUD operations
│   │   ├── answerRoutes.js # Answer operations
│   │   └── userRoutes.js   # User profile endpoints
│   ├── middleware/
│   │   └── authMiddleware.js # JWT verification
│   ├── server.js           # Express server setup
│   ├── package.json        # Backend dependencies
│   └── .env               # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx  # Navigation component
│   │   ├── pages/
│   │   │   ├── Home.jsx    # Landing page
│   │   │   ├── Login.jsx   # Login form
│   │   │   ├── Signup.jsx  # Registration form
│   │   │   ├── DoubtsPage.jsx # Browse doubts
│   │   │   ├── AskDoubt.jsx   # Create question
│   │   │   ├── DoubtDetail.jsx # Question details
│   │   │   └── Profile.jsx    # User profile
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Authentication state
│   │   ├── App.jsx         # Main app component
│   │   ├── main.jsx        # React entry point
│   │   ├── App.css         # Complete styling
│   │   └── index.css       # Global styles
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite config with proxy
├── package.json            # Root scripts
└── README.md              # This documentation
```

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin requests

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Toastify** - Notifications
- **CSS3** - Styling with responsive design

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn package manager

## 🚀 Quick Start

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Peer-Learning-Doubt-Exchange-Platform
   ```

2. **Install dependencies:**
   ```bash
   npm install
   npm run install-all
   ```

3. **Set up environment variables:**
   ```bash
   # In backend/.env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/peer-learning-platform
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```

4. **Start MongoDB:**
   ```bash
   # If using local MongoDB
   mongod
   ```

5. **Run the application:**
   ```bash
   npm run dev
   ```

6. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/auth/signup     # Register new user
POST /api/auth/login      # User login
GET  /api/auth/me         # Get current user
```

### Doubt Endpoints
```
GET    /api/doubts        # Get all doubts (with filters)
POST   /api/doubts        # Create new doubt
GET    /api/doubts/:id    # Get doubt details
PUT    /api/doubts/:id/vote # Vote on doubt
POST   /api/doubts/:id/answers # Add answer
```

### Answer Endpoints
```
PUT /api/answers/:id/vote   # Vote on answer
PUT /api/answers/:id/accept # Accept answer
```

### User Endpoints
```
GET /api/users/profile     # Get user profile
GET /api/users/my-doubts   # Get user's questions
GET /api/users/my-answers  # Get user's answers
```

## 🎯 Usage Guide

### For Students:
1. **Sign up** for a new account
2. **Browse doubts** to find questions you can answer
3. **Ask questions** when you need help
4. **Vote** on helpful questions and answers
5. **Accept answers** that solve your questions
6. **Track progress** in your profile

### Key Features:
- **Search & Filter**: Find relevant questions by subject or keywords
- **Voting System**: Community-driven quality control
- **Reputation**: Build credibility through accepted answers
- **Real-time Updates**: Instant notifications for interactions

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Run both frontend and backend
npm run server       # Run backend only
npm run client       # Run frontend only
npm run install-all  # Install all dependencies
```

### Environment Variables
```env
# Backend (.env)
PORT=5000
MONGODB_URI=mongodb://localhost:27017/peer-learning-platform
JWT_SECRET=your-jwt-secret-key
```

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas or use local MongoDB
2. Configure environment variables
3. Deploy to Heroku, Railway, or similar platform

### Frontend Deployment
1. Update API base URL in production
2. Build the project: `npm run build`
3. Deploy to Vercel, Netlify, or similar platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information

---

**Happy Learning! 🎓**