/**
 * Dietas.jsx - Componente de visualización de dietas semanales
 * 
 * Funcionalidades:
 * - Visualización de la dieta completa de la semana
 * - Agrupación por día y tipo de comida
 * - Menú desplegable de usuario
 * - Navegación con loader
 * - Asegura que el usuario tenga una dieta personal
 */

import React, { useEffect, useState } from "react";
import "../styles/Dietas.css";
import withAuth from "../components/withAuth";

import Encabezado from "./Encabezado";
import Pie from "./Pie";
import Loader from "./Loader.jsx";
import "../styles/Pie.css";

/**
 * Componente principal de visualización de dietas
 * 
 * @returns {JSX.Element} Página completa con la dieta semanal
 */
function Dietas() {
    // ===== ESTADO =====
    
    /** @type {Object} Dieta agrupada por día */
    const [dietByDay, setDietByDay] = useState({});
    
    /** @type {boolean} Estado del loader */
    const [loading, setLoading] = useState(false);

    // ===== PROTECCIÓN DE SESIÓN =====
    
    /**
     * Redirige al login si no hay usuario logueado
     */
    useEffect(() => {
        if (!localStorage.getItem("usuario")) {
            window.location.href = "/login";
        }
    }, []);

    // ===== NAVEGACIÓN =====
    
    /**
     * Muestra el loader y redirige a otra página
     * 
     * @param {string} url - URL de destino
     */
    const showLoaderAndRedirect = (url) => {
        setLoading(true);
        setTimeout(() => (window.location.href = url), 700);
    };

    // ===== MENÚ DE USUARIO =====
    
    /**
     * Efecto 2: Configuración del menú desplegable de usuario
     * - Posiciona el menú en la esquina superior derecha
     * - Configura eventos de clic para abrir/cerrar menú
     * - Detecta clics fuera del menú para cerrarlo automáticamente
     * - Maneja el logout limpiando localStorage
     * - Redirige al perfil al hacer clic en foto de usuario
     * - Limpia event listeners al desmontar para evitar fugas de memoria
     */
    useEffect(() => {
        const btnPerfilView = document.getElementById("btnPerfilView");
        const menuDesplegable = document.getElementById("menuDesplegable");
        const logoutButton = document.getElementById("logoutButton");
        const fotoUsuario = document.getElementById("fotoUsuario");

        if (!btnPerfilView || !menuDesplegable) return;

        menuDesplegable.style.position = "absolute";
        menuDesplegable.style.top = "8%";
        menuDesplegable.style.right = "8%";
        menuDesplegable.style.display = "none";
        menuDesplegable.style.width = "10%";

        const toggleMenu = () => {
            menuDesplegable.style.display =
                menuDesplegable.style.display === "block" ? "none" : "block";
        };

        const closeMenu = (event) => {
            if (
                !btnPerfilView.contains(event.target) &&
                !menuDesplegable.contains(event.target) &&
                !fotoUsuario.contains(event.target)
            ) {
                menuDesplegable.style.display = "none";
            }
        };

        const logout = () => {
            localStorage.removeItem("usuario");
            showLoaderAndRedirect("/login");
        };

        btnPerfilView.addEventListener("click", toggleMenu);
        document.addEventListener("click", closeMenu);
        logoutButton?.addEventListener("click", logout);
        fotoUsuario?.addEventListener("click", () => showLoaderAndRedirect("/perfil"));

        return () => {
            btnPerfilView.removeEventListener("click", toggleMenu);
            document.removeEventListener("click", closeMenu);
            logoutButton?.removeEventListener("click", logout);
        };
    }, []);

    /**
     * Efecto 3: Mostrar nombre del usuario en el encabezado
     * - Recupera el usuario desde localStorage
     * - Parsea el JSON y extrae el nombre
     * - Actualiza el span con clase 'nameUser' en el DOM
     */
    useEffect(() => {
        const usuarioGuardado = localStorage.getItem("usuario");
        if (usuarioGuardado) {
            const usuario = JSON.parse(usuarioGuardado);
            const nameUserSpan = document.querySelector(".nameUser");
            if (nameUserSpan) nameUserSpan.textContent = usuario.name;
        }
    }, []);

    /**
     * Efecto 4: Cargar la dieta semanal desde el backend
     * - Obtiene el usuario de localStorage y valida id_diet
     * - Si no tiene dieta (id_diet=1), crea una nueva mediante /ensure-diet
     * - Llama a /get-diet para obtener todas las comidas de la semana
     * - Agrupa los datos por día y tipo de comida
     * - Actualiza el estado dietByDay con la estructura:
     *   { 1: { desayuno: [...], almuerzo: [...] }, 2: {...}, ... }
     */
    useEffect(() => {
        async function loadDiet() {
            try {
                const rawUser = localStorage.getItem("usuario");
                if (!rawUser) return;
                const user = JSON.parse(rawUser);

                // Asegurar id_diet válido
                if (!user.id_diet || user.id_diet === 1) {
                    const ensure = await fetch("http://localhost:3001/ensure-diet", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ user_id: user.id })
                    });
                    if (ensure.ok) {
                        const data = await ensure.json();
                        if (data?.id_diet) {
                            user.id_diet = data.id_diet;
                            localStorage.setItem("usuario", JSON.stringify(user));
                        }
                    }
                }

                const res = await fetch(`http://localhost:3001/get-diet?id_diet=${user.id_diet}`);
                if (!res.ok) return;
                const rows = await res.json(); // [{dia, tipo_comida, alimento}]

                const grouped = {};
                for (const { dia, tipo_comida, alimento } of rows) {
                    if (!grouped[dia]) grouped[dia] = {};
                    if (!grouped[dia][tipo_comida]) grouped[dia][tipo_comida] = [];
                    grouped[dia][tipo_comida].push(alimento);
                }
                setDietByDay(grouped);
            } catch (err) {
                console.error("Error cargando dieta:", err);
            }
        }
        loadDiet();
    }, []);

    // ===========================================
    // RENDER - Renderizado del componente
    // ===========================================
    return (
        <div id="contenedorPrincipal" className="dietas-page">
            <Encabezado activePage="dietas" onNavigate={showLoaderAndRedirect} />

            <main id="cuerpo" className="dietas-main">
                {/* Tabla de dieta semanal - 7 columnas (una por día) */}
                <div className="tabla-dieta">

                    {/* Generar columna para cada día de la semana */}
                    {["LUNES","MARTES","MIÉRCOLES","JUEVES","VIERNES","SÁBADO","DOMINGO"].map((diaNombre, i) => {
                        const diaNum = i + 1; // 1-7 (Lunes a Domingo)
                        const meals = dietByDay[diaNum] || {}; // Comidas de ese día
                        
                        // Orden de renderizado de las comidas del día
                        const order = ["breakfast","lunch","dinner","snack","snack2"];
                        const labels = {
                            breakfast:"DESAYUNO",
                            lunch:"ALMUERZO",
                            dinner:"CENA",
                            snack:"SNACK",
                            snack2:"SNACK 2"
                        };
                        
                        return (
                            <div className={`columna ${diaNombre.toLowerCase()}`} data-dia={diaNum} key={i}>
                                <div className="titulo">{diaNombre}</div>
                                <div className="celda">
                                    {/* Renderizar cada tipo de comida */}
                                    {order.map((tipo) => (
                                        <div key={tipo} className="bloque-comida">
                                            <div className="titulo-comida">{labels[tipo]}</div>
                                            {meals[tipo]?.length > 0 ? (
                                                <ul className="lista-comida">
                                                    {meals[tipo].map((al, idx) => <li key={idx}>{al}</li>)}
                                                </ul>
                                            ) : (
                                                <p className="lista-vacia">—</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Botón para editar la dieta */}
                <button
                    type="button"
                    id="BtnCrearCuenta"
                    onClick={() => showLoaderAndRedirect("/crear-dieta")}
                >
                    Editar Dieta
                </button>
            </main>

            <Pie />

            {/* Loader global */}
            <Loader visible={loading} />
        </div>
    );
}

// Exportar con HOC de autenticación
// requireAuth: true requiere que el usuario esté logueado
const DietasWithAuth = withAuth(Dietas, { requireAuth: true });
DietasWithAuth.displayName = 'DietasWithAuth';
export default DietasWithAuth;
