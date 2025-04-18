module.exports = function (db) {
  const express = require("express");
  const router = express.Router();
  const { verifySession } = require("../middleware/auth");

  router.get("/", verifySession, async (req, res) => {
  //router.get("/", async (req, res) => {
    const result = await db.query("SELECT id, email, created_at FROM users");
    res.json(result.rows);
  });

  router.get("/me", verifySession, async (req, res) => {
    const userId = req.headers["x-user-id"];
    const result = await db.query("SELECT id, email, created_at FROM users WHERE id = $1", [userId]);
    res.json(result.rows[0]);
  });


  return router;
};