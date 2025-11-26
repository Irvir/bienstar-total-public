import React from 'react';
import '../../styles/Alimentos.css';
import AlimentoGridCard from './AlimentoGridCard';

export default function ContenedorAlimentos({ items, openModal }) {
  return (
    <div id="contenedorAlimentos">
      <div className="grid-container">
        {items && items.length > 0 ? (
          items.map(item => (
            <AlimentoGridCard key={item.id} item={item} onClick={openModal} />
          ))
        ) : (
          <p className="sin-resultados">No se encontraron alimentos.</p>
        )}
      </div>
    </div>
  );
}
