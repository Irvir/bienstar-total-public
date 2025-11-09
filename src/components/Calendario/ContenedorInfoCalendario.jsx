import '../../styles/Calendario.css';
import React, { useEffect, useState } from 'react';
import { API_BASE } from "../shared/apiBase";
const ContenedorInfoCalendario = ({ fecha, onClose }) => {
    const [info, setInfo] = useState(null);

    useEffect(() => {
        const obtenerDatos = async () => {
            if (!fecha) return;

            const fechaStr = fecha.toISOString().split("T")[0];
            const usuarioRaw = localStorage.getItem("usuario") || localStorage.getItem("Usuario");
            if (!usuarioRaw) {
                console.warn(" No hay usuario guardado");
                setInfo({ peso: null, dieta: null });
                return;
            }

            let usuario;
            try {
                usuario = JSON.parse(usuarioRaw);
            } catch (e) {
                console.warn("⚠️ Error parseando usuario en localStorage", e);
                setInfo({ peso: null, dieta: null });
                return;
            }

            const userId = usuario?.id || usuario?._id;
            if (!userId) {
                console.warn(" Usuario sin ID, revisa el login");
                setInfo({ peso: null, dieta: null });
                return;
            }

            try {
                const res = await fetch(`${API_BASE}/api/calendario/${fechaStr}?userId=${userId}`);
                const data = await res.json();
                setInfo(data);
            } catch (err) {
                console.error("Error al obtener datos:", err);
                setInfo({ peso: null, dieta: null });
            }
        };

        obtenerDatos();
    }, [fecha]);



    return (
        <div className="ModalOverlay" onClick={onClose}>
            <div className="ModalContent" onClick={e => e.stopPropagation()}>
                <button className="CerrarModal" onClick={onClose}>×</button>
                <h3>
                    Información del {fecha ? fecha.toLocaleDateString() : 'día desconocido'}
                </h3>

                {info ? (
                    <div>
                        <p><strong>Dieta:</strong> {info.dieta?.nombre || 'Sin asignar'}</p>

                        <p><strong>Peso:</strong> {info.peso ? `${info.peso} kg` : 'Sin registro'}</p>
                    </div>
                ) : (
                    <p>Cargando datos...</p>
                )}
            </div>
        </div>
    );
};

export default ContenedorInfoCalendario;
