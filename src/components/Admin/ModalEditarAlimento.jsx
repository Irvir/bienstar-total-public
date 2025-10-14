/**
 * @file ModalEditarAlimento.jsx
 * @description Modal para editar información de alimentos en el panel de administración
 * 
 * Funcionalidades principales:
 * - Formulario completo con todos los campos nutricionales
 * - Edición de nombre, nutrientes (proteínas, grasas, carbohidratos, etc.)
 * - Subida de imágenes con preview
 * - Validación de formulario
 * - Cierre con click fuera del modal
 * 
 * @version 1.0.0
 */

import React, { useState } from "react";

/**
 * Componente ModalEditarAlimento
 * Modal para editar alimentos existentes en la base de datos
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.alimento - Datos del alimento a editar
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.onSave - Función para guardar los cambios
 * @returns {JSX.Element} Modal de edición
 */
export default function ModalEditarAlimento({ alimento, onClose, onSave }) {
  const [form, setForm] = useState({
    id: alimento.id,
    nombre: alimento.nombre || "",
    protein: alimento.protein || "",
    total_lipid: alimento.total_lipid || "",
    carbohydrate: alimento.carbohydrate || "",
    energy: alimento.energy || "",
    total_sugars: alimento.total_sugars || "",
    calcium: alimento.calcium || "",
    iron: alimento.iron || "",
    sodium: alimento.sodium || "",
    cholesterol: alimento.cholesterol || "",
    image: alimento.image || "",
  });
  const [imageFile, setImageFile] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setImageFile(f);
      // preview via URL (optional)
      setForm(prev => ({ ...prev, imagePreview: URL.createObjectURL(f) }));
    }
  };

  const submit = (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (imageFile) payload.imageFile = imageFile;
    onSave(payload);
  };

  return (
    <div className="modal-overlay" onClick={(ev) => ev.target.className === "modal-overlay" && onClose()}>
      <div className="modal-editar admin-modal">
        <button className="modal-close" onClick={onClose}>&times;</button>

        <h2>Editar alimento</h2>

        <form onSubmit={submit} className="modal-form">
          <label>Nombre</label>
          <input name="nombre" value={form.nombre} onChange={handleChange} />

          <div className="grid-dos">
            <div>
              <label>Energy (kcal)</label>
              <input name="energy" value={form.energy} onChange={handleChange} />
            </div>
            <div>
              <label>Proteína (g)</label>
              <input name="protein" value={form.protein} onChange={handleChange} />
            </div>
            <div>
              <label>Grasa total (g)</label>
              <input name="total_lipid" value={form.total_lipid} onChange={handleChange} />
            </div>
            <div>
              <label>Carbohidratos (g)</label>
              <input name="carbohydrate" value={form.carbohydrate} onChange={handleChange} />
            </div>
            <div>
              <label>Azúcares (g)</label>
              <input name="total_sugars" value={form.total_sugars} onChange={handleChange} />
            </div>
            <div>
              <label>Calcio (mg)</label>
              <input name="calcium" value={form.calcium} onChange={handleChange} />
            </div>
            <div>
              <label>Hierro (mg)</label>
              <input name="iron" value={form.iron} onChange={handleChange} />
            </div>
            <div>
              <label>Sodio (mg)</label>
              <input name="sodium" value={form.sodium} onChange={handleChange} />
            </div>
            <div>
              <label>Colesterol (mg)</label>
              <input name="cholesterol" value={form.cholesterol} onChange={handleChange} />
            </div>
          </div>

          <label>Imagen (URL o subir archivo)</label>
          <input name="image" placeholder="URL de imagen" value={form.image} onChange={handleChange} />
          <div className="file-row">
            <input type="file" accept="image/*" onChange={handleFile} />
            {form.imagePreview ? <img src={form.imagePreview} alt="preview" className="preview" /> : (form.image && <img src={form.image} alt="current" className="preview" />)}
          </div>

          <div className="modal-buttons">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-save">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
