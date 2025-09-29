// Error404.js
const rutasValidas = [
    "index.html",
    "perfil.html",
    "dietas.html",
    "alimentos.html",
    "calendario.html",
    "tipsParaTuDieta.html"
];

let rutaActual = window.location.pathname.split("/").pop();

if (rutaActual === "") rutaActual = "index.html";

if (!rutasValidas.includes(rutaActual)) {
    // Ruta relativa correcta desde HTML principal
    window.location.href = "pages/error404.html";
}




