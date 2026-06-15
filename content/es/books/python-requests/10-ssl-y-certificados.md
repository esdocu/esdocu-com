La seguridad es el pilar fundamental al consumir servicios web. En este capítulo, aprenderás cómo la biblioteca `requests` protege tus datos asegurando que cada comunicación sea cifrada y auténtica. Exploraremos el funcionamiento de la verificación automática de certificados mediante el paquete `certifi` y cómo gestionar entornos corporativos usando entidades de certificación personalizadas. Además, cubriremos la autenticación mutua TLS (mTLS) mediante certificados de cliente y aprenderás a mitigar de forma segura y silenciosa las advertencias de seguridad en entornos locales de prueba o desarrollo.

## 10.1. Verificación de certificados SSL

Por defecto, cada vez que realizas una petición HTTPS utilizando la biblioteca `requests`, esta verifica automáticamente el certificado SSL/TLS del servidor remoto. Este proceso garantiza que la comunicación esté cifrada y, lo más importante, que te estás conectando al servidor auténtico y no a un impostor que intenta interceptar tus datos.

### ¿Cómo funciona la verificación automática?

Cuando ejecutas `requests.get('[https://example.com](https://example.com)')`, la biblioteca delega la validación de la capa de seguridad a `urllib3` y al paquete `certifi`. `certifi` proporciona una colección actualizada de Autoridades de Certificación (CAs) confiables.

Si el certificado del servidor fue firmado por una de estas CAs raíz autorizadas, la petición prospera con normalidad.

```text
Tu script (requests) --------> Petición HTTPS --------> Servidor Remoto
          ^                                                   |
          | <--------------- Envía Certificado SSL <----------|
          v
¿Firmado por CA confiable? 
  * SÍ: Retorna objeto Response.
  * NO: Lanza exception SSLError.

```

### El parámetro `verify`

El comportamiento de esta validación se controla mediante el parámetro `verify`, el cual acepta tres tipos de valores: `True` (por defecto), `False`, o una ruta de texto hacia un certificado local.

#### 1. Validación estricta (Comportamiento por defecto)

No es necesario declararlo explícitamente, pero escribirlo te ayuda a asegurar que el código mantenga un comportamiento seguro independientemente de configuraciones globales.

```python
import requests

try:
    # verify=True fuerza la comprobación del certificado SSL
    response = requests.get('https://api.github.com', verify=True)
    print(f"Conexión segura establecida. Estado: {response.status_code}")
except requests.exceptions.SSLError as e:
    print(f"Error de seguridad SSL: {e}")

```

#### 2. Uso de un paquete de certificados (CA Bundle) personalizado

En entornos corporativos o redes privadas, es común que los servidores utilicen certificados firmados por una CA interna de la empresa que no está incluida en el paquete estándar de `certifi`.

Para que `requests` confíe en esa entidad, puedes pasarle la ruta del archivo `.pem` que contiene el certificado de la CA de confianza al parámetro `verify`.

```python
import requests

# Ruta al archivo que contiene los certificados de confianza de tu organización
ca_bundle_path = '/ruta/al/certificado/corporativo_ca.pem'

try:
    response = requests.get('https://intranet.miempresa.local', verify=ca_bundle_path)
    print("Conexión interna exitosa y verificada.")
except requests.exceptions.SSLError as e:
    print(f"No se pudo validar el certificado interno: {e}")

```

> **Nota de alcance:** También puedes apuntar `verify` hacia un directorio que contenga múltiples certificados de CAs de confianza, siempre y cuando dicho directorio haya sido procesado previamente con la utilidad `c_rehash` de OpenSSL.

### Fallos comunes en la verificación

Si el certificado del servidor ha expirado, está autofirmado (y no has provisto el archivo `.pem`), o el nombre del dominio no coincide con el certificado (Common Name mismatch), `requests` abortará la operación inmediatamente lanzando una excepción `requests.exceptions.SSLError`.

Es fundamental capturar esta excepción de manera específica para evitar que fallos en el handshake (apretón de manos) de seguridad tiren abajo toda tu aplicación.

## 10.2. Certificados de cliente personalizados

Mientras que la verificación SSL estándar (cubierta en la sección anterior) permite al cliente asegurarse de la identidad del servidor, la **autenticación mutua TLS** (mTLS) o autenticación de cliente requiere que el propio cliente demuestre su identidad ante el servidor enviando su propio certificado digital.

Este mecanismo es ampliamente utilizado en APIs bancarias, entornos corporativos estrictos y microservicios para añadir una capa de seguridad criptográfica robusta más allá de las contraseñas o tokens tradicionales.

```text
+------------------+                    +------------------+
|                  | --- 1. Petición -> |                  |
|                  | <- 2. Cert Srv --- |                  |
| Cliente (Tu script|                    | Servidor Remoto  |
|  con requests)   | --- 3. Cert Cli -> |                  |
|                  | <- 4. Acceso OK -- |                  |
+------------------+                    +------------------+

```

