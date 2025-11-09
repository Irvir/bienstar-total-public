import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import bcrypt from "bcrypt";
import multer from "multer";
import createAdminFoodsRouter from './src/routes/adminFoods.routes.js';
import createUsersRouter from './src/routes/users.routes.js';
import createDietsRouter from './src/routes/diets.routes.js';
import createFoodsRouter from './src/routes/foods.routes.js';
import createAuthRouter from './src/routes/auth.routes.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const router = express.Router();

// Construir lista de orígenes permitidos (por defecto localhost y posibilidad de configurar via env)
const DEFAULT_ALLOWED = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4000',
  'http://127.0.0.1:4000',
  'https://bienstar-total-public.onrender.com', 
  'https://testing-8i367qyxt-irvirs-projects.vercel.app' 
];
const envAllowed = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
const ALLOWED_ORIGINS = Array.from(new Set([...DEFAULT_ALLOWED, ...envAllowed]));

app.use(cors({
  origin: (origin, callback) => {
    
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    // Allow localhost patterns as a fallback
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json());

// --- RESPONDER preflight OPTIONS globalmente ---
// Usar una expresión regular para cubrir todas las rutas (evita problemas con path-to-regexp)
app.options(/.*/, cors({
  origin: (process.env.ALLOWED_ORIGINS || ALLOWED_ORIGINS),
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json());

// --- Configuración de DB (desde .env) ---
const DB_CONFIG = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT)
};


// Archivo y directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pool de conexiones
const pool = mysql.createPool({ ...DB_CONFIG, connectionLimit: 10 });

// Test de conectividad inicial (no detener el servidor si falla, pero mostrar info)
(async () => {
  try {
    await pool.query('SELECT 1');
    console.log('✅ DB reachable (connection test OK)');
  } catch (e) {
    console.error('⚠️ DB connection test failed:', e.message || e);
    console.error('Revisa las variables de entorno DB_HOST/DB_USER/DB_PASSWORD/DB_NAME/DB_PORT');
  }
})();
// --- Servir imágenes ---
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// --- Multer: subida de imágenes ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

app.use('/admin/foods', createAdminFoodsRouter({ pool, upload }));
app.use('/admin', router);
app.use('/', createDietsRouter({ pool }));

app.use('/', createAuthRouter({ pool }));

app.use('/', createFoodsRouter({ pool }));

app.use('/admin/users', createUsersRouter({ pool }));
app.use('/user', createUsersRouter({ pool }));
app.use('/admin/user', createUsersRouter({ pool }));





// --- Servir frontend en producción ---
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "dist")));
  app.get(/^\/(?!admin).*/, (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });
}
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, env: process.env.NODE_ENV || 'development' });
  } catch (err) {
    res.status(503).json({ ok: false, error: 'DB unreachable' });
  }
});

async function shutdown(signal) {
  console.log(`Received ${signal}. Closing DB pool and exiting...`);
  try {
    await pool.end();
    console.log('DB pool closed');
  } catch (e) {
    console.error('Error closing DB pool', e);
  }
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// --- Iniciar servidor ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT} (NODE_ENV=${process.env.NODE_ENV || 'development'})`);
  if ((process.env.ALLOWED_ORIGINS || '').length > 0) {
    console.log('ALLOWED_ORIGINS from env:', process.env.ALLOWED_ORIGINS);
  }
});
