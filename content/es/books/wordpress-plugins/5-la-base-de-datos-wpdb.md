Aunque WordPress ofrece APIs robustas como CPTs y metadatos, existen escenarios donde el volumen de información o la complejidad relacional exigen interactuar directamente con la base de datos. En este capítulo, descubriremos cómo trascender las estructuras nativas. Aprenderás a utilizar la clase global `$wpdb` para manipular datos, blindarás tus consultas contra inyecciones SQL usando sentencias preparadas, y dominarás `dbDelta()` para construir y actualizar esquemas de tablas personalizadas, estableciendo un control de versiones seguro y optimizado para el máximo rendimiento de tu plugin.

## 5.1 La clase global $wpdb

En el corazón de la interacción entre WordPress y su base de datos se encuentra la clase `wpdb`. Ubicada en el archivo `wp-includes/wp-db.php`, esta clase actúa como una capa de abstracción sobre la base de datos (típicamente MySQL o MariaDB). Su propósito principal es proporcionar un conjunto estandarizado de métodos para consultar, insertar, actualizar y eliminar datos sin tener que utilizar las funciones nativas de PHP como `mysqli_query()` o `PDO` directamente.

Para acceder a esta instancia única en cualquier parte de tu plugin, debes invocar la variable global:

```php
global $wpdb;

```

A nivel de arquitectura, la clase `$wpdb` se sitúa entre la lógica de tu plugin y el motor de la base de datos, facilitando el acceso a tablas nativas y personalizadas:

```text
+---------------------+       +-----------------------+       +------------------------+
|   Tu Plugin (PHP)   | ----> |  Objeto global $wpdb  | ----> | Base de Datos (MySQL)  |
| (Lógica de negocio) | <---- | (Capa de abstracción) | <---- | (Tablas y registros)   |
+---------------------+       +-----------------------+       +------------------------+

```

### Propiedades clave del objeto $wpdb

Al invocar `$wpdb`, obtienes acceso a propiedades vitales que exponen información sobre la base de datos y el estado de la última consulta ejecutada:

* **`$wpdb->prefix`**: El prefijo de las tablas de la base de datos (por defecto, `wp_`). Es imperativo usar esta propiedad en lugar de escribir el prefijo en duro al consultar tablas nativas o personalizadas para garantizar la compatibilidad en cualquier instalación.
* **`$wpdb->insert_id`**: Contiene el ID generado por la última consulta `INSERT` ejecutada.
* **`$wpdb->num_rows`**: Devuelve el número de filas afectadas o devueltas por la última consulta.
* **`$wpdb->last_error`**: Almacena el mensaje de error de la última consulta que falló, fundamental para la depuración.
* **Tablas nativas**: WordPress mapea todas sus tablas nativas como propiedades (ej. `$wpdb->posts`, `$wpdb->users`, `$wpdb->options`). Usar `$wpdb->posts` es preferible a `{$wpdb->prefix}posts`.

### Métodos de lectura de datos

La clase ofrece métodos específicos dependiendo de la estructura de los datos que esperas recibir. Esta granularidad optimiza la memoria y simplifica el manejo de los resultados en PHP.

#### 1. get_var()

Diseñado para recuperar un único valor (una celda específica) de la base de datos. Si la consulta devuelve múltiples filas o columnas, solo se retorna el valor de la primera columna de la primera fila.

```php
global $wpdb;
$user_count = $wpdb->get_var( "SELECT COUNT(*) FROM {$wpdb->users}" );

```

#### 2. get_row()

Recupera una única fila completa. Es ideal cuando buscas un registro específico basado en un ID o una condición única. Permite especificar el formato de salida: objeto (por defecto), array asociativo o array numérico.

```php
global $wpdb;
// Devuelve un objeto
$post_destacado = $wpdb->get_row( "SELECT * FROM {$wpdb->posts} WHERE ID = 10" );
echo $post_destacado->post_title;

// Devuelve un array asociativo (ARRAY_A)
$post_array = $wpdb->get_row( "SELECT * FROM {$wpdb->posts} WHERE ID = 10", ARRAY_A );
echo $post_array['post_title'];

```

#### 3. get_col()

