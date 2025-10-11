import React, { useEffect, useState } from "react";
import "../styles/Base.css";

export default function Encabezado({ activePage, onNavigate }) {
  const [userName, setUserName] = useState("Invitado");

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) {
      try {
        const usuario = JSON.parse(usuarioGuardado);
        if (usuario?.name) setUserName(usuario.name);
      } catch (e) {
        console.warn("Usuario inválido en localStorage", e);
      }
    }
  }, []);

  function handlePerfilClick() {
    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) {
      onNavigate("/perfil");
    } else {
      onNavigate("/login");
    }
  }

  return (
    <div id="contenedorEncabezado">
      <div id="encabezado">
        <div className="header-inner">
          <div className="logo">
            <a href="/">
              <img
                src="/Imagenes/Login_Perfil/Logo.png"
                alt="Logo BienStarTotal"
                className="logoImg"
              />
            </a>
          </div>

          <div className="menúBotones">
            <button
              className={activePage === "home" ? "btnMenuSelec" : "btnMenu"}
              onClick={() => onNavigate("/home")}
            >
              Inicio
            </button>
            <button
              className={activePage === "alimentos" ? "btnMenuSelec" : "btnMenu"}
              onClick={() => onNavigate("/alimentos")}
            >
              Alimentos
            </button>
            <button
              className={activePage === "dietas" ? "btnMenuSelec" : "btnMenu"}
              onClick={() => onNavigate("/dietas")}
            >
              Dietas
            </button>
            <button className="btnMenuNoti">
              <img
                src="/Imagenes/Login_Perfil/Notificacion.png"
                id="btnNotification"
                alt="Notificación"
              />
            </button>
          </div>

          <div className="login">
            <div
              style={{ float: "left", height: "100%", width: "75%" }}
              onClick={handlePerfilClick}
            >
              <button className="btnPerfilView" id="btnPerfilView">
                <span className="nameUser">{userName}</span>
              </button>
            </div>

            <div
              style={{ float: "left", width: "10%", height: "100%" }}
              onClick={handlePerfilClick}
            >
              <img
                src="/Imagenes/Login_Perfil/UserPerfil.png"
                id="fotoUsuario"
                alt="Foto de Usuario"
                style={{ cursor: "pointer" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}