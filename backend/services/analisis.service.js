export const buildPromptForProyectos = (proyecto = {}) => {
    const prompt = [
        "Eres un analista especializado en generar resúmenes de proyectos.",
        "Utiliza la información proporcionada para crear un resumen claro y directo.",
    ];

    const { nombre, descripcion, estado, objetivo, resumen } = proyecto;

    if (nombre) {
        prompt.push(`Nombre del proyecto: ${nombre}`);
    }

    if (descripcion) {
        prompt.push(`Descripción: ${descripcion}`);
    }

    if (estado) {
        prompt.push(`Estado: ${estado}`);
    }

    if (objetivo) {
        prompt.push(`Objetivo: ${objetivo}`);
    }

    if (resumen) {
        prompt.push(`Resumen disponible: ${resumen}`);
    }

    prompt.push("y reflejar el estado y propósito del proyecto. No inventes datos.");

    return prompt;
};