// React import not required with new JSX transform
import { useStudents } from "../../hooks/useStudents";
import type { StudentSummary } from "../../models/student";

interface Props {
  onSelect: (id: string) => void;
  selectedId?: string | null;
}

export default function StudentList({ onSelect, selectedId }: Props) {
  const { data, loading, error, refetch } = useStudents();

  if (loading) return <div> Cargando estudiantes… </div>;
  if (error) return (
    <div>
      Error: {error}
      <button onClick={refetch}>Reintentar</button>
    </div>
  );

  return (
    <div className="student-list">
      <header className="student-list__header">
        <h2>Estudiantes</h2>
      </header>
      <ul>
        {data?.map((s: StudentSummary) => (
          <li key={s.estudianteId}>
            <button
              className={s.estudianteId === selectedId ? "selected" : ""}
              onClick={() => onSelect(s.estudianteId)}
            >
              {s.estudianteId} — Bloques: {s.totalBloques} · Costo: {s.costoTotal}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

