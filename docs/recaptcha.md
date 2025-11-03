# reCAPTCHA v3 — Integración en Bienstar

Este documento explica cómo está integrado reCAPTCHA v3 en el proyecto (cliente + servidor), qué variables de entorno usar, cómo probarlo y ejemplos de verificación.

Resumen rápido
- Cliente: usa `react-google-recaptcha-v3`. El componente `CrearCuenta` envuelve el formulario con `GoogleReCaptchaProvider` y llama a `executeRecaptcha(action)` para obtener un token invisible (v3).
- Servidor: valida el token enviándolo a `https://www.google.com/recaptcha/api/siteverify` utilizando la `RECAPTCHA_SECRET` (variable de entorno). Si no hay `RECAPTCHA_SECRET` configurado, la verificación se omite (modo dev) y se registra una advertencia.

Archivos relevantes
- `src/components/CrearCuenta.jsx` — uso del provider y `executeRecaptcha` antes de enviar `/registrar`.
- `server.js` — en la ruta `POST /registrar` se verifica `recaptchaToken` (si `RECAPTCHA_SECRET` está configurada). También existe `POST /verify-captcha` para depuración.
- `.env` / `.env.VITE_RECAPTCHA_SITEKEY` — ejemplo de `VITE_RECAPTCHA_SITE_KEY` de prueba.
- `postman/bienstar-recaptcha.postman_collection.json` — colección Postman con ejemplos para probar `/registrar` y `/verify-captcha`.

Variables de entorno
- VITE_RECAPTCHA_SITE_KEY — clave pública (site key) para el cliente (se inyecta en el bundle mediante Vite). 
- RECAPTCHA_SECRET — clave secreta (secret key) usada por el servidor para verificar tokens contra Google. 

Flujo (resumen)
1. En el cliente, justo antes de enviar el formulario de registro, se llama a `executeRecaptcha('crear_cuenta')` y se obtiene `recaptchaToken`.
2. El cliente envía `recaptchaToken` junto con el cuerpo del formulario a `POST /registrar`.
3. En el servidor, si `RECAPTCHA_SECRET` está configurado, se hace una petición POST a `https://www.google.com/recaptcha/api/siteverify` con `secret` y `response` (el token). El servidor valida `success` (y opcionalmente `score`, `action`, `hostname`).
4. Si la verificación falla, el servidor responde con error y no crea la cuenta.

Ejemplo (cliente — patrón usado en el repo)

```jsx
// Dentro de CrearCuenta.jsx
const { executeRecaptcha } = useGoogleReCaptcha();

// antes de enviar
const recaptchaToken = await executeRecaptcha('crear_cuenta');
fetch(`${API_BASE}/registrar`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ...formData, recaptchaToken })
});
```

Ejemplo (servidor — verificación, patrón usado en `server.js`)

```js
// server.js: verificar en /registrar
const r = await fetch('https://www.google.com/recaptcha/api/siteverify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: `secret=${encodeURIComponent(RECAPTCHA_SECRET)}&response=${encodeURIComponent(recaptchaToken)}`
});
const rr = await r.json();
if (!rr.success) {
  // rechazar el request
}
// Opcional: comprobar rr.score (v3) y rr.action
```

Notas importantes sobre reCAPTCHA v3
- reCAPTCHA v3 devuelve un `score` (0.0 a 1.0) que indica probabilidad de tráfico humano. No hay interacción visible para el usuario.
- Es buena práctica comprobar además `rr.action` (asegurar que coincida con la acción enviada, p.ej. `crear_cuenta`) y usar un umbral de score (p.ej. >= 0.5) para decidir si aceptar o rechazar.
- Los tokens caducan rápidamente; consúmelos inmediatamente en el servidor.

Testing / depuración

- Claves de prueba (desarrollo): el repo incluye `VITE_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI` en `.env` de ejemplo. Para la verificación en el servidor, `server.js` usa por defecto la clave de prueba `6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe` cuando `RECAPTCHA_SECRET` no está configurada (esto queda en modo depuración).
- Hay una ruta de ayuda `POST /verify-captcha` que acepta `{ token }` y devuelve la respuesta completa de Google (útil para ver `score`, `action`, `hostname`).
- Postman: usa la colección `postman/bienstar-recaptcha.postman_collection.json`. Para probar `/registrar` desde Postman necesitas un token real (obtenido desde el frontend) o puedes usar `/verify-captcha` con un token de prueba si usas las claves de prueba.

Buenas prácticas y recomendaciones
- Configura `RECAPTCHA_SECRET` en tu entorno de producción (never commit secrets). En Render/Heroku/Netlify/Vercel ponla en env vars del servicio.
- En el servidor: además de comprobar `success`, valida `action` y revisa `score`. Decide un umbral por riesgo (por ejemplo 0.5) y registrar los eventos con score bajo para monitoreo.
- Evita omitir la verificación en producción. En el repo se permite omitirla cuando no hay `RECAPTCHA_SECRET` (útil para desarrollo local) — asegúrate de configurar la variable en staging/production.

Ejemplo de respuesta de Google (parcial)

```json
{
  "success": true,
  "score": 0.9,
  "action": "crear_cuenta",
  "challenge_ts": "2025-11-01T12:34:56Z",
  "hostname": "tu-dominio.com"
}
```

Dónde cambiar la clave del cliente
- Edita `.env` o `.env.VITE_RECAPTCHA_SITEKEY` (ejemplo en repo). Luego rebuild/deploy: `VITE_RECAPTCHA_SITE_KEY=tu_site_key`

¿Quieres que añada un archivo README corto en `docs/` con ejemplos listos para pegar en Postman (variables de entorno y paso a paso)? Puedo crear la colección o actualizar la existente con notas si lo deseas.

***
Documentado por el equipo de desarrollo del proyecto — si necesitas, lo adapto para incluir ejemplos concretos de score-threshold y logs.
