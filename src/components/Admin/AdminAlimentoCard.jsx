/**
 * @file AdminAlimentoCard.jsx
 * @description Tarjeta de alimento para el panel de administración
 * 
 * Funcionalidades principales:
 * - Muestra información básica del alimento (nombre, imagen, nutrientes principales)
 * - Botones para editar y eliminar el alimento
 * - Manejo de imágenes con fallback a placeholder
 * - Lazy loading de imágenes
 * 
 * @version 1.0.0
 */

import React, { useState } from "react";
import { API_BASE } from "../shared/apiBase";

/**
 * Componente AdminAlimentoCard
 * Tarjeta individual de alimento en el panel de administración
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.alimento - Datos del alimento
 * @param {number} props.alimento.id - ID del alimento
 * @param {string} props.alimento.nombre - Nombre del alimento
 * @param {string} props.alimento.image - URL de la imagen
 * @param {number} props.alimento.energy - Energía en kcal
 * @param {number} props.alimento.protein - Proteínas en gramos
 * @param {number} props.alimento.total_lipid - Grasas totales en gramos
 * @param {number} props.alimento.carbohydrate - Carbohidratos en gramos
 * @param {Function} props.onEditar - Función para editar el alimento
 * @param {Function} props.onEliminar - Función para eliminar el alimento
 * @returns {JSX.Element} Tarjeta de alimento
 */
export default function AdminAlimentoCard({ alimento, onEditar, onEliminar }) {
  const resolve = (candidate) => {
    if (!candidate) return `${API_BASE}/uploads/placeholder.png`;
    if (/^https?:\/\//i.test(candidate)) return candidate;
    if (candidate.startsWith("/")) return `${API_BASE}${candidate}`;
    return `${API_BASE}/uploads/${candidate}`;
  };

  const initial = resolve(alimento.image_url || alimento.image || alimento.img || alimento.url);
  const [src, setSrc] = useState(initial);

  const handleError = () => setSrc(`${API_BASE}/uploads/placeholder.png`);

  return (
    <div className="admin-card">
      <img
        className="admin-card-img"
        src={src}
        alt={alimento.nombre}
        loading="lazy"
        onError={handleError}
      />
      <h3>{alimento.nombre}</h3>
      <div className="admin-nutrients">
        {/*id, id_alimento, nombre, image_url, categoria, Energia, Humedad, Cenizas, Proteinas, H_de_C_disp, Azucares_totales, Fibra_dietetica_total, Lipidos_totales, Ac_grasos_totales, Ac_grasos_poliinsat, Ac_grasos_trans, Colesterol, Vitamina_A, Vitamina_C, Vitamina_D, Vitamina_E, Vitamina_K, Vitamina_B1, Vitamina_B2, Niacina, Vitamina_B6, Ac_pantotenico, Vitamina_B12, Folatos, Sodio, Potasio, Calcio, Fosforo, Magnesio, Hierro, Zinc, Cobre, Selenio, estado */}
        <div><b>Imagen:</b> {alimento.image_url ?? "-"}</div>
        <div><b>Categoría:</b> {alimento.categoria ?? "-"}</div>
        <div><b>Energía:</b> {alimento.Energia ?? "-"} kcal</div>
        <div><b>Humedad:</b> {alimento.Humedad ?? "-"} % </div>
        <div><b>Cenizas:</b> {alimento.Cenizas ?? "-"} % </div>
        <div><b>Proteínas:</b> {alimento.Proteinas ?? "-"} g</div>
        <div><b>H. de C. disp:</b> {alimento.H_de_C_disp ?? "-"} g</div>
        <div><b>Azúcares totales:</b> {alimento.Azucares_totales ?? "-"} g</div>
        <div><b>Fibra dietética total:</b> {alimento.Fibra_dietetica_total ?? "-"} g</div>
        <div><b>Lípidos totales:</b> {alimento.Lipidos_totales ?? "-"} g.......</div>


      </div>
      <div className="admin-actions">
        <button onClick={() => onEditar(alimento)}>Editar</button>
        <button onClick={() => onEliminar(alimento.id, alimento.nombre)}>Eliminar</button>
      </div>
    </div>
  );
}
