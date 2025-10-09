// src/pages/Perfil.jsx
import React, { useEffect, useState } from "react";
import "../styles/Perfil.css";
import Encabezado from "./Encabezado";
import Pie from "./Pie";
import "../styles/Base.css";
import ContenedorInfo from "./Perfil/contenedorInfo";
import MenuLateral from "./Perfil/menuLateral";
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
        <div id="contenedorPrincipal" className="perfil-page">
            <Encabezado activePage={"perfil"}/>
          
                <div id="cuerpo">
                    <MenuLateral showLoaderAndRedirect={showLoaderAndRedirect} />
                    <div id="divInfoUser">
                        <ContenedorInfo usuario={usuario} handleCerrarSesion={handleCerrarSesion} />
                    </div>
                </div>

                <Pie></Pie>
                       

            {/* Loader */}
            <div id="loader" style={{ display: "none" }}>
                <span className="loader-text">Cargando</span>
                <div className="loader-dots"></div>
            </div>

        </div >

        
    );
};