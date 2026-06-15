Este capítulo aborda la personalización y gestión del contexto en tus peticiones HTTP mediante la biblioteca `requests`. Aprenderás a definir cabeceras personalizadas para enviar metadatos esenciales a las APIs y a modificar el `User-Agent` para emular navegadores reales, evitando bloqueos comunes de seguridad. Además, se detalla el manejo de estados en la web a través de las cookies: cómo inspeccionar de forma segura los datos que el servidor almacena en tu cliente y cómo estructurar tus peticiones salientes para adjuntar cookies mediante diccionarios y objetos `RequestsCookieJar`, permitiendo mantener sesiones activas y coherentes con los servidores remotos.

## 4.1. Definición de cabeceras personalizadas

Las cabeceras HTTP (o *headers*) son metadatos en formato clave-valor que se envían en cada petición y respuesta para proporcionar información esencial sobre el contexto de la comunicación. Por defecto, la biblioteca `requests` genera de forma automática varias cabeceras indispensables para que el servidor entienda la petición (como `Host` o `Accept-Encoding`). Sin embargo, muchas APIs y servidores web requieren que definas cabeceras personalizadas para modificar el comportamiento de la transacción, enviar tokens de acceso, o especificar el formato de datos esperado.

El flujo básico de una petición con cabeceras personalizadas sigue el siguiente esquema:

```text
+-------------------------------------------------------------+
|                     Tu Script Python                        |
|  headers = {'Fictional-API-Key': 'xyz123', 'Accept': '...'} |
+-------------------------------------------------------------+
                               |
                               | (Envío de la petición)
                               v
+-------------------------------------------------------------+
|                       Servidor Web                          |
|  1. Lee las cabeceras personalizadas.                      |
|  2. Valida los metadatos o la autorización.                 |
|  3. Procesa y retorna la respuesta adecuada.                |
+-------------------------------------------------------------+

```

### El parámetro `headers`

Para añadir cabeceras personalizadas a cualquier petición en `requests`, se utiliza el parámetro opcional `headers`. Este parámetro acepta un diccionario de Python donde cada clave representa el nombre de la cabecera y el valor corresponde al contenido de esta.

```python
import requests

# Definición del diccionario con las cabeceras personalizadas
cabeceras_personalizadas = {
    "X-Clave-API": "mi-token-seguro-789",
    "Accept": "application/json",
    "X-Aplicacion-Cliente": "Modulo-Auditoria-v2"
}

# Realizar la petición GET incluyendo las cabeceras
respuesta = requests.get(
    "https://httpbin.org/headers", 
    headers=cabeceras_personalizadas
)

# Imprimir la respuesta del servidor para verificar lo que recibió
print(respuesta.text)

```

> **Nota de diseño:** Por convención, las cabeceras personalizadas que no forman parte del estándar oficial de HTTP solían comenzar con el prefijo `X-`. Aunque el estándar moderno (RFC 6648) ya no obliga a usar este prefijo, sigue siendo muy común encontrarlo en entornos de desarrollo y APIs privadas.

### Consideraciones técnicas importantes

Al trabajar con cabeceras en `requests`, es fundamental tener en cuenta dos reglas de comportamiento interno:

1. **Insensibilidad a mayúsculas y minúsculas (*Case-Insensitivity*):** De acuerdo con la especificación de HTTP, los nombres de las cabeceras no distinguen entre mayúsculas y minúsculas. La biblioteca `requests` implementa una estructura interna llamada `CaseInsensitiveDict`. Esto significa que si defines `"X-Api-Key"`, el servidor la recibirá correctamente, y si intentas acceder a ella más adelante en la respuesta, `"x-api-key"` o `"X-API-KEY"` funcionarán exactamente igual.
2. **Los valores deben ser cadenas de texto:** Tanto las claves como los valores del diccionario que pases al parámetro `headers` deben ser de tipo string (`str`). Intentar pasar un entero (`int`) o un booleano (`bool`) como valor provocará un error de tipo (`TypeError`) al intentar procesar la petición.

