Un diseño increíble pierde valor si el sitio es lento. En este capítulo, dejaremos de depender exclusivamente de plugins externos para optimizar la velocidad directamente desde el código de nuestro theme, reduciendo la carga del servidor y acelerando el frontend.

Aprenderemos a dominar la Transient API y la Caché de Objetos para evitar saturar la base de datos con consultas repetitivas. Además, implementaremos el control avanzado de la carga diferida de imágenes (*lazy loading*), limpiaremos la inyección de código innecesario en el `wp_head` y adoptaremos buenas prácticas para que nuestro proyecto WordPress escale sin perder velocidad.

## 17.1 La Transient API en detalle

Cuando desarrollamos themes, es común encontrarnos con operaciones costosas a nivel de servidor: consultas complejas a la base de datos (WP_Query con múltiples `meta_query` o `tax_query`), llamadas a APIs de terceros o procesamiento de datos masivos. Ejecutar estos procesos en cada recarga de página degrada drásticamente el rendimiento (Time to First Byte o TTFB).

La **Transient API** ofrece una solución nativa y estandarizada para almacenar temporalmente los resultados de estas operaciones, asignándoles un tiempo de vida o caducidad (TTL - *Time to Live*).

A diferencia de la Options API, que guarda datos de forma permanente, los Transients están diseñados para expirar y recrearse de manera automática, lo que los convierte en la herramienta principal de caché a nivel de código en WordPress.

### Flujo lógico de la Transient API

El patrón de uso de un transient siempre sigue una estructura condicional estricta. Nunca debemos asumir que el dato guardado en caché existe, ya que pudo haber expirado o haber sido borrado por un sistema de purga de memoria.

```text
Flujo de ejecución de un Transient
==================================

[ Petición de Datos en el Theme ]
               |
               v
       [ get_transient() ] 
               |
      ¿Existe y es válido?
       /                \
     SÍ                  NO (Expiró o no existe)
     |                    |
     |                    v
     |      [ Ejecutar operación costosa ] 
     |      (ej. WP_Query, wp_remote_get)
     |                    |
     |                    v
     |      [ Guardar resultado en caché ]
     |      [ con set_transient()        ]
     \                    /
      \                  /
       v                v
      [ Renderizar Contenido ]

```

### Funciones Principales

La API consta de tres funciones fundamentales que actúan como envoltorios (wrappers) seguros para el almacenamiento de datos:

* **`set_transient( $transient, $value, $expiration )`**: Almacena el valor. El primer parámetro es el nombre clave (máximo 172 caracteres), el segundo es el dato a guardar (puede ser un array, objeto o string; WordPress lo serializa automáticamente), y el tercero es el tiempo en segundos hasta que expire. WordPress ofrece constantes de tiempo útiles para este último parámetro (ej. `MINUTE_IN_SECONDS`, `HOUR_IN_SECONDS`, `DAY_IN_SECONDS`).
* **`get_transient( $transient )`**: Recupera el valor guardado. Retorna el valor en su formato original. Si el transient no existe o ha expirado, retorna `false`.
* **`delete_transient( $transient )`**: Fuerza la eliminación manual del transient antes de que cumpla su ciclo de expiración.

### Implementación Práctica: Caché de una consulta compleja

Imaginemos que en nuestro *Custom Post Type* de "Proyectos" (cubierto en el Capítulo 8) necesitamos mostrar un bloque en el footer con los últimos proyectos destacados que comparten ciertas características de metadatos. En lugar de hacer que la base de datos filtre estos registros en cada impresión del footer, cachearemos el objeto `WP_Query`.

