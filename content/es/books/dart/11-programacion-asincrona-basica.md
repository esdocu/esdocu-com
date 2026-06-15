Las aplicaciones modernas no pueden permitirse congelar su interfaz mientras esperan una respuesta de red o leen un archivo del disco. Dart resuelve este desafío con un enfoque elegante: un único hilo de ejecución respaldado por un potente ciclo de eventos.

En este capítulo descubrirás los cimientos de la asincronía en Dart. Aprenderás cómo el **Event Loop** orquesta las tareas en segundo plano, cómo los objetos **Future** actúan como promesas de datos venideros y de qué manera la sintaxis **async/await** te permite escribir código asíncrono con la claridad y fluidez del código secuencial, incluyendo la captura y gestión robusta de sus errores.

## 11.1 El Event Loop de Dart

Para comprender cómo Dart gestiona las tareas asíncronas sin necesidad de recurrir a la complejidad del multihilo tradicional, es indispensable entender su modelo de ejecución. A diferencia de otros lenguajes donde múltiples hilos de ejecución acceden simultáneamente a la memoria compartida, Dart es un lenguaje diseñado bajo el modelo de **un solo hilo de ejecución (single-threaded)**.

Esto significa que Dart ejecuta una sola cosa a la vez. No existen condiciones de carrera (*race conditions*) clásicas ni bloqueos mutuos (*deadlocks*) provocados por hilos compitiendo por los mismos datos. Sin embargo, surge una pregunta evidente: si solo hay un hilo, ¿cómo puede una aplicación de Dart realizar peticiones de red, leer archivos o procesar la entrada del usuario sin congelar la aplicación? La respuesta es el **Event Loop** (Bucle de Eventos).

### El modelo de aislamiento (Isolate)

Cuando un programa de Dart se inicia, el sistema crea un proceso empaquetado llamado **Isolate** (Aislado). Este espacio cuenta con su propia memoria privada y un único hilo de ejecución. Nadie fuera de este Isolate puede tocar su memoria.

Dentro de este hilo único, coexisten tres elementos fundamentales:

1. **El hilo principal:** Ejecuta el código secuencial de arriba a abajo (como la función `main()`).
2. **La cola de Microtareas (Microtask Queue):** Almacena tareas internas del sistema muy cortas que deben ejecutarse de forma prioritaria.
3. **La cola de Eventos (Event Queue):** Almacena eventos externos que provienen del sistema operativo o del propio entorno, tales como clics, temporizadores, respuestas de peticiones HTTP o lectura de archivos.

```text
+-------------------------------------------------------+
|                       ISOLATE                         |
|                                                       |
|  [ Memoria Privada ]                                  |
|                                                       |
|  [ Hilo de Ejecución ]                                |
|         │                                             |
|         ▼                                             |
|   ┌────────────┐        ┌─────────────────────────┐   |
|   │ Microtask  │        │       Event Queue       │   |
|   │   Queue    │        │                         │   |
|   ├────────────┤        ├─────────────────────────┤   |
|   │ Tarea M1   │        │ Evento E1 (Clic)        │   |
|   │ Tarea M2   │        │ Evento E2 (HTTP Resp)   │   |
|   └────────────┘        └─────────────────────────┘   |
|         │                            │                |
|         └──────────────┬─────────────┘                |
|                        │                              |
|                        ▼                              |
|             ┌────────────────────┐                    |
|             │     EVENT LOOP     │                    |
|             └────────────────────┘                    |
+-------------------------------------------------------+

```

### Funcionamiento del Event Loop

El Event Loop es un bucle infinito cuya única tarea es regular el tráfico de ejecución. Su algoritmo de funcionamiento sigue un orden de prioridad estricto y secuencial:

1. **Ejecución Síncrona:** Primero, se ejecuta todo el código síncrono del bloque principal (la función `main`). El Event Loop no entra en acción hasta que este código finaliza por completo.
2. **Revisión de Microtareas:** El Event Loop inspecciona la *Microtask Queue*. Si contiene elementos, los ejecuta uno por uno en orden de llegada (FIFO: *First In, First Out*) hasta que la cola quede completamente vacía.
3. **Revisión de Eventos:** Solo cuando la *Microtask Queue* está vacía, el Event Loop toma el **primer** evento de la *Event Queue* y lo ejecuta.
4. **Bucle de Prioridad:** Tras procesar **un solo** evento de la *Event Queue*, el Event Loop no pasa automáticamente al siguiente evento. En su lugar, vuelve a comprobar si han aparecido nuevas microtareas. Si la cola de microtareas tiene elementos, los vacía por completo antes de procesar el siguiente evento.

