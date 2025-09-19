const modal = document.getElementById("modalAlimento");
const modalImg = document.getElementById("modalImg");
const modalNombre = document.getElementById("modalNombre");
const modalInfo = document.getElementById("modalInfo");
const closeBtn = document.querySelector(".close");

const botones = document.querySelectorAll(".botonAlimento");

botones.forEach(boton => {
    boton.addEventListener("click", () => {
        const img = boton.querySelector("img").src;
        const nombre = boton.querySelector("p.nombre").textContent;
        const info = boton.querySelector("p.nombre").getAttribute("data-info");

        modalImg.src = img;
        modalNombre.textContent = nombre; // nombre en h2
        modalInfo.textContent = info;     // descripción en p

        modal.style.display = "block";
    });
});

closeBtn.addEventListener("click", () => modal.style.display = "none");
window.addEventListener("click", e => { if(e.target == modal) modal.style.display = "none"; });

