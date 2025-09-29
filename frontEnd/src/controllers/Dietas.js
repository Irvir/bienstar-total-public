
document.addEventListener("DOMContentLoaded", () => {
    // ================== MENÚ DE USUARIO ==================
    const btnPerfilView = document.getElementById("btnPerfilView");
    const menuDesplegable = document.getElementById("menuDesplegable");
    const logoutButton = document.getElementById("logoutButton");
    const fotoUsuario = document.getElementById("fotoUsuario");

    menuDesplegable.style.position = "absolute";
    menuDesplegable.style.top = "8%";
    menuDesplegable.style.right = "8%";
    menuDesplegable.style.display = "none";
    menuDesplegable.style.width = "10%";

    function toggleMenu() {
        menuDesplegable.style.display =
            menuDesplegable.style.display === "block" ? "none" : "block";
    }

    btnPerfilView.addEventListener("click", toggleMenu);

    logoutButton.addEventListener("click", () => {
        localStorage.removeItem("usuario");
        window.location.href = "Login.html";
    });

    document.addEventListener("click", (event) => {
        if (!btnPerfilView.contains(event.target) &&
            !menuDesplegable.contains(event.target) &&
            !fotoUsuario.contains(event.target)) {
            menuDesplegable.style.display = "none";
        }
    });

    fotoUsuario.addEventListener("click", () => {
        window.location.href = "login.html";
    });

    // ================== NOMBRE DE USUARIO ==================
    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) {
        const usuario = JSON.parse(usuarioGuardado);
        const nameUserSpan = document.querySelector(".nameUser");
        if (nameUserSpan) {
            nameUserSpan.textContent = usuario.name;
        }
    }
});

// ================== CARGAR DIETA ==================
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const res = await fetch("http://localhost:3000/get-diet");
        if (!res.ok) {
            console.error("Error al obtener la dieta:", res.statusText);
            return;
        }

        const dieta = await res.json();
        const dietaAgrupada = {};

        dieta.forEach(({ dia, tipo_comida, alimento }) => {
            if (!dietaAgrupada[dia]) {
                dietaAgrupada[dia] = {};
            }
            if (!dietaAgrupada[dia][tipo_comida]) {
                dietaAgrupada[dia][tipo_comida] = [];
            }
            dietaAgrupada[dia][tipo_comida].push(alimento);
        });

        Object.keys(dietaAgrupada).forEach(dia => {
            const columna = document.querySelector(`.columna[data-dia="${dia}"] .celda`);
            if (!columna) return;

            columna.innerHTML = "";
            Object.keys(dietaAgrupada[dia]).forEach(tipoComida => {
                const alimentos = dietaAgrupada[dia][tipoComida].join(", ");
                const p = document.createElement("p");
                p.innerHTML = `<strong>${tipoComida}:</strong> ${alimentos}`;
                columna.appendChild(p);
            });
        });
    } catch (err) {
        console.error("Error al cargar la dieta:", err);
    }
});

