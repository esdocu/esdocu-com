Para interactuar con la mayoría de las APIs web modernas, no basta con saber enviar peticiones; es fundamental validar la identidad de nuestra aplicación ante el servidor. Este capítulo aborda de forma práctica cómo integrar diferentes mecanismos de seguridad utilizando la biblioteca `requests`. Exploraremos desde la clásica autenticación HTTP básica y el protocolo robusto de desafío/respuesta Digest, hasta el uso moderno de tokens Bearer (OAuth 2.0). Finalmente, aprenderás a extender las capacidades de la biblioteca heredando de `AuthBase` para diseñar tus propias clases de autenticación personalizadas y adaptarte a cualquier infraestructura de seguridad corporativa.

## 9.1. Autenticación HTTP Básica

La **Autenticación HTTP Básica** (Basic Authentication) es uno de los métodos más antiguos y simples para restringir el acceso a los recursos de un servidor web. Este mecanismo se basa en el envío de un par de credenciales (usuario y contraseña) directamente dentro de las cabeceras de la petición HTTP.

### El Mecanismo de Autenticación Básica

Cuando utilizas este esquema, `requests` se encarga de empaquetar tus credenciales siguiendo el estándar RFC 7617. El proceso técnico sigue estos pasos:

1. Combina el nombre de usuario y la contraseña usando dos puntos como separador (`usuario:contraseña`).
2. Codifica la cadena resultante en formato **Base64**.
3. Añade el resultado a la cabecera `Authorization` precedido por la palabra clave `Basic`.

A continuación se muestra el flujo de datos simplificado:

```text
+---------------------+
| usuario:contraseña  |
+---------------------+
           |
           v  (Codificación Base64)
+---------------------+
| dXN1YXJpbzpjb250... |
+---------------------+
           |
           v  (Construcción de la cabecera)
Authorization: Basic dXN1YXJpbzpjb250cmFzZcOxYQ==

```

> **Advertencia de Seguridad:** La codificación Base64 **no es una forma de cifrado**. Es un simple método de representación de datos que cualquiera puede revertir fácilmente. Por esta razón, la autenticación básica **solo debe utilizarse sobre conexiones cifradas HTTPS**. Si la utilizas sobre HTTP convencional, tus credenciales viajarán expuestas en texto plano por la red.

### Implementación en `requests`

La biblioteca `requests` ofrece una forma extremadamente intuitiva de aplicar este método sin necesidad de formatear manualmente las cabeceras. Puedes hacerlo de dos formas: pasando una tupla directamente al parámetro `auth`, o importando explícitamente la clase de utilidad `HTTPBasicAuth`.

#### Método 1: Uso de la Tupla Directa (Recomendado)

Esta es la forma más limpia y común. Cuando pasas una tupla de dos elementos `(usuario, contraseña)` al parámetro `auth`, `requests` asume automáticamente que deseas utilizar la autenticación básica.

```python
import requests

url = "https://api.ejemplo.com/datos-protegidos"
credenciales = ("mi_usuario", "mi_clave_secreta")

# Realizamos la petición pasando la tupla en el parámetro auth
respuesta = requests.get(url, auth=credenciales)

if respuesta.status_code == 200:
    print("Acceso concedido.")
    print(respuesta.json())
elif respuesta.status_code == 401:
    print("Credenciales incorrectas o recurso no autorizado.")

```

#### Método 2: Uso de la clase `HTTPBasicAuth`

Si prefieres que tu código sea explícito en cuanto al mecanismo de seguridad que estás utilizando, puedes importar `HTTPBasicAuth` desde el módulo `requests.auth`. El resultado final a nivel de red es exactamente idéntico al método anterior.

```python
import requests
from requests.auth import HTTPBasicAuth

url = "https://api.ejemplo.com/datos-protegidos"

# Instanciamos la clase con nuestras credenciales
autenticacion = HTTPBasicAuth("mi_usuario", "mi_clave_secreta")

# Pasamos el objeto al parámetro auth
respuesta = requests.get(url, auth=autenticacion)

print(f"Código de estado: {respuesta.status_code}")

```

### Detrás de Escena: Inspección de la Cabecera Generada

