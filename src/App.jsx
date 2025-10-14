import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

import Home from './components/Home';
import Error404 from './components/Error404';
import Login from './components/Login.jsx';
import CrearCuenta from './components/CrearCuenta.jsx';
import CrearDieta from './components/CrearDieta.jsx';
import Alimentos from './components/Alimentos.jsx';
import Perfil from './components/Perfil.jsx';
import Admin from './components/Admin.jsx';

const Dietas = React.lazy(() => import('./components/Dietas.jsx'));

export default function App() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/crear-cuenta" element={<CrearCuenta />} />
        <Route path="/crearcuenta" element={<CrearCuenta />} />
        <Route path="/crear-dieta" element={<CrearDieta />} />
        <Route path="/creardieta" element={<CrearDieta />} />
        <Route path="/alimentos" element={<Alimentos />} />
        <Route path="/dietas" element={<Dietas />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Error404 />} />
      </Routes>
    </Suspense>
  );
}