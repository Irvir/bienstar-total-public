// src/components/Encabezado.jsx
import React, { useEffect, useState } from "react";
import "../styles/Base.css";

export default function Encabezado({ activePage }) {
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

    // 🔹 Muestra un loader antes de redirigir
    function showLoaderAndRedirect(relativePath) {
        const loader = document.getElementById("loader");
        if (loader) loader.style.display = "flex";
        // Combina la base de Vite con la ruta relativa
        const url = `${import.meta.env.BASE_URL}${relativePath}`;
        setTimeout(() => (window.location.href = url), 700);
    }

    // 🔹 Redirección al perfil o login según usuario
    function handlePerfilClick() {
        const usuarioGuardado = localStorage.getItem("usuario");
        if (usuarioGuardado) {
            window.location.href = `${import.meta.env.BASE_URL}perfil`;
        } else {
            showLoaderAndRedirect("login");
        }
    }

    return (
        <div id="contenedorEncabezado">
            <div id="encabezado">
                <div className="header-inner">
                    {/* LOGO */}
                    <div className="logo">
                        <a href={import.meta.env.BASE_URL}>
                            <img
                                src={`${import.meta.env.BASE_URL}Imagenes/Login_Perfil/Logo.png`}
                                alt="Logo BienStarTotal"
                                className="logoImg"
                            />
                        </a>
                    </div>

                    {/* MENÚ PRINCIPAL */}
                    <div className="menúBotones">
                        <button
                            className={activePage === "home" ? "btnMenuSelec" : "btnMenu"}
                            onClick={() => showLoaderAndRedirect("home")}
                        >
                            Inicio
                        </button>

                        <button
                            className={activePage === "alimentos" ? "btnMenuSelec" : "btnMenu"}
                            onClick={() => showLoaderAndRedirect("alimentos")}
                        >
                            Alimentos
                        </button>

                        <button
                            className={activePage === "dietas" ? "btnMenuSelec" : "btnMenu"}
                            onClick={() => showLoaderAndRedirect("dietas")}
                        >
                            Dietas
                        </button>

                        <button className="btnMenuNoti">
                            <img
                                src={`${import.meta.env.BASE_URL}Imagenes/Login_Perfil/Notificacion.png`}
                                id="btnNotification"
                                alt="Notificación"
                            />
                        </button>
                    </div>

                    {/* PERFIL / LOGIN */}
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
                                src={`${import.meta.env.BASE_URL}Imagenes/Login_Perfil/UserPerfil.png`}
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