```php
function mi_theme_obtener_proyectos_destacados() {
    // 1. Definir una clave única para este transient
    $transient_key = 'mi_theme_destacados_footer';

    // 2. Intentar recuperar los datos del transient
    $proyectos_query = get_transient( $transient_key );

    // 3. Comprobar si el dato NO existe (es false)
    if ( false === $proyectos_query ) {
        
        // El transient no existe o expiró. Ejecutamos la consulta.
        $args = array(
            'post_type'      => 'proyecto',
            'posts_per_page' => 3,
            'meta_query'     => array(
                array(
                    'key'   => '_proyecto_destacado',
                    'value' => 'yes',
                )
            )
        );
        
        $proyectos_query = new WP_Query( $args );

        // 4. Guardar el resultado por 12 horas
        set_transient( $transient_key, $proyectos_query, 12 * HOUR_IN_SECONDS );
    }

    return $proyectos_query;
}

```

Al utilizar esta función en nuestra plantilla, la consulta lenta (`WP_Query`) solo se ejecutará contra la base de datos una vez cada 12 horas. Todas las visitas intermedias recibirán el objeto ya procesado de manera casi instantánea.

### Invalidación Activa de Caché (Cache Busting)

El problema de establecer un tiempo de expiración largo (como 12 horas) es que si el usuario publica un nuevo proyecto destacado o edita uno existente durante ese periodo, el sitio en el frontend no reflejará el cambio hasta que el transient expire naturalmente.

Para resolver esto, debemos combinar la Transient API con el sistema de Hooks (Action Hooks) para purgar el caché automáticamente cuando el contenido cambia.

```php
/**
 * Purga el transient de proyectos destacados cuando se guarda/actualiza un proyecto.
 */
function mi_theme_purgar_transient_proyectos( $post_id ) {
    // Evitar ejecuciones automáticas de guardado
    if ( wp_is_post_autosave( $post_id ) || wp_is_post_revision( $post_id ) ) {
        return;
    }

    // Solo actuar si el post que se está guardando es un 'proyecto'
    if ( 'proyecto' === get_post_type( $post_id ) ) {
        delete_transient( 'mi_theme_destacados_footer' );
    }
}
// Enganchamos nuestra función a la acción que se dispara al guardar un post
add_action( 'save_post', 'mi_theme_purgar_transient_proyectos' );

```

### ¿Dónde se almacenan realmente los Transients?

Comprender el almacenamiento físico de los transients es vital para evaluar su impacto real en el rendimiento. El comportamiento de la API muta dependiendo de la infraestructura del servidor:

1. **Sin caché de objetos persistente (Entorno estándar):** WordPress guardará los transients directamente en la tabla `wp_options` de la base de datos. Creará dos filas por transient: una para el valor (`_transient_nombre_clave`) y otra para el tiempo límite de expiración (`_transient_timeout_nombre_clave`).
2. **Con caché de objetos persistente (Redis / Memcached):** Si el servidor tiene activo un sistema avanzado de *Object Cache* y su respectivo drop-in en WordPress (como `object-cache.php`), la Transient API redirige las peticiones y almacena los valores **directamente en la memoria RAM** del servidor. En este escenario, la base de datos ni siquiera es tocada, logrando velocidades de lectura y escritura en microsegundos y evitando saturar la tabla `wp_options`.

## 17.2 Caché de objetos y consultas

Mientras que la Transient API que vimos en la lección anterior es ideal para almacenar fragmentos de datos o resultados complejos con un tiempo de expiración determinado, la **Caché de Objetos (Object Cache)** aborda el rendimiento desde una perspectiva mucho más fundamental: el manejo de los datos estructurados (posts, metadatos, opciones, taxonomías) en la memoria del servidor.

WordPress utiliza internamente la clase `WP_Object_Cache` para evitar solicitar el mismo dato a la base de datos varias veces durante la carga de una misma página.

### Caché no persistente (El comportamiento por defecto)

Por defecto, la caché de objetos en WordPress no es persistente. Esto significa que los datos se almacenan en la memoria RAM (como un objeto PHP) única y exclusivamente **durante el ciclo de vida de una única petición HTTP**. Una vez que la página termina de renderizarse y se envía al navegador, esta memoria se libera y se destruye.

