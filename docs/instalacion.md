# Instalación y Puesta en Marcha

Esta guía te ayuda a levantar el proyecto "bienstar-total-public" en un entorno local Linux con shell `sh`.

## Requisitos
- Node.js 18+ y npm 9+ (recomendado)
- Git (opcional, para clonar)
- Acceso a internet para instalar dependencias
- (Opcional) Servicio de base de datos si vas a conectar a producción

Verifica versiones:
```
node -v
npm -v
```

## Clonar o descargar
- Clonar:
```
git clone https://github.com/Irvir/bienstar-total-public.git
cd bienstar-total-public
```
- O coloca el código en tu carpeta de trabajo y ubícate en la raíz del proyecto.

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

# Ejecutar servidor backend simple (si aplica)
node server.js
```
En desarrollo, usualmente el frontend corre en `http://localhost:5173`.

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

## Solución de problemas
- Puerto en uso: cambia `PORT` y `API_PORT`.
- Fallo al instalar: borra `node_modules/` y `package-lock.json` y reintenta `npm install`.
- CORS/credenciales: revisa `src/utils/authFetch.js` y `server/middleware/auth.js`.

## Despliegue (resumen)
- Construye el frontend:
```
npm run build
```
- Sirve `dist/` en tu hosting.
- Levanta el backend (`server.js` o tu propio servidor Express) con las variables de entorno necesarias.
- Configura HTTPS y variables secretas en el entorno de producción.
