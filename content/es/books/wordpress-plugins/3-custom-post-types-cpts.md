WordPress nació como plataforma de blogging, pero su verdadera potencia como CMS reside en su asombrosa flexibilidad. En este capítulo dejaremos atrás la limitación de usar exclusivamente "entradas" o "páginas". Aprenderás a diseñar arquitecturas de información a medida mediante el registro avanzado de Custom Post Types (CPTs) y taxonomías personalizadas. Exploraremos cómo configurar la interfaz de administración, asegurar una correcta internacionalización semántica y dominar la relación entre entidades para ejecutar consultas combinadas eficientes. Es el momento de estructurar tus datos de forma profesional y sin restricciones.

## 3.1 Registro avanzado de CPTs

En el núcleo de WordPress, un Custom Post Type (CPT) no es una estructura de base de datos separada; es simplemente una fila en la tabla `wp_posts` donde la columna `post_type` adquiere un valor definido por el desarrollador en lugar de los predeterminados (`post`, `page`, `attachment`, etc.). El "registro" de un CPT es, por tanto, el acto de instruir a la API de WordPress sobre cómo debe interactuar, enrutar, mostrar y gestionar este identificador específico.

La función central para esta tarea es `register_post_type( $post_type, $args )`. Sin embargo, para un desarrollo profesional, la configuración del array `$args` va mucho más allá de hacerlo visible en el panel de administración.

### El Hook adecuado: `init`

El registro de un CPT siempre debe engancharse a la acción `init`. Engancharlo antes (como en `plugins_loaded`) puede causar que la funcionalidad de reescritura de URLs falle, y engancharlo después (como en `wp_loaded`) significa que el CPT no estará disponible cuando otros plugins o el propio núcleo intenten consultarlo.

```php
/**
 * Clase manejadora del registro del CPT 'Libro'.
 */
class MiPlugin_CPT_Libro {

    const POST_TYPE = 'miplugin_libro';

    public function init() {
        add_action( 'init', [ $this, 'registrar_cpt' ] );
    }

    public function registrar_cpt() {
        // Nota: Los argumentos de interfaz (labels) se abordarán en la sección 3.2
        $labels = [
            'name'          => __( 'Libros', 'miplugin' ),
            'singular_name' => __( 'Libro', 'miplugin' ),
        ];

        $args = [
            'labels'              => $labels,
            'public'              => true,
            'publicly_queryable'  => true,
            'show_ui'             => true,
            'show_in_menu'        => true,
            'query_var'           => true,
            'rewrite'             => [ 'slug' => 'libros', 'with_front' => false ],
            'capability_type'     => 'post',
            'has_archive'         => true,
            'hierarchical'        => false,
            'menu_position'       => 20,
            'supports'            => [ 'title', 'editor', 'thumbnail', 'excerpt', 'revisions' ],
            'show_in_rest'        => true, // Habilita Gutenberg y la REST API
        ];

        register_post_type( self::POST_TYPE, $args );
    }
}

$cpt_libro = new MiPlugin_CPT_Libro();
$cpt_libro->init();

```

### Diseccionando el array `$args` (Configuración Avanzada)

Para tener un control absoluto sobre el comportamiento del CPT, es fundamental comprender la cascada de herencias que generan ciertos argumentos booleanos y cómo afectan al ecosistema de WP.

#### 1. Visibilidad y Accesibilidad

El argumento `public` es un atajo. Si lo defines como `true`, WordPress establecerá automáticamente a `true` los siguientes argumentos (a menos que los sobrescribas explícitamente):

* `exclude_from_search`: Falso (aparecerá en los resultados de búsqueda).
* `publicly_queryable`: Verdadero (se podrá acceder vía URL).
* `show_in_nav_menus`: Verdadero.
* `show_ui`: Verdadero.

En arquitecturas avanzadas, es común tener CPTs de uso interno (por ejemplo, para almacenar registros de logs o configuraciones complejas). Para un CPT "invisible" pero gestionable desde código:

```php
'public'              => false,
'show_ui'             => false,
'publicly_queryable'  => false,
'exclude_from_search' => true,

```

#### 2. Soporte del Editor Moderno (Gutenberg)

El argumento `show_in_rest` introdujo un cambio de paradigma. Originalmente concebido para exponer el CPT en la REST API (que veremos en el Capítulo 13), en las versiones actuales de WordPress **es el interruptor maestro del editor de bloques**.

