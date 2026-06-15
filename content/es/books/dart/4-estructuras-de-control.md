Un programa rara vez se ejecuta en línea recta. Para crear aplicaciones inteligentes, necesitas que tu código tome decisiones y repita tareas de forma eficiente. En este capítulo aprenderás a gobernar el flujo de tus programas en Dart. Descubrirás cómo evaluar condiciones usando `if`, `else` y la estructura `switch`. Además, dominarás la automatización de procesos mediante bucles `for`, `for-in`, `while` y `do-while`, y aprenderás a manipular estas repeticiones con precisión quirúrgica usando las instrucciones `break` y `continue`. Al dominar estas herramientas, transformarás líneas de código estáticas en algoritmos dinámicos, potentes y preparados para cualquier escenario.

## 4.1 Condicionales if y else

En el desarrollo de software, un programa rara vez se ejecuta de forma lineal de principio a fin. Lo habitual es que el código necesite tomar decisiones basadas en el estado de los datos en tiempo de ejecución. Las estructuras condicionales permiten ramificar el flujo del programa, ejecutando ciertos bloques de código solo si se cumplen condiciones específicas.

La herramienta fundamental para la toma de decisiones en Dart es la estructura `if` (si condicional) y su complemento `else` (en caso contrario).

### La estructura `if` básica

La declaración `if` evalúa una expresión booleana (una expresión que se resuelve estrictamente como `true` o `false`). Si el resultado de la evaluación es `true`, el bloque de código entre llaves `{}` inmediatamente posterior se ejecuta. Si es `false`, Dart ignora ese bloque y continúa con la ejecución del resto del programa.

```text
          [ Inicio ]
              │
              ▼
    ¿Condición verdadera? ──(No)──┐
              │                   │
             (Sí)                 │
              │                   │
              ▼                   │
    [ Bloque de código ]          │
              │                   │
              ▼                   │
      [ Resto del código ] <──────┘

```

La sintaxis en Dart es la siguiente:

```dart
void main() {
  int edad = 20;

  if (edad >= 18) {
    print('Eres mayor de edad.');
  }
}

```

> **Nota de sintaxis:** A diferencia de otros lenguajes de programación que permiten evaluar números o cadenas como valores de verdad (conceptos conocidos como *truthy* o *falsy*), Dart requiere estrictamente una expresión de tipo `bool` dentro del paréntesis del `if`. Colocar un entero o un objeto directamente allí provocará un error de compilación.

### La cláusula `else`

Con frecuencia, no solo querrás reaccionar cuando una condición sea verdadera, sino que también desearás definir una acción alternativa en caso de que sea falsa. Para esto se utiliza la palabra clave `else`.

```dart
void main() {
  int temperatura = 15;

  if (temperatura > 25) {
    print('Hace calor.');
  } else {
    print('El clima está fresco o frío.');
  }
}

```

En este escenario, ambos bloques son mutuamente excluyentes: se ejecutará el primero o el segundo, pero jamás ambos en una misma ejecución.

### Condicionales anidados y la estructura `else if`

Cuando existen más de dos caminos posibles, puedes encadenar múltiples evaluaciones utilizando la estructura `else if`. Dart evaluará las condiciones en orden descendente; en el momento en que encuentre una que se resuelva como `true`, ejecutará su bloque correspondiente y finalizará toda la estructura condicional, ignorando las evaluaciones restantes.

```dart
void main() {
  int calificacion = 85;

  if (calificacion >= 90) {
    print('Excelente (A)');
  } else if (calificacion >= 80) {
    print('Muy bueno (B)');
  } else if (calificacion >= 70) {
    print('Bueno (C)');
  } else {
    print('Necesita mejorar (F)');
  }
}

```

Puedes añadir tantos `else if` como requiera tu lógica de negocio, y cerrar opcionalmente con un único `else` para capturar cualquier caso que no haya cumplido ninguna de las condiciones previas.

### El Operador Condicional Ternario

Para asignaciones directas o decisiones muy simples que se pueden resolver en una sola línea, Dart ofrece una alternativa compacta al `if-else` tradicional: el operador ternario `? :`.