Si ambas colas quedan vacías, el Event Loop se queda esperando de forma pasiva a que ingresen nuevos eventos a la cola.

### Diferencias entre Microtask Queue y Event Queue

Es vital distinguir cuándo una tarea se aloja en una cola o en otra, ya que esto determina el impacto en la fluidez de la aplicación.

| Característica | Cola de Microtareas (*Microtask Queue*) | Cola de Eventos (*Event Queue*) |
| --- | --- | --- |
| **Origen** | Tareas internas del framework o código crítico del sistema. | Eventos externos (I/O, periféricos, temporizadores). |
| **Prioridad** | Máxima. Bloquea la ejecución de eventos externos. | Baja. Espera a que no existan microtareas pendientes. |
| **Flujo** | Se vacía por completo de forma ininterrumpida. | Se procesa uno a uno, reevaluando las microtareas después de cada evento. |
| **Uso común** | Operaciones de limpieza de recursos inmediatas que deben ocurrir antes de devolver el control al exterior. | Peticiones de red, consultas a bases de datos, renderizado de interfaces gráficas. |

> **Nota de diseño:** Si saturas la *Microtask Queue* con código pesado o bucles infinitos, la *Event Queue* jamás se procesará. Esto provocará que tu aplicación deje de responder a clics, gestos o eventos de dibujo, congelando la interfaz de usuario de forma idéntica a como ocurriría en un lenguaje síncrono.

### Código de demostración del orden de ejecución

Para visualizar el comportamiento del Event Loop en Dart, se puede forzar la inserción de tareas en las respectivas colas utilizando funciones de la biblioteca estándar de Dart (`dart:async`).

* `scheduleMicrotask()`: Añade una función a la *Microtask Queue*.
* `Future()`: Añade una función a la *Event Queue*.

Analicemos el siguiente bloque de código:

```dart
import 'dart:async';

void main() {
  print('1. Inicio del bloque síncrono (main)');

  // Añadiendo un evento a la Event Queue
  Future(() {
    print('5. Evento procesado en la Event Queue (Evento 1)');
  });

  // Añadiendo otro evento a la Event Queue
  Future(() {
    print('6. Evento procesado en la Event Queue (Evento 2)');
    
    // Insertamos una microtarea desde dentro de un evento
    scheduleMicrotask(() {
      print('8. Microtarea inesperada añadida durante el Evento 2');
    });
  });

  // Añadiendo una microtarea a la Microtask Queue
  scheduleMicrotask(() {
    print('3. Microtarea procesada en la Microtask Queue (Microtarea 1)');
  });

  // Añadiendo otra microtarea a la Microtask Queue
  scheduleMicrotask(() {
    print('4. Microtarea procesada en la Microtask Queue (Microtarea 2)');
  });

  // Añadiendo un evento que se ejecutará después de otro evento
  Future(() {
    print('7. Evento procesado en la Event Queue (Evento 3)');
  });

  print('2. Fin del bloque síncrono (main)');
}

```

#### Salida por consola detallada

```text
1. Inicio del bloque síncrono (main)
2. Fin del bloque síncrono (main)
3. Microtarea procesada en la Microtask Queue (Microtarea 1)
4. Microtarea procesada en la Microtask Queue (Microtarea 2)
5. Evento procesado en la Event Queue (Evento 1)
6. Evento procesado en la Event Queue (Evento 2)
8. Microtarea inesperada añadida durante el Evento 2
7. Evento procesado en la Event Queue (Evento 3)

```

#### Explicación paso a paso del resultado

