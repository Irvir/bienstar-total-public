import React, { useEffect, useState } from "react";
import "../styles/Home.css";
import Pie from "./Pie";
import Encabezado from "./Encabezado";
import Loader from "./Loader.jsx";
import withAuth from "../components/withAuth";

function Home() {
  const [userName, setUserName] = useState("Invitado");
  const [activePage, setActivePage] = useState("home");
  const [loading, setLoading] = useState(false);

  // Obtener usuario y página activa
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


  // Loader + redirección
  const showLoaderAndRedirect = (url) => {
    setLoading(true);
    setTimeout(() => {
      window.location.href = url;
    }, 700);
  };

  // Notificación + redirección
  const handleClick = (url, mensaje) => {
    if (window.notify) {
      window.notify(mensaje, { type: "info", duration: 3000 });
    }
    showLoaderAndRedirect(url);
  };

  return (
    <div className="home-page">
      <div id="contenedorPrincipal">
        <Encabezado
          activePage={activePage}
          onNavigate={showLoaderAndRedirect}
        />

        <div id="cuerpo">
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

      <Loader visible={loading} />
    </div>
  );
}

export default withAuth(Home, { requireAuth: false });