/**
 * Loader.js - Componente de carga animado
 * 
 * Muestra un indicador de carga con frutas animadas
 * Se muestra cuando visible=true y se oculta cuando visible=false
 */

import React from 'react';
import '../styles/Index.css';

/**
 * Componente Loader
 * 
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.visible - Determina si el loader es visible
 * @returns {JSX.Element|null} Elemento del loader o null si no es visible
 */
export default function Loader({ visible }) {
    // No renderizar nada si no es visible
    if (!visible) return null;

    /**
     * Rutas de imágenes de frutas para la animación
     * @constant {string[]}
     */
    const frutas = [
        '/Imagenes/Imagenes_de_carga/manzana1.png',
        '/Imagenes/Imagenes_de_carga/frutilla1.png',
        '/Imagenes/Imagenes_de_carga/naranja1.png'
    ];

    return (
        <div id="loader" className="loader-overlay">
            <div className="loader-content">
                <span className="loader-text">Cargando</span>
                <div className="loader-dots">
                    {frutas.map((src, i) => (
                        <img 
                            key={i} 
                            src={src} 
                            alt={`Fruta ${i+1}`} 
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}