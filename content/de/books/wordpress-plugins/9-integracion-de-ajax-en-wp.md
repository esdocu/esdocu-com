La web moderna exige interfaces rápidas y reactivas donde las páginas no necesiten recargarse para interactuar con el servidor. En este capítulo, exploraremos cómo integrar AJAX de forma nativa y segura en tus plugins de WordPress. Desmitificaremos el archivo `admin-ajax.php` y aprenderemos a enrutar peticiones asíncronas con ganchos dinámicos para usuarios autenticados (`wp_ajax_`) y visitantes anónimos (`wp_ajax_nopriv_`). Además, blindaremos estas interacciones contra ataques CSRF utilizando Nonces y modernizaremos el flujo de comunicación devolviendo datos estructurados en formato JSON. Prepárate para dar vida al frontend.

## 9.1 El archivo admin-ajax.php

En el ecosistema de WordPress, la implementación tradicional de peticiones asíncronas gira en torno a un único archivo centralizador: `admin-ajax.php`. Situado en el directorio `/wp-admin/` del núcleo de WordPress, este archivo actúa como el enrutador principal para capturar, procesar y devolver respuestas a todas las solicitudes AJAX que ocurren dentro de la plataforma.

### El falso mito del nombre "admin"

Uno de los puntos de confusión más comunes para los desarrolladores que se inician en la creación de plugins es la ubicación y el nombre de este archivo. Dado que reside dentro de la carpeta `wp-admin` y lleva el prefijo "admin", es intuitivo pensar que solo debe utilizarse para peticiones asíncronas dentro del panel de control de WordPress.

Sin embargo, esto es un remanente histórico de la arquitectura de WordPress. **`admin-ajax.php` es el endpoint oficial y estándar para procesar solicitudes AJAX tanto en el *backend* (panel de administración) como en el *frontend* (la parte pública del sitio web)**.

Para asegurar que tu código sea robusto y portátil, nunca debes "hardcodear" la ruta hacia este archivo en tu JavaScript. En su lugar, la práctica estándar es generar la URL dinámicamente desde PHP usando la función `admin_url()` y pasarla al frontend mediante `wp_localize_script()` o `wp_add_inline_script()`.

```php
// Ejemplo de cómo exponer la URL de admin-ajax.php a un archivo JavaScript
add_action( 'wp_enqueue_scripts', 'mi_plugin_encolar_scripts' );

function mi_plugin_encolar_scripts() {
    wp_enqueue_script( 
        'mi-script-ajax', 
        plugin_dir_url( __FILE__ ) . 'assets/js/mi-script.js', 
        array( 'jquery' ), 
        '1.0.0', 
        true 
    );

    // Pasamos variables de PHP a JavaScript
    wp_localize_script( 'mi-script-ajax', 'MiPluginConfig', array(
        'ajax_url' => admin_url( 'admin-ajax.php' )
    ) );
}

```

### El parámetro `action`: El corazón del enrutamiento

Para que `admin-ajax.php` sepa qué hacer con una solicitud entrante, requiere obligatoriamente que se le pase un parámetro llamado `action`. Este parámetro puede enviarse a través del método GET o POST.

El archivo `admin-ajax.php` intercepta este parámetro `action` y lo utiliza para construir el nombre de un *Action Hook* específico de forma dinámica. Todo el flujo de trabajo depende de esta concatenación.

A continuación, se muestra una representación visual del ciclo de vida de una petición dentro de `admin-ajax.php`:

