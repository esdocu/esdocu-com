El desarrollo de temas en WordPress ha experimentado su transformación más radical con la llegada del Full Site Editing (FSE). Este capítulo marca un punto de inflexión en tu aprendizaje, guiándote en la transición del paradigma clásico basado en PHP hacia la era declarativa de los Block Themes.

Descubrirás cómo el control estructural se delega al Editor del Sitio, alterando por completo la anatomía de tu código. Aprenderás a construir plantillas utilizando únicamente HTML y la sintaxis de bloques de Gutenberg, dominando una arquitectura moderna que democratiza la personalización visual sin sacrificar la escalabilidad ni el rendimiento.

## 13.1 Evolución hacia Block Themes

Durante más de una década, el desarrollo de temas en WordPress siguió un paradigma inamovible: una combinación de PHP, HTML, CSS y JavaScript donde el servidor procesaba las funciones lógicas (como estudiamos a fondo en las Partes I a la IV) para renderizar la interfaz. El editor clásico (TinyMCE) limitaba al usuario a una única área de texto monolítica, mientras que la macroestructura del sitio —como cabeceras, pies de página o barras laterales— dependía estrictamente del código estructurado por el desarrollador o del uso de *Page Builders* comerciales que sobrecargaban el sistema.

La evolución hacia los **Block Themes** (Temas de Bloques) no ocurrió de la noche a la mañana; es la culminación arquitectónica del **Proyecto Gutenberg**, una transición sistemática diseñada para democratizar el diseño web y estandarizar el desarrollo dentro del ecosistema de WordPress.

### La línea de tiempo de la evolución

Para comprender el estado actual de la plataforma, es fundamental visualizar las fases de transición que sentaron las bases tecnológicas de los Block Themes:

```text
Fase 1: Edición de Contenido (Lanzamiento: WordPress 5.0 - 2018) 
[ Editor Clásico ] -----------------> [ Editor de Bloques (Gutenberg) ]
La salida de "the_content()" pasa de ser una masa de HTML estático 
a un lienzo dinámico compuesto por nodos de datos independientes (bloques).

Fase 2: Edición Completa (Lanzamiento: WordPress 5.9 - 2022)
[ Temas Clásicos basados en PHP ] --> [ Full Site Editing (FSE) / Block Themes ]
Los bloques trascienden el área de contenido y asumen el control de 
toda la pantalla (Cabeceras, Pies de página, Plantillas completas).

```

1. **La Era Clásica (Pre-2018):** El desarrollador poseía el control absoluto del *layout* global mediante la Jerarquía de Plantillas en `.php`. La personalización visual para el usuario se gestionaba mediante el *Customizer* (Personalizador) y la API de Widgets, requiriendo interfaces de configuración a menudo complejas.
2. **La Era Transicional (2018 - 2021):** Gutenberg reestructuró el contenido interior. Cada párrafo, imagen o galería se convirtió en un componente React manejado por el editor. Sin embargo, el "envoltorio" o esqueleto del sitio seguía siendo territorio exclusivo del código PHP del tema.
3. **La Era del Full Site Editing (2022 en adelante):** Con la Edición Completa del Sitio (FSE), WordPress elimina las barreras entre el contenido y la interfaz global. Nacen los Block Themes puros. Conceptos como áreas de widgets (`dynamic_sidebar`) o ubicaciones de menú (`wp_nav_menu`) quedan obsoletos frente a bloques nativos de Navegación y fragmentos de plantillas.

### El cambio de paradigma: De PHP a HTML Declarativo

El mayor impacto evolutivo para un programador acostumbrado al ecosistema clásico es el cambio en el lenguaje principal de enrutamiento estructural. Históricamente, se utilizaba PHP no solo para lógica, sino para armar la vista mediante inclusiones:

```php
// Paradigma Clásico: Archivo header.php
<header id="site-header" class="site-header">
    <?php
    if ( has_nav_menu( 'primary' ) ) {
        wp_nav_menu( array( 
            'theme_location' => 'primary',
            'menu_class'     => 'nav-menu'
        ) );
    }
    ?>
</header>

```

En el paradigma de los Block Themes, esta lógica del lado del servidor se abstrae por completo en el core de WordPress. Los archivos que definen la estructura ya no tienen extensión PHP, sino que son archivos HTML formados por **Gutenberg Block Markup**, un lenguaje de marcado basado en comentarios HTML estandarizados que almacenan atributos en formato JSON:

```html
<header id="site-header" class="wp-block-group site-header">
    <div class="wp-block-group">
        </div>
    </header>

```

### El propósito arquitectónico detrás del cambio

El salto evolutivo hacia este modelo resuelve fricciones históricas tanto para creadores como para usuarios:

* **Estandarización nativa:** Antes de FSE, cada desarrollador de plugins o temas multipropósito creaba su propio motor de maquetación (Divi, Elementor, WPBakery). Los Block Themes unifican la construcción estructural bajo una única API nativa, mejorando la compatibilidad transversal.
* **Optimización de rendimiento:** Al delegar la renderización al motor interno del core en lugar de a complejos bucles PHP y frameworks CSS de terceros, WordPress es capaz de aplicar carga condicional. Solo se imprimen en el frontend los estilos (CSS) de los bloques exactos que están presentes en la vista actual.
* **Delegación de control visual:** FSE transfiere la capacidad de alterar la arquitectura visual (como modificar la plantilla de error 404 o el diseño de un archivo de categoría) directamente al administrador del sitio.

Bajo este nuevo enfoque, el rol del desarrollador muta significativamente. En lugar de escribir intrincadas funciones PHP para imprimir el HTML, la responsabilidad moderna consiste en configurar sistemas de diseño centralizados, declarar paletas y tipografías, y curar la experiencia de edición ensamblando patrones de bloques que el usuario final pueda consumir de forma segura e intuitiva.

## 13.2 Diferencias con temas clásicos

Para dominar el desarrollo de Block Themes, es indispensable desaprender ciertas metodologías que fueron el estándar de la industria durante años. Mientras que los temas clásicos dependen de una estrecha relación entre funciones PHP, ganchos (hooks) y hojas de estilo pesadas, los Block Themes adoptan un enfoque declarativo y modular.

La diferencia fundamental radica en el **control de la estructura de la página**. En el paradigma clásico, el desarrollador dicta la estructura mediante código rígido; en el paradigma de bloques, el desarrollador provee las herramientas y límites, pero el usuario final o el ensamblador del sitio tiene el control total de la estructura visual directamente desde el panel de administración.

### Comparativa Arquitectónica

A continuación, se desglosan las diferencias técnicas y conceptuales más importantes entre ambos enfoques:

| Característica | Tema Clásico | Block Theme (FSE) |
| --- | --- | --- |
| **Lenguaje de Plantillas** | PHP (`.php`) con HTML y funciones de WordPress integradas. | HTML (`.html`) con marcado de bloques de Gutenberg (JSON en comentarios). |
| **Punto de Entrada de Estilos** | `style.css` procesado a través de `wp_enqueue_style()`. | `theme.json` que genera variables CSS y estilos inline automáticamente. |
| **Centro Lógico** | `functions.php` para registrar soportes, áreas de widgets y menús. | `theme.json` asume gran parte de las declaraciones; `functions.php` se reduce a lógica pura. |
| **Personalización Global** | A través del *Customizer* (Personalizador) basado en la API de PHP. | A través del *Site Editor* (Editor del Sitio) basado en la interfaz gráfica de bloques. |
| **Menús y Widgets** | Registrados por código (`wp_nav_menu`, `dynamic_sidebar`). | Insertados como Bloques (`core/navigation`, `core/latest-posts`). |
| **Estructuras Reutilizables** | `get_template_part()`, `get_header()`, `get_footer()`. | Partes de plantilla (`template-parts`) llamadas mediante bloques (`wp:template-part`). |

### 1. La obsolescencia de las funciones envolventes

En un tema clásico, la construcción de cualquier vista dependía de invocar partes de la interfaz a través de funciones PHP específicas. Cada archivo del *Template Hierarchy* (como `single.php` o `page.php`) requería estas llamadas para mantener la coherencia del diseño:

```php
// Estructura de un page.php en un Tema Clásico
<?php get_header(); ?>

<main id="primary" class="site-main">
    <?php
    while ( have_posts() ) :
        the_post();
        get_template_part( 'template-parts/content', 'page' );
    endwhile;
    ?>
</main>

<?php get_sidebar(); ?>
<?php get_footer(); ?>

```

