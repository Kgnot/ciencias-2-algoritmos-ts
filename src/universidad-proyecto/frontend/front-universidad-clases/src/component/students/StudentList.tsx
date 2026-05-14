import { useStudents } from "../../hooks/useStudents";
import type { StudentSummary } from "../../models/student";

interface Props {
    onSelect: (id: string) => void;
    selectedId?: string | null;
}

function initials(id: string): string {
    const parts = id.replace(/[^a-zA-Z0-9]/g, " ").trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return id.slice(0, 2).toUpperCase();
}

export default function StudentList({ onSelect, selectedId }: Props) {
    const { data, loading, error, refetch } = useStudents();

    if (loading) {
        return (
            <div className="student-list">
                <div className="student-list__header">
                    <span className="student-list__label">Estudiantes</span>
                </div>
                <div className="state-loading">Cargando…</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="student-list">
                <div className="student-list__header">
                    <span className="student-list__label">Estudiantes</span>
                </div>
                <div className="state-error">
                    {error}
                    <button onClick={refetch}>Reintentar</button>
                </div>
            </div>
        );
    }

    return (
        <div className="student-list">
            <div className="student-list__header">
                <span className="student-list__label">Estudiantes</span>
                {data && (
                    <span className="student-list__count">{data.length}</span>
                )}
            </div>

            <ul className="student-list__items">
                {data?.map((s: StudentSummary) => {
                    const isActive = s.estudianteId === selectedId;
                    return (
                        <li key={s.estudianteId} className="student-list__item">
                            <button
                                className={`student-list__btn${isActive ? " student-list__btn--active" : ""}`}
                                onClick={() => onSelect(s.estudianteId)}
                            >
                                <div className="student-list__avatar">
                                    {initials(s.estudianteId)}
                                </div>
                                <div className="student-list__info">
                                    <span className="student-list__id">{s.estudianteId}</span>
                                    <div className="student-list__meta">
                                        <span className="student-list__pill">{s.totalBloques} bloques</span>
                                        <span className="student-list__pill">costo {s.costoTotal}</span>
                                    </div>
                                </div>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}