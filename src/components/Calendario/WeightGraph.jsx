import React, { useEffect, useState, useMemo } from 'react';
import { API_BASE } from '../shared/apiBase';
import '../../styles/Calendario.css';
import ContenedorInfoCalendario from './ContenedorInfoCalendario.jsx';

const WeightGraph = ({ userId }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        if (!userId) return;
        const fetchHistory = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE}/user/${userId}/weights?limit=30`);
                if (!res.ok) throw new Error('Error al cargar datos del gráfico');
                const json = await res.json();
                const items = Array.isArray(json.items) ? json.items : [];
                const sorted = items.sort((a, b) => (a.fecha > b.fecha ? 1 : -1));
                setData(sorted);
            } catch (err) {
                console.error(err);
                setError('No se pudo cargar el gráfico.');
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [userId]);

    const width = 500;
    const height = 300;
    const padding = 40;

    const graphData = useMemo(() => {
        if (!data.length) return null;

        const weights = data.map(d => Number(d.peso));
        const minWeight = Math.min(...weights) - 2;
        const maxWeight = Math.max(...weights) + 2;

        const getX = (index) => {
            const availableWidth = width - padding * 2;
            const step = availableWidth / (data.length - 1 || 1);
            return padding + step * index;
        };

        const getY = (weight) => {
            const availableHeight = height - padding * 2;
            const range = maxWeight - minWeight || 1;
            const normalized = (weight - minWeight) / range;
            return height - padding - normalized * availableHeight;
        };

        const pointsArray = data.map((d, i) => ({
            x: getX(i),
            y: getY(d.peso),
            raw: d,
        }));

        const pointsStr = pointsArray.map(p => `${p.x},${p.y}`).join(' ');

        return {
            pointsStr,
            pointsArray,
            minWeight,
            maxWeight,
        };
    }, [data]);

    if (!userId) {
        return (
            <div className="cal-graph-container empty">
                <p>Inicia sesión para ver tu progreso.</p>
            </div>
        );
    }

    if (loading) return <div className="cal-graph-container loading">Cargando gráfico...</div>;
    if (error) return <div className="cal-graph-container error">{error}</div>;
    if (!data.length) return <div className="cal-graph-container empty">Sin datos suficientes para graficar.</div>;

    const first = data[0];
    const last = data[data.length - 1];

    const delta = Number(last.peso) - Number(first.peso);
    const totalDays =
        data.length > 1
            ? (new Date(data[data.length - 1].fecha).getTime() - new Date(data[0].fecha).getTime()) /
            (1000 * 60 * 60 * 24)
            : 0;

    const trend =
        delta < -0.5
            ? 'baja'
            : delta > 0.5
                ? 'sube'
                : 'estable';

    const getMotivation = () => {
        if (trend === 'baja') {
            return {
                title: '¡Se nota tu esfuerzo! 💪',
                text: `Has bajado aproximadamente ${Math.abs(delta).toFixed(1)} kg desde tu primer registro. 
Sigue así, los cambios pequeños y constantes son los que dan resultados reales.`,
                tip: 'Tip: Mantén una rutina de sueño estable y toma suficiente agua durante el día. Tu cuerpo lo nota.'
            };
        }
        if (trend === 'sube') {
            return {
                title: 'Esto no es un retroceso, es información 📊',
                text: `Tu peso ha aumentado alrededor de ${delta.toFixed(1)} kg en este periodo. No es un fracaso, 