```text
+-----------------------+
|  JavaScript (Cliente) |
+-----------------------+
           |
           | 1. Petición HTTP (GET o POST)
           | payload: { action: 'procesar_formulario', datos: '...' }
           v
+-----------------------+
| wp-admin/admin-ajax.php|
+-----------------------+
           |
           | 2. Carga el núcleo de WordPress (wp-load.php)
           | 3. Lee la variable $_REQUEST['action']
           v
+-----------------------+
|  Mecanismo de Ruteo   |
+-----------------------+
           |
           +-- ¿El usuario tiene una sesión de WP activa?
           |
           |---> [SÍ]:  Dispara el hook -> wp_ajax_procesar_formulario
           |
           |---> [NO]:  Dispara el hook -> wp_ajax_nopriv_procesar_formulario
           v
+-----------------------+
|  Función de tu Plugin |
+-----------------------+
           |
           | 4. Procesa los datos
           | 5. Imprime la respuesta (ej. JSON)
           | 6. Finaliza la ejecución (wp_die)
           v
+-----------------------+
|  JavaScript (Cliente) | <--- Recibe la respuesta asíncrona
+-----------------------+

```

### Impacto en el rendimiento y ciclo de carga

Es imperativo comprender qué ocurre en el servidor cuando se hace una llamada a `admin-ajax.php`. Este archivo no es un script ligero; en su primera línea de ejecución, incluye `wp-load.php`.

Esto significa que **cada petición AJAX enviada a `admin-ajax.php` arranca el entorno completo de WordPress**. Se conecta a la base de datos, carga todos los plugins activos, inicializa el tema actual y dispara la mayoría de los hooks regulares de inicialización (como `init` o `wp_loaded`).

Aunque esto proporciona una enorme comodidad porque tienes a tu disposición todas las funciones nativas de WordPress y de otros plugins durante tu petición AJAX, también introduce un *overhead* (sobrecarga) significativo de rendimiento. Para tareas de altísima frecuencia (como un autoguardado que se ejecuta cada segundo, o un rastreador de eventos del ratón), enviar peticiones constantes a `admin-ajax.php` puede agotar rápidamente los recursos de un servidor estándar.

Para esos casos extremos, los desarrolladores avanzados suelen evaluar el uso de endpoints personalizados de la REST API (que veremos en el Capítulo 13) o, en arquitecturas muy específicas, archivos PHP aislados, aunque esto último sacrifica la seguridad y abstracción que provee el núcleo de WordPress. Para la inmensa mayoría de interacciones estándar (envío de formularios, carga de más posts, validaciones en vivo), `admin-ajax.php` es y seguirá siendo la herramienta principal de trabajo.

## 9.2 Hooks para usuarios logueados

Como vimos en la arquitectura de `admin-ajax.php`, WordPress determina cómo procesar una petición basándose en dos factores: el parámetro `action` enviado desde el cliente y el estado de la sesión del usuario.

Cuando WordPress detecta que la petición proviene de un usuario que ha iniciado sesión (es decir, existe una cookie de autenticación válida en la solicitud), dispara un Action Hook dinámico específico para usuarios autenticados.

### El patrón `wp_ajax_{action}`

El núcleo de WordPress toma el prefijo `wp_ajax_` y le concatena exactamente el valor que hayas pasado en el parámetro `action` de tu petición AJAX.

Si tu código JavaScript envía una petición HTTP a `admin-ajax.php` con el siguiente cuerpo (payload):

```javascript
{
    action: 'guardar_preferencias_usuario',
    color_favorito: 'azul'
}

```

WordPress, internamente, ejecutará la función `do_action()` buscando específicamente este gancho:

```php
do_action( 'wp_ajax_guardar_preferencias_usuario' );

```

Por lo tanto, la tarea del desarrollador del plugin es "enganchar" (hook) una función de PHP a este action dinámico para interceptar la llamada y procesar los datos.

### Implementación práctica

La estructura fundamental para registrar y manejar una petición AJAX para un usuario logueado consta de dos partes: el registro del hook y la función *callback*.

