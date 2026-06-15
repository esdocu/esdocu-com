Los operadores son los motores de la lógica en Dart, herramientas esenciales para transformar datos aislados en instrucciones con sentido. En este capítulo aprenderás a manipular y evaluar información de forma precisa. Comenzaremos con los cálculos matemáticos básicos y el comportamiento de la división. Luego, exploraremos cómo comparar magnitudes y verificar igualdades para que tu programa tome decisiones. También descubriremos cómo combinar múltiples condiciones mediante la lógica booleana y el uso eficiente de circuitos cortos. Finalmente, dominaremos las asignaciones compuestas para escribir un código más limpio, compacto y seguro.

## 3.1 Operadores aritméticos

Los operadores aritméticos son los bloques fundamentales que permiten realizar cálculos matemáticos dentro de un programa. En Dart, estos operadores toman uno o dos valores numéricos (operandos) y devuelven un único resultado numérico.

Dado que Dart cuenta con un sistema de tipos fuerte, el resultado de una operación aritmética dependerá directamente del tipo de los números involucrados (`int` o `double`), una regla que se aplica de manera estricta en operaciones como la división.

### Los operadores aritméticos básicos

Dart ofrece un conjunto estándar de operadores para las cuatro operaciones matemáticas básicas, además de operadores para el cálculo de residuos y la manipulación de signos.

| Operador | Descripción | Ejemplo | Resultado típico |
| --- | --- | --- | --- |
| `+` | **Suma** | `5 + 3` | `8` |
| `-` | **Resta** | `10 - 4` | `6` |
| `*` | **Multiplicación** | `4 * 2` | `8` |
| `/` | **División** (siempre retorna `double`) | `10 / 4` | `2.5` |
| `~/` | **División entera** (retorna `int`) | `10 ~/ 4` | `2` |
| `%` | **Módulo** (residuo de la división) | `10 % 4` | `2` |
| `-expr` | **Negación unaria** (invierte el signo) | `-5` | `-5` |

A continuación se presenta un programa de ejemplo que demuestra el comportamiento de cada uno de estos operadores:

```dart
void main() {
  int a = 15;
  int b = 4;

  // Suma, resta y multiplicación
  print('Suma: $a + $b = ${a + b}');          // 19
  print('Resta: $a - $b = ${a - b}');        // 11
  print('Multiplicación: $a * $b = ${a * b}'); // 60

  // El comportamiento de la división
  print('División estándar: $a / $b = ${a / b}');   // 3.75
  print('División entera: $a ~/ $b = ${a ~/ b}');   // 3

  // El operador módulo
  print('Residuo (Módulo): $a % $b = ${a % b}');    // 3

  // Negación unaria
  int positivo = 10;
  int negativo = -positivo;
  print('Negación: $negativo'); // -10
}

```

### Particularidades de la división en Dart

Es importante detenerse en la diferencia entre el operador de división estándar (`/`) y el de división entera (`~/`).

El operador `/` siempre devuelve un objeto de tipo `double`, incluso si los dos operandos son enteros y el resultado es exacto. Por ejemplo, `4 / 2` dará como resultado `2.0`, no `2`.

Por otro lado, el operador `~/` divide el primer número por el segundo y descarta cualquier parte fraccionaria, truncando el resultado hacia cero y devolviendo un valor de tipo `int`.

```text
División Estándar (15 / 4)
[ 15 ] / [ 4 ]  =======>  3.75  (Tipo: double)

División Entera (15 ~/ 4)
[ 15 ] ~/ [ 4 ] =======>  3     (Tipo: int, parte decimal descartada)

```

### Operadores de incremento y decremento

Dart incluye operadores unarios abreviados para aumentar o disminuir el valor de una variable numérica en una unidad. Estos operadores pueden utilizarse en posición **prefijo** (antes de la variable) o **posfijo** (después de la variable), lo que altera el orden en el que se evalúa la expresión.

* **Prefijo (`++contador`, `--contador`):** Incrementa o decremento el valor de la variable inmediatamente y luego devuelve el nuevo valor para ser usado en la expresión.
* **Posfijo (`contador++`, `contador--`):** Devuelve el valor original de la variable para que se use en la expresión y, justo después, realiza el incremento o decremento en memoria.

