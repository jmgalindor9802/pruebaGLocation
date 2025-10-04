import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env.js";
import { sequelize } from "./config/database.js";
import { swaggerSpec } from "./config/swagger.js";
import "./models/proyecto.model.js";
import proyectosRouter from "./routes/proyectos.routes.js";
import {
  generarAnalisis,
  obtenerDatosGraficos,
} from "./controllers/proyectos.controller.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        mensage: "Backend funcionando 🚀",
        documentacion: "/docs",
    });
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/docs.json", (req, res) => {
    res.json(swaggerSpec);
});

app.use("/proyectos", proyectosRouter);
app.get("/analisis", generarAnalisis);
app.get("/graficos", obtenerDatosGraficos);

app.use((req, res, next) => {
    res.status(404).json({ mensaje: "Recurso no encontrado" });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ mensaje: "Ha ocurrido un error inesperado" });
});

const startServer = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        app.listen(env.port, () => {
            console.log(`Servidor escuchando en http://localhost:${env.port}`);
        });
    } catch (error) {
        console.error("No fue posible inicializar la base de datos", error);
        process.exit(1);
    }
};

startServer();