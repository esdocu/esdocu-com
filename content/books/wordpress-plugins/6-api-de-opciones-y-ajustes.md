En el desarrollo de plugins, es vital ofrecer un panel de control para que los usuarios personalicen su experiencia. Este capítulo aborda la persistencia de datos globales y la creación de interfaces de configuración nativas.

Exploraremos cómo la Options API permite almacenar preferencias en la tabla `wp_options` de forma eficiente. Luego, profundizaremos en la Settings API, que abstrae la complejidad del renderizado de formularios, validando datos y gestionando la seguridad automáticamente. Al finalizar, serás capaz de construir paneles de ajustes profesionales y seguros, perfectamente integrados al ecosistema de WordPress.

## 6.1 Uso de add_option y get_option

La API de Opciones (Options API) es el mecanismo estándar de WordPress para almacenar datos globales de un plugin o tema que no están vinculados a un tipo de contenido específico (como posts, usuarios o términos, que ya cubrimos en la API de Metadatos). Estos ajustes globales se almacenan de forma persistente en la tabla `wp_options` de la base de datos.

A diferencia de la creación de tablas personalizadas (Capítulo 5), la API de Opciones maneja automáticamente la serialización de datos complejos (como arrays u objetos PHP) y se integra estrechamente con el sistema de caché de objetos (Object Cache) nativo de WordPress.

### La tabla wp_options

Para comprender cómo funcionan estas funciones, es útil visualizar la estructura simplificada de la tabla subyacente:

```text
+-----------+--------------------+-------------------------+----------+
| option_id | option_name        | option_value            | autoload |
+-----------+--------------------+-------------------------+----------+
| 1         | siteurl            | https://ejemplo.com     | yes      |
| 2         | mi_plugin_version  | 1.0.3                   | yes      |
| 3         | mi_plugin_ajustes  | a:2:{s:5:"color"...     | no       |
+-----------+--------------------+-------------------------+----------+

```

El campo clave aquí es `autoload`. Si está configurado en `yes`, WordPress cargará esta opción en la memoria durante la inicialización del núcleo, en una sola consulta SQL agrupada. Esto es vital para el rendimiento: las opciones que se necesitan en cada carga de página deben tener `autoload` habilitado, mientras que los datos pesados o de uso esporádico deben establecerse en `no`.

### Guardando datos: add_option() y update_option()

La función `add_option()` permite registrar una nueva configuración en la base de datos. Si la opción ya existe, la función retornará `false` y no sobreescribirá el valor existente.

**Sintaxis:**

```php
add_option( string $option, mixed $value = '', string $deprecated = '', string|bool $autoload = 'yes' )

```

* `$option`: Nombre único de la opción (se recomienda usar un prefijo de tu plugin, ej: `miplugin_api_key`).
* `$value`: El valor a guardar. Puede ser un string, entero, array u objeto.
* `$deprecated`: Parámetro obsoleto, siempre se debe pasar una cadena vacía `''`.
* `$autoload`: Define si se carga automáticamente (`'yes'` o `true`) o no (`'no'` o `false`).

**Ejemplo de uso:**

```php
// Guardar un valor simple
add_option( 'miplugin_activacion_fecha', current_time( 'mysql' ), '', 'yes' );

// Guardar un array (WordPress lo serializa automáticamente)
$configuracion_inicial = array(
    'modo_oscuro' => true,
    'limite_items' => 10,
    'email_admin'  => 'admin@ejemplo.com'
);
add_option( 'miplugin_configuracion', $configuracion_inicial, '', 'no' );

```

En la práctica diaria del desarrollo de plugins, utilizarás `update_option()` con mayor frecuencia que `add_option()`.

La función `update_option()` verifica primero si la opción existe. Si no existe, actúa internamente como `add_option()`. Si existe y el nuevo valor es diferente al almacenado, lo actualiza.

