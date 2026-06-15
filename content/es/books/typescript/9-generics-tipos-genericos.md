Fijar un único tipo de datos en nuestras funciones o estructuras aporta robustez, pero sacrifica la reutilización y nos empuja a duplicar código o a recurrir al inseguro tipo `any`. Los **Generics** resuelven este dilema actuando como variables de tipos: permiten pasar tipos como argumentos para crear componentes altamente flexibles y reutilizables. En este capítulo, aprenderás su sintaxis fundamental y cómo implementarlos en funciones, interfaces y clases, dominando además el uso de restricciones para limitar su comportamiento sin perder la seguridad estática ni el autocompletado que ofrece TypeScript.

## 9.1 Introducción y sintaxis de Generics

En el desarrollo de software, uno de los mayores desafíos consiste en crear componentes que no solo tengan APIs consistentes y bien definidas, sino que también sean reutilizables. Hasta ahora, hemos aprendido a dar robustez a nuestro código asignando tipos específicos a variables, parámetros y clases. Sin embargo, fijar un único tipo de datos de forma estricta puede limitar la reutilización de una función o estructura, obligándonos a duplicar lógica o a recurrir al peligroso tipo `any`.

Los **Generics (Tipos Genéricos)** son la herramienta que TypeScript proporciona para resolver este dilema. Nos permiten escribir funciones, interfaces y clases que operan sobre una variedad de tipos en lugar de uno solo, manteniendo intacta la seguridad tipográfica (type safety) y el soporte del autocompletado en nuestro editor.

### El problema: Rigidez vs. Pérdida de Tipado

Para entender la necesidad de los genéricos, supongamos que necesitamos crear una función que reciba un argumento y devuelva un arreglo que contenga ese único elemento. Si implementamos esta función para valores numéricos, la sintaxis sería la siguiente:

```typescript
function envolverEnArregloNumero(elemento: number): number[] {
    return [elemento];
}

```

¿Qué sucede si más adelante necesitamos la misma lógica pero para una cadena de texto o para un objeto personalizado? Si intentamos usar la función anterior con un `string`, el compilador de TypeScript arrojará un error de inmediato. Para solucionarlo sin genéricos, tendríamos dos alternativas deficientes:

1. **Duplicar la función** creando `envolverEnArregloCadena(elemento: string): string[]`, lo que rompe el principio DRY (*Don't Repeat Yourself*).
2. **Utilizar el tipo `any`**, anulando los beneficios de TypeScript:

```typescript
function envolverEnArregloInseguro(elemento: any): any[] {
    return [elemento];
}

const miArreglo = envolverEnArregloInseguro("TypeScript"); 
// El tipo de 'miArreglo' es any[], hemos perdido el rastro del tipo 'string'

```

Al usar `any`, el compilador acepta cualquier entrada, pero también asume que la salida es completamente desconocida. Si intentamos acceder a un método propio de las cadenas de texto (como `.toLowerCase()`) sobre los elementos de `miArreglo`, TypeScript no nos ofrecerá autocompletado ni nos advertirá si cometemos un error de escritura.

### La solución: Parámetros de Tipo

Los genéricos actúan como "variables de tipos". Del mismo modo que las funciones reciben valores en sus parámetros durante la ejecución, los genéricos nos permiten pasar **tipos como argumentos** en el momento de la compilación.

La sintaxis básica utiliza los operadores de menor que (`<`) y mayor que (`>`) para declarar un parámetro de tipo. Por convención cultural, se suele utilizar la letra **`T`** (de *Type*), aunque se puede usar cualquier nombre válido de variable.

A continuación, transformamos nuestro ejemplo anterior en una función genérica:

```typescript
function envolverEnArreglo<T>(elemento: T): T[] {
    return [elemento];
}

```

Analicemos detalladamente cada componente de esta sintaxis:

```text
  Indica que la función es genérica y declara el parámetro de tipo 'T'
                    |
                    v
function envolverEnArreglo<T>(elemento: T): T[] { ... }
                                        ^   ^
                                        |   |
     Usa 'T' como el tipo del parámetro ----+---+ Usa 'T' para definir el tipo de retorno (Arreglo de T)

```

Al capturar el tipo `T` que el usuario proporciona o que el compilador infiere, aseguramos una conexión directa entre el tipo de la entrada y el tipo de la salida.

### Sintaxis y consumo de componentes genéricos

Para invocar una función genérica, existen dos mecanismos principales: la especificación explícita del tipo y la inferencia automática del compilador.

#### 1. Invocación explícita de tipos

Consiste en pasar explícitamente el tipo de datos deseado entre los corchetes angulares (`< >`) justo antes de los paréntesis de la llamada a la función:

```typescript
// Especificamos explícitamente que T será 'string'
const nombres = envolverEnArreglo<string>("Sofía");
// Tipo resultante: string[]

// Especificamos explícitamente que T será 'number'
const numeros = envolverEnArreglo<number>(42);
// Tipo resultante: number[]

```

Esta forma es obligatoria cuando la función genérica no tiene argumentos de entrada de los cuales deducir el tipo, o cuando queremos forzar al compilador a trabajar con un tipo más específico de una unión (por ejemplo, `envolverEnArreglo<string | number>("Hola")`).

#### 2. Inferencia de tipos en Genéricos

En la mayoría de los escenarios cotidianos, TypeScript es lo suficientemente inteligente como para deducir el tipo de `T` de forma automática basándose en el valor que pasamos como argumento. Esto mantiene el código limpio y legible:

```typescript
// El compilador ve el string "Carlos" e infiere que T debe ser 'string'
const listaUsuarios = envolverEnArreglo("Carlos"); 

// El compilador ve un booleano e infiere que T debe ser 'boolean'
const listaRespuestas = envolverEnArreglo(true); 

```

Gracias a este flujo, si posteriormente intentamos recuperar un elemento de `listaUsuarios`, el entorno de desarrollo sabrá con total certeza que es un `string` y nos brindará todas sus herramientas de asistencia de código.

### Múltiples parámetros de tipo

No estamos limitados a usar un único parámetro de tipo `T`. Si nuestras funciones o estructuras necesitan gestionar más de una entidad abstracta, podemos declarar múltiples parámetros separados por comas dentro de los corchetes angulares. Cuando se usan varias letras, la convención dicta continuar el abecedario a partir de la T (`T`, `U`, `V`, etc.), o usar palabras descriptivas si la complejidad lo amerita.

Evaluemos una función encargada de emparejar dos valores de distinta naturaleza en una tupla:

```typescript
function crearPar<T, U>(primero: T, segundo: U): [T, U] {
    return [primero, segundo];
}

// Consumo con inferencia automática de tipos
const parIdentificador = crearPar("ID_Usuario", 10452);
// Tipo inferido de 'parIdentificador': [string, number]

// Consumo con tipado explícito
const parConfiguracion = crearPar<boolean, string>(true, "ModoProduccion");
// Tipo explícito de 'parConfiguracion': [boolean, string]

```

En este caso, `T` captura el tipo del primer argumento (`string` o `boolean`) y `U` captura el tipo del segundo argumento (`number` o `string`), garantizando una correspondencia estricta sin importar qué combinaciones de datos decida enviar el desarrollador.

## 9.2 Funciones e interfaces genéricas

Una vez comprendida la sintaxis fundamental y el propósito de los tipos genéricos, es momento de profundizar en cómo aplicarlos a dos de las estructuras más utilizadas en el desarrollo diario con TypeScript: las **funciones** (tanto declaraciones tradicionales como funciones de flecha) y las **interfaces**.

Compaginar genéricos con estas estructuras nos permite definir contratos de datos flexibles y reutilizables, manteniendo un control absoluto sobre el tipado.

### Funciones Genéricas Avanzadas y Funciones de Flecha

En la sección anterior vimos cómo estructurar una función genérica tradicional. Sin embargo, en el ecosistema moderno de JavaScript y TypeScript, las funciones de flecha (*arrow functions*) son un estándar.

La sintaxis para transformar una función de flecha en genérica requiere colocar los corchetes angulares `<T>` justo antes de los parámetros de la función:

```typescript
// Sintaxis de una función de flecha genérica
const obtenerUltimoElemento = <T>(arreglo: T[]): T | undefined => {
    return arreglo[arreglo.length - 1];
};

// Uso de la función
const numeros = [1, 2, 3, 4];
const ultimoNumero = obtenerUltimoElemento(numeros); // Infiere: number

const cadenas = ["TypeScript", "Generics", "Interfaces"];
const ultimaCadena = obtenerUltimoElemento(cadenas); // Infiere: string

```

> **Nota de compatibilidad con JSX (.tsx):** Si trabajas en proyectos de React que utilizan archivos `.tsx`, el compilador puede confundir la sintaxis `<T>` de una función de flecha con una etiqueta HTML o componente JSX mal cerrado. Para evitar este error sintáctico, se suele añadir una coma tras la letra o extender un tipo base:
>
> ```typescript
> const obtenerUltimoJSX = <T,>(arreglo: T[]): T => arreglo[0]; // La coma disipa la ambigüedad
> 
> ```
>
>

### Interfaces Genéricas

Del mismo modo que las funciones pueden recibir argumentos de tipo, las interfaces pueden parametrizarse. Una **interfaz genérica** no define tipos fijos para todas sus propiedades; en su lugar, utiliza marcadores de posición que se resolverán en el momento en que un objeto, clase o función implemente dicha interfaz.

Imaginemos que estamos desarrollando el sistema de comunicación con una API. Las respuestas del servidor suelen tener una estructura común (un estado, un mensaje) pero el cuerpo de los datos (`data`) cambia drásticamente dependiendo del *endpoint* que consultemos.

Sin genéricos, tendríamos que crear una interfaz diferente para cada respuesta del servidor. Con interfaces genéricas, lo resolvemos de la siguiente manera:

```typescript
// Definición de la interfaz genérica
interface RespuestaAPI<T> {
    codigoEstado: number;
    mensaje: string;
    datos: T; // El tipo de esta propiedad es dinámico
}

```

Ahora podemos reutilizar este mismo contrato de datos para cualquier entidad de nuestra aplicación, pasando el tipo correspondiente como si fuera un argumento:

```typescript
// 1. Definimos las estructuras de nuestros datos específicos
interface Usuario {
    id: number;
    nombre: string;
    email: string;
}

interface Producto {
    id: string;
    precio: number;
    descripcion: string;
}

// 2. Consumimos la interfaz genérica aplicando los tipos específicos
const respuestaUsuario: RespuestaAPI<Usuario> = {
    codigoEstado: 200,
    mensaje: "Usuario encontrado con éxito",
    datos: {
        id: 101,
        nombre: "Diana Prince",
        email: "diana@justice.org"
    }
};

const respuestaProducto: RespuestaAPI<Producto> = {
    codigoEstado: 200,
    mensaje: "Producto disponible",
    datos: {
        id: "PROD-882",
        precio: 29.99,
        descripcion: "Teclado Mecánico RGB"
    }
};

```

### Combinando Funciones e Interfaces Genéricas

El verdadero poder de TypeScript emerge cuando conectamos ambos mundos. Podemos diseñar funciones genéricas cuyas entradas o salidas estén firmemente reguladas por interfaces genéricas.

Siguiendo el ejemplo del sistema de peticiones API, podemos modelar una función que procese estas respuestas de manera abstracta:

```typescript
function procesarRespuesta<Contenido>(respuesta: RespuestaAPI<Contenido>): Contenido {
    if (respuesta.codigoEstado === 200) {
        return respuesta.datos;
    }
    throw new Error(`Error en el servidor: ${respuesta.mensaje}`);
}

// TypeScript infiere automáticamente que 'datosUsuario' es de tipo 'Usuario'
// porque 'respuestaUsuario' fue declarada como 'RespuestaAPI<Usuario>'
const datosUsuario = procesarRespuesta(respuestaUsuario);
console.log(datosUsuario.nombre); // Acceso seguro y con autocompletado: "Diana Prince"

```

El siguiente diagrama en texto plano ilustra cómo el parámetro de tipo fluye desde la llamada de la función hasta la resolución de la estructura de la interfaz:

```text
[Invocación de la función] -> procesarRespuesta(respuestaUsuario)
                                        |
       El compilador detecta que 'respuestaUsuario' es RespuestaAPI<Usuario>
                                        |
                                        v
[Asignación de Tipo]       -> 'Contenido' se convierte en 'Usuario'
                                        |
                                        v
[Estructura Resultante]    -> Parámetro: RespuestaAPI<Usuario>
                           -> Retorno: Usuario

```

### Interfaces para describir Funciones Genéricas

En ocasiones, no querrás que toda la interfaz sea genérica, sino únicamente una de las funciones o métodos que contiene. También es posible definir el tipo de una función genérica como un miembro de una interfaz de la siguiente manera:

```typescript
interface OperadorColecciones {
    // El método es genérico de forma independiente a la interfaz
    limpiarLista<T>(lista: T[]): T[];
}

const miOperador: OperadorColecciones = {
    limpiarLista: function<T>(lista: T[]): T[] {
        // Filtra elementos repetidos eliminando duplicados
        return Array.from(new Set(lista));
    }
};

const numerosUnicos = miOperador.limpiarLista([1, 2, 2, 3, 4, 4]); // Retorna number[]
const textosUnicos = miOperador.limpiarLista(["a", "b", "a"]);     // Retorna string[]

```

Esta separación te brinda la flexibilidad de empaquetar utilidades de software heterogéneas bajo un mismo contrato operativo, asegurando que cada acción preserve rigurosamente el tipo de dato con el que fue ejecutada.

## 9.3 Clases genéricas y su implementación

Al igual que las funciones y las interfaces, las clases en TypeScript pueden beneficiarse enormemente del uso de genéricos. Una **clase genérica** tiene una estructura similar a una clase tradicional, pero incluye un parámetro de tipo entre corchetes angulares (`<T>`) justo después del nombre de la clase.

Este parámetro de tipo se puede utilizar a lo largo de toda la definición de la clase: para tipar sus propiedades, los parámetros de su constructor, los tipos de retorno de sus métodos o sus variables internas.

### Sintaxis básica de una clase genérica

Para comprender cómo se estructuran, veamos el ejemplo clásico de un contenedor o "caja" que puede almacenar un elemento de cualquier tipo, pero que preserva la identidad de ese tipo una vez guardado:

```typescript
class Caja<T> {
    // Propiedad cuyo tipo se definirá al instanciar la clase
    private contenido: T;

    constructor(valorInicial: T) {
        this.contenido = valorInicial;
    }

    public obtenerContenido(): T {
        return this.contenido;
    }

    public actualizarContenido(nuevoValor: T): void {
        this.contenido = nuevoValor;
    }
}

```

### Instanciación: Inferencia vs. Especificación Explícita

Al crear una instancia de una clase genérica, podemos pasar el tipo de forma explícita o dejar que TypeScript lo deduzca a través de los argumentos pasados al constructor.

#### Tipo explícito

Es útil cuando queremos asegurarnos de que la clase se adhiera estrictamente a un tipo desde el inicio, o cuando el constructor no recibe argumentos de los cuales inferir el tipo.

```typescript
// Instancia explícita para manejar strings
const cajaDeTexto = new Caja<string>("Manuscrito antiguo");

// Intentar guardar un número rompería el contrato de tipo
// cajaDeTexto.actualizarContenido(42); // Error de compilación

const texto = cajaDeTexto.obtenerContenido(); // TypeScript sabe que es 'string'

```

#### Inferencia de tipos

Si el constructor recibe un parámetro, TypeScript analiza el valor de entrada y asigna automáticamente el tipo a `T`.

```typescript
// TypeScript infiere automáticamente que T es 'number'
const cajaNumerica = new Caja(2026);

const numero = cajaNumerica.obtenerContenido(); // TypeScript sabe que es 'number'

```

### Ejemplo práctico: Estructura de Datos (Pila / Stack)

Las clases genéricas brillan especialmente cuando implementamos estructuras de datos reutilizables. Una pila (*Stack*) sigue el principio LIFO (*Last In, First Out*: el último en entrar es el primero en salir). Queremos que nuestra pila pueda almacenar cualquier tipo de dato, pero que no mezcle tipos de forma insegura.

```typescript
class Pila<T> {
    private elementos: T[] = [];

    // Agrega un elemento a la parte superior de la pila
    public apilar(elemento: T): void {
        this.elementos.push(elemento);
    }

    // Retira y devuelve el elemento superior de la pila
    public desapilar(): T | undefined {
        return this.elementos.pop();
    }

    // Devuelve el número total de elementos
    public tamano(): number {
        return this.elementos.length;
    }
}

```

Gracias a los genéricos, podemos usar esta única clase para resolver problemas completamente diferentes en nuestra aplicación:

```typescript
// Uso 1: Una pila para gestionar el historial de navegación (Strings)
const historialNavegacion = new Pila<string>();
historialNavegacion.apilar("google.com");
historialNavegacion.apilar("typescriptlang.org");

const ultimaPagina = historialNavegacion.desapilar(); // Tipo: string | undefined

// Uso 2: Una pila para un sistema de procesamiento de tareas (Objetos)
interface Tarea {
    id: number;
    prioridad: "alta" | "baja";
}

const pilaDeTareas = new Pila<Tarea>();
pilaDeTareas.apilar({ id: 1, prioridad: "alta" });
pilaDeTareas.apilar({ id: 2, prioridad: "baja" });

const siguienteTarea = pilaDeTareas.desapilar(); // Tipo: Tarea | undefined

```

### Limitación importante: El contexto estático

Al trabajar con clases genéricas, existe una regla fundamental que no debes olvidar: **los miembros estáticos (`static`) de una clase no pueden usar el parámetro de tipo de la clase.**

El siguiente fragmento de código generará un error de compilación:

```typescript
class ContenedorInvalido<T> {
    private elemento: T; // Permitido (miembro de instancia)

    // ERROR: Static members cannot reference class type parameters.
    // static propiedadGlobal: T; 

    // ERROR: Static members cannot reference class type parameters.
    // static procesar(item: T) { ... }
}

```

#### ¿Por qué ocurre esto?

Los genéricos en las clases se aplican a las **instancias** de la clase. Cuando creas `new Pila<string>()` y `new Pila<number>()`, estás creando objetos independientes que operan con tipos diferentes en tiempo de ejecución.

Sin embargo, las propiedades y métodos estáticos pertenecen a la estructura de la clase en sí, no a sus instancias. Como solo existe una copia de los miembros estáticos compartida por toda la aplicación, TypeScript no tiene forma de determinar si `T` debería comportarse como `string`, `number` o cualquier otro tipo en ese contexto global.

Si necesitas que un método estático sea genérico, debes declararlo como una función genérica independiente dentro del método, desligada del `T` de la clase:

```typescript
class UtilidadArreglos {
    // El método estático declara su propio parámetro de tipo 'U'
    static duplicarElementos<U>(elementos: U[]): U[] {
        return [...elementos, ...elementos];
    }
}

// Se ejecuta directamente desde la clase definiendo el tipo en la llamada
const resultado = UtilidadArreglos.duplicarElementos<number>([1, 2]); // [1, 2, 1, 2]
```

## 9.4 Restricciones en tipos genéricos

Hasta este punto, los parámetros de tipo que hemos utilizado (como `<T>`) han sido completamente libres. Esto significa que `T` podía ser sustituido por absolutamente cualquier tipo de datos: un número, un objeto complejo, una cadena, un booleano o incluso una función.

Sin embargo, esta libertad absoluta tiene una contrapartida: como el compilador no sabe qué tipo de datos va a recibir, no nos permite realizar operaciones específicas sobre el objeto, limitando nuestras acciones a aquellas que sean válidas para cualquier entidad en TypeScript.

Para solucionar esto, podemos aplicar **restricciones genéricas (Generic Constraints)**. Mediante la palabra clave **`extends`**, podemos obligar a un parámetro de tipo a cumplir con una estructura mínima o a heredar de un conjunto de tipos específicos.

### El problema: Falta de información estructural

Imaginemos que queremos diseñar una función que reciba un objeto y muestre por consola su propiedad `.length`. Si intentamos escribirla con un genérico libre, TypeScript nos detendrá de inmediato:

```typescript
function registrarLongitud<T>(elemento: T): void {
    // ERROR: Property 'length' does not exist on type 'T'.
    // console.log(elemento.length); 
}

```

El compilador asume el peor escenario posible: si alguien invoca esta función pasando un número (por ejemplo, `registrarLongitud(101)`), el código fallará en tiempo de ejecución porque los números no poseen la propiedad `.length`.

### La solución: Uso de `extends`

Para corregir el error, debemos indicarle al compilador que `T` no puede ser cualquier tipo, sino únicamente aquellos tipos que posean, como mínimo, la propiedad `length` configurada como un número.

```typescript
// 1. Definimos una interfaz que actúe como molde o contrato mínimo
interface ConLongitud {
    length: number;
}

// 2. Restringimos el parámetro de tipo usando la palabra clave 'extends'
function registrarLongitud<T extends ConLongitud>(elemento: T): void {
    // Ahora es completamente seguro acceder a .length
    console.log(`La longitud es: ${elemento.length}`);
}

```

Al escribir `<T ConLongitud extends>`, estamos limitando el universo de tipos aceptables. Analicemos cómo reacciona el compilador ante diferentes tipos de datos:

```typescript
// VÁLIDO: Un string tiene de forma nativa la propiedad .length
registrarLongitud("Hola Mundo"); 

// VÁLIDO: Un arreglo tiene de forma nativa la propiedad .length
registrarLongitud([10, 20, 30, 40]);

// VÁLIDO: Un objeto personalizado que cumple explícitamente con la interfaz
registrarLongitud({ length: 5, nombre: "Mesa" });

// ERROR: Un número NO tiene la propiedad .length
// registrarLongitud(2026); 

```

### Restricciones basadas en propiedades de otros objetos (`keyof`)

Un patrón muy avanzado y útil en TypeScript consiste en restringir un parámetro de tipo basándose en las propiedades de *otro* tipo de dato. Para lograrlo, combinamos `extends` con el operador **`keyof`** (el cual extrae los nombres de las propiedades de un objeto como una unión de literales).

Supongamos que queremos crear una función segura para extraer el valor de cualquier propiedad de un objeto:

```typescript
function obtenerPropiedad<T, K extends keyof T>(objeto: T, clave: K) {
    return objeto[clave];
}

const usuario = {
    id: 45,
    nombre: "Eva",
    rol: "Administrador"
};

// VÁLIDO: 'nombre' es una clave real de nuestro objeto 'usuario'
const nombreUsuario = obtenerPropiedad(usuario, "nombre"); // Tipo inferido: string

// ERROR: 'email' no existe dentro de las claves de 'usuario'
// const emailUsuario = obtenerPropiedad(usuario, "email"); 

```

Gracias a `<K T extends keyof>`, el compilador analiza el primer argumento (`usuario`), deduce que sus claves válidas son `"id" | "nombre" | "rol"`, y restringe el segundo argumento (`clave`) para que solo acepte una de esas tres opciones literales.

## Resumen del capítulo

En este **Capítulo 9: Generics (Tipos Genéricos)**, hemos explorado en profundidad una de las características más potentes y avanzadas de TypeScript para crear componentes de software altamente reutilizables y tipados de forma segura:

* **Sintaxis y Propósito (9.1):** Aprendimos que los genéricos actúan como variables de tipos, permitiéndonos parametrizar funciones, interfaces o clases para que operen con múltiples tipos de datos sin degradar la experiencia de desarrollo a soluciones inseguras como `any`.
* **Funciones e Interfaces (9.2):** Estudiamos la implementación de genéricos en funciones tradicionales y funciones de flecha (esencial para ecosistemas modernos como React). Asimismo, vimos cómo estructurar interfaces genéricas para modelar contratos de datos flexibles, como las respuestas heterogéneas de una API.
* **Clases Genéricas (9.3):** Analizamos cómo encapsular lógica y estructuras de datos independientes (como pilas o contenedores) garantizando la consistencia interna del tipo, comprendiendo además que los miembros estáticos de una clase no pueden acceder a estos parámetros de tipo por limitaciones de su contexto global.
* **Restricciones Genéricas (9.4):** Concluimos aplicando la palabra clave `extends` y el operador `keyof` para acotar la flexibilidad de los genéricos, permitiéndonos exigir estructuras mínimas a los tipos entrantes sin perder la abstracción ni la seguridad tipográfica de nuestra aplicación.
