import React, { Suspense } from 'react';
import Home from './components/Home';
import Error404 from './components/Error404';
import Login from './components/login.jsx';
import CrearCuenta from './components/CrearCuenta.jsx';
import CrearDieta from './components/CrearDieta.jsx';
import Alimentos from './components/Alimentos.jsx';

export default function App() {
  const raw = window.location.pathname.split('/').pop() || '';
  const currentPath = raw.toLowerCase();

  // Treat root, index.html and home/home.html as the main page
  if (!currentPath || currentPath === 'index.html' || currentPath === 'home' || currentPath === 'home.html') {
    return <Home />;
  }

  // If explicitly navigating to the static 404 html, show React 404 too
  if (currentPath === 'error404.html' || currentPath === 'error404') {
    return <Error404 />;
  }

  // Login route
  if (currentPath === 'login' || currentPath === 'login.html') {
    return <Login />;
  }
  // CrearCuenta route (accept hyphenated and non-hyphenated variants)
  if (
    currentPath === 'crearcuenta' ||
    currentPath === 'crearcuenta.html' ||
    currentPath === 'crear-cuenta' ||
    currentPath === 'crear-cuenta.html'
  ) {
    return <CrearCuenta />;
  }
  if(currentPath === 'creardieta' ||
     currentPath === 'creardieta.html' ||
     currentPath === 'crear-dieta' ||
     currentPath === 'crear-dieta.html') {
    return (
        <CrearDieta />
    );
  }

  // Alimentos route
  if (currentPath === 'alimentos' || currentPath === 'alimentos.html') {
    return <Alimentos />;
  }
  // Dietas route
  if (currentPath === 'dietas' || currentPath === 'dietas.html') {
    // Lazy load Dietas component
    const Dietas = React.lazy(() => import('./components/Dietas.jsx'));
    return (
      <Suspense fallback={<div>Cargando...</div>}>
        <Dietas />
      </Suspense>
    );
  }

  // Default: render 404 for any unknown path
  return <Error404 />;
}
