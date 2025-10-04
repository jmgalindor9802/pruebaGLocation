import { env } from "./env.js";

const proyectoSchema = {
  type: "object",
  properties: {
    id: {
      type: "string",
      format: "uuid",
      example: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    },
    nombre: {
      type: "string",
      example: "Rediseño del sitio web corporativo",
    },
    descripcion: {
      type: "string",
      example: "Actualizar la experiencia digital para nuevos clientes.",
    },
    estado: {
      type: "string",
      example: "En progreso",
    },
    fechaInicio: {
      type: "string",
      format: "date",
      example: "2024-05-01",
    },
    fechaFin: {
      type: "string",
      format: "date",
      nullable: true,
      example: "2024-07-30",
    },
    presupuesto: {
      type: "string",
      example: "150000.00",
      nullable: true,
    },
    createdAt: {
      type: "string",
      format: "date-time",
    },
    updatedAt: {
      type: "string",
      format: "date-time",
    },
  },
};

const proyectoInputSchema = {
  type: "object",
  required: ["nombre", "fechaInicio", "estado"],
  properties: {
    nombre: {
      type: "string",
      minLength: 3,
      maxLength: 120,
      example: "Rediseño del sitio web corporativo",
    },
    descripcion: {
      type: "string",
      nullable: true,
    },
    estado: {
      type: "string",
      example: "En progreso",
    },
    fechaInicio: {
      type: "string",
      format: "date",
      example: "2024-05-01",
    },
    fechaFin: {
      type: "string",
      format: "date",
      nullable: true,
      example: "2024-07-30",
    },
    presupuesto: {
      type: "number",
      nullable: true,
      example: 150000,
    },
  },
};

export const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "API de Gestión de Proyectos",
    version: "1.0.0",
    description:
      "API REST para gestionar proyectos con operaciones CRUD y funcionalidades adicionales.",
  },
  servers: [
    {
      url: `http://localhost:${env.port}`,
      description: "Servidor local",
    },
  ],
  tags: [
    {
      name: "Proyectos",
      description: "Operaciones relacionadas con la gestión de proyectos",
    },
  ],
  paths: {
    "/proyectos": {
      get: {
        tags: ["Proyectos"],
        summary: "Listar proyectos",
        responses: {
          200: {
            description: "Listado de proyectos",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Proyecto" },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Proyectos"],
        summary: "Crear un proyecto",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProyectoInput" },
            },
          },
        },
        responses: {
          201: {
            description: "Proyecto creado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Proyecto" },
              },
            },
          },
          400: {
            description: "Error de validación",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    errores: {
                      type: "array",
                      items: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/proyectos/{id}": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "Identificador del proyecto",
          schema: {
            type: "string",
            format: "uuid",
          },
        },
      ],
      get: {
        tags: ["Proyectos"],
        summary: "Obtener un proyecto",
        responses: {
          200: {
            description: "Proyecto encontrado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Proyecto" },
              },
            },
          },
          404: {
            description: "Proyecto no encontrado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    mensaje: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
      put: {
        tags: ["Proyectos"],
        summary: "Actualizar un proyecto",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProyectoInput" },
            },
          },
        },
        responses: {
          200: {
            description: "Proyecto actualizado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Proyecto" },
              },
            },
          },
          400: {
            description: "Error de validación",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    errores: {
                      type: "array",
                      items: { type: "string" },
                    },
                  },
                },
              },
            },
          },
          404: {
            description: "Proyecto no encontrado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    mensaje: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Proyectos"],
        summary: "Eliminar un proyecto",
        responses: {
          204: {
            description: "Proyecto eliminado",
          },
          404: {
            description: "Proyecto no encontrado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    mensaje: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Proyecto: proyectoSchema,
      ProyectoInput: proyectoInputSchema,
    },
  },
};
