La Programación Orientada a Objetos (POO) cobra una nueva dimensión en TypeScript. Mientras que JavaScript moderno permite agrupar datos y comportamientos en clases, TypeScript eleva este paradigma al introducir un sistema de tipado estricto y herramientas avanzadas de arquitectura de software.

A lo largo de este capítulo, aprenderás a estructurar tus programas utilizando planos robustos y reutilizables. Descubrirás cómo encapsular la información mediante modificadores de acceso, cómo garantizar la inmutabilidad de los datos, el modo de extender lógicas complejas a través de la herencia y cómo definir contratos inquebrantables implementando interfaces y abstracciones.

## 7.1 Creación de clases y constructores

En JavaScript moderno (a partir de ES6), las clases proporcionan una sintaxis mucho más limpia y estructurada para implementar la Programación Orientada a Objetos (POO) basada en prototipos. TypeScript adopta por completo esta sintaxis y la eleva a un nuevo nivel al introducir un sistema de tipado estricto. Esto nos permite definir de forma explícita qué datos componen a un objeto y garantizar que las interacciones con sus métodos sean completamente seguras en tiempo de compilación.

Una clase actúa como un plano o plantilla para crear objetos. Define la estructura de los datos (mediante propiedades) y el comportamiento (mediante métodos) que tendrán las instancias creadas a partir de ella.

### Anatomía de una clase en TypeScript

A diferencia de JavaScript tradicional, donde las propiedades suelen declararse directamente dentro del constructor, en TypeScript es obligatorio **anunciar o declarar las propiedades de la clase** y sus tipos antes de poder utilizarlas.

El siguiente diagrama de texto plano ilustra la estructura básica de una clase con sus componentes principales:

```text
+-------------------------------------------------------------+
| Class: Videojuego                                           |
+-------------------------------------------------------------+
| [Propiedades / Campos]                                      |
|  - titulo: string                                           |
|  - precio: number                                           |
+-------------------------------------------------------------+
| [Constructor]                                               |
|  + constructor(titulo: string, precio: number)              |
+-------------------------------------------------------------+
| [Métodos]                                                   |
|  + obtenerDescuento(porcentaje: number): number             |
+-------------------------------------------------------------+

```

Veamos cómo se traduce esta estructura a código real de TypeScript:

```typescript
class Videojuego {
    // 1. Declaración explícita de propiedades
    titulo: string;
    precio: number;

    // 2. El método constructor para inicializar el objeto
    constructor(titulo: string, precio: number) {
        this.titulo = titulo;
        this.precio = precio;
    }

    // 3. Definición de métodos con tipado estricto
    obtenerDescuento(porcentaje: number): number {
        const descuento = this.precio * (porcentaje / 100);
        return this.precio - descuento;
    }
}

// Creación de una instancia de la clase
const juegoFavorito = new Videojuego("The Legend of Zelda", 59.99);

console.log(juegoFavorito.titulo); // Salida: The Legend of Zelda
console.log(juegoFavorito.obtenerDescuento(10)); // Salida: 53.991

```

### El rol de las propiedades y la inicialización estricta

Cuando declaras una propiedad en una clase, TypeScript aplicará las reglas de validación estricta (siempre que la opción `strictPropertyInitialization` esté activa en tu archivo `tsconfig.json`). Esto significa que toda propiedad declarada debe ser inicializada obligatoriamente de alguna de las siguientes formas:

1. **En la misma línea de la declaración:** Proporcionando un valor por defecto.
2. **Dentro del constructor:** Asignándole un valor recibido mediante los parámetros.

Si una propiedad no se inicializa en ninguno de estos puntos, el compilador arrojará un error de tipado:

```typescript
class Usuario {
    nombre: string; // Error: La propiedad 'nombre' no tiene inicializador y no está asignada en el constructor.
    activo: boolean = true; // Correcto: Inicializada con un valor por defecto

    constructor() {
        // Al no asignar 'this.nombre' aquí, el código no compilará
    }
}

```

