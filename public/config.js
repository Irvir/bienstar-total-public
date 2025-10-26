// config.js
// API base configurable en tiempo de ejecución para controladores JS "vanilla"
// Actualiza esto si cambia la URL base de tu backend (por ejemplo, proxy inverso o URL de producción)
// Si existe una variable en runtime (window.API_BASE), se mantiene.
// De lo contrario, cuando se despliega en un host (como Vercel), se usa por defecto el origen actual
// (para que las llamadas API apunten al mismo dominio). Durante el desarrollo local
// se mantiene un backend local por defecto en http://localhost:3001.
// También se permite sobreescribir en tiempo de build mediante VITE_API_BASE (opcional).

if (!window.API_BASE) {
	try {
		const origin = window.location && window.location.origin;

		// Preferido: si frontend y backend se despliegan juntos (mismo origen), usar origin.
		// Durante el desarrollo local (origin contiene 'localhost' o '127.0.0.1'), usar backend local.
		const isLocal = origin && (/localhost|127\.0\.0\.1/).test(origin);

		// Host conocido de producción en Vercel para este proyecto
		const VERCEL_HOST = 'https://bienstar-total-public.vercel.app';

		if (isLocal) {
			window.API_BASE = 'http://localhost:3001';
		} else if (origin === VERCEL_HOST || (origin && origin.includes('vercel.app'))) {
			// Si se está ejecutando en Vercel (o similar), asumir que el backend está en el mismo origen
			window.API_BASE = origin;
		} else {
			// Caso genérico: usar origin si está disponible, sino fallback a localhost (seguro)
			window.API_BASE = origin || 'http://localhost:3001';
		}
	} catch (e) {
		window.API_BASE = 'http://localhost:3001';
	}
}

// ASSET_BASE: se usa para páginas que no están empaquetadas (non-bundled) para calcular rutas relativas de assets.
// En la mayoría de los casos, Vite ya genera assets con rutas relativas cuando base='./'.
if (!window.ASSET_BASE) {
	try {
		const origin = window.location && window.location.origin;
		window.ASSET_BASE = origin || '/';
	} catch (e) {
		window.ASSET_BASE = '/';
	}
}

