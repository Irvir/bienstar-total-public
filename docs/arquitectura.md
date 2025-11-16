# 🌿 BienStar Total — Estructura del Proyecto

Este documento describe la organización de carpetas y archivos del repositorio **bienstar-total-public**. Su objetivo es facilitar la comprensión rápida de la arquitectura tanto para desarrollo como para despliegue.

---

## 📁 Visión general (árbol simplificado)

```text
bienstar-total-public/
│
├─ docs/                  # Documentación (actas, arquitectura, endpoints, requisitos, wireframes)
├─ db/                    # Migraciones y documentación de la base de datos
│  └─ migrations/         # Scripts SQL versionados
├─ scripts/               # Scripts auxiliares (p.ej. inicialización de DB para tests)
├─ public/                # Recursos estáticos servidos directamente
│  ├─ config.js           # Variables globales: window.API_BASE, window.ASSET_BASE
│  └─ assets/             # Imágenes, sonidos, uploads
├─ src/                   # Código fuente frontend + lógica compartida
│  ├─ components/         # Componentes React reutilizables (JSX)
│  ├─ controllers/        # Lógica de interacción (fetch, manejo de datos en cliente)
│  ├─ pages/              # Páginas HTML legado (referencia / transición a React)
│  ├─ middleware/         # Middlewares (si hay lógica compartida en cliente)
│  ├─ routes/             # Definición de rutas (cliente / navegación) si aplica
│  ├─ utils/              # Utilidades y helpers independientes
│  └─ styles/             # Estilos CSS organizados por vista/componente
├─ server/                # Código backend modular (controladores específicos)
├─ test/                  # Configuración y utilidades de pruebas (Vitest)
├─ eslint.config.js       # Configuración de linting (ESLint)
├─ vitest.config.js       # Configuración de pruebas (Vitest)
├─ vite.config.js         # Configuración del bundler Vite
├─ server.js              # Punto de entrada del servidor Express (setup general)
├─ package.json           # Dependencias y scripts npm
├─ README.md              # Documentación principal del proyecto
└─ .env (no versionado)   # Variables de entorno locales (API keys, credenciales)
```

---

## 🧩 Capas y responsabilidades

- **Frontend (React / estático)**: Vive principalmente en `src/components`, `src/styles`, y gradualmente reemplaza las páginas legado en `src/pages`. `public/` aloja recursos estáticos y `config.js` expone configuración no sensible (endpoints base) al navegador.
- **Cliente (lógica de interacción)**: `src/controllers` centraliza funciones que consumen APIs, transforman datos y coordinan estado simple fuera de componentes. Mantiene la lógica desacoplada de la presentación.
- **Backend**: `server.js` inicializa Express (middlewares globales, conexión a DB). La lógica específica se divide en controladores y rutas adicionales dentro de `server/` (y/o en `src/controllers` si parte del naming requiere refactor para diferenciar claramente cliente vs servidor). Se recomienda mantener separado: `server/` = backend puro.
- **Base de datos**: Migraciones en `db/migrations` permiten versionar la evolución del esquema. Documentación auxiliar en `db/*.md`.
- **Infraestructura / tooling**: Lint (`eslint.config.js`), pruebas (`vitest.config.js`), bundling (`vite.config.js`), scripts auxiliares (`scripts/`).
- **Pruebas**: `test/` contiene configuración (`setup.js`, `test-setup.js`) y helpers para Vitest. Asegurar que los componentes y controladores clave tengan cobertura mínima.

---

## 🔐 Variables de entorno

El archivo `.env` (excluido del control de versiones) almacena credenciales y configuraciones sensibles: claves de API, credenciales de base de datos, tokens de servicios externos. Nunca debe exponerse directamente al cliente. Las variables públicas se canalizan mediante `public/config.js` o proceso de build.

---

## ⚙️ Configuraciones clave

- `vite.config.js`: Ajustes de build y dev server (alias, plugins, optimizaciones).
- `vitest.config.js`: Define entorno de pruebas (coverage, globals, transformaciones).
- `eslint.config.js`: Reglas de estilo y calidad para mantener código consistente.
- `scripts/setup-test-db.js`: Automatiza preparación de entorno de base de datos para pruebas.

---

## 🗃️ Documentación

La carpeta `docs/` incluye documentos de arquitectura, endpoints, requisitos funcionales, actas de equipo y wireframes. Mantenerlos actualizados reduce fricción al incorporar nuevos miembros y facilita auditorías técnicas.

---

## ✅ Notas de alineación y mejoras futuras

1. Unificar definitivamente la distinción entre `src/controllers` (cliente) y `server/` (backend) para evitar ambigüedad. Se sugiere renombrar `src/controllers` a `src/client` o `src/services` en una iteración futura.
2. Documentar en `README.md` el flujo de inicialización (instalar dependencias, ejecutar migraciones, arrancar servidor + frontend).
3. Añadir sección de "Convenciones" (naming, estructura de componentes, manejo de estado) para reforzar cohesión.
4. Explorar mover middlewares puramente de backend fuera de `src/middleware` si actualmente hay mezcla de responsabilidades.

---

## 🏁 Resumen

La estructura actual soporta separación clara de documentación, frontend, backend, pruebas y datos. Las mejoras propuestas buscan principalmente reforzar claridad semántica y facilitar escalabilidad.

---

Última actualización: (revisar y completar fecha al confirmar cambios)

---


