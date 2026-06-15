Hasta ahora has dominado el uso de `Future` para manejar operaciones asíncronas que devuelven un único valor. Sin embargo, el software moderno interactúa constantemente con flujos continuos de datos en tiempo real, como la geolocalización por GPS, mensajes de WebSockets o la lectura fragmentada de archivos pesados.

En este capítulo aprenderás a dominar los **Streams**, la herramienta nativa de Dart para gestionar secuencias de eventos asíncronos a lo largo del tiempo. Exploraremos cómo consumirlos, transformarlos mediante operadores funcionales, administrar controladores mediante `StreamController` y generar flujos dinámicos con funciones `async*`. Bienvenido a la programación reactiva.

## 12.1 Conceptos básicos de Streams

En el capítulo anterior aprendiste a trabajar con `Future`, una estructura de datos que representa un valor único que estará disponible en algún momento del futuro. Sin embargo, en el desarrollo de software real, a menudo nos enfrentamos a escenarios donde los datos no llegan todos juntos en un solo bloque, sino de manera secuencial, fragmentada o continua a lo largo del tiempo. Para resolver esta necesidad, Dart nos provee de los **Streams**.

Un `Stream` (flujo de datos) es una secuencia de eventos asíncronos. Se puede visualizar como una tubería o una cinta transportadora por la cual viajan datos de manera ordenada, uno tras otro, y donde los consumidores de dicha información se posicionan al final de la línea esperando a que los elementos emerjan.

### La analogía del agua: Future vs. Stream

Para comprender la diferencia fundamental entre un `Future` y un `Stream`, podemos recurrir a una analogía cotidiana con el agua:

* **Un Future es como pedir una botella de agua:** Realizas la petición (acción asíncrona), esperas un momento y, tras la espera, recibes el objeto completo (la botella con todo su contenido). Una vez que la tienes, la operación ha terminado por completo.
* **Un Stream es como abrir un grifo o una manguera:** No recibes todo el agua de una sola vez. En su lugar, abres la llave y el líquido comienza a fluir de forma continua en pequeñas gotas o chorros a lo largo del tiempo. No sabes exactamente cuándo caerá la última gota ni cuántas goteras pasarán en total, solo sabes que debes estar ahí para recibirlas a medida que caen.

### Anatomía de un Stream

Un `Stream` en Dart puede emitir tres tipos de eventos a lo largo de su ciclo de vida:

1. **Eventos de datos (Data):** Son los elementos o valores propiamente dichos (por ejemplo, un entero, una cadena de texto, un objeto personalizado). Un Stream puede emitir desde cero hasta un número infinito de eventos de datos.
2. **Eventos de error (Error):** Si algo sale mal durante la generación u obtención de los datos (por ejemplo, una falla de conexión de red), el Stream puede emitir un evento de error. Es importante destacar que un error no interrumpe necesariamente el flujo de manera automática, a menos que así se defina.
3. **Evento de finalización (Done):** Es una señal que notifica que el Stream ha cerrado satisfactoriamente y que no enviará más información. Una vez que se emite el evento *Done*, el ciclo de vida del Stream termina.

A continuación, se muestra una representación gráfica en texto plano del comportamiento temporal de un Stream:

```text
Línea de tiempo (Tiempo ->)
========================================================================
[Inicio] ---> (Dato 1) ---> (Dato 2) ---> (X Error) ---> (Dato 3) ---> || [Fin]
========================================================================

```

### Tipos de Streams en Dart

No todos los flujos de datos se comportan de la misma manera. Dart clasifica los Streams en dos tipos principales según cómo gestionan a sus oyentes (*listeners*):

#### 1. Streams de suscripción única (Single Subscription Streams)

Son el tipo de Stream por defecto en Dart. Están diseñados para entregar una secuencia de eventos que forman parte de un todo homogéneo y continuo.

* **Regla de oro:** Solo permiten un único oyente (`StreamSubscription`) a la vez.
* **Comportamiento:** Si intentas escuchar (*listen*) este Stream una segunda vez, el entorno de ejecución de Dart lanzará un error de tipo `StateError`. Los datos no se almacenan en búfer para futuros oyentes; si nadie está escuchando cuando se produce un evento, ese dato podría perderse o el Stream retendrá la ejecución hasta que se conecte el suscriptor.
* **Caso de uso común:** Lectura de un archivo en el disco local o la descarga de un paquete a través de una solicitud HTTP.

