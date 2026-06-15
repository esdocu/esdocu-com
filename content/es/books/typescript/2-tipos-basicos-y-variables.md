Para exprimir el potencial de TypeScript, es fundamental dominar cómo maneja la información en su nivel más elemental. En este capítulo, exploraremos los tipos primitivos `string`, `number` y `boolean`, herramientas esenciales para estructurar datos con precisión.

Analizaremos el control del ciclo de vida y la mutabilidad de variables mediante `let` y `const`, y descubriremos la inferencia de tipos, un mecanismo inteligente que automatiza el tipado sin saturar tu código. Finalmente, abordaremos el tipo `any` para comprender los riesgos de evadir el compilador y por qué debes evitarlo en favor de un desarrollo robusto y libre de errores en ejecución.

## 2.1 Tipos primitivos: string, number, boolean

En el núcleo de cualquier lenguaje de programación se encuentra la necesidad de representar datos básicos: texto, números y valores de verdad. JavaScript ya define estos valores, pero carece de un mecanismo nativo para garantizar que una variable destinada a guardar un número no termine conteniendo una cadena de texto. TypeScript resuelve esto introduciendo un sistema de tipado estático sobre los tipos primitivos heredados de JavaScript.

Los tres tipos primitivos fundamentales en TypeScript son `string`, `number` y `boolean`. Al ser tipos primitivos, se escriben completamente en minúsculas.

> **Nota de estilo:** Evita usar las versiones con mayúscula inicial (`String`, `Number`, `Boolean`). Estas últimas se refieren a los objetos envoltura (*wrapper objects*) de JavaScript y casi nunca son lo que deseas utilizar para tipar variables.

### El tipo `string`

El tipo `string` se utiliza para representar datos de texto o secuencias de caracteres. Al igual que en JavaScript, puedes definir cadenas de texto utilizando tres tipos de delimitadores:

* **Comillas dobles (`"..."`)**
* **Comillas simples (`'...'`)**
* **Plantillas literales o *template strings* (``...``)**

Las plantillas literales son especialmente útiles porque permiten la interpolación de expresiones mediante la sintaxis `${expresión}` y el formato multilínea.

```typescript
// Declaración implícita con anotación de tipo estricta
const nombre: string = "Valeria";
const apellido: string = 'García';

// Uso de template strings con interpolación
const edad: number = 28;
const presentacion: string = `Hola, mi nombre es ${nombre} ${apellido} y tengo ${edad} años.`;

```

### El tipo `number`

A diferencia de otros lenguajes de programación que distinguen entre números enteros (`int`) y números de punto flotante (`float` o `double`), TypeScript (siguiendo las especificaciones de JavaScript) almacena todos los números como valores de punto flotante de doble precisión (64 bits). Esto significa que tanto los enteros como los decimales comparten el mismo tipo: `number`.

Además de los valores decimales tradicionales, `number` admite notaciones en base binaria, octal y hexadecimal, así como los valores numéricos especiales `NaN` (Not a Number) e `Infinity`.

```typescript
// Números enteros y decimales
const entero: number = 42;
const decimal: number = 3.1416;

// Diferentes bases numéricas
const hexadecimal: number = 0xf00d; // Representa 61453 en base 10
const binario: number = 0b1010;       // Representa 10 en base 10
const octal: number = 0o744;         // Representa 484 en base 10

// Operaciones matemáticas inválidas que producen valores de tipo number
const noEsUnNumero: number = NaN;
const infinito: number = Infinity;

```

### El tipo `boolean`

El tipo `boolean` es el más simple de los tres, ya que solo puede aceptar dos valores lógicos: `true` (verdadero) y `false` (falso). Es la estructura base para el control de flujo, evaluaciones lógicas y condiciones.

```typescript
const esValido: boolean = true;
const tieneAcceso: boolean = false;

// Evaluaciones lógicas que resultan en un booleano
const esMayorDeEdad: boolean = edad >= 18;

```