1. **Líneas síncronas (1 y 2):** El flujo principal de `main()` se ejecuta de forma inmediata. Las funciones `Future` y `scheduleMicrotask` solo programan código para más adelante; no se detienen ahí. Por ello, vemos los mensajes `1` y `2` de corrido.
2. **Vaciado de Microtareas (3 y 4):** Una vez que `main()` termina, el Event Loop toma el control. Detecta que hay dos elementos en la *Microtask Queue*. Los procesa consecutivamente (`3` y `4`).
3. **Procesamiento de Eventos (5 y 6):** Con la cola de microtareas vacía, toma el primer elemento de la *Event Queue* e imprime `5`. Al terminar, evalúa las microtareas (está vacía) y toma el segundo evento, imprimiendo `6`.
4. **Interrupción por Microtarea (8):** Durante la ejecución del Evento 2, se ejecutó un `scheduleMicrotask()`. Esto insertó de inmediato una tarea en la *Microtask Queue*. Por ende, antes de que el Event Loop tome el Evento 3 de la lista de espera, detecta la microtarea recién llegada y la procesa de forma prioritaria, imprimiendo `8`.
5. **Finalización (7):** Finalmente, con las microtareas vacías nuevamente, el Event Loop extrae el último evento programado de la cola e imprime `7`.

## 11.2 El concepto de Future

En la sección anterior comprendimos cómo el Event Loop gestiona las tareas encoladas en un único hilo de ejecución. Ahora bien, para poder interactuar de forma práctica con ese mecanismo de asincronía, Dart introduce un objeto especializado que actúa como un puente entre el código que solicita un dato y la tarea que lo procesará en el futuro. Este objeto es la clase `Future`.

Un `Future` (Futuro) representa el resultado de una operación asíncrona que aún no se ha completado. Es, literalmente, una promesa de que se entregará un valor o un error en un momento posterior. Cuando ejecutas una función que devuelve un `Future`, la función no se detiene a esperar a que la tarea termine; en su lugar, devuelve inmediatamente este objeto "contenedor" vacío y permite que el hilo principal continúe con otras tareas.

### Los Estados de un Future

A lo largo de su ciclo de vida, un `Future` transita por una serie de estados internos inmutables. Es fundamental entender este flujo para saber cómo reaccionará nuestro código.

```text
                  ┌──────────────────────────────┐
                  │          Uncompleted         │
                  │  (Operación en ejecución)    │
                  └──────────────┬───────────────┘
                                 │
                   Al terminar la tarea asíncrona
                                 ▼
                  ┌──────────────────────────────┐
                  │           Completed          │
                  └──────────────┬───────────────┘
                                 │
         ┌───────────────────────┴───────────────────────┐
         ▼                                               ▼
┌─────────────────────────┐                     ┌─────────────────────────┐
│      With a Value       │                     │       With an Error     │
│  (Operación exitosa)    │                     │   (Operación fallida)   │
└─────────────────────────┘                     └─────────────────────────┘

```

1. **Uncompleted (No completado):** Es el estado inicial. La operación asíncrona ha sido delegada a la *Event Queue* y se encuentra en proceso (por ejemplo, esperando la respuesta de un servidor o la lectura de un disco duro). En este punto, no se puede extraer ningún valor.
2. **Completed (Completado):** Cuando la operación finaliza, el `Future` cambia a un estado completado, el cual es permanente. Este estado se divide en dos vertientes:

* **Completed with a value (Completado con éxito):** La operación tuvo éxito y el contenedor ahora guarda el valor resultante (un `String`, un `int`, un objeto personalizado, etc.).
* **Completed with an error (Completado con error):** La operación falló debido a una excepción (un fallo de red, un archivo no encontrado, etc.). El `Future` almacena la información del fallo para que el programa pueda gestionarlo.

### Sintaxis basada en Métodos (API Fluida)

Antes de la llegada de las palabras clave modernas de asincronía, la forma nativa de interactuar con un `Future` y reaccionar a sus cambios de estado era mediante el uso de sus métodos integrados: `.then()`, `.catchError()` y `.whenComplete()`.

A continuación, se presenta la estructura de un `Future` que emula una descarga de datos mediante su constructor especializado `Future.delayed`:

```dart
import 'dart:async';

// Función que simula una petición de red y devuelve un Future
Future<String> fetchUserData() {
  return Future.delayed(Duration(seconds: 2), () {
    // Este bloque de código se ejecutará de forma asíncrona tras 2 segundos
    bool exito = true; 
    
    if (exito) {
      return 'Usuario: @danidev26';
    } else {
      throw Exception('No se pudo conectar al servidor.');
    }
  });
}

void main() {
  print('1. Inicio del programa principal.');

  // Llamamos a la función asíncrona
  Future<String> miFuture = fetchUserData();

  print('2. Petición lanzada. El Future está en estado "Uncompleted".');

  // Registramos los callbacks para reaccionar cuando cambie de estado
  miFuture
    .then((valor) {
      // Se ejecuta solo si el Future se completa con éxito
      print('4. Éxito: Se ha recibido el valor -> $valor');
    })
    .catchError((error) {
      // Se ejecuta solo si el Future se completa con un error
      print('4. Error detectado: $error');
    })
    .whenComplete(() {
      // Se ejecuta SIEMPRE, ya sea con éxito o con error (equivalente a finally)
      print('5. Operación finalizada por completo.');
    });

  print('3. Fin del bloque síncrono. El hilo queda libre.');
}

```

