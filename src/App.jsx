import { useState, useEffect } from 'react';
import MobileLayout from './layouts/MobileLayout';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import MatchDiscoveryPage from './pages/match/MatchDiscoveryPage';
import FoundationDashboardPage from './pages/match/FoundationDashboardPage';
import ReportEmergencyPage from './pages/rescue/ReportEmergencyPage';
import RescuerDashboardPage from './pages/rescue/RescuerDashboardPage';

function App() {
  const [currentTab, setCurrentTab] = useState('match');
  const [userRole, setUserRole] = useState('standard');

  useEffect(() => {
    const fetchInitialUserRole = async () => {
      try {
        const response = await fetch('http://localhost:8000/users/profile/user_tester_2026');
        if (response.ok) {
          const data = await response.json();
          setUserRole(data.role);
        }
      } catch (error) {
        console.error(error);
      }
    };

    const handleRoleCustomEvent = (event) => {
      setUserRole(event.detail);
    };

    fetchInitialUserRole();
    window.addEventListener('user-role-changed', handleRoleCustomEvent);

    return () => {
      window.removeEventListener('user-role-changed', handleRoleCustomEvent);
    };
  }, []);

  const resolveMatchTabContent = () => {
    if (userRole === 'foundation') {
      return <FoundationDashboardPage />;
    }
    return <MatchDiscoveryPage />;
  };

  const resolveRescueTabContent = () => {
    if (userRole === 'rescuer') {
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
        return <ProfilePage />;
      default:
        return null;
    }
  };

  return (
    <MobileLayout activeTab={currentTab} onTabChange={setCurrentTab}>
      {renderContent()}
    </MobileLayout>
  );
}

export default App;