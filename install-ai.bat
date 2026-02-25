@echo off
echo Installing AI Assistant dependencies...
cd backend
npm install groq-sdk
echo.
echo AI Assistant feature has been added successfully!
echo.
echo To use the AI Assistant:
echo 1. Get your Groq API key from https://console.groq.com/
echo 2. Add it to backend/.env as GROQ_API_KEY=your_key_here
echo 3. Start the backend server: npm run dev
echo 4. Start the frontend server: npm run dev
echo.
echo The AI Assistant will now appear on doubt detail pages!
pause