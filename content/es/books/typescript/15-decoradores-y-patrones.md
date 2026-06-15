El desarrollo de aplicaciones empresariales exige un código limpio, modular y mantenible. A medida que los proyectos crecen, la lógica secundaria como el registro de operaciones, la seguridad y la validación suele duplicarse y oscurecer la verdadera lógica de negocio.

Este capítulo introduce el concepto de decoradores, una potente característica de metaprogramación en TypeScript que permite inspeccionar, anotar y modificar el comportamiento de clases, métodos, propiedades y parámetros en tiempo de ejecución de forma declarativa. A lo largo de estas secciones, aprenderás a habilitar esta sintaxis y a combinarla estratégicamente para implementar patrones de diseño avanzados como Singleton e Inyección de Dependencias.

## 15.1 ¿Qué son y cómo habilitar decoradores?

En el desarrollo de software a gran escala, es común encontrarse con la necesidad de añadir lógica repetitiva a nuestras clases, métodos o propiedades. Tareas como el registro de operaciones (*logging*), la validación de datos, la gestión de permisos o la inyección de dependencias suelen dispersarse por toda la base de código, violando el principio de responsabilidad única.

Los **decoradores** resuelven este problema proporcionando una sintaxis elegante para la metaprogramación, permitiendo inspeccionar, modificar o sustituir definiciones de clases y sus miembros en tiempo de ejecución.

### ¿Qué es un decorador?

Desde una perspectiva conceptual, un decorador es un patrón de diseño estructural que permite añadir funcionalidades a un objeto de forma dinámica sin modificar su comportamiento interno.

En TypeScript, un decorador se implementa como una **función especial** que se antepone a la declaración de una clase, método, propiedad, accesador o parámetro utilizando el símbolo `@` como prefijo. Cuando el código se compila y se ejecuta, esta función es invocada automáticamente por el motor de JavaScript, recibiendo información detallada sobre el elemento que está decorando.

```text
[ Código fuente sin decorar ] ──> Aplicar @Decorador ──> [ Elemento modificado/extendido ]

```

Es fundamental entender que los decoradores se ejecutan **una sola vez**, justo cuando la clase es definida por el motor de JavaScript, y no cuando se crean las instancias de dicha clase.

### La dualidad de los decoradores en TypeScript

El ecosistema de TypeScript ha experimentado una transición importante respecto a la especificación de los decoradores. Actualmente coexisten dos aproximaciones:

1. **Decoradores Experimentales (Legacy):** Basados en una propuesta antigua de ECMAScript (Etapa 2). Son los más utilizados históricamente en frameworks populares como Angular (versiones anteriores a la adopción del nuevo estándar) y NestJS.
2. **Decoradores Estándar (ECMAScript):** Integrados de forma nativa a partir de TypeScript 5.0, siguiendo la propuesta oficial que alcanzó la Etapa 3 (Stage 3) en el comité de JavaScript (TC39).

> **Nota:** Aunque los decoradores estándar son el futuro del lenguaje, los decoradores experimentales siguen siendo ampliamente requeridos en el ámbito profesional debido al software heredado y a las arquitecturas de frameworks consolidados.

### Cómo habilitar los decoradores

Debido a la bifurcación histórica mencionada, la forma en que configuras tu proyecto determinará qué tipo de decoradores estarás utilizando.

#### 1. Habilitar Decoradores Experimentales (Stage 2)

Para utilizar la sintaxis clásica de decoradores (necesaria si trabajas con NestJS o proyectos antiguos de Angular), debes indicarle explícitamente al compilador de TypeScript (`tsc`) que permita esta característica experimental. Esto se realiza modificando el archivo `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}

```

* **`experimentalDecorators`**: Habilita la sintaxis y el comportamiento clásico de los decoradores.
* **`emitDecoratorMetadata`**: Requerido por la mayoría de frameworks de inyección de dependencias (como NestJS o InversifyJS). Permite almacenar información del tipo de datos en tiempo de ejecución utilizando la librería `reflect-metadata`.

#### 2. Uso de Decoradores Estándar (Stage 3)

A partir de TypeScript 5.0, si deseas utilizar los decoradores nativos estandarizados por ECMAScript, **no debes activar** la casilla `experimentalDecorators`. El compilador los reconocerá de forma automática siempre que el entorno objetivo de salida sea moderno:

```json
{
  "compilerOptions": {
    "target": "ES2022"
    // "experimentalDecorators" debe estar omitido o en false
  }
}

```

### Anatomía y firma de un decorador básico

