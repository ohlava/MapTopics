import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import MobileNavigation from './components/Layout/MobileNavigation';
import DesktopNavigation from './components/Layout/DesktopNavigation';
import ExploreFeed from './components/Feed/ExploreFeed';
import HealthCheck from './components/Debug/HealthCheck';
import NotFound from './components/NotFound';
import './App.css';

// Lazy load heavier routes to improve initial load
const SearchView = lazy(() => import('./components/Search/SearchView'));
const SettingsView = lazy(() => import('./components/Settings/SettingsView'));
const MindMapView = lazy(() => import('./components/MindMap/MindMapView'));
const ExcalidrawDebug = lazy(() => import('./components/Debug/ExcalidrawDebug'));

// useMediaQuery hook using matchMedia for responsive handling without resize math
const useMediaQuery = (query) => {
  const mql = useMemo(() => (typeof window !== 'undefined' ? window.matchMedia(query) : null), [query]);
  const [matches, setMatches] = useState(() => mql ? mql.matches : false);

  useEffect(() => {
    if (!mql) return;
    const handler = (e) => setMatches(e.matches);
    // Older Safari uses addListener/removeListener
    if (mql.addEventListener) {
      mql.addEventListener('change', handler);
    } else {
      mql.addListener(handler);
    }
    setMatches(mql.matches);
    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener('change', handler);
      } else {
        mql.removeListener(handler);
      }
    };
  }, [mql]);

  return matches;
};

const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width: 768px)');
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

  // Screen size is now handled by useMediaQuery

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
      {import.meta && import.meta.env && import.meta.env.DEV && (
        <HealthCheck 
          cardsInMemory={debugInfo.cardsInMemory}
          offset={debugInfo.offset}
          hasMore={debugInfo.hasMore}
          totalCount={debugInfo.totalCount}
          loading={debugInfo.loading}
        />
      )}
      
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
      <main className={`main-content ${isMobile ? 'mobile' : 'desktop'} ${activeTab.includes('mindmap') ? 'fullscreen' : ''} ${activeTab === 'feed' ? 'feed' : ''}`}>
        <Suspense fallback={<div style={{ padding: 16 }}>Loading…</div>}>
          <Routes>
            <Route path="/" element={<ExploreFeed onDebugInfoChange={handleDebugInfoChange} />} />
            <Route path="/search" element={<SearchView />} />
            <Route path="/settings" element={<SettingsView />} />
            <Route path="/mindmap/:topic?" element={<MindMapView />} />
            {import.meta.env.DEV && (
              <Route path="/debug/excalidraw" element={<ExcalidrawDebug />} />
            )}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
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
