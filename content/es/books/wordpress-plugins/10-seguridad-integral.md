La seguridad no es una característica opcional que se añade al final del desarrollo; es el cimiento sobre el cual se construye cualquier plugin profesional. En este capítulo, aprenderás a blindar tu código contra las vulnerabilidades más críticas y comunes del ecosistema web.

Adoptando una mentalidad de confianza cero, exploraremos las técnicas indispensables para limpiar la información entrante mediante la sanitización, neutralizar ataques XSS escapando los datos de forma tardía en la salida, y bloquear falsificaciones de peticiones (CSRF) utilizando Nonces. Al finalizar, tendrás las herramientas exactas para desarrollar soluciones robustas y seguras.

## 10.1 Principios de confianza cero

En el desarrollo de software, el modelo de "Confianza Cero" (Zero Trust) se originó como una arquitectura de red basada en la premisa de "nunca confiar, siempre verificar". Aplicado al desarrollo de plugins para WordPress, este paradigma se traduce en una regla de oro inquebrantable: **ningún dato, independientemente de su origen, es seguro por defecto.**

Como desarrolladores, es común caer en la trampa de confiar en los datos simplemente porque provienen de un usuario autenticado, de nuestra propia base de datos, o de la API de un tercero conocido. En el ecosistema de WordPress, asumir que un administrador no inyectará código malicioso o que los datos recuperados de la tabla `wp_options` son seguros para imprimirse directamente en pantalla, es la principal causa de vulnerabilidades como XSS (Cross-Site Scripting) e Inyecciones SQL.

### Los pilares de la Confianza Cero en WordPress

Para construir un plugin robusto, debes internalizar cuatro principios fundamentales que guiarán el resto de este capítulo:

1. **Toda entrada es maliciosa (All Input is Evil):** Cualquier dato que provenga de variables superglobales de PHP (`$_POST`, `$_GET`, `$_REQUEST`, `$_COOKIE`, `$_SERVER`), de peticiones de la REST API (Capítulo 13), o de integraciones de terceros, debe ser tratado como una amenaza inminente.
2. **El origen no garantiza la integridad:** Incluso los datos extraídos de la propia base de datos de WordPress (`$wpdb`) no deben ser considerados seguros al momento de imprimirlos. Si un atacante logró saltarse una validación e insertó un script malicioso hace un mes, confiar en ese dato hoy al renderizar el front-end ejecutará el ataque (XSS persistente).
3. **Principio de Menor Privilegio (PoLP):** Tu código solo debe ejecutar y conceder los permisos estrictamente necesarios. No confíes en que la interfaz de usuario ocultará opciones sensibles a usuarios sin privilegios; verifica siempre los permisos a nivel de código antes de procesar una acción.
4. **Defensa en profundidad:** No dependas de una sola barrera. Valida el formato del dato, sanitízalo antes de guardarlo, verifica la intención de la acción (Nonces) y escapa el dato justo en el momento de imprimirlo.

### Diagrama del flujo de Confianza Cero

El siguiente esquema ilustra cómo debe viajar la información dentro de tu plugin adoptando esta filosofía, creando múltiples puntos de control:

```text
+-------------------+        [1. Verificar Origen e Intención]
| Origen del Dato   |        (Nonces y Capacidades - Cap. 10.4 / 12)
| (Formulario, API, | -------------------------------------------------+
| URL, DB, etc.)    |                                                  |
+-------------------+                                                  v
                                                           [2. Validar Formato]
                                                           (¿Es un email? ¿Es un int?)
                                                                       |
+-------------------+        [4. Escapar (Late Escaping)]              v
| Salida / Pantalla |        (Evitar ejecución de código)  [3. Sanitizar (Early Sanitize)]
| (HTML, JSON,      | <----------------------------------  (Limpiar tags o caracteres)
| Atributos)        |                                                  |
+-------------------+                                                  v
                                                           +-------------------+
                                                           | Procesamiento /   |
                                                           | Base de Datos     |
                                                           | (wpdb->prepare)   |
                                                           +-------------------+

```

### La diferencia de mentalidad en el código

Observa cómo cambia la estructura de un simple bloque de código que procesa un formulario cuando aplicamos la mentalidad de confianza cero.

**Enfoque tradicional (Vulnerable y confiado):**

