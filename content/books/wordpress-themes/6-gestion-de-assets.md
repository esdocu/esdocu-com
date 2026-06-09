Un tema de WordPress moderno requiere interactividad y diseño mediante JavaScript y CSS. Sin embargo, insertar estos recursos directamente en el HTML provoca lentitud y conflictos con otros plugins. En este capítulo, dominaremos el **Enqueue System** de WordPress. Aprenderás la metodología correcta para registrar, encolar y versionar dinámicamente tus archivos estáticos. Además, descubriremos cómo resolver dependencias complejas, transferir datos de forma segura desde PHP hacia el frontend y aplicar lógica condicional para cargar scripts únicamente cuando la vista lo requiera, maximizando así el rendimiento global de tu proyecto web.

## 6.1 La función wp_enqueue_script

Uno de los errores más comunes al iniciarse en el desarrollo de themes para WordPress es insertar etiquetas `<script>` directamente en los archivos `header.php` o `footer.php`. Aunque funcional a corto plazo, esta práctica rompe la modularidad del ecosistema, causando conflictos de dependencias y cargas duplicadas de librerías.

WordPress proporciona un sistema robusto de gestión de dependencias conocido como **Enqueue System**. Su pilar fundamental para el manejo de JavaScript es la función `wp_enqueue_script()`. Esta herramienta no solo le indica a WordPress *qué* archivo cargar, sino *cuándo* y *cómo* hacerlo, asegurando que los scripts se impriman en el lugar correcto, sin colisionar con los recursos inyectados por el core o los plugins.

### Anatomía de wp_enqueue_script

La función acepta cinco parámetros. Dominar su uso es esencial para un manejo eficiente de los assets de tu tema:

```php
wp_enqueue_script( string $handle, string $src = '', array $deps = array(), string|bool|null $ver = false, array|bool $args = false )

```

| Parámetro | Tipo | Descripción | Obligatorio |
| --- | --- | --- | --- |
| **$handle** | `string` | Un identificador único para el script (ej. `'mi-tema-app'`). Si el script ya fue registrado previamente mediante `wp_register_script()`, basta con pasar este parámetro. | Sí |
| **$src** | `string` | La URL absoluta al archivo `.js`. Utiliza funciones nativas como `get_template_directory_uri()` para evitar rutas absolutas estáticas que se romperían al cambiar de dominio. | No (si ya está registrado) |
| **$deps** | `array` | Un arreglo con los `$handle` de otros scripts de los que este depende (ej. `array('jquery')`). WordPress garantiza que estas dependencias se carguen antes que tu script. | No |
| **$ver** | `string` \| `bool` | Versión del script. Útil para invalidar la caché del navegador. Si se define como `false`, WordPress añade automáticamente la versión actual del core de WP como cadena de consulta. | No |
| **$args** | `array` \| `bool` | Define la estrategia de carga. A partir de WP 6.3, acepta un array para especificar la ubicación (`'in_footer' => true`) y la estrategia de carga (`'strategy' => 'defer'` o `'async'`). | No |

### Implementación correcta mediante Hooks

Como establecimos al estudiar la API de Plugins (Capítulo 5), no podemos invocar `wp_enqueue_script()` arbitrariamente en cualquier archivo. Debemos encapsular nuestras llamadas dentro de una función personalizada y engancharla exclusivamente a la acción `wp_enqueue_scripts`.

```php
/**
 * Encola los scripts del theme de forma segura.
 */
function mi_tema_scripts() {
    // Script principal del theme, dependiente de jQuery, cargado en el footer con 'defer'
    wp_enqueue_script(
        'mi-tema-app',
        get_template_directory_uri() . '/assets/js/app.js',
        array( 'jquery' ),
        '1.0.0',
        array(
            'in_footer' => true,
            'strategy'  => 'defer',
        )
    );
}
add_action( 'wp_enqueue_scripts', 'mi_tema_scripts' );

```

> **Nota importante:** La acción (Action Hook) a la que nos enganchamos se llama `wp_enqueue_scripts` (en plural), mientras que la función para encolar un script individual es `wp_enqueue_script` (en singular). Esta es una de las confusiones sintácticas más frecuentes.

