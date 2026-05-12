import './ClassCard.css'
import type {ClassItem} from "../../hooks/useSchedule.ts";

interface Props {
    item: ClassItem;
}

export default function ClassCard({ item }: Props) {
    return (
        <div className={`class-card class-card--${item.tipo}`}>
            <div className="class-card__header">
                <span className="class-card__materia">{item.materia}</span>
                <span className={`class-card__badge class-card__badge--${item.tipo}`}>
          {item.tipo === "laboratorio" ? "LAB" : "TEO"}
        </span>
            </div>
            <div className="class-card__meta">
                <span className="class-card__profesor">{item.profesor}</span>
                <span className="class-card__salon">{item.salon}</span>
            </div>
            <div className="class-card__footer">
                <span className="class-card__grupo">Grupo {item.grupo}</span>
                <span className="class-card__hora">
          {item.horaInicio} – {item.horaFin}
        </span>
            </div>
        </div>
    );
}