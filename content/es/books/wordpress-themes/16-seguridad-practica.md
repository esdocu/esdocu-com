Escribir código funcional es solo la mitad del trabajo; la otra mitad es garantizar que sea seguro. Un theme vulnerable puede comprometer sitios enteros y exponer datos sensibles. En este capítulo, transformaremos tu forma de programar adoptando una mentalidad de confianza cero frente a los datos dinámicos.

Aprenderemos a construir las cuatro defensas fundamentales en WordPress: la sanitización estricta de entradas, el escape seguro para neutralizar salidas, la implementación de Nonces para bloquear ataques CSRF y la verificación rigurosa de capacidades. Prepárate para blindar tu código contra las vulnerabilidades web más comunes.

## 16.1 Sanitización de entradas de usuario

La regla de oro en el desarrollo web, y particularmente en el ecosistema de WordPress, se resume en cuatro palabras: **nunca confíes en el usuario**. Cualquier dato que provenga de una fuente externa —ya sea un formulario de contacto, opciones del Customizer, parámetros en la URL (`$_GET`) o datos enviados por POST (`$_POST`)— debe considerarse potencialmente malicioso.

La sanitización es el proceso de limpiar y filtrar estos datos **antes** de procesarlos o guardarlos en la base de datos. A diferencia de la validación (que comprueba si un dato cumple con el formato esperado antes de rechazarlo o aceptarlo) o el escape (que abordaremos en la siguiente sección y se aplica al momento de imprimir datos en pantalla), la sanitización altera activamente la entrada para eliminar caracteres peligrosos, código ejecutable o formato no deseado.

### El flujo de datos seguro

Para visualizar el momento exacto en el que debes aplicar la sanitización, observa el siguiente esquema lógico:

```text
[ Interfaz del Usuario ] ---> Envía datos (Formulario web, Customizer, AJAX)
                                    |
                                    v
[ Lógica del Servidor ] ----> Recibe array global ($_POST / $_GET)
                                    |
                                    v
                              +-------------------------+
                              |    SANITIZACIÓN         | <--- Uso de funciones sanitize_*()
                              +-------------------------+
                                    |
                                    v
[ Base de Datos / API ] ----> Guarda o procesa información limpia y segura

```

### Funciones nativas de sanitización en WordPress

El core de WordPress proporciona un arsenal robusto de funciones diseñadas para limpiar casi cualquier tipo de dato imaginable. Como desarrollador de themes, usarás estas funciones principalmente al manejar opciones del tema en el panel de administración o al procesar peticiones enviadas desde el frontend.

Aquí tienes las herramientas fundamentales que debes incorporar a tu código:

* **`sanitize_text_field( $str )`**: Es la función más utilizada para inputs de texto de una sola línea. Se encarga de eliminar etiquetas HTML, codificar comillas, borrar saltos de línea y eliminar espacios en blanco adicionales al principio y al final de la cadena.
* **`sanitize_textarea_field( $str )`**: Similar a la anterior, pero diseñada específicamente para bloques de texto multilínea provenientes de un `<textarea>`. Conserva los saltos de línea de forma segura pero elimina el HTML y otros scripts peligrosos.
* **`sanitize_email( $email )`**: Elimina todos los caracteres que no están permitidos en una dirección de correo electrónico, asegurando que la cadena resultante tenga la estructura base de un email.
* **`absint( $int )`**: Convierte cualquier valor en un número entero absoluto (no negativo). Es indispensable cuando esperas recibir identificadores como IDs de posts, términos de taxonomías o cantidades específicas.
* **`sanitize_key( $key )`**: Limpia una cadena para usarla como clave de base de datos o identificador (por ejemplo, al crear un array o registrar opciones). Lo convierte todo a minúsculas y solo permite caracteres alfanuméricos, guiones y guiones bajos.
* **`sanitize_hex_color( $color )`**: Específica para limpiar valores de color en formato hexadecimal (altamente utilizada al registrar controles en el Customizer), devolviendo un formato válido como `#RRGGBB` o `#RGB`.

### Sanitización avanzada: El motor KSES

