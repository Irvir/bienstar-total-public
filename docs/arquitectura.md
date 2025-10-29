# 🌿 BienStar Total — Estructura del Proyecto

Este documento describe la organización de archivos y carpetas del proyecto **BienStar Total**. Está diseñado para que el equipo de desarrollo y los usuarios que instalen el proyecto puedan entender rápidamente dónde se encuentra cada parte del código.

---

## 📁 Estructura de carpetas y archivos

BienStarTotal/
│
├─ doc/ # Documentación del proyecto
│
├─ node_modules/ # Dependencias instaladas del proyecto
│
├─ public/ # Archivos públicos accesibles por el navegador
│ └─ config.js # Define variables globales:
│ - window.API_BASE → URL base del backend
│ - window.ASSET_BASE → URL base de assets estáticos
│
├─ src/ # Código fuente de la aplicación
│ ├─ components/ # Componentes React (JSX) reutilizables
│ ├─ controladores/ # Scripts JS individuales (controladores)
│ ├─ pages/ # Versiones antiguas de páginas HTML
│ └─ styles/ # Archivos CSS de los componentes
| 
│
├─ .env # Variables de entorno (API keys, DB, etc.)
├─ server.js # Servidor backend (Express + MySQL)
├─ package.json # Dependencias, scripts y configuración del proyecto
├─ vite.config.js # Configuración del bundler Vite
└─ README.md # Documentación del proyecto

---

## 📌 Detalles de la estructura

- **doc/**: Contiene toda la documentación del proyecto, guías de instalación, manuales y notas técnicas.  
- **node_modules/**: Carpeta generada automáticamente con todas las dependencias instaladas vía `npm` o `yarn`.  
- **public/**: Archivos accesibles públicamente, como imágenes, favicon, y scripts globales (`config.js`).  
- **src/components/**: Componentes React que construyen la interfaz de usuario (formularios, botones, menús, etc.).  
- **src/controladores/**: Scripts JavaScript independientes que manejan la lógica de la aplicación.  
- **src/pages/**: Versiones antiguas de páginas HTML que aún se mantienen como referencia.  
- **src/styles/**: Hojas de estilo CSS organizadas por componente o funcionalidad.  
- **.env**: Variables de entorno sensibles, como claves de API, credenciales de la base de datos o tokens de Firebase.  
- **server.js**: Archivo principal del servidor Express, maneja rutas, conexión a la base de datos y APIs.  
- **package.json**: Contiene información del proyecto, scripts de npm y dependencias.  
- **vite.config.js**: Configuración específica del bundler Vite para desarrollo y producción.

---

#

