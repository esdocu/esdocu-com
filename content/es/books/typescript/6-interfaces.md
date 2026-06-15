Las **interfaces** son la herramienta principal en TypeScript para definir contratos claros y estructurar la forma de tus objetos. A diferencia de otros lenguajes, TypeScript se apoya en el **tipado estructural** para validar que los datos cumplan con los requisitos mínimos sin importar su origen.

A lo largo de este capítulo, aprenderás a declarar interfaces con propiedades opcionales y de solo lectura, y a escalarlas mediante la extensión múltiple. Además, descubriremos las diferencias clave frente a los *Type Aliases* y cómo modelar firmas de funciones avanzadas. Todo esto sin añadir sobrecarga en tiempo de ejecución, optimizando el desarrollo desde el primer momento.

## 6.1 Definición y uso básico de interfaces

En el desarrollo de software, un contrato establece un acuerdo claro sobre el comportamiento y la estructura que deben cumplir los componentes del código. En TypeScript, las **interfaces** son la herramienta principal para definir estos contratos. A diferencia de los lenguajes puramente orientados a objetos donde las interfaces están ligadas exclusivamente a las clases, en TypeScript una interfaz define la "forma" (*shape*) que debe tener un objeto.

TypeScript utiliza un sistema de tipado estructural (también conocido como *duck typing* o tipado pato). Esto significa que el compilador no verifica el origen de un objeto ni su árbol de herencia; lo único que le importa es si el objeto posee las propiedades y los métodos requeridos con los tipos correspondientes.

### Sintaxis básica de una interfaz

Para definir una interfaz se utiliza la palabra clave `interface` seguida del nombre de la interfaz (por convención, utilizando *PascalCase*). Dentro de las llaves se especifican las propiedades y sus respectivos tipos.

```typescript
interface Usuario {
    id: number;
    nombre: string;
    correo: string;
    fechaRegistro: Date;
}

```

Una vez definida, la interfaz se puede utilizar como cualquier otro tipo en TypeScript para anotar variables, parámetros de funciones o valores de retorno.

```typescript
const nuevoUsuario: Usuario = {
    id: 101,
    nombre: "Ana Martínez",
    correo: "ana.martinez@email.com",
    fechaRegistro: new Date()
};

```

Si intentas asignar un objeto al que le falte alguna de las propiedades definidas en la interfaz `Usuario`, o si los tipos no coinciden, el compilador de TypeScript generará un error de forma inmediata.

### Propiedades opcionales y de solo lectura

Las interfaces permiten flexibilizar y asegurar la estructura de los datos mediante modificadores de propiedades. Aunque conceptualmente guardan similitud con las herramientas de los alias de tipos, su aplicación en las interfaces sigue reglas sintácticas muy limpias.

1. **Propiedades opcionales (`?`):** Indican que el objeto puede o no incluir dicha propiedad.
2. **Propiedades de solo lectura (`readonly`):** Indican que el valor de la propiedad solo puede asignarse cuando se crea el objeto y no puede modificarse posteriormente.

```typescript
interface ConfiguracionServidor {
    readonly ip: string;      // No se puede modificar después de la creación
    puerto: number;
    protocolo?: string;       // Propiedad opcional (puede ser string o undefined)
}

const produccion: ConfiguracionServidor = {
    ip: "192.168.1.50",
    puerto: 443
    // 'protocolo' se ha omitido de forma válida
};

// Error: No se puede asignar a 'ip' porque es una propiedad de solo lectura.
// produccion.ip = "10.0.0.1"; 

// Válido: El puerto puede ser modificado libremente.
produccion.puerto = 8080; 

```

### Comportamiento frente a propiedades adicionales

Cuando asignas un objeto literal directamente a una variable tipada con una interfaz, TypeScript aplica una regla estricta conocida como **comprobación de propiedades en exceso** (*excess property checking*). Si el literal contiene propiedades que no están declaradas explícitamente en la interfaz, se producirá un error de compilación.