En ocasiones, el diseño de tu theme requerirá que el usuario introduzca texto enriquecido (por ejemplo, permitiéndole usar negritas o enlaces en una biografía de autor personalizada). Usar `sanitize_text_field()` destruiría todas las etiquetas útiles. Para estos casos, WordPress cuenta con su motor KSES (*KSES Strips Evil Scripts*).

* **`wp_kses_post( $data )`**: Filtra el contenido permitiendo únicamente las etiquetas HTML que son seguras y que WordPress permite nativamente en el contenido de una entrada estándar. Es ideal para limpiar textos enriquecidos genéricos.
* **`wp_kses( $data, $allowed_html )`**: Ofrece el control más estricto y granular. Te permite pasar un array multidimensional definiendo exactamente qué etiquetas y qué atributos dentro de ellas están permitidos. Todo lo demás será eliminado sin contemplaciones.

### Ejemplo de implementación en un Theme

Supongamos que estamos procesando un formulario de contacto personalizado integrado en una plantilla de página del theme. Antes de enviar el correo o guardar el registro, debemos limpiar los datos extraídos de `$_POST`:

```php
// Verificamos de forma segura que el formulario fue enviado
if ( isset( $_POST['theme_contact_submit'] ) ) {

    // 1. Sanitizamos un campo de texto simple (Nombre)
    $nombre = isset( $_POST['user_name'] ) ? sanitize_text_field( $_POST['user_name'] ) : '';

    // 2. Sanitizamos el correo electrónico
    $email = isset( $_POST['user_email'] ) ? sanitize_email( $_POST['user_email'] ) : '';

    // 3. Sanitizamos un valor numérico (por ejemplo, el ID del post desde donde se envía)
    $post_origen_id = isset( $_POST['source_post_id'] ) ? absint( $_POST['source_post_id'] ) : 0;

    // 4. Sanitizamos el mensaje, permitiendo solo ciertas etiquetas HTML
    $etiquetas_permitidas = [
        'a'      => [
            'href'  => true,
            'title' => true,
        ],
        'b'      => [],
        'strong' => [],
        'i'      => [],
        'em'     => [],
    ];
    $mensaje = isset( $_POST['user_message'] ) ? wp_kses( $_POST['user_message'], $etiquetas_permitidas ) : '';

    // A partir de este punto, es completamente seguro operar con las variables:
    // $nombre, $email, $post_origen_id y $mensaje
}

```

Aplicar estas funciones de manera sistemática y por defecto garantiza que, independientemente de lo que un usuario (o un script automatizado) intente inyectar en las interfaces de tu theme, el entorno se mantendrá libre de vulnerabilidades XSS (Cross-Site Scripting) almacenadas y payloads maliciosos.

## 16.2 Escape seguro de datos

Si la sanitización (sección anterior) es la barrera que protege tu base de datos de las entradas maliciosas, el **escape** es el escudo que protege a los visitantes de tu sitio frente a salidas peligrosas. Escapar datos significa tomar la información que ya tienes (ya sea de la base de datos, de una variable o de una API) y asegurarte de que es completamente inofensiva antes de imprimirla en el navegador del usuario.

El principio fundamental del escape en WordPress se conoce como **"Escape Tardío"** (*Late Escaping*). Esta regla dicta que los datos deben escaparse en el último milisegundo posible, justo en el momento exacto en el que utilizas `echo` o `print`.

### El flujo del Escape Tardío

```text
[ Origen de Datos ] ---> [ Procesamiento PHP ] ---> [ Filtros y Hooks ]
  (Base de datos,                                           |
   API, options)                                            |
                                                            v
[ Navegador Web ] <=====[ FUNCIÓN DE ESCAPE ]====== [ Impresión (echo) ]
  (Renderizado HTML)      (esc_html, esc_url...)

```

Nunca debes escapar un dato al momento de recuperarlo de la base de datos y guardarlo en una variable si vas a procesarlo más adelante. Si lo haces, corres el riesgo de que algún filtro posterior inyecte código malicioso o de que el escape interfiera con la lógica interna de PHP.

### Funciones principales de escape

El contexto en el que vas a imprimir el dato determina qué función debes utilizar. WordPress ofrece funciones específicas para cada escenario del HTML:

* **`esc_html( $texto )`**: Se utiliza cuando vas a imprimir texto plano entre etiquetas HTML. Convierte caracteres especiales (`<`, `>`, `&`, `"`, `'`) en sus correspondientes entidades HTML para que el navegador los interprete como texto y no como código ejecutable.
* **`esc_attr( $atributo )`**: Diseñada para imprimir valores dentro de los atributos de una etiqueta HTML, como `class`, `id`, `alt`, `title` o `data-*`. Es muy similar a `esc_html`, pero optimizada para este contexto.
* **`esc_url( $url )`**: Indispensable para cualquier enlace (`href`) o fuente de archivo (`src`). Rechaza protocolos peligrosos (como `javascript:` o `vbscript:`), elimina caracteres inválidos y codifica correctamente la URL.
* **`esc_js( $javascript )`**: Prepara texto para ser utilizado de forma segura como valor dentro de un bloque en línea de JavaScript, escapando comillas y caracteres especiales que podrían romper la sintaxis del script.
* **`esc_textarea( $texto )`**: Específica para imprimir valores por defecto dentro de un elemento `<textarea>`.

### Integración con la internacionalización (L10n)

Como desarrollador de themes, la mayor parte de las cadenas de texto estáticas que imprimas estarán preparadas para ser traducidas (un tema que abordaremos a fondo en el Capítulo 18). WordPress combina brillantemente el escape y la traducción en funciones unificadas para que tu código sea seguro y multilingüe al mismo tiempo:

* `esc_html__( 'Texto', 'textdomain' )`: Traduce y luego aplica `esc_html()`.
* `esc_html_e( 'Texto', 'textdomain' )`: Traduce, aplica `esc_html()` y hace `echo` automáticamente.
* `esc_attr__( 'Atributo', 'textdomain' )`: Traduce y luego aplica `esc_attr()`.
* `esc_attr_e( 'Atributo', 'textdomain' )`: Traduce, aplica `esc_attr()` y hace `echo` automáticamente.

### Ejemplo de implementación en una plantilla

Para comprender la importancia del contexto, observa cómo un mismo conjunto de datos provenientes de la base de datos se escapa de formas distintas dependiendo de dónde se ubica en el HTML:

```php
<?php
// Obtenemos datos de la base de datos (NO escapamos aquí)
$url_perfil = get_user_meta( $user_id, 'profile_link', true );
$clase_css  = get_option( 'theme_custom_class', 'perfil-default' );
$biografia  = get_user_meta( $user_id, 'biography', true );
$nombre     = get_the_author_meta( 'display_name', $user_id );
?>

<div class="<?php echo esc_attr( $clase_css ); ?>" id="usuario-<?php echo absint( $user_id ); ?>">
    
    <h2>
        <?php 
        // Texto entre etiquetas: usamos esc_html
        echo esc_html( $nombre ); 
        ?>
    </h2>

    <a href="<?php echo esc_url( $url_perfil ); ?>" class="btn-perfil">
        <?php 
        // Cadena estática traducible impresa entre etiquetas
        esc_html_e( 'Visitar Perfil', 'mi-tema' ); 
        ?>
    </a>

    <div class="bio">
        <?php 
        // Si la biografía permite HTML básico, no usamos esc_html() porque 
        // imprimiría las etiquetas literalmente. Usamos wp_kses_post().
        echo wp_kses_post( $biografia ); 
        ?>
    </div>

</div>

```

En el ejemplo anterior, si la variable `$clase_css` contuviera un valor malicioso como `perfil"><script>alert('XSS')</script>`, la función `esc_attr()` neutralizaría las comillas y los signos de mayor/menor, convirtiendo el intento de inyección en un simple texto estático inofensivo.

Acostumbrarte a mirar cada bloque `<?php echo ... ?>` en tus archivos y asegurarte de que contenga una función de escape es, probablemente, el hábito más importante que puedes cultivar en el desarrollo seguro para WordPress.

## 16.3 Uso de Nonces en formularios

Mientras que la sanitización y el escape (que vimos en las secciones anteriores) protegen tu sitio contra la inyección de código (XSS y SQLi), los **Nonces** son tu defensa principal contra los ataques de Falsificación de Petición en Sitios Cruzados, conocidos como **CSRF** (Cross-Site Request Forgery).