Este mecanismo es crucial. Si tienes un bloque en el header, otro en el sidebar y otro en el footer que solicitan el nombre del sitio (`get_bloginfo('name')`), WordPress solo consulta la tabla `wp_options` la primera vez. Las siguientes llamadas leen el valor directamente de la memoria.

```text
Ciclo de vida de la Caché No Persistente
========================================

Petición HTTP entrante
      |
      v
[ header.php ] -> get_option('blogname') -> ¿En Caché? NO -> Consulta a BD -> Guarda en Caché
      |
      v
[ sidebar.php ] -> get_option('blogname') -> ¿En Caché? SÍ -> Devuelve RAM (Cero impacto en BD)
      |
      v
[ footer.php ] -> get_option('blogname') -> ¿En Caché? SÍ -> Devuelve RAM (Cero impacto en BD)
      |
      v
Fin de la petición -> ¡Se destruye toda la caché!

```

### Caché de Objetos Persistente (Redis y Memcached)

El verdadero salto de rendimiento ocurre cuando convertimos esta caché efímera en **persistente**. Esto se logra instalando un motor de almacenamiento en memoria en el servidor, como **Redis** o **Memcached**, y conectándolo a WordPress mediante un archivo *drop-in* llamado `object-cache.php` alojado en la carpeta `wp-content`.

Al habilitar la caché persistente, la clase `WP_Object_Cache` cambia su comportamiento: los datos ya no se destruyen al finalizar la carga de la página. En su lugar, se guardan en Redis o Memcached. Así, si un usuario carga el "Home" y el servidor consulta a la base de datos los 10 últimos posts, cuando un segundo usuario visite el "Home" minutos después, WordPress extraerá esos 10 posts directamente de la memoria RAM, saltándose por completo a MySQL/MariaDB.

### La API de Caché: Interactuando desde el Theme

Como desarrollador de themes, puedes (y debes) utilizar la API de caché para almacenar tus propios datos, operando de manera muy similar a los Transients. Las funciones principales son:

* `wp_cache_set( $key, $data, $group, $expire )`: Almacena un dato. El `$group` permite categorizar la caché (ej. 'mis_opciones_tema').
* `wp_cache_get( $key, $group )`: Recupera el dato.
* `wp_cache_delete( $key, $group )`: Borra el dato específico.
* `wp_cache_flush()`: Purga toda la caché (úsalo con extrema precaución).

**Ejemplo de uso en un Theme:**

```php
function mi_theme_obtener_configuracion_pesada() {
    $cache_key   = 'configuracion_avanzada_header';
    $cache_group = 'mi_theme_datos';

    // 1. Intentamos obtener el dato de la caché
    $datos = wp_cache_get( $cache_key, $cache_group );

    // 2. Si no existe en caché (es false), hacemos el procesamiento
    if ( false === $datos ) {
        // Operación simulada que requiere muchos recursos
        $datos = mi_theme_calcular_metricas_usuario();

        // 3. Guardamos el resultado en caché por 1 hora (3600 segundos)
        wp_cache_set( $cache_key, $datos, $cache_group, HOUR_IN_SECONDS );
    }

    return $datos;
}

```

*Nota clave:* Si no hay un sistema de caché persistente activo en el servidor, `wp_cache_set` funcionará, pero el dato desaparecerá al terminar la carga de la página, sin importar que hayas definido que expire en 1 hora. **Los transients son seguros porque siempre tienen la base de datos como respaldo; la object cache no.**

### Controlando la Caché en WP_Query

Al realizar consultas personalizadas en tus plantillas utilizando `WP_Query` o `get_posts()`, WordPress intenta ser proactivo e hidrata (carga en la memoria caché de objetos) tanto la información de los posts devueltos, como sus metadatos (`postmeta`) y términos asociados (`terms`).

El 95% de las veces, este comportamiento es el deseado. Sin embargo, si estás escribiendo un script en tu theme que iterará sobre cientos o miles de posts (por ejemplo, para generar un sitemap XML personalizado o exportar un CSV), esta hidratación masiva saturará la memoria RAM del servidor web provocando un *Fatal Error: Allowed memory size exhausted*.

