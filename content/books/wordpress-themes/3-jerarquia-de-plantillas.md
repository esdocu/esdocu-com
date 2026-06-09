En capítulos anteriores establecimos los cimientos de la arquitectura de WordPress. Ahora abordaremos su pilar visual: el mecanismo que decide qué archivo PHP se ejecuta al cargar una URL. Este sistema se conoce como la Jerarquía de Plantillas (Template Hierarchy).

En este capítulo desentrañaremos el enrutamiento dinámico del *core*. Aprenderás cómo WordPress traduce una petición web utilizando `WP_Query`, el orden estricto en que busca los archivos en tu theme y cómo crear estructuras robustas para páginas, taxonomías y *fallbacks*. Dominar este concepto te dará el control absoluto sobre el motor de renderizado de tu proyecto.

## 3.1 Cómo funciona el enrutamiento visual

A diferencia de un sitio web estático tradicional, donde una URL como `misitio.com/nosotros.php` apunta directamente a un archivo físico en el servidor, el enrutamiento en WordPress es enteramente virtual y dinámico. Cuando desarrollas themes, es fundamental comprender que el servidor web (Apache o Nginx) siempre dirige el tráfico inicial hacia un único punto de entrada: el archivo `index.php` del *core* de WordPress (como vimos en el ciclo de carga).

A partir de ahí, WordPress actúa como un controlador frontal (Front Controller), traduciendo la URL en una consulta a la base de datos y, finalmente, decidiendo qué archivo PHP de tu theme debe encargarse de renderizar la vista. Este proceso de "enrutamiento visual" se divide en tres fases críticas.

### 1. Análisis de la petición (URL Parsing)

Cuando un usuario visita una URL, la clase `WP` toma el control. Utilizando el sistema de *Rewrite Rules* (reglas de reescritura almacenadas en la base de datos), WordPress descompone la URL amigable en variables de consulta (Query Vars) que el sistema puede entender.

Por ejemplo, una petición a `https://tuweb.com/categoria/tecnologia/` es interceptada y traducida internamente por el método `WP->parse_request()` a algo similar a esto:
`index.php?category_name=tecnologia`

### 2. Ejecución de la consulta principal (WP_Query)

Una vez que WordPress sabe qué está pidiendo el usuario (en este caso, una categoría llamada "tecnología"), instancia el objeto global `$wp_query`. Esta es quizás la clase más importante del sistema.

La clase `WP_Query` hace dos cosas de forma automática:

1. Construye y ejecuta la consulta SQL para obtener los datos relevantes de la base de datos (los posts de esa categoría).
2. Establece una serie de banderas booleanas (Conditional Tags) que definen el contexto de la petición.

Para la URL de nuestro ejemplo, `WP_Query` establecerá `$wp_query->is_category = true` y `$wp_query->is_archive = true`, mientras que mantendrá en `false` otras banderas como `is_single` o `is_page`.

### 3. El cargador de plantillas (Template Loader)

Con el contexto de la petición ya definido, WordPress delega la responsabilidad visual al theme activo. Esto ocurre en el archivo `wp-includes/template-loader.php`.

El Template Loader evalúa las banderas booleanas de `WP_Query` y comienza a buscar archivos específicos dentro de la carpeta de tu theme utilizando la función `locate_template()`. Busca en un orden de prioridad estrictamente definido por la **Jerarquía de Plantillas** (Template Hierarchy).

A continuación, se ilustra el flujo conceptual de este enrutamiento:

```text
[ Petición HTTP ] -> https://tuweb.com/categoria/tecnologia/
       |
       v
[ 1. WP Core ] -> Analiza URL: category_name=tecnologia
       |
       v
[ 2. WP_Query ] -> Ejecuta SQL y define contexto: is_category() === true
       |
       v
[ 3. Template Loader ] -> Inicia el motor de enrutamiento visual para 'category'
       |
       |-- 1. ¿Existe el archivo category-tecnologia.php en el theme? (No)
       |-- 2. ¿Existe el archivo category-ID.php en el theme? (No)
       |-- 3. ¿Existe el archivo category.php en el theme? (Sí) ----> [ RENDERIZA ESTE ARCHIVO ]
       |-- 4. ¿Existe el archivo archive.php en el theme? (Ignorado)
       |-- 5. ¿Existe el archivo index.php en el theme? (Ignorado)

```

