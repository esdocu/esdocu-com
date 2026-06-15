Antes de interactuar con APIs y servidores web en Python, es indispensable preparar un entorno de desarrollo robusto. Este capítulo aborda de forma práctica la puesta a punto de la biblioteca `requests`. Comenzaremos revisando los requisitos de red y software necesarios, para luego guiarte paso a paso en el proceso de instalación estándar utilizando el gestor `pip` y la creación de entornos virtuales aislados. Asimismo, exploraremos alternativas avanzadas como la compilación directa desde el código fuente y, finalmente, aprenderemos a ejecutar pruebas de diagnóstico para certificar que la biblioteca está lista y operativa para realizar tus primeras peticiones HTTP en la red.

## 1.1. Requisitos previos

Para poder utilizar la biblioteca `requests` de manera óptima, tu sistema debe contar con un entorno base de Python correctamente configurado. Dado que `requests` es una biblioteca de terceros (no viene incluida en la instalación estándar de Python), es fundamental asegurarse de cumplir con las dependencias de software y de red antes de ejecutar el comando de instalación.

A continuación, se detallan los tres componentes esenciales que forman los requisitos previos.

### 1. Interprete de Python

`requests` es compatible con las versiones modernas de Python 3. Aunque las versiones antiguas de la biblioteca daban soporte a Python 2.7, las versiones actuales requieren obligatoriamente Python 3.7 o superior.

Antes de avanzar, es recomendable verificar qué versión tienes instalada en tu sistema abriendo una terminal o línea de comandos y ejecutando alguno de los siguientes comandos:

```bash
python --version

```

O en sistemas basados en Unix/Linux/macOS donde coexistan varias versiones:

```bash
python3 --version

```

Deberías obtener una respuesta similar a esta:

```text
Python 3.10.12

```

### 2. Administrador de paquetes (pip)

Para el siguiente apartado del libro (Instalación mediante pip), necesitarás tener instalado `pip`, que es el gestor de paquetes oficial de Python. En la gran mayoría de las instalaciones modernas de Python, `pip` se incluye de forma automática.

Puedes comprobar su disponibilidad y su versión ejecutando:

```bash
pip --version

```

o bien:

```bash
python -m pip --version

```

### 3. Conexión a Internet y entorno de red

La biblioteca `requests` interactúa directamente con la arquitectura de red de tu sistema operativo y se apoya en una biblioteca interna de Python llamada `urllib3` para gestionar el ciclo de vida de las conexiones.

Para completar el flujo de instalación y realizar las primeras pruebas, tu entorno debe permitir:

* Acceso saliente al dominio `pypi.org` para descargar la biblioteca.
* Resolución de nombres de dominio (DNS) funcional.
* Permisos en el cortafuegos (firewall) local para que el intérprete de Python pueda abrir sockets de red salientes.

El siguiente diagrama de bloques en texto plano ilustra cómo se estructuran estos requisitos previos en tu sistema antes de la llegada de `requests`:

```text
+--------------------------------------------------------+
|                  TU SISTEMA OPERATIVO                  |
|  (Linux, macOS, Windows)                               |
+--------------------------------------------------------+
                           |
                           v
+--------------------------------------------------------+
|               ENTORNO BASE DE PYTHON                   |
|                                                        |
|  +-------------------+        +---------------------+  |
|  | Intérprete Python |        | Gestor de Paquetes  |  |
|  | (Versión >= 3.7)  |        | (pip)               |  |
|  +-------------------+        +---------------------+  |
+--------------------------------------------------------+
                           |
                           v
+--------------------------------------------------------+
|                  CONEXIÓN A INTERNET                   |
|  (Acceso a PyPI / DNS / Sockets de red habilitados)    |
+--------------------------------------------------------+

```

Si tu terminal responde correctamente a los comandos de verificación de Python y pip, y cuentas con acceso a la red, tu entorno cumple con todos los requisitos previos necesarios para comenzar con el proceso de instalación.

## 1.2. Instalación mediante pip

