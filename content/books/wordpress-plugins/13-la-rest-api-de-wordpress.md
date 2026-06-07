La REST API transformó a WordPress de un gestor tradicional a un potente *headless* CMS. En este capítulo, aprenderás a conectar tu plugin con aplicaciones externas mediante una arquitectura estandarizada basada en JSON. Exploraremos los conceptos clave y la práctica avanzada: descubrirás cómo registrar rutas y endpoints personalizados, estructurar callbacks eficientes, delegar la validación de argumentos de forma nativa y establecer estrictos controles de acceso y permisos. Al finalizar, serás capaz de construir interfaces de comunicación seguras, escalables y robustas que expandan los límites de tu desarrollo.

## 13.1 Conceptos clave de la REST API

La REST API de WordPress transformó el CMS de una plataforma tradicional de renderizado de páginas a un robusto framework de aplicaciones. A diferencia de `admin-ajax.php` (que exploramos en el Capítulo 9) que fue diseñado principalmente para comunicaciones internas del panel de administración o scripts específicos del front-end, la REST API proporciona una interfaz estandarizada, basada en JSON y orientada a recursos. Esto permite que cualquier aplicación externa —ya sea una SPA (Single Page Application) en React, una aplicación móvil nativa o un script de sincronización en Node.js— interactúe bidireccionalmente con la base de datos de WordPress.

Para dominar el desarrollo de integraciones con la REST API, es imprescindible comprender la terminología y la arquitectura conceptual sobre la que se asienta su infraestructura.

### Arquitectura Conceptual de la REST API

La comunicación a través de la REST API es *stateless* (sin estado), lo que significa que cada petición debe contener toda la información necesaria para que el servidor la procese, incluyendo las credenciales de autenticación.

A continuación, se ilustra el flujo de una petición típica:

```text
[Cliente Externo / Frontend (JS, App Móvil, Servidor 3ro)]
        │                                         ▲
        │ 1. Petición HTTP                        │ 6. Respuesta JSON
        │    (GET, POST, PUT, DELETE)             │    (WP_REST_Response)
        ▼                                         │
┌─────────────────────────────────────────────────────────┐
│                    Infraestructura WP                   │
│                                                         │
│  [Enrutador REST (WP_REST_Server)]                      │
│        │                                                │
│        │ 2. Coincidencia de Ruta / Namespace            │
│        ▼                                                │
│  [Ruta (Route) ej: /mi-plugin/v1/datos]                 │
│        │                                                │
│        │ 3. Identificación del Método                   │
│        ▼                                                │
│  [Endpoint específico] ────────────┐                    │
│        │                           │ 4. Verificación    │
│        │ 5. Ejecución              ▼                    │
│        ▼                 [Callback de Permisos]         │
│  [Callback Principal]      (permission_callback)        │
│        │                                                │
│        │ (Interacción con WP Core, CPTs, $wpdb)         │
└────────┼────────────────────────────────────────────────┘
         ▼
[Base de Datos]

```

### Vocabulario y Componentes Fundamentales

La API de WordPress no reinventa la rueda; implementa los estándares arquitectónicos REST. Sin embargo, utiliza una nomenclatura específica dentro de sus clases PHP que debes conocer.

#### 1. Rutas (Routes)

Una **ruta** es el "nombre" de la URI a la que te conectas. Las rutas están estructuradas de forma jerárquica y representan el recurso que se está consultando o modificando.
Por ejemplo, en la URL `https://tu-sitio.com/wp-json/wp/v2/posts/123`, la ruta es `/wp/v2/posts/123`. Las rutas no indican *qué* acción se va a realizar, solo *dónde* se encuentra el recurso.

#### 2. Endpoints

Un **endpoint** es la conexión entre una Ruta específica y un método HTTP (GET, POST, PUT, DELETE). Una sola ruta puede tener múltiples endpoints.
Por ejemplo, la ruta `/wp/v2/posts` tiene al menos dos endpoints predeterminados:

* Un endpoint `GET` para listar artículos.
* Un endpoint `POST` para crear un nuevo artículo.

En tu código PHP, registrarás rutas, y dentro de esa configuración, definirás los endpoints que soporta.

#### 3. Namespaces (Espacios de nombres)

El **namespace** es el primer segmento de la ruta (justo después del prefijo base `wp-json/`). Su propósito crítico es evitar colisiones entre las rutas del núcleo de WordPress (`wp/v2`), las de otros plugins y las tuyas.

Un namespace debe seguir siempre el patrón `vendor/version`. Si estás desarrollando un plugin llamado "Sistema de Inventario", tu namespace no debería ser simplemente `inventario`, sino `sistema-inventario/v1`.

```text
/wp-json/sistema-inventario/v1/productos/
|_______| |__________________| |________|
 Base URL       Namespace         Ruta

```

El versionado (`v1`) te permite en el futuro lanzar una `v2` de tu API con cambios estructurales drásticos sin romper las aplicaciones de los clientes que siguen consumiendo la `v1`.

#### 4. Peticiones (Requests)

Cuando una llamada llega a un endpoint, WordPress empaqueta todos los datos de esa llamada (cabeceras, parámetros de la URL, cuerpo JSON) en una instancia de la clase `WP_REST_Request`. Tu función callback recibirá este objeto, lo que centraliza y unifica la forma en que extraes variables, reemplazando el uso tradicional de súper globales en PHP como `$_GET` o `$_POST`.

#### 5. Respuestas (Responses)

De manera homóloga a las peticiones, todo lo que tu endpoint devuelva debe estructurarse utilizando la clase `WP_REST_Response`. Aunque WordPress convertirá automáticamente los arrays o cadenas simples en JSON, utilizar la clase `WP_REST_Response` te otorga control total para modificar los códigos de estado HTTP (por ejemplo, devolver un `201 Created` en lugar de un `200 OK`) y añadir cabeceras personalizadas.

#### 6. Controladores (Controllers)

A medida que tu plugin crezca, registrar callbacks mediante funciones anónimas o procedimentales se volverá insostenible. El estándar de WordPress es utilizar el patrón de diseño Controlador. Un controlador de la REST API es una clase PHP que extiende `WP_REST_Controller` y agrupa todo el registro de rutas, validación y lógica de negocio para un recurso específico (por ejemplo, `class Inventario_REST_Productos_Controller`).

#### 7. Esquemas (Schemas)

El **Schema** es la definición formal de la estructura de datos que tu endpoint acepta y devuelve. Basado en el estándar JSON Schema, le dice a WordPress —y a cualquier cliente que consuma la API— qué campos existen, qué tipo de datos son (string, integer, boolean) y cuáles son sus valores predeterminados. WordPress utiliza el Schema automáticamente para sanitizar y validar las peticiones antes de que lleguen a tu código principal, reduciendo significativamente el trabajo manual de validación de variables.

### Descubrimiento (Discovery)

El descubrimiento es el mecanismo por el cual un cliente externo puede interactuar con un sitio WordPress y averiguar si la REST API está habilitada, cuál es su prefijo (usualmente `wp-json`, pero es modificable) y qué rutas están disponibles.

Si realizas una petición `GET` a la raíz de la API (`/wp-json/`), WordPress devolverá un índice masivo en JSON detallando todos los namespaces, rutas y endpoints registrados en ese sitio en particular, junto con los métodos admitidos y los argumentos que cada uno acepta. Esta capacidad de autodescubrimiento es vital para herramientas automáticas y clientes robustos que configuran sus acciones basándose en las capacidades expuestas por el servidor.

## 13.2 Registro de rutas y endpoints

Para exponer la lógica o los datos de tu plugin a través de la REST API, es fundamental registrar explícitamente las rutas y los endpoints que tu aplicación va a soportar. WordPress proporciona un mecanismo centralizado para esto que asegura que tus rutas se integren correctamente en el enrutador principal y aparezcan en el índice de descubrimiento de la API.

