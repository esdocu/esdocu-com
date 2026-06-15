El corazón de todo tema de WordPress es su capacidad para consultar y mostrar contenido dinámicamente. En este capítulo, desentrañaremos el motor que hace esto posible: The Loop. Evolucionaremos desde la estructura estándar de las plantillas básicas hasta el dominio absoluto de la clase `WP_Query` para crear flujos a medida. Aprenderás a orquestar múltiples bucles en una vista sin sacrificar rendimiento, a modificar consultas nativas de forma segura mediante `pre_get_posts` y a implementar una paginación avanzada y estable. Es el momento de tomar el control total sobre los datos que renderiza tu theme.

## 7.1 Estructura estándar del Loop

El "Loop" (bucle) es el mecanismo fundamental de WordPress para iterar sobre los resultados de una consulta a la base de datos y renderizar el contenido en el frontend. Cada vez que un visitante accede a una URL, WordPress interpreta la petición, ejecuta automáticamente una consulta principal a la base de datos y determina qué archivo cargar basándose en la Jerarquía de Plantillas (vista en el Capítulo 3). El Loop es la estructura de control en PHP encargada de procesar e imprimir los datos de esa consulta principal.

En su forma más pura y estandarizada, el Loop de WordPress utiliza la sintaxis alternativa de PHP para estructuras de control (`if/endif`, `while/endwhile`). Esta convención mejora la legibilidad del código al entremezclar PHP y HTML en los archivos de plantilla.

### El código base

A continuación se presenta la estructura mínima y estándar del Loop principal:

```php
<?php
// Comprueba si hay posts en la consulta actual
if ( have_posts() ) : 

    // Inicia el bucle iterando sobre cada post
    while ( have_posts() ) : 
        
        // Configura los datos del post actual
        the_post(); 

        ?>
        <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
            <header>
                <?php the_title( '<h2>', '</h2>' ); ?>
            </header>
            
            <div class="entry-content">
                <?php the_content(); ?>
            </div>
        </article>
        <?php

    endwhile; 

else : 
    
    // Fallback: se ejecuta si la consulta no devuelve resultados
    echo '<p>Lo sentimos, no se encontró contenido que coincida con tu búsqueda.</p>';

endif; 
?>

```

### Anatomía de las funciones del Loop

El funcionamiento del Loop depende de dos funciones globales integradas en el core de WordPress que interactúan directamente con el objeto global `$wp_query`:

1. **`have_posts()`**: Esta función devuelve un valor booleano (`true` o `false`). Su propósito es verificar si existen posts disponibles para ser procesados en la consulta actual. Se utiliza en dos lugares estratégicos:

* En la declaración `if` inicial, para asegurar que existe al menos un resultado antes de procesar el HTML.
* En la condición del bucle `while`, para continuar la iteración hasta que no queden más posts.

1. **`the_post()`**: Es el motor interno del Loop y su inclusión dentro del `while` es **obligatoria**. Si omites esta función, crearás un bucle infinito que colapsará el servidor. `the_post()` realiza varias tareas críticas:

* Avanza el índice interno de la consulta actual.
* Extrae el siguiente post de la lista de resultados.
* Configura la variable global `$post` con toda la información del registro actual.
* Prepara el terreno para que los *Template Tags* funcionen correctamente.

### Flujo lógico del Loop

El siguiente diagrama ilustra cómo WordPress procesa el control de flujo durante la ejecución del Loop en cualquier vista:

```text
 [Inicio de la plantilla PHP]
              |
              v
     ¿have_posts() === true?
        /               \
      SÍ                NO
      /                   \
     v                     v
[while have_posts()]   [Bloque else] ---> Renderizar HTML de "Contenido no encontrado"
     |                                          |
     v                                          |
[the_post()]                                    |
     |                                          |
     v                                          |
[Renderizado de Template Tags]                  |
(the_title, the_content, etc.)                  |
     |                                          |
     +-------------------+                      |
                         |                      |
                         v                      v
                   [Fin del bucle] <------------+
                         |
                         v
              [Continuar ejecución PHP]

```

### El contexto global y los Template Tags

El Loop principal no necesita que le especifiques qué datos buscar; trabaja implícitamente con la consulta global generada por la URL solicitada. Gracias a que la función `the_post()` sobrescribe la variable global `$post` en cada iteración, puedes utilizar los **Template Tags** de WordPress (como `the_title()`, `the_content()`, `the_permalink()`, `the_author()`, etc.) sin tener que pasarles identificadores.

Estas funciones de plantilla están programadas para buscar automáticamente la variable global `$post` en la memoria y extraer de ella el dato correspondiente. Fuera del Loop (o sin haber ejecutado `the_post()`), la mayoría de estos Template Tags fallarán, devolverán vacío o mostrarán la información del último post que quedó en memoria.

