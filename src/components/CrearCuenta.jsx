import React, { useEffect, useState } from "react";
import "../styles/CrearCuenta.css";
import withAuth from "../components/withAuth";
import Encabezado from "./Encabezado";
import Pie from "./Pie";
import "../styles/Base.css";
import "../styles/Pie.css";
import Loader from "./Loader.jsx";
import { API_BASE } from "../shared/apiBase";

const CrearCuenta = () => {
  const [activePage, setActivePage] = useState("crearcuenta");
  const [loading, setLoading] = useState(false);

  // Campos del formulario
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    weight: "",
    height: "",
  });

  useEffect(() => {
    const currentPage = window.location.pathname.split("/").pop() || "crearcuenta";
    setActivePage(currentPage);
  }, []);

  const showLoaderAndRedirect = (url) => {
    setLoading(true);
    setTimeout(() => {
      window.location.href = url;
    }, 700);
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
  const res = await fetch(`${API_BASE}/registrar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errores?.length) {
          data.errores.forEach((err) => window.notify(err, { type: "error" }));
        } else {
          window.notify(data.message || "Error al registrar", { type: "error" });
        }
      } else {
        window.notify(data.message || "Registro exitoso", { type: "success" });
        setTimeout(() => (window.location.href = "/login"), 2500);
      }
    } catch (err) {
      console.error(err);
      window.notify("Error de conexión al servidor", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="contenedorPrincipal" className="crear-cuenta-page">
      <Encabezado activePage={activePage} onNavigate={showLoaderAndRedirect} />

      <main id="cuerpo" className="fondoLogin">
        <div id="contenedorLoginAsist3">
          <div id="contenedorLogin2">
            <div className="contenedorLoginDatosUser">
              <form id="CrearCuentaForm" onSubmit={handleSubmit}>
                <div className="divNom">
                  <h2 className="contendorLoginFotoCrearUserAsist" style={{ fontFamily: "Arial, Helvetica, sans-serif", margin: "0 0 8px 0" }}>
                    Rellene los datos solicitados:
                  </h2>
                  Nombre:<br />
                  <input type="text" id="name" value={formData.name} onChange={handleChange} placeholder="Nombre" required />
                </div>

                <div className="divEdadPesoAlt">
                  <div className="edadPesoAlt">
                    Edad:<br />
                    <input type="number" id="age" value={formData.age} onChange={handleChange} placeholder="Escriba su edad" required />
                  </div>

                  <div className="edadPesoAlt">
                    Peso (KG):<br />
                    <input type="number" id="weight" value={formData.weight} onChange={handleChange} placeholder="Escriba su peso" step="any" required />
                  </div>

                  <div className="edadPesoAlt">
                    Altura (CM):<br />
                    <input type="number" id="height" value={formData.height} onChange={handleChange} placeholder="Escriba su altura" step="any" required />
                  </div>
                </div>

                <div className="divCorreo">
                  Correo electrónico:<br />
                  <input type="email" id="email" value={formData.email} onChange={handleChange} placeholder="Escriba su correo electrónico" required />
                </div>

                <div className="divCorreo">
                  Contraseña:<br />
                  <input type="password" id="password" value={formData.password} onChange={handleChange} placeholder="Contraseña" required />
                </div>

                <br />

                <div className="botonesGroup">
                  <button type="submit" className="buttonCrearIniciarSesion" disabled={loading}>
                    {loading ? "Registrando..." : "Crear Cuenta"}
                  </button>

                  <button type="button" className="buttonCrearIniciarSesion" id="btnIniciarSesion" onClick={() => showLoaderAndRedirect("/login")}>
                    Iniciar Sesión
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

      </main>
      <Pie />

      <Loader visible={loading} />

    </div>
  );
};

// Página pública: accesible sin sesión. Si ya estás logueado, redirige a /perfil.
export default withAuth(CrearCuenta, { requireAuth: false, redirectIfLoggedIn: true });