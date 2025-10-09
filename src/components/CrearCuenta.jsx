// src/pages/CrearCuenta.jsx
import React, { useEffect, useState } from "react";
import "../styles/CrearCuenta.css";
import withAuth from "../components/withAuth";

const CrearCuenta = () => {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const usuarioGuardado = localStorage.getItem("usuario");
        if (usuarioGuardado) {
            const usuario = JSON.parse(usuarioGuardado);
            const nameUserSpan = document.querySelector(".nameUser");
            if (nameUserSpan) nameUserSpan.textContent = usuario.name;
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        const age = document.getElementById("age").value.trim();
        const weight = document.getElementById("weight").value.trim();
        const height = document.getElementById("height").value.trim();

        try {
            const res = await fetch("http://localhost:3001/registrar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, age, weight, height }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.errores && data.errores.length > 0) {
                    data.errores.forEach(err => window.notify(err, { type: "error" }));
                } else {
                    window.notify(data.message || "Error al registrar", { type: "error" });
                }
            } else {
                window.notify(data.message || "Registro exitoso", { type: "success" });
                setTimeout(() => (window.location.href = "/login"), 2500);
            }
        } catch (err) {
            console.error(err);
            window.notify("Error de conexión al servidor", { type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id="contenedorPrincipal" className="crear-cuenta-page">
            <header id="encabezado">
                <div className="header-inner">
                    <div className="logo">
                        <a onClick={() => (window.location.href = "/")}>
                            <img
                                src="/Imagenes/Login_Perfil/Logo.png"
                                alt="Logo BienStarTotal"
                                className="logoImg"
                            />
                        </a>
                    </div>

                    <div className="menúBotones">
                        <button className="btnMenu" onClick={() => (window.location.href = "/")}>Inicio</button>
                        <button className="btnMenu" onClick={() => (window.location.href = "/alimentos")}>Alimentos</button>
                        <button className="btnMenu" onClick={() => (window.location.href = "/dietas")}>Dietas</button>
                        <button className="btnMenuNoti">
                            <img src="/Imagenes/Login_Perfil/Notificacion.png" id="btnNotification" alt="Notificación" />
                        </button>
                    </div>

                    <div className="login">
                        <div style={{ float: "left", height: "100%", width: "75%" }}>
                            <button className="btnPerfilView" id="btnPerfilView">
                                <span className="nameUser">Nombre de Usuario</span>
                            </button>
                        </div>
                        <div style={{ float: "left", width: "10%", height: "100%" }}>
                            <img
                                src="/Imagenes/Login_Perfil/UserPerfil.png"
                                id="fotoUsuario"
                                alt="Foto de Usuario"
                                style={{ cursor: "pointer" }}
                                onClick={() => (window.location.href = "/login")}
                            />
                        </div>
                    </div>
                </div>
            </header>

            <main id="cuerpo" className="fondoLogin">
                <div id="contenedorLoginAsist3">
                    <div id="contenedorLogin2">
                        <div style={{ width: "33%", height: "100%", float: "left" }}>
                            <div className="contendorLoginFotoCrearUserAsist" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
                                Rellene los datos solicitados:
                            </div>
                            <div className="contendorLoginFotoCrearUser"></div>
                        </div>

                        <div className="contenedorLoginDatosUser">
                            <form id="CrearCuentaForm" onSubmit={handleSubmit}>
                                <div className="divNom">
                                    Nombre:<br />
                                    <input type="text" id="name" placeholder="Nombre" required />
                                    <div className="field-error" id="err-name"></div>
                                </div>

                                <div className="divEdadPesoAlt">
                                    <div className="edadPesoAlt">
                                        Edad:<br />
                                        <input type="number" id="age" placeholder="Escriba su edad" required />
                                        <div className="field-error" id="err-age"></div>
                                    </div>

                                    <div className="edadPesoAlt">
                                        Peso (KG):<br />
                                        <input type="number" id="weight" placeholder="Escriba su peso" step="any" required />
                                        <div className="field-error" id="err-weight"></div>
                                    </div>

                                    <div className="edadPesoAlt">
                                        Altura (CM):<br />
                                        <input type="number" id="height" placeholder="Escriba su altura" step="any" required />
                                        <div className="field-error" id="err-height"></div>
                                    </div>
                                </div>

                                <div className="divCorreo">
                                    Correo electrónico:<br />
                                    <input type="email" id="email" placeholder="Escriba su correo electrónico" required />
                                    <div className="field-error" id="err-email"></div>
                                </div>

                                <div className="divCorreo">
                                    Contraseña:<br />
                                    <input type="password" id="password" placeholder="Contraseña" required />
                                    <div className="field-error" id="err-password"></div>
                                </div>

                                <br />
                                <button type="submit" className="buttonCrearIniciarSesion" disabled={loading}>
                                    {loading ? "Registrando..." : "Crear Cuenta"}
                                </button>
                            </form>

                            <br />
                            <button className="buttonCrearIniciarSesion" id="btnIniciarSesion" onClick={() => (window.location.href = "/login")}>
                                Iniciar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <footer id="pie">
                <div className="footer-inner">
                    <a href="#" className="footer-link" title="Instagram"><img src="/Imagenes/Pie_Pagina/InstaLogo.png" alt="Instagram" /></a>
                    <a href="#" className="footer-link" title="Facebook"><img src="/Imagenes/Pie_Pagina/FaceLogo.png" alt="Facebook" /></a>
                    <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank" rel="noopener noreferrer" className="footer-link" title="YouTube"><img src="/Imagenes/Pie_Pagina/YouTubeLogo.png" alt="YouTube" /></a>
                    <a href="#" className="footer-link" title="WhatsApp"><img src="/Imagenes/Pie_Pagina/WhatsLogo.png" alt="WhatsApp" /></a>
                </div>
            </footer>
        </div>
    );
};

export default withAuth(CrearCuenta,false);
