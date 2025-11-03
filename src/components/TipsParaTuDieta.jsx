import React, { useEffect, useState } from "react";
import Encabezado from "./Encabezado";
import Pie from "./Pie";
import Loader from "./Loader.jsx";
import { API_BASE } from "./shared/apiBase";

// Clasificadores simples por palabras clave (no sensibles a acentos)
const CATS = {
  frutas: /\b(manzana|pera|platano|banana|naranja|mandarina|frutilla|fresa|kiwi|uva|durazno|melon|sandia|piña|anana|mango|papaya)\b/i,
  verduras: /\b(lechuga|tomate|zanahoria|brocoli|br[óo]coli|coliflor|espinaca|acelga|piment[óo]n|pepino|zapallo|cebolla|ajo|berenjena)\b/i,
  legumbres: /\b(legumbre|poroto|lenteja|garbanzo|arveja|haba|soja|soya)\b/i,
  pescado: /\b(pescado|atun|at[úu]n|salmon|salm[óo]n|jurel|merluza|reineta|sardina)\b/i,
  integrales: /\b(integral|avena|granola|quinoa|qu[íi]nua|pan integral|arroz integral|fideo integral)\b/i,
  refinados: /\b(pan|marraqueta|hallulla|arroz|fideo|harina|galleta|queque|bizcocho)\b/i,
  embutidos: /\b(salchicha|jam[óo]n|mortadela|longaniza|chorizo|embutido|fiambre|salame|pepperoni|tocino)\b/i,
  fritos: /\b(frito|empanado|empanizada|empanizado|papas fritas|churrasco|milanesa)\b/i,
  bebidasAzucaradas: /\b(bebida|gaseosa|cola|soda|n[ée]ctar|jugo envasado|refresco|energ[ée]tica)\b/i,
  dulces: /\b(az[úu]car|dulce|helado|caramelo|chocolate|pastel|postre)\b/i,
  lacteos: /\b(leche|yogur|queso|quesillo|kefir)\b/i,
  frutosSecos: /\b(nuez|nueces|almendra|almendras|mani|man[ií]|cacahuate|pistacho|avellana|semilla|semillas|chia|ch[íi]a|linaza|s[ée]samo|ajonjol[ií]|girasol|pepita)\b/i,
};

