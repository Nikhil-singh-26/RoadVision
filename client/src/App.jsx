import { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MapPage from './pages/MapPage';
import HomePage from './pages/HomePage';
import WelcomePage from './pages/WelcomePage';
import ReportPage from './pages/ReportPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const { t } = useLanguage();
  
  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#f8faff]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#1a237e] border-t-transparent mb-4"></div>
        <p className="text-sm font-black text-[#1a237e] tracking-widest uppercase italic">{t('common.loading')}...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

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

        <Route 
          path="/report" 
          element={
            <ProtectedRoute>
              <Layout>
                <ReportPage />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/analytics" 
          element={
            <ProtectedRoute>
              <Layout>
                <AnalyticsPage />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <Layout>
                <SettingsPage />
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
    <LanguageProvider>
      <AuthProvider>
        <AppRoots />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
