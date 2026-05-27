import type { GraphStats, GraphNode } from "../../hooks/useGraphData";

interface Props {
    stats: GraphStats;
    nodes: GraphNode[];
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
    return (
        <div className="stat-card">
            <span className="stat-card__value">{value}</span>
            <span className="stat-card__label">{label}</span>
            {sub && <span className="stat-card__sub">{sub}</span>}
        </div>
    );
}

function UtilizationBar({ used, total, label }: { used: number; total: number; label: string }) {
    const pct = total > 0 ? Math.round((used / total) * 100) : 0;
    const color = pct < 50 ? "#10b981" : pct < 80 ? "#f59e42" : "#ef4444";
    return (
        <div className="util-bar">
            <div className="util-bar__header">
                <span className="util-bar__label">{label}</span>
                <span className="util-bar__pct" style={{ color }}>{pct}%</span>
            </div>
            <div className="util-bar__track">
                <div className="util-bar__fill" style={{ width: `${pct}%`, background: color }} />
            </div>
            <span className="util-bar__detail">{used} de {total} utilizados</span>
        </div>
    );
}

function ComponentHistogram({ sizes }: { sizes: number[] }) {
    if (sizes.length === 0) return null;
    const max = Math.max(...sizes, 1);
    // Group into buckets: 1-5, 6-20, 21-50, 51-100, 100+
    const buckets = [
        { label: "1–5", count: sizes.filter(s => s >= 1 && s <= 5).length },
        { label: "6–20", count: sizes.filter(s => s >= 6 && s <= 20).length },
        { label: "21–50", count: sizes.filter(s => s >= 21 && s <= 50).length },
        { label: "51+", count: sizes.filter(s => s >= 51).length },
    ].filter(b => b.count > 0);
    const maxCount = Math.max(...buckets.map(b => b.count), 1);
    const barH = 60;

    return (
        <div className="comp-hist">
            <h4 className="comp-hist__title">Distribución de componentes conexas</h4>
            <p className="comp-hist__desc">
                El grafo se divide en <strong>{sizes.length}</strong> componentes conexas. Los bloques
                en componentes distintas no tienen conflictos entre sí y pueden reutilizar salones.
            </p>
            <div className="comp-hist__chart">
                {buckets.map(b => (
                    <div key={b.label} className="comp-hist__col">
                        <span className="comp-hist__count">{b.count}</span>
                        <div
                            className="comp-hist__bar"
                            style={{ height: `${Math.max(4, (b.count / maxCount) * barH)}px` }}
                        />
                        <span className="comp-hist__lbl">{b.label}</span>
                    </div>
                ))}
            </div>
            <p className="comp-hist__hint">Tamaño de componente (nodos)</p>
        </div>
    );
}

function EdgeTypeBreakdown({ nodes }: { nodes: GraphNode[] }) {
    const bySemestre = new Map<number, number>();
    for (const n of nodes) {
        bySemestre.set(n.semestre, (bySemestre.get(n.semestre) ?? 0) + 1);
    }
    const entries = [...bySemestre.entries()].sort((a, b) => a[0] - b[0]);
    const maxCount = Math.max(...entries.map(([, c]) => c), 1);

    return (
        <div className="sem-breakdown">
            <h4 className="sem-breakdown__title">Bloques por semestre</h4>
            <div className="sem-breakdown__rows">
                {entries.map(([sem, count]) => (
                    <div key={sem} className="sem-row">
                        <span className="sem-row__label">Semestre {sem}</span>
                        <div className="sem-row__track">
                            <div
                                className="sem-row__fill"
                                style={{ width: `${(count / maxCount) * 100}%` }}
                            />
                        </div>
                        <span className="sem-row__count">{count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function GraphStatsView({ stats, nodes }: Props) {
    const utilPct = stats.salonesDisponibles > 0
        ? Math.round((stats.coloresUsados / stats.salonesDisponibles) * 100)
        : 0;
    const density = stats.densidad;

    return (
        <div className="stats-view">

            <section className="stats-section">
                <h3 className="stats-section__title">Tamaño del grafo de conflictos</h3>
                <p className="stats-section__desc">
                    Cada <strong>vértice</strong> es un bloque de clase (2 horas).
                    Cada <strong>arista</strong> representa que dos bloques no pueden compartir salón.
                </p>
                <div className="stat-cards">
                    <StatCard label="Vértices (bloques)" value={stats.totalVertices}
                        sub="1 materia de N créditos = N bloques" />
                    <StatCard label="Aristas (conflictos)" value={stats.totalEdges}
                        sub="conflicto de franja / grupo / profesor" />
                    <StatCard label="Densidad del grafo" value={`${density}%`}
                        sub="aristas / máximo posible" />
                    <StatCard label="Semestres" value={stats.semestres.length} />
                    <StatCard label="Carreras" value={stats.carreras.join(", ")} />
                    <StatCard label="Componentes conexas" value={stats.componentCount}
                        sub="subgrafos sin conflictos entre sí" />
                </div>
            </section>

            <section className="stats-section">
                <h3 className="stats-section__title">Resultado de la coloración</h3>
                <p className="stats-section__desc">
                    La <strong>coloración de grafos</strong> asigna un salón a cada bloque tal que
                    ningún par de bloques en conflicto comparta salón. El número de colores usados
                    es el <em>número cromático</em> de este grafo.
                </p>
                <div className="stat-cards">
                    <StatCard label="Salones usados (colores)" value={stats.coloresUsados}
                        sub="número cromático aproximado" />
                    <StatCard label="Salones disponibles" value={stats.salonesDisponibles} />
                    <StatCard label="Utilización" value={`${utilPct}%`}
                        sub="salones activos vs disponibles" />
                </div>
                <div className="stats-bars">
                    <UtilizationBar
                        used={stats.coloresUsados}
                        total={stats.salonesDisponibles}
                        label="Utilización de salones"
                    />
                </div>
            </section>

            <section className="stats-section">
                <ComponentHistogram sizes={stats.componentSizes} />
            </section>

            <section className="stats-section">
                <EdgeTypeBreakdown nodes={nodes} />
            </section>

            <section className="stats-section stats-section--note">
                <h4>¿Por qué coloreo de grafos?</h4>
                <p>
                    Asignar salones es un problema NP-completo en el caso general. Los algoritmos
                    heurísticos (D-Satur, Welsh-Powell, Voraz) producen soluciones válidas en tiempo
                    polinomial sin garantía de optimalidad global. La descomposición en componentes
                    conexas (BFS, O(V+E)) permite que cada parte del grafo reutilice salones de forma
                    independiente, reduciendo el número total de salones requeridos.
                </p>
            </section>

        </div>
    );
}
