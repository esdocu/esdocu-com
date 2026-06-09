Desarrollar un theme funcional en local es solo la mitad del camino. Para alcanzar un nivel profesional, tu proyecto debe ser distribuible globalmente. En este capítulo prepararemos tu código para su lanzamiento. Aprenderás a implementar internacionalización (i18n) para que tu theme sea traducible a cualquier idioma y a generar las plantillas POT. Luego, validaremos tu código superando las estrictas auditorías del repositorio oficial mediante Theme Check y estándares WPCS, para finalmente empaquetar un producto limpio. Además, modernizaremos tu flujo automatizando la validación y entrega mediante pipelines de integración y despliegue continuo (CI/CD).

## 18.1 Funciones de internacionalización

La internacionalización (i18n) es el proceso de preparar el código de tu theme para que pueda ser traducido a múltiples idiomas sin necesidad de modificar la estructura interna de los archivos PHP. WordPress utiliza el sistema de localización de GNU `gettext`, proporcionando un ecosistema de funciones nativas diseñadas para envolver las cadenas de texto estáticas y dinámicas dentro de las plantillas.

### El concepto de Text Domain

Antes de invocar cualquier función de traducción, es obligatorio definir un identificador único conocido como **Text Domain**. Este identificador sirve para que WordPress asocie las cadenas de texto de tu theme con su archivo de traducción correspondiente (`.mo`), evitando colisiones con las cadenas del core o de los plugins activos.

Por convención, el Text Domain debe coincidir exactamente con el slug del directorio de tu theme (por ejemplo, si el theme está en `wp-content/themes/mi-tema-profesional/`, el Text Domain será `mi-tema-profesional`).

Para inicializar y cargar este dominio de texto, se utiliza la función `load_theme_textdomain()` enganchada al action hook `after_setup_theme`:

```php
/**
 * Registrar y cargar el dominio de traducción del theme.
 */
function mi_tema_registrar_i18n() {
    // Busca archivos de traducción (.mo) en la carpeta /languages/ del theme
    load_theme_textdomain( 'mi-tema-profesional', get_template_directory() . '/languages' );
}
add_action( 'after_setup_theme', 'mi_tema_registrar_i18n' );

```

### Funciones básicas de traducción

Existen dos funciones elementales que cubren la mayoría de los casos de uso cuando se renderizan cadenas estáticas:

1. **`__()` (Doble guion bajo):** Retorna la cadena traducida. Es útil cuando se necesita asignar el resultado a una variable, pasarlo como argumento a otra función o procesarlo antes de imprimirlo.
2. **`_e()` (Subrayado seguido de la letra E):** Traduce e imprime directamente en el búfer de salida (equivale a un `echo __()`).

```php
// Uso de __() para asignar a una variable o pasar como parámetro
$etiqueta_boton = __( 'Leer más', 'mi-tema-profesional' );

// Uso de _e() para renderizado directo en la plantilla HTML
?>
<button type="button" class="btn-main">
    <?php _e( 'Enviar formulario', 'mi-tema-profesional' ); ?>
</button>

```

### Contextualización de cadenas

En muchos idiomas, una misma palabra en inglés puede tener diferentes traducciones dependiendo del contexto en el que se emplee (por ejemplo, la palabra *"Design"* puede actuar como sustantivo o como verbo). Si usas la misma cadena básica, el traductor solo verá un término y la traducción romperá la coherencia en una de las vistas.

Para solucionar esto, se utilizan las funciones de contexto:

* **`_x()`:** Retorna la cadena traducida aplicando un contexto aclaratorio para el traductor.
* **`_ex()`:** Traduce, aplica el contexto e imprime directamente la cadena.

```php
// Caso 1: 'Design' usado como sustantivo (ej. El diseño de la página)
$rol_seccion = _x( 'Design', 'Sustantivo: área o concepto de diseño', 'mi-tema-profesional' );

// Caso 2: 'Design' usado como verbo imperativo (ej. ¡Diseña tu sitio!)
?>
<span class="action-tab">
    <?php _ex( 'Design', 'Verbo: acción de diseñar algo', 'mi-tema-profesional' ); ?>
</span>

```

### Manejo de plurales de forma dinámica

Los diferentes idiomas tienen reglas complejas y variadas para los plurales (algunos tienen dos formas, otros tres o más según la cantidad numérica). No se deben concatenar condiciones `if/else` basadas en números hardcodeados. En su lugar, se emplean `_n()` y `_nx()`.

* **`_n()`:** Acepta la forma singular, la forma plural, el número que determina la cantidad y el text domain.
* **`_nx()`:** Añade un cuarto parámetro para especificar el contexto de la traducción junto con el control de plurales.

```php
$comentarios_count = get_comments_number();

// Selección automática del plural según las reglas del idioma de destino
printf(
    _n(
        '%s comentario',
        '%s comentarios',
        $comentarios_count,
        'mi-tema-profesional'
    ),
    number_format_i18n( $comentarios_count )
);

```

