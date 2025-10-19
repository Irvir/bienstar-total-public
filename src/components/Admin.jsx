import React, { useEffect, useState } from "react";
import Encabezado from "./Encabezado";
import Pie from "./Pie";
import Loader from "./Loader";
import withAuth from "../components/withAuth";
import AdminAlimentoCard from "./Admin/AdminAlimentoCard";
import ModalEditarAlimento from "./Admin/ModalEditarAlimento";
import "../styles/Admin.css";
import { API_BASE } from "../components/shared/apiBase";

// Importar el sistema de notificaciones
import "../controllers/notify.js";

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
        throw new Error("Respuesta no válida del servidor");
      }
      const data = await res.json();
      setAlimentos(data);
    } catch {
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
      if (!res.ok) throw new Error();
      setAlimentos(prev => prev.filter(x => x.id !== id));
      window.notify?.(`Alimento "${nombre}" eliminado`, { type: "success" });
    } catch {
      window.notify?.("Error al eliminar alimento", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirEditar = (alimento) => setModalAlimento(alimento);
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
        if (!uploadRes.ok) throw new Error();
        const uploadJson = await uploadRes.json();
        // server returns { image_url: '/uploads/...' }
        formDataObj.image_url = uploadJson.image_url || uploadJson.url || uploadJson.image || null;
      }
      const putRes = await fetch(`${API_BASE}/admin/foods/${formDataObj.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formDataObj),
      });

      if (!putRes.ok) {
        const txt = await putRes.text().catch(() => "");
        throw new Error(`PUT failed: ${putRes.status} ${txt}`);
      }

      // The server's PUT returns a simple message; refresh the listing to reflect changes
      await fetchListado();
      window.notify?.("Cambios guardados correctamente", { type: "success" });
      setModalAlimento(null);
    } catch {
      window.notify?.("Error al guardar cambios", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-alimentos-page">
      <div className="admin-contenedor">
        <Encabezado
          activePage={activePage}
          onNavigate={() => {
            setLoading(true);
            setTimeout(() => (window.location.href = "/"), 700);
          }}
        />

        <main className="admin-cuerpo">
          <h1>Admin — Gestión de Alimentos</h1>
          {error && <div className="admin-error">{error}</div>}

          <div className="admin-controls">
            <button className="btn-primary" onClick={fetchListado}>
              Refrescar
            </button>
            <button
              className="btn-primary"
              onClick={() => (window.location.href = "/admin/crear-alimento")}
            >
              Crear alimento
            </button>
          </div>

          <div className="admin-lista">
            {alimentos.map((a) => (
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

// Exportar con autenticación requerida
const AdminAlimentosProtected = withAuth(AdminAlimentos, { requireAuth: true });
export default AdminAlimentosProtected;