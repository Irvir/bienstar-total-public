import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import bcrypt from "bcrypt";
import multer from "multer";
import dotenv from 'dotenv';

// Load .env into process.env
dotenv.config();

const app = express();
const router = express.Router();

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4000',
  'http://127.0.0.1:4000',
  'https://bienstar-total-public.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (no origin)
    if (!origin) return callback(null, true);

    // Exact whitelist
    if (ALLOWED_ORIGINS.indexOf(origin) !== -1) return callback(null, true);

    // Allow localhost / 127.0.0.1 on any port during development
    const localhostPattern = /^https?:\/\/(?:localhost|127\.0\.0\.1)(:\d+)?$/i;
    if (localhostPattern.test(origin)) return callback(null, true);

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 204
}));


app.use((req, res, next) => {
  const origin = req.headers.origin;
  const localhostPattern = /^https?:\/\/(?:localhost|127\.0\.0\.1)(:\d+)?$/i;
  if (origin && (ALLOWED_ORIGINS.indexOf(origin) !== -1 || localhostPattern.test(origin))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  next();
});

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
// --- POST crear alimento ---
app.post("/admin/foods", async (req, res) => {
  try {
    const {
      nombre,
      Energia,
      Humedad,
      Cenizas,
      Proteinas,
      H_de_C_disp,
      Azucares_totales,
      Fibra_dietetica_total,
      Lipidos_totales,
      Ac_grasos_totales,
      Ac_grasos_poliinsat,
      Ac_grasos_trans,
      Colesterol,
      Vitamina_A,
      Vitamina_C,
      Vitamina_D,
      Vitamina_E,
      Vitamina_K,
      Vitamina_B1,
      Vitamina_B2 ,
      Niacina,
      Vitamina_B6,
      Ac_pantotenico,
      Vitamina_B12,
      Folatos,
      Sodio,
      Potasio,
      Calcio,
      Fosforo,
      Magnesio,
      Hierro,
      Zinc,
      Cobre,
      Selenio
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO alimento (nombre, Energia, Humedad, Cenizas, Proteinas, H_de_C_disp, Azucares_totales, Fibra_dietetica_total, Lipidos_totales, Ac_grasos_totales, Ac_grasos_poliinsat, Ac_grasos_trans, Colesterol, Vitamina_A, Vitamina_C, Vitamina_D, Vitamina_E, Vitamina_K, Vitamina_B1, Vitamina_B2, Niacina, Vitamina_B6, Ac_pantotenico, Vitamina_B12, Folatos, Sodio, Potasio, Calcio, Fosforo, Magnesio, Hierro, Zinc, Cobre, Selenio)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, Energia, Humedad, Cenizas, Proteinas, H_de_C_disp, Azucares_totales, Fibra_dietetica_total, Lipidos_totales, Ac_grasos_totales, Ac_grasos_poliinsat, Ac_grasos_trans, Colesterol, Vitamina_A, Vitamina_C, Vitamina_D, Vitamina_E, Vitamina_K, Vitamina_B1, Vitamina_B2, Niacina, Vitamina_B6, Ac_pantotenico, Vitamina_B12, Folatos, Sodio, Potasio, Calcio, Fosforo, Magnesio, Hierro, Zinc, Cobre, Selenio]
    );

    res.json({ message: "Alimento creado correctamente", id: result.insertId });
  } catch (err) {
    console.error("POST /admin/foods error:", err);
    res.status(500).json({ error: "Error al crear alimento" });
  }
});

// --- Ruta subir imagen ---
app.post("/admin/foods/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No se subió la imagen" });
  res.json({ image_url: `/uploads/${req.file.filename}` });
});

// --- GET todos los alimentos con image_url ---
app.get("/admin/foods", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM alimento");
    const normalized = rows.map(r => {
      const image = r.image_url || null;
      return { ...r, image_url: image };
    });
    res.json(normalized);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener alimentos" });
  }
});

// Montar el router de admin en /admin para exponer rutas como /admin/users
app.use('/admin', router);