### Flujo de Resolución de Dependencias

A continuación, se ilustra internamente cómo WordPress procesa la cola de scripts y resuelve el árbol de dependencias antes de generar el HTML final:

```text
[ Petición del Visitante ]
           │
           ▼
[ Hook: wp_enqueue_scripts ] ──▶ Dispara 'mi_tema_scripts()'
           │                     Registra 'mi-tema-app' (Dependencia: 'jquery')
           ▼
[ WP Dependency API ] ─────────▶ Evalúa la cola global de scripts
           │
           ├─▶ 1. ¿Está 'jquery' registrado en el core? (Sí)
           ├─▶ 2. ¿Está encolado? (No, se encola automáticamente como dependencia)
           └─▶ 3. Calcula el orden de inyección: 'jquery' -> 'mi-tema-app'
           ▼
[ Hook: wp_head ] ─────────────▶ Imprime etiquetas <script> sin la opción 'in_footer'
           │
           ▼
[ Renderizado del Body ] ──────▶ Genera el HTML de las plantillas (Template Hierarchy)
           │
           ▼
[ Hook: wp_footer ] ───────────▶ Imprime <script src=".../jquery.js">
           │                   ▶ Imprime <script src=".../app.js" defer>
           ▼
[ Respuesta HTTP Enviada ]

```

La principal ventaja de cederle este flujo arquitectónico a WordPress es la prevención de colisiones. Si tu tema requiere `jquery` y dos plugins activos también lo solicitan, la Dependency API se asegurará de imprimir la etiqueta `<script>` correspondiente a la librería una única vez, manteniendo el rendimiento y la estabilidad del frontend intactos.

## 6.2 Manejo de dependencias JS y CSS

A medida que un theme crece en complejidad, es común incorporar múltiples archivos CSS y JavaScript. Cargar estos recursos en el orden incorrecto puede provocar errores de ejecución, como invocar una función de una librería externa antes de que dicha librería haya sido parseada por el navegador.

WordPress resuelve este problema de concurrencia mediante el parámetro de dependencias (`$deps`), disponible tanto en `wp_enqueue_script()` como en su contraparte para hojas de estilo, `wp_enqueue_style()`.

### La función wp_enqueue_style

Para entender el manejo de dependencias de forma global, primero debemos establecer cómo se encolan las hojas de estilo. La firma de la función es casi idéntica a la de scripts, con la diferencia del parámetro final dedicado a los *media types*:

```php
wp_enqueue_style( string $handle, string $src = '', array $deps = array(), string|bool|null $ver = false, string $media = 'all' )

```

Al igual que con JavaScript, el tercer parámetro, `$deps`, recibe un *array* con los *handles* (identificadores) de las hojas de estilo que deben cargarse antes.

### wp_register_*vs. wp_enqueue_*

Un concepto vital en la gestión de dependencias complejas es la separación entre **registrar** un asset y **encolarlo**.

* `wp_register_script()` / `wp_register_style()`: Notifica a WordPress sobre la existencia de un archivo, sus dependencias y su versión. **No lo imprime en el frontend**. Es ideal para declarar librerías que solo se usarán bajo ciertas condiciones (por ejemplo, un script para un slider que solo debe cargarse si el slider está presente en la página).
* `wp_enqueue_script()` / `wp_enqueue_style()`: Añade el asset a la cola de impresión. Si el asset no estaba registrado, lo registra y lo encola al mismo tiempo. Si ya estaba registrado previamente, solo utiliza su *handle* para invocarlo.

### Construyendo un árbol de dependencias

Supongamos que nuestro theme utiliza una librería externa para crear carruseles (`flickity.js`) y un script propio (`app.js`) que inicializa esos carruseles. Además, nuestro CSS personalizado necesita sobrescribir algunos estilos por defecto de Flickity.

Aquí es donde el manejo de dependencias brilla, asegurando el orden cronológico exacto de impresión en el HTML.

