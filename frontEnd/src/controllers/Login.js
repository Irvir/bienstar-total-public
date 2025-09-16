document.getElementById("LoginForm").addEventListener("submit", handleLogin);

async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  console.log("📤 Enviando login:", { email, password });

  try {
    const res = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const result = await res.json();

    console.log("📥 Respuesta del servidor:", result);

    if (res.ok) {
      alert(result.message);  // Login exitoso
      console.log("✅ Usuario:", result.user);
    } else {
      alert("❌ Error: " + (result.message || "No se pudo iniciar sesión"));
      console.error("🚫 Login fallido:", result);
    }
  } catch (err) {
    console.error("💥 Error en fetch:", err);
    alert("No se pudo conectar con el servidor");
  }
}
