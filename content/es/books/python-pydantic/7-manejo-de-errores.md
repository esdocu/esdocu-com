Garantizar la integridad de los datos requiere mecanismos robustos para interceptar y gestionar anomalías. En Pydantic, la validación no se detiene ante el primer fallo, sino que analiza todo el documento de manera exhaustiva. Cuando un dato viola las reglas del modelo, el motor lanza un `ValidationError`, una excepción diseñada para entornos de producción que agrupa de forma detallada cada discrepancia.

Este capítulo aborda el funcionamiento interno de esta clase, desglosa la estructura uniforme de sus fallas, detalla cómo personalizar los mensajes para los usuarios y explica cómo transformar estos errores en respuestas JSON listas para su consumo en APIs y servicios web.

## 7.1. Clase ValidationError

Cuando Pydantic detecta que los datos de entrada no cumplen con las restricciones definidas en un modelo, interrumpe el proceso de análisis de forma segura y lanza una excepción específica: `pydantic.ValidationError`.

A diferencia de las excepciones nativas de Python (como `ValueError` o `TypeError`), `ValidationError` está diseñada para entornos de producción y APIs. Esto significa que **no se detiene en el primer error** que encuentra; Pydantic analiza todo el documento, acumula todas las fallas detectadas en los diferentes campos y las entrega agrupadas en un solo objeto de excepción.

### El origen de ValidationError

En Pydantic V2, la validación se ejecuta en una capa de bajo nivel escrita en Rust (`pydantic-core`). Cuando una validación falla en esa capa, se genera un error que Pydantic captura y empaqueta dentro de la clase de Python `ValidationError`.

```text
[ Datos de entrada ] 
        │
        ▼
┌─────────────────────────────────┐
│     pydantic-core (Rust)        │ ──► Detecta múltiples fallas
└─────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────┐
│   pydantic.ValidationError      │ ──► Agrupa los errores en Python
└─────────────────────────────────┘

```

### Anatomía y captura de la excepción

Para inspeccionar un `ValidationError`, es necesario importarlo directamente desde el módulo principal de `pydantic`. Al capturarlo, el objeto expone métodos clave para extraer la información detallada de los fallos.

El siguiente ejemplo muestra cómo se produce y se captura esta excepción al ingresar datos inválidos en un modelo básico:

```python
from pydantic import BaseModel, Field, ValidationError

class Usuario(BaseModel):
    id: int
    nombre: str
    edad: int = Field(gt=0, lt=120)

# Datos que fallan en múltiples frentes:
# 1. 'id' no se puede convertir a entero.
# 2. 'edad' está fuera del rango permitido.
datos_invalidos = {
    "id": "no-es-un-numero",
    "nombre": "Carlos",
    "edad": 150
}

try:
    Usuario(**datos_invalidos)
except ValidationError as e:
    # Captura de la excepción de Pydantic
    print(f"Se capturaron {e.error_count()} errores de validación.\n")
    print(e)

```

### Métodos principales de ValidationError

La clase `ValidationError` ofrece una interfaz limpia para interactuar con los errores acumulados sin necesidad de parsear cadenas de texto manualmente:

* **`errors()`**: Es el método más importante. Devuelve una lista de diccionarios, donde cada diccionario describe detalladamente un error específico (el campo afectado, el tipo de error, el mensaje y la entrada original).
* **`error_count()`**: Devuelve un entero con la cantidad total de errores detectados en el objeto analizado.
* **`json()`**: Retorna una representación en cadena JSON directamente formateada con la estructura de los errores, ideal para responder de forma directa en endpoints de APIs Web.

Si imprimimos directamente el objeto de la excepción (`print(e)`), Pydantic nos muestra una representación en texto plano muy legible, estructurada mediante líneas que indican la ruta exacta del error y la razón del fallo:

```text
3 validation errors for Usuario
id
  Input should be a valid integer [type=int_parsing, input_value='no-es-un-numero', input_type=str]
edad
  Input should be less than 120 [type=less_than, input_value=150, input_type=int]

```

> **Nota de rendimiento:** `ValidationError` no construye el mensaje de error ni los diccionarios internos a menos que se acceda a ellos de forma explícita (por ejemplo, llamando a `.errors()` o imprimiendo la excepción). Si capturas el error y lo ignoras o solo registras que falló, el impacto en el rendimiento es mínimo porque los metadatos pesados se generan bajo demanda (*lazy evaluation*).
>
## 7.2. Estructura de los errores

