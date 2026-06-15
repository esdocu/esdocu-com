Dominar TypeScript requiere ir más allá de los tipos fijos y estáticos. En el desarrollo real, los datos cambian, se mezclan y adoptan múltiples formas. Este capítulo explora cómo combinar tipos existentes de manera estratégica para diseñar software flexible y robusto. Aprenderás a usar las uniones (`|`) para permitir múltiples estructuras de datos y las intersecciones (`&`) para fusionar definiciones mediante la composición. Además, descubriremos cómo el compilador analiza el flujo de control para estrechar tipos de forma inteligente, permitiéndote escribir un código altamente preciso y completamente libre de errores en tiempo de ejecución.

## 8.1 Concepto y uso de Tipos de Unión

En los capítulos anteriores hemos aprendido a asignar un único tipo específico a nuestras variables, parámetros o propiedades. Sin embargo, en el desarrollo de software del mundo real, es sumamente común encontrarse con situaciones donde un dato puede adoptar diferentes formas. Por ejemplo, el identificador de un usuario en una base de datos podría ser un número entero (`1024`) o un formato UUID de tipo cadena de texto (`"usr_9f82"`).

Si estuviéramos restringidos a un solo tipo, nos veríamos tentados a recurrir al peligroso tipo `any`, perdiendo todos los beneficios de la comprobación estática de TypeScript. Para solucionar este problema de forma segura y elegante, TypeScript introduce el concepto de **Tipos de Unión** (Union Types).

Un tipo de unión permite a una variable almacenar valores de **dos o más tipos diferentes**. Representa la noción lógica del operador `OR` (`||`) aplicado a nivel de diseño de tipos.

### Sintaxis básica

Para definir un tipo de unión, utilizamos el carácter de barra vertical (`|`) para separar los tipos permitidos.

```typescript
let identificador: string | number;

identificador = 1024;       // Válido
identificador = "usr_9f82"; // Válido
// identificador = true;    // Error de compilación: El tipo 'boolean' no es asignable al tipo 'string | number'.

```

Estructuralmente, podemos visualizar la asignación de memoria y la validación de un tipo de unión de la siguiente manera:

```text
 Variable: [ identificador ]
                  │
                  ▼
 ┌─────────────────────────────────┐
 │ ¿El valor es string o number?   │
 └────────────────┬────────────────┘
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
 [ "usr_9f82" ] ✔️        [ 1024 ] ✔️
 (Válido)               (Válido)

```

### Uso de uniones en funciones

El escenario más habitual para los tipos de unión se encuentra en los parámetros de las funciones. Imaginemos una función encargada de dar formato a un precio de un producto. El precio original puede venir directamente como un número o como una cadena que ya incluye el símbolo de la moneda.

```typescript
function formatearPrecio(precio: number | string): string {
    // Si es un número, le agregamos el formato decimal
    if (typeof precio === "number") {
        return `$${precio.toFixed(2)}`;
    }
    
    // Si ya es un string, asumimos que viene preformateado o limpio
    return `$${parseFloat(precio).toFixed(2)}`;
}

console.log(formatearPrecio(19.99));  // Resultado: "$19.99"
console.log(formatearPrecio("45.5")); // Resultado: "$45.50"

```

> **Nota de diseño:** En el código anterior, TypeScript nos obliga a verificar el tipo exacto del parámetro antes de realizar operaciones específicas (como `.toFixed()`). Este proceso se conoce como *Estrechamiento de tipos* (Type Narrowing) y se profundizará detalladamente en la sección 8.4. Por ahora, quédate con la idea de que TypeScript no te dejará usar métodos de `number` en una unión si no estás seguro de que el valor actual lo sea.

### Uniones con colecciones y arreglos

Los tipos de unión se combinan perfectamente con las estructuras de datos que vimos en el Capítulo 3. Si necesitas un arreglo que combine múltiples tipos de elementos, la sintaxis requiere el uso de paréntesis para evitar ambigüedades.

