import { createBogotaGraphInitializer } from "./graph_builder/initializeBogotaGraph.js";

async function main(): Promise<void> {
	const initializer = createBogotaGraphInitializer({
		maxWalkMin: 20,
		nearestStopsPerSite: 3,
	});

	const bogotaGraph = await initializer.initialize();

	console.log("Grafo inicializado:");
	console.log(`- Vertices de paradas: ${bogotaGraph.stopVertexIds.length}`);
	console.log(`- Vertices de sitios: ${bogotaGraph.siteVertexIds.length}`);
	console.log(`- Total vertices: ${bogotaGraph.graph.vertexCount}`);
	console.log(`- Total aristas: ${bogotaGraph.graph.edgeCount}`);
}

main().catch((error) => {
	console.error("Error inicializando grafo de Bogota:", error);
});
