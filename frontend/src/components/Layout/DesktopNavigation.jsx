import { Search, Settings, Home, Map } from 'lucide-react';
import './DesktopNavigation.css';

const DesktopNavigation = ({ onSearch, activeTab, onTabChange }) => {
  return (
    <nav className="desktop-nav">
      <div className="desktop-nav-container">
        {/* Logo */}
        <div className="nav-logo">
          <h2>MapTopics</h2>
        </div>

        {/* Navigation Tabs */}
        <div className="nav-tabs">
          <button 
            className={`nav-tab ${activeTab === 'feed' ? 'active' : ''}`}
            onClick={() => onTabChange('feed')}
          >
            <Home size={20} />
            <span>Feed</span>
          </button>
          <button 
            className={`nav-tab ${activeTab === 'mindmap' ? 'active' : ''}`}
            onClick={() => onTabChange('mindmap')}
          >
            <Map size={20} />
            <span>Mind Map</span>
          </button>
        </div>

        {/* Search Bar - Always visible on desktop */}
        <div className="nav-search">
          <div className="search-container">
            <Search size={20} className="search-icon" />
            <input
              id="desktop-search-input"
              name="desktopSearch"
              type="text"
              placeholder="Explore any topic..."
              className="search-input"
              onChange={(e) => onSearch?.(e.target.value)}
              onFocus={() => onTabChange('search')}
              autoComplete="off"
            />
          </div>
        </div>

        {/* Settings */}
        <div className="nav-settings">
          <button 
            className={`settings-button ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => onTabChange('settings')}
          >
            <Settings size={24} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default DesktopNavigation;
