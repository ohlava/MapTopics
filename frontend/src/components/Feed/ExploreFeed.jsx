import { useState, useEffect, useRef, useCallback } from 'react';
import ExploreCard from './ExploreCard';

// Mock data for development - replace with API calls later
const generateMockCard = (id) => ({
  id,
  topic: `Topic ${id}`,
  description: `This is a fascinating exploration of Topic ${id}. It covers various aspects and provides insights into the fundamental concepts that make this subject interesting. The topic delves into practical applications and theoretical frameworks that help us understand the broader implications of this field of study.`,
  sources: [
    { 
      title: 'Wikipedia', 
      url: 'https://wikipedia.org',
      favicon: 'https://wikipedia.org/static/favicon/wikipedia.ico'
    },
    { 
      title: 'Scientific Journal', 
      url: 'https://example.com',
      favicon: null
    },
    { 
      title: 'Research Paper', 
      url: 'https://example.com',
      favicon: null
    }
  ]
});

const ExploreFeed = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef();

  // Load initial cards
  useEffect(() => {
    loadMoreCards();
  }, []);

  const loadMoreCards = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newCards = Array.from({ length: 5 }, (_, index) => 
      generateMockCard(cards.length + index + 1)
    );
    
    setCards(prev => [...prev, ...newCards]);
    setLoading(false);
    
    // Stop loading after 20 cards for demo
    if (cards.length >= 15) {
      setHasMore(false);
    }
  }, [cards.length, loading, hasMore]);

  // Intersection Observer for infinite scroll
  const lastCardRef = useCallback((node) => {
    if (loading) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreCards();
      }
    }, { threshold: 0.1 });
    
    if (node) observerRef.current.observe(node);
  }, [loading, hasMore, loadMoreCards]);

  return (
    <div className="explore-feed">
      <div className="feed-container">
        {cards.map((card, index) => (
          <div
            key={card.id}
            ref={index === cards.length - 1 ? lastCardRef : null}
          >
            <ExploreCard
              topic={card.topic}
              description={card.description}
              sources={card.sources}
              isLastCard={index === cards.length - 1}
            />
          </div>
        ))}
        
        {loading && (
          <div className="loading-card">
            <div className="loading-skeleton">
              {/* Card header skeleton */}
              <div className="skeleton-title"></div>
              
              {/* Card body skeleton - multiple text lines to simulate description */}
              <div className="skeleton-body">
                <div className="skeleton-text-line"></div>
                <div className="skeleton-text-line"></div>
                <div className="skeleton-text-line"></div>
                <div className="skeleton-text-line"></div>
                <div className="skeleton-text-line"></div>
                <div className="skeleton-text-line"></div>
              </div>
              
              {/* Card footer skeleton - circles for source links */}
              <div className="skeleton-sources-container">
                <div className="skeleton-source-circle"></div>
                <div className="skeleton-source-circle"></div>
                <div className="skeleton-source-circle"></div>
              </div>
            </div>
          </div>
        )}
        
        {!hasMore && (
          <div className="end-message">
            <p>You've reached the end! 🎉</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExploreFeed;