```typescript
// Un arreglo que puede contener números O cadenas de texto indistintamente
const listaMixta: (number | string)[] = [1, "dos", 3, "cuatro"];

// CUIDADO: La siguiente sintaxis significa algo totalmente diferente
const listaErronea: number | string[] = ["uno", "dos"]; 
// Lo anterior significa: "O la variable es un número único, O es un arreglo exclusivo de strings".

```

### Combinación con Tipos Literales

Una de las sinergias más potentes en TypeScript ocurre al fusionar los tipos de unión con los **tipos literales** (vistos en la sección 5.3). Esto nos permite emular el comportamiento de enumeraciones ligeras con una sintaxis sumamente limpia y descriptiva.

```typescript
type EstadoTransaccion = "pendiente" | "aprobada" | "rechazada";

function procesarPago(id: string, estado: EstadoTransaccion) {
    console.log(`La transacción ${id} ahora está: ${estado.toUpperCase()}`);
}

procesarPago("TX-100", "aprobada"); // Válido

// procesarPago("TX-200", "completada"); 
// Error: El argumento de tipo '"completada"' no es asignable al parámetro de tipo 'EstadoTransaccion'.

```

### La regla de acceso a miembros comunes

Cuando trabajas con un objeto o variable que pertenece a un tipo de unión, TypeScript adopta una postura estrictamente segura: **solo te permitirá acceder a las propiedades y métodos que sean comunes a todos los tipos miembros de la unión**.

Consideremos el siguiente ejemplo con estructuras de objetos personalizados:

```typescript
interface Ave {
    volar(): void;
    caminar(): void;
}

interface Pez {
    nadar(): void;
    caminar(): void;
}

function desplazarAnimal(animal: Ave | Pez) {
    // Esto es perfectamente válido porque ambos animales pueden caminar
    animal.caminar(); 
    
    // animal.volar(); 
    // Error: La propiedad 'volar' no existe en el tipo 'Ave | Pez'.
    // La propiedad 'volar' no existe en el tipo 'Pez'.
}

```

Para poder invocar `.volar()` o `.nadar()`, el compilador nos exigirá implementar mecanismos de discriminación de uniones, técnicas que se abordarán de manera sistemática en las secciones 8.3 y 8.4 de este mismo capítulo.

## 8.2 Concepto y uso de Tipos de Intersección

Mientras que los tipos de unión (sección 8.1) representan la noción lógica del operador `OR`, permitiendo que un valor sea de un tipo *u* otro, TypeScript nos ofrece otra herramienta fundamental para combinar tipos: los **Tipos de Intersección** (Intersection Types). Un tipo de intersección representa la noción lógica del operador `AND`.

Un tipo de intersección combina múltiples tipos existentes en uno solo. Esto significa que un objeto resultante de una intersección poseerá **todas y cada una de las propiedades y métodos** de los tipos involucrados. Es una de las herramientas más potentes en TypeScript para fomentar la composición de código sobre la herencia clásica.

### Sintaxis básica

Para definir un tipo de intersección, utilizamos el carácter ampersand (`&`) para entrelazar los tipos que deseamos fusionar.

```typescript
type TipoA = { propiedadA: string };
type TipoB = { propiedadB: number };

// El tipo intersectado requiere CUMPLIR con ambas estructuras simultáneamente
type TipoCombinado = TipoA & TipoB;

const objetoInstanciado: TipoCombinado = {
    propiedadA: "Hola Mundo",
    propiedadB: 42
};

```

Estructuralmente, podemos visualizar la composición de un tipo de intersección de la siguiente manera:

```text
    Tipo Estructura A              Tipo Estructura B
 ┌─────────────────────┐        ┌─────────────────────┐
 │    propiedadA       │        │    propiedadB       │
 └──────────┬──────────┘        └──────────┬──────────┘
            │                              │
            └──────────────┬───────────────┘
                           ▼
               Tipo Intersección (A & B)
         ┌───────────────────────────────────┐
         │  ✔ propiedadA  AND  ✔ propiedadB │
         └───────────────────────────────────┘

```

### Casos de uso comunes: Composición de Modelos

En el diseño de software moderno, especialmente cuando se trabaja con arquitecturas basadas en microservicios o sistemas orientados a entidades, los datos suelen enriquecerse progresivamente.

Imaginemos un sistema de comercio electrónico donde gestionamos la información de los usuarios y sus registros de auditoría en la base de datos de manera separada, pero en el código necesitamos operar con una entidad completa.

```typescript
type DatosUsuario = {
    id: string;
    nombre: string;
    email: string;
};

type RegistroAuditoria = {
    fechaCreacion: Date;
    ultimoAcceso: Date;
    ipOrigen: string;
};

// Creamos un nuevo tipo combinando ambos mediante una intersección
type UsuarioCompleto = DatosUsuario & RegistroAuditoria;

const usuarioBD: UsuarioCompleto = {
    id: "usr_7721",
    nombre: "Ana Gómez",
    email: "ana.gomez@email.com",
    fechaCreacion: new Date("2026-01-15"),
    ultimoAcceso: new Date(),
    ipOrigen: "192.168.1.45"
};

```

### Intersección de Interfaces vs. Extensión

Es natural preguntarse cuál es la diferencia entre usar un tipo de intersección (`&`) y la extensión de interfaces (`extends`) que estudiamos en la sección 6.2.

Aunque en muchos escenarios enfocados a objetos producen resultados similares, la diferencia fundamental radica en el comportamiento ante los conflictos de tipos y en que las intersecciones pueden unificar tipos que no son objetos (como primitivos o uniones).

Si intentas extender una interfaz cambiando el tipo de una propiedad existente por uno incompatible, TypeScript arrojará un error inmediatamente durante el diseño:

```typescript
interface IDNumerico { id: number; }
// interface IDInvalido extends IDNumerico { id: string; } 
// Error inmediato: El tipo 'string' no es asignable al tipo 'number'.

```

Con los tipos de intersección, el compilador procesa la mezcla sin quejarse en la definición, pero altera el tipo de la propiedad en conflicto.

### Conflictos de propiedades: El tipo `never`

¿Qué ocurre si intersectamos dos tipos que comparten una misma propiedad pero con tipos primitivos diferentes?

```typescript
type ConflictoA = { id: string };
type ConflictoB = { id: number };

type IdentificadorImposible = ConflictoA & ConflictoB;

```

Para TypeScript, el tipo de la propiedad `id` dentro de `IdentificadorImposible` pasa a ser `string & number`. Debido a que es matemáticamente imposible que un valor sea de manera simultánea una cadena de texto y un número, TypeScript reduce automáticamente esa propiedad al tipo **`never`**.

```typescript
// El siguiente objeto arrojará un error de compilación invariablemente:
const miDato: IdentificadorImposible = {
    // id: "100" // Error: El tipo 'string' no es asignable al tipo 'never'.
};

```

### Combinación de uniones e intersecciones

Los tipos de intersección demuestran una enorme versatilidad cuando se combinan con los tipos de unión. Supongamos que estamos desarrollando un sistema de notificaciones que puede enviar alertas urgentes o informativas, y cada una puede ser vía Email o SMS.

```typescript
type TipoEmail = { canal: "EMAIL"; direccion: string };
type TipoSMS = { canal: "SMS"; telefono: number };

type PrioridadAlta = { urgente: true; reintentos: number };
type PrioridadBaja = { urgente: false };

// Combinación avanzada
type AlertaCriticaEmail = TipoEmail & PrioridadAlta;
type AlertaCualquiera = (TipoEmail | TipoSMS) & PrioridadBaja;

const AlertaSistema: AlertaCualquiera = {
    canal: "SMS",
    telefono: 3415551234,
    urgente: false
};

```

