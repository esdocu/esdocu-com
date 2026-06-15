Todo plugin robusto en WordPress requiere cimientos sólidos. En este capítulo desentrañaremos la estructura interna de un desarrollo profesional, alejándonos del código amateur para adoptar una arquitectura modular y escalable.

Explorarás las directivas obligatorias en las cabeceras, la distribución segura de archivos y el dominio absoluto del sistema de **Hooks** (Actions y Filters), el corazón de la extensibilidad del *Core*. Finalmente, aprenderás a gestionar el ciclo de vida completo del software (activación, desactivación y la purga *Tabula Rasa* al desinstalar), blindando tu código con los estrictos estándares oficiales de codificación (WPCS).

## 2.1 Cabeceras y estructura de archivos

El punto de partida de cualquier desarrollo de plugins en WordPress es el diseño de su arquitectura de archivos y la correcta declaración de sus metadatos. WordPress depende de un bloque de comentarios formateado de manera específica en el archivo principal del plugin para reconocer su existencia, registrarlo en el ecosistema del panel de administración y gestionar sus dependencias básicas.

### El bloque de cabeceras del plugin

Para que el motor de WordPress identifique un archivo PHP válido como un plugin activo o activable, dicho archivo debe contener un comentario de bloque inicial. WordPress utiliza la función interna `get_plugin_data()` para escanear y parsear estas directivas mediante expresiones regulares, abstrayendo esta información para el panel de control del administrador.

A continuación se presenta una plantilla estandarizada con todas las directivas de cabecera que requiere un desarrollo profesional y empresarial:

```php
<?php
/**
 * Plugin Name:       Enterprise Order Router
 * Plugin URI:        https://ejemplo.com/plugins/enterprise-order-router
 * Description:       Enruta pedidos de alta prioridad a centros logísticos externos utilizando colas asíncronas.
 * Version:           1.0.0
 * Requires at least: 6.2
 * Requires PHP:      8.1
 * Author:            Logistics Dev Team
 * Author URI:        https://ejemplo.com/team
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       enterprise-order-router
 * Domain Path:       /languages
 * Update URI:        https://ejemplo.com/api/updates/enterprise-order-router
 */

// Clausura de seguridad: Evita la ejecución directa desde el servidor web
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

```

#### Anatomía y semántica de las directivas de cabecera

* **Plugin Name** *(Obligatorio)*: Define el nombre comercial u operativo que se mostrará en la lista de plugins del área de administración. Debe ser único para evitar confusiones de identidad en el entorno del cliente.
* **Plugin URI**: La URL de la página de información, documentación o repositorio del plugin. Debe apuntar a un recurso web específico del producto.
* **Description**: Un resumen técnico conciso (se recomiendan menos de 140 caracteres) que describe la funcionalidad exacta del componente.
* **Version**: La versión actual del plugin. Es imperativo seguir el paradigma de *Versionado Semántico* (MAJOR.MINOR.PATCH) para que los sistemas de actualización comparen cadenas correctamente.
* **Requires at least**: La versión mínima del núcleo de WordPress que garantiza la existencia de las funciones nativas y APIs utilizadas en el código.
* **Requires PHP**: La versión mínima del intérprete de PHP necesaria. Si el servidor del usuario ejecuta una versión inferior, WordPress abortará la activación de manera segura, previniendo errores de sintaxis fatales (*Fatal Errors*).
* **Author / Author URI**: Identificación del desarrollador o la entidad corporativa responsable del mantenimiento y su enlace de contacto.
* **License / License URI**: El marco legal del software. Para interactuar sin fricciones en el ecosistema WordPress, se adopta la licencia GPLv2 o posterior.
* **Text Domain**: El identificador único único (slug) utilizado por el motor de internacionalización (`i18n`) para vincular las funciones de traducción (`__()`, `_e()`) con los archivos de idioma locales.
* **Domain Path**: Especifica la ruta física donde residen los archivos de traducción compilados (`.mo` y `.po`). Por estandarización, se sitúa en `/languages`.
* **Update URI**: Anula el servidor de actualizaciones por defecto del repositorio oficial de WordPress. Es crucial para plugins de distribución interna o privada, forzando al núcleo a buscar metadatos de actualización en endpoints propios.

### Arquitectura estructural del sistema de archivos

Aunque WordPress permite ejecutar un plugin empaquetado en un único archivo PHP ubicado directamente en la raíz de `wp-content/plugins/`, este enfoque penaliza severamente la mantenibilidad, el testing unitario y la escalabilidad del código. Un entorno industrial exige una separación estricta de responsabilidades mediante una arquitectura modular.

#### Mitigación de vectores de ataque por acceso directo

La instrucción de control colocada inmediatamente después de las cabeceras responde a una directriz de seguridad crítica:

```php
if ( ! defined( 'ABSPATH' ) ) {
    header( 'HTTP/1.0 403 Forbidden' );
    exit( 'Acceso directo denegado.' );
}

```

Al verificar que la constante global `ABSPATH` no esté definida, se detiene la ejecución del script si un atacante intenta invocar el archivo directamente llamando a la URL física del archivo (ej. `https://sitio.com/wp-content/plugins/plugin/archivo.php`). Esto garantiza que el código solo se ejecute cuando WordPress ha inicializado su pila de seguridad, cargado las opciones de configuración y autenticado el entorno.

#### Distribución profesional de directorios

Para garantizar el desacoplamiento entre las reglas de negocio, la lógica de presentación del backend (área de administración) y la vista pública (frontend), se implementa la siguiente estructura de directorios:

```text
enterprise-order-router/
│
├── enterprise-order-router.php    # Archivo bootstrap principal
├── uninstall.php                  # Script de purga profunda en desinstalación
├── README.md                      # Documentación técnica del proyecto
│
├── admin/                         # Capa de administración (Back-end)
│   ├── class-plugin-admin.php     # Controlador del panel de administración
│   ├── partials/                  # Vistas y layouts HTML del admin
│   ├── css/                       # Hojas de estilo específicas del admin
│   └── js/                        # Scripts de comportamiento del admin
│
├── public/                        # Capa pública (Front-end)
│   ├── class-plugin-public.php    # Controlador de la interfaz pública
│   ├── partials/                  # Plantillas de renderizado para el usuario final
│   ├── css/                       # Estilos para la interfaz pública
│   └── js/                        # JavaScript dinámico del frontend
│
├── includes/                      # Núcleo y utilidades del sistema
│   ├── class-plugin-loader.php    # Orquestador central de Hooks (Actions/Filters)
│   ├── class-plugin-i18n.php      # Inicializador del dominio de idiomas
│   ├── class-plugin-activator.php # Tareas de inicialización y migración
│   └── class-plugin-deactivator.php# Limpieza temporal al desactivar
│
├── languages/                     # Catálogos de traducción (.pot, .po, .mo)
└── vendor/                        # Dependencias externas administradas vía Composer

```

#### Flujo de inicialización guiado por el archivo de arranque (Bootstrap)

El archivo raíz `enterprise-order-router.php` no debe contener lógica de negocio ni manipulación directa de datos. Su única responsabilidad es actuar como el punto de orquestación inicial o *bootstrap*.

Un patrón técnico de inicialización robusto y orientado a objetos se estructura de la siguiente manera:

```php
<?php
/**
 * Plugin Name: Enterprise Order Router
 * ... [Cabeceras del bloque de metadatos]
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Inclusión del autoloader automático si el proyecto integra dependencias mediante Composer
if ( file_exists( plugin_dir_path( __FILE__ ) . 'vendor/autoload.php' ) ) {
    require_once plugin_dir_path( __FILE__ ) . 'vendor/autoload.php';
}

/**
 * Carga manual de los componentes fundamentales de la arquitectura
 */
require_once plugin_dir_path( __FILE__ ) . 'includes/class-plugin-loader.php';
require_once plugin_dir_path( __FILE__ ) . 'includes/class-plugin-i18n.php';
require_once plugin_dir_path( __FILE__ ) . 'admin/class-plugin-admin.php';
require_once plugin_dir_path( __FILE__ ) . 'public/class-plugin-public.php';

/**
 * Desencadena la ejecución y el registro del ciclo de vida del plugin
 */
function run_enterprise_order_router() {
    // Orquestador que acumula y despacha los hooks hacia WordPress
    $loader = new Enterprise_Order_Router_Loader();

    // Carga de la capa de traducción del plugin
    $plugin_i18n = new Enterprise_Order_Router_I18n();
    $loader->add_action( 'plugins_loaded', $plugin_i18n, 'load_plugin_textdomain' );

    // Inicialización y pase de dependencias a los subsistemas
    $plugin_admin  = new Enterprise_Order_Router_Admin( $loader );
    $plugin_public = new Enterprise_Order_Router_Public( $loader );

    // Se ejecutan las suscripciones a add_action y add_filter de forma centralizada
    $loader->run();
}

run_enterprise_order_router();

```

Este diseño estructural asegura un aislamiento completo de los componentes, permitiendo que múltiples desarrolladores trabajen en distintas secciones del plugin sin generar conflictos en el control de versiones y garantizando una traza de ejecución predecible y limpia para el motor de WordPress.

## 2.2 Hooks: Actions y Filters

El núcleo de WordPress y su ecosistema de extensibilidad se fundamentan en una arquitectura orientada a eventos (Event-Driven Architecture). Este sistema, comúnmente conocido como el **Sistema de Hooks** (ganchos), implementa una variación del patrón de diseño *Observer* o *Mediator*. Permite a los desarrolladores inyectar lógica personalizada o modificar el comportamiento por defecto del núcleo, temas u otros plugins, sin necesidad de alterar los archivos originales del código fuente.

Comprender la distinción anatómica y funcional entre los dos tipos de hooks disponibles —Actions (Acciones) y Filters (Filtros)— es el pilar central del desarrollo de plugins.

### El flujo de intercepción

En texto plano, el ciclo de vida de un hook se visualiza de la siguiente manera:

```text
=======================================================================
                        FLUJO DE EJECUCIÓN CORE
=======================================================================
[Proceso Interno WP] 
       |
       v
  do_action() / apply_filters()  -----> [ REGISTRO GLOBAL DE HOOKS ($wp_filter) ]
       |                                          |
       |                                          +-- Prioridad 1:  PluginA_Callback()
       |                                          |
       |                                          +-- Prioridad 10: Tu_Plugin_Callback()
       |                                          |
       |                                          +-- Prioridad 99: Tema_Callback()
       v                                          |
[Continúa el proceso] <---------------------------+ (Retorna control o datos modificados)

```

WordPress mantiene un registro global (instanciado en la clase `WP_Hook`) de todas las funciones que se han "suscrito" a un evento específico. Cuando el flujo de ejecución alcanza un punto definido, WordPress detiene momentáneamente su proceso nativo y ejecuta secuencialmente todos los *callbacks* registrados, respetando su nivel de prioridad.

### Actions (Acciones): Inyección de comportamiento

Las **Acciones** son eventos en el ciclo de vida de WordPress donde se te permite ejecutar código personalizado. Una acción no necesita retornar un valor; su propósito es producir efectos secundarios (escribir en la base de datos, enviar un correo electrónico, imprimir código HTML, encolar un script, etc.).

El núcleo invoca una acción utilizando la función `do_action( 'nombre_del_hook', $argumentos )`.

Para interceptar esta acción desde tu plugin, utilizas la función `add_action()`. En una arquitectura orientada a objetos (como la vista en la sección anterior), el registro y el *callback* se estructuran así:

```php
// 1. Registro del Hook en tu orquestador o constructor
// add_action( string $hook_name, callable $callback, int $priority = 10, int $accepted_args = 1 )
add_action( 'user_register', [ $this, 'send_welcome_email_to_new_user' ], 10, 1 );

// 2. El método Callback
/**
 * Envía un correo corporativo cuando un usuario se registra.
 *
 * @param int $user_id El ID del usuario recién creado pasado por el hook 'user_register'.
 */
public function send_welcome_email_to_new_user( int $user_id ): void {
    $user_info = get_userdata( $user_id );
    
    if ( ! $user_info ) {
        return;
    }

    $to      = $user_info->user_email;
    $subject = 'Bienvenido a la Intranet Corporativa';
    $message = 'Su cuenta ha sido aprovisionada con éxito.';

    wp_mail( $to, $subject, $message );
}

```

### Filters (Filtros): Mutación de datos

A diferencia de las acciones, los **Filtros** interceptan datos antes de que se guarden en la base de datos o se rendericen en la pantalla. La regla inquebrantable de un filtro es que **siempre debe retornar un valor**, específicamente el mismo tipo de dato que recibió, habiendo aplicado (o no) las transformaciones necesarias.

El núcleo expone una variable a filtrado utilizando `apply_filters( 'nombre_del_filtro', $valor_a_filtrar, $argumentos_extra )`.

Tu plugin captura y modifica esta variable mediante `add_filter()`:

```php
// 1. Registro del Filtro
// add_filter( string $hook_name, callable $callback, int $priority = 10, int $accepted_args = 2 )
add_filter( 'wp_insert_post_data', [ $this, 'sanitize_enterprise_post_title' ], 10, 2 );

// 2. El método Callback
/**
 * Añade un prefijo estandarizado a los títulos de los CPT 'orders'.
 *
 * @param array $data    Array asociativo con los datos del post a insertar.
 * @param array $postarr Array con los datos originales enviados por el usuario.
 * @return array         El array de datos modificado (OBLIGATORIO).
 */
public function sanitize_enterprise_post_title( array $data, array $postarr ): array {
    // Verificamos que estamos operando sobre el Custom Post Type correcto
    if ( 'orders' === $data['post_type'] ) {
        // Evitamos añadir el prefijo si ya existe (ej. en una actualización)
        if ( ! str_starts_with( $data['post_title'], '[ENT-ORDER]' ) ) {
            $data['post_title'] = '[ENT-ORDER] ' . sanitize_text_field( $data['post_title'] );
        }
    }

    // Un filtro NUNCA debe interrumpir el flujo; siempre debe devolver el primer argumento
    return $data;
}

```

### Gestión de prioridades y parámetros múltiples

La flexibilidad del sistema de hooks reside en dos parámetros críticos de las funciones `add_action` y `add_filter`:

1. **Prioridad (Priority):** Es un número entero que dicta el orden de ejecución. El valor por defecto es `10`. Los números más bajos (ej. `1`, `5`) se ejecutan primero, mientras que los más altos (ej. `20`, `99`) se ejecutan después. Si dos callbacks tienen la misma prioridad, se ejecutan en el orden en que fueron registrados durante la carga de PHP.

* *Caso de uso:* Si necesitas sobrescribir la modificación hecha por un plugin de terceros que ejecuta su filtro en prioridad 10, debes enganchar el tuyo en una prioridad posterior, como 20 o 99.

1. **Argumentos aceptados (Accepted Args):** Por defecto, un *callback* solo recibe el primer parámetro que envía `do_action` o `apply_filters`. Si el hook original emite tres variables y necesitas las tres en tu método, debes definir explícitamente `3` en el cuarto parámetro de tu registro.

### Remoción y anulación de Hooks

Parte del desarrollo avanzado implica desactivar comportamientos introducidos por el núcleo u otros plugins. Para ello existen `remove_action()` y `remove_filter()`.

Para que la remoción sea exitosa, la función de eliminación debe ejecutarse *después* de que el hook objetivo haya sido registrado, y la firma (el nombre del hook, el callback exacto y la prioridad) debe coincidir milimétricamente.

```php
// Ejemplo: Eliminar una acción registrada de forma procedural por un plugin de terceros
// Tercero: add_action( 'wp_head', 'inject_tracking_script', 15 );
remove_action( 'wp_head', 'inject_tracking_script', 15 );

// Ejemplo: Eliminar un método de un objeto instanciado (requiere acceso a la instancia original)
global $third_party_plugin;
remove_action( 'the_content', [ $third_party_plugin, 'append_signature' ], 10 );

```

La incapacidad de remover hooks anónimos (Closures o Arrow functions de PHP) es la razón principal por la cual los estándares de codificación de WordPress desaconsejan fuertemente su uso al definir *callbacks* en el desarrollo de plugins que pretendan ser extensibles.

## 2.3 Rutinas de activación

La rutina de activación de un plugin es un punto crítico en su ciclo de vida. Se ejecuta única y exclusivamente en el momento en que un administrador hace clic en el enlace "Activar" desde el panel de control, o bien cuando se ejecuta el comando correspondiente a través de la interfaz de línea de comandos `wp-cli` (`wp plugin activate`).

El propósito fundamental de esta fase es preparar el entorno de WordPress para que el plugin pueda operar correctamente a partir de ese instante. No debe utilizarse para ejecutar lógica de negocio recurrente, sino para tareas de aprovisionamiento, verificación estructural y configuración inicial.

### Mecánica de ejecución y el hook de activación

Para registrar una función de activación, WordPress expone la función nativa `register_activation_hook()`. Un error común en el desarrollo amateur es invocar esta función dentro de un hook como `init` o `plugins_loaded`. Debido a la forma en que WordPress carga los archivos, `register_activation_hook()` debe ser llamada directamente en el cuerpo principal del archivo raíz (bootstrap) del plugin, o bien en una clase cargada de forma inmediata por este.

```text
=======================================================================
               FLUJO PRINCIPAL DE ACTIVACIÓN EN WORDPRESS
=======================================================================
 [Petición POST Admin] ──> [Carga de Archivo Principal] 
                                    │
                                    v
                     [¿ register_activation_hook ?]
                                    │
                  ┌─────────────────┴─────────────────┐
                  ▼                                   ▼
          [Validar Entorno]                  [Aprovisionamiento]
       - Versión PHP / Core WP             - Crear tablas ($wpdb)
       - Extensiones requeridas            - Inyectar 'Options API'
                  │                                   │
                  └─────────────────┬─────────────────┘
                                    v
                        [Flush Rewrite Rules]
                        (Solo si maneja CPTs)
                                    │
                                    v
                     [Redirección / Éxito en UI]

```

### Implementación de un Activador Estructurado

Siguiendo la arquitectura orientada a objetos definida en las secciones previas, delegaremos la responsabilidad de la activación en una clase especializada (`Enterprise_Order_Router_Activator`), aislada de la lógica de ejecución diaria.

En el archivo principal del plugin (`enterprise-order-router.php`), el registro se realiza apuntando al método estático de dicha clase:

```php
// En el archivo raíz del plugin:
require_once plugin_dir_path( __FILE__ ) . 'includes/class-plugin-activator.php';

register_activation_hook( __FILE__, [ 'Enterprise_Order_Router_Activator', 'activate' ] );

```

A continuación se detalla el desarrollo de la clase encargada de gestionar el aprovisionamiento de forma segura y estricta bajo PHP 8.1+:

```php
<?php
/**
 * Se encarga de las tareas de inicialización durante la activación del plugin.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Enterprise_Order_Router_Activator {

    /**
     * Método principal invocado por el hook de activación.
     *
     * @return void
     */
    public static function activate(): void {
        self::validate_environment();
        self::set_default_options();
        self::initialize_custom_structures();
        
        // Indicamos al sistema que se requiere regenerar los enlaces permanentes
        set_transient( 'enterprise_order_router_flush_rewrite', 1, 30 );
    }

    /**
     * Valida de manera estricta los requisitos mínimos del servidor.
     * Si falla, aborta la ejecución impidiendo que el plugin se active.
     */
    private static function validate_environment(): void {
        // Validación de versión de PHP
        if ( version_compare( PHP_VERSION, '8.1.0', '<' ) ) {
            wp_die(
                esc_html__( 'Este plugin requiere PHP 8.1 o superior para funcionar. Modifique la configuración de su servidor.', 'enterprise-order-router' ),
                esc_html__( 'Error de activación del plugin', 'enterprise-order-router' ),
                [ 'back_link' => true ]
            );
        }

        // Validación de extensiones requeridas de PHP (ejemplo: cURL)
        if ( ! function_exists( 'curl_init' ) ) {
            wp_die(
                esc_html__( 'La extensión cURL de PHP es obligatoria para este plugin.', 'enterprise-order-router' ),
                esc_html__( 'Dependencia ausente', 'enterprise-order-router' ),
                [ 'back_link' => true ]
            );
        }
    }

    /**
     * Establece los valores de configuración por defecto si no existen previamente.
     * Utiliza la Options API de manera no destructiva.
     */
    private static function set_default_options(): void {
        $default_settings = [
            'api_endpoint'     => 'https://api.logistica-externa.com/v1',
            'max_retry_clicks' => 3,
            'sync_frequency'   => 'hourly',
            'version'          => '1.0.0',
        ];

        if ( ! get_option( 'enterprise_order_router_settings' ) ) {
            add_option( 'enterprise_order_router_settings', $default_settings, '', 'no' );
        }
    }

    /**
     * Ejecuta rutinas para registrar estructuras que persisten en la base de datos.
     */
    private static function initialize_custom_structures(): void {
        // Nota: La creación de tablas SQL mediante dbDelta se detallará en el Capítulo 5.
        // Aquí se pueden declarar llamadas preliminares o inicializaciones de taxonomías.
    }
}

```

### El peligro del "Flush" indiscriminado de Rewrite Rules

Cuando un plugin introduce Custom Post Types (CPTs) o estructuras de enrutamiento personalizadas (como se verá en la Parte 2), las reglas de reescritura de URLs de WordPress (*rewrite rules*) deben actualizarse para que el servidor web (`Apache` o `Nginx`) reconozca los nuevos endpoints y no devuelva un error 404.

La función encargada de esta actualización es `flush_rewrite_rules()`. Sin embargo, invocar esta función es una operación computacionalmente muy costosa: requiere reconstruir la matriz de rutas completa, evaluar estructuras de enlaces permanentes y escribir físicamente en el archivo `.htaccess` o actualizar opciones de la base de datos.

**Regla de oro de rendimiento:** Nunca ejecutes `flush_rewrite_rules()` directamente en el flujo normal de carga del plugin (como en el hook `init`). Debe ejecutarse exclusivamente de forma diferida.

#### Patrón seguro de actualización de rutas (Deferred Flush)

Dado que los CPTs se registran formalmente durante el hook `init` (el cual ocurre *después* de que el script de activación ha finalizado su ejecución), si llamas a `flush_rewrite_rules()` directamente dentro del método `activate()`, WordPress limpiará las reglas pero no incluirá tu nuevo CPT porque este aún no ha sido registrado en memoria.

Para resolver este desfase temporal de forma elegante, se utiliza el patrón de transitorios (*transients*) implementado en la clase anterior:

```php
// En la clase principal de administración u orquestación de Hooks (ej. admin/class-plugin-admin.php)
public function __construct( Enterprise_Order_Router_Loader $loader ) {
    $this->loader = $loader;
    
    // Enganchamos la verificación en 'init', con prioridad tardía
    $this->loader->add_action( 'init', $this, 'conditional_rewrite_flush', 99 );
}

/**
 * Verifica si el plugin se acaba de activar y ejecuta el flush de forma segura.
 */
public function conditional_rewrite_flush(): void {
    if ( get_transient( 'enterprise_order_router_flush_rewrite' ) ) {
        // Pasamos el argumento 'false' para no forzar la regeneración dura del .htaccess si no es estrictamente necesario
        flush_rewrite_rules( false );
        
        // Consumimos el transitorio para asegurar que esto ocurra una sola vez
        delete_transient( 'enterprise_order_router_flush_rewrite' );
    }
}

```

Este enfoque garantiza que el entorno se actualice solo una vez, manteniendo la integridad del rendimiento del servidor y asegurando que las nuevas estructuras de URLs del plugin sean reconocidas inmediatamente por el núcleo de WordPress sin lanzar excepciones.

## 2.4 Rutinas de desactivación y limpieza

Una arquitectura de software responsable exige que un plugin deje el ecosistema de WordPress en el mismo estado en el que lo encontró al ser retirado. En el desarrollo de plugins, existe una distinción crítica y a menudo malentendida entre **desactivar** un plugin y **desinstalarlo** (o borrarlo).

Para ilustrar esta separación de responsabilidades, el flujo de vida final de un plugin se estructura de la siguiente manera:

```text
=======================================================================
               CICLO DE FINALIZACIÓN Y LIMPIEZA
=======================================================================
                        [Acción del Usuario]
                                 │
         ┌───────────────────────┴───────────────────────┐
         ▼                                               ▼
   [Desactivar]                                      [Borrar]
         │                                               │
 [register_deactivation_hook]                     [uninstall.php]
         │                                               │
   - Pausar eventos (Cron)                         - Eliminar Opciones (Options API)
   - Limpiar caché propia                          - Borrar Transitorios
   - Flush Rewrite Rules (Limpiar rutas)           - Dropear tablas SQL personalizadas
   - CONSERVAR DATOS Y OPCIONES                    - Eliminar CPTs y Metadatos
         │                                               │
         ▼                                               ▼
 [El plugin queda inactivo]                      [TABULA RASA: Sistema limpio]

```

### La rutina de desactivación: Pausa temporal

La desactivación ocurre cuando el administrador suspende el plugin pero mantiene los archivos en el servidor. La premisa fundamental aquí es **no destruir datos**. Si el usuario reactiva el plugin horas después, su configuración, registros y pedidos deben seguir intactos.

Para registrar esta rutina, se utiliza `register_deactivation_hook()` en el archivo principal (`enterprise-order-router.php`), apuntando a una clase especializada:

```php
require_once plugin_dir_path( __FILE__ ) . 'includes/class-plugin-deactivator.php';

register_deactivation_hook( __FILE__, [ 'Enterprise_Order_Router_Deactivator', 'deactivate' ] );

```

El objetivo de la clase `Deactivator` es detener procesos en segundo plano y limpiar estructuras temporales.

```php
<?php
/**
 * Se encarga de las tareas de limpieza temporal durante la desactivación.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Enterprise_Order_Router_Deactivator {

    /**
     * Método principal invocado por el hook de desactivación.
     */
    public static function deactivate(): void {
        self::clear_scheduled_events();
        self::flush_rewrite_rules();
    }

    /**
     * Elimina las tareas programadas (WP-Cron) pertenecientes al plugin.
     */
    private static function clear_scheduled_events(): void {
        $hook_name = 'enterprise_order_router_sync_event';
        
        // Obtenemos la marca de tiempo del próximo evento programado
        $timestamp = wp_next_scheduled( $hook_name );
        
        if ( $timestamp ) {
            wp_unschedule_event( $timestamp, $hook_name );
        }
    }

    /**
     * Limpia las reglas de reescritura.
     * A diferencia de la activación, aquí SÍ podemos y debemos hacer flush directamente,
     * ya que al recargar la página el código del plugin ya no estará disponible.
     */
    private static function flush_rewrite_rules(): void {
        flush_rewrite_rules( false );
    }
}

```

### La rutina de desinstalación: Tabula Rasa

La desinstalación ocurre cuando el usuario hace clic en "Borrar" desde el panel de plugins. Este es el momento de aplicar el principio de *Tabula Rasa*: el plugin debe eliminar absolutamente todo rastro de su existencia en la base de datos. No hacerlo genera la temida "basura de base de datos" (*database bloat*), que degrada el rendimiento del sitio a largo plazo y puede comprometer el cumplimiento de normativas de privacidad (como el RGPD).

#### Por qué usar `uninstall.php` y no un Hook

Aunque WordPress ofrece la función `register_uninstall_hook()`, el estándar de la industria y la convención oficial recomiendan encarecidamente utilizar un archivo llamado `uninstall.php` ubicado en la raíz del plugin.

¿La razón? `uninstall.php` se ejecuta en un proceso aislado y evita cargar todo el código de tu plugin. Además, previene problemas de referencias a objetos o dependencias que podrían fallar durante la eliminación.

#### Implementación segura de `uninstall.php`

El archivo `uninstall.php` debe ser blindado. Si un atacante logra acceder a este archivo directamente, podría desencadenar un borrado masivo de la base de datos. La protección se logra verificando la constante `WP_UNINSTALL_PLUGIN`, que WordPress solo define de forma interna durante el proceso legítimo de borrado.

A continuación, la estructura de un archivo de desinstalación exhaustivo:

```php
<?php
/**
 * Fichero de desinstalación. 
 * Se ejecuta automáticamente al borrar el plugin desde el administrador.
 */

// 1. Clausura de seguridad crítica
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
    header( 'HTTP/1.0 403 Forbidden' );
    exit( 'Acceso directo denegado.' );
}

/**
 * 2. Purga de opciones globales
 */
delete_option( 'enterprise_order_router_settings' );
delete_option( 'enterprise_order_router_db_version' );

// Eliminación para entornos Multisite (si aplica)
if ( is_multisite() ) {
    delete_site_option( 'enterprise_order_router_network_settings' );
}

/**
 * 3. Purga de Custom Post Types y Metadatos asociados
 * Se utiliza $wpdb para borrar de forma masiva y eficiente, en lugar de 
 * iterar con wp_delete_post() si el volumen de datos es industrial.
 */
global $wpdb;

// Eliminar metadatos asociados a los posts de tipo 'orders'
$wpdb->query( "
    DELETE pm FROM {$wpdb->postmeta} pm
    LEFT JOIN {$wpdb->posts} wp ON wp.ID = pm.post_id
    WHERE wp.post_type = 'orders'
" );

// Eliminar los posts y revisiones del tipo 'orders'
$wpdb->query( "
    DELETE FROM {$wpdb->posts}
    WHERE post_type = 'orders'
" );

/**
 * 4. Eliminación de Tablas Personalizadas (Si el plugin creó esquemas propios)
 */
$table_logs = $wpdb->prefix . 'enterprise_router_logs';
$wpdb->query( "DROP TABLE IF EXISTS {$table_logs}" );

/**
 * 5. Purga de Transitorios en Base de Datos
 * Elimina cualquier caché persistente (Transients API) que el plugin haya generado
 */
$wpdb->query( "
    DELETE FROM {$wpdb->options} 
    WHERE option_name LIKE '_transient_enterprise_order_%' 
    OR option_name LIKE '_transient_timeout_enterprise_order_%'
" );

```

La inclusión de rutinas de desinstalación profundas no solo es una buena práctica de ingeniería de software, sino que es un requisito explícito si planeas publicar tu código en el repositorio oficial de WordPress (como se abordará en el Capítulo 16) o si desarrollas para clientes corporativos con auditorías de código estrictas.

## 2.5 Estándares de código en WordPress

El ecosistema de WordPress es uno de los proyectos de código abierto más grandes del mundo, con miles de contribuidores y un mercado de plugins inmenso. Para mantener la coherencia, legibilidad y facilidad de mantenimiento en esta escala, la comunidad ha establecido los **WordPress Coding Standards (WPCS)**.

Si vienes de otros frameworks o ecosistemas PHP modernos, notarás que WordPress diverge significativamente de los estándares PSR (como PSR-12 o PER Coding Style). En el desarrollo profesional de plugins, ignorar estas convenciones es una señal de código *amateur* y garantizará el rechazo si intentas publicar en el repositorio oficial o realizar una auditoría de código corporativa.

### Diferencias clave con los estándares modernos (PSR)

Mientras que el mundo de PHP estandarizó los espacios y el formato *CamelCase*, WordPress mantiene su propia herencia estilística. Estas son las reglas inquebrantables del WPCS:

#### 1. Indentación y espaciado (Tabs, no espacios)

WordPress utiliza **tabulaciones reales** para la indentación de bloques de código, no espacios. Los espacios solo se utilizan para la alineación horizontal dentro de una misma línea (mid-line alignment). Además, WPCS exige un espaciado "generoso" dentro de paréntesis, corchetes y definiciones de arrays.

```php
// ❌ INCORECTO (Estilo PSR / Moderno)
function procesar_datos($id, $datos=[]) {
    if($id === 12) {
        return ['status'=>'ok'];
    }
}

// ✅ CORRECTO (Estilo WordPress)
function procesar_datos( $id, $datos = [] ) {
    if ( 12 === $id ) {
        return [ 'status' => 'ok' ];
    }
}

```

#### 2. Convenciones de nomenclatura (Snake Case)

Las variables, funciones y nombres de métodos deben estar completamente en minúsculas y separar las palabras con guiones bajos (*snake_case*). Las clases deben usar palabras capitalizadas separadas por guiones bajos (*Upper_Snake_Case*).

```php
// ❌ INCORRECTO
class orderRouter {
    public function calculateTotal( $orderItems ) { ... }
}

// ✅ CORRECTO
class Order_Router {
    public function calculate_total( $order_items ) { ... }
}

```

#### 3. Condiciones Yoda (Yoda Conditions)

Una de las reglas más polémicas pero obligatorias en el núcleo de WordPress. En las comparaciones lógicas, la constante, el literal o la variable inmutable debe colocarse siempre a la izquierda de la condición.

El propósito de esto es evitar errores fatales silenciosos por una asignación accidental (escribir `=` en lugar de `==`). Si intentas asignar un valor a un número entero o booleano, PHP lanzará un error de sintaxis de inmediato, salvándote en tiempo de desarrollo.

```php
// ❌ INCORRECTO (Propenso a errores si omites un '=': $user_id = 1)
if ( $user_id === 1 ) {
    // ...
}

if ( $estado == 'completado' ) {
    // ...
}

// ✅ CORRECTO (Condición Yoda)
if ( 1 === $user_id ) {
    // ...
}

if ( 'completado' === $estado ) {
    // ...
}

```

### Documentación y Bloques de Comentarios (PHPDoc)

El código no está completo si no está documentado según los estándares de documentación en línea de WordPress. Cada clase, propiedad, función y método debe ir precedido por un bloque de comentarios formateado (*DocBlock*).

Esto no solo ayuda a otros desarrolladores, sino que es vital para la generación automática de documentación y para que los IDEs modernos proporcionen autocompletado inteligente.

```php
/**
 * Procesa el pago de una orden y actualiza su estado.
 *
 * Esta función se encarga de conectar con la pasarela de pago configurada,
 * deducir el importe y realizar el cambio de estado en la base de datos.
 *
 * @since 1.0.0
 *
 * @param int   $order_id El ID del post (CPT) de la orden.
 * @param float $amount   El monto total a procesar.
 * @return bool           True en caso de éxito, false en caso de fallo en la transacción.
 */
public function process_order_payment( int $order_id, float $amount ): bool {
    // Lógica del método...
}

```

Es crucial notar el uso de etiquetas estandarizadas como `@since` (para indicar en qué versión se introdujo la función), `@param` (listando tipo, nombre y descripción alineados horizontalmente) y `@return`.

### Automatización: PHP_CodeSniffer

Memorizar todas las reglas del WPCS es ineficiente. El estándar de la industria es automatizar esta validación integrando **PHP_CodeSniffer (PHPCS)** en tu entorno de desarrollo local y en tus procesos de Integración Continua (CI).

Para implementar esto en tu proyecto mediante Composer, instalarías el paquete de reglas oficiales:

```bash
composer require --dev squizlabs/php_codesniffer wp-coding-standards/wpcs

```

Un archivo de configuración `phpcs.xml.dist` en la raíz de tu plugin instruirá al *linter* sobre qué reglas aplicar. Las configuraciones más comunes incluyen:

* `WordPress-Core`: Verifica las reglas de formato, espaciado y estructura.
* `WordPress-Docs`: Exige y valida el formato de los DocBlocks.
* `WordPress-Extra`: Sugiere mejores prácticas y patrones de codificación.

Al ejecutar `vendor/bin/phpcs` en tu terminal, recibirás un informe detallado de las violaciones de formato. Muchas de ellas (como el espaciado o la alineación) pueden ser corregidas automáticamente ejecutando `vendor/bin/phpcbf` (PHP Code Beautifier and Fixer).

### Armonizando WPCS con PHP moderno (8.1+)

Dado que este libro asume un desarrollo moderno (PHP 8.1+), existe una ligera fricción entre el código *legacy* que WordPress soporta y las características avanzadas de PHP. El estándar actual en el desarrollo empresarial de plugins es **respetar el formato WPCS (snake_case, tabs, Yoda), pero abrazar el tipado estricto de PHP**.

```php
<?php declare( strict_types=1 );

// Aplicamos formato de WPCS...
class Enterprise_Data_Mapper {

    // ...pero con propiedades tipadas, union types y return types de PHP 8.1+
    private int $max_retries;

    public function __construct( int $max_retries = 3 ) {
        $this->max_retries = $max_retries;
    }

    public function fetch_data( string|int $identifier ): array|false {
        // ...
    }
}

```

Esta combinación garantiza un código que se ve y se lee como código nativo de WordPress, pero que se ejecuta con la seguridad y la robustez del tipado estricto de la ingeniería de software contemporánea.

## Resumen del capítulo

* **Cabeceras y Estructura:** El punto de entrada de un plugin es un bloque de comentarios estandarizado. Una arquitectura profesional requiere separar el código en directorios lógicos (`admin`, `public`, `includes`) y bloquear el acceso directo mediante la comprobación de la constante `ABSPATH`.
* **Hooks (Actions y Filters):** Son la columna vertebral de la extensibilidad en WordPress. Las *Acciones* (`add_action`) permiten inyectar lógica secundaria sin retornar datos. Los *Filtros* (`add_filter`) permiten interceptar variables y mutarlas, y siempre requieren retornar el dato modificado.
* **Activación:** La función `register_activation_hook` debe usarse para preparar el entorno (validar dependencias, configurar opciones iniciales, estructurar bases de datos). Las rutas (`flush_rewrite_rules`) deben purgarse de manera diferida, no directamente.
* **Desactivación y Limpieza:** La desactivación suspende procesos (como el WP-Cron) pero mantiene los datos. La desinstalación, ejecutada mediante un archivo ciego `uninstall.php`, debe aplicar una política estricta de *Tabula Rasa*, limpiando tablas, opciones, opciones de red y metadatos para evitar basura en la base de datos.
* **Estándares de Código:** WordPress utiliza sus propias reglas (WPCS), divergentes de los estándares PSR. Es obligatorio usar *snake_case*, tabulaciones para indentar y *Condiciones Yoda* para asignaciones seguras. Todo el proceso debe ser auditado automáticamente utilizando *PHP_CodeSniffer*.
