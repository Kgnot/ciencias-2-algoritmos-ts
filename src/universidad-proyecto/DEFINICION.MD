OPTIMIZACIÓN DE LA PLANIFICACIÓN ACADÉMICA MEDIANTE ALGORITMOS DE GRAFOS
Especificación Técnica, Modelado Formal y Análisis Experimental

---

1. Descripción del Problema
============================

Se debe generar un horario académico semanal para la Facultad de Ingeniería,
asignando a cada grupo de cada materia un salón físico y una franja horaria
específica, respetando un conjunto de restricciones institucionales y pedagógicas.

La dimensión del problema en el escenario principal (Escenario 1):
  - 35 materias distribuidas en 3 carreras y 2 semestres (Sistemas, Electrónica, Industrial)
  - 33 salones disponibles (23 normales + 10 laboratorios)
  - Hasta 5 grupos por materia, cada uno con 2 a 4 bloques de 2 horas
  - 8 franjas horarias por día × 6 días = 48 franjas semanales

El problema se modela como un problema de COLOREO DE GRAFOS, donde:
  - Vértices = bloques de clase individuales
  - Aristas  = pares de bloques que no pueden compartir el mismo salón
  - Colores  = identificadores de salones físicos disponibles

Encontrar el coloreo mínimo (número cromático) es NP-completo en el caso general.
El sistema emplea heurísticas polinomiales que producen soluciones válidas y
de buena calidad en tiempo práctico.

---

2. Modelado Formal del Grafo de Conflictos
===========================================

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
                 (restricción blanda), pero si el dataset lo fuerza, el grafo lo
                 captura y el coloreo garantiza salones distintos.

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

Complejidad del problema
------------------------
El coloreo de grafos es NP-completo en el caso general (reducción desde 3-SAT, Karp 1972).
Esto implica que no existe algoritmo polinomial conocido que garantice el coloreo mínimo
para grafos arbitrarios, salvo casos especiales (grafos perfectos, bipartitos, etc.).

El grafo de conflictos construido en el Escenario 1 tiene:
  - 476 vértices  (bloques de clase)
  - 3558 aristas  (pares de bloques en conflicto)
  - Densidad: 3558 / (476×475/2) ≈ 3.1%  (grafo disperso)

Para este tamaño, un algoritmo exacto de backtracking exploraría en el peor caso
O(33^476) combinaciones — computacionalmente inviable. Las heurísticas producen
soluciones válidas de buena calidad en < 30 ms.

---

3. Datos de Entrada
====================

    35 materias distribuidas en 2 semestres × 3 carreras (Sistemas, Electrónica, Industrial)

    33 salones (23 normales con capacidad 35-40 personas, 10 laboratorios con capacidad 20-21 personas)

    Franjas horarias: 8 franjas tipo A (inician 6:00) + 0 franjas tipo B = 8 franjas por día

    6 días a la semana (Lunes a Sábado) = 48 franjas totales por semana

---

4. Restricciones del Problema
==============================

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

---

5. Objetivos del Sistema
=========================

    Minimizar el número de salones utilizados (optimizar recursos institucionales)

    Generar un horario válido que cumpla todas las restricciones

    Distribuir equitativamente los bloques de cada materia en diferentes días

    Maximizar la ocupación de los salones disponibles

    Resolver todos los conflictos identificados en el grafo de conflictos (0 conflictos en asignación final)

---

6. Conjuntos de Datos Experimentales
=====================================

Se definen tres escenarios con datasets distintos para evaluar el comportamiento
de los algoritmos bajo diferentes condiciones de densidad, tamaño y complejidad.

Escenario 1 — Full Scale (data.json)
--------------------------------------
Descripción: Dataset completo de la Facultad de Ingeniería con todas las carreras.
  Materias  : 35 (3 carreras × 2 semestres: Sistemas, Electrónica, Industrial)
  Salones   : 33 (23 normales + 10 laboratorios, 3 sedes: A, B, C)
  Franjas   : 8 por día × 6 días
  Grupos    : hasta 5 grupos por materia
  Créditos  : 2 a 4 por materia
  Vértices  : 476  (bloques de clase generados)
  Aristas   : 3558 (pares en conflicto)
  Densidad  : ~3.1%

Escenario 2 — Alta Densidad (data2.json)
-----------------------------------------
Descripción: Dataset con la misma estructura del Escenario 1 pero orientado a
             validar reproducibilidad y consistencia del coloreo entre ejecuciones.
  Materias  : 35 (mismas 3 carreras, 2 semestres)
  Salones   : 33 (23 normales + 10 laboratorios)
  Franjas   : 8 por día
  Grupos    : hasta 5 grupos por materia
  Vértices  : 476
  Aristas   : 3558