En un Block Theme, las funciones `get_header()`, `get_footer()` y `get_sidebar()` ya no se utilizan en las plantillas principales. La unión de estas secciones se realiza de forma declarativa dentro del archivo HTML de la plantilla, llamando al bloque `core/template-part`:

```html
<!-- Estructura de un page.html en un Block Theme -->
<!-- wp:template-part {"slug":"header","tagName":"header"} /-->

<main class="wp-block-group">
    <!-- wp:post-title /-->
    <!-- wp:post-content /-->
</main>

<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->

```

### 2. Adiós al Customizer y a las Áreas de Widgets

Una de las transiciones más drásticas es la desaparición de interfaces icónicas de WordPress. Si activas un Block Theme puro, notarás que las opciones **Apariencia > Personalizar** y **Apariencia > Widgets** desaparecen del menú de administración.

* **El Editor del Sitio (Site Editor) reemplaza al Customizer:** El desarrollo de controles personalizados con la API del Customizer (secciones, configuraciones, controles de color) queda obsoleto. Toda la configuración visual del sitio se delega a la sección de "Estilos Globales" dentro del nuevo Editor del Sitio, alimentada por el archivo `theme.json`.
* **Los Bloques reemplazan a los Widgets:** El registro de *Sidebars* mediante `register_sidebar()` en `functions.php` ya no es necesario. Las barras laterales, si el diseño las requiere, se construyen directamente en el Editor del Sitio agrupando bloques de columnas y añadiendo bloques dinámicos (como "Últimas Entradas", "Buscador" o "Comentarios Recientes") en su interior.

### 3. Reducción de la dependencia de CSS global

Históricamente, el archivo `style.css` era el núcleo estético del tema. Los desarrolladores invertían cientos de horas escribiendo media queries, utilidades y clases estructurales.

En los Block Themes, WordPress actúa como un motor de CSS dinámico. Al definir paletas de colores, escalas tipográficas y espaciados en `theme.json`, el core genera automáticamente variables CSS (`--wp--preset--color--primary`) y las imprime directamente en el encabezado (`<head>`). Esto significa que el peso del archivo `style.css` de un Block Theme se reduce drásticamente, quedando reservado únicamente para microinteracciones muy específicas o ajustes finos que los bloques nativos aún no puedan manejar.

### 4. El nuevo rol de functions.php

El archivo `functions.php` no desaparece, pero experimenta una cura de adelgazamiento severa. Dado que el encolado masivo de estilos, el registro de menús (`register_nav_menus`) y el soporte de características visuales (`add_theme_support('custom-logo')`) migran al `theme.json` o al marcado de bloques, PHP queda liberado para enfocarse estrictamente en la **lógica de negocio profunda**, como:

* Registro de *Custom Post Types* y Taxonomías (que abordamos en la Parte III).
* Creación de Endpoints para la API REST.
* Manipulación de peticiones con `pre_get_posts`.
* Registro de Bloques dinámicos personalizados o *Block Patterns* por código.

## 13.3 Estructura de un Block Theme

Con la eliminación de la dependencia de funciones PHP para la maquetación y la introducción de `theme.json`, la anatomía de un tema experimenta una simplificación radical. El directorio raíz de un Block Theme es notablemente más limpio, ya que WordPress ahora exige una convención de carpetas estricta para identificar, enrutar y procesar los archivos del Tema de Bloques.

A continuación, se presenta un diagrama en texto plano que ilustra la estructura de directorios y archivos estándar de un Block Theme moderno:

```text
mi-block-theme/
├── parts/                 # Fragmentos modulares (reemplaza a template-parts)
│   ├── header.html
│   └── footer.html
├── patterns/              # Patrones de bloques registrados automáticamente
│   ├── hero-banner.php
│   └── call-to-action.php
├── styles/                # Variaciones de estilo globales (opcional)
│   ├── oscuro.json
│   └── tipografia-serif.json
├── templates/             # Plantillas correspondientes al Template Hierarchy
│   ├── index.html
│   ├── single.html
│   ├── page.html
│   └── 404.html
├── functions.php          # Motor lógico auxiliar (opcional pero recomendado)
├── index.php              # Archivo fallback (Requerido por WordPress)
├── style.css              # Declaración de metadatos del tema
└── theme.json             # Centro de mando de configuraciones y diseño

```

