import '../../styles/Calendario.css';
import React, { useEffect, useMemo, useState } from 'react';
import ContenedorInfoCalendario from './ContenedorInfoCalendario.jsx';
import WeightHistory from '../Perfil/WeightHistory';
import { API_BASE } from '../shared/apiBase';

const formatDate = (date) => {
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const ContenedorDias = ({ userId: userIdProp }) => {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [weightMap, setWeightMap] = useState({});
  const [localUserId, setLocalUserId] = useState(null);
  const [weightsLoading, setWeightsLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const fechaActual = new Date();
  const dia = fechaActual.getDate();
  const mes = fechaActual.getMonth() + 1;
  const ano = fechaActual.getFullYear();

  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const mesesAno = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const primerDiaMes = new Date(ano, mes - 1, 1).getDay();
  const diasEnMes = new Date(ano, mes, 0).getDate();

  const inicioDia = primerDiaMes === 0 ? 6 : primerDiaMes - 1;

  const dias = [];

  //Espacios en blanco antes del primer día del mes
  for(let i = 0; i < inicioDia; i++) {
    dias.push(<div key={`vacio-${i}`} className="diaVacio"></div>);
  }

  //Dias del mes
  for (let i = 1; i <= diasEnMes; i++) {
    const fechaDelDia = new Date(ano, mes - 1, i);
    const fechaClave = formatDate(fechaDelDia);
    const pesoDia = weightMap[fechaClave];
    dias.push(
      <div
        key={i}
        className={`dia ${i === dia ? 'hoy' : ''} ${pesoDia ? 'dia-con-peso' : ''}`}
        onClick={() => setFechaSeleccionada(fechaDelDia)}
      >
        <span className="dia-numero">{i}</span>
      </div>,
    );
  }


  const mesActualClave = useMemo(() => ({
    from: formatDate(new Date(ano, mes - 1, 1)),
    to: formatDate(new Date(ano, mes, 0)),
  }), [ano, mes]);
  const monthFrom = mesActualClave.from;
  const monthTo = mesActualClave.to;

  useEffect(() => {
    if (userIdProp) {
      setLocalUserId(null);
      return;
    }
    const raw = localStorage.getItem('usuario') || localStorage.getItem('Usuario');
    if (!raw) {
      setLocalUserId(null);
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      setLocalUserId(parsed?.id || parsed?._id || null);
    } catch (err) {
      console.warn('Error parseando usuario', err);
      setLocalUserId(null);
    }
  }, [userIdProp]);

  const userId = userIdProp || localUserId;

  useEffect(() => {
    if (!userId || !monthFrom || !monthTo) return;
    const controller = new AbortController();
    const fetchWeights = async () => {
      setWeightsLoading(true);
      try {
        const params = new URLSearchParams({
          from: monthFrom,
          to: monthTo,
          limit: String(diasEnMes + 5),
        });
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const res = await fetch(`${API_BASE}/user/${userId}/weights?${params.toString()}`, { signal: controller.signal, headers });
        if (!res.ok) throw new Error('No se pudo obtener el historial del mes');
        const data = await res.json();
        const map = {};
        (data.items || []).forEach((entry) => {
          map[entry.fecha] = entry.peso;
        });
        setWeightMap(map);
      } catch (err) {
        if (err.name !== 'AbortError') console.error(err);
      } finally {
        setWeightsLoading(false);
      }
    };
    fetchWeights();
    return () => controller.abort();
  }, [userId, monthFrom, monthTo, diasEnMes]);

  const handleWeightSaved = (fechaIso, peso) => {
    if (!fechaIso) return;
    setWeightMap(prev => ({ ...prev, [fechaIso]: peso }));
  };


  return (
    <div className="contenedor-calendario">
      <h2>{fechaActual.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}</h2>
      <div className="dias-semana">
        {diasSemana.map((dia) => (
          <div key={dia} className="celdaEncabezado">{dia}</div>
        ))}
      </div>
      <div className="grid-calendario">
        {dias}
      </div>
      {weightsLoading && <p className="cal-weight-hint">Cargando registros de peso…</p>}
      <div className="cal-history-toggle">
        <button
          type="button"
          className="cal-history-button"
          onClick={() => setHistoryOpen(true)}
          disabled={!userId}
        >
          Ver historial completo
        </button>
        {!userId && <small>Inicia sesión para consultar tu historial.</small>}
      </div>
      {fechaSeleccionada && (
        <ContenedorInfoCalendario
          fecha={fechaSeleccionada}
          pesoDelDia={weightMap[formatDate(fechaSeleccionada)]}
          onClose={() => setFechaSeleccionada(null)}
          onWeightSaved={handleWeightSaved}
        />
      )
      }
      {historyOpen && (
        <div className="ModalOverlay" onClick={() => setHistoryOpen(false)}>
          <div className="ModalContent" onClick={event => event.stopPropagation()}>
            <button className="CerrarModal" onClick={() => setHistoryOpen(false)}>×</button>
            {userId ? (
              <WeightHistory userId={userId} maxItems={90} />
            ) : (
              <p>Inicia sesión para ver tu historial de peso.</p>
            )}
          </div>
        </div>
      )}
    </div>

        

  );
};

export default ContenedorDias;
