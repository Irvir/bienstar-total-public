/**
 * Alimentos.jsx - Componente de página de alimentos
 * 
 * Muestra una galería de alimentos con:
 * - Búsqueda/filtrado en tiempo real
 * - Modal con información nutricional detallada
 * - Datos cargados desde el backend
 * - Loader durante navegación
 */

import React, { useEffect, useState } from "react";
import "../styles/Alimentos.css";
import "../styles/Base.css";
import "../styles/Pie.css";

import Encabezado from "./Encabezado";
import Pie from "./Pie";
import Filtro from "./Alimentos/Filtro";
import ContenedorAlimentos from "./Alimentos/ContenedorAlimentos";
import Loader from "./Loader";
import { API_BASE } from "../shared/apiBase";

/**
 * Datos estáticos de alimentos disponibles
 * Cada alimento tiene: id, imagen y nombre
 * @constant {Array<Object>}
 */
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

/**
 * Componente principal de la página de alimentos
 * 
 * @returns {JSX.Element} Página completa con encabezado, filtro, galería y modal
 */
export default function Alimentos() {
  const [filter, setFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({});
  const [activePage, setActivePage] = useState("alimentos");
  const [loading, setLoading] = useState(false);

  // Detectar página actual
  useEffect(() => {
    const currentPage = window.location.pathname.split("/").pop() || "alimentos";
    setActivePage(currentPage.replace(".html", "").toLowerCase());
  }, []);

  // Abrir modal y cargar info desde backend
  const openModal = async (item) => {
    setModalOpen(true);
    setLoading(true);
    setModalData({ name: item.name, img: item.img, info: "Cargando..." });

    try {
  const res = await fetch(`${API_BASE}/food/${item.id}`);
      if (!res.ok) throw new Error("Error de servidor");
      const data = await res.json();
      setModalData({ name: item.name, img: item.img, info: data });
    } catch (err) {
      console.error("Fetch error:", err);
      setModalData({ name: item.name, img: item.img, info: null });
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalData({});
  };

  // Loader al navegar desde encabezado
  const showLoaderAndRedirect = (url) => {
    setLoading(true);
    setTimeout(() => {
      window.location.href = url;
    }, 800);
  };

  return (
    <>
      <div id="contenedorPrincipal" className="pagina-alimentos">
        <Encabezado activePage={activePage} onNavigate={showLoaderAndRedirect} />

        <div id="cuerpo" className="alimentos-page">
          <Filtro filter={filter} setFilter={setFilter} />

          <ContenedorAlimentos
            filtered={alimentosData.filter((a) =>
              a.name.toLowerCase().includes(filter.toLowerCase())
            )}
        </>
    );
}
