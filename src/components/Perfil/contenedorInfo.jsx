import React from "react";
import "../../styles/Perfil.css";

export default function ContenedorInfo({ usuario, handleCerrarSesion }) {
    return (
    <div id="contenedorInfoSesion">
        <div id="contenedorInfo">
            <div id="tituloInfo">Información de usuario:</div>
            <div style={{ width: "100%", height: "80%" }}>
                <div className="datoUsuarioRow">
                    <div className="info">Nombre:</div>
                    <span id="spanNombre" className="spNombre">{usuario.name}</span>
                </div>
                <div className="datoUsuarioRow">
                    <div className="info">Edad:</div>
                    <span id="spanEdad" className="spAge">{usuario.age || "-"}</span>
                </div>
                <div className="datoUsuarioRow">
                    <div className="info">Peso:</div>
                    <span id="spanPeso" className="spWeight">{usuario.weight ? usuario.weight + " kg" : "-"}</span>
                </div>
                <div className="datoUsuarioRow">
                    <div className="info">Altura:</div>
                    <span id="spanAltura" className="spHeight">{usuario.height ? usuario.height + " cm" : "-"}</span>
                </div>
                <div className="datoUsuarioRow">
                    <div className="info">Correo:</div>
                    <span id="spanCorreo" className="spEmail">{usuario.email || "-"}</span>
                </div>
            </div>
        </div>

        <div id="contenedorCerrarSesion">
            <div id="imagenUser"></div>
            <button id="cerrarSesion" onClick={handleCerrarSesion}>CERRAR SESIÓN</button>
        </div>
    </div>
    );
}