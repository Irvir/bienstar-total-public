import jwt from 'jsonwebtoken';

export function authenticate(req, res, next) {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Agregar la información del usuario al request
    req.user = decoded;

    next();
  } catch (err) {
    console.error('Error de autenticación:', err);
    return res.status(401).json({ error: 'Token inválido' });
  }
}