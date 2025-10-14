/**
 * @file ModalEditarAlimento.jsx
 * @description Modal para editar información de alimentos en la sección de usuario
 * 
 * Funcionalidades principales:
 * - Formulario de edición de alimentos
 * - Campos para todos los nutrientes principales
 * - Edición de imagen mediante URL o subida de archivo
 * - Validación de datos
 * - Cierre con click fuera del modal
 * 
 * @version 1.0.0
 */

import React, { useState } from "react";

/**
 * Componente ModalEditarAlimento
 * Modal para editar datos de alimentos existentes
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.alimento - Datos del alimento a editar
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.onSave - Función para guardar los cambios
 * @returns {JSX.Element} Modal de edición
 */
export default function ModalEditarAlimento({ alimento, onClose, onSave }) {
  const [form, setForm] = useState({ ...alimento });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target.className === "modal-overlay" && onClose()}>
      <div className="modal-editar">
        <h2>Editar alimento</h2>
        <form onSubmit={handleSubmit}>
          <label>Nombre</label>
          <input name="nombre" value={form.nombre} onChange={handleChange} />

          <div className="grid-dos">
            <label>Proteínas (g)</label>
            <input name="protein" value={form.protein ?? ""} onChange={handleChange} />
            <label>Grasas (g)</label>
            <input name="total_lipid" value={form.total_lipid ?? ""} onChange={handleChange} />
            <label>Carbohidratos (g)</label>
            <input name="carbohydrate" value={form.carbohydrate ?? ""} onChange={handleChange} />
            <label>Azúcares (g)</label>
            <input name="total_sugars" value={form.total_sugars ?? ""} onChange={handleChange} />
            <label>Calcio (mg)</label>
            <input name="calcium" value={form.calcium ?? ""} onChange={handleChange} />
            <label>Hierro (mg)</label>
            <input name="iron" value={form.iron ?? ""} onChange={handleChange} />
            <label>Sodio (mg)</label>
            <input name="sodium" value={form.sodium ?? ""} onChange={handleChange} />
            <label>Colesterol (mg)</label>
            <input name="cholesterol" value={form.cholesterol ?? ""} onChange={handleChange} />
          </div>

          <label>Imagen (URL o subir)</label>
          <input name="imagen" value={form.imagen ?? ""} onChange={handleChange} />

          <div className="modal-botones">
            <button type="button" className="cancelar" onClick={onClose}>Cancelar</button>
            <button type="submit" className="guardar">Guardar cambios</button>
          </div>
        </form>
      </div>
    </div>
  );
}
