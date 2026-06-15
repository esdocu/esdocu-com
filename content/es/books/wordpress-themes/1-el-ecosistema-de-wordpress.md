Antes de escribir la primera línea de código en PHP o diseñar una plantilla visual, es vital comprender la plataforma sobre la que estamos parados. WordPress no es solo un CMS; es un ecosistema completo impulsado por eventos y respaldado por una arquitectura de base de datos altamente flexible.

En este capítulo, nivelaremos nuestros conocimientos técnicos. Exploraremos la anatomía del *core*, trazaremos la línea divisoria exacta entre la lógica de los *plugins* y la presentación de los *themes*, y desentrañaremos su ciclo de carga. Finalmente, configuraremos un entorno de desarrollo local profesional y adoptaremos WP-CLI. Dominar estos cimientos es el primer paso para desarrollar de forma escalable.

## 1.1 Arquitectura del core y base de datos

WordPress está construido sobre una arquitectura monolítica tradicional impulsada por PHP y MySQL/MariaDB. A diferencia de frameworks modernos que implementan patrones estrictos como MVC (Modelo-Vista-Controlador), WordPress utiliza un enfoque procedimental con una fuerte dependencia de un sistema de eventos (que exploraremos a fondo en el Capítulo 5). Para un desarrollador PHP, comprender cómo WordPress separa sus responsabilidades a nivel de sistema de archivos y cómo estructura sus datos es el primer paso para interactuar con el sistema de forma segura.

### Arquitectura de Archivos del Core

El núcleo de WordPress divide conceptualmente el código de la aplicación de los datos del usuario. Esta separación es crucial para permitir actualizaciones del sistema sin sobrescribir el desarrollo a medida. El directorio raíz de una instalación típica se divide en tres carpetas principales:

```text
/
├── wp-admin/       (Lógica y vistas del panel de control)
├── wp-includes/    (El motor: APIs, clases, funciones del core)
└── wp-content/     (El territorio del desarrollador)
    ├── plugins/    
    ├── themes/     
    └── uploads/    

```

* **wp-admin:** Contiene todos los archivos necesarios para renderizar la interfaz de administración (el backend). Rara vez, por no decir nunca, deberías interactuar directamente con estos archivos.
* **wp-includes:** Representa el "motor" de WordPress. Aquí residen la mayoría de las clases base (como `WP_Query`, `WP_User`), las librerías de terceros empaquetadas, la API de base de datos (`wpdb`) y las funciones globales que usarás en tu theme.
* **wp-content:** Es el único directorio donde debes escribir código. Todo lo que está fuera de esta carpeta es susceptible a ser reemplazado durante una actualización menor o mayor del core.

### El Modelo de Base de Datos

La base de datos de WordPress está diseñada priorizando la flexibilidad sobre la estricta normalización relacional. Utiliza extensamente el patrón **Entity-Attribute-Value (EAV)**, lo que permite extender el modelo de datos infinitamente sin necesidad de alterar el esquema de las tablas (agregando nuevas columnas).

Una instalación limpia de WordPress genera 12 tablas (asumiendo el prefijo por defecto `wp_`). Para el desarrollo de themes, las interacciones más frecuentes ocurren en un subconjunto específico de estas tablas.

**Tablas de Contenido y Metadatos**
El corazón del almacenamiento en WordPress.

* `wp_posts`: Almacena prácticamente todo el contenido principal (entradas, páginas, menús de navegación, archivos multimedia y Custom Post Types).
* `wp_postmeta`: Implementa el patrón EAV para `wp_posts`. Aquí se guarda cualquier dato adicional asociado a un post (campos personalizados, asignación de plantillas, metadatos SEO).

**Tablas de Usuarios**
Gestión de identidad y capacidades.

* `wp_users`: Contiene los datos fundamentales de autenticación (login, hash de contraseña, email, fecha de registro).
* `wp_usermeta`: Extiende la tabla de usuarios almacenando preferencias, roles, capacidades y datos de perfil adicionales (nombre, apellido, biografía).

