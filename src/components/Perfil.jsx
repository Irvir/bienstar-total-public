// src/pages/Perfil.jsx
import React, { useEffect, useState } from "react";
import "../styles/Perfil.css";
// Base.css is imported globally in main.jsx — avoid re-importing here
import withAuth from "../components/withAuth";
export default function Perfil() {
    const [usuario, setUsuario] = useState(null);

    useEffect(() => {
        const usuarioGuardado = localStorage.getItem("usuario");
        if (usuarioGuardado) {
            setUsuario(JSON.parse(usuarioGuardado));
        } else {
            // Si no hay usuario logueado, redirigir al login
            window.location.href = "/login";
        }
    }, []);

    const handleCerrarSesion = () => {
        localStorage.removeItem("usuario");
        window.location.href = "/login";
    };

    const showLoaderAndRedirect = (url) => {
        const loader = document.getElementById("loader");
        if (loader) loader.style.display = "flex";
        setTimeout(() => {
            window.location.href = url;
        }, 500); // más rápido que el HTML original
    };

    if (!usuario) return null; // Evitar renderizar mientras se verifica el usuario

    return (
        <>
            <div id="contenedorPrincipal" className="perfil-page">
                {/* Encabezado */}
                <div id="encabezado">
                    <div className="header-inner">
                        <div className="logo">
                            <a href="/">
                                <img src="/Imagenes/Login_Perfil/Logo.png" alt="Logo BienStarTotal" className="logoImg" />
                            </a>
                        </div>

                        <div className="menúBotones">
                            <button className="btnMenu" onClick={() => showLoaderAndRedirect("/")}>Inicio</button>
                            <button className="btnMenu" onClick={() => showLoaderAndRedirect("/alimentos")}>Alimentos</button>
                            <button className="btnMenu" onClick={() => showLoaderAndRedirect("/dietas")}>Dietas</button>
                            <button className="btnMenuNoti">
                                <img
                                    src="/Imagenes/Login_Perfil/Notificacion.png"
                                    id="btnNotification"
                                    onClick={() => window.notify("No tienes notificaciones nuevas.", { type: "info" })}
                                    alt="notificaciones"
                                    style={{ cursor: "pointer" }}
                                />
                            </button>
                        </div>

                        <div className="login">
                            <div style={{ float: "left", height: "100%", width: "75%" }} onClick={() => showLoaderAndRedirect("/perfil")}>
                                <button className="btnPerfilView" id="btnPerfilView">
                                    <span className="nameUser">{usuario.name}</span>
                                </button>
                            </div>

                            <div style={{ float: "left", width: "10%", height: "100%" }}>
                                <img
                                    src="/Imagenes/Login_Perfil/UserPerfil.png"
                                    id="fotoUsuario"
                                    alt="Foto de Usuario"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => showLoaderAndRedirect("/perfil")}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cuerpo */}
                <div id="cuerpo">
                    <div id="divMenuLateral">
                        <button className="botonesPerfilSelec">PERFIL</button>
                        <button className="botonesPerfil" id="btnDieta" onClick={() => showLoaderAndRedirect("/dietas")}>
                            MI DIETA
                        </button>
                        <button className="botonesPerfil">CALENDARIO</button>
                    </div>

                    <div id="divInfoUser">
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
                    </div>
                </div>

                {/* Pie de página */}
                <div id="pie">
                    <div className="footer-inner">
                        <button className="instaBoton"></button>
                        <button className="faceBoton"></button>
                        <button className="youTubeBoton"></button>
                        <button className="whatsBoton"></button>
                    </div>
                </div>
            </div>

            {/* Loader */}
            <div id="loader" style={{ display: "none" }}>
                <span className="loader-text">Cargando</span>
                <div className="loader-dots"></div>
            </div>
        </>
    );
}