import React from 'react';
import '../../styles/Alimentos.css';

export default function CrearDietaForm({
  dietaAgrupada,
  diaSeleccionado,
  setDiaSeleccionado,
  traducciones,
  borrarDietaDelDia,

}) {
  const comidasDelDia = dietaAgrupada[diaSeleccionado] || {};
  const usuario = JSON.parse(localStorage.getItem('usuario')) || { nombre: 'Invitado' };

  // Emojis para cada tipo de comida
  const emojisComida = {
    breakfast: '🌅',
    lunch: '🍽️',
    dinner: '🌙',
    snack: '🍎',
    snack2: '🥤',
  };

  return (
    <div id="crearDieta">
      <h2 id="diaSeleccionado">
                Dieta del Día <span id="diaSeleccionadoTexto">– {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'][diaSeleccionado - 1]}</span>
        <br />
                de
        <span id="nombreUsuario">{usuario.nombre}</span>

      </h2>

      <div id="resumenDieta">
        {['breakfast', 'lunch', 'dinner', 'snack', 'snack2'].map((tipo) => {
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
        <button id="btnSalir" onClick={() => window.location.href = '/dietas'}>Salir</button>
      </div>
    </div>
  );
}