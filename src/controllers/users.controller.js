// Validaciones relacionadas a usuarios (adaptadas desde utils/validation.js)
function validarUsuario({ email, password, altura, peso, edad } = {}, { partial = false } = {}) {
  const errores = [];

  const ageNum = edad !== undefined && edad !== null && String(edad) !== '' ? Number(edad) : undefined;
  const weightNum = peso !== undefined && peso !== null && String(peso) !== '' ? Number(peso) : undefined;
  let heightNum = altura !== undefined && altura !== null && String(altura) !== '' ? Number(altura) : undefined;

  // si altura vino en metros -> cm
  if (heightNum !== undefined && heightNum < 10) heightNum = heightNum * 100;

  // Email
  if (!partial || email !== undefined) {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(String(email || ''))) errores.push('El correo tiene un formato inválido.');
    if (email && String(email).length > 50) errores.push('El correo no puede superar los 50 caracteres.');
  }

  // Password: mínimo 6 caracteres, letras y números
  if (!partial || password !== undefined) {
    const regexPass = /^(?=.*[a-zA-Z])(?=.*\d).{6,}$/;
    if (!regexPass.test(String(password || ''))) errores.push('La contraseña debe tener al menos 6 caracteres, incluir letras y números.');
  }

  if (!partial || edad !== undefined) {
    if (ageNum === undefined || isNaN(ageNum) || ageNum <= 15 || ageNum >= 100) errores.push('La edad debe ser mayor a 15 y no puede superar los 100.');
  }

  if (!partial || peso !== undefined) {
    if (weightNum === undefined || isNaN(weightNum) || weightNum <= 30 || weightNum >= 170) errores.push('El peso debe ser mayor a 30kg y no puede superar los 170kg.');
  }

  if (!partial || altura !== undefined) {
    if (heightNum === undefined || isNaN(heightNum) || heightNum <= 80 || heightNum >= 250) errores.push('La altura debe ser mayor a 80 cm y no puede superar los 2,50m.');
  }

  return errores;
}

export async function getUsers(req, res, { pool } = {}) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id, nombre, email, password, altura, peso, edad, 
        actividad_fisica, sexo, id_perfil, id_dieta, estado
      FROM usuario
      ORDER BY id ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
}

export async function createUser(req, res, { pool } = {}) {
  try {
    const { nombre, email, password, altura, peso, edad, actividad_fisica, sexo, id_perfil, id_dieta } = req.body;

    // Validar campos obligatorios y rangos
    const errores = validarUsuario({ email, password, altura, peso, edad }, { partial: false });
    if (errores.length > 0) return res.status(400).json({ errors: errores });

    const [result] = await pool.query(`
      INSERT INTO usuario 
        (nombre, email, password, altura, peso, edad, actividad_fisica, sexo, id_perfil, id_dieta, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'activo')
    `, [nombre, email, password, altura, peso, edad, actividad_fisica, sexo, id_perfil, id_dieta]);

    res.json({ id: result.insertId, message: 'Usuario creado correctamente' });
  } catch (err) {
    console.error('Error al crear usuario:', err);
    res.status(500).json({ message: 'Error al crear usuario' });
  }
}

export async function patchUserFields(req, res, { pool } = {}) {
  try {
    const { id } = req.params;
    const campos = req.body;
    const setStr = Object.keys(campos).map(c => `${c} = ?`).join(', ');
    const values = Object.values(campos);
    await pool.query(`UPDATE usuario SET ${setStr} WHERE id = ?`, [...values, id]);
    res.json({ message: 'Usuario actualizado correctamente' });
  } catch (err) {
    console.error('Error al actualizar usuario:', err);
    res.status(500).json({ message: 'Error al actualizar usuario' });
  }
}

