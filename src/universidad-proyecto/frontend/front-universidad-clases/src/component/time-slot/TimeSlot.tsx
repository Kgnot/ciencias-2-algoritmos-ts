import './TimeSlot.css'
import type {ClassItem} from "../../hooks/useSchedule.ts";
import ClassCard from "../class-card/ClassCard.tsx";

interface Props {
    timeRange: string;
    classes: ClassItem[];
}

export default function TimeSlot({ timeRange, classes }: Props) {
    return (
        <div className="timeslot">
            <div className="timeslot__label">
                <span className="timeslot__time">{timeRange}</span>
                <span className="timeslot__count">{classes.length}</span>
            </div>
            <div className="timeslot__cards">
                {classes.map((item, idx) => (
                    /* ClassCard va aquí */
                    <ClassCard key={idx} item={item} />
                ))}
            </div>
        </div>
    );
}