### Garantía de tipo en tiempo de desarrollo

La principal ventaja de asignar explícitamente estos tipos es que el compilador de TypeScript actuará como una red de seguridad. Si intentas realizar una operación inválida o asignar un tipo de datos incorrecto, el editor te notificará el error inmediatamente sin necesidad de ejecutar el código.

El siguiente diagrama conceptual ilustra cómo interactúa el sistema de tipos de TypeScript ante asignaciones válidas e inválidas:

```text
    [ Valor: "Hola" ]  ───────> ¿Es un string? ───────> ( OK ) ───> Variable asignada
    
    [ Valor: 100 ]     ───────> ¿Es un string? ───────> [ Error de Compilación ]
                                                          "Type 'number' is not 
                                                           assignable to type 'string'."

```

A continuación se muestra un bloque de código que ejemplifica el comportamiento del compilador ante violaciones de tipo:

```typescript
let matricula: string;

matricula = "ABC-1234"; // Válido
// matricula = 98765;   // ERROR: El tipo 'number' no se puede asignar al tipo 'string'.

let precio: number;

precio = 19.99;        // Válido
// precio = "Gratis";  // ERROR: El tipo 'string' no se puede asignar al tipo 'number'.

let completado: boolean;

completado = true;      // Válido
// completado = "true"; // ERROR: El tipo 'string' no se puede asignar al tipo 'boolean'.

```

## 2.2 Declaración de variables: let y const

En JavaScript moderno y, por extensión, en TypeScript, la forma en que declaramos variables define el ciclo de vida, la mutabilidad y el alcance (*scope*) de los datos dentro de la aplicación. Para ello, el lenguaje nos proporciona dos palabras clave fundamentales: `let` y `const`.

Atrás quedó el uso de `var`, el cual introducía comportamientos impredecibles debido al alcance de función y al *hoisting* (elevación). TypeScript desaconseja su uso para alinearse con las mejores prácticas de desarrollo.

### Declaración con `let`

La palabra clave `let` se utiliza para declarar variables cuyo valor se planea reasignar a lo largo de la ejecución del programa. Su principal característica es que posee un **enfoque de bloque**, lo que significa que la variable solo existe dentro del par de llaves `{}` donde fue creada.

Al combinar `let` con las anotaciones de tipo de TypeScript, garantizamos que, aunque el valor cambie, el **tipo de dato** debe mantenerse estrictamente idéntico al declarado inicialmente.

```typescript
let contador: number = 0;

// Reasignación válida: el nuevo valor sigue siendo un número
contador = 1;
contador = contador + 5;

// Intento de reasignación inválida
// contador = "dos"; // ERROR: El tipo 'string' no se puede asignar al tipo 'number'.

```

El alcance de bloque evita la contaminación de variables en estructuras condicionales o bucles:

```typescript
let usuarioActivo: boolean = true;

if (usuarioActivo) {
    let mensajeTemporal: string = "Bienvenido de nuevo";
    console.log(mensajeTemporal); // Válido
}

// console.log(mensajeTemporal); 
// ERROR: No se puede encontrar el nombre 'mensajeTemporal' (está fuera de su bloque).

```

### Declaración con `const`

La palabra clave `const` se utiliza para declarar constantes, es decir, variables cuyo valor se asigna una sola vez al momento de su definición y no puede ser modificado ni reasignado posteriormente. Al igual que `let`, `const` tiene un alcance de bloque.

```typescript
const PI: number = 3.14159;
const URL_API: string = "https://api.miweb.com/v1";

// Intento de reasignación
// PI = 3.14; // ERROR: Cannot assign to 'PI' because it is a constant.

```

Debido a que una constante no puede cambiar de valor, TypeScript requiere obligatoriamente que se le asigne un valor en la misma línea en la que se declara.

