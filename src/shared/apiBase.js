// Centralized API base URL for React/Vite code
// Priority: VITE_API_BASE (env) -> window.API_BASE (from public/config.js) -> localhost:3001
export const API_BASE = (
  (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_API_BASE) ||
  (typeof window !== 'undefined' && window.API_BASE) ||
  'http://localhost:3001'
);

export default API_BASE;
