// CrearAlimento.jsx
import React, { useState } from "react";
import "../styles/CrearAlimento.css";
import withAuth from "../components/withAuth";
import Encabezado from "./Encabezado";
import Pie from "./Pie";
import { API_BASE } from "../components/shared/apiBase";

const CrearAlimento = () => {
    const [form, setForm] = useState({
        nombre: "",
        energy: "",
        protein: "",
        total_lipid: "",
        carbohydrate: "",
        total_sugars: "",
        calcium: "",
        iron: "",
        sodium: "",
        cholesterol: "",
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
                energy: "",
                protein: "",
                total_lipid: "",
                carbohydrate: "",
                total_sugars: "",
                calcium: "",
                iron: "",
                sodium: "",
                cholesterol: "",
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

    return (
        <>
            <Encabezado />
            <div className="crear-alimento-container">
                <h2>Crear Alimento</h2>
                <form onSubmit={handleSubmit} className="crear-alimento-form">
                    <input
                        type="text"
                        name="nombre"
                        placeholder="Nombre"
                        value={form.nombre}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="number"
                        name="energy"
                        placeholder="Calorías"
                        value={form.energy}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="number"
                        name="protein"
                        placeholder="Proteína (g)"
                        value={form.protein}
                        onChange={handleChange}
                    />
                    <input
                        type="number"
                        name="total_lipid"
                        placeholder="Grasas totales (g)"
                        value={form.total_lipid}
                        onChange={handleChange}
                    />
                    <input
                        type="number"
                        name="carbohydrate"
                        placeholder="Carbohidratos (g)"
                        value={form.carbohydrate}
                        onChange={handleChange}
                    />
                    <input
                        type="number"
                        name="total_sugars"
                        placeholder="Azúcares totales (g)"
                        value={form.total_sugars}
                        onChange={handleChange}
                    />
                    <input
                        type="number"
                        name="calcium"
                        placeholder="Calcio (mg)"
                        value={form.calcium}
                        onChange={handleChange}
                    />
                    <input
                        type="number"
                        name="iron"
                        placeholder="Hierro (mg)"
                        value={form.iron}
                        onChange={handleChange}
                    />
                    <input
                        type="number"
                        name="sodium"
                        placeholder="Sodio (mg)"
                        value={form.sodium}
                        onChange={handleChange}
                    />
                    <input
                        type="number"
                        name="cholesterol"
                        placeholder="Colesterol (mg)"
                        value={form.cholesterol}
                        onChange={handleChange}
                    />

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
