import type { FranjasInput, TipoFranja } from "./input-base";

export type DiaSemana = "Lunes" | "Martes" | "Miércoles" | "Jueves" | "Viernes" | "Sábado";

export interface FranjaHoraria {
    id: string;
    tipo: TipoFranja;
    dia: DiaSemana;
    numero: number;
    inicio: string; // "08:00"
    fin: string;    // "10:00"
}

// Generar franjas para toda la semana (Lunes a Sábado)
export function generarFranjas(input: FranjasInput): FranjaHoraria[] {
    const franjas: FranjaHoraria[] = [];
    const dias: DiaSemana[] = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

    // Tipo A: empieza 6am, bloques de 2h
    const franjasTipoA: { inicio: string; fin: string; numero: number }[] = [];
    for (let i = 1; i <= input.tipoA; i++) {
        const inicioHora = 6 + (i - 1) * 2;
        franjasTipoA.push({
            numero: i,
            inicio: `${String(inicioHora).padStart(2, "0")}:00`,
            fin: `${String(inicioHora + 2).padStart(2, "0")}:00`,
        });
    }

    // Tipo B: empieza 7am, bloques de 2h
    const franjasTipoB: { inicio: string; fin: string; numero: number }[] = [];
    for (let i = 1; i <= input.tipoB; i++) {
        const inicioHora = 7 + (i - 1) * 2;
        franjasTipoB.push({
            numero: i,
            inicio: `${String(inicioHora).padStart(2, "0")}:00`,
            fin: `${String(inicioHora + 2).padStart(2, "0")}:00`,
        });
    }

    // Generar combinaciones con días
    for (const dia of dias) {
        for (const franja of franjasTipoA) {
            franjas.push({
                id: `${dia.substring(0, 3)}-A${franja.numero}`,
                tipo: "A",
                dia,
                numero: franja.numero,
                inicio: franja.inicio,
                fin: franja.fin,
            });
        }

        for (const franja of franjasTipoB) {
            franjas.push({
                id: `${dia.substring(0, 3)}-B${franja.numero}`,
                tipo: "B",
                dia,
                numero: franja.numero,
                inicio: franja.inicio,
                fin: franja.fin,
            });
        }
    }

    return franjas;
}

// Detectar si dos franjas se solapan (mismo día y horario)
export function seSolapan(a: FranjaHoraria, b: FranjaHoraria): boolean {
    if (a.dia !== b.dia) return false;

    const toMin = (h: string) => {
        const [hh, mm] = h.split(":").map(Number);
        return (hh || 0) * 60 + (mm || 0);
    };

    const aIni = toMin(a.inicio);
    const aFin = toMin(a.fin);
    const bIni = toMin(b.inicio);
    const bFin = toMin(b.fin);

    return aIni < bFin && bIni < aFin;
}

// Obtener string legible de la franja
export function franjaToString(franja: FranjaHoraria): string {
    return `${franja.dia} ${franja.inicio}-${franja.fin} (${franja.tipo}${franja.numero})`;
}