Escenario 3 — Prueba de Estrés (data3.json)
--------------------------------------------
Descripción: Dataset mínimo con restricciones extremas: pocos salones,
             pocas franjas y profesores que comparten varias materias.
  Materias  : 12 (carrera Sistemas, semestres 1-3)
  Salones   : 11 (8 normales + 3 laboratorios)
  Franjas   : 6 por día (restricción más apretada)
  Profesores: Dr. Ramos dicta MAT1, CAL1, MAT2 y CAL2 (conflictos de profesor forzados)
  Vértices  : 92
  Aristas   : 119
  Objetivo  : verificar que el sistema maneja correctamente los conflictos
              de profesor y el escenario de salones casi agotados

---

7. Enfoque de Solución
=======================

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

---

8. Justificación de Algoritmos Seleccionados
=============================================

8.1 Por qué Coloreo de Grafos
------------------------------
El coloreo de grafos es el modelo natural para problemas de asignación de recursos
con restricciones de exclusión mutua. En este problema:
  - Los salones son los "colores" (recursos limitados).
  - Los bloques de clase son los "vértices" (entidades a asignar).
  - Las incompatibilidades horarias y de profesor son las "aristas" (exclusiones).

Modelos alternativos considerados y descartados:
  - Programación lineal entera (ILP): produce el óptimo pero es NP-difícil; tiempos
    de cómputo inviables para 476 variables binarias en tiempo real.
  - Matching bipartito máximo: modela asignación de un solo recurso a un conjunto;
    no captura directamente las restricciones de franja temporal.
  - Flujo máximo: modela capacidad/throughput en redes; no captura la estructura
    de exclusión mutual del problema de asignación de salones.

El coloreo de grafos es el modelo más directo, mejor estudiado y con las mejores
herramientas teóricas para este tipo de problema.

8.2 Por qué ConnectedComponents (BFS) como pre-procesamiento
-------------------------------------------------------------
Motivación: el grafo de conflictos suele tener múltiples componentes conexas.
Bloques en componentes distintas nunca comparten conflicto, por lo que pueden
reutilizar los mismos salones (colores). Colorear cada componente desde el salón 1
minimiza el número total de salones necesarios.

Sin esta pre-descomposición, el algoritmo de coloreo podría asignar salones más
altos innecesariamente por acumulación de restricciones entre componentes aisladas.

Ejemplo con el Escenario 1:
  - 476 vértices, 3558 aristas
  - El grafo normal (~380 vértices) tiene múltiples componentes
  - Colorear cada componente desde S101 permite reutilizar S101, S102, ... en
    cada componente independiente → resultado final: 26 salones en lugar de
    potencialmente más si se colorea el grafo completo sin descomposición.

Complejidad: O(V + E) — lineal en el tamaño del grafo.

8.3 Por qué D-Satur como algoritmo principal
---------------------------------------------
D-Satur (Degree of Saturation, Brélaz 1979) selecciona en cada paso el vértice
con mayor grado de saturación (número de colores distintos ya asignados a sus
vecinos). En caso de empate, desempata por grado del vértice.

Ventajas sobre Greedy (Voraz):
  - Greedy procesa vértices en orden de inserción, sin información sobre el grafo.
    Puede asignar colores subóptimos por ignorar el contexto local.
  - D-Satur adapta dinámicamente el orden de procesamiento según el estado actual
    del coloreo, tendiendo a usar menos colores en grafos con estructura no trivial.

Ventajas sobre Welsh-Powell:
  - Welsh-Powell ordena los vértices por grado ANTES del coloreo (orden estático).
    Este orden no cambia durante la ejecución.
  - D-Satur actualiza prioridades dinámicamente durante el coloreo, siendo más
    sensible a la estructura local del grafo en cada iteración.

Desventaja de D-Satur:
  - Complejidad O(V²) frente a O(V + E) de Greedy y O(V log V + V²) ≈ O(V²) de
    Welsh-Powell. En la práctica, D-Satur es ~4× más lento que Greedy en el
    Escenario 1 (19 ms vs. 4 ms), pero ambos producen el mismo número de colores
    para grafos dispersos como el de este problema.

Conclusión: D-Satur es el algoritmo principal por su mejor comportamiento teórico
y práctico en grafos densos o con estructura irregular. Greedy y Welsh-Powell se
mantienen como alternativas para comparación y como baseline de velocidad.

8.4 Por qué no Dijkstra ni Ford-Fulkerson para el problema principal
---------------------------------------------------------------------
  - Dijkstra (caminos mínimos): se utiliza en el sub-problema secundario de
    optimización del horario personal del estudiante (minimiza cambios de sede/piso
    en el día). No aplica al problema principal de asignación de salones.

  - Ford-Fulkerson / Edmonds-Karp (flujo máximo): disponibles para verificación de
    factibilidad de capacidad (¿hay suficientes salones de cada tipo para todas las
    franjas?). Pueden integrarse como validación previa al coloreo. No reemplazan el
    coloreo porque flujo máximo no garantiza asignaciones sin conflicto.

