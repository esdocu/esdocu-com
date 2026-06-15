El desarrollo de un plugin profesional no termina cuando el código funciona en tu idioma nativo; el verdadero alcance global requiere una correcta internacionalización (i18n). En este capítulo, prepararás tu base de código para ser localizada a cualquier idioma utilizando el motor `gettext` de WordPress.

Exploraremos las funciones envoltura esenciales, el manejo dinámico de plurales y la desambiguación semántica mediante contexto. Finalmente, dominarás la carga eficiente del dominio de texto (*Text Domain*) y la extracción automatizada de cadenas mediante WP-CLI para generar los archivos de plantilla POT estándar de la industria.

## 15.1 Funciones de traducción básicas

La internacionalización (i18n) en WordPress se fundamenta en el sistema de localización GNU `gettext`. Para que un plugin pueda ser traducido a cualquier idioma, todas las cadenas de texto estáticas legibles por el usuario final o el administrador deben pasar a través de funciones envoltura (*wrapper functions*) específicas. Estas funciones permiten que el motor de WordPress intercepte la cadena original (típicamente escrita en inglés) y devuelva su equivalente traducido basándose en los archivos de traducción activos.

### El concepto de Text Domain

Antes de aplicar cualquier función de traducción, es indispensable definir el *Text Domain* (dominio de texto). Este es un identificador único que WordPress utiliza para asociar las cadenas de texto con los archivos de traducción específicos de tu plugin, evitando colisiones con cadenas homónimas del núcleo o de otros componentes.

Por estándar de desarrollo, el *Text Domain* debe coincidir exactamente con el nombre de la carpeta del plugin (el *slug*). Por ejemplo, si tu plugin se aloja en `wp-content/plugins/mi-gestor-avanzado/`, tu dominio de texto será `mi-gestor-avanzado`.

A continuación se ilustra el flujo lógico que sigue una cadena de texto desde el código fuente hasta la pantalla del usuario:

```text
[ Código Fuente: __('Guardar', 'mi-gestor-avanzado') ]
                         │
                         ▼
           ¿Existe el archivo .mo del plugin?
                         │
         ┌───────────────┴───────────────┐
         ▼ SÍ                            ▼ NO
¿Existe la traducción exacta?            │
         │                               │
   ┌─────┴─────┐                         │
   ▼ SÍ        ▼ NO                      │
[Traducido] [Original]            [Original]
   │           │                         │
   └───────────┼─────────────────────────┘
               ▼
   [ Retorno / Renderizado en Pantalla ]

```

### Las funciones base: `__()` y `_e()`

Las dos herramientas elementales de la i18n en WordPress son `__()` y `_e()`. Ambas asumen la misma firma estructural, pero difieren críticamente en su comportamiento de salida.

#### 1. La función `__()`

Retorna la cadena traducida. Es la función que se debe emplear cuando el texto se va a asignar a una variable, a pasar como argumento a otra función, o a procesar antes de su salida.

```php
function __( $text, $domain = 'default' )

```

#### 2. La función `_e()`

Imprime directamente la cadena traducida en el búfer de salida (`echo`). Es un atajo semántico para `echo __(...)`.

```php
function _e( $text, $domain = 'default' )

```

#### Ejemplo de implementación en el ecosistema de un plugin

```php
<?php
/**
 * Ejemplo de uso correcto de __() y _e() dentro de un metabox.
 */

// Uso de __() para pasar la cadena como argumento a otra función de WordPress
add_meta_box(
    'mga_render_metabox',
    __( 'Configuración Avanzada del Post', 'mi-gestor-avanzado' ), // Retorna el texto
    'mga_callback_metabox',
    'post'
);

function mga_callback_metabox( $post ) {
    // Uso de _e() para renderizar texto directamente en la interfaz del admin
    ?>
    <p>
        <label for="mga_field_custom">
            <?php _e( 'Introduce el identificador único:', 'mi-gestor-avanzado' ); // Imprime el texto ?>
        </label>
    </p>
    <?php
}

```