#### Salida por consola esperada (Caso Exitoso)

```text
1. Inicio del programa principal.
2. Petición lanzada. El Future está en estado "Uncompleted".
3. Fin del bloque síncrono. El hilo queda libre.
(Espera de 2 segundos...)
4. Éxito: Se ha recibido el valor -> Usuario: @danidev26
5. Operación finalizada por completo.

```

#### Análisis del flujo

Note cómo el mensaje `3` se imprime antes que el `4` y el `5`. El programa síncrono principal termina por completo su ejecución, liberando el hilo. El `Future.delayed` coloca el callback dentro de la *Event Queue*. Transcurridos los dos segundos, el Event Loop detecta el evento, ejecuta el código interno de la función, resuelve el valor y dispara secuencialmente las cláusulas `.then()` y `.whenComplete()`.

### Constructores Especializados de Future

La clase `Future` provee varios constructores de fábrica útiles para resolver escenarios específicos de manera limpia sin tener que escribir lógica compleja:

* **`Future.value(value)`:** Crea un `Future` que ya está completado con un valor específico de forma inmediata. Útil en pruebas unitarias o cuando se implementan interfaces donde un método debe ser asíncrono pero la respuesta ya se tiene en memoria caché.
* **`Future.error(error)`:** Crea un `Future` que se completa inmediatamente con un fallo.
* **`Future.delayed(duration, computation)`:** Retarda la inserción de la tarea en la *Event Queue* durante el tiempo especificado en `duration`.

```dart
void demostracionConstructores() {
  // Completado inmediatamente con valor
  Future<int> valorInmediato = Future.value(42);
  
  // Completado inmediatamente con error
  Future<void> errorInmediato = Future.error(UnimplementedError('Pendiente'));

  valorInmediato.then((v) => print('Valor inmediato: $v'));
  errorInmediato.catchError((e) => print('Error inmediato manejado: $e'));
}

```

### Operaciones en Paralelo: `Future.wait`

Aunque Dart procesa todo en un solo hilo a través de la cola de eventos, es común necesitar lanzar múltiples operaciones asíncronas concurrentes (por ejemplo, descargar tres imágenes al mismo tiempo) y esperar a que todas terminen antes de proceder. Para esto se utiliza `Future.wait`.

Este método estático toma una lista de `Futures`, los ejecuta de manera concurrente y devuelve un nuevo `Future` que se completará con una lista que contiene todos los resultados en el mismo orden original.

```dart
void main() {
  print('Iniciando descargas múltiples...');

  Future<String> descarga1 = Future.delayed(Duration(seconds: 3), () => 'Imagen_A.png');
  Future<String> descarga2 = Future.delayed(Duration(seconds: 1), () => 'Imagen_B.png');
  Future<String> descarga3 = Future.delayed(Duration(seconds: 2), () => 'Imagen_C.png');

  // Future.wait agrupa los futures concurrentes
  Future.wait([descarga1, descarga2, descarga3])
    .then((List<String> resultados) {
      print('¡Todas las descargas han finalizado!');
      print('Resultados guardados: $resultados');
    })
    .catchError((error) {
      print('Una de las descargas falló y canceló el grupo: $error');
    });
}

```

#### Salida por consola

```text
Iniciando descargas múltiples...
(Espera de 3 segundos, que es el tiempo del Future más lento...)
¡Todas las descargas han finalizado!
Resultados guardados: [Imagen_A.png, Imagen_B.png, Imagen_C.png]

```

> **Regla de oro de `Future.wait`:** Si cualquiera de los `Futures` del listado falla y arroja una excepción, el `Future` general retornado por `Future.wait` se completará inmediatamente con ese error, ignorando los resultados de las tareas que sí tuvieron éxito.
>
## 11.3 Sintaxis async y await