WordPress desciende por la lista de posibles nombres de archivo, de lo más específico a lo más general. En el instante en que encuentra una coincidencia en el directorio de tu theme, detiene la búsqueda y carga ese archivo PHP con `include()`. Si no encuentra ninguno de los archivos específicos, el enrutamiento siempre caerá, por diseño, en el archivo obligatorio `index.php`.

### Representación en código del Template Loader

Para entenderlo desde la perspectiva de PHP, el comportamiento de `template-loader.php` actúa conceptualmente como una gran estructura condicional que lee el estado de `WP_Query`:

```php
// Concepto simplificado del enrutamiento interno de WordPress
if ( is_404() ) {
    $template = get_404_template();
} elseif ( is_search() ) {
    $template = get_search_template();
} elseif ( is_category() ) {
    // Buscará category-{slug}.php, category-{id}.php, category.php, etc.
    $template = get_category_template();
} elseif ( is_page() ) {
    $template = get_page_template();
} elseif ( is_single() ) {
    $template = get_single_template();
} else {
    $template = get_index_template(); // Fallback final (index.php)
}

if ( $template ) {
    include( $template );
}

```

Comprender este motor de evaluación es el primer paso para dominar el desarrollo de themes. Tu trabajo como desarrollador no es configurar rutas en un enrutador (como harías en Laravel o Express), sino crear los archivos PHP con los nombres exactos que WordPress está preprogramado para buscar en este ciclo de carga.

## 3.2 Jerarquía para páginas y entradas

Aunque las páginas (`page`) y las entradas (`post`) comparten similitudes en la base de datos (ambas se almacenan en la tabla `wp_posts`), WordPress las trata de manera muy distinta al momento de renderizarlas. Comprender la ruta exacta que sigue el Template Loader para cada una te permitirá estructurar tu theme con precisión milimétrica.

Ambos tipos de contenido convergen en un punto de la jerarquía, pero sus rutas iniciales son independientes.

### La jerarquía para Entradas Individuales (Posts)

Cuando un visitante accede a un artículo de blog individual (o a un elemento de un Custom Post Type), WordPress identifica que la petición es para una entrada singular. En este punto, `WP_Query` establece `is_single()` como verdadero.

WordPress buscará los archivos en el siguiente orden estricto:

1. **`single-{post_type}-{slug}.php`**: El nivel más específico. Busca un archivo exclusivo para un tipo de post y un *slug* (URL amigable) particular. Ejemplo: `single-post-bienvenidos.php`.
2. **`single-{post_type}.php`**: Se aplica a todas las entradas de un tipo específico. Si visitas un post normal de un blog, buscará `single-post.php`.
3. **`single.php`**: El estándar para cualquier entrada individual, sin importar su tipo de post (a menos que se haya interceptado en los pasos anteriores).
4. **`singular.php`**: Un archivo comodín introducido en WordPress 4.3 que agrupa tanto entradas individuales como páginas estáticas.
5. **`index.php`**: El *fallback* o recurso final obligatorio.

#### Diagrama de flujo para Entradas

```text
URL: misitio.com/mi-primer-articulo/ (Post Type: 'post', Slug: 'mi-primer-articulo')

[ ¿is_single()? == TRUE ]
   |
   |-- 1. single-post-mi-primer-articulo.php ?
   |-- 2. single-post.php ?
   |-- 3. single.php ?   <-- (El estándar recomendado para blogs)
   |-- 4. singular.php ?
   |-- 5. index.php

```

### La jerarquía para Páginas Estáticas (Pages)

Las páginas están diseñadas para contenido atemporal (como "Contacto" o "Sobre nosotros"). Cuando se solicita una página, `WP_Query` define `is_page()` como verdadero. La jerarquía de páginas introduce una capa adicional de extrema utilidad: las plantillas personalizadas.

