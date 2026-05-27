import { useState, useEffect } from "react";

export interface AlgorithmResult {
    nombre: string;
    descripcion: string;
    colores: number;
    valido: boolean;
    tiempoMs: number;
}

export interface ComparisonData {
    resultados: AlgorithmResult[];
    grafo: { vertices: number; aristas: number; salonesDisponibles: number };
}

interface ApiResponse {
    success: boolean;
    data?: ComparisonData;
}

export function useAlgorithmComparison() {
    const [data, setData] = useState<ComparisonData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch("http://localhost:3002/api/schedule/algorithm-comparison");
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
        fetchData();
    }, []);

    return { data, loading, error };
}
