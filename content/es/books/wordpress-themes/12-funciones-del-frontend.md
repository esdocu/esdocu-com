En este capítulo, conectaremos la lógica interna del theme con la interfaz visual. Nos enfocaremos en las herramientas de renderizado indispensables de WordPress para preparar la vista final. Aprenderás a inyectar contexto dinámico en el DOM usando clases estructurales, delegarás la gestión de títulos y metadatos al core mediante soportes modernos, y adaptarás componentes esenciales —como galerías, comentarios y búsquedas— al estándar HTML5. Dominar estas funciones te permitirá construir un frontend semántico, dinámico y listo para integrarse a la perfección con cualquier arquitectura CSS.

## 12.1 body_class y post_class

En el desarrollo de themes para WordPress, la comunicación entre la lógica interna (PHP y base de datos) y la presentación (CSS y JavaScript) se logra en gran medida a través de las clases HTML. WordPress proporciona dos funciones fundamentales para inyectar contexto dinámico directamente en el DOM: `body_class()` y `post_class()`.

Estas funciones actúan como un puente. En lugar de escribir lógica condicional compleja en tus hojas de estilo o scripts para detectar en qué página se encuentra el usuario o qué tipo de contenido está viendo, estas funciones imprimen automáticamente una lista de clases estandarizadas basadas en el Template Hierarchy (Capítulo 3) y el estado del Loop (Capítulo 7).

Aquí tienes una representación esquemática de dónde opera cada función dentro de la estructura típica de un documento HTML en WordPress:

```text
+---------------------------------------------------------------+
| <!DOCTYPE html>                                               |
| <html <?php language_attributes(); ?>>                        |
| <head>...</head>                                              |
|                                                               |
| |
| <body <?php body_class(); ?>>                                 |
|   <header>...</header>                                        |
|   <main>                                                      |
|     <?php if ( have_posts() ) : while ( have_posts() ) : ?>   |
|       <?php the_post(); ?>                                    |
|                                                               |
|       |       <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
|         <h2><?php the_title(); ?></h2>                        |
|         <div class="entry-content"><?php the_content(); ?></div>
|       </article>                                              |
|                                                               |
|     <?php endwhile; endif; ?>                                 |
|   </main>                                                     |
| </body>                                                       |
| </html>                                                       |
+---------------------------------------------------------------+

```

### La función body_class()

La función `body_class()` se utiliza exclusivamente dentro de la etiqueta `<body>`, generalmente en el archivo `header.php`. Su propósito es proporcionar información sobre la página global que se está renderizando.

Dependiendo de la URL visitada, WordPress imprimirá diferentes clases. Algunos ejemplos comunes incluyen:

* `home` o `blog`: Si se está viendo la página principal de entradas.
* `single` y `single-{post_type}`: Si se visualiza un post individual.
* `page` y `page-id-{ID}`: Si se visualiza una página estática.
* `logged-in`: Si el usuario actual tiene una sesión iniciada.
* `admin-bar`: Si la barra de administración superior está visible.

**Uso básico y parámetros:**
Puedes añadir tus propias clases estáticas pasando un string o un array como parámetro a la función.

```php
// Añadir una sola clase personalizada
<body <?php body_class( 'mi-tema-layout-especial' ); ?>>

// Añadir múltiples clases
<?php 
$clases_extra = array( 'clase-uno', 'clase-dos' ); 
?>
<body <?php body_class( $clases_extra ); ?>>

```

**Filtrar body_class:**
Si necesitas añadir o eliminar clases dinámicamente basándote en la lógica de negocio, no debes ensuciar el archivo `header.php`. En su lugar, utiliza el filtro `body_class` en tu `functions.php`:

```php
add_filter( 'body_class', 'mi_tema_clases_body_personalizadas' );
function mi_tema_clases_body_personalizadas( $classes ) {
    // Añadir una clase si es una página específica
    if ( is_page( 'contacto' ) ) {
        $classes[] = 'fondo-oscuro';
    }
    
    // Remover una clase nativa (por ejemplo, si no usamos un diseño específico)
    $clave = array_search( 'clase-no-deseada', $classes );
    if ( false !== $clave ) {
        unset( $classes[$clave] );
    }

    return $classes;
}

```

