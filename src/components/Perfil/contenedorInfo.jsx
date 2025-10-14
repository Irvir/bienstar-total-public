import React, { useState } from "react";
import "../../styles/Perfil.css";
import { API_BASE } from "../../shared/apiBase";

export default function ContenedorInfo({ usuario, handleCerrarSesion, handleBorrarCuenta, onActualizarUsuario }) {
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState({
        name: usuario?.name || "",
        age: usuario?.age ?? "",
        weight: usuario?.weight ?? "",
        height: usuario?.height ?? "",
        // email se muestra solo lectura en edición
        email: usuario?.email || "",
    });

    // Validaciones alineadas con el backend
    const validateForm = () => {
        const name = String(form.name || "").trim();
        const age = form.age === "" || form.age === null ? null : Number(form.age);
        const weight = form.weight === "" || form.weight === null ? null : Number(form.weight);
        let height = form.height === "" || form.height === null ? null : Number(form.height);

        if (!name) return { ok: false, message: "El nombre no puede estar vacío." };

        if (age !== null) {
            if (Number.isNaN(age)) return { ok: false, message: "Edad inválida." };
            if (age < 16 || age > 99) return { ok: false, message: "La edad debe estar entre 16 y 99." };
        }

        if (weight !== null) {
            if (Number.isNaN(weight)) return { ok: false, message: "Peso inválido." };
            if (weight < 31 || weight > 169) return { ok: false, message: "El peso debe estar entre 31 y 169 kg." };
        }

        if (height !== null) {
            if (Number.isNaN(height)) return { ok: false, message: "Altura inválida." };
            // si el usuario ingresa metros (< 10), convertir a cm
            if (height < 10) height = height * 100;
            if (height < 81 || height > 249) return { ok: false, message: "La altura debe estar entre 81 y 249 cm." };
        }

        return { ok: true };
    };

    const startEdit = () => {
        setForm({
            name: usuario?.name || "",
            age: usuario?.age ?? "",
            weight: usuario?.weight ?? "",
            height: usuario?.height ?? "",
            email: usuario?.email || "",
        });
        setEditMode(true);
    };

    const cancelEdit = () => {
        setEditMode(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const saveEdit = async () => {
        // Validación previa
        const v = validateForm();
        if (!v.ok) {
            window.notify?.(v.message || "Datos inválidos", { type: "error" });
            return;
        }

        // Preparar payload normalizado
        const name = String(form.name || "").trim();
        const age = form.age === "" || form.age === null ? null : Number(form.age);
        const weight = form.weight === "" || form.weight === null ? null : Number(form.weight);
        let height = form.height === "" || form.height === null ? null : Number(form.height);
        if (height !== null && height < 10) height = height * 100; // metros -> cm

        const payload = {
            ...usuario,
            name,
            age,
            weight,
            height,
            email: String(usuario?.email || "").trim(),
        };

        // Guardar en API; si falla, no mostrar éxito ni actualizar local
        try {
            if (usuario?.id) {
                const res = await fetch(`${API_BASE}/user/${usuario.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        originalEmail: usuario.email,
                        name: payload.name,
                        height: payload.height,
                        weight: payload.weight,
                        age: payload.age,
                    }),
                });
                if (res.ok) {
                    const updated = await res.json();
                    try { localStorage.setItem("usuario", JSON.stringify(updated)); } catch {}
                    onActualizarUsuario?.(updated);
                    window.notify?.("Perfil actualizado", { type: "success" });
                    setEditMode(false);
                    return;
                } else {
                    const err = await res.json().catch(() => ({}));
                    window.notify?.(err.message || "No se pudo actualizar en el servidor", { type: "error" });
                    return;
                }
            }
        } catch (err) {
            console.warn("Error de red al guardar", err);
            window.notify?.("Error de conexión con el servidor", { type: "error" });
            return;
        }
    };

    return (
        <div id="contenedorInfoSesion">
            <div id="contenedorInfo">
                <div id="tituloInfoRow">
                    <div id="tituloInfo">Información de usuario:</div>
                    {!editMode ? (
                        <button className="btnEditarPerfil" onClick={startEdit} aria-label="Editar perfil">
                            <svg className="iconLapiz" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                                <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm2.92 1.33H5v-.92l8.06-8.06.92.92L5.92 18.58zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                            </svg>
                            <span>Editar</span>
                        </button>
                    ) : (
                        <div className="accionesEditarPerfil">
                            <button className="btnGuardarPerfil" onClick={saveEdit}>Guardar</button>
                            <button className="btnCancelarPerfil" onClick={cancelEdit}>Cancelar</button>
                        </div>
                    )}
                </div>
                <div style={{ width: "100%", height: "80%" }}>
                    <div className="datoUsuarioRow">
                        <div className="info">Nombre:</div>
                        {editMode ? (
                            <span className="spNombre">
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Tu nombre"
                                />
                            </span>
                        ) : (
                            <span className="spNombre">{usuario.name}</span>
                        )}
                    </div>
                    <div className="datoUsuarioRow">
                        <div className="info">Edad:</div>
                        {editMode ? (
                            <span className="spAge">
                                <input
                                    type="number"
                                    name="age"
                                    value={form.age}
                                    onChange={handleChange}
                                    min="16"
                                    max="99"
                                    placeholder="Edad"
                                />
                            </span>
                        ) : (
                            <span className="spAge">{usuario.age || "-"}</span>
                        )}
                    </div>
                    <div className="datoUsuarioRow">
                        <div className="info">Peso:</div>
                        {editMode ? (
                            <span className="spWeight">
                                <input
                                    type="number"
                                    name="weight"
                                    value={form.weight}
                                    onChange={handleChange}
                                    min="31"
                                    max="169"
                                    step="0.1"
                                    placeholder="Peso (kg)"
                                />
                            </span>
                        ) : (
                            <span className="spWeight">{usuario.weight ? usuario.weight + " kg" : "-"}</span>
                        )}
                    </div>
                    <div className="datoUsuarioRow">
                        <div className="info">Altura:</div>
                        {editMode ? (
                            <span className="spHeight">
                                <input
                                    type="number"
                                    name="height"
                                    value={form.height}
                                    onChange={handleChange}
                                    min="81"
                                    max="249"
                                    step="0.1"
                                    placeholder="Altura (cm)"
                                />
                            </span>
                        ) : (
                            <span className="spHeight">{usuario.height ? usuario.height + " cm" : "-"}</span>
                        )}
                    </div>
                    <div className="datoUsuarioRow">
                        <div className="info">Correo:</div>
                        {editMode ? (
                            <span className="spEmail spReadonly" title="El correo no se puede editar desde aquí">
                                🔒 {usuario.email || "-"}
                            </span>
                        ) : (
                            <span className="spEmail">{usuario.email || "-"}</span>
                        )}
                    </div>
                </div>
            </div>

            <div id="contenedorCerrarSesion">
                <div id="imagenUser"></div>
                <button id="cerrarSesion" onClick={handleCerrarSesion}>CERRAR SESIÓN</button>
            </div>

            <div id="contenedorBorrarCuenta">
                <button id="borrarCuenta" onClick={handleBorrarCuenta}>BORRAR CUENTA</button>
            </div>
        </div>
    );
}