```php
// ASUME: Que la petición es legítima.
// ASUME: Que el usuario tiene permisos porque vio el formulario.
// ASUME: Que el campo 'color_favorito' es un texto inofensivo.

function procesar_color_usuario() {
    if ( isset( $_POST['color_favorito'] ) ) {
        $color = $_POST['color_favorito']; 
        $user_id = get_current_user_id();
        
        // Peligro: Guardado directo de una superglobal
        update_user_meta( $user_id, 'color_preferido', $color );
        
        // Peligro: Impresión directa sin escapar
        echo "<p>Tu color guardado es: " . $color . "</p>"; 
    }
}
add_action( 'admin_init', 'procesar_color_usuario' );

```

**Enfoque de Confianza Cero (Zero Trust):**

```php
function procesar_color_usuario_seguro() {
    // 1. Verificar si realmente se envió el dato que esperamos
    if ( ! isset( $_POST['color_favorito'] ) ) {
        return;
    }

    // 2. Verificar intención y origen (Nonces)
    if ( ! isset( $_POST['color_nonce'] ) || ! wp_verify_nonce( $_POST['color_nonce'], 'guardar_color' ) ) {
        wp_die( 'Petición no autorizada.' );
    }

    // 3. Verificar privilegios: ¿Tiene este usuario permiso para esto?
    if ( ! current_user_can( 'edit_user', get_current_user_id() ) ) {
        wp_die( 'No tienes permisos suficientes.' );
    }

    // 4. Validar y Sanitizar (Limpieza temprana)
    // No confiamos en lo que escribió el usuario, forzamos que sea un string seguro.
    $color_seguro = sanitize_text_field( wp_unslash( $_POST['color_favorito'] ) );

    // 5. Almacenamiento
    update_user_meta( get_current_user_id(), 'color_preferido', $color_seguro );

    // 6. Escapar (Escapado tardío)
    // No confiamos en la variable $color_seguro solo porque la acabamos de limpiar.
    // La regla es: si va a HTML, se escapa para HTML.
    echo "<p>Tu color guardado es: " . esc_html( $color_seguro ) . "</p>";
}
add_action( 'admin_init', 'procesar_color_usuario_seguro' );

```

Al adoptar la confianza cero, cambias el enfoque de "protegerte contra ataques conocidos" a "desconfiar de cualquier operación no validada explícitamente". Este es el cimiento sobre el cual se construyen las funciones técnicas de sanitización y escapado que exploraremos en las siguientes secciones.

## 10.2 Funciones de sanitización

La sanitización es la primera línea de defensa activa en el procesamiento de datos. Su objetivo es asegurar que la información recibida se ajusta estrictamente al formato esperado, eliminando cualquier carácter, etiqueta o script malicioso antes de que el dato sea procesado, guardado en la base de datos o enviado a una API externa.

Si recordamos el diagrama de confianza cero de la sección anterior, la sanitización ocurre en la etapa de "Limpieza temprana" (Early Sanitize).

### Principales funciones de sanitización en WordPress

WordPress proporciona un extenso catálogo de funciones nativas para limpiar casi cualquier tipo de dato. Usar las funciones del núcleo no solo garantiza seguridad, sino que asegura compatibilidad y estandarización dentro del ecosistema.

#### 1. Cadenas de texto simples

La función más utilizada. `sanitize_text_field()` elimina etiquetas HTML, saltos de línea, tabulaciones y espacios en blanco adicionales. Es ideal para nombres, títulos y campos de texto de un formulario estándar.

```php
// Entrada maliciosa imaginaria: "<script>alert('xss');</script> Hola   Mundo"
$texto_limpio = sanitize_text_field( $_POST['nombre_usuario'] );
// Resultado: "alert('xss'); Hola Mundo" (Las etiquetas del script son eliminadas)

```

#### 2. Áreas de texto (Múltiples líneas)

A diferencia de la anterior, `sanitize_textarea_field()` preserva los saltos de línea (`\n`), lo que la hace obligatoria para campos como biografías, comentarios o descripciones largas introducidas en un `<textarea>`.

```php
$descripcion_limpia = sanitize_textarea_field( $_POST['descripcion_larga'] );

```

#### 3. Correos electrónicos

`sanitize_email()` elimina caracteres que no están permitidos en una dirección de correo electrónico según los estándares de internet. Cabe destacar que esta función **no verifica** si el correo existe o es válido, únicamente limpia su formato estructural.