// --- PUT actualizar alimento ---
app.put("/admin/foods/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      Energia,
      Humedad,
      Cenizas,
      Proteinas,
      H_de_C_disp,
      Azucares_totales,
      Fibra_dietetica_total,
      Lipidos_totales,
      Ac_grasos_totales,
      Ac_grasos_poliinsat,
      Ac_grasos_trans,
      Colesterol,
      Vitamina_A,
      Vitamina_C,
      Vitamina_D,
      Vitamina_E,
      Vitamina_K,
      Vitamina_B1,
      Vitamina_B2 ,
      Niacina,
      Vitamina_B6,
      Ac_pantotenico,
      Vitamina_B12,
      Folatos,
      Sodio,
      Potasio,
      Calcio,
      Fosforo,
      Magnesio,
      Hierro,
      Zinc,
      Cobre,
      Selenio,
      image_url
    } = req.body;

    const [result] = await pool.query(
      `UPDATE alimento SET 
         nombre = ?, Energia = ?, Humedad = ?, Cenizas = ?, Proteinas = ?, H_de_C_disp = ?, Azucares_totales = ?, Fibra_dietetica_total = ?, Lipidos_totales = ?, Ac_grasos_totales = ?, Ac_grasos_poliinsat = ?, Ac_grasos_trans = ?, Colesterol = ?, Vitamina_A = ?, Vitamina_C = ?, Vitamina_D = ?, Vitamina_E = ?, Vitamina_K = ?, Vitamina_B1 = ?, Vitamina_B2 = ?, Niacina = ?, Vitamina_B6 = ?, Ac_pantotenico = ?, Vitamina_B12 = ?, Folatos = ?, Sodio = ?, Potasio = ?, Calcio = ?, Fosforo = ?, Magnesio = ?, Hierro = ?, Zinc = ?, Cobre = ?, Selenio = ?, image_url = ?
       WHERE id = ?`,
      [nombre, Energia, Humedad, Cenizas, Proteinas, H_de_C_disp, Azucares_totales, Fibra_dietetica_total, Lipidos_totales, Ac_grasos_totales, Ac_grasos_poliinsat, Ac_grasos_trans, Colesterol, Vitamina_A, Vitamina_C, Vitamina_D, Vitamina_E, Vitamina_K, Vitamina_B1, Vitamina_B2, Niacina, Vitamina_B6, Ac_pantotenico, Vitamina_B12, Folatos, Sodio, Potasio, Calcio, Fosforo, Magnesio, Hierro, Zinc, Cobre, Selenio, image_url, id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ message: "Alimento no encontrado" });

    res.json({ message: "Alimento actualizado correctamente" });
  } catch (err) {
    console.error("/admin/foods/:id PUT error:", err);
    res.status(500).json({ error: "Error al actualizar alimento" });
  }
});
// === Obtener todas las cuentas ===
router.get("/users", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id, nombre, email, password, altura, peso, edad, 
        actividad_fisica, sexo, id_perfil, id_dieta, estado
      FROM usuario
      ORDER BY id ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error al obtener usuarios:", err);
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
});

// === Crear cuenta ===
router.post("/users", async (req, res) => {
  try {
    const {
      nombre, email, password, altura, peso, edad,
      actividad_fisica, sexo, id_perfil, id_dieta
    } = req.body;

    const [result] = await pool.query(`
      INSERT INTO usuario 
        (nombre, email, password, altura, peso, edad, actividad_fisica, sexo, id_perfil, id_dieta, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'activo')
    `, [nombre, email, password, altura, peso, edad, actividad_fisica, sexo, id_perfil, id_dieta]);

    res.json({ id: result.insertId, message: "Usuario creado correctamente" });
  } catch (err) {
    console.error("Error al crear usuario:", err);
    res.status(500).json({ message: "Error al crear usuario" });
  }
});