```php
// 1. Enganchamos nuestra función al action dinámico
// Nota: 'guardar_preferencias_usuario' debe coincidir EXACTAMENTE con el valor de 'action' en JS.
add_action( 'wp_ajax_guardar_preferencias_usuario', 'mi_plugin_guardar_preferencias' );

// 2. Definimos la función callback
function mi_plugin_guardar_preferencias() {
    
    // Verificamos si el dato esperado existe en la petición POST
    if ( isset( $_POST['color_favorito'] ) ) {
        
        $color = sanitize_text_field( $_POST['color_favorito'] );
        $user_id = get_current_user_id(); // Funciona perfectamente porque estamos en wp_ajax_
        
        // Guardamos el dato como metadato del usuario (Visto en el Cap. 4)
        update_user_meta( $user_id, 'color_favorito_ui', $color );
        
        // Enviamos una respuesta exitosa
        echo 'Preferencias guardadas correctamente.';
        
    } else {
        // Manejamos el error si falta el dato
        echo 'Error: No se recibió el color.';
    }

    // 3. ¡Obligatorio! Finalizar la ejecución
    wp_die(); 
}

```

### La importancia de finalizar la ejecución (`wp_die`)

El error más común al iniciarse en el desarrollo de AJAX en WordPress es olvidar incluir `wp_die()` (o `exit`/`die()`) al final de la función callback.

Si omites la terminación explícita del script, WordPress continuará su ciclo de ejecución normal y, por defecto, el archivo `admin-ajax.php` imprimirá un `0` al final de la respuesta, o en algunos casos, cargará el resto del HTML del sitio.

```text
Resultado SIN wp_die():
"Preferencias guardadas correctamente.0"  <-- Ese '0' romperá tus validaciones en JavaScript.

Resultado CON wp_die():
"Preferencias guardadas correctamente."

```

### Contexto del usuario autenticado

Dado que el hook `wp_ajax_{action}` **solo** se dispara si el usuario tiene una sesión activa, cuentas con una ventaja significativa: puedes utilizar con total confianza funciones nativas que dependen de la sesión del usuario.

Por ejemplo, `get_current_user_id()` devolverá siempre un ID válido (mayor que 0). Asimismo, es el momento ideal para verificar las capacidades (*capabilities*) del usuario antes de procesar cualquier acción destructiva o de guardado, asegurando que, aunque el usuario esté logueado, tenga los permisos específicos para esa acción.

```php
function mi_plugin_borrar_registro() {
    // Aunque el usuario esté logueado (wp_ajax_), ¿tiene permiso para hacer ESTO?
    if ( ! current_user_can( 'manage_options' ) ) {
        echo 'No tienes permisos suficientes.';
        wp_die();
    }
    
    // Lógica para borrar el registro...
    wp_die();
}

```

*Nota: Veremos la gestión profunda de permisos en el Capítulo 12 y la sanitización/seguridad estricta (Nonces) en la sección 9.4 y el Capítulo 10. Por ahora, debes asimilar que `wp_ajax_` garantiza que hay una sesión, pero no garantiza de quién es esa sesión ni sus privilegios dentro del sitio.*

## 9.3 Hooks para usuarios sin sesión

En la sección anterior vimos cómo WordPress atiende las peticiones AJAX de los usuarios que han iniciado sesión. Sin embargo, una gran parte de las interacciones asíncronas en un sitio web ocurren en el *frontend* público por parte de visitantes anónimos: enviar un formulario de contacto, cargar más productos en una tienda, votar en una encuesta o filtrar un portafolio.

Para manejar estas solicitudes donde no existe una cookie de autenticación válida, WordPress proporciona una variante específica del Action Hook: el sufijo `nopriv` (sin privilegios).

### El patrón `wp_ajax_nopriv_{action}`

Cuando una petición AJAX llega a `admin-ajax.php` y WordPress determina que el usuario **no** está autenticado, buscará y ejecutará el Action Hook dinámico estructurado de la siguiente manera:

```php
do_action( 'wp_ajax_nopriv_' . $_REQUEST['action'] );

```

Si retomamos el ejemplo de la petición desde JavaScript con el parámetro `action: 'procesar_formulario_contacto'`, el hook que debes utilizar en tu plugin será `wp_ajax_nopriv_procesar_formulario_contacto`.