```dart
void main() {
  int x = 5;
  int y;

  // Ejemplo con prefijo
  y = ++x; // x se convierte en 6, luego y recibe el valor de x (6)
  print('Prefijo - x: $x, y: $y'); // x: 6, y: 6

  // Reiniciamos valores
  x = 5;

  // Ejemplo con posfijo
  y = x++; // y recibe el valor actual de x (5), luego x se incrementa a 6
  print('Posfijo - x: $x, y: $y'); // x: 6, y: 5
}

```

### Precedencia de operadores

Cuando se combinan múltiples operadores en una sola línea de código, Dart los evalúa siguiendo un orden jerárquico estricto conocido como **precedencia de operadores**. Las reglas de precedencia para los operadores aritméticos son las siguientes:

1. Operadores unarios y prefijos/posfijos (`++`, `--`, `-expr`)
2. Multiplicación, divisiones y módulo (`*`, `/`, `~/`, `%`)
3. Suma y resta (`+`, `-`)

Si los operadores tienen el mismo nivel de precedencia, la expresión se evalúa de izquierda a derecha. Para alterar este orden natural o asegurar la máxima claridad en el código, se deben utilizar paréntesis `()`, los cuales tienen la prioridad más alta de evaluación.

```dart
void main() {
  double resultado;

  // Sin paréntesis: la multiplicación se ejecuta primero
  resultado = 5 + 3 * 2; 
  print('Resultado sin paréntesis: $resultado'); // 5 + 6 = 11.0

  // Con paréntesis: la suma se ejecuta primero
  resultado = (5 + 3) * 2;
  print('Resultado con paréntesis: $resultado'); // 8 * 2 = 16.0
}

```

## 3.2 Operadores relacionales

Los operadores relacionales (también conocidos como operadores de comparación) se utilizan para comprobar la relación matemática o de igualdad entre dos expresiones u operandos. A diferencia de los operadores aritméticos, que devuelven un valor numérico, los operadores relacionales siempre evalúan y devuelven un valor booleano: `true` (verdadero) o `false` (falso).

Estos operadores son las herramientas esenciales que permiten al programa tomar decisiones, ya que sus resultados alimentan directamente a las estructuras de control de flujo que se estudiarán en capítulos posteriores.

### Los operadores de comparación en Dart

Dart ofrece seis operadores relacionales estándar. Cuatro de ellos están destinados a comparar magnitudes (mayor o menor) y los otros dos se encargan de comprobar la igualdad o diferencia exacta.

| Operador | Descripción | Ejemplo | Resultado si `x = 5`, `y = 10` |
| --- | --- | --- | --- |
| `==` | **Igual que** | `x == y` | `false` |
| `!=` | **Diferente de** (no igual) | `x != y` | `true` |
| `>` | **Mayor que** | `x > y` | `false` |
| `<` | **Menor que** | `x < y` | `true` |
| `>=` | **Mayor o igual que** | `x >= y` | `false` |
| `<=` | **Menor o igual que** | `x <= y` | `true` |

A continuación se muestra un bloque de código que ilustra el uso de cada uno de estos operadores con diferentes tipos de datos numéricos:

```dart
void main() {
  int a = 20;
  int b = 10;
  int c = 20;

  // Comparaciones de magnitud
  print('¿$a es mayor que $b?: ${a > b}');       // true
  print('¿$b es mayor que $a?: ${b > a}');       // false
  print('¿$a es menor que $b?: ${a < b}');       // false
  print('¿$b es menor o igual que $a?: ${b <= a}'); // true

  // Comparaciones de igualdad
  print('¿$a es igual a $c?: ${a == c}');       // true
  print('¿$a es diferente de $b?: ${a != b}');   // true
  print('¿$a es diferente de $c?: ${a != c}');   // false
}

```

### El operador de igualdad (`==`) en Dart

El operador de igualdad en Dart merece una atención especial. A diferencia de otros lenguajes de programación (como JavaScript o Java) donde existe una distinción compleja entre "igualdad de valor" (`==`) e "igualdad de referencia" (`===`), Dart simplifica este proceso a través de su diseño orientado a objetos.

Cuando escribes `x == y` en Dart, el lenguaje invoca internamente un método especial llamado `==` en el primer objeto, pasando el segundo objeto como argumento. Es decir, la expresión se traduce en algo similar a: `x.equals(y)`.