```python
# Ejemplo de lo que NO se debe hacer (provocará error)
cabeceras_erroneas = {
    "X-Intento-ID": 105,        # Incorrecto: Debe ser "105"
    "X-Produccion": True        # Incorrecto: Debe ser "True" o "1"
}

# Forma correcta de serializar los valores
cabeceras_correctas = {
    "X-Intento-ID": str(105),
    "X-Produccion": "True"
}

```

### Prioridad y sobrescritura de cabeceras por defecto

Cuando pasas un diccionario al parámetro `headers`, `requests` no borra las cabeceras necesarias para el protocolo HTTP, sino que combina tu diccionario con las cabeceras por defecto. Si pasas una cabecera personalizada que tiene el mismo nombre que una cabecera por defecto (por ejemplo, `Content-Type`), tu valor personalizado tendrá prioridad absoluta y sobrescribirá el valor predeterminado de la biblioteca.

## 4.2. Simulación del User-Agent

La cabecera `User-Agent` es una cadena de texto que los clientes HTTP (como los navegadores web o los scripts de automatización) envían al servidor para identificarse. Esta cadena le indica al servidor el nombre de la aplicación, el sistema operativo, el desarrollador del software y la versión del cliente que realiza la petición.

Por defecto, cuando realizas una petición utilizando la biblioteca `requests`, esta se identifica de forma transparente enviando una cabecera similar a esta:

```http
User-Agent: python-requests/2.31.0

```

### Por qué modificar el User-Agent

Muchos servidores web, firewalls y sistemas de protección contra bots analizan esta cabecera para controlar el tráfico. Si detectan el identificador por defecto de `requests`, interpretan de inmediato que la petición proviene de un script automatizado o una herramienta de *web scraping* (extracción de datos web), lo que suele derivar en dos consecuencias:

* **Bloqueos directos:** El servidor responde inmediatamente con un código de estado `403 Forbidden` o `406 Not Acceptable`.
* **Contenido reducido o alternativo:** El servidor devuelve una página simplificada, una plantilla de error o un desafío de verificación (como un Captcha) en lugar del contenido real.

Para evitar esto y lograr que tu script sea tratado como un usuario legítimo que navega desde una computadora o dispositivo móvil, debes sustituir el valor predeterminado por la cadena de un navegador real.

### Cómo estructurar la simulación

El proceso consiste en sobrescribir la clave `User-Agent` dentro del diccionario que se transfiere al parámetro `headers`.

A continuación se presenta un ejemplo práctico donde se simula una petición proveniente de un navegador Google Chrome moderno ejecutándose en un sistema operativo Windows:

```python
import requests

url = "https://httpbin.org/user-agent"

# Cadena de User-Agent que imita a un navegador Chrome real
cabeceras = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
}

# Realizamos la petición enviando la cabecera personalizada
respuesta = requests.get(url, headers=cabeceras)

# Mostramos la respuesta del servidor para comprobar la identidad detectada
print(respuesta.text)

```

Al inspeccionar la salida de este código, verás que el servidor devuelve el JSON reflejando el User-Agent simulado, confirmando que el script ha ocultado con éxito su firma por defecto.

### Buenas prácticas al simular agentes de usuario

Al automatizar tareas o consumir datos web mediante la manipulación del `User-Agent`, es aconsejable seguir estas pautas esenciales:

1. **Mantén las cadenas actualizadas:** Los navegadores se actualizan constantemente y sus números de versión cambian cada mes. El uso de un User-Agent de un navegador obsoleto (por ejemplo, de hace cinco años) puede levantar sospechas en los sistemas de seguridad del servidor.
2. **Coherencia con otras cabeceras:** Los navegadores modernos no solo envían el `User-Agent`. También acompañan las solicitudes con cabeceras de metadatos como `Accept-Language` o `Sec-Ch-Ua`. Si el servidor realiza inspecciones profundas, proporcionar únicamente el `User-Agent` podría no ser suficiente.
3. **Uso de agentes de usuario móviles:** En ocasiones, simular un dispositivo móvil (como un iPhone o un dispositivo Android) es una excelente estrategia si lo que buscas es recibir una respuesta más ligera, ya que muchos servidores optimizan el tamaño de sus recursos para redes móviles.