#### 2. Streams de transmisión masiva (Broadcast Streams)

Están diseñados para eventos que ocurren de forma independiente en el tiempo, donde múltiples partes de la aplicación pueden estar interesadas en enterarse de lo que sucede en tiempo real.

* **Regla de oro:** Permiten un número ilimitado de oyentes simultáneos.
* **Comportamiento:** Cualquier sección del código puede empezar a escuchar el Stream en cualquier momento. Sin embargo, los nuevos oyentes solo recibirán los eventos que ocurran **después** de haberse suscrito; los eventos pasados ya se han descartado.
* **Caso de uso común:** El flujo de coordenadas de un GPS, eventos de clics del mouse en una interfaz gráfica o mensajes entrantes en una sala de chat mediante WebSockets.

### Creación básica de Streams con constructores de fábrica

Aunque existen herramientas avanzadas para controlar Streams (como los `StreamController` que verás más adelante), Dart proporciona constructores de fábrica listos para usar en la clase `Stream` para crear flujos de datos simples a partir de datos ya existentes o de duraciones de tiempo.

Veamos un fragmento de código que demuestra la inicialización de flujos de datos básicos:

```dart
void main() {
  // 1. Crear un Stream a partir de un Iterable (Lista)
  final numeros = [1, 2, 3, 4, 5];
  final streamDesdeLista = Stream.fromIterable(numeros);

  // 2. Crear un Stream que emite un único valor de forma asíncrona
  final streamUnico = Stream.fromFuture(Future.value('Hola desde el futuro'));

  // 3. Crear un Stream que emite un valor periódicamente cada segundo
  final streamPeriodico = Stream.periodic(
    Duration(seconds: 1), 
    (computo) => 'Instante número: $computo'
  );
  
  print('Streams inicializados correctamente.');
}

```

### ¿Por qué son fundamentales los Streams?

En el ecosistema de Dart (y especialmente en frameworks como Flutter), los Streams son la columna vertebral de la **Programación Reactiva**. Permitir que la arquitectura de tu software reaccione ante los cambios de estado o flujos de datos en tiempo real, en lugar de consultar constantemente si hay datos nuevos (técnica conocida como *polling*), optimiza drásticamente el rendimiento del procesador y reduce el consumo de batería en dispositivos móviles.

## 12.2 Consumo de Streams

Una vez que comprendes qué es un `Stream`, el siguiente paso crucial es aprender a escuchar y procesar los datos que fluyen a través de él. Consumir un flujo de datos implica conectarse a la tubería asíncrona para reaccionar a cada elemento, capturar los posibles errores y ejecutar lógica de limpieza cuando la transmisión finalice.

Dart ofrece dos mecanismos principales para consumir Streams: el método tradicional `.listen()` y la estructura moderna `await for`.

### El método `.listen()`

La forma más flexible y de bajo nivel para consumir un `Stream` es invocando su método `.listen()`. Al hacerlo, creas una suscripción activa (representada por un objeto de tipo `StreamSubscription`) y pasas funciones de devolución de llamada (*callbacks*) para manejar los diferentes eventos del ciclo de vida del flujo.

#### Sintaxis y Parámetros

El método `.listen()` acepta un parámetro obligatorio y tres parámetros opcionales nombrados:

* **`onData` (Obligatorio):** Una función que se ejecuta cada vez que el Stream emite un nuevo valor. Recibe el dato como argumento.
* **`onError` (Opcional):** Una función que se activa si el Stream encuentra un error. Permite interceptar la falla sin que la aplicación se detenga abruptamente.
* **`onDone` (Opcional):** Una función sin argumentos que se ejecuta exactamente después de que el Stream emite su señal de finalización.
* **`cancelOnError` (Opcional):** Un booleano (`true` o `false`). Si se define en `true`, la suscripción se cancelará automáticamente en el primer error que ocurra, impidiendo recibir más datos. Por defecto es `false`.

A continuación, se presenta un ejemplo práctico de consumo utilizando esta API:

```dart
void main() {
  // Creamos un Stream básico que emite números del 1 al 3
  final stream = Stream<int>.fromIterable([1, 2, 3]);

  print('Inicio de la suscripción');

  // Consumimos el Stream utilizando .listen()
  stream.listen(
    (data) {
      print('Dato recibido: $data');
    },
    onError: (error) {
      print('Se produjo un error: $error');
    },
    onDone: () {
      print('¡Stream finalizado con éxito!');
    },
    cancelOnError: false,
  );

  print('Línea posterior al .listen() (Demuestra asincronía)');
}

```