Para comprender cómo operan internamente, analizaremos la estructura de un decorador experimental aplicado a una clase. Al ser funciones, su comportamiento está definido por los argumentos que reciben según el contexto donde se apliquen.

A continuación, se define un decorador de clase llamado `@Congelar` cuyo objetivo es evitar que se puedan añadir o modificar las propiedades del prototipo de la clase en tiempo de ejecución:

```typescript
// Definición del decorador (es una función común)
function Congelar(constructor: Function) {
    console.log("Decorador ejecutado para la clase:", constructor.name);
    Object.freeze(constructor);
    Object.freeze(constructor.prototype);
}

// Aplicación del decorador
@Congelar
class ReporteMatematico {
    titulo: string;
    
    constructor(titulo: string) {
        this.titulo = titulo;
    }
}

// Prueba de comportamiento en tiempo de ejecución
const miReporte = new ReporteMatematico("Ventas Anuales");

try {
    // Intentar extender el prototipo fallará porque la clase está congelada
    (ReporteMatematico.prototype as any).nuevaPropiedad = "Error";
} catch (error) {
    console.log("No se pudo modificar la clase. ¡El decorador funcionó correctamente!");
}

```

### Fábricas de Decoradores (*Decorator Factories*)

Si necesitas pasarle argumentos personalizados a un decorador para alterar su comportamiento dinámicamente, debes utilizar una **Fábrica de Decoradores**. Una fábrica es simplemente una función que retorna otra función (el decorador real).

El siguiente ejemplo muestra cómo pasar una configuración específica a un decorador:

```typescript
// Esta es la fábrica de decoradores
// Recibe los parámetros que el desarrollador introduce al usar el decorador
function IdentificadorEntidad(idPrefijo: string) {
    // Retorna el decorador real
    return function(constructor: Function) {
        constructor.prototype.idUnico = `${idPrefijo}-${Math.random().toString(36).substr(2, 9)}`;
    };
}

@IdentificadorEntidad("USR")
class Usuario {
    nombre: string;
    constructor(nombre: string) {
        this.nombre = nombre;
    }
}

const usuarioNuevo = new Usuario("Carlos");
// Acceso a la propiedad inyectada por el decorador a través del prototipo
console.log((usuarioNuevo as any).idUnico); // Imprime algo como: USR-x7y2z9w1q

```

Gracias a este mecanismo, TypeScript nos permite encapsular comportamientos complejos y transversales de una manera limpia, declarativa y reutilizable, sentando las bases para patrones arquitectónicos avanzados que se estudiarán en las siguientes secciones.

## 15.2 Decoradores de clases y métodos

Una vez comprendida la naturaleza de los decoradores y cómo habilitarlos, es momento de profundizar en sus aplicaciones prácticas. Aunque la sintaxis externa siempre utiliza el prefijo `@`, el comportamiento interno y los argumentos que recibe la función del decorador varían drásticamente según el elemento sobre el que se aplique.

En esta sección nos enfocaremos en los dos tipos de decoradores más utilizados en la arquitectura de software: los **decoradores de clases** y los **decoradores de métodos**.

### Decoradores de Clases

Un decorador de clase se declara justo antes de la definición de la clase. El decorador se aplica al constructor de la clase y permite inspeccionar, modificar o incluso sustituir por completo la definición de la misma.

#### Firma del decorador (Enfoque Experimental)

En el modo experimental, la función recibe un único argumento:

* `target`: El constructor de la clase que está siendo decorada.

#### Caso de uso: Sobrescribir el constructor para inyectar propiedades

El siguiente ejemplo muestra cómo un decorador de clase puede alterar la instancia para añadir automáticamente una propiedad de auditoría (`creadoEn`) a cualquier clase que decore, sin necesidad de modificar manualmente sus constructores.

```typescript
function ConAuditoria<T extends { new (...args: any[]): {} }>(constructor: T) {
    return class extends constructor {
        creadoEn = new Date();
    };
}

@ConAuditoria
class Alumno {
    nombre: string;

    constructor(nombre: string) {
        this.nombre = nombre;
    }
}

// Validación de la inyección de propiedades
const alumno1 = new Alumno("Sofía");
console.log(alumno1.nombre); // Sofía

// Nota: TypeScript requiere un casteo a 'any' en modo experimental 
// porque el sistema de tipos estático no conoce la modificación en tiempo de ejecución.
console.log((alumno1 as any).creadoEn); // Imprime la fecha y hora actual

```

### Decoradores de Métodos

