El archivo `functions.php` es el verdadero motor lógico de cualquier theme en WordPress. Mientras que las plantillas definen la estructura visual, este archivo dicta **cómo** interactúa tu tema con el core. En este capítulo, aprenderemos a inicializar capacidades vitales del sistema mediante `add_theme_support()` y a registrar tamaños de imagen optimizados para tu diseño.

Además, dejaremos atrás los monolitos de código inmanejables. Estructuraremos el proyecto aplicando la **separación de responsabilidades** e implementaremos **namespaces** y **autocarga de clases** (POO) para lograr una arquitectura limpia, escalable y libre de conflictos.

## 4.1 Inicialización y add_theme_support

El archivo `functions.php` se ejecuta durante cada carga de página en WordPress, justo después de que el core se haya inicializado, pero antes de que se envíe cualquier salida al navegador. Esto lo convierte en el lugar ideal para configurar las características fundamentales de nuestro theme. La principal herramienta para este propósito es la función `add_theme_support()`.

Por defecto, WordPress asume que un theme personalizado es una estructura extremadamente básica. El core no habilitará características modernas como imágenes destacadas, logotipos personalizables o etiquetas de título dinámicas a menos que el theme declare explícitamente que está preparado para manejarlas.

### El Hook de Inicialización (`after_setup_theme`)

Para garantizar que nuestras declaraciones de soporte se registren en el momento exacto dentro del ciclo de carga de WordPress (visto en el Capítulo 1), debemos envolver nuestras llamadas a `add_theme_support()` dentro de una función personalizada y "engancharla" a la acción `after_setup_theme`.

```text
+-------------------+       +-----------------------+       +------------------------+
| Ciclo de Carga WP | ----> | Hook:                 | ----> | Función de tu Theme    |
| (Core Init)       |       | after_setup_theme     |       | (ej. mi_tema_setup)    |
+-------------------+       +-----------------------+       +------------------------+
                                                                        |
                                                                        v
                                                              +------------------------+
                                                              | add_theme_support()    |
                                                              | - title-tag            |
                                                              | - post-thumbnails      |
                                                              | - html5                |
                                                              +------------------------+

```

*Nota: Profundizaremos en la mecánica exacta de los Action Hooks en el Capítulo 5. Por ahora, es suficiente comprender que `after_setup_theme` es el evento estándar y recomendado para inicializar las capacidades visuales e internas del tema.*

### Características Clave de add_theme_support()

La función `add_theme_support( $feature, $arguments )` acepta una cadena de texto con el nombre de la característica y, opcionalmente, un array con configuraciones específicas. A continuación, se detallan las declaraciones más críticas para cualquier desarrollo moderno:

* **`title-tag`**: Delega el control de la etiqueta HTML `<title>` al core de WordPress. Es obligatorio para cumplir con los estándares actuales y evita que tengas que escribir la etiqueta manualmente en el `<head>` (proceso que abordaremos al renderizar el frontend en el Capítulo 12).
* **`post-thumbnails`**: Habilita la caja meta de "Imagen destacada" en el editor de entradas, páginas y Custom Post Types. Sin esta línea, los administradores no tendrán la interfaz necesaria para asignar una imagen representativa a su contenido.
* **`custom-logo`**: Activa el soporte para subir un logotipo desde el Personalizador de WordPress (`Apariencia > Personalizar`). Permite definir dimensiones específicas y comportamientos de recorte (cropping).
* **`html5`**: Indica a WordPress que utilice un marcado HTML5 semántico en lugar del obsoleto XHTML para componentes nativos como formularios de búsqueda, listas de comentarios y galerías.
* **`automatic-feed-links`**: Añade automáticamente enlaces a los feeds RSS de las publicaciones y comentarios dentro de la cabecera del sitio.

### Implementación del Código de Configuración

La estructura estándar para agrupar estas inicializaciones sigue el principio de encapsulamiento. Aquí tienes el bloque de código base que debe existir al principio de tu `functions.php`:

```php
<?php
/**
 * Configuración inicial del tema y registro de soportes.
 */
function mi_tema_setup() {
    // 1. Soporte para traducciones (se detallará en el Capítulo 18)
    load_theme_textdomain( 'mi-tema', get_template_directory() . '/languages' );

    // 2. Títulos gestionados dinámicamente por WordPress
    add_theme_support( 'title-tag' );

    // 3. Soporte para imágenes destacadas en posts y páginas
    add_theme_support( 'post-thumbnails' );

    // 4. Marcado HTML5 moderno para elementos del core
    add_theme_support( 'html5', array(
        'search-form',
        'comment-form',
        'comment-list',
        'gallery',
        'caption',
        'style',
        'script',
    ) );

    // 5. Configuración del logotipo personalizado
    add_theme_support( 'custom-logo', array(
        'height'               => 100,
        'width'                => 400,
        'flex-height'          => true,
        'flex-width'           => true,
        'header-text'          => array( 'site-title', 'site-description' ),
        'unlink-homepage-logo' => true,
    ) );

    // 6. Enlaces RSS automáticos en el <head>
    add_theme_support( 'automatic-feed-links' );
}

// Enganchamos la función al ciclo de inicialización del tema
add_action( 'after_setup_theme', 'mi_tema_setup' );

```

### Comportamiento y Contexto Global

Es fundamental destacar que `add_theme_support()` afecta globalmente al comportamiento del core y del panel de administración. Por ejemplo, al declarar `post-thumbnails`, WordPress no solo modifica la interfaz de la base de datos y la pantalla de edición, sino que también expone funciones como `the_post_thumbnail()` para su uso en las plantillas (herramientas que veremos junto a The Loop en el Capítulo 7).

Agrupar todas estas declaraciones en una única función de configuración (`setup`) asegura que las características estén registradas a tiempo para que otros plugins o scripts del core puedan detectarlas e interactuar con ellas adecuadamente antes de que comience el enrutamiento visual de la jerarquía de plantillas.

## 4.2 Tamaños de imagen personalizados

Cuando un usuario sube una imagen a la Biblioteca de Medios, el core de WordPress realiza una tarea fundamental en segundo plano: procesa el archivo original y genera múltiples copias redimensionadas. Por defecto, WordPress crea los tamaños *Thumbnail*, *Medium*, *Large* (cuyas dimensiones se configuran en `Ajustes > Medios`), además del tamaño completo original.

En el desarrollo de un theme profesional, estos tamaños predeterminados rara vez son suficientes. Tu diseño probablemente requerirá proporciones específicas para diferentes contextos: un banner panorámico en la cabecera, miniaturas cuadradas perfectas para una cuadrícula de artículos, o imágenes en formato retrato para perfiles de usuario. Cargar una imagen de 2000 píxeles para mostrarla en un recuadro de 300 píxeles es un error grave de rendimiento (tema que abordaremos en profundidad en el Capítulo 17).

Para registrar nuevas dimensiones que WordPress debe generar, utilizamos la función `add_image_size()`.

### La función add_image_size()

Esta función debe invocarse dentro del hook `after_setup_theme`, idealmente en la misma función de inicialización que creamos en la sección 4.1. Su sintaxis es la siguiente:

```php
add_image_size( string $name, int $width, int $height, bool|array $crop = false );

```

* **`$name`**: Un identificador único en minúsculas (ej. `'mi-tema-hero'`).
* **`$width`**: Ancho máximo en píxeles.
* **`$height`**: Alto máximo en píxeles.
* **`$crop`**: Define el comportamiento de redimensionamiento (Soft Crop vs. Hard Crop).

### Modos de recorte: Soft Crop vs. Hard Crop

Entender el cuarto parámetro (`$crop`) es vital para garantizar que tu diseño no se rompa cuando los usuarios suban imágenes con proporciones inesperadas.