```php
function mi_tema_assets_avanzados() {
    // 1. Registrar librerías externas (No se imprimen aún)
    wp_register_style( 'flickity-css', get_template_directory_uri() . '/assets/css/flickity.min.css', array(), '2.3.0' );
    wp_register_script( 'flickity-js', get_template_directory_uri() . '/assets/js/flickity.pkgd.min.js', array(), '2.3.0', true );

    // 2. Encolar los archivos del theme definiendo las librerías como dependencias
    wp_enqueue_style( 
        'mi-tema-estilo-principal', 
        get_stylesheet_uri(), // Carga style.css del theme
        array( 'flickity-css' ), // Dependencia: Forzamos a que flickity.css se cargue ANTES
        '1.0.0' 
    );

    wp_enqueue_script( 
        'mi-tema-app', 
        get_template_directory_uri() . '/assets/js/app.js', 
        array( 'jquery', 'flickity-js' ), // Dependencias: jQuery (del core) y Flickity
        '1.0.0', 
        true 
    );
}
add_action( 'wp_enqueue_scripts', 'mi_tema_assets_avanzados' );

```

#### Diagrama de resolución de carga

El código anterior genera el siguiente árbol de resolución interno antes de imprimir las etiquetas `<link>` y `<script>`:

```text
[ ÁRBOL DE RESOLUCIÓN CSS ]
'mi-tema-estilo-principal' requiere 'flickity-css'
  └── Imprime 1: <link href=".../flickity.min.css">
  └── Imprime 2: <link href=".../style.css">

[ ÁRBOL DE RESOLUCIÓN JS ]
'mi-tema-app' requiere ['jquery', 'flickity-js']
  ├── 'jquery' es manejado por el Core de WP
  │    └── Imprime 1: <script src=".../jquery.js">
  ├── 'flickity-js' fue registrado previamente
  │    └── Imprime 2: <script src=".../flickity.pkgd.min.js">
  └── Finalmente, imprime el script principal
       └── Imprime 3: <script src=".../app.js">

```

### Dependencias pre-registradas en el Core

Una de las grandes ventajas de usar este sistema es acceder a las decenas de librerías que WordPress ya incluye en su instalación. Nunca debes incluir tu propia copia de estas librerías en los archivos de tu theme; en su lugar, decláralas como dependencias.

Algunas de las dependencias más útiles disponibles por defecto son:

* **`jquery`**: La clásica librería de manipulación del DOM.
* **`masonry`**: Para layouts en formato cuadrícula tipo cascada.
* **`imagesloaded`**: Detecta cuándo las imágenes han terminado de cargar.
* **`wp-api-fetch`**: Un envoltorio optimizado para realizar peticiones a la REST API de WordPress.
* **`wp-element`**: Una abstracción de React y ReactDOM, crucial si vas a interactuar con componentes del editor de bloques moderno (FSE).

Al externalizar el manejo de dependencias a WordPress, te aseguras de que independientemente de la combinación de plugins que el usuario final instale, el ecosistema se mantendrá ordenado, previniendo conflictos de sobreescritura de variables globales o errores por funciones no definidas.

## 6.3 Versionado dinámico de archivos

Cualquier desarrollador web se ha enfrentado alguna vez al frustrante escenario de aplicar un cambio en un archivo CSS o JavaScript, recargar la página, y no ver ninguna modificación reflejada. Este fenómeno ocurre por la **caché estática del navegador**.

Para optimizar la velocidad de carga, los navegadores guardan una copia local de los *assets* estáticos. Si la URL del archivo no cambia, el navegador asume que el archivo tampoco lo ha hecho y sirve la copia guardada.

WordPress soluciona esto a través del parámetro `$ver` (versión) en las funciones `wp_enqueue_style()` y `wp_enqueue_script()`. Al definir una versión, WordPress la añade como una cadena de consulta (*query string*) al final de la URL del archivo.

### El problema del versionado estático

En los capítulos anteriores vimos ejemplos con un versionado estático:

```php
wp_enqueue_style( 'mi-tema-estilo', get_stylesheet_uri(), array(), '1.0.0' );
// Salida en HTML: <link rel="stylesheet" href=".../style.css?ver=1.0.0">

```

