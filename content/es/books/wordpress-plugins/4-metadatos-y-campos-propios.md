Las estructuras de datos nativas de WordPress a menudo resultan insuficientes para modelar requerimientos complejos. Este capítulo profundiza en la Metadata API, el motor que permite asociar información ilimitada y específica a entradas, usuarios y términos taxonómicos sin alterar la base de datos.

Aprenderás a construir Metaboxes personalizados para ofrecer una interfaz de administración profesional y a medida. Dominaremos el ciclo completo de vida de los datos: desde su presentación visual hasta la intercepción de peticiones, aplicando técnicas estrictas de sanitización, validación y persistencia segura para crear plugins verdaderamente robustos.

## 4.1 Introducción a la Metadata API

La Metadata API de WordPress es un subsistema estandarizado que permite asociar información adicional (metadatos) a los objetos principales del ecosistema. Como vimos en el capítulo anterior al construir Custom Post Types, la estructura nativa de la tabla `wp_posts` es rígida y está diseñada para almacenar datos genéricos (título, contenido, fecha, autor). Cuando necesitamos almacenar atributos específicos de nuestro modelo de negocio (por ejemplo, el "precio" de un CPT "Inmueble" o el "cargo" de un usuario), recurrimos a la API de metadatos.

En lugar de alterar el esquema de las tablas principales de la base de datos (una práctica totalmente desaconsejada en WordPress), la Metadata API utiliza un modelo de entidad-atributo-valor (EAV). Esto nos proporciona flexibilidad absoluta para escalar estructuras de datos dinámicamente.

### Arquitectura de almacenamiento

La API gestiona la persistencia de datos apoyándose en cuatro tablas específicas de la base de datos (profundizaremos en la clase `$wpdb` en el Capítulo 5). Cada tipo de objeto tiene su propia tabla de metadatos asociada, manteniendo un diseño relacional de "uno a muchos" (1:N):

```text
+----------------+       1:N       +-------------------+
| TABLA PRINCIPAL| <-------------+ | TABLA DE METADATA |
+----------------+                 +-------------------+
| ID (PK)        |                 | meta_id (PK)      |
| ...            |                 | object_id (FK)    |
|                |                 | meta_key          |
|                |                 | meta_value        |
+----------------+                 +-------------------+

Relaciones disponibles en el Core:
wp_posts    -> wp_postmeta
wp_users    -> wp_usermeta
wp_terms    -> wp_termmeta
wp_comments -> wp_commentmeta

```

### Operaciones CRUD y Funciones Principales

Aunque internamente el núcleo de WordPress utiliza funciones genéricas como `add_metadata()` o `Youtube()`, en el desarrollo diario de plugins utilizaremos las funciones envolventes (wrappers) específicas para cada tipo de objeto. Tomaremos los posts (aplicable a cualquier CPT) como referencia principal, ya que representan el caso de uso más frecuente.

#### 1. Creación (`add_post_meta`)

Agrega un nuevo par clave-valor a un post específico.

```php
add_post_meta( int $post_id, string $meta_key, mixed $meta_value, bool $unique = false );

```

El cuarto parámetro, `$unique`, es crucial. Si se establece en `true`, la función fallará si ya existe esa clave para ese post en particular. Si es `false` (por defecto), WordPress permite almacenar múltiples valores bajo la misma clave.

#### 2. Lectura (`get_post_meta`)

Recupera el valor de un metadato. Es la función que más utilizarás en el front-end de tu plugin.

```php
get_post_meta( int $post_id, string $meta_key = '', bool $single = false );

```

El parámetro `$single` dicta la estructura del retorno y es fuente de errores comunes:

* `$single = false` (Por defecto): Devuelve un **array** indexado con todos los valores encontrados para esa clave. Ideal si permitiste múltiples valores al guardar.
* `$single = true`: Devuelve un **string** (o el tipo de dato original des-serializado) con el primer valor coincidente.

