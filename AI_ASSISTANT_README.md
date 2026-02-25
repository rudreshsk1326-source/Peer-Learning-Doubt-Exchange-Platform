# AI Assistant Feature

## Overview
The AI Assistant feature has been successfully added to your Peer Learning Doubt Exchange Platform. It provides instant AI-generated answers to student questions using Groq AI technology.

## Features Added

### 1. AI Answer Generation
- **Instant Responses**: AI generates answers immediately when a doubt is viewed
- **Educational Focus**: Answers are tailored for students with step-by-step explanations
- **Subject Awareness**: AI considers the subject context when generating answers

### 2. AI Answer Display
- **Dedicated Section**: AI answers appear in their own section above mentor answers
- **Clear Identification**: AI answers are clearly marked with 🤖 icons and badges
- **Professional Styling**: Distinct visual design to differentiate from human answers

### 3. Integration with Existing System
- **Non-Disruptive**: Existing mentor and student answer features remain unchanged
- **Complementary**: AI answers work alongside human answers, not replacing them
- **Voting Restrictions**: AI answers cannot be voted on (maintains human answer integrity)

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install groq-sdk
```

### 2. Get Groq API Key
1. Visit [Groq Console](https://console.groq.com/)
2. Sign up/login and create an API key
3. Copy your API key

### 3. Configure Environment
Add to `backend/.env`:
```
GROQ_API_KEY=your_groq_api_key_here
```

### 4. Start the Application
```bash
# Backend
cd backend
npm run dev

# Frontend (in new terminal)
cd frontend
npm run dev
```

## How It Works

### Backend Components
- **AI Assistant Utility** (`utils/aiAssistant.js`): Handles Groq API integration
- **AI Routes** (`routes/aiRoutes.js`): New endpoint `/api/ai/generate-answer`
- **Answer Storage**: AI answers stored with `isAIAnswer: true` flag

### Frontend Components
- **AIAnswer Component** (`components/AIAnswer.jsx`): Displays AI-generated answers
- **Integration**: Added to DoubtDetail page above mentor answers
- **Styling**: Custom CSS for AI answer appearance

### API Endpoint
```
POST /api/ai/generate-answer
{
  "title": "Question title",
  "description": "Question description", 
  "subject": "Subject name",
  "doubtId": "doubt_id"
}
```

## User Experience

### For Students
1. **Instant Help**: Get immediate AI assistance when viewing any doubt
2. **Educational Value**: Receive step-by-step explanations and examples
3. **Multiple Perspectives**: Compare AI answers with mentor/peer responses
4. **Clear Identification**: Easily distinguish AI from human answers

### For Mentors
1. **Unchanged Workflow**: Mentor answer system remains exactly the same
2. **Reference Point**: Can use AI answers as starting points for their responses
3. **Focus on Complex Issues**: AI handles basic questions, mentors focus on nuanced help

## Technical Details

### AI Answer Properties
```javascript
{
  id: "generated_id",
  content: "AI generated content",
  authorId: "ai-assistant",
  doubtId: "doubt_id",
  upvotes: [],
  downvotes: [],
  isAccepted: false,
  isMentorAnswer: false,
  isAIAnswer: true,  // New flag
  createdAt: "timestamp"
}
```

### Security & Limitations
- **Rate Limiting**: One AI answer per doubt (prevents spam)
- **No Voting**: AI answers cannot be upvoted/downvoted
- **Cannot be Accepted**: Only human answers can be marked as accepted
- **Disclaimer**: Clear warning that AI answers should be verified

## Customization Options

### Modify AI Prompt
Edit `backend/utils/aiAssistant.js` to customize how the AI responds:
```javascript
const prompt = `You are an AI tutor helping students...`;
```

### Change AI Model
Update the model in `aiAssistant.js`:
```javascript
model: "llama3-8b-8192", // or other Groq models
```

### Styling Customization
Modify AI answer appearance in `frontend/src/App.css`:
```css
.ai-answer-section { /* AI answer container */ }
.ai-answer-card { /* AI answer content */ }
```

## Troubleshooting

### Common Issues
1. **No AI Answer Appears**: Check Groq API key in `.env`
2. **API Errors**: Verify internet connection and API key validity
3. **Styling Issues**: Clear browser cache and restart frontend

### Error Messages
- "Failed to generate AI answer": API key or network issue
- "Cannot vote on AI answers": Expected behavior (feature, not bug)

## Future Enhancements
- Multiple AI model support
- AI answer quality ratings
- Subject-specific AI training
- AI answer caching for performance
- Multi-language AI support

The AI Assistant feature is now fully integrated and ready to enhance your learning platform!