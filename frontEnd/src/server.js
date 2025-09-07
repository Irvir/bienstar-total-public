/**
 * Tipos de datos en JavaScript
 * String, Number, Boolean, Object, Array, Null, Undefined
 * const: valor constante, no puede cambiar
 * app.:: objeto principal de Express
 * object: colección de pares clave-valor. (Clases de Java)
 */

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

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
  const query = "INSERT INTO user (name, email, password, height, weight, age) VALUES (?, ?, ?, ?, ?, ?)";
  db.query(query, [name, email, password, height, weight, age], (err, result) => {
    if (err) {
      console.error("Error al registrar el usuario:", err);
      res.status(500).json({ message: "Error al registrar el usuario" });
      return;
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