Si `show_in_rest` es `false` (su valor por defecto) o se omite, el CPT utilizará el editor clásico (TinyMCE). Si se establece en `true`, WordPress cargará Gutenberg. Además, puedes modificar la ruta base de la API usando `rest_base` y `rest_controller_class` si necesitas personalizar la lógica de los endpoints.

#### 3. Motor de Reescritura (Rewrite Rules)

El array `rewrite` controla cómo la WP_Rewrite API procesa las URLs del CPT.

* `slug`: Por defecto usa el nombre del CPT, pero permite definir una URL amigable (ej. de `miplugin_libro` a `libros`).
* `with_front`: Si tu estructura de enlaces permanentes general tiene una base (como `/blog/%postname%/`), poner esto en `true` hará que tu CPT sea `/blog/libros/mi-libro/`. Ponerlo en `false` fuerza `/libros/mi-libro/`, lo cual es preferible en el 90% de los casos.
* `pages`: Soporte para paginación dentro del CPT.

*Importante:* Cambiar el `slug` requiere limpiar las reglas de reescritura. No uses `flush_rewrite_rules()` dentro del hook `init` (destruirá el rendimiento). Debes hacerlo únicamente en la rutina de activación del plugin (Capítulo 2.3).

#### 4. Array de Capacidades (`supports`)

Define qué metaboxes y características del núcleo se cargan en la pantalla de edición.

```text
+-------------------+---------------------------------------------------+
| Argumento         | Impacto en la interfaz y base de datos            |
+-------------------+---------------------------------------------------+
| title             | Añade la caja de título y la columna post_title.  |
| editor            | Carga TinyMCE o Gutenberg (según show_in_rest).   |
| author            | Metabox para asignar el post_author.              |
| thumbnail         | Soporte para post_thumbnail (Imagen destacada).   |
| excerpt           | Metabox para resumen (post_excerpt).              |
| trackbacks        | Soporte para pingbacks y trackbacks.              |
| custom-fields     | Carga la interfaz nativa de Custom Fields.        |
| comments          | Habilita el soporte de discusión (comment_status).|
| revisions         | Activa el guardado de histórico (post_parent).    |
| page-attributes   | Metabox para orden (menu_order) y jerarquía.      |
| post-formats      | Soporte para formatos (video, aside, gallery).    |
+-------------------+---------------------------------------------------+

```

Si omites el argumento `supports`, WordPress asignará `['title', 'editor']` por defecto. Si pasas `false`, el CPT no tendrá soporte para ninguna de estas características nativas, lo cual es útil si planeas construir una interfaz de edición 100% personalizada basada únicamente en metaboxes propios (Capítulo 4).

## 3.2 Etiquetas y argumentos de interfaz

Cuando se registra un Custom Post Type, la experiencia del usuario (UX) dentro del panel de administración de WordPress depende por completo de la configuración semántica de sus etiquetas y de los argumentos que definen su comportamiento visual. Un CPT con etiquetas mal configuradas mostrará textos genéricos heredados del tipo de contenido `post`, lo que restará profesionalidad al plugin y confundirá al administrador.

### Internacionalización semántica: El uso de `_x()`

Para construir el array de etiquetas (`labels`), no basta con utilizar la función de traducción estándar `__()`. En muchos idiomas, incluidos el español y otras lenguas romances, la flexión de género afecta tanto a los sustantivos como a los adjetivos y verbos asociados.

Por ejemplo, la cadena "Add New" se traduce como "Añadir nuevo" si el CPT es un "Libro", pero debe ser "Añadir nueva" si el CPT es una "Factura". Para resolver esto sin hardcodear el idioma, WordPress proporciona la función `_x()`, la cual permite añadir un contexto sintáctico para los traductores.

