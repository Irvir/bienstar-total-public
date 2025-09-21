document.getElementById("CrearCuentaForm").addEventListener("submit", async function(event) {
  event.preventDefault(); // Evita el envío del formulario por defecto

  const data = {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    password: document.getElementById("password").value.trim(),
    weight: parseFloat(document.getElementById("weight").value.trim()),
    height: parseFloat(document.getElementById("height").value.trim()),
    age: parseInt(document.getElementById("age").value.trim())
  };

  // 🔹 Validaciones frontend
  let errores = [];

  // Email
  const emailRegex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d@._-]+$/;
  if (!emailRegex.test(data.email)) {
    errores.push("El correo debe contener letras y números válidos.");
  }
  if (data.email.length > 50) {
    errores.push("El correo no puede superar los 50 caracteres.");
  }

  // Contraseña
  const passRegex = /^(?=.*[a-zA-Z])(?=.*\d).{6,}$/;
  if (!passRegex.test(data.password)) {
    errores.push("La contraseña debe tener al menos 6 caracteres, incluir letras y números.");
  }

  // Edad, peso, altura
  if (data.age <= 0) errores.push("La edad debe ser mayor a 0.");
  if (data.weight <= 0) errores.push("El peso debe ser mayor a 0.");
  if (data.height <= 0) errores.push("La altura debe ser mayor a 0.");

  // Si hay errores en frontend, mostrar y cancelar envío
  if (errores.length > 0) {
    alert("❌ No se puede registrar:\n- " + errores.join("\n- "));
    return;
  }

  try {
    // 🔹 Verificar si el correo ya existe antes de crear la cuenta
    const checkEmail = await fetch("http://localhost:3000/checkEmail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: data.email })
    });

    const checkResult = await checkEmail.json();

    if (!checkEmail.ok || checkResult.exists) {
      alert("❌ El correo ya está registrado. Usa otro.");
      return;
    }

    // 🔹 Si pasa validaciones y el correo no está usado, registrar
    const response = await fetch("http://localhost:3000/registrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (response.ok) {
      console.log("✅ Registro exitoso:", result);
      alert(result.message);

      // 🔹 Auto-login directo
      const loginRes = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password })
      });

      const loginResult = await loginRes.json();

      if (loginRes.ok) {
        localStorage.setItem("usuario", JSON.stringify(loginResult.user));
        window.location.href = "index.html"; // Ir directo al inicio con sesión iniciada
      } else {
        // Si falla autologin, redirige a login manual
        window.location.href = "login.html";
      }
    } else {
      console.error("🚫 Error en registro:", result);

      // 👉 Mostrar mensajes específicos del backend
      if (result.errores && Array.isArray(result.errores)) {
        alert("❌ No se pudo registrar:\n- " + result.errores.join("\n- "));
      } else {
        alert("❌ Error: " + (result.message || "No se pudo registrar"));
      }
    }

  } catch (error) {
    console.error("💥 Error en la conexión:", error);
    alert("Error en la conexión con el servidor");
  }
});

