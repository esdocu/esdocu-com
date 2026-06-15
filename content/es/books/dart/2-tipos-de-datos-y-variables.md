Para construir aplicaciones robustas en Dart, es fundamental dominar cómo el lenguaje gestiona la información en memoria. Este capítulo profundiza en los mecanismos que dan forma a tus datos. Aprenderás a declarar variables con flexibilidad y precisión mediante la inferencia de tipos y el tipado explícito, respetando las palabras clave reservadas del sistema. Además, exploraremos el comportamiento de estructuras esenciales como números, texto y booleanos, el uso estratégico de constantes y el blindaje que ofrece el sistema *Null Safety* para erradicar errores por valores nulos antes de que tu código se ejecute.

## 2.1 Variables y palabras clave

En programación, una **variable** es un contenedor en la memoria del dispositivo que almacena un valor que tu programa puede utilizar, modificar y consultar en cualquier momento. Dart es un lenguaje fuertemente tipado (*strongly typed*), lo que significa que cada valor tiene un tipo de datos específico y el lenguaje garantiza que no mezcles tipos incompatibles de forma descontrolada. Sin embargo, Dart ofrece múltiples formas de declarar variables, adaptándose tanto a la flexibilidad del desarrollo rápido como a la rigidez de los sistemas empresariales robustos.

### Declaración de variables: `var`, `Object` y tipos explícitos

Para entender cómo Dart gestiona la memoria y la inferencia de tipos, podemos visualizar una variable como una etiqueta vinculada a una caja en la memoria:

```text
[ Inferencia con 'var' ] 
 var edad = 25;  ============>  [ Memoria: Caja tipo 'int' (Contiene: 25) ]
                                (Dart deduce el tipo automáticamente)

[ Tipado Explícito ]
 int edad = 25; =============>  [ Memoria: Caja tipo 'int' (Contiene: 25) ]
                                (Definido estrictamente por el desarrollador)

```

Dart ofrece tres estrategias principales para dar vida a una variable:

1. **Inferencia de tipos con `var`**: Es la forma más común y recomendada para variables locales. Dart analiza el valor inicial asignado a la variable y deduce automáticamente el tipo de dato. Una vez que Dart infiere el tipo, este queda congelado; no puedes cambiarlo más adelante.
2. **Tipado explícito**: Consiste en escribir directamente el nombre del tipo de dato (`int`, `String`, `double`, etc.) en lugar de `var`. Es útil si deseas ser sumamente estricto o cuando no vas a inicializar la variable inmediatamente.
3. **El tipo comodín `Object`**: En Dart, casi todo es un objeto. Si declaras una variable usando `Object`, le estás diciendo al compilador que esa variable puede contener *cualquier* tipo de dato y, a diferencia de `var`, sí te permitirá cambiar el tipo de información almacenada en el futuro.

El siguiente bloque de código ilustra la sintaxis y las diferencias de comportamiento entre estas tres estrategias:

```dart
void main() {
  // 1. Uso de var (Inferencia de tipos)
  var nombre = 'Carlos'; // Dart infiere que 'nombre' es un String
  nombre = 'Andrés';     // Válido: Cambia el valor, pero sigue siendo un String
  // nombre = 30;        // ERROR DE COMPILACIÓN: Un int no puede asignarse a un String

  // 2. Uso de tipado explícito
  int edad = 28;
  String ciudad = 'Bogotá';
  
  // 3. Uso de Object
  Object equipaje = 'Maleta de mano'; 
  equipaje = 15; // Válido: Object permite cambiar a cualquier tipo de dato en ejecución
}

```

### Palabras clave (Keywords)

Las palabras clave o *keywords* son términos reservados que tienen un significado especial y predefinido para el compilador de Dart. Debido a que el lenguaje las utiliza para estructurar su sintaxis (crear bucles, condicionales, clases, etc.), **no puedes utilizarlas como nombres de tus variables, funciones o clases**.

