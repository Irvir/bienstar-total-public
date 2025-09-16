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
      // Contraseña de la base de datos
      password: "Mar.23012006t",
      database: "login"
    });

    console.log("Conexión a la base de datos exitosa.");

    // Ruta de prueba
    app.get("/test-db", async (req, res) => {
      const [results] = await db.query("SELECT 1 + 1 AS solution");
      res.json({ result: results[0].solution });
    });

    // Validación
    function validarRegistro(email, password) {
      const errores = [];
      const regexEmail = /\S+@\S+\.\S+/;
      if (!regexEmail.test(email)) errores.push("Correo inválido");
      if (!password || password.length < 6) errores.push("La contraseña debe tener al menos 6 caracteres");
      return errores;
    }

    // Registro (simplificado)
    app.post("/registrar", async (req, res) => {
      const { name, email, password, height, weight, age } = req.body;
      const errores = validarRegistro(email, password);
      if (errores.length > 0) return res.status(400).json({ errores });

      const hash = await bcrypt.hash(password, 10);
      const query = "INSERT INTO user (name, email, password, height, weight, age) VALUES (?, ?, ?, ?, ?, ?)";
      await db.query(query, [name, email, hash, height, weight, age]);
      res.status(200).json({ message: "Usuario registrado exitosamente" });
    });

    // Login
    app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    console.log("📩 Email recibido:", email);
    console.log("🔑 Password recibido:", password);

    const [rows] = await db.query("SELECT * FROM user WHERE email = ?", [email]);

    if (rows.length === 0) {
      console.log("❌ Usuario no encontrado");
      return res.status(401).json({ message: "Correo o contraseña incorrectos" });
    }

    const usuario = rows[0];
    console.log("👤 Usuario encontrado:", usuario);

    const esValida = await bcrypt.compare(password, usuario.password);
    console.log("🔍 ¿Contraseña válida?", esValida);

    if (!esValida) {
      console.log("❌ Contraseña incorrecta");
      return res.status(401).json({ message: "Correo o contraseña incorrectos" });
    }

    console.log("✅ Login exitoso");
    res.status(200).json({
    message: "Login exitoso",
    user: { id: usuario.id, name: usuario.name, email: usuario.email }
  });
});

    // Iniciar servidor
    app.listen(3000, () => {
      console.log("Servidor corriendo en http://localhost:3000");
    });

  } catch (error) {
    console.error("Error al iniciar el servidor:", error);
  }
}

iniciarServidor();