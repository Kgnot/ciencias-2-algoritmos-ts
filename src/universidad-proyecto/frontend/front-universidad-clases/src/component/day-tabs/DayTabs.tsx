import './DayTabs.css'

interface Props {
    days: string[];
    activeDay: string;
    onSelect: (day: string) => void;
}

export default function DayTabs({ days, activeDay, onSelect }: Props) {
    return (
        <div className="day-tabs">
            {days.map((day) => (
                <button
                    key={day}
                    className={`day-tabs__tab ${activeDay === day ? "day-tabs__tab--active" : ""}`}
                    onClick={() => onSelect(day)}
                >
                    {day}
                </button>
            ))}
        </div>
    );
}