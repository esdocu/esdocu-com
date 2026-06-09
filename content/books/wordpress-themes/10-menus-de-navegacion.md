La navegación es la columna vertebral de la experiencia de usuario. En este capítulo, exploraremos cómo integrar y personalizar el sistema de menús nativo de WordPress en tu theme. Aprenderemos a registrar ubicaciones estratégicas para que los usuarios gestionen sus enlaces desde el panel de administración. Luego, desglosaremos la función `wp_nav_menu()` para renderizar estas estructuras en el frontend y descubriremos cómo filtrar sus clases CSS dinámicas. Finalmente, para diseños que exigen un control absoluto del HTML, dominaremos la extensión de la clase Walker para construir interfaces complejas y a medida.

## 10.1 Registro de ubicaciones de menú

Para que un theme de WordPress pueda soportar menús personalizados, el primer paso lógico no es crear el menú en sí, sino definir los "espacios" o "ubicaciones" donde el usuario final podrá colocar los menús que construya desde el panel de administración (`Apariencia > Menús`).

Es fundamental entender la distinción entre un **Menú** y una **Ubicación de Menú (Theme Location)**:

* **El Menú:** Es la estructura de enlaces (páginas, categorías, enlaces personalizados) que el usuario crea en la base de datos.
* **La Ubicación:** Es el identificador registrado por tu theme que determina en qué parte de la plantilla se renderizará ese menú.

### El flujo de asignación

El siguiente diagrama ilustra cómo interactúa el código de tu theme con la interfaz de WordPress y los datos del usuario:

```text
[ Código del Theme ]           [ Interfaz de WP Admin ]            [ Datos del Usuario ]
 functions.php                 Apariencia -> Menús                 Base de Datos (Terms)
 
+------------------+          +------------------------+          +--------------------+
|                  |          |                        |          |                    |
| Theme Location:  +--------->+ Casilla de asignación: +<---------+ Menú creado:       |
| 'menu-principal' | define   | "Menú Principal"       | asigna   | "Navegación 2026"  |
|                  |          |                        |          |                    |
+------------------+          +------------------------+          +--------------------+

```

### Registrando ubicaciones mediante código

Como aprendimos en el Capítulo 4, la inicialización de características del theme debe engancharse al hook `after_setup_theme`. Para registrar las ubicaciones, WordPress proporciona dos funciones principales: `register_nav_menu()` (para una sola ubicación) y `register_nav_menus()` (para múltiples ubicaciones, la opción más recomendada y eficiente).

A continuación, implementamos el registro de tres ubicaciones comunes en el archivo `functions.php`:

```php
/**
 * Registra las ubicaciones de menú del theme.
 */
function mi_theme_registrar_menus() {
    register_nav_menus( array(
        'primary' => esc_html__( 'Menú Principal', 'mi-theme-textdomain' ),
        'footer'  => esc_html__( 'Menú del Pie de Página', 'mi-theme-textdomain' ),
        'social'  => esc_html__( 'Menú de Redes Sociales', 'mi-theme-textdomain' ),
    ) );
}
add_action( 'after_setup_theme', 'mi_theme_registrar_menus' );

```

**Análisis de los parámetros:**

* **Clave del array (`'primary'`, `'footer'`, `'social'`):** Es el *slug* o identificador interno de la ubicación. Debe ser único dentro de tu theme, escrito en minúsculas y sin espacios. Este es el valor que utilizarás más adelante en tus plantillas (como `header.php`) para llamar al menú.
* **Valor del array:** Es la etiqueta descriptiva que verá el administrador del sitio en el backend de WordPress. Utilizamos funciones de internacionalización como `esc_html__()` para asegurar que estas etiquetas puedan ser traducidas (un tema que profundizaremos en el Capítulo 18) y estén sanitizadas para su salida en HTML.

### Verificación de ubicaciones registradas

Una vez que el código anterior se ejecuta, si visitas `Apariencia > Menús` en el panel de control de WordPress y seleccionas la pestaña "Gestionar ubicaciones", verás los tres espacios listos para recibir un menú.

A nivel de desarrollo, antes de intentar estructurar el HTML del frontend (lo cual veremos en la próxima lección), es una excelente práctica condicionar la salida de ciertas envolturas HTML comprobando si el usuario realmente ha asignado un menú a esa ubicación.

