-- #############################################
-- 1. CONFIGURACIÓN INICIAL DE LA BASE DE DATOS
-- #############################################
USE sql10804585;



-- #############################################
-- 2. TABLAS MAESTRAS Y DE ENTIDADES
-- #############################################

-- 1. PERFIL: Almacena los tipos de perfiles (Ej: 1=Admin, 2=Estandar)
CREATE TABLE perfil (
    id_perfil INT PRIMARY KEY NOT NULL,
    nombre VARCHAR(45) NOT NULL
);

-- 2. DIETA: Almacena los planes de dieta.
CREATE TABLE dieta (
    id_dieta INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL
);

-- 3. ALIMENTO: Almacena la información nutricional completa (34 campos de tu servidor)
CREATE TABLE alimento (
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT, -- Usado como 'id' en el código
    id_alimento INT UNIQUE, -- Mantenido por si es un ID externo, pero 'id' es la PK
    image_url VARCHAR(255) NULL, -- Se usa en el servidor
    nombre VARCHAR(255) NOT NULL,
    categoria VARCHAR(100),
    Energia FLOAT,
    Humedad FLOAT,
    Cenizas FLOAT,
    Proteinas FLOAT,
    H_de_C_disp FLOAT,
    Azucares_totales FLOAT,
    Fibra_dietetica_total FLOAT,
    Lipidos_totales FLOAT,
    Ac_grasos_totales FLOAT,
    Ac_grasos_poliinsat FLOAT,
    Ac_grasos_trans FLOAT,
    Colesterol FLOAT,
    Vitamina_A FLOAT,
    Vitamina_C FLOAT,
    Vitamina_D FLOAT,
    Vitamina_E FLOAT,
    Vitamina_K FLOAT,
    Vitamina_B1 FLOAT,
    Vitamina_B2 FLOAT,
    Niacina FLOAT,
    Vitamina_B6 FLOAT,
    Ac_pantotenico FLOAT,
    Vitamina_B12 FLOAT,
    Folatos FLOAT,
    Sodio FLOAT,
    Potasio FLOAT, -- Campo de tu código
    Calcio FLOAT,  -- Campo de tu código
    Fosforo FLOAT, -- Campo de tu código
    Magnesio FLOAT, -- Campo de tu código
    Hierro FLOAT,  -- Campo de tu código
    Zinc FLOAT,    -- Campo de tu código
    Cobre FLOAT,   -- Campo de tu código
    Selenio FLOAT  -- Campo de tu código
);

-- 4. USUARIO: Almacena datos de acceso y perfil/dieta (El servidor usa el campo 'id')
CREATE TABLE usuario (
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(45) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    altura FLOAT NULL,
    peso FLOAT NULL,
    edad INT NULL,
    actividad_fisica VARCHAR(45) NULL,
    sexo VARCHAR(45) NULL,
    id_perfil INT NOT NULL DEFAULT 2, -- Default 2 (Estandar)
    id_dieta INT NULL,
    estado ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo', -- Usado en el servidor

    FOREIGN KEY (id_perfil) REFERENCES perfil(id_perfil),
    FOREIGN KEY (id_dieta) REFERENCES dieta(id_dieta)
);

-- 5. DIA: Almacena la relación entre una Dieta y un día específico (1=Lunes, 7=Domingo)
CREATE TABLE dia (
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    id_dieta INT NOT NULL,
    numero_dia INT NOT NULL, -- 1 a 7

    FOREIGN KEY (id_dieta) REFERENCES dieta(id_dieta),
    UNIQUE KEY uk_dieta_dia (id_dieta, numero_dia) -- Asegura un día único por dieta
);
INSERT IGNORE INTO dia (id_dieta, numero_dia) VALUES
(1, 1), -- Día 1 (Lunes)
(1, 2), -- Día 2 (Martes)
(1, 3), -- Día 3 (Miércoles)
(1, 4), -- Día 4 (Jueves)
(1, 5), -- Día 5 (Viernes)
(1, 6), -- Día 6 (Sábado)
(1, 7); -- Día 7 (Domingo)
-- 6. COMIDA: Almacena el tipo de comida para un día específico
-- NOTA: Tu servidor modela la relación 'Comida' como dependiente de 'Dia' (id_dia).
CREATE TABLE comida (
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    id_dia INT NOT NULL,
    tipo VARCHAR(45) NOT NULL, -- Ej: 'Desayuno', 'Almuerzo'
    
    FOREIGN KEY (id_dia) REFERENCES dia(id),
    UNIQUE KEY uk_dia_tipo (id_dia, tipo) -- Asegura un tipo de comida único por día
);

-- #############################################
-- 3. TABLAS DE RELACIÓN (MUCHOS A MUCHOS)
-- #############################################