Devuelve una única columna de resultados en forma de array unidimensional. Muy útil para obtener listados de IDs o valores específicos.

```php
global $wpdb;
// Obtiene todos los IDs de posts publicados
$ids_publicados = $wpdb->get_col( "SELECT ID FROM {$wpdb->posts} WHERE post_status = 'publish'" );

```

#### 4. get_results()

Es el método más versátil para recuperar múltiples filas de resultados. Al igual que `get_row()`, permite definir el formato de salida, siendo un array de objetos el valor predeterminado.

```php
global $wpdb;
$ultimos_posts = $wpdb->get_results( "SELECT ID, post_title FROM {$wpdb->posts} ORDER BY post_date DESC LIMIT 5" );

foreach ( $ultimos_posts as $post ) {
    echo "<li>{$post->post_title}</li>";
}

```

### Métodos de conveniencia para escritura y modificación

Para operaciones de inserción, actualización y borrado, WordPress proporciona métodos "helper" que abstraen la escritura de la sentencia SQL y, crucialmente, manejan la sanitización y preparación de los tipos de datos de forma automática.

| Método | Descripción y uso recomendado |
| --- | --- |
| **`insert()`** | Inserta una nueva fila en una tabla. Recibe la tabla, un array asociativo con los datos (`columna => valor`), y opcionalmente los formatos de datos (`%s` para string, `%d` para entero, `%f` para float). |
| **`update()`** | Actualiza filas existentes. Recibe la tabla, los datos a actualizar, un array con las condiciones `WHERE`, y opcionalmente los formatos para los datos y las condiciones. |
| **`delete()`** | Elimina filas que coinciden con condiciones específicas. Recibe la tabla, las condiciones en un array asociativo, y los formatos de las condiciones. |

**Ejemplo de uso de métodos de conveniencia:**

```php
global $wpdb;
$tabla = $wpdb->prefix . 'mi_tabla_custom';

// Inserción
$wpdb->insert(
    $tabla,
    array( 'columna_texto' => 'Valor', 'columna_numero' => 42 ),
    array( '%s', '%d' ) // Formatos: string, integer
);

// Actualización
$wpdb->update(
    $tabla,
    array( 'columna_texto' => 'Nuevo Valor' ), // Datos
    array( 'columna_numero' => 42 ),           // Condición WHERE
    array( '%s' ),                             // Formato de datos
    array( '%d' )                              // Formato de condición
);

// Borrado
$wpdb->delete(
    $tabla,
    array( 'columna_numero' => 42 ),
    array( '%d' )
);

```

Estos métodos de conveniencia son la forma recomendada de alterar la base de datos, ya que evitan la inyección SQL en la mayoría de los casos básicos. Sin embargo, para consultas más complejas (como `JOINs` complejos, o métodos de lectura como `get_results()` que requieren variables dinámicas), será obligatorio el uso del método de preparación de sentencias, el cual se abordará en profundidad en la siguiente sección.

## 5.2 Consultas SQL seguras con prepare

Cuando utilizas los métodos de conveniencia descritos en la lección anterior (`insert`, `update`, `delete`), WordPress se encarga automáticamente de sanitizar y escapar los datos. Sin embargo, cuando necesitas ejecutar consultas complejas utilizando métodos directos como `get_results()`, `get_var()` o el método genérico `query()`, la responsabilidad de la seguridad recae completamente sobre ti.

La regla de oro en el desarrollo para WordPress es: **nunca confíes en la entrada del usuario y nunca pases variables directamente a una cadena SQL**. Hacerlo abre la puerta a ataques de Inyección SQL (SQLi), la vulnerabilidad más crítica en aplicaciones web.

Para blindar tus consultas, WordPress proporciona el método `$wpdb->prepare()`.

### El funcionamiento de prepare()

A diferencia de las sentencias preparadas nativas de extensiones como PDO (donde la consulta y los datos se envían por separado al servidor MySQL), `$wpdb->prepare()` actúa a nivel de PHP. Funciona de manera similar a la función `sprintf()` de PHP, tomando una cadena con marcadores de posición (*placeholders*) y sustituyéndolos por variables, pero añadiendo una capa vital: **escapa y entrecomilla automáticamente los valores**.

