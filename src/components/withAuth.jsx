// src/components/withAuth.jsx
import React, { useEffect } from "react";

export default function withAuth(WrappedComponent, redirectIfLoggedIn = false) {
    return function AuthWrapper(props) {
        useEffect(() => {
            const usuarioGuardado = localStorage.getItem("usuario");
            if (!usuarioGuardado) {
                window.location.href = "/login";
            } else if (redirectIfLoggedIn) {
                // Para páginas como login o crear-cuenta
                window.location.href = "/perfil";
            }
        }, []);

        return <WrappedComponent {...props} />;
    };
}
