const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();
app.use(cors());
app.use(express.json());

async function iniciarServidor() {
  try {
    const db = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "Mar.23012006t", //clave de base de datos
      database: "login"
    });

    console.log("Conexión a la base de datos exitosa.");

    // 📌 Ruta de prueba
    app.get("/test-db", async (req, res) => {
      const [results] = await db.query("SELECT 1 + 1 AS solution");
      res.json({ result: results[0].solution });
    });

    // 📌 Validaciones backend
    function validarRegistro(email, password, height, weight, age) {
      const errores = [];

      // Convertir a número
      age = Number(age);
      weight = Number(weight);
      height = Number(height);
      height = Number(height);
      if (height < 10) {
              height = height * 100;
      }



      // Correo: letras+números, no más de 50 caracteres
      const regexEmail = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d@._-]+$/;
      if (!regexEmail.test(email)) {
        errores.push("El correo debe contener letras y números válidos.");
      }
      if (email.length > 50) {
        errores.push("El correo no puede superar los 50 caracteres.");
      }

      // Contraseña: al menos 6 caracteres, letras y números
      const regexPass = /^(?=.*[a-zA-Z])(?=.*\d).{6,}$/;
      if (!regexPass.test(password)) {
        errores.push("La contraseña debe tener al menos 6 caracteres, incluir letras y números.");
      }

      // Edad, peso, altura > 0
      if (age <= 15 || age >= 100) errores.push("La edad debe ser mayor a 15 y no puede superar los 100.");
      if (weight <= 30 || weight >= 170) errores.push("El peso debe ser mayor a 30kg y no puede superar los 170kg.");
      // Si viene en metros (menor que 10), convierto a cm
      

      if (height <= 80 || height >= 250) {
        errores.push("La altura debe ser mayor a 80 cm y no puede superar los 2,50m.");
      }

      return errores;
    }
    // 📌 Check si correo existe
    app.post("/checkEmail", async (req, res) => {
      const { email } = req.body;
      const [rows] = await db.query("SELECT id FROM user WHERE email = ?", [email]);
      if (rows.length > 0) {
        return res.json({ exists: true });
      }
      return res.json({ exists: false });
    });

    // 📌 Registro
    app.post("/registrar", async (req, res) => {
      try {
        const { name, email, password, height, weight, age } = req.body;
    
        // Validaciones
        const errores = validarRegistro(email, password, height, weight, age);
        if (errores.length > 0) {
          return res.status(400).json({ message: "Validación fallida", errores });
        }
    
        // Verificar si el correo ya existe
        const [rows] = await db.query("SELECT id FROM user WHERE email = ?", [email]);
        if (rows.length > 0) {
          return res.status(400).json({ message: "El correo ya está registrado" });
        }
    
        // Verificar si la tabla diet está vacía
        const [dietRows] = await db.query("SELECT id FROM diet LIMIT 1");
        if (dietRows.length === 0) {
          // Si está vacía, insertar un registro predeterminado
          await db.query("INSERT INTO diet (id, name) VALUES (?, ?)", [1, "Dieta predeterminada"]);
        }
    
        // Verificar nuevamente si el registro en diet existe
        const [dietCheck] = await db.query("SELECT id FROM diet WHERE id = ?", [1]);
        if (dietCheck.length === 0) {
          return res.status(500).json({ message: "Error al insertar la dieta predeterminada" });
        }
    
        // Guardar usuario
        const hash = await bcrypt.hash(password, 10);
        const query = `
          INSERT INTO user (name, email, password, height, weight, age, id_diet) 
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        await db.query(query, [name, email, hash, height, weight, age, 1]);
    
        res.status(200).json({ message: "Usuario registrado exitosamente" });
    
      } catch (err) {
        console.error("❌ Error en /registrar:", err);
        res.status(500).json({ message: "Error en el servidor", error: err.message });
      }
    });
    

    // 📌 Login
    app.post("/login", async (req, res) => {
      const { email, password } = req.body;

      const [rows] = await db.query("SELECT * FROM user WHERE email = ?", [email]);
      if (rows.length === 0) {
        return res.status(401).json({ message: "Correo o contraseña incorrectos" });
      }

      const usuario = rows[0];
      const esValida = await bcrypt.compare(password, usuario.password);

      if (!esValida) {
        return res.status(401).json({ message: "Correo o contraseña incorrectos" });
      }

      res.status(200).json({
        message: "Login exitoso",
        user: {
          id: usuario.id,
          name: usuario.name,
          email: usuario.email,
          height: usuario.height,
          weight: usuario.weight,
          age: usuario.age,
          id_diet: usuario.id_diet // 👈 incluirlo
        }
      });
      
    });
    app.use((req, res, next) => {
      // Recuperar usuario guardado en localStorage no es posible desde backend
      // pero para pruebas, puedes forzar un usuario fijo:
      req.user = { id_diet: 1 };
      next();
    });
    
    // 📌 Obtener datos nutricionale
    // 📌 Ruta para obtener info de alimentos por ID
      app.get("/food/:id", async (req, res) => {
        try {
          const { id } = req.params;
          const [rows] = await db.query("SELECT * FROM food WHERE id = ?", [id]);

          if (rows.length === 0) {
            return res.status(404).json({ message: "Alimento no encontrado" });
          }

          res.json(rows[0]);
        } catch (err) {
          console.error(err);
          res.status(500).json({ message: "Error en el servidor" });
        } 
      });
    // 📌 Endpoint para búsqueda de alimentos por nombre (para el filtro)
    // 📌 Endpoint para búsqueda de alimentos
    app.get("/food-search", async (req, res) => {
      const q = req.query.q || '';
      if (!q.trim()) return res.json([]);
      try {
        const [rows] = await db.query(
          `SELECT 
        id,
        nombre AS name,
        energy AS calories,
        protein,
        total_lipid,
        carbohydrate,
        energy,
        total_sugars,
        calcium,
        iron,
        sodium,
        cholesterol
      FROM food
      WHERE nombre LIKE ? COLLATE utf8mb4_general_ci
      LIMIT 20`,
          [`%${q}%`] // 🔥 Asegura búsqueda parcial en cualquier parte
        );
        res.json(rows);
      } catch (err) {
        console.error(err);
        res.status(500).json([]);
      }
    });
    app.get("/get-diet", async (req, res) => {
      try {
        if (!req.user || !req.user.id_diet) {
          return res.status(401).json({ message: "Usuario no autenticado o sin dieta asociada" });
        }
    
        const [diet] = await db.query(`
          SELECT d.id AS id_diet, dy.number_day AS dia, m.type AS tipo_comida, f.nombre AS alimento
          FROM diet d
          JOIN day dy ON d.id = dy.id_diet
          JOIN meal m ON dy.id = m.id_day
          JOIN meal_food mf ON m.id = mf.id_meal
          JOIN food f ON mf.id_food = f.id
          WHERE d.id = ?;
        `, [req.user.id_diet]);
    
        res.json(diet);
      } catch (err) {
        console.error("Error al obtener la dieta:", err);
        res.status(500).json({ message: "Error al obtener la dieta." });
      }
    });
    




    // 📌 Iniciar servidor
    app.listen(3000, () => {
      console.log("Servidor corriendo en http://localhost:3000");
}   });

iniciarServidor();{
    console.error("Error al iniciar el servidor:", error);
  }
}

iniciarServidor();
