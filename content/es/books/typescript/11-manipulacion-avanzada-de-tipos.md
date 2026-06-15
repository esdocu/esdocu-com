Bienvenido al núcleo de la programación a nivel de tipos en TypeScript. En este capítulo, el sistema de tipos deja de ser una herramienta estática y declarativa para convertirse en un motor lógico, potente y dinámico capaz de computar en tiempo de compilación.

Aprenderás a aplicar los operadores `typeof` y `keyof` para realizar introspección sobre código existente, a definir flujos lógicos mediante tipos condicionales, a extraer información oculta con la palabra clave `infer` y a automatizar la transformación de estructuras completas usando tipos mapeados y plantillas literales. Domina estas herramientas para eliminar el código duplicado y crear arquitecturas de software ultra flexibles.

## 11.1 Operador keyof y typeof

TypeScript destaca por su capacidad para generar nuevos tipos a partir de estructuras de datos y tipos ya existentes. En lugar de duplicar manualmente las definiciones de tipos —lo cual viola el principio DRY (*Don't Repeat Yourself*) y aumenta el riesgo de errores de mantenimiento—, TypeScript proporciona dos operadores fundamentales para la introspección y la manipulación estática: `typeof` y `keyof`.

Aunque ambos operan en el "mundo de los tipos" durante la compilación, resuelven problemas opuestos y complementarios.

### El operador `typeof` en el contexto de tipos

En JavaScript vanilla, el operador `typeof` es un operador de ejecución (*runtime*) que devuelve una cadena de texto indicando el tipo básico de una variable (por ejemplo, `"string"`, `"object"` o `"undefined"`).

En TypeScript, **`typeof` se duplica** para ser utilizado también en el contexto de tipos. Cuando se usa en un lugar donde TypeScript espera un tipo (como después de un operador de asignación de tipo `:`), `typeof` extrae la forma o la estructura de una variable, objeto o función de JavaScript para que pueda ser reutilizada como un tipo estático.

#### Extrayendo el tipo de un objeto

Imagina que tienes una configuración basada en un objeto de JavaScript autogenerado o importado de una librería de terceros sin tipar:

```typescript
// Esto es un objeto de JavaScript en tiempo de ejecución
const configuracionServidor = {
    puerto: 8080,
    host: "localhost",
    reintentos: 3,
    activo: true
};

// Extraemos su estructura exacta para crear un Tipo de TypeScript
type Configuracion = typeof configuracionServidor;

/*
El tipo 'Configuracion' resultante equivale a:
type Configuracion = {
    puerto: number;
    host: string;
    reintentos: number;
    activo: boolean;
}
*/

// Ahora podemos usar este tipo de forma segura
const otraConfig: Configuracion = {
    puerto: 3000,
    host: "127.0.0.1",
    reintentos: 5,
    activo: false
};

```

#### Extrayendo el tipo de una función

`typeof` también es extremadamente útil con funciones, capturando su firma exacta (parámetros y valor de retorno):

```typescript
function procesarUsuario(id: number, nombre: string) {
    return { id, nombre, registrado: new Date() };
}

// Extrae la firma de la función
type FirmaProcesar = typeof procesarUsuario;
// Equivalente a: (id: number, nombre: string) => { id: number; nombre: string; registrado: Date; }

const clonProcesar: FirmaProcesar = (id, name) => {
    return { id, nombre: name, registrado: new Date() };
};

```

### El operador `keyof` (Operador de tipo índice)

El operador `keyof` toma un **tipo de objeto** y devuelve una **unión de tipos literales de cadena** con los nombres de sus propiedades (sus llaves o *keys*).

```text
Entrada (Tipo de Objeto)  ───► [ keyof ] ───► Salida (Unión de Literales)
 { id: number; name: string }                 "id" | "name"

```

A diferencia de `Object.keys()` de JavaScript (que extrae las llaves en tiempo de ejecución), `keyof` trabaja exclusivamente en tiempo de compilación.

#### Ejemplo básico de `keyof`

```typescript
interface Producto {
    id: string;
    nombre: string;
    precio: number;
    stock: number;
}

// Genera la unión de las llaves de la interfaz Producto
type PropiedadesProducto = keyof Producto; 
// Equivalente a: "id" | "nombre" | "precio" | "stock"

// Correcto: "precio" pertenece a la unión
let propiedadValida: PropiedadesProducto = "precio";

// Error de compilación: "descripcion" no existe en la unión del tipo Producto
let propiedadInvalida: PropiedadesProducto = "descripcion"; 

```

### Combinando `keyof` y `typeof`

La verdadera potencia de la manipulación de tipos emerge cuando combinamos ambos operadores. `keyof` requiere un **tipo**, no un valor de JavaScript. Si intentas aplicar `keyof` directamente a un objeto de ejecución, TypeScript lanzará un error. Primero debes convertir el valor en un tipo usando `typeof`.

```typescript
const rolesDeUsuario = {
    admin: "Acceso total",
    editor: "Modificar contenido",
    lector: "Solo lectura"
};

// ERROR: 'rolesDeUsuario' representa un valor, no un tipo.
// type RolesInvalido = keyof rolesDeUsuario; 

// CORRECTO: Primero extraemos el tipo, luego sus llaves.
type RolesValidos = keyof typeof rolesDeUsuario;
// Equivalente a: "admin" | "editor" | "lector"

function asignarRol(rol: RolesValidos) {
    console.log(`Asignando permisos para: ${rolesDeUsuario[rol]}`);
}

asignarRol("admin"); // Válido
asignarRol("superusuario"); // Error de compilación

```

### Casos de uso prácticos

#### 1. Acceso seguro a propiedades dinámicas (La función `obtenerPropiedad`)

Un patrón común en JavaScript es acceder dinámicamente a la propiedad de un objeto mediante una función. Sin `keyof` y los tipos genéricos (estudiados en el Capítulo 9), tipar esto de forma segura es imposible.

```typescript
function obtenerPropiedad<T, K extends keyof T>(objeto: T, llave: K): T[K] {
    return objeto[llave];
}

const auto = {
    marca: "Toyota",
    modelo: "Corolla",
    anio: 2022
};

// TypeScript infiere automáticamente que:
// T es el tipo de 'auto'
// K es "marca" | "modelo" | "anio"
// El retorno es de tipo string (porque auto["marca"] es string)
const marca = obtenerPropiedad(auto, "marca"); 

// Error de compilación: "color" no es una llave válida de 'auto'
const color = obtenerPropiedad(auto, "color"); 

```

#### 2. Validación de payloads en actualizaciones de datos

Cuando actualizas una entidad, a menudo deseas asegurarte de que los campos que estás modificando pertenecen legítimamente a la estructura original, evitando que se inyecten datos corruptos.

```typescript
interface Usuario {
    id: number;
    email: string;
    nombre: string;
}

// Una función que simula una actualización parcial en una base de datos
function actualizarUsuario(id: number, campo: keyof Usuario, valor: any) {
    // Lógica para actualizar el campo de forma segura
}

actualizarUsuario(1, "email", "nuevo@correo.com"); // Válido
actualizarUsuario(1, "password", "123456"); // Error: 'password' no existe en Usuario

```

## 11.2 Tipos condicionales y palabra clave infer

La verdadera flexibilidad del sistema de tipos de TypeScript se manifiesta cuando podemos introducir lógica condicional directamente en la definición de los tipos. Los **tipos condicionales** (*conditional types*) permiten que un tipo cambie de forma dinámica basándose en una condición, funcionando de manera análoga a una expresión ternaria (`condicion ? true : false`) en tiempo de ejecución, pero operando exclusivamente sobre los tipos del compilador.

### Sintaxis de los tipos condicionales

La sintaxis básica utiliza la palabra clave `extends` para evaluar una condición de asignación o compatibilidad de tipos:

$$T \text{ extends } U ? X : Y$$

* **$T \text{ extends } U$**: Es la condición. Comprueba si el tipo $T$ es asignable o compatible con el tipo $U$.
* **$X$**: El tipo resultante si la condición es verdadera.
* **$Y$**: El tipo resultante si la condición es falsa.

#### Un ejemplo introductorio

Imagina que necesitas un tipo utilitario que convierta cualquier tipo de dato en `string` si es un texto, o en `number` para cualquier otra cosa:

```typescript
type CheckString<T> = T extends string ? "Es String" : "No es String";

type Test1 = CheckString<string>;  // Tipo resultante: "Es String"
type Test2 = CheckString<number>;  // Tipo resultante: "No es String"

```

En aplicaciones reales, esto se utiliza para sobrecargar de manera limpia flujos de datos complejos sin recurrir a la duplicación de firmas:

```typescript
interface IdDeTexto {
    id: string;
}

interface IdNumerico {
    id: number;
}

// El tipo condicional decide qué estructura retornar según el parámetro genérico
type TipoDeId<T extends string | number> = T extends string ? IdDeTexto : IdNumerico;

function crearInstancia<T extends string | number>(valor: T): TipoDeId<T> {
    throw "Implementación omitida";
}

let trackingTexto = crearInstancia("UUID-1234"); // Tipo: IdDeTexto
let trackingNumero = crearInstancia(101);       // Tipo: IdNumerico

```

### Distributividad en tipos condicionales

Cuando se pasa un **tipo de unión** (como `string | number`) a un tipo condicional genérico, TypeScript aplica una propiedad llamada **distributividad**. Esto significa que la condición se evalúa individualmente para cada miembro de la unión, y el resultado final es una nueva unión de los resultados parciales.

```text
Entrada:     CheckString<string | number>
             │
Distribución:├──► CheckString<string> ───► "Es String"
             └──► CheckString<number> ───► "No es String"
             │
Resultado:   "Es String" | "No es String"

```

#### Exclusión de tipos con distributividad

Podemos aprovechar esta característica para filtrar miembros específicos de una unión de tipos. Así es exactamente como funcionan por dentro tipos nativos como `Exclude` (visto en el Capítulo 10):

```typescript
// Si T es asignable a U, lo eliminamos (retornando 'never'). Si no, lo conservamos.
type Filtrar<T, U> = T extends U ? never : T;

type Colores = "rojo" | "verde" | "azul" | "amarillo";

// Queremos remover los colores primarios de la pantalla "rojo" y "azul"
type ColoresFiltrados = Filtrar<Colores, "rojo" | "azul">;
// Resultado: "verde" | "amarillo"

```

> **Nota:** El tipo `never` actúa como el elemento neutro en las uniones de TypeScript. Al unirse con cualquier otro tipo, desaparece (`"verde" | "amarillo" | never` se reduce a `"verde" | "amarillo"`).

### La palabra clave `infer`

La palabra clave `infer` introduce la capacidad de **declarar una variable de tipo temporal** dentro de la condición de un tipo condicional. En lugar de verificar si un tipo coincide exactamente con otro, `infer` le dice a TypeScript: *"Intenta descubrir de forma automática qué tipo va en esta posición exacta y extraelo"*.

Solo se puede utilizar `infer` dentro de la cláusula de verificación (`extends`) de un tipo condicional.

#### Extraer el tipo de retorno de una función

Uno de los usos más potentes de `infer` es examinar la firma de una función para descubrir qué tipo de dato devuelve, sin importar cuán compleja sea la función.

```typescript
// Indicamos que T debe ser una función. Usamos infer R para capturar el valor de retorno.
type ObtenerRetorno<T> = T extends (...args: any[]) => infer R ? R : never;

function calcularImpuestos() {
    return { iva: 21, total: 1500, moneda: "ARS" };
}

// Extraemos el tipo de la estructura que devuelve 'calcularImpuestos'
type DatosFactura = ObtenerRetorno<typeof calcularImpuestos>;

/*
Resultado:
type DatosFactura = {
    iva: number;
    total: number;
    moneda: string;
}
*/

```

#### Extraer el tipo interno de una Promesa

Si estás trabajando con APIs asíncronas y necesitas conocer el tipo de dato que una `Promise` va a resolver, puedes "desenvolver" la promesa usando `infer`:

```typescript
type DesempaquetarPromesa<T> = T extends Promise<infer U> ? U : T;

type RespuestaAPI = Promise<{ status: number; data: string[] }>;

// Extrae el objeto interno de la Promesa
type ContenidoRespuesta = DesempaquetarPromesa<RespuestaAPI>;
// Resultado: { status: number; data: string[]; }

// Si no es una promesa, devuelve el mismo tipo
type TextoSimple = DesempaquetarPromesa<string>; 
// Resultado: string

```

#### Extraer el tipo de los elementos de un Arreglo

También puedes usar `infer` para inspeccionar colecciones y extraer el tipo de los elementos que almacena un arreglo:

```typescript
type TipoDelElemento<T> = T extends (infer U)[] ? U : T;

type ListaDeNumeros = number[];
type TipoInterno = TipoDelElemento<ListaDeNumeros>; // Resultado: number

type SoloUnValor = boolean;
type TipoNoArreglo = TipoDelElemento<SoloUnValor>; // Resultado: boolean (cae en el caso falso)

```

## 11.3 Tipos mapeados (Mapped Types)

Cuando necesitas crear nuevos tipos basados en las propiedades de un tipo existente de manera uniforme y repetitiva, los **tipos mapeados** (*mapped types*) son la herramienta ideal. Funcionan de forma muy similar al método `.map()` de los arreglos en JavaScript: en lugar de transformar elementos de una lista, los tipos mapeados iteran sobre una unión de llaves (generalmente obtenidas mediante `keyof`) para transformar las propiedades de un tipo en un nuevo conjunto de propiedades.

### Sintaxis fundamental

La sintaxis de un tipo mapeado utiliza una estructura de firma de índice combinada con el operador `in`:

```typescript
type MiTipoMapeado<T> = {
    [P in keyof T]: T[P];
};

```

* **`keyof T`**: Obtiene una unión de todas las llaves del tipo original `T`.
* **`P in ...`**: Actúa como un bucle `for...in`. La variable de tipo `P` representa cada propiedad individual durante la iteración.
* **`T[P]`**: Es un **tipo de acceso indexado**. Accede al tipo original de la propiedad `P` en el objeto `T`.

#### Un ejemplo de transformación simple

Imagina que quieres transformar todas las propiedades de un tipo para que su valor sea estrictamente de tipo `boolean` (por ejemplo, para controlar los permisos de edición de cada campo):

```typescript
interface Usuario {
    id: number;
    nombre: string;
    email: string;
}

// Mapeamos el tipo: mantenemos las llaves, pero forzamos el valor a 'boolean'
type PermisosUsuario = {
    [K in keyof Usuario]: boolean;
};

/*
El tipo resultante equivale a:
type PermisosUsuario = {
    id: boolean;
    nombre: boolean;
    email: boolean;
}
*/

const permisos: PermisosUsuario = {
    id: true,
    nombre: false,
    email: true
};

```

### Modificadores de mapeo (`+` y `-`)

Durante el proceso de mapeo, puedes aplicar o remover dos modificadores clave en las propiedades: `readonly` (solo lectura) y `?` (opcional). Esto se logra anteponiendo los signos `+` (para añadir, comportamiento por defecto si se omite) o `-` (para remover).

#### 1. Convertir todas las propiedades en opcionales (Implementación de `Partial`)

Así es como TypeScript implementa internamente el tipo utilitario nativo `Partial` (visto en el Capítulo 10):

```typescript
type ConvertirEnOpcional<T> = {
    [K in keyof T]?: T[K]; // El modificador '?' hace que cada propiedad sea opcional
};

interface Producto {
    codigo: string;
    precio: number;
}

type ProductoOpcional = ConvertirEnOpcional<Producto>;
/*
type ProductoOpcional = {
    codigo?: string;
    precio?: number;
}
*/

```

#### 2. Remover modificadores (Hacer las propiedades requeridas y mutables)

Si tienes un tipo con propiedades opcionales o de solo lectura y necesitas un tipo "limpio" donde todo sea obligatorio y modificable, usas el prefijo `-`:

```typescript
interface ConfiguracionCualquiera {
    readonly apiEndpoint?: string;
    readonly timeout?: number;
}

type ForzarConfiguracion<T> = {
    -readonly [K in keyof T]-?: T[K]; // Remueve 'readonly' y remueve '?'
};

type ConfigEstricta = ForzarConfiguracion<ConfiguracionCualquiera>;
/*
type ConfigEstricta = {
    apiEndpoint: string; // Ya no es opcional ni readonly
    timeout: number;     // Ya no es opcional ni readonly
}
*/

```

### Remapeo de llaves con la palabra clave `as`

En versiones modernas de TypeScript, puedes cambiar el nombre de las llaves mientras iteras sobre ellas utilizando la cláusula `as`. Esto te permite generar nuevas propiedades dinámicamente, por ejemplo, combinándolas con los **Template Literal Types** (que se detallarán en la sección 11.4).

#### Ejemplo: Generar métodos Getter automáticamente

Supongamos que a partir de un objeto de datos quieres generar un tipo que represente todos sus métodos de acceso correspondientes (*getters*):

```typescript
interface DatosPerfil {
    nombre: string;
    edad: number;
}

// Capitalize es un tipo utilitario nativo que pone la primera letra en mayúscula
type GenerarGetters<T> = {
    [K in keyof T as `get${Capitalize<K & string>}`]: () => T[K];
};

type GettersPerfil = GenerarGetters<DatosPerfil>;
/*
El tipo resultante genera llaves dinámicas:
type GettersPerfil = {
    getNombre: () => string;
    getEdad: () => number;
}
*/

const servicioPerfil: GettersPerfil = {
    getNombre: () => "Sofía",
    getEdad: () => 29
};

```

#### Ejemplo: Filtrar propiedades por su tipo de dato

También puedes usar `as` junto con un tipo condicional para omitir propiedades que no cumplan con un criterio específico, mapeando la llave a `never`:

```typescript
// Mapeamos solo las llaves cuyo valor original sea de tipo 'string'
type SoloPropiedadesDeTexto<T> = {
    [K in keyof T as T[K] extends string ? K : never]: T[K];
};

interface Empleado {
    id: number;
    nombre: string;
    puesto: string;
    activo: boolean;
}

type DatosTextoEmpleado = SoloPropiedadesDeTexto<Empleado>;
/*
'id' y 'activo' se evalúan a 'never' y TypeScript los descarta automáticamente de las llaves
type DatosTextoEmpleado = {
    nombre: string;
    puesto: string;
}
*/

```

## 11.4 Template Literal Types

Los **Template Literal Types** (tipos literales de plantilla) introducen a los tipos de TypeScript la misma flexibilidad de manipulación de cadenas que los *template literals* de ES6 aportan al código de ejecución. Esta característica permite construir tipos basados en cadenas de texto combinando tipos literales mediante una sintaxis idéntica a la de los *backticks* (```) de JavaScript.

Cuando un tipo de plantilla literal se combina con un tipo de unión, TypeScript expande automáticamente la estructura para generar todas las permutaciones y combinaciones posibles de cadenas en tiempo de compilación.

### Sintaxis y combinación básica

La sintaxis utiliza las comillas invertidas junto con el marcador `${}` para interpolar otros tipos literales dentro de una cadena de texto:

```typescript
type Protocolo = "http" | "https";
type Dominio = "api.com" | "web.com";

// TypeScript genera automáticamente todas las combinaciones posibles
type URLDeConexion = `${Protocolo}://${Dominio}`;

/*
El tipo resultante equivale a:
type URLDeConexion = "http://api.com" | "http://web.com" | "https://api.com" | "https://web.com"
*/

const miEndpoint: URLDeConexion = "https://api.com"; // Válido
const urlInvalida: URLDeConexion = "ftp://api.com";   // Error de compilación

```

### Tipos utilitarios para la manipulación de texto

Para maximizar la utilidad de los Template Literal Types, TypeScript incluye de forma nativa cuatro tipos genéricos globales diseñados específicamente para transformar texto. Estos operadores se aplican directamente dentro de las plantillas:

* **`Uppercase<T>`**: Convierte todos los caracteres de la cadena a mayúsculas.
* **`Lowercase<T>`**: Convierte todos los caracteres de la cadena a minúsculas.
* **`Capitalize<T>`**: Convierte el primer carácter de la cadena a mayúscula.
* **`Uncapitalize<T>`**: Convierte el primer carácter de la cadena a minúscula.

```typescript
type Direccion = "norte" | "sur";

type EventoDireccion = `irAl${Capitalize<Direccion>}`;
// Tipo resultante: "irAlNorte" | "irAlSur"

const accion: EventoDireccion = "irAlNorte";

```

### Aplicación práctica avanzada: Arquitectura basada en eventos

Un caso de uso del mundo real sumamente común es la tipificación estricta de sistemas de eventos, como selectores de elementos, eventos del DOM, o manejadores de estado globales (estilo Redux / Vuex), donde las funciones escuchan cambios con base en un patrón de nombres predecible.

```typescript
interface ConfiguracionUI {
    tema: "oscuro" | "claro";
    sidebarAbierto: boolean;
    volumen: number;
}

// Generamos automáticamente las funciones "onNombreDePropiedadChange"
type ManejadoresEventos<T> = {
    [K in keyof T as `on${Capitalize<K & string>}Change`]?: (nuevoValor: T[K]) => void;
};

type EventosUI = ManejadoresEventos<ConfiguracionUI>;
/*
El tipo resultante equivale a:
type EventosUI = {
    onTemaChange?: (nuevoValor: "oscuro" | "claro") => void;
    onSidebarAbiertoChange?: (nuevoValor: boolean) => void;
    onVolumenChange?: (nuevoValor: number) => void;
}
*/

const escucharEventos: EventosUI = {
    onTemaChange: (nuevoTema) => console.log(`Cambiado a ${nuevoTema}`),
    onVolumenChange: (v) => console.log(`Volumen actual: ${v}`)
};

```

## Resumen del capítulo

En este **Capítulo 11: Manipulación Avanzada de Tipos**, hemos explorado las herramientas que transforman el sistema de tipos de TypeScript de una herramienta puramente descriptiva a un lenguaje de programación lógico y dinámico en tiempo de compilación.

* **`typeof` y `keyof`**: Aprendimos a realizar introspección sobre código JavaScript existente. `typeof` extrae la forma estática de variables y funciones, mientras que `keyof` descompone los tipos de objetos en uniones de sus llaves literales, permitiendo el acceso dinámico y seguro a sus propiedades.
* **Tipos condicionales e `infer`**: Introdujimos lógica condicional de tipo ternaria ($T \text{ extends } U ? X : Y$) y descubrimos cómo la palabra clave `infer` puede desempaquetar y extraer de forma automática información interna de estructuras complejas como promesas, arreglos y firmas de funciones.
* **Tipos mapeados**: Estudiamos cómo iterar sobre uniones de llaves para transformar de manera uniforme las propiedades de un tipo, manipulando su opcionalidad o mutabilidad mediante los operadores `+` y `-`, o incluso remapeando sus nombres mediante la cláusula `as`.
* **Template Literal Types**: Concluimos el capítulo combinando tipos literales de cadena con expresiones de plantilla para automatizar la generación de cadenas complejas y estructuradas, abriendo las puertas a una tipificación estricta en arquitecturas orientadas a eventos y patrones de nomenclatura automáticos.