Para verificar cómo `requests` gestiona esta información de manera transparente, podemos inspeccionar las cabeceras que se prepararon para el envío utilizando la propiedad `request.headers` del objeto de respuesta:

```python
import requests

respuesta = requests.get("https://httpbin.org/basic-auth/user/passwd", auth=("user", "passwd"))

# Accedemos a la cabecera Authorization enviada por el cliente
cabecera_auth = respuesta.request.headers.get("Authorization")
print(f"Cabecera enviada: {cabecera_auth}")
# Salida: Cabecera enviada: Basic dXNlcjpwYXNzd2Q=

```

## 9.2. Autenticación Digest

La **Autenticación HTTP Digest** (Digest Access Authentication) se introdujo en el estándar RFC 2617 como una alternativa sustancialmente más segura que la autenticación básica. Su propósito principal es permitir que un usuario demuestre que conoce una contraseña válida sin necesidad de enviarla nunca a través de la red, mitigando así el riesgo de que sea interceptada en tránsito.

### El Mecanismo del "Desafío y Respuesta"

A diferencia de la autenticación básica, que envía las credenciales inmediatamente en la primera solicitud, la autenticación Digest funciona mediante un flujo de **desafío y respuesta** (challenge-response).

El proceso sigue un protocolo estricto de cuatro pasos:

```text
Cliente                                         Servidor
   |                                               |
   | 1. GET /recurso-protegido -------------------->|
   |                                               |
   | <--- 2. 401 Unauthorized (incluye nonce) -----|
   |                                               |
   | 3. GET /recurso-protegido (con hash MD5) ---->|
   |                                               |
   | <--- 4. 200 OK (Recurso entregado) -----------|
   v                                               v

```

1. **Petición Inicial:** El cliente intenta acceder a un recurso protegido sin enviar credenciales.
2. **Desafío del Servidor:** El servidor rechaza la petición con un código de estado `401 Unauthorized`. Dentro de la cabecera `WWW-Authenticate`, incluye un parámetro crítico llamado **nonce** (un número de un solo uso generado dinámicamente) y el valor del **realm** (el dominio de seguridad).
3. **Cálculo del Hash (Respuesta):** El cliente toma el usuario, la contraseña, el *realm*, el *nonce*, el método HTTP y la URL del recurso. Con estos elementos, calcula un código **hash criptográfico** (generalmente utilizando el algoritmo MD5) y vuelve a enviar la petición incluyendo este hash en la cabecera `Authorization`.
4. **Verificación:** El servidor, que también conoce la contraseña del usuario, realiza el mismo cálculo matemático localmente. Si el hash que él calcula coincide con el hash enviado por el cliente, valida la identidad y devuelve el recurso con un código `200 OK`.

Dado que el hash incluye el *nonce* (que cambia constantemente), un atacante que capture la cabecera no podrá reutilizar ese hash para realizar un "ataque de repetición" en el futuro, ya que el *nonce* habrá expirado.

### Implementación en `requests`

Debido a la complejidad matemática de calcular los hashes combinando los *nonces* del servidor y los contadores del cliente, no es posible utilizar una simple tupla para este método. La biblioteca `requests` delega este comportamiento en la clase especializada `HTTPDigestAuth`, ubicada en el módulo `requests.auth`.

A continuación se detalla cómo realizar una petición protegida con Digest:

```python
import requests
from requests.auth import HTTPDigestAuth

url = "https://httpbin.org/digest-auth/auth/usuario_demo/clave_demo"

# Instanciamos la clase específica para autenticación Digest
autenticacion_digest = HTTPDigestAuth("usuario_demo", "clave_demo")

# Pasamos el objeto al parámetro auth de la petición
respuesta = requests.get(url, auth=autenticacion_digest)

if respuesta.status_code == 200:
    print("Autenticación Digest exitosa.")
    print(respuesta.json())
else:
    print(f"Error de autenticación. Código de estado: {respuesta.status_code}")

```

### Comportamiento Interno de `requests`

Cuando ejecutas el código anterior, suceden dos peticiones reales bajo el capó de forma completamente transparente para ti:

1. `requests` envía la solicitud inicial en texto limpio.
2. Al recibir el código `401`, la biblioteca intercepta la respuesta, extrae el *nonce* del servidor, calcula el hash MD5 correspondiente, construye la nueva cabecera y vuelve a disparar la petición de forma automática.

Tú solo recibes el objeto `Response` final de la transacción exitosa.

## 9.3. Uso de tokens Bearer

El esquema de autenticación **Bearer** (también conocido como autenticación por token de portador) es el estándar de facto en las APIs web modernas, arquitecturas de microservicios y protocolos como OAuth 2.0. Su filosofía se basa en una premisa simple: cualquier entidad que "porte" (bear) el token válido tiene acceso automático a los recursos, sin necesidad de demostrar la posesión de una contraseña en cada llamada.

A diferencia de los métodos analizados anteriormente, el token Bearer suele ser una cadena de caracteres opaca o un artefacto estructurado (como un JSON Web Token o JWT) generado por un servidor de autorización tras un inicio de sesión previo.

### La Cabecera Authorization

Para autenticarse ante una API que utiliza este mecanismo, el token debe enviarse en cada petición HTTP dentro de la cabecera estándar `Authorization`. El formato requiere estrictamente la palabra clave `Bearer` seguida de un espacio en blanco y el token correspondiente:

```http
Authorization: Bearer <tu_token_aqui>

```

A nivel de red, la estructura de la petición se ve de la siguiente manera:

```text
+-----------------------------------------------------------+
| GET /v1/usuario/perfil HTTP/1.1                           |
| Host: api.servicio.com                                    |
| Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpX... |
+-----------------------------------------------------------+

```

### Implementación en `requests`

Dado que la autenticación Bearer se gestiona inyectando una cadena directamente en las cabeceras HTTP, la biblioteca `requests` no incluye una clase nativa como `HTTPBearerAuth` en su módulo base. La forma más directa y eficiente de implementarla es definiendo el token dentro del diccionario de cabeceras (`headers`) personalizadas de la petición.

A continuación se muestra cómo estructurar y enviar una petición utilizando este método:

```python
import requests

url = "https://api.ejemplo.com/v2/metricas"
token_acceso = "abc123xyz789_mi_token_seguro"

# Definimos las cabeceras incluyendo la estructura Bearer exacta
cabeceras = {
    "Authorization": f"Bearer {token_acceso}",
    "Accept": "application/json"
}

# Realizamos la petición pasando el diccionario al parámetro headers
respuesta = requests.get(url, headers=cabeceras)

if respuesta.status_code == 200:
    print("Conexión exitosa mediante Token Bearer.")
    print(respuesta.json())
elif respuesta.status_code == 401:
    print("Token inválido, expirado o mal estructurado.")

```

### Buenas Prácticas al Trabajar con Tokens

* **Uso imperativo de HTTPS:** Al igual que la autenticación básica, los tokens Bearer viajan expuestos en la cabecera. Si un atacante intercepta el tráfico en una red insegura (HTTP), podrá suplantar tu identidad por completo sin conocer jamás tu contraseña de usuario.
* **Separación de responsabilidades:** Evita escribir los tokens directamente en el código fuente (*hardcoding*). Es una práctica recomendada de seguridad cargarlos dinámicamente desde variables de entorno del sistema operativo.

```python
import os
import requests

# Recuperamos el token de forma segura desde el entorno
TOKEN = os.environ.get("API_BEARER_TOKEN")

cabeceras = {"Authorization": f"Bearer {TOKEN}"}
respuesta = requests.get("https://api.ejemplo.com/recurso", headers=cabeceras)

```

## 9.4. Creación de clases de autenticación

Aunque la biblioteca `requests` cubre la mayoría de los escenarios estándar con sus herramientas nativas, muchas APIs modernas implementan flujos de seguridad propietarios o complejos. Esto incluye firmas criptográficas personalizadas basadas en el tiempo, rotación dinámica de cabeceras o cálculo de hashes sobre el cuerpo de la petición.

