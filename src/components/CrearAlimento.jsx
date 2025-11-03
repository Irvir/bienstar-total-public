// CrearAlimento.jsx
import React, { useState } from "react";
import "../styles/CrearAlimento.css";
import withAuth from "../components/withAuth";
import Encabezado from "./Encabezado";
import Pie from "./Pie";
import { API_BASE } from "./shared/apiBase";

const CrearAlimento = () => {
    const [form, setForm] = useState({
        nombre: "",
        Energia: "",
        Humedad: "",
        Cenizas: "",
        Proteinas: "",
        H_de_C_disp: "",
        Azucares_totales: "",
        Fibra_dietetica_total: "",
        Lipidos_totales: "",
        Ac_grasos_totales: "",
        Ac_grasos_poliinsat: "",
        Ac_grasos_trans: "",
        Colesterol: "",
        Vitamina_A: "",
        Vitamina_C: "",
        Vitamina_D: "",
        Vitamina_E: "",
        Vitamina_K: "",
        Vitamina_B1: "",
        Vitamina_B2: "",
        Niacina: "",
        Vitamina_B6: "",
        Ac_pantotenico: "",
        Vitamina_B12: "",
        Folatos: "",
        Sodio: "",
        Potasio: "",
        Calcio: "",
        Fosforo: "",
        Magnesio: "",
        Hierro: "",
        Zinc: "",
        Cobre: "",
        Selenio: ""
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImageFile(file);
        setImagePreview(file ? URL.createObjectURL(file) : null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let image_url = null;

            if (imageFile) {
                const formData = new FormData();
                formData.append("image", imageFile);

                const uploadRes = await fetch(`${API_BASE}/admin/foods/upload-image`, {
                    method: "POST",
                    body: formData,
                });

                if (!uploadRes.ok) {
                    const text = await uploadRes.text().catch(() => "");
                    throw new Error(`Error subiendo imagen: ${uploadRes.status} ${text}`);
                }

                const uploadData = await uploadRes.json();
                image_url = uploadData.image_url;
            }

            const body = { ...form, image_url };

            const res = await fetch(`${API_BASE}/admin/foods`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const text = await res.text().catch(() => "");
                throw new Error(`Error creando alimento: ${res.status} ${text}`);
            }

            alert("Alimento creado correctamente");
            setForm({
                nombre: "",
                Energia: "",
                Humedad: "",
                Cenizas: "",
                Proteinas: "",
                H_de_C_disp: "",
                Azucares_totales: "",
                Fibra_dietetica_total: "",
                Lipidos_totales: "",
                Ac_grasos_totales: "",
                Ac_grasos_poliinsat: "",
                Ac_grasos_trans: "",
                Colesterol: "",
                Vitamina_A: "",
                Vitamina_C: "",
                Vitamina_D: "",
                Vitamina_E: "",
                Vitamina_K: "",
                Vitamina_B1: "",
                Vitamina_B2: "",
                Niacina: "",
                Vitamina_B6: "",
                Ac_pantotenico: "",
                Vitamina_B12: "",
                Folatos: "",
                Sodio: "",
                Potasio: "",
                Calcio: "",
                Fosforo: "",
                Magnesio: "",
                Hierro: "",
                Zinc: "",
                Cobre: "",
                Selenio: ""

            });
            setImageFile(null);
            setImagePreview(null);
        } catch (err) {
            console.error(err);
            alert("Error al crear el alimento");
        } finally {
            setLoading(false);
        }
    };

    const showLoaderAndRedirect = (url) => {
        setLoading(true);
        setTimeout(() => (window.location.href = url), 400);
    };

    return (
        <>
            <Encabezado activePage="alimentos" onNavigate={showLoaderAndRedirect} />
            <div className="crear-alimento-container">
                <h2>Crear Alimento</h2>
                <form onSubmit={handleSubmit} className="crear-alimento-form">
                    <input type="text" name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required />

                    {/* Imagen */}
                    <div className="file-row">
                        <input type="file" accept="image/*" onChange={handleImageChange} />
                        {imagePreview && <img src={imagePreview} alt="Preview" className="preview image-preview" />}
                    </div>

                    {/* Secciones al estilo modalInfo (referencia: modal de editar alimento) */}
                    <div className="nutri-section">
                        <h3 className="nutri-section__title">Macros</h3>
                        <div className="nutri-grid nutri-grid--macros">
                            {[
                                ["Energia","Energía (kcal)"],
                                ["Proteinas","Proteínas (g)"],
                                ["H_de_C_disp","H de C disp (g)"],
                                ["Azucares_totales","Azúcares totales (g)"],
                                ["Fibra_dietetica_total","Fibra dietética (g)"],
                                ["Lipidos_totales","Lípidos totales (g)"],
                                ["Ac_grasos_totales","Ác. grasos totales (g)"],
                                ["Ac_grasos_poliinsat","Ác. grasos poliinsat (g)"],
                                ["Ac_grasos_trans","Ác. grasos trans (g)"],
                                ["Colesterol","Colesterol (mg)"]
                            ].map(([name, label]) => (
                                <div className="nutri-item" key={name}>
                                    <label htmlFor={name}>{label}</label>
                                    <input id={name} type="number" step="any" name={name} value={form[name]} onChange={handleChange} />
                                </div>
                            ))}
                        </div>

                        <h3 className="nutri-section__title">Vitaminas</h3>
                        <div className="nutri-grid nutri-grid--vitamins">
                            {[
                                ["Vitamina_A","Vitamina A"],
                                ["Vitamina_C","Vitamina C"],
                                ["Vitamina_D","Vitamina D"],
                                ["Vitamina_E","Vitamina E"],
                                ["Vitamina_K","Vitamina K"],
                                ["Vitamina_B1","Vitamina B1"],
                                ["Vitamina_B2","Vitamina B2"],
                                ["Niacina","Niacina"],
                                ["Vitamina_B6","Vitamina B6"],
                                ["Ac_pantotenico","Ác. pantoténico"],
                                ["Vitamina_B12","Vitamina B12"],
                                ["Folatos","Folatos"]
                            ].map(([name, label]) => (
                                <div className="nutri-item" key={name}>
                                    <label htmlFor={name}>{label}</label>
                                    <input id={name} type="number" step="any" name={name} value={form[name]} onChange={handleChange} />
                                </div>
                            ))}
                        </div>

                        <h3 className="nutri-section__title">Minerales</h3>
                        <div className="nutri-grid nutri-grid--minerals">
                            {[
                                ["Sodio","Sodio (mg)"],
                                ["Potasio","Potasio (mg)"],
                                ["Calcio","Calcio (mg)"],
                                ["Fosforo","Fósforo (mg)"],
                                ["Magnesio","Magnesio (mg)"],
                                ["Hierro","Hierro (mg)"],
                                ["Zinc","Zinc (mg)"],
                                ["Cobre","Cobre (mg)"],
                                ["Selenio","Selenio (µg)"]
                            ].map(([name, label]) => (
                                <div className="nutri-item" key={name}>
                                    <label htmlFor={name}>{label}</label>
                                    <input id={name} type="number" step="any" name={name} value={form[name]} onChange={handleChange} />
                                </div>
                            ))}
                        </div>

                        <h3 className="nutri-section__title">Otros</h3>
                        <div className="nutri-grid nutri-grid--otros">
                            {[
                                ["Humedad","Humedad (%)"],
                                ["Cenizas","Cenizas (%)"]
                            ].map(([name, label]) => (
                                <div className="nutri-item" key={name}>
                                    <label htmlFor={name}>{label}</label>
                                    <input id={name} type="number" step="any" name={name} value={form[name]} onChange={handleChange} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? "Guardando..." : "Crear Alimento"}
                    </button>
                </form>
            </div>
            <Pie />
        </>
    );
};

const CrearAlimentoWithAuth = withAuth(CrearAlimento);
export default CrearAlimentoWithAuth;