Un ataque CSRF ocurre cuando un atacante engaña a un usuario autenticado (por ejemplo, un administrador que tiene su sesión abierta) para que haga clic en un enlace malicioso o envíe un formulario oculto en otro sitio web. Si tu theme expone una URL o un formulario que ejecuta una acción sensible sin verificar su procedencia, el atacante podría usar la sesión del administrador para borrar contenido o cambiar configuraciones.

Aquí es donde entra el *Nonce* ("Number Used Once" o Número Usado Una Vez). En WordPress, un nonce es un token criptográfico temporal y único que se genera para un usuario específico, una acción específica y un marco de tiempo específico.

### El flujo de seguridad con Nonces

```text
[ Acción del Usuario ] ---> Genera formulario con token oculto (El Nonce)
                                     |
                                     v
[ Envío de Datos ] -------> Petición POST incluye datos + Nonce
                                     |
                                     v
[ Lógica de WordPress ] --> 1. Verifica si el Nonce existe.
                            2. Verifica si el Nonce es válido para esta acción y usuario.
                                     |
                          +----------+----------+
                          |                     |
                     [ VÁLIDO ]            [ INVÁLIDO ]
                          |                     |
                  Ejecuta la acción      Detiene la ejecución
                 (Procesa el form)       (Fallo de seguridad)

```

*Nota técnica:* A diferencia del concepto criptográfico estricto, los nonces en WordPress no se destruyen inmediatamente tras su primer uso. Tienen un ciclo de vida predeterminado de 24 horas, pero su seguridad radica en que están atados matemáticamente al ID del usuario, a la sesión actual y al nombre de la acción.

### Generación de Nonces

Dependiendo de cómo estés enviando los datos, WordPress ofrece diferentes funciones para generar este token:

1. **En formularios HTML estándar:**
Utiliza la función `wp_nonce_field( $action, $name )`. Esta función imprime directamente campos `<input type="hidden">` con el token y la URL de referencia.
2. **En peticiones AJAX o APIs:**
Utiliza `wp_create_nonce( $action )`. Esta función solo devuelve la cadena de texto del token, ideal para enviarla como variable en tu archivo JavaScript.
3. **En enlaces (URLs):**
Utiliza `wp_nonce_url( $actionurl, $action )`. Añade el token como un parámetro `_wpnonce` en la cadena de consulta de la URL.

### Verificación de Nonces

Cuando tu servidor recibe la petición, debes verificar el token antes de sanitizar o guardar cualquier dato.

* **`wp_verify_nonce( $nonce, $action )`**: La función más versátil. Devuelve `1` si el nonce se generó en las últimas 12 horas, `2` si fue entre 12 y 24 horas, y `false` si es inválido.
* **`check_admin_referer( $action, $name )`**: Se usa principalmente en el backend. Verifica el nonce y, si falla, detiene la ejecución (hace un `die()`) mostrando la clásica pantalla de error de WordPress "El enlace que has seguido ha caducado".
* **`check_ajax_referer( $action, $name )`**: Similar a la anterior, pero optimizada para endpoints AJAX.

### Ejemplo práctico: Formulario seguro en el Frontend

Imaginemos que en nuestro theme hemos creado un formulario en el frontend para que los usuarios registrados puedan actualizar su nombre de visualización. Así es como se estructuran las dos partes (el renderizado y el procesamiento):

**1. El renderizado del formulario (HTML/PHP):**

```php
<form action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" method="POST">
    
    <?php wp_nonce_field( 'actualizar_nombre_usuario', 'mi_tema_nombre_nonce' ); ?>
    
    <input type="hidden" name="action" value="actualizar_perfil_tema">
    
    <label for="nuevo_nombre">Tu nuevo nombre:</label>
    <input type="text" name="nuevo_nombre" id="nuevo_nombre" required>
    
    <button type="submit">Actualizar Perfil</button>
</form>

```

**2. El procesamiento de los datos (en `functions.php`):**