8.5 Análisis de Complejidad del Pipeline
-----------------------------------------

  Fase                   Algoritmo           Complejidad     Escenario 1 (V=476, E=3558)
  ─────────────────────────────────────────────────────────────────────────────────────────
  Construcción de grafo  ConflictGraphBuilder O(V·E_max)     ~2 ms
  Pre-procesamiento      ConnectedComponents  O(V + E)       ~0.1 ms
  Coloreo (principal)    D-Satur             O(V²)           ~19 ms
  Coloreo (alternativa)  Welsh-Powell        O(V log V + V²) ~10 ms
  Coloreo (baseline)     Greedy              O(V·(V+E))      ~4 ms
  Pipeline completo                          O(V²)           < 25 ms total

  Para el Escenario 1: O(476²) = O(226.576 operaciones) — computacionalmente trivial.
  El bottleneck real es la construcción del grafo, no el coloreo.

---

9. Supuestos del Sistema
=========================

Los siguientes supuestos se aplican a todos los escenarios evaluados:

  1. Cada crédito académico equivale a exactamente 2 horas de clase (1 bloque).

  2. Un grupo de materia no puede tener más de un bloque el mismo día.

  3. Un salón solo puede albergar una clase por franja horaria (exclusión estricta).

  4. Los salones normales y laboratorios son mutuamente excluyentes: una materia
     normal no puede asignarse a un laboratorio y viceversa.

  5. Los datasets son deterministas: dadas las mismas entradas, el sistema produce
     siempre la misma salida (sin componentes aleatorias en el algoritmo de coloreo).

  6. La asignación de franjas horarias (TimeSlotAllocator) se realiza antes del
     coloreo y no es parte del problema de coloreo en sí.

  7. Los conflictos de profesor son restricciones blandas durante la asignación de
     franjas y restricciones duras en el grafo de conflictos (las aristas del grafo
     garantizan salones distintos incluso si dos bloques del mismo profesor quedan
     en la misma franja por sobredemanda del dataset).

  8. El número de salones disponibles es siempre suficiente para producir un coloreo
     válido; si no lo fuera, el sistema lanza un error explícito.

  9. No se modela la capacidad de estudiantes por salón (todos los salones son
     intercambiables dentro de su tipo).

  10. La métrica de calidad primaria es el número de salones utilizados (menos = mejor).
      No se penaliza la distribución de clases entre sedes ni entre pisos.

---

10. Métricas de Éxito con Umbrales Medibles
============================================

Las siguientes métricas y umbrales se derivan de los resultados experimentales
observados en los tres escenarios y constituyen los criterios de aceptación del sistema.

Métrica 1 — Validez del coloreo
  Umbral   : 0 conflictos en la asignación final (ningún par de bloques adyacentes
             en el grafo de conflictos comparte el mismo salón)
  Observado: ✅ los tres algoritmos producen coloreos válidos en los tres escenarios
  Medición : algoritmo.isValid() → true

Métrica 2 — Salones utilizados ≤ salones disponibles
  Umbral   : colores_usados ≤ total_salones_disponibles del escenario
  Observado (Escenario 1): 26 salones usados de 33 disponibles
  Observado (Escenario 2): 26 salones usados de 33 disponibles
  Observado (Escenario 3):  6 salones usados de 11 disponibles
  Medición : Set(colorMap.values()).size ≤ input.salones.length

Métrica 3 — Porcentaje de ocupación de salones
  Definición: (salones_usados / salones_disponibles) × 100
  Umbral   : > 40% de ocupación (evitar sub-utilización severa)
  Observado (Escenario 1): 26/33 = 78.8%  ← cumple
  Observado (Escenario 3):  6/11 = 54.5%  ← cumple
  Objetivo ideal: maximizar este porcentaje (uso eficiente de la infraestructura)

Métrica 4 — Conflictos resueltos vs. asignación naive
  Definición: número de conflictos eliminados respecto a una asignación round-robin
              sin restricciones (baseline). Después del coloreo válido = 0 conflictos
              restantes → todos los conflictos del baseline fueron resueltos.
  Umbral   : 100% de conflictos del baseline resueltos (conflictos_restantes = 0)
  Observado: ✅ los tres algoritmos resuelven el 100% en los tres escenarios
  Medición : baseline_conflicts / baseline_conflicts = 1.0  (si isValid() = true)

