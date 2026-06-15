Ningún software es inmune a los imprevistos. Un fallo en el servidor, un dato mal introducido por el usuario o un despiste en la lógica de nuestro código pueden hacer que una aplicación colapse instantáneamente. En este capítulo, aprenderás a construir programas robustos en Dart que no se rinden ante la adversidad. Exploraremos la diferencia técnica entre un fallo del programador y una anomalía del entorno, dominaremos las herramientas para interceptar problemas en tiempo de ejecución y descubriremos cómo definir nuestras propias alertas para modelar las reglas de nuestro negocio con total seguridad.

## 10.1 Diferencia entre Error y Exception

Al construir aplicaciones en Dart, es inevitable enfrentarse a situaciones donde el flujo normal del programa se interrumpe. Una entrada de usuario inesperada, la pérdida de conexión a internet o un fallo de lógica en el código pueden provocar un comportamiento anómalo. En Dart, estas anomalías se dividen conceptualmente y técnicamente en dos grandes familias que descienden de la clase base `Object`: los errores (`Error`) y las excepciones (`Exception`).

Aunque a menudo se usan como sinónimos en el lenguaje cotidiano, en Dart representan problemas de naturaleza completamente distinta. Comprender su diferencia es fundamental para diseñar una estrategia robusta de tolerancia a fallos.

### La jerarquía conceptual

La distinción principal radica en la **recuperabilidad** del suceso y en **quién** es el responsable de resolverlo:

* **`Error` (Fallos del programador):** Representa un problema grave de lógica o de violación de restricciones del lenguaje que ocurre en tiempo de ejecución. Indica que el programador cometió una equivocación al escribir el código. Los errores **no están diseñados para ser capturados**, sino para que el programa falle inmediatamente (haga *crash*) y el desarrollador corrija el código fuente.
* **`Exception` (Condiciones operacionales):** Representa un problema previsto o imprevisto del entorno, pero que ocurre a pesar de que el código esté bien escrito. Son situaciones que un programa estable debe anticipar y gestionar. Las excepciones **están diseñadas para ser capturadas** y manejadas, permitiendo que la aplicación continúe funcionando o falle de manera controlada.

El siguiente diagrama en texto plano ilustra cómo se posicionan ambas familias en el ecosistema de Dart:

```text
          [ Object ]  (Clase base en Dart)
              │
              ├──────────────────────────────┐
              ▼                              ▼
          [ Error ]                     [ Exception ]
  (Fallos de programación)       (Condiciones del entorno)
              │                              │
  ├───────────────────────┐      ├───────────────────────┐
  ▼                       ▼      ▼                       ▼
TypeError        ArgumentError  FormatException  IOException

```

### Características detalladas de `Error`

Un objeto de tipo `Error` se lanza cuando se viola un contrato del código. Por ejemplo, si una función requiere un argumento que no puede ser negativo y se le pasa un `-5`, o si se intenta acceder a una posición de una lista que no existe.

**Propiedades de los errores:**

1. **Falta de previsión matemática/lógica:** No se deben mitigar con bloques `try-catch` en producción; se deben solucionar modificando las líneas de código afectadas.
2. **Información de depuración:** Contienen un `StackTrace` (traza de la pila de llamadas) sumamente detallado para que el desarrollador localice la línea exacta del fallo.
3. **Estado irrecuperable:** Si ocurre un `Error`, el estado de la aplicación ha quedado corrupto o impredecible, por lo que cerrarla suele ser la opción más segura.

#### Ejemplo de un Error común: `RangeError`

El siguiente código intenta acceder a un índice fuera de los límites de una lista. Esto es una violación de las reglas de indexación, un fallo puro del programador.

```dart
void main() {
  List<String> compras = ['Manzanas', 'Peras'];
  
  // ERROR: El índice 2 no existe (los índices válidos son 0 y 1).
  // Dart lanzará un RangeError.
  print(compras[2]); 
}

```

Al ejecutar este código, el programa se detiene abruptamente y muestra un mensaje en la consola:

```text
Unhandled exception:
RangeError (index): Index out of range: index should be less than 2: 2
#0      List.[] (dart:core-patch/growable_array.dart:264:36)
#1      main (file:///main.dart:6:16)

```

### Características detalladas de `Exception`

Una `Exception` ocurre debido a factores externos sobre los cuales el programa no tiene control absoluto. Un usuario puede escribir letras en un campo que solo acepta números, un archivo puede haber sido borrado por el sistema operativo, o un servidor web puede tardar demasiado en responder. El código puede estar perfectamente escrito, pero el mundo exterior es impredecible.

