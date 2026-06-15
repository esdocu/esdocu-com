Dominar el enrutamiento y flujo de las peticiones es esencial en entornos profesionales. Este capítulo aborda la configuración y gestión avanzada del tráfico web mediante la biblioteca `requests`. Primero, exploraremos cómo desviar peticiones a través de proxies HTTP/HTTPS básicos y autenticados para superar restricciones de red o auditar tráfico de forma segura. Después, analizaremos cómo controlar de manera estricta las redirecciones del servidor, permitiendo detener o rastrear cada salto intermedio. Finalmente, veremos cómo automatizar estas configuraciones de forma limpia y profesional utilizando las variables de entorno del sistema operativo.

## 11.1. Configuración de proxies HTTP y HTTPS

En entornos corporativos, redes de investigación o durante el análisis de tráfico web, es común que las peticiones no deban o no puedan salir directamente hacia el servidor de destino. Para estos casos se utilizan los proxies, servidores intermediarios que reciben tus peticiones web, las redirigen a los servidores correspondientes en internet y te devuelven la respuesta.

```text
+-------------+               +--------------+               +----------------------+
| Tu script   |  Petición     |  Servidor    |  Petición     | Servidor de Destino  |
| con Python  | ------------> |  Proxy       | ------------> | (ej. api.github.com) |
| y requests  |               |  Intermedio  |               |                      |
|             | <------------ |              | <------------ |                      |
|             |  Respuesta    |              |  Respuesta    |                      |
+-------------+               +--------------+               +----------------------+

```

La biblioteca `requests` facilita el enrutamiento de peticiones a través de proxies mediante el uso del parámetro `proxies`, el cual acepta un diccionario de Python.

### Estructura del diccionario de proxies

El diccionario mapea el protocolo de la petición saliente (`http` o `https`) con la URL del servidor proxy que debe procesar dicha petición. La sintaxis básica para declarar este diccionario es la siguiente:

```python
proxies = {
    "http": "http://direccion_del_proxy:puerto",
    "https": "http://direccion_del_proxy:puerto",
}

```

Es un error común pensar que la clave `"https"` requiere obligatoriamente que la URL del proxy comience con `https://`. En la mayoría de las redes, el servidor proxy se comunica con tu script local a través de HTTP sin cifrar, incluso cuando actúa como un túnel para peticiones HTTPS cifradas hacia el exterior. Por lo tanto, usar `http://` en el valor de la clave `"https"` es perfectamente normal y habitual.

### Implementación en código

Para aplicar esta configuración, simplemente debes pasar el diccionario creado al parámetro `proxies` de funciones como `requests.get()` o `requests.post()`.

```python
import requests

# Definición de los servidores proxy para cada protocolo
mis_proxies = {
    "http": "http://192.168.1.100:8080",
    "https": "http://192.168.1.100:8080",
}

try:
    # Realizar una petición HTTPS usando el proxy configurado
    respuesta = requests.get(
        "https://api.github.com/events", proxies=mis_proxies, timeout=5
    )

    print(f"Código de estado: {respuesta.status_code}")
    print(f"Contenido del servidor obtenido con éxito a través del proxy.")

except requests.exceptions.RequestException as e:
    print(f"Error en la conexión a través del proxy: {e}")

```

### Configuración a nivel de esquema o dominio

`requests` utiliza por debajo la biblioteca `urllib3`, lo que te permite refinar el enrutamiento de manera más específica que la simple separación entre HTTP y HTTPS. Si necesitas que un proxy procese únicamente las peticiones dirigidas a un host o dominio específico, puedes incluir el nombre del host en la clave del diccionario:

```python
proxies_especificos = {
    # Este proxy solo se usará para peticiones HTTP a este subdominio exacto
    "http://api.ejemplo.com": "http://10.10.1.10:3128",
    # Este proxy se aplicará al resto de peticiones HTTPS globales
    "https": "http://10.10.1.11:3128",
}

```

Si realizas una petición a `[http://api.ejemplo.com/v1/usuarios](http://api.ejemplo.com/v1/usuarios)`, `requests` seleccionará el primer proxy listado. Si realizas una petición a `[http://otra-api.com](http://otra-api.com)`, esta no coincidirá con la regla específica ni tendrá un proxy HTTP global definido, por lo que se ejecutará como una conexión directa sin intermediarios.

## 11.2. Proxies con autenticación

En entornos profesionales y empresariales, el acceso a los servidores proxy suele estar restringido para evitar abusos de ancho de banda y garantizar la seguridad de la infraestructura. Cuando un proxy requiere validación, el script debe proporcionar credenciales (normalmente un usuario y una contraseña) para que el servidor intermediario acepte y procese la petición.

Si intentas enviar una petición a través de un proxy que requiere autenticación sin incluir tus credenciales, el servidor te devolverá un error HTTP con el código de estado **407 Proxy Authentication Required**.

### Inclusión de credenciales en la URL del proxy

