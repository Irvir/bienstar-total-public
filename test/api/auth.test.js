import { describe, it, expect, beforeEach, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import { app, testPool } from '../test-setup.js';
import jwt from 'jsonwebtoken';
import { generateUserToken, createTestUser, cleanupTestUser } from '../helpers.js';
import admin from 'firebase-admin';

describe('Auth Endpoints', () => {
  let server;
  let testUser;

  beforeAll(() => {
    server = app.listen(3004);
  });

  afterAll(async () => {
    await server.close();
    await testPool.end();
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      testUser = await createTestUser(testPool);
    });

    afterEach(async () => {
      await cleanupTestUser(testPool, testUser.id);
    });

    it('debería iniciar sesión exitosamente con credenciales válidas', async () => {
      const response = await request(server)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe(testUser.email);
    });

    it('debería fallar con credenciales inválidas', async () => {
      const response = await request(server)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/auth/registrar', () => {
    const email = `newuser${Date.now()}@example.com`;

    afterEach(async () => {
      await testPool.execute('UPDATE test_usuario SET estado = "inactivo" WHERE email = ?', [email]);
    });

    it('debería registrar un nuevo usuario exitosamente', async () => {
      const nuevoUsuario = {
        nombre: 'New User',
        email,
        password: 'password123',
        altura: 170,
        peso: 70,
        edad: 30,
        actividad_fisica: 'moderada',
        sexo: 'M',
      };

      const response = await request(server)
        .post('/api/auth/registrar')
        .send(nuevoUsuario);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Usuario registrado exitosamente');
    });

    it('debería fallar al registrar con un correo existente', async () => {
      testUser = await createTestUser(testPool);
      const usuarioDuplicado = {
        nombre: 'Another User',
        email: testUser.email,
        password: 'password123',
        altura: 170,
        peso: 70,
        edad: 30,
        actividad_fisica: 'moderada',
        sexo: 'M',
      };

      const response = await request(server)
        .post('/api/auth/registrar')
        .send(usuarioDuplicado);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'El correo ya está registrado');
    });
  });

  describe('GET /api/auth/me', () => {
    let token;

    beforeEach(async () => {
      testUser = await createTestUser(testPool);
      token = generateUserToken(testUser);
    });

    afterEach(async () => {
      await cleanupTestUser(testPool, testUser.id);
    });

    it('debería retornar datos del usuario con token válido', async () => {
      const response = await request(server)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', testUser.id);
      expect(response.body.email).toBe(testUser.email);
    });

    it('debería fallar con token inválido', async () => {
      const response = await request(server)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/google', () => {
    let mockFirebaseAdmin;

    beforeAll(() => {
      // Mock de Firebase Admin
      mockFirebaseAdmin = {
        auth: () => ({
          verifyIdToken: (token) => {
            if (token === 'valid-token') {
              return Promise.resolve({
                email: 'test.user@gmail.com',
                name: 'Test User',
                picture: 'https://example.com/photo.jpg',
              });
            }
            return Promise.reject(new Error('Invalid token'));
          },
        }),
      };
      vi.spyOn(admin, 'auth').mockImplementation(() => mockFirebaseAdmin.auth());
    });

    afterAll(() => {
      vi.restoreAllMocks();
    });

    it('debería autenticar usuario existente con Google', async () => {
      testUser = await createTestUser(testPool, {
        email: 'test.user@gmail.com',
        nombre: 'Existing User',
      });

      const response = await request(server)
        .post('/api/auth/google')
        .send({ idToken: 'valid-token' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', 'test.user@gmail.com');
    });

    it('debería crear nuevo usuario al autenticar con Google por primera vez', async () => {
      const response = await request(server)
        .post('/api/auth/google')
        .send({ idToken: 'valid-token' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', 'test.user@gmail.com');
      expect(response.body.user).toHaveProperty('nombre', 'Test User');
    });

    it('debería fallar con token inválido de Google', async () => {
      const response = await request(server)
        .post('/api/auth/google')
        .send({ idToken: 'invalid-token' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('debería fallar si el token está expirado', async () => {
      vi.spyOn(mockFirebaseAdmin.auth(), 'verifyIdToken').mockImplementationOnce(() => {
        throw new Error('Token has expired');
      });

      const response = await request(server)
        .post('/api/auth/google')
        .send({ idToken: 'expired-token' });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Token has expired');
    });

    it('debería fallar si falta el idToken', async () => {
      const response = await request(server)
        .post('/api/auth/google')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Token de Google requerido');
    });
  });
});