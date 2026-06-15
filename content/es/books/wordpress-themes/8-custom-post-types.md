Aunque WordPress nació como una plataforma estructurada en entradas y páginas genéricas, su verdadera potencia como Sistema de Gestión de Contenidos (CMS) se revela al dominar los Custom Post Types (CPTs). En este capítulo, aprenderás a expandir la arquitectura base del *core* definiendo tus propias estructuras de datos complejas mediante código. Exploraremos paso a paso el registro de nuevos tipos de contenido, el control granular de permisos y capacidades, la creación de taxonomías a medida para clasificar la información y, finalmente, cómo la jerarquía de plantillas se adapta para renderizar de forma exclusiva estas nuevas vistas en el *frontend*.

## 8.1 Registro de tipos de post

Aunque WordPress se originó como una plataforma de blogging estructurada en entradas (`post`) y páginas (`page`), su evolución hacia un CMS completo es posible gracias a los **Custom Post Types (CPTs)**. En la base de datos, un tipo de post personalizado no es más que un registro en la tabla `wp_posts` cuyo campo `post_type` tiene un valor definido por el desarrollador, distinto a los valores nativos.

```text
+-------------------------------------------------------------+
| Tabla: wp_posts                                             |
+----+--------------------+-----------------------------------+
| ID | post_title         | post_type                         |
+----+--------------------+-----------------------------------+
| 1  | Hola Mundo         | post       (Nativo)               |
| 2  | Sobre Nosotros     | page       (Nativo)               |
| 3  | Menú de navegación | nav_menu_item (Nativo interno)    |
| 4  | Rediseño Web 2026  | proyecto   (Custom Post Type)     | <---
+----+--------------------+-----------------------------------+

```

Para registrar un nuevo tipo de contenido en WordPress, utilizamos la función principal `register_post_type()`. Esta función debe ejecutarse *siempre* dentro del hook `init`. Si intentas registrar un CPT antes (por ejemplo, en `after_setup_theme`), corres el riesgo de que las reglas de reescritura de URLs (Rewrite Rules) no se generen correctamente, devolviendo errores 404 en el frontend.

### La estructura de `register_post_type`

La función acepta dos parámetros:

1. **El slug del CPT:** Una cadena de texto (máximo 20 caracteres, sin espacios ni mayúsculas) que identificará al post type en la base de datos.
2. **Un array de argumentos:** Define cómo se comportará el CPT, qué características soporta y cómo se mostrará en el panel de administración.

A continuación, se presenta la estructura base para registrar un CPT llamado "Proyectos" (`proyecto`). Al ubicar este código en tu archivo `functions.php` (o en un archivo incluido desde este), WordPress creará automáticamente la interfaz de usuario en el panel de administración.

```php
/**
 * Registra el Custom Post Type "Proyectos"
 */
function mi_tema_registrar_cpt_proyectos() {

    // 1. Definimos las etiquetas de la interfaz (Labels)
    $labels = array(
        'name'                  => __( 'Proyectos', 'mi-tema' ),
        'singular_name'         => __( 'Proyecto', 'mi-tema' ),
        'menu_name'             => __( 'Proyectos', 'mi-tema' ),
        'add_new'               => __( 'Añadir Nuevo', 'mi-tema' ),
        'add_new_item'          => __( 'Añadir Nuevo Proyecto', 'mi-tema' ),
        'edit_item'             => __( 'Editar Proyecto', 'mi-tema' ),
        'all_items'             => __( 'Todos los Proyectos', 'mi-tema' ),
    );

    // 2. Definimos los argumentos de configuración (Args)
    $args = array(
        'labels'                => $labels,
        'public'                => true,
        'has_archive'           => true,
        'rewrite'               => array( 'slug' => 'proyectos' ),
        'menu_position'         => 5,
        'menu_icon'             => 'dashicons-portfolio',
        'show_in_rest'          => true, // Habilita el editor de bloques (Gutenberg)
        'supports'              => array( 'title', 'editor', 'thumbnail', 'excerpt' ),
    );

    // 3. Ejecutamos la función de registro
    register_post_type( 'proyecto', $args );
}

// Enganchamos la función a la acción 'init'
add_action( 'init', 'mi_tema_registrar_cpt_proyectos' );

```