### Soportando a ambos tipos de usuarios

Uno de los escenarios más habituales en el desarrollo de plugins es crear una funcionalidad AJAX que deba estar disponible tanto para usuarios registrados como para visitantes anónimos (por ejemplo, un botón de "Cargar más entradas" en el blog).

Dado que WordPress separa estrictamente el enrutamiento según el estado de la sesión, si solo registras el hook `wp_ajax_nopriv_`, la función **fallará** (devolverá un error 400 o un `0`) si un administrador logueado intenta usarla.

Para que una acción sea universal, debes enlazar la misma función *callback* a **ambos** hooks simultáneamente:

```php
// 1. Hook para usuarios CON sesión iniciada
add_action( 'wp_ajax_cargar_mas_posts', 'mi_plugin_cargar_posts' );

// 2. Hook para usuarios SIN sesión (anónimos)
add_action( 'wp_ajax_nopriv_cargar_mas_posts', 'mi_plugin_cargar_posts' );

// 3. La función callback compartida
function mi_plugin_cargar_posts() {
    
    // Aquí va la lógica para consultar y devolver los posts
    $pagina = isset( $_POST['pagina'] ) ? intval( $_POST['pagina'] ) : 1;
    
    // ... ejecución de WP_Query ...
    
    echo 'HTML de los nuevos posts...';
    
    wp_die(); // Siempre finalizar la ejecución
}

```

### Contexto de seguridad y confianza cero

Trabajar con `wp_ajax_nopriv_` implica un cambio drástico en el paradigma de seguridad. Mientras que con `wp_ajax_` tienes la certeza de que *alguien* validado está haciendo la petición, con `nopriv` estás abriendo una puerta directa a tu servidor para cualquier persona (o bot) en internet.

Consideraciones críticas al usar este hook:

1. **El usuario es un fantasma:** Funciones como `get_current_user_id()` devolverán siempre `0`. No puedes depender de las *capabilities* de WordPress (`current_user_can()`) para proteger la ejecución del código.
2. **Sanitización agresiva:** Puesto que la entrada proviene de fuentes completamente no confiables, la validación y sanitización de los datos recibidos en `$_POST` o `$_GET` debe ser paranoica. Nunca confíes en que el JavaScript de tu frontend es el único que está enviando datos a este endpoint.
3. **Límites de tasa (Rate Limiting):** Si tu endpoint `nopriv` realiza operaciones pesadas en la base de datos o envía correos electrónicos, considera implementar un sistema de control de ráfagas (rate limiting) transitorio para evitar ataques de denegación de servicio (DDoS) a nivel de aplicación.

El diseño de doble hook de WordPress no es un capricho; es una barrera de seguridad "por defecto". Al obligarte a registrar explícitamente `wp_ajax_nopriv_`, WordPress evita que expongas accidentalmente funciones administrativas o destructivas a visitantes anónimos. Si olvidas añadir el hook `nopriv`, el visitante simplemente recibirá un `0` y tu código seguro no se ejecutará.

## 9.4 Uso de Nonces para seguridad AJAX

Incluso si utilizas el hook correcto (`wp_ajax_`) y compruebas los permisos del usuario con `current_user_can()`, tu endpoint AJAX sigue siendo vulnerable a un tipo de ataque específico: **CSRF** (Cross-Site Request Forgery o Falsificación de Petición en Sitios Cruzados).

Un atacante podría engañar a un administrador autenticado para que haga clic en un enlace malicioso o visite una página de terceros que ejecute un script silencioso enviando una petición a tu `admin-ajax.php`. Como el navegador del administrador adjuntará automáticamente sus cookies de sesión, WordPress creerá que la petición es legítima.

Para bloquear este vector de ataque, WordPress utiliza **Nonces** (números usados una sola vez, aunque en WordPress son tokens criptográficos basados en tiempo). Un nonce garantiza que la petición AJAX fue generada intencionalmente por tu interfaz y no por un agente externo.

