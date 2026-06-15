En JavaScript, los objetos son flexibles pero impredecibles. TypeScript introduce orden transformando esa flexibilidad en estructuras seguras y predecibles. En este capítulo, aprenderás a definir la forma exacta (*shape*) de tus objetos mediante contratos estrictos que el compilador validará constantemente. Exploraremos cómo crear plantillas reutilizables con alias de tipos, modularizar estructuras complejas y restringir variables a valores exactos usando tipos literales. Finalmente, dominaremos el control total de las propiedades mediante modificadores de opcionalidad y de solo lectura.

## 5.1 Creación de tipos de objetos

En JavaScript, los objetos son la estructura fundamental para agrupar datos y funcionalidades. Al ser un lenguaje de tipado dinámico, un objeto puede cambiar de forma en cualquier momento, añadiendo o eliminando propiedades de manera impredecible. TypeScript resuelve esta falta de certeza permitiendo definir de manera explícita la forma (*shape*) que debe tener un objeto. Al estructurar un tipo de objeto, se establece un contrato estricto que el compilador validará constantemente, garantizando que el acceso a sus datos sea seguro y libre de errores en tiempo de ejecución.

### Sintaxis básica de un objeto literal tipado

La forma más directa de estructurar un objeto en TypeScript es definir su tipo de manera interna (*inline*) en el momento de declarar la variable. Esto se logra abriendo llaves `{}` en el espacio reservado para el tipo, especificando los nombres de las propiedades junto con sus respectivos tipos de datos.

```typescript
const usuario: { nombre: string; edad: number; esAdministrador: boolean } = {
    nombre: "Ana Martínez",
    edad: 28,
    esAdministrador: true
};

```

En este caso, la variable `usuario` tiene un tipo de objeto explícito. Si se intenta asignar un valor con una estructura diferente, o si se intenta omitir alguna de las propiedades definidas, el compilador de TypeScript detendrá el proceso con un error de tipado.

### Anatomía de la declaración de tipos de objetos

Cuando se define el esquema de un objeto, cada propiedad sigue una regla clara de validación. La sintaxis se compone de la siguiente manera:

* **Identificador de la propiedad:** El nombre de la clave dentro del objeto.
* **Anotación de tipo:** Especifica el tipo de dato que almacenará dicha clave (primitivos, arreglos, funciones u otros objetos).
* **Delimitador:** Cada par propiedad-tipo se separa mediante un punto y coma `;` o una coma `,`. El uso de punto y coma es la convención más extendida dentro de la comunidad.

A continuación se muestra una representación abstracta de cómo el compilador segmenta y analiza la memoria de un tipo de objeto:

```text
+---------------------------------------------------------+
|                  Estructura del Objeto                  |
+---------------------------------------------------------+
|  Propiedad         Tipo de Dato       Estado            |
+---------------------------------------------------------+
|  .nombre     --->  string             Requerido         |
|  .edad       --->  number             Requerido         |
|  .activo     --->  boolean            Requerido         |
+---------------------------------------------------------+

```

### Comportamiento del compilador ante mutaciones y accesos

Una vez que un objeto ha sido tipado, TypeScript restringe cualquier interacción que rompa su contrato original. Esto se traduce en dos protecciones clave:

1. **Bloqueo de propiedades inexistentes:** No se puede acceder ni asignar valor a una propiedad que no se haya declarado explícitamente en el tipo.
2. **Garantía de tipo:** No se puede cambiar el tipo de dato de una propiedad existente.

```typescript
const producto: { codigo: string; precio: number } = {
    codigo: "PROD-102",
    precio: 24.99
};

// ERROR: La propiedad 'descuento' no existe en el tipo.
producto.descuento = 0.10; 

// ERROR: El tipo 'string' no es asignable al tipo 'number'.
producto.precio = "veinticinco"; 

```

### Métodos dentro de los tipos de objetos

Los objetos en desarrollo no solo guardan datos estáticos, también contienen funciones que ejecutan lógica interna (métodos). TypeScript permite definir métodos dentro de la estructura del objeto utilizando dos sintaxis equivalentes: la sintaxis de función clásica o la sintaxis de función de flecha.

