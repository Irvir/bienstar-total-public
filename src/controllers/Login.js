document.getElementById('LoginForm').addEventListener('submit', async function(event) {
  event.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!email || !password) {
    if (window.notify) {
      window.notify('❌ Por favor, complete todos los campos', { type: 'error', duration: 4000 });
    } else {
      alert('Por favor, complete todos los campos');
    }
    return;
  }

  try {
    const API_BASE = (window.API_BASE || 'http://localhost:3001');
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (response.ok) {
      // Guardar usuario en localStorage
      // Normalize returned user to include actividad_fisica and alergias
      const u = result.user || {};
      const usuarioToStore = {
        id: u.id,
        nombre: u.nombre || u.name || null,
        email: u.email,
        altura: u.altura || null,
        peso: u.peso || null,
        edad: u.edad || null,
        actividad_fisica: u.actividad_fisica || u.nivelActividad || null,
        sexo: u.sexo || null,
        id_dieta: u.id_dieta || u.id_diet || null,
        alergias: Array.isArray(u.alergias) ? u.alergias : (u.alergias ? [u.alergias] : []),
        otrasAlergias: u.otrasAlergias || null,
      };

      localStorage.setItem('usuario', JSON.stringify(usuarioToStore));

      // Mostrar notificación de login exitoso
      if (window.notify) {
        window.notify('Login exitoso', { type: 'success', duration: 4000 });
      } else {
        alert('Login exitoso');
      }

      // Redirigir al index después de 1.5 segundos
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);

    } else {
      // Error en login
      if (window.notify) {
        window.notify('❌ ' + (result.message || 'Correo o contraseña incorrectos'), {
          type: 'error',
          duration: 4000,
        });
      } else {
        alert(result.message || 'Correo o contraseña incorrectos');
      }
    }

  } catch (error) {
    console.error('💥 Error en la conexión:', error);
    if (window.notify) {
      window.notify('Error en la conexión con el servidor', { type: 'error', duration: 4000 });
    } else {
      alert('Error en la conexión con el servidor');
    }
  }
});