```php
// Actualiza el valor; si 'miplugin_api_key' no existe, la crea.
update_option( 'miplugin_api_key', 'NUEVA_CLAVE_12345', 'no' );

```

### Recuperando datos: get_option()

Para acceder a la información almacenada, utilizamos `get_option()`. Esta función busca en la caché de memoria primero y, si no encuentra el dato, realiza una consulta a la base de datos (o la extrae del conjunto de datos precargados si tiene `autoload='yes'`).

**Sintaxis:**

```php
get_option( string $option, mixed $default_value = false )

```

* `$option`: El nombre de la opción a recuperar.
* `$default_value`: El valor que se retornará si la opción no existe en la base de datos. Esto es extremadamente útil para proveer configuraciones por defecto sin necesidad de guardarlas físicamente en la instalación.

**Ejemplo de uso:**

```php
// Recuperar un valor simple con un fallback
$api_key = get_option( 'miplugin_api_key', 'clave_por_defecto' );

// Recuperar un array (WordPress lo deserializa automáticamente)
$configuracion = get_option( 'miplugin_configuracion', array() );

if ( ! empty( $configuracion['modo_oscuro'] ) ) {
    // Aplicar estilos oscuros
}

```

### Eliminando datos: delete_option()

Para mantener una base de datos limpia, especialmente durante el proceso de desinstalación de un plugin (como vimos en el Capítulo 2), es obligatorio eliminar las opciones que ya no se necesiten mediante `delete_option()`.

```php
// Elimina la opción de la base de datos y de la caché
delete_option( 'miplugin_configuracion' );

```

### Mejores prácticas y rendimiento

1. **Agrupación en Arrays:** En lugar de crear 20 opciones distintas (`miplugin_color`, `miplugin_tamaño`, `miplugin_fuente`), almacena un único array asociativo (`miplugin_ajustes`). Esto reduce significativamente el número de registros en `wp_options` y hace que las operaciones de lectura/escritura sean más eficientes.
2. **Uso prudente de Autoload:** Un error común en plugins de baja calidad es dejar que todas sus opciones se guarden con `autoload='yes'` (el valor por defecto). Si tu plugin guarda un registro histórico grande o una caché temporal en la tabla de opciones, asegúrate de forzar `autoload='no'` mediante `update_option( 'opcion', 'valor', 'no' )`. Un exceso de datos en autoload puede saturar la memoria PHP en cada petición del sitio.
3. **Prefijos consistentes:** Siempre utiliza un prefijo único para tus opciones para evitar colisiones catastróficas con el núcleo de WordPress u otros plugins (ej. nunca uses algo genérico como `get_option('color_primario')`).

## 6.2 La Settings API al detalle

Mientras que la API de Opciones (vista en la sección anterior) nos proporciona los mecanismos básicos (CRUD) para guardar y recuperar datos de la base de datos, no nos dice nada sobre cómo construir la interfaz gráfica para que el usuario interactúe con esos datos. Aquí es donde entra en juego la **Settings API** (API de Ajustes).

Introducida en WordPress 2.7, la Settings API es una capa de abstracción construida sobre la API de Opciones. Su propósito principal es estandarizar la creación de páginas de configuración en el panel de administración, automatizando las tareas más tediosas y críticas: la renderización de formularios, la validación de datos y la seguridad.

### Comparativa: Options API vs Settings API

Para entender su valor, es fundamental comprender dónde termina una y dónde empieza la otra.

| Característica | Options API (`add_option`) | Settings API (`register_setting`) |
| --- | --- | --- |
| **Propósito** | Interacción directa con la base de datos. | Construcción de interfaces y gestión del flujo del formulario. |
| **Seguridad (Nonces)** | Manual (debes generarlos y validarlos tú). | Automática (WordPress los gestiona en segundo plano). |
| **Guardado de datos** | Manual (requiere capturar `$_POST` y sanitizar). | Automático (WordPress procesa el formulario y guarda). |
| **Gestión de errores** | Manual. | Nativa (permite añadir mensajes de `add_settings_error`). |