En la siguiente sección, expandiremos este concepto rompiendo la dependencia de la URL y creando consultas completamente personalizadas utilizando el constructor de la clase abstracta detrás de esta mecánica.

## 7.2 La clase WP_Query en detalle

Mientras que el Loop estándar se ejecuta de forma automática abstrayendo la lógica de la base de datos, la clase `WP_Query` es el motor subyacente que hace posible esa magia. En el desarrollo avanzado de themes, depender exclusivamente de la consulta automática de WordPress (la consulta principal o *Main Query*) es insuficiente. Para construir portadas complejas, bloques de contenido dinámico, sistemas de posts relacionados o secciones con filtros avanzados, es indispensable dominar la instanciación y manipulación directa de `WP_Query`.

`WP_Query` es una clase de PHP orientada a objetos que encapsula la lógica de solicitud, filtrado, saneamiento y recuperación de registros de la base de datos de WordPress. Al instanciar esta clase, se genera un objeto independiente con sus propios métodos y propiedades, permitiendo ejecutar consultas paralelas sin destruir la consulta principal de la página.

### Estructura y ciclo de vida de una consulta personalizada

Para ejecutar una consulta independiente mediante `WP_Query`, se debe seguir un ciclo estricto de cuatro pasos: definición de argumentos, instanciación, iteración y restauración del contexto global.

El siguiente bloque de código representa el patrón arquitectónico estándar para implementar `WP_Query`:

```php
<?php
// 1. Definición de los criterios de selección (Argumentos)
$args = [
    'post_type'      => 'product',
    'posts_per_page' => 4,
    'post_status'    => 'publish',
    'orderby'        => 'date',
    'order'          => 'DESC',
];

// 2. Instanciación de la clase e invocación a la base de datos
$products_query = new WP_Query( $args );

// 3. El Loop personalizado utilizando los métodos del objeto
if ( $products_query->have_posts() ) : 
    while ( $products_query->have_posts() ) : 
        $products_query->the_post(); 
        
        ?>
        <div class="product-card">
            <h3><?php the_title(); ?></h3>
            <?php the_excerpt(); ?>
        </div>
        <?php

    endwhile;
else :
    echo '<p>No se encontraron productos disponibles.</p>';
endif;

// 4. Restauración crítica del estado global de la memoria
wp_reset_postdata();
?>

```

### Anatomía de la memoria y la importancia de `wp_reset_postdata()`

Cuando se invoca el método `$products_query->the_post()`, WordPress toma la variable global `$post` (que apunta al contenido de la consulta principal determinada por la URL) y la reemplaza temporalmente con los datos del post actual del bucle personalizado. Esto permite que los *Template Tags* nativos (`the_title()`, `the_permalink()`, etc.) funcionen dentro del bucle secundario.

Sin embargo, al terminar el bucle `while`, la variable global `$post` se queda apuntando al último elemento de tu consulta personalizada. Si la plantilla continúa ejecutando código más abajo (por ejemplo, renderizando comentarios o un sidebar que dependa del post original), WordPress se comportará de manera errática o romperá el diseño.

La función `wp_reset_postdata()` destruye la desviación temporal y devuelve la variable global `$post` al registro exacto que le corresponde según la consulta principal de la URL actual.

El siguiente esquema detalla el impacto de la consulta en los punteros de memoria del sistema:

```text
ESTADO ANTES DEL CUSTOM LOOP
Variable Global $post -------> [ Post Original de la Consulta Principal (URL) ]

DURANTE EL CUSTOM LOOP ($query->the_post())
Variable Global $post -------> [ Registro Actual de WP_Query Personalizada ]
                                (Cambia dinámicamente en cada iteración del while)

AL FINALIZAR EL CUSTOM LOOP (Sin restablecer)
Variable Global $post -------> [ ÚLTIMO Registro de la WP_Query Personalizada ] 
                                (Causa conflictos en funciones posteriores)

TRAS EJECUTAR wp_reset_postdata()
Variable Global $post -------> [ Post Original de la Consulta Principal (URL) ]

```

### Catálogo de argumentos esenciales

El constructor de `WP_Query` acepta un único array asociativo de parámetros. A través de este array se traduce la necesidad lógica de negocio a una consulta SQL optimizada y segura. A continuación, se analizan los grupos de parámetros más utilizados en el desarrollo profesional de themes:

#### 1. Control de Tipos de Post y Estado

Determinan qué tablas y naturalezas de contenido se van a extraer.

* `post_type` (string/array): Especifica el tipo de contenido. Puede ser un string único (`'post'`, `'page'`, o un Custom Post Type como `'portfolio'`) o un array para combinar múltiples tipos: `['post', 'event']`.
* `post_status` (string/array): Filtra el estado de moderación. Por defecto en el frontend es `'publish'`, pero en integraciones privadas o páneles de control puede requerir `'draft'`, `'pending'`, `'future'` o `'any'`.

