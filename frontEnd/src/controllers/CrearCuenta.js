// ===== Inline validation helpers =====
function setFieldError(id, msg){
  const input = document.getElementById(id);
  const err = document.getElementById(`err-${id}`);
  if (err) err.textContent = msg || '';
  if (input){
    if (msg) input.classList.add('input-invalid');
    else input.classList.remove('input-invalid');
  }
}

function validateNameField(){
  const val = (document.getElementById('name')?.value || '').trim();
  const re = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{2,40}$/;
  if (!re.test(val)) { setFieldError('name','El nombre debe tener solo letras y espacios (2 a 40).'); return false; }
  setFieldError('name',''); return true;
}

function validateEmailField(){
  const val = (document.getElementById('email')?.value || '').trim();
  const emailRegex = /^[a-zA-Z\d._-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;
  const localPart = val.split('@')[0] || '';
  const letras = (localPart.match(/[a-zA-Z]/g) || []).length;
  const numeros = (localPart.match(/\d/g) || []).length;
  if (letras < 4 || numeros < 1) { setFieldError('email','Mínimo 4 letras y 1 número antes del @.'); return false; }
  if (!emailRegex.test(val)) { setFieldError('email','Formato de correo no válido.'); return false; }
  if (val.length > 50) { setFieldError('email','El correo no puede superar 50 caracteres.'); return false; }
  setFieldError('email',''); return true;
}

function validatePasswordField(){
  const val = (document.getElementById('password')?.value || '').trim();
  const passRegex = /^(?=.*[a-zA-Z])(?=.*\d).{6,}$/;
  if (!passRegex.test(val)) { setFieldError('password','Mínimo 6 caracteres con letras y números.'); return false; }
  setFieldError('password',''); return true;
}

function validateAgeField(){
  const raw = document.getElementById('age')?.value?.trim();
  const val = parseInt(raw || '');
  if (isNaN(val) || val <= 0 || val > 120) { setFieldError('age','Edad entre 1 y 120.'); return false; }
  setFieldError('age',''); return true;
}

function validateWeightField(){
  const raw = document.getElementById('weight')?.value?.trim();
  const val = parseFloat(raw || '');
  if (isNaN(val) || val <= 20 || val > 300) { setFieldError('weight','Peso entre 21 y 300 kg.'); return false; }
  setFieldError('weight',''); return true;
}

function validateHeightField(){
  const raw = document.getElementById('height')?.value?.trim();
  const val = parseFloat(raw || '');
  if (isNaN(val) || val <= 80 || val > 250) { setFieldError('height','Altura entre 81 y 250 cm.'); return false; }
  setFieldError('height',''); return true;
}

const validators = {
  name: validateNameField,
  email: validateEmailField,
  password: validatePasswordField,
  age: validateAgeField,
  weight: validateWeightField,
  height: validateHeightField,
};

['name','email','password','age','weight','height'].forEach(id => {
  const input = document.getElementById(id);
  if (!input) return;
  input.addEventListener('blur', () => validators[id]());
  input.addEventListener('input', () => { if (input.classList.contains('input-invalid')) validators[id](); });
});

function validateAll(){
  return ['name','email','password','age','weight','height'].map(id => validators[id]()).every(Boolean);
}

document.getElementById("CrearCuentaForm").addEventListener("submit", async function(event) {
  // Evita el envío del formulario por defecto
  event.preventDefault(); 

  const data = {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    password: document.getElementById("password").value.trim(),
    weight: parseFloat(document.getElementById("weight").value.trim()),
    height: parseFloat(document.getElementById("height").value.trim()),
    age: parseInt(document.getElementById("age").value.trim())
  };
  //  Validaciones frontend (per-field)
  const isValid = validateAll();

  // Per-field validators already set errors; no need to push messages here

  // Age/weight/height/email/name/password handled by respective validators
  
  // Si hay errores en frontend, mostrar y cancelar envío
  if (!isValid) return;

  try {
    // Verificar si el correo ya existe antes de crear la cuenta
    const checkEmail = await fetch("http://localhost:3000/checkEmail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: data.email })
    });

    const checkResult = await checkEmail.json();

    if (!checkEmail.ok || checkResult.exists) {
      setFieldError('email','Este correo ya está registrado. Usa otro.');
      return;
    }

    //  Si pasa validaciones y el correo no está usado, registrar
    const response = await fetch("http://localhost:3000/registrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (response.ok) {
      console.log("✅ Registro exitoso:", result);
      if (window.notify) window.notify(result.message || 'Registro exitoso', { type: 'success' });
      else alert(result.message || 'Registro exitoso');

      //  Auto-login directo
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

      //  Mostrar mensajes específicos del backend
      if (result.errores && Array.isArray(result.errores)) {
        if (window.notify) window.notify("❌ No se pudo registrar:\n- " + result.errores.join("\n- "), { type: 'error' });
      } else {
        if (window.notify) window.notify("❌ Error: " + (result.message || "No se pudo registrar"), { type: 'error' });
      }
    }

  } catch (error) {
    console.error("💥 Error en la conexión:", error);
    if (window.notify) window.notify("Error en la conexión con el servidor", { type: 'error' });
    else alert("Error en la conexión con el servidor");
  }
});

