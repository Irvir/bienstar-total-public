import React, { useEffect, useState } from "react";
import { API_BASE } from "../shared/apiBase";
import "../styles/Dietas.css";
import withAuth from "../components/withAuth";

import Encabezado from "./Encabezado";
import Pie from "./Pie";
import Loader from "./Loader.jsx"; // Loader global
import "../styles/Pie.css"; // estilos del pie de página

function Dietas() {
    const [dietByDay, setDietByDay] = useState({});
    const [loading, setLoading] = useState(false);

    // ===== Redirección si no hay usuario =====
    useEffect(() => {
        if (!localStorage.getItem("usuario")) window.location.href = "/login";
    }, []);

    // ===== Loader + redirección =====
    const showLoaderAndRedirect = (url) => {
        setLoading(true);
        setTimeout(() => (window.location.href = url), 700);
    };

    // ===== Mostrar nombre del usuario y menú desplegable =====
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

    // ===== Mostrar nombre del usuario =====
    useEffect(() => {
        const usuarioGuardado = localStorage.getItem("usuario");
        if (usuarioGuardado) {
            const usuario = JSON.parse(usuarioGuardado);
            const nameUserSpan = document.querySelector(".nameUser");
            if (nameUserSpan) nameUserSpan.textContent = usuario.name;
        }
    }, []);

    // ===== Cargar dieta desde backend =====
    useEffect(() => {
        async function loadDiet() {
            try {
                const rawUser = localStorage.getItem("usuario");
                if (!rawUser) return;
                const user = JSON.parse(rawUser);

                // Asegurar id_diet válido
                if (!user.id_diet || user.id_diet === 1) {
                    const ensure = await fetch(`${API_BASE}/ensure-diet`, {
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

                const res = await fetch(`${API_BASE}/get-diet?id_diet=${user.id_diet}`);
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

    // ===== Render =====
    return (
        <div id="contenedorPrincipal" className="dietas-page">
            <Encabezado activePage="dietas" onNavigate={showLoaderAndRedirect} />

            <main id="cuerpo" className="dietas-main">
                <div className="tabla-dieta">
                

                    {["LUNES","MARTES","MIÉRCOLES","JUEVES","VIERNES","SÁBADO","DOMINGO"].map((diaNombre, i) => {
                        const diaNum = i + 1;
                        const meals = dietByDay[diaNum] || {};
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

export default withAuth(Dietas, { requireAuth: true });
