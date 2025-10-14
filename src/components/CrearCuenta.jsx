/**
 * @file CrearCuenta.jsx
 * @description Componente de registro de nuevos usuarios
 * 
 * Funcionalidades principales:
 * - Formulario de registro con validación
 * - Campos: nombre, email, contraseña, edad, peso, altura
 * - Envío de datos al backend para crear cuenta
 * - Manejo de errores con notificaciones
 * - Redirección automática al login tras registro exitoso
 * - Loader durante el proceso de registro
 * - Protección de ruta: solo usuarios NO autenticados
 */

import React, { useEffect, useState } from "react";
import "../styles/CrearCuenta.css";
import withAuth from "../components/withAuth";
import Encabezado from "./Encabezado";
import Pie from "./Pie";
import "../styles/Base.css";
import "../styles/Pie.css";
import Loader from "./Loader.jsx";
import "../styles/Encabezado.css";
import { API_BASE } from "../shared/apiBase";

/**
 * Componente CrearCuenta
 * Página de registro de nuevos usuarios con formulario completo
 * 
 * @returns {JSX.Element} Página de crear cuenta
 */
const CrearCuenta = () => {
  // ===========================================
  // STATE - Estado del componente
  // ===========================================
  
  /** @type {string} Página activa en el encabezado */
  const [activePage, setActivePage] = useState("crearcuenta");
  
  /** @type {boolean} Estado del loader durante registro */
  const [loading, setLoading] = useState(false);

  /**
   * @type {Object} Datos del formulario de registro
   * @property {string} name - Nombre del usuario
   * @property {string} email - Correo electrónico
   * @property {string} password - Contraseña
   * @property {string} age - Edad del usuario
   * @property {string} weight - Peso en kilogramos
   * @property {string} height - Altura en centímetros
   */
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    weight: "",
    height: "",
  });

  // ===========================================
  // EFFECTS - Efectos del ciclo de vida
  // ===========================================

  /**
   * Efecto 1: Detectar página activa desde la URL
   * - Extrae el nombre de la página de la ruta actual
   * - Actualiza el estado para resaltar en el encabezado
   */
  useEffect(() => {
    const currentPage = window.location.pathname.split("/").pop() || "crearcuenta";
    setActivePage(currentPage);
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
   * Maneja cambios en los inputs del formulario
   * @param {Event} e - Evento de cambio del input
   */
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  /**
   * Maneja el envío del formulario de registro
   * - Valida y envía datos al backend
   * - Muestra notificaciones según el resultado
   * - Redirige al login si el registro es exitoso
   * @param {Event} e - Evento de submit del formulario
   */
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

      // Manejo de respuesta: éxito o error
      if (!res.ok) {
        if (data.errores?.length) {
          data.errores.forEach((err) => window.notify(err, { type: "error" }));
        } else {
          window.notify(data.message || "Error al registrar", { type: "error" });
        }
      } else {
        // Registro exitoso: notificar y redirigir
        window.notify(data.message || "Registro exitoso", { type: "success" });
        setTimeout(() => (window.location.href = "/login"), 2500);
      }
    } catch (err) {
      // Error de conexión con el servidor
      console.error(err);
      window.notify("Error de conexión al servidor", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // ===========================================
  // RENDER - Renderizado del componente
  // ===========================================
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

// Exportar con HOC de autenticación
// requireAuth: false - No requiere sesión (página pública)
// redirectIfLoggedIn: true - Redirige al perfil si ya está logueado
const CrearCuentaWithAuth = withAuth(CrearCuenta, { requireAuth: false, redirectIfLoggedIn: true });
CrearCuentaWithAuth.displayName = 'CrearCuentaWithAuth';
export default CrearCuentaWithAuth;