Si por razones de arquitectura sabes que una propiedad se inicializará de forma externa (por ejemplo, a través de una librería de inyección de dependencias o un método de inicialización diferida), puedes usar el **operador de aserción de asignación definitiva (`!`)**. Esto le indica a TypeScript que confíe en que la variable tendrá un valor en tiempo de ejecución:

```typescript
class Perfil {
    // Usamos '!' para evitar el error de inicialización
    biografia!: string; 
}

```

### El Constructor y la inicialización de instancias

El método `constructor` es una función especial que se ejecuta automáticamente en el momento exacto en que creamos una nueva instancia de la clase utilizando la palabra clave `new`. Su objetivo primordial es preparar el estado inicial del objeto.

Al igual que cualquier otra función en TypeScript (como viste en el Capítulo 4), los parámetros del constructor admiten tipado completo, valores por defecto y parámetros opcionales.

```typescript
class Factura {
    id: string;
    monto: number;
    pagada: boolean;

    // El parámetro 'pagada' tiene un valor por defecto (false)
    constructor(id: string, monto: number, pagada: boolean = false) {
        this.id = id;
        this.monto = monto;
        this.pagada = pagada;
    }
}

const factura1 = new Factura("FAC-001", 1500); // 'pagada' toma el valor false automáticamente
const factura2 = new Factura("FAC-002", 450, true); // Reemplaza el valor por defecto

```

### Métodos en las clases

Los métodos definen las acciones que un objeto puede realizar. En TypeScript, los métodos de una clase se declaran omitiendo la palabra clave `function`. La gran ventaja frente a JavaScript es que puedes aplicar tipado tanto a los parámetros del método como a su valor de retorno, asegurando que el flujo de datos dentro de tu lógica orientada a objetos sea predecible.

Dentro de cualquier método o del propio constructor, se utiliza la palabra clave reservada `this`. `this` hace referencia directa a la instancia específica del objeto que ha invocado el método, permitiendo acceder y modificar sus propiedades internas.

```typescript
class CuentaBancaria {
    titular: string;
    balance: number;

    constructor(titular: string, balanceInicial: number) {
        this.titular = titular;
        this.balance = balanceInicial;
    }

    // Método con parámetro tipado que modifica el estado interno
    depositar(cantidad: number): void {
        if (cantidad > 0) {
            this.balance += cantidad;
        }
    }

    // Método con tipo de retorno explícito
    consultarBalance(): string {
        return `El cliente ${this.titular} tiene un saldo de $${this.balance}`;
    }
}

const miCuenta = new CuentaBancaria("Sofía", 1000);
miCuenta.depositar(500);
console.log(miCuenta.consultarBalance()); // Salida: El cliente Sofía tiene un saldo de $1500

```

### Inicialización resumida en propiedades (Property Showdown)

Aunque la sintaxis tradicional de declarar las propiedades al inicio de la clase y luego asignarlas en el constructor es muy clara, puede volverse repetitiva y generar mucho código redundante (boilerplate). TypeScript ofrece una alternativa sumamente potente llamada **parámetros de propiedades** o *Parameter Properties*, la cual estudiaremos a fondo en la sección **7.2** mediante el uso de modificadores de acceso, permitiendo declarar e inicializar campos de la clase en una única línea directamente dentro del constructor.

## 7.2 Modificadores: public, private, protected

En la programación orientada a objetos, la **encapsulación** es un principio fundamental que consiste en ocultar los detalles internos de cómo funciona un objeto y exponer solo lo que es verdaderamente necesario. Esto evita que el código externo altere el estado interno de un objeto de manera inesperada o incorrecta.

TypeScript introduce tres modificadores de acceso principales para controlar la visibilidad de las propiedades y métodos de una clase: `public`, `private` y `protected`.

### El modificador `public` (Público)

Por defecto, si no especificas ningún modificador de acceso antes de una propiedad o un método, TypeScript asumirá que es `public`.

Los miembros marcados como `public` pueden ser accedidos desde cualquier parte de tu aplicación: desde dentro de la propia clase, desde clases que heredan de ella (clases hijas) y desde instancias externas.

