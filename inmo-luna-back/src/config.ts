import dotenv from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Cargar el .env único de la raíz del monorepo.
// En Docker las variables llegan por entorno y este archivo no existe: no pasa nada.
dotenv.config({ path: join(__dirname, "../../.env") });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "Falta la variable DATABASE_URL. Copiá .env.example a .env o configurala en el entorno.",
  );
}

export const config = {
  port: Number(process.env.PORT ?? 3001),
  adminUser: process.env.ADMIN_USER ?? "admin",
  adminPass: process.env.ADMIN_PASS ?? "luna2026",
  jwtSecret: process.env.JWT_SECRET ?? "secret_key",
  databaseUrl,
  uploadDir: process.env.UPLOAD_DIR ?? join(__dirname, "../uploads"),
  maxFileSize: Number(process.env.MAX_FILE_SIZE ?? 5 * 1024 * 1024),
  maxImagesPerRequest: Number(process.env.MAX_IMAGES_PER_REQUEST ?? 10),
};
