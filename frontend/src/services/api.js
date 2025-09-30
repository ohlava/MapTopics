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
  },

  /**
   * POST an Excalidraw scene (full export or elements array) and get back a summary
   * @param {object|Array} payload
   * @returns {Promise<{elementsCount:number,nodes:number,edges:number,metadataKeys:string[]}>}
   */
  async postExcalidrawParse(payload) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/excalidraw/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new ApiError(`HTTP error! status: ${response.status}`, response.status);
      }
      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to parse scene.', 0);
    }
  },

  /**
   * POST an Excalidraw scene and get back the reconstructed scene for lossless check
   * @param {object|Array} payload
   * @returns {Promise<object|Array>}
   */
  async postExcalidrawEcho(payload) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/excalidraw/echo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new ApiError(`HTTP error! status: ${response.status}`, response.status);
      }
      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to echo scene.', 0);
    }
  }
};

export default apiService;