```php
$labels = [
    'name'                  => _x( 'Libros', 'Post type general name', 'miplugin' ),
    'singular_name'         => _x( 'Libro', 'Post type singular name', 'miplugin' ),
    'menu_name'             => _x( 'Libros', 'Admin Menu text', 'miplugin' ),
    'name_admin_bar'        => _x( 'Libro', 'Add New on Toolbar', 'miplugin' ),
    'add_new'               => _x( 'Añadir nuevo', 'Libro', 'miplugin' ),
    'add_new_item'          => __( 'Añadir nuevo libro', 'miplugin' ),
    'new_item'              => __( 'Nuevo libro', 'miplugin' ),
    'edit_item'             => __( 'Editar libro', 'miplugin' ),
    'view_item'             => __( 'Ver libro', 'miplugin' ),
    'all_items'             => __( 'Todos los libros', 'miplugin' ),
    'search_items'          => __( 'Buscar libros', 'miplugin' ),
    'parent_item_colon'     => __( 'Libros padre:', 'miplugin' ),
    'not_found'             => __( 'No se encontraron libros.', 'miplugin' ),
    'not_found_in_trash'    => __( 'No se encontraron libros en la papelera.', 'miplugin' ),
    'featured_image'        => _x( 'Portada del libro', 'Overrides the “Featured Image” phrase', 'miplugin' ),
    'set_featured_image'    => _x( 'Establecer portada', 'Overrides the “Set featured image” phrase', 'miplugin' ),
    'remove_featured_image' => _x( 'Eliminar portada', 'Overrides the “Remove featured image” phrase', 'miplugin' ),
    'use_featured_image'    => _x( 'Usar como portada', 'Overrides the “Use as featured image” phrase', 'miplugin' ),
];

```

### Ubicación de las etiquetas en la interfaz del Administrador

El siguiente esquema en texto plano ilustra cómo se mapean las principales etiquetas configuradas dentro del ciclo de vida visual del panel de control de WordPress:

```text
+-------------------------------------------------------------------------+
| WP Admin Bar -> [+] Añadir -> [name_admin_bar]                          |
+-------------------------------------------------------------------------+
| Menú Lateral (Sidebar)      | Área de Trabajo / Listado de Contenido     |
|                             |                                           |
| -- [menu_name]              | Home > [name] > [all_items]               |
|    |-- [all_items]          |                                           |
|    |-- Añadir nuevo         | [all_items]  [add_new] <-- Botón superior |
|                             |                                           |
|                             | +---------------------------------------+ |
|                             | | Caja de búsqueda:   [search_items]    | |
|                             | +---------------------------------------+ |
|                             |                                           |
|                             | Si la lista está vacía:                   |
|                             | "[not_found]"                           |
+-------------------------------------------------------------------------+

```

### Argumentos de control de la UI

Más allá de los textos, existen argumentos específicos dentro del array de `$args` en `register_post_type()` que determinan la accesibilidad y el posicionamiento del CPT dentro del entorno gráfico.

#### `menu_position` (Ubicación en el menú lateral)

Este argumento acepta un número entero que determina la prioridad de aparición en la barra lateral. Si se omite, WordPress lo colocará por defecto debajo de los Comentarios (posición 25).

Conocer las posiciones exactas del núcleo es crucial para evitar colisiones visuales:

* `5`: Debajo de Entradas (Posts).
* `10`: Debajo de Medios (Media).
* `15`: Debajo de Enlaces (Links).
* `20`: Debajo de Páginas (Pages).
* `25`: Debajo de Comentarios.
* `60`: Debajo del primer separador de menú.
* `65`: Debajo de Plugins.
* `70`: Debajo de Usuarios.
* `75`: Debajo de Herramientas.
* `80`: Debajo de Ajustes.
* `100`: Debajo del segundo separador de menú.

#### `menu_icon` (Identidad visual)

Para definir el icono del menú lateral, existen dos vías profesionales:

1. **Dashicons:** La biblioteca nativa de fuentes de iconos de WordPress. Se pasa el nombre de la clase directamente (ej. `'dashicons-book-alt'`).
2. **SVG Vectorial Embebido:** Para personalización de marca avanzada, se puede pasar un string con un SVG codificado en Base64. Esto evita peticiones HTTP adicionales y asegura consistencia independientemente del tema de administración del usuario.

```php
'menu_icon' => 'data:image/svg+xml;base64,' . base64_encode( '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path fill="#black" d="M15 2h-8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-12c0-1.1-.9-2-2-2zm-1 5h-6v-1h6v1zm0 3h-6v-1h6v1zm0 3h-6v-1h6v1z"/></svg>' ),

```

#### `show_in_menu` (Anidación de CPTs)

Este parámetro acepta un valor booleano o un string. Al pasar un string con la ruta de un archivo `.php` de la administración, puedes agrupar tu CPT dentro de un menú existente en lugar de crear un elemento de primer nivel.

* Anidar dentro de Entradas: `'show_in_menu' => 'edit.php'`
* Anidar dentro de Ajustes: `'show_in_menu' => 'options-general.php'`
* Anidar dentro de un menú personalizado propio creado por el plugin: `'show_in_menu' => 'mi_panel_de_control_slug'`

### Modificación del marcador de posición del título

