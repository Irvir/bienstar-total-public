/**
 * Encabezado.jsx - Componente del encabezado/header de la aplicación
 * 
 * Contiene:
 * - Logo con enlace al inicio
 * - Menú de navegación (Inicio, Alimentos, Dietas)
 * - Botón de notificaciones con animación
 * - Información de usuario y enlace a perfil
 */

import React, { useEffect, useState } from "react";
import "../styles/Encabezado.css";

/**
 * Componente Encabezado
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.activePage - Página actualmente activa
 * @param {Function} props.onNavigate - Función callback para navegación
 * @returns {JSX.Element} Encabezado completo de la aplicación
 */
export default function Encabezado({ activePage, onNavigate }) {
    // ===== ESTADO =====
    
    /** @type {string} Nombre del usuario logueado */
    const [userName, setUserName] = useState("Invitado");

    // ===== EFECTOS =====

    /**
     * Obtiene el nombre del usuario desde localStorage
     */
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

    /**
     * Configura la animación de campanita en el botón de notificaciones
     */
    useEffect(() => {
        const bell = document.getElementById("btnNotification");
        
        if (bell) {
            /**
             * Activa la animación de campanita (wiggle)
             */
            const triggerWiggle = () => {
                bell.classList.remove("bell-hint");
                void bell.offsetWidth; // Fuerza reflow para reiniciar animación
                bell.classList.add("bell-hint");

                setTimeout(() => {
                    bell.classList.remove("bell-hint");
                }, 800); // Duración de la animación
            };

            bell.addEventListener("click", triggerWiggle);
            return () => bell.removeEventListener("click", triggerWiggle);
        }
    }, []);

    // ===== FUNCIONES =====

    /**
     * Maneja el clic en el perfil de usuario
     * Redirige a perfil si está logueado, sino a login
     */
    function handlePerfilClick() {
        const usuarioGuardado = localStorage.getItem("usuario");
        if (usuarioGuardado) {
            onNavigate("/perfil");
        } else {
            onNavigate("/login");
        }
    }

    // ===== RENDER =====
    // ===== RENDER =====

    return (
        <div id="contenedorEncabezado">
            <div id="encabezado">
                <div className="header-inner">
                    {/* Logo de la aplicación */}
                    <div className="logo">
                        <a href="/">
                            <img
                                src="/assets/LogoRed.png"
                                alt="Logo BienStarTotal"
                                className="logoImg"
                            />
                        </a>
                    </div>

                    {/* Menú de navegación principal */}
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
                        
                        {/* Botón de notificaciones con animación */}
                        <button className="btnMenuNoti">
                            <img
                                src="/Imagenes/Login_Perfil/Notificacion.png"
                                id="btnNotification"
                                alt="Notificación"
                            />
                        </button>
                    </div>

                    {/* Sección de usuario/perfil */}
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