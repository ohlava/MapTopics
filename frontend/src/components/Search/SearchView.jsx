import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import './SearchView.css';
import { mindmapLibrary } from '../../services/mindmapLibrary';

const SearchView = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const myMaps = useMemo(() => mindmapLibrary.list(), []);
  const recent = useMemo(() => mindmapLibrary.listRecent(), []);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSearch = (query) => {
    console.log('Searching for:', query);
    // TODO: Implement search functionality
  };

  const handleSuggestionClick = (topic) => {
    setSearchQuery(topic);
    handleSearch(topic);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      handleSearch(searchQuery.trim());
    }
  };

  return (
    <div className="search-view">
      <div className="search-container">
        {/* Explore Topics Header - Top */}
        <div className="search-header">
          <h2>Explore Topics</h2>
          <p>Search for any topic to generate an interactive mind map</p>
        </div>
        
        {/* Search Field - Only show on mobile, desktop uses navbar search */}
        {isMobile && (
          <div className="search-input-container">
            <Search size={20} className="search-icon" />
            <input
              id="mobile-search-input"
              name="mobileSearch"
              type="text"
              placeholder="Enter a topic to explore..."
              className="search-input-large"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
          </div>
        )}
        
        {/* Popular Topics - Bottom */}
        <div className="search-suggestions">
          <h3>Popular Topics</h3>
          <div className="suggestion-grid">
            {['Quantum Physics', 'Machine Learning', 'Climate Change', 'Blockchain', 'Psychology', 'Philosophy'].map(topic => (
              <button 
                key={topic} 
                className="suggestion-chip"
                onClick={() => handleSuggestionClick(topic)}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* Library Section */}
        <div className="library-section">
          <h3>Library</h3>
          <div className="library-columns">
            {/* My Maps */}
            <div className="library-card my-maps">
              <h4>My Maps</h4>
              {myMaps.length === 0 && (
                <div className="library-muted">No custom maps yet.</div>
              )}
              <ul className="library-list">
                {myMaps.slice(0, 10).map((m) => (
                  <li key={m.id}>
                    <a className="library-link" href="#" onClick={(e) => { e.preventDefault(); navigate(`/m/${m.id}/${m.slug || ''}`); }}>
                      {m.title || 'Untitled'}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Last Visited */}
            <div className="library-card recent-maps">
              <h4>Last Visited</h4>
              {recent.length === 0 && (
                <div className="library-muted">No recent maps.</div>
              )}
              <ul className="library-list">
                {recent.slice(0, 10).map((r) => (
                  <li key={r.key}>
                    <a className="library-link" href="#" onClick={(e) => { e.preventDefault();
                      if (r.kind === 'custom') navigate(`/m/${r.id}/${r.slug || ''}`);
                      else navigate(`/mindmap/${encodeURIComponent(r.topic)}`);
                    }}>
                      {r.title || r.topic}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchView;