**Propiedades de las excepciones:**

1. **Anticipación:** El programador sabe que estas situaciones pueden ocurrir y escribe lógica protectora a su alrededor.
2. **Flujos alternativos:** Permiten activar planes de contingencia (por ejemplo, mostrar un mensaje de alerta amigable al usuario en lugar de cerrar la aplicación).
3. **Modelado de negocio:** Es muy común extender la clase `Exception` para crear un catálogo de errores propios de la lógica de la aplicación (por ejemplo, `SaldoInsuficienteException`).

#### Ejemplo de una Excepción común: `FormatException`

El siguiente código intenta transformar una cadena de texto en un número entero utilizando `int.parse()`. Si el usuario introduce una cadena que no representa un número, Dart lanza una excepción.

```dart
void main() {
  String entradaUsuario = "123notanumber";
  
  // EXCEPCIÓN: La cadena no se puede parsear a entero.
  // Dart lanzará un FormatException.
  int numero = int.parse(entradaUsuario);
  print("El número es: $numero");
}

```

A diferencia del `RangeError`, este problema no se soluciona modificando el código de `int.parse()`, sino protegiendo la llamada ante entradas inválidas (un flujo que se detallará en las próximas secciones mediante estructuras de captura).

### Tabla comparativa: Error vs. Exception

Para consolidar ambos conceptos, se presenta la siguiente matriz de diferencias operacionales:

| Criterio | `Error` | `Exception` |
| --- | --- | --- |
| **Causa principal** | Errores de lógica, bugs o mal uso de las APIs por parte del desarrollador. | Condiciones externas adversas, fallos de infraestructura o datos de entrada inválidos. |
| **¿Se debe capturar?** | **No.** Se debe reescribir el código para evitar que suceda. | **Sí.** Se debe capturar para ofrecer una solución alternativa y mantener viva la app. |
| **Estado de la App** | Corrupto. Continuar la ejecución puede generar efectos secundarios impredecibles. | Estable. La app puede recuperarse limpiamente si se maneja a tiempo. |
| **Ejemplos nativos** | `RangeError`, `ArgumentError`, `TypeError`, `UnsupportedError`. | `FormatException`, `IOException`, `TimeoutException`. |
| **Filosofía** | "El código está mal escrito y debe repararse". | "El entorno falló, la app debe adaptarse". |

### Cuándo lanzar cada uno

Si estás diseñando una biblioteca o un módulo en Dart y necesitas notificar anomalías a otros desarrolladores o componentes, debes aplicar la misma filosofía:

* Lanza un **`Error`** (o una subclase como `ArgumentError`) si el programador que usa tu función no ha respetado las precondiciones estrictas de la API (por ejemplo, pasar un objeto `null` cuando se especificó que no se permitía).
* Lanza una **`Exception`** si el programador hizo todo bien, pero un factor externo (como la base de datos o el sistema de archivos) impidió completar la operación con éxito.

## 10.2 Bloques try, catch y finally

Una vez que entendemos que las excepciones representan situaciones imprevistas pero recuperables del entorno, el siguiente paso es dotar a nuestra aplicación de la capacidad de reaccionar ante ellas. En Dart, el mecanismo fundamental para interceptar y gestionar estas anomalías es la estructura compuesta por los bloques `try`, `catch` y `finally`.

Este mecanismo evita que una excepción interrumpa abruptamente la ejecución del programa, permitiendo desviar el flujo hacia una sección de código diseñada específicamente para la recuperación o la notificación del problema.

### Estructura y flujo de ejecución

La gestión de excepciones funciona como una red de seguridad. El código que tiene potencial de fallar se encierra dentro de un bloque protector, y las acciones de rescate se definen inmediatamente después.

```text
 [ Bloque try ] ───► ¿Ocurrió una excepción?
       │                         │
       │ (No)                    │ (Sí)
       ▼                         ▼
 Continúa el flujo        [ Bloque catch ]
       │                         │
       └──────────┬──────────────┘
                  ▼
          [ Bloque finally ]

```

1. **`try`:** Define el bloque de código que deseas supervisar. Dart intentará ejecutar cada línea dentro de este bloque de manera normal.
2. **`catch`:** Entra en acción *únicamente* si se lanza una excepción dentro del bloque `try`. Su función es capturar el objeto de la excepción para que puedas inspeccionarlo o registrarlo.
3. **`finally`:** Es un bloque opcional que **siempre se ejecuta**, sin importar si el código en el `try` tuvo éxito o si se produjo una excepción que activó el `catch`. Es el lugar ideal para tareas de limpieza.