#### 2. Paginación y Límites

* `posts_per_page` (int): Define el número máximo de elementos a recuperar. Un valor de `-1` rompe el límite y extrae todos los registros coincidentes (operación de alto riesgo para el rendimiento del servidor si la base de datos es extensa).
* `paged` (int): Especifica el número de página actual para consultas paginadas. Generalmente se alimenta de forma dinámica mediante la función `get_query_var('paged')`.
* `offset` (int): Desplaza el punto de inicio de la extracción de datos. Útil para saltarse los primeros *N* posts (por ejemplo, si el primer post ya se muestra en un diseño destacado superior).

#### 3. Consultas de Taxonomías Relacionales (`tax_query`)

Permite filtrar contenidos basados en taxonomías jerárquicas (categorías) o planas (etiquetas). Utiliza un array multidimensional para construir lógicas relacionales complejas (`AND` / `OR`).

```php
$args = [
    'post_type' => 'post',
    'tax_query' => [
        'relation' => 'AND', // Relación lógica entre los subarrays
        [
            'taxonomy' => 'category',
            'field'    => 'slug',
            'terms'    => ['tecnologia', 'ciencia'],
            'operator' => 'IN',
        ],
        [
            'taxonomy' => 'post_tag',
            'field'    => 'term_id',
            'terms'    => [12, 15],
            'operator' => 'NOT IN',
        ],
    ],
];

```

#### 4. Consultas de Metadatos (`meta_query`)

Inspecciona los campos personalizados almacenados en la tabla `wp_postmeta`. Al igual que `tax_query`, soporta anidación lógica y es altamente configurable, aunque computacionalmente más costosa para el motor de la base de datos.

```php
$args = [
    'post_type'  => 'event',
    'meta_query' => [
        'relation' => 'AND',
        [
            'key'     => 'event_date',
            'value'   => date( 'Y-m-d' ),
            'compare' => '>=',
            'type'    => 'DATE',
        ],
        [
            'key'     => 'is_featured',
            'value'   => '1',
            'compare' => '=',
        ],
    ],
];

```

### Propiedades internas de control

Al instanciar `WP_Query`, el objeto resultante contiene metadatos sobre la consulta que son críticos para construir elementos de interfaz como bloques de paginación o contadores de resultados. Las propiedades públicas más relevantes son:

* `$query->found_posts`: Almacena el número total de posts que coinciden con los argumentos pasados, ignorando las restricciones de límite de `posts_per_page`. Es el dato que utiliza WordPress para calcular cuántas páginas existen en total.
* `$query->max_num_pages`: Es el resultado de dividir `$found_posts` entre `posts_per_page` (redondeado hacia arriba). Indica el número total de páginas disponibles y es indispensable para controlar cuándo mostrar u ocultar los botones de "Siguiente" o "Anterior".
* `$query->post_count`: El número de posts que se están recuperando e iterando en la página actual. Nunca será mayor que `posts_per_page`.
* `$query->current_post`: Un índice numérico entero que arranca en `-1` y se incrementa en cada iteración del bucle. Permite inyectar clases CSS condicionales o anuncios publicitarios basados en la posición exacta del post (por ejemplo: agregar una clase especial solo al tercer post de la lista).

### Buenas prácticas y optimización de rendimiento

Cada instancia de `WP_Query` ejecuta consultas SQL directas a la base de datos. Un theme mal estructurado con múltiples instancias de `WP_Query` anidadas o ineficientes ralentizará drásticamente la velocidad de carga del sitio.

1. **Evitar consultas pesadas de orden aleatorio:** El argumento `'orderby' => 'rand'` obliga a MySQL a crear una tabla temporal en memoria y asignar un número aleatorio a cada fila de la base de datos antes de ordenarlos. En sitios con miles de posts, esto genera un cuello de botella crítico.
2. **Desactivar cálculos innecesarios:** Si la consulta que estás realizando no requiere paginación (por ejemplo, un widget lateral que solo muestra de forma estática los últimos 5 artículos), puedes desactivar el cálculo del total de posts añadiendo `'no_found_rows' => true` al array de argumentos. Esto le indica a MySQL que omita la instrucción `SQL_CALC_FOUND_ROWS`, acelerando la ejecución de la consulta a la mitad del tiempo estándar.
3. **Suprimir la caché de metadatos y términos:** Si el bloque de código de tu custom loop solo va a imprimir el título y el enlace permanente del post, y no consumirá categorías ni campos personalizados, añade al array de argumentos `'update_post_meta_cache' => false` y `'update_post_term_cache' => false`. Esto reduce el número de subconsultas a las tablas relacionales de la base de datos.

