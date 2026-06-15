En este capítulo aprenderás a dar tus primeros pasos prácticos con la biblioteca `requests` para comunicarte con servidores web. Comenzaremos analizando la estructura interna y la anatomía de una petición HTTP para entender qué sucede bajo el capó en cada interacción de red. A continuación, utilizaremos el método `GET` para solicitar y recuperar información de una API pública de forma sencilla. Finalmente, exploraremos cómo inspeccionar las respuestas del servidor evaluando sus códigos de estado y extrayendo de manera limpia los datos devueltos en formato de texto plano. Este bloque constituye la base fundamental sobre la que construirás cualquier integración web en Python.

## 2.1. Anatomía de una petición HTTP

Antes de escribir tu primera línea de código con la biblioteca `requests`, es fundamental comprender qué ocurre exactamente detrás de escena cuando tu aplicación se comunica con un servidor web. Cada vez que utilizas Python para interactuar con una API o descargar un sitio web, estás construyendo y enviando una **petición HTTP** (HTTP Request).

El protocolo HTTP (Hypertext Transfer Protocol) funciona mediante un modelo de cliente-servidor basado en mensajes de texto plano. Tu script de Python actúa como el **cliente** (el que inicia la comunicación) y el software remoto (como Apache, Nginx o una API en la nube) actúa como el **servidor** (el que procesa la solicitud y devuelve una respuesta).

A continuación, desglosamos los componentes esenciales que forman la estructura interna de cualquier petición HTTP.

### Estructura general de un mensaje de petición

A nivel de red, una petición HTTP es simplemente un bloque de texto estructurado de una forma muy precisa que el servidor puede leer e interpretar de inmediato. Esta estructura se divide en tres partes principales:

```text
+------------------------------------------------------------+
| LÍNEA DE PETICIÓN (Método + URL/Ruta + Versión HTTP)       |
+------------------------------------------------------------+
| CABECERAS (Metadatos: pares Clave: Valor)                 |
+------------------------------------------------------------+
| LÍNEA EN BLANCO (Separador obligatorio)                    |
+------------------------------------------------------------+
| CUERPO DE LA PETICIÓN (Opcional: Datos, JSON, Archivos)    |
+------------------------------------------------------------+

```

### 1. La línea de petición (Request Line)

Es la primera línea del mensaje y define la acción que se va a realizar. Contiene tres elementos separados por espacios:

* **Método HTTP (Verbo):** Indica la operación que se desea ejecutar. Los más comunes son `GET` (para solicitar información), `POST` (para enviar información nueva), `PUT` (para actualizar) y `DELETE` (para eliminar).
* **La Ruta (URI):** Especifica el recurso exacto dentro del servidor. Si la URL completa es `[https://api.ejemplo.com/v1/usuarios](https://api.ejemplo.com/v1/usuarios)`, la ruta enviada al servidor en la línea de petición suele ser `/v1/usuarios`.
* **Versión de HTTP:** Identifica la versión del protocolo utilizada, habitualmente `HTTP/1.1` o `HTTP/2`.

**Ejemplo de una línea de petición real:**

```http
GET /v1/usuarios HTTP/1.1

```

### 2. Las Cabeceras (Headers)

Ubicadas inmediatamente después de la línea de petición, las cabeceras son metadatos organizados en líneas independientes con el formato `Clave: Valor`. Permiten al cliente proporcionar información adicional sobre sí mismo y sobre cómo desea que se procese la solicitud.

Algunas de las cabeceras más importantes que la biblioteca `requests` gestiona automáticamente (o que tú puedes personalizar) incluyen:

* `Host`: El nombre de dominio del servidor (por ejemplo, `api.ejemplo.com`). Es obligatoria en HTTP/1.1.
* `User-Agent`: Una cadena que identifica al software que realiza la petición. Por defecto, la biblioteca se identifica con una cadena similar a `python-requests/2.X.X`.
* `Accept`: Indica al servidor qué tipos de contenido es capaz de entender el cliente (como `application/json` o `text/html`).

### 3. El Cuerpo de la petición (Body o Payload)

