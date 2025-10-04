import { Router } from "express";
import {
  actualizarProyecto,
  crearProyecto,
  generarAnalisis,
  eliminarProyecto,
  obtenerDatosGraficos,
  listarProyectos,
  obtenerProyectoPorId,
} from "../controllers/proyectos.controller.js";

const router = Router();

router.post("/", crearProyecto);
router.get("/", listarProyectos);
router.get("/graficos", obtenerDatosGraficos);
router.get("/analisis", generarAnalisis);
router.get("/:id", obtenerProyectoPorId);
router.put("/:id", actualizarProyecto);
router.delete("/:id", eliminarProyecto);

export default router;