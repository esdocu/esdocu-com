La metaprogramación en Dart transforma la forma de escribir software al permitir que el código inspeccione, configure y automatice a otros bloques de código. En lugar de depender de la costosa reflexión en tiempo de ejecución, Dart apuesta por la eficiencia en tiempo de compilación.

A través de este capítulo, descubrirás cómo los metadatos básicos protegen la arquitectura de tus programas y aprenderás a diseñar tus propias anotaciones personalizadas. Finalmente, dominarás las herramientas del ecosistema de generación de código como `build_runner`, eliminando de forma definitiva el código repetitivo (*boilerplate*) para construir aplicaciones más seguras, limpias y optimizadas.

## 14.1 Uso de metadatos básicos

Los metadatos en Dart son una forma de añadir información semántica o descriptiva adicional al código fuente. Esta información no altera directamente el comportamiento lógico inmediato del programa en tiempo de ejecución, sino que sirve como pistas o instrucciones para el compilador, los analizadores estáticos de código (linters), las herramientas de desarrollo y los entornos de desarrollo integrados (IDEs).

En Dart, los metadatos se expresan mediante **anotaciones**. Una anotación comienza siempre con el símbolo `@` seguido de una referencia a una constante en tiempo de compilación o a un constructor constante.

### El rol de los metadatos básicos

El analizador de Dart utiliza las anotaciones estándar para realizar un análisis estático profundo. Su objetivo principal es advertir al desarrollador sobre posibles errores de diseño, código obsoleto o implementaciones incompletas antes de que el programa se compile o ejecute.

```text
+------------------+     @override     +-----------------------+
|  Código Fuente   | --------------->  | Analizador de Dart    |
|  con Anotación   |                   | (Linter / Compilador) |
+------------------+                   +-----------------------+
                                                   |
                                                   v
                                       [ Reporta advertencias ]
                                       [  o valida la sintaxis ]

```

Dart ofrece varias anotaciones predefinidas en su núcleo (`dart:core`) y en paquetes oficiales estrechamente integrados como `meta/meta.dart`. A continuación, se detallan las más utilizadas e importantes en el desarrollo diario.

### 1. `@override`

Esta es la anotación más común en Dart. Se utiliza exclusivamente dentro de la programación orientada a objetos para indicarle explícitamente al compilador que un método, getter o setter está redefiniendo un miembro heredado de una clase superior (clase base o interfaz).

#### Propósito

* **Seguridad:** Si el nombre del método en la clase base cambia o se escribe mal en la clase derivada, el compilador generará un error de inmediato.
* **Legibilidad:** Facilita a otros desarrolladores identificar rápidamente qué métodos forman parte de la especialización de la subclase.

```dart
class Vehiculo {
  void encender() {
    print('Vehículo encendido.');
  }
}

class Auto extends Vehiculo {
  // El metadato confirma que este método existe en la clase padre
  @override
  void encender() {
    print('Auto encendido. Motor regulando.');
  }
}

```

Si en la clase `Auto` se intentara anotar con `@override` un método llamado `encenderMotores()`, el analizador de Dart mostrará un error estático indicando que `encenderMotores` no existe en la clase `Vehiculo`.

### 2. `@deprecated` y `@Deprecated`

Estas anotaciones sirven para marcar funciones, clases, campos o métodos que ya no se consideran óptimos o que desaparecerán en futuras versiones del software.

Existen dos variantes:

* **`@deprecated`:** Una instancia constante predefinida. Se usa de forma directa cuando no se requiere dar explicaciones detalladas.
* **`@Deprecated('mensaje')`:** Un constructor constante que permite pasar un string con un mensaje personalizado, ideal para sugerir la nueva alternativa.

#### Ejemplo de uso

```dart
class ConectorApi {
  // Opción con mensaje personalizado (Recomendada)
  @Deprecated('Usa conectarConSeguridad() en su lugar. Este método se eliminará en la v3.0')
  void conectarInseguro() {
    print('Conexión antigua e insegura.');
  }

  void conectarConSeguridad() {
    print('Conexión segura establecida.');
  }
  
  // Opción simplificada
  @deprecated
  void parsearDatos() {
    print('Parseando...');
  }
}

void main() {
  var api = ConectorApi();
  
  // El IDE mostrará este método tachado y una advertencia en la consola
  api.conectarInseguro(); 
}

```

### 3. `@mustCallSuper`

Disponible a través del paquete `package:meta/meta.dart`, esta anotación exige que cualquier subclase que invalide (haga `@override`) este método, invoque obligatoriamente a `super.nombreDelMetodo()`.

