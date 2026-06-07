El control de acceso es el pilar de la seguridad de cualquier plugin. En este capítulo, desentrañaremos el sistema de roles y capacidades de WordPress, dejando atrás la dependencia de perfiles genéricos para adoptar una gestión basada puramente en acciones atómicas. Aprenderás a blindar tu código utilizando `current_user_can()`, a registrar roles personalizados adaptados a la lógica de negocio de tu proyecto y a asignar permisos propios con precisión quirúrgica. Dominar esta jerarquía es fundamental para garantizar que cada usuario interactúe únicamente con las funciones permitidas, creando extensiones fiables y profesionales.

## 12.1 El sistema de roles por defecto

WordPress implementa un sistema de control de acceso basado en roles (RBAC - *Role-Based Access Control*) que se apoya fundamentalmente en dos conceptos interconectados: **Roles** (perfiles) y **Capabilities** (capacidades).

Para desarrollar plugins seguros y bien integrados, es imperativo comprender que un **rol** no es más que una etiqueta o contenedor que agrupa un conjunto específico de **capacidades**. WordPress no evalúa inherentemente qué rol tiene un usuario para permitirle una acción, sino que verifica si el usuario posee la capacidad requerida para ejecutarla.

### Los roles predeterminados

Una instalación estándar de WordPress (Single Site) incluye cinco roles por defecto. En instalaciones de red (Multisite), se añade un sexto rol jerárquicamente superior. A continuación, se detalla la estructura predeterminada de mayor a menor privilegio, junto con algunas de sus capacidades distintivas:

1. **Super Admin (Solo Multisite):** Tiene acceso absoluto a la administración de la red de sitios y sobreescribe cualquier comprobación de capacidad.
2. **Administrator (Administrador):** Posee todas las capacidades dentro de un sitio individual. Es el único rol estándar que puede interactuar con el ecosistema de extensiones (`activate_plugins`, `install_themes`, `manage_options`).
3. **Editor:** Tiene el control total sobre el contenido. Puede crear, editar, publicar y eliminar cualquier tipo de entrada o página, independientemente de quién sea el autor (`edit_others_posts`, `publish_pages`, `moderate_comments`).
4. **Author (Autor):** Puede gestionar única y exclusivamente su propio contenido. Tiene la capacidad de redactar, subir archivos multimedia y publicar sus propias entradas (`publish_posts`, `upload_files`), pero no tiene acceso a páginas.
5. **Contributor (Colaborador):** Puede redactar y gestionar sus propias entradas, pero carece del privilegio de publicarlas (`edit_posts`, `delete_posts`). Su contenido debe ser revisado por un Editor o Administrador. Tampoco puede subir archivos multimedia.
6. **Subscriber (Suscriptor):** El rol más básico. Solo tiene la capacidad de leer contenido público y gestionar su propio perfil de usuario en el panel (`read`).

### Arquitectura de datos: Cómo se almacenan los roles

A diferencia de otros sistemas de gestión de contenido, las definiciones de los roles y sus capacidades asociadas no están hardcodeadas en los archivos del núcleo de PHP para cada ejecución. Se almacenan de forma persistente en la base de datos.

Específicamente, el esquema completo de roles se guarda en la tabla `wp_options` (o el prefijo equivalente configurado en el capítulo 5) bajo la clave de opción `wp_user_roles`. Almacenarlo en la base de datos permite que los plugins puedan modificar permanentemente estas estructuras (como veremos en la sección 12.3).

Cuando un usuario recibe un rol, este no se asigna mediante una columna separada en la tabla `wp_users`. En su lugar, se guarda en la tabla `wp_usermeta` bajo la clave `wp_capabilities`. El valor es un array serializado que generalmente contiene el nombre del rol como clave y un booleano como valor.

```text
+-------------------------------------------------------------+
| Diagrama de Relación: Usuario -> Rol -> Capacidades         |
+-------------------------------------------------------------+

[ Tabla wp_users ]        [ Tabla wp_usermeta ]
+---------------+         +---------------------------------+
| ID: 5         | ======= | user_id: 5                      |
| user_login:   |         | meta_key: wp_capabilities       |
| jdoe          |         | meta_value: a:1:{s:6:"editor";  |
+---------------+         |                  b:1;}          |
                          +---------------------------------+
                                          |
                                          V
                          [ Tabla wp_options ]
                          +---------------------------------+
                          | option_name: wp_user_roles      |
                          | option_value: (Array con todas  |
                          | las capacidades del rol Editor: |
                          | - edit_posts: true              |
                          | - publish_posts: true           |
                          | - edit_others_posts: true...)   |
                          +---------------------------------+

```

