import React from "react";
import "../../styles/Alimentos.css";


export default function Filtro({ filter, setFilter }) {
    // Use the CSS from Alimentos.css which defines .alimentos-page and #contenedorFiltro
    return (
        <div id="contenedorFiltro">
            <div id="lupe" />
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
