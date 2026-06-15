El compilador de TypeScript (`tsc`) requiere instrucciones claras para adaptarse a las necesidades de cada proyecto. En este capítulo, exploraremos a fondo el archivo `tsconfig.json`, el cerebro analítico que dicta las reglas de juego de tu código. Aprenderás a estructurar el alcance del compilador, a activar el poderoso modo estricto para erradicar errores antes de la ejecución, y a organizar los directorios de entrada y salida mediante `rootDir` y `outDir`. Finalmente, descubriremos cómo sincronizar tu aplicación con el entorno de ejecución externo controlando la sintaxis nativa y las APIs globales gracias a las propiedades `target` y `lib`.

## 12.1 Explorando el archivo tsconfig.json

Hasta este punto del libro, has interactuado con el compilador de TypeScript (`tsc`) de forma mayoritariamente directa o automatizada mediante herramientas de empaquetado. Sin embargo, a medida que un proyecto crece, pasar opciones por la línea de comandos se vuelve insostenible. Es aquí donde el archivo `tsconfig.json` se convierte en el cerebro de tu proyecto TypeScript.

El archivo `tsconfig.json` es un archivo de configuración en formato JSON que reside en la raíz de tu proyecto. Su presencia indica que el directorio es la raíz de un proyecto TypeScript y especifica las opciones del compilador necesarias para compilar el proyecto.

### Ciclo de vida de la configuración

Cuando ejecutas el comando `tsc` sin archivos de entrada, el compilador busca el archivo `tsconfig.json` comenzando en el directorio actual y subiendo por la cadena de directorios hasta que lo encuentra.

```text
[ Directorio Raíz del Proyecto ]
       │
       ├── tsconfig.json  <─── tsc lee este archivo primero
       │
       ├── /src
       │    └── index.ts
       │
       └── /dist

```

### Creación del archivo de configuración

La forma más rápida y recomendada de generar un archivo `tsconfig.json` con una estructura base y comentarios explicativos es ejecutando el siguiente comando en la terminal:

```bash
tsc --init

```

Este comando creará un archivo repleto de opciones preconfiguradas (algunas activas y la mayoría comentadas) que sirven como una excelente documentación de referencia.

### Estructura interna de tsconfig.json

El archivo se organiza en varias propiedades raíz. Las más importantes son las que definen **qué** archivos se van a compilar y **cómo** se van a compilar.

A continuación, se presenta una estructura simplificada de las secciones clave de un archivo `tsconfig.json`:

```json
{
  "compilerOptions": {
    /* Aquí se define CÓMO se compila el código */
  },
  "include": [
    /* Aquí se define QUÉ se incluye en la compilación */
  ],
  "exclude": [
    /* Aquí se define QUÉ se ignora explícitamente */
  ],
  "files": [
    /* Una lista explícita de archivos individuales */
  ]
}

```

#### 1. Configuración de archivos: `include`, `exclude` y `files`

Estas propiedades controlan el alcance del compilador dentro de tu sistema de archivos.

* **`include`**: Especifica un arreglo de nombres de archivos o patrones glob que deseas incluir en la compilación. Admite comodines como `*` (para coincidir con cero o más caracteres) y `` (para coincidir con directorios anidados).
* **`exclude`**: Especifica un arreglo de archivos o patrones que deben omitirse de la compilación de `include`. Es vital notar que `exclude` **no** evita que un archivo se compile si es importado directamente mediante una declaración `import` en un archivo incluido.
* **`files`**: Especifica una lista de rutas relativas o absolutas a los archivos que se quieren compilar obligatoriamente. Se usa raramente en proyectos grandes, ya que `include` es mucho más flexible.

Un ejemplo práctico de estas tres propiedades trabajando juntas:

```json
{
  "compilerOptions": {
    "target": "ES2022"
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "**/*.spec.ts" // Excluye archivos de pruebas unitarias
  ]
}

```

#### 2. La sección `compilerOptions`

