const loginForm = document.getElementById("LoginForm");
const loadingAnimation = document.getElementById("loading-animation");

loginForm.addEventListener("submit", handleLogin);

async function handleLogin(e) {
  e.preventDefault();

  // 🔹 Mostrar animación al enviar
  loadingAnimation.style.display = "block";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  console.log("📤 Enviando login:", { email, password });

  // 🔹 Validaciones frontend
  let errores = [];
  if (!email) errores.push("El correo es obligatorio.");
  if (!password) errores.push("La contraseña es obligatoria.");
  else if (password.length < 6) errores.push("La contraseña debe tener al menos 6 caracteres.");

  if (errores.length > 0) {
    alert("❌ No se puede iniciar sesión:\n- " + errores.join("\n- "));
    loadingAnimation.style.display = "none"; // ❌ Ocultar animación si hay error frontend
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const result = await res.json();
    console.log("📥 Respuesta del servidor:", result);

    if (res.ok) {
      // ✅ Login exitoso
      alert(result.message);
      localStorage.setItem("usuario", JSON.stringify(result.user));
      window.location.href = "index.html";
    } else {
      // ❌ Login fallido
      alert("❌ Error: " + (result.message || "No se pudo iniciar sesión"));
      console.error("🚫 Login fallido:", result);
    }

  } catch (err) {
    console.error("💥 Error en fetch:", err);
    alert("No se pudo conectar con el servidor");
  } finally {
    // 🔹 Ocultar animación siempre al terminar el proceso
    loadingAnimation.style.display = "none";
  }
}

