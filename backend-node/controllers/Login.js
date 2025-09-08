async function registrarUsuario() {
  let correo = document.getElementById("correo").value.trim();
  let confCorreo = document.getElementById("confCorreo").value.trim();
  let contrasena = document.getElementById("contrasena").value.trim();
  let confContrasena = document.getElementById("confContrasena").value.trim();

  const data = {
    name: document.getElementById("nombre").value.trim(),
    email: correo,
    confCorreo: confCorreo,
    password: contrasena,
    confContrasena: confContrasena,
    height: document.getElementById("altura").value.trim(),
    weight: document.getElementById("peso").value.trim(),
    age: document.getElementById("edad").value.trim(),
  };

  try {
    const res = await fetch("http://localhost:3000/registrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (res.status === 200) {
      alert(result.message);
    } else {
      document.getElementById("resultado").innerText = result.errores.join("\n");
    }
  } catch (error) {
    console.error("Error al registrar:", error);
  }
}
