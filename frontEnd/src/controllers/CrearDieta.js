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
            <strong>${alimento.name}</strong>
            <div class="alimento-info">
                <b>Calorías:</b> ${alimento.calories ?? '-'} kcal<br>
                <b>Proteínas:</b> ${alimento.protein ?? '-'} g<br>
                <b>Lipidos:</b> ${alimento.total_lipid ?? '-'} g<br>
                <b>Carbohidratos:</b> ${alimento.carbs ?? '-'} g<br>
                <b>Energía:</b> ${alimento.energy ?? '-'} kcal<br>
                <b>Azúcares:</b> ${alimento.total_sugars ?? '-'} g<br>
                <b>Calcio:</b> ${alimento.calcium ?? '-'} mg<br>
                <b>Hierro:</b> ${alimento.iron ?? '-'} mg<br>
                
                <b>Sodio:</b> ${alimento.sodium ?? '-'} mg
            </div>
        `;
        cont.appendChild(card);
    });
}
