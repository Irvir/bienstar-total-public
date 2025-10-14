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
  const [src, setSrc] = useState(alimento.image || "/Imagenes/placeholder.png");

  const handleError = () => setSrc("/Imagenes/placeholder.png");

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
        <div><b>E:</b> {alimento.energy ?? "-"}</div>
        <div><b>Prot:</b> {alimento.protein ?? "-"}</div>
        <div><b>Grasas:</b> {alimento.total_lipid ?? "-"}</div>
        <div><b>Carb:</b> {alimento.carbohydrate ?? "-"}</div>
      </div>
      <div className="admin-actions">
        <button onClick={() => onEditar(alimento)}>Editar</button>
        <button onClick={() => onEliminar(alimento.id, alimento.nombre)}>Eliminar</button>
      </div>
    </div>
  );
}