export async function deactivateUser(req, res, { pool } = {}) {
  try {
    const { id } = req.params;
    await pool.query('UPDATE usuario SET estado = \'inactivo\' WHERE id = ?', [id]);
    res.json({ message: 'Usuario inactivado correctamente' });
  } catch (err) {
    console.error('Error al inactivar usuario:', err);
    res.status(500).json({ message: 'Error al inactivar usuario' });
  }
}

export async function activateUser(req, res, { pool } = {}) {
  try {
    const { id } = req.params;
    const [result] = await pool.query('UPDATE usuario SET estado = \'activo\' WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json({ message: 'Usuario activado correctamente' });
  } catch (err) {
    console.error('Error al activar usuario:', err);
    res.status(500).json({ message: 'Error al activar usuario' });
  }
}

export async function deleteUser(req, res, { pool } = {}) {
  try {
    const { id } = req.params;
    const [result] = await pool.query('UPDATE usuario SET estado = \'inactivo\' WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json({ message: 'Usuario marcado como inactivo correctamente' });
  } catch (err) {
    console.error('Error al marcar usuario como inactivo', err);
    res.status(500).json({ message: 'Error al marcar usuario como inactivo' });
  }
}

export async function patchUserTransactional(req, res, { pool } = {}) {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const { nombre, altura, peso, edad, actividad_fisica, sexo, id_perfil, id_dieta, estado, alergias } = req.body || {};

    await connection.beginTransaction();

    const [rows] = await connection.query('SELECT * FROM usuario WHERE id = ?', [id]);
    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    const current = rows[0];

    const updated = {
      nombre: nombre ?? current.nombre,
      altura: altura ?? current.altura,
      peso: peso ?? current.peso,
      edad: edad ?? current.edad,
      actividad_fisica: actividad_fisica ?? current.actividad_fisica,
      sexo: sexo ?? current.sexo,
      id_perfil: id_perfil ?? current.id_perfil,
      id_dieta: id_dieta ?? current.id_dieta,
      estado: estado ?? current.estado,
    };

    // Validar campos proporcionados (validación parcial)
    const errores = validarUsuario({ edad: updated.edad, peso: updated.peso, altura: updated.altura, email: updated.email, password: updated.password }, { partial: true });
    if (errores.length > 0) return res.status(400).json({ errors: errores });

    await connection.query(
      `UPDATE usuario
       SET nombre = ?, altura = ?, peso = ?, edad = ?, actividad_fisica = ?, sexo = ?,
           id_perfil = ?, id_dieta = ?, estado = ?
       WHERE id = ?`,
      [
        updated.nombre,
        updated.altura,
        updated.peso,
        updated.edad,
        updated.actividad_fisica,
        updated.sexo,
        updated.id_perfil,
        updated.id_dieta,
        updated.estado,
        id,
      ],
    );

    if (Array.isArray(alergias)) {
      await connection.query('DELETE FROM categoria_alergico WHERE id_usuario = ?', [id]);
      if (alergias.length > 0) {
        const values = alergias.map((nombre) => [id, nombre]);
        await connection.query('INSERT INTO categoria_alergico (id_usuario, nombre) VALUES ?', [values]);
      }
    }

    await connection.commit();

    res.json({ message: 'Usuario actualizado correctamente', usuario: { id, ...updated, alergias: alergias || [] } });
  } catch (err) {
    await connection.rollback();
    console.error('PATCH /user/:id error:', err);
    res.status(500).json({ message: 'Error al actualizar usuario' });
  } finally {
    connection.release();
  }
}

export async function getUserById(req, res, { pool } = {}) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT id, nombre, email, altura, peso, edad, actividad_fisica, sexo, id_perfil, id_dieta, estado FROM usuario WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
    const user = rows[0];
    const [alRows] = await pool.query('SELECT nombre FROM categoria_alergico WHERE id_usuario = ?', [id]);
    const alergias = alRows.map(r => r.nombre);
    res.json({ ...user, alergias });
  } catch (err) {
    console.error('GET /user/:id error:', err);
    res.status(500).json({ message: 'Error servidor' });
  }
}
