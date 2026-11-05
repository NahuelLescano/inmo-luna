import { mkdirSync, writeFileSync, unlinkSync, existsSync } from "fs";
import { join } from "path";
import { randomUUID } from "crypto";
import { config } from "../config.js";

const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export function ensureUploadDir(): void {
  mkdirSync(config.uploadDir, { recursive: true });
}

export function mimeExtension(mimeType: string): string | null {
  return MIME_EXTENSIONS[mimeType] ?? null;
}

export function saveBuffer(buffer: Buffer, extension: string): string {
  ensureUploadDir();
  const filename = `${randomUUID()}${extension}`;
  writeFileSync(join(config.uploadDir, filename), buffer);
  return filename;
}

export function deleteStoredFile(filename: string): void {
  const path = join(config.uploadDir, filename);
  if (existsSync(path)) {
    try {
      unlinkSync(path);
    } catch (error) {
      console.warn(`No se pudo eliminar ${path}:`, error);
    }
  }
}

export function imageUrl(filename: string): string {
  return `/uploads/${filename}`;
}
