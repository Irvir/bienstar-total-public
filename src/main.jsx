import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/Base.css';
import './styles/Home.css';
import './styles/Login.css';
import './styles/Perfil.css';
import './styles/Alimentos.css';
import './styles/CrearDieta.css';
import './styles/Encabezado.css';
import './styles/Pie.css';
import './App.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
