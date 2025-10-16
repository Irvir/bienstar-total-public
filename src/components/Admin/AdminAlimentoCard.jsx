import React, { useState } from "react";
import { API_BASE } from "../shared/apiBase";

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
