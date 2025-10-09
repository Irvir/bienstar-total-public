import React from "react";
import "../../styles/Alimentos.css";

export default function CrearDietaForm({
    dietaAgrupada,
    diaSeleccionado,
    setDiaSeleccionado,
    traducciones,
    borrarDietaDelDia

}) {
    const comidasDelDia = dietaAgrupada[diaSeleccionado] || {};

    return (
        <div id="crearDieta">
            <h2 id="diaSeleccionado">
                Dieta del Día <span id="diaSeleccionadoTexto">– {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"][diaSeleccionado - 1]}</span>
            </h2>

            <div id="resumenDieta">
                {["breakfast", "lunch", "dinner", "snack", "snack2"].map((tipo) => {
                    const alimentos = comidasDelDia[tipo] || [];
                    const tieneAlimentos = alimentos.length > 0;

                    return (
                        <div key={tipo} className={`grupoComida grupo-${tipo}`}>
                            <h3>{traducciones[tipo]}</h3>
                            <ul className="lista-comida">
                                {tieneAlimentos ? (
                                    alimentos.map((alimento, i) => <li key={i}>{alimento}</li>)
                                ) : (
                                    <li className="sin-alimentos">(sin alimentos)</li>
                                )}
                            </ul>
                        </div>
                    );
                })}
            </div>

            <div className="barraDivisora"></div>

            <div id="botones">
                <div className="grupoSelector" >
                    <div className="etiqueta">DÍA</div>
                    <div className="selector">
                        <select
                            id="dia"
                            className="selectDia"
                            value={diaSeleccionado}
                            onChange={(e) => setDiaSeleccionado(Number(e.target.value))}
                        >
                            <option value="1">Lunes</option>
                            <option value="2">Martes</option>
                            <option value="3">Miércoles</option>
                            <option value="4">Jueves</option>
                            <option value="5">Viernes</option>
                            <option value="6">Sábado</option>
                            <option value="7">Domingo</option>
                        </select>
                    </div>
                </div>

                <button id="btnBorrarDieta" onClick={borrarDietaDelDia}>
                    Borrar Todo
                </button>
                <button id="btnSalir">Salir</button>
            </div>
        </div>
    );
}