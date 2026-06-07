En el desarrollo de plugins para WordPress, interactuar dinámicamente con el contenido del usuario es esencial. Históricamente, esta flexibilidad se obtenía mediante la Shortcode API, inyectando lógica compleja a través de macros entre corchetes procesadas por el servidor. Sin embargo, la llegada del editor Gutenberg exigió un cambio de paradigma: la transición hacia interfaces de bloques visuales estructuradas.

Este capítulo traza esa evolución técnica. Aprenderás a dominar los shortcodes clásicos, manejar atributos y anidamientos de forma segura y, finalmente, darás el salto arquitectónico para construir e integrar bloques dinámicos nativos.

## 8.1 La Shortcode API en profundidad

La Shortcode API, introducida en WordPress 2.5, proporciona un mecanismo robusto para crear macros dentro del contenido administrado por el usuario. Aunque el ecosistema de WordPress se está moviendo hacia los bloques de Gutenberg (como veremos más adelante en este capítulo), los shortcodes siguen siendo una herramienta fundamental debido a su simplicidad, retrocompatibilidad y utilidad en áreas donde el editor de bloques no está disponible (como widgets de texto heredados o campos personalizados).

A nivel arquitectónico, un shortcode no es más que una etiqueta entre corchetes (por ejemplo, `[mi_etiqueta]`) que el motor de WordPress intercepta y reemplaza por código HTML o contenido dinámico generado por una función de retorno (callback) escrita en PHP.

### La mecánica interna: Expresiones regulares y el filtro `the_content`

Para comprender la Shortcode API en profundidad, es vital entender cómo procesa WordPress estas etiquetas. El núcleo de WordPress no analiza la base de datos en busca de shortcodes al guardar un post. El procesamiento ocurre exclusivamente en tiempo de ejecución (front-end) cuando el contenido se prepara para ser mostrado.

El flujo de procesamiento sigue este ciclo:

```text
+---------------------+
| Contenido Bruto     | (Almacenado en wp_posts, contiene '[mi_shortcode]')
+---------------------+
           |
           v
+---------------------+
| Filtro: the_content | (Aplicado mediante apply_filters('the_content', $content))
+---------------------+
           |
           v
+---------------------+
| Función interna     | (WP llama a do_shortcode($content))
+---------------------+
           |
           v
+---------------------+
| Procesamiento Regex | (get_shortcode_regex() busca coincidencias)
+---------------------+
           |
           v
+---------------------+
| Ejecución Callback  | (Se invoca la función asociada al shortcode)
+---------------------+
           |
           v
+---------------------+
| Contenido Renderizado| (El corchete se reemplaza por el valor retornado)
+---------------------+

```

La función `do_shortcode()` es el motor principal. Utiliza una expresión regular altamente compleja (generada por `get_shortcode_regex()`) para identificar etiquetas registradas, ignorando aquellas que están escapadas (ej. `[[mi_shortcode]]`) o contenidas dentro de etiquetas HTML `<pre>` o `<code>`.

### Registro y la variable global `$shortcode_tags`

Cuando registras un shortcode, WordPress simplemente añade un nuevo elemento a un array asociativo global llamado `$shortcode_tags`. El registro se realiza mediante la función `add_shortcode()`.

```php
/**
 * Registra el shortcode [saludo_basico]
 */
function mi_plugin_registrar_shortcodes() {
    add_shortcode( 'saludo_basico', 'mi_plugin_renderizar_saludo' );
}
// Se recomienda registrar los shortcodes en el hook 'init'
add_action( 'init', 'mi_plugin_registrar_shortcodes' );

```

La API también provee funciones de control y mantenimiento sobre este array global:

* `remove_shortcode( $tag )`: Elimina un shortcode específico.
* `remove_all_shortcodes()`: Vacía el array global (útil para limpiezas profundas o entornos de testing).
* `shortcode_exists( $tag )`: Comprueba si una etiqueta ya está registrada, previniendo colisiones de nombres con otros plugins.