*Nota: Siempre se debe pasar el número formateado con `number_format_i18n()` al inyectar la variable en el string final.*

### Internacionalización y seguridad combinada (Escapado seguro)

Como se analizó en el Capítulo 16, nunca se debe confiar en los datos de salida. Si una traducción es alterada en el archivo `.mo` de forma maliciosa o errónea, podría inyectar scripts JavaScript o etiquetas HTML inválidas. WordPress provee funciones que traducen y escapan la cadena en un único paso optimizado:

* **`esc_html__()`** y **`esc_html_e()`**: Traducen y escapan texto plano destinado a mostrarse dentro de elementos HTML estructurales.
* **`esc_attr__()`** y **`esc_attr_e()`**: Traducen y escapan cadenas de texto que se van a inyectar directamente dentro de atributos HTML (como `title`, `alt`, `value` o `placeholder`).

```php
// Escapado HTML seguro en el Frontend
<h2><?php esc_html_e( 'Resultados de búsqueda', 'mi-tema-profesional' ); ?></h2>

// Escapado seguro dentro de atributos de un campo de formulario
<input 
    type="text" 
    name="s" 
    placeholder="<?php esc_attr_e( 'Buscar en el sitio...', 'mi-tema-profesional' ); ?>" 
/>

```

### Cadenas dinámicas con placeholders (Marcadores de posición)

Un error crítico en el desarrollo de themes es fraccionar frases para concatenar variables PHP. Esto destruye la sintaxis gramatical en idiomas donde el orden de los elementos cambie.

**Enfoque incorrecto (No almacenable ni traducible correctamente):**

```php
// ERROR: Los traductores verán fragmentos sueltos y el orden sintáctico se romperá
echo __( 'Este post fue escrito por ', 'mi-tema-profesional' ) . $autor;

```

**Enfoque correcto (Uso de `sprintf()` o `printf()`):**
Se debe mantener la oración íntegra usando placeholders como `%s` (para strings) o `%d` (para enteros).

```php
// Correcto: Mantiene la estructura de la oración unificada
printf(
    esc_html__( 'Este post fue escrito por %s', 'mi-tema-profesional' ),
    esc_html( $autor )
);

```

Si una cadena requiere más de un parámetro dinámico, se debe recurrir obligatoriamente a marcadores posicionales (`%1$s`, `%2$s`). De este modo, si un idioma requiere invertir el orden del sujeto y el predicado, el traductor puede reordenar los marcadores en el archivo de traducción sin romper el código PHP.

```php
$categoria = get_the_category_list( ', ' );
$fecha     = get_the_date();

// Uso de marcadores posicionales para permitir reordenación sintáctica
printf(
    esc_html__( 'Publicado en %1$s el %2$s', 'mi-tema-profesional' ),
    $categoria, // Reemplaza a %1$s
    esc_html( $fecha ) // Reemplaza a %2$s
);

```

### Flujo de procesamiento de una cadena i18n

El siguiente diagrama ilustra cómo interactúa el código de tu theme con las funciones de traducción y el motor de localización antes de enviar la respuesta al navegador del usuario final:

```text
[ Cadena original escrita en PHP ]
               │
               ▼
   ¿Contiene variables dinámicas?
        ├── SÍ ──> Usar sprintf() / printf() con marcadores (%1$s, %2$s)
        └── NO ──> Pasar cadena directa a la función i18n
               │
               ▼
   ¿Dónde se renderizará la cadena?
        ├── Atributo HTML ──> Usar esc_attr__() o esc_attr_e()
        └── Cuerpo HTML    ──> Usar esc_html__() o esc_html_e()
               │
               ▼
[ Evaluación del Motor de WordPress (Gettext) ]
               │
               ├──> Busca el Text Domain configurado.
               └──> Cruza la cadena con el archivo .mo activo.
                       │
                       ▼
         [ Retorno / Impresión de la cadena ]
         (Traducida al idioma local y sanitizada)

```

### Buenas prácticas indispensables

* **Cadenas legibles completas:** Nunca incluyas código HTML complejo dentro de las funciones de traducción a menos que afecte directamente la estructura de la oración (ej. etiquetas de énfasis `<em>` o `<strong>`). Mantén las etiquetas estructurales como `<div>` o `<p>` fuera de las funciones i18n.
* **Solo texto explícito:** Las funciones de `gettext` analizan el código de forma estática antes de ejecutarse en el servidor. Por lo tanto, nunca pases variables PHP como argumento de texto original a traducir (ej. `__($variable_texto, 'dominio')` es un antipatrón inservible para los extractores de cadenas).
* **Cuidado con los espacios en blanco:** Asegúrate de incluir los espacios necesarios dentro de la cadena traducible si depende de espaciados contextuales con respecto a elementos adyacentes.

## 18.2 Generación de archivos POT

