En el desarrollo de plugins, tareas pesadas como el envío de correos o la limpieza de datos consumen demasiado tiempo para ejecutarse durante la carga de una página. Bloquear al visitante mientras finalizan genera una mala experiencia de usuario. Para solucionarlo, WordPress integra su propio planificador: el WP-Cron. En este capítulo, descubriremos su arquitectura basada en peticiones HTTP, aprenderás a programar eventos únicos y recurrentes de forma segura, y dominarás las técnicas de depuración necesarias para gestionar procesos asíncronos y en segundo plano de manera eficiente y sin comprometer el rendimiento del servidor.

## 14.1 Cómo funciona el WP-Cron

En los sistemas operativos basados en Unix, el comando `cron` es un planificador de tareas impulsado por el reloj del sistema. Permite ejecutar scripts o comandos en momentos exactos o en intervalos regulares (por ejemplo, "cada medianoche" o "cada 5 minutos"). Sin embargo, WordPress fue concebido para funcionar en la mayor cantidad de entornos posibles, incluyendo servidores de alojamiento compartido (shared hosting) donde los usuarios generalmente no tienen acceso para configurar tareas a nivel del sistema operativo.

Para resolver este problema, WordPress implementa su propio sistema de programación de tareas conocido como **WP-Cron**. A diferencia del cron del sistema, WP-Cron es un **pseudo-cron**. No está impulsado por el reloj del servidor, sino por el tráfico web. Es decir, WP-Cron depende de las peticiones HTTP (visitas de usuarios, rastreadores de motores de búsqueda, etc.) para activarse.

### El flujo de ejecución de WP-Cron

El mecanismo interno de WP-Cron se evalúa en casi cada carga de página de WordPress, pero está diseñado para ser lo menos intrusivo posible. El proceso sigue este flujo:

```text
[Usuario o Bot] ---> Realiza petición HTTP a cualquier página
                                 |
                                 v
                     [WordPress inicia su carga] (Capítulo 1)
                                 |
                                 v
                 ¿Hay tareas programadas vencidas?
                 (Consulta a la tabla wp_options)
                                 |
                  +--------------+--------------+
                  | (Sí)                        | (No)
                  v                             v
        Llamada a spawn_cron()          Continúa la carga de 
                  |                     la página normalmente
                  v
   Petición HTTP asíncrona a `wp-cron.php`
   (Non-blocking loopback request)
                  |
                  v
         Ejecución de los Hooks 
         asociados a las tareas

```

Cuando un usuario visita el sitio, WordPress verifica una opción en la base de datos (específicamente la fila con `option_name = 'cron'` en la tabla `wp_options`). Esta opción contiene un array serializado con todas las tareas programadas y sus marcas de tiempo (timestamps) de ejecución.

Si WordPress detecta que la marca de tiempo actual es mayor o igual a la de una tarea programada, invoca la función `spawn_cron()`.

Para evitar que el usuario que generó la visita tenga que esperar a que se ejecuten tareas pesadas (como el envío de boletines o la optimización de imágenes), WordPress realiza una petición HTTP hacia sí mismo dirigida al archivo `wp-cron.php`. Esta petición se hace utilizando la HTTP API nativa (con `wp_remote_post()`) configurada con un tiempo de espera (timeout) extremadamente corto, generalmente de 0.01 segundos.

Al hacer esto, WordPress lanza el proceso en segundo plano de forma asíncrona ("dispara y olvida") y continúa sirviendo la página al visitante de manera casi inmediata.

### Limitaciones del enfoque basado en tráfico

El diseño del pseudo-cron presenta dos problemas fundamentales dependiendo del volumen de tráfico del sitio web:

1. **Sitios con bajo tráfico:** Si un evento está programado para ejecutarse a las 03:00 AM, pero nadie visita el sitio hasta las 08:30 AM, la tarea no se ejecutará hasta las 08:30 AM. WP-Cron es incapaz de ejecutar eventos a una hora exacta si no hay una petición que accione el gatillo.
2. **Sitios con alto tráfico:** Aunque la petición a `wp-cron.php` es asíncrona y tiene un límite de bloqueo (lock) de 10 minutos por defecto para evitar ejecuciones simultáneas, en sitios con miles de visitas por minuto, la comprobación constante de tareas pendientes y la generación de peticiones loopback recurrentes puede generar un consumo innecesario de recursos (CPU y memoria) en el servidor web.

### Desacoplando el WP-Cron: Modo Sistema

Para entornos en producción o plugins que dependen de una precisión estricta (por ejemplo, sincronizaciones críticas con APIs externas mediante la REST API vista en el Capítulo 13 o pasarelas de pago), la práctica estándar de la industria es desactivar el comportamiento nativo impulsado por el tráfico y delegar el gatillo al cron real del servidor.