```text
[Consulta SQL con Placeholders] + [Datos Dinámicos (Inseguros)]
               |                               |
               +----------------+--------------+
                                |
                                v
                       $wpdb->prepare() 
                 (Sanea, escapa y entrecomilla)
                                |
                                v
                 [Cadena SQL 100% Segura y Lista]
                                |
                                v
               $wpdb->get_results() / $wpdb->query()

```

### Marcadores de posición admitidos

`$wpdb->prepare()` soporta un conjunto estricto de marcadores. Es crucial utilizar el correcto según el tipo de dato esperado en la base de datos:

* **`%s` (String):** Para cadenas de texto, fechas, horas y cualquier dato que no sea estrictamente numérico. **Nota importante:** `$wpdb->prepare()` añade las comillas simples automáticamente. Nunca debes escribir `'%s'` en tu consulta.
* **`%d` (Decimal/Integer):** Para números enteros. Si pasas una cadena o un decimal, lo convertirá a un entero.
* **`%f` (Float):** Para números con decimales.
* **`%i` (Identificador):** Introducido en WordPress 6.2. Sirve para escapar nombres de tablas o nombres de columnas dinámicamente. Nunca debe usarse para valores de datos.

### Ejemplos de implementación

#### 1. El antipatrón (Inseguro)

Nunca debes interpolar variables directamente en la cadena, incluso si crees que están sanitizadas previamente.

```php
global $wpdb;
// ❌ PELIGRO: Vulnerable a Inyección SQL
$sql = "SELECT * FROM {$wpdb->users} WHERE user_login = '$username'";
$user = $wpdb->get_row( $sql );

```

#### 2. La forma correcta

Utiliza `$wpdb->prepare()`. Puedes pasar los argumentos secuencialmente o como un array.

```php
global $wpdb;
// ✅ Seguro: Pasando argumentos secuencialmente
$sql = $wpdb->prepare( 
    "SELECT * FROM {$wpdb->users} WHERE user_login = %s AND user_status = %d", 
    $username, 
    0 
);
$user = $wpdb->get_row( $sql );

// ✅ Seguro: Pasando un array de argumentos (útil para datos dinámicos)
$args = array( $username, 0 );
$sql = $wpdb->prepare( 
    "SELECT * FROM {$wpdb->users} WHERE user_login = %s AND user_status = %d", 
    $args 
);
$user = $wpdb->get_row( $sql );

```

### El desafío de las cláusulas LIKE

Un error muy común ocurre al intentar usar sentencias `LIKE` para búsquedas, ya que el carácter comodín `%` entra en conflicto con la sintaxis de los marcadores de posición de `prepare()`.

Para resolver esto, WordPress dispone del método de ayuda `$wpdb->esc_like()`. Este método escapa específicamente los caracteres con significado especial en SQL (`%` y `_`) dentro de la cadena de búsqueda antes de que la pases a `prepare()`.

```php
global $wpdb;
$busqueda_usuario = 'admin';

// 1. Escapamos los comodines SQL nativos de la entrada del usuario
$termino_seguro = $wpdb->esc_like( $busqueda_usuario );

// 2. Añadimos nuestros comodines para la búsqueda
$termino_like = '%' . $termino_seguro . '%';

// 3. Preparamos la consulta
$sql = $wpdb->prepare(
    "SELECT post_title FROM {$wpdb->posts} WHERE post_title LIKE %s",
    $termino_like
);

$resultados = $wpdb->get_results( $sql );

```

### Uso de %i para identificadores dinámicos

Antes de WordPress 6.2, si necesitabas construir una consulta donde el nombre de la tabla o la columna dependía de una variable, no podías usar `prepare()` para esos elementos y debías recurrir a la función `sanitize_key()` y concatenación estricta. Ahora, con el marcador `%i`, es mucho más limpio:

```php
global $wpdb;
$columna_orden = 'post_date'; // Podría venir de una petición GET
$orden = 'DESC'; // ASC o DESC

// Aseguramos que el orden sea válido (prepare no maneja ASC/DESC)
$orden = ( strtoupper( $orden ) === 'ASC' ) ? 'ASC' : 'DESC';

// Preparamos usando %i para el nombre de la columna
$sql = $wpdb->prepare(
    "SELECT ID, post_title FROM {$wpdb->posts} ORDER BY %i {$orden} LIMIT %d",
    $columna_orden,
    10
);

$resultados = $wpdb->get_results( $sql );

```

