export async function getDiet(req, res, { pool } = {}) {
  try {
    const id_dieta = parseInt(req.query.id_dieta);
    if (!id_dieta) return res.status(400).json({ message: "Falta id_dieta" });

    const [rows] = await pool.query(
      `
      SELECT 
        d.numero_dia AS dia,
        c.tipo AS tipo_comida,
        a.nombre AS alimento,
        ca.cantidad
      FROM dia d
      JOIN comida c ON c.id_dia = d.id
      JOIN comida_alimento ca ON ca.id_comida = c.id
      JOIN alimento a ON a.id = ca.id_alimento
      WHERE d.id_dieta = ?
      ORDER BY 
        d.numero_dia, 
        FIELD(c.tipo, 'Desayuno', 'Almuerzo', 'Cena', 'Snack', 'Snack2')
      `,
      [id_dieta]
    );

    res.json(rows);
  } catch (err) {
    console.error("/get-diet error:", err);
    res.status(500).json({ message: "Error al obtener dieta" });
  }
}

export async function saveDiet(req, res, { pool } = {}) {
  const { id_dieta, comidas } = req.body || {};

  if (!id_dieta || !comidas || !comidas.length) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    for (const comida of comidas) {
      const { id: id_alimento, dia, tipoComida, cantidad } = comida;

      if (!id_alimento || !dia || !tipoComida) {
        console.warn("Datos incompletos para alimento:", comida);
        continue;
      }

      // Verificar o crear día
      let [diaRows] = await connection.query(
        "SELECT id FROM dia WHERE id_dieta = ? AND numero_dia = ?",
        [id_dieta, dia]
      );

      let id_dia;
      if (diaRows.length > 0) {
        id_dia = diaRows[0].id;
      } else {
        const [insertDia] = await connection.query(
          "INSERT INTO dia (id_dieta, numero_dia) VALUES (?, ?)",
          [id_dieta, dia]
        );
        id_dia = insertDia.insertId;
      }

      // Verificar o crear comida
      let [comidaRows] = await connection.query(
        "SELECT id FROM comida WHERE id_dia = ? AND tipo = ?",
        [id_dia, tipoComida]
      );

      let id_comida;
      if (comidaRows.length > 0) {
        id_comida = comidaRows[0].id;
      } else {
        const [insertComida] = await connection.query(
          "INSERT INTO comida (id_dia, tipo) VALUES (?, ?)",
          [id_dia, tipoComida]
        );
        id_comida = insertComida.insertId;
      }

      // Insertar alimento en la comida (N:M)
      await connection.query(
        `
        INSERT INTO comida_alimento (id_comida, id_alimento, cantidad)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE cantidad = VALUES(cantidad)
        `,
        [id_comida, id_alimento, cantidad || 1]
      );
    }

    await connection.commit();
    res.json({ message: "✅ Dieta guardada correctamente" });
  } catch (error) {
    await connection.rollback();
    console.error("❌ Error al guardar dieta:", error);
    res.status(500).json({ error: "Error al guardar dieta" });
  } finally {
    connection.release();
  }
}

