document.getElementById("CrearCuentaForm").addEventListener("submit", function(event) {
  event.preventDefault(); // Evita el envío del formulario por defecto

  const data = {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    password: document.getElementById("password").value.trim(),
    weight: document.getElementById("weight").value.trim(),
    height: document.getElementById("height").value.trim(),
    age: document.getElementById("age").value.trim()
  };

  console.log("📤 Enviando registro:", data);

  fetch("http://localhost:3000/registrar", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
  .then(async response => {
    const result = await response.json(); // 👈 corregido aquí

    if (response.ok) {
      console.log("✅ Registro exitoso:", result);
      alert(result.message);
    } else {
      console.error("🚫 Error en registro:", result);
      alert("Error: " + (result.message || "No se pudo registrar"));
    }
  })
  .catch(error => {
    console.error("💥 Error en la conexión:", error);
    alert("Error en la conexión con el servidor");
  });
});