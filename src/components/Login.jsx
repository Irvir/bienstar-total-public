import React, { useState, useEffect, useRef } from "react";
import "../styles/Login.css";
import Pie from "./Pie";
import Encabezado from "./Encabezado";
import Loader from "./Loader.jsx";
import withAuth from "../components/withAuth";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("Invitado");
  const [activePage, setActivePage] = useState("login");
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef(null);
  const emailRef = useRef(null);

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) {
      try {
        const usuario = JSON.parse(usuarioGuardado);
        if (usuario?.name) setUserName(usuario.name);
      } catch (e) {
        console.warn("Usuario inválido", e);
      }
    }

    const currentPage = window.location.pathname.split("/").pop() || "login";
    setActivePage(currentPage.replace(".html", "").toLowerCase());
  }, []);

  const showLoaderAndRedirect = (url) => {
    setLoading(true);
    setTimeout(() => {
      window.location.href = url;
    }, 700);
  };

  const notifyThenRedirect = (mensaje, opciones, url, setLoadingFn) => {
    window.notify(mensaje, opciones);
    setLoadingFn(true);
    setTimeout(() => {
      window.location.href = url;
    }, opciones?.duration || 1500);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      window.notify("Por favor, complete todos los campos", { type: "error" });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem("usuario", JSON.stringify(result.user));
        notifyThenRedirect("Login exitoso", { type: "success", duration: 1500 }, "/", setLoading);
      } else {
        window.notify(result.message || "Correo o contraseña incorrectos", { type: "error" });
        // limpiar ambos campos y enfocar el email para permitir reintento inmediato
        try {
          setEmail("");
          setPassword("");
          // small delay to avoid browser autofill race
          setTimeout(() => {
            try {
              if (emailRef.current) {
                emailRef.current.value = '';
                emailRef.current.focus();
              }
              if (passwordRef.current) passwordRef.current.value = '';
            } catch (_) {}
          }, 50);
        } catch (e) {
          // no fatal
        }
      }
    } catch (error) {
      console.error("Error login:", error);
      window.notify("Error en la conexión con el servidor", { type: "error" });
      // limpiar ambos campos y enfocar email para permitir reintento
      try {
        setEmail("");
        setPassword("");
        setTimeout(() => {
          try {
            if (emailRef.current) {
              emailRef.current.value = '';
              emailRef.current.focus();
            }
            if (passwordRef.current) passwordRef.current.value = '';
          } catch (_) {}
        }, 50);
      } catch (e) {}
    }
    finally {
      // garantizar que loading sea false tras el intento
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
                    // also set the DOM value if browser tries to autofill
                    onFocus={(e) => { if (!password) e.target.value = ''; }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <br /><br />
                  <button type="submit" id="botonIngresar">
                    {loading ? "Ingresando..." : "Ingresar"}
                  </button>

                  <br /><br />
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

export default withAuth(Login, { requireAuth: false });