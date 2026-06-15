Para dominar por completo el comportamiento de red en `requests`, es necesario descender un peldaño en su arquitectura y explorar los adaptadores de transporte. Representados por la clase `HTTPAdapter`, estos componentes actúan como el motor interno que conecta la interfaz de alto nivel de la biblioteca con el control de bajo nivel de `urllib3`. En este capítulo, aprenderás a tomar el control absoluto sobre la gestión del tráfico HTTP. Descubrirás cómo implementar estrategias avanzadas de reintentos automáticos con esperas exponenciales, optimizar el pool de conexiones TCP para entornos concurrentes multi-hilo y montar estos adaptadores en tus sesiones de forma quirúrgica.

## 14.1. Qué son los HTTPAdapters

Los adaptadores de transporte, representados en la biblioteca por la clase `HTTPAdapter`, son el puente de comunicación interno entre la interfaz de alto nivel de `requests` y la biblioteca de red de bajo nivel `urllib3`.

Cuando ejecutas un comando sencillo como `requests.get()`, la biblioteca no maneja directamente los sockets de red ni el protocolo TCP. En su lugar, delega toda la lógica de conectividad, gestión de conexiones de red y configuración de la transmisión de datos a un objeto adaptador.

### Arquitectura interna de una petición

Para entender la utilidad de un `HTTPAdapter`, es necesario visualizar cómo se estructuran las capas de abstracción dentro de `requests`. La interfaz de usuario orientada a objetos interactúa con el adaptador, y este a su vez interactúa con el motor de red.

```text
+-------------------------------------------------------+
|                    requests.Session                   |
|  (Maneja cookies, cabeceras globales, autenticación)  |
+-------------------------------------------------------+
                           |
                           v
+-------------------------------------------------------+
|             requests.adapters.HTTPAdapter             |
|   (Configura reintentos, tamaño del pool, timeouts)   |
+-------------------------------------------------------+
                           |
                           v
+-------------------------------------------------------+
|                        urllib3                        |
|        (Gestiona Sockets TCP, Pool de Conexiones)     |
+-------------------------------------------------------+

```

Por defecto, cada objeto `Session` de `requests` viene configurado de manera automática con dos adaptadores integrados: uno para gestionar el protocolo `http://` y otro para el protocolo `https://`.

### Responsabilidades principales de un HTTPAdapter

El `HTTPAdapter` encapsula configuraciones críticas orientadas al rendimiento y la resiliencia de la red, actuando en tres áreas fundamentales:

* **Gestión del Pool de Conexiones (`ConnectionPool`):** Controla cuántas conexiones TCP simultáneas hacia un mismo host se mantienen abiertas y reutilizables para evitar la sobrecarga de crear nuevas conexiones en cada petición.
* **Estrategia de Reintentos (`Retries`):** Define el comportamiento del cliente cuando una petición falla debido a problemas de conectividad o errores específicos del servidor, permitiendo reintentar la solicitud de forma transparente.
* **Traducción de Datos:** Se encarga de transformar los objetos `PreparedRequest` generados por `requests` en llamadas que el gestor de conexiones de `urllib3` pueda procesar, y posteriormente empaqueta la respuesta de bajo nivel en un objeto `Response` de Python.

### Inspección del comportamiento por defecto

Puedes comprobar cómo una sesión aloja y mapea internamente estos adaptadores inspeccionando la propiedad `.adapters` de una sesión estándar. El siguiente fragmento de código ilustra cómo acceder a ellos:

```python
import requests

# Creamos una sesión estándar
sesion = requests.Session()

# Inspeccionamos los adaptadores registrados por defecto
for protocolo, adaptador in sesion.adapters.items():
    print(f"Protocolo: {protocolo} -> Tipo de Adaptador: {type(adaptador)}")

```

Al extender o personalizar un `HTTPAdapter`, los desarrolladores obtienen un control milimétrico sobre el comportamiento del flujo de red de su aplicación sin alterar la sintaxis limpia y declarativa que caracteriza a `requests`.

## 14.2. Implementación de reintentos automáticos

En entornos de red reales, las peticiones HTTP pueden fallar debido a problemas transitorios: caídas momentáneas de la conectividad, fluctuaciones de la señal Wi-Fi, saturación temporal del servidor (códigos de estado 503) o límites de tasa de peticiones superados (códigos de estado 429).

Por defecto, la biblioteca `requests` no reintenta una petición si esta falla. Sin embargo, configurar reintentos de forma manual mediante bloques `try/except` y bucles `while` añade mucha complejidad al código. La forma elegante y robusta de resolver esto es mediante la integración de un `HTTPAdapter` personalizado junto con el objeto `urllib3.util.Retry`.

### El objeto Retry de urllib3

