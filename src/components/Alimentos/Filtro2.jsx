import React, { useState } from 'react';
import '../../styles/Alimentos.css';

const CATEGORIAS = [
    'Leche y derivados',
    'Huevos',
    'Carnes y vísceras',
    'Pescados y mariscos',
    'Leguminosas y oleaginosas',
    'Semillas',
    'Almendras y nueces',
    'Cereales y derivados',
    'Papas',
    'Grasas y aceites',
    'Verduras',
    'Frutas',
    'Azúcares y miel',
    'Alimentos dulces'
];

export default function Filtro2({ filter, setFilter }) {
    const derivedCategory = (filter || '')
        ? CATEGORIAS.find(c => c.toLowerCase() === (filter || '').toString().toLowerCase()) || ''
        : '';

    const handleInputChange = (e) => {
        setFilter(e.target.value);
    };

    const handleCategoryChange = (e) => {
        const categoria = e.target.value;
        setFilter(categoria || '');
    };

    return (
        <div id="contenedorFiltro" className="category-filter">

            <div className="filtro-input-wrap">
                <label htmlFor="filtro" className="filtro-label">
                </label>
                <input
                    type="text"
                    id="filtro"
                    placeholder="Ej: Manzana, Pan, etc."
                    value={derivedCategory ? '' : (filter || '')}
                    onChange={handleInputChange}
                />
            </div>

            <div className="filtro-select-wrap">
                <label htmlFor="categoriaSelect" className="filtro-label">
                    Filtrar por categoría:
                </label>
                <select
                    id="categoriaSelect"
                    value={derivedCategory}
                    onChange={handleCategoryChange}
                >
                    <option value="">Todas las categorías</option>
                    {CATEGORIAS.map((c) => (
                        <option key={c} value={c}>
                            {c}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
