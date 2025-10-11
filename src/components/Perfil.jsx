import React, { useEffect, useState } from "react";
import "../styles/Perfil.css";
import Encabezado from "./Encabezado";
import Pie from "./Pie";
import "../styles/Base.css";
import ContenedorInfo from "./Perfil/contenedorInfo";
import MenuLateral from "./Perfil/menuLateral";
import Loader from "./Loader.jsx";
import withAuth from "../components/withAuth";

function Perfil() {
    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(false); // ✅ loader global

    useEffect(() => {
        const usuarioGuardado = localStorage.getItem("usuario");
        if (usuarioGuardado) {
            setUsuario(JSON.parse(usuarioGuardado));
        } else {
            window.location.href = "/login";
        }
    }, []);

    // ✅ loader + redirección
    const showLoaderAndRedirect = (url) => {
        setLoading(true);
        setTimeout(() => {
            window.location.href = url;
        }, 700);
    };

    const handleCerrarSesion = () => {
        localStorage.removeItem("usuario");
        showLoaderAndRedirect("/login");
    };

    if (!usuario) return null;

    return (
        <div id="contenedorPrincipal" className="perfil-page">
            <Encabezado activePage="perfil" onNavigate={showLoaderAndRedirect} />

            <div id="cuerpo">
                <MenuLateral showLoaderAndRedirect={showLoaderAndRedirect} />
                <div id="divInfoUser">
                    <ContenedorInfo usuario={usuario} handleCerrarSesion={handleCerrarSesion} />
                </div>
            </div>

            <Pie />

            <Loader visible={loading} />
        </div>
    );
}

export default withAuth(Perfil, { requireAuth: true });