El problema con este enfoque es que cada vez que modifiques tu CSS, tendrás que acordarte de cambiar manualmente el `'1.0.0'` por `'1.0.1'` en tu archivo `functions.php`. Si lo olvidas, tus usuarios (y tú mismo) seguirán viendo la versión antigua del diseño.

### La solución: filemtime()

Para automatizar este proceso y garantizar que el navegador siempre descargue la última versión cuando realizas un cambio, podemos usar la función nativa de PHP `filemtime()`. Esta función lee un archivo y devuelve su fecha de última modificación en formato *Unix timestamp* (los segundos transcurridos desde el 1 de enero de 1970).

Para que `filemtime()` funcione, **debes pasarle la ruta absoluta del servidor** (usando `get_template_directory()`), no la URL pública (usando `get_template_directory_uri()`).

```php
function mi_tema_assets_dinamicos() {
    // 1. Definir rutas absolutas del servidor y URLs públicas
    $css_ruta = get_template_directory() . '/assets/css/main.css';
    $css_url  = get_template_directory_uri() . '/assets/css/main.css';

    // 2. Obtener el timestamp dinámico (con un fallback de seguridad)
    $css_ver = file_exists( $css_ruta ) ? filemtime( $css_ruta ) : '1.0.0';

    // 3. Encolar con la versión dinámica
    wp_enqueue_style( 'mi-tema-principal', $css_url, array(), $css_ver );
}
add_action( 'wp_enqueue_scripts', 'mi_tema_assets_dinamicos' );

```

#### Flujo de invalidación de caché (Cache Busting)

Internamente, este flujo garantiza una sincronización perfecta entre tu editor de código y el navegador del usuario:

```text
[ Editor de código ]
1. Guardas cambios en main.css a las 14:30:00

           │
           ▼
[ Servidor PHP procesa wp_enqueue_style ]
2. filemtime('/ruta/.../main.css') detecta la modificación
3. Devuelve el timestamp: 1700058600

           │
           ▼
[ Frontend HTML ]
4. Imprime: <link href=".../main.css?ver=1700058600">

           │
           ▼
[ Navegador del Usuario ]
5. Compara URLs guardadas en caché.
6. ¿Existe "main.css?ver=1700058600"? (No, la vieja era 1700058500)
7. DESCARGA el nuevo archivo y actualiza el diseño.

```

### Estrategia recomendada: Desarrollo vs. Producción

Aunque `filemtime()` es increíblemente útil, leer la fecha de modificación de múltiples archivos en el disco del servidor en cada visita añade una latencia marginal. En entornos de alto tráfico, cada milisegundo de procesamiento PHP cuenta.

La mejor práctica en temas profesionales es crear una constante global que utilice el versionado dinámico *solo* cuando estás desarrollando, y cambie a la versión oficial del tema (definida en la cabecera de `style.css`) cuando el tema está en producción.

```php
// En functions.php, defines una constante basada en el modo de depuración
if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
    // Modo local/desarrollo: Versión dinámica basada en el tiempo actual
    define( 'MI_TEMA_VERSION', time() ); 
} else {
    // Modo producción: Versión estática leída desde la cabecera de style.css
    $tema = wp_get_theme();
    define( 'MI_TEMA_VERSION', $tema->get( 'Version' ) );
}

// ... más adelante, en tu función de encolado:
function mi_tema_scripts_optimizados() {
    wp_enqueue_script( 
        'mi-tema-app', 
        get_template_directory_uri() . '/assets/js/app.js', 
        array(), 
        MI_TEMA_VERSION, // Usamos la constante
        true 
    );
}
add_action( 'wp_enqueue_scripts', 'mi_tema_scripts_optimizados' );

```

Con este patrón, logras lo mejor de ambos mundos: nunca te quedas atascado con la caché mientras escribes código en local, pero mantienes el rendimiento del servidor impecable una vez que el tema es desplegado en vivo.

## 6.4 wp_localize_script para datos