Un archivo POT (Portable Object Template) es la plantilla maestra que contiene todas las cadenas de texto traducibles extraídas del código fuente de tu theme. A diferencia de los archivos `.po` (específicos de un idioma) y `.mo` (archivos binarios compilados), el archivo POT no incluye traducciones; actúa exclusivamente como un inventario estructurado donde los campos de traducción permanecen vacíos.

### Estructura interna de un archivo POT

El archivo POT utiliza la sintaxis estándar de GNU `gettext`. Se compone de una cabecera de metadatos seguida de bloques de traducción individuales. Cada bloque documenta la ubicación exacta del archivo y la línea de código donde se detectó la cadena, el contexto (si existe) y el identificador original (`msgid`).

```text
# Copyright (C) 2026 Mi Tema Profesional
# This file is distributed under the same license as the Mi Tema Profesional theme.
msgid ""
msgstr ""
"Project-Id-Version: Mi Tema Profesional 1.0.0\n"
"Report-Msgid-Bugs-To: https://wordpress.org/support/theme/mi-tema-profesional\n"
"Last-Translator: FULL NAME <EMAIL@ADDRESS>\n"
"Language-Team: LANGUAGE <LL@li.org>\n"
"MIME-Version: 1.0\n"
"Content-Type: text/plain; charset=UTF-8\n"
"Content-Transfer-Encoding: 8bit\n"
"POT-Creation-Date: 2026-06-08 14:00+0000\n"

#: index.php:24
msgid "Read more"
msgstr ""

#: single.php:42
#, php-format
msgid "Published by %s"
msgstr ""

#: inc/navigation.php:12
msgHistory: Contexto de uso
_x:1,2c
msgctxt "Sustantivo: área o concepto de diseño"
msgid "Design"
msgstr ""

```

### El ciclo de vida de los archivos de localización

Para comprender la importancia del archivo POT, es fundamental visualizar cómo interactúan las tres extensiones de archivo utilizadas en el ecosistema de internacionalización de WordPress:

```text
[ Código Fuente PHP ] ──( Extracción Estática )──> [ Archivo .pot (Plantilla) ]
                                                            │
                                                            │ (Crear copia por idioma)
                                                            ▼
[ Archivo .mo (Binario Optimizado) ] <──( Compilar )── [ Archivo .po (Texto editable) ]

```

1. **`.pot`:** La plantilla vacía generada automáticamente desde el código PHP.
2. **`.po` (Portable Object):** El archivo de texto que el traductor edita (ej. `es_ES.po`). Mantiene el `msgid` en inglés y rellena el `msgstr` con el idioma objetivo.
3. **`.mo` (Machine Object):** El archivo binario que WordPress procesa a alta velocidad en tiempo de ejecución. Nunca se edita a mano.

### Métodos de generación del archivo POT

Existen diferentes herramientas para escanear el código de un theme y compilar el archivo POT. A continuación, se detallan las metodologías oficiales y más eficientes para un flujo de trabajo profesional.

#### Método 1: Automatización mediante WP-CLI (Recomendado)

Como se introdujo en la sección 1.5, WP-CLI proporciona la interfaz de comandos oficial para gestionar instalaciones de WordPress. Su componente de internacionalización (`wp i18n`) es la herramienta estándar de la industria debido a su velocidad y precisión para detectar todas las funciones analizadas en el capítulo anterior (`__`, `_e`, `esc_html_e`, etc.).

Para generar el archivo POT, abre la terminal en la raíz de la instalación de WordPress y ejecuta el comando `wp i18n make-pot`:

```bash
# Sintaxis básica: wp i18n make-pot <directorio-origen> <archivo-destino>
wp i18n make-pot wp-content/themes/mi-tema-profesional/ wp-content/themes/mi-tema-profesional/languages/mi-tema-profesional.pot

```

##### Parámetros avanzados de configuración

Si tu theme incluye dependencias de desarrollo (como carpetas `node_modules`, entornos virtuales o archivos de configuración de despliegue), debes excluirlos del escaneo estático para evitar la contaminación del archivo POT y reducir el tiempo de procesamiento.

```bash
wp i18n make-pot wp-content/themes/mi-tema-profesional/ wp-content/themes/mi-tema-profesional/languages/mi-tema-profesional.pot \
  --slug="mi-tema-profesional" \
  --domain="mi-tema-profesional" \
  --exclude="node_modules/,vendor/,tests/,build/,gulpfile.js" \
  --headers='{"Report-Msgid-Bugs-To":"https://mi-sitio.com/soporte","Last-Translator":"Desarrollador <admin@mi-sitio.com>"}'

```

* `--slug`: Define el slug oficial asignado al theme en el repositorio de WordPress.
* `--domain`: Fuerza el filtrado estricto; solo extraerá las cadenas cuyo Text Domain coincida exactamente con el valor provisto, ignorando las cadenas del core o de plugins de terceros presentes por error.
* `--exclude`: Lista separada por comas de directorios o archivos específicos que el parser de PHP debe ignorar.
* `--headers`: Inyecta metadatos personalizados directamente en la cabecera del archivo generado.