### La anatomía de la función Callback

La función callback responsable de procesar el shortcode siempre recibe tres parámetros pasados por el núcleo de WordPress, sin importar si el usuario los utilizó o no:

1. **`$atts` (array | string):** Un array asociativo de atributos definidos por el usuario, o un string vacío si no se definieron. Profundizaremos en su sanitización e iteración en la próxima sección.
2. **`$content` (string | null):** El contenido encerrado entre la etiqueta de apertura y cierre (si el shortcode es del tipo envolvente, ej. `[etiqueta]Contenido[/etiqueta]`). Será `null` en shortcodes auto-cerrados.
3. **`$tag` (string):** El nombre del shortcode que invocó el callback. Útil si utilizas una misma función callback para múltiples shortcodes similares.

### El mandamiento absoluto: Retornar, nunca imprimir

El error más común y destructivo al desarrollar shortcodes es utilizar construcciones de salida directa como `echo`, `print` o `var_dump` dentro de la función callback.

Debido a que los shortcodes son procesados en medio de la ejecución del filtro `the_content` (o mediante llamadas manuales a `do_shortcode()`), cualquier salida directa se imprimirá prematuramente en el flujo de ejecución de PHP. Esto causa que el contenido del shortcode aparezca en la parte superior de la página o fuera de su contenedor HTML previsto, rompiendo el diseño por completo.

Un callback de shortcode **siempre debe devolver (return)** un string.

**Forma incorrecta (Romperá el layout):**

```php
function mi_plugin_shortcode_incorrecto() {
    echo '<div class="alerta">Esto es un error grave.</div>'; 
    // FAlta la instrucción return
}

```

**Forma correcta (Concatenación simple):**

```php
function mi_plugin_shortcode_correcto() {
    return '<div class="alerta">Este contenido se renderizará en su lugar correcto.</div>';
}

```

### Manejo de HTML complejo: Búfer de salida (Output Buffering)

Concatenar strings es suficiente para shortcodes simples, pero cuando se requiere renderizar plantillas HTML complejas, formularios o vistas que requieren lógica condicional extensa, la concatenación de strings en PHP se vuelve propensa a errores y difícil de mantener.

La solución estándar y profesional dentro de la Shortcode API es el uso de las funciones de control de búfer de salida de PHP (`ob_start` y `ob_get_clean`).

```php
function mi_plugin_shortcode_avanzado( $atts, $content = null ) {
    // 1. Iniciar el almacenamiento en el búfer
    ob_start(); 
    
    // A partir de aquí, se puede usar HTML puro o requerir archivos de plantilla
    ?>
    <div class="mi-plugin-contenedor">
        <h3>Información del Sistema</h3>
        <ul>
            <li>Versión PHP: <?php echo phpversion(); ?></li>
            <li>Directorio: <?php echo plugin_dir_path( __FILE__ ); ?></li>
        </ul>
        <?php if ( current_user_can( 'manage_options' ) ) : ?>
            <p>Mensaje visible solo para administradores.</p>
        <?php endif; ?>
    </div>
    <?php
    // Se podría usar un include para mayor limpieza:
    // include plugin_dir_path( __FILE__ ) . 'views/vista-shortcode.php';
    
    // 2. Capturar el contenido del búfer, limpiarlo y retornarlo
    return ob_get_clean(); 
}
add_shortcode( 'info_sistema', 'mi_plugin_shortcode_avanzado' );

```

El uso de `ob_start()` captura cualquier `echo` o HTML directo en memoria en lugar de enviarlo al navegador. `ob_get_clean()` devuelve el contenido capturado como un único string y apaga el búfer, permitiendo cumplir con el requisito de la Shortcode API de retornar el resultado manteniendo el código legible e integrando vistas complejas sin esfuerzo.

## 8.2 Shortcodes anidados y atributos

