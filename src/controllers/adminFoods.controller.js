import { getTableName } from '../utils/db.js';

// Controladores para endpoints /admin/foods
// Reciben (req, res, { pool }) para facilitar pruebas e inyección de dependencias
export async function uploadImage(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se subió la imagen' });
    // Devolver la URL pública para compatibilidad con cliente
    return res.json({ image_url: `/uploads/${req.file.filename}`, filename: req.file.filename });
  } catch (error) {
    console.error('/admin/foods/upload-image error:', error);
    return res.status(500).json({ error: 'Error subiendo imagen' });
  }
}

export async function listFoods(req, res, { pool } = {}) {
  try {
    const tableName = getTableName('alimento');
    const categoria = req.query.categoria;
    const sql = categoria ? `SELECT * FROM ${tableName} WHERE categoria = ?` : `SELECT * FROM ${tableName}`;
    const params = categoria ? [categoria] : [];
    const [rows] = await pool.query(sql, params);
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
    console.error('/admin/foods error:', err);
    const payload = { error: 'Error al obtener alimentos' };
    res.status(500).json(payload);
  }
}

export async function createFood(req, res, { pool } = {}) {
  try {
    // Log body for easier debugging in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('/admin/foods POST body:', req.body);
    }

    // Helper to normalize numeric fields: convert empty strings to null, keep numbers
    const normalizeNumber = (v) => {
      if (v === null || v === undefined) return null;
      if (typeof v === 'number') return Number.isFinite(v) ? v : null;
      const s = String(v).trim();
      if (s === '') return null;
      const n = Number(s);
      return Number.isNaN(n) ? null : n;
    };

    const {
      image_url,
      nombre,
      categoria,
      Energia,
      Humedad,
      Cenizas,
      Proteinas,
      H_de_C_disp,
      Azucares_totales,
      Fibra_dietetica_total,
      Lipidos_totales,
      Ac_grasos_totales,
      Ac_grasos_poliinsat,
      Ac_grasos_trans,
      Colesterol,
      Vitamina_A,
      Vitamina_C,
      Vitamina_D,
      Vitamina_E,
      Vitamina_K,
      Vitamina_B1,
      Vitamina_B2,
      Niacina,
      Vitamina_B6,
      Ac_pantotenico,
      Vitamina_B12,
      Folatos,
      Sodio,
      Potasio,
      Calcio,
      Fosforo,
      Magnesio,
      Hierro,
      Zinc,
      Cobre,
      Selenio,

    } = req.body;

    const tableName = getTableName('alimento');

    // Normalize numeric fields to avoid SQL errors when empty strings are provided
    const params = [
      image_url || null,
      nombre,
      categoria || null,
      normalizeNumber(Energia),
      normalizeNumber(Humedad),
      normalizeNumber(Cenizas),
      normalizeNumber(Proteinas),
      normalizeNumber(H_de_C_disp),
      normalizeNumber(Azucares_totales),
      normalizeNumber(Fibra_dietetica_total),
      normalizeNumber(Lipidos_totales),
      normalizeNumber(Ac_grasos_totales),
      normalizeNumber(Ac_grasos_poliinsat),
      normalizeNumber(Ac_grasos_trans),
      normalizeNumber(Colesterol),
      normalizeNumber(Vitamina_A),
      normalizeNumber(Vitamina_C),
      normalizeNumber(Vitamina_D),
      normalizeNumber(Vitamina_E),
      normalizeNumber(Vitamina_K),
      normalizeNumber(Vitamina_B1),
      normalizeNumber(Vitamina_B2),
      normalizeNumber(Niacina),
      normalizeNumber(Vitamina_B6),
      normalizeNumber(Ac_pantotenico),
      normalizeNumber(Vitamina_B12),
      normalizeNumber(Folatos),
      normalizeNumber(Sodio),
      normalizeNumber(Potasio),
      normalizeNumber(Calcio),
      normalizeNumber(Fosforo),
      normalizeNumber(Magnesio),
      normalizeNumber(Hierro),
      normalizeNumber(Zinc),
      normalizeNumber(Cobre),
      normalizeNumber(Selenio),
    ];

    const columns = [
      'image_url', 'nombre', 'categoria', 'Energia', 'Humedad', 'Cenizas', 'Proteinas', 'H_de_C_disp',
      'Azucares_totales', 'Fibra_dietetica_total', 'Lipidos_totales', 'Ac_grasos_totales',
      'Ac_grasos_poliinsat', 'Ac_grasos_trans', 'Colesterol', 'Vitamina_A', 'Vitamina_C',
      'Vitamina_D', 'Vitamina_E', 'Vitamina_K', 'Vitamina_B1', 'Vitamina_B2', 'Niacina',
      'Vitamina_B6', 'Ac_pantotenico', 'Vitamina_B12', 'Folatos', 'Sodio', 'Potasio',
      'Calcio', 'Fosforo', 'Magnesio', 'Hierro', 'Zinc', 'Cobre', 'Selenio',
    ];

    const placeholders = new Array(params.length).fill('?').join(', ');
    const sql = `INSERT INTO ${tableName} (${columns.join(',')}) VALUES (${placeholders});`;
    const [result] = await pool.query(sql, params);

    res.status(201).json({ id: result.insertId, nombre });
  } catch (err) {
    console.error('/admin/foods POST error:', err);
    res.status(500).json({ error: 'Error al crear el alimento' });
  }
}

