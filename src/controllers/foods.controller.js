import { getTableName } from '../utils/db.js';

// Controlador ligero para búsqueda pública de alimentos y detalle por id
export async function searchFoods(req, res, { pool } = {}) {
  try {
    const q = (req.query.q || '').trim();
    const categoria = (req.query.categoria || '').trim();
    const tableName = getTableName('alimento');

    let sql = `SELECT * FROM ${tableName} WHERE estado = 'activo'`;
    const params = [];

    if (q) {
      sql += ' AND nombre LIKE ?';
      params.push(`%${q}%`);
    }

    if (categoria) {
      sql += ' AND categoria = ?';
      params.push(categoria);
    }

    sql += ' LIMIT 100';

    const [rows] = await pool.query(sql, params);

    // Normalizar mínima información usada por cliente
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
    const [rows] = await pool.query(`SELECT * FROM ${tableName} WHERE id = ? AND estado = 'activo' LIMIT 1`, [id]);
    
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

    // Validaciones básicas
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
    const [exists] = await pool.query(
      `SELECT id FROM ${tableName} WHERE id = ? AND estado = 'activo' LIMIT 1`,
      [id],
    );
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
    
    // Validar que el alimento existe y está activo
    const [exists] = await pool.query(
      `SELECT id FROM ${tableName} WHERE id = ? AND estado = 'activo' LIMIT 1`,
      [id],
    );
    if (!exists || exists.length === 0) {
      return res.status(404).json({ error: 'Alimento no encontrado' });
    }

    // Marcar como inactivo en lugar de eliminar
    await pool.query(
      `UPDATE ${tableName} SET estado = 'inactivo' WHERE id = ?`,
      [id],
    );

    res.json({ message: 'Alimento marcado como inactivo exitosamente' });
  } catch (err) {
    console.error('Error marcando alimento como inactivo:', err);
    res.status(500).json({ error: 'Error marcando alimento como inactivo' });
  }
}