El orden de búsqueda es el siguiente:

1. **Plantilla de página personalizada (Custom Page Template)**: Si el usuario ha seleccionado una plantilla específica desde el editor de WordPress, esta tiene prioridad absoluta.
2. **`page-{slug}.php`**: Busca por el *slug* de la página. Ejemplo: `page-contacto.php`.
3. **`page-{id}.php`**: Busca por el ID numérico de la página en la base de datos. Ejemplo: `page-42.php`. *(Nota: Se recomienda usar el slug en lugar del ID para facilitar migraciones entre entornos).*
4. **`page.php`**: El archivo estándar que renderizará cualquier página estática.
5. **`singular.php`**: El mismo archivo comodín que actúa como *fallback* para las entradas individuales.
6. **`index.php`**: El *fallback* final.

#### Diagrama de flujo para Páginas

```text
URL: misitio.com/contacto/ (ID: 42, Slug: 'contacto')

[ ¿is_page()? == TRUE ]
   |
   |-- 1. ¿Tiene Plantilla Personalizada asignada en el editor?
   |      (Si es sí, carga ese archivo. Ej: template-ancho-completo.php)
   |
   |-- 2. page-contacto.php ?
   |-- 3. page-42.php ?
   |-- 4. page.php ?     <-- (El estándar recomendado para páginas)
   |-- 5. singular.php ?
   |-- 6. index.php

```

### Creación de Plantillas de Página Personalizadas

El primer paso de la jerarquía de páginas merece una mención especial. A diferencia de `page-{slug}.php`, que se asigna automáticamente basándose en la URL, las **Custom Page Templates** permiten al usuario elegir el diseño manualmente desde el panel de administración, independientemente del título o la URL de la página.

Para crear una plantilla personalizada, solo necesitas crear un archivo PHP en la raíz de tu theme (o en una subcarpeta) y añadir una cabecera de comentarios específica:

```php
<?php
/**
 * Template Name: Página de Ancho Completo
 * * Esta plantilla elimina la barra lateral y permite que 
 * el contenido ocupe el 100% de la pantalla.
 */

get_header(); ?>

<main id="primary" class="site-main full-width-layout">
    <?php
    while ( have_posts() ) :
        the_post();
        // Renderizado del contenido...
    endwhile;
    ?>
</main>

<?php get_footer(); ?>

```

Una vez guardado este archivo, el nombre "Página de Ancho Completo" aparecerá en el menú desplegable "Plantilla" dentro de las opciones de la página en el editor de bloques (Gutenberg) o en el editor clásico.

### El rol unificador de `singular.php`

Como habrás notado, tanto la jerarquía de entradas como la de páginas convergen en `singular.php` justo antes de caer en `index.php`.

Este archivo es ideal para themes minimalistas. Si el diseño visual de tu artículo de blog (`single.php`) y tu página estática (`page.php`) es exactamente el mismo (por ejemplo, un título central, contenido debajo y sin barra lateral), puedes eliminar `single.php` y `page.php` por completo. Al usar únicamente `singular.php`, reduces la duplicación de código y mantienes la estructura de tu theme más limpia.

## 3.3 Plantillas de archivo y taxonomías

En la terminología de WordPress, un "archivo" (archive) no se refiere a un fichero físico en el servidor, sino a cualquier vista dinámica que lista un conjunto de publicaciones agrupadas por un criterio común. Esto incluye los listados por categoría, por etiqueta, por autor, por fecha o por taxonomías personalizadas.

Cuando el usuario navega por estas agrupaciones, `WP_Query` define el contexto como `is_archive()` (junto con etiquetas condicionales más específicas como `is_category()` o `is_tax()`). El Template Loader buscará entonces la plantilla más adecuada para renderizar ese listado de publicaciones.

### La jerarquía para Categorías

Las categorías son la taxonomía jerárquica predeterminada de WordPress. Si un visitante entra a la URL de una categoría específica, el motor de enrutamiento evalúa las opciones de mayor a menor especificidad:

```text
URL: misitio.com/categoria/noticias/ (ID: 7, Slug: 'noticias')

[ ¿is_category()? == TRUE ]
   |
   |-- 1. category-noticias.php ?
   |-- 2. category-7.php ?
   |-- 3. category.php ?
   |-- 4. archive.php ?     <-- (El estándar recomendado para listados)
   |-- 5. index.php

```

### La jerarquía para Etiquetas (Tags)

Las etiquetas funcionan de manera casi idéntica a las categorías, pero con su propia rama en el Template Hierarchy. Las etiquetas representan una taxonomía plana.

```text
URL: misitio.com/etiqueta/innovacion/ (ID: 14, Slug: 'innovacion')

[ ¿is_tag()? == TRUE ]
   |
   |-- 1. tag-innovacion.php ?
   |-- 2. tag-14.php ?
   |-- 3. tag.php ?
   |-- 4. archive.php ?
   |-- 5. index.php

```

### La jerarquía para Taxonomías Personalizadas (Custom Taxonomies)

Cuando el desarrollo escala y necesitas registrar tus propias formas de agrupar contenido (por ejemplo, agrupar un Custom Post Type "Libros" mediante una taxonomía "Género"), WordPress introduce una estructura de nombres de archivo que combina el nombre de la taxonomía y el término específico.

```text
URL: misitio.com/genero/ciencia-ficcion/ (Taxonomía: 'genero', Término: 'ciencia-ficcion')

[ ¿is_tax()? == TRUE ]
   |
   |-- 1. taxonomy-genero-ciencia-ficcion.php ?
   |-- 2. taxonomy-genero.php ?
   |-- 3. taxonomy.php ?
   |-- 4. archive.php ?
   |-- 5. index.php

```

### Otras vistas de archivo: Autor y Fecha

Además de las taxonomías, existen otras dos formas nativas de agrupar contenido que siguen el mismo principio de "caída en cascada" hacia `archive.php`:

* **Archivos de Autor (`is_author()`):** Busca `author-{nicename}.php`, luego `author-{id}.php`, después `author.php`, y finalmente cae en `archive.php`.
* **Archivos de Fecha (`is_date()`):** Busca `date.php` y, si no lo encuentra, cae directamente en `archive.php`. Las vistas basadas en año, mes o día comparten esta misma ruta.

### El poder unificador de `archive.php`

Al observar los diagramas anteriores, notarás que todas las rutas de listado convergen inevitablemente en `archive.php` antes de llegar al último recurso (`index.php`).

Esta convergencia es una de las mayores ventajas arquitectónicas de WordPress. En la gran mayoría de los themes, el diseño visual de una categoría, una etiqueta, o un listado por autor es exactamente el mismo: un encabezado que indica qué se está listando, seguido de una cuadrícula o lista de los artículos correspondientes.

En lugar de crear `category.php`, `tag.php`, `author.php` y `taxonomy.php` repitiendo el mismo código HTML y PHP, la práctica recomendada es crear un único archivo `archive.php` robusto.

A continuación, se muestra la estructura estándar de un archivo `archive.php` bien implementado:

```php
<?php get_header(); ?>

<main id="primary" class="site-main">

    <?php if ( have_posts() ) : ?>

        <header class="page-header">
            <?php
            // the_archive_title() detecta automáticamente si es una categoría, 
            // etiqueta, autor o taxonomía y muestra el título correcto.
            the_archive_title( '<h1 class="page-title">', '</h1>' );
            
            // Muestra la descripción de la taxonomía si fue introducida en el panel
            the_archive_description( '<div class="archive-description">', '</div>' );
            ?>
        </header>

        <div class="post-grid">
            <?php
            // Inicia el Loop principal
            while ( have_posts() ) :
                the_post();
                
                // Carga un archivo parcial para renderizar cada tarjeta de post
                get_template_part( 'template-parts/content', get_post_type() );

            endwhile;
            ?>
        </div>

        <?php 
        // Renderiza los enlaces de paginación
        the_posts_pagination(); 
        ?>

    <?php else : ?>

        <?php 
        // Si la taxonomía existe pero no tiene posts asociados
        get_template_part( 'template-parts/content', 'none' ); 
        ?>

    <?php endif; ?>

</main>

<?php get_footer(); ?>

```