Es crucial cuando la clase base realiza tareas de inicialización o limpieza críticas que la subclase no debe omitir.

```dart
import 'package:meta/meta.dart';

class Componente {
  @mustCallSuper
  void inicializar() {
    print('Espacio de memoria reservado para el componente.');
  }
}

class Boton extends Componente {
  @override
  void inicializar() {
    super.inicializar(); // Obligatorio debido a @mustCallSuper
    print('Configurando listeners del Botón.');
  }
}

```

Si se omite la línea `super.inicializar();`, el entorno de desarrollo marcará un error de análisis estático en la estructura de `Boton`.

### 4. `@protected`

También provista por `package:meta/meta.dart`, indica que un miembro (método o propiedad) solo debe ser accesible dentro de la clase donde se define o dentro de sus subclases directas o indirectas.

Dart no cuenta con una palabra clave nativa `protected` a nivel de lenguaje (solo tiene miembros públicos o privados por librería mediante el guion bajo `_`). Esta anotación suple de forma estática dicha necesidad.

```dart
import 'package:meta/meta.dart';

class BaseDeDatos {
  @protected
  void ejecutarQueryInterno(String query) {
    print('Ejecutando: $query');
  }
}

class BaseDatosUsuarios extends BaseDeDatos {
  void obtenerUsuarios() {
    // Permitido: se accede desde una subclase
    ejecutarQueryInterno('SELECT * FROM usuarios');
  }
}

void main() {
  var db = BaseDeDatos();
  // Advertencia del Analizador: El miembro 'ejecutarQueryInterno' solo puede usarse en subclases.
  db.ejecutarQueryInterno('DROP TABLE usuarios'); 
}

```

### Tabla de resumen de metadatos básicos

| Anotación | Origen | Ubicación común | Objetivo principal |
| --- | --- | --- | --- |
| **`@override`** | `dart:core` | Métodos / Getters / Setters | Validar que se está sobrescribiendo un miembro de la superclase. |
| **`@deprecated`** | `dart:core` | Cualquier declaración | Marcar código obsoleto de manera rápida. |
| **`@Deprecated()`** | `dart:core` | Cualquier declaración | Marcar código obsoleto añadiendo un mensaje explicativo de reemplazo. |
| **`@mustCallSuper`** | `package:meta` | Métodos de clase | Forzar a las subclases a invocar la lógica original con `super`. |
| **`@protected`** | `package:meta` | Métodos / Propiedades | Limitar visualmente el acceso de un miembro a la jerarquía de herencia. |

## 14.2 Anotaciones personalizadas

Más allá de las anotaciones predefinidas por el lenguaje y el equipo de Dart, el compilador permite a los desarrolladores crear sus propios metadatos. Las anotaciones personalizadas son herramientas fundamentales para asociar información semántica específica a nuestro código, la cual puede ser leída posteriormente mediante reflexión (en entornos que la soporten) o, de forma más común y eficiente, a través de herramientas de generación de código en tiempo de compilación.

En Dart, cualquier objeto cuyo constructor pueda ser evaluado como una constante en tiempo de compilación (`const`) califica de forma automática para ser utilizado como una anotación.

### Mecanismo de creación de una anotación

Para construir una anotación personalizada se deben seguir dos pasos principales:

1. **Definir una clase** que represente los datos que se desean asociar.
2. **Declarar un constructor `const`** para dicha clase, asegurando que todas sus propiedades sean inmutables (`final`).

```text
+-------------------------------------+
| Clase con Constructor 'const'       |
+-------------------------------------+
                   |
                   v (Se usa como...)
+-------------------------------------+
| @MiAnotacion(propiedad: 'valor')    |
+-------------------------------------+
                   |
                   v (Aplicado a...)
+-------------------------------------+
| Elemento de código (Clase, Método)  |
+-------------------------------------+

```

Existen dos enfoques comunes para estructurar anotaciones personalizadas según las necesidades del diseño: mediante una instancia constante única o mediante la invocación directa del constructor.

### Enfoque 1: Instancia constante única (Sin parámetros)

Si la anotación solo actúa como una "etiqueta" o bandera y no requiere configurar variables internas, se suele instanciar una constante global y usar su identificador como el metadato.

```dart
// 1. Definición de la estructura de la anotación
class Serializable {
  const Serializable(); // Constructor constante obligatorio
}

// 2. Creación de la instancia global para su uso resumido
const serializable = Serializable();

// 3. Aplicación de la anotación en el código fuente
@serializable
class Usuario {
  final String nombre;
  final String email;

  const Usuario(this.nombre, this.email);
}

```

