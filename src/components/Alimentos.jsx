import React, { useEffect, useState } from 'react';
import '../styles/Alimentos.css';
import Encabezado from './Encabezado';
import Pie from './Pie';
import Filtro from './Alimentos/Filtro';
import ContenedorAlimentos from "./Alimentos/ContenedorAlimentos";

const alimentosData = [
    { id: 14, img: '/Imagenes/Alimentos/Porotos.jpg', name: 'POROTOS' },
    { id: 21, img: '/Imagenes/Alimentos/Porotosnegros.jpg', name: 'POROTOS NEGROS' },
    { id: 25, img: '/Imagenes/Alimentos/broccoli.jpg', name: 'BRÓCOLI' },
    { id: 42, img: '/Imagenes/Alimentos/Arroz.jpg', name: 'ARROZ INTEGRAL' },
    { id: 22, img: '/Imagenes/Alimentos/zanahoria.webp', name: 'ZANAHORIA' },
    { id: 2, img: '/Imagenes/Alimentos/pechugadepollo.jpg', name: 'PECHUGA DE POLLO' },
    { id: 13, img: '/Imagenes/Alimentos/garbanzos.png', name: 'GARBANZOS' },
    { id: 48, img: '/Imagenes/Alimentos/Maiz.webp', name: 'MAÍZ' },
    { id: 50, img: '/Imagenes/Alimentos/Cuscus.jpg', name: 'CUSCÚS' },
    { id: 30, img: '/Imagenes/Alimentos/pepino.jpg', name: 'ENSALADA DE PEPINO' },
    { id: 6, img: '/Imagenes/Alimentos/Huevos.avif', name: 'HUEVOS' },
    { id: 29, img: '/Imagenes/Alimentos/Ajo.webp', name: 'AJO' },
    { id: 37, img: '/Imagenes/Alimentos/uvas.webp', name: 'UVAS' },
    { id: 15, img: '/Imagenes/Alimentos/guisantes.jpeg', name: 'GUISANTES' },
    { id: 10, img: '/Imagenes/Alimentos/filetes de merluza.jpg', name: 'FILETES DE MERLUZA' },
    { id: 19, img: '/Imagenes/Alimentos/hummus.jpg', name: 'HUMMUS' },
    { id: 38, img: '/Imagenes/Alimentos/kiwi-1.jpg', name: 'KIWI' },
    { id: 4, img: '/Imagenes/Alimentos/TROCITOS-RES-DF-CORTES-WEB-2023.jpg', name: 'CARNE DE RES MAGRA' },
    { id: 41, img: '/Imagenes/Alimentos/limon.jpg', name: 'LIMÓN' },
    { id: 12, img: '/Imagenes/Alimentos/lentejas.jpg', name: 'LENTEJAS' },
    { id: 26, img: '/Imagenes/Alimentos/Lechuga.jpg', name: 'LECHUGA' },
    { id: 39, img: '/Imagenes/Alimentos/mango.jpg', name: 'MANGO' },
    { id: 43, img: '/Imagenes/Alimentos/avena.webp', name: 'AVENA' },
    { id: 28, img: '/Imagenes/Alimentos/cebolla.jpeg', name: 'CEBOLLA' },
    { id: 34, img: '/Imagenes/Alimentos/Naranja.jpg', name: 'NARANJA' },
    { id: 35, img: '/Imagenes/Alimentos/pera.webp', name: 'PERA' },
    { id: 27, img: '/Imagenes/Alimentos/pimientos.jpg', name: 'PIMIENTOS' },
    { id: 40, img: '/Imagenes/Alimentos/piña.jpg', name: 'PIÑA' },
    { id: 11, img: '/Imagenes/Alimentos/yogurtnatural.webp', name: 'YOGUR NATURAL' },
    { id: 5, img: '/Imagenes/Alimentos/carnedecerdo.jpg', name: 'CERDO' },
    { id: 46, img: '/Imagenes/Alimentos/potato patty.avif', name: 'HAMBURGUESA DE PAPA' },
    { id: 17, img: '/Imagenes/Alimentos/quinoa.jpg', name: 'QUINOA' },
    { id: 8, img: '/Imagenes/Alimentos/Salmon.jpg', name: 'SALMÓN' },
    { id: 9, img: '/Imagenes/Alimentos/sardinas.jpg', name: 'SARDINAS' },
    { id: 24, img: '/Imagenes/Alimentos/espinaca.jpg', name: 'ESPINACA' },
    { id: 36, img: '/Imagenes/Alimentos/fresa.jpg', name: 'FRESA' },
    { id: 47, img: '/Imagenes/Alimentos/batata.webp', name: 'BATATA' },
    { id: 20, img: '/Imagenes/Alimentos/tempe.jpg', name: 'TEMPE' },
    { id: 18, img: '/Imagenes/Alimentos/Carnesoja.webp', name: 'PROTEÍNA DE SOJA TEXTURIZADA' },
    { id: 16, img: '/Imagenes/Alimentos/tofu.jpg', name: 'TOFU' },
    { id: 23, img: '/Imagenes/Alimentos/Tomates.webp', name: 'TOMATE' },
    { id: 7, img: '/Imagenes/Alimentos/atun.jpg', name: 'ATÚN' },
    { id: 3, img: '/Imagenes/Alimentos/pavo.webp', name: 'PAVO' },
    { id: 44, img: '/Imagenes/Alimentos/Pan.jpg', name: 'PAN DE TRIGO ENTERO' },
    { id: 51, img: '/Imagenes/Alimentos/Harina-integral.png', name: 'HARINA DE TRIGO INTEGRAL' },
    { id: 45, img: '/Imagenes/Alimentos/pastaintegral.jpg', name: 'PASTA DE TRIGO INTEGRAL' },
    { id: 49, img: '/Imagenes/Alimentos/tortillaintegral.jpg', name: 'TORTILLAS DE TRIGO INTEGRAL' },
    { id: 31, img: '/Imagenes/Alimentos/calabacin.jpg', name: 'CALABACÍN' }
];

