En el paradigma del Full Site Editing, los Block Patterns han revolucionado la interacción con el diseño web. En lugar de iniciar desde cero, los patrones ofrecen composiciones prefabricadas que los usuarios insertan con un clic. En este capítulo, descubriremos cómo crear y empaquetar estas estructuras complejas dentro de tu theme. Aprenderás a registrarlos vía PHP, a proteger tus maquetaciones de ediciones accidentales mediante la API de bloqueos (Block Locking), y a integrar estas piezas directamente en el núcleo de tus plantillas y Custom Post Types. Prepárate para dominar la herramienta más potente contra el síndrome del lienzo en blanco.

## 15.1 Qué son los Block Patterns

En el ecosistema del Full Site Editing y el editor de bloques de WordPress, enfrentarse a una página completamente vacía puede resultar intimidante para los creadores de contenido. Los **Block Patterns** (o Patrones de Bloques) son la solución nativa a este problema del "lienzo en blanco". Conceptualmente, un patrón de bloques es una colección predefinida y organizada de bloques que forman un diseño complejo y listo para ser insertado con un solo clic.

A diferencia de un tema clásico donde los diseños de página complejos dependían de *page builders* de terceros o de intrincados *shortcodes*, los Block Patterns utilizan exclusivamente la sintaxis de bloques nativa. Esto permite a los desarrolladores de themes empaquetar secciones de diseño estructuradas —como una tabla de precios, una cabecera tipo "Hero" con imagen de fondo y botones, o una cuadrícula de testimonios— y ofrecerlas directamente en el insertador del editor.

### Características fundamentales de los Patrones

Para comprender el rol de los Block Patterns en la arquitectura moderna de WordPress, es esencial destacar su comportamiento estático en el origen pero dinámico en el uso:

1. **Desacoplamiento tras la inserción:** Cuando un usuario añade un patrón a su página, los bloques que lo componen se copian al editor. A partir de ese milisegundo, los bloques pierden toda conexión con el patrón original. Si modificas el código del patrón en el theme semanas después, las instancias que los usuarios ya habían insertado en sus páginas no sufrirán ningún cambio.
2. **Uso de bloques nativos o personalizados:** Los patrones no introducen nuevos bloques. Son simplemente una coreografía de bloques ya existentes (como Párrafo, Grupo, Imagen o Columnas) preconfigurados con atributos específicos (colores, espaciados, tipografías).
3. **No requieren acceso a la base de datos para su declaración:** Aunque pueden registrarse mediante PHP, en los Block Themes modernos los patrones existen como simples archivos en el sistema de archivos del theme, lo que facilita el control de versiones y el despliegue.

### Diferencias con otras estructuras de bloques

Es común confundir los Block Patterns con otras entidades del Full Site Editing. El siguiente cuadro aclara sus diferencias operativas:

| Concepto | Propósito Principal | Comportamiento tras la inserción |
| --- | --- | --- |
| **Block Pattern** | Diseños prefabricados para acelerar la creación de contenido. | **Independiente.** Se edita libremente sin afectar a otras páginas. |
| **Synced Pattern** (Bloque Reutilizable) | Elementos que deben ser idénticos en todo el sitio web (ej. un banner de oferta). | **Sincronizado.** Un cambio afecta a todas las instancias del sitio. |
| **Template Part** | Áreas estructurales del theme global, como el *Header* o el *Footer*. | **Global.** Modifica la estructura subyacente del sitio completo. |

### La anatomía interna de un Patrón

Bajo el capó, un Block Pattern no es más que marcado HTML comentado, exactamente igual al que WordPress guarda en la tabla `wp_posts` cuando el usuario guarda una entrada. Este marcado contiene los atributos de cada bloque en formato JSON dentro de los comentarios HTML.

A continuación, se ilustra cómo se ve el "código fuente" de un patrón sumamente básico (un grupo que contiene un encabezado y un párrafo):

```html
<div class="wp-block-group">
    <h2 class="wp-block-heading has-text-align-center">Bienvenido a nuestro servicio</h2>
    <p class="has-text-align-center">Este es un diseño predefinido listo para usar.</p>
    </div>

```

### Flujo de trabajo del usuario vs. Flujo del desarrollador

El éxito de los patrones radica en la separación de responsabilidades entre quien diseña el tema y quien crea el contenido. El diagrama a continuación ilustra esta relación:

```text
[ Desarrollador del Theme ]
          |
          v
1. Diseña la estructura en el Editor de Sitios.
2. Copia el marcado de los bloques.
3. Lo empaqueta como un archivo de Patrón en el theme.
          |
          v
[ Catálogo de Patrones de WordPress ]
          |
          v
[ Usuario Final ]
1. Navega por las categorías (Headers, Footers, Text, etc.).
2. Inserta el patrón deseado con un clic.
3. Reemplaza textos e imágenes libremente (Totalmente desacoplado).

```

Entender que los patrones son, en esencia, plantillas de "copiar y pegar" automatizadas a nivel de software, es el primer paso para utilizarlos como herramienta de estandarización visual. En las siguientes secciones exploraremos cómo integrarlos técnicamente dentro de nuestro theme.

## 15.2 Registro vía código PHP

Aunque las últimas versiones de WordPress permiten registrar patrones simplemente colocando archivos en una carpeta `/patterns/` dentro del theme, el registro manual mediante código PHP sigue siendo una técnica esencial. Utilizar PHP te otorga control absoluto para registrar patrones dinámicamente, condicionar su aparición (por ejemplo, basándose en si un plugin específico está activo) o mantener la compatibilidad en ecosistemas híbridos.

El proceso completo se divide en dos pasos fundamentales que deben ejecutarse durante el hook `init`: el registro de la categoría (opcional pero recomendado) y el registro del patrón en sí.

### Creación de categorías personalizadas

Para evitar que tus patrones se pierdan en el mar de diseños predeterminados de WordPress, el primer paso es crear un "hogar" para ellos en el insertador de bloques. Esto se logra mediante la función `register_block_pattern_category()`.

La función recibe dos parámetros: el identificador único (slug) de la categoría y un array con las propiedades.

```php
add_action( 'init', 'mi_tema_registrar_categorias_patrones' );
function mi_tema_registrar_categorias_patrones() {
    register_block_pattern_category(
        'mi-tema-cabeceras',
        array(
            'label' => __( 'Cabeceras (Mi Tema)', 'mi-tema' ),
        )
    );
}

```

### La función register_block_pattern()

Una vez que tenemos nuestra categoría, utilizamos `register_block_pattern()` para inyectar nuestro diseño en el editor. Esta función requiere el prefijo único del patrón (formato `namespace/slug`) y un array de configuración.

A continuación, se detallan las propiedades clave que puedes definir en el array de configuración:

| Propiedad | Tipo | Descripción |
| --- | --- | --- |
| **title** | *String* | (Obligatorio) El nombre visible del patrón en el editor. Debe ser traducible. |
| **content** | *String* | (Obligatorio) El código HTML sin procesar que compone los bloques del patrón. |
| **description** | *String* | Un texto oculto visualmente utilizado para mejorar la accesibilidad y las búsquedas. |
| **categories** | *Array* | Lista de slugs de categorías donde aparecerá este patrón. |
| **keywords** | *Array* | Términos clave para ayudar al usuario a encontrar el patrón mediante el buscador del insertador. |
| **viewportWidth** | *Integer* | Define el ancho en píxeles del iframe que previsualiza el patrón en el insertador. |
| **blockTypes** | *Array* | Nombres de bloques específicos (ej. `core/query`). El patrón se sugerirá al interactuar con esos bloques. |

### Ejemplo completo de implementación

El mayor desafío al registrar patrones vía PHP es la gestión del string `content`. Al tratarse de HTML extenso con comillas dobles y sintaxis JSON en los comentarios, es fácil cometer errores de sintaxis si se escribe directamente como un string literal.

Una práctica profesional es separar el marcado HTML en un archivo independiente o capturarlo en una variable limpia.

```php
add_action( 'init', 'mi_tema_registrar_patrones_bloques' );
function mi_tema_registrar_patrones_bloques() {
    
    // 1. Registramos una categoría personalizada
    register_block_pattern_category(
        'mi-tema-servicios',
        array( 'label' => __( 'Servicios', 'mi-tema' ) )
    );

    // 2. Definimos el contenido del bloque
    // En un entorno real, este HTML se extrae copiando los bloques desde el editor.
    $patron_html = '
    <div class="wp-block-group">
        <div class="wp-block-columns">
            <div class="wp-block-column">
                <h3>Servicio 1</h3>
                <p>Descripción detallada de nuestro primer servicio.</p>
                </div>
            <div class="wp-block-column">
                <h3>Servicio 2</h3>
                <p>Descripción detallada de nuestro segundo servicio.</p>
                </div>
            </div>
        </div>
    ';

    // 3. Registramos el patrón
    register_block_pattern(
        'mi-tema/cuadricula-servicios',
        array(
            'title'       => __( 'Cuadrícula de Servicios', 'mi-tema' ),
            'description' => _x( 'Dos columnas con títulos y descripciones de servicios.', 'Block pattern description', 'mi-tema' ),
            'content'     => trim( $patron_html ),
            'categories'  => array( 'mi-tema-servicios' ),
            'keywords'    => array( 'servicios', 'columnas', 'destacados' ),
        )
    );
}

```