Todo registro de rutas debe ejecutarse obligatoriamente enganchado a la acción `rest_api_init`. Intentar registrar rutas fuera de este hook resultará en un fallo silencioso o en advertencias de PHP.

### La función `register_rest_route()`

El pilar de esta arquitectura es la función `register_rest_route`. Su firma básica es la siguiente:

```php
register_rest_route( 
    string $namespace, 
    string $route, 
    array $args = array(), 
    bool $override = false 
);

```

* **`$namespace`**: El prefijo y versión de tu plugin (ej. `mi-plugin/v1`).
* **`$route`**: El recurso específico que estás exponiendo (ej. `/tareas`).
* **`$args`**: Un array asociativo que define el método HTTP, la función callback principal, la función de validación de permisos y los argumentos esperados.
* **`$override`**: Un booleano opcional. Si es `true`, sobrescribirá una ruta existente que tenga exactamente el mismo namespace y ruta.

### Estructuración de Endpoints en una Ruta

Es una práctica recomendada y altamente eficiente agrupar múltiples endpoints que operan sobre el mismo recurso (misma ruta) dentro de una única llamada a `register_rest_route`.

A continuación, se muestra cómo registrar una ruta `/tareas` que soporta tanto una petición de lectura (`GET`) como una de creación (`POST`):

```php
add_action( 'rest_api_init', 'mi_plugin_registrar_rutas_tareas' );

function mi_plugin_registrar_rutas_tareas() {
    $namespace = 'mi-plugin/v1';
    $ruta      = '/tareas';

    register_rest_route( $namespace, $ruta, [
        // Endpoint 1: Listar tareas (GET)
        [
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => 'mi_plugin_obtener_tareas',
            'permission_callback' => '__return_true', // Abierto a todos (se profundizará en 13.4)
        ],
        // Endpoint 2: Crear nueva tarea (POST)
        [
            'methods'             => WP_REST_Server::CREATABLE,
            'callback'            => 'mi_plugin_crear_tarea',
            'permission_callback' => 'is_user_logged_in',
        ]
    ] );
}

```

**Uso de Constantes del Servidor:**
Observa el uso de `WP_REST_Server::READABLE` y `WP_REST_Server::CREATABLE`. Aunque podrías usar cadenas literales como `'GET'` o `'POST'`, WordPress proporciona constantes dentro de la clase `WP_REST_Server` que cubren internamente compatibilidad con múltiples métodos (por ejemplo, `READABLE` mapea a `GET, HEAD`). Su uso es el estándar en el desarrollo profesional.

* `WP_REST_Server::READABLE` (GET)
* `WP_REST_Server::CREATABLE` (POST)
* `WP_REST_Server::EDITABLE` (POST, PUT, PATCH)
* `WP_REST_Server::DELETABLE` (DELETE)
* `WP_REST_Server::ALLMETHODS` (GET, POST, PUT, PATCH, DELETE)

### Rutas Dinámicas con Expresiones Regulares

A menudo necesitarás interactuar con un recurso específico, lo que requiere pasar un identificador dinámico en la propia URL, como `/mi-plugin/v1/tareas/123`.

WordPress utiliza expresiones regulares compatibles con PCRE (Perl Compatible Regular Expressions) para capturar estas variables directamente desde la ruta. El formato de captura nombrada `(?P<nombre_variable>patron)` es obligatorio para que el enrutador asigne el valor extraído y te lo pase como un parámetro utilizable.

