import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import bcrypt from "bcrypt";
import multer from "multer";

const app = express();
app.use(cors());
app.use(express.json());

// --- Configuración de DB ---
const DB_CONFIG = {
  host: "sql10.freesqldatabase.com",
  user: "sql10801474",
  password: "gfkLZVNqE6",
  database: "sql10801474",
  port: 3306
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
      energy,
      protein,
      total_lipid,
      carbohydrate,
      total_sugars,
      calcium,
      iron,
      sodium,
      cholesterol,
      image_url,
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO food (nombre, energy, protein, total_lipid, carbohydrate, total_sugars, calcium, iron, sodium, cholesterol, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, energy, protein, total_lipid, carbohydrate, total_sugars, calcium, iron, sodium, cholesterol, image_url]
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
    const [rows] = await pool.query("SELECT * FROM food");
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

// --- PUT actualizar alimento ---
app.put("/admin/foods/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      energy,
      protein,
      total_lipid,
      carbohydrate,
      total_sugars,
      calcium,
      iron,
      sodium,
      cholesterol,
      image_url
    } = req.body;

    const [result] = await pool.query(
      `UPDATE food SET 
         nombre = ?, energy = ?, protein = ?, total_lipid = ?, carbohydrate = ?, 
         total_sugars = ?, calcium = ?, iron = ?, sodium = ?, cholesterol = ?, image_url = ?
       WHERE id = ?`,
      [nombre, energy, protein, total_lipid, carbohydrate, total_sugars, calcium, iron, sodium, cholesterol, image_url, id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ message: "Alimento no encontrado" });

    res.json({ message: "Alimento actualizado correctamente" });
  } catch (err) {
    console.error("/admin/foods/:id PUT error:", err);
    res.status(500).json({ error: "Error al actualizar alimento" });
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

// Check email
app.post("/checkEmail", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Falta email" });

    const [rows] = await pool.query("SELECT id FROM user WHERE email = ?", [email]);
    res.json({ exists: rows.length > 0 });
  } catch (err) {
    console.error("/checkEmail error:", err);
    res.status(500).json({ error: "Error servidor" });
  }
});

// Registro
app.post("/registrar", async (req, res) => {
  try {
    const { name, email, password, height, weight, age } = req.body;
    const errores = validarRegistro(email, password, height, weight, age);
    if (errores.length) return res.status(400).json({ message: "Validación fallida", errores });

    const [rows] = await pool.query("SELECT id FROM user WHERE email = ?", [email]);
    if (rows.length) return res.status(400).json({ message: "El correo ya está registrado" });

    const [dietInsert] = await pool.query("INSERT INTO diet (name) VALUES (?)", [`Dieta de ${name || email}`]);
    const newDietId = dietInsert.insertId;

    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO user (name, email, password, height, weight, age, id_diet) VALUES (?,?,?,?,?,?,?)",
      [name, email, hash, height, weight, age, newDietId]
    );

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
    if (!email || !password) return res.status(400).json({ message: "Falta email o password" });

    const [rows] = await pool.query("SELECT * FROM user WHERE email = ?", [email]);
    if (rows.length === 0) return res.status(401).json({ message: "Correo o contraseña incorrectos" });

    const usuario = rows[0];
    const ok = await bcrypt.compare(password, usuario.password);
    if (!ok) return res.status(401).json({ message: "Correo o contraseña incorrectos" });

    if (!usuario.id_diet || usuario.id_diet === 1) {
      const [dietInsert] = await pool.query("INSERT INTO diet (name) VALUES (?)", [`Dieta de ${usuario.name || usuario.email}`]);
      const newDietId = dietInsert.insertId;
      await pool.query("UPDATE user SET id_diet = ? WHERE id = ?", [newDietId, usuario.id]);
      usuario.id_diet = newDietId;
    }

    res.json({
      message: "Login exitoso",
      user: {
        id: usuario.id,
        name: usuario.name,
        email: usuario.email,
        height: usuario.height,
        weight: usuario.weight,
        age: usuario.age,
        id_diet: usuario.id_diet
      }
    });
  } catch (err) {
    console.error("/login error:", err);
    res.status(500).json({ error: "Error servidor login" });
  }
});
app.get("/admin/foods", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM food");
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
app.delete("/user/:id", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;

    await connection.beginTransaction();

    const [users] = await connection.query("SELECT id_diet FROM user WHERE id = ?", [id]);
    if (users.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    const id_diet = users[0].id_diet;

    const [days] = await connection.query("SELECT id FROM day WHERE id_diet = ?", [id_diet]);
    const dayIds = days.map(d => d.id);
    if (dayIds.length > 0) {
      const [meals] = await connection.query(`SELECT id FROM meal WHERE id_day IN (${dayIds.map(() => '?').join(',')})`, dayIds);
      const mealIds = meals.map(m => m.id);
      if (mealIds.length > 0) {
        await connection.query(`DELETE FROM meal_food WHERE id_meal IN (${mealIds.map(() => '?').join(',')})`, mealIds);
      }
      await connection.query(`DELETE FROM meal WHERE id_day IN (${dayIds.map(() => '?').join(',')})`, dayIds);
    }

    await connection.query("DELETE FROM day WHERE id_diet = ?", [id_diet]);

    await connection.query("DELETE FROM user WHERE id = ?", [id]);

    if (id_diet !== 1) {
      await connection.query("DELETE FROM diet WHERE id = ?", [id_diet]);
    }

    await connection.commit();
    res.json({ message: "Usuario y datos asociados eliminados correctamente" });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ message: "Error al eliminar usuario" });
  } finally {
    connection.release();
  }
});