```php
$email_limpio = sanitize_email( $_POST['email_contacto'] );

```

#### 4. Números enteros

Para IDs de posts, cantidades, o cualquier valor que deba ser estrictamente numérico.

* `absint()`: Garantiza un número entero absoluto (siempre mayor o igual a cero). Es la función predilecta para sanitizar IDs.
* `intval()`: Convierte el valor a un entero, pero permite números negativos.

```php
$post_id = absint( $_GET['post_id'] ); // Si recibe "-5" o "abc", devuelve 5 y 0 respectivamente.
$diferencia = intval( $_POST['variacion_stock'] ); // Permite valores como -10.

```

#### 5. Claves y slugs

`sanitize_key()` convierte toda la cadena a minúsculas, reemplaza espacios por guiones y elimina caracteres especiales. Es fundamental al guardar opciones en la base de datos, registrar nombres de Custom Post Types o definir *meta keys*.

```php
// Entrada: "Mi Opcion Especial!"
$clave_limpia = sanitize_key( $_POST['nombre_opcion'] );
// Resultado: "mi_opcion_especial"

```

#### 6. HTML Permitido (KSES)

Cuando necesitas que el usuario pueda introducir HTML legítimo (como al usar un editor WYSIWYG en tu plugin), no puedes usar `sanitize_text_field` porque destruiría el formato. Para esto, WordPress utiliza su motor KSES (*KSES Strips Evil Scripts*).

* `wp_kses_post()`: Permite el mismo HTML que WordPress autoriza por defecto en el contenido de una entrada (párrafos, negritas, enlaces, imágenes).
* `wp_kses()`: Permite definir un array estricto de etiquetas y atributos exactos que quieres autorizar, otorgando un control granular.

```php
// Ejemplo de sanitización estricta y personalizada
$html_permitido = array(
    'a' => array(
        'href'  => array(),
        'title' => array()
    ),
    'strong' => array(),
    'em'     => array()
);

$comentario_limpio = wp_kses( $_POST['comentario_html'], $html_permitido );

```

### Función auxiliar: wp_unslash()

Por motivos de compatibilidad histórica, WordPress añade automáticamente barras invertidas (slashes) a las variables superglobales (`$_POST`, `$_GET`, `$_REQUEST`, `$_COOKIE`) imitando una directiva obsoleta de PHP llamada *magic_quotes_gpc*.

Antes de sanitizar cualquier dato proveniente de una superglobal, **siempre** debes eliminar estas barras invertidas. Si no lo haces, corres el riesgo de que las comillas escapadas (ej. `\'`) se guarden literalmente en la base de datos o corrompan la cadena durante el proceso de sanitización.

**El patrón estándar de sanitización siempre sigue esta estructura:**

```php
// 1. Deshacer el auto-slash del núcleo de WordPress
$dato_crudo = wp_unslash( $_POST['mi_campo'] );

// 2. Aplicar la función de sanitización correspondiente
$dato_seguro = sanitize_text_field( $dato_crudo );

// Práctica recomendada (Versión compacta):
$dato_seguro = sanitize_text_field( wp_unslash( $_POST['mi_campo'] ) );

```

### Tabla de referencia rápida

| Tipo de Dato Esperado | Función Recomendada | Notas de comportamiento |
| --- | --- | --- |
| Texto simple (Input text) | `sanitize_text_field()` | Elimina etiquetas HTML y aplana saltos de línea. |
| Texto largo (Textarea) | `sanitize_textarea_field()` | Elimina etiquetas HTML, pero conserva saltos de línea. |
| Correo Electrónico | `sanitize_email()` | Limpia caracteres no válidos para un email. |
| Número positivo / ID | `absint()` | Convierte a entero absoluto (siempre $\ge$ 0). |
| HTML genérico | `wp_kses_post()` | Seguro para contenido enriquecido tipo post. |
| Claves (Options/Meta) | `sanitize_key()` | Fuerza minúsculas, guiones bajos, y elimina espacios. |

La sanitización garantiza que el dato que viaja hacia tu base de datos o lógica de negocio es predecible, limpio y seguro. Sin embargo, esto no protege contra la ejecución de scripts al momento de imprimir esos mismos datos de vuelta en la pantalla del usuario. Esa responsabilidad vital recae sobre el escapado de datos.

