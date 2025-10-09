// src/components/CrearCuenta.jsx
import React, { useEffect } from "react";
// Base.css is global and should be imported only once in main.jsx
import "../styles/CrearDieta.css";
import { protectPage } from "../controllers/auth";
import withAuth from "../components/withAuth";

export  function CrearCuenta() {
    useEffect(() => {
        // Verificar sesión activa
        try {
            if (!localStorage.getItem("usuario")) {
                window.location.href = "/login";
            }
        } catch (e) {
            window.location.href = "/login";
        }

        // Cargar nombre del usuario
        const usuarioGuardado = localStorage.getItem("usuario");
        if (usuarioGuardado) {
            const usuario = JSON.parse(usuarioGuardado);
            const nameUserSpan = document.querySelector(".nameUser");
            if (nameUserSpan) {
                nameUserSpan.textContent = usuario.name;
            }
        }

        // Ir al perfil al hacer clic en la foto
        const fotoUsuario = document.getElementById("fotoUsuario");
        if (fotoUsuario) {
            fotoUsuario.addEventListener("click", () => {
                window.location.href = "/perfil";
            });
        }
    }, []);

    return (
        <div id="contenedorPrincipal" className="crear-dieta-page">
            {/* ENCABEZADO */}
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
                            className="btnMenu"
                            onClick={() => (window.location.href = "/")}
                        >
                            Inicio
                        </button>
                        <button
                            className="btnMenu"
                            onClick={() => (window.location.href = "/alimentos")}
                        >
                            Alimentos
                        </button>
                        <button
                            className="btnMenuSelec"
                            onClick={() => (window.location.href = "/dietas")}
                        >
                            Dietas
                        </button>
                        <button className="btnMenuNoti">
                            <img
                                src="/Imagenes/Login_Perfil/Notificacion.png"
                                id="btnNotification"
                                alt="notificaciones"
                            />
                        </button>
                    </div>

                    <div className="login">
                        <div style={{ float: "left", height: "100%", width: "75%" }}>
                            <button className="btnPerfilView" id="btnPerfilView">
                                <span className="nameUser">Nombre de Usuario</span>
                            </button>
                        </div>

                        {/* Menú desplegable */}
                        <div id="menuDesplegable" className="menuDesplegable">
                            <button
                                className="opcionMenu"
                                onClick={() => (window.location.href = "/perfil")}
                            >
                                Ver Perfil
                            </button>
                            <button className="opcionMenu" id="logoutButton">
                                Cerrar Sesión
                            </button>
                        </div>

                        {/* Imagen Usuario */}
                        <div style={{ float: "left", width: "10%", height: "100%" }}>
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

            {/* CUERPO */}
            <div id="cuerpo">
                {/* Izquierda: Crear Dieta */}
                <div id="formContainer">
                    <div id="crearDieta">
                        <h2 id="diaSeleccionado">
                            Dieta del Día <span id="diaSeleccionadoTexto">–</span>
                        </h2>
                        <div id="resumenDieta"></div>
                        <div className="barraDivisora"></div>

                        <div id="botones">
                            <div className="grupoSelector" style={{ marginRight: "12px" }}>
                                <div className="etiqueta">DÍA</div>
                                <div className="selector">
                                    <select id="dia" className="selectDia">
                                        <option value="1">Lunes</option>
                                        <option value="2">Martes</option>
                                        <option value="3">Miércoles</option>
                                        <option value="4">Jueves</option>
                                        <option value="5">Viernes</option>
                                        <option value="6">Sábado</option>
                                        <option value="7">Domingo</option>
                                    </select>
                                </div>
                            </div>

                            <button id="btnBorrarDieta">Borrar Todo</button>
                            <button id="btnSalir">Salir</button>
                        </div>
                    </div>
                </div>

                {/* Derecha: Filtro */}
                <div id="filtroContainer">
                    <div id="contenedorFiltro">
                        <div id="lupe"></div>
                        <div style={{ flex: 1 }}>
                            <input type="text" id="filtro" placeholder="Buscar alimento..." />
                        </div>
                    </div>
                    <div id="resultadosFiltro" className="resultadosFiltro"></div>
                </div>
            </div>

            {/* PIE */}
            <div id="pie">
                <div className="footer-inner">
                    <button className="instaBoton"></button>
                    <button className="faceBoton"></button>
                    <button className="youTubeBoton"></button>
                    <button className="whatsBoton"></button>
                </div>
            </div>
        </div>
    );
}
export default withAuth(CrearCuenta,false);