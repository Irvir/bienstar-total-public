import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles/Base.css';
import './controllers/notify.js';
import './controllers/alimentos.js';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename="/bienstar-total-public">
      <App />
    </BrowserRouter>
  </StrictMode>
);