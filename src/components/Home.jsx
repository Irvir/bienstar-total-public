import React, { useEffect, useState, useMemo } from 'react';
import '../styles/Home.css';
import Pie from './Pie';
import Encabezado from './Encabezado';
import Loader from './Loader.jsx';
import withAuth from '../components/withAuth';
import '../styles/Pie.css';
import { API_BASE } from './shared/apiBase'; // <-- IMPORTANTE
const AverageProgressWidget = ({ weightStats }) => {
  if (!weightStats || !weightStats.ready) {
    return (
      <div className="average-progress-widget widget-loading">
        Cargando progreso de peso...
      </div>
    );
  }

  const {
    averageWeight,
    startWeight,
    currentWeight,
    changeType,
    motivationalMessage,
  } = weightStats;

  let changeClass = 'weight-change-neutral';
  if (changeType === 'loss') changeClass = 'weight-change-loss';
  if (changeType === 'gain') changeClass = 'weight-change-gain';

  return (
    <div className="average-progress-widget">
      <div className="widget-header">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="widget-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2a4 4 0 0 0-4 4v3h8V6a4 4 0 0 0-4-4z" />
          <path d="M16 9v13H8V9" />
          <path d="M6 21h12" />
          <circle cx="12" cy="14" r="1" />
        </svg>
        <h2 className="widget-title">PROGRESO DEL PESO</h2>
      </div>

      <div className="widget-content">
        <div className="weight-main-stats">
          <div className="stat-row">
            <span className="stat-label">Peso inicial</span>
            <span className="stat-value">
              {startWeight ? `${startWeight.toFixed(1)} kg` : '—'}
            </span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Peso actual</span>
            <span className="stat-value">
              {currentWeight ? `${currentWeight.toFixed(1)} kg` : '—'}
            </span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Promedio</span>
            <span className="stat-value">
              {averageWeight ? `${averageWeight.toFixed(1)} kg` : '—'}
            </span>
          </div>
        </div>

        <div className="weight-change-block">
          <div className={`weight-change-amount ${changeClass}`}>
            <div className="weight-change-icon-wrapper">
              {changeType === 'loss' && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="weight-change-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 19V5" />
                  <path d="M5 12l7-7 7 7" />
                </svg>
              )}
              {changeType === 'gain' && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="weight-change-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 5v14" />
                  <path d="M5 12l7 7 7-7" />
                </svg>
              )}
              {changeType === 'stable' && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="weight-change-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 12h16" />
                  <path d="M8 8h8" />
                  <path d="M8 16h8" />
                </svg>
              )}
            </div>

            <div className="weight-change-text">
              <span className="weight-change-label">
                {changeType === 'loss'
                  ? 'Pérdida total'
                  : changeType === 'gain'
                    ? 'Ganancia total'
                    : 'Cambio total'}
              </span>
              <span className="weight-change-value">
                {Number.isFinite(startWeight) && Number.isFinite(currentWeight)
                  ? (() => {
                    const diff = currentWeight - startWeight;
                    const sign = diff > 0 ? '+' : diff < 0 ? '-' : '';
                    return `${sign}${Math.abs(diff).toFixed(1)} kg`;
                  })()
                  : '— kg'}
              </span>
            </div>
          </div>

          <p className="weight-message">{motivationalMessage}</p>
        </div>
      </div>
    </div>
  );
};