Para evitarlo, la clase `WP_Query` proporciona parámetros específicos para desactivar la caché a nivel de consulta:

```php
$args = array(
    'post_type'              => 'producto',
    'posts_per_page'         => -1, // Obtener todos
    'fields'                 => 'ids', // Solo traer IDs ahorra memoria
    'no_found_rows'          => true,  // No calcular paginación
    
    // Desactivar las cachés para evitar saturar la RAM
    'cache_results'          => false, 
    'update_post_meta_cache' => false, 
    'update_post_term_cache' => false, 
);

$exportacion_masiva = new WP_Query( $args );

```

Al utilizar estos parámetros en consultas masivas, le indicas explícitamente a WordPress que los resultados obtenidos son para un uso efímero y no deben guardarse en la `WP_Object_Cache`, manteniendo el consumo de memoria plano y controlado durante toda la ejecución de la plantilla.

## 17.3 Carga diferida de imágenes

El peso de las imágenes suele ser el principal cuello de botella en el rendimiento de cualquier sitio web. La técnica de carga diferida, o *lazy loading*, resuelve este problema instruyendo al navegador para que descargue únicamente las imágenes (y los iframes) que están visibles en la pantalla del usuario (el *viewport*), retrasando la descarga de los elementos ocultos hasta que el usuario haga scroll hacia ellos.

Desde la versión 5.5, WordPress democratizó esta optimización añadiendo automáticamente el atributo HTML5 `loading="lazy"` a las etiquetas `<img>` e `<iframe>`. Sin embargo, como desarrollador de themes, tu responsabilidad es gestionar cuándo este comportamiento automático es beneficioso y cuándo perjudica las métricas de rendimiento (Core Web Vitals).

### El problema del LCP y la sobre-optimización

El Largest Contentful Paint (LCP) es la métrica de Google que mide el tiempo de renderizado del elemento visual más grande visible en la pantalla inicial (antes de hacer scroll). En la mayoría de los diseños, este elemento es una imagen (el logotipo, un banner Hero o la imagen destacada del post).

Si aplicamos *lazy loading* a la imagen LCP, estamos obligando al navegador a esperar a calcular el diseño de la página antes de decidir si debe descargar esa imagen, lo que retrasa drásticamente el tiempo de carga percibido.

```text
Comportamiento en el Viewport
=============================

[ Pantalla del Dispositivo ]
+-------------------------+
|      [ Logotipo ]       | -> DEBE ser Eager (Carga inmediata)
|                         |    fetchpriority="high"
|     [ Imagen Hero ]     | -> DEBE ser Eager (Carga inmediata)
|                         |    (Elemento LCP)
+-------------------------+
|     Línea de Scroll     | 
+-------------------------+
|                         |
|   [ Imagen Contenido ]  | -> DEBE ser Lazy (Carga diferida)
|                         |    loading="lazy"
|                         |
|   [ Imagen Footer ]     | -> DEBE ser Lazy (Carga diferida)
|                         |
+-------------------------+

```

Para mitigar esto, WordPress (desde la versión 5.9) es lo suficientemente inteligente como para **omitir el atributo `loading="lazy"` en la primera imagen** de la página y, desde la versión 6.3, añade automáticamente el atributo `fetchpriority="high"` a esa imagen para priorizar su descarga en la red.

### Integración nativa en el Theme

Para que WordPress pueda aplicar estas optimizaciones de forma automática, debes evitar escribir etiquetas `<img>` estáticas con URLs hardcodeadas en tus plantillas. En su lugar, debes utilizar las funciones nativas del core, las cuales procesan la imagen a través de los filtros internos:

**Forma incorrecta (bloquea la API de optimización):**

```php
<img src="<?php echo get_the_post_thumbnail_url(); ?>" alt="Destacada">

```

**Forma correcta (aprovecha el ecosistema):**