### Extracción de contenido mediante archivos (File-based approach)

Si los patrones son muy complejos, mantener cadenas de texto gigantes en tu archivo `functions.php` (o en las clases de registro) viola el principio de limpieza de código. Una alternativa robusta es utilizar funciones nativas de PHP como `ob_start()` y `ob_get_clean()` para importar el HTML desde archivos `.php` separados, o simplemente leer el contenido con `file_get_contents()`.

```php
// Ejemplo de lectura desde un archivo externo
$ruta_patron = get_theme_file_path( '/inc/patterns/raw/hero-principal.html' );

if ( file_exists( $ruta_patron ) ) {
    register_block_pattern(
        'mi-tema/hero-principal',
        array(
            'title'      => __( 'Hero Principal', 'mi-tema' ),
            'content'    => file_get_contents( $ruta_patron ),
            'categories' => array( 'mi-tema-cabeceras' ),
        )
    );
}

```

Este enfoque mantiene la lógica PHP estrictamente separada del marcado estático, facilitando el mantenimiento y permitiendo que otros miembros del equipo modifiquen el diseño sin tocar la infraestructura del tema.

## 15.3 Uso de atributos y bloqueos

Entregar patrones de diseño complejos a los usuarios finales conlleva un riesgo inherente: la fragilidad estructural. Un clic equivocado puede eliminar una columna clave, arrastrar un elemento fuera de su contenedor o alterar un margen crítico, destruyendo por completo la armonía visual que diseñaste. Para mitigar este problema, WordPress proporciona un potente sistema de atributos y políticas de bloqueo (Block Locking) que se incrusta directamente en el código de tus patrones.

### Personalización mediante Atributos

Antes de bloquear un patrón, debemos definir su estado visual inicial. Como vimos en los capítulos de fundamentos, la configuración de un bloque (colores, tipografía, alineación, espaciados) se almacena como un objeto JSON dentro del comentario HTML de apertura. Estos son los **atributos**.

Al crear un patrón, preconfigurar estos atributos es lo que le otorga su identidad visual. Compara un bloque de párrafo estándar con uno enriquecido:

```html
<p>Texto de ejemplo.</p>
<p class="has-contrast-background-color has-base-color has-text-color has-background has-large-font-size">Texto destacado.</p>

```

> **Nota técnica:** Observa que, en el marcado estático del patrón, si defines atributos de color o tamaño en el JSON, es obligatorio inyectar manualmente las clases CSS correspondientes (`has-contrast-background-color`, etc.) en la etiqueta HTML para que el renderizado inicial en el editor sea idéntico al del frontend.

### La API de Block Locking (Bloqueo de Bloques)

Una vez que el patrón tiene el aspecto deseado, aplicamos restricciones para evitar su ruptura. El bloqueo permite limitar las acciones que un usuario puede realizar sobre bloques específicos. Existen tres metodologías principales que debes dominar:

#### 1. Bloqueo a nivel de bloque individual (`lock`)

El atributo `lock` se aplica a un bloque específico y acepta un objeto con dos propiedades booleanas. Es ideal para elementos singulares que no deben desaparecer, como una imagen destacada dentro de una tarjeta.

* `move`: Si es `true`, el usuario no puede arrastrar el bloque hacia arriba o abajo en el flujo del documento.
* `remove`: Si es `true`, el usuario no puede eliminar el bloque del editor.

**Ejemplo de sintaxis:**

```html
<figure class="wp-block-image size-large"><img src="imagen-hero.jpg" alt=""/></figure>

```

#### 2. Bloqueo de plantillas en contenedores (`templateLock`)

Cuando trabajas con bloques contenedores estructurales (como Grupo, Columnas, o Fondo), puedes restringir lo que ocurre con sus bloques descendientes directos utilizando el atributo `templateLock`. Esta directiva protege la "cuadrícula" del patrón.