```typescript
class Animal {
    public nombre: string; // Explícitamente público
    especie: string;       // Implícitamente público

    constructor(nombre: string, especie: string) {
        this.nombre = nombre;
        this.especie = especie;
    }

    public emitirSonido(): void {
        console.log("El animal hace un sonido.");
    }
}

const miMascota = new Animal("Firulais", "Perro");
console.log(miMascota.nombre); // Correcto: Acceso permitido desde fuera
miMascota.emitirSonido();       // Correcto: Acceso permitido desde fuera

```

> **Buenas prácticas:** Aunque omitir `public` es perfectamente válido, muchos desarrolladores prefieren escribirlo explícitamente para hacer el código más legible y dejar claras sus intenciones de diseño.

### El modificador `private` (Privado)

Cuando marcas una propiedad o un método como `private`, restringes su acceso de forma estricta. Un miembro privado **solo puede ser accedido o modificado dentro de la misma clase** en la que fue definido. Ni las instancias externas ni las clases derivadas (hijas) pueden acceder a él.

```typescript
class CuentaBancaria {
    public titular: string;
    private saldo: number; // Propiedad inaccesible desde el exterior

    constructor(titular: string, saldoInicial: number) {
        this.titular = titular;
        this.saldo = saldoInicial;
    }

    public depositar(cantidad: number): void {
        // Correcto: Se puede acceder a 'private' dentro de la propia clase
        if (cantidad > 0) {
            this.saldo += cantidad;
        }
    }
}

const cuenta = new CuentaBancaria("Carlos", 500);
cuenta.depositar(100); // Correcto

// Error de compilación: La propiedad 'saldo' es privada y solo es accesible dentro de la clase 'CuentaBancaria'.
// cuenta.saldo = 1000000; 

```

#### TypeScript `private` vs JavaScript `#private`

Es importante destacar que el modificador `private` de TypeScript es una comprobación en **tiempo de compilación**. Cuando TypeScript se compila a JavaScript puro, esa restricción desaparece del código resultante.

Si necesitas privacidad dura también en tiempo de ejecución (que el navegador o Node.js bloqueen el acceso de forma nativa), puedes usar la sintaxis de campos privados de JavaScript ECMAScript utilizando el prefijo `#`:

```typescript
class Candado {
    #codigoSecreto: number; // Privacidad nativa de JavaScript

    constructor(codigo: number) {
        this.#codigoSecreto = codigo;
    }
}

```

### El modificador `protected` (Protegido)

El modificador `protected` actúa como un punto medio entre `public` y `private`. Los miembros protegidos **no pueden ser accedidos desde instancias externas**, pero **sí son completamente accesibles desde dentro de la clase que los define y por cualquier clase que herede (hija) de ella**.

Este modificador cobra total sentido cuando empezamos a trabajar con la herencia (la cual se detalla en la sección 7.4).

```typescript
class Empleado {
    public nombre: string;
    protected salario: number; // Accesible aquí y en clases hijas

    constructor(nombre: string, salario: number) {
        this.nombre = nombre;
        this.salario = salario;
    }
}

class Gerente extends Empleado {
    public departamento: string;

    constructor(nombre: string, salario: number, departamento: string) {
        super(nombre, salario);
        this.departamento = departamento;
    }

    public mostrarDetalles(): void {
        // Correcto: Puede acceder a 'salario' porque es protected y Gerente hereda de Empleado
        console.log(`${this.nombre} gana $${this.salario} en ${this.departamento}`);
    }
}

const jefe = new Gerente("Ana", 5000, "Tecnología");
jefe.mostrarDetalles(); // Correcto

// Error de compilación: La propiedad 'salario' está protegida y solo es accesible en la clase 'Empleado' y sus subclases.
// console.log(jefe.salario); 

```

### Resumen de visibilidad

El siguiente cuadro compara de manera visual los límites de acceso de cada modificador:

```text
+------------------------------------+------------+-------------+-----------+
| Ámbito de acceso                   | public     | protected   | private   |
+------------------------------------+------------+-------------+-----------+
| Dentro de la misma clase           |     Sí     |     Sí      |    Sí     |
| Dentro de una clase hija (herencia)|     Sí     |     Sí      |    No     |
| Desde una instancia externa        |     Sí     |     No      |    No     |
+------------------------------------+------------+-------------+-----------+

```

### Parámetros de Propiedades (Parameter Properties)

Como se adelantó al final de la lección anterior, declarar propiedades al inicio de la clase para luego asignarlas manualmente dentro del constructor genera código repetitivo. TypeScript soluciona esto de manera brillante combinando los modificadores de acceso con los parámetros del constructor.

Si antepones un modificador de acceso (`public`, `private` o `protected`) a un parámetro del constructor, TypeScript automáticamente hará tres cosas por ti tras bambalinas:

1. Declarará la propiedad en la clase con ese tipo de dato.
2. Recibirá el argumento cuando hagas el `new`.
3. Asignará el valor al campo interno utilizando `this.propiedad = valor`.

Observemos la diferencia drástica en el volumen de código:

#### Enfoque tradicional (Sin parámetros de propiedades)

```typescript
class Vehiculo {
    public marca: string;
    private modelo: string;

    constructor(marca: string, modelo: string) {
        this.marca = marca;
        this.modelo = modelo;
    }
}

```

#### Enfoque moderno y optimizado de TypeScript

```typescript
class Vehiculo {
    // Al añadir el modificador de acceso en el parámetro, se declara e inicializa automáticamente
    constructor(public marca: string, private modelo: string) {}
}

const miAuto = new Vehiculo("Toyota", "Corolla");
console.log(miAuto.marca); // Correcto: Toyota
// console.log(miAuto.modelo); // Error: Es privado

```

Esta sintaxis limpia y compacta es ampliamente utilizada en el ecosistema de TypeScript (como en el desarrollo con Angular o NestJS) debido a que reduce sustancialmente las líneas de código de mantenimiento sin perder en ningún momento el tipado estricto ni la seguridad de la encapsulación.

## 7.3 Propiedades estáticas y de solo lectura

TypeScript añade un control todavía más fino sobre cómo se comportan las propiedades de nuestras clases mediante dos modificadores de comportamiento muy potentes: `static` y `readonly`. A diferencia de los modificadores de acceso (`public`, `private`, `protected`), que controlan *quién* puede ver los datos, estos modificadores controlan *cómo* y *dónde* existen esos datos, así como si pueden modificarse una vez creados.

### Miembros estáticos con el modificador `static`

Por norma general, cuando defines propiedades o métodos en una clase, estos pertenecen a las **instancias** individuales (los objetos creados con `new`). Sin embargo, en muchas ocasiones necesitas definir variables o funciones que pertenezcan a la **clase en sí misma**, de modo que sean compartidas por igual por todas las instancias o sirvan como utilidades globales.

Para lograr esto utilizamos el modificador `static`.

```text
+-----------------------------------------------------------+
| Clase: Calculadora (Estructura en memoria)                |
+-----------------------------------------------------------+
| [Miembros Estáticos]  --> Accesibles como Calculadora.PI  |
|  + PI: number = 3.14159                                   |
|  + calcularArea(radio: number): number                    |
+-----------------------------------------------------------+
       |
       | (No requiere instancias con 'new')
       v
 Uso: Calculadora.calcularArea(5);

```

#### Propiedades estáticas

Una propiedad estática se almacena una sola vez en memoria, directamente vinculada a la función constructora de la clase, y no se duplica cada vez que instanciamos un objeto.

```typescript
class ConfigServidor {
    // Propiedad estática
    static puerto: number = 8080;
}

// Para acceder no usamos 'new'. Accedemos directamente a través del nombre de la clase
console.log(ConfigServidor.puerto); // Salida: 8080

// Si cambiamos su valor, cambia para todo el sistema
ConfigServidor.puerto = 3000;
console.log(ConfigServidor.puerto); // Salida: 3000

```

