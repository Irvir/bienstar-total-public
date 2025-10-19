import React, { useState } from "react";
import { API_BASE } from "../shared/apiBase";
import { foodToTwemojiSvg } from "../shared/foodEmojiMap";
import cloudImageUrl from "../shared/cloudImage";

export default function AlimentoCard({ alimento, onEditar, onEliminar }) {
  const resolve = (candidate) => {
    if (!candidate) return null;
    if (/^https?:\/\//i.test(candidate)) return candidate;
    if (candidate.startsWith("/")) return `${API_BASE}${candidate}`;
    return `${API_BASE}/uploads/${candidate}`;
  };

  const primarySrc = resolve(alimento.image_url || alimento.image || alimento.img || alimento.url);
  const cloudPhoto = cloudImageUrl(alimento.nombre || alimento.name, { width: 360, height: 240 });
  const fallbackVector = foodToTwemojiSvg(alimento.nombre || alimento.name);
  const initialSrc = primarySrc || cloudPhoto || fallbackVector || `${API_BASE}/uploads/placeholder.png`;
  const [src, setSrc] = useState(initialSrc);
  const handleError = () => {
    if (src !== cloudPhoto && cloudPhoto) {
      setSrc(cloudPhoto);
    } else if (src !== fallbackVector && fallbackVector) {
      setSrc(fallbackVector);
    } else {
      setSrc(`${API_BASE}/uploads/placeholder.png`);
    }
  };

  return (
    <div className="alimento-card">
  <img src={src} alt={alimento.nombre} onError={handleError} />
      <div className="alimento-info">
        <h3>{alimento.nombre}</h3>
        <p>Calorías: {alimento.calorias ?? "-"}</p>
        <p>Proteínas: {alimento.protein ?? "-"}</p>
        <p>Carbohidratos: {alimento.carbohydrate ?? "-"}</p>
      </div>
      {onEditar && <button onClick={() => onEditar(alimento)}>Editar</button>}
      {onEliminar && <button onClick={() => onEliminar(alimento.id, alimento.nombre)}>Eliminar</button>}
    </div>
  );
}