### El parámetro `cert`

Para enviar tus credenciales TLS al servidor, la biblioteca `requests` proporciona el parámetro `cert`. Este parámetro acepta una cadena de texto con la ruta del archivo o una tupla con dos elementos, dependiendo de cómo tengas almacenadas tus claves.

Los archivos deben estar en formato **PEM**. El flujo de autenticación mutua requiere dos componentes:

1. El certificado del cliente (público).
2. La clave privada correspondiente.

#### Opción A: Archivo único unificado

Si tu certificado y tu clave privada se encuentran dentro del mismo archivo `.pem`, puedes pasar simplemente la ruta de dicho archivo como un `string`.

```python
import requests

# El archivo contiene tanto el bloque -----BEGIN CERTIFICATE----- como -----BEGIN PRIVATE KEY-----
certificado_unificado = '/rutas/seguras/cliente_completo.pem'

try:
    response = requests.get('https://api.banco.com/v1/balances', cert=certificado_unificado)
    print(f"Autenticación mTLS exitosa. Respuesta: {response.status_code}")
except requests.exceptions.SSLError as e:
    print(f"Error en el handshake TLS mutuo: {e}")

```

#### Opción B: Certificado y clave en archivos separados

Si tu infraestructura almacena el certificado público en un archivo (por ejemplo, `.crt` o `.pem`) y la clave privada en otro archivo `.key`, debes pasar una tupla estructurada como `(ruta_certificado, ruta_clave)`.

```python
import requests

cert_publico = '/rutas/seguras/mi_certificado.crt'
clave_privada = '/rutas/seguras/mi_clave_privada.key'

try:
    # Pasamos la configuración como una tupla
    response = requests.get(
        'https://servicio.interno.local/secure-api', 
        cert=(cert_publico, clave_privada)
    )
    print(f"Conexión mTLS establecida. Datos recibidos: {response.json()}")
except requests.exceptions.SSLError as e:
    print(f"Fallo de autenticación de cliente: {e}")

```

### Advertencias importantes sobre la seguridad de las claves

* **Claves desprotegidas:** La clave privada que proveas a `requests` **no debe tener contraseña** (passphrase). La biblioteca estándar de `requests` no soporta de forma nativa la interacción en consola o el paso de argumentos para descifrar claves privadas protegidas por contraseña en el parámetro `cert`.
* **Permisos del sistema de archivos:** Asegúrate de que los archivos de tus certificados de cliente —especialmente la clave privada— tengan permisos de lectura sumamente restrictivos en tu sistema operativo (por ejemplo, `chmod 400 mi_clave_privada.key` en entornos Unix/Linux) para evitar filtraciones de credenciales a otros usuarios del sistema.

## 10.3. Ignorar advertencias SSL de forma segura

Durante las etapas de desarrollo local, pruebas de integración o cuando trabajas en redes de laboratorio con dispositivos antiguos (como routers o switches de prueba), a menudo te toparás con entornos que utilizan certificados SSL/TLS autofirmados o configuraciones de dominio que fallan en la verificación estricta.

Si intentas conectar con ellos, `requests` bloqueará la petición arrojando un error `SSLError`. Para evitar que el flujo de tu aplicación se detenga en estos escenarios de prueba controlados, puedes optar por deshabilitar explícitamente la verificación, aunque esto requiere mitigar el ruido visual de las advertencias que Python generará.

> **Advertencia crítica de seguridad:** Deshabilitar la verificación SSL expone tu conexión a ataques de tipo Man-in-the-Middle (MitM), donde un tercero podría interceptar o alterar el tráfico. **Nunca utilices esta configuración en entornos de producción** o al transmitir datos sensibles a través de redes públicas.

### Deshabilitar la comprobación con `verify=False`

Para indicarle a `requests` que ignore por completo el estado y la validez del certificado del servidor, debes pasar el valor booleano `False` al parámetro `verify`.

```python
import requests

# Forzamos la omisión de la verificación SSL
respuesta = requests.get('https://localhost:8443/dev-api', verify=False)
print(f"Código de estado (con SSL ignorado): {respuesta.status_code}")

```

Al ejecutar el código anterior, la petición se completará con éxito, pero notarás que la consola muestra un mensaje de advertencia similar a este:

```text
InsecureRequestWarning: Unverified HTTPS request is being made to host 'localhost'. Adding certificate verification is strongly advised. See: https://urllib3.readthedocs.io/en/latest/advanced-usage.html#tls-warnings

```

### Silenciar las advertencias de `urllib3`

La advertencia de consola no es un error que rompa el script, sino una notificación de seguridad emitida por la biblioteca interna `urllib3`. Si estás construyendo herramientas de línea de comandos o scripts automatizados, este texto puede ensuciar los logs o la salida estándar.