// Actualizar datos de usuario 
app.patch("/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, height, weight, age, originalEmail } = req.body || {};

    // Cargar usuario existente
    let [rows] = await pool.query("SELECT id, name, email, height, weight, age, id_diet FROM user WHERE id = ?", [id]);
    if (rows.length === 0) {
      const lookupEmail = originalEmail || email;
      if (lookupEmail) {
        const [byEmail] = await pool.query(
          "SELECT id, name, email, height, weight, age, id_diet FROM user WHERE email = ? LIMIT 1",
          [lookupEmail]
        );
        if (byEmail.length === 0) return res.status(404).json({ message: "Usuario no encontrado" });
        rows = byEmail;
      } else {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
    }

    const current = rows[0];
    // usar este id para cualquier actualización
    const userId = current.id;
    const next = {
      name: (name ?? current.name) || current.name,
      // email no es editable desde este endpoint
      email: current.email,
      height: height === undefined || height === null || height === '' ? current.height : Number(height),
      weight: weight === undefined || weight === null || weight === '' ? current.weight : Number(weight),
      age: age === undefined || age === null || age === '' ? current.age : Number(age),
    };

    // Validaciones básicas (suaves):
    if (next.height < 10) next.height = next.height * 100; // si vino en metros -> cm
    if (next.age && (next.age <= 15 || next.age >= 100)) return res.status(400).json({ message: "Edad fuera de rango" });
    if (next.weight && (next.weight <= 30 || next.weight >= 170)) return res.status(400).json({ message: "Peso fuera de rango" });
    if (next.height && (next.height <= 80 || next.height >= 250)) return res.status(400).json({ message: "Altura fuera de rango" });

    // Bloquear cambios de email desde este endpoint
    if (email !== undefined && email !== current.email) {
      return res.status(400).json({ message: "El correo no se puede cambiar desde esta pantalla" });
    }

    await pool.query(
      "UPDATE user SET name = ?, height = ?, weight = ?, age = ? WHERE id = ?",
      [next.name, next.height, next.weight, next.age, userId]
    );

    res.json({
      id: Number(userId),
      name: next.name,
      email: next.email,
      height: next.height,
      weight: next.weight,
      age: next.age,
      id_diet: current.id_diet,
    });
  } catch (err) {
    console.error("PATCH /user/:id error:", err);
    res.status(500).json({ message: "Error al actualizar usuario" });
  }
});