Para gestionar estos casos sin ensuciar el código principal con lógica repetitiva, `requests` expone una arquitectura extensible basada en la clase abstracta **`AuthBase`**. Cualquier clase que herede de ella puede pasarse directamente al parámetro `auth` de las peticiones, permitiendo encapsular por completo la lógica de seguridad.

### El Mecanismo de Extensibilidad

Para crear un mecanismo de autenticación propio, tu clase debe cumplir con dos requisitos fundamentales:

1. Heredar de la clase base `requests.auth.AuthBase`.
2. Implementar obligatoriamente el método mágico `__call__`.

El método `__call__` recibe como parámetro el objeto que representa la petición HTTP antes de ser enviada (`PreparedRequest`). Dentro de este método, puedes modificar la petición a tu antojo —añadiendo cabeceras, alterando la URL o modificando los parámetros— para finalmente retornar la propia petición modificada.

```text
                  +-------------------------+
                  |  requests.get(..., auth) |
                  +------------+------------+
                               |
                               v
               +-------------------------------+
               | ClasePersonalizada.__call__() |
               +---------------+---------------+
                               |
            (Modifica cabeceras / PreparedRequest)
                               |
                               v
                  +-------------------------+
                  |   Envío de la petición  |
                  +-------------------------+

```

### Ejemplo Práctico: Autenticación por Clave de API Personalizada

Imagina una API corporativa que exige que cada petición firme las cabeceras con un identificador de cliente (`X-Client-ID`) y un token dinámico que cambia según la hora actual (`X-App-Token`).

A continuación se muestra cómo estructurar esta lógica dentro de una clase reutilizable:

```python
import time
import requests
from requests.auth import AuthBase

class CustomTokenAuth(AuthBase):
    """Implementación de autenticación personalizada para la API Corporativa."""
    
    def __init__(self, client_id, secret_key):
        # Inicializamos los atributos básicos requeridos para la lógica
        self.client_id = client_id
        self.secret_key = secret_key

    def __call__(self, request):
        # 1. Generamos un token dinámico basado en la marca de tiempo actual
        timestamp = int(time.time())
        token_dinamico = f"{self.secret_key}_{timestamp}"
        
        # 2. Inyectamos las cabeceras personalizadas en el objeto request
        request.headers["X-Client-ID"] = self.client_id
        request.headers["X-App-Token"] = token_dinamico
        
        # 3. Retornamos la petición modificada (obligatorio)
        return request

# --- Uso de la clase personalizada ---

url = "https://api.empresa.local/v1/reportes"

# Instanciamos nuestro objeto de autenticación personalizado
mi_seguridad = CustomTokenAuth(client_id="app_produccion_01", secret_key="super_secreto")

# Pasamos el objeto directamente al parámetro auth
respuesta = requests.get(url, auth=mi_seguridad)

print(f"Estado de la respuesta: {respuesta.status_code}")

```

Al utilizar este enfoque, logras que tu código principal permanezca limpio, legible y modular, abstrayendo los detalles técnicos de la infraestructura de seguridad.

## Resumen del capítulo

En este **Capítulo 9: Métodos de Autenticación**, hemos explorado las diferentes alternativas que ofrece la biblioteca `requests` para interactuar de forma segura con APIs protegidas:

* **Autenticación Básica (9.1):** El esquema más simple que codifica el par usuario/contraseña en Base64 dentro de la cabecera `Authorization`. Aprendimos a usar la tupla directa `(user, pass)` para automatizar su creación de forma nativa.
* **Autenticación Digest (9.2):** Un protocolo robusto basado en el flujo de desafío y respuesta. Vimos cómo la clase especializada `HTTPDigestAuth` se encarga de gestionar los reintentos automáticos y el cálculo de hashes MD5 de manera transparente.
* **Tokens Bearer (9.3):** El estándar moderno para arquitecturas orientadas a servicios (como OAuth 2.0). Analizamos cómo inyectar manualmente tokens y JWTs mediante el diccionario estándar de cabeceras de la petición.
* **Clases de Autenticación Personalizadas (9.4):** La herramienta definitiva de extensibilidad. Aprendimos a heredar de `AuthBase` e implementar el método `__call__` para interceptar la petición y construir sistemas de seguridad a medida.
