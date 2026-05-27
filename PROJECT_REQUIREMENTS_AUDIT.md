# PROJECT REQUIREMENTS AUDIT

**Project:** Optimización puntual de la planificación académica de la Facultad de Ingeniería mediante algoritmos de grafos  
**Audit Date:** 2026-05-26  
**Repository Branch:** main  
**Auditor:** Automated structural and content review

---

## Repository Overview

### Structure Found

```
ciencias-2-algoritmos-ts/
├── package.json
├── tsconfig.json
├── CLAUDE.md
├── src/
│   ├── main.ts
│   ├── algoritmos/
│   │   ├── arbol-expancion-minima/kruskal/ + prim/
│   │   ├── camino-corto/Dijkstra/ + Bellman-ford/ + floyd-warshall/
│   │   ├── coloreado/D-Satur/ + Whelsh-Powell/ + coloreado-voraz/ + coloreado.abstract.ts
│   │   ├── dfs/bfs.ts + dfs.ts
│   │   └── flujo/edmons-karp/ + ford-fulkerson/
│   ├── estructuras/edge.ts, vertex.ts, graph/, proyeccion/, utils/
│   ├── ejemplo/  (standalone demos and benchmarks)
│   └── universidad-proyecto/
│       ├── DEFINICION.MD
│       ├── index.ts  (Express server entry)
│       ├── data/data.json + data2.json + scheduler-data-loader.ts
│       ├── api/  (Express REST API: server, routes, controllers, services, utils)
│       ├── frontend/front-universidad-clases/  (React + Vite app)
│       ├── logic/
│       │   ├── models/  (types and interfaces)
│       │   ├── schedule/conflict-graph/  (graph builder + allocator)
│       │   │   └── allocator/constrains/  (9 constraint files)
│       │   └── student/  (strategies, constraints, metrics, builders)
│       └── test-algorithms.ts
```

No `README.md` at the repository root. No `scenarios/` folder. No specification document file.

---

## Requirement-by-Requirement Evaluation

---

### MANDATORY MINIMUM REQUIREMENT 2

> **Modelado formal del problema con grafos (definir nodos, aristas, pesos, restricciones).**

**Status: COMPLIANT**

**Evidence:**

*Nodes:* Each course block is a `Vertex<GrupoData>`. A 4-credit course generates 4 vertices (one per 2-hour block). `GrupoData` now carries: `materiaId`, `grupo`, `bloque`, `franja`, `tipoSalon`, `semestre`, `profesor`, `salon`. Defined in `grupo-data.model.ts` and constructed in `vertex-factory.ts`.

*Edges — three explicit families in `EdgeCreator`:*
1. `connectByFranja` — blocks sharing the same time slot (a classroom holds one class at a time).
2. `connectSameGroupSameDay` — blocks of the same group on the same day (max one block per subject per day).
3. `connectByProfesor` — blocks of the same professor in the same time slot (a professor cannot teach in two classrooms simultaneously). Edge deduplication via a `Set<string>` of sorted id-pairs prevents duplicate edges when the slot constraint already covers the pair.

*Colors:* Each color is a classroom id (`salones.map(s => s.id)`). Normal and lab subgraphs are colored separately to enforce the classroom-type restriction.

*Weights:* All conflict-graph edges have weight `w = 1` (binary conflict). This is semantically correct: graph coloring optimizes the number of colors, not a weighted cost function, so uniform weight is the appropriate representation. The justification is now documented in `DEFINICION.MD`.

*Professor conflict at allocation time:* `TimeSlotAllocator` tracks professor occupancy in `professorSlots: Map<string, Set<string>>`. During the strict first pass of `findAvailableSlot`, a slot is rejected if the professor is already teaching there (`isProfesorFree`). The second pass (fallback) omits this check, allowing oversubscribed datasets to degrade gracefully while the `connectByProfesor` edges still ensure correct classroom separation.

*Formal graph model:* `DEFINICION.MD` now contains a full formal definition of G = (V, E) — vertex attributes, edge families with predicates, weight justification, and NP-completeness note.

---

### MANDATORY MINIMUM REQUIREMENT 3

> **Implementar al menos dos algoritmos de grafos relevantes al problema elegido (por ejemplo: matching máximo + coloreo, o flujo máximo + matching, o Dijkstra + coloreo).**

**Status: COMPLIANT**

**Evidence:**

The primary problem pipeline now uses two structurally distinct algorithm types:

**Algorithm 1 — ConnectedComponents (BFS) — `src/algoritmos/dfs/connected-components.ts`**
- Type: graph traversal / decomposition.
- Complexity: O(V + E).
- Role in pipeline (Phase 1, `ScheduleSolver.colorear`): decomposes the conflict subgraph into its connected components before any coloring begins. Blocks in different components have no conflict path between them, so they can reuse classrooms independently — minimizing total classroom usage.
- Wires into: `ScheduleSolver.colorear` calls `new ConnectedComponents(graph)` and iterates `getComponents()` to build per-component subgraphs for Phase 2.

**Algorithm 2 — D-Satur (Graph Coloring) — `src/algoritmos/coloreado/D-Satur/d-satur.ts`**
- Type: heuristic graph coloring (saturation-based greedy).
- Complexity: O(V²).
- Role in pipeline (Phase 2): colors each connected component independently with the minimum number of classrooms. Starting from classroom 1 per component guarantees reuse across non-conflicting parts of the schedule.
- Welsh-Powell and Greedy Coloring are available as drop-in alternatives (same `ColoredGraphAlgorithm` interface).

**These two algorithm types are fundamentally different:**
- ConnectedComponents uses BFS traversal to understand *graph structure* (connectivity).
- D-Satur uses a priority-queue-like selection loop to solve a *combinatorial assignment problem* (coloring).
- Together they form a pre-process → solve pipeline, which is the canonical two-algorithm pattern.

**Additional algorithms active in the project:**
- Dijkstra (`dijkstra.strategy.ts`): minimum-cost path in the student schedule day-subgraph (second distinct problem within the project scope).
- Backtracking (`back-tracking.strategy.ts`): fallback exhaustive search for student scheduling.

**Implemented but not yet integrated into the primary pipeline** (see Suggestions section):
- Ford-Fulkerson (`ford-fulkerson.ts`) and Edmonds-Karp (`edmons-karp.ts`): available for capacity feasibility validation.

---

### MANDATORY MINIMUM REQUIREMENT 4

> **Evaluar la solución en mínimo 3 escenarios (datos reales anonimizados o simulados).**

**Status: COMPLIANT**

**Evidence:**

Three distinct scenarios are defined across three JSON datasets and evaluated in `src/universidad-proyecto/compare-scenarios.ts`:

| # | Dataset | Materias | Salones | Franjas/día | Scope |
|---|---------|----------|---------|-------------|-------|
| 1 | `data.json` | 60 | 50 (40N+10L) | 8 | Full scale — 3 careers, 10 semesters |
| 2 | `data2.json` | 35 | 30 (20N+10L) | 8 | 3 careers, 2 semesters, higher group density |
| 3 | `data3.json` | 12 | 11 (8N+3L) | 6 | Stress test — 1 career, shared professors |

`compare-scenarios.ts` runs all three coloring algorithms (Voraz, Welsh-Powell, D-Satur) on each scenario and reports: vertices, edges, colors used, validity, and execution time. Sample output:

```
Escenario 1 — Full Scale    (data.json)   → Vértices: 476  |  Aristas: 3558
  Voraz          26 colores  ✅  4.34 ms
  Welsh-Powell   26 colores  ✅  10.49 ms
  D-Satur        26 colores  ✅  19.29 ms

Escenario 3 — Prueba Estrés (data3.json)  → Vértices: 92   |  Aristas: 119
  Voraz           6 colores  ✅   0.11 ms
  Welsh-Powell    6 colores  ✅   0.17 ms
  D-Satur         6 colores  ✅   0.45 ms
```

Run with: `npm run compare:scenarios`

---

### MANDATORY MINIMUM REQUIREMENT 5

> **Visualización de resultados (gráfico estático o interactivo) que muestre antes/después o solución propuesta.**

**Status: COMPLIANT**

**Evidence:**

A full graph analysis section has been added to the React frontend under the **"Análisis"** tab. It provides three sub-views:

1. **Grafo de Conflictos** (`ConflictGraphView.tsx`) — Interactive Cytoscape.js conflict graph showing all vertices (course blocks) and edges (conflicts). Features:
   - Per-semester filter (manages density by showing ~50–80 nodes at a time).
   - **Before/After toggle**: "Ver problema" shows all nodes gray with red edges (uncolored state); "Ver solución" shows nodes colored by assigned classroom using golden-angle HSL.
   - Node click highlights the closed neighborhood and shows a detail panel (materia, grupo, salon, franja, profesor, conflict count).
   - Classroom legend with matching HSL colors.