```php
add_action( 'rest_api_init', 'mi_plugin_registrar_ruta_tarea_individual' );

function mi_plugin_registrar_ruta_tarea_individual() {
    // La expresión (?P<id>\d+) captura uno o más dígitos y los nombra "id"
    $ruta_con_variable = '/tareas/(?P<id>\d+)';

    register_rest_route( 'mi-plugin/v1', $ruta_con_variable, [
        [
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => 'mi_plugin_obtener_tarea_por_id',
            'permission_callback' => '__return_true',
            'args'                => [
                'id' => [
                    'validate_callback' => function($param, $request, $key) {
                        return is_numeric( $param );
                    }
                ],
            ],
        ],
        [
            'methods'             => WP_REST_Server::EDITABLE,
            'callback'            => 'mi_plugin_actualizar_tarea',
            'permission_callback' => 'mi_plugin_verificar_permiso_edicion',
        ],
        [
            'methods'             => WP_REST_Server::DELETABLE,
            'callback'            => 'mi_plugin_borrar_tarea',
            'permission_callback' => 'mi_plugin_verificar_permiso_borrado',
        ]
    ] );
}

```

En este escenario, si un cliente realiza una petición `GET` a `/mi-plugin/v1/tareas/45`, la función `mi_plugin_obtener_tarea_por_id` recibirá un objeto `WP_REST_Request` que contendrá el valor `45` accesible de forma limpia mediante `$request['id']`.

Otros patrones de captura comunes incluyen:

* Alfanumérico (ej. un slug): `(?P<slug>[a-zA-Z0-9-]+)`
* Cualquier cadena: `(?P<nombre>\w+)`

El array `args` (introducido brevemente en el ejemplo anterior) permite definir reglas de validación y limpieza específicas por parámetro. Este es un mecanismo de defensa de primera línea crucial que exploraremos a fondo en la próxima sección.

## 13.3 Callbacks y validación de args

En la arquitectura de la REST API de WordPress, la ejecución de un endpoint no es un proceso de un solo paso. Para garantizar la seguridad, integridad y previsibilidad de los datos, el enrutador procesa cada petición a través de un "embudo" de callbacks antes de permitir que interactúe con la base de datos o la lógica principal de tu plugin.

Comprender y utilizar correctamente este embudo es lo que diferencia a una API frágil de una robusta y segura.

### El embudo de ejecución de una petición

Cuando una petición HTTP coincide con un endpoint registrado, WordPress ejecuta las funciones asociadas (callbacks) en un orden estricto:

```text
[Petición HTTP Entrante con Parámetros]
                 │
                 ▼
 1. validate_callback()  <── ¿El dato tiene el formato esperado?
                 │           (Ej. ¿El ID es un número entero?)
                 │           [Si falla: Retorna 400 Bad Request]
                 ▼
 2. sanitize_callback()  <── Limpia y transforma el dato.
                 │           (Ej. Elimina etiquetas HTML maliciosas)
                 ▼
 3. permission_callback()<── ¿El usuario actual tiene privilegios?
                 │           (Lo analizaremos a fondo en 13.4)
                 │           [Si falla: Retorna 401 o 403]
                 ▼
 4. callback() principal <── Lógica de negocio de tu plugin.
                 │           (Lee/Escribe en BD, procesa datos)
                 ▼
    [WP_REST_Response (JSON)]

```

### Definición de Argumentos (`args`)

Para que las fases de validación y sanitización funcionen, debes declarar qué parámetros espera tu endpoint. Esto se hace en el array `args` al registrar la ruta.

Cada parámetro puede tener sus propias reglas:

```php
'args' => [
    'email_cliente' => [
        'description'       => 'El correo electrónico del cliente.',
        'type'              => 'string',
        'format'            => 'email',
        'required'          => true,
        'default'           => '',
        'validate_callback' => 'rest_validate_request_arg',
        'sanitize_callback' => 'sanitize_email',
    ],
    'edad' => [
        'type'              => 'integer',
        'required'          => false,
        'minimum'           => 18,
        'validate_callback' => function( $param, $request, $key ) {
            return is_numeric( $param ) && $param >= 18;
        },
        'sanitize_callback' => 'absint',
    ]
]

```

#### Validación vs. Sanitización

Es vital entender la diferencia arquitectónica entre estos dos procesos:

1. **Validación (`validate_callback`)**: Su trabajo es responder con un `true` o `false`. Revisa el dato y dice: *"¿Es esto lo que pedí?"*. Si devuelve `false`, WordPress aborta inmediatamente la petición y devuelve un error HTTP 400. No modifica el dato.
2. **Sanitización (`sanitize_callback`)**: Su trabajo es devolver un dato modificado y seguro. Toma el valor validado y dice: *"Voy a limpiar esto antes de usarlo"*.

**El poder de `rest_validate_request_arg`:**
En lugar de escribir funciones de validación personalizadas para cada parámetro, WordPress proporciona la función nativa `rest_validate_request_arg`. Si la usas como `validate_callback`, WordPress leerá las propiedades `type`, `format`, `enum`, `minimum`, etc., definidas en tu array de argumentos y validará el dato automáticamente basándose en el estándar JSON Schema.

### El Callback Principal

Si la petición sobrevive a la validación, la sanitización y los permisos, llega finalmente a tu callback principal. Esta función siempre recibe un único argumento: una instancia de la clase `WP_REST_Request`.

El objeto `WP_REST_Request` unifica todos los parámetros, independientemente de si vinieron en la URL (Query String), en el cuerpo de la petición (JSON, FormData) o en la propia ruta (capturas regex).

#### Extracción de parámetros

Nunca debes usar `$_GET` o `$_POST` dentro de un callback de la REST API. Utiliza los métodos del objeto request:

* `$request->get_param( 'nombre' )`: Devuelve el valor de un parámetro específico ya sanitizado.
* `$request->get_params()`: Devuelve un array asociativo con todos los parámetros.
* `$request->get_file( 'archivo' )`: Accede a los archivos subidos.
* `$request->get_header( 'x-mi-cabecera' )`: Recupera una cabecera HTTP específica.

#### Construcción de la respuesta

Tu callback principal debe devolver siempre una de dos cosas:

1. Una instancia de `WP_REST_Response` (para éxitos).
2. Una instancia de `WP_Error` (para fallos controlados).

```php
function mi_plugin_crear_cliente_callback( WP_REST_Request $request ) {
    // 1. Obtener datos ya validados y sanitizados
    $email = $request->get_param( 'email_cliente' );
    $edad  = $request->get_param( 'edad' );

    // 2. Lógica de negocio (ej. verificar si el correo ya existe)
    if ( email_exists( $email ) ) {
        // Retornar un WP_Error automáticamente genera una respuesta JSON 
        // con el código HTTP especificado (409 Conflict).
        return new WP_Error( 
            'email_duplicado', 
            'Este correo electrónico ya está registrado en el sistema.', 
            [ 'status' => 409 ] 
        );
    }

    // (Simulación de inserción en base de datos)
    $nuevo_id = 154; 

    // 3. Preparar la respuesta exitosa
    $datos_respuesta = [
        'mensaje' => 'Cliente creado con éxito',
        'id'      => $nuevo_id,
        'email'   => $email
    ];

    // Se instancia WP_REST_Response para controlar el código HTTP (201 Created)
    $response = new WP_REST_Response( $datos_respuesta, 201 );
    
    // Opcional: Añadir cabeceras HTTP a la respuesta
    $response->header( 'X-Plugin-Version', '1.0.0' );

    return $response;
}

```

### Integración en el registro de la ruta

Para ver el panorama completo, así es como se ensamblan el registro, los argumentos y los callbacks en un bloque de código profesional:

```php
add_action( 'rest_api_init', function() {
    register_rest_route( 'mi-plugin/v1', '/clientes', [
        'methods'             => WP_REST_Server::CREATABLE,
        'callback'            => 'mi_plugin_crear_cliente_callback',
        'permission_callback' => '__return_true', // Pendiente de asegurar
        'args'                => [
            'email_cliente' => [
                'type'              => 'string',
                'format'            => 'email',
                'required'          => true,
                'validate_callback' => 'rest_validate_request_arg',
                'sanitize_callback' => 'sanitize_email',
            ],
            'nombre' => [
                'type'              => 'string',
                'required'          => true,
                'validate_callback' => 'rest_validate_request_arg',
                'sanitize_callback' => 'sanitize_text_field',
            ]
        ]
    ] );
});

```

