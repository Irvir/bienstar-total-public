import React, { useCallback, useEffect, useMemo, useState } from 'react';
import '../styles/CrearDieta.css';
import withAuth from '../components/withAuth';
import Encabezado from './Encabezado';
import { API_BASE } from './shared/apiBase';
import Pie from './Pie';
import CrearDietaForm from './CrearDieta/CrearDietaForm';
import Loader from './Loader.jsx'; // Loader global

function CrearDieta() {
  const traducciones = {
    breakfast: 'Desayuno',
    lunch: 'Almuerzo',
    dinner: 'Cena',
    snack: 'Snack',
    snack2: 'Snack 2',
  };

  const [usuario, setUsuario] = useState(null);
  const [alimentos, setAlimentos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [diaSeleccionado, setDiaSeleccionado] = useState(1);
  const [dietaAgrupada, setDietaAgrupada] = useState({});
  const [loading, setLoading] = useState(false);
  const [editingDietId, setEditingDietId] = useState(null);
  const [targetName, setTargetName] = useState(null);
  const [dietTarget, setDietTarget] = useState(() => {
    try {
      const raw = localStorage.getItem('dietTarget');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const updateDietTarget = useCallback((nextValue) => {
    setDietTarget(prev => {
      const resolved = typeof nextValue === 'function' ? nextValue(prev) : nextValue;
      if (!resolved) {
        localStorage.removeItem('dietTarget');
        return null;
      }
      localStorage.setItem('dietTarget', JSON.stringify(resolved));
      return resolved;
    });
  }, []);

  // ================== SESIÓN ==================
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (!usuarioGuardado) {
      window.location.href = '/login';
      return;
    }
    const user = JSON.parse(usuarioGuardado);
    setUsuario(user);

    const nameUserSpan = document.querySelector('.nameUser');
    if (nameUserSpan) {
      const display = user.nombre || user.name || user.email || 'Usuario';
      nameUserSpan.textContent = display;
    }

    const fotoUsuario = document.getElementById('fotoUsuario');
    if (fotoUsuario) {
      fotoUsuario.addEventListener('click', () => navigateWithLoader('/perfil'));
    }
  }, []);

  // Inicializar nombre mostrado si hay dietTarget
  useEffect(() => {
    if (dietTarget?.email) {
      setTargetName(dietTarget?.nombre || dietTarget.email);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ================== NAVEGACIÓN CON LOADER ==================
  const navigateWithLoader = (url) => {
    setLoading(true);
    setTimeout(() => (window.location.href = url), 700);
  };

  // ================== BUSCAR ALIMENTOS ==================
  async function buscarAlimentos(query = '') {
    setLoading(true);
    const encodedQuery = encodeURIComponent(query || '');
    const endpoints = [
      `${API_BASE}/food-search?q=${encodedQuery}`,
      query ? `${API_BASE}/api/alimentos?q=${encodedQuery}` : `${API_BASE}/api/alimentos`,
    ];
    let lastError = null;
    try {
      const tryEndpoint = async (url) => {
        try {
          const res = await fetch(url);
          if (!res.ok) {
            lastError = `${url} -> ${res.status}`;
            return null;
          }
          const data = await res.json();
          if (Array.isArray(data)) return data;
          lastError = `${url} -> respuesta no válida`;
          return null;
        } catch (inner) {
          lastError = inner?.message || String(inner);
          return null;
        }
      };

      const firstAttempt = await tryEndpoint(endpoints[0]);
      if (firstAttempt) return firstAttempt;

      const secondAttempt = await tryEndpoint(endpoints[1]);
      if (secondAttempt) return secondAttempt;

      if (lastError) {
        console.error('Error al buscar alimentos:', lastError);
        window.notify?.('No se pudo cargar la lista de alimentos. Intenta nuevamente en unos segundos.', { type: 'error' });
      }
      return [];
    } finally {
      setLoading(false);
    }
  }

  const loggedUserName = useMemo(() => {
    if (!usuario) return 'Invitado';
    return usuario.nombre || usuario.name || usuario.email || 'Invitado';
  }, [usuario]);

  const pacienteDisplayName = useMemo(() => {
    if (!usuario) return 'Invitado';
    if (usuario.id_perfil === 3) {
      return targetName || dietTarget?.nombre || dietTarget?.email || 'Paciente sin seleccionar';
    }
    return loggedUserName;
  }, [usuario, targetName, dietTarget, loggedUserName]);

  useEffect(() => {
    (async () => {
      const iniciales = await buscarAlimentos('');
      setAlimentos(iniciales);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const resultados = await buscarAlimentos(filtro);
      setAlimentos(resultados);
    })();
  }, [filtro]);

  // ================== DIETA DEL DÍA ==================
  const cargarDietaDelDia = useCallback(async () => {
    if (!usuario) return;
    setLoading(true);
    try {
      const isDoctor = !!usuario?.id_perfil && usuario.id_perfil === 3;
      const idDiet = editingDietId ?? (isDoctor ? dietTarget?.id_dieta : null) ?? usuario.id_dieta ?? usuario.id_diet;
      if (!idDiet) throw new Error('Sin id_dieta para cargar');
      const res = await fetch(`${API_BASE}/get-diet?id_dieta=${idDiet}`);
      if (!res.ok) throw new Error('No se pudo cargar la dieta');

      const dieta = await res.json();
      const agrupada = {};
      dieta.forEach(({ dia: d, tipo_comida, alimento }) => {
        if (!agrupada[d]) agrupada[d] = {};
        if (!agrupada[d][tipo_comida]) agrupada[d][tipo_comida] = [];
        agrupada[d][tipo_comida].push(alimento);
      });

      setDietaAgrupada(agrupada);
    } catch (err) {
      console.error('Error al cargar dieta:', err);
    } finally {
      setLoading(false);
    }
  }, [usuario, editingDietId, dietTarget]);

  useEffect(() => {
    if (usuario && (editingDietId || usuario.id_dieta || usuario.id_diet)) cargarDietaDelDia();
  }, [usuario, editingDietId, cargarDietaDelDia]);

  // Determinar id de dieta objetivo (doctor puede editar la de otro usuario)
  useEffect(() => {
    (async () => {
      if (!usuario) return;
      // Si es doctor y hay target por email, asegurar su id_dieta
      if (usuario.id_perfil === 3 && dietTarget?.email) {
        // Si ya tenemos id_dieta del target desde Dietas, úsalo inmediatamente
        if (dietTarget?.id_dieta && !editingDietId) {
          setEditingDietId(dietTarget.id_dieta);
        }
        try {
          const ensured = await fetch(`${API_BASE}/ensure-diet`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: dietTarget.email }),
          });
          const data = await ensured.json().catch(() => ({}));
          if (ensured.ok && data?.id_dieta) {
            setEditingDietId(data.id_dieta);
            // guardar id actualizado
            localStorage.setItem('dietTarget', JSON.stringify({ ...dietTarget, id_dieta: data.id_dieta }));
            // Si no tenemos nombre del paciente, intentar resolverlo desde /admin/users
            if (!dietTarget?.nombre) {
              try {
                const usersRes = await fetch(`${API_BASE}/admin/users`);
                if (usersRes.ok) {
                  const users = await usersRes.json();
                  const target = (Array.isArray(users) ? users : []).find(u => (u.email || '').toLowerCase() === dietTarget.email.toLowerCase());
                  const nombrePaciente = target ? (target.nombre || target.name) : null;
                  if (nombrePaciente) {
                    setTargetName(nombrePaciente);
                    localStorage.setItem('dietTarget', JSON.stringify({ ...dietTarget, id_dieta: data.id_dieta, nombre: nombrePaciente }));
                  }
                }
              } catch (e) {
                console.warn('No se pudo obtener nombre del paciente en CrearDieta:', e);
              }
            }
            return;
          }
        } catch (e) {
          console.warn('No se pudo asegurar dieta del target:', e);
        }
      }
      // Fallback: su propia dieta
      if (!editingDietId) setEditingDietId(usuario.id_dieta ?? usuario.id_diet);
    })();

  }, [usuario]);

  // ================== AGREGAR / ELIMINAR ==================
  async function agregarAlimento(id, nombre, tipoComida) {
    const isDoctor = !!usuario?.id_perfil && usuario.id_perfil === 3;
    const id_dieta = editingDietId ?? (isDoctor ? dietTarget?.id_dieta : null) ?? usuario?.id_dieta ?? usuario?.id_diet ?? 1;
    
    const comidasDelDia = dietaAgrupada[diaSeleccionado]?.[tipoComida] || [];
    const yaExiste = comidasDelDia.some(alimentoExistente => {
      if (typeof alimentoExistente === 'string') {
        return alimentoExistente.toLowerCase() === nombre.toLowerCase();
      } else if (alimentoExistente?.id) {
        return alimentoExistente.id === id;
      } else if (alimentoExistente?.name) {
        return alimentoExistente.name.toLowerCase() === nombre.toLowerCase();
      }
      return false;
    });
    
    if (yaExiste) {
      window.notify?.(`❌ ${nombre} ya está agregado en ${traducciones[tipoComida]} del Día ${diaSeleccionado}`, { type: 'error' });
      return; // 🚫 No sigue, evita duplicado
    }
    
    // --- Guardado si no existe ---
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/save-diet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_dieta, comidas: [{ id, name, dia: diaSeleccionado, tipoComida }] }),
      });
      const result = await res.json();
    
      if (res.ok) {
        if (result.alreadyExists) {
          window.notify?.(`⚠️ ${nombre} ya está en tu dieta`, { type: 'warning' });
        } else {
          window.notify?.(`✅ ${nombre} agregado (Día ${diaSeleccionado}, ${traducciones[tipoComida]})`, { type: 'success' });
        }
        await cargarDietaDelDia();
      } else {
        window.notify?.(result.message || 'Error al guardar alimento', { type: 'error' });
      }
    } catch (e) {
      console.error(e);
      window.notify?.('Error de conexión', { type: 'error' });
    } finally {
      setLoading(false);
    }
  }
    

  async function eliminarAlimento(id, tipoComida) {
    const isDoctor = !!usuario?.id_perfil && usuario.id_perfil === 3;
    const id_diet = editingDietId ?? (isDoctor ? dietTarget?.id_dieta : null) ?? usuario?.id_dieta ?? usuario?.id_diet ?? 1;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/delete-diet-item`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_diet, id_food: id, dia: diaSeleccionado, tipoComida }),
      });
      if (res.ok) {
        window.notify?.('Alimento eliminado', { type: 'success' });
        await cargarDietaDelDia();
      } else {
        window.notify?.('Error al eliminar alimento', { type: 'error' });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function borrarDietaDelDia() {
    const isDoctor = !!usuario?.id_perfil && usuario.id_perfil === 3;
    const id_diet = editingDietId ?? (isDoctor ? dietTarget?.id_dieta : null) ?? usuario?.id_dieta ?? usuario?.id_diet ?? 1;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/clear-day`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_diet, dia: diaSeleccionado }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        window.notify?.(result.message || 'Día borrado correctamente', { type: 'success' });
        await cargarDietaDelDia();
      } else {
        window.notify?.(result.message || 'Error al borrar la dieta del día', { type: 'error' });
      }
    } catch (e) {
      console.error('Error al borrar dieta:', e);
      window.notify?.('Error de conexión con el servidor', { type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  // ================== FUNCIÓN PARA RESALTAR NUTRIENTES ==================
  // Parsear número desde diferentes formatos ("41 kcal", "-", null, "0,5")
  const parseNumber = (v) => {
    if (v === null || v === undefined || v === '') return 0;
    if (typeof v === 'number') return v;
    const s = String(v).replace(/,/g, '.');
    const m = s.match(/-?\d+(?:\.\d+)?/);
    return m ? parseFloat(m[0]) : 0;
  };

  // Normaliza un objeto alimento a campos canónicos usados por la UI
  const normalizeAlimento = (al) => {
    if (!al) return {};
    const caloriesRaw = al.Energia ?? al.Energía ?? al.energia ?? al.calories ?? al.Calories ?? al.kcal ?? null;
    const calories = parseNumber(caloriesRaw) || null;

    return {
      // mantener referencias a los campos originales por compatibilidad
      ...al,
      // campos canónicos
      calories: calories !== null ? calories : (al.calories ?? null),
      proteinas: parseNumber(al.Proteinas ?? al.Proteínas ?? al.protein ?? al.Proteina) || null,
      carbohidratos_disp: parseNumber(al.H_de_C_disp ?? al['Carbohidratos (disp)'] ?? al.carbohydrate) || null,
      azucares_totales: parseNumber(al.Azucares_totales ?? al['Azúcares totales'] ?? al.total_sugars) || null,
      lipidos_totales: parseNumber(al.Lipidos_totales ?? al.Lipidos ?? al.total_lipid) || null,
      calcio: parseNumber(al.Calcio ?? al.calcium) || null,
      hierro: parseNumber(al.Hierro ?? al.iron) || null,
      sodio: parseNumber(al.Sodio ?? al.sodium) || null,
      colesterol: parseNumber(al.Colesterol ?? al.cholesterol) || null,
    };
  };

  // Detectar nutriente(s) principal(es) a partir del objeto normalizado
  const obtenerNutrientePrincipal = (alimentoNormalizado) => {
    if (!alimentoNormalizado) return [];
    const m = {
      proteina: alimentoNormalizado.proteinas || 0,
      carbohidrato: alimentoNormalizado.carbohidratos_disp || 0,
      grasa: alimentoNormalizado.lipidos_totales || 0,
    };
    const mm = {
      azucar: alimentoNormalizado.azucares_totales || 0,
      calcio: alimentoNormalizado.calcio || 0,
      hierro: alimentoNormalizado.hierro || 0,
      sodio: alimentoNormalizado.sodio || 0,
      colesterol: alimentoNormalizado.colesterol || 0,
    };

    const destacados = [];
    const maxMacro = Math.max(...Object.values(m));
    if (maxMacro > 0) Object.keys(m).forEach(k => m[k] === maxMacro && destacados.push(k));

    const maxMicro = Math.max(...Object.values(mm));
    if (maxMicro > 1) Object.keys(mm).forEach(k => mm[k] === maxMicro && destacados.push(k));

    return destacados;
  };

  // ================== RENDER ==================
  return (
    <div id="contenedorPrincipal" className="crear-dieta-page">
      <Encabezado activePage="dietas" onNavigate={navigateWithLoader} />

      <div id="cuerpo">
        {/* IZQUIERDA */}
        <CrearDietaForm
          dietaAgrupada={dietaAgrupada}
          diaSeleccionado={diaSeleccionado}
          setDiaSeleccionado={setDiaSeleccionado}
          traducciones={traducciones}
          borrarDietaDelDia={borrarDietaDelDia}
          displayName={pacienteDisplayName}
        />

        {/* DERECHA */}
        <div id="filtroContainer">
          <div id="contenedorFiltro">
            <input
              type="text"
              id="filtro"
              placeholder="Buscar alimento..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>
          {usuario?.id_perfil === 3 && dietTarget?.email && (
            <div className="doctor-banner">
                            Editando dieta de: <strong>{targetName || dietTarget.email}</strong>
              <div style={{ flex: 1 }} />
              <button className="btn-change-user" onClick={() => { localStorage.removeItem('dietTarget'); navigateWithLoader('/dietas'); }}>Cambiar usuario</button>
            </div>
          )}

          <div id="resultadosFiltro" className="resultadosFiltro">
            {alimentos.map(alimento => {
              const a = normalizeAlimento(alimento);
              const nutrientesPrincipales = obtenerNutrientePrincipal(a);
              return (
                <div key={alimento.id} className="alimento-card">
                  <div className="alimento-info">
                    <strong>{alimento.nombre}</strong>
                    <br />
                                        Calorías: {a.calories ?? '-'}
                    <div className="nutri-grid">
                      <div className={nutrientesPrincipales.includes('proteina') ? 'nutriente-destacado' : ''}>
                        <b>🥩 Proteínas:</b> {a.proteinas ?? '-'} g
                      </div>

                      <div className={nutrientesPrincipales.includes('carbohidrato') ? 'nutriente-destacado' : ''}>
                        <b>🍞 Carbohidratos:</b> {a.carbohidratos_disp ?? '-'} g
                      </div>

                      <div className={nutrientesPrincipales.includes('grasa') ? 'nutriente-destacado' : ''}>
                        <b>🥑 Grasas:</b> {a.lipidos_totales ?? '-'} g
                      </div>

                      <div className={nutrientesPrincipales.includes('azucar') ? 'nutriente-destacado' : ''}>
                        <b>🍬 Azúcares:</b> {a.azucares_totales ?? '-'} g
                      </div>

                      <div className={nutrientesPrincipales.includes('calcio') ? 'nutriente-destacado' : ''}>
                        <b>🦴 Calcio:</b> {a.calcio ?? '-'} mg
                      </div>

                      <div className={nutrientesPrincipales.includes('hierro') ? 'nutriente-destacado' : ''}>
                        <b>🩸 Hierro:</b> {a.hierro ?? '-'} mg
                      </div>

                      <div className={nutrientesPrincipales.includes('sodio') ? 'nutriente-destacado' : ''}>
                        <b>🧂 Sodio:</b> {a.sodio ?? '-'} mg
                      </div>

                      <div className={nutrientesPrincipales.includes('colesterol') ? 'nutriente-destacado' : ''}>
                        <b>💊 Colesterol:</b> {a.colesterol ?? '-'} mg
                      </div>

                    </div>
                  </div>

                  <div className="grupoSelector">
                    <div className="etiqueta">HORA DE COMIDA</div>
                    <div className="selector">
                      <select className="selectComida" id={`select-${alimento.id}`}>
                        <option value="breakfast">Desayuno</option>
                        <option value="lunch">Almuerzo</option>
                        <option value="dinner">Cena</option>
                        <option value="snack">Snack</option>
                        <option value="snack2">Snack 2</option>
                      </select>
                    </div>
                  </div>

                  <div className="botonesAccionVertical">
                    <button className="btnAgregar" onClick={() => agregarAlimento(alimento.id, alimento.nombre, document.getElementById(`select-${alimento.id}`).value)}>Agregar</button>
                    <button className="btnEliminar" onClick={() => eliminarAlimento(alimento.id, document.getElementById(`select-${alimento.id}`).value)}>Eliminar</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Pie />
      <Loader visible={loading} />
      <style>{`
                .doctor-banner{display:flex;align-items:center;gap:12px;background:#eef2ff;border:1px solid #c7d2fe;color:#111;padding:10px 12px;border-radius:10px;margin:12px}
                .btn-change-user{background:#e11d48;color:#fff;border:none;border-radius:8px;padding:6px 10px;cursor:pointer}
                .btn-change-user:hover{opacity:.9}
            `}</style>
    </div>
  );
}

const CrearDietaWithAuth = withAuth(CrearDieta, false);
CrearDietaWithAuth.displayName = 'CrearDieta';

export default CrearDietaWithAuth;