Un decorador de método se sitúa justo antes de la declaración de un método dentro de una clase. Se utiliza para supervisar, modificar o reemplazar la definición de dicho método. Es ideal para interceptar llamadas, medir rendimiento, validar argumentos o gestionar excepciones de forma centralizada.

#### Firma del decorador (Enfoque Experimental)

La función del decorador de método recibe tres argumentos:

1. `target`: El prototipo de la clase (si el método es de instancia) o el constructor de la clase (si el método es estático).
2. `propertyKey`: El nombre del método (tipo `string` o `symbol`).
3. `descriptor`: El descriptor de la propiedad del método (tipo `PropertyDescriptor`). Este objeto contiene propiedades clave como `value` (la función original), `writable`, `enumerable` y `configurable`.

#### Caso de uso: Interceptor de registro (*Logger*) y manejo de errores

Imagine que desea medir de forma automatizada cuánto tarda en ejecutarse un método y capturar cualquier error inesperado de forma limpia. En lugar de llenar todos los métodos de bloques `try/catch` y objetos `console.time`, podemos abstraer la lógica en un decorador.

```typescript
function Monitorizar(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    // Guardamos una referencia al método original
    const metodoOriginal = descriptor.value;

    // Sustituimos el método original por una nueva función
    descriptor.value = function (...args: any[]) {
        console.log(`[Inicio] Ejecutando el método: ${propertyKey} con argumentos: ${JSON.stringify(args)}`);
        const inicio = performance.now();

        try {
            // Ejecutamos el método original asegurando el contexto correcto ('this')
            const resultado = metodoOriginal.apply(this, args);
            
            const fin = performance.now();
            console.log(`[Fin] Método ${propertyKey} finalizado en ${(fin - inicio).toFixed(2)}ms`);
            return resultado;
        } catch (error) {
            console.error(`[Error] Fallo crítico en ${propertyKey}:`, error);
            // Podemos decidir si relanzar el error o manejarlo elegantemente
            throw error;
        }
    };

    // Retornamos el descriptor modificado
    return descriptor;
}

class ProcesadorPagos {
    @Monitorizar
    procesar(monto: number, divisa: string): boolean {
        // Simulación de lógica de negocio
        if (monto <= 0) {
            throw new Error("El monto debe ser mayor a cero.");
        }
        return true;
    }
}

const pasarela = new ProcesadorPagos();
pasarela.procesar(150, "USD"); 
// Salida en consola:
// [Inicio] Ejecutando el método: procesar con argumentos: [150,"USD"]
// [Fin] Método procesar finalizado en 0.05ms

```

### Flujo de Ejecución y Composición

Cuando se aplican múltiples decoradores a un mismo elemento, TypeScript los evalúa de arriba hacia abajo (orden de declaración), pero los ejecuta de **abajo hacia arriba** (orden de evaluación matemática de funciones compuestas: $f(g(x))$).

A continuación se ilustra visualmente el orden de ejecución en un método que cuenta con dos decoradores:

```text
@DecoradorUno
@DecoradorDos
miMetodo() {}

Flujo de ejecución:
1. Evaluación de @DecoradorUno
2. Evaluación de @DecoradorDos
3. Ejecución de @DecoradorDos <── (Se ejecuta primero)
4. Ejecución de @DecoradorUno <── (Se ejecuta después)

```

Veamos un ejemplo de código para comprobar este comportamiento:

```typescript
function Primero() {
    return function (target: any, key: string, descriptor: PropertyDescriptor) {
        console.log("Ejecutando el primer decorador");
    };
}

function Segundo() {
    return function (target: any, key: string, descriptor: PropertyDescriptor) {
        console.log("Ejecutando el segundo decorador");
    };
}

class EjemploComposicion {
    @Primero()
    @Segundo()
    evaluar() {}
}

// Salida en consola al compilar/ejecutar el archivo:
// "Ejecutando el segundo decorador"
// "Ejecutando el primer decorador"

```

Entender esta jerarquía y orden de precedencia es vital cuando construyes sistemas donde un decorador depende directamente de las transformaciones o metadatos introducidos por otro decorador previo.

## 15.3 Decoradores de propiedades y parámetros

Mientras que los decoradores de clases y métodos permiten modificar el comportamiento estructural y funcional, los decoradores de **propiedades** y **parámetros** se utilizan principalmente para la **metaprogramación**. Su función no es transformar el valor del elemento directamente (ya que tienen limitaciones técnicas para ello), sino "marcarlo" con metadatos que luego serán procesados por otros decoradores o librerías externas.

