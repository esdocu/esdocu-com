Este capítulo aborda la sinergia entre el sistema de tipos de TypeScript y las herramientas de desarrollo moderno para interfaces de usuario. A lo largo de las siguientes secciones, se analiza la configuración de entornos TSX y la declaración de componentes funcionales en React. Se examina el tipado estricto de propiedades (*props*), callbacks y estados complejos mediante hooks genéricos. Además, se comparan los flujos de compilación y transpilación con Webpack y Vite. Por último, se detalla el uso de archivos de declaración externos (`.d.ts`) y el repositorio `@types` para integrar con seguridad librerías de JavaScript puro en proyectos tipados.

## 14.1 Integración básica con React y JSX

La combinación de TypeScript con React se ha convertido en el estándar de la industria para el desarrollo de aplicaciones web robustas y escalables. React utiliza JSX (JavaScript XML), una extensión de la sintaxis de JavaScript que permite escribir estructuras similares a HTML directamente en el código. Cuando integramos TypeScript, esta extensión pasa a llamarse TSX.

El uso de TSX introduce un sistema de tipado estático sobre la estructura de la interfaz de usuario, garantizando que los componentes reciban los datos correctos y que las propiedades de los elementos HTML nativos se utilicen de acuerdo con las especificaciones del DOM.

### El entorno TSX y la directiva jsx

Para que TypeScript pueda procesar archivos con la extensión `.tsx`, el compilador necesita instrucciones específicas sobre cómo transformar esa sintaxis en código JavaScript estándar ejecutable por el navegador. Esto se gestiona en el archivo de configuración `tsconfig.json` mediante la propiedad `jsx` dentro de `compilerOptions`.

Existen diferentes modos de configuración para esta directiva:

* **`react`**: Compila el código TSX a llamadas tradicionales `React.createElement()`. Es la opción utilizada en versiones de React anteriores a la 17.
* **`react-jsx`**: Introducido en React 17, permite utilizar la nueva transformación de JSX. El compilador transforma el TSX importando automáticamente las funciones internas de producción del entorno de ejecución de React (como `_jsx`), eliminando la necesidad de importar explícitamente a `React` en la cabecera de cada archivo.
* **`preserve`**: Mantiene los bloques JSX intactos en el archivo de salida, delegando la compilación final a una herramienta externa o empaquetador posterior (como Babel o Vite). La extensión del archivo resultante es `.jsx`.

Un fragmento típico de configuración en el ecosistema moderno se define de la siguiente manera:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "jsx": "react-jsx",
    "moduleResolution": "node",
    "strict": true
  }
}

```

### Componentes Funcionales y Tipos de Retorno

En el React moderno, la unidad fundamental de desarrollo es el componente funcional. Un componente funcional no es más que una función de JavaScript que acepta un objeto de propiedades (props) y devuelve un elemento JSX.

TypeScript ofrece herramientas específicas para tipar estas funciones de forma explícita, asegurando la consistencia del ciclo de vida y la estructura del componente.

#### El tipo `React.JSX.Element`

Cuando escribimos un componente funcional básico, TypeScript infiere automáticamente su tipo de retorno basándose en lo que devuelve la función. La expresión JSX se evalúa bajo el tipo global `React.JSX.Element` (o históricamente `JSX.Element`).

```tsx
// TypeScript infiere el tipo de retorno como React.JSX.Element
function SaludoInferred() {
  return <h1>Hola desde un componente tipado</h1>;
}

```

Si intentamos retornar un tipo no válido dentro del árbol de componentes (como un objeto plano), el sistema de tipos detendrá la compilación inmediatamente.

#### El tipo explícito `React.FC` (o `React.FunctionComponent`)

Históricamente, se ha utilizado el tipo genérico `React.FC` (abreviatura de `React.FunctionComponent`) para tipar los componentes declarados como funciones de flecha.

```tsx
import React from 'react';

const Boton: React.FC = () => {
  return <button>Hacer clic</button>;
};

