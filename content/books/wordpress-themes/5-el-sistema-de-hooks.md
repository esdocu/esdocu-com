El corazón de la extensibilidad de WordPress es su arquitectura orientada a eventos: la API de Plugins. En este capítulo dominarás los *hooks*, la herramienta esencial para modificar el *core*, inyectar código y alterar datos en tiempo de ejecución sin tocar los archivos originales del núcleo.

Exploraremos las diferencias críticas entre *Actions* y *Filters*, cómo controlar el flujo de ejecución mediante prioridades y argumentos, y las técnicas precisas para remover comportamientos no deseados. Finalmente, darás el paso hacia el desarrollo avanzado aprendiendo a crear tus propios *hooks* personalizados para construir themes verdaderamente escalables.

## 5.1 Actions vs. Filters

El corazón de la extensibilidad de WordPress reside en su arquitectura orientada a eventos, conocida formalmente como la API de Plugins o, más coloquialmente, el "sistema de Hooks" (ganchos). Este sistema es el que te permite interactuar con el *core* de WordPress, modificar su comportamiento y alterar datos en tiempo de ejecución sin necesidad de tocar un solo archivo del núcleo.

Un *hook* es esencialmente un punto de interrupción en el código fuente de WordPress. Cuando el motor de WordPress llega a uno de estos puntos, busca si algún plugin o theme ha "enganchado" alguna función personalizada para ejecutarla en ese momento exacto.

Existen dos tipos fundamentales de hooks en WordPress, y comprender la diferencia anatómica y conceptual entre ambos es el paso más crítico en el desarrollo avanzado de themes: **Actions** (Acciones) y **Filters** (Filtros).

### El flujo de ejecución (Diagrama conceptual)

Para visualizar cómo interactúan ambos tipos de hooks con el ciclo de carga de WordPress, observa el siguiente esquema de ejecución:

```text
Flujo principal de WordPress
 |
 |--- [ Action Hook ] ---> Ejecuta código (Ej: Insertar un script, enviar un email)
 |                         * No devuelve datos al flujo principal.
 |
 |--- [ Filter Hook ] ---> Intercepta una variable (Ej: El texto de un artículo)
 |                         * Modifica la variable.
 |                         * DEVUELVE la variable modificada al flujo principal.
 |
 v
Continúa la ejecución...

```

### Actions (Acciones)

Las acciones te permiten **hacer algo** en un momento específico de la ejecución de WordPress.

Cuando el core de WordPress invoca una acción, simplemente está anunciando: *"He llegado a este punto del proceso, si alguien quiere ejecutar algún código ahora, este es el momento"*. Las funciones que conectas a una acción (conocidas como *callbacks*) pueden realizar tareas como imprimir código HTML en la pantalla, interactuar con una API externa, registrar un nuevo tipo de contenido o enviar un correo electrónico.

**Características clave de las Acciones:**

* Su propósito es ejecutar lógica o imprimir resultados.
* **No** necesitan retornar ningún valor mediante `return`. Si devuelven algo, WordPress lo ignorará.
* Se enganchan utilizando la función `add_action()`.

**Ejemplo de Action:**
Supongamos que deseas inyectar un mensaje personalizado justo en el pie de página de tu theme. El core de WordPress proporciona el action hook `wp_footer` para este propósito.

```php
// Definimos la función de callback
function mi_theme_mensaje_footer() {
    echo '<p class="mensaje-footer">Desarrollado con orgullo en WordPress.</p>';
}

// Enganchamos nuestra función a la acción 'wp_footer'
add_action( 'wp_footer', 'mi_theme_mensaje_footer' );

```

### Filters (Filtros)

Los filtros, por otro lado, te permiten **modificar algo** antes de que WordPress lo renderice en pantalla o lo guarde en la base de datos.

Cuando WordPress invoca un filtro, está pasando una variable a través de él y diciendo: *"Voy a utilizar este dato. Si alguien quiere modificarlo, hágalo ahora y devuélvamelo"*. El código que conectas a un filtro recibe ese dato, aplica transformaciones, y tiene la obligación absoluta de devolverlo.

