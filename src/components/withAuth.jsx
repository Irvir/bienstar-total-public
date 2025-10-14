/**
 * @file withAuth.jsx
 * @description Higher-Order Component (HOC) para protección de rutas
 * 
 * Funcionalidades principales:
 * - Verifica autenticación del usuario
 * - Redirige según estado de sesión
 * - Soporta dos modos: nuevo (objeto) y legacy (booleano)
 * - Modo nuevo: { requireAuth, redirectIfLoggedIn }
 * - Modo legacy: segundo parámetro booleano (redirectIfLoggedIn)
 * 
 * Ejemplos de uso:
 * - withAuth(Component, { requireAuth: true }) // Requiere login
 * - withAuth(Component, { requireAuth: false }) // Público
 * - withAuth(Component, { requireAuth: false, redirectIfLoggedIn: true }) // Login/Registro
 */

import React, { useEffect } from "react";

/**
 * HOC withAuth
 * Envuelve un componente con lógica de autenticación
 * 
 * @param {React.Component} WrappedComponent - Componente a proteger
 * @param {Object|boolean} options - Opciones de autenticación
 * @param {boolean} options.requireAuth - Si requiere estar logueado (default: true)
 * @param {boolean} options.redirectIfLoggedIn - Si redirige a /perfil estando logueado (default: false)
 * @returns {React.Component} Componente envuelto con protección
 */
export default function withAuth(WrappedComponent, options = undefined) {
    return function AuthWrapper(props) {
        useEffect(() => {
            const usuarioGuardado = localStorage.getItem("usuario");

            // Modo NUEVO: options es objeto con propiedades
            if (options && typeof options === "object") {
                const { requireAuth = true, redirectIfLoggedIn = false } = options;
                
                // Si requiere auth y no hay usuario: redirigir a login
                if (requireAuth && !usuarioGuardado) {
                    window.location.href = "/login";
                    return;
                }
                
                // Si ya está logueado y la página redirige: ir a perfil
                if (redirectIfLoggedIn && usuarioGuardado) {
                    window.location.href = "/perfil";
                    return;
                }
            } else {
                // Modo LEGACY: segundo parámetro booleano => redirectIfLoggedIn
                const redirectIfLoggedIn = !!options;
                
                // Por defecto requiere autenticación en modo legacy
                if (!usuarioGuardado) {
                    window.location.href = "/login";
                    return;
                }
                
                // Redirigir si ya está logueado y se especificó
                if (redirectIfLoggedIn && usuarioGuardado) {
                    window.location.href = "/perfil";
                    return;
                }
            }
        }, []);

        return <WrappedComponent {...props} />;
    };
}