// ==========================
// HOME
// ==========================
function Home() {
  const [_userName, setUserName] = useState('Invitado');
  const [activePage, setActivePage] = useState('home');
  const [loading, setLoading] = useState(false);
  const [dietByDay, setDietByDay] = useState({});

  const [weightStats, setWeightStats] = useState({
    ready: false,
    averageWeight: 0,
    startWeight: null,
    currentWeight: null,
    weightChange: 0,
    changeType: 'stable',
    motivationalMessage: '',
  });

  // Día actual (1 = lunes, 7 = domingo)
  const todayNum = useMemo(() => {
    const jsDay = new Date().getDay();
    if (jsDay === 0) return 7;
    return jsDay;
  }, []);

  const dayNames = [
    'LUNES',
    'MARTES',
    'MIÉRCOLES',
    'JUEVES',
    'VIERNES',
    'SÁBADO',
    'DOMINGO',
  ];
  const todayName = dayNames[todayNum - 1];

  useEffect(() => {
    // Leer usuario desde localStorage (soportando claves 'usuario' y 'Usuario')
    const raw = localStorage.getItem('usuario') || localStorage.getItem('Usuario');
    if (raw) {
      try {
        const usuario = JSON.parse(raw);
        if (usuario?.name) setUserName(usuario.name);
      } catch (e) {
        console.warn('Usuario inválido en localStorage', e);
      }
    }

    const currentPage = window.location.pathname.split('/').pop() || 'home';
    setActivePage(currentPage.replace('.html', '').toLowerCase());
  }, []);

  // Escuchar cambios globales en el usuario (por ejemplo: cuando calendario guarda un nuevo peso)
  useEffect(() => {
    const handler = (ev) => {
      try {
        const payload = ev?.detail;
        const usuario = payload?.usuario || null;
        // Si recibimos un usuario nuevo con peso, actualizar el widget
        if (usuario && usuario.peso !== undefined && usuario.peso !== null) {
          const pesoNum = Number(usuario.peso);
          if (!Number.isNaN(pesoNum)) {
            setWeightStats((prev) => {
              const start = prev.startWeight ?? pesoNum;
              const current = pesoNum;
              const change = parseFloat((start - current).toFixed(1));
              let changeType = 'stable';
              const absChange = Math.abs(change);
              if (absChange < 0.2) changeType = 'stable';
              else if (change > 0) changeType = 'loss';
              else changeType = 'gain';
              return {
                ...prev,
                ready: true,
                currentWeight: current,
                startWeight: start,
                weightChange: change,
                changeType,
                motivationalMessage: 'Peso actualizado desde Calendario',
              };
            });
          }
        }
        // si viene nombre nuevo
        if (usuario && usuario.name) setUserName(usuario.name);
      } catch (err) {
        console.warn('Error manejando evento usuario:updated en Home', err);
      }
    };
    window.addEventListener('usuario:updated', handler);
    // also listen to storage events (cross-tab)
    const storageHandler = (ev) => {
      if (ev.key === 'usuario' || ev.key === 'Usuario') {
        try {
          const usuario = JSON.parse(ev.newValue);
          if (usuario && usuario.peso !== undefined && usuario.peso !== null) {
            const pesoNum = Number(usuario.peso);
            if (!Number.isNaN(pesoNum)) {
              // reuse same update logic
              setWeightStats((prev) => {
                const start = prev.startWeight ?? pesoNum;
                const current = pesoNum;
                const change = parseFloat((start - current).toFixed(1));
                let changeType = 'stable';
                const absChange = Math.abs(change);
                if (absChange < 0.2) changeType = 'stable';
                else if (change > 0) changeType = 'loss';
                else changeType = 'gain';
                return {
                  ...prev,
                  ready: true,
                  currentWeight: current,
                  startWeight: start,
                  weightChange: change,
                  changeType,
                  motivationalMessage: 'Peso actualizado desde otra pestaña',
                };
              });
            }
          }
          if (usuario && usuario.name) setUserName(usuario.name);
        } catch { /* ignore */ }
      }
    };
    window.addEventListener('storage', storageHandler);
    return () => {
      window.removeEventListener('usuario:updated', handler);
      window.removeEventListener('storage', storageHandler);
    };
  }, []);

  const showLoaderAndRedirect = (url) => {
    setLoading(true);
    setTimeout(() => {
      window.location.href = url;
    }, 700);
  };

  const handleClick = (url, _mensaje) => {
    showLoaderAndRedirect(url);
  };

  // ==========================
  // CARGAR DIETA + HISTORIAL PESO
  // ==========================
  useEffect(() => {
    async function loadData() {
      try {
        // Leer usuario del localStorage (soportando 'usuario' y la key antigua 'Usuario')
        const rawUser = localStorage.getItem('usuario') || localStorage.getItem('Usuario');
        if (!rawUser) return;
        const user = JSON.parse(rawUser);

        const persistUsuario = (u) => {
          try {
            localStorage.setItem('usuario', JSON.stringify(u));
          } catch {
            /* ignore persist errors */
          }
        };

        const parseNum = (v) => {
          const n = Number(v);
          return Number.isFinite(n) ? n : null;
        };

        let startWeightFixed = parseNum(user?.peso_inicial);

        // Si el perfil del usuario tiene un peso registrado, mostrarlo provisionalmente
        // Esto permite que el widget muestre algo inmediato mientras cargamos el historial
        const perfilPesoNum = parseNum(user?.peso);
        if (perfilPesoNum !== null) {
          setWeightStats((prev) => ({
            ...prev,
            ready: true,
            averageWeight: perfilPesoNum,
            startWeight: startWeightFixed ?? perfilPesoNum,
            currentWeight: perfilPesoNum,
            weightChange: startWeightFixed !== null ? parseFloat(((startWeightFixed - perfilPesoNum) || 0).toFixed(1)) : 0,
            changeType: 'stable',
            motivationalMessage: 'Peso tomado del perfil de usuario.',
          }));
        }

        // --- asegurar dieta (igual que antes) ---
        if (
          (!user.id_dieta && !user.id_diet) ||
          user.id_diet === 1 ||
          user.id_dieta === 1
        ) {
          const ensure = await fetch(`${API_BASE}/ensure-diet`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email }),
          });
          if (ensure.ok) {
            const data = await ensure.json();
            const ensuredId = data?.id_dieta;
            if (ensuredId) {
              user.id_dieta = ensuredId;
              user.id_diet = ensuredId;
              localStorage.setItem('usuario', JSON.stringify(user));
            }
          }
        }

        const idParaConsulta = user.id_dieta || user.id_diet;
        if (idParaConsulta) {
          const res = await fetch(
            `${API_BASE}/get-diet?id_dieta=${idParaConsulta}`,
          );
          if (res.ok) {
            const rows = await res.json();
            const grouped = {};
            for (const { dia, tipo_comida, alimento } of rows) {
              if (!grouped[dia]) grouped[dia] = {};
              if (!grouped[dia][tipo_comida]) grouped[dia][tipo_comida] = [];
              grouped[dia][tipo_comida].push(alimento);
            }
            setDietByDay(grouped);
          }
        }

        // ===== HISTORIAL DE PESO (últimos 30 días) =====
        if (!user.id) return;

        const today = new Date();
        const toDate = today.toISOString().split('T')[0];
        const fromDateObj = new Date(today);
        fromDateObj.setDate(fromDateObj.getDate() - 29); // últimos 30 días incluyendo hoy
        const fromDate = fromDateObj.toISOString().split('T')[0];

        // 1) obtener registros del periodo (últimos 30 días)
        const periodRes = await fetch(
          `${API_BASE}/user/${user.id}/weights?from=${fromDate}&to=${toDate}&limit=100`,
        );
        if (!periodRes.ok) {
          setWeightStats((prev) => ({
            ...prev,
            ready: true,
            motivationalMessage:
              'No se pudieron obtener los registros de los últimos 30 días.',
          }));
          return;
        }
        const periodData = await periodRes.json();
        const periodItems = Array.isArray(periodData.items) ? periodData.items : [];

        // 2) obtener el último registro anterior al periodo para usar como "carry forward"
        const prevRes = await fetch(`${API_BASE}/user/${user.id}/weights?to=${fromDate}&limit=1`);
        let lastBefore = null;
        if (prevRes.ok) {
          const prevData = await prevRes.json().catch(() => ({}));
          const prevItems = Array.isArray(prevData.items) ? prevData.items : [];
          if (prevItems.length > 0) lastBefore = Number(prevItems[0].peso);
        }

        // construir mapa fecha -> peso (tomando el peso registrado para esa fecha)
        const map = {};
        periodItems.forEach((it) => {
          if (it && it.fecha) map[it.fecha] = Number(it.peso);
        });

        // generar array de 30 días y rellenar por última observación conocida
        const dayWeights = [];
        let carry = lastBefore; // peso conocido antes del periodo
        for (let i = 0; i < 30; i++) {
          const d = new Date(fromDateObj);
          d.setDate(fromDateObj.getDate() + i);
          const key = d.toISOString().split('T')[0];
          if (Object.prototype.hasOwnProperty.call(map, key) && map[key] !== undefined && !Number.isNaN(map[key])) {
            carry = map[key];
            dayWeights.push(carry);
          } else {
            // si no hay registro ese día, tomar el último modificado
            dayWeights.push(carry === null ? null : carry);
          }
        }

        // si no hay ningún peso disponible (ni previo ni en periodo)
        const anyWeight = dayWeights.find((w) => w !== null && w !== undefined);
        if (!anyWeight) {
          if (perfilPesoNum !== null) {
            if (startWeightFixed === null) {
              startWeightFixed = perfilPesoNum;
              user.peso_inicial = startWeightFixed;
              persistUsuario(user);
            }
            setWeightStats({
              ready: true,
              averageWeight: perfilPesoNum,
              startWeight: startWeightFixed,
              currentWeight: perfilPesoNum,
              weightChange: parseFloat(((startWeightFixed - perfilPesoNum) || 0).toFixed(1)),
              changeType: 'stable',
              motivationalMessage: 'Mostrando el peso de tu perfil como referencia. Registra tu peso para ver el progreso.',
            });
          } else {
            setWeightStats({
              ready: true,
              averageWeight: 0,
              startWeight: null,
              currentWeight: null,
              weightChange: 0,
              changeType: 'stable',
              motivationalMessage: 'Aún no tienes registros de peso en los últimos 30 días.',
            });
          }
          return;
        }

        // calcular promedio de los últimos 30 días (solo considerando valores numéricos)
        const numeric = dayWeights.filter((w) => w !== null && w !== undefined);
        const total = numeric.reduce((s, v) => s + v, 0);
        const averageWeight = total / numeric.length;

        // peso actual = último día del periodo (hoy) o el último carry
        const currentWeight = dayWeights[dayWeights.length - 1] ?? carry;

        // peso inicial: intentar obtener el primer registro histórico del usuario (primer día que se creó la cuenta)
        // pedimos hasta 180 registros y tomamos el de fecha mínima
        let startWeight = null;
        try {
          const allRes = await fetch(`${API_BASE}/user/${user.id}/weights?limit=180`);
          if (allRes.ok) {
            const allData = await allRes.json().catch(() => ({}));
            const allItems = Array.isArray(allData.items) ? allData.items : [];
            if (allItems.length > 0) {
              // encontrar el item con fecha mínima
              const earliest = [...allItems].reduce((acc, it) => {
                if (!acc) return it;
                return new Date(it.fecha) < new Date(acc.fecha) ? it : acc;
              }, null);
              if (earliest && earliest.peso !== undefined) startWeight = Number(earliest.peso);
            }
          }
        } catch {
          // ignore
        }

        // fallback: si no encontramos startWeight, usar el primer valor no nulo del periodo (primera observación en 30 días)
        if (startWeight === null) {
          for (const w of dayWeights) {
            if (w !== null && w !== undefined) {
              startWeight = w;
              break;
            }
          }
        }

        // Fijar peso inicial estable: prioridad a user.peso_inicial, luego earliest log, luego primer valor del periodo, y persistir si no existe
        if (startWeightFixed === null) {
          if (Number.isFinite(startWeight)) {
            startWeightFixed = startWeight;
          } else {
            startWeightFixed = startWeight; // puede seguir siendo null si no hay nada
          }
          if (startWeightFixed === null) {
            // fallback a primer no nulo en 30 días (ya calculado antes)
            for (const w of dayWeights) {
              if (w !== null && w !== undefined) {
                startWeightFixed = w;
                break;
              }
            }
          }
          if (Number.isFinite(startWeightFixed)) {
            user.peso_inicial = startWeightFixed;
            persistUsuario(user);
          }
        }

        const startForWidget = Number.isFinite(startWeightFixed) ? startWeightFixed : startWeight;
        const rawChange = (Number.isFinite(startForWidget) && Number.isFinite(currentWeight))
          ? (startForWidget - currentWeight)
          : 0; // positivo = perdió peso
        const weightChange = parseFloat((rawChange || 0).toFixed(1));

        let changeType = 'stable';
        const absChange = Math.abs(weightChange);
        let motivationalMessage = '';
        if (absChange < 0.2) {
          changeType = 'stable';
          motivationalMessage = 'Tu peso se ha mantenido bastante estable. La consistencia también es progreso.';
        } else if (weightChange > 0) {
          changeType = 'loss';
          motivationalMessage = `Has perdido ${absChange.toFixed(1)} kg.`;
        } else {
          changeType = 'gain';
          motivationalMessage = `Tu peso cambió ${absChange.toFixed(1)} kg.`;
        }

        setWeightStats({
          ready: true,
          averageWeight,
          startWeight: startForWidget ?? null,
          currentWeight,
          weightChange,
          changeType,
          motivationalMessage,
        });
      } catch (err) {
        console.error('Error cargando datos en Home:', err);
        setWeightStats({
          ready: true,
          averageWeight: 0,
          startWeight: null,
          currentWeight: null,
          weightChange: 0,
          changeType: 'stable',
          motivationalMessage:
            'No se pudo cargar tu progreso de peso. Intenta más tarde.',
        });
      }
    }
    loadData();
  }, []);

  const order = ['breakfast', 'lunch', 'dinner', 'snack', 'snack2'];
  const labels = {
    breakfast: 'DESAYUNO',
    lunch: 'ALMUERZO',
    dinner: 'CENA',
    snack: 'SNACK',
    snack2: 'SNACK 2',
  };

  const todaysMeals = dietByDay[todayNum] || {};

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
                handleClick('Alimentos.html', 'Informacion sobre alimentos')
              }
            ></button>
            <button
              className="btn2"
              onClick={() =>
                handleClick('dietas.html', 'Revisando tus dietas')
              }
            ></button>
            <button
              className="btn3"
              onClick={() =>
                handleClick('calendario.html', 'Abriendo tu calendario')
              }
            ></button>
            <button
              className="btn4"
              onClick={() =>
                handleClick(
                  'AcercaDeNosotros.html',
                  'Información acerca de nosotros',
                )
              }
            ></button>
            <button
              className="btn5"
              onClick={() =>
                handleClick(
                  'tipsParaTuDieta.html',
                  'Consejos para tu dieta',
                )
              }
            ></button>

            {/* WIDGET DE PROGRESO DE PESO - Reemplaza al botón 6 */}
            <AverageProgressWidget weightStats={weightStats} />
          </div>

          {/* Columna dieta hoy */}
          <div className="botonera2-dieta-hoy">
            <div className="columna columna-hoy">
              <div className="titulo">{todayName} - Hoy</div>
              <div className="celda">
                {order.map((tipo) => (
                  <div key={tipo} className="bloque-comida">
                    <div className="titulo-comida">{labels[tipo]}</div>
                    {todaysMeals[tipo]?.length > 0 ? (
                      <ul className="lista-comida">
                        {todaysMeals[tipo].map((al, idx) => (
                          <li key={idx}>{al}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="lista-vacia">—</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Pie />
      </div>

      <Loader visible={loading} />
    </div>
  );
}

export default withAuth(Home, { requireAuth: false });