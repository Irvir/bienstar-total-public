// Calendario.jsx
import React, { useEffect, useState } from 'react';
import '.././styles/Calendario.css';
import Encabezado from './Encabezado';
import Pie from './Pie';
import ContenedorDias from './Calendario/ContenedorDias';
import WeightGraph from './Calendario/WeightGraph';

const Calendario = function () {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem('usuario') || localStorage.getItem('Usuario');
    if (!raw) {
      setUserId(null);
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      setUserId(parsed?.id || parsed?._id || null);
    } catch (err) {
      console.warn('Calendario: usuario inválido en localStorage', err);
      setUserId(null);
    }
  }, []);

  const showLoaderAndRedirect = (url) => {
    window.location.href = url;
  };

  return (
    <div className="cal-screen">
      <Encabezado activePage="calendario" onNavigate={showLoaderAndRedirect} />

      {/* Título centrado, sin grid aquí */}
      <div className="Titulo">
        <h1>CALENDARIO</h1>
      </div>

      {/* Layout principal: calendario + gráfica */}
      <div className="cal-layout">
        <div className="cal-layout-calendar">
          <ContenedorDias userId={userId} />
        </div>

        <div className="cal-layout-graph">
          <WeightGraph userId={userId} />
        </div>
      </div>

      <Pie />
    </div>
  );
};

export default Calendario;
