import React, { useEffect, useState } from "react";
import "../styles/Dietas.css";
import withAuth from "../components/withAuth";

import Encabezado from "./Encabezado";
import Pie from "./Pie";

const Dietas = () => {
    // Estructura en memoria de la dieta agrupada por día y tipo de comida
    // Ej: { 1: { Desayuno:["Platano"], lunch:[...], ... }, 2: {...}, ... }
    const [dietByDay, setDietByDay] = useState({});

    // ======= Redirección si no hay usuario =======
    useEffect(() => {
        try {
            if (!localStorage.getItem("usuario")) {
                window.location.href = "/login";
            }
        } catch (e) {
            window.location.href = "/login";
        }
    }, []);

    // ======= Menú usuario y logout =======
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
            window.location.href = "login.html";
        };

        btnPerfilView.addEventListener("click", toggleMenu);
        document.addEventListener("click", closeMenu);
        logoutButton?.addEventListener("click", logout);
        fotoUsuario?.addEventListener("click", () => {
            window.location.href = "login.html";
        });

        return () => {
            btnPerfilView.removeEventListener("click", toggleMenu);
            document.removeEventListener("click", closeMenu);
            logoutButton?.removeEventListener("click", logout);
        };
    }, []);

    // ======= Mostrar nombre del usuario =======
    useEffect(() => {
        const usuarioGuardado = localStorage.getItem("usuario");
        if (usuarioGuardado) {
            const usuario = JSON.parse(usuarioGuardado);
            const nameUserSpan = document.querySelector(".nameUser");
            if (nameUserSpan) nameUserSpan.textContent = usuario.name;
        }
    }, []);

    // ======= Marcar botón activo según página =======
    useEffect(() => {
        const currentPage = window.location.pathname.split("/").pop();
        const btnInicio = document.querySelector("button[onclick*='index.html']");
        const btnAlimentos = document.querySelector("button[onclick*='alimentos.html']");
        const btnDietas = document.querySelector("button[onclick*='dietas.html']");

        [btnInicio, btnAlimentos, btnDietas].forEach((btn) => {
            btn?.classList.remove("btnMenuSelec");
            btn?.classList.add("btnMenu");
        });

        if (currentPage === "index.html") btnInicio?.classList.add("btnMenuSelec");
        else if (currentPage === "alimentos.html") btnAlimentos?.classList.add("btnMenuSelec");
        else if (currentPage === "dietas.html") btnDietas?.classList.add("btnMenuSelec");
    }, []);

    // ======= Cargar dieta desde backend =======
    // Cambio clave: Ahora se traen los  datos guardados po el CRUD de "Crear Dieta".
    useEffect(() => {
        async function loadDiet() {
            try {
                const rawUser = localStorage.getItem("usuario");
                if (!rawUser) return;
                const user = JSON.parse(rawUser);

                // Asegurar id_diet válido opcionalmente (se puede omitir si ya existe)
                if (!user.id_diet || user.id_diet === 1) {
                    try {
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
                    } catch { /* no-op */ }
                }

                const res = await fetch(`http://localhost:3001/get-diet?id_diet=${user.id_diet}`);
                if (!res.ok) return;
                const rows = await res.json(); // [{dia, tipo_comida, alimento}]

                // Agrupar por día -> tipo_comida -> lista de alimentos
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

    // ======= Render =======
    return (
        <div id="contenedorPrincipal" className="dietas-page">
            
                <Encabezado activePage="dietas" />
                
            {/* ================= CUERPO ================= */}
            <main id="cuerpo">
                <div className="tabla-dieta">
                    <div className="columna-horario">
                        <div className="titulo">Días</div>
                        <div className="celda">Horario</div>
                    </div>

                    {(["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]).map((diaNombre, i) => {
                        const diaNum = i + 1;
                        const meals = dietByDay[diaNum] || {};
                        // Orden de presentación por tipo de comida
                        const order = ["breakfast", "lunch", "dinner", "snack", "snack2"];
                        // Etiquetas en español
                        const labels = {
                            breakfast: "Desayuno",
                            lunch: "Almuerzo",
                            dinner: "Cena",
                            snack: "Snack",
                            snack2: "Snack 2"
                        };
                        return (
                            <div className={`columna ${diaNombre.toLowerCase()}`} data-dia={diaNum} key={i}>
                                <div className="titulo">{diaNombre}</div>
                                <div className="celda">
                                    {order.map((tipo) => (
                                        <div key={tipo} className="bloque-comida">
                                            <strong>{labels[tipo]}:</strong>
                                            {(meals[tipo] && meals[tipo].length > 0) ? (
                                                <ul className="lista-comida">
                                                    {meals[tipo].map((al, idx) => (
                                                        <li key={idx}>{al}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="lista-vacia"></p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <button
                    type="button"
                    id="BtnCrearCuenta"
                    // Navegación SPA a la pantalla de edición en vez de HTML estático
                    onClick={() => (window.location.href = "/crear-dieta")}
                >
                    Editar Dieta
                </button>
            </main>

            {/* ================= PIE ================= */}
            <Pie></Pie>

            {/* Loader */}
            <div id="loader">
                <span className="loader-text">Cargando</span>
                <div className="loader-dots"></div>
            </div>
        </div>
    );
};

export default withAuth(Dietas, { requireAuth: true });