#### Métodos estáticos

Los métodos estáticos suelen utilizarse para crear funciones de utilidad que no dependen del estado de ninguna instancia específica.

```typescript
class Matematica {
    public static readonly PI: number = 3.14159265;

    public static sumar(a: number, b: number): number {
        return a + b;
    }
}

// Uso directo de los miembros estáticos
const resultado = Matematica.sumar(10, 5); 
console.log(resultado); // Salida: 15

```

> **Regla de oro de `static`:** Un método estático **no puede** acceder a propiedades no estáticas de la clase utilizando la palabra clave `this`, debido a que el método se ejecuta en el contexto de la clase y no sobre un objeto instanciado.

### Inmutabilidad con el modificador `readonly`

El modificador `readonly` (de solo lectura) permite proteger las propiedades de una clase para evitar que sus valores sean modificados después de haber sido inicializados. Esto es crucial cuando deseas asegurar la inmutabilidad de ciertos identificadores, configuraciones o conexiones críticas.

Una propiedad marcada con `readonly` solo puede recibir un valor en dos lugares específicos:

1. En el momento exacto de su declaración en la parte superior de la clase.
2. Dentro del método `constructor`.

Cualquier intento de reasignar un valor fuera de estos dos puntos provocará un error inmediato en el compilador.

```typescript
class Archivo {
    public readonly ruta: string;
    public readonly extension: string = ".txt"; // Inicialización en la declaración

    constructor(rutaAsignada: string) {
        this.ruta = rutaAsignada; // Inicialización válida en el constructor
    }

    public cambiarRuta(nuevaRuta: string) {
        // Error de compilación: No se puede asignar a 'ruta' porque es una propiedad de solo lectura.
        // this.ruta = nuevaRuta; 
    }
}

const documento = new Archivo("/documentos/reporte.txt");
// documento.ruta = "/imagenes/foto.png"; // Error de compilación externo

```

#### Combinación de modificadores

El poder de TypeScript radica en que puedes encadenar múltiples modificadores sobre una sola propiedad para diseñar arquitecturas de datos extremadamente seguras y expresivas. El orden correcto para declararlos es colocar primero el modificador de acceso, seguido del modificador de contexto (`static`) y, por último, el modificador de mutabilidad (`readonly`).

Veamos un ejemplo avanzado que combina todas estas herramientas en una estructura de configuración global e inmutable:

```typescript
class ApiConfig {
    // Combinación: Acceso público, pertenece a la clase y no se puede modificar
    public static readonly ENDPOINT: string = "https://api.miempresa.com/v1";
    
    // Combinación: Acceso privado, pertenece a la instancia y no se puede modificar
    private readonly tokenAcceso: string;

    constructor(token: string) {
        this.tokenAcceso = token; // Válido únicamente en la creación
    }

    public obtenerUrlSegura(): string {
        // Puede leer el endpoint estático y el token privado de solo lectura
        return `${ApiConfig.ENDPOINT}/usuarios?token=${this.tokenAcceso}`;
    }
}

// Acceso al miembro estático público de solo lectura
console.log(ApiConfig.ENDPOINT); 

// ApiConfig.ENDPOINT = "https://otra-api.com"; // Error de compilación: es readonly

const servicio = new ApiConfig("secret_abc123");
console.log(servicio.obtenerUrlSegura());

```

### `readonly` en Parámetros de Propiedades (Parameter Properties)

Como aprendiste en la sección 7.2, los parámetros del constructor nos permiten ahorrar líneas de código redundantes. Esta característica es totalmente compatible con `readonly`. Puedes declarar e inicializar una propiedad inmutable en una sola línea de la siguiente manera:

```typescript
class Dispositivo {
    // Genera automáticamente una propiedad de solo lectura y la asigna en el constructor
    constructor(public readonly numeroSerie: string) {}
}

const celular = new Dispositivo("SN-987654321");
console.log(celular.numeroSerie); // Correcto: Lectura permitida
// celular.numeroSerie = "SN-0000"; // Error de compilación: es readonly

```

