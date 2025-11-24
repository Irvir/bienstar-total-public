/**
 * Tests para los endpoints de `alimentos`.
 *
 * Cobertura:
 * - GET /api/alimentos: listado y filtrado por categoría
 * - POST /api/alimentos: creación (solo admin)
 * - PUT /api/alimentos/:id: actualización (solo admin)
 * - DELETE /api/alimentos/:id: marcado como inactivo (solo admin)
 *
 * Notas importantes:
 * - Estas pruebas arrancan la `app` en un puerto local (3003) para la suite.
 * - Se usan tokens generados por los helpers (`generateAdminToken`, `generateUserToken`) para simular permisos.
 * - La base de datos de pruebas (`testPool`) se manipula directamente para insertar/limpiar datos.
 * - Si ejecutas varias suites en paralelo, ten en cuenta posibles conflictos de puerto.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app, testPool } from '../test-setup.js';
import { generateAdminToken, generateUserToken } from '../helpers.js';

describe('Alimentos Endpoints', () => {
  let server;
  let adminToken;
  let userToken;
  
  beforeAll(async () => {
    // Iniciar servidor en puerto fijo para la suite de alimentos
    server = app.listen(3003);

    // Generar tokens: admin y usuario normal (helpers usan JWT_SECRET)
    adminToken = generateAdminToken();
    userToken = generateUserToken();

    // Limpiar cualquier alimento previo y asegurar usuario admin de prueba
    await testPool.execute('UPDATE test_alimento SET estado = "inactivo" WHERE 1=1');
    await testPool.execute(`
      INSERT INTO test_usuario (id, nombre, email, password, id_perfil, estado)
      VALUES (999, 'Admin Test', 'admin@test.com', 'hash', 1, 'activo')
      ON DUPLICATE KEY UPDATE estado = 'activo'
    `);
  });

  afterAll(async () => {
    // Cerrar servidor y limpiar pool de conexiones
    await server.close();
    await testPool.execute('UPDATE test_alimento SET estado = "inactivo" WHERE 1=1');
    await testPool.end();
  });

  describe('GET /api/alimentos', () => {
    beforeEach(async () => {
      // Insertar datos de prueba
      await testPool.execute(`
        INSERT INTO test_alimento (id, nombre, categoria, Energia, Proteinas, Carbohidratos, Grasas, estado) 
        VALUES 
          (1, 'Manzana de Test', 'Frutas', 52, 0.3, 14, 0.2, 'activo'),
          (2, 'Pollo de Test', 'Carnes', 165, 31, 0, 3.6, 'activo')
      `);
    });
    // Caso: obtención de lista pública
    it('debería obtener la lista de alimentos (sin autenticación)', async () => {
      const response = await request(server)
        .get('/api/alimentos');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0]).toHaveProperty('nombre', 'Manzana de Test');
      expect(response.body[0]).toHaveProperty('categoria', 'Frutas');
    });

    // Caso: filtrado por categoría via query string
    it('debería filtrar alimentos por categoría (sin autenticación)', async () => {
      const response = await request(server)
        .get('/api/alimentos?categoria=Frutas');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0]).toHaveProperty('categoria', 'Frutas');
    });
  });

  describe('POST /api/alimentos', () => {
    const nuevoAlimento = {
      nombre: 'Plátano de Test',
      categoria: 'Frutas',
      Energia: 89,
      Proteinas: 1.1,
      Carbohidratos: 23,
      Grasas: 0.3,
      estado: 'activo',
    };

    // Solo admin puede crear un alimento
    it('debería permitir a un admin crear un nuevo alimento', async () => {
      const response = await request(server)
        .post('/api/alimentos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(nuevoAlimento);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.nombre).toBe(nuevoAlimento.nombre);
    });

    // Usuario normal no tiene permisos de creación
    it('no debería permitir a un usuario normal crear un alimento', async () => {
      const response = await request(server)
        .post('/api/alimentos')
        .set('Authorization', `Bearer ${userToken}`)
        .send(nuevoAlimento);

      expect(response.status).toBe(403);
    });
  });

  describe('PUT /api/alimentos/:id', () => {
    let alimentoId;

    beforeEach(async () => {
      // Crear un alimento específico para los tests de actualización
      const [result] = await testPool.execute(`
        INSERT INTO test_alimento (nombre, categoria, Energia, Proteinas, Carbohidratos, Grasas, estado)
        VALUES ('Alimento para actualizar', 'Varios', 100, 1, 1, 1, 'activo')
      `);
      alimentoId = result.insertId;
    });

    const cambios = {
      nombre: 'Alimento Actualizado',
      categoria: 'Frutas',
      Energia: 120,
      estado: 'activo',
    };

    // Admin puede actualizar recursos
    it('debería permitir a un admin actualizar un alimento', async () => {
      const response = await request(server)
        .put(`/api/alimentos/${alimentoId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(cambios);

      expect(response.status).toBe(200);
      expect(response.body.nombre).toBe(cambios.nombre);
      expect(response.body.Energia).toBe(cambios.Energia);
    });

    // Usuario normal no puede actualizar
    it('no debería permitir a un usuario normal actualizar un alimento', async () => {
      const response = await request(server)
        .put(`/api/alimentos/${alimentoId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(cambios);

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/alimentos/:id', () => {
    let alimentoId;

    beforeEach(async () => {
      // Crear un alimento que luego será marcado como inactivo (delete lógico)
      const [result] = await testPool.execute(`
        INSERT INTO test_alimento (nombre, categoria, Energia, Proteinas, Carbohidratos, Grasas, estado)
        VALUES ('Alimento para eliminar', 'Varios', 100, 1, 1, 1, 'activo')
      `);
      alimentoId = result.insertId;
    });

    // Eliminar en la API realiza un marcado como 'inactivo'
    it('debería permitir a un admin marcar un alimento como inactivo', async () => {
      const response = await request(server)
        .delete(`/api/alimentos/${alimentoId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);

      // Verificar que el alimento está inactivo
      const [rows] = await testPool.execute(
        'SELECT estado FROM test_alimento WHERE id = ?',
        [alimentoId],
      );
      expect(rows[0].estado).toBe('inactivo');
    });

    // Usuario normal no puede eliminar
    it('no debería permitir a un usuario normal eliminar un alimento', async () => {
      const response = await request(server)
        .delete(`/api/alimentos/${alimentoId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });
  });
});