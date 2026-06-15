Las funciones son los bloques de construcción fundamentales de cualquier aplicación. En JavaScript puro, su flexibilidad extrema suele ser una fuente constante de errores inesperados en producción. Este capítulo te enseñará a dominar el tipado de funciones para crear código robusto y predecible. Aprenderás a blindar la entrada y salida de datos mediante el tipado de parámetros y valores de retorno, a flexibilizar tus diseños con parámetros opcionales y por defecto, a manejar argumentos dinámicos con parámetros REST y a diseñar interfaces polimórficas mediante la sobrecarga de funciones. Eleva la calidad de tu lógica y aprovecha al máximo el autocompletado de tu editor.

## 4.1 Tipado de parámetros y valores de retorno

En JavaScript puro, las funciones son extremadamente flexibles pero también propensas a errores en tiempo de ejecución. Una función puede recibir cualquier tipo de dato en sus argumentos y retornar estructuras completamente impredecibles. TypeScript resuelve este problema permitiendo definir un contrato claro tanto para los datos que entran a la función (**parámetros**) como para los datos que salen de ella (**valores de retorno**).

Al tipar una función, no solo estás protegiendo tu código contra comportamientos inesperados, sino que también estás documentando de forma nativa el comportamiento de tus componentes para que cualquier editor compatible te asista con autocompletado en tiempo real.

### Sintaxis básica de una función tipada

Para añadir tipos a una función, se utiliza la sintaxis de dos puntos (`:`) inmediatamente después del nombre de cada parámetro, y también después de los paréntesis de la lista de argumentos para definir el tipo de retorno.

```typescript
function calcularIva(precio: number): number {
    return precio * 0.21;
}

```

En este ejemplo:

* `precio: number` garantiza que la función solo aceptará valores numéricos como argumento.
* `): number` garantiza que la función obligatoriamente debe devolver un valor de tipo numérico mediante la palabra clave `return`.

### Tipado de parámetros

Cada parámetro en una función debe tener un tipo explícito. Si omites el tipo de un parámetro, TypeScript intentará inferirlo, pero si no cuenta con suficiente información contextual, le asignará implícitamente el tipo `any`, disparando una advertencia o error de compilación si tienes activada la opción estricta `noImplicitAny`.

```typescript
function saludar(nombre: string, edad: number) {
    console.log(`Hola, ${nombre}. Tienes ${edad} años.`);
}

// Uso correcto
saludar("Elena", 28);

// Error de compilación: El tipo 'string' no es asignable al parámetro de tipo 'number'
saludar(28, "Elena"); 

```

### Tipado del valor de retorno

El tipo de retorno se coloca justo antes de la llave de apertura del cuerpo de la función. TypeScript valida internamente que todos los caminos de ejecución de la función (`if/else`, `switch`, etc.) devuelvan un valor que coincida con el tipo declarado.

```typescript
function esMayorDeEdad(edad: number): boolean {
    if (edad >= 18) {
        return true;
    }
    return false; // Si se omite este return, TypeScript arrojará un error
}

```

#### Inferencia en el retorno

A diferencia de los parámetros, TypeScript es altamente eficiente infiriendo el tipo de retorno de una función basándose en la expresión del `return`.

```typescript
// TypeScript infiere automáticamente que el retorno es de tipo 'string'
function obtenerSaludo(nombre: string) {
    return `Bienvenido, ${nombre}`; 
}

```

> **Buena práctica:** Aunque la inferencia de retorno funciona perfectamente, especificar explícitamente el tipo de retorno en tus funciones principales es una excelente práctica. Esto actúa como un seguro: si modificas accidentalmente el cuerpo de la función y cambias lo que devuelve, el compilador te avisará de inmediato que rompiste el contrato original.

### El tipo especial: `void`

Cuando una función está diseñada para realizar una acción pero no devuelve ningún valor explícito (no contiene un `return` o tiene un `return` vacío), su tipo de retorno es `void`.

```typescript
function imprimirMensaje(mensaje: string): void {
    console.log(`Log: ${mensaje}`);
    // No hay sentencia return
}

```

Si intentas asignar el resultado de una función `void` a una variable, TypeScript considerará que dicha variable no contiene un valor útil.