### Sintaxis básica y el objeto de excepción

La forma más simple de implementar esta estructura requiere los bloques `try` y `catch`. El bloque `catch` puede recibir hasta dos parámetros: el objeto de la excepción propiamente dicho y la traza de la pila (*stack trace*).

```dart
void main() {
  print("Inicio del programa.");

  try {
    String texto = "No soy un número";
    // Esto lanzará un FormatException
    int numero = int.parse(texto); 
    print("El número parseado es: $numero"); // Esta línea nunca se ejecutará
  } catch (objetoExcepcion, trazaPila) {
    print("¡Algo salió mal!");
    print("Excepción capturada: $objetoExcepcion");
    print("Lugar del fallo:\n$trazaPila");
  }

  print("El programa continúa de forma segura.");
}

```

Si ejecutas este código, notarás que el programa no se detiene con un *crash*. El flujo salta directamente al bloque `catch`, procesa las instrucciones de depuración y luego continúa con la última línea del `main`.

### Captura selectiva con la palabra clave `on`

En aplicaciones reales, un solo bloque `try` puede contener código propenso a lanzar diferentes tipos de excepciones. Por ejemplo, una función que descarga un archivo de internet puede fallar por un problema de red (`IOException`) o por un error al procesar el formato del archivo descargado (`FormatException`).

Tratar todas las excepciones de la misma manera es una mala práctica. Dart permite utilizar la palabra clave `on` antes del `catch` para interceptar tipos específicos de excepciones y darles un tratamiento diferenciado.

```dart
void procesarEntrada(String dato) {
  try {
    if (dato.isEmpty) {
      // Intencionalmente lanzamos un error de argumento (simulado)
      throw ArgumentError("El dato no puede estar vacío.");
    }
    int numero = int.parse(dato);
    print("Resultado: ${numero * 2}");
    
  } on FormatException {
    // Este bloque solo maneja FormatException
    print("Error: El formato del texto introducido no es un número válido.");
    
  } on ArgumentError catch (e) {
    // Este bloque maneja ArgumentError y además inspecciona el objeto 'e'
    print("Error en los datos pasados a la función: ${e.message}");
    
  } catch (e) {
    // Bloque genérico: captura cualquier otra anomalía no prevista arriba
    print("Ocurrió un error inesperado no clasificado: $e");
  }
}

```

> **Regla de oro:** Al encadenar bloques `on`, colócalos siempre de lo más específico a lo más general. Si pones un bloque `catch (e)` genérico al principio, este absorberá todas las excepciones y los bloques `on` inferiores quedarán inaccesibles.

### El bloque `finally`: Garantía de ejecución

Existen operaciones que abren canales de comunicación con recursos externos del sistema operativo, tales como abrir un archivo en el disco, iniciar una transacción en una base de datos o establecer una conexión por sockets. Estos recursos son limitados y deben cerrarse explícitamente, incluso si la operación principal falla.

Si colocas la instrucción de cierre al final del bloque `try`, y ocurre un error a mitad de camino, la línea de cierre nunca se ejecutará. Si la colocas en el `catch`, solo se cerrará cuando haya fallos, duplicando código si también quieres cerrarlo cuando todo vaya bien.

El bloque `finally` resuelve este dilema garantizando que su contenido se ejecute pase lo que pase.

```dart
import 'dart:io';

void leerConfiguracion() {
  File archivo = File('config.txt');
  // Simulamos la apertura de un recurso
  print("Abriendo el archivo de configuración...");

  try {
    // Imaginemos que el archivo no existe o está corrupto
    String contenido = archivo.readAsStringSync();
    print("Contenido leído: $contenido");
  } catch (e) {
    print("No se pudo leer el archivo: $e");
  } finally {
    // Esta sección se ejecutará obligatoriamente
    print("Cerrando el archivo y liberando memoria del sistema.");
  }
}

void main() {
  leerConfiguracion();
}

```

Incluso si el bloque `try` o el bloque `catch` contienen una sentencia `return` para abandonar la función inmediatamente, Dart garantizará que el bloque `finally` se ejecute justo antes de que la función devuelva el control al invocador.

## 10.3 Lanzamiento de excepciones

Hasta ahora hemos aprendido cómo reaccionar ante las excepciones que el propio entorno de Dart genera. Sin embargo, para construir aplicaciones robustas, llegará un momento en el que tu propio código deberá tomar la iniciativa y señalar que algo ha salido mal. A este acto de notificar activamente una anomalía se le conoce como **lanzar una excepción** (o *throw*).

