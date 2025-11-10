import React, { useState, useEffect, useRef } from 'react';
import '../styles/Login.css';
import Pie from './Pie';
import Encabezado from './Encabezado';
import Loader from './Loader.jsx';
import withAuth from '../components/withAuth';
import { API_BASE } from './shared/apiBase';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../controllers/firebase.js';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';

function LoginInner() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activePage, setActivePage] = useState('login');
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef(null);
  const emailRef = useRef(null);
  const { executeRecaptcha } = useGoogleReCaptcha();
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';

  useEffect(() => {
    const currentPage = window.location.pathname.split('/').pop() || 'login';
    setActivePage(currentPage.replace('.html', '').toLowerCase());
  }, []);

  // Mostrar loader + redirigir
  const showLoaderAndRedirect = (url) => {
    setLoading(true);
    setTimeout(() => {
      window.location.href = url;
    }, 700);
  };

  // Notificar + redirigir
  const notifyThenRedirect = (mensaje, opciones, url, setLoadingFn) => {
    window.notify(mensaje, opciones);
    setLoadingFn(true);
    setTimeout(() => {
      window.location.href = url;
    }, opciones?.duration || 1500);
  };

  // ====== LOGIN PRINCIPAL ======
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      window.notify('Por favor, complete todos los campos', { type: 'error' });
      return;
    }

    setLoading(true);

    try {
    

      const emailNormalized = email.trim().toLowerCase();

      // Atajo para admin2025
      if (emailNormalized === 'admin2025@bienstartotal.food') {
        const adminUser = {
          id: 'admin2025',
          name: 'Administrador',
          email: emailNormalized,
          id_diet: null,
        };
        localStorage.setItem('usuario', JSON.stringify(adminUser));
        notifyThenRedirect(
          'Bienvenido Administrador',
          { type: 'success', duration: 1200 },
          '/admin.html',
          setLoading,
        );
        return;
      }
   

      // Login normal con API
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        const usuario = result.user;
        localStorage.setItem('usuario', JSON.stringify(usuario));

        // Limpiar dietTarget si no es doctor
        if (!usuario || usuario.id_perfil !== 3) {
          localStorage.removeItem('dietTarget');
        }

        //  Imprimir usuario si es doctor
        if (usuario.id_perfil === 3) {
          notifyThenRedirect(
            'Bienvenido Doctor',
            { type: 'success', duration: 1500 },
            '/',
            setLoading,
          );
          console.log('=== Usuario Doctor ===');
          console.log(usuario);
        }

        // Verificación de administrador
        const esAdmin =
          (usuario.email &&
            ['admin@bienstartotal.food', 'admin2025@bienstartotal.food'].includes(usuario.email.trim().toLowerCase())) ||
          (usuario.name && usuario.name.trim().toLowerCase() === 'admin') ||
          String(usuario.id) === '6';

        if (esAdmin) {
          notifyThenRedirect(
            'Bienvenido Administrador',
            { type: 'success', duration: 1500 },
            '/admin.html',
            setLoading,
          );
        } else {
          notifyThenRedirect(
            'Login exitoso',
            { type: 'success', duration: 1500 },
            '/',
            setLoading,
          );
        }
      } else {
        window.notify(result.message || 'Correo o contraseña incorrectos', { type: 'error' });
        setEmail('');
        setPassword('');
        setTimeout(() => {
          emailRef.current?.focus();
          passwordRef.current.value = '';
        }, 50);
      }
    } catch (error) {
      console.error('Error login:', error);
      window.notify('Error en la conexión con el servidor', { type: 'error' });
      setEmail('');
      setPassword('');
      setTimeout(() => {
        emailRef.current?.focus();
        passwordRef.current.value = '';
      }, 50);
    } finally {
      setLoading(false);
    }
  };



  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      
      // Obtener token de Firebase mediante popup
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      // Autenticar con nuestro backend usando el token
      const response = await fetch(`${API_BASE}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();

      if (response.ok) {
        // Guardar usuario en localStorage
        localStorage.setItem('usuario', JSON.stringify(data.user));

        // Verificar si es administrador
        const esAdmin = data.user.email === 'admin@bienstartotal.food' || 
                       data.user.id_perfil === 1;

        if (esAdmin) {
          notifyThenRedirect(
            'Bienvenido Administrador',
            { type: 'success', duration: 1500 },
            '/admin.html',
            setLoading,
          );
        } else {
          notifyThenRedirect(
            `Bienvenido ${data.user.nombre || 'usuario'}`,
            { type: 'success', duration: 1500 },
            '/',
            setLoading,
          );
        }
      } else {
        throw new Error(data.error || 'Error al autenticar con Google');
      }

      // Verificación reCAPTCHA si está configurado
      if (executeRecaptcha) {
        await executeRecaptcha('google_login');
      }
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
      window.notify(
        error.message || 'Error al iniciar sesión con Google',
        { type: 'error' },
      );
      setLoading(false);
    }
  };


  return (
    <div className="login-page">
      <div id="contenedorPrincipal">
        <Encabezado activePage={activePage} onNavigate={showLoaderAndRedirect} />

        <div id="cuerpo" className="fondoLogin">
          <div id="contenedorLoginAsist">
            <div id="contenedorLogin">
              <div id="contenedorLoginFoto"></div>
              <div className="login-container">
                <form onSubmit={handleLogin} autoComplete="off">
                  <input
                    type="text"
                    placeholder="Correo electrónico"
                    ref={emailRef}
                    autoComplete="off"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  {/* No mostramos ni generamos manualmente el token en la UI por seguridad. */}
                  <input
                    type="password"
                    placeholder="Contraseña"
                    ref={passwordRef}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <br />
                  <button type="submit" id="botonIngresar" className="btn btn-primary btn-block">
                    {loading ? 'Ingresando...' : 'Ingresar'}
                  </button>

                  <br />

                  
                  <button
                    type="button"
                    className="btn btn-secondary btn-block btnCrearCuenta"
                    onClick={() => showLoaderAndRedirect('/crear-cuenta')}
                  >
                    Crear Cuenta
                  </button>
                  <br />
                  <button
                    type="button"
                    className="btn btn-google"
                    onClick={handleGoogleLogin}
                    aria-label="Iniciar sesión con Google"
                  >
                    <span className="btn-google__icon" aria-hidden="true">G</span>
                    Iniciar sesión con Google
                  </button>
                </form>
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

const LoginWithAuth = withAuth(LoginInner, { requireAuth: false });
export default LoginWithAuth;
