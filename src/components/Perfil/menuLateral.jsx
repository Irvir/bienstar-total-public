import React from "react";

export default function MenuLateral({ showLoaderAndRedirect }) {
    // Leer usuario desde localStorage (soporta claves 'usuario' o 'Usuario')
    let usuario = null;
    try {
        const raw = localStorage.getItem("usuario") || localStorage.getItem("Usuario");
        if (raw) usuario = JSON.parse(raw);
    } catch (e) {
        console.warn("menuLateral: error parseando usuario en localStorage", e);
        usuario = null;
    }

    // Determinar si es admin (misma heurística que en Login.jsx)
    const isAdmin = (() => {
        if (!usuario) return false;
        const email = (usuario.email || "").toString().trim().toLowerCase();
        const name = (usuario.name || usuario.nombre || "").toString().trim().toLowerCase();
        const idStr = String(usuario.id || usuario.id_usuario || usuario.id_usuario || "");
        return (
            (email === "admin@bienstartotal.food" || email === "admin2025@bienstartotal.food") ||
            (name === "admin" || name === "administrador") ||
            idStr === "6" || idStr === "admin2025"
        );
    })();

    return (
        <div id="divMenuLateral">
            {!isAdmin && (
                <>
                    <button className="botonesPerfilSelec">PERFIL</button>
                    <button className="botonesPerfil" id="btnDieta" onClick={() => showLoaderAndRedirect("/dietas")}>
                        MI DIETA
                    </button>
                    <button className="botonesPerfil">CALENDARIO</button>
                </>
            )}

            {/* Opciones visibles siempre para admins (y también accesibles para otros si quieres) */}
            {isAdmin && (
                <>
                    <button className="botonesPerfil" id="btnAlimentos" onClick={() => showLoaderAndRedirect("/admin")}>
                        CRUD ALIMENTOS
                    </button>
                    <button className="botonesPerfil" id="btnCuentas" onClick={() => showLoaderAndRedirect("/cuentas")}>
                        GESTIÓN DE CUENTAS
                    </button>
                </>
            )}
        </div>
    );
}