La forma más directa y estándar de pasar las credenciales en `requests` es incrustarlas directamente dentro de la URL del proxy en el diccionario de configuración. El formato sigue la estructura clásica de autenticación en URLs: `http://usuario:contraseña@servidor:puerto`.

```text
 http:// usuario : contraseña @ 192.168.1.100 : 8080
 ──┬──   ───┬───   ────┬────   ──────┬──────   ──┬─
 Scheme   Usuario  Contraseña       Host      Puerto

```

### Implementación en código

A continuación se muestra cómo estructurar el diccionario de proxies e implementar la petición de forma segura:

```python
import requests

# Configuración del proxy incluyendo usuario y contraseña
proxies_autenticados = {
    "http": "http://mi_usuario:mi_password_secreto@192.168.1.100:8080",
    "https": "http://mi_usuario:mi_password_secreto@192.168.1.100:8080",
}

try:
    # Realizar la petición utilizando el proxy con credenciales
    respuesta = requests.get(
        "https://api.github.com/user", proxies=proxies_autenticados, timeout=5
    )

    print(f"Código de estado: {respuesta.status_code}")
    print("Autenticación con el proxy completada exitosamente.")

except requests.exceptions.ProxyError as e:
    print(f"Error de autenticación o conexión con el proxy: {e}")
except requests.exceptions.RequestException as e:
    print(f"Error general en la petición: {e}")

```

### Caracteres especiales en las contraseñas

Un problema técnico muy común surge cuando la contraseña asignada contiene caracteres especiales (como `@`, `:`, `/`, o `?`). Como estos caracteres tienen un significado estructural dentro de una URL, confundirán a `requests` y a `urllib3` al desglosar la dirección del proxy, rompiendo la conexión.

Para solucionar este inconveniente, es obligatorio codificar la contraseña utilizando el formato *Percent-encoding* (codificación URL). Python incluye la biblioteca nativa `urllib.parse` para realizar esta tarea de forma limpia:

```python
import requests
from urllib.parse import quote_plus

# Supongamos que tu contraseña contiene caracteres conflictivos
usuario = "empleado_01"
password_compleja = "P@$$w0rd:2026/"

# Codificación de los componentes para hacerlos seguros en la URL
usuario_codificado = quote_plus(usuario)
password_codificada = quote_plus(password_complexa)

# Construcción dinámica de la cadena del proxy
proxy_url = f"http://{usuario_codificado}:{password_codificada}@proxy.empresa.com:8080"

mis_proxies = {"http": proxy_url, "https": proxy_url}

# La URL resultante procesará correctamente los caracteres especiales
# Ejemplo de salida de la URL: http://empleado_01:P%40%24%24w0rd%3A2026%2F@proxy.empresa.com:8080

```

## 11.3. Control estricto de redirecciones

Cuando realizas una petición a una URL y el servidor responde con un código de estado de la serie 3xx (como el clásico **301 Moved Permanently** o **302 Found**), significa que el recurso solicitado se encuentra en otra ubicación. Por defecto, la biblioteca `requests` gestiona estas situaciones de forma transparente, siguiendo automáticamente la redirección hasta llegar a la página o recurso final.

Sin embargo, en el desarrollo técnico o la auditoría de APIs, este comportamiento automatizado no siempre es el deseado. A veces necesitas analizar minuciosamente las cabeceras intermedias que envía el servidor original antes de saltar al siguiente destino.

### El parámetro allow_redirects

Para modificar este comportamiento, todos los métodos principales de petición (`requests.get()`, `requests.post()`, `requests.delete()`, etc.) aceptan el parámetro booleano `allow_redirects`.

* **`allow_redirects=True`**: Comportamiento por defecto para métodos como GET, OPTIONS y HEAD (en las versiones modernas de la biblioteca). El script sigue de forma invisible la cadena de redirecciones.
* **`allow_redirects=False`**: Desactiva el seguimiento automático. La biblioteca se detendrá inmediatamente tras recibir la primera respuesta del servidor, permitiéndote inspeccionar los códigos de estado 3xx.

### Desactivar redirecciones para auditoría de respuestas

Cuando impides que `requests` siga la redirección, el objeto `Response` devuelto corresponderá a la respuesta inicial del servidor original. Esto te permite capturar la cabecera `Location`, que es la propiedad HTTP que indica la dirección URL a la cual se pretendía redirigir al cliente.

```python
import requests

url_con_redireccion = "http://github.com"  # Redirige automáticamente a https://github.com

# Realizamos la petición bloqueando el salto automático
respuesta = requests.get(url_con_redireccion, allow_redirects=False)

print(f"Código de estado original: {respuesta.status_code}")

if respuesta.status_code in [301, 302, 307, 308]:
    # Extraemos la dirección de destino desde las cabeceras
    url_destino = respuesta.headers.get("Location")
    print(f"El servidor intentó redirigir el tráfico hacia: {url_destino}")

```

### Inspección del historial de redirecciones

Si decides permitir las redirecciones (`allow_redirects=True`), `requests` no descarta la información de las respuestas previas. Almacena cada una de las respuestas intermedias dentro de una lista en la propiedad `.history` del objeto `Response` final.