export async function clearDay(req, res, { pool } = {}) {
  try {
    const { id_dieta, id_diet, dia } = req.body || {};
    const idDietaNum = Number(id_dieta || id_diet);
    const diaNum = Number(dia);
    if (!idDietaNum || !diaNum) {
      return res.status(400).json({ message: "Faltan parámetros" });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [diaRows] = await connection.query(
        "SELECT id FROM dia WHERE id_dieta = ? AND numero_dia = ?",
        [idDietaNum, diaNum]
      );

      if (diaRows.length === 0) {
        await connection.commit();
        return res.json({ success: true, message: "No había registros para ese día" });
      }

      const id_dia = diaRows[0].id;

      const [comidaRows] = await connection.query(
        "SELECT id FROM comida WHERE id_dia = ?",
        [id_dia]
      );

      if (comidaRows.length > 0) {
        const comidaIds = comidaRows.map(r => r.id);

        await connection.query(
          `DELETE FROM comida_alimento WHERE id_comida IN (${comidaIds.map(() => '?').join(',')})`,
          comidaIds
        );

        await connection.query("DELETE FROM comida WHERE id_dia = ?", [id_dia]);
      }

      await connection.commit();
      res.json({ success: true, message: "Día limpiado correctamente" });
    } catch (e) {
      await connection.rollback();
      console.error("/clear-day tx error:", e);
      res.status(500).json({ message: "Error interno" });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error("/clear-day error:", err);
    res.status(500).json({ message: "Error interno" });
  }
}

export async function deleteDietItem(req, res, { pool } = {}) {
  try {
    const { id_dieta, id_diet, id_alimento, id_food, dia, tipoComida } = req.body || {};

    const idDietaNum = Number(id_dieta || id_diet);
    const idAlimentoNum = Number(id_alimento || id_food);
    const diaNum = Number(dia);

    if (!idDietaNum || !idAlimentoNum || !diaNum || !tipoComida) {
      return res.status(400).json({ error: "Faltan parámetros" });
    }

    const [diaRows] = await pool.query(
      "SELECT id FROM dia WHERE id_dieta = ? AND numero_dia = ?",
      [idDietaNum, diaNum]
    );
    if (diaRows.length === 0) {
      return res.status(404).json({ error: "Día no encontrado en la dieta" });
    }

    const id_dia = diaRows[0].id;

    // Buscar la comida
    const [comidaRows] = await pool.query(
      "SELECT id FROM comida WHERE id_dia = ? AND tipo = ?",
      [id_dia, tipoComida]
    );
    if (comidaRows.length === 0) {
      return res.status(404).json({ error: "Comida no encontrada en ese día" });
    }

    const id_comida = comidaRows[0].id;

    // Eliminar el alimento de la relación
    const [delResult] = await pool.query(
      "DELETE FROM comida_alimento WHERE id_comida = ? AND id_alimento = ?",
      [id_comida, idAlimentoNum]
    );

    if (delResult.affectedRows === 0) {
      return res.status(404).json({ error: "El alimento no estaba asociado a esa comida" });
    }

    res.json({ success: true, message: "Alimento eliminado correctamente" });
  } catch (err) {
    console.error("/delete-diet-item error:", err);
    res.status(500).json({ error: "Error interno" });
  }
}

export async function getCalendar(req, res, { pool } = {}) {
  const { fecha } = req.params || {};

  try {
    const headerUser = req.get('x-user-id');
    const userId = (req.user && req.user.id)
      ? Number(req.user.id)
      : (headerUser ? Number(headerUser) : Number(req.query.userId || req.query.id));
    if (!userId) return res.status(400).json({ message: 'Falta userId' });

    const [usuarioRows] = await pool.query(
      `SELECT peso, id_dieta FROM usuario WHERE id = ? LIMIT 1`,
      [userId]
    );

    if (!usuarioRows || usuarioRows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const { peso, id_dieta } = usuarioRows[0];

    let dietaInfo = { id: id_dieta || null, nombre: null, items: [] };
    if (id_dieta) {
      const [dNameRows] = await pool.query(
        `SELECT nombre FROM dieta WHERE id_dieta = ? LIMIT 1`,
        [id_dieta]
      );
      dietaInfo.nombre = dNameRows && dNameRows[0] ? dNameRows[0].nombre : null;

      const [dietaRows] = await pool.query(
        `
        SELECT 
          d.numero_dia AS dia,
          c.tipo AS tipo_comida,
          a.nombre AS alimento,
          ca.cantidad
        FROM dia d
        JOIN comida c ON c.id_dia = d.id
        JOIN comida_alimento ca ON ca.id_comida = c.id
        JOIN alimento a ON a.id = ca.id_alimento
        WHERE d.id_dieta = ?
        ORDER BY 
          d.numero_dia, 
          FIELD(c.tipo, 'Desayuno', 'Almuerzo', 'Cena', 'Snack', 'Snack2')
        `,
        [id_dieta]
      );
      dietaInfo.items = dietaRows || [];
    }

    res.json({ fecha, peso: peso ?? null, dieta: dietaInfo });
  } catch (err) {
    console.error(" Error en GET /api/calendario/:fecha:", err);
    res.status(500).json({ message: "Error al obtener datos del día" });
  }
}

export async function ensureDiet(req, res, { pool } = {}) {
  try {
    // Accept several common field names to be tolerant with clients
    const body = req.body || {};
    const user_id = body.user_id ?? body.userId ?? body.id ?? body.user ?? null;
    let email = body.email ?? body.correo ?? body.mail ?? null;

    let userId = user_id ? Number(user_id) : null;

    if (email && typeof email === 'string') email = email.trim().toLowerCase();

    // If we don't have a numeric userId, try resolving by email
    if (!userId) {
      if (!email) return res.status(400).json({ message: 'Se requiere user_id o email' });
      const [uRows] = await pool.query('SELECT id, id_dieta FROM usuario WHERE LOWER(email) = ? LIMIT 1', [email]);
      if (!uRows || uRows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
      userId = uRows[0].id;
      if (uRows[0].id_dieta) return res.json({ id_dieta: uRows[0].id_dieta });
    } else {
      const [uRows] = await pool.query('SELECT id_dieta FROM usuario WHERE id = ? LIMIT 1', [userId]);
      if (!uRows || uRows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
      if (uRows[0].id_dieta) return res.json({ id_dieta: uRows[0].id_dieta });
    }

    // Create a new dieta and assign it to the user
    const nombre = `Dieta_${userId}_${Date.now()}`;
    const [dRes] = await pool.query('INSERT INTO dieta (nombre) VALUES (?)', [nombre]);
    const id_dieta = dRes.insertId;

    await pool.query('UPDATE usuario SET id_dieta = ? WHERE id = ?', [id_dieta, userId]);

    res.json({ id_dieta });
  } catch (err) {
    console.error('POST /ensure-diet error:', err);
    res.status(500).json({ message: 'Error interno' });
  }
}