| Valor de `templateLock` | Efecto en los bloques internos (InnerBlocks) |
| --- | --- |
| `"all"` | Congela la estructura. No se pueden añadir nuevos bloques, ni eliminar ni reordenar los existentes. El usuario solo puede editar el contenido (texto/imágenes). |
| `"insert"` | Impide añadir bloques nuevos o eliminar los actuales, pero **permite** reordenarlos entre sí. |
| `false` | (Comportamiento por defecto). Libertad total. |

**Ejemplo de uso en un diseño de dos columnas inmutable:**

```html
<div class="wp-block-columns">
    <div class="wp-block-column">
        <p>Columna 1</p></div>
    <div class="wp-block-column">
        <p>Columna 2</p></div>
    </div>

```

#### 3. El paradigma "Content Only" (Edición de solo contenido)

Introducido como una evolución del sistema de bloqueos, el modo `contentOnly` transforma radicalmente la experiencia del usuario. Cuando se aplica este bloqueo a un contenedor principal (como un Grupo), la barra lateral de configuración del editor oculta todas las herramientas de diseño complejas (paddings, márgenes, tipografías avanzadas, colores).

El usuario solo ve una interfaz simplificada que le permite interactuar exclusivamente con el contenido real: modificar el texto de los encabezados y párrafos, cambiar las imágenes o actualizar las URLs de los botones. El diseño estructural se vuelve completamente opaco y seguro.

```html
<div class="wp-block-group">
    <h2>Título del Patrón</h2>
    <p>El usuario no podrá romper el diseño de esta sección, solo editar las palabras.</p>
    </div>

```

### Estrategia de Bloqueo Progresivo

Aplicar un bloqueo absoluto (`templateLock: "all"`) a todos los patrones puede resultar frustrante para usuarios que desean cierta flexibilidad creativa. La mejor práctica en el desarrollo de themes modernos es aplicar el "Bloqueo Progresivo":

1. **Patrones estructurales (Headers/Footers):** Usa `contentOnly` o `templateLock: "all"` para garantizar que la disposición de la marca permanezca inalterable.
2. **Patrones de contenido (Tablas de precios, Testimonios):** Utiliza bloqueos a nivel de bloque (`lock: {"remove": true}`) en los contenedores de las columnas principales para que no se borren por accidente, pero permite que los usuarios añadan nuevos párrafos en su interior.
3. **Patrones decorativos o de flujo libre:** Déjalos sin restricciones para fomentar la experimentación del creador de contenido.

## 15.4 Integración con templates

El verdadero potencial de los Block Patterns se despliega cuando dejan de ser elementos manuales en el insertador y se integran de forma nativa en la estructura de tu theme. Un patrón puede incrustarse directamente dentro de plantillas HTML (en Block Themes), invocarse mediante código en entornos clásicos (PHP), o utilizarse como la base arquitectónica obligatoria al crear nuevas páginas.

Es fundamental aclarar una confusión habitual al dar el salto al Full Site Editing: al integrar un patrón o una parte de plantilla mediante código HTML, la sintaxis consta únicamente de un comentario de autocierre. Aunque visualmente en tu editor de código pueda parecer un "bloque de código vacío" o un comentario aislado sin contenido interno, esta es la directiva exacta y completa que el motor de WordPress lee para ir a buscar el patrón e inyectar todo su diseño en ese punto.

### Inserción de Patrones en Block Themes (HTML)

En la arquitectura FSE, las plantillas (ubicadas en la carpeta `/templates/`) son archivos puramente HTML. Para renderizar un patrón dentro de estos archivos estáticos, utilizamos el bloque nativo `core/pattern`.

Como mencionamos, la sintaxis no envuelve contenido visible en el archivo, sino que requiere únicamente el atributo `slug` apuntando al identificador del patrón.

#### Ejemplo de una plantilla estructurada con Patrones

A continuación, se muestra cómo se organiza un archivo `templates/archive.html`. Observa cómo la estructura principal se define con bloques de apertura y cierre (como `wp:group` o `wp:query`), pero delega el diseño complejo a patrones autocerrados:

```html
<main class="wp-block-group">
    
    <div class="wp-block-query">
        
        </div>
    </main>

```

### Invocación programática en Themes Clásicos o Híbridos (PHP)

Si estás desarrollando un theme tradicional basado en PHP, no puedes escribir comentarios HTML de Gutenberg directamente en el flujo de PHP esperando que se rendericen. WordPress necesita procesar estos bloques a través de la función `do_blocks()`.

