Mantener una aplicación organizada a medida que crece requiere dividir el código en piezas independientes y reutilizables. En este capítulo, aprenderás a dominar el ecosistema de modularización en TypeScript.

Exploraremos a fondo la sintaxis de **Módulos de ECMAScript** para importar y exportar lógica de forma eficiente, y desmitificaremos las **estrategias de resolución** que utiliza el compilador para localizar tus archivos. También analizaremos el uso de **Namespaces** para estructurar scripts globales y el poder de las **importaciones dinámicas** (*Lazy Loading*) para optimizar el rendimiento cargando código bajo demanda.

## 13.1 Exportación e importación de módulos

A medida que una aplicación crece, mantener todo el código en un único archivo se vuelve insostenible. La modularización es la práctica de dividir el software en fragmentos de código independientes, especializados y reutilizables llamados **módulos**. En el ecosistema moderno de desarrollo, TypeScript adopta de forma nativa el estándar de **Módulos de ECMAScript (ES Modules)**, introducido en JavaScript a partir de ES2015 (ES6).

Un módulo en TypeScript es simplemente un archivo que contiene al menos una instrucción `export` o `import`. Cualquier archivo que no posea estas instrucciones es tratado por el compilador como un script global, lo que significa que sus variables, funciones y clases comparten el mismo espacio de nombres global, incrementando el riesgo de colisiones de nombres.

### Flujo conceptual de comunicación entre módulos

La modularidad se basa en un contrato simple: un archivo expone una parte de su lógica interna y otro archivo la consume de manera explícita.

```text
+------------------------------------+          +------------------------------------+
|         Módulo A (Origen)          |          |        Módulo B (Destino)          |
|  [Código interno privado]          |          |                                    |
|                                    |  import  |  Usa los elementos importados      |
|  export elemento1 -----------------+--------->|  como si locales se tratase.       |
|  export elemento2 -----------------+--------->|                                    |
+------------------------------------+          +------------------------------------+

```

### 1. Exportaciones

Para que un componente (función, clase, interfaz, alias de tipo o variable) esté disponible en otros archivos, se debe anteponer la palabra clave `export`. Existen dos estrategias principales para exportar elementos: **exportaciones nombradas** y **exportaciones por defecto**.

#### A. Exportaciones Nombradas (Named Exports)

Permiten exportar múltiples elementos desde un solo archivo. Cada elemento debe ser importado utilizando exactamente el mismo nombre con el que fue exportado.

Existen dos sintaxis válidas para realizar una exportación nombrada:

**1. Anteponiendo `export` directamente en la declaración:**

```typescript
// mathUtils.ts
export const PI = 3.14159;

export function calcularAreaCirculo(radio: number): number {
    return PI * (radio ** 2);
}

export interface Dimensiones {
    ancho: number;
    alto: number;
}

```

**2. Agrupando las exportaciones al final del archivo:**

```typescript
// mathUtils.ts
const PI = 3.14159;

function calcularAreaCirculo(radio: number): number {
    return PI * (radio ** 2);
}

interface Dimensiones {
    ancho: number;
    alto: number;
}

// Exportación agrupada
export { PI, calcularAreaCirculo, Dimensiones };

```

#### B. Exportaciones por Defecto (Default Exports)

Cada módulo puede tener **únicamente una** exportación por defecto. Se utiliza habitualmente cuando el archivo tiene la responsabilidad única de representar una sola entidad (por ejemplo, una clase principal o un componente central).

```typescript
// Logger.ts
export default class Logger {
    log(mensaje: string): void {
        console.log(`[LOG]: ${mensaje}`);
    }
}

```

*Nota: No se puede utilizar `export default` directamente junto con `let`, `const` o `var` de forma directa si no se asignan a una expresión evaluada inmediatamente, pero sí se puede con funciones y clases anónimas o nombradas.*

### 2. Importaciones

Para consumir los elementos expuestos por un módulo, se utiliza la palabra clave `import`, especificando los elementos deseados y la ruta relativa del archivo de origen.

#### A. Importar Elementos Nombrados

Las exportaciones nombradas deben envolverse obligatoriamente entre llaves `{}`.

```typescript
// app.ts
import { calcularAreaCirculo, PI } from "./mathUtils";

console.log(calcularAreaCirculo(10)); // Envía 314.159
console.log(`Valor de PI: ${PI}`);

```

