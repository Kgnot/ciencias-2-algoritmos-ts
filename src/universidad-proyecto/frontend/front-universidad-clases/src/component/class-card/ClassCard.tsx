import './ClassCard.css'
import type {ClassItem} from "../../hooks/useSchedule.ts";
import {extractCareerCode, getCareerColors} from "../../utils/careerColors";

interface Props {
    item: ClassItem;
}

export default function ClassCard({item}: Props) {
    const careerCode = extractCareerCode(item.vertexId);
    const colors = getCareerColors(item.vertexId);

    const salonInfo = item.salonDetalle;
    const isLaboratorio = item.tipo === "laboratorio";

    const careerClass = item.vertexId.startsWith("SIS") ? "class-card--sis"
        : item.vertexId.startsWith("ELE") ? "class-card--ele"
            : item.vertexId.startsWith("IND") ? "class-card--ind"
                : "";


    return (
        <div className={`class-card ${careerClass} ${isLaboratorio ? "class-card--laboratorio" : ""}`}>
            {/* Career Badge */}
            {careerCode && (
                <span
                    className="class-card__career"
                    style={{backgroundColor: colors.border, color: 'white'}}
                >
                    {careerCode}
                </span>
            )}

            {/* Header */}
            <div className="class-card__header">
                <span className="class-card__materia" style={{color: colors.text}}>
                    {item.materia}
                </span>
                <span className={`class-card__badge class-card__badge--${isLaboratorio ? 'laboratorio' : 'normal'}`}>
                    {isLaboratorio ? "LAB" : "TEO"}
                </span>
            </div>

            {/* Meta Information */}
            {item.profesor && (
                <div className="class-card__meta">
                    <span className="class-card__profesor">👨‍🏫 {item.profesor}</span>
                </div>
            )}

            {/* Room & Location */}
            <div className="class-card__location">
                <span className="class-card__salon">
                    📍 {item.salon}
                    {salonInfo && (
                        <span className="class-card__salon-detail">
                            {" "} • Piso {salonInfo.piso} • Sede {salonInfo.sede}
                        </span>
                    )}
                </span>
                {salonInfo && (
                    <span className="class-card__capacity">
                        👥 Cap. {salonInfo.capacidad}
                    </span>
                )}
            </div>

            {/* Footer */}
            <div className="class-card__footer">
                <span className="class-card__grupo">G{item.grupo}</span>
                <span className="class-card__hora">
                    ⏱ {item.horaInicio} – {item.horaFin}
                </span>
            </div>
        </div>
    );
}