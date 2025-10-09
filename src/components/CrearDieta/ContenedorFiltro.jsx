import React from "react";
import '../../styles/Alimentos.css';
import Pie from "../Pie";

export default function contenedorFiltro() {
    // Use the CSS from Alimentos.css which defines .alimentos-page and #contenedorFiltro
    return (
        <div id="contenedorFiltro">
            <div id="lupe"></div>
            <div style={{ flex: 1 }}>
                <input type="text" id="filtro" placeholder="Buscar alimento..." />
            </div>
        </div>
    );
}