#### Método 2: Integración en entornos de Node.js (`@wordpress/scripts`)

En flujos de trabajo modernos orientados a automatización de tareas y desarrollo de bloques, la suite oficial de herramientas de NPM `@wordpress/scripts` incluye utilidades nativas para la internacionalización.

1. Instala el paquete de desarrollo en la raíz de tu theme:

```bash
npm install @wordpress/scripts --save-dev

```

1. Configura el script en tu archivo `package.json`:

```json
{
  "name": "mi-tema-profesional",
  "version": "1.0.0",
  "scripts": {
    "makepot": "wp-scripts make-pot . languages/mi-tema-profesional.pot"
  }
}

```

1. Ejecuta la tarea automatizada desde la terminal:

```bash
npm run makepot

```

Esta utilidad lee automáticamente las configuraciones del theme y excluye por defecto carpetas comunes de desarrollo como `node_modules`, `.git` y subdirectorios de distribución de Webpack.

#### Método 3: Extracción visual con Poedit (Entornos GUI)

Si prefieres no depender de herramientas de línea de comandos durante la fase de traducción, Poedit es el software de escritorio estándar para la edición de catálogos `gettext`.

Para generar un archivo POT desde cero en Poedit:

1. Ve a **Archivo** > **Nuevo**.
2. Selecciona el idioma base (generalmente inglés).
3. Haz clic en **Extraer de fuentes PHP/código**.
4. En la pestaña **Rutas de las fuentes**, define la carpeta raíz de tu theme.
5. En la pestaña **Palabras clave de las fuentes**, introduce los identificadores que Poedit debe buscar en el código PHP. Debes añadir obligatoriamente la lista completa de funciones i18n de WordPress:

* `__`
* `_e`
* `_x:1,2c` (indica que el segundo parámetro es el contexto)
* `_ex:1,2c`
* `_n:1,2`
* `_nx:1,2,4c`
* `esc_html__`
* `esc_html_e`
* `esc_attr__`
* `esc_attr_e`

1. Presiona **Actualizar** para ejecutar el escaneo estático y guarda el archivo resultante con la extensión `.pot` dentro del directorio `/languages/` de tu theme.

### Verificación del archivo POT

Una vez generado el archivo, es crucial validar su integridad estructural antes de su distribución. Abre el archivo `.pot` con un editor de código y comprueba tres puntos críticos:

* **Inexistencia de variables:** Asegúrate de que no existan líneas con formatos inválidos como `msgid "$variable"`. Si aparecen, significa que no aplicaste correctamente las funciones `sprintf()` o `printf()` explicadas en la sección anterior.
* **Consistencia del Text Domain:** Verifica que no se hayan colado cadenas vacías o de dominios ajenos. Si la lista incluye términos del core de WordPress (como "Save Changes" sin dominio explícito), revisa las plantillas para corregir la función que omitió el parámetro del dominio.
* **Codificación:** El archivo debe guardarse estrictamente con codificación **UTF-8 sin BOM** para evitar problemas de renderizado con caracteres especiales y acentos en idiomas derivados del latín, cirílico o alfabetos orientales.

## 18.3 Theme Check y estándares oficiales

Desarrollar un theme funcional es solo una parte del proceso; garantizar que su código sea seguro, predecible y compatible con el ecosistema global de WordPress requiere adherirse a un conjunto estricto de directrices. Ya sea que planees distribuir tu theme en el repositorio oficial de WordPress.org, venderlo como un producto premium o entregarlo a un cliente corporativo, el cumplimiento de los estándares oficiales es la métrica definitiva de calidad profesional.

Para evaluar este cumplimiento, la comunidad de WordPress ha desarrollado herramientas automatizadas de análisis estático que detectan malas prácticas antes del despliegue.

### El plugin Theme Check

La herramienta fundamental para la validación básica es el plugin oficial **Theme Check**. Este entorno de pruebas replica las validaciones automatizadas que el equipo de revisión de WordPress.org (Theme Review Team) ejecuta al recibir un nuevo envío.

Una vez instalado y activado en tu entorno de desarrollo local, Theme Check analiza la estructura de archivos, las cabeceras (analizadas en el Capítulo 2) y el código fuente en busca de infracciones.

#### Errores y advertencias críticas más comunes

