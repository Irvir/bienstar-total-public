// src/components/withAuth.jsx
import React, { useEffect } from "react";

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
