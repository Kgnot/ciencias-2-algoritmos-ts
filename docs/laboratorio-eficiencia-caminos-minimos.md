# Laboratorio de eficiencia: caminos más cortos

## Objetivo

Comparar los algoritmos de caminos más cortos trabajados en el proyecto según:

- caso de uso
- complejidad teórica
- eficiencia práctica esperada

## Algoritmos analizados

### Dijkstra

- Caso de uso: un solo origen hacia múltiples destinos, con pesos no negativos.
- Complejidad teórica: `O((V + E) log V)` con cola de prioridad; en esta implementación concreta es peor porque la prioridad se simula con un arreglo ordenado en cada iteración.
- Eficiencia: alta en grafos dispersos y cuando solo interesa una fuente.

### Bellman-Ford

- Caso de uso: un solo origen cuando existen pesos negativos o se quiere detectar ciclos negativos.
- Complejidad teórica: `O(V * E)`.
- Eficiencia: más lenta que Dijkstra en casi todos los escenarios, pero más robusta por su soporte de pesos negativos.

### Floyd-Warshall

- Caso de uso: todos los pares origen-destino, especialmente en grafos pequeños o densos.
- Complejidad teórica: `O(V^3)`.
- Eficiencia: la menos escalable de las tres en tamaño, pero muy útil cuando se requieren muchas consultas entre pares.

## Criterio de laboratorio

El laboratorio del proyecto debe medir tiempo de construcción/ejecución sobre grafos sintéticos que reflejen cada escenario natural:

- Dijkstra sobre grafos dispersos con pesos no negativos.
- Bellman-Ford sobre grafos dispersos con algunos pesos negativos y sin ciclos negativos.
- Floyd-Warshall sobre grafos densos.

La comparación más honesta no es forzar los tres algoritmos al mismo tipo de grafo, sino evaluar cada uno en el contexto para el que fue diseñado.

## Cómo ejecutarlo

```bash
npm run lab:shortest-paths
```

## Interpretación esperada

1. Dijkstra debería mostrar el mejor tiempo para un solo origen en grafos dispersos sin pesos negativos.
2. Bellman-Ford debería ser más lento, pero sigue siendo la opción correcta cuando aparecen pesos negativos.
3. Floyd-Warshall debería crecer más rápido que los otros dos y reservarse para problemas de todos los pares en grafos pequeños o medianos.

## Observación importante

La implementación actual de Dijkstra en el proyecto usa un arreglo con ordenamiento para simular la cola de prioridad. Para un laboratorio académico está bien, pero si se busca una medición más fiel a la versión óptima del algoritmo, conviene reemplazar esa estructura por un heap binario real.