```typescript
// const PUERTO: number; 
// ERROR: Las declaraciones 'const' deben inicializarse.

```

### Mutabilidad en objetos y arreglos con `const`

Es un error común asumir que `const` hace que todo sea completamente inmutable. Cuando aplicas `const` a una estructura compleja, como un objeto o un arreglo, lo que queda protegido es la **referencia** de la variable, no el contenido interno de la estructura.

El siguiente diagrama ilustra cómo la referencia permanece fija a la dirección de memoria, pero las propiedades internas pueden mutar:

```text
 Constante 'usuario' ───> [ Referencia Fija en Memoria ]
                                  │
                                  ├──> propiedad 'nombre'  (Puede cambiar)
                                  └──> propiedad 'creditos' (Puede cambiar)

```

En el siguiente bloque de código se puede apreciar este comportamiento en detalle:

```typescript
// Declaración de un objeto con const (los detalles de objetos se verán en el Cap. 5)
const perfilUsuario = {
    nombre: "Carlos",
    puntos: 150
};

// VÁLIDO: Modificar las propiedades internas del objeto está permitido
perfilUsuario.nombre = "Carlos Alberto";
perfilUsuario.puntos = 200;

// ERROR: No se puede reasignar la variable a un objeto completamente nuevo
// perfilUsuario = { nombre: "Ana", puntos: 300 }; 
// ERROR: Cannot assign to 'perfilUsuario' because it is a constant.

```

### Resumen de diferencias clave

Para determinar cuándo utilizar cada palabra clave en TypeScript, puedes guiarte por la siguiente tabla comparativa:

| Característica | `let` | `const` |
| --- | --- | --- |
| **Alcance (*Scope*)** | Bloque `{}` | Bloque `{}` |
| **Permite Reasignación** | Sí | No |
| **Inicialización Obligatoria** | No | Sí |
| **Protección de Tipo** | Sí (mantiene el tipo inicial) | Sí (mantiene el tipo inicial) |

> **Regla general de desarrollo:** Por defecto, declara siempre tus variables con `const`. Cambia a `let` únicamente cuando tengas la certeza absoluta de que el valor de la variable necesitará ser reasignado en el futuro. Esto reduce los efectos secundarios y hace que tu código sea más predecible.
>
## 2.3 Inferencia de tipos en TypeScript

Hasta ahora hemos visto cómo indicar explícitamente el tipo de una variable utilizando anotaciones de tipo (por ejemplo, `: string` o `: number`). Sin embargo, una de las características más potentes y elegantes de TypeScript es su capacidad para deducir el tipo de datos de forma automática. Este mecanismo se conoce como **inferencia de tipos**.

La inferencia de tipos permite escribir código más limpio, fluido y menos redundante, manteniendo exactamente la misma seguridad y robustez que si hubieras tipado cada línea manualmente.

### ¿Cómo funciona la inferencia básica?

Cuando declaras una variable y la inicializas con un valor en la misma línea, el compilador de TypeScript examina el lado derecho de la expresión, identifica el tipo de dato del valor asignado y fija ese tipo para la variable de manera permanente.

```typescript
// No hemos añadido una anotación de tipo, pero TypeScript infiere que es un 'string'
let mensaje = "Operación exitosa"; 

// TypeScript sabe que 'mensaje' es un string, por lo que nos permite usar sus métodos nativos
let longitud = mensaje.length; 

// Intento de asignar un tipo diferente
// mensaje = 404; // ERROR: El tipo 'number' no se puede asignar al tipo 'string'.

```

En el ejemplo anterior, aunque no se escribió explícitamente `: string`, el compilador se comporta exactamente como si estuviera ahí. Si pasas el cursor sobre la variable `mensaje` en tu editor de código, verás que TypeScript la reconoce internamente como `let mensaje: string`.

### Inferencia en `let` vs. `const`

