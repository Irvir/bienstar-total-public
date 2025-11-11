import { getTableName } from '../utils/db.js';

export async function searchFoods(req, res, { pool } = {}) {
  try {
    const q = (req.query.q || '').trim();
    const categoria = (req.query.categoria || '').trim();
    const tableName = getTableName('alimento');

    const params = [];
    let baseWhere = "estado = 'activo'";
    let sql = `SELECT * FROM ${tableName} WHERE ${baseWhere}`;

    if (q) {
      sql += ' AND nombre LIKE ?';
      params.push(`%${q}%`);
    }

    if (categoria) {
      sql += ' AND categoria = ?';
      params.push(categoria);
    }

    sql += ' LIMIT 100';

    let rows;
    try {
      const result = await pool.query(sql, params);
      rows = result[0];
    } catch (err) {
      if (err && err.code === 'ER_BAD_FIELD_ERROR') {
        const fallbackSql = `SELECT * FROM ${tableName} WHERE 1=1` + (q ? ' AND nombre LIKE ?' : '') + (categoria ? ' AND categoria = ?' : '') + ' LIMIT 100';
        const fallbackParams = [];
        if (q) fallbackParams.push(`%${q}%`);
        if (categoria) fallbackParams.push(categoria);
        const result2 = await pool.query(fallbackSql, fallbackParams);
        rows = result2[0];
      } else {
        throw err;
      }
    }

    const normalized = rows.map((r) => {
      const raw = r.image || r.imagen || r.image_url || r.path || null;
      let image = raw || null;
      if (image && typeof image === 'string' && !image.startsWith('http') && !image.startsWith('/')) {
        if (/\.(jpg|jpeg|png|gif|avif|webp|svg)$/i.test(image)) {
          image = `/uploads/${image}`;
        } else {
          image = `/Imagenes/Alimentos/${image}`;
        }
      }
      return { ...r, image_url: image };
    });

    res.json(normalized);
  } catch (err) {
    console.error('/food-search error:', err);
    res.status(500).json({ error: 'Error buscando alimentos' });
  }
}

export async function getFoodById(req, res, { pool } = {}) {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'ID inválido' });

    const tableName = getTableName('alimento');
    let rows;
    try {
      const result = await pool.query(`SELECT * FROM ${tableName} WHERE id = ? AND estado = 'activo' LIMIT 1`, [id]);
      rows = result[0];
    } catch (err) {
      if (err && err.code === 'ER_BAD_FIELD_ERROR') {
        const result2 = await pool.query(`SELECT * FROM ${tableName} WHERE id = ? LIMIT 1`, [id]);
        rows = result2[0];
      } else {
        throw err;
      }
    }
    
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Alimento no encontrado' });
    
    const r = rows[0];
    const raw = r.image || r.imagen || r.image_url || r.path || null;
    let image = raw || null;
    
    if (image && typeof image === 'string' && !image.startsWith('http') && !image.startsWith('/')) {
      if (/\.(jpg|jpeg|png|gif|avif|webp|svg)$/i.test(image)) {
        image = `/uploads/${image}`;
      } else {
        image = `/Imagenes/Alimentos/${image}`;
      }
    }
    
    res.json({ ...r, image_url: image });
  } catch (err) {
    console.error('/food/:id error:', err);
    res.status(500).json({ error: 'Error obteniendo alimento' });
  }
}

export async function createFood(req, res, { pool, upload } = {}) {
  try {
    const tableName = getTableName('alimento');
    const { nombre, categoria, Energia, Proteinas, Carbohidratos, Grasas } = req.body;

    if (!nombre || !categoria) {
      return res.status(400).json({ error: 'Nombre y categoría son requeridos' });
    }

    const [result] = await pool.query(
      `INSERT INTO ${tableName} (nombre, categoria, Energia, Proteinas, Carbohidratos, Grasas, estado) VALUES (?, ?, ?, ?, ?, ?, 'activo')`,
      [nombre, categoria, Energia, Proteinas, Carbohidratos, Grasas],
    );

    res.status(201).json({
      id: result.insertId,
      nombre,
      categoria,
      Energia,
      Proteinas,
      Carbohidratos,
      Grasas,
      estado: 'activo',
    });
  } catch (err) {
    console.error('Error creando alimento:', err);
    res.status(500).json({ error: 'Error creando alimento' });
  }
}

export async function updateFood(req, res, { pool } = {}) {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'ID inválido' });

    const tableName = getTableName('alimento');
    const { nombre, categoria, Energia, Proteinas, Carbohidratos, Grasas } = req.body;

    // Validar que el alimento existe
    let exists;
    try {
      const r = await pool.query(`SELECT id FROM ${tableName} WHERE id = ? AND estado = 'activo' LIMIT 1`, [id]);
      exists = r[0];
    } catch (err) {
      if (err && err.code === 'ER_BAD_FIELD_ERROR') {
        const r2 = await pool.query(`SELECT id FROM ${tableName} WHERE id = ? LIMIT 1`, [id]);
        exists = r2[0];
      } else {
        throw err;
      }
    }
    if (process.env.NODE_ENV === 'test') console.log('updateFood: exists rows =', exists.length, exists);
    if (!exists || exists.length === 0) {
      return res.status(404).json({ error: 'Alimento no encontrado' });
    }

    // Actualizar alimento
    await pool.query(
      `UPDATE ${tableName} SET nombre = ?, categoria = ?, Energia = ?, Proteinas = ?, Carbohidratos = ?, Grasas = ? WHERE id = ?`,
      [nombre, categoria, Energia, Proteinas, Carbohidratos, Grasas, id],
    );

    res.json({
      id,
      nombre,
      categoria,
      Energia,
      Proteinas,
      Carbohidratos,
      Grasas,
    });
  } catch (err) {
    console.error('Error actualizando alimento:', err);
    res.status(500).json({ error: 'Error actualizando alimento' });
  }
}

export async function deleteFood(req, res, { pool } = {}) {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'ID inválido' });

    const tableName = getTableName('alimento');
    

    // Validar que el alimento existe y está activo (o simplemente existe si no hay columna 'estado')
    let exists;
    try {
      const r = await pool.query(`SELECT id FROM ${tableName} WHERE id = ? AND estado = 'activo' LIMIT 1`, [id]);
      exists = r[0];
    } catch (err) {
      if (err && err.code === 'ER_BAD_FIELD_ERROR') {
        const r2 = await pool.query(`SELECT id FROM ${tableName} WHERE id = ? LIMIT 1`, [id]);
        exists = r2[0];
      } else {
        throw err;
      }
    }
    if (!exists || exists.length === 0) {
      return res.status(404).json({ error: 'Alimento no encontrado' });
    }

    // Marcar como inactivo en lugar de eliminar, pero si la columna 'estado' no existe, eliminar el registro
    try {
      await pool.query(`UPDATE ${tableName} SET estado = 'inactivo' WHERE id = ?`, [id]);
    } catch (err) {
      if (err && err.code === 'ER_BAD_FIELD_ERROR') {
        // No existe la columna estado: realizar un DELETE como fallback
        await pool.query(`DELETE FROM ${tableName} WHERE id = ?`, [id]);
      } else {
        throw err;
      }
    }

    res.json({ message: 'Alimento marcado como inactivo exitosamente' });
  } catch (err) {
    console.error('Error marcando alimento como inactivo:', err);
    res.status(500).json({ error: 'Error marcando alimento como inactivo' });
  }
}
