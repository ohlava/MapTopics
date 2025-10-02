// API service for backend communication

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export const apiService = {
  /**
   * Fetch explore cards with pagination
   * @param {number} limit - Number of cards to fetch (1-20)
   * @param {number} offset - Number of cards to skip
   * @returns {Promise<{cards: Array, has_more: boolean, total_count: number}>}
   */
  async getExploreCards(limit = 8, offset = 0) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/explore?limit=${limit}&offset=${offset}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new ApiError(
          `HTTP error! status: ${response.status}`, 
          response.status
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Network or other errors
      throw new ApiError(
        'Failed to fetch explore cards. Please check your connection.',
        0
      );
    }
  },

  /**
   * Fetch initial Excalidraw data for a given mind map topic
   * @param {string} topic
   * @returns {Promise<{topic: string, elements: Array, appState: Object}>}
   */
  async getMindMapInitialData(topic) {
    if (!topic) throw new ApiError('Topic is required', 400);
    try {
      const response = await fetch(`${API_BASE_URL}/api/mindmap/${encodeURIComponent(topic)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new ApiError(
          `HTTP error! status: ${response.status}`,
          response.status
        );
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to fetch mind map data from server.', 0);
    }
  },

  /**
   * Get the total count of available cards
   * @returns {Promise<{total_count: number}>}
   */
  async getExploreCount() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/explore/count`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new ApiError(
          `HTTP error! status: ${response.status}`,
          response.status
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        'Failed to fetch card count. Please check your connection.',
        0
      );
    }
  },

  /**
   * Health check endpoint
   * @returns {Promise<{status: string, message: string}>}
   */
  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new ApiError(
          `HTTP error! status: ${response.status}`,
          response.status
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError('Backend is not available.', 0);
    }
  }
};

export default apiService;
