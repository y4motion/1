const API_URL = process.env.REACT_APP_BACKEND_URL || '';

class APIService {
  constructor() {
    this.baseURL = API_URL;
    this.cache = new Map();
    this.cacheTimeout = 60000; // 1 minute
  }

  /**
   * Generic fetch with error handling
   */
  async fetch(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Fetch with cache
   */
  async fetchCached(endpoint, options = {}) {
    const cacheKey = `${endpoint}${JSON.stringify(options)}`;
    
    // Check cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return { success: true, data: cached.data };
      }
    }

    // Fetch fresh data
    const result = await this.fetch(endpoint, options);
    
    if (result.success) {
      this.cache.set(cacheKey, {
        data: result.data,
        timestamp: Date.now()
      });
    }

    return result;
  }

  /**
   * Live Activity Feed
   */
  async getLiveActivity(limit = 50) {
    return this.fetch(`/api/activity/live?limit=${limit}`);
  }

  /**
   * Trending Products
   */
  async getTrending(limit = 12) {
    return this.fetchCached(`/api/homepage/trending-searches?limit=${limit}`);
  }

  /**
   * Popular Products
   */
  async getPopular(period = 'month', limit = 5) {
    return this.fetchCached(`/api/analytics/popular?period=${period}&limit=${limit}`);
  }

  /**
   * Hot Deals
   */
  async getDeals(limit = 3) {
    return this.fetch(`/api/products/deals?active=true&limit=${limit}`);
  }

  /**
   * Latest Articles
   */
  async getLatestArticles(limit = 3) {
    return this.fetchCached(`/api/articles/latest?limit=${limit}`);
  }

  /**
   * Testimonials
   */
  async getTestimonials(limit = 10) {
    return this.fetchCached(`/api/testimonials/recent?limit=${limit}`);
  }

  /**
   * Featured Categories
   */
  async getFeaturedCategories() {
    return this.fetchCached('/api/categories/featured');
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    console.log('API cache cleared');
  }
}

export default new APIService();