Esta es la sección más extensa e importante del archivo, ya que alberga los interruptores y configuraciones que alteran el comportamiento del compilador. Aunque los capítulos siguientes profundizarán en grupos específicos de estas opciones, analicemos algunas de las más comunes y esenciales para entender la anatomía general del archivo:

* **`target`**: Define la versión de JavaScript a la que se transformará tu código TypeScript (por ejemplo, `ES5`, `ES6/ES2015`, `ES2022`). Si tu código usa características modernas pero el `target` es `ES5`, el compilador generará código compatible con navegadores antiguos.
* **`module`**: Especifica el sistema de módulos que se generará en el JavaScript de salida (como `CommonJS` para Node.js tradicional o `ESNext` para módulos modernos de JavaScript).
* **`sourceMap`**: Un valor booleano (`true`/`false`). Si se activa, genera archivos `.js.map` que permiten a las herramientas de depuración (como las DevTools de Chrome o VS Code) mapear el código JavaScript en ejecución directamente de vuelta a tus archivos fuente `.ts`.
* **`removeComments`**: Cuando se establece en `true`, el compilador elimina todos los comentarios del código TypeScript al generar los archivos JavaScript resultantes, reduciendo ligeramente el tamaño del archivo final.

### El comportamiento por defecto

Si omites por completo las propiedades `include` y `exclude`, TypeScript por defecto asume que deseas incluir todos los archivos con extensión `.ts`, `.tsx` y `.d.ts` que se encuentren en el directorio que contiene el `tsconfig.json` y todos sus subdirectorios, a excepción de la carpeta `node_modules`.

Dominar la anatomía del `tsconfig.json` te permite adaptar el compilador a las necesidades arquitectónicas de cualquier proyecto, garantizando que el flujo de trabajo sea eficiente tanto en entornos de desarrollo local como en los servidores de integración continua.

## 12.2 Opciones del modo estricto (strict)

El sistema de tipos de TypeScript es altamente flexible, lo que permite una transición gradual desde JavaScript puro. Sin embargo, para obtener la máxima seguridad de tipo y prevenir la mayor cantidad de errores en tiempo de ejecución, TypeScript ofrece el llamado **Modo Estricto**.

En el archivo `tsconfig.json`, el modo estricto se controla principalmente mediante una propiedad maestra llamada `strict`.

```json
{
  "compilerOptions": {
    "strict": true
  }
}

```

Cuando estableces `"strict": true`, TypeScript activa automáticamente un conjunto de validaciones internas. Es la práctica recomendada para cualquier proyecto nuevo. Si en algún momento necesitas relajar una regla específica sin desactivar las demás, puedes declarar esa regla explícitamente como `false` justo debajo de la propiedad `strict`.

A continuación, analizamos las reglas individuales más importantes que se habilitan bajo este modo.

### 1. `noImplicitAny`

Cuando TypeScript no puede inferir el tipo de una variable o parámetro, y este no tiene una anotación explícita, el compilador le asigna de forma predeterminada el tipo `any`. Con `noImplicitAny` activado, el compilador emitirá un error cada vez que esto ocurra.

* **Código no válido con `noImplicitAny`:**

```typescript
// Error: El parámetro 'usuario' implícitamente tiene el tipo 'any'
function saludar(usuario) {
    console.log(`Hola, ${usuario.nombre}`);
}

```

* **Código corregido:**

```typescript
interface Usuario {
    nombre: string;
}

function saludar(usuario: Usuario) {
    console.log(`Hola, ${usuario.nombre}`);
}

```

### 2. `strictNullChecks`

Por defecto en JavaScript y en el TypeScript no estricto, `null` y `undefined` son asignables a cualquier tipo (por ejemplo, podías asignar `null` a una variable de tipo `string`). Esto suele provocar el famoso error en tiempo de ejecución: `TypeError: Cannot read properties of null`.

Con `strictNullChecks` activo, `null` y `undefined` obtienen sus propios tipos independientes y no se pueden asignar a otros tipos a menos que uses una unión explícita.

