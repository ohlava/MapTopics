import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Maximize2, Map, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import './ExploreCard.css';

const ExploreCard = ({ topic, description, sources, isLastCard = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTextTruncated, setIsTextTruncated] = useState(false);

  // Check if text is truncated
  useEffect(() => {
    // Simple check - if description is longer than ~300 characters, it's likely truncated
    setIsTextTruncated(description.length > 300);
  }, [description]);

  // Handle escape key to close expanded view
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isExpanded]);

  const handleCardClick = () => {
    setIsExpanded(true);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsExpanded(false);
    }
  };

  const handleCreateMindMap = (e) => {
    e.stopPropagation();
    // TODO: Navigate to mind map creation
    console.log('Create mind map for:', topic);
  };

  return (
    <>
      {/* Regular Card */}
      <motion.div
        className={`explore-card ${isLastCard ? 'last-card' : ''}`}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        whileInView={{ opacity: 1 }}
        viewport={{ amount: 0.3 }}
        onClick={handleCardClick}
        whileHover={{ scale: 1.02 }}
        style={{ cursor: 'pointer' }}
      >
        <div className="card-content">
          {/* Topic Header */}
          <div className="card-header">
            <h3 className="card-title">{topic}</h3>
            <button className="expand-button" onClick={(e) => e.stopPropagation()}>
              <Maximize2 size={16} />
            </button>
          </div>

          {/* Description */}
          <div className="card-body">
            <p className="card-description truncated">
              {description}
              {isTextTruncated && <span className="read-more-indicator">...</span>}
            </p>
          </div>

          {/* Actions */}
          <div className="card-actions">
            <button 
              className="mind-map-button"
              onClick={handleCreateMindMap}
              title="Create Mind Map"
            >
              <Map size={16} />
              <span>Mind Map</span>
            </button>
          </div>

          {/* Sources */}
          <div className="card-footer">
            <div className="sources-container">
              {sources?.map((source, index) => (
                <a
                  key={`source-${source.url}-${source.title}-${index}`}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="source-link"
                  title={source.title}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="source-icon">
                    {source.favicon ? (
                      <img src={source.favicon} alt="" />
                    ) : (
                      <ExternalLink size={16} />
                    )}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="fullscreen-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleBackdropClick}
          >
            <motion.div
              className="fullscreen-card"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3, type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button 
                className="close-button"
                onClick={() => setIsExpanded(false)}
              >
                <X size={24} />
              </button>

              <div className="fullscreen-content">
                {/* Topic Header */}
                <div className="fullscreen-header">
                  <h2 className="fullscreen-title">{topic}</h2>
                </div>

                {/* Full Description */}
                <div className="fullscreen-body">
                  <p className="fullscreen-description">{description}</p>
                </div>

                {/* Actions */}
                <div className="fullscreen-actions">
                  <button 
                    className="mind-map-button-large"
                    onClick={handleCreateMindMap}
                  >
                    <Map size={20} />
                    <span>Create Mind Map</span>
                  </button>
                </div>

                {/* Sources */}
                <div className="fullscreen-footer">
                  <h4>Sources:</h4>
                  <div className="fullscreen-sources">
                    {sources?.map((source, index) => (
                      <a
                        key={`fullscreen-source-${source.url}-${source.title}-${index}`}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="fullscreen-source-link"
                      >
                        <div className="source-icon">
                          {source.favicon ? (
                            <img src={source.favicon} alt="" />
                          ) : (
                            <ExternalLink size={16} />
                          )}
                        </div>
                        <span>{source.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ExploreCard;
