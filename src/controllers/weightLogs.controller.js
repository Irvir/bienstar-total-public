import { getTableName } from '../utils/db.js';

function parseUserId(req) {
  const fromParams = req.params?.id ?? req.params?.userId;
  const fromQuery = req.query?.userId;
  const userId = Number(fromParams ?? fromQuery);
  if (Number.isNaN(userId) || !userId) return null;
  return userId;
}

function normalizeDate(input) {
  if (!input) return null;
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().split('T')[0];
}

function validateWeightValue(peso) {
  if (peso === undefined || peso === null || peso === '') return 'El peso es obligatorio.';
  const value = Number(peso);
  if (Number.isNaN(value)) return 'El peso debe ser un número válido.';
  if (value <= 30 || value >= 170) return 'El peso debe estar entre 30 kg y 170 kg.';
  return null;
}

async function syncUserLatestWeight(pool, userId) {
  const table = getTableName('registro_peso');
  const userTable = getTableName('usuario');
  try {
    const [rows] = await pool.query(
      `SELECT peso
       FROM ${table}
       WHERE id_usuario = ?
       ORDER BY fecha DESC
       LIMIT 1`,
      [userId],
    );
    const latest = rows && rows[0] ? rows[0].peso : null;
    await pool.query(`UPDATE ${userTable} SET peso = ? WHERE id = ?`, [latest, userId]);
    return latest;
  } catch (error) {
    console.warn('syncUserLatestWeight error:', error.message);
    return null;
  }
}

