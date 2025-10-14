// API base configurable desde public/config.js
const API_BASE = (typeof window !== 'undefined' && window.API_BASE) || 'http://localhost:3001';
// ===== Inline validation helpers =====
function setFieldError(id, msg) {
    const input = document.getElementById(id);
    const err = document.getElementById(`err-${id}`);
    
    if (err) err.textContent = msg || '';
    
    if (input) {
        if (msg) {
            input.classList.add('input-invalid');
        } else {
            input.classList.remove('input-invalid');
        }
    }
}

// ===== VALIDADORES DE CAMPOS =====

/**
 * Valida el campo de nombre
 * Permite solo letras (con acentos) y espacios, 2-40 caracteres
 * 
 * @returns {boolean} - true si es válido
 */
function validateNameField() {
    const val = (document.getElementById('name')?.value || '').trim();
    const re = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{2,40}$/;
    
    if (!re.test(val)) {
        setFieldError('name', 'El nombre debe tener solo letras y espacios (2 a 40).');
        return false;
    }
    
    setFieldError('name', '');
    return true;
}

/**
 * Valida el campo de email
 * Requiere formato válido, mínimo 4 letras y 1 número antes del @, máximo 50 caracteres
 * 
 * @returns {boolean} - true si es válido
 */
function validateEmailField() {
    const val = (document.getElementById('email')?.value || '').trim();
    const emailRegex = /^[a-zA-Z\d._-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;
    const localPart = val.split('@')[0] || '';
    const letras = (localPart.match(/[a-zA-Z]/g) || []).length;
    const numeros = (localPart.match(/\d/g) || []).length;
    
    if (letras < 4 || numeros < 1) {
        setFieldError('email', 'Mínimo 4 letras y 1 número antes del @.');
        return false;
    }
    
    if (!emailRegex.test(val)) {
        setFieldError('email', 'Formato de correo no válido.');
        return false;
    }
    
    if (val.length > 50) {
        setFieldError('email', 'El correo no puede superar 50 caracteres.');
        return false;
    }
    
    setFieldError('email', '');
    return true;
}

/**
 * Valida el campo de contraseña
 * Requiere mínimo 6 caracteres con letras y números
 * 
 * @returns {boolean} - true si es válido
 */
function validatePasswordField() {
    const val = (document.getElementById('password')?.value || '').trim();
    const passRegex = /^(?=.*[a-zA-Z])(?=.*\d).{6,}$/;
    
    if (!passRegex.test(val)) {
        setFieldError('password', 'Mínimo 6 caracteres con letras y números.');
        return false;
    }
    
    setFieldError('password', '');
    return true;
}

/**
 * Valida el campo de edad
 * Rango permitido: 16-99 años
 * 
 * @returns {boolean} - true si es válido
 */
function validateAgeField() {
    const raw = document.getElementById('age')?.value?.trim();
    const val = parseInt(raw || '');
    
    if (isNaN(val) || val < 16 || val > 99) {
        setFieldError('age', 'Edad entre 16 y 99.');
        return false;
    }
    
    setFieldError('age', '');
    return true;
}

/**
 * Valida el campo de peso
 * Rango permitido: 31-169 kg
 * 
 * @returns {boolean} - true si es válido
 */
function validateWeightField() {
    const raw = document.getElementById('weight')?.value?.trim();
    const val = parseFloat(raw || '');
    
    if (isNaN(val) || val < 31 || val > 169) {
        setFieldError('weight', 'Peso entre 31 y 169 kg.');
        return false;
    }
    
    setFieldError('weight', '');
    return true;
}

/**
 * Valida el campo de altura
 * Rango permitido: 81-249 cm
 * 
 * @returns {boolean} - true si es válido
 */
function validateHeightField() {
    const raw = document.getElementById('height')?.value?.trim();
    const val = parseFloat(raw || '');
    
    if (isNaN(val) || val < 81 || val > 249) {
        setFieldError('height', 'Altura entre 81 y 249 cm.');
        return false;
    }
    
    setFieldError('height', '');
    return true;
}

// ===== REGISTRO DE EVENTOS DE VALIDACIÓN =====

/**
 * Mapeo de campos con sus respectivas funciones validadoras
 */
const validators = {
    name: validateNameField,
    email: validateEmailField,
    password: validatePasswordField,
    age: validateAgeField,
    weight: validateWeightField,
    height: validateHeightField,
};

/**
 * Registra eventos de validación en tiempo real para cada campo
 * - blur: Valida cuando el usuario sale del campo
 * - input: Valida mientras escribe si el campo está marcado como inválido
 */
['name', 'email', 'password', 'age', 'weight', 'height'].forEach(id => {
    const input = document.getElementById(id);
    if (!input) return;
    
    // Validar al salir del campo
    input.addEventListener('blur', () => validators[id]());
    
    // Validar mientras escribe (solo si el campo está inválido)
    input.addEventListener('input', () => {
        if (input.classList.contains('input-invalid')) {
            validators[id]();
        }
    });
});

/**
 * Valida todos los campos del formulario
 * 
 * @returns {boolean} - true si todos los campos son válidos
 */
function validateAll() {
    return ['name', 'email', 'password', 'age', 'weight', 'height']
        .map(id => validators[id]())
        .every(Boolean);
}

// ===== MANEJO DEL FORMULARIO =====

/**
 * Maneja el envío del formulario de registro
 * 
 * Proceso:
 * 1. Valida todos los campos
 * 2. Verifica que el email no esté registrado
 * 3. Registra al usuario
 * 4. Realiza login automático
 * 5. Redirige al index.html
 */
document.getElementById("CrearCuentaForm").addEventListener("submit", async function (event) {
  event.preventDefault();

  const data = {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    password: document.getElementById("password").value.trim(),
    weight: parseFloat(document.getElementById("weight").value.trim()),
    height: parseFloat(document.getElementById("height").value.trim()),
    age: parseInt(document.getElementById("age").value.trim())
  };

  const isValid = validateAll();
  if (!isValid) return;

  try {
    // Verificar si el correo ya existe
  const checkEmail = await fetch(`${API_BASE}/checkEmail`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: data.email })
    });

    // Recopilar datos del formulario
    const data = {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("password").value.trim(),
        weight: parseFloat(document.getElementById("weight").value.trim()),
        height: parseFloat(document.getElementById("height").value.trim()),
        age: parseInt(document.getElementById("age").value.trim())
    };

    // Validar todos los campos antes de enviar
    const isValid = validateAll();
    if (!isValid) return;

    // Registrar cuenta
  const response = await fetch(`${API_BASE}/registrar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

        const checkResult = await checkEmail.json();

    if (response.ok) {
      console.log("✅ Registro exitoso:", result);
    
      if (window.notify) {
        console.log(result.message)
        window.notify('Registro exitoso', {
          type: 'success',
          duration: 6000
        });
      } else {
        alert(result.message || 'Registro exitoso');
      }
    
      // Esperar a que el mensaje se muestre antes de continuar
      setTimeout(async () => {
        // Auto-login
  const loginRes = await fetch(`${API_BASE}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: data.email, password: data.password })
        });

        const result = await response.json();

        if (response.ok) {
            console.log("✅ Registro exitoso:", result);

            // Mostrar notificación de éxito
            if (window.notify) {
                window.notify('Registro exitoso', {
                    type: 'success',
                    duration: NOTIFICATION_DURATION
                });
            } else {
                alert(result.message || 'Registro exitoso');
            }

            // 3. Realizar auto-login después de mostrar la notificación
            setTimeout(async () => {
                const loginRes = await fetch(`${API_URL}/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                        email: data.email, 
                        password: data.password 
                    })
                });

                const loginResult = await loginRes.json();

                if (loginRes.ok) {
                    // Guardar usuario en localStorage
                    localStorage.setItem("usuario", JSON.stringify(loginResult.user));
                    // Redirigir al index
                    window.location.href = "index.html";
                } else {
                    // Si falla el auto-login, redirigir a login manual
                    window.location.href = "login.html";
                }
            }, REDIRECT_DELAY);

        } else {
            // Error en el registro
            console.error("🚫 Error en registro:", result);

            if (result.errores && Array.isArray(result.errores)) {
                // Mostrar lista de errores de validación del servidor
                if (window.notify) {
                    window.notify(
                        "❌ No se pudo registrar:\n- " + result.errores.join("\n- "),
                        { type: 'error', duration: NOTIFICATION_DURATION }
                    );
                }
            } else {
                // Mostrar mensaje de error genérico
                if (window.notify) {
                    window.notify(
                        "❌ Error: " + (result.message || "No se pudo registrar"),
                        { type: 'error', duration: NOTIFICATION_DURATION }
                    );
                }
            }
        }

    } catch (error) {
        // Error de red o conexión
        console.error("💥 Error en la conexión:", error);
        
        if (window.notify) {
            window.notify("Error en la conexión con el servidor", {
                type: 'error',
                duration: NOTIFICATION_DURATION
            });
        } else {
            alert("Error en la conexión con el servidor");
        }
    }
});
