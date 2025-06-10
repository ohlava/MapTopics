import { Search } from 'lucide-react';

const SearchView = () => {
  return (
    <div className="search-view">
      <div className="search-container">
        <div className="search-header">
          <h2>Explore Topics</h2>
          <p>Search for any topic to generate an interactive mind map</p>
        </div>
        
        <div className="search-input-container">
          <Search size={24} className="search-icon" />
          <input
            type="text"
            placeholder="Enter a topic to explore..."
            className="search-input-large"
          />
        </div>
        
        <div className="search-suggestions">
          <h3>Popular Topics</h3>
          <div className="suggestion-grid">
            {['Quantum Physics', 'Machine Learning', 'Climate Change', 'Blockchain', 'Psychology', 'Philosophy'].map(topic => (
              <button key={topic} className="suggestion-chip">
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
