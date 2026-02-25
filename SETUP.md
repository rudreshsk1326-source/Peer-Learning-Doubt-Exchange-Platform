# Setup Guide - Peer Learning Doubt Exchange Platform

## Prerequisites Installation

### 1. Install Node.js
- Download from https://nodejs.org/
- Choose LTS version (v18 or higher recommended)
- Verify installation: `node --version` and `npm --version`

### 2. Install MongoDB
Choose one option:

#### Option A: Local MongoDB
- Download from https://www.mongodb.com/try/download/community
- Install and start MongoDB service
- Default connection: `mongodb://localhost:27017`

#### Option B: MongoDB Atlas (Cloud)
- Create account at https://www.mongodb.com/atlas
- Create a free cluster
- Get connection string
- Update `.env` file with your connection string

## Project Setup

### 1. Clone and Install
```bash
# Clone the repository
git clone <your-repo-url>
cd Peer-Learning-Doubt-Exchange-Platform

# Install root dependencies
npm install

# Install all dependencies (frontend + backend)
npm run install-all
```

### 2. Environment Configuration
Create `.env` file in the `backend` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/peer-learning-platform
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-please
```

**Important**: Change the JWT_SECRET to a secure random string in production!

### 3. Start the Application
```bash
# Start both frontend and backend
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend development server on http://localhost:5173

### 4. Verify Setup
1. Open http://localhost:5173 in your browser
2. You should see the home page
3. Try creating an account and logging in
4. Test posting a question and answering it

## Troubleshooting

### Common Issues

#### 1. MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Make sure MongoDB is running
- Windows: Start MongoDB service
- macOS: `brew services start mongodb-community`
- Linux: `sudo systemctl start mongod`

#### 2. Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution**: 
- Kill the process using the port: `npx kill-port 5000`
- Or change the PORT in `.env` file

#### 3. JWT Secret Error
```
Error: secretOrPrivateKey has a value of "undefined"
```
**Solution**: Make sure JWT_SECRET is set in your `.env` file

#### 4. CORS Errors
**Solution**: The project is already configured with CORS. If you still get errors:
- Check if backend is running on port 5000
- Verify proxy configuration in `vite.config.js`

#### 5. Module Not Found Errors
**Solution**: 
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json
rm -rf backend/node_modules backend/package-lock.json
npm run install-all
```

### Development Tips

#### 1. Hot Reload
- Frontend: Automatically reloads on file changes
- Backend: Uses nodemon for automatic restart

#### 2. Database Inspection
- Use MongoDB Compass for GUI: https://www.mongodb.com/products/compass
- Or use command line: `mongo` (for local MongoDB)

#### 3. API Testing
- Use Postman or Thunder Client
- Test endpoints at http://localhost:5000/api/
- Example: GET http://localhost:5000/api/test

#### 4. Debugging
- Backend logs appear in terminal
- Frontend errors in browser console
- Use React Developer Tools extension

## Production Deployment

### Backend (Heroku Example)
```bash
# In backend directory
heroku create your-app-name
heroku config:set MONGODB_URI=your-mongodb-atlas-uri
heroku config:set JWT_SECRET=your-production-jwt-secret
git push heroku main
```

### Frontend (Vercel Example)
```bash
# In frontend directory
npm run build
vercel --prod
```

Update the API base URL in `frontend/src/main.jsx` for production.

## Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)

## Need Help?

1. Check the main README.md for feature documentation
2. Look at the code comments for implementation details
3. Create an issue if you find bugs
4. Refer to the API documentation in README.md

Happy coding! 🚀