// === Actualizar cuenta ===
router.patch("/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const campos = req.body;

    // Construir dinámicamente los SETs
    const setStr = Object.keys(campos).map(c => `${c} = ?`).join(", ");
    const values = Object.values(campos);

    await pool.query(`UPDATE usuario SET ${setStr} WHERE id = ?`, [...values, id]);

    res.json({ message: "Usuario actualizado correctamente" });
  } catch (err) {
    console.error("Error al actualizar usuario:", err);
    res.status(500).json({ message: "Error al actualizar usuario" });
  }
});

// === Inactivar cuenta ===
router.post("/user/:id/deactivate", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("UPDATE usuario SET estado = 'inactivo' WHERE id = ?", [id]);
    res.json({ message: "Usuario inactivado correctamente" });
  } catch (err) {
    console.error("Error al inactivar usuario:", err);
    res.status(500).json({ message: "Error al inactivar usuario" });
  }
});

// === Activar cuenta ===
router.post("/user/:id/activate", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("UPDATE usuario SET estado = 'activo' WHERE id = ?", [id]);
    res.json({ message: "Usuario activado correctamente" });
  } catch (err) {
    console.error("Error al activar usuario:", err);
    res.status(500).json({ message: "Error al activar usuario" });
  }
});
function validarRegistro(email, password, height, weight, age) {
  const errores = [];

  age = Number(age);
  weight = Number(weight);
  height = Number(height);

  // si vino en metros -> cm
  if (height < 10) height = height * 100;

  const regexEmail = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d@._-]+$/;
  if (!regexEmail.test(email)) errores.push("El correo debe contener letras y números válidos.");
  if (email && email.length > 50) errores.push("El correo no puede superar los 50 caracteres.");

  const regexPass = /^(?=.*[a-zA-Z])(?=.*\d).{6,}$/;
  if (!regexPass.test(password)) errores.push("La contraseña debe tener al menos 6 caracteres, incluir letras y números.");

  if (age <= 15 || age >= 100) errores.push("La edad debe ser mayor a 15 y no puede superar los 100.");
  if (weight <= 30 || weight >= 170) errores.push("El peso debe ser mayor a 30kg y no puede superar los 170kg.");
  if (height <= 80 || height >= 250) errores.push("La altura debe ser mayor a 80 cm y no puede superar los 2,50m.");

  return errores;
}
/*

// Ruta de prueba
app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 + 1 AS solution");
    res.json({ result: rows[0].solution });
  } catch (err) {
    console.error("test-db error:", err);
    res.status(500).json({ error: "DB error" });
  }
});
*/
// Check email
app.post("/checkEmail", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Falta email" });

  const [rows] = await pool.query("SELECT id FROM usuario WHERE email = ?", [email]);
    res.json({ exists: rows.length > 0 });
  } catch (err) {
    console.error("/checkEmail error:", err);
    res.status(500).json({ error: "Error servidor" });
  }
});

