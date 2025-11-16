DROP TABLE IF EXISTS registro_peso;

CREATE TABLE registro_peso (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  fecha DATE NOT NULL,
  peso DECIMAL(5,2) NOT NULL,
  fuente ENUM('manual', 'sync') NOT NULL DEFAULT 'manual',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT fk_registro_peso_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuario(id) ON DELETE CASCADE,
  CONSTRAINT uk_registro_peso_usuario_fecha UNIQUE (id_usuario, fecha),
  INDEX idx_registro_peso_usuario (id_usuario),
  INDEX idx_registro_peso_fecha (fecha)
);