La verdadera potencia de la Shortcode API reside en su capacidad para recibir parámetros dinámicos y procesar jerarquías de contenido. Un shortcode estático, como vimos en la sección anterior, tiene una utilidad limitada. Al implementar atributos y permitir la anidación, transformamos etiquetas simples en componentes estructurales complejos y reutilizables.

### Gestión de Atributos: La función `shortcode_atts()`

Cuando un usuario añade parámetros a un shortcode en el editor (por ejemplo, `[boton color="rojo" url="https://ejemplo.com"]`), WordPress pasa esta información a la función callback a través del primer parámetro, comúnmente llamado `$atts`.

Sin embargo, los usuarios pueden omitir atributos, cometer errores tipográficos o inyectar parámetros no deseados. Para manejar esto de forma estandarizada y segura, WordPress proporciona la función `shortcode_atts()`.

Esta función actúa como un filtro combinado: define valores predeterminados, fusiona los atributos ingresados por el usuario y descarta cualquier atributo que no esté explícitamente definido en tus valores por defecto.

```php
/**
 * Shortcode de botón con atributos
 * Uso: [mi_boton url="https://wp.org" color="verde"]Haz clic[/mi_boton]
 */
function mi_plugin_shortcode_boton( $atts, $content = null ) {
    // 1. Definir atributos por defecto y fusionar con los del usuario
    $atributos_limpios = shortcode_atts( 
        array(
            'url'   => '#',
            'color' => 'azul',
            'size'  => 'normal'
        ), 
        $atts, 
        'mi_boton' // El tercer parámetro habilita el filtro 'shortcode_atts_mi_boton'
    );

    // 2. Sanitizar y escapar SIEMPRE los datos antes de la salida
    $url_segura   = esc_url( $atributos_limpios['url'] );
    $color_seguro = sanitize_html_class( $atributos_limpios['color'] );
    $size_seguro  = sanitize_html_class( $atributos_limpios['size'] );
    
    // Si no hay contenido, asignamos un texto por defecto
    $texto = $content ? esc_html( $content ) : __( 'Botón', 'mi-plugin' );

    // 3. Retornar el HTML formateado
    return sprintf( 
        '<a href="%1$s" class="btn btn-%2$s btn-%3$s">%4$s</a>', 
        $url_segura, 
        $color_seguro, 
        $size_seguro, 
        $texto 
    );
}
add_shortcode( 'mi_boton', 'mi_plugin_shortcode_boton' );

```

**Nota crítica de seguridad:** `shortcode_atts()` asegura que solo existan las claves que tú definiste, pero **no sanitiza los valores**. Si un usuario inserta `url="javascript:alert('XSS')"`, la función lo dejará pasar. Siempre debes escapar las variables devueltas por `shortcode_atts()` justo antes de imprimirlas o integrarlas en tu HTML, como se muestra en el ejemplo con `esc_url()` y `sanitize_html_class()`.

### Shortcodes anidados (Nested Shortcodes)

A menudo, desearás crear contenedores de diseño que envuelvan otros elementos. Por ejemplo, una caja de columnas que contiene botones en su interior:

```text
[caja_destacada fondo="gris"]
    <h2>Título de la sección</h2>
    [mi_boton url="/contacto"]Escríbenos[/mi_boton]
[/caja_destacada]

```

Por defecto, si extraes y retornas el `$content` dentro de la función de `[caja_destacada]`, el núcleo de WordPress **no procesará** el shortcode interno `[mi_boton]`. El usuario verá el texto literal del corchete en la pantalla.

Para habilitar la recursividad y permitir que los shortcodes hijos se rendericen correctamente, debes pasar el contenido a través de la función `do_shortcode()` antes de retornarlo.