El método estándar, recomendado y más eficiente para incorporar la biblioteca `requests` a tu entorno de desarrollo es a través de `pip`, el gestor de paquetes por defecto de Python. Este método se conecta directamente al repositorio oficial PyPI (Python Package Index), descarga la versión más estable y configura de forma automática las dependencias internas que la biblioteca necesita para funcionar (como `urllib3`, `charset_normalizer`, `idna` y `certifi`).

### 1. Instalación básica en el sistema o usuario

Para realizar una instalación limpia de la última versión estable de `requests`, abre la terminal de tu sistema operativo (Línea de comandos o PowerShell en Windows, Terminal en macOS o Linux) y ejecuta el siguiente comando:

```bash
pip install requests

```

En sistemas operativos de tipo Unix (Linux/macOS) donde el comando `pip` pueda estar ligado a una versión antigua de Python 2, es altamente recomendable forzar el uso de Python 3 utilizando la sintaxis de módulo:

```bash
python3 -m pip install requests

```

La salida en tu terminal mostrará el proceso de descarga y la confirmación de que el paquete se ha añadido correctamente junto con sus dependencias:

```text
Collecting requests
  Downloading requests-2.31.0-py3-none-any.whl (62 kB)
Collecting charset-normalizer<4,>=2
  Downloading charset_normalizer-3.3.2-cp310-cp310-manylinux_2_17_x86_64.whl (174 kB)
Collecting idna<4,>=2.5
  Downloading idna-3.7-py3-none-any.whl (61 kB)
Collecting urllib3<3,>=1.21.1
  Downloading urllib3-2.2.1-py3-none-any.whl (121 kB)
Collecting certifi>=2017.4.17
  Downloading certifi-2024.2.2-py3-none-any.whl (163 kB)
Installing collected packages: urllib3, idna, charset-normalizer, certifi, requests
Successfully installed certifi-2024.2.2 charset-normalizer-3.3.2 idna-3.7 requests-2.31.0 urllib3-2.2.1

```

### 2. Instalación de versiones específicas

Si estás trabajando en un proyecto heredado o necesitas asegurar la compatibilidad con un entorno de producción que exige una versión concreta de `requests`, puedes indicarle a `pip` el operador de asignación exacta `==`:

```bash
pip install requests==2.28.2

```

### 3. Actualización de la biblioteca

Las bibliotecas de red reciben actualizaciones constantes para corregir vulnerabilidades de seguridad o mejorar el rendimiento. Si ya tienes una versión previa de `requests` y deseas actualizarla a la última versión disponible en PyPI, utiliza la bandera `--upgrade` o `-U`:

```bash
pip install --upgrade requests

```

### 4. Flujo de instalación dentro de un Entorno Virtual (Recomendado)

En el desarrollo profesional con Python, instalar paquetes de forma global en el sistema operativo puede generar conflictos de versiones entre diferentes proyectos. Por ello, la buena práctica dicta aislar la instalación de `requests` utilizando un entorno virtual (`venv`).

El flujo metodológico completo en tu terminal sigue este orden secuencial:

```text
1. Crear entorno virtual  --->  2. Activar entorno virtual  --->  3. Instalar requests con pip
   (python -m venv env)          (source env/bin/activate)         (pip install requests)

```

Para implementarlo en tu sistema, ejecuta los siguientes comandos según tu plataforma:

**En Linux / macOS:**

```bash
# 1. Crear el entorno virtual llamado 'env'
python3 -m venv env

# 2. Activar el entorno virtual
source env/bin/activate

# 3. Instalar requests de forma aislada
pip install requests

```

**En Windows (PowerShell):**

```powershell
# 1. Crear el entorno virtual llamado 'env'
python -m venv env

# 2. Activar el entorno virtual
.\env\Scripts\Activate.ps1

# 3. Instalar requests de forma aislada
pip install requests

```

Una vez activado el entorno virtual, notarás que el prompt de tu terminal se antepone con el prefijo `(env)`. Cualquier comando `pip install` ejecutado a partir de ese momento confinará la biblioteca `requests` estrictamente dentro de la carpeta de tu proyecto, manteniendo el sistema operativo limpio y ordenado.

