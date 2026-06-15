Bienvenido al núcleo de la Programación Orientada a Objetos (POO) en Dart. En este capítulo, aprenderás a transformar conceptos del mundo real en código estructurado, eficiente y reutilizable.

Exploraremos cómo diseñar planos maestros mediante **clases** y cómo darles vida creando **objetos** independientes. Descubrirás la potencia de los **constructores** para inicializar datos, cómo definir el estado y comportamiento de tus entidades con **propiedades y métodos**, y cómo proteger la integridad de tu software aplicando el encapsulamiento a través de **getters y setters**. Este conocimiento es el pilar fundamental para dominar el desarrollo moderno con Dart.

## 5.1 Conceptos básicos de POO

La Programación Orientada a Objetos (POO) es un paradigma de programación que utiliza bloques de construcción fundamentales llamados **objetos** para estructurar el software. A diferencia de la programación secuencial o procedimental, que organiza el código alrededor de funciones y lógica pura, la POO se centra en los datos y en cómo modelar entidades del mundo real o conceptos abstractos dentro del código.

Dart es un lenguaje puramente orientado a objetos. Esto significa que todo valor en Dart es un objeto, incluyendo números, funciones y el valor `null`. Cada objeto es una instancia de una clase.

### Los cuatro pilares de la POO

Para comprender cómo funciona la programación orientada a objetos, es fundamental conocer sus cuatro principios teóricos. Aunque se profundizará en ellos en secciones posteriores, aquí se presenta su definición conceptual:

1. **Abstracción:** Consiste en aislar los elementos esenciales de un objeto, ocultando los detalles complejos de su implementación. Permite enfocarse en *qué* hace el objeto en lugar de *cómo* lo hace.
2. **Encapsulamiento:** Es la acción de reunir datos y comportamientos en una sola entidad (la clase) y restringir el acceso directo a sus componentes internos para evitar modificaciones accidentales o no autorizadas.
3. **Herencia:** Es un mecanismo que permite a una nueva clase adoptar las características (atributos y métodos) de una clase existente, promoviendo la reutilización de código.
4. **Polimorfismo:** Es la capacidad que tienen diferentes objetos de responder de forma única a un mismo mensaje o llamada de método.

```text
+-----------------------------------------------------------------+
|                        PILARES DE LA POO                        |
+----------------------------------+------------------------------+
| ABSTRACCIÓN                      | ENCAPSULAMIENTO              |
| Oculta detalles complejos;       | Protege los datos internos;  |
| expone solo lo necesario.        | restringe el acceso directo. |
+----------------------------------+------------------------------+
| HERENCIA                         | POLIMORFISMO                 |
| Reutiliza código creando nuevas  | Un mismo método se ejecuta   |
| clases a partir de existentes.   | de formas diferentes.        |
+----------------------------------+------------------------------+

```

### ¿Qué es una Clase y qué es un Objeto?

La distinción entre clase y objeto es el concepto central de la POO. A menudo se utiliza la analogía de un plano de construcción:

* **La Clase:** Es el molde, plano o plantilla. Define la estructura, las variables que almacenarán datos (llamadas **atributos** o **propiedades**) y las funciones que determinan su comportamiento (llamadas **métodos**). La clase no ocupa espacio en memoria como un dato real; es solo una definición.
* **El Objeto:** Es la entidad física o lógica creada a partir de la clase. Se dice que un objeto es una **instancia** de una clase. Cada objeto tiene su propio estado (los valores específicos de sus atributos) y puede ejecutar las acciones definidas en su molde.

```text
       [ CLASE (Molde / Plano) ]
       - Atributos: marca, color, velocidad
       - Métodos: arrancar(), frenar()
                  │
                  ▼ Instanciación
   ┌──────────────┼──────────────┐
   │              │              │
   ▼              ▼              ▼
[ Objeto 1 ]   [ Objeto 2 ]   [ Objeto 3 ]
Marca: Toyota  Marca: Ford    Marca: Honda
Color: Rojo    Color: Azul    Color: Negro

```