Esto se logra definiendo una constante en el archivo `wp-config.php`:

```php
define( 'DISABLE_WP_CRON', true );

```

Al establecer `DISABLE_WP_CRON` en `true`, WordPress dejará de lanzar la petición asíncrona a `wp-cron.php` durante las visitas de los usuarios. Sin embargo, el sistema de encolado de tareas intacto sigue funcionando; las tareas se siguen registrando en la base de datos.

Para que las tareas se ejecuten, el administrador del servidor debe configurar un Cron Job genuino en el sistema operativo (por ejemplo, mediante crontab en Linux) que haga ping al archivo `wp-cron.php` a intervalos regulares (usualmente cada minuto o cada 5 minutos):

```bash
# Ejemplo de entrada en crontab que llama a WP-Cron cada 5 minutos
*/5 * * * * wget -q -O - https://tudominio.com/wp-cron.php?doing_wp_cron >/dev/null 2>&1

```

Como desarrollador de plugins, debes asumir por defecto que el WP-Cron se comportará de manera nativa (dependiente del tráfico), lo que significa que el código de tus tareas de fondo debe ser tolerante a retrasos en su ejecución y nunca debe depender de una precisión de sincronización al segundo.

## 14.2 Programación de eventos únicos

En el desarrollo de plugins, es común encontrarse con situaciones donde una tarea pesada o secundaria no necesita ejecutarse inmediatamente, sino que debe posponerse para un momento futuro específico. Los eventos únicos permiten delegar la ejecución de una función a una marca de tiempo (timestamp) puntual, liberando el proceso actual para que el usuario reciba una respuesta rápida.

Casos de uso típicos incluyen:

* Enviar un correo de seguimiento 24 horas después de que un usuario se registre.
* Procesar o redimensionar un lote grande de imágenes subidas sin bloquear la interfaz.
* Eliminar datos temporales o de prueba después de un periodo de gracia.

### La función `wp_schedule_single_event()`

La función principal del núcleo para encolar un evento que ocurrirá una sola vez es `wp_schedule_single_event()`. Esta función no ejecuta el código directamente, sino que registra una etiqueta de acción (un *Action Hook*, como los vistos en el Capítulo 2) en el sistema WP-Cron para que se dispare en el futuro.

Su firma es la siguiente:

```php
wp_schedule_single_event( int $timestamp, string $hook, array $args = array(), bool $wp_error = false )

```

* **`$timestamp`**: Una marca de tiempo UNIX que indica cuándo debe ocurrir el evento. Debe ser la hora actual o una hora en el futuro. Para facilitar los cálculos, WordPress provee constantes matemáticas de tiempo como `MINUTE_IN_SECONDS`, `HOUR_IN_SECONDS`, `DAY_IN_SECONDS`, etc.
* **`$hook`**: El nombre del gancho de acción personalizado que se disparará cuando se alcance el timestamp.
* **`$args`** *(Opcional)*: Un array indexado de argumentos que se pasarán a la función de callback cuando se ejecute el hook.
* **`$wp_error`** *(Opcional)*: Si se establece en `true`, devolverá un objeto `WP_Error` en caso de fallo en lugar de `false`.

### Ciclo de vida de un evento único

La implementación de un evento único siempre requiere dos piezas de código separadas:

1. **El encolador:** El código que evalúa cuándo debe ocurrir la acción y programa el evento.
2. **El manejador (Callback):** La función enganchada al *hook* personalizado que ejecuta la lógica real cuando el evento es disparado por WP-Cron.

```text
Flujo de ejecución de un evento único:

[Evento desencadenante] (ej. user_register)
          |
          v
1. wp_schedule_single_event() ---> Registra el Hook y el Timestamp en la BD
          |
     (Retorno inmediato al usuario)
          |
    ... El tiempo transcurre ...
          |
2. WP-Cron detecta el vencimiento ---> Dispara el Action Hook personalizado
          |
          v
3. add_action( 'tu_hook', 'tu_callback' ) ---> Ejecuta la tarea en segundo plano

```

### Prevención de eventos duplicados

Una de las reglas de oro al trabajar con la API de WP-Cron es evitar la saturación de la cola de tareas. Si el evento desencadenante ocurre varias veces antes de que se ejecute la tarea programada, podrías terminar registrando el mismo evento múltiples veces, lo que consumirá recursos innecesarios.

Para evitar esto, debes verificar siempre si la tarea ya está programada utilizando `wp_next_scheduled()`.