```php
/**
 * Shortcode contenedor que soporta anidación
 */
function mi_plugin_shortcode_caja( $atts, $content = null ) {
    $a = shortcode_atts( array(
        'fondo' => 'blanco'
    ), $atts, 'caja_destacada' );

    $clase_fondo = sanitize_html_class( $a['fondo'] );

    // Iniciamos el búfer para un marcado más limpio
    ob_start();
    ?>
    <div class="mi-caja-wrapper fondo-<?php echo $clase_fondo; ?>">
        <div class="mi-caja-contenido">
            <?php 
            // Procesamos cualquier shortcode interno explícitamente
            echo do_shortcode( $content ); 
            ?>
        </div>
    </div>
    <?php
    return ob_get_clean();
}
add_shortcode( 'caja_destacada', 'mi_plugin_shortcode_caja' );

```

### El problema de wpautop y el formato de los shortcodes

Un desafío común al trabajar con shortcodes anidados es la función `wpautop()` de WordPress, la cual convierte automáticamente los saltos de línea dobles en etiquetas `<p>` y los simples en `<br>`.

Si el usuario separa visualmente los shortcodes en el editor con saltos de línea para mantener ordenado el texto, WordPress suele envolver los shortcodes en etiquetas de párrafo vacías (e.g., `<p><div class="mi-caja-wrapper">...</div></p>`), lo que invalida el HTML (un bloque `<div>` no debe ir dentro de un `<p>`) y rompe los márgenes del diseño.

Para mitigar esto de forma nativa, WordPress intenta limpiar los shortcodes envolventes, pero no siempre es perfecto. Si encuentras etiquetas `<p>` o `<br>` inyectadas alrededor de la salida de tus shortcodes contenedores, puedes forzar una limpieza dentro de tu callback utilizando `shortcode_unautop()`:

```php
$contenido_limpio = shortcode_unautop( $content );
$contenido_procesado = do_shortcode( $contenido_limpio );

```

Esta técnica elimina el formato automático indeseado que interfiere en la estructura de los shortcodes jerárquicos de bloque.

## 8.3 Introducción a bloques Gutenberg

La llegada de Gutenberg en WordPress 5.0 supuso el mayor cambio arquitectónico en la historia de la plataforma. Mientras que los shortcodes y los metaboxes clásicos delegan casi toda su lógica al lado del servidor (PHP), el editor de bloques traslada la responsabilidad de la interfaz y la creación del contenido al lado del cliente (Navegador), utilizando JavaScript y React.

Como desarrollador de plugins de PHP, dar el salto a Gutenberg requiere un cambio de paradigma conceptual. Ya no interceptamos contenido justo antes de que se muestre; ahora proporcionamos herramientas interactivas para que el usuario construya el diseño directamente en el editor.

### El cambio de paradigma: PHP vs. JavaScript (React)

Para comprender Gutenberg, es vital analizar cómo se almacena y procesa la información en comparación con la Shortcode API clásica.

```text
+-------------------------------------------------------------------+
| MODELO TRADICIONAL (Shortcodes)                                   |
+-------------------------------------------------------------------+
| 1. Editor: El usuario escribe "[mi_plugin id='5']".               |
| 2. BD (wp_posts): Se guarda la etiqueta literal "[mi_plugin...]". |
| 3. Front-end: En cada visita, PHP lee el post, encuentra el       |
|    shortcode, ejecuta consultas y genera HTML en tiempo real.     |
+-------------------------------------------------------------------+

+-------------------------------------------------------------------+
| MODELO GUTENBERG (Bloques Estáticos)                              |
+-------------------------------------------------------------------+
| 1. Editor: El usuario interactúa con una interfaz visual (React). |
| 2. BD (wp_posts): Se guarda el HTML final ya estructurado,        |
|    envuelto en delimitadores de comentarios HTML.                 |
| 3. Front-end: En cada visita, PHP simplemente escupe el HTML ya   |
|    generado. Cero procesamiento pesado.                           |
+-------------------------------------------------------------------+

```

Cuando inspeccionas la base de datos de un post creado con Gutenberg, en lugar de shortcodes, verás una estructura basada en comentarios HTML que el núcleo de WordPress utiliza para reconstruir la interfaz en el editor:

```html
<div class="alerta-bloque alerta-advertencia">
    <p>Este es el contenido escrito por el usuario.</p>
</div>

```

### La tríada de un Bloque

El desarrollo moderno de bloques en WordPress se estandariza alrededor de tres piezas fundamentales que separan la configuración, la lógica de servidor y la interfaz de usuario:

1. **`block.json` (Metadatos):** Un archivo de configuración que define el nombre del bloque, atributos, dependencias de scripts y estilos. Es el estándar de oro actual y facilita la carga eficiente de recursos.
2. **Registro en PHP:** El código de servidor responsable de leer el `block.json` y decirle a WordPress que el bloque existe, encolando automáticamente los recursos necesarios.
3. **Scripts en JavaScript (React):** Archivos donde se utilizan las funciones de la API de bloques de WordPress (generalmente alojadas bajo el objeto global `wp`) para dibujar los controles del editor (`edit`) y definir qué HTML se guardará en la base de datos (`save`).

### El estándar actual: El archivo `block.json`

Antes de escribir una sola línea de PHP o JavaScript, un bloque profesional comienza definiendo su identidad y estructura de datos en un archivo `block.json`. Esto centraliza la información y permite que WordPress optimice qué CSS o JS se carga en el front-end solo si el bloque está presente en la página.

**Ejemplo de un archivo `block.json` básico:**

```json
{
    "$schema": "https://schemas.wp.org/trunk/block.json",
    "apiVersion": 3,
    "name": "mi-plugin/saludo",
    "title": "Bloque de Saludo",
    "category": "text",
    "icon": "smiley",
    "description": "Un bloque simple para mostrar un mensaje.",
    "attributes": {
        "mensaje": {
            "type": "string",
            "default": "¡Hola, mundo!"
        }
    },
    "textdomain": "mi-plugin",
    "editorScript": "file:./build/index.js",
    "editorStyle": "file:./build/index.css",
    "style": "file:./build/style-index.css"
}

```

* **`apiVersion: 3`**: Indica que el bloque utiliza las características más recientes de la API (compatible con iframes en el editor y el motor de estilos global).
* **`attributes`**: El equivalente a los atributos del shortcode. Aquí defines el esquema de datos que el bloque manejará (strings, booleanos, arrays).
* **`editorScript` / `style`**: WordPress leerá estas rutas y encolará automáticamente los archivos compilados sin que tengas que usar `wp_enqueue_script` o `wp_enqueue_style` manualmente.

### Registro del bloque desde PHP

Con el archivo `block.json` estructurado, el trabajo en PHP se vuelve extremadamente minimalista. Solo necesitas apuntar a la carpeta que contiene el archivo JSON utilizando la función `register_block_type()`.

```php
/**
 * Registra el bloque leyendo los metadatos de block.json
 */
function mi_plugin_registrar_bloques() {
    // La ruta debe apuntar al DIRECTORIO que contiene el block.json
    $directorio_bloque = plugin_dir_path( __FILE__ ) . 'src/bloque-saludo';
    
    register_block_type( $directorio_bloque );
}
// El gancho recomendado para bloques es 'init'
add_action( 'init', 'mi_plugin_registrar_bloques' );

```

A diferencia de la Shortcode API, donde PHP maneja todo el trabajo de renderizado a través de una función callback, en un bloque estático estándar (como el que define esta arquitectura inicial), PHP solo actúa como un puente. Una vez registrado, el entorno de ejecución de JavaScript dentro del editor de WordPress (`wp.blocks.registerBlockType`) toma el control total de la experiencia de creación e interactividad.

## 8.4 Bloques dinámicos renderizados

A pesar del cambio de paradigma hacia el lado del cliente introducido por Gutenberg, existen numerosos escenarios donde renderizar HTML estático y guardarlo en la base de datos no es viable. Si tu bloque necesita mostrar información que cambia constantemente (como los últimos posts, el inventario de un producto, o datos basados en la sesión del usuario), un bloque estático quedará obsoleto en el momento en que se guarde.

