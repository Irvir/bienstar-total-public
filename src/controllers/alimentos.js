/**
 * Alimentos.js - Controlador de la página de alimentos
 * 
 * Maneja:
 * - Modal con información nutricional detallada de cada alimento
 * - Filtro de búsqueda en tiempo real
 * - Carga del nombre de usuario en la interfaz
 */

const API_URL = "http://localhost:3001";

// ===== MANEJO DEL MODAL DE INFORMACIÓN NUTRICIONAL =====

document.addEventListener("DOMContentLoaded", () => {
    // Referencias a elementos del modal
    const modal = document.getElementById("modalAlimento");
    const modalImg = document.getElementById("modalImg");
    const modalNombre = document.getElementById("modalNombre");
    const modalInfo = document.getElementById("modalInfo");
    const closeBtn = document.querySelector(".close");

    /**
     * Abre el modal con información nutricional del alimento seleccionado
     * 
     * @param {string} id - ID del alimento
     * @param {string} nombre - Nombre del alimento
     * @param {string} imgSrc - URL de la imagen del alimento
     */
    function abrirModalAlimento(id, nombre, imgSrc) {
        // Setear contenido inicial del modal
        modalImg.src = imgSrc || "";
        modalNombre.textContent = nombre;
        modalInfo.textContent = "Cargando...";

        // Obtener información nutricional del servidor
        fetch(`${API_URL}/food/${id}`)
            .then(res => {
                if (!res.ok) throw new Error("Error en la respuesta del servidor");
                return res.json();
            })
            .then(data => {
                // Renderizar información nutricional en el modal
                modalInfo.innerHTML = `
                    <p>Proteína: ${data.protein} g</p>
                    <p>Lípidos Totales: ${data.total_lipid} g</p>
                    <p>Carbohidratos: ${data.carbohydrate} g</p>
                    <p>Energía: ${data.energy} kcal</p>
                    <p>Azúcares Totales: ${data.total_sugars} g</p>
                    <p>Calcio: ${data.calcium} mg</p>
                    <p>Hierro: ${data.iron} mg</p>
                    <p>Sodio: ${data.sodium} mg</p>
                    <p>Colesterol: ${data.cholesterol} mg</p>
                `;
                
                // Abrir modal solo si hay datos correctos
                modal.style.display = "block";
            })
            .catch(err => {
                console.error("Error al cargar info del alimento:", err);
                modalInfo.textContent = "No se pudo cargar la información nutricional.";
                // No abrimos modal en caso de error
            });
    }

    /**
     * Asignar evento click a cada cuadro de alimento
     */
    document.querySelectorAll(".cuadro").forEach(cuadro => {
        const nombreElem = cuadro.querySelector(".nombre");
        const imgElem = cuadro.querySelector("img");
        const id = nombreElem?.dataset.alimentoId;

        // Validar que el elemento tenga los datos necesarios
        if (!nombreElem || !id) return;

        cuadro.addEventListener("click", () => {
            abrirModalAlimento(
                id,
                nombreElem.textContent,
                imgElem?.src
            );
        });
    });

    /**
     * Cerrar modal con botón de cierre (X)
     */
    closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });

    /**
     * Cerrar modal haciendo click fuera de él
     */
    window.addEventListener("click", e => {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });
});

// ===== FILTRO DE BÚSQUEDA DE ALIMENTOS =====

const inputFiltro = document.getElementById("filtro");

if (inputFiltro) {
    /**
     * Filtrar alimentos en tiempo real según el texto ingresado
     * Oculta los cuadros que no coinciden con la búsqueda
     */
    inputFiltro.addEventListener("input", () => {
        const texto = inputFiltro.value.toLowerCase();

        document.querySelectorAll(".grid-container .cuadro").forEach(cuadro => {
            const nombreElem = cuadro.querySelector(".nombre");
            if (!nombreElem) return;

            const nombre = nombreElem.textContent.toLowerCase();
            
            // Mostrar u ocultar según coincidencia
            cuadro.style.display = nombre.includes(texto) ? "block" : "none";
        });
    });
}

// ===== CARGAR NOMBRE DE USUARIO EN LA INTERFAZ =====

document.addEventListener("DOMContentLoaded", () => {
    const usuarioGuardado = localStorage.getItem("usuario");

    if (usuarioGuardado) {
        const usuario = JSON.parse(usuarioGuardado);
        const nameUserSpan = document.querySelector(".nameUser");
        
        // Actualizar el nombre de usuario en el encabezado
        if (nameUserSpan) {
            nameUserSpan.textContent = usuario.name;
        }
    }
});