#### 3. Actualización (`update_post_meta`)

Actualiza un metadato existente.

```php
update_post_meta( int $post_id, string $meta_key, mixed $meta_value, mixed $prev_value = '' );

```

**Nota de rendimiento:** `update_post_meta()` es extremadamente versátil. Si la clave no existe, internamente llama a `add_post_meta()`. Por tanto, a menos que necesites estrictamente registrar múltiples valores idénticos bajo la misma clave, acostúmbrate a usar `update_post_meta` por defecto para el guardado de datos, ahorrando validaciones previas de existencia.

#### 4. Borrado (`delete_post_meta`)

Elimina un registro de metadato de la base de datos.

```php
delete_post_meta( int $post_id, string $meta_key, mixed $meta_value = '' );

```

Si omites `$meta_value`, se borrarán todas las entradas con ese `$meta_key` para el post. Si lo especificas, solo se borrará la entrada que coincida exactamente con ese valor.

### Metadatos Ocultos y Serialización

Existen dos comportamientos automáticos en la Metadata API que debes dominar para mantener tu plugin limpio y eficiente:

* **Serialización automática:** No es necesario convertir arrays u objetos PHP a JSON antes de guardarlos. Si pasas un array en `$meta_value`, WordPress lo pasará automáticamente por la función `serialize()` de PHP antes de insertarlo en la base de datos, y utilizará `unserialize()` transparentemente al recuperarlo con `get_post_meta()`.
* **Claves privadas (Hidden Meta):** Por defecto, WordPress expone los metadatos de los posts en la caja metabox nativa de "Campos Personalizados" en la pantalla de edición. Para evitar que los administradores alteren accidentalmente los datos internos de tu plugin, debes prefijar tus claves con un guion bajo (`_`).

```php
// Metadato público: Visible en la UI nativa de campos personalizados
update_post_meta( $post_id, 'precio_inmueble', 250000 );

// Metadato privado: Oculto de la UI, exclusivo para el control de tu plugin
update_post_meta( $post_id, '_estado_sincronizacion', 'completado' );

```

En la siguiente sección, integraremos estas funciones directamente en la interfaz de administración creando Metaboxes personalizados, abandonando la interfaz genérica nativa a favor de una experiencia de usuario controlada y específica para nuestro plugin.

## 4.2 Creación de Metaboxes en el admin

Mientras que la Metadata API proporciona la capa de acceso a datos para leer y escribir información, los *Metaboxes* (cajas de meta) constituyen la capa de presentación. Son los paneles o módulos modulares que aparecen en las pantallas de edición de contenido (entradas, páginas o Custom Post Types) y permiten a los administradores o editores introducir esos metadatos a través de una interfaz gráfica estructurada.

En lugar de obligar al usuario a utilizar la caja genérica y propensa a errores de "Campos Personalizados" nativa de WordPress, la creación de un Metabox específico nos permite diseñar un formulario a medida, controlando la experiencia de usuario y preparando el terreno para la validación estricta de los datos.

### El Hook `add_meta_boxes`

Para inyectar nuestra interfaz en la pantalla de edición, WordPress expone el action hook `add_meta_boxes`. Este gancho se dispara cuando la pantalla de edición se está preparando, justo antes de renderizar los elementos estructurales.

```php
add_action( 'add_meta_boxes', 'mi_plugin_registrar_metaboxes' );

function mi_plugin_registrar_metaboxes() {
    // Aquí invocaremos add_meta_box()
}

```

### La función `add_meta_box`

Dentro de nuestro callback, utilizamos la función principal de esta API para registrar nuestro contenedor.

```php
add_meta_box(
    string $id,
    string $title,
    callable $callback,
    string|array|WP_Screen $screen = null,
    string $context = 'advanced',
    string $priority = 'default',
    array $callback_args = null
);

```

Analicemos los parámetros críticos:

