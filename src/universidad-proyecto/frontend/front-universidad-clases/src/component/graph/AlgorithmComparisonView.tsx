import type { AlgorithmResult, ComparisonData } from "../../hooks/useAlgorithmComparison";

interface Props {
    data: ComparisonData;
}

const ALGO_COLORS = ["#f59e42", "#6366f1", "#10b981"];
const ALGO_ICONS  = ["⚡", "📊", "🎯"];

function TimingBar({ ms, maxMs }: { ms: number; maxMs: number }) {
    const pct = maxMs > 0 ? (ms / maxMs) * 100 : 0;
    return (
        <div className="algo-bar-track">
            <div className="algo-bar-fill" style={{ width: `${pct}%` }} />
            <span className="algo-bar-label">{ms.toFixed(2)} ms</span>
        </div>
    );
}

function ColorBar({ used, available }: { used: number; available: number }) {
    const pct = available > 0 ? (used / available) * 100 : 0;
    return (
        <div className="algo-bar-track">
            <div className="algo-bar-fill algo-bar-fill--colors" style={{ width: `${pct}%` }} />
            <span className="algo-bar-label">{used} / {available} salones</span>
        </div>
    );
}

function AlgorithmCard({ result, idx, maxMs, available }: {
    result: AlgorithmResult;
    idx: number;
    maxMs: number;
    available: number;
}) {
    const color = ALGO_COLORS[idx] ?? "#888";
    const icon  = ALGO_ICONS[idx] ?? "●";
    return (
        <div className="algo-card" style={{ borderTopColor: color }}>
            <div className="algo-card__header">
                <span className="algo-card__icon">{icon}</span>
                <span className="algo-card__name">{result.nombre}</span>
                <span className={`algo-card__badge ${result.valido ? "algo-card__badge--ok" : "algo-card__badge--err"}`}>
                    {result.valido ? "✅ Válido" : "❌ Inválido"}
                </span>
            </div>

            <p className="algo-card__desc">{result.descripcion}</p>

            <div className="algo-card__metrics">
                <div className="algo-metric">
                    <span className="algo-metric__label">Salones usados</span>
                    <ColorBar used={result.colores} available={available} />
                </div>
                <div className="algo-metric">
                    <span className="algo-metric__label">Tiempo de ejecución</span>
                    <TimingBar ms={result.tiempoMs} maxMs={maxMs} />
                </div>
            </div>
        </div>
    );
}

function ComparisonChart({ resultados, available }: { resultados: AlgorithmResult[]; available: number }) {
    const maxMs     = Math.max(...resultados.map(r => r.tiempoMs));
    const barHeight = 24;
    const gap       = 10;
    const svgH      = resultados.length * (barHeight * 2 + gap + 20) + 30;
    const W         = 400;
    const labelW    = 90;
    const barW      = W - labelW - 80;

    return (
        <div className="algo-chart">
            <h3 className="algo-chart__title">Comparación visual</h3>
            <svg width="100%" viewBox={`0 0 ${W} ${svgH}`} style={{ overflow: "visible" }}>
                {resultados.map((r, i) => {
                    const color   = ALGO_COLORS[i] ?? "#888";
                    const y       = i * (barHeight * 2 + gap + 20) + 10;
                    const colPct  = available > 0 ? r.colores / available : 0;
                    const timePct = maxMs > 0 ? r.tiempoMs / maxMs : 0;

                    return (
                        <g key={r.nombre}>
                            {/* Algorithm label */}
                            <text x={labelW - 4} y={y + barHeight * 0.7} textAnchor="end"
                                fontSize="11" fill="#555" dominantBaseline="middle">
                                {r.nombre}
                            </text>
                            {/* Colors bar */}
                            <rect x={labelW} y={y} width={barW * colPct} height={barHeight}
                                fill={color} rx={3} opacity={0.85} />
                            <rect x={labelW} y={y} width={barW} height={barHeight}
                                fill="none" stroke="#e0e0e0" strokeWidth={1} rx={3} />
                            <text x={labelW + barW * colPct + 5} y={y + barHeight * 0.6}
                                fontSize="10" fill="#666" dominantBaseline="middle">
                                {r.colores} salones
                            </text>
                            {/* Time bar */}
                            <rect x={labelW} y={y + barHeight + 3} width={barW * timePct}
                                height={barHeight * 0.7} fill={color} rx={2} opacity={0.45} />
                            <rect x={labelW} y={y + barHeight + 3} width={barW}
                                height={barHeight * 0.7} fill="none" stroke="#e0e0e0"
                                strokeWidth={1} rx={2} />
                            <text x={labelW + barW * timePct + 5} y={y + barHeight + 3 + barHeight * 0.35}
                                fontSize="10" fill="#888" dominantBaseline="middle">
                                {r.tiempoMs.toFixed(2)} ms
                            </text>
                        </g>
                    );
                })}
            </svg>
            <div className="algo-chart__legend">
                <span className="algo-chart__legend-item">
                    <span className="algo-chart__dot" style={{ background: "#555", opacity: 0.85 }} />
                    Salones usados (barras oscuras)
                </span>
                <span className="algo-chart__legend-item">
                    <span className="algo-chart__dot" style={{ background: "#aaa", opacity: 0.45 }} />
                    Tiempo de ejecución (barras claras)
                </span>
            </div>
        </div>
    );
}

export default function AlgorithmComparisonView({ data }: Props) {
    const { resultados, grafo } = data;
    const maxMs = Math.max(...resultados.map(r => r.tiempoMs), 0.01);

    return (
        <div className="algo-view">
            {/* Info banner */}
            <div className="algo-banner">
                <div className="algo-banner__item">
                    <span className="algo-banner__num">{grafo.vertices}</span>
                    <span className="algo-banner__lbl">vértices (bloques de clase)</span>
                </div>
                <div className="algo-banner__sep" />
                <div className="algo-banner__item">
                    <span className="algo-banner__num">{grafo.aristas}</span>
                    <span className="algo-banner__lbl">aristas (conflictos)</span>
                </div>
                <div className="algo-banner__sep" />
                <div className="algo-banner__item">
                    <span className="algo-banner__num">{grafo.salonesDisponibles}</span>
                    <span className="algo-banner__lbl">salones disponibles</span>
                </div>
            </div>

            <p className="algo-view__intro">
                Cada algoritmo intenta colorear el grafo de conflictos usando la menor cantidad
                de colores (salones). Un coloreo es <strong>válido</strong> si ningún par de
                bloques en conflicto (arista) comparte el mismo salón.
            </p>

            {/* Algorithm cards */}
            <div className="algo-cards">
                {resultados.map((r, i) => (
                    <AlgorithmCard
                        key={r.nombre}
                        result={r}
                        idx={i}
                        maxMs={maxMs}
                        available={grafo.salonesDisponibles}
                    />
                ))}
            </div>

            {/* Comparison chart */}
            <ComparisonChart resultados={resultados} available={grafo.salonesDisponibles} />
        </div>
    );
}
