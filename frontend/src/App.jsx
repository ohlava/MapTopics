import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import MobileNavigation from './components/Layout/MobileNavigation';
import DesktopNavigation from './components/Layout/DesktopNavigation';
import ExploreFeed from './components/Feed/ExploreFeed';
import SearchView from './components/Search/SearchView';
import SettingsView from './components/Settings/SettingsView';
import MindMapView from './components/MindMap/MindMapView';
import HealthCheck from './components/Debug/HealthCheck';
import './App.css';

const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const [debugInfo, setDebugInfo] = useState({});

  // Determine active tab based on current route
  const getActiveTabFromPath = (pathname) => {
    if (pathname === '/') return 'feed';
    if (pathname === '/search') return 'search'; 
    if (pathname === '/settings') return 'settings';
    if (pathname.startsWith('/mindmap')) return 'mindmap';
    return 'feed';
  };

  const activeTab = getActiveTabFromPath(location.pathname);

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

  const handleTabChange = (tab) => {
    switch(tab) {
      case 'feed':
        navigate('/');
        break;
      case 'search':
        navigate('/search');
        break;
      case 'settings':
        navigate('/settings');
        break;
      case 'mindmap':
        // Navigate to mindmap with default canvas if no specific topic
        navigate('/mindmap/default-canvas');
        break;
      default:
        navigate('/');
    }
  };

  const handleDebugInfoChange = useCallback((info) => {
    setDebugInfo(info);
  }, []);

  // Clear debug info when switching away from feed tab
  useEffect(() => {
    if (activeTab !== 'feed') {
      setDebugInfo({});
    }
  }, [activeTab]);

  return (
    <div className="app">
      <HealthCheck 
        cardsInMemory={debugInfo.cardsInMemory}
        offset={debugInfo.offset}
        hasMore={debugInfo.hasMore}
        totalCount={debugInfo.totalCount}
        loading={debugInfo.loading}
      />
      
      {/* Navigation - Hide on mindmap view */}
      {!activeTab.includes('mindmap') && (
        <>
          {isMobile ? (
            <MobileNavigation 
              activeTab={activeTab} 
              onTabChange={handleTabChange} 
            />
          ) : (
            <DesktopNavigation 
              onSearch={handleSearch} 
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          )}
        </>
      )}

      {/* Main Content */}
      <main className={`main-content ${isMobile ? 'mobile' : 'desktop'} ${activeTab.includes('mindmap') ? 'fullscreen' : ''}`}>
        <Routes>
          <Route path="/" element={<ExploreFeed onDebugInfoChange={handleDebugInfoChange} />} />
          <Route path="/search" element={<SearchView />} />
          <Route path="/settings" element={<SettingsView />} />
          <Route path="/mindmap/:topic?" element={<MindMapView />} />
        </Routes>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App
