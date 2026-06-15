Este capítulo aborda la manipulación de flujos de datos no textuales a través del protocolo HTTP con la biblioteca `requests`. Aprenderás a utilizar la propiedad `.content` para extraer bytes puros de forma exacta, evitando la corrupción de archivos provocada por la decodificación automática de texto. Asimismo, se detallan los mecanismos prácticos para persistir de forma segura imágenes y documentos en el almacenamiento local del sistema. Finalmente, dominarás el envío de recursos hacia servidores remotos mediante la codificación `multipart/form-data`, profundizando tanto en la personalización de metadatos mediante tuplas como en la carga eficiente de múltiples archivos en una sola petición.

## 7.1. Acceso al contenido binario

Cuando realizas una petición HTTP utilizando la biblioteca `requests`, el servidor devuelve una respuesta que puede ser puramente de texto (como HTML o JSON) o de naturaleza binaria (como una imagen, un archivo PDF, un archivo comprimido o un ejecutable).

En las secciones anteriores se ha utilizado la propiedad `.text` del objeto `Response` para acceder al cuerpo de la respuesta. Sin embargo, `.text` está diseñada exclusivamente para cadenas de caracteres (strings). Cuando accedes a `.text`, `requests` intenta adivinar la codificación de caracteres del servidor (como UTF-8 o ISO-8859-1) y decodifica los bytes automáticamente. Si intentas aplicar este proceso a un archivo binario, la decodificación fallará, corromperá los datos o generará caracteres ilegibles, haciendo que el archivo quede completamente inservible.

Para interactuar con archivos y flujos de datos no textuales de manera exacta, se debe utilizar la propiedad `.content`.

### La propiedad `.content`

La propiedad `.content` devuelve el cuerpo de la respuesta HTTP en forma de bytes puros, representados en Python por el tipo de dato `bytes`. Al usar `.content`, la biblioteca no realiza ningún tipo de decodificación de texto ni asume ninguna estructura de caracteres; simplemente te entrega la secuencia exacta de ceros y unos que envió el servidor web.

El siguiente diagrama en texto plano ilustra cómo se bifurca el flujo de datos dentro del objeto `Response` según la propiedad que decidas invocar en tu código:

```text
                  +-----------------------------------+
                  |      Respuesta del Servidor       |
                  |     (Flujo de Bytes Crudos)       |
                  +-----------------+-----------------+
                                    |
                                    v
                       +-------------------------+
                       |    Objeto Response      |
                       +------------+------------+
                                    |
            +-----------------------+-----------------------+
            |                                               |
            v                                               v
    Propiedad .text                                Propiedad .content
            |                                               |
[ Decodificación automática ]                       [ Sin decodificación ]
(Usa encoding ej. UTF-8)                            (Mantiene bytes puros)
            |                                               |
            v                                               v
 Tipo de dato: `str`                             Tipo de dato: `bytes`
 (Ideal para HTML, JSON, XML)                    (Ideal para PNG, PDF, ZIP)

```

### Ejemplo de uso práctico

Para ver la diferencia en el entorno de ejecución, analizaremos qué ocurre cuando solicitamos un recurso binario pequeño, como el icono de una página web (favicon), y cómo se almacena en memoria:

```python
import requests

# URL de un recurso binario (un favicon en formato ICO)
url = "https://www.python.org/static/favicon.ico"

respuesta = requests.get(url)

# Verificamos los tipos de datos de ambas propiedades
print(f"Tipo con .text: {type(respuesta.text)}")
print(f"Tipo con .content: {type(respuesta.content)}")

# Mostramos los primeros 20 bytes del contenido real
print(f"\nPrimeros 20 bytes extraídos: {respuesta.content[:20]}")

```

Al ejecutar este script, la salida en la consola se estructurará de la siguiente manera:

```text
Tipo con .text: <class 'str'>
Tipo con .content: <class 'bytes'>

Primeros 20 bytes extraídos: b'\x00\x00\x01\x00\x01\x00\x10\x10\x00\x00\x01\x00\x20\x00h\x04\x00\x00\x16\x00'

```

Como se puede observar, `respuesta.content` antepone una `b` al literal de la cadena, indicando que se trata de un objeto de tipo `bytes`. Cada elemento como `\x00` o `\x01` representa un valor hexadecimal correspondiente a la estructura exacta del formato de archivo que el servidor ha transmitido.

