/**
 * @file Filtro.jsx
 * @description Componente de búsqueda y filtrado de alimentos
 * 
 * Funcionalidades principales:
 * - Input de texto para buscar alimentos
 * - Ícono de lupa decorativo
 * - Filtrado en tiempo real mientras el usuario escribe
 */

import React from "react";
import "../../styles/Alimentos.css";

/**
 * Componente Filtro
 * Barra de búsqueda con ícono de lupa
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.filter - Texto actual del filtro
 * @param {Function} props.setFilter - Función para actualizar el texto del filtro
 * @returns {JSX.Element} Barra de búsqueda
 */
export default function Filtro({ filter, setFilter }) {
    return (
        <div id="contenedorFiltro">
            {/* Ícono de lupa decorativo */}
            <div id="lupe" />
            
            {/* Campo de búsqueda */}
            <div className="filtro-input-wrap">
                <input
                    type="text"
                    id="filtro"
                    placeholder="Buscar alimento..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
            </div>
        </div>
    );
}
