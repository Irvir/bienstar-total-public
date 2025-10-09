// src/controllers/auth.js
export function protectPage(redirectIfLoggedIn = false) {
    const usuarioGuardado = localStorage.getItem("usuario");
    if (!usuarioGuardado) {
        // Si no hay usuario logueado, siempre ir a login
        window.location.href = "/login";
    } else if (redirectIfLoggedIn) {
        // Si ya está logueado y está en login/crear-cuenta, ir al perfil
        window.location.href = "/perfil";
    }
}