### La regla de oro del análisis estático

El proceso de generación de catálogos de traducción (archivos POT/PO) se basa en herramientas de **análisis estático de código** (como `xgettext` o la CLI de WordPress). Estas utilidades leen los archivos PHP como cadenas de texto plano buscando llamadas a funciones de i18n; no ejecutan el código PHP.

Por lo tanto, es un error crítico pasar variables, constantes o llamadas a funciones como el texto original o el dominio de texto dentro de las funciones de traducción.

#### Patrones de código incorrectos vs. correctos

```php
<?php
// INCORRECTO: El analizador estático no puede evaluar el valor de la variable.
$mensaje = 'Operación completada con éxito.';
_e( $mensaje, 'mi-gestor-avanzado' );

// INCORRECTO: No se permiten constantes para el texto ni para el dominio.
define( 'MGA_DOMAIN', 'mi-gestor-avanzado' );
_e( 'Guardar cambios', MGA_DOMAIN );

// CORRECTO: Ambas cadenas son literales de texto puro y duro.
_e( 'Operación completada con éxito.', 'mi-gestor-avanzado' );

```

Si necesitas dinamicidad en los textos (por ejemplo, inyectar el nombre de un usuario o un contador), nunca concatenes variables directamente dentro o fuera de la función. Para resolver este escenario de forma internacionalizable, se deben combinar las funciones de traducción básicas con funciones de formateo de cadenas como `sprintf()` o `printf()`, lo cual mantiene el bloque de texto íntegro para los traductores.

```php
<?php
/**
 * Manejo dinámico correcto de variables en cadenas estáticas
 */

$usuario_activo = 'Alejandro';

// INCORRECTO (Rompe la estructura gramatical en otros idiomas y fragmenta la traducción)
echo __( 'Bienvenido de nuevo, ', 'mi-gestor-avanzado' ) . $usuario_activo;

// CORRECTO (Mantiene la cadena unificada usando un marcador de posición)
printf(
    /* translators: %s: Nombre del usuario actual */
    __( 'Bienvenido de nuevo, %s.', 'mi-gestor-avanzado' ),
    $usuario_activo
);

```

*Nota de buenas prácticas:* El comentario inline `/* translators: ... */` colocado inmediatamente antes de la función sirve de metadato de asistencia. Las herramientas de extracción leerán este comentario y se lo mostrarán al traductor en su software de localización, permitiéndole entender qué información reemplazará al modificador `%s`.

## 15.2 Contexto y pluralización

El idioma inglés es comparativamente simple en sus reglas gramaticales y cuenta con una gran cantidad de palabras homónimas (términos que se escriben igual pero tienen significados distintos). Cuando traducimos un plugin a idiomas con estructuras morfológicas más complejas o con diferentes declinaciones, las funciones básicas `__()` y `_e()` resultan insuficientes. Para resolver estos escenarios, WordPress proporciona funciones especializadas que manejan el contexto de las palabras y la pluralización dinámica.

### Desambiguación con Contexto: `_x()` y `_ex()`

Un problema habitual en la internacionalización ocurre cuando una misma palabra en inglés requiere traducciones completamente distintas dependiendo de su función en la interfaz. El clásico ejemplo en WordPress es la palabra "Post". Puede referirse al sustantivo (una entrada del blog) o al verbo (la acción de publicar). En español, se traduciría como "Entrada" y "Publicar", respectivamente.

Si usamos simplemente `__( 'Post', 'mi-gestor-avanzado' )`, el traductor verá la cadena aislada y no sabrá qué variante elegir, forzando un único significado para ambas ubicaciones.

Para aportar esta semántica, utilizamos `_x()` (que retorna el valor) y `_ex()` (que lo imprime directamente). Su firma añade un parámetro adicional para el contexto:

```php
function _x( $text, $context, $domain = 'default' )

```

#### Ejemplo de uso de contexto

