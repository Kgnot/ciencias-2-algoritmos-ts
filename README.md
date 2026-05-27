# Academic Scheduling — Graph Coloring

Assigns classrooms to university course blocks by modeling the problem as graph coloring: each block is a vertex, conflicts (same time slot, same semester, or same professor) are edges, and classrooms are colors. Three heuristic algorithms are compared across multiple scenarios.

## Prerequisites

- Node.js 18+
- npm

## Setup

```bash
npm install
```

## Running

### Backend (REST API + scheduling engine)

```bash
npm run dev:scheduler
# Server starts on http://localhost:3002
```

### Frontend (React + Vite)

```bash
cd src/universidad-proyecto/frontend/front-universidad-clases
npm install
npm run dev
# Opens on http://localhost:5173
```

### Algorithm Comparison (3 scenarios × 3 algorithms)

```bash
npm run compare:scenarios
# or: npx tsx src/universidad-proyecto/compare-scenarios.ts
```

## Datasets

| File | Materias | Salones | Franjas/día | Description |
|------|----------|---------|-------------|-------------|
| `data.json` | 60 | 50 (40N + 10L) | 8 | Full scale — 3 careers, 10 semesters |
| `data2.json` | 35 | 30 (20N + 10L) | 8 | 3 careers, 2 semesters, higher group density |
| `data3.json` | 12 | 11 (8N + 3L) | 6 | Stress test — 1 career, shared professors |

All datasets are in `src/universidad-proyecto/data/`.

## Algorithms

| Algorithm | Type | Role |
|-----------|------|------|
| **Greedy (Voraz)** | Heuristic | Baseline — assigns first available classroom |
| **Welsh-Powell** | Heuristic | Orders vertices by degree descending before coloring |
| **D-Satur** | Heuristic | Prioritizes vertices with most already-colored neighbors (best quality) |

A BFS-based **Connected Components** decomposition runs before all coloring algorithms, decomposing the conflict graph into independent subgraphs so classrooms are reused across non-conflicting parts of the schedule.

## Project Structure

```
src/
  algoritmos/
    coloreado/          # D-Satur, Welsh-Powell, Greedy
    dfs/                # ConnectedComponents (BFS)
  estructuras/          # Graph, Vertex, Edge
  universidad-proyecto/
    data/               # JSON datasets + data loader
    logic/
      schedule/         # ConflictGraphBuilder, ScheduleSolver, EdgeCreator
      models/           # GrupoData, ScheduleInput, FranjaHoraria
    api/                # Express REST API
    frontend/           # React + Vite UI
    compare-scenarios.ts
    test-algorithms.ts
```