## 7.4 Herencia de clases y abstracción

La programación orientada a objetos brilla especialmente cuando necesitamos modelar relaciones del mundo real donde unas entidades comparten características con otras, pero añaden comportamientos especializados. En TypeScript, implementamos estas relaciones mediante los conceptos de **herencia** (reutilizar y extender código) y **abstracción** (definir contratos estructurales que no pueden instanciarse directamente).

### Herencia con la palabra clave `extends`

La herencia permite crear una nueva clase (llamada clase hija o subclase) basada en una clase existente (llamada clase padre o superclase). La clase hija hereda de forma automática todas las propiedades y métodos públicos o protegidos de la clase padre.

Para heredar de una clase, utilizamos la palabra clave `extends`.

```typescript
// Superclase o Clase Padre
class Empleado {
    constructor(public nombre: string, protected salarioBase: number) {}

    public calcularPago(): number {
        return this.salarioBase;
    }
}

// Subclase o Clase Hija
class Desarrollador extends Empleado {
    // Añadimos una propiedad exclusiva de la clase hija
    constructor(nombre: string, salarioBase: number, public lenguajeFavorito: string) {
        // Obligatorio: Llamar al constructor del padre usando super()
        super(nombre, salarioBase);
    }
}

const programador = new Desarrollador("Lucas", 3000, "TypeScript");
console.log(programador.nombre);             // Salida: Lucas (Heredado de Empleado)
console.log(programador.calcularPago());     // Salida: 3000 (Heredado de Empleado)
console.log(programador.lenguajeFavorito);   // Salida: TypeScript (Propio de Desarrollador)

```

#### Reglas críticas de `super()`

Cuando una clase hija define su propio método `constructor`, **debe invocar a `super()` antes de intentar acceder a cualquier propiedad mediante `this`**. La llamada a `super()` ejecuta el constructor de la clase padre y mapea correctamente los datos en memoria. Si olvidas ponerlo, TypeScript generará un error de compilación inmediato.

### Sobrescritura de Métodos (Method Overriding)

Una clase hija no está obligada a usar los métodos del padre exactamente como fueron escritos. Si el comportamiento de la superclase no se ajusta por completo a las necesidades de la subclase, esta última puede **sobrescribir** (redefinir) el método manteniendo el mismo nombre.

```typescript
class Gerente extends Empleado {
    constructor(nombre: string, salarioBase: number, public bono: number) {
        super(nombre, salarioBase);
    }

    // Sobrescritura del método calcularPago
    public override calcularPago(): number {
        // Podemos usar super.metodo() para reutilizar la lógica del padre
        return super.calcularPago() + this.bono;
    }
}

const gerenteVentas = new Gerente("Marta", 4000, 1500);
console.log(gerenteVentas.calcularPago()); // Salida: 5500 (4000 base + 1500 bono)

```

> **La palabra clave `override`:** Aunque TypeScript permite sobrescribir métodos de forma implícita, el uso del modificador `override` es una excelente práctica (y obligatoria bajo ciertas configuraciones del compilador). Le avisa explícitamente a otros desarrolladores que el método viene de la clase base y evita errores si el método del padre cambia de nombre en el futuro.

### Abstracción con clases y métodos `abstract`

Las clases abstractas actúan estrictamente como moldes o directrices conceptuales para otras clases. **No puedes crear instancias (hacer un `new`) directamente de una clase abstracta**. Su único propósito en el ciclo de vida del software es ser heredadas.

Se definen anteponiendo la palabra clave `abstract` antes de `class`.

```text
                  +--------------------------+
                  |  Abstract Class: Forma   |  <-- No se puede instanciar (new Forma() dará Error)
                  +--------------------------+
                  | + abstract calcularArea()|  <-- Método sin implementar
                  +--------------------------+
                               |
            +------------------+------------------+
            |                                     |
            v                                     v
+-----------------------+             +-----------------------+
|   Subclase: Circulo   |             |  Subclase: Rectangulo | <-- Obligadas a escribir la
+-----------------------+             +-----------------------+     lógica de calcularArea()
| + calcularArea(): num |             | + calcularArea(): num |
+-----------------------+             +-----------------------+

```

