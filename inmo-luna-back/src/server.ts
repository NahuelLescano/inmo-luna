import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { sequelize } from "./db/index.js";
import { authRouter } from "./routes/auth.js";
import { propertiesRouter } from "./routes/properties.js";
import { ensureUploadDir } from "./lib/storage.js";

ensureUploadDir();

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      // Sin Origin (curl, imágenes, mismo origen) siempre se permite.
      if (!origin || config.frontendUrls.length === 0) {
        callback(null, true);
        return;
      }

      const normalized = origin.replace(/\/$/, "");

      if (config.frontendUrls.includes(normalized)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origen no permitido por CORS: ${origin}`));
    },
  }),
);
app.use(express.json());

// Archivos subidos
app.use("/uploads", express.static(config.uploadDir));

// API
app.use("/api", authRouter);
app.use("/api/properties", propertiesRouter);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

// Manejo de errores (multer, validaciones, etc.)
app.use(
  (
    error: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(error);
    res.status(400).json({ error: error.message || "Error en la solicitud" });
  },
);

await sequelize.authenticate();
console.log("Conexión a PostgreSQL establecida.");

app.listen(config.port, () => {
  console.log(`Servidor corriendo en http://localhost:${config.port}`);
});
