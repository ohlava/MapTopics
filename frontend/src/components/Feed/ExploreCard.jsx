import { motion as Motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Maximize2, Map, X } from 'lucide-react';
import { useState, useEffect, useRef, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import './ExploreCard.css';

const ExploreCard = ({ topic, description, sources, isLastCard = false }) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTextTruncated, setIsTextTruncated] = useState(false);
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);
  const previouslyFocusedRef = useRef(null);
  const titleId = useId();

  // Check if text is truncated
  useEffect(() => {
    // Simple check - if description is longer than ~300 characters, it's likely truncated
    setIsTextTruncated(description.length > 300);
  }, [description]);

  // Helper to get focusable elements inside the modal (excluding sentinels)
  const getFocusableElements = () => {
    if (!modalRef.current) return [];
    const selectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');
    return Array.from(modalRef.current.querySelectorAll(selectors)).filter(
      (el) => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden') && !el.dataset?.focusSentinel
    );
  };

  // Manage keyboard interactions, focus trap, and scroll locking when modal is open
  useEffect(() => {
    if (!isExpanded) return;

    // Save the element that had focus before opening
    previouslyFocusedRef.current = document.activeElement;

    // Focus the close button (or first focusable element) once the modal is mounted
    const focusTimer = setTimeout(() => {
      const firstFocusable = closeButtonRef.current || modalRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    }, 0);

    const handleKeyDown = (e) => {
      if (!isExpanded) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsExpanded(false);
        return;
      }
      if (e.key === 'Tab') {
        const focusables = getFocusableElements();
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const isShift = e.shiftKey;
        const current = document.activeElement;

        // If focus is outside modal, bring it back to first
        if (!modalRef.current.contains(current)) {
          e.preventDefault();
          first.focus();
          return;
        }

        if (!isShift && current === last) {
          e.preventDefault();
          first.focus();
        } else if (isShift && current === first) {
          e.preventDefault();
          last.focus();
        }
      }
    };

    // Ensure focus cannot escape on mouse click or programmatic focus
    const handleFocusIn = (e) => {
      if (!modalRef.current) return;
      if (!modalRef.current.contains(e.target)) {
        const focusables = getFocusableElements();
        const first = focusables[0];
        setTimeout(() => first?.focus(), 0);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focusin', handleFocusIn);
    document.body.style.overflow = 'hidden'; // Prevent background scroll

    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focusin', handleFocusIn);
      document.body.style.overflow = 'unset';
      // Restore focus to the previously focused element
      previouslyFocusedRef.current && previouslyFocusedRef.current.focus?.();
    };
  }, [isExpanded]);

  const handleCardClick = () => {
    setIsExpanded(true);
  };

  const openModal = (e) => {
    // Stop the click from bubbling to the card, then open the modal explicitly
    e?.stopPropagation?.();
    setIsExpanded(true);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsExpanded(false);
    }
  };

  const handleCreateMindMap = (e) => {
    e.stopPropagation();
    // Navigate to mind map creation with the topic
    navigate(`/mindmap/${encodeURIComponent(topic)}`);
  };

  return (
    <>
      {/* Regular Card */}
      <Motion.div
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
            <button
              className="expand-button"
              onClick={openModal}
              aria-label={`Expand details for ${topic}`}
            >
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
  </Motion.div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isExpanded && (
          <Motion.div
            className="fullscreen-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleBackdropClick}
          >
            <Motion.div
              className="fullscreen-card"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3, type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              ref={modalRef}
            >
              {/* Focus trap sentinel - loops focus to the end when shift-tabbing before first */}
              <span
                data-focus-sentinel
                tabIndex={0}
                onFocus={() => {
                  const focusables = getFocusableElements();
                  const last = focusables[focusables.length - 1];
                  last?.focus();
                }}
                style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}
              />
              {/* Close Button */}
              <button 
                className="close-button"
                onClick={() => setIsExpanded(false)}
                aria-label="Close dialog"
                ref={closeButtonRef}
              >
                <X size={24} />
              </button>

              <div className="fullscreen-content">
                {/* Topic Header */}
                <div className="fullscreen-header">
                  <h2 className="fullscreen-title" id={titleId}>{topic}</h2>
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
              {/* Focus trap sentinel - loops focus to the start when tabbing after last */}
              <span
                data-focus-sentinel
                tabIndex={0}
                onFocus={() => {
                  const focusables = getFocusableElements();
                  const first = focusables[0];
                  first?.focus();
                }}
                style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}
              />
              </div>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ExploreCard;
