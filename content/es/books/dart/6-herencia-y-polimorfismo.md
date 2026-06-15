La programación orientada a objetos alcanza su máxima flexibilidad cuando los componentes no solo encapsulan datos, sino que se relacionan y especializan entre sí. En este capítulo, descubrirás cómo diseñar jerarquías eficientes en Dart mediante el uso de clases base y derivadas. Aprenderás a reutilizar código de forma segura y a adaptar comportamientos genéricos a necesidades específicas mediante la sobrescritura de métodos. Finalmente, exploraremos el poder de la abstracción y el desacoplamiento de software a través del estudio de clases abstractas y el elegante manejo de interfaces implícitas que ofrece el lenguaje.

## 6.1 Clases base y derivadas

En el desarrollo de software, modelar entidades del mundo real o estructuras de datos abstractas a menudo revela jerarquías y relaciones de parentesco conceptual. La herencia es el mecanismo fundamental de la Programación Orientada a Objetos (POO) que permite a una nueva clase adquirir las propiedades y comportamientos de una clase existente.

En Dart, este concepto se materializa mediante el uso de **clases base** (también conocidas como superclases o clases padre) y **clases derivadas** (también llamadas subclases o clases hijas). La clase derivada hereda de forma automática los atributos y métodos públicos o protegidos de la clase base, lo que fomenta la reutilización de código y facilita el mantenimiento del software.

### Jerarquía de clases en Dart

A diferencia de otros lenguajes que permiten herencia múltiple (heredar de varias clases simultáneamente), Dart implementa un modelo de **herencia simple**. Esto significa que una clase derivada solo puede tener una única clase base directa.

El siguiente gráfico de texto plano ilustra cómo se estructura una jerarquía lineal y ramificada a partir de una clase base común:

```text
            [ Clase Base: Vehiculo ]
             /                    \
            /                      \
[ Clase Derivada: Coche ]      [ Clase Derivada: Moto ]

```

En este modelo, `Vehiculo` define las características comunes a cualquier medio de transporte, mientras que `Coche` y `Moto` especializan ese comportamiento añadiendo sus propias particularidades.

### La palabra clave `extends`

Para establecer una relación de herencia en Dart, se utiliza la palabra clave `extends` en la declaración de la clase derivada. La sintaxis básica es la siguiente:

```dart
class ClaseDerivada extends ClaseBase {
  // Atributos y métodos propios de la clase derivada
}

```

A continuación, se presenta un ejemplo práctico donde la clase `Empleado` actúa como clase base y la clase `Gerente` se define como una clase derivada.

```dart
// Clase Base
class Empleado {
  String nombre;
  double salario;

  Empleado(this.nombre, this.salario);

  void mostrarDatos() {
    print('Empleado: $nombre, Salario: \$$salario');
  }
}

// Clase Derivada
class Gerente extends Empleado {
  String departamento;

  // El constructor debe inicializar las propiedades de la clase base
  Gerente(String nombre, double salario, this.departamento) : super(nombre, salario);

  void organizarReunion() {
    print('$nombre está organizando una reunión para el departamento de $departamento.');
  }
}

void main() {
  // Instanciación de la clase derivada
  Gerente lider = Gerente('Ana Gómez', 4500.0, 'Tecnología');

  // Acceso a un método heredado de la clase base
  lider.mostrarDatos(); 

  // Acceso a un método propio de la clase derivada
  lider.organizarReunion(); 
}

```

### Funcionamiento de `super` y la inicialización de constructores

Cuando se crea una instancia de una clase derivada, es un requisito obligatorio que el constructor de la clase base se ejecute primero para asegurar que los atributos heredados queden correctamente inicializados en la memoria.

Si la clase base tiene un constructor por defecto sin argumentos, Dart lo invoca de forma automática al inicio de la construcción de la subclase. Sin embargo, si la clase base define un constructor con parámetros (como en el ejemplo anterior con `Empleado(this.nombre, this.salario)`), la clase derivada debe invocar explícitamente a ese constructor utilizando la palabra clave `super` en su **lista de inicializadores**.

La sintaxis `: super(argumentos)` redirige los valores recibidos por el constructor de la clase derivada hacia el constructor de la clase base antes de ejecutar el cuerpo del propio constructor de la subclase.

### Herencia de constructores nombrados

