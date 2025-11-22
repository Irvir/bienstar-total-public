# Documento de Decisiones Técnicas y Cambios de Alcance del Proyecto

## 1. Cambio de objetivo del proyecto

### 1.1. Objetivo anterior

En la versión original del proyecto, el foco estaba puesto en que **el usuario común pudiera crear y editar su propia dieta directamente**, eligiendo alimentos libremente desde el sistema. La idea era dar total libertad al usuario final para construir sus planes alimenticios de forma autónoma, sin necesariamente contar con la supervisión de un profesional.

Sin embargo, este enfoque presentaba **dos problemas principales**:

1. **Riesgo ético y de salud**  
   - Se le entregaba demasiado poder al usuario sin garantizar conocimientos mínimos en nutrición.  
   - Esto podía derivar en dietas desequilibradas, potencialmente dañinas para la salud (déficits, excesos, combinaciones no recomendadas, etc.).
   - El sistema, en la práctica, validaba decisiones que un profesional de la salud no aprobaría.

2. **Responsabilidad del sistema**  
   - El sistema, al permitir la creación libre de dietas, asumía indirectamente un rol de guía nutricional sin el respaldo profesional adecuado.  
   - Esto generaba un conflicto con la **responsabilidad ética** del equipo: no es correcto entregar una herramienta que pueda inducir a malas decisiones alimenticias por desconocimiento del usuario.

Por estas razones, se decidió **reformular el objetivo principal del proyecto**, alineándolo mejor con la práctica profesional y la ética en salud.

---

### 1.2. Objetivo actual del proyecto

📌 **Descripción actual:**

Sistema integral destinado a **facilitar el trabajo de nutricionistas y profesionales del área de salud**, ofreciendo una **plataforma especializada** para la creación de dietas y planes alimenticios personalizados para los usuarios.  

Además, permite que cualquier usuario común pueda **buscar información detallada de alimentos**, incluyendo:

- Macronutrientes  
- Micronutrientes  
- Datos de referencia provenientes del INTA (Instituto de Nutrición y Tecnología de los Alimentos)

El sistema busca proporcionar una experiencia **sencilla, rápida y cómoda** tanto para profesionales como para usuarios finales.

🎯 **Objetivo actual:**

- **Para médicos, nutricionistas y profesionales de la salud**  
  Ofrecer una herramienta especializada para **crear dietas y planes alimenticios personalizados**, basados en información confiable y una base de datos nutricional robusta.

- **Para usuarios finales (no profesionales)**  
  Proporcionar:
  - Información detallada de alimentos.
  - Búsqueda simple y rápida de productos.
  - Datos que les ayuden a tomar decisiones **más informadas** sobre su alimentación.  

Esto responde a la necesidad de contar con una **alternativa más accesible, moderna y práctica** frente al uso de Excel u otros softwares no gratuitos.

---

### 1.3. Cambios de comportamiento de cara al usuario

- Antes:
  - El usuario podía **editar y construir su propia dieta** libremente.
- Ahora:
  - La **dieta ya no es editable por el usuario común**.
  - La construcción y modificación de dietas queda en manos de un **médico o nutricionista**.
  - El usuario común:
    - Puede **consultar** sus planes.
    - Puede **revisar información de alimentos**.
    - Pero no puede modificar la estructura nutricional de su dieta sin la intervención de un profesional.

Este cambio se implementó para asegurar una **alineación ética** con las buenas prácticas en salud y nutrición:  
> Las decisiones complejas sobre planes alimenticios deben recaer en profesionales calificados, no en usuarios con posibles vacíos de conocimiento.

---

## 2. Cambios de rebranding y alineación ética

### 2.1. Rebranding conceptual

El sistema deja de presentarse como una herramienta de “crea tu propia dieta” y pasa a ser una:

> **Plataforma profesional para gestión de dietas y consulta de información nutricional**,  
> donde el rol central lo tienen los **nutricionistas y profesionales de la salud**.