## 10.3 Escape de datos en la salida

Si la sanitización (sección 10.2) es la protección de tu base de datos contra datos entrantes maliciosos, el **escape de datos** es el escudo que protege a los usuarios (y a sus navegadores) cuando tu plugin imprime información en la pantalla.

El escape es el proceso de asegurar los datos justo antes de que se rendericen en el front-end o en el panel de administración, neutralizando cualquier carácter especial que el navegador pudiera interpretar erróneamente como código ejecutable (principalmente HTML o JavaScript). Esto es vital para prevenir ataques de Cross-Site Scripting (XSS).

### El principio de "Late Escaping" (Escape tardío)

En el desarrollo para WordPress, existe una regla fundamental: **escapa lo más tarde posible**.

Nunca debes escapar los datos antes de guardarlos en la base de datos ni al principio de una función. El escape debe ocurrir en el instante exacto en que utilizas `echo`, `print` o retornas el dato en una vista. Esto asegura que el contexto de salida es claro y que los datos en la base de datos se mantienen en su forma pura, listos para ser utilizados en otros contextos si fuera necesario (por ejemplo, enviados a una API JSON en lugar de impresos en HTML).

### Funciones principales de escape

WordPress provee funciones específicas dependiendo del contexto exacto en el que el dato será inyectado dentro del documento HTML. Usar la función equivocada puede romper el diseño o dejar una vulnerabilidad abierta.

#### 1. escape genérico de texto: `esc_html()`

Se utiliza en cualquier situación donde el dato va a ser mostrado dentro de una etiqueta HTML estándar (como `<div>`, `<p>`, `<span>`, `<h1>`, etc.). Esta función convierte los caracteres especiales (como `<` , `>`, `&`, `"`, `'`) en sus correspondientes entidades HTML.

```php
$nombre_usuario = get_user_meta( $user_id, 'nombre_perfil', true );

// Peligro: El usuario pudo haber saltado la sanitización.
// Seguro: Neutralizamos cualquier intento de XSS en la salida.
echo '<h3>Bienvenido, ' . esc_html( $nombre_usuario ) . '</h3>';

```

#### 2. Atributos HTML: `esc_attr()`

Cuando el dato se va a imprimir **dentro de un atributo** de una etiqueta HTML (como `value`, `class`, `id`, `title`, `placeholder`), debes usar `esc_attr()`. Los navegadores analizan los atributos de manera diferente al texto plano, por lo que esta función asegura que unas comillas maliciosas no "cierren" prematuramente el atributo e inyecten eventos JavaScript como `onmouseover` u `onclick`.

```php
$clase_css = get_option( 'mi_plugin_color_clase' );
$valor_input = 'O\'Brian'; // Ejemplo con comillas

// Uso correcto en atributos
echo '<div class="' . esc_attr( $clase_css ) . '">';
echo '<input type="text" name="apellido" value="' . esc_attr( $valor_input ) . '" />';

```

#### 3. Enlaces y URLs: `esc_url()`

Obligatorio para cualquier dato que se imprima dentro de los atributos `href` o `src`. Además de codificar caracteres especiales, `esc_url()` rechaza protocolos peligrosos (como `javascript:` o `vbscript:`), permitiendo únicamente los seguros (como `http`, `https`, `mailto`).

```php
$enlace_perfil = get_user_meta( $user_id, 'website_url', true );

// Inyección evitada: Si el enlace era "javascript:alert(1);"
// esc_url() lo saneará, haciéndolo inofensivo.
echo '<a href="' . esc_url( $enlace_perfil ) . '">Visitar web</a>';

```

#### 4. Áreas de texto: `esc_textarea()`

Específicamente diseñada para imprimir valores dentro de una etiqueta `<textarea>`. A diferencia de `esc_html`, maneja correctamente el contexto de texto multilínea y la codificación de entidades en este elemento particular.

```php
$biografia = get_user_meta( $user_id, 'bio_larga', true );

echo '<textarea name="bio">' . esc_textarea( $biografia ) . '</textarea>';

```

#### 5. JavaScript en línea: `esc_js()`

