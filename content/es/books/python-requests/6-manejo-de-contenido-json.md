JSON es el estándar para el intercambio de datos en las APIs modernas. En este capítulo, aprenderás a dominar la integración de este formato con la biblioteca `requests`. Descubrirás cómo decodificar respuestas automáticamente para transformarlas en diccionarios de Python, y cómo realizar el proceso inverso enviando datos estructurados mediante peticiones POST sin lidiar con la serialización manual ni la configuración de cabeceras. Finalmente, veremos cómo dotar a tu código de la robustez necesaria implementando un manejo de errores eficiente ante respuestas malformadas o inesperadas.

## 6.1. Decodificación de respuestas JSON

En las arquitecturas de software modernas, JSON (JavaScript Object Notation) se ha consolidado como el formato estándar de intercambio de datos en las APIs web debido a su ligereza y facilidad de lectura. Cuando un servidor web responde con este formato, la biblioteca `requests` proporciona una solución nativa y directa para transformar esa cadena de texto en estructuras de datos puras de Python (como diccionarios y listas), abstrayendo por completo el proceso manual de deserialización.

### El flujo de la información

Cuando realizas una petición a un endpoint que devuelve JSON, la respuesta viaja por la red como una secuencia de bytes. La biblioteca `requests` se encarga de recibir estos bytes y, mediante el método `.json()`, realiza la conversión interna.

```text
+------------------+         +-------------------+         +--------------------+
|  Respuesta HTTP  |  ---->  |  Texto plano JSON |  ---->  | Estructura Python  |
|  (Bytes en red)  |         | (String en `.text`|         | (Diccionario/Lista)|
+------------------+         +-------------------+         +--------------------+
                                      |                              |
                                      v                              v
                               '{"id": 101}'                  {"id": 101}

```

### El método `.json()`

Para decodificar una respuesta, el objeto `Response` incluye el método `.json()`. Al invocarlo, la biblioteca utiliza internamente el módulo estándar `json` de Python para interpretar el cuerpo de la respuesta.

A continuación se muestra un ejemplo práctico realizando una petición a una API simulada:

```python
import requests

# Realizamos la petición a un endpoint que devuelve datos de un usuario
response = requests.get("https://api.ejemplo.com/usuarios/1")

# Comprobamos que la petición fue exitosa antes de decodificar
if response.status_code == 200:
    # Decodificamos el cuerpo de la respuesta directamente a un diccionario
    datos_usuario = response.json()
    
    # Ahora podemos interactuar con los datos como un diccionario convencional
    print(f"Tipo de objeto: {type(datos_usuario)}")
    print(f"Nombre: {datos_usuario['nombre']}")
    print(f"Email: {datos_usuario['email']}")

```

### Equivalencia de tipos de datos

El proceso de decodificación mapea de forma automática los tipos de datos definidos en la especificación JSON a sus equivalentes exactos dentro del ecosistema de Python:

| Tipo en JSON | Tipo en Python | Ejemplo JSON | Ejemplo Python |
| --- | --- | --- | --- |
| Objeto (`{}`) | Diccionario (`dict`) | `{"activo": true}` | `{"activo": True}` |
| Arreglo (`[]`) | Lista (`list`) | `[1, 2, 3]` | `[1, 2, 3]` |
| Cadena (`""`) | Cadena (`str`) | `"Hola"` | `"Hola"` |
| Número (Entero) | Entero (`int`) | `42` | `42` |
| Número (Real) | Flotante (`float`) | `3.1416` | `3.1416` |
| Booleano (`true`) | Booleano (`True`) | `true` | `True` |
| Booleano (`false`) | Booleano (`False`) | `false` | `False` |
| Nulo (`null`) | Ninguno (`None`) | `null` | `None` |

### Determinación automática de la codificación

Un aspecto crítico que `requests` resuelve en segundo plano es la codificación de caracteres. De acuerdo con la especificación del protocolo HTTP, si el servidor no define explícitamente una codificación en la cabecera `Content-Type` (por ejemplo, `Content-Type: application/json; charset=utf-8`), la biblioteca utiliza las pautas del estándar RFC 4627 para identificar la codificación del JSON basándose en los primeros bytes del flujo de datos.