Para ocultar esta advertencia de forma limpia y segura dentro del entorno de pruebas, debes usar la función `disable_warnings` del módulo `urllib3` que viene integrado en `requests`.

```python
import requests
# Importamos urllib3 directamente desde el espacio de nombres de requests
import requests.packages.urllib3 as urllib3

# Deshabilitamos específicamente las advertencias de peticiones inseguras
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Ahora la petición se realiza sin generar alertas visuales en la consola
respuesta = requests.get('https://192.168.1.50/admin', verify=False)
print(f"Conexión de prueba exitosa. Estado: {respuesta.status_code}")

```

### Alternativa mediante el módulo nativo `warnings`

Si prefieres no interactuar directamente con las entrañas de `requests.packages`, puedes conseguir exactamente el mismo resultado utilizando el módulo `warnings` de la biblioteca estándar de Python, filtrando la clase de advertencia específica:

```python
import warnings
import requests
from requests.packages.urllib3.exceptions import InsecureRequestWarning

# Filtramos la advertencia para que sea ignorada globalmente por el intérprete
warnings.filterwarnings('ignore', category=InsecureRequestWarning)

respuesta = requests.get('https://servidor-pruebas.local', verify=False)
print("Petición completada silenciosamente.")

```

## 10.4. Actualización del paquete certifi

Como se mencionó al inicio de este capítulo, `requests` confía en un paquete complementario llamado `certifi` para obtener la lista de Autoridades de Certificación (CAs) de confianza. Dado que la seguridad en la web es dinámica, la validez de estas CAs cambia con el tiempo: surgen nuevas entidades confiables, algunos certificados de raíz expiran de forma natural y, en ocasiones, ciertas CAs se ven comprometidas y deben ser revocadas de inmediato.

Mantener este almacén de certificados actualizado es la última línea de defensa para garantizar que tus validaciones automáticas sigan siendo eficaces contra amenazas modernas.

### Dependencia e independencia de `certifi`

Cuando instalas `requests` mediante `pip`, el sistema descarga e instala automáticamente `certifi` como una dependencia obligatoria. Sin embargo, `certifi` no se actualiza de forma mágica por sí solo cuando el ecosistema global de seguridad cambia. Si mantienes un entorno de producción corriendo durante meses o años sin mantenimiento, tu script podría:

1. **Rechazar conexiones válidas:** Si el servidor remoto actualizó su certificado a uno firmado por una CA raíz nueva que no existía cuando instalaste tu entorno.
2. **Aceptar conexiones inseguras:** Si una CA antigua ha sido revocada por fallos de seguridad mundiales, pero tu paquete local aún la considera de confianza.

### Cómo actualizar el almacén de certificados

Para asegurarte de tener la lista oficial más reciente (basada en el almacén de confianza de Mozilla), debes actualizar el paquete de forma independiente usando el gestor de paquetes de Python.

#### Desde la terminal del sistema

Ejecuta el comando de actualización estándar de `pip` apuntando directamente a la biblioteca de certificados:

```bash
pip install --upgrade certifi

```

### Inspección del almacén desde Python

Si en algún momento necesitas auditar tu entorno o necesitas pasarle la ruta exacta del almacén de confianza a otra herramienta de bajo nivel que no use `requests` directamente, puedes averiguar de dónde está extrayendo `certifi` sus datos de la siguiente manera:

```python
import certifi

# Obtener la ruta absoluta al archivo del almacén de CAs (.pem)
ruta_almacen = certifi.where()
print(f"Almacén de certificados activo en: {ruta_almacen}")

# Consultar la versión actual del paquete instalado
print(f"Versión de certifi: {certifi.__version__}")

```

Al ejecutar esto, verás una ruta física dentro de los directorios de tu entorno virtual o de tu instalación global de Python, apuntando a un archivo llamado `cacert.pem`.

## Resumen del capítulo

En el **Capítulo 10: SSL y Certificados**, hemos explorado los pilares de la seguridad en el transporte de datos con `requests`:

* **Verificación automática:** Aprendimos cómo el parámetro `verify=True` utiliza el paquete `certifi` para validar de forma transparente las CAs globales y cómo inyectar un archivo de certificados `.pem` personalizado para entornos corporativos.
* **Autenticación mutua (mTLS):** Estudiamos el uso del parámetro `cert` para enviar certificados de cliente y claves privadas unificadas o separadas en tuplas cuando el servidor exige comprobar la identidad criptográfica del cliente.
* **Entornos de desarrollo:** Analizamos la forma de saltarse las restricciones de seguridad mediante `verify=False` en laboratorios locales y cómo silenciar de manera limpia y selectiva las advertencias visuales de `InsecureRequestWarning` producidas por `urllib3`.
* **Mantenimiento:** Concluimos con la importancia crítica de actualizar periódicamente `certifi` de forma independiente para mantener vigentes los criterios de confianza de nuestras aplicaciones.