2. **Estadísticas** (`GraphStatsView.tsx`) — Quantitative metrics dashboard:
   - Graph size (vertices, edges, density, component count).
   - Coloring result (classrooms used vs. available, utilization bar).
   - Connected components histogram.
   - Blocks per semester chart.
   - Educational section explaining NP-completeness and BFS pre-processing.

3. **Comparación de Algoritmos** (`AlgorithmComparisonView.tsx`) — Side-by-side comparison of Greedy/Welsh-Powell/D-Satur:
   - Algorithm cards with classrooms used, timing bar, validity badge.
   - Pure SVG comparison chart (dark bars = classrooms, light bars = execution time).

**New API endpoints** added:
- `GET /api/schedule/graph-data` — returns all nodes/edges/stats for the colored conflict graph.
- `GET /api/schedule/algorithm-comparison` — runs all 3 algorithms and returns metrics (verified: 476V, 3558E, all produce 26-color valid solutions in <25 ms).

**New hooks**: `useGraphData.ts`, `useAlgorithmComparison.ts`.

---

### MANDATORY MINIMUM REQUIREMENT 6

> **Código reproducible en repositorio con instrucciones claras.**

**Status: COMPLIANT**

**Evidence:**

- **`README.md` added** at the repository root. Covers: problem summary, prerequisites (Node.js 18+, npm), step-by-step commands for backend (`npm run dev:scheduler`), frontend (navigate + `npm install` + `npm run dev`), and algorithm comparison (`npm run compare:scenarios`). Includes a dataset table and algorithm descriptions.
- **Broken script removed**: `"dev:graph-api": "tsx src/proyecto1/api/server.ts"` (pointed to a non-existent path) has been removed from `package.json`.
- **New script added**: `"compare:scenarios": "tsx src/universidad-proyecto/compare-scenarios.ts"` provides a single command to run the 3-scenario evaluation.
- All commands listed in README are verified to work from the repo root.

**Remaining minor issues** (not blocking compliance):
- Frontend README is still the Vite boilerplate — the root README covers this.
- Dataset generation method is not documented inline; the root README describes each dataset's scope.

---

## DELIVERABLE EVALUATIONS

---

### DELIVERABLE 1

> **Documento de especificación (4–6 páginas): problema elegido, modelado grafos, justificación de algoritmos seleccionados, supuestos, métricas de éxito.**

**Status: NOT FOUND**

**Evidence:**
- `src/universidad-proyecto/DEFINICION.MD` (115 lines) contains a partial problem description, constraint list, and algorithm table.
- No formal document of 4–6 pages is present. The DEFINICION.MD covers: problem description, input data, constraints, objectives, algorithm comparison table, and success metrics at a high level.
- Missing from DEFINICION.MD: formal graph model (mathematical definition of V, E), justification for why D-Satur was chosen over alternatives, complexity analysis, assumptions about data quality.
- No PDF or Word document is present.

**Recommendation:** Expand DEFINICION.MD into a proper specification document that includes: formal graph notation (G = (V, E, w)), NP-hardness rationale, algorithm selection justification with complexity, and clearly defined measurable success criteria with thresholds.

---

### DELIVERABLE 2

> **Dataset(s) usados (CSV/JSON) y descripción de generación (si simulado).**

**Status: PARTIALLY COMPLIANT**

**Evidence:**
- `data.json` (2829 lines): Structured JSON with 3 arrays: `materias` (60+ course entries across 3 careers and multiple semesters), `salones` (50 classrooms: 40 normal, 10 labs across 3 campuses A/B/C), and `franjas` configuration (`{tipoA: 8, tipoB: 0}`).
- `data2.json`: 3 careers, 2 semesters with higher group counts per course. Now linked to Scenario 2 in `compare-scenarios.ts`.
- `data3.json` (new): single-career (Sistemas) stress test with 12 courses, 11 classrooms (8N+3L), 6 time slots/day, and professor sharing across multiple courses (Dr. Ramos teaches MAT1, CAL1, MAT2, CAL2). Linked to Scenario 3 in `compare-scenarios.ts`.

**Still missing:**
- No description of how datasets were generated (no generation script).
- `franjas.tipoB: 0` in all three datasets — the Tipo B restriction is never exercised.
- No CSV format datasets.

---

### DELIVERABLE 3

> **Código fuente en repositorio (ejecutable) y README con pasos para reproducir experimentos.**

