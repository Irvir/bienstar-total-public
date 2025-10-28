// API_BASE
// Centralized API base URL for React/Vite code
// Priority: VITE_API_BASE (build-time env) -> window.API_BASE (runtime from public/config.js) -> window.location.origin (prod) -> localhost:3001 (dev fallback)
//
// Deployment notes:
// - For Vercel/static hosting, set VITE_API_BASE at build time if your API is hosted separately.
//   Example: VITE_API_BASE=https://api.example.com npm run build
// - If frontend and backend are served from the same origin (recommended), leave VITE_API_BASE unset
//   and public/config.js will default window.API_BASE to the current origin in production.
export const API_BASE = (() => {
    // Priority: VITE env -> window.API_BASE (public/config.js) -> window.location.origin (if not localhost) -> localhost:3001
    if (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_API_BASE) return import.meta.env.VITE_API_BASE;
    if (typeof window !== 'undefined' && window.API_BASE) return window.API_BASE;
    if (typeof window !== 'undefined' && window.location && window.location.origin && !window.location.origin.includes('localhost')) return window.location.origin;
    return 'https://bienstar-total-public-1-i05q.onrender.com';
})();