* **`$id`**: Un identificador HTML único (atributo `id`) para la caja.
* **`$title`**: El título visible que aparecerá en la cabecera del Metabox.
* **`$callback`**: La función responsable de imprimir (hacer *echo*) el HTML del contenido del Metabox.
* **`$screen`**: El tipo de contenido donde debe aparecer. Puede ser un string (ej. `'post'`, `'page'`, `'mi_cpt'`) o un array de varios tipos de post.
* **`$context`**: Determina la posición del panel. Los valores comunes son `'normal'` (debajo del editor), `'side'` (en la columna lateral) y `'advanced'` (al final, similar a normal).
* **`$priority`**: El orden jerárquico dentro de su contexto (`'high'`, `'core'`, `'default'`, `'low'`).

### Distribución visual en la pantalla de edición

Para visualizar cómo los parámetros `$context` y `$priority` afectan el renderizado, este es el mapa estructural de la pantalla de edición:

```text
+---------------------------------------------------------+
|                  TÍTULO DEL POST                        |
+---------------------------------------------------------+
|                                        |                |
|                                        |  CONTEXT:      |
|           ÁREA DEL EDITOR              |  'side'        |
|                                        |                |
|                                        | +------------+ |
|                                        | | Metabox 3  | |
+----------------------------------------+ +------------+ |
| CONTEXT: 'normal'                      | | Metabox 4  | |
| +------------------------------------+ | +------------+ |
| | Metabox 1 (Priority: high)         | |                |
| +------------------------------------+ |                |
+----------------------------------------+                |
| CONTEXT: 'advanced'                    |                |
| +------------------------------------+ |                |
| | Metabox 2 (Priority: default)      | |                |
| +------------------------------------+ |                |
+----------------------------------------+----------------+

```

### Renderizado de la Interfaz (El Callback)

La función `$callback` definida en `add_meta_box` recibe automáticamente por parámetro el objeto `WP_Post` actual. Esto es vital, ya que nos permite recuperar (usando `get_post_meta()`) los metadatos previamente guardados para poblar los campos del formulario.

A continuación, implementamos un Metabox de ejemplo para un Custom Post Type ficticio llamado `inmueble`, capturando un precio:

```php
// 1. Registro del Metabox
add_action( 'add_meta_boxes', 'inmobiliaria_registrar_metabox_precio' );

function inmobiliaria_registrar_metabox_precio() {
    add_meta_box(
        'inmobiliaria_precio_box',           // ID único
        'Datos Financieros del Inmueble',    // Título visible
        'inmobiliaria_render_metabox_precio',// Callback de renderizado
        'inmueble',                          // Pantalla (CPT)
        'side',                              // Contexto (columna lateral)
        'high'                               // Prioridad
    );
}

// 2. Renderizado del HTML
function inmobiliaria_render_metabox_precio( $post ) {
    // Recuperar el valor existente, si lo hay. Note el uso del prefijo '_'
    $precio_actual = get_post_meta( $post->ID, '_inmueble_precio', true );
    
    // Campo Nonce (Crucial para la seguridad, se profundizará en el Cap 10)
    wp_nonce_field( 'guardar_precio_inmueble', 'inmueble_precio_nonce' );

    // Renderizar la estructura HTML
    ?>
    <div class="inmobiliaria-metabox-wrapper">
        <label for="inmueble_precio_input">
            <strong>Precio de Venta (USD):</strong>
        </label>
        <input 
            type="number" 
            id="inmueble_precio_input" 
            name="inmueble_precio" 
            value="<?php echo esc_attr( $precio_actual ); ?>" 
            class="widefat" 
            step="1000"
            style="margin-top: 8px;"
        />
        <p class="description">Introduzca el valor sin comas ni símbolos.</p>
    </div>
    <?php
}

```

