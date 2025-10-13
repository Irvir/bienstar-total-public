import React, { useEffect, useState } from "react";
import Encabezado from "./Encabezado";
import Pie from "./Pie";
import Loader from "./Loader";
import withAuth from "../components/withAuth";
import AdminAlimentoCard from "./Admin/AdminAlimentoCard";
import ModalEditarAlimento from "./Admin/ModalEditarAlimento";
import "../styles/Admin.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

function AdminAlimentos() {
  const [alimentos, setAlimentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activePage, setActivePage] = useState("admin-alimentos");
  const [modalAlimento, setModalAlimento] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchListado();
    setActivePage("admin-alimentos");
  }, []);

  async function fetchListado() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/foods`);
      const contentType = res.headers.get("content-type");
      if (!res.ok || !contentType?.includes("application/json")) {
        const raw = await res.text();
        console.error("Respuesta inesperada:", raw);
        throw new Error("Respuesta no válida del servidor");
      }
      const data = await res.json();
      setAlimentos(data);
    } catch (e) {
      console.error("Error al cargar alimentos:", e);
      setError("No se pudo cargar la lista de alimentos.");
    } finally {
      setLoading(false);
    }
  }

  const handleEliminar = async (id, nombre) => {
    if (!confirm(`¿Eliminar "${nombre}" de la base de datos?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/foods/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("No se pudo eliminar");
      setAlimentos(prev => prev.filter(x => x.id !== id));
      window.notify?.(`Alimento "${nombre}" eliminado`, { type: "success" });
    } catch (e) {
      console.error("Error al eliminar alimento:", e);
      window.notify?.("Error al eliminar alimento", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirEditar = (alimento) => {
    setModalAlimento(alimento);
  };

  const handleCerrarModal = () => setModalAlimento(null);

  const handleGuardar = async (formDataObj) => {
    setLoading(true);
    try {
      if (formDataObj.imageFile) {
        const fd = new FormData();
        fd.append("image", formDataObj.imageFile);
        const uploadRes = await fetch(`${API_BASE}/admin/foods/upload-image`, {
          method: "POST",
          body: fd,
        });
        if (!uploadRes.ok) throw new Error("Error al subir imagen");
        const uploadJson = await uploadRes.json();
        formDataObj.image = uploadJson.url;
      }

      const putRes = await fetch(`${API_BASE}/admin/foods/${formDataObj.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formDataObj),
      });

      if (!putRes.ok) {
        const err = await putRes.json().catch(() => ({}));
        throw new Error(err.message || "Error al guardar cambios");
      }

      const updated = await putRes.json();
      setAlimentos(prev => prev.map(a => (a.id === updated.id ? updated : a)));
      window.notify?.("Cambios guardados correctamente", { type: "success" });
      setModalAlimento(null);
    } catch (e) {
      console.error("Error al guardar cambios:", e);
      window.notify?.("Error al guardar cambios", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-alimentos-page">
      <div id="contenedorPrincipal" className="admin-contenedor">
        <Encabezado
          activePage={activePage}
          onNavigate={() => {
            setLoading(true);
            setTimeout(() => (window.location.href = "/"), 700);
          }}
        />

        <main id="cuerpo" className="admin-cuerpo">
          <h1>Admin — Gestión de Alimentos</h1>
          {error && <div className="admin-error">{error}</div>}

          <div className="admin-controls">
            <button className="btn-primary" onClick={fetchListado}>Refrescar</button>
            <button className="btn-primary" onClick={() => window.location.href = "/admin/crear-alimento"}>Crear alimento</button>
          </div>

          <div className="admin-lista">
            {alimentos.map(a => (
              <AdminAlimentoCard
                key={a.id}
                alimento={a}
                onEditar={() => handleAbrirEditar(a)}
                onEliminar={() => handleEliminar(a.id, a.nombre)}
              />
            ))}
          </div>
        </main>

        <Pie />
      </div>

      <Loader visible={loading} />

      {modalAlimento && (
        <ModalEditarAlimento
          alimento={modalAlimento}
          onClose={handleCerrarModal}
          onSave={handleGuardar}
        />
      )}
    </div>
  );
}

export default withAuth(AdminAlimentos, { requireAuth: true });