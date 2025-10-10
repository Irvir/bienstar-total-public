import React from "react";
import "../styles/Base.css";

export default function Pie() {
    const base = import.meta.env.BASE_URL; // ruta base dinámica

    return (
        <div id="pie">
            <div className="footer-inner">
                <a
                    href="#"
                    className="footer-link"
                    title="Instagram"
                >
                    <img
                        src={`${base}Imagenes/Pie_Pagina/InstaLogo.png`}
                        alt="Instagram"
                    />
                </a>

                <a
                    href="#"
                    className="footer-link"
                    title="Facebook"
                >
                    <img
                        src={`${base}Imagenes/Pie_Pagina/FaceLogo.png`}
                        alt="Facebook"
                    />
                </a>

                <a
                    href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-link"
                    title="YouTube"
                >
                    <img
                        src={`${base}Imagenes/Pie_Pagina/YouTubeLogo.png`}
                        alt="YouTube"
                    />
                </a>

                <a
                    href="#"
                    className="footer-link"
                    title="WhatsApp"
                >
                    <img
                        src={`${base}Imagenes/Pie_Pagina/WhatsLogo.png`}
                        alt="WhatsApp"
                    />
                </a>
            </div>
        </div>
    );
}