Para definir la estrategia de reintentos, `requests` se apoya en la clase `Retry` de la biblioteca subyacente `urllib3`. Esta clase permite configurar con precisión quirúrgica el comportamiento del cliente ante los fallos a través de varios parámetros clave:

* **`total`**: El número máximo de reintentos permitidos. Si se supera este límite, se lanzará una excepción `MaxRetryError` (envuelta por `requests` en una `ConnectionError`).
* **`backoff_factor`**: Permite aplicar un retraso exponencial entre reintentos para evitar saturar el servidor remoto (técnica conocida como *exponential backoff*). La fórmula del tiempo de espera en segundos es:

$$\text{espera} = \text{backoff\_factor} \times 2^{(\text{número de reintentos realizados} - 1)}$$

Por ejemplo, si el factor es `1`, los retrasos entre intentos sucesivos serán de 0.5s, 1s, 2s, 4s, etc.

* **`status_forcelist`**: Una lista o conjunto de códigos de estado HTTP numéricos ante los cuales se debe forzar un reintento. Es común incluir aquí errores de servidor (`500`, `502`, `503`, `504`) y la saturación de cuota (`429`).
* **`raise_on_status`**: Un booleano (`True` por defecto). Si se establece en `False`, cuando se agoten todos los reintentos permitidos debido a un código de estado de la lista anterior, el adaptador devolverá el objeto `Response` final en lugar de lanzar una excepción de red.

### Flujo de ejecución con reintentos automáticos

Cuando se acopla una estrategia de reintentos al adaptador de transporte, el flujo de una petición fallida cambia drásticamente, delegando la resiliencia por completo a la capa de abstracción del adaptador:

```text
[Cliente: session.get()] ---> [HTTPAdapter] ---> [Servidor Web]
                                   ^                  |
                                   |            (Fallo: 503 / Red)
                                   |                  |
                        (¿Quedan reintentos?)         v
                                   |------------ [Objeto Retry]
                                   |        (Calcula Backoff Factor)
                                   v
                         [Espera de X segundos]

```

### Implementación práctica paso a paso

Para aplicar los reintentos automáticos, debemos instanciar el objeto `Retry`, pasárselo al constructor del `HTTPAdapter` mediante el argumento `max_retries`, y finalmente montar (*mount*) dicho adaptador en nuestra sesión activa.

A continuación, se detalla un script completo y funcional que implementa esta arquitectura protectora:

```python
import requests
from requests.adapters import HTTPAdapter
from urllib3.util import Retry

# 1. Definir la estrategia de reintentos
estrategia_reintentos = Retry(
    total=4,                        # Intentar 4 veces en total antes de rendirse
    backoff_factor=1,               # Esperas: 0.5s, 1s, 2s, 4s...
    status_forcelist=[429, 500, 502, 503, 504], # Reintentar ante estos errores HTTP
    raise_on_status=True            # Lanzar excepción si el último intento sigue fallando
)

# 2. Instanciar el adaptador de transporte con nuestra estrategia
adaptador_resiliente = HTTPAdapter(max_retries=estrategia_reintentos)

# 3. Crear la sesión y asociar el adaptador a los protocolos deseados
sesion = requests.Session()
sesion.mount("http://", adaptador_resiliente)
sesion.mount("https://", adaptador_resiliente)

# 4. Realizar peticiones protegidas
try:
    print("Enviando petición a la API...")
    # Si este endpoint ficticio devuelve un error 503, el adaptador reintentará solo
    respuesta = sesion.get("https://api.ejemplo.com/datos-criticos")
    print(f"Petición exitosa. Código de estado: {respuesta.status_code}")
except requests.exceptions.ConnectionError as e:
    print(f"Error crítico de conexión: Se agotaron todos los reintentos configurados.")
    print(f"Detalles técnicos: {e}")

```

Gracias a este patrón de diseño, tu código de producción se vuelve significativamente más inmune a los microcortes de red y a los problemas transitorios de disponibilidad de los servidores de terceros sin necesidad de ensuciar la lógica de negocio con controles de flujo manuales.

## 14.3. Configuración del pool de conexiones

Cada vez que tu aplicación realiza una petición HTTP a un servidor, se debe establecer una conexión TCP subyacente. Si la petición utiliza HTTPS, también se debe realizar una negociación SSL/TLS. Este proceso (conocido como *handshake*) consume tiempo y recursos de cómputo tanto en el cliente como en el servidor.

Como aprendiste en el Capítulo 12, las sesiones de `requests` optimizan esto reutilizando conexiones activas a través del mecanismo *Keep-Alive*. Lo que ocurre entre bastidores es que el `HTTPAdapter` gestiona un **pool de conexiones** (un almacén o caché de sockets TCP abiertos) provisto por `urllib3`. Por defecto, este pool tiene limitaciones de tamaño que pueden convertirse en un cuello de botella en aplicaciones multi-hilo (multithreading) o de alto rendimiento.

