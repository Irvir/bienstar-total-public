// ===== Inline validation helpers =====
function setFieldError(id, msg) {
  const input = document.getElementById(id);
  const err = document.getElementById(`err-${id}`);
  if (err) err.textContent = msg || '';
  if (input) {
    if (msg) input.classList.add('input-invalid');
    else input.classList.remove('input-invalid');
  }
}

function validateNameField() {
  const val = (document.getElementById('name')?.value || '').trim();
  const re = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{2,40}$/;
  if (!re.test(val)) { setFieldError('name', 'El nombre debe tener solo letras y espacios (2 a 40).'); return false; }
  setFieldError('name', ''); return true;
}

function validateEmailField() {
  const val = (document.getElementById('email')?.value || '').trim();
  const emailRegex = /^[a-zA-Z\d._-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;
  const localPart = val.split('@')[0] || '';
  const letras = (localPart.match(/[a-zA-Z]/g) || []).length;
  const numeros = (localPart.match(/\d/g) || []).length;
  if (letras < 4 || numeros < 1) { setFieldError('email', 'Mínimo 4 letras y 1 número antes del @.'); return false; }
  if (!emailRegex.test(val)) { setFieldError('email', 'Formato de correo no válido.'); return false; }
  if (val.length > 50) { setFieldError('email', 'El correo no puede superar 50 caracteres.'); return false; }
  setFieldError('email', ''); return true;
}

function validatePasswordField() {
  const val = (document.getElementById('password')?.value || '').trim();
  const passRegex = /^(?=.*[a-zA-Z])(?=.*\d).{6,}$/;
  if (!passRegex.test(val)) { setFieldError('password', 'Mínimo 6 caracteres con letras y números.'); return false; }
  setFieldError('password', ''); return true;
}

function validateAgeField() {
  const raw = document.getElementById('age')?.value?.trim();
  const val = parseInt(raw || '');
  // Backend acepta >15 y <100 -> 16 a 99
  if (isNaN(val) || val < 16 || val > 99) { setFieldError('age', 'Edad entre 16 y 99.'); return false; }
  setFieldError('age', ''); return true;
}

function validateWeightField() {
  const raw = document.getElementById('weight')?.value?.trim();
  const val = parseFloat(raw || '');
  // Backend acepta >30 y <170 -> 31 a 169
  if (isNaN(val) || val < 31 || val > 169) { setFieldError('weight', 'Peso entre 31 y 169 kg.'); return false; }
  setFieldError('weight', ''); return true;
}

function validateHeightField() {
  const raw = document.getElementById('height')?.value?.trim();
  const val = parseFloat(raw || '');
  // Backend acepta >80 y <250 -> 81 a 249
  if (isNaN(val) || val < 81 || val > 249) { setFieldError('height', 'Altura entre 81 y 249 cm.'); return false; }
  setFieldError('height', ''); return true;
}

const validators = {
  name: validateNameField,
  email: validateEmailField,
  password: validatePasswordField,
  age: validateAgeField,
  weight: validateWeightField,
  height: validateHeightField,
};

['name', 'email', 'password', 'age', 'weight', 'height'].forEach(id => {
  const input = document.getElementById(id);
  if (!input) return;
  input.addEventListener('blur', () => validators[id]());
  input.addEventListener('input', () => {
    if (input.classList.contains('input-invalid')) validators[id]();
  });
});

function validateAll() {
  return ['name', 'email', 'password', 'age', 'weight', 'height']
    .map(id => validators[id]())
    .every(Boolean);
}

// ===== Submit handler =====
document.getElementById('CrearCuentaForm').addEventListener('submit', async function (event) {
  event.preventDefault();

  const data = {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    password: document.getElementById('password').value.trim(),
    weight: parseFloat(document.getElementById('weight').value.trim()),
    height: parseFloat(document.getElementById('height').value.trim()),
    age: parseInt(document.getElementById('age').value.trim()),
  };

  const isValid = validateAll();
  if (!isValid) return;

  try {
    // Verificar si el correo ya existe
    const API_BASE = (window.API_BASE || 'http://localhost:3001');
    const checkEmail = await fetch(`${API_BASE}/checkEmail`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: data.email }),
    });

    const checkResult = await checkEmail.json();

    if (!checkEmail.ok || checkResult.exists) {
      setFieldError('email', 'Este correo ya está registrado. Usa otro.');
      return;
    }

    // Registrar cuenta
    const response = await fetch(`${API_BASE}/registrar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Registro exitoso:', result);
    
      if (window.notify) {
        console.log(result.message);
        window.notify('Registro exitoso', {
          type: 'success',
          duration: 6000,
        });
      } else {
        alert(result.message || 'Registro exitoso');
      }
    
      // Esperar a que el mensaje se muestre antes de continuar
      setTimeout(async () => {
        // Auto-login
        const loginRes = await fetch(`${API_BASE}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: data.email, password: data.password }),
        });
    
        const loginResult = await loginRes.json();
    
        if (loginRes.ok) {
          const u = loginResult.user || {};
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

          // Limpiar cualquier google_temp_user pendiente (si existe)
          try { localStorage.removeItem('google_temp_user'); } catch { /* noop */ }
          localStorage.setItem('usuario', JSON.stringify(usuarioToStore));
          window.location.href = 'index.html';
        } else {
          window.location.href = 'login.html';
        }
      }, 6000); // ⏳ Espera 6 segundos antes de redirigir
    }
    else {
      console.error('🚫 Error en registro:', result);

      if (result.errores && Array.isArray(result.errores)) {
        if (window.notify) {
          window.notify('❌ No se pudo registrar:\n- ' + result.errores.join('\n- '), {
            type: 'error',
            duration: 6000,
          });
        }
      } else {
        if (window.notify) {
          window.notify('❌ Error: ' + (result.message || 'No se pudo registrar'), {
            type: 'error',
            duration: 6000,
          });
        }
      }
    }

  } catch (error) {
    console.error('💥 Error en la conexión:', error);
    if (window.notify) {
      window.notify('Error en la conexión con el servidor', {
        type: 'error',
        duration: 6000,
      });
    } else {
      alert('Error en la conexión con el servidor');
    }
  }
});
