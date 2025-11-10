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

// Pool de conexiones para pruebas
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

// Mock de Firebase Admin para pruebas
if (!admin.apps.length) {
  try {
    // Inicializar Firebase Admin app con credencial mock mínima
    admin.initializeApp({
      credential: {
        getAccessToken: () => Promise.resolve({ access_token: 'test-token', expires_in: 3600 }),
      },
    });

    // No override de admin.auth aquí: los tests usan vi.spyOn(admin, 'auth') para mockearla
    console.log('✅ Firebase Admin inicializado para pruebas (sin override de auth)');
  } catch (error) {
    console.error('❌ Error al inicializar Firebase Admin Mock:', error.message);
    console.warn('Continuando sin Firebase Admin...');
  }
}

// Exportar la aplicación para las pruebas
// Importar la app después de configurar NODE_ENV y variables de entorno
const { app } = await import('../server.js');
export { app };