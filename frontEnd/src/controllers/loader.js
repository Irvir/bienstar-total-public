// Inyecta las imágenes de frutas al cargar
document.addEventListener("DOMContentLoaded", () => {
    const loaderDots = document.querySelector(".loader-dots");
    if (loaderDots) {
        const frutas = [
            "/frontend/imagenes/imagenes de carga/manzana1.png",
            "/frontend/imagenes/imagenes de carga/frutilla1.png",
            "/frontend/imagenes/imagenes de carga/naranja1.png"
        ];

        frutas.forEach(src => {
            const img = document.createElement("img");
            img.src = src;
            img.alt = "";
            loaderDots.appendChild(img);
        });
    }
});

// Muestra la pantalla de carga y redirige
function showLoaderAndRedirect(url) {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'flex'; // Mostrar centrado
    setTimeout(() => {
        window.location.href = url;
    }, 2000);
}