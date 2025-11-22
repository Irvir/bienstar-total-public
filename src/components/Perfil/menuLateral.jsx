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

  // Determinar si es admin.
  // Regla principal: usuario.id_perfil === 1 (coincide con middleware authorizeAdmin).
  // Fallbacks: email o nombre especiales. Eliminamos heurística por id numérico ("6") para evitar falsos positivos.
  const isAdmin = (() => {
    if (!usuario) return false;
    const email = (usuario.email || usuario.emailAddress || '').toString().trim().toLowerCase();
    const name = (usuario.name || usuario.nombre || '').toString().trim().toLowerCase();
    const perfil = Number(usuario.id_perfil);
    if (perfil === 1) return true;
    if (email === 'admin@bienstartotal.food' || email === 'admin2025@bienstartotal.food') return true;
    if (name === 'admin' || name === 'administrador') return true;
    return false;
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
