Las peticiones de red son intrínsecamente impredecibles: un servidor congestionado, un corte de fibra óptica o un cortafuegos mal configurado pueden congelar tu aplicación de forma indefinida si no tomas el control. Por defecto, la biblioteca `requests` espera respuestas sin límite de tiempo, un comportamiento peligroso en entornos de producción.

En este capítulo aprenderás a proteger tus scripts estableciendo salvaguardas temporales. Analizaremos cómo configurar límites globales, cómo diferenciar con precisión quirúrgica entre el tiempo de conexión y el de lectura mediante tuplas, y cómo capturar las excepciones específicas para dotar a tu código de una resiliencia profesional ante fallos de red.

## 13.1. Configuración de timeouts básicos

Por defecto, la biblioteca `requests` realiza peticiones HTTP sin un límite de tiempo definido. Esto significa que si un servidor remoto deja de responder o la conexión de red queda en un limbo técnico, tu script de Python se bloqueará indefinidamente, consumiendo recursos del sistema y deteniendo la ejecución del programa.

Para solucionar esto, todas las funciones de petición de `requests` (`get()`, `post()`, `put()`, etc.) aceptan un parámetro llamado `timeout`. Este parámetro determina el tiempo máximo en segundos que la biblioteca esperará a que el servidor web complete las acciones de la red antes de interrumpir la operación.

### El peligro del comportamiento por defecto

Cuando no se especifica el parámetro `timeout`, el valor asignado internamente es `None`. Visualmente, el flujo de una petición sin límite de tiempo se comporta de la siguiente manera ante un fallo del servidor:

```text
Script Python              Servidor Inestable / Caído
     │                                 │
     │ ─────── Realiza GET ──────────> │
     │                                 │ [El servidor se congela
     │                                 │  o no responde]
     │                                 │
     X ◄────── Espera Infinita ─────── X
(El script se queda congelado aquí)

```

### Aplicando un timeout básico

Para establecer un límite de tiempo global para la petición, debes pasar un número entero o de punto flotante al parámetro `timeout`. Este valor representa los segundos máximos permitidos para toda la operación física de la solicitud.

```python
import requests

# Establecer un timeout estricto de 3.5 segundos
try:
    respuesta = requests.get('https://api.ejemplo.com/datos', timeout=3.5)
    print(f"Petición exitosa: {respuesta.status_code}")
except requests.exceptions.Timeout:
    print("La petición tardó demasiado tiempo y fue cancelada automáticamente.")

```

Si el servidor no responde dentro del umbral de los 3.5 segundos, `requests` detiene la comunicación inmediatamente y eleva una excepción de tipo `Timeout`, evitando que tu aplicación quede colgada de forma permanente.

### Reglas clave para el uso de timeouts básicos

* **Unidades:** El valor se expresa siempre en segundos (por ejemplo, `0.5` equivale a 500 milisegundos).
* **Alcance:** Al pasar un único número (como `timeout=5`), este límite se aplica de manera interna tanto al tiempo para establecer la conexión inicial con el servidor como al tiempo de espera para recibir el primer byte de datos.
* **Buenas prácticas:** En entornos de producción, **nunca** dejes peticiones sin el parámetro `timeout`. Una regla general saludable es configurar un valor ligeramente superior al tiempo de respuesta estimado del servidor, habitualmente entre 3 y 10 segundos para APIs estándar.

## 13.2. Diferencia entre conexión y lectura

Cuando configuras un valor numérico único en el parámetro `timeout` (por ejemplo, `timeout=5`), estás aplicando un límite global para dos fases completamente distintas del ciclo de vida de una petición HTTP: el tiempo de **conexión** y el tiempo de **lectura**.

Entender la frontera entre estas dos etapas es crucial para diagnosticar problemas de red y diseñar aplicaciones tolerantes a fallos, ya que un servidor puede fallar de formas muy distintas en cada una de ellas.

### El ciclo de una petición HTTP y sus límites de tiempo

Para que `requests` obtenga información de un servidor web, la comunicación pasa por dos fases secuenciales:

```text
[ Fase 1: Conexión ]                   [ Fase 2: Lectura ]
   Establecer enlace                      Esperar y descargar datos
 ───────────────────────► │ ───────────────────────────────────────────────────►
 Intentos de handshake    │ Servidor     Envío de cabeceras   El servidor envía
 TCP / negociación SSL    │ acepta el    y cuerpo de la       los bytes de la
 con el servidor remoto.  │ socket.      petición.            respuesta.

```

