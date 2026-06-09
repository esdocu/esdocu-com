Antes de escribir lógica compleja o modificar el diseño visual, es vital entender cómo WordPress lee y estructura nuestros proyectos. En este capítulo, desglosaremos los cimientos que convierten una simple carpeta en un tema funcional. Exploraremos el manifiesto de identidad dentro de `style.css`, el motor de renderizado de `index.php` y el control centralizado de `functions.php`. Además, aprenderemos la metodología oficial para heredar y modificar proyectos de forma segura utilizando los Themes Hijo. Prepárate para dominar la arquitectura base sobre la que construiremos cualquier diseño sólido y escalable en el ecosistema.

## 2.1 Archivos requeridos mínimos

Cuando observamos el código fuente de un theme comercial moderno o incluso los temas predeterminados más antiguos que incluye WordPress, es fácil abrumarse por la cantidad de directorios, plantillas PHP, archivos JavaScript y hojas de estilo. Sin embargo, la arquitectura del sistema de temas de WordPress es sorprendentemente minimalista en su base.

Para que el core de WordPress reconozca una carpeta como un theme válido, la liste en el panel de administración (Apariencia > Temas) y permita su activación, solo exige la presencia estricta de dos archivos en el directorio raíz del tema.

Cualquier tema clásico comienza con esta estructura esquelética:

```text
wp-content/
└── themes/
    └── mi-theme-personalizado/
        ├── index.php
        └── style.css

```

El propósito de estos dos archivos cubre las dos necesidades fundamentales de WordPress al manejar la capa de presentación: identificación y renderizado.

* **`style.css` (Identificación y diseño):** Más allá de ser el lugar donde tradicionalmente se escriben las reglas CSS para el diseño visual, en el ecosistema de WordPress este archivo actúa como el "documento de identidad" del theme. El motor de WordPress analiza este archivo en busca de una estructura de comentarios específica para extraer metadatos críticos. Si este archivo falta, WordPress simplemente ignorará la carpeta completa y el tema no existirá para el panel de administración.
* **`index.php` (Renderizado de contingencia):** Representa el motor de salida visual. Su existencia garantiza que WordPress siempre tenga un archivo de respaldo (fallback) para renderizar cualquier solicitud HTTP que llegue al frontend. Si un usuario solicita la portada, una entrada individual o un error 404, y el theme no cuenta con archivos específicos para esos escenarios, WordPress delegará la responsabilidad final de mostrar el contenido a `index.php`.

### El paradigma de los Block Themes

Es técnicamente necesario hacer una distinción moderna. Con la introducción del Full Site Editing (FSE) en versiones recientes, el ecosistema admite un nuevo tipo de temas basados completamente en bloques. Si bien la estructura fundamental requiere los mismos componentes lógicos, la ubicación y el formato del archivo de renderizado cambian.

Para un Block Theme puro, la estructura mínima prescinde del PHP en favor de plantillas HTML ubicadas en un subdirectorio estandarizado:

```text
wp-content/
└── themes/
    └── mi-block-theme/
        ├── style.css
        └── templates/
            └── index.html

```

En este caso, `templates/index.html` asume el rol de fallback absoluto que históricamente le pertenecía a `index.php`.

### Comprobación práctica del sistema

Si creas una carpeta dentro de `wp-content/themes/` y añades un archivo `style.css` y un archivo `index.php` completamente vacíos (con 0 bytes de peso), WordPress registrará el tema de inmediato en el panel de control. El sistema no valida que el código funcione, solo valida la existencia de la estructura mínima requerida.

Al activar este tema de dos archivos vacíos, el sitio no sufrirá un error fatal ni mostrará avisos de la base de datos, pero el resultado en el frontend será una pantalla completamente en blanco. Para transformar estos archivos de simples requisitos de validación en componentes funcionales, es necesario estructurar su contenido interno mediante declaraciones y funciones específicas que dicten cómo interactúan con el core de WordPress.

## 2.2 La cabecera del archivo style.css

Como se adelantó en la sección anterior, el archivo `style.css` cumple una doble función en WordPress: actúa como la hoja de estilos principal (opcionalmente) y, de forma obligatoria, funciona como el manifiesto o "documento de identidad" del tema. Para que el core lea esta identidad, requiere un bloque de comentarios formateado específicamente en las primeras líneas del archivo.

Este bloque de comentarios se conoce como la **Cabecera del Tema (Theme Header)**. WordPress utiliza la clase interna `WP_Theme` para analizar este archivo mediante expresiones regulares, extrayendo los metadatos línea por línea e interpretándolos para popular la interfaz del panel de administración (Apariencia > Temas).

### Estructura estándar de la cabecera

El formato es estricto: debe ser un comentario CSS válido `/* ... */` ubicado en la parte más alta del archivo, sin ningún espacio, salto de línea o regla CSS que lo preceda. Las claves deben estar escritas en inglés y separar su valor con dos puntos (`:`).

