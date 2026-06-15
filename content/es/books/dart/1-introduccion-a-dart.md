Bienvenido al punto de partida de tu viaje con Dart. Antes de escribir complejas arquitecturas de software, es fundamental comprender el terreno que pisamos. Este capítulo está diseñado para guiarte desde los conceptos teóricos más básicos hasta la puesta en marcha de tu entorno de trabajo.

A lo largo de las siguientes secciones, descubrirás qué hace a Dart un lenguaje tan versátil y potente para el desarrollo multiplataforma. Aprenderás a instalar su SDK, configurar paso a paso tu editor de código para maximizar tu productividad y, finalmente, escribirás y ejecutarás tu primer programa funcional. Estás a un paso de dominar la tecnología que impulsa el futuro del desarrollo de software.

## 1.1 ¿Qué es Dart y por qué usarlo?

Dart es un lenguaje de programación de código abierto, desarrollado por Google, diseñado específicamente para la creación de aplicaciones rápidas y altamente eficientes en una gran variedad de plataformas, incluyendo dispositivos móviles (iOS y Android), web, escritorio (Windows, macOS y Linux) y servidores.

Nació con la premisa de combinar la productividad del desarrollo en lenguajes dinámicos con la seguridad y el rendimiento de los lenguajes fuertemente tipados. Aunque hoy en día es mundialmente reconocido por ser el motor detrás del ecosistema de **Flutter**, Dart es un lenguaje independiente y de propósito general que ofrece características técnicas excepcionales por sí mismo.

### ¿Qué hace a Dart diferente?

Para entender qué es Dart, es fundamental comprender cómo procesa el código. Dart destaca sobre otros lenguajes gracias a su arquitectura de compilación flexible, la cual utiliza dos modos de ejecución distintos según la etapa del desarrollo:

1. **Compilación JIT (Just-in-Time / Justo a tiempo):** Durante la etapa de desarrollo, Dart compila el código en tiempo de ejecución. Esto permite analizar los cambios sobre la marcha e introdujo la revolucionaria característica del *Hot Reload* (recarga en caliente). Cuando modificas tu código, el cambio se refleja en la aplicación casi instantáneamente sin perder el estado actual ni requerir una reinstalación completa.
2. **Compilación AOT (Ahead-of-Time / Antes de tiempo):** Para la etapa de producción, Dart compila el código directamente a lenguaje máquina nativo (arquitecturas ARM o x64) o a JavaScript/WebAssembly altamente optimizado si el destino es la web. Esto elimina la necesidad de puentes pesados o entornos virtuales de ejecución en el dispositivo final, garantizando que la aplicación se inicie de inmediato y funcione de manera fluida.

```text
Fase de Desarrollo (Productividad)
[Código Fuente] ---> Compilación JIT ---> [Ejecución Rápida con Hot Reload]

Fase de Producción (Rendimiento)
[Código Fuente] ---> Compilación AOT ---> [Código Máquina Nativo (Binario)]

```

### Características clave de Dart

* **Tipado estático y seguro:** Dart es un lenguaje de tipado estático, lo que significa que el sistema verifica los tipos de datos antes de que el código se ejecute, atrapando la mayoría de los errores durante la escritura. Sin embargo, su inferencia de tipos te permite omitir la declaración explícita cuando el contexto es claro, manteniendo el código limpio.
* **Seguridad contra nulos (Null Safety):** El sistema de tipos de Dart distingue de forma nativa entre los valores que pueden ser nulos y los que no. Esto erradica de raíz el famoso error de "referencia nula" (*NullPointerException*) en tiempo de ejecución.
* **Concurrencia basada en Isolates:** A diferencia de otros lenguajes que utilizan hilos (*threads*) que comparten memoria y pueden causar condiciones de carrera, Dart ejecuta su código en contenedores aislados llamados *Isolates*. Cada isolate tiene su propia memoria y un único hilo de ejecución, lo que simplifica la programación asíncrona y paralela.
* **Programación orientada a objetos (POO):** Es un lenguaje orientado a objetos basado en clases, que soporta características avanzadas como mixins (para reutilizar código en múltiples jerarquías de clases) y interfaces implícitas.