Esto garantiza que los caracteres especiales, tildes o alfabetos no occidentales se decodifiquen correctamente sin necesidad de que configures manualmente la propiedad `response.encoding` antes de extraer la información.

### Buenas prácticas al usar `.json()`

Es importante recordar que el método `.json()` intentará decodificar el contenido de `response.text` sin importar el estado de la petición. Si el servidor responde con un error de autorización (Código 401) o una página no encontrada (Código 404), pero incluye un cuerpo con formato JSON explicando el fallo, el método se ejecutará con éxito y devolverá dicha explicación.

Por lo tanto, se recomienda validar la integridad de la respuesta HTTP utilizando `response.status_code` o mecanismos de verificación de errores antes de proceder a la lógica de negocio con los datos estructurados.

## 6.2. Envío de diccionarios como JSON

Cuando interactúas con APIs RESTful, no solo necesitas consumir información, sino también enviarla. El método más común para transmitir datos estructurados hacia un servidor en peticiones de creación o modificación (como POST, PUT o PATCH) es empaquetarlos en formato JSON. La biblioteca `requests` simplifica este proceso permitiéndote enviar diccionarios de Python directamente, gestionando la conversión bajo el capó.

### El proceso de serialización

El acto de convertir una estructura de datos en memoria (como un diccionario de Python) en una cadena de texto legible por la red se conoce como **serialización**. Al enviar datos, el flujo es inverso al de la recepción:

```text
+--------------------+         +-------------------+         +--------------------+
| Estructura Python  |  ---->  |  Texto plano JSON |  ---->  |    Paquete HTTP    |
| (Diccionario/Lista)|         | (String codificado|         | (Cuerpo del POST)  |
+--------------------+         +-------------------+         +--------------------+
          |                              |                              |
          v                              v                              v
  {"id": 101, "ok": True}       '{"id": 101, "ok": true}'       Bytes hacia la red

```

### Serialización manual vs. Serialización automática

Existen dos formas fundamentales de enviar un diccionario como JSON usando `requests`. Entender la diferencia entre ambas te ayudará a escribir un código más limpio y a evitar errores comunes de cabeceras en el servidor.

#### Enfoque 1: Conversión manual con el parámetro `data`

Tradicionalmente, podías usar el módulo nativo `json` de Python para transformar el diccionario en una cadena de texto (`json.dumps()`) y pasar ese resultado al parámetro `data`.

Si optas por este camino, **es obligatorio** definir manualmente la cabecera `Content-Type`, ya que de lo contrario el servidor no sabrá cómo interpretar los bytes recibidos.

```python
import requests
import json

url = "https://api.ejemplo.com/productos"

nuevo_producto = {
    "nombre": "Teclado Mecánico",
    "precio": 89.99,
    "en_stock": True
}

# 1. Convertimos el diccionario a una cadena JSON manualmente
json_plano = json.dumps(nuevo_producto)

# 2. Definimos explícitamente la cabecera para el servidor
cabeceras = {"Content-Type": "application/json"}

# 3. Enviamos la petición usando el parámetro 'data'
respuesta = requests.post(url, data=json_plano, headers=cabeceras)

```

#### Enfoque 2: Automatización con el parámetro `json` (Recomendado)

Para evitar el trabajo repetitivo de serializar y configurar cabeceras, `requests` introdujo el parámetro `json`. Al pasar tu diccionario directamente a este parámetro, la biblioteca se encarga de todo de forma interna.

```python
import requests

url = "https://api.ejemplo.com/productos"

nuevo_producto = {
    "nombre": "Teclado Mecánico",
    "precio": 89.99,
    "en_stock": True
}

# requests serializa el diccionario y añade la cabecera Content-Type automáticamente
respuesta = requests.post(url, json=nuevo_producto)

```

### ¿Qué ocurre internamente con el parámetro `json`?

Cuando utilizas `json=nuevo_producto`, la biblioteca ejecuta automáticamente dos acciones críticas:

1. **Codificación de datos:** Llama internamente a `json.dumps()` para transformar tu diccionario de Python a una cadena JSON, asegurando que valores como `True`, `False` o `None` se traduzcan correctamente a `true`, `false` y `null`.
2. **Inyección de cabeceras:** Modifica las cabeceras de la petición para incluir `Content-Type: application/json`. Si ya tenías configurado un diccionario de cabeceras personalizado, `requests` simplemente añade o sobrescribe esta propiedad sin alterar las demás.

> **Regla de oro:** Si el servidor espera recibir JSON, utiliza siempre el parámetro `json`. Si pasas un diccionario directamente al parámetro `data` (`data=nuevo_producto`), `requests` asumirá que estás enviando un formulario web tradicional (`application/x-www-form-urlencoded`), lo que romperá la comunicación con la mayoría de las APIs modernas.
>
## 6.3. El parámetro json en peticiones POST

Aunque el parámetro `json` puede utilizarse en cualquier método HTTP que admita un cuerpo en la petición (como PUT o PATCH), su uso principal ocurre en las peticiones POST. El método POST se diseñó específicamente para enviar datos al servidor con el fin de crear un nuevo recurso o procesar información, y el parámetro `json` es la herramienta idónea para cumplir con este propósito de forma eficiente.

### Comportamiento del parámetro `json` en detalle

Cuando pasas un objeto al parámetro `json` en una petición `requests.post()`, la biblioteca realiza un análisis de los datos para garantizar que la estructura sea válida según la especificación JSON antes de transmitirla.

A diferencia del parámetro `data` (que acepta cadenas, bytes u objetos tipo archivo), el parámetro `json` está diseñado para recibir estructuras de datos compuestas primariamente por diccionarios, listas, cadenas, enteros, flotantes, booleanos y valores nulos.

### Ejemplo práctico: Registro de una entidad compleja

A menudo, las APIs requieren que los datos no se envíen en una estructura plana, sino con múltiples niveles de anidación. El parámetro `json` procesa estas jerarquías sin necesidad de configuraciones adicionales.

```python
import requests

url = "https://api.ejemplo.com/v1/ordenes"

# Definimos una estructura anidada con diccionarios y listas
datos_orden = {
    "cliente_id": 4509,
    "urgente": False,
    "productos": [
        {"articulo_id": "A-12", "cantidad": 2},
        {"articulo_id": "B-99", "cantidad": 1}
    ],
    "metodo_pago": {
        "tipo": "tarjeta",
        "proveedor": "visa"
    },
    "comentarios": None
}

# Realizamos la petición POST delegando la serialización en la biblioteca
respuesta = requests.post(url, json=datos_orden)

# Evaluamos la respuesta del servidor
if respuesta.status_code == 201:
    print("Orden creada exitosamente en el servidor.")
    print("Respuesta:", respuesta.json())

```

### Conflictos y precedencia de parámetros

Un error común cuando se empieza a trabajar con la biblioteca es intentar combinar los parámetros `data` y `json` en la misma petición POST. Es fundamental comprender qué sucede si ambos coinciden en el código:

* **Si se usan ambos parámetros simultáneamente:** El parámetro `data` tiene absoluta prioridad. Si envías `requests.post(url, data=un_diccionario, json=otro_diccionario)`, la biblioteca ignorará por completo el parámetro `json`, serializará `data` como un formulario tradicional y configurará la cabecera a `application/x-www-form-urlencoded`.
* **Datos adjuntos adicionales:** Si necesitas enviar texto plano o binario junto con un JSON, no debes usar el parámetro `json`. En su lugar, debes recurrir a la serialización manual e integrar todo dentro del parámetro `data`, controlando tú mismo las cabeceras.

### Verificación de lo enviado en la petición

Si alguna vez tienes dudas sobre si tus datos se están transmitiendo correctamente o si las cabeceras automáticas se han aplicado, puedes inspeccionar el objeto `request` interno que vive dentro de la respuesta (`respuesta.request`).

```python
# Inspección de las cabeceras generadas automáticamente
print("Cabecera enviada:", respuesta.request.headers.get("Content-Type"))
# Salida esperada: application/json

# Inspección del cuerpo exacto en formato bytes que viajó por la red
print("Cuerpo enviado (bytes):", respuesta.request.body)
# Salida esperada: b'{"cliente_id": 4509, "urgente": false, ...}'

```