// Obtener usuario por ID 
app.get("/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      "SELECT id, name, email, height, weight, age, id_diet FROM user WHERE id = ?",
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json(rows[0]);
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
    const [uRows] = await pool.query(`SELECT id, name, email, id_diet FROM user WHERE ${where[0]} LIMIT 1`, [where[1]]);
    if (uRows.length === 0) return res.status(404).json({ message: "Usuario no encontrado" });

    const u = uRows[0];
    let id_diet = u.id_diet;

    if (!id_diet || id_diet === 1) {
      const [dietInsert] = await pool.query("INSERT INTO diet (name) VALUES (?)", [
        `Dieta de ${u.name || u.email}`
      ]);
      id_diet = dietInsert.insertId;
      await pool.query("UPDATE user SET id_diet = ? WHERE id = ?", [id_diet, u.id]);
    }

    res.json({ id_diet });
  } catch (err) {
    console.error("/ensure-diet error:", err);
    res.status(500).json({ message: "Error servidor" });
  }
});

// Obtener info alimento por ID
app.get("/food/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await pool.query("SELECT * FROM food WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ message: "Alimento no encontrado" });
    res.json(rows[0]);
  } catch (err) {
    console.error("/food/:id error:", err);
    res.status(500).json({ error: "Error servidor" });
  }
});

// Búsqueda de alimentos 
app.get("/food-search", async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    let rows;

    if (q) {
      // Buscar por coincidencia
      [rows] = await pool.query(
        `SELECT 
           id,
           nombre AS name,
           energy AS calories,
           protein,
           total_lipid,
           carbohydrate,
           total_sugars,
           calcium,
           iron,
           sodium,
           cholesterol
         FROM food
         WHERE nombre LIKE ? COLLATE utf8mb4_general_ci
         LIMIT 50`,
        [`%${q}%`]
      );
    } else {
      // Mostrar todos los alimentos
      [rows] = await pool.query(
        `SELECT 
           id,
           nombre AS name,
           energy AS calories,
           protein,
           total_lipid,
           carbohydrate,
           total_sugars,
           calcium,
           iron,
           sodium,
           cholesterol
         FROM food
         LIMIT 50`
      );
    }

    res.json(rows);
  } catch (err) {
    console.error("/food-search error:", err);
    res.status(500).json([]);
  }
});
// Obtener dieta 
app.get("/get-diet", async (req, res) => {
  try {
    const id_diet = parseInt(req.query.id_diet || "1", 10); // por defecto 1
    if (!id_diet) return res.status(400).json({ message: "Falta id_diet" });

    const [rows] = await pool.query(
      `
      SELECT d.number_day AS dia,
             m.type AS tipo_comida,
             f.nombre AS alimento
      FROM day d
      JOIN meal m ON m.id_day = d.id
      JOIN meal_food mf ON mf.id_meal = m.id
      JOIN food f ON f.id = mf.id_food
      WHERE d.id_diet = ?
      ORDER BY d.number_day, FIELD(m.type,'breakfast','lunch','dinner','snack','snack2')
      `,
      [id_diet]
    );

    res.json(rows);
  } catch (err) {
    console.error("/get-diet error:", err);
    res.status(500).json({ message: "Error al obtener dieta" });
  }
});


