JavaScript permite mezclar datos libremente en colecciones, lo que facilita la aparición de errores silenciosos. En este capítulo, aprenderás a dominar las colecciones de datos en TypeScript para escribir código robusto y predecible.

Exploraremos los arreglos tipados para garantizar colecciones homogéneas y seguras, y descubriremos el poder de las tuplas para definir estructuras de longitud fija con tipos específicos por posición. Finalmente, estudiaremos las enumeraciones numéricas y de cadena, una herramienta clave para estructurar conjuntos de constantes con nombre que mejoran drásticamente la legibilidad y el mantenimiento de tus aplicaciones.

## 3.1 Declaración y uso de arreglos tipados

En JavaScript, los arreglos son estructuras dinámicas y flexibles que pueden contener cualquier mezcla de datos de forma simultánea: números, cadenas de texto, objetos o incluso funciones. Aunque esta flexibilidad resulta cómoda en scripts pequeños, en aplicaciones de gran escala introduce una fuente constante de errores difíciles de rastrear en tiempo de ejecución.

TypeScript resuelve este problema extendiendo la sintaxis de JavaScript para permitir la definición de **arreglos tipados**. Un arreglo tipado garantiza que todos los elementos de la colección pertenezcan estrictamente al mismo tipo de dato, permitiendo al compilador detectar incoherencias antes de que el código sea ejecutado.

### Sintaxis de declaración

TypeScript ofrece dos sintaxis equivalentes para declarar el tipo de un arreglo. Ambas son válidas y producen exactamente el mismo resultado en el código compilado, por lo que la elección de una u otra suele depender de las guías de estilo de cada equipo de desarrollo.

#### 1. Sintaxis de corchetes (`tipo[]`)

Es la sintaxis más común y la más compacta. Consiste en escribir el tipo de dato que contendrá el arreglo seguido inmediatamente por un par de corchetes rectos.

```typescript
let edades: number[] = [25, 30, 18, 42];
let lenguajes: string[] = ["TypeScript", "JavaScript", "Rust"];

```

#### 2. Sintaxis genérica (`Array<tipo>`)

Esta alternativa utiliza una notación basada en tipos genéricos (un concepto que se detallará formalmente en el Capítulo 9). Utiliza la palabra clave `Array` seguida del tipo de dato encerrado entre signos de menor y mayor que (`< >`).

```typescript
let puntuaciones: Array<number> = [95, 88, 100];
let nombres: Array<string> = ["Ana", "Carlos", "Sofía"];

```

#### Representación en memoria de la restricción de tipo

```text
Sintaxis: string[] o Array<string>

Índice:       0          1          2
          +----------+----------+----------+
Arreglo:  |  "Ana"   | "Carlos" | "Sofía"  |
          +----------+----------+----------+
Valor:      string     string     string

Operación let x = nombres[0]; -> TypeScript sabe que 'x' es de tipo string.

```

### Inferencia de tipos en arreglos

Si declaras e inicializas un arreglo en la misma línea sin especificar explícitamente su tipo, TypeScript activará su mecanismo de inferencia (visto en la sección 2.3). El compilador analizará los elementos iniciales para deducir el tipo del arreglo.

```typescript
// TypeScript infiere automáticamente que el tipo es 'boolean[]'
let respuestas = [true, false, true];

// Intentar agregar un tipo diferente provocará un error de compilación
// Error: El argumento de tipo 'string' no asignable al parámetro de tipo 'boolean'.
respuestas.push("no"); 

```

### Seguridad en operaciones comunes

Una de las mayores ventajas de los arreglos tipados es que el compilador de TypeScript valida todas las mutaciones e interacciones con la estructura, protegiendo métodos nativos de JavaScript como `.push()`, `.unshift()` o la asignación directa por índice.

```typescript
let precios: number[] = [10.5, 99.9, 5.0];

// Operación válida: se añade otro número
precios.push(45.0);

// Operación inválida por índice: se intenta asignar un string
// Error: El tipo 'string' no es asignable al tipo 'number'.
precios[1] = "cien"; 

```

### Lectura de elementos y métodos de orden superior

Al acceder a los elementos de un arreglo tipado, TypeScript realiza un seguimiento estricto del tipo de dato extraído. Esto significa que dispondrás de autocompletado inteligente (IntelliSense) y validación de métodos específicos para el tipo de dato en cuestión al iterar o manipular la colección.

