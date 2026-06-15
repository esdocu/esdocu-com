Hacer peticiones HTTP individuales genera un alto coste de rendimiento debido a la apertura y cierre constante de conexiones de red. Este capítulo introduce el objeto `Session`, una herramienta crucial para optimizar tus scripts en Python. A lo largo de las siguientes secciones, aprenderás a instanciar una sesión, gestionar automáticamente la persistencia de cookies para mantener estados con el servidor y reutilizar conexiones TCP subyacentes mediante *Keep-Alive*. Además, exploraremos el uso de gestores de contexto (`with`) para liberar recursos de forma segura y la configuración de cabeceras globales para simplificar tu código.

## 12.1. Creación del objeto Session

Cuando realizas peticiones consecutivas utilizando las funciones estándar de la biblioteca `requests` (como `requests.get()` o `requests.post()`), la biblioteca abre y cierra una nueva conexión de red para cada una de ellas. Esto genera una carga innecesaria de recursos y tiempo.

Para resolver este problema, `requests` expone la clase `Session`. El objeto `Session` actúa como un contenedor que te permite persistir ciertos parámetros a lo largo de múltiples peticiones (como cookies o cabeceras) y, a nivel interno, reutilizar la misma conexión TCP subyacente gracias a la tecnología de *connection pooling* suministrada por `urllib3`.

### Instanciación básica de una sesión

La creación de un objeto de tipo `Session` es directa y se realiza llamando al método `Session()` del módulo principal. A partir de ese momento, los métodos para realizar peticiones HTTP pasan a formar parte del objeto instanciado, manteniendo la misma interfaz que ya conoces.

A continuación, se detalla el flujo de creación e interacción en su forma más simple:

```python
import requests

# 1. Crear la instancia del objeto Session
sesion = requests.Session()

# 2. Realizar peticiones utilizando el objeto creado
respuesta_1 = sesion.get('https://httpbin.org/get')
respuesta_2 = sesion.get('https://httpbin.org/cookies/set?usuario=ana')

# Las cookies o cambios de estado generados en respuesta_2 persistirán en peticiones siguientes
respuesta_3 = sesion.get('https://httpbin.org/cookies')

# 3. Cerrar la sesión para liberar los recursos de red de forma explícita
sesion.close()

```

### Arquitectura de las peticiones: `requests.get()` vs. `Session.get()`

Para entender el impacto de instanciar un objeto `Session`, resulta útil comparar visualmente cómo gestiona Python las conexiones en ambos escenarios:

```text
Peticiones individuales independientes:
[Cliente] ---- requests.get() ----> [Servidor] (Abre conexión TCP)
[Cliente] <--- Recibe respuesta ---- [Servidor] (Cierra conexión TCP)
[Cliente] ---- requests.get() ----> [Servidor] (Abre NUEVA conexión TCP)
[Cliente] <--- Recibe respuesta ---- [Servidor] (Cierra conexión TCP)

Uso del objeto Session:
[Cliente] ---- sesion.get() -------> [Servidor] (Abre conexión TCP)
[Cliente] <--- Recibe respuesta ---- [Servidor] (Mantiene conexión ABIERTA)
[Cliente] ---- sesion.get() -------> [Servidor] (Reutiliza la misma conexión)

```

Al instanciar e interactuar mediante un objeto `Session`, reduces drásticamente la latencia de tus scripts al evitar el coste del saludo de tres vías (*three-way handshake*) de TCP y la negociación TLS/SSL en cada llamada.

### Inicialización y ciclo de vida

El objeto `Session` es una clase de Python que hereda de una estructura interna encargada de gestionar el estado del cliente HTTP. Al crearse, inicializa estructuras de datos vacías para:

* El almacenamiento de cookies (`requests.cookies.RequestsCookieJar`).
* Los diccionarios de cabeceras predeterminadas (`headers`).
* La configuración de proxies y mecanismos de autenticación.

> **Nota de diseño:** Aunque el objeto puede dejarse abierto y dejar que el recolector de basura de Python limpie las conexiones al finalizar el script, la buena práctica dicta llamar explícitamente al método `.close()` cuando ya no se necesite la sesión, asegurando que los sockets de red del sistema operativo se liberen de inmediato.
>
## 12.2. Persistencia de cookies

