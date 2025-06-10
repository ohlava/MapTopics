import { useState, useEffect, useRef, useCallback } from 'react';
import ExploreCard from './ExploreCard';
import { apiService } from '../../services/api';
import './ExploreFeed.css';

// Configuration for scrollback buffer
const CARDS_PER_LOAD = 5;
const MAX_CARDS_IN_MEMORY = 20; // Keep only last 20 cards in memory
const SCROLLBACK_BUFFER = 10; // Remove cards when we exceed this + MAX_CARDS_IN_MEMORY

const ExploreFeed = ({ onDebugInfoChange }) => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const observerRef = useRef();

  // Update debug info in parent component
  useEffect(() => {
    if (onDebugInfoChange) {
      onDebugInfoChange({
        cardsInMemory: cards.length,
        offset,
        hasMore,
        totalCount,
        loading
      });
    }
  }, [cards.length, offset, hasMore, totalCount, loading, onDebugInfoChange]);

  // Load initial cards
  useEffect(() => {
    loadMoreCards();
  }, []);

  const loadMoreCards = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getExploreCards(CARDS_PER_LOAD, offset);
      
      setCards(prev => {
        const newCards = [...prev, ...response.cards];
        
        // Implement scrollback buffer - remove old cards if we have too many
        if (newCards.length > MAX_CARDS_IN_MEMORY + SCROLLBACK_BUFFER) {
          const cardsToKeep = newCards.slice(-MAX_CARDS_IN_MEMORY);
          return cardsToKeep;
        }
        
        return newCards;
      });
      
      setOffset(prev => prev + CARDS_PER_LOAD);
      setHasMore(response.has_more);
      setTotalCount(response.total_count);
      
    } catch (err) {
      console.error('Failed to load cards:', err);
      setError(err.message || 'Failed to load cards. Please try again.');
      // Don't stop infinite scroll on network errors - allow retry
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, offset]);

  // Intersection Observer for infinite scroll
  const lastCardRef = useCallback((node) => {
    if (loading) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !error) {
        loadMoreCards();
      }
    }, { threshold: 0.1 });
    
    if (node) observerRef.current.observe(node);
  }, [loading, hasMore, loadMoreCards, error]);

  // Retry function for error recovery
  const retryLoad = () => {
    setError(null);
    loadMoreCards();
  };

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
        
        {error && (
          <div className="error-card">
            <div className="error-content">
              <h3>Unable to load more cards</h3>
              <p>{error}</p>
              <button onClick={retryLoad} className="retry-button">
                Try Again
              </button>
            </div>
          </div>
        )}
        
        {!hasMore && !error && cards.length > 0 && (
          <div className="end-message">
            <p>You've explored {totalCount} topics! 🎉</p>
            <p>Check back later for more content.</p>
          </div>
        )}
        
        {!loading && !error && cards.length === 0 && (
          <div className="empty-state">
            <h3>No topics available</h3>
            <p>Please try again later.</p>
            <button onClick={retryLoad} className="retry-button">
              Refresh
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExploreFeed;