### ¿Por qué usar Dart?

Adoptar Dart como lenguaje de programación principal aporta ventajas competitivas tanto a desarrolladores individuales como a equipos de ingeniería empresarial:

#### 1. Una única base de código, múltiples plataformas

El ecosistema de Dart te permite escribir la lógica de negocio una sola vez y desplegarla en cualquier lugar. Al compilar directamente a código nativo de cada plataforma, no hay degradación en la experiencia del usuario final.

#### 2. Curva de aprendizaje suave

Si tienes experiencia previa en lenguajes como JavaScript, Java, C# o C++, Dart te resultará sumamente familiar. Su sintaxis ha sido diseñada de manera intuitiva, eliminando asperezas históricas de otros lenguajes pero manteniendo una estructura clara y predecible. Un desarrollador puede volverse productivo en Dart en cuestión de pocos días.

#### 3. Rendimiento de alta velocidad

Al deshacerse de intermediarios en producción mediante la compilación AOT, las aplicaciones escritas en Dart alcanzan tasas de refresco constantes de 60 a 120 fotogramas por segundo (FPS). Esto es crucial para la fluidez visual de las interfaces de usuario modernas.

#### 4. Gestión automática de memoria eficiente

Dart utiliza un recolector de basura (*Garbage Collector*) de dos generaciones optimizado para interfaces de usuario reactivas. Maneja de forma extremadamente eficiente la creación y destrucción de miles de objetos temporales de vida corta, evitando los molestos tirones (*stutter*) en la pantalla de los dispositivos.

#### 5. Un ecosistema maduro y unificado

A diferencia de otros lenguajes donde debes configurar manualmente decenas de herramientas externas, Dart viene integrado de fábrica con un conjunto de utilidades estandarizadas a través de su CLI (interfaz de línea de comandos): un gestor de paquetes inteligente (`pub`), un formateador de código estricto (`dart format`), un analizador de calidad estático (`dart analyze`) y un robusto entorno de pruebas (`dart test`).

## 1.2 Instalación del SDK de Dart

Para comenzar a escribir código en Dart, el primer paso es instalar el **SDK (Software Development Kit o Kit de Desarrollo de Software)** en tu computadora. El SDK de Dart incluye el compilador, las bibliotecas fundamentales y las herramientas de línea de comandos necesarias para ejecutar, formatear y analizar tu código.

A continuación, se detallan los pasos de instalación oficiales para los tres sistemas operativos principales.

### Instalación en Windows

La forma más recomendada y sencilla de instalar Dart en Windows es utilizando el gestor de paquetes **Chocolatey**.

#### Paso 1: Instalar Chocolatey (si no lo tienes)

1. Abre la **Terminal de Windows** o el **Símbolo del sistema (cmd)** como Administrador.
2. Ejecuta el comando oficial de instalación que encontrarás en `chocolatey.org` o utiliza el siguiente comando en PowerShell:

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

```

#### Paso 2: Instalar el SDK de Dart

Una vez que Chocolatey esté listo, cierra y vuelve a abrir tu terminal como administrador y ejecuta:

```cmd
choco install dart-sdk

```

### Instalación en macOS

En macOS, el método estándar y más eficiente es a través de **Homebrew**, el gestor de paquetes por excelencia para el sistema operativo de Apple.

#### Paso 1: Instalar Homebrew (si no lo tienes)

Abre la terminal y ejecuta el siguiente comando:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

```

#### Paso 2: Agregar el repositorio de Dart e instalar

Con Homebrew listo, ejecuta estos dos comandos en tu terminal:

```bash
brew tap dart-lang/dart
brew install dart

```

### Instalación en Linux