**Tablas de Taxonomías**
El sistema de clasificación de WordPress. Está normalizado en tres tablas para permitir una alta reutilización.

* `wp_terms`: Almacena la información básica del término (nombre y slug).
* `wp_term_taxonomy`: Define el contexto del término almacenado en `wp_terms` (si es una categoría, una etiqueta o una taxonomía personalizada) y maneja la jerarquía (términos padre/hijo).
* `wp_term_relationships`: La tabla pivote (relacional) que vincula un registro de `wp_posts` con un registro de `wp_term_taxonomy`.
* `wp_termmeta`: Similar a `postmeta`, permite añadir campos personalizados a los términos.

**Tabla de Configuración Global**

* `wp_options`: Un almacén clave-valor para la configuración global del sitio (URL del sitio, nombre del theme activo, configuración de plugins). También es el almacenamiento principal para la Transient API.

### Diagrama Relacional Simplificado

A continuación, un esquema que ilustra cómo se relacionan las entidades principales que manipularás durante el desarrollo de un theme:

```text
[ wp_users ] 1 ------- ∞ [ wp_posts ]
     |                        |
     | 1                      | 1
     |                        |
     ∞                        ∞
[ wp_usermeta ]          [ wp_postmeta ]

                              ∞
[ wp_posts ] ∞ ------- ∞ [ wp_term_relationships ]
                              |
                              | ∞
                              |
                         [ wp_term_taxonomy ]
                              |
                              | 1
                              |
                         [ wp_terms ]
                              |
                              | 1
                              |
                              ∞
                         [ wp_termmeta ]

```

Comprender que un "Post" no es solo un artículo de blog, sino un registro genérico en la tabla `wp_posts` vinculado a infinitos pares de clave-valor en `wp_postmeta`, es la base fundamental para dominar la extracción de datos que realizaremos más adelante al construir nuestras plantillas.

## 1.2 Diferencias entre plugins y themes

En el ecosistema de WordPress, la regla de oro para el desarrollo escalable y mantenible se basa en un principio fundamental: **la separación de responsabilidades**. Aunque técnicamente tanto los plugins como los themes utilizan las mismas APIs del core de WordPress y están escritos en PHP, su propósito, ciclo de vida y comportamiento dentro de la arquitectura son completamente distintos.

Para un desarrollador PHP, la forma más sencilla de interiorizar esta diferencia es ver a los plugins como la **lógica de negocio** y a los themes como la **capa de presentación o vista**.

### Roles y Responsabilidades

**Themes (La Capa de Presentación)**
El objetivo principal de un theme es controlar cómo se muestran los datos en el frontend. Un theme toma la información de la base de datos (entradas, páginas, metadatos) y decide cómo estructurarla utilizando HTML, estilizándola con CSS e interactuando con ella mediante JavaScript.

* **Exclusividad:** A diferencia de los plugins, el sistema de WordPress está diseñado para que **solo un theme esté activo a la vez** (omitiendo por ahora la relación padre/hijo que abordaremos en el Capítulo 2).
* **Archivos mínimos:** Requiere, como mínimo, un archivo `index.php` (para la lógica de renderizado por defecto) y un archivo `style.css` (que contiene la cabecera con los metadatos del tema).
* **Enfoque:** Registro de menús de navegación, áreas de widgets, tamaños de imagen, plantillas de diseño (layouts) y tipografía.

**Plugins (La Lógica de Negocio)**
Los plugins están diseñados para añadir, modificar o eliminar funcionalidades del core de WordPress, independientemente de cómo se vea el sitio web.

* **Simultaneidad:** Puedes tener docenas de plugins activos al mismo tiempo.
* **Archivos mínimos:** Solo requieren un archivo PHP con un bloque de comentarios específico en su cabecera que WordPress parsea para reconocerlo en el panel de administración.
* **Enfoque:** Registro de Custom Post Types (CPTs), pasarelas de pago, integraciones con APIs de terceros, optimización SEO o sistemas de caché.

### La trampa del archivo `functions.php`