Es el bloque de datos que se envía al servidor. No todas las peticiones lo necesitan; por ejemplo, una petición de tipo `GET` común para leer una página web no lleva cuerpo. Sin embargo, cuando utilizas un método `POST` para enviar un formulario o subir una imagen, esos datos viajan en esta sección.

El cuerpo está estrictamente separado de las cabeceras por una **línea en blanco**. Esta línea vacía es el indicador que utiliza el servidor para saber que los metadatos han terminado y que lo siguiente que lea será el contenido puro.

### Un ejemplo del mensaje completo en acción

Si quisiéramos enviar datos para registrar un nuevo usuario en un servidor remoto, el mensaje HTTP de texto plano que viajaría por la red se vería de la siguiente manera:

```http
POST /v1/usuarios HTTP/1.1
Host: api.ejemplo.com
User-Agent: python-requests/2.31.0
Accept: application/json
Content-Type: application/json
Content-Length: 47

{"nombre": "Carlos", "email": "carlos@mail.com"}

```

En este ejemplo visualizamos perfectamente la línea de petición con el método `POST`, las cabeceras que describen la petición (incluyendo el tipo y tamaño de los datos), la línea en blanco obligatoria y, finalmente, el cuerpo formateado en JSON con los datos del usuario.

Cuando utilices la biblioteca `requests`, no tendrás que preocuparte por escribir estas cadenas de texto ni por calcular manualmente el tamaño del contenido (`Content-Length`). La biblioteca se encargará de traducir tus objetos de Python (como diccionarios y strings) a este formato estándar de manera automática.

## 2.2. Uso del método GET

El método `GET` es el verbo HTTP más utilizado en la web. Su propósito exclusivo es **solicitar o recuperar información** de un servidor sin modificar el estado del recurso de ninguna manera. Cada vez que navegas por internet o consultas un endpoint de una API para extraer datos, estás realizando una petición `GET`.

Con la biblioteca `requests`, ejecutar esta operación requiere una única función que emula la simplicidad del protocolo.

### Realizando una petición GET básica

Para enviar una petición `GET`, la biblioteca proporciona la función `requests.get()`. Esta función toma como argumento mínimo la URL del recurso al que deseas acceder y devuelve un objeto de tipo `Response` (Respuesta), el cual contiene toda la información enviada por el servidor.

A continuación se muestra el patrón básico de uso:

```python
import requests

# Definimos la URL de una API pública de prueba
url = "https://jsonplaceholder.typicode.com/posts/1"

# Realizamos la petición HTTP GET
respuesta = requests.get(url)

# Imprimimos el tipo de objeto que hemos recibido
print(type(respuesta))
# Salida: <class 'requests.models.Response'>

```

En este fragmento de código, `requests.get(url)` se encarga de abrir una conexión de red, estructurar la línea de petición e interpolar las cabeceras por defecto para empaquetar el mensaje HTTP. El script se detiene momentáneamente en esa línea hasta que el servidor procesa la solicitud y devuelve los datos.

### Interactuando con el objeto Response

El objeto que hemos almacenado en la variable `respuesta` no es solo el texto de la página o el JSON de la API; es una estructura compleja que encapsula la respuesta HTTP completa del servidor (incluyendo su propio estado, cabeceras y cuerpo).

Aunque los detalles profundos de este objeto se estudiarán más adelante, puedes realizar una inspección rápida de sus componentes esenciales de la siguiente manera:

```python
import requests

url = "https://jsonplaceholder.typicode.com/posts/1"
respuesta = requests.get(url)

# Verificar si la petición fue exitosa (Código 200)
print(f"Código de estado: {respuesta.status_code}")

# Ver el tipo de contenido que nos devolvió el servidor
print(f"Tipo de contenido: {respuesta.headers.get('Content-Type')}")

```

### Características clave del método GET

Al diseñar y ejecutar peticiones con `requests.get()`, es fundamental tener en cuenta las siguientes reglas del protocolo HTTP:

* **Idempotencia:** Se dice que `GET` es un método idempotente. Esto significa que hacer la misma petición múltiples veces idénticas debe producir siempre el mismo resultado y no debe tener efectos secundarios en el servidor (como crear, borrar o modificar registros).
* **Sin cuerpo de petición:** Por estándar general de HTTP, las peticiones `GET` no envían datos dentro del cuerpo del mensaje (Payload). Si necesitas enviar información al servidor para filtrar los resultados (como un término de búsqueda o un número de página), estos datos deben viajar integrados directamente en la propia URL mediante parámetros de consulta, un aspecto que automatizaremos en los próximos capítulos.

## 2.3. Acceso al código de estado HTTP

Cada vez que el servidor procesa una petición enviada por tu script, lo primero que incluye en su respuesta es un número de tres dígitos conocido como **código de estado HTTP** (HTTP Status Code). Este código es la forma estándar e internacional en la que el servidor te dice de inmediato cómo ha ido la operación antes de que te pongas a leer los datos devueltos.

La biblioteca `requests` almacena este valor numérico en la propiedad `.status_code` del objeto de respuesta.

### Leyendo el código de estado

Saber interpretar estos números te permite tomar decisiones lógicas en tu código: si la petición tuvo éxito, procesas los datos; si falló porque el recurso no existe o no tienes permisos, muestras un error o intentas otra acción.

```python
import requests

# Hacemos una petición a un recurso existente
respuesta_ok = requests.get("https://jsonplaceholder.typicode.com/posts/1")
print(f"Petición exitosa - Código: {respuesta_ok.status_code}")
# Salida: Petición exitosa - Código: 200

# Intentamos acceder a una URL que no existe en el servidor
respuesta_error = requests.get("https://jsonplaceholder.typicode.com/posts/999999")
print(f"Petición fallida - Código: {respuesta_error.status_code}")
# Salida: Petición fallida - Código: 404

```

### Las familias de códigos HTTP

Los códigos de estado están organizados en cinco grupos o "familias" según su primer dígito. Comprender estas categorías te ayudará a diagnosticar fallos rápidamente:

* **1XX (Informativos):** El servidor ha recibido la petición y continúa procesándola. Son muy poco comunes en el uso cotidiano de scripts con `requests`.
* **2XX (Éxito):** La petición fue recibida, entendida y aceptada correctamente. El código más famoso es el `200 OK`.
* **3XX (Redirección):** El recurso se ha movido temporal o permanentemente a otra ubicación. La biblioteca `requests` suele seguir estas redirecciones de forma automática sin que tengas que intervenir.
* **4XX (Errores del Cliente):** El problema está en la petición que enviaste. Puede ser que la URL esté mal (como el clásico `404 Not Found`) o que no tengas credenciales para entrar (`401 Unauthorized`).
* **5XX (Errores del Servidor):** Tu petición es correcta, pero el servidor remoto ha fallado internamente, está saturado o se encuentra en mantenimiento (por ejemplo, `500 Internal Server Error` o `503 Service Unavailable`).

### Evaluación booleana integrada

Escribir estructuras condicionales basadas en números exactos puede volverse tedioso si tienes que verificar múltiples códigos de éxito (como el `200`, `201` o `204`). Para simplificar esto, `requests` incluye un atajo inteligente: puedes evaluar directamente el objeto de respuesta como si fuera un valor booleano (`True` o `False`).

Cualquier código de estado que esté en el rango de éxito (entre `200` y `299`) se evaluará automáticamente como `True`. Cualquier código de error (de `400` en adelante) se evaluará como `False`.

```python
import requests

respuesta = requests.get("https://jsonplaceholder.typicode.com/posts/1")

if respuesta:
    print("¡La petición fue un éxito rotundo!")
else:
    print(f"Algo salió mal. El servidor respondió con el código: {respuesta.status_code}")

```

### Códigos legibles con requests.codes

Si no quieres memorizar qué significa cada número, la biblioteca incluye un diccionario de conveniencia llamado `requests.codes` que te permite realizar comprobaciones utilizando nombres legibles en inglés en lugar de números planos:

```python
import requests

respuesta = requests.get("https://jsonplaceholder.typicode.com/posts/1")

# Es exactamente lo mismo que comparar con el número 200
if respuesta.status_code == requests.codes.ok:
    print("El servidor devolvió un estado OK (200)")

# Comprobación alternativa para un error 404
if respuesta.status_code == requests.codes.not_found:
    print("El recurso no se encuentra en el servidor (404)")

```

## 2.4. Lectura básica del texto de respuesta

Una vez que has verificado que el código de estado es correcto y que la petición se ha completado con éxito, el siguiente paso natural es acceder a la información que el servidor te ha enviado de vuelta. Este contenido se encuentra en el cuerpo del mensaje de respuesta.

La forma más directa y común de extraer esta información en formato de texto plano es utilizando la propiedad `.text` del objeto de respuesta.

### Acceso al contenido mediante .text

Cuando invocas la propiedad `.text`, la biblioteca `requests` toma los bytes puros devueltos por el servidor y los transforma automáticamente en una cadena de texto de Python (`str`).

A continuación, se muestra cómo realizar una petición y leer el contenido de la respuesta:

```python
import requests

url = "https://jsonplaceholder.typicode.com/posts/1"
respuesta = requests.get(url)

if respuesta:
    # Accedemos al cuerpo de la respuesta en formato de texto plano
    contenido_texto = respuesta.text
    
    print("Contenido recibido del servidor:")
    print(contenido_texto)

```

Al ejecutar el código anterior, la salida impresa será la cadena de texto con la estructura exacta que envió el servidor (en este caso, un formato JSON):

```json
{
  "userId": 1,
  "id": 1,
  "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
  "body": "quia et suscipit\nsuscipit recusandae..."
}

```

### El proceso de codificación (Encoding)

A diferencia de otras herramientas de red más rudimentarias, `requests` es extremadamente inteligente a la hora de manejar texto. Los servidores web no envían texto directamente; envían una corriente de bytes binarios junto con una indicación de cómo deben traducirse esos bytes a caracteres legibles.

Cuando llamas a `.text`, la biblioteca analiza de forma proactiva las cabeceras HTTP devueltas por el servidor (específicamente la cabecera `Content-Type`) para adivinar la codificación de caracteres adecuada (como `UTF-8` o `ISO-8859-1`).

Si en algún caso necesitas verificar qué codificación ha determinado la biblioteca de forma automática, o necesitas forzar una codificación específica porque los caracteres especiales (como acentos o eñes) se muestran rotos, puedes interactuar directamente con la propiedad `.encoding`:

```python
import requests

respuesta = requests.get("https://jsonplaceholder.typicode.com/posts/1")

# Consultar la codificación detectada automáticamente
print(f"Codificación actual: {respuesta.encoding}")
# Salida típica: Codificación actual: utf-8

# Si notas errores en el texto, puedes cambiarla manualmente antes de leer .text
respuesta.encoding = "utf-8"

```

Modificar la propiedad `.encoding` le indica a `requests` que reevalúe los bytes del cuerpo de la respuesta bajo el nuevo mapa de caracteres la próxima vez que accedas a `.text`.

## Resumen del capítulo

En este **Capítulo 2: El Primer Request**, hemos asentado las bases prácticas para interactuar con servicios web mediante el protocolo HTTP empleando la biblioteca `requests`:

* **Anatomía HTTP:** Aprendimos que una petición es un mensaje de texto estructurado compuesto por una línea de petición (método, ruta y versión), cabeceras con metadatos esenciales y un cuerpo opcional.
* **Método GET:** Utilizamos la función `requests.get()` para solicitar información de manera segura e idempotente a un servidor remoto, obteniendo un objeto de tipo `Response`.
* **Códigos de estado:** Exploramos el uso de `.status_code` para diagnosticar el resultado de nuestras operaciones, utilizando tanto la evaluación booleana directa como el asistente semántico `requests.codes`.
* **Lectura de datos:** Implementamos el acceso al contenido textual del servidor mediante la propiedad `.text`, comprendiendo cómo la biblioteca gestiona de manera automática la codificación (`.encoding`) de los caracteres recibidos.
