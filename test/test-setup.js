/**
 * Inicialización global para la suite de tests.
 *
 * - Establece `NODE_ENV=test`.
 * - Carga `.env.test`.
 * - Crea `testPool` para uso por los tests.
 * - Inicializa `firebase-admin` con una credencial mock mínima para permitir pruebas
 *   que mockeen `admin.auth().verifyIdToken`.
 * - Importa la `app` del servidor después de configurar el entorno.
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurar entorno de prueba (debe establecerse antes de importar el servidor)
process.env.NODE_ENV = 'test';

// Cargar variables de entorno de prueba
dotenv.config({ path: path.join(__dirname, '../.env.test') });

// Pool de conexiones para pruebas (reutilizable por múltiples suites)
export const testPool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
});

// Inicializar una app de Firebase Admin de forma segura para tests.
// Los tests normalmente mockean `admin.auth()` (vi.spyOn), así que aquí
// solo proveemos una credencial mínima que evita errores al importar.
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: {
        getAccessToken: () => Promise.resolve({ access_token: 'test-token', expires_in: 3600 }),
      },
    });

    // Mensaje informativo; no se sobrescribe `admin.auth` aquí para permitir mocks en tests
    console.log('✅ Firebase Admin inicializado para pruebas (sin override de auth)');
  } catch (error) {
    console.error('❌ Error al inicializar Firebase Admin Mock:', error.message);
    console.warn('Continuando sin Firebase Admin...');
  }
}

// Importar la app del servidor DESPUÉS de haber configurado NODE_ENV y las variables.
// Esto asegura que el servidor lea `.env.test` y cualquier comportamiento específico
// de entorno para tests se aplique correctamente.
const { app } = await import('../server.js');
export { app };