Por defecto, la caja de texto donde se introduce el título del CPT muestra el texto genérico "Añadir el título". Modificar este comportamiento no se realiza mediante un argumento directo en `register_post_type()`, sino interceptando el filtro `enter_title_here`.

A continuación, se muestra cómo integrar de forma limpia esta lógica dentro de la estructura orientada a objetos del desarrollo del CPT:

```php
class MiPlugin_CPT_Libro {

    const POST_TYPE = 'miplugin_libro';

    public function init() {
        add_action( 'init', [ $this, 'registrar_cpt' ] );
        add_filter( 'enter_title_here', [ $this, 'modificar_placeholder_titulo' ] );
    }

    public function registrar_cpt() {
        // Registro del CPT con los argumentos y etiquetas explicados previamente...
    }

    /**
     * Modifica el texto de marcador de posición (placeholder) del título
     * solo cuando nos encontramos editando el CPT específico.
     *
     * @param string $title Texto actual del marcador de posición.
     * @return string Texto modificado.
     */
    public function modificar_placeholder_titulo( $title ) {
        $screen = get_current_screen();

        if ( isset( $screen->post_type ) && self::POST_TYPE === $screen->post_type ) {
            return __( 'Introduce el título del libro (ej. Don Quijote)', 'miplugin' );
        }

        return $title;
    }
}

```

## 3.3 Registro de taxonomías propias

Así como los Custom Post Types extienden los tipos de contenido en WordPress, las taxonomías personalizadas permiten estructurar las relaciones y la categorización de dichos contenidos de forma multidimensional. En el núcleo de WordPress, una taxonomía es un sistema de clasificación (como las categorías o etiquetas nativas) cuyos términos se almacenan en la tabla `wp_terms` y se vinculan a los contenidos mediante `wp_term_relationships`.

La función del núcleo designada para este propósito es `register_taxonomy( $taxonomy, $object_type, $args )`. Al igual que con los CPTs, un registro avanzado requiere un control preciso de sus argumentos y su ejecución en el momento adecuado del ciclo de vida de WordPress.

### El Hook adecuado y el orden de ejecución

Las taxonomías personalizadas deben registrarse siempre dentro del hook `init`. Es técnicamente posible y recomendado registrar tanto el CPT como su taxonomía asociada dentro de la misma función callback conectada a `init` para mantener el código cohesionado.

```php
/**
 * Clase para gestionar el registro de la taxonomía 'Género'.
 */
class MiPlugin_Taxonomia_Genero {

    const TAXONOMY = 'miplugin_genero';
    const POST_TYPE = 'miplugin_libro'; // CPT asociado definido en 3.1

    public function init() {
        add_action( 'init', [ $this, 'registrar_taxonomia' ] );
    }

    public function registrar_taxonomia() {
        $labels = [
            'name'              => _x( 'Géneros', 'taxonomy general name', 'miplugin' ),
            'singular_name'     => _x( 'Género', 'taxonomy singular name', 'miplugin' ),
            'search_items'      => __( 'Buscar Géneros', 'miplugin' ),
            'all_items'         => __( 'Todos los Géneros', 'miplugin' ),
            'parent_item'       => __( 'Género Padre', 'miplugin' ),
            'parent_item_colon' => __( 'Género Padre:', 'miplugin' ),
            'edit_item'         => __( 'Editar Género', 'miplugin' ),
            'update_item'       => __( 'Actualizar Género', 'miplugin' ),
            'add_new_item'      => __( 'Añadir Nuevo Género', 'miplugin' ),
            'new_item_name'     => __( 'Nombre del Nuevo Género', 'miplugin' ),
            'menu_name'         => __( 'Géneros', 'miplugin' ),
        ];

        $args = [
            'labels'            => $labels,
            'hierarchical'      => true, // Comportamiento similar a Categorías
            'public'            => true,
            'show_ui'           => true,
            'show_admin_column' => true, // Columna automática en el listado del CPT
            'show_in_nav_menus' => true,
            'show_tagcloud'     => false,
            'rewrite'           => [ 'slug' => 'genero', 'with_front' => false ],
            'show_in_rest'      => true, // Requerido para Gutenberg
        ];

        register_taxonomy( self::TAXONOMY, [ self::POST_TYPE ], $args );
    }
}

$tax_genero = new MiPlugin_Taxonomia_Genero();
$tax_genero->init();

```

### Jerárquicas vs. No Jerárquicas: El argumento `hierarchical`

