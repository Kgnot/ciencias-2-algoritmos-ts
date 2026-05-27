# Optimización de la Planificación Académica mediante Algoritmos de Grafos

Proyecto académico de la Facultad de Ingeniería que modela y resuelve dos problemas
reales de planificación universitaria usando teoría de grafos.

---

## Problemática

Cuando una universidad genera su horario académico, el objetivo principal es que
**todas las materias queden asignadas a algún salón y alguna franja horaria**. No se
optimiza para la experiencia del estudiante.

Esto produce dos tipos de problemas concretos:

### 1. Conflictos en la asignación de salones

El proceso manual o semi-automático de asignar salones suele generar situaciones como:

- Dos grupos distintos asignados al mismo salón en la misma franja horaria.
- Un profesor programado para dictar dos clases simultáneamente en salones diferentes.
- Materias de laboratorio asignadas a aulas normales (o viceversa).

Estos conflictos se resuelven manualmente, lo cual es costoso en tiempo y propenso a
errores cuando la escala crece (decenas de materias, múltiples grupos, múltiples sedes y cientos de estudiantes haciendo cambios al tiempo).

### 2. Horarios personales no optimizados para el estudiante

Una vez publicado el horario, el estudiante debe construir su propio horario eligiendo
entre los distintos grupos disponibles de cada materia. Aquí aparece otro problema:
la Facultad de Ingeniería tiene **tres sedes** (A, B, C) distribuidas físicamente en
distintos edificios, y cada sede tiene varios pisos.

Un estudiante que elige mal (o no puede elegir bien) sus grupos puede terminar con:

- Clases consecutivas en sedes distintas, obligándolo a moverse entre edificios en
  el tiempo entre una clase y la siguiente.
- Cambios de sede en franjas inmediatamente seguidas, que en la práctica son
  imposibles de realizar a tiempo.
- Días con alta concentración de materias pesadas (muchos créditos), generando fatiga
  académica.
- Clases del mismo grupo repetidas en el mismo día (no está permitido) o distribuidas
  de manera desigual en la semana.

El estudiante no tiene herramientas que le ayuden a elegir la combinación de grupos
que minimice su costo de desplazamiento y maximice la viabilidad de su horario.

---

## Hipótesis de Solución

El problema de planificación académica puede dividirse en dos subproblemas
independientes, cada uno modelable formalmente con grafos:

### Subproblema 1 — Asignación de salones sin conflictos

**Hipótesis:** si modelamos cada bloque de clase como un vértice de un grafo y
añadimos una arista entre dos bloques cada vez que no pueden compartir el mismo
salón (porque ocurren en la misma franja, o tienen el mismo profesor, o pertenecen
al mismo grupo en el mismo día), entonces asignar salones a bloques sin conflicto
equivale a **colorear el grafo de conflictos** con el mínimo número de colores
(donde cada color es un salón físico).

Esto es el **problema de coloreo de grafos**, NP-completo en el caso general.
Para la escala real de la facultad (~476 vértices, ~3558 aristas), los algoritmos
heurísticos producen soluciones válidas en menos de 30 ms.

### Subproblema 2 — Optimización del horario personal del estudiante

**Hipótesis:** dado un conjunto de materias que el estudiante quiere cursar y un
horario ya asignado, encontrar la combinación de grupos que minimice los
desplazamientos entre sedes y pisos a lo largo del día equivale a encontrar el
**camino de menor costo** en un grafo dirigido y ponderado, donde los nodos son los
bloques disponibles de cada materia y los pesos representan el costo de moverse de
un bloque al siguiente dentro del mismo día.

Esto se resuelve con el **algoritmo de Dijkstra**.

---

## Solución Implementada

### Pipeline completo del sistema