Cuando utilizas métodos de orden superior como `.map()`, `.filter()` o `.reduce()`, TypeScript infiere el tipo de las variables del callback basándose en el tipo del arreglo original:

```typescript
let frutas: string[] = ["manzana", "plátano", "pera"];

// TypeScript sabe que el parámetro 'fruta' dentro de la función es un 'string'
let frutasEnMayuscula = frutas.map((fruta) => {
    // Tenemos acceso seguro a todos los métodos de string
    return fruta.toUpperCase(); 
});

// El compilador infiere que 'frutasEnMayuscula' es de tipo 'string[]'

```

### Arreglos de solo lectura (`ReadonlyArray`)

Existen escenarios donde necesitas asegurar la inmutabilidad de una colección, impidiendo que el arreglo sea modificado tras su creación. TypeScript proporciona el tipo `ReadonlyArray<tipo>` o el modificador `readonly tipo[]` para este propósito.

Al declarar un arreglo como de solo lectura, el compilador eliminará de su interfaz todos los métodos mutables (como `.push()`, `.pop()`, `.splice()`, `.sort()`), dejando únicamente los métodos de consulta segura.

```typescript
let configuracionFija: readonly string[] = ["dark-mode", "es-AR"];

// Cualquier intento de mutación fallará en tiempo de compilación:
// Error: La propiedad 'push' no existe en el tipo 'readonly string[]'.
configuracionFija.push("admin");

// Error: El índice de solo lectura no permite asignación.
configuracionFija[0] = "light-mode"; 

// Las operaciones de lectura siguen estando permitidas
console.log(configuracionFija.length);

```

## 3.2 Introducción a las tuplas

Mientras que los arreglos tipados (vistos en la sección anterior) nos permiten agrupar colecciones de elementos homogéneos donde la longitud puede variar de forma dinámica, las **tuplas** resuelven una necesidad diferente. Una tupla en TypeScript es un tipo especial de arreglo con un **número fijo de elementos** donde cada posición tiene un **tipo de dato conocido y específico**.

Esto permite modelar estructuras de datos estructuradas y heterogéneas, donde la posición de cada valor determina de forma estricta su significado semántico dentro del programa.

### Sintaxis y declaración de una tupla

La declaración de una tupla se realiza utilizando corchetes, pero a diferencia de los arreglos tradicionales, especificamos una lista ordenada de tipos separados por comas. Cada uno de estos tipos corresponderá exactamente a la posición del elemento en el arreglo real.

```typescript
// Declaración de una tupla que representa una coordenada geográfica: [latitud, longitud]
let coordenada: [number, number];
coordenada = [-34.6037, -58.3816]; // Válido

// Declaración de una tupla que representa un producto: [id, nombre, precio, disponible]
let producto: [number, string, number, boolean] = [101, "Monitor 24 pulgadas", 180, true];

```

Si intentas inicializar la tupla con un orden de tipos incorrecto o con una cantidad diferente de elementos a la declarada, el compilador generará un error de forma inmediata:

```typescript
// Error: El tipo 'string' no es asignable al tipo 'number'
let cliente: [number, string] = ["Juan", 45]; 

// Error: El tipo '[number, string, string]' no es asignable al tipo '[number, string]'
// La fuente tiene 3 elementos pero el objetivo solo permite 2.
let usuario: [number, string] = [1, "admin", "activo"]; 

```

### Acceso y asignación segura

Al acceder a los componentes de una tupla mediante su índice, TypeScript reconoce con precisión milimétrica el tipo de dato asignado a esa posición exacta. Esto habilita las validaciones estáticas y el autocompletado nativo según el elemento recuperado.

```typescript
let registro: [string, number] = ["Temperatura", 24];

let etiqueta = registro[0]; // TypeScript infiere que 'etiqueta' es un string
let valor = registro[1];    // TypeScript infiere que 'valor' es un number

// Operaciones válidas basadas en el tipo de cada posición:
console.log(etiqueta.toLowerCase());
console.log(valor.toFixed(2));

```

### Desestructuración de tuplas

Al igual que con los arreglos estándar de JavaScript, las tuplas admiten el patrón de desestructuración. Esta es una de las maneras más limpias y legibles de extraer sus valores internos, manteniendo intacto el tipado estático de cada variable resultante:

```typescript
let respuestaHTTP: [number, string] = [200, "Éxito"];

// Desestructuración limpia de la tupla
const [codigo, mensaje] = respuestaHTTP;

// 'codigo' mantiene el tipo number; 'mensaje' mantiene el tipo string
console.log(`Error ${codigo}: ${mensaje.toUpperCase()}`);

```

### Comportamiento frente a métodos mutables y el "problema" de `push`

Un detalle técnico de crucial importancia que debes tener en cuenta es que, bajo el capó en tiempo de ejecución, las tuplas se compilan como arreglos ordinarios de JavaScript. Esto significa que métodos nativos como `.push()` o `.pop()` siguen estando accesibles en la interfaz de la tupla.

Históricamente, esto representa una sutil limitación en la verificación estática de TypeScript, ya que permite añadir elementos extra a la tupla sin generar un error inmediato en el método de mutación:

```typescript
let punto: [number, number] = [10, 20];

// TypeScript permite la mutación mediante métodos del prototipo Array
punto.push(30); 

console.log(punto); // Imprime [10, 20, 30] en tiempo de ejecución

```

> **Nota de seguridad:** Aunque `.push()` inserte un nuevo valor, TypeScript seguirá restringiendo el acceso directo por índice para elementos que excedan el límite original de la tupla. Si intentas leer `punto[2]`, el compilador arrojará un error indicando que la tupla de longitud 2 no tiene un elemento en el índice 2.

### Tuplas de solo lectura (`readonly`)

Para blindar por completo la inmutabilidad de una tupla y neutralizar el comportamiento de métodos como `.push()`, la mejor práctica consiste en anteponer el modificador `readonly`. Esto asegura de manera estricta que la longitud y los valores de la tupla permanezcan inalterables.

```typescript
let configuracionBD: readonly [string, number] = ["localhost", 5432];

// Error: La propiedad 'push' no existe en el tipo 'readonly [string, number]'
configuracionBD.push("extra"); 

// Error: El índice de solo lectura no permite asignación
configuracionBD[1] = 3306; 

```

### Casos de uso comunes

Las tuplas son herramientas ideales para escenarios específicos de desarrollo donde los objetos con propiedades explícitas (`{ lat: number, lng: number }`) añaden demasiada verbosidad innecesaria. Algunos ejemplos comunes son:

* **Valores devueltos por funciones:** Ideal cuando una función necesita retornar un par de datos relacionados (por ejemplo, el patrón `[resultado, error]` o los hooks de estado en frameworks modernos).
* **Representaciones matemáticas:** Coordenadas `[x, y, z]`, matrices o vectores de dimensiones fijas.
* **Líneas de datos CSV/Tabulares:** Modelar el procesamiento de filas de bases de datos o archivos estructurados donde el orden de las columnas es inmutable.

## 3.3 Enumeraciones numéricas y de cadena

En el desarrollo de software, es sumamente común trabajar con conjuntos de valores relacionados que representan un grupo de opciones fijas, como los días de la semana, los estados de una petición HTTP o los roles de un usuario. En JavaScript puro, estos conjuntos suelen resolverse mediante objetos planos llenos de constantes. Sin embargo, JavaScript no impide que se asignen valores inválidos fuera de ese objeto en otras partes del programa.

TypeScript introduce las **enumeraciones** (o `enum`) para resolver este problema. Un `enum` es una característica estructural especial que permite definir un conjunto de constantes con nombre, proporcionando tanto validación estática en tiempo de compilación como una representación real en el código JavaScript resultante.

### Enumeraciones numéricas

Por defecto, si no se especifica un valor para los miembros de un `enum`, TypeScript los tratará como **enumeraciones numéricas**. Al primer miembro se le asigna automáticamente el valor `0`, y a cada miembro subsiguiente se le incrementa el valor en `1`.

```typescript
enum EstadoReserva {
    Pendiente,  // Evaluará a 0
    Confirmada, // Evaluará a 1
    Cancelada   // Evaluará a 2
}

let estadoActual: EstadoReserva = EstadoReserva.Pendiente;
console.log(estadoActual); // Imprime: 0

```

#### Inicialización personalizada

Es posible romper la asignación por defecto inicializando cualquiera de los miembros con un número específico. Los elementos siguientes que no estén inicializados continuarán el incremento automático a partir de ese número.

```typescript
enum CodigoEstado {
    Exito = 200,
    Creado = 201,
    BadRequest = 400,
    NoAutorizado,    // Incrementa automáticamente a 401
    NoEncontrado = 404
}

let respuesta: CodigoEstado = CodigoEstado.NoAutorizado;
console.log(respuesta); // Imprime: 401

```

