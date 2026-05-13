import { useState, useEffect } from "react";

export interface ClassItem {
    materia: string;
    grupo: string;
    dia: string;
    horaInicio: string;
    horaFin: string;
    salon: string;
    tipo: "normal" | "laboratorio";
    profesor: string;
}

export interface DaySchedule {
    [timeSlot: string]: ClassItem[];
}

export interface Schedule {
    [day: string]: DaySchedule;
}

export interface ScheduleData {
    horario: Schedule;
    grafo?: { vertices: number; aristas: number };
    validaciones?: { esValido: boolean; violaciones: string[] };
}

interface ScheduleApiResponse {
    success?: boolean;
    data?: ScheduleData;
}

interface UseScheduleResult {
    data: ScheduleData | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useSchedule(): UseScheduleResult {
    const [data, setData] = useState<ScheduleData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSchedule = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("http://localhost:3002/api/schedule");
            if (!res.ok) {
                setData(null);
                setError(`Error ${res.status}: ${res.statusText}`);
                return;
            }
            const json = (await res.json()) as ScheduleApiResponse | ScheduleData;
            const nextData =
                json && typeof json === "object" && "data" in json && json.data
                    ? json.data
                    : (json as ScheduleData);
            setData(nextData ?? null);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Error desconocido");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedule();
    }, []);

    return { data, loading, error, refetch: fetchSchedule };
}