#### B. Renombrar Elementos con la palabra clave `as`

Si necesitas evitar conflictos de nombres con variables locales o con otros módulos, puedes renombrar los elementos importados usando el modificador `as`.

```typescript
// app.ts
import { calcularAreaCirculo as area, PI as NUMERO_PI } from "./mathUtils";

const resultado = area(5);
console.log(NUMERO_PI);

```

#### C. Importar Todo un Módulo como un Objeto (Namespace Import)

Si un módulo exporta un gran volumen de herramientas, puedes importarlas todas juntas bajo un alias único utilizando el comodín `*`. Esta técnica agrupa las exportaciones en un objeto contenedor.

```typescript
// app.ts
import * as Matematicas from "./mathUtils";

// Se accede a los elementos mediante la notación de punto
console.log(Matematicas.PI);
const area = Matematicas.calcularAreaCirculo(12);

```

#### D. Importar una Exportación por Defecto

A diferencia de las nombradas, las exportaciones por defecto se importan **sin llaves** y se les puede asignar cualquier nombre arbitrario durante la importación.

```typescript
// app.ts
import GestorDeLogs from "./Logger"; // Se renombra libremente sin usar 'as'

const miLogger = new GestorDeLogs();
miLogger.log("Módulo cargado correctamente.");

```

#### E. Combinar Importaciones Nombradas y por Defecto

Si un archivo exporta un elemento por defecto y además exporta elementos nombrados, se pueden extraer todos en una única línea de código. La importación por defecto debe declararse siempre en primer lugar, separada por una coma.

```typescript
// app.ts (Asumiendo que un módulo exporta un default y herramientas extras)
import Autenticador, { login, logout } from "./auth";

```

### 3. Re-exportación de Módulos (Agregación)

En arquitecturas complejas de software, es una buena práctica crear archivos centralizados de exportación (comúnmente llamados `index.ts` o *barrels*). Estos archivos agrupan las exportaciones de múltiples submódulos internos para ofrecer una interfaz pública única hacia el exterior, simplificando las rutas de importación de los consumidores.

```text
   Estructura de Directorios:
   src/
   ├── api/
   │   ├── index.ts        <-- Archivo Barrel (Centralizador)
   │   ├── usuarios.ts
   │   └── productos.ts
   └── main.ts             <-- Consume todo desde './api'

```

Ejemplo de implementación de re-exportación:

```typescript
// api/usuarios.ts
export const obtenerUsuarios = () => [/* ... */];

// api/productos.ts
export const obtenerProductos = () => [/* ... */];

```

```typescript
// api/index.ts
// Redirecciona las exportaciones sin consumirlas localmente
export { obtenerUsuarios } from "./usuarios";
export { obtenerProductos } from "./productos";

```

Gracias a esto, el archivo consumidor reduce drásticamente la cantidad de líneas de importación requeridas:

```typescript
// main.ts
import { obtenerUsuarios, obtenerProductos } from "./api"; // Busca automáticamente index.ts

```

Alternativamente, si deseas re-exportar absolutamente todos los elementos de un archivo, puedes utilizar `export *`:

```typescript
// api/index.ts
export * from "./usuarios";
export * from "./productos";

```

### 4. Importación Exclusiva de Tipos (`import type`)

Una de las características más potentes y distintivas de TypeScript es la capacidad de gestionar importaciones que solo existen en tiempo de compilación. Cuando importas clases o funciones, estas generan código JavaScript real tras compilarse. Sin embargo, las interfaces o los alias de tipos (`Type Aliases`) se eliminan por completo en la transpilación (proceso conocido como *Type Erasure*).

Para optimizar el rendimiento de la compilación y evitar que el compilador emita dependencias vacías o código innecesario en los archivos JavaScript resultantes, TypeScript provee la sintaxis `import type` y `export type`.

#### Ventajas del uso de `import type`

1. **Claridad Arquitectural:** Indica explícitamente a otros desarrolladores que el archivo importado solo se utiliza con fines de tipado estático y no de lógica en tiempo de ejecución.
2. **Optimización del Bundler:** Permite a herramientas como Vite, Webpack o esbuild realizar un proceso de *Tree Shaking* mucho más agresivo y limpio.
3. **Prevención de dependencias circulares:** Reduce la probabilidad de errores de ejecución provocados por ciclos de importación de módulos reales.

#### Ejemplo Práctico