Para esto, la API nos provee la función `has_nav_menu( $location )`:

```php
// Ejemplo conceptual en header.php
if ( has_nav_menu( 'primary' ) ) {
    // El usuario ha asignado un menú a la ubicación 'primary'.
    // Aquí es seguro renderizar el contenedor <nav> y ejecutar wp_nav_menu().
} else {
    // Opcional: Mostrar un mensaje o un menú de contingencia.
}

```

Al registrar las ubicaciones de esta manera semántica y desacoplada, otorgas total flexibilidad al usuario final para reorganizar la arquitectura de información de su sitio sin tocar una sola línea de código PHP, respetando así la filosofía central de la separación de responsabilidades en WordPress.

## 10.2 La función wp_nav_menu

Si el registro de ubicaciones que vimos en la lección anterior es el "enchufe" en la pared, la función `wp_nav_menu()` es el electrodoméstico que conectamos a él. Esta es la herramienta principal que proporciona WordPress para recuperar un menú de la base de datos y transformarlo en una estructura de navegación HTML en el frontend de tu theme.

Por defecto, cuando llamas a esta función, WordPress genera una estructura anidada y semántica basada en listas desordenadas (`<ul>` y `<li>`).

### El árbol DOM generado por defecto

Comprender la estructura HTML que escupe WordPress es vital antes de intentar aplicarle estilos CSS o manipularla. De forma predeterminada, el motor renderiza algo como esto:

```text
[ Contenedor Wrapper ]  <-- Generalmente un <div>
   └── [ Lista Principal ]  <-- Etiqueta <ul> con clase "menu"
         ├── [ Elemento ]   <-- Etiqueta <li>
         │     └── [ Link ] <-- Etiqueta <a>
         ├── [ Elemento ]   
         │     └── [ Link ] 
         └── [ Elemento Padre ] 
               ├── [ Link ]
               └── [ Submenú ] <-- Etiqueta <ul> anidada
                     └── [ Elemento ] 
                           └── [ Link ]

```

### Implementación básica y el array de argumentos

Para invocar el menú, debes llamar a la función pasando un array asociativo de parámetros. El argumento más importante es `theme_location`, ya que le dice a WordPress exactamente qué menú debe buscar.

```php
// En un archivo de plantilla, como header.php
wp_nav_menu( array(
    'theme_location' => 'primary' // El slug que registramos en functions.php
) );

```

Sin embargo, en el desarrollo de themes profesionales, rara vez usamos la configuración por defecto. Necesitamos controlar las clases CSS, cambiar las etiquetas de los contenedores para hacerlas más semánticas (como usar `<nav>`) o limitar la profundidad del menú.

A continuación, detallamos los parámetros más utilizados dentro del array de argumentos:

| Parámetro | Valor por defecto | Descripción |
| --- | --- | --- |
| **`theme_location`** | `''` (vacío) | El identificador de la ubicación registrada (ej: `'primary'`). |
| **`container`** | `'div'` | El tipo de etiqueta HTML que envolverá el `<ul>`. Puedes cambiarlo a `'nav'` o usar `false` para eliminar el contenedor por completo. |
| **`container_class`** | `''` (vacío) | Clases CSS que se aplicarán al contenedor. |
| **`menu_class`** | `'menu'` | Clases CSS que se aplicarán directamente a la etiqueta `<ul>`. |
| **`fallback_cb`** | `'wp_page_menu'` | Función que se ejecuta si el usuario no ha asignado ningún menú. A menudo se establece en `false` para no mostrar nada si está vacío. |
| **`depth`** | `0` (ilimitado) | Cuántos niveles de jerarquía (submenús) se deben renderizar. `1` mostrará solo el nivel superior; `0` mostrará todos. |

### Ejemplo práctico de configuración avanzada

Imagina que estás construyendo la cabecera de tu sitio y necesitas que el contenedor principal sea semántico, requieres clases CSS específicas para tu framework (como Bootstrap o Tailwind) y quieres asegurarte de que, si el usuario olvida asignar el menú, no aparezca un listado desordenado de todas las páginas del sitio (el comportamiento de *fallback* por defecto de WP).

El código se estructuraría de la siguiente manera:

```php
<?php
// Verificamos primero si hay un menú asignado para evitar renderizar HTML vacío
if ( has_nav_menu( 'primary' ) ) {
    wp_nav_menu( array(
        'theme_location'  => 'primary',
        'container'       => 'nav',               // Usa <nav> en lugar de <div>
        'container_class' => 'navegacion-principal', // Clase para el <nav>
        'menu_class'      => 'lista-enlaces',     // Clase para el <ul>
        'depth'           => 2,                   // Solo permitimos un nivel de submenú
        'fallback_cb'     => false                // Si falla, no imprime nada
    ) );
}
?>

```

### El resultado en HTML

Si el usuario asignó un menú con "Inicio" y "Servicios" a esta ubicación, el bloque PHP anterior se traducirá exactamente en este código HTML en el navegador del visitante:

```html
<nav class="navegacion-principal">
    <ul id="menu-menu-1" class="lista-enlaces">
        <li id="menu-item-10" class="menu-item menu-item-type-custom menu-item-object-custom current-menu-item menu-item-10">
            <a href="/" aria-current="page">Inicio</a>
        </li>
        <li id="menu-item-11" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-11">
            <a href="/servicios/">Servicios</a>
        </li>
    </ul>
</nav>

```

Observarás que, aunque controlamos las clases del contenedor y del `<ul>`, WordPress inyecta automáticamente una gran cantidad de clases dinámicas en los elementos `<li>` (como `current-menu-item`). Esta inyección de clases es una característica poderosa que exploraremos a fondo en la lección 10.4.

## 10.3 Extensión de la clase Walker

Aunque la función `wp_nav_menu()` ofrece parámetros para personalizar las clases de los contenedores (`<ul>`), se queda corta cuando necesitamos modificar drásticamente la estructura interna de los elementos (`<li>` y `<a>`). Si estás integrando un framework CSS complejo (como Bootstrap o Tailwind) o necesitas inyectar elementos HTML personalizados (como iconos SVG o etiquetas `<span>` con descripciones de menú), la solución nativa es extender la clase `Walker`.

En WordPress, la clase base `Walker` es un sistema abstracto de recorrido de árboles utilizado para iterar sobre datos jerárquicos (categorías, páginas, comentarios). Para los menús de navegación, WordPress utiliza una extensión específica llamada `Walker_Nav_Menu`.

### Anatomía del recorrido

Para modificar la salida HTML, debes crear tu propia clase PHP que herede de `Walker_Nav_Menu` y sobrescribir sus métodos principales. Cada método se dispara en un momento específico del renderizado de la jerarquía:

```text
[ Inicio del Menú ]
 │
 ├── start_lvl()   <-- Imprime la apertura del contenedor de nivel (ej. <ul class="submenu">)
 │    │
 │    ├── start_el() <-- Imprime la apertura del elemento y su enlace (ej. <li><a href="...">Texto)
 │    │
 │    └── end_el()   <-- Imprime el cierre del elemento (ej. </a></li>)
 │
 └── end_lvl()     <-- Imprime el cierre del contenedor de nivel (ej. </ul>)

```

Al entender este ciclo, puedes interceptar la cadena de texto `$output` (que WordPress va construyendo paso a paso) y concatenar tu propio marcado HTML.

### Creación de una clase Walker personalizada

Supongamos un escenario común: queremos añadir una etiqueta `<span>` personalizada dentro de cada enlace que contenga la descripción del menú (un campo nativo de WordPress que suele estar oculto por defecto en la interfaz de administración).

Para lograrlo, sobrescribimos únicamente el método `start_el()`, ya que es el encargado de construir la etiqueta `<a>`. En tu archivo `functions.php` (o preferiblemente en un archivo separado e incluido), definirías la siguiente clase:

```php
/**
 * Clase Walker personalizada para añadir descripciones a los enlaces.
 */
class Mi_Theme_Walker_Descripcion extends Walker_Nav_Menu {

    /**
     * Inicia el renderizado del elemento (<li> y <a>).
     */
    public function start_el( &$output, $item, $depth = 0, $args = null, $id = 0 ) {
        // 1. Clases del <li>
        $classes = empty( $item->classes ) ? array() : (array) $item->classes;
        $class_names = join( ' ', apply_filters( 'nav_menu_css_class', array_filter( $classes ), $item, $args, $depth ) );
        $class_names = $class_names ? ' class="' . esc_attr( $class_names ) . '"' : '';

        // 2. Construcción del <li>
        $output .= '<li' . $class_names . '>';

        // 3. Atributos del <a> (href, target, rel, etc.)
        $atts = array();
        $atts['title']  = ! empty( $item->attr_title ) ? $item->attr_title : '';
        $atts['target'] = ! empty( $item->target )     ? $item->target     : '';
        $atts['rel']    = ! empty( $item->xfn )        ? $item->xfn        : '';
        $atts['href']   = ! empty( $item->url )        ? $item->url        : '';

        $attributes = '';
        foreach ( $atts as $attr => $value ) {
            if ( ! empty( $value ) ) {
                $attributes .= ' ' . $attr . '="' . esc_attr( $value ) . '"';
            }
        }

        // 4. Extracción de la descripción
        $descripcion = ! empty( $item->description ) ? '<span class="item-desc">' . esc_html( $item->description ) . '</span>' : '';

        // 5. Ensamblaje final del <a>
        $title = apply_filters( 'the_title', $item->title, $item->ID );
        
        $item_output = $args->before;
        $item_output .= '<a' . $attributes . '>';
        $item_output .= $args->link_before . $title . $args->link_after;
        $item_output .= $descripcion; // Inyectamos nuestro HTML personalizado
        $item_output .= '</a>';
        $item_output .= $args->after;

        // 6. Añadir al output global
        $output .= apply_filters( 'walker_nav_menu_start_el', $item_output, $item, $depth, $args );
    }
}

```

*Nota: Aunque hemos reescrito gran parte del método estándar para inyectar nuestra variable `$descripcion`, es crucial mantener los `apply_filters()` nativos de WordPress para asegurar la compatibilidad con plugins de terceros.*

### Implementación en la plantilla

Una vez definida tu clase, el último paso es instanciarla y pasarla al parámetro `walker` dentro del array de argumentos de `wp_nav_menu()` en tu archivo de frontend (como `header.php`):

```php
if ( has_nav_menu( 'primary' ) ) {
    wp_nav_menu( array(
        'theme_location' => 'primary',
        'container'      => 'nav',
        'walker'         => new Mi_Theme_Walker_Descripcion() // Invocamos nuestra clase
    ) );
}

```

### Cuándo evitar el uso de Walker

Si bien la clase Walker es extremadamente potente, es también una operación computacionalmente más costosa. Si tu único objetivo es añadir una clase CSS a la etiqueta `<a>` o modificar un atributo simple (como añadir un `data-toggle="dropdown"`), no necesitas crear un Walker completo.

En su lugar, WordPress expone *Filter Hooks* específicos mucho más eficientes y limpios, como `nav_menu_link_attributes` (para manipular atributos del enlace) y `nav_menu_css_class` (para manipular las clases del `<li>`). Solo recurre a extender el Walker cuando los cambios estructurales en el DOM sean sustanciales o requieran lógica jerárquica compleja.

## 10.4 Clases CSS inyectadas por WP

Una de las características más útiles (y a veces abrumadoras) de `wp_nav_menu()` es la cantidad de clases CSS que WordPress inyecta automáticamente en cada elemento `<li>` del menú. Este comportamiento, conocido coloquialmente en la comunidad como la "sopa de clases" (*class soup*), tiene un propósito fundamental: proporcionar al desarrollador frontend todo el contexto posible sobre el estado, la jerarquía y la naturaleza de cada enlace.

Gracias a estas clases generadas dinámicamente, puedes aplicar estilos para resaltar la página en la que se encuentra el usuario, estilizar menús desplegables o diferenciar enlaces a categorías de enlaces a páginas estáticas, todo ello mediante puro CSS y sin escribir lógica condicional en PHP.

### Clases de estado y contexto

WordPress evalúa la URL actual del visitante y la compara con los enlaces del menú para asignar clases de estado. A continuación, se detallan las clases más críticas que debes dominar:

| Clase CSS | Cuándo se aplica | Uso práctico típico |
| --- | --- | --- |
| `current-menu-item` | El enlace corresponde exactamente a la URL que el usuario está visitando en ese momento. | Resaltar el elemento activo (ej. texto en negrita, color primario o subrayado). |
| `current-menu-parent` | El enlace es el padre directo del elemento que el usuario está visitando actualmente. | Mantener un menú desplegable abierto o resaltar el padre cuando el usuario navega por un submenú. |
| `current-menu-ancestor` | El enlace es un ancestro (abuelo, bisabuelo) del elemento que el usuario está visitando. | Útil en menús multinivel (más de 2 niveles) para marcar la ruta ("migas de pan" visuales) en la navegación lateral. |
| `menu-item-has-children` | El elemento `<li>` contiene un submenú (`<ul>` anidado). | Añadir un icono de flecha hacia abajo (`▼`) mediante el pseudo-elemento `::after` en CSS. |

### Clases de tipo de objeto

Además del estado, WordPress informa sobre qué tipo de entidad representa el enlace en la base de datos:

* **Taxonomías y Post Types:** Clases como `menu-item-type-post_type` (si es una página o entrada) o `menu-item-type-taxonomy` (si es una categoría o etiqueta).
* **Objeto específico:** Clases como `menu-item-object-page`, `menu-item-object-category`, o `menu-item-object-custom` (para enlaces personalizados introducidos manualmente).
* **Identificadores:** `menu-item-XX` donde "XX" es el ID único del elemento en la base de datos, útil si necesitas aplicar un estilo a un enlace muy específico (como un botón de "Donar" o "Contacto").

### Filtrando la "sopa de clases"

En proyectos modernos, especialmente al integrar utilidades CSS como Tailwind o metodologías como BEM, el exceso de clases nativas puede ensuciar el DOM. Si no vas a usar la mayoría de estas clases, la mejor práctica es filtrarlas antes de que se impriman.

Para ello, utilizamos el filtro `nav_menu_css_class`. El siguiente código en `functions.php` demuestra cómo limpiar el array de clases, conservando únicamente las esenciales para el diseño y eliminando las redundantes:

```php
/**
 * Limpia las clases CSS inyectadas en los elementos del menú.
 */
function mi_theme_limpiar_clases_menu( $classes, $item, $args ) {
    // 1. Definir qué clases queremos conservar
    $clases_permitidas = array(
        'current-menu-item',
        'current-menu-parent',
        'current-menu-ancestor',
        'menu-item-has-children'
    );

    // 2. Intersectar el array original con el nuestro
    $clases_limpias = array_intersect( $classes, $clases_permitidas );

    // 3. Añadir una clase base personalizada (metodología BEM opcional)
    $clases_limpias[] = 'nav__item';

    // Si es el elemento actual, podemos mapearlo a una clase de nuestro framework
    if ( in_array( 'current-menu-item', $classes ) ) {
        $clases_limpias[] = 'nav__item--active'; // O 'text-blue-500 font-bold' en Tailwind
    }

    return $clases_limpias;
}
add_filter( 'nav_menu_css_class', 'mi_theme_limpiar_clases_menu', 10, 3 );

```

Del mismo modo, WordPress ofrece filtros paralelos para otras partes del menú, como `nav_menu_submenu_css_class` (para las clases de los `<ul>` anidados) y `nav_menu_link_attributes` (para manipular los atributos del enlace `<a>` directamente). Conocer y utilizar estos filtros te permite tener el control absoluto del renderizado HTML sin necesidad de recurrir a la compleja extensión de la clase Walker vista en la lección anterior.

## Resumen del capítulo

En este capítulo hemos desgranado la arquitectura de los menús de navegación en WordPress, separando claramente la gestión de datos de su presentación en pantalla.

Comenzamos registrando ubicaciones semánticas con `register_nav_menus()` para habilitar la interfaz de usuario en el panel de administración. Luego, exploramos cómo la función `wp_nav_menu()` extrae esa información y la renderiza en el frontend, analizando los parámetros que nos permiten controlar sus contenedores. Para requisitos estructurales avanzados, aprendimos a extender la clase `Walker_Nav_Menu`, obteniendo control total sobre la iteración del árbol DOM. Finalmente, comprendimos la lógica detrás de las clases CSS inyectadas por el core, utilizando filtros para mantener un marcado limpio, eficiente y adaptado a las necesidades específicas de nuestro framework de diseño. Dominar este flujo te garantiza poder integrar cualquier diseño de cabecera o pie de página por complejo que sea.