```typescript
let resultado = imprimirMensaje("Procesando datos...");
// El tipo de 'resultado' es void

```

### El tipo `never`

Existe un tipo de retorno aún más restrictivo que `void` llamado `never`. Este tipo representa valores que **nunca** ocurren. Se utiliza para funciones que rompen el flujo normal del programa, ya sea porque lanzan una excepción de forma permanente o porque entran en un bucle infinito del cual no se puede salir.

```typescript
function lanzarError(mensaje: string): never {
    throw new Error(mensaje); // La función nunca termina su ejecución de forma normal
}

function bucleInfinito(): never {
    while (true) {
        // Ejecución perpetua
    }
}

```

El siguiente esquema en texto plano resume cómo fluyen los datos a través del sistema de tipos de una función estándar:

```text
       [ DATOS DE ENTRADA ] 
                │
                ▼
     ┌──────────────────────┐
     │ Parámetros Tipados   │ ──► Ejemplo: (base: number, altura: number)
     └──────────────────────┘
                │
                ▼
     ┌──────────────────────┐
     │  Cuerpo de Función   │
     └──────────────────────┘
                │
                ▼
     ┌──────────────────────┐
     │  Valor de Retorno    │ ──► Ejemplo: :number (o :void si no retorna)
     └──────────────────────┘
                │
                ▼
       [ DATOS DE SALIDA ]

```

### Tipado en Funciones de Flecha (Arrow Functions)

La sintaxis para aplicar tipos en las funciones de flecha sigue exactamente las mismas reglas, ubicando los tipos de los parámetros dentro de los paréntesis y el tipo de retorno justo antes de la flecha (`=>`).

```typescript
const duplicar = (valor: number): number => {
    return valor * 2;
};

// Sintaxis simplificada con retorno implícito
const sumando = (a: number, b: number): number => a + b;

```

## 4.2 Parámetros opcionales y por defecto

En JavaScript, todos los parámetros de una función son opcionales por defecto; si no pasas un argumento al invocarla, su valor pasa a ser `undefined`. TypeScript adopta un enfoque mucho más estricto: el compilador asume de forma predeterminada que todos los parámetros identificados en la firma de una función son **obligatorios**.

Para aportar flexibilidad a tus desarrollos sin perder la seguridad del tipado estático, TypeScript introduce mecanismos formales para definir tanto **parámetros opcionales** como **parámetros por defecto**.

### Parámetros opcionales

Para indicar que un parámetro es opcional, se añade un signo de interrogación (`?`) justo después de su nombre, antes de los dos puntos que definen su tipo.

```typescript
function construirNombre(nombre: string, apellido?: string): string {
    if (apellido) {
        return `${nombre} ${apellido}`;
    }
    return nombre;
}

let usuario1 = construirNombre("Carlos", "Santana"); // Válido
let usuario2 = construirNombre("Ana");               // Válido

```

Cuando marcas un parámetro como opcional, TypeScript cambia automáticamente su tipo interno añadiéndole un tipo de unión con `undefined`. En el ejemplo anterior, el tipo real de `apellido` es `string | undefined`.

#### Regla crucial de posición

Los parámetros opcionales deben declararse obligatoriamente **al final** de la lista de parámetros. No puedes colocar un parámetro opcional antes de uno obligatorio, ya que el compilador no tendría forma de determinar la correspondencia de los argumentos al invocar la función.

```typescript
// ERROR de compilación: Un parámetro opcional no puede seguir a un parámetro obligatorio.
function crearContacto(telefono?: string, nombre: string) {
    // ...
}

```

### Parámetros por defecto

Si deseas que un parámetro tenga un valor predeterminado en caso de que el usuario no lo provea, puedes asignarle dicho valor directamente en la declaración de la función usando el operador `=`.

```typescript
function calcularDescuento(precio: number, porcentaje: number = 10): number {
    return precio - (precio * (porcentaje / 100));
}

console.log(calcularDescuento(100));     // Retorna 90 (usa el 10 por defecto)
console.log(calcularDescuento(100, 20)); // Retorna 80 (reemplaza el valor por defecto)

```