```typescript
const calculadora: {
    resultado: number;
    sumar: (valor: number) => void;       // Sintaxis de función de flecha
    restar(valor: number): void;          // Sintaxis de método estándar
} = {
    resultado: 0,
    sumar(valor) {
        this.resultado += valor;
    },
    restar(valor) {
        this.resultado -= valor;
    }
};

```

Ambas declaraciones aseguran que los argumentos pasados a estas funciones y sus valores de retorno respeten los tipos definidos, evitando ejecuciones erróneas en la lógica de negocio.

### Estructuras de objetos anidados

El verdadero potencial del modelado de objetos se manifiesta cuando se requiere trabajar con datos complejos y jerárquicos. Un tipo de objeto puede contener dentro de sus propiedades a otro tipo de objeto de manera indefinida.

```typescript
const empresa: {
    nombre: string;
    ubicacion: {
        pais: string;
        ciudad: string;
        codigoPostal: number;
    };
    conteoEmpleados: number;
} = {
    nombre: "Tecnologías Avanzadas S.A.",
    ubicacion: {
        pais: "España",
        ciudad: "Madrid",
        codigoPostal: 28001
    },
    conteoEmpleados: 150
};

```

Para acceder o modificar las propiedades de un objeto anidado, TypeScript valida recursivamente cada nivel de la estructura. Si escribes `empresa.ubicacion.ciudad`, el compilador comprobará primero si `ubicacion` existe en `empresa`, y posteriormente si `ciudad` existe dentro de `ubicacion`, garantizando la seguridad en toda la cadena de navegación.

## 5.2 Alias de tipos (Type Aliases)

En la sección anterior se examinó cómo estructurar tipos de objetos de forma interna (*inline*). Aunque este enfoque es útil para estructuras simples, presenta un problema evidente a medida que el código crece: la falta de reutilización. Si múltiples funciones o variables requieren la misma estructura de objeto, repetir la definición interna duplica el código y dificulta enormemente el mantenimiento.

Para resolver esto, TypeScript introduce los **Alias de tipos** (*Type Aliases*). Un alias de tipo permite asignar un nombre único y reutilizable a cualquier definición de tipo, funcionando como un molde o plantilla en toda la aplicación.

### Sintaxis y declaración

Un alias de tipo se crea utilizando la palabra clave `type`, seguida del nombre asignado al alias (por convención, utilizando *PascalCase*), un signo de igualdad `=` y la definición del tipo correspondiente.

```typescript
// Definición del alias de tipo
type Empleado = {
    id: number;
    nombre: string;
    departamento: string;
    sueldo: number;
};

// Uso del alias en variables
const desarrollador: Empleado = {
    id: 101,
    nombre: "Carlos Gómez",
    departamento: "Ingeniería",
    sueldo: 45000
};

const disenadora: Empleado = {
    id: 102,
    nombre: "Laura Rivas",
    departamento: "Diseño",
    sueldo: 42000
};

```

Al utilizar `Empleado`, se reduce drásticamente la redundancia. Si en el futuro el modelo de datos requiere un nuevo campo (como `email`), solo será necesario modificar la definición del tipo `type Empleado` en un único lugar.

### Reutilización en funciones y colecciones

Los alias de tipos no solo limpian la declaración de variables, sino que transforman la legibilidad de las firmas de las funciones y las colecciones de datos, como los arreglos.

```typescript
// Uso de un alias de tipo como parámetro de función
function calcularBono(empleado: Empleado): number {
    return empleado.sueldo * 0.10;
}

// Uso de un alias de tipo para estructurar un arreglo
const nomina: Empleado[] = [desarrollador, disenadora];

```

Sin el alias de tipo, la firma de la función `calcularBono` habría requerido una declaración interna idéntica a la de las variables, penalizando severamente la legibilidad del código.

### Abstracción de tipos anidados mediante alias

