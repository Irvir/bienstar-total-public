import React, { useEffect, useState } from "react";
import "../styles/Home.css";
import Pie from "./Pie";
import Encabezado from "./Encabezado";
import Loader from "./Loader.jsx"; // Asegúrate que Loader esté importado correctamente
import withAuth from "../components/withAuth";

function Home() {
  const [userName, setUserName] = useState("Invitado");
  const [activePage, setActivePage] = useState("home");
  const [loading, setLoading] = useState(false); // Loader global

  // ===== Obtener usuario y página activa =====
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

    const currentPage = window.location.pathname.split("/").pop() || "home";
    setActivePage(currentPage.replace(".html", "").toLowerCase());
  }, []);

  // ===== Loader + redirección =====
  const showLoaderAndRedirect = (url) => {
    setLoading(true);
    setTimeout(() => {
      window.location.href = url;
    }, 700);
  };

  return (
    <div className="home-page">
      <div id="contenedorPrincipal">
        <Encabezado
          activePage={activePage}
          onNavigate={showLoaderAndRedirect} // pasa loader + redirección
        />

        <div id="cuerpo">
          <div className="botonera">
            <button
              className="btn1"
              onClick={() => showLoaderAndRedirect("CrearDieta.html")}
            ></button>
            <button
              className="btn2"
              onClick={() => showLoaderAndRedirect("dietas.html")}
            ></button>
            <button
              className="btn3"
              onClick={() => showLoaderAndRedirect("calendario.html")}
            ></button>
            <button
              className="btn4"
              onClick={() => showLoaderAndRedirect("alimentos.html")}
            ></button>
            <button
              className="btn5"
              onClick={() => showLoaderAndRedirect("tipsParaTuDieta.html")}
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

export default withAuth(Home, { requireAuth: false });
