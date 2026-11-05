import multer from "multer";
import { randomUUID } from "crypto";
import { config } from "../config.js";
import { ensureUploadDir, mimeExtension } from "../lib/storage.js";

ensureUploadDir();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, config.uploadDir);
  },
  filename: (_req, file, cb) => {
    const extension = mimeExtension(file.mimetype) ?? "";
    cb(null, `${randomUUID()}${extension}`);
  },
});

export const uploadImages = multer({
  storage,
  limits: {
    fileSize: config.maxFileSize,
    files: config.maxImagesPerRequest,
  },
  fileFilter: (_req, file, cb) => {
    if (!mimeExtension(file.mimetype)) {
      cb(new Error("Formato no permitido. Usá JPG, PNG o WEBP."));
      return;
    }
    cb(null, true);
  },
});