Cuando llamamos al método `.errors()` de una excepción `ValidationError`, Pydantic nos devuelve una lista de diccionarios de Python. Cada uno de estos diccionarios representa un fallo específico y sigue una estructura estandarizada y predecible.

Esta estructura uniforme es uno de los mayores puntos fuertes de Pydantic, ya que permite a sistemas automatizados, front-ends o APIs procesar los errores de forma programática sin necesidad de parsear texto libre.

### Los campos del diccionario de error

Cada objeto de error dentro de la lista devuelta por `.errors()` contiene un conjunto de claves fijas que explican con precisión qué salió mal, dónde y por qué:

| Clave | Tipo | Descripción |
| --- | --- | --- |
| `loc` | `tuple` | La ruta exacta del campo afectado, expresada como una tupla de cadenas o enteros. |
| `type` | `str` | Un identificador único y unificado para el tipo de error (ej. `int_parsing`, `missing`). |
| `msg` | `str` | Un mensaje legible en inglés que describe el error de manera amigable. |
| `input` | `Any` | El valor exacto que el usuario envió y que causó la falla de validación. |
| `url` | `str` | (Opcional) Un enlace a la documentación de Pydantic con más detalles sobre ese error específico. |

### Inspección de la estructura en código

Para comprender cómo se organizan estas claves, podemos forzar un fallo en un modelo que combine campos simples y listas, y luego inspeccionar el diccionario resultante.

```python
from pydantic import BaseModel, Field, ValidationError

class Producto(BaseModel):
    codigo: str = Field(min_length=3)
    precios: list[float]

datos_erroneos = {
    # 'codigo' es muy corto (falla min_length)
    "codigo": "AB", 
    # El segundo elemento de la lista (índice 1) no es un float válido
    "precios": [19.99, "gratis", 5.50] 
}

try:
    Producto(**datos_erroneos)
except ValidationError as e:
    # Obtenemos la lista completa de diccionarios de error
    lista_errores = e.errors()
    
    # Inspeccionamos el primer error (el del código)
    print("Primer error:")
    print(lista_errores[0])
    
    print("\nSegundo error:")
    print(lista_errores[1])

```

Si volcamos el contenido de `lista_errores` formateado como un objeto de Python, se observa la siguiente estructura detallada:

```python
[
    {
        'loc': ('codigo',),
        'type': 'string_too_short',
        'msg': 'String should have at least 3 characters',
        'input': 'AB',
        'ctx': {'min_length': 3},  # Metadatos extra del validador
        'url': 'https://errors.pydantic.dev/2.6/v/string_too_short'
    },
    {
        'loc': ('precios', 1),
        'type': 'float_parsing',
        'msg': 'Input should be a valid number, unable to parse string as a number',
        'input': 'gratis',
        'url': 'https://errors.pydantic.dev/2.6/v/float_parsing'
    }
]

```

### Entendiendo la propiedad `loc` (Location)

La clave `loc` es crucial para aplicaciones que manejan datos complejos o anidados. Al ser una tupla, te permite rastrear el camino exacto hacia el dato corrupto:

* **Campos raíz:** Si el error ocurre en un atributo directo del modelo, la tupla contiene un único elemento con el nombre del campo: `('codigo',)`.
* **Colecciones (Listas, Tuplas, Sets):** Si el error ocurre dentro de una lista, el primer elemento es el nombre del campo y el segundo es el **índice numérico** del elemento conflictivo: `('precios', 1)`. Esto le permite al front-end resaltar exactamente la fila o celda que el usuario llenó mal.
* **Modelos Anidados:** Si el error ocurre dentro de un submodelo, la tupla acumula los nombres de las propiedades (por ejemplo, `('usuario', 'direccion', 'codigo_postal')`).

> **Clave de integración:** El diseño de la estructura de errores de Pydantic es el estándar nativo que adopta el framework **FastAPI**. Cuando FastAPI devuelve un error de validación HTTP 422, lo que hace es tomar esta lista de diccionarios de `ValidationError` y enviarla directamente en el cuerpo de la respuesta JSON.
>
## 7.3. Mensajes personalizados

Aunque los mensajes de error por defecto de Pydantic (como *"Input should be a valid integer"*) son excelentes para los desarrolladores, a menudo resultan inadecuados para el usuario final de una aplicación o API. Además, estos mensajes vienen configurados exclusivamente en inglés.

Pydantic V2 ofrece múltiples mecanismos para interceptar, modificar y personalizar tanto el texto (`msg`) como el tipo (`type`) de los errores, adaptándolos a reglas de negocio específicas o a estrategias de traducción.