```php
<?php the_post_thumbnail( 'large' ); ?>

<?php echo wp_get_attachment_image( $id_imagen, 'full' ); ?>

```

### Controlando el comportamiento por código

En ocasiones, el diseño de tu theme (por ejemplo, un slider o un grid complejo superior) engañará al algoritmo de WordPress, haciendo que aplique carga diferida a imágenes que deberían cargar inmediatamente, o viceversa. Para estos casos, cuentas con herramientas de control directo.

#### 1. Sobreescribir atributos en una imagen específica

Si utilizas `wp_get_attachment_image` o `the_post_thumbnail`, puedes pasar un array de atributos como parámetro para forzar el comportamiento exacto que deseas. Esto es vital al desarrollar cabeceras de página (*headers*).

```php
// Forzar la carga inmediata y alta prioridad de red para una imagen Hero
$atributos_hero = array(
    'loading'       => 'eager', // 'eager' fuerza al navegador a cargarla inmediatamente
    'fetchpriority' => 'high',
);

the_post_thumbnail( 'full', $atributos_hero );

```

#### 2. Modificar el conteo de omisión mediante filtros

Si tu theme muestra tres imágenes en la parte superior (por ejemplo, tres tarjetas destacadas alineadas horizontalmente), querrás que WordPress omita el *lazy loading* en las tres, no solo en la primera. Puedes modificar este límite interceptando el filtro `wp_omit_loading_attr_threshold`:

```php
/**
 * Aumenta a 3 el número de imágenes iniciales que no tendrán carga diferida.
 */
function mi_theme_aumentar_umbral_eager_loading( $omit_threshold ) {
    if ( is_front_page() ) {
        return 3; // Omitir lazy loading en las primeras 3 imágenes del Home
    }
    return $omit_threshold; // Mantener el comportamiento por defecto (1) en el resto
}
add_filter( 'wp_omit_loading_attr_threshold', 'mi_theme_aumentar_umbral_eager_loading' );

```

#### 3. Desactivar la carga diferida nativa globalmente

Si estás desarrollando un theme sumamente especializado y prefieres utilizar una librería JavaScript de terceros de alto rendimiento para controlar la visibilidad de los elementos (como Intersection Observer API manual), puedes desactivar completamente el *lazy loading* nativo del core para evitar conflictos:

```php
// Desactiva el atributo loading="lazy" en todo el sitio
add_filter( 'wp_lazy_loading_enabled', '__return_false' );

```

Dominar cuándo aplicar y cuándo remover la carga diferida es la diferencia entre un theme que parece rápido en los tests sintéticos y un theme que realmente se siente instantáneo para el usuario final.

## 17.4 Limpieza del wp_head

La función `wp_head()` es uno de los *Action Hooks* más importantes de WordPress. Colocada justo antes del cierre de la etiqueta `</head>` en el archivo `header.php`, es la puerta de entrada que utilizan el core, los plugins y el propio theme para inyectar hojas de estilo, scripts y meta etiquetas.

Sin embargo, debido al compromiso de WordPress con la retrocompatibilidad, el core inyecta por defecto una gran cantidad de código heredado (*legacy*) diseñado para integraciones antiguas, clientes de escritorio obsoletos y compatibilidad con navegadores antiguos. Todo esto genera "bloat" (código basura) que aumenta el peso del documento HTML, ralentizando el análisis del DOM y retrasando el renderizado de la página.

### Anatomía del desorden en el

Si inspeccionas el código fuente de una instalación limpia de WordPress, encontrarás múltiples líneas inyectadas automáticamente que rara vez aportan valor a un proyecto moderno:

```text
Código inyectado por defecto en wp_head()
=========================================

[ Meta Generador ]      -> <meta name="generator" content="WordPress 6.x">
[ Manifests Antiguos ]  -> <link rel="wlwmanifest" type="application/wlwmanifest+xml" href="...">
                        -> <link rel="EditURI" type="application/rsd+xml" title="RSD" href="...">
[ Emojis Legacy ]       -> <script type="text/javascript"> window._wpemojiSettings = ... </script>
                        -> <style type="text/css"> img.wp-smiley, img.emoji { ... } </style>
[ API REST ]            -> <link rel="https://api.w.org/" href="...">
[ Shortlinks ]          -> <link rel='shortlink' href='.../?p=123' />
[ oEmbeds ]             -> <link rel="alternate" type="application/json+oembed" href="...">

```

### Por qué debemos eliminar estos elementos

1. **Emojis de WordPress (wp-emoji):** Introducidos en WordPress 4.2 para dar soporte a emojis en navegadores que no los soportaban de forma nativa. Hoy en día, iOS, Android, Windows y macOS tienen soporte nativo perfecto. Eliminar esta función ahorra una inyección considerable de JavaScript en línea y CSS en cada carga de página.
2. **Etiqueta Generator:** Muestra públicamente la versión exacta de WordPress que estás ejecutando. Más allá del peso innecesario, exponer esta información se considera una mala práctica de seguridad (Security by obscurity), ya que facilita a los bots el escaneo de vulnerabilidades conocidas para esa versión específica.
3. **WLW Manifest:** Un enlace para facilitar la publicación desde Windows Live Writer, un software descontinuado en 2017.
4. **RSD (Really Simple Discovery):** Utilizado por clientes XML-RPC, los cuales están prácticamente en desuso a favor de la API REST moderna y representan un riesgo frecuente de ataques de fuerza bruta.

### La solución: Interceptar y Remover

Dado que estos elementos se inyectan a través del sistema de hooks internos de WordPress, la forma correcta de eliminarlos no es modificando el core (lo cual nunca debe hacerse), sino utilizando la función `remove_action()`.

Para mantener el archivo `functions.php` organizado, la mejor práctica es agrupar todas las limpiezas en una sola función enganchada al inicio de la carga del entorno (`init` o `after_setup_theme`).

```php
/**
 * Limpia inyecciones innecesarias del core en wp_head.
 */
function mi_theme_limpiar_wp_head() {
    
    // 1. Eliminar la etiqueta del generador de versión de WordPress
    remove_action( 'wp_head', 'wp_generator' );

    // 2. Eliminar manifiestos heredados de clientes externos
    remove_action( 'wp_head', 'wlwmanifest_link' );
    remove_action( 'wp_head', 'rsd_link' );

    // 3. Eliminar el enlace corto rel="shortlink"
    remove_action( 'wp_head', 'wp_shortlink_wp_head', 10, 0 );

    // 4. Desactivar la inyección global de scripts y estilos para Emojis legacy
    remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
    remove_action( 'wp_print_styles', 'print_emoji_styles' );
    remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );
    remove_action( 'admin_print_styles', 'print_emoji_styles' );
    
    // Limpiar emojis también de los feeds y correos
    remove_filter( 'the_content_feed', 'wp_staticize_emoji' );
    remove_filter( 'comment_text_rss', 'wp_staticize_emoji' );
    remove_filter( 'wp_mail', 'wp_staticize_emoji_for_email' );

    // 5. Eliminar el enlace de descubrimiento de la API REST (opcional)
    // Solo si tu theme no necesita consumirla en el frontend vía descubrimiento automático
    remove_action( 'wp_head', 'rest_output_link_wp_head', 10 );

    // 6. Eliminar el enlace oEmbed (opcional)
    // Si tu sitio no va a ser incrustado por otros sitios de WordPress
    remove_action( 'wp_head', 'wp_oembed_add_discovery_links', 10 );
}
// Ejecutamos la función de limpieza durante la inicialización
add_action( 'init', 'mi_theme_limpiar_wp_head' );

```

### Consideraciones sobre Gutenberg (Block Editor)

Si tu tema es un *Block Theme* moderno (Capítulo 13) o utiliza bloques de Gutenberg en un tema clásico, WordPress también inyectará una gran hoja de estilos llamada `wp-block-library` y variables CSS globales para soportar los colores y fuentes del editor.

