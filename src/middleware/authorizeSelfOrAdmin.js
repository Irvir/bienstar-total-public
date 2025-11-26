import { getTableName } from '../utils/db.js';

export default function authorizeSelfOrAdminFactory(pool) {
  return async function authorizeSelfOrAdmin(req, res, next) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'No autorizado' });
      }
      const targetId = Number(req.params.id);
      const self = Number(req.user.id) === targetId;
      if (self) return next();

      // En entorno de pruebas, confiar en el token para el rol admin
      if (process.env.NODE_ENV === 'test') {
        if (Number(req.user.id_perfil) === 1) return next();
        return res.status(403).json({ error: 'Requiere permiso de administrador' });
      }

      // En otros entornos, verificar en base de datos usando el nombre de tabla adecuado
      const userTable = getTableName('usuario');
      const [rows] = await pool.query(
        `SELECT id_perfil FROM ${userTable} WHERE id = ? AND estado = "activo" LIMIT 1`,
        [req.user.id]
      );
      const isAdmin = rows && rows[0] && Number(rows[0].id_perfil) === 1;
      if (!isAdmin) {
        return res.status(403).json({ error: 'Requiere permiso de administrador' });
      }
      next();
    } catch (err) {
      console.error('authorizeSelfOrAdmin error:', err);
      return res.status(500).json({ error: 'Error verificando permisos' });
    }
  };
}
