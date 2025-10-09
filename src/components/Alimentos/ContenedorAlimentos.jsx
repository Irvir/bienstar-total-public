import React from "react";
import "../../styles/Alimentos.css";

export default function ContenedorAlimentos({ filtered, openModal }) {
    return (
        <div id="contenedorAlimentos">
            <div className="grid-container">
                {filtered.length > 0 ? (
                    filtered.map(item => (
                        <div key={item.id} className="cuadro" onClick={() => openModal(item)}>
                            <button className="botonAlimento">
                                <img src={item.img} id="imgAlimento" alt={item.name} />
                                <br />
                                <p className="nombre" data-alimento-id={item.id}>
                                    {item.name}
                                </p>
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="sin-resultados">No se encontraron alimentos.</p>
                )}
            </div>
        </div>
    );
}