Este rebranding no es solo estético, sino **conceptual y ético**:

- Se comunica explícitamente que:
  - Las dietas deben ser creadas por profesionales.
  - El usuario final es beneficiario y consultor de información, no diseñador de su propia pauta alimenticia.

### 2.2. Justificación técnica del rebranding

Para respaldar este cambio conceptual y ético, se realizaron ajustes técnicos:

- Implementación de **perfiles de usuario diferenciados**:
  - Perfil **profesional de salud / nutricionista**:
    - Acceso a creación y edición de dietas.
    - Acceso a herramientas avanzadas.
  - Perfil **usuario común**:
    - Acceso de solo lectura a dietas asignadas.
    - Acceso a búsqueda y consulta de alimentos.
  - Perfil **administrador**:
    - Acceso a funciones de CRUD (crear, leer, actualizar, eliminar) sobre:
      - Usuarios.
      - Perfiles.
      - Alimentos.
      - Tablas de referencia.

- Diseño de flujos de interacción:
  - Todos los cambios sobre planes alimenticios pasan por un **usuario profesional o administrador**, no por el usuario final.

Todo esto está alineado con la idea de que el sistema debe **apoyar decisiones responsables**, no reemplazar el criterio profesional con automatización sin control.

---

## 3. Justificación del cambio tecnológico hacia React

### 3.1. Stack anterior

Originalmente, el proyecto utilizaba:

- **HTML + CSS** para la estructura y estilos.
- **JavaScript “a mano” (scripts sueltos)** en el frontend.
- **Node.js + Express** en el backend.
- Sin frameworks de frontend modernos ni separación clara de componentes.

Esto implicaba:

- Código de frontend **poco modular**.
- Dificultad para:
  - Reutilizar vistas.
  - Mantener estados complejos.
  - Escalar a una interfaz más interactiva.

---

### 3.2. ¿Qué framework precedía a React?

No había un framework de frontend estructurado. El flujo era:

- HTML estático.
- CSS manual.
- JS con scripts para manejar interacciones básicas.
- Node/Express para endpoints y renderizado / respuestas.

Es decir, se trabajaba con una **arquitectura clásica de páginas + scripts**, adecuada para proyectos simples, pero limitada para una aplicación rica en estados y pantallas, como un sistema de gestión nutricional con múltiples perfiles y vistas.

---

### 3.3. Motivos técnicos para migrar a React

La decisión de migrar a **React** se toma por las siguientes razones:

1. **Componentización de la interfaz**  
   React permite dividir la UI en **componentes reutilizables**:
   - Tarjetas de alimentos.
   - Tablas de resultados.
   - Formularios de creación/edición de dietas.
   - Vistas de perfiles de usuario.  
   Esto ayuda a:
   - Mantener el código ordenado.
   - Evitar duplicación.
   - Facilitar cambios localizados (modificar un componente y que se actualice en todas las vistas donde se usa).

2. **Manejo eficiente del estado**  
   El sistema ahora maneja:
   - Estado de sesión.
   - Información de usuario (rol, permisos).
   - Listado de alimentos con filtros y paginación.
   - Dietas, planes, perfiles, etc.  

   React, junto con hooks y posibles herramientas adicionales (context, etc.), facilita:

   - Controlar estados complejos de forma predecible.
   - Evitar manipulación directa y desordenada del DOM.
   - Sincronizar la UI con la data de la API de manera más limpia.

3. **Mejor experiencia de usuario (UX)**  
   - Navegación más fluida (sin recargar toda la página).
   - Actualización de vistas de forma dinámica.
   - Posibilidad de implementar:
     - Buscadores en tiempo real.
     - Filtros.
     - Formularios interactivos con validaciones rápidas.