export default function Alimentos() {
    const [filter, setFilter] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState({});
    const [activePage, setActivePage] = useState('alimentos');

    // Detectar página activa
    useEffect(() => {
        const currentPage = window.location.pathname.split('/').pop() || 'alimentos';
        setActivePage(currentPage.replace('.html', '').toLowerCase());
    }, []);

    // Filtrado de alimentos
    const filtered = alimentosData.filter(a =>
        a.name.toLowerCase().includes(filter.toLowerCase())
    );

    // Abrir modal
    const openModal = (item) => {
        setModalOpen(true);
        setModalData({ name: item.name, img: item.img, info: 'Cargando...' });
        fetch(`http://localhost:3001/food/${item.id}`)
            .then(res => res.ok ? res.json() : Promise.reject('Error de servidor'))
            .then(data => setModalData({ name: item.name, img: item.img, info: data }))
            .catch(() => setModalData({ name: item.name, img: item.img, info: null }));
    };

    // Cerrar modal
    const closeModal = () => {
        setModalOpen(false);
        setModalData({});
    };

    // Loader + redireccion
    const showLoaderAndRedirect = (url) => {
        const loader = document.getElementById('loader');
        if (loader) loader.style.display = 'flex';
        setTimeout(() => (window.location.href = url), 700);
    };

    return (
        <>
            <div id="contenedorPrincipal" className="pagina-alimentos">
                {/* Encabezado con activePage */}
                <Encabezado activePage={activePage} />

                <div id="cuerpo" className="alimentos-page">
                    {/* Filtro */}
                    <Filtro filter={filter} setFilter={setFilter} />

                    {/* Contenedor de alimentos */}
                    <ContenedorAlimentos filtered={filtered} openModal={openModal} />
                </div>

                <Pie />

                {/* Loader */}
                <div id="loader" style={{ display: 'none' }}>
                    <span className="loader-text">Cargando</span>
                    <div className="loader-dots">
                        <img src="/Imagenes/Imagenes_de_carga/frutilla1.png" alt="frutilla" />
                        <img src="/Imagenes/Imagenes_de_carga/manzana1.png" alt="manzana" />
                        <img src="/Imagenes/Imagenes_de_carga/naranja1.png" alt="naranja" />
                    </div>
                </div>
            </div>

            {/* Modal */}
            {modalOpen && (
                <div
                    id="modalAlimento"
                    className="modal"
                    onClick={e => { if (e.target.id === 'modalAlimento') closeModal(); }}
                >
                    <div className="modal-content">
                        <span className="close" onClick={closeModal}>&times;</span>
                        <img id="modalImg" src={modalData.img} alt={modalData.name} />
                        <h2 id="modalNombre">{modalData.name}</h2>
                        <div id="modalInfo">
                            {modalData.info === 'Cargando...' && <p>Cargando...</p>}
                            {modalData.info && modalData.info !== 'Cargando...' && typeof modalData.info === 'object' ? (
                                <div>
                                    <p>Proteína: {modalData.info.protein} g</p>
                                    <p>Lípidos Totales: {modalData.info.total_lipid} g</p>
                                    <p>Carbohidratos: {modalData.info.carbohydrate} g</p>
                                    <p>Energía: {modalData.info.energy} kcal</p>
                                    <p>Azúcares Totales: {modalData.info.total_sugars} g</p>
                                    <p>Calcio: {modalData.info.calcium} mg</p>
                                    <p>Hierro: {modalData.info.iron} mg</p>
                                    <p>Sodio: {modalData.info.sodium} mg</p>
                                    <p>Colesterol: {modalData.info.cholesterol} mg</p>
                                </div>
                            ) : (
                                <p>No se pudo cargar la información nutricional.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}