### El flujo de seguridad del Nonce en AJAX

La implementación de nonces en llamadas asíncronas requiere una coordinación exacta entre PHP (que genera y luego verifica el token) y JavaScript (que lo recibe y lo envía de vuelta).

```text
[ SERVIDOR - PHP ]                            [ CLIENTE - Navegador ]
1. Genera el Nonce   -----------------------> 2. Inyecta el Nonce en JS
   wp_create_nonce()                             (wp_localize_script)
                                                          |
                                                          v
[ SERVIDOR - PHP ]                            [ CLIENTE - Navegador ]
5. Verifica el Nonce <----------------------- 3. JS lee la variable global
   check_ajax_referer()                       4. Envía petición AJAX con
   [Válido] -> Procesa y responde                el nonce en el payload
   [Inválido] -> Finaliza con error 403

```

### 1. Generación e inyección del Nonce (PHP)

El primer paso es crear el token en el backend y pasarlo al frontend. Como vimos en la sección 9.1, la herramienta ideal para esto es `wp_localize_script()` (o `wp_add_inline_script()`).

Es crucial darle al nonce una "acción" descriptiva. Esta acción es una cadena de texto que actúa como firma; el mismo texto deberá usarse para verificarlo después.

```php
add_action( 'wp_enqueue_scripts', 'mi_plugin_scripts_con_nonce' );

function mi_plugin_scripts_con_nonce() {
    wp_enqueue_script( 'mi-script', plugin_dir_url( __FILE__ ) . 'app.js', array('jquery'), '1.0', true );

    // Generamos el nonce y lo pasamos al frontend
    wp_localize_script( 'mi-script', 'MiPluginGlobal', array(
        'ajax_url'  => admin_url( 'admin-ajax.php' ),
        'seguridad' => wp_create_nonce( 'borrar_registro_nonce' ) // <- Generación
    ) );
}

```

### 2. Envío del Nonce en la petición (JavaScript)

En tu archivo JavaScript, debes recoger ese token de la variable global que creamos (`MiPluginGlobal.seguridad`) y adjuntarlo a los datos que envías mediante POST o GET a `admin-ajax.php`.

Por convención estándar en WordPress, la clave del objeto de datos suele llamarse `nonce` o `security`.

```javascript
jQuery(document).ready(function($) {
    $('#btn-borrar').on('click', function(e) {
        e.preventDefault();

        var datos = {
            action: 'mi_plugin_borrar_item', // El hook de ruteo
            item_id: 42,
            security: MiPluginGlobal.seguridad // El token de verificación
        };

        $.post( MiPluginGlobal.ajax_url, datos, function( respuesta ) {
            console.log( respuesta );
        });
    });
});

```

### 3. Verificación en el Callback (PHP)

Finalmente, dentro de la función que maneja tu petición AJAX, la primera línea de defensa antes de procesar cualquier dato debe ser la verificación del nonce.

WordPress proporciona una función específica y altamente optimizada para peticiones asíncronas: `check_ajax_referer()`.

```php
add_action( 'wp_ajax_mi_plugin_borrar_item', 'mi_plugin_callback_borrar' );

function mi_plugin_callback_borrar() {
    
    // 1. Verificar el Nonce
    // check_ajax_referer( $action, $query_arg, $die )
    // $action: El mismo texto usado en wp_create_nonce()
    // $query_arg: El nombre de la clave en $_REQUEST (en JS lo llamamos 'security')
    check_ajax_referer( 'borrar_registro_nonce', 'security' );

    // Si el nonce es inválido o ha expirado, check_ajax_referer() hace un wp_die()
    // automáticamente y devuelve un error 403 Forbidden.
    // El código a partir de aquí SOLO se ejecuta si el nonce es válido.

    // 2. Comprobar permisos
    if ( ! current_user_can( 'delete_posts' ) ) {
        wp_die( 'No tienes permisos suficientes.' );
    }

    // 3. Sanitizar entrada
    $item_id = intval( $_POST['item_id'] );

    // 4. Lógica de negocio (borrar el item...)
    // ...

    echo 'Registro borrado con seguridad.';
    wp_die();
}

```

