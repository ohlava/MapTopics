import { LayoutGroup, motion as Motion } from 'framer-motion';
import { Search, Settings, BookOpen, Map } from 'lucide-react';
import './MobileNavigation.css';

const MobileNavigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'feed', label: 'Feed', icon: BookOpen },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'mindmap', label: 'Mind Map', icon: Map },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="mobile-nav">
      <LayoutGroup>
      <div className="mobile-nav-container">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              className={`nav-tab ${isActive ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              {isActive && (
                <Motion.div
                  className="nav-tab-background"
                  layoutId="activeTab"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <div className="nav-tab-content">
                <IconComponent size={24} />
                <span className="nav-tab-label">{tab.label}</span>
              </div>
            </button>
          );
        })}
      </div>
      </LayoutGroup>
    </div>
  );
};

export default MobileNavigation;