### Declaración de una clase y creación de objetos en Dart

En Dart, una clase se define utilizando la palabra clave `class` seguida del nombre de la clase, el cual por convención debe escribirse en formato *PascalCase* (comenzando con mayúscula).

A continuación, se presenta un ejemplo básico de cómo estructurar una clase que modela un vehículo, cómo instanciar objetos a partir de ella y cómo interactuar con sus miembros:

```dart
// Definición de la clase
class Auto {
  // Atributos o propiedades de la clase
  String marca = '';
  String modelo = '';
  int anio = 0;
  bool encendido = false;

  // Métodos de la clase
  void encender() {
    encendido = true;
    print('El $marca $modelo se ha encendido.');
  }

  void mostrarInformacion() {
    print('Vehículo: $marca $modelo | Año: $anio | Estado: ${encendido ? "Encendido" : "Apagado"}');
  }
}

void main() {
  // Creación (instanciación) de un objeto de la clase Auto
  // En Dart moderno, no es necesario usar la palabra clave 'new'
  Auto miAuto = Auto();

  // Asignación de valores a los atributos del objeto usando el operador punto (.)
  miAuto.marca = 'Toyota';
  miAuto.modelo = 'Corolla';
  miAuto.anio = 2024;

  // Invocación de los métodos del objeto
  miAuto.mostrarInformacion(); 
  miAuto.encender();
  miAuto.mostrarInformacion();

  // Creación de una segunda instancia independiente
  Auto autoDeUnAmigo = Auto();
  autoDeUnAmigo.marca = 'Ford';
  autoDeUnAmigo.modelo = 'Mustang';
  autoDeUnAmigo.anio = 2022;

  // Cada objeto mantiene su propio estado interno
  autoDeUnAmigo.mostrarInformacion();
}

```

Al ejecutar este código, el resultado en la consola será el siguiente:

```text
Vehículo: Toyota Corolla | Año: 2024 | Estado: Apagado
El Toyota Corolla se ha encendido.
Vehículo: Toyota Corolla | Año: 2024 | Estado: Encendido
Vehículo: Ford Mustang | Año: 2022 | Estado: Apagado

```

### Características clave del diseño en Dart

* **Valores por defecto:** En el ejemplo anterior, las propiedades se inicializaron directamente con valores por defecto (`''`, `0`, `false`) para cumplir con las reglas de *Null Safety* de Dart, evitando que los atributos queden con un valor nulo no deseado.
* **Acceso mediante el operador punto:** El operador `.` es la vía para interactuar con el objeto, permitiendo tanto la lectura y escritura de sus variables internas como la ejecución de sus bloques de código asociados (métodos).

## 5.2 Constructores y sus tipos

Un **constructor** es un método especial cuya función principal es inicializar los objetos de una clase. Se ejecuta automáticamente en el momento en que se crea una instancia (usando los paréntesis después del nombre de la clase).

A diferencia de otros lenguajes de programación donde los constructores pueden volverse repetitivos y verbosos, Dart ofrece una sintaxis muy limpia y diversas variantes de constructores para adaptarse a diferentes necesidades de inicialización.

### El constructor por defecto

Si no declaras ningún constructor en tu clase, Dart genera automáticamente un **constructor por defecto**. Este constructor no recibe argumentos y se limita a crear la instancia con los valores iniciales que hayas definido en las propiedades.

Sin embargo, en el momento en que defines manualmente cualquier constructor, el constructor por defecto desaparece.

### Constructor generativo (con azúcar sintáctico)

El constructor generativo es el más común. Lleva el mismo nombre que la clase y se encarga de asignar los argumentos recibidos a las propiedades del objeto.

Dart introduce un "azúcar sintáctico" (*syntactic sugar*) utilizando la palabra clave `this` directamente en los parámetros. Esto permite asignar los valores a las propiedades omitiendo por completo el cuerpo del constructor.

