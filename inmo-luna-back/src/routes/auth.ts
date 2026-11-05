import { Router } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config.js";

export const authRouter = Router();

authRouter.post("/login", (req, res) => {
  const { username, password } = req.body ?? {};

  if (username === config.adminUser && password === config.adminPass) {
    const token = jwt.sign({ username }, config.jwtSecret, { expiresIn: "8h" });
    res.json({ token });
    return;
  }

  res.status(401).json({ error: "Credenciales inválidas" });
});