Los constructores nombrados de una clase base no se heredan automáticamente en las clases derivadas. Si se desea que una subclase disponga de un constructor nombrado equivalente al de su superclase, este debe ser definido explícitamente y redirigido mediante `super`.

```dart
class Dispositivo {
  String marca;

  // Constructor base estándar
  Dispositivo(this.marca);

  // Constructor nombrado en la clase base
  Dispositivo.generico() : marca = 'Genérica';
}

class Smartphone extends Dispositivo {
  String sistemaOperativo;

  // Redirección al constructor estándar de la clase base
  Smartphone(String marca, this.sistemaOperativo) : super(marca);

  // Redirección al constructor nombrado de la clase base
  Smartphone.conAnidacion(this.sistemaOperativo) : super.generico();
}

```

### La raíz de la jerarquía: `Object`

Es importante destacar que en Dart, todas las clases que no especifican una clase base mediante la palabra clave `extends` heredan implícitamente de la clase `Object`.

`Object` es la raíz de la jerarquía de tipos de Dart. Gracias a esto, cualquier clase definida en el lenguaje hereda métodos fundamentales como `toString()`, `noSuchMethod()` y el operador de igualdad `==`, garantizando un comportamiento mínimo común para absolutamente todos los objetos dentro del ecosistema del lenguaje.

## 6.2 Sobrescritura de métodos

La herencia permite que una clase derivada adquiera de forma automática todos los métodos de su clase base. Sin embargo, no siempre el comportamiento genérico de la clase base es el adecuado para la especialización de la subclase. La **sobrescritura de métodos** (o *method overriding*) es el mecanismo que permite a una clase derivada proporcionar una implementación específica de un método que ya ha sido definido en su clase base.

Este concepto es un pilar fundamental para el polimorfismo, ya que permite tratar a diferentes objetos de una jerarquía de manera uniforme mediante una misma interfaz o firma de método, garantizando que cada objeto responda con su propio comportamiento particular durante la ejecución del programa.

### La anotación `@override`

En Dart, cuando se redefine un método en una subclase, se debe preceder la declaración con la anotación `@override`. Aunque técnicamente el compilador de Dart puede realizar la sobrescritura sin ella si las firmas coinciden, su uso es una excelente práctica de programación por dos razones fundamentales:

1. **Validación en tiempo de compilación:** Le indica al compilador tu intención explícita de sobrescribir un método. Si cometes un error tipográfico en el nombre del método o modificas los parámetros por accidente, el compilador generará un error advirtiéndote que el método no existe en la clase base.
2. **Legibilidad del código:** Permite a otros desarrolladores identificar instantáneamente que el comportamiento del método ha sido modificado respecto a la superclase.

### Ejemplo práctico de sobrescritura

Imaginemos un sistema para calcular los sonidos que emiten diferentes animales. La clase base `Animal` define un método genérico `emitirSonido()`, pero cada subclase concreta (`Perro`, `Gato`) necesita adaptarlo a su propia naturaleza.

```dart
// Clase Base
class Animal {
  String nombre;

  Animal(this.nombre);

  void emitirSonido() {
    print('$nombre emite un sonido genérico.');
  }
}

// Clase Derivada: Perro
class Perro extends Animal {
  Perro(String nombre) : super(nombre);

  // Sobrescritura del método emitirSonido
  @override
  void emitirSonido() {
    print('$nombre ladra: ¡Guau, guau!');
  }
}

// Clase Derivada: Gato
class Gato extends Animal {
  Gato(String nombre) : super(nombre);

  // Sobrescritura del método emitirSonido
  @override
  void emitirSonido() {
    print('$nombre maúlla: ¡Miau, miau!');
  }
}

void main() {
  Animal animalGenerico = Animal('Criatura');
  Animal miPerro = Perro('Toby');
  Animal miGato = Gato('Félix');

  // Cada objeto ejecuta su propia versión del método
  animalGenerico.emitirSonido(); // Imprime: Criatura emite un sonido genérico.
  miPerro.emitirSonido();        // Imprime: Toby ladra: ¡Guau, guau!
  miGato.emitirSonido();         // Imprime: Félix maúlla: ¡Miau, miau!
}

```

### Reglas para la sobrescritura de métodos

Para que una sobrescritura sea válida ante el analizador de Dart, se deben cumplir estrictamente las siguientes condiciones de firma de métodos:

* **El tipo de retorno debe ser compatible:** El método sobrescrito debe devolver el mismo tipo de datos que el método de la clase base, o un subtipo de este (lo que se conoce como covarianza de retorno).
* **Los parámetros deben coincidir:** El número, tipo y orden de los parámetros posicionales o nombrados deben ser compatibles con el método original para evitar romper el principio de sustitución.

### Extensión de comportamiento mediante `super`

Sobrescribir un método no significa necesariamente destruir o ignorar por completo la lógica que ya existía en la clase base. En muchos escenarios, la subclase solo necesita agregar funcionalidad extra *antes* o *después* de que se ejecute el comportamiento original.

Para invocar el método original de la superclase desde el método sobrescrito en la clase derivada, se utiliza la palabra clave `super` seguida del operador de punto (`.`) y el nombre del método.

A continuación, se ilustra un ejemplo de un sistema de facturación electrónica donde una tasa impositiva especial se añade sobre un cálculo base:

```dart
class Factura {
  double subtotal;

  Factura(this.subtotal);

  double calcularTotal() {
    // Aplica un impuesto general estandarizado del 15%
    return subtotal * 1.15;
  }
}

class FacturaDeImportacion extends Factura {
  double arancelAduanero;

  FacturaDeImportacion(double subtotal, this.arancelAduanero) : super(subtotal);

  @override
  double calcularTotal() {
    // Reutiliza el cálculo base con impuestos usando 'super'
    double totalBase = super.calcularTotal();
    
    // Añade la lógica específica de la clase derivada
    return totalBase + arancelAduanero;
  }
}

```

### Sobrescritura de Getters y Setters

En Dart, las propiedades encapsuladas a través de getters y setters también actúan como métodos bajo el capó. Por lo tanto, se rigen por las mismas reglas de herencia y pueden ser sobrescritos de la misma forma utilizando la anotación `@override`.

```dart
class Rectangulo {
  double ancho;
  double alto;

  Rectangulo(this.ancho, this.alto);

  double get area => ancho * alto;
}

class Cuadrado extends Rectangulo {
  // Un cuadrado inicializa el ancho y el alto con el mismo valor de lado
  Cuadrado(double lado) : super(lado, lado);

  @override
  double get area {
    print('Calculando el área de un cuadrado perfecto...');
    return super.area;
  }
}

```

## 6.3 Clases abstractas

En el diseño de software orientado a objetos, a veces es necesario definir una clase que represente un concepto genérico, el cual no debería tener instancias directas. Por ejemplo, en un sistema gráfico, el concepto de una "Figura" es demasiado abstracto: puedes dibujar un círculo, un cuadrado o un triángulo, pero no puedes dibujar una "Figura" en abstracto sin conocer su forma.

Para resolver este problema, Dart introduce las **clases abstractas**. Una clase abstracta es una clase que no puede ser instanciada directamente (es decir, no puedes crear un objeto usando `new` o el constructor de dicha clase) y cuyo propósito principal es definir un contrato, una estructura o una base común para que otras clases derivadas la extiendan y completen.

### Sintaxis y la palabra clave `abstract`

Para declarar una clase abstracta en Dart, se antepone la palabra clave `abstract` a la definición de la clase:

```dart
abstract class Figura {
  // Atributos o métodos comunes
}

```

Si intentas compilar un bloque de código que intente hacer esto:

```dart
void main() {
  var miFigura = Figura(); // ERROR: Las clases abstractas no se pueden instanciar.
}

```

El analizador de Dart detendrá la ejecución informando que la clase es abstracta.

### Métodos abstractos

La característica más potente de las clases abstractas es la capacidad de definir **métodos abstractos**. Un método abstracto es aquel que declara su firma (nombre, parámetros y tipo de retorno) pero **no proporciona un cuerpo** (sin llaves `{ }`), terminando directamente con un punto y coma (`;`).

Cualquier clase concreta (no abstracta) que extienda de esta clase abstracta está obligada por el compilador a sobrescribir y proporcionar una implementación real para todos los métodos abstractos heredados.

A continuación, se muestra cómo se define esta relación jerárquica:

```text
            [ Clase Abstracta: Figura ] 
             (Define: calcularArea(); )
             /                        \
            /                          \
[ Clase Concreta: Circulo ]      [ Clase Concreta: Rectangulo ]
(Implementa: calcularArea)       (Implementa: calcularArea)

```

### Ejemplo práctico

En el siguiente ejemplo, creamos la estructura para el cálculo de áreas de distintas formas geométricas. La clase base asegura que todas las figuras compartan una propiedad de color y un método para calcular el área, obligando a las subclases a resolver la fórmula matemática específica de cada una.

```dart
// Clase Abstracta
abstract class Figura {
  String color;

  Figura(this.color);

  // Método no abstracto (con implementación compartida)
  void describir() {
    print('Soy una figura de color $color.');
  }

  // Método abstracto (sin cuerpo, define una obligación)
  double calcularArea();
}

// Clase Concreta: Cuadrado
class Cuadrado extends Figura {
  double lado;

  // Llama al constructor de la clase abstracta usando super
  Cuadrado(String color, this.lado) : super(color);

  // Implementación obligatoria del método abstracto
  @override
  double calcularArea() {
    return lado * lado;
  }
}

// Clase Concreta: Circulo
class Circulo extends Figura {
  double radio;

  Circulo(String color, this.radio) : super(color);

  // Implementación obligatoria del método abstracto
  @override
  double calcularArea() {
    // Usamos el valor aproximado de Pi
    return 3.14159 * radio * radio;
  }
}

void main() {
  // Aunque no podemos instanciar 'Figura', sí podemos usarla como TIPO
  Figura miCuadrado = Cuadrado('Rojo', 4.0);
  Figura miCirculo = Circulo('Azul', 3.0);

  miCuadrado.describir();
  print('Área del cuadrado: ${miCuadrado.calcularArea()}'); // Imprime: 16.0

  miCirculo.describir();
  print('Área del círculo: ${miCirculo.calcularArea()}');   // Imprime: 28.27431
}

```

### Características clave a recordar

* **Combinación de métodos:** Una clase abstracta no está limitada a tener solo métodos abstractos. Puede contener métodos con implementaciones completas (como `describir()` en el ejemplo anterior) y propiedades normales que las subclases heredarán de forma convencional.
* **Polimorfismo:** Declarar variables con el tipo de la clase abstracta (por ejemplo, `Figura miCuadrado`) permite escribir código desacoplado. Puedes crear una lista de tipo `List<Figura>` que contenga círculos, cuadrados y rectángulos, e iterar sobre ellos llamando a `calcularArea()` sin necesidad de saber el tipo exacto de figura en tiempo de desarrollo.
* **Constructores en clases abstractas:** Aunque no se pueden instanciar directamente, las clases abstractas pueden (y a menudo deben) tener constructores. Estos constructores son invocados por las clases derivadas mediante `super` para inicializar los atributos que pertenecen a la abstracción base.

## 6.4 Interfaces implícitas

En muchos lenguajes de programación orientados a objetos, como Java o C#, una interfaz es una estructura explícita que se declara con una palabra clave propia (como `interface`) y que sirve exclusivamente para definir un contrato de comportamiento sin implementar lógica.

Dart adopta un enfoque diferente y sumamente elegante: **no existe la palabra clave `interface`**. En su lugar, **toda clase define implícitamente una interfaz** que contiene todos los miembros de instancia de la clase (tanto sus métodos como sus propiedades/getters/setters), independientemente de si la clase es normal o abstracta.

Esta característica significa que cualquier clase en Dart puede ser utilizada como un molde de implementación (mediante herencia con `extends`) o como un contrato puro (mediante acoplamiento de interfaz con `implements`).

### La palabra clave `implements`

Para que una clase adopte el contrato de una interfaz implícita, se utiliza la palabra clave `implements`.

A diferencia de la herencia (`extends`), donde la clase derivada adquiere el comportamiento y la lógica interna de la clase base, cuando una clase implementa otra, **no hereda absolutamente nada de su código ni de su estado**. Únicamente adopta la obligación de replicar su firma. La clase que implementa debe proporcionar obligatoriamente una implementación propia y concreta de cada método y propiedad de la interfaz implícita.

La sintaxis básica para implementar interfaces es:

```dart
class ClaseDestino implements ClaseA, ClaseB {
  // Obligatorio implementar todos los miembros de ClaseA y ClaseB
}

```