Si estás forzado a imprimir datos de PHP directamente dentro de un bloque `<script>` o un evento JS en línea, usa esta función. Codifica el texto para que pueda ser asignado de forma segura a una variable de JavaScript sin romper la sintaxis del script. *(Nota: La práctica recomendada es usar `wp_add_inline_script` o `wp_localize_script`, abordado en el Capítulo 7).*

```php
$mensaje = 'Operación completada con "éxito"';

echo '<script>';
echo 'var mensajeSistema = "' . esc_js( $mensaje ) . '";';
echo 'console.log(mensajeSistema);';
echo '</script>';

```

### Escape y Traducciones (i18n)

A menudo, las cadenas que necesitan ser escapadas también necesitan ser traducibles (algo que exploraremos en profundidad en el Capítulo 15). En lugar de anidar funciones como `echo esc_html( __( 'Mensaje', 'textdomain' ) )`, WordPress ofrece funciones combinadas para simplificar el código:

* `esc_html_e( 'Texto a traducir', 'textdomain' );` — Traduce, escapa para HTML y hace `echo`.
* `esc_html__( 'Texto a traducir', 'textdomain' );` — Traduce, escapa para HTML y retorna la cadena (`return`).
* `esc_attr_e( 'Atributo', 'textdomain' );` — Traduce, escapa para atributo y hace `echo`.

### Salida de HTML complejo

Si tu plugin necesita imprimir un bloque grande de datos que **debe** contener etiquetas HTML (por ejemplo, el contenido de un post o la salida de un editor WYSIWYG), `esc_html` no servirá porque convertiría las etiquetas en texto visible (imprimiría `<strong>Texto</strong>` literalmente en la pantalla).

En estos casos en la salida, se reutiliza el motor KSES que vimos en sanitización:

```php
$contenido_guardado = get_option( 'mensaje_personalizado_admin' );

// Permite HTML seguro (párrafos, negritas, enlaces) pero elimina scripts o iframes
echo wp_kses_post( $contenido_guardado );

```

El escape de datos nunca debe ser una idea de último momento. Aplicar rigurosamente el escape tardío en cada `echo` asegura que, incluso si un dato malicioso logró infiltrarse en tu base de datos, será completamente inofensivo cuando intente manifestarse en la pantalla del usuario.

## 10.4 Nonces: prevención de CSRF

El último pilar fundamental de la seguridad en WordPress es la protección contra ataques de falsificación de peticiones entre sitios, conocidos como CSRF (Cross-Site Request Forgery).

Un ataque CSRF ocurre cuando un usuario malintencionado engaña a un usuario autenticado (por ejemplo, un administrador) para que ejecute una acción no deseada sin su conocimiento. Dado que el administrador ya tiene una sesión iniciada y las cookies correspondientes en su navegador, si hace clic en un enlace malicioso, WordPress procesará la petición creyendo que es legítima.

### ¿Qué es un Nonce en WordPress?

Para mitigar esto, WordPress utiliza **Nonces** (*Number used ONCE*). Un nonce es un token de seguridad, un hash alfanumérico generado dinámicamente que se añade a las URLs o formularios.

A diferencia de la definición criptográfica estricta, los nonces en WordPress **no se usan una sola vez**. Tienen una vida útil predeterminada de 24 horas y están intrínsecamente ligados a:

1. El usuario actual (su ID y su sesión).
2. La acción específica que se está intentando realizar.
3. El marco de tiempo en el que se generó.

Si el token enviado no coincide con el esperado por el servidor, la petición se rechaza de inmediato.

### Flujo de un ataque CSRF frente a la protección con Nonce

```text
[ SIN NONCES: Escenario Vulnerable ]
Atacante -----> Crea URL: misitio.com/wp-admin/admin.php?action=borrar_tabla
Atacante -----> Envía email trampa al Administrador ("¡Mira esta foto!")
Administrador -> Hace clic estando logueado.
WordPress ----> Ve la cookie de Admin. Ejecuta "borrar_tabla". ¡Desastre!

[ CON NONCES: Escenario Seguro ]
Atacante -----> Crea URL: misitio.com/wp-admin/admin.php?action=borrar_tabla
Atacante -----> Envía email trampa al Administrador.
Administrador -> Hace clic estando logueado.
WordPress ----> Busca el parámetro $_GET['_wpnonce']. No existe o es incorrecto.
WordPress ----> Petición denegada ("Enlace caducado"). Sistema seguro.

```

### Implementación en tu Plugin