En este punto, hemos logrado inyectar exitosamente nuestra interfaz en el panel de administración de WordPress. El atributo `name` de nuestro `<input>` está listo para enviar la información a través de la petición HTTP POST cuando el usuario haga clic en "Publicar" o "Actualizar". Sin embargo, el Metabox por sí solo es puramente visual; no guarda la información de forma automática. El proceso de interceptar esta petición, verificar la seguridad y almacenar los datos es el siguiente paso del ciclo de vida de los metadatos.

## 4.3 Guardado y validación de campos

Mostrar un campo de formulario en un Metabox es solo la mitad del trabajo. Cuando un usuario hace clic en el botón "Publicar" o "Actualizar" en WordPress, todos los datos de la pantalla de edición se envían al servidor mediante una petición HTTP POST. Sin embargo, WordPress no guardará los campos personalizados creados manualmente a menos que le indiquemos explícitamente cómo interceptar, procesar y almacenar esa información.

Para lograr esto, utilizamos el action hook `save_post`, que se dispara justo después de que el núcleo de WordPress haya insertado o actualizado los datos principales del post en la base de datos.

### El flujo de guardado seguro

Antes de capturar los datos y enviarlos ciegamente a la base de datos con `update_post_meta()`, debemos implementar una serie de validaciones estrictas. El guardado de metadatos es uno de los puntos de entrada más críticos para la seguridad de un plugin.

El ciclo de ejecución dentro de nuestro hook `save_post` debe seguir invariablemente esta arquitectura de compuertas lógicas:

```text
[Petición POST (Guardar/Actualizar)]
                 |
                 v
         (Hook: save_post)
                 |
  +--------------+--------------+
  | 1. Verificación de Nonce    | ---> [Inválido / Ausente] ---> Abortar
  +--------------+--------------+
                 | [Válido]
  +--------------+--------------+
  | 2. Ignorar Autoguardados    | ---> [Es Autoguardado] ------> Abortar
  +--------------+--------------+
                 | [No lo es]
  +--------------+--------------+
  | 3. Control de Capacidades   | ---> [Sin Permisos] ---------> Abortar
  +--------------+--------------+
                 | [Autorizado]
  +--------------+--------------+
  | 4. Validación / Sanitización| (Limpieza de los datos de $_POST)
  +--------------+--------------+
                 |
  +--------------+--------------+
  | 5. Persistencia (CRUD)      | (update_post_meta o delete_post_meta)
  +--------------+--------------+

```

### 1. El gancho `save_post`

Registramos nuestra función conectándola al hook. Es recomendable utilizar la variante específica del hook para nuestro Custom Post Type, `save_post_{post_type}`, para evitar que nuestra lógica se ejecute innecesariamente al guardar páginas o entradas regulares.

```php
// Conectar al hook general de guardado
add_action( 'save_post', 'inmobiliaria_guardar_metabox_precio' );

// O alternativamente, conectar solo cuando se guarda un 'inmueble' (Recomendado)
// add_action( 'save_post_inmueble', 'inmobiliaria_guardar_metabox_precio' );

```

### 2. Implementación de la rutina de guardado

A continuación, desarrollamos la función `inmobiliaria_guardar_metabox_precio()` aplicando el flujo de seguridad detallado en el diagrama. Retomaremos el campo `inmueble_precio` que creamos en el capítulo 4.2.

