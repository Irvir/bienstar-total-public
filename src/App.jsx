import React, { Suspense } from 'react';
import Home from './components/Home';
import Error404 from './components/Error404';
import Login from './components/Login.jsx';
import CrearCuenta from './components/CrearCuenta.jsx';
import CrearDieta from './components/CrearDieta.jsx';
import Alimentos from './components/Alimentos.jsx';
import Perfil from './components/Perfil.jsx';
import Admin from './components/Admin.jsx';
import CrearAlimento from './components/CrearAlimento.jsx';
import Cuentas from './components/Cuentas.jsx';
import TipsParaTuDieta from './components/TipsParaTuDieta.jsx';
import Calendario from './components/Calendario.jsx';

export default function App() {
  const raw = window.location.pathname.split('/').pop() || '';
  const ruta = raw.toLowerCase();

  // Ruta default (home)
  if (!ruta || ruta === 'index.html' || ruta === 'home' || ruta === 'home.html') {
    return <Home />;
  }

  // Si la ruta es error404
  if (ruta === 'error404.html' || ruta === 'error404') {
    return <Error404 />;
  }

  // Si la ruta es login
  if (ruta === 'login' || ruta === 'login.html') {
    return <Login />;
  }
  if (
    ruta === 'crearcuenta' ||
    ruta === 'crearcuenta.html' ||
    ruta === 'crear-cuenta' ||
    ruta === 'crear-cuenta.html'
  ) {
    return <CrearCuenta />;
  }
  if (ruta === 'creardieta' ||
      ruta === 'creardieta.html' ||
     ruta === 'crear-dieta' ||
     ruta === 'crear-dieta.html') {
    return (
      <CrearDieta />
    );
  }

  if (ruta === 'alimentos' || ruta === 'alimentos.html') {
    return <Alimentos />;
  }
  if (ruta === 'dietas' || ruta === 'dietas.html') {
    const Dietas = React.lazy(() => import('./components/Dietas.jsx'));
    return (
      <Suspense fallback={<div>Cargando...</div>}>
        <Dietas />
      </Suspense>
    );
  }
  if (ruta === 'perfil' || ruta === 'perfil.html') {
    return <Perfil />;
  }
  if (ruta === 'admin' || ruta === 'admin.html') {
    return <Admin />;
  }
  if (ruta === 'crear-alimento' || ruta === 'crear-alimento.html') {
    return <CrearAlimento />;
  }
  if (ruta === 'cuentas' || ruta === 'cuentas.html') {
    return <Cuentas />;
  }

  if (ruta === 'tipsparatudieta' || ruta === 'tipsparatudieta.html') {
    return <TipsParaTuDieta />;
  }
  if (ruta === 'calendario' || ruta === 'calendario.html') {
    return (
      <Calendario />
    );
  }

  return <Error404 />;
}