```text
Expresión en código:       a == b
                           │    │
Traducción interna:        a.operator==(b)

```

#### Reglas clave de la igualdad

* **Compatibilidad de tipos:** Puedes usar `==` y `!=` para comparar cualquier tipo de objeto en Dart (como cadenas de texto o booleanos), no solo números.
* **Comparación entre `int` y `double`:** Dart permite comparar un número entero con un número decimal de manera transparente. Si los valores matemáticos coinciden, la igualdad se evalúa como verdadera.
* **Igualdad con `null`:** El operador `==` maneja de forma segura los valores nulos sin lanzar errores de ejecución.

```dart
void main() {
  // Comparación entre tipos numéricos distintos
  int entero = 5;
  double decimal = 5.0;
  print(entero == decimal); // true (matemáticamente son el mismo valor)

  // Comparación de cadenas de texto (Strings)
  String texto1 = 'Dart';
  String texto2 = 'dart';
  print(texto1 == texto2); // false (distingue entre mayúsculas y minúsculas)

  // Comparación con null
  String? nombre;
  print(nombre == null); // true
}

```

### Precedencia frente a operadores aritméticos

En la jerarquía de evaluación de Dart, los operadores relacionales tienen una precedencia **menor** que los operadores aritméticos. Esto significa que si en una misma expresión se combinan operaciones matemáticas y comparaciones, Dart resolverá primero todos los cálculos matemáticos y, al final, comparará los resultados obtenidos.

```dart
void main() {
  // Primero se calcula (10 + 5) que es 15, y (4 * 4) que es 16.
  // Al final se evalúa: ¿15 > 16?
  bool resultado = 10 + 5 > 4 * 4;

  print(resultado); // false
}

```

## 3.3 Operadores lógicos

Los operadores lógicos se utilizan para combinar o invertir expresiones que evalúan a valores booleanos (`true` o `false`). Mientras que los operadores relacionales permiten realizar comparaciones individuales, los operadores lógicos permiten construir condiciones complejas uniendo múltiples comparaciones en una sola declaración.

En Dart, los operadores lógicos funcionan exclusivamente con operandos de tipo booleano (`bool`). Intentar utilizarlos con números, cadenas de texto u otros tipos de datos provocará un error de compilación.

### Los tres operadores lógicos fundamentales

Dart cuenta con tres operadores lógicos principales: la conjunción (Y), la disyunción (O) y la negación (NO).

| Operador | Nombre | Descripción | Ejemplo |
| --- | --- | --- | --- |
| `&&` | **AND** (Y lógico) | Devuelve `true` solo si **ambos** operandos son verdaderos. | `expr1 && expr2` |
| `\|\|` | **OR** (O lógico) | Devuelve `true` si al menos **uno** de los operandos es verdadero. | `expr1 \|\| expr2` |
| `!` | **NOT** (NO lógico) | Invierte el valor booleano del operando (operador unario). | `!expr` |

### Tablas de verdad

Para comprender el comportamiento exacto de estos operadores, se utilizan las tablas de verdad, las cuales muestran el resultado de la operación para todas las combinaciones posibles de valores booleanos.

#### Operador AND (`&&`) y OR (`||`)

| Operando A | Operando B | A `&&` B (AND) | A `\|\|` B (OR) |
| --- | --- | --- | --- |
| `true` | `true` | `true` | `true` |
| `true` | `false` | `false` | `true` |
| `false` | `true` | `false` | `true` |
| `false` | `false` | `false` | `false` |

#### Operador NOT (`!`)

| Operando A | `!` A (NOT) |
| --- | --- |
| `true` | `false` |
| `false` | `true` |

A continuación se presenta un ejemplo de código donde se aplican estos operadores combinando variables booleanas:

```dart
void main() {
  bool tieneId = true;
  bool tieneBoleto = false;
  bool esMayorDeEdad = true;

  // Ejemplo de AND (&&) - Ambos deben ser verdaderos
  bool puedeIngresar = tieneId && tieneBoleto;
  print('¿Puede ingresar al evento?: $puedeIngresar'); // false

  // Ejemplo de OR (||) - Al menos uno debe ser verdadero
  bool accesoPermitido = tieneBoleto || esMayorDeEdad;
  print('¿Tiene algún pase de acceso?: $accesoPermitido'); // true

  // Ejemplo de NOT (!) - Invierte el valor
  bool funcionCancelada = false;
  print('¿La función sigue en pie?: ${!funcionCancelada}'); // true
}

```