```php
add_action( 'admin_post_actualizar_perfil_tema', 'mi_tema_procesar_actualizacion_perfil' );

function mi_tema_procesar_actualizacion_perfil() {
    
    // 1. Verificamos que el Nonce exista en la petición POST
    if ( ! isset( $_POST['mi_tema_nombre_nonce'] ) ) {
        wp_die( 'Petición no válida. Falta el token de seguridad.' );
    }

    // 2. Verificamos la validez del Nonce
    // Si falla, wp_verify_nonce devuelve false y detenemos el script
    if ( ! wp_verify_nonce( $_POST['mi_tema_nombre_nonce'], 'actualizar_nombre_usuario' ) ) {
        wp_die( 'Fallo de seguridad. El token ha expirado o es incorrecto.' );
    }

    // 3. Verificamos que el usuario tenga permisos (opcional pero recomendado)
    if ( ! is_user_logged_in() ) {
        wp_die( 'Debes iniciar sesión para realizar esta acción.' );
    }

    // --- Si llegamos aquí, la petición es legítima y 100% segura ---

    // 4. Sanitizamos la entrada (Aplicamos lo aprendido en 16.1)
    $nuevo_nombre = sanitize_text_field( $_POST['nuevo_nombre'] );
    
    // 5. Procesamos el dato (Actualizamos el usuario)
    $user_id = get_current_user_id();
    wp_update_user( [
        'ID'           => $user_id,
        'display_name' => $nuevo_nombre
    ] );

    // 6. Redirigimos al usuario con un mensaje de éxito
    wp_redirect( home_url( '/perfil-actualizado/' ) );
    exit;
}

```

Implementar nonces requiere apenas dos líneas de código (una para crearlo y otra para verificarlo), pero marca la diferencia entre un theme vulnerable que expone a sus usuarios y un producto profesional preparado para su distribución oficial.

## 16.4 Verificación de roles y permisos

La última capa de la estrategia de seguridad en WordPress consiste en garantizar que solo los usuarios autorizados puedan ejecutar ciertas acciones o visualizar información sensible. En el desarrollo web, solemos confundir dos conceptos fundamentales: la **autenticación** (verificar quién es el usuario) y la **autorización** (verificar qué puede hacer ese usuario).

WordPress maneja la autorización mediante un sistema muy robusto de **Roles y Capacidades** (*Roles and Capabilities*).

### La regla de oro: Verifica capacidades, no roles

Un error clásico en el desarrollo de themes es verificar el rol del usuario directamente, por ejemplo, comprobando si el usuario es un "Administrador" o un "Editor". Esta práctica es frágil porque los roles en WordPress son mutables; los administradores de los sitios suelen usar plugins para crear roles personalizados o modificar los permisos de los roles existentes.

En lugar de preguntar *"¿Quién es el usuario?"*, tu código siempre debe preguntar *"¿Qué puede hacer el usuario?"*.

```text
Estructura de Autorización en WordPress:

[ Usuario (ID: 5) ] ---> Tiene asignado un ---> [ Rol (ej. Editor) ]
                                                       |
                                                       v
                                               Agrupa múltiples
                                                       |
                                                       v
                                         [ Capacidades (Capabilities) ]
                                         - edit_posts
                                         - delete_others_posts
                                         - upload_files

```

### La función `current_user_can()`

Esta es la función principal que utilizarás para la verificación de permisos. Recibe como argumento una cadena de texto con el nombre de la capacidad y devuelve `true` si el usuario actual posee dicha capacidad, o `false` en caso contrario.

Aquí tienes algunas de las capacidades más utilizadas al desarrollar themes:

* **`manage_options`**: Generalmente reservada para administradores. Úsala cuando quieras proteger áreas de configuración del theme o endpoints AJAX que guarden ajustes globales.
* **`edit_posts`**: Típicamente asignada a Autores y Editores. Útil para mostrar enlaces de edición en el frontend.
* **`edit_theme_options`**: Capacidad específica para poder acceder al Customizer o modificar menús y widgets.
* **`read`**: La capacidad más básica, la poseen los Suscriptores. Sirve para verificar que un usuario simplemente ha iniciado sesión en un sitio estándar.

### Implementación en el Frontend

En el desarrollo de un theme, a menudo querrás mostrar elementos de la interfaz condicionalmente basados en los permisos. Por ejemplo, mostrar un botón de "Editar entrada" directamente en la plantilla `single.php` para que el autor no tenga que ir al panel de administración para encontrar el post.

