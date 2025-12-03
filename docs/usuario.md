# Guía de Usuario

Esta guía resume el uso del sistema para usuarios finales y administradores.

## Acceso y Cuenta
- Registro: desde la vista `CrearCuenta` en el frontend.
- Inicio de sesión: vista `Login`.
- Sesión: se gestiona en `src/middleware/auth.js` y `src/utils/authFetch.js`.
- Perfil: vista `Perfil` para ver y editar datos.

## Navegación principal
- `Home`: información general y acceso rápido.
- `Alimentos`: consulta y filtro de alimentos.
- `Dietas`: visualización y gestión de dietas.
- `Calendario`: seguimiento y planificación.
- `TipsParaTuDieta`: recomendaciones.

## Funcionalidades de Usuario

### Usuarios normales
- Buscar alimentos: en `Alimentos`, usa filtros y barra de búsqueda.
- Ver dieta personal.
- Registrar peso: disponible desde `Perfil` (ver `weightLogs.controller.js`).
- Editar perfil.

### Doctores
- Consultar usuarios/pacientes: acceso a listados y detalle de perfiles según permisos.
- Crear y asignar dietas a pacientes.
- Revisar registros de peso de pacientes: visualización y seguimiento (ver `weightLogs.controller.js`).
- Supervisar y ajustar planes: editar dietas existentes y recomendaciones.

## Funcionalidades de Administrador
- Panel `Admin`: gestión de usuarios, alimentos y dietas.
- Crear/editar/eliminar alimentos: rutas en `server/routes/foods.routes.js` y `src/controllers/foods.controller.js`.
- Gestionar dietas: `server/routes/diets.routes.js` y `src/controllers/diets.controller.js`.
- Autorización: middleware `server/middleware/authorizeAdmin.js`.

## Seguridad y Captcha
- El sistema puede integrar reCAPTCHA (ver `docs/recaptcha.md`).
- Autenticación de API: tokens/headers manejados por `authFetch.js`.

## Endpoints y API
Consulta `docs/endpoints.md` para la lista completa de endpoints.
Principales rutas del cliente están en `src/routes/` y controladores en `src/controllers/`.

## Soporte
- Revisa `docs/` para arquitectura, requisitos y cambios.
- Reporta issues a través del repositorio público o al equipo responsable.