### Consideraciones sobre la caché y Nonces anónimos

Como exploraremos con mayor profundidad en el Capítulo 10, los nonces de WordPress tienen un tiempo de vida máximo (por defecto de 24 horas) y están ligados a la sesión del usuario actual.

Sin embargo, hay una trampa arquitectónica crítica cuando trabajas con `wp_ajax_nopriv_`: **los nonces para visitantes anónimos son los mismos para todos**. Además, si utilizas un plugin de caché de páginas (como WP Rocket o W3 Total Cache), el HTML generado junto con el bloque de `wp_localize_script` se guardará estáticamente.

Si un visitante anónimo carga la página y la caché sirve una versión generada hace más de 24 horas, el nonce incluido en el JavaScript habrá expirado. Todas las peticiones AJAX de ese visitante fallarán con un error 403. Para solucionar este problema en el frontend público, existen dos enfoques: configurar la exclusión de caché para páginas con alta interacción AJAX, o cargar el nonce dinámicamente mediante una petición inicial vía REST API antes de ejecutar la acción principal.

## 9.5 Retorno de respuestas JSON

A medida que el desarrollo web ha evolucionado hacia interfaces más reactivas y aplicaciones de una sola página (SPA), la práctica de devolver fragmentos completos de HTML desde el servidor ha ido cediendo terreno frente a la transmisión de datos estructurados. JSON (JavaScript Object Notation) es el estándar indiscutible para esta tarea.

Aunque puedes utilizar la función nativa de PHP `json_encode()` seguida de un `wp_die()` para lograr esto, WordPress ofrece un conjunto de funciones especializadas que simplifican enormemente este proceso, manejando automáticamente las cabeceras HTTP y la terminación del script.

### La tríada de funciones JSON en WordPress

WordPress pone a tu disposición tres funciones principales para retornar respuestas JSON desde un callback de AJAX:

1. **`wp_send_json( $respuesta, $status_code = null )`**: Envía la respuesta JSON de vuelta al cliente y termina la ejecución. Es útil cuando necesitas una estructura de datos completamente personalizada.
2. **`wp_send_json_success( $data = null, $status_code = null )`**: Envía una respuesta de éxito estandarizada.
3. **`wp_send_json_error( $data = null, $status_code = null )`**: Envía una respuesta de error estandarizada.

La ventaja fundamental de utilizar `wp_send_json_success()` y `wp_send_json_error()` radica en que envuelven tus datos en una estructura predecible. Internamente, estas funciones generan un objeto con una propiedad booleana `success` y colocan tu carga útil dentro de una propiedad `data`.

Además, **estas funciones ejecutan `wp_die()` automáticamente por ti**, por lo que tu código queda más limpio y menos propenso a errores por olvido.

### Implementación en el backend (PHP)

Veamos cómo refactorizar un endpoint de procesamiento de formulario para utilizar estas funciones semánticas:

```php
add_action( 'wp_ajax_procesar_formulario', 'mi_plugin_procesar_json' );
add_action( 'wp_ajax_nopriv_procesar_formulario', 'mi_plugin_procesar_json' );

function mi_plugin_procesar_json() {
    // 1. Verificación de seguridad
    if ( ! check_ajax_referer( 'mi_formulario_nonce', 'security', false ) ) {
        // Retorna: { "success": false, "data": "Token de seguridad inválido." }
        wp_send_json_error( 'Token de seguridad inválido.' );
    }

    // 2. Validación de datos
    if ( empty( $_POST['email'] ) || ! is_email( $_POST['email'] ) ) {
        wp_send_json_error( 'Por favor, introduce un correo electrónico válido.' );
    }

    $email = sanitize_email( $_POST['email'] );

    // 3. Lógica de negocio (ej. guardar en base de datos)
    $guardado = mi_plugin_guardar_email_db( $email );

    if ( ! $guardado ) {
        wp_send_json_error( 'Hubo un problema en el servidor al guardar los datos.' );
    }

    // 4. Respuesta exitosa
    // Puedes enviar arrays asociativos complejos si lo necesitas
    $respuesta = array(
        'mensaje'  => '¡Suscripción completada con éxito!',
        'email'    => $email,
        'fecha'    => current_time( 'mysql' )
    );

    // Retorna: { "success": true, "data": { "mensaje": "...", "email": "...", ... } }
    wp_send_json_success( $respuesta );
    
    // No es necesario añadir wp_die() aquí.
}

```

### Manejo de la respuesta en el frontend (JavaScript)

Al utilizar esta convención en tu código PHP, la lógica en tu JavaScript se vuelve mucho más robusta y fácil de leer. Puedes confiar en la propiedad `success` para bifurcar el flujo de tu interfaz de usuario.

```javascript
jQuery(document).ready(function($) {
    $('#mi-formulario').on('submit', function(e) {
        e.preventDefault();

        var datos = {
            action: 'procesar_formulario',
            security: MiPluginGlobal.nonce,
            email: $('#campo-email').val()
        };

        $.ajax({
            url: MiPluginGlobal.ajax_url,
            type: 'POST',
            data: datos,
            dataType: 'json', // Esperamos explícitamente JSON
            beforeSend: function() {
                // Mostrar un spinner de carga
                $('#mensaje-ui').text('Procesando...');
            },
            success: function( response ) {
                // WordPress garantiza la estructura { success: boolean, data: mixed }
                if ( response.success ) {
                    // response.data contiene el array asociativo que pasamos en PHP
                    $('#mensaje-ui')
                        .removeClass('error')
                        .addClass('exito')
                        .text( response.data.mensaje );
                    
                    console.log('Registrado el: ' + response.data.fecha);
                } else {
                    // response.data contiene el mensaje de error del wp_send_json_error()
                    $('#mensaje-ui')
                        .removeClass('exito')
                        .addClass('error')
                        .text( response.data );
                }
            },
            error: function() {
                // Maneja errores de red o del servidor (ej. un error 500)
                $('#mensaje-ui').text('Error crítico de comunicación con el servidor.');
            }
        });
    });
});

```

Adoptar `wp_send_json_success` y `wp_send_json_error` no solo estandariza tus comunicaciones cliente-servidor, sino que prepara tu código para ser más fácilmente migrado o integrado con la REST API de WordPress (Capítulo 13) y herramientas modernas de frontend, las cuales asumen JSON como formato predeterminado.

## Resumen del capítulo

En este capítulo hemos desmitificado la integración de peticiones asíncronas dentro de WordPress, comprendiendo que el archivo `admin-ajax.php` es el enrutador universal tanto para el panel de administración como para la parte pública del sitio.

Hemos establecido las bases del ruteo mediante el parámetro obligatorio `action`, y cómo WordPress bifurca la ejecución dependiendo de la sesión del usuario a través de los ganchos dinámicos `wp_ajax_{action}` y `wp_ajax_nopriv_{action}`.

Además, hemos abordado los pilares irrenunciables de la seguridad AJAX: la necesidad imperativa de generar y verificar **Nonces** para proteger nuestro código contra falsificaciones de peticiones a través de sitios (CSRF). Finalmente, modernizamos el flujo de datos adoptando la respuesta estandarizada en formato **JSON** mediante funciones nativas que automatizan el envío de cabeceras, la estructuración de la respuesta y la terminación segura del script. Dominar estos fundamentos te permitirá construir interfaces dinámicas seguras sin comprometer el rendimiento del ecosistema.
