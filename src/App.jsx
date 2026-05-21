import { useState } from 'react';
import MobileLayout from './layouts/MobileLayout';
import HomePage from './pages/HomePage';
import MatchPage from './pages/MatchPage';
import RescuePage from './pages/RescuePage';
import ProfilePage from './pages/ProfilePage';

function App() {
  const [currentTab, setCurrentTab] = useState('match');

  const renderContent = () => {
    switch (currentTab) {
      case 'home':
        return <HomePage />;
      case 'match':
        return <MatchPage />;
      case 'rescue':
        return <RescuePage />;
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