```dart
class Usuario {
  String nombre;
  String correo;
  int edad;

  // Constructor generativo compacto
  Usuario(this.nombre, this.correo, this.edad);

  void presentarse() {
    print('Hola, soy $nombre ($correo) y tengo $edad años.');
  }
}

void main() {
  // Los argumentos se pasan en el orden posicional definido
  Usuario usuario1 = Usuario('Carlos', 'carlos@mail.com', 28);
  usuario1.presentarse();
}

```

### Constructores con parámetros nombrados

Para mejorar la legibilidad del código al instanciar objetos con muchos atributos, Dart permite utilizar **parámetros nombrados** (encerrados entre llaves `{}`). Al igual que en las funciones comunes, se puede usar la palabra clave `required` para exigir un dato, o bien proporcionar un valor por defecto.

```dart
class Producto {
  String nombre;
  double precio;
  int stock;

  // Constructor con parámetros nombrados
  Producto({
    required this.nombre,
    required this.precio,
    this.stock = 0, // Valor por defecto si no se envía
  });

  void mostrar() {
    print('Producto: $nombre | Precio: \$$precio | Stock: $stock');
  }
}

void main() {
  // El orden de los factores no altera el resultado y el código es más claro
  Producto laptop = Producto(
    precio: 850.00,
    nombre: 'Laptop Pro',
    stock: 15,
  );
  
  laptop.mostrar();
}

```

### Constructores nombrados (Named Constructors)

Dart no permite la sobrecarga de métodos ni de constructores (es decir, no puedes tener dos constructores con el mismo nombre y diferentes parámetros). Para resolver esto, Dart utiliza **constructores nombrados**. Estos permiten definir múltiples formas de inicializar una clase bajo nombres claros y específicos.

La sintaxis utiliza el formato `Clase.nombreConstructor`.

```dart
class Coordenada {
  double x;
  double y;

  // Constructor principal
  Coordenada(this.x, this.y);

  // Constructor nombrado para el origen (0,0)
  Coordenada.enElOrigen()
      : x = 0,
        y = 0;

  // Constructor nombrado a partir de un mapa (JSON)
  Coordenada.desdeMapa(Map<String, double> mapa)
      : x = mapa['x'] ?? 0.0,
        y = mapa['y'] ?? 0.0;

  void imprimir() => print('Posición: ($x, $y)');
}

void main() {
  Coordenada puntoA = Coordenada(5.3, 10.2);
  Coordenada puntoB = Coordenada.enElOrigen();
  Coordenada puntoC = Coordenada.desdeMapa({'x': 1.5, 'y': 8.9});

  puntoA.imprimir(); // Posición: (5.3, 10.2)
  puntoB.imprimir(); // Posición: (0.0, 0.0)
  puntoC.imprimir(); // Posición: (1.5, 8.9)
}

```

> **Nota sobre la lista de inicialización:** En los constructores nombrados `enElOrigen` y `desdeMapa` del ejemplo anterior, se utilizó la **lista de inicialización** (el fragmento de código después de los dos puntos `:`). Esta lista sirve para evaluar y asignar valores a las propiedades *antes* de que el cuerpo del constructor se ejecute, lo cual es obligatorio para cumplir con las restricciones de variables no nulas (*Null Safety*).

### Constructores constantes

Si tu clase produce objetos que nunca van a cambiar (inmutables), puedes definirlos mediante un **constructor constante**. Para lograrlo, todas las propiedades de la clase deben ser obligatoriamente de tipo `final`.

La gran ventaja de los constructores constantes es el rendimiento: Dart reutiliza la misma instancia en memoria si se crean dos o más objetos idénticos marcados con la palabra clave `const`.

```dart
class Configuracion {
  final String urlServidor;
  final int puerto;

  // El constructor debe llevar la palabra clave 'const'
  const Configuracion(this.urlServidor, this.puerto);
}

void main() {
  // Se usa 'const' al momento de crear la instancia
  var config1 = const Configuracion('https://api.com', 443);
  var config2 = const Configuracion('https://api.com', 443);

  // Al ser constantes e idénticas, apuntan exactamente al mismo espacio de memoria
  print(identical(config1, config2)); // Resultado: true
}

```