-- 7. CATEGORIA_ALERGICO: Almacena las alergias de cada usuario (La tabla que usa tu código)
-- NOTA: Se está usando como tabla de relación N:M entre usuario y el nombre de la alergia.
CREATE TABLE categoria_alergico (
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    
    FOREIGN KEY (id_usuario) REFERENCES usuario(id) ON DELETE CASCADE,
    UNIQUE KEY uk_usuario_alergia (id_usuario, nombre) -- Asegura que no se duplique la misma alergia para el mismo usuario
);

-- 8. COMIDA_ALIMENTO: Alimentos y su cantidad en una Comida
CREATE TABLE comida_alimento (
    id_comida INT NOT NULL,
    id_alimento INT NOT NULL,
    cantidad FLOAT,
    
    PRIMARY KEY (id_comida, id_alimento), -- Clave Primaria compuesta para la unicidad
    FOREIGN KEY (id_comida) REFERENCES comida(id) ON DELETE CASCADE,
    FOREIGN KEY (id_alimento) REFERENCES alimento(id)
);


-- #############################################
-- 4. INSERCIÓN DE DATOS INICIALES (PARA EL SERVIDOR)
-- #############################################

-- Perfiles necesarios para el campo id_perfil en 'usuario'
INSERT INTO perfil (id_perfil, nombre) VALUES
(1, 'Administrador'),
(2, 'Estandar');
INSERT INTO perfil (id_perfil, nombre) VALUES
(3, 'Médico');

-- Insertar una Dieta por defecto (usada en lógica de servidor)
INSERT INTO dieta (id_dieta, nombre) VALUES
(1, 'Dieta Genérica');

-- 5 alimentos de ejemplo (usando los campos nutricionales del servidor)
INSERT INTO alimento (
    id, nombre, image_url, categoria, Energia, Humedad, Cenizas, Proteinas, H_de_C_disp, Azucares_totales, 
    Fibra_dietetica_total, Lipidos_totales, Ac_grasos_totales, Ac_grasos_poliinsat, Ac_grasos_trans, 
    Colesterol, Vitamina_A, Vitamina_C, Vitamina_D, Vitamina_E, Vitamina_K, Vitamina_B1, Vitamina_B2, 
    Niacina, Vitamina_B6, Ac_pantotenico, Vitamina_B12, Folatos, Sodio, Potasio, Calcio, Fosforo, Magnesio, 
    Hierro, Zinc, Cobre, Selenio
) VALUES
(1, 'Leche materna', NULL, 'Lácteos', 70, 87.5, 0.2, 1.0, 6.9, 6.9, 0.0, 4.4, 2.01, 0.50, 0.1, 14.0, 61.0, 5.0, 0.1, 0.1, 0.3, 0.1, 0.2, 0.1, 0.1, 0.2, 0.1, 5.0, 17.0, 51.0, 32.0, 60.0, 3.0, 0.1, 0.1, 0.1, 1.8),
(2, 'Leche de Burra', NULL, 'Lácteos', 41, 90.4, 0.4, 1.6, 6.7, 6.7, 0.0, 0.9, 2.67, 0.51, 0.0, 14.0, 5.0, 1.7, 0.1, 0.1, 0.1, 0.0, 0.1, 0.1, 0.1, 0.1, 0.0, 5.0, 51.0, 264.0, 138.0, 111.0, 14.0, 0.0, 0.1, 0.1, 1.4),
(3, 'Leche de Cabra con Vit. D', NULL, 'Lácteos', 69, 87.0, 0.8, 3.6, 4.5, 4.5, 0.0, 4.1, 1.11, 0.15, 0.0, 11.0, 57.0, 1.3, 1.3, 0.3, 0.3, 0.3, 0.4, 0.3, 0.3, 0.3, 0.4, 5.0, 59.0, 151.0, 134.0, 111.0, 14.0, 0.1, 0.3, 0.1, 2.0),
(4, 'Leche fluida entera', NULL, 'Lácteos', 64, 87.7, 0.6, 3.3, 4.7, 4.7, 0.0, 3.7, 1.06, 0.14, 0.0, 14.0, 33.0, 1.5, 0.1, 0.2, 0.2, 0.1, 0.2, 0.1, 0.1, 0.3, 0.1, 4.0, 55.0, 141.8, 119.0, 93.0, 13.0, 0.1, 0.1, 0.0, 0.0),
(5, 'Yogur Natural', NULL, 'Lácteos', 75, 85.0, 0.8, 4.0, 5.5, 5.5, 0.0, 3.5, 2.3, 0.1, 0.0, 10.0, 30.0, 1.0, 0.0, 0.1, 0.1, 0.1, 0.2, 0.1, 0.1, 0.2, 0.1, 5.0, 45.0, 150.0, 150.0, 120.0, 15.0, 0.1, 0.1, 0.0, 1.0);