### Parámetros de control del pool

Al instanciar un `HTTPAdapter`, disponemos de dos argumentos clave para configurar la concurrencia y la persistencia de los sockets de red hacia un mismo host:

* **`pool_connections`**: Determina el número de pools de conexiones independientes que el adaptador mantendrá en memoria simultáneamente. Esencialmente, define a cuántos *hosts* (dominios diferentes) podemos mantener conectados de forma concurrente mediante conexiones reutilizables. Su valor por defecto es `10`.
* **`pool_maxsize`**: Especifica el número máximo de conexiones TCP abiertas que se guardarán dentro de *cada* pool individual (es decir, por cada host único). Su valor por defecto es `10`.

### El peligro del agotamiento del pool en entornos concurrentes

Si estás desarrollando un script que utiliza hilos (`threading`) para realizar peticiones simultáneas al mismo dominio (por ejemplo, descargando 20 imágenes a la vez de `[https://imagenes.ejemplo.com](https://imagenes.ejemplo.com)`) y mantienes el `pool_maxsize` por defecto en `10`, ocurrirá una saturación del pool.

Cuando el hilo número 11 intente realizar una petición, no encontrará ninguna conexión libre en el pool. Por defecto, `urllib3` creará una nueva conexión de usar y tirar para ese hilo excedente, pero al terminar la petición, **la destruirá de inmediato** en lugar de guardarla, perdiendo todo el beneficio del rendimiento. Peor aún, si configuras explícitamente el bloqueo del pool, tus hilos se detendrán a esperar una conexión libre, ralentizando la ejecución.

### Implementación de un pool optimizado para alta concurrencia

Para evitar la degradación del rendimiento en aplicaciones concurrentes, debes dimensionar el tamaño del pool de modo que coincida con el número máximo de hilos trabajadores (*workers*) que atacarán al mismo servidor de manera simultánea.

A continuación, se muestra cómo configurar un adaptador de transporte para un entorno con 25 hilos concurrentes apuntando hacia una misma API:

```python
import threading
import requests
from requests.adapters import HTTPAdapter

# Definimos el nivel de concurrencia de nuestra aplicación
NUMERO_DE_HILOS = 25

# Configuramos el adaptador incrementando el tamaño del pool para el host objetivo
adaptador_concurrente = HTTPAdapter(
    pool_connections=5,       # Mantener conexiones vivas para hasta 5 dominios distintos
    pool_maxsize=NUMERO_DE_HILOS  # Permitir hasta 25 conexiones TCP simultáneas por dominio
)

# Inicializamos la sesión y le montamos el adaptador configurado
sesion = requests.Session()
sesion.mount("https://", adaptador_concurrente)

# Función que ejecutarán los hilos de forma simultánea
def realizar_tarea(id_hilo):
    url = f"https://api.ejemplo.com/recurso/{id_hilo}"
    try:
        # Cada hilo tomará y devolverá una conexión del pool eficientemente
        respuesta = sesion.get(url, timeout=5)
        print(f"[Hilo {id_hilo}] Código: {respuesta.status_code}")
    except requests.RequestException as e:
        print(f"[Hilo {id_hilo}] Error: {e}")

# Creación y lanzamiento de los hilos concurrentes
hilos = []
for i in range(NUMERO_DE_HILOS):
    hilo = threading.Thread(target=realizar_tarea, args=(i,))
    hilos.append(hilo)
    hilo.start()

# Esperar a que todos los hilos terminen
for hilo in hilos:
    hilo.join()

print("Todas las peticiones concurrentes han finalizado utilizando el pool.")

```

Al ajustar el tamaño del pool de conexiones para que se adapte a las necesidades de tu arquitectura de hilos, garantizas que ninguna conexión TCP se descarte prematuramente, exprimiendo al máximo el ancho de banda disponible y reduciendo drásticamente la latencia de tu aplicación.

## 14.4. Montaje de adaptadores en sesiones

El último paso para consolidar el control sobre nuestra capa de transporte es el proceso de vinculación. Crear un `HTTPAdapter` con pools optimizados o estrategias de reintentos avanzados no tiene ningún efecto real hasta que no se le indica formalmente a la sesión a qué peticiones debe aplicar esas reglas. Esta asociación se realiza mediante el método `mount()` del objeto `Session`.

El método `mount()` actúa como un enrutador de tráfico interno. Permite registrar un adaptador de transporte específico para un prefijo de URL determinado, interceptando cualquier petición que coincida con dicho patrón y haciéndola pasar a través de las configuraciones del adaptador vinculado.