### La clase global `WP_Roles`

WordPress gestiona todo este ecosistema en tiempo de ejecución a través de la clase `WP_Roles`. Durante el flujo de carga del núcleo (visto en el Capítulo 1), WordPress inicializa la variable global `$wp_roles`.

Esta instancia es la responsable de extraer la opción `wp_user_roles` de la base de datos y proveer los métodos para interactuar con ella. Si bien manipularás las capacidades más adelante con funciones envoltura (*wrappers*), es útil saber cómo inspeccionar el sistema por defecto directamente a través de su API de clases.

El siguiente bloque de código muestra cómo podrías recuperar y visualizar todos los roles registrados y sus capacidades asociadas utilizando la función `wp_roles()`, que actúa de forma segura sobre la global `$wp_roles`:

```php
/**
 * Ejemplo: Inspeccionar los roles y capacidades del sistema.
 * Esto es útil para debuguear y entender la estructura subyacente.
 */
function devplugin_inspect_default_roles() {
    // wp_roles() devuelve la instancia global de WP_Roles
    $roles_obj = wp_roles();
    
    // Obtener el array de todos los roles registrados
    $all_roles = $roles_obj->roles;
    
    // Iterar sobre los roles
    foreach ( $all_roles as $role_slug => $role_details ) {
        echo "<h3>Rol: " . esc_html( $role_details['name'] ) . " (" . esc_html( $role_slug ) . ")</h3>";
        
        // $role_details['capabilities'] es un array asociativo
        echo "<ul>";
        foreach ( $role_details['capabilities'] as $cap => $granted ) {
            if ( $granted ) {
                echo "<li>" . esc_html( $cap ) . "</li>";
            }
        }
        echo "</ul>";
    }
}

```

Comprender que los roles son mutables y que residen en la base de datos es el primer paso vital. Como desarrollador, tu código casi nunca debe preguntar "¿El usuario actual es un Autor?". Si tu plugin añade una funcionalidad para exportar un PDF, tu lógica debe abstraerse de los roles predeterminados y evaluar en base a capacidades: "¿El usuario actual tiene la capacidad de `exportar_pdfs`?". Si confías ciegamente en el nombre del rol, tu plugin fallará o se volverá inseguro si otro administrador decide eliminar el rol "Autor" de su sitio, o si otro plugin altera drásticamente los permisos por defecto.

## 12.2 Comprobación de capacidades

Como establecimos en la sección anterior, la regla de oro en la seguridad y el control de acceso en WordPress es **comprobar siempre capacidades, nunca roles**. Los roles pueden ser renombrados, modificados o eliminados por otros plugins, pero las capacidades representan la acción atómica que tu código está a punto de ejecutar.

WordPress proporciona una API sencilla pero extremadamente potente para realizar estas comprobaciones en cualquier punto de la ejecución de tu plugin.

### La función principal: `current_user_can()`

La herramienta más utilizada en el arsenal de un desarrollador de WordPress es `current_user_can()`. Esta función evalúa si el usuario que ha iniciado la sesión actual posee una capacidad específica. Devuelve un valor booleano (`true` o `false`).

Su uso es obligatorio antes de procesar datos sensibles, renderizar páginas de opciones o permitir la ejecución de rutinas críticas.

```php
/**
 * Ejemplo: Proteger la ejecución de una función crítica.
 */
function devplugin_borrar_datos_sensibles() {
    // Verificamos si el usuario tiene el nivel de acceso necesario
    if ( ! current_user_can( 'manage_options' ) ) {
        // Si no tiene la capacidad, detenemos la ejecución y devolvemos un error
        wp_die( __( 'No tienes permisos suficientes para realizar esta acción.', 'devplugin' ) );
    }

    // Lógica para borrar los datos...
}

```

Es importante destacar un "antipatrón" común: `current_user_can( 'administrator' )`. Aunque por razones de retrocompatibilidad WordPress permite pasar el nombre de un rol a esta función y devolverá `true` si el usuario tiene ese rol, **es una práctica fuertemente desaconsejada**. Rompe la abstracción del sistema de capacidades y hará que tu plugin sea incompatible con gestores de roles personalizados.

