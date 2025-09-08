``` plaintext
bienstar-total/
│
├── frontend/                  # Interfaz de usuario (React + Vite)
│   ├── public/                # Archivos estáticos (favicon, manifest, etc.)
│   ├── src/
│   │   ├── assets/            # Imágenes, íconos, fuentes
│   │   ├── components/        # Componentes reutilizables (Navbar, Card, etc.)
│   │   ├── pages/             # Vistas principales (Inicio, Recetas, Perfil)
│   │   ├── main.jsx           # Punto de entrada
│   │   └── index.css          # Estilos globales
│
├── backend-node/             # API REST con Node.js + Express
│   ├── controllers/          # Lógica de negocio (recetas, usuarios, dietas)
│   ├── routes/               # Endpoints (GET, POST, PUT, DELETE)
│   ├── index.js              # Punto de entrada del servidor Express
│   └── package.json          # Dependencias del backend
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