Dart clasifica sus palabras clave en diferentes categorías según su nivel de restricción:

* **Palabras clave reservadas (Strict keywords)**: No pueden ser usadas como identificadores bajo ninguna circunstancia. Intentar nombrar una variable con alguna de ellas romperá tu código instantáneamente. Ejemplos: `class`, `else`, `false`, `if`, `return`, `void`, `while`.
* **Palabras clave contextuales**: Solo actúan como palabras reservadas en lugares muy específicos del código. Fuera de esos contextos, puedes usarlas como nombres de variables si lo deseas (aunque no se recomienda para evitar confusiones). Ejemplos: `async`, `hide`, `show`, `sync`.
* **Palabras clave incorporadas (Built-in identifiers)**: Son palabras que sirven para definir estructuras del ecosistema de Dart. Para evitar conflictos con código antiguo, son válidas como identificadores en la mayoría de los lugares, excepto como nombres de clases, tipos o prefijos de importación. Ejemplos: `abstract`, `export`, `import`, `mixin`, `static`, `get`, `set`.

A continuación se presenta una tabla de referencia con las palabras clave más recurrentes en el desarrollo diario con Dart:

| Tipo de Palabra Clave | Ejemplos Comunes | Regla de Uso |
| --- | --- | --- |
| **Reservadas** | `if`, `else`, `for`, `while`, `class`, `return`, `true`, `false`, `switch` | Prohibido usarlas como nombres de variables o funciones. |
| **Contextuales / Incorporadas** | `abstract`, `get`, `set`, `mixin`, `async`, `await`, `import`, `export` | Tienen un rol técnico, pero son más flexibles fuera de su contexto nativo. |

Si intentas desafiar las reglas del compilador con una palabra clave reservada, te encontrarás con el siguiente escenario:

```dart
void main() {
  // Intento de usar una palabra clave reservada como variable
  // int class = 12; // ERROR DE COMPILACIÓN: 'class' no puede ser un identificador.
  
  // Uso de una palabra clave incorporada fuera de su contexto (Permitido, pero evítalo)
  int get = 5; 
  print(get); // Funciona, pero disminuye la legibilidad del código
}

```

### Reglas y convenciones de nomenclatura

Para que tu código sea limpio y se integre perfectamente con el ecosistema de Dart y Flutter, debes seguir las pautas oficiales de diseño de código (*Style Guide*):

* **camelCase para variables y funciones**: Comienza siempre con la primera letra en minúscula y capitaliza la primera letra de cada palabra subsiguiente. No utilices guiones bajos ni espacios.
* **Caracteres válidos**: Los nombres de las variables pueden contener letras del alfabeto, números y los caracteres `_` (guion bajo) y `$` (signo de dólar).
* **Restricción numérica**: El nombre de una variable **nunca** puede comenzar con un número.

```dart
// Ejemplos de nombres correctos (camelCase)
var nombreUsuario = 'Ana';
var temperaturaMaxima = 36.5;
var elPrimerPaso = true;

// Ejemplos incorrectos o no recomendados
// var 1puesto = 'Oro';    // ERROR: No puede empezar con un número
// var nombre_usuario = ''; // Válido, pero viola la convención camelCase de Dart

```

## 2.2 Tipos de datos numéricos

En Dart, los números se manejan a través de una jerarquía de tipos bien definida que permite realizar desde cálculos financieros precisos hasta operaciones científicas de alta velocidad. A diferencia de otros lenguajes donde existen decenas de tipos numéricos según su tamaño en bits (como `byte`, `short` o `long`), Dart simplifica este panorama ofreciendo dos tipos de datos principales que derivan de una clase base común llamada `num`.

La estructura jerárquica de los números en Dart se puede visualizar de la siguiente manera:

```text
          [ num ] (Clase Base)
             |
     +-------+-------+
     |               |
  [ int ]        [ double ]
 (Enteros)      (Decimales)

```