```typescript
interface Producto {
    id: string;
    precio: number;
}

// Error: El objeto literal especifica propiedades conocidas, pero 'descripcion' no existe en 'Producto'
const playera: Producto = {
    id: "PROD-001",
    precio: 25.99,
    descripcion: "Playera de algodón 100%" 
};

```

Sin embargo, este comportamiento cambia si el objeto se asigna indirectamente a través de una variable intermedia. Debido al tipado estructural, TypeScript solo comprobará que se cumplan los requisitos mínimos de la interfaz:

```typescript
const datosFicticios = {
    id: "PROD-001",
    precio: 25.99,
    descripcion: "Playera de algodón 100%"
};

// Válido: 'datosFicticios' tiene al menos 'id' y 'precio'. 
// TypeScript ignora las propiedades en exceso en asignaciones indirectas.
const playeraValida: Producto = datosFicticios; 

```

### Añadir métodos a las interfaces

Las interfaces no solo describen datos primitivos u objetos estáticos; también pueden modelar el comportamiento definiendo las funciones (métodos) que un objeto debe implementar. Existen dos formas equivalentes de declarar un método dentro de una interfaz:

```typescript
interface Reproductor {
    volumen: number;
    // Opción 1: Sintaxis de método tradicional
    reproducir(pista: string): void;
    // Opción 2: Sintaxis de propiedad con función de flecha
    pausar: () => void;
}

const miReproductor: Reproductor = {
    volumen: 70,
    reproducir(pista) {
        console.log(`Reproduciendo: ${pista}`);
    },
    pausar() {
        console.log("Música en pausa.");
    }
};

```

Ambas sintaxis obligan a que cualquier objeto de tipo `Reproductor` provea las funciones indicadas respetando los parámetros y el tipo de retorno establecido.

### Visualización del Contrato de Interfaz

Para comprender cómo actúa la interfaz como una capa de validación intermedia entre la definición del contrato y los datos reales, se puede observar el siguiente esquema de flujo:

```text
+-------------------------------------------------------+
|                 INTERFAZ (Contrato)                   |
|  - id: number                                         |
|  - nombre: string                                     |
+-------------------------------------------------------+
                           |
                           v
          ¿El objeto cumple con la forma?
                           |
         +-----------------+-----------------+
         |                                   |
         v (Sí)                              v (No)
+-------------------------+       +-------------------------+
|   Compilación Exitosa   |       |    Error de Compilación |
| El código pasa a JS     |       | "Property 'id' missing" |
+-------------------------+       +-------------------------+

```

### Inyección de código y validación en tiempo de ejecución

Es fundamental recordar un aspecto clave de TypeScript: **las interfaces solo existen en tiempo de compilación**. Una interfaz es un artefacto de diseño puro que TypeScript utiliza para validar que el desarrollador no cometa errores de estructura.

Cuando el compilador de TypeScript traduce el código a JavaScript puro, todas las definiciones de las interfaces se eliminan por completo (*type erasure*).

Si tomamos el primer ejemplo de esta sección:

```typescript
// Código TypeScript
interface Usuario {
    id: number;
    nombre: string;
}

const nuevoUsuario: Usuario = {
    id: 101,
    nombre: "Ana Martínez"
};

```

El resultado generado en el archivo JavaScript será:

```javascript
// Código JavaScript resultante
const nuevoUsuario = {
    id: 101,
    nombre: "Ana Martínez"
};

```

Como se puede observar, el archivo JavaScript final no contiene ningún rastro de la interfaz `Usuario`. Esto garantiza que el uso de interfaces no añade ningún tipo de sobrecarga ni penalización de rendimiento a la aplicación cuando se ejecuta en el navegador o en entornos como Node.js.

## 6.2 Extensión de interfaces múltiples

