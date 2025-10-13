import React from "react";

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