### El tipo `num`

La clase `num` es el ancestro directo de los números en Dart. Una variable declarada como `num` puede almacenar tanto números enteros como números decimales. Es una opción de tipado útil cuando estás programando una función o un algoritmo que debe ser capaz de procesar cualquier tipo de cifra sin distinción.

```dart
void main() {
  num valorGenerico = 10;   // Actualmente almacena un entero
  print(valorGenerico);     // Imprime: 10
  
  valorGenerico = 10.5;     // Válido: Cambia a un valor decimal
  print(valorGenerico);     // Imprime: 10.5
}

```

### Números enteros: `int`

El tipo `int` se utiliza para representar números que no tienen parte fraccionaria. Dependiendo de la plataforma en la que se ejecute tu código, el tamaño y comportamiento de un `int` varía de forma automática para maximizar el rendimiento:

* **En plataformas nativas (Android, iOS, Windows, macOS, Linux, Servidores)**: Los enteros son valores de 64 bits con signo. Su rango físico está comprendido entre $-2^{63}$ y $2^{63} - 1$.
* **En la plataforma Web (JavaScript)**: Los enteros se compilan como números de punto flotante de doble precisión sin parte fraccionaria de JavaScript. Su rango seguro abarca desde $-2^{53} + 1$ hasta $2^{53} - 1$.

Además de la notación decimal estándar, Dart permite escribir números enteros utilizando la notación hexadecimal mediante el prefijo `0x`:

```dart
void main() {
  int contador = 42;
  int habitantes = 8500000;
  
  // Notación hexadecimal (Equivale a 255 en base 10)
  int colorBlanco = 0xFFFFFFFF; 
}

```

### Números decimales: `double`

El tipo `double` se emplea para números que requieren precisión decimal. Dart implementa el estándar IEEE 754, lo que significa que los objetos `double` son números de punto flotante de doble precisión de 64 bits.

Puedes declarar un `double` usando el punto decimal tradicional de manera explícita o mediante el uso de la notación científica (exponencial) utilizando la letra `e` o `E`:

```dart
void main() {
  double precio = 19.99;
  double gravedad = 9.81;
  
  // Notación exponencial: 1.2 x 10^3 (Equivale a 1200.0)
  double exponente = 1.2e3; 
}

```

> **Nota de diseño:** A partir de Dart 2.1, el compilador realiza una conversión automática (*literal de doble precisión implícito*). Si asignas un número entero a una variable de tipo `double`, Dart añadirá el componente decimal automáticamente sin lanzar un error.

```dart
double temperatura = 25; // El compilador lo transforma internamente en 25.0

```

### Propiedades y métodos numéricos fundamentales

Las clases `int` y `double` heredan y extienden una serie de propiedades y métodos utilitarios de la clase `num` que facilitan el análisis y la manipulación de cifras sin necesidad de librerías externas.

A continuación se detallan las herramientas más comunes para trabajar con números:

| Propiedad / Método | Tipo de retorno | Propósito |
| --- | --- | --- |
| `.isNegative` | `bool` | Devuelve `true` si el número es menor que cero. |
| `.isEven` | `bool` | *(Solo en `int`)* Devuelve `true` si el número es par. |
| `.isOdd` | `bool` | *(Solo en `int`)* Devuelve `true` si el número es impar. |
| `.abs()` | `num` / `int` / `double` | Devuelve el valor absoluto (transforma negativos en positivos). |
| `.round()` | `int` | Redondea al entero más cercano. |
| `.floor()` | `int` | Redondea hacia abajo (hacia el infinito negativo). |
| `.ceil()` | `int` | Redondea hacia arriba (hacia el infinito positivo). |
| `.truncate()` | `int` | Descarta toda la parte decimal sin aplicar redondeo. |

Veamos estos métodos aplicados en código real:

```dart
void main() {
  int puntuacion = -15;
  double pi Aproximado = 3.14159;

  // Evaluación de propiedades
  print(puntuacion.isNegative);      // Imprime: true
  print(10.isEven);                  // Imprime: true

  // Operaciones de conversión y redondeo
  print(puntuacion.abs());           // Imprime: 15
  print(piAproximado.round());       // Imprime: 3
  print(piAproximado.floor());       // Imprime: 3
  print(piAproximado.ceil());        // Imprime: 4
  
  double saldo Negativo = -2.8;
  print(saldoNegativo.truncate());   // Imprime: -2 (Elimina el .8)
}

```

## 2.3 Cadenas de texto y booleanos

Una vez dominados los números, el siguiente paso fundamental en Dart es aprender a manipular texto y evaluar estados lógicos de verdadero o falso. Estas tareas se resuelven mediante el uso de cadenas de texto (`String`) y valores booleanos (`bool`).

### Cadenas de texto: `String`

En Dart, un `String` representa una secuencia de caracteres codificados en UTF-16. Sirve para almacenar cualquier tipo de texto, desde una sola letra hasta párrafos completos de un libro.

#### Declaración de cadenas

Dart ofrece una gran flexibilidad para declarar cadenas de texto. Puedes utilizar tanto comillas simples (`'`) como comillas dobles (`"`). La comunidad de Dart recomienda el uso de comillas simples por consistencia y limpieza visual, reservando las comillas dobles para casos donde el texto contenga apóstrofes.

Si necesitas escribir un texto que ocupe múltiples líneas manteniendo los saltos de línea exactos, puedes utilizar la sintaxis de comillas triples (ya sean tres simples `'''` o tres dobles `"""`).

```dart
void main() {
  // Declaración estándar (Recomendado comillas simples)
  String pais = 'México';
  String mensaje = "Bienvenidos a Dart"; 

  // Manejo de apóstrofes sin escapar caracteres
  String frase = "It's a beautiful day";

  // Cadenas multilínea
  String poema = '''
  Caminante, no hay camino,
  se hace camino al andar.
  Al andar se hace camino...
  ''';
}

```

#### Interpolación de texto

La interpolación es el mecanismo que te permite incrustar variables o expresiones directamente dentro de una cadena de texto, evitando la incómoda y costosa concatenación manual con el operador `+`.

* Para interpolar una **variable simple**, se utiliza el símbolo de dólar `$`.
* Para interpolar una **expresión o fragmento de código** (como una operación matemática o la invocación de un método), se encierra la expresión entre llaves `${}`.

```dart
void main() {
  String producto = 'Laptop';
  double precio = 899.99;
  int cantidad = 2;

  // Interpolación de variables simples y expresiones complejas
  String recibo = 'Compraste $cantidad unidades de $producto por un total de \$${precio * cantidad}';
  
  print(recibo);
  // Imprime: Compraste 2 unidades de Laptop por un total de $1799.98
}

```

> **Nota de escape:** Como el símbolo `$` se usa para interpolar, si deseas mostrar el carácter `$` de forma literal en tu texto, debes antecederlo con una barra invertida (`\$`).

#### Métodos y propiedades útiles de `String`

La clase `String` incluye herramientas nativas esenciales para inspeccionar, limpiar y transformar el texto:

| Propiedad / Método | Tipo de retorno | Propósito |
| --- | --- | --- |
| `.length` | `int` | Devuelve la cantidad total de caracteres (incluyendo espacios). |
| `.isEmpty` | `bool` | Devuelve `true` si la cadena está completamente vacía (`''`). |
| `.toLowerCase()` | `String` | Transforma todo el texto a letras minúsculas. |
| `.toUpperCase()` | `String` | Transforma todo el texto a letras mayúsculas. |
| `.trim()` | `String` | Elimina todos los espacios en blanco al inicio y al final del texto. |
| `.contains(...)` | `bool` | Verifica si una subcadena específica existe dentro del texto. |