4. **Escalabilidad y mantenibilidad**  
   - A medida que la aplicación crece (más entidades: alimentos, perfiles, profesionales, usuarios finales, dietas…), el código basado solo en HTML+CSS+JS “plano” se vuelve difícil de mantener.
   - React permite una arquitectura más clara:
     - Separación en componentes.
     - Posible reutilización de la lógica y vistas en futuras extensiones (por ejemplo: app móvil con React Native, paneles adicionales, etc.).

5. **Ecosistema y productividad**  
   - Gran cantidad de librerías y herramientas que se integran bien con React.
   - Comunidad activa y buena documentación.
   - Facilita:
     - Implementar formularios complejos.
     - Integrar gráficos, tablas avanzadas, etc.

---

### 3.4. Beneficios percibidos del uso de React

- **Código más ordenado y modular**, más fácil de entender por nuevos desarrolladores.
- **Mayor velocidad de desarrollo** de nuevas pantallas.
- Posibilidad de aplicar **buenas prácticas de UI/UX** más fácilmente.
- Base sólida para futuras optimizaciones de performance (lazy loading, memoización, splitting de código, etc.).

---

## 4. Documentación de la migración a React

### 4.1. Situación anterior

- Frontend basado en:
  - HTML estático.
  - CSS sin preprocesadores ni framework principal.
  - JS con scripts aislados.
- Backend:
  - Node.js + Express, sirviendo vistas y endpoints.

### 4.2. Situación actual

- **Frontend:**
  - React como framework principal.
  - Separación en componentes (por ejemplo: `AlimentoGridCard`, componentes de formulario, layouts, etc.).
  - Comunicación con la API vía fetch/axios (según implementación).

- **Backend:**
  - Node.js + Express se mantiene como API REST.
  - El frontend ya no depende de renderizado de vistas por el backend, sino de **consumo de endpoints**.

### 4.3. Cambios claves en la arquitectura

- De un enfoque “monolítico de vistas” (HTML+JS desde Express) a:
  - **SPA o aplicación React** que se comunica con el backend mediante HTTP/JSON.
- Estructura típica:
  - `/frontend` → proyecto React.
  - `/backend` → proyecto Node/Express.

---

## 5. Consultas directas a la base de datos vs ORM

### 5.1. Situación actual

Actualmente, el sistema utiliza **consultas directas** a la base de datos en lugar de un ORM. Es decir:

- Consultas SQL o equivalentes construidas directamente.
- Manejo explícito de joins, filtros, etc.

### 5.2. Justificación de consultas directas

1. **Control fino sobre las consultas**  
   - Permite optimizar manualmente:
     - Selección de columnas.
     - Índices utilizados.
     - Joins específicos.
   - Útil en un dominio con muchas tablas relacionadas (alimentos, nutrientes, perfiles, dietas, usuarios, etc.).

2. **Simplicidad de la capa de acceso a datos**  
   - En esta etapa del proyecto, un ORM puede añadir:
     - Curva de aprendizaje.
     - Sobrecarga de abstracción.
   - Las consultas necesarias son relativamente claras y se controlan desde el propio backend.

3. **Performance predecible**  
   - Las consultas se pueden analizar directamente (EXPLAIN, índices, etc.).
   - Se evita la generación de SQL poco óptimo por parte de un ORM en escenarios complejos.

4. **Flexibilidad ante cambios de esquema**  
   - Modificar tablas y queries directas puede ser más transparente, sin verse limitado por la capa de mapeo del ORM.

> Nota: El uso de consultas directas no descarta la adopción futura de un ORM, pero por ahora se prioriza el **control y la claridad** en un contexto donde la estructura de datos está aún en evolución.

---

## 6. Consideración de herramientas de performance

Se considera oportuno incorporar herramientas similares a las usadas por otros compañeros para:

- Medir:
  - Tiempos de respuesta del backend.
  - Tiempos de renderizado y carga de componentes en React.
- Detectar:
  - Consultas lentas.
  - Componentes que se renderizan en exceso.
- Optimizar:
  - Caché de resultados frecuentes (por ejemplo, tablas de alimentos).
  - Paginación/limitación de resultados en búsquedas.

