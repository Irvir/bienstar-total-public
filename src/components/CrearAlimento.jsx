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
                <nav className="crear-alimento-links">
                    <button className="link-btn" onClick={() => showLoaderAndRedirect('/')}>&larr; Inicio</button>
                    <button className="link-btn" onClick={() => showLoaderAndRedirect('/alimentos')}>Alimentos</button>
                    <button className="link-btn" onClick={() => showLoaderAndRedirect('/dietas')}>Dietas</button>
                    <button className="link-btn" onClick={() => showLoaderAndRedirect('/perfil')}>Perfil</button>
                </nav>
                <h2>Crear Alimento</h2>
                <form onSubmit={handleSubmit} className="crear-alimento-form">
                    <input type="text" name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required />

                    <div className="nutrients-grid">
                        <input type="number" step="any" name="Energia" placeholder="Energía (kcal)" value={form.Energia} onChange={handleChange} />
                        <input type="number" step="any" name="Humedad" placeholder="Humedad (%)" value={form.Humedad} onChange={handleChange} />
                        <input type="number" step="any" name="Cenizas" placeholder="Cenizas (%)" value={form.Cenizas} onChange={handleChange} />
                        <input type="number" step="any" name="Proteinas" placeholder="Proteínas (g)" value={form.Proteinas} onChange={handleChange} />
                        <input type="number" step="any" name="H_de_C_disp" placeholder="H de C disp (g)" value={form.H_de_C_disp} onChange={handleChange} />
                        <input type="number" step="any" name="Azucares_totales" placeholder="Azúcares totales (g)" value={form.Azucares_totales} onChange={handleChange} />
                        <input type="number" step="any" name="Fibra_dietetica_total" placeholder="Fibra dietética (g)" value={form.Fibra_dietetica_total} onChange={handleChange} />
                        <input type="number" step="any" name="Lipidos_totales" placeholder="Lípidos totales (g)" value={form.Lipidos_totales} onChange={handleChange} />
                        <input type="number" step="any" name="Ac_grasos_totales" placeholder="Ác. grasos totales (g)" value={form.Ac_grasos_totales} onChange={handleChange} />
                        <input type="number" step="any" name="Ac_grasos_poliinsat" placeholder="Ác. grasos poliinsat (g)" value={form.Ac_grasos_poliinsat} onChange={handleChange} />
                        <input type="number" step="any" name="Ac_grasos_trans" placeholder="Ác. grasos trans (g)" value={form.Ac_grasos_trans} onChange={handleChange} />
                        <input type="number" step="any" name="Colesterol" placeholder="Colesterol (mg)" value={form.Colesterol} onChange={handleChange} />

                        <input type="number" step="any" name="Vitamina_A" placeholder="Vitamina A" value={form.Vitamina_A} onChange={handleChange} />
                        <input type="number" step="any" name="Vitamina_C" placeholder="Vitamina C" value={form.Vitamina_C} onChange={handleChange} />
                        <input type="number" step="any" name="Vitamina_D" placeholder="Vitamina D" value={form.Vitamina_D} onChange={handleChange} />
                        <input type="number" step="any" name="Vitamina_E" placeholder="Vitamina E" value={form.Vitamina_E} onChange={handleChange} />
                        <input type="number" step="any" name="Vitamina_K" placeholder="Vitamina K" value={form.Vitamina_K} onChange={handleChange} />
                        <input type="number" step="any" name="Vitamina_B1" placeholder="Vitamina B1" value={form.Vitamina_B1} onChange={handleChange} />
                        <input type="number" step="any" name="Vitamina_B2" placeholder="Vitamina B2" value={form.Vitamina_B2} onChange={handleChange} />
                        <input type="number" step="any" name="Niacina" placeholder="Niacina" value={form.Niacina} onChange={handleChange} />
                        <input type="number" step="any" name="Vitamina_B6" placeholder="Vitamina B6" value={form.Vitamina_B6} onChange={handleChange} />
                        <input type="number" step="any" name="Ac_pantotenico" placeholder="Ác. pantoténico" value={form.Ac_pantotenico} onChange={handleChange} />
                        <input type="number" step="any" name="Vitamina_B12" placeholder="Vitamina B12" value={form.Vitamina_B12} onChange={handleChange} />
                        <input type="number" step="any" name="Folatos" placeholder="Folatos" value={form.Folatos} onChange={handleChange} />

                        <input type="number" step="any" name="Sodio" placeholder="Sodio (mg)" value={form.Sodio} onChange={handleChange} />
                        <input type="number" step="any" name="Potasio" placeholder="Potasio (mg)" value={form.Potasio} onChange={handleChange} />
                        <input type="number" step="any" name="Calcio" placeholder="Calcio (mg)" value={form.Calcio} onChange={handleChange} />
                        <input type="number" step="any" name="Fosforo" placeholder="Fósforo (mg)" value={form.Fosforo} onChange={handleChange} />
                        <input type="number" step="any" name="Magnesio" placeholder="Magnesio (mg)" value={form.Magnesio} onChange={handleChange} />
                        <input type="number" step="any" name="Hierro" placeholder="Hierro (mg)" value={form.Hierro} onChange={handleChange} />
                        <input type="number" step="any" name="Zinc" placeholder="Zinc (mg)" value={form.Zinc} onChange={handleChange} />
                        <input type="number" step="any" name="Cobre" placeholder="Cobre (mg)" value={form.Cobre} onChange={handleChange} />
                        <input type="number" step="any" name="Selenio" placeholder="Selenio (µg)" value={form.Selenio} onChange={handleChange} />
                    </div>

                    <input type="file" accept="image/*" onChange={handleImageChange} />
                    {imagePreview && <img src={imagePreview} alt="Preview" className="image-preview" />}

                    <button type="submit" disabled={loading}>
                        {loading ? "Guardando..." : "Crear Alimento"}
                    </button>
                </form>
            </div>
            <Pie />
        </>
    );
};

export default withAuth(CrearAlimento);
