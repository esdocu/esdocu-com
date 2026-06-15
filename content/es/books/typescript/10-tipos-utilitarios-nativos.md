En TypeScript, la reusabilidad del código no se limita a las funciones y componentes; también se extiende al modelado de datos. Conforme tus aplicaciones crecen, duplicar interfaces para adaptarlas a sutiles variaciones —como hacer un campo opcional para una actualización o eliminar un dato sensible antes de enviarlo al cliente— se convierte en una pesadilla de mantenimiento.

Este capítulo explora los tipos utilitarios globales del lenguaje. Aprenderás a transformar la obligatoriedad, mutabilidad y estructura de tus objetos con herramientas como `Partial`, `Required`, `Readonly`, `Record`, `Pick` y `Omit`, así como a manipular uniones mediante `Exclude` y `Extract`.

## 10.1 Uso de Partial y Required

Al desarrollar aplicaciones en TypeScript, es frecuente encontrarse en situaciones donde un tipo base es demasiado rígido para ciertos escenarios. Por ejemplo, al actualizar los datos de un usuario en una base de datos, el cliente web podría enviar solo una o dos propiedades modificadas en lugar del objeto completo. En lugar de crear un tipo duplicado con propiedades opcionales manualmente, TypeScript ofrece **Tipos Utilitarios (Utility Types)** globales. Los dos primeros que estudiaremos son `Partial<T>` y `Required<T>`.

Ambos utilitarios actúan como transformadores de tipos mapeados sobre un tipo existente $T$, alterando la obligatoriedad de sus propiedades.

### El Tipo Utilitario `Partial<T>`

El tipo utilitario `Partial<T>` toma un tipo existente $T$ y transforma todas sus propiedades en opcionales. Esto significa que el nuevo tipo resultante aceptará cualquier subconjunto de propiedades del tipo original, incluyendo un objeto vacío `{}`.

#### Anatomía Conceptual

Si visualizamos la transformación de un tipo que cuenta con tres propiedades obligatorias, `Partial<T>` añade el modificador `?` de forma automática a cada una de ellas:

```text
[ Tipo Original: Usuario ]          [ Aplicando Partial<Usuario> ]
┌────────────────────────┐          ┌───────────────────────────┐
│  id: number            │   ───►   │  id?: number              │
│  nombre: string        │          │  nombre?: string          │
│  correo: string        │          │  correo?: string          │
└────────────────────────┘          └───────────────────────────┘

```

#### Caso de Uso Común: Actualizaciones Parciales (Patrón HTTP PATCH)

Imagina un sistema de gestión de usuarios donde la creación requiere todos los campos, pero la actualización de un perfil permite modificar solo los campos que el usuario decida cambiar.

```typescript
interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  edad: number;
}

// Función encargada de actualizar el usuario en la base de datos
function actualizarUsuario(id: number, cambios: Partial<Usuario>): void {
  console.log(`Buscando usuario con ID: ${id}...`);
  
  // Aquí 'cambios' puede tener una, varias o ninguna de las propiedades de Usuario
  if (cambios.nombre) {
    console.log(`Cambiando nombre a: ${cambios.nombre}`);
  }
  if (cambios.correo) {
    console.log(`Cambiando correo a: ${cambios.correo}`);
  }
}

// Ejemplo de llamadas válidas:
actualizarUsuario(1, { nombre: "Carlos" }); // Solo cambia el nombre
actualizarUsuario(2, { correo: "ana@email.com", edad: 28 }); // Cambia dos propiedades
actualizarUsuario(3, {}); // Válido, aunque no altera nada

// Ejemplo de llamada INVÁLIDA:
// actualizarUsuario(4, { telefono: "+123456" }); 
// Error: El tipo '{ telefono: string; }' no tiene propiedades en común con el tipo 'Partial<Usuario>'.

```

### El Tipo Utilitario `Required<T>`

El tipo utilitario `Required<T>` realiza exactamente la operación opuesta a `Partial<T>`. Toma un tipo existente $T$ y remueve el modificador opcional `?` de todas sus propiedades. Si una propiedad era opcional, pasa a ser estrictamente obligatoria. Si ya era obligatoria, permanece intacta.

#### Anatomía Conceptual

