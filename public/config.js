// config.js
// Runtime-configurable API base for vanilla JS controllers
// Update this if your backend base URL changes (e.g., reverse proxy or production URL)
// If an env (build-time) or runtime embed sets window.API_BASE, keep it.
// Otherwise, when deployed on a host (like Vercel) default to the current origin
// (so API calls will target the same domain). During local development we keep
// the common backend fallback at http://localhost:3001.
// Allow build-time override via VITE_API_BASE injected at build time (optional)
if (!window.API_BASE) {
	try {
		const origin = window.location && window.location.origin;

		// Preferred: when deploying frontend and backend together (same origin), use origin.
		// During local development (origin contains 'localhost' or '127.0.0.1'), default to the local backend.
		const isLocal = origin && (/localhost|127\.0\.0\.1/).test(origin);

		// Known production host for this project on Vercel
		const VERCEL_HOST = 'https://bienstar-total-public.vercel.app';

		if (isLocal) {
			window.API_BASE = 'http://localhost:3001';
		} else if (origin === VERCEL_HOST || (origin && origin.includes('vercel.app'))) {
			// If running on Vercel (or similar), assume backend is same origin unless overridden
			// BUT: if the build embedded a localhost API_BASE (dev build), override it at runtime
			// to point to the deployed backend (Render) to avoid needing an immediate rebuild.
			const RENDER_BACKEND = 'https://bienstar-total-public-1-i05q.onrender.com';
			if (window.API_BASE && (window.API_BASE.includes('localhost') || window.API_BASE.includes('127.0.0.1'))) {
				window.API_BASE = RENDER_BACKEND;
			} else {
				window.API_BASE = origin;
			}
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