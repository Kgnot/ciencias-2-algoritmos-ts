import {useState} from "react";
import {useSchedule} from "./hooks/useSchedule";
import DayTabs from "./component/day-tabs/DayTabs.tsx";
import TimeSlot from "./component/time-slot/TimeSlot.tsx";
import StudentsPage from "./StudentsPage";

export default function ScheduleApp() {
    const {data, loading, error, refetch} = useSchedule();
    const [activeDay, setActiveDay] = useState<string>("");
    const [view, setView] = useState<'schedule'|'students'>('schedule');

    const days = data ? Object.keys(data.horario) : [];

    /* Selecciona el primer día con clases si no hay uno activo */
    const resolvedDay =
        activeDay ||
        days.find((d) => Object.keys(data?.horario[d] ?? {}).length > 0) ||
        "";

    const daySchedule = data?.horario[resolvedDay] ?? {};
    const timeSlots = Object.keys(daySchedule).sort();

    if (loading) {
        return (
            <div className="schedule-app schedule-app--state">
                <span className="schedule-app__status">Cargando horario…</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="schedule-app schedule-app--state">
        <span className="schedule-app__status schedule-app__status--error">
          {error}
        </span>
                <button className="schedule-app__retry" onClick={refetch}>
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="schedule-app">
            {/* Header */}
            <header className="schedule-app__header">
                <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                    <h1 className="schedule-app__title">{view === 'schedule' ? 'Horario' : 'Estudiantes'}</h1>
                    {view === 'schedule' && data && (
                        <span className="schedule-app__meta">
              {data.grafo
                  ? `${data.grafo.vertices} materias · ${data.grafo.aristas} relaciones`
                  : `${Object.keys(data.horario).length} días cargados`}
            </span>
                    )}
                </div>

                <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
                    <button onClick={() => setView(view === 'schedule' ? 'students' : 'schedule')}>
                        {view === 'schedule' ? 'Ver estudiantes' : 'Volver al horario'}
                    </button>
                    {view === 'schedule' && (
                        <button className="schedule-app__refresh" onClick={refetch}>
                            ↺ Actualizar
                        </button>
                    )}
                </div>
            </header>

            {view === 'students' ? (
                <StudentsPage />
            ) : (
                <>
                    <DayTabs
                        days={days}
                        activeDay={resolvedDay}
                        onSelect={setActiveDay}
                    />

                    {/* Content */}
                    <div className="schedule-app__body">
                        {timeSlots.length === 0 ? (
                            <p className="schedule-app__empty">Sin clases este día.</p>
                        ) : (
                            timeSlots.map((slot) => (
                                <TimeSlot
                                    key={slot}
                                    timeRange={slot}
                                    classes={daySchedule[slot]}
                                />
                            ))
                        )}
                    </div>
                </>
            )}
        </div>
    );
}