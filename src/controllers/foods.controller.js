// Controlador ligero para búsqueda pública de alimentos y detalle por id
export async function searchFoods(req, res, { pool } = {}) {
  try {
    const q = (req.query.q || '').trim();
    // Buscar por nombre con LIKE, limitar resultados para evitar cargas grandes
    const sql = q ? 'SELECT * FROM alimento WHERE nombre LIKE ? LIMIT 100' : 'SELECT * FROM alimento LIMIT 100';
    const params = q ? [`%${q}%`] : [];
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
    const [rows] = await pool.query('SELECT * FROM alimento WHERE id = ? LIMIT 1', [id]);
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
