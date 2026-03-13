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
        
        {/* Public Dashboard Areas */}
        <Route 
          path="/home" 
          element={
            <Layout>
              <HomePage />
            </Layout>
          } 
        />
        
        <Route 
          path="/dashboard" 
          element={
            <Layout>
              <Dashboard />
            </Layout>
          } 
        />
        
        <Route 
          path="/map" 
          element={
            <Layout>
              <MapPage />
            </Layout>
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