**Características clave de los Filtros:**

* Su propósito es transformar datos, cadenas de texto, arreglos u objetos.
* **Obligatoriamente** deben retornar el dato modificado utilizando `return`. Si olvidas el `return`, la variable original se destruirá (se volverá `null` o vacía), lo que invariablemente causará errores graves o pantallas blancas.
* Se enganchan utilizando la función `add_filter()`.

**Ejemplo de Filter:**
Imagina que deseas cambiar la longitud de los extractos (*excerpts*) de los posts, que por defecto es de 55 palabras. WordPress ofrece el filtro `excerpt_length` que te pasa la longitud actual como argumento.

```php
// Definimos la función de callback, recibiendo el dato original ($length)
function mi_theme_modificar_longitud_extracto( $length ) {
    // Cambiamos el dato a 20 palabras
    return 20; 
}

// Enganchamos nuestra función al filtro 'excerpt_length'
add_filter( 'excerpt_length', 'mi_theme_modificar_longitud_extracto' );

```

### Cuadro Comparativo

Para consolidar la diferencia entre ambos, aquí tienes un resumen de sus comportamientos y funciones asociadas:

| Característica | Actions (Acciones) | Filters (Filtros) |
| --- | --- | --- |
| **Objetivo principal** | Ejecutar una tarea o imprimir código. | Interceptar, modificar y devolver datos. |
| **Retorno de datos (`return`)** | No es necesario. | **Estrictamente obligatorio.** |
| **Función para enganchar código** | `add_action()` | `add_filter()` |
| **Función core que lo dispara** | `do_action()` | `apply_filters()` |
| **Analogía del mundo real** | Un evento que dispara una alarma. | Una estación de control de calidad en una fábrica. |

Entender que los Actions añaden comportamiento y los Filters manipulan información te permitirá buscar en la documentación de WordPress el hook correcto según lo que intentes lograr en tu theme.

## 5.2 Prioridad y número de argumentos

Cuando trabajas con un ecosistema tan dinámico como WordPress, es extremadamente común que el *core*, tu theme y varios plugins intenten "engancharse" al mismo *hook* simultáneamente. Si cinco funciones diferentes están esperando a que se ejecute la acción `wp_head`, WordPress necesita un sistema estricto de control de tráfico para decidir el orden de ejecución y la cantidad de información que debe distribuir a cada función.

Aquí es donde entran en juego el tercer y cuarto parámetro de las funciones `add_action()` y `add_filter()`. La firma completa de estas funciones es:

```php
add_action( $hook_name, $callback, $priority, $accepted_args );
add_filter( $hook_name, $callback, $priority, $accepted_args );

```

### La Prioridad ($priority)

El tercer parámetro, `$priority`, es un número entero que determina el orden en el que se ejecutan las funciones asociadas a un hook específico. Funciona bajo una regla de orden ascendente: **los números más bajos se ejecutan primero**.

* **El valor por defecto es 10.** Si omites este parámetro, WordPress asignará automáticamente una prioridad de 10 a tu función.
* **Prioridad temprana:** Valores como `1`, `5` o `8` se utilizarán si necesitas que tu código se ejecute antes que el comportamiento estándar de WordPress o de otros plugins.
* **Prioridad tardía:** Valores como `20`, `99` o incluso `999` se utilizan cuando necesitas asegurarte de tener la última palabra, sobrescribiendo lo que hayan hecho funciones ejecutadas previamente.

Si dos funciones tienen exactamente la misma prioridad (por ejemplo, ambas usan `10`), se ejecutarán en el mismo orden en que fueron registradas en el código (orden de lectura de los archivos PHP).

#### Cola de ejecución conceptual

