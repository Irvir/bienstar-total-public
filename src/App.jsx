import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./components/Home";
import Error404 from "./components/Error404";
import Login from "./components/Login.jsx";
import CrearCuenta from "./components/CrearCuenta.jsx";
import CrearDieta from "./components/CrearDieta.jsx";
import Alimentos from "./components/Alimentos.jsx";
import Perfil from "./components/Perfil.jsx";

const Dietas = lazy(() => import("./components/Dietas.jsx"));

export default function App() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/crear-cuenta" element={<CrearCuenta />} />
        <Route path="/creardieta" element={<CrearDieta />} />
        <Route path="/alimentos" element={<Alimentos />} />
        <Route path="/dietas" element={<Dietas />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="*" element={<Error404 />} />
      </Routes>
    </Suspense>
  );
}