### La función post_class()

Mientras que `body_class()` define el contexto general, `post_class()` se enfoca en el micro-contexto. Se utiliza dentro del Loop (o al renderizar un post específico) y se aplica típicamente a la etiqueta contenedora del post, como un `<article>` o un `<div>`.

Esta función imprime información vital sobre el elemento actual, ahorrando la necesidad de realizar consultas a la base de datos para obtener las taxonomías o el estado del post. Las clases generadas incluyen:

* `post-{ID}`: El identificador único del post.
* `type-{post_type}`: El tipo de post (ej. `type-post`, `type-page`, `type-portfolio`).
* `status-{status}`: El estado de publicación (ej. `status-publish`).
* `category-{slug}` y `tag-{slug}`: Clases por cada categoría y etiqueta asociada al post.
* `has-post-thumbnail`: Si el post tiene una imagen destacada asignada.
* `sticky`: Si el post ha sido marcado como fijado en la página principal.

**Uso básico y parámetros:**
Al igual que con el body, puedes inyectar tus propias clases de forma directa, lo cual es útil si estás utilizando componentes de CSS predefinidos (como Bootstrap o Tailwind).

```php
<article id="post-<?php the_ID(); ?>" <?php post_class( 'tarjeta-articulo shadow-sm' ); ?>>
    </article>

```

**Filtrar post_class:**
La manipulación de estas clases a través de hooks se realiza con el filtro `post_class`. Recibe las clases actuales, las clases añadidas manualmente (como parámetro opcional) y el ID del post.

```php
add_filter( 'post_class', 'mi_tema_clases_post_personalizadas', 10, 3 );
function mi_tema_clases_post_personalizadas( $classes, $class, $post_id ) {
    // Ejemplo: Añadir una clase si el post tiene un campo meta específico (ver Capítulo 9)
    $es_destacado = get_post_meta( $post_id, '_articulo_patrocinado', true );
    
    if ( 'yes' === $es_destacado ) {
        $classes[] = 'articulo-patrocinado';
    }

    return $classes;
}

```

El dominio de estas dos funciones asegura que tu tema delegue en el core de WordPress la generación del contexto de estado. Esto mantiene tus archivos de plantilla (`.php`) limpios y proporciona a los desarrolladores frontend una API predecible de selectores CSS para maquetar cualquier escenario concebible.

## 12.2 Soportes de título y meta tags

La cabecera HTML (`<head>`) es una de las regiones más críticas de un theme de WordPress. No solo determina cómo se muestra el título del sitio en las pestañas del navegador, sino que también contiene los metadatos esenciales para los motores de búsqueda (SEO) y las plataformas sociales (Open Graph y Twitter Cards).

Históricamente, los desarrolladores escribían manualmente la etiqueta `<title>` dentro de `header.php`, utilizando la función `wp_title()`. Sin embargo, desde la versión 4.1, WordPress introdujo un estándar automatizado y centralizado a través de la API de soportes del tema (`add_theme_support`), delegando el renderizado del título al core para garantizar la compatibilidad con plugins de SEO y estándares modernos.

El siguiente diagrama de flujo ilustra cómo interactúan el archivo `header.php`, el core de WordPress y tus funciones personalizadas durante la construcción de la cabecera:

```text
+------------------------------------------------------------+
|                       functions.php                        |
|  - add_theme_support('title-tag')                          |
|  - add_action('wp_head', 'inyectar_meta_tags')             |
+------------------------------------------------------------+
                               |
                               v (Carga de la página)
+------------------------------------------------------------+
|                        header.php                          |
|  ... <head>                                                |
|  <?php wp_head(); ?>  -----------------+                   |
+----------------------------------------|-------------------+
                                         |
                                         v (Ejecución de Hooks)
                    +----------------------------------------+
                    | Core de WP: _wp_render_title_tag()     |
                    | -> Filtro: document_title_parts        |
                    | -> Filtro: document_title_separator    |
                    | Imprime: <title>...</title>            |
                    +----------------------------------------+
                                         |
                                         v
                    +----------------------------------------+
                    | Tu Theme: inyectar_meta_tags()         |
                    | Imprime: <meta name="..." content="...">|
                    +----------------------------------------+

```