### Comprobación en usuarios específicos: `user_can()`

En ocasiones, tu plugin no necesita evaluar al usuario que está navegando, sino a un usuario específico de la base de datos (por ejemplo, al renderizar una lista de usuarios y mostrar un botón de "Editar" solo junto a aquellos que tienen ciertos privilegios).

Para estos casos se utiliza `user_can( $user, $capability )`, donde `$user` puede ser un ID de usuario numérico o una instancia del objeto `WP_User`.

```php
$user_id = 42;

if ( user_can( $user_id, 'publish_posts' ) ) {
    echo '<p>El usuario 42 es capaz de publicar contenido.</p>';
}

```

### Capacidades Primitivas vs. Capacidades Meta

Para dominar el sistema de permisos, es crucial entender la diferencia entre dos tipos de capacidades que WordPress maneja internamente:

1. **Capacidades Primitivas:** Son los permisos absolutos otorgados a un usuario y guardados en la base de datos. Por ejemplo, `edit_posts` (editar entradas), `manage_options` (gestionar opciones) o `upload_files` (subir archivos). Son genéricas y no dependen del contexto.
2. **Capacidades Meta:** Son comprobaciones condicionales que dependen de un objeto específico. Por ejemplo, `edit_post` (en singular). No puedes simplemente comprobar si un usuario tiene `edit_post`; necesitas decirle *qué* post quiere editar, porque el usuario podría tener permiso para editar sus propios posts, pero no los de otro autor.

Cuando pasas una capacidad meta a `current_user_can()`, debes pasar el ID del objeto como segundo argumento.

```php
$post_id_a_editar = 150;

// Correcto: Evaluando una capacidad meta con su contexto (el ID del post)
if ( current_user_can( 'edit_post', $post_id_a_editar ) ) {
    // El usuario puede editar la entrada 150
}

```

#### El flujo de evaluación (La función `map_meta_cap`)

¿Cómo sabe WordPress si `edit_post` para el ID 150 debe devolver `true` o `false`? Lo hace a través de un proceso de mapeo o traducción.

WordPress utiliza internamente la función `map_meta_cap()` para traducir una "capacidad meta" en una o varias "capacidades primitivas" requeridas para ese objeto específico.

```text
+-----------------------------------------------------------------------+
| Flujo de evaluación de una Capacidad Meta                             |
+-----------------------------------------------------------------------+

1. PETICIÓN: current_user_can( 'edit_post', 150 )
       |
       v
2. TRADUCCIÓN: map_meta_cap() inspecciona el Post 150.
       |
       +-- ¿Quién es el autor del Post 150? -> (Ej: Usuario 5)
       |
       +-- ¿El usuario actual es el Usuario 5?
       |      |
       |      +-- SÍ: Devuelve requerimiento primitivo -> ['edit_posts']
       |      |
       |      +-- NO: Devuelve requerimiento primitivo -> ['edit_others_posts']
       v
3. EVALUACIÓN FINAL: 
   El usuario actual, ¿tiene en su array de capacidades guardado 
   en base de datos la capacidad primitiva resultante?
       |
       +-> Devuelve TRUE o FALSE.

```

Este sistema de mapeo es extremadamente flexible y se utiliza exhaustivamente al desarrollar *Custom Post Types* (CPTs) complejos. Si tu plugin registra un CPT llamado `factura`, puedes definir capacidades meta como `edit_factura` y `read_factura`, y configurar cómo se mapean a las primitivas, permitiendo un control granular inmenso.

### Puntos estratégicos de comprobación en un plugin

En el desarrollo de plugins, las comprobaciones de capacidades rara vez ocurren en el vacío. Existen "cuellos de botella" arquitectónicos donde siempre debes implementar estas validaciones:

1. **Registro de menús de administración:** Funciones como `add_menu_page()` o `add_submenu_page()` (vistas en el Capítulo 7) requieren explícitamente una capacidad como argumento. WordPress ocultará el menú si el usuario no la posee.
2. **Callbacks de AJAX (Capítulo 9):** Los hooks `wp_ajax_*` son puntos ciegos si no los proteges. Aunque ocultes un botón en el front-end o en el admin, un usuario malintencionado puede enviar una petición POST directa a `admin-ajax.php`. Tu callback de PHP debe invocar `current_user_can()` en la primera línea.
3. **Endpoints de la REST API (Capítulo 13):** Al registrar una ruta con `register_rest_route()`, el argumento `permission_callback` es el lugar exacto y obligatorio para retornar el resultado de una evaluación de capacidades.

Utilizar `current_user_can()` de forma consistente asegura que la lógica de negocio de tu plugin respeta herméticamente la jerarquía y los permisos configurados por el administrador del sitio.

## 12.3 Creación de roles personalizados

A medida que tus plugins crecen en complejidad, es probable que los roles predeterminados de WordPress dejen de encajar con la lógica de negocio de tu proyecto. Si estás desarrollando un plugin de gestión escolar, asignar el rol de "Autor" a un profesor o de "Suscriptor" a un alumno puede resultar confuso semánticamente y limitante a nivel de arquitectura.

La solución es registrar roles personalizados que definan perfiles de usuario exactos para tu ecosistema.

### La función `add_role()`

WordPress proporciona la función `add_role()` para insertar un nuevo perfil en el sistema. Su firma es bastante directa y requiere tres parámetros:

1. **`$role` (string):** El identificador interno o *slug* del rol (ej. `gestor_eventos`). Debe usar minúsculas y guiones bajos.
2. **`$display_name` (string):** El nombre legible por humanos que aparecerá en la interfaz de administración (ej. "Gestor de Eventos"). Debería ser traducible.
3. **`$capabilities` (array):** Un array asociativo donde las claves son los nombres de las capacidades y los valores son booleanos (`true` para conceder la capacidad, `false` para denegarla explícitamente).

### El error más común: El lugar de ejecución

Como vimos en la sección 12.1, los roles se guardan de forma persistente en la base de datos (en la tabla `wp_options`). Esto introduce una regla arquitectónica vital que separa a los desarrolladores novatos de los profesionales: **nunca debes registrar un rol en hooks que se ejecutan en cada carga de página**, como `init` o `admin_init`.

Llamar a `add_role()` en cada petición obliga a WordPress a actualizar la base de datos innecesariamente, lo que penaliza el rendimiento y puede causar problemas de concurrencia.

El lugar correcto para registrar un rol es la **rutina de activación** de tu plugin (cubierta en el Capítulo 2). De este modo, la escritura en la base de datos ocurre una única vez cuando el administrador activa la extensión.

```text
+-------------------------------------------------------------+
| Ciclo de vida correcto para la creación de un rol           |
+-------------------------------------------------------------+

[ Administrador hace clic en "Activar Plugin" ]
       |
       v
[ register_activation_hook ] 
       |
       v
[ Ejecuta: add_role() ] ----> Escribe en wp_options (UNA VEZ)
       |
       v
[ Plugin activo ] 
(El rol ya existe en la DB, no hay que volver a crearlo en 'init')

```

### Implementación práctica en la activación

Veamos cómo estructurar el código para crear un rol llamado "Auditor", cuyo propósito sea poder leer todo el contenido y acceder al panel de administración, pero sin poder modificar absolutamente nada.

```php
/**
 * Callback de activación del plugin.
 */
function devplugin_activacion_crear_roles() {
    // Definimos las capacidades iniciales del rol
    $capacidades_auditor = array(
        'read'         => true,  // Permite acceder al escritorio (Dashboard)
        'edit_posts'   => false, // Denegado explícitamente
        'delete_posts' => false, // Denegado explícitamente
    );

    // Registramos el rol en la base de datos
    add_role(
        'auditor_sistema',
        __( 'Auditor del Sistema', 'devplugin' ),
        $capacidades_auditor
    );
}
// Enganchamos la función a la activación del plugin
register_activation_hook( __FILE__, 'devplugin_activacion_crear_roles' );

```

Al utilizar `add_role()`, si el rol ya existe en la base de datos (por ejemplo, si el plugin fue desactivado y reactivado, y el rol no se eliminó), la función fallará silenciosamente y devolverá `null`, evitando sobrescribir las capacidades que un administrador haya podido modificar posteriormente.

### Clonar un rol existente