Este enfoque es ideal para inyectar llamadas a la acción (CTAs) al final de todos los artículos de un blog clásico:

```php
<?php
/**
 * Plantilla single.php de un theme clásico
 */
get_header(); ?>

<div id="primary" class="content-area">
    <main id="main" class="site-main">

        <?php
        while ( have_posts() ) :
            the_post();

            // 1. Renderiza el contenido redactado por el usuario en el editor
            the_content();

            // 2. Definimos el patrón de suscripción mediante su comentario estructural
            $patron_suscripcion = '';
            
            // 3. Procesamos y renderizamos el patrón dinámicamente en PHP
            echo do_blocks( $patron_suscripcion );

        endwhile;
        ?>

    </main>
</div>

<?php get_footer(); ?>

```

### Patrones como Plantillas de Inicio (Starter Patterns)

Una de las técnicas más avanzadas para mejorar la experiencia de usuario (UX) es forzar a que un tipo de contenido comience con un diseño predeterminado. En lugar de que el usuario se enfrente a un editor vacío al hacer clic en "Añadir nuevo Servicio", el editor carga automáticamente un patrón completo con textos de relleno e imágenes.

Esto se logra utilizando el argumento `template` al registrar un Custom Post Type. En este array de configuración, declaras explícitamente el bloque `core/pattern` y su respectivo `slug`:

```php
add_action( 'init', 'mi_tema_registrar_cpt_servicio' );
function mi_tema_registrar_cpt_servicio() {
    $args = array(
        'label'         => __( 'Servicios', 'mi-tema' ),
        'public'        => true,
        'show_in_rest'  => true, // Obligatorio para habilitar el Editor de Bloques
        'supports'      => array( 'title', 'editor', 'thumbnail' ),
        
        // Asignamos el patrón como la base estructural de cualquier nuevo post de este tipo
        'template'      => array(
            array( 
                'core/pattern', 
                array( 'slug' => 'mi-tema/layout-inicial-servicio' ) 
            )
        ),
        
        // Protegemos el diseño raíz impidiendo que el usuario borre o mueva los bloques madre
        'template_lock' => 'all', 
    );
    
    register_post_type( 'servicio', $args );
}

```

### Mapa de Flujo: Renderizado de una Plantilla con Patrones

Para visualizar cómo el Core de WordPress procesa esta integración en milisegundos sin intervención manual, observa el siguiente esquema arquitectónico:

```text
[ Navegador solicita URL: /servicios ]
               |
               v
[ Enrutamiento (Template Hierarchy) ] -> Detecta 'archive-servicio.html'
               |
               v
[ Procesador de Bloques (Block Parser) ]
               |
               +---> Lee: |          -> Extrae e inyecta la cabecera.
               |
               +---> Lee: |          |
               |          +---> Busca 'mi-tema/banner-servicios' en memoria.
               |          +---> Desempaqueta el HTML y los atributos internos.
               |          +---> Inyecta los bloques reales en el árbol de renderizado.
               |
               +---> Lee: |          -> Ejecuta la consulta SQL en la base de datos y pagina los resultados.
               |
               v
[ Output final HTML validado y enviado al cliente ]

```

## Resumen del capítulo

En este capítulo hemos abordado el ecosistema de los **Block Patterns** (Patrones de Bloques), la pieza central para escalar y estandarizar el diseño en la era del Full Site Editing. Comprendimos que los patrones actúan como maquetaciones reutilizables y desacopladas que eliminan la fricción del "lienzo en blanco" para los creadores de contenido.

Aprendimos a registrar patrones y categorías de manera programática en PHP, utilizando el hook `init` y extrayendo el marcado HTML desde archivos separados para mantener nuestro código limpio. Exploramos el vital sistema de **Block Locking** (Bloqueo de bloques), aplicando atributos como `lock`, `templateLock` y la directiva `contentOnly` para proteger nuestras maquetaciones complejas de ediciones destructivas por parte de los usuarios.

Finalmente, consolidamos su uso integrándolos dentro de plantillas estáticas HTML mediante la directiva `core/pattern` (comprendiendo que su sintaxis de autocierre no es un bloque vacío, sino un llamado dinámico), procesándolos en entornos clásicos de PHP con `do_blocks()`, y configurándolos como diseños de inicio automáticos (Starter Patterns) vinculados a Custom Post Types. Estas técnicas combinadas garantizan una experiencia de desarrollo modular, segura y altamente escalable.
