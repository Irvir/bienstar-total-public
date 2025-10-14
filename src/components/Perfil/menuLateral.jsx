/**
 * @file menuLateral.jsx
 * @description Menú lateral de navegación del perfil
 * 
 * Funcionalidades principales:
 * - Botones de navegación: Perfil, Mi Dieta, Calendario
 * - Botón activo: Perfil (resaltado)
 * - Redirige a secciones mediante showLoaderAndRedirect
 */

import React from "react";

/**
 * Componente MenuLateral
 * Barra lateral con opciones de navegación del perfil
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.showLoaderAndRedirect - Función para navegar con loader
 * @returns {JSX.Element} Menú lateral
 */
export default function MenuLateral({ showLoaderAndRedirect }) {
    return (
        <div id="divMenuLateral">
            {/* Botón activo: Perfil */}
            <button className="botonesPerfilSelec">PERFIL</button>
            
            {/* Botón: Ir a Mi Dieta */}
            <button 
                className="botonesPerfil" 
                id="btnDieta" 
                onClick={() => showLoaderAndRedirect("/dietas")}
            >
                MI DIETA
            </button>
            
            {/* Botón: Calendario (pendiente funcionalidad) */}
            <button className="botonesPerfil">CALENDARIO</button>
        </div>
    );
}