**Salida en consola:**

```text
Inicio de la suscripción
Línea posterior al .listen() (Demuestra asincronía)
Dato recibido: 1
Dato recibido: 2
Dato recibido: 3
¡Stream finalizado con éxito!

```

> **Nota:** Observa cómo la línea posterior al `.listen()` se imprime *antes* de que los datos comiencen a llegar. Esto confirma que el consumo del Stream ocurre de manera asíncrona y no bloquea el hilo principal de ejecución.

### Gestión de la suscripción (`StreamSubscription`)

Cuando invocas `.listen()`, la llamada retorna una instancia de `StreamSubscription`. Guardar esta referencia es fundamental para el control de flujo y la prevención de fugas de memoria (*memory leaks*), especialmente en Streams que emiten datos de forma infinita (como un temporizador o un WebSocket).

A través de la suscripción puedes controlar el flujo con los siguientes métodos:

* **`pause()`:** Pausa la recepción de eventos. El Stream retiene los datos o detiene su generación temporalmente.
* **`resume()`:** Reanuda la recepción de eventos desde el punto donde se pausó.
* **`cancel()`:** Cancela la suscripción de forma definitiva. A partir de este momento, ya no recibirás ningún tipo de evento.

```dart
import 'dart:async';

void main() async {
  // Stream infinito que emite un entero cada segundo
  final streamPeriodico = Stream<int>.periodic(Duration(seconds: 1), (x) => x);
  
  // Guardamos la suscripción
  StreamSubscription<int>? suscripcion;

  suscripcion = streamPeriodico.listen((segundo) {
    print('Segundo transcurrido: $segundo');
    
    // Cancelamos la suscripción manualmente al llegar al segundo 4
    if (segundo == 4) {
      print('Cancelando suscripción para evitar fugas de memoria...');
      suscripcion?.cancel();
    }
  });
}

```

### Consumo con la estructura `await for`

Dart provee una alternativa sintáctica mucho más limpia y legible cuando solo necesitas procesar los eventos de datos secuencialmente y no requieres pausar o reanudar manualmente la suscripción. Se trata del bucle **`await for`** (bucle for asíncrono).

Para poder utilizar `await for`, la función contenedora debe estar marcada imperativamente con la palabra clave `async`.

#### Funcionamiento de `await for`

El bucle `await for` funciona de la siguiente manera: suspende temporalmente la ejecución de la función `async` actual en cada iteración, esperando de forma pasiva a que el Stream emita el siguiente elemento. Cuando el elemento llega, el cuerpo del bucle se ejecuta, y luego vuelve a esperar al siguiente. El bucle termina automáticamente cuando el Stream emite el evento *Done*.

```dart
Future<void> procesarDatos() async {
  final stream = Stream<int>.fromIterable([10, 20, 30]);

  print('Comenzando el procesamiento asíncrono...');

  // El bucle espera activamente cada elemento del Stream
  await for (final valor in stream) {
    print('Procesando valor: $valor');
  }

  print('Procesamiento terminado de forma secuencial.');
}

void main() async {
  await procesarDatos();
}

```

**Salida en consola:**

```text
Comenzando el procesamiento asíncrono...
Procesando valor: 10
Procesando valor: 20
Procesando valor: 30
Procesamiento terminado de forma secuencial.

```

#### Manejo de errores en `await for`

Dado que `await for` camufla el flujo asíncrono bajo una apariencia de código síncrono tradicional, el manejo de errores se realiza utilizando los bloques estándar `try-catch-finally` que aprendiste en el Capítulo 10.

```dart
Future<void> consumirConErrores(Stream<int> flujo) async {
  try {
    await for (final numero in flujo) {
      print('Número: $numero');
    }
  } catch (e) {
    print('Error atrapado en el bucle: $e');
  } finally {
    print('Bloque de limpieza finalizado.');
  }
}

```

### Comparativa: ¿Cuándo usar `.listen()` vs `await for`?

| Característica | Método `.listen()` | Estructura `await for` |
| --- | --- | --- |
| **Flujo de código** | No bloqueante para las líneas subsecuentes de la función. | Secuencial; detiene la ejecución de la función hasta que termine el Stream. |
| **Control** | Permite pausar, reanudar y cancelar mediante `StreamSubscription`. | No se puede pausar o reanudar de forma nativa externa. |
| **Sintaxis** | Basada en funciones *callback* independientes. | Código plano, limpio y estructurado (estilo síncrono). |
| **Manejo de errores** | Mediante el parámetro nombrado `onError`. | Mediante bloques estándar `try-catch`. |