WordPress nos permite pasar el ID de un post específico a `current_user_can()` para verificar si el usuario tiene permiso para editar *esa entrada en particular*, no solo entradas en general.

```php
<?php 
// Dentro de The Loop en single.php
$post_id = get_the_ID(); 
?>

<article id="post-<?php echo esc_attr( $post_id ); ?>" <?php post_class(); ?>>
    <header class="entry-header">
        <?php the_title( '<h1 class="entry-title">', '</h1>' ); ?>
        
        <?php 
        // Verificamos si el usuario actual tiene la capacidad de editar ESTA entrada
        if ( current_user_can( 'edit_post', $post_id ) ) : 
        ?>
            <div class="theme-admin-actions">
                <a href="<?php echo esc_url( get_edit_post_link( $post_id ) ); ?>" class="btn-editar">
                    <?php esc_html_e( 'Editar esta entrada', 'mi-tema' ); ?>
                </a>
            </div>
        <?php endif; ?>
    </header>

    <div class="entry-content">
        <?php the_content(); ?>
    </div>
</article>

```

### Protección de lógicas sensibles (Endpoints y AJAX)

Cuando tu theme expone rutas personalizadas, procesa formularios (como vimos en la sección anterior con `admin_post_*`) o maneja peticiones AJAX, la verificación de capacidades debe ser el primer filtro lógico después de validar el Nonce.

Observa cómo se integran los cuatro pilares de seguridad (Sanitización, Escape, Nonces y Capacidades) en este flujo de ejemplo para guardar una opción del theme:

```php
function mi_tema_guardar_color_personalizado() {
    
    // 1. Verificamos el Nonce (Protección CSRF)
    if ( ! isset( $_POST['_wpnonce'] ) || ! wp_verify_nonce( $_POST['_wpnonce'], 'guardar_color' ) ) {
        wp_send_json_error( 'Fallo de seguridad en el token.' );
    }

    // 2. Verificamos las CAPACIDADES (Protección de Autorización)
    if ( ! current_user_can( 'edit_theme_options' ) ) {
        wp_send_json_error( 'No tienes permisos para cambiar opciones del tema.' );
    }

    // 3. SANITIZAMOS la entrada (Protección de Inyección/XSS Almacenado)
    $nuevo_color = sanitize_hex_color( $_POST['color'] );

    if ( ! $nuevo_color ) {
        wp_send_json_error( 'Formato de color inválido.' );
    }

    // Ejecutamos la acción segura
    update_option( 'mi_tema_color_principal', $nuevo_color );
    
    // 4. (El ESCAPE se aplicaría posteriormente, cuando este color se imprima en el head del frontend)

    wp_send_json_success( 'Color guardado con éxito.' );
}
add_action( 'wp_ajax_guardar_color_tema', 'mi_tema_guardar_color_personalizado' );

```

## Resumen del capítulo

La seguridad en el desarrollo de themes no es un paso final ni una auditoría de último minuto; es un conjunto de hábitos que debes aplicar en cada línea de código que interactúa con datos dinámicos. En este capítulo hemos establecido las cuatro barreras fundamentales de protección:

1. **Sanitización (16.1):** Limpiamos todo dato que entra a nuestro sistema (`$_POST`, `$_GET`, etc.) utilizando funciones como `sanitize_text_field()` o `absint()`. Nunca confiamos en el usuario.
2. **Escape (16.2):** Protegemos el navegador de nuestros visitantes limpiando los datos en el último milisegundo posible antes de imprimirlos con `echo`, usando el contexto adecuado (`esc_html`, `esc_url`, `esc_attr`).
3. **Nonces (16.3):** Evitamos los ataques CSRF utilizando tokens criptográficos temporales (`wp_nonce_field`, `wp_verify_nonce`) para asegurar que una petición fue intencionada y originada desde nuestro propio sitio.
4. **Permisos (16.4):** Protegemos las acciones y la interfaz de usuario comprobando siempre las capacidades (`current_user_can`) y nunca dependiendo de los roles explícitos, asegurando que cada usuario solo vea y ejecute lo que le corresponde.