### 1. Mensajes personalizados mediante `Field`

La forma más directa de modificar el mensaje de un validador nativo es utilizar el argumento `error_messages` dentro de la función `Field()`. Este argumento acepta un diccionario donde las llaves corresponden al identificador del error (`type`) que queremos alterar.

```python
from pydantic import BaseModel, Field, ValidationError

class RegistroUsuario(BaseModel):
    # Personalizamos los errores nativos de tipo 'missing' y 'string_too_short'
    username: str = Field(
        min_length=4,
        error_messages={
            "missing": "El nombre de usuario es un campo obligatorio.",
            "string_too_short": "El nombre de usuario debe contener al menos 4 caracteres."
        }
    )
    
    edad: int = Field(
        gt=18,
        error_messages={
            "greater_than": "Debes ser mayor de 18 años para registrarte."
        }
    )

try:
    RegistroUsuario(username="abc", edad=15)
except ValidationError as e:
    for error in e.errors():
        print(f"Campo: {error['loc'][0]} -> Mensaje: {error['msg']}")

```

Al ejecutar el código anterior, los mensajes genéricos de Pydantic se sustituyen por las cadenas de texto en español que hemos definido de manera explícita:

```text
Campo: username -> Mensaje: El nombre de usuario debe contener al menos 4 caracteres.
Campo: edad -> Mensaje: Debes ser mayor de 18 años para registrarte.

```

### 2. Mensajes en validadores personalizados (`field_validator`)

Cuando escribes tus propias funciones de validación utilizando `@field_validator`, cualquier excepción estándar de Python como `ValueError` o `AssertionError` que lances dentro de la función será capturada por Pydantic y transformada automáticamente en un `ValidationError`.

El mensaje de texto que pases al constructor de la excepción se convertirá directamente en la propiedad `msg` del error resultante.

```python
from pydantic import BaseModel, field_validator, ValidationError

class CuentaBancaria(BaseModel):
    codigo_pais: str

    @field_validator("codigo_pais")
    @classmethod
    def validar_codigo_pais(cls, v: str) -> str:
        # Forzamos una validación personalizada de longitud y formato
        if len(v) != 2 or not v.isalpha():
            raise ValueError("El código de país debe constar de exactamente 2 letras.")
        return v.upper()

try:
    CuentaBancaria(codigo_pais="ESP1")
except ValidationError as e:
    print(e.errors()[0]["msg"])
    # Salida: El código de país debe constar de exactamente 2 letras.

```

### 3. Personalización dinámica global (Post-procesamiento)

Si necesitas traducir o transformar todos los errores de tu aplicación de forma masiva (por ejemplo, para internacionalización / i18n), interceptar campo por campo con `Field` se vuelve inviable. La estrategia recomendada es procesar dinámicamente la lista de diccionarios que retorna `.errors()`.

Dado que `.errors()` devuelve una lista de estructuras de datos mutables de Python, puedes iterar sobre ellos y reescribir sus atributos antes de enviarlos a la capa de presentación:

```python
def traducir_errores(validation_error: ValidationError) -> list[dict]:
    errores_traducidos = []
    
    # Diccionario global de traducción basado en la clave 'type'
    MAPPING_TRADUCCIONES = {
        "missing": "Este campo no puede quedar vacío.",
        "int_parsing": "El valor ingresado no es un número entero válido.",
        "string_type": "Se esperaba una cadena de texto."
    }
    
    for err in validation_error.errors():
        # Copiamos el error para evitar modificar el objeto original directamente
        nuevo_error = err.copy()
        tipo_error = err["type"]
        
        # Si el tipo de error está en nuestro mapa, cambiamos el mensaje
        if tipo_error in MAPPING_TRADUCCIONES:
            nuevo_error["msg"] = MAPPING_TRADUCCIONES[tipo_error]
            
        errores_traducidos.append(nuevo_error)
        
    return errores_traducidos

```

> **Buenas prácticas:** Al personalizar mensajes, intenta conservar siempre las llaves `loc` e `input` intactas. Modificar la ruta del error o destruir el valor de entrada original dificulta que las aplicaciones cliente identifiquen qué datos del formulario o de la petición JSON deben corregir.
>
## 7.4. Manejo de errores en JSON

En el desarrollo de aplicaciones web y microservicios, las excepciones de Python no pueden enviarse directamente al cliente. Toda la información de los fallos de validación debe ser serializada a un formato estandarizado que el navegador, una aplicación móvil o cualquier servicio externo pueda interpretar. El formato por excelencia para este intercambio es JSON.