El área más confusa para los desarrolladores que recién ingresan a WordPress es el archivo `functions.php` del theme (que detallaremos en el Capítulo 4). Este archivo se comporta exactamente igual que un plugin: se carga durante la inicialización del sistema y permite ejecutar código PHP arbitrario.

Esta similitud técnica a menudo lleva a una mala práctica arquitectónica: **acoplar la funcionalidad al diseño**.

**¿Cómo decidir dónde va el código?**
Utiliza la "Regla del Cambio de Theme". Hazte la siguiente pregunta: *Si el cliente decide cambiar este theme por otro completamente distinto mañana, ¿debería conservarse esta característica?*

* Si la respuesta es **SÍ**, el código pertenece a un **Plugin**. Ejemplos: Registro de un tipo de contenido llamado "Portafolio", creación de shortcodes, campos personalizados en la base de datos. Si registras un CPT en el theme y el usuario lo cambia, todos sus datos "desaparecerán" del panel de control (aunque sigan en la base de datos).
* Si la respuesta es **NO**, el código pertenece al **Theme**. Ejemplos: Encolar la fuente tipográfica de Google Fonts, definir que el tamaño de las imágenes destacadas sea de 800x600px, registrar un menú llamado "Navegación del Footer".

### Cuadro Comparativo

Para consolidar las diferencias técnicas y conceptuales, a continuación se presenta un resumen arquitectónico:

| Característica | Themes | Plugins |
| --- | --- | --- |
| **Directorio base** | `/wp-content/themes/` | `/wp-content/plugins/` |
| **Propósito principal** | Capa de presentación (UI/UX) y vistas. | Lógica de negocio y funcionalidades. |
| **Estado activo** | Solo uno activo (o un par padre-hijo). | Múltiples activos simultáneamente. |
| **Orden de carga** | Se cargan **después** de los plugins. | Se cargan **antes** que el theme. |
| **Archivos obligatorios** | `style.css` y `index.php`. | Un único archivo `.php` con cabecera. |
| **Pérdida de datos** | Cambiar el theme altera la apariencia, pero nunca debe ocultar datos de negocio. | Desactivar el plugin oculta/pausa la funcionalidad asociada en el sistema. |

Comprender esta frontera arquitectónica es vital antes de escribir la primera línea de código de tu tema. Mantener tu theme "agnóstico" respecto a los datos críticos garantizará que tu desarrollo sea un producto limpio, profesional y altamente escalable.

## 1.3 Ciclo de carga de WordPress

Para un desarrollador PHP, WordPress puede parecer inicialmente una "caja negra" donde la magia ocurre en segundo plano. Sin embargo, su ejecución es un proceso estrictamente lineal y procedimental. Comprender el orden exacto en el que WordPress inicializa sus componentes, carga los plugins, ejecuta el theme y procesa la URL es fundamental para evitar errores críticos, como intentar acceder a datos de la base de datos antes de que la conexión exista, o tratar de modificar la interfaz antes de que el theme se haya cargado.

El ciclo de carga (o *bootstrap*) determina cuándo está disponible cada API y cuándo es seguro ejecutar tu código.

### La Secuencia de Inicialización

Todo comienza cuando una petición HTTP llega al servidor. A menos que se trate de una ruta estática pura, el servidor (Apache, Nginx) dirige la solicitud al archivo `index.php` en la raíz de la instalación. A partir de ahí, se desencadena el siguiente flujo de ejecución:

```text
[ Petición HTTP HTTP/HTTPS ] 
           │
           ▼
     index.php (Raíz)
           │
           ▼
  wp-blog-header.php ────────────┐
           │                     │ (Una vez configurado el entorno)
           ▼                     ▼
      wp-load.php         wp-includes/template-loader.php
           │                     │ (Carga la vista del Theme)
           ▼                     ▼
     wp-config.php           [ Theme HTML Output ]
           │
           ▼
     wp-settings.php (El motor principal)

```

La verdadera inicialización ocurre dentro de `wp-settings.php`. Este archivo es responsable de levantar el sistema por fases. Como desarrollador de themes, debes prestar especial atención al orden en que se ejecutan estas fases:

1. **Definición de Constantes y Entorno:** Se establecen rutas absolutas, límites de memoria y configuraciones de PHP.
2. **Conexión a la Base de Datos:** Se instancia la clase global `$wpdb`. A partir de este momento, es posible realizar consultas SQL.
3. **Carga de Plugins:**

* Primero se cargan los *Must-Use Plugins* (directorio `mu-plugins`).
* Luego se cargan los plugins regulares activos.
* *Nota arquitectónica:* Los plugins siempre se cargan antes que tu theme. Esto permite que los plugins expongan funciones y clases que el theme luego consumirá.

1. **Carga del Theme (Aquí entras tú):**

* Se carga el archivo `functions.php` del **theme hijo** (si existe).
* Se carga el archivo `functions.php` del **theme padre**.

1. **Inicialización General (Hook `init`):** WordPress ha terminado de cargar la mayor parte de su núcleo, taxonomías, roles de usuario y CPTs nativos. Este es el momento estándar de intercepción para registrar nuevos elementos.
2. **Ejecución de la Consulta (Query):** WordPress analiza la URL solicitada, instancia la clase `WP_Query` global y extrae los datos correspondientes de la base de datos (por ejemplo, el contenido de un post específico).
3. **Renderizado (Template Loader):** Finalmente, `wp-blog-header.php` llama a `template-loader.php`, el cual examina el resultado de la consulta y decide qué archivo de tu theme (ej. `single.php` o `page.php`) debe cargar para mostrar la página.

### El error más común en el desarrollo de themes

El desconocimiento del ciclo de carga lleva a un error clásico: **intentar usar funciones dependientes del contexto de la URL directamente en el archivo `functions.php`.**

Observa el siguiente código conceptualmente erróneo:

```php
// Archivo: functions.php de tu theme

// ❌ ERROR: is_single() fallará o devolverá false prematuramente.
if ( is_single() ) {
    wp_enqueue_style( 'single-layout', get_template_directory_uri() . '/css/single.css' );
}

```

**¿Por qué falla esto?**
Si revisamos el ciclo de carga descrito anteriormente, notarás que el archivo `functions.php` (Fase 4) se evalúa y ejecuta *antes* de que WordPress analice la URL y ejecute la consulta principal (Fase 6). En el momento en que PHP lee tu condicional `is_single()`, WordPress literalmente aún no sabe qué página está visitando el usuario.

### Solución: Uso de Hooks basados en el ciclo de vida

Para solucionar el problema de la temporalidad, WordPress implementa su sistema de Hooks (que detallaremos en el Capítulo 5). En lugar de ejecutar código inmediatamente, le decimos a WordPress *cuándo* debe ejecutarlo.

El enfoque correcto respeta el ciclo de carga envolviendo la lógica en una función y "enganchándola" (hooking) en un evento que ocurra *después* de la ejecución de la consulta:

```php
// Archivo: functions.php de tu theme

// ✅ CORRECTO: Usamos una función y la enganchamos al momento adecuado.
function mi_tema_estilos_condicionales() {
    // En el momento en que se dispara 'wp_enqueue_scripts', 
    // WordPress ya ha evaluado la consulta y is_single() funcionará perfectamente.
    if ( is_single() ) {
        wp_enqueue_style( 'single-layout', get_template_directory_uri() . '/css/single.css' );
    }
}
// Le decimos a WordPress que ejecute la función durante la fase de encolado en el frontend
add_action( 'wp_enqueue_scripts', 'mi_tema_estilos_condicionales' );

```

### Hitos temporales críticos para Themes

Para tener una referencia rápida, estos son los ganchos de acción (Action Hooks) más importantes ordenados cronológicamente durante el ciclo de carga:

* **`after_setup_theme`**: Se dispara inmediatamente después de cargar `functions.php`. Es el lugar correcto para registrar soportes del tema (ej. `add_theme_support('post-thumbnails')`) y registrar menús de navegación.
* **`init`**: La mayoría de los componentes están cargados. Lugar ideal para registrar Custom Post Types o Taxonomías (aunque técnicamente esto pertenece a un plugin, es vital conocer el timing).
* **`wp_loaded`**: Todo WordPress, plugins y el theme han terminado de cargarse y están listos.
* **`pre_get_posts`**: Ocurre justo antes de que la consulta principal (`WP_Query`) se envíe a la base de datos. Es tu última oportunidad para modificar qué datos extraerá WordPress (ej. excluir una categoría de la portada).
* **`wp`**: Ocurre cuando la consulta principal ha finalizado y las variables globales como `$post` ya están configuradas.
* **`template_redirect`**: Se ejecuta justo antes de que `template-loader.php` decida qué archivo de tu theme usar. Es el lugar perfecto para forzar redirecciones basadas en la lógica de negocio antes de enviar ninguna cabecera HTTP o HTML al navegador.

## 1.4 Entornos de desarrollo local

Desarrollar un theme editando archivos directamente en un servidor en producción a través de FTP es una práctica obsoleta y peligrosa. Como desarrollador PHP, necesitas un entorno de desarrollo local que replique la pila tecnológica de tu servidor (típicamente Linux, Apache/Nginx, MySQL/MariaDB y PHP, conocido como stack LAMP o LEMP) para escribir código, probar cambios y cometer errores sin afectar a los usuarios reales.

En el ecosistema de WordPress, los entornos locales han evolucionado drásticamente desde las instalaciones monolíticas hacia soluciones basadas en contenedores.

### Evolución de las Herramientas de Desarrollo

La elección de tu herramienta local afectará directamente la velocidad de tu flujo de trabajo y la fidelidad con el entorno de producción. A continuación, se clasifican las opciones más utilizadas actualmente:

#### 1. Entornos Monolíticos Tradicionales (MAMP, XAMPP, WAMP)

Fueron el estándar durante años. Instalan globalmente en tu máquina los servicios web.

* **Ventajas:** Fáciles de instalar inicialmente.
* **Desventajas:** Difícil cambiar de versión de PHP entre diferentes proyectos (ej. tener un sitio en PHP 7.4 y otro en PHP 8.2). No reflejan las configuraciones exactas del servidor de producción.

#### 2. Entornos Visuales Específicos (Local, DevKinsta)

Aplicaciones de escritorio diseñadas exclusivamente para trabajar con WordPress. "Local" (anteriormente Local by Flywheel) es actualmente la opción más popular en esta categoría.

* **Ventajas:** Interfaz gráfica intuitiva, creación de sitios con un clic, interceptación de correos electrónicos integrada (para pruebas) y gestión sencilla de versiones de PHP y MySQL por sitio.
* **Desventajas:** Abstracción profunda; ocultan la configuración de bajo nivel, lo que puede ser un problema si necesitas configuraciones de servidor muy específicas.

#### 3. Entornos Basados en Contenedores (DDEV, Lando, Docker Compose)

Utilizan Docker bajo el capó para crear contenedores aislados y reproducibles.

* **Ventajas:** "Infraestructura como código". La configuración del entorno se guarda en un archivo (ej. `.ddev/config.yaml`) que se sube al repositorio Git. Cualquier miembro del equipo que clone el repositorio tendrá exactamente el mismo servidor local.
* **Desventajas:** Curva de aprendizaje más pronunciada; requieren conocimientos de línea de comandos y tener Docker instalado.

### Cuadro Comparativo para la Elección de Entorno

| Herramienta | Arquitectura | Curva de Aprendizaje | Ideal para... |
| --- | --- | --- | --- |
| **XAMPP/MAMP** | Servicios Globales | Baja | Proyectos esporádicos o principiantes (poco recomendado hoy en día). |
| **Local (WP)** | Contenedores Ocultos (GUI) | Muy Baja | Desarrolladores freelance, agencias pequeñas, iteración visual rápida. |
| **DDEV** | Docker (CLI) | Media | Equipos de desarrollo, CI/CD, proyectos que exigen paridad exacta con producción. |

### Configuración Esencial para el Desarrollo de Themes

