import '../../styles/Calendario.css';
import { useState } from 'react';
import React from 'react';
import  ContenedorInfoCalendario  from './ContenedorInfoCalendario.jsx';

const ContenedorDias = () => {
    const [fechaSeleccionada, setFechaSeleccionada] = useState(null);

    const fechaActual = new Date();
    const dia = fechaActual.getDate();
    const mes = fechaActual.getMonth() + 1;
    const ano = fechaActual.getFullYear();

    const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const mesesAno = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    const primerDiaMes = new Date(ano, mes - 1, 1).getDay();
    const diasEnMes = new Date(ano, mes, 0).getDate();

    const inicioDia = primerDiaMes === 0 ? 6 : primerDiaMes - 1;

    const dias = [];

    //Espacios en blanco antes del primer día del mes
    for(let i = 0; i < inicioDia; i++) {
        dias.push(<div key={`vacio-${i}`} className="diaVacio"></div>);
    }

    //Dias del mes
    for (let i = 1; i <= diasEnMes; i++) {
        const fechaDelDia = new Date(ano, mes - 1, i);
        dias.push(
            <div
                key={i}
                className={`dia ${i === dia ? 'hoy' : ''}`}
                onClick={() => setFechaSeleccionada(fechaDelDia)}
            >
                {i}
            </div>
        );
    }



  return (
        <div className="contenedor-calendario">
            <h2>{fechaActual.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}</h2>
            <div className="dias-semana">
                {diasSemana.map((dia) => (
                    <div key={dia} className="celdaEncabezado">{dia}</div>
                ))}
            </div>
            <div className="grid-calendario">{dias}</div>
          {fechaSeleccionada && (
              <ContenedorInfoCalendario fecha={fechaSeleccionada} onClose={() => setFechaSeleccionada(null)} />
          )
          }
        </div>

        

    );
};

export default ContenedorDias;