// Registro de cuentas - crear cuenta
// Nueva arquitectura: id, nombre, email, password, altura, peso, edad, actividad_fisica, sexo, id_perfil, id_dieta
app.post("/registrar", async (req, res) => {
  try {
    const { nombre, email, password, altura, peso, edad, nivelActividad, sexo, alergias, otrasAlergias, recaptchaToken } = req.body;
    const errores = validarRegistro(email, password, altura, peso, edad);
    if (errores.length) return res.status(400).json({ message: "Validación fallida", errores });

    // Verify recaptcha token
    const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET || '';
    if (!recaptchaToken || !RECAPTCHA_SECRET) {
      return res.status(400).json({ message: 'Falta verificación de captcha' });
    }
    try {
      const r = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${encodeURIComponent(RECAPTCHA_SECRET)}&response=${encodeURIComponent(recaptchaToken)}`
      });
      const rr = await r.json();
      if (!rr.success) return res.status(400).json({ message: 'Captcha inválido', details: rr });
    } catch (e) {
      console.error('Recaptcha verify error', e);
      return res.status(500).json({ message: 'Error al verificar captcha' });
    }

    const [rows] = await pool.query("SELECT id FROM usuario WHERE email = ?", [email]);
    if (rows.length) return res.status(400).json({ message: "El correo ya está registrado" });

    const [dietInsert] = await pool.query("INSERT INTO dieta (nombre) VALUES (?)", [`Dieta de ${nombre || email}`]);
    const newDietId = dietInsert.insertId;

    const hash = await bcrypt.hash(password, 10);
    const [userInsert] = await pool.query(
      `INSERT INTO usuario 
      (nombre, email, password, altura, peso, edad, actividad_fisica, sexo, id_perfil, id_dieta, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, email, hash, altura, peso, edad, nivelActividad, sexo, 2, newDietId, "activo"]
    );

    const newUserId = userInsert.insertId;

    //Guardar alergias múltiples
    if (Array.isArray(alergias)) {
      for (const alergia of alergias) {
        if (alergia !== "ninguna") {
          await pool.query("INSERT INTO categoria_alergico (id_usuario, nombre) VALUES (?, ?)", [newUserId, alergia]);
        }
      }
    }

    // 🔹 Guardar otras alergias personalizadas
    if (otrasAlergias && otrasAlergias.trim() !== "") {
      await pool.query("INSERT INTO categoria_alergico (id_usuario, nombre) VALUES (?, ?)", [newUserId, otrasAlergias.trim()]);
    }

    res.json({ message: "Usuario registrado exitosamente" });
  } catch (err) {
    console.error("/registrar error:", err);
    res.status(500).json({ error: "Error servidor registro" });
  }
});


// Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Falta email o password" });

    const [rows] = await pool.query("SELECT * FROM usuario WHERE email = ?", [email]);
    if (rows.length === 0)
      return res.status(401).json({ message: "Correo o contraseña incorrectos" });

    const usuario = rows[0];

    // Nuevo: verificar si el usuario está inactivo
    if (usuario.estado === "inactivo") {
      return res.status(403).json({ message: "Tu cuenta está inactiva. Contacta al administrador." });
    }

    const ok = await bcrypt.compare(password, usuario.password);
    if (!ok)
      return res.status(401).json({ message: "Correo o contraseña incorrectos" });

    // Crear dieta si no tiene una
    if (!usuario.id_diet || usuario.id_diet === 1) {
      const [dietInsert] = await pool.query(
        "INSERT INTO dieta (nombre) VALUES (?)",
        [`Dieta de ${usuario.nombre || usuario.email}`]
      );
      const newDietId = dietInsert.insertId;
      await pool.query("UPDATE usuario SET id_dieta = ? WHERE id = ?", [newDietId, usuario.id]);
      usuario.id_diet = newDietId;
    }

    // Obtener alergias desde la tabla categoria_alergico
    const [alRows] = await pool.query("SELECT nombre FROM categoria_alergico WHERE id_usuario = ?", [usuario.id]);
    const alergias = alRows.map(r => r.nombre);

    res.json({
      message: "Login exitoso",
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        altura: usuario.altura,
        peso: usuario.peso,
        edad: usuario.edad,
        id_dieta: usuario.id_diet || usuario.id_dieta,
        actividad_fisica: usuario.actividad_fisica || usuario.nivelActividad || null,
        sexo: usuario.sexo,
        alergias,
        otrasAlergias: usuario.otrasAlergias || null
      }
    });
  } catch (err) {
    console.error("/login error:", err);
    res.status(500).json({ error: "Error servidor login" });
  }
});
// Reactivar Usuario
app.patch("/user/:id/activar", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      "UPDATE usuario SET estado = 'activo' WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({ message: "Usuario reactivado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al reactivar usuario" });
  }
});


app.get("/admin/foods", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM alimento");
    const normalized = rows.map(r => {
      const raw = r.image || r.imagen || r.image_url || r.path || null;
      let image = raw || null;
      if (image && typeof image === 'string' && !image.startsWith('http') && !image.startsWith('/')) {
        image = `/Imagenes/Alimentos/${image}`;
      }
      return { ...r, image };
    });
    res.json(normalized);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener alimentos" });
  }
});



