import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('MindMap Error Boundary caught an error:', error, errorInfo);
    
    // Check if this is the collaborators.forEach Safari issue
    if (error.message && error.message.includes('collaborators.forEach')) {
      console.warn('⚠️ Safari compatibility issue with Excalidraw collaborators detected');
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-content">
            <h2>Something went wrong with the Mind Map</h2>
            <p>Please try refreshing the page or go back to the feed.</p>
            <button 
              onClick={() => this.setState({ hasError: false })}
              className="retry-button"
            >
              Try Again
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="home-button"
            >
              Go Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