### Ejemplo práctico: Envío de correo diferido

Supongamos que deseas enviar un correo electrónico de bienvenida a un usuario exactamente 1 hora después de que haya creado su cuenta. En lugar de detener el registro para procesar el envío, lo delegamos a WP-Cron.

```php
// 1. Hook desencadenante: ocurre cuando se registra un usuario
add_action( 'user_register', 'mi_plugin_programar_email_bienvenida', 10, 1 );

function mi_plugin_programar_email_bienvenida( $user_id ) {
    // Calculamos el tiempo: 1 hora a partir de ahora
    $timestamp = time() + HOUR_IN_SECONDS;
    
    // Definimos el nombre de nuestro action hook personalizado
    $hook = 'mi_plugin_evento_email_bienvenida';
    
    // Los argumentos DEBEN ser un array, incluso si es un solo valor
    $args = array( $user_id );

    // Verificamos que este mismo evento con estos mismos argumentos no esté ya programado
    if ( ! wp_next_scheduled( $hook, $args ) ) {
        wp_schedule_single_event( $timestamp, $hook, $args );
    }
}

// 2. Escuchamos nuestro hook personalizado
add_action( 'mi_plugin_evento_email_bienvenida', 'mi_plugin_procesar_email_bienvenida', 10, 1 );

function mi_plugin_procesar_email_bienvenida( $user_id ) {
    // Obtenemos los datos del usuario
    $user = get_userdata( $user_id );
    
    if ( ! $user ) {
        return; // Salida temprana si el usuario fue eliminado antes de cumplirse la hora
    }

    $to      = $user->user_email;
    $subject = '¡Bienvenido a nuestra plataforma!';
    $message = 'Hola ' . $user->display_name . ', gracias por unirte. Explora las nuevas funciones.';

    // Enviamos el correo
    wp_mail( $to, $subject, $message );
}

```

### Anulación de un evento único

Si un evento programado ya no es necesario debido a un cambio en el estado del sistema (por ejemplo, programaste el borrado de una cuenta pendiente de activación a los 3 días, pero el usuario la activó al segundo día), debes limpiar la cola usando `wp_clear_scheduled_hook()`.

```php
function mi_plugin_cancelar_borrado_cuenta( $user_id ) {
    $hook = 'mi_plugin_borrar_cuenta_inactiva';
    $args = array( $user_id );

    // Elimina cualquier evento programado para este hook y argumentos específicos
    wp_clear_scheduled_hook( $hook, $args );
}

```

Es crucial notar que tanto `wp_next_scheduled()` como `wp_clear_scheduled_hook()` requieren que pases exactamente el mismo array de `$args` que usaste en `wp_schedule_single_event()`. WP-Cron genera una firma hash basada en el nombre del hook y los argumentos para identificar eventos de forma única. Si los argumentos no coinciden, la comprobación o la cancelación fallarán.

## 14.3 Creación de eventos recurrentes

A diferencia de los eventos únicos, que se ejecutan una sola vez y se eliminan de la cola, los eventos recurrentes permiten ejecutar tareas de limpieza, sincronización o mantenimiento de forma periódica (por ejemplo, cada hora, diariamente o cada semana).

Para implementar un evento recurrente en WordPress, se deben dominar dos componentes esenciales: la definición del intervalo de tiempo (cron schedule) y la programación del evento en sí.

### Definición de intervalos personalizados

WordPress incluye por defecto un conjunto limitado de intervalos de tiempo: `hourly` (cada hora), `twicedaily` (dos veces al día) y `daily` (diariamente). Si tu plugin necesita una periodicidad diferente (como cada 5 minutos o cada 15 días), debes registrar este nuevo intervalo utilizando el filtro `cron_schedules`.

El callback conectado a este filtro recibe un array con los intervalos existentes y debe devolver el array modificado añadiendo el nuevo intervalo con su estructura correspondiente:

```php
// 1. Registrar un intervalo personalizado de cada 5 minutos
add_filter( 'cron_schedules', 'mi_plugin_añadir_intervalo_cinco_minutos' );

function mi_plugin_añadir_intervalo_cinco_minutos( $schedules ) {
    // La clave del array ('five_minutes') será el identificador técnico del intervalo
    $schedules['five_minutes'] = array(
        'interval' => 5 * MINUTE_IN_SECONDS, // Valor en segundos (300 segundos)
        'display'  => __( 'Cada 5 minutos', 'mi-plugin-textdomain' ) // Texto para el admin
    );
    return $schedules;
}

```

### La función `wp_schedule_event()`

Una vez que el intervalo existe (ya sea nativo o personalizado), se utiliza la función `wp_schedule_event()` para inicializar la recurrencia.