Cuando se trabaja con objetos complejos con múltiples niveles de anidamiento, escribir toda la estructura dentro de un solo bloque puede volverse confuso. Los alias de tipos permiten separar las responsabilidades abstrayendo cada subestructura en su propio tipo independiente.

A continuación se compara el flujo visual de una estructura anidada directa frente a una modularizada mediante alias:

```text
Enfoque Inline (Monolítico):
[ Objeto Principal { Propiedad A, Propiedad B { Sub-propiedad 1, Sub-propiedad 2 } } ]

Enfoque con Alias de Tipos (Modular):
[ type SubEstructura ] ---> Se integra en ---> [ type EstructuraPrincipal ]

```

Llevando este concepto al código, se puede reestructurar el ejemplo de la sección anterior de una manera mucho más limpia:

```typescript
type Direccion = {
    pais: string;
    ciudad: string;
    codigoPostal: number;
};

type Empresa = {
    nombre: string;
    ubicacion: Direccion; // Integración del alias 'Direccion'
    conteoEmpleados: number;
};

const miEmpresa: Empresa = {
    nombre: "Innovación Digital",
    ubicacion: {
        pais: "México",
        ciudad: "CDMX",
        codigoPostal: 01000
    },
    conteoEmpleados: 85
};

```

Esta modularidad no solo hace que `Empresa` sea más fácil de leer, sino que además deja el tipo `Direccion` completamente disponible para ser reutilizado en otros contextos, como en un tipo `Usuario` o `Proveedor`.

### Más allá de los objetos: Alias para cualquier tipo

Es común asociar los alias de tipos exclusivamente con los objetos, pero su versatilidad va mucho más allá. La palabra clave `type` puede asignarle un nombre a **cualquier tipo de dato válido en TypeScript**, incluyendo tipos primitivos, uniones o tuplas. Esto es especialmente útil para dar contexto semántico al código.

```typescript
type Identificador Único = string;
type Coordenadas = [number, number]; // Alias asignado a una tupla

const ID_De_Usuario: IdentificadorÚnico = "usr_992384";
const posicionGeografica: Coordenadas = [40.4167, -3.7037];

```

*Nota: Aunque técnicamente `IdentificadorÚnico` sigue siendo un `string` bajo el capó para el compilador, leer la declaración ayuda al desarrollador a comprender de inmediato el propósito de esa variable en el dominio de la aplicación.*

## 5.3 Tipos literales y su utilidad

Hasta ahora, hemos trabajado con tipos de datos amplios como `string`, `number` o `boolean`. Una variable de tipo `string` puede contener billones de combinaciones de caracteres posibles. Sin embargo, en el desarrollo de software real, a menudo nos enfrentamos a situaciones donde una variable solo debe permitir unos pocos valores específicos.

TypeScript resuelve esto mediante los **Tipos Literales**. Un tipo literal subordina el tipo general a un valor exacto y concreto. Al usar tipos literales, el valor en sí mismo se convierte en el tipo.

### El origen de los tipos literales: `let` frente a `const`

Para entender cómo TypeScript deduce los tipos literales, es fundamental observar cómo se comportan las palabras clave `let` y `const` bajo el mecanismo de inferencia de tipos.

```typescript
let estadoLet = "activo";  // Inferencia: string
const estadoConst = "activo"; // Inferencia: "activo"

```

* `estadoLet` se declara con `let`, lo que significa que su valor puede cambiar en el futuro. TypeScript le asigna el tipo genérico `string`.
* `estadoConst` se declara con `const`. Como su valor es inmutable y nunca podrá ser otra cosa que `"activo" Broadway`, TypeScript infiere un tipo mucho más específico: el tipo literal `"activo"`.

### Combinando tipos literales con uniones

Un tipo literal por sí solo (como `const` lo genera automáticamente) es de utilidad limitada. Su verdadero poder se desbloquea al combinarlo con los **Tipos de Unión** (utilizando el operador `|`). Esto nos permite crear un conjunto cerrado y seguro de valores permitidos.

