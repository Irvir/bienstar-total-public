import React, { useEffect, useState } from "react";
import "../styles/Perfil.css";
import Encabezado from "./Encabezado";
import Pie from "./Pie";
import "../styles/Base.css";
import ContenedorInfo from "./Perfil/contenedorInfo";
import MenuLateral from "./Perfil/menuLateral";
import Loader from "./Loader.jsx";
import withAuth from "../components/withAuth";

function Perfil() {
    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(false); // ✅ loader global

    useEffect(() => {
        const usuarioGuardado = localStorage.getItem("usuario");
        if (usuarioGuardado) {
            setUsuario(JSON.parse(usuarioGuardado));
        } else {
            window.location.href = "/login";
        }
    }, []);

    const showLoaderAndRedirect = (url) => {
        setLoading(true);
        setTimeout(() => {
            window.location.href = url;
        }, 700);
    };

    const handleCerrarSesion = () => {
        localStorage.removeItem("usuario");
        showLoaderAndRedirect("/login");
    };

    // Borrar Cuenta
    const handleBorrarCuenta = async () => {
        if (!confirm("¿Está seguro de que desea borrar su cuenta? Esta acción no se puede deshacer.")) return;
      
        setLoading(true);
        try {
          const res = await fetch(`http://localhost:3001/user/${usuario.id}`, { method: "DELETE" });
          if (!res.ok) throw new Error("Error al eliminar la cuenta");
      
          localStorage.removeItem("usuario");
          window.notify?.("Cuenta borrada correctamente", { type: "success" });
      
          setTimeout(() => {
            window.location.href = "/"; // ✅ redirige a Home.jsx
          }, 800);
        } catch (err) {
          console.error(err);
          window.notify?.("Error al borrar la cuenta", { type: "error" });
        } finally {
          setLoading(false);
        }
      };
      

    if (!usuario) return null;

    return (
        <div id="contenedorPrincipal" className="perfil-page">
            <Encabezado activePage="perfil" onNavigate={showLoaderAndRedirect} />

            <div id="cuerpo">
                <MenuLateral showLoaderAndRedirect={showLoaderAndRedirect} />
                <div id="divInfoUser">
                <ContenedorInfo
                    usuario={usuario}
                    handleCerrarSesion={handleCerrarSesion}
                    handleBorrarCuenta={handleBorrarCuenta}
                    />

                </div>
            </div>

            <Pie />

            <Loader visible={loading} />
        </div>
    );
}

export default withAuth(Perfil, { requireAuth: true });