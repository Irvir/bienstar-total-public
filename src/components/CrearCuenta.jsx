import React, { useEffect, useState } from "react";
import "../styles/CrearCuenta.css";
import withAuth from "../components/withAuth";
import Encabezado from "./Encabezado";
import Pie from "./Pie";
import "../styles/Base.css";
import "../styles/Pie.css";
import Loader from "./Loader.jsx";

const CrearCuenta = () => {
  const [activePage, setActivePage] = useState("crearcuenta");
  const [loading, setLoading] = useState(false);

  // Campos del formulario
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    edad: "",
    peso: "",
    altura: "",
    nivelActividad: "",
    alergias: [],
    otrasAlergias: "",
    sexo: ""
  });
  console.log(formData);

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
    const { id, value, multiple, options } = e.target;
    if (multiple) {
      const selected = Array.from(options)
        .filter(opt => opt.selected)
        .map(opt => opt.value);
      setFormData(prev => ({ ...prev, [id]: selected }));
    } else {
      setFormData(prev => ({ ...prev, [id]: value }));
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Enviando registro:", formData);
      const res = await fetch("http://localhost:3001/registrar", {
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
                  <input type="text" id="nombre" value={formData.nombre} onChange={handleChange} placeholder="Nombre" required />
                </div>

                <div className="divEdadPesoAlt">
                  <div className="edadPesoAlt">
                    Edad:<br />
                    <input type="number" id="edad" value={formData.edad} onChange={handleChange} placeholder="Escriba su edad" required />
                  </div>

                  <div className="edadPesoAlt">
                    Peso (KG):<br />
                    <input type="number" id="peso" value={formData.peso} onChange={handleChange} placeholder="Escriba su peso" step="any" required />
                  </div>

                  <div className="edadPesoAlt">
                    Altura (CM):<br />
                    <input type="number" id="altura" value={formData.altura} onChange={handleChange} placeholder="Escriba su altura" step="any" required />
                  </div>
                  <div className="edadPesoAlt">
                    Cantidad Física:<br />
                    <select id="nivelActividad" value={formData.nivelActividad} onChange={handleChange} required>
                      <option value="">Seleccione</option>
                      <option value="sedentario">Sedentario</option>
                      <option value="ligera_actividad">Ligera actividad</option>
                      <option value="actividad_moderada">Actividad moderada</option>
                      <option value="actividad_intensa">Actividad intensa</option>
                      <option value="actividad_muy_intensa">Actividad muy intensa</option>
                    </select>
                  </div>
                  <div className="edadPesoAlt">
                            <label>Alergias:</label><br />

                            {/* Select de alergias */}
                            <select
                              id="alergiasSelect"
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value && !formData.alergias.includes(value)) {
                                  setFormData((prev) => ({
                                    ...prev,
                                    alergias: [...prev.alergias, value],
                                  }));
                                }
                                e.target.selectedIndex = 0; // 🔹 Cierra visualmente el select
                              }}
                            >
                              <option value="">Seleccione</option>
                              <option value="gluten">Gluten</option>
                              <option value="lactosa">Lactosa</option>
                              <option value="frutos_secos">Frutos secos</option>
                              <option value="mariscos">Mariscos</option>
                              <option value="ninguna">Ninguna</option>
                            </select>

                            {/* Mostrar alergias seleccionadas */}
                            <div className="alergias-lista">
                              {formData.alergias.length === 0 ? (
                                <p style={{ fontSize: "12px", color: "#777" }}>No hay alergias seleccionadas.</p>
                              ) : (
                                formData.alergias.map((alergia, index) => (
                                  <span
                                    key={index}
                                    className="chip"
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      backgroundColor: "#e0f7fa",
                                      borderRadius: "15px",
                                      padding: "5px 10px",
                                      margin: "3px",
                                      fontSize: "13px",
                                    }}
                                  >
                                    {alergia}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setFormData((prev) => ({
                                          ...prev,
                                          alergias: prev.alergias.filter((a) => a !== alergia),
                                        }));
                                      }}
                                      style={{
                                        background: "none",
                                        border: "none",
                                        color: "#00796b",
                                        marginLeft: "5px",
                                        cursor: "pointer",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      ❌
                                    </button>
                                  </span>
                                ))
                              )}
                            </div>

                            {/* Campo de otras alergias */}
                            <input
                              type="text"
                              id="otrasAlergias"
                              value={formData.otrasAlergias}
                              onChange={handleChange}
                              placeholder="Otras alergias"
                            />
                    </div>




                  <div className="edadPesoAlt">
                    Sexo:<br />
                    <select id="sexo" value={formData.sexo} onChange={handleChange} required>
                      <option value="">Seleccione</option>
                      <option value="masculino">Masculino</option>
                      <option value="femenino">Femenino</option>
                      <option value="otro">Otro</option>
                    </select>
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