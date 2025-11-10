import admin from 'firebase-admin';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';

// Verificar token de Google y crear/actualizar usuario en nuestra base de datos
// Almacén en memoria para tokens revocados (en producción usar Redis)
const revokedTokens = new Set();

// Función para revocar un token
export const revokeToken = async (token) => {
  revokedTokens.add(token);
  // En producción, establecer un TTL para limpiar tokens expirados
  setTimeout(() => revokedTokens.delete(token), 24 * 60 * 60 * 1000);
};

// Middleware para verificar tokens revocados
export const checkRevokedToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token && revokedTokens.has(token)) {
    return res.status(401).json({ error: 'Token ha sido revocado' });
  }
  next();
};

// Controlador principal de login con Google
export const googleLogin = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ error: 'Token de Google requerido' });
  }

  try {
    // Verificar el token con Firebase
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, name, picture } = decodedToken;

    // Verificar si el token ya fue usado (prevenir replay attacks)
    if (revokedTokens.has(idToken)) {
      return res.status(401).json({ error: 'Token ya ha sido usado' });
    }

    // Iniciar transacción
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Buscar si el usuario ya existe
      const [existingUsers] = await connection.query(
        'SELECT * FROM usuario WHERE email = ?',
        [email],
      );

      let userId;
      if (existingUsers.length > 0) {
        // Actualizar usuario existente
        userId = existingUsers[0].id;
        await connection.query(
          'UPDATE usuario SET nombre = ?, foto = ?, ultima_conexion = NOW() WHERE id = ?',
          [name, picture, userId],
        );
      } else {
        // Crear nuevo usuario
        const [result] = await connection.query(
          `INSERT INTO usuario (
            nombre,
            email,
            foto,
            id_perfil,
            estado,
            ultima_conexion
          ) VALUES (?, ?, ?, ?, ?, NOW())`,
          [name, email, picture, 2, 'activo'],
        );
        userId = result.insertId;
      }

      // Generar JWT
      const token = jwt.sign(
        { 
          id: userId,
          email,
          auth_time: decodedToken.auth_time,
        },
        process.env.JWT_SECRET,
        { 
          expiresIn: process.env.FIREBASE_ADMIN_TOKEN_EXPIRATION || '24h',
        },
      );

      // Registrar el token en la base de datos
      await connection.query(
        'INSERT INTO sesiones (id_usuario, token, fecha_creacion) VALUES (?, ?, NOW())',
        [userId, token],
      );

      await connection.commit();

      // Revocar el token de Firebase para prevenir reuso
      revokedTokens.add(idToken);

      res.json({
        token,
        user: {
          id: userId,
          email,
          nombre: name,
          foto: picture,
        },
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error en googleLogin:', error);
    
    // Manejar errores específicos
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ error: 'Token has expired' });
    }
    if (error.code === 'auth/invalid-id-token') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    if (error.code?.startsWith('auth/')) {
      return res.status(401).json({ error: 'Error de autenticación', details: error.message });
    }
    
    res.status(500).json({
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};