```typescript
// tipos.ts
export interface Usuario {
    id: number;
    nombre: string;
    rol: string;
}

export function validarRol(usuario: Usuario): boolean {
    return usuario.rol === "admin";
}

```

Si en otro archivo únicamente necesitamos la interfaz `Usuario` para tipar un parámetro, empleamos `import type`:

```typescript
// servicio.ts
import type { Usuario } from "./tipos"; 

export function procesarPerfil(datos: Usuario) {
    // Al compilarse a JavaScript, la importación de './tipos' desaparecerá por completo
    console.log(`Procesando a: ${datos.nombre}`);
}

```

Si necesitas mezclar elementos de lógica (funciones/clases) con tipos en una misma instrucción, TypeScript permite aplicar el modificador `type` de manera inline dentro de las llaves de una importación convencional:

```typescript
// controlador.ts
import { validarRol, type Usuario } from "./tipos";

const user: Usuario = { id: 1, nombre: "Ana", rol: "admin" };
if (validarRol(user)) {
    console.log("Acceso concedido");
}

```

## 13.2 Resoluciones de módulos en TypeScript

Cuando escribes una instrucción de importación como `import { algo } from "./modulo"` o `import * as fs from "fs"`, el compilador de TypeScript necesita localizar el archivo físico exacto en el disco duro para validar que los tipos y los elementos exportados existan y sean correctos. El proceso mediante el cual el compilador asocia una cadena de texto (el camino o *module specifier*) con un archivo real en el sistema de archivos se denomina **resolución de módulos**.

Comprender este mecanismo es fundamental para resolver errores comunes de compilación como `Cannot find module...` y para estructurar correctamente proyectos complejos.

### 1. Tipos de Importaciones: Relativas vs. No Relativas

TypeScript divide las estrategias de búsqueda en dos categorías principales dependiendo de cómo empiece la cadena de texto de la ruta de importación:

```text
                                 Ruta de Importación
                                          |
                +-------------------------+-------------------------+
                |                                                   |
        Comienza con /, ./ o ../                            Cualquier otra forma
                |                                                   |
       [ Importación Relativa ]                           [ Importación No Relativa ]
                |                                                   |
  Se resuelve respecto al archivo                    Busca en carpetas externas,
   actual. No usa baseUrl ni                          node_modules o mediante
       paths de tsconfig.                                  mapeos de rutas.

```

#### A. Importaciones Relativas

Son aquellas que comienzan expresamente con `/`, `./` o `../`.

* **Ejemplos:** `import { X } from "./utils"`, `import { Y } from "../componentes/boton"`.
* **Comportamiento:** Se resuelven de forma local tomando como punto de partida la ubicación del archivo actual que contiene el `import`. Se utilizan exclusivamente para enlazar el código propio de tu aplicación.

#### B. Importaciones No Relativas

Son aquellas que no comienzan con ninguno de los caracteres anteriores.

* **Ejemplos:** `import * as React from "react"`, `import { Component } from "@angular/core"`, `import { api } from "src/servicios/api"`.
* **Comportamiento:** No dependen de la posición del archivo actual. El compilador las busca dentro de carpetas externas especiales (como `node_modules`), en las librerías estándar de tipos de Node.js, o aplicando configuraciones de alias de rutas personalizadas configuradas en el archivo `tsconfig.json`.

### 2. Estrategias de Resolución: `Classic` vs. `Node`

TypeScript dispone de dos algoritmos principales de resolución de módulos que se configuran mediante la directiva `"moduleResolution"` dentro del objeto `compilerOptions` de tu `tsconfig.json`.

```json
{
  "compilerOptions": {
    "moduleResolution": "node" // Valores válidos: "node", "classic", "node16", "nodenext"
  }
}

```

#### A. Estrategia `Classic`

Era el algoritmo por defecto de TypeScript en sus primeras versiones. Hoy en día se considera obsoleta y **no se recomienda su uso** a menos que sea por motivos estrictos de compatibilidad con proyectos muy antiguos.

* **Para rutas relativas:** Si en `/src/folder/main.ts` se escribe `import { x } from "./util"`, el algoritmo busca secuencialmente en:

1. `/src/folder/util.ts`
2. `/src/folder/util.d.ts` (Archivo de definición de tipos)

