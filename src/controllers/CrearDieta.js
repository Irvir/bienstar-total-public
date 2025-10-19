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
    const res = await fetch('http://localhost:3001/food-search?q=' + encodeURIComponent(query));
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
        <div class="nutri-grid">
            <div><b>Proteínas:</b> ${alimento.protein ?? '-'} g</div>
            <div><b>Carbohidratos:</b> ${alimento.carbohydrate ?? '-'} g</div>
            <div><b>Grasas:</b> ${alimento.total_lipid ?? '-'} g</div>
            <div><b>Azúcares:</b> ${alimento.total_sugars ?? '-'} g</div>
            <div><b>Calcio:</b> ${alimento.calcium ?? '-'} mg</div>
            <div><b>Hierro:</b> ${alimento.iron ?? '-'} mg</div>
            <div><b>Sodio:</b> ${alimento.sodium ?? '-'} mg</div>
            <div><b>Colesterol:</b> ${alimento.cholesterol ?? '-'} mg</div>
        </div>
        <button class="btnToggleDetalles" aria-expanded="false">Ver más</button>
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
            const dia = document.getElementById('dia')?.value || diaSeleccionado || 1;
            const tipoComida = card.querySelector('.selectComida').value;
            const id = this.getAttribute('data-id');
            const name = this.getAttribute('data-name');

            agregarAlimento(id, name, dia, tipoComida);
        });
    });

    // Toggle de detalles en pantallas pequeñas
    const wide = window.innerWidth >= 1024;
    document.querySelectorAll('.alimento-card').forEach(card => {
        const grid = card.querySelector('.nutri-grid');
        const toggle = card.querySelector('.btnToggleDetalles');
        if (!grid || !toggle) return;
        if (wide) {
            toggle.style.display = 'none';
        } else {
            // Modo compacto: mostrar solo la mitad de items por defecto
            grid.classList.add('compact');
            toggle.addEventListener('click', () => {
                const isShowingAll = grid.classList.toggle('show-all');
                toggle.textContent = isShowingAll ? 'Ver menos' : 'Ver más';
                toggle.setAttribute('aria-expanded', String(isShowingAll));
            });
        }
    });

 