Como regla general, utiliza **`await for`** cuando necesites procesar todos los elementos de principio a fin dentro de una función asíncrona sin lógica compleja de control. Opta por **`.listen()`** cuando construyas arquitecturas reactivas orientadas a eventos de larga duración, donde requieras interactuar con el estado de la suscripción en respuesta a acciones del usuario o del sistema.

## 12.3 StreamControllers y Sinks

En las secciones previas has aprendido cómo consumir flujos de datos y cómo inicializarlos a partir de fuentes estáticas (como listas o futuros). Sin embargo, en aplicaciones reales necesitas una forma de crear tus propios flujos de datos desde cero, inyectar información de manera dinámica desde cualquier punto de tu código y exponer un canal para que otros componentes se suscriban. Para lograr este control absoluto sobre un flujo, Dart nos provee de la clase **`StreamController`**.

Un `StreamController` es, literalmente, el controlador y administrador de un `Stream`. Actúa como un puente con dos extremos bien definidos: una entrada para introducir datos (el **`Sink`**) y una salida para escucharlos (el **`Stream`**).

### La anatomía de un StreamController

Para entender un `StreamController`, imagina una tubería industrial. El controlador es la estructura completa de la tubería, pero expone dos interfaces de acceso distintas:

1. **El Sink (Sumidero / Entrada):** Es la boca de entrada de la manguera. A través de él, "inyectas" o "perforas" los datos, errores o señales de finalización hacia el interior de la tubería.
2. **El Stream (Flujo / Salida):** Es la boca de salida. Los componentes de tu aplicación que necesitan consumir los datos se conectan a este extremo para escuchar lo que sale.

```text
               +-----------------------------------+
               |          StreamController         |
               |                                   |
 Datos ------> |  [ Sink ]  ===============> [ Stream ]  -------> Oyentes
 (Inyección)   |  (Entrada)                  (Salida)   |        (Consumo)
               +-----------------------------------+

```

### Implementación básica de un StreamController

Para utilizar un `StreamController`, es necesario importar la biblioteca nativa `dart:async`. A continuación, se detalla el proceso completo de creación, inyección de datos, escucha y cierre higiénico del controlador:

```dart
import 'dart:async';

void main() {
  // 1. Instanciar el StreamController especificando el tipo de dato
  final controller = StreamController<String>();

  // 2. Acceder al Stream para escuchar los eventos entrantes
  controller.stream.listen(
    (data) => print('Dato recibido desde el Stream: $data'),
    onError: (error) => print('Error detectado: $error'),
    onDone: () => print('El Stream ha sido cerrado permanentemente.'),
  );

  // 3. Utilizar el Sink para agregar datos de forma dinámica
  controller.sink.add('Primer mensaje');
  controller.sink.add('Segundo mensaje');

  // También podemos inyectar errores a través del Sink
  controller.sink.addError('Ups, algo salió mal de forma asíncrona');

  controller.sink.add('Tercer mensaje post-error');

  // 4. Cerrar el controlador cuando ya no se planee enviar más datos
  // Esto dispara el evento 'onDone' en los oyentes
  controller.close();
}

```

**Salida en consola:**

```text
Dato recibido desde el Stream: Primer mensaje
Dato recibido desde el Stream: Segundo mensaje
Error detectado: Ups, algo salió mal de forma asíncrona
Dato recibido desde el Stream: Tercer mensaje post-error
El Stream ha sido cerrado permanentemente.

```

> **¡Regla crucial de rendimiento!** Siempre debes invocar al método `controller.close()` cuando un flujo termine su ciclo de vida. Dejar un `StreamController` abierto indefinidamente mantiene recursos reservados en memoria, provocando fugas de rendimiento graves (*memory leaks*).

### Creación de un Broadcast StreamController

Por defecto, un `StreamController` ordinario genera un **Stream de suscripción única**. Si intentas llamar a `controller.stream.listen()` en más de una sección del código simultáneamente, tu aplicación fallará con un `StateError`.

Si necesitas un flujo diseñado para que múltiples partes del sistema escuchen los mismos eventos en tiempo real (por ejemplo, un sistema de notificaciones globales), debes inicializar el controlador utilizando el constructor de fábrica `.broadcast()`:

```dart
import 'dart:async';

void main() {
  // Inicialización de un controlador de transmisión masiva (Broadcast)
  final sistemaNotificaciones = StreamController<String>.broadcast();

  // Primer oyente: Módulo de Interfaz de Usuario
  sistemaNotificaciones.stream.listen((msg) {
    print('[UI] Mostrando alerta visual: $msg');
  });

  // Segundo oyente: Módulo de Registro (Logs)
  sistemaNotificaciones.stream.listen((msg) {
    print('[LOG] Guardando en archivo local: $msg');
  });

  // Enviamos un único evento que será recibido por ambos oyentes
  sistemaNotificaciones.sink.add('Nueva actualización de software disponible.');

  // Limpieza
  sistemaNotificaciones.close();
}

```

### Buenas prácticas: Encapsulamiento de controladores

En el diseño de software limpio, exponer directamente el `StreamController` a otras clases se considera un antipatrón. Si una clase externa tiene acceso directo al controlador, podría añadir datos erróneos a través del `sink` o cerrar el flujo arbitrariamente, rompiendo la lógica interna.

La buena práctica dicta **ocultar el controlador de forma privada** y exponer únicamente la propiedad pública del `Stream` para lectura, protegiendo la entrada de datos.

```dart
import 'dart:async';

class ServicioCronometro {
  // Propiedad privada: Nadie fuera de esta clase puede inyectar datos o cerrarlo
  final StreamController<int> _tickerController = StreamController<int>();

  // Propiedad pública: Expone únicamente el flujo de lectura limpia
  Stream<int> get flujoSegundos => _tickerController.stream;

  void iniciarContador() {
    int contador = 0;
    // Simulamos un incremento interno que alimenta al Sink de forma segura
    Timer.periodic(Duration(seconds: 1), (timer) {
      contador++;
      _tickerController.sink.add(contador);

      if (contador == 3) {
        timer.cancel();
        _tickerController.close(); // Cerramos internamente
      }
    });
  }
}

void main() {
  final cronometro = ServicioCronometro();

  // Consumo seguro desde el exterior
  cronometro.flujoSegundos.listen((segundo) {
    print('Tiempo transcurrido en el sistema: $segundo');
  });

  cronometro.iniciarContador();
  
  // cronometro._tickerController.sink.add(100); // -> Error de compilación (Protegido)
}

```

## 12.4 Transformación de datos

Los flujos de datos en crudo rara vez vienen exactamente en el formato, estructura o cantidad que nuestra aplicación necesita para ser consumidos directamente. Imagina recibir una cadena de texto JSON a través de una red; antes de poder usarla en tu interfaz de usuario, necesitas transformarla en un objeto fuertemente tipado, filtrar los elementos irrelevantes o mapear la información.

Dart trata a los `Streams` como ciudadanos de primera clase y hereda muchas de las operaciones funcionales que ya conoces de las colecciones (como las listas). Al aplicar una transformación a un `Stream`, no modificas el flujo original; en su lugar, creas un **nuevo Stream** que emite los datos modificados a medida que viajan por la tubería.

### Operadores de transformación esenciales

La clase `Stream` incluye métodos nativos listos para encadenarse y transformar el flujo de eventos sobre la marcha. Veamos los más importantes:

#### 1. El operador `map`

Transforma cada elemento emitido por el Stream aplicando una función convertidora. El Stream resultante emitirá el valor de retorno de dicha función.

```dart
// Entrada: Stream<int>  ---> [ 1, 2, 3 ]
// Operación: map((x) => x * 10)
// Salida:  Stream<int>  ---> [ 10, 20, 30 ]

```

#### 2. El operador `where` (Filtrado)

Filtra los elementos del Stream basándose en una condición booleana (predicado). Solo los elementos que devuelvan `true` pasarán al nuevo Stream; los demás se descartan silenciosamente.

```dart
// Entrada: Stream<int>  ---> [ 1, 2, 3, 4 ]
// Operación: where((x) => x % 2 == 0)
// Salida:  Stream<int>  ---> [ 2, 4 ]

```

#### 3. El operador `take`

Limita la cantidad de elementos que el Stream puede emitir. Una vez que se alcanza el número máximo especificado, el nuevo Stream emite inmediatamente el evento de finalización (*Done*) y cancela la suscripción interna.