```php
<?php
// Mismo texto original, pero con diferentes contextos para guiar al traductor
$boton_submit  = _x( 'Post', 'Acción de publicar en el formulario', 'mi-gestor-avanzado' );
$titulo_columna = _x( 'Post', 'Sustantivo, columna de la tabla', 'mi-gestor-avanzado' );

// En la salida (HTML)
echo '<button type="submit">' . esc_html( $boton_submit ) . '</button>';

```

El analizador estático generará dos entradas distintas en el archivo `.pot`, permitiendo al equipo de traducción asignar valores separados en español ("Publicar" y "Entrada") sin que haya colisiones en el diccionario.

### Pluralización dinámica: `_n()`

Un error frecuente entre desarrolladores es intentar manejar los plurales con una estructura condicional básica en PHP:

```php
// INCORRECTO: No asumas que todos los idiomas tienen solo dos formas (1 o varios).
if ( $count === 1 ) {
    $mensaje = sprintf( __( 'Tienes %d mensaje nuevo.', 'mi-gestor-avanzado' ), $count );
} else {
    $mensaje = sprintf( __( 'Tienes %d mensajes nuevos.', 'mi-gestor-avanzado' ), $count );
}

```

Esta lógica condicional falla estrepitosamente a escala global. Mientras que el inglés o el español tienen dos formas plurales (singular para 1, plural para 0 o más de 1), otros idiomas tienen reglas drásticamente diferentes. El ruso tiene tres formas plurales basadas en la terminación numérica, el árabe tiene hasta seis formas, y el japonés no distingue entre singular y plural.

Para delegar esta complejidad al motor de `gettext`, utilizamos la función `_n()`, la cual evalúa un número entero y determina qué cadena pasar al traductor basándose en las reglas gramaticales del idioma destino.

```php
function _n( $singular, $plural, $number, $domain = 'default' )

```

#### Ejemplo de implementación correcta

Al igual que las cadenas con variables dinámicas, la función `_n()` retorna la plantilla de texto puro, la cual debe ser envuelta por `printf()` o `sprintf()` para inyectar el valor numérico:

```php
<?php
$elementos_borrados = 4;

// CORRECTO: Delegar la decisión de pluralización al motor i18n
$mensaje = sprintf(
    /* translators: %s: Número de elementos eliminados */
    _n(
        'Se ha eliminado %s registro de la base de datos.', // Singular
        'Se han eliminado %s registros de la base de datos.', // Plural
        $elementos_borrados,                                  // Evaluador
        'mi-gestor-avanzado'                                  // Dominio
    ),
    number_format_i18n( $elementos_borrados ) // Valor a inyectar (formateado según el idioma)
);

echo esc_html( $mensaje );

```

*Nota:* Observa el uso de `number_format_i18n()`. Cuando se inyectan números en la interfaz, es una buena práctica formatearlos con esta función nativa, ya que adapta los separadores de miles y decimales a la configuración regional del sitio (ej. `1,000.50` en inglés vs `1.000,50` en español europeo).

### Combinando Contexto y Pluralización: `_nx()`

En interfaces complejas, es posible que necesites pluralización dinámica de un término que además posee múltiples significados (requiriendo contexto). Para esto existe `_nx()`, que fusiona ambos conceptos:

```php
function _nx( $singular, $plural, $number, $context, $domain = 'default' )

```

#### Matriz de funciones de internacionalización

El siguiente esquema resume el uso de las funciones base según la necesidad específica del texto:

```text
                      ¿Necesita Contexto de desambiguación?
                              NO                  SÍ
                        ┌───────────────┐   ┌───────────────┐
                     NO │ Retorno: __() │   │ Retorno: _x() │
 ¿Depende de un         │ Echo:   _e()  │   │ Echo:   _ex() │
 número dinámico?       └───────────────┘   └───────────────┘
                        ┌───────────────┐   ┌───────────────┐
                     SÍ │ Retorno: _n() │   │ Retorno: _nx()│
                        │ Echo: (N/A) * │   │ Echo: (N/A) * │
                        └───────────────┘   └───────────────┘

```

