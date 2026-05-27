import { useState } from "react";
import { useGraphData } from "./hooks/useGraphData";
import { useAlgorithmComparison } from "./hooks/useAlgorithmComparison";
import ConflictGraphView from "./component/graph/ConflictGraphView";
import GraphStatsView from "./component/graph/GraphStatsView";
import AlgorithmComparisonView from "./component/graph/AlgorithmComparisonView";

type Tab = "graph" | "stats" | "algorithms";

export default function GraphAnalysisPage() {
    const [tab, setTab] = useState<Tab>("graph");
    const { data: graphData, loading: gLoading, error: gError } = useGraphData();
    const { data: algoData, loading: aLoading, error: aError } = useAlgorithmComparison();

    const tabs: { id: Tab; label: string; desc: string }[] = [
        { id: "graph",      label: "Grafo de Conflictos",      desc: "Visualizar el grafo de asignación de salones" },
        { id: "stats",      label: "Estadísticas",             desc: "Métricas detalladas del grafo y la solución" },
        { id: "algorithms", label: "Comparación de Algoritmos", desc: "Comparar Voraz, Welsh-Powell y D-Satur" },
    ];

    const loading = tab === "algorithms" ? aLoading : gLoading;
    const error   = tab === "algorithms" ? aError   : gError;

    return (
        <div className="graph-page">
            <div className="graph-page__tabs">
                {tabs.map(t => (
                    <button
                        key={t.id}
                        className={`graph-tab ${tab === t.id ? "graph-tab--active" : ""}`}
                        onClick={() => setTab(t.id)}
                        title={t.desc}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <div className="graph-page__content">
                {loading && (
                    <div className="graph-page__state">
                        <span>Calculando grafo de conflictos…</span>
                        <span className="graph-page__state-sub">
                            Esto puede tomar unos segundos la primera vez.
                        </span>
                    </div>
                )}

                {!loading && error && (
                    <div className="graph-page__state graph-page__state--error">
                        <span>Error al cargar los datos</span>
                        <code className="graph-page__error-detail">{error}</code>
                        <span className="graph-page__state-sub">
                            Asegúrate de que el servidor esté corriendo en el puerto 3002.
                        </span>
                    </div>
                )}

                {!loading && !error && tab === "graph" && graphData && (
                    <ConflictGraphView
                        nodes={graphData.nodes}
                        edges={graphData.edges}
                        semestres={graphData.stats.semestres}
                    />
                )}

                {!loading && !error && tab === "stats" && graphData && (
                    <GraphStatsView
                        stats={graphData.stats}
                        nodes={graphData.nodes}
                    />
                )}

                {!loading && !error && tab === "algorithms" && algoData && (
                    <AlgorithmComparisonView data={algoData} />
                )}
            </div>
        </div>
    );
}
