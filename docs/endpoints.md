# Endpoints del servidor (server.js)

---

## Rutas públicas / admin (creadas con `app`)

- POST `/admin/foods`

  - Qué hace: Crea un nuevo registro de alimento en la tabla `alimento` con todos los campos nutricionales.
  - Body (JSON): { nombre, Energia, Humedad, Cenizas, Proteinas, H_de_C_disp, Azucares_totales, Fibra_dietetica_total, Lipidos_totales, Ac_grasos_totales, Ac_grasos_poliinsat, Ac_grasos_trans, Colesterol, Vitamina_A, Vitamina_C, Vitamina_D, Vitamina_E, Vitamina_K, Vitamina_B1, Vitamina_B2, Niacina, Vitamina_B6, Ac_pantotenico, Vitamina_B12, Folatos, Sodio, Potasio, Calcio, Fosforo, Magnesio, Hierro, Zinc, Cobre, Selenio }
  - Respuesta: { message: "Alimento creado correctamente", id }
  - Errores: 500 en fallo de BD, 400 si faltan campos (no hay validación exhaustiva en el servidor).

- POST `/admin/foods/upload-image`

  - Qué hace: Subida de un archivo de imagen (campo multipart `image`). Guarda el archivo en `public/uploads` y devuelve la URL relativa.
  - Form data: field `image` (file)
  - Respuesta: { image_url: "/uploads/<filename>" }
  - Errores: 400 si no se envía archivo.

- GET `/admin/foods`

  - Qué hace: Devuelve todos los alimentos (fila completa de la tabla `alimento`). Normaliza el campo de imagen a `image_url` o `image`.
  - Query: ninguno
  - Respuesta: array de alimentos (JSON)
  - Errores: 500 si falla la consulta.

- PUT `/admin/foods/:id`
  - Qué hace: Actualiza el alimento con id `:id` con los campos enviados en el body (incluye `image_url`).
  - Params: `id` (path)
  - Body (JSON): mismos campos que en creación + `image_url`
  - Respuesta: { message: "Alimento actualizado correctamente" } o 404 si no existe
  - Errores: 500 en fallo de BD

## Rutas de usuario / cuentas (mezcla de `router` montado en `/admin` y rutas en `app`)

- GET `/admin/users` (definido como `router.get('/users')`)

  - Qué hace: Devuelve todas las cuentas de la tabla `usuario` con campos básicos (id, nombre, email, altura, peso, edad, actividad_fisica, sexo, id_perfil, id_dieta, estado).
  - Respuesta: array de usuarios

- POST `/admin/users` (definido como `router.post('/users')`)

  - Qué hace: Crea un usuario (registro directo en tabla `usuario`) con estado `activo`.
  - Body (JSON): { nombre, email, password, altura, peso, edad, actividad_fisica, sexo, id_perfil, id_dieta }
  - Respuesta: { id, message }

- PATCH `/admin/user/:id` (definido como `router.patch('/user/:id')`)

  - Qué hace: Actualiza parcialmente los campos de usuario (construye `SET` dinámico según el body).
  - Params: `id`
  - Body: objeto con los campos a actualizar
  - Respuesta: { message }

- POST `/admin/user/:id/deactivate` (definido como `router.post('/user/:id/deactivate')`)

  - Qué hace: Marca la cuenta como `inactivo` en la columna `estado`.
  - Params: `id`
  - Respuesta: { message }

- POST `/admin/user/:id/activate` (definido como `router.post('/user/:id/activate')`)
  - Qué hace: Marca la cuenta como `activo`.
  - Params: `id`
  - Respuesta: { message }

Nota: además existen otras rutas sobre usuarios definidas directamente en `app` (no en `router`). Ver sección siguiente.

## Rutas varias definidas en `app` (públicas)

- POST `/checkEmail`

  - Qué hace: Verifica si un email ya existe en la tabla `usuario`.
  - Body: { email }
  - Respuesta: { exists: true|false } o error con mensaje
  - Validaciones: formato básico del email (regex) antes de consultar DB.

- POST `/registrar`

  - Qué hace: Registro de usuario con validación de datos (edad, peso, altura, formato email y password). Opcionalmente valida reCAPTCHA si está configurado en `RECAPTCHA_SECRET`.
  - Body: { nombre, email, password, altura, peso, edad, nivelActividad, sexo, alergias (array), otrasAlergias, recaptchaToken }
  - Flujo importante: crea una dieta por defecto, hashea la contraseña (bcrypt), guarda usuario y guarda alergias en `categoria_alergico`.
  - Respuesta: { message: "Usuario registrado exitosamente" }
  - Errores: 400 si validación falla (se devuelve array `errores`), 500 en error servidor

