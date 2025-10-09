import React, { useEffect } from "react";
import "../styles/Dietas.css";
import withAuth from "../components/withAuth";

import Encabezado from "./Encabezado";
import Pie from "./Pie";

const Dietas = () => {
    // ======= Redirección si no hay usuario =======
    useEffect(() => {
        try {
            if (!localStorage.getItem("usuario")) {
                window.location.href = "login.html";
            }
        } catch (e) {
            window.location.href = "login.html";
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

                    {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map(
                        (dia, i) => (
                            <div className={`columna ${dia.toLowerCase()}`} data-dia={i + 1} key={i}>
                                <div className="titulo">{dia}</div>
                                <div className="celda"></div>
                            </div>
                        )
                    )}
                </div>

                <button
                    type="button"
                    id="BtnCrearCuenta"
                    onClick={() => (window.location.href = "CrearDieta.html")}
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

export default withAuth(Dietas, false);