> **Nota de estilo:** Por convención en la comunidad de Dart, cuando una anotación no requiere parámetros, se prefiere usar la instancia en minúscula (`@serializable`) en lugar de llamar al constructor (`@Serializable()`), logrando un código más limpio y legible.

### Enfoque 2: Anotaciones con parámetros

Cuando se necesita que el metadato transporte información dinámica (por ejemplo, rutas de red, configuraciones de bases de datos o niveles de acceso), se añaden campos a la clase y se invoca directamente al constructor prefijado por el símbolo `@`.

```dart
// Definición de la anotación con campos de configuración
class Ruta {
  final String path;
  final String metodo;

  const Ruta({required this.path, this.metodo = 'GET'});
}

// Aplicación de la anotación con argumentos en tiempo de compilación
class ControladorUsuarios {
  
  @Ruta(path: '/usuarios', metodo: 'GET')
  void listarUsuarios() {
    print('Retornando lista de usuarios...');
  }

  @Ruta(path: '/usuarios/crear', metodo: 'POST')
  void guardarUsuario() {
    print('Usuario guardado con éxito.');
  }
}

```

Es un requisito estricto que todos los argumentos pasados a la anotación (`path` y `metodo` en este caso) sean literales o expresiones constantes en tiempo de compilación. No es posible pasar variables cuyo valor se determine en tiempo de ejecución.

### Restricciones críticas en las anotaciones

Debido a que las anotaciones se evalúan antes de que el programa se ejecute, se deben respetar las siguientes reglas:

* **Inmutabilidad absoluta:** Todos los campos de la clase que define la anotación deben ser obligatoriamente `final`.
* **Prohibición de lógica dinámica:** No se pueden utilizar llamadas a funciones tradicionales, cálculos complejos en tiempo de ejecución o inicializaciones perezosas (`late`) dentro del constructor o como argumentos de la anotación.

```dart
class Tarea {
  final String descripcion;
  final DateTime fechaLimite;

  // ERROR: DateTime.now() no es una constante en tiempo de compilación
  const Tarea(this.descripcion) : fechaLimite = DateTime.now(); 
}

```

### ¿Cómo se procesan las anotaciones personalizadas?

Por sí solas, las anotaciones personalizadas no ejecutan ningún código ni alteran el flujo del programa. Si compilas un archivo con anotaciones personalizadas y lo ejecutas, estas serán completamente ignoradas por la máquina virtual de Dart. Su verdadero poder se activa bajo dos escenarios:

#### 1. Análisis estático y Linters personalizados

Herramientas de análisis de código pueden escanear el árbol de sintaxis abstracta (AST) de Dart para buscar estas etiquetas y verificar el cumplimiento de reglas arquitectónicas de un equipo de desarrollo.

#### 2. Generación de código (AOT / Compilación)

Este es el uso estándar en el ecosistema moderno de Dart (y frameworks como Flutter). Herramientas externas leen estas anotaciones para interceptar las clases y escribir archivos complementarios de manera automática (por ejemplo, archivos `.g.dart`).

```dart
// El desarrollador escribe esto:
@serializable
class Producto {
  final String id;
  const Producto(this.id);
}

// Un generador de código lee el metadato '@serializable' y genera en otro archivo:
// mixin _$ProductoSerializer { ... toJson() => { 'id': id }; }

```

Este proceso de automatización mediante herramientas que leen nuestras anotaciones y construyen la lógica pesada por nosotros se profundizará detalladamente en las secciones venideras de este capítulo.

## 14.3 Generación de código

La generación de código en Dart es una técnica avanzada que consiste en escribir programas (generadores) que leen, analizan y procesan el código fuente de una aplicación para escribir de forma automática nuevo código fuente en archivos complementarios.

A diferencia de otros lenguajes de programación que dependen de la **reflexión en tiempo de ejecución** (como el paquete `dart:mirrors`, el cual está desaconsejado en el desarrollo moderno de Dart y deshabilitado en Flutter por razones de rendimiento y tamaño del binario), Dart apuesta por la **metaprogramación en tiempo de compilación**. Toda la lógica compleja se resuelve antes de que la aplicación se ejecute.

```text
+-------------------+
|   Código Fuente   | <----+ (Hereda / Extiende)
|   (.dart manual)  |      |
+-------------------+      |
          |                |
          v (Escaneo)      |
+-------------------+      |
|    Generador      |      |
|    de Código      |      |
+-------------------+      |
          |                |
          v (Escritura)    |
+-------------------+      |
|   Código Generado | -----+
|    (.g.dart)      |
+-------------------+

```