Este enfoque permite modelar estructuras de datos sumamente precisas, garantizando que el compilador valide hasta el más mínimo detalle de la lógica de negocio de tu aplicación.

## 8.3 Discriminación de uniones (Type Guards)

En la sección 8.1 aprendimos que al usar tipos de unión, TypeScript restringe el acceso seguro únicamente a las propiedades y métodos compartidos por todos los tipos de la unión. Intentar acceder a un miembro específico de uno de los componentes provoca un error del compilador. Para solucionar esto y recuperar la capacidad de interactuar con el tipo específico de forma segura, el lenguaje introduce los **Type Guards** (o guardas de tipo) mediante un patrón fundamental conocido como **Discriminación de uniones** (Discriminated Unions).

Una unión discriminada es un patrón de diseño que requiere tres elementos clave:

1. Varios tipos (u objetos) que comparten propiedades comunes.
2. Una propiedad común en todos esos tipos que posee un **tipo literal** diferente en cada uno (el "discriminante").
3. Un condicional de control de flujo (`if`, `switch`) que TypeScript utiliza para deducir el tipo exacto en tiempo de ejecución.

### El patrón del discriminante literal

Imaginemos un sistema informático que procesa diferentes tipos de eventos de usuario en una plataforma de streaming: descargas de contenido y reproducciones de vídeo. Cada evento transporta información completamente dispar.

```typescript
interface EventoDescarga {
    tipo: "DESCARGA"; // Propiedad discriminante
    archivoId: string;
    tamanoMb: number;
}

interface EventoReproduccion {
    tipo: "REPRODUCCION"; // Propiedad discriminante
    videoId: string;
    duracionSegundos: number;
    calidad: "HD" | "4K";
}

// Tipo de Unión
type EventoUsuario = EventoDescarga | EventoReproduccion;

```

La propiedad `tipo` actúa como nuestro **discriminante**. No es un simple `string`, sino un tipo literal específico (`"DESCARGA"` o `"REPRODUCCION"`).

Cuando escribimos una función para procesar estos eventos, TypeScript analiza de manera inteligente las bifurcaciones del código a través de este discriminante:

```typescript
function procesarEvento(evento: EventoUsuario) {
    // En este punto, acceder a evento.duracionSegundos daría un ERROR.

    switch (evento.tipo) {
        case "DESCARGA":
            // TypeScript SABE con total certeza que aquí 'evento' es 'EventoDescarga'
            console.log(`Descargando archivo: ${evento.archivoId} (${evento.tamanoMb}MB)`);
            break;

        case "REPRODUCCION":
            // TypeScript SABE con total certeza que aquí 'evento' es 'EventoReproduccion'
            console.log(`Reproduciendo video ${evento.videoId} en calidad ${evento.calidad}`);
            break;
    }
}

```

### Operadores nativos como Type Guards

Además del patrón de discriminación por propiedades literales, JavaScript y TypeScript ofrecen operadores integrados en el lenguaje que actúan de forma nativa como Type Guards.

#### 1. El operador `typeof`

Ideal para diferenciar tipos primitivos dentro de una unión (como `string`, `number`, `boolean`).

```typescript
function duplicar(valor: number | string): number | string {
    if (typeof valor === "number") {
        return valor * 2; // TypeScript permite la multiplicación porque infiere que es un número
    }
    return valor.repeat(2); // Infiere que es un string
}

```

#### 2. El operador `instanceof`

Esencial cuando la unión está conformada por clases (vistas en el Capítulo 7) en lugar de interfaces o tipos planos. Evalúa la cadena de prototipos del objeto en tiempo de ejecución.

