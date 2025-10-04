const parseNumber = (value, fallback) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const requireEnv = (value, name) => {
  if (!value) {
    throw new Error(
      `La variable de entorno obligatoria "${name}" no está definida. ` +
        "Asegúrate de declararla en tu configuración de contenedor."
    );
  }
  return value;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: parseNumber(process.env.PORT, 3000),
  databaseUrl: requireEnv(process.env.DATABASE_URL, "DATABASE_URL"),
};