// @ts-check
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno de prueba
dotenv.config({ path: path.join(__dirname, '../.env.test') });

async function setupTestDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    multipleStatements: true,
  });

  try {
    // Eliminar tablas de prueba existentes en orden inverso para evitar problemas de FK
    await connection.query(`
      DROP TABLE IF EXISTS test_comida_alimento;
      DROP TABLE IF EXISTS test_comida;
      DROP TABLE IF EXISTS test_dia;
      DROP TABLE IF EXISTS test_categoria_alergico;
      DROP TABLE IF EXISTS test_alimento;
      DROP TABLE IF EXISTS test_usuario;
      DROP TABLE IF EXISTS test_dieta;
      DROP TABLE IF EXISTS test_perfil;
    `);

    // Crear tablas de prueba
    await connection.query(`
      -- Perfil
      CREATE TABLE IF NOT EXISTS test_perfil (
        id_perfil INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
        nombre VARCHAR(45) NOT NULL
      );

      -- Dieta
      CREATE TABLE IF NOT EXISTS test_dieta (
        id_dieta INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
        nombre VARCHAR(100) NOT NULL,
        estado ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo'
      );

      -- Usuario
      CREATE TABLE IF NOT EXISTS test_usuario (
        id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
        nombre VARCHAR(45) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        altura FLOAT NULL,
        peso FLOAT NULL,
        edad INT NULL,
        actividad_fisica VARCHAR(45) NULL,
        sexo VARCHAR(45) NULL,
        id_perfil INT NOT NULL DEFAULT 2,
        id_dieta INT NULL,
        estado ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',
        FOREIGN KEY (id_perfil) REFERENCES test_perfil(id_perfil),
        FOREIGN KEY (id_dieta) REFERENCES test_dieta(id_dieta)
      );

      -- Alimento
      CREATE TABLE IF NOT EXISTS test_alimento (
        id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
        nombre VARCHAR(255) NOT NULL,
        categoria VARCHAR(100),
        imagen VARCHAR(255),
        Energia FLOAT,
        Proteinas FLOAT,
        Grasas FLOAT,
        Carbohidratos FLOAT,
        Fibra FLOAT,
        estado ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo'
      );

      -- Categoría Alérgico
      CREATE TABLE IF NOT EXISTS test_categoria_alergico (
        id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
        id_usuario INT NOT NULL,
        nombre VARCHAR(100) NOT NULL,
        FOREIGN KEY (id_usuario) REFERENCES test_usuario(id) ON DELETE CASCADE,
        UNIQUE KEY uk_usuario_alergia (id_usuario, nombre)
      );

      -- Día
      CREATE TABLE IF NOT EXISTS test_dia (
        id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
        id_dieta INT NOT NULL,
        numero_dia INT NOT NULL,
        FOREIGN KEY (id_dieta) REFERENCES test_dieta(id_dieta) ON DELETE CASCADE,
        UNIQUE KEY uk_dieta_dia (id_dieta, numero_dia)
      );

      -- Comida
      CREATE TABLE IF NOT EXISTS test_comida (
        id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
        id_dia INT NOT NULL,
        tipo VARCHAR(45) NOT NULL,
        FOREIGN KEY (id_dia) REFERENCES test_dia(id) ON DELETE CASCADE,
        UNIQUE KEY uk_dia_tipo (id_dia, tipo)
      );

      -- Comida Alimento (relación N:M)
      CREATE TABLE IF NOT EXISTS test_comida_alimento (
        id_comida INT NOT NULL,
        id_alimento INT NOT NULL,
        cantidad FLOAT DEFAULT 1,
        PRIMARY KEY (id_comida, id_alimento),
        FOREIGN KEY (id_comida) REFERENCES test_comida(id) ON DELETE CASCADE,
        FOREIGN KEY (id_alimento) REFERENCES test_alimento(id) ON DELETE CASCADE
      );
    `);

    // Insertar datos iniciales de prueba (perfiles y dieta base)
    await connection.query(`
      -- Insertar perfiles básicos
      INSERT INTO test_perfil (id_perfil, nombre) VALUES 
        (1, 'Administrador'),
        (2, 'Paciente'),
        (3, 'Doctor');

      -- Insertar dieta de prueba
      INSERT INTO test_dieta (id_dieta, nombre) VALUES (1, 'Dieta General de Prueba');
    `);

    console.log('✅ Base de datos de prueba configurada correctamente');
  } catch (error) {
    console.error('❌ Error configurando base de datos de prueba:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

setupTestDatabase().catch(console.error);