export async function updateFood(req, res, { pool } = {}) {
  try {
    const { id } = req.params;
    const {
      nombre,
      categoria,
      Energia,
      Humedad,
      Cenizas,
      Proteinas,
      H_de_C_disp,
      Azucares_totales,
      Fibra_dietetica_total,
      Lipidos_totales,
      Ac_grasos_totales,
      Ac_grasos_poliinsat,
      Ac_grasos_trans,
      Colesterol,
      Vitamina_A,
      Vitamina_C,
      Vitamina_D,
      Vitamina_E,
      Vitamina_K,
      Vitamina_B1,
      Vitamina_B2,
      Niacina,
      Vitamina_B6,
      Ac_pantotenico,
      Vitamina_B12,
      Folatos,
      Sodio,
      Potasio,
      Calcio,
      Fosforo,
      Magnesio,
      Hierro,
      Zinc,
      Cobre,
      Selenio,
      image_url,
    } = req.body;

    const tableName = getTableName('alimento');
    const [result] = await pool.query(
      `UPDATE ${tableName} SET 
         nombre = ?, categoria = ?, Energia = ?, Humedad = ?, Cenizas = ?, Proteinas = ?, H_de_C_disp = ?, Azucares_totales = ?, Fibra_dietetica_total = ?, Lipidos_totales = ?, Ac_grasos_totales = ?, Ac_grasos_poliinsat = ?, Ac_grasos_trans = ?, Colesterol = ?, Vitamina_A = ?, Vitamina_C = ?, Vitamina_D = ?, Vitamina_E = ?, Vitamina_K = ?, Vitamina_B1 = ?, Vitamina_B2 = ?, Niacina = ?, Vitamina_B6 = ?, Ac_pantotenico = ?, Vitamina_B12 = ?, Folatos = ?, Sodio = ?, Potasio = ?, Calcio = ?, Fosforo = ?, Magnesio = ?, Hierro = ?, Zinc = ?, Cobre = ?, Selenio = ?, image_url = ?
       WHERE id = ?`,
      [
        nombre,
        categoria || null,
        Energia,
        Humedad,
        Cenizas,
        Proteinas,
        H_de_C_disp,
        Azucares_totales,
        Fibra_dietetica_total,
        Lipidos_totales,
        Ac_grasos_totales,
        Ac_grasos_poliinsat,
        Ac_grasos_trans,
        Colesterol,
        Vitamina_A,
        Vitamina_C,
        Vitamina_D,
        Vitamina_E,
        Vitamina_K,
        Vitamina_B1,
        Vitamina_B2,
        Niacina,
        Vitamina_B6,
        Ac_pantotenico,
        Vitamina_B12,
        Folatos,
        Sodio,
        Potasio,
        Calcio,
        Fosforo,
        Magnesio,
        Hierro,
        Zinc,
        Cobre,
        Selenio,
        image_url,
        id,
      ],
    );

    if (result.affectedRows === 0) return res.status(404).json({ message: 'Alimento no encontrado' });

    res.json({ message: 'Alimento actualizado correctamente' });
  } catch (err) {
    console.error('/admin/foods/:id PUT error:', err);
    res.status(500).json({ error: 'Error al actualizar alimento' });
  }
}

export async function deleteFood(req, res, { pool } = {}) {
  try {
    const { id } = req.params;
    const tableName = getTableName('alimento');
    // Intentar marcar como inactivo por compatibilidad con algunos esquemas
    try {
      const [result] = await pool.query(`UPDATE ${tableName} SET estado = 'inactivo' WHERE id = ?`, [id]);
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Alimento no encontrado' });
      return res.json({ message: 'Alimento marcado como inactivo' });
    } catch (e) {
      // Si la columna `estado` no existe en la tabla (ER_BAD_FIELD_ERROR), hacer fallback a DELETE
      if (e && e.code === 'ER_BAD_FIELD_ERROR' && String(e.sqlMessage || '').toLowerCase().includes('unknown column') && String(e.sql || '').toLowerCase().includes('estado')) {
        try {
          const [delResult] = await pool.query(`DELETE FROM ${tableName} WHERE id = ?`, [id]);
          if (delResult.affectedRows === 0) return res.status(404).json({ message: 'Alimento no encontrado' });
          return res.json({ message: 'Alimento eliminado' });
        } catch (e2) {
          console.error('/admin/foods/:id DELETE fallback error:', e2);
          return res.status(500).json({ error: 'Error al eliminar alimento' });
        }
      }
      // Otro error: re-lanzarlo para manejarlo abajo
      throw e;
    }
  } catch (err) {
    console.error('/admin/foods/:id DELETE error:', err);
    res.status(500).json({ error: 'Error al eliminar alimento' });
  }
}