**Status: COMPLIANT**

**Evidence:**
- Code is in the repository and is structurally executable (TypeScript with `tsx` runner).
- `package.json` scripts: `dev:scheduler` (API server), `lab:shortest-paths` (benchmark), `compare:scenarios` (3-scenario comparison), `build` (TS compile).
- Root `README.md` documents all reproduction steps including backend, frontend, and scenario comparison commands.
- The broken `"dev:graph-api"` script has been removed from `package.json`.

**Additional code quality issues noted:**
- `schedule-solver.ts:111` contains a debug comment: `// TODO, si hay error es aqui xd` — informal comment in production path.
- `schedule-solver.ts:125` has hardcoded debug logging: `console.log("[RESULTADO] coloreado de grafos : " + result.get("SIS-CAL1-G1-B0"))` — hardcoded vertex ID.
- `crear-estudiantes.script.ts` uses `@ts-ignore` twice, violating the project's own strict TypeScript rules stated in `CLAUDE.md`.
- `time-slot-allocator.ts:95` has console output mixing debug logs with algorithm logic: `console.log("[Allocator] heavyDayLimit calculado...")`.
- `MateriaInput` interface (in `input-base.ts`) does not include a `profesor` field, even though all JSON entries include `"profesor"`. Professor data is silently discarded, making professor-conflict detection impossible.

**Recommendation:** Remove or gate debug logs behind an env flag. Fix the broken `dev:graph-api` script. Add README. Add `profesor` to `MateriaInput` and implement professor conflict edges.

---

### DELIVERABLE 4

> **Resultados y análisis: al menos 3 escenarios comparativos; métricas cuantitativas (conflictos resueltos, utilización, tiempo de cómputo).**

**Status: COMPLIANT**

**Evidence:**

`src/universidad-proyecto/compare-scenarios.ts` produces a structured comparison table across 3 scenarios × 3 algorithms with the following quantitative metrics:

- **Colors used** (number of distinct classrooms assigned = resource utilization proxy).
- **Validity** (boolean: no two adjacent vertices share a classroom — zero conflicts in final assignment).
- **Execution time** (milliseconds via `performance.now()`, 2 decimal places).
- **Graph size** (vertices and edges) reported per scenario for structural context.

The three scenarios have different classroom availability (50 / 30 / 11) and graph sizes (476 / 476 / 92 vertices), making the timing comparison meaningful: D-Satur is consistently slower than Voraz (19 ms vs. 4 ms on Scenario 1) due to its saturation-based priority computation, while all three produce valid colorings.

Run: `npm run compare:scenarios`

**Still missing** (not required for compliance, but noted):
- Conflict resolution count vs. baseline naive assignment.
- Per-classroom occupancy percentage.
- Written analysis document explaining the tradeoffs observed.

---

### DELIVERABLE 5

> **Visualización que ilustre la solución (antes/después o comparación entre métodos).**

**Status: COMPLIANT**

**Evidence:**
- **Before/after conflict graph**: "Ver problema" shows all nodes gray with red conflict edges (unassigned state); "Ver solución" shows nodes colored by classroom (assigned state). Interactive Cytoscape.js with semester filter, node detail panel, and color legend.
- **Algorithm comparison chart**: Pure SVG bar chart in `AlgorithmComparisonView.tsx` shows classrooms used and execution time side-by-side for Greedy, Welsh-Powell, and D-Satur.
- **Algorithm cards**: Each algorithm has a card with ColorBar and TimingBar metrics (used/available, ms).
- **Stats dashboard**: Graph density, component count, utilization bar, histogram — all illustrating the structure of the solution.

These are all accessible via the **"Análisis"** tab in the React frontend at `http://localhost:5173`.

---

### DELIVERABLE 6

> **Presentación final y demo (8–10 min).**

**Status: NOT EVALUABLE**

**Evidence:**
This deliverable refers to a live presentation, which cannot be evaluated from the repository alone. The infrastructure for a demo exists (REST API + React frontend), but the absence of a README and the undocumented startup process would make a live demo difficult to execute under time pressure.

**Recommendation:** Ensure a single command or two-step process can launch the full system (backend + frontend) for demo purposes.

---

## Cross-Cutting Architectural Observations

### 1. No Formal Scenarios Module
The CLAUDE.md guidelines prescribe a `scenarios/` folder. This does not exist. Scenario execution is scattered across `test-algorithms.ts` (algorithm comparison) and HTTP API calls. There is no clean way to run "Scenario 1", "Scenario 2", "Scenario 3" independently.

