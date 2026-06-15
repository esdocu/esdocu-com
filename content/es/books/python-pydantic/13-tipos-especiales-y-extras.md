Este capítulo aborda las herramientas de validación especializada que incluye Pydantic para gestionar datos complejos del mundo real sin recurrir a expresiones regulares manuales. Aprenderás a implementar tipos avanzados que no solo verifican la estructura de la información, sino que la normalizan y la transforman en objetos nativos de Python. Exploraremos la validación estricta de correos electrónicos (`EmailStr`), la descomposición anatómica de direcciones web (`HttpUrl`), la gestión multiplataforma de rutas de archivos (`Path`), el control de infraestructuras de red (`IPv4`/`IPv6`) y los mecanismos de seguridad para identificadores únicos y datos sensibles en memoria (`SecretStr`).

## 13.1. Validación de Emails

La gestión y validación de direcciones de correo electrónico es una tarea común pero propensa a errores si se intenta resolver únicamente con expresiones regulares complejas. Pydantic simplifica este proceso ofreciendo tipos especializados que no solo verifican la estructura sintáctica del correo, sino que también normalizan el texto y extraen sus componentes individuales.

### Requisito previo: `email-validator`

Pydantic no incluye la lógica pesada de validación de correos en su núcleo para mantener la biblioteca ligera. En su lugar, delega esta tarea en la biblioteca externa `email-validator`. Si intentas utilizar los tipos de email de Pydantic sin esta dependencia, el entorno arrojará un error de importación.

Puedes instalarla individualmente o asegurar su presencia instalando Pydantic con sus extras de la siguiente manera:

```bash
pip install "pydantic[email]"

```

### Los tipos `EmailStr` y `NameEmail`

Pydantic proporciona principalmente dos tipos de datos dentro del módulo `pydantic`:

* **`EmailStr`**: Valida que la cadena sea un correo electrónico sintácticamente correcto según los estándares RFC 5322 y RFC 6531. Si la validación es exitosa, el valor se almacena y se exporta como una cadena de texto ordinaria (`str`).
* **`NameEmail`**: Diseñado para procesar correos que contienen un nombre asociado, un formato habitual en las cabeceras de los mensajes (por ejemplo, `John Doe <john.doe@example.com>`). Al validarse correctamente, no se convierte en una cadena simple, sino en un objeto de la clase `NameEmail` con propiedades accesibles.

A continuación, se detalla el comportamiento de ambos tipos en un modelo base:

```python
from pydantic import BaseModel, EmailStr, NameEmail, ValidationError

class RegistroUsuario(BaseModel):
    correo_contacto: EmailStr
    remitente_notificaciones: NameEmail

# 1. Caso de éxito
datos_validos = {
    "correo_contacto": "  USUARIO@Dominio.com ",  # Nota los espacios y mayúsculas
    "remitente_notificaciones": "Soporte Técnico <soporte@empresa.com>"
}

usuario = RegistroUsuario(**datos_validos)

# Demostración de la normalización de EmailStr
print(usuario.correo_contacto)
#> usuario@dominio.com
# Se han eliminado los espacios y se ha transformado a minúsculas automáticamente.

# Demostración del objeto NameEmail
print(usuario.remitente_notificaciones)
#> Soporte Técnico <soporte@empresa.com>
print(usuario.remitente_notificaciones.name)
#> Soporte Técnico
print(usuario.remitente_notificaciones.email)
#> soporte@empresa.com

```

### Comportamiento ante datos inválidos

Cuando Pydantic encuentra una cadena que no cumple con la estructura de un correo electrónico válido, detiene el procesamiento y genera un `ValidationError` con un mensaje específico proporcionado por el motor subyacente de `email-validator`.

```python
try:
    RegistroUsuario(
        correo_contacto="correo_invalido.com",  # Falta el símbolo @
        remitente_notificaciones="soporte@empresa.com"
    )
except ValidationError as e:
    print(e.json(indent=2))

```

El error generado detallará que la entrada no es un correo electrónico válido:

```json
[
  {
    "type": "value_error",
    "loc": [
      "correo_contacto"
    ],
    "msg": "value is not a valid email address: The email address is not valid (it must have exactly one @ sign).",
    "input": "correo_invalido.com"
  }
]

```

### Mecanismo de Normalización y Flujo de Validación

Cuando una cadena se transfiere a un campo de tipo `EmailStr`, Pydantic no se limita a rechazar o aceptar el valor; aplica un proceso de limpieza para garantizar la consistencia en el almacenamiento. El flujo sigue el siguiente orden:

```text
[Cadena de entrada] 
        │
        ▼
[Eliminación de espacios en blanco extremos] (strip)
        │
        ▼
[Conversión de la parte del dominio a minúsculas] (casefolding)
        │
        ▼
[Validación de sintaxis RFC]
        │
        ▼
[Resultado: Cadena limpia / Objeto estructurado]

```

Este comportamiento asegura que correos escritos con variaciones de mayúsculas en el dominio (como `admin@PROYECTO.ORG`) se unifiquen sin necesidad de implementar validadores manuales personalizados (`@field_validator`).

## 13.2. Redes y URLs (HttpUrl)

Pydantic ofrece un conjunto robusto de herramientas para validar, analizar y estructurar direcciones web (URLs). Al igual que ocurre con los correos electrónicos, confiar la validación de URLs a expresiones regulares manuales suele pasar por alto sutilezas como los números de puerto, los parámetros de consulta o las rutas codificadas.

Para resolver esto, Pydantic proporciona tipos específicos que heredan de una estructura base llamada `Url`. Estos tipos garantizan la coherencia sintáctica y descomponen la cadena de texto en un objeto con atributos directamente accesibles.

### La familia de tipos URL

Aunque el tipo más común es `HttpUrl`, Pydantic incluye variantes diseñadas para restringir los esquemas (o protocolos) aceptados:

* **`Url`**: El tipo base. Permite cualquier esquema válido (por ejemplo, `ftp://`, `git://`, `ssh://`).
* **`HttpUrl`**: Restringe la dirección a los esquemas web estándar: `http://` o `https://`.
* **`AnyHttpUrl`**: Similar a `HttpUrl`, pero más permisivo con ciertas estructuras internas (como la ausencia de un TLD o dominio de nivel superior en entornos de desarrollo).
* **`FileUrl`**: Exclusivo para rutas de archivos locales utilizando el esquema `file://`.
* **`WebUrl`**: Exige esquemas `http` o `https` y además obliga a que el dominio tenga un formato válido para la web pública (requiere un TLD como `.com`, `.org`, etc.).

### Uso básico y anatomía de un objeto URL

Cuando defines un campo con el tipo `HttpUrl`, Pydantic no guarda una cadena de texto simple (`str`), sino una instancia de la clase `Url`. Este objeto almacena los componentes ya analizados (parseados) de la dirección.

```python
from pydantic import BaseModel, HttpUrl, ValidationError

class ConfiguracionServicio(BaseModel):
    api_url: HttpUrl
    documentacion: HttpUrl

# Creación de una instancia con datos válidos
config = ConfiguracionServicio(
    api_url="https://api.ejemplo.com:8080/v2/usuarios?activo=true#perfil",
    documentacion="http://docs.ejemplo.com"
)

# El objeto se imprime como una cadena limpia
print(config.api_url)
#> https://api.ejemplo.com:8080/v2/usuarios?activo=true#perfil

# Acceso a los componentes individuales del objeto Url
print(config.api_url.scheme)   #> https
print(config.api_url.host)     #> api.ejemplo.com
print(config.api_url.port)     #> 8080
print(config.api_url.path)     #> /v2/usuarios
print(config.api_url.query)    #> activo=true
print(config.api_url.fragment) #> perfil

```

### Comportamiento de tipado y serialización

Dado que los campos de tipo `HttpUrl` no son cadenas de texto ordinarias, es importante entender cómo interactúan con otras funciones del lenguaje y con la serialización:

> **Nota de compatibilidad:** Si necesitas pasar el valor de un campo `HttpUrl` a una biblioteca externa que solo acepte objetos `str` (como `requests` o `httpx`), debes convertirlo explícitamente utilizando la función nativa `str(modelo.campo)`.

Al exportar el modelo a un diccionario o a un esquema JSON, Pydantic convierte de forma automática estos objetos complejos de vuelta a su representación en cadena de texto:

```python
# Exportación a un diccionario estándar de Python
print(config.model_dump())
#> {'api_url': 'https://api.ejemplo.com:8080/v2/usuarios?activo=true#perfil', 'documentacion': 'http://docs.ejemplo.com/'}

```

### Restricciones y manejo de errores

Si una URL no contiene un esquema válido, le falta el host o está mal estructurada, Pydantic detiene la inicialización y lanza un `ValidationError`. El motor de validación interno inspecciona la cadena y detalla la parte exacta donde falló la estructura.