Aquí es donde entran los bloques dinámicos. Un bloque dinámico es el sucesor espiritual directo del shortcode: se configura visualmente en React dentro del editor, pero su representación en el front-end se delega completamente a PHP en tiempo de ejecución.

### Arquitectura de un Bloque Dinámico

A diferencia de un bloque estático que guarda todo el marcado HTML, un bloque dinámico guarda en la base de datos **únicamente los atributos** (y el contenido interno si es un bloque contenedor).

```text
+-------------------------------------------------------------------+
| FLUJO DE UN BLOQUE DINÁMICO                                       |
+-------------------------------------------------------------------+
| 1. EDITOR (React): El usuario ajusta opciones (ej. "Mostrar 5     |
|    posts"). La función `save` en JS retorna `null`.               |
|                                                                   |
| 2. BASE DE DATOS (wp_posts): Se guarda un marcador minimalista:   |
|    |
|                                                                   |
| 3. FRONT-END (PHP): Al cargar la página, WP lee el marcador,      |
|    extrae el JSON y se lo pasa a tu función callback en PHP.      |
|                                                                   |
| 4. RENDERIZADO: Tu código PHP consulta la BD y genera el HTML     |
|    actualizado en ese preciso instante.                           |
+-------------------------------------------------------------------+

```

### Configuración en `block.json`

Para crear un bloque dinámico, el archivo `block.json` sigue siendo tu punto de partida. La diferencia principal radica en que, en las versiones modernas de la Block API (v3), puedes apuntar directamente a un archivo PHP que se encargará del renderizado utilizando la propiedad `render`.

```json
{
    "$schema": "https://schemas.wp.org/trunk/block.json",
    "apiVersion": 3,
    "name": "mi-plugin/lista-dinamica",
    "title": "Lista Dinámica",
    "category": "widgets",
    "attributes": {
        "cantidad": {
            "type": "number",
            "default": 3
        },
        "categoria": {
            "type": "string",
            "default": "todas"
        }
    },
    "editorScript": "file:./build/index.js",
    "render": "file:./render.php"
}

```

Al definir `"render": "file:./render.php"`, WordPress cargará e incluirá automáticamente este archivo PHP en el front-end, pasándole variables específicas sin que tengas que registrar el callback manualmente en tu archivo principal del plugin.

### El archivo de renderizado (PHP Callback)

El archivo `render.php` especificado en el `block.json` actúa como la plantilla de salida. WordPress expone automáticamente tres variables dentro del alcance de este archivo:

1. **`$attributes` (array):** Los atributos definidos y guardados por el bloque.
2. **`$content` (string):** El contenido interno guardado (útil si el bloque permite bloques anidados usando `<InnerBlocks />`).
3. **`$block` (WP_Block):** La instancia completa del bloque, útil para acceder al contexto global o datos más profundos.

Aquí tienes un ejemplo de cómo se vería el archivo `render.php`:

```php
<?php
/**
 * Renderizado del bloque mi-plugin/lista-dinamica
 * * @var array    $attributes Los atributos del bloque.
 * @var string   $content    El contenido interno del bloque.
 * @var WP_Block $block      La instancia del bloque.
 */

// 1. Extraer y asegurar atributos
$cantidad  = isset( $attributes['cantidad'] ) ? absint( $attributes['cantidad'] ) : 3;
$categoria = isset( $attributes['categoria'] ) ? sanitize_text_field( $attributes['categoria'] ) : 'todas';

// 2. Lógica de PHP compleja (ej. WP_Query)
$args = array(
    'post_type'      => 'post',
    'posts_per_page' => $cantidad,
);

if ( $categoria !== 'todas' ) {
    $args['category_name'] = $categoria;
}

$query = new WP_Query( $args );

// 3. Renderizado (El archivo actúa como un búfer implícito en la API moderna)
$wrapper_attributes = get_block_wrapper_attributes( array(
    'class' => 'mi-lista-dinamica-contenedor'
) );
?>

<div <?php echo $wrapper_attributes; ?>>
    <?php if ( $query->have_posts() ) : ?>
        <ul class="mi-lista-dinamica-items">
            <?php while ( $query->have_posts() ) : $query->the_post(); ?>
                <li>
                    <a href="<?php get_permalink(); ?>">
                        <?php the_title(); ?>
                    </a>
                </li>
            <?php endwhile; wp_reset_postdata(); ?>
        </ul>
    <?php else : ?>
        <p><?php esc_html_e( 'No se encontraron publicaciones.', 'mi-plugin' ); ?></p>
    <?php endif; ?>
</div>

```

