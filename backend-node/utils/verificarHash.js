// verificarHash.js
const bcrypt = require("bcrypt");

// Este es el hash que tienes guardado en la base de datos
const hashGuardado = "$2b$10$nMoTmu.vlsJgiBmaZJkI8eoju2WCezrZbU0KtByyjnmokgL46n8Fm";

// Esta es la contraseña que quieres verificar
const contraseñaIngresada = "123456";

bcrypt.compare(contraseñaIngresada, hashGuardado)
  .then(resultado => {
    console.log("¿Coincide?", resultado); // true o false
  })
  .catch(error => {
    console.error("Error al comparar:", error);
  });