```php
wp_schedule_event( int $timestamp, string $recurrence, string $hook, array $args = array(), bool $wp_error = false )

```

* **`$timestamp`**: La marca de tiempo UNIX de la **primera** ejecución. Si pones `time()`, la primera ejecución ocurrirá inmediatamente la próxima vez que se active WP-Cron, y a partir de ahí se repetirá según el intervalo.
* **`$recurrence`**: El identificador del intervalo (`hourly`, `daily`, `five_minutes`, etc.).
* **`$hook`**: El nombre del *Action Hook* personalizado que ejecutará la lógica.

### El peligro de la sobreprogramación

A diferencia de los hooks normales de WordPress que se registran en cada carga de página, `wp_schedule_event()` escribe directamente en la base de datos de manera persistente. **Si ejecutas esta función en cada carga de página sin verificar si ya existe, duplicarás el evento miles de veces**, colapsando la tabla `wp_options` y ralentizando el servidor.

Por lo tanto, la programación de eventos recurrentes debe ligarse idealmente a las **rutinas de activación del plugin** (vistas en el Capítulo 2) o, en su defecto, envolverse estrictamente dentro de una comprobación con `wp_next_scheduled()`.

### Ejemplo práctico: Limpieza periódica de registros de depuración

A continuación se muestra la implementación completa y segura de una tarea recurrente que elimina registros antiguos de la base de datos de forma diaria, gestionando correctamente su activación y desactivación.

```php
// Registrar la rutina de activación del plugin (Capítulo 2)
register_activation_hook( __FILE__, 'mi_plugin_activar_cron_limpieza' );

function mi_plugin_activar_cron_limpieza() {
    $hook = 'mi_plugin_cron_diario_limpieza';
    
    // Verificación de seguridad por si acaso ya estuviera programado
    if ( ! wp_next_scheduled( $hook ) ) {
        // Programamos para que inicie hoy a la medianoche
        $primera_ejecucion = strtotime( 'tomorrow midnight' );
        
        wp_schedule_event( $primera_ejecucion, 'daily', $hook );
    }
}

// 2. Conectar la lógica al Action Hook que se ejecutará periódicamente
add_action( 'mi_plugin_cron_diario_limpieza', 'mi_plugin_ejecutar_limpieza_registros' );

function mi_plugin_ejecutar_limpieza_registros() {
    global $wpdb;
    $tabla = $wpdb->prefix . 'mi_plugin_logs';

    // Borrar registros con más de 30 días de antigüedad de forma segura (Capítulo 5)
    $limite_tiempo = date( 'Y-m-d H:i:s', strtotime( '-30 days' ) );
    
    $wpdb->query(
        $wpdb->prepare(
            "DELETE FROM $tabla WHERE fecha_registro < %s",
            $limite_tiempo
        )
    );
}

```

### Limpieza obligatoria al desactivar

Un plugin con buen estándar de código nunca debe dejar basura en el sistema cuando deja de utilizarse. Si programas un evento recurrente, es obligatorio removerlo del sistema WP-Cron durante la rutina de desactivación del plugin utilizando `wp_clear_scheduled_hook()`.

```php
// Registrar la rutina de desactivación del plugin (Capítulo 2)
register_deactivation_hook( __FILE__, 'mi_plugin_desactivar_cron_limpieza' );

function mi_plugin_desactivar_cron_limpieza() {
    // Elimina el evento recurrente de la base de datos permanentemente
    wp_clear_scheduled_hook( 'mi_plugin_cron_diario_limpieza' );
}

```

Si no realizas esta limpieza, WordPress seguirá intentando disparar el gancho `mi_plugin_cron_diario_limpieza` indefinidamente cada día, buscando un callback que ya no existe porque los archivos del plugin están inactivos, generando errores silenciosos en los logs del servidor.

## 14.4 Debugging de tareas programadas

Depurar tareas programadas en WordPress presenta un desafío único. Dado que WP-Cron opera en segundo plano, de forma asíncrona y desvinculada de la sesión del usuario actual, no puedes utilizar métodos tradicionales de depuración visual como `var_dump()`, `print_r()` o `echo`. Cualquier salida en pantalla generada durante una ejecución de cron se perderá en la petición HTTP loopback.

Para diagnosticar y solucionar problemas en tus tareas de fondo, debes adoptar un enfoque basado en registros (logging), herramientas de línea de comandos y el uso de utilidades específicas del ecosistema.

### 1. El registro de errores (Error Logging)

La técnica más confiable para depurar el código que se ejecuta dentro de un callback de WP-Cron es escribir directamente en el archivo `debug.log` del servidor.