Aunque la API fluida de los `Futures` mediante métodos como `.then()` y `.catchError()` es completamente funcional, su uso extensivo puede derivar en un problema conocido como *Callback Hell* (infierno de funciones de retorno). Cuando una operación asíncrona depende del resultado de otra, y esta a su vez de una tercera, el código comienza a anidarse de forma horizontal, volviéndose sumamente complejo de leer, mantener y depurar.

Para resolver esto, Dart introduce las palabras clave **`async`** y **`await`**. Esta sintaxis no cambia el modelo de ejecución basado en el Event Loop ni altera el funcionamiento de los `Futures`; se trata de un mecanismo de **azúcar sintáctico** (*syntactic sugar*). Su propósito es permitirnos escribir código asíncrono con una estructura visual idéntica a la del código síncrono o secuencial.

### Las reglas de oro de `async` y `await`

Para utilizar esta sintaxis, se deben cumplir dos reglas estructurales estrictas en el lenguaje:

1. **La palabra clave `async`:** Se coloca justo antes del cuerpo de una función. Su presencia le indica a Dart dos cosas: que la función se ejecutará de manera asíncrona y que el valor de retorno de dicha función se empaquetará automáticamente dentro de un `Future`.
2. **La palabra clave `await`:** Solo se puede usar **dentro** de una función que haya sido declarada como `async`. Se coloca justo antes de una expresión que devuelva un `Future`. Su efecto es suspender temporalmente la ejecución de esa función específica hasta que el `Future` se complete (ya sea devolviendo un valor o un error).

### Transformación de código: De `.then()` a `async` / `await`

Para apreciar la ganancia en legibilidad, comparemos un flujo asíncrono que requiere de tres pasos secuenciales simulados utilizando ambas sintaxis.

#### Enfoque tradicional con `.then()`

```dart
Future<void> procesarPedidoTradicional() {
  return verificarStock('Camisa')
    .then((itemDisponible) {
      return generarFactura(itemDisponible)
        .then((facturaId) {
          return enviarConfirmacion(facturaId)
            .then((resultado) {
              print('Proceso completado: $resultado');
            });
        });
    });
}

```

#### Enfoque moderno con `async` y `await`

```dart
Future<void> procesarPedidoModerno() async {
  // El hilo suspende ESTA función aquí hasta que verificarStock termine
  String itemDisponible = await verificarStock('Camisa');
  
  // Una vez reanudada, pasa a la siguiente línea asíncrona
  int facturaId = await generarFactura(itemDisponible);
  
  String resultado = await enviarConfirmacion(facturaId);
  
  print('Proceso completado: $resultado');
}

```

Ambas estructuras realizan exactamente lo mismo en el Event Loop, pero la versión con `async` y `await` se lee de arriba a abajo de forma natural, eliminando la anidación progresiva de paréntesis y llaves.

### ¿Cómo funciona `await` bajo el capó?

Es un error común pensar que `await` detiene o bloquea el hilo único de ejecución de Dart. Si `await` bloqueara el hilo, toda la aplicación se congelaría durante la espera.

Lo que ocurre en realidad es una **suspensión selectiva**:

1. Cuando la ejecución de la función encuentra la palabra clave `await`, la función `async` detiene temporalmente su avance.
2. La función cede inmediatamente el control del hilo de ejecución devolviendo un `Future` no completado al entorno que la llamó.
3. El hilo de Dart queda completamente libre para procesar cualquier otro evento en la *Event Queue* o tareas pendientes en la *Microtask Queue*.
4. Cuando el `Future` que se estaba esperando con el `await` se completa en la *Event Queue*, el Event Loop toma ese resultado, reactiva la función suspendida exactamente en la línea donde se quedó y le asigna el valor extraído a la variable.

```text
Línea síncrona dentro de la función async
                │
                ▼
      [ Encuentra un await ] ───► Suspende la función y devuelve un Future
                │                 El hilo principal sigue procesando eventos
  Espera a que el Future termine
                │
                ▼
     Reanuda la función async
                │
                ▼
Asigna el valor resuelto a la variable

```

### Ejemplo práctico ejecutable

El siguiente ejemplo demuestra el orden cronológico en el que se ejecutan las líneas cuando se interactúa con funciones marcadas con `async` y expresiones pausadas por `await`:

```dart
import 'dart:async';

// Una función síncrona que simula una demora regresando un Future
Future<String> obtenerDetallesEnvio() {
  return Future.delayed(Duration(seconds: 2), () => 'Paquete enviado por DHL');
}

// Función asíncrona principal del flujo
Future<void> realizarSeguimiento() async {
  print('  [Seguimiento] Iniciando consulta de tracking...');
  
  // Aquí la función se suspende. El control vuelve a main()
  String resultado = await obtenerDetallesEnvio();
  
  // Esto solo se ejecuta tras los 2 segundos de espera
  print('  [Seguimiento] Resultado obtenido: $resultado');
  print('  [Seguimiento] Finalizando flujo de seguimiento.');
}

void main() async {
  print('1. Inicio de la función main (síncrono).');

  // Llamamos a la función asíncrona.
  // Nota: No usamos await aquí intencionalmente para ver el flujo.
  realizarSeguimiento();

  print('2. La función realizarSeguimiento ya fue llamada.');
  print('3. Fin de la función main (El hilo queda libre para el Event Loop).');
}

```

#### Salida por consola paso a paso

```text
1. Inicio de la función main (síncrono).
  [Seguimiento] Iniciando consulta de tracking...
2. La función realizarSeguimiento ya fue llamada.
3. Fin de la función main (El hilo queda libre para el Event Loop).
(Espera de 2 segundos en el sistema operativo / Event Loop...)
  [Seguimiento] Resultado obtenido: Paquete enviado por DHL
  [Seguimiento] Finalizando flujo de seguimiento.

```

#### Análisis detallado de la ejecución

1. Se ejecuta el bloque síncrono inicial de `main()` (Mensaje `1`).
2. Se invoca `realizarSeguimiento()`. Como su bloque inicial es síncrono, entra a la función e imprime `[Seguimiento] Iniciando consulta...`.
3. La función llega a la línea con `await obtenerDetallesEnvio()`. En ese milisegundo, la función `realizarSeguimiento` congela su estado interno y devuelve el control a `main()`.
4. `main()` continúa inmediatamente con sus líneas subsecuentes, imprimiendo el mensaje `2` y el mensaje `3`.
5. `main()` finaliza. El hilo principal no tiene más código síncrono por procesar.
6. Transcurren los 2 segundos del temporizador. El Event Loop extrae la resolución del `Future`, busca la función que estaba suspendida esperándolo (`realizarSeguimiento`) y reanuda su ejecución interna imprimiendo las dos últimas líneas.

## 11.4 Manejo de errores en Futures

Toda operación que depende de agentes externos (como servidores que pueden caerse, archivos que pueden no existir o conexiones de internet inestables) está sujeta a fallos. En la programación asíncrona, ignorar estos fallos puede provocar fugas de memoria, estados inconsistentes en la aplicación o cierres inesperados (*crashes*).

Afortunadamente, Dart ofrece mecanismos robustos para interceptar y gestionar estas excepciones de manera limpia. Dependiendo de si estás utilizando la sintaxis de métodos (*API fluida*) o la sintaxis estructural moderna (`async`/`await`), la estrategia de captura se adaptará para mantener el código legible y controlado.

### Manejo de errores con la sintaxis async/await

La mayor ventaja de usar la combinación `async`/`await` es que nos permite reutilizar la misma estructura estándar de manejo de errores que ya conocemos de la programación síncrona: el bloque **`try-catch-finally`** (estudiado a fondo en el Capítulo 10).

Cuando un `Future` se completa con un error, la palabra clave `await` se encarga de desempaquetar dicho error y **lanzarlo como una excepción ordinaria** en la línea exacta donde se invocó. Esto detiene el flujo secuencial de la función `async` y transfiere el control directamente al bloque `catch`.

```dart
import 'dart:async';

Future<String> simularPeticionServidor() async {
  return Future.delayed(Duration(seconds: 1), () {
    // Simulamos un fallo lanzando una excepción dentro del Future
    throw FormatException('El servidor devolvió un JSON corrupto.');
  });
}

Future<void> ejecutarProceso() async {
  print('Iniciando proceso...');
  try {
    // Al usar await, si el Future falla, la excepción se dispara aquí
    String datos = await simularPeticionServidor();
    print('Datos recibidos: $datos'); // Esta línea nunca se ejecutará
  } on FormatException catch (e) {
    // Captura específica para un tipo de error conocido
    print('Error de formato específico interceptado: ${e.message}');
  } catch (e) {
    // Captura genérica para cualquier otro tipo de error
    print('Se produjo un error inesperado: $e');
  } finally {
    // Este bloque se ejecuta de forma garantizada tras el éxito o el fallo
    print('Limpieza de recursos: Proceso finalizado.');
  }
}

void main() async {
  await ejecutarProceso();
}

```

