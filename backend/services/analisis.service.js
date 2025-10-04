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
        "Debes analizar la siguiente lista de proyectos y devolver un JSON válido con la estructura",
        '{"resumen": string, "descripciones": [{"id": number, "descripcion": string}]} sin texto adicional.',
        "Describe cada proyecto con un máximo de 80 palabras manteniendo un tono profesional y positivo.",
        "Proyectos a analizar:",
    ];

    proyectos.forEach((proyecto) => {
        prompt.push("---");
        buildPromptForProyectos(proyecto).forEach((line) => prompt.push(line));
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
            id: Number(item.id),
            descripcion:
                typeof item.descripcion === "string" ? item.descripcion.trim() : null,
        }))
        .filter((item) => Number.isFinite(item.id) && item.descripcion);
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