Al dominar `$wpdb->prepare()`, garantizas que cualquier interacción compleja de lectura o escritura que tu plugin requiera estará protegida desde su concepción, cumpliendo con los estándares de seguridad requeridos por el repositorio oficial de WordPress.

## 5.3 Creación de tablas con dbDelta

Cuando los Custom Post Types, las taxonomías o la Metadata API nativa de WordPress no son suficientes para cubrir los requisitos de rendimiento o estructura de tu plugin, se hace necesario crear tablas personalizadas en la base de datos. Para realizar esta tarea de forma segura y estandarizada, WordPress proporciona la función `dbDelta()`.

Ubicada en `wp-admin/includes/upgrade.php`, `dbDelta()` es una herramienta que examina la estructura actual de la base de datos, la compara con la estructura declarada en tu código y realiza selectivamente los cambios necesarios (como añadir nuevas columnas o modificar tipos de datos) sin alterar ni borrar la información existente.

El flujo operativo de la función se puede representar de la siguiente manera:

```text
       [Estructura SQL deseada]
                  |
                  v
         +-----------------+
         |    dbDelta()    | <--- [Lee estructura real de la BD]
         +-----------------+
                  |
        Is table missing?
        /               \
     (Sí)               (No)
     /                     \
[CREATE TABLE]        [Compara columnas]
                            |
                     ¿Hay diferencias?
                     /               \
                  (Sí)               (No)
                  /                     \
       [ALTER TABLE]               [No hace nada]

```

### Las reglas estrictas de sintaxis de dbDelta()

La función `dbDelta()` es sumamente selectiva y sensible a la sintaxis del esquema SQL que recibe. Si no se respetan de manera estricta sus reglas de formateo, la función fallará silenciosamente, no creará la tabla o recreará la estructura en cada ejecución, afectando severamente el rendimiento.

Para que `dbDelta()` procese correctamente tu sentencia `CREATE TABLE`, debes cumplir los siguientes requisitos:

1. **Un elemento por línea:** Debes colocar cada definición de columna y cada declaración de clave en su propia línea dentro del bloque SQL.
2. **Dos espacios en PRIMARY KEY:** Debe haber exactamente dos espacios entre las palabras clave `PRIMARY KEY` y la definición del campo entre paréntesis: `PRIMARY KEY  (id)`. Un solo espacio romperá el analizador sintáctico interno de la función.
3. **Dos espacios en índices convencionales:** Al declarar un índice ordinario, debes usar la palabra clave `KEY` en lugar de `INDEX`, seguida de dos espacios, el nombre del índice, otros dos espacios y la columna afectada: `KEY mi_indice  (columna)`.
4. **Tipos de datos en minúsculas:** Los tipos de datos de SQL (como `int`, `bigint`, `varchar`, `text`, `datetime`) deben escribirse estrictamente en minúsculas.
5. **Sin acentos graves (backticks):** No utilices el carácter de acento grave (```) para envolver los nombres de las tablas o de las columnas, práctica común en exportaciones directas de phpMyAdmin.
6. **Longitudes explícitas:** Especifica siempre la longitud de los campos de texto ajustables, por ejemplo, `varchar(255)`.

### Implementación práctica en la activación del plugin

El momento idóneo para crear o actualizar el esquema de base de datos de un plugin es durante su rutina de activación, utilizando el hook `register_activation_hook()`.

A continuación se detalla una implementación profesional que incorpora el juego de caracteres nativo del sitio mediante `$wpdb->get_charset_collate()` para asegurar la compatibilidad idiomática de los datos almacenados:

```php
<?php
/**
 * Ejecuta la creación o actualización de la tabla personalizada.
 */
function un_plugin_crear_tabla_personalizada() {
    global $wpdb;

    // Definir el nombre de la tabla anteponiendo el prefijo dinámico
    $nombre_tabla = $wpdb->prefix . 'registro_envios';

    // Obtener la colación y el conjunto de caracteres correctos de la instalación
    $charset_collate = $wpdb->get_charset_collate();

    // Construcción del esquema siguiendo las reglas estrictas de dbDelta
    $sql = "CREATE TABLE $nombre_tabla (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        id_usuario bigint(20) NOT NULL,
        codigo_seguimiento varchar(100) NOT NULL,
        estado_envio varchar(50) DEFAULT 'pendiente' NOT NULL,
        fecha_creacion datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
        PRIMARY KEY  (id),
        KEY id_usuario  (id_usuario)
    ) $charset_collate;";

    // dbDelta no está cargada por defecto en el entorno global de WordPress
    require_once ABSPATH . 'wp-admin/includes/upgrade.php';

    // Ejecuta la abstracción de actualización del esquema
    dbDelta( $sql );
}

