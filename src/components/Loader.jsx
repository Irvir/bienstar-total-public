/**
 * @file Loader.jsx
 * @description Componente de carga global con animación de frutas
 * 
 * Funcionalidades principales:
 * - Overlay de pantalla completa durante carga
 * - Animación con imágenes de frutas
 * - Texto "Cargando..." con puntos animados
 * - Control de visibilidad mediante prop
 */

import React from "react";
import "../styles/Loader.css";

/**
 * Componente Loader
 * Indicador de carga con overlay y animación de frutas
 * 
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.visible - Controla si el loader es visible
 * @returns {JSX.Element|null} Loader o null si no es visible
 */
const Loader = ({ visible }) => {
  // No renderizar nada si no es visible
  if (!visible) return null;

  /**
   * Array de rutas de imágenes de frutas para la animación
   * - manzana: imagen 1
   * - frutilla: imagen 2
   * - naranja: imagen 3
   */
  const frutas = [
    "/Imagenes/Imagenes_de_carga/manzana1.png",
    "/Imagenes/Imagenes_de_carga/frutilla1.png",
    "/Imagenes/Imagenes_de_carga/naranja1.png",
  ];

  return (
    <div className="loader-overlay">
      <div className="loader-content">
        {/* Texto de carga con animación de puntos */}
        <span className="loader-text">
          Cargando<span className="dots">...</span>
        </span>
        
        {/* Contenedor de frutas animadas */}
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