Es tentador eliminar estos archivos para mejorar la puntuación de rendimiento, pero **no debes hacerlo a menos que estés absolutamente seguro** de que estás recreando todos esos estilos base en tu propio CSS.

Eliminar indiscriminadamente funciones necesarias de `wp_head` romperá el diseño de los bloques nativos (como galerías, columnas o separadores) en el frontend, resultando en una peor experiencia para el usuario final solo por ganar unos pocos milisegundos en herramientas de auditoría. La limpieza debe centrarse estrictamente en el código heredado no funcional.

## 17.5 Optimización de la base de datos

Aunque la gestión y mantenimiento de la base de datos suele delegarse a plugins especializados o administradores de sistemas, las decisiones que tomas al desarrollar un theme tienen un impacto directo y profundo en el tamaño y la velocidad de respuesta de MySQL/MariaDB.

Un theme mal programado puede inflar la base de datos en cuestión de semanas, provocando tiempos de consulta lentos que ninguna capa de caché de objetos podrá mitigar por completo.

### El problema de wp_options y el "Autoload"

La tabla `wp_options` es el talón de Aquiles del rendimiento en WordPress. Por diseño, cada vez que WordPress se inicializa, ejecuta una consulta masiva que carga en memoria RAM todas las filas de esta tabla que tengan la columna `autoload` establecida en `yes`.

```sql
SELECT option_name, option_value FROM wp_options WHERE autoload = 'yes'

```

Como desarrollador de themes, si utilizas la Options API (`add_option()` o `update_option()`) para guardar configuraciones del panel de control del theme (Customizer) o datos temporales, debes ser extremadamente cuidadoso con el parámetro autoload.

Por defecto, la función `add_option()` establece `autoload` en `yes`. Si guardas un bloque de texto gigante, un array complejo o datos codificados en base64 en una opción, estás obligando al servidor a cargar esos datos pesados en la RAM en *cada* visita a *cada* página del sitio, incluso si ese dato solo se usa en una vista específica (como la página de contacto).

**Mejor práctica:** Desactiva el autoload para opciones pesadas que no se necesitan globalmente.

```php
// Guardar una configuración pesada que solo se lee en una plantilla específica
$datos_pesados = obtener_datos_gigantes();

// Parámetros: nombre, valor antiguo (deprecated), autoload (yes/no)
add_option( 'mi_theme_datos_contacto', $datos_pesados, '', 'no' );

```

Al establecerlo en `no`, WordPress solo consultará la base de datos cuando llames explícitamente a `get_option( 'mi_theme_datos_contacto' )` en la plantilla de contacto.

### Limpieza de Transients huérfanos

Como vimos en la sección 17.1, la Transient API guarda datos temporales en `wp_options` (si no hay caché de objetos persistente). Aunque los transients tienen fecha de caducidad, WordPress no posee un "recolector de basura" en segundo plano que elimine automáticamente las filas expiradas.

Un transient caducado solo se borra físicamente de la base de datos si alguien intenta consultarlo (mediante `get_transient()`). Si tu theme crea transients dinámicos (por ejemplo, `transient_busqueda_usuario_1`, `transient_busqueda_usuario_2`) y esos usuarios no vuelven a realizar la misma búsqueda, tu tabla `wp_options` se llenará de miles de filas "basura" que ralentizarán todas las consultas a la tabla.

**La solución:** Evita crear nombres de transients dinámicos y variables a menos que sea estrictamente necesario. Si debes hacerlo, asegúrate de utilizar un sistema de caché de objetos en memoria (Redis/Memcached), los cuales sí manejan la recolección de basura de forma nativa a nivel de servidor, manteniendo la base de datos limpia.

### Alternativas a wp_postmeta para grandes volúmenes de datos

La tabla `wp_postmeta` almacena la información estructurada en un formato clave-valor (Entity-Attribute-Value o EAV). Si bien es increíblemente flexible, es ineficiente para búsquedas complejas.

