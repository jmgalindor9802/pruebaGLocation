const parseNumber = (value, fallback) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: parseNumber(process.env.PORT, 3000),
    databaseUrl: (() => {
    const value = process.env.DATABASE_URL;
    if (!value) {
      throw new Error(
        'La variable de entorno obligatoria "DATABASE_URL" no está definida. ' +
          "Asegúrate de declararla en tu configuración de contenedor."
      );
    }
    return value;
  })(),
  aiApiKey:
    process.env.AI_API_KEY && process.env.AI_API_KEY.trim() !== ""
      ? process.env.AI_API_KEY
      : null,
  aiModel:
    process.env.AI_MODEL && process.env.AI_MODEL.trim() !== ""
      ? process.env.AI_MODEL
      : "gemini-1.5-flash-latest",
};