### Consideraciones de memoria con `.content`

Es fundamental tener en cuenta que la propiedad `.content` descarga la totalidad del cuerpo de la respuesta directamente en la memoria RAM de tu equipo de forma síncrona.

* **Cuándo es seguro usarlo:** Con recursos de tamaño reducido o moderado (imágenes de perfil, documentos de texto, archivos de configuración, archivos binarios de pocos megabytes).
* **Cuándo se debe evitar:** Con archivos que superen la capacidad de memoria disponible o que comprometan la eficiencia del sistema (videos en alta definición, bases de datos masivas o archivos comprimidos de gran volumen). Para estos escenarios de gran envergadura, se emplean técnicas de transmisión por fragmentos que se detallarán más adelante en el ecosistema de la biblioteca.

## 7.2. Descarga de imágenes y documentos

Una vez comprendido que el acceso al contenido binario debe realizarse exclusivamente mediante la propiedad `.content`, el siguiente paso fundamental es persistir esos bytes en el almacenamiento local del sistema. Esta técnica permite la descarga directa de recursos multimedia (como archivos PNG, JPG o GIF) y documentos de oficina o maquetación (como PDFs, archivos de Word o Excel) a través de los mecanismos nativos de manejo de archivos de Python combinados con `requests`.

### El patrón de persistencia con `open()`

Para guardar cualquier recurso binario descargado de la red, es mandatorio abrir el archivo local utilizando el modo de escritura binaria (`"wb"`). Si omitieras la `b` y usaras el modo de texto tradicional (`"w"`), Python intentaría codificar los bytes utilizando el mapa de caracteres local del sistema operativo, corrompiendo la cabecera y la estructura interna del archivo de destino.

El flujo básico para realizar una descarga directa consta de tres pasos secuenciales:

```text
[ Petición HTTP GET ] ──> [ Extraer .content (bytes) ] ──> [ Escalar a open(..., "wb") ]

```

A continuación, se presenta un bloque de código funcional que ilustra cómo automatizar la descarga segura de una imagen corporativa y un documento normativo en formato PDF de manera simultánea:

```python
import os
import requests

# URLs de los recursos que se van a descargar
url_imagen = "https://www.python.org/static/community_logos/python-logo-master-v3-TM.png"
url_documento = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"

# 1. Descarga y almacenamiento de una imagen PNG
try:
    respuesta_img = requests.get(url_imagen)
    # Verificamos que la petición haya sido exitosa (Código 200)
    respuesta_img.raise_for_status()
    
    with open("logo_python.png", "wb") as archivo_img:
        archivo_img.write(respuesta_img.content)
    print(f"Imagen descargada con éxito ({os.path.getsize('logo_python.png')} bytes).")
    
except requests.exceptions.RequestException as e:
    print(f"Error al descargar la imagen: {e}")

# 2. Descarga y almacenamiento de un documento PDF
try:
    respuesta_doc = requests.get(url_documento)
    respuesta_doc.raise_for_status()
    
    with open("documento_prueba.pdf", "wb") as archivo_doc:
        archivo_doc.write(respuesta_doc.content)
    print(f"Documento PDF descargado con éxito ({os.path.getsize('documento_prueba.pdf')} bytes).")
    
except requests.exceptions.RequestException as e:
    print(f"Error al descargar el documento: {e}")

```

### Extracción dinámica del nombre del archivo

En entornos de producción o scripts de raspado web (*web scraping*), no se suelen asignar nombres estáticos a los archivos descargados. Lo idóneo es heredar el nombre original que el archivo posee en el servidor remoto. Esto se puede lograr de dos formas complementarias:

1. **A través de la estructura de la URL:** Inspeccionando el último segmento de la ruta utilizando el módulo estándar `urllib.parse`.
2. **A través de las cabeceras de la respuesta:** Leyendo el campo `Content-Disposition` provisto por el servidor, el cual especifica de forma explícita el nombre que se le debe dar al archivo de manera oficial.

Aquí se demuestra cómo implementar la estrategia basada en la URL utilizando `urllib.parse.urlparse` combinado con `os.path.basename`:

```python
import os
from urllib.parse import urlparse
import requests

url_remota = "https://example.com/assets/docs/manual_usuario_v2.pdf"

respuesta = requests.get(url_remota)

if respuesta.status_code == 200:
    # Descomponemos la URL para extraer la ruta pura
    ruta_limpia = urlparse(url_remota).path
    # Extraemos el último componente (manual_usuario_v2.pdf)
    nombre_archivo = os.path.basename(ruta_limpia)
    
    # Escribimos el contenido en el disco local usando el nombre recuperado
    with open(nombre_archivo, "wb") as archivo:
        archivo.write(respuesta.content)
        
    print(f"Archivo guardado localmente como: {nombre_archivo}")

```

### Validación previa mediante Content-Type

Antes de proceder a la escritura de archivos binarios, es una buena práctica de ingeniería de software validar que el servidor web esté respondiendo con el tipo MIME esperado. Esto previene que termines guardando una página de error HTML (con un código de estado engañoso) con la extensión de una imagen o de un PDF.

La verificación se realiza consultando la cabecera `Content-Type`:

```python
respuesta = requests.get("https://example.com/api/exportar/reporte")

# Validamos que el Content-Type empiece por la firma estándar de PDF
if "application/pdf" in respuesta.headers.get("Content-Type", ""):
    with open("reporte.pdf", "wb") as f:
        f.write(respuesta.content)
else:
    print("Advertencia: El recurso devuelto no coincide con un formato PDF válido.")

```

## 7.3. Subida de archivos (Multipart Encoding)

El envío de archivos binarios desde el cliente hacia un servidor web se gestiona habitualmente mediante peticiones HTTP POST (o PUT) utilizando una codificación específica denominada `multipart/form-data`. Esta codificación divide el cuerpo de la petición en diferentes secciones separadas por un límite único (*boundary*), permitiendo empaquetar tanto metadatos textuales (como campos de un formulario) como flujos de bytes binarios en una única transacción de red.

La biblioteca `requests` automatiza por completo este proceso complejo a través del parámetro `files`.

### El parámetro `files`

Para enviar un archivo, no es necesario que codifiques manualmente los bytes ni que configures las cabeceras `Content-Type` de la petición. Simplemente debes abrir el archivo local en modo de lectura binaria (`"rb"`) y pasarlo al parámetro `files` dentro de la función de petición.

El siguiente diagrama en texto plano muestra cómo `requests` empaqueta un archivo y un campo de texto en una estructura multipart antes de transmitirla por la red:

```text
+------------------------------------------------------------------------+
| Petición HTTP POST (Multipart)                                         |
+------------------------------------------------------------------------+
| Cabecera Content-Type: multipart/form-data; boundary=----XyZ123        |
+------------------------------------------------------------------------+
|                                                                        |
|  ------XyZ123                                                          |
|  Content-Disposition: form-data; name="usuario"                        |
|                                                                        |
|  admin_sistema                                                         |
|                                                                        |
|  ------XyZ123                                                          |
|  Content-Disposition: form-data; name="foto"; filename="avatar.png"    |
|  Content-Type: image/png                                               |
|                                                                        |
|  [ \x89PNG\r\n\x1a\n... bytes binarios de la imagen ... ]               |
|                                                                        |
|  ------XyZ123--                                                        |
+------------------------------------------------------------------------+

```

### Implementación básica de subida de archivos

A continuación, se detalla el método estándar para realizar la subida de un único documento adjunto:

```python
import requests

url_servidor = "https://httpbin.org/post"

# Abrimos el archivo en modo de lectura binaria ('rb')
with open("logo_python.png", "rb") as archivo_local:
    # Definimos el diccionario asociando el nombre del parámetro con el archivo
    archivos_por_enviar = {"file": archivo_local}
    
    # Realizamos la petición POST inyectando el parámetro files
    respuesta = requests.post(url_servidor, files=archivos_por_enviar)

# Analizamos la respuesta para verificar cómo lo recibió el servidor
if respuesta.status_code == 200:
    print("Archivo subido con éxito.")

```

> **Regla de oro sobre la gestión de recursos:** Siempre debes abrir los archivos utilizando un gestor de contexto (`with`). Esto garantiza que el puntero del archivo se cierre correctamente una vez que `requests` finalice la lectura de los bytes y complete la transmisión HTTP, evitando fugas de descriptores en el sistema operativo.

### Personalización avanzada del envío Multipart

El parámetro `files` acepta un diccionario flexible donde el valor asociado a la clave no tiene que ser estrictamente el puntero del archivo abierto. Puedes pasar una tupla que te permite definir explícitamente tres parámetros adicionales: el nombre del archivo en el destino, el tipo de contenido (*MIME type*) y cabeceras adicionales personalizadas.