### Consideraciones clave en el registro

Al registrar tipos de post desde un theme, es crucial tener en cuenta ciertas reglas de arquitectura y buenas prácticas:

* **Prefijos de seguridad (Namespacing):** Aunque en el ejemplo usamos `proyecto` por simplicidad, en entornos de producción se recomienda encarecidamente prefijar la clave del CPT (ej. `mt_proyecto`) para evitar colisiones fatales con plugins de terceros que puedan registrar un post type con el mismo nombre.
* **Editor de Bloques (`show_in_rest`):** Si omites la clave `show_in_rest` o la defines como `false`, tu CPT utilizará el editor clásico de WordPress por defecto (TinyMCE). Para habilitar la experiencia moderna de bloques introducida en WordPress 5.0, este valor debe ser estrictamente `true`. Esto también expone tu CPT a la WP REST API.
* **Permalinks y el error 404:** Cuando registras un CPT por primera vez y navegas a la URL de su archivo (ej. `/proyectos/`), es probable que WordPress devuelva una página de error 404. Esto se debe a que las reglas de reescritura en la base de datos no se han enterado del nuevo slug. Para solucionarlo temporalmente en desarrollo, debes ir a **Ajustes > Enlaces permanentes** y simplemente hacer clic en "Guardar cambios". Esto purga y regenera las reglas de enrutamiento (flush rewrite rules).

*(Nota: En las siguientes secciones profundizaremos en la lista completa de argumentos disponibles y en cómo asociar estos CPTs con taxonomías personalizadas).*

## 8.2 Argumentos y capacidades

El verdadero poder al registrar un Custom Post Type reside en el array de configuración `$args`. Mientras que las etiquetas (labels) se encargan de la interfaz humana, los argumentos dictan cómo interactúa el core de WordPress con tu nuevo tipo de contenido: dónde se muestra, cómo se enruta en las URLs, qué características de edición soporta y quién tiene permiso para gestionarlo.

### Argumentos principales de configuración

A continuación, se desglosan los parámetros más críticos que determinarán el comportamiento de tu CPT en el ecosistema del theme:

* **`public` (boolean):** Es un atajo (metaparémetro) que define la visibilidad general. Si se establece en `true`, implica que el CPT está disponible tanto en el frontend (para los visitantes) como en el backend (para los administradores). Modifica por defecto otros argumentos como `publicly_queryable`, `show_ui` y `show_in_nav_menus`.
* **`show_ui` (boolean):** Determina si se debe generar la interfaz de usuario estándar en el panel de administración. Puede ser útil establecer `public` en `false` y `show_ui` en `true` si deseas un CPT que solo se maneje internamente pero que no tenga URLs públicas.
* **`has_archive` (boolean | string):** Habilita las plantillas de archivo para este CPT. Si es `true`, la URL base del CPT (ej. `/proyectos/`) mostrará un listado de las publicaciones. Si pasas una cadena de texto (ej. `nuestros-proyectos`), esa cadena reescribirá el slug exclusivo del archivo.
* **`rewrite` (boolean | array):** Controla la estructura de los enlaces permanentes (Permalinks).
* `slug`: Personaliza la URL (ej. `'slug' => 'portfolio/proyecto'`).
* `with_front`: Por defecto es `true`. Si la estructura global de tus permalinks incluye un prefijo (como `/blog/`), tu CPT heredará ese prefijo (ej. `/blog/proyectos/`). Cambiarlo a `false` evita este comportamiento.

* **`menu_position` (integer):** Determina la posición del menú en la barra lateral del panel de administración. (Por ejemplo, `5` lo coloca debajo de Entradas, `20` debajo de Páginas).

### El array `supports`

El parámetro `supports` le indica a WordPress qué "Cajas Meta" (Meta Boxes) o características nativas debe cargar en la pantalla de edición del CPT.

