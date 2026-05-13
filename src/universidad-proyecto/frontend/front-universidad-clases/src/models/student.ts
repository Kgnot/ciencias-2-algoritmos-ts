export interface StudentSummary {
  estudianteId: string;
  totalBloques: number;
  costoTotal: number;
  cambiosDeSede: number;
  sedesUsadas: string[];
  materiasNoAsignadas: string[];
}

export interface StudentsListResponse {
  success: true;
  data: {
    total: number;
    estudiantes: StudentSummary[];
  };
}

export interface StudentScheduleBlock {
  materiaId: string;
  nombreMateria: string;
  grupo: string;
  dia: string;
  horaInicio: string;
  horaFin: string;
  salon: string;
  sede: string;
  piso: number;
  tipoSalon: string;
  bloque: number;
}

export interface StudentScheduleResponse {
  success: true;
  data: {
    estudianteId: string;
    bloques: StudentScheduleBlock[];
    metricas: {
      totalBloques: number;
      cambiosDeSede: number;
      costoTotal: number;
      sedesUsadas: string[];
      materiasNoAsignadas: string[];
    };
  };
}