En muchas ocasiones, no querrás escribir decenas de capacidades primitivas desde cero para un rol que es casi idéntico a uno predeterminado. Puedes aprovechar la función `get_role()` para extraer las capacidades de un rol existente y usarlas como base.

```php
function devplugin_activacion_clonar_editor() {
    // Obtenemos el objeto del rol Editor
    $rol_editor = get_role( 'editor' );
    
    if ( null !== $rol_editor ) {
        // Clonamos sus capacidades
        add_role(
            'editor_avanzado',
            __( 'Editor Avanzado', 'devplugin' ),
            $rol_editor->capabilities
        );
    }
}

```

### Limpieza durante la desactivación o desinstalación

Mantener limpia la base de datos es una señal de código profesional. Si tu plugin crea roles exclusivos, lo habitual es eliminarlos cuando el plugin se desinstala mediante `remove_role( $role )`.

Dependiendo de la naturaleza de tu plugin, podrías decidir eliminar el rol en la desactivación (hook de desactivación) o preservarlo hasta que el usuario elimine el plugin por completo (archivo `uninstall.php`).

```php
/**
 * Callback de desinstalación o desactivación.
 */
function devplugin_limpiar_roles() {
    // Elimina el rol de la base de datos
    remove_role( 'auditor_sistema' );
}
// En un escenario real, esto iría en register_deactivation_hook o uninstall.php

```

*Nota de precaución:* Si eliminas un rol, los usuarios que lo tenían asignado no perderán su cuenta, pero se quedarán sin ningún rol válido en el sistema (sus capacidades previas desaparecen). Si tu plugin va a eliminar roles en la desinstalación, es una buena práctica reasignar esos usuarios a un rol predeterminado, como `subscriber`, antes de ejecutar `remove_role()`.

## 12.4 Asignación de permisos propios

Crear roles personalizados desde cero es útil para arquitecturas cerradas, pero en la inmensa mayoría de los plugins comerciales, el objetivo es integrarse con la estructura existente. Si tu plugin añade una nueva página de opciones o un *Custom Post Type* (CPT), lo ideal es definir **capacidades propias** (ej. `gestionar_ajustes_devplugin`, `edit_facturas`) y asignarlas selectivamente a los roles predeterminados que tengan sentido (como el Administrador y el Editor).

### Inyección de capacidades a roles existentes

El proceso para añadir una capacidad a un rol existente se realiza mediante el método `add_cap()` de la clase `WP_Role`.

Al igual que ocurre con la creación de roles (sección 12.3), la asignación de capacidades modifica el array serializado guardado en la tabla `wp_options`. Por lo tanto, **esta operación debe ejecutarse exclusivamente durante la rutina de activación del plugin**, nunca en hooks de ejecución continua como `init`.

El siguiente patrón de código ilustra cómo inyectar permisos propios a los roles de Administrador y Editor cuando el plugin se activa:

```php
/**
 * Callback de activación: Asignar capacidades propias.
 */
function devplugin_activacion_asignar_capacidades() {
    // 1. Asignar capacidad al Administrador
    $rol_admin = get_role( 'administrator' );
    if ( $rol_admin ) {
        // Le damos control total sobre el plugin
        $rol_admin->add_cap( 'gestionar_ajustes_devplugin' );
        $rol_admin->add_cap( 'borrar_datos_devplugin' );
    }

    // 2. Asignar capacidad limitada al Editor
    $rol_editor = get_role( 'editor' );
    if ( $rol_editor ) {
        // El editor puede gestionar los ajustes, pero no borrar datos masivos
        $rol_editor->add_cap( 'gestionar_ajustes_devplugin' );
    }
}
register_activation_hook( __FILE__, 'devplugin_activacion_asignar_capacidades' );

```

Es un error común asumir que el rol `administrator` recibe mágicamente cualquier capacidad nueva que inventes. Si usas `current_user_can('mi_capacidad_secreta')` y no se la has asignado explícitamente al administrador (o no la has mapeado a una capacidad nativa como `manage_options`), el propio administrador del sitio tendrá el acceso denegado.

### Limpieza de capacidades en la desinstalación

Del mismo modo que es tu responsabilidad añadir estas capacidades, debes ser un buen ciudadano del ecosistema y eliminarlas cuando tu plugin se elimine del sistema. Esto se logra iterando sobre los roles y utilizando el método hermano `remove_cap()`.