El SDK de Dart está disponible en los repositorios oficiales para distribuciones basadas en Debian/Ubuntu mediante el gestor de paquetes `apt`.

#### Paso 1: Configurar el repositorio

Abre tu terminal y ejecuta los siguientes comandos para actualizar el índice de paquetes e instalar las dependencias necesarias:

```bash
sudo apt-get update
sudo apt-get install apt-transport-https curl gnupg

```

#### Paso 2: Descargar la clave GPG de Google y añadir el canal de Dart

```bash
# Descargar la clave de seguridad de Google
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo gpg --dearmor -o /etc/apt/keyrings/google-archive-keyring.gpg

# Añadir el repositorio de Dart a las fuentes de APT
echo 'deb [signed-by=/etc/apt/keyrings/google-archive-keyring.gpg arch=amd64] https://storage.googleapis.com/download.dartlang.org/linux/debian stable main' | sudo tee /etc/apt/sources.list.d/dart_stable.list

```

#### Paso 3: Instalar el SDK

Finalmente, actualiza los repositorios de tu sistema e instala Dart:

```bash
sudo apt-get update
sudo apt-get install dart

```

### Verificación de la instalación

Sin importar el sistema operativo que utilices, es fundamental comprobar que el proceso se haya completado correctamente y que el sistema reconozca los comandos de Dart.

Abre una nueva ventana de la terminal (o símbolo del sistema) y escribe el siguiente comando:

```bash
dart --version

```

Si la instalación fue exitosa, la terminal no debería arrojar ningún error; en su lugar, mostrará un mensaje con el número de la versión instalada y la arquitectura de tu procesador, similar a esto:

```text
Dart SDK version: 3.x.x (stable) (fecha de lanzamiento) on "macos_arm64"

```

> **Nota importante sobre las Variables de Entorno:** Los gestores de paquetes como Chocolatey, Homebrew y APT configuran automáticamente las rutas del sistema (*PATH*). Si al ejecutar `dart --version` la terminal indica que el comando no es reconocido, reinicia tu equipo. Si el problema persiste, asegúrate manualmente de que la ruta de la carpeta `bin` del SDK de Dart se encuentre añadida a las Variables de Entorno de tu sistema operativo.
>
## 1.3 Configuración del entorno

Con el SDK de Dart correctamente instalado en el sistema, el siguiente paso es preparar el entorno de desarrollo donde escribirás, depurarás y gestionarás tu código de forma eficiente. Aunque Dart se puede escribir en cualquier editor de texto plano, utilizar un **IDE (Entorno de Desarrollo Integrado)** o un editor de código moderno con las extensiones adecuadas transforma radicalmente la experiencia gracias al autocompletado inteligente, la detección de errores en tiempo real y la ejecución integrada.

En el ecosistema Dart, existen dos opciones principales y ampliamente adoptadas por la comunidad: **Visual Studio Code** y los entornos de **JetBrains (Android Studio o IntelliJ IDEA)**.

### Opción 1: Visual Studio Code (Recomendado)

Visual Studio Code (VS Code) es un editor ligero, gratuito y altamente extensible. Es la opción preferida por la mayoría de los desarrolladores de Dart debido a su velocidad y su excelente integración.

#### Paso 1: Descarga e instalación

Si aún no lo tienes, descarga e instala la versión correspondiente a tu sistema operativo desde el sitio web oficial: `code.visualstudio.com`.

#### Paso 2: Instalar la extensión oficial de Dart

1. Abre VS Code.
2. Dirígete al menú de **Extensiones** en la barra lateral izquierda (o presiona `Ctrl + Shift + X` en Windows/Linux, `Cmd + Shift + X` en macOS).
3. En la barra de búsqueda superior, escribe **"Dart"**.
4. Busca la extensión oficial desarrollada por `Dart Code` y haz clic en el botón **Install** (Instalar).

