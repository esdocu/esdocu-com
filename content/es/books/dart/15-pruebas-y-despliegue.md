Garantizar la estabilidad y el rendimiento de una aplicación es un pilar fundamental en el desarrollo profesional. Este capítulo aborda las herramientas que ofrece Dart para asegurar la calidad del software antes de su distribución. Aprenderás a escribir pruebas unitarias automatizadas con el paquete `test`, a organizar código con `group` y a aislar componentes críticos mediante el uso de *mocks*. Finalmente, exploraremos las tripas del ecosistema de Dart examinando las diferencias entre la compilación JIT y AOT, y los pasos clave para empaquetar y publicar tus propias librerías en pub.dev.

## 15.1 Pruebas unitarias básicas

El desarrollo de software profesional requiere mecanismos que garanticen que el código funciona según lo esperado y que los cambios introducidos no rompan la funcionalidad existente. Las **pruebas unitarias** (unit tests) se encargan de verificar el comportamiento de la unidad más pequeña de código de manera aislada, por lo general una función, un método o una clase.

En esta sección aprenderás a configurar el entorno de pruebas en Dart, a utilizar el paquete oficial `test` y a escribir tus primeras aserciones para validar la lógica de tus programas.

### Configuración del entorno de pruebas

Para escribir y ejecutar pruebas unitarias en un proyecto de Dart puro, es necesario añadir el paquete `test` proporcionado por el equipo de desarrollo de Dart como una dependencia de desarrollo. Las dependencias de desarrollo (`dev_dependencies`) son aquellas que solo se necesitan durante la fase de creación y verificación del código, pero que no se incluyen en la aplicación compilada final.

La estructura recomendada para un proyecto Dart que incluye pruebas sigue la siguiente convención de directorios:

```text
mi_proyecto/
├── pubspec.yaml
├── lib/
│   └── calculadora.dart
└── test/
    └── calculadora_test.dart

```

> **Regla de oro:** Todos los archivos de prueba deben ubicarse dentro del directorio raíz `test/` y sus nombres deben finalizar estrictamente con el sufijo `_test.dart`. De lo contrario, las herramientas de automatización de Dart no los reconocerán como archivos ejecutables de prueba.

A continuación, se muestra cómo debe configurarse el archivo `pubspec.yaml`:

```yaml
name: mi_proyecto
description: Un proyecto de ejemplo para aprender pruebas unitarias.
version: 1.0.0
environment:
  sdk: '^3.0.0'

dependencies:
  # Dependencias de producción aquí

dev_dependencies:
  test: ^1.24.0

```

### Anatomía de una prueba unitaria

Para escribir una prueba, se utiliza la función global `test()`, la cual es provista por el paquete `test`. Esta función recibe dos argumentos principales:

1. **`description` (String):** Un texto claro y descriptivo en lenguaje natural que explica qué comportamiento se está verificando.
2. **`body` (Function):** Una función anónima (o lambda) que contiene el código de la prueba y las verificaciones pertinentes.

Dentro del cuerpo de la prueba, la validación del resultado se realiza mediante la función `expect()`. Esta compara el valor real obtenido con el valor esperado utilizando **emparejadores** (matchers).

```text
+-------------------------------------------------------------+
| Función test("Descripción de la prueba", () {               |
|                                                             |
|   1. Preparar (Arrange): Configurar datos de entrada.        |
|   2. Actuar (Act): Ejecutar la función a probar.            |
|   3. Afirmar (Assert): expect(valorReal, valorEsperado);   |
|                                                             |
| });                                                         |
+-------------------------------------------------------------+

```

### Escribiendo la primera prueba

Imagina que tienes una clase sencilla llamada `Calculadora` dentro de `lib/calculadora.dart`:

```dart
// lib/calculadora.dart
class Calculadora {
  int sumar(int a, int b) {
    return a + b;
  }

  double dividir(int a, int b) {
    if (b == 0) {
      throw ArgumentError('No se puede dividir por cero.');
    }
    return a / b;
  }
}

```

