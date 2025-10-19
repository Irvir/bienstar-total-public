import React, { useState } from "react";
import { API_BASE } from "../shared/apiBase";

export default function AlimentoGridCard({ item, onClick }) {
  // Preferencia para los distintos nombres de campo que puede tener la imagen,
  // según distintas versiones históricas del backend y del frontend.
  // Siempre se intenta devolver una URL absoluta.
  // Si no hay imagen, se devuelve la del placeholder.
  const pickImage = () => {
    const candidate = item.image_url || item.image || item.img || item.url || null;
    if (!candidate) return `${API_BASE}/uploads/placeholder.png`;
    if (/^https?:\/\//i.test(candidate)) return candidate;
    if (candidate.startsWith("/")) return `${API_BASE}${candidate}`;
    return `${API_BASE}/uploads/${candidate}`;
  };

  const [src, setSrc] = useState(pickImage());
  const handleError = () => setSrc(`${API_BASE}/uploads/placeholder.png`);

  return (
    <div className="cuadro" onClick={() => onClick?.(item)}>
      <button className="botonAlimento">
        <img src={src} id="imgAlimento" alt={item.name || item.nombre} loading="lazy" onError={handleError} />
        <br />
        <p className="nombre" data-alimento-id={item.id}>
          {item.name || item.nombre}
        </p>
      </button>
    </div>
  );
}