```
ENTRADA: lista de materias, salones disponibles, franjas horarias

─── FASE 1: Construcción del grafo de conflictos ──────────────────────────
  ConflictGraphBuilder
    │
    ├── TimeSlotAllocator   → asigna cada bloque a un día y franja horaria
    │                         (restricción blanda: evita que el mismo profesor
    │                          dicte en dos franjas simultáneas)
    │
    └── EdgeCreator         → crea aristas de conflicto entre pares de bloques:
                               ① misma franja (mismo salón imposible)
                               ② mismo grupo, mismo día (máx. 1 bloque/día)
                               ③ mismo profesor, misma franja (profe ocupa un salón)

─── FASE 2: Pre-procesamiento del grafo ───────────────────────────────────
  ConnectedComponents (BFS)
    └── Descompone el grafo en componentes conexas independientes.
        Bloques en componentes distintas no tienen conflicto entre sí:
        cada componente puede colorear desde el salón 1, maximizando reutilización.

─── FASE 3: Coloreo del grafo ─────────────────────────────────────────────
  Algoritmo de coloreo (D-Satur / Welsh-Powell / Greedy)
    └── Colorea cada componente independientemente.
        Cada color = un salón físico.
        Los subgrafos de salones normales y laboratorios se colorean por separado.

─── FASE 4: Construcción del horario semanal ──────────────────────────────
  ScheduleBuilder
    └── Genera el horario estructurado por día y franja, con salón asignado.

─── FASE 5: Optimización del horario del estudiante ───────────────────────
  StudentScheduleSolver
    ├── DaySubgraphBuilder  → construye un grafo dirigido ponderado por día:
    │                          nodos = bloques disponibles del estudiante
    │                          aristas = transiciones entre bloques consecutivos
    │                          pesos = costo de cambio de sede (1000) o piso (N)
    │
    ├── DijkstraStrategy    → encuentra el camino de menor costo desde el nodo
    │                          fuente hasta el mejor conjunto de bloques del día
    │
    └── BacktrackingStrategy → fallback: cubre las materias que Dijkstra no asignó
```

### Grafo de conflictos — estructura formal

| Elemento | Definición |
|----------|-----------|
| **Vértice** | Bloque de clase individual (1 crédito = 1 bloque de 2 horas) |
| **Arista** | Par de bloques que no pueden compartir salón |
| **Color** | ID de salón físico (`S101`, `L201`, ...) |
| **Peso de arista** | `w = 1` (conflicto binario: existe o no existe) |

Tres familias de aristas:

| Familia | Condición | Causa |
|---------|-----------|-------|
| `connectByFranja` | `franja(u) = franja(v)` | Un salón alberga una clase a la vez |
| `connectSameGroupSameDay` | mismo grupo, mismo día | Máximo un bloque por materia por día |
| `connectByProfesor` | mismo profesor, misma franja | Un profesor no dicta en dos salones simultáneamente |

### Grafo de día del estudiante — estructura formal

| Elemento | Definición |
|----------|-----------|
| **Nodo fuente** | Punto de inicio abstracto (sin bloque asociado) |
| **Nodo bloque** | Un bloque disponible de una materia en ese día |
| **Arista** | Transición del nodo fuente o de un bloque a otro bloque posterior |
| **Peso** | 1000 si cambia de sede; diferencia de pisos si misma sede; `null` si el cambio es imposible (sedes distintas en franja inmediata) |

---

## Algoritmos

### Para asignación de salones

| Algoritmo | Tipo | Complejidad | Rol |
|-----------|------|-------------|-----|
| **ConnectedComponents (BFS)** | Traversal de grafo | O(V + E) | Pre-procesamiento: descompone el grafo en componentes independientes |
| **D-Satur** | Coloreo heurístico | O(V²) | Principal: prioriza vértices con mayor saturación (más vecinos ya coloreados) |
| **Welsh-Powell** | Coloreo heurístico | O(V²) | Alternativa: ordena vértices por grado descendente antes de colorear |
| **Greedy (Voraz)** | Coloreo heurístico | O(V·E) | Baseline: asigna el primer color disponible en orden de inserción |

**Por qué D-Satur como principal:** en cada paso selecciona el vértice con el contexto
local más restringido (mayor número de colores distintos ya usados por sus vecinos).
Esto produce coloreos de mejor calidad que el Greedy, especialmente en grafos con
estructura irregular. El costo extra (~4× más lento que Greedy) es aceptable para
la escala del problema.

### Para optimización del horario del estudiante

| Algoritmo | Tipo | Rol |
|-----------|------|-----|
| **Dijkstra** | Caminos mínimos | Encuentra el conjunto de bloques del día con menor costo total de desplazamiento |
| **Backtracking** | Búsqueda exhaustiva | Fallback para asignar materias que Dijkstra no pudo cubrir |

---

## Estructura del Proyecto