Al utilizar parámetros por defecto, obtienes dos grandes ventajas:

1. **Inferencia de tipos:** No es estrictamente necesario declarar el tipo del parámetro (por ejemplo, escribir `: number = 10`), ya que TypeScript infiere el tipo directamente del valor asignado.
2. **Comportamiento opcional implícito:** Los parámetros con valores por defecto son automáticamente opcionales para quien invoca la función.

### Comparativa: Opcionales vs. Por defecto

Aunque ambos sirven para que el invocador pueda omitir argumentos, sus implicaciones internas dentro de la función son muy diferentes:

| Característica | Parámetro Opcional (`param?`) | Parámetro por Defecto (`param = valor`) |
| --- | --- | --- |
| **Tipo interno si se omite** | Su valor será `undefined`. | Tendrá el tipo y valor asignado por defecto. |
| **Validación interna** | Obliga a comprobar si existe (`if (param)`) antes de usarlo de forma segura. | Se puede usar directamente sin comprobaciones previas. |
| **Ubicación en la firma** | Estrictamente al final de los parámetros. | Preferiblemente al final, aunque permite ubicaciones intermedias. |

### Parámetros por defecto en posiciones intermedias

A diferencia de los opcionales puros, TypeScript permite colocar parámetros por defecto antes de parámetros obligatorios. Sin embargo, para poder saltarse ese parámetro al invocar la función e indicarle al compilador que use el valor predefinido, se le debe pasar explícitamente el valor `undefined`.

```typescript
function inicializarServidor(puerto = 8080, host: string): string {
    return `Conectando a http://${host}:${puerto}`;
}

// Para usar el puerto por defecto, pasamos 'undefined' en la primera posición
let conexion = inicializarServidor(undefined, "localhost");
console.log(conexion); // Salida: "Conectando a http://localhost:8080"

```

El siguiente diagrama de flujo en texto plano ilustra cómo TypeScript evalúa los argumentos recibidos al procesar la llamada de una función:

```text
               ¿Se proporcionó el argumento al invocar?
                             │
              ┌──────────────┴──────────────┐
              ▼ SÍ                          ▼ NO
   ┌──────────────────────┐      ¿Tiene un valor por defecto?
   │ Usa el valor pasado  │                 │
   │ por el usuario.      │          ┌──────┴──────┐
   └──────────────────────┘          ▼ SÍ          ▼ NO
                          ┌────────────────────┐ ┌────────────────────┐
                          │ Usa el valor       │ │ El parámetro toma  │
                          │ predeterminado.    │ │ el valor undefined │
                          └────────────────────┘ └────────────────────┘

```

## 4.3 Parámetros REST y su tipado

En ocasiones, no conocemos de antemano cuántos argumentos se le pasarán a una función. Por ejemplo, una función para sumar números, concatenar cadenas o enviar un grupo de identificadores a una base de datos debería ser capaz de recibir un único argumento o decenas de ellos simultáneamente.

En JavaScript, esto se resuelve mediante los **parámetros REST** (representados con la sintaxis de tres puntos suspensivos: `...`). Los parámetros REST agrupan los argumentos restantes pasados a una función en un único arreglo. TypeScript adopta esta misma especificación de ECMAScript, pero añade la capa de seguridad necesaria garantizando que todos esos argumentos dinámicos compartan un tipo de dato común o sigan una estructura controlada.

### Sintaxis y Tipado Básico

A diferencia de un parámetro convencional, un parámetro REST **siempre debe ser tipado como un arreglo** (`tipo[]` o `Array<tipo>`). Esto se debe a que, internamente, la variable se comportará exactamente como una colección de elementos.

```typescript
function sumarNumeros(...numeros: number[]): number {
    return numeros.reduce((acumulado, actual) => acumulado + actual, 0);
}

// Invocaciones válidas con cualquier cantidad de argumentos
console.log(sumarNumeros(1, 2));             // Devuelve 3
console.log(sumarNumeros(10, 20, 30, 40));   // Devuelve 100
console.log(sumarNumeros());                 // Devuelve 0 (un arreglo vacío)