```text
┌────────────────────────────────────────┐
│        Sin strictNullChecks            │
│  string ◄─── (acepta null / undefined) │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│        Con strictNullChecks            │
│  string | null ◄─── (Unión explícita)  │
└────────────────────────────────────────┘

```

* **Código no válido con `strictNullChecks`:**

```typescript
  let nombre: string = "Carlos";
  nombre = null; // Error: El tipo 'null' no es asignable al tipo 'string'

```

* **Código corregido:**

```typescript
  let nombre: string | null = "Carlos";
  nombre = null; // Válido gracias a la unión de tipos

```

### 3. `strictFunctionTypes`

Esta opción asegura que los parámetros de las funciones se verifiquen de forma más segura (contravariante). Impide que pases una función que espera un tipo más específico en un lugar donde se requiere una función que maneja un tipo más genérico, evitando fallos estructurales al invocar callbacks.

* **Ejemplo de comportamiento:**
Si una función del sistema espera procesar un `Animal`, no puedes pasarle una función que requiera obligatoriamente un `Perro`, porque el sistema podría enviarle un `Gato` y romper la ejecución.

### 4. `strictBindCallApply`

Garantiza que los métodos nativos de JavaScript para manipular el contexto de las funciones (`bind`, `call` y `apply`) verifiquen estrictamente que los argumentos pasados coincidan con la firma de la función original.

* **Código no válido con `strictBindCallApply`:**

```typescript
  function calcularEnvio(distancia: number, peso: number) {
      return distancia * peso;
  }

  // Error: Argumento de tipo 'string' no es asignable a 'number'
  calcularEnvio.call(null, 100, "20"); 

```

### 5. `strictPropertyInitialization`

Esta regla obliga a que todas las propiedades de una clase no opcionales sean inicializadas directamente en su declaración o dentro del constructor de la clase. Trabaja de la mano con `strictNullChecks`.

* **Código no válido con `strictPropertyInitialization`:**

```typescript
  class Alerta {
      mensaje: string; // Error: La propiedad 'mensaje' no tiene modificador de inicialización
      
      constructor() {
          // No se inicializó 'mensaje'
      }
  }

```

* **Código corregido:**

```typescript
  class Alerta {
      mensaje: string;

      constructor(texto: string) {
          this.mensaje = texto; // Inicialización correcta
      }
  }

```

Si estás seguro de que una propiedad se inicializará mediante un método externo (o un framework), puedes usar el operador de aserción de asignación definitiva (`!`):

```typescript
class Alerta {
    mensaje!: string; // Le aseguras a TS que se inicializará externamente
}

```

### 6. `noImplicitThis`

Produce un error cuando el valor de la palabra clave `this` no tiene un tipo claro o inferido, lo que evita que accedas a propiedades inexistentes en el contexto de ejecución actual.

* **Código corregido usando anotación explícita para `this`:**

```typescript
  function registrarClick(this: HTMLElement) {
      this.style.display = "none"; // TS sabe con certeza qué es 'this'
  }

```

### Resumen de impacto

Activar el modo estricto transforma a TypeScript de un "asistente de autocompletado" a un verdadero validador de resiliencia de software. Aunque requiere escribir código más minucioso, erradica categorías enteras de bugs antes de que el código llegue a producción.

## 12.3 Configuración de rutas (outDir, rootDir)

En proyectos pequeños, es común compilar los archivos TypeScript y generar los archivos JavaScript resultantes en la misma carpeta. Sin embargo, en aplicaciones profesionales, mantener mezclados los archivos fuente (`.ts`) con los archivos compilados (`.js`) genera desorden en el espacio de trabajo y complica la gestión del control de versiones.

Para resolver esto, el archivo `tsconfig.json` ofrece opciones específicas dentro del objeto `compilerOptions` para estructurar limpiamente las rutas de entrada y salida de tu proyecto: `rootDir` y `outDir`.

### Arquitectura típica de un proyecto

El estándar de la industria consiste en aislar todo el código fuente escrito por los desarrolladores dentro de una carpeta llamada `src`, y dirigir el código compilado que será ejecutado por Node.js o el navegador a una carpeta llamada `dist` (de *distribution*) o `build`.