A continuación se presenta un bloque de cabecera completo con todas las etiquetas soportadas actualmente por los estándares de WordPress:

```css
/*
Theme Name:       Mi Theme Personalizado
Theme URI:        https://midominio.com/mi-theme
Author:           Nombre del Desarrollador
Author URI:       https://midominio.com
Description:      Un tema ligero y optimizado diseñado para el libro de desarrollo.
Version:          1.0.0
Requires at least: 6.0
Tested up to:     6.4
Requires PHP:     8.0
License:          GNU General Public License v2 or later
License URI:      http://www.gnu.org/licenses/gpl-2.0.html
Text Domain:      mi-theme-personalizado
Tags:             custom-background, custom-logo, two-columns, blog
*/

/* A partir de aquí comienzan las reglas CSS normales... */
body {
    margin: 0;
}

```

### Análisis de las etiquetas principales

Aunque la única etiqueta estrictamente obligatoria para que el tema se registre en el panel de control es **Theme Name**, omitir el resto es una mala práctica. Cada línea tiene un propósito técnico o informativo específico:

* **Theme Name:** El nombre público del tema. Debe ser único dentro de tu instalación.
* **Version:** Crítico para la gestión de cachés y actualizaciones. Al encolar `style.css` más adelante, esta versión puede usarse para invalidar la caché del navegador de los usuarios (cache busting) cuando despliegues cambios.
* **Text Domain:** Es el identificador único utilizado para la internacionalización (traducciones). Debe coincidir exactamente con el *slug* del directorio del tema. WordPress lo utiliza para cargar los archivos de idioma correctos antes de que el tema esté completamente inicializado.
* **Requires at least / Requires PHP:** Establecen dependencias de entorno. Si un usuario intenta activar el tema en una versión de WordPress o PHP inferior a las declaradas, el sistema bloqueará la activación y lanzará un aviso de seguridad. Esto previene errores fatales (White Screen of Death) por el uso de funciones modernas de PHP o APIs recientes del core.
* **Tags:** Una lista de palabras clave separadas por comas. Aunque su propósito principal es el filtrado en el repositorio oficial de WordPress.org, son leídas por la interfaz del panel de administración para mostrar características.

### La etiqueta `Template` y la herencia

Existe una etiqueta adicional que transforma el comportamiento completo del directorio: `Template`.

Si incluyes la línea `Template: nombre-directorio-padre` dentro de la cabecera, WordPress dejará de tratar esa carpeta como un tema independiente y la considerará un **Theme Hijo (Child Theme)**. Esta etiqueta altera drásticamente la jerarquía de carga, indicando a WordPress que debe buscar los archivos faltantes en el directorio especificado.

### Consideraciones técnicas

WordPress lee los primeros 8 KB del archivo `style.css` para encontrar esta cabecera. Por lo tanto, no debes minificar este bloque de comentarios durante tus procesos de *build* (por ejemplo, con Webpack o Vite), ya que eliminar los comentarios CSS destruirá el registro del tema en el ecosistema, dejándolo inutilizable en el backend aunque los archivos sigan en el servidor.

## 2.3 Roles de index.php y functions.php

Mientras que el archivo `style.css` proporciona la identidad de tu tema, `index.php` y `functions.php` representan su cuerpo y su cerebro, respectivamente. Para un desarrollador PHP, la forma más sencilla de entender estos dos archivos es a través del principio de separación de responsabilidades: uno gestiona la salida visual y el otro la lógica preparatoria.

Aunque WordPress no implementa un patrón MVC (Modelo-Vista-Controlador) estricto, la interacción entre estos dos archivos se asemeja a una división entre el "Controlador/Configurador" y la "Vista principal".

### index.php: El motor de presentación (La Vista)

Como vimos en la sección de archivos mínimos, `index.php` es el único archivo PHP estrictamente obligatorio en un tema clásico. Su rol fundamental es ser **la red de seguridad absoluta** (el *fallback* final) del sistema de enrutamiento visual de WordPress, conocido como Template Hierarchy.

Si WordPress no encuentra una plantilla más específica para la URL solicitada (como `single.php` para una entrada, o `404.php` para un error), terminará ejecutando `index.php`.

En un escenario de desarrollo real, las responsabilidades de este archivo son:

1. **Ensamblar la estructura HTML:** Llamar a partes modulares de la interfaz como la cabecera y el pie de página.
2. **Ejecutar The Loop:** Iterar sobre los datos obtenidos de la base de datos por la consulta principal (Main Query) e inyectarlos en el marcado HTML.

Una estructura anatómica clásica de un `index.php` se ve así:

```php
<?php
// 1. Cargar la cabecera (header.php)
get_header(); 

// 2. Comprobar si hay contenido y ejecutar The Loop
if ( have_posts() ) :
    while ( have_posts() ) : the_post();
        // Renderizar el título y el contenido
        echo '<h2>' . get_the_title() . '</h2>';
        the_content();
    endwhile;
else :
    // Fallback si no hay resultados
    echo '<p>No se encontró contenido.</p>';
endif;

// 3. Cargar el pie de página (footer.php)
get_footer(); 
?>

```

### functions.php: El controlador lógico (El "Plugin" del Tema)

A diferencia de `index.php`, el archivo `functions.php` **no es obligatorio** para que un tema sea válido, pero en la práctica, es imposible construir un tema profesional sin él.

Su rol es actuar como un archivo de configuración e inicialización. Todo el código PHP escrito en `functions.php` se ejecuta automáticamente durante el ciclo de carga de WordPress, **mucho antes** de que se genere cualquier salida HTML o de que se resuelva qué plantilla (como `index.php`) se va a utilizar.

Las responsabilidades principales de `functions.php` incluyen:

1. **Declarar soportes del tema (`add_theme_support`):** Decirle al core qué características de la interfaz están permitidas (imágenes destacadas, menús, etiquetas HTML5).
2. **Encolar *assets*:** Registrar y cargar hojas de estilo CSS y scripts JavaScript de manera segura, evitando conflictos.
3. **Registrar componentes estructurales:** Declarar zonas de menús de navegación y áreas de widgets (sidebars).
4. **Modificar el comportamiento del Core:** Utilizar el sistema de Hooks (Actions y Filters) para interceptar y alterar cómo funciona WordPress antes de que el usuario vea la página.

Un ejemplo básico de su sintaxis:

```php
<?php
// Evitar acceso directo
if ( ! defined( 'ABSPATH' ) ) exit;

// Inicializar configuraciones del tema
function mi_theme_setup() {
    // Habilitar imágenes destacadas
    add_theme_support( 'post-thumbnails' );
    
    // Registrar una ubicación para el menú
    register_nav_menus( array(
        'menu-principal' => 'Menú Principal de Navegación'
    ) );
}
// Conectar la función al hook de inicialización
add_action( 'after_setup_theme', 'mi_theme_setup' );

```

### Flujo de ejecución interactivo

Para comprender cómo interactúan, es vital visualizar el ciclo de carga. El archivo `functions.php` prepara el terreno para que `index.php` haga su trabajo correctamente.

```text
Flujo de ejecución de una petición HTTP en WordPress:

[ Usuario solicita https://midominio.com/ ]
        │
        ▼
[ Core de WP inicia (wp-load.php / wp-settings.php) ]
        │
        ├──▶ 1. Carga el core, funciones nativas y conecta a la Base de Datos.
        │
        ├──▶ 2. Ejecuta plugins activos.
        │
        ├──▶ 3. EJECUTA: functions.php de tu Theme.
        │       (Se declaran menús, soportes, y se encolan estilos).
        │
        ├──▶ 4. Construye la Main Query (Extrae los posts de la BD).
        │
        ▼
[ Resolución de Template Hierarchy ]
        │
        ├──▶ WP busca front-page.php, home.php, etc.
        │
        └──▶ 5. Al no encontrar específicos, CARGA: index.php.
                (Se imprime el HTML usando los datos de la Query y 
                 los estilos/menús registrados en functions.php).
        │
        ▼
[ Respuesta al Navegador del Usuario ]

```

**Una advertencia arquitectónica crucial:** Dado que `functions.php` se comporta como un plugin incrustado en el tema, existe la tentación de programar en él funcionalidades ajenas al diseño (como Custom Post Types o pasarelas de pago a medida). Esta es una mala práctica conocida como *Theme Lock-in*. La regla de oro es: si la funcionalidad debe sobrevivir si el usuario cambia de tema visual mañana, ese código pertenece a un plugin real, no a tu `functions.php`.

## 2.4 Themes padre vs. themes hijo

Uno de los mayores errores que cometen los desarrolladores principiantes en WordPress es modificar directamente los archivos fuente de un tema de terceros para adaptarlo a las necesidades de un cliente. Si el creador original lanza una actualización del tema para corregir un fallo de seguridad, al actualizarlo, el núcleo de WordPress sobrescribirá la carpeta completa, eliminando todas las modificaciones personalizadas al instante.

Para solucionar este problema de raíz, WordPress implementa la arquitectura de **Themes Hijo (Child Themes)**.

Un theme hijo es un tema que hereda toda la funcionalidad, características y diseño de otro tema, denominado **Theme Padre (Parent Theme)**. Esta estructura permite a los desarrolladores sobrescribir plantillas de forma selectiva, inyectar CSS personalizado y añadir lógica en PHP con la absoluta garantía de que sus cambios sobrevivirán a cualquier actualización del tema padre.