La estructura de la tupla sigue este patrón:

```python
(nombre_archivo, contenido_archivo, tipo_mime)

```

Veamos un ejemplo avanzado en el que se sube un archivo asignándole un nombre alternativo, forzando un `Content-Type` específico, y adjuntando de forma simultánea campos tradicionales de texto utilizando el parámetro `data`:

```python
import requests

url_servidor = "https://httpbin.org/post"

# Campos de texto tradicionales del formulario
datos_formulario = {
    "descripcion": "Entrega de reporte mensual de rendimiento",
    "departamento": "Auditoría Interna"
}

with open("documento_prueba.pdf", "rb") as pdf_local:
    # Configuración explícita de metadatos para el archivo multipart
    archivos_configurados = {
        "documento_adjunto": (
            "reporte_oficial_mayo.pdf",  # Nombre que recibirá el servidor
            pdf_local,                    # Puntero al flujo de bytes
            "application/pdf"             # Tipo MIME explícito
        )
    }
    
    # Combinamos datos del formulario y archivos en la misma petición
    respuesta = requests.post(
        url_servidor, 
        data=datos_formulario, 
        files=archivos_configurados
    )

print(f"Código de estado del servidor: {respuesta.status_code}")

```

### Envío de datos binarios en memoria sin archivos físicos

Existen ocasiones en las que generas el contenido binario directamente en tu código de Python (por ejemplo, exportando un gráfico o manipulando bytes en memoria) y necesitas subirlo sin escribir un archivo temporal en el disco duro.

Para lograr esto de forma óptima, puedes simular la estructura de un archivo utilizando cadenas de bytes en memoria combinadas con la tupla explícita:

```python
import requests

url_servidor = "https://httpbin.org/post"

# Generamos contenido binario directamente en memoria (ejemplo: texto crudo simulando un CSV)
contenido_en_memoria = b"id,nombre,puntuacion\n1,Carlos,95\n2,Ana,100"

# Enviamos los bytes directamente dándole una estructura de archivo virtual
archivos_en_memoria = {
    "datos_metricas": ("datos_crudos.csv", contenido_en_memoria, "text/csv")
}

respuesta = requests.post(url_servidor, files=archivos_en_memoria)
print(f"Respuesta de la subida en memoria: {respuesta.status_code}")

```

## 7.4. Envío de múltiples archivos simultáneos

En el desarrollo de aplicaciones que interactúan con servicios de almacenamiento en la nube, sistemas de gestión documental o plataformas multimedia, surge la necesidad recurrente de cargar más de un elemento dentro de la misma operación atómica de red. La biblioteca `requests` gestiona el envío concurrente de múltiples archivos extendiendo de forma orgánica la sintaxis del parámetro `files`.

Existen dos estrategias técnicas para empaquetar múltiples recursos en una única petición de codificación multipart (`multipart/form-data`): el uso de claves distintas para cada archivo o el agrupamiento de varios archivos bajo una misma clave identificadora utilizando listas.

### Estrategia A: Envío de múltiples archivos bajo claves distintas

Esta estructura se aplica cuando el servidor web espera recibir archivos de naturalezas o propósitos diferentes dentro de parámetros nominales específicos de su API (por ejemplo, cargar un avatar de usuario y un documento de identidad por separado).

Para instrumentar este comportamiento, basta con poblar el diccionario de `files` mapeando cada parámetro del formulario con su respectivo puntero binario de archivo:

```python
import requests

url_servidor = "https://httpbin.org/post"

# Abrimos de forma simultánea todos los recursos locales requeridos
with open("logo_python.png", "rb") as f_img, open("documento_prueba.pdf", "rb") as f_doc:
    
    infraestructura_archivos = {
        "imagen_perfil": ("avatar_usuario.png", f_img, "image/png"),
        "archivo_sustento": ("anexo_legal.pdf", f_doc, "application/pdf")
    }
    
    respuesta = requests.post(url_servidor, files=infraestructura_archivos)

if respuesta.status_code == 200:
    print("Ambos archivos específicos han sido transmitidos correctamente.")

```

### Estrategia B: Envío de múltiples archivos bajo una misma clave (Estructura de Lista)

Esta variante se utiliza cuando la API del servidor está diseñada para aceptar una colección o matriz dinámica de elementos indexados bajo un mismo campo común (por ejemplo, una galería de fotos de un producto o un lote adjunto de facturas).

