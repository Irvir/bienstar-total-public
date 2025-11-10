import React, { useEffect, useMemo, useState } from 'react';
import '../styles/Dietas.css';
import withAuth from '../components/withAuth';
import Encabezado from './Encabezado';
import { API_BASE } from './shared/apiBase';
import Pie from './Pie';
import Loader from './Loader.jsx';

function Dietas() {
  const [dietByDay, setDietByDay] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSelectUserModal, setShowSelectUserModal] = useState(false);
  const [emailSeleccion, setEmailSeleccion] = useState('');
  const [selecting, setSelecting] = useState(false);

  const usuarioActual = useMemo(() => {

    try {
      const raw = localStorage.getItem('usuario');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  // ===== Redirección si no hay usuario =====
  useEffect(() => {
    if (!localStorage.getItem('usuario')) window.location.href = '/login';
  }, []);

  // ===== Loader + redirección =====
  const showLoaderAndRedirect = (url) => {
    setLoading(true);
    setTimeout(() => (window.location.href = url), 700);
  };

  // ===== Menú usuario y logout =====
  useEffect(() => {
    const btnPerfilView = document.getElementById('btnPerfilView');
    const menuDesplegable = document.getElementById('menuDesplegable');
    const logoutButton = document.getElementById('logoutButton');
    const fotoUsuario = document.getElementById('fotoUsuario');

    if (!btnPerfilView || !menuDesplegable) return;

    menuDesplegable.style.position = 'absolute';
    menuDesplegable.style.top = '8%';
    menuDesplegable.style.right = '8%';
    menuDesplegable.style.display = 'none';
    menuDesplegable.style.width = '10%';

    const toggleMenu = () => {
      menuDesplegable.style.display =
                menuDesplegable.style.display === 'block' ? 'none' : 'block';
    };

    const closeMenu = (event) => {
      if (
        !btnPerfilView.contains(event.target) &&
                !menuDesplegable.contains(event.target) &&
                !fotoUsuario.contains(event.target)
      ) {
        menuDesplegable.style.display = 'none';
      }
    };

    const logout = () => {
      localStorage.removeItem('usuario');
      showLoaderAndRedirect('/login');
    };

    btnPerfilView.addEventListener('click', toggleMenu);
    document.addEventListener('click', closeMenu);
    logoutButton?.addEventListener('click', logout);
    fotoUsuario?.addEventListener('click', () => showLoaderAndRedirect('/perfil'));

    return () => {
      btnPerfilView.removeEventListener('click', toggleMenu);
      document.removeEventListener('click', closeMenu);
      logoutButton?.removeEventListener('click', logout);
    };
  }, []);

  // ===== Mostrar nombre usuario =====
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      const usuario = JSON.parse(usuarioGuardado);
      const nameUserSpan = document.querySelector('.nameUser');
      if (nameUserSpan) nameUserSpan.textContent = usuario.name;
    }
  }, []);

  // ===== Cargar dieta =====
  useEffect(() => {
    async function loadDiet() {
      try {
        const rawUser = localStorage.getItem('usuario');
        if (!rawUser) return;
        const user = JSON.parse(rawUser);

        if (!user.id_dieta && !user.id_diet || user.id_diet === 1 || user.id_dieta === 1) {
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
        const res = await fetch(`${API_BASE}/get-diet?id_dieta=${idParaConsulta}`);
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
        console.error('Error cargando dieta:', err);
      }
    }
    loadDiet();
  }, []);

  // ====== Selección de usuario ======
  async function confirmarSeleccionUsuario() {
    if (!emailSeleccion) {
      window.notify?.('Ingresa un email válido', { type: 'warning' });
      return;
    }
    setSelecting(true);
    try {
      const res = await fetch(`${API_BASE}/ensure-diet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailSeleccion }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        window.notify?.(data.message || 'No se pudo validar dieta del usuario', { type: 'error' });
        return;
      }
      const id_dieta = data?.id_dieta;
      if (!id_dieta) {
        window.notify?.('No se obtuvo id_dieta', { type: 'error' });
        return;
      }

      //Nombre paciente
      let nombrePaciente = null;
      try {
        const usersRes = await fetch(`${API_BASE}/admin/users`);
        if (usersRes.ok) {
          const users = await usersRes.json();
          const target = (Array.isArray(users) ? users : []).find(
            u => (u.email || '').toLowerCase() === emailSeleccion.toLowerCase(),
          );
          if (target) nombrePaciente = target.nombre || target.name || null;
        }
      } catch (e) {
        console.warn('No se pudo obtener nombre del paciente:', e);
      }

      // Guardar en localStorage para CrearDieta
      localStorage.setItem(
        'dietTarget',
        JSON.stringify({ email: emailSeleccion, id_dieta, nombre: nombrePaciente }),
      );

      setShowSelectUserModal(false);
      setEmailSeleccion('');
      setLoading(true);
      setTimeout(() => (window.location.href = '/crear-dieta'), 300);
    } catch (e) {
      console.error(e);
      window.notify?.('Error de conexión', { type: 'error' });
    } finally {
      setSelecting(false);
    }
  }


  // ===== Render =====
  return (
    <div id="contenedorPrincipal" className="dietas-page">
      <Encabezado activePage="dietas" onNavigate={showLoaderAndRedirect} />

      <main id="cuerpo" className="dietas-main">
        <div className="tabla-dieta">
          {['LUNES','MARTES','MIÉRCOLES','JUEVES','VIERNES','SÁBADO','DOMINGO'].map((diaNombre, i) => {
            const diaNum = i + 1;
            const meals = dietByDay[diaNum] || {};
            const order = ['breakfast','lunch','dinner','snack','snack2'];
            const labels = {
              breakfast:'DESAYUNO',
              lunch:'ALMUERZO',
              dinner:'CENA',
              snack:'SNACK',
              snack2:'SNACK 2',
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

        {/* Mostrar botón solo para doctores (id_perfil === 3) */}
                
        {usuarioActual?.id_perfil === 3 && (
          <button
            type="button"
            id="BtnAsignarDieta"
            onClick={() => {
              console.log('Click botón asignar dieta');
              setShowSelectUserModal(true);
            }}
          >
                        Asignar/Editar dieta a usuario
          </button>
        )}
      </main>

      <Pie />
      <Loader visible={loading} />

      {showSelectUserModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h3>Seleccionar usuario por email</h3>
            <p>Ingresa el email del usuario al que deseas agregar/editar la dieta.</p>
            <input
              type="email"
              placeholder="email@ejemplo.com"
              value={emailSeleccion}
              onChange={(e) => setEmailSeleccion(e.target.value)}
              autoFocus
            />
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowSelectUserModal(false);
                  setEmailSeleccion('');
                }}
              >
                                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={confirmarSeleccionUsuario}
                disabled={selecting}
              >
                {selecting ? 'Buscando...' : 'Continuar'}
              </button>
            </div>
          </div>
          <style>{`
                        .modal-overlay {
                            position: fixed;
                            inset: 0;
                            background: rgba(0,0,0,.5);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            z-index: 999999 !important;
                        }
                        .modal-card {
                            background: #fff;
                            color: #111;
                            min-width: 320px;
                            max-width: 480px;
                            border-radius: 12px;
                            padding: 20px;
                            box-shadow: 0 10px 30px rgba(0,0,0,.2);
                        }
                        .modal-card h3 { margin: 0 0 8px }
                        .modal-card p { margin: 0 0 12px }
                        .modal-card input {
                            width: 100%;
                            padding: 10px 12px;
                            border: 1px solid #ddd;
                            border-radius: 8px;
                            margin-bottom: 12px;
                        }
                        .modal-actions {
                            display: flex;
                            gap: 8px;
                            justify-content: flex-end;
                        }
                        .btn {
                            padding: 8px 12px;
                            border-radius: 8px;
                            border: none;
                            cursor: pointer;
                        }
                        .btn-primary { background: #2563eb; color: #fff }
                        .btn-secondary { background: #e5e7eb; color: #111 }
                        .btn[disabled] { opacity: .6; cursor: not-allowed }
                    `}</style>
        </div>
      )}
    </div>
  );
}

export default withAuth(Dietas, { requireAuth: true });