```text
Hook disparado: 'the_content'
 |
 |--- [ Prioridad 1  ] --> Plugin de seguridad limpia el texto.
 |--- [ Prioridad 5  ] --> Plugin de SEO inserta un meta-dato interno.
 |--- [ Prioridad 10 ] --> (Por defecto) Tu theme formatea los párrafos.
 |--- [ Prioridad 10 ] --> (Por defecto) Un plugin de shortcodes procesa sus etiquetas (se registró después de tu theme).
 |--- [ Prioridad 99 ] --> Plugin de compartir en redes sociales inyecta sus botones al final.
 |
 v
Contenido final renderizado en pantalla

```

#### Ejemplo práctico de prioridad

Si deseas añadir una hoja de estilos pero necesitas asegurarte de que cargue *después* de todas las demás hojas de estilo predeterminadas, aumentarás el número de prioridad:

```php
// Función por defecto (Prioridad 10 implícita)
function mi_theme_estilos_base() {
    wp_enqueue_style( 'estilo-base', get_stylesheet_uri() );
}
add_action( 'wp_enqueue_scripts', 'mi_theme_estilos_base' );

// Función tardía (Prioridad 99)
function mi_theme_estilos_override() {
    wp_enqueue_style( 'estilo-final', get_template_directory_uri() . '/css/override.css' );
}
add_action( 'wp_enqueue_scripts', 'mi_theme_estilos_override', 99 );

```

### El número de argumentos ($accepted_args)

El cuarto parámetro, `$accepted_args`, es posiblemente el responsable de la mayor cantidad de errores frustrantes para los desarrolladores de themes intermedios. Este parámetro le dice a WordPress **cuántas variables debe pasar a tu función de callback**.

* **El valor por defecto es 1.** Si omites este parámetro, tu función solo recibirá el primer dato que el hook ofrezca, sin importar cuántos datos estén disponibles.

Muchos hooks del core de WordPress son ricos en contexto y pasan múltiples parámetros para facilitarte la vida. Sin embargo, si no declaras explícitamente que estás listo para recibir esos parámetros adicionales, WordPress simplemente no te los entregará.

#### Ejemplo del problema y la solución

Imagina que quieres modificar las clases CSS de un elemento específico del menú de navegación. WordPress ofrece el filtro `nav_menu_css_class`. Si consultas la documentación, verás que este filtro pasa cuatro argumentos:

1. `$classes` (Array con las clases CSS actuales).
2. `$menu_item` (El objeto de datos del ítem del menú).
3. `$args` (Argumentos del menú en general).
4. `$depth` (La profundidad del ítem en el árbol del menú).

**El enfoque incorrecto (olvidar los argumentos):**

```php
// Queremos añadir una clase si el ítem es de tipo "categoría", 
// pero olvidamos declarar cuántos argumentos esperamos.
function mi_theme_clases_menu( $classes, $menu_item ) {
    
    // ERROR FATAL: $menu_item será null porque WordPress solo 
    // nos entregó el primer argumento ($classes).
    if ( $menu_item->object == 'category' ) {
        $classes[] = 'es-una-categoria';
    }
    return $classes;
}
// Al omitir el 4º parámetro, por defecto es 1.
add_filter( 'nav_menu_css_class', 'mi_theme_clases_menu', 10 ); 

```

**El enfoque correcto:**

```php
// Declaramos la función esperando 2 argumentos
function mi_theme_clases_menu_corregido( $classes, $menu_item ) {
    
    // Ahora $menu_item contiene el objeto correcto
    if ( $menu_item->object == 'category' ) {
        $classes[] = 'es-una-categoria';
    }
    return $classes;
}
// Especificamos: Prioridad 10, y queremos recibir 2 argumentos.
add_filter( 'nav_menu_css_class', 'mi_theme_clases_menu_corregido', 10, 2 );

```

Como regla general en el desarrollo de themes: siempre que utilices un hook, revisa rápidamente la documentación oficial (el *Code Reference* de WordPress) para verificar cuántos argumentos transmite ese hook en particular. Si necesitas usar el segundo, tercer o cuarto argumento en tu lógica, debes ajustar `$accepted_args` obligatoriamente.