* **Para rutas no relativas:** Si se busca un módulo no relativo, el compilador camina recursivamente hacia arriba a través de la jerarquía de directorios buscando el archivo en cada nivel, pero sin entrar en carpetas especializadas de paquetes.

#### B. Estrategia `Node` (Recomendada para entornos Node.js tradicionales y bundlers)

Este algoritmo imita fielmente el comportamiento que utiliza Node.js para buscar archivos en tiempo de ejecución. Es sumamente potente porque inspecciona directorios, extensiones de archivos y el contenido de los archivos `package.json`.

##### ¿Cómo busca una ruta relativa usando la estrategia `Node`?

Si el archivo en `/root/src/app.ts` contiene la instrucción `import { config } from "./mod"`, el compilador intentará localizar el archivo realizando las siguientes comprobaciones en este orden riguroso:

1. **Buscar como un Archivo:**

* `/root/src/mod.ts`
* `/root/src/mod.tsx` (Si está habilitado el soporte para JSX)
* `/root/src/mod.d.ts`

1. **Buscar como un Directorio:** Si no encontró un archivo individual, verifica si existe una carpeta llamada `/root/src/mod/`. Si existe, busca dentro de ella:

* `/root/src/mod/package.json` -> Si este archivo existe y tiene una propiedad `"types"` o `"typings"`, leerá el archivo de tipos indicado allí.
* `/root/src/mod/index.ts`
* `/root/src/mod/index.tsx`
* `/root/src/mod/index.d.ts`

##### ¿Cómo busca una ruta no relativa usando la estrategia `Node`?

Si en `/root/src/app.ts` se invoca `import { algo } from "modulo-externo"`, el compilador sabe que no es local, por lo que saltará directamente a buscar en las carpetas de dependencias (`node_modules`), subiendo de nivel de forma recursiva hasta llegar a la raíz del sistema de archivos:

1. `/root/src/node_modules/modulo-externo.ts` (y sus variantes `.tsx`, `.d.ts`)
2. `/root/src/node_modules/modulo-externo/package.json` (buscando la propiedad `"types"`)
3. `/root/src/node_modules/modulo-externo/index.ts` (y variantes)
4. *Si no lo encuentra en ese nivel, sube un escalón:* `/root/node_modules/modulo-externo.ts`...
5. *Siguiente nivel:* `/node_modules/modulo-externo.ts`...

### 3. Resoluciones Modernas: `Node16` y `NodeNext`

Con la adopción masiva de los módulos de ECMAScript nativos dentro de Node.js, las estrategias de resolución tradicionales se quedaron cortas. TypeScript introdujo los modos `node16` y `nodenext` para soportar las nuevas reglas estrictas del ecosistema.

Bajo estas configuraciones:

* **Soporte para `"type": "module"`:** El compilador respeta la propiedad `"type": "module"` de los archivos `package.json`, la cual determina si los archivos `.js` se interpretan como ES Modules o como CommonJS tradicionales.
* **Extensiones obligatorias en las rutas:** A diferencia del modo `node` tradicional, en proyectos configurados como ES Modules puros en Node.js, **debes incluir explícitamente la extensión del archivo** en tus importaciones relativas.
* **La paradoja de las extensiones:** Debido a que TypeScript genera archivos de salida `.js`, la importación debe apuntar a la extensión que existirá *en tiempo de ejecución*. Por lo tanto, si tienes un archivo local `util.ts`, deberás importarlo usando la extensión `.js`:

```typescript
// Correcto bajo la resolución node16/nodenext en proyectos ESM puros
import { calcular } from "./util.js"; 

// Error de compilación: Aunque el archivo fuente sea 'util.ts', 
// no se permite omitir la extensión ni usar '.ts' directamente en la cadena de texto de importación.
import { calcular } from "./util"; 

```

### 4. Banderas de Rastreo de Resolución (Trace Resolution)

Cuando las rutas de importación fallan o se comportan de manera inesperada (por ejemplo, importando una versión incorrecta de un tipo), TypeScript ofrece una herramienta de diagnóstico interna. Puedes compilar tu proyecto utilizando el modificador `--traceResolution` a través de la terminal:

```bash
tsc --traceResolution

```

Este comando imprimirá en la consola un informe detallado paso a paso de cada ubicación e intento que realizó el algoritmo de resolución para cada módulo de tu aplicación, permitiéndote diagnosticar exactamente en qué carpeta o archivo falló la búsqueda.

## 13.3 Uso de Namespaces para organización

