// scripts/generate-students.ts
// Run with: npx tsx scripts/generate-students.ts

const API_URL = "http://localhost:3002/api/student/schedule";

const MATERIAS_POR_CARRERA = {
    Sistemas: [
        "SIS-MAT1", "SIS-FIS1", "SIS-PRG1", "SIS-CAL1", "SIS-INGL1", "SIS-INTRO",
        "SIS-MAT2", "SIS-FIS2", "SIS-PRG2", "SIS-CAL2", "SIS-INGL2"
    ],
    Electronica: [
        "ELE-MAT1", "ELE-FIS1", "ELE-CAL1", "ELE-INGL1", "ELE-INTRO", "ELE-CIRC1",
        "ELE-MAT2", "ELE-FIS2", "ELE-CAL2", "ELE-INGL2", "ELE-CIRC2", "ELE-ELECTRO"
    ],
    Industrial: [
        "IND-MAT1", "IND-FIS1", "IND-CAL1", "IND-INGL1", "IND-INTRO", "IND-ADM1",
        "IND-MAT2", "IND-FIS2", "IND-CAL2", "IND-INGL2", "IND-ADM2", "IND-PROD1"
    ]
};

const CARRERAS = ["Sistemas", "Electronica", "Industrial"];
const NOMBRES = [
    "Juan Pérez", "María Gómez", "Carlos López", "Ana Martínez", "Luis Rodríguez",
    "Laura Fernández", "Pedro Sánchez", "Sofía Ramírez", "Diego Torres", "Valentina Castro",
    "Andrés Morales", "Camila Rojas", "Javier Herrera", "Isabella Ortiz", "Sebastián Silva",
    "Daniela Guzmán", "Mateo Chávez", "Lucía Mendoza", "Gabriel Peña", "Emma Delgado"
];

function getRandomMaterias(carrera: string, count: number): string[] {
    const materias = MATERIAS_POR_CARRERA[carrera as keyof typeof MATERIAS_POR_CARRERA];
    if (!materias) return [];

    // Shuffle and take first 'count' elements
    const shuffled = [...materias];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        // @ts-ignore
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count);
}

function generateStudents(count: number): Array<{ estudianteId: string; nombre: string; carrera: string; materias: string[] }> {
    const students = [];

    for (let i = 1; i <= count; i++) {
        const carrera = CARRERAS[(i - 1) % CARRERAS.length];
        const nombre = NOMBRES[(i - 1) % NOMBRES.length];
        // Each student takes 6-10 materias (typically a semester load)
        const materiasCount = Math.floor(Math.random() * 5) + 6; // 6 to 10
        const materias = getRandomMaterias(carrera!, materiasCount);

        students.push({
            estudianteId: `EST-${String(i).padStart(3, "0")}`,
            nombre,
            carrera,
            materias
        });
    }

    // @ts-ignore
    return students;
}

async function createStudentSchedule(student: { estudianteId: string; nombre: string; carrera: string; materias: string[] }) {
    console.log(`\n📚 Procesando: ${student.estudianteId} - ${student.nombre} (${student.carrera})`);
    console.log(`   Materias: ${student.materias.length} - ${student.materias.join(", ")}`);

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                estudianteId: student.estudianteId,
                materias: student.materias
            })
        });

        const data = await response.json();

        if (data.success) {
            const metrics = data.data.metricas;
            console.log(`   ✅ Éxito! Bloques: ${metrics.totalBloques}, Costo: ${metrics.costoTotal}, Sedes: ${metrics.sedesUsadas.join(", ")}`);
            return { success: true, studentId: student.estudianteId };
        } else {
            console.log(`   ❌ Error: ${data.error}`);
            return { success: false, studentId: student.estudianteId, error: data.error };
        }
    } catch (error) {
        console.log(`   ❌ Network error: ${error}`);
        return { success: false, studentId: student.estudianteId, error: String(error) };
    }
}

async function main() {
    console.log("=".repeat(80));
    console.log("🎓 GENERANDO HORARIOS PARA 20 ESTUDIANTES");
    console.log("=".repeat(80));

    const students = generateStudents(20);

    console.log(`\n📊 Estudiantes a procesar: ${students.length}`);
    console.log("   Distribución por carrera:");
    const carreraCount: Record<string, number> = {};
    for (const s of students) {
        carreraCount[s.carrera] = (carreraCount[s.carrera] || 0) + 1;
    }
    for (const [carrera, count] of Object.entries(carreraCount)) {
        console.log(`      - ${carrera}: ${count} estudiantes`);
    }

    console.log("\n⏳ Procesando...\n");

    const results = [];
    for (const student of students) {
        const result = await createStudentSchedule(student);
        results.push(result);
        // Pequeña pausa para no sobrecargar el servidor
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log("\n" + "=".repeat(80));
    console.log("📊 RESUMEN FINAL");
    console.log("=".repeat(80));

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`\n✅ Exitosos: ${successful}`);
    console.log(`❌ Fallidos: ${failed}`);

    if (failed > 0) {
        console.log("\nEstudiantes fallidos:");
        results.filter(r => !r.success).forEach(r => {
            console.log(`   - ${r.studentId}: ${(r as any).error}`);
        });
    }

    console.log("\n🏁 Proceso completado!");
    console.log("   Para consultar un horario: GET /api/student/schedule/EST-001");
}

main().catch(console.error);