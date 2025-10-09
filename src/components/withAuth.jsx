// src/components/withAuth.jsx
import React, { useEffect } from "react";

/**
 * HOC de autenticación con API flexible.
 *
 * Cambios principales:
 * - Ahora admite 2 formas de uso:
 *   1) Legacy: withAuth(Componente, true|false)
 *      - El booleano indica "redirectIfLoggedIn" (para páginas públicas como login/registro).
 *   2) Nueva API: withAuth(Componente, { requireAuth, redirectIfLoggedIn })
 *      - requireAuth: si true, exige usuario en localStorage (protege páginas privadas).
 *      - redirectIfLoggedIn: si true y hay usuario, redirige a /perfil (evita mostrar login/registro a usuarios logueados).
 *
 * Beneficio: control fino por página (pública o privada) sin duplicar lógica de redirección dentro de cada componente.
 */
export default function withAuth(WrappedComponent, options = undefined) {
    return function AuthWrapper(props) {
        useEffect(() => {
            const usuarioGuardado = localStorage.getItem("usuario");

            // Si options es objeto, usar NUEVA API 
            if (options && typeof options === "object") {
                const { requireAuth = true, redirectIfLoggedIn = false } = options;
                if (requireAuth && !usuarioGuardado) {
                    window.location.href = "/login";
                    return;
                }
                if (redirectIfLoggedIn && usuarioGuardado) {
                    window.location.href = "/perfil";
                    return;
                }
            } else {
                // Modo LEGACY: segundo parámetro booleano => redirectIfLoggedIn
                const redirectIfLoggedIn = !!options;
                if (!usuarioGuardado) {
                    window.location.href = "/login";
                    return;
                }
                if (redirectIfLoggedIn && usuarioGuardado) {
                    window.location.href = "/perfil";
                    return;
                }
            }
        }, []);

        return <WrappedComponent {...props} />;
    };
}