```

**Nota de diseño:** En las versiones actuales de React, se prefiere la inferencia automática o el tipado explícito del retorno sobre el uso de `React.FC`. Anteriormente, `React.FC` inyectaba de forma implícita la propiedad `children` en todos los componentes, lo cual disminuía la precisión del tipado si un componente no estaba diseñado para recibir elementos hijos. En las versiones modernas de React, `children` debe declararse explícitamente si se requiere, eliminando la principal ventaja de `React.FC`.

Por lo tanto, la convención más limpia y recomendada para definir componentes funcionales consiste en usar funciones estándar con tipado estructural:

```tsx
function Tarjeta(): React.JSX.Element {
  return (
    <div className="tarjeta">
      <h2>Título de la Tarjeta</h2>
      <p>Contenido descriptivo del componente.</p>
    </div>
  );
}

```

### Elementos Nativos del DOM y Atributos

Uno de los mayores beneficios de usar TSX es la validación estática de los atributos HTML. TypeScript valida que los nombres de los atributos sigan las convenciones de React (como `className` en lugar de `class`, o `htmlFor` en lugar de `for`) y que los valores asignados coincidan con el tipo esperado.

El flujo de procesamiento que realiza el compilador al analizar un bloque TSX se puede estructurar conceptualmente de la siguiente manera:

```text
[Código Fuente TSX]
         │
         ▼
[¿Es un elemento nativo? (ej. <div>)] ──Sí──► [Verifica contra React.HTMLAttributes<T>]
         │                                              │
        No                                           Valida strings, booleanos, etc.
         │                                              │
         ▼                                              ▼
[¿Es un componente personalizado?] ─────► [Verifica las Props del Componente]

```

Si escribimos un atributo con un tipo erróneo o un nombre inexistente, el compilador genera un error de tipado:

```tsx
function FormularioInvalido() {
  // ERROR: El tipo 'number' no es asignable al tipo 'string' en 'className'
  // ERROR: La propiedad 'autofocus' no existe en el tipo. Debe ser 'autoFocus'
  return (
    <input 
      className={123} 
      autofocus={true} 
    />
  );
}

```

El compilador mapea cada etiqueta HTML nativa a una interfaz específica del DOM de React. Por ejemplo, un elemento `<input>` está ligado a `React.InputHTMLAttributes<HTMLInputElement>`, lo que garantiza que propiedades como `type`, `value`, `disabled` o `placeholder` tengan una cobertura de tipos matemática y rigurosa en tiempo de diseño.

## 14.2 Tipado de props y estados

El núcleo de la arquitectura de componentes de React se basa en el flujo unidireccional de datos a través de las propiedades (*props*) y la gestión de la mutabilidad local mediante el estado (*state*). Al integrar TypeScript, estas dos estructuras dejan de ser objetos dinámicos y ambiguos para convertirse en estructuras con tipado estático estricto. Esto garantiza que cualquier cambio en la estructura de los datos sea validado inmediatamente en toda la jerarquía de componentes.

### Tipado de Props en Componentes Funcionales

Las *props* representan el contrato de interfaz de un componente con el mundo exterior. Definen qué datos requiere el componente para renderizarse y cómo debe comportarse. Para tipar las *props*, se utilizan interfaces o alias de tipos (`type`).

#### Uso de Interfaces para definir Props

La convención estándar consiste en definir una interfaz que describa la forma del objeto de propiedades. Esta interfaz se aplica directamente al parámetro de la función del componente.

```tsx
interface TarjetaUsuarioProps {
  nombre: string;
  edad: number;
  activo: boolean;
}

function TarjetaUsuario({ nombre, edad, activo }: TarjetaUsuarioProps): React.JSX.Element {
  return (
    <div className="perfil">
      <h3>{nombre}</h3>
      <p>Edad: {edad}</p>
      <p>Estado: {activo ? "Conectado" : "Desconectado"}</p>
    </div>
  );
}

```

Al invocar este componente en otra parte de la aplicación, TypeScript obligará al desarrollador a proveer exactamente las propiedades requeridas con sus tipos correspondientes:

```tsx
// Compilación correcta
const NodoValido = <TarjetaUsuario nombre="Sofía" edad={28} activo={true} />;

// ERROR: Falta la propiedad 'activo' y 'edad' debe ser un número
const NodoInvalido = <TarjetaUsuario nombre="Sofía" edad="veintiocho" />;

