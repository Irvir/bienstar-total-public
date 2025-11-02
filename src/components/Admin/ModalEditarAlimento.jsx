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
    id: alimento.id || "",
    id_alimento: alimento.id_alimento || "",
    nombre: alimento.nombre || "",
    image_url: alimento.image_url || "",
    categoria: alimento.categoria || "",
    Energia: alimento.Energia || "",
    Humedad: alimento.Humedad || "",
    Cenizas: alimento.Cenizas || "",
    Proteinas: alimento.Proteinas || "",
    H_de_C_disp: alimento.H_de_C_disp || "",
    Azucares_totales: alimento.Azucares_totales || "",
    Fibra_dietetica_total: alimento.Fibra_dietetica_total || "",
    Lipidos_totales: alimento.Lipidos_totales || "",
    Ac_grasos_totales: alimento.Ac_grasos_totales || "",
    Ac_grasos_poliinsat: alimento.Ac_grasos_poliinsat || "",
    Ac_grasos_trans: alimento.Ac_grasos_trans || "",
    Colesterol: alimento.Colesterol || "",
    Vitamina_A: alimento.Vitamina_A || "",
    Vitamina_C: alimento.Vitamina_C || "",
    Vitamina_D: alimento.Vitamina_D || "",
    Vitamina_E: alimento.Vitamina_E || "",
    Vitamina_K: alimento.Vitamina_K || "",
    Vitamina_B1: alimento.Vitamina_B1 || "",
    Vitamina_B2: alimento.Vitamina_B2 || "",
    Niacina: alimento.Niacina || "",
    Vitamina_B6: alimento.Vitamina_B6 || "",
    Ac_pantotenico: alimento.Ac_pantotenico || "",
    Vitamina_B12: alimento.Vitamina_B12 || "",
    Folatos: alimento.Folatos || "",
    Sodio: alimento.Sodio || "",
    Potasio: alimento.Potasio || "",
    Calcio: alimento.Calcio || "",
    Fosforo: alimento.Fosforo || "",
    Magnesio: alimento.Magnesio || "",
    Hierro: alimento.Hierro || "",
    Zinc: alimento.Zinc || "",
    Cobre: alimento.Cobre || "",
    Selenio: alimento.Selenio || "",
    estado: alimento.estado || "",
  });

  const [imageFile, setImageFile] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setImageFile(f);
      setForm((prev) => ({ ...prev, imagePreview: URL.createObjectURL(f) }));
    }
  };

  const submit = (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (imageFile) payload.imageFile = imageFile;
    onSave(payload);
  };

  /* Agrupamos los campos nutricionales por categorías para una mejor UI */
  const macros = [
    "Energia",
    "Proteinas",
    "H_de_C_disp",
    "Azucares_totales",
    "Fibra_dietetica_total",
    "Lipidos_totales",
    "Ac_grasos_totales",
    "Ac_grasos_poliinsat",
    "Ac_grasos_trans",
    "Colesterol",
  ];

  const vitaminas = [
    "Vitamina_A",
    "Vitamina_C",
    "Vitamina_D",
    "Vitamina_E",
    "Vitamina_K",
    "Vitamina_B1",
    "Vitamina_B2",
    "Niacina",
    "Vitamina_B6",
    "Ac_pantotenico",
    "Vitamina_B12",
    "Folatos",
  ];

  const minerales = [
    "Sodio",
    "Potasio",
    "Calcio",
    "Fosforo",
    "Magnesio",
    "Hierro",
    "Zinc",
    "Cobre",
    "Selenio",
  ];

  const otros = ["Humedad", "Cenizas"];

  

  return (
    <div
      className="modal-overlay"
      onClick={(ev) => ev.target.className === "modal-overlay" && onClose()}
    >
      <div className="modal-editar admin-modal">
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <h2>Editar alimento</h2>

        <form onSubmit={submit} className="modal-form">
          <label>Nombre</label>
          <input name="nombre" value={form.nombre} onChange={handleChange} />

          <label>Categoría</label>
          <input name="categoria" value={form.categoria} onChange={handleChange} />

          <label>Imagen (URL o subir archivo)</label>
          <input
            name="image_url"
            placeholder="URL de imagen"
            value={form.image_url}
            onChange={handleChange}
          />
          <div className="file-row">
            <input type="file" accept="image/*" onChange={handleFile} />
            {form.imagePreview ? (
              <img src={form.imagePreview} alt="preview" className="preview" />
            ) : (
              form.image_url && <img src={form.image_url} alt="current" className="preview" />
            )}
          </div>

          {/* Campos agrupados por categorías: macros, vitaminas, minerales */}
          <div className="nutri-section">
            <h3 className="nutri-section__title">Macros</h3>
            <div className="nutri-grid nutri-grid--macros">
              {macros.map((campo) => (
                <div className="nutri-item" key={campo}>
                  <label htmlFor={campo}>{campo.replace(/_/g, " ")}</label>
                  <input
                    id={campo}
                    name={campo}
                    value={form[campo]}
                    onChange={handleChange}
                    type="number"
                    step="any"
                  />
                </div>
              ))}
            </div>

            <h3 className="nutri-section__title">Vitaminas</h3>
            <div className="nutri-grid nutri-grid--vitamins">
              {vitaminas.map((campo) => (
                <div className="nutri-item" key={campo}>
                  <label htmlFor={campo}>{campo.replace(/_/g, " ")}</label>
                  <input
                    id={campo}
                    name={campo}
                    value={form[campo]}
                    onChange={handleChange}
                    type="number"
                    step="any"
                  />
                </div>
              ))}
            </div>

            <h3 className="nutri-section__title">Minerales</h3>
            <div className="nutri-grid nutri-grid--minerals">
              {minerales.map((campo) => (
                <div className="nutri-item" key={campo}>
                  <label htmlFor={campo}>{campo.replace(/_/g, " ")}</label>
                  <input
                    id={campo}
                    name={campo}
                    value={form[campo]}
                    onChange={handleChange}
                    type="number"
                    step="any"
                  />
                </div>
              ))}
            </div>

            <h3 className="nutri-section__title">Otros</h3>
            <div className="nutri-grid nutri-grid--otros">
              {otros.map((campo) => (
                <div className="nutri-item" key={campo}>
                  <label htmlFor={campo}>{campo.replace(/_/g, " ")}</label>
                  <input
                    id={campo}
                    name={campo}
                    value={form[campo]}
                    onChange={handleChange}
                    type="number"
                    step="any"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="modal-buttons">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-save">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
