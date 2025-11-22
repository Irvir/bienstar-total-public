## Requisitos no funcionales

1. **Conectividad y acceso**
   - El sistema requerirá conexión a Internet para su funcionamiento.
   - El acceso al sistema se realizará mediante un navegador web moderno y actualizado.

2. **Usabilidad**
   - La página web deberá ser amigable, intuitiva y sencilla de usar para todo tipo de usuarios.
   - La interfaz deberá presentar la información de forma clara, evitando sobrecargar al usuario con texto innecesario.
   - La clasificación de alimentos y dietas deberá facilitar la búsqueda y navegación (por ejemplo, por tipo de alimento, categoría, objetivo nutricional).

3. **Seguridad**
   - Las contraseñas de los usuarios deberán almacenarse de forma segura utilizando mecanismos de encriptación/hasheo.
   - La página web deberá implementar buenas prácticas de seguridad (por ejemplo, uso de HTTPS, protección frente a inyección SQL y manejo adecuado de sesiones).
   - El acceso a funcionalidades sensibles (creación/edición de dietas, gestión de usuarios, CRUD de alimentos) deberá estar restringido según el perfil del usuario (administrador, profesional de salud, usuario final).

4. **Calidad de la información**
   - La información nutricional de los alimentos deberá provenir de fuentes fiables, tales como el INTA u otras instituciones reconocidas.
   - La base de datos deberá contener al menos 25 alimentos con información básica (nombre, identificación y datos nutricionales esenciales).

5. **Contenido multimedia**
   - El sistema deberá permitir la visualización de imágenes asociadas a los alimentos, con el fin de mejorar la experiencia del usuario y la identificación visual de los productos.

6. **Arquitectura y disponibilidad**
   - El sistema deberá estar disponible a través de una arquitectura web cliente–servidor.
   - Se deberá garantizar un tiempo de respuesta razonable en la carga de listados y búsquedas de alimentos (por ejemplo, que las consultas comunes se resuelvan en pocos segundos, dependiendo de la conexión del usuario).

7. **Mantenimiento y escalabilidad**
   - La solución deberá estar diseñada de forma modular para facilitar el mantenimiento y la incorporación futura de nuevos alimentos, categorías o funcionalidades.
   - La clasificación de alimentos y dietas deberá ser extensible, permitiendo agregar nuevas categorías sin afectar el funcionamiento actual.

8. **Notificaciones (API interna)**
   - El sistema deberá contar con una API interna para el manejo de notificaciones (por ejemplo, avisos sobre actualización de dietas, nuevos alimentos o mensajes para el profesional de salud).
   - La API interna deberá estar documentada y seguir un estándar consistente (por ejemplo, REST).

9. **Limitaciones del sistema**
   - El sistema permitirá la gestión de un máximo de 4 dietas activas por usuario, según la definición actual del alcance del proyecto.
