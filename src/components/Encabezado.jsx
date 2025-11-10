import React, { useEffect, useState, useRef } from 'react';
import '../styles/Encabezado.css';


export default function Encabezado({ activePage, onNavigate }) {
  const [userName, setUserName] = useState('Invitado');
  const [isLogged, setIsLogged] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const googleBtnRef = useRef(null);

  useEffect(() => {
    const refreshUserFromStorage = () => {
      const raw = localStorage.getItem('usuario') || localStorage.getItem('Usuario');
      if (!raw) {
        setUserName('Invitado');
        setIsLogged(false);
        return;
      }
      try {
        const usuario = JSON.parse(raw);
        // Si el usuario es doctor y hay un paciente seleccionado (dietTarget), mostrar su nombre/email
        try {
          const targetRaw = localStorage.getItem('dietTarget');
          const target = targetRaw ? JSON.parse(targetRaw) : null;
          if (usuario?.id_perfil === 3 && (target?.nombre || target?.email)) {
            const display = target.nombre || target.email;
            setUserName(display);
          } else {
            const name = usuario?.nombre || usuario?.name || usuario?.email || 'Invitado';
            setUserName(name);
          }
        } catch {
          const name = usuario?.nombre || usuario?.name || usuario?.email || 'Invitado';
          setUserName(name);
        }
        setIsLogged(true);
      } catch (e) {
        console.warn('Usuario inválido en localStorage', e);
        setUserName('Invitado');
        setIsLogged(false);
      }
    };

    refreshUserFromStorage();

    const onStorage = (e) => {
      if (e.key === 'usuario' || e.key === 'Usuario' || e.key === 'dietTarget') refreshUserFromStorage();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return; 

    const loadScript = () => {
      return new Promise((resolve) => {
        if (window.google && window.google.accounts && window.google.accounts.id) return resolve();
        const s = document.createElement('script');
        s.src = 'https://accounts.google.com/gsi/client';
        s.async = true;
        s.defer = true;
        s.onload = () => resolve();
        document.head.appendChild(s);
      });
    };

    let mounted = true;
    loadScript().then(() => {
      if (!mounted) return;
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            try {
              const token = response.credential;
              const payload = JSON.parse(atob(token.split('.')[1]));
              const profile = {
                nombre: payload.name,
                email: payload.email,
                picture: payload.picture,
                google: true,
              };
              localStorage.setItem('usuario', JSON.stringify(profile));
              setUserName(profile.nombre || profile.email || 'Usuario');
              setIsLogged(true);
            } catch (e) {
              console.error('Error parseando credential token', e);
            }
          },
        });

        if (!isLogged && googleBtnRef.current) {
          googleBtnRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(googleBtnRef.current, { theme: 'outline', size: 'medium' });
        }
      } catch (e) {
        console.warn('GSI init failed', e);
      }
    });

    return () => { mounted = false; };
  }, [isLogged]);

  // Open menu by default on very narrow screens so options are visible
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.innerWidth <= 640) setMenuOpen(true);
    } catch { /* noop */ }
  }, []);
  useEffect(() => {
    const bell = document.getElementById('btnNotification');
    if (bell) {
      const triggerWiggle = () => {
        bell.classList.remove('bell-hint');
        void bell.offsetWidth; 
        bell.classList.add('bell-hint');
        setTimeout(() => {
          bell.classList.remove('bell-hint');
        }, 800); // duración de la animación
      };
      bell.addEventListener('click', triggerWiggle);
      return () => bell.removeEventListener('click', triggerWiggle);
    }
  }, []);


  function handlePerfilClick() {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      onNavigate('/perfil');
    } else {
      onNavigate('/login');
    }
    setMenuOpen(false);
  }

  function _handleSignOut(e) {
    e.stopPropagation();
    localStorage.removeItem('usuario');
    try { localStorage.removeItem('dietTarget'); } catch { void 0; }
    setUserName('Invitado');
    setIsLogged(false);
    try { if (window.google && window.google.accounts && window.google.accounts.id) window.google.accounts.id.disableAutoSelect(); } catch { void 0; }
    onNavigate('/');
  }

  // Close mobile menu when resizing to desktop and on route changes
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 900 && menuOpen) setMenuOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [menuOpen]);

  return (
    <div id="contenedorEncabezado">
      <div id="encabezado" data-menu-open={menuOpen ? 'true' : 'false'}>
        <div className="header-inner">
          <div className="header-top-row">
            <div className="logo">
              <a href="/">
                <img
                  src="/assets/LogoRed.png"
                  alt="Logo BienStarTotal"
                  className="logoImg"
                />
              </a>
            </div>

            {/* Notificación móvil: a la izquierda del login */}
            <button className="btnMenuNoti btnMenuNoti--mobile" aria-label="Notificaciones">
              <img
                src="/Imagenes/Login_Perfil/Notificacion.png"
                alt="Notificación"
              />
            </button>

            <div className="login" onClick={handlePerfilClick}>
              <span className="nameUser">{userName}</span>
              <img
                src="/Imagenes/Login_Perfil/UserPerfil2.png"
                id="fotoUsuario"
                alt="Foto de Usuario"
                className="fotoUsuario"
              />
            </div>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="menu-toggle"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
            aria-controls="nav-menu"
            onClick={() => setMenuOpen(v => !v)}
          >
            <span className="menu-toggle-bar" />
            <span className="menu-toggle-bar" />
            <span className="menu-toggle-bar" />
          </button>

          <div className="menúBotones" id="nav-menu">
            <button
              className={activePage === 'home' ? 'btnMenuSelec' : 'btnMenu'}
              onClick={() => { onNavigate('/home'); setMenuOpen(false); }}
            >
              INICIO
            </button>
            <button
              className={activePage === 'alimentos' ? 'btnMenuSelec' : 'btnMenu'}
              onClick={() => { onNavigate('/alimentos'); setMenuOpen(false); }}
            >
              ALIMENTOS
            </button>
            <button
              className={activePage === 'dietas' ? 'btnMenuSelec' : 'btnMenu'}
              onClick={() => { onNavigate('/dietas'); setMenuOpen(false); }}
            >
              DIETA
            </button>
            <button className="btnMenuNoti">
              <img
                src="/Imagenes/Login_Perfil/Notificacion.png"
                id="btnNotification"
                alt="Notificación"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}