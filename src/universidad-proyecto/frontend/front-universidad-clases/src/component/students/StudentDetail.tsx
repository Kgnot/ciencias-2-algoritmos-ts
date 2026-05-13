import {useMemo, useState} from "react";
import { useStudentSchedule } from "../../hooks/useStudentSchedule";
import DayTabs from "../day-tabs/DayTabs";
import TimeSlot from "../time-slot/TimeSlot";
import type { ClassItem } from "../../hooks/useSchedule";

interface Props {
  estudianteId: string | null;
}

export default function StudentDetail({ estudianteId }: Props) {
  const { data, loading, error, refetch } = useStudentSchedule(estudianteId);
  const [activeDay, setActiveDay] = useState<string>("");

  const horario = useMemo(() => {
    if (!data) return {} as Record<string, Record<string, ClassItem[]>>;
    const map: Record<string, Record<string, ClassItem[]>> = {};
    data.data.bloques.forEach((b) => {
      const day = b.dia;
      const timeKey = `${b.horaInicio} - ${b.horaFin}`;
      const item: ClassItem = {
        materia: b.nombreMateria,
        grupo: b.grupo,
        dia: b.dia,
        horaInicio: b.horaInicio,
        horaFin: b.horaFin,
        salon: b.salon,
        tipo: b.tipoSalon === "laboratorio" ? "laboratorio" : "normal",
        profesor: "",
      };
      if (!map[day]) map[day] = {};
      if (!map[day][timeKey]) map[day][timeKey] = [];
      map[day][timeKey].push(item);
    });
    return map;
  }, [data]);

  const days = Object.keys(horario);

  const resolvedDay = activeDay || days[0] || "";

  if (!estudianteId) return <div>Selecciona un estudiante</div>;
  if (loading) return <div>Cargando horario del estudiante…</div>;
  if (error) return (
    <div>
      Error: {error}
      <button onClick={refetch}>Reintentar</button>
    </div>
  );

  return (
    <div className="student-detail">
      <header>
        <h2>Estudiante: {data?.data.estudianteId ?? estudianteId}</h2>
        {data && (
          <div className="student-metrics">
            Bloques: {data.data.metricas.totalBloques} · Cambios sede: {data.data.metricas.cambiosDeSede} · Costo: {data.data.metricas.costoTotal}
          </div>
        )}
      </header>

      <DayTabs days={days} activeDay={resolvedDay} onSelect={setActiveDay} />

      <div className="student-detail__body">
        {(!data || days.length === 0) ? (
          <p>Sin clases.</p>
        ) : (
          Object.keys(horario[resolvedDay] ?? {}).sort().map((slot) => (
            <TimeSlot key={slot} timeRange={slot} classes={horario[resolvedDay][slot]} />
          ))
        )}
      </div>
    </div>
  );
}