```typescript
type EstadoPedido = "pendiente" | "enviado" | "entregado";

let miPedido: EstadoPedido = "pendiente";

// OK: "enviado" es una opción válida dentro del tipo EstadoPedido.
miPedido = "enviado"; 

// ERROR: El tipo '"cancelado"' no es asignable al tipo 'EstadoPedido'.
miPedido = "cancelado"; 

```

Gracias a esto, el compilador actúa como una red de seguridad infalible contra errores tipográficos comunes (como escribir `"enbiado"` por error), atrapando el fallo antes de que el código llegue a ejecutarse.

### Tipos literales numéricos y booleanos

Los tipos literales no se limitan exclusivamente a las cadenas de texto; se pueden aplicar exactamente igual a números y a valores booleanos.

```typescript
// Literal Numérico: ideal para configuraciones de cuadrículas o sistemas de control
type DadosValidos = 1 | 2 | 3 | 4 | 5 | 6;
let resultadoDado: DadosValidos = 4; // OK
// let resultadoDado: DadosValidos = 7; // ERROR

// Literal Booleano: fuerza a que el valor sea estrictamente uno de los dos estados
type EstadoAprobado = true;
let actaFinal: EstadoAprobado = true; // OK
// let actaFinal: EstadoAprobado = false; // ERROR

```

### Aplicación práctica en funciones

Una de las utilidades más potentes de los tipos literales es la parametrización estricta de funciones. Tomemos como ejemplo una función encargada de realizar peticiones HTTP:

```typescript
type MetodoHttp = "GET" | "POST" | "PUT" | "DELETE";

function realizarPeticion(url: string, metodo: MetodoHttp) {
    // Lógica de la petición...
}

// Ejecución correcta
realizarPeticion("https://api.ejemplo.com/usuarios", "GET");

// ERROR: El argumento de tipo '"PATCH"' no es asignable al parámetro de tipo 'MetodoHttp'.
realizarPeticion("https://api.ejemplo.com/usuarios/1", "PATCH");

```

### El problema de la aserción de objetos literales

Cuando pasamos propiedades de objetos a funciones que esperan tipos literales, podemos tropezar con un comportamiento particular del compilador. Analicemos el siguiente escenario:

```typescript
type DireccionVisual = "horizontal" | "vertical";

function configurarLayout(opciones: { direccion: DireccionVisual }) {
    // ...
}

const config = {
    direccion: "horizontal" // TypeScript infiere que es de tipo 'string'
};

// ERROR: El tipo 'string' no es asignable al tipo '"horizontal" | "vertical"'.
configurarLayout(config); 

```

**¿Por qué falla si el valor es `"horizontal"`?** TypeScript infiere que `config.direccion` es un `string` general porque modificas un objeto dinámico y podrías cambiar `config.direccion = "cualquier-otra-cosa"` en la línea siguiente.

Para resolver este problema y asegurar que el objeto sea tratado como un tipo literal estricto, se utiliza la aserción de solo lectura `as const`:

```typescript
const configFija = {
    direccion: "horizontal"
} as const; // Transforma todas las propiedades en tipos literales de solo lectura

// OK: Ahora 'configFija.direccion' tiene el tipo literal exacto '"horizontal"'
configurarLayout(configFija); 

```

## 5.4 Propiedades opcionales y de solo lectura

En el desarrollo de software, las estructuras de datos rara vez son completamente homogéneas o estáticas. Con frecuencia nos encontramos con objetos que contienen información que no siempre está disponible, o con datos críticos que, una vez asignados, jamás deberían ser modificados.

TypeScript aborda estas dos necesidades del mundo real mediante dos modificadores clave para las propiedades de los objetos: el operador de opcionalidad (`?`) y el modificador de solo lectura (`readonly`).

### Propiedades opcionales (`?`)

Por defecto, toda propiedad declarada en un tipo de objeto o alias de tipo es estrictamente obligatoria. Si intentamos omitir una de ellas al crear un objeto, el compilador arrojará un error. Sin embargo, podemos marcar una propiedad como opcional añadiendo un signo de interrogación `?` justo después de su nombre.

