import { useState, useEffect } from "react";

export interface GraphNode {
    id: string;
    label: string;
    materia: string;
    grupo: string;
    bloque: number;
    semestre: number;
    carrera: string;
    salon: string;
    tipoSalon: string;
    franja: string;
    profesor: string;
}

export interface GraphEdge {
    id: string;
    source: string;
    target: string;
    tipo: "franja" | "grupo-dia" | "profesor";
}

export interface GraphStats {
    totalVertices: number;
    totalEdges: number;
    coloresUsados: number;
    salonesDisponibles: number;
    semestres: number[];
    carreras: string[];
    componentCount: number;
    componentSizes: number[];
    densidad: number;
}

export interface GraphData {
    nodes: GraphNode[];
    edges: GraphEdge[];
    stats: GraphStats;
}

interface ApiResponse {
    success: boolean;
    data?: GraphData;
}

export function useGraphData() {
    const [data, setData] = useState<GraphData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch_ = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("http://localhost:3002/api/schedule/graph-data");
            if (!res.ok) {
                setError(`Error ${res.status}: ${res.statusText}`);
                return;
            }
            const json = (await res.json()) as ApiResponse;
            setData(json.data ?? null);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Error desconocido");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetch_(); }, []);

    return { data, loading, error };
}
