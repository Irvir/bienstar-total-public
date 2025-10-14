// Centralizado la URL base de la API para el código React/Vite
// Prioridad: VITE_API_BASE (env) -> window.API_BASE (desde public/config.js) -> localhost:3001
export const API_BASE = (
  (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_API_BASE) ||
  (typeof window !== 'undefined' && window.API_BASE) ||
  'http://localhost:3001'
);

export default API_BASE;
