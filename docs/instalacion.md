# Instalación y Puesta en Marcha

## Requisitos
- Node.js 18+ y npm 9+
- Git (opcional, para clonar)

## Clonar o descargar
- Clonar:
```
git clone https://github.com/Irvir/bienstar-total-public.git
cd bienstar-total-public
```
## Instalación de dependencias
Desde la raíz del proyecto:
```
npm install
```
Esto instala dependencias del cliente (Vite/React) y del servidor (`server.js`).

## Variables de entorno
- Frontend: usa `public/config.js` para ciertas configuraciones públicas.
- Backend: si necesitas claves/URLs privadas, define variables de entorno antes de ejecutar:
```
# Ejemplos (ajusta según tu entorno)
export PORT=5173
export API_PORT=3000
export NODE_ENV=development
# reCAPTCHA u otros servicios si aplica
export RECAPTCHA_SITE_KEY="..."
export RECAPTCHA_SECRET_KEY="..."
```
Consulta `docs/recaptcha.md` y `docs/endpoints.md` para detalles.

## Scripts principales
Revisa `package.json` y utiliza:
```
# Levantar frontend (Vite)
npm run dev

# Ejecutar servidor backend 
node server.js
```

## Base de datos (pruebas)
El repo incluye scripts para preparar una BD de pruebas:
- `scripts/setup-test-db.js`: inicializa base de datos de test.
- `scripts/test-db-connection.js`: verifica conexión.

Ejecuta:
```
node scripts/setup-test-db.js
node scripts/test-db-connection.js
```
Las migraciones SQL disponibles están en `db/migrations/` (por ejemplo `004_create_sesiones_table.sql`, `005_create_registro_peso_table.sql`). Aplícalas según tu motor de BD.

## Pruebas
Hay tests en `test/` (Vitest):
```
npm test
# o
npx vitest
```

## Estructura clave
- `src/`: código del frontend (React, rutas, controladores del cliente).
- `server/`: controladores/middleware/rutas del API backend.
- `docs/`: documentación funcional y técnica.
- `db/`: esquema y migraciones.
