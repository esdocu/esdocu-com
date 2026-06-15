La creación de una interfaz en el panel de administración es el hito más visible al desarrollar un plugin. En este capítulo, adoptaremos los estándares estrictos del núcleo de WordPress para construir experiencias profesionales. Aprenderemos a registrar menús y submenús mediante la API nativa, asegurando una correcta jerarquía y un riguroso control de acceso basado en roles. Asimismo, dominaremos el encolado condicional de scripts y estilos para proteger el rendimiento global del backend. Finalmente, estructuraremos nuestras vistas empleando las clases CSS nativas del Core, garantizando una experiencia de usuario (UX) coherente, accesible y adaptable.

## 7.1 Agregar menús principales

El ecosistema de administración de WordPress expone un flujo de inicialización específico para la interfaz de usuario del backend. La inserción de un elemento en la raíz del menú de navegación lateral del panel de control se gestiona de manera centralizada mediante el hook de acción `admin_menu`. Durante esta fase de ejecución, WordPress instancia y puebla las variables globales `$menu` y `$submenu`, que son arrays bidimensionales encargados de estructurar el árbol de navegación interno.

Modificar estas variables directamente es una práctica desaconsejada que rompe la compatibilidad hacia adelante. En su lugar, el Core proporciona la API de Páginas de Administración, cuyo componente principal para menús raíz es la función `add_menu_page()`.

### Flujo de Ejecución e Inicialización

El siguiente esquema ilustra el ciclo de vida de una petición en el backend y el punto exacto en el que se deben registrar los menús personalizados:

```text
 Petición entrante a /wp-admin/
               |
               v
    [ plugins_loaded ]  --> Carga de archivos principales del plugin
               |
               v
      [ init ]          --> Inicialización general de WordPress
               |
               v
   [ admin_menu ]       --> Ejecución de add_menu_page() y add_submenu_page()
               |
               v
 [ current_screen ]     --> El core determina la pantalla actual del admin
               |
               v
  Renderizado HTML      --> Ejecución del Callback asignado al menú

```

Registrar un menú fuera del gancho `admin_menu` (por ejemplo, en `init` o `plugins_loaded`) causará fallos de consistencia, provocando que las funciones de verificación de capacidades fallen o que el menú no se renderice debido a que las estructuras globales aún no han sido inicializadas.

### Anatomía de `add_menu_page()`

La función se define en el núcleo de WordPress (`wp-admin/includes/plugin.php`) bajo la siguiente firma técnica:

```php
function add_menu_page(
    string $page_title,
    string $menu_title,
    string $capability,
    string $menu_slug,
    callable $callback = '',
    string $icon_url = '',
    int|float $position = null
): string { ... }

```

#### Análisis Quirúrgico de los Parámetros

1. **`$page_title` (string):** El texto que se introducirá dentro de la etiqueta `<title>` del documento HTML cuando el usuario navegue a esta página de administración. Es crítico para la accesibilidad y el SEO interno.
2. **`$menu_title` (string):** El texto legible que se mostrará directamente en el menú de navegación izquierdo del panel de control de WordPress.
3. **`$capability` (string):** El permiso o rol mínimo requerido para que este menú sea visible y accesible para un usuario. WordPress realiza una comprobación automática mediante `current_user_can()`. Si el usuario no posee esta capacidad, el menú se oculta automáticamente y los intentos de acceso directo devuelven un error HTTP 403 (No autorizado).
4. **`$menu_slug` (string):** El identificador único para este menú. Debe ser una cadena sanitizada (caracteres alfanuméricos, guiones o guiones bajos). Si no se proporciona un parámetro `$callback`, este slug debe coincidir con el nombre de un archivo PHP dentro del plugin, aunque la arquitectura limpia dicta que se utilice un slug semántico y se maneje el renderizado mediante un callback explícito.
5. **`$callback` (callable):** La función o método de clase encargado de renderizar la interfaz HTML de la página de administración.
6. **`$icon_url` (string):** Define el aspecto visual del icono del menú. Admite tres variantes:

* El nombre de una clase de Dashicons (ej. `'dashicons-admin-generic'`).
* Una URL absoluta hacia una imagen rasterizada o SVG.
* Una cadena codificada en Base64 con un esquema de datos SVG (Data URI), idóneo para evitar peticiones HTTP adicionales.

1. **`$position` (int|float):** El orden numérico en el que aparecerá el menú dentro de la barra lateral. WordPress utiliza un sistema de ordenación basado en enteros de menor a mayor.

#### Valores de Posición Estándar del Core

Para evitar colisiones con elementos nativos, es imprescindible comprender la distribución numérica del array `$menu`:

| Posición | Elemento del Menú Nativo |
| --- | --- |
| **2** | Escritorio (Dashboard) |
| **4** | *Primer separador de la barra* |
| **5** | Entradas (Posts) |
| **10** | Medios (Media) |
| **15** | Enlaces (Links - Obsoleto) |
| **20** | Páginas (Pages) |
| **25** | Comentarios (Comments) |
| **59** | *Segundo separador de la barra* |
| **60** | Apariencia (Appearance) |
| **65** | Plugins |
| **70** | Usuarios (Users) |
| **75** | Herramientas (Tools) |
| **80** | Ajustes (Settings) |
| **99** | *Tercer separador de la barra* |

Si dos plugins registran un menú en la misma posición exacta utilizando valores enteros, el último en cargarse sobrescribirá al anterior en la variable global, ocultándolo del panel. Para mitigar este riesgo, la API permite el uso de números flotantes decimales (por ejemplo, `25.32`), reduciendo drásticamente la probabilidad de colisión.

### Implementación Orientada a Objetos Bajo Estándares Estrictos

A continuación se detalla una implementación robusta utilizando Tipado Estricto (PHP 8.0+) y una estructura encapsulada en una clase controladora dentro de la arquitectura de un plugin.

```php
<?php
declare(strict_types=1);

namespace CustomPlugin\Admin;

/**
 * Clase encargada de la gestión del menú principal en el área de administración.
 */
class AdminMenuController 
{
    /**
     * @var string Identificador único del menú.
     */
    private const MENU_SLUG = 'custom-plugin-dashboard';

    /**
     * Inicializa los ganchos de WordPress.
     */
    public function register(): void 
    {
        add_action('admin_menu', [$this, 'addMainMenuPage']);
    }

    /**
     * Registra el menú principal utilizando la API nativa de WordPress.
     */
    public function addMainMenuPage(): void 
    {
        // Icono personalizado codificado en SVG para evitar peticiones HTTP
        $customIcon = 'data:image/svg+xml;base64,' . base64_encode(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="%23a7aaad">' .
            '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd"/>' .
            '</svg>'
        );

        add_menu_page(
            __('Panel de Control del Plugin', 'custom-plugin'), // Page Title
            __('Mi Plugin', 'custom-plugin'),                  // Menu Title
            'manage_options',                                  // Capability requerida
            self::MENU_SLUG,                                   // Menu Slug
            [$this, 'renderAdminPage'],                        // Callback de renderizado
            $customIcon,                                       // URL o String del Icono
            26.5                                               // Posición (Justo debajo de Comentarios)
        );
    }

    /**
     * Callback encargado de renderizar la interfaz de usuario en el panel.
     * * Garantiza la seguridad estructural mediante la verificación implícita
     * de capacidades antes de realizar operaciones de salida de datos.
     */
    public function renderAdminPage(): void 
    {
        // Doble control de seguridad pasiva
        if (!current_user_can('manage_options')) {
            wp_die(__('No tiene permisos suficientes para acceder a esta página.', 'custom-plugin'), '', [
                'response' => 403
            ]);
        }

        ?>
        <div class="wrap">
            <h1><?php echo esc_html(__('Configuración General de Mi Plugin', 'custom-plugin')); ?></h1>
            <div class="notice notice-info">
                <p><?php echo esc_html(__('Bienvenido al entorno de configuración centralizado.', 'custom-plugin')); ?></p>
            </div>
            <div class="card">
                <h2><?php echo esc_html(__('Estado del Ecosistema', 'custom-plugin')); ?></h2>
                <p><?php echo esc_html(__('Utilice las pestañas superiores si se configuran submenús en las secciones subsiguientes.', 'custom-plugin')); ?></p>
            </div>
        </div>
        <?php
    }
}

```