1. **Ausencia de etiquetas de plantilla obligatorias:** El theme fallará si no se invocan las funciones `wp_head()` justo antes de cerrar la etiqueta `</head>`, y `wp_footer()` justo antes de cerrar `</body>`. Sin ellas, la mayoría de los plugins de la comunidad dejarán de funcionar.
2. **Falta de prefijos (Prefixing):** Para evitar colisiones fatales en PHP, todas las variables globales, nombres de funciones, clases, constantes y manejadores de imágenes/scripts deben tener un prefijo único (generalmente el slug del theme). Por ejemplo, usar `function inicializar_opciones()` generará un error; debe ser `function mi_tema_inicializar_opciones()`.
3. **Rutas y URIs codificadas (Hardcoding):** Theme Check penaliza las rutas absolutas estáticas. Nunca se debe escribir `src="/wp-content/themes/mi-tema/assets/js/app.js"`. Como se vio en el Capítulo 6, siempre se deben usar funciones de enrutamiento dinámico como `get_template_directory_uri()`.
4. **Llamadas directas a la base de datos:** El uso de operaciones CRUD directas sin utilizar la API del core (como llamadas directas a `$wpdb` para consultas que podrían resolverse con `WP_Query`) disparará advertencias.
5. **Inclusión de código no permitido:** Se prohiben explícitamente fragmentos de ofuscación de código (como `eval()` o `base64_decode()`), inclusión de frameworks externos pesados innecesarios y la manipulación de funciones reservadas del core.

### PHP_CodeSniffer y WordPress Coding Standards (WPCS)

Mientras que Theme Check se enfoca en los requisitos de la arquitectura del theme, **PHP CodeSniffer (PHPCS)** junto con los **WordPress Coding Standards (WPCS)** se centran en la calidad, formato y seguridad del código PHP línea por línea.

WPCS es un conjunto de reglas (sniffs) que validan si tu código cumple con la guía de estilo oficial (espacios, indentación estructurada con tabuladores, convenciones de nomenclatura) y prácticas de seguridad (como la exigencia estricta de sanitización y escapado revisada en el Capítulo 16).

#### Configuración de WPCS en el proyecto

Para implementar esta validación en tu flujo de trabajo, necesitas requerir PHPCS y WPCS mediante Composer en el directorio de tu theme:

```bash
# Inicializar composer si no existe
composer init

# Instalar PHP_CodeSniffer y WPCS como dependencias de desarrollo
composer require --dev squizlabs/php_codesniffer wp-coding-standards/wpcs

```

Una vez instalados, debes crear un archivo de configuración en la raíz de tu theme llamado `phpcs.xml.dist` para indicarle a PHPCS qué reglas debe aplicar:

```xml
<?xml version="1.0"?>
<ruleset name="MiTemaProfesional">
    <description>Reglas de validación para Mi Tema Profesional.</description>

    <!-- Escanear todos los archivos PHP -->
    <file>.</file>
    <exclude-pattern>/vendor/</exclude-pattern>
    <exclude-pattern>/node_modules/</exclude-pattern>

    <!-- Utilizar los estándares principales de WordPress -->
    <rule ref="WordPress-Core"/>
    <rule ref="WordPress-Docs"/>
    <rule ref="WordPress-Extra"/>

    <!-- Configurar el Text Domain para validar la internacionalización -->
    <rule ref="WordPress.WP.I18n">
        <properties>
            <property name="text_domain" type="array" value="mi-tema-profesional"/>
        </properties>
    </rule>

    <!-- Exigir el prefijo del theme en todas las funciones globales -->
    <rule ref="WordPress.NamingConventions.PrefixAllGlobals">
        <properties>
            <property name="prefixes" type="array" value="mi_tema"/>
        </properties>
    </rule>
</ruleset>

```

Para ejecutar el análisis en la terminal, utiliza el siguiente comando:

```bash
./vendor/bin/phpcs -p -s

```

La bandera `-p` muestra el progreso, y `-s` muestra el nombre de la regla que ha fallado, lo que facilita la búsqueda de documentación para resolver el error.

### Estándares de Accesibilidad (Accessibility-Ready)

Si tu objetivo es obtener la etiqueta oficial *Accessibility-Ready* en el repositorio, tu theme debe someterse a una capa de revisión adicional. Los estándares oficiales exigen, entre otros requisitos:

* **Navegación por teclado:** Todos los menús interactivos (especialmente los submenús desplegables del Capítulo 10) deben poder abrirse, recorrerse y cerrarse utilizando únicamente la tecla `Tab` y `Enter/Espacio`.
* **Contraste de color:** La relación de contraste visual entre el texto y su fondo debe ser de al menos 4.5:1 para el texto normal.
* **Controles de salto (Skip Links):** Debe existir un enlace oculto visible solo al recibir el foco del teclado que permita a los usuarios de lectores de pantalla saltar la navegación principal e ir directamente al contenido (`#main`).
* **Atributos ARIA:** Uso correcto de roles y etiquetas ARIA para botones de control de interfaz (ej. `<button aria-expanded="false">Menú</button>`).

### Diagrama del flujo de validación oficial

Para garantizar que un theme está listo para distribución, el proceso de auditoría debe seguir un orden ascendente de complejidad:

```text
[ Desarrollo Local ]
         │
         ▼
[ 1. Análisis Dinámico en Navegador ]
  - WP_DEBUG activo (Log de errores PHP)
  - Inspección de consola (Errores JS)
         │
         ▼
[ 2. Validación Estructural ]
  - Plugin Theme Check
  - Verificación de jerarquía de plantillas
         │
         ▼
[ 3. Análisis Estático de Código ]
  - PHPCS + WPCS (Reglas de estilo y seguridad)
         │
         ▼
[ 4. Accesibilidad y UI ]
  - Navegación por teclado
  - Contraste y validación W3C HTML
         │
         ▼
[ Distribución / Repositorio Oficial ]

```

