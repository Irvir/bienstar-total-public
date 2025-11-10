import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export function generateTestToken(user) {
  return jwt.sign({
    id: user.id,
    id_perfil: user.id_perfil || 2, // 2 es perfil de usuario por defecto
    email: user.email
  }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

export function generateAdminToken() {
  return jwt.sign({
    id: 999,
    id_perfil: 1, // 1 es perfil de administrador
    email: 'admin@test.com'
  }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

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

export async function createTestUser(pool, data = {}) {
  const defaultUser = {
    nombre: 'Test User',
    email: `test.${Date.now()}@example.com`,
    // generamos el hash en tiempo de ejecución para evitar dependencias de hashes precomputados
    password: undefined,
    id_perfil: 2,
    estado: 'activo'
  };

  const user = { ...defaultUser, ...data };
  const hash = await bcrypt.hash('password123', 10);
  user.password = hash;

  const [result] = await pool.query('INSERT INTO test_usuario SET ?', [user]);
  if (process.env.NODE_ENV === 'test') console.log('createTestUser: inserted id =', result.insertId);
  return { ...user, id: result.insertId };
}

export function cleanupTestUser(pool, userId) {
  if (!userId) return Promise.resolve();
  return pool.execute('UPDATE test_usuario SET estado = "inactivo" WHERE id = ?', [userId]);
}