```
ciencias-2-algoritmos-ts/
├── src/
│   ├── algoritmos/
│   │   ├── coloreado/
│   │   │   ├── D-Satur/          ← d-satur.ts
│   │   │   ├── Whelsh-Powell/    ← whelsh-powell.ts
│   │   │   ├── coloreado-voraz/  ← coloreado-voraz.ts
│   │   │   └── coloreado.abstract.ts
│   │   ├── dfs/
│   │   │   ├── connected-components.ts
│   │   │   └── dfs.ts / bfs.ts
│   │   ├── camino-corto/
│   │   │   └── Dijkstra/         ← dijkstra.ts
│   │   └── flujo/
│   │       ├── ford-fulkerson/
│   │       └── edmons-karp/
│   │
│   ├── estructuras/
│   │   ├── graph/                ← graph.ts, graph_indexer.ts
│   │   ├── vertex.ts
│   │   └── edge.ts
│   │
│   └── universidad-proyecto/
│       ├── data/
│       │   ├── data.json         ← Escenario 1
│       │   ├── data2.json        ← Escenario 2
│       │   ├── data3.json        ← Escenario 3 (estrés)
│       │   └── scheduler-data-loader.ts
│       │
│       ├── logic/
│       │   ├── schedule/
│       │   │   ├── conflict-graph/
│       │   │   │   ├── conflict-graph-builder.ts
│       │   │   │   ├── edge-creator.ts
│       │   │   │   └── allocator/
│       │   │   │       ├── time-slot-allocator.ts
│       │   │   │       ├── vertex-factory.ts
│       │   │   │       └── constrains/   ← 9 restricciones modulares
│       │   │   ├── schedule-solver.ts    ← orquesta BFS + coloreo
│       │   │   └── scheduler-builder.ts ← genera HorarioSemanal
│       │   │
│       │   ├── student/
│       │   │   ├── student-schedule.solver.ts
│       │   │   ├── builders/day-subgraph.builder.ts
│       │   │   ├── strategies/
│       │   │   │   ├── dijkstra.strategy.ts
│       │   │   │   └── back-tracking.strategy.ts
│       │   │   ├── contraints/   ← 6 restricciones del horario personal
│       │   │   └── metrics/schedule.metrics.ts
│       │   │
│       │   └── models/           ← tipos e interfaces TypeScript
│       │
│       ├── api/                  ← servidor Express (REST API)
│       │   ├── server.ts
│       │   ├── routes/
│       │   ├── controller/
│       │   └── service/
│       │       ├── schedule.service.ts  ← endpoints de horario y análisis
│       │       └── student.service.ts
│       │
│       ├── frontend/front-universidad-clases/  ← React + Vite
│       │   └── src/
│       │       └── components/
│       │           └── Análisis/  ← ConflictGraphView, AlgorithmComparisonView, GraphStatsView
│       │
│       ├── compare-scenarios.ts  ← evaluación experimental: 3 escenarios × 3 algoritmos
│       ├── test-algorithms.ts
│       └── DEFINICION.MD         ← especificación técnica completa
│
├── PROJECT_REQUIREMENTS_AUDIT.md
└── package.json
```

---

## Conjuntos de Datos

Todos los datasets están en `src/universidad-proyecto/data/`.

| Archivo | Materias | Salones | Franjas/día | Descripción |
|---------|----------|---------|-------------|-------------|
| `data.json` | 35 | 33 (23N + 10L) | 8 | Escenario 1 — escala completa, 3 carreras, 2 semestres |
| `data2.json` | 35 | 33 (23N + 10L) | 8 | Escenario 2 — validación de reproducibilidad |
| `data3.json` | 12 | 11 (8N + 3L) | 6 | Escenario 3 — prueba de estrés: pocas franjas, profesores compartidos |

Carreras modeladas: **Sistemas**, **Electrónica**, **Industrial**

Sedes físicas: **A**, **B**, **C** — con pisos del 1 al 7

---

## Requisitos Previos

- **Node.js 18 o superior**
- **npm**

Para verificar:

```bash
node --version   # debe mostrar v18.x.x o superior
npm --version
```

---

## Instalación

Desde la raíz del repositorio:

```bash
npm install
```

---

## Cómo Ejecutar

### Opción 1 — Comparación experimental de escenarios (recomendado para evaluación)

Ejecuta los 3 escenarios contra los 3 algoritmos de coloreo y muestra métricas
cuantitativas: salones usados, porcentaje de ocupación, tiempo de ejecución y
conflictos resueltos respecto a una asignación naive de referencia.

```bash
npm run compare:scenarios
```

Salida esperada:

