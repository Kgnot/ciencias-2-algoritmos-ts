export class WEEKDAY {
    private constructor(
        public readonly code: string,
        public readonly label: string
    ) {}

    static readonly LUN = new WEEKDAY("Lun", "Lunes");
    static readonly MAR = new WEEKDAY("Mar", "Martes");
    static readonly MIE = new WEEKDAY("Mié", "Miércoles");
    static readonly JUE = new WEEKDAY("Jue", "Jueves");
    static readonly VIE = new WEEKDAY("Vie", "Viernes");
    static readonly SAB = new WEEKDAY("Sáb", "Sábado");

    static readonly ALL: ReadonlyArray<WEEKDAY> = [
        WEEKDAY.LUN, WEEKDAY.MAR, WEEKDAY.MIE,
        WEEKDAY.JUE, WEEKDAY.VIE, WEEKDAY.SAB,
    ];
}