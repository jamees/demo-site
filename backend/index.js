require('dd-trace').init({
  service: 'demouv-backend',
  env: process.env.NODE_ENV || 'prod',
  url: 'https://trace.agent.datadoghq.com', // importante para cloud
  flushInterval: 2000,
  hostname: 'trace.agent.datadoghq.com',
  port: 443,
  logInjection: true,
  runtimeMetrics: true,
  analytics: true,
  tags: {
    region: 'render',
  },
});

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

// Configurar CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ["http://localhost:3001"];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS no permitido para el origen: ${origin}`));
        }
    }
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