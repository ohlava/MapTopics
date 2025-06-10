import { useState, useEffect } from 'react';
import MobileNavigation from './components/Layout/MobileNavigation';
import DesktopNavigation from './components/Layout/DesktopNavigation';
import ExploreFeed from './components/Feed/ExploreFeed';
import SearchView from './components/Search/SearchView';
import SettingsView from './components/Settings/SettingsView';
import './App.css';

const App = () => {
  const [activeTab, setActiveTab] = useState('feed');
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size for responsive layout
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleSearch = (query) => {
    console.log('Search query:', query);
    // TODO: Implement search functionality
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'feed':
        return <ExploreFeed />;
      case 'search':
        return <SearchView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <ExploreFeed />;
    }
  };

  return (
    <div className="app">
      {/* Navigation */}
      {isMobile ? (
        <MobileNavigation 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
      ) : (
        <DesktopNavigation 
          onSearch={handleSearch} 
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      )}

      {/* Main Content */}
      <main className={`main-content ${isMobile ? 'mobile' : 'desktop'}`}>
        {renderContent()}
      </main>
    </div>
  );
};

export default App
