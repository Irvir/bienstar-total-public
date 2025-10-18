import React from "react";
import "../../styles/Alimentos.css";
import AlimentoGridCard from "./AlimentoGridCard";

export default function ContenedorAlimentos({ filtered, openModal }) {
    return (
        <div id="contenedorAlimentos">
            <div className="grid-container">
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
