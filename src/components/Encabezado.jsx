import React, { useEffect, useState } from "react";
import "../styles/Encabezado.css";

export default function Encabezado({ activePage, onNavigate }) {
  // Mostrar 'Iniciar sesión' cuando no hay usuario autenticado
  const [userName, setUserName] = useState("Iniciar sesión");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const readUserFromStorage = () => {
    const usuarioGuardado = localStorage.getItem("usuario");
    if (!usuarioGuardado) {
      setUserName("Iniciar sesión");
      setIsAuthenticated(false);
      return null;
    }
    try {
      const usuario = JSON.parse(usuarioGuardado);
      const nombre = usuario?.nombre || usuario?.name || usuario?.usuario || null;
      setUserName(nombre || "Iniciar sesión");
      setIsAuthenticated(Boolean(nombre || usuario));
      return usuario;
    } catch (e) {
      console.warn("Usuario inválido en localStorage", e);
      setUserName("Iniciar sesión");
      setIsAuthenticated(false);
      return null;
    }
  };

  useEffect(() => {
    // leer inicialmente
    readUserFromStorage();
    // actualizar si localStorage cambia (otra pestaña) o si app actualiza storage
    const onStorage = (e) => {
      if (e.key === "usuario") readUserFromStorage();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
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
    // comprobar en el momento del click por si el estado cambio
    readUserFromStorage();
    const dest = isAuthenticated ? "/perfil" : "/login";
    if (typeof onNavigate === "function") {
      onNavigate(dest);
    } else {
      // fallback por si el header se usa sin prop onNavigate
      window.location.href = dest;
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