```

#### Propiedades Opcionales y Valores por Defecto

Siguiendo las reglas de los objetos en TypeScript, podemos marcar propiedades como opcionales utilizando el operador `?`. Cuando una propiedad es opcional, se deben gestionar los valores predeterminados mediante la desestructuración de parámetros nativa de JavaScript (ES6).

```tsx
interface BotonPersonalizadoProps {
  texto: string;
  color?: "primario" | "secundario"; // Tipo literal combinado con unión
  deshabilitado?: boolean;
}

function BotonPersonalizado({
  texto,
  color = "primario", // Valor por defecto
  deshabilitado = false // Valor por defecto
}: BotonPersonalizadoProps): React.JSX.Element {
  return (
    <button className={`btn-${color}`} disabled={deshabilitado}>
      {texto}
    </button>
  );
}

```

### Tipado de la Propiedad Especial `children`

En React, la propiedad `children` permite componer elementos anidados dentro de un componente. En TypeScript, esta propiedad debe tiparse de forma explícita utilizando los tipos provistos por la biblioteca. El tipo más idóneo y abarcador para representar cualquier elemento renderizable por React es `React.ReactNode`.

```tsx
import React from 'react';

interface ContenedorProps {
  titulo: string;
  children: React.ReactNode; // Permite strings, números, elementos JSX, arreglos o fragments
}

function Contenedor({ titulo, children }: ContenedorProps): React.JSX.Element {
  return (
    <div className="contenedor-global">
      <header><h2>{titulo}</h2></header>
      <main>{children}</main>
    </div>
  );
}

// Uso del componente con children estructurados
function App() {
  return (
    <Contenedor titulo="Panel de Administración">
      <p>Este párrafo es parte del children.</p>
      <button>Guardar cambios</button>
    </Contenedor>
  );
}

```

### Tipado de Funciones como Props (Callbacks)

Es un patrón común pasar funciones como propiedades para permitir que los componentes hijos notifiquen eventos a los componentes padres. Estas funciones se tipan utilizando la sintaxis estándar de funciones de TypeScript.

```tsx
interface ListaTareasProps {
  tareas: string[];
  onEliminarTarea: (indice: number) => void; // Recibe un número y no retorna nada
}

function ListaTareas({ tareas, onEliminarTarea }: ListaTareasProps): React.JSX.Element {
  return (
    <ul>
      {tareas.map((tarea, index) => (
        <li key={index}>
          {tarea} <button onClick={() => onEliminarTarea(index)}>Eliminar</button>
        </ul>
      ))}
    </li>
  );
}

```

### Tipado del Estado con el Hook `useState`

El hook `useState` es la herramienta principal para manejar el estado local en componentes funcionales. TypeScript maneja el tipado del estado de dos maneras: a través de la inferencia automática o mediante el uso de argumentos genéricos.

#### Inferencia de Tipos en `useState`

Si el estado se inicializa con un valor primitivo claro, TypeScript deducirá automáticamente el tipo del estado y restringirá tanto el valor actual como la función modificadora a ese tipo específico.

```tsx
import { useState } from 'react';

function Contador() {
  // TypeScript infiere de forma automática: useState<number>
  const [contador, setContador] = useState(0);

  const incrementar = () => setContador(contador + 1); // Válido
  const provocarError = () => setContador("uno"); // ERROR: Tipo 'string' no es asignable a 'number'

  return <button onClick={incrementar}>Clicks: {contador}</button>;
}

```

#### Uso de Generics en `useState`

Existen dos escenarios críticos donde la inferencia de tipos es insuficiente y se requiere declarar explícitamente el tipo de manera genérica:

1. Cuando el estado se inicializa en `null` o `undefined` pero albergará un dato posteriormente.
2. Cuando el estado maneja objetos complejos, uniones de tipos o estructuras de datos personalizadas.

```tsx
interface Usuario {
  id: string;
  correo: string;
}