Una de las ventajas más evidentes de utilizar un objeto `Session` es la gestión automatizada del estado de las cookies. En el protocolo HTTP, las cookies son el mecanismo estándar para que el servidor identifique a un cliente a lo largo del tiempo.

Cuando realizas peticiones aisladas con `requests.get()`, las cookies devueltas por el servidor en la cabecera `Set-Cookie` se descartan inmediatamente después de que se procesa la respuesta. En cambio, un objeto `Session` intercepta de manera automática estas cabeceras, almacena las cookies en su memoria interna y las reenvía de forma transparente en las siguientes peticiones dirigidas al mismo dominio.

### El contenedor de cookies de la sesión

Internamente, el objeto `Session` guarda estas cookies en un atributo llamado `cookies`, el cual es una instancia de la clase `RequestsCookieJar`. Esta estructura funciona de forma muy similar a un diccionario de Python, pero ofrece métodos adicionales optimizados para el manejo de metadatos de red (como el dominio o la ruta de expiración de la cookie).

El siguiente ejemplo de código ilustra cómo la sesión almacena una cookie asignada por el servidor y la incluye automáticamente en la siguiente llamada:

```python
import requests

# Crear la sesión
sesion = requests.Session()

# 1. Visitar un endpoint que simula la creación de una cookie en el servidor
url_establecer = "https://httpbin.org/cookies/set/auth_token/xyz123"
print("Realizando primera petición para establecer la cookie...")
sesion.get(url_establecer)

# 2. Inspeccionar el contenedor de cookies de la sesión
print("\nCookies actualmente guardadas en la sesión:")
for cookie in sesion.cookies:
    print(f"Nombre: {cookie.name} | Valor: {cookie.value} | Dominio: {cookie.domain}")

# 3. Realizar una segunda petición a un endpoint que devuelve las cookies que recibe
url_verificar = "https://httpbin.org/cookies"
respuesta = sesion.get(url_verificar)

print("\nRespuesta del servidor en la segunda petición (JSON):")
print(respuesta.text)

sesion.close()

```

### Flujo de persistencia automatizada

El comportamiento interno del objeto `Session` durante el intercambio de mensajes sigue una secuencia lógica donde el cliente actualiza constantemente su contenedor interno:

```text
[ Cliente (Session) ]                                [ Servidor Remoto ]
         |                                                    |
         | ----- 1. GET /cookies/set/auth_token/xyz123 -----> |
         | <---- 2. Respuesta + [Set-Cookie: auth_token] ---- |
         |                                                    |
   (Guarda auth_token 
    en sesion.cookies)
         |                                                    |
         | ----- 3. GET /cookies + [Cookie: auth_token] ----> |
         | <---- 4. Respuesta (Confirma recepción) ---------- |

```

### Manipulación manual de las cookies de la sesión

Además del almacenamiento automático, puedes interactuar directamente con el atributo `cookies` para consultar, añadir o modificar valores antes de efectuar una petición. Esto es especialmente útil si ya posees un token de sesión o una cookie de autenticación previa y deseas precargarla.

Puedes tratar a `sesion.cookies` como un diccionario utilizando asignación directa, o utilizar el método `.set()` para especificar el dominio si es necesario:

```python
import requests

sesion = requests.Session()

# Asignación simple estilo diccionario
sesion.cookies['preferencia_idioma'] = 'es_ES'

# Asignación avanzada especificando el dominio de validez
sesion.cookies.set('sesion_id', '998877', domain='httpbin.org', path='/')

# Realizar la petición: ambas cookies se enviarán automáticamente
respuesta = sesion.get("https://httpbin.org/cookies")
print(respuesta.json())

sesion.close()

```

### Aislamiento frente a cookies temporales

Es importante distinguir entre las cookies que pertenecen a la **sesión global** y las cookies que pasas como argumento en una **petición específica**.

Si pasas un parámetro `cookies` dentro del método `.get()`, esa cookie se enviará exclusivamente en esa solicitud y *no* se guardará en el objeto `Session` para llamadas posteriores:

