El Event Loop de Dart gestiona la asincronía de forma brillante, pero operaciones masivas en un solo hilo pueden congelar la interfaz de usuario. Cuando la CPU debe procesar algoritmos complejos, descifrar datos o transformar archivos pesados, la concurrencia tradicional no basta: se requiere paralelismo real.

En este capítulo descubrirás el poder de los **Isolates**, el mecanismo nativo de Dart para ejecutar tareas en múltiples núcleos físicos de forma simultánea. Aprenderás cómo su modelo de memoria aislada elimina los errores de concurrencia, cómo orquestar la comunicación bidireccional mediante puertos y cómo simplificar tu código usando la función `compute`.

## 13.1 ¿Qué son los Isolates?

Hasta ahora, hemos aprendido que Dart maneja la asincronía mediante el **Event Loop** (Capítulo 11). Vimos cómo operaciones como leer un archivo o hacer una petición HTTP se pueden pausar con `await` para permitir que el programa siga respondiendo mientras espera. Sin embargo, toda esa magia ocurre en un único hilo de ejecución.

¿Qué pasa si necesitas procesar un archivo JSON de 50 megabytes, descifrar una cadena de texto compleja o aplicar un filtro a una imagen de alta resolución? Estas tareas no están "esperando" a un agente externo; están consumiendo activamente ciclos de la CPU. Si ejecutas una tarea intensiva de este tipo en el Event Loop principal, este se congelará, provocando que la interfaz de usuario se pause o que el programa deje de responder.

Para resolver este problema y aprovechar los procesadores multinúcleo modernos, Dart introduce el concepto de **Isolates** (Aislamientos).

### Concurrencia vs. Paralelismo en Dart

Es común confundir el código asíncrono básico con el código en paralelo. La diferencia radica en la estructura de memoria de Dart:

* **Asincronía básica (Futures y Streams):** Es **concurrencia** dentro de un solo hilo. El Event Loop va saltando de una tarea a otra a medida que se completan las esperas. No hay dos líneas de código ejecutándose exactamente al mismo tiempo.
* **Isolates:** Es **paralelismo** real. Dart levanta un hilo de ejecución completamente nuevo en un núcleo diferente de la CPU, permitiendo que el cálculo pesado corra en paralelo sin interferir con el hilo principal.

### El modelo de memoria compartida vs. memoria aislada