Al externalizar la validación y la sanitización en el array de `args`, el callback principal (`mi_plugin_crear_cliente_callback`) queda completamente limpio de sentencias `if( isset(...) )` o comprobaciones de tipos. Su única responsabilidad se convierte en ejecutar la lógica de negocio, cumpliendo con el principio de responsabilidad única.

## 13.4 Control de permisos en la API

En las secciones anteriores, pospusimos temporalmente la seguridad asignando la función nativa `__return_true` al argumento `permission_callback`. En un entorno de producción, dejar puntos de enlace (endpoints) que modifican datos o exponen información sensible abiertos al público es una vulnerabilidad crítica.

La REST API de WordPress implementa un sistema robusto para separar la lógica de negocio de la lógica de autorización, asegurando que solo los clientes con las credenciales y capacidades correctas puedan ejecutar una acción.

### Autenticación vs. Autorización

Antes de escribir código, es vital distinguir dos conceptos que a menudo se confunden en el contexto de las APIs:

1. **Autenticación (¿Quién eres?):** Es el mecanismo mediante el cual WordPress identifica al usuario que hace la petición. Para peticiones internas (como un bloque de Gutenberg), WordPress usa las cookies de sesión junto con un *Nonce* de la API (`wp_rest`). Para clientes externos, se utilizan Contraseñas de Aplicación (Application Passwords) introducidas en WordPress 5.6, u OAuth mediante plugins adicionales.
2. **Autorización (¿Qué puedes hacer?):** Una vez que WordPress sabe quién es el usuario, debe determinar si tiene permiso para realizar la acción solicitada. Esto se gestiona mediante el sistema de Roles y Capacidades (que vimos en el Capítulo 12).

El `permission_callback` se encarga exclusivamente de la **Autorización**. WordPress ya ha manejado la Autenticación de fondo antes de que tu función se ejecute, inicializando al usuario actual.

### Implementación del `permission_callback`

El parámetro `permission_callback` acepta cualquier función invocable (callable) de PHP. Al igual que el callback principal y el de validación, recibe el objeto `WP_REST_Request` como argumento.

Existen tres escenarios principales de retorno para esta función:

* **Retornar `true`:** La petición está autorizada y pasa a la siguiente fase (callback principal).
* **Retornar `false`:** La petición es rechazada. WordPress aborta la ejecución y devuelve un error genérico `401 Unauthorized` (si el usuario no está logueado) o `403 Forbidden` (si está logueado pero no tiene permisos).
* **Retornar un `WP_Error`:** La petición es rechazada, pero te permite enviar un mensaje de error personalizado y un código de estado específico al cliente, mejorando la experiencia de desarrollo (Developer Experience o DX).

#### Ejemplo Práctico: Restricción por Capacidades

El enfoque más seguro y estándar en WordPress es utilizar `current_user_can()` dentro de tu callback de permisos.

```php
add_action( 'rest_api_init', function() {
    register_rest_route( 'mi-plugin/v1', '/configuracion', [
        [
            'methods'             => WP_REST_Server::EDITABLE, // POST, PUT, PATCH
            'callback'            => 'mi_plugin_actualizar_config_callback',
            'args'                => [ /* ... args ... */ ],
            'permission_callback' => 'mi_plugin_verificar_permisos_config',
        ]
    ] );
});

/**
 * Verifica si el usuario tiene permiso para actualizar la configuración.
 *
 * @param WP_REST_Request $request Objeto de la petición actual.
 * @return true|WP_Error
 */
function mi_plugin_verificar_permisos_config( WP_REST_Request $request ) {
    // 1. Verificamos la capacidad nativa o personalizada
    if ( ! current_user_can( 'manage_options' ) ) {
        
        // 2. Retornamos un WP_Error detallado en lugar de un simple false
        return new WP_Error(
            'rest_forbidden_context',
            __( 'Lo siento, no tienes permisos para modificar la configuración de este plugin.', 'mi-plugin' ),
            [ 'status' => rest_authorization_required_code() ] 
        );
    }

    return true;
}

```

