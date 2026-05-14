import {useState} from "react";
import {useSchedule} from "./hooks/useSchedule";
import DayTabs from "./component/day-tabs/DayTabs.tsx";
import TimeSlot from "./component/time-slot/TimeSlot.tsx";
import StudentsPage from "./StudentsPage";

const IconUsers = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
);

const IconCalendar = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
);

const IconRefresh = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="23 4 23 10 17 10"/>
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
    </svg>
);

export default function ScheduleApp() {
    const {data, loading, error, refetch} = useSchedule();
    const [activeDay, setActiveDay] = useState<string>("");
    const [view, setView] = useState<"schedule" | "students">("schedule");

    const days = data ? Object.keys(data.horario) : [];

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
                <span className="schedule-app__status schedule-app__status--error">{error}</span>
                <button className="schedule-app__retry" onClick={refetch}>Reintentar</button>
            </div>
        );
    }

    return (
        <div className="schedule-app">
            <header className="schedule-app__header">
                <div className="schedule-app__header-left">
                    <h1 className="schedule-app__title">
                        {view === "schedule" ? "Horario" : "Estudiantes"}
                    </h1>
                    {view === "schedule" && data && (
                        <span className="schedule-app__meta">
                            {data.grafo
                                ? `${data.grafo.vertices} materias · ${data.grafo.aristas} relaciones`
                                : `${Object.keys(data.horario).length} días`}
                        </span>
                    )}
                </div>

                <div className="schedule-app__header-actions">
                    <button
                        className={`topbar-toggle${view === "students" ? " topbar-toggle--active" : ""}`}
                        onClick={() => setView(view === "schedule" ? "students" : "schedule")}
                    >
                        {view === "schedule" ? <IconUsers /> : <IconCalendar />}
                        {view === "schedule" ? "Estudiantes" : "Horario"}
                    </button>

                    {view === "schedule" && (
                        <button className="topbar-icon-btn" onClick={refetch} aria-label="Actualizar">
                            <IconRefresh />
                        </button>
                    )}
                </div>
            </header>

            {view === "students" ? (
                <StudentsPage />
            ) : (
                <>
                    <DayTabs days={days} activeDay={resolvedDay} onSelect={setActiveDay} />
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