```text
+---------------------------------------------------------------+
| CASO DE ESTUDIO:                                              |
| Imagen original subida: 1000px ancho x 1000px alto (Cuadrada) |
| Tamaño registrado: 500px ancho x 300px alto                   |
+---------------------------------------------------------------+
          |
          |
          v
+-------------------------+      +-------------------------+
| MODO SOFT CROP (false)  |      | MODO HARD CROP (true)   |
+-------------------------+      +-------------------------+
| Escala la imagen        |      | Recorta la imagen       |
| proporcionalmente sin   |      | forzando las medidas    |
| cortar nada. Se detiene |      | exactas. Se pierde      |
| cuando alcanza el       |      | información visual de   |
| primer límite (ancho o  |      | los bordes.             |
| alto).                  |      |                         |
|                         |      |                         |
| Resultado: 300x300 px   |      | Resultado: 500x300 px   |
+-------------------------+      +-------------------------+

```

Por defecto, `$crop` es `false` (Soft Crop). Si lo cambias a `true` (Hard Crop), WordPress recortará la imagen desde el centro exacto.

A partir de WordPress 3.9, puedes pasar un array al parámetro `$crop` para especificar exactamente desde dónde debe realizarse el recorte rígido, definiendo los ejes X e Y:

```php
// Recorta la imagen forzando los 1200x400px, pero comenzando desde arriba al centro.
add_image_size( 'hero-banner', 1200, 400, array( 'center', 'top' ) ); 

```

### Integración en el archivo functions.php

Ampliando el código de la sección anterior, así es como registraríamos una serie de tamaños personalizados para nuestro theme:

```php
<?php
function mi_tema_setup() {
    // Requisito indispensable: Habilitar miniaturas primero
    add_theme_support( 'post-thumbnails' );

    // 1. Soft Crop: Escala la imagen para que encaje en 800x600 (ideal para artículos)
    add_image_size( 'blog-destacada', 800, 600, false );

    // 2. Hard Crop al centro: Fuerza un cuadrado perfecto de 300x300 (ideal para grids)
    add_image_size( 'miniatura-cuadrada', 300, 300, true );

    // 3. Hard Crop posicional: Banner de 1200x400, recortado desde la izquierda y el centro
    add_image_size( 'hero-banner', 1200, 400, array( 'left', 'center' ) );
}
add_action( 'after_setup_theme', 'mi_tema_setup' );

```

### Exponer los tamaños en el Editor de Bloques

Al registrar un tamaño con `add_image_size()`, este queda disponible para ser invocado mediante código PHP en tus plantillas (ej. usando `the_post_thumbnail( 'blog-destacada' )`). Sin embargo, **no aparecerá automáticamente** en el menú desplegable de "Tamaño de la imagen" cuando un usuario inserte un bloque de imagen en el editor.

Para hacer que tus tamaños personalizados sean seleccionables por el usuario final, debes filtrarlos utilizando el hook `image_size_names_choose` (exploraremos la mecánica de los filtros en el Capítulo 5):

```php
function mi_tema_nombres_tamanos_imagen( $sizes ) {
    return array_merge( $sizes, array(
        'blog-destacada' => __( 'Imagen Destacada del Blog', 'mi-tema' ),
        'hero-banner'    => __( 'Banner Principal', 'mi-tema' ),
    ) );
}
add_filter( 'image_size_names_choose', 'mi_tema_nombres_tamanos_imagen' );

```

### El problema de la retroactividad

Una de las confusiones más comunes al desarrollar themes es añadir un nuevo `add_image_size()` y notar que las imágenes antiguas no se muestran en el nuevo tamaño.

WordPress **solo genera las copias en el momento en que se sube el archivo**. Si declaras un nuevo tamaño en tu `functions.php`, este no se aplicará retroactivamente a las imágenes que ya están en la Biblioteca de Medios. Para generar estos nuevos recortes en imágenes antiguas, deberás regenerar las miniaturas. Como vimos en el Capítulo 1, la forma más rápida y limpia de hacerlo en un entorno de desarrollo es a través de WP-CLI con el comando:

```bash
wp media regenerate

```

## 4.3 Separación de responsabilidades

El archivo `functions.php` tiene un problema arquitectónico inherente: su nombre invita a los desarrolladores a colocar allí absolutamente cualquier fragmento de código PHP. Sin una disciplina estricta, un proyecto que comienza con 50 líneas de inicialización puede transformarse rápidamente en un monolito inmanejable de miles de líneas que mezcla configuración, encolado de assets, registro de Custom Post Types y lógica de seguridad.

Este enfoque viola el principio de **Separación de Responsabilidades** (Separation of Concerns). Un `functions.php` saturado dificulta el control de versiones en equipo, aumenta la probabilidad de conflictos de nombres de funciones y convierte la depuración de errores en una tarea tediosa.

Para proyectos profesionales, `functions.php` no debe contener la lógica en sí, sino actuar como un **archivo manifiesto** o controlador principal que importa módulos específicos encargados de tareas individuales.

### Estructura de directorios recomendada

La práctica estándar en la comunidad de WordPress es crear un directorio dedicado (generalmente llamado `inc/` o `includes/`) dentro de la raíz del theme para alojar los diferentes módulos lógicos.

A continuación, se muestra un diagrama en texto plano de una estructura modular típica:

```text
mi-tema/
├── style.css
├── index.php
├── functions.php               <-- Controlador principal (solo carga dependencias)
└── inc/                        <-- Directorio de lógica encapsulada
    ├── setup.php               <-- Soportes del tema y tamaños de imagen (Sec. 4.1 y 4.2)
    ├── assets.php              <-- Encolado de CSS y JS (Capítulo 6)
    ├── custom-post-types.php   <-- Registro de CPTs y Taxonomías (Capítulo 8)
    ├── template-tags.php       <-- Funciones reutilizables para las plantillas
    └── security.php            <-- Sanitización y configuraciones de seguridad (Capítulo 16)

```

### Inclusión segura de archivos

Para importar estos módulos dentro de `functions.php`, utilizamos la función nativa de PHP `require_once` (o `require`). Sin embargo, es crucial construir la ruta al archivo utilizando la función de WordPress `get_template_directory()`.

Esta función devuelve la ruta absoluta del servidor hacia el directorio del theme actual, lo cual es mucho más seguro y predecible que usar rutas relativas o constantes mágicas de PHP como `__DIR__`, especialmente cuando el código se ejecuta en diferentes entornos de alojamiento.

*Nota: `get_template_directory()` siempre apunta al theme padre. Si estuvieras desarrollando un theme hijo y quisieras cargar un archivo exclusivo del hijo, deberías usar `get_stylesheet_directory()`, tal como se analizó en el Capítulo 2.*

### Refactorización: De monolito a controlador

Veamos cómo se transforma el código aplicando esta metodología.

**Enfoque incorrecto (Monolito):**
Todas las funciones están declaradas directamente en el archivo principal.

```php
<?php
// functions.php - TODO en un solo lugar (Mala práctica)

function mi_tema_setup() { /* ... 50 líneas ... */ }
add_action( 'after_setup_theme', 'mi_tema_setup' );

function mi_tema_scripts() { /* ... 30 líneas ... */ }
add_action( 'wp_enqueue_scripts', 'mi_tema_scripts' );

function mi_tema_cpt_libros() { /* ... 80 líneas ... */ }
add_action( 'init', 'mi_tema_cpt_libros' );

```

**Enfoque correcto (Modularizado):**
El código anterior se divide en `inc/setup.php`, `inc/assets.php` e `inc/cpt-libros.php`. El archivo `functions.php` queda reducido a un enrutador limpio y legible.

