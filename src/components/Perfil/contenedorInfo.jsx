import React from "react";
import "../../styles/Perfil.css";

export default function ContenedorInfo({ usuario, handleCerrarSesion, handleBorrarCuenta }) {
    return (
        <div id="contenedorInfoSesion">
            <div id="contenedorInfo">
                <div id="tituloInfo">Información de usuario:</div>
                <div style={{ width: "100%", height: "80%" }}>
                    <div className="datoUsuarioRow">
                        <div className="info">Nombre:</div>
                        <span className="spNombre">{usuario.name}</span>
                    </div>
                    <div className="datoUsuarioRow">
                        <div className="info">Edad:</div>
                        <span className="spAge">{usuario.age || "-"}</span>
                    </div>
                    <div className="datoUsuarioRow">
                        <div className="info">Peso:</div>
                        <span className="spWeight">{usuario.weight ? usuario.weight + " kg" : "-"}</span>
                    </div>
                    <div className="datoUsuarioRow">
                        <div className="info">Altura:</div>
                        <span className="spHeight">{usuario.height ? usuario.height + " cm" : "-"}</span>
                    </div>
                    <div className="datoUsuarioRow">
                        <div className="info">Correo:</div>
                        <span className="spEmail">{usuario.email || "-"}</span>
                    </div>
                </div>
            </div>

            <div id="contenedorCerrarSesion">
                <div id="imagenUser"></div>
                <button id="cerrarSesion" onClick={handleCerrarSesion}>CERRAR SESIÓN</button>
            </div>

            <div id="contenedorBorrarCuenta">
                <button id="borrarCuenta" onClick={handleBorrarCuenta}>BORRAR CUENTA</button>
            </div>
        </div>
    );
}
