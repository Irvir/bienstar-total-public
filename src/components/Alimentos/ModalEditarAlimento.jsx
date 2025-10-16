import React, { useState } from "react";
import { API_BASE } from "../../shared/apiBase";

export default function ModalEditarAlimento({ alimento, onClose, onSave }) {
  const [form, setForm] = useState({ ...alimento });
  const [file, setFile] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSave = { ...form };

    if (file) {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch(`${API_BASE}/admin/foods/upload-image`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Error subiendo imagen: ${res.status} ${txt}`);
      }
      const json = await res.json();
      // server returns image_url; frontend historically expects `url` or `image`
      dataToSave.image = json.image_url || json.url || json.image || null;
      dataToSave.image_url = json.image_url || json.url || json.image || null;
    }

    onSave(dataToSave);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target.className === "modal-overlay" && onClose()}>
      <div className="modal-editar">
        <h2>{alimento.id ? "Editar" : "Crear"} alimento</h2>
        <form onSubmit={handleSubmit}>
          <label>Nombre</label>
          <input name="nombre" value={form.nombre ?? ""} onChange={handleChange} required />

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

          <label>Imagen</label>
          <input type="file" onChange={handleFileChange} />

          <div className="modal-botones">
            <button type="button" onClick={onClose}>Cancelar</button>
            <button type="submit">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