### El mecanismo de prefijos y enrutamiento

Cuando se invoca `sesion.mount(prefix, adapter)`, `requests` evalúa las llamadas HTTP basándose en el principio de coincidencia de prefijos por longitud (el prefijo más específico tiene prioridad).

Esto nos otorga una flexibilidad excepcional, permitiendo definir políticas globales para todo internet, o políticas ultra-específicas con configuraciones drásticamente distintas para APIs concretas dentro del mismo script.

```text
Petición a: https://api.pagos.com/v1/charge
       |
       +---> ¿Coincide con prefijo específico "https://api.pagos.com"? 
       |        |---> SÍ: Usa Adaptador de Pagos (Poco tráfico, 5 reintentos)
       |
       +---> ¿Coincide con prefijo general "https://"?
                |---> SÍ: Usa Adaptador General (Pool grande, 1 reintento)

```

### Implementación práctica de montajes múltiples

A continuación se presenta un caso de uso avanzado de producción. Configuraremos una sesión única con tres comportamientos de red completamente diferenciados conviviendo en armonía:

1. Un adaptador general para peticiones HTTP estándar sin reintentos.
2. Un adaptador de alta resiliencia para una API de pagos crítica que exige reintentos automáticos estrictos ante fallos.
3. Un adaptador optimizado para un microservicio local de imágenes que requiere un pool de conexiones masivo debido a su alta concurrencia.

```python
import requests
from requests.adapters import HTTPAdapter
from urllib3.util import Retry

# 1. Creamos la sesión centralizadora
sesion = requests.Session()

# ==========================================
# CONFIGURACIÓN 1: Adaptador General (HTTPS)
# ==========================================
adaptador_general = HTTPAdapter(pool_connections=10, pool_maxsize=10)
sesion.mount("https://", adaptador_general)

# ==========================================
# CONFIGURACIÓN 2: API de Pagos Crítica
# ==========================================
# Exige máxima resiliencia ante errores intermitentes de servidor
estrategia_pagos = Retry(total=5, backoff_factor=2, status_forcelist=[500, 502, 503, 504])
adaptador_pagos = HTTPAdapter(max_retries=estrategia_pagos)
# Montaje ultra-específico: solo afectará a este dominio de pagos
sesion.mount("https://api.pagos.com", adaptador_pagos)

# ==========================================
# CONFIGURACIÓN 3: Microservicio de Imágenes
# ==========================================
# Requiere un pool muy amplio para transferencia masiva y concurrente de binarios
adaptador_imagenes = HTTPAdapter(pool_connections=1, pool_maxsize=100)
# Montaje específico para el servidor local de recursos multimedia
sesion.mount("https://imagenes.local.interno", adaptador_imagenes)

# ==========================================
# PRUEBA DE RUTEO INTERNO
# ==========================================
# Usa adaptador_pagos (Garantiza reintentos automáticos si falla el servidor)
res_pagos = sesion.post("https://api.pagos.com/v1/charge", json={"monto": 100})

# Usa adaptador_imagenes (Se beneficia de un canal TCP optimizado para 100 hilos)
res_img = sesion.get("https://imagenes.local.interno/avatar.png")

# Usa adaptador_general (No aplica reintentos de pagos ni el pool masivo de imágenes)
res_google = sesion.get("https://www.google.com")

```

El orden en el que se ejecutan las instrucciones `.mount()` no afecta a la resolución del ruteo. `requests` analizará internamente las cadenas de texto de los prefijos registrados y siempre enviará la petición al adaptador que mejor y de forma más específica encaje con la URL solicitada.

## Resumen del capítulo

En el **Capítulo 14: Adaptadores de Transporte**, hemos explorado los cimientos de la arquitectura de conectividad de la biblioteca `requests`:

* **El rol del HTTPAdapter:** Descubrimos que actúa como la pieza intermedia indispensable que conecta la API simplificada de `requests` con las capacidades de red de bajo nivel controladas por `urllib3`.
* **Resiliencia con Reintentos:** Aprendimos a integrar el objeto `Retry` de `urllib3` dentro de un adaptador para dotar a nuestras aplicaciones de tolerancia a fallos transitorios de red mediante *backoff* exponencial de manera totalmente transparente.
* **Optimización de Concurrency:** Analizamos cómo dimensionar adecuadamente el pool de conexiones (`pool_connections` y `pool_maxsize`) para evitar cuellos de botella y pérdida de rendimiento al realizar peticiones masivas en entornos multi-hilo.
* **Enrutamiento selectivo:** Finalmente, dominamos el uso del método `mount()` en objetos `Session` para aplicar políticas de red quirúrgicas e independientes mapeadas a dominios o protocolos específicos según las necesidades de nuestro sistema.