```text
[ Tipo Original: Configuracion ]     [ Aplicando Required<Configuracion> ]
┌──────────────────────────────┐     ┌───────────────────────────────────┐
│  url: string                 │     │  url: string                      │
│  puerto?: number             │ ──► │  puerto: number   (¡Obligatorio!) │
│  timeout?: number            │     │  timeout: number  (¡Obligatorio!) │
└──────────────────────────────┘     └───────────────────────────────────┘

```

#### Caso de Uso Común: Valores por Defecto e Inicialización

Es una buena práctica de diseño permitir que los desarrolladores pasen objetos de configuración con propiedades opcionales por comodidad. Sin embargo, internamente, tu aplicación necesita garantizar que esas opciones existan (usando valores por defecto) para evitar comprobaciones de `undefined` a lo largo del código.

```typescript
interface ConfiguracionApp {
  entorno: string;
  puerto?: number;
  timeout?: number;
}

// Tipo interno donde todo debe estar definido tras mezclar con los valores por defecto
type ConfiguracionInterna = Required<ConfiguracionApp>;

const valoresPorDefecto: ConfiguracionInterna = {
  entorno: "development",
  puerto: 3000,
  timeout: 5000
};

function iniciarServidor(opciones: ConfiguracionApp) {
  // Combinamos los valores por defecto con las opciones provistas por el usuario
  const configFinal: ConfiguracionInterna = {
    ...valoresPorDefecto,
    ...opciones
  };

  // Gracias a Required<T>, TypeScript sabe con certeza que configFinal.puerto existe
  // y es un 'number', no 'number | undefined'.
  console.log(`Servidor iniciado en puerto: ${configFinal.puerto}`);
  console.log(`Tiempo de espera configurado en: ${configFinal.timeout}ms`);
}

// El usuario puede omitir campos opcionales al invocar la función
iniciarServidor({ entorno: "production" }); 

```

### Tabla Comparativa de Comportamiento

Para asimilar el impacto de estos utilitarios en el compilador, observemos cómo se evalúa una propiedad específica bajo cada transformación:

| Estado Original de la Propiedad | Efecto de `Partial<T>` | Efecto de `Required<T>` |
| --- | --- | --- |
| `nombre: string` (Obligatoria) | `nombre?: string \| undefined` | `nombre: string` (Sin cambios) |
| `edad?: number` (Opcional) | `edad?: number \| undefined` | `edad: number` (Se vuelve obligatoria) |

### Combinación Práctica

Es perfectamente válido encadenar o cruzar estos utilitarios con otras herramientas del lenguaje. Imagina que tienes una clase encargada de construir un estado complejo; puedes usar `Partial` para el paso a paso del estado de inicialización, pero retornar un tipo `Required` una vez que el objeto esté completamente construido y listo para su consumo seguro.

## 10.2 Uso de Readonly y Record

Continuando con el estudio de los tipos utilitarios globales, TypeScript provee herramientas para controlar la mutabilidad de las estructuras de datos y para simplificar la creación de diccionarios o mapas de objetos. En esta sección nos enfocaremos en `Readonly<T>`, que restringe la modificación de propiedades, y en `Record<K, T>`, diseñado para mapear propiedades de un tipo a otro.

### El Tipo Utilitario `Readonly<T>`

El tipo utilitario `Readonly<T>` toma un tipo existente $T$ y transforma todas sus propiedades para que sean de **solo lectura**. Esto significa que, una vez que se inicializa un objeto con este tipo, el compilador de TypeScript arrojará un error si se intenta reasignar el valor de cualquiera de sus atributos.

#### Anatomía Conceptual

Al aplicar `Readonly<T>`, TypeScript añade de forma implícita el modificador `readonly` al inicio de cada propiedad del tipo original:

```text
[ Tipo Original: Articulo ]           [ Aplicando Readonly<Articulo> ]
┌─────────────────────────┐           ┌──────────────────────────────┐
│  id: number             │    ───►   │  readonly id: number         │
│  titulo: string         │           │  readonly titulo: string     │
└─────────────────────────┘           └──────────────────────────────┘

```

#### Caso de Uso Común: Inmutabilidad en Estados o Configuraciones

En arquitecturas de software modernas (como Redux en React o arquitecturas basadas en programación funcional), garantizar la inmutabilidad del estado es crucial para evitar efectos secundarios inesperados.

