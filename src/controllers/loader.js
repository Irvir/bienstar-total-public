/* ===== src/components/Loader.js ===== */
import React from 'react';
import '../styles/Index.css';


export default function Loader({ visible }) {
  if (!visible) return null;


  const frutas = [
    '/Imagenes/Loader/manzana.svg',
    '/Imagenes/Loader/file.svg',
    '/Imagenes/Loader/cereza.svg',
  ];


  return (
    <div id="loader" className="loader-overlay">
      <div className="loader-content">
        <span className="loader-text">Cargando</span>
        <div className="loader-dots">
          {frutas.map((src, i) => (
            <img key={i} src={src} alt={`Fruta ${i+1}`} />
          ))}
        </div>
      </div>
    </div>
  );
}