```text
+-------------------------------------------------------------+
|  File  Edit  Selection  View  Go  Run  Terminal  Help       |
+-------------------------------------------------------------+
| (x) |  EXTENSIONS: MARKETPLACE                              |
|  #  |  +-------------------------------------------------+  |
|     |  | dart                                            |  |
|     |  +-------------------------------------------------+  |
|     |  Dart                                                 |
|     |  [ Dart Code ] [ Install ] v3.xx.x                    |
|     |  Language support and debugger for Dart.              |
+-----+-------------------------------------------------------+

```

> **Consejo de productividad:** Al instalar la extensión de Dart, VS Code habilitará automáticamente herramientas como *Linter* (que analiza tu código en busca de malas prácticas), formateo automático al guardar el archivo y soporte para la ejecución directa de programas con la tecla `F5`.

### Opción 2: Android Studio / IntelliJ IDEA

Si prefieres un entorno de desarrollo más robusto y pesado, las herramientas de JetBrains ofrecen una integración nativa profunda con refactorizaciones avanzadas y herramientas de inspección de memoria muy completas.

#### Paso 1: Instalar el IDE

Descarga e instala **Android Studio** (común si planeas desarrollar aplicaciones móviles en el futuro) o **IntelliJ IDEA Community/Ultimate Edition** desde sus respectivos sitios oficiales.

#### Paso 2: Configurar el complemento de Dart

1. Abre el IDE.
2. En la pantalla de bienvenida, selecciona **Plugins** en el menú izquierdo (si ya tienes un proyecto abierto, ve a `Settings` o `Preferences` -> `Plugins`).
3. Selecciona la pestaña **Marketplace** y busca **"Dart"**.
4. Haz clic en **Install**. El IDE te solicitará reiniciarse para aplicar los cambios.

### Herramientas adicionales del ecosistema

Al configurar tu entorno, es valioso conocer dos herramientas que el SDK instala por defecto y que se integran directamente con los editores mencionados:

#### Dart DevTools

Es una suite de herramientas de depuración y rendimiento basada en el navegador web. Te permite inspeccionar el estado de la aplicación, evaluar el rendimiento del recolector de basura, examinar la red y realizar un seguimiento exhaustivo del uso de la memoria. Puedes lanzarla directamente desde tu editor cuando un programa está en ejecución.

#### Dart Analysis Server

Es un servicio en segundo plano que se ejecuta automáticamente en tu editor. Es el encargado de leer tu código constantemente para ofrecerte:

* **Code Completion (IntelliSense):** Sugerencias inteligentes a medida que escribes.
* **Quick Fixes:** Soluciones automáticas sugeridas (presionando `Ctrl + .` o `Cmd + .`) cuando cometes un error de sintaxis o violas una regla del lenguaje.

Una vez que tu editor de preferencia esté configurado con su respectiva extensión, tu entorno estará completamente listo para crear y ejecutar proyectos de Dart de forma profesional.

## 1.4 Tu primer programa: Hola Mundo

Ha llegado el momento de escribir, comprender y ejecutar tu primer programa funcional en Dart. Tradicionalmente, el primer paso al aprender cualquier lenguaje de programación es el clásico "Hola Mundo", un script sencillo que sirve para comprobar que todo el entorno y el compilador están perfectamente sincronizados.

A diferencia de otros lenguajes que requieren configuraciones complejas de clases o plantillas extensas sólo para mostrar un texto, Dart mantiene una estructura limpia, directa y fácil de leer.

### Creación del archivo

1. Abre tu editor de código (como Visual Studio Code).
2. Crea un archivo nuevo y nómbralo `hola_mundo.dart`.

> **Regla de estilo:** En Dart, por convención oficial, todos los nombres de los archivos deben escribirse en minúsculas y, si contienen varias palabras, se separan mediante guiones bajos (`snake_case`).

### Escribiendo el código

Introduce las siguientes líneas dentro de tu archivo `hola_mundo.dart`:

