// src/components/Login.jsx
import React, { useState, useEffect } from "react";
// Base.css is global — it should remain imported only in main.jsx
import "../styles/Login.css";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [userName, setUserName] = useState("Invitado");

    // Revisa si hay sesión activa
    useEffect(() => {
        const usuarioGuardado = localStorage.getItem("usuario");
        if (usuarioGuardado) {
            try {
                const usuario = JSON.parse(usuarioGuardado);
                if (usuario?.name) setUserName(usuario.name);
            } catch (e) {
                console.warn("Usuario inválido", e);
            }
        }
    }, []);

    // Función reutilizable para mostrar loader y redirigir
    const showLoaderAndRedirect = (url) => {
        const loader = document.getElementById("loader");
        if (loader) loader.style.display = "flex";
        setTimeout(() => {
            window.location.href = url;
        }, 2000);
    };

    // Maneja el inicio de sesión
    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            alert("Por favor, complete todos los campos");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("http://localhost:3000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const result = await response.json();

            if (response.ok) {
                localStorage.setItem("usuario", JSON.stringify(result.user));
                alert("Login exitoso");
                setTimeout(() => {
                    window.location.href = "/"; // redirigir al Home
                }, 1500);
            } else {
                alert(result.message || "Correo o contraseña incorrectos");
            }
        } catch (error) {
            console.error(error);
            alert("Error en la conexión con el servidor");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div id="contenedorPrincipal" className="login-page">
                {/* Encabezado */}
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
                            <button className="btnMenu" onClick={() => showLoaderAndRedirect("/")}>Inicio</button>
                            <button className="btnMenu" onClick={() => showLoaderAndRedirect("/alimentos")}>Alimentos</button>
                            <button className="btnMenu" onClick={() => showLoaderAndRedirect("/dietas")}>Dietas</button>
                            <button className="btnMenuNoti">
                                <img
                                    src="/Imagenes/Login_Perfil/Notificacion.png"
                                    id="btnNotification"
                                    onClick={() => alert("No tienes notificaciones nuevas.")}
                                    style={{ cursor: "pointer" }}
                                    alt="notificaciones"
                                />
                            </button>
                        </div>

                        <div className="login">
                            <div className="login-left" onClick={() => showLoaderAndRedirect("/login")}>
                                <button className="btnPerfilView" id="btnPerfilView">
                                    <span className="nameUser">{userName}</span>
                                </button>
                            </div>
                            <div className="login-avatar" onClick={() => showLoaderAndRedirect("/login")}>
                                <img
                                    src="/Imagenes/Login_Perfil/UserPerfil.png"
                                    id="fotoUsuario"
                                    alt="Foto de Usuario"
                                    className="cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cuerpo */}
                <div id="cuerpo" className="fondoLogin">
                    <div id="contenedorLoginAsist">
                        <div id="contenedorLogin">
                            <div id="contenedorLoginFoto"></div>
                            <div className="login-container">
                                <form onSubmit={handleLogin}>
                                    <input
                                        type="text"
                                        placeholder="Correo electrónico"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    <input
                                        type="password"
                                        placeholder="Contraseña"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <br />
                                    <br />
                                    <button type="submit" id="botonIngresar">
                                        Ingresar
                                    </button>

                                    {loading && (
                                        <div id="loading-animation">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                    )}

                                    <br />
                                    <br />
                                    <button
                                        type="button"
                                        className="btnCrearCuenta"
                                        onClick={() => showLoaderAndRedirect("/crear-cuenta")}
                                    >
                                        Crear Cuenta
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pie de página */}
                <div id="pie">
                    <div className="footer-inner">
                        <a href="#" className="footer-link" title="Instagram"><img src="/Imagenes/Pie_Pagina/InstaLogo.png" alt="Instagram" /></a>
                        <a href="#" className="footer-link" title="Facebook"><img src="/Imagenes/Pie_Pagina/FaceLogo.png" alt="Facebook" /></a>
                        <a href="#" className="footer-link" title="YouTube"><img src="/Imagenes/Pie_Pagina/YouTubeLogo.png" alt="YouTube" /></a>
                        <a href="#" className="footer-link" title="WhatsApp"><img src="/Imagenes/Pie_Pagina/WhatsLogo.png" alt="WhatsApp" /></a>
                    </div>
                </div>
            </div>

            {/* Loader (igual al del Home) */}
            <div id="loader" style={{ display: "none" }}>
                <span className="loader-text">Cargando</span>
                <div className="loader-dots">
                    <img src="/Imagenes/Imagenes_de_carga/frutilla1.png" alt="Frutilla1" />
                    <img src="/Imagenes/Imagenes_de_carga/manzana1.png" alt="Manzana1" />
                    <img src="/Imagenes/Imagenes_de_carga/naranja1.png" alt="Naranja1" />
                </div>
            </div>
        </>
    );
}