```

Si intentas pasar un argumento que no coincida con el tipo base del arreglo, TypeScript detendrá la compilación:

```typescript
// Error: El tipo 'string' no es asignable al parámetro de tipo 'number'
console.log(sumarNumeros(1, 2, "tres", 4)); 

```

### Combinación con parámetros fijos

Una función puede combinar parámetros convencionales (obligatorios u opcionales) con un parámetro REST. La única regla estricta de sintaxis es que **el parámetro REST debe ser el último en la firma de la función**.

```typescript
function emitirRecibo(cliente: string, ...montos: number[]): string {
    const total = montos.reduce((a, b) => a + b, 0);
    return `Cliente: ${cliente} - Total a pagar: $${total}`;
}

// El primer argumento va a 'cliente', los siguientes se agrupan en 'montos'
let mensaje = emitirRecibo("Sofía", 150.50, 230.00, 45.00);

```

```text
Llamada:  emitirRecibo("Sofía", 150.50, 230.00, 45.00)
                         │       │       │      │
                         ▼       └───────┬──────┘
Firma:    (cliente: string,     ...montos: number[])

```

### Tipado avanzado de parámetros REST con Tuplas

Gracias al potente sistema de tipos de TypeScript, los parámetros REST no están limitados a arreglos homogéneos (donde todos los elementos son del mismo tipo). Podemos utilizar **tuplas** para definir secuencias exactas de tipos de datos variables que la función debe recibir obligatoriamente como argumentos restantes.

Por ejemplo, si queremos una función que reciba los datos de un usuario de forma posicional mediante REST:

```typescript
function registrarUsuario(...datos: [string, number, boolean]): void {
    const [nombre, edad, esAdministrador] = datos;
    console.log(`Registrando a ${nombre} (${edad} años). ¿Admin?: ${esAdministrador}`);
}

// Uso correcto: Coincide exactamente con la tupla [string, number, boolean]
registrarUsuario("Lucas", 34, true);

// Error: El segundo elemento debe ser 'number', no 'string'
registrarUsuario("Marta", "veinte", false); 

```

Esta técnica nos permite simular funciones con múltiples argumentos fuertemente tipados en una sola línea, manteniendo un control estricto sobre cada posición del argumento enviado por el usuario.

## 4.4 Sobrecarga de funciones

En JavaScript, las funciones pueden recibir diferentes tipos y cantidades de argumentos en un mismo bloque de ejecución, resolviendo internamente qué hacer inspeccionando el tipo de los parámetros recibidos mediante operadores como `typeof` o `instanceof`. Sin embargo, esto hace que documentar y tipar la función de forma estricta sea difícil.

TypeScript introduce la **sobrecarga de funciones** (*function overloading*), que te permite definir múltiples firmas para una misma función. Esto le comunica al compilador (y a tu editor de código) todas las combinaciones válidas de argumentos y retornos que la función admite, asegurando que el desarrollador consuma la función de forma correcta según el contexto.

### La estructura de la sobrecarga

Para implementar la sobrecarga de funciones en TypeScript se deben escribir dos componentes esenciales:

1. **Firmas de sobrecarga:** Son declaraciones de funciones sin cuerpo que definen cada una de las combinaciones de tipos permitidas.
2. **Firma de implementación:** Es la función real que contiene el cuerpo y el código ejecutable. Esta firma debe ser lo suficientemente genérica y amplia para englobar y ser compatible con todas las firmas de sobrecarga anteriores.

> **Importante:** Las firmas de sobrecarga son las únicas que el usuario final de la función podrá ver y utilizar. La firma de implementación queda "oculta" para el autocompletado y no puede ser invocada directamente a menos que coincida exactamente con alguna de las sobrecargas.

### Ejemplo práctico: Procesador de textos

Imaginemos una función llamada `formatear` que puede recibir un `string` o un `number`. Si recibe un texto, debe devolverlo en mayúsculas. Si recibe un número, debe devolverlo como un string con formato de moneda.

```typescript
// --- FIRMAS DE SOBRECARGA ---
function formatear(valor: string): string;
function formatear(valor: number): string;

