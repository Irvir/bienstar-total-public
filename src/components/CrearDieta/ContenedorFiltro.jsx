/**
 * @file ContenedorFiltro.jsx
 * @description Componente de filtro/buscador para la sección de crear dieta
 * 
 * Funcionalidades principales:
 * - Barra de búsqueda con ícono de lupa
 * - Input para filtrar alimentos en tiempo real
 * - Diseño minimalista con estilos de Alimentos.css
 * 
 * @version 1.0.0
 */

import React from "react";
import '../../styles/Alimentos.css';

/**
 * Componente ContenedorFiltro
 * Barra de búsqueda para filtrar alimentos
 * 
 * @returns {JSX.Element} Contenedor de filtro con input de búsqueda
 */
export default function ContenedorFiltro() {
    return (
        <div id="contenedorFiltro">
            <div id="lupe"></div>
            <div style={{ flex: 1 }}>
                <input type="text" id="filtro" placeholder="Buscar alimento..." />
            </div>
        </div>
    );
}