Implementar estas herramientas como parte rutinaria del desarrollo previene refactorizaciones masivas al final del proyecto, asegurando que el theme sea robusto y altamente estandarizado desde la primera línea de código.

## 18.4 Empaquetado para el repositorio

Preparar tu theme para su distribución en el repositorio oficial de WordPress.org, o para la entrega definitiva a un cliente, requiere generar un archivo `.zip` optimizado e impecable. Este proceso no consiste simplemente en comprimir tu carpeta de trabajo actual; exige una rigurosa limpieza de archivos de desarrollo, la declaración correcta de licencias y la inclusión de assets de presentación estandarizados.

El equipo de revisión de WordPress rechazará automáticamente cualquier envío que contenga archivos basura, dependencias de desarrollo expuestas o conflictos de licencias.

### Limpieza de archivos de desarrollo

Un error muy común en desarrolladores principiantes es enviar el directorio completo del proyecto, exponiendo el código fuente sin compilar y aumentando innecesariamente el peso del archivo. El paquete final solo debe contener el código que el servidor PHP y el navegador del usuario final necesitan para ejecutar el theme.

El siguiente diagrama ilustra qué directorios y archivos deben excluirse durante el proceso de empaquetado:

```text
[ Entorno de Desarrollo ]                   [ Archivo .zip de Producción ]
/mi-tema-profesional/                       /mi-tema-profesional/
 ├── .git/                     ──(X)──>     (Excluido)
 ├── .github/                  ──(X)──>     (Excluido)
 ├── node_modules/             ──(X)──>     (Excluido)
 ├── src/ (SASS/JS crudo)      ──(X)──>     (Excluido)
 ├── tests/                    ──(X)──>     (Excluido)
 ├── package.json              ──(X)──>     (Excluido)
 ├── webpack.config.js         ──(X)──>     (Excluido)
 ├── phpcs.xml.dist            ──(X)──>     (Excluido)
 │
 ├── style.css                 ──(✓)──>      ├── style.css
 ├── functions.php             ──(✓)──>      ├── functions.php
 ├── screenshot.png            ──(✓)──>      ├── screenshot.png
 ├── readme.txt                ──(✓)──>      ├── readme.txt
 ├── theme.json                ──(✓)──>      ├── theme.json
 ├── templates/                ──(✓)──>      ├── templates/
 ├── parts/                    ──(✓)──>      ├── parts/
 └── assets/ (CSS/JS min)      ──(✓)──>      └── assets/

```

### El archivo screenshot.png

La imagen de previsualización es la carta de presentación de tu theme tanto en el directorio web de WordPress.org como en el panel de `Apariencia > Temas` de cualquier instalación local.

Las directrices oficiales para la captura de pantalla son estrictas:

* **Formato y ubicación:** Debe llamarse exactamente `screenshot.png` (o `.jpg`) y ubicarse en la raíz del theme, junto a `style.css`.
* **Dimensiones:** El tamaño recomendado es de **1200x900 píxeles** (una relación de aspecto de 4:3). WordPress la escalará automáticamente para pantallas HiDPI (Retina).
* **Contenido visual:** Debe ser una representación real, fiel y sin alteraciones del diseño final del theme. Se prohíben mockups estilizados con ordenadores o dispositivos móviles flotantes, logotipos exagerados que no formen parte del diseño real, o insignias de marketing ("¡Mejor Theme 2026!").

### Compatibilidad estricta con la licencia GPL

El repositorio oficial exige que el 100% de tu theme herede la licencia **GPL (General Public License)** o una licencia compatible. Esto no aplica únicamente a tu código PHP o JavaScript, sino que se extiende a **todos los recursos multimedia e integraciones**:

* **Fuentes tipográficas:** Si incluyes archivos de fuentes (como `.woff2` desde Google Fonts) dentro del theme, asegúrate de que tengan licencias abiertas (como SIL Open Font License).
* **Imágenes base:** Cualquier imagen, patrón o ícono utilizado por defecto en el theme o en la captura de pantalla debe estar libre de derechos (Creative Commons Zero / Dominio Público).
* **Librerías de terceros:** Si tu theme encola un slider, un framework CSS o una librería JavaScript, debes verificar en sus respectivos repositorios que estén licenciados bajo GPL o MIT.

### El archivo readme.txt

Al igual que los plugins, los themes del repositorio utilizan un archivo `readme.txt` en la raíz para generar la página de perfil en WordPress.org. Este archivo debe seguir un formato de marcado específico para ser interpretado correctamente por el motor del repositorio.

Aquí es donde defines la información del autor, los colaboradores, las licencias de terceros y las notas de la versión (changelog):

