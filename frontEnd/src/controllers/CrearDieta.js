// Redirigir si no hay sesión iniciada
try {
    const usuario = localStorage.getItem("usuario");
    if (!usuario) {
        window.location.href = "login.html";
        throw new Error("No hay sesión iniciada");
    }
} catch (e) {
    window.location.href = "login.html";
    throw e;
}
const alimentosSeleccionados = [];

// ================== INFO SELECCIÓN ==================
function actualizarInfoSeleccion() {
    const dia = document.getElementById('dia').value;
    const tipoComida = document.getElementById('tipoComida').value;
    document.getElementById('infoDia').textContent =
        document.getElementById('dia').options[dia - 1].text;
    document.getElementById('infoTipoComida').textContent =
        document.getElementById('tipoComida').options[document.getElementById('tipoComida').selectedIndex].text;
}

// ================== BUSCAR ALIMENTOS ==================
async function buscarAlimentos(query) {
    try {
        const res = await fetch('http://localhost:3000/food-search?q=' + encodeURIComponent(query));
        if (!res.ok) return [];
        return await res.json();
    } catch (e) {
        console.error("Error al buscar alimentos:", e);
        return [];
    }
}
function renderResultados(alimentos) {
    const cont = document.getElementById('resultadosFiltro');
    cont.innerHTML = ''; // Limpiar resultados anteriores

    alimentos.forEach(alimento => {
        const card = document.createElement('div');
        card.className = 'alimento-card';
        card.innerHTML = `
    <div class="alimento-info">
        <strong>${alimento.name}</strong><br>
        Calorías: ${alimento.calories ?? '-'}<br>
        <b>Proteínas:</b> ${alimento.protein ?? '-'} g<br>
        <b>Carbohidratos:</b> ${alimento.carbohydrate ?? '-'} g<br>
        <b>Grasas:</b> ${alimento.total_lipid ?? '-'} g
    </div>

    <div class="grupoSelector">
        <div class="etiqueta">DÍA</div>
        <div class="selector">
            <select class="selectDia">
                <option value="1">Lunes</option>
                <option value="2">Martes</option>
                <option value="3">Miércoles</option>
                <option value="4">Jueves</option>
                <option value="5">Viernes</option>
                <option value="6">Sábado</option>
                <option value="7">Domingo</option>
            </select>
        </div>
    </div>

    <div class="grupoSelector">
        <div class="etiqueta">HORA DE COMIDA</div>
        <div class="selector">
            <select class="selectComida">
                <option value="breakfast">Desayuno</option>
                <option value="lunch">Almuerzo</option>
                <option value="dinner">Cena</option>
                <option value="snack">Snack</option>
                <option value="snack2">Snack 2</option>
            </select>
        </div>
    </div>

    <div class="botonesAccionVertical">
        <button class="btnAgregar" data-id="${alimento.id}" data-name="${alimento.name}">Agregar</button>
        <button class="btnEliminar" data-id="${alimento.id}">Eliminar</button>
    </div>
`;
        cont.appendChild(card);
    });

    // Asignar eventos a los botones recién creados
    document.querySelectorAll('.btnAgregar').forEach(btn => {
        btn.addEventListener('click', function () {
            const card = this.closest('.alimento-card');
            const dia = card.querySelector('.selectDia').value;
            const tipoComida = card.querySelector('.selectComida').value;
            const id = this.getAttribute('data-id');
            const name = this.getAttribute('data-name');

            agregarAlimento(id, name, dia, tipoComida);
        });
    });
    


document.querySelectorAll('.btnEliminar').forEach(btn => {
    btn.addEventListener('click', function () {
        const card = this.closest('.alimento-card');
        const dia = card.querySelector('.selectDia').value;
        const tipoComida = card.querySelector('.selectComida').value;
        const id = this.getAttribute('data-id');

        const idNum = parseInt(id);
        const diaNum = parseInt(dia);
        eliminarAlimento(idNum, diaNum, tipoComida);

    });
});
}
// ================== RENDER DIETA ==================
function renderDietaDelDia() {
    if (!diaSeleccionado || !dietaAgrupada[diaSeleccionado]) return;

    const columna = document.querySelector(`.columna[data-dia="${diaSeleccionado}"] .celda`);
    if (!columna) return;

    columna.innerHTML = "";
    Object.keys(dietaAgrupada[diaSeleccionado]).forEach(tipoComida => {
        const alimentos = dietaAgrupada[diaSeleccionado][tipoComida].join(", ");
        const tipoTraducido = traducciones[tipoComida] || tipoComida;
        const p = document.createElement("p");
        p.innerHTML = `<strong>${tipoTraducido}:</strong> ${alimentos}`;
        columna.appendChild(p);
    });
}

// ================== SELECCIÓN DE ALIMENTO ==================
async function agregarAlimento(id, name, dia, tipoComida) {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const id_diet = usuario?.id_diet ?? 1;

    try {
        const res = await fetch("http://localhost:3000/save-diet", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id_diet,
                meals: [{ id, name, dia, tipoComida }]
            })
        });

        if (res.ok) {
            alert(`${name} agregado a tu dieta (Día ${dia}, ${tipoComida})`);
            // Opcional: refrescar la dieta en pantalla
            // renderDietaDelDia();
        } else {
            alert("Error al guardar el alimento en la dieta");
        }
    } catch (e) {
        console.error("Error conexión:", e);
        alert("Error de conexión con el servidor.");
    }
}


// ================== GUARDAR Y BORRAR ==================
async function guardarDieta() {
    if (alimentosSeleccionados.length === 0) {
        alert('No hay alimentos seleccionados.');
        return;
    }
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const id_diet = usuario?.id_diet ?? 1;

    try {
        const res = await fetch('http://localhost:3000/save-diet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_diet, meals: alimentosSeleccionados })
        });
        if (res.ok) {
            alert('Dieta guardada exitosamente.');
            alimentosSeleccionados.length = 0;
            document.getElementById('listaAlimentos').innerHTML = '';
        } else {
            alert('Error al guardar la dieta.');
        }
    } catch (e) {
        alert('Error de conexión.');
    }
}

async function eliminarAlimento(id, dia, tipoComida) {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const id_diet = usuario?.id_diet ?? 1;
    console.log("Eliminar:", { id_diet, id, dia, tipoComida });

    try {
        const res = await fetch("http://localhost:3000/delete-diet-item", {
            method: "POST", // ✅ CAMBIADO de DELETE a POST
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_diet, id_food: id, dia, tipoComida })
        });

        if (res.ok) {
            alert("Alimento eliminado de la dieta.");
            renderDietaDelDia();
        } else {
            const error = await res.json();
            alert("Error: " + (error.error || "No se pudo eliminar"));
        }
    } catch (e) {
        console.error("Error al eliminar:", e);
    }
}

// ================== EVENTOS ==================
document.addEventListener("DOMContentLoaded", async () => {


    
    
    const alimentos = await buscarAlimentos(""); // ✅ ahora sí puedes usar await
    console.log("Alimentos al cargar:", alimentos); // <-- ¿llega algo?

    renderResultados(alimentos);

    document.getElementById('filtro').addEventListener('input', async function () {
        const query = this.value.trim();
        const alimentos = await buscarAlimentos(query);
        renderResultados(alimentos);
    });

    document.getElementById('btnSalir').addEventListener('click', () => {
        window.location.href = 'dietas.html';
    });

    document.getElementById('dia').addEventListener('change', actualizarInfoSeleccion);
    document.getElementById('tipoComida').addEventListener('change', actualizarInfoSeleccion);
    actualizarInfoSeleccion();
});