El compilador aplica la inferencia de forma sutilmente diferente dependiendo de si utilizas `let` o `const`. Esto se debe a la naturaleza mutable o inmutable de cada palabra clave.

#### 1. Inferencia con `let`

Como una variable declarada con `let` puede cambiar de valor en el futuro, TypeScript infiere el tipo primitivo general (`string`, `number`, `boolean`).

```typescript
let nombre = "Sofía"; // Tipo inferido: string
nombre = "Lucas";     // Válido: sigue siendo un string

```

#### 2. Inferencia con `const`

Como una constante nunca puede cambiar su valor, TypeScript aplica una inferencia mucho más estricta conocida como **tipo literal**. El tipo ya no es el tipo general (como `string`), sino el valor exacto de la constante.

```typescript
const pais = "Argentina"; // Tipo inferido: "Argentina" (un tipo literal específico)

```

El siguiente diagrama muestra cómo el compilador bifurca su criterio de inferencia según el contenedor del valor:

```text
                  ┌───> Con 'let' ───> Infiere Tipo General ───> string
                  │
 [ Valor: "Hola" ]┤
                  │
                  └───> Con 'const' ──> Infiere Tipo Literal ──> "Hola"

```

### El peligro de la asignación tardía (Inferencia Tipo `any`)

La inferencia de tipos solo funciona de forma óptima si inicializas la variable en el mismo momento en que la declaras. Si creas una variable con `let` pero no le asignas un valor inmediato, TypeScript no tiene información suficiente para deducir su tipo. En ese caso, le asignará temporalmente el tipo `any` (cualquiera), desactivando el control estricto de tipos.

```typescript
let resultado; // Tipo inferido: any (Peligro: acepta cualquier tipo de dato)

resultado = "Aprobado"; // Funciona como string
resultado = true;       // Funciona como boolean sin lanzar errores

```

> **Regla de oro:** Si vas a inicializar tu variable en la misma línea de su declaración, confía en la inferencia de tipos y no escribas anotaciones redundantes. Si vas a declarar la variable ahora pero asignarás su valor más adelante, añade siempre una anotación de tipo explícita (`let resultado: string;`).

### Beneficios de la inferencia

* **Legibilidad:** El código se vuelve mucho más limpio y cercano a JavaScript puro, libre de anotaciones visuales innecesarias.
* **Mantenibilidad:** Si cambias la firma de una función o el valor de una constante en el futuro, las variables dependientes actualizarán sus tipos deducidos automáticamente sin que tengas que refactorizar cada declaración a mano.
* **Productividad:** Sigues disfrutando de la ayuda del autocompletado (*IntelliSense*) y la detección de errores en tiempo real en tu editor de texto, trabajando de manera rápida y segura.

## 2.4 El tipo any y por qué debes evitarlo

El tipo `any` es un tipo de dato especial en TypeScript que actúa como un "comodín" o una vía de escape al sistema de tipado estático. Cuando una variable se define con el tipo `any`, el compilador de TypeScript suspende por completo la validación de tipos sobre ella, permitiéndole almacenar cualquier tipo de valor y aceptar cualquier operación, por destructiva o errónea que sea.

Aunque puede parecer una herramienta útil para resolver errores de compilación rápidamente, el uso indiscriminado de `any` contradice el propósito fundamental de utilizar TypeScript.

### ¿Cómo funciona el tipo `any`?

Cuando tipas algo como `any`, le estás diciendo explícitamente al compilador: *"No analices este fragmento de código, sé lo que estoy haciendo"*. Como consecuencia, TypeScript asumirá que todas las propiedades, métodos o llamadas asociadas a esa variable son completamente válidos en tiempo de desarrollo, trasladando cualquier posible fallo al tiempo de ejecución.

