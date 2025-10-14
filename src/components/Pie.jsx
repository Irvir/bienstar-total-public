/**
 * Pie.jsx - Componente del pie de página (footer)
 * 
 * Contiene enlaces a redes sociales de la aplicación
 */

import React from "react";
import "../styles/Pie.css";

/**
 * Componente del pie de página
 * 
 * @returns {JSX.Element} Footer con enlaces a redes sociales
 */
export default function Pie() {
    return (
        <div id="pie">
            <div className="footer-inner">
                {/* Enlace a Instagram */}
                <a 
                    href="#" 
                    className="footer-link ig" 
                    title="Instagram"
                >
                    <img 
                        src="/Imagenes/Pie_Pagina/igLogo.png" 
                        alt="Instagram" 
                    />
                </a>
            
                {/* Enlace a YouTube */}
                <a
                    href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-link yt"
                    title="YouTube"
                >
                    <img 
                        src="/Imagenes/Pie_Pagina/ytLogo.webp" 
                        alt="YouTube" 
                    />
                </a>
            </div>
        </div>
    );
}
