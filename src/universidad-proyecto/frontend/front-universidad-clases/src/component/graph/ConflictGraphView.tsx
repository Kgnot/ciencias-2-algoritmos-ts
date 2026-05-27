import { useEffect, useRef, useState, useMemo } from "react";
import cytoscape from "cytoscape";
import type { GraphNode, GraphEdge } from "../../hooks/useGraphData";

interface Props {
    nodes: GraphNode[];
    edges: GraphEdge[];
    semestres: number[];
}

// Deterministic HSL color from salon id — golden-angle spacing for visual distinction
function salonColor(salonId: string, salonList: string[]): string {
    const idx = salonList.indexOf(salonId);
    if (idx === -1) return "#c8c8c8";
    const hue = Math.round((idx * 137.508) % 360);
    return `hsl(${hue}, 55%, 62%)`;
}

interface NodeDetail {
    id: string;
    materia: string;
    grupo: string;
    bloque: number;
    salon: string;
    franja: string;
    profesor: string;
    semestre: number;
    carrera: string;
}

export default function ConflictGraphView({ nodes, edges, semestres }: Props) {
    const containerRef   = useRef<HTMLDivElement>(null);
    const cyRef          = useRef<cytoscape.Core | null>(null);
    const [showSolution, setShowSolution] = useState(true);
    const [semestre, setSemestre]         = useState<number>(semestres[0] ?? 1);
    const [layouting, setLayouting]       = useState(false);
    const [selected, setSelected]         = useState<NodeDetail | null>(null);
    const [neighborCount, setNeighborCount] = useState(0);

    // Filter nodes/edges for the selected semester
    const filteredNodes = useMemo(
        () => nodes.filter(n => n.semestre === semestre),
        [nodes, semestre]
    );

    const filteredNodeIds = useMemo(
        () => new Set(filteredNodes.map(n => n.id)),
        [filteredNodes]
    );

    const filteredEdges = useMemo(
        () => edges.filter(e => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target)),
        [edges, filteredNodeIds]
    );

    const salonList = useMemo(
        () => [...new Set(filteredNodes.map(n => n.salon))].sort(),
        [filteredNodes]
    );

    // Build or rebuild Cytoscape when the filtered subgraph changes
    useEffect(() => {
        if (!containerRef.current || filteredNodes.length === 0) return;

        if (cyRef.current) {
            cyRef.current.destroy();
            cyRef.current = null;
        }

        const elements: cytoscape.ElementDefinition[] = [
            ...filteredNodes.map(n => ({
                data: {
                    id:       n.id,
                    label:    n.label,
                    color:    showSolution ? salonColor(n.salon, salonList) : "#c0c0c0",
                    materia:  n.materia,
                    grupo:    n.grupo,
                    bloque:   n.bloque,
                    salon:    n.salon,
                    franja:   n.franja,
                    profesor: n.profesor,
                    semestre: n.semestre,
                    carrera:  n.carrera,
                }
            })),
            ...filteredEdges.map(e => ({
                data: { id: e.id, source: e.source, target: e.target, tipo: e.tipo }
            }))
        ];

        const cy = cytoscape({
            container: containerRef.current,
            elements,
            style: [
                {
                    selector: "node",
                    style: {
                        "background-color": "data(color)",
                        "label":            "data(label)",
                        "font-size":        "8px",
                        "text-valign":      "center",
                        "text-halign":      "center",
                        "color":            "#222",
                        "border-width":     1.5,
                        "border-color":     "rgba(0,0,0,0.15)",
                        "width":            36,
                        "height":           36,
                        "text-wrap":        "wrap",
                        "text-max-width":   "40px",
                    }
                },
                {
                    selector: "edge",
                    style: {
                        "width":        1,
                        "line-color":   showSolution ? "#d0d0d0" : "#f87171",
                        "opacity":      showSolution ? 0.5 : 0.7,
                        "curve-style":  "bezier",
                    }
                },
                {
                    selector: "node:selected, .hl-node",
                    style: {
                        "border-width":  3,
                        "border-color":  "#333",
                        "z-index":       9999,
                        "font-weight":   "bold",
                    }
                },
                {
                    selector: ".hl-edge",
                    style: {
                        "width":      2.5,
                        "line-color": "#f59e42",
                        "opacity":    1,
                    }
                },
                {
                    selector: ".dimmed",
                    style: { "opacity": 0.12 }
                }
            ],
            layout: {
                name:              "cose",
                idealEdgeLength:   100,
                nodeRepulsion:     6000,
                animate:           true,
                animationDuration: 600,
                fit:               true,
                padding:           20,
            } as cytoscape.CoseLayoutOptions
        });

        setLayouting(true);
        cy.one("layoutstop", () => setLayouting(false));

        cy.on("tap", "node", e => {
            const data = e.target.data() as NodeDetail;
            const neighbours = e.target.closedNeighborhood();
            const nc = e.target.neighborhood("node").length;

            cy.elements().removeClass("hl-node hl-edge dimmed");
            cy.elements().not(neighbours).addClass("dimmed");
            e.target.addClass("hl-node");
            e.target.connectedEdges().addClass("hl-edge");

            setSelected(data);
            setNeighborCount(nc);
        });

        cy.on("tap", e => {
            if (e.target === cy) {
                cy.elements().removeClass("hl-node hl-edge dimmed");
                setSelected(null);
                setNeighborCount(0);
            }
        });

        cyRef.current = cy;

        return () => {
            cy.destroy();
            cyRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filteredNodes, filteredEdges]);

    // Update colors without re-running the layout
    useEffect(() => {
        const cy = cyRef.current;
        if (!cy) return;
        cy.nodes().forEach(node => {
            const id  = node.id();
            const n   = filteredNodes.find(x => x.id === id);
            if (n) node.style("background-color", showSolution ? salonColor(n.salon, salonList) : "#c0c0c0");
        });
        cy.edges().forEach(edge => {
            edge.style("line-color", showSolution ? "#d0d0d0" : "#f87171");
            edge.style("opacity",    showSolution ? 0.5 : 0.7);
        });
    }, [showSolution, filteredNodes, salonList]);

    return (
        <div className="cg-view">
            {/* Controls */}
            <div className="cg-controls">
                <div className="cg-controls__left">
                    <label className="cg-label">Semestre:</label>
                    <select
                        className="cg-select"
                        value={semestre}
                        onChange={e => setSemestre(Number(e.target.value))}
                    >
                        {semestres.map(s => (
                            <option key={s} value={s}>Semestre {s}</option>
                        ))}
                    </select>
                    <span className="cg-counter">
                        {filteredNodes.length} nodos · {filteredEdges.length} aristas
                    </span>
                </div>
                <div className="cg-controls__right">
                    <button
                        className={`cg-toggle ${!showSolution ? "cg-toggle--active" : ""}`}
                        onClick={() => setShowSolution(false)}
                    >
                        🔴 Ver problema
                    </button>
                    <button
                        className={`cg-toggle ${showSolution ? "cg-toggle--active" : ""}`}
                        onClick={() => setShowSolution(true)}
                    >
                        🎨 Ver solución
                    </button>
                </div>
            </div>

            {/* Description banner */}
            <div className={`cg-banner ${showSolution ? "cg-banner--after" : "cg-banner--before"}`}>
                {showSolution ? (
                    <>
                        <strong>Vista: Solución (después del coloreo)</strong>
                        — Cada color = un salón distinto. Nodos adyacentes (en conflicto)
                        siempre tienen colores diferentes. Las aristas son grises.
                    </>
                ) : (
                    <>
                        <strong>Vista: Problema (antes del coloreo)</strong>
                        — Todos los nodos son iguales y las aristas rojas muestran los conflictos.
                        El reto es asignar un salón a cada nodo sin repetir colores en aristas.
                    </>
                )}
            </div>

            <div className="cg-body">
                {/* Cytoscape canvas */}
                <div className="cg-canvas-wrapper">
                    {layouting && (
                        <div className="cg-overlay">Calculando posiciones…</div>
                    )}
                    <div ref={containerRef} className="cg-canvas" />
                </div>

                {/* Side panel: selected node details + legend */}
                <div className="cg-side">
                    {selected ? (
                        <div className="cg-detail">
                            <h4 className="cg-detail__title">Bloque seleccionado</h4>
                            <dl className="cg-detail__list">
                                <dt>Materia</dt>       <dd>{selected.materia}</dd>
                                <dt>Grupo</dt>         <dd>G{selected.grupo}</dd>
                                <dt>Bloque</dt>        <dd>{selected.bloque}</dd>
                                <dt>Salón</dt>         <dd>{selected.salon}</dd>
                                <dt>Franja</dt>        <dd>{selected.franja}</dd>
                                <dt>Profesor</dt>      <dd>{selected.profesor}</dd>
                                <dt>Semestre</dt>      <dd>{selected.semestre}</dd>
                                <dt>Carrera</dt>       <dd>{selected.carrera}</dd>
                                <dt>Conflictos</dt>
                                <dd>
                                    <strong>{neighborCount}</strong>
                                    {" "}bloque{neighborCount !== 1 ? "s" : ""} en conflicto
                                    (resaltados en naranja)
                                </dd>
                            </dl>
                        </div>
                    ) : (
                        <p className="cg-hint">Haz clic en un nodo para ver sus detalles y conflictos.</p>
                    )}

                    {showSolution && (
                        <div className="cg-legend">
                            <h4 className="cg-legend__title">Salones asignados</h4>
                            <div className="cg-legend__items">
                                {salonList.map(salon => (
                                    <div key={salon} className="cg-legend__item">
                                        <span
                                            className="cg-legend__dot"
                                            style={{ background: salonColor(salon, salonList) }}
                                        />
                                        <span className="cg-legend__lbl">{salon}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