### Arquitectura visual de la Settings API

La API organiza la información visualmente en una estructura jerárquica estricta. Todo formulario de configuración creado con esta API se compone de tres niveles:

```text
[ Página de Ajustes ] (Ej: Ajustes de Lectura o tu propia página)
 │
 ├── [ Sección ] (Agrupación lógica, ej: "Ajustes de Visualización")
 │    │
 │    ├── [ Campo ] (Input HTML: Color primario) ---> Vinculado a una Opción
 │    └── [ Campo ] (Input HTML: Activar modo oscuro) ---> Vinculado a una Opción
 │
 └── [ Sección ] (Agrupación lógica, ej: "Ajustes de API")
      │
      └── [ Campo ] (Input HTML: Clave de API) ---> Vinculado a una Opción

```

1. **Página de Ajustes (Options Page):** El contenedor principal (la etiqueta `<form>`). Puede ser una página existente de WordPress (como *Ajustes > Generales*) o una página nueva creada por tu plugin.
2. **Secciones (Settings Sections):** Bloques temáticos dentro de la página. Permiten agrupar campos relacionados bajo un mismo subtítulo, facilitando la lectura al usuario.
3. **Campos (Settings Fields):** Los elementos interactivos individuales (cuadros de texto, menús desplegables, casillas de verificación). Cada campo está directamente enlazado a un registro de la base de datos (una opción).

### Beneficios del "Flujo Blanco" (Whitelisting)

El mayor aporte de la Settings API a la seguridad de un plugin es su sistema de "lista blanca".

Cuando construyes un formulario HTML estándar y lo envías, debes escribir código para interceptar ese envío, verificar qué campos llegaron, comprobar su validez y luego usar `update_option()` para cada uno.

Con la Settings API, utilizas la función `register_setting()` para decirle a WordPress: *"Voy a utilizar una opción llamada `miplugin_opciones`. Por favor, hazte cargo de ella"*.

A partir de ese momento, WordPress incluye tu opción en una lista blanca. Cuando el formulario se envía hacia el archivo interno `options.php` de WordPress, el núcleo verifica si los datos entrantes pertenecen a una opción registrada. Si es así, verifica los *nonces* de seguridad, aplica las funciones de sanitización que hayas definido y guarda los datos en la base de datos automáticamente, redirigiendo al usuario de vuelta con un mensaje de "Ajustes guardados".

Esta delegación de responsabilidades es lo que hace que la Settings API sea el estándar indiscutible para el desarrollo de interfaces de configuración en WordPress, permitiéndote concentrarte en la lógica de negocio y el diseño, en lugar de en la plomería del protocolo HTTP y la seguridad de los formularios.

## 6.3 Registro de secciones y campos

Para implementar la arquitectura visual y de seguridad que discutimos en la sección anterior, WordPress proporciona tres funciones principales. Estas funciones deben ejecutarse siempre dentro del hook `admin_init`, ya que los ajustes solo necesitan registrarse cuando un usuario accede al panel de administración o cuando se envía un formulario a `options.php`.

Las tres funciones trabajan en conjunto para tejer la red entre tu base de datos y tu interfaz:

1. **`register_setting()`:** Autoriza (añade a la lista blanca) el nombre de la opción en la base de datos y define cómo debe validarse.
2. **`add_settings_section()`:** Crea un bloque agrupador visual en la página.
3. **`add_settings_field()`:** Registra un campo de formulario individual y lo asigna a una sección específica.

### 1. Autorización de la opción: register_setting()

Antes de pintar nada en pantalla, debes decirle a WordPress qué opción vas a guardar. Si omites este paso, al enviar tu formulario recibirás un error de permisos.

```php
register_setting( 
    string $option_group, 
    string $option_name, 
    array $args = array() 
)

```

