# BienStar Total — Guía de instalación y ejecución

Este repositorio contiene la aplicación BienStar Total (front-end con Vite + React y un backend Express que usa MySQL). Este README explica cómo preparar el entorno en tu máquina, dependencias, ejecución en desarrollo y recomendaciones para producción.

---

## Requisitos mínimos

- Node.js (recomendado): 18.x LTS o superior
- npm (incluido con Node) o yarn
- Visual Studio Code (opcional pero recomendado)
- MySQL (opcional si quieres ejecutar la base de datos localmente). El proyecto actualmente usa una base remota por defecto en `server.js`.

Extensiones de VS Code recomendadas

- ESLint
- Prettier — Code formatter
- EditorConfig for VS Code

---

## Dependencias principales

Estas son las dependencias usadas por el proyecto (ya aparecen en `package.json`):

- runtime (backend): express, mysql2, cors, bcrypt
- front-end: react, react-dom, react-router-dom, vite
- dev: vite, @vitejs/plugin-react, eslint, gh-pages (opcional)
Nuevas dependencias añadidas en esta rama / cambios recientes:

- dotenv — para cargar variables de entorno en el servidor (backend)
- firebase — utilidades de Firebase (autenticación con Google vía popup)
- react-google-recaptcha-v3 — reCAPTCHA v3 client-side (token invisible)
- multer — subida de archivos en backend (imagenes)

Dependencias principales (resumen):

- Backend: express, mysql2, cors, bcrypt, multer, dotenv, cookie
- Frontend: react, react-dom, react-router-dom, firebase, react-google-recaptcha-v3
- Dev: vite, @vitejs/plugin-react, eslint, gh-pages (opcional)

Instalación rápida (desde la raíz del repo)

Ejecuta este comando en una terminal (cmd.exe o PowerShell) para instalar las dependencias necesarias de una sola vez:

```powershell
npm install express mysql2 cors bcrypt multer dotenv react react-dom react-router-dom firebase react-google-recaptcha-v3 && npm install --save-dev vite @vitejs/plugin-react @eslint/js eslint eslint-plugin-react-hooks eslint-plugin-react-refresh gh-pages globals cookie
```

Si prefieres usar `npm install` simple (ya lee `package.json`) también funciona, pero el comando anterior garantiza que tengas todas las dependencias nuevas listadas aquí instaladas inmediatamente.

---

## Configuración recomendada (entorno local)

1. Clona el repositorio y sitúate en la carpeta del proyecto:

```powershell
git clone https://github.com/Irvir/bienstar-total-public.git
cd bienstar-total-public
npm install
```



2. Ejecutar backend localmente

```powershell
# en una terminal
node server.js
```

El servidor por defecto escucha en el puerto `3001` (o el que definas en `PORT`).

3. Ejecutar frontend (desarrollo)

```powershell
# en otra terminal
npm run dev
```

Vite levantará un servidor de desarrollo (normalmente en `http://localhost:5173`). Abre esa URL en tu navegador.

---

## Comandos útiles

- `npm run dev` — levanta el front-end (Vite)
- `node server.js` — ejecuta el backend Express
- `npm run build` — compila el front para producción (genera `dist`)
- `npm run preview` — preview local del build (Vite preview)

Si prefieres una sola terminal puedes usar `concurrently` para lanzar front y back al mismo tiempo. Dime si quieres que lo añada.

---