A diferencia de la herencia simple, Dart permite la **implementación múltiple**. Una clase puede implementar tantas interfaces como sea necesario, separándolas por comas.

### Diferencias fundamentales: `extends` vs `implements`

Para comprender cuándo utilizar cada una, es útil contrastar sus comportamientos:

| Característica | Con `extends` (Herencia) | Con `implements` (Interfaz) |
| --- | --- | --- |
| **Cantidad** | Solo se puede extender **una** clase base. | Se pueden implementar **múltiples** interfaces. |
| **Reutilización** | Hereda código, lógica y variables de la superclase. | No hereda código; solo adopta la estructura (las firmas). |
| **Obligación** | Solo obliga a implementar métodos abstractos. | Obliga a implementar **todos** los métodos y propiedades. |
| **Uso de `super`** | Permite invocar métodos de la clase base. | No permite usar `super` (no hay código base que llamar). |

### Ejemplo práctico

Imaginemos un sistema de automatización para una oficina. Tenemos una clase `Impresora` que realiza funciones estándar. Si queremos crear una `ImpresoraMultifuncion`, no queremos heredar el comportamiento interno antiguo paso a paso, sino asegurar que cumpla con el estándar completo de impresión, además de escanear de una manera totalmente nueva.

```dart
// Esta clase define una interfaz implícita
class Impresora {
  void imprimir(String documento) {
    print('Imprimiendo en papel: $documento');
  }
}

// Otra clase que define otra interfaz implícita
class Escaner {
  void escanear() {
    print('Escaneando documento físico...');
  }
}

// Implementación múltiple de interfaces implícitas
class ImpresoraMultifuncion implements Impresora, Escaner {
  // Obligatorio redefinir 'imprimir' (la lógica original NO se hereda)
  @override
  void imprimir(String documento) {
    print('Procesando cola digital e imprimiendo a doble cara: $documento');
  }

  // Obligatorio redefinir 'escanear'
  @override
  void escanear() {
    print('Convirtiendo documento físico a archivo PDF digital...');
  }
}

void main() {
  ImpresoraMultifuncion miEquipo = ImpresoraMultifuncion();
  
  miEquipo.imprimir('Reporte_Mensual.docx');
  miEquipo.escanear();
}

```

### Interfaces implícitas con Getters y Setters

Dado que los campos e instancias de variables generan automáticamente getters y setters implícitos en Dart, si implementas una clase que contiene variables, estás obligado a sobrescribir también esos getters y setters en la clase receptora.

```dart
class Persona {
  String nombre; // Genera implícitamente un getter y un setter

  Persona(this.nombre);
}

class Ciudadano implements Persona {
  // Obligado a proveer la propiedad o sus respectivos getter/setter
  @override
  String nombre; 
  
  String dni;

  Ciudadano(this.nombre, this.dni);
}

```

Las interfaces implícitas reducen drásticamente la necesidad de duplicar estructuras en el código de Dart, permitiendo que cualquier biblioteca o clase de terceros pueda ser utilizada como un contrato seguro sin que su diseñador original tuviera que preverlo expresamente.

## Resumen del capítulo

En este capítulo hemos explorado en profundidad las herramientas que ofrece Dart para construir arquitecturas de software robustas, escalables y organizadas mediante relaciones jerárquicas y contratos de comportamiento.

* En la sección **6.1 Clases base y derivadas**, analizamos cómo Dart utiliza la herencia simple a través de la palabra clave `extends` para permitir que las subclases adopten el comportamiento de una superclase, comprendiendo además el flujo de inicialización mediante el uso de `super`.
* En la sección **6.2 Sobrescritura de métodos**, estudiamos cómo modificar y especializar el comportamiento heredado utilizando la anotación `@override`, manteniendo la compatibilidad de firmas y extendiendo la lógica original sin destruirla.
* En la sección **6.3 Clases abstractas**, aprendimos a diseñar moldes conceptuales que prohíben su instanciación directa, delegando en las clases concretas la responsabilidad de implementar métodos abstractos específicos a través del polimorfismo.
* Finalmente, en la sección **6.4 Interfaces implícitas**, descubrimos la flexibilidad única de Dart, donde toda clase actúa como su propia interfaz, permitiendo implementar de manera múltiple con `implements` para cumplir estrictamente con firmas de código sin acoplar lógicas internas.
