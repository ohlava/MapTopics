import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Virtuoso } from 'react-virtuoso';
import ExploreCard from './ExploreCard';
import { apiService } from '../../services/api';
import './ExploreFeed.css';

// Configuration
const CARDS_PER_LOAD = 8;
const MAX_CARDS_IN_MEMORY = 100;

const ExploreFeed = ({ onDebugInfoChange }) => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [firstItemIndex, setFirstItemIndex] = useState(0); // for Virtuoso trimming
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

        let combined = [...prev, ...newUniqueCards];

        // Trim older items to keep memory bounded
        const overflow = Math.max(0, combined.length - MAX_CARDS_IN_MEMORY);
        if (overflow > 0) {
          setFirstItemIndex(idx => idx + overflow);
          combined = combined.slice(overflow);
        }

        return combined;
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
  }, [offset, hasMore, loading]);

  // Virtuoso will handle infinite scroll via endReached - no observer needed

  // Retry function for error recovery
  const retryLoad = () => {
    setError(null);
    loadingRef.current = false; // Reset loading ref
    loadMoreCards();
  };

  return (
    <div className="explore-feed">
      <div className="feed-container">
        <Virtuoso
          style={{ width: '100%' }}
          className="virtuoso-root"
          useWindowScroll
          data={cards}
          firstItemIndex={firstItemIndex}
          endReached={() => {
            if (hasMore && !error) {
              loadMoreCards();
            }
          }}
          increaseViewportBy={{ top: 800, bottom: 1200 }}
          overscan={400}
          computeItemKey={(index, card) => `card-${card.id}`}
          itemContent={(index, card) => (
            <ExploreCard
              topic={card.topic}
              description={card.description}
              sources={card.sources}
              isLastCard={index === cards.length - 1}
            />
          )}
          components={{
            Footer: () => (
              <>
                {loading && (
                  <div className="loading-card">
                    <div className="loading-skeleton">
                      <div className="skeleton-title"></div>
                      <div className="skeleton-body">
                        <div className="skeleton-text-line"></div>
                        <div className="skeleton-text-line"></div>
                        <div className="skeleton-text-line"></div>
                        <div className="skeleton-text-line"></div>
                        <div className="skeleton-text-line"></div>
                        <div className="skeleton-text-line"></div>
                      </div>
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
              </>
            ),
            EmptyPlaceholder: () => (
              <>
                {!loading && !error && (
                  <div className="empty-state">
                    <h3>No topics available</h3>
                    <p>Please try again later.</p>
                    <button onClick={retryLoad} className="retry-button">
                      Refresh
                    </button>
                  </div>
                )}
              </>
            ),
          }}
        />
      </div>
    </div>
  );
};

export default ExploreFeed;