```php
<?php
/**
 * functions.php
 * Archivo principal del theme. Solo carga los módulos necesarios.
 */

// Evitar acceso directo al archivo
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Array de archivos a requerir.
 * Facilita la adición de nuevos módulos en el futuro.
 */
$archivos_inc = array(
    '/inc/setup.php',
    '/inc/assets.php',
    '/inc/cpt-libros.php',
);

// Iterar y cargar cada módulo
foreach ( $archivos_inc as $archivo ) {
    $ruta = get_template_directory() . $archivo;
    
    if ( file_exists( $ruta ) ) {
        require_once $ruta;
    } else {
        // Podrías registrar un error en el debug.log si un archivo clave falta
        error_log( 'Error en el Theme: No se pudo cargar ' . $ruta );
    }
}

```

### Ventajas del sistema modular

1. **Escalabilidad:** Si necesitas añadir un sistema complejo de metaboxes (que veremos en el Capítulo 9), simplemente creas un archivo `inc/metaboxes.php` y lo añades al array de inclusión. El resto del código permanece intacto.
2. **Trabajo en equipo:** Múltiples desarrolladores pueden trabajar en diferentes funcionalidades (por ejemplo, uno en `assets.php` y otro en `security.php`) sin generar conflictos de fusión (*merge conflicts*) en el control de versiones.
3. **Mantenibilidad:** Si hay un error en el encolado de scripts, sabes exactamente qué archivo abrir, reduciendo drásticamente el tiempo de desarrollo.

## 4.4 Autocarga de clases y namespaces

A medida que tu theme crece en complejidad, el paradigma funcional basado en múltiples archivos importados mediante `require_once` (visto en la sección 4.3) puede quedarse corto. Para desarrolladores con experiencia en PHP moderno o frameworks como Laravel y Symfony, la falta de Programación Orientada a Objetos (POO) estructurada en WordPress puede resultar frustrante.

El ecosistema de WordPress es un entorno compartido. Tu theme coexiste con el core y docenas de plugins. Si defines una clase llamada `Setup` o una función llamada `init_assets`, existe una alta probabilidad de que un plugin utilice exactamente el mismo nombre, lo que provocará un error fatal (`Fatal error: Cannot declare class/function`).

Para resolver esto de forma profesional, implementaremos **Namespaces** (espacios de nombres) y **Autocarga de clases** (Autoloading) estándar de PHP.

### Namespaces: Evitando colisiones de nombres

Un *Namespace* actúa como un directorio virtual para tu código. Al envolver tus clases dentro de un espacio de nombres único para tu theme, aíslas tu lógica del resto del ecosistema de WordPress.

En lugar de usar prefijos largos y tediosos en cada nombre de clase (ej. `class Mi_Tema_Libreria_Setup`), los namespaces te permiten mantener nombres limpios:

```php
<?php
// Archivo: inc/Setup/ThemeSetup.php

namespace MiTema\Setup; // Declaración del namespace al inicio del archivo

class ThemeSetup {
    public function init() {
        add_action( 'after_setup_theme', [ $this, 'registrar_soportes' ] );
    }

    public function registrar_soportes() {
        add_theme_support( 'title-tag' );
        add_theme_support( 'post-thumbnails' );
    }
}

```

### Autocarga (Autoloading): Eliminando los require_once

La autocarga es un mecanismo nativo de PHP que carga automáticamente el archivo de una clase en el momento exacto en que se intenta instanciar, eliminando la necesidad de escribir listas interminables de `require_once` en tu `functions.php`.

Existen dos formas principales de implementar la autocarga en un theme de WordPress:

#### 1. Autocarga estándar PSR-4 con Composer

Es la práctica recomendada en la industria. Requiere inicializar un archivo `composer.json` en la raíz de tu theme y definir la ruta de tu código fuente:

```json
{
    "autoload": {
        "psr-4": {
            "MiTema\\": "inc/"
        }
    }
}

```