```php
function inmobiliaria_guardar_metabox_precio( $post_id ) {

    // 1. Verificación de Nonce
    // Comprobamos si nuestro campo nonce fue enviado y si es válido.
    if ( ! isset( $_POST['inmueble_precio_nonce'] ) || 
         ! wp_verify_nonce( $_POST['inmueble_precio_nonce'], 'guardar_precio_inmueble' ) ) {
        return $post_id;
    }

    // 2. Ignorar Autoguardados
    // WordPress guarda revisiones automáticamente por AJAX. No queremos validar ni 
    // guardar metadatos en estos ciclos incompletos.
    if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
        return $post_id;
    }

    // 3. Control de Capacidades
    // ¿Tiene este usuario el rol necesario para editar este contenido?
    if ( isset( $_POST['post_type'] ) && 'page' === $_POST['post_type'] ) {
        if ( ! current_user_can( 'edit_page', $post_id ) ) {
            return $post_id;
        }
    } else {
        if ( ! current_user_can( 'edit_post', $post_id ) ) {
            return $post_id;
        }
    }

    /* --- LLEGADOS A ESTE PUNTO, ES SEGURO PROCEDER --- */

    // 4. Validación y Sanitización
    // Nunca confíes en $_POST directamente. El capítulo 10 ahonda en la seguridad,
    // pero aquí aplicamos sanitización básica según el tipo de dato esperado.
    
    // Verificamos si la clave existe en el array POST
    if ( isset( $_POST['inmueble_precio'] ) ) {
        
        // Sanitizamos: Como esperamos un número (precio), forzamos a float o int.
        // También podríamos usar sanitize_text_field() si fuera un texto.
        $precio_sanitizado = floatval( $_POST['inmueble_precio'] );

        // Validación de negocio (Ej: el precio no puede ser negativo)
        if ( $precio_sanitizado < 0 ) {
            $precio_sanitizado = 0;
        }

        // 5. Persistencia
        // Actualizamos el metadato. Si el campo se vació, es mejor práctica borrarlo.
        if ( empty( $precio_sanitizado ) && $precio_sanitizado !== 0.0 ) {
            delete_post_meta( $post_id, '_inmueble_precio' );
        } else {
            update_post_meta( $post_id, '_inmueble_precio', $precio_sanitizado );
        }
    }
}

```

### Consideraciones sobre Validación vs Sanitización

Aunque a menudo se usan indistintamente, en la Metadata API cumplen roles diferentes:

* **Sanitización (Limpiar):** Modifica el dato de entrada para hacerlo seguro. En el ejemplo anterior, `floatval()` elimina cualquier inyección de código o texto indeseado, dejando solo una cifra decimal. Otras funciones útiles del core son `sanitize_text_field()`, `sanitize_email()`, o `wp_kses_post()`.
* **Validación (Comprobar):** Evalúa si el dato cumple las reglas de tu negocio antes de guardarlo. En nuestro código, comprobar que el precio no sea menor a cero es una validación. Si un dato no pasa la validación, puedes decidir guardar un valor por defecto o rechazar la actualización mediante el uso de transitorios (Transients) para mostrar un error en el panel de administración.

### Manejo de Arrays en Metadatos

Si tu Metabox utiliza campos de selección múltiple (como un `<select multiple>` o varios `<input type="checkbox">`), el dato en `$_POST` llegará como un array. Debes iterar sobre este array para sanitizar cada elemento individualmente antes de guardarlo. `update_post_meta()` puede recibir este array sanitizado directamente como `$meta_value` (recordemos que WordPress lo serializará automáticamente en la base de datos).

```php
// Ejemplo rápido de sanitización de un array
if ( isset( $_POST['inmueble_caracteristicas'] ) && is_array( $_POST['inmueble_caracteristicas'] ) ) {
    $caracteristicas_limpias = array_map( 'sanitize_text_field', $_POST['inmueble_caracteristicas'] );
    update_post_meta( $post_id, '_inmueble_caracteristicas', $caracteristicas_limpias );
}

```

## 4.4 Metadatos de usuarios y términos

A lo largo de este capítulo hemos utilizado los posts y Custom Post Types como el vehículo principal para explicar la Metadata API. Sin embargo, la verdadera potencia de este subsistema radica en su universalidad. La misma arquitectura y las mismas reglas de persistencia, serialización y caché se aplican a otros dos objetos fundamentales de WordPress: los usuarios y los términos (categorías, etiquetas y taxonomías personalizadas).

Comprender cómo interactuar con los metadatos de estos objetos te permitirá construir perfiles de usuario complejos y jerarquías de clasificación ricas en información.

