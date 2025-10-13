import React from "react";
import "../styles/Pie.css"; // estilos del pie de página

export default function Pie() {
    return (
        <div id="pie">
        <div className="footer-inner">
          <a href="#" className="footer-link ig" title="Instagram">
            <img src="/Imagenes/Pie_Pagina/igLogo.png" alt="Instagram" />
          </a>
         
          <a
            href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link yt"
            title="YouTube"
          >
            <img src="/Imagenes/Pie_Pagina/ytLogo.webp" alt="YouTube" />
          </a>
          
        </div>
      </div>
    );
}