## 7.3 Múltiples Loops en una sola vista

En el desarrollo profesional de themes, especialmente al diseñar portadas de estilo revista (*magazine layouts*), páginas de inicio corporativas o paneles de usuario, la estructura de un único bucle resulta insuficiente. Con frecuencia se requiere renderizar diferentes bloques de contenido independientes en la misma plantilla: por ejemplo, un área destacada superior con el último artículo publicado, un carrusel lateral con los posts más leídos y un listado general paginado en la zona central.

Para resolver estas necesidades arquitectónicas, WordPress permite la coexistencia de múltiples Loops en una misma vista. Dependiendo de si se desea mostrar el mismo conjunto de datos con diferentes diseños o si se requieren consultas totalmente independientes a la base de datos, se deben aplicar diferentes estrategias de control de flujo y gestión de memoria.

### Estrategia 1: Reutilizar la consulta principal con `rewind_posts()`

Existen escenarios donde no es necesario realizar una nueva consulta a la base de datos, sino simplemente iterar por segunda vez sobre los mismos posts que WordPress ya recuperó de forma automática para la URL actual. Un ejemplo clásico es una plantilla que requiere listar primero los títulos de todos los artículos a modo de índice o tabla de contenidos, y más abajo mostrar los artículos completos con sus respectivos extractos e imágenes.

Si se ejecuta un Loop estándar, el puntero interno de la consulta avanza hasta llegar al último elemento. Si se intenta abrir un segundo `while ( have_posts() )` inmediatamente después, la condición devolverá `false` porque el puntero ya llegó al final de la lista. Para solucionar esto sin sobrecargar el servidor con una nueva petición SQL, se utiliza la función `rewind_posts()`.

Esta función restablece el contador y el puntero del objeto global de la consulta principal, permitiendo iniciar un segundo bucle limpio sobre el mismo set de datos.

```php
<?php
// PRIMER LOOP: Renderiza únicamente el índice de títulos
if ( have_posts() ) : ?>
    <ul class="indice-articulos">
        <?php while ( have_posts() ) : the_post(); ?>
            <li><a href="#post-<?php the_ID(); ?>"><?php the_title(); ?></a></li>
        <?php endwhile; ?>
    </ul>
    <?php

    // Restablece el puntero de la consulta principal al inicio
    rewind_posts();

    // SEGUNDO LOOP: Renderiza el contenido completo de los mismos posts
    while ( have_posts() ) : the_post(); ?>
        <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
            <h2><?php the_title(); ?></h2>
            <div><?php the_content(); ?></div>
        </article>
    <?php endwhile;

endif;
?>

```

*Nota: Si estás trabajando con un objeto personalizado de `WP_Query` en lugar de la consulta principal, el método se invoca directamente sobre dicha instancia: `$mi_consulta->rewind_posts();`.*

### Estrategia 2: Bucles independientes concurrentes con `WP_Query`

El escenario más común es la combinación de diferentes fuentes de datos en una misma vista. Para esto, se instancian múltiples objetos independientes de `WP_Query`. Cada uno ejecutará su propia sentencia SQL y mantendrá su propio control de bucle de forma aislada.

Al implementar este enfoque, el factor crítico de éxito es el orden de limpieza de la memoria global mediante `wp_reset_postdata()`. Cada bucle secundario que utilice el método `the_post()` modificará la variable global `$post`, por lo que debe ser restaurada inmediatamente al cerrar su respectivo ciclo `while`.

### El problema de la duplicación de contenido

Cuando se configuran múltiples Loops en una página (por ejemplo, un post destacado arriba y un listado general abajo), es muy probable que el post que aparece en la sección destacada vuelva a aparecer como el primer elemento del listado general. Esta duplicación afecta negativamente a la experiencia de usuario y la estética del theme.

Para evitarlo de forma segura y eficiente dentro de una misma vista, se implementa una técnica de control por asignación de identificadores. Consiste en almacenar el ID del post o posts procesados en el primer Loop dentro de un array de exclusión, para luego pasar dicho array como argumento al segundo Loop mediante el parámetro `post__not_in`.

### Arquitectura de flujo de datos en vistas Multi-Loop

El siguiente diagrama plano describe cómo interactúan los Loops concurrentes y cómo el array de exclusión previene la duplicación de registros en el frontend:

```text
[Inicio de la Plantilla]
       |
       v
[LOOP MULTI-LOOP: Sección Destacada]
       |---> Instancia: $query_destacado = new WP_Query( 'posts_per_page' => 1 )
       |---> Iteración del Post Destacado (ID: 45)
       |---> Operación: Guardar ID en array de control ($excluidos[] = 45)
       |---> Limpieza: wp_reset_postdata()
       |
       v
[Matriz de Exclusión] ---> Contiene: array( 45 )
       |
       v
[LOOP SECUNDARIO: Listado General]
       |---> Argumentos incorporan: 'post__not_in' => $excluidos
       |---> Instancia: $query_general = new WP_Query( ... )
       |---> Consulta SQL añade de forma automática: WHERE ID NOT IN (45)
       |---> Iteración segura de posts restantes (IDs: 44, 43, 42...)
       |---> Limpieza: wp_reset_postdata()
       |
       v
[Fin de la Plantilla]

```