### Consideraciones Críticas de Seguridad y Arquitectura

* **Aislamiento del Callback:** Nunca se debe ejecutar lógica de negocio pesada, mutaciones de la base de datos o procesamiento de formularios directamente dentro del método `$callback` sin una verificación explícita de Nonces y sanitización previa. El callback debe ser tratado exclusivamente como una capa de presentación (Vista).
* **Uso Correcto de Capabilities:** Evite asignar nombres de roles (ej. `'administrator'`) al parámetro `$capability`. El framework requiere capacidades abstractas (`'manage_options'`, `'edit_posts'`, `'activate_plugins'`) para asegurar la compatibilidad con plugins de gestión de roles personalizados y arquitecturas Multisite.
* **Internacionalización (i18n):** Tanto el título de la página como el del menú deben pasarse por las funciones de localización (`__()` o `_e()`). No obstante, el parámetro `$menu_slug` jamás debe ser traducido, ya que sirve como identificador estático de la ruta URL (`wp-admin/admin.php?page=custom-plugin-dashboard`). Si se traduce el slug, el enrutamiento se romperá al cambiar el idioma del perfil del usuario.

## 7.2 Creación de submenús

Una vez establecido el punto de anclaje principal en la interfaz de administración, es frecuente que los plugins complejos requieran ramificar sus opciones para evitar sobrecargar una única pantalla. WordPress gestiona esta jerarquía mediante la función `add_submenu_page()`, la cual vincula nuevas interfaces a un menú padre existente, ya sea un menú nativo del Core o uno personalizado creado por tu plugin.

### Jerarquía y Enrutamiento

El ecosistema de menús de WordPress es estrictamente de dos niveles. No existe soporte nativo para sub-submenús. El árbol de navegación interno se construye vinculando el parámetro `$menu_slug` de un menú padre con el parámetro `$parent_slug` de sus elementos hijos.

```text
 Árbol de Navegación del Panel
               |
 [ Menú Principal Padre ] ---- Slug: 'custom-plugin-dashboard'
               |
               +-- [ Dashboard ]  <-- Slug hijo coincide con el padre ('custom-plugin-dashboard')
               |
               +-- [ Ajustes ]    <-- Slug: 'custom-plugin-settings'
               |
               +-- [ Licencia ]   <-- Slug: 'custom-plugin-license'

```

### Anatomía de `add_submenu_page()`

La firma de la función introduce variaciones clave respecto a la creación de menús principales:

```php
function add_submenu_page(
    string $parent_slug,
    string $page_title,
    string $menu_title,
    string $capability,
    string $menu_slug,
    callable $callback = '',
    int|float $position = null
): string|false { ... }

```

El parámetro crítico aquí es `$parent_slug`. Dependiendo de dónde desees ubicar el submenú, este valor cambiará drásticamente.

#### Vinculación a Menús Nativos

Si tu plugin es de propósito único o no requiere un menú raíz propio, es una excelente práctica de UX anclar su configuración en los menús nativos existentes. WordPress proporciona el slug de los archivos PHP internos del administrador como `$parent_slug`, así como funciones contenedoras (*wrappers*) para facilitar el proceso:

| Menú Nativo Destino | Valor de `$parent_slug` | Función Wrapper Equivalente |
| --- | --- | --- |
| **Ajustes** | `options-general.php` | `add_options_page()` |
| **Herramientas** | `tools.php` | `add_management_page()` |
| **Apariencia** | `themes.php` | `add_theme_page()` |
| **Plugins** | `plugins.php` | `add_plugins_page()` |
| **Usuarios** | `users.php` | `add_users_page()` |
| **Entradas** | `edit.php` | `add_posts_page()` |
| **Páginas** | `edit.php?post_type=page` | `add_pages_page()` |
| **Custom Post Type** | `edit.php?post_type=mi_cpt` | N/A (Usar `add_submenu_page`) |