### Metadatos de Usuarios (User Meta)

La tabla `wp_usermeta` almacena información adicional sobre los usuarios registrados. El propio núcleo de WordPress la utiliza intensivamente para guardar preferencias del panel, capacidades (roles) y colores de la interfaz.

Las funciones envolventes siguen exactamente la misma nomenclatura que las de los posts:

* `add_user_meta( $user_id, $meta_key, $meta_value, $unique )`
* `get_user_meta( $user_id, $meta_key, $single )`
* `update_user_meta( $user_id, $meta_key, $meta_value, $prev_value )`
* `delete_user_meta( $user_id, $meta_key, $meta_value )`

#### Interfaz y guardado en perfiles de usuario

Para añadir campos personalizados a la pantalla de edición de perfil (`profile.php` y `user-edit.php`), no utilizamos la API de Metaboxes. En su lugar, nos conectamos a ganchos de acción específicos para inyectar HTML tabular y para interceptar el guardado.

```php
// 1. Mostrar campos en el perfil (para el propio usuario y para administradores)
add_action( 'show_user_profile', 'mi_plugin_campos_perfil' );
add_action( 'edit_user_profile', 'mi_plugin_campos_perfil' );

function mi_plugin_campos_perfil( $user ) {
    $cargo = get_user_meta( $user->ID, '_cargo_profesional', true );
    ?>
    <h3>Información Profesional</h3>
    <table class="form-table">
        <tr>
            <th><label for="cargo_profesional">Cargo</label></th>
            <td>
                <input type="text" name="cargo_profesional" id="cargo_profesional" value="<?php echo esc_attr( $cargo ); ?>" class="regular-text" />
                <span class="description">Ej: Director de Marketing.</span>
            </td>
        </tr>
    </table>
    <?php
}

// 2. Guardar los campos del perfil
add_action( 'personal_options_update', 'mi_plugin_guardar_campos_perfil' );
add_action( 'edit_user_profile_update', 'mi_plugin_guardar_campos_perfil' );

function mi_plugin_guardar_campos_perfil( $user_id ) {
    // Verificación de capacidades
    if ( ! current_user_can( 'edit_user', $user_id ) ) {
        return false;
    }

    // Sanitización y guardado
    if ( isset( $_POST['cargo_profesional'] ) ) {
        $cargo_limpio = sanitize_text_field( $_POST['cargo_profesional'] );
        update_user_meta( $user_id, '_cargo_profesional', $cargo_limpio );
    }
}

```

### Metadatos de Términos (Term Meta)

Introducida formalmente en WordPress 4.4, la tabla `wp_termmeta` solucionó uno de los mayores problemas históricos del ecosistema: la incapacidad nativa de añadir atributos a categorías o taxonomías. Antes de esto, los desarrolladores debían recurrir a soluciones subóptimas, como almacenar arrays masivos en la tabla `wp_options`.

Hoy, la API refleja perfectamente la estructura que ya conocemos:

* `add_term_meta( $term_id, $meta_key, $meta_value, $unique )`
* `get_term_meta( $term_id, $meta_key, $single )`
* `update_term_meta( $term_id, $meta_key, $meta_value, $prev_value )`
* `delete_term_meta( $term_id, $meta_key, $meta_value )`

#### Integración visual en taxonomías

A diferencia de los posts (que usan metaboxes) y los usuarios (que usan una única página de perfil), las taxonomías tienen dos pantallas distintas donde debemos inyectar nuestros campos: la pantalla de creación rápida (en la lista de términos) y la pantalla de edición individual.

Los hooks de inyección son dinámicos, basados en el nombre de la taxonomía (ej. `category`, `post_tag`, o tu taxonomía personalizada como `ubicacion`).