```text
[ Raíz del Proyecto ]
 ├── tsconfig.json
 ├── /src                 <─── Controlado por 'rootDir'
 │    ├── index.ts
 │    └── /servicios
 │         └── api.ts
 └── /dist                <─── Controlado por 'outDir'
      ├── index.js
      └── /servicios
           └── api.js

```

### La propiedad `outDir`

La opción `outDir` especifica el directorio de salida donde el compilador debe colocar todos los archivos JavaScript traducidos (`.js`), así como los archivos de mapas de código (`.js.map`) o archivos de declaración (`.d.ts`) si estuvieran activos.

Si la carpeta especificada no existe, el compilador `tsc` la creará automáticamente al ejecutar la compilación.

```json
{
  "compilerOptions": {
    "outDir": "./dist"
  }
}

```

Al compilar con esta opción, TypeScript replicará exactamente la estructura de carpetas original del código fuente dentro del directorio de destino.

### La propiedad `rootDir`

La opción `rootDir` le indica al compilador cuál es la raíz de los archivos fuente del proyecto. Su propósito principal es controlar la estructura de directorios que se replica en el directorio de salida (`outDir`).

```json
{
  "compilerOptions": {
    "rootDir": "./src"
  }
}

```

Es un error común pensar que `rootDir` define qué archivos se van a compilar (función que, como vimos en la sección 12.1, pertenece a `include`). `rootDir` simplemente sirve de guía para que la estructura de carpetas empiece a clonarse a partir de ese nivel.

#### Restricción fundamental de `rootDir`

Si configuras `"rootDir": "./src"`, todos los archivos TypeScript que participen en la compilación **deben** estar ubicados dentro de la carpeta `src`. Si el compilador encuentra un archivo fuera de esa ruta (por ejemplo, si `index.ts` importa un archivo ubicado en una carpeta `/test` al mismo nivel que `src`), la compilación fallará emitiendo un error indicando que ese archivo no está bajo el directorio raíz especificado.

### Combinación de propiedades en la práctica

A continuación, se detalla una configuración estándar y óptima para un entorno de producción donde se separan de manera estricta las rutas de desarrollo y distribución:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "rootDir": "./src",
    "outDir": "./dist",
    "strict": true
  },
  "include": [
    "src/**/*"
  ]
}

```

### El proceso de limpieza (`--clean`)

Una limitación nativa de `outDir` es que el compilador de TypeScript no borra el contenido de la carpeta de salida antes de compilar; simplemente sobrescribe los archivos existentes o crea los nuevos. Si renombras o eliminas un archivo `.ts` en tu carpeta `src`, su versión antigua `.js` seguirá existiendo en la carpeta `dist`.

Para solucionar esto de manera moderna en TypeScript, puedes usar el modo de construcción del compilador con el flag `--clean` combinado con `--build` (`-b`), el cual se encarga de vaciar los directorios de salida configurados antes de iniciar una nueva compilación:

```bash
tsc -b --clean

```

## 12.4 Gestión de librerías y targets

Para culminar la configuración de nuestro compilador, debemos entender cómo TypeScript se comunica con el entorno de ejecución externo. A diferencia de otros lenguajes compilados que generan código máquina binario, TypeScript compila a JavaScript, un lenguaje que se ejecuta en entornos muy diversos (motores de navegadores antiguos, navegadores modernos, diferentes versiones de Node.js, Cloudflare Workers, etc.).

Para controlar con precisión qué características de JavaScript puede usar el compilador y qué herramientas del entorno reconoce, disponemos de dos propiedades fundamentales: `target` y `lib`.

### La propiedad `target`

La opción `target` determina la versión de JavaScript (ECMAScript) a la que se traducirá tu código fuente de TypeScript. Es una de las decisiones arquitectónicas más importantes, ya que define la compatibilidad hacia atrás de tu aplicación.

```json
{
  "compilerOptions": {
    "target": "ES6"
  }
}

