import { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MapPage from './pages/MapPage';
import HomePage from './pages/HomePage';
import WelcomePage from './pages/WelcomePage';

const ProtectedRoute = ({ children }) => {
  const context = useContext(AuthContext);
  const user = context?.user;
  const loading = context?.loading;

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#f8faff]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#1a237e] border-t-transparent"></div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

const AppRoots = () => {
  return (
    <Router>
      <Routes>
        {/* Public Welcome Portal */}
        <Route path="/" element={<WelcomePage />} />
        
        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Officer Dashboard Areas */}
        <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <Layout>
                <HomePage />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/map" 
          element={
            <ProtectedRoute>
              <Layout>
                <MapPage />
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppRoots />
    </AuthProvider>
  );
}

export default App;