### Decoradores de Propiedades

Un decorador de propiedad se declara justo antes de una propiedad de clase. En el modelo experimental de TypeScript, estos decoradores tienen una limitación importante: no reciben un descriptor de propiedad (`PropertyDescriptor`) y no pueden devolver uno. Por lo tanto, no pueden interceptar fácilmente el acceso a la propiedad por sí mismos.

#### Firma del decorador

La función recibe dos argumentos:

1. `target`: El prototipo de la clase (instancia) o el constructor (estático).
2. `propertyKey`: El nombre de la propiedad decorada.

#### Caso de uso: Validación y Metadatos

Dado que el decorador de propiedad no puede cambiar el valor, suele usarse junto con la librería `reflect-metadata` para almacenar reglas de validación. En el siguiente ejemplo, simulamos este comportamiento:

```typescript
// Diccionario simple para simular almacenamiento de metadatos
const reglasValidacion: any = {};

function Requerido(target: any, propertyKey: string) {
    const nombreClase = target.constructor.name;
    if (!reglasValidacion[nombreClase]) {
        reglasValidacion[nombreClase] = [];
    }
    // "Marcamos" la propiedad como obligatoria
    reglasValidacion[nombreClase].push(propertyKey);
}

class FormularioRegistro {
    @Requerido
    email: string | undefined;

    @Requerido
    usuario: string | undefined;

    ubicacion: string | undefined; // No decorada
}

function validar(instancia: any): boolean {
    const nombreClase = instancia.constructor.name;
    const campos = reglasValidacion[nombreClase] || [];
    return campos.every((campo: string) => instancia[campo] !== undefined);
}

const registro = new FormularioRegistro();
console.log(validar(registro)); // false (email y usuario son undefined)

```

### Decoradores de Parámetros

Los decoradores de parámetros se aplican a los argumentos de un método o constructor. Su única misión es registrar información sobre qué posición ocupa un parámetro específico para que el método que lo contiene sepa cómo tratarlo.

#### Firma del decorador

La función recibe tres argumentos:

1. `target`: El prototipo o constructor.
2. `propertyKey`: El nombre del método donde reside el parámetro (o `undefined` si es un constructor).
3. `parameterIndex`: La posición numérica del parámetro en la firma del método (comenzando en 0).

#### Caso de uso: Identificación de parámetros para Inyección de Dependencias

Este es el patrón base que utilizan frameworks como Angular o NestJS para saber qué objeto inyectar en cada posición.

```typescript
function LogParametro(target: any, propertyKey: string, parameterIndex: number) {
    console.log(`Decorando parámetro en el método: ${propertyKey}`);
    console.log(`Índice del parámetro: ${parameterIndex}`);
}

class ServicioEnvio {
    enviarMensaje(@LogParametro mensaje: string, @LogParametro urgente: boolean): void {
        console.log(`Enviando: ${mensaje} (Urgente: ${urgente})`);
    }
}

// Salida al compilar/ejecutar:
// Decorando parámetro en el método: enviarMensaje
// Índice del parámetro: 1 (urgente)
// Decorando parámetro en el método: enviarMensaje
// Índice del parámetro: 0 (mensaje)

```

Observe que el orden de ejecución de los decoradores de parámetros es de **derecha a izquierda** (del último parámetro al primero).

### Sinergia: Combinando todos los decoradores

La verdadera potencia de los decoradores surge cuando se usan en conjunto. Un decorador de parámetro puede "marcar" una posición, y un decorador de método puede "leer" esa marca para realizar una acción antes de ejecutar la lógica original.

A continuación se muestra un diagrama de cómo colaboran para realizar una validación compleja:

```text
[ Decorador de Parámetro ]  ──> Registra posición del argumento @NoNulo
            │
            ▼
[ Decorador de Método ]     ──> Antes de ejecutar:
                                1. Lee registros de parámetros.
                                2. Comprueba si el valor en esa posición es null.
                                3. Lanza error o permite la ejecución.
            │
            ▼
[ Método Original ]         ──> Ejecuta lógica de negocio segura.

```

Este enfoque permite que el programador escriba:

```typescript
class AdminPanel {
    actualizarPerfil(@ValidarNoNulo datos: any) {
        // La lógica aquí ya no necesita "if (datos === null)"
        // El decorador de método se encargó de la validación previa
    }
}

```

### Resumen de argumentos por tipo de decorador