Independientemente de la herramienta que elijas, el núcleo de WordPress está configurado por defecto para silenciar los errores de PHP. Esto es ideal para producción, pero desastroso para el desarrollo local, ya que un error fatal resultará en una "Pantalla Blanca de la Muerte" (White Screen of Death - WSOD) sin darte pistas, y los *Warnings* de PHP pasarán desapercibidos, acumulando deuda técnica.

El archivo `wp-config.php`, ubicado en la raíz de tu instalación, es el lugar donde debes habilitar el modo de depuración.

Para preparar tu entorno local para la creación de un theme, debes sustituir la línea `define( 'WP_DEBUG', false );` por el siguiente bloque de código:

```php
// 1. Activa el modo de depuración de WordPress
define( 'WP_DEBUG', true );

// 2. Escribe los errores en un archivo log (/wp-content/debug.log)
// Indispensable para rastrear errores en procesos en segundo plano (AJAX, Cron)
define( 'WP_DEBUG_LOG', true );

// 3. Muestra los errores directamente en la pantalla (HTML)
// Te permite ver advertencias de PHP mientras desarrollas las vistas
define( 'WP_DEBUG_DISPLAY', true );
@ini_set( 'display_errors', 1 );

// 4. Activa el script no minificado de WordPress
// Facilita la depuración si tienes conflictos con el JS o CSS del core
define( 'SCRIPT_DEBUG', true );

// 5. Evita guardar múltiples revisiones de los posts para no saturar la base de datos local
define( 'WP_POST_REVISIONS', 3 );

```

### Estructura Recomendada del Proyecto

Un error común es intentar versionar (con Git) toda la instalación de WordPress. Al ser un sistema de código abierto que se actualiza constantemente, el *core* no te pertenece. Tu repositorio debe estar estrictamente limitado al código de tu theme (y plugins personalizados si los hay).

La estructura de control de versiones recomendada en tu entorno local debe verse así:

```text
/tu-entorno-local/
├── wp-admin/       (Ignorado)
├── wp-includes/    (Ignorado)
├── wp-config.php   (Ignorado - específico del entorno)
└── wp-content/
    ├── plugins/    (Puedes versionar plugins propios)
    ├── uploads/    (Ignorado - los assets multimedia no son código)
    └── themes/
        └── tu-theme/    <-- ESTE ES TU REPOSITORIO GIT (.git)
            ├── style.css
            ├── index.php
            └── ...

```

De esta manera, el código de tu theme permanece agnóstico al entorno, pudiendo ser empaquetado y desplegado en cualquier servidor o directorio de WordPress sin arrastrar configuraciones locales o archivos del core.

## 1.5 WP-CLI: La línea de comandos

Para un desarrollador PHP moderno, depender exclusivamente de una interfaz gráfica (GUI) para tareas repetitivas es un cuello de botella. WP-CLI (WordPress Command Line Interface) es la herramienta oficial por línea de comandos que te permite interactuar con tu instalación de WordPress, gestionar su base de datos y ejecutar scripts sin necesidad de abrir el navegador.

En el contexto del desarrollo de themes, WP-CLI transforma por completo el flujo de trabajo, pasando de un proceso de clics manuales a una automatización rápida y predecible.

### Integración en el entorno de desarrollo

Si has configurado tu entorno local con herramientas basadas en contenedores (como DDEV o Lando) o entornos visuales modernos (como Local), WP-CLI ya viene preinstalado e integrado. Solo necesitas abrir la terminal en el directorio raíz de tu proyecto.

El comando base es siempre `wp`, seguido de un comando, un subcomando y banderas (flags) opcionales:

```bash
wp <comando> <subcomando> --parametro=valor

```

### Comandos Esenciales para Desarrolladores de Themes

Como creador de vistas y lógicas de presentación, tus necesidades difieren de las de un administrador de sistemas. A continuación, se detallan los comandos más útiles para tu día a día:

#### 1. Scaffolding (Generación de código base)

Escribir la estructura básica de un tema hijo desde cero es propenso a errores tipográficos. WP-CLI puede generar la arquitectura por ti instantáneamente.

```bash
# Genera un tema hijo con su style.css y functions.php vinculados al padre
wp scaffold child-theme mi-tema-hijo --parent_theme=twentytwentyfour --theme_name="Mi Tema Hijo"

```