Estas herramientas no forman parte aún del núcleo del sistema, pero se plantea su introducción como una **siguiente fase** de mejora.

---

## 7. Evolución funcional: perfiles, administrador y restricciones

### 7.1. Implementación de una base de datos más extensa

Para soportar el nuevo objetivo ético y funcional, se amplió el modelo de datos:

- Tablas/perfiles para:
  - Profesionales de la salud.
  - Usuarios finales.
  - Administradores.
- Asociación de dietas y planes alimenticios a:
  - Pacientes/usuarios.
  - Profesionales.

### 7.2. Perfiles y restricciones

- **Usuario común**:
  - No puede editar su dieta.
  - Solo puede:
    - Ver su dieta asignada.
    - Buscar alimentos.
    - Consultar información nutricional.

- **Profesional de salud / nutricionista**:
  - Puede **crear y modificar**:
    - Dietas y planes alimenticios.
    - Parámetros personalizados para pacientes.
  - Tiene acceso a información más avanzada de configuración.

- **Administrador**:
  - Cuenta con funciones CRUD sobre:
    - Usuarios.
    - Perfiles.
    - Registros maestros (alimentos, categorías, etc.).
  - Puede gestionar permisos.

### 7.3. Justificación de estas decisiones

- Asegurar que las decisiones nutricionales pasan por un filtro profesional.
- Evitar que el usuario final pueda autogestionar dietas complejas sin supervisión.
- Garantizar transparencia y trazabilidad de cambios (quién modificó qué y cuándo).

---

## 8. Optimización de la gestión de alimentos (texto y UX)

En la sección de **gestión de alimentos**, se tomaron decisiones para:

- **Reducir la cantidad de texto innecesario**:
  - En interfaces, se busca que:
    - Las descripciones sean breves.
    - La información relevante (macros, micros, porciones, etc.) esté en primer plano.
- **Mejorar la legibilidad**:
  - Uso de tablas y tarjetas en lugar de párrafos largos.
  - Etiquetas claras para valores nutricionales.
- **Facilitar la búsqueda**:
  - Barra de búsqueda.
  - Filtros (por tipo de alimento, por categoría, etc.).
- **Mantener consistencia visual con el rebranding**:
  - Tono profesional centrado en la salud y la ciencia.
  - Menos enfoque en “elige lo que quieras” y más en “consulta información y sigue tu plan profesional”.

---

## 9. Alineación ética en decisiones de cambio

Cada decisión técnica y funcional descrita se ha tomado considerando:

- **Responsabilidad en el ámbito de la salud**:
  - No fomentar prácticas alimenticias riesgosas.
  - Respaldar decisiones con roles profesionales claros.
- **Transparencia de roles**:
  - El usuario sabe qué puede hacer y qué no.
  - El profesional sabe qué herramientas tiene y qué impacto tienen sus acciones.
- **Uso responsable de la tecnología**:
  - La herramienta respalda el trabajo profesional, no lo reemplaza.
  - Se evita presentar el sistema como sustituto de la consulta con un nutricionista o médico.

---

## 10. Resumen

- El proyecto **cambia su objetivo** desde un enfoque de “usuario común editable” a una plataforma **profesional y ética**, centrada en nutricionistas y médicos.
- Se implementa un **rebranding conceptual y técnico**, alineado con esta nueva visión.
- Se migra de una base con **HTML+CSS+JS+Node/Express sin framework** a una arquitectura con **React en el frontend** y **Node/Express como API**.
- Se opta por **consultas directas** a la base de datos para mantener control y performance, sin descartar ORM a futuro.
- Se introducen **perfiles de usuario**, un perfil de administrador con CRUD y restricciones claras para el usuario común.
- Se mejora la **gestión de alimentos** con interfaces más concisas, claras y útiles.
- Todas estas decisiones se toman con la intención de asegurar una **alineación ética**, una experiencia de usuario más profesional y una base técnica más escalable.

```markdown
