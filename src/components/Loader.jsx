import React from "react";
import "../styles/Loader.css"; // 👈 crea este archivo si no existe

const Loader = ({ visible }) => {
  if (!visible) return null;

  const frutas = [
    "/Imagenes/Imagenes_de_carga/manzana1.png",
    "/Imagenes/Imagenes_de_carga/frutilla1.png",
    "/Imagenes/Imagenes_de_carga/naranja1.png",
  ];

  return (
    <div className="loader-overlay">
      <div className="loader-content">
        <span className="loader-text">
          Cargando<span className="dots">...</span>
        </span>
        <div className="loader-frutas">
          {frutas.map((src, index) => (
            <img
              key={index}
              src={src}
              alt={`Fruta ${index + 1}`}
              className="loader-fruta"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Loader;
