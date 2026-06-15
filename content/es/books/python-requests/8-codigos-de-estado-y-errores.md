Interactuar con servicios web requiere un control de flujos preparado para el fallo. Las redes IP son inherentemente impredecibles y los servidores remotos pueden rechazar datos o sufrir caídas. Este capítulo profundiza en cómo la biblioteca `requests` gestiona estos escenarios. Aprenderás a inspeccionar códigos de estado HTTP mediante propiedades nativas y constantes semánticas, a interceptar fallas de infraestructura como pérdidas de conexión o caídas de DNS con la jerarquía `RequestException`, y a usar `raise_for_status()` para automatizar excepciones. Finalmente, aprenderás a distinguir errores del cliente (4xx) de fallos del servidor (5xx) para diseñar flujos resilientes.

## 8.1. Verificación de códigos de estado

Cuando el servidor web procesa una petición HTTP, devuelve un código numérico de tres dígitos conocido como código de estado. Este número clasifica el resultado de la operación. La biblioteca `requests` proporciona múltiples mecanismos intuitivos para evaluar estos códigos antes de proceder con el procesamiento de los datos.

### Estructura general de los códigos de estado

Los códigos se agrupan en cinco categorías según su primer dígito. Comprender esta jerarquía facilita el diseño de flujos de control lógicos en el código:

```text
[1xx] Informativos    --> Petición recibida, continuando proceso.
[2xx] Éxito           --> La acción fue recibida, entendida y aceptada.
[3xx] Redirección     --> Se deben tomar medidas adicionales para completar la solicitud.
[4xx] Error Cliente   --> La petición contiene sintaxis incorrecta o no puede procesarse.
[5xx] Error Servidor  --> El servidor falló al completar una petición aparentemente válida.

```

### La propiedad `.status_code`

El método más directo para evaluar la respuesta del servidor es inspeccionar el atributo `.status_code` expuesto por el objeto `Response`. Este contiene un valor entero (`int`).

```python
import requests

respuesta = requests.get('https://api.github.com/events')

# Verificación directa mediante una estructura condicional
if respuesta.status_code == 200:
    print("La petición fue exitosa.")
elif respuesta.status_code == 404:
    print("El recurso solicitado no fue encontrado.")
else:
    print(f"El servidor respondió con el código: {respuesta.status_code}")

```

### Evaluación booleana implícita del objeto Response

Una de las características más utilizadas de la biblioteca es la conversión implícita a booleano del objeto `Response`. Si se evalúa una respuesta directamente en una sentencia `if`, `requests` verificará internamente si el código de estado se encuentra en el rango de éxito (mayor o igual a 200 y menor que 400).

```python
respuesta = requests.get('https://api.github.com/user', auth=('usuario', 'clave'))

# Evaluación booleana directa
if respuesta:
    print("Éxito: El código de estado está entre 200 y 399.")
else:
    print("Fallo: El código de estado es un error del cliente (4xx) o del servidor (5xx).")

```

> **Advertencia de diseño:** Aunque la evaluación booleana es muy cómoda para flujos rápidos, no distingue entre una redirección (3xx) y un éxito directo (2xx), ni tampoco entre un error de autenticación (401) y una página no encontrada (404). Para lógicas complejas, es preferible la verificación detallada.

### El objeto de códigos internos: `requests.codes`

Para evitar el uso de "números mágicos" (valores numéricos fijos en el código que reducen la legibilidad), `requests` incluye un diccionario con atributos nombrado `requests.codes`. Este objeto asocia los números de estado con nombres descriptivos en inglés, permitiendo escribir código más semántico.

```python
import requests

respuesta = requests.get('https://api.github.com/invalid-endpoint')

# Uso de constantes semánticas en lugar de números directos
if respuesta.status_code == requests.codes.ok:  # Equivalente a == 200
    print("Todo salió bien.")
elif respuesta.status_code == requests.codes.not_found:  # Equivalente a == 404
    print("Recurso inexistente.")
elif respuesta.status_code == requests.codes.forbidden:  # Equivalente a == 403
    print("Acceso denegado de forma permanente.")

```