```typescript
class SolicitudHttp {
    enviar() { return "Enviando datos..."; }
}

class SolicitudLocal {
    leerCache() { return "Leyendo disco..."; }
}

function ejecutarOperacion(solicitud: SolicitudHttp | SolicitudLocal) {
    if (solicitud instanceof SolicitudHttp) {
        return solicitud.enviar(); // Válido
    }
    return solicitud.leerCache(); // Válido, infiere que es SolicitudLocal
}

```

#### 3. El operador `in`

Verifica si una propiedad específica existe de manera física dentro del objeto. Es sumamente útil cuando las interfaces no comparten un discriminante explícito pero sí tienen estructuras diferenciadas.

```typescript
interface Administrador {
    nombre: string;
    eliminarUsuario(): void;
}

interface Invitado {
    nombre: string;
    consultarCatalogo(): void;
}

function gestionarPermisos(usuario: Administrador | Invitado) {
    if ("eliminarUsuario" in usuario) {
        usuario.eliminarUsuario(); // TypeScript deduce que es Administrador
    } else {
        usuario.consultarCatalogo(); // TypeScript deduce que es Invitado
    }
}

```

### Funciones de verificación personalizadas (Type Predicates)

En ocasiones, las validaciones de tipos son demasiado complejas para resolverse con un simple operador inline. Para estos casos, TypeScript nos permite definir funciones de verificación personalizadas utilizando un **predicado de tipo** (`is`) en el valor de retorno.

```typescript
interface TarjetaCredito {
    numero: string;
    cvv: number;
}

// Función que actúa como Type Guard personalizado
function esTarjetaCredito(metodo: any): metodo is TarjetaCredito {
    return metodo && typeof metodo.numero === "string" && typeof metodo.cvv === "number";
}

function procesarPagoPasarela(pago: unknown) {
    if (esTarjetaCredito(pago)) {
        // Fuera de este bloque, 'pago' era de tipo 'unknown'
        // Dentro de este bloque, 'pago' pasa a ser estrictamente 'TarjetaCredito'
        console.log(`Procesando tarjeta terminada en: ${pago.numero.slice(-4)}`);
    }
}

```

La expresión `metodo is TarjetaCredito` le comunica explícitamente al compilador: *"Si esta función devuelve `true`, puedes asumir con seguridad que el argumento evaluado pertenece a la interfaz `TarjetaCredito`"*.

## 8.4 Estrechamiento de tipos (Type Narrowing)

A lo largo de este capítulo hemos visto cómo los tipos de unión nos permiten flexibilizar las estructuras de datos y cómo los *Type Guards* nos ofrecen herramientas para identificar un tipo específico. El proceso subyacente que realiza el compilador de TypeScript para redefinir un tipo amplio a uno mucho más específico se denomina de forma técnica **Estrechamiento de Tipos** (*Type Narrowing*).

El estrechamiento de tipos no es una estructura sintáctica adicional, sino el comportamiento inteligente del análisis de flujo de control de TypeScript. A medida que el compilador lee el código de arriba hacia abajo, evalúa las condiciones, retornos anticipados y asignaciones para deducir el tipo más preciso posible en cada línea de ejecución.

### Análisis de flujo de control

El compilador no se limita a analizar bloques `if`/`else` aislados; inspecciona todo el flujo del programa, incluyendo la ejecución secuencial y la interrupción de funciones. Observemos cómo TypeScript estrecha un tipo a través de una cláusula de guarda con un retorno anticipado (*early return*):

```typescript
function procesarEntrada(dato: string | number | null) {
    // Estado inicial de 'dato': string | number | null

    if (dato === null) {
        return; // Si es null, finaliza la ejecución de la función
    }

    // A partir de esta línea, 'dato' se ha estrechado a: string | number
    // El tipo 'null' ha sido completamente descartado por el flujo de control

    if (typeof dato === "number") {
        console.log(dato.toFixed(2)); // 'dato' es estrictamente 'number'
        return;
    }

    // En esta sección final, 'dato' solo puede ser 'string'
    console.log(dato.toUpperCase());
}

```