Una de las mayores virtudes de las interfaces en TypeScript es su capacidad para ser reutilizadas y combinadas. La palabra clave `extends` permite que una interfaz herede las propiedades y métodos de otra, pero TypeScript va un paso más allá al permitir la **herencia múltiple de interfaces**. Esto significa que una sola interfaz puede fusionar los contratos de dos o más interfaces de origen, facilitando la creación de estructuras de datos modulares y altamente composibles.

Esta característica fomenta el principio de diseño de software de segregación de interfaces, el cual establece que es preferible tener muchas interfaces pequeñas y específicas en lugar de una sola interfaz grande y de propósito general.

### Sintaxis de la extensión múltiple

Para extender múltiples interfaces, se utiliza la palabra clave `extends` seguida de los nombres de las interfaces que se desean heredar, separados por comas.

```typescript
interface Almacenamiento {
    capacidadGigabytes: number;
}

interface Conectividad {
    tieneBluetooth: boolean;
    tieneWifi: boolean;
}

// Extensión múltiple de interfaces
interface TelefonoInteligente extends Almacenamiento, Conectividad {
    sistemaOperativo: string;
    tamanoPantallaPulgadas: number;
}

```

Al heredar de `Almacenamiento` y `Conectividad`, cualquier objeto que se declare con el tipo `TelefonoInteligente` estará obligado a implementar de forma estricta las propiedades de las tres interfaces involucradas:

```typescript
const miTelefono: TelefonoInteligente = {
    // Propiedades de Almacenamiento
    capacidadGigabytes: 128,
    
    // Propiedades de Conectividad
    tieneBluetooth: true,
    tieneWifi: true,
    
    // Propiedades propias de TelefonoInteligente
    sistemaOperativo: "Android",
    tamanoPantallaPulgadas: 6.5
};

```

### Composición frente a estructuras monolíticas

La extensión múltiple permite a los desarrolladores tratar las interfaces como bloques de construcción (*legos*). En lugar de modelar una entidad compleja desde cero, se pueden combinar capacidades atómicas.

El siguiente diagrama en texto plano muestra cómo la interfaz `TelefonoInteligente` consolida los requisitos de las interfaces padre:

```text
  +-------------------------+          +-------------------------+
  |     Almacenamiento      |          |      Conectividad       |
  | ----------------------- |          | ----------------------- |
  |  capacidadGigabytes     |          |  tieneBluetooth         |
  |                         |          |  tieneWifi              |
  +-------------------------+          +-------------------------+
               \                                    /
                \                                  /
                 v                                v
         +-------------------------------------------------+
         |               TelefonoInteligente               |
         | ----------------------------------------------- |
         |  (Heredado) capacidadGigabytes                  |
         |  (Heredado) tieneBluetooth, tieneWifi           |
         |  sistemaOperativo                               |
         |  tamanoPantallaPulgadas                         |
         +-------------------------------------------------+

```

### Resolución de conflictos y firma de propiedades

Al extender múltiples interfaces, es posible que dos de las interfaces padre compartan una propiedad con el mismo nombre. TypeScript maneja esto bajo reglas estrictas para evitar ambigüedades:

1. **Tipos idénticos:** Si la propiedad repetida tiene exactamente el mismo tipo en todas las interfaces padre, TypeScript la aceptará sin inconvenientes.
2. **Tipos incompatibles:** Si la misma propiedad tiene tipos diferentes e incompatibles en las interfaces padre, el compilador generará un error de manera inmediata, bloqueando la extensión hasta que se resuelva el conflicto.

Analicemos un escenario de conflicto por tipos incompatibles:

```typescript
interface ComponenteA {
    id: string;
}

interface ComponenteB {
    id: number; // Conflicto: 'id' es number aquí, pero string en ComponenteA
}

// Error de compilación: La interfaz 'Dispositivo' extiende simultáneamente 
// tipos incompatibles para la propiedad 'id'.
interface Dispositivo extends ComponenteA, ComponenteB {}

```