## 5.3 Remover hooks existentes

El desarrollo con WordPress no solo consiste en añadir nuevas funcionalidades; gran parte del trabajo, especialmente al optimizar el rendimiento o al crear temas hijo (Child Themes), consiste en desactivar comportamientos predeterminados del *core*, de plugins o del tema padre.

Para deshacer lo que un `add_action()` o un `add_filter()` han construido, WordPress proporciona las funciones `remove_action()` y `remove_filter()`.

### La regla de oro: Coincidencia exacta

El error más común al intentar remover un hook es no replicar la firma original. Para que WordPress pueda localizar y desconectar una función de la cola de ejecución, tu llamada a `remove_action` o `remove_filter` debe coincidir **exactamente** en tres parámetros críticos:

1. El nombre del hook.
2. El nombre de la función de callback.
3. La prioridad (si la original no era 10, debes especificar el número exacto).

**Firma de la función:**

```php
remove_action( $hook_name, $callback, $priority );
remove_filter( $hook_name, $callback, $priority );

```

*(Nota: Ambas funciones retornan `true` si la eliminación fue exitosa, o `false` si no encontraron el hook en la cola de ejecución, lo cual es útil para depurar).*

### El problema de la temporalidad (El factor "Cuándo")

No puedes remover algo que aún no existe. Si tu código para remover un hook se ejecuta en milisegundos antes de que el código original lo registre, la función fallará silenciosamente. Por lo tanto, las instrucciones de remoción deben envolverse casi siempre dentro de otro hook que se dispare **después** del registro original.

#### Diagrama de temporalidad

```text
Flujo de ejecución incorrecto (Falla):
 1. Archivo functions.php del Child Theme -> Llama a remove_action() [Falla: el hook no existe aún]
 2. Archivo functions.php del Parent Theme -> Llama a add_action()

Flujo de ejecución correcto (Éxito):
 1. functions.php del Parent Theme -> Llama a add_action() en el hook 'init'.
 2. functions.php del Child Theme  -> Llama a add_action() en 'wp_loaded' (que ocurre después de 'init').
 3. Durante 'wp_loaded', tu Child Theme ejecuta remove_action(). [Éxito]

```

### Ejemplos prácticos

#### 1. Limpieza del Core de WordPress

WordPress inyecta por defecto varios scripts y meta-etiquetas en el `<head>` que muchos desarrolladores prefieren eliminar por razones de rendimiento (como los scripts para el soporte de emojis antiguos).

Si inspeccionamos el core de WordPress, vemos que los emojis se registran así:
`add_action( 'wp_head', 'print_emoji_detection_script', 7 );`

Para removerlo, debemos usar la misma prioridad (`7`). Como estos hooks se añaden al inicio del ciclo de vida, podemos agrupar nuestras remociones dentro de la acción `init`.

```php
function mi_theme_limpiar_head() {
    // Nota el tercer parámetro: la prioridad debe ser exactamente 7
    remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
    remove_action( 'wp_print_styles', 'print_emoji_styles' );
    
    // Remover el generador de versión de WP (Prioridad por defecto 10)
    remove_action( 'wp_head', 'wp_generator' ); 
}
// Enganchamos nuestra limpieza a 'init' para asegurar que el core ya registró todo
add_action( 'init', 'mi_theme_limpiar_head' );

```

#### 2. Sobrescribir un Theme Padre

Imagina que el Theme Padre registra un tamaño de imagen personalizado en su acción de configuración, pero no te gusta cómo recorta las imágenes.

**En el Parent Theme (original):**

```php
function parent_theme_setup() {
    add_image_size( 'hero-banner', 1200, 600, true );
}
add_action( 'after_setup_theme', 'parent_theme_setup' );

```

**En tu Child Theme (tu código):**
Para anular esto, debes usar el mismo hook (`after_setup_theme`), pero con una prioridad mayor a 10 para garantizar que tu código se ejecute de último.

