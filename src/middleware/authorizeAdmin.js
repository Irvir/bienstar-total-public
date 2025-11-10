export default function authorizeAdminFactory(pool) {
  return async function authorizeAdmin(req, res, next) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'No autorizado' });
      }
      
      // En pruebas, confiar en el id_perfil del token
      if (process.env.NODE_ENV === 'test') {
        if (Number(req.user.id_perfil) !== 1) {
          return res.status(403).json({ error: 'Requiere permiso de administrador' });
        }
        return next();
      }

      // En producción, verificar en la base de datos
      const [rows] = await pool.query('SELECT id_perfil FROM usuario WHERE id = ? AND estado = "activo" LIMIT 1', [req.user.id]);
      if (!rows || rows.length === 0) {
        return res.status(401).json({ error: 'Usuario no encontrado o inactivo' });
      }
      
      const perfil = rows[0].id_perfil;
      if (Number(perfil) !== 1) {
        return res.status(403).json({ error: 'Requiere permiso de administrador' });
      }
      
      next();
    } catch (err) {
      console.error('authorizeAdmin error:', err);
      return res.status(500).json({ error: 'Error verificando permisos' });
    }
  };
}
