PROBLEMA DE ASIGNACIÓN DE HORARIOS UNIVERSITARIOS
Descripción del Problema

Se debe generar un horario académico semanal para una facultad de Ingeniería de Sistemas, asignando a cada grupo de una materia un salón y una franja horaria específica, respetando un conjunto de restricciones institucionales y pedagógicas.

El problema se modela como un problema de coloreo de grafos, donde:

    Vértices = cada bloque de clase (una materia de N créditos genera N bloques de 2 horas)

    Aristas = conflictos entre bloques (no pueden compartir el mismo salón)

    Colores = salones físicos disponibles

Datos de Entrada

    60 materias distribuidas en 10 semestres

    50 salones (40 normales con capacidad 35-40 personas, 10 laboratorios con capacidad 20-21 personas)

    Franjas horarias: 8 franjas tipo A (inician 6:00) + 7 franjas tipo B (inician 7:00) = 15 franjas por día

    6 días a la semana (Lunes a Sábado) = 90 franjas totales

Restricciones del Problema
1. Restricciones de Conflictos entre Clases

Dos bloques de clase NO pueden asignarse al mismo salón si:

    Se solapan en tiempo (mismo día y horario)

    Y comparten estudiantes (mismo semestre) O comparten el mismo profesor

2. Restricción de Créditos y Horas por Día

   1 crédito académico = 2 horas de clase

   Las materias pueden tener de 1 a 4 créditos

   Una misma materia NO puede tener más de 2 horas (1 bloque) el mismo día

        Es decir, los bloques de una materia de 4 créditos deben distribuirse en al menos 4 días diferentes

3. Restricciones de Salones

   Las materias de tipo "normal" solo pueden asignarse a salones normales (capacidad 35-40)

   Las materias de tipo "laboratorio" solo pueden asignarse a laboratorios (capacidad 20-21)

   Un mismo salón no puede tener dos clases al mismo tiempo (garantizado por el coloreo)

4. Restricción de Franjas Especiales (Tipo B)

   Solo 2 materias en todo el pensum pueden usar franjas tipo B

   Estas materias son: PROY2 (Proyecto de Ingeniería II) y TESIS1 (Tesis I)

5. Restricción de Carga por Día (implícita)

   Cada grupo de materia tiene una carga semanal fija (2 × créditos horas)

   La distribución debe ser equilibrada a lo largo de la semana

Objetivos

    Minimizar el número de salones utilizados (optimizar recursos)

    Generar un horario válido que cumpla todas las restricciones

    Distribuir equitativamente los bloques de cada materia en diferentes días

    Maximizar la ocupación de los salones disponibles

Enfoque de Solución

    Construcción del grafo de conflictos (ConflictGraphBuilder)

        Expandir cada grupo de materia en N bloques (N = créditos)

        Asignar franjas horarias distribuidas en diferentes días

        Detectar conflictos (mismo semestre o mismo profesor con horarios solapados)

    Coloreo del grafo usando Algoritmo D-Satur

        Prioriza vértices con mayor saturación (más restricciones)

        Minimiza el número de colores (salones)

    Post-procesamiento

        Unificar el mismo salón para todos los bloques de un mismo grupo

        Validar restricción de máximo 2 horas por día

        Generar horario semanal legible

Algoritmos Disponibles para Comparación
Algoritmo	Uso	Calidad
D-Satur	Coloreo principal	Óptimo para grafos medianos
Welsh-Powell	Coloreo alternativo	Bueno, más rápido
Greedy	Baseline	Rápido, menor calidad
Ford-Fulkerson	Flujo máximo	Para asignación de salones
Kruskal/Prim	Árboles mínimos	Para conectividad
Dijkstra/Floyd	Caminos mínimos	Para métricas
Métricas de Éxito

     Número de salones utilizados ≤ 50

     Todas las materias cumplen máximo 2 horas por día

     Sin conflictos (mismo semestre/mismo profesor en misma franja)

     Todas las materias de laboratorio en salones tipo laboratorio

     Materias tipo B correctamente asignadas