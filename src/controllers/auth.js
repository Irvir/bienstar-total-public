/**
 * auth.js - Controlador de autenticación
 * 
 * Maneja la protección de rutas y verificación de sesión de usuario
 */

/**
 * Protege páginas verificando si el usuario está autenticado
 * 
 * @param {boolean} redirectIfLoggedIn - Si es true, redirige a /perfil si ya está logueado
 *                                       Si es false, redirige a /login si NO está logueado
 * 
 * Casos de uso:
 * - protectPage(false) → Protege páginas privadas (perfil, dietas, etc.)
 * - protectPage(true)  → Para páginas públicas que no deben verse estando logueado (login, registro)
 */
export function protectPage(redirectIfLoggedIn = false) {
    const usuarioGuardado = localStorage.getItem("usuario");
    
    if (!usuarioGuardado) {
        // Usuario NO autenticado → Redirigir a login
        window.location.href = "/login";
    } else if (redirectIfLoggedIn) {
        // Usuario YA autenticado en página pública → Redirigir a perfil
        window.location.href = "/perfil";
    }
}