#### Métodos abstractos

Dentro de una clase abstracta, puedes definir **métodos abstractos**. Estos métodos no contienen ninguna lógica ni cuerpo (no llevan llaves `{}`), únicamente especifican la firma del método (nombre, parámetros y tipo de retorno).

Cualquier clase no abstracta que herede de ella estará **estrictamente obligada** a implementar la lógica real de esos métodos abstractos.

```typescript
// Definición de la guía conceptual abstracta
abstract class FormaGeometrica {
    constructor(public color: string) {}

    // Método concreto: Heredado directamente por las hijas con su lógica integrada
    public saludar(): void {
        console.log(`Hola, soy una forma de color ${this.color}`);
    }

    // Método abstracto: No tiene cuerpo. Las clases hijas deben definir CÓMO se calcula.
    public abstract calcularArea(): number;
}

// Implementación en una clase hija concreta
class Rectangulo extends FormaGeometrica {
    constructor(color: string, private ancho: number, private alto: number) {
        super(color);
    }

    // Obligatorio implementar el método abstracto del padre
    public override calcularArea(): number {
        return this.ancho * this.alto;
    }
}

// Ejecución del código
// const forma = new FormaGeometrica("Azul"); // Error de compilación: No se puede crear una instancia de una clase abstracta.

const miRectangulo = new Rectangulo("Rojo", 5, 10);
miRectangulo.saludar(); // Salida: Hola, soy una forma de color Rojo
console.log(miRectangulo.calcularArea()); // Salida: 50

```

Las clases abstractas son una de las herramientas de arquitectura de software más robustas de TypeScript, ya que te permiten establecer un control absoluto sobre el diseño de tus librerías y módulos, asegurando que tus compañeros de equipo o tú mismo sigan las mismas reglas de estructura de datos a medida que el sistema escala.

## 7.5 Implementación de interfaces en clases

En el Capítulo 6 aprendiste que las interfaces sirven para definir contratos estructurales que describen detalladamente la forma que debe tener un objeto. Cuando trasladamos este concepto a la Programación Orientada a Objetos, las interfaces se convierten en una herramienta extraordinaria para lograr el **desacoplamiento**. Permiten asegurar que una clase cumpla estrictamente con un conjunto de características (propiedades y métodos) sin obligarla a heredar de una clase padre específica.

Mientras que una clase solo puede heredar de una única superclase (herencia simple), una clase puede implementar **múltiples interfaces** simultáneamente, otorgándole una enorme flexibilidad al diseño de tus aplicaciones.

### La palabra clave `implements`

Para indicarle a TypeScript que una clase debe someterse a la estructura definida por una interfaz, utilizamos la palabra clave `implements`. Al hacer esto, la clase asume el compromiso de dar una definición real a cada propiedad y método listado en la interfaz. Si falta alguno de ellos, el compilador generará un error inmediatamente.

```typescript
interface EnviaNotificaciones {
    enviar(mensaje: string): void;
}

// La clase ServicioEmail se compromete a cumplir el contrato de la interfaz
class ServicioEmail implements EnviaNotificaciones {
    // Implementación obligatoria del método de la interfaz
    public enviar(mensaje: string): void {
        console.log(`Enviando Email con el texto: "${mensaje}"`);
    }
}

class ServicioSMS implements EnviaNotificaciones {
    // Implementación obligatoria del método de la interfaz
    public enviar(mensaje: string): void {
        console.log(`Enviando SMS con el texto: "${mensaje}"`);
    }
}

```

Gracias a este diseño, puedes crear funciones o colecciones de datos basadas en la interfaz, permitiendo intercambiar la clase real en tiempo de ejecución sin alterar el resto de tu código:

```typescript
// Esta función no sabe ni le importa qué clase recibe, siempre que cumpla con el contrato
function notificarAlerta(sistema: EnviaNotificaciones, alerta: string) {
    sistema.enviar(alerta);
}

const correo = new ServicioEmail();
const celular = new ServicioSMS();

notificarAlerta(correo, "Base de datos llena"); // Salida: Enviando Email con el texto: "Base de datos llena"
notificarAlerta(celular, "Base de datos llena"); // Salida: Enviando SMS con el texto: "Base de datos llena"

```

### Implementación de múltiples interfaces

Una de las grandes limitaciones de las clases abstractas es que una clase no puede heredar de varios padres a la vez. Las interfaces resuelven este problema por completo, ya que actúan como piezas de comportamiento modulares que puedes combinar separándolas por comas `,`.

El siguiente diagrama en texto plano ilustra cómo una única clase puede adoptar múltiples contratos estructurales:

```text
    +------------------------+          +------------------------+
    |   Interface: Imprimible|          |  Interface: Archivable |
    +------------------------+          +------------------------+
    |   + imprimir(): void   |          |   + guardar(): void    |
    +------------------------+          +------------------------+
                ^                                   ^
                |                                   |
                +-----------------+-----------------+
                                  |
                      +-----------------------+
                      |   Class: Documento    |
                      +-----------------------+
                      |  + imprimir(): void   |
                      |  + guardar(): void    |
                      +-----------------------+

```

Veamos cómo se escribe este patrón en TypeScript:

```typescript
interface Imprimible {
    imprimir(): void;
}

interface Archivable {
    guardar(archivoNombre: string): void;
}

// Documento está obligado a escribir las reglas de AMBAS interfaces
class Documento implements Imprimible, Archivable {
    constructor(public contenido: string) {}

    public imprimir(): void {
        console.log(`Imprimiendo contenido: ${this.contenido}`);
    }

    public guardar(archivoNombre: string): void {
        console.log(`Guardando el archivo bajo el nombre: ${archivoNombre}.txt`);
    }
}

const miReporte = new Documento("Balance anual de ventas");
miReporte.imprimir();
miReporte.guardar("Reporte_2026");

```

### Interfaces frente a Clases Abstractas

Es común confundir cuándo usar una clase abstracta (Sección 7.4) y cuándo usar una interfaz. La diferencia clave radica en la presencia de **lógica de ejecución**:

* **Usa Clases Abstractas** cuando desees compartir código real y reutilizable (métodos concretos) entre varias clases relacionadas y establecer una jerarquía directa de herencia ("un perro *es un* animal").
* **Usa Interfaces** cuando únicamente quieras definir un plano conceptual o comportamiento sin aportar ninguna línea de lógica interna, uniendo clases que podrían no tener relación alguna entre sí ("un usuario y un botón pueden ser ambos *Hacéclic*").

## Resumen del capítulo

En este **Capítulo 7: Clases y Modificadores de Acceso**, has adquirido los conocimientos fundamentales para dominar la Programación Orientada a Objetos (POO) bajo el estricto control de tipos de TypeScript:

* **Creación y constructores (7.1):** Aprendiste la anatomía de una clase, cómo declarar sus propiedades previamente y cómo inicializarlas de manera segura a través del método `constructor`.
* **Modificadores de acceso (7.2):** Analizaste el nivel de aislamiento de datos usando `public` (acceso total), `private` (exclusivo de la propia clase) y `protected` (permitido para clases hijas). También descubriste cómo compactar código usando *Parameter Properties*.
* **Control estático e inmutabilidad (7.3):** Estudiaste cómo crear variables y funciones globales vinculadas a la clase en sí mediante `static`, y cómo blindar datos contra modificaciones accidentales con `readonly`.
* **Herencia y abstracción (7.4):** Exploraste la extensión de lógica con `extends`, la llamada obligatoria a `super()`, la sobrescritura de métodos con `override`, y el diseño de moldes de arquitectura estrictos con clases y métodos `abstract`.
* **Implementación de interfaces (7.5):** Descubriste cómo obligar a una clase a cumplir un contrato estructural mediante `implements` y la potencia de implementar múltiples interfaces simultáneamente para lograr un código altamente desacoplado y escalable.
