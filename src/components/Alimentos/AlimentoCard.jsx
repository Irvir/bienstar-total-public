/**
 * @file AlimentoCard.jsx
 * @description Tarjeta de alimento con información nutricional completa
 * 
 * Funcionalidades principales:
 * - Visualización de nombre del alimento
 * - Tabla de información nutricional (proteínas, carbohidratos, grasas, etc.)
 * - Botones para editar y eliminar alimento
 * - Diseño adaptativo en grid
 * 
 * @version 1.0.0
 */

import React from "react";

/**
 * Componente AlimentoCard
 * Muestra la información nutricional completa de un alimento
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.alimento - Datos del alimento
 * @param {string} props.alimento.nombre - Nombre del alimento
 * @param {number} props.alimento.protein - Proteínas en gramos
 * @param {number} props.alimento.carbohydrate - Carbohidratos en gramos
 * @param {number} props.alimento.total_lipid - Grasas totales en gramos
 * @param {number} props.alimento.total_sugars - Azúcares totales en gramos
 * @param {number} props.alimento.calcium - Calcio en miligramos
 * @param {number} props.alimento.iron - Hierro en miligramos
 * @param {number} props.alimento.sodium - Sodio en miligramos
 * @param {number} props.alimento.cholesterol - Colesterol en miligramos
 * @param {Function} props.onEditar - Función callback para editar el alimento
 * @param {Function} props.onEliminar - Función callback para eliminar el alimento
 * @returns {JSX.Element} Tarjeta con información del alimento
 */
export default function AlimentoCard({ alimento, onEditar, onEliminar }) {
  return (
    <div className="ver-alimentos-card">
      <h3 className="nombre-alimento">{alimento.nombre ?? "Sin nombre"}</h3>
      <div className="nutri-grid">
        <div><b>Proteínas:</b> {alimento.protein ?? "-"} g</div>
        <div><b>Carbohidratos:</b> {alimento.carbohydrate ?? "-"} g</div>
        <div><b>Grasas:</b> {alimento.total_lipid ?? "-"} g</div>
        <div><b>Azúcares:</b> {alimento.total_sugars ?? "-"} g</div>
        <div><b>Calcio:</b> {alimento.calcium ?? "-"} mg</div>
        <div><b>Hierro:</b> {alimento.iron ?? "-"} mg</div>
        <div><b>Sodio:</b> {alimento.sodium ?? "-"} mg</div>
        <div><b>Colesterol:</b> {alimento.cholesterol ?? "-"} mg</div>
      </div>
      <div className="acciones-alimento">
        <button className="btn-accion editar" onClick={onEditar}>
          ✏️ Editar
        </button>
        <button className="btn-accion eliminar" onClick={onEliminar}>
          🗑 Eliminar
        </button>
      </div>
    </div>
  );
}