```dart
void main() {
  print('¡Hola, Mundo desde Dart!');
}

```

### Anatomía del código paso a paso

Aunque son pocas líneas, este programa contiene los bloques de construcción fundamentales de cualquier aplicación en Dart. Vamos a analizar cada elemento:

* **`void`**: Es una palabra clave que indica el tipo de retorno de la función. En este caso, `void` (vacío) significa que la función realiza una acción pero no devuelve ningún valor numérico, de texto o de otro tipo de dato al finalizar.
* **`main()`**: Es la función más importante de tu código. En Dart, `main` representa el **punto de entrada obligatorio** de cualquier aplicación. El compilador y la máquina virtual buscan específicamente esta función para saber exactamente dónde comenzar a ejecutar las instrucciones. Los paréntesis `()` indican que es una función y que, de momento, no recibe parámetros externos.
* **Las llaves `{ }`**: Delimitan el cuerpo de la función. Todo el código que se encuentre atrapado entre la llave de apertura y la de cierre será lo que se ejecute cuando el programa se ponga en marcha.
* **`print(...)`**: Es una función integrada de la biblioteca central de Dart. Su único propósito es tomar el contenido que le pases entre los paréntesis y mostrarlo en la consola del sistema o terminal de salida.
* **Las comillas simples `' '`**: Se utilizan para definir una cadena de texto plano (*String*). En Dart puedes usar tanto comillas simples como dobles (`" "`), pero la guía de estilo oficial del lenguaje recomienda priorizar el uso de comillas simples para mantener la consistencia visual en el código.
* **El punto y coma `;`**: Al final de la instrucción `print`, el uso del punto y coma es **estrictamente obligatorio**. A diferencia de lenguajes como JavaScript o Python, omitir un punto y coma en Dart provocará un error de compilación inmediato. Le indica al analizador que esa línea de instrucción específica ha terminado.

### Ejecución del programa

Para ver tu código en acción, debes utilizar la interfaz de línea de comandos (CLI) de Dart que se instaló con el SDK.

1. Abre la terminal integrada de tu editor de código o la terminal de tu sistema operativo.
2. Asegúrate de navegar hasta la carpeta exacta donde guardaste el archivo `hola_mundo.dart` (usando el comando `cd`).
3. Ejecuta el siguiente comando:

```bash
dart run hola_mundo.dart

```

El subcomando `run` le ordena a la máquina virtual de Dart que compile en memoria (usando el modo JIT rápido) y ejecute el archivo indicado de manera inmediata.

Si todo está bien configurado, verás la salida directamente en tu terminal:

```text
¡Hola, Mundo desde Dart!

```

¡Felicidades! Has programado y ejecutado con éxito tu primera línea de código en Dart. Tu entorno de desarrollo está completamente validado y listo para afrontar estructuras de software mucho más avanzadas.

## Resumen del capítulo

En este primer capítulo, hemos sentado las bases del ecosistema de Dart:

* **Descubrimos qué es Dart:** Un lenguaje moderno, fuertemente tipado y de código abierto desarrollado por Google, diseñado para el desarrollo multiplataforma eficiente.
* **Entendimos su arquitectura:** La versatilidad de combinar la compilación **JIT** (para desarrollo rápido con *Hot Reload*) y la compilación **AOT** (para un rendimiento óptimo nativo en producción).
* **Preparamos las herramientas:** Instalamos con éxito el SDK de Dart en el sistema operativo y configuramos un entorno de desarrollo profesional utilizando extensiones especializadas en editores de código.
* **Escribimos código real:** Analizamos la estructura del punto de entrada obligatorio de Dart (`void main()`) y aprendimos a ejecutar scripts directamente desde la terminal mediante el comando `dart run`.

Con el entorno listo y los conceptos iniciales claros, estás preparado para profundizar en el núcleo del lenguaje y descubrir cómo procesa y almacena la información en la memoria del dispositivo.
