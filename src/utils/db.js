// Función para obtener el nombre de la tabla según el entorno
export function getTableName(baseName) {
  return process.env.NODE_ENV === 'test' ? `test_${baseName}` : baseName;
}