function PanelUsuario() {
  // El estado puede ser de tipo Usuario o null. Inicializado en null.
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  const iniciarSesion = () => {
    setUsuario({
      id: "USR-9482",
      correo: "admin@empresa.com"
    });
  };

  const cerrarSesion = () => setUsuario(null);

  return (
    <div>
      {usuario ? (
        <p>Bienvenido: {usuario.correo}</p>
      ) : (
        <p>Ningún usuario autenticado</p>
      )}
      <button onClick={iniciarSesion}>Conectar</button>
    </div>
  );
}

```

Al utilizar el parámetro genérico `useState<Usuario null |>`, TypeScript garantiza que la función `setUsuario` solo acepte estructuras que cumplan estrictamente con la interfaz `Usuario`, o el valor literal `null`, previniendo inconsistencias de datos en la memoria en tiempo de ejecución.

## 14.3 Uso de TypeScript con Vite y Webpack

Para que una aplicación de React escrita en TypeScript pueda ejecutarse en el navegador, los archivos fuente con extensión `.ts` y `.tsx` deben procesarse, compilarse a JavaScript estándar (ES5 o ESNext) y empaquetarse junto con sus dependencias (como hojas de estilo, imágenes y librerías de terceros). En el ecosistema moderno del desarrollo frontend, existen dos herramientas principales para cumplir esta función: **Webpack**, el empaquetador clásico basado en configuración estática, y **Vite**, la herramienta de última generación orientada a la velocidad y basada en módulos ES nativos (ESM).

### Flujo de Compilación con Webpack

Webpack delega la lectura y transformación de los archivos a cargadores específicos (*loaders*). Cuando se integra TypeScript en Webpack, el desarrollador debe elegir entre dos estrategias de compilación: `ts-loader` o Babel con `@babel/preset-typescript`.

#### Estrategia con `ts-loader`

`ts-loader` es el cargador oficial de TypeScript para Webpack. Utiliza internamente el compilador oficial de TypeScript (`tsc`), lo que significa que realiza dos tareas simultáneamente: la transpilación del código a JavaScript y la verificación estática de tipos en tiempo de compilación. Si existe un error de tipos en cualquier archivo del proyecto, el proceso de construcción (*build*) fallará.

El flujo de trabajo con esta estrategia se organiza de la siguiente manera:

```text
[Archivos .tsx / .ts] ──► [Webpack + ts-loader] ──► [Llama a tsc] ──► 1. Verifica tipos (Error = detiene build)
                                                                    └──► 2. Transpila a código JS empaquetado

```

Un fragmento esencial de la configuración de Webpack (`webpack.config.js`) utilizando `ts-loader` se define así:

```javascript
const path = require('path');

module.exports = {
  entry: './src/index.tsx',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    // Permite omitir las extensiones al importar módulos
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
};

```

#### Estrategia con Babel

Alternativamente, se puede utilizar `@babel/preset-typescript` dentro de Webpack. A diferencia de `ts-loader`, Babel elimina las anotaciones de tipo de TypeScript sin verificarlas, transformando el archivo instantáneamente. Para no perder la seguridad del sistema de tipos, se debe ejecutar el comando `tsc --noEmit` de forma independiente en el flujo de integración continua (CI) o mediante complementos como `fork-ts-checker-webpack-plugin`, el cual ejecuta la verificación de tipos en un proceso separado para no ralentizar el empaquetado.

### Flujo de Compilación Ultraveloz con Vite

Vite ha transformado el desarrollo frontend al cambiar drásticamente la forma en que se maneja TypeScript durante la etapa de desarrollo. En lugar de empaquetar todo el código antes de levantar el servidor local, Vite aprovecha los módulos ES nativos (`import`/`export`) que los navegadores modernos soportan de forma nativa.

#### Transpilación separada de la Verificación de Tipos

Vite utiliza **esbuild** para procesar los archivos TypeScript. `esbuild` está escrito en Go y es entre 10 y 100 veces más rápido que los compiladores tradicionales basados en JavaScript. Sin embargo, `esbuild` funciona bajo la misma filosofía que Babel: **solo transpila el código, no realiza verificación de tipos**. Borra los tipos del archivo `.tsx` en microsegundos para que el navegador pueda renderizar los cambios inmediatamente a través de *Hot Module Replacement* (HMR).

Para asegurar la validez del tipado sin penalizar la velocidad de desarrollo en Vite, se adoptan dos medidas complementarias:

1. **En el editor de código:** Se confía en el servidor de lenguaje TypeScript integrado en editores como VS Code para alertar de los errores en tiempo real mientras se escribe.
2. **En el proceso de producción:** En el archivo `package.json`, el comando de construcción (`build`) antepone la ejecución de `tsc` con el flag `--noEmit` antes de compilar con Vite. Esto asegura que la aplicación final esté completamente libre de errores de tipo.

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview"
  }
}

```

