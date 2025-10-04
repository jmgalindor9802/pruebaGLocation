import { Router } from "express";
import {
  actualizarProyecto,
  crearProyecto,
  eliminarProyecto,
  listarProyectos,
  obtenerProyectoPorId,
} from "../controllers/proyectos.controller.js";

const router = Router();

router.post("/", crearProyecto);
router.get("/", listarProyectos);
router.get("/:id", obtenerProyectoPorId);
router.put("/:id", actualizarProyecto);
router.delete("/:id", eliminarProyecto);

export default router;