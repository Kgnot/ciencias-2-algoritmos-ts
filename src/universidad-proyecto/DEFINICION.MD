PROBLEMA DE ASIGNACIÓN DE HORARIOS UNIVERSITARIOS
Descripción del Problema

Se debe generar un horario académico semanal para una facultad de Ingeniería de Sistemas, asignando a cada grupo de una materia un salón y una franja horaria específica, respetando un conjunto de restricciones institucionales y pedagógicas.

El problema se modela como un problema de coloreo de grafos, donde:

    Vértices = cada bloque de clase (una materia de N créditos genera N bloques de 2 horas)

    Aristas = conflictos entre bloques (no pueden compartir el mismo salón)

    Colores = salones físicos disponibles

---

Modelado Formal del Grafo de Conflictos
========================================

Sea G = (V, E) un grafo no dirigido de conflictos donde:

V — Conjunto de vértices
------------------------
Cada vértice v ∈ V representa un bloque de clase individual.
Un grupo de materia con N créditos genera exactamente N vértices (bloque = 2 horas).

Cada vértice almacena los siguientes atributos:
  materiaId  : identificador único de la materia  (ej. "SIS-MAT1")
  grupo      : número de grupo                    (ej. "1", "2", ...)
  bloque     : índice dentro de la materia        (0 … N-1)
  franja     : día + hora de inicio + hora de fin (asignada antes del coloreo)
  tipoSalon  : "normal" | "laboratorio"
  semestre   : semestre académico al que pertenece
  profesor   : nombre del docente que imparte la materia
  salon      : salón asignado (null antes del coloreo; resultado del coloreo)

E — Conjunto de aristas
-----------------------
Existe una arista {u, v} ∈ E si y solo si los bloques u y v NO pueden compartir salón.
Se definen tres familias de aristas, cada una modelando una causa de conflicto distinta:

  1. Conflicto por franja simultánea  (EdgeCreator.connectByFranja)
     Condición : franja(u) = franja(v)  →  mismo día y misma hora
     Causa     : un salón solo alberga una clase a la vez.

  2. Conflicto de grupo en el mismo día  (EdgeCreator.connectSameGroupSameDay)
     Condición : materiaId(u) = materiaId(v)  ∧  grupo(u) = grupo(v)  ∧  día(u) = día(v)
     Causa     : un grupo no puede tener dos bloques de la misma materia en el mismo día.

  3. Conflicto de profesor simultáneo  (EdgeCreator.connectByProfesor)
     Condición : profesor(u) = profesor(v)  ∧  franja(u) = franja(v)
     Causa     : un profesor no puede dictar clase en dos salones al mismo tiempo.
                 En la fase de asignación de franjas se intenta evitar este caso
                 (restricción blanda), pero si el dataset lo fuerza, el grafo lo captura
                 y el coloreo garantiza salones distintos.

Pesos de aristas
----------------
Todas las aristas tienen peso w = 1 (conflicto binario: existe o no existe).
En un grafo de conflictos para coloreo, el objetivo es minimizar el número de colores
(salones), no optimizar una función de costo sobre aristas. El peso uniforme es la
representación semánticamente correcta para este problema.

Colores
-------
color ≡ id de salón físico  (ej. "S101", "L201").
El coloreo asigna a cada vértice un salón tal que ningún par de vértices adyacentes
comparta el mismo salón. Los subgrafos de salones normales y laboratorios se colorean
por separado para respetar la restricción de tipo de salón.

Complejidad
-----------
El coloreo de grafos es NP-completo en el caso general.
Los algoritmos heurísticos utilizados (D-Satur, Welsh-Powell, Greedy) producen
soluciones válidas en tiempo polinomial sin garantía de optimalidad global.

---

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

        Es decir, los bloques de una materia de 4 créditos deben distribuirse en 4 días diferentes

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

    Paso 1 — Construcción del grafo de conflictos (ConflictGraphBuilder)

        Expandir cada grupo de materia en N bloques (N = créditos)

        Asignar franjas horarias distribuidas en diferentes días
        (TimeSlotAllocator: restricción blanda de profesor en primer paso,
         fallback sin restricción en segundo paso)

        Crear aristas de conflicto (EdgeCreator):
          - connectByFranja        → misma franja horaria
          - connectSameGroupSameDay → mismo grupo, mismo día
          - connectByProfesor       → mismo profesor, misma franja

    Paso 2 — Descomposición en componentes conexas (ConnectedComponents, BFS)

        Ejecutar BFS sobre el subgrafo de conflictos para identificar
        todos sus componentes conexas (O(V + E))

        Bloques en componentes distintas no tienen conflicto entre sí:
        pueden reutilizar los mismos salones en franjas no solapadas

        Registrar: número de componentes, tamaños, densidad

    Paso 3 — Coloreo por componente (D-Satur / Welsh-Powell / Greedy)

        Colorear cada componente independientemente con el algoritmo elegido

        El coloreo de cada componente comienza desde el salón de menor índice,
        maximizando la reutilización de salones entre componentes

        D-Satur: prioriza vértices con mayor saturación (más vecinos coloreados)
        Welsh-Powell: ordena por grado descendente, asigna color compatible
        Greedy: orden de procesamiento, primer color disponible (baseline)

    Paso 4 — Post-procesamiento

        Validar que ningún bloque use salones de tipo incorrecto

        Validar restricción de máximo 2 horas por día por materia

        Generar horario semanal legible

Algoritmos en el Pipeline
Algoritmo               Tipo                  Fase       Rol
ConnectedComponents     Traversal/BFS         Pre-proc.  Descompone el grafo; habilita reutilización de salones entre componentes
D-Satur                 Coloreo heurístico    Coloreo    Algoritmo principal; prioriza por saturación
Welsh-Powell            Coloreo heurístico    Coloreo    Alternativa; ordena por grado descendente
Greedy (Voraz)          Coloreo heurístico    Coloreo    Baseline; orden de inserción
Dijkstra                Caminos mínimos       Estudiante Optimiza el horario personal de cada estudiante (minimiza cambios de sede/piso)
Backtracking            Búsqueda exhaustiva   Estudiante Fallback para cubrir materias no asignadas por Dijkstra

Algoritmos implementados y disponibles para extensión
Ford-Fulkerson          Flujo máximo          Extensión  Validación de capacidad de salones (ver sección Sugerencias)
Edmonds-Karp            Flujo máximo (BFS)    Extensión  Variante de Ford-Fulkerson con garantía polinomial
Métricas de Éxito

    ✅ Número de salones utilizados ≤ 50

    ✅ Todas las materias cumplen máximo 2 horas por día

    ✅ Sin conflictos (mismo semestre/mismo profesor en misma franja)

    ✅ Todas las materias de laboratorio en salones tipo laboratorio

    ✅ Materias tipo B correctamente asignadas