const express = require("express");
const dotenv = require("dotenv");
const { Pool } = require("pg");
const userRoutes = require("./routes/users");
const { verifySession } = require("./middleware/auth");
const cors = require("cors"); 


dotenv.config();

const app = express();
const port = 3000;

// Configuración de conexión a PostgreSQL
const db = new Pool({
  connectionString: process.env.DB_CONNECTION_STRING,
  ssl: true, // cambia a true si usas conexión segura
});

// CORS habilitado para desarrollo local
app.use(cors({
  origin: "http://localhost:3001" // o "*" si quieres permitir cualquier origen
}));


app.use(express.json());

// Rutas
app.use("/api/users", userRoutes(db));

// Verificación de conexión
db.query("SELECT NOW()")
  .then((res) => {
    console.log("✅ Conexión a DB exitosa:", res.rows[0]);
  })
  .catch((err) => {
    console.error("❌ Error en conexión:", err);
  });

// Inicio del servidor
app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});