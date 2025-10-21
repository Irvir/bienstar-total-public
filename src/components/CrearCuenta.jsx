import React, { useEffect, useState } from "react";
import "../styles/CrearCuenta.css";
import Encabezado from "./Encabezado";
import { API_BASE } from "./shared/apiBase";
import Pie from "./Pie";
import "../styles/Base.css";
import "../styles/Pie.css";
import Loader from "./Loader.jsx";
import withAuth from "../components/withAuth";

                              const CrearCuenta = () => {
                                const [activePage, setActivePage] = useState("crearcuenta");
                                const [loading, setLoading] = useState(false);
                                const [errors, setErrors] = useState({});
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
                                  sexo: "",
                                });

                                useEffect(() => {
                                  const currentPage = window.location.pathname.split("/").pop() || "crearcuenta";
                                  setActivePage(currentPage);
                                }, []);

                                const showLoaderAndRedirect = (url) => {
                                  setLoading(true);
                                  setTimeout(() => (window.location.href = url), 700);
                                };

                                const validateField = (field, rawValue) => {
                                  let value = rawValue;
                                  const next = { ...errors };
                                  const setErr = (k, msg) => (msg ? (next[k] = msg) : delete next[k]);
                                  switch (field) {
                                    case "nombre":
                                      setErr("nombre", !value ? "El nombre es obligatorio" : value.length < 2 ? "Mínimo 2 caracteres" : value.length > 50 ? "Máximo 50 caracteres" : "");
                                      break;
                                    case "email": {
                                      const re = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d@._-]+$/;
                                      setErr("email", !value ? "El correo es obligatorio" : !re.test(value) ? "Debe contener letras y números válidos" : "");
                                      break;
                                    }
                                    case "password": {
                                      const pr = /^(?=.*[a-zA-Z])(?=.*\d).{6,}$/;
                                      setErr("password", !value ? "La contraseña es obligatoria" : !pr.test(value) ? "Mínimo 6 caracteres, con letras y números" : "");
                                      break;
                                    }
                                    case "edad": {
                                      const n = Number(value);
                                      setErr("edad", !value ? "La edad es obligatoria" : n <= 15 || n >= 100 ? "Debe ser >15 y <100" : "");
                                      break;
                                    }
                                    case "peso": {
                                      const n = Number(value);
                                      setErr("peso", !value ? "El peso es obligatorio" : n <= 30 || n >= 170 ? "Debe ser >30kg y <170kg" : "");
                                      break;
                                    }
                                    case "altura": {
                                      let n = Number(value);
                                      if (n && n < 10) n *= 100;
                                      setErr("altura", !value ? "La altura es obligatoria" : n <= 80 || n >= 250 ? "Debe ser >80cm y <250cm" : "");
                                      break;
                                    }
                                    case "nivelActividad":
                                      setErr("nivelActividad", !value ? "Seleccione su actividad" : "");
                                      break;
                                    case "sexo":
                                      setErr("sexo", !value ? "Seleccione su sexo" : "");
                                      break;
                                    default:
                                      break;
                                  }
                                  setErrors(next);
                                };

                                const handleChange = (e) => {
                                  const { id, value } = e.target;
                                  setFormData((p) => ({ ...p, [id]: value }));
                                  validateField(id, value);
                                };

                                const handleBlur = async (e) => {
                                  const { id, value } = e.target;
                                  validateField(id, value);
                                  if (id === "email" && !errors.email && value) {
                                    try {
                                      const res = await fetch(`${API_BASE}/checkEmail`, {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ email: value }),
                                      });
                                      const data = await res.json();
                                      if (data.exists) setErrors((prev) => ({ ...prev, email: "Este correo ya está registrado" }));
                                    } catch (err) {
                                      console.warn("No se pudo verificar email", err);
                                    }
                                  }
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
                                      if (data.errores?.length) data.errores.forEach((err) => window.notify(err, { type: "error" }));
                                      else window.notify(data.message || "Error al registrar", { type: "error" });
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
                                                <input id="nombre" type="text" value={formData.nombre} onChange={handleChange} onBlur={handleBlur} placeholder="Nombre" aria-invalid={!!errors.nombre} required />
                                                {errors.nombre && <div className="error-text">{errors.nombre}</div>}
                                              </div>

                                              <div className="formGrid">
                                                <div className="colLeft">
                                                  <div className="edadPesoAlt">
                                                    Edad:<br />
                                                    <input id="edad" type="number" value={formData.edad} onChange={handleChange} onBlur={handleBlur} placeholder="Escriba su edad" aria-invalid={!!errors.edad} required />
                                                    {errors.edad && <div className="error-text">{errors.edad}</div>}
                                                  </div>
                                                  <div className="edadPesoAlt">
                                                    Peso (KG):<br />
                                                    <input id="peso" type="number" step="any" value={formData.peso} onChange={handleChange} onBlur={handleBlur} placeholder="Escriba su peso" aria-invalid={!!errors.peso} required />
                                                    {errors.peso && <div className="error-text">{errors.peso}</div>}
                                                  </div>
                                                  <div className="edadPesoAlt">
                                                    Altura (CM):<br />
                                                    <input id="altura" type="number" step="any" value={formData.altura} onChange={handleChange} onBlur={handleBlur} placeholder="Escriba su altura" aria-invalid={!!errors.altura} required />
                                                    {errors.altura && <div className="error-text">{errors.altura}</div>}
                                                  </div>
                                                </div>
                                                <div className="colRight">
                                                  <div className="edadPesoAlt">
                                                    Cantidad Física:<br />
                                                    <select id="nivelActividad" className="select-control" value={formData.nivelActividad} onChange={handleChange} onBlur={handleBlur} aria-invalid={!!errors.nivelActividad} required>
                                                      <option value="">Seleccione</option>
                                                      <option value="sedentario">Sedentario</option>
                                                      <option value="ligera_actividad">Ligera actividad</option>
                                                      <option value="actividad_moderada">Actividad moderada</option>
                                                      <option value="actividad_intensa">Actividad intensa</option>
                                                      <option value="actividad_muy_intensa">Actividad muy intensa</option>
                                                    </select>
                                                    {errors.nivelActividad && <div className="error-text">{errors.nivelActividad}</div>}
                                                  </div>
                                                  <div className="edadPesoAlt alergias-wrapper">
                                                    <label>Alergias:</label><br />
                                                    <select id="alergiasSelect" className="select-control" onChange={(e) => {
                                                      const v = e.target.value;
                                                      if (v && !formData.alergias.includes(v)) setFormData((p) => ({ ...p, alergias: [...p.alergias, v] }));
                                                      e.target.selectedIndex = 0;
                                                    }}>
                                                      <option value="">Seleccione</option>
                                                      <option value="gluten">Gluten</option>
                                                      <option value="lactosa">Lactosa</option>
                                                      <option value="frutos_secos">Frutos secos</option>
                                                      <option value="mariscos">Mariscos</option>
                                                      <option value="ninguna">Ninguna</option>
                                                    </select>
                                                    <div className="alergias-lista">
                                                      {formData.alergias.length === 0 ? (
                                                        <p className="alergias-empty">No hay alergias seleccionadas.</p>
                                                      ) : (
                                                        formData.alergias.map((a, i) => (
                                                          <span key={i} className="chip">
                                                            {a}
                                                            <button type="button" onClick={() => setFormData((p) => ({ ...p, alergias: p.alergias.filter((x) => x !== a) }))} aria-label={`Quitar ${a}`}>
                                                              ❌
                                                            </button>
                                                          </span>
                                                        ))
                                                      )}
                                                    </div>
                                                    <input id="otrasAlergias" type="text" value={formData.otrasAlergias} onChange={handleChange} placeholder="Otras alergias" />
                                                  </div>
                                                  <div className="edadPesoAlt">
                                                    Sexo:<br />
                                                    <select id="sexo" className="select-control" value={formData.sexo} onChange={handleChange} onBlur={handleBlur} aria-invalid={!!errors.sexo} required>
                                                      <option value="">Seleccione</option>
                                                      <option value="masculino">Masculino</option>
                                                      <option value="femenino">Femenino</option>
                                                      <option value="otro">Otro</option>
                                                    </select>
                                                    {errors.sexo && <div className="error-text">{errors.sexo}</div>}
                                                  </div>
                                                </div>
                                              </div>

                                              <div className="divCorreo">
                                                Correo electrónico:<br />
                                                <input id="email" type="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} placeholder="Escriba su correo electrónico" aria-invalid={!!errors.email} required />
                                                {errors.email && <div className="error-text">{errors.email}</div>}
                                              </div>
                                              <div className="divCorreo">
                                                Contraseña:<br />
                                                <input id="password" type="password" value={formData.password} onChange={handleChange} onBlur={handleBlur} placeholder="Contraseña" aria-invalid={!!errors.password} required />
                                                {errors.password && <div className="error-text">{errors.password}</div>}
                                              </div>

                                              <br />
                                              <div className="botonesGroup">
                                                <button type="submit" className="buttonCrearIniciarSesion" disabled={loading || Object.keys(errors).length > 0}>
                                                  {loading ? "Registrando..." : "Crear Cuenta"}
                                                </button>
                                                <button type="button" className="buttonCrearIniciarSesion" id="btnIniciarSesion" onClick={() => showLoaderAndRedirect("/login")}>Iniciar Sesión</button>
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

const CrearCuentaPage = withAuth(CrearCuenta, { requireAuth: false, redirectIfLoggedIn: true });
export default CrearCuentaPage;