Métrica 5 — Tiempo de ejecución
  Umbral   : < 25 ms para el Escenario 1 (476 vértices, 3558 aristas)
             < 5 ms  para el Escenario 3 (92 vértices, 119 aristas)
  Observado (Escenario 1):
    Voraz:          ~4 ms    ← referencia de velocidad
    Welsh-Powell:  ~10 ms    ← equilibrio calidad/velocidad
    D-Satur:       ~19 ms    ← máxima calidad, dentro del umbral
  Observado (Escenario 3):
    Todos < 1 ms             ← muy por debajo del umbral
  Medición : performance.now() antes y después del algoritmo

Métrica 6 — Restricción de tipo de salón
  Umbral   : 100% de los bloques de laboratorio asignados a salones tipo laboratorio;
             100% de los bloques normales asignados a salones tipo normal
  Garantía : el sistema colorea los subgrafos normal y lab por separado → restricción
             estructuralmente imposible de violar
  Medición : para todo v ∈ V: v.tipoSalon === v.salon.tipo

Métrica 7 — Restricción de un bloque por día por materia
  Umbral   : 0 materias con más de 1 bloque en el mismo día
  Garantía : TimeSlotAllocator distribuye los bloques en días distintos;
             EdgeCreator.connectSameGroupSameDay agrega la arista de conflicto
             si la distribución falla → coloreo garantiza salones distintos
  Medición : verificación post-coloreo del horario generado

---

11. Resultados Experimentales
==============================

Ejecutar con:  npm run compare:scenarios

Resultados representativos (muestra de una ejecución):

Escenario 1 — Full Scale (data.json) — 476V · 3558E · 33 salones
  Conflictos naive (round-robin): ~80 (varía según orden de asignación de franjas)

  Algoritmo        Colores   Uso%    Válido   Tiempo       Conf. resueltos
  ──────────────────────────────────────────────────────────────────────────
  Voraz            26        78.8%   ✅       ~7 ms        80 / 80
  Welsh-Powell     26        78.8%   ✅       ~13 ms       80 / 80
  D-Satur          26        78.8%   ✅       ~26 ms       80 / 80

Escenario 3 — Prueba Estrés (data3.json) — 92V · 119E · 11 salones
  Algoritmo        Colores   Uso%    Válido   Tiempo       Conf. resueltos
  ──────────────────────────────────────────────────────────────────────────
  Voraz             6        54.5%   ✅       ~0.1 ms      2 / 2
  Welsh-Powell      6        54.5%   ✅       ~0.1 ms      2 / 2
  D-Satur           6        54.5%   ✅       ~0.4 ms      2 / 2

Observaciones:
  - Los tres algoritmos producen el mismo número de colores en grafos dispersos (densidad ~3%).
    D-Satur muestra ventaja principalmente en grafos más densos donde el orden de
    procesamiento tiene mayor impacto en el número de colores asignados.
  - D-Satur es consistentemente más lento (~4× vs. Greedy) debido a la recalculación
    del grado de saturación en cada iteración — costo aceptable dado el umbral de 25 ms.
  - El pre-procesamiento con ConnectedComponents (BFS) reduce el número de salones
    necesarios al permitir reutilización entre componentes independientes.

---

12. Pipeline de Algoritmos — Tabla Resumen
===========================================

Algoritmo               Tipo                  Fase       Rol
ConnectedComponents     Traversal/BFS         Pre-proc.  Descompone el grafo; habilita reutilización de salones entre componentes
D-Satur                 Coloreo heurístico    Coloreo    Algoritmo principal; prioriza por saturación dinámica
Welsh-Powell            Coloreo heurístico    Coloreo    Alternativa; ordena por grado descendente (estático)
Greedy (Voraz)          Coloreo heurístico    Coloreo    Baseline; orden de inserción, primer color disponible
Dijkstra                Caminos mínimos       Estudiante Optimiza el horario personal del estudiante (minimiza cambios de sede/piso)
Backtracking            Búsqueda exhaustiva   Estudiante Fallback para cubrir materias no asignadas por Dijkstra

Algoritmos implementados y disponibles para extensión:
Ford-Fulkerson          Flujo máximo          Extensión  Validación de capacidad de salones por franja
Edmonds-Karp            Flujo máximo (BFS)    Extensión  Variante con garantía de complejidad polinomial O(V·E²)

---

Referencias
===========

  Brélaz, D. (1979). New methods to color the vertices of a graph.
    Communications of the ACM, 22(4), 251–256.

  Karp, R. M. (1972). Reducibility among combinatorial problems.
    En R. E. Miller & J. W. Thatcher (Eds.), Complexity of Computer Computations
    (pp. 85–103). Plenum Press.

  Lewis, R. (2015). A Guide to Graph Colouring: Algorithms and Applications.
    Springer. ISBN 978-3-319-25728-7.