Dado que un diccionario de Python clásico no puede contener claves duplicadas, si intentas definir un diccionario como `{"archivos": f1, "archivos": f2}`, la última declaración sobrescribirá por completo a la primera. Para solucionar esta restricción, `requests` te permite pasar una **lista de tuplas de dos o tres elementos** en lugar de un diccionario tradicional.

El siguiente diagrama en texto plano muestra cómo la lista de tuplas se mapea hacia una estructura repetitiva en la carga útil de la petición HTTP:

```text
Estructura en tu código Python (Lista de tuplas):
 [ ('galeria', (archivo1)), ('galeria', (archivo2)), ('galeria', (archivo3)) ]
                                     │
                                     ▼
Cuerpo de la Petición HTTP generada por Requests:
 ┌────────────────────────────────────────────────────────┐
 │ ...                                                    │
 │ ------BoundaryX                                        │
 │ Content-Disposition: form-data; name="galeria"; ...    │
 │ [Bytes del Archivo 1]                                  │
 │ ------BoundaryX                                        │
 │ Content-Disposition: form-data; name="galeria"; ...    │
 │ [Bytes del Archivo 2]                                  │
 │ ------BoundaryX                                        │
 │ Content-Disposition: form-data; name="galeria"; ...    │
 │ [Bytes del Archivo 3]                                  │
 │ ------BoundaryX--                                      │
 └────────────────────────────────────────────────────────┘

```

A continuación se detalla la implementación práctica para cargar de forma masiva un lote de archivos utilizando esta estructura:

```python
import requests

url_servidor = "https://httpbin.org/post"

# Lista de nombres de archivos que deseamos procesar en lote
nombres_archivos = ["imagen1.jpg", "imagen2.jpg", "imagen3.jpg"]

# Lista de control para almacenar los descriptores de archivos que abramos
manejadores_archivos = []
# Lista donde estructuraremos las tuplas para la petición multipart
lote_archivos_multipart = []

try:
    # Abrimos cíclicamente cada archivo en modo binario
    for nombre in nombres_archivos:
        # Nota: En producción, asegúrate de que estos archivos existan localmente
        f = open(nombre, "rb")
        manejadores_archivos.append(f)
        
        # Añadimos la tupla (nombre_campo, (nombre_archivo, descriptor))
        lote_archivos_multipart.append(
            ("galeria_fotos", (nombre, f, "image/jpeg"))
        )
    
    # Realizamos la petición POST inyectando la lista de tuplas
    respuesta = requests.post(url_servidor, files=lote_archivos_multipart)
    print(f"Código de respuesta de la subida por lotes: {respuesta.status_code}")

finally:
    # Cerramos manualmente todos los archivos abiertos para liberar el sistema
    for f in manejadores_archivos:
        f.close()

```

## Resumen del capítulo

En este **Capítulo 7: Respuestas Binarias y Archivos**, hemos explorado en profundidad las capacidades de la biblioteca `requests` para gestionar flujos de información no textuales dentro del protocolo HTTP, abarcando tanto los mecanismos de entrada como los de salida de datos:

* **Consumo de datos binarios:** Aprendimos que la propiedad `.text` corrompe los archivos no textuales debido a su decodificación automática de caracteres. En su lugar, establecimos el uso de `.content` como el estándar para extraer la secuencia exacta de bytes (`bytes`) enviados por el servidor, idóneo para imágenes, PDFs y otros formatos nativos.
* **Persistencia local:** Analizamos el patrón de descarga utilizando las herramientas nativas de Python, enfatizando la importancia de interactuar con el sistema de archivos local en modo de escritura binaria (`"wb"`) para salvaguardar la integridad de los recursos descargados.
* **TransmisiónMultipart:** Estudiamos el funcionamiento del parámetro `files` para realizar cargas de archivos mediante `multipart/form-data`. Descubrimos cómo enviar datos directamente desde la memoria RAM (sin escribir archivos intermedios en disco) y cómo personalizar metadatos críticos como el nombre del archivo y el tipo MIME mediante tuplas explícitas.
* **Carga simultánea:** Finalmente, resolvimos escenarios de cargas complejas mediante el envío de múltiples archivos en una sola petición web, diferenciando entre esquemas con nombres de campos específicos y cargas masivas por lotes bajo un mismo identificador común mediante listas de tuplas.
