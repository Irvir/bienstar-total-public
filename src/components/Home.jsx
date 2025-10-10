// src/components/Home.jsx
import React, { useEffect, useState } from 'react';
import '../styles/Home.css';
import { protectPage } from "../controllers/auth";
import Pie from './Pie';
import Encabezado from './Encabezado';
import withAuth from "../components/withAuth";

export function Home() {
    const [userName, setUserName] = useState('Invitado');
    const [activePage, setActivePage] = useState('home');

    const base = import.meta.env.BASE_URL; // prefijo dinámico

    useEffect(() => {
        const usuarioGuardado = localStorage.getItem('usuario');
        if (usuarioGuardado) {
            try {
                const usuario = JSON.parse(usuarioGuardado);
                if (usuario?.name) setUserName(usuario.name);
            } catch (e) {
                console.warn('Usuario inválido', e);
            }
        }

        const currentPage = window.location.pathname.split('/').pop() || 'home';
        setActivePage(currentPage.replace('.html', '').toLowerCase());
    }, []);

    const showLoaderAndRedirect = (path) => {
        const loader = document.getElementById('loader');
        if (loader) loader.style.display = 'flex';
        setTimeout(() => {
            // usamos base para no romper en GitHub Pages
            window.location.href = `${base}${path}`;
        }, 1000);
    };

    return (
        <div className="home-page">
            <div id="contenedorPrincipal">
                <Encabezado activePage={activePage} />

                <div id="cuerpo">
                    <div className="botonera">
                        <button className="btn1" onClick={() => showLoaderAndRedirect('CrearDieta')}></button>
                        <button className="btn2" onClick={() => showLoaderAndRedirect('dietas')}></button>
                        <button className="btn3" onClick={() => showLoaderAndRedirect('calendario')}></button>
                        <button className="btn4" onClick={() => showLoaderAndRedirect('alimentos')}></button>
                        <button className="btn5" onClick={() => showLoaderAndRedirect('tipsParaTuDieta')}></button>
                    </div>
                </div>

                <Pie />
            </div>

            <div id="loader" style={{ display: 'none' }}>
                <span className="loader-text">Cargando</span>
                <div className="loader-dots">
                    <img src={`${base}Imagenes/Imagenes_de_carga/frutilla1.png`} alt="Frutilla1" />
                    <img src={`${base}Imagenes/Imagenes_de_carga/manzana1.png`} alt="Manzana1" />
                    <img src={`${base}Imagenes/Imagenes_de_carga/naranja1.png`} alt="Naranja1" />
                </div>
            </div>
        </div>
    );
}

export default withAuth(Home, false);