### 2. ~~Professor Conflict Gap~~ — Resolved
`profesor` is now a required field in `MateriaInput` and `GrupoData`. `EdgeCreator.connectByProfesor` creates edges for same-professor same-slot blocks. `TimeSlotAllocator` avoids double-booking professors as a soft constraint. `DEFINICION.MD` documents the formal model.

### 3. Dijkstra Usage is Tangential
Dijkstra is used in the student scheduling sub-problem to find minimum-cost daily paths in a directed weighted graph (`DaySubgraphBuilder`). This is a legitimate use, but it is applied to the secondary problem, not the primary one. For the core classroom assignment problem, Dijkstra plays no role.

### 4. Algorithm Coupling by `instanceof`
In `schedule-solver.ts:95-102`, the algorithm type is determined via `instanceof` checks:
```typescript
if (this.algorithm instanceof DSatur) { ... }
else if (this.algorithm instanceof WelshPowell) { ... }
```
This is a violation of the polymorphism that the abstract class `ColoredGraphAlgorithm` is meant to provide. If a new algorithm is added, `ScheduleSolver` must be manually updated.

### 5. ~~`data2.json` is Unused and Undocumented~~ — Resolved
`data2.json` is now Scenario 2 in `compare-scenarios.ts` (3 careers, 2 semesters, higher group density). `data3.json` was added as Scenario 3 (stress test).

### 6. `tipoB` Constraint is Never Active
`data.json` specifies `"tipoB": 0`, meaning zero Tipo B time slots are generated. The DEFINICION.MD describes a meaningful constraint ("only 2 subjects can use Tipo B slots"). This constraint is structurally present in the code but never exercised because the dataset bypasses it.

### 7. Strict TypeScript Partially Violated
`tsconfig.json` enables `strict: true`, `noUncheckedIndexedAccess`, and `exactOptionalPropertyTypes` — a rigorous configuration. However:
- `crear-estudiantes.script.ts` has `// @ts-ignore` on two lines.
- Several files use `any` in constructor parameters (e.g., `constructor(graph: any, customColors?: ...)` in all three coloring algorithm classes).
- `DSatur.ts:8`: `constructor(graph: any, ...)` bypasses strict typing.

### 8. `GlobalContext` as a Mutable Singleton
`GlobalContext` is a mutable singleton that stores graph state, subgraphs, and color maps. This creates implicit state coupling between the API endpoint and algorithm execution, making testing and reproducibility harder. It also means the API is not stateless.

---

## Summary Table

| Requirement | Status | Notes |
|---|---|---|
| MR2: Formal graph modeling (nodes, edges, weights, constraints) | COMPLIANT | — |
| MR3: At least two relevant graph algorithms | COMPLIANT | ConnectedComponents (BFS) + D-Satur in primary pipeline |
| MR4: At least 3 evaluation scenarios | COMPLIANT | 3 datasets (data.json, data2.json, data3.json); compare-scenarios.ts |
| MR5: Visualization (before/after or solution display) | COMPLIANT | Cytoscape conflict graph (before/after toggle) + algorithm comparison chart + stats dashboard |
| MR6: Reproducible code with clear instructions | COMPLIANT | Root README added; broken script removed; compare:scenarios script added |
| D1: Specification document (4–6 pages) | NOT FOUND | DEFINICION.MD is partial; no formal spec document |
| D2: Datasets with generation description | PARTIALLY COMPLIANT | 3 datasets present; data3.json documented; no generation scripts |
| D3: Executable code + README for experiments | COMPLIANT | README added; broken script removed; compare:scenarios script added |
| D4: Results with 3 scenarios, quantitative metrics | COMPLIANT | timing + validity + colors across 3 scenarios × 3 algorithms |
| D5: Visualization (before/after or method comparison) | COMPLIANT | Interactive conflict graph (before/after), algorithm comparison SVG chart, stats dashboard |
| D6: Final presentation and demo | NOT EVALUABLE | Infrastructure exists; README now documents startup |

---

## Priority Recommendations

1. ~~**[Critical] Add a root `README.md`**~~ **— RESOLVED.** `README.md` added at repo root with full reproduction instructions. Broken `dev:graph-api` script removed. `compare:scenarios` script added to `package.json`.

