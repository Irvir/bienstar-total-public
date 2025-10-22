import React, { useEffect, useState } from "react";
import "../styles/Encabezado.css";

export default function Encabezado({ activePage, onNavigate }) {
  // Forzar que el nombre mostrado sea siempre 'administrador' según solicitud
  const [userName, setUserName] = useState("Administrador");

  // Mantener el efecto original como respaldo en caso de necesitarse más info
  useEffect(() => {
    // No sobreescribimos el nombre; dejamos siempre 'administrador'.
    // Si en el futuro se desea volver a mostrar el nombre real, se puede
    // descomentar y adaptar la lógica siguiente.
    
    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) {
      try {
        const usuario = JSON.parse(usuarioGuardado);
        if (usuario?.nombre) setUserName(usuario.nombre);
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
                src="/assets/LogoRed.png"
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
              src="/Imagenes/Login_Perfil/UserPerfil2.png"
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