Lanzar una excepción rompe inmediatamente el flujo lineal de la función actual y transfiere el control de la ejecución hacia arriba en la pila de llamadas, buscando el bloque `try-catch` más cercano que sepa cómo manejar la situación.

### La palabra clave `throw`

En Dart, el lanzamiento de una anomalía se realiza mediante la palabra clave `throw`. A diferencia de otros lenguajes de programación estrictos donde solo puedes lanzar objetos que hereden de una clase base específica, **Dart permite lanzar cualquier objeto que no sea nulo**, incluyendo cadenas de texto, números enteros o instancias de clases personalizadas.

```dart
void verificarEdad(int edad) {
  if (edad < 0) {
    // Lanzando una cadena de texto plana (posible, pero no recomendado)
    throw "La edad no puede ser un número negativo.";
  }
  
  if (edad < 18) {
    // Lanzando un objeto formal que describe el error de argumento
    throw ArgumentError("Debes ser mayor de edad para registrarte.");
  }

  print("Registro completado con éxito para la edad: $edad");
}

```

> **Buena práctica:** Aunque Dart te permita técnicamente lanzar un entero (`throw 404;`) o un texto, la convención profesional dicta que siempre debes lanzar instancias de clases que implementen `Exception` o que extiendan de `Error`. Esto dota a tu código de semántica y facilita el uso de bloques `on` para capturas selectivas.

### Flujo de propagación de una excepción

Cuando ejecutas una sentencia `throw`, Dart detiene la función actual en esa línea exacta. Si la función no tiene un bloque `try-catch` interno, la excepción se "propaga" (burbujea) hacia la función que la invocó. Este proceso continúa hacia atrás en la cadena de llamadas hasta que encuentra un capturador. Si llega al método `main` y nadie la atrapa, el programa se interrumpe por completo.

```text
[ Método main ] ── Llamaba a ──► [ Función A ] ── Llamaba a ──► [ Función B ]
       ▲                                                               │
       │                                                               ▼
  Recibe el impacto ◄─── Se propaga en ◄─── Se propaga en ◄─── [ throw Exception ]
   y la app cae          reversa             reversa           (Detiene ejecución)

```

Veamos este comportamiento en código:

```dart
void funcionB() {
  print("Inicio de Función B");
  throw FormatException("Error provocado en la Función B");
  print("Fin de Función B"); // Esta línea nunca se ejecutará
}

void funcionA() {
  print("Inicio de Función A");
  funcionB(); // Aquí se recibe la excepción de B y, al no haber try-catch, se pasa a main
  print("Fin de Función A"); // Tampoco se ejecutará
}

void main() {
  print("Inicio de Main");
  try {
    funcionA();
  } catch (e) {
    print("Excepción atrapada en Main de forma segura: $e");
  }
  print("Fin de Main");
}

```

### Relanzamiento de excepciones con `rethrow`

En ocasiones, querrás interceptar una excepción en un nivel intermedio de tu aplicación, pero no con el objetivo de resolverla por completo, sino para realizar una acción secundaria y permitir que siga su camino hacia arriba. Esto es sumamente útil para:

* Registrar el fallo en un archivo de logs local.
* Liberar un recurso específico de esa función intermedia.
* Notificar a un sistema analítico externo antes de que afecte la interfaz.

Para lograr esto, Dart provee la palabra clave **`rethrow`**. A diferencia de volver a lanzar el objeto usando `throw e`, `rethrow` tiene la enorme ventaja de **preservar intacta la traza de la pila original** (`StackTrace`), permitiendo que el receptor final sepa exactamente dónde se originó el fallo primitivo y no dónde se volvió a lanzar.

```dart
void conectarBaseDatos() {
  try {
    // Simulamos un fallo de red al conectar
    throw HttpException("No se pudo establecer conexión con el servidor.");
  } on HttpException catch (e) {
    // Acción secundaria: registramos el problema localmente
    print("[LOG] Fallo crítico de red: ${e.message}");
    
    // Volvemos a lanzar la excepción original para que la UI decida qué mostrar
    rethrow; 
  }
}

void main() {
  try {
    conectarBaseDatos();
  } catch (e) {
    print("La UI capturó el rethrow: Mostrar pantalla de error al usuario.");
  }
}

```

Al utilizar `rethrow` garantizamos que el flujo mantenga su transparencia, permitiendo que las distintas capas de la arquitectura de software realicen sus respectivas responsabilidades de manejo de errores de forma coordinada.

