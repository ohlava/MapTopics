import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  const loadingRef = useRef(false); // Prevent race conditions

  // Memoize debug info to prevent infinite loops
  const debugInfo = useMemo(() => ({
    cardsInMemory: cards.length,
    offset,
    hasMore,
    totalCount,
    loading
  }), [cards.length, offset, hasMore, totalCount, loading]);

  // Update debug info in parent component
  useEffect(() => {
    if (onDebugInfoChange) {
      onDebugInfoChange(debugInfo);
    }
  }, [debugInfo, onDebugInfoChange]);

  // Load initial cards
  useEffect(() => {
    loadMoreCards();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMoreCards = useCallback(async () => {
    if (loading || !hasMore || loadingRef.current) return;
    
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getExploreCards(CARDS_PER_LOAD, offset);
      
      setCards(prev => {
        // Check for duplicate IDs to prevent key conflicts
        const existingIds = new Set(prev.map(card => card.id));
        const newUniqueCards = response.cards.filter(card => !existingIds.has(card.id));
        
        const newCards = [...prev, ...newUniqueCards];
        
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
      loadingRef.current = false;
    }
  }, [offset]); // Only depend on offset

  // Intersection Observer for infinite scroll
  const lastCardRef = useCallback((node) => {
    if (loading || loadingRef.current) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !error && !loadingRef.current) {
        loadMoreCards();
      }
    }, { threshold: 0.1 });
    
    if (node) observerRef.current.observe(node);
  }, [hasMore, error, loadMoreCards]); // Remove loading from dependencies

  // Retry function for error recovery
  const retryLoad = () => {
    setError(null);
    loadingRef.current = false; // Reset loading ref
    loadMoreCards();
  };

  return (
    <div className="explore-feed">
      <div className="feed-container">
        {cards.map((card, index) => (
          <div
            key={`card-${card.id}-${card.topic.replace(/\s+/g, '-').toLowerCase()}`}
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