// --- FIRMA DE IMPLEMENTACIÓN ---
function formatear(valor: any): string {
    if (typeof valor === "string") {
        return valor.toUpperCase();
    } else if (typeof valor === "number") {
        return `$${valor.toFixed(2)}`;
    }
    return "";
}

// --- USO ---
const textoMayusculas = formatear("hola mundo"); // Retorna "HOLA MUNDO"
const precioFormateado = formatear(1500);       // Retorna "$1500.00"

// Error de compilación: Ninguna sobrecarga coincide con el tipo 'boolean'
const errorTipado = formatear(true); 

```

### Reglas de compatibilidad en la implementación

La firma de la implementación debe ser capaz de aceptar todos los tipos de las sobrecargas anteriores. Si tus firmas de sobrecarga usan tipos diferentes, la firma de la implementación normalmente usará un tipo de unión (`string | number`) o el tipo `any` en sus parámetros.

De igual forma, el tipo de retorno de la implementación debe englobar todos los retornos posibles de las sobrecargas.

```typescript
// Firmas de sobrecarga con diferentes tipos de retorno
function empaquetar(item: string): string;
function empaquetar(item: string, cantidad: number): string[];

// Firma de implementación compatible con ambos escenarios
function empaquetar(item: string, cantidad?: number): string | string[] {
    if (cantidad !== undefined) {
        return Array(cantidad).fill(item);
    }
    return `[${item}]`;
}

```

El siguiente diagrama en texto plano muestra visualmente cómo el compilador intercepta las llamadas basándose en las firmas expuestas antes de ejecutar la implementación interna:

```text
       Llamada del usuario: empaquetar("Caja", 3)
                              │
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │              FILTRO DE SOBRECARGAS (IDE)               │
  ├────────────────────────────────────────────────────────┤
  │ ❌ Sobrecarga 1: empaquetar(item: string): string       │
  │ ✅ Sobrecarga 2: empaquetar(item: string, cant: number) │
  └───────────────────────────┬────────────────────────────┘
                              │
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │                 FIRMA DE IMPLEMENTACIÓN                │
  ├────────────────────────────────────────────────────────┤
  │ Ejecuta el código interno de forma segura utilizando  │
  │ el bloque de código que coincide con los parámetros.   │
  └────────────────────────────────────────────────________┘

```

### Buenas prácticas al usar sobrecargas

Antes de implementar sobrecargas de funciones, evalúa si puedes resolver el problema utilizando **Tipos de Unión** (`|`). Las sobrecargas añaden verbosidad al archivo y solo deben usarse cuando el tipo de retorno dependa estrictamente del tipo de los parámetros de entrada.

Si el tipo de retorno es el mismo independientemente del argumento, prefiere siempre un tipo de unión:

```typescript
// En lugar de sobrecargar innecesariamente:
function loguearId(id: string): void;
function loguearId(id: number): void;

// Es mucho más limpio y óptimo usar un tipo de unión:
function loguearId(id: string | number): void {
    console.log(`ID: ${id}`);
}

```

## Resumen del capítulo

En este **Capítulo 4: Funciones en TypeScript**, hemos transformado la manera en que estructuramos y protegemos la lógica de nuestras aplicaciones mediante el control de los bloques de código ejecutables:

* **Tipado estricto (4.1):** Aprendimos a definir contratos claros para la entrada (`parámetros`) y salida (`valores de retorno`) de las funciones, introduciendo tipos especializados como `void` (ausencia de retorno) y `never` (bloques sin retorno o con excepciones permanentes).
* **Flexibilidad de argumentos (4.2):** Estudiamos los parámetros opcionales (`?`) y cómo TypeScript los gestiona internamente como uniones con `undefined`, además de simplificar la inicialización de variables mediante los parámetros por defecto (`=`).
* **Invocaciones dinámicas (4.3):** Implementamos los parámetros REST (`...`) para dotar a las funciones de la capacidad de recibir colecciones dinámicas de datos de forma segura, usando arreglos tradicionales o restricciones posicionales con tuplas.
* **Contratos múltiples (4.4):** Descubrimos la sobrecarga de funciones para modelar comportamientos complejos y polimórficos de JavaScript bajo un entorno controlado por múltiples firmas legibles por el compilador.
