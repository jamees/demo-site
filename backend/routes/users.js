const bcrypt = require("bcrypt");

module.exports = function (db) {
  const express = require("express");
  const router = express.Router();
  const { verifySession } = require("../middleware/auth");

  // Listar todos los usuarios (para demo)
  router.get("/", verifySession, async (req, res) => {
  //router.get("/", async (req, res) => {
    const result = await db.query("SELECT id, email, created_at FROM users");
    res.json(result.rows);
  });

  // Obtener datos del usuario autenticado
  /*router.get("/me", verifySession, async (req, res) => {
    const userId = req.headers["x-user-id"];
    const result = await db.query(
      "SELECT id, email, created_at FROM users WHERE id = $1",
      [userId]
    );
    res.json(result.rows[0]);
  });*/

  router.post("/register", async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ error: "Email y password son requeridos" });
    }
  
    try {
      const hashed = await bcrypt.hash(password, 10);
  
      // Captura de información útil del request
      const metadata = {
        ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
        userAgent: req.headers["user-agent"],
        headers: req.headers,
        query: req.query,
        path: req.path,
        url: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString(),
      };
  
      const result = await db.query(
        `INSERT INTO users (email, password, metadata)
         VALUES ($1, $2, $3)
         ON CONFLICT (email) DO NOTHING
         RETURNING id, email, created_at, metadata`,
        [email, hashed, metadata]
      );
  
      if (result.rows.length === 0) {
        return res.status(409).json({ error: "El correo ya está registrado" });
      }
  
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error("Error al registrar usuario:", err);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  return router;
};