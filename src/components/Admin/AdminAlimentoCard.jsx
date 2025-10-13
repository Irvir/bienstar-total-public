import React, { useState } from "react";

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