```php
'supports' => array(
    'title',           // Título del post
    'editor',          // Editor de contenido (Gutenberg o Clásico)
    'author',          // Selector de autor
    'thumbnail',       // Imagen destacada (Requiere add_theme_support('post-thumbnails'))
    'excerpt',         // Resumen manual
    'trackbacks',      // Pings y Trackbacks
    'custom-fields',   // Interfaz nativa de campos personalizados
    'comments',        // Permite habilitar/deshabilitar comentarios
    'revisions',       // Guarda un historial de cambios
    'page-attributes', // Permite jerarquía (si hierarchical es true) y orden de menú
),

```

### Gestión de Capacidades (Capabilities)

Por defecto, un nuevo CPT hereda las capacidades del tipo `post`. Esto significa que cualquier usuario con el rol de Autor o Editor podrá crear, editar y publicar tu CPT. Sin embargo, en proyectos a medida, es común necesitar un control granular sobre quién puede manipular estos registros.

Para desvincular los permisos del CPT de los permisos genéricos de las entradas, utilizamos los argumentos `capability_type` y `map_meta_cap`.

```php
$args = array(
    // ... otros argumentos ...
    'capability_type'     => 'proyecto', // Base para los permisos
    'map_meta_cap'        => true,       // Mapea las capacidades primitivas automáticamente
);

```

Al definir `'capability_type' => 'proyecto'` y `'map_meta_cap' => true`, WordPress genera internamente un mapa de capacidades específicas que deberás asignar a los roles de usuario correspondientes.

```text
+-----------------------+---------------------------------------+
| Capacidad Genérica    | Capacidad Generada para el CPT        |
+-----------------------+---------------------------------------+
| edit_post             | edit_proyecto                         |
| read_post             | read_proyecto                         |
| delete_post           | delete_proyecto                       |
| edit_posts            | edit_proyectos                        |
| edit_others_posts     | edit_others_proyectos                 |
| publish_posts         | publish_proyectos                     |
| read_private_posts    | read_private_proyectos                |
+-----------------------+---------------------------------------+

```

*Nota arquitectónica:* Registrar el `capability_type` no otorga los permisos a nadie automáticamente (ni siquiera al Administrador). Si cambias este parámetro, tu CPT desaparecerá del menú temporalmente hasta que utilices una función (o un plugin de gestión de roles) para añadir estas nuevas capacidades (por ejemplo, `edit_proyectos`) al rol de Administrador y a cualquier otro rol que deba gestionarlos.

### Código de ejemplo avanzado

Integrando estos conceptos, un registro con control avanzado de rutas y permisos se vería de la siguiente manera:

```php
$args = array(
    'labels'              => $labels,
    'public'              => true,
    'show_ui'             => true,
    'menu_position'       => 20,
    'menu_icon'           => 'dashicons-hammer',
    'show_in_rest'        => true,
    'supports'            => array( 'title', 'editor', 'thumbnail', 'revisions' ),
    
    // Configuración de URLs avanzada
    'has_archive'         => 'nuestro-trabajo',
    'rewrite'             => array( 
        'slug'       => 'proyectos',
        'with_front' => false 
    ),
    
    // Permisos y Capacidades
    'capability_type'     => 'proyecto',
    'map_meta_cap'        => true,
);

register_post_type( 'mt_proyecto', $args );

```

## 8.3 Taxonomías jerárquicas y planas

Mientras que los Custom Post Types definen *qué* tipo de contenido estamos creando, las taxonomías definen *cómo* lo agrupamos y clasificamos. En WordPress, las taxonomías por defecto son las "Categorías" y las "Etiquetas", que se aplican a las entradas estándar (`post`). Sin embargo, cuando creamos un CPT como `proyecto` (visto en la sección anterior), lo ideal es crear sistemas de clasificación propios para no mezclar la arquitectura de datos del blog con la del portafolio.

Existen dos tipos fundamentales de taxonomías en WordPress, cuyo comportamiento se define mediante un único parámetro booleano:

1. **Taxonomías Jerárquicas (`'hierarchical' => true`):** Funcionan como las Categorías nativas. Los términos dentro de esta taxonomía pueden tener relaciones de padre e hijo. Son ideales para clasificaciones amplias y estructuradas. *Ejemplo: Tipo de Proyecto (Web > Ecommerce).*
2. **Taxonomías Planas (`'hierarchical' => false`):** Funcionan como las Etiquetas (Tags) nativas. Los términos están al mismo nivel, sin relación de descendencia entre ellos. Se utilizan para micro-clasificaciones o palabras clave específicas. *Ejemplo: Herramientas utilizadas (PHP, React, Figma).*

```text
Estructura de Relaciones:

[CPT: Proyecto] 
      │
      ├── Taxonomía Jerárquica: "Tipo"
      │     ├── Web (Padre)
      │     │    └── Ecommerce (Hijo)
      │     └── Móvil (Padre)
      │
      └── Taxonomía Plana: "Herramientas"
            ├── PHP (Sin jerarquía)
            ├── React (Sin jerarquía)
            └── Figma (Sin jerarquía)

```

### La función `register_taxonomy`

Al igual que los CPTs, las taxonomías se registran utilizando el hook `init` mediante la función `register_taxonomy()`. Esta función acepta tres parámetros:

1. **El slug de la taxonomía:** (Ej. `tipo_proyecto`).
2. **El tipo de post (o tipos) al que aplica:** Un string o un array indicando a qué CPT(s) se enlazará (Ej. `array('proyecto')`).
3. **El array de argumentos:** Configuración y etiquetas.

A continuación, implementaremos el código para registrar ambas taxonomías (una jerárquica y una plana) y asociarlas a nuestro CPT `proyecto`.

```php
/**
 * Registra Taxonomías para el CPT "Proyectos"
 */
function mi_tema_registrar_taxonomias_proyectos() {

    // ---------------------------------------------------------
    // 1. Taxonomía Jerárquica: "Tipos de Proyecto" (Categorías)
    // ---------------------------------------------------------
    $labels_tipo = array(
        'name'              => __( 'Tipos de Proyecto', 'mi-tema' ),
        'singular_name'     => __( 'Tipo de Proyecto', 'mi-tema' ),
        'search_items'      => __( 'Buscar Tipos', 'mi-tema' ),
        'all_items'         => __( 'Todos los Tipos', 'mi-tema' ),
        'parent_item'       => __( 'Tipo Padre', 'mi-tema' ),
        'parent_item_colon' => __( 'Tipo Padre:', 'mi-tema' ),
        'edit_item'         => __( 'Editar Tipo', 'mi-tema' ),
        'update_item'       => __( 'Actualizar Tipo', 'mi-tema' ),
        'add_new_item'      => __( 'Añadir Nuevo Tipo', 'mi-tema' ),
        'new_item_name'     => __( 'Nuevo Nombre de Tipo', 'mi-tema' ),
        'menu_name'         => __( 'Tipos', 'mi-tema' ),
    );

    $args_tipo = array(
        'hierarchical'      => true, // ESTO LA HACE JERÁRQUICA
        'labels'            => $labels_tipo,
        'show_ui'           => true,
        'show_admin_column' => true, // Muestra una columna en el listado de proyectos
        'show_in_rest'      => true, // Habilita el panel en el editor de bloques
        'rewrite'           => array( 'slug' => 'tipo-proyecto' ),
    );

    register_taxonomy( 'tipo_proyecto', array( 'proyecto' ), $args_tipo );

    // ---------------------------------------------------------
    // 2. Taxonomía Plana: "Herramientas" (Etiquetas)
    // ---------------------------------------------------------
    $labels_herramientas = array(
        'name'                       => __( 'Herramientas', 'mi-tema' ),
        'singular_name'              => __( 'Herramienta', 'mi-tema' ),
        'search_items'               => __( 'Buscar Herramientas', 'mi-tema' ),
        'popular_items'              => __( 'Herramientas Populares', 'mi-tema' ),
        'all_items'                  => __( 'Todas las Herramientas', 'mi-tema' ),
        'edit_item'                  => __( 'Editar Herramienta', 'mi-tema' ),
        'update_item'                => __( 'Actualizar Herramienta', 'mi-tema' ),
        'add_new_item'               => __( 'Añadir Nueva Herramienta', 'mi-tema' ),
        'new_item_name'              => __( 'Nombre de Nueva Herramienta', 'mi-tema' ),
        'separate_items_with_commas' => __( 'Separa las herramientas con comas', 'mi-tema' ),
        'add_or_remove_items'        => __( 'Añadir o eliminar herramientas', 'mi-tema' ),
        'choose_from_most_used'      => __( 'Elegir de las más utilizadas', 'mi-tema' ),
        'menu_name'                  => __( 'Herramientas', 'mi-tema' ),
    );

    $args_herramientas = array(
        'hierarchical'      => false, // ESTO LA HACE PLANA
        'labels'            => $labels_herramientas,
        'show_ui'           => true,
        'show_admin_column' => true,
        'show_in_rest'      => true,
        'rewrite'           => array( 'slug' => 'herramienta' ),
    );

    register_taxonomy( 'herramienta', array( 'proyecto' ), $args_herramientas );
}

add_action( 'init', 'mi_tema_registrar_taxonomias_proyectos' );

```