// Eliminar Usuario
// Marcar usuario como inactivo (en vez de eliminarlo)
app.delete("/user/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      "UPDATE usuario SET estado = 'inactivo' WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({ message: "Usuario marcado como inactivo correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al marcar usuario como inactivo" });
  }
});


app.patch("/user/:id", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const {
      nombre,
      altura,
      peso,
      edad,
      actividad_fisica,
      sexo,
      id_perfil,
      id_dieta,
      estado,
      alergias, // array de strings o IDs
    } = req.body || {};

    await connection.beginTransaction();

    //  1. Verificar si el usuario existe
    const [rows] = await connection.query("SELECT * FROM usuario WHERE id = ?", [id]);
    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    const current = rows[0];

    // 2. Preparar datos nuevos (sin modificar email ni password)
    const updated = {
      nombre: nombre ?? current.nombre,
      altura: altura ?? current.altura,
      peso: peso ?? current.peso,
      edad: edad ?? current.edad,
      actividad_fisica: actividad_fisica ?? current.actividad_fisica,
      sexo: sexo ?? current.sexo,
      id_perfil: id_perfil ?? current.id_perfil,
      id_dieta: id_dieta ?? current.id_dieta,
      estado: estado ?? current.estado,
    };

    // Validaciones opcionales
    if (updated.edad && (updated.edad <= 10 || updated.edad > 120))
      return res.status(400).json({ message: "Edad fuera de rango válido" });

    // 3. Actualizar usuario principal
    await connection.query(
      `UPDATE usuario
       SET nombre = ?, altura = ?, peso = ?, edad = ?, actividad_fisica = ?, sexo = ?,
           id_perfil = ?, id_dieta = ?, estado = ?
       WHERE id = ?`,
      [
        updated.nombre,
        updated.altura,
        updated.peso,
        updated.edad,
        updated.actividad_fisica,
        updated.sexo,
        updated.id_perfil,
        updated.id_dieta,
        updated.estado,
        id,
      ]
    );

    // 4. Actualizar alergias si se incluyen en el body
    if (Array.isArray(alergias)) {
      // Elimina las alergias anteriores
      await connection.query("DELETE FROM categoria_alergico WHERE id_usuario = ?", [id]);

      // Inserta las nuevas alergias
      if (alergias.length > 0) {
        const values = alergias.map((nombre) => [id, nombre]);
        await connection.query("INSERT INTO categoria_alergico (id_usuario, nombre) VALUES ?", [values]);
      }
    }

    await connection.commit();

    res.json({
      message: "Usuario actualizado correctamente",
      usuario: {
        id,
        ...updated,
        alergias: alergias || [],
      },
    });
  } catch (err) {
    await connection.rollback();
    console.error("PATCH /user/:id error:", err);
    res.status(500).json({ message: "Error al actualizar usuario" });
  } finally {
    connection.release();
  }
});


// Obtener usuario por ID 
app.get("/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    //id, nombre, email, password, altura, peso, edad, actividad_fisica, sexo, id_perfil, id_dieta, estado
    const [rows] = await pool.query(
      "SELECT id, nombre, email, altura, peso, edad, actividad_fisica, sexo, id_perfil, id_dieta, estado FROM usuario WHERE id = ?",
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Usuario no encontrado" });
    const user = rows[0];

    // Traer alergias del usuario
    const [alRows] = await pool.query("SELECT nombre FROM categoria_alergico WHERE id_usuario = ?", [id]);
    const alergias = alRows.map(r => r.nombre);

    res.json({ ...user, alergias });
  } catch (err) {
    console.error("GET /user/:id error:", err);
    res.status(500).json({ message: "Error servidor" });
  }
});