### El soporte nativo 'title-tag'

Para habilitar la gestión automática de los títulos, debes registrar el soporte dentro del hook `after_setup_theme` (analizado en el Capítulo 4). Al hacer esto, debes omitir por completo la etiqueta `<title>` de tu archivo `header.php`. El core se encargará de inyectarla exactamente en el lugar donde invoques `wp_head()`.

```php
add_action( 'after_setup_theme', 'mi_tema_configurar_titulos' );
function mi_tema_configurar_titulos() {
    /*
     * Permite que WordPress administre el título del documento de forma nativa.
     * Esto genera títulos dinámicos según la vista (Ej: "Título del Post - Nombre del Sitio").
     */
    add_theme_support( 'title-tag' );
}

```

#### Personalización del título mediante filtros

WordPress genera el título concatenando varias partes (el título del post actual, el lema del sitio, el número de página si hay paginación, etc.). Puedes manipular estas partes de forma programática utilizando dos filtros fundamentales:

1. **`document_title_separator`**: Modifica el carácter o símbolo utilizado para separar los componentes del título (por defecto es un guion medio `-`).

```php
add_filter( 'document_title_separator', 'mi_tema_definir_separador_titulo' );
function mi_tema_definir_separador_titulo( $sep ) {
    // Cambiar el separador por una barra vertical con espacios
    return '|';
}

```

1. **`document_title_parts`**: Recibe un array asociativo con los componentes del título. Las claves de este array son:

* `title`: El título del contenido actual (entrada, página, término de taxonomía).
* `page`: El número de página actual (si el contenido está dividido con `` o en listados paginados).
* `tagline`: El lema del sitio (definido en Ajustes > Generales), mostrado solo en la página frontal.
* `site`: El nombre del sitio web.

El siguiente ejemplo muestra cómo modificar el título exclusivamente para las páginas de error 404 y cómo forzar la inclusión del lema del sitio en secciones específicas:

```php
add_filter( 'document_title_parts', 'mi_tema_personalizar_partes_titulo' );
function mi_tema_personalizar_partes_titulo( $parts ) {
    // Personalizar el título en vistas de error 404
    if ( is_404() ) {
        $parts['title'] = __( 'Contenido No Encontrado', 'mi-tema' );
    }

    // Añadir un sufijo corporativo personalizado a todas las páginas individuales
    if ( is_single() && isset( $parts['title'] ) ) {
        $parts['title'] .= ' [Artículo Oficial]';
    }

    return $parts;
}

```

### Inyección de Meta Tags dinámicos

A diferencia de los títulos, WordPress no gestiona de forma automática todos los meta tags necesarios para un sitio web moderno (como la descripción SEO o las etiquetas Open Graph para redes sociales), asumiendo que esta tarea suele delegarse en plugins especializados. No obstante, como desarrollador de themes, debes proveer una estructura sólida por defecto o resolver requerimientos específicos del frontend sin depender de herramientas de terceros.

La inyección de meta tags personalizados se realiza enganchando funciones al Action Hook `wp_head`. Es indispensable aplicar funciones de escape como `esc_attr()` para evitar vulnerabilidades de Cross-Site Scripting (XSS) si los metadatos provienen de la entrada del usuario.

El siguiente bloque de código demuestra cómo construir meta tags condicionales y semánticos basados en el tipo de vista del frontend:

```php
add_action( 'wp_head', 'mi_tema_inyectar_meta_tags', 1 );
function mi_tema_inyectar_meta_tags() {
    // 1. Meta tag de Viewport para Diseño Responsivo (Indispensable)
    echo '<meta name="viewport" content="width=device-width, initial-scale=1">' . "\n";

    // 2. Meta descripción dinámica para entradas individuales y páginas
    if ( is_singular() ) {
        global $post;
        
        // Intentar usar el extracto (excerpt), si no existe, usar los primeros 150 caracteres del contenido
        if ( ! empty( $post->post_excerpt ) ) {
            $meta_description = wp_strip_all_tags( $post->post_excerpt );
        } else {
            $meta_description = wp_strip_all_tags( $post->post_content );
            $meta_description = wp_html_excerpt( $meta_description, 150 );
        }

        echo '<meta name="description" content="' . esc_attr( $meta_description ) . '">' . "\n";
        
        // 3. Implementación de Open Graph (Protocolo para Redes Sociales)
        echo '<property="og:title" content="' . esc_attr( get_the_title() ) . '">' . "\n";
        echo '<property="og:type" content="article">' . "\n";
        echo '<property="og:url" content="' . esc_url( get_permalink() ) . '">' . "\n";
        echo '<property="og:site_name" content="' . esc_attr( get_bloginfo( 'name' ) ) . '">' . "\n";

        // Inyectar la URL de la imagen destacada si el post la tiene (ver Capítulo 4.1)
        if ( has_post_thumbnail( $post->ID ) ) {
            $img_url = get_the_post_thumbnail_url( $post->ID, 'large' );
            echo '<property="og:image" content="' . esc_url( $img_url ) . '">' . "\n";
        }
    }

    // 4. Meta descripción para la página de inicio (Blog principal)
    if ( is_home() || is_front_page() ) {
        $description = get_bloginfo( 'description', 'display' );
        if ( $description ) {
            echo '<meta name="description" content="' . esc_attr( $description ) . '">' . "\n";
        }
    }
}

```

### Limpieza de Meta Tags del Core

Por defecto, WordPress inyecta varios meta tags automáticos en el `wp_head` que exponen información de la instalación, como la versión exacta del core (`<meta name="generator" content="WordPress X.X.X">`) o enlaces de descubrimiento técnico (RSD, WLW). Por motivos de seguridad y optimización de código, es una buena práctica remover estos tags innecesarios utilizando `remove_action()` en el archivo `functions.php`:

```php
add_action( 'init', 'mi_tema_limpiar_cabecera' );
function mi_tema_limpiar_cabecera() {
    // Remover la etiqueta generadora de versión de WordPress (Mejora de seguridad)
    remove_action( 'wp_head', 'wp_generator' );

    // Remover enlaces para clientes de edición externos (Really Simple Discovery)
    remove_action( 'wp_head', 'rsd_link' );

    // Remover enlaces al Windows Live Writer manifest file
    remove_action( 'wp_head', 'wlwmanifest_link' );
    
    // Remover enlaces abreviados (shortlinks) de los posts en la cabecera
    remove_action( 'wp_head', 'wp_shortlink_wp_head', 10 );
}

```

A través de la combinación de `add_theme_support( 'title-tag' )` y la manipulación precisa de `wp_head`, el theme se asegura el control total del marcado invisible del documento, estructurando la metadata bajo las directrices oficiales de indexación y optimización web.

## 12.3 Renderizado de galerías

La forma en que WordPress procesa y muestra grupos de imágenes ha evolucionado significativamente a lo largo de los años. Desde el clásico shortcode `[gallery]` hasta el moderno bloque nativo de Galería del editor de bloques (Gutenberg), el desarrollador del theme debe asegurar que la estructura HTML generada sea semántica, accesible y fácil de estilizar mediante CSS.

Por defecto, si un theme no declara sus intenciones, WordPress puede inyectar estilos en línea directamente en el documento HTML o utilizar estructuras de etiquetas obsoletas por razones de compatibilidad con versiones antiguas. Tu objetivo en esta fase es tomar el control de ese renderizado.

### Soporte nativo para HTML5

El paso más crítico e indispensable para modernizar el renderizado de galerías es declarar el soporte para HTML5 en tu archivo `functions.php`. Esto le indica al core de WordPress que abandone las estructuras basadas en listas de definición (`<dl>`, `<dt>`, `<dd>`) y adopte las etiquetas semánticas `<figure>` y `<figcaption>`.

Debes registrar este soporte dentro de la acción `after_setup_theme`:

```php
add_action( 'after_setup_theme', 'mi_tema_soporte_html5' );
function mi_tema_soporte_html5() {
    /*
     * Habilita el marcado HTML5 para componentes nativos.
     * Al incluir 'gallery' y 'caption', WordPress utilizará etiquetas <figure>.
     */
    add_theme_support( 'html5', array(
        'search-form',
        'comment-form',
        'comment-list',
        'gallery',
        'caption',
        'style',
        'script'
    ) );
}

```

Para ilustrar el impacto de esta simple línea de código, observa la diferencia en el árbol del DOM que WordPress genera en el frontend:

```text
+-----------------------------------------+-----------------------------------------+
|        SIN SOPORTE HTML5 (Legacy)       |       CON SOPORTE HTML5 (Moderno)       |
+-----------------------------------------+-----------------------------------------+
| <div id="gallery-1" class="gallery">    | <figure id="gallery-1" class="gallery"> |
|                                         |                                         |
|   <dl class="gallery-item">             |   <figure class="gallery-item">         |
|     <dt class="gallery-icon">           |     <div class="gallery-icon">          |
|       <img src="foto.jpg" alt="...">    |       <img src="foto.jpg" alt="...">    |
|     </dt>                               |     </div>                              |
|     <dd class="wp-caption-text">        |     <figcaption class="wp-caption-text">|
|       Leyenda de la foto                |       Leyenda de la foto                |
|     </dd>                               |     </figcaption>                       |
|   </dl>                                 |   </figure>                             |
|                                         |                                         |
| </div>                                  | </figure>                               |
+-----------------------------------------+-----------------------------------------+

```

### Manejo de galerías basadas en Bloques

En el ecosistema actual, cuando un usuario añade una galería desde el editor, WordPress genera un bloque con la clase `.wp-block-gallery`. A diferencia del shortcode clásico, este bloque ya no inyecta estilos CSS en línea para calcular columnas matemáticas, sino que confía en las variables CSS modernas (CSS Custom Properties) y Flexbox/Grid.

Para que estas galerías nativas se rendericen correctamente sin que tengas que escribir cientos de líneas de CSS desde cero, puedes encolar los estilos base de los bloques en tu theme. Sin embargo, la mejor práctica en la actualidad (incluso para temas clásicos que no son Full Site Editing) es añadir el soporte para los estilos del editor y del core:

```php
// Añadir en after_setup_theme
add_theme_support( 'wp-block-styles' );
add_theme_support( 'align-wide' ); // Permite a las galerías usar ancho amplio y completo

```

El soporte `wp-block-styles` asegura que el CSS estructural por defecto de WordPress para componentes complejos como las galerías se cargue en tu frontend, permitiéndote a ti enfocarte solo en la cosmética (colores, bordes, tipografía).

### Sobreescritura total mediante el filtro `post_gallery`

Si estás construyendo un theme altamente personalizado donde las galerías deben integrarse con una librería de JavaScript de terceros (como Masonry.js, Swiper o un Lightbox específico) y la estructura nativa de WordPress simplemente no sirve, puedes interceptar y reemplazar por completo la salida del shortcode usando el filtro `post_gallery`.

Al retornar un string HTML desde este filtro, WordPress aborta su proceso natural de renderizado y muestra exactamente tu código.

```php
add_filter( 'post_gallery', 'mi_tema_renderizado_galeria_personalizado', 10, 2 );
function mi_tema_renderizado_galeria_personalizado( $salida, $atributos ) {
    // Si estamos en un feed RSS o si no hay atributos, dejamos que WP haga su trabajo
    if ( is_feed() || empty( $atributos['ids'] ) ) {
        return $salida;
    }

    // Extraer los IDs de las imágenes de los atributos de la galería
    $ids_imagenes = explode( ',', $atributos['ids'] );
    
    // Iniciar nuestro contenedor personalizado
    $html = '<div class="mi-galeria-masonry-customizada">';

    foreach ( $ids_imagenes as $id ) {
        // Obtener la imagen y su metadata
        $imagen     = wp_get_attachment_image( $id, 'large', false, array( 'class' => 'img-fluida' ) );
        $attachment = get_post( $id );
        $leyenda    = $attachment->post_excerpt; // La leyenda en WP se guarda como excerpt del attachment

        $html .= '<div class="item-galeria">';
        $html .= $imagen;
        
        if ( ! empty( $leyenda ) ) {
            $html .= '<p class="leyenda-custom">' . esc_html( $leyenda ) . '</p>';
        }
        
        $html .= '</div>';
    }

    $html .= '</div>';

    // Retornar nuestro HTML aborta el renderizado nativo de WP
    return $html;
}

```

