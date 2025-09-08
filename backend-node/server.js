const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
// Regex para validar email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//  Función de validación para registro
function validarRegistro(email, password) {
  let errores = [];

  // --- Validación correo ---
  if (!email) {
    errores.push("El correo no puede estar vacío.");
  } else {
    if (email.length > 50) errores.push("El correo no puede tener más de 50 caracteres.");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) errores.push("El formato del correo no es válido.");
    if (/\s/.test(email)) errores.push("El correo no puede contener espacios en medio.");
  }

  // --- Validación contraseña ---
  if (!password) {
    errores.push("La contraseña no puede estar vacía.");
  } else {
    if (password.length < 6) errores.push("La contraseña debe tener al menos 6 caracteres.");
    if (password.length > 25) errores.push("La contraseña no puede tener más de 25 caracteres.");
    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) errores.push("La contraseña debe contener letras y números.");
    if (/\s/.test(password)) errores.push("La contraseña no puede contener espacios en medio.");
  }

  return errores;
}




//Configuración de la base de datos
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  //Contrasena a cambiar
  password: "Mar.23012006t",
  database: "login"
})
//Conexión a la base de datos
db.connect((err) => {
  if (err) {
    console.error("Error de conexión a la base de datos:", err);
    return;
  }
  console.log("Conexión a la base de datos exitosa.");
});
//Ruta de prueba para verificar la conexión a la base de datos
app.get("/test-db", (req, res) => {
  db.query("SELECT 1 + 1 AS solution", (err, results) => {
    if (err) {
      res.status(500).json({ error: err });
      return;
    }
    res.json({ result: results[0].solution });
  });
});
//Iniciar el servidor
app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});

//Ruta para registrar un nuevo usuario
app.post("/registrar", (req, res) => {
  const { name, email, password, height, weight, age } = req.body;

  // Validar datos antes de registrar
  const errores = validarRegistro(email, password);
  if (errores.length > 0) {
    return res.status(400).json({ errores });
  }

  const query = "INSERT INTO user (name, email, password, height, weight, age) VALUES (?, ?, ?, ?, ?, ?)";
  db.query(query, [name, email, password, height, weight, age], (err, result) => {
    if (err) {
      console.error("Error al registrar el usuario:", err);
      return res.status(500).json({ message: "Error al registrar el usuario" });
    }
    res.status(200).json({ message: "Usuario registrado exitosamente" });
  });
});


//Ruta para iniciar sesión
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const query = "SELECT * FROM user WHERE email = ? AND password = ?";
  db.query(query, [email, password], (err, results) => {
    if (err) {
      console.error("Error al iniciar sesión:", err);
      res.status(500).json({ message: "Error al iniciar sesión" });
      return;
    }
    if (results.length > 0) {
      res.status(200).json({ message: "Inicio de sesión exitoso" });
    } else {
      res.status(401).json({ message: "Correo o contraseña incorrectos" });
    }
  });
}
);