```dart
void main() {
  String correo = '  SOPORTE@empresa.COM  ';

  print(correo.length);          // Imprime: 23
  print(correo.trim());          // Imprime: 'SOPORTE@empresa.COM'
  
  String correoLimpio = correo.trim().toLowerCase();
  print(correoLimpio);           // Imprime: 'soporte@empresa.com'
  print(correoLimpio.contains('empresa')); // Imprime: true
}

```

### Booleanos: `bool`

El tipo de dato `bool` en Dart representa valores de lógica booleana elemental. Solo existen dos instancias u objetos válidos para este tipo: los literales `true` (verdadero) y `false` (falso).

A diferencia de otros lenguajes de programación (como JavaScript, C o Python), Dart no tiene el concepto de valores "truthy" o "falsy". Esto significa que números como `0` o `1`, cadenas vacías `''` o valores nulos `null` **no se convierten automáticamente en booleanos**. Si una estructura de control (como un condicional `if`) espera un booleano, debes proveer obligatoriamente un valor de tipo `bool`.

```dart
void main() {
  bool esMayorDeEdad = true;
  bool cuentaActiva = false;

  // Evaluación directa de banderas booleanas
  if (esMayorDeEdad) {
    print('Acceso concedido.');
  }

  // Intento de uso no válido de un tipo no booleano
  var nombre = 'Carlos';
  // if (nombre) { ... } // ERROR DE COMPILACIÓN: El tipo 'String' no puede ser usado como 'bool'.
  
  // Forma correcta evaluando una expresión condicional que devuelve un bool
  if (nombre.isNotEmpty) {
    print('El nombre no está vacío.');
  }
}

```

## 2.4 Null Safety básico

Uno de los errores más comunes y frustrantes en la historia de la programación es el famoso `NullPointerException` (intentar acceder a una propiedad o método de un objeto que en realidad no existe en memoria porque es nulo). Para erradicar este problema por completo, Dart utiliza un sistema llamado **Sound Null Safety** (Seguridad nula garantizada).

*Null Safety* es un blindaje en tiempo de compilación. El compilador de Dart analiza tu código antes de ejecutarlo y garantiza que las variables no contengan valores nulos de forma accidental, permitiéndote atrapar estos errores mientras escribes el código y no cuando la aplicación ya está en manos de tus usuarios.

### Variables no nulas por defecto

En Dart, **todas las variables son no nulas por defecto**. Si declaras una variable de cualquier tipo, Dart asumirá que siempre contendrá un valor real y te prohibirá terminantemente asignarle el valor `null`.

```dart
void main() {
  String nombre = 'Elena';
  // nombre = null; // ERROR DE COMPILACIÓN: El valor 'null' no puede ser asignado a un 'String'.
  
  int edad;
  // print(edad);   // ERROR DE COMPILACIÓN: La variable local 'edad' debe ser inicializada antes de ser usada.
}

```

### Tipos nulos (Nullable types) y el operador `?`

Habrá escenarios en tus aplicaciones donde la ausencia de un dato sea perfectamente válida. Por ejemplo, una variable `segundoNombre` puede no tener un valor porque no todas las personas lo tienen, o la temperatura de una estación meteorológica puede ser nula si el sensor se desconecta.

Para indicarle a Dart que una variable **sí tiene permitido ser nula**, debes añadir el operador de interrogación `?` inmediatamente después del tipo de dato:

```text
    [ int ]  ==============> Nunca puede ser nulo (Seguro)
    [ int? ] ==============> Puede contener un entero O puede ser 'null' (Flexible)

```

Veamos cómo se traduce esto en código:

```dart
void main() {
  // Esta variable acepta un texto o un valor nulo
  String? segundoNombre = 'Felipe';
  segundoNombre = null; // Completamente válido gracias al operador '?'
  
  int? telefonoAnexo; // Si no se inicializa, su valor por defecto es null
  print(telefonoAnexo); // Imprime: null
}

```