// Asegurar dieta personal para un usuario 
app.post("/ensure-diet", async (req, res) => {
  try {
    const { user_id, email } = req.body || {};
    if (!user_id && !email) return res.status(400).json({ message: "Falta user_id o email" });

    const where = user_id ? ["id = ?", user_id] : ["email = ?", email];
  const [uRows] = await pool.query(`SELECT id, nombre, email, id_dieta FROM usuario WHERE ${where[0]} LIMIT 1`, [where[1]]);
    if (uRows.length === 0) return res.status(404).json({ message: "Usuario no encontrado" });

    const u = uRows[0];
    let id_dieta = u.id_dieta;

    if (!id_dieta || id_dieta === 1) {
      const [dietInsert] = await pool.query("INSERT INTO diet (name) VALUES (?)", [
        `Dieta de ${u.nombre || u.email}`
      ]);
      id_dieta = dietInsert.insertId;
      await pool.query("UPDATE user SET id_dieta = ? WHERE id = ?", [id_dieta, u.id]);
    }

    res.json({ id_dieta });
  } catch (err) {
    console.error("/ensure-diet error:", err);
    res.status(500).json({ message: "Error servidor" });
  }
});

// Obtener info alimento por ID
// Estructura id, id_alimento, image_url, nombre, Energia, Humedad, Cenizas, Proteinas, H_de_C_disp, Azucares_totales, Fibra_dietetica_total, Lipidos_totales, Ac_grasos_totales, Ac_grasos_poliinsat, Ac_grasos_trans, Colesterol, Vitamina_A, Vitamina_C, Vitamina_D, Vitamina_E, Vitamina_K, Vitamina_B1, Vitamina_B2, Niacina, Vitamina_B6, Ac_pantotenico, Vitamina_B12, Folatos, Sodio, Potasio, Calcio, Fosforo, Magnesio, Hierro, Zinc, Cobre, Selenio
app.get("/food/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await pool.query("SELECT * FROM alimento WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ message: "Alimento no encontrado" });
    res.json(rows[0]);
  } catch (err) {
    console.error("/food/:id error:", err);
    res.status(500).json({ error: "Error servidor" });
  }
});

// Búsqueda de alimentos 
// Estructura id, id_alimento, image_url, nombre, Energia, Humedad, Cenizas, Proteinas, H_de_C_disp, Azucares_totales, Fibra_dietetica_total, Lipidos_totales, Ac_grasos_totales, Ac_grasos_poliinsat, Ac_grasos_trans, Colesterol, Vitamina_A, Vitamina_C, Vitamina_D, Vitamina_E, Vitamina_K, Vitamina_B1, Vitamina_B2, Niacina, Vitamina_B6, Ac_pantotenico, Vitamina_B12, Folatos, Sodio, Potasio, Calcio, Fosforo, Magnesio, Hierro, Zinc, Cobre, Selenio

// 🔍 Buscar alimentos por nombre o listar los primeros 50
app.get("/food-search", async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    let rows;

    if (q) {
      // Buscar alimentos cuyo nombre contenga el texto dado (sin distinción de mayúsculas)
      [rows] = await pool.query(
        `SELECT 
           id,
           id_alimento,
           image_url,
           nombre,
           Energia,
           Humedad,
           Cenizas,
           Proteinas,
           H_de_C_disp,
           Azucares_totales,
           Fibra_dietetica_total,
           Lipidos_totales,
           Ac_grasos_totales,
           Ac_grasos_poliinsat,
           Ac_grasos_trans,
           Colesterol,
           Vitamina_A,
           Vitamina_C,
           Vitamina_D,
           Vitamina_E,
           Vitamina_K,
           Vitamina_B1,
           Vitamina_B2,
           Niacina,
           Vitamina_B6,
           Ac_pantotenico,
           Vitamina_B12,
           Folatos,
           Sodio,
           Potasio,
           Calcio,
           Fosforo,
           Magnesio,
           Hierro,
           Zinc,
           Cobre,
           Selenio
         FROM alimento
         WHERE nombre LIKE ? COLLATE utf8mb4_general_ci
         LIMIT 50`,
        [`%${q}%`]
      );
    } else {
      // Si no hay búsqueda, devolver los primeros 50 alimentos
      [rows] = await pool.query(
        `SELECT 
           id,
           id_alimento,
           image_url,
           nombre,
           Energia,
           Humedad,
           Cenizas,
           Proteinas,
           H_de_C_disp,
           Azucares_totales,
           Fibra_dietetica_total,
           Lipidos_totales,
           Ac_grasos_totales,
           Ac_grasos_poliinsat,
           Ac_grasos_trans,
           Colesterol,
           Vitamina_A,
           Vitamina_C,
           Vitamina_D,
           Vitamina_E,
           Vitamina_K,
           Vitamina_B1,
           Vitamina_B2,
           Niacina,
           Vitamina_B6,
           Ac_pantotenico,
           Vitamina_B12,
           Folatos,
           Sodio,
           Potasio,
           Calcio,
           Fosforo,
           Magnesio,
           Hierro,
           Zinc,
           Cobre,
           Selenio
         FROM alimento
         LIMIT 50`
      );
    }

    res.json(rows);
  } catch (err) {
    console.error("/food-search error:", err);
    res.status(500).json({ message: "Error al obtener alimentos" });
  }
});


