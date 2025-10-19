import React, { useState } from "react";
import { API_BASE } from "../shared/apiBase";
import { foodToTwemojiSvg } from "../shared/foodEmojiMap";
import cloudImageUrl from "../shared/cloudImage";

export default function AlimentoGridCard({ item, onClick }) {
  // Preferencia para los distintos nombres de campo que puede tener la imagen,
  // según distintas versiones históricas del backend y del frontend.
  // Siempre se intenta devolver una URL absoluta.
  // Si no hay imagen, se devuelve la del placeholder.
  const pickImage = () => {
    const candidate = item.image_url || item.image || item.img || item.url || null;
    if (!candidate) return null;
    if (/^https?:\/\//i.test(candidate)) return candidate;
    if (candidate.startsWith("/")) return `${API_BASE}${candidate}`;
    return `${API_BASE}/uploads/${candidate}`;
  };

  const primary = pickImage();
  const cloudPhoto = cloudImageUrl(item.nombre || item.name, { width: 300, height: 300 });
  const vectorFallback = foodToTwemojiSvg(item.nombre || item.name);
  const initial = primary || cloudPhoto || vectorFallback || `${API_BASE}/uploads/placeholder.png`;
  const [src, setSrc] = useState(initial);
  const handleError = () => {
    if (src !== cloudPhoto && cloudPhoto) {
      setSrc(cloudPhoto);
    } else if (src !== vectorFallback && vectorFallback) {
      setSrc(vectorFallback);
    } else {
      setSrc(`${API_BASE}/uploads/placeholder.png`);
    }
  };

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