### Evaluación de circuito corto (Short-circuit evaluation)

Dart optimiza la ejecución de los operadores lógicos `&&` y `||` utilizando una estrategia llamada **evaluación de circuito corto**. Esto significa que el lenguaje evalúa las expresiones de izquierda a derecha y se detiene en el momento exacto en que el resultado final es predecible, sin necesidad de procesar el resto de la expresión.

* **Circuito corto en AND (`&&`):** Si el primer operando se evalúa como `false`, el resultado total de la operación será falso sin importar el valor del segundo operando. Dart no evalúa la segunda expresión.
* **Circuito corto en OR (`||`):** Si el primer operando se evalúa como `true`, el resultado total de la operación ya es obligatoriamente verdadero. Dart descarta la evaluación de la segunda expresión.

```text
Evaluación AND con circuito corto:
[ false ] && [ Expresión compleja que no se ejecutará ] ===> Retorna false inmediatamente

Evaluación OR con circuito corto:
[ true ]  || [ Expresión compleja que no se ejecutará ] ===> Retorna true inmediatamente

```

Esta característica es sumamente útil para prevenir errores en tiempo de ejecución, como evaluar si un objeto es nulo antes de acceder a sus propiedades:

```dart
void main() {
  String? nombre; // Variable con valor null

  // Gracias al circuito corto, Dart ve que 'nombre != null' es false
  // y no intenta evaluar 'nombre.length', evitando un error de ejecución.
  bool tieneTextoValido = nombre != null && nombre.length > 0;

  print('¿Tiene texto válido?: $tieneTextoValido'); // false

```

### Jerarquía y combinación de operadores lógicos

Al igual que con las operaciones matemáticas, existe un orden de precedencia estricto cuando se mezclan múltiples operadores lógicos en una misma línea de código:

1. Operador de negación (`!`)
2. Operador de conjunción (`&&`)
3. Operador de disyunción (`||`)

Los operadores aritméticos y relacionales tienen una precedencia mayor que los operadores lógicos. Por lo tanto, las matemáticas y las comparaciones se resuelven antes de aplicar la lógica booleana. Si se requiere alterar el orden de evaluación, se deben emplear paréntesis.

```dart
void main() {
  int edad = 25;
  bool VIP = false;

  // Sin paréntesis la evaluación es: (edad >= 18 && VIP) || true
  // 1. edad >= 18 es true.
  // 2. true && VIP (false) es false.
  // 3. false || true es true.
  bool caso1 = edad >= 18 && VIP || true;

  // Con paréntesis forzamos a evaluar primero el bloque de la derecha
  // 1. VIP || true es true.
  // 2. edad >= 18 es true.
  // 3. true && true es true.
  bool caso2 = edad >= 18 && (VIP || true);

  print('Caso 1: $caso1'); // true
  print('Caso 2: $caso2'); // true
}

```

## 3.4 Operadores de asignación

Los operadores de asignación se utilizan para almacenar valores en las variables. El operador más común y fundamental es el de asignación simple (`=`), pero Dart también proporciona una amplia variedad de operadores de asignación compuestos. Estos últimos combinan una operación aritmética o lógica con una asignación en un solo paso, lo que permite escribir código más compacto, limpio y fácil de leer.

### El operador de asignación simple (`=`)

El operador `=` toma el valor evaluado en el lado derecho (la expresión) y lo almacena en la variable situada en el lado izquierdo. Es importante recordar que la asignación siempre fluye de derecha a izquierda.

```dart
void main() {
  int puntuacion = 100; // Asigna el valor numérico 100 a la variable
  String usuario = 'Alex'; // Asigna la cadena de texto a la variable
}

```

### Operadores de asignación compuestos

Los operadores compuestos son abreviaciones sintácticas. Por ejemplo, en lugar de escribir `x = x + 5`, Dart permite escribir `x += 5`. Ambos comandos realizan exactamente la misma tarea en memoria, pero la segunda opción reduce la redundancia en el código.

