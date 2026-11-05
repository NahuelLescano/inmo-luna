import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config.js";

export function verifyToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Token requerido" });
    return;
  }

  jwt.verify(token, config.jwtSecret, (err) => {
    if (err) {
      res.status(403).json({ error: "Token inválido o expirado" });
      return;
    }
    next();
  });
}