| Tipo | Argumento 1 (`target`) | Argumento 2 (`key`) | Argumento 3 | Retorno esperado |
| --- | --- | --- | --- | --- |
| **Clase** | Constructor | - | - | Clase / void |
| **Método** | Prototipo / Constructor | Nombre método | PropertyDescriptor | Descriptor / void |
| **Propiedad** | Prototipo / Constructor | Nombre propiedad | - | void |
| **Parámetro** | Prototipo / Constructor | Nombre método | Índice (number) | void |

En la siguiente sección, aplicaremos todos estos conceptos para implementar patrones de diseño reales, como el patrón *Singleton* o el de *Inyección de Dependencias*, utilizando la infraestructura de tipos avanzada de TypeScript.

## 15.4 Patrones de diseño aplicados

Los patrones de diseño son soluciones estandarizadas a problemas recurrentes en el desarrollo de software. En el ecosistema de TypeScript, el uso de tipos avanzados junto con la metaprogramación mediante decoradores abre un abanico de posibilidades para implementar estos patrones de una manera mucho más declarativa, limpia y reutilizable que en JavaScript tradicional.

En esta sección, aplicaremos todo lo aprendido en el capítulo para estructurar dos de los patrones más utilizados en la arquitectura de software: **Singleton** (Creacional) e **Inyección de Dependencias** (Estructural).

### 1. El Patrón Singleton con Decoradores

El objetivo del patrón *Singleton* es garantizar que una clase tenga una **única instancia** en toda la aplicación y proporcionar un punto de acceso global a ella. Es ideal para servicios de configuración, clientes de bases de datos o gestores de estado.

En TypeScript convencional, esto se logra haciendo el constructor `private` y usando un método estático `getInstance()`. Sin embargo, mediante un decorador de clase, podemos transformar cualquier clase ordinaria en un Singleton sin alterar su firma ni su sintaxis de instanciación.

#### Implementación del Decorador `@Singleton`

```typescript
// Almacén cerrado para guardar las instancias únicas de cada clase
const instanciasSingletons = new WeakMap<Function, any>();

function Singleton<T extends { new (...args: any[]): {} }>(constructor: T) {
    return class extends constructor {
        constructor(...args: any[]) {
            // Si ya existe una instancia de esta clase, la retornamos inmediatamente
            if (instanciasSingletons.has(constructor)) {
                return instanciasSingletons.get(constructor);
            }
            // Si no existe, creamos la primera invocando al constructor base
            super(...args);
            instanciasSingletons.set(constructor, this);
        }
    };
}

@Singleton
class GestorConfiguracion {
    theme: string = "dark";
    constructor() {
        console.log("¡Inicializando el Gestor de Configuración por primera vez!");
    }
}

// Prueba de comportamiento
const config1 = new GestorConfiguracion(); // Imprime el mensaje de inicialización
const config2 = new GestorConfiguracion(); // No imprime nada, reutiliza la instancia

config2.theme = "light";

console.log(config1.theme); // "light"
console.log(config1 === config2); // true (Ambas variables apuntan exactamente al mismo objeto)

```

### 2. Patrón Inyección de Dependencias (IoC / DI)

La **Inyección de Dependencias** es un patrón arquitectónico derivado del principio de Inversión de Control (IoC). En lugar de que una clase cree internamente los servicios que necesita para funcionar (generando un acoplamiento fuerte), las dependencias le son "inyectadas" desde el exterior, generalmente por un contenedor centralizado.

A continuación, combinaremos **decoradores de clase** (para registrar servicios), **decoradores de parámetros** (para solicitar la inyección) y el tipado de TypeScript para construir un contenedor de inversión de control minimalista.

#### Flujo del Contenedor de Dependencias

```text
[ @Servicio ] ──> Registra la clase en el Contenedor de IoC
                         │
                         ▼
[ @Inyectar ] ──> Solicita la dependencia mediante un identificador
                         │
                         ▼
[ Contenedor ] ──> Resuelve las instancias automáticamente en el constructor

```

#### Código Completo de la Arquitectura

