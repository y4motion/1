// Utility to get API URL with proper protocol
// Uses relative URLs for same-origin requests to avoid mixed content issues

// For browser environment, always use relative URLs to avoid mixed content
// This is computed at module load time, so we check window availability
const isBrowser = typeof window !== 'undefined';
const isHttps = isBrowser && window.location.protocol === 'https:';

// Always use empty string (relative URL) in HTTPS to avoid mixed content
export const API_URL = isHttps ? '' : (process.env.REACT_APP_BACKEND_URL || '');

// Function version for dynamic calls if needed
export const getApiUrl = () => {
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    return '';
  }
  return process.env.REACT_APP_BACKEND_URL || '';
};
