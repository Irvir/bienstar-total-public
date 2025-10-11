import React, { useState, useEffect } from "react";
import "../styles/Login.css";
import withAuth from "../components/withAuth";
import Encabezado from "./Encabezado";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [userName, setUserName] = useState("Invitado");

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

    // ✅ loader + redirección
    const showLoaderAndRedirect = (url) => {
        const loader = document.getElementById("loader");
        if (loader) loader.style.display = "flex";
        setTimeout(() => {
            window.location.href = url;
        }, 2000);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            window.notify("Por favor, complete todos los campos", { type: "error" });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("http://localhost:3001/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const result = await response.json();

            if (response.ok) {
                localStorage.setItem("usuario", JSON.stringify(result.user));
                window.notify("Login exitoso", { type: "success" });
                setTimeout(() => {
                    window.location.href = "/";
                }, 1500);
            } else {
                window.notify(result.message || "Correo o contraseña incorrectos", { type: "error" });
            }
        } catch (error) {
            console.error(error);
            window.notify("Error en la conexión con el servidor", { type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div id="contenedorPrincipal" className="login-page">
                {/* ✅ PASAMOS la función al Encabezado */}
                <Encabezado activePage="Login" onNavigate={showLoaderAndRedirect} />

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
                                    <br /><br />
                                    <button type="submit" id="botonIngresar" disabled={loading}>
                                        {loading ? "Ingresando..." : "Ingresar"}
                                    </button>

                                    {loading && (
                                        <div id="loading-animation">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                    )}

                                    <br /><br />
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

                <div id="pie">
                    <div className="footer-inner">
                        <a href="#" className="footer-link" title="Instagram"><img src="/Imagenes/Pie_Pagina/InstaLogo.png" alt="Instagram" /></a>
                        <a href="#" className="footer-link" title="Facebook"><img src="/Imagenes/Pie_Pagina/FaceLogo.png" alt="Facebook" /></a>
                        <a href="#" className="footer-link" title="YouTube"><img src="/Imagenes/Pie_Pagina/YouTubeLogo.png" alt="YouTube" /></a>
                        <a href="#" className="footer-link" title="WhatsApp"><img src="/Imagenes/Pie_Pagina/WhatsLogo.png" alt="WhatsApp" /></a>
                    </div>
                </div>
            </div>

            {/* ✅ loader global */}
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