### Ejemplo práctico: Estructura de portada estilo Magazine

A continuación se detalla la implementación en código de una portada compleja que integra un post destacado de una categoría específica (`'noticias'`) y una rejilla secundaria con los últimos cuatro posts del sitio, garantizando que el post destacado no se repita en la rejilla.

```php
<?php
/**
 * Plantilla de ejemplo para una estructura de portada con múltiples loops
 */

// Inicializamos el array que guardará los IDs que no queremos duplicar
$posts_ya_mostrados = [];

// ==========================================
// 1. PRIMER LOOP: Artículo Destacado
// ==========================================
$args_destacado = [
    'category_name'  => 'noticias',
    'posts_per_page' => 1,
    'post_status'    => 'publish',
];

$query_destacado = new WP_Query( $args_destacado );

if ( $query_destacado->have_posts() ) :
    while ( $query_destacado->have_posts() ) : $query_destacado->the_post();
        
        // Almacenamos el ID del post actual para excluirlo en la siguiente consulta
        $posts_ya_mostrados[] = get_the_ID();
        
        ?>
        <section class="bloque-destacado">
            <span class="etiqueta">Destacado</span>
            <h1><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h1>
            <div class="extracto-grande">
                <?php the_excerpt(); ?>
            </div>
        </section>
        <?php

    endwhile;
    // Restauramos el post global antes de iniciar el siguiente bloque
    wp_reset_postdata();
endif;


// ==========================================
// 2. SEGUNDO LOOP: Rejilla de Últimas Novedades
// ==========================================
$args_rejilla = [
    'post_type'      => 'post',
    'posts_per_page' => 4,
    'post_status'    => 'publish',
    // Pasamos el array de IDs excluidos de forma dinámica
    'post__not_in'   => $posts_ya_mostrados,
];

$query_rejilla = new WP_Query( $args_rejilla );

if ( $query_rejilla->have_posts() ) : ?>
    <section class="rejilla-novedades">
        <h2>Últimas publicaciones</h2>
        <div class="contenedor-grid">
            <?php 
            while ( $query_rejilla->have_posts() ) : $query_rejilla->the_post(); 
                ?>
                <article class="tarjeta-post">
                    <h3><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
                    <div class="meta-datos">
                        <time><?php echo get_the_date(); ?></time>
                    </div>
                </article>
                <?php 
            endwhile; 
            ?>
        </div>
    </section>
    <?php
    // Restauramos nuevamente el post global
    wp_reset_postdata();
else :
    echo '<p>No hay más publicaciones disponibles en este momento.</p>';
endif;
?>

```

### Impacto en el rendimiento y alternativas arquitectónicas

Cada vez que ejecutas un `new WP_Query`, estás forzando a WordPress a realizar una consulta de lectura a la base de datos MySQL. En el ejemplo anterior, la página realiza dos consultas completas para renderizar el contenido.

Si bien este enfoque es perfectamente válido y es el estándar de la industria para layouts asimétricos (donde las consultas extraen datos de diferentes categorías o tipos de post), no debe abusarse de él. Si necesitas realizar más de 3 o 4 Loops independientes en una misma vista, considera estructurar la persistencia de datos utilizando la **Transient API** (analizada a fondo en el Capítulo 17) para almacenar el output HTML o el resultado del objeto en la memoria caché del servidor y evitar consultas redundantes en cada recarga de página.

## 7.4 Modificar consulta con pre_get_posts

En el desarrollo de themes, un error arquitectónico extremadamente común es intentar alterar el comportamiento de las páginas de archivo o la portada instanciando un nuevo objeto `WP_Query` directamente en la plantilla (por ejemplo, en `category.php` o `index.php`).

Hacer esto significa que WordPress ya ha ejecutado una consulta principal a la base de datos basándose en la URL, ha consumido memoria, y tú estás descartando ese trabajo para ejecutar *otra* consulta SQL desde cero. Para alterar la consulta principal (Main Query) de forma nativa, eficiente y sin duplicar peticiones al servidor, WordPress ofrece el action hook `pre_get_posts`.

### El ciclo de vida de la consulta principal

Para entender el poder de `pre_get_posts`, es vital visualizar en qué momento exacto del ciclo de carga de WordPress se ejecuta este hook. Ocurre *después* de que WordPress ha traducido la URL en variables de consulta, pero una fracción de segundo *antes* de que esas variables se conviertan en una petición SQL a la base de datos.