**Nota sobre `get_block_wrapper_attributes()`:** Esta es una función vital en el desarrollo moderno de bloques. Genera automáticamente los atributos de HTML (como `class`, `id`, `style`) asegurando que cualquier estilo, alineación o clase personalizada que el usuario haya aplicado en el editor mediante las herramientas globales de Gutenberg se transfiera correctamente al front-end.

### Registro tradicional mediante `render_callback`

Si no utilizas la propiedad `render` en el `block.json` (por ejemplo, si prefieres centralizar la lógica en una clase PHP o si trabajas en un entorno heredado), puedes registrar la función callback directamente al registrar el bloque en PHP:

```php
function mi_plugin_registrar_bloque_dinamico() {
    register_block_type(
        plugin_dir_path( __FILE__ ) . 'src/lista-dinamica',
        array(
            'render_callback' => 'mi_plugin_renderizar_lista_dinamica',
        )
    );
}
add_action( 'init', 'mi_plugin_registrar_bloque_dinamico' );

function mi_plugin_renderizar_lista_dinamica( $attributes, $content, $block ) {
    ob_start();
    // Lógica de renderizado aquí (similar a render.php)
    return ob_get_clean();
}

```

Al igual que en los shortcodes, si usas una función asignada a `render_callback`, **siempre debes retornar** el HTML final (generalmente usando el búfer de salida), nunca imprimirlo directamente.

### Sincronización en el Editor (`ServerSideRender`)

Un desafío común con los bloques dinámicos es que el usuario necesita ver en el editor de Gutenberg cómo quedará el resultado final. Replicar consultas a la base de datos de WordPress en JavaScript (React) puede ser complejo e ineficiente.

Para resolver esto, el paquete de componentes de WordPress (`@wordpress/server-side-render`) ofrece el componente `<ServerSideRender />`. Al utilizarlo en la función `edit` de tus scripts de React, WordPress realiza automáticamente una llamada a la REST API en segundo plano, ejecuta tu PHP de `render.php` (o `render_callback`), y pinta el HTML resultante directamente dentro del editor, garantizando que el back-end y el front-end sean siempre idénticos sin duplicar lógica.

## Resumen del capítulo

En este capítulo hemos abordado las herramientas fundamentales para integrar interfaces de usuario interactivas y dinámicas en el contenido de WordPress:

* **Shortcode API:** Comprendimos el funcionamiento interno basado en expresiones regulares y el filtro `the_content`. Aprendimos la regla de oro de siempre retornar el contenido utilizando el búfer de salida (`ob_start()`), en lugar de imprimirlo.
* **Atributos y Anidamiento:** Vimos cómo utilizar `shortcode_atts()` para establecer valores por defecto de forma segura y cómo procesar shortcodes internos mediante llamadas a `do_shortcode()`.
* **Introducción a Gutenberg:** Exploramos el cambio de paradigma entre la ejecución en servidor (PHP) y cliente (React), conociendo la tríada del bloque moderno enfocada en el estándar del archivo `block.json`.
* **Bloques Dinámicos:** Aprendimos a combinar lo mejor de ambos mundos, configurando interfaces en el editor de bloques pero delegando el renderizado en tiempo de ejecución al código PHP para manejar datos en constante cambio de forma estructurada y moderna.