- POST `/login`

  - Qué hace: Login de usuario; valida email/password contra la DB (bcrypt). Devuelve datos básicos de usuario y lista de alergias.
  - Body: { email, password }
  - Respuesta: { message: "Login exitoso", user: { id, nombre, email, altura, peso, edad, id_dieta, actividad_fisica, sexo, alergias, otrasAlergias } }
  - Códigos: 400 si faltan credenciales, 401 si credenciales inválidas, 403 si usuario inactivo

- PATCH `/user/:id/activar`

  - Qué hace: (ruta en `app`) Reactiva un usuario (cambia `estado` a `activo`).
  - Params: `id`
  - Respuesta: { message } o 404

- DELETE `/user/:id`

  - Qué hace: Marca un usuario como `inactivo` (se usa `UPDATE usuario SET estado='inactivo'`).
  - Params: `id`
  - Respuesta: { message } o 404

- PATCH `/user/:id` (otra definición en `app` con transacción)

  - Qué hace: Actualiza usuario de forma más compleja (usa transacciones). Actualiza campos básicos y reemplaza alergias (elimina antiguas e inserta nuevas si se pasan).
  - Params: `id`
  - Body: { nombre, altura, peso, edad, actividad_fisica, sexo, id_perfil, id_dieta, estado, alergias }
  - Respuesta: { message, usuario: { ... } }
  - Notas: realiza `beginTransaction` / `commit` / `rollback` y valida edad.

- GET `/user/:id`
  - Qué hace: Devuelve un usuario por id con las alergias (consulta `categoria_alergico`).
  - Params: `id`
  - Respuesta: objeto usuario o 404

## Endpoints relacionados con alimentos y búsqueda (públicos)

- GET `/food/:id`

  - Qué hace: Devuelve el alimento con `id` específico (todos los campos nutricionales).
  - Params: `id`
  - Respuesta: objeto alimento o 404

- GET `/food-search?q=<texto>`

  - Qué hace: Si `q` presente, busca por `nombre LIKE %q%` (collate utf8mb4_general_ci) y devuelve hasta 50 resultados; si `q` vacío devuelve los primeros 50 alimentos.
  - Query: `q` opcional
  - Respuesta: array de alimentos

- GET `/admin/foods` (segunda definición en el archivo)
  - Nota: el fichero contiene dos definiciones de `GET /admin/foods`. Una devuelve rows y normaliza `image_url`; la otra hace un mapeo adicional para normalizar distintos campos de imagen (`image`, `imagen`, `image_url`, `path`). Revisa cuál queda activa tras ejecutar el archivo (la última definición sobrescribe la anterior).

## Dietas / plan de comidas

- GET `/get-diet?id_dieta=<id>`

  - Qué hace: Devuelve la dieta (días, comidas, alimentos y cantidad) para `id_dieta` (por defecto `1` si no se pasa).
  - Query: `id_dieta` (recomendado)
  - Respuesta: array con { dia, tipo_comida, alimento, cantidad }

- POST `/save-diet`

  - Qué hace: Recibe `{ id_dieta, comidas }` donde `comidas` es array con { id (id_alimento), dia, tipoComida, cantidad }. Crea días/comidas si no existen y añade (o actualiza) las entradas en la relación comida_alimento. Usa transacciones por cada request.
  - Body: { id_dieta, comidas }
  - Respuesta: { message: "Dieta guardada correctamente" } o 400 si body inválido

- POST `/clear-day`

  - Qué hace: Inactiva todas las comidas y sus alimentos (marca `estado = 'inactivo'`) de un día específico en una dieta.
  - Body: { id_diet, dia }
  - Respuesta: { success: true, message } o 400/500

- POST `/delete-diet-item`
  - Qué hace: Inactiva un alimento específico de una comida en un día (busca day -> meal -> meal_food y marca `estado='inactivo'`).
  - Body: { id_diet, id_food, dia, tipoComida }
  - Respuesta: { success: true, message } o 404 si no se encuentra

## Autenticación con Google

- POST `/api/auth/google`
  - Qué hace: Autentica al usuario usando un token de Google (Firebase). Si es la primera vez, crea una cuenta nueva.
  - Body: { idToken } - Token JWT de Firebase Auth
  - Respuesta exitosa (200):
    ```json
    {
      "token": "jwt_token_del_servidor",
      "user": {
        "id": "id_en_bd",
        "email": "email@gmail.com",
        "nombre": "Nombre Usuario",
        "foto": "url_foto_perfil"
      }
    }
    ```
  - Errores:
    - 401: Token inválido o expirado
    - 500: Error al procesar la solicitud
  - Notas:
    - Requiere Firebase Admin SDK configurado en el servidor
    - Actualiza el nombre y foto del usuario si ya existe
    - Crea una cuenta nueva si el email no existe en la base de datos
    - El token devuelto es válido por 24 horas

## Otros endpoints y notas técnicas

- POST `/ensure-diet`
  - Qué hace: Asegura que un usuario tenga una dieta asociada. Puede recibir `user_id` o `email` y devolver `id_dieta` (crea una si hace falta).
  - Body: { user_id?, email? }

---