La configuración básica de un archivo `vite.config.ts` para un proyecto React con TypeScript requiere únicamente el plugin oficial de React, ya que el soporte para la lectura de archivos `.ts` y `.tsx` viene integrado de forma nativa en el núcleo de Vite:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite analiza de forma nativa la sintaxis TSX sin loaders pesados
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  }
});

```

### El archivo de entorno `vite-env.d.ts`

Al crear un proyecto con Vite y TypeScript, se genera automáticamente un archivo en la raíz del código fuente llamado `vite-env.d.ts`. Este archivo contiene directivas de referencia de tipos que le comunican al compilador de TypeScript la existencia de variables de entorno específicas de Vite (como `import.meta.env`) y añade el soporte de tipado para la importación directa de recursos no de código, tales como archivos CSS modulares (`.module.css`), imágenes (`.svg`, `.png`) y otros activos estáticos. Sin este archivo, TypeScript lanzaría un error de compilación al intentar importar una imagen o un archivo de estilos desde un componente TSX.

## 14.4 Archivos de declaración externas (.d.ts)

A pesar de la enorme popularidad de TypeScript, una gran parte del ecosistema de JavaScript —incluyendo miles de librerías publicadas en npm— todavía está escrita en JavaScript puro. Cuando importamos una librería de JavaScript en un proyecto de TypeScript, el compilador no puede deducir la forma de los objetos, las funciones ni los tipos de parámetros de ese módulo. Para resolver esta brecha de información sin necesidad de reescribir la librería original, TypeScript utiliza los **archivos de declaración de tipos**, reconocibles por su extensión `.d.ts` (*Declaration files*).

Estos archivos actúan exclusivamente como un plano arquitectónico o un contrato de interfaz: no contienen lógica ejecutable (código JavaScript que altere el comportamiento del programa), sino únicamente descripciones y anotaciones de tipos que le indican al compilador cómo interactuar con el código externo.

### Estructura de un archivo `.d.ts` y la palabra clave `declare`

Los archivos de declaración utilizan la palabra clave `declare` para notificar al sistema de tipos la existencia de variables, funciones, clases o módulos completos que han sido definidos en otro lugar (fuera del control del compilador actual).

Supongamos que tenemos una librería de JavaScript externa muy simple llamada `calculadora-grafica`, que expone una función global o un módulo para renderizar gráficos. El archivo de declaración `calculadora-grafica.d.ts` correspondiente se estructuraría de la siguiente manera:

```typescript
// Archivo: calculadora-grafica.d.ts

export interface GraficoConfig {
  ancho: number;
  alto: number;
  colorFondo?: string;
}

export function inicializarLienzo(idElemento: string): boolean;
export function dibujarGrafico(datos: number[], configuracion: GraficoConfig): void;

```

Cuando consumimos esta librería desde un componente de React o un archivo `.ts`, el editor de código leerá este archivo de definición para proporcionar autocompletado inteligente (*IntelliSense*) y validación de tipos estricta, evitando errores en tiempo de ejecución.

### El Repositorio DefinitelyTyped y el espacio `@types`

Para evitar que los desarrolladores tengan que escribir manualmente los archivos de declaración de cada librería comercial o de código abierto, la comunidad creó **DefinitelyTyped**. Este es un repositorio centralizado masivo en GitHub donde miles de programadores mantienen las definiciones de tipos de casi cualquier librería de JavaScript existente.

Estas definiciones se publican automáticamente en npm bajo el *scope* o prefijo `@types`.

#### Flujo de instalación de tipos de terceros

Cuando instalas una librería que no incluye tipos nativos (como `lodash`, `uuid` o paquetes antiguos de React), el proceso correcto consiste en instalar la librería de ejecución en `dependencies` y sus tipos correspondientes en `devDependencies`:

```bash
# Instalación de la librería de ejecución (código JavaScript plano)
npm install lodash

