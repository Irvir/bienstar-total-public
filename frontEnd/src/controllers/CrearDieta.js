
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
    if (!query) return [];
    try {
        const res = await fetch('http://localhost:3000/food-search?q=' + encodeURIComponent(query));
        if (!res.ok) return [];
        return await res.json();
    } catch (e) {
        return [];
    }
}

function renderResultados(alimentos) {
    const cont = document.getElementById('resultadosFiltro');
    cont.innerHTML = '';
    if (!alimentos.length) {
        cont.innerHTML = '<div style="color:#931525; padding:10px;">No se encontraron alimentos.</div>';
        return;
    }
    alimentos.forEach(alimento => {
        const card = document.createElement('div');
        card.className = 'alimento-card';
        card.innerHTML = `
            <strong>${alimento.name}</strong><br>
            Calorías: ${alimento.calories ?? '-'}<br>
            <b>Proteínas:</b> ${alimento.protein ?? '-'} g<br>
            <b>Lipidos:</b> ${alimento.total_lipid ?? '-'} g<br>
            <b>Carbohidratos:</b> ${alimento.carbs ?? '-'} g<br>
            <b>Energía:</b> ${alimento.energy ?? '-'} kcal<br>
            <b>Azúcares:</b> ${alimento.total_sugars ?? '-'} g<br>
            <b>Calcio:</b> ${alimento.calcium ?? '-'} mg<br>
            <b>Hierro:</b> ${alimento.iron ?? '-'} mg<br>
            
            <b>Sodio:</b> ${alimento.sodium ?? '-'} mg <br>
            <button class="btnAgregar" data-id="${alimento.id}" data-name="${alimento.name}">Agregar</button>
        `;
        cont.appendChild(card);
    });

    document.querySelectorAll('.btnAgregar').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = this.getAttribute('data-id');
            const name = this.getAttribute('data-name');
            agregarAlimento(id, name);
        });
    });
}

// ================== SELECCIÓN DE ALIMENTO ==================
function agregarAlimento(id, name) {
    const dia = document.getElementById('dia').value;
    const tipoComida = document.getElementById('tipoComida').value;
    const existe = alimentosSeleccionados.some(
        a => a.id === id && a.dia === dia && a.tipoComida === tipoComida
    );
    if (existe) {
        alert('Este alimento ya fue agregado.');
        return;
    }
    const lista = document.getElementById('listaAlimentos');
    const item = document.createElement('li');
    item.textContent = `${name} (Día: ${document.getElementById('dia').options[dia - 1].text}, Comida: ${document.getElementById('tipoComida').options[document.getElementById('tipoComida').selectedIndex].text})`;
    lista.appendChild(item);

    alimentosSeleccionados.push({ id, name, dia, tipoComida });
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

function borrarDieta() {
    alimentosSeleccionados.length = 0;
    document.getElementById('listaAlimentos').innerHTML = '';
}

// ================== EVENTOS ==================
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('btnGuardarDieta').addEventListener('click', guardarDieta);
    document.getElementById('btnBorrarDieta').addEventListener('click', borrarDieta);
    document.getElementById('btnSalir').addEventListener('click', () => {
        window.location.href = 'dietas.html';
    });
    document.getElementById('filtro').addEventListener('input', async function () {
        const query = this.value.trim();
        if (!query) {
            document.getElementById('resultadosFiltro').innerHTML = '';
            return;
        }
        const alimentos = await buscarAlimentos(query);
        renderResultados(alimentos);
    });
    document.getElementById('dia').addEventListener('change', actualizarInfoSeleccion);
    document.getElementById('tipoComida').addEventListener('change', actualizarInfoSeleccion);
    actualizarInfoSeleccion();
});