### Argumentos críticos en las taxonomías

Al igual que con los CPTs, el array de argumentos define el comportamiento de la taxonomía. Los más destacables en este contexto son:

* **`show_admin_column`:** Establecer esto en `true` es una de las mejores prácticas de experiencia de usuario (UX) para la administración. Añade automáticamente una columna en la tabla de listado del CPT (ej. `/wp-admin/edit.php?post_type=proyecto`) que muestra a qué términos está asignado cada post, permitiendo además el filtrado rápido.
* **`show_in_rest`:** Al igual que en los CPTs, este parámetro es no negociable en el desarrollo moderno de WordPress. Si está en `false` o no se declara, el panel de selección de la taxonomía **no aparecerá** en la barra lateral del editor de bloques (Gutenberg), forzando al usuario a usar la edición rápida clásica o a asignar los términos desde el menú lateral izquierdo.
* **`rewrite`:** Define la estructura del permalink para los archivos de la taxonomía. En el ejemplo jerárquico, navegar a `/tipo-proyecto/web/` mostrará el listado de proyectos categorizados bajo el término "Web", requiriendo una plantilla específica que abordaremos en la siguiente sección.

## 8.4 Plantillas exclusivas para CPTs

Una vez que hemos registrado nuestros Custom Post Types y Taxonomías en la base de datos a través de `functions.php`, el siguiente paso es mostrarlos correctamente en el frontend. Para ello, WordPress extiende su **Jerarquía de Plantillas (Template Hierarchy)**, introduciendo nuevos nombres de archivo que el core buscará automáticamente basándose en el slug exacto (el primer parámetro) que utilizamos en las funciones `register_post_type()` y `register_taxonomy()`.

Si no creamos estos archivos específicos, WordPress simplemente retrocederá (fallback) a las plantillas genéricas como `single.php`, `archive.php` o, en última instancia, `index.php`.

### Jerarquía para Vistas Individuales (Singular)

Cuando un usuario visita la URL de un proyecto específico (ej. `misitio.com/proyectos/rediseño-web/`), WordPress escanea la carpeta raíz de tu theme buscando la plantilla más específica posible.

```text
Ruta de carga para la vista individual del CPT "proyecto":

[1] single-proyecto.php   <-- Se busca primero. Plantilla exclusiva.
      ↓ (Si no existe)
[2] single.php            <-- Plantilla genérica para cualquier post/CPT.
      ↓ (Si no existe)
[3] singular.php          <-- Plantilla genérica para posts, CPTs y páginas.
      ↓ (Si no existe)
[4] index.php             <-- Fallback obligatorio.

```

