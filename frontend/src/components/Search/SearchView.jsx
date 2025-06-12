import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import './SearchView.css';

const SearchView = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  
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
      </div>
    </div>
  );
};

export default SearchView;