Pydantic simplifica este proceso al integrar funciones nativas de serialización dentro de la propia clase `ValidationError`, permitiendo transformar las fallas de tipado y restricciones en respuestas JSON limpias con una sola línea de código.

### El método `.json()` de ValidationError

Cuando capturas un `ValidationError`, puedes invocar el método `.json()`. Este método toma la lista de diccionarios que generaría `.errors()` y la convierte de manera directa en una cadena de texto (string) con formato JSON válido.

```python
from pydantic import BaseModel, Field, ValidationError

class Factura(BaseModel):
    cliente_id: int
    monto: float = Field(gt=0)

try:
    # Enviamos datos inválidos deliberadamente
    Factura(cliente_id="no_es_id", monto=-50.5)
except ValidationError as e:
    # Obtenemos el string JSON con todos los errores estructurados
    errores_json = e.json()
    
    print(type(errores_json))  # <class 'str'>
    print(errores_json)

```

La salida de `e.json()` es un string compacto optimizado para transmisiones de red. Si lo formateamos visualmente, la estructura se ve de la siguiente manera:

```json
[
  {
    "type": "int_parsing",
    "loc": ["cliente_id"],
    "msg": "Input should be a valid integer, unable to parse string as an integer",
    "input": "no_es_id",
    "url": "https://errors.pydantic.dev/2.6/v/int_parsing"
  },
  {
    "type": "greater_than",
    "loc": ["monto"],
    "msg": "Input should be greater than 0",
    "input": -50.5,
    "ctx": {"gt": 0.0},
    "url": "https://errors.pydantic.dev/2.6/v/greater_than"
  }
]

```

### Personalización de la salida JSON con `include_` y `exclude_`

El método `.json()` hereda la flexibilidad del motor de serialización de Pydantic. Si consideras que algunos campos del error exponen demasiada información interna o son innecesarios para el cliente, puedes filtrarlos directamente mediante parámetros de inclusión o exclusión.

Por ejemplo, puedes ocultar la URL de ayuda de Pydantic o el contexto interno para mantener la respuesta del API ligera y segura:

```python
try:
    Factura(cliente_id="error", monto=0)
except ValidationError as e:
    # Excluimos las claves 'url' y 'ctx' de cada objeto de error en el JSON
    json_filtrado = e.json(exclude={"url", "ctx"})
    print(json_filtrado)

```

### Integración en Frameworks Web (Ejemplo práctico)

En entornos de producción (utilizando frameworks como Flask o FastAPI), el manejo de errores en JSON se centraliza mediante manejadores de excepciones globales (*exception handlers*). Esto garantiza que cualquier fallo de validación intercepte la petición y responda automáticamente con un código de estado HTTP 422 (Unprocessable Entity) y un cuerpo JSON bien estructurado.

```python
# Simulación conceptual de un endpoint en un framework web
def crear_factura_endpoint(payload_request: dict):
    try:
        # Pydantic analiza y parsea el JSON recibido de la petición
        nueva_factura = Factura(**payload_request)
        return {"status": "success", "data": nueva_factura.model_dump()}, 201
        
    except ValidationError as e:
        # Retornamos los errores directamente en formato JSON con HTTP 422
        # Convertimos la cadena JSON de Pydantic a una respuesta HTTP adecuada
        return e.json(exclude={"url"}), 422

```

## Resumen del capítulo

En el **Capítulo 7: Manejo de errores**, hemos explorado cómo Pydantic gestiona las anomalías en la estructura y el contenido de los datos:

* **La clase `ValidationError`**: Aprendimos que actúa como un contenedor acumulativo que no detiene el análisis en el primer fallo, sino que recolecta todos los errores del modelo bajo un esquema de evaluación perezosa (*lazy*) de bajo impacto en el rendimiento.
* **Estructura de los errores**: Analizamos los componentes clave que devuelve `.errors()`, destacando la tupla `loc` como la herramienta fundamental para rastrear la ubicación exacta del dato erróneo, incluso dentro de listas o submodelos anidados.
* **Mensajes personalizados**: Estudiamos cómo modificar los textos descriptivos nativos de Pydantic utilizando la propiedad `error_messages` en `Field()`, lanzando excepciones `ValueError` controladas dentro de los validadores y estructurando funciones de post-procesamiento para i18n (internacionalización).
* **Manejo de errores en JSON**: Vimos cómo el método `.json()` automatiza la serialización de los fallos, facilitando su integración en APIs web mediante respuestas limpias y permitiendo omitir metadatos internos mediante filtros de exclusión.