```php
function child_theme_remover_tamanos() {
    // Como no podemos "borrar" un tamaño de imagen con un remove_action,
    // simplemente lo sobrescribimos declarándolo de nuevo aquí,
    // o removemos una función entera del padre si estuviera enganchada al wp_head.
}
// Usamos prioridad 20 para actuar después del Theme Padre
add_action( 'after_setup_theme', 'child_theme_remover_tamanos', 20 );

```

### Dificultad Avanzada: Remover hooks de clases (POO)

Como desarrollador con experiencia en PHP, tarde o temprano te encontrarás con un plugin o theme que registra hooks utilizando programación orientada a objetos:

```php
// Código original en un plugin:
$plugin_clase = new Mi_Plugin_Clase();
add_action( 'wp_footer', array( $plugin_clase, 'inyectar_script' ) );

```

**No puedes** remover esto haciendo `remove_action( 'wp_footer', array( 'Mi_Plugin_Clase', 'inyectar_script' ) )`. El sistema de hooks guarda el identificador utilizando la *instancia exacta* del objeto, no solo el nombre de la clase estática (a menos que el método original se haya registrado estáticamente).

Para remover hooks basados en objetos instanciados, necesitas tener acceso a esa instancia global específica (usualmente almacenada en una variable global o devuelta mediante un patrón Singleton).

```php
// Solución usando la variable global de la instancia
global $plugin_clase;
remove_action( 'wp_footer', array( $plugin_clase, 'inyectar_script' ) );

```

## 5.4 Crear hooks personalizados

Hasta este punto, hemos consumido los *hooks* que el *core* de WordPress o los plugins de terceros ponen a nuestra disposición. Sin embargo, el verdadero sello de un theme profesional y escalable es su propia extensibilidad.

Al crear tus propios *Actions* y *Filters*, estás construyendo una API interna para tu theme. Esto permite que tú mismo (en el futuro), otros miembros de tu equipo, o los usuarios a través de un *Child Theme*, puedan modificar el comportamiento o inyectar contenido sin tener que editar directamente tus archivos de plantilla.

### Custom Actions: Definiendo puntos de inyección

Para crear una acción personalizada, simplemente colocas la función `do_action()` en el lugar exacto de tu código donde deseas que ocurra el evento.

**Firma de la función:**

```php
do_action( $hook_name, $arg1, $arg2, ... );

```

#### Ejemplo: Áreas de inyección estructurales

Un patrón muy común en temas *premium* es ofrecer "zonas" (áreas hookeadas) alrededor de elementos estructurales principales. Imagina el archivo `header.php` de tu theme:

```php
<header id="masthead" class="site-header">
    
    <?php 
    // Disparamos una acción justo ANTES del contenido del header
    do_action( 'mi_theme_antes_del_header' ); 
    ?>

    <div class="site-branding">
        <?php the_custom_logo(); ?>
    </div>

    <nav id="site-navigation" class="main-navigation">
        <?php wp_nav_menu( array( 'theme_location' => 'menu-1' ) ); ?>
    </nav>

    <?php 
    // Disparamos una acción justo DESPUÉS del contenido del header
    do_action( 'mi_theme_despues_del_header' ); 
    ?>

</header>

```

Con estas dos líneas de código, has abierto la puerta para que un tema hijo pueda inyectar, por ejemplo, un banner de rebajas o un aviso legal en la cabecera usando un simple `add_action( 'mi_theme_antes_del_header', 'funcion_banner' )`, sin necesidad de copiar y sobrescribir todo el archivo `header.php`.

### Custom Filters: Permitiendo la modificación de datos

Crear filtros personalizados es igual de sencillo, pero requiere el uso de la función `apply_filters()`. Recuerda que un filtro *siempre* debe devolver un valor.

**Firma de la función:**

```php
$valor_final = apply_filters( $hook_name, $valor_por_defecto, $arg1, $arg2, ... );

```

#### Ejemplo: Textos y configuraciones dinámicas

