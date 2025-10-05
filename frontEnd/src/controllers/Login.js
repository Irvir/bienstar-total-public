document.getElementById("LoginForm").addEventListener("submit", async function(event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
      if (window.notify) {
          window.notify("❌ Por favor, complete todos los campos", { type: 'error', duration: 4000 });
      } else {
          alert("Por favor, complete todos los campos");
      }
      return;
  }

  try {
      const response = await fetch("http://localhost:3000/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
      });

      const result = await response.json();

      if (response.ok) {
          // Guardar usuario en localStorage
          localStorage.setItem("usuario", JSON.stringify(result.user));

          // Mostrar notificación de login exitoso
          if (window.notify) {
              window.notify("Login exitoso", { type: 'success', duration: 4000 });
          } else {
              alert("Login exitoso");
          }

          // Redirigir al index después de 1.5 segundos
          setTimeout(() => {
              window.location.href = "index.html";
          }, 1500);

      } else {
          // Error en login
          if (window.notify) {
              window.notify("❌ " + (result.message || "Correo o contraseña incorrectos"), {
                  type: 'error',
                  duration: 4000
              });
          } else {
              alert(result.message || "Correo o contraseña incorrectos");
          }
      }

  } catch (error) {
      console.error("💥 Error en la conexión:", error);
      if (window.notify) {
          window.notify("Error en la conexión con el servidor", { type: 'error', duration: 4000 });
      } else {
          alert("Error en la conexión con el servidor");
      }
  }
});