// Guardar dieta (POST /save-diet)
app.post("/save-diet", async (req, res) => {
  const { id_diet, meals } = req.body;

  if (!id_diet || !meals || !meals.length) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  try {
    console.log("Recibido:", meals);

    for (const meal of meals) {
      const { id: id_food, dia, tipoComida } = meal;

      // validación dentro del loop
      if (!id_food || !dia || !tipoComida) {
        console.warn("Datos incompletos para alimento:", meal);
        continue;
      }

      // - Insertar o encontrar el día
      let [day] = await pool.query(
        "SELECT id FROM day WHERE id_diet = ? AND number_day = ?",
        [id_diet, dia]
      );

      let id_day;
      if (day.length > 0) {
        id_day = day[0].id;
      } else {
        const [result] = await pool.query(
          "INSERT INTO day (id_diet, number_day) VALUES (?, ?)",
          [id_diet, dia]
        );
        id_day = result.insertId;
      }

      //  Insertar o encontrar el meal
      let [mealRow] = await pool.query(
        "SELECT id FROM meal WHERE id_day = ? AND type = ?",
        [id_day, tipoComida]
      );

      let id_meal;
      if (mealRow.length > 0) {
        id_meal = mealRow[0].id;
      } else {
        const [result] = await pool.query(
          "INSERT INTO meal (id_day, type) VALUES (?, ?)",
          [id_day, tipoComida]
        );
        id_meal = result.insertId;
      }

      // - Insertar en meal_food (si no existe ya)
      await pool.query(
        `INSERT INTO meal_food (id_meal, id_food, quantity)
         VALUES (?, ?, 1)
         ON DUPLICATE KEY UPDATE quantity = quantity`,
        [id_meal, id_food]
      );
    }

    res.json({ message: "Dieta guardada correctamente" });
  } catch (error) {
    console.error("Error al guardar dieta:", error);
    res.status(500).json({ error: "Error al guardar dieta" });
  }
});

// Borrar todas las comidas de un día específico de la dieta
app.post("/clear-day", async (req, res) => {
  try {
    const { id_diet, dia } = req.body || {};
    const idDietNum = Number(id_diet);
    const diaNum = Number(dia);
    if (!idDietNum || !diaNum) return res.status(400).json({ message: "Faltan parámetros" });

    // Encontrar el día
    const [dayRows] = await pool.query(
      "SELECT id FROM day WHERE id_diet = ? AND number_day = ?",
      [idDietNum, diaNum]
    );
    if (dayRows.length === 0) {
      return res.json({ success: true, message: "No había registros para ese día" });
    }

    const id_day = dayRows[0].id;

    // Obtener meals del día
    const [mealRows] = await pool.query(
      "SELECT id FROM meal WHERE id_day = ?",
      [id_day]
    );

    if (mealRows.length > 0) {
      const mealIds = mealRows.map(r => r.id);
      // Borrar de meal_food
      await pool.query(
        `DELETE FROM meal_food WHERE id_meal IN (${mealIds.map(() => '?').join(',')})`,
        mealIds
      );
      // Borrar meals
      await pool.query("DELETE FROM meal WHERE id_day = ?", [id_day]);
    }

    res.json({ success: true, message: "Día limpiado" });
  } catch (err) {
    console.error("/clear-day error:", err);
    res.status(500).json({ message: "Error interno" });
  }
});
// Borrar un alimento específico de una comida en un día específico de la dieta
app.post("/delete-diet-item", async (req, res) => {
  try {
    const { id_diet, id_food, dia, tipoComida } = req.body;

    const idDietNum = Number(id_diet);
    const idFoodNum = Number(id_food);
    const diaNum = Number(dia);

    const [dayRows] = await pool.query(
      "SELECT id FROM day WHERE id_diet = ? AND number_day = ?",
      [idDietNum, diaNum]
    );
    if (dayRows.length === 0) {
      return res.status(404).json({ error: "Día no encontrado en la dieta" });
    }

    const id_day = dayRows[0].id;

    const [mealRows] = await pool.query(
      "SELECT id FROM meal WHERE id_day = ? AND type = ?",
      [id_day, tipoComida]
    );
    if (mealRows.length === 0) {
      return res.status(404).json({ error: "Comida no encontrada en ese día" });
    }

    const id_meal = mealRows[0].id;

    const [checkRows] = await pool.query(
      "SELECT * FROM meal_food WHERE id_meal = ? AND id_food = ?",
      [id_meal, idFoodNum]
    );
    if (checkRows.length === 0) {
      return res.status(404).json({ error: "El alimento no está registrado en esa comida" });
    }

    await pool.query(
      "DELETE FROM meal_food WHERE id_meal = ? AND id_food = ?",
      [id_meal, idFoodNum]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Error al eliminar alimento:", err);
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
