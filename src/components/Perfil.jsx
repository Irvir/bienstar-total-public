/**
 * @file Perfil.jsx
 * @description Componente de perfil de usuario
 * 
 * Funcionalidades principales:
 * - Visualización de información del usuario
 * - Menú lateral de navegación
 * - Edición de datos personales
 * - Cerrar sesión
 * - Borrar cuenta con confirmación
 * - Actualización de localStorage
 */

import React, { useEffect, useState } from "react";
import "../styles/Perfil.css";
import Encabezado from "./Encabezado";
import Pie from "./Pie";
import "../styles/Base.css";
import ContenedorInfo from "./Perfil/contenedorInfo";
import MenuLateral from "./Perfil/menuLateral";
import Loader from "./Loader.jsx";
import withAuth from "../components/withAuth";

/**
 * Componente Perfil
 * Página de perfil del usuario con menú lateral e información editable
 * 
 * @returns {JSX.Element} Página de perfil
 */
function Perfil() {
    // ===========================================
    // STATE - Estado del componente
    // ===========================================
    
    /** @type {Object|null} Datos del usuario logueado */
    const [usuario, setUsuario] = useState(null);
    
    /** @type {boolean} Estado del loader durante operaciones */
    const [loading, setLoading] = useState(false);

    // ===========================================
    // EFFECTS - Efectos del ciclo de vida
    // ===========================================

    /**
     * Efecto 1: Cargar usuario de localStorage al montar
     * - Obtiene el usuario guardado
     * - Redirige al login si no hay sesión
     */
    useEffect(() => {
        const usuarioGuardado = localStorage.getItem("usuario");
        if (usuarioGuardado) {
            setUsuario(JSON.parse(usuarioGuardado));
        } else {
            window.location.href = "/login";
        }
    }, []);

    // ===========================================
    // FUNCTIONS - Funciones auxiliares
    // ===========================================

    /**
     * Muestra el loader y redirige a una URL
     * @param {string} url - URL de destino
     */
    const showLoaderAndRedirect = (url) => {
        setLoading(true);
        setTimeout(() => {
            window.location.href = url;
        }, 700);
    };

    /**
     * Maneja el cierre de sesión
     * - Elimina el usuario de localStorage
     * - Redirige al login
     */
    const handleCerrarSesion = () => {
        localStorage.removeItem("usuario");
        showLoaderAndRedirect("/login");
    };

    /**
     * Maneja la eliminación de la cuenta del usuario
     * - Solicita confirmación antes de proceder
     * - Envía petición DELETE al backend
     * - Limpia localStorage
     * - Notifica el resultado
     * - Redirige a Home
     */
    const handleBorrarCuenta = async () => {
        if (!confirm("¿Está seguro de que desea borrar su cuenta? Esta acción no se puede deshacer.")) return;
      
        setLoading(true);
        try {
          // Enviar petición DELETE al backend
          const res = await fetch(`http://localhost:3001/user/${usuario.id}`, { method: "DELETE" });
          if (!res.ok) throw new Error("Error al eliminar la cuenta");
      
          // Limpiar sesión y notificar
          localStorage.removeItem("usuario");
          window.notify?.("Cuenta borrada correctamente", { type: "success" });
      
          // Redirigir a Home
          setTimeout(() => {
            window.location.href = "/";
          }, 800);
        } catch (err) {
          console.error("Error al borrar cuenta:", err);
          window.notify?.("Error al borrar la cuenta", { type: "error" });
        } finally {
          setLoading(false);
        }
      };

    /**
     * Actualiza el usuario en el estado y localStorage
     * @param {Object} u - Objeto con los datos actualizados del usuario
     */
    const onActualizarUsuario = (u) => {
        setUsuario(u);
        try { 
            localStorage.setItem("usuario", JSON.stringify(u)); 
        } catch (e) {
            console.warn("Error al guardar usuario en localStorage", e);
        }
    };

    // Mostrar nada mientras carga el usuario
    if (!usuario) return null;

    // ===========================================
    // RENDER - Renderizado del componente
    // ===========================================
    return (
        <div id="contenedorPrincipal" className="perfil-page">
            <Encabezado activePage="perfil" onNavigate={showLoaderAndRedirect} />

            <div id="cuerpo">
                {/* Menú lateral de navegación */}
                <MenuLateral showLoaderAndRedirect={showLoaderAndRedirect} />
                
                {/* Panel de información del usuario */}
                <div id="divInfoUser">
                    <ContenedorInfo
                        usuario={usuario}
                        handleCerrarSesion={handleCerrarSesion}
                        handleBorrarCuenta={handleBorrarCuenta}
                        onActualizarUsuario={onActualizarUsuario}
                    />
                </div>
            </div>

            <Pie />

            {/* Loader global */}
            <Loader visible={loading} />
        </div>
    );
}

// Exportar con HOC de autenticación
// requireAuth: true - Requiere que el usuario esté logueado
const PerfilWithAuth = withAuth(Perfil, { requireAuth: true });
PerfilWithAuth.displayName = 'PerfilWithAuth';
export default PerfilWithAuth;