* **`$option_group`:** Un identificador interno para el grupo de opciones. Lo usarás más adelante en la función `settings_fields()` al construir el formulario (Capítulo 6.4).
* **`$option_name`:** El nombre exacto de la opción que se guardará en la tabla `wp_options` (el mismo que usarías en `get_option()`).
* **`$args`:** Un array de argumentos. El más importante aquí es `sanitize_callback`, donde pasas el nombre de la función que limpiará los datos antes de guardarlos.

### 2. Creación de secciones: add_settings_section()

Las secciones actúan como contenedores lógicos para tus campos. Una página de ajustes puede tener múltiples secciones.

```php
add_settings_section( 
    string $id, 
    string $title, 
    callable $callback, 
    string $page 
)

```

* **`$id`:** El identificador único de la sección (HTML `id`).
* **`$title`:** El título (HTML `<h2>` o `<h3>`) que se mostrará sobre los campos.
* **`$callback`:** Función que imprime contenido descriptivo justo debajo del título y antes de los campos. Si no necesitas descripción, puedes pasar `__return_empty_string`.
* **`$page`:** El slug de la página de ajustes donde debe aparecer esta sección.

### 3. Creación de campos: add_settings_field()

Esta función enlaza un elemento de la interfaz (como un `<input>`) con la sección y la página correspondientes.

```php
add_settings_field( 
    string $id, 
    string $title, 
    callable $callback, 
    string $page, 
    string $section = 'default', 
    array $args = array() 
)

```

* **`$id`:** El atributo `id` del campo.
* **`$title`:** La etiqueta (HTML `<label>`) que aparecerá a la izquierda del campo.
* **`$callback`:** La función encargada de hacer el `echo` del HTML del campo de formulario (el `<input>`, `<select>`, etc.).
* **`$page`:** El slug de la página (debe coincidir con el de la sección).
* **`$section`:** El ID de la sección (`$id` de `add_settings_section`) a la que pertenece este campo.
* **`$args`:** Argumentos extra que se pasarán a la función `$callback`. Es ideal para pasar el atributo `name` o clases CSS personalizadas.

### El flujo de conexiones (El Pegamento)

El mayor desafío al aprender la Settings API es entender cómo estas funciones se relacionan mediante strings (identificadores). Observa este diagrama de relaciones:

```text
[ Base de Datos ]                   [ Interfaz / Renderizado ]
      |                                        |
register_setting( 'grupo_A', 'opcion_X' )      |
                                               |
                          add_settings_section( 'seccion_1', ..., 'mi_pagina' )
                                                      ^                ^
                                                      |                |
                          add_settings_field( ..., 'mi_pagina', 'seccion_1' )

```

El campo busca la sección (`seccion_1`) y la página (`mi_pagina`) para saber dónde dibujarse. Más tarde, el formulario completo utilizará el `grupo_A` para saber a qué `opcion_X` enviar los datos.

### Ejemplo de implementación completa

A continuación, uniendo todo dentro del hook `admin_init`:

```php
/**
 * Inicializa y registra todos los ajustes de nuestro plugin
 */
function miplugin_registrar_ajustes() {
    
    // 1. Registrar la opción (Lista blanca)
    register_setting(
        'miplugin_opciones_grupo',      // Grupo de opciones
        'miplugin_configuracion',       // Nombre en wp_options
        array(
            'sanitize_callback' => 'miplugin_sanitizar_datos',
            'default'           => array( 'api_key' => '' )
        )
    );

    // 2. Registrar la Sección
    add_settings_section(
        'miplugin_seccion_api',         // ID de la sección
        'Ajustes de Conexión API',      // Título visible
        'miplugin_seccion_api_cb',      // Callback de descripción
        'miplugin_pagina_ajustes'       // Slug de la página contenedora
    );

    // 3. Registrar el Campo
    add_settings_field(
        'miplugin_campo_apikey',        // ID del campo
        'Clave de API',                 // Etiqueta del campo (<label>)
        'miplugin_renderizar_apikey',   // Callback que pinta el <input>
        'miplugin_pagina_ajustes',      // Slug de la página contenedora
        'miplugin_seccion_api'          // ID de la sección a la que pertenece
    );
}
add_action( 'admin_init', 'miplugin_registrar_ajustes' );

/**
 * Callbacks de renderizado (Las "vistas")
 */

// Descripción de la sección
function miplugin_seccion_api_cb() {
    echo '<p>Ingresa tus credenciales para conectar con el servicio externo.</p>';
}

// Renderizado del input
function miplugin_renderizar_apikey() {
    // Obtenemos los valores actuales de la base de datos
    $opciones = get_option( 'miplugin_configuracion' );
    $api_key  = isset( $opciones['api_key'] ) ? esc_attr( $opciones['api_key'] ) : '';
    
    // Nota que el atributo 'name' debe ser exacto: nombre_opcion[clave_array]
    echo '<input type="text" id="miplugin_campo_apikey" name="miplugin_configuracion[api_key]" value="' . $api_key . '" class="regular-text" />';
}

/**
 * Función de sanitización (Seguridad)
 */
function miplugin_sanitizar_datos( $input ) {
    $sanitizado = array();
    
    if ( isset( $input['api_key'] ) ) {
        $sanitizado['api_key'] = sanitize_text_field( $input['api_key'] );
    }
    
    return $sanitizado;
}

```

Es crucial notar cómo se construye el atributo `name` en la función de renderizado: `name="miplugin_configuracion[api_key]"`. Como estamos guardando nuestros ajustes en un array bajo una única opción (una mejor práctica vista en 6.1), el atributo `name` de HTML debe reflejar esa estructura de array para que WordPress lo serialice correctamente al procesar la petición.

## 6.4 Renderizado de formularios

Una vez que hemos definido nuestra opción, secciones y campos en el *backend* mediante el hook `admin_init` (como vimos en la sección 6.3), el último paso es construir la interfaz gráfica. Necesitamos imprimir el formulario HTML en la página de administración de nuestro plugin.

La belleza de la Settings API es que reduce el renderizado de un formulario complejo a unas pocas líneas de código, manejando internamente los bucles y la inyección de medidas de seguridad.

### La anatomía de la vista

La función *callback* responsable de mostrar tu página de ajustes (la que definiste al usar funciones como `add_menu_page` o `add_options_page` que veremos en el Capítulo 7) debe contener una estructura HTML muy específica para que la Settings API funcione correctamente.

El flujo básico requiere cuatro elementos esenciales:

1. **El contenedor global:** La clase `<div class="wrap">` estándar de WordPress.
2. **La etiqueta form:** Debe apuntar estrictamente al archivo interno `options.php`.
3. **Seguridad y referencias:** La función `settings_fields()`.
4. **Renderizado de secciones:** La función `do_settings_sections()`.
5. **El botón de envío:** La función `submit_button()`.

### Implementación del formulario

A continuación, se muestra cómo se construye la vista de la página, asumiendo que estamos utilizando los mismos identificadores registrados en el ejemplo de la lección anterior:

```php
/**
 * Renderiza la página de configuración del plugin en el panel de control.
 */
function miplugin_renderizar_pagina_ajustes() {
    
    // Verificación de seguridad básica (opcional pero recomendada)
    if ( ! current_user_can( 'manage_options' ) ) {
        return;
    }

    // WordPress maneja automáticamente los mensajes de éxito/error aquí
    settings_errors( 'miplugin_mensajes' );
    ?>
    
    <div class="wrap">
        <h1><?php echo esc_html( get_admin_page_title() ); ?></h1>
        
        <form action="options.php" method="post">
            
            <?php
            // 1. Imprime los campos ocultos de seguridad (Nonces) y la referencia al grupo
            // Debe coincidir EXACTAMENTE con el $option_group de register_setting()
            settings_fields( 'miplugin_opciones_grupo' );
            
            // 2. Imprime todas las secciones y campos registrados para esta página
            // Debe coincidir EXACTAMENTE con el $page de add_settings_section/field()
            do_settings_sections( 'miplugin_pagina_ajustes' );
            
            // 3. Imprime el botón de "Guardar cambios"
            submit_button( 'Guardar Configuración' );
            ?>
            
        </form>
    </div>
    
    <?php
}

```