## 1.3. Instalación desde código fuente

Aunque la instalación mediante `pip` es la opción más rápida y común, existen escenarios avanzados donde se vuelve necesario instalar la biblioteca `requests` directamente desde su código fuente. Este método es útil si trabajas en un entorno de red altamente restrictivo (sin acceso a internet o a PyPI), si necesitas desplegar un parche de código personalizado, o si deseas colaborar activamente en el desarrollo de la propia biblioteca.

El código fuente oficial de `requests` se aloja de forma pública en un repositorio de GitHub gestionado por la comunidad y la organización *Kenneth Reitz* / *Psf (Python Software Foundation)*.

### Prerrequisitos para este método

Antes de proceder, asegúrate de cumplir con los siguientes elementos en tu máquina:

* Tener el sistema de control de versiones `git` instalado (opcional, pero altamente recomendado para clonar el repositorio).
* Acceso a las herramientas de empaquetado básicas de Python, las cuales puedes asegurar ejecutando:

```bash
pip install --upgrade setuptools wheel

```

### Procedimiento paso a paso

Para compilar e instalar `requests` de forma manual, debes realizar una secuencia de tres pasos básicos: descargar el código, ingresar al directorio raíz del proyecto y compilar/instalar el paquete mediante Python.

#### Paso 1: Obtener el código fuente

Puedes descargar el repositorio directamente usando `git` desde tu terminal:

```bash
git clone https://github.com/psf/requests.git

```

> **Alternativa sin Git:** Si no dispones de Git en tu entorno de red, puedes ingresar desde un navegador web a la dirección `[https://github.com/psf/requests](https://github.com/psf/requests)`, hacer clic en el botón **Code** y seleccionar **Download ZIP**. Posteriormente, deberás descomprimir el archivo tarball o `.zip` en una carpeta local de tu disco duro.

#### Paso 2: Navegar al directorio raíz

Una vez descargado o descomprimido el proyecto, abre tu terminal y muévete dentro de la carpeta raíz que contiene el archivo de configuración de la instalación (usualmente llamado `setup.py` o `pyproject.toml`):

```bash
cd requests

```

#### Paso 3: Ejecutar la instalación

Una vez dentro de la carpeta, puedes indicarle a Python que compile e instale el paquete en tu entorno. En las versiones modernas de Python, la mejor práctica es indicarle a `pip` que use el directorio actual (representado por un punto `.`) para realizar la instalación local:

```bash
pip install .

```

Si estás realizando modificaciones en el código de `requests` y deseas que los cambios se reflejen inmediatamente en tus scripts de prueba sin necesidad de reinstalar el paquete cada vez, añade la bandera `-e` (modo editable / *editable mode*):

```bash
pip install -e .

```

### El flujo del código fuente al entorno

El siguiente diagrama conceptual ilustra el flujo lógico que experimentan los archivos desde el servidor remoto hasta quedar completamente integrados como un módulo ejecutable dentro de los directorios de tu intérprete de Python local:

```text
+---------------------------------------+
|  Repositorio Oficial en GitHub        |
|  (github.com/psf/requests)            |
+---------------------------------------+
                    |
                    | [ Comando: git clone ]
                    v
+---------------------------------------+
|  Directorio Local Temporal            |
|  (/tu_ruta/requests/)                 |
|  Contiene: setup.py, pyproject.toml.. |
+---------------------------------------+
                    |
                    | [ Comando: pip install . ]
                    v
+---------------------------------------+
|  Carpeta site-packages de Python      |
|  (Biblioteca lista para ser usada)    |
+---------------------------------------+

```

Al finalizar este proceso, `pip` empaquetará los archivos fuente locales y los moverá a la carpeta interna de tu entorno de Python conocida como `site-packages`. A partir de este momento, el intérprete reconocerá la biblioteca de la misma manera que si la hubieras descargado mediante la vía tradicional.

## 1.4. Verificación de la instalación