// Vincula la función al ciclo de vida de activación del plugin
register_activation_hook( __FILE__, 'un_plugin_crear_tabla_personalizada' );

```

### Verificación de la creación de la tabla

Para validar si `dbDelta()` completó correctamente la operación, puedes inspeccionar el arreglo que retorna la función o verificar directamente la propiedad `$wpdb->last_error` inmediatamente después de la llamada:

```php
$resultado = dbDelta( $sql );

if ( ! empty( $wpdb->last_error ) ) {
    // Manejo de errores o logging en entornos de desarrollo
    error_log( 'Error en dbDelta: ' . $wpdb->last_error );
}

```

El valor devuelto por `dbDelta()` es un array asociativo donde las llaves son los nombres de las tablas y los valores contienen cadenas de texto descriptivas con las acciones exactas realizadas (por ejemplo, `"Created table $nombre_tabla"` o `"Added column $nombre_tabla.nueva_columna"`). Si la estructura de la base de datos ya coincide plenamente con la consulta provista, el array retornado estará vacío, garantizando que no se consumieron recursos innecesarios del servidor MySQL.

## 5.4 Actualización de esquemas de datos

A medida que tu plugin evoluciona y se publican nuevas versiones, es altamente probable que las tablas personalizadas que creaste en versiones iniciales requieran modificaciones: añadir una nueva columna, modificar el tipo de dato de un campo existente o incorporar un nuevo índice para optimizar consultas.

Como vimos en la lección anterior, la función `dbDelta()` es destructivamente segura; es decir, altera la estructura existente sin purgar los datos. Sin embargo, procesar `dbDelta()` es una operación costosa a nivel de rendimiento. Si ejecutas la rutina de actualización en cada carga de página o incluso en cada inicialización del panel de administración, el tiempo de respuesta de WordPress se verá severamente degradado.

La solución arquitectónica estándar en WordPress es implementar un **sistema de control de versiones de la base de datos**.

### El flujo de actualización basado en versiones

El concepto fundamental radica en definir la versión de la estructura de base de datos actual en el código fuente de tu plugin y compararla con la versión almacenada en la base de datos (utilizando la Options API). Solo si la versión del código es superior a la guardada en la base de datos, se dispara la rutina de actualización.

```text
[Inicialización del Plugin] (Hook: plugins_loaded)
               |
               v
  Obtener 'plugin_db_version' desde la BD
               |
               v
 ¿Versión en código > Versión en BD?
          /               \
       (Sí)               (No)
       /                     \
[Ejecutar dbDelta()]   [Continuar ejecución normal]
       |                     (Sin impacto en rendimiento)
[Actualizar 'plugin_db_version' en BD]

```

### Implementación del sistema de control de versiones

Para materializar esta lógica, necesitas establecer una constante global (o propiedad de clase) que defina la versión del esquema, y una rutina anclada al hook `plugins_loaded` que realice la comprobación de forma temprana en el ciclo de vida de WordPress.

A continuación, se detalla una estructura profesional para gestionar este proceso:

```php
<?php
// 1. Definir la versión actual de la base de datos en el código
define( 'MI_PLUGIN_DB_VERSION', '1.2.0' );

/**
 * Función principal de actualización del esquema.
 * Contiene la estructura SQL más reciente.
 */