```typescript
interface ConfiguracionServidor {
  host: string;
  puerto: number;
}

// Creamos un objeto de configuración inmutable
const configConstante: Readonly<ConfiguracionServidor> = {
  host: "localhost",
  puerto: 8080
};

// Intento de modificación:
// configConstante.puerto = 9000; 
// Error: No se puede asignar a 'puerto' porque es una propiedad de solo lectura.

```

> ⚠️ **Nota importante sobre la profundidad (Shallow Readonly):**
> `Readonly<T>` solo afecta al primer nivel de propiedades del objeto. Si el objeto contiene objetos anidados, las propiedades de esos objetos internos siguen siendo mutables a menos que se aplique un proceso recursivo.

### El Tipo Utilitario `Record<K, T>`

El tipo utilitario `Record<K, T>` se utiliza para construir un tipo de objeto cuyas claves de propiedad son de tipo $K$ y cuyos valores de propiedad son de tipo $T$. Es la herramienta ideal para modelar diccionarios, mapas de búsqueda o índices numéricos y de cadena estructurados.

La sintaxis recibe dos argumentos genéricos:

1. **$K$ (Keys):** Representa los tipos de las claves permitidas. Generalmente es una unión de literales de cadena (`string`), de números (`number`) o símbolos (`symbol`).
2. **$T$ (Type):** Representa el tipo de dato que almacenará cada una de esas claves.

#### Anatomía Conceptual

Si definimos un conjunto de claves fijas (por ejemplo, tres países) y queremos asociar a cada uno un objeto con datos demográficos, `Record<K, T>` mapea individualmente cada clave al tipo destino:

```text
Claves (K): "ES" | "MX" | "AR"
Tipo (T):   DatosPais { poblacion: number; }

[ Record<"ES" | "MX" | "AR", DatosPais> ]
┌────────────────────────────────────────┐
│  ES: { poblacion: number; }            │
│  MX: { poblacion: number; }            │
│  AR: { poblacion: number; }            │
└────────────────────────────────────────┘

```

#### Caso de Uso Común: Diccionarios y Mapas Estrictos

Imagina que estás desarrollando un videojuego y necesitas almacenar los perfiles de los diferentes roles de personajes disponibles. Quieres asegurarte de cubrir todos los roles sin omitir ninguno y que cada uno tenga exactamente la misma estructura.

```typescript
type RolPersonaje = "Mago" | "Guerrero" | "Arquero";

interface Estadisticas {
  vida: number;
  fuerza: number;
  magia: number;
}

// Usamos Record para mapear cada rol a sus estadísticas correspondientes
const bibliotecaRoles: Record<RolPersonaje, Estadisticas> = {
  Mago: { vida: 80, fuerza: 10, magia: 95 },
  Guerrero: { vida: 150, fuerza: 85, magia: 0 },
  Arquero: { vida: 110, fuerza: 60, magia: 20 }
};

// Acceso seguro y tipado:
console.log(bibliotecaRoles.Mago.magia); // Salida: 95

// Ejemplo de error por omisión:
// const rolesIncompletos: Record<RolPersonaje, Estadisticas> = { Mago: { ... } };
// Error: Falta la propiedad 'Guerrero' y 'Arquero' en el tipo...

```

### Flexibilidad con Índices Dinámicos

Si no conoces de antemano los nombres exactos de las claves, pero sabes que serán cadenas de texto generales, puedes utilizar `string` como el primer parámetro genérico:

```typescript
interface Producto {
  nombre: string;
  precio: number;
}

// Un carrito de compras donde la clave es el ID del producto (string) 
// y el valor es la entidad Producto.
const carrito: Record<string, Producto> = {};

carrito["PROD-1024"] = { nombre: "Teclado Mecánico", precio: 85 };
carrito["PROD-5512"] = { nombre: "Ratón Ergonómico", precio: 45 };

```

### Combinación de Ambos Utilitarios

Es común ver a `Readonly` y `Record` trabajar en conjunto para declarar diccionarios globales de configuración que no deben ser alterados bajo ninguna circunstancia durante la ejecución del programa.

```typescript
type RutasCodigosRendimiento = 200 | 404 | 500;

// Un diccionario que mapea códigos HTTP a sus mensajes, totalmente inmutable
const MENSAJES_API: Readonly<Record<RutasCodigosRendimiento, string>> = {
  200: "Operación exitosa",
  404: "Recurso no encontrado",
  500: "Error interno del servidor"
};

// MENSAJES_API[200] = "Ok"; // Error: Propiedad de solo lectura.
```

