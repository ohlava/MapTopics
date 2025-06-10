import { useState, useEffect } from 'react';
import { apiService } from '../../services/api';

const HealthCheck = ({ cardsInMemory, offset, hasMore, totalCount, loading }) => {
  const [status, setStatus] = useState('checking');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await apiService.healthCheck();
        setStatus('healthy');
        setMessage(response.message);
      } catch (error) {
        setStatus('error');
        setMessage(error.message);
      }
    };

    checkHealth();
  }, []);

  if (!import.meta.env.DEV) {
    return null; // Only show in development
  }

  return (
    <div className={`health-check health-check--${status}`}>
      <span className="health-indicator">●</span>
      <span className="health-message">
        Backend: {status === 'checking' ? 'Checking...' : message}
        {cardsInMemory !== undefined && (
          <> | Cards in memory: {cardsInMemory} | Offset: {offset} | Has more: {hasMore ? 'Yes' : 'No'} | Loading: {loading ? 'Yes' : 'No'}</>
        )}
      </span>
    </div>
  );
};

export default HealthCheck;