En la mayoría de los lenguajes de programación tradicionales (como Java, C++ o C#), el multinúcleo se logra mediante *threads* (hilos) tradicionales. Estos hilos comparten el mismo espacio de memoria. Si el Hilo A y el Hilo B modifican la misma variable al mismo tiempo, se producen errores catastróficos conocidos como "condiciones de carrera", obligando a los desarrolladores a usar bloqueos complejos (*locks* o *mutex*).

Dart elimina este problema de raíz. Como su nombre lo indica, un **Isolate** es una isla completamente aislada.

> **Regla de oro:** Cada Isolate tiene su propio montón de memoria (*heap*) y su propio Event Loop independiente. Ningún Isolate puede acceder directamente al estado o a las variables de otro.

```text
+-----------------------------------------------------------------------+
|                            MEMORIA DE DART                            |
|                                                                       |
|  +-------------------------+         +-----------------------------+  |
|  |    Isolate Principal    |         |       Isolate Secundario    |  |
|  |                         |         |                             |  |
|  |  [ Memoria Propia ]     |         |    [ Memoria Propia ]       |  |
|  |  [ Event Loop ]         |         |    [ Event Loop ]           |  |
|  +-------------------------+         +-----------------------------+  |
|               ^                                     ^                 |
|               |              PASO DE                |                 |
|               +------------  MENSAJES  -------------+                 |
|                                                                       |
+-----------------------------------------------------------------------+

```

Al no compartir memoria, no se necesitan bloqueos. No hay riesgo de que un Isolate altere los datos de otro de forma inesperada.

### ¿Cómo se comunican los Isolates?

Si los Isolates no comparten memoria, ¿cómo se envían datos o se devuelven los resultados de un cálculo? Lo hacen estrictamente a través del **paso de mensajes**, utilizando conductos especiales llamados **Ports** (Puertos):

1. **ReceivePort (Puerto de Recepción):** Funciona como un buzón de correo electrónico. El Isolate que lo crea se queda escuchando los mensajes que llegan a él.
2. **SendPort (Puerto de Envío):** Funciona como la dirección de destino. Cualquiera que tenga este puerto puede enviar un mensaje hacia el `ReceivePort` asociado.

Cuando envías un mensaje (por ejemplo, una lista de datos), Dart realiza una copia de esos datos de la memoria del Isolate origen a la memoria del Isolate destino (aunque en versiones modernas de Dart, ciertos tipos de datos grandes o inmutables se pueden transferir optimizando la velocidad, conceptualmente siguen manteniéndose separados).

### ¿Cuándo deberías usar un Isolate?

No debes usar Isolates para todo, ya que abrir un Isolate tiene un costo de tiempo y memoria para el sistema operativo.

* **SÍ debes usar Isolates para:**
* Parseo de JSONs o archivos XML extremadamente grandes.
* Procesamiento, compresión o edición de imágenes y videos.
* Operaciones criptográficas (encriptar o desencriptar datos).
* Cualquier cálculo matemático o algoritmo complejo que tome más de 16 milisegundos en completarse.

* **NO debes usar Isolates para:**
* Peticiones HTTP cotidianas (ya son asíncronas y eficientes en el hilo principal).
* Lectura o escritura de archivos pequeños en el disco.
* Consultas estándar a bases de datos locales.

En las siguientes secciones del capítulo, aprenderemos la sintaxis exacta para instanciar estos Isolates, cómo orquestar la comunicación bidireccional y cómo utilizar herramientas simplificadas como la función `compute`.

## 13.2 Creación de Isolates

Para dar vida a un nuevo hilo de ejecución en Dart, debemos utilizar la clase `Isolate`, la cual se encuentra en la biblioteca nativa `dart:isolate`. El mecanismo fundamental para iniciar un Isolate secundario es el método estático `Isolate.spawn()`.

El término *spawn* (generar o reovar) describe con precisión lo que sucede: Dart crea un entorno de ejecución completamente nuevo, con su propia memoria y su propio Event Loop, y ejecuta una función específica dentro de él.

### Restricciones de la función de entrada

No cualquier función puede ser ejecutada al crear un Isolate. El método `Isolate.spawn()` requiere que la función cumpla con dos reglas estrictas:

1. **Debe ser una función de nivel superior o un método estático.** No puede ser un método de instancia (un método que pertenece a un objeto específico), ya que esto requeriría compartir el estado del objeto, violando el principio de aislamiento.
2. **Debe aceptar exactamente un argumento.** Este argumento se utiliza para pasarle datos iniciales al Isolate, comúnmente un puerto de comunicación o una estructura con parámetros.

### Estructura básica de `Isolate.spawn`

La firma simplificada de este método es la siguiente:

```dart
Future<Isolate> Isolate.spawn<T>(void entryPoint(T message), T message);

```

* `entryPoint`: Es la función que se ejecutará en el nuevo Isolate.
* `message`: Es el dato inicial que se le enviará a la función `entryPoint`. Generalmente, incluye un `SendPort` para que el Isolate pueda comunicarse de vuelta.

### Tu primer Isolate en código

A continuación, se presenta un ejemplo detallado donde se crea un Isolate secundario. En este caso, el Isolate principal simplemente le ordena al secundario que inicie una tarea, pasándole un `SendPort` como argumento inicial para establecer la vía de comunicación.

```dart
import 'dart:isolate';

// 1. Esta es la función de nivel superior que ejecutará el Isolate secundario.
void tareaPesada(SendPort puertoSalida) {
  print('-> Isolate Secundario: Iniciando proceso intensivo...');
  
  // Simulamos un cálculo intensivo de CPU mediante un bucle largo
  int contador = 0;
  for (int i = 0; i < 1000000000; i++) {
    contador += i;
  }
  
  print('-> Isolate Secundario: ¡Cálculo terminado!');
  
  // Enviamos el resultado de vuelta al Isolate principal
  puertoSalida.send(contador);
}

void main() async {
  print('Isolate Principal: Configurando el puerto de recepción.');
  
  // 2. Creamos un ReceivePort en el Isolate principal para escuchar respuestas
  ReceivePort puertoRecepcion = ReceivePort();
  
  print('Isolate Principal: Generando (spawning) el Isolate secundario.');
  
  // 3. Creamos el Isolate secundario pasándole la función y el puerto de envío asociado
  Isolate nuevoIsolate = await Isolate.spawn(tareaPesada, puertoRecepcion.sendPort);
  
  print('Isolate Principal: El Isolate secundario está corriendo en paralelo.');
  print('Isolate Principal: Esperando el resultado sin congelar este hilo...');
  
  // 4. Nos quedamos escuchando el primer mensaje que llegue al puerto
  var resultado = await puertoRecepcion.first;
  
  print('Isolate Principal: Resultado recibido: $resultado');
  
  // 5. Siempre debemos cerrar los puertos y finalizar el Isolate para liberar recursos
  puertoRecepcion.close();
  nuevoIsolate.kill(priority: Isolate.beforeNextEvent);
  
  print('Isolate Principal: Recursos liberados. Fin del programa.');
}

```

### Ciclo de vida y destrucción de un Isolate

Un Isolate secundario consumirá memoria y tiempo de procesamiento mientras su Event Loop tenga eventos pendientes por procesar o mantenga puertos abiertos. Para garantizar una gestión de memoria óptima, es vital seguir estos pasos una vez concluido el trabajo:

1. **Cerrar el `ReceivePort`:** Invocar `.close()` detiene la escucha del puerto y le indica al Event Loop que ya no se esperan más datos por esa vía.
2. **Matar el Isolate (`kill`):** El método `.kill()` destruye el Isolate de manera inmediata o programada. Se recomienda usar el parámetro `priority: Isolate.beforeNextEvent` para asegurar que el Isolate se detenga de forma segura justo antes de procesar su siguiente evento, evitando fugas de memoria (*memory leaks*).

## 13.3 Paso de mensajes

Como se mencionó en la introducción del capítulo, los Isolates no comparten variables ni estado. La única manera de transferir información entre ellos es mediante el **paso de mensajes** bidireccional. Para lograr que un Isolate principal y uno secundario mantengan una conversación fluida, es necesario establecer un apretón de manos (*handshake*) enviando sus respectivos puertos de envío (`SendPort`).

### Tipos de datos permitidos en los mensajes

No todos los objetos de Dart pueden ser enviados a través de un `SendPort`. Los mensajes deben estar compuestos por tipos de datos que Dart pueda copiar de forma segura entre las memorias independientes.

* **Tipos permitidos:**
* Valores primitivos (`null`, `num`, `int`, `double`, `String`, `bool`).
* Instancias de `SendPort`.
* Colecciones nativas (`List`, `Map`, `Set`) que contengan únicamente los tipos permitidos descritos aquí.
* Ciertos objetos especiales del sistema como `Capability` o `RegExp`.

* **Tipos prohibidos:**
* Punteros nativos o sockets abiertos.
* Instancias de clases personalizadas complejas que contengan referencias a elementos del sistema o clausuras (*closures*). *Nota: Aunque las versiones recientes de Dart permiten pasar más tipos de objetos clonándolos automáticamente, es una buena práctica limitar los mensajes a estructuras de datos puras o mapas primitivos para evitar errores de serialización.*

### Patrón de Comunicación Bidireccional (El Handshake)

Para que el Isolate principal pueda enviarle instrucciones continuas al Isolate secundario (y no solo un mensaje inicial al crearlo), el Isolate secundario debe crear su propio `ReceivePort` y enviarle ese `SendPort` de vuelta al principal.

```text
Isolate Principal                              Isolate Secundario
       |                                                |
       | ---- 1. spawn(Función, SendPortPrincipal) ---> | (Crea su propio ReceivePort)
       |                                                |
       | <--- 2. Envía SendPortSecundario ------------- |
       |                                                |
       | ---- 3. Envía datos a procesar --------------> | (Procesa la información)
       |                                                |
       | <--- 4. Devuelve el resultado ---------------- |

```

### Implementación de comunicación bidireccional

El siguiente ejemplo práctico implementa este patrón de diseño. Crearemos un Isolate secundario que actúa como un "servidor de operaciones matemáticas" en segundo plano, esperando comandos del hilo principal.

```dart
import 'dart:isolate';

// Clase contenedora para enviar comandos claros al Isolate
class ComandoMatematico {
  final String operacion;
  final int valor;
  final SendPort puertoRespuesta;

  ComandoMatematico(this.operacion, this.valor, this.puertoRespuesta);
}

// Función de entrada del Isolate Secundario
void servidorMatematico(SendPort puertoPrincipal) {
  // 1. El secundario crea su propio puerto para recibir instrucciones
  ReceivePort puertoSecundario = ReceivePort();

  // 2. Le envía su puerto de envío al principal (Handshake)
  puertoPrincipal.send(puertoSecundario.sendPort);

  // 3. Se queda escuchando los comandos enviados por el principal
  puertoSecundario.listen((mensaje) {
    if (mensaje is ComandoMatematico) {
      print('-> Secundario: Recibido comando [${mensaje.operacion}] con valor [${mensaje.valor}].');
      
      int resultado;
      switch (mensaje.operacion) {
        case 'factorial':
          resultado = calcularFactorial(mensaje.valor);
          break;
        case 'cuadrado':
          resultado = mensaje.valor * mensaje.valor;
          break;
        default:
          resultado = 0;
      }

      // 4. Responde directamente al puerto específico que el principal proveyó
      mensaje.puertoRespuesta.send(resultado);
    } else if (mensaje == 'CERRAR') {
      print('-> Secundario: Cerrando puerto y finalizando Isolate.');
      puertoSecundario.close();
    }
  });
}

// Función auxiliar puramente matemática
int calcularFactorial(int n) {
  int resultado = 1;
  for (int i = 1; i <= n; i++) {
    resultado *= i;
  }
  return resultado;
}

void main() async {
  ReceivePort puertoPrincipal = ReceivePort();
  
  // Iniciamos el Isolate pasándole el puerto principal
  await Isolate.spawn(servidorMatematico, puertoPrincipal.sendPort);

  // Convertimos el stream del puerto principal en un iterador para manejar el flujo
  final eventosPrincipal = StreamIterator(puertoPrincipal);

  // Esperamos el primer mensaje: el SendPort del Isolate secundario
  if (await eventosPrincipal.moveNext()) {
    SendPort puertoSecundario = eventosPrincipal.current as SendPort;
    print('Principal: Conexión establecida con el Isolate secundario.');

    // Creamos un puerto temporal para recibir la respuesta a nuestra primera petición
    ReceivePort respuestaTmp = ReceivePort();

    // Enviamos una petición para calcular un factorial
    puertoSecundario.send(ComandoMatematico('factorial', 5, respuestaTmp.sendPort));
    var res1 = await respuestaTmp.first;
    print('Principal: El factorial de 5 es $res1');

    // Reutilizamos el puerto temporal para otra petición
    respuestaTmp = ReceivePort();
    puertoSecundario.send(ComandoMatematico('cuadrado', 12, respuestaTmp.sendPort));
    var res2 = await respuestaTmp.first;
    print('Principal: El cuadrado de 12 es $res2');

    // Enviamos la orden de cierre al Isolate secundario
    puertoSecundario.send('CERRAR');
  }

  // Cerramos el puerto principal
  puertoPrincipal.close();
  print('Principal: Programa terminado de manera ordenada.');
}

```

### Buenas prácticas en el flujo de mensajes

* **Tipado de mensajes:** Como el método `send()` acepta cualquier tipo de objeto (`Object?`), encapsular los mensajes en clases estructuradas o registros de Dart ayuda a evitar errores de tipo en tiempo de ejecución.
* **Uso de Streams:** Recuerda que un `ReceivePort` implementa la interfaz de un `Stream`. Puedes usar métodos como `listen()`, `await for` o `StreamIterator` para gestionar las llegadas de datos, garantizando que el Isolate no consuma recursos cuando se encuentre inactivo.

## 13.4 La función compute

Levantar un Isolate de forma manual mediante `Isolate.spawn`, configurar los objetos `ReceivePort` y `SendPort`, gestionar el patrón de apretón de manos (*handshake*) y asegurarse de cerrar cada puerto para evitar fugas de memoria requiere una cantidad considerable de código repetitivo (*boilerplate*).

Para los casos en los que únicamente necesitas enviar unos datos a un hilo secundario, ejecutar un único cálculo pesado y esperar el resultado de vuelta, Dart y el ecosistema de Flutter ofrecen una alternativa de alto nivel extremadamente simplificada: la función **`compute`**.

> **Nota de contexto:** Originalmente, `compute` nació como parte del paquete `foundation` de Flutter. Sin embargo, debido a su enorme utilidad, en las versiones modernas de Dart orientadas a la optimización de código concurrente, disponemos de abstracciones equivalentes directamente en el SDK de Dart (como `Isolate.run`) para ejecutar funciones en un Isolate efímeramente con una sola línea de código. Ambas cumplen exactamente el mismo propósito: automatizar todo el ciclo de vida del Isolate.

### ¿Cómo funciona bajo el capó?

Cuando invocas la función `compute`, el framework realiza de manera automática los siguientes pasos:

1. Genera (*spawns*) un Isolate secundario.
2. Crea los puertos de comunicación necesarios (`ReceivePort` y `SendPort`).
3. Ejecuta la función objetivo pasando los argumentos suministrados en el hilo secundario.
4. Captura el valor de retorno o cualquier excepción que ocurra dentro del Isolate.
5. Devuelve dicho resultado al Isolate principal en forma de un `Future`.
6. Destruye el Isolate secundario y cierra todos los puertos inmediatamente.

```text
Código en Isolate Principal
          |
   await compute(miFuncion, datos);  --->  [ Se crea Isolate Temporal automáticamente ]
          |                                                   |
          |                                         Ejecuta miFuncion(datos)
          |                                                   |
   Resultado recibido (Future)      <---        Retorna valor y se destruye
          v

```

### Sintaxis y firma de `compute`

La firma genérica de esta utilidad se estructura de la siguiente manera:

```dart
Future<R> compute<M, R>(R Function(M message) callback, M message);

```

* `M` (Message): El tipo de dato del parámetro que recibe la función.
* `R` (Result): El tipo de dato que retorna la función.
* `callback`: La función de nivel superior o método estático que se va a ejecutar en paralelo.
* `message`: Los datos de entrada que se le enviarán a la función.

### Ejemplo práctico con `compute`

A continuación, implementaremos un analizador de cadenas que simula el procesamiento pesado de un archivo de texto masivo para contar la frecuencia de una palabra específica. Observa cuán limpio queda el código en comparación con la gestión manual de puertos:

```dart
// Simulamos la función compute para entornos puros de Dart mediante Isolate.run
// (En Flutter, simplemente importarías 'package:flutter/foundation.dart')
import 'dart:isolate';

// 1. Definimos una estructura de datos simple para pasar múltiples argumentos
class ParametrosBusqueda {
  final String textoGrande;
  final String palabraClave;

  ParametrosBusqueda(this.textoGrande, this.palabraClave);
}

// 2. Función de nivel superior encargada del cálculo pesado
int contarPalabrasEnSegundoPlano(ParametrosBusqueda params) {
  print('-> Isolate Temporal: Iniciando escaneo intensivo...');
  
  // Convertimos el texto en un listado de palabras (operación costosa en textos gigantes)
  List<String> palabras = params.textoGrande.split(RegExp(r'\s+'));
  
  int coincidencias = 0;
  for (String palabra in palabras) {
    if (palabra.toLowerCase() == params.palabraClave.toLowerCase()) {
      coincidencias++;
    }
  }
  
  print('-> Isolate Temporal: Escaneo finalizado.');
  return coincidencias; // El valor retornado es enviado automáticamente al hilo principal
}

void main() async {
  print('Principal: Preparando los datos de la tarea...');
  
  // Creamos un texto simulado repetitivo para forzar procesamiento
  String textoMasivo = ('Dart ' * 5000000) + 'Isolates ' + ('Dart ' * 5000000);
  ParametrosBusqueda datos = ParametrosBusqueda(textoMasivo, 'Isolates');

  print('Principal: Solicitando cálculo en paralelo a través de compute...');

  // 3. Invocamos la tarea pesada de forma asíncrona.
  // Bajo el capó, Isolate.run / compute se encargan de toda la fontanería de puertos.
  int total = await Isolate.run(() => contarPalabrasEnSegundoPlano(datos));

  print('Principal: ¡Resultado obtenido de forma segura!');
  print('Principal: La palabra clave aparece $total vez/veces en el texto.');
  print('Principal: Fin del flujo.');
}

```

### Limitaciones de `compute`

Aunque simplifica drásticamente el desarrollo, `compute` no es una solución universal para todos los escenarios de concurrencia:

* **Costo de apertura:** Debido a que crea y destruye un Isolate en cada llamada, usar `compute` repetidamente dentro de un bucle para tareas muy pequeñas perjudicará el rendimiento general en lugar de mejorarlo.
* **Sin comunicación continua:** Solo admite una ráfaga de comunicación: una entrada y una salida. Si tu aplicación requiere un flujo constante de mensajes de ida y vuelta en tiempo real (como la lectura de datos de un socket persistente), debes recurrir a la creación manual con `Isolate.spawn`.

## Resumen del capítulo

En este capítulo hemos explorado el pilar avanzado de la concurrencia en Dart: los **Isolates**.

Comprendimos que a diferencia de otros lenguajes basados en hilos de memoria compartida, Dart previene las condiciones de carrera aislando por completo la memoria de cada entorno de ejecución. Aprendimos que para tareas intensivas de CPU que congelarían el **Event Loop** principal, es imperativo delegar el procesamiento a un Isolate secundario.

Estudiamos el ciclo de vida y la creación manual mediante `Isolate.spawn`, dominando el intercambio de flujos informativos mediante `ReceivePort` y `SendPort` para implementar arquitecturas de comunicación bidireccional consistentes. Finalmente, analizamos el uso de abstracciones de alto nivel como la función `compute` (o `Isolate.run`), la cual automatiza de forma elegante todo el andamiaje del paralelismo para tareas pesadas puntuales de tipo disparo-y-respuesta (*fire-and-forget*).