### Estrechamiento por veracidad (Truthiness Narrowing)

En JavaScript y TypeScript, los valores en una condición evaluable se convierten implícitamente a booleanos (`true` o `false`). Los valores que se evalúan como falsos (*falsy*) incluyen `0`, `""`, `null`, `undefined`, `NaN` y `false`.

TypeScript utiliza esta conversión implícita para estrechar tipos que pueden ser opcionales, nulos o indefinidos de una manera sumamente limpia:

```typescript
function imprimirMensaje(mensaje?: string) {
    // El tipo de 'mensaje' es: string | undefined
    
    if (mensaje) {
        // Al evaluar la veracidad, descartamos "" (string vacío) y undefined
        // Dentro de este bloque, 'mensaje' es estrictamente 'string'
        console.log(`Mensaje válido: ${mensaje}`);
    } else {
        // En este bloque, 'mensaje' puede ser "" o undefined
        console.log("No se proporcionó un mensaje con contenido.");
    }
}

```

### Chequeos de exhaustividad con el tipo `never`

Cuando realizamos un estrechamiento de tipos sobre un tipo de unión, queremos asegurarnos de haber contemplado todas las variantes posibles de la unión. Un patrón avanzado y altamente recomendado consiste en utilizar el tipo **`never`** para realizar un chequeo de exhaustividad en tiempo de compilación.

Imaginemos que gestionamos tres tipos de transporte en una aplicación logística:

```typescript
interface Moto { tipo: "MOTO"; velocidadMax: number; }
interface Auto { tipo: "AUTO"; capacidadPasajeros: number; }
interface Camion { tipo: "CAMION"; capacidadCargaKg: number; }

type Vehiculo = Moto | Auto | Camion;

function calcularTarifaPeaje(v: Vehiculo): number {
    switch (v.tipo) {
        case "MOTO":
            return 50;
        case "AUTO":
            return 120;
        case "CAMION":
            return 350;
        default:
            // Chequeo de exhaustividad
            const _controlExhaustivo: never = v;
            return _controlExhaustivo;
    }
}

```

¿Por qué es útil la asignación `const _controlExhaustivo: never = v`? Si en el futuro el equipo de desarrollo añade un nuevo tipo de transporte a la unión `Vehiculo` (por ejemplo, `interface Bicicleta { tipo: "BICICLETA" }`), pero olvida añadir el correspondiente `case` en la estructura `switch`, TypeScript detectará que `v` en el bloque `default` tiene el tipo `"BICICLETA"`.

Como el tipo `"BICICLETA"` no se puede asignar al tipo `never`, el compilador **arrojará un error de inmediato**, obligando al desarrollador a controlar el nuevo caso antes de poder compilar la aplicación.

## Resumen del capítulo

En este **Capítulo 8: Tipos de Unión e Intersección**, hemos explorado las herramientas clave de TypeScript para flexibilizar y enriquecer nuestro sistema de tipos mediante la combinación de estructuras preexistentes:

* **Tipos de Unión (`|`):** Permiten que una sola entidad almacene múltiples variedades de tipos alternativos, simulando un operador lógico `OR`.
* **Tipos de Intersección (`&`):** Fusionan múltiples estructuras en una entidad unificada que exige la presencia de todos sus miembros simultáneamente, simulando un operador lógico `AND` y promoviendo la composición.
* **Discriminación de uniones (Type Guards):** Patrón que aprovecha propiedades literales discriminantes y operadores nativos (`typeof`, `instanceof`, `in`) para desglosar uniones de forma segura y controlada en tiempo de ejecución.
* **Estrechamiento de tipos (Type Narrowing):** La inteligencia del compilador para realizar un seguimiento del flujo de control y reducir el espectro de un tipo general a uno específico, garantizando la solidez del código mediante técnicas como el chequeo de exhaustividad con el tipo `never`.
