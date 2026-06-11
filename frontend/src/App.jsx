import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DoubtsPage from './pages/DoubtsPage';
import AskDoubt from './pages/AskDoubt';
import DoubtDetail from './pages/DoubtDetail';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import AdminInsights from './pages/AdminInsights';
import AIAssistant from './pages/AIAssistant';
import Notifications from './pages/Notifications';
import FloatingAI from './components/FloatingAI';
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/doubts" element={<DoubtsPage />} />
              <Route path="/ask" element={<AskDoubt />} />
              <Route path="/ai-assistant" element={<AIAssistant />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/doubts/:id" element={<DoubtDetail />} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/admin/insights" element={<AdminInsights />} />
            </Routes>
          </main>
          <FloatingAI />
          <Footer />
        </div>
      </Router>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;