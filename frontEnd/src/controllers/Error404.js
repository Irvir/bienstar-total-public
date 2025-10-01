/*// Error404.js
const rutasValidas = [
    "index.html",
    "perfil.html",
    "dietas.html",
    "alimentos.html",
    "calendario.html",
    "tipsParaTuDieta.html",
    "login.html",
    "CrearCuenta.html",
    "CrearDieta.html",
    "error404.html",
    "Pruebas.html",
    "base.html"
];

// Obtener último segmento
let rutaActual = window.location.pathname.split("/").pop() || "index.html";

// Quitar query y hash
rutaActual = rutaActual.split("?")[0].split("#")[0];

if (!rutasValidas.includes(rutaActual)) {
    if (rutaActual !== "error404.html") {
        window.location.href = "/frontEnd/src/pages/error404.html";
    }
}
    if (rutaActual !== mapaCanonico[rutaLower]) {
        window.location.replace(mapaCanonico[rutaLower]);
    }
else {
    window.location.href = "/frontEnd/src/pages/error404.html";
}




*/