## 10.4 Creación de excepciones propias

A medida que tus aplicaciones crecen, las excepciones nativas que proporciona Dart (como `FormatException` o `ArgumentError`) se vuelven insuficientes para describir los problemas específicos de tu lógica de negocio. Si estás construyendo una aplicación bancaria, un error del tipo "fondos insuficientes" no es un fallo de formato ni un problema de argumentos; es una violación de las reglas de tu sistema.

Dart permite crear excepciones personalizadas de forma muy sencilla. Esto mejora drásticamente la legibilidad del código y permite a las capas superiores de la aplicación (como la interfaz de usuario) reaccionar con precisión quirúrgica ante diferentes escenarios de fallo.

### Implementando la interfaz `Exception`

Para crear una excepción propia, basta con definir una clase que implemente la interfaz `Exception`. Aunque Dart no te obliga técnicamente a hacerlo (vimos que se puede lanzar cualquier objeto), implementar `Exception` es la norma profesional para que tu clase sea reconocida formalmente dentro del ecosistema del lenguaje.

Es una buena práctica definir un constructor que reciba un mensaje descriptivo y sobrescribir el método `toString()` para que, al imprimir la excepción en consola o en los logs, se muestre de forma limpia.

```dart
class SaldoInsuficienteException implements Exception {
  final double saldoActual;
  final double montoSolicitado;

  SaldoInsuficienteException(this.saldoActual, this.montoSolicitado);

  @override
  String toString() {
    return "SaldoInsuficienteException: Intento de retirar \$$montoSolicitado "
           "pero el saldo actual es de solo \$$saldoActual.";
  }
}

```

### Caso práctico de uso

Imaginemos un sistema de procesamiento de cuentas bancarias. Vamos a lanzar nuestra excepción personalizada si se intenta realizar un retiro que supere el capital disponible, y luego la capturaremos de forma selectiva.

```dart
class CuentaBancaria {
  double _saldo = 100.0;

  void retirar(double cantidad) {
    if (cantidad <= 0) {
      throw ArgumentError("La cantidad a retirar debe ser mayor que cero.");
    }
    
    if (cantidad > _saldo) {
      // Lanzamos nuestra excepción personalizada con datos contextuales
      throw SaldoInsuficienteException(_saldo, cantidad);
    }

    _saldo -= cantidad;
    print("Retiro exitoso. Nuevo saldo: \$_$_saldo");
  }
}

void main() {
  CuentaBancaria miCuenta = CuentaBancaria();

  try {
    // Intentamos retirar más de lo que hay en la cuenta
    miCuenta.retirar(150.0);
  } on SaldoInsuficienteException catch (e) {
    // Captura específica: actuamos según el problema de negocio
    print("Operación rechazada por el banco.");
    print("Detalle: $e");
    print("Sugerencia: Intente un monto menor a \${e.saldoActual}");
  } on ArgumentError catch (e) {
    // Captura de errores de desarrollo o datos mal formados
    print("Error en los datos de la transacción: ${e.message}");
  } catch (e) {
    // Red de seguridad para cualquier otro fallo
    print("Error inesperado: $e");
  }
}

```

Al ejecutar este código, el bloque `on SaldoInsuficienteException` interceptará el problema. Gracias a que guardamos las propiedades `saldoActual` y `montoSolicitado` dentro del objeto de la excepción, la sección encargada de capturarla puede tomar decisiones inteligentes o construir mensajes de interfaz de usuario mucho más detallados.

## Resumen del capítulo

En este capítulo hemos explorado cómo transformar situaciones inesperadas en flujos de ejecución controlados y profesionales:

* **Diferenciación conceptual:** Aprendimos que los `Error` representan fallos del programador que requieren corregir el código fuente, mientras que las `Exception` son condiciones operacionales del entorno que la aplicación debe anticipar.
* **Mecanismos de control:** Estudiamos la estructura `try-catch-finally`, descubriendo cómo usar `on` para capturar anomalías de forma selectiva y cómo asegurar la liberación de recursos críticos mediante el bloque `finally`.
* **Gestión activa:** Analizamos el uso de `throw` para disparar alertas en nuestro código y la importancia de `rethrow` para interceptar fallos en capas intermedias sin destruir la traza original de la pila.
* **Personalización:** Aprendimos a extender las capacidades de Dart modelando nuestras propias excepciones de negocio mediante la interfaz `Exception`, dotando a nuestras aplicaciones de una semántica robusta y una arquitectura tolerante a fallos de nivel empresarial.
