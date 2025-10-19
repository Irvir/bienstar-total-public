import React, { useEffect, useState } from "react";
import "../styles/Alimentos.css";
import "../styles/Base.css";

import Encabezado from "./Encabezado";
import Pie from "./Pie";
import Filtro from "./Alimentos/Filtro";
import ContenedorAlimentos from "./Alimentos/ContenedorAlimentos";
import Loader from "./Loader";

export default function Alimentos() {
  const [alimentos, setAlimentos] = useState([]);
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

  // Cargar alimentos desde backend
  useEffect(() => {
    const fetchAlimentos = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:3001/admin/foods");
        if (!res.ok) throw new Error("Error al obtener alimentos");
        const data = await res.json();
        setAlimentos(Array.isArray(data) ? data : []); // ⬅️ asegurar que sea array
      } catch (err) {
        console.error("Error cargando alimentos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlimentos();
  }, []);

  // Abrir modal
  const openModal = async (item) => {
    setModalOpen(true);
    setLoading(true);
    setModalData({
      name: item.nombre,
      img: item.image_url || "",
      info: "Cargando..."
    });

    try {
      const res = await fetch(`http://localhost:3001/food/${item.id}`);
      if (!res.ok) throw new Error("Error de servidor");
      const data = await res.json();
      setModalData({
        name: item.nombre,
        img: item.image_url || "",
        info: data || null
      });
    } catch (err) {
      console.error("Fetch error:", err);
      setModalData({ name: item.nombre, img: item.image_url || "", info: null });
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalData({});
  };

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
            filtered={alimentos.filter(a =>
              a.nombre.toLowerCase().includes(filter.toLowerCase())
            )}
            openModal={openModal}
          />
        </div>

        <Pie />
      </div>

      <Loader visible={loading} />

      {modalOpen && (
        <div
          id="modalAlimento"
          className="modal visible"
          onClick={(e) => e.target.id === "modalAlimento" && closeModal()}
        >
          <div className="modal-content">
            <span className="close" onClick={closeModal}>&times;</span>

            {/* LAYOUT LATERAL: izquierda imagen+nombre, derecha detalles con scroll */}
            <div className="modal-body">
              <div className="modal-left">
                {modalData.img ? (
                  <img src={`http://localhost:3001${modalData.img}`} alt={modalData.name} />
                ) : (
                  <div className="no-image">Sin imagen</div>
                )}
                <h2 id="modalNombre">{modalData.name}</h2>
              </div>

              <div className="modal-right">
                <div id="modalInfo">
                  {modalData.info && modalData.info !== "Cargando..." && typeof modalData.info === "object" ? (
                    <div className="nutrient-details">
                      <div className="nutrient-row">
                        <div className="nutrient-header">General</div>
                        <div className="nutrient-grid cols-2">
                          <div><b>Categoría:</b> {modalData.info.categoria ?? "-"}</div>
                          <div><b>Estado:</b> {modalData.info.estado ?? "-"}</div>
                          <div><b>Energía:</b> {modalData.info.Energia ?? "-"} kcal</div>
                          <div><b>Humedad:</b> {modalData.info.Humedad ?? "-"} g</div>
                        </div>
                      </div>

                      <div className="nutrient-row">
                        <div className="nutrient-header">Macros</div>
                        <div className="nutrient-grid cols-3">
                          <div><b>Proteínas:</b> {modalData.info.Proteinas ?? "-"} g</div>
                          <div><b>Carbohidratos (disp):</b> {modalData.info.H_de_C_disp ?? "-"} g</div>
                          <div><b>Azúcares totales:</b> {modalData.info.Azucares_totales ?? "-"} g</div>
                          <div><b>Fibra:</b> {modalData.info.Fibra_dietetica_total ?? "-"} g</div>
                          <div><b>Lípidos totales:</b> {modalData.info.Lipidos_totales ?? "-"} g</div>
                        </div>
                      </div>

                      <div className="nutrient-row">
                        <div className="nutrient-header">Grasas</div>
                        <div className="nutrient-grid cols-3">
                          <div><b>Ác. grasos totales:</b> {modalData.info.Ac_grasos_totales ?? "-"} g</div>
                          <div><b>Ác. grasos poliinsat:</b> {modalData.info.Ac_grasos_poliinsat ?? "-"} g</div>
                          <div><b>Ác. grasos trans:</b> {modalData.info.Ac_grasos_trans ?? "-"} g</div>
                          <div><b>Colesterol:</b> {modalData.info.Colesterol ?? "-"} mg</div>
                        </div>
                      </div>

                      <div className="nutrient-row">
                        <div className="nutrient-header">Vitaminas</div>
                        <div className="nutrient-grid cols-4">
                          <div><b>A:</b> {modalData.info.Vitamina_A ?? "-"} µg</div>
                          <div><b>C:</b> {modalData.info.Vitamina_C ?? "-"} mg</div>
                          <div><b>D:</b> {modalData.info.Vitamina_D ?? "-"} µg</div>
                          <div><b>E:</b> {modalData.info.Vitamina_E ?? "-"} mg</div>
                          <div><b>K:</b> {modalData.info.Vitamina_K ?? "-"} µg</div>
                          <div><b>B1:</b> {modalData.info.Vitamina_B1 ?? "-"} mg</div>
                          <div><b>B2:</b> {modalData.info.Vitamina_B2 ?? "-"} mg</div>
                          <div><b>Niacina:</b> {modalData.info.Niacina ?? "-"} mg</div>
                          <div><b>B6:</b> {modalData.info.Vitamina_B6 ?? "-"} mg</div>
                          <div><b>Ác. pantoténico:</b> {modalData.info.Ac_pantotenico ?? "-"} mg</div>
                          <div><b>B12:</b> {modalData.info.Vitamina_B12 ?? "-"} µg</div>
                          <div><b>Folatos:</b> {modalData.info.Folatos ?? "-"} µg</div>
                        </div>
                      </div>

                      <div className="nutrient-row">
                        <div className="nutrient-header">Minerales</div>
                        <div className="nutrient-grid cols-4">
                          <div><b>Sodio:</b> {modalData.info.Sodio ?? "-"} mg</div>
                          <div><b>Potasio:</b> {modalData.info.Potasio ?? "-"} mg</div>
                          <div><b>Calcio:</b> {modalData.info.Calcio ?? "-"} mg</div>
                          <div><b>Fósforo:</b> {modalData.info.Fosforo ?? "-"} mg</div>
                          <div><b>Magnesio:</b> {modalData.info.Magnesio ?? "-"} mg</div>
                          <div><b>Hierro:</b> {modalData.info.Hierro ?? "-"} mg</div>
                          <div><b>Zinc:</b> {modalData.info.Zinc ?? "-"} mg</div>
                          <div><b>Cobre:</b> {modalData.info.Cobre ?? "-"} mg</div>
                          <div><b>Selenio:</b> {modalData.info.Selenio ?? "-"} µg</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    modalData.info !== "Cargando..." && <p>No se pudo cargar la información.</p>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