```python
# Ejemplo de cabeceras para simular un iPhone (Safari móvil)
cabeceras_iphone = {
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Mobile/15E148 Safari/604.1"
}

```

## 4.3. Lectura de cookies del servidor

Las cookies son pequeños fragmentos de datos que el servidor envía al cliente en la cabecera de respuesta `Set-Cookie`. El cliente almacena estos datos localmente y los devuelve automáticamente en las siguientes peticiones hacia el mismo servidor. Este mecanismo permite al servidor web identificar a los usuarios, recordar sus preferencias o saber si han iniciado sesión, superando la naturaleza sin estado del protocolo HTTP.

Cuando el servidor genera una cookie, el flujo se procesa de la siguiente manera:

```text
+------------------------------------+
|            Servidor Web            |
| Envía: Set-Cookie: sesion=abc123_  |
+------------------------------------+
                  |
                  | (Respuesta HTTP)
                  v
+------------------------------------+
|          Biblioteca requests       |
| Extrae la cookie automáticamente y  |
| la almacena en el objeto 'cookies'.|
+------------------------------------+

```

### El atributo `cookies` y el objeto `RequestsCookieJar`

Cada vez que realizas una petición, `requests` intercepta de manera automática las cabeceras `Set-Cookie` enviadas por el servidor y las procesa. No necesitas extraer manualmente las cadenas de texto de las cabeceras de respuesta; en su lugar, la biblioteca expone estos datos a través del atributo `cookies` del objeto `Response`.

Este atributo no es un diccionario estándar de Python, sino una instancia de la clase `RequestsCookieJar`. Esta estructura funciona de forma muy similar a un diccionario, pero añade métodos específicos para gestionar cookies de múltiples dominios y rutas de forma segura.

### Cómo leer las cookies recibidas

Para acceder a los valores almacenados en el `RequestsCookieJar`, puedes utilizar la notación de corchetes tradicional o el método `.get()`, que previene errores en caso de que la cookie solicitada no exista.

```python
import requests

# Realizamos una petición a un servicio que genera una cookie de prueba
url = "https://httpbin.org/cookies/set/usuario/anonimo"
respuesta = requests.get(url)

# Acceder al tarro de cookies (RequestsCookieJar)
tarro_cookies = respuesta.cookies

# Opción 1: Acceso directo por su nombre (clave)
valor_cookie = tarro_cookies["usuario"]
print(f"Valor de la cookie 'usuario': {valor_cookie}")

# Opción 2: Acceso seguro usando el método .get()
otra_cookie = tarro_cookies.get("sesion_id", "No encontrada")
print(f"Valor de 'sesion_id': {otra_cookie}")

```

### Conversión a un diccionario estándar

Si prefieres trabajar con las estructuras nativas de Python o necesitas pasar estas cookies a otra parte de tu aplicación que no entienda el objeto `RequestsCookieJar`, puedes transformarlo fácilmente en un diccionario de Python ordinario empleando la función `requests.utils.dict_from_cookiejar()`.

```python
import requests

respuesta = requests.get("https://httpbin.org/cookies/set/idioma/es")

# Convertir el tarro de cookies en un diccionario convencional
diccionario_cookies = requests.utils.dict_from_cookiejar(respuesta.cookies)

print(type(diccionario_cookies))  # <class 'dict'>
print(diccionario_cookies)        # {'idioma': 'es'}

```

### Inspección de metadatos de las cookies

Las cookies contienen metadatos cruciales además de su valor textual, tales como su fecha de expiración, el dominio permitido o la ruta de validez. Puedes iterar directamente sobre el objeto `cookies` para inspeccionar estas propiedades avanzadas si tu lógica de negocio requiere validar la vigencia o el origen de una cookie:

```python
import requests

respuesta = requests.get("https://httpbin.org/cookies/set/token/xyz")

for cookie in respuesta.cookies:
    print(f"Nombre: {cookie.name}")
    print(f"Valor: {cookie.value}")
    print(f"Dominio: {cookie.domain}")
    print(f"Ruta: {cookie.path}")
    print(f"Expiración: {cookie.expires}")
    print(f"Segura (HTTPS): {cookie.secure}")

```

## 4.4. Envío de cookies en la petición

Para interactuar con servicios web que requieren mantener un estado —como un carrito de compras o una sesión de usuario activa—, es necesario enviar cookies almacenadas previamente de vuelta al servidor en cada petición subsiguiente. El protocolo HTTP realiza esto empaquetando dichos datos dentro de la cabecera `Cookie`.

La biblioteca `requests` simplifica este proceso permitiéndote adjuntar cookies directamente a través del parámetro opcional `cookies`.

### Envío de cookies mediante diccionarios

La forma más directa y común de suministrar cookies en una petición es pasando un diccionario estándar de Python al parámetro `cookies`. Las claves del diccionario corresponden a los nombres de las cookies y los valores a su contenido textual.

```python
import requests

url = "https://httpbin.org/cookies"

# Definición de las cookies que queremos enviar
mis_cookies = {
    "sesion_token": "987654321_abc",
    "preferencia_tema": "oscuro"
}

# Realizar la petición pasando el diccionario
respuesta = requests.get(url, cookies=mis_cookies)

# El servidor de prueba httpbin nos devuelve las cookies que ha recibido
print(respuesta.text)

```

Cuando ejecutas este código, el servidor analiza la cabecera `Cookie` enviada por `requests` y confirma la recepción de los parámetros especificados en el diccionario.

### Uso avanzado con `RequestsCookieJar`

Aunque un diccionario cubre la mayoría de las necesidades básicas, carece de la capacidad de asociar metadatos a las cookies. Si necesitas enviar cookies asociadas estrictamente a un dominio específico o a una ruta concreta dentro del servidor, debes construir y pasar un objeto `RequestsCookieJar`.

Esto es especialmente útil cuando realizas peticiones que interactúan con múltiples subdominios y deseas evitar que una cookie confidencial se envíe por error a un destino equivocado.

```python
import requests

url = "https://httpbin.org/cookies"

# Instanciación de un tarro de cookies vacío
tarro = requests.cookies.RequestsCookieJar()

# Añadir una cookie especificando el dominio y la ruta de validez
tarro.set(
    "auth_cookie", 
    "secure_value_123", 
    domain="httpbin.org", 
    path="/cookies"
)

# Añadir otra cookie válida para cualquier ruta del dominio
tarro.set(
    "tracker_id", 
    "xyz_999", 
    domain="httpbin.org", 
    path="/"
)

# Realizar la petición utilizando el objeto CookieJar
respuesta = requests.get(url, cookies=tarro)
print(respuesta.text)

```

## Resumen del capítulo

En este cuarto capítulo, hemos explorado los mecanismos que ofrece la biblioteca `requests` para personalizar el contexto y mantener el estado de las peticiones HTTP mediante cabeceras y cookies:

* **Cabeceras personalizadas (4.1):** Aprendimos a utilizar el parámetro `headers` enviando diccionarios para interactuar con APIs que requieren metadatos o claves específicas, aprovechando el comportamiento insensible a mayúsculas y minúsculas interno de la biblioteca.
* **Simulación del User-Agent (4.2):** Analizamos la importancia de modificar la identidad de nuestros scripts para emular el comportamiento de navegadores web legítimos y sortear restricciones perimetrales o bloqueos automáticos en el servidor.
* **Lectura de cookies (4.3):** Estudiamos cómo `requests` intercepta de manera automática las cookies del servidor en el objeto `RequestsCookieJar` y cómo podemos consultarlas de forma segura o transformarlas en diccionarios nativos.
* **Envío de cookies (4.4):** Demostramos los métodos para adjuntar cookies en nuestras solicitudes salientes, tanto con diccionarios simples como mediante el uso avanzado de objetos estructurados con restricciones de dominio y ruta.
