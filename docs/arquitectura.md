bienstar-total/
│
├── frontend/                  # Interfaz de usuario (React + Vite)
│   ├── public/                # Archivos estáticos (favicon, manifest, etc.)
│   ├── src/
│   │   ├── assets/            # Imágenes, íconos, fuentes
│   │   ├── components/        # Componentes reutilizables (Navbar, Card, etc.)
│   │   ├── pages/             # Vistas principales (Inicio, Recetas, Perfil)
│   │   ├── services/          # Funciones para consumir APIs (fetch, axios)
│   │   ├── context/           # Contextos globales (auth, preferencias)
│   │   ├── hooks/             # Custom hooks (useNutrition, useCalendar)
│   │   ├── App.jsx            # Componente raíz
│   │   ├── main.jsx           # Punto de entrada
│   │   └── index.css          # Estilos globales
│   └── vite.config.js         # Configuración de Vite
│
├── backend-node/             # API REST con Node.js + Express
│   ├── controllers/          # Lógica de negocio (recetas, usuarios, dietas)
│   ├── routes/               # Endpoints (GET, POST, PUT, DELETE)
│   ├── models/               # Modelos de datos (MySQL con Sequelize o raw SQL)
│   ├── middleware/           # Autenticación, validación, manejo de errores
│   ├── utils/                # Funciones auxiliares (formateo, validadores)
│   ├── config/               # Configuración de DB, variables de entorno
│   ├── index.js              # Punto de entrada del servidor Express
│   └── package.json          # Dependencias del backend
│
├── backend-java/             # Microservicios en Java (Spring Boot recomendado)
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/bienstar/servicio/  # Lógica de microservicio (ej. recomendador)
│   │   │   └── resources/
│   │   │       ├── application.properties  # Configuración del microservicio
│   │   │       └── templates/              # Si usas Thymeleaf (opcional)
│   └── pom.xml                 # Dependencias Maven
│
├── database/                 # Scripts y exportaciones de MySQL
│   ├── schema.sql            # Estructura de tablas
│   ├── seed.sql              # Datos iniciales (usuarios, alimentos)
│   └── export/               # Backups o exportaciones manuales
│
├── docs/                     # Documentación del proyecto
│   ├── arquitectura.md       # Explicación técnica del sistema
│   ├── endpoints.md          # Lista de rutas y métodos
│   └── requerimientos.md     # Funcionalidades y objetivos
│
└── README.md                 # Descripción general del proyecto