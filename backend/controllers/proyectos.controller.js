import { ValidationError } from "sequelize";
import { Proyecto } from "../models/proyecto.model.js";

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