document.querySelectorAll('.btnEliminar').forEach(btn => {
    btn.addEventListener('click', function () {
        const card = this.closest('.alimento-card');
        const dia = document.getElementById('dia')?.value || diaSeleccionado || 1;
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
    const res = await fetch("http://localhost:3001/save-diet", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id_diet,
                meals: [{ id, name, dia, tipoComida }]
            })
        });

        if (res.ok) {
            if (window.notify) {
                window.notify(`${name} agregado a tu dieta (Día ${dia}, ${tipoComida})`, { type: 'success' });
            } else { alert(`${name} agregado a tu dieta (Día ${dia}, ${tipoComida})`); }

            // ✅ Solo refresca si el alimento fue agregado al día actualmente seleccionado
            if (parseInt(dia) === diaSeleccionado) {
                await cargarDietaDelDia(diaSeleccionado);
            }
        } else {
            if (window.notify) window.notify("Error al guardar el alimento en la dieta", { type: 'error' });
            else alert("Error al guardar el alimento en la dieta");
        }
    } catch (e) {
        console.error("Error conexión:", e);
    if (window.notify) window.notify("Error de conexión con el servidor.", { type: 'error' });
    else alert("Error de conexión con el servidor.");
    }
}
async function cargarDietaDelDia(dia) {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const id_diet = usuario?.id_diet ?? 1;

    try {
    const res = await fetch(`http://localhost:3001/get-diet?id_diet=${id_diet}`);
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
/*
// Función legacy no utilizada en React - comentada para evitar errores ESLint
async function guardarDieta() {
    if (alimentosSeleccionados.length === 0) {
        if (window.notify) window.notify('No hay alimentos seleccionados.', { type: 'warning' });
        else alert('No hay alimentos seleccionados.');
        return;
    }
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const id_diet = usuario?.id_diet ?? 1;

    try {
    const res = await fetch('http://localhost:3001/save-diet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_diet, meals: alimentosSeleccionados })
        });
        if (res.ok) {
            if (window.notify) window.notify('Dieta guardada exitosamente.', { type: 'success' });
            else alert('Dieta guardada exitosamente.');
            alimentosSeleccionados.length = 0;
            document.getElementById('listaAlimentos').innerHTML = '';
        } else {
            if (window.notify) window.notify('Error al guardar la dieta.', { type: 'error' });
            else alert('Error al guardar la dieta.');
        }
    } catch (e) {
    if (window.notify) window.notify('Error de conexión.', { type: 'error' });
    else alert('Error de conexión.');
    }
}
*/

async function eliminarAlimento(id, dia, tipoComida) {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const id_diet = usuario?.id_diet ?? 1;

    try {
    const res = await fetch("http://localhost:3001/delete-diet-item", {
            method: "POST", // CAMBIADO de DELETE a POST
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_diet, id_food: id, dia, tipoComida })
        });

        if (res.ok) {
            if (window.notify) window.notify("Alimento eliminado de la dieta.", { type: 'success' });
            else alert("Alimento eliminado de la dieta.");
            await cargarDietaDelDia(dia);   
        } else {
            const error = await res.json();
            if (window.notify) window.notify("Error: " + (error.error || "No se pudo eliminar"), { type: 'error' });
            else alert("Error: " + (error.error || "No se pudo eliminar"));
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

    // ✅ Asegurar que este usuario tenga su propia dieta en backend
    try {
        const rawUser = localStorage.getItem("usuario");
        if (rawUser) {
            const u = JSON.parse(rawUser);
            const resp = await fetch("http://localhost:3001/ensure-diet", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: u.id })
            });
            if (resp.ok) {
                const data = await resp.json();
                // Actualizar id_diet en localStorage si cambió
                if (data?.id_diet && data.id_diet !== u.id_diet) {
                    u.id_diet = data.id_diet;
                    localStorage.setItem("usuario", JSON.stringify(u));
                }
            }
        }
    } catch (e) {
        console.warn("No se pudo asegurar dieta del usuario:", e);
    }

    // ✅ Cargar dieta del día inicial
    await cargarDietaDelDia(diaInicial);

    // ✅ Buscar alimentos iniciales
    const alimentos = await buscarAlimentos("");

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


    const tipoComidaGlobal = document.getElementById('tipoComida');
    if (tipoComidaGlobal) {
        tipoComidaGlobal.addEventListener('change', actualizarInfoSeleccion);
    }

    actualizarInfoSeleccion();

    // ✅ Borrar todo el día seleccionado (btn id: btnBorrarDieta)
    const btnBorrarDieta = document.getElementById('btnBorrarDieta') || document.getElementById('btnBorrarTodo');
    if (btnBorrarDieta) {
        btnBorrarDieta.addEventListener('click', async () => {
            const rawUser = localStorage.getItem("usuario");
            const u = rawUser ? JSON.parse(rawUser) : null;
            const id_diet = u?.id_diet ?? 1;
            const diaActual = document.getElementById('dia')?.value || diaSeleccionado || 1;
            try {
                const resp = await fetch('http://localhost:3001/clear-day', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id_diet, dia: Number(diaActual) })
                });
                if (resp.ok) {
                    await cargarDietaDelDia(diaActual);
                    if (window.notify) window.notify('Se borraron todas las comidas del día seleccionado.', { type: 'success' });
                    else alert('Se borraron todas las comidas del día seleccionado.');
                } else {
                    if (window.notify) window.notify('No se pudo borrar el día.', { type: 'error' });
                    else alert('No se pudo borrar el día.');
                }
            } catch (e) {
                console.error(e);
                if (window.notify) window.notify('Error de conexión al borrar el día.', { type: 'error' });
                else alert('Error de conexión al borrar el día.');
            }
        });
    }
    // Selector de día ya está en el HTML junto a los botones (no reubicar)
});