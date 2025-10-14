/**
 * @file Error404.jsx
 * @description Componente de página 404 - Página no encontrada
 * 
 * Funcionalidades principales:
 * - Muestra mensaje de error 404
 * - Informa al usuario que la página no existe
 * - Botón para volver al inicio
 */

import React from 'react';
import '../styles/Error404.css';

/**
 * Componente Error404
 * Página de error para rutas no encontradas
 * 
 * @returns {JSX.Element} Página de error 404
 */
export default function Error404() {
    return (
        <div className="error404-page">
            <div className="container">
                <h1>404</h1>
                <h2>Página no encontrada</h2>
                <p>Lo sentimos, la página que buscas no existe o ha sido movida.</p>
                <a href="index.html" className="btn">Volver al inicio</a>
            </div>
        </div>
    );
}
