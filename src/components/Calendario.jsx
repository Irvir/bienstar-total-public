import React from "react";
import '.././styles/Calendario.css';
import Encabezado from "./Encabezado";
import Pie from "./Pie";
import ContenedorDias from "./Calendario/ContenedorDias";
import ContenedorInfo from "./Calendario/ContenedorInfoCalendario";

const Calendario = function () {
  const showLoaderAndRedirect = (url) => {
    window.location.href = url;
  };

  return (
    <div>
      <Encabezado activePage="calendario" onNavigate={showLoaderAndRedirect} />
      <div className="Titulo">
            <h1>CALENDARIO</h1>
      </div>
        <ContenedorDias />
      
      <Pie />
    </div>
  );
}
export default Calendario;
