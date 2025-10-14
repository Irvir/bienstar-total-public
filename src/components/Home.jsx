/**
 * Home.jsx - Componente de la página principal
 * 
 * Pantalla de inicio con:
 * - Botonera de navegación rápida
 * - Notificaciones personalizadas para cada sección
 * - Protección de ruta con HOC withAuth
 * - Loader durante navegación
 */

import React, { useEffect, useState } from "react";
import "../styles/Home.css";
import Pie from "./Pie";
import Encabezado from "./Encabezado";
import Loader from "./Loader.jsx";
import withAuth from "../components/withAuth";
import "../styles/Pie.css";

/**
 * Componente principal de la página de inicio
 * 
 * @returns {JSX.Element} Página de inicio con botonera de navegación
 */
function Home() {
    // ===== ESTADO DEL COMPONENTE =====
    
    /** @type {string} Página actualmente activa */
    const [activePage, setActivePage] = useState("home");
    
    /** @type {boolean} Estado del loader */
    const [loading, setLoading] = useState(false);

    // ===== EFECTOS =====

    /**
     * Detecta la página actual desde la URL
     * (El nombre de usuario lo maneja directamente el componente Encabezado)
     */
    useEffect(() => {
        const currentPage = window.location.pathname.split("/").pop() || "home";
        setActivePage(currentPage.replace(".html", "").toLowerCase());
    }, []);

    // ===== FUNCIONES DE NAVEGACIÓN =====

    /**
     * Muestra el loader y redirige después de un delay
     * 
     * @param {string} url - URL de destino
     */
    const showLoaderAndRedirect = (url) => {
        setLoading(true);
        setTimeout(() => {
            window.location.href = url;
        }, 700);
    };

    /**
     * Muestra notificación y redirige usando notifyThenRedirect global
     * 
     * @param {string} url - URL de destino
     * @param {string} mensaje - Mensaje a mostrar en la notificación
     */
    const handleClick = (url, mensaje) => {
        // Usa la función global notifyThenRedirect del sistema de notificaciones
        if (window.notifyThenRedirect) {
            window.notifyThenRedirect(
                mensaje, 
                { type: "info", duration: 3000 }, 
                url, 
                setLoading
            );
        } else {
            // Fallback si no está disponible
            showLoaderAndRedirect(url);
        }
    };

    // ===== RENDER =====

    return (
        <div className="home-page">
            <div id="contenedorPrincipal">
                <Encabezado
                    activePage={activePage}
                    onNavigate={showLoaderAndRedirect}
                />

                <div id="cuerpo">
                    {/* Botonera de navegación rápida */}
                    <div className="botonera">
                        <button
                            className="btn1"
                            onClick={() =>
                                handleClick("CrearDieta.html", "Editando tu dieta semanal")
                            }
                        ></button>
            <button
              className="btn2"
              onClick={() =>
                handleClick("dietas.html", "Revisando tus dietas")
              }
            ></button>
            <button
              className="btn3"
              onClick={() =>
                handleClick("calendario.html", "Abriendo tu calendario")
              }
            ></button>
            <button
              className="btn4"
              onClick={() =>
                handleClick("alimentos.html", "Explorando alimentos")
              }
            ></button>
            <button
              className="btn5"
              onClick={() =>
                handleClick("tipsParaTuDieta.html", "Consejos para tu dieta")
              }
                        ></button>
                    </div>
                </div>

                <Pie />
            </div>

            {/* Loader global */}
            <Loader visible={loading} />
        </div>
    );
}

// Exportar componente con HOC de autenticación
// requireAuth: false permite acceso sin login
const HomeWithAuth = withAuth(Home, { requireAuth: false });
HomeWithAuth.displayName = 'HomeWithAuth';
export default HomeWithAuth;