> **Nota arquitectónica:** Esta técnica de sobreescritura con `post_gallery` aplica principalmente al shortcode heredado `[gallery]` y a bloques de galería clásicos transformados. Para manipular la estructura de los bloques de galería modernos en Gutenberg de forma profunda, se requieren técnicas avanzadas de filtrado en JavaScript (mediante `blocks.getSaveElement`), que escapan al alcance del procesamiento backend en PHP. Por ello, delegar en el soporte HTML5 y adaptar tu CSS suele ser el camino más estable a largo plazo.
>
## 12.4 Formularios de búsqueda y comentarios

Para que un theme sea completamente funcional e interactivo, debe permitir a los usuarios buscar contenido y participar en las discusiones. WordPress proporciona plantillas y funciones específicas para renderizar estos formularios, asegurando que los datos se envíen de forma segura a los endpoints correctos del core.

Al igual que con las galerías, el paso fundamental para modernizar estos elementos es haber declarado el soporte para HTML5 (como vimos en la sección anterior), incluyendo `'search-form'`, `'comment-form'` y `'comment-list'`. Esto garantiza que los inputs utilicen tipos nativos de HTML5 (como `type="search"` o `type="email"`) y que la estructura abandone las tablas o el marcado obsoleto.

### El Formulario de Búsqueda (searchform.php)

Cuando necesitas mostrar un cuadro de búsqueda (ya sea en la cabecera, en un sidebar o dentro del contenido), la función estándar a utilizar es `get_search_form()`.

El comportamiento de esta función sigue una jerarquía estricta:

1. **Busca el archivo `searchform.php`**: Si este archivo existe en la raíz de tu theme, WordPress lo incluirá. Esta es la forma recomendada de personalizar la búsqueda.
2. **Usa el renderizado nativo**: Si el archivo no existe, WordPress generará un formulario HTML por defecto (cuyo marcado dependerá de si declaraste soporte para HTML5).

**Creación de searchform.php**
Crear tu propio archivo `searchform.php` te otorga control absoluto sobre las clases CSS, los iconos (por ejemplo, SVG integrados) y los atributos de accesibilidad (ARIA).

El único requisito técnico innegociable es que el formulario debe enviar una petición `GET` a la URL principal del sitio (`home_url( '/' )`) y el campo de entrada principal debe tener el atributo `name="s"`.

```php
<form role="search" method="get" class="formulario-busqueda" action="<?php echo esc_url( home_url( '/' ) ); ?>">
    <label for="buscar-input" class="screen-reader-text">
        <?php _e( 'Buscar en el sitio:', 'mi-tema' ); ?>
    </label>
    <div class="input-grupo">
        <input 
            type="search" 
            id="buscar-input" 
            class="campo-busqueda" 
            placeholder="<?php echo esc_attr_x( 'Buscar...', 'placeholder', 'mi-tema' ); ?>" 
            value="<?php echo get_search_query(); ?>" 
            name="s" 
            required 
        />
        <button type="submit" class="boton-busqueda">
            <span class="icono-lupa">🔍</span>
            <span class="screen-reader-text"><?php _e( 'Buscar', 'mi-tema' ); ?></span>
        </button>
    </div>
</form>

```

*Nota: La función `get_search_query()` sanitiza y recupera el término que el usuario acaba de buscar, manteniéndolo visible en el input después de recargar la página de resultados.*

### El Área de Comentarios (comments.php)

El sistema de comentarios en WordPress es robusto y consta de dos partes principales: la lista de comentarios existentes y el formulario para enviar uno nuevo. Todo esto se encapsula típicamente en un único archivo llamado `comments.php`.