```python
import requests

sesion = requests.Session()
sesion.cookies['cookie_global'] = 'permanente'

# Esta cookie 'cookie_temporal' solo vive durante esta ejecución de .get()
sesion.get("https://httpbin.org/cookies", cookies={'cookie_temporal': 'pasajera'})

# En la siguiente petición, 'cookie_temporal' ya no existirá
segunda_respuesta = sesion.get("https://httpbin.org/cookies")
print("¿Existe cookie_temporal en la segunda petición?", 'cookie_temporal' in segunda_respuesta.json()['cookies'])

sesion.close()

```

## 12.3. Rendimiento y reutilización de conexiones

El verdadero beneficio en términos de infraestructura y velocidad al utilizar un objeto `Session` no se ve a simple vista en el código, sino que ocurre tras bambalinas en las capas de red. Mientras que las funciones directas como `requests.get()` son cómodas para tareas rápidas, sufren de un problema de rendimiento crítico si se ejecutan en bucles o flujos de trabajo extensos: la creación y destrucción constante de sockets.

Cada vez que invocas una función directa de la biblioteca, se deben ejecutar de forma secuencial una serie de pasos que consumen tiempo y cómputo antes de poder transmitir los datos reales de tu petición.

### El coste de no reutilizar conexiones

En una petición HTTP convencional sobre una conexión nueva (especialmente bajo HTTPS), el proceso técnico requiere los siguientes pasos:

1. **Resolución DNS:** Traducir el nombre de dominio (por ejemplo, `api.github.com`) a una dirección IP.
2. **Apretón de manos TCP (Three-Way Handshake):** Intercambio de paquetes SYN, SYN-ACK y ACK para establecer el canal de comunicación bidireccional.
3. **Negociación TLS/SSL:** Intercambio de certificados de seguridad, validación de claves cifradas y establecimiento de la sesión segura (lo que añade múltiples viajes de ida y vuelta o *Round Trip Times*).
4. **Petición y Respuesta HTTP:** Transmisión real de las cabeceras y el cuerpo del mensaje.
5. **Cierre de la conexión:** El socket se cierra, liberando el puerto local.

Si necesitas realizar 50 peticiones al mismo servidor, este proceso se repite exactamente 50 veces de manera independiente si utilizas `requests.get()`.

### Keep-Alive y Connection Pooling con urllib3

El objeto `Session` implementa de forma automática la persistencia de conexiones aprovechando la cabecera HTTP `Connection: keep-alive` y delegando el control en la biblioteca interna `urllib3`.

Al instanciar una sesión, esta crea un componente interno llamado administrador de piscinas de conexiones (*Connection Pool Manager*). Cuando realizas la primera petición a un dominio, la sesión abre la conexión TCP y realiza la negociación SSL. Una vez que se recibe la respuesta, en lugar de destruir el socket de red, la sesión lo mantiene abierto y en estado de espera (*idle*) dentro de su reserva o *pool*. Cuando ejecutas la siguiente petición hacia el mismo dominio o dirección IP, se salta los pasos 1, 2 y 3, enviando los datos directamente a través del canal de comunicación que ya estaba operativo.

### Comparativa de flujos de ejecución

A nivel de tráfico de red, la diferencia en la saturación de paquetes y tiempos de espera se puede estructurar de la siguiente manera:

```text
Enfoque sin sesión (Múltiples requests.get()):
Petición 1: [DNS] -> [TCP Handshake] -> [TLS Init] -> [HTTP Req/Res] -> [TCP Close]
Petición 2: [DNS] -> [TCP Handshake] -> [TLS Init] -> [HTTP Req/Res] -> [TCP Close]
Petición 3: [DNS] -> [TCP Handshake] -> [TLS Init] -> [HTTP Req/Res] -> [TCP Close]

Enfoque con sesión (Múltiples sesion.get()):
Petición 1: [DNS] -> [TCP Handshake] -> [TLS Init] -> [HTTP Req/Res] (Mantiene conexión)
Petición 2:                                             [HTTP Req/Res] (Reutiliza canal)
Petición 3:                                             [HTTP Req/Res] (Reutiliza canal)

```

### Demostración práctica de rendimiento

El siguiente script permite medir de forma empírica la diferencia de tiempo al realizar una serie de peticiones consecutivas utilizando ambos enfoques hacia el mismo servidor remoto.

