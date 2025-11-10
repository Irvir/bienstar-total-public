import React, { useState } from 'react';
import { API_BASE } from '../shared/apiBase';

export default function AlimentoCard({ alimento, onEditar, onEliminar }) {
  const resolve = (candidate) => {
    if (!candidate) return `${API_BASE}/uploads/placeholder.png`;
    if (/^https?:\/\//i.test(candidate)) return candidate;
    if (candidate.startsWith('/')) return `${API_BASE}${candidate}`;
    return `${API_BASE}/uploads/${candidate}`;
  };

  const initialSrc = resolve(alimento.image_url || alimento.image || alimento.img || alimento.url);
  const [src, setSrc] = useState(initialSrc);
  const handleError = () => setSrc(`${API_BASE}/uploads/placeholder.png`);

  return (
    <div className="alimento-card">
      <img src={src} alt={alimento.nombre} onError={handleError} />
      <div className="alimento-info">
        <h3>{alimento.nombre}</h3>
        <p>Calorías: {alimento.calorias ?? '-'}</p>
        <p>Proteínas: {alimento.protein ?? '-'}</p>
        <p>Carbohidratos: {alimento.carbohydrate ?? '-'}</p>
      </div>
      {onEditar && <button onClick={() => onEditar(alimento)}>Editar</button>}
      {onEliminar && <button onClick={() => onEliminar(alimento.id, alimento.nombre)}>Eliminar</button>}
    </div>
  );
}