A continuación se detallan los operadores de asignación compuestos más utilizados en Dart:

| Operador | Equivalencia | Descripción |
| --- | --- | --- |
| `+=` | `x = x + y` | Suma el valor de la derecha a la variable y guarda el resultado. |
| `-=` | `x = x - y` | Resta el valor de la derecha a la variable y guarda el resultado. |
| `*=` | `x = x * y` | Multiplica la variable por el valor de la derecha y guarda el resultado. |
| `/=` | `x = x / y` | Divide la variable por el valor de la derecha (requiere que la variable sea `double`). |
| `~/=` | `x = x ~/ y` | Realiza una división entera y guarda el resultado en la variable (`int`). |
| `%=` | `x = x % y` | Calcula el residuo de la división y lo guarda en la variable. |

El siguiente programa ilustra cómo mutar el valor de una variable utilizando estos operadores de manera secuencial:

```dart
void main() {
  double numero = 10.0;

  numero += 5;  // Equivalente a: numero = numero + 5 (15.0)
  print('Después de +=: $numero'); 

  numero -= 3;  // Equivalente a: numero = numero - 3 (12.0)
  print('Después de -=: $numero');

  numero *= 2;  // Equivalente a: numero = numero * 2 (24.0)
  print('Después de *=: $numero');

  numero /= 4;  // Equivalente a: numero = numero / 4 (6.0)
  print('Después de /=: $numero');
  
  int entero = 17;
  entero ~/= 3; // Equivalente a: entero = entero ~/ 3 (5)
  print('Después de ~/=: $entero');

  entero %= 3;  // Equivalente a: entero = entero % 3 (2)
  print('Después de %=: $entero');
}

```

### El operador de asignación compuesta nula (`??=`)

Dart introduce un operador de asignación único y sumamente potente vinculado a su sistema de seguridad nula (*Null Safety*): el operador `??=`.

Este operador asigna un valor a una variable **únicamente si esa variable es actualmente nula (`null`)**. Si la variable ya contiene un valor válido, la asignación se ignora por completo y el valor original se mantiene intacto.

```text
Expresión:   variable ??= valor
                 │
                 ├── ¿Es null? ──> SÍ ──> variable = valor
                 │
                 └── ¿Es null? ──> NO ──> Conserva su valor actual

```

Esta estructura es ideal para definir valores por defecto o inicializaciones perezosas:

```dart
void main() {
  String? nombre; // Al no estar inicializada, su valor es null

  // Como 'nombre' es null, se le asigna el valor 'Invitado'
  nombre ??= 'Invitado';
  print('Primer intento: $nombre'); // Imprime: Invitado

  // Como 'nombre' ya no es null (ahora vale 'Invitado'), el nuevo valor se ignora
  nombre ??= 'Usuario Registrado';
  print('Segundo intento: $nombre'); // Imprime: Invitado
}

```

## Resumen del capítulo

En este capítulo hemos explorado en profundidad las herramientas que ofrece Dart para manipular datos y construir expresiones lógicas y matemáticas:

* **Operadores aritméticos:** Permiten realizar cálculos matemáticos. Aprendimos la diferencia entre la división estándar (`/`), que siempre devuelve un `double`, y la división entera (`~/`), que devuelve un `int`. También analizamos el impacto de usar operadores de incremento/decremento en posición prefijo o posfijo.
* **Operadores relacionales:** Nos permiten comparar magnitudes e igualdades de expresiones, devolviendo siempre un valor booleano (`true` o `false`). Destacamos que la igualdad (`==`) invoca internamente un método sobre el objeto evaluado, facilitando comparaciones limpias sin requerir triples signos de igualdad.
* **Operadores lógicos:** Vimos cómo expandir nuestras condiciones combinando booleanos mediante AND (`&&`), OR (`||`) y NOT (`!`). Aprendimos el concepto de evaluación de circuito corto, una optimización clave para prevenir errores al inspeccionar objetos nulos.
* **Operadores de asignación:** Estudiamos cómo almacenar datos con el operador `=` y cómo simplificar operaciones matemáticas concurrentes usando asignaciones compuestas (`+=`, `-=`, etc.). Finalmente, descubrimos el operador `??=`, una pieza fundamental en el ecosistema de *Null Safety* para resguardar la asignación de variables con valores nulos.