El archivo `single-proyecto.php` utilizará el Loop estándar de WordPress exactamente igual que `single.php`. La ventaja de tener un archivo separado es poder estructurar el HTML y CSS de forma exclusiva para el portafolio (por ejemplo, mostrando la imagen destacada a pantalla completa y una barra lateral con los datos del cliente), sin afectar la vista de las entradas del blog.

### Jerarquía para Vistas de Archivo (Archive)

Para que WordPress pueda listar todos los registros de un CPT (ej. al visitar `misitio.com/proyectos/`), es indispensable que el argumento `'has_archive'` se haya establecido como `true` o como un string durante el registro del CPT.

```text
Ruta de carga para el listado general del CPT "proyecto":

[1] archive-proyecto.php  <-- Se busca primero. Listado exclusivo.
      ↓ (Si no existe)
[2] archive.php           <-- Plantilla genérica de archivos.
      ↓ (Si no existe)
[3] index.php             <-- Fallback obligatorio.

```

### Jerarquía para Taxonomías

Las taxonomías personalizadas tienen su propio árbol de enrutamiento visual. Cuando un usuario hace clic en un término, por ejemplo, el tipo de proyecto "Web" (cuya URL sería algo como `misitio.com/tipo-proyecto/web/`), WordPress buscará la plantilla adecuada para renderizar ese listado específico.

```text
Ruta de carga para la taxonomía "tipo_proyecto" (término: "web"):

[1] taxonomy-tipo_proyecto-web.php  <-- Exclusiva para el término "web".
      ↓ (Si no existe)
[2] taxonomy-tipo_proyecto.php      <-- Para cualquier término de "tipo_proyecto".
      ↓ (Si no existe)
[3] taxonomy.php                    <-- Genérica para cualquier taxonomía.
      ↓ (Si no existe)
[4] archive.php                     <-- Genérica para archivos en general.
      ↓ (Si no existe)
[5] index.php                       <-- Fallback obligatorio.

```

En la gran mayoría de los desarrollos, crear el archivo del nivel 2 (`taxonomy-tipo_proyecto.php`) es el estándar, ya que permite diseñar una cabecera dinámica que recupere y muestre el nombre y la descripción del término actual utilizando funciones como `single_term_title()` o `term_description()`.

### El Loop en plantillas de CPTs

Es crucial entender que, dentro de estos archivos específicos (como `archive-proyecto.php` o `taxonomy-tipo_proyecto.php`), **no es necesario escribir un `WP_Query` personalizado**.

Como WordPress ya ha detectado la URL y sabe exactamente qué contenido solicitó el usuario, la consulta principal (Main Query) a la base de datos ya está optimizada y ejecutada antes de cargar la plantilla. Solo necesitas usar el Loop estándar:

```php
if ( have_posts() ) : 
    while ( have_posts() ) : the_post();
        // El contexto ya es el del CPT 'proyecto'
        the_title('<h2>', '</h2>');
        the_excerpt();
    endwhile;
    
    // Paginación nativa
    the_posts_pagination();
else :
    echo '<p>No se encontraron proyectos.</p>';
endif;

```

## Resumen del capítulo

En este capítulo hemos explorado cómo expandir la arquitectura de WordPress más allá de las entradas tradicionales transformándolo en un verdadero sistema de gestión de contenidos (CMS). Comprendimos que la función `register_post_type()` nos permite crear nuevas entidades en la base de datos, siempre enganchada al hook `init`. Analizamos cómo el array de argumentos define tanto la interfaz de administración como las capacidades de seguridad, determinando quién puede publicar o editar esta información. Además, vimos cómo organizar estos nuevos contenidos mediante `register_taxonomy()`, creando jerarquías como categorías o estructuras planas como etiquetas. Finalmente, unificamos el backend con el frontend al estudiar cómo la Jerarquía de Plantillas de WordPress rutea automáticamente las URLs de nuestros CPTs y Taxonomías hacia archivos PHP específicos como `single-{post_type}.php` y `archive-{post_type}.php`.
