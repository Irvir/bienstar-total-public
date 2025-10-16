import React from "react";
export default function MenuLateral({ showLoaderAndRedirect }) {
    return (
    <div id="divMenuLateral">
        <button className="botonesPerfilSelec">PERFIL</button>
        <button className="botonesPerfil" id="btnDieta" onClick={() => showLoaderAndRedirect("/dietas")}>
            MI DIETA
        </button>
        <button className="botonesPerfil">CALENDARIO</button>
        <button className="botonesPerfil" id="btnAlimentos" onClick={() => showLoaderAndRedirect("/admin")}>
            ADMIN
        </button>
    </div>
    );
}