Para solucionar este tipo de conflictos, la interfaz hija debe declarar explícitamente la propiedad en conflicto y definir un tipo que sea compatible con todas las interfaces que se están extendiendo (por ejemplo, una unión de tipos), o bien redefinir la propiedad por completo si la lógica del negocio lo permite:

```typescript
interface DispositivoSolucionado extends ComponenteA, ComponenteB {
    // Solución: Sobrescribir la propiedad para unificar los criterios
    id: string | number; 
}

```

### Extensión jerárquica compleja

No hay un límite teórico para los niveles de herencia o combinación que se pueden realizar. Una interfaz puede extender a otras interfaces que, a su vez, ya son el resultado de otras extensiones previas. Esto permite mapear flujos de datos y contratos de hardware o software sumamente específicos sin necesidad de duplicar código de tipado.

```typescript
interface Localizable {
    latitud: number;
    longitud: number;
}

interface DispositivoIot extends TelefonoInteligente, Localizable {
    frecuenciaEnvioSegundos: number;
}

```

En este caso, un objeto de tipo `DispositivoIot` requerirá las propiedades de `Almacenamiento`, `Conectividad`, `TelefonoInteligente`, `Localizable` y sus campos propios, creando un contrato robusto y seguro en tiempo de desarrollo.

## 6.3 Diferencias entre Interfaces y Types

En TypeScript, tanto las interfaces (`interface`) como los alias de tipos (`type`) sirven para definir la estructura de un objeto y asignar nombres a conjuntos de tipos. Debido a que sus capacidades se solapan en gran medida, una de las dudas más comunes al desarrollar en TypeScript es cuándo utilizar cada una.

Aunque en las versiones modernas del lenguaje puedes usar ambas para resolver la mayoría de los problemas cotidianos, existen diferencias fundamentales en su comportamiento, restricciones y propósito arquitectónico.

### 1. Extensibilidad y combinación (Extends vs. Intersección)

La diferencia más notable radica en la sintaxis y el comportamiento interno al momento de combinar o heredar estructuras.

* **Interfaces:** Utilizan la palabra clave `extends`. El compilador de TypeScript optimiza las interfaces internamente, detectando conflictos de propiedades incompatibles en tiempo de compilación de manera muy eficiente.
* **Alias de Tipos:** Utilizan el operador de intersección (`&`) para unirse. A diferencia de las interfaces, no heredan, sino que crean un nuevo tipo combinando las definiciones.

```typescript
// Combinando con Interfaces
interface Animal {
    nombre: string;
}
interface Mascota extends Animal {
    dueño: string;
}

// Combinando con Types
type Vehiculo = {
    marca: string;
};
type Auto = Vehiculo & {
    puertas: number;
};

```

### 2. Combinación de declaraciones (*Declaration Merging*)

Las interfaces poseen una característica única llamada **combinación de declaraciones**. Si defines dos o más interfaces con el mismo nombre en el mismo ámbito, TypeScript las fusionará automáticamente en una sola interfaz que contendrá las propiedades de todas las definiciones.

```typescript
// Primera declaración
interface Auto {
    marca: string;
}

// Segunda declaración en otro lugar del código
interface Auto {
    modelo: string;
}

// El objeto resultante debe cumplir con ambas declaraciones
const miAuto: Auto = {
    marca: "Toyota",
    modelo: "Corolla"
};

```

Los alias de tipos **no permiten** la combinación de declaraciones. Si intentas definir dos tipos con el mismo nombre en el mismo espacio de nombres, el compilador arrojará un error de duplicación inmediatamente.

```typescript
type Usuario = { id: number; };
// Error: Identificador 'Usuario' duplicado.
type Usuario = { nombre: string; }; 

```

Esta propiedad hace que las interfaces sean la opción obligatoria al escribir librerías o definiciones de tipos globales (`.d.ts`), ya que permiten a otros desarrolladores extender las funcionalidades de la librería sin modificar el código fuente original.