es una señal para ajustar un poco el rumbo.`,
                tip: 'Tip: Revisa tus horarios de comida y snacks. A veces un pequeño cambio (como reducir bebidas azucaradas) marca la diferencia.'
            };
        }
        return {
            title: 'Peso estable: también es progreso ⚖️',
            text: 'Te has mantenido bastante estable en estos registros. Eso significa que tienes una buena base sobre la que puedes seguir mejorando.',
            tip: 'Tip: Si quieres ver más cambios, prueba sumar 10–15 minutos extra de movimiento al día (caminar, bailar, subir escaleras, etc.).'
        };
    };

    const motivation = getMotivation();

    const handlePointClick = (fechaIso) => {
        const dateObj = new Date(fechaIso);
        if (Number.isNaN(dateObj.getTime())) return;
        setSelectedDate(dateObj);
        setModalOpen(true);
    };

    return (
        <div className="cal-graph-container">
            <h3>Tu Progreso (Últimos 30 registros)</h3>

            <div className="cal-graph-summary">
                <div className="cal-graph-chip inicio">
                    <span className="chip-label">INICIO</span>
                    <span className="chip-value">{first?.peso} kg</span>
                    <span className="chip-date">
                        {new Date(first?.fecha).toLocaleDateString()}
                    </span>
                </div>
                <div className="cal-graph-chip actual">
                    <span className="chip-label">ACTUAL</span>
                    <span className="chip-value">{last?.peso} kg</span>
                    <span className="chip-date">
                        {new Date(last?.fecha).toLocaleDateString()}
                    </span>
                </div>
            </div>

            <svg viewBox={`0 0 ${width} ${height}`} className="cal-graph-svg">
                <defs>
                    <linearGradient id="lineGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#EC221F" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#EC221F" stopOpacity="0" />
                    </linearGradient>

                    <filter id="endGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                    const y = padding + (height - padding * 2) * ratio;
                    return (
                        <line
                            key={ratio}
                            x1={padding}
                            y1={y}
                            x2={width - padding}
                            y2={y}
                            stroke="#e5e7eb"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                        />
                    );
                })}

                {graphData && (
                    <polygon
                        points={`${padding},${height - padding} ${graphData.pointsStr} ${width - padding},${height - padding}`}
                        fill="url(#lineGradient)"
                    />
                )}

                {graphData && (
                    <polyline
                        className="cal-graph-line"
                        fill="none"
                        stroke="#EC221F"
                        strokeWidth="4"
                        points={graphData.pointsStr}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                )}

                {graphData && (
                    <circle
                        r="6"
                        className="cal-graph-pulse"
                        style={{
                            offsetPath: `path("M ${graphData.pointsArray
                                .map((p) => `${p.x} ${p.y}`)
                                .join(' L ')}")`,
                        }}
                    />
                )}

                {graphData &&
                    graphData.pointsArray.map((p, i) => {
                        const d = p.raw;
                        const isLast = i === graphData.pointsArray.length - 1;

                        if (isLast) {
                            return (
                                <g
                                    key={d.id || i}
                                    onClick={() => handlePointClick(d.fecha)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <circle
                                        cx={p.x}
                                        cy={p.y}
                                        r="10"
                                        fill="rgba(236, 34, 31, 0.2)"
                                        className="cal-graph-end-pulse"
                                    />
                                    <circle
                                        cx={p.x}
                                        cy={p.y}
                                        r="6"
                                        fill="#fff"
                                        stroke="#EC221F"
                                        strokeWidth="3"
                                        filter="url(#endGlow)"
                                    >
                                        <title>{`${new Date(d.fecha).toLocaleDateString()}: ${d.peso} kg`}</title>
                                    </circle>
                                </g>
                            );
                        }

                        return (
                            <g
                                key={d.id || i}
                                onClick={() => handlePointClick(d.fecha)}
                                style={{ cursor: 'pointer' }}
                            >
                                <circle
                                    cx={p.x}
                                    cy={p.y}
                                    r="5"
                                    fill="#fff"
                                    stroke="#B20C05"
                                    strokeWidth="2.5"
                                    className="cal-graph-point"
                                >
                                    <title>{`${new Date(d.fecha).toLocaleDateString()}: ${d.peso} kg`}</title>
                                </circle>
                            </g>
                        );
                    })}

                {graphData &&
                    graphData.pointsArray.map((p, i) => {
                        const fecha = new Date(p.raw.fecha);
                        const label = fecha.toLocaleDateString(undefined, {
                            day: '2-digit',
                            month: 'short',
                        });

                        return (
                            <g key={`xlabel-${p.raw.id || i}`}>
                                <line
                                    x1={p.x}
                                    y1={height - padding}
                                    x2={p.x}
                                    y2={height - padding + 5}
                                    stroke="#9ca3af"
                                    strokeWidth="1"
                                />
                                <text
                                    x={p.x}
                                    y={height - padding + 18}
                                    textAnchor="middle"
                                    className="cal-graph-xlabel"
                                >
                                    {label}
                                </text>
                            </g>
                        );
                    })}

                {graphData && (
                    <>
                        <text
                            x={padding - 10}
                            y={height - padding}
                            textAnchor="end"
                            className="cal-graph-ylabel"
                        >
                            {graphData.minWeight.toFixed(0)} kg
                        </text>
                        <text
                            x={padding - 10}
                            y={padding + 4}
                            textAnchor="end"
                            className="cal-graph-ylabel"
                        >
                            {graphData.maxWeight.toFixed(0)} kg
                        </text>
                    </>
                )}
            </svg>

            <div className="cal-graph-motivation">
                <h4>{motivation.title}</h4>
                <p>{motivation.text}</p>
                <p className="cal-graph-tip"><strong>🎯 Consejo:</strong> {motivation.tip}</p>
                {totalDays > 0 && (
                    <p className="cal-graph-meta">
                        Estos cambios corresponden aproximadamente a los últimos {Math.round(totalDays)} días.
                    </p>
                )}
            </div>

            {modalOpen && selectedDate && (
                <ContenedorInfoCalendario
                    fecha={selectedDate}
                    onClose={() => setModalOpen(false)}
                    pesoDelDia={
                        data.find((d) => d.fecha.startsWith(selectedDate.toISOString().slice(0, 10)))?.peso
                    }
                    onWeightSaved={() => { }}
                />
            )}
        </div>
    );
};

export default WeightGraph;