### Operadores esenciales para el manejo de nulos

Cuando trabajas con variables que pueden ser nulas (`Type?`), Dart restringe lo que puedes hacer con ellas. Por ejemplo, no te dejará usar `.length` en un `String?` directamente, porque si la variable es `null`, el programa fallaría.

Para operar de forma segura con estas variables, Dart introduce tres operadores fundamentales:

#### 1. Operador de navegación segura: `?.` (Null-aware operator)

Este operador evalúa el objeto antes de acceder a una propiedad o método. Si el objeto no es nulo, ejecuta la acción; si el objeto es nulo, detiene la ejecución de la línea y devuelve `null` de inmediato, evitando que el programa colapse.

#### 2. Operador de asignación e inicialización si es nulo: `??` (Null-coalescing operator)

Permite definir un "valor de respaldo" o alternativa en caso de que una expresión resulte ser nula. Es sumamente útil para asignar valores por defecto.

#### 3. Operador de aserción forzada: `!` (Bang operator)

Es la forma en la que le dices al compilador: *"Yo, como desarrollador, te garantizo que esta variable no es nula en este momento del programa, confía en mí y trátala como una variable no nula"*. **Úsalo con extrema precaución**: si te equivocas y la variable resulta ser nula en ejecución, el programa se detendrá inmediatamente con un error.

A continuación se muestra un ejemplo integral con el comportamiento de estos tres operadores:

```dart
void main() {
  String? nombreUsuario = null;

  // 1. Uso de ?. (Evita que el programa falle)
  print(nombreUsuario?.length); 
  // Imprime: null (No lanza un error, simplemente detecta que es null y frena el acceso)

  // 2. Uso de ?? (Provee un valor por defecto si es nulo)
  String nombreAmostrar = nombreUsuario ?? 'Invitado';
  print(nombreAmostrar); 
  // Imprime: Invitado (Como nombreUsuario era null, tomó la alternativa)

  // 3. Uso de ! (Forzar la aserción)
  String? codigoProducto = 'A-102';
  // Aunque es de tipo String?, sabemos con certeza que tiene un valor asignado arriba
  int longitudCodigo = codigoProducto!.length; 
  print(longitudCodigo); // Imprime: 5
}

```

## 2.5 Conversión entre tipos

En Dart, al ser un lenguaje con un sistema de tipado estricto, no puedes realizar asignaciones directas entre tipos de datos diferentes (por ejemplo, asignar un `double` a un `int`, o un `int` a un `String`). Cuando necesitas transformar un dato de un tipo a otro, debes realizar una **conversión explícita** utilizando los métodos y herramientas que el lenguaje provee.

### Conversión de texto (`String`) a números (`int` / `double`)

Una de las situaciones más comunes en el desarrollo de software es recibir datos en formato de texto (ya sea desde una interfaz de usuario, un archivo de configuración o una API web) y necesitar transformarlos en números para realizar operaciones matemáticas.

Para lograr esto, las clases `int` y `double` exponen dos métodos estáticos fundamentales:

1. **`parse()`**: Toma una cadena de texto e intenta convertirla directamente. Si el texto no representa un número válido (por ejemplo, `'32s'`), el método fallará inmediatamente lanzando una excepción (`FormatException`) que romperá el programa si no se maneja de forma adecuada.
2. **`tryParse()`**: Es la alternativa segura. Realiza el mismo intento de conversión, pero si el formato del texto es incorrecto o inválido, en lugar de lanzar un error, **devuelve un valor `null`**. Por esta razón, su tipo de retorno siempre es nullable (`int?` o `double?`), obligándote a gestionar la ausencia del dato mediante las reglas de Null Safety.