Para comprobar que el método `sumar` funciona correctamente, creamos el archivo de pruebas correspondiente en la ruta `test/calculadora_test.dart`:

```dart
// test/calculadora_test.dart
import 'package:mi_proyecto/calculadora.dart';
import 'package:test/test.dart';

void main() {
  test('La función sumar debe devolver 5 cuando se pasa 2 y 3', () {
    // 1. Arrange (Preparar)
    final calculadora = Calculadora();

    // 2. Act (Actuar)
    final resultado = calculadora.sumar(2, 3);

    // 3. Assert (Afirmar)
    expect(resultado, equals(5));
  });
}

```

### Uso de Matchers (Emparejadores) comunes

El paquete `test` ofrece una amplia variedad de emparejadores para realizar aserciones detalladas. Algunos de los más utilizados son:

* `equals(valor)`: Verifica si el resultado es igual al valor esperado (por valor, no por referencia en tipos primitivos).
* `isTrue` / `isFalse`: Evalúa si un valor booleano es verdadero o falso.
* `isNull` / `isNotNull`: Comprueba la presencia o ausencia de valores nulos (esencial trabajando con *Null Safety*).
* `throwsA(matcher)`: Verifica que un bloque de código lance una excepción específica durante su ejecución.

#### Ejemplo: Probando excepciones y valores lógicos

Modifiquemos nuestro archivo de pruebas para validar el comportamiento del método `dividir` ante un flujo normal y ante una situación de error:

```dart
// test/calculadora_test.dart (Continuación)
import 'package:mi_proyecto/calculadora.dart';
import 'package:test/test.dart';

void main() {
  test('La función sumar debe devolver 5 cuando se pasa 2 y 3', () {
    final calculadora = Calculadora();
    expect(calculadora.sumar(2, 3), equals(5));
  });

  test('La función dividir debe calcular correctamente la división decimal', () {
    final calculadora = Calculadora();
    final resultado = calculadora.dividir(5, 2);
    
    expect(resultado, equals(2.5));
  });

  test('La función dividir debe lanzar un ArgumentError al dividir por cero', () {
    final calculadora = Calculadora();

    // Cuando se evalúan excepciones, pasamos una función anónima a expect()
    // para que la ejecución sea controlada por el matcher throwsA.
    expect(
      () => calculadora.dividir(10, 0), 
      throwsA(isA<ArgumentError>()),
    );
  });
}

```

### Ejecución de las pruebas

Para ejecutar las pruebas desde la terminal, debes situarte en el directorio raíz del proyecto y utilizar el CLI de Dart con el siguiente comando:

```bash
dart test

```

Si todo el código cumple con los criterios establecidos, la terminal mostrará un reporte indicando el éxito de la operación:

```text
00:01 +3: All tests passed!

```

En caso de que alguna aserción falle, el framework indicará de manera detallada el motivo del fallo, mostrando el archivo, la línea exacta, el valor que se esperaba y el valor real que se recibió.

## 15.2 Agrupación de pruebas

A medida que el proyecto crece, el número de pruebas unitarias aumenta rápidamente. Mantener decenas o cientos de pruebas en un único flujo lineal vuelve el código difícil de leer y mantener. Para resolver esto, el paquete `test` de Dart ofrece la función `group()`, la cual permite organizar y estructurar pruebas relacionadas dentro de bloques lógicos bien definidos.

### La función `group`

La función `group()` se utiliza para reunir varias pruebas (`test()`) que comparten un contexto común, como los métodos de una misma clase o diferentes escenarios de una misma función. Al igual que `test()`, recibe una descripción en formato `String` y una función anónima que encapsula las pruebas.

