import { env } from "../config/env.js";

const GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com/v1";

export const buildPromptForProyectos = (proyecto = {}) => {
    const prompt = [
        "Eres un analista especializado en generar resúmenes de proyectos.",
        "Utiliza la información proporcionada para crear un resumen claro y directo.",
    ];

    const { nombre, descripcion, estado, objetivo, resumen } = proyecto;

    if (nombre) prompt.push(`Nombre del proyecto: ${nombre}`);
    if (descripcion) prompt.push(`Descripción: ${descripcion}`);
    if (estado) prompt.push(`Estado: ${estado}`);
    if (objetivo) prompt.push(`Objetivo: ${objetivo}`);
    if (resumen) prompt.push(`Resumen disponible: ${resumen}`);

    prompt.push("y reflejar el estado y propósito del proyecto. No inventes datos.");

    return prompt;
};

const buildPromptForAnalisis = (proyectos = []) => {
  const prompt = [
    "Actúa como un analista senior que crea resúmenes ejecutivos de portafolios de proyectos.",
    "Analiza la siguiente lista de proyectos y devuelve un JSON válido con la siguiente estructura:",
    '{"resumen": string, "descripciones": [{"id": string, "descripcion": string}]}',
    "No incluyas texto adicional fuera del JSON.",
    "Para cada proyecto, genera una descripción breve (máximo 80 palabras) que resuma su propósito, estado actual y relevancia.",
    "Luego, incluye un resumen general del portafolio completo.",
    "Proyectos a analizar:",
  ];

  proyectos.forEach((proyecto) => {
    prompt.push("---");
    prompt.push(`ID: ${proyecto.id}`);
    prompt.push(`Nombre: ${proyecto.nombre}`);
    prompt.push(`Descripción: ${proyecto.descripcion}`);
    prompt.push(`Estado: ${proyecto.estado}`);
  });

  prompt.push("---");
  prompt.push("Recuerda responder únicamente con JSON válido.");

  return prompt.join("\n");
};


const limpiarCodigoJson = (texto = "") =>
    texto.replace(/```json/gi, "").replace(/```/g, "").trim();

const normalizarDescripciones = (descripciones = []) => {
  if (!Array.isArray(descripciones)) return [];
  return descripciones
    .map((item = {}) => ({
      id: typeof item.id === "string" ? item.id.trim() : null,
      descripcion:
        typeof item.descripcion === "string" ? item.descripcion.trim() : null,
    }))
    .filter((item) => item.id && item.descripcion);
};


const extraerTextoDeRespuesta = (respuestaJson) => {
    const candidatos = respuestaJson?.candidates;
    if (!Array.isArray(candidatos) || candidatos.length === 0) return null;

    const partes = candidatos[0]?.content?.parts;
    if (!Array.isArray(partes)) return null;

    return partes
        .map((parte) => (typeof parte?.text === "string" ? parte.text : ""))
        .join("\n")
        .trim();
};

export const generarResumenConIA = async (proyectos = []) => {
    if (!env.aiApiKey) {
        throw new Error(
            "La variable de entorno AI_API_KEY es obligatoria para generar el resumen con IA."
        );
    }

    const prompt = buildPromptForAnalisis(proyectos);

    const url = `${GEMINI_API_BASE_URL}/models/${env.aiModel}:generateContent`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": env.aiApiKey,
        },
        body: JSON.stringify({
            contents: [
                {
                    role: "user",
                    parts: [{ text: prompt }],
                },
            ],
        }),
    });


    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
            `La API de Gemini respondió con un estado ${response.status}. Detalle: ${errorBody}`
        );
    }

    const respuestaJson = await response.json();
    const texto = extraerTextoDeRespuesta(respuestaJson);

    if (!texto) throw new Error("La respuesta de la IA no contiene texto interpretable.");

    const textoLimpio = limpiarCodigoJson(texto);

    let parsed;
    try {
        parsed = JSON.parse(textoLimpio);
    } catch (error) {
        throw new Error("No fue posible interpretar la respuesta de la IA como JSON válido.");
    }

    const resumen = typeof parsed.resumen === "string" ? parsed.resumen.trim() : "";
    const descripciones = normalizarDescripciones(parsed.descripciones);

    return { resumen, descripciones };
};