function normalize(str = "") {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function categorizeFood(name = "") {
  const n = normalize(name);
  return Object.entries(CATS).reduce((acc, [key, re]) => {
    if (re.test(n)) acc.push(key);
    return acc;
  }, []);
}

function aggregateDiet(rows) {
  // rows: [{ dia, tipo_comida, alimento, cantidad }]
  const counts = {
    frutas: 0, verduras: 0, legumbres: 0, pescado: 0,
    integrales: 0, refinados: 0, embutidos: 0, fritos: 0,
    bebidasAzucaradas: 0, dulces: 0, lacteos: 0, frutosSecos: 0
  };
  const perDay = {};
  const uniqueFV = new Set();
  const breakfastDays = new Set();
  let sweetsInSnacks = 0;
  for (const r of rows || []) {
    const cats = categorizeFood(r.alimento || "");
    for (const c of cats) counts[c] += 1;
    if (!perDay[r.dia]) perDay[r.dia] = { items: [], meals: new Set() };
    perDay[r.dia].items.push(r.alimento);
    perDay[r.dia].meals.add((r.tipo_comida || '').toLowerCase());
    // variedad FV
    if (cats.includes('frutas') || cats.includes('verduras')) uniqueFV.add(normalize(r.alimento || ''));
    // dulces en snacks
    if ((r.tipo_comida || '').toLowerCase().includes('snack') && (cats.includes('dulces') || cats.includes('bebidasAzucaradas'))) sweetsInSnacks += 1;
  }
  const days = Object.keys(perDay).length || 1;
  for (const [d, obj] of Object.entries(perDay)) {
    if (obj.meals.has('desayuno')) breakfastDays.add(d);
  }
  const avg = Object.fromEntries(
    Object.entries(counts).map(([k, v]) => [k, v / days])
  );
  return { counts, avg, days, uniqueFVCount: uniqueFV.size, breakfastRate: breakfastDays.size / days, sweetsInSnacks };
}

function buildTips(agg) {
  const tips = [];
  const { avg, counts, days, uniqueFVCount = 0, breakfastRate = 0, sweetsInSnacks = 0 } = agg || { avg: {}, counts: {}, days: 1 };

  // 1) 5 porciones de frutas y verduras al día (combinadas)
  const fv = (avg.frutas || 0) + (avg.verduras || 0);
  if (fv >= 5) {
    tips.push({
      title: "Excelente consumo de frutas y verduras",
      status: "ok",
      detail: `Promedio ~${fv.toFixed(1)} porciones/día. Mantén variedad de colores.`
    });
  } else {
    tips.push({
      title: "Aumenta frutas y verduras",
      status: "improve",
      detail: `Vas en ~${fv.toFixed(1)} porciones/día. Intenta llegar a 5+ distribuyendo entre comidas.`
    });
  }

  // 2) Legumbres 2–3 veces por semana
  if (counts.legumbres >= 2) {
    tips.push({
      title: "Buen aporte de legumbres",
      status: "ok",
      detail: `${counts.legumbres} veces en ${days} días. Mantén 2–3 veces/semana.`
    });
  } else {
    tips.push({
      title: "Incluye legumbres 2–3 veces/semana",
      status: "improve",
      detail: `Actualmente ${counts.legumbres} en ${days} días. Puedes sumar lentejas, porotos o garbanzos.`
    });
  }

  // 3) Pescado 1–2 veces/semana
  if (counts.pescado >= 1) {
    tips.push({
      title: "Consumo de pescado presente",
      status: "ok",
      detail: `${counts.pescado} veces en ${days} días. Mantén 1–2/semana variando preparaciones.`
    });
  } else {
    tips.push({
      title: "Suma pescado 1–2 veces/semana",
      status: "improve",
      detail: `Prueba jurel, atún, merluza o salmón al horno/sartén con poco aceite.`
    });
  }

  // 4) Prefiere integrales vs refinados
  if ((avg.integrales || 0) >= (avg.refinados || 0)) {
    tips.push({
      title: "Buenos cereales integrales",
      status: "ok",
      detail: `Integrales ≥ refinados. Mantén pan/arroz/fideos integrales cuando sea posible.`
    });
  } else {
    tips.push({
      title: "Cambia a granos integrales",
      status: "improve",
      detail: `Veo más refinados que integrales. Prueba pan integral, avena o arroz integral.`
    });
  }

  // 5) Limitar bebidas azucaradas y dulces
  if ((avg.bebidasAzucaradas || 0) + (avg.dulces || 0) > 0.5) {
    tips.push({
      title: "Reduce azúcares añadidos",
      status: "improve",
      detail: `Detecté consumo frecuente de bebidas/dulces. Prefiere agua y frutas enteras.`
    });
  } else {
    tips.push({
      title: "Buen control de azúcares",
      status: "ok",
      detail: `Bebidas y dulces poco frecuentes. ¡Bien ahí!`
    });
  }

  // 6) Evitar ultraprocesados/embutidos y fritos
  if ((avg.embutidos || 0) + (avg.fritos || 0) > 0.5) {
    tips.push({
      title: "Modera embutidos y fritos",
      status: "improve",
      detail: `Prueba alternativas al horno, a la plancha o al vapor; usa legumbres y huevos como proteína.`
    });
  } else {
    tips.push({
      title: "Buena elección de preparaciones",
      status: "ok",
      detail: `Pocas preparaciones fritas o embutidos frecuentes. Manténlo así.`
    });
  }

  // 7) Variedad de frutas y verduras (colores y rotación)
  if (uniqueFVCount >= 8) {
    tips.push({
      title: "Buena variedad de frutas y verduras",
      status: "ok",
      detail: `Registré unas ${uniqueFVCount} opciones distintas esta semana. La variedad aporta más micronutrientes.`
    });
  } else {
    tips.push({
      title: "Suma variedad de frutas y verduras",
      status: "improve",
      detail: `Aumenta la rotación para llegar al menos a 8–10 tipos por semana, con diferentes colores.`
    });
  }

  // 8) Lácteos o alternativas fortificadas
  if ((avg.lacteos || 0) >= 1) {
    tips.push({
      title: "Lácteos presentes",
      status: "ok",
      detail: `Consumo diario cercano a 1 porción. Ajusta a tus necesidades y prefiere opciones bajas en azúcar.`
    });
  } else {
    tips.push({
      title: "Incluye lácteos o alternativas",
      status: "improve",
      detail: `Si es compatible contigo, apunta a 1–2 porciones/día de leche, yogur o alternativas fortificadas en calcio.`
    });
  }

  // 9) Frutos secos y semillas
  if ((avg.frutosSecos || 0) >= 0.4) {
    tips.push({
      title: "Aporte de frutos secos/semillas",
      status: "ok",
      detail: `Pequeñas porciones frecuentes aportan grasas saludables y micronutrientes.`
    });
  } else {
    tips.push({
      title: "Agrega frutos secos/semillas",
      status: "improve",
      detail: `Un puñado (20–30 g) 3–5 días/semana puede mejorar la calidad de tu dieta.`
    });
  }

  // 10) Desayuno y estructura de comidas
  if (breakfastRate >= 0.6) {
    tips.push({
      title: "Desayuno frecuente",
      status: "ok",
      detail: `Mantén una estructura regular de comidas para favorecer la energía y el apetito estable.`
    });
  } else {
    tips.push({
      title: "Estructura tus comidas",
      status: "improve",
      detail: `Considera incorporar un desayuno la mayoría de los días con una fuente de fibra y proteínas.`
    });
  }

  // 11) Snacks más saludables si detecto dulces/bebidas en colaciones
  if (sweetsInSnacks > days * 0.3) {
    tips.push({
      title: "Mejora tus snacks",
      status: "improve",
      detail: `Reemplaza colaciones dulces por fruta, yogur natural, frutos secos o bastones de verdura.`
    });
  } else {
    tips.push({
      title: "Buenas elecciones en colaciones",
      status: "ok",
      detail: `Evitas dulces frecuentes en snacks. Continúa con opciones con fibra y proteína.`
    });
  }

  // 12) Sal y saborizantes
  if ((avg.embutidos || 0) > 0.2 || (avg.fritos || 0) > 0.2) {
    tips.push({
      title: "Modera la sal y sodio oculto",
      status: "improve",
      detail: `Reduce sal de mesa y embutidos; usa hierbas, especias, ajo, limón o vinagre para dar sabor.`
    });
  } else {
    tips.push({
      title: "Buen control del sodio",
      status: "ok",
      detail: `Sigue usando hierbas y especias para saborizar sin exceso de sal.`
    });
  }

  return tips;
}

export default function TipsParaTuDieta() {
  const [loading, setLoading] = useState(false);
  const [tips, setTips] = useState([]);
  const [error, setError] = useState("");

  const handleNavigate = (url) => {
    window.location.href = url;
  };

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");
        const raw = localStorage.getItem("usuario");
        if (!raw) {
          handleNavigate("/login");
          return;
        }
        const user = JSON.parse(raw);

        // Asegurar id_dieta si falta
        let dietId = user.id_dieta || user.id_diet;
        if (!dietId) {
          const r = await fetch(`${API_BASE}/ensure-diet`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: user.email })
          });
          const data = await r.json().catch(() => ({}));
          if (r.ok && data?.id_dieta) {
            dietId = data.id_dieta;
            user.id_dieta = dietId; user.id_diet = dietId;
            localStorage.setItem("usuario", JSON.stringify(user));
          }
        }

        if (!dietId) throw new Error("No se encontró una dieta asociada al usuario.");

        const res = await fetch(`${API_BASE}/get-diet?id_dieta=${dietId}`);
        const rows = await res.json().catch(() => []);
        if (!res.ok) throw new Error("No se pudo obtener tu dieta.");

        if (!Array.isArray(rows) || rows.length === 0) {
          setTips(buildTips({ counts: {}, avg: {}, days: 7 }));
        } else {
          const agg = aggregateDiet(rows);
          setTips(buildTips(agg));
        }
      } catch (e) {
        console.error(e);
        setError(e.message || "Error al generar recomendaciones");
        setTips(buildTips({ counts: {}, avg: {}, days: 7 }));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div id="contenedorPrincipal" className="tips-page">
      <Encabezado activePage="dietas" onNavigate={handleNavigate} />

      <div id="cuerpo" style={{ padding: "clamp(1rem, 3vw, 2rem)" }}>
        <section style={{
          maxWidth: 1080,
          margin: "0 auto",
          background: "#fff",
          borderRadius: 16,
          padding: "clamp(16px, 2.5vw, 28px)",
          boxShadow: "0 6px 18px rgba(0,0,0,0.12)"
        }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <h1 style={{ margin: 0 }}>Consejos para tu dieta</h1>
            <a href="https://www.dinta.cl/wp-content/uploads/2023/01/guias_alimentarias_2022_2ed_c.pdf" target="_blank" rel="noopener noreferrer"
               style={{ fontSize: 14 }}>
              Ver documento oficial (DINTA)
            </a>
          </header>

          {error && (
            <div style={{
              background: "#fff3cd",
              border: "1px solid #ffeeba",
              color: "#856404",
              padding: 12,
              borderRadius: 8,
              marginTop: 12
            }}>
              {error}
            </div>
          )}

          <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {tips.map((t, idx) => (
              <article key={idx} style={{
                border: `2px solid ${t.status === 'ok' ? '#89c773' : '#f0a24b'}`,
                borderRadius: 12,
                padding: 16,
                background: t.status === 'ok' ? '#f5fff1' : '#fff8ef'
              }}>
                <h3 style={{ marginTop: 0, marginBottom: 8, fontSize: 18 }}>{t.title}</h3>
                <p style={{ margin: 0, lineHeight: 1.6 }}>{t.detail}</p>
              </article>
            ))}
          </div>

          {/* Resumen textual (parafraseado) de pautas generales */}
          <section style={{ marginTop: 24 }}>
            <h2 style={{ margin: '8px 0' }}>Guía resumida para mejorar tu alimentación</h2>
            <p style={{ margin: '8px 0', lineHeight: 1.8 }}>
              Procura que la mitad de tu plato combine verduras y frutas variadas durante el día. Prefiere cereales
              integrales (pan, arroz o fideos integrales) y legumbres con regularidad en lugar de productos refinados.
              Elige preparaciones al horno, a la plancha o al vapor; limita frituras y ultraprocesados como embutidos.
            </p>
            <p style={{ margin: '8px 0', lineHeight: 1.8 }}>
              Incorpora pescado 1–2 veces por semana como fuente de grasas saludables y prioriza aceites vegetales en
              cantidades moderadas. Modera bebidas azucaradas y dulces; prefiere agua simple para mantener una buena
              hidratación. Reduce el exceso de sal y prueba hierbas o especias para realzar el sabor.
            </p>
            <p style={{ margin: '8px 0', lineHeight: 1.8 }}>
              La constancia es clave: planifica tus comidas, ajusta porciones a tu apetito y actividad física, y busca
              variedad de colores y grupos de alimentos a lo largo de la semana.
            </p>
          </section>

          <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
            <button className="btnMenu" onClick={() => handleNavigate('/crear-dieta')}>Ajustar mi dieta</button>
            <button className="btnMenu" onClick={() => handleNavigate('/dietas')}>Ver mi plan</button>
          </div>

          <p style={{ fontSize: 12, color: '#666', marginTop: 16 }}>
            Nota: Estos consejos son orientativos y se generan de forma automática según los alimentos registrados. Para una recomendación personalizada, consulta con un profesional de salud.
          </p>

          {/* Referencia a la fuente cerca del pie */}
          <p style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
            Referencia: Guías Alimentarias (Chile), documento disponible en
            {' '}
            <a href="https://www.dinta.cl/wp-content/uploads/2023/01/guias_alimentarias_2022_2ed_c.pdf" target="_blank" rel="noopener noreferrer">
              DINTA (PDF)
            </a>.
            Este contenido es un resumen original y no reproduce texto del documento.
          </p>
        </section>
      </div>

      <Loader visible={loading} />
      <Pie />
    </div>
  );
}
