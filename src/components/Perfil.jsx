import React, { useEffect, useState } from 'react';
import '../styles/Perfil.css';
import Encabezado from './Encabezado';
import { API_BASE } from './shared/apiBase';
import Pie from './Pie';
import '../styles/Base.css';
import ContenedorInfo from './Perfil/contenedorInfo';
import MenuLateral from './Perfil/menuLateral';
import Loader from './Loader.jsx';
import withAuth from '../components/withAuth';

function Perfil() {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(false); 

  useEffect(() => {
    // Leer de localStorage de forma segura y redirigir al login si no hay usuario válido
    const raw = localStorage.getItem('usuario');
    console.warn('DEBUG localStorage.usuario raw=', raw);
    if (!raw || raw === 'undefined') {
      window.location.href = '/login';
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      if (!parsed) {
        window.location.href = '/login';
        return;
      }
      setUsuario(parsed);
    } catch (e) {
      console.warn('Perfil: localStorage.usuario inválido, redirigiendo al login', e);
      window.location.href = '/login';
    }
  }, []);

  const showLoaderAndRedirect = (url) => {
    setLoading(true);
    setTimeout(() => {
      window.location.href = url;
    }, 700);
  };

  const handleCerrarSesion = () => {
    localStorage.removeItem('usuario');
    showLoaderAndRedirect('/login');
  };

  // Borrar Cuenta
  const handleBorrarCuenta = async () => {
    if (!confirm('¿Está seguro de que desea borrar su cuenta? Esta acción no se puede deshacer.')) return;
      
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/user/${usuario.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar la cuenta');
      
      localStorage.removeItem('usuario');
      window.notify?.('Cuenta borrada correctamente', { type: 'success' });
      
      setTimeout(() => {
        window.location.href = '/'; 
      }, 800);
    } catch (err) {
      console.error(err);
      window.notify?.('Error al borrar la cuenta', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };
      

  if (!usuario) return null;

  const onActualizarUsuario = (u) => {
    setUsuario(u);
    try {
      localStorage.setItem('usuario', JSON.stringify(u));
    } catch (err) {
      // No bloquear la aplicación si localStorage falla (p. ej. en modo privado)
      console.warn('No se pudo guardar usuario en localStorage', err);
    }
  };

  return (
    <div id="contenedorPrincipal" className="perfil-page">
      <Encabezado activePage="perfil" onNavigate={showLoaderAndRedirect} />

      <div id="cuerpo">
        <MenuLateral showLoaderAndRedirect={showLoaderAndRedirect} />
        <div id="divInfoUser">
          <ContenedorInfo
            usuario={usuario}
            handleCerrarSesion={handleCerrarSesion}
            handleBorrarCuenta={handleBorrarCuenta}
            onActualizarUsuario={onActualizarUsuario}
          />

        </div>
      </div>

      <Pie />

      <Loader visible={loading} />
    </div>
  );
}

const PerfilWithAuth = withAuth(Perfil, { requireAuth: true });

export default PerfilWithAuth;