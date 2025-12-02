import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const DB_CONFIG = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  connectTimeout: 10000,
};

async function testConnection() {
  let conn;
  try {
    console.log('Conectando a la base de datos en:', DB_CONFIG.host, 'port:', DB_CONFIG.port);
    conn = await mysql.createConnection(DB_CONFIG);
    const [rows1] = await conn.execute('SELECT 1+1 AS ok');
    console.log('Consulta simple OK:', rows1);
    const [tables] = await conn.query('SHOW TABLES');
    console.log('Tablas encontradas (primeras 10):', tables.slice(0, 10));
    await conn.end();
    console.log('Conexión cerrada correctamente.');
    process.exit(0);
  } catch (err) {
    console.error('Error conectando a la base de datos:', err.message || err);
    if (conn) try { await conn.end(); } catch (e) { /* ignore */ }
    process.exit(1);
  }
}

testConnection();