*Nota: Históricamente, WP-CLI permitía generar temas base como `_s` (Underscores), pero con la evolución hacia Block Themes (que veremos en la Parte V), el scaffolding se ha reorientado hacia configuraciones más modulares.*

#### 2. Generación de Contenido de Prueba (Dummy Data)

Para diseñar y probar tus plantillas (`archive.php`, paginaciones, layouts de CSS Grid), necesitas datos masivos. Crear 50 posts a mano es inviable. WP-CLI lo hace en milisegundos usando la API interna sin sobrecargar el servidor web.

```bash
# Genera 50 entradas de blog asignadas al autor con ID 1
wp post generate --count=50 --post_type=post --post_author=1

# Genera términos de taxonomía (ej. 10 categorías de prueba)
wp term generate category --count=10

```

#### 3. Control de Estado y Caché

Durante el desarrollo, especialmente cuando manipules la API de Transients o ajustes opciones globales, necesitarás limpiar la caché constantemente para ver tus cambios reflejados.

```bash
# Elimina todos los transitorios expirados y no expirados
wp transient delete --all

# Vacía la caché de objetos (si hay un sistema de persistencia activo)
wp cache flush

```

#### 4. Búsqueda y Reemplazo en Base de Datos

Al migrar tu theme de un entorno local a un servidor de *staging* o producción, las URLs absolutas guardadas en la base de datos (por ejemplo, en imágenes incrustadas en el contenido) se romperán. WP-CLI maneja arreglos serializados de PHP de forma segura, algo que una consulta SQL clásica como `REPLACE()` corrompería.

```bash
# Reemplaza la URL local por la de producción de forma segura
wp search-replace 'http://mitema.local' 'https://mitema.com' --skip-columns=guid

```

### Ejecución de Código Arbitrario (REPL)

Al igual que `php -a` o la consola de Node.js, WP-CLI ofrece una consola interactiva (REPL) o la capacidad de ejecutar scripts PHP con todo el entorno de WordPress ya inicializado.

Si necesitas evaluar rápidamente el valor de una función del core o probar la salida de una función de tu theme sin crear un archivo temporal o usar `var_dump()` en tu código:

```bash
# Ejecutar la consola interactiva (Requiere el paquete wp-cli/shell-command)
wp shell

> echo get_template_directory_uri();
> exit;

```

También puedes ejecutar código en una sola línea:

```bash
wp eval 'echo get_stylesheet_directory();'

```

El dominio de WP-CLI separa a los modificadores de plantillas aficionados de los desarrolladores de themes profesionales. Permite integrar el desarrollo de WordPress en pipelines modernos, scripts de automatización en bash y flujos de integración continua (CI/CD) que abordaremos en el último capítulo de este libro.

## Resumen del capítulo

En este primer capítulo hemos sentado las bases arquitectónicas necesarias para desarrollar themes de forma profesional:

1. **Arquitectura:** Comprendimos que WordPress es un sistema procedimental impulsado por eventos, donde el código de usuario reside exclusivamente en `wp-content` y los datos se estructuran bajo un modelo EAV (Entity-Attribute-Value) altamente flexible a través de metadatos.
2. **Separación de responsabilidades:** Definimos la frontera estricta entre la lógica de negocio (plugins) y la capa de presentación (themes), estableciendo la regla de que un cambio de diseño nunca debe resultar en pérdida de datos funcionales.
3. **Ciclo de carga:** Desglosamos el orden de ejecución de WordPress, identificando por qué intentar acceder a contextos de datos prematuramente en `functions.php` falla y cómo el sistema de hooks lo resuelve.
4. **Entornos de trabajo:** Establecimos la importancia de un entorno local robusto (aislado y configurado para exponer errores de PHP) y la metodología para versionar exclusivamente el directorio del theme mediante Git.
5. **Automatización:** Introdujimos WP-CLI como el estándar de la industria para agilizar tareas operativas, generar contenido de prueba y manipular la base de datos sin depender de la interfaz gráfica.