#### Salida por consola

```text
Iniciando proceso...
Error de formato específico interceptado: El servidor devolvió un JSON corrupto.
Limpieza de recursos: Proceso finalizado.

```

### Manejo de errores en la API fluida (.catchError)

Si estás trabajando con `Futures` sin la sintaxis `async`/`await` (por ejemplo, al retornar un flujo directo de inicialización o dentro de una prueba unitaria rápida), la captura se realiza mediante el método encadenado **`.catchError()`**.

Este método actúa como un escudo interceptor en la cadena de ejecución. Si algún eslabón previo de la cadena de `Futures` arroja un error, el control salta inmediatamente los bloques `.then()` restantes y busca el `.catchError()` más cercano.

```dart
void main() {
  print('Inicio del programa.');

  Future<int> calcularMetricas() {
    return Future.delayed(Duration(seconds: 1), () {
      throw TimeoutException('La base de datos tardó demasiado en responder.');
    });
  }

  calcularMetricas()
    .then((resultado) {
      print('El resultado es: $resultado');
      return resultado * 2;
    })
    .then((resultadoDuplicado) {
      print('Resultado duplicado: $resultadoDuplicado');
    })
    .catchError((error) {
      // Maneja cualquier error ocurrido en la función original o en los .then()
      print('Callback de error activado: $error');
    })
    .whenComplete(() {
      print('Operación terminada (equivalente al finally).');
    });

  print('Fin del bloque principal síncrono.');
}

```

#### Salida por consola

```text
Inicio del programa.
Fin del bloque principal síncrono.
Callback de error activado: TimeoutException: La base de datos tardó demasiado en responder.
Operación terminada (equivalente al finally).

```

#### Recuperación de valores en `.catchError`

Un detalle técnico avanzado del método `.catchError()` es que puede actuar como un **sistema de recuperación de fallos**. Puedes hacer que devuelva un valor alternativo del mismo tipo que el `Future` original para que la cadena subsecuente pueda continuar operando con un valor por defecto (*fallback value*).

```dart
Future.value(10)
  .then((val) => throw Exception('Fallo intermedio'))
  .catchError((error) {
    print('Error mitigado. Usando valor por defecto (0).');
    return 0; // Devolvemos un valor de rescate
  })
  .then((val) => print('La cadena continuó con el valor: $val')); // Imprime 0

```

### Errores no capturados (*Uncaught Errors*)

¿Qué sucede si un `Future` se completa con un error y no proveemos ningún bloque `try-catch` ni método `.catchError()`?

En Dart, los errores asíncronos no capturados viajan hacia arriba en la zona de ejecución (*Zone*). Si llegan al nivel más alto sin ser interceptados, el programa imprimirá el *stack trace* (traza de la pila) en la consola de depuración. En aplicaciones de consola, esto puede detener el flujo; en entornos como Flutter, puede provocar pantallas de error visuales o fallos silenciosos en la lógica de negocio.

Por ello, la regla de oro de la asincronía en Dart dicta: **Todo `Future` susceptible de fallar debe contar con una estrategia explícita de captura.**

## Resumen del capítulo

En el **Capítulo 11: Programación Asíncrona Básica**, hemos explorado los cimientos de la concurrencia no bloqueante en Dart:

* **El Event Loop:** Comprendimos que Dart opera en un solo hilo de ejecución dentro de un *Isolate*, regulando el tráfico de tareas mediante dos colas de prioridad estricta: la *Microtask Queue* (prioridad máxima interna) y la *Event Queue* (eventos externos de I/O y temporizadores).
* **El concepto de Future:** Analizamos la clase `Future` como un contenedor para un valor que se resolverá en el tiempo, transitando por los estados *Uncompleted* y *Completed* (este último con un valor de éxito o con un error).
* **Sintaxis async/await:** Descubrimos este mecanismo de azúcar sintáctico diseñado para transformar el código asíncrono en estructuras secuenciales de fácil lectura, suspendiendo localmente la función sin bloquear el hilo principal.
* **Manejo de errores:** Aprendimos a proteger la estabilidad de la aplicación envolviendo las llamadas de `await` en bloques síncronos `try-catch-finally`, o bien encadenando métodos `.catchError()` en la API nativa de los `Futures`.
