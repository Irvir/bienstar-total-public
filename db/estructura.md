---
# 🌿 BienStar Total — Estructura de la Base de Datos

> Documento técnico: descripción de tablas, campos, relaciones y datos iniciales usados por BienStar Total.

---

## 📌 Contenido

- [Configuración inicial](#-configuración-inicial)
- [Tablas maestras y de entidad](#-tablas-maestras-y-de-entidad)
	- [perfil](#perfil)
	- [dieta](#dieta)
	- [alimento](#alimento)
	- [registro_peso](#registro_peso)
- [Insertar datos de ejemplo](#-insertar-datos-de-ejemplo)

---

## 1️⃣ Configuración inicial

Base de datos usada (ejemplo):

```sql
USE sql10804585;
```

> Nota: adapta el `USE` al nombre de tu esquema local si difiere.

---

## 2️⃣ Tablas maestras y de entidad

Abajo se listan las tablas principales con sus campos, tipos y una breve descripción.

### perfil

Almacena los tipos de perfiles de usuario (ej.: Administrador, Estándar, Médico).

| Campo     | Tipo         | Null | Clave | Descripción                          |
| --------- | ------------ | ---- | ----- | ------------------------------------ |
| id_perfil | INT          | NO   | PK    | Identificador único del perfil       |
| nombre    | VARCHAR(45)  | NO   |       | Nombre del perfil (ej.: 'Administrador') |

Datos iniciales sugeridos:

```sql
INSERT INTO perfil (id_perfil, nombre) VALUES
	(1, 'Administrador'),
	(2, 'Estandar'),
	(3, 'Médico');
```

---

### dieta

Almacena los planes de dieta.

| Campo    | Tipo          | Null | Clave | Descripción                        |
| -------- | ------------- | ---- | ----- | ---------------------------------- |
| id_dieta | INT           | NO   | PK    | Identificador único de la dieta    |
| nombre   | VARCHAR(100)  | NO   |       | Nombre de la dieta                 |

Dato inicial:

```sql
INSERT INTO dieta (id_dieta, nombre) VALUES
	(1, 'Dieta Genérica');
```

---

### alimento

Tabla que almacena información nutricional detallada de cada alimento.

| Campo                 | Tipo         | Null | Clave | Descripción                                 |
| --------------------- | ------------ | ---- | ----- | ------------------------------------------- |
| id                    | INT          | NO   | PK    | Identificador interno                       |
| id_alimento           | INT          | YES  | UNI   | Identificador externo opcional              |
| image_url             | VARCHAR(255) | YES  |       | URL o ruta de la imagen                     |
| nombre                | VARCHAR(255) | NO   |       | Nombre del alimento                         |
| categoria             | VARCHAR(100) | YES  |       | Categoría (ej.: 'Lácteos')                 |
| Energia               | FLOAT        | YES  |       | Energía (kcal)                              |
| Humedad               | FLOAT        | YES  |       | Humedad (%)                                 |
| Cenizas               | FLOAT        | YES  |       | Cenizas (%)                                 |
| Proteinas             | FLOAT        | YES  |       | Proteínas (g)                               |
| H_de_C_disp           | FLOAT        | YES  |       | Hidratos de carbono disponibles (g)         |
| Azucares_totales      | FLOAT        | YES  |       | Azúcares totales (g)                        |
| Fibra_dietetica_total | FLOAT        | YES  |       | Fibra dietética total (g)                   |
| Lipidos_totales       | FLOAT        | YES  |       | Lípidos totales (g)                         |
| Ac_grasos_totales     | FLOAT        | YES  |       | Ácidos grasos totales (g)                   |
| Ac_grasos_poliinsat   | FLOAT        | YES  |       | Ácidos grasos poliinsaturados (g)           |
| Ac_grasos_trans       | FLOAT        | YES  |       | Ácidos grasos trans (g)                     |
| Colesterol            | FLOAT        | YES  |       | Colesterol (mg)                             |
| Vitamina_A            | FLOAT        | YES  |       | Vitamina A (µg)                             |
| Vitamina_C            | FLOAT        | YES  |       | Vitamina C (mg)                             |
| Vitamina_D            | FLOAT        | YES  |       | Vitamina D (µg)                             |
| Vitamina_E            | FLOAT        | YES  |       | Vitamina E (mg)                             |
| Vitamina_K            | FLOAT        | YES  |       | Vitamina K (µg)                             |
| Vitamina_B1           | FLOAT        | YES  |       | Vitamina B1 (mg)                            |
| Vitamina_B2           | FLOAT        | YES  |       | Vitamina B2 (mg)                            |
| Niacina               | FLOAT        | YES  |       | Niacina (mg)                                |
| Vitamina_B6           | FLOAT        | YES  |       | Vitamina B6 (mg)                            |
| Ac_pantotenico        | FLOAT        | YES  |       | Ácido pantoténico (mg)                      |
| Vitamina_B12          | FLOAT        | YES  |       | Vitamina B12 (µg)                           |
| Folatos               | FLOAT        | YES  |       | Folatos (µg)                                |
| Sodio                 | FLOAT        | YES  |       | Sodio (mg)                                  |
| Potasio               | FLOAT        | YES  |       | Potasio (mg)                                |
| Calcio                | FLOAT        | YES  |       | Calcio (mg)                                 |
| Fosforo               | FLOAT        | YES  |       | Fósforo (mg)                                |
| Magnesio              | FLOAT        | YES  |       | Magnesio (mg)                               |
| Hierro                | FLOAT        | YES  |       | Hierro (mg)                                 |
| Zinc                  | FLOAT        | YES  |       | Zinc (mg)                                   |
| Cobre                 | FLOAT        | YES  |       | Cobre (mg)                                  |
| Selenio               | FLOAT        | YES  |       | Selenio (µg)                                |

---

### registro_peso

Tabla histórica que almacena el peso capturado por cada usuario en fechas concretas.

| Campo      | Tipo          | Null | Clave | Descripción                                  |
| ---------- | ------------- | ---- | ----- | -------------------------------------------- |
| id         | INT           | NO   | PK    | Identificador incremental                    |
| id_usuario | INT           | NO   | FK    | Usuario al que pertenece el registro         |
| fecha      | DATE          | NO   | UNI   | Día del registro (único por usuario)         |
| peso       | DECIMAL(5,2)  | NO   |       | Peso en kilogramos (permite decimales)       |
| fuente     | ENUM          | NO   |       | Origen del dato (`manual` o `sync`)          |
| created_at | TIMESTAMP     | NO   |       | Fecha de creación                            |
| updated_at | TIMESTAMP     | NO   |       | Última modificación                          |

> Reglas: `FOREIGN KEY (id_usuario) REFERENCES usuario(id) ON DELETE CASCADE`, índice único `(id_usuario, fecha)` para impedir duplicados diarios y `fuente` sirve para distinguir registros manuales de eventuales sincronizaciones.

---

## 3️⃣ Insertar datos de ejemplo

Ejemplo de `INSERT` con varios alimentos (valores de referencia):

```sql
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
```

---

