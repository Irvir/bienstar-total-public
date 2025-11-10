
export const API_BASE = (() => {
  // Priority: VITE env -> window.API_BASE (public/config.js) -> window.location.origin (if not localhost) -> localhost:3001
  if (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_API_BASE) return import.meta.env.VITE_API_BASE;
  if (typeof window !== 'undefined' && window.API_BASE) return window.API_BASE;
  if (typeof window !== 'undefined' && window.location && window.location.origin && !window.location.origin.includes('localhost')) return window.location.origin;
  return 'http://localhost:3001';
})();