### El Comportamiento del "Primer Submenú"

Cuando registras un menú principal con `add_menu_page()`, WordPress automáticamente crea un primer submenú subyacente con el mismo nombre y slug que el menú padre. Si deseas que este primer enlace actúe como una vista general y tenga un título diferente en el submenú (por ejemplo, cambiar el título "Mi Plugin" del menú padre por "Vista General" en el submenú), debes registrar un submenú explícito donde el `$parent_slug` y el `$menu_slug` sean idénticos al slug del padre.

### Implementación Práctica Orientada a Objetos

Extendiendo la arquitectura de la lección anterior, a continuación se detalla cómo registrar múltiples submenús: uno vinculado a nuestro menú personalizado y otro inyectado en el menú nativo de Ajustes de WordPress.

```php
<?php
declare(strict_types=1);

namespace CustomPlugin\Admin;

class AdminSubmenuController 
{
    private const PARENT_SLUG = 'custom-plugin-dashboard';

    public function register(): void 
    {
        // Se engancha en admin_menu, igual que el menú principal.
        // Es recomendable usar una prioridad mayor (ej. 11) si el menú 
        // padre se registra en el mismo gancho con prioridad por defecto.
        add_action('admin_menu', [$this, 'registerSubmenus'], 11);
    }

    public function registerSubmenus(): void 
    {
        // 1. Sobrescribir el primer submenú automático
        // Al usar el mismo PARENT_SLUG como menu_slug, redefinimos el título
        add_submenu_page(
            self::PARENT_SLUG,
            __('Vista General del Plugin', 'custom-plugin'),
            __('Vista General', 'custom-plugin'),
            'manage_options',
            self::PARENT_SLUG, // Coincide con el padre
            [$this, 'renderDashboardView']
        );

        // 2. Agregar un submenú adicional al menú personalizado
        add_submenu_page(
            self::PARENT_SLUG,
            __('Configuración Avanzada', 'custom-plugin'),
            __('Avanzado', 'custom-plugin'),
            'manage_options',
            'custom-plugin-advanced',
            [$this, 'renderAdvancedView']
        );

        // 3. Inyectar una vista en un menú nativo (Ajustes)
        add_options_page(
            __('Integración del Plugin', 'custom-plugin'),
            __('Mi Plugin (Core)', 'custom-plugin'),
            'manage_options',
            'custom-plugin-core-settings',
            [$this, 'renderCoreSettingsView']
        );
    }

    public function renderDashboardView(): void 
    {
        $this->enforceCapabilities();
        echo '<div class="wrap"><h1>' . esc_html(__('Vista General', 'custom-plugin')) . '</h1></div>';
    }

    public function renderAdvancedView(): void 
    {
        $this->enforceCapabilities();
        echo '<div class="wrap"><h1>' . esc_html(__('Opciones Avanzadas', 'custom-plugin')) . '</h1></div>';
    }

    public function renderCoreSettingsView(): void 
    {
        $this->enforceCapabilities();
        echo '<div class="wrap"><h1>' . esc_html(__('Ajustes en el Core', 'custom-plugin')) . '</h1></div>';
    }

    /**
     * Método auxiliar para centralizar la verificación de seguridad.
     */
    private function enforceCapabilities(): void 
    {
        if (!current_user_can('manage_options')) {
            wp_die(__('Acceso denegado.', 'custom-plugin'), '', ['response' => 403]);
        }
    }
}

```

### Patrón Arquitectónico para Menús Ocultos

En el desarrollo de plugins, surge a menudo la necesidad de crear páginas de administración que no deben aparecer listadas en la barra de navegación lateral (por ejemplo, una pantalla temporal para mostrar un registro de errores o un proceso de *onboarding* tras la activación).

Para registrar una página sin que genere un elemento visible en el menú, se utiliza un "truco" de la API pasando un valor `null` al parámetro `$parent_slug`:

```php
add_submenu_page(
    null, // Omite la inserción en el menú visual
    __('Bienvenida al Plugin', 'custom-plugin'),
    __('Bienvenida', 'custom-plugin'),
    'manage_options',
    'custom-plugin-welcome',
    [$this, 'renderWelcomeScreen']
);

```

La página será completamente funcional y segura, pero solo se podrá acceder a ella navegando directamente a su URL correspondiente: `wp-admin/admin.php?page=custom-plugin-welcome`.

## 7.3 Encolado de scripts y estilos

La inyección directa de etiquetas `<script>` o `<link>` en el código HTML es una de las peores prácticas en el desarrollo para WordPress. Este enfoque destruye la modularidad, impide la minificación centralizada, genera conflictos de dependencias (por ejemplo, cargar múltiples versiones de jQuery) y anula los mecanismos de caché del navegador.

Para resolver esto, WordPress implementa la **API de Encolado (Enqueue API)**, un sistema de gestión de dependencias que asegura que los recursos (assets) se carguen en el orden correcto, solo cuando son necesarios y respetando las versiones en caché.

### El Gancho `admin_enqueue_scripts`

En el entorno de administración, el hook designado para registrar y encolar recursos es `admin_enqueue_scripts`. A diferencia de su contraparte del front-end (`wp_enqueue_scripts`), este gancho pasa un parámetro de suma importancia a la función callback: el **`$hook_suffix`** (también conocido como `$hook` o simplemente el identificador de la pantalla actual).

Cargar los scripts de tu plugin en *todas* las páginas del panel de administración (como en la pantalla de edición de entradas o ajustes generales) es una infracción de rendimiento y seguridad. Debes condicionar la carga de tus recursos exclusivamente a las interfaces que tu plugin genera.

### El Flujo de Carga Condicional

El siguiente esquema ilustra el proceso de validación para encolar recursos de forma quirúrgica:

```text
    Petición a /wp-admin/admin.php?page=mi-plugin
                     |
        [ admin_enqueue_scripts ] disparado
                     |
         Pasa $hook_suffix (ej. 'toplevel_page_mi-plugin')
                     |
            +-------------------+
            | ¿$hook_suffix     | ---> NO ---> [ Abortar encolado ] (Fin)
            | coincide con      |
            | nuestra página?   |
            +-------------------+
                     |
                    SÍ
                     v
        1. wp_register_script() / wp_register_style()
        2. wp_localize_script() (Paso de datos PHP a JS)
        3. wp_enqueue_script()  / wp_enqueue_style()

```

### Funciones Principales de la API

La API separa conceptualmente el "registro" del "encolado", aunque se pueden realizar simultáneamente.

1. **`wp_register_style()` / `wp_register_script()`:** Avisa a WordPress de la existencia de un archivo, sus dependencias y su versión, pero no lo inserta en el HTML. Ideal para recursos que podrían cargarse bajo demanda mediante shortcodes o bloques.
2. **`wp_enqueue_style()` / `wp_enqueue_script()`:** Inserta efectivamente el recurso en el `<head>` o justo antes de cerrar el `<body>`. Si el archivo no fue registrado previamente, esta función lo registra y encola en un solo paso.

### Implementación Orientada a Objetos: Captura del Suffix

Para encolar condicionalmente, necesitamos conocer el identificador único que WordPress asigna a nuestra página al crearla. Funciones como `add_menu_page()` y `add_submenu_page()` no solo crean el menú, sino que **devuelven un string** que representa el `$hook_suffix` de esa interfaz.

El siguiente patrón arquitectónico captura ese string en una propiedad de la clase para utilizarlo posteriormente en la validación del encolado:

```php
<?php
declare(strict_types=1);

namespace CustomPlugin\Admin;

class AdminAssetsController 
{
    private const MENU_SLUG = 'custom-plugin-dashboard';
    
    /**
     * @var string Almacena el identificador único de la página del plugin.
     */
    private string $pageHook = '';

    public function register(): void 
    {
        // 1. Registrar el menú
        add_action('admin_menu', [$this, 'addMainMenuPage']);
        
        // 2. Registrar el hook de encolado
        add_action('admin_enqueue_scripts', [$this, 'enqueueAdminAssets']);
    }

    public function addMainMenuPage(): void 
    {
        // Capturamos el string devuelto por add_menu_page
        $this->pageHook = add_menu_page(
            __('Panel de Control', 'custom-plugin'),
            __('Mi Plugin', 'custom-plugin'),
            'manage_options',
            self::MENU_SLUG,
            [$this, 'renderAdminPage'],
            'dashicons-admin-generic',
            30
        );
    }

    /**
     * @param string $hook_suffix El identificador de la pantalla actual en el admin.
     */
    public function enqueueAdminAssets(string $hook_suffix): void 
    {
        // Validación de guardia: Si no estamos en la página del plugin, salimos.
        if ($hook_suffix !== $this->pageHook) {
            return;
        }

        $plugin_url = plugin_dir_url(dirname(__FILE__, 2));
        $plugin_path = plugin_dir_path(dirname(__FILE__, 2));

        // Encolado de Estilos (CSS)
        // filemtime() actúa como cache-buster automático (versión = timestamp de modificación)
        wp_enqueue_style(
            'custom-plugin-admin-css',
            $plugin_url . 'assets/css/admin-style.css',
            [], // Sin dependencias CSS
            (string) filemtime($plugin_path . 'assets/css/admin-style.css'),
            'all' // Media (all, screen, print)
        );

        // Encolado de Scripts (JS)
        wp_enqueue_script(
            'custom-plugin-admin-js',
            $plugin_url . 'assets/js/admin-script.js',
            ['jquery'], // Depende de jQuery (se cargará antes que nuestro script)
            (string) filemtime($plugin_path . 'assets/js/admin-script.js'),
            true // true = inyectar en el footer (antes de </body>)
        );

        // Puente PHP -> JavaScript
        $this->localizeScriptData();
    }

    /**
     * Inyecta variables dinámicas de PHP en el objeto global de JavaScript.
     */
    private function localizeScriptData(): void 
    {
        wp_localize_script(
            'custom-plugin-admin-js', // Debe coincidir con el handle del script encolado
            'CustomPluginData',       // Nombre del objeto global que existirá en JS
            [
                'ajaxUrl'   => admin_url('admin-ajax.php'),
                'nonce'     => wp_create_nonce('custom_plugin_admin_action'),
                'i18n'      => [
                    'confirmDelete' => __('¿Está seguro de eliminar este registro?', 'custom-plugin'),
                    'saveSuccess'   => __('Ajustes guardados correctamente.', 'custom-plugin')
                ]
            ]
        );
    }

    public function renderAdminPage(): void 
    {
        // Lógica de renderizado (Vista)
        echo '<div class="wrap"><h1>Panel</h1></div>';
    }
}

```

### El Puente de Datos: `wp_localize_script()`

Como se observa en el método `$this->localizeScriptData()`, los archivos JavaScript externos son estáticos y no pueden interpretar código PHP directamente. Para pasar configuraciones de rutas dinámicas (como la URL de AJAX), tokens de seguridad (Nonces) o cadenas de texto traducibles, se utiliza `wp_localize_script()`.

WordPress inyectará un bloque `<script>` embebido justo encima de tu archivo `admin-script.js` con el siguiente resultado en el HTML del panel:

```html
<script type="text/javascript">
/* <![CDATA[ */
var CustomPluginData = {
    "ajaxUrl": "https://midominio.com/wp-admin/admin-ajax.php",
    "nonce": "a1b2c3d4e5",
    "i18n": {
        "confirmDelete": "¿Está seguro de eliminar este registro?",
        "saveSuccess": "Ajustes guardados correctamente."
    }
};
/* ]]> */
</script>
<script type="text/javascript" src="https://midominio.com/wp-content/plugins/mi-plugin/assets/js/admin-script.js?ver=1684501200" id="custom-plugin-admin-js-js"></script>

```