Su estructura es: `condición ? expresión_si_verdadero : expresión_si_falso;`

```dart
void main() {
  int hora = 19;
  
  // Si la hora es menor a 18, saludo es 'Buenos días', de lo contrario es 'Buenas noches'
  String saludo = (hora < 18) ? 'Buenos días' : 'Buenas noches';
  
  print(saludo); // Resultado: Buenas noches
}

```

Este operador es ideal para mantener el código limpio y legible, pero se recomienda evitar su uso anidado (un ternario dentro de otro ternario), ya que destruye la legibilidad del código rápidamente.

## 4.2 Estructura switch y case

Cuando necesitas evaluar una sola variable o expresión frente a múltiples valores posibles, encadenar demasiadas sentencias `if-else if` puede hacer que el código se vuelva extenso, repetitivo y difícil de leer. Para resolver este problema, Dart ofrece la estructura `switch`, la cual evalúa una expresión y transfiere el control del programa directamente al bloque `case` (caso) que coincida con el resultado obtenido.

### Sintaxis básica de `switch` y `case`

La estructura `switch` toma una expresión entre paréntesis y compara su valor internamente con cada uno de los literales definidos en las instrucciones `case`.

```text
           [ Expresión ]
                 │
      ┌──────────┼──────────┐
      ▼          ▼          ▼
  ¿Caso A?    ¿Caso B?   ¿Caso C?
      │          │          │
    (Sí)        (Sí)       (Sí)
      ▼          ▼          ▼
  [Bloque A] [Bloque B] [Bloque C]
      │          │          │
      └──────────┼──────────┘
                 │
                 ▼
        [ Resto del código ]

```

En las versiones modernas de Dart, la sintaxis estándar se escribe de la siguiente manera:

```dart
void main() {
  String estadoSemaforo = 'Amarillo';

  switch (estadoSemaforo) {
    case 'Verde':
      print('Avanzar.');
    case 'Amarillo':
      print('Precaución, bajando la velocidad.');
    case 'Rojo':
      print('Detenerse por completo.');
    default:
      print('Estado de semáforo no reconocido.');
  }
}

```

### Características clave en Dart moderno

Si vienes de otros lenguajes de programación como C, Java o JavaScript (e incluso de versiones antiguas de Dart), notarás un cambio crucial en el comportamiento de esta estructura:

* **Fin del *Fall-Through* implícito:** Históricamente, era obligatorio escribir la palabra clave `break` al final de cada `case` para evitar que el programa continuara ejecutando los casos de abajo de forma accidental. En Dart moderno, **el flujo se detiene automáticamente al terminar el bloque del caso coincidente**. Ya no es necesario rellenar el código con instrucciones `break`.
* **La cláusula `default`:** Funciona exactamente como el bloque `else` de un condicional. Si la expresión analizada no coincide con ninguno de los `case` especificados, se ejecutará el código dentro de `default`.
* **Evaluación exhaustiva:** Si estás evaluando tipos de datos con un número finito de valores (como las enumeraciones o *enums*, que estudiarás más adelante), Dart te exigirá cubrir todos los casos posibles. Si olvidas uno, el compilador generará un error a menos que uses la cláusula `default`.

### Agrupación de casos (*Fall-Through* explícito)

Habrá situaciones en las que querrás que diferentes valores ejecuten exactamente la misma pieza de código. Para lograr esto, puedes escribir múltiples sentencias `case` consecutivas sin añadir ninguna línea de código entre ellas:

```dart
void main() {
  String dia = 'Sábado';

  switch (dia) {
    case 'Lunes':
    case 'Martes':
    case 'Miércoles':
    case 'Jueves':
    case 'Viernes':
      print('Es un día laboral.');
    case 'Sábado':
    case 'Domingo':
      print('Es fin de semana.');
    default:
      print('Día inválido.');
  }
}

```

### Expresiones Switch (Sintaxis avanzada)

Dart permite utilizar `switch` no solo como una estructura de control de flujo, sino también como una **expresión** que devuelve un valor directo. Esta sintaxis es sumamente limpia y compacta, ideal para asignaciones de variables basadas en condiciones múltiples.

