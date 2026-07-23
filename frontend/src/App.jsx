import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import LoginRegister from './pages/LoginRegister';
import UserDashboard from './pages/UserDashboard';
import Profile from './pages/Profile';
import Recommendations from './pages/Recommendations';
import SearchSchemes from './pages/SearchSchemes';
import Feedback from './pages/Feedback';
import AdminDashboard from './pages/AdminDashboard';
import Analytics from './pages/Analytics';
import ApplicationTracker from './pages/ApplicationTracker';
import DocumentVault from './pages/DocumentVault';
import Layout from './components/Layout';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) return <Navigate to="/login" replace />;
    return children;
};

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Router>
          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<LoginRegister />} />
              
              {/* Protected User Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
              <Route path="/search" element={<ProtectedRoute><SearchSchemes /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/recommendations" element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />
              <Route path="/applications" element={<ProtectedRoute><ApplicationTracker /></ProtectedRoute>} />
              <Route path="/documents" element={<ProtectedRoute><DocumentVault /></ProtectedRoute>} />
              <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            </Routes>
          </Layout>
        </Router>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
