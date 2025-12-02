import React, { useEffect, useState, useMemo } from 'react';
import '../styles/Alimentos.css';
import Encabezado from './Encabezado';
import { API_BASE } from './shared/apiBase';
import Pie from './Pie';
import Filtro2 from './Alimentos/Filtro2';
import ContenedorAlimentos from './Alimentos/ContenedorAlimentos';
import Loader from './Loader';
export default function Alimentos() {
  const [alimentos, setAlimentos] = useState([]);
  const [filter, setFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({});
  const [showAllDetails, setShowAllDetails] = useState(false);
  const [activePage, setActivePage] = useState('alimentos');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 14;

  useEffect(() => {
    const currentPage = window.location.pathname.split('/').pop() || 'alimentos';
    setActivePage(currentPage.replace('.html', '').toLowerCase());
  }, []);

  // Resetear a página 1 cuando cambia el filtro
  useEffect(() => {
    setPage(1);
  }, [filter]);

  useEffect(() => {
    const fetchAlimentos = async () => {
      try {
        setLoading(true);
        // Usar ruta pública de alimentos
        const res = await fetch(`${API_BASE}/api/alimentos`);
        if (!res.ok) throw new Error('Error al obtener alimentos');
        const data = await res.json();
        setAlimentos(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error cargando alimentos:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlimentos();
  }, []);

  // Calcular alimentos filtrados
  const filteredFoods = useMemo(() => {
    if (!filter || !filter.trim()) return alimentos;
    const q = filter.toString().toLowerCase().trim();
    return alimentos.filter((a) => {
      const nombre = (a.nombre || '').toString().toLowerCase();
      const categoria = (a.categoria || '').toString().toLowerCase();
      return nombre.includes(q) || categoria.includes(q) || categoria === q;
    });
  }, [alimentos, filter]);

  // Calcular cantidad de páginas
  const pageCount = Math.max(1, Math.ceil(filteredFoods.length / pageSize));

  // Calcular alimentos de la página actual
  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredFoods.slice(start, start + pageSize);
  }, [filteredFoods, page, pageSize]);

  const openModal = async (item) => {
    setModalOpen(true);
    setLoading(true);
    setModalData({
      name: item.nombre,
      img: item.image_url || '',
      info: 'Cargando...',
    });
    setShowAllDetails(false);

    try {
      const res = await fetch(`${API_BASE}/food/${item.id}`);
      if (!res.ok) throw new Error('Error de servidor');
      const data = await res.json();
      setModalData({
        name: item.nombre,
        img: item.image_url || '',
        info: data || null,
      });
    } catch (err) {
      console.error('Fetch error:', err);
      setModalData({ name: item.nombre, img: item.image_url || '', info: null });
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => setModalOpen(false);

  const showLoaderAndRedirect = (url) => {
    setLoading(true);
    setTimeout(() => (window.location.href = url), 800);
  };

  return (
    <>
      <div id="contenedorPrincipal" className="pagina-alimentos">
        <Encabezado activePage={activePage} onNavigate={showLoaderAndRedirect} />
        <div id="cuerpo" className="alimentos-page">
          <Filtro2 filter={filter} setFilter={setFilter} />
          <ContenedorAlimentos
            items={pageItems}
            openModal={openModal}
          />
          {pageCount > 1 && (
            <div className="food-pagination">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ← Anterior
              </button>
              <span className="pagination-info">
                Página {page} de {pageCount}
              </span>
              <button
                type="button"
                disabled={page >= pageCount}
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              >
                Siguiente →
              </button>
            </div>
          )}
        </div>
        <Pie />
      </div>

      <Loader visible={loading} />

      {modalOpen && (
        <div
          id="modalAlimento"
          className="modal visible"
          onClick={(e) => e.target.id === 'modalAlimento' && closeModal()}
        >
          <div className={`modal-content ${showAllDetails ? 'modal-wide details-expanded' : 'modal-narrow details-collapsed'}`}>

            <span className="close" onClick={closeModal}>
              &times;
            </span>

            <div className="modal-body">

              {loading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>Cargando información...</div>
              ) : (
                <div className="modal-grid-container">

                  <div className="modal-col modal-col-left">
                    {modalData.info && modalData.info !== 'Cargando...' && typeof modalData.info === 'object' && (
                      <>
                        {!showAllDetails ? (
                          <div className="nutrient-details collapsed-essentials-left" aria-label="Bloque esenciales izquierda">
                            <div className="nutrient-row nutrient-block nutrient-block1">
                              <div className="nutrient-header">Detalles esenciales</div>
                              <div className="nutrient-grid cols-2">
                                <div>🔎 <b>Nombre:</b> {modalData.info.nombre ?? modalData.name ?? '-'}</div>
                                <div>🍽️ <b>Categoría:</b> {modalData.info.categoria ?? '-'}</div>
                                <div>⚡ <b>Energía:</b> {modalData.info.Energia ?? '-'} kcal</div>
                                <div>🍗 <b>Proteínas:</b> {modalData.info.Proteinas ?? '-'} g</div>
                                <div>🥖 <b>Carbohidratos:</b> {modalData.info.H_de_C_disp ?? '-'} g</div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="nutrient-details">
                            <div className="nutrient-row">
                              <div className="nutrient-header"> {modalData.name}</div>
                              <div className="nutrient-grid cols-2">
                                <div><b>📦 Categoría:</b> {modalData.info.categoria ?? '-'}</div>
                                <div><b>💧 Humedad:</b> {modalData.info.Humedad ?? '-'} g</div>
                                <div><b>⚡ Energía:</b> {modalData.info.Energia ?? '-'} kcal</div>
                                <div><b>🔥 Proteínas:</b> {modalData.info.Proteinas ?? '-'} g</div>
                              </div>
                            </div>

                            <div className="nutrient-row">
                              <div className="nutrient-header">🍞 Macronutrientes</div>
                              <div className="nutrient-grid cols-2">
                                <div><b>🍚 Carbohidratos:</b> {modalData.info.H_de_C_disp ?? '-'} g</div>
                                <div><b>🍬 Azúcares:</b> {modalData.info.Azucares_totales ?? '-'} g</div>
                                <div><b>🥗 Fibra:</b> {modalData.info.Fibra_dietetica_total ?? '-'} g</div>
                                <div><b>🥩 Lípidos:</b> {modalData.info.Lipidos_totales ?? '-'} g</div>
                              </div>
                            </div>

                            <div className="nutrient-row">
                              <div className="nutrient-header">🧈 Grasas</div>
                              <div className="nutrient-grid cols-2">
                                <div><b>💧 Totales:</b> {modalData.info.Ac_grasos_totales ?? '-'} g</div>
                                <div><b>🌻 Poliinsat:</b> {modalData.info.Ac_grasos_poliinsat ?? '-'} g</div>
                                <div><b>🚫 Trans:</b> {modalData.info.Ac_grasos_trans ?? '-'} g</div>
                                <div><b>🥚 Colesterol:</b> {modalData.info.Colesterol ?? '-'} mg</div>
                              </div>
                            </div>
                          </div>

                        )}
                      </>
                    )}
                  </div>

                  <div className="modal-col modal-col-center">
                    {modalData.img ? (
                      <img src={`${API_BASE}${modalData.img}`} alt={modalData.name} />
                    ) : (
                      <div className="no-image">Sin imagen</div>
                    )}
                    <h2 id="modalNombre">{modalData.name}</h2>
                    <button className="detalle-toggle" onClick={() => setShowAllDetails(s => !s)} aria-expanded={showAllDetails}>
                      {showAllDetails ? 'Menos detalle' : 'Mostrar más detalles'}
                    </button>
                  </div>

                  <div className="modal-col modal-col-right">
                    {modalData.info && modalData.info !== 'Cargando...' && typeof modalData.info === 'object' ? (
                      <>
                        {!showAllDetails && (
                          <div className="nutrient-details collapsed-essentials-right" aria-label="Bloque esenciales derecha">
                            <div className="nutrient-row nutrient-block nutrient-block2">
                              <div className="nutrient-header">Detalles esenciales</div>
                              <div className="nutrient-grid cols-2">
                                <div>🧈 <b>Lípidos:</b> {modalData.info.Lipidos_totales ?? '-'} g</div>
                                <div>🧂 <b>Sodio:</b> {modalData.info.Sodio ?? '-'} mg</div>
                                <div>🍌 <b>Potasio:</b> {modalData.info.Potasio ?? '-'} mg</div>
                                <div>💪 <b>Hierro:</b> {modalData.info.Hierro ?? '-'} mg</div>
                                <div>🦴 <b>Calcio:</b> {modalData.info.Calcio ?? '-'} mg</div>
                              </div>
                            </div>
                          </div>
                        )}
                        {showAllDetails && (
                          <div className="nutrient-details">

                            <div className="nutrient-row">
                              <div className="nutrient-header">💊 Vitaminas</div>
                              <div className="nutrient-grid cols-2">
                                <div><b>🧡 A:</b> {modalData.info.Vitamina_A ?? '-'} µg</div>
                                <div><b>🍊 C:</b> {modalData.info.Vitamina_C ?? '-'} mg</div>
                                <div><b>☀️ D:</b> {modalData.info.Vitamina_D ?? '-'} µg</div>
                                <div><b>🌻 E:</b> {modalData.info.Vitamina_E ?? '-'} mg</div>
                                <div><b>🌿 K:</b> {modalData.info.Vitamina_K ?? '-'} µg</div>
                                <div><b>💡 B1:</b> {modalData.info.Vitamina_B1 ?? '-'} mg</div>
                                <div><b>💡 B2:</b> {modalData.info.Vitamina_B2 ?? '-'} mg</div>
                                <div><b>🔥 Niacina:</b> {modalData.info.Niacina ?? '-'} mg</div>
                                <div><b>💊 B6:</b> {modalData.info.Vitamina_B6 ?? '-'} mg</div>
                                <div><b>🧬 B12:</b> {modalData.info.Vitamina_B12 ?? '-'} µg</div>
                                <div><b>🌾 Folatos:</b> {modalData.info.Folatos ?? '-'} µg</div>
                              </div>
                            </div>

                            <div className="nutrient-row">
                              <div className="nutrient-header">🧱 Minerales</div>
                              <div className="nutrient-grid cols-2">
                                <div><b>🧂 Sodio:</b> {modalData.info.Sodio ?? '-'} mg</div>
                                <div><b>🍌 Potasio:</b> {modalData.info.Potasio ?? '-'} mg</div>
                                <div><b>🥛 Calcio:</b> {modalData.info.Calcio ?? '-'} mg</div>
                                <div><b>🐟 Fósforo:</b> {modalData.info.Fosforo ?? '-'} mg</div>
                                <div><b>🪨 Magnesio:</b> {modalData.info.Magnesio ?? '-'} mg</div>
                                <div><b>⚙️ Hierro:</b> {modalData.info.Hierro ?? '-'} mg</div>
                                <div><b>🧲 Zinc:</b> {modalData.info.Zinc ?? '-'} mg</div>
                                <div><b>🔩 Cobre:</b> {modalData.info.Cobre ?? '-'} mg</div>
                                <div><b>💠 Selenio:</b> {modalData.info.Selenio ?? '-'} µg</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      modalData.info !== 'Cargando...' && <p>No se pudo cargar la información.</p>
                    )}
                  </div>

                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
}