En una expresión `switch`, se utiliza una sintaxis de flecha (`=>`) y se omiten las palabras claves `case` y `default` (este último se reemplaza por el guion bajo `_`):

```dart
void main() {
  int mes = 2;

  // El switch evalúa y asigna el resultado directamente a la variable
  String estacion = switch (mes) {
    12 || 1 || 2 => 'Invierno',
    3 || 4 || 5  => 'Primavera',
    6 || 7 || 8  => 'Verano',
    9 || 10 || 11 => 'Otoño',
    _            => 'Mes desconocido' // Equivalente a default
  };

  print('La estación es: $estacion'); // Resultado: Invierno
}

```

> **Nota:** El operador `||` dentro del `switch` actúa como un conector lógico "O", permitiendo evaluar múltiples coincidencias en una sola línea de manera elegante.
>
## 4.3 Bucles for y for-in

En programación, la repetición es una de las tareas más comunes. Cuando necesitas ejecutar un bloque de código un número determinado de veces, o cuando deseas procesar uno a uno los elementos de una colección (como una lista), utilizas estructuras de repetición denominadas bucles o ciclos.

Dart ofrece varias opciones para controlar estas repeticiones. En esta sección nos enfocaremos en el bucle `for` tradicional y su variante especializada, el bucle `for-in`.

### El bucle `for` tradicional

El bucle `for` estándar se utiliza principalmente cuando conoces de antemano la cantidad exacta de veces que deseas repetir una acción. Su estructura se compone de tres partes fundamentales separadas por puntos y comas `;`:

1. **Inicialización:** Se ejecuta una sola vez al principio. Generalmente se usa para declarar e inicializar una variable de control (un contador).
2. **Condición:** Se evalúa antes de cada iteración. Si es `true`, el bloque de código se ejecuta; si es `false`, el bucle termina.
3. **Actualización:** Se ejecuta al final de cada iteración. Se usa para modificar (incrementar o decrementar) la variable de control.

```text
                  [ Inicio ]
                      │
                      ▼
             [ Inicialización ]
                      │
                      ▼
             ─►¿Condición true? ──(No)──┐
            │         │                 │
            │        (Sí)               │
            │         │                 │
            │         ▼                 │
            │  [Bloque de código]       │
            │         │                 │
            │         ▼                 │
            └── [Actualización]         │
                                        ▼
                               [ Fin del bucle ]

```

La sintaxis en Dart es la siguiente:

```dart
void main() {
  // Imprimir los números del 1 al 5
  for (int i = 1; i <= 5; i++) {
    print('Iteración número: $i');
  }
}

```

En este ejemplo:

* `int i = 1` inicializa el contador `i` en 1.
* `i <= 5` asegura que el bucle continúe mientras `i` sea menor o igual a 5.
* `i++` incrementa el valor de `i` en 1 al final de cada vuelta.

### El bucle `for-in`

Cuando trabajas con colecciones de datos, como las listas (que se estudiarán a fondo en el Capítulo 9), el bucle `for` tradicional puede resultar un poco engorroso porque te obliga a manejar índices numéricos manualmente. Para simplificar este proceso, Dart proporciona el bucle `for-in`.

El bucle `for-in` recorre automáticamente cada elemento de una colección de principio a fin, asignando el elemento actual a una variable temporal en cada iteración. No necesitas preocuparte por contadores ni por el tamaño de la colección.

```dart
void main() {
  List<String> videojuegos = ['Zelda', 'Mario', 'Metroid', 'Donkey Kong'];

  // Recorrido limpio de la lista usando for-in
  for (String juego in videojuegos) {
    print('Juego actual: $juego');
  }
}

```

La sintaxis se lee de forma muy natural: *"Para cada `juego` de tipo `String` dentro de la lista `videojuegos`, ejecuta el siguiente código"*.

### Comparativa: ¿Cuál deberías elegir?

* Usa el **bucle `for` tradicional** si necesitas conocer explícitamente la posición o el índice numérico de la iteración actual, o si quieres saltarte elementos (por ejemplo, avanzar de 2 en 2 con `i += 2`).
* Usa el **bucle `for-in`** siempre que necesites evaluar o procesar todos los elementos de una colección secuencialmente, ya que reduce la posibilidad de cometer errores de desbordamiento de índice y hace que tu código sea mucho más limpio y legible.

