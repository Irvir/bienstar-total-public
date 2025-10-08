import React, { useEffect, useState } from 'react';
import '../styles/Alimentos.css';

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load user name from localStorage (keeps parity with original pages)
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      try {
        const usuario = JSON.parse(usuarioGuardado);
        const nameSpans = document.querySelectorAll('.nameUser');
        nameSpans.forEach(s => (s.textContent = usuario.name));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  function showLoaderAndRedirect(url) {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'flex';
    setTimeout(() => (window.location.href = url), 700);
  }

  function openModal(item) {
    setModalOpen(true);
    setModalData({ name: item.name, img: item.img, info: 'Cargando...' });
    // fetch nutrition data
    fetch(`http://localhost:3001/food/${item.id}`)
      .then(res => {
        if (!res.ok) throw new Error('Server error');
        return res.json();
      })
      .then(data => {
        setModalData({ name: item.name, img: item.img, info: data });
      })
      .catch(err => {
        setModalData({ name: item.name, img: item.img, info: null });
        console.error('Error loading food:', err);
      });
  }

  function closeModal() {
    setModalOpen(false);
    setModalData({});
  }

  const filtered = alimentosData.filter(a => a.name.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="alimentos-page" id="contenedorPrincipal">
      <div id="encabezado">
        <div className="header-inner">
          <div className="logo">
            <a href="/">
              <img src="/Imagenes/Login_Perfil/Logo.png" alt="Logo BienStarTotal" className="logoImg" />
            </a>
          </div>

          <div className="menúBotones">
            <button className="btnMenu" onClick={() => showLoaderAndRedirect('/')}>
              Inicio
            </button>
            <button className="btnMenuSelec" onClick={() => showLoaderAndRedirect('/alimentos')}>
              Alimentos
            </button>
            <button className="btnMenu" onClick={() => showLoaderAndRedirect('/dietas')}>
              Dietas
            </button>
            <button className="btnMenuNoti">
              <img src="/Imagenes/Login_Perfil/Notificacion.png" id="btnNotification" alt="Notificación" />
            </button>
          </div>

          <div className="login">
            <div style={{ float: 'left', height: '100%', width: '75%' }} onClick={() => showLoaderAndRedirect('/login')}>
              <button className="btnPerfilView" id="btnPerfilView">
                <span className="nameUser">Nombre de Usuario</span>
              </button>
            </div>
            <div style={{ float: 'left', width: '10%', height: '100%' }} onClick={() => showLoaderAndRedirect('/login')}>
              <img src="/Imagenes/Login_Perfil/UserPerfil.png" id="fotoUsuario" alt="Foto de Usuario" style={{ cursor: 'pointer' }} />
            </div>
          </div>
        </div>
      </div>

      <div id="cuerpo">
        <div id="contenedorFiltro">
          <div id="lupe" />
          <div style={{ float: 'left', width: '95%', height: '100%' }}>
            <input
              type="text"
              id="filtro"
              placeholder="Buscar alimento..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
            />
          </div>
        </div>

        <div id="contenedorAlimentos">
          <div className="grid-container">
            {filtered.map(item => (
              <div key={item.id} className="cuadro" onClick={() => openModal(item)}>
                <button className="botonAlimento">
                  <img src={item.img} id="imgAlimento" alt={item.name} />
                  <br />
                  <p className="nombre" data-alimento-id={item.id} id="textTittleFood">
                    {item.name}
                  </p>
                  <div className="infoNutricional">
                    {/* placeholders — content will be fetched when opening modal */}
                    <p>Proteína: <span className="protein"></span> G</p>
                    <p>Lipidos Totales <span className="total_lipid"></span></p>
                    <p>Carbohidratos: <span className="carbohydrate"></span> G</p>
                    <p>Energía: <span className="energy"></span> G</p>
                    <p>Azucares Totales: <span className="total_sugars"></span> G</p>
                    <p>Calcio: <span className="calcium"></span> G</p>
                    <p>Hierro: <span className="iron"></span> G</p>
                    <p>Sodio: <span className="sodium"></span> MG</p>
                    <p>Colesterol: <span className="cholesterol"></span> KCAL</p>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div id="pie">
        <div className="footer-inner">
          <a href="#" className="footer-link" title="Instagram"><img src="/Imagenes/Pie_Pagina/InstaLogo.png" alt="Instagram" /></a>
          <a href="#" className="footer-link" title="Facebook"><img src="/Imagenes/Pie_Pagina/FaceLogo.png" alt="Facebook" /></a>
          <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank" rel="noopener noreferrer" className="footer-link" title="YouTube"><img src="/Imagenes/Pie_Pagina/YouTubeLogo.png" alt="YouTube" /></a>
          <a href="#" className="footer-link" title="WhatsApp"><img src="/Imagenes/Pie_Pagina/WhatsLogo.png" alt="WhatsApp" /></a>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div id="modalAlimento" className="modal" onClick={e => { if (e.target.id === 'modalAlimento') closeModal(); }}>
          <div className="modal-content">
            <span className="close" onClick={closeModal}>&times;</span>
            <img id="modalImg" src={modalData.img} alt={modalData.name} />
            <h2 id="modalNombre">{modalData.name}</h2>
            <div id="modalInfo">
              {modalData.info === 'Cargando...' && <p>Cargando...</p>}
              {modalData.info && modalData.info !== 'Cargando...' && (
                typeof modalData.info === 'object' ? (
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
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loader (simple inline toggle) */}
      <div id="loader" style={{ display: 'none' }}>
        <span className="loader-text">Cargando</span>
        <div className="loader-dots">
          <img src="/Imagenes/Imagenes_de_carga/frutilla1.png" alt="frutilla" />
          <img src="/Imagenes/Imagenes_de_carga/manzana1.png" alt="manzana" />
          <img src="/Imagenes/Imagenes_de_carga/naranja1.png" alt="naranja" />
        </div>
      </div>
    </div>
  );
}
