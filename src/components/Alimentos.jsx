import React, { useEffect, useState } from "react";
import "../styles/Alimentos.css";
import "../styles/Base.css";

import Encabezado from "./Encabezado";
import Pie from "./Pie";
import Filtro from "./Alimentos/Filtro";
import ContenedorAlimentos from "./Alimentos/ContenedorAlimentos";
import Loader from "./Loader";

export default function Alimentos() {
  const [alimentos, setAlimentos] = useState([]);   // ⬅️ Aquí guardaremos los datos del backend
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

  // 🔹 Cargar alimentos desde backend
  useEffect(() => {
    const fetchAlimentos = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:3001/admin/foods");
        if (!res.ok) throw new Error("Error al obtener alimentos");
        const data = await res.json();
        setAlimentos(data);
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
    setModalData({ name: item.nombre, img: item.image_url, info: "Cargando..." });

    try {
      const res = await fetch(`http://localhost:3001/food/${item.id}`);
      if (!res.ok) throw new Error("Error de servidor");
      const data = await res.json();
      setModalData({ name: item.nombre, img: item.image_url, info: data });
    } catch (err) {
      console.error("Fetch error:", err);
      setModalData({ name: item.nombre, img: item.image_url, info: null });
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
            filtered={alimentos.filter((a) =>
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
          className={`modal ${modalOpen ? "visible" : ""}`}
          onClick={(e) => {
            if (e.target.id === "modalAlimento") closeModal();
          }}
        >
          <div className="modal-content">
            <span className="close" onClick={closeModal}>
              &times;
            </span>
            <img
              src={`http://localhost:3001${modalData.img}`}
              alt={modalData.name}
            />
            <h2 id="modalNombre">{modalData.name}</h2>

            <div id="modalInfo">
              {modalData.info === "Cargando..." && <p>Cargando...</p>}
              {modalData.info &&
                modalData.info !== "Cargando..." &&
                typeof modalData.info === "object" ? (
                <div className="nutrient-grid">
                  <div><b>Energía:</b> {modalData.info.energy ?? "-"} kcal</div>
                  <div><b>Proteína:</b> {modalData.info.protein ?? "-"} g</div>
                  <div><b>Grasa total:</b> {modalData.info.total_lipid ?? "-"} g</div>
                  <div><b>Carbohidratos:</b> {modalData.info.carbohydrate ?? "-"} g</div>
                  <div><b>Azúcares:</b> {modalData.info.total_sugars ?? "-"} g</div>
                  <div><b>Calcio:</b> {modalData.info.calcium ?? "-"} mg</div>
                  <div><b>Hierro:</b> {modalData.info.iron ?? "-"} mg</div>
                  <div><b>Sodio:</b> {modalData.info.sodium ?? "-"} mg</div>
                  <div><b>Colesterol:</b> {modalData.info.cholesterol ?? "-"} mg</div>
                </div>
              ) : (
                modalData.info !== "Cargando..." && <p>No se pudo cargar la información.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
