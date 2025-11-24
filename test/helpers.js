/**
 * Utilidades para tests: generación de tokens y helpers de BD.
 *
 * Estas funciones se usan en las pruebas para evitar dependencias externas
 * y para crear/limpiar datos de prueba de forma repetible.
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

/**
 * Genera un JWT de prueba a partir de un objeto `user`.
 * @param {Object} user - Objeto con al menos `id` y `email`.
 * @returns {string} JWT firmado con `process.env.JWT_SECRET`.
 */
export function generateTestToken(user) {
  return jwt.sign({
    id: user.id,
    id_perfil: user.id_perfil || 2, // 2 es perfil de usuario por defecto
    email: user.email,
  }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

/**
 * Genera un token con rol de administrador.
 * Useful for endpoints protected by admin-only middleware.
 */
export function generateAdminToken() {
  return jwt.sign({
    id: 999,
    id_perfil: 1, // 1 es perfil de administrador
    email: 'admin@test.com',
  }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

/**
 * Genera un token representando a un usuario normal.
 * @param {Object} user - Opcional, permite especificar `id`, `id_perfil`, `email`.
 */
export function generateUserToken(user = {}) {
  const id = user && user.id ? user.id : 998;
  const id_perfil = user && user.id_perfil ? user.id_perfil : 2;
  const email = user && user.email ? user.email : 'user@test.com';
  return jwt.sign({
    id,
    id_perfil, // 2 es perfil de usuario normal
    email,
  }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

/**
 * Crea un usuario de prueba en la tabla `test_usuario`.
 * - Genera un email único si no se provee.
 * - Hashea la contraseña `password123` antes de insertar.
 * @param {Pool|Connection} pool - Conexión o pool de MySQL (mysql2/promise)
 * @param {Object} data - Campos opcionales para sobrescribir los valores por defecto
 * @returns {Promise<Object>} Usuario insertado con `id`.
 */
export async function createTestUser(pool, data = {}) {
  const defaultUser = {
    nombre: 'Test User',
    email: `test.${Date.now()}@example.com`,
    // generamos el hash en tiempo de ejecución para evitar dependencias de hashes precomputados
    password: undefined,
    id_perfil: 2,
    estado: 'activo',
  };

  const user = { ...defaultUser, ...data };
  const hash = await bcrypt.hash('password123', 10);
  user.password = hash;

  const [result] = await pool.query('INSERT INTO test_usuario SET ?', [user]);
  if (process.env.NODE_ENV === 'test') console.log('createTestUser: inserted id =', result.insertId);
  return { ...user, id: result.insertId };
}

/**
 * Marca un usuario como inactivo (cleanup lógico).
 * No elimina registros físicamente para facilitar trazabilidad en pruebas.
 * @param {Pool|Connection} pool
 * @param {number} userId
 */
export function cleanupTestUser(pool, userId) {
  if (!userId) return Promise.resolve();
  return pool.execute('UPDATE test_usuario SET estado = "inactivo" WHERE id = ?', [userId]);
}