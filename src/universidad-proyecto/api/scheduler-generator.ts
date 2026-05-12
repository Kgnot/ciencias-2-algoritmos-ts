/**
 * Módulo para generar horarios de forma independiente sin servidor
 * Útil para testing o uso en CLI
 */

import { SchedulerDataLoader } from "../data/scheduler-data-loader.js";
import { ConflictGraphBuilder } from "../logic/conflict-graph.logic.js";
import { ScheduleBuilder } from "../logic/scheduler-builder.js";
import type { HorarioSemanal } from "../logic/scheduler-builder.js";

export interface GrafoStats {
  vertices: number;
  aristas: number;
}

export interface ValidacionesReporte {
  esValido: boolean;
  violaciones: string[];
  totalViolaciones: number;
}

export interface HorarioReporte {
  grafo: GrafoStats;
  horario: HorarioSemanal;
  validaciones: ValidacionesReporte;
}

export async function generarHorario(): Promise<HorarioReporte> {
  const loader = SchedulerDataLoader.build();
  const scheduleInput = loader.getData();

  const { graph } = new ConflictGraphBuilder(scheduleInput).build();

  const scheduleBuilder = new ScheduleBuilder(graph, scheduleInput.salones);
  const horario = scheduleBuilder.buildHorario();

  // Generar validaciones
  const violaciones: string[] = [];
  const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

  for (const dia of dias) {
    const horasPorMateria = new Map<string, number>();

    for (const hora in horario[dia]) {
      for (const clase of horario[dia]![hora]!) { //TODO: Tema de undefined
        const key = `${clase.materia}-${clase.grupo}`;
        const horasActual = horasPorMateria.get(key) || 0;
        horasPorMateria.set(key, horasActual + 2);
      }
    }

    for (const [materia, horas] of horasPorMateria) {
      if (horas > 2) {
        violaciones.push(`${materia} tiene ${horas} horas el ${dia} (máximo 2)`);
      }
    }
  }

  return {
    grafo: {
      vertices: graph.getVertex().length,
      aristas: graph.getEdges().length
    },
    horario,
    validaciones: {
      esValido: violaciones.length === 0,
      violaciones,
      totalViolaciones: violaciones.length
    }
  };
}

export async function imprimirHorario(): Promise<void> {
  const reporte = await generarHorario();

  console.log("\n" + "=".repeat(100));
  console.log("📋 REPORTE DE HORARIO");
  console.log("=".repeat(100));

  console.log("\n📊 Grafo de conflictos:");
  console.log(`   ✓ Vértices: ${reporte.grafo.vertices}`);
  console.log(`   ✓ Aristas: ${reporte.grafo.aristas}`);

  console.log("\n✅ Validaciones:");
  console.log(`   Estado: ${reporte.validaciones.esValido ? "✓ VÁLIDO" : "✗ INVÁLIDO"}`);
  console.log(`   Violaciones totales: ${reporte.validaciones.totalViolaciones}`);

  if (reporte.validaciones.violaciones.length > 0) {
    console.log("\n⚠️  Violaciones encontradas:");
    reporte.validaciones.violaciones.forEach((v, i) => {
      console.log(`   ${i + 1}. ${v}`);
    });
  } else {
    console.log("\n   ✓ No hay violaciones de restricciones");
  }

  console.log("\n" + "=".repeat(100));
}

