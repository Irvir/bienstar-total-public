CREATE TABLE sesiones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  token VARCHAR(500) NOT NULL,
  fecha_creacion DATETIME NOT NULL,
  fecha_revocacion DATETIME DEFAULT NULL,
  activa BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (id_usuario) REFERENCES usuario(id),
  INDEX idx_token (token(255)),
  INDEX idx_usuario_activa (id_usuario, activa)
);