#### Mapeo inverso (Reverse Mapping)

Una propiedad única de las enumeraciones numéricas es el **mapeo inverso**. TypeScript compila estos enums de manera que puedas obtener tanto el valor numérico a partir del nombre del miembro, como el nombre del miembro a partir de su valor numérico.

```typescript
enum Direccion {
    Norte,
    Sur,
    Este,
    Oeste
}

let valorNorte = Direccion.Norte; // 0
let nombreNorte = Direccion[0];   // "Norte"

console.log(`La dirección es ${nombreNorte} con código ${valorNorte}`);

```

### Enumeraciones de cadena (String Enums)

Las enumeraciones de cadena son una alternativa excelente cuando necesitas que los valores en tiempo de ejecución sean legibles, explícitos y semánticos. En un `enum` de cadena, cada miembro debe ser inicializado obligatoriamente con un literal de cadena de texto o con otro miembro del mismo enum.

A diferencia de los numéricos, los enums de cadena **no tienen incremento automático** ni admiten el mapeo inverso, pero ofrecen un valor de depuración mucho más claro cuando se registran en bases de datos o en la consola del navegador.

```typescript
enum RolUsuario {
    Administrador = "ADMIN",
    Editor = "EDITOR",
    Invitado = "GUEST"
}

let miRol: RolUsuario = RolUsuario.Administrador;
console.log(miRol); // Imprime: "ADMIN"

```

```text
Diferencia en tiempo de ejecución (Consola/Logs):

EstadoReserva.Pendiente --------> Imprime: 0        (Numérico)
RolUsuario.Administrador -------> Imprime: "ADMIN"  (Cadena)

```

### Validación estática con Enums

El beneficio principal de usar enums es la restricción estricta de asignación. Una vez definido un tipo `enum`, TypeScript impedirá que asignes cualquier valor que no pertenezca a la estructura declarada.

```typescript
enum Tema {
    Claro = "LIGHT",
    Oscuro = "DARK"
}

function cambiarTema(nuevoTema: Tema) {
    console.log(`Cambiando a modo: ${nuevoTema}`);
}

// Operación válida
cambiarTema(Tema.Oscuro);

// Operación inválida: produce un error de compilación
// Error: El argumento de tipo '"DARK"' no es asignable al parámetro de tipo 'Tema'.
cambiarTema("DARK"); 

```

> **Nota importante:** Aunque la cadena `"DARK"` tenga exactamente el mismo valor que el miembro del enum, TypeScript protege la seguridad del tipo exigiendo el uso explícito de la estructura `Tema.Oscuro`.

### Enumeraciones constantes (`const enum`)

Cuando TypeScript compila un `enum` tradicional, genera un objeto JavaScript real en el archivo final de salida. Si buscas optimizar el rendimiento y el tamaño del archivo resultante eliminando ese objeto del código compilado, puedes utilizar un **`const enum`**.

Los `const enum` se eliminan por completo durante la compilación. TypeScript reemplaza cada referencia al enum directamente por su valor literal inline.

```typescript
const enum Talla {
    Chica = "S",
    Mediana = "M",
    Grande = "L"
}

let miTalla = Talla.Mediana;

```

Si revisamos el código JavaScript generado por el compilador para la declaración anterior, observamos un resultado sumamente limpio y optimizado:

```javascript
// Código JavaScript compilado resultante:
let miTalla = "M"; // El objeto 'Talla' desapareció por completo

```

> **Cuándo usar cada uno:** Usa enums estándar si necesitas iterar sobre sus llaves en tiempo de ejecución o necesitas mapeo inverso. Usa `const enum` si solo los requieres para validación de constantes en tiempo de desarrollo y deseas la máxima optimización en el código JavaScript final.
>
## 3.4 Arreglos multidimensionales

En el desarrollo de aplicaciones, las colecciones lineales de datos muchas veces se quedan cortas. Cuando necesitas modelar estructuras más complejas como tablas de datos, matrices matemáticas, mapas de coordenadas o el tablero de un juego (como el ajedrez o el tres en línea), requieres almacenar un arreglo dentro de otro arreglo. Estas estructuras se conocen como **arreglos multidimensionales**.

TypeScript extiende sus capacidades de tipado estático a estas estructuras complejas, permitiendo definir con total precisión el tipo de dato alojado en cualquier nivel de profundidad de la matriz.

