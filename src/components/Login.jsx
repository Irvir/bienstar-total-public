import React, { useState, useEffect, useRef } from "react";
import "../styles/Login.css";
import Pie from "./Pie";
import Encabezado from "./Encabezado";
import Loader from "./Loader.jsx";
import withAuth from "../components/withAuth";
import { API_BASE } from "./shared/apiBase";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activePage, setActivePage] = useState("login");
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef(null);
  const emailRef = useRef(null);

  useEffect(() => {
    const currentPage = window.location.pathname.split("/").pop() || "login";
    setActivePage(currentPage.replace(".html", "").toLowerCase());
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
      window.notify("Por favor, complete todos los campos", { type: "error" });
      return;
    }

    setLoading(true);

    // Shortcut: if the admin2025 email is used, treat as admin locally and redirect
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
        // Muestra notificacion del Admin
        notifyThenRedirect(
          "Bienvenido Administrador",
          { type: "success", duration: 1200 },
          "/admin.html",
          setLoading
        );
        return;
      }
    } catch (err) {
      console.warn("Error admin shortcut check", err);
    }

    try {
  const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem("usuario", JSON.stringify(result.user));

        // 🔍 Verificación de usuario administrador
        const user = result.user;
        const esAdmin =
          (user.email &&
            (user.email.trim().toLowerCase() === "admin@bienstartotal.food" ||
             user.email.trim().toLowerCase() === "admin2025@bienstartotal.food")) ||
          (user.name && user.name.trim().toLowerCase() === "admin") ||
          (String(user.id) === "6");

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
        window.notify(result.message || "Correo o contraseña incorrectos", {
          type: "error",
        });

        // Limpiar campos y enfocar email
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
      console.error("Error login:", error);
      window.notify("Error en la conexión con el servidor", { type: "error" });

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
                  <button type="submit" id="botonIngresar" className="btn btn-primary btn-block">
                    {loading ? "Ingresando..." : "Ingresar"}
                  </button>

                  <br />
                  <br />
                  <button
                    type="button"
                    className="btn btn-secondary btn-block btnCrearCuenta"
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

const LoginWithAuth = withAuth(Login, { requireAuth: false });
export default LoginWithAuth;
