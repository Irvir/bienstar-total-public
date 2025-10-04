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

// Obtener último segmento sin extensión
let rutaActual = window.location.pathname.split("/").pop().split("?")[0].split("#")[0];

// Si no tiene extensión, agregarla
if (!rutaActual.includes(".html")) {
    rutaActual += ".html";
}

// Redirigir si no es válida
if (!rutasValidas.includes(rutaActual)) {
    window.location.href = "/frontEnd/src/pages/error404.html";
}