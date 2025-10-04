const traducciones = {
    breakfast: "Desayuno",
    lunch: "Almuerzo",
    dinner: "Cena",
    snack: "Snack",
    snack2: "Snack 2"
};

let diaSeleccionado = null;
let dietaAgrupada = {};
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
    const diaSelect = document.getElementById('dia');
    const tipoComidaSelect = document.getElementById('tipoComida');

    if (!diaSelect || !tipoComidaSelect) return; // ✅ evita el error si no existen

    const dia = diaSelect.value;
    const tipoComida = tipoComidaSelect.value;

    document.getElementById('infoDia').textContent =
        diaSelect.options[dia - 1]?.text || `Día ${dia}`;
    document.getElementById('infoTipoComida').textContent =
        tipoComidaSelect.options[tipoComidaSelect.selectedIndex]?.text || tipoComida;
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
    const encabezado = document.getElementById('diaSeleccionadoTexto');
  
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
    document.querySelectorAll('.selectDia').forEach(select => {
        select.addEventListener('change', async function () {
            const dia = parseInt(this.value);
            await cargarDietaDelDia(dia);
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
    const resumen = document.getElementById("resumenDieta");
    resumen.innerHTML = "";

    if (!diaSeleccionado || !dietaAgrupada[diaSeleccionado]) {
        resumen.textContent = "No hay alimentos para este día.";
        return;
    }

    const ordenComidas = ["breakfast", "lunch", "dinner", "snack", "snack2"];

    ordenComidas.forEach(tipoComida => {
        const tipoTraducido = traducciones[tipoComida] || tipoComida;
        const alimentos = dietaAgrupada[diaSeleccionado][tipoComida] || [];

        // Título
        const titulo = document.createElement("h4");
        titulo.textContent = tipoTraducido;
        resumen.appendChild(titulo);

        // Lista UL sin viñetas
        const lista = document.createElement("ul");
        lista.classList.add("lista-comida");

        if (alimentos.length > 0) {
            alimentos.forEach(alimento => {
                const li = document.createElement("li");
                li.textContent = alimento;
                lista.appendChild(li);
            });
        } else {
            const li = document.createElement("li");
            li.textContent = "(sin alimentos)";
            lista.appendChild(li);
        }

        resumen.appendChild(lista);
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

            // ✅ Solo refresca si el alimento fue agregado al día actualmente seleccionado
            if (parseInt(dia) === diaSeleccionado) {
                await cargarDietaDelDia(diaSeleccionado);
            }
        } else {
            alert("Error al guardar el alimento en la dieta");
        }
    } catch (e) {
        console.error("Error conexión:", e);
        alert("Error de conexión con el servidor.");
    }
}
async function cargarDietaDelDia(dia) {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const id_diet = usuario?.id_diet ?? 1;

    try {
        const res = await fetch(`http://localhost:3000/get-diet?id_diet=${id_diet}`);
        if (!res.ok) throw new Error("No se pudo cargar la dieta");

        const dieta = await res.json();
        dietaAgrupada = {};

        dieta.forEach(({ dia: diaItem, tipo_comida, alimento }) => {
            if (!dietaAgrupada[diaItem]) dietaAgrupada[diaItem] = {};
            if (!dietaAgrupada[diaItem][tipo_comida]) dietaAgrupada[diaItem][tipo_comida] = [];
            dietaAgrupada[diaItem][tipo_comida].push(alimento);
        });

        diaSeleccionado = dia;
        actualizarEncabezadoDia(dia);
        renderDietaDelDia();
    } catch (err) {
        console.error("Error al cargar dieta del día:", err);
    }
}
function nombreDiaSemana(dia) {
    switch (parseInt(dia)) {
        case "1":
        case 1: return "Lunes";
        case "2":
        case 2: return "Martes";
        case "3":
        case 3: return "Miércoles";
        case "4":
        case 4: return "Jueves";
        case "5":
        case 5: return "Viernes";
        case "6":
        case 6: return "Sábado";
        case "7":
        case 7: return "Domingo";
        default: return `Día ${dia}`;
    }
}

function actualizarEncabezadoDia(dia) {
    const nombreDia = nombreDiaSemana(dia);
    document.getElementById("diaSeleccionadoTexto").textContent = nombreDia;
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
            await cargarDietaDelDia(dia);   
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
    // ✅ Actualiza encabezado visual
    actualizarInfoSeleccion();

    // ✅ Tomar el valor actual del select
    const diaInicial = document.getElementById("dia")?.value || 1;

    // ✅ Cargar dieta del día inicial
    await cargarDietaDelDia(diaInicial);

    // ✅ Buscar alimentos iniciales
    const alimentos = await buscarAlimentos("");
    console.log("Alimentos al cargar:", alimentos);

    renderResultados(alimentos);

    // Eventos
    document.getElementById('filtro').addEventListener('input', async function () {
        const query = this.value.trim();
        const alimentos = await buscarAlimentos(query);
        renderResultados(alimentos);
    });

    document.getElementById('btnSalir').addEventListener('click', () => {
        window.location.href = 'dietas.html';
    });

    document.getElementById('dia').addEventListener('change', async function () {
        const nuevoDia = this.value;
        actualizarInfoSeleccion();
        await cargarDietaDelDia(nuevoDia);
    });


    document.getElementById('tipoComida').addEventListener('change', actualizarInfoSeleccion);

    actualizarInfoSeleccion();
});