## 10.3 Extracción con Pick y Omit

En las secciones anteriores aprendimos a modificar la obligatoriedad y la mutabilidad de todas las propiedades de un tipo. Sin embargo, existen escenarios donde no queremos transformar las propiedades existentes, sino **filtrarlas**.

Cuando necesitamos crear un nuevo tipo seleccionando únicamente un subconjunto de propiedades de un tipo base, o bien descartando unas pocas y conservando el resto, TypeScript nos provee de dos tipos utilitarios fundamentales: `Pick<T, K>` y `Omit<T, K>`.

### El Tipo Utilitario `Pick<T, K>`

El tipo utilitario `Pick<T, K>` permite construir un tipo **seleccionando explícitamente** un conjunto de propiedades de un tipo base $T$.

La sintaxis recibe dos argumentos genéricos:

1. **$T$ (Type):** El tipo origen desde el cual vamos a extraer la información.
2. **$K$ (Keys):** Una cadena literal o una unión de cadenas literales que representan las claves exactas que deseamos conservar. Estas claves deben existir obligatoriamente en el tipo $T$.

#### Anatomía Conceptual

Si tenemos una interfaz con cinco propiedades y solo nos interesan dos de ellas para un componente o función específica, `Pick` actúa como un extractor selectivo:

```text
[ Tipo Original: Empleado ]           [ Aplicando Pick<Empleado, "id" | "nombre"> ]
┌─────────────────────────┐           ┌───────────────────────────────────────────┐
│  id: number             │           │  id: number                               │
│  nombre: string         │   ───►    │  nombre: string                           │
│  salario: number        │           └───────────────────────────────────────────┘
│  fechaIngreso: Date     │
│  departamento: string   │
└─────────────────────────┘

```

#### Caso de Uso Común: Vistas Simplificadas (Data Transfer Objects - DTO)

Al listar elementos en una tabla de la interfaz de usuario, rara vez se requiere renderizar toda la información pesada de un modelo. Es mejor práctica tipar la vista únicamente con los campos visibles.

```typescript
interface ProductoDetallado {
  id: string;
  sku: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  dimensiones: string;
  peso: number;
}

// Creamos una versión ligera que solo contenga lo necesario para una tarjeta de catálogo
type TarjetaProducto = Pick<ProductoDetallado, "id" | "nombre" | "precio">;

const productoCatalogo: TarjetaProducto = {
  id: "prod-001",
  nombre: "Auriculares Inalámbricos",
  precio: 59.99
};

// Ejemplo de error por intentar añadir una propiedad no seleccionada:
// productoCatalogo.stock = 20; 
// Error: La propiedad 'stock' no existe en el tipo 'TarjetaProducto'.

```

### El Tipo Utilitario `Omit<T, K>`

El tipo utilitario `Omit<T, K>` realiza la acción inversa a `Pick`. En lugar de declarar qué propiedades queremos conservar, declaramos **qué propiedades queremos eliminar** del tipo base $T$. El tipo resultante contendrá todas las propiedades originales de $T$ excepto aquellas especificadas en $K$.

La sintaxis recibe los mismos argumentos genéricos:

1. **$T$ (Type):** El tipo origen.
2. **$K$ (Keys):** Una cadena literal o unión de literales con las claves que se van a excluir. A diferencia de `Pick`, TypeScript permite (dependiendo de la configuración) pasar claves que no existan en $T$, aunque lo correcto y habitual es usar claves válidas.

#### Anatomía Conceptual

```text
[ Tipo Original: UsuarioBase ]         [ Aplicando Omit<UsuarioBase, "password"> ]
┌────────────────────────────┐         ┌─────────────────────────────────────────┐
│  id: string                │         │  id: string                             │
│  username: string          │   ───►  │  username: string                       │
│  email: string             │         │  email: string                          │
│  password: string          │         └─────────────────────────────────────────┘
└────────────────────────────┘

```

#### Caso de Uso Común: Sanitización de Datos Sensibles

Es un grave error de seguridad propagar contraseñas o datos sensibles a través de las capas de la aplicación (como enviarlos de vuelta en una respuesta HTTP API). Podemos usar `Omit` para garantizar que la información sensible sea eliminada del tipo.