Los objetos dentro de `.history` están ordenados cronológicamente, desde la primera petición realizada hasta la penúltima.

```python
import requests

# Permitimos el comportamiento por defecto (ir hasta el destino final)
respuesta_final = requests.get("http://github.com")

print(f"URL de llegada final: {respuesta_final.url}")
print(f"Número de saltos intermedios: {len(respuesta_final.history)}")

# Recorremos el historial para ver el camino que tomó la petición
for indice, respuesta_intermedia in enumerate(respuesta_final.history, start=1):
    print(
        f"Salto #{indice}: {respuesta_intermedia.url} [Código: {respuesta_intermedia.status_code}]"
    )

```

Este control y rastreo resulta indispensable cuando se necesita validar la seguridad de los enlaces o para depurar bucles infinitos de redirección provocados por malas configuraciones en el servidor web de destino.

## 11.4. Uso de variables de entorno para proxies

Configurar los proxies directamente dentro del código fuente mediante diccionarios es muy útil para scripts locales o herramientas de un solo uso. Sin embargo, en aplicaciones destinadas a producción, contenedores o entornos de integración continua, guardar credenciales y direcciones IP de red de forma fija (*hardcoded*) es una mala práctica de desarrollo y seguridad.

La biblioteca `requests` ofrece un mecanismo nativo para solucionar este problema: si no pasas explícitamente el parámetro `proxies` en tu función, la biblioteca buscará y adoptará automáticamente la configuración de proxies definida en las **variables de entorno** de tu sistema operativo.

### Variables de entorno estándar

`requests` reconoce las variables estándar del sistema tanto en mayúsculas como en minúsculas. Las variables principales son:

* **`http_proxy` / `HTTP_PROXY`**: Define el servidor proxy que se utilizará para todas las peticiones con esquema HTTP.
* **`https_proxy` / `HTTPS_PROXY`**: Define el servidor proxy que se utilizará para todas las peticiones con esquema HTTPS.
* **`no_proxy` / `NO_PROXY`**: Contiene una lista de dominios o direcciones IP separados por comas que deben ser ignorados por el proxy, forzando una conexión directa (por ejemplo, subdominios locales o `localhost`).

La sintaxis del valor de estas variables es idéntica a la cadena que usábamos en los diccionarios, incluyendo la opción de autenticación:

```bash
# Ejemplo de configuración en sistemas basados en Unix/Linux/macOS
export HTTP_PROXY="http://usuario:password@proxy.empresa.com:8080"
export HTTPS_PROXY="http://usuario:password@proxy.empresa.com:8080"
export NO_PROXY="localhost,127.0.0.1,.miempresa.internal"

```

### Uso transparente desde el código

Cuando estas variables están presentes en el entorno donde se ejecuta el script, tu código de Python se simplifica drásticamente. Ya no necesitas importar diccionarios ni gestionar credenciales en el texto del programa:

```python
import requests

try:
    # requests lee de forma automática las variables del sistema operativo.
    # No hace falta declarar el parámetro proxies.
    respuesta = requests.get("https://api.github.com/events", timeout=5)

    print(f"Petición exitosa. Código de estado: {respuesta.status_code}")
    print(f"URL final alcanzada: {respuesta.url}")

except requests.exceptions.RequestException as e:
    print(f"Error en la petición: {e}")

```

### Desactivar temporalmente el uso de variables de entorno

Si tu sistema operativo tiene proxies globales configurados a través de variables de entorno, pero necesitas que un script de Python específico se salte por completo este comportamiento e interactúe de forma directa con internet, puedes anular la lectura del entorno pasando un diccionario vacío al parámetro `proxies`:

```python
import requests

# Pasar un diccionario vacío fuerza a requests a ignorar HTTP_PROXY y HTTPS_PROXY
respuesta_directa = requests.get("https://api.github.com/events", proxies={})

```

## Resumen del capítulo

En este **Capítulo 11: Proxies y Redirecciones**, hemos aprendido a controlar minuciosamente la ruta y el comportamiento de nuestras peticiones en la red:

* **Configuración básica:** Vimos cómo utilizar el parámetro `proxies` mediante diccionarios para enrutar el tráfico HTTP y HTTPS de forma independiente hacia servidores intermediarios.
* **Autenticación en proxies:** Aprendimos a incrustar credenciales seguras de usuario y contraseña dentro de las URLs de los proxies, resolviendo problemas de caracteres especiales con la codificación URL.
* **Control de redirecciones:** Exploramos el uso del parámetro `allow_redirects=False` para detener peticiones en códigos de estado 3xx, inspeccionar la cabecera `Location` y auditar la cadena de saltos mediante la propiedad `.history`.
* **Variables de entorno:** Analizamos el método recomendado para entornos de producción, delegando la gestión de proxies en las variables globales del sistema (`HTTP_PROXY`, `HTTPS_PROXY` y `NO_PROXY`) para escribir código más limpio y seguro.
