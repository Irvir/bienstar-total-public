
## reCAPTCHA — uso en el flujo de registro

Este proyecto usa (opcionalmente) reCAPTCHA para mitigar registros automatizados. La verificación se realiza en el servidor contra la API de Google. A continuación se explica el flujo, cómo integrarlo desde el frontend, y el comportamiento del servidor cuando está deshabilitado (entorno de desarrollo).

- Requisitos en servidor
	- Variable de entorno: `RECAPTCHA_SECRET` (clave secreta de Google). Si no está definida, el servidor omite la verificación (útil en desarrollo). Revisar `server.js` para la lógica detallada.
	- Endpoint que lo consume: `POST /registrar` espera opcionalmente `recaptchaToken` en el body.

- Flujo en frontend (ejemplo con reCAPTCHA v3)
	1. Cargar la librería de Google en el HTML: `<script src="https://www.google.com/recaptcha/api.js?render=SITE_KEY"></script>`
	2. Antes de enviar el formulario de registro, solicitar el token:
		 - grecaptcha.ready(() => grecaptcha.execute('SITE_KEY', { action: 'register' }).then(token => { /* enviar token en body como recaptchaToken */ }))
	3. Incluir `recaptchaToken` en el body JSON enviado a `/registrar`.

- Ejemplo de body (registro):

	{
		"nombre": "Pepito",
		"email": "pepito@example.com",
		"password": "Secreto123",
		"altura": 175,
		"peso": 75,
		"edad": 30,
		"nivelActividad": "media",
		"sexo": "masculino",
		"recaptchaToken": "<TOKEN_GENERADO_POR_CLIENTE>"
	}

- Qué hace el servidor
	- Si `RECAPTCHA_SECRET` está configurado, el servidor envía una petición POST a `https://www.google.com/recaptcha/api/siteverify` con body `secret=<RECAPTCHA_SECRET>&response=<recaptchaToken>`.
	- Valida `success` y (si usa v3) el `score`/`action` según criterios que quieras (por ejemplo `score >= 0.5` y `action === 'register'`). Si la verificación falla, responde 400 con un mensaje de captcha inválido.
	- Si `RECAPTCHA_SECRET` no está definido, el servidor omite la verificación (se advierte mediante un log), y permite el registro (esto facilita pruebas locales).

- Recomendaciones
	- En producción siempre configurar `RECAPTCHA_SECRET` y ajustar el umbral de `score` (v3) según la tolerancia a falsos positivos/negativos.
	- Registrar telemetría (fallos de captcha) para detectar ataques automatizados.
	- Para entornos con alta seguridad, además de reCAPTCHA, aplicar límites por IP y verificación de correo (enviar email de activación).

- Ejemplo de verificación (pseudocódigo servidor)

	const r = await fetch('https://www.google.com/recaptcha/api/siteverify', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: `secret=${encodeURIComponent(process.env.RECAPTCHA_SECRET)}&response=${encodeURIComponent(recaptchaToken)}`
	});
	const rr = await r.json();
	if (!rr.success) return res.status(400).json({ message: 'Captcha inválido', details: rr });

---

