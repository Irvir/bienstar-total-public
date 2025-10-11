import React, { useEffect, useState } from "react";
import "../styles/CrearDieta.css";
import withAuth from "../components/withAuth";
import Encabezado from "./Encabezado";
import Pie from "./Pie";
import CrearDietaForm from "./CrearDieta/CrearDietaForm";
import Loader from "./Loader.jsx"; // Componente Loader

function CrearDieta() {
    const traducciones = {
        breakfast: "Desayuno",
        lunch: "Almuerzo",
        dinner: "Cena",
        snack: "Snack",
        snack2: "Snack 2",
    };

    const [usuario, setUsuario] = useState(null);
    const [alimentos, setAlimentos] = useState([]);
    const [filtro, setFiltro] = useState("");
    const [diaSeleccionado, setDiaSeleccionado] = useState(1);
    const [dietaAgrupada, setDietaAgrupada] = useState({});
    const [loading, setLoading] = useState(false); // loader global

    // ================== SESIÓN ==================
    useEffect(() => {
        const usuarioGuardado = localStorage.getItem("usuario");
        if (!usuarioGuardado) {
            window.location.href = "/login";
            return;
        }
        const user = JSON.parse(usuarioGuardado);
        setUsuario(user);

        const nameUserSpan = document.querySelector(".nameUser");
        if (nameUserSpan) nameUserSpan.textContent = user.name;

        const fotoUsuario = document.getElementById("fotoUsuario");
        if (fotoUsuario) {
            fotoUsuario.addEventListener("click", () => navigateWithLoader("/perfil"));
        }
    }, []);

    // ================== NAVEGACIÓN CON LOADER ==================
    const navigateWithLoader = (url) => {
        setLoading(true);
        setTimeout(() => (window.location.href = url), 700);
    };

    // ================== BUSCAR ALIMENTOS ==================
    async function buscarAlimentos(query = "") {
        setLoading(true);
        try {
            const res = await fetch("http://localhost:3001/food-search?q=" + encodeURIComponent(query));
            if (!res.ok) return [];
            const data = await res.json();
            return data;
        } catch (e) {
            console.error("Error al buscar alimentos:", e);
            return [];
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        (async () => {
            const iniciales = await buscarAlimentos("");
            setAlimentos(iniciales);
        })();
    }, []);

    useEffect(() => {
        (async () => {
            const resultados = await buscarAlimentos(filtro);
            setAlimentos(resultados);
        })();
    }, [filtro]);

    // ================== DIETA DEL DÍA ==================
    async function cargarDietaDelDia() {
        if (!usuario) return;
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:3001/get-diet?id_diet=${usuario.id_diet}`);
            if (!res.ok) throw new Error("No se pudo cargar la dieta");

            const dieta = await res.json();
            const agrupada = {};
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

    useEffect(() => {
        if (usuario) cargarDietaDelDia();
    }, [usuario, diaSeleccionado]);

    // ================== AGREGAR / ELIMINAR ==================
    async function agregarAlimento(id, name, tipoComida) {
        const id_diet = usuario?.id_diet ?? 1;
        setLoading(true);
        try {
            const res = await fetch("http://localhost:3001/save-diet", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_diet, meals: [{ id, name, dia: diaSeleccionado, tipoComida }] }),
            });
            const result = await res.json();

            if (res.ok) {
                if (window.notify) window.notify(`${name} agregado (Día ${diaSeleccionado}, ${tipoComida})`, { type: "success" });
                await cargarDietaDelDia();
            } else {
                if (window.notify) window.notify(result.message || "Error al guardar alimento", { type: "error" });
            }
        } catch (e) {
            console.error(e);
            if (window.notify) window.notify("Error de conexión", { type: "error" });
        } finally {
            setLoading(false);
        }
    }

    async function eliminarAlimento(id, tipoComida) {
        const id_diet = usuario?.id_diet ?? 1;
        setLoading(true);
        try {
            const res = await fetch("http://localhost:3001/delete-diet-item", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_diet, id_food: id, dia: diaSeleccionado, tipoComida }),
            });
            if (res.ok) {
                if (window.notify) window.notify("Alimento eliminado", { type: "success" });
                await cargarDietaDelDia();
            } else {
                if (window.notify) window.notify("Error al eliminar alimento", { type: "error" });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    async function borrarDietaDelDia() {
        const id_diet = usuario?.id_diet ?? 1;
        setLoading(true);
        try {
            const res = await fetch("http://localhost:3001/clear-day", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_diet, dia: diaSeleccionado }),
            });
            const result = await res.json();
            if (res.ok && result.success) {
                if (window.notify) window.notify(result.message || "Día borrado correctamente", { type: "success" });
                await cargarDietaDelDia();
            } else {
                if (window.notify) window.notify(result.message || "Error al borrar la dieta del día", { type: "error" });
            }
        } catch (e) {
            console.error("Error al borrar dieta:", e);
            if (window.notify) window.notify("Error de conexión con el servidor", { type: "error" });
        } finally {
            setLoading(false);
        }
    }

    // ================== FUNCIÓN PARA RESALTAR NUTRIENTES ==================
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
        const maxMacro = Math.max(...Object.values(macronutrientes));
        if (maxMacro > 0) Object.keys(macronutrientes).forEach(k => macronutrientes[k] === maxMacro && destacados.push(k));
        const maxMicro = Math.max(...Object.values(micronutrientes));
        if (maxMicro > 5) Object.keys(micronutrientes).forEach(k => micronutrientes[k] === maxMicro && destacados.push(k));
        return destacados;
    };

    // ================== RENDER ==================
    return (
        <div id="contenedorPrincipal" className="crear-dieta-page">
            <Encabezado activePage="dietas" onNavigate={navigateWithLoader} />

            <div id="cuerpo">
                <CrearDietaForm
                    dietaAgrupada={dietaAgrupada}
                    diaSeleccionado={diaSeleccionado}
                    setDiaSeleccionado={setDiaSeleccionado}
                    traducciones={traducciones}
                    borrarDietaDelDia={borrarDietaDelDia}
                />

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
                                            <div className={nutrientesPrincipales.includes("protein") ? "nutriente-destacado" : ""}><b>Proteínas:</b> {alimento.protein ?? "-"}</div>
                                            <div className={nutrientesPrincipales.includes("carbohydrate") ? "nutriente-destacado" : ""}><b>Carbohidratos:</b> {alimento.carbohydrate ?? "-"}</div>
                                            <div className={nutrientesPrincipales.includes("total_lipid") ? "nutriente-destacado" : ""}><b>Grasas:</b> {alimento.total_lipid ?? "-"}</div>
                                            <div className={nutrientesPrincipales.includes("total_sugars") ? "nutriente-destacado" : ""}><b>Azúcares:</b> {alimento.total_sugars ?? "-"}</div>
                                            <div className={nutrientesPrincipales.includes("calcium") ? "nutriente-destacado" : ""}><b>Calcio:</b> {alimento.calcium ?? "-"}</div>
                                            <div className={nutrientesPrincipales.includes("iron") ? "nutriente-destacado" : ""}><b>Hierro:</b> {alimento.iron ?? "-"}</div>
                                            <div className={nutrientesPrincipales.includes("sodium") ? "nutriente-destacado" : ""}><b>Sodio:</b> {alimento.sodium ?? "-"}</div>
                                            <div className={nutrientesPrincipales.includes("cholesterol") ? "nutriente-destacado" : ""}><b>Colesterol:</b> {alimento.cholesterol ?? "-"}</div>
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

            {/* Loader global */}
            <Loader visible={loading} />
        </div>
    );
}

const CrearDietaWithAuth = withAuth(CrearDieta, false);
CrearDietaWithAuth.displayName = "CrearDieta";

export default CrearDietaWithAuth;