```python
try:
    ConfiguracionServicio(
        api_url="ftp://servidor.com/datos", # Error: Esquema no permitido para HttpUrl
        documentacion="docs.ejemplo.com"     # Error: Falta el esquema (http:// o https://)
    )
except ValidationError as e:
    print(e.json(indent=2))

```

El JSON de error expone los motivos exactos del fallo de manera clara:

```json
[
  {
    "type": "url_scheme",
    "loc": [
      "api_url"
    ],
    "msg": "URL scheme should be 'http' or 'https'",
    "input": "ftp://servidor.com/datos",
    "ctx": {
      "expected_schemes": "'http' or 'https'"
    }
  },
  {
    "type": "url_parsing",
    "loc": [
      "documentacion"
    ],
    "msg": "URL parsing error: relative URL without a base",
    "input": "docs.ejemplo.com"
  }
]

```

## 13.3. Rutas de sistema (Path)

La manipulación de rutas de archivos y directorios varía significativamente entre sistemas operativos (como las barras diagonales inversas `\` en Windows frente a las barras inclinadas `/` en Linux o macOS). Para evitar incoherencias y garantizar que las rutas proporcionadas existan o sean válidas, Pydantic se integra de forma nativa con el módulo estándar `pathlib` de Python a través del tipo `Path`.

Cuando se define un campo con el tipo `Path`, Pydantic convierte automáticamente cualquier cadena de texto de entrada en un objeto `pathlib.Path` correspondiente a la plataforma en la que se ejecuta el código (`WindowsPath` o `PosixPath`).

### Uso básico y conversión de tipos

El tipo `Path` acepta cadenas de texto relativas o absolutas y las transforma instantáneamente, otorgando acceso a todos los métodos y propiedades del módulo `pathlib` (como verificar extensiones, obtener el directorio padre o comprobar la existencia del elemento).

```python
from pathlib import Path
from pydantic import BaseModel

class SistemaArchivos(BaseModel):
    archivo_config: Path
    directorio_salida: Path

# Pasando cadenas de texto simples como entrada
config = SistemaArchivos(
    archivo_config="config/ajustes.json",
    directorio_salida="/var/log/app"
)

# Pydantic ha transformado las cadenas en objetos pathlib.Path
print(type(config.archivo_config))
#> <class 'pathlib.PosixPath'>  (o WindowsPath si estás en Windows)

# Acceso a propiedades nativas de pathlib
print(config.archivo_config.suffix)  #> .json
print(config.directorio_salida.is_absolute()) #> True

```

### Validaciones avanzadas con `Field`

Por defecto, el tipo `Path` solo comprueba que la entrada sea una cadena de texto que pueda interpretarse como una ruta sintácticamente válida. No verifica si el archivo o carpeta realmente existe en el disco duro.

Para forzar validaciones en el sistema de archivos real, Pydantic proporciona metadatos específicos que se pueden inyectar utilizando la función `Field`:

```python
from pathlib import Path
from pydantic import BaseModel, Field, ValidationError

class ProcesadorContenido(BaseModel):
    # La ruta debe existir obligatoriamente en el disco
    archivo_entrada: Path = Field(path_type='file')
    
    # La ruta debe existir y, además, ser un directorio
    carpeta_destino: Path = Field(path_type='dir')

```

> **Comportamiento de `path_type`:** Al especificar `'file'` o `'dir'`, Pydantic realiza una comprobación activa en el sistema de archivos durante la fase de validación. Si el elemento no existe, o si existe pero no coincide con el tipo especificado (por ejemplo, pasas un archivo donde se esperaba un directorio), la validación fallará de inmediato arrojando un `ValidationError`.

### Comportamiento en la serialización

Cuando exportas tus modelos utilizando `model_dump()`, el objeto `Path` se conserva como tal dentro del diccionario de Python. Sin embargo, al serializar el modelo a un formato de transferencia de datos como JSON mediante `model_dump_json()`, Pydantic convierte de forma automática el objeto en una cadena de texto limpia con el formato de ruta estándar de la plataforma.

```python
# Serialización a JSON
print(config.model_dump_json())
#> {"archivo_config":"config/ajustes.json","directorio_salida":"/var/log/app"}

```

## 13.4. Tipos de red (IPv4/IPv6)

La validación de direcciones de red e infraestructura es crucial en aplicaciones que interactúan con servidores, firewalls o servicios en la nube. En lugar de procesar estas direcciones como texto plano, Pydantic aprovecha el módulo estándar `ipaddress` de Python para ofrecer tipos especializados que validan la estructura de direcciones IP y redes, asegurando que se encuentren dentro de los rangos válidos del protocolo.

Al utilizar estos tipos, los datos de entrada se transforman automáticamente en objetos nativos de `ipaddress`, lo que permite realizar operaciones de red avanzadas directamente desde los atributos del modelo.

### Direcciones IP individuales

Pydantic proporciona tipos específicos para validar direcciones IP individuales tanto para la versión 4 como para la versión 6 del protocolo:

* **`IPvAnyAddress`**: Acepta y valida cualquier dirección IP válida, ya sea IPv4 o IPv6.
* **`IPv4Address`**: Restringe la validación exclusivamente a direcciones IPv4 (por ejemplo, `192.168.1.1`).
* **`IPv6Address`**: Restringe la validación exclusivamente a direcciones IPv6 (por ejemplo, `2001:db8::1`).

```python
from ipaddress import IPv4Address, IPv6Address
from pydantic import BaseModel, IPvAnyAddress, IPv4Address, ValidationError

class NodoServidor(BaseModel):
    ip_publica: IPv4Address
    ip_local: IPvAnyAddress

# Inicialización con cadenas de texto válidas
nodo = NodoServidor(
    ip_publica="203.0.113.45",
    ip_local="::1" # IPv6 Loopback
)

# Los atributos se convierten en objetos del módulo ipaddress
print(type(nodo.ip_publica)) #> <class 'ipaddress.IPv4Address'>
print(nodo.ip_publica.is_private) #> False
print(nodo.ip_local.version) #> 6

```

### Rangos de red (Bloques CIDR)

Cuando necesitas validar una subred o un bloque de direcciones en notación CIDR (Classless Inter-Domain Routing), como `10.0.0.0/24`, Pydantic ofrece la familia de tipos de interfaz y red:

* **`IPvAnyNetwork`**: Acepta cualquier bloque de red válido IPv4 o IPv6.
* **`IPv4Network`**: Permite únicamente redes IPv4.
* **`IPv6Network`**: Permite únicamente redes IPv6.

```python
from pydantic import BaseModel, IPv4Network

class ConfiguracionRed(BaseModel):
    subred_permitida: IPv4Network

config = ConfiguracionRed(subred_permitida="192.168.1.0/24")

# Permite iterar o comprobar pertenencia gracias a ipaddress
print(config.subred_permitida.num_addresses) #> 256
print(config.subred_permitida.netmask)       #> 255.255.255.0

```

> **Nota sobre redes estrictas:** Por defecto, los tipos `Network` de Pydantic aplican un comportamiento estricto. Si proporcionas una dirección IP con una máscara que no describe exactamente el inicio de la red (por ejemplo, `192.168.1.5/24` en lugar de `192.168.1.0/24`), Pydantic lanzará un error de validación debido a que los bits de host están establecidos.

### Gestión de errores de red

Si la cadena de entrada contiene octetos fuera de rango (mayores a 255), caracteres no permitidos o máscaras CIDR inválidas, Pydantic detiene la ejecución del constructor del modelo e informa el fallo a través de un `ValidationError`.

```python
try:
    NodoServidor(ip_publica="256.0.0.1", ip_local="en-algun-lugar")
except ValidationError as e:
    print(e.json(indent=2))

```

El mensaje de error describe de forma matemática o lógica por qué la dirección no calza con el protocolo:

```json
[
  {
    "type": "ip_v4_address",
    "loc": [
      "ip_publica"
    ],
    "msg": "Input is not a valid IPv4 address",
    "input": "256.0.0.1"
  },
  {
    "type": "ip_any_address",
    "loc": [
      "ip_local"
    ],
    "msg": "Input is not a valid IP address",
    "input": "en-algun-lugar"
  }
]

```

## 13.5. UUIDs y SecretStr

Para cerrar las herramientas de validación especializada que incluye Pydantic, examinaremos la gestión de identificadores únicos globales (UUIDs) y la protección de datos sensibles en memoria (como contraseñas, tokens de API o llaves criptográficas) mediante el tipo `SecretStr`.

### Identificadores Únicos Universales (UUID)

Pydantic se integra de forma directa con el módulo nativo `uuid` de Python. Permite tipar campos utilizando las clases estándar de este módulo, como `UUID`, `UUID1`, `UUID3`, `UUID4` o `UUID5`. El tipo más extendido en aplicaciones web modernas y bases de datos es `UUID4` (basado en números aleatorios).

Cuando defines un campo con estas clases, Pydantic acepta cadenas de texto en sus múltiples formatos habituales (con guiones, sin guiones o en formato URN) y las transforma automáticamente en un objeto `uuid.UUID`.

```python
from uuid import UUID
from pydantic import BaseModel, ValidationError

class Transaccion(BaseModel):
    id_transaccion: UUID

# Pydantic acepta diferentes formatos de representación de un UUID
t1 = Transaccion(id_transaccion="9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d")
t2 = Transaccion(id_transaccion="9b1deb4d3b7d4bad9bdd2b0d7b3dcb6d")

print(type(t1.id_transaccion))  #> <class 'uuid.UUID'>
print(t1.id_transaccion == t2.id_transaccion)  #> True

```

Si la cadena no cumple con la longitud correcta o contiene caracteres no hexadecimales, se genera un `ValidationError` indicando que la entrada no es un UUID válido.

### Protección de información confidencial con `SecretStr`

Uno de los riesgos de seguridad más comunes al desarrollar software es la filtración involuntaria de credenciales en los logs del sistema, trazas de errores o salidas de consola. Si almacenas una contraseña en un campo de tipo `str`, cualquier operación como `print(modelo)` o `logger.info(modelo.model_dump())` expondrá el texto en claro.

El tipo `SecretStr` solventa este problema alterando la representación en cadena del objeto para ocultar su contenido por defecto.

```python
from pydantic import BaseModel, SecretStr

class CredencialesAPI(BaseModel):
    usuario: str
    token_acceso: SecretStr

credenciales = CredencialesAPI(
    usuario="admin_user",
    token_acceso="clave_secreta_super_confidencial"
)

# 1. Al imprimir el modelo o el campo, el valor real se oculta
print(credenciales)
#> usuario='admin_user' token_acceso=SecretStr('**********')

print(credenciales.token_acceso)
#> SecretStr('**********')

# 2. ¿Cómo recuperar el valor real cuando necesitas usarlo?
# Debes llamar explícitamente al método .get_secret_value()
token_real = credenciales.token_acceso.get_secret_value()
print(token_real)
#> clave_secreta_super_confidencial

```

### Comportamiento en la Serialización

La protección de `SecretStr` se extiende automáticamente a los mecanismos de exportación de datos de Pydantic para evitar descuidos al enviar información a través de la red o guardarla en persistencia:

* **`model_dump()` / `model_dump_json()`**: Por defecto, transforman el campo `SecretStr` ocultando su contenido real tras la cadena de asteriscos u omitiendo el valor si se configura un serializador personalizado.
* Si necesitas exportar el modelo manteniendo los secretos legibles (por ejemplo, para enviar las credenciales a otra API interna segura), debes indicarlo explícitamente mediante el parámetro `context` en combinación con la lógica de serialización, o extraerlos de forma manual con `get_secret_value()`.

## Resumen del capítulo

En este capítulo hemos explorado las capacidades de **Pydantic** para validar y estructurar datos complejos que van más allá de los tipos primitivos de Python, evitando la necesidad de escribir expresiones regulares manuales o validadores personalizados redundantes.

* **`EmailStr` y `NameEmail`**: Automatizan la verificación sintáctica de correos electrónicos bajo estándares RFC y aplican un proceso de normalización (limpieza de espacios y conversión de dominios a minúsculas). Requieren la biblioteca `email-validator`.
* **Familias de URLs (`HttpUrl`, `WebUrl`, etc.)**: Descomponen las direcciones web en objetos estructurados independientes que permiten acceder de forma directa al esquema, puerto, host o ruta, garantizando además su correcta conversión a texto plano en entornos externos.
* **Rutas de sistema (`Path`)**: Se conectan al módulo nativo `pathlib` para unificar el comportamiento de rutas de archivos entre distintas plataformas, permitiendo comprobar la existencia real de archivos o carpetas mediante metadatos en `Field`.
* **Tipos de red (IPs y Redes)**: Integrados con el módulo `ipaddress`, validan interfaces IPv4/IPv6 de forma estricta y permiten realizar cálculos de red (como conteo de hosts o máscaras de subred) directamente sobre los atributos.
* **UUIDs y `SecretStr`**: Aseguran la integridad de identificadores globales y proporcionan una capa de seguridad crítica al ocultar automáticamente datos sensibles en impresiones de pantalla, logs y volcados de datos accidentales.
