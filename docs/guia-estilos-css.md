# Guía breve de estilos (CSS)

Esta guía resume cómo están organizados los estilos y cómo reutilizar tokens para mantener consistencia visual en el proyecto.

## Tokens y base

- Los tokens de diseño están definidos en `src/styles/Base.css` dentro del selector `:root`.
- Variables principales:
  - Colores: `--primary`, `--primary-dark`, `--primary-contrast`, `--success`, `--danger`, `--warning`, `--info`, `--text`, `--muted`, `--bg`.
  - Sombras: `--shadow-sm`, `--shadow-md`, `--shadow-lg`.
  - Bordes: `--border-subtle`.
  - Radios: `--radius-sm`, `--radius`, `--radius-lg`, `--radius-xl`.
  - Dimensiones: `--max-w`, `--gap`, tamaños de avatar.

Usa las variables con `var(--nombre)` en tus nuevas reglas para alinear paleta y elevaciones.

## Convenciones

- Orden de propiedades por grupos: layout → box-model → tipografía → color/visual → interaction → miscelánea.
- Evitar duplicados entre hojas. Si necesitas estilos globales, preferir agregarlos a `Base.css`.
- Prefiere clases con ámbito de página (p. ej. `.login-page`, `.perfil-page`) para evitar fugas de estilos.

## Componentes comunes

- Botones globales: `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-block`.
- Menú desplegable: `.menuDesplegable` y `.opcionMenu` (base con `--border-subtle`).

## Notas de migración (este cambio)

- Se limpiaron duplicados en `Loader.css`, `Pie.css`, `Calendario.css` y `Alimentos.css`.
- `Encabezado.css` ahora usa tokens (`--primary`, `--primary-contrast`) y sombras de `Base.css`.
- `Base.css` amplió tokens de colores, sombras y radios.

## Cómo proponer cambios

1. Si el ajuste es global, añadir/ajustar variables en `Base.css`.
2. Reutilizar tokens en las páginas/componentes.
3. Evitar redefinir el mismo selector con estilos distintos en el mismo archivo.