```text
+--------------------------------------------------------+
| group('Pruebas de la clase Calculadora', () {          |
|                                                        |
|   group('Método sumar', () {                           |
|     test('con números positivos...', () { ... });       |
|     test('con números negativos...', () { ... });       |
|   });                                                  |
|                                                        |
|   group('Método restar', () {                          |
|     test('...', () { ... });                           |
|   });                                                  |
|                                                        |
| });                                                    |
+--------------------------------------------------------+

```

Agrupar las pruebas ofrece ventajas clave:

1. **Claridad en los reportes:** En la consola, los nombres de los grupos se anteponen a las descripciones de las pruebas, creando una jerarquía legible (por ejemplo: `Calculadora Método sumar con números positivos`).
2. **Modularidad:** Permite anidar grupos dentro de otros grupos para desglosar comportamientos complejos.
3. **Ciclos de vida compartidos:** Permite aplicar configuraciones iniciales o de limpieza exclusivas para el conjunto de pruebas del grupo.

### Ciclos de vida en las pruebas: Setup y Teardown

Cuando varias pruebas requieren la misma configuración previa (como instanciar una clase o preparar datos ficticios), repetir ese código en cada `test()` viola el principio *DRY* (Don't Repeat Yourself). Dart proporciona cuatro funciones de ciclo de vida para automatizar estas tareas:

* **`setUp()`:** Se ejecuta **antes de cada** prueba dentro del grupo o archivo actual. Es ideal para inicializar objetos o reiniciar el estado de una variable.
* **`tearDown()`:** Se ejecuta **después de cada** prueba. Se utiliza para limpiar recursos, cerrar conexiones o borrar datos temporales.
* **`setUpAll()`:** Se ejecuta **una sola vez antes de todas** las pruebas del grupo. Útil para tareas pesadas de configuración única.
* **`tearDownAll()`:** Se ejecuta **una sola vez después de que todas** las pruebas del grupo han finalizado.

### Ejemplo práctico de agrupación y ciclo de vida

Para entender cómo interactúan estas herramientas, simularemos las pruebas para un gestor de autenticación de usuarios sencillo:

```dart
// lib/autenticador.dart
class Autenticador {
  final List<String> _usuariosLogueados = [];

  bool sesionActiva(String usuario) => _usuariosLogueados.contains(usuario);

  void iniciarSesion(String usuario) {
    if (usuario.isEmpty) throw ArgumentError('Usuario inválido');
    _usuariosLogueados.add(usuario);
  }

  void cerrarSesion(String usuario) {
    _usuariosLogueados.remove(usuario);
  }
}

```

A continuación, estructuramos las pruebas unitarias organizadas en grupos y optimizadas mediante el uso de `setUp`:

```dart
// test/autenticador_test.dart
import 'package:mi_proyecto/autenticador.dart';
import 'package:test/test.dart';

void main() {
  group('Pruebas de la clase Autenticador -', () {
    // Declaramos la referencia fuera para que sea accesible en todo el grupo
    late Autenticador autenticador;

    // Se ejecuta antes de cada test del grupo principal. 
    // Garantiza que cada prueba inicie con un objeto limpio y fresco.
    setUp(() {
      autenticador = Autenticador();
    });

    group('Iniciar Sesión:', () {
      test('Debe activar la sesión cuando el usuario es válido', () {
        autenticador.iniciarSesion('Ana');
        expect(autenticador.sesionActiva('Ana'), isTrue);
      });

      test('Debe lanzar una excepción si el nombre de usuario está vacío', () {
        expect(
          () => autenticador.iniciarSesion(''),
          throwsA(isA<ArgumentError>()),
        );
      });
    });

    group('Cerrar Sesión:', () {
      test('Debe remover al usuario de la lista de sesiones activas', () {
        // Configuración interna del test
        autenticador.iniciarSesion('Carlos');
        
        autenticador.cerrarSesion('Carlos');
        expect(autenticador.sesionActiva('Carlos'), isFalse);
      });
    });
  });
}

```

### Ejecución filtrada de grupos

Una de las utilidades más potentes de agrupar pruebas es la capacidad de ejecutar únicamente un segmento específico de nuestra suite de pruebas desde la terminal, utilizando el parámetro `--name` o `-n`.

Si solo deseas ejecutar las pruebas relacionadas al inicio de sesión del ejemplo anterior, puedes filtrar por el nombre del grupo:

```bash
dart test -n "Iniciar Sesión"

```

El motor de pruebas buscará cualquier coincidencia en las cadenas de texto de los `group()` o `test()` y descartará el resto, optimizando el tiempo de respuesta durante el ciclo de desarrollo.

## 15.3 Mocking de dependencias

En el desarrollo de software real, las clases no trabajan de manera aislada; interactúan con servicios externos como bases de datos, APIs web, el sistema de archivos o sensores del dispositivo. Al escribir pruebas unitarias, depender de estos servicios reales introduce problemas: las pruebas se vuelven lentas, requieren conexión a internet y pueden fallar por factores externos al código (por ejemplo, que el servidor esté caído).

Para resolver esto se utiliza el **Mocking** (simulación). Consiste en crear objetos falsos que imitan el comportamiento de las dependencias reales, permitiendo controlar exactamente qué respuestas devuelven y verificar cómo interactúa nuestro código con ellas.

### Mockito y Mocktail

Históricamente, el paquete más popular en Dart para este propósito ha sido `mockito`. Sin embargo, debido a la introducción de *Null Safety* en Dart, `mockito` requiere generación de código a través de `build_runner`.

Como alternativa moderna y limpia que no requiere generación de código, la comunidad de Dart utiliza ampliamente **`mocktail`**. Este paquete aprovecha las capacidades del sistema de tipos de Dart para crear simulaciones en tiempo de ejecución de forma sencilla.

Para este apartado, utilizaremos `mocktail`. Primero, debemos añadirlo a las dependencias de desarrollo en el archivo `pubspec.yaml`:

```yaml
dev_dependencies:
  test: ^1.24.0
  mocktail: ^1.0.0

```

### Configuración de un Mock con Mocktail

Para simular una clase, simplemente debemos crear una nueva clase que herede de `Mock` e implemente la interfaz de la clase real que deseamos imitar.

Supongamos que tenemos un servicio que interactúa con una API web para obtener información de usuarios:

```dart
// lib/servicio_usuario.dart
class Usuario {
  final int id;
  final String nombre;

  Usuario({required this.id, required this.nombre});
}

class ServicioUsuario {
  // En un entorno real, esto haría una petición HTTP a un servidor
  Future<Usuario> obtenerUsuarioDesdeServidor(int id) async {
    // Código de conexión externa...
    throw UnimplementedError();
  }
}

```

Y tenemos un componente de lógica de negocio (`GestorUsuarios`) que depende de ese servicio:

```dart
// lib/gestor_usuarios.dart
import 'package:mi_proyecto/servicio_usuario.dart';

class GestorUsuarios {
  final ServicioUsuario servicio;

  GestorUsuarios(this.servicio);

  Future<String> obtenerNombreFormateado(int id) async {
    try {
      final usuario = await servicio.obtenerUsuarioDesdeServidor(id);
      return 'Usuario: ${usuario.nombre}';
    } catch (e) {
      return 'Usuario no encontrado';
    }
  }
}

```

### Escribiendo la prueba con simulación

Para probar `GestorUsuarios` sin tocar un servidor real, creamos un objeto simulado de `ServicioUsuario`. Utilizaremos dos herramientas clave de `mocktail`:

1. **`when()`**: Permite definir el comportamiento del objeto simulado. Le dice al *mock*: "Cuando llamen a este método con estos argumentos, responde esto".
2. **`any()`**: Es un argumento comodín. Indica que el comportamiento se aplicará sin importar qué valor específico se pase como parámetro.

```dart
// test/gestor_usuarios_test.dart
import 'package:mi_proyecto/gestor_usuarios.dart';
import 'package:mi_proyecto/servicio_usuario.dart';
import 'package:mocktail/mocktail.dart';
import 'package:test/test.dart';

// 1. Creamos la clase Mock heredando de Mock e implementando la clase real
class MockServicioUsuario extends Mock implements ServicioUsuario {}

void main() {
  late MockServicioUsuario mockServicio;
  late GestorUsuarios gestor;

  setUp(() {
    mockServicio = MockServicioUsuario();
    // 2. Inyectamos la dependencia simulada en nuestro gestor
    gestor = GestorUsuarios(mockServicio);
  });

  group('Pruebas en GestorUsuarios con Mocking:', () {
    test('Debe retornar el nombre formateado correctamente cuando el servicio responde con éxito', () async {
      // Preparar el comportamiento del Mock
      // Cuando se llame a obtenerUsuarioDesdeServidor con cualquier entero (any()),
      // responderá (thenAnswer) con un Future que contiene un objeto Usuario falso.
      when(() => mockServicio.obtenerUsuarioDesdeServidor(any()))
          .thenAnswer((_) async => Usuario(id: 1, nombre: 'Lucía'));

      // Actuar
      final resultado = await gestor.obtenerNombreFormateado(1);

      // Afirmar
      expect(resultado, equals('Usuario: Lucía'));
      
      // Verificación opcional: Asegura que el método del servicio realmente se invocó una vez
      verify(() => mockServicio.obtenerUsuarioDesdeServidor(1)).called(1);
    });

    test('Debe retornar "Usuario no encontrado" cuando el servicio lanza una excepción', () async {
      // Configurar el Mock para que falle de forma controlada
      when(() => mockServicio.obtenerUsuarioDesdeServidor(any()))
          .thenThrow(Exception('Error de conexión'));

      // Actuar
      final resultado = await gestor.obtenerNombreFormateado(99);

      // Afirmar
      expect(resultado, equals('Usuario no encontrado'));
    });
  });
}

```

### Verificación de interacciones

Además de controlar lo que devuelven los objetos simulados, el mocking permite auditar el comportamiento interno de nuestro código mediante la función `verify()`.

* `verify(...).called(1);` asegura que un método específico fue ejecutado exactamente el número de veces indicado.
* `verifyNever(...);` garantiza que, bajo ciertas condiciones, un método crítico (como borrar una base de datos) nunca llegó a ejecutarse.

Gracias a estas técnicas, las pruebas de integración y unitarias se mantienen rápidas, predecibles y enfocadas exclusivamente en la lógica del archivo que se está evaluando.

## 15.4 Compilación AOT y JIT

Una de las características más potentes y distintivas del ecosistema de Dart es su arquitectura de compilación flexible. Dart no se limita a un único método para transformar el código fuente en instrucciones ejecutables; en su lugar, utiliza dos estrategias complementarias según la etapa del ciclo de vida del software en la que se encuentre el desarrollador: **JIT (Just-In-Time)** y **AOT (Ahead-Of-Time)**.

Esta doble capacidad permite que Dart sea idóneo tanto para entornos de desarrollo ágiles como para aplicaciones de producción de alto rendimiento.

```text
Entorno de Desarrollo (Fase de Escritura)
[Código Fuente .dart] ---> Compilación JIT ---> [Máquina Virtual de Dart (VM)]
                                                      ▲
                                                      │ (Modificaciones en vivo)
                                               [Hot Reload]

Entorno de Producción (Fase de Distribución)
[Código Fuente .dart] ---> Compilación AOT ---> [Código Máquina Nativo (Binario)]

```

### Compilación JIT (Just-In-Time)

La compilación **JIT** o *"Justo a tiempo"* se activa por defecto durante la etapa de desarrollo. En este modo, el código fuente en Dart se compila a código máquina intermedio o nativo **mientras el programa se está ejecutando**.

#### Características principales de JIT

* **Carga inicial dinámica:** Cuando ejecutas un script con `dart run`, la Máquina Virtual de Dart (Dart VM) lee el código y lo compila dinámicamente a medida que las funciones son requeridas.
* **Hot Reload (Recarga en caliente):** Al compilar en tiempo de ejecución, la Dart VM puede inyectar modificaciones de código fuente directamente en el proceso activo sin necesidad de reiniciar la aplicación ni perder el estado actual del programa. Esto reduce el ciclo de desarrollo a fracciones de segundo.
* **Perfilado en vivo:** JIT analiza el comportamiento de la aplicación en tiempo real, lo que facilita la recolección de métricas de rendimiento y la depuración (*debugging*) a través de herramientas de telemetría.

### Compilación AOT (Ahead-Of-Time)

La compilación **AOT** o *"Antes de tiempo"* se utiliza exclusivamente cuando el software está listo para ser distribuido a los usuarios finales (producción). En este escenario, el código fuente de Dart se traduce por completo a código máquina nativo de la arquitectura de destino (como x86_64 o ARM) **antes de que se inicie la ejecución**.

#### Características principales de AOT

* **Compilación estática:** Se genera un archivo binario ejecutable e independiente que no requiere de la instalación del SDK de Dart ni de una máquina virtual externa para funcionar.
* **Inicio instantáneo (Instant Startup):** Al no tener que compilar código durante la ejecución, el programa se inicia de forma inmediata, optimizando los tiempos de respuesta críticos.
* **Optimización del tamaño (Tree Shaking):** Durante el proceso de compilación AOT, el compilador realiza un análisis estático para identificar y remover de forma permanente todo el código muerto, funciones o librerías importadas que nunca se llegan a mandar a llamar, reduciendo drásticamente el peso del binario final.

### Comparativa: JIT vs. AOT

| Característica | Compilación JIT (Desarrollo) | Compilación AOT (Producción) |
| --- | --- | --- |
| **Momento de compilación** | Durante la ejecución del programa. | Antes de ejecutar el programa. |
| **Entorno de ejecución** | Requiere la Dart VM (Máquina Virtual). | Ejecución nativa directa sobre el S.O. |
| **Velocidad de inicio** | Más lenta (debe compilar al arrancar). | Ultra rápida (código máquina listo). |
| **Soporte de Hot Reload** | Sí, completo. | No compatible. |
| **Destino principal** | Pruebas, depuración y desarrollo diario. | Despliegue en servidores, móviles y escritorio. |

### Comandos prácticos en Dart

El SDK de Dart proporciona herramientas en la línea de comandos para alternar explícitamente entre ambos tipos de compilación.

Si deseas ejecutar un archivo utilizando el entorno **JIT** para probar cambios rápidamente:

```bash
dart run bin/main.dart

```

Cuando el código esté finalizado y desees compilarlo en un binario nativo optimizado mediante **AOT**, ejecutas:

```bash
dart compile exe bin/main.dart -o bin/programa_nativo

```

El resultado será un archivo ejecutable optimizado (`programa_nativo`) listo para operar con el máximo rendimiento y el menor consumo de memoria en servidores o entornos productivos.

## 15.5 Publicación de paquetes

El ecosistema de Dart cuenta con un repositorio centralizado y oficial para compartir librerías y herramientas de código abierto llamado **pub.dev**. Publicar un paquete en esta plataforma permite que cualquier desarrollador en el mundo pueda instalar y reutilizar tu código de la misma forma en que utilizas paquetes como `test` o `mocktail`.

En esta sección aprenderás los pasos necesarios para preparar, validar y subir con éxito tu librería al registro público de Dart.

### Requisitos previos a la publicación

Antes de subir un paquete a pub.dev, el SDK de Dart exige el cumplimiento de ciertos estándares de calidad y documentación. Un paquete bien estructurado debe contener los siguientes archivos en su raíz:

1. **`pubspec.yaml`**: Debe incluir obligatoriamente las propiedades `name`, `version`, `description`, `homepage` (o `repository`) y el entorno `environment` compatible.
2. **`README.md`**: Un archivo en formato Markdown que explique detalladamente qué hace el paquete, cómo se instala y ejemplos prácticos de uso.
3. **`CHANGELOG.md`**: Un registro histórico de los cambios introducidos en cada versión del paquete. Sigue el versionado semántico (por ejemplo, `1.0.0`).
4. **`LICENSE`**: El texto completo de la licencia de código abierto (por ejemplo, MIT, BSD-3-Clause o Apache 2.0). pub.dev no aceptará paquetes sin una licencia válida detectada automáticamente.

### Verificación y puntuación del paquete

El equipo de Dart proporciona una herramienta automatizada de análisis que evalúa tu paquete y le otorga una puntuación basada en las buenas prácticas de diseño, plataforma de soporte, documentación y formato del código.

Para asegurarte de que tu paquete cumple con todas las reglas, debes ejecutar los siguientes comandos en tu terminal antes de intentar subirlo:

```bash
# 1. Verifica que el formateador oficial de Dart se aplique a todo el código
dart format .

# 2. Analiza el código en busca de advertencias, errores o malas prácticas
dart analyze

# 3. Realiza un simulacro completo del proceso de publicación
dart pub publish --dry-run

```

El comando `dart pub publish --dry-run` es un paso crucial. Analiza la estructura completa de los archivos y simula la subida al servidor sin llegar a publicar nada. Si encuentra algún error (como enlaces rotos, archivos faltantes o configuraciones incorrectas), la consola te advertirá de inmediato.

### El proceso de publicación

Una vez que la simulación (`--dry-run`) se complete con éxito y sin advertencias, estás listo para realizar la publicación definitiva.

Ejecuta el comando de publicación real:

```bash
dart pub publish

```

Al presionar Enter, el CLI de Dart realizará el siguiente flujo:

1. **Confirmación:** Te solicitará una confirmación final en la consola advirtiéndote que **la publicación de un paquete es permanente** (las versiones publicadas no se pueden eliminar ni modificar para garantizar que los proyectos que dependan de ellas no se rompan en el futuro).
2. **Autenticación:** Si es tu primera vez publicando, el comando imprimirá un enlace web único en la terminal. Deberás abrirlo en tu navegador e iniciar sesión con una cuenta de Google para verificar tu identidad como desarrollador.
3. **Subida:** Tras otorgar los permisos, el SDK empaquetará tus archivos de código fuente y los enviará a los servidores de pub.dev.

En pocos minutos, tu paquete dispondrá de un perfil público propio en la plataforma y estará disponible para ser importado por la comunidad global de Dart.

## Resumen del capítulo

En este **Capítulo 15: Pruebas y Despliegue**, hemos explorado las herramientas esenciales para garantizar la calidad y la distribución de nuestras aplicaciones en Dart:

* **Pruebas unitarias:** Aprendimos a estructurar proyectos con el paquete `test` y a utilizar aserciones mediante la función `expect()` combinada con *matchers* para validar flujos individuales y excepciones de código.
* **Agrupación y Ciclos de Vida:** Analizamos cómo organizar suites de pruebas complejas mediante `group()` y optimizar la preparación de entornos mediante el uso estratégico de `setUp()` y `tearDown()`.
* **Mocking:** Descubrimos cómo aislar nuestro código de dependencias externas impredecibles (como servicios HTTP o bases de datos) utilizando el paquete `mocktail` para simular respuestas bajo demanda.
* **Compilación JIT y AOT:** Comprendimos el funcionamiento interno de la infraestructura de Dart, diferenciando el dinamismo y velocidad de desarrollo de **JIT** (con su característico *Hot Reload*) frente al rendimiento óptimo, binarios nativos y ligereza que ofrece **AOT** para entornos de producción.
* **Ecosistema de paquetes:** Finalizamos el ciclo de vida del software conociendo las directrices técnicas obligatorias para empaquetar, validar y publicar librerías reutilizables en el repositorio oficial **pub.dev**.
