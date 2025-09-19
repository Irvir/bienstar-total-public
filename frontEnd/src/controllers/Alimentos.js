document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modalAlimento");
  const modalImg = document.getElementById("modalImg");
  const modalNombre = document.getElementById("modalNombre");
  const modalInfo = document.getElementById("modalInfo");
  const closeBtn = document.querySelector(".close");

  document.querySelectorAll(".cuadro").forEach(cuadro => {
    const nombreElem = cuadro.querySelector(".nombre");
    const imgElem = cuadro.querySelector("img");
    const id = nombreElem?.dataset.alimentoId;

    if (!nombreElem || !id) return;

    // Ahora el evento se aplica al cuadro completo
    cuadro.addEventListener("click", () => {
        // Actualizar contenido del modal
      modalImg.src = imgElem?.src || "";
    
      modalNombre.textContent = nombreElem.textContent;
      modalInfo.textContent = "Cargando...";
        // Mostrar el modal
      fetch(`http://localhost:3000/food/${id}`)
        .then(res => res.json())
        .then(data => {
          modalInfo.innerHTML = `
            <p>Proteína: ${data.protein} G</p>
            <p>Lípidos Totales: ${data.total_lipid} G</p>
            <p>Carbohidratos: ${data.carbohydrate} G</p>
            <p>Energía: ${data.energy} KCAL</p>
            <p>Azúcares Totales: ${data.total_sugars} G</p>
            <p>Calcio: ${data.calcium} MG</p>
            <p>Hierro: ${data.iron} MG</p>
            <p>Sodio: ${data.sodium} MG</p>
            <p>Colesterol: ${data.cholesterol} MG</p>
          `;
          modal.style.display = "block";
        })
        .catch(err => {
          modalInfo.textContent = "Error al cargar la información nutricional.";
          modal.style.display = "block";
          console.error(err);
        });
    });
  });
  // Cerrar el modal
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });
  // Cerrar al hacer clic fuera del contenido
  window.addEventListener("click", e => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });
});
//Filtro
// Selecciona el input del filtro
const inputFiltro = document.getElementById("filtro");

// Escucha cuando el usuario escribe
inputFiltro.addEventListener("input", () => {
    // Convierte el texto a minúsculas para hacer la búsqueda insensible a mayúsculas/minúsculas
    const texto = inputFiltro.value.toLowerCase();

    document.querySelectorAll(".grid-container .cuadro").forEach(cuadro => {
        const nombreElem = cuadro.querySelector(".nombre");
        if (!nombreElem) return;

        const nombre = nombreElem.textContent.toLowerCase(); // nombre del alimento
        // Si coincide con lo escrito, se muestra; si no, se oculta
        if (nombre.includes(texto)) {
            cuadro.style.display = "block";
        } else {
            cuadro.style.display = "none";
        }
    });
});
