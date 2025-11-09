import bcrypt from 'bcrypt';

// Local copy of validarRegistro kept inside auth controller to keep validation colocated
function validarRegistro(email, password, height, weight, age) {
  const errores = [];

  age = Number(age);
  weight = Number(weight);
  height = Number(height);

  // si vino en metros -> cm
  if (height && height < 10) height = height * 100;

  // Email: usar una validación más permisiva y estándar
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regexEmail.test(String(email || ''))) errores.push('El correo tiene un formato inválido.');
  if (email && String(email).length > 50) errores.push('El correo no puede superar los 50 caracteres.');

  const regexPass = /^(?=.*[a-zA-Z])(?=.*\d).{6,}$/;
  if (!regexPass.test(String(password || ''))) errores.push('La contraseña debe tener al menos 6 caracteres, incluir letras y números.');

  if (isNaN(age) || age <= 15 || age >= 100) errores.push('La edad debe ser mayor a 15 y no puede superar los 100.');
  if (isNaN(weight) || weight <= 30 || weight >= 170) errores.push('El peso debe ser mayor a 30kg y no puede superar los 170kg.');
  if (isNaN(height) || height <= 80 || height >= 250) errores.push('La altura debe ser mayor a 80 cm y no puede superar los 2,50m.');

  return errores;
}

export async function verifyCaptcha(req, res) {
  try {
    const { token } = req.body || {};
    if (!token) return res.status(400).json({ error: 'Falta token' });

  const RECAPTCHA_SECRET = (typeof process !== 'undefined' && process.env && process.env.RECAPTCHA_SECRET) ? process.env.RECAPTCHA_SECRET : '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe';

    const r = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${encodeURIComponent(RECAPTCHA_SECRET)}&response=${encodeURIComponent(token)}`
    });

    const data = await r.json();
    return res.json({ ok: true, verification: data });
  } catch (err) {
    console.error('/verify-captcha error:', err);
    return res.status(500).json({ error: 'Error verificando captcha' });
  }
}

export async function checkEmail(req, res, { pool } = {}) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Falta email' });

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(String(email))) return res.status(400).json({ error: 'Formato de email inválido' });

    const [rows] = await pool.query('SELECT id, nombre AS name, email, id_perfil FROM usuario WHERE email = ?', [email]);

    if (rows.length > 0) return res.json({ exists: true, user: rows[0] });
    return res.json({ exists: false });
  } catch (err) {
    console.error('/checkEmail error:', err);
    return res.status(500).json({ error: 'Error servidor' });
  }
}

export async function registrar(req, res, { pool } = {}) {
  try {
    const { nombre, email, password, altura, peso, edad, nivelActividad, sexo, alergias, otrasAlergias, recaptchaToken, id_perfil } = req.body;

  // Usar la validación centralizada
  const errores = validarRegistro(email, password, altura, peso, edad);
  if (errores.length) return res.status(400).json({ message: 'Validación fallida', errores });

  const RECAPTCHA_SECRET = (typeof process !== 'undefined' && process.env && process.env.RECAPTCHA_SECRET) ? process.env.RECAPTCHA_SECRET : '';
  if (RECAPTCHA_SECRET) {
      if (!recaptchaToken) return res.status(400).json({ message: 'Falta verificación de captcha' });
      try {
        const r = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `secret=${encodeURIComponent(RECAPTCHA_SECRET)}&response=${encodeURIComponent(recaptchaToken)}`
        });
        const rr = await r.json();
        if (!rr.success) return res.status(400).json({ message: 'Captcha inválido', details: rr });
      } catch (e) {
        console.error('Recaptcha verify error', e);
        return res.status(500).json({ message: 'Error al verificar captcha' });
      }
    } else {
      console.warn('RECAPTCHA_SECRET no configurado; se omite verificación de captcha (entorno local)');
    }

    const [rows] = await pool.query('SELECT id FROM usuario WHERE email = ?', [email]);
    if (rows.length) return res.status(400).json({ message: 'El correo ya está registrado' });

    const [dietInsert] = await pool.query('INSERT INTO dieta (nombre) VALUES (?)', [`Dieta de ${nombre || email}`]);
    const newDietId = dietInsert.insertId;

    const hash = await bcrypt.hash(password, 10);
    const perfil = [2,3].includes(Number(id_perfil)) ? Number(id_perfil) : 2;
    const [userInsert] = await pool.query(
      `INSERT INTO usuario 
      (nombre, email, password, altura, peso, edad, actividad_fisica, sexo, id_perfil, id_dieta, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, email, hash, altura, peso, edad, nivelActividad, sexo, perfil, newDietId, 'activo']
    );

    const newUserId = userInsert.insertId;

    if (Array.isArray(alergias)) {
      for (const alergia of alergias) {
        if (alergia !== 'ninguna') await pool.query('INSERT INTO categoria_alergico (id_usuario, nombre) VALUES (?, ?)', [newUserId, alergia]);
      }
    }

    if (otrasAlergias && otrasAlergias.trim() !== '') {
      await pool.query('INSERT INTO categoria_alergico (id_usuario, nombre) VALUES (?, ?)', [newUserId, otrasAlergias.trim()]);
    }

    return res.json({ message: 'Usuario registrado exitosamente' });
  } catch (err) {
    console.error('/registrar error:', err);
    return res.status(500).json({ error: 'Error servidor registro' });
  }
}

export async function login(req, res, { pool } = {}) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Falta email o password' });

    const [rows] = await pool.query('SELECT * FROM usuario WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(401).json({ message: 'Correo o contraseña incorrectos' });

    const usuario = rows[0];
    if (usuario.estado === 'inactivo') return res.status(403).json({ message: 'Tu cuenta está inactiva. Contacta al administrador.' });

    const ok = await bcrypt.compare(password, usuario.password);
    if (!ok) return res.status(401).json({ message: 'Correo o contraseña incorrectos' });

    if (!usuario.id_dieta || usuario.id_dieta === 1) {
      const [dietInsert] = await pool.query('INSERT INTO dieta (nombre) VALUES (?)', [`Dieta de ${usuario.nombre || usuario.email}`]);
      const newDietId = dietInsert.insertId;
      await pool.query('UPDATE usuario SET id_dieta = ? WHERE id = ?', [newDietId, usuario.id]);
      usuario.id_dieta = newDietId;
    }

    const [alRows] = await pool.query('SELECT nombre FROM categoria_alergico WHERE id_usuario = ?', [usuario.id]);
    const alergias = alRows.map(r => r.nombre);

    return res.json({
      message: 'Login exitoso',
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        altura: usuario.altura,
        peso: usuario.peso,
        edad: usuario.edad,
        id_perfil: usuario.id_perfil,
        id_dieta: usuario.id_dieta,
        actividad_fisica: usuario.actividad_fisica || usuario.nivelActividad || null,
        sexo: usuario.sexo,
        alergias,
        otrasAlergias: usuario.otrasAlergias || null
      }
    });
  } catch (err) {
    console.error('/login error:', err);
    return res.status(500).json({ error: 'Error servidor login' });
  }
}
