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
  useEffect(() => {
    const bell = document.getElementById("btnNotification");
    if (bell) {
      const triggerWiggle = () => {
        bell.classList.remove("bell-hint");
        void bell.offsetWidth; // fuerza reflow
        bell.classList.add("bell-hint");
  
        setTimeout(() => {
          bell.classList.remove("bell-hint");
        }, 800); // duración de la animación
      };
  
      bell.addEventListener("click", triggerWiggle);
      return () => bell.removeEventListener("click", triggerWiggle);
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
                src="/Imagenes/Login_Perfil/LogoWithOutBackground.png"
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
              INICIO
            </button>
            <button
              className={activePage === "alimentos" ? "btnMenuSelec" : "btnMenu"}
              onClick={() => onNavigate("/alimentos")}
            >
              ALIMENTOS
            </button>
            <button
              className={activePage === "dietas" ? "btnMenuSelec" : "btnMenu"}
              onClick={() => onNavigate("/dietas")}
            >
              DIETAS
            </button>
            <button className="btnMenuNoti">
              <img
                src="/Imagenes/Login_Perfil/Notificacion.png"
                id="btnNotification"
                alt="Notificación"
              />
            </button>
          </div>

          <div className="login" onClick={handlePerfilClick}>
            <span className="nameUser">{userName}</span>
            <img
              src="/Imagenes/Login_Perfil/UserPerfil.png"
              id="fotoUsuario"
              alt="Foto de Usuario"
              className="fotoUsuario"
            />
          </div>
        </div>
      </div>
    </div>
  );
}