### Constructores de fábrica (Factory Constructors)

La palabra clave `factory` se utiliza cuando se necesita tener un control total sobre el proceso de creación de la instancia. A diferencia de un constructor común, un constructor `factory`:

* No crea obligatoriamente una nueva instancia de la clase.
* Puede retornar una instancia que ya existía previamente en memoria (como en el patrón *Singleton*).
* Puede retornar una instancia de una subclase (hija) en lugar de la clase padre.

```dart
class ConexionBD {
  final String nombre;
  static final Map<String, ConexionBD> _cache = {};

  // Constructor interno privado
  ConexionBD._interno(this.nombre);

  // Constructor factory que gestiona la memoria
  factory ConexionBD(String nombre) {
    if (_cache.containsKey(nombre)) {
      print('Retornando conexión existente: $nombre');
      return _cache[nombre]!;
    } else {
      print('Creando nueva conexión: $nombre');
      final nuevaConexion = ConexionBD._interno(nombre);
      _cache[nombre] = nuevaConexion;
      return nuevaConexion;
    }
  }
}

void main() {
  // Aunque llamamos al constructor dos veces, el factory intercepta la creación
  ConexionBD con1 = ConexionBD('Produccion');
  ConexionBD con2 = ConexionBD('Produccion');

  print(identical(con1, con2)); // Resultado: true
}

```

## 5.3 Propiedades y métodos

Las clases en Dart actúan como contenedores lógicos que agrupan tanto datos como comportamientos. A nivel técnico, estos elementos se conocen como **miembros de una clase**: los datos se definen mediante **propiedades** (también llamadas variables de instancia o atributos), mientras que los comportamientos se implementan a través de **métodos** (funciones integradas dentro de la clase).

### Propiedades (Variables de instancia)

Las propiedades definen las características o el estado de un objeto. En Dart, cualquier variable declarada dentro de una clase, pero fuera de un método, se convierte en una propiedad de dicha clase.

#### Propiedades mutables e inmutables

Dependiendo de cómo se declaren, las propiedades pueden permitir cambios a lo largo del ciclo de vida del objeto o permanecer fijas desde su creación:

* **Mutables (`var`, tipos explícitos):** Pueden modificar su valor en cualquier momento.
* **Inmutables (`final`):** Solo pueden recibir un valor una vez (ya sea en su declaración o mediante el constructor). Después de eso, su valor no puede ser alterado.

```dart
class CuentaBancaria {
  final String numeroCuenta; // Inmutable: no cambia una vez asignada
  double saldo = 0.0;        // Mutable: cambiará con depósitos y retiros

  CuentaBancaria(this.numeroCuenta, this.saldo);
}

```

#### Variables de instancia vs. Variables de clase (`static`)

Por defecto, cada objeto creado tiene sus propias copias independientes de las propiedades. Sin embargo, si anteponemos la palabra clave `static`, la propiedad pasa a pertenecer a la clase en sí y no a los objetos individuales. Todos los objetos comparten esa única variable.

```dart
class Contador {
  int conteoIndividual = 0; // Cada objeto tiene su propio conteo
  static int conteoGlobal = 0; // Compartido por todas las instancias

  void incrementar() {
    conteoIndividual++;
    conteoGlobal++;
  }
}

```

### Métodos (Funciones de instancia)

Los métodos son funciones que determinan las acciones que un objeto puede realizar. Tienen acceso directo a todas las propiedades de la clase (incluso si son privadas, como veremos más adelante) a través de la referencia implícita `this`.

#### Métodos de instancia

Son los métodos convencionales. Requieren que el objeto sea instanciado previamente para poder ser ejecutados.

```dart
class Calculadora {
  double resultado Anterior = 0.0;

  // Método de instancia con retorno
  double sumar(double a, double b) {
    double total = a + b;
    resultadoAnterior = total; // Modifica una propiedad de la instancia
    return total;
  }

  // Método de instancia sin retorno (void)
  void limpiar() {
    resultadoAnterior = 0.0;
  }
}

```