JavaScript ejecuta su lógica estrictamente en el entorno del navegador (lado del cliente), lo que significa que no tiene acceso nativo a la base de datos de WordPress, las configuraciones del theme o el estado del servidor PHP. Cuando un script necesita conocer datos dinámicos (como la URL de la REST API, un token de seguridad o traducciones), se genera una brecha entre ambos entornos.

Tradicionalmente, algunos desarrolladores solucionaban esto abriendo etiquetas `<script>` directamente en `header.php` para imprimir variables globales con PHP. Esta práctica rompe el principio de separación de responsabilidades y ensucia el HTML. La solución nativa y segura que ofrece el core es la función `wp_localize_script()`.

Aunque fue diseñada originalmente para traducir cadenas de texto dentro de archivos JavaScript (de ahí el término *localize*), se ha convertido en el estándar oficial para transferir cualquier tipo de datos estructurados desde PHP hacia tus scripts de frontend.

### Anatomía de wp_localize_script

La función actúa directamente sobre un script que ya ha sido registrado o encolado previamente, inyectando un objeto de JavaScript inmediatamente antes de la etiqueta del archivo `.js` correspondiente.

```php
wp_localize_script( string $handle, string $object_name, array $l10n )

```

| Parámetro | Tipo | Descripción | Obligatorio |
| --- | --- | --- | --- |
| **$handle** | `string` | El identificador (*handle*) del script al que se adjuntarán los datos. El script debe estar registrado previamente con `wp_register_script()` o `wp_enqueue_script()`. | Sí |
| **$object_name** | `string` | El nombre que tendrá el objeto global en JavaScript (ej. `miTemaConfig`). **Importante:** Debe ser un nombre válido para variables en JS (no uses guiones `-`, usa *camelCase* o guiones bajos `_`). | Sí |
| **$l10n** | `array` | Un arreglo asociativo que contiene los datos que deseas transferir. Las claves se convertirán en propiedades del objeto JS y los valores se serializarán automáticamente. | Sí |

### Implementación práctica

Imaginemos un escenario común: tenemos un archivo de JavaScript encargado de realizar peticiones asíncronas (AJAX o Fetch) a la REST API de WordPress. El script necesita saber la URL base de la API, el ID del post actual y un mensaje de éxito traducido.

```php
function mi_tema_encolar_con_datos() {
    // 1. Encolar el script de forma normal
    wp_enqueue_script(
        'mi-tema-ajax',
        get_template_directory_uri() . '/assets/js/ajax-handler.js',
        array(),
        '1.0.0',
        true
    );

    // 2. Preparar los datos dinámicos en PHP
    $datos_para_js = array(
        'apiUrl'      => esc_url_raw( rest_url( 'wp/v2/' ) ),
        'postId'      => get_the_ID(),
        'nonce'       => wp_create_nonce( 'wp_rest' ),
        'msgExito'    => __( 'El contenido se ha cargado correctamente.', 'mi-tema' ),
        'usuarioLogueado' => is_user_logged_in()
    );

    // 3. Vincular los datos al handle del script
    wp_localize_script( 'mi-tema-ajax', 'miTemaVariables', $datos_para_js );
}
add_action( 'wp_enqueue_scripts', 'mi_tema_encolar_con_datos' );

```

### El flujo de transformación de datos

WordPress se encarga de interceptar el arreglo de PHP, sanitizarlo, transformarlo en formato JSON y renderizarlo en el HTML como un objeto global de la ventana (`window`). El orden cronológico del flujo es el siguiente:

```text
[ SERVIDOR PHP ]
$datos_para_js = array( 'apiUrl' => 'https://...' )
       │
       ▼
[ FUNCIÓN: wp_localize_script() ]
Combina el array con el handle 'mi-tema-ajax' bajo el objeto 'miTemaVariables'
       │
       ▼
[ PROCESAMIENTO HTML (Salida del core) ]
Genera una etiqueta <script> inline ANTES del archivo externo:
<script id="mi-tema-ajax-js-extra">
/* <![CDATA[ */
var miTemaVariables = {"apiUrl":"https:\/\/ejemplo.local\/wp-json\/wp\/v2\/","postId":42};
/* ]]> */
</script>
<script src=".../assets/js/ajax-handler.js" id="mi-tema-ajax-js"></script>
       │
       ▼
[ ENTORNO CLIENTE (Navegador / JS) ]
El archivo ajax-handler.js puede consumir los datos directamente:
console.log( miTemaVariables.apiUrl );

```

