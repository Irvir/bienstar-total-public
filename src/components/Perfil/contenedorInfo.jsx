import React, { useState, useEffect } from "react";
import { API_BASE } from "../shared/apiBase";
import "../../styles/Perfil.css";

export default function ContenedorInfo({ usuario, handleCerrarSesion, handleBorrarCuenta, onActualizarUsuario }) {
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    edad: "",
    peso: "",
    altura: "",
    actividad_fisica: "",
    sexo: "",
    email: "",
    alergias: "",
  });

  // Sincroniza el formulario cuando cambia el usuario
  useEffect(() => {
    if (usuario) {
      setForm({
        nombre: usuario.nombre || "",
        edad: usuario.edad ?? "",
        peso: usuario.peso ?? "",
        altura: usuario.altura ?? "",
        actividad_fisica: usuario.actividad_fisica || "",
        sexo: usuario.sexo || "",
        email: usuario.email || "",
        // store alergias as a comma-separated string in the edit form
        alergias: Array.isArray(usuario.alergias)
          ? (usuario.alergias.length ? usuario.alergias.join(', ') : '')
          : (usuario.alergias || ""),
      });
    }
  }, [usuario]);

  const startEdit = () => setEditMode(true);
  const cancelEdit = () => setEditMode(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!form.nombre.trim()) return { ok: false, message: "El nombre no puede estar vacío" };

    const edad = form.edad === "" ? null : Number(form.edad);
    if (edad !== null && (edad < 16 || edad > 99)) return { ok: false, message: "Edad entre 16 y 99" };

    const peso = form.peso === "" ? null : Number(form.peso);
    if (peso !== null && (peso < 31 || peso > 169)) return { ok: false, message: "Peso entre 31 y 169 kg" };

    let altura = form.altura === "" ? null : Number(form.altura);
    if (altura !== null) {
      if (altura < 10) altura = altura * 100; // metros a cm
      if (altura < 81 || altura > 249) return { ok: false, message: "Altura entre 81 y 249 cm" };
    }

    return { ok: true };
  };

  const saveEdit = async () => {
    const v = validateForm();
    if (!v.ok) {
      window.notify?.(v.message, { type: "error" });
      return;
    }

    const payload = {
      nombre: form.nombre.trim(),
      edad: form.edad === "" ? null : Number(form.edad),
      peso: form.peso === "" ? null : Number(form.peso),
      altura: form.altura === "" ? null : Number(form.altura < 10 ? form.altura * 100 : form.altura),
      actividad_fisica: form.actividad_fisica,
      sexo: form.sexo,
      // convert comma-separated string into array for the API
      alergias: (typeof form.alergias === 'string' && form.alergias.trim() !== '')
        ? form.alergias.split(',').map(s => s.trim()).filter(Boolean)
        : [],
    };

    try {
      if (usuario?.id) {
        const res = await fetch(`${API_BASE}/user/${usuario.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data = await res.json();
          const updatedUser = data.usuario; // extraemos solo la propiedad usuario
          onActualizarUsuario?.(updatedUser);

          setForm({
            nombre: updatedUser.nombre || "",
            edad: updatedUser.edad ?? "",
            peso: updatedUser.peso ?? "",
            altura: updatedUser.altura ?? "",
            actividad_fisica: updatedUser.actividad_fisica || "",
            sexo: updatedUser.sexo || "",
            email: updatedUser.email || "",
            // updatedUser.alergias comes as an array from the server; convert to string for the form
            alergias: Array.isArray(updatedUser.alergias) ? (updatedUser.alergias.length ? updatedUser.alergias.join(', ') : '') : (updatedUser.alergias || ""),
          });

          window.notify?.("Perfil actualizado", { type: "success" });
          setEditMode(false);
        } else {
          const err = await res.json().catch(() => ({}));
          window.notify?.(err.message || "No se pudo actualizar", { type: "error" });
        }
      }
    } catch (err) {
      console.error(err);
      window.notify?.("Error de conexión con el servidor", { type: "error" });
    }
  };

  const etiquetas = {
    nombre: "Nombre:",
    edad: "Edad:",
    peso: "Peso:",
    altura: "Altura:",
    email: "Correo:"
  };

  return (
    <div id="contenedorInfoSesion">
      <div id="contenedorInfo">
        <div id="tituloInfoRow">
          <div id="tituloInfo">Información de usuario:</div>
          {!editMode ? (
            <button className="btnEditarPerfil" onClick={startEdit}>
              <span>Editar</span>
            </button>
          ) : (
            <div className="accionesEditarPerfil">
              <button className="btnGuardarPerfil" onClick={saveEdit}>Guardar</button>
              <button className="btnCancelarPerfil" onClick={cancelEdit}>Cancelar</button>
            </div>
          )}
        </div>

        {/* Datos básicos */}
        {Object.keys(etiquetas).map((campo) => (
          <div className="datoUsuarioRow" key={campo}>
            <div className="info">{etiquetas[campo]}</div>
            {editMode && campo !== "email" ? (
              <input
                type={["edad", "peso", "altura"].includes(campo) ? "number" : "text"}
                name={campo}
                value={form[campo]}
                onChange={handleChange}
                min={campo === "edad" ? 16 : undefined}
                max={campo === "edad" ? 99 : undefined}
                step={["peso", "altura"].includes(campo) ? 0.1 : undefined}
              />
            ) : (
              <span>{usuario?.[campo] || "-"}</span>
            )}
          </div>
        ))}

        {/* Sexo */}
        <div className="datoUsuarioRow">
          <div className="info">Sexo:</div>
          {editMode ? (
            <select name="sexo" value={form.sexo} onChange={handleChange}>
              <option value="">Seleccione</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
              <option value="otro">Otro</option>
            </select>
          ) : (
            <span>{usuario?.sexo || "-"}</span>
          )}
        </div>

        {/* Actividad física */}
        <div className="datoUsuarioRow">
          <div className="info">Actividad Física:</div>
          {editMode ? (
            <select name="actividad_fisica" value={form.actividad_fisica} onChange={handleChange}>
              <option value="">Seleccione</option>
              <option value="sedentario">Sedentario</option>
              <option value="ligero">Ligero</option>
              <option value="moderado">Moderado</option>
              <option value="intenso">Intenso</option>
            </select>
          ) : (
            <span>{usuario?.actividad_fisica || "-"}</span>
          )}
        </div>

        {/* Alergias */}
        <div className="datoUsuarioRow">
          <div className="info">Alergias:</div>
          {editMode ? (
            <input
              type="text"
              name="alergias"
              value={form.alergias}
              onChange={handleChange}
              placeholder="Escriba sus alergias"
            />
          ) : (
            <span>{usuario?.alergias || "-"}</span>
          )}
        </div>
      </div>

      <div id="contenedorBorrarCuenta">
        <div id="contenedorCerrarSesion">
          <button id="cerrarSesion" className="perfil-btn perfil-btn--secondary" onClick={handleCerrarSesion} aria-label="Cerrar sesión">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M16 13v-2H7V8l-5 4 5 4v-3zM20 3h-8v2h8v14h-8v2h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" fill="currentColor" /></svg>
            <span>CERRAR SESIÓN</span>
          </button>
        </div>
        <button id="borrarCuenta" className="perfil-btn perfil-btn--danger" onClick={handleBorrarCuenta} aria-label="Borrar cuenta">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M9 3v1H4v2h16V4h-5V3H9zm1 5v9h2V8H10zM6 8v9h2V8H6zm10 0v9h2V8h-2z" fill="currentColor" /></svg>
          <span>BORRAR CUENTA</span>
        </button>
      </div>
    </div>
  );
}