Una vez completado el proceso de instalación —ya sea a través de PyPI o directamente compilando el código fuente— el último paso es verificar que la biblioteca `requests` se haya registrado de manera correcta dentro del entorno de ejecución de Python y que esté completamente operativa para realizar peticiones en la red.

A continuación, se presentan los métodos estándar para comprobar la instalación utilizando la terminal interactiva y la ejecución de scripts mínimos.

### 1. Verificación rápida desde la línea de comandos

La forma más directa de comprobar si Python reconoce la biblioteca es intentar realizar una importación rápida utilizando la bandera `-c` (ejecutar comando) directamente desde tu terminal de comandos habitual.

Ejecuta el siguiente comando en tu terminal:

```bash
python -m requests.help

```

*(O `python3 -m requests.help` en sistemas Unix/Linux).*

Si la instalación fue exitosa, este comando interno de `requests` imprimirá en la pantalla un bloque de texto formateado en JSON con información diagnóstica detallada sobre tu entorno. La salida mostrará la versión exacta de la biblioteca, del intérprete de Python, del sistema operativo y de todas las dependencias críticas de red asociadas:

```json
{
  "platform": {
    "system": "Linux",
    "release": "6.5.0-27-generic"
  },
  "python": {
    "version": "3.10.12",
    "implementation": "CPython"
  },
  "requests": {
    "version": "2.31.0"
  },
  "system_packages": {
    "urllib3": "2.2.1",
    "charset_normalizer": "3.3.2",
    "idna": "3.7",
    "certifi": "2024.02.02"
  }
}

```

### 2. Prueba funcional mediante código

Para garantizar que la biblioteca no solo está instalada, sino que además se comunica correctamente con el exterior a través de la infraestructura de red de tu equipo, puedes realizar una pequeña prueba interactiva.

Abre el intérprete interactivo de Python escribiendo `python` (o `python3`) en tu terminal e introduce las siguientes líneas de código paso a paso:

```python
>>> import requests
>>> response = requests.get('https://api.github.com')
>>> print(response.status_code)
200

```

#### Análisis del resultado

* **`import requests`**: Si la instalación falló o no se realizó en el entorno correcto, Python arrojará inmediatamente un error del tipo `ModuleNotFoundError: No module named 'requests'`. Si el prompt avanza a la siguiente línea en silencio, la importación fue exitosa.
* **`requests.get(...)`**: Envía una petición web real a los servidores seguros de GitHub.
* **`response.status_code`**: Al imprimir esta propiedad, el servidor de destino debería devolver un código numérico **`200`**, que en el protocolo HTTP significa "OK" (Conexión exitosa). Cualquier número en el rango de los 200 confirma que tu cortafuegos, resolución DNS y la biblioteca se encuentran perfectamente sincronizados.

## Resumen del capítulo

En este primer capítulo, hemos preparado los cimientos de nuestro entorno de desarrollo para trabajar con la biblioteca `requests`. Aprendimos los siguientes conceptos clave:

* **Requisitos previos**: Confirmamos que `requests` exige un entorno moderno basado en Python 3 (versión 3.7 o superior) junto con un administrador de paquetes `pip` completamente funcional y permisos de red abiertos.
* **Instalación estándar**: Estudiamos el flujo de instalación tradicional utilizando `pip install requests`, la gestión de versiones específicas y la importancia metodológica de aislar nuestras dependencias usando entornos virtuales (`venv`).
* **Instalación avanzada**: Exploramos cómo clonar el código fuente oficial desde GitHub e instalarlo localmente en modo normal o ejecutable (`-e .`) para entornos aislados o de desarrollo interno.
* **Verificación de sanidad**: Validamos el éxito del proceso mediante herramientas de diagnóstico nativas (`requests.help`) y ejecutamos nuestra primera petición HTTP real en una sesión interactiva obteniendo una respuesta exitosa del servidor.

Con el entorno configurado y la biblioteca correctamente instalada, estás listo para dar tus primeros pasos en el envío y recepción de datos web reales, lo cual abordaremos a detalle en el próximo capítulo.
