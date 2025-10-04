import { ValidationError } from "sequelize";
import { sequelize } from "../config/database.js";
import { Proyecto } from "../models/proyecto.model.js";
import { generarResumenConIA } from "../services/analisis.service.js";

const parseValidationError = (error) => {
  if (!(error instanceof ValidationError)) return null;
  return error.errors.map((item) => item.message);
};

export const crearProyecto = async (req, res, next) => {
  try {
    const proyecto = await Proyecto.create(req.body);
    res.status(201).json(proyecto);
  } catch (error) {
    const validationMessages = parseValidationError(error);
    if (validationMessages) {
      res.status(400).json({ errores: validationMessages });
      return;
    }
    next(error);
  }
};

export const listarProyectos = async (req, res, next) => {
  try {
    const proyectos = await Proyecto.findAll({ order: [["createdAt", "DESC"]] });
    res.json(proyectos);
  } catch (error) {
    next(error);
  }
};

export const obtenerDatosGraficos = async (req, res, next) => {
  try {
    const resultados = await Proyecto.findAll({
      attributes: [
        "estado",
        [sequelize.fn("COUNT", sequelize.col("id")), "cantidad"],
      ],
      group: ["estado"],
      order: [["estado", "ASC"]],
      raw: true,
    });

    const proyectosPorEstado = resultados.map((item) => ({
      estado: item.estado,
      cantidad: Number(item.cantidad),
    }));

    res.json({ proyectosPorEstado });
  } catch (error) {
    next(error);
  }
};

export const obtenerProyectoPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const proyecto = await Proyecto.findByPk(id);

    if (!proyecto) {
      res.status(404).json({ mensaje: "Proyecto no encontrado" });
      return;
    }

    res.json(proyecto);
  } catch (error) {
    next(error);
  }
};

export const actualizarProyecto = async (req, res, next) => {
  try {
    const { id } = req.params;
    const proyecto = await Proyecto.findByPk(id);

    if (!proyecto) {
      res.status(404).json({ mensaje: "Proyecto no encontrado" });
      return;
    }

    await proyecto.update(req.body);
    res.json(proyecto);
  } catch (error) {
    const validationMessages = parseValidationError(error);
    if (validationMessages) {
      res.status(400).json({ errores: validationMessages });
      return;
    }
    next(error);
  }
};

export const eliminarProyecto = async (req, res, next) => {
  try {
    const { id } = req.params;
    const proyecto = await Proyecto.findByPk(id);

    if (!proyecto) {
      res.status(404).json({ mensaje: "Proyecto no encontrado" });
      return;
    }

    await proyecto.destroy();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
  };

export const generarAnalisis = async (req, res, next) => {
  try {
    const proyectos = await Proyecto.findAll({
      attributes: ["id", "nombre", "descripcion", "estado"],
      order: [["createdAt", "DESC"]],
    });

    if (!proyectos.length) {
      res.json({
        resumen: "Aún no hay proyectos registrados para analizar.",
        proyectosAnalizados: [],
      });
      return;
    }

    const proyectosPlano = proyectos.map((proyecto) => proyecto.toJSON());

    try {
      const { resumen, descripciones } = await generarResumenConIA(proyectosPlano);

      const proyectosConDescripcion = proyectosPlano.map((proyecto) => {
        const descripcionGenerada = descripciones.find((item) => item.id === proyecto.id);

        return {
          ...proyecto,
          descripcionIA: descripcionGenerada?.descripcion ?? null,
        };
      });

      res.json({ resumen, proyectosAnalizados: proyectosConDescripcion });
    } catch (errorIA) {
      console.warn("No fue posible generar el análisis con IA", errorIA);
      res.json({
        resumen:
          "No fue posible generar el resumen automático. Verifica la configuración de la IA y vuelve a intentarlo.",
        proyectosAnalizados: proyectosPlano.map((proyecto) => ({
          ...proyecto,
          descripcionIA:
            proyecto.descripcion
              ? `${proyecto.nombre} se encuentra ${proyecto.estado.toLowerCase()} y tiene como objetivo ${proyecto.descripcion}.`
              : `${proyecto.nombre} se encuentra ${proyecto.estado.toLowerCase()} y aún no cuenta con una descripción detallada.`,
        })),
        error: errorIA.message,
      });
    }
  } catch (error) {
    next(error);
  }
};