*Nota técnica:* La función nativa `rest_authorization_required_code()` es muy útil aquí; devuelve `401` si el usuario es un visitante anónimo, y `403` si es un usuario autenticado pero sin los privilegios necesarios.

### Verificaciones basadas en el Recurso

A veces, el permiso no depende de un privilegio global, sino del recurso específico que se está intentando manipular. Por ejemplo, un usuario con el rol de "Autor" tiene la capacidad `edit_posts`, pero solo debería poder editar o borrar mediante la API **sus propios artículos**, no los de otros.

En estos casos, debes extraer parámetros de la petición dentro del `permission_callback` para validar la propiedad:

```php
function mi_plugin_verificar_borrado_tarea( WP_REST_Request $request ) {
    // Obtenemos el ID de la URL: /mi-plugin/v1/tareas/(?P<id>\d+)
    $tarea_id = (int) $request->get_param( 'id' );
    $tarea    = get_post( $tarea_id );

    if ( empty( $tarea ) || $tarea->post_type !== 'tarea' ) {
        return new WP_Error( 'tarea_no_encontrada', 'La tarea no existe.', [ 'status' => 404 ] );
    }

    // Verificamos si es el autor de la tarea O si tiene privilegios de administrador
    $usuario_actual = get_current_user_id();
    
    if ( (int) $tarea->post_author !== $usuario_actual && ! current_user_can( 'edit_others_posts' ) ) {
        return new WP_Error( 'permiso_denegado', 'No puedes borrar las tareas de otro usuario.', [ 'status' => 403 ] );
    }

    return true;
}

```

### Endpoints Públicos y la advertencia `_doing_it_wrong`

Si tu intención es crear un endpoint 100% público (por ejemplo, un endpoint de lectura para mostrar una lista de tiendas en un mapa en el front-end), **nunca debes omitir el argumento `permission_callback`**.

Desde la versión 5.5 de WordPress, si omites este parámetro, el sistema funcionará, pero generará un aviso de depuración `_doing_it_wrong` en los logs del servidor. Esto se implementó para obligar a los desarrolladores a ser explícitos sobre la apertura de un endpoint, evitando que rutas sensibles queden expuestas por olvido.

Para rutas verdaderamente públicas, utiliza siempre la función nativa que devuelve directamente un valor booleano positivo:

```php
'permission_callback' => '__return_true',

```

## Resumen del capítulo

En este capítulo hemos profundizado en la arquitectura y el flujo de la WP REST API, una herramienta fundamental para desacoplar el back-end de WordPress de aplicaciones cliente modernas.

1. **Conceptos Clave:** Aprendimos la nomenclatura estandarizada: Rutas, Endpoints, Namespaces (`vendor/v1`) y el mecanismo de descubrimiento de la API. Comprendimos que toda comunicación empaqueta sus datos en las clases `WP_REST_Request` y `WP_REST_Response`.
2. **Registro de Rutas:** Descubrimos que `register_rest_route` centraliza la creación de recursos atados al hook `rest_api_init`, utilizando constantes legibles (`WP_REST_Server::READABLE`) y expresiones regulares para capturar variables dinámicas de la URL.
3. **Validación y Callbacks:** Desglosamos el "embudo de ejecución". Externalizar la lógica de chequeo utilizando JSON Schema en el array `args` (`validate_callback` y `sanitize_callback`) mantiene tu función principal limpia y enfocada únicamente en la lógica de negocio.
4. **Seguridad y Permisos:** Finalmente, analizamos el `permission_callback` como la barrera de autorización. Utilizando `current_user_can()` o verificando la propiedad del recurso frente a `$request`, garantizamos que nuestros endpoints expuestos sean un puente seguro hacia la base de datos y no un vector de ataque.
