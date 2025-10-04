# Plataforma de gestión de proyectos con IA

Este repositorio contiene un proyecto **fullstack** que centraliza la gestión de proyectos, expone una API REST en Node.js/Express con PostgreSQL + Sequelize y ofrece una interfaz web responsiva en React que consume los servicios para mostrar tablas, gráficos y resúmenes generados con IA (Gemini).

## Tabla de contenidos
- [Arquitectura general](#arquitectura-general)
- [Requerimientos previos](#requerimientos-previos)
- [Ejecución rápida con Docker Compose](#ejecución-rápida-con-docker-compose)
- [Ejecución manual](#ejecución-manual)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [Configuración de la IA generativa](#configuración-de-la-ia-generativa)
- [Documentación de la API](#documentación-de-la-api)
  - [Recursos CRUD](#recursos-crud)
  - [Endpoints analíticos](#endpoints-analíticos)
  - [Ejemplos de peticiones y respuestas](#ejemplos-de-peticiones-y-respuestas)
- [Características de la interfaz web](#características-de-la-interfaz-web)
- [Capturas de pantalla](#capturas-de-pantalla)
- [Decisiones técnicas clave](#decisiones-técnicas-clave)
- [Scripts útiles](#scripts-útiles)

## Arquitectura general

| Capa      | Tecnología principal | Descripción |
|-----------|----------------------|-------------|
| Backend   | Node.js 22 + Express 5 | API REST con operaciones CRUD para la entidad `Proyecto`, documentación Swagger y endpoints adicionales para métricas y análisis con IA. |
| Base de datos | PostgreSQL 15 + Sequelize | ORM responsable de modelar la tabla `proyectos`, ejecutar validaciones y exponer consultas agregadas. |
| Frontend  | React 19 + Vite + Bootstrap 5 | SPA responsiva que permite crear, editar y eliminar proyectos, visualizar gráficos dinámicos y consultar el resumen generado por IA. |

```
frontend (React)  ⇄  backend (Express + Swagger)  ⇄  PostgreSQL (Sequelize)
                                 ↓
                           Gemini API (IA)
```

## Requerimientos previos

- [Docker](https://docs.docker.com/engine/install/) y [Docker Compose](https://docs.docker.com/compose/install/) recomendados para un arranque rápido.
- Alternativamente, Node.js ≥ 20 y npm ≥ 10 para ejecutar backend y frontend de manera manual.
- Clave válida de la API de Gemini (Google AI Studio) para habilitar el resumen automático.

## Ejecución rápida con Docker Compose

1. Clona el repositorio y navega al directorio raíz:

   ```bash
   git clone https://github.com/jmgalindor9802/pruebaGLocation.git
   cd pruebaGLocation
   ```

2. Actualiza la variable `AI_API_KEY` en `docker-compose.yml` con tu credencial real (puedes usar un archivo `.env` externo si lo prefieres).
3. Levanta toda la plataforma:

   ```bash
   docker compose up --build
   ```

4. Servicios disponibles:
   - **Backend**: http://localhost:3000 (Swagger en `/docs`).
   - **Frontend**: http://localhost:5173.
   - **Base de datos**: puerto 5432 (contenedor `postgres_glocation`).

5. Detén y limpia los contenedores:

   ```bash
   docker compose down
   ```

## Ejecución manual

### Backend

1. Instala dependencias:

   ```bash
   cd backend
   npm install
   ```

2. Define las variables de entorno (archivo `.env` o variables exportadas):

   ```bash
   DATABASE_URL=postgresql://usuario:clave@localhost:5432/glocationdb
   PORT=3000
   AI_API_KEY=tu-clave-gemini
   AI_MODEL=gemini-2.5-flash
   ```

3. Ejecuta el servidor en modo desarrollo:

   ```bash
   npm run dev
   ```

   El backend se conectará a PostgreSQL, sincronizará el modelo `Proyecto` y expondrá los endpoints en `http://localhost:3000`.

### Frontend

1. Instala dependencias:

   ```bash
   cd frontend
   npm install
   ```

2. (Opcional) Crea un archivo `.env` en `frontend/` para apuntar al backend:

   ```bash
   VITE_API_URL=http://localhost:3000
   ```

3. Levanta el servidor de desarrollo de Vite:

   ```bash
   npm run dev
   ```

   La interfaz estará disponible en `http://localhost:5173` y recargará automáticamente los cambios.

## Configuración de la IA generativa

- El servicio `backend/services/analisis.service.js` consume la API de Gemini.
- Variables necesarias:
  - `AI_API_KEY`: clave de Google AI Studio.
  - `AI_MODEL`: modelo a utilizar (por defecto `gemini-2.5-flash`).
- Si la llamada a la IA falla o no se configura la clave, el backend entrega un resumen alternativo calculado localmente y expone el error para facilitar el diagnóstico.

## Documentación de la API

La documentación completa (OpenAPI 3.0) está disponible en `http://localhost:3000/docs` gracias a Swagger UI. También se expone el JSON en `http://localhost:3000/docs.json` para integraciones automáticas.

### Recursos CRUD

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET    | `/proyectos` | Lista todos los proyectos. |
| POST   | `/proyectos` | Crea un proyecto. |
| GET    | `/proyectos/{id}` | Obtiene un proyecto por identificador. |
| PUT    | `/proyectos/{id}` | Actualiza un proyecto existente. |
| DELETE | `/proyectos/{id}` | Elimina un proyecto. |

Los atributos gestionados son: `nombre`, `descripcion`, `estado`, `fechaInicio`, `fechaFin`.

### Endpoints analíticos

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/proyectos/graficos` | Devuelve conteos de proyectos agrupados por estado (`{ estado, cantidad }`). |
| GET | `/proyectos/analisis` | Genera un resumen del portafolio y descripciones por proyecto (utiliza IA + *fallback*). |
| GET | `/analisis` | Alias del endpoint anterior, utilizado por el frontend. |
| GET | `/graficos` | Alias del endpoint de métricas para el frontend. |

### Ejemplos de peticiones y respuestas

**Crear un proyecto**

```bash
curl -X POST http://localhost:3000/proyectos \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Implementación CRM",
    "descripcion": "Migración del CRM a la nube",
    "estado": "En progreso",
    "fechaInicio": "2024-01-15",
    "fechaFin": "2024-03-30"
  }'
```

**Respuesta 201**

```json
{
  "id": 3,
  "nombre": "Implementación CRM",
  "descripcion": "Migración del CRM a la nube",
  "estado": "En progreso",
  "fechaInicio": "2024-01-15",
  "fechaFin": "2024-03-30",
  "updatedAt": "2024-02-02T16:45:10.832Z",
  "createdAt": "2024-02-02T16:45:10.832Z"
}
```

**Listar proyectos**

```bash
curl http://localhost:3000/proyectos
```

**Respuesta 200**

```json
[
  {
    "id": 3,
    "nombre": "Implementación CRM",
    "descripcion": "Migración del CRM a la nube",
    "estado": "En progreso",
    "fechaInicio": "2024-01-15",
    "fechaFin": "2024-03-30",
    "createdAt": "2024-02-02T16:45:10.832Z",
    "updatedAt": "2024-02-02T16:45:10.832Z"
  }
]
```

**Resumen con IA**

```bash
curl http://localhost:3000/analisis
```

**Respuesta 200 (formato resumido)**

```json
{
  "resumen": "El portafolio mantiene 1 proyecto en progreso enfocado en migrar el CRM a la nube.",
  "proyectosAnalizados": [
    {
      "id": 3,
      "nombre": "Implementación CRM",
      "descripcion": "Migración del CRM a la nube",
      "estado": "En progreso",
      "descripcionIA": "Implementación CRM avanza según lo planificado; el equipo está migrando el CRM a la nube para mejorar la escalabilidad."
    }
  ]
}
```

## Características de la interfaz web

- Tabla dinámica con acciones de creación, edición y eliminación (modales accesibles, validaciones y alertas).
- Gráfico responsivo de barras que muestra la distribución de proyectos por estado (actualizado automáticamente tras cada cambio).
- Panel de análisis que consulta la API de IA, muestra estados de carga y conserva el último resumen generado.
- UI construida con Bootstrap 5 y estilos personalizados para adaptarse a pantallas móviles y de escritorio.

## Capturas de pantalla

| Desktop | Móvil |
|---------|-------|
| ![Vista desktop](docs/screenshots/dashboard-desktop.png) | ![Vista móvil](docs/screenshots/dashboard-mobile.png) |

> Las capturas son representativas de la disposición final de la interfaz (encabezado, tabla, gráfico y panel de análisis).

## Decisiones técnicas clave

- **Express 5 + Sequelize**: ofrece una base madura para CRUD y facilita validaciones y consultas agregadas sin escribir SQL manual.
- **Swagger UI**: se expone desde el mismo servidor (`/docs`) para que QA y terceros consuman la API sin herramientas externas.
- **Fallback de IA**: ante errores con Gemini, el servicio genera descripciones locales para evitar interrumpir el flujo del frontend.
- **React + Bootstrap**: garantiza componentes responsivos y reutilizables, permitiendo manejar formularios y modales con estado centralizado.
- **docker-compose**: orquesta Postgres, backend y frontend para acelerar el despliegue local y evaluar toda la solución.

## Scripts útiles

- `docker compose up --build`: levanta todos los servicios.
- `docker compose down`: detiene la solución completa.
- `npm run dev` (en `backend/`): inicia el backend en modo desarrollo.
- `npm run dev` (en `frontend/`): inicia la aplicación React con Vite.
- `npm run lint` (en `frontend/`): ejecuta ESLint sobre el código del cliente.

¡Listo! Con esta guía puedes instalar, ejecutar y validar todas las características solicitadas en la prueba.