El objeto `requests.codes` es flexible y admite múltiples sinónimos para un mismo código, lo que facilita la adaptación al vocabulario de preferencia del desarrollador:

```text
requests.codes.ok ──────────────> 200 <─────── requests.codes.all_ok
requests.codes.not_found ───────> 404 <─────── requests.codes.not_found
requests.codes.server_error ────> 500 <─────── requests.codes.internal_server_error

```

## 8.2. El método raise_for_status()

En lugar de evaluar manualmente los códigos de estado mediante estructuras condicionales `if/else`, la biblioteca `requests` ofrece un mecanismo basado en excepciones para gestionar las respuestas fallidas de forma centralizada. Esto se logra mediante el método `raise_for_status()`.

### Comportamiento del método

El método `raise_for_status()` inspecciona el código de estado de la respuesta de manera interna. Su comportamiento varía estrictamente según el resultado de la petición:

* **Respuestas exitosas (Códigos 2xx y 3xx):** El método no realiza ninguna acción y retorna `None`. El flujo de ejecución del programa continúa con la siguiente línea de código de forma completamente normal.
* **Respuestas fallidas (Códigos 4xx y 5xx):** El método interrumpe el flujo del programa lanzando una excepción de tipo `HTTPError`.

### Sintaxis básica e integración con bloques try-except

La forma recomendada de implementar este método es envolviendo la llamada dentro de una estructura de control de excepciones `try-except`. Esto permite separar la lógica principal de la aplicación del manejo de errores de red.

```python
import requests
from requests.exceptions import HTTPError

try:
    respuesta = requests.get('https://api.github.com/invalid-endpoint')
    
    # Si el código es 4xx o 5xx, se interrumpe aquí y salta al bloque except
    respuesta.raise_for_status()
    
    # Esta línea solo se ejecutará si la petición fue exitosa (2xx/3xx)
    print("Datos obtenidos con éxito:", respuesta.json())

except HTTPError as error_http:
    print(f"Ocurrió un error HTTP: {error_http}")
except Exception as otro_error:
    print(f"Ocurrió un error inesperado: {otro_error}")

```

### Anatomía del error HTTPError

Cuando `raise_for_status()` lanza una excepción `HTTPError`, el objeto de la excepción contiene información detallada sobre la petición original y la respuesta del servidor. El mensaje de error generado automáticamente sigue una estructura estandarizada que facilita la depuración en los registros del sistema (logs):

```text
404 Client Error: Not Found for url: https://api.github.com/invalid-endpoint

```

Es posible acceder programáticamente a los objetos internos de la petición y de la respuesta desde la propia excepción a través de los atributos `.request` y `.response`:

```python
try:
    respuesta = requests.get('https://api.github.com/protected-resource')
    respuesta.raise_for_status()
except HTTPError as error:
    # Inspección de los detalles del fallo
    codigo_fallido = error.response.status_code
    url_fallida = error.request.url
    print(f"Error {codigo_fallido} al intentar acceder a {url_fallida}")

```

### Ventajas de uso frente a la verificación manual

* **Código más limpio (Clean Code):** Elimina la necesidad de anidar múltiples bloques condicionales `if respuesta.status_code == ...` después de cada petición HTTP.
* **Centralización del error:** Permite agrupar la gestión de fallos de múltiples peticiones consecutivas dentro de un único bloque `try-except` general.
* **Interrupción temprana (Fail-Fast):** Asegura que el programa no intente procesar un cuerpo de respuesta vacío o corrupto (como un HTML de error de Cloudflare) asumiendo que los datos son válidos.

## 8.3. Manejo de excepciones RequestException

El desarrollo de aplicaciones robustas que interactúan con servicios web requiere contemplar fallas más allá de las respuestas del servidor (errores HTTP). Los problemas de infraestructura, cortes de energía en la red o nombres de dominio mal escritos impiden que una petición se complete. En la biblioteca `requests`, todas estas anomalías se gestionan a través de una jerarquía de excepciones estructurada.

### La clase base `RequestException`

En la raíz de todas las excepciones lanzadas por la biblioteca se encuentra `requests.exceptions.RequestException`. Esta clase actúa como un paraguas para cualquier tipo de error que ocurra durante el ciclo de vida de una petición.