La función `the_archive_title()` es clave en este archivo unificado. Gracias a ella, el mismo archivo `archive.php` renderizará un encabezado `<h1>Categoría: Noticias</h1>` cuando el usuario visite la categoría correspondiente, o `<h1>Autor: Juan Pérez</h1>` cuando visite el perfil del autor, adaptándose dinámicamente al contexto de `WP_Query` sin necesidad de múltiples condicionales en tu código.

## 3.4 Fallbacks y plantillas de error 404

El sistema de enrutamiento de WordPress está diseñado bajo el principio de "degradación elegante" (graceful degradation). Esto significa que si el sistema no encuentra el archivo óptimo y específico para renderizar una vista, nunca lanzará un error fatal en pantalla; en su lugar, retrocederá (hará un *fallback*) hacia un archivo más general, garantizando siempre una respuesta visual para el usuario.

### El recurso final: index.php

A lo largo de las jerarquías de páginas, entradas y archivos, hemos visto que todas las rutas convergen inevitablemente en `index.php`. Esta es la razón técnica por la cual WordPress exige que `index.php` (junto con `style.css`) esté presente para que un theme sea considerado válido y pueda activarse.

Si decides crear un theme extremadamente minimalista, podrías construir todo el sitio web utilizando únicamente `index.php`. En este escenario, `index.php` actuaría como un enrutador interno manual, utilizando etiquetas condicionales (como `is_single()`, `is_page()`) dentro del mismo archivo para alterar el diseño. Sin embargo, aunque es posible, esto rompe la separación de responsabilidades y hace que el código sea difícil de mantener, motivo por el cual existe la Jerarquía de Plantillas.

### Cómo procesa WordPress un error 404

En un sitio web estático tradicional, un error 404 ("Not Found") es devuelto directamente por el servidor web (Apache o Nginx) cuando no encuentra un archivo físico en el disco duro.

En WordPress, la mecánica es fundamentalmente distinta. Como vimos en el enrutamiento visual, el servidor web *siempre* encuentra un archivo válido: el `index.php` del directorio raíz. Por lo tanto, un 404 en WordPress no es un error de archivo físico del servidor, sino un **estado lógico de la base de datos**.

El proceso ocurre así:

1. El usuario solicita una URL como `tusitio.com/ruta-inventada/`.
2. La clase `WP` descompone la URL y se la pasa a `WP_Query`.
3. `WP_Query` ejecuta la consulta SQL en la base de datos.
4. Al devolver cero resultados para una ruta que debería existir lógicamente, `WP_Query` levanta la bandera `$wp_query->is_404 = true` y establece la cabecera HTTP de respuesta en `404 Not Found`.

### La jerarquía para errores 404

La ruta del Template Loader para manejar un estado de error 404 es la más corta y directa de todo el sistema de WordPress:

```text
URL: misitio.com/ruta-inventada/

[ ¿is_404()? == TRUE ]
   |
   |-- 1. 404.php ?     <-- (El estándar recomendado)
   |-- 2. index.php

```

Si no incluyes un archivo `404.php` en tu theme, WordPress cargará `index.php`. Esto suele ser problemático en la experiencia de usuario, ya que `index.php` (si está configurado como un listado de blog habitual) simplemente mostrará la cabecera, el pie de página y un área de contenido vacía, dejando al usuario confundido sobre si la página está rota o cargando.

### Construyendo una plantilla 404 efectiva

Una buena plantilla `404.php` debe ser clara, retener al usuario e invitarlo a seguir navegando por el sitio. Las mejores prácticas de desarrollo de themes dictan que siempre debes incluir un formulario de búsqueda y, opcionalmente, enlaces a secciones clave o contenido reciente.

A continuación, se muestra la estructura estándar recomendada para un archivo `404.php`:

```php
<?php
/**
 * La plantilla para mostrar errores 404 (Página no encontrada)
 */

get_header(); ?>

<main id="primary" class="site-main error-404 not-found">

    <header class="page-header">
        <h1 class="page-title">
            <?php esc_html_e( '¡Vaya! Esa página no se puede encontrar.', 'textdomain-de-tu-theme' ); ?>
        </h1>
    </header>

    <div class="page-content">
        <p>
            <?php esc_html_e( 'Parece que no se encontró nada en esta ubicación. ¿Tal vez intentar una búsqueda?', 'textdomain-de-tu-theme' ); ?>
        </p>

        <?php 
        // Renderiza el formulario de búsqueda nativo de WordPress
        get_search_form(); 
        ?>
        
        <div class="recent-content-suggestion">
            <h2><?php esc_html_e( 'Quizás te interese leer:', 'textdomain-de-tu-theme' ); ?></h2>
            <ul>
                <?php
                // Ejecuta un pequeño Loop personalizado para mostrar los últimos 3 posts
                $recent_posts = new WP_Query( array(
                    'posts_per_page'      => 3,
                    'ignore_sticky_posts' => 1,
                ) );

                if ( $recent_posts->have_posts() ) :
                    while ( $recent_posts->have_posts() ) :
                        $recent_posts->the_post();
                        ?>
                        <li>
                            <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
                        </li>
                        <?php
                    endwhile;
                    wp_reset_postdata();
                endif;
                ?>
            </ul>
        </div>
    </div>

</main>

<?php get_footer(); ?>

```

Al utilizar funciones de internacionalización (como `esc_html_e()`) nos aseguramos de que el texto del error 404 pueda ser traducido, una práctica que exploraremos a fondo en el capítulo de Distribución y Despliegue.

## 3.5 Filtrar la jerarquía por código

Hasta ahora, hemos visto que el Template Hierarchy funciona como un mecanismo automático e inflexible: evalúa el estado de `WP_Query` y busca un archivo físico siguiendo un orden predeterminado. Sin embargo, en el desarrollo avanzado de themes (y especialmente en la creación de plugins), a menudo necesitamos romper estas reglas y forzar a WordPress a cargar un archivo distinto bajo condiciones específicas.

WordPress permite interceptar este proceso de enrutamiento justo antes de que el archivo final sea cargado mediante la función `include()`. Esto se logra utilizando la API de Hooks (que exploraremos a fondo en el Capítulo 5), específicamente a través de los **Filtros de Plantilla** (Template Filters).

### El punto de intercepción

El archivo `template-loader.php` no solo busca los archivos, sino que pasa la ruta del archivo encontrado a través de un filtro dinámico con el formato `{$type}_template`.

Si WordPress determina que debe cargar la plantilla de una página, ejecutará el filtro `page_template`. Si es una categoría, ejecutará `category_template`. El punto de intercepción final, que captura absolutamente cualquier petición sin importar su tipo, es el filtro `template_include`.

El flujo conceptual se modifica de la siguiente manera:

```text
[ WP_Query define contexto ]
       |
       v
[ Template Loader busca en la jerarquía ] -> Encuentra: /themes/mi-tema/single.php
       |
       v
[ EJECUCIÓN DE FILTRO: 'single_template' o 'template_include' ]
       |   (Aquí tu código puede recibir la ruta original y devolver una nueva)
       v
[ WordPress incluye el archivo final devuelto por el filtro ]

```

### Casos de uso comunes

Intervenir la jerarquía por código abre la puerta a funcionalidades complejas que no pueden resolverse simplemente nombrando archivos:

1. **Plantillas basadas en roles de usuario:** Mostrar un diseño para usuarios anónimos y uno completamente distinto (sin publicidad, por ejemplo) para usuarios premium logueados.
2. **Carga de plantillas desde un plugin:** Si estás desarrollando un plugin que registra un Custom Post Type, puedes forzar a que la vista individual de ese CPT se cargue desde la carpeta de tu plugin y no desde el theme activo.
3. **A/B Testing:** Alternar aleatoriamente entre dos plantillas físicas diferentes para medir cuál genera mejor conversión.
4. **Estructuras de carpetas personalizadas:** Forzar a WordPress a buscar plantillas en subdirectorios profundos (por ejemplo, `/vistas/paginas/contacto.php`) si prefieres una arquitectura MVC.