```

Si escribes código utilizando características modernas (como funciones de flecha, clases o el operador de encadenamiento opcional) y configuras el `target` en una versión antigua, el compilador realizará un proceso de transformación (o *downleveling*) para simular ese comportamiento con sintaxis compatible.

Por ejemplo, observemos cómo se transforma un fragmento de código según el `target`:

* **Código fuente TypeScript (Original):**

```typescript
const saludar = (nombre: string) => `Hola, ${nombre}`;

```

* **Resultado con `"target": "ES5"` (Para navegadores antiguos):**

```javascript
// Se transforma a una función tradicional y concatenación clásica
var saludar = function (nombre) {
    return "Hola, ".concat(nombre);
};

```

* **Resultado con `"target": "ES2022"` (Para entornos modernos):**

```javascript
// Se preserva la función de flecha y los template literals nativos
const saludar = (nombre) => `Hola, ${nombre}`;

```

#### Opciones comunes de `target`

* `ES5`: Máxima compatibilidad, ideal si aún se requiere dar soporte a navegadores obsoletos.
* `ES6` o `ES2015`: El estándar moderno base, soportado por prácticamente cualquier entorno actual.
* `ES2022` o `ESNext`: Utiliza las características más recientes del lenguaje. `ESNext` apunta siempre a la versión más alta que soporte la versión actual de tu compilador TypeScript.

### La propiedad `lib`

Mientras que `target` define la **sintaxis** del código generado, la propiedad `lib` define qué **APIs globales** y objetos en tiempo de ejecución conoce TypeScript al momento de compilar.

Por ejemplo, el objeto `window`, el método `fetch()` o el método `document.getElementById()` no son parte del lenguaje JavaScript en sí, sino de la API del Navegador (DOM). Por otro lado, herramientas como `Map`, `Set` o `Promise` son parte de las especificaciones modernas de ECMAScript.

Si no especificas la propiedad `lib`, TypeScript incluye automáticamente un conjunto de librerías predeterminadas basadas en el `target` que hayas elegido. Sin embargo, en proyectos profesionales es habitual definirlo explícitamente para evitar sorpresas:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"]
  }
}

```

#### ¿Cuándo es crucial configurar `lib`?

Imagina que estás desarrollando una aplicación para Node.js utilizando un `target` moderno como `ES2022`. Si dejas la configuración por defecto o incluyes `"DOM"`, el compilador te permitirá escribir código como `document.createElement('div')` sin marcar ningún error en el editor. Sin embargo, al ejecutar ese código en Node.js, la aplicación fallará inmediatamente porque `document` no existe en ese entorno.

Al configurar `lib` de manera precisa, aíslas las APIs disponibles:

* **Para una aplicación Web Moderna:** `["ES2022", "DOM", "DOM.Iterable"]`
* **Para una aplicación de Backend (Node.js):** `["ES2022"]` (sin añadir `DOM`).

## Resumen del capítulo

En este **Capítulo 12: Configuración del Compilador**, hemos desmitificado el archivo `tsconfig.json`, consolidándolo como la pieza central que rige las reglas de juego en cualquier proyecto TypeScript.

* Descubrimos la **estructura base del archivo** (`include`, `exclude`, `files`) aprendiendo a delimitar qué archivos entran en el flujo de compilación.
* Analizamos el impacto de habilitar el **Modo Estricto (`strict`)**, una colección de directivas de seguridad (como `noImplicitAny` y `strictNullChecks`) dedicadas a erradicar errores comunes en tiempo de diseño antes de que muten en fallos en tiempo de ejecución.
* Aprendimos a organizar la arquitectura del espacio de trabajo separando el código fuente del código de distribución mediante las propiedades **`rootDir` y `outDir`**.
* Finalmente, comprendimos cómo gestionar el entorno destino mediante **`target`** (para definir la compatibilidad de la sintaxis resultante) y **`lib`** (para declarar qué APIs del entorno de ejecución global están al alcance de nuestro código).

Con este conocimiento, estás listo para estructurar proyectos escalables, limpios, seguros y perfectamente adaptados al entorno de ejecución que requiera tu software.