```typescript
interface CuentaUsuario {
  id: string;
  correo: string;
  contrasenaHash: string;
  fechaCreacion: Date;
}

// El perfil público que es seguro exponer a otros usuarios o clientes web
type PerfilPublico = Omit<CuentaUsuario, "contrasenaHash">;

function obtenerPerfil(id: string): PerfilPublico {
  // Simulamos la consulta a la base de datos
  const usuarioDeBD: CuentaUsuario = {
    id: id,
    correo: "usuario@ejemplo.com",
    contrasenaHash: "$2b$10$X7r...",
    fechaCreacion: new Date()
  };

  // Extraemos la contraseña antes de retornar
  const { contrasenaHash, ...datosPublicos } = usuarioDeBD;
  
  return datosPublicos; // Cumple perfectamente con el tipo PerfilPublico
}

```

### Criterio de Elección: ¿Cuándo usar Pick y cuándo Omit?

La elección entre `Pick` y `Omit` no es solo una cuestión de preferencia; afecta directamente a la mantenibilidad del código a largo plazo:

* **Usa `Pick`** si el tipo original tiene muchas propiedades y solo necesitas unas pocas (ej. de 20 propiedades extraes 2). También es más seguro si la interfaz original crece en el futuro, ya que las nuevas propiedades añadidas a la interfaz base no se filtrarán automáticamente a tu tipo derivado.
* **Usa `Omit`** si el tipo original tiene muchas propiedades y solo deseas deshacerte de un par de ellas (ej. de 15 propiedades eliminas 1 campo sensible). Si se añaden nuevas propiedades generales a la interfaz base en actualizaciones posteriores, estas se incluirán automáticamente en tu tipo omitido.

## 10.4 Exclusión con Exclude y Extract

A lo largo de este capítulo hemos trabajado transformando las propiedades de objetos completos (`Partial`, `Required`, `Readonly`), mapeando diccionarios (`Record`), o filtrando las claves de estructuras complejas (`Pick`, `Omit`).

En esta última sección, cambiaremos el enfoque para trabajar directamente sobre los **tipos de unión** (uniones de literales o de tipos primitivos). Para manipular, filtrar y segregar elementos dentro de una unión, TypeScript nos proporciona dos herramientas de precisión matemática basadas en conjuntos: `Exclude<T, U>` y `Extract<T, U>`.

### El Tipo Utilitario `Exclude<T, U>`

El tipo utilitario `Exclude<T, U>` remueve de un tipo de unión $T$ todos los miembros que sean asignables a un segundo tipo de unión $U$. En términos de la teoría de conjuntos, representa la **diferencia de conjuntos** ($T \setminus U$).

La sintaxis recibe dos argumentos genéricos:

1. **$T$ (Type):** La unión de tipos original que contiene todos los elementos.
2. **$U$ (Union):** Los elementos específicos que deseas remover de la unión original.

#### Anatomía Conceptual

Si tenemos una unión con cuatro tipos de datos y queremos descartar dos de ellos, `Exclude` evalúa cada miembro y genera una unión limpia con los restantes:

```text
Unión Original (T):  "A" | "B" | "C" | "D"
Excluir (U):          "B" | "D"

[ Exclude<T, U> ] ──► "A" | "C"

```

#### Caso de Uso Común: Filtrado de Eventos o Estados de un Sistema

Imagina una aplicación que procesa transacciones financieras. El estado de una transacción pasa por diferentes etapas, pero tu lógica de validación interna solo debe operar con los estados que implican que el proceso ya ha concluido.

```typescript
type EstadoTransaccion = "Pendiente" | "Aprobada" | "Rechazada" | "Cancelada" | "Expirada";

// Queremos un tipo que represente únicamente los estados de finalización definitiva
type EstadosFinales = Exclude<EstadoTransaccion, "Pendiente">;

// El tipo resultante equivale a: "Aprobada" | "Rechazada" | "Cancelada" | "Expirada"
let estadoActual: EstadosFinales;
estadoActual = "Aprobada";   // Válido
estadoActual = "Rechazada";  // Válido

// Ejemplo de error por intentar usar el tipo excluido:
// estadoActual = "Pendiente"; 
// Error: El tipo '"Pendiente"' no es asignable al tipo 'EstadosFinales'.

```