```dart
void main() {
  // 1. Uso de parse() con datos correctos
  String textoEdad = '35';
  int edad = int.parse(textoEdad);
  print(edad + 5); // Imprime: 40 (Operación matemática válida)

  String textoPrecio = '19.99';
  double precio = double.parse(textoPrecio);
  print(precio); // Imprime: 19.99

  // 2. Riesgo de parse() con datos incorrectos
  // int error = int.parse('35 años'); // Lanza FormatException y detiene el programa

  // 3. Uso seguro de tryParse()
  String entradaInvalida = '120px';
  int? medida = int.tryParse(entradaInvalida); 
  
  // Usamos el operador ?? aprendido en la sección anterior para dar un valor de respaldo
  int medidaFinal = medida ?? 0; 
  print(medidaFinal); // Imprime: 0 (Detectó el formato incorrecto sin romper el programa)
}

```

### Conversión de números (`int` / `double`) a texto (`String`)

El camino inverso es sumamente sencillo. Todos los tipos de datos en Dart heredan el método `.toString()`, el cual genera una representación en cadena de texto del valor actual del objeto.

Adicionalmente, el tipo `double` ofrece el método `.toStringAsFixed(int fractionDigits)`, que te permite convertir el número decimal a texto controlando de forma estricta cuántos dígitos fraccionarios (decimales) deseas conservar, aplicando un redondeo automático si es necesario.

```dart
void main() {
  int puntaje = 500;
  String textoPuntaje = puntaje.toString();
  print(textoPuntaje); // Imprime: "500"

  double pi = 3.1415926535;
  // Convertir a String limitando a dos decimales
  String piRedondeado = pi.toStringAsFixed(2);
  print(piRedondeado); // Imprime: "3.14"
}

```

### Conversión entre tipos numéricos (`int` y `double`)

Aunque ambos tipos heredan de la clase base `num`, un entero y un decimal se almacenan de formas muy distintas en la memoria. Por ello, si deseas pasar un valor de uno a otro, debes solicitarlo explícitamente:

* Para transformar un `double` a `int`, puedes usar el método `.toInt()`. Este método realiza un truncamiento automático, es decir, **elimina por completo la parte decimal** sin importar qué tan grande sea, quedándose únicamente con la parte entera.
* Para transformar un `int` a `double`, utilizas el método `.toDouble()`, el cual añade el componente fraccionario `.0` al número.

```dart
void main() {
  double impuesto = 15.75;
  // Conversión de double a int (descarta los decimales)
  int impuestoEntero = impuesto.toInt();
  print(impuestoEntero); // Imprime: 15

  int año = 2026;
  // Conversión de int a double
  double añoDecimal = año.toDouble();
  print(añoDecimal); // Imprime: 2026.0
}

```

## Resumen del capítulo

En este segundo capítulo hemos explorado los cimientos sobre los cuales Dart gestiona la información en la memoria de un dispositivo:

* Aprendimos que una variable es un contenedor con un tipo de datos asociado, y que Dart puede deducir este tipo automáticamente mediante el uso de `var` gracias a la **inferencia de tipos**.
* Conocimos las **palabras clave (keywords)**, los términos reservados por el lenguaje que no podemos reutilizar como identificadores de nuestras variables.
* Estudiamos la estructura de los **tipos de datos numéricos** (`int`, `double` y su ancestro común `num`), así como los métodos nativos para redondear y alterar sus valores.
* Analizamos el comportamiento de las cadenas de texto (`String`), dominando la **interpolación de variables** (`$variable` y `${expresión}`), y descubrimos la rigidez del tipo booleano (`bool`), el cual no admite equivalencias automáticas de otros tipos de datos.
* Nos introdujimos en el concepto de **Sound Null Safety**, comprendiendo que en Dart las variables no pueden ser nulas por defecto a menos que usemos explícitamente el operador `?`, y aprendimos a navegar de forma segura con los operadores `?.`, `??` y `!`.
* Finalmente, revisamos las herramientas indispensables para **convertir tipos de datos**, garantizando que la información fluya correctamente entre textos, enteros y decimales sin generar errores en tiempo de ejecución.