```text
=== Mi Tema Profesional ===
Requires at least: 6.4
Tested up to: 6.5
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Mi Tema Profesional es un Block Theme moderno diseñado para agencias y portafolios, construido íntegramente con soporte para Full Site Editing (FSE).

== Description ==
Aquí puedes explayarte sobre las características técnicas de tu theme. El texto soporta etiquetas Markdown básicas.

== Copyright and License ==
Mi Tema Profesional, Copyright 2026 Tu Nombre.
Mi Tema Profesional se distribuye bajo la licencia GPLv2 o posterior.

Créditos de recursos de terceros:
* Tipografía 'Inter' por Rasmus Andersson (SIL Open Font License, 1.1)
  Fuente: https://fonts.google.com/specimen/Inter
* Imagen de muestra 'office.jpg' por Unsplash (Dominio Público / CC0)
  Fuente: https://unsplash.com/photos/xyz

== Changelog ==
= 1.0.0 =
* Lanzamiento inicial.

```

### Reglas de compresión del archivo ZIP

El paso final es la compresión estructural. Cuando un usuario (o el instalador automático de WordPress) sube el `.zip`, el sistema extrae su contenido directamente en `/wp-content/themes/`.

Para que esto funcione sin crear una estructura anidada rota, debes respetar la siguiente regla de oro: **El archivo comprimido debe contener un único directorio en su interior, cuyo nombre sea exactamente igual al slug del theme.**

**Estructura incorrecta (El ZIP contiene archivos sueltos):**

```text
mi-tema-profesional.zip
 ├── style.css
 ├── index.php
 └── functions.php

```

*Si se sube este archivo, los contenidos se dispersarán en la carpeta raíz de /themes/, rompiendo la instalación.*

**Estructura correcta (El ZIP contiene el directorio raíz):**

```text
mi-tema-profesional.zip
 └── mi-tema-profesional/
      ├── style.css
      ├── index.php
      └── functions.php

```

Para generar este paquete desde la terminal de forma rápida y excluyendo archivos basura (asumiendo que tu proyecto usa control de versiones Git), puedes utilizar el comando `git archive`:

```bash
# Crea un archivo .zip limpio solo con los archivos trackeados en la rama actual
git archive --format=zip -o mi-tema-profesional.zip HEAD

```

## 18.5 Flujos de trabajo con CI/CD

El desarrollo profesional de themes modernos requiere superar la dependencia de procesos manuales propensos a errores humanos, como compilar SASS localmente, generar traducciones a mano o subir archivos `.zip` mediante clientes FTP tradicionales. Aquí es donde entran en juego la Integración Continua (CI) y el Despliegue Continuo (CD).

Un flujo de trabajo CI/CD automatiza la validación, construcción y entrega de tu theme cada vez que realizas un cambio en el sistema de control de versiones (como Git). Esto garantiza que el código que llega al servidor de producción sea exactamente el mismo que aprobó las pruebas de calidad.

### Anatomía de un Pipeline CI/CD para WordPress

Un pipeline (tubería de procesos) es una secuencia de comandos automatizados que se ejecutan en un servidor remoto (ej. GitHub Actions, GitLab CI/CD, o Bitbucket Pipelines). Para un theme de WordPress, este flujo se divide en dos fases bien definidas:

```text
[ Desarrollador ] ──( git push )──> [ Repositorio (GitHub / GitLab) ]
                                             │
                                             ▼
                                     [ FASE 1: CI (Validación) ]
                                     1. Clonar repositorio.
                                     2. Instalar Node.js y PHP.
                                     3. npm install & composer install.
                                     4. Ejecutar PHPCS (Validar WPCS).
                                             │
                                   ¿Pasan las pruebas estáticas?
                                     ├── NO ──> Alerta al equipo (Fallo)
                                     └── SÍ ──> Continuar
                                             │
                                             ▼
                                     [ FASE 2: CD (Construcción y Despliegue) ]
                                     1. npm run build (Minificar JS/CSS).
                                     2. Generar archivo .pot actualizado.
                                     3. Eliminar archivos de desarrollo.
                                     4. Crear mi-tema-profesional.zip.
                                     5. Desplegar en servidor destino.
                                             │
                                             ▼
                                     [ Servidor de Producción / WP.org ]

```

### Automatización con GitHub Actions

Para ilustrar cómo se implementa este diagrama en la vida real, utilizaremos GitHub Actions, el estándar actual de la industria. Toda la configuración del pipeline reside en un archivo YAML ubicado en el directorio `.github/workflows/` de tu theme.

El siguiente ejemplo, `deploy.yml`, automatiza el proceso completo de validación y empaquetado cada vez que se hace un `push` a la rama `main` o se crea un nuevo *release*:

```yaml
name: Compilar y Empaquetar Theme

on:
  push:
    branches:
      - main
  release:
    types: [published]

jobs:
  build:
    name: Construcción y Pruebas
    runs-on: ubuntu-latest

    steps:
      # 1. Obtener el código fuente del repositorio
      - name: Checkout del código
        uses: actions/checkout@v4

      # 2. Configurar entorno PHP
      - name: Configurar PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.1'

      # 3. Instalar dependencias de PHP (PHP_CodeSniffer, WPCS)
      - name: Instalar dependencias de Composer
        run: composer install --prefer-dist --no-progress

      # 4. Configurar entorno Node.js
      - name: Configurar Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      # 5. Instalar dependencias NPM y compilar assets
      - name: Instalar NPM y construir dependencias
        run: |
          npm ci
          npm run build

      # 6. Ejecutar pruebas de estándares (PHPCS)
      - name: Ejecutar WordPress Coding Standards
        run: ./vendor/bin/phpcs -p -s

      # 7. Generar el archivo .pot actualizado
      - name: Generar POT para i18n
        run: npm run makepot

      # 8. Empaquetar el theme (Omitiendo archivos de desarrollo)
      - name: Crear archivo ZIP de distribución
        run: |
          mkdir -p dist/mi-tema-profesional
          rsync -rc --exclude-from='.distignore' ./ dist/mi-tema-profesional/
          cd dist
          zip -r mi-tema-profesional.zip mi-tema-profesional/

      # 9. Guardar el .zip como artefacto de la ejecución
      - name: Subir artefacto
        uses: actions/upload-artifact@v4
        with:
          name: mi-tema-profesional-zip
          path: dist/mi-tema-profesional.zip

```

*Nota sobre `.distignore`: En el paso 8, el comando `rsync` utiliza un archivo `.distignore` (similar a `.gitignore`) que debes crear en la raíz de tu proyecto. En él listarás todas las carpetas analizadas en la sección 18.4 (como `.git`, `node_modules`, `tests`) para asegurar que el `.zip` final esté limpio.*

### Estrategias de Despliegue (Destinos)

Una vez que la acción anterior ha generado el archivo `.zip` impecable, el último paso del flujo CD es enviarlo a su destino final. Dependiendo del tipo de proyecto, se añade un último paso (paso 10) al archivo YAML:

1. **Despliegue en clientes (Rsync/SSH):** Si el theme es para un cliente con servidor propio, se utilizan herramientas como `rsync-deploy` o `scp` a través de GitHub Actions para transferir el código directamente a `/wp-content/themes/` y sobreescribir los archivos antiguos, sin intervención manual.
2. **Despliegue como producto comercial (S3 / API):** Si vendes tu theme, el pipeline puede subir automáticamente el `.zip` a un bucket de Amazon S3 y notificar a tu plataforma de e-commerce (como Easy Digital Downloads) mediante una API que hay una nueva versión disponible para los clientes.
3. **Despliegue en WordPress.org (SVN):** El repositorio oficial todavía utiliza Subversion (SVN). Existen acciones de la comunidad (como `10up/action-wordpress-plugin-deploy`, adaptable a themes) que sincronizan automáticamente tu código Git con la infraestructura SVN de WordPress.org cuando creas un *Release* (Etiqueta de versión) en GitHub.

Adoptar CI/CD elimina el estrés de los lanzamientos a producción. Si un desarrollador de tu equipo introduce un error de sintaxis o rompe una regla de validación, el pipeline fallará en la fase de Integración (CI) y el servidor de producción nunca llegará a recibir el código defectuoso.

## Resumen del capítulo

En este capítulo final hemos preparado el theme para abandonar el entorno local de desarrollo y enfrentarse al mundo real de manera profesional y estandarizada. Comenzamos dominando las funciones del ecosistema GNU `gettext` para la internacionalización (i18n), asegurando que el theme pueda ser traducido a cualquier idioma de forma segura, y analizamos cómo extraer estas cadenas a una plantilla POT maestra. A continuación, exploramos las estrictas herramientas de auditoría de la comunidad, como Theme Check y PHP_CodeSniffer con WPCS, fundamentales para garantizar un código seguro y compatible. Finalmente, vimos la metodología correcta para empaquetar un theme limpio de dependencias de desarrollo y cómo llevar este proceso al siguiente nivel mediante la implementación de flujos de trabajo automatizados CI/CD, culminando en un ciclo de vida de desarrollo ágil, predecible y a prueba de errores.

## Epílogo: El Futuro de tu Desarrollo

Has llegado al final de este viaje. A lo largo del libro hemos desmontado la arquitectura de WordPress, dominando desde la jerarquía de plantillas clásica y la potencia de los hooks, hasta el cambio de paradigma que supone Full Site Editing y los Block Themes. Ahora posees un arsenal de herramientas para construir soluciones profesionales, seguras y altamente optimizadas.

Recuerda que WordPress es un ecosistema vivo. Mantén la curiosidad, adopta las mejores prácticas y contribuye a la comunidad. Tienes el conocimiento para transformar ideas complejas en productos reales listos para producción. Tu próximo gran theme te espera. ¡Feliz código!