### El Tipo Utilitario `Extract<T, U>`

El tipo utilitario `Extract<T, U>` realiza la operación opuesta a `Exclude`. En lugar de descartar los elementos coincidentes, **extrae y conserva** únicamente los miembros de la unión $T$ que son asignables al tipo $U$. Siguiendo la analogía matemática, representa la **intersección de conjuntos** ($T \cap U$).

La sintaxis comparte los mismos argumentos:

1. **$T$ (Type):** La unión de tipos original.
2. **$U$ (Union):** El molde o conjunto de elementos que deseas interceptar y rescatar.

#### Anatomía Conceptual

```text
Unión Original (T):  "A" | "B" | "C" | "D"
Extraer (U):         "B" | "D" | "E"

[ Extract<T, U> ] ──► "B" | "D"

```

*(Nota: El elemento "E" se ignora porque no existía originalmente en el conjunto $T$).*

#### Caso de Uso Común: Intersección de Capacidades o Permisos

Supongamos que manejas dos listados de acciones permitidas en diferentes módulos de tu plataforma y necesitas identificar cuáles son las acciones comunes que un usuario puede realizar en ambos entornos para pintar un panel unificado.

```typescript
type AccionesPanelControl = "crear" | "editar" | "eliminar" | "auditar";
type AccionesAPI = "leer" | "crear" | "editar" | "conectar";

// Extraemos únicamente las acciones que se intersectan en ambos listados
type AccionesComunes = Extract<AccionesPanelControl, AccionesAPI>;

// El tipo resultante equivale a: "crear" | "editar"
const accionPermitida: AccionesComunes = "crear"; 

// Ejemplo de error:
// const accionInvalida: AccionesComunes = "eliminar";
// Error: El tipo '"eliminar"' no es asignable al tipo '"crear" | "editar"'.

```

### Diferencia Fundamental: Pick/Omit vs Exclude/Extract

Es sumamente común confundir estas herramientas debido a que sus propósitos suenan similares (quitar o dejar elementos). Sin embargo, operan en dimensiones completamente distintas del sistema de tipos:

| Tipo Utilitario | Objetivo de Operación | Trabaja sobre... |
| --- | --- | --- |
| **`Pick` / `Omit`** | Propiedades de un Objeto | Claves internas (`interfaces`, `type` de objetos) |
| **`Exclude` / `Extract`** | Elementos de una Unión | Tipos de uniones (`string |

```typescript
interface Tarea {
  id: number;
  titulo: string;
  prioridad: "alta" | "baja";
}

// CORRECTO: Omit elimina una propiedad del objeto Tarea
type TareaSinId = Omit<Tarea, "id">; 

// INCORRECTO: Exclude no sabe cómo operar directamente en las propiedades de un objeto
// type ErrorComun = Exclude<Tarea, "id">; // No producirá el resultado esperado en el objeto

```

## Resumen del capítulo 10

En este capítulo hemos explorado los **Tipos Utilitarios Nativos**, herramientas globales integradas en TypeScript indispensables para la transformación y manipulación dinámica de tipos sin necesidad de duplicar código de forma manual.

* **`Partial<T>` y `Required<T>`:** Modifican la obligatoriedad de todas las propiedades de un objeto. `Partial` las vuelve opcionales (ideal para actualizaciones parciales), mientras que `Required` elimina la opcionalidad exigiendo cada campo (ideal para la resolución de configuraciones por defecto).
* **`Readonly<T>` y `Record<K, T>`:** `Readonly` protege las estructuras contra mutaciones bloqueando la reasignación en el primer nivel del objeto. `Record` simplifica notablemente la creación de mapas, diccionarios o índices estrictos asociando un conjunto de claves a un tipo de valor homogéneo.
* **`Pick<T, K>` y `Omit<T, K>`:** Actúan como filtros sobre las propiedades de interfaces u objetos complejos. `Pick` extrae exclusivamente las claves especificadas, mientras que `Omit` descarta los campos indicados y conserva los demás, ayudando a crear DTOs limpios y sanitizados.
* **`Exclude<T, U>` y `Extract<T, U>`:** Operan sobre tipos de unión utilizando lógica de conjuntos. `Exclude` remueve elementos de una unión basándose en un criterio de exclusión, mientras que `Extract` intersecta las uniones conservando únicamente las coincidencias compartidas.