```typescript
let datoComodin: any = "Hola Mundo";

// Ambas operaciones compilan sin problemas, a pesar de ser contradictorias
datoComodin = 42; 
datoComodin = false;

// Intentar acceder a propiedades inexistentes o invocar métodos falsos
datoComodin.metodoInexistente(); // Compila con éxito, pero fallará en el navegador
console.log(datoComodin.nombre.apellido); // Compila con éxito, pero lanzará un error de ejecución

```

### ¿Por qué debes evitarlo?

El uso de `any` introduce varios problemas críticos en la salud de una base de código:

1. **Pérdida total de la seguridad de tipos:** Tu código vuelve a comportarse como JavaScript puro y dinámico. Los errores tipográficos o de lógica que TypeScript normalmente detectaría al instante pasarán desapercibidos hasta que el código se ejecute.
2. **Destrucción del autocompletado (*IntelliSense*):** Al no conocer la estructura real del dato, el editor de código no podrá sugerirte métodos ni propiedades válidas, reduciendo tu productividad.
3. **Falsa sensación de seguridad:** Un archivo puede compilar con cero errores aparentes, pero estar lleno de excepciones invisibles que romperán la aplicación frente al usuario final.

El siguiente flujo muestra cómo el tipo `any` rompe la cadena de protección y propaga la incertidumbre a otras variables limpias de tu programa:

```text
               [ Variable 'any' ]  ───> Desactiva validaciones del compilador
                        │
                        ├───────> Permite invocar métodos rotos (Fallo en producción)
                        │
                        └───────> Asignada a variable 'string' ───> Envenena tipos sanos

```

Observa este comportamiento de "envenenamiento" o propagación en el siguiente bloque de código:

```typescript
function obtenerInformacionSucia(): any {
    return 100; // Devuelve un número, pero el tipo declarado es any
}

let datoSucio = obtenerInformacionSucia();
let nombreUsuario: string = datoSucio; // ¡TypeScript lo permite porque datoSucio es 'any'!

// El compilador cree que 'nombreUsuario' es un string, pero en realidad contiene un número.
// La siguiente línea compila, pero fallará estrepitosamente en el navegador:
console.log(nombreUsuario.toUpperCase()); 

```

### Cuándo se permite (excepcionalmente) usar `any`

Existen escenarios muy limitados donde te encontrarás con `any`, principalmente vinculados a la migración o la interoperabilidad:

* **Migración gradual de proyectos:** Cuando estás convirtiendo una base de código grande de JavaScript a TypeScript y necesitas que los archivos compilen antes de poder refinar los tipos detalladamente.
* **Consumo de librerías externas de terceros:** Cuando utilizas librerías antiguas de JavaScript que no cuentan con archivos de definición de tipos (`.d.ts`).

> **Consejo proactivo:** En TypeScript moderno, cuando realmente desconoces el tipo de un dato que viene del exterior (como una API pública), es drásticamente mejor utilizar el tipo primitivo `unknown` en lugar de `any`. `unknown` te obliga a verificar el tipo de dato mediante código de control antes de permitirte operar con él, manteniendo a salvo la seguridad de tu aplicación.

## Resumen del capítulo

En este **Capítulo 2: Tipos Básicos y Variables**, hemos sentado las bases operativas del sistema de tipos de TypeScript:

* **Tipos Primitivos:** Aprendimos a utilizar `string`, `number` y `boolean` en minúsculas para representar texto, números de punto flotante de doble precisión y valores lógicos respectivamente.
* **Declaración Eficiente:** Comprendimos el alcance de bloque de `let` y `const`, adoptando la buena práctica de usar `const` por defecto para asegurar la estabilidad de las referencias y mitigar efectos secundarios.
* **Inferencia de Tipos:** Descubrimos cómo TypeScript deduce de forma inteligente los tipos generales o literales según el contexto, permitiéndonos escribir código limpio sin redundancias visuales.
* **El Riesgo de `any`:** Analizamos el peligro de desactivar el compilador mediante el tipo comodín `any` y la importancia de evitarlo para preservar la predictibilidad del software.
