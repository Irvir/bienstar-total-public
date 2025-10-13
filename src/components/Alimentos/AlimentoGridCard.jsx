import React, { useState } from "react";

export default function AlimentoGridCard({ item, onClick }) {
  const initial = item.image || item.img || "/Imagenes/placeholder.png";
  const [src, setSrc] = useState(initial);
  const handleError = () => setSrc("/Imagenes/placeholder.png");

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
