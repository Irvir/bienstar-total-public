/**
 * Login.js - Controlador de inicio de sesión
 * 
 * Maneja el proceso de autenticación de usuarios existentes
 */

/**
 * URL base del servidor backend
 * @constant {string}
 */
const API_URL = "http://localhost:3001";

/**
 * Duración de las notificaciones en milisegundos
 * @constant {number}
 */
const NOTIFICATION_DURATION = 4000;

/**
 * Retraso antes de redirigir tras login exitoso (ms)
 * @constant {number}
 */
const REDIRECT_DELAY = 1500;

/**
 * Muestra notificación al usuario (usa window.notify si está disponible, sino alert)
 * 
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de notificación ('success', 'error', 'warning', 'info')
 */
function mostrarNotificacion(message, type = 'info') {
    if (window.notify) {
        window.notify(message, { type, duration: NOTIFICATION_DURATION });
    } else {
        alert(message);
    }
}

/**
 * Maneja el evento de envío del formulario de login
 * 
 * Proceso:
 * 1. Valida campos requeridos
 * 2. Envía credenciales al servidor
 * 3. Almacena datos de usuario en localStorage si es exitoso
 * 4. Redirige al index.html
 */
document.getElementById("LoginForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    // Obtener valores del formulario
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    // Validar que no estén vacíos
    if (!email || !password) {
        mostrarNotificacion("❌ Por favor, complete todos los campos", 'error');
        return;
    }

    try {
        // Enviar credenciales al servidor
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (response.ok) {
            // Login exitoso: Guardar datos del usuario en localStorage
            localStorage.setItem("usuario", JSON.stringify(result.user));

            // Notificar éxito
            mostrarNotificacion("Login exitoso", 'success');

            // Redirigir al index después de un breve delay
            setTimeout(() => {
                window.location.href = "index.html";
            }, REDIRECT_DELAY);

        } else {
            // Credenciales incorrectas o error del servidor
            mostrarNotificacion(
                "❌ " + (result.message || "Correo o contraseña incorrectos"),
                'error'
            );
        }

    } catch (error) {
        // Error de red o conexión
        console.error("💥 Error en la conexión:", error);
        mostrarNotificacion("Error en la conexión con el servidor", 'error');
    }
});
