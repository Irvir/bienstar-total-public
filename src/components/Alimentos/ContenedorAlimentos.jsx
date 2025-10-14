/**
 * @file ContenedorAlimentos.jsx
 * @description Contenedor principal de la galería de alimentos
 * 
 * Funcionalidades principales:
 * - Grid responsive de tarjetas de alimentos
 * - Muestra alimentos filtrados
 * - Mensaje cuando no hay resultados
 * - Manejo de clic para abrir modal de detalle
 */

import React from "react";
import "../../styles/Alimentos.css";
import AlimentoGridCard from "./AlimentoGridCard";

/**
 * Componente ContenedorAlimentos
 * Renderiza la cuadrícula de tarjetas de alimentos
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.filtered - Array de alimentos filtrados a mostrar
 * @param {Function} props.openModal - Función para abrir el modal con el alimento seleccionado
 * @returns {JSX.Element} Grid de alimentos
 */
export default function ContenedorAlimentos({ filtered, openModal }) {
    return (
        <div id="contenedorAlimentos">
            <div className="grid-container">
                {/* Renderizar alimentos o mensaje de sin resultados */}
                {filtered.length > 0 ? (
                    filtered.map(item => (
                        <AlimentoGridCard key={item.id} item={item} onClick={openModal} />
                    ))
                ) : (
                    <p className="sin-resultados">No se encontraron alimentos.</p>
                )}
            </div>
        </div>
    );
}
