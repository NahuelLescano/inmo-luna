import { dirname, join } from "path";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { sequelize } from "./index.js";
import { Property, PropertyImage } from "./models/index.js";
import { saveBuffer, mimeExtension } from "../lib/storage.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = join(__dirname, "../../data/properties.json");

interface SeedProperty {
  id: number;
  titulo: string;
  tipo: "venta" | "alquiler";
  precio: number;
  moneda: string;
  habitaciones: number;
  banos: number;
  m2: number;
  ubicacion: string;
  descripcion: string;
  fotos: string[];
}

async function downloadImage(url: string): Promise<{ filename: string; mimeType: string; size: number } | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;

    const mimeType = res.headers.get("content-type")?.split(";")[0] ?? "image/jpeg";
    const extension = mimeExtension(mimeType);
    if (!extension) return null;

    const buffer = Buffer.from(await res.arrayBuffer());
    const filename = saveBuffer(buffer, extension);

    return { filename, mimeType, size: buffer.length };
  } catch (error) {
    console.warn(`No se pudo descargar ${url}:`, error);
    return null;
  }
}

const existing = await Property.count();

if (existing > 0) {
  console.log(`La base ya tiene ${existing} propiedades. No se ejecuta el seed.`);
  await sequelize.close();
  process.exit(0);
}

const properties = JSON.parse(readFileSync(DATA_FILE, "utf-8")) as SeedProperty[];

for (const item of properties) {
  const property = await Property.create({
    id: item.id,
    titulo: item.titulo,
    tipo: item.tipo,
    precio: item.precio,
    moneda: item.moneda,
    habitaciones: item.habitaciones,
    banos: item.banos,
    m2: item.m2,
    ubicacion: item.ubicacion,
    descripcion: item.descripcion,
  });

  let orden = 0;
  for (const url of item.fotos) {
    const image = await downloadImage(url);
    if (!image) continue;

    await PropertyImage.create({
      propertyId: property.id,
      filename: image.filename,
      mimeType: image.mimeType,
      size: image.size,
      orden,
    });
    orden += 1;
  }

  console.log(`Propiedad "${item.titulo}" creada con ${orden} imagen(es).`);
}

// Ajustar la secuencia de IDs después de insertar IDs explícitos.
await sequelize.query(
  `SELECT setval(pg_get_serial_sequence('properties', 'id'), (SELECT MAX(id) FROM properties));`,
);

console.log("Seed completado.");
await sequelize.close();