```text
[1. URL Solicitada] (ej: /categoria/noticias/)
         |
         v
[2. Parseo de la petición] (WP identifica que es una categoría)
         |
         v
[3. Creación del objeto WP_Query] (Se configuran las variables preliminares)
         |
         +-------------------------------------------+
         |                                           |
         v                                           v
[4. HOOK: pre_get_posts] <---- ¡Tu código intercepta el objeto aquí!
         |                                           |
         +-------------------------------------------+
         |
         v
[5. Ejecución de la consulta SQL] (Se contacta a la base de datos)
         |
         v
[6. Jerarquía de Plantillas] (Se carga category.php)
         |
         v
[7. El Loop Estándar] (Renderizado del contenido)

```

Al engancharnos en el paso 4, actuamos como un filtro de aduana: interceptamos el objeto `$query` por referencia, modificamos sus parámetros internos utilizando sus propios métodos, y dejamos que siga su camino natural hacia la base de datos.

### El "Escudo de Oro": Protegiendo el ecosistema

Dado que `pre_get_posts` se dispara en **todas** las consultas que realiza WordPress (incluyendo las consultas para generar los menús de navegación, los widgets del sidebar y los listados del panel de administración), es peligrosamente fácil romper todo el sitio si no se imponen límites estrictos.

Toda función conectada a este hook debe comenzar invariablemente con dos comprobaciones de seguridad:

1. **`is_admin()`**: Evita que tus modificaciones alteren las consultas del backend. (Si omites esto y filtras para que solo se vean 3 posts, el panel de administración de WordPress también mostrará solo 3 posts en la tabla de edición).
2. **`$query->is_main_query()`**: Asegura que solo estás alterando la consulta principal de la página, y no las consultas secundarias de widgets o menús.

### Estructura de código y métodos principales

El objeto `$query` se pasa a la función por referencia. Para manipularlo, utilizamos principalmente el método `$query->set( 'parametro', 'valor' )`, el cual acepta exactamente los mismos argumentos que vimos en el constructor de `WP_Query` en la sección 7.2.

A continuación, se muestra el patrón estándar implementado en el archivo `functions.php` del theme:

```php
<?php
add_action( 'pre_get_posts', 'mi_tema_modificar_consulta_principal' );

function mi_tema_modificar_consulta_principal( $query ) {
    
    // 1. EL ESCUDO: Si estamos en el panel de control o NO es la consulta principal, abortar.
    if ( is_admin() || ! $query->is_main_query() ) {
        return;
    }

    // 2. LA CONDICIÓN: Identificar la vista específica usando Conditional Tags
    if ( $query->is_home() ) {
        
        // 3. LA MODIFICACIÓN: Alterar los parámetros de la consulta
        // Ejemplo: Excluir la categoría con ID 5 de la página de inicio del blog
        $query->set( 'cat', '-5' );
        
    }
}
?>

```

### Casos de uso frecuentes en el desarrollo de Themes

El uso de `pre_get_posts` es la solución canónica para múltiples requerimientos comunes que, de otra forma, requerirían plantillas complejas y consultas ineficientes.

#### 1. Alterar la cantidad de posts en archivos específicos

WordPress tiene un ajuste global en `Ajustes > Lectura` que define cuántas entradas mostrar por página. Sin embargo, un diseño a menudo requiere que el blog muestre 10 entradas, pero el archivo de un Custom Post Type (como "Portfolio") muestre 12 para completar una rejilla CSS perfecta de 4x3.

```php
add_action( 'pre_get_posts', 'mi_tema_posts_por_pagina_portfolio' );
function mi_tema_posts_por_pagina_portfolio( $query ) {
    if ( ! is_admin() && $query->is_main_query() && $query->is_post_type_archive( 'portfolio' ) ) {
        $query->set( 'posts_per_page', 12 );
    }
}

```

#### 2. Incluir Custom Post Types en los resultados de búsqueda

Por defecto, el motor de búsqueda nativo de WordPress solo busca dentro del post type `post` y `page`. Si has creado un tipo de contenido personalizado (ej. `producto`), los usuarios no lo encontrarán usando la caja de búsqueda estándar.

```php
add_action( 'pre_get_posts', 'mi_tema_expandir_busqueda' );
function mi_tema_expandir_busqueda( $query ) {
    if ( ! is_admin() && $query->is_main_query() && $query->is_search() ) {
        // Obtenemos los post types actuales (si los hay) y forzamos un array
        $post_types = $query->get( 'post_type' );
        
        if ( empty( $post_types ) ) {
            $post_types = ['post', 'page', 'producto'];
        } elseif ( is_string( $post_types ) ) {
            $post_types = [$post_types, 'producto'];
        } elseif ( is_array( $post_types ) ) {
            $post_types[] = 'producto';
        }

        $query->set( 'post_type', $post_types );
    }
}

```