** Las funciones de pluralización no tienen variantes directas de impresión (como `_ne()` que no existe), ya que por naturaleza casi siempre requieren estar anidadas dentro de un `printf()` para inyectar el número real que determinó el plural.*

## 15.3 Carga de dominios de texto

Utilizar las funciones de internacionalización vistas en las secciones anteriores (como `__()` o `_e()`) y definir un dominio de texto (*Text Domain*) es solo la mitad del proceso. Para que WordPress pueda devolver las cadenas traducidas, necesita saber en qué directorio físico se encuentran los catálogos compilados (los archivos `.mo`) que corresponden al idioma activo del sitio.

Este proceso de vinculación se denomina "carga del dominio de texto" y es un paso de configuración esencial en el ciclo de vida de un plugin.

### La función `load_plugin_textdomain()`

La API de WordPress proporciona la función específica `load_plugin_textdomain()` para registrar la ruta donde residen tus traducciones.

```php
load_plugin_textdomain( $domain, $deprecated, $plugin_rel_path );

```

Sus parámetros son:

1. **`$domain`** *(string)*: El identificador único de tu plugin (el mismo que usas en todas las funciones de traducción y en la cabecera `Text Domain`).
2. **`$deprecated`** *(false)*: Un argumento heredado de versiones antiguas de WordPress. Siempre debe pasarse como `false`.
3. **`$plugin_rel_path`** *(string)*: La ruta relativa desde el directorio `wp-content/plugins` hasta la carpeta de traducciones de tu plugin.

### Arquitectura de directorios recomendada

El estándar de la comunidad dicta que los archivos de traducción deben almacenarse en un subdirectorio llamado `/languages` (o en su defecto, `/lang`) dentro de la carpeta raíz del plugin.

```text
wp-content/plugins/mi-gestor-avanzado/
├── mi-gestor-avanzado.php        (Archivo principal)
├── readme.txt
├── includes/
└── languages/                    (Directorio de traducciones)
    ├── mi-gestor-avanzado.pot    (Plantilla base)
    ├── mi-gestor-avanzado-es_ES.po (Traducción al español - editable)
    └── mi-gestor-avanzado-es_ES.mo (Traducción al español - compilada)

```

*Nota sobre la nomenclatura:* Los archivos `.mo` y `.po` deben seguir estrictamente el patrón `dominio-locale.mo`. Por ejemplo, para el español de España será `mi-gestor-avanzado-es_ES.mo`, y para el francés `mi-gestor-avanzado-fr_FR.mo`.

### El Hook correcto: `plugins_loaded`

La carga del dominio de texto no debe ejecutarse de forma aislada en el archivo principal del plugin. Debe engancharse en el momento preciso del ciclo de carga de WordPress: cuando todos los plugins han sido detectados pero antes de que se procese la interfaz de usuario o se envíen cabeceras.

El hook adecuado para esto es **`plugins_loaded`**.

#### Ejemplo de implementación estándar

Añade este bloque de código en tu archivo principal (o en la clase inicializadora de tu arquitectura):

```php
<?php
/**
 * Inicializa la carga de traducciones del plugin
 */
function mga_cargar_textdomain() {
    // Genera la ruta relativa dinámicamente
    $ruta_relativa = dirname( plugin_basename( __FILE__ ) ) . '/languages';

    // Carga los archivos .mo
    load_plugin_textdomain(
        'mi-gestor-avanzado', 
        false, 
        $ruta_relativa 
    );
}
// Engancha la función en el momento óptimo
add_action( 'plugins_loaded', 'mga_cargar_textdomain' );

```

En este snippet, `plugin_basename( __FILE__ )` obtiene la ruta del archivo actual relativa al directorio de plugins (ej. `mi-gestor-avanzado/mi-gestor-avanzado.php`), y `dirname()` extrae solo la carpeta (`mi-gestor-avanzado`). Al concatenar `/languages`, construimos la ruta relativa exacta que requiere la función.

