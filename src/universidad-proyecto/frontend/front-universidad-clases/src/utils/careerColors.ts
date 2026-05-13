// Mapa de colores pastel para cada carrera
const CAREER_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  ELE: {
    bg: "rgba(163, 210, 242, 0.15)",
    border: "#a3d2f2",
    text: "#5a8fb8",
  },
  IND: {
    bg: "rgba(200, 235, 190, 0.15)",
    border: "#c8ebbe",
    text: "#6b9a68",
  },
  MEC: {
    bg: "rgba(255, 223, 168, 0.15)",
    border: "#ffdfb8",
    text: "#c9a060",
  },
  CIV: {
    bg: "rgba(221, 197, 235, 0.15)",
    border: "#ddc5eb",
    text: "#9b7eb8",
  },
  QUI: {
    bg: "rgba(245, 195, 220, 0.15)",
    border: "#f5c3dc",
    text: "#c87ba4",
  },
  AGR: {
    bg: "rgba(200, 235, 190, 0.15)",
    border: "#c8ebce",
    text: "#7aa878",
  },
  BIO: {
    bg: "rgba(176, 224, 230, 0.15)",
    border: "#b0e0e6",
    text: "#5a9ca8",
  },
  SIS: {
    bg: "rgba(216, 191, 216, 0.15)",
    border: "#d8bfd8",
    text: "#9483a4",
  },
};

const DEFAULT_COLOR = {
  bg: "rgba(225, 220, 208, 0.15)",
  border: "#e1dcd0",
  text: "#a39b8f",
};

/**
 * Extrae el código de carrera del vertexId
 * Ej: "ELE-CAL2-G3-B0" -> "ELE"
 */
export function extractCareerCode(vertexId?: string): string {
  if (!vertexId) return "";
  const match = vertexId.match(/^([A-Z]+)-/);
  return match ? match[1] : "";
}

/**
 * Obtiene los colores para una carrera
 */
export function getCareerColors(
  vertexId?: string
): { bg: string; border: string; text: string } {
  const careerCode = extractCareerCode(vertexId);
  return CAREER_COLORS[careerCode] || DEFAULT_COLOR;
}


