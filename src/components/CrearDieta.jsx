/**
 * CrearDieta.jsx - Componente principal de creación y edición de dietas
 * 
 * Funcionalidades:
 * - Búsqueda y filtrado de alimentos en tiempo real
 * - Agregar/eliminar alimentos por día y tipo de comida
 * - Visualización de la dieta del día seleccionado
 * - Resaltado de nutrientes principales (macros y micros)
 * - Detección de duplicados antes de agregar
 * - Borrado completo de un día
 */

import React, { useEffect, useState } from "react";
import { API_BASE } from "../shared/apiBase";
import "../styles/Base.css";
import "../styles/CrearDieta.css";
import withAuth from "../components/withAuth";
import Encabezado from "./Encabezado";
import Pie from "./Pie";
import CrearDietaForm from "./CrearDieta/CrearDietaForm";
import Loader from "./Loader.jsx";

// Importar el sistema de notificaciones
import "../controllers/notify.js";

/**
 * Componente CrearDieta
 * Permite crear y editar dietas semanales personalizadas
 * 
 * @returns {JSX.Element} Página completa de creación de dietas
 */
function CrearDieta() {
    // ===== CONSTANTES =====
    
    /**
     * Mapeo de tipos de comida de inglés a español
     * @constant {Object}
     */
    const traducciones = {
        breakfast: "Desayuno",
        lunch: "Almuerzo",
        dinner: "Cena",
        snack: "Snack",
        snack2: "Snack 2",
    };

    // ===== ESTADO DEL COMPONENTE =====

    /** @type {Object|null} Usuario actualmente logueado */
    const [usuario, setUsuario] = useState(null);
    
    /** @type {Array} Lista de alimentos disponibles */
    const [alimentos, setAlimentos] = useState([]);
    
    /** @type {string} Texto de búsqueda/filtro */
    const [filtro, setFiltro] = useState("");
    
    /** @type {number} Día seleccionado (1-7) */
    const [diaSeleccionado, setDiaSeleccionado] = useState(1);
    
    /** @type {Object} Dieta agrupada por día y tipo de comida */
    const [dietaAgrupada, setDietaAgrupada] = useState({});
    
    /** @type {boolean} Estado del loader */
    const [loading, setLoading] = useState(false);

    // ===== EFECTOS - SESIÓN =====

    /**
     * Verifica la sesión del usuario y configura eventos iniciales
     */
    useEffect(() => {
        const usuarioGuardado = localStorage.getItem("usuario");
        if (!usuarioGuardado) {
            window.location.href = "/login";
            return;
        }
        const user = JSON.parse(usuarioGuardado);
        setUsuario(user);

        // Actualizar nombre de usuario en la interfaz
        const nameUserSpan = document.querySelector(".nameUser");
        if (nameUserSpan) nameUserSpan.textContent = user.name;

        // Configurar evento de foto de usuario
        const fotoUsuario = document.getElementById("fotoUsuario");
        if (fotoUsuario) {
            fotoUsuario.addEventListener("click", () => navigateWithLoader("/perfil"));
        }
    }, []);

    // ===== NAVEGACIÓN =====

    /**
     * Navega a otra página mostrando el loader
     * 
     * @param {string} url - URL de destino
     */
    const navigateWithLoader = (url) => {
        setLoading(true);
        setTimeout(() => (window.location.href = url), 700);
    };

    // ===== BÚSQUEDA DE ALIMENTOS =====

    /**
     * Busca alimentos en el backend según el término de búsqueda
     * 
     * @param {string} query - Término de búsqueda
     * @returns {Promise<Array>} Lista de alimentos encontrados
     */
    async function buscarAlimentos(query = "") {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/food-search?q=` + encodeURIComponent(query));
            if (!res.ok) return [];
            return await res.json();
        } catch (e) {
            console.error("Error al buscar alimentos:", e);
            return [];
        } finally {
            setLoading(false);
        }
    }

    /**
     * Carga la lista inicial de alimentos al montar el componente
     */
    useEffect(() => {
        (async () => {
            const iniciales = await buscarAlimentos("");
            setAlimentos(iniciales);
        })();
    }, []);

    /**
     * Actualiza la lista de alimentos cuando cambia el filtro
     */
    useEffect(() => {
        (async () => {
            const resultados = await buscarAlimentos(filtro);
            setAlimentos(resultados);
        })();
    }, [filtro]);

    // ===== GESTIÓN DE DIETA =====

    /**
     * Carga la dieta del usuario desde el backend
     * Agrupa los alimentos por día y tipo de comida
     */
    async function cargarDietaDelDia() {
        if (!usuario) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/get-diet?id_diet=${usuario.id_diet}`);
            if (!res.ok) throw new Error("No se pudo cargar la dieta");

            const dieta = await res.json();
            const agrupada = {};
            
            // Agrupar alimentos por día y tipo de comida
            dieta.forEach(({ dia: d, tipo_comida, alimento }) => {
                if (!agrupada[d]) agrupada[d] = {};
                if (!agrupada[d][tipo_comida]) agrupada[d][tipo_comida] = [];
                agrupada[d][tipo_comida].push(alimento);
            });

            setDietaAgrupada(agrupada);
        } catch (err) {
            console.error("Error al cargar dieta:", err);
        } finally {
            setLoading(false);
        }
    }

    /**
     * Recarga la dieta cuando cambia el usuario o el día seleccionado
     */
    useEffect(() => {
        if (usuario) cargarDietaDelDia();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [usuario, diaSeleccionado]);

    // ===== OPERACIONES CRUD DE ALIMENTOS =====

    /**
     * Agrega un alimento a la dieta del día seleccionado
     * Verifica duplicados antes de agregar
     * 
     * @param {number} id - ID del alimento
     * @param {string} name - Nombre del alimento
     * @param {string} tipoComida - Tipo de comida (breakfast, lunch, etc.)
     */
    async function agregarAlimento(id, name, tipoComida) {
        const id_diet = usuario?.id_diet ?? 1;

        // Verificación previa de duplicados en el frontend
        const comidasDelDia = dietaAgrupada[diaSeleccionado]?.[tipoComida] || [];
        const yaExiste = comidasDelDia.some(alimentoExistente => {
            // El backend a veces puede guardar solo nombre o id según estructura
            if (typeof alimentoExistente === "string") {
                return alimentoExistente.toLowerCase() === name.toLowerCase();
            } else if (alimentoExistente?.id) {
                return alimentoExistente.id === id;
            } else if (alimentoExistente?.name) {
                return alimentoExistente.name.toLowerCase() === name.toLowerCase();
            }
            return false;
        });

        if (yaExiste) {
            window.notify?.(
                `❌ ${name} ya está agregado en ${traducciones[tipoComida]} del Día ${diaSeleccionado}`,
                { type: "error" }
            );
            return; // No continúa, evita duplicado
        }

        // Guardado si no existe
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/save-diet`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    id_diet, 
                    meals: [{ id, name, dia: diaSeleccionado, tipoComida }] 
                }),
            });
            const result = await res.json();

            if (res.ok) {
                if (result.alreadyExists) {
                    window.notify?.(`⚠️ ${name} ya está en tu dieta`, { type: "warning" });
                } else {
                    window.notify?.(
                        `✅ ${name} agregado (Día ${diaSeleccionado}, ${traducciones[tipoComida]})`,
                        { type: "success" }
                    );
                }
                await cargarDietaDelDia();
            } else {
                window.notify?.(result.message || "Error al guardar alimento", { type: "error" });
            }
        } catch (e) {
            console.error(e);
            window.notify?.("Error de conexión", { type: "error" });
        } finally {
            setLoading(false);
        }
    }

    /**
     * Elimina un alimento específico de la dieta
     * 
     * @param {number} id - ID del alimento a eliminar
     * @param {string} tipoComida - Tipo de comida
     */
    /**
     * Elimina un alimento específico de la dieta
     * 
     * @param {number} id - ID del alimento a eliminar
     * @param {string} tipoComida - Tipo de comida
     */
    async function eliminarAlimento(id, tipoComida) {
        const id_diet = usuario?.id_diet ?? 1;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/delete-diet-item`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_diet, id_food: id, dia: diaSeleccionado, tipoComida }),
            });
            
            if (res.ok) {
                window.notify?.("Alimento eliminado", { type: "success" });
                await cargarDietaDelDia();
            } else {
                window.notify?.("Error al eliminar alimento", { type: "error" });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    /**
     * Borra todos los alimentos del día seleccionado
     */
    async function borrarDietaDelDia() {
        const id_diet = usuario?.id_diet ?? 1;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/clear-day`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_diet, dia: diaSeleccionado }),
            });
            const result = await res.json();
            
            if (res.ok && result.success) {
                window.notify?.(result.message || "Día borrado correctamente", { type: "success" });
                await cargarDietaDelDia();
            } else {
                window.notify?.(result.message || "Error al borrar la dieta del día", { type: "error" });
            }
        } catch (e) {
            console.error("Error al borrar dieta:", e);
            window.notify?.("Error de conexión con el servidor", { type: "error" });
        } finally {
            setLoading(false);
        }
    }

    // ===== RESALTADO DE NUTRIENTES =====

    /**
     * Identifica los nutrientes principales de un alimento
     * Separa macronutrientes (proteínas, carbohidratos, grasas) de micronutrientes
     * 
     * @param {Object} alimento - Alimento con información nutricional
     * @returns {Array<string>} Lista de claves de nutrientes destacados
     */
    const obtenerNutrientePrincipal = (alimento) => {
        const macronutrientes = {
            protein: parseFloat(alimento.protein) || 0,
            carbohydrate: parseFloat(alimento.carbohydrate) || 0,
            total_lipid: parseFloat(alimento.total_lipid) || 0,
        };
        
        const micronutrientes = {
            total_sugars: parseFloat(alimento.total_sugars) || 0,
            calcium: parseFloat(alimento.calcium) || 0,
            iron: parseFloat(alimento.iron) || 0,
            sodium: parseFloat(alimento.sodium) || 0,
            cholesterol: parseFloat(alimento.cholesterol) || 0,
        };
        
        const destacados = [];
        
        // Encontrar el macronutriente máximo
        const maxMacro = Math.max(...Object.values(macronutrientes));
        if (maxMacro > 0) {
            Object.keys(macronutrientes).forEach(k => {
                if (macronutrientes[k] === maxMacro) destacados.push(k);
            });
        }
        
        // Encontrar el micronutriente máximo (solo si es significativo)
        const maxMicro = Math.max(...Object.values(micronutrientes));
        if (maxMicro > 5) {
            Object.keys(micronutrientes).forEach(k => {
                if (micronutrientes[k] === maxMicro) destacados.push(k);
            });
        }
        
        return destacados;
    };

    // ===== RENDER =====
    return (
        <div id="contenedorPrincipal" className="crear-dieta-page">
            <Encabezado activePage="dietas" onNavigate={navigateWithLoader} />

            <div id="cuerpo">
                {/* IZQUIERDA */}
                <CrearDietaForm
                    dietaAgrupada={dietaAgrupada}
                    diaSeleccionado={diaSeleccionado}
                    setDiaSeleccionado={setDiaSeleccionado}
                    traducciones={traducciones}
                    borrarDietaDelDia={borrarDietaDelDia}
                />

                {/* DERECHA */}
                <div id="filtroContainer">
                    <div id="contenedorFiltro">
                        <input
                            type="text"
                            id="filtro"
                            placeholder="Buscar alimento..."
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                        />
                    </div>

                    <div id="resultadosFiltro" className="resultadosFiltro">
                        {alimentos.map(alimento => {
                            const nutrientesPrincipales = obtenerNutrientePrincipal(alimento);
                            return (
                                <div key={alimento.id} className="alimento-card">
                                    <div className="alimento-info">
                                        <strong>{alimento.name}</strong>
                                        <br />
                                        Calorías: {alimento.calories ?? "-"}
                                        <div className="nutri-grid">
                                            <div className={nutrientesPrincipales.includes("protein") ? "nutriente-destacado" : ""}><b>🥩 Proteínas:</b> {alimento.protein ?? "-"} g</div>
                                            <div className={nutrientesPrincipales.includes("carbohydrate") ? "nutriente-destacado" : ""}><b>🍞 Carbohidratos:</b> {alimento.carbohydrate ?? "-"} g</div>
                                            <div className={nutrientesPrincipales.includes("total_lipid") ? "nutriente-destacado" : ""}><b>🥑 Grasas:</b> {alimento.total_lipid ?? "-"} g</div>
                                            <div className={nutrientesPrincipales.includes("total_sugars") ? "nutriente-destacado" : ""}><b>🍬 Azúcares:</b> {alimento.total_sugars ?? "-"} g</div>
                                            <div className={nutrientesPrincipales.includes("calcium") ? "nutriente-destacado" : ""}><b>🦴 Calcio:</b> {alimento.calcium ?? "-"} mg</div>
                                            <div className={nutrientesPrincipales.includes("iron") ? "nutriente-destacado" : ""}><b>🩸 Hierro:</b> {alimento.iron ?? "-"} mg</div>
                                            <div className={nutrientesPrincipales.includes("sodium") ? "nutriente-destacado" : ""}><b>🧂 Sodio:</b> {alimento.sodium ?? "-"} mg</div>
                                            <div className={nutrientesPrincipales.includes("cholesterol") ? "nutriente-destacado" : ""}><b>💊 Colesterol:</b> {alimento.cholesterol ?? "-"} mg</div>
                                        </div>
                                    </div>

                                    <div className="grupoSelector">
                                        <div className="etiqueta">HORA DE COMIDA</div>
                                        <div className="selector">
                                            <select className="selectComida" id={`select-${alimento.id}`}>
                                                <option value="breakfast">Desayuno</option>
                                                <option value="lunch">Almuerzo</option>
                                                <option value="dinner">Cena</option>
                                                <option value="snack">Snack</option>
                                                <option value="snack2">Snack 2</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="botonesAccionVertical">
                                        <button className="btnAgregar" onClick={() => agregarAlimento(alimento.id, alimento.name, document.getElementById(`select-${alimento.id}`).value)}>Agregar</button>
                                        <button className="btnEliminar" onClick={() => eliminarAlimento(alimento.id, document.getElementById(`select-${alimento.id}`).value)}>Eliminar</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <Pie />
            <Loader visible={loading} />
        </div>
    );
}

const CrearDietaWithAuth = withAuth(CrearDieta, false);
CrearDietaWithAuth.displayName = "CrearDieta";

export default CrearDietaWithAuth;