export async function listWeightLogs(req, res, { pool } = {}) {
  try {
    const userId = parseUserId(req);
    if (!userId) return res.status(400).json({ message: 'Falta el identificador del usuario' });

    const table = getTableName('registro_peso');
    const limit = Math.min(Math.max(Number(req.query?.limit) || 30, 1), 180);
    const fromDate = normalizeDate(req.query?.from);
    const toDate = normalizeDate(req.query?.to);

    const filters = ['id_usuario = ?'];
    const params = [userId];

    if (fromDate) {
      filters.push('fecha >= ?');
      params.push(fromDate);
    }
    if (toDate) {
      filters.push('fecha <= ?');
      params.push(toDate);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const [rows] = await pool.query(
      `SELECT id, fecha, peso, fuente, created_at, updated_at
       FROM ${table}
       ${whereClause}
       ORDER BY fecha DESC
       LIMIT ?`,
      [...params, limit],
    );

    res.json({ items: rows, count: rows.length });
  } catch (err) {
    console.error('Error listWeightLogs:', err);
    res.status(500).json({ message: 'Error al obtener historial de peso' });
  }
}

export async function createWeightLog(req, res, { pool } = {}) {
  try {
    const userId = parseUserId(req);
    if (!userId) return res.status(400).json({ message: 'Falta el identificador del usuario' });

    const { peso, fecha, fuente } = req.body || {};
    const weightError = validateWeightValue(peso);
    if (weightError) return res.status(400).json({ message: weightError });

    const normalizedDate = normalizeDate(fecha) || new Date().toISOString().split('T')[0];
    const source = fuente === 'sync' ? 'sync' : 'manual';

    const table = getTableName('registro_peso');
    const [result] = await pool.query(
      `INSERT INTO ${table} (id_usuario, fecha, peso, fuente)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE peso = VALUES(peso), fuente = VALUES(fuente), updated_at = CURRENT_TIMESTAMP`,
      [userId, normalizedDate, Number(peso), source],
    );

    const insertedId = result.insertId || result?.insertId === 0 ? result.insertId : null;
    const [rows] = await pool.query(
      `SELECT id, fecha, peso, fuente, created_at, updated_at
       FROM ${table}
       WHERE id_usuario = ? AND fecha = ?
       LIMIT 1`,
      [userId, normalizedDate],
    );

    // Solo sincronizar el peso del perfil si el registro guardado corresponde al día de hoy
    const today = new Date().toISOString().split('T')[0];
    let latest = null;
    if (normalizedDate === today) {
      latest = await syncUserLatestWeight(pool, userId);
    }

    res.status(insertedId ? 201 : 200).json({
      message: insertedId ? 'Registro creado' : 'Registro actualizado',
      item: rows[0] || null,
      latestPeso: latest,
    });
  } catch (err) {
    console.error('Error createWeightLog:', err);
    res.status(500).json({ message: 'Error al guardar el peso' });
  }
}

export async function updateWeightLog(req, res, { pool } = {}) {
  try {
    const userId = parseUserId(req);
    const weightId = Number(req.params?.weightId);
    if (!userId) return res.status(400).json({ message: 'Falta el identificador del usuario' });
    if (!weightId) return res.status(400).json({ message: 'Falta el identificador del registro' });

    const { peso, fecha, fuente } = req.body || {};
    const updates = [];
    const params = [];

    if (peso !== undefined) {
      const weightError = validateWeightValue(peso);
      if (weightError) return res.status(400).json({ message: weightError });
      updates.push('peso = ?');
      params.push(Number(peso));
    }

    if (fecha) {
      const normalizedDate = normalizeDate(fecha);
      if (!normalizedDate) return res.status(400).json({ message: 'Fecha inválida' });
      updates.push('fecha = ?');
      params.push(normalizedDate);
    }

    if (fuente) {
      updates.push('fuente = ?');
      params.push(fuente === 'sync' ? 'sync' : 'manual');
    }

    if (updates.length === 0) return res.status(400).json({ message: 'No hay campos para actualizar' });

    const table = getTableName('registro_peso');
    const [result] = await pool.query(
      `UPDATE ${table}
       SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND id_usuario = ?`,
      [...params, weightId, userId],
    );

    if (result.affectedRows === 0) return res.status(404).json({ message: 'Registro no encontrado' });

    const [rows] = await pool.query(
      `SELECT id, fecha, peso, fuente, created_at, updated_at
       FROM ${table}
       WHERE id = ? AND id_usuario = ?
       LIMIT 1`,
      [weightId, userId],
    );
    // Solo sincronizar el peso del perfil si el registro actualizado corresponde al día de hoy
    const today = new Date().toISOString().split('T')[0];
    let latest = null;
    const updatedFecha = rows[0] && rows[0].fecha ? rows[0].fecha : null;
    if (updatedFecha === today) {
      latest = await syncUserLatestWeight(pool, userId);
    }

    res.json({ message: 'Registro actualizado', item: rows[0] || null, latestPeso: latest });
  } catch (err) {
    console.error('Error updateWeightLog:', err);
    res.status(500).json({ message: 'Error al actualizar el registro' });
  }
}

export async function deleteWeightLog(req, res, { pool } = {}) {
  try {
    const userId = parseUserId(req);
    const weightId = Number(req.params?.weightId);
    if (!userId) return res.status(400).json({ message: 'Falta el identificador del usuario' });
    if (!weightId) return res.status(400).json({ message: 'Falta el registro a eliminar' });

    const table = getTableName('registro_peso');
    // obtener la fecha del registro antes de eliminar
    const [beforeRows] = await pool.query(
      `SELECT fecha FROM ${table} WHERE id = ? AND id_usuario = ? LIMIT 1`,
      [weightId, userId],
    );
    const deletedFecha = beforeRows && beforeRows[0] ? beforeRows[0].fecha : null;

    const [result] = await pool.query(
      `DELETE FROM ${table}
       WHERE id = ? AND id_usuario = ?
       LIMIT 1`,
      [weightId, userId],
    );

    if (result.affectedRows === 0) return res.status(404).json({ message: 'Registro no encontrado' });

    let latest = null;
    const today = new Date().toISOString().split('T')[0];
    if (deletedFecha === today) {
      latest = await syncUserLatestWeight(pool, userId);
    }

    res.json({ message: 'Registro eliminado', latestPeso: latest });
  } catch (err) {
    console.error('Error deleteWeightLog:', err);
    res.status(500).json({ message: 'Error al eliminar el registro' });
  }
}
