import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import MobileLayout from './layouts/MobileLayout';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import PrivacySettingsPage from './pages/PrivacySettingsPage';
import MatchDiscoveryPage from './pages/match/MatchDiscoveryPage';
import FoundationDashboardPage from './pages/match/FoundationDashboardPage';
import ReportEmergencyPage from './pages/rescue/ReportEmergencyPage';
import RescuerDashboardPage from './pages/rescue/RescuerDashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { isAuthenticated, loading, user } = useAuth();
  const [currentTab, setCurrentTab] = useState('match');
  const [authView, setAuthView] = useState('login');

  useEffect(() => {
    if (isAuthenticated) {
      setAuthView('login');
      setCurrentTab('home');
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 gap-2">
        <Loader2 size={32} className="text-teal-500 animate-spin" />
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Iniciando Entorno...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (authView === 'register') {
      return <RegisterPage onNavigateToLogin={() => setAuthView('login')} />;
    }
    return <LoginPage onNavigateToRegister={() => setAuthView('register')} />;
  }

  const resolveMatchTabContent = () => {
    if (user?.role === 'foundation') {
      return <FoundationDashboardPage />;
    }
    return <MatchDiscoveryPage />;
  };

  const resolveRescueTabContent = () => {
    if (user?.role === 'rescuer') {
      return <RescuerDashboardPage />;
    }
    return <ReportEmergencyPage />;
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'home':
        return <HomePage />;
      case 'match':
        return resolveMatchTabContent();
      case 'rescue':
        return resolveRescueTabContent();
      case 'profile':
        return <ProfilePage onNavigateToPrivacy={() => setCurrentTab('privacy_settings')} />;
      case 'privacy_settings':
        return <PrivacySettingsPage onBack={() => setCurrentTab('profile')} />;
      default:
        return null;
    }
  };

  return (
    <MobileLayout activeTab={currentTab === 'privacy_settings' ? 'profile' : currentTab} onTabChange={setCurrentTab}>
      {renderContent()}
    </MobileLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;