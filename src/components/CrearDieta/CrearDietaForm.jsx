/**
 * @file CrearDietaForm.jsx
 * @description Componente formulario para visualizar y editar la dieta de un día específico
 * 
 * Funcionalidades principales:
 * - Muestra el resumen de comidas del día seleccionado
 * - Lista de alimentos agrupados por tipo de comida (desayuno, almuerzo, cena, snacks)
 * - Selector de día de la semana
 * - Botón para borrar toda la dieta del día
 * - Indicador visual con emojis para cada tipo de comida
 * - Contador de alimentos por tipo de comida
 */

import React from "react";
import "../../styles/Alimentos.css";

/**
 * Componente CrearDietaForm
 * Panel izquierdo de CrearDieta que muestra el resumen diario
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.dietaAgrupada - Dieta completa agrupada por día y tipo de comida
 * @param {number} props.diaSeleccionado - Día actual seleccionado (1-7)
 * @param {Function} props.setDiaSeleccionado - Función para cambiar el día seleccionado
 * @param {Object} props.traducciones - Traducciones de tipos de comida (breakfast → Desayuno)
 * @param {Function} props.borrarDietaDelDia - Función para eliminar todos los alimentos del día
 * @returns {JSX.Element} Formulario de edición de dieta
 */
export default function CrearDietaForm({
    dietaAgrupada,
    diaSeleccionado,
    setDiaSeleccionado,
    traducciones,
    borrarDietaDelDia

}) {
    // Obtener comidas del día actual seleccionado
    const comidasDelDia = dietaAgrupada[diaSeleccionado] || {};

    /**
     * Emojis decorativos para cada tipo de comida
     * - breakfast: amanecer
     * - lunch: plato de comida
     * - dinner: luna (noche)
     * - snack: manzana
     * - snack2: bebida
     */
    const emojisComida = {
        breakfast: "🌅",
        lunch: "🍽️",
        dinner: "🌙",
        snack: "🍎",
        snack2: "🥤"
    };

    return (
        <div id="crearDieta">
            {/* Título con día seleccionado */}
            <h2 id="diaSeleccionado">
                Dieta del Día <span id="diaSeleccionadoTexto">– {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"][diaSeleccionado - 1]}</span>
            </h2>

            {/* Resumen de comidas del día */}
            <div id="resumenDieta">
                {/* Iterar sobre cada tipo de comida */}
                {["breakfast", "lunch", "dinner", "snack", "snack2"].map((tipo) => {
                    const alimentos = comidasDelDia[tipo] || [];
                    const tieneAlimentos = alimentos.length > 0;

                    return (
                        <div key={tipo} className={`grupoComida grupo-${tipo}`}>
                            <h3>
                                <span className="emoji-comida">{emojisComida[tipo]}</span>
                                {traducciones[tipo]}
                                <span className="contador-alimentos">({alimentos.length})</span>
                            </h3>
                            <ul className="lista-comida">
                                {tieneAlimentos ? (
                                    alimentos.map((alimento, i) => (
                                        <li key={i}>
                                            <span className="bullet">•</span>
                                            {alimento}
                                        </li>
                                    ))
                                ) : (
                                    <li className="sin-alimentos">
                                        <span className="icono-vacio">📭</span>
                                        Sin alimentos
                                    </li>
                                )}
                            </ul>
                        </div>
                    );
                })}
            </div>

            <div className="barraDivisora"></div>

            {/* Controles: selector de día y botones de acción */}
            <div id="botones">
                {/* Selector de día de la semana */}
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

                {/* Botón para eliminar toda la dieta del día */}
                <button id="btnBorrarDieta" onClick={borrarDietaDelDia}>
                    Borrar Todo
                </button>
                
                {/* Botón para salir a la vista de dietas */}
                <button id="btnSalir" onClick={() => window.location.href = '/dietas'}>Salir</button>
            </div>
        </div>
    );
}