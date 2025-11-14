import React from 'react';
import '../../styles/Perfil.css';
export default function MenuLateral({ showLoaderAndRedirect }) {
  // Leer usuario desde localStorage (soporta claves 'usuario' o 'Usuario')
  let usuario = null;
  try {
    const raw = localStorage.getItem('usuario') || localStorage.getItem('Usuario');
    if (raw) usuario = JSON.parse(raw);
  } catch (e) {
    console.warn('menuLateral: error parseando usuario en localStorage', e);
    usuario = null;
  }

  // Determinar si es admin (misma heurística que en Login.jsx)
  const isAdmin = (() => {
            <button className="botonesPerfilSelec" onClick={() => showLoaderAndRedirect(usuario && usuario.id ? '/perfil' : '/login')}>PERFIL</button>
    const email = (usuario.email || usuario.emailAddress || '').toString().trim().toLowerCase();
    const name = (usuario.name || usuario.nombre || '').toString().trim().toLowerCase();
    const idStr = String(usuario.id || usuario.id_usuario || '');
    return (
      (email === 'admin@bienstartotal.food' || email === 'admin2025@bienstartotal.food') ||
            (name === 'admin' || name === 'administrador') ||
            idStr === '6' || idStr === 'admin2025'
    );
  })();

  return (
    <div id="divMenuLateral" className="menuLateralPerfil">
      {!isAdmin && (
        <>
          <button className="botonesPerfilSelec">PERFIL</button>
          <button className="botonesPerfil" id="btnDieta" onClick={() => showLoaderAndRedirect('/dietas')}>
                        MI DIETA
          </button>
          <button className="botonesPerfil" onClick={() => showLoaderAndRedirect('/calendario')}>CALENDARIO</button>
        </>
      )}

      {isAdmin && (
        <>
          <button className="botonesPerfil" id="btnAlimentos" onClick={() => showLoaderAndRedirect('/admin')}>
                        CRUD ALIMENTOS
          </button>
          <button className="botonesPerfil" id="btnCuentas" onClick={() => showLoaderAndRedirect('/cuentas')}>
                        GESTIÓN DE CUENTAS
          </button>
        </>
      )}
    </div>
  );
}