### Análisis de los componentes estructurales

Para que WordPress reconozca un tema como un "Block Theme" (y habilite el Editor del Sitio), debe existir obligatoriamente la carpeta `templates` con al menos un archivo `index.html` en su interior. Repasemos la función de cada elemento en esta nueva arquitectura.

**1. El directorio `templates/` (El Enrutador Visual)**
En la Parte I del libro estudiamos cómo la Jerarquía de Plantillas decidía qué archivo `.php` cargar (ej. `single.php` para una entrada). En un Block Theme, la jerarquía sigue intacta, pero WordPress ahora busca estos archivos dentro de la carpeta `templates/` y espera que tengan extensión `.html`. Estos archivos contienen exclusivamente el marcado de bloques de Gutenberg, sin rastro de PHP.

**2. El directorio `parts/` (Componentes Reutilizables)**
Reemplaza conceptualmente a la antigua carpeta `template-parts` y a las funciones `get_header()` o `get_footer()`. Aquí residen los archivos `.html` que definen secciones estructurales que se repetirán a lo largo del sitio. Las plantillas dentro de `templates/` invocarán estos archivos mediante el bloque `wp:template-part`.

**3. El archivo `theme.json` (El Centro de Mando)**
Es el corazón del Block Theme. Sustituye la mayor parte de las declaraciones que antes se hacían en `style.css` y `functions.php`. En este archivo JSON se configuran las características permitidas en el editor (como márgenes o espaciados), se declaran las paletas de colores, las fuentes tipográficas y se establecen los estilos por defecto para cada tipo de bloque.

**4. El directorio `styles/` (Variaciones Globales)**
Es una característica exclusiva de FSE. Permite alojar múltiples archivos JSON alternativos que el usuario puede seleccionar desde el panel de "Estilos" en el Editor del Sitio. Por ejemplo, `oscuro.json` podría redefinir las variables de color del `theme.json` principal para ofrecer un "Dark Mode" instantáneo con un solo clic, sin escribir CSS adicional.

**5. El directorio `patterns/` (Diseños Preensamblados)**
Aunque la creación de patrones se puede gestionar desde `functions.php`, los Block Themes modernos utilizan esta carpeta para aprovechar el registro automático. Al colocar archivos `.php` con una cabecera específica en esta carpeta, WordPress los registra como *Block Patterns* listos para que el usuario los inserte en sus páginas.

**6. Los archivos heredados (`style.css` y `index.php`)**
A pesar de la evolución tecnológica, WordPress sigue requiriendo dos archivos fundamentales en la raíz para reconocer el tema:

* `style.css`: Ya no es el contenedor principal de los estilos visuales, pero su cabecera comentada sigue siendo obligatoria para declarar el nombre del tema, el autor y la versión (como vimos en el Capítulo 2).
* `index.php`: En un Block Theme puro, este archivo suele estar completamente vacío o contener un simple comentario `// Silence is golden.` Sirve únicamente como un *fallback* (respaldo) histórico por si el motor de bloques falla al intentar cargar `templates/index.html`.

## 13.4 Partes de plantilla en HTML

La modularidad es un principio fundamental en cualquier arquitectura de software. En el desarrollo clásico de WordPress, fragmentábamos el código utilizando la función `get_template_part()` para evitar la repetición de estructuras como cabeceras, pies de página o tarjetas de contenido. En los Block Themes, este concepto sobrevive intacto pero sufre una mutación sintáctica: pasamos de funciones PHP a etiquetas HTML declarativas.

Las partes de plantilla (*Template Parts*) en el ecosistema de Edición Completa del Sitio (FSE) son archivos `.html` independientes que residen dentro de la carpeta `parts/` de tu theme.

### La sintaxis de invocación

Para insertar una parte de plantilla dentro de un archivo de la carpeta `templates/` (por ejemplo, en `single.html`), WordPress utiliza el bloque nativo `core/template-part`. La invocación se realiza exclusivamente a través de comentarios HTML con formato JSON, conocidos como *Gutenberg Block Markup*.

Analicemos los atributos JSON que configuran este bloque:

* **`slug` (Requerido):** Es el nombre exacto del archivo `.html` ubicado en la carpeta `parts/`, sin la extensión. Si tu archivo es `parts/header.html`, el slug será `"header"`.
* **`tagName` (Opcional):** Define la etiqueta HTML semántica que envolverá a la parte de plantilla una vez renderizada en el frontend. Los valores comunes son `"header"`, `"footer"`, `"main"`, `"section"` o `"div"`.
* **`className` (Opcional):** Permite inyectar clases CSS personalizadas al contenedor de la parte de plantilla para facilitar su estilización o selección mediante JavaScript.
* **`theme` (Opcional):** Ocasionalmente verás este atributo indicando el *text domain* del tema. Ayuda a WordPress a resolver conflictos si existe una parte de plantilla con el mismo nombre en un tema padre o en un plugin.

### Anatomía de un archivo de parte de plantilla

Si abrimos el archivo `parts/header.html` al que hicimos referencia, no encontraremos etiquetas `<html>` o `<head>`. Al igual que en PHP, estos archivos contienen únicamente el fragmento de código necesario para esa sección, escrito íntegramente con bloques de Gutenberg.

```html
<div class="wp-block-group">
    </div>

```

### Arquitectura de carga: Archivos vs. Base de datos

Uno de los conceptos más críticos que debes comprender como desarrollador FSE es la dualidad del origen de datos. En un tema clásico, si modificabas `header.php`, el cambio era inmediato. En un Block Theme, existe un sistema de jerarquía que prioriza las modificaciones del usuario:

```text
[ Flujo de resolución de un Template Part ]

1. ¿El usuario modificó esta parte de plantilla en el Editor del Sitio?
   ├── SÍ --> WordPress carga el marcado HTML desde la tabla 'wp_posts' (CPT: wp_template_part).
   └── NO --> Continúa al paso 2.

2. ¿Existe el archivo correspondiente en el tema activo?
   ├── SÍ --> WordPress carga el archivo (Ej: mi-block-theme/parts/header.html).
   └── NO --> WordPress muestra un error de bloque faltante o vacío en el frontend.

```

Esta arquitectura significa que los archivos `.html` que entregas en tu carpeta `parts/` actúan como **el estado inicial y predeterminado**. Si el usuario entra a **Apariencia > Editor**, edita la cabecera para añadir un nuevo bloque de logotipo y guarda, WordPress guarda esa estructura en la base de datos. A partir de ese momento, el archivo físico `parts/header.html` es ignorado hasta que el usuario decida explícitamente "Borrar personalizaciones" en el editor.

### Categorización de áreas para el Site Editor

Para mejorar la experiencia de usuario final en el Editor del Sitio, es recomendable registrar las partes de plantilla en el archivo `theme.json` bajo la clave `templateParts`. Esto le indica a WordPress qué propósito cumple cada fragmento y en qué área de la interfaz debe agruparlo.

```json
{
  "version": 2,
  "templateParts": [
    {
      "name": "header",
      "title": "Cabecera Principal",
      "area": "header"
    },
    {
      "name": "footer",
      "title": "Pie de Página",
      "area": "footer"
    },
    {
      "name": "sidebar-blog",
      "title": "Barra lateral del Blog",
      "area": "uncategorized"
    }
  ]
}

```

Las áreas válidas son `"header"`, `"footer"` y `"uncategorized"` (general). Al definirlas correctamente, WordPress habilitará atajos rápidos en la interfaz visual para que los administradores del sitio puedan reemplazar o editar estas piezas de forma aislada, manteniendo la integridad estructural del diseño que has programado.

## Resumen del capítulo

En este capítulo hemos explorado el cambio de paradigma más significativo en la historia de WordPress: la transición hacia los Block Themes (Full Site Editing). Hemos visto cómo la lógica de presentación ha migrado del código PHP clásico (`get_header()`, `get_footer()`, *Template Hierarchy* basado en funciones) hacia una estructura declarativa basada en HTML y el marcado de bloques de Gutenberg.

Aprendimos que la estructura interna de un Block Theme se simplifica enormemente, apoyándose en carpetas estandarizadas como `templates/` para el enrutamiento visual y `parts/` para los componentes modulares. Finalmente, detallamos cómo el motor de WordPress procesa ahora estas plantillas, dando siempre prioridad a las personalizaciones del usuario guardadas en la base de datos por encima de los archivos físicos del tema, democratizando así el control sobre el *layout* global del sitio.
