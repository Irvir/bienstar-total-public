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
        // Si parece nombre de archivo con extensión -> servir desde /uploads
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
    const {
      image_url,
      nombre,
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
    const [result] = await pool.query(
      `INSERT INTO ${tableName} (
        image_url, nombre, Energia, Humedad, Cenizas, Proteinas, H_de_C_disp,
        Azucares_totales, Fibra_dietetica_total, Lipidos_totales, Ac_grasos_totales,
        Ac_grasos_poliinsat, Ac_grasos_trans, Colesterol, Vitamina_A, Vitamina_C,
        Vitamina_D, Vitamina_E, Vitamina_K, Vitamina_B1, Vitamina_B2, Niacina,
        Vitamina_B6, Ac_pantotenico, Vitamina_B12, Folatos, Sodio, Potasio,
        Calcio, Fosforo, Magnesio, Hierro, Zinc, Cobre, Selenio
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        image_url || null,
        nombre,
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
      ],
    );

    // Return id and nombre to match test expectations
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
         nombre = ?, Energia = ?, Humedad = ?, Cenizas = ?, Proteinas = ?, H_de_C_disp = ?, Azucares_totales = ?, Fibra_dietetica_total = ?, Lipidos_totales = ?, Ac_grasos_totales = ?, Ac_grasos_poliinsat = ?, Ac_grasos_trans = ?, Colesterol = ?, Vitamina_A = ?, Vitamina_C = ?, Vitamina_D = ?, Vitamina_E = ?, Vitamina_K = ?, Vitamina_B1 = ?, Vitamina_B2 = ?, Niacina = ?, Vitamina_B6 = ?, Ac_pantotenico = ?, Vitamina_B12 = ?, Folatos = ?, Sodio = ?, Potasio = ?, Calcio = ?, Fosforo = ?, Magnesio = ?, Hierro = ?, Zinc = ?, Cobre = ?, Selenio = ?, image_url = ?
       WHERE id = ?`,
      [
        nombre,
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
    // Mark as inactive instead of deleting to match tests
    const [result] = await pool.query(`UPDATE ${tableName} SET estado = 'inactivo' WHERE id = ?`, [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Alimento no encontrado' });
    res.json({ message: 'Alimento marcado como inactivo' });
  } catch (err) {
    console.error('/admin/foods/:id DELETE error:', err);
    res.status(500).json({ error: 'Error al eliminar alimento' });
  }
}