### 3. Capacidades exclusivas de los Types

Los alias de tipos son herramientas mucho más expresivas que las interfaces cuando se trata de modelar tipos avanzados. Existen estructuras que una interfaz simplemente **no puede** representar por sí misma:

* **Tipos primitivos o alias directos:** Darle un nombre alternativo a un tipo básico.
* **Tipos de unión:** Variables que pueden ser de un tipo u otro.
* **Tuplas y tipos mapeados:** Estructuras fijas o dinámicas avanzadas.

```typescript
// Imposible de replicar con una interfaz
type ID = string | number; 
type Coordenadas = [number, number]; // Tupla
type EstadoSemaforo = "rojo" | "amarillo" | "verde"; // Tipo literal de unión

```

### Tabla comparativa de características

A continuación, se presenta un resumen detallado de las capacidades de cada herramienta para facilitar la toma de decisiones en el diseño de software:

| Característica | Interfaces (`interface`) | Alias de Tipos (`type`) |
| --- | --- | --- |
| **Propósito principal** | Definir la forma (*shape*) de objetos y contratos de clases. | Definir alias para cualquier tipo de dato (uniones, primitivos, etc.). |
| **Sintaxis de extensión** | Permite herencia limpia mediante `extends`. | Permite combinaciones mediante intersección (`&`). |
| **Fusión automática** | **Sí** (Declaration Merging). Ideal para extender librerías. | **No**. Genera un error de identificador duplicado. |
| **Soporte de Uniones** | No puede definir uniones directamente (`A \| B`). | **Sí**. Es su fuerte principal. |
| **Soporte de Tuplas** | No (puede simularse, pero no es sintaxis nativa). | **Sí**. Soporte nativo y directo. |
| **Implementación en Clases** | Se puede implementar de forma nativa (`implements`). | Se puede implementar (con restricciones si usa uniones). |

### Resumen de criterios de elección

Para mantener una consistencia limpia en tu base de código, puedes guiarte por las siguientes recomendaciones generales:

1. **Usa `interface` por defecto** para definir objetos, estructuras de datos de tu aplicación, contratos de servicios, componentes o cuando estés construyendo una librería pública que requiera ser extensible.
2. **Usa `type` obligatoriamente** cuando necesites trabajar con uniones de tipos, tipos literales, tuplas, tipos primitivos intermedios o cuando requieras realizar manipulación avanzada de tipos (como tipos mapeados o condicionales).

## 6.4 Interfaces para definir funciones

Aunque es común asociar las interfaces exclusivamente con la descripción de objetos contenedores de propiedades y métodos, las interfaces en TypeScript son lo suficientemente flexibles como para describir cualquier estructura que JavaScript pueda representar. Dado que en JavaScript las funciones son objetos de primera clase (*first-class objects*), las interfaces también pueden utilizarse para definir de forma precisa el contrato de una función.

Esta capacidad es especialmente útil cuando se trabaja con funciones que tienen firmas complejas, devoluciones de llamada (*callbacks*) específicas o cuando se desea asociar propiedades adicionales a la propia función.

### Sintaxis de la firma de llamada

Para describir una función mediante una interfaz, se utiliza una sintaxis conocida como **firma de llamada** (*call signature*). A diferencia de un método convencional dentro de un objeto, una firma de llamada no lleva un nombre asociado; se definen directamente los parámetros entre paréntesis seguidos de un dos puntos (`:`) y el tipo de retorno.

```typescript
interface OperacionMatematica {
    (a: number, b: number): number;
}

```

Cualquier función que se asigne a una variable tipada con `OperacionMatematica` deberá respetar estrictamente esa estructura de parámetros y tipo de retorno:

```typescript
const sumar: OperacionMatematica = (x, y) => {
    return x + y;
};

const restar: OperacionMatematica = function(x, y) {
    return x - y;
};

```