```
══════════════════════════════════════════════════════════════════════════
  COMPARACIÓN DE ESCENARIOS — 3 datasets × 3 algoritmos
══════════════════════════════════════════════════════════════════════════

  Escenario 1 — Full Scale (data.json)
  35 materias · 33 salones (23N+10L) · 8 franjas/día · 3 carreras, 2 semestres
  Vértices: 476  |  Aristas: 3558  |  Salones disponibles: 33
  Conflictos en asignación naive (round-robin): 80

  Algoritmo       Colores   Uso%     Válido   Tiempo       Conf. resueltos
  ──────────────────────────────────────────────────────────────────────
  Voraz           26        78.8%    ✅        ~7 ms        80 / 80
  Welsh-Powell    26        78.8%    ✅        ~13 ms       80 / 80
  D-Satur         26        78.8%    ✅        ~26 ms       80 / 80
  ...
```

---

### Opción 2 — API REST + interfaz gráfica

El sistema completo incluye un backend Express y una interfaz React con visualización
interactiva del grafo de conflictos, comparación de algoritmos y estadísticas.

**Paso 1 — Iniciar el backend:**

```bash
npm run dev:scheduler
# Servidor en http://localhost:3002
```

Endpoints disponibles:

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/health` | Estado del servidor |
| GET | `/api/schedule` | Horario semanal completo (D-Satur) |
| GET | `/api/schedule/graph-data` | Nodos, aristas y estadísticas del grafo coloreado |
| GET | `/api/schedule/algorithm-comparison` | Comparación Greedy / Welsh-Powell / D-Satur |
| POST | `/api/student/schedule` | Horario personal optimizado para un estudiante |
| GET | `/api/student/schedule/:id` | Recuperar horario de un estudiante ya procesado |

**Paso 2 — Iniciar el frontend (en otra terminal):**

```bash
cd src/universidad-proyecto/frontend/front-universidad-clases
npm install
npm run dev
# Interfaz en http://localhost:5173
```

La interfaz tiene tres vistas principales:

- **Horario** — tabla semanal con salones y franjas asignadas.
- **Estudiante** — formulario para ingresar materias y obtener el horario
  personal optimizado (Dijkstra + Backtracking).
- **Análisis** — visualización interactiva del grafo de conflictos con tres sub-vistas:
  - *Grafo de Conflictos*: nodos coloreados por salón, aristas por tipo de conflicto,
    filtro por semestre, toggle antes/después del coloreo.
  - *Estadísticas*: densidad, componentes conexas, ocupación de salones.
  - *Comparación de Algoritmos*: gráfica SVG con tiempos y salones usados
    para los tres algoritmos.

**Ejemplo de solicitud de horario para un estudiante:**

```bash
curl -X POST http://localhost:3002/api/student/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "estudianteId": "EST-001",
    "materias": ["SIS-ALG", "SIS-BD1", "SIS-SO1", "SIS-MAT1"]
  }'
```

El sistema devuelve los bloques asignados junto con métricas:
- Total de bloques en el horario.
- Número de cambios de sede entre clases consecutivas.
- Costo total del camino (Dijkstra).
- Sedes utilizadas en la semana.
- Materias que no pudieron asignarse (si las hay).

---

### Opción 3 — Prueba rápida de algoritmos

Ejecuta los tres algoritmos de coloreo sobre el dataset principal y muestra
colores usados y validez de cada solución:

```bash
npx tsx src/universidad-proyecto/test-algorithms.ts
```

---

## Resultados Experimentales

Resultados representativos sobre el Escenario 1 (476 vértices, 3558 aristas):

| Algoritmo | Salones usados | Ocupación | Válido | Tiempo | Conflictos resueltos |
|-----------|---------------|-----------|--------|--------|----------------------|
| Greedy | 26 / 33 | 78.8% | ✅ | ~7 ms | 80 / 80 (100%) |
| Welsh-Powell | 26 / 33 | 78.8% | ✅ | ~13 ms | 80 / 80 (100%) |
| D-Satur | 26 / 33 | 78.8% | ✅ | ~26 ms | 80 / 80 (100%) |

- Los tres algoritmos producen soluciones válidas (0 conflictos) en todos los escenarios.
- El pre-procesamiento con **ConnectedComponents (BFS)** permite que cada componente
  independiente reutilice los mismos salones, reduciendo el total usado.
- D-Satur tarda ~4× más que Greedy por recalcular la saturación en cada iteración,
  pero muestra ventaja en grafos más densos donde el orden de coloreo importa más.

Para el análisis completo de métricas y umbrales, ver [`DEFINICION.MD`](src/universidad-proyecto/DEFINICION.MD).

---

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Lenguaje | TypeScript (strict mode) |
| Runtime | Node.js + `tsx` |
| Backend | Express |
| Frontend | React + Vite + Cytoscape.js |
| Datos | JSON |