### ¿Por qué es necesaria la generación de código?

A medida que una aplicación crece, los desarrolladores se enfrentan a la escritura de código repetitivo y propenso a errores, comúnmente denominado *boilerplate*. La generación de código automatiza de forma segura estas tareas en escenarios críticos:

* **Serialización de datos:** Conversión de objetos de negocio a formatos como JSON o XML, y viceversa.
* **Inyección de dependencias:** Configuración y acoplamiento de servicios del sistema de manera tipada y estática.
* **Mapeo de bases de datos:** Sincronización de clases orientadas a objetos con tablas o esquemas de persistencia local (ORMs).
* **Inmutabilidad y copia:** Creación automática de métodos como `copyWith` o comparaciones de igualdad campo por campo (`==`).

### El concepto de archivos de correspondencia (`part` y `part of`)

Para que el código generado se integre limpiamente con el código escrito a mano sin romper las reglas de encapsulamiento (permitiendo el acceso a miembros privados `_`), Dart utiliza el sistema de **partes**.

Mediante las palabras clave `part` y `part of`, un archivo de código puede dividirse lógicamente en varios archivos físicos, compartiendo exactamente el mismo alcance de variables, importaciones y tipado.

#### Estructura del archivo manual (`usuario.dart`)

El desarrollador define la estructura base e indica cuál será el nombre del archivo generado adjunto, que por convención añade la extensión `.g.dart`.

```dart
import 'package:meta/meta.dart';

// Vinculación obligatoria: indica que este archivo se completa con el generado
part 'usuario.g.dart';

class Usuario {
  final String id;
  final String nombre;

  const Usuario({required this.id, required this.nombre});

  // El método de fábrica apunta a una función que aún no existe, 
  // pero que será creada automáticamente en la "part" correspondiente.
  factory Usuario.fromJson(Map<String, dynamic> json) => _$UsuarioFromJson(json);

  Map<String, dynamic> toJson() => _$UsuarioToJson(this);
}

```

#### Estructura del archivo generado automáticamente (`usuario.g.dart`)

Este archivo no debe ser editado por el desarrollador. Es creado íntegramente por las herramientas de automatización.

```dart
// ignore_for_file: unnecessary_lambdas, prefer_expression_function_bodies

// Indica a qué librería o archivo principal pertenece esta sección
part of 'usuario.dart';

Usuario _$UsuarioFromJson(Map<String, dynamic> json) {
  return Usuario(
    id: json['id'] as String,
    nombre: json['nombre'] as String,
  );
}

Map<String, dynamic> _$UsuarioToJson(Usuario instance) => <String, dynamic>{
      'id': instance.id,
      'nombre': instance.nombre,
    };

```

### Ventajas y Desventajas del enfoque AOT de Dart

Adoptar la generación de código en tiempo de compilación (Ahead-Of-Time) en lugar de la resolución dinámica en tiempo de ejecución (Run-Time) presenta un balance de beneficios y compromisos de ingeniería:

#### Ventajas

1. **Rendimiento óptimo:** La aplicación no pierde ciclos de reloj analizando clases en el dispositivo del usuario; el código ya está optimizado y listo para correr.
2. **Seguridad de tipos:** Errores en la estructura de los datos se detectan durante la fase de compilación, previniendo fallos catastróficos en producción.
3. **Reducción del tamaño del binario:** Permite al compilador realizar *Tree Shaking* (eliminación de código muerto), descartando las funciones o algoritmos generados que finalmente no se manden a llamar en el proyecto.

#### Desventajas

1. **Fase de desarrollo más lenta:** Cada vez que se modifica una propiedad o una anotación personalizada, se requiere ejecutar las herramientas de construcción para regenerar los archivos.
2. **Curva de aprendizaje inicial:** Diseñar herramientas que analicen el árbol de sintaxis abstracta de Dart para escribir código nuevo requiere comprender las APIs internas del compilador.
3. **Contaminación del repositorio:** Incrementa la cantidad de archivos físicos dentro del directorio del proyecto, requiriendo configuraciones específicas para ocultarlos en el IDE o gestionarlos en los sistemas de control de versiones (Git).

Para orquestar este flujo de escaneo y escritura de archivos de forma estandarizada, el ecosistema de Dart provee una infraestructura oficial basada en herramientas de automatización, las cuales se analizan a nivel práctico en la siguiente sección.

## 14.4 Paquete build_runner

