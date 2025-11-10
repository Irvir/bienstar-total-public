import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import admin from 'firebase-admin';
import { app } from '../test-setup.js';

describe('Firebase Admin Tests', () => {
  beforeAll(() => {
    // Configuración se realiza en test-setup.js
  });

  afterAll(() => {
    // Cerrar la app de Firebase Admin
    admin.apps.forEach(app => {
      if (app) {
        app.delete();
      }
    });
  });

  it('debería inicializar Firebase Admin correctamente', () => {
    expect(admin.apps.length).toBeGreaterThan(0);
    expect(admin.apps[0]).toBeTruthy();
  });

  it('debería poder verificar un token mock', async () => {
    const mockToken = 'test-token';
    const mockDecodedToken = {
      uid: 'test-uid',
      email: 'test@example.com'
    };

    // Mockear la función verifyIdToken
    vi.spyOn(admin.auth(), 'verifyIdToken').mockResolvedValueOnce(mockDecodedToken);

    const decodedToken = await admin.auth().verifyIdToken(mockToken);
    expect(decodedToken).toEqual(mockDecodedToken);
  });
});