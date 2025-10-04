import { ValidationError } from "sequelize";
import {
  crearProyectoService,
  listarProyectosService,
  obtenerProyectoPorIdService,
  actualizarProyectoService,
  eliminarProyectoService,
  obtenerDatosGraficosService,
  generarAnalisisProyectosService,
} from "../services/proyecto.service.js";

const parseValidationError = (error) => {
  if (!(error instanceof ValidationError)) return null;
  return error.errors.map((item) => item.message);
};

// Crear un proyecto
export const crearProyecto = async (req, res, next) => {
  try {
    const proyecto = await crearProyectoService(req.body);
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

// Listar proyectos
export const listarProyectos = async (req, res, next) => {
  try {
    const proyectos = await listarProyectosService();
    res.json(proyectos);
  } catch (error) {
    next(error);
  }
};

// Obtener datos para gráficos
export const obtenerDatosGraficos = async (req, res, next) => {
  try {
    const proyectosPorEstado = await obtenerDatosGraficosService();
    res.json({ proyectosPorEstado });
  } catch (error) {
    next(error);
  }
};

// Obtener proyecto por ID
export const obtenerProyectoPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const proyecto = await obtenerProyectoPorIdService(id);

    if (!proyecto) {
      res.status(404).json({ mensaje: "Proyecto no encontrado" });
      return;
    }

    res.json(proyecto);
  } catch (error) {
    next(error);
  }
};

// Actualizar proyecto
export const actualizarProyecto = async (req, res, next) => {
  try {
    const { id } = req.params;
    const proyectoActualizado = await actualizarProyectoService(id, req.body);

    if (!proyectoActualizado) {
      res.status(404).json({ mensaje: "Proyecto no encontrado" });
      return;
    }

    res.json(proyectoActualizado);
  } catch (error) {
    const validationMessages = parseValidationError(error);
    if (validationMessages) {
      res.status(400).json({ errores: validationMessages });
      return;
    }
    next(error);
  }
};

// Eliminar proyecto
export const eliminarProyecto = async (req, res, next) => {
  try {
    const { id } = req.params;
    const eliminado = await eliminarProyectoService(id);

    if (!eliminado) {
      res.status(404).json({ mensaje: "Proyecto no encontrado" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Generar análisis con IA (principal)
export const generarAnalisis = async (req, res, next) => {
  try {
    const resultado = await generarAnalisisProyectosService();
    res.json(resultado);
  } catch (error) {
    next(error);
  }
};