### JIT (Just-In-Time) y el Repositorio Oficial

Es crucial entender cómo ha evolucionado WordPress. Desde la versión 4.6, el núcleo introdujo las traducciones *Just-In-Time* (JIT).

Si tu plugin es público y está alojado en el repositorio oficial de WordPress.org, la comunidad lo traducirá a través de la plataforma colaborativa `translate.wordpress.org` (GlotPress). En este escenario, **WordPress descargará e instalará los paquetes de idioma automáticamente** en el directorio global seguro (`wp-content/languages/plugins/`) y los cargará en memoria solo cuando se encuentre la primera función de traducción.

Por lo tanto, si tu plugin reside en el repositorio oficial, la llamada a `load_plugin_textdomain()` se vuelve técnicamente redundante y opcional. Sin embargo, sigue siendo una práctica obligatoria si:

1. Desarrollas un **plugin premium o privado** que no está en el repositorio de WP.org.
2. Quieres proporcionar **traducciones por defecto** (fallback) empaquetadas directamente en el archivo `.zip` de tu plugin.
3. Estás desarrollando en un entorno local y necesitas probar tus propios archivos `.mo` antes de su distribución.

El orden de prioridad del núcleo siempre favorecerá las traducciones alojadas en `wp-content/languages/plugins/` (gestionadas por WP) sobre las que se encuentran en el directorio `/languages/` propio del plugin (cargadas vía código), garantizando que los usuarios siempre reciban las actualizaciones idiomáticas más recientes.

## 15.4 Generación de archivos POT

Una vez que todo el código fuente del plugin ha sido instrumentado con las funciones de internacionalización (`__()`, `_e()`, `_n()`, etc.), el siguiente paso lógico es extraer todas esas cadenas y consolidarlas en un catálogo unificado. Este catálogo maestro es el archivo **POT** (Portable Object Template).

El archivo POT no contiene traducciones; actúa exclusivamente como la plantilla base. Los traductores (o herramientas como Poedit y GlotPress) utilizan este archivo para generar los archivos `.po` (Portable Object, donde se guardan las traducciones legibles por humanos) y los archivos `.mo` (Machine Object, los binarios compilados que lee WordPress).

### Anatomía de un archivo POT

Un archivo POT es esencialmente un archivo de texto plano estructurado. Comienza con una cabecera de metadatos (información del plugin, equipo de traducción, codificación) seguida de una lista de todas las cadenas extraídas.

```text
# Cabecera de metadatos
msgid ""
msgstr ""
"Project-Id-Version: Mi Gestor Avanzado 1.0.0\n"
"Report-Msgid-Bugs-To: https://wordpress.org/support/plugin/mi-gestor-avanzado\n"
"POT-Creation-Date: 2023-10-25 10:00:00+00:00\n"
"MIME-Version: 1.0\n"
"Content-Type: text/plain; charset=UTF-8\n"
"Content-Transfer-Encoding: 8bit\n"

# Entrada estándar
#: includes/class-mga-admin.php:45
msgid "Configuración Avanzada del Post"
msgstr ""

# Entrada con contexto
#: includes/class-mga-post-types.php:112
msgctxt "Acción de publicar en el formulario"
msgid "Post"
msgstr ""

# Entrada con pluralización
#: includes/class-mga-database.php:88
msgid "Se ha eliminado %s registro de la base de datos."
msgid_plural "Se han eliminado %s registros de la base de datos."
msgstr[0] ""
msgstr[1] ""

```

*Nota:* Las referencias de archivo (`#: includes/...`) son vitales para los traductores, ya que les permiten buscar la línea de código exacta si necesitan contexto adicional sobre cómo se utiliza una cadena en la interfaz.

### Extracción profesional con WP-CLI