Capturar `RequestException` garantiza que el programa no sufra una caída inesperada debido a problemas de comunicación HTTP, independientemente de la causa exacta.

### Jerarquía de excepciones comunes

Para implementar estrategias de recuperación específicas, es fundamental conocer las subclases principales que heredan de `RequestException`:

```text
RequestException (Clase base)
 ├── ConnectionError    --> Fallos de red (DNS erróneo, rechazo de conexión).
 ├── Timeout            --> El tiempo límite de espera fue excedido.
 ├── HTTPError          --> El servidor devolvió un código 4xx o 5xx (vía raise_for_status).
 └── URLRequired        --> La URL proporcionada no es válida o está vacía.

```

* **`ConnectionError`:** Se produce cuando hay un problema físico o de enrutamiento subyacente. Por ejemplo, si el cable de red se desconecta, el servidor DNS no puede resolver el dominio, o el puerto del servidor remoto está cerrado.
* **`Timeout`:** Ocurre cuando el servidor remoto tarda más tiempo del configurado en responder o en establecer la conexión inicial.
* **`HTTPError`:** Se origina exclusivamente cuando se invoca explícitamente el método `raise_for_status()` ante una respuesta con estado de error del cliente o del servidor.

### Buenas prácticas para la captura de excepciones

El orden en el que se definen los bloques `except` es crucial en Python. Se debe proceder siempre desde la excepción más específica hacia la más general. Si se captura `RequestException` en el primer bloque, las excepciones hijas inferiores nunca serán evaluadas de forma individual.

El siguiente ejemplo expone la estructura estándar para el manejo profesional de fallas en entornos de producción:

```python
import requests
from requests.exceptions import RequestException, ConnectionError, Timeout, HTTPError

url_servicio = "https://api.github.com/user/repos"

try:
    # Se realiza la petición con un tiempo límite explícito de 5 segundos
    respuesta = requests.get(url_servicio, timeout=5)
    
    # Se evalúa si el código de estado es de éxito (2xx/3xx)
    respuesta.raise_for_status()
    
    print("Conexión exitosa. Procesando datos...")

except ConnectionError as error_red:
    # Manejo específico para fallos de conectividad o DNS
    print(f"Error de conectividad: No se pudo establecer comunicación con el servidor. Detalle: {error_red}")

except Timeout as error_tiempo:
    # Acción correctiva específica ante lentitud del servidor (ej. reintento)
    print(f"Tiempo de espera agotado: El servidor tardó demasiado en responder. Detalle: {error_tiempo}")

except HTTPError as error_http:
    # Gestión de códigos de error 4xx o 5xx
    print(f"Error en la lógica del negocio o del servidor (HTTP {error_http.response.status_code}).")

except RequestException as error_general:
    # Captura cualquier otra anomalía imprevista de la biblioteca requests
    print(f"Error inesperado en la petición de la biblioteca: {error_general}")

```

## 8.4. Distinción entre errores del cliente y servidor

El último paso para dominar el control de flujo en la comunicación HTTP consiste en diferenciar el origen de un fallo cuando este se produce en la capa de la aplicación (códigos 4xx y 5xx). Clasificar correctamente si la responsabilidad del error recae sobre el cliente o sobre el servidor determina si la aplicación debe corregir los datos enviados o si debe esperar a que el servicio remoto se estabilice.

### Errores del Cliente (Rango 4xx)

Los códigos de estado que comienzan con el dígito 4 indican que la petición enviada por la aplicación contiene alguna anomalía o no cumple con los requisitos del servidor.

> **Regla de oro:** Ante un error 4xx, **no se debe reintentar** la misma petición de forma automática sin realizar modificaciones previas, ya que el resultado volverá a ser un fallo de manera invariable.

Los códigos 4xx más habituales en la integración de APIs y sistemas web son:

* **`400 Bad Request`:** El servidor no puede entender la petición debido a una sintaxis defectuosa (por ejemplo, un JSON mal estructurado).
* **`401 Unauthorized`:** La petición carece de credenciales de autenticación válidas o el token proporcionado ha expirado.
* **`403 Forbidden`:** El servidor entiende quién es el cliente, pero este no posee los permisos necesarios para acceder al recurso solicitado.
* **`404 Not Found`:** El recurso o la URL especificada no existen en el servidor remoto.