### Estructura mínima de un Theme Hijo

A nivel de sistema de archivos, un tema hijo se aloja en su propio directorio dentro de `wp-content/themes/`, completamente aislado del padre. Para que WordPress lo reconozca, requiere los dos clásicos archivos iniciales, pero con un propósito ligeramente alterado:

```text
wp-content/
└── themes/
    ├── twentytwentytwo/          <-- Theme Padre (No se toca)
    │   ├── index.php
    │   ├── style.css
    │   └── functions.php
    │
    └── twentytwentytwo-child/    <-- Theme Hijo (Área de trabajo)
        ├── style.css             <-- Declara la herencia
        └── functions.php         <-- Encola los estilos del padre

```

### La declaración de herencia en style.css

Como vimos en la sección de cabeceras, la magia de la herencia ocurre en el bloque de comentarios del archivo `style.css` del tema hijo. Requiere una etiqueta específica obligatoria: `Template`.

El valor de esta etiqueta no es el nombre público del tema padre, sino el **nombre exacto de su carpeta (slug)**.

```css
/*
Theme Name:   Twenty Twenty-Two Child
Description:  Tema hijo personalizado para mi cliente.
Author:       Tu Nombre
Template:     twentytwentytwo
Version:      1.0.0
*/

/* Tus estilos CSS personalizados comienzan aquí */
.site-header {
    background-color: #333333;
}

```

Al leer la etiqueta `Template: twentytwentytwo`, WordPress comprende que este directorio no es independiente. Si falta algún archivo de plantilla para renderizar una URL, el sistema retrocederá automáticamente y lo buscará en la carpeta del tema padre.

### Sobrescribir plantillas (Template Override)

El principio de sobrescritura es directo: si un archivo con el mismo nombre exacto existe en ambos directorios, **el archivo del tema hijo siempre gana**.

Por ejemplo, si deseas modificar cómo se muestra el pie de página, solo necesitas copiar el archivo `footer.php` desde el directorio del padre y pegarlo en el directorio de tu tema hijo. A partir de ese momento, WordPress ignorará el `footer.php` original y utilizará tu versión, mientras que el resto del sitio seguirá utilizando los archivos del padre.

### El comportamiento especial de functions.php

Existe una excepción crítica a la regla de sobrescritura: el archivo `functions.php`.

A diferencia de `index.php`, `header.php` o cualquier otra vista, el archivo `functions.php` del tema hijo **no sobrescribe** al del padre. En su lugar, WordPress carga ambos archivos. Y lo que es más importante: **el archivo functions.php del hijo se carga antes que el del padre**.

Esta prioridad de ejecución es intencional. Permite que el tema hijo configure variables, declare soportes o registre hooks antes de que el tema padre se inicialice, dándole al desarrollador la oportunidad de interceptar y modificar el comportamiento predeterminado.

Debido a esta carga dual, el archivo `functions.php` del tema hijo también tiene la responsabilidad de encolar la hoja de estilos original del padre, ya que WordPress no carga automáticamente el CSS del padre cuando un tema hijo está activo:

```php
<?php
// Archivo functions.php del Theme Hijo

add_action( 'wp_enqueue_scripts', 'encolar_estilos_padre' );
function encolar_estilos_padre() {
    // Encola el style.css del directorio del padre
    wp_enqueue_style( 'parent-style', get_template_directory_uri() . '/style.css' );
    
    // El style.css del hijo se carga automáticamente en la mayoría 
    // de los temas modernos, o se puede encolar aquí con get_stylesheet_uri()
}

```

*(Nota técnica: El uso de `get_template_directory_uri()` siempre devuelve la ruta del padre, mientras que `get_stylesheet_directory_uri()` devuelve la ruta del tema activo, que en este caso es el hijo).*

## Resumen del capítulo

En este capítulo hemos desgranado la anatomía fundamental de la capa visual de WordPress. Hemos comprobado que el sistema de temas no es una caja negra, sino una estructura predecible basada en reglas estrictas de nomenclatura y jerarquía.

Hemos establecido que un tema puede existir únicamente con `style.css` (que funciona como manifiesto de identidad gracias a su cabecera obligatoria) y un archivo de fallback universal como `index.php` (o `index.html` en el paradigma FSE). Entendimos la división lógica de responsabilidades, donde las plantillas se encargan de la presentación mientras que `functions.php` actúa como el motor lógico y configurador del tema, ejecutándose tempranamente en el ciclo de carga. Finalmente, abordamos la herencia a través de los temas hijo, la metodología estándar y segura para modificar temas existentes sin comprometer las actualizaciones de seguridad y mantenimiento del código fuente original. Con estos cimientos estructurales claros, el siguiente paso es comprender cómo WordPress enruta las peticiones de los usuarios hacia archivos específicos mediante la Jerarquía de Plantillas.