```dart
// Entrada: Stream de segundos infinito ---> [ 1, 2, 3, 4, 5, ... ]
// Operación: take(3)
// Salida:  Stream terminado          ---> [ 1, 2, 3 ] || [Fin]

```

### Ejemplo práctico: Encadenamiento de operadores

Una de las mayores ventajas de la programación reactiva es la capacidad de encadenar múltiples transformaciones de manera declarativa y fluida.

```dart
void main() {
  // Flujo original con IDs en formato de texto descuidado
  final streamOriginal = Stream<String>.fromIterable([
    'user_1', 'admin_2', 'user_3', 'guest_4', 'user_5'
  ]);

  print('Configurando tubería de transformación...');

  // Encadenamos operadores para procesar el flujo
  final streamProcesado = streamOriginal
      .where((rol) => rol.startsWith('user_')) // 1. Filtrar: Solo los que empiecen con 'user_'
      .map((user) => user.toUpperCase())      // 2. Mutar: Convertir a mayúsculas
      .take(2);                               // 3. Limitar: Quedarse solo con los primeros 2

  // Consumimos el Stream transformado resultante
  streamProcesado.listen(
    (dato) => print('Dato transformado recibido: $dato'),
    onDone: () => print('Tubería cerrada de forma segura.'),
  );
}

```

**Salida en consola:**

```text
Configurando tubería de transformación...
Dato transformado recibido: USER_1
Dato transformado recibido: USER_3
Tubería cerrada de forma segura.

```

### Transformaciones complejas con `StreamTransformer`

Cuando los operadores básicos como `map` o `where` se quedan cortos porque necesitas una lógica de transformación muy avanzada (por ejemplo, agrupar datos en búferes, manejar errores de forma personalizada o emitir múltiples datos basados en un único evento de entrada), Dart ofrece la clase **`StreamTransformer`**.

Un `StreamTransformer<S, T>` toma un Stream de tipo origen (`S`) y lo convierte en un Stream de tipo destino (`T`). Se aplica utilizando el método `.transform()` del Stream original.

La forma más común de crear uno es mediante el constructor `StreamTransformer.fromHandlers`.

```dart
import 'dart:async';

void main() {
  final notasFlujo = Stream<double>.fromIterable([4.5, 2.0, 7.8, 9.5, 5.0]);

  // Creamos un transformador personalizado para clasificar notas académicas
  final clasificadorNotas = StreamTransformer<double, String>.fromHandlers(
    handleData: (double nota, EventSink<String> sink) {
      if (nota >= 5.0) {
        sink.add('APROBADO con nota: $nota');
      } else {
        // Podemos elegir transformar una condición de datos en un mensaje o un error
        sink.add('REPROBADO con nota: $nota');
      }
    },
    handleError: (error, stackTrace, sink) {
      sink.addError('Error en la lectura de calificaciones: $error');
    },
    handleDone: (sink) {
      sink.add('--- Reporte académico finalizado ---');
      sink.close(); // Cerramos el sumidero del nuevo stream
    },
  );

  // Aplicamos el transformador usando el método .transform()
  notasFlujo.transform(clasificadorNotas).listen((resultado) {
    print(resultado);
  });
}

```

**Salida en consola:**

```text
REPROBADO con nota: 2.0
APROBADO con nota: 4.5
APROBADO con nota: 7.8
APROBADO con nota: 9.5
APROBADO con nota: 5.0
--- Reporte académico finalizado ---

```

El uso de transformaciones te permite mantener la lógica de presentación o consumo completamente desacoplada de la lógica de procesamiento de datos. Tus flujos transportan datos limpios y listos para usar en cualquier capa de la aplicación.

## 12.5 Generadores asíncronos

A lo largo de este capítulo has aprendido a consumir `Streams` y a controlarlos de forma manual mediante `StreamController`. Sin embargo, Dart ofrece una tercera forma sumamente elegante y nativa para construir flujos de datos: los **generadores asíncronos**.

Un generador asíncrono es una función que produce una secuencia de valores asíncronos bajo demanda. En lugar de calcular todos los valores de golpe y devolverlos en una colección, un generador asíncrono calcula y entrega cada elemento de manera perezosa (*lazy*), es decir, solo cuando el consumidor solicita el siguiente dato.

### Las palabras clave: `async*` y `yield`

Para indicarle a Dart que una función es un generador asíncrono, se combinan dos palabras clave especiales dentro de la sintaxis del lenguaje:

1. **`async*` (asíncrono con asterisco):** Se coloca justo antes del cuerpo de la función. Modifica el comportamiento de la función para que devuelva obligatoriamente un objeto de tipo `Stream<T>`.
2. **`yield` (producir / ceder):** Es una palabra clave que reemplaza al `return` tradicional. Cuando la función ejecuta un `yield`, emite el valor especificado hacia el `Stream` para que el oyente lo reciba y, acto seguido, **pausa su propia ejecución**. La función se reanudará en la siguiente línea exacta solo cuando el consumidor solicite el próximo dato.

A continuación se presenta un ejemplo básico de un contador regresivo asíncrono:

```dart
// El cuerpo se marca con async* y retorna un Stream
Stream<int> cuentaRegresiva(int desde) async* {
  for (int i = desde; i >= 0; i--) {
    // Simulamos una tarea que toma tiempo, como una espera de red o delay
    await Future.delayed(Duration(seconds: 1));
    
    // Emitimos el valor actual y pausamos la ejecución de la función
    yield i;
  }
}

void main() async {
  print('Comenzando cuenta regresiva...');
  
  final flujoContador = cuentaRegresiva(3);

  // Consumimos el generador asíncrono usando await for
  await for (final segundo in flujoContador) {
    print('Faltan: $segundo segundos');
  }

  print('¡Despegue! 🚀');
}

```

**Salida en consola:**

```text
Comenzando cuenta regresiva...
Faltan: 3 segundos
Faltan: 2 segundos
Faltan: 1 segundos
Faltan: 0 segundos
¡Despegue! 🚀

```

#### ¿Cómo funciona internamente?

Cuando invocas a `cuentaRegresiva(3)`, el código dentro de la función no se ejecuta inmediatamente. En su lugar, Dart crea y devuelve un `Stream` vacío. Es únicamente cuando el bucle `await for` se suscribe al flujo que la función `cuentaRegresiva` despierta, ejecuta el bucle interno, espera el segundo de retraso y emite el número `3` con `yield`. En ese instante la función se congela hasta que el `await for` procesa el `3` y vuelve a pedir el siguiente.

### Emisión delegada con `yield*`

Existen escenarios donde un generador asíncrono necesita delegar la producción de datos a otro `Stream` o a otra función generadora. En lugar de consumir el segundo flujo con un bucle para volver a emitir sus datos uno por uno, Dart provee la palabra clave **`yield*`** (ceder asterisco).

`yield*` se puede traducir como: *"Pausa esta función y emite secuencialmente todo lo que el siguiente Stream produzca antes de continuar"*.

```dart
Stream<int> secuenciaInicial() async* {
  yield 1;
  yield 2;
}

Stream<int> secuenciaCompleta() async* {
  // Delegamos la emisión al primer generador
  yield* secuenciaInicial();

  // Una vez que secuenciaInicial() emite su evento Done, continuamos aquí
  yield 3;
  yield 4;
}

void main() async {
  await for (final valor in secuenciaCompleta()) {
    print('Valor: $valor');
  }
}

```

**Salida en consola:**

```text
Valor: 1
Valor: 2
Valor: 3
Valor: 4

```

## Resumen del capítulo

En este capítulo hemos explorado a fondo el manejo de flujos asíncronos en Dart, una herramienta indispensable para crear aplicaciones modernas, reactivas y altamente eficientes.

* **Fundamentos:** Aprendimos que un `Stream` representa una secuencia de eventos en el tiempo y descubrimos la existencia de dos variantes: los Streams de **suscripción única** (lecturas de archivos) y los de **transmisión masiva** o *Broadcast* (eventos de usuario o sensores).
* **Consumo:** Comprendimos cómo interactuar con los flujos utilizando el método directo `.listen()` (que otorga control total mediante un `StreamSubscription`) o mediante la estructura simplificada `await for`.
* **Controladores:** Analizamos la clase `StreamController` y sus sumideros (`Sink`), aprendiendo la arquitectura recomendada para encapsular la producción de eventos de forma segura.
* **Transformaciones:** Revisamos operadores funcionales básicos como `map`, `where` y `take` junto con el uso avanzado de `StreamTransformer` para moldear datos en tránsito.
* **Generadores:** Finalmente, dominamos la creación elegante de flujos mediante funciones `async*` y el uso estratégico de `yield` y `yield*` para producir información bajo demanda.