En las primeras versiones de TypeScript (cuando el estándar de módulos de JavaScript aún no estaba consolidado), la comunidad necesitaba una forma nativa de agrupar lógica relacionada y evitar la contaminación del espacio de nombres global. Para resolver esto, TypeScript introdujo los **Namespaces** (conocidos en versiones muy antiguas como *módulos internos*).

Aunque hoy en día los Módulos de ES (vistos en la sección 13.1) son el estándar recomendado para estructurar aplicaciones modernas, los namespaces siguen siendo una herramienta útil para organizar código en scripts globales, agrupar tipos complejos o empaquetar librerías que no utilizan un cargador de módulos tradicional.

### 1. ¿Qué es un Namespace?

Un namespace es un objeto JavaScript plano con un nombre definido en el ámbito global. Su propósito principal es encapsular variables, funciones, interfaces o clases de tal manera que solo sean accesibles de forma explícita desde fuera del bloque si se utiliza la palabra clave `export`.

#### Sintaxis Básica

```typescript
// Definición del namespace
namespace Validacion {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Privado dentro del namespace

    export function esEmailValido(texto: string): boolean { // Público
        return emailRegex.test(texto);
    }

    export class ValidadorDePassword {
        esSeguro(pass: string): boolean {
            return pass.length > 8;
        }
    }
}

// Consumo de los elementos del namespace (Notación de punto)
const correo = "contacto@typescript.org";
console.log(Validacion.esEmailValido(correo)); // Devuelve: true

const validador = new Validacion.ValidadorDePassword();

```

Si intentas acceder a `Validacion.emailRegex` desde fuera del bloque, el compilador generará un error de acceso, protegiendo la lógica interna y simulando un modificador de acceso privado a nivel de bloque.

### 2. Namespaces Multiarchivo

Una de las características más particulares de los namespaces es su capacidad para dividirse a lo largo de **múltiples archivos físicos**. El compilador de TypeScript es capaz de fusionar de forma automática las definiciones que compartan el mismo nombre exacto, comportándose como si todo el código residiera en un único lugar.

Para enlazar dependencias entre archivos de namespaces sin usar el sistema de módulos tradicional, se utiliza una directiva especial de preprocesamiento en forma de comentario XML llamada **Triple-Slash Reference** (`/// <reference path="..." />`).

#### Ejemplo de Estructura Multiarchivo

**Archivo 1: `ValidacionBase.ts`**

```typescript
namespace Validacion {
    export interface Regla {
        esValida(texto: string): boolean;
    }
}

```

**Archivo 2: `ValidacionEmail.ts`**

```typescript
/// <reference path="ValidacionBase.ts" />
namespace Validacion {
    export class EmailRegla implements Regla {
        esValida(texto: string): boolean {
            return texto.includes("@");
        }
    }
}

```

**Archivo 3: `app.ts` (Consumidor)**

```typescript
/// <reference path="ValidacionBase.ts" />
/// <reference path="ValidacionEmail.ts" />

const regla: Validacion.Regla = new Validacion.EmailRegla();
console.log(regla.esValida("hola@mundo.com"));

```

#### Compilación de Namespaces Multiarchivo

Para ejecutar este código en un navegador o entorno que no cargue módulos individuales, debes indicarle al compilador que concatene todos los archivos en un único resultado final utilizando el parámetro `--outFile` en tu terminal o configuración:

```bash
tsc --outFile salida.js ValidacionBase.ts ValidacionEmail.ts app.ts

```

### 3. Namespaces Anidados (Nested Namespaces)

Al igual que los objetos en JavaScript, los namespaces se pueden anidar jerárquicamente para estructurar APIs profundas o subsistemas complejos dentro de una misma organización.

```typescript
namespace MiApp {
    export namespace Utilidades {
        export namespace Cripto {
            export function encriptar(texto: string): string {
                return btoa(texto); // Ejemplo simple
            }
        }
    }
}

// Acceso jerárquico completo
const secreto = MiApp.Utilidades.Cripto.encriptar("TypeScript");

```

#### Uso de Alias de Namespaces (`import` local)

Escribir rutas anidadas muy largas puede volver el código repetitivo y difícil de leer. TypeScript permite simplificar estas referencias creando un alias local utilizando la palabra clave `import` aplicada directamente a la ruta del namespace:

```typescript
// Creación de un alias local para el namespace anidado
import HerramientaCripto = MiApp.Utilidades.Cripto;

// Uso simplificado del alias
const secretoCorto = HerramientaCripto.encriptar("Texto");

```

*Nota: Es importante no confundir este uso de `import` (creación de alias para elementos internos) con la instrucción `import` de los Módulos de ES orientada a cargar archivos externos.*

### 4. Módulos vs. Namespaces: ¿Cuál deberías elegir?

A menudo surge la duda sobre cuál de estas dos herramientas de organización implementar. La documentación oficial de TypeScript establece directrices muy claras basadas en los estándares modernos de desarrollo.

| Característica | Módulos (ES Modules) | Namespaces |
| --- | --- | --- |
| **Estándar** | Sí (Adoptado de forma nativa por ECMAScript / JS). | No (Es una característica exclusiva de TypeScript). |
| **Aislamiento** | Cada archivo es un módulo aislado. Declarativo y explícito. | Ámbito global compartido. Depende del nombre del bloque. |
| **Resolución** | Gestionada por el entorno de ejecución (Navegador, Node.js) o Bundler. | Gestionada por el compilador de TypeScript al enlazar código. |
| **Tree Shaking** | Excelente. Las herramientas modernas eliminan el código no usado. | Difícil de optimizar estáticamente por los empaquetadores. |
| **Uso principal** | Aplicaciones web modernas, librerías NPM, proyectos Node.js. | Aplicaciones heredadas monolíticas, archivos de definición globales. |

> **Regla general de buenas prácticas:** En proyectos greenfield (proyectos nuevos desde cero), **utiliza siempre Módulos** en lugar de Namespaces. Los módulos ofrecen un rastreo de dependencias transparente, mejor soporte para herramientas de empaquetado modernas (como Vite o Webpack) y aseguran que tu base de código se mantenga alineada con el futuro del lenguaje JavaScript estándar.
>
## 13.4 Importaciones dinámicas y Lazy Loading

Hasta ahora, todas las importaciones que hemos visto en este capítulo se realizan de forma **estática**. Esto significa que utilizamos la palabra clave `import` en la línea superior de nuestros archivos y el entorno carga de manera obligatoria todos los módulos antes de comenzar la ejecución del código.

Sin embargo, en aplicaciones de gran escala, cargar absolutamente todo el código desde el inicio penaliza drásticamente el rendimiento y el tiempo de carga inicial. Para solucionar esto, TypeScript y JavaScript moderno admiten las **importaciones dinámicas**, una característica que habilita el **Lazy Loading** (carga diferida o perezosa): la capacidad de descargar e interpretar fragmentos de código solo cuando el usuario realmente los necesita.

### 1. La sintaxis `import()` como función

A diferencia de la declaración estática, la importación dinámica se invoca como una función utilizando la sintaxis `import("ruta")`.

Esta llamada no detiene el hilo de ejecución; en su lugar, devuelve una **Promesa (`Promise`)**. Esta promesa se resuelve devolviendo un objeto que contiene todas las exportaciones (tanto nombradas como por defecto) del módulo solicitado una vez que el archivo ha sido completamente descargado y procesado.

#### Comparativa de flujo de carga

```text
Importación Estática (Carga síncrona/bloqueante al inicio):
[Descargar App] ---> [Descargar Módulo A] ---> [Descargar Módulo B] ---> [Ejecutar Aplicación]

Importación Dinámica (Lazy Loading bajo demanda):
[Descargar App] ---> [Ejecutar Aplicación Básica]
                          │
                          └───> ¿Usuario hace clic en un botón? ───> [Descargar Módulo A al vuelo]

```

### 2. Implementación Práctica con `async / await`

La manera más limpia y legible de consumir importaciones dinámicas en TypeScript es mediante los operadores `async` y `await`.

Imaginemos un módulo encargado de generar reportes en formato PDF pesados:

```typescript
// reportes.ts
export interface DatosReporte {
    id: string;
    contenido: string;
}

export function generarPdf(datos: DatosReporte): void {
    console.log(`Generando PDF para el reporte ${datos.id}...`);
}

export default function inicializarGenerador(): void {
    console.log("Motor de PDFs listo.");
}

```

Si queremos cargar este archivo únicamente cuando el usuario haga clic en un botón de exportación, lo estructuramos de la siguiente manera:

```typescript
// app.ts
const botonExportar = document.getElementById("btn-exportar");

if (botonExportar) {
    botonExportar.addEventListener("click", async () => {
        try {
            // El módulo se descarga y lee bajo demanda en este preciso instante
            const moduloReportes = await import("./reportes");

            const datos = { id: "R-101", contenido: "Balance Anual" };

            // 1. Consumo de una exportación nombrada
            moduloReportes.generarPdf(datos);

            // 2. Consumo de una exportación por defecto (se accede mediante la propiedad .default)
            moduloReportes.default();

        } catch (error) {
            console.error("Error al cargar el módulo de reportes:", error);
        }
    });
}

```

### 3. Preservación y tipado estático en cargas dinámicas

Uno de los mayores desafíos al cargar módulos dinámicamente en JavaScript puro es perder la noción de qué formas o tipos tienen los datos que devuelve el archivo. TypeScript soluciona esto de raíz permitiéndote extraer la firma de los tipos del módulo en tiempo de compilación sin forzar su carga en tiempo de ejecución.

Para lograrlo, combinamos el operador `typeof` con el tipo utilitario de promesas:

```typescript
// app.ts
async function ejecutarCalculoAvanzado() {
    // Obtenemos el tipo estático del módulo completo para usarlo como guía
    type TipoModuloReportes = typeof import("./reportes");

    // TypeScript realiza la inferencia automática de 'modulo', 
    // garantizando el autocompletado y la verificación estática de sus métodos.
    const modulo: TipoModuloReportes = await import("./reportes");
    
    modulo.generarPdf({ id: "2", contenido: "Muestra" }); 
}

```

### 4. Requisitos de Configuración (`tsconfig.json`)

Para que las importaciones dinámicas funcionen correctamente, el compilador de TypeScript necesita saber qué estrategia de código final debe emitir. Si estás transpilando a un estándar muy antiguo (como ES5 o CommonJS tradicional), TypeScript alterará el `import()` nativo por llamadas sintéticas de entornos antiguos (como `require()`).

Para asegurar el soporte nativo de Lazy Loading mediante ES Modules en navegadores modernos o plataformas como Node.js, debes ajustar las siguientes directivas en tu `compilerOptions`:

```json
{
  "compilerOptions": {
    "target": "ES2020", // O superior, para permitir características modernas de JS
    "module": "ESNext", // Preserva las instrucciones import() nativas intactas
    "moduleResolution": "NodeNext" // Asegura que el algoritmo entienda cargas asíncronas
  }
}

```

Cuando un empaquetador moderno (como Vite o Webpack) detecta la sintaxis `import()`, realiza de forma automática un proceso llamado **Code-Splitting** (división de código). El empaquetador segmentará el código de tu aplicación separando el módulo dinámico en un archivo `.js` independiente (un *chunk*), el cual se almacenará en el servidor y solo viajará por la red de internet en el instante exacto en que la función `import()` sea ejecutada.

## Resumen del capítulo

En el **Capítulo 13: Módulos y Namespaces**, hemos explorado en profundidad las herramientas fundamentales que ofrece TypeScript para estructurar y escalar aplicaciones organizando el código en múltiples unidades lógicas independientes:

* **Exportación e importación de módulos (13.1):** Aprendimos el uso del estándar moderno de *ES Modules* mediante exportaciones nombradas, exportaciones por defecto y la creación de archivos centralizadores (*barrels*). Además, analizamos el uso de `import type` para optimizar el rendimiento y aislar los tipos de la lógica de ejecución.
* **Resoluciones de módulos en TypeScript (13.2):** Estudiamos los algoritmos internos (`Classic`, `Node`, `NodeNext`) que utiliza el compilador para rastrear la ubicación física de un archivo a partir de rutas relativas o no relativas, abordando las nuevas restricciones de extensiones en entornos modernos de Node.js.
* **Uso de Namespaces para organización (13.3):** Evaluamos el comportamiento de los namespaces como estructuras internas globales para agrupar código e identificamos por qué, en el desarrollo actual, se priorizan los módulos sobre ellos.
* **Importaciones dinámicas y Lazy Loading (13.4):** Descubrimos cómo romper la sincronía de carga de una aplicación mediante la expresión `import()`, permitiendo retrasar la descarga de código pesado hasta el momento exacto en que sea requerido, facilitando el *Code-Splitting* y optimizando el rendimiento general del software.
