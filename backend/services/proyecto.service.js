import { sequelize } from "../config/database.js";
import { Proyecto } from "../models/proyecto.model.js";
import { generarResumenConIA } from "./analisis.service.js";

export const crearProyectoService = async (data) => {
  return await Proyecto.create(data);
};

export const listarProyectosService = async () => {
  return await Proyecto.findAll({ order: [["createdAt", "DESC"]] });
};

export const obtenerProyectoPorIdService = async (id) => {
  return await Proyecto.findByPk(id);
};

export const actualizarProyectoService = async (id, data) => {
  const proyecto = await Proyecto.findByPk(id);
  if (!proyecto) return null;
  await proyecto.update(data);
  return proyecto;
};

export const eliminarProyectoService = async (id) => {
  const proyecto = await Proyecto.findByPk(id);
  if (!proyecto) return null;
  await proyecto.destroy();
  return true;
};

export const obtenerDatosGraficosService = async () => {
  const resultados = await Proyecto.findAll({
    attributes: ["estado", [sequelize.fn("COUNT", sequelize.col("id")), "cantidad"]],
    group: ["estado"],
    order: [["estado", "ASC"]],
    raw: true,
  });

  return resultados.map((item) => ({
    estado: item.estado,
    cantidad: Number(item.cantidad),
  }));
};

export const generarAnalisisProyectosService = async () => {
  const proyectos = await Proyecto.findAll({
    attributes: ["id", "nombre", "descripcion", "estado"],
    order: [["createdAt", "DESC"]],
  });

  if (!proyectos.length) {
    return {
      resumen: "Aún no hay proyectos registrados para analizar.",
      proyectosAnalizados: [],
    };
  }

  const proyectosPlano = proyectos.map((proyecto) => proyecto.toJSON());

  try {
    // Llamada al servicio de Gemini (IA)
    const { resumen, descripciones } = await generarResumenConIA(proyectosPlano);

    // Vincular cada descripción generada con su ID
    const proyectosConDescripcion = proyectosPlano.map((proyecto) => {
      const descripcionGenerada = descripciones.find(
        (item) => String(item.id) === String(proyecto.id)
      );

      return {
        ...proyecto,
        descripcionIA: descripcionGenerada
          ? descripcionGenerada.descripcion
          : null,
      };
    });

    return { resumen, proyectosAnalizados: proyectosConDescripcion };
  } catch (errorIA) {
    console.warn("⚠️ No fue posible generar el análisis con IA:", errorIA);

    // 🧩 Fallback: crear descripciones manuales si falla la IA
    const proyectosFallback = proyectosPlano.map((proyecto) => ({
      ...proyecto,
      descripcionIA: proyecto.descripcion
        ? `${proyecto.nombre} se encuentra ${proyecto.estado.toLowerCase()} y tiene como objetivo ${proyecto.descripcion}.`
        : `${proyecto.nombre} se encuentra ${proyecto.estado.toLowerCase()} y aún no cuenta con una descripción detallada.`,
    }));

    return {
      resumen:
        "No fue posible generar el resumen automático. Verifica la configuración de la IA y vuelve a intentarlo.",
      proyectosAnalizados: proyectosFallback,
      error: errorIA.message,
    };
  }
};