### Consumo de datos en el archivo JavaScript

Una vez que `wp_localize_script()` ha realizado la inyección, los datos están disponibles de forma global. Dentro de tu archivo `ajax-handler.js`, puedes utilizarlos de la siguiente manera:

```javascript
/**
 * Archivo: assets/js/ajax-handler.js
 */
document.addEventListener('DOMContentLoaded', () => {
    // Acceso directo al objeto inyectado por WordPress
    const endpoint = `${miTemaVariables.apiUrl}posts/${miTemaVariables.postId}`;
    
    if (miTemaVariables.usuarioLogueado) {
        console.log('ID del Post actual:', miTemaVariables.postId);
        
        fetch(endpoint, {
            method: 'GET',
            headers: { 'X-WP-Nonce': miTemaVariables.nonce }
        })
        .then(response => response.json())
        .then(data => {
            alert(miTemaVariables.msgExito);
        });
    }
});

```

### Reglas críticas de seguridad y arquitectura

1. **Ubicación temporal:** Siempre debes llamar a `wp_localize_script()` *después* de haber registrado (`wp_register_script`) o encolado (`wp_enqueue_script`) el script de referencia. Si utilizas un *handle* inexistente, WordPress ignorará los datos silenciosamente.
2. **Exclusividad de nombres:** Asegúrate de que el segundo parámetro (`$object_name`) sea único. Si otro plugin utiliza el mismo nombre de objeto, sobrescribirá tus datos provocando fallos críticos en el frontend.
3. **No abuses de los datos pesados:** Este sistema imprime los datos directamente inline en el documento HTML. Evita pasar colecciones gigantescas de posts o configuraciones masivas por esta vía, ya que inflarás innecesariamente el peso del documento HTML inicial y degradarás el rendimiento de la carga.

## 6.5 Encolado condicional según la vista

Cargar todos los *assets* de tu theme en todas las páginas es una de las peores prácticas para el rendimiento web (WPO). Si has desarrollado un script complejo para filtrar un catálogo de productos, no tiene sentido obligar al navegador del usuario a descargarlo, parsearlo y ejecutarlo cuando está leyendo una simple entrada del blog.

El sistema de encolado de WordPress brilla verdaderamente cuando se combina con las **Etiquetas Condicionales** (*Conditional Tags*). Estas funciones nativas devuelven un valor booleano (`true` o `false`) evaluando la vista actual dictada por la Jerarquía de Plantillas antes de que se envíe el HTML al navegador.

### Principales etiquetas condicionales para assets

Para segmentar la carga de archivos, las funciones más útiles son aquellas que identifican el tipo de contenido que se está renderizando:

* **`is_front_page()` / `is_home()`:** Útiles para cargar scripts exclusivos de la portada (ej. un *hero slider*).
* **`is_singular( $post_type )`:** Comprueba si se está viendo una vista de detalle (un post, una página o un Custom Post Type específico).
* **`is_page_template( $template )`:** Verifica si la página actual utiliza una plantilla de página específica.
* **`has_block( $block_name )`:** En la era del editor de bloques, permite saber si el contenido de la página incluye un bloque concreto (ej. una galería o un formulario).

### Implementación de lógica condicional

La lógica condicional debe colocarse *dentro* de la función enganchada a `wp_enqueue_scripts`, evaluando el contexto justo antes de decidir si se invoca o no `wp_enqueue_script()`.

Veamos un ejemplo arquitectónico completo que demuestra diferentes niveles de condicionalidad:

