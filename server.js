// server.js
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import bcrypt from "bcrypt";

const app = express();
app.use(cors());
app.use(express.json());

// --- Configuración de la base de datos ---
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

/**
 * Helpers
 */
function validarRegistro(email, password, height, weight, age) {
  const errores = [];

  age = Number(age);
  weight = Number(weight);
  height = Number(height);

  if (height < 10) height = height * 100; // si vino en metros -> cm

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

/**
 * --- Rutas ---
 */

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
// Asegurar dieta personal para un usuario (POST { user_id? , email? })
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

// Obtener info alimento por ID (GET /food/:id)
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

// Búsqueda de alimentos (GET /food-search?q=)
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
// Obtener dieta (GET /get-diet?id_diet=1)
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

    // devuelve [{dia, tipo_comida, alimento}, ...]
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
        continue; // ahora sí tiene sentido
      }

      // 1) Insertar o encontrar el día
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

      // 2) Insertar o encontrar el meal
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

      // 3) Insertar en meal_food (si no existe ya)
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

    const [result] = await pool.query(
      "DELETE FROM meal_food WHERE id_meal = ? AND id_food = ?",
      [id_meal, idFoodNum]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Error al eliminar alimento:", err);
    res.status(500).json({ error: "Error interno" });
  }
});
// --- SERVIR FRONTEND EN PRODUCCIÓN ---
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });
}
// Puerto 3001 debido a que React usa 3000 por defecto  
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