### Errores del Servidor (Rango 5xx)

Los códigos de estado que comienzan con el dígito 5 reflejan que el servidor web tiene constancia de haber encontrado un error interno o es incapaz de procesar la solicitud debido a un fallo de su propia infraestructura.

> **Regla de oro:** Ante un error 5xx, la petición original suele ser estructuralmente correcta. Por lo tanto, **es seguro implementar estrategias de reintento** tras un intervalo de tiempo prudencial, ya que el problema podría ser transitorio.

Los códigos 5xx más comunes en entornos de producción abarcan:

* **`500 Internal Server Error`:** Una condición genérica e inesperada ocurrió en el servidor (comúnmente una excepción no controlada en su código interno).
* **`502 Bad Gateway`:** El servidor, actuando como puerta de enlace o proxy, recibió una respuesta inválida del servidor principal río arriba.
* **`503 Service Unavailable`:** El servidor no está disponible momentáneamente debido a una sobrecarga temporal o a labores de mantenimiento planificadas.
* **`504 Gateway Timeout`:** El servidor proxy no recibió una respuesta a tiempo del servidor de datos subyacente.

### Implementación del filtrado programático en Python

El objeto `Response` no cuenta con propiedades booleanas directas para aislar de forma individual el origen exacto del fallo (como un hipotético `.is_client_error`). Sin embargo, se puede implementar esta lógica de manera elegante evaluando si el código se encuentra dentro de los rangos numéricos correspondientes:

```python
import requests
from requests.exceptions import HTTPError

try:
    respuesta = requests.get("https://api.github.com/user/repos")
    respuesta.raise_for_status()

except HTTPError as error:
    codigo = error.response.status_code
    
    # Evaluación del rango 400 a 499 (Errores del Cliente)
    if 400 <= codigo < 500:
        print(f"Error del Cliente ({codigo}): Modifique los parámetros de la petición.")
        if codigo == requests.codes.unauthorized:
            print("Acción requerida: Renueve los tokens o las credenciales de acceso.")
        elif codigo == requests.codes.not_found:
            print("Acción requerida: Verifique que la URL o el ID del recurso sean correctos.")
            
    # Evaluación del rango 500 a 599 (Errores del Servidor)
    elif 500 <= codigo < 600:
        print(f"Error del Servidor ({codigo}): El problema es externo a nuestra aplicación.")
        print("Acción recomendada: Registrar el fallo e iniciar una política de reintentos.")

except requests.exceptions.RequestException as error_red:
    print(f"Fallo de comunicación previo a la respuesta HTTP: {error_red}")

```

## Resumen del capítulo

El **Capítulo 8: Códigos de Estado y Errores** proporciona las bases para dotar a las aplicaciones de resiliencia frente a los fallos inherentes a la comunicación a través de redes IP:

* **Evaluación directa e implícita:** Aprendimos a inspeccionar valores numéricos concretos con `.status_code`, a utilizar constantes semánticas legibles mediante el objeto `requests.codes` y a emplear la conversión booleana implícita para verificar de forma rápida si una petición se completó sin anomalías.
* **Control mediante excepciones:** Estudiamos cómo automatizar la interrupción del flujo del programa con el método `.raise_for_status()`, el cual lanza excepciones específicas cuando detecta códigos no exitosos.
* **Jerarquía de fallos:** Analizamos la estructura de excepciones encabezada por `RequestException` para interceptar de manera robusta problemas de resolución DNS (`ConnectionError`), pérdidas de conexión por lentitud (`Timeout`) o errores en la capa de aplicación (`HTTPError`).
* **Origen de la falla:** Establecimos los criterios de diseño para diferenciar los errores cometidos por nuestra propia aplicación (rango 4xx) de aquellos causados por caídas o mantenimiento en la infraestructura del servidor remoto (rango 5xx), habilitando la toma de decisiones lógicas basadas en datos para la tolerancia a fallos.
