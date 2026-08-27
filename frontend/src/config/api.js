// Centralized API Base URL helper
// In Vercel production, API requests go to relative '/api'
// In local development, fallback to 'http://localhost:5001/api' or custom VITE_API_URL

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return 'https://backend-rjzc.onrender.com/api';
};

export const API_BASE_URL = getApiBaseUrl();
export default API_BASE_URL;
