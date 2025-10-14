/**
 * @file Login.jsx
 * @description Componente de inicio de sesión de usuarios
 * 
 * Funcionalidades principales:
 * - Formulario de login con email y contraseña
 * - Validación de credenciales con el backend
 * - Detección automática de usuario administrador
 * - Almacenamiento de sesión en localStorage
 * - Redirección según tipo de usuario (admin/regular)
 * - Manejo de errores con notificaciones
 * - Loader durante autenticación
 * - Atajo directo para admin2025@bienstartotal.food
 */

import React, { useState, useEffect, useRef } from "react";
import "../styles/Login.css";
import "../styles/Base.css";
import "../styles/Pie.css";
import Pie from "./Pie";
import Encabezado from "./Encabezado";
import Loader from "./Loader.jsx";
import withAuth from "../components/withAuth";
import { API_BASE } from "../shared/apiBase";

// Importar el sistema de notificaciones
import "../controllers/notify.js";

/**
 * Componente Login
 * Página de autenticación con formulario de email y contraseña
 * 
 * @returns {JSX.Element} Página de inicio de sesión
 */
function Login() {
  // ===========================================
  // STATE - Estado del componente
  // ===========================================
  
  /** @type {string} Email ingresado por el usuario */
  const [email, setEmail] = useState("");
  
  /** @type {string} Contraseña ingresada por el usuario */
  const [password, setPassword] = useState("");
  
  /** @type {string} Página activa en el encabezado */
  const [activePage, setActivePage] = useState("login");
  
  /** @type {boolean} Estado del loader durante autenticación */
  const [loading, setLoading] = useState(false);
  
  /** @type {React.RefObject} Referencia al input de contraseña */
  const passwordRef = useRef(null);
  
  /** @type {React.RefObject} Referencia al input de email */
  const emailRef = useRef(null);

  // ===========================================
  // EFFECTS - Efectos del ciclo de vida
  // ===========================================

  /**
   * Efecto 1: Inicialización al montar el componente
   * - Carga el usuario desde localStorage si existe
   * - Detecta la página activa desde la URL
   */
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) {
      try {
        JSON.parse(usuarioGuardado); // Validar formato JSON
      } catch (e) {
        console.warn("Usuario inválido en localStorage", e);
      }
    }

    const currentPage = window.location.pathname.split("/").pop() || "login";
    setActivePage(currentPage.replace(".html", "").toLowerCase());
  }, []);

  // ===========================================
  // FUNCTIONS - Funciones auxiliares
  // ===========================================

  /**
   * Muestra el loader y redirige a una URL
   * @param {string} url - URL de destino
   */
  const showLoaderAndRedirect = (url) => {
    setLoading(true);
    setTimeout(() => {
      window.location.href = url;
    }, 700);
  };

  /**
   * Notifica al usuario y redirige después de un retraso
   * @param {string} mensaje - Mensaje de notificación
   * @param {Object} opciones - Opciones de notificación (type, duration)
   * @param {string} url - URL de destino
   * @param {Function} setLoadingFn - Función para activar loading
   */
  const notifyThenRedirect = (mensaje, opciones, url, setLoadingFn) => {
    window.notify(mensaje, opciones);
    setLoadingFn(true);
    setTimeout(() => {
      window.location.href = url;
    }, opciones?.duration || 1500);
  };

  /**
   * Maneja el proceso de login
   * - Valida campos requeridos
   * - Verifica atajo de admin2025@bienstartotal.food
   * - Envía credenciales al backend
   * - Detecta tipo de usuario (admin/regular)
   * - Guarda sesión en localStorage
   * - Redirige según el tipo de usuario
   * @param {Event} e - Evento de submit del formulario
   */
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      window.notify("Por favor, complete todos los campos", { type: "error" });
      return;
    }

    setLoading(true);

    // Atajo especial: admin2025@bienstartotal.food ingresa como admin sin validación backend
    try {
      const emailNormalized = (email || "").trim().toLowerCase();
      if (emailNormalized === "admin2025@bienstartotal.food") {
        const adminUser = {
          id: "admin2025",
          name: "Administrador",
          email: emailNormalized,
          id_diet: null,
        };
        localStorage.setItem("usuario", JSON.stringify(adminUser));
        // Mostrar bienvenida y redirigir a página de administrador
        notifyThenRedirect(
          "Bienvenido Administrador",
          { type: "success", duration: 1200 },
          "/admin.html",
          setLoading
        );
        return;
      }
    } catch (err) {
      console.warn("Error en verificación de atajo admin", err);
    }

    // Proceso de login normal con backend
    try {
  const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        // Login exitoso: guardar usuario en localStorage
        localStorage.setItem("usuario", JSON.stringify(result.user));

        // Verificación de usuario administrador
        const user = result.user;
        const esAdmin =
          (user.email &&
            (user.email.trim().toLowerCase() === "admin@bienstartotal.food" ||
             user.email.trim().toLowerCase() === "admin2025@bienstartotal.food")) ||
          (user.name && user.name.trim().toLowerCase() === "admin") ||
          (String(user.id) === "6");

        // Redirigir según tipo de usuario
        if (esAdmin) {
          notifyThenRedirect(
            "Bienvenido Administrador",
            { type: "success", duration: 1500 },
            "/admin.html",
            setLoading
          );
        } else {
          notifyThenRedirect(
            "Login exitoso",
            { type: "success", duration: 1500 },
            "/",
            setLoading
          );
        }
      } else {
        // Login fallido: mostrar error
        window.notify(result.message || "Correo o contraseña incorrectos", {
          type: "error",
        });

        // Limpiar campos y enfocar en email
        setEmail("");
        setPassword("");
        setTimeout(() => {
          if (emailRef.current) {
            emailRef.current.value = "";
            emailRef.current.focus();
          }
          if (passwordRef.current) passwordRef.current.value = "";
        }, 50);
      }
    } catch (error) {
      // Error de conexión con el servidor
      console.error("Error durante login:", error);
      window.notify("Error en la conexión con el servidor", { type: "error" });

      // Limpiar y resetear formulario
      setEmail("");
      setPassword("");
      setTimeout(() => {
        if (emailRef.current) {
          emailRef.current.value = "";
          emailRef.current.focus();
        }
        if (passwordRef.current) passwordRef.current.value = "";
      }, 50);
    } finally {
      setLoading(false);
    }
  };

  // ===========================================
  // RENDER - Renderizado del componente
  // ===========================================
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
                    name="login_email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <input
                    type="password"
                    placeholder="Contraseña"
                    ref={passwordRef}
                    autoComplete="new-password"
                    name="login_password"
                    onFocus={(e) => {
                      if (!password) e.target.value = "";
                    }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <br />
                  <br />
                  <button type="submit" id="botonIngresar">
                    {loading ? "Ingresando..." : "Ingresar"}
                  </button>

                  <br />
                  <br />
                  <button
                    type="button"
                    className="btnCrearCuenta"
                    onClick={() => showLoaderAndRedirect("/crear-cuenta")}
                  >
                    Crear Cuenta
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

// Exportar con HOC de autenticación
// requireAuth: false - No requiere sesión (página pública)
const LoginWithAuth = withAuth(Login, { requireAuth: false });
LoginWithAuth.displayName = 'LoginWithAuth';
export default LoginWithAuth;