```typescript
type UsuarioPerfil = {
    id: number;
    nombre: string;
    biografia?: string; // Propiedad opcional
};

// OK: No es obligatorio declarar 'biografia'
const usuarioMinimo: UsuarioPerfil = {
    id: 45,
    nombre: "Lucas Silva"
};

// OK: También es completamente válido incluirla
const usuarioCompleto: UsuarioPerfil = {
    id: 46,
    nombre: "Sofía Castro",
    biografia: "Desarrolladora backend apasionada por la arquitectura de software."
};

```

#### El tipo implícito `undefined`

Bajo el capó, cuando marcamos una propiedad como opcional, TypeScript realiza una unión implícita de esa propiedad con el tipo `undefined`. En el ejemplo anterior, el tipo real de `biografia` pasa a ser `string | undefined`.

Esto nos obliga a realizar validaciones de seguridad antes de operar con dicha propiedad, evitando errores en tiempo de ejecución:

```typescript
function imprimirBio(usuario: UsuarioPerfil) {
    // ERROR: 'usuario.biografia' puede ser 'undefined'.
    // console.log(usuario.biografia.toUpperCase()); 

    // Forma correcta mediante una validación previa
    if (usuario.biografia) {
        console.log(usuario.biografia.toUpperCase());
    }
}

```

### Propiedades de solo lectura (`readonly`)

Existen datos en nuestros objetos que actúan como identificadores únicos o valores de configuración que no deben alterarse tras su creación. Anteponer la palabra clave `readonly` a una propiedad le indica al compilador que ese valor es de naturaleza inmutable.

```typescript
type ConfigConexion = {
    readonly token: string;
    url: string;
};

const miConexion: ConfigConexion = {
    token: "auth_token_abc123",
    url: "https://api.servidor.com"
};

// OK: Las propiedades normales se pueden modificar sin problemas
miConexion.url = "https://api.servidor-espejo.com";

// ERROR: No se puede asignar a 'token' porque es una propiedad de solo lectura.
// miConexion.token = "nuevo_token"; 

```

#### Comportamiento con objetos anidados y arreglos

Es crucial entender que `readonly` realiza una verificación superficial (*shallow*). Si una propiedad de solo lectura apunta a un objeto o a un arreglo, TypeScript impedirá que reasignes el objeto completo, pero sí te permitirá modificar las propiedades internas de ese objeto o mutar los elementos del arreglo.

```typescript
type Almacen = {
    readonly metadatos: {
        version: number;
    };
};

const miAlmacen: Almacen = {
    metadatos: { version: 1 }
};

// ERROR: No puedes reasignar el objeto completo
// miAlmacen.metadatos = { version: 2 }; 

// OK: TypeScript permite modificar la propiedad interna del objeto anidado
miAlmacen.metadatos.version = 2; 

```

Si deseas mitigar este comportamiento y hacer que todo un objeto anidado sea completamente inmutable, debes aplicar `readonly` explícitamente a cada nivel de la estructura o recurrir a aserciones literales como `as const`.

## Resumen del capítulo

El **Capítulo 5: Objetos y Tipos Personalizados** ha establecido los pilares para estructurar datos complejos con total seguridad en TypeScript. A lo largo de sus lecciones, aprendimos a:

* **Crear tipos de objetos** mediante sintaxis interna (*inline*), definiendo la forma estricta que deben cumplir los datos y los métodos dentro de nuestra aplicación.
* **Abstraer y reutilizar estructuras** a través de los **Alias de tipos (`Type Aliases`)**, permitiendo modularizar objetos anidados y dotar de significado semántico a cualquier tipo de dato.
* **Restringir variables a valores exactos** combinando **Tipos Literales** con uniones, transformando valores numéricos o cadenas de texto en tipos estrictos para evitar errores de escritura.
* **Flexibilizar y proteger las propiedades** de los objetos utilizando el operador de opcionalidad (`?`) para campos ausentes y el modificador `readonly` para blindar datos críticos contra mutaciones accidentales.
