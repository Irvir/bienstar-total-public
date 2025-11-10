
if (!window.API_BASE) {
  try {
    const origin = window.location && window.location.origin;

    const isLocal = origin && (/localhost|127\.0\.0\.1/).test(origin);
		
    const VERCEL_HOST = 'https://bienstar-total-public.vercel.app';

    if (isLocal) {
      window.API_BASE = 'http://localhost:3001';
    } else if (origin === VERCEL_HOST || (origin && origin.includes('vercel.app'))) {
      // If running on Vercel (or similar), assume backend is same origin unless overridden
      window.API_BASE = origin;
    } else {
      // Generic case: use origin if available, else fallback to localhost (safe)
      window.API_BASE = origin || 'http://localhost:3001';
    }
  } catch (e) {
    window.API_BASE = 'http://localhost:3001';
  }
}

// ASSET_BASE: used by any non-bundled pages to compute relative asset paths.
// For most cases Vite already outputs assets with relative paths when base='./'.
if (!window.ASSET_BASE) {
  try {
    const origin = window.location && window.location.origin;
    window.ASSET_BASE = origin || '/';
  } catch (e) {
    window.ASSET_BASE = '/';
  }
}

// Notes: You can override at runtime by setting window.API_BASE or window.ASSET_BASE
// before this file executes (e.g., in a server template or a wrapper script).