//Obtener la dieta completa con días, comidas y alimentos
app.get("/get-diet", async (req, res) => {
  try {
    const id_dieta = parseInt(req.query.id_dieta || "1", 10); // Por defecto dieta 1
    if (!id_dieta) return res.status(400).json({ message: "Falta id_dieta" });

    const [rows] = await pool.query(
      `
      SELECT 
        d.numero_dia AS dia,
        c.tipo AS tipo_comida,
        a.nombre AS alimento,
        ca.cantidad
      FROM dia d
      JOIN comida c ON c.id_dia = d.id
      JOIN comida_alimento ca ON ca.id_comida = c.id
      JOIN alimento a ON a.id = ca.id_alimento
      WHERE d.id_dieta = ?
      ORDER BY 
        d.numero_dia, 
        FIELD(c.tipo, 'Desayuno', 'Almuerzo', 'Cena', 'Snack', 'Snack2')
      `,
      [id_dieta]
    );

    res.json(rows);
  } catch (err) {
    console.error("/get-diet error:", err);
    res.status(500).json({ message: "Error al obtener dieta" });
  }
});



// Guardar dieta (POST /save-diet)
app.post("/save-diet", async (req, res) => {
  const { id_dieta, comidas } = req.body;

  if (!id_dieta || !comidas || !comidas.length) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  const connection = await pool.getConnection();
  try {
    console.log("📥 Recibido:", comidas);
    await connection.beginTransaction();

    for (const comida of comidas) {
      const { id: id_alimento, dia, tipoComida, cantidad } = comida;

      // Validar campos básicos
      if (!id_alimento || !dia || !tipoComida) {
        console.warn("⚠️ Datos incompletos para alimento:", comida);
        continue;
      }

      // 🔹 Verificar o crear día
      let [diaRows] = await connection.query(
        "SELECT id FROM dia WHERE id_dieta = ? AND numero_dia = ?",
        [id_dieta, dia]
      );

      let id_dia;
      if (diaRows.length > 0) {
        id_dia = diaRows[0].id;
      } else {
        const [insertDia] = await connection.query(
          "INSERT INTO dia (id_dieta, numero_dia) VALUES (?, ?)",
          [id_dieta, dia]
        );
        id_dia = insertDia.insertId;
      }

      // 🔹 Verificar o crear comida
      let [comidaRows] = await connection.query(
        "SELECT id FROM comida WHERE id_dia = ? AND tipo = ?",
        [id_dia, tipoComida]
      );

      let id_comida;
      if (comidaRows.length > 0) {
        id_comida = comidaRows[0].id;
      } else {
        const [insertComida] = await connection.query(
          "INSERT INTO comida (id_dia, tipo) VALUES (?, ?)",
          [id_dia, tipoComida]
        );
        id_comida = insertComida.insertId;
      }

      // 🔹 Insertar alimento en la comida (relación N:M)
      await connection.query(
        `
        INSERT INTO comida_alimento (id_comida, id_alimento, cantidad)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE cantidad = VALUES(cantidad)
        `,
        [id_comida, id_alimento, cantidad || 1]
      );
    }

    await connection.commit();
    res.json({ message: "✅ Dieta guardada correctamente" });
  } catch (error) {
    await connection.rollback();
    console.error("❌ Error al guardar dieta:", error);
    res.status(500).json({ error: "Error al guardar dieta" });
  } finally {
    connection.release();
  }
});