```php
function mi_tema_assets_condicionales() {
    $theme_version = defined( 'WP_DEBUG' ) && WP_DEBUG ? time() : '1.0.0';

    // 1. Asset Global: Se carga en absolutamente todas las vistas
    wp_enqueue_style( 'mi-tema-global', get_stylesheet_uri(), array(), $theme_version );

    // 2. Asset Condicional por Plantilla: Solo en la página de contacto
    if ( is_page_template( 'page-templates/contacto.php' ) ) {
        wp_enqueue_script( 
            'mi-tema-validacion', 
            get_template_directory_uri() . '/assets/js/form-validator.js', 
            array(), 
            $theme_version, 
            true 
        );
    }

    // 3. Asset Condicional del Core: Script nativo para hilos de comentarios
    // Solo se carga si estamos en un post/página singular, los comentarios están abiertos
    // y la opción de comentarios anidados está activa en los ajustes.
    if ( is_singular() && comments_open() && get_option( 'thread_comments' ) ) {
        wp_enqueue_script( 'comment-reply' );
    }

    // 4. Asset Condicional por Contenido (Gutenberg)
    // Solo carga la librería de Lightbox si el editor ha insertado un bloque de galería
    if ( has_block( 'core/gallery' ) ) {
        wp_enqueue_style( 
            'mi-tema-lightbox-css', 
            get_template_directory_uri() . '/assets/css/lightbox.css', 
            array(), 
            $theme_version 
        );
        wp_enqueue_script( 
            'mi-tema-lightbox-js', 
            get_template_directory_uri() . '/assets/js/lightbox.js', 
            array(), 
            $theme_version, 
            true 
        );
    }
}
add_action( 'wp_enqueue_scripts', 'mi_tema_assets_condicionales' );

```

### Árbol de decisión de carga

Visualmente, el flujo que ejecuta el servidor al procesar el código anterior para una URL específica (por ejemplo, `/contacto/`) sería el siguiente:

```text
[ URL Solicitada: misitio.com/contacto/ ]
                    │
                    ▼
[ Hook: wp_enqueue_scripts ]
                    │
   ├─▶ 1. Encola 'mi-tema-global' (Siempre)
   │
   ├─▶ 2. ¿Es plantilla 'contacto.php'? ──▶ [ SÍ ] ──▶ Encola 'mi-tema-validacion'
   │
   ├─▶ 3. ¿Comentarios abiertos? ─────────▶ [ NO ] ──▶ (Ignora 'comment-reply')
   │
   └─▶ 4. ¿Tiene bloque 'core/gallery'? ──▶ [ NO ] ──▶ (Ignora lightbox JS y CSS)
                    │
                    ▼
[ Generación del <head> y <body> ]
(Solo se imprimen los recursos estrictamente necesarios para esta vista)

```

Al aplicar sistemáticamente este enfoque de "carga bajo demanda", reduces drásticamente el peso inicial de las páginas, evitas conflictos entre librerías incompatibles y mejoras métricas vitales de Core Web Vitals, como el *First Contentful Paint* (FCP) y el tiempo de bloqueo del hilo principal.

## Resumen del capítulo

En este capítulo hemos consolidado las bases para una gestión profesional de recursos estáticos en WordPress, abandonando las prácticas frágiles del HTML puro en favor de una arquitectura controlada por PHP:

* **El ecosistema de encolado:** Hemos comprendido que `wp_enqueue_script` y `wp_enqueue_style` son obligatorios para garantizar la modularidad y evitar colisiones de *assets* en el `wp_head` y `wp_footer`.
* **Resolución de dependencias:** Delegamos a WordPress la responsabilidad de cargar librerías complejas en el orden correcto, aprovechando recursos nativos pre-registrados como jQuery o Masonry.
* **Control de caché:** Implementamos `filemtime()` para crear un sistema de *cache busting* dinámico, vital para reflejar cambios en tiempo real durante el desarrollo.
* **Puente PHP-JS:** Utilizamos `wp_localize_script()` como el método seguro y estándar para transferir datos dinámicos, traducciones y *nonces* de seguridad desde el servidor hacia la lógica del cliente.
* **Carga modular:** Finalizamos optimizando el rendimiento global del theme inyectando recursos únicamente donde la vista o el contenido lo requieren de forma estricta.
