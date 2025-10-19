import React from "react";
export default function MenuLateral({ showLoaderAndRedirect, isAdmin }) {
    return (
    <div id="divMenuLateral">
        <button className="botonesPerfilSelec">PERFIL</button>
        <button className="botonesPerfil" id="btnDieta" onClick={() => showLoaderAndRedirect("/dietas")}>
            MI DIETA
        </button>
        <button className="botonesPerfil">CALENDARIO</button>
        {isAdmin && (
            <>
                <button className="botonesPerfil" id="btnAlimentos" onClick={() => showLoaderAndRedirect("/admin")}>
                    CRUD ADLIMENTOS
                </button>
                <button className="botonesPerfil" id="btnCuentas" onClick={() => showLoaderAndRedirect("/cuentas")}>
                    GESTIÓN DE CUENTAS
                </button>
            </>
        )}

    </div>
    );
}
