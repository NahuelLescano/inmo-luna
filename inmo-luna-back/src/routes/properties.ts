import { Router } from "express";
import { config } from "../config.js";
import { Property, PropertyImage } from "../db/models/index.js";
import { verifyToken } from "../middleware/auth.js";
import { uploadImages } from "../middleware/upload.js";
import { deleteStoredFile, imageUrl } from "../lib/storage.js";

export const propertiesRouter = Router();

interface PropertyInput {
  titulo: string;
  tipo: "venta" | "alquiler";
  precio: number;
  moneda: string;
  habitaciones: number;
  banos: number;
  m2: number;
  ubicacion: string;
  descripcion: string;
}

function parseId(value: string): number {
  return Number.parseInt(value, 10);
}

function readInput(body: Record<string, unknown>): PropertyInput {
  return {
    titulo: String(body.titulo ?? "").trim(),
    tipo: body.tipo === "alquiler" ? "alquiler" : "venta",
    precio: Number(body.precio ?? 0),
    moneda: String(body.moneda ?? "USD"),
    habitaciones: Number(body.habitaciones ?? 0),
    banos: Number(body.banos ?? 0),
    m2: Number(body.m2 ?? 0),
    ubicacion: String(body.ubicacion ?? "").trim(),
    descripcion: String(body.descripcion ?? "").trim(),
  };
}

function toDTO(property: Property) {
  return {
    id: property.id,
    titulo: property.titulo,
    tipo: property.tipo,
    precio: Number(property.precio),
    moneda: property.moneda,
    habitaciones: property.habitaciones,
    banos: property.banos,
    m2: property.m2,
    ubicacion: property.ubicacion,
    descripcion: property.descripcion,
    imagenes: (property.imagenes ?? []).map((image) => ({
      id: image.id,
      url: imageUrl(image.filename),
      orden: image.orden,
    })),
  };
}

const includeImages = {
  model: PropertyImage,
  as: "imagenes",
};

async function findProperty(id: number): Promise<Property | null> {
  return Property.findByPk(id, {
    include: [{ ...includeImages }],
    order: [[{ model: PropertyImage, as: "imagenes" }, "orden", "ASC"]],
  });
}

// GET - Listar todas las propiedades
propertiesRouter.get("/", async (_req, res) => {
  const properties = await Property.findAll({
    include: [{ ...includeImages }],
    order: [
      ["id", "ASC"],
      [{ model: PropertyImage, as: "imagenes" }, "orden", "ASC"],
    ],
  });

  res.json(properties.map(toDTO));
});

// GET - Obtener una propiedad por ID
propertiesRouter.get("/:id", async (req, res) => {
  const property = await findProperty(parseId(String(req.params.id)));

  if (!property) {
    res.status(404).json({ error: "Propiedad no encontrada" });
    return;
  }

  res.json(toDTO(property));
});

// POST - Crear propiedad (protegido)
propertiesRouter.post("/", verifyToken, async (req, res) => {
  const input = readInput(req.body ?? {});

  if (!input.titulo || !input.ubicacion) {
    res.status(400).json({ error: "Título y ubicación son obligatorios" });
    return;
  }

  const property = await Property.create(input);
  res.status(201).json(toDTO(property));
});

// PUT - Editar propiedad (protegido)
propertiesRouter.put("/:id", verifyToken, async (req, res) => {
  const property = await findProperty(parseId(String(req.params.id)));

  if (!property) {
    res.status(404).json({ error: "Propiedad no encontrada" });
    return;
  }

  await property.update(readInput(req.body ?? {}));

  const updated = await findProperty(property.id);
  res.json(toDTO(updated ?? property));
});

// POST - Subir imágenes (protegido)
propertiesRouter.post(
  "/:id/images",
  verifyToken,
  uploadImages.array("imagenes", config.maxImagesPerRequest),
  async (req, res) => {
    const property = await findProperty(parseId(String(req.params.id)));

    if (!property) {
      const files = (req.files as Express.Multer.File[] | undefined) ?? [];
      files.forEach((file) => deleteStoredFile(file.filename));
      res.status(404).json({ error: "Propiedad no encontrada" });
      return;
    }

    const files = (req.files as Express.Multer.File[] | undefined) ?? [];

    if (files.length === 0) {
      res.status(400).json({ error: "No se recibieron imágenes" });
      return;
    }

    const maxOrder = (await PropertyImage.max("orden", {
      where: { propertyId: property.id },
    })) as number | null;
    let orden = (maxOrder ?? -1) + 1;

    await PropertyImage.bulkCreate(
      files.map((file) => ({
        propertyId: property.id,
        filename: file.filename,
        mimeType: file.mimetype,
        size: file.size,
        orden: orden++,
      })),
    );

    const updated = await findProperty(property.id);
    res.status(201).json(toDTO(updated ?? property));
  },
);

// DELETE - Eliminar una imagen (protegido)
propertiesRouter.delete("/:propertyId/images/:imageId", verifyToken, async (req, res) => {
  const propertyId = parseId(String(req.params.propertyId));
  const imageId = parseId(String(req.params.imageId));

  const image = await PropertyImage.findOne({
    where: { id: imageId, propertyId },
  });

  if (!image) {
    res.status(404).json({ error: "Imagen no encontrada" });
    return;
  }

  deleteStoredFile(image.filename);
  await image.destroy();

  const property = await findProperty(propertyId);
  res.json(property ? toDTO(property) : { ok: true });
});

// DELETE - Eliminar propiedad e imágenes (protegido)
propertiesRouter.delete("/:id", verifyToken, async (req, res) => {
  const property = await findProperty(parseId(String(req.params.id)));

  if (!property) {
    res.status(404).json({ error: "Propiedad no encontrada" });
    return;
  }

  for (const image of property.imagenes ?? []) {
    deleteStoredFile(image.filename);
  }

  await property.destroy();
  res.json({ ok: true });
});