### Ejemplos prácticos

Para alterar la jerarquía, debes añadir funciones en tu archivo `functions.php` que intercepten estos filtros.

#### Ejemplo 1: Plantilla específica según el rol del usuario

Imagina que quieres cargar una plantilla especial para las entradas del blog, pero solo si el usuario actual es un Administrador. Utilizaremos el filtro específico `single_template`.

```php
/**
 * Redirige a una plantilla personalizada para administradores en entradas individuales.
 *
 * @param string $template La ruta absoluta de la plantilla original encontrada.
 * @return string La ruta absoluta de la nueva plantilla.
 */
function mi_tema_plantilla_para_admins( $template ) {
    // Verificamos si estamos en una entrada individual y si el usuario puede gestionar opciones
    if ( is_single() && current_user_can( 'manage_options' ) ) {
        // Buscamos un archivo llamado 'single-admin.php' en el theme
        $nueva_plantilla = locate_template( array( 'single-admin.php' ) );
        
        // Si el archivo existe, lo devolvemos para sobrescribir el original
        if ( ! empty( $nueva_plantilla ) ) {
            return $nueva_plantilla;
        }
    }
    
    // Si no se cumple la condición o el archivo no existe, devolvemos la ruta original
    return $template;
}
add_filter( 'single_template', 'mi_tema_plantilla_para_admins' );

```

#### Ejemplo 2: Forzar una plantilla global con `template_include`

El filtro `template_include` es el más poderoso porque se ejecuta al final de todo el proceso de evaluación, justo antes de mostrar la página. En este ejemplo, si detectamos que la URL tiene un parámetro GET específico (ej. `?modo=impresion`), ignoramos toda la jerarquía y forzamos un archivo base diseñado para imprimir.

```php
/**
 * Intercepta cualquier vista si existe el parámetro ?modo=impresion.
 *
 * @param string $template La ruta de la plantilla calculada por WP.
 * @return string La ruta modificada.
 */
function mi_tema_modo_impresion( $template ) {
    // Si la URL contiene ?modo=impresion
    if ( isset( $_GET['modo'] ) && $_GET['modo'] === 'impresion' ) {
        // Forzamos la carga de print-layout.php
        $plantilla_impresion = locate_template( array( 'print-layout.php' ) );
        
        if ( ! empty( $plantilla_impresion ) ) {
            return $plantilla_impresion;
        }
    }
    
    return $template;
}
add_filter( 'template_include', 'mi_tema_modo_impresion' );

```

Al dominar estos filtros, el Template Hierarchy deja de ser una caja negra inamovible y se convierte en un sistema de rutas completamente programable.

## Resumen del capítulo

En este capítulo hemos desgranado el mecanismo fundamental que da vida a cualquier theme en WordPress: el **Template Hierarchy**.

* Comprendimos que el enrutamiento es virtual: las URL no apuntan a archivos físicos, sino que pasan por un análisis donde `WP_Query` define el contexto de la petición.
* Exploramos cómo el `Template Loader` evalúa ese contexto buscando archivos de forma descendente, desde lo más específico (ej. `page-contacto.php`) hasta lo más general (`index.php`).
* Analizamos las rutas independientes que siguen las entradas individuales y las páginas estáticas, convergiendo ambas en el versátil archivo `singular.php`.
* Unificamos el renderizado de categorías, etiquetas y taxonomías a través del archivo maestro `archive.php`, aprovechando funciones dinámicas como `the_archive_title()`.
* Definimos el estado 404 no como un error del servidor, sino como un estado de la base de datos que debe ser manejado amigablemente mediante la plantilla `404.php`.
* Finalmente, aprendimos a someter esta jerarquía a nuestra voluntad programática mediante filtros como `template_include`, permitiendo arquitecturas y lógicas condicionales avanzadas.

Con este mapa estructural claro, el siguiente paso es dotar a nuestro theme de un "cerebro" central. En el próximo capítulo exploraremos el archivo `functions.php`, el verdadero motor lógico de cualquier proyecto.