#### 1. Tiempo de conexión (Connect Timeout)

Es el tiempo que le toma a tu cliente de Python establecer una conexión de red con el servidor remoto. Esto incluye la resolución DNS (traducir el dominio a una dirección IP) y la creación del socket TCP (junto con el saludo o *handshake* SSL/TLS si estás usando HTTPS).

* **Cuándo falla:** Ocurre si el servidor físico está completamente apagado, la dirección IP es incorrecta, el puerto está cerrado por un cortafuegos, o si hay un problema severo de enrutamiento en la infraestructura de la red.

#### 2. Tiempo de lectura (Read Timeout)

Una vez que la conexión se ha establecido con éxito, el cliente envía la petición HTTP propiamente dicha. El tiempo de lectura mide la espera desde que el cliente termina de enviar su solicitud hasta que el servidor envía el primer byte de datos de respuesta, así como el tiempo de espera entre los bytes subsiguientes.

* **Cuándo falla:** Ocurre cuando el servidor está encendido y aceptó la conexión, pero está sobrecargado, su base de datos está respondiendo con extrema lentitud, o el proceso que genera la respuesta se quedó congelado. El servidor te "escucha", pero no te "habla" de vuelta a tiempo.

### ¿Por qué tratarlos de manera diferente?

En redes móviles o conexiones internacionales, establecer el enlace inicial puede demorar un poco más debido a la latencia física de los paquetes de datos. Sin embargo, una vez conectados, el servidor debería responder rápido.

Por el contrario, hay operaciones pesadas (como solicitar un reporte en PDF de gran tamaño o la generación de un análisis de datos en la API) en las que la conexión es instantánea, pero el procesamiento interno del servidor requiere que el cliente sea paciente y espere varios segundos antes de recibir el contenido.

Al usar un único número en `timeout`, obligas a que ambas fases compartan el mismo umbral de tolerancia, lo que te impide optimizar tu aplicación para flujos de trabajo específicos de procesamiento lento o redes inestables.

## 13.3. Configuración de timeouts en tuplas

Para lograr un control minucioso sobre el rendimiento de tus peticiones, la biblioteca `requests` permite desglosar de forma explícita los límites de tiempo de las dos fases de red analizadas en la sección anterior. En lugar de pasar un único valor numérico al parámetro `timeout`, puedes proporcionar una **tupla de dos elementos** con la estructura `(tiempo_conexion, tiempo_lectura)`.

Esta técnica evita que tu aplicación quede atrapada en esperas innecesarias si el servidor no responde al enlace inicial, permitiéndote al mismo tiempo ser flexible con servicios que requieren periodos extensos para procesar los datos.

### Sintaxis de la tupla de timeout

La tupla acepta valores enteros o de punto flotante definidos en segundos, y se estructura siguiendo estrictamente este orden:

```python
import requests

# Formato: timeout=(limite_conexion, limite_lectura)
try:
    respuesta = requests.get(
        'https://api.ejemplo.com/reporte-pesado', 
        timeout=(3.05, 27.0)
    )
    print("Datos recibidos correctamente.")
except requests.exceptions.Timeout:
    print("La operación superó uno de los límites de tiempo configurados.")

```

En este escenario, `requests` aplicará las siguientes reglas matemáticas y de red:

1. Concederá un máximo de **3.05 segundos** para resolver el DNS y establecer el *handshake* TCP/SSL con el servidor. Si el enlace no se crea en ese microperiodo, la petición se cancela.
2. Una vez conectado, le otorgará al servidor un margen de hasta **27.0 segundos** para procesar la lógica interna y comenzar a transmitir el cuerpo de la respuesta.

> **Nota sobre el estándar de conexión:** Se recomienda que el tiempo de conexión sea ligeramente superior a un múltiplo de 3 (por ejemplo, `3.05`), debido a que el temporizador interno de retransmisión TCP de los sistemas operativos suele intentar reenviar el paquete inicial de conexión (*SYN*) exactamente a los 3 segundos.

### Cuándo utilizar la configuración por tuplas

El uso de tuplas es una práctica indispensable en arquitecturas orientadas a servicios y consumo de APIs de producción por las siguientes razones:

* **APIs de procesamiento asíncrono o pesado:** Ideal para endpoints que generan archivos dinámicos (planillas Excel, PDFs), realizan consultas complejas a bases de datos o se comunican con sistemas legados lentos. Configuras un timeout de conexión bajo (ej. `2 segundos`) y uno de lectura alto (ej. `30 segundos`).
* **Sistemas tolerantes a caídas:** Si estás consultando un clúster de servidores detrás de un balanceador de carga, un timeout de conexión muy bajo (ej. `1 segundo`) te permite descartar rápidamente un nodo que está caído y reintentar la petición en otro nodo saludable sin hacer esperar al usuario final.

## 13.4. Manejo de excepciones Timeout

El último eslabón para dominar el uso de límites de tiempo en `requests` es la captura y gestión correcta de los fallos en tu código. Cuando una petición supera los umbrales configurados, la biblioteca interrumpe la comunicación de inmediato y eleva una excepción estructurada. Si no capturas esta excepción mediante bloques `try-except`, tu programa detendrá su ejecución abruptamente.

### La jerarquía de excepciones de Timeout

`requests` organiza sus errores de tiempo de espera dentro de un árbol jerárquico que hereda de la clase base `RequestException`. Comprender esta estructura te permite decidir si prefieres capturar cualquier problema de tiempo de manera genérica o reaccionar de forma diferente según la fase de red que haya fallado:

```text
                  [ requests.exceptions.RequestException ]
                                     │
                      [ requests.exceptions.Timeout ]
                                     │
            ┌────────────────────────┴────────────────────────┐
            ▼                                                 ▼
[ exceptions.ConnectTimeout ]                     [ exceptions.ReadTimeout ]

```

* **`Timeout`**: Es la excepción padre para los límites de tiempo. Capturar esta clase atrapará tanto los fallos de conexión como los de lectura.
* **`ConnectTimeout`**: Se lanza específicamente si el cliente no logra establecer el enlace inicial con el servidor web dentro del tiempo asignado.
* **`ReadTimeout`**: Se genera si, tras conectarse con éxito, el servidor tarda demasiado en enviar los datos solicitados.

### Implementación práctica y captura detallada

Para reaccionar de manera inteligente ante cada escenario, puedes encadenar múltiples bloques `except`. Esto te permite, por ejemplo, reintentar la operación inmediatamente si falló la lectura, o cambiar a un servidor de respaldo si falló la conexión.

```python
import requests
from requests.exceptions import ConnectTimeout, ReadTimeout, Timeout

url = 'https://api.ejemplo.com/procesar'

try:
    # Configuramos 2 segundos para conectar y 5 para leer
    respuesta = requests.get(url, timeout=(2.0, 5.0))
    respuesta.raise_for_status()
    
except ConnectTimeout:
    print("Error: No se pudo conectar con el servidor. ¿Está el servicio caído?")
    # Aquí podrías alternar a una URL de respaldo (failover)

except ReadTimeout:
    print("Error: El servidor aceptó la conexión, pero tardó demasiado en responder.")
    # Aquí podrías registrar el problema o sugerir al usuario reintentar más tarde

except Timeout:
    print("Error: Ocurrió un problema de tiempo de espera imprevisto.")

except requests.exceptions.RequestException as e:
    print(f"Error general de requests: {e}")

```

> **Regla de orden:** En Python, las excepciones más específicas (`ConnectTimeout`, `ReadTimeout`) deben colocarse siempre antes de las excepciones genéricas (`Timeout`), de lo contrario, el bloque genérico absorberá el error y nunca se ejecutará el código especializado.

## Resumen del capítulo

En este capítulo hemos aprendido a proteger nuestras aplicaciones contra bloqueos indefinidos controlando los tiempos de espera mediante el parámetro `timeout`:

* **Configuración básica:** Vimos que, por defecto, `requests` no tiene límite de tiempo y que pasar un único valor numérico (ej. `timeout=5`) establece un límite global idéntico tanto para conectar como para leer.
* **Conexión vs. Lectura:** Identificamos que la fase de conexión se encarga del enlace de red inicial (DNS, TCP, SSL), mientras que la fase de lectura mide la espera de la respuesta del servidor una vez conectados.
* **Uso de tuplas:** Aprendimos a aislar estas dos fases pasando una tupla `(conexion, lectura)`, lo que nos permite ser estrictos con el enlace inicial y flexibles con procesos pesados en el servidor.
* **Gestión de errores:** Estudiamos la jerarquía de excepciones y cómo capturar de forma precisa `ConnectTimeout` y `ReadTimeout` para diseñar flujos de recuperación de fallos limpios y profesionales.