#### Métodos de clase (`static`)

Al igual que las propiedades estáticas, un método `static` se invoca directamente desde la clase, sin necesidad de crear un objeto.

> **Regla de oro:** Los métodos estáticos **no** pueden acceder a propiedades o métodos de instancia no estáticos, ya que no operan sobre un objeto en particular.

```dart
class Convertidor {
  // Método estático utilitario
  static double celsiusAFahrenheit(double celsius) {
    return (celsius * 9 / 5) + 32;
  }
}

void main() {
  // Se llama usando el nombre de la clase, no de un objeto
  double f = Convertidor.celsiusAFahrenheit(25);
  print('$f °F'); // 77.0 °F
}

```

### Visibilidad: El concepto de miembros privados

A diferencia de lenguajes como Java o C# que usan palabras clave como `public` o `private`, Dart gestiona la visibilidad a **nivel de biblioteca (archivo)** utilizando el guion bajo (`_`).

Si el nombre de una propiedad o un método comienza con un guion bajo, se vuelve estrictamente privado para ese archivo `.dart`. Ningún otro archivo externo podrá verlos ni modificarlos directamente. Esto es fundamental para garantizar el encapsulamiento de datos.

```dart
// Archivo: usuario.dart
class Usuario {
  String nombre;        // Pública: accesible desde cualquier lugar
  String _contrasena;   // Privada: solo accesible dentro de este archivo

  Usuario(this.nombre, this._contrasena);

  // Método público
  bool verificarContrasena(String intento) {
    return _validar(intento); // Llama al método privado internamente
  }

  // Método privado
  bool _validar(String texto) {
    return _contrasena == texto;
  }
}

```

Si intentas importar el archivo anterior en otro punto de tu aplicación, el siguiente comportamiento tendrá lugar:

```dart
// Archivo: main.dart
import 'usuario.dart';

void main() {
  Usuario user = Usuario('Ana', 'secret123');

  print(user.nombre); // Correcto: Imprime 'Ana'
  
  // error: El campo '_contrasena' no está definido para la clase 'Usuario'.
  // print(user._contrasena); 

  // Correcto: Se interactúa mediante su interfaz pública
  print(user.verificarContrasena('1234')); // Imprime false
}

```

### Operador de cascada (`..` y `?..`)

Dart ofrece un operador especial muy útil cuando se trabaja con propiedades y métodos: la cascada. Permite encadenar una secuencia de operaciones (asignaciones de propiedades o llamadas a métodos) sobre un mismo objeto, evitando tener que repetir el nombre de la variable en cada línea.

```dart
class Personaje {
  String nombre = '';
  int nivel = 1;
  int puntosVida = 100;

  void subirNivel() {
    nivel++;
    puntosVida += 20;
  }
}

void main() {
  // Sintaxis tradicional
  Personaje heroe1 = Personaje();
  heroe1.nombre = 'Aragorn';
  heroe1.subirNivel();

  // Sintaxis optimizada con el operador de cascada (..)
  Personaje heroe2 = Personaje()
    ..nombre = 'Legolas'
    ..subirNivel()
    ..puntosVida = 150; // Al final se cierra con punto y coma
}

```

## 5.4 Getters y Setters

Los **getters** y **setters** son métodos especiales que permiten interceptar el acceso a la lectura y escritura de las propiedades de un objeto. Proporcionan una forma limpia de implementar el pilar del **encapsulamiento**, permitiendo añadir validaciones, transformar datos sobre la marcha o crear propiedades virtuales sin cambiar la forma en que el mundo exterior interactúa con la clase.

En Dart, la gran ventaja es que no es necesario escribir métodos verbosos como `getPropiedad()` o `setPropiedad(valor)` al estilo de Java. Dart define palabras clave nativas (`get` y `set`) que exponen una sintaxis idéntica a la de una propiedad común.

### Sintaxis básica

Para definir un getter o un setter se utilizan las palabras clave `get` y `set` respectivamente:

* **Getter:** No recibe parámetros y debe retornar un valor.
* **Setter:** Recibe exactamente un parámetro (el nuevo valor a asignar) y no retorna nada (`void` implícito).

```dart
class Cuenta {
  // Propiedad privada para proteger el dinero de manipulaciones directas
  double _saldo = 0.0;

  // Getter: Permite leer el saldo de forma controlada
  double get saldo => _saldo;

  // Setter: Permite modificar el saldo aplicando reglas de negocio
  set saldo(double nuevoSaldo) {
    if (nuevoSaldo >= 0) {
      _saldo = nuevoSaldo;
    } else {
      print('¡Error! El saldo no puede ser negativo.');
    }
  }
}

void main() {
  Cuenta miCuenta = Cuenta();

  // El uso de los getters y setters se hace mediante asignación estándar
  miCuenta.saldo = 500.0; // Invoca el setter automáticamente
  print('Saldo actual: ${miCuenta.saldo}'); // Invoca el getter

  miCuenta.saldo = -100.0; // Imprime el error y no altera el saldo interno
  print('Saldo final: ${miCuenta.saldo}');  // Sigue siendo 500.0
}

```

### Propiedades calculadas (Read-only)

Un caso de uso sumamente común para los getters es la creación de **propiedades calculadas**. Estas son propiedades dinámicas que no ocupan un espacio físico en la memoria del objeto, sino que se calculan en tiempo real cada vez que alguien solicita su lectura.

```dart
class Rectangulo {
  double ancho;
  double alto;

  Rectangulo(this.ancho, this.alto);

  // Propiedad calculada: solo lectura, no requiere almacenar el área en una variable
  double get area => ancho * alto;

  // Otro ejemplo de propiedad calculada textual
  String get descripcion => 'Rectángulo de ${ancho}x${alto}';
}

void main() {
  Rectangulo fig = Rectangulo(5.0, 4.0);
  
  print(fig.descripcion); // Rectángulo de 5.0x4.0
  print('Área: ${fig.area}'); // Área: 20.0

  // Si cambiamos los lados, la propiedad calculada se actualiza en su próxima lectura
  fig.alto = 10.0;
  print('Nueva área: ${fig.area}'); // Nueva área: 50.0
}

```

### ¿Cuándo usar Getters y Setters?

Una regla de diseño fundamental en Dart es: **no envuelvas propiedades públicas en getters y setters si no hacen nada más**. Si una propiedad simplemente se lee y se escribe sin modificaciones ni validaciones, déjala como una propiedad normal.

Deberías implementar getters y setters cuando necesites:

1. **Validar datos:** Asegurarte de que los valores asignados a un objeto sean correctos (por ejemplo, que una edad no sea negativa o que un correo tenga un formato válido).
2. **Abstracción de almacenamiento:** Modificar cómo se guardan internamente los datos sin romper el código de las personas que ya usan tu clase.
3. **Inmutabilidad controlada:** Exponer una propiedad como de "solo lectura" para el exterior mediante un getter, manteniendo su contraparte privada mutable dentro de la clase.

## Resumen del capítulo

En este capítulo hemos sentado las bases de la **Programación Orientada a Objetos (POO)** en Dart, comprendiendo que el lenguaje trata a cada estructura de datos como un objeto derivado de un molde maestro llamado clase.

* Aprendimos a modelar entidades mediante **clases**, definiendo su estado con **propiedades** y sus acciones mediante **métodos**.
* Exploramos los diferentes tipos de **constructores** que Dart ofrece para flexibilizar la creación de instancias, desde el constructor generativo compacto hasta los constructores nombrados, constantes y de fábrica (*factory*).
* Analizamos cómo el uso del guion bajo (`_`) restringe la visibilidad de los componentes para asegurar un correcto **encapsulamiento**.
* Finalmente, estudiamos los **getters y setters**, herramientas clave para interceptar flujos de lectura y escritura de datos, permitiendo añadir lógica de validación y generar propiedades dinámicas calculadas en tiempo real.