function mi_plugin_actualizar_esquema() {
    global $wpdb;
    $nombre_tabla = $wpdb->prefix . 'registro_envios';
    $charset_collate = $wpdb->get_charset_collate();

    // Nueva estructura SQL (ej. hemos añadido la columna 'notas_internas')
    $sql = "CREATE TABLE $nombre_tabla (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        id_usuario bigint(20) NOT NULL,
        codigo_seguimiento varchar(100) NOT NULL,
        estado_envio varchar(50) DEFAULT 'pendiente' NOT NULL,
        notas_internas text,
        fecha_creacion datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
        PRIMARY KEY  (id),
        KEY id_usuario  (id_usuario)
    ) $charset_collate;";

    require_once ABSPATH . 'wp-admin/includes/upgrade.php';
    dbDelta( $sql );

    // 2. Actualizar la versión en la base de datos tras ejecutar dbDelta
    update_option( 'mi_plugin_db_version', MI_PLUGIN_DB_VERSION );
}

/**
 * Comprueba si es necesario actualizar la base de datos.
 */
function mi_plugin_comprobar_actualizacion_db() {
    // Recuperar la versión instalada (devuelve false si no existe)
    $version_instalada = get_option( 'mi_plugin_db_version' );

    // 3. Comparar las versiones
    if ( $version_instalada !== MI_PLUGIN_DB_VERSION ) {
        mi_plugin_actualizar_esquema();
    }
}

// 4. Anclar la comprobación al inicio de la carga de los plugins
add_action( 'plugins_loaded', 'mi_plugin_comprobar_actualizacion_db' );

```

### Manejo de actualizaciones complejas (Migraciones)

Aunque `dbDelta()` es excelente para gestionar columnas e índices, hay operaciones estructurales que no puede resolver automáticamente, como:

* Renombrar una columna existente.
* Eliminar una columna (Drop column).
* Migrar o transformar datos de una tabla a otra.

Para estos casos excepcionales donde `dbDelta()` no es suficiente, tu rutina de comprobación de versiones debe ejecutar sentencias SQL directas utilizando `$wpdb->query()`. Es vital segmentar estas operaciones por versión para asegurar que un usuario que actualiza desde la versión 1.0 hasta la 3.0 pase por todos los pasos intermedios secuencialmente:

```php
function mi_plugin_migraciones_especificas() {
    global $wpdb;
    $version_instalada = get_option( 'mi_plugin_db_version' );
    $nombre_tabla = $wpdb->prefix . 'registro_envios';

    // Si viene de una versión anterior a 1.5.0, borrar una columna obsoleta
    if ( version_compare( $version_instalada, '1.5.0', '<' ) ) {
        $wpdb->query( "ALTER TABLE $nombre_tabla DROP COLUMN columna_obsoleta" );
    }

    // Actualizar finalmente el esquema estructural estándar
    mi_plugin_actualizar_esquema();
}

```

Implementar este patrón garantiza que las tablas de tu plugin estén siempre sincronizadas con la lógica del código de manera predecible, automatizada y respetando los recursos de la instalación de WordPress del usuario.

## Resumen del capítulo

En este capítulo hemos profundizado en la capa de persistencia de datos de WordPress, dominando las herramientas que el núcleo ofrece para interactuar con la base de datos sin comprometer la seguridad ni la estabilidad de la plataforma:

1. **La clase `$wpdb`:** Comprendimos cómo esta instancia global actúa como interfaz de comunicación, ofreciendo métodos eficientes (`get_var`, `get_results`, `insert`, `update`) para manipular información.
2. **Consultas Seguras:** Adoptamos el uso estricto de `$wpdb->prepare()` para sanitizar, escapar y blindar cualquier variable dinámica frente a ataques de inyección SQL, incluyendo el uso de `esc_like` y comodines dinámicos.
3. **Creación de Esquemas:** Exploramos `dbDelta()` y sus rígidas reglas sintácticas para construir y desplegar tablas personalizadas de forma no destructiva durante la activación del plugin.
4. **Mantenimiento y Control de Versiones:** Establecimos una arquitectura basada en `plugins_loaded` y la Options API para actualizar las estructuras de datos de manera silenciosa, secuencial y óptima para el rendimiento del servidor en cada nueva versión del plugin.