### Sintaxis y declaración

Para declarar un arreglo multidimensional utilizando la **sintaxis de corchetes**, simplemente debes encadenar tantos pares de corchetes (`[]`) como niveles de profundidad o dimensiones tenga tu estructura.

```typescript
// Arreglo de dos dimensiones (Matriz bidimensional)
let matrizBidimensional: number[][] = [
    [1, 2, 3],
    [4, 5, 6]
];

// Arreglo de tres dimensiones (Matriz tridimensional)
let cuboDeDatos: number[][][] = [
    [
        [1, 2], [3, 4]
    ],
    [
        [5, 6], [7, 8]
    ]
];

```

Si prefieres trabajar con la **sintaxis genérica** (`Array<tipo>`), la declaración requiere anidar las palabras clave de forma recursiva, lo cual suele ser menos compacto pero igualmente válido:

```typescript
// Equivalente exacto a number[][]
let tabla: Array<Array<number>> = [
    [10, 20],
    [30, 40]
];

```

### Inicialización y control de tipos

El compilador de TypeScript valida rigurosamente que cada fila y columna cumpla con la firma del tipo establecido. Si intentas insertar un tipo de dato incorrecto o un nivel de anidamiento inconsistente, se generará un error en tiempo de compilación.

```typescript
let tableroJuego: string[][] = [
    ["X", "O", "X"],
    ["O", "X", "O"],
    ["O", "X", " "]
];

// Error: El tipo 'number' no es asignable al tipo 'string'.
tableroJuego[0][1] = 5; 

// Error: El tipo 'string' no es asignable al tipo 'string[]'.
// Se intentó asignar una cadena directamente en una fila que espera un arreglo de cadenas.
tableroJuego[1] = "O"; 

```

### Acceso seguro y manipulación de elementos

Al acceder a los datos de una matriz multidimensional mediante la notación de corchetes consecutivos (`[fila][columna]`), TypeScript deduce automáticamente el tipo de dato del elemento final extraído, proporcionando un entorno de desarrollo seguro.

```typescript
let coordenadasMapa: number[][] = [
    [100, 250],
    [310, 420]
];

// Acceso a una fila completa
let primeraFila: number[] = coordenadasMapa[0]; // Infiere number[]

// Acceso a un punto individual
let puntoX: number = coordenadasMapa[0][0]; // Infiere number

// Operación válida
console.log(puntoX.toFixed(2));

```

### Recorrido de arreglos multidimensionales

Para iterar sobre estas estructuras se suelen utilizar bucles anidados (como `for...of`). Gracias a la herencia de tipos, TypeScript identifica de forma automática la naturaleza de las variables en cada nivel de anidamiento sin necesidad de escribir anotaciones de tipo manuales en los bucles:

```typescript
let matrizLetras: string[][] = [
    ["A", "B"],
    ["C", "D"]
];

// 'fila' es inferida automáticamente como string[]
for (const fila of matrizLetras) {
    // 'letra' es inferida automáticamente como string
    for (const letra of fila) {
        console.log(letra.toLowerCase()); // Autocompletado seguro
    }
}

```

## Resumen del capítulo

En el **Capítulo 3: Arreglos, Tuplas y Enums**, hemos explorado cómo TypeScript robustece el manejo de colecciones y conjuntos de constantes fijas frente a las debilidades nativas de JavaScript:

* **Arreglos tipados (`tipo[]`):** Aprendimos a restringir colecciones para asegurar la homogeneidad de sus datos utilizando corchetes o la sintaxis genérica, habilitando el control de inmutabilidad con `readonly`.
* **Tuplas:** Analizamos estas estructuras fijas y heterogéneas donde el orden y la cantidad de elementos importan estrictamente, blindándolas con `readonly` para evitar alteraciones indeseadas mediante métodos nativos.
* **Enumeraciones (`enum` y `const enum`):** Estudiamos cómo definir conjuntos de constantes semánticas con nombres claros. Evaluamos las variantes numéricas (con mapeo inverso) y de cadena, junto con la optimización de código que ofrecen los enums constantes al desaparecer en el JavaScript compilado.
* **Arreglos multidimensionales:** Finalizamos dominando el anidamiento de colecciones, comprendiendo cómo declarar y recorrer matrices de múltiples dimensiones garantizando la seguridad tipográfica de los datos en cualquier nivel de profundidad.
