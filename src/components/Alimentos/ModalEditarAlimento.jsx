import React, { useState } from "react";

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
