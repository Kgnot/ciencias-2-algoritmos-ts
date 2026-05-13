import { useEffect, useState } from "react";
import type { StudentSummary } from "../models/student";

interface UseStudentsResult {
  data: StudentSummary[] | null;
  total: number | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useStudents(): UseStudentsResult {
  const [data, setData] = useState<StudentSummary[] | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:3002/api/student/schedules");
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const json = await res.json();
      setData(json.data.estudiantes);
      setTotal(json.data.total);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return { data, total, loading, error, refetch: fetchStudents };
}