Implementar nonces requiere dos pasos inseparables: generarlos en la interfaz de usuario y verificarlos en la lógica de procesamiento.

#### 1. Generación del Nonce

Dependiendo de cómo se envíen los datos, usarás una función distinta para crear el token.

**En un formulario HTML:**
Usa `wp_nonce_field()`. Esta función imprime directamente dos campos ocultos (`<input type="hidden">`): uno para el nonce y otro para la URL de referencia (referer).

```php
<form method="post" action="">
    <?php wp_nonce_field( 'borrar_registro_15', 'mi_plugin_nonce' ); ?>
    
    <input type="hidden" name="registro_id" value="15">
    <input type="submit" value="Borrar Registro">
</form>

```

**En una URL (Enlaces directos):**
Usa `wp_nonce_url()`. Esta función añade el parámetro `_wpnonce` a una URL existente.

```php
$url_borrar = admin_url( 'admin.php?page=mi-plugin&action=borrar&id=15' );
// Genera: ...&action=borrar&id=15&_wpnonce=a1b2c3d4e5
$url_segura = wp_nonce_url( $url_borrar, 'borrar_registro_15' );

echo '<a href="' . esc_url( $url_segura ) . '">Borrar</a>';

```

#### 2. Verificación del Nonce

Nunca debes procesar una acción de guardado, actualización o borrado sin antes verificar el nonce.

**Para peticiones genéricas (Formularios o URLs):**
Usa `wp_verify_nonce()`. Devuelve `1` (si tiene menos de 12 horas), `2` (si tiene entre 12 y 24 horas) o `false` si es inválido.

```php
function procesar_borrado() {
    // 1. Verificamos que se haya enviado el nonce
    if ( ! isset( $_REQUEST['mi_plugin_nonce'] ) ) {
        wp_die( 'Petición rechazada: Falta el token de seguridad.' );
    }

    // 2. Verificamos la validez del nonce
    if ( ! wp_verify_nonce( $_REQUEST['mi_plugin_nonce'], 'borrar_registro_15' ) ) {
        wp_die( 'Petición rechazada: Token inválido o caducado.' );
    }

    // 3. Continuar con la sanitización y la lógica de negocio...
}

```

**Para el panel de administración (Verificación estricta):**
`check_admin_referer()` es una alternativa más estricta a `wp_verify_nonce`. Además de comprobar el nonce, verifica que la petición provenga de una página de administración de tu propio sitio web. Si falla, detiene la ejecución inmediatamente con la clásica pantalla de "El enlace ha caducado".

```php
// Comprueba el nonce $_POST['mi_plugin_nonce'] con la acción 'borrar_registro_15'
check_admin_referer( 'borrar_registro_15', 'mi_plugin_nonce' );

// Si llegamos a esta línea, la petición es segura.

```

*(Nota: Para peticiones AJAX, el núcleo de WordPress ofrece la función `check_ajax_referer()`, la cual fue cubierta en detalle en el Capítulo 9).*

Nombra siempre tus acciones de nonce de la manera más específica posible. Un nonce para `guardar_ajustes` es aceptable, pero un nonce llamado `borrar_registro_15` (donde 15 es un ID dinámico) es infinitamente más seguro, ya que asegura que un token comprometido solo serviría para afectar a ese registro en particular y a ningún otro.

## Resumen del capítulo

En este capítulo hemos abordado la seguridad integral, la cual no es una capa superficial que se añade al final del desarrollo, sino una metodología de trabajo constante.

* Comenzamos estableciendo el principio de **Confianza Cero (Zero Trust)**, asumiendo que toda entrada es potencialmente maliciosa y que el origen del dato no garantiza su integridad.
* Aprendimos a **sanitizar** los datos entrantes utilizando funciones como `sanitize_text_field()` y `absint()`, limpiando la información antes de procesarla.
* Vimos la importancia crítica del **escape tardío** (*late escaping*) mediante funciones como `esc_html()` y `esc_attr()`, neutralizando cualquier intento de inyección de código (XSS) justo en el momento de imprimir los datos en pantalla.
* Finalmente, aseguramos la **intención** del usuario implementando **Nonces**, bloqueando ataques CSRF mediante tokens temporales y verificando que cada petición destructiva o de modificación provenga genuinamente del panel de administración del usuario activo.