El paquete `build_runner` es la herramienta estándar y oficial del ecosistema de Dart utilizada para ejecutar generadores de código. Actúa como el motor que orquesta todo el flujo de trabajo: se encarga de escanear los archivos del proyecto, detectar cuáles contienen las anotaciones personalizadas, pasar esa información a los paquetes encargados de la generación (como `json_serializable`, `freezed` o `riverpod_generator`) y, finalmente, escribir los archivos `.g.dart` resultantes.

En lugar de que cada generador implemente su propio sistema para leer y escribir archivos, todos se acoplan a `build_runner` para garantizar que el proceso sea eficiente, ordenado y seguro.

### Configuración del archivo `pubspec.yaml`

Dado que la generación de código solo es necesaria durante la etapa de desarrollo y no debe incluirse en la aplicación final que se distribuye al usuario, `build_runner` y los generadores asociados se declaran estrictamente bajo la sección `dev_dependencies`.

A continuación se muestra un ejemplo típico de configuración para un proyecto que automatiza la serialización JSON:

```yaml
name: mi_proyecto_metaprogramacion
description: Ejemplo de configuración de generación de código.
version: 1.0.0

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  # Contiene las anotaciones como @JsonSerializable
  json_annotation: ^4.8.1 

dev_dependencies:
  # El motor de ejecución de tareas
  build_runner: ^2.4.8 
  # El generador específico que leerá las anotaciones
  json_serializable: ^6.7.1 

```

### Comandos esenciales de ejecución

Una vez configuradas las dependencias, la interacción con `build_runner` se realiza exclusivamente a través de la terminal de comandos utilizando la herramienta de línea de comandos de Dart (`dart run`). Existen dos comandos fundamentales para el flujo de trabajo diario:

#### 1. Construcción única (`build`)

Genera el código analizando el estado actual del proyecto en ese preciso instante. Una vez que termina de crear los archivos, el proceso finaliza.

```bash
dart run build_runner build

```

#### 2. Modo de escucha activa (`watch`)

Inicia un proceso persistente en la terminal que monitorea en tiempo real los archivos del proyecto. Cada vez que guardas un cambio en un archivo `.dart` (como añadir una nueva propiedad o modificar una anotación), `build_runner` detecta el cambio y regenera de forma instantánea el archivo complementario. Es el comando más recomendado durante la etapa de desarrollo activo.

```bash
dart run build_runner watch

```

#### Manejo de conflictos de archivos (`--delete-conflicting-outputs`)

En ocasiones, si modificas manualmente un archivo generado por error o cambias de rama en Git, `build_runner` puede detenerse al encontrar un conflicto entre el archivo viejo y el nuevo que intenta escribir. Para solucionar esto y forzar la sobreescritura limpia, se añade la bandera de limpieza:

```bash
dart run build_runner build --delete-conflicting-outputs

```

### Personalización mediante el archivo `build.yaml`

El comportamiento de `build_runner` se puede personalizar de forma granular creando un archivo opcional en la raíz del proyecto llamado `build.yaml`. Este archivo permite, entre otras cosas, cambiar la ruta de salida de los archivos, aplicar filtros para que solo se analicen ciertas carpetas, o configurar opciones específicas de un generador.

```yaml
targets:
  $default:
    builders:
      # Configuración específica para el generador de JSON
      json_serializable:
        options:
          # Fuerza a que todos los mapas de JSON usen CamelCase automáticamente
          field_rename: snake
          # Evita generar funciones explícitas si no son estrictamente necesarias
          create_to_json: true
    paths:
      - lib/** # Limita el escaneo únicamente a la carpeta de código fuente

```

## Resumen del capítulo

En este **Capítulo 14: Metaprogramación y Anotaciones**, hemos explorado cómo Dart traslada la resolución de problemas lógicos complejos desde el tiempo de ejecución (fase crítica para el usuario) hacia el tiempo de compilación mediante herramientas automatizadas.

Comenzamos analizando los **metadatos básicos** del lenguaje (como `@override`, `@deprecated`, `@protected` y `@mustCallSuper`), que sirven de guía para que el analizador estático nos proteja de cometer errores de diseño en nuestro código. Aprendimos que podemos extender este comportamiento diseñando **anotaciones personalizadas** utilizando constructores marcados con la palabra clave `const`.

Posteriormente, descubrimos el ecosistema de la **generación de código**, un paradigma que elimina el código repetitivo (*boilerplate*) mediante el uso de archivos de correspondencia estructurados bajo las directivas `part` y `part of`. Finalmente, estudiamos el funcionamiento práctico de **`build_runner`** como la herramienta angular que orquesta, automatiza y optimiza todo este flujo de compilación avanzada, garantizando aplicaciones seguras, modulares y con un rendimiento de ejecución impecable.
