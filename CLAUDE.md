# Project Context

This project focuses on solving a real academic planning optimization problem for the Engineering Faculty using graph algorithms.

The implementation must prioritize:
- readability,
- simplicity,
- modularity,
- reproducibility,
- and educational clarity.

The project follows a structure similar to:
https://github.com/Kgnot/ciencias-2-algoritmos-ts/

The codebase is intended for academic evaluation, algorithm analysis, experimentation, and presentation.

---

# Main Objective

Solve ONE realistic academic scheduling/resource allocation problem using graph theory and graph algorithms.

Examples:
- classroom assignment,
- conflict-free schedule generation,
- professor-course assignment,
- resource distribution,
- movement minimization between buildings.

The chosen problem must:
- be formally modeled as a graph,
- include constraints,
- include weighted or unweighted relationships when appropriate,
- and be evaluated experimentally.

---

# Mandatory Technical Requirements

The implementation must include:

- Formal graph modeling:
  - nodes,
  - edges,
  - weights,
  - constraints.

- At least TWO graph algorithms relevant to the selected problem.

Examples:
- graph coloring,
- maximum bipartite matching,
- max flow,
- shortest paths,
- heuristics,
- conflict graphs.

- At least 3 evaluation scenarios.

- Quantitative metrics:
  - conflicts resolved,
  - resource utilization,
  - execution time,
  - assignment quality,
  - etc.

- Visualization support:
  - static or interactive graphs,
  - before/after comparison,
  - or algorithm comparison.

- Reproducible execution.

---

# Code Style Rules

The project MUST prioritize readability and simplicity over cleverness.

Avoid:
- overengineering,
- unnecessary abstractions,
- excessive generics,
- deeply nested logic,
- large monolithic files,
- unnecessary design patterns.

Prefer:
- explicit logic,
- descriptive variable names,
- small focused functions,
- modular organization,
- straightforward implementations.

Code should be understandable by undergraduate students.

---

# File Organization Rules

Algorithms MUST be separated into independent files.

Example:
- one file per algorithm,
- one file per graph structure,
- one file per dataset utility,
- one file per visualization utility.

DO NOT implement multiple unrelated algorithms in a single file.

Preferred structure example:

src/
  algorithms/
    graphColoring.ts
    bipartiteMatching.ts
    dijkstra.ts

  models/
    graph.ts
    classroom.ts
    schedule.ts

  scenarios/
    scenario1.ts
    scenario2.ts
    scenario3.ts

  visualization/
    graphVisualization.ts

  utils/
    metrics.ts
    parser.ts

---

# TypeScript Rules

Use strict TypeScript.

Avoid:
- any,
- implicit typing,
- unnecessary type assertions.

Prefer:
- interfaces,
- explicit return types,
- immutable data when possible.

Keep types simple and readable.

---

# Algorithm Implementation Rules

Algorithms must:
- be implemented clearly,
- be easy to trace step-by-step,
- include comments for important logic,
- expose intermediate reasoning when useful.

Prioritize educational clarity over micro-optimizations.

When implementing graph algorithms:
- explain complexity when appropriate,
- keep adjacency structures readable,
- avoid compressed or overly optimized code styles.

---

# Visualization Rules

Visualizations should:
- help compare scenarios,
- illustrate conflicts,
- show assignments,
- or display graph relationships clearly.

Keep visualizations simple and interpretable.

Avoid unnecessary UI complexity.

---

# Experimental Evaluation Rules

Whenever algorithms are compared:
- keep datasets reproducible,
- use deterministic inputs when possible,
- report metrics clearly,
- and explain tradeoffs.

Execution time measurements should remain simple and readable.

---

# Repository and Documentation Rules

The repository must remain reproducible.

Whenever adding features:
- update README if needed,
- document execution steps,
- document datasets,
- document assumptions,
- document algorithm selection rationale.

Do not leave undocumented scripts or hidden dependencies.

---

# Expected Assistant Behavior

Before making large changes:
1. analyze the existing structure,
2. preserve consistency,
3. follow current naming conventions,
4. avoid unnecessary rewrites.

When proposing improvements:
- explain why,
- keep changes incremental,
- and preserve readability.

Do not introduce frameworks or dependencies unless clearly justified.

Prefer consistency with the existing repository structure.