> **Nota de inferencia:** Al asignar la función de flecha a la variable `sumar`, no es obligatorio volver a tipar los parámetros `x` e `y` como `number`. TypeScript infiere sus tipos automáticamente a partir del contrato definido en la interfaz `OperacionMatematica`.

### Funciones con propiedades híbridas

En JavaScript, es perfectamente válido que una función se comporte como un objeto y contenga sus propias propiedades estáticas (por ejemplo, contadores, configuraciones o identificadores). Este patrón, conocido como **tipo híbrido**, es extremadamente difícil de tipar en otros lenguajes, pero en TypeScript se resuelve de manera natural combinando propiedades estándar con la firma de llamada dentro de la misma interfaz.

```typescript
interface ContadorCitas {
    (paciente: string): void; // Firma de llamada principal
    totalConsultas: number;    // Propiedad adherida a la función
    reiniciarContador(): void; // Método adherido a la función
}

function crearContador(): ContadorCitas {
    // 1. Creamos la función base
    const funcionBase = function(paciente: string) {
        console.log(`Cita agendada para: ${paciente}`);
        funcionBase.totalConsultas++;
    } as ContadorCitas; // Forzamos temporalmente el tipo híbrido para construirlo

    // 2. Inicializamos las propiedades requeridas por la interfaz
    funcionBase.totalConsultas = 0;
    
    funcionBase.reiniciarContador = function() {
        this.totalConsultas = 0;
    };

    return funcionBase;
}

const miAgenda = crearContador();
miAgenda("Carlos Gómez"); // Imprime: Cita agendada para: Carlos Gómez
miAgenda("Lucía Pérez");  // Imprime: Cita agendada para: Lucía Pérez
console.log(miAgenda.totalConsultas); // Imprime: 2

miAgenda.reiniciarContador();
console.log(miAgenda.totalConsultas); // Imprime: 0

```

### Cuándo usar Interfaces frente a Types para funciones

Para definir funciones simples o firmas de *callbacks*, la comunidad de TypeScript suele preferir el uso de alias de tipos debido a su sintaxis compacta en una sola línea:

```typescript
// Enfoque común para funciones simples usando Type
type FiltroCallback = (elemento: string) => boolean;

```

Sin embargo, debes optar por una `interface` en los siguientes escenarios:

1. **Tipos Híbridos:** Cuando la función requiera propiedades o métodos adicionales adjuntos a ella.
2. **Extensibilidad:** Si necesitas que la firma de la función pueda ser extendida por otros desarrolladores mediante la combinación automática de declaraciones (*Declaration Merging*).

## Resumen del capítulo

El **Capítulo 6: Interfaces** ha explorado en profundidad la herramienta fundamental de TypeScript para establecer contratos de datos y comportamientos en el código, asegurando la consistencia estructural a través del tipado estructural (*duck typing*).

* En la **sección 6.1**, aprendimos a definir interfaces básicas, explorando las propiedades opcionales (`?`), las de solo lectura (`readonly`), el comportamiento estricto ante literales en exceso y cómo estas desaparecen por completo en el código JavaScript resultante.
* En la **sección 6.2**, estudiamos la extensión múltiple de interfaces mediante la palabra clave `extends`, permitiendo la modularidad y la combinación de múltiples contratos pequeños en estructuras complejas, así como la resolución de conflictos por propiedades duplicadas.
* En la **sección 6.3**, contrastamos las interfaces con los alias de tipos (`type`), determinando que las interfaces son ideales para definir la forma de objetos y librerías gracias a la fusión automática de declaraciones, mientras que los tipos son indispensables para uniones, tuplas y manipulación avanzada.
* En la **sección 6.4**, analizamos cómo las interfaces pueden modelar el comportamiento de las funciones mediante las firmas de llamada, abriendo las puertas al tipado seguro de funciones con propiedades híbridas.
