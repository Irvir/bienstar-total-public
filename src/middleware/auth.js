import jwt from 'jsonwebtoken';

export function authenticate(req, res, next) {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers.authorization;
    
    // Si no hay token, permitir acceso pero sin req.user (protección básica)
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Para desarrollo: permitir si viene userId en la URL
      const userId = req.params.id || req.query.userId;
      if (userId) {
        req.user = { id: parseInt(userId) };
        console.log('[Auth] Acceso sin token, usando userId de URL:', userId);
        return next();
      }
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Agregar la información del usuario al request
    req.user = decoded;

    next();
  } catch (err) {
    console.error('Error de autenticación:', err.message);
    return res.status(401).json({ error: 'Token inválido' });
  }
}