El argumento `hierarchical` determina el comportamiento estructural y la interfaz de usuario de la taxonomía dentro del panel de administración:

* **`'hierarchical' => true` (Estilo Categorías):** Permite relaciones de tipo padre-hijo entre los términos. En el editor de contenidos (Gutenberg o Clásico), se renderiza como una lista de casillas de verificación (checkboxes). Los usuarios eligen términos preexistentes y pueden crear nuevos directamente sin salir de la pantalla de edición.
* **`'hierarchical' => false` (Estilo Etiquetas/Tags):** No permite herencia ni elementos padre. En la interfaz se muestra como una caja de texto donde los términos se introducen separados por comas y cuenta con un autocompletado basado en los términos más utilizados.

### Argumentos avanzados de control

Para afinar la integración de la taxonomía en el ecosistema del sitio, se deben dominar los siguientes parámetros específicos:

#### `show_admin_column`

Establecer este argumento en `true` instruye a WordPress para que cree automáticamente una columna personalizada en la tabla de listado del CPT asignado (en este caso, en la pantalla de `edit.php?post_type=miplugin_libro`). Esto ahorra al desarrollador la necesidad de interceptar manualmente los filtros de columnas del admin para mostrar los términos asignados a cada entrada.

#### `meta_box_cb`

Permite cambiar por completo la función callback encargada de renderizar la interfaz de la taxonomía en la pantalla de edición del post. Si se pasa `false`, se remueve por completo el metabox nativo de la barra lateral. Esto es una práctica común cuando el plugin implementa una interfaz de selección personalizada mediante JavaScript o controles avanzados en metaboxes propios.

#### `rewrite` (Reglas de enrutamiento)

Al igual que con los CPTs, controla la estructura de los enlaces permanentes de las páginas de archivo de la taxonomía.

* `slug`: Define la base de la URL (ej. `midominio.com/genero/ciencia-ficcion/`).
* `hierarchical`: Si se establece en `true`, la URL reflejará la estructura interna de los términos (ej. `midominio.com/genero/novela/ciencia-ficcion/`).

### El peligro de `register_taxonomy_for_object_type()`

Existe una función en el núcleo llamada `register_taxonomy_for_object_type()`. Su uso es un error común cuando se registran taxonomías propias para CPTs propios. Esta función está diseñada exclusivamente para vincular una taxonomía **existente** (como las categorías nativas `category`) a un tipo de contenido.

Para taxonomías creadas por tu propio plugin, la vinculación debe declararse directamente pasando el identificador del CPT en el segundo parámetro (el array `$object_type`) de la función `register_taxonomy()`, tal como se ejemplificó en el código de la sección anterior (`[ self::POST_TYPE ]`).

### Estructura de almacenamiento en Base de Datos

El siguiente diagrama en texto plano muestra cómo interactúan las tablas nativas de WordPress cuando se registra y asigna un término de una taxonomía personalizada:

```text
+-----------------------+      +---------------------------+
|       wp_terms        |      |    wp_term_taxonomy       |
+-----------------------+      +---------------------------+
| term_id: 12           | <--- | term_taxonomy_id: 14      |
| name: 'Ciencia Ficción'|      | term_id: 12               |
| slug: 'ciencia-ficcion'|      | taxonomy: 'miplugin_genero'|
+-----------------------+      +---------------------------+
                                             |
                                             v
+-----------------------+      +---------------------------+
|       wp_posts        |      |   wp_term_relationships   |
+-----------------------+      +---------------------------+
| ID: 450               | <--- | object_id: 450            |
| post_title: 'Dune'    |      | term_taxonomy_id: 14      |
| post_type: 'miplugin_libro'  | term_order: 0             |
+-----------------------+      +---------------------------+

```

## 3.4 Relación entre CPTs y taxonomías

El verdadero poder de las arquitecturas de datos en WordPress se revela cuando los Custom Post Types y las taxonomías trabajan en conjunto. Mientras que el CPT define el "qué" (el objeto de contenido), la taxonomía define el "cómo se agrupa". Esta relación de muchos a muchos permite construir consultas complejas y estructurar la navegación del sitio.

### Consultas combinadas con `WP_Query` y `tax_query`

Para extraer contenidos de un CPT basándose en los términos de una taxonomía personalizada, la clase `WP_Query` proporciona el argumento `tax_query`. Este parámetro requiere un array multidimensional, lo que permite realizar cruces lógicos complejos (AND, OR) entre múltiples taxonomías si fuera necesario.