```typescript
// 1. El Contenedor de Inversión de Control (IoC)
class ContenedorIoC {
    private static servicios = new Map<string, any>();

    // Registra una instancia asociada a una clave string
    static registrar(clave: string, instancia: any): void {
        this.servicios.set(clave, instancia);
    }

    // Obtiene una instancia registrada
    static resolver(clave: string): any {
        const servicio = this.servicios.get(clave);
        if (!servicio) {
            throw new Error(`El servicio solicitado '${clave}' no está registrado.`);
        }
        return servicio;
    }
}

// 2. Decorador de Clase para registrar servicios automáticamente
function Servicio(token: string) {
    return function (constructor: any) {
        // Instanciamos el servicio y lo guardamos en el contenedor al arrancar la app
        const instancia = new constructor();
        ContenedorIoC.registrar(token, instancia);
    };
}

// 3. Decorador de Parámetro para inyectar la dependencia
function Inyectar(token: string) {
    return function (target: any, propertyKey: string | undefined, parameterIndex: number) {
        // Guardamos metadatos en el constructor sobre qué parámetro necesita qué servicio
        const claseDestino = target;
        if (!claseDestino.$dependencias) {
            claseDestino.$dependencias = [];
        }
        claseDestino.$dependencias[parameterIndex] = token;
    };
}

// 4. Decorador de Clase para resolver las dependencias anotadas en el constructor
function AutoInyectable<T extends { new (...args: any[]): {} }>(constructor: T) {
    return class extends constructor {
        constructor(...args: any[]) {
            // Leemos las dependencias guardadas previamente por el decorador @Inyectar
            const tokensRequeridos = (constructor as any).$dependencias || [];
            
            // Resolvemos dinámicamente cada dependencia desde el contenedor de IoC
            const dependenciasInyectadas = tokensRequeridos.map((token: string) => 
                ContenedorIoC.resolver(token)
            );

            // Pasamos las dependencias resueltas al constructor original
            super(...dependenciasInyectadas);
        }
    };
}

// --- CASO DE USO REAL ---

@Servicio("LoggerService")
class Logger {
    log(mensaje: string) {
        console.log(`[LOG - ${new Date().toLocaleTimeString()}]: ${mensaje}`);
    }
}

@AutoInyectable
class ControladorUsuarios {
    private logger: Logger;

    // Usamos @Inyectar para mapear el parámetro con el token del contenedor
    constructor(@Inyectar("LoggerService") logger?: Logger) {
        // El operador '!' le indica a TS que la propiedad se asignará con seguridad
        this.logger = logger!; 
    }

    crearUsuario(nombre: string) {
        // Lógica de negocio...
        this.logger.log(`Usuario '${nombre}' creado exitosamente.`);
    }
}

// Ejecución del sistema
const controlador = new ControladorUsuarios();
controlador.crearUsuario("Alejandro"); 
// Salida en consola: [LOG - 08:30:15]: Usuario 'Alejandro' creado exitosamente.

```

Este enfoque desacopla por completo la creación de las dependencias de su consumo, facilitando enormemente las pruebas unitarias (*testing*), ya que permite sustituir el objeto `Logger` real por un sustituto (*mock*) en el contenedor IoC sin alterar una sola línea de la clase `ControladorUsuarios`.

## Resumen del capítulo

En este **Capítulo 15**, hemos explorado las capacidades de metaprogramación que TypeScript ofrece a través de los **Decoradores**, una herramienta indispensable para el desarrollo de arquitecturas empresariales sólidas y extensibles.

* **Fundamentos y Configuración (15.1):** Aprendimos que los decoradores son funciones que inspeccionan o modifican el comportamiento de clases y sus miembros en tiempo de ejecución. Revisamos la diferencia entre los decoradores experimentales (`experimentalDecorators`) y el nuevo estándar ECMAScript nativo.
* **Clases y Métodos (15.2):** Analizamos cómo interceptar el ciclo de vida de una clase para extender sus propiedades y cómo alterar el descriptor de propiedades (`PropertyDescriptor`) de un método para construir interceptores de registros (*loggers*) o controladores de errores transversales, respetando el orden de composición (de abajo hacia arriba).
* **Propiedades y Parámetros (15.3):** Estudiamos el comportamiento sutil de estos decoradores y cómo, a pesar de sus restricciones para modificar valores directamente, actúan como recolectores esenciales de metadatos que interactúan en perfecta sinergia con decoradores de mayor jerarquía.
* **Patrones Aplicados (15.4):** Pusimos en práctica todo el ecosistema de decoradores para resolver problemas de arquitectura complejos, transformando objetos comunes en estructuras estructuradas bajo los patrones *Singleton* e *Inyección de Dependencias* mediante un contenedor de Inversión de Control de diseño propio.

Con este conocimiento, has dominado una de las características más avanzadas de TypeScript, permitiéndote comprender no solo cómo funcionan por dentro las herramientas y frameworks más robustos de la industria (como Angular o NestJS), sino también cómo diseñar tus propias librerías y utilidades altamente escalables.