Para cargar esta plantilla dentro de una entrada individual (generalmente en `single.php` o `page.php`), se utiliza la función `comments_template()`. Esta función verifica si los comentarios están abiertos o si el post ya tiene comentarios antes de intentar cargar el archivo.

```php
// Dentro del Loop en single.php
if ( comments_open() || get_comments_number() ) {
    comments_template();
}

```

**Anatomía de comments.php**
Un archivo `comments.php` bien estructurado debe manejar varios escenarios lógicos (entradas protegidas por contraseña, ausencia de comentarios, paginación) y hacer uso de dos funciones críticas del core: `wp_list_comments()` y `comment_form()`.

A continuación, se presenta un esquema simplificado y funcional:

```php
<?php
/* Archivo: comments.php */

// 1. Evitar carga directa y verificar si el post requiere contraseña
if ( post_password_required() ) {
    return;
}
?>

<div id="comments" class="area-comentarios">

    <?php // 2. Mostrar la lista de comentarios si existen ?>
    <?php if ( have_comments() ) : ?>
        <h2 class="titulo-comentarios">
            <?php
            $numero_comentarios = get_comments_number();
            printf(
                _n( '1 pensamiento sobre "%2$s"', '%1$s pensamientos sobre "%2$s"', $numero_comentarios, 'mi-tema' ),
                number_format_i18n( $numero_comentarios ),
                '<span>' . get_the_title() . '</span>'
            );
            ?>
        </h2>

        <ol class="lista-comentarios">
            <?php
            // La función mágica que renderiza la lista completa (y anidada)
            wp_list_comments( array(
                'style'       => 'ol',
                'short_ping'  => true,
                'avatar_size' => 64,
            ) );
            ?>
        </ol>

        <?php // 3. Paginación de comentarios (si está habilitada en los ajustes) ?>
        <?php the_comments_navigation(); ?>

    <?php endif; ?>

    <?php // 4. Mensaje si los comentarios están cerrados pero hay comentarios previos ?>
    <?php if ( ! comments_open() && get_comments_number() && post_type_supports( get_post_type(), 'comments' ) ) : ?>
        <p class="comentarios-cerrados"><?php _e( 'Los comentarios están cerrados.', 'mi-tema' ); ?></p>
    <?php endif; ?>

    <?php 
    // 5. Renderizar el formulario de envío (generado dinámicamente por WordPress)
    comment_form( array(
        'title_reply_before' => '<h3 id="reply-title" class="comment-reply-title">',
        'title_reply_after'  => '</h3>',
        'class_submit'       => 'boton-primario enviar-comentario',
    ) ); 
    ?>

</div>

```

**Personalización de comment_form()**
La función `comment_form()` acepta un array de argumentos que te permite modificar casi cualquier aspecto visual del formulario generado (textos, clases CSS de los botones, marcado antes o después de los campos). Sin embargo, la estructura interna de los inputs (nombre, email, web) se gestiona mejor utilizando filtros en `functions.php` (como `comment_form_default_fields`) si necesitas añadir o eliminar campos específicos, asegurando que la lógica de sanitización del core siga protegiendo la base de datos.

## Resumen del capítulo

En este capítulo, hemos explorado las herramientas indispensables para conectar la lógica del backend con el renderizado final que interactúa con el usuario.

Comenzamos delegando la inyección de contexto en el DOM mediante `body_class()` y `post_class()`, estableciendo una base sólida y predecible para el desarrollo CSS. Luego, automatizamos la gestión de los títulos y estructuramos la metadata crítica en la cabecera del documento mediante el soporte `title-tag` y el hook `wp_head`.

Modernizamos la presentación del contenido visual habilitando el soporte HTML5 para galerías y componentes multimedia, asegurando que el marcado generado cumpla con los estándares semánticos actuales. Finalmente, dotamos de interactividad al tema dominando la arquitectura y personalización de los formularios de búsqueda y el ecosistema de comentarios, garantizando que tanto la navegación como la participación de los usuarios se integren perfectamente con el diseño global.