Supongamos que tu tema muestra un texto de copyright en el pie de página. Si lo codificas de forma rígida, la única forma de cambiarlo sería sobrescribiendo el archivo `footer.php`. Si lo envuelves en un filtro, se vuelve dinámico:

```php
// footer.php

// 1. Definimos el valor por defecto
$texto_copyright_base = '© ' . date( 'Y' ) . ' Todos los derechos reservados.';

// 2. Lo pasamos por nuestro filtro personalizado antes de imprimirlo
$texto_copyright_final = apply_filters( 'mi_theme_texto_copyright', $texto_copyright_base );

// 3. Imprimimos el resultado
echo '<div class="site-info">';
echo esc_html( $texto_copyright_final );
echo '</div>';

```

Ahora, desde el archivo `functions.php` de un Child Theme, alguien podría modificarlo fácilmente:

```php
// functions.php de un Child Theme
function child_theme_cambiar_copyright( $texto_original ) {
    return 'Creado con ♥ por Mi Agencia en ' . date( 'Y' );
}
add_filter( 'mi_theme_texto_copyright', 'child_theme_cambiar_copyright' );

```

### El flujo de un Custom Hook (Diagrama)

```text
[ Tu Theme Padre (Productor) ]
       |
       |-- Define variable: $clase_css = 'sidebar-derecha';
       |
       |-- Dispara el filtro: 
       |   $clase_css = apply_filters( 'mi_theme_posicion_sidebar', $clase_css );
       |
       v      
[ El Theme Hijo (Consumidor) ]
       |
       |-- Intercepta: add_filter( 'mi_theme_posicion_sidebar', 'cambiar_a_izq' );
       |-- Modifica: return 'sidebar-izquierda';
       |
       v
[ Tu Theme Padre (Renderizado) ]
       |
       |-- Recibe el valor modificado ('sidebar-izquierda').
       |-- Renderiza el HTML: <div class="sidebar-izquierda">...</div>

```

### Buenas prácticas al crear hooks

1. **Usa siempre un prefijo:** Nunca nombres a tu hook personalizado algo genérico como `antes_del_contenido`. Usa siempre el *slug* de tu theme como prefijo (ej. `mi_theme_antes_del_contenido`). Esto evita colisiones catastróficas si un plugin intenta registrar un hook con el mismo nombre.
2. **Pasa variables de contexto:** Si disparas una acción dentro del *Loop* (`do_action('mi_theme_despues_del_post')`), es muy recomendable pasar el ID del post actual como segundo argumento: `do_action('mi_theme_despues_del_post', get_the_ID())`. Esto le da al desarrollador que consuma el hook el contexto necesario para trabajar.
3. **Documenta tus hooks:** Los hooks invisibles no sirven de nada. Utiliza bloques de comentarios PHPDoc justo encima de tus `do_action` o `apply_filters` explicando qué hacen, qué parámetros aceptan y en qué archivo se encuentran.

## Resumen del capítulo

En este capítulo hemos diseccionado el sistema de comunicación interno de WordPress, comprendiendo que:

* Las **Acciones (Actions)** actúan como disparadores para ejecutar lógica en momentos precisos del ciclo de vida de WordPress, sin afectar los datos devueltos (`add_action`).
* Los **Filtros (Filters)** son estaciones de peaje donde los datos son interceptados, modificados y obligatoriamente devueltos al flujo principal (`add_filter`).
* La **Prioridad** gestiona el orden de ejecución (números bajos primero) y la declaración correcta de **Argumentos** asegura que tu función reciba todos los datos de contexto necesarios.
* Es posible limpiar la cola de ejecución utilizando `remove_action()` y `remove_filter()`, siempre y cuando las firmas y temporalidades coincidan exactamente con el registro original.
* Finalmente, implementar **Hooks personalizados** (`do_action` y `apply_filters`) dentro de tu propio código eleva la calidad de tu theme, permitiendo que sea extendido de forma segura, limpia y profesional mediante Child Themes o plugins.