Al ejecutar `composer dump-autoload` en la terminal, Composer genera un archivo optimizado. Tu `functions.php` se reduce a una sola línea de inclusión:

```php
<?php
// functions.php
require_once get_template_directory() . '/vendor/autoload.php';

// Instanciar la clase principal
$setup = new \MiTema\Setup\ThemeSetup();
$setup->init();

```

#### 2. Autocarga nativa con spl_autoload_register

Si prefieres no depender de herramientas externas como Composer para un theme más ligero, puedes registrar tu propio "autoloader" en `functions.php`. Este método traduce dinámicamente el nombre del namespace a una ruta física en el servidor.

```text
+-------------------------+      Traducción de Autoloader      +---------------------------+
| Instancia PHP           | =================================> | Ruta del Sistema          |
| new \MiTema\Core\Menu() |                                    | /inc/Core/Menu.php        |
+-------------------------+                                    +---------------------------+

```

Implementación de un autoloader personalizado basado en PSR-4:

```php
<?php
// functions.php

spl_autoload_register( function ( $clase ) {
    // 1. Definir el prefijo del namespace de nuestro theme
    $prefijo = 'MiTema\\';
    
    // 2. Definir el directorio base donde residen las clases
    $directorio_base = get_template_directory() . '/inc/';
    
    // 3. Verificar si la clase solicitada utiliza nuestro prefijo
    $longitud = strlen( $prefijo );
    if ( strncmp( $prefijo, $clase, $longitud ) !== 0 ) {
        // No es una clase de nuestro theme, pasar al siguiente autoloader registrado
        return;
    }
    
    // 4. Obtener el nombre relativo de la clase (sin el prefijo 'MiTema\')
    $clase_relativa = substr( $clase, $longitud );
    
    // 5. Reemplazar los separadores de namespace por separadores de directorio y añadir .php
    $archivo = $directorio_base . str_replace( '\\', '/', $clase_relativa ) . '.php';
    
    // 6. Si el archivo existe, requerirlo
    if ( file_exists( $archivo ) ) {
        require $archivo;
    }
});

// A partir de aquí, puedes instanciar cualquier clase de tu theme
// y PHP cargará el archivo correspondiente automáticamente.
$assets = new \MiTema\Assets\GestorScripts();
$assets->init();

```

### Ventajas de esta arquitectura

Al implementar namespaces y autocarga, tu theme adopta una arquitectura verdaderamente escalable:

1. **Rendimiento de memoria:** Los archivos de clases solo se leen y se cargan en la memoria de PHP si el código de esa ejecución específica realmente los necesita.
2. **Código limpio:** El archivo `functions.php` se convierte exclusivamente en el punto de entrada (bootstrap) de la aplicación, sin contener lógica de negocio.
3. **Mantenimiento predecible:** Si necesitas buscar la clase `\MiTema\Taxonomias\CategoriasPersonalizadas`, sabes inmediatamente que el archivo se encuentra en `inc/Taxonomias/CategoriasPersonalizadas.php`.

## Resumen del capítulo

En este capítulo hemos transformado el archivo `functions.php` de un simple contenedor de scripts a un verdadero motor lógico para nuestro theme. Hemos aprendido a inicializar las características esenciales de WordPress mediante `add_theme_support()`, habilitando funcionalidades modernas y declarando tamaños de imagen personalizados de forma eficiente para evitar el sobreconsumo de recursos.

Más allá del código funcional, hemos abordado la arquitectura. Comprendimos la importancia de aplicar el principio de Separación de Responsabilidades aislando los componentes en archivos específicos. Finalmente, elevamos la calidad del proyecto introduciendo Namespaces y Autoloading (POO), técnicas que nos permiten construir themes robustos, escalables y libres de colisiones con el extenso ecosistema de plugins de WordPress. Estas bases lógicas son esenciales para avanzar al siguiente nivel: la manipulación del core mediante el sistema de Hooks.
