// src/components/Home.jsx
import React, { useEffect, useState } from 'react';
import '../styles/Home.css';

export default function Home() {
    
    const [userName, setUserName] = useState('Invitado');
    const [activePage, setActivePage] = useState('index.html');

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

        // determine active page from current pathname
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        setActivePage(currentPage);
    }, []);

    const showLoaderAndRedirect = (url) => {
        const loader = document.getElementById('loader');
        if (loader) loader.style.display = 'flex';
        setTimeout(() => {
            window.location.href = url;
        }, 2000);
    };

    const MenuButton = ({ to, children }) => {
        const isActive = activePage === to;
        return (
            <button
                className={isActive ? 'btnMenuSelec' : 'btnMenu'}
                onClick={() => (to === 'index.html' ? (window.location.href = to) : showLoaderAndRedirect(to))}
            >
                {children}
            </button>
        );
    };

    return (
        <div className="home-page">
            <div id="contenedorPrincipal">
                <div id="encabezado">
                    <div className="header-inner">
                        <div className="logo">
                            <a href="index.html">
                                <img src="/Imagenes/Login_Perfil/Logo.png" alt="Logo BienStarTotal" className="logoImg" />
                            </a>
                        </div>

                        <div className="menúBotones">
                            <MenuButton to={'index.html'}>Inicio</MenuButton>
                            <MenuButton to={'alimentos.html'}>Alimentos</MenuButton>
                            <MenuButton to={'dietas.html'}>Dietas</MenuButton>
                            <button className="btnMenuNoti">
                                <img
                                    src="/Imagenes/Login_Perfil/Notificacion.png"
                                    id="btnNotification"
                                    onClick={() => alert('No tienes notificaciones nuevas.')}
                                    style={{ cursor: 'pointer' }}
                                    alt="notificaciones"
                                />
                            </button>
                        </div>

                        <div className="login">
                            <div className="login-left" onClick={() => showLoaderAndRedirect('/login')}>
                                <button className="btnPerfilView" id="btnPerfilView">
                                    <span className="nameUser">{userName}</span>
                                </button>
                            </div>
                            <div className="login-avatar" onClick={() => showLoaderAndRedirect('/login')}>
                                <img src="/Imagenes/Login_Perfil/UserPerfil.png" id="fotoUsuario" alt="Foto de Usuario" className="cursor-pointer" />
                            </div>
                        </div>
                    </div>
                </div>

                <div id="cuerpo">
                    <div className="contenedorIzq">
                        <button className="btn1" onClick={() => showLoaderAndRedirect('CrearDieta.html')}>Crear horario semanal</button>
                        <button className="btn2" onClick={() => showLoaderAndRedirect('dietas.html')}>Dietas</button>
                    </div>
                    <div className="contenedorDer">
                        <button className="btn3" onClick={() => showLoaderAndRedirect('calendario.html')}>Calendario</button>
                        <button className="btn4" onClick={() => showLoaderAndRedirect('alimentos.html')}>Alimentos</button>
                        <button className="btn5" onClick={() => showLoaderAndRedirect('tipsParaTuDieta.html')}>Tips para tu dieta</button>
                    </div>
                </div>

                <div id="pie">
                    <div className="footer-inner">
                        <a href="#" className="footer-link" title="Instagram"><img src="/Imagenes/Pie_Pagina/InstaLogo.png" alt="Instagram" /></a>
                        <a href="#" className="footer-link" title="Facebook"><img src="/Imagenes/Pie_Pagina/FaceLogo.png" alt="Facebook" /></a>
                        <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank" rel="noopener noreferrer" className="footer-link" title="YouTube"><img src="/Imagenes/Pie_Pagina/YouTubeLogo.png" alt="YouTube" /></a>
                        <a href="#" className="footer-link" title="WhatsApp"><img src="/Imagenes/Pie_Pagina/WhatsLogo.png" alt="WhatsApp" /></a>
                    </div>
                </div>
            </div>

            <div id="loader" style={{ display: 'none' }}>
                <span className="loader-text">Cargando</span>
                <div className="loader-dots">
                    {/* loader images — adjust paths if assets live elsewhere */}
                    <img src="/Imagenes/Imagenes_de_carga/frutilla1.png" alt="Frutilla1" />
                    <img src="/Imagenes/Imagenes_de_carga/manzana1.png" alt="Manzana1" />
                    <img src="/Imagenes/Imagenes_de_carga/naranja1.png" alt="Naranja1" />
                </div>
            </div>
        </div>
    );
}
