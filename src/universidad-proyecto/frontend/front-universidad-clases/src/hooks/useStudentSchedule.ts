import { useEffect, useState } from "react";
import type { StudentScheduleResponse } from "../models/student";

interface UseStudentScheduleResult {
  data: StudentScheduleResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useStudentSchedule(estudianteId: string | null): UseStudentScheduleResult {
  const [data, setData] = useState<StudentScheduleResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedule = async () => {
    if (!estudianteId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:3002/api/student/schedule/${estudianteId}`);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const json = await res.json();
      setData(json);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (estudianteId) fetchSchedule();
  }, [estudianteId]);

  return { data, loading, error, refetch: fetchSchedule };
}
