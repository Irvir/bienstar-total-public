# Documentación de la API de reCAPTCHA v3

## Descripción General
reCAPTCHA v3 es una solución de Google que ayuda a proteger sitios web contra el tráfico malicioso sin interrumpir la experiencia del usuario. A diferencia de versiones anteriores, reCAPTCHA v3 no requiere interacción visible del usuario, ya que opera de manera invisible en segundo plano y asigna un puntaje basado en la probabilidad de que el tráfico sea humano.

## Flujo de Trabajo
1. **Generación del Token en el Cliente:**
   - Antes de enviar un formulario, el cliente solicita un token a través de la función `executeRecaptcha(action)`.
   - Este token se genera en función de una acción específica definida por el desarrollador (por ejemplo, `crear_cuenta`).

2. **Envío del Token al Servidor:**
   - El cliente envía el token generado junto con los datos del formulario al servidor.

3. **Validación del Token en el Servidor:**
   - El servidor envía el token a la API de verificación de Google (`https://www.google.com/recaptcha/api/siteverify`) junto con la clave secreta (`RECAPTCHA_SECRET`).
   - Google responde con un objeto JSON que incluye información como el éxito de la verificación, el puntaje asignado, la acción asociada, y más.

4. **Decisión Basada en la Verificación:**
   - El servidor evalúa la respuesta de Google y decide si permite o rechaza la solicitud en función de criterios como el puntaje mínimo aceptable y la coincidencia de la acción.

## Variables de Entorno
- **VITE_RECAPTCHA_SITE_KEY:** Clave pública utilizada en el cliente para generar tokens.
- **RECAPTCHA_SECRET:** Clave secreta utilizada en el servidor para validar tokens con Google.

## Recomendaciones de Implementación
- **Validación Adicional:**
  - Verifica que la acción en la respuesta de Google coincida con la acción esperada.
  - Define un umbral de puntaje (por ejemplo, >= 0.5) para aceptar solicitudes.
- **Seguridad:**
  - Nunca incluyas claves secretas en el código fuente. Configúralas como variables de entorno.
  - Registra eventos con puntajes bajos para monitorear posibles actividades sospechosas.
- **Entornos de Desarrollo:**
  - Utiliza claves de prueba proporcionadas por Google para evitar problemas durante el desarrollo.

## Respuesta de la API de Verificación
La API de Google devuelve un objeto JSON con los siguientes campos principales:
- **success:** Indica si la verificación fue exitosa.
- **score:** Puntaje asignado (0.0 a 1.0) que representa la probabilidad de que el tráfico sea humano.
- **action:** Acción asociada al token.
- **challenge_ts:** Marca de tiempo de la solicitud.
- **hostname:** Dominio donde se generó el token.

## Implementación en el Proyecto

En el proyecto **Bienstar Total**, reCAPTCHA v3 se implementa tanto en el cliente como en el servidor. A continuación, se describen los archivos y componentes clave donde se utiliza:

### En el Cliente
- **Archivo:** `src/components/CrearCuenta.jsx`
  - Se utiliza el proveedor `GoogleReCaptchaProvider` para envolver el formulario de creación de cuenta.
  - Antes de enviar el formulario, se llama a `executeRecaptcha('crear_cuenta')` para generar un token asociado a la acción `crear_cuenta`.

### En el Servidor
- **Archivo:** `server.js`
  - Ruta `POST /registrar`: Verifica el token enviado desde el cliente utilizando la API de Google.
  - Ruta `POST /verify-captcha`: Permite depurar y verificar manualmente tokens enviados al servidor.

### Código de Implementación

#### En el Cliente
**Archivo:** `src/components/CrearCuenta.jsx`
```jsx
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from "react-google-recaptcha-v3";

function CrearCuentaInner() {
  const { executeRecaptcha } = useGoogleReCaptcha(); 
  // Hook para ejecutar reCAPTCHA

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    // Evitar el comportamiento por defecto del formulario

    if (!executeRecaptcha) {
      console.error("reCAPTCHA no cargó correctamente"); 
      // Validar que reCAPTCHA esté disponible
      return;
    }

    try {
      // Ejecutar reCAPTCHA con la acción "crear_cuenta" y obtener el token
      const recaptchaToken = await executeRecaptcha("crear_cuenta");

      // Enviar el token y los datos del formulario al servidor
      const response = await fetch("/registrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recaptchaToken, ...formData }),
      });

      const data = await response.json(); 
      // Procesar la respuesta del servidor
      console.log("Registro exitoso", data);
    } catch (error) {
      console.error("Error al registrar", error); 
      // Manejar errores en la solicitud
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Formulario de creación de cuenta */}
    </form>
  );
}

function CrearCuenta() {
  return (
    // Proveedor de reCAPTCHA con la clave pública configurada en las variables de entorno
    <GoogleReCaptchaProvider reCaptchaKey={process.env.VITE_RECAPTCHA_SITE_KEY}>
      <CrearCuentaInner />
    </GoogleReCaptchaProvider>
  );
}
```

#### En el Servidor
**Archivo:** `server.js`
```javascript
app.post("/registrar", async (req, res) => {
  const { recaptchaToken } = req.body;
   // Obtener el token enviado desde el cliente

  try {
    const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET;
     // Clave secreta configurada en el servidor

    // Verificar el token con la API de Google
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${RECAPTCHA_SECRET}&response=${recaptchaToken}`,
    });

    const data = await response.json(); 
    // Procesar la respuesta de Google

    if (!data.success) {
      // Si la verificación falla, devolver un error al cliente
      return res.status(400).json({ message: "Fallo en la verificación de reCAPTCHA" });
    }

    // Continuar con el registro del usuario si la verificación es exitosa
    res.status(200).json({ message: "Usuario registrado exitosamente" });
  } catch (error) {
    console.error("Error al verificar reCAPTCHA", error);
     // Manejar errores en la verificación
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

app.post("/verify-captcha", async (req, res) => {
  const { token } = req.body; 
  // Obtener el token enviado desde el cliente

  try {
    const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET;
     // Clave secreta configurada en el servidor

    // Verificar el token con la API de Google
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${RECAPTCHA_SECRET}&response=${token}`,
    });

    const data = await response.json();
     // Procesar la respuesta de Google
    res.json(data);
     // Devolver la respuesta al cliente para depuración
  } catch (error) {
    console.error("Error al verificar token de reCAPTCHA", error); 
    // Manejar errores en la verificación
    res.status(500).json({ message: "Error interno del servidor" });
  }
});
```
### Archivos Relacionados
- **Variables de Entorno:**
  - `VITE_RECAPTCHA_SITE_KEY`: Configurada en el cliente para generar tokens.
  - `RECAPTCHA_SECRET`: Configurada en el servidor para validar tokens.
- **Colección Postman:**
  - `postman/bienstar-recaptcha.postman_collection.json`: Incluye ejemplos para probar las rutas relacionadas con reCAPTCHA.

---