# Instalación de las declaraciones de tipo asociadas para el compilador
npm install --save-dev @types/lodash

```

TypeScript está configurado por defecto para buscar automáticamente dentro de la carpeta `node_modules/@types` para resolver cualquier importación que carezca de tipado nativo.

El flujo de resolución que sigue el compilador cuando encuentra una sentencia `import` sigue una jerarquía bien definida:

```text
          [Importación de Librería: "mi-modulo"]
                           │
                           ▼
          ¿El paquete incluye tipos nativos?
          (Revisa el campo "types" en package.json)
               ├── Sí ──► Usa los tipos incluidos
               └── No ──► Busca en node_modules/@types/mi-modulo
                                ├── Encontrado ──► Usa @types
                                └── No encontrado ──► Error de Compilación

```

Si una librería no incluye tipos nativos y tampoco existe un paquete dentro del ecosistema `@types`, el compilador detendrá el proceso emitiendo un error indicando que el módulo no se pudo encontrar o que requiere una declaración de tipo implícita `any`.

### Declaración de módulos propios y tipos globales

Existen escenarios donde necesitas declarar tus propios módulos globales o definir tipos para archivos no de código (como imágenes o archivos Markdown) que tu empaquetador (Vite o Webpack) puede procesar pero que TypeScript desconoce por completo. Esto se logra creando un archivo de declaración personalizado (por ejemplo, `globales.d.ts`) en el directorio de código fuente del proyecto.

```typescript
// Archivo: src/globales.d.ts

// 1. Declarar soporte de tipos para la importación de archivos de imagen SVG
declare module "*.svg" {
  const contenido: string;
  export default contenido;
}

// 2. Inyectar una propiedad personalizada al objeto global 'window' del navegador
interface Window {
  __TOKEN_DE_AUTENTICACION__: string;
}

```

Gracias a estas definiciones, podemos escribir el siguiente código dentro de nuestros componentes de React sin recibir advertencias ni errores del compilador:

```tsx
import React from 'react';
import miLogotipo from './activos/logotipo.svg'; // Válido gracias al módulo declarado

function ComponenteGlobal(): React.JSX.Element {
  // Acceso seguro a la ventana del navegador con tipado estricto
  const token = window.__TOKEN_DE_AUTENTICACION__;

  return (
    <div>
      <img src={miLogotipo} alt="Logotipo de la aplicación" />
      <p>Token de sesión activo: {token}</p>
    </div>
  );
}

```

## Resumen del capítulo

En este **Capítulo 14: Integración en Frontend**, hemos explorado la convergencia entre el ecosistema estricto de TypeScript y las herramientas de desarrollo de interfaces modernas. Comenzamos analizando la configuración del entorno **TSX**, donde aprendimos cómo la directiva `jsx` en el archivo `tsconfig.json` gestiona la transformación de las estructuras de interfaz de usuario, y cómo estructurar de forma limpia componentes funcionales utilizando los tipos de retorno de React.

Posteriormente, profundizamos en el **tipado de props y estados**, estableciendo contratos estrictos mediante interfaces para las propiedades de los componentes (incluyendo la gestión de la propiedad especial `children` con `React.ReactNode`) y aplicando tipos genéricos al hook `useState` para controlar la memoria interna de la aplicación de manera segura.

También evaluamos las diferencias en los flujos de compilación al comparar el empaquetado clásico y exhaustivo de **Webpack** frente a la velocidad de transpilación basada en módulos nativos y `esbuild` que ofrece **Vite**. Finalmente, estudiamos el rol crítico de los **archivos de declaración de tipos (`.d.ts`)**, herramientas esenciales que actúan como puentes para integrar librerías escritas en JavaScript puro dentro de aplicaciones de TypeScript, ya sea consumiendo definiciones comunitarias desde el repositorio `@types` o configurando módulos globales personalizados para activos estáticos del proyecto.