```php
/**
 * Rutina de desinstalación (idealmente en uninstall.php)
 */
function devplugin_desinstalacion_limpiar_capacidades() {
    $roles_a_limpiar = array( 'administrator', 'editor' );
    $capacidades_propias = array( 'gestionar_ajustes_devplugin', 'borrar_datos_devplugin' );

    foreach ( $roles_a_limpiar as $slug ) {
        $rol = get_role( $slug );
        if ( $rol ) {
            foreach ( $capacidades_propias as $cap ) {
                $rol->remove_cap( $cap );
            }
        }
    }
}

```

### Asignación de permisos a usuarios específicos

El sistema de roles y capacidades de WordPress tiene un nivel más de profundidad: las capacidades no solo se asignan a los roles, sino que pueden asignarse **directamente a un usuario individual**.

Cuando evaluamos a un usuario, WordPress construye sus permisos fusionando las capacidades del rol (o roles) que posee con las capacidades individuales que se le hayan asignado explícitamente en la tabla `wp_usermeta`.

```text
+-----------------------------------------------------------------+
| Resolución final de capacidades de un usuario                   |
+-----------------------------------------------------------------+

[ Capacidades del Rol ]  +  [ Capacidades del Usuario ] = [ Permisos Totales ]
(Heredadas genéricamente)   (Asignadas individualmente)   (Evaluadas en ejecución)

Ejemplo Práctico (Usuario ID: 15, Rol: Suscriptor):
[ read: true ]           +  [ upload_files: true ]      = [ read: true, upload_files: true ]

```

Esto es extremadamente potente para casos de uso excepcionales. Por ejemplo, si tienes 100 usuarios con el rol "Autor", pero quieres que solo uno de ellos (por ser el autor destacado del mes) pueda además publicar entradas sin revisión (`publish_posts`), no necesitas crear un rol nuevo llamado "Autor Destacado". Simplemente le asignas la capacidad a ese usuario en particular a través de la clase `WP_User`.

```php
/**
 * Ejemplo: Otorgar un permiso especial a un usuario concreto.
 * Esto suele ejecutarse como respuesta a un formulario o acción en el admin.
 */
function devplugin_promocionar_usuario_especifico( $user_id ) {
    $usuario = new WP_User( $user_id );
    
    // Verificamos que el usuario exista
    if ( $usuario->exists() ) {
        // Le otorgamos la capacidad independientemente de su rol
        $usuario->add_cap( 'publish_posts' );
    }
}

/**
 * Ejemplo: Revocar un permiso especial a un usuario concreto.
 */
function devplugin_castigar_usuario_especifico( $user_id ) {
    $usuario = new WP_User( $user_id );
    
    if ( $usuario->exists() ) {
        // Se puede usar remove_cap para quitar capacidades individuales,
        // o false para denegar explícitamente una capacidad que su rol le da.
        $usuario->add_cap( 'upload_files', false ); 
    }
}

```

Notarás el uso de `$usuario->add_cap( 'upload_files', false )`. Esto inserta la capacidad en el perfil del usuario pero con un valor booleano falso. En la resolución de conflictos de WordPress, **una capacidad denegada explícitamente a nivel de usuario siempre sobrescribe la misma capacidad concedida a nivel de rol**. Es la forma perfecta de "banear" a un usuario de realizar una acción específica sin alterar su rol principal ni afectar al resto de usuarios de su mismo nivel.

## Resumen del capítulo

En este capítulo hemos diseccionado el sistema de Control de Acceso Basado en Roles (RBAC) de WordPress, una pieza fundamental para garantizar la seguridad operativa y estructural de tus plugins. Hemos establecido que la regla inquebrantable es evaluar siempre capacidades (`current_user_can`) y nunca depender de los nombres de los roles. Comprendimos que tanto los roles como sus capacidades asociadas persisten en la base de datos, lo que nos obliga a interactuar con ellos mediante las funciones `add_role`, `remove_role`, `add_cap` y `remove_cap` exclusivamente en los ciclos de activación y desinstalación del plugin. Finalmente, hemos visto cómo el sistema permite una granularidad absoluta, permitiendo inyectar capacidades personalizadas a roles existentes o crear excepciones de permisos a nivel de usuario individual, facilitando la creación de flujos de trabajo altamente personalizados y seguros.
