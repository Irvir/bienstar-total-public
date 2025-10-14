/**
 * @file AlimentoGridCard.jsx
 * @description Tarjeta individual de alimento en la galería
 * 
 * Funcionalidades principales:
 * - Muestra imagen del alimento con lazy loading
 * - Fallback a placeholder si la imagen falla
 * - Muestra nombre del alimento
 * - Clickeable para abrir modal de detalle
 */

import React, { useState } from "react";

/**
 * Componente AlimentoGridCard
 * Tarjeta de alimento con imagen y nombre
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.item - Datos del alimento
 * @param {string} props.item.id - ID del alimento
 * @param {string} props.item.name - Nombre del alimento
 * @param {string} props.item.image - URL de la imagen
 * @param {Function} props.onClick - Función a ejecutar al hacer clic
 * @returns {JSX.Element} Tarjeta de alimento
 */
export default function AlimentoGridCard({ item, onClick }) {
  // Estado de la imagen con fallback a placeholder
  const initial = item.image || item.img || "/Imagenes/placeholder.png";
  const [src, setSrc] = useState(initial);
  
  /**
   * Maneja error de carga de imagen
   * Cambia a placeholder cuando falla la carga
   */
  const handleError = () => setSrc("/Imagenes/placeholder.png");

  return (
    <div className="cuadro" onClick={() => onClick?.(item)}>
      <button className="botonAlimento">
        <img 
          src={src} 
          id="imgAlimento" 
          alt={item.name || item.nombre} 
          loading="lazy" 
          onError={handleError} 
        />
        <br />
        <p className="nombre" data-alimento-id={item.id}>
          {item.name || item.nombre}
        </p>
      </button>
    </div>
  );
}
