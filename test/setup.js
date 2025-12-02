/**
 * Configuración de helpers y hooks comunes para las pruebas (Vitest).
 *
 * - Carga `.env.test` para variables de entorno de la BD y JWT.
 * - Abre una conexión antes de cada test y limpia tablas después.
 * - Exporta funciones helper para crear usuarios/alimentos/dietas de prueba.
 */

import { expect, afterEach, beforeEach } from 'vitest';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno de prueba
dotenv.config({ path: path.join(__dirname, '../.env.test') });

let connection;

/**
 * Hook: abrir conexión antes de cada prueba.
 * Algunos tests esperan usar esta conexión a través de los helpers exportados.
 */
beforeEach(async () => {
  // Conectar a la base de datos antes de cada prueba
  connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
  });
});

/**
 * Hook: limpiar tablas de prueba y cerrar la conexión.
 * - Se usa `SET FOREIGN_KEY_CHECKS = 0` para permitir borrados en tablas relacionadas.
 */
afterEach(async () => {
  // Limpiar datos de prueba después de cada prueba
  if (connection) {
    try {
      await connection.query('SET FOREIGN_KEY_CHECKS = 0');
      // Use full deletes for test tables to avoid relying on specific PK column names
      await connection.query('DELETE FROM test_comida_alimento');
      await connection.query('DELETE FROM test_comida');
      await connection.query('DELETE FROM test_dia');
      await connection.query('DELETE FROM test_categoria_alergico');
      await connection.query('DELETE FROM test_usuario');
      await connection.query('DELETE FROM test_alimento');
      await connection.query('DELETE FROM test_dieta');
      await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    } finally {
      await connection.end();
    }
  }
});

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

/**
 * Helper para crear un usuario de prueba usando la conexión `connection`.
 * - Genera emails únicos combinando timestamp y random.
 * - Retorna `{ id, email }`.
 */
export async function createTestUser(emailSuffix = '') {
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString('hex');
  const email = `test${emailSuffix}${timestamp}${random}@example.com`;
  const hash = await bcrypt.hash('password123', 10);
  
  const [result] = await connection.query(
    `INSERT INTO test_usuario (
      nombre,
      email,
      password,
      id_perfil,
      altura,
      peso,
      edad,
      actividad_fisica,
      sexo,
      estado
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'Usuario Test',
      email,
      hash,
      2,
      170,
      70,
      30,
      'moderada',
      'M',
      'activo',
    ],
  );
  
  return { id: result.insertId, email };
}

/**
 * Inserta un alimento de prueba y retorna su `id`.
 */
export async function createTestAlimento() {
  const [result] = await connection.query(
    `INSERT INTO test_alimento (
      nombre,
      categoria,
      energia,
      proteinas,
      carbohidratos
    ) VALUES (?, ?, ?, ?, ?)`,
    ['Alimento Test', 'Test', 100, 10, 20],
  );
  return result.insertId;
}

/**
 * Inserta una dieta de prueba y retorna su `id`.
 */
export async function createTestDieta() {
  const [result] = await connection.query(
    'INSERT INTO test_dieta (nombre) VALUES (?)',
    ['Dieta Test'],
  );
  return result.insertId;
}

/**
 * Genera un JWT para un `userId` dado (firma con `JWT_SECRET`).
 */
export function generateTestToken(userId) {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '1h' },
  );
}