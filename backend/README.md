# Backend - Gestión de Proyectos

API REST construida con Node.js, Express y Sequelize para gestionar proyectos, exponer métricas agregadas y generar resúmenes con IA.

## Características principales

- CRUD completo de proyectos almacenados en PostgreSQL.
- Documentación interactiva con Swagger disponible en `/docs`.
- Endpoint `/graficos` con datos agregados para visualizaciones.
- Endpoint `/analisis` que genera resúmenes mediante la API de Gemini (IA generativa) con manejo de *fallback* en caso de error.
- Validaciones de modelo con Sequelize y manejo centralizado de errores.

## Estructura relevante

```
backend/
├── config/
│   ├── database.js      # Inicializa Sequelize y la conexión a PostgreSQL
│   ├── env.js           # Lee y valida variables de entorno
│   └── swagger.js       # Esquema OpenAPI 3.0
├── controllers/         # Controladores Express para cada endpoint
├── models/              # Definiciones de modelos Sequelize (Proyecto)
├── routes/              # Rutas agrupadas por recurso
├── services/            # Capa de servicios (CRUD, IA, agregaciones)
├── index.js             # Punto de entrada del servidor Express
└── Dockerfile           # Imagen base usada por docker-compose
```

## Requisitos previos

- [Docker](https://docs.docker.com/engine/install/) y [Docker Compose](https://docs.docker.com/compose/install/) instalados.
- Clave válida para la API de Gemini (Google AI Studio) si se desea habilitar el resumen automático.

## Configuración de variables de entorno

El módulo `config/env.js` lee las variables desde `process.env` y detiene el arranque si faltan valores obligatorios.

Cuando se usa Docker Compose ya se definen en `docker-compose.yml`:

```yaml
  backend:
    environment:
      DATABASE_URL: "postgresql://admin:admin123@db:5432/glocationdb"
      PORT: 3000
      AI_API_KEY: "reemplaza-con-tu-clave-real"
      AI_MODEL: "gemini-2.5-flash"
```

> **Importante:** sustituye `AI_API_KEY` por tu credencial real antes de levantar el servicio. Si prefieres ejecutar fuera de Docker, crea un archivo `.env` o exporta las variables manualmente.

## Base de datos

- Motor: PostgreSQL 15 (contenedor `db`).
- Usuario por defecto: `admin`
- Contraseña: `admin123`
- Base de datos: `glocationdb`

Sequelize crea automáticamente la tabla `proyectos` al iniciar gracias a `sequelize.sync()`.

##  Ejecución con Docker Compose

Desde la raíz del repositorio:

1. Asegúrate de haber actualizado la clave `AI_API_KEY` en `docker-compose.yml`.
2. Construye e inicia solo los servicios de base de datos y backend:

   ```bash
   docker compose up --build db backend
   ```

   > Si necesitas toda la aplicación (backend + frontend), puedes omitir los nombres y ejecutar `docker compose up --build`.

3. Una vez levantado, el backend estará disponible en `http://localhost:3000`.

   - Salud básica: `GET http://localhost:3000/`
   - Documentación Swagger: `http://localhost:3000/docs`
   - Esquema JSON de la documentación: `http://localhost:3000/docs.json`

Para detener los contenedores:

```bash
docker compose down
```

## Ejecución local sin Docker (opcional)

1. Instala dependencias:

   ```bash
   cd backend
   npm install
   ```

2. Define las variables de entorno (por ejemplo creando un archivo `.env` o exportándolas en tu terminal). Valores mínimos:

   ```bash
   DATABASE_URL=postgresql://usuario:clave@localhost:5432/glocationdb
   PORT=3000
   AI_API_KEY=tu-clave-gemini
   AI_MODEL=gemini-2.5-flash
   ```

3. Ejecuta el servidor:

   ```bash
   npm run dev
   ```

## Endpoints principales

| Método | Ruta                | Descripción                                             |
|--------|--------------------|---------------------------------------------------------|
| GET    | `/proyectos`       | Lista todos los proyectos                              |
| POST   | `/proyectos`       | Crea un proyecto                                       |
| GET    | `/proyectos/{id}`  | Obtiene un proyecto por ID                             |
| PUT    | `/proyectos/{id}`  | Actualiza un proyecto existente                        |
| DELETE | `/proyectos/{id}`  | Elimina un proyecto                                    |
| GET    | `/proyectos/graficos` | Devuelve conteo de proyectos agrupados por estado   |
| GET    | `/proyectos/analisis` | Resumen con IA de los proyectos registrados          |
| GET    | `/analisis`        | Resumen global con IA (alias usado por el frontend)    |
| GET    | `/graficos`        | Datos agregados para visualizaciones                   |

Las respuestas y ejemplos detallados están disponibles en la documentación Swagger.

## Integración con IA

El servicio `services/analisis.service.js` consume el modelo configurado en `AI_MODEL` usando la clave `AI_API_KEY`. Ante un fallo en la llamada a Gemini, la API responde igualmente con descripciones generadas manualmente como *fallback* y detalla el error recibido.

## Scripts disponibles

Dentro del contenedor (o ejecutando localmente):

- `npm run dev`: inicia el servidor Express en modo desarrollo.