```php
// Asumimos una taxonomía personalizada llamada 'ubicacion'

// 1. Mostrar campo en el formulario de creación (Añadir nueva ubicación)
add_action( 'ubicacion_add_form_fields', 'inmobiliaria_campo_color_ubicacion' );

function inmobiliaria_campo_color_ubicacion() {
    // Aquí el HTML no usa estructura de tabla
    ?>
    <div class="form-field">
        <label for="color_marcador">Color del Marcador en Mapa</label>
        <input type="text" name="color_marcador" id="color_marcador" value="" />
        <p>Código HEX (ej. #FF0000)</p>
    </div>
    <?php
}

// 2. Mostrar campo en el formulario de edición (Editar ubicación existente)
add_action( 'ubicacion_edit_form_fields', 'inmobiliaria_editar_color_ubicacion' );

function inmobiliaria_editar_color_ubicacion( $term ) {
    $color_actual = get_term_meta( $term->term_id, '_color_marcador', true );
    // Aquí el HTML SÍ usa estructura de tabla
    ?>
    <tr class="form-field">
        <th scope="row"><label for="color_marcador">Color del Marcador</label></th>
        <td>
            <input type="text" name="color_marcador" id="color_marcador" value="<?php echo esc_attr( $color_actual ); ?>" />
        </td>
    </tr>
    <?php
}

// 3. Guardar el metadato (hook para creación y edición)
add_action( 'created_ubicacion', 'inmobiliaria_guardar_color_ubicacion' );
add_action( 'edited_ubicacion', 'inmobiliaria_guardar_color_ubicacion' );

function inmobiliaria_guardar_color_ubicacion( $term_id ) {
    if ( isset( $_POST['color_marcador'] ) ) {
        // Usamos una función de sanitización específica para colores HEX
        $color_limpio = sanitize_hex_color( $_POST['color_marcador'] );
        update_term_meta( $term_id, '_color_marcador', $color_limpio );
    }
}

```

### Unificando el concepto

Para visualizar cómo el núcleo maneja internamente esta abstracción de metadatos, observa cómo todas las funciones envolventes terminan llamando a la misma lógica de bajo nivel del Core:

```text
[ Tu Plugin ]
     |
     +--> update_post_meta()  --+
     |                          |
     +--> update_user_meta()  --+--> update_metadata( $type, $id, $key, $value )
     |                          |             |
     +--> update_term_meta()  --+             v
                                     [ Capa de Caché de Objeto ]
                                              |
                                              v
                                       [ Base de Datos ]

```

Esta arquitectura garantiza que el rendimiento y la seguridad se mantengan consistentes sin importar a qué tipo de entidad estés añadiendo atributos personalizados.

## Resumen del capítulo

En este capítulo hemos profundizado en la Metadata API, el sistema que otorga verdadera flexibilidad de datos a WordPress sin alterar los esquemas de la base de datos principal:

1. **Introducción a la Metadata API:** Entendimos el modelo Entidad-Atributo-Valor (EAV) y cómo las funciones CRUD (`add_`, `get_`, `update_`, `delete_`) interactúan automáticamente con la serialización de PHP, ocultando datos de interfaces genéricas mediante el uso de claves privadas (con guion bajo).
2. **Creación de Metaboxes:** Abandonamos los "Campos Personalizados" nativos para construir interfaces a medida utilizando `add_meta_box()`, inyectando HTML específico en áreas estratégicas de la pantalla de edición de cualquier tipo de post.
3. **Guardado y validación:** Construimos el flujo crítico de seguridad atado al hook `save_post`. Implementamos compuertas lógicas (verificación de Nonces, autoguardados, y capacidades) antes de proceder a la indispensable sanitización y persistencia de la variable superglobal `$_POST`.
4. **Usuarios y Términos:** Extendimos nuestros conocimientos más allá de los posts, aplicando la misma filosofía de metadatos para enriquecer perfiles de usuario (`wp_usermeta`) y jerarquías taxonómicas (`wp_termmeta`), utilizando los ganchos de acción de perfil y taxonomía apropiados para renderizar y guardar la información.