Esta técnica de inspección es una herramienta excelente para depurar tu código antes de asumir que el fallo se encuentra en el servidor remoto.

## 6.4. Manejo de errores de decodificación

El intercambio de datos a través de la red siempre está expuesto a imprevistos. Aunque el servidor responda con un código de estado exitoso, existe la posibilidad de que el cuerpo de la respuesta no contenga un JSON válido. Intentar invocar el método `.json()` sobre una respuesta malformada, incompleta o que directamente consiste en HTML (muy común cuando un servidor falla y devuelve una página de error) provocará una excepción que interrumpirá la ejecución de tu programa si no se maneja adecuadamente.

### La excepción `requests.exceptions.JSONDecodeError`

Históricamente, cuando el método `.json()` fallaba, lanzaba la excepción estándar de Python `json.decoder.JSONDecodeError`. Sin embargo, para mantener la consistencia y permitir que los desarrolladores capturen todos los fallos específicos de la biblioteca en un mismo bloque, `requests` incluye su propia excepción: `requests.exceptions.JSONDecodeError`.

> **Nota de compatibilidad:** La excepción `requests.exceptions.JSONDecodeError` hereda directamente de la clase `ValueError` de Python (y en versiones de `requests` previas a la 2.27.0, también de `json.JSONDecodeError`), lo que garantiza que tu código sea robusto ante capturas genéricas.

### Capturando el error correctamente

La forma más segura de procesar el contenido JSON de una respuesta es envolver la invocación del método en una estructura `try-except`.

```python
import requests

url = "https://api.ejemplo.com/datos-corruptos"

try:
    respuesta = requests.get(url)
    respuesta.raise_for_status()  # Asegura que la petición HTTP fue exitosa
    
    # Si el servidor responde con un HTML de error o un JSON malformado,
    # esta línea lanzará la excepción
    datos = respuesta.json()
    print("Datos obtenidos con éxito:", datos)

except requests.exceptions.HTTPError as error_http:
    print(f"Error en la petición HTTP: {error_http}")

except requests.exceptions.JSONDecodeError:
    print("Error crítico: El servidor no devolvió un formato JSON válido.")
    print(f"Contenido recibido original: {respuesta.text[:100]}...") 

```

### Causas comunes de fallos en la decodificación

Comprender por qué falla la decodificación te ahorrará horas de depuración. Los escenarios más habituales son:

1. **Respuestas HTML encubiertas:** Ocurre cuando un firewall, un proxy (como Cloudflare) o el propio servidor interceptan la petición debido a un error interno (500) o un mantenimiento, devolviendo una página HTML. El texto comienza con `<!DOCTYPE html>` en lugar de `{`.
2. **Problemas de codificación de caracteres:** Si el servidor no especifica el juego de caracteres y el JSON contiene caracteres especiales mal formados, la biblioteca podría fallar al intentar reconstruir la cadena antes de deserializarla.
3. **Truncado de datos:** Si la conexión de red se corta abruptamente mientras se descargaba el cuerpo de la respuesta, el JSON quedará incompleto (por ejemplo, perdiendo la llave de cierre `}`), volviéndose ilegible.

## Resumen del capítulo

En este capítulo hemos profundizado en el formato JSON como el pilar fundamental para la comunicación con APIs modernas utilizando la biblioteca `requests`.

* Aprendimos que el método `.json()` automatiza por completo la **decodificación** y conversión de los tipos de datos de JSON a sus estructuras nativas equivalentes en Python (como diccionarios y listas), gestionando de manera transparente la codificación de caracteres.
* Evaluamos la **serialización** y el envío de datos mediante el parámetro `json` en peticiones POST, descubriendo cómo este mecanismo inyecta de forma automática la cabecera `Content-Type: application/json` y traduce correctamente estructuras complejas y anidadas.
* Comprendimos la importancia de la precedencia de parámetros, destacando por qué **no se deben mezclar** los parámetros `data` y `json` en una misma solicitud.
* Finalmente, abordamos la **gestión de excepciones** mediante `requests.exceptions.JSONDecodeError`, proporcionando técnicas esenciales para proteger nuestras aplicaciones frente a respuestas inesperadas, truncadas o con formato HTML inválido.
