import React, { useEffect, useState } from "react";
import "../styles/Base.css";
import "../styles/Dietas.css";
import withAuth from "../components/withAuth";

import Encabezado from "./Encabezado";
import Pie from "./Pie";
import Loader from "./Loader.jsx"; // Asegúrate que Loader esté importado correctamente

const Dietas = () => {
  const [dietByDay, setDietByDay] = useState({});
  const [activePage, setActivePage] = useState("dietas");
  const [loading, setLoading] = useState(false); // 👈 Loader global

  // ===== Redirección si no hay usuario =====
  useEffect(() => {
    if (!localStorage.getItem("usuario")) window.location.href = "/login";
  }, []);

  // ===== Mostrar nombre del usuario y botones =====
  useEffect(() => {
    const currentPage = window.location.pathname.split("/").pop() || "dietas";
    setActivePage(currentPage.replace(".html", "").toLowerCase());
  }, []);

  // ===== Loader + redirección =====
  const showLoaderAndRedirect = (url) => {
    setLoading(true);
    setTimeout(() => (window.location.href = url), 700);
  };

  // ===== Cargar dieta =====
  useEffect(() => {
    async function loadDiet() {
      try {
        const rawUser = localStorage.getItem("usuario");
        if (!rawUser) return;
        const user = JSON.parse(rawUser);

        if (!user.id_diet || user.id_diet === 1) {
          const ensure = await fetch("http://localhost:3001/ensure-diet", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: user.id }),
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
        const rows = await res.json();

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

  return (
    <div id="contenedorPrincipal" className="dietas-page">
      <Encabezado
        activePage={activePage}
        onNavigate={showLoaderAndRedirect} // 👈 Pasamos función al encabezado
      />

      <main id="cuerpo">
        <div className="tabla-dieta">
          <div className="columna-horario">
            <div className="titulo">Días</div>
            <div className="celda">Horario</div>
          </div>

          {["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"].map((diaNombre,i)=>{
            const diaNum = i + 1;
            const meals = dietByDay[diaNum] || {};
            const order = ["breakfast","lunch","dinner","snack","snack2"];
            const labels = {
              breakfast:"Desayuno",
              lunch:"Almuerzo",
              dinner:"Cena",
              snack:"Snack",
              snack2:"Snack 2"
            };

            return (
              <div className={`columna ${diaNombre.toLowerCase()}`} data-dia={diaNum} key={i}>
                <div className="titulo">{diaNombre}</div>
                <div className="celda">
                  {order.map((tipo) => (
                    <div key={tipo} className="bloque-comida">
                      <strong>{labels[tipo]}:</strong>
                      {meals[tipo]?.length > 0 ? (
                        <ul className="lista-comida">
                          {meals[tipo].map((al, idx) => <li key={idx}>{al}</li>)}
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
};

export default withAuth(Dietas, { requireAuth: true });