Para que esto funcione, debes asegurarte de tener el modo de depuración configurado correctamente en tu archivo `wp-config.php`:

```php
define( 'WP_DEBUG', true );
define( 'WP_DEBUG_LOG', true );
define( 'WP_DEBUG_DISPLAY', false ); // Evita mostrar errores en el front-end

```

Dentro de la función conectada a tu evento, utiliza la función nativa de PHP `error_log()` para registrar hitos importantes, el estado de las variables o las excepciones capturadas.

```php
add_action( 'mi_plugin_tarea_compleja', 'mi_plugin_ejecutar_tarea_compleja' );

function mi_plugin_ejecutar_tarea_compleja( $args ) {
    error_log( '[Mi Plugin] Iniciando tarea compleja.' );
    
    $resultado = realizar_operacion_pesada( $args );
    
    if ( is_wp_error( $resultado ) ) {
        error_log( '[Mi Plugin] Error en la tarea: ' . $resultado->get_error_message() );
        return;
    }

    error_log( '[Mi Plugin] Tarea finalizada con éxito. Filas afectadas: ' . $resultado );
}

```

### 2. Inspección del Cron Array

A nivel interno, WordPress almacena todas las tareas programadas en un array multidimensional dentro de la tabla `wp_options` (bajo la clave `cron`). Para inspeccionar exactamente qué eventos están encolados y cuándo se ejecutarán, puedes utilizar la función privada `_get_cron_array()`.

```text
Estructura simplificada del array de WP-Cron:

Array
(
    [1698750000] => Array  <-- Timestamp de ejecución
        (
            [mi_plugin_cron_diario] => Array <-- Nombre del Hook
                (
                    [40cd750bba9870...] => Array <-- Hash (Firma única)
                        (
                            [schedule] => daily
                            [args] => Array()
                            [interval] => 86400
                        )
                )
        )
)

```

*Nota: Aunque `_get_cron_array()` es útil para depuración temporal, al ser una función privada (comienza con guion bajo), no debe usarse en código de producción.*

### 3. Depuración con WP-CLI

WP-CLI (la interfaz de línea de comandos de WordPress) es la herramienta más potente para cualquier desarrollador de plugins que trabaje con tareas programadas. Te permite evitar la dependencia del tráfico web para probar tus eventos, dándote control manual absoluto.

Comandos indispensables para el debugging:

* **Listar todos los eventos programados:** Permite ver la cola actual, los próximos tiempos de ejecución y los ganchos asociados.

```bash
wp cron event list

```

* **Ejecutar un evento específico inmediatamente:** Ignora el tiempo de espera y fuerza la ejecución del hook en ese preciso instante. Esto es vital para probar el callback sin tener que modificar la hora del sistema.

```bash
wp cron event run mi_plugin_tarea_compleja

```

* **Probar el sistema WP-Cron general:** Ejecuta todas las tareas que ya están vencidas.

```bash
wp cron test

```

### 4. Problemas comunes de conectividad (Loopback)

Si tus tareas se registran correctamente (aparecen en WP-CLI) pero nunca se ejecutan automáticamente en el servidor, el problema suele ser que el servidor está bloqueando la petición HTTP loopback hacia `wp-cron.php`.

Las causas más frecuentes incluyen:

* El servidor requiere autenticación básica (htpasswd) que bloquea las peticiones automatizadas.
* Resolución DNS incorrecta del propio dominio en el archivo `hosts` del servidor.
* Plugins de seguridad bloqueando peticiones internas de la propia IP del servidor.
* Certificados SSL autofirmados o caducados en entornos de desarrollo local que provocan que la petición cURL falle silenciosamente.

Puedes verificar el estado de las peticiones loopback dirigiéndote al panel de administración en **Herramientas > Salud del Sitio (Site Health)**. Si WordPress no puede comunicarse consigo mismo, mostrará un error crítico allí.

## Resumen del capítulo

En este capítulo, hemos explorado el sistema de pseudo-cron nativo de WordPress, una solución ingeniosa impulsada por el tráfico HTTP que permite sortear las limitaciones de los entornos de alojamiento compartido. Hemos aprendido a programar eventos únicos (`wp_schedule_single_event`) para tareas diferidas y a establecer rutinas recurrentes (`wp_schedule_event`) creando intervalos personalizados. Además, abordamos la importancia de la limpieza de la base de datos al desactivar el plugin y establecimos metodologías sólidas de depuración utilizando WP-CLI y registros de errores asíncronos para garantizar que nuestros procesos en segundo plano se ejecuten de manera fiable y silenciosa.