## 4.4 Bucles while y do-while

A diferencia del bucle `for`, que está diseñado principalmente para situaciones donde conoces de antemano el número de iteraciones, los bucles `while` y `do-while` se basan enteramente en una condición booleana. Se utilizan cuando no sabes con certeza cuántas veces se tendrá que repetir el bloque de código, sino que dependes de que una condición cambie durante la ejecución del programa.

### El bucle `while`

El bucle `while` (mientras) evalúa su condición **antes** de entrar al bloque de código. Si la condición es verdadera (`true`), ejecuta el bloque y vuelve a evaluar la condición. Este ciclo se repite hasta que la condición se vuelva falsa (`false`).

Si la condición se evalúa como falsa desde el primer intento, el bloque de código **nunca se ejecutará**.

```text
                  [ Inicio ]
                      │
                      ▼
             ─►¿Condición true? ──(No)──┐
            │         │                 │
            │        (Sí)               │
            │         │                 │
            │         ▼                 │
            └── [Bloque de código]      │
                                        ▼
                               [ Fin del bucle ]

```

A continuación se presenta un ejemplo de su sintaxis en Dart:

```dart
void main() {
  int energia = 3;

  // El bucle evalúa primero si hay energía disponible
  while (energia > 0) {
    print('El personaje está corriendo. Energía restante: $energia');
    energia--; // Modifica la condición para evitar un bucle infinito
  }

  print('El personaje se ha quedado sin energía.');
}

```

> **Peligro de bucle infinito:** Si olvidas modificar la variable que controla la condición (en este caso, `energia--`), la condición siempre será verdadera y el programa se quedará atrapado en un ciclo infinito, lo que congelará la aplicación o consumirá todos los recursos del sistema.

### El bucle `do-while`

El bucle `do-while` (hacer-mientras) es una variante del bucle `while`. La diferencia fundamental radica en que `do-while` evalúa la condición **al final** del bloque de código, no al principio.

Esto garantiza que el bloque de código **se ejecutará al menos una vez**, independientemente de si la condición es verdadera o falsa desde el inicio.

```text
                  [ Inicio ]
                      │
                      ▼
             ┌► [Bloque de código]
             │        │
             │        ▼
             └──¿Condición true?
                      │
                     (No)
                      │
                      ▼
               [ Fin del bucle ]

```

Veamos cómo se comporta en código:

```dart
void main() {
  int intentos = 0;

  // El bloque se ejecuta inmediatamente antes de evaluar la condición
  do {
    intentos++;
    print('Intento de conexión número: $intentos');
    
    // Simulación de una condición que cambia
  } while (intentos < 0); 

  print('Proceso finalizado.');
}

```

**Análisis del ejemplo:** Aunque la condición `intentos < 0` es falsa desde el principio (ya que `intentos` pasa a valer 1 tras la primera línea del bloque), el programa imprime el primer intento en la consola debido a que la evaluación se realiza en la base del ciclo.

### Resumen comparativo de estructuras de repetición

| Estructura | ¿Cuándo usarla? | Evaluación de la condición | Garantía de ejecuciones |
| --- | --- | --- | --- |
| **`for`** | Cuando sabes el número exacto de iteraciones. | Al inicio de cada vuelta. | 0 o más veces. |
| **`while`** | Cuando la repetición depende de una condición previa. | Al inicio de cada vuelta. | 0 o más veces. |
| **`do-while`** | Cuando necesitas que la acción ocurra al menos una vez antes de verificar. | Al final de cada vuelta. | 1 o más veces. |

## 4.5 Break y continue

Hasta ahora hemos visto cómo las estructuras de control dirigen el flujo de un programa basándose en condiciones y repeticiones predecibles. Sin embargo, en muchas ocasiones necesitarás alterar el comportamiento normal de un bucle de manera abrupta: ya sea porque encontraste el dato que buscabas y no tiene sentido seguir iterando, o porque deseas ignorar el elemento actual y pasar inmediatamente al siguiente.