Históricamente, los desarrolladores dependían de configurar analizadores complejos en herramientas de escritorio como Poedit para buscar las funciones de WordPress. Hoy en día, el estándar absoluto en el ecosistema profesional es utilizar **WP-CLI** (la interfaz de línea de comandos de WordPress), que incluye un comando nativo para analizar código PHP y generar archivos POT con precisión absoluta.

El comando base es `wp i18n make-pot`.

#### Ejecución básica

Si te encuentras en la raíz del directorio de tu plugin, la ejecución más sencilla escanea toda la carpeta y genera el archivo en el directorio `/languages`:

```bash
wp i18n make-pot . languages/mi-gestor-avanzado.pot

```

#### Ejecución avanzada (Exclusiones y Cabeceras)

En un entorno de desarrollo moderno, tu plugin probablemente contenga directorios que no deberían ser escaneados por el motor de i18n (por ejemplo, dependencias de Composer, paquetes de Node, o tests unitarios). Escanear estos directorios no solo ralentiza el proceso, sino que contamina tu archivo POT con cadenas de librerías de terceros.

Puedes optimizar la generación utilizando banderas (*flags*):

```bash
wp i18n make-pot . languages/mi-gestor-avanzado.pot \
    --slug="mi-gestor-avanzado" \
    --domain="mi-gestor-avanzado" \
    --exclude="vendor,node_modules,tests,.github" \
    --headers='{"Report-Msgid-Bugs-To":"https://github.com/tu-usuario/mi-gestor-avanzado/issues"}'

```

* `--slug`: Define el slug del plugin.
* `--domain`: Fuerza al extractor a recolectar solo las cadenas que coincidan con este text domain, ignorando errores tipográficos en el código donde pudieras haber olvidado el dominio.
* `--exclude`: Una lista separada por comas de directorios a ignorar.
* `--headers`: Inyecta o sobrescribe metadatos JSON directamente en la cabecera del POT.

### Alternativas de automatización

Si bien ejecutar el comando WP-CLI manualmente es efectivo, en arquitecturas profesionales la generación del POT debe formar parte de la canalización de compilación (*build pipeline*).

Si utilizas Node.js para compilar tus assets (CSS/JS), es una práctica estándar incluir la llamada a WP-CLI o a utilidades basadas en JavaScript (como `@wordpress/i18n` o tareas de `gulp-wp-pot`) dentro del archivo `package.json`:

```json
{
  "scripts": {
    "build": "npm run build:css && npm run build:js && npm run makepot",
    "makepot": "wp i18n make-pot . languages/mi-gestor-avanzado.pot --exclude=node_modules,vendor,src"
  }
}

```

Al automatizar este paso en los scripts de compilación, garantizas que cada vez que empaquetas una nueva versión (*release*) del plugin, el archivo POT se regenera, evitando que los traductores trabajen con plantillas desactualizadas o que aparezcan cadenas "huérfanas" en la interfaz.

## Resumen del capítulo

La internacionalización (i18n) es el puente que permite a tu plugin alcanzar una audiencia global sin requerir múltiples bases de código. En este capítulo hemos explorado el ciclo de vida completo de la localización en WordPress:

1. Comenzamos aislando las cadenas estáticas mediante las **funciones de traducción básicas** (`__()`, `_e()`), entendiendo la importancia de no concatenar variables de forma dinámica, sino utilizar marcadores de posición (`sprintf()`).
2. Elevamos la precisión semántica aplicando **contexto y pluralización dinámica** (`_x()`, `_n()`), delegando la compleja lógica gramatical de otros idiomas al motor de WordPress en lugar de usar condicionales en PHP.
3. Conectamos el código con los archivos físicos mediante la **carga del dominio de texto** con `load_plugin_textdomain()`, comprendiendo el comportamiento *Just-In-Time* y las prioridades de directorio entre el repositorio oficial y las traducciones locales.
4. Finalmente, consolidamos el proceso a través de la **generación de archivos POT**, utilizando herramientas estándar de la industria como WP-CLI para crear plantillas limpias y listas para ser entregadas a los traductores.