#### 3. Ordenamiento alfabético en taxonomías personalizadas

Para un directorio o glosario, el orden cronológico inverso (el predeterminado en WordPress) no tiene sentido. Podemos forzar un orden alfabético ascendente en una taxonomía específica antes de que la plantilla se cargue.

```php
add_action( 'pre_get_posts', 'mi_tema_ordenar_glosario' );
function mi_tema_ordenar_glosario( $query ) {
    if ( ! is_admin() && $query->is_main_query() && $query->is_tax( 'letra_glosario' ) ) {
        $query->set( 'orderby', 'title' );
        $query->set( 'order', 'ASC' );
    }
}

```

Al dominar `pre_get_posts`, delegas el trabajo pesado al motor nativo de WordPress, manteniendo tus archivos de plantilla (`archive.php`, `search.php`, etc.) limpios. Estas plantillas solo contendrán el Loop estándar (Sección 7.1), procesando de forma transparente los resultados que interceptaste y preparaste desde el archivo `functions.php`.

## 7.5 Paginación avanzada en WP_Query

La paginación es uno de los componentes más propensos a errores en el desarrollo de themes. Cuando WordPress ejecuta la consulta principal (Main Query), la paginación funciona de manera automática porque el motor interno lee la URL (por ejemplo, `/blog/page/2/`), calcula el desplazamiento de los posts y renderiza los resultados correctos. Sin embargo, cuando instancias un objeto `WP_Query` personalizado (como vimos en las secciones 7.2 y 7.3), este automatismo desaparece.

Si creas un bucle secundario sin configurar explícitamente la paginación, el objeto `WP_Query` siempre mostrará la primera página de resultados, independientemente de lo que indique la URL. Para solucionar esto, debes conectar manualmente las variables de la URL con los argumentos de tu consulta y proporcionarle a las funciones de renderizado el contexto sobre el total de páginas disponibles.

### 1. Capturar la variable de paginación de la URL

El primer paso es averiguar en qué página se encuentra el usuario actualmente. WordPress almacena esta información en sus variables de consulta globales. Para extraerla de forma segura, utilizamos la función `get_query_var()`.

Existe una particularidad arquitectónica importante en WordPress respecto a esta variable:

* Si estás en un archivo estándar (como `archive.php`, `category.php` o `index.php`), la variable de la URL se llama `paged`.
* Si estás ejecutando la consulta en una página estática (creada en "Páginas" y asignada como portada o plantilla personalizada), la variable suele llamarse `page`.

El siguiente bloque de código es el estándar de la industria para resolver esta dualidad y obtener un número entero confiable:

```php
<?php
// Obtenemos la página actual. Si no existe, forzamos el valor a 1.
$paged = ( get_query_var( 'paged' ) ) ? get_query_var( 'paged' ) : 1;

// Si estamos en una plantilla de página estática, validamos también 'page'
if ( is_front_page() || is_page_template() ) {
    $paged = ( get_query_var( 'page' ) ) ? get_query_var( 'page' ) : $paged;
}
?>

```

### 2. Inyectar la variable en WP_Query

Una vez capturado el número de página actual, debes pasarlo al array de argumentos de tu instancia de `WP_Query` utilizando el parámetro `paged`.

```php
<?php
$args = [
    'post_type'      => 'portfolio',
    'posts_per_page' => 9,
    'paged'          => $paged, // Inyectamos la variable dinámica aquí
];

$portfolio_query = new WP_Query( $args );
?>

```

Al recibir este parámetro, MySQL calculará internamente el argumento `OFFSET` multiplicando `(paged - 1) * posts_per_page`. Es decir, si el usuario está en la página 3 y muestras 9 posts por página, MySQL saltará los primeros 18 registros y comenzará a devolver a partir del post número 19.

### 3. Renderizar los enlaces de paginación

Para mostrar los números de página en el frontend, la función más versátil y moderna es `paginate_links()`. Por defecto, esta función busca la propiedad `max_num_pages` en la consulta principal global. Como estamos usando una consulta personalizada, la función no generará nada a menos que le especifiquemos explícitamente cuál es el total de páginas de nuestra instancia.

Aquí es donde entra en juego la propiedad pública `$portfolio_query->max_num_pages` que analizamos en la sección 7.2.

```text
[URL: /portfolio/page/2/]
          |
          v
[1. get_query_var('paged') extrae el valor '2']
          |
          v
[2. WP_Query recibe 'paged' => 2 y extrae datos] ----> [Renderizado de los 9 posts del bucle]
          |                                                       |
          +-------------------------------------------------------+
          |
          v
[3. paginate_links() requiere saber el total de páginas]
          |
          +---> Se inyecta $portfolio_query->max_num_pages
          |
          v
[Generación HTML: < 1 [2] 3 4 > ]

```