A continuación, se muestra cómo recuperar los últimos 10 libros que pertenecen al género "Ciencia Ficción":

```php
$args = [
    'post_type'      => 'miplugin_libro',
    'posts_per_page' => 10,
    'post_status'    => 'publish',
    'tax_query'      => [
        [
            'taxonomy'         => 'miplugin_genero',
            'field'            => 'slug', // Puede ser 'term_id', 'name', 'slug' o 'term_taxonomy_id'
            'terms'            => 'ciencia-ficcion',
            'include_children' => true,   // Falso si solo se quiere el término exacto, no sus hijos
            'operator'         => 'IN',   // Operadores: 'IN', 'NOT IN', 'AND', 'EXISTS', 'NOT EXISTS'
        ],
    ],
];

$libros_query = new WP_Query( $args );

if ( $libros_query->have_posts() ) {
    while ( $libros_query->have_posts() ) {
        $libros_query->the_post();
        // Lógica de renderizado...
    }
    wp_reset_postdata();
}

```

### Recuperación de términos desde un CPT

Cuando te encuentras dentro del loop o tienes el ID de un post específico, frecuentemente necesitas mostrar a qué términos está asociado. Para taxonomías personalizadas, funciones como `the_category()` no sirven. Debes utilizar `get_the_terms()`.

```php
// Obtener los términos asociados al post actual
$generos = get_the_terms( get_the_ID(), 'miplugin_genero' );

if ( ! is_wp_error( $generos ) && ! empty( $generos ) ) {
    $nombres_generos = wp_list_pluck( $generos, 'name' );
    echo 'Géneros: ' . esc_html( implode( ', ', $nombres_generos ) );
}

```

### Integración avanzada en el panel de administración

Si definiste `'show_admin_column' => true` al registrar la taxonomía, WordPress mostrará los términos en la tabla listado del CPT. Sin embargo, para sitios con gran volumen de datos, los administradores necesitarán filtrar los CPTs mediante un menú desplegable por taxonomía.

WordPress no crea este filtro desplegable automáticamente para taxonomías personalizadas. Debes construirlo enganchándote a la acción `restrict_manage_posts`.

```php
class MiPlugin_Filtro_Taxonomia {

    const POST_TYPE = 'miplugin_libro';
    const TAXONOMY  = 'miplugin_genero';

    public function init() {
        add_action( 'restrict_manage_posts', [ $this, 'agregar_desplegable_filtro' ] );
    }

    public function agregar_desplegable_filtro( $post_type ) {
        // Solo ejecutar en la pantalla de nuestro CPT
        if ( self::POST_TYPE !== $post_type ) {
            return;
        }

        $taxonomia = get_taxonomy( self::TAXONOMY );
        $term_slug = isset( $_GET[ self::TAXONOMY ] ) ? sanitize_text_field( wp_unslash( $_GET[ self::TAXONOMY ] ) ) : '';

        wp_dropdown_categories( [
            'show_option_all' => sprintf( __( 'Todos los %s', 'miplugin' ), $taxonomia->label ),
            'taxonomy'        => self::TAXONOMY,
            'name'            => self::TAXONOMY,
            'orderby'         => 'name',
            'selected'        => $term_slug,
            'show_count'      => true,
            'hide_empty'      => true,
            'value_field'     => 'slug',
        ] );
    }
}

$filtro = new MiPlugin_Filtro_Taxonomia();
$filtro->init();

```

El núcleo de WordPress interceptará automáticamente el parámetro GET generado por este formulario y modificará la consulta principal (`WP_Query`) de la tabla de administración, filtrando los resultados sin necesidad de código adicional de nuestra parte.

## Resumen del capítulo

En este capítulo, hemos abordado la creación y estructuración de modelos de datos mediante las APIs de WordPress. Hemos visto que el registro de Custom Post Types (`register_post_type`) y taxonomías (`register_taxonomy`) debe ejecutarse de forma segura en el hook `init`, prestando especial atención a los argumentos que controlan la visibilidad, el soporte de características como Gutenberg (`show_in_rest`) y las reglas de reescritura de URLs.

Analizamos la importancia de la internacionalización semántica (`_x()`) para construir interfaces de administración profesionales. Finalmente, exploramos cómo relacionar ambas entidades, ejecutando consultas condicionales complejas con `WP_Query` y mejorando la experiencia de gestión en el panel de administración mediante filtros personalizados. Esta base estructural es esencial antes de pasar a la inyección de datos granulares a nivel de campo.
