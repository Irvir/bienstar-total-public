// config.js
// Runtime-configurable API base for vanilla JS controllers
// Update this if your backend base URL changes (e.g., reverse proxy or production URL)
window.API_BASE = window.API_BASE || 'http://localhost:3001';
// Example for remote server behind Node/Express that uses the cloud DB:
// window.API_BASE = 'https://tu-dominio-o-public-ip:3001';
// For local development with Node server in this repo:
// window.API_BASE = 'http://localhost:3001';