### Comprendiendo las funciones de renderizado

* **`settings_errors()`:** Cuando el formulario se envía a `options.php`, WordPress procesa los datos, actualiza la base de datos y redirige de vuelta a tu página. En esa redirección, adjunta variables en la URL indicando si hubo éxito o fallos. Esta función intercepta esas variables e imprime las notificaciones nativas de WordPress (las clásicas cajas verdes o rojas en la parte superior).
* **`<form action="options.php">`:** Este es el motor del proceso. `options.php` es el archivo del núcleo de WordPress diseñado exclusivamente para recibir peticiones POST de la Settings API. Si cambias la acción a otra ruta, perderás toda la automatización y seguridad.
* **`settings_fields( $grupo )`:** Esta función no imprime datos visibles. Inyecta varios `<input type="hidden">` cruciales:
* `option_page`: Le dice a `options.php` qué grupo de opciones estás intentando guardar.
* `action`: Define la acción interna (`update`).
* `_wpnonce`: Inyecta el token de seguridad CSRF generado dinámicamente para proteger el formulario.

* **`do_settings_sections( $pagina )`:** Aquí es donde ocurre la magia visual. WordPress busca en memoria todas las secciones registradas para el *slug* `$pagina`. Para cada sección, imprime su título, ejecuta su callback de descripción, abre una tabla HTML (`<table class="form-table">`) e itera sobre todos los campos asociados a esa sección, ejecutando los callbacks individuales que construimos para renderizar los `<input>`.

Con esta estructura, hemos completado el ciclo. Los datos fluyen desde la vista del usuario (el formulario renderizado), hacia el procesador nativo (`options.php`), atraviesan el filtro de seguridad y sanitización (`register_setting`), y terminan persistidos de forma segura en la base de datos listos para ser consumidos mediante `get_option()`.

## Resumen del capítulo

En este capítulo hemos explorado a fondo la gestión de datos globales y la creación de interfaces de configuración, un pilar fundamental en la arquitectura de cualquier plugin robusto:

1. **La base de datos y la Options API:** Comprendimos el rol de la tabla `wp_options` y cómo funciones como `update_option()` y `get_option()` permiten guardar y recuperar datos independientemente del contenido. Destacamos la importancia del campo `autoload` para el rendimiento global del sitio y la buena práctica de agrupar ajustes en un único array serializado.
2. **Transición a la Settings API:** Vimos cómo la API de Ajustes añade una capa de abstracción sobre las operaciones de base de datos, asumiendo la responsabilidad de la renderización del formulario, la gestión del flujo POST, la validación de *nonces* y el enrutamiento de errores a través de un sistema seguro de lista blanca.
3. **Arquitectura de datos visuales:** Aprendimos el proceso en tres pasos mediante el hook `admin_init`: validar la entrada con `register_setting()`, estructurar visualmente con `add_settings_section()`, y vincular elementos interactivos con `add_settings_field()`.
4. **Integración de la interfaz:** Finalmente, conectamos nuestro código de registro con la interfaz visual, delegando el procesamiento del formulario a `options.php` y renderizando los componentes de manera estandarizada utilizando `settings_fields()` y `do_settings_sections()`. Esto garantiza que los paneles de administración de tu plugin mantengan la consistencia visual y los estándares de seguridad exigidos por el ecosistema de WordPress.
