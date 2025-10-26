import React, { useState, useEffect, useRef } from "react";
import "../styles/Login.css";
import Pie from "./Pie";
import Encabezado from "./Encabezado";
import Loader from "./Loader.jsx";
import withAuth from "../components/withAuth";
import { API_BASE } from "./shared/apiBase";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../controllers/firebase.js";


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

    // Atajo para admin2025
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
    const handleLogin = () => {
      signInWithPopup(auth, provider)
        .then((result) => {
          const user = result.user;
          console.log("Usuario logueado:", user);
          // Aquí puedes guardar el usuario en estado o redirigir
        })
        .catch((error) => {
          console.error("Error al iniciar sesión:", error);
        });
    };

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
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      console.log("Usuario logueado con Google:", user);

      // Puedes guardar al usuario en localStorage (igual que con el login normal)
      const googleUser = {
        id: user.uid,
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      };
      localStorage.setItem("usuario", JSON.stringify(googleUser));

      // Redirige o muestra mensaje
      notifyThenRedirect(
        `Bienvenido ${user.displayName}`,
        { type: "success", duration: 1500 },
        "/",
        setLoading
      );
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
      window.notify("Error al iniciar sesión con Google", { type: "error" });
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
                  <button type="submit" id="botonIngresar">
                    {loading ? "Ingresando..." : "Ingresar"}
                  </button>

                  <br />

                  <button
                    type="button"
                    className="btnCrearCuenta"
                    onClick={() => showLoaderAndRedirect("/crear-cuenta")}
                  >
                    Crear Cuenta
                  </button>
                  <br />
                  <button onClick={handleGoogleLogin}>
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

export default withAuth(Login, { requireAuth: false });