// Borrar todas las comidas de un día específico de la dieta
// Inactivar todas las comidas y alimentos de un día específico de la dieta
app.post("/clear-day", async (req, res) => {
  try {
    const { id_diet, dia } = req.body || {};
    const idDietNum = Number(id_diet);
    const diaNum = Number(dia);
    if (!idDietNum || !diaNum)
      return res.status(400).json({ message: "Faltan parámetros" });

    // Buscar el día
    const [dayRows] = await pool.query(
      "SELECT id FROM day WHERE id_diet = ? AND number_day = ?",
      [idDietNum, diaNum]
    );
    if (dayRows.length === 0) {
      return res.json({ success: true, message: "No había registros para ese día" });
    }

    const id_day = dayRows[0].id;

    // Buscar comidas del día
    const [mealRows] = await pool.query("SELECT id FROM meal WHERE id_day = ?", [id_day]);

    if (mealRows.length > 0) {
      const mealIds = mealRows.map(r => r.id);

      // Inactivar alimentos relacionados
      await pool.query(
        `UPDATE meal_food SET estado = 'inactivo' WHERE id_meal IN (${mealIds.map(() => '?').join(',')})`,
        mealIds
      );

      // Inactivar comidas
      await pool.query("UPDATE meal SET estado = 'inactivo' WHERE id_day = ?", [id_day]);
    }

    res.json({ success: true, message: "Día inactivado correctamente" });
  } catch (err) {
    console.error("/clear-day error:", err);
    res.status(500).json({ message: "Error interno" });
  }
});

// Borrar un alimento específico de una comida en un día específico de la dieta
// Inactivar un alimento específico de una comida en un día específico de la dieta
app.post("/delete-diet-item", async (req, res) => {
  try {
    const { id_diet, id_food, dia, tipoComida } = req.body;

    const idDietNum = Number(id_diet);
    const idFoodNum = Number(id_food);
    const diaNum = Number(dia);

    // Buscar el día
    const [dayRows] = await pool.query(
      "SELECT id FROM day WHERE id_diet = ? AND number_day = ?",
      [idDietNum, diaNum]
    );
    if (dayRows.length === 0) {
      return res.status(404).json({ error: "Día no encontrado en la dieta" });
    }

    const id_day = dayRows[0].id;

    // Buscar la comida (meal)
    const [mealRows] = await pool.query(
      "SELECT id FROM meal WHERE id_day = ? AND type = ?",
      [id_day, tipoComida]
    );
    if (mealRows.length === 0) {
      return res.status(404).json({ error: "Comida no encontrada en ese día" });
    }

    const id_meal = mealRows[0].id;

    // Verificar si el alimento existe
    const [checkRows] = await pool.query(
      "SELECT * FROM meal_food WHERE id_meal = ? AND id_food = ? AND estado = 'activo'",
      [id_meal, idFoodNum]
    );
    if (checkRows.length === 0) {
      return res.status(404).json({ error: "El alimento no está activo en esa comida" });
    }

    // Inactivar el alimento
    await pool.query(
      "UPDATE meal_food SET estado = 'inactivo' WHERE id_meal = ? AND id_food = ?",
      [id_meal, idFoodNum]
    );

    res.json({ success: true, message: "Alimento inactivado correctamente" });
  } catch (err) {
    console.error("Error al inactivar alimento:", err);
    res.status(500).json({ error: "Error interno" });
  }
});


// --- Servir frontend en producción ---
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "dist")));
  app.get(/^\/(?!admin).*/, (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });
}
// --- Iniciar servidor ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