Dentro de tu archivo `admin-script.js`, el objeto ahora estará disponible de forma nativa para consumir de forma segura:

```javascript
(function($) {
    'use strict';

    $(document).ready(function() {
        $('.delete-btn').on('click', function(e) {
            e.preventDefault();
            // Consumiendo traducciones inyectadas desde PHP
            if (confirm(CustomPluginData.i18n.confirmDelete)) {
                // Proceder con la petición AJAX utilizando CustomPluginData.nonce
            }
        });
    });

})(jQuery);

```

*(Nota: En WordPress 4.5+ se introdujo `wp_add_inline_script` que permite inyectar JavaScript en línea más complejo, y en WP 5.0+ `wp_set_script_translations` para usar los sistemas de localización basados en JED/JSON estándar de Gutenberg, pero `wp_localize_script` se mantiene como la forma más rápida, segura y retrocompatible de transferir arrays multidimensionales de configuración desde el backend al frontend).*

## 7.4 Diseño con clases CSS nativas

El mayor error en el diseño de interfaces de administración para WordPress es intentar reinventar la rueda. Un plugin profesional debe sentirse como una extensión natural del núcleo, no como un software de terceros incrustado a la fuerza.

WordPress provee un framework CSS interno (cargado automáticamente a través de los estilos del administrador) compuesto por decenas de clases utilitarias. Utilizar estas clases garantiza que tu interfaz respetará los esquemas de color elegidos por el usuario en su perfil, mantendrá la accesibilidad (contraste y navegación por teclado) y se adaptará automáticamente a los rediseños futuros del Core sin requerir mantenimiento por tu parte.

### Contenedores y Estructura Base

Todo el contenido de una página de administración debe estar encapsulado para alinearse correctamente con la barra superior y el menú lateral.

* **`.wrap`**: Es el contenedor principal obligatorio. Otorga los márgenes y el relleno necesarios para separar tu contenido de los bordes de la pantalla.
* **`.wp-heading-inline`**: Se aplica a la etiqueta `<h1>`. Permite que otros elementos (como botones de acción) se coloquen a su lado en la misma línea.
* **`.page-title-action`**: Convierte un enlace estándar `<a>` en un botón posicionado justo al lado del título principal (ideal para acciones como "Añadir nuevo").
* **`.wp-header-end`**: Se aplica a una etiqueta `<hr>`. Actúa como un separador invisible que limpia los elementos flotantes del encabezado (clearfix) y marca el inicio del contenido real.

### Sistema de Notificaciones (Admin Notices)

Las alertas de estado son fundamentales para informar al usuario sobre el resultado de una acción (como guardar configuraciones). Todas comparten una clase base y se modifican mediante clases de estado.

```text
Estructura de una Notificación
+-------------------------------------------------------+
| [Color Borde] Mensaje descriptivo para el usuario (X) |
+-------------------------------------------------------+

```

* **Clase Base**: `.notice`
* **Modificadores de Estado**:
* `.notice-success` (Borde verde): Operaciones exitosas.
* `.notice-error` (Borde rojo): Fallos, validaciones incorrectas.
* `.notice-warning` (Borde naranja): Acciones destructivas o actualizaciones pendientes.
* `.notice-info` (Borde azul): Información general o estado del sistema.

* **Comportamiento**: `.is-dismissible` inyecta automáticamente mediante JavaScript un botón (X) para que el usuario pueda cerrar la alerta.

### Estructuración de Formularios

Para el desarrollo de páginas de opciones, WordPress utiliza un diseño tabular estandarizado.

* **`.form-table`**: Transforma una etiqueta `<table>` en una cuadrícula responsiva perfecta para formularios de configuración, donde la columna izquierda contiene los `<label>` y la derecha los inputs.
* **Clases de campos de texto**: Regulan la anchura de los inputs para mantener consistencia.
* `.regular-text`: Anchura estándar (recomendada para la mayoría de campos).
* `.small-text`: Para campos numéricos o de códigos cortos.
* `.large-text`: Ocupa el 100% del ancho del contenedor.
* `.code`: Cambia la tipografía a monoespaciada (ideal para URLs, slugs o fragmentos de código).

### Componentes de Interfaz: Botones y Tarjetas

* **Botones**: WordPress unifica el diseño de los botones (sean etiquetas `<button>`, `<input type="submit">` o `<a>`) a través de la clase base `.button`.
* `.button-primary`: Fondo azul sólido. Úsalo solo para la acción principal de la pantalla (como "Guardar cambios").
* `.button-secondary` (o solo `.button`): Fondo gris claro. Para acciones secundarias (cancelar, previsualizar).
* `.button-large` / `.button-small`: Modificadores de tamaño.
* `.button-link`: Texto con apariencia de enlace puro pero comportamiento de botón.

* **`.card`**: Crea una caja blanca con un ligero sombreado, ideal para tableros de resumen (dashboards) o para agrupar información que no pertenece a un formulario.

### Implementación Completa: Una Interfaz Nativa

El siguiente código HTML ilustra cómo combinar estas clases para construir una página de ajustes con un diseño idéntico al del Core, sin escribir una sola línea de CSS personalizado:

```html
<div class="wrap">
    <h1 class="wp-heading-inline">Ajustes del Plugin</h1>
    <a href="#" class="page-title-action">Documentación</a>
    <hr class="wp-header-end">

    <div class="notice notice-success is-dismissible">
        <p><strong>Ajustes guardados.</strong> La configuración se ha actualizado correctamente.</p>
    </div>

    <div class="card" style="max-width: 100%; margin-bottom: 20px;">
        <h2 class="title">Estado de Conexión API</h2>
        <p>El sistema se encuentra sincronizado. Su última actualización fue hace 2 horas.</p>
    </div>

    <form method="post" action="options.php">
        <table class="form-table" role="presentation">
            <tbody>
                <tr>
                    <th scope="row">
                        <label for="api_key">Clave de la API</label>
                    </th>
                    <td>
                        <input name="api_key" type="text" id="api_key" value="ak_12345XYZ" class="regular-text code">
                        <p class="description">Introduzca la clave privada proporcionada por su proveedor.</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="items_per_page">Elementos por página</label>
                    </th>
                    <td>
                        <input name="items_per_page" type="number" id="items_per_page" value="20" class="small-text">
                    </td>
                </tr>
                <tr>
                    <th scope="row">Nivel de Depuración</th>
                    <td>
                        <fieldset>
                            <legend class="screen-reader-text"><span>Nivel de Depuración</span></legend>
                            <label>
                                <input type="radio" name="debug_mode" value="1" checked="checked">
                                Activado
                            </label><br>
                            <label>
                                <input type="radio" name="debug_mode" value="0">
                                Desactivado
                            </label>
                        </fieldset>
                    </td>
                </tr>
            </tbody>
        </table>

        <p class="submit">
            <input type="submit" name="submit" id="submit" class="button button-primary" value="Guardar cambios">
            <button type="button" class="button button-secondary">Restaurar valores por defecto</button>
        </p>
    </form>
</div>

```

## Resumen del capítulo

En este capítulo hemos construido los cimientos de la experiencia de usuario en el panel de administración. Exploramos cómo interactuar con el árbol de navegación interno usando `add_menu_page()` para establecer un punto de entrada central y `add_submenu_page()` para jerarquizar las opciones, garantizando en todo momento la protección mediante capacidades y permisos estandarizados.

Abordamos la vital importancia del rendimiento y la prevención de conflictos mediante el uso quirúrgico de la API de Encolado (`admin_enqueue_scripts`), asegurando que nuestros recursos estáticos y traducciones dinámicas con `wp_localize_script()` se carguen exclusivamente en nuestras propias pantallas. Finalmente, descubrimos cómo estructurar HTML utilizando las clases CSS nativas de WordPress, permitiéndonos crear interfaces que son responsivas, accesibles y visualmente coherentes con el entorno en el que residen, reduciendo nuestra deuda técnica al mínimo.