### Implementación completa y segura

A continuación, se muestra el bloque de código completo que une todos estos conceptos en una plantilla personalizada, asegurando que la paginación funcione correctamente y la memoria se libere al final.

```php
<?php
// 1. Capturar la página actual
$paged = ( get_query_var( 'paged' ) ) ? get_query_var( 'paged' ) : 1;

// 2. Definir argumentos e instanciar WP_Query
$args = [
    'post_type'      => 'portfolio',
    'posts_per_page' => 9,
    'paged'          => $paged,
];

$portfolio_query = new WP_Query( $args );

// 3. Iniciar el Loop
if ( $portfolio_query->have_posts() ) : 
    
    echo '<div class="portfolio-grid">';
    while ( $portfolio_query->have_posts() ) : $portfolio_query->the_post();
        ?>
        <article class="portfolio-item">
            <h3><?php the_title(); ?></h3>
            <a href="<?php the_permalink(); ?>">Ver proyecto</a>
        </article>
        <?php
    endwhile;
    echo '</div>';

    // 4. Configurar y renderizar la paginación numérica
    $pagination_args = [
        'total'     => $portfolio_query->max_num_pages, // Crucial para custom queries
        'current'   => $paged,
        'prev_text' => '&laquo; Anterior',
        'next_text' => 'Siguiente &raquo;',
    ];

    echo '<nav class="paginacion-custom">';
    echo paginate_links( $pagination_args );
    echo '</nav>';

else :
    echo '<p>No hay proyectos en el portafolio en este momento.</p>';
endif;

// 5. Restaurar el contexto global
wp_reset_postdata();
?>

```

### El temido error 404 en paginaciones personalizadas

Un problema clásico que encontrarás al paginar consultas secundarias es que, al hacer clic en la "Página 2", WordPress devuelve una plantilla de error 404 ("Página no encontrada").

Esto ocurre por un conflicto con la consulta principal oculta de WordPress. Supongamos que tu blog tiene solo 5 entradas en total, pero en tu página de inicio (una página estática) has instanciado un `WP_Query` personalizado que extrae 50 proyectos del portafolio paginados de 10 en 10.

Cuando el usuario hace clic en la página 2 de tu portafolio, la URL se convierte en `tusitio.com/page/2/`. WordPress interpreta esa URL antes de cargar tu plantilla y ejecuta su consulta principal (buscando entradas de blog). Como solo hay 5 entradas de blog, determina que la "página 2 del blog" no existe y dispara un error 404, deteniendo la ejecución *antes* de que tu plantilla y tu `WP_Query` personalizado tengan la oportunidad de ejecutarse.

**Cómo solucionar esto:**

1. **Ajustes de lectura:** Asegúrate de que en `Ajustes > Lectura`, el "Número máximo de entradas a mostrar en el sitio" sea menor o igual al `posts_per_page` de tu consulta personalizada.
2. **Uso de `pre_get_posts`:** Como vimos en la sección 7.4, si estás intentando reemplazar el contenido principal de una vista, la solución correcta a nivel arquitectónico no es hacer un `WP_Query` con paginación avanzada, sino engancharte a `pre_get_posts` para alterar la consulta nativa. Reserva la paginación de custom queries solo para plantillas de página aisladas (`page-templates`) donde la consulta principal simplemente carga el título de la página y no entra en conflicto numérico con los registros de la base de datos.

## Resumen del capítulo

* **Estructura del Loop:** El Loop es el corazón de WordPress. Funciona interactuando implícitamente con la consulta principal y la variable global `$post` mediante las funciones `have_posts()` y `the_post()`.
* **La clase WP_Query:** Permite crear consultas independientes a la base de datos. Requiere configuración explícita de argumentos y es obligatorio usar `wp_reset_postdata()` al finalizar para evitar la corrupción de la memoria global.
* **Múltiples Loops:** Puedes reciclar la consulta principal usando `rewind_posts()` o instanciar varias consultas `WP_Query` en una misma plantilla. Se utilizan arrays de exclusión (`post__not_in`) para evitar que el contenido se duplique entre diferentes secciones de una misma vista.
* **Alteración nativa:** Evita crear objetos `WP_Query` nuevos en páginas de archivo. Utiliza el action hook `pre_get_posts` para interceptar y modificar la consulta principal antes de que llegue a la base de datos, mejorando drásticamente el rendimiento.
* **Paginación manual:** Los loops personalizados no se paginan solos. Requieren capturar la variable de URL con `get_query_var( 'paged' )`, pasarla a los argumentos y definir explícitamente la propiedad `max_num_pages` al utilizar funciones de renderizado como `paginate_links()`.
