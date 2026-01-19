// Utility to get API URL with proper protocol
// Uses relative URLs for same-origin requests to avoid mixed content issues
export const getApiUrl = () => {
  // In production/preview, use relative URLs (empty string)
  // This ensures requests use the same protocol as the page
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    return '';
  }
  // In development or when explicitly needed, use the env variable
  return process.env.REACT_APP_BACKEND_URL || '';
};

export const API_URL = getApiUrl();
