import { Search, Settings, Home } from 'lucide-react';

const DesktopNavigation = ({ onSearch, activeTab, onTabChange }) => {
  return (
    <nav className="desktop-nav">
      <div className="desktop-nav-container">
        {/* Logo */}
        <div className="nav-logo">
          <h2>MapTopics</h2>
        </div>

        {/* Feed Navigation */}
        <div className="nav-feed">
          <button 
            className={`feed-button ${activeTab === 'feed' ? 'active' : ''}`}
            onClick={() => onTabChange('feed')}
          >
            <Home size={20} />
            <span>Feed</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="nav-search">
          <div className="search-container">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Explore any topic..."
              className="search-input"
              onChange={(e) => onSearch?.(e.target.value)}
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