Para estos escenarios de control fino, Dart proporciona dos palabras clave esenciales: `break` y `continue`.

### La instrucción `break`

La palabra clave `break` se utiliza para **abortar inmediatamente** la ejecución de un bucle (`for`, `for-in`, `while` o `do-while`). En el momento en que Dart encuentra un `break`, rompe el ciclo por completo y transfiere el control del programa a la primera línea de código que se encuentre justo después del bucle.

```text
    [ Inicio del bucle ]
             │
             ▼
     [ Código del bucle ]
             │
             ▼
     ¿Se encuentra break? ──(Sí)──┐
             │                    │
            (No)                  │
             │                    │
             ▼                    ▼
    [ Resto del bucle ]    [ Fuera del bucle ]

```

Veamos un ejemplo práctico donde buscamos un elemento en una lista y detenemos el proceso una vez hallado:

```dart
void main() {
  List<String> inventario = ['Espada', 'Escudo', 'Poción', 'Casco', 'Anillo'];

  for (String item in inventario) {
    print('Revisando: $item');

    if (item == 'Poción') {
      print('¡Poción encontrada! Deteniendo la búsqueda.');
      break; // Termina el bucle for-in de inmediato
    }
  }

  print('El programa continúa aquí tras romper el bucle.');
}

```

**Resultado en consola:**

```text
Revisando: Espada
Revisando: Escudo
Revisando: Poción
¡Poción encontrada! Deteniendo la búsqueda.
El programa continúa aquí tras romper el bucle.

```

*Nota que 'Casco' y 'Anillo' jamás llegaron a ser evaluados gracias al `break`.*

### La instrucción `continue`

A diferencia de `break`, la palabra clave `continue` no detiene el bucle por completo. Lo que hace es **saltarse el resto del código de la iteración actual** y saltar directamente a la siguiente vuelta del ciclo (en un bucle `for` ejecuta la actualización del contador; en un `while` vuelve a evaluar la condición).

Es sumamente útil para filtrar o ignorar datos específicos sin necesidad de envolver todo el bloque en estructuras `if` complejas.

```text
    [ Inicio del bucle ]
             │
             ▼
     [ Código del bucle ]
             │
             ▼
    ¿Se encuentra continue? ──(Sí)──┐
             │                      │
            (No)                    │
             │                      │
             ▼                      ▼
    [ Resto del bucle ]     [ Siguiente vuelta ]

```

En el siguiente ejemplo, queremos imprimir únicamente los números impares de una secuencia, saltándonos los pares:

```dart
void main() {
  for (int i = 1; i <= 5; i++) {
    if (i % 2 == 0) {
      // Si el número es par, se ignora el print de abajo y pasa al siguiente i
      continue; 
    }
    
    print('Número impar encontrado: $i');
  }
}

```

**Resultado en consola:**

```text
Número impar encontrado: 1
Número impar encontrado: 3
Número impar encontrado: 5

```

## Resumen del capítulo

En este **Capítulo 4: Estructuras de Control**, hemos aprendido a gobernar el flujo de ejecución de nuestras aplicaciones en Dart.

Comenzamos explorando la toma de decisiones binarias y múltiples mediante `if`, `else` y `else if`, junto con el práctico operador ternario para asignaciones rápidas. Luego, analizamos cómo la estructura `switch` y sus modernas expresiones nos permiten evaluar múltiples casos de forma limpia y exhaustiva sin la necesidad del viejo y propenso a errores *fall-through*.

Posteriormente, abordamos la repetición de tareas: implementamos el bucle `for` tradicional cuando conocemos el número de iteraciones, el bucle `for-in` para recorrer colecciones de forma segura, y los bucles `while` y `do-while` para ciclos guiados por condiciones booleanas cambiantes. Finalmente, dominamos el uso de `break` y `continue` para interrumpir bucles o saltar iteraciones de manera quirúrgica.

Con estas herramientas bajo tu control, ahora eres capaz de escribir algoritmos lógicos complejos, eficientes y adaptables a cualquier flujo de datos en Dart.