```python
import requests
import time

URL = "https://httpbin.org/delay/0"  # Endpoint con respuesta rápida
ITERACIONES = 10

# Prueba 1: Realizando peticiones individuales independientes
inicio_sin_sesion = time.time()
for _ in range(ITERACIONES):
    requests.get(URL)
fin_sin_sesion = time.time()
tiempo_sin_sesion = fin_sin_sesion - inicio_sin_sesion

# Prueba 2: Realizando peticiones reutilizando un objeto Session
inicio_con_sesion = time.time()
with requests.Session() as sesion:
    for _ in range(ITERACIONES):
        sesion.get(URL)
fin_con_sesion = time.time()
tiempo_con_sesion = fin_con_sesion - inicio_con_sesion

print(f"Tiempo total SIN objeto Session: {tiempo_sin_sesion:.4f} segundos")
print(f"Tiempo total CON objeto Session: {tiempo_con_sesion:.4f} segundos")
print(f"Mejora de rendimiento aproximada: {((tiempo_sin_sesion - tiempo_con_sesion) / tiempo_sin_sesion) * 100:.2f}% más rápido")

```

En la mayoría de los entornos de red, la ejecución con `Session` muestra una reducción de tiempo drástica, habitualmente completando las tareas en menos de la mitad del tiempo requerido por las llamadas individuales aisladas. Esta optimización reduce el uso de CPU de tu máquina local, disminuye la latencia general del script y mitiga el riesgo de que el cortafuegos del servidor remoto bloquee tu IP por abrir demasiadas conexiones concurrentes en un lapso corto de tiempo.

## 12.4. Context managers (bloques with)

Cuando trabajas con un objeto `Session`, la gestión manual del ciclo de vida del objeto mediante llamadas explícitas a `.close()` introduce un riesgo latente: si tu script experimenta un error inesperado o una excepción en mitad de las peticiones, la línea encargada de cerrar la sesión nunca se ejecutará. Esto provoca que los sockets de red subyacentes permanezcan abiertos en la memoria del sistema operativo durante un tiempo indefinido, generando una fuga de recursos (*resource leak*).

Para mitigar este problema de forma idiomática, la clase `Session` implementa el protocolo de **gestores de contexto** (*context managers*) de Python. Esto significa que puedes instanciar y operar cualquier sesión utilizando la palabra clave `with`.

### Sintaxis e implementación estándar

El uso de un bloque `with` garantiza que la sesión se cerrará de manera automática e inmediata en el momento exacto en que la ejecución del código abandone el bloque indentado, sin importar si la salida se produce de forma limpia o debido a un error crítico en el programa.

A continuación, se muestra la estructura sintáctica recomendada para trabajar con sesiones persistentes:

```python
import requests

# El gestor de contexto inicializa la sesión y la asigna a la variable 'sesion'
with requests.Session() as sesion:
    # Todas las peticiones dentro de este bloque aprovechan la reutilización de conexiones
    respuesta_1 = sesion.get("https://httpbin.org/get")
    print(f"Petición 1 - Código de estado: {respuesta_1.status_code}")
    
    respuesta_2 = sesion.get("https://httpbin.org/headers")
    print(f"Petición 2 - Contenido recibido con éxito.")

# Al llegar a este punto (fuera de la indentación), sesion.close() ya se ejecutó automáticamente
print("La sesión ha sido cerrada de forma segura por el intérprete de Python.")

```

### Flujo de control ante excepciones

La verdadera potencia del gestor de contexto radica en su comportamiento robusto cuando ocurren fallos intermedios. Python intercepta internamente cualquier excepción y ejecuta el método de salida del gestor antes de propagar el error hacia arriba.

```text
Flujo normal con bloque 'with':
[Entrada al bloque] ---> [Petición 1] ---> [Petición 2] ---> [Salida del bloque] ---> [Cierre automático]

Flujo con error inesperado:
[Entrada al bloque] ---> [Petición 1] ---> [ERROR / EXCEPCIÓN]
                                                   |
                                                   v
[Propagación del error] <--- [Cierre automático de sockets] <--- (Garantizado por el bloque with)

```

En el siguiente ejemplo, se fuerza una excepción deliberada dentro del flujo de trabajo para observar cómo opera la protección de recursos:

```python
import requests

try:
    with requests.Session() as sesion:
        print("Enviando petición inicial...")
        sesion.get("https://httpbin.org/get")
        
        # Simulamos un error lógico o de procesamiento de datos en nuestro script
        print("Forzando un error de ejecución de código...")
        resultado = 10 / 0  # Lanza un ZeroDivisionError

        # Esta línea nunca se alcanzará
        sesion.get("https://httpbin.org/status/200")

except ZeroDivisionError:
    print("\nSe capturó la excepción 'ZeroDivisionError'.")
    print("A pesar de la caída del script, el bloque 'with' ya cerró los sockets de red subyacentes.")

```

### Ámbito y persistencia de las variables de respuesta

Un aspecto técnico importante a tener en cuenta sobre el ámbito de las variables (*scoping*) en Python es que los bloques de control como `with` no aíslan las variables creadas en su interior.

Aunque el objeto `Session` queda completamente inoperativo y cerrado tras salir de la indentación, los objetos de respuesta (las instancias de `Response`) que guardaste en variables siguen existiendo y sus datos textuales o JSON pueden ser leídos sin problemas:

```python
import requests

with requests.Session() as sesion:
    respuesta = sesion.get("https://httpbin.org/json")
    # Guardamos los datos decodificados en una variable
    datos_json = respuesta.json()

# Fuera del bloque with (la sesión ya está CERRADA)
# Es totalmente seguro acceder a los datos recolectados:
print("\nDatos recuperados fuera del bloque:")
print(datos_json['slideshow']['title'])

# Sin embargo, intentar usar la sesión cerrada para una nueva petición lanzará un error:
try:
    sesion.get("https://httpbin.org/get")
except Exception as e:
    print(f"\nError al intentar reutilizar la sesión cerrada: {e}")

```

## 12.5. Combinación con cabeceras globales

Además de gestionar la persistencia de cookies y la reutilización de sockets de red, el objeto `Session` permite centralizar la configuración de tus peticiones HTTP. Cuando construyes herramientas que interactúan con una API, es común que necesites enviar exactamente las mismas cabeceras de metadatos en cada solicitud, como tokens de autorización, tipos de contenido preferidos (`Content-Type`) o cadenas de identificación del cliente (`User-Agent`).

En lugar de pasar un diccionario `headers` como argumento de manera repetitiva en cada llamada a `.get()` o `.post()`, puedes definir estas cabeceras directamente a nivel de la sesión.

### El diccionario de cabeceras predeterminadas

El objeto `Session` expone un atributo llamado `headers` que funciona como un diccionario modificable. Cualquier par clave-valor que añadas a este diccionario se fusionará automáticamente y se enviará en todas las peticiones salientes procesadas por esa sesión específica.

```python
import requests

with requests.Session() as sesion:
    # 1. Definir cabeceras globales para toda la sesión
    sesion.headers['Authorization'] = 'Bearer TOKEN_SECRETO_123'
    sesion.headers['Accept'] = 'application/json'
    sesion.headers['X-Cliente-App'] = 'ScriptAutomatizacionV1'

    # 2. Realizar una petición simple sin pasar el argumento headers
    # Ambas llamadas incluirán automáticamente las tres cabeceras anteriores
    respuesta_1 = sesion.get('https://httpbin.org/get')
    respuesta_2 = sesion.get('https://httpbin.org/headers')

    print("Cabeceras recibidas por el servidor en la segunda petición:")
    print(respuesta_2.json()['headers'])

```

### Mecanismo de fusión y precedencia (*Overriding*)

Cuando defines cabeceras globales en la sesión, todavía conservas la flexibilidad de enviar cabeceras específicas en llamadas individuales. El objeto `Session` combina inteligentemente ambos diccionarios antes de despachar la petición hacia la red.

La regla de resolución que sigue `requests` para gestionar las cabeceras se divide en tres niveles de precedencia:

1. **Cabeceras por omisión de la biblioteca:** Cabeceras que `requests` inyecta automáticamente para que la petición sea válida (como `Host`, `Accept-Encoding` o un `User-Agent` genérico).
2. **Cabeceras globales de la sesión:** Valores declarados en `sesion.headers`. Sobrescriben a las cabeceras por omisión si hay conflicto de nombres.
3. **Cabeceras a nivel de método:** Valores pasados directamente como argumento dentro de la función (por ejemplo, `sesion.get(url, headers={...})`). Estas tienen la máxima prioridad y sobrescriben tanto a las de la sesión como a las de la biblioteca para **esa petición concreta**.

