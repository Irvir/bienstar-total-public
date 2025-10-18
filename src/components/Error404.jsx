import React from 'react';
import '../styles/Error404.css';

export default function Error404() {
    return (
        <div className="error404-page">
            <div className="container">
                <h1>404</h1>
                <h2>Página no encontrada</h2>
                <p>Lo sentimos, la página que buscas no existe o ha sido movida.</p>
                <a href="index.html" className="btn">Volver al inicio</a>
            </div>
        </div>
    );
}