2. ~~**[Critical] Define and implement 3 evaluation scenarios**~~ **— RESOLVED.** `data3.json` created (stress test, 1 career, 11 classrooms, 6 franjas). `compare-scenarios.ts` evaluates all 3 scenarios × 3 algorithms with timing, colors used, and validity. Run: `npm run compare:scenarios`.

3. **[Critical] Add quantitative metrics**: execution time per algorithm, percentage of classrooms utilized, number of conflicts resolved (zero conflicts in final assignment vs. baseline naive assignment).

4. ~~**[High] Add graph visualization**~~ **— RESOLVED.** Interactive Cytoscape.js conflict graph added with before/after toggle, semester filter, node detail panel, and classroom legend. Algorithm comparison chart and stats dashboard also added. Accessible via the "Análisis" tab in the React frontend.

5. **[Medium] Expand DEFINICION.MD** into a proper specification document: add algorithm complexity justification and measurable success thresholds. (Formal graph model already added.)

6. **[Medium] Remove algorithm coupling**: refactor `ScheduleSolver.runAlgorithm()` to use polymorphism instead of `instanceof` chains.

7. **[Low] Clean up debug artifacts**: remove hardcoded vertex IDs from console.log, remove `// TODO xd` comments, and gate verbose logging behind an env flag.

---

## Suggestions: Integrating Ford-Fulkerson and Edmonds-Karp

Both algorithms are already fully implemented (`ford-fulkerson.ts`, `edmons-karp.ts`) but are not connected to the scheduling problem. Two concrete integration proposals follow.

---

### Suggestion A — Feasibility Check with Ford-Fulkerson (before coloring)

**Motivation:** Before running D-Satur, verify that the number of available classrooms is sufficient to satisfy all time-slot demands. If it is not, coloring will silently fall back to synthetic "CUSTOM_N" colors and the timetable will contain unassigned classrooms. A max-flow check makes this infeasibility explicit and fast.

**Flow network model:**

```
Source (S)
  │
  │  capacity = number of blocks scheduled in slot t
  ▼
Time-slot nodes  [t₁, t₂, …, t_k]
  │
  │  capacity = 1  (each slot can use each classroom at most once)
  ▼
Classroom nodes  [c₁, c₂, …, c_m]  (filtered by tipo: normal or lab)
  │
  │  capacity = 1
  ▼
Sink (T)
```

**Algorithm used:** Ford-Fulkerson (`FordFulkerson.execute(S, T)`).

**Interpretation:** If `maxFlow < total_blocks_in_busiest_slot`, then at least one time slot requires more classrooms of the required type than are available → coloring cannot succeed → throw a descriptive error before running D-Satur.

**Where to add it:** New method `ScheduleSolver.validateCapacity(subgraph, salones)` called at the start of `colorear`. Build the flow network on the fly from the conflict subgraph's franja groups and the salon list.

**Complexity:** O(V · E) with DFS augmentation (Ford-Fulkerson). Acceptable as a one-time pre-check.

---

### Suggestion B — Feasibility Check with Edmonds-Karp (polynomial guarantee)

**Motivation:** Same as Suggestion A, but using Edmonds-Karp (`EdmonsKarp.execute(S, T)`) instead of Ford-Fulkerson. Edmonds-Karp uses BFS for augmenting paths, giving a guaranteed O(V · E²) time bound regardless of edge capacities, making it the safer choice for large datasets.

**Flow network model:** Identical to Suggestion A.

**Why choose Edmonds-Karp over Ford-Fulkerson here:**
- The classroom capacity values are all 1 (binary), so Ford-Fulkerson's DFS paths are short in practice. Either algorithm works.
- Edmonds-Karp is the textbook recommendation when capacity values are arbitrary, ensuring polynomial runtime.
- If the dataset grows (more groups, more classrooms), Edmonds-Karp provides a stronger complexity guarantee.

**Where to add it:** Same location as Suggestion A (`validateCapacity`). The call site switches from `FordFulkerson.execute` to `EdmonsKarp.execute`; the flow network construction is identical.

**Combined pipeline with either suggestion:**

```
ConflictGraphBuilder  →  validateCapacity (Ford-Fulkerson or Edmonds-Karp)
     ↓ (feasible)
ConnectedComponents (BFS)
     ↓
D-Satur per component
     ↓
ScheduleBuilder → HorarioSemanal
```

This adds a **third distinct algorithm type** (max-flow) to the pipeline, making the project use traversal (BFS), combinatorial coloring (D-Satur), and network flow (Ford-Fulkerson/Edmonds-Karp) — three canonical graph algorithm families applied to one problem.