```text
Estructura de jerarquía y precedencia:
[ Cabecera a nivel de método (get/post) ]  <-- Máxima prioridad (Sobrescribe todo)
                  |
[ Cabecera global de la sesión (Session.headers) ]
                  |
[ Cabeceras automáticas de la biblioteca ] <-- Mínima prioridad

```

El siguiente bloque de código demuestra este comportamiento en la práctica, mostrando cómo una cabecera local reemplaza temporalmente el valor global configurado en la sesión:

```python
import requests

with requests.Session() as sesion:
    # Establecemos un User-Agent global para la sesión
    sesion.headers['User-Agent'] = 'NavegadorCorporativo/5.0'
    sesion.headers['X-Zona'] = 'Europa'

    # Petición A: Usa la configuración global de la sesión
    req_a = sesion.get('https://httpbin.org/headers')
    print("Petición A (User-Agent):", req_a.json()['headers']['User-Agent'])

    # Petición B: Sobrescribimos el User-Agent localmente solo para esta llamada
    cabecera_especifica = {'User-Agent': 'AgenteMovil/1.0'}
    req_b = sesion.get('https://httpbin.org/headers', headers=cabecera_especifica)
    
    print("Petición B (User-Agent modificado):", req_b.json()['headers']['User-Agent'])
    print("Petición B (X-Zona mantenida):", req_b.json()['headers']['X-Zona'])

    # Petición C: Comprobamos que la sesión recupera su valor global intacto
    req_c = sesion.get('https://httpbin.org/headers')
    print("Petición C (User-Agent restablecido):", req_c.json()['headers']['User-Agent'])

```

### Eliminación de cabeceras predeterminadas

En ocasiones, el comportamiento automatizado de `requests` puede interferir con los requisitos estrictos de una API (por ejemplo, si el servidor rechaza peticiones que contengan ciertas cabeceras que la biblioteca añade por defecto). Para suprimir una cabecera por completo en una petición o en toda la sesión, puedes asignar su valor a `None`:

```python
import requests

with requests.Session() as sesion:
    # Eliminamos de forma global la cabecera User-Agent que 'requests' genera por defecto
    sesion.headers['User-Agent'] = None
    
    # También puedes anular una cabecera global de forma temporal en una sola llamada:
    # sesion.get(url, headers={'Nombre-Cabecera': None})

    respuesta = sesion.get('https://httpbin.org/headers')
    print("\nCabeceras enviadas (User-Agent no debería aparecer):")
    print(respuesta.json()['headers'])

```

## Resumen del capítulo

En este **Capítulo 12: Sesiones y Persistencia**, hemos explorado en profundidad cómo optimizar de forma integral nuestras interacciones HTTP mediante el uso del objeto `Session`.

Comenzamos analizando cómo instanciar de forma básica esta clase para actuar como un cliente unificado. Aprendimos que, a diferencia de los métodos de conveniencia aislados de la biblioteca, la sesión intercepta y almacena automáticamente el estado de las **cookies** corporativas o de sesión a través del contenedor `RequestsCookieJar`, permitiendo la persistencia automatizada del estado de autenticación entre llamadas consecutivas.

Evaluamos el impacto crítico en el **rendimiento** y la eficiencia de nuestros scripts de automatización gracias a las directivas de *Keep-Alive* y el mecanismo interno de *connection pooling* administrado por `urllib3`. Al evitar la recreación cíclica de sockets de red y la sobrecarga asociada a las negociaciones TCP y TLS de cada petición, el objeto `Session` agiliza sustancialmente la velocidad de transmisión de datos.

Finalmente, revisamos cómo blindar nuestro código frente a fugas de recursos de red mediante el empleo idiomático de **gestores de contexto** (bloques `with`), y vimos cómo estructurar la arquitectura de software de nuestras peticiones centralizando diccionarios de **cabeceras globales** sin sacrificar la flexibilidad de aplicar reglas de sobreescritura local en llamadas particulares.
