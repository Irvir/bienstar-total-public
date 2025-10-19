// src/components/withAuth.jsx
import React, { useEffect } from "react";

export default function withAuth(WrappedComponent, options = undefined) {
    return function AuthWrapper(props) {
        useEffect(() => {
            const usuarioGuardado = localStorage.getItem("usuario");
            const parsedUser = (() => {
                try { return usuarioGuardado ? JSON.parse(usuarioGuardado) : null; } catch { return null; }
            })();

            // Si options es objeto, usar NUEVA API 
            if (options && typeof options === "object") {
                const { requireAuth = true, redirectIfLoggedIn = false, requireAdmin = false } = options;
                if (requireAuth && !usuarioGuardado) {
                    window.location.href = "/login";
                    return;
                }
                if (requireAdmin) {
                    const isAdmin = !!parsedUser?.is_admin || parsedUser?.role === 'admin' || parsedUser?.id_perfil === 1;
                    if (!isAdmin) {
                        window.location.href = "/perfil";
                        return;
                    }
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