Si tu theme registra un Custom Post Type de "Inmuebles" y decides guardar 50 características (precio, metros cuadrados, habitaciones, latitud, longitud, etc.) como metadatos individuales para cada inmueble, crearás 50 filas nuevas en `wp_postmeta` por cada propiedad publicada. Al llegar a 10,000 inmuebles, tu tabla tendrá medio millón de filas. Realizar una consulta (`meta_query`) para filtrar inmuebles por precio y metros cuadrados requerirá múltiples sentencias `JOIN` complejas que colapsarán el servidor.

**Estrategias de mitigación:**

1. **Agrupación de metadatos:** Si varios campos de datos siempre se leen juntos y nunca se utilizan para filtrar (por ejemplo, perfiles sociales de un autor o detalles secundarios), guárdalos como un único array serializado en una sola fila de `postmeta`, en lugar de crear 10 filas separadas.
2. **Tablas personalizadas (Custom Tables):** Si tu theme es en realidad una aplicación web compleja (como un directorio o un CRM) donde necesitas filtrar masivamente por campos numéricos, considera abandonar `wp_postmeta` para esos datos y utilizar el objeto global `$wpdb` para crear y consultar una tabla SQL plana y nativa (ej. `wp_inmuebles_datos`). Las consultas sobre tablas planas con los índices correctos son órdenes de magnitud más rápidas.

### Gestión de Revisiones (A nivel de configuración)

Aunque esto recae en la configuración del archivo `wp-config.php` y no estrictamente dentro de los archivos del theme, es un consejo vital que todo desarrollador debe transmitir. WordPress guarda una revisión completa de un post cada vez que el usuario hace clic en "Guardar como borrador" y ejecuta autoguardados constantes.

En sitios con mucho contenido, la tabla `wp_posts` puede estar compuesta en un 80% por revisiones antiguas invisibles.

Si tu theme incluye un archivo de documentación o un instalador automatizado, recomienda encarecidamente limitar las revisiones:

```php
// En wp-config.php (Fuera del entorno del Theme)
define( 'WP_POST_REVISIONS', 5 ); // Limitar a las últimas 5 revisiones por entrada
define( 'AUTOSAVE_INTERVAL', 120 ); // Aumentar el intervalo de autoguardado a 2 minutos

```

## Resumen del capítulo

En este capítulo hemos abordado el rendimiento y la velocidad como características fundamentales del desarrollo de un theme, dejando de depender exclusivamente de plugins de terceros para optimizar nuestro código:

* **Transient API:** Aprendimos a encapsular consultas pesadas y llamadas a APIs externas en fragmentos de memoria temporal con un ciclo de vida definido, reduciendo la carga del servidor mediante la invalidación activa de caché.
* **Caché de Objetos:** Comprendimos cómo WordPress maneja los datos en la memoria RAM y cómo podemos utilizar las funciones nativas `wp_cache_*` para integrarnos con motores de almacenamiento persistente como Redis, además de aprender a liberar memoria en iteraciones masivas de `WP_Query`.
* **Carga diferida:** Dominamos el uso inteligente del atributo `loading="lazy"`, asegurándonos de aprovechar el ecosistema interno de WordPress para optimizar imágenes ocultas, pero omitiéndolo y aplicando alta prioridad de red al elemento de contenido más grande (LCP) para maximizar la velocidad percibida.
* **Limpieza de wp_head:** Utilizamos la desvinculación de hooks (`remove_action`) para eliminar de forma quirúrgica código heredado y etiquetas innecesarias inyectadas por el core, aligerando el peso inicial del documento HTML.
* **Optimización de base de datos:** Analizamos el impacto de nuestro código en la base de datos, aprendiendo a controlar la carga automática de opciones (`autoload`) y diseñando arquitecturas de datos más limpias para evitar la saturación de las tablas `wp_options` y `wp_postmeta`.
