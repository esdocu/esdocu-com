Pydantic destaca en la generación automática de esquemas JSON compatibles con estándares internacionales a partir de modelos de Python. Este capítulo profundiza en el uso de `model_json_schema()` para exportar estructuras de datos según las necesidades del proyecto.

Aprenderás a personalizar atributos individuales mediante `Field()`, inyectar metadatos avanzados con `json_schema_extra` y aplicar transformaciones globales heredando de `GenerateJsonSchema`. Finalmente, se analiza cómo estructurar estos esquemas para integrarlos de forma óptima en especificaciones de OpenAPI y documentaciones interactivas en entornos como FastAPI.

## 16.1. Generación de esquemas

Pydantic se integra de forma nativa con la especificación de JSON Schema, un estándar internacional que permite describir la estructura de tus datos JSON mediante un formato claro y legible por máquinas. En Pydantic V2, este proceso se ejecuta directamente a través de `pydantic-core` (el motor desarrollado en Rust), lo que garantiza una generación de esquemas extremadamente rápida y precisa, reflejando fielmente las restricciones, tipos de datos y estructuras definidas en tus modelos de Python.

La generación automática de esquemas es el puente que conecta tus estructuras de código con herramientas externas, permitiendo la interoperabilidad con ecosistemas front-end, generadores de código cliente y frameworks de APIs web como FastAPI.

### El método `model_json_schema()`

Para obtener la representación en formato JSON Schema de cualquier modelo que herede de `BaseModel`, se utiliza el método de clase `model_json_schema()`. Este método inspecciona de forma recursiva los atributos del modelo, sus anotaciones de tipo, sus metadatos y las configuraciones globales para devolver un diccionario de Python que cumple estrictamente con el borrador **Draft 2020-12** de JSON Schema (o OpenAPI 3.1, según los parámetros utilizados).

A continuación se presenta un ejemplo básico de cómo definir un modelo y extraer su esquema correspondiente:

```python
from datetime import datetime
from pydantic import BaseModel, Field

class Usuario(BaseModel):
    id: int
    nombre: str
    correo: str
    fecha_registro: datetime | None = None

# Generar el esquema JSON como un diccionario de Python
esquema_dict = Usuario.model_json_schema()

# Ejemplo de impresión formateada
import json
print(json.dumps(esquema_dict, indent=2, ensure_ascii=False))

```

Al ejecutar el código anterior, Pydantic procesa la información estructural del modelo `Usuario` y produce el siguiente diccionario equivalente:

```json
{
  "$defs": {},
  "properties": {
    "id": {
      "title": "Id",
      "type": "integer"
    },
    "nombre": {
      "title": "Nombre",
      "type": "string"
    },
    "correo": {
      "title": "Correo",
      "type": "string"
    },
    "fecha_registro": {
      "anyOf": [
        {
          "format": "date-time",
          "type": "string"
        },
        {
          "type": "null"
        }
      ],
      "default": null,
      "title": "Fecha Registro"
    }
  },
  "required": [
    "id",
    "nombre",
    "correo"
  ],
  "title": "Usuario",
  "type": "object"
}

```

### Anatomía del esquema generado

Cuando analizamos el JSON Schema devuelto por Pydantic, podemos identificar de inmediato cómo se mapean los conceptos de tipado de Python al estándar JSON:

* **`title` y `type` raíz:** Por defecto, el nombre de la clase de Python se convierte en el atributo `"title"` del esquema raíz, y el `"type"` se define como `"object"`.
* **`properties`:** Contiene un mapa donde cada clave corresponde al nombre de un atributo del modelo de Pydantic. Cada propiedad incluye su propio sub-esquema con restricciones implícitas derivadas del tipo (por ejemplo, `int` se traduce a `{"type": "integer"}`).
* **`required`:** Una lista de cadenas que contiene los nombres de las propiedades que no tienen un valor predeterminado asignado en el código de Python. En nuestro ejemplo, `fecha_registro` quedó fuera de esta lista debido a que cuenta con el valor por defecto `None`.
* **Tipos complejos y uniones:** La sintaxis nativa de Python `datetime | None` se traduce automáticamente a un operador `"anyOf"` dentro de JSON Schema, indicando que el valor puede cumplir con el formato de fecha y hora o ser de tipo `"null"`.

El flujo de procesamiento interno que sigue Pydantic desde la declaración del código hasta la salida del esquema se puede estructurar de la siguiente manera:

```text
[ Código Python (BaseModel) ]
             │
             ▼
[ Pydantic Core (Rust) ] ──► Analiza anotaciones de tipos e inspecciona metadatos
             │
             ▼
[ Estructura de Core Schema ] ──► Resuelve referencias y jerarquías
             │
             ▼
[ model_json_schema() ] ──► Aplica transformaciones de nombres y alias
             │
             ▼
[ Salida: JSON Schema Dict ]

```

### Manejo de referencias y modelos anidados (`$defs`)

Cuando un modelo contiene referencias a otros modelos (modelos anidados), Pydantic optimiza el tamaño y la legibilidad del JSON Schema utilizando la sección de definiciones comunmente llamada `$defs`. En lugar de duplicar el esquema del modelo hijo en cada lugar donde se use, Pydantic genera el esquema del modelo hijo una sola vez dentro de `$defs` y lo vincula utilizando un puntero JSON mediante la clave `$ref`.

Observemos el comportamiento en estructuras compuestas:

```python
from pydantic import BaseModel

class Ubicacion(BaseModel):
    latitud: float
    longitud: float

class Sucursal(BaseModel):
    nombre_tienda: str
    coordenadas: Ubicacion  # Modelo anidado

```

Al extraer el esquema de `Sucursal` invocando `Sucursal.model_json_schema()`, la propiedad `coordenadas` no detallará internamente las propiedades `latitud` y `longitud`, sino que apuntará a la definición global interna:

```json
{
  "$defs": {
    "Ubicacion": {
      "properties": {
        "latitud": { "title": "Latitud", "type": "number" },
        "longitud": { "title": "Longitud", "type": "number" }
      },
      "required": ["latitud", "longitud"],
      "title": "Ubicacion",
      "type": "object"
    }
  },
  "properties": {
    "nombre_tienda": { "title": "Nombre Tienda", "type": "string" },
    "coordenadas": { "$ref": "#/$defs/Ubicacion" }
  },
  "required": ["nombre_tienda", "coordenadas"],
  "title": "Sucursal",
  "type": "object"
}

```

### Modos de esquema: Validación vs. Serialización

Una de las grandes innovaciones de Pydantic V2 es la separación explícita entre las reglas que se aplican para **recibir datos** (validación) y las reglas para **exportar datos** (serialización). Por esta razón, el método `model_json_schema()` acepta un parámetro denominado `mode`.

Los valores válidos para este parámetro son:

1. `'validation'` (Valor predeterminado): Genera un esquema que describe los datos que el modelo está dispuesto a aceptar durante la inicialización o el parseo. Por ejemplo, si un campo acepta una cadena de texto y la convierte automáticamente en un objeto de tipo `datetime`, el modo de validación indicará que se permite recibir una cadena de texto.
2. `'serialization'`: Genera un esquema que describe el aspecto de los datos una vez que el modelo ha sido exportado a JSON. Si el objeto `datetime` mencionado anteriormente se exporta como una cadena formateada en formato ISO 8601, el esquema reflejará con exactitud la salida final esperada.

```python
# Generar esquema optimizado para validar entradas
esquema_entrada = Usuario.model_json_schema(mode='validation')

# Generar esquema optimizado para describir salidas
esquema_salida = Usuario.model_json_schema(mode='serialization')

```

Esta distinción asegura que las herramientas de documentación de APIs externas conozcan con total precisión tanto la estructura requerida para enviar peticiones válidas al servidor como la estructura exacta que recibirán de vuelta en las respuestas.

## 16.2. Personalización de campos

Aunque Pydantic deduce automáticamente la mayor parte del esquema JSON a partir de las anotaciones de tipo de Python, a menudo es necesario enriquecer o modificar ese esquema para añadir documentación, restricciones semánticas o metadatos específicos exigidos por estándares externos. Para lograr esto a nivel de atributos individuales, Pydantic proporciona herramientas potentes y directas integradas en la función `Field()`.

Toda la información adicional proporcionada a través de `Field()` que sea compatible con la especificación de JSON Schema se inyectará de forma automática en el sub-esquema de la propiedad correspondiente al invocar el método `model_json_schema()`.

### Metadatos de documentación y validación

La forma más común de personalizar un campo es añadirle atributos que ayuden a los consumidores del esquema a entender el propósito del dato o las restricciones que debe cumplir. Atributos como `description`, `examples`, `title` o restricciones geométricas y numéricas modifican directamente la salida del JSON Schema.

A continuación se muestra cómo aplicar estas opciones en un modelo:

```python
from pydantic import BaseModel, Field

class Producto(BaseModel):
    codigo: str = Field(
        title="Código Único de Producto",
        description="Identificador alfanumérico interno del artículo en el inventario.",
        examples=["PROD-102", "ART-994"],
        min_length=8,
        max_length=12
    )
    precio: float = Field(
        description="Precio de venta al público en moneda local.",
        gt=0,
        le=10000
    )

```

Al generar el esquema con `Producto.model_json_schema()`, Pydantic traduce estos argumentos de Python en especificaciones JSON Schema estándar dentro de la sección de propiedades:

```json
{
  "properties": {
    "codigo": {
      "description": "Identificador alfanumérico interno del artículo en el inventario.",
      "examples": [
        "PROD-102",
        "ART-994"
      ],
      "maxLength": 12,
      "minLength": 8,
      "title": "Código Único de Producto",
      "type": "string"
    },
    "precio": {
      "description": "Precio de venta al público en moneda local.",
      "exclusiveMinimum": 0.0,
      "maximum": 10000.0,
      "title": "Precio",
      "type": "number"
    }
  },
  "required": [
    "codigo",
    "precio"
  ],
  "title": "Producto",
  "type": "object"
}

```

Es importante notar cómo los argumentos abreviados de validación numérica (`gt` para *greater than* y `le` para *less than or equal*) se convierten formalmente a las palabras clave estándar de JSON Schema: `exclusiveMinimum` y `maximum`.

### El parámetro `json_schema_extra`

Cuando necesitas añadir campos personalizados al esquema que no forman parte de los argumentos nativos de la función `Field()` (como claves personalizadas para extensiones de pasarelas de pago, integraciones con interfaces de usuario específicas o metadatos internos), se debe utilizar el parámetro `json_schema_extra`.

Este parámetro acepta un diccionario con cualquier estructura clave-valor que desees inyectar de forma directa en el sub-esquema del campo, o una función encargada de modificarlo dinámicamente.

#### Uso con un diccionario estático

Es la opción idónea cuando los metadatos añadidos son fijos y conocidos en tiempo de diseño:

```python
class Transaccion(BaseModel):
    monto: float
    canal: str = Field(
        default="web",
        json_schema_extra={
            "x-ui-component": "SelectDropdown",
            "x-audit-required": True
        }
    )

```

#### Uso con una función callback

Si necesitas realizar modificaciones condicionales o dinámicas sobre el esquema del campo, puedes pasar una función invocable al parámetro `json_schema_extra`. Esta función debe aceptar un único argumento de tipo diccionario (que representa el esquema del campo generado hasta ese momento por Pydantic) y modificarlo en el sitio (*in-place*).

```python
def mapear_interfaz_antigua(schema: dict[str, any]) -> None:
    # Copia la descripción a una clave heredada exigida por un software antiguo
    if "description" in schema:
        schema["legacy_description_field"] = schema["description"]

class Documento(BaseModel):
    contenido: str = Field(
        description="Texto plano con el cuerpo del documento.",
        json_schema_extra=mapear_interfaz_antigua
    )

```

El resultado de procesar el campo `contenido` incluirá de forma transparente tanto la clave original de JSON Schema como la transformación realizada por el callback:

```json
"contenido": {
  "description": "Texto plano con el cuerpo del documento.",
  "legacy_description_field": "Texto plano con el cuerpo del documento.",
  "title": "Contenido",
  "type": "string"
}

```

### Comportamiento de los Alias en el Esquema

Los alias permiten cambiar el nombre con el que se interactúa con un campo en el mundo exterior (por ejemplo, transformar un formato `snake_case` de Python a un `camelCase` típico de JSON). El impacto de un alias en la generación del esquema JSON depende fundamentalmente del parámetro `by_alias` proporcionado al método `model_json_schema()`.

Por defecto, `by_alias` es `True`. Esto significa que el esquema resultante utilizará el nombre del alias como la clave de la propiedad en lugar del nombre de la variable en el código de Python.

Observemos el siguiente modelo con alias definidos:

```python
class Cliente(BaseModel):
    primer_nombre: str = Field(alias="firstName")
    identificacion_fiscal: str = Field(validation_alias="tax_id", serialization_alias="taxID")

```

Al invocar la generación del esquema para este modelo, los resultados varían sustancialmente según los parámetros de configuración empleados:

* **`Cliente.model_json_schema(by_alias=True)` (Comportamiento por defecto):**
Las propiedades resultantes en el JSON se llamarán `"firstName"` y el nombre variará según el modo de esquema (`"tax_id"` si el modo es de validación o `"taxID"` si el modo es de serialización). La clave `"primer_nombre"` no aparecerá como propiedad en el esquema.
* **`Cliente.model_json_schema(by_alias=False)`:**
El esquema ignorará por completo todos los alias y generará las propiedades utilizando los nombres literales de las variables en Python: `"primer_nombre"` y `"identificacion_fiscal"`. Esto es muy útil si estás generando esquemas para consumo exclusivo de procesos internos de Python o herramientas de backend que comparten tu misma convención de nombres.

## 16.3. Modificando el esquema base

Mientras que la personalización a nivel de campo modifica las propiedades individuales de un objeto, a menudo se requiere alterar la estructura del esquema en su nivel más alto o aplicar transformaciones globales a todas las definiciones del modelo. Para este propósito, Pydantic proporciona herramientas de configuración a gran escala a través del diccionario `ConfigDict`, así como la capacidad de interceptar y transformar el esquema completo mediante funciones personalizadas.

### Personalización global mediante `ConfigDict`

La forma más directa e integrada de alterar el comportamiento y los metadatos de la raíz del esquema JSON es utilizando la clase `ConfigDict` dentro del atributo `model_config` de tu modelo.

Al igual que ocurre a nivel de campo con la función `Field()`, puedes usar el parámetro `json_schema_extra` en la configuración global para inyectar metadatos adicionales, añadir descripciones generales o reestructurar por completo la salida final del esquema.

#### Uso con un diccionario estático

Es la solución ideal para agregar metadatos complementarios en la raíz del esquema que no alteren las propiedades internas, como especificaciones de versiones de API o convenciones de arquitectura de software particulares:

```python
from pydantic import BaseModel, ConfigDict

class Factura(BaseModel):
    model_config = ConfigDict(
        title="Comprobante Fiscal Electrónico",
        json_schema_extra={
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "x-version": "1.4.2",
            "x-service-owner": "Equipo de Finanzas"
        }
    )
    folio: str
    monto_total: float

```

Al invocar `Factura.model_json_schema()`, Pydantic combinará el título y las claves personalizadas dentro de la raíz del objeto JSON Schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "properties": {
    "folio": { "title": "Folio", "type": "string" },
    "monto_total": { "title": "Monto Total", "type": "number" }
  },
  "required": ["folio", "monto_total"],
  "title": "Comprobante Fiscal Electrónico",
  "type": "object",
  "x-service-owner": "Equipo de Finanzas",
  "x-version": "1.4.2"
}

```

#### Uso con una función callback global

Pasar una función invocable a `json_schema_extra` dentro de `ConfigDict` te da control absoluto sobre el esquema generado. Pydantic llamará a esta función justo antes de devolver el esquema base, pasándole dos argumentos esenciales:

1. `schema`: El diccionario completo del esquema JSON generado automáticamente por Pydantic.
2. `model_class`: Una referencia a la clase del modelo Pydantic que está ejecutando el proceso.

Esta estructura de callback es sumamente poderosa para realizar modificaciones dinámicas basadas en los atributos de la propia clase, o para aplicar reglas globales de forma automatizada sobre todas las propiedades del objeto.

```python
from typing import Any, Type
from pydantic import BaseModel, ConfigDict

def forzar_solo_lectura_y_limpiar(schema: dict[str, Any], model_class: Type[BaseModel]) -> None:
    # 1. Modifica la raíz agregando un metadato dinámico usando el nombre de la clase
    schema["x-generated-from"] = f"Pydantic-Model-{model_class.__name__}"
    
    # 2. Recorre todas las propiedades del objeto e inyecta un atributo "readOnly"
    if "properties" in schema:
        for prop in schema["properties"].values():
            prop["readOnly"] = True

class HistorialAcceso(BaseModel):
    model_config = ConfigDict(json_schema_extra=forzar_solo_lectura_y_limpiar)
    usuario_id: int
    direccion_ip: str

```

Al ejecutar `HistorialAcceso.model_json_schema()`, el esquema base resultante reflejará las alteraciones masivas aplicadas por el callback sobre todas las propiedades:

```json
{
  "properties": {
    "usuario_id": {
      "readOnly": true,
      "title": "Usuario Id",
      "type": "integer"
    },
    "direccion_ip": {
      "readOnly": true,
      "title": "Direccion Ip",
      "type": "string"
    }
  },
  "required": [
    "usuario_id",
    "direccion_ip"
  ],
  "title": "HistorialAcceso",
  "type": "object",
  "x-generated-from": "Pydantic-Model-HistorialAcceso"
}

```

### Personalización mediante la subclase `GenerateJsonSchema`

Cuando las transformaciones que necesitas requieren alterar la forma base en la que Pydantic traduce los tipos de datos nativos de Python a JSON Schema (por ejemplo, cambiar la estructura con la que se definen todas las uniones de tipos, o reescribir de raíz cómo se crean los títulos por defecto de las propiedades), el uso de diccionarios de configuración o callbacks individuales no es suficiente.

Para estos escenarios avanzados de infraestructura, Pydantic expone la clase `GenerateJsonSchema`. Al heredar de esta clase, puedes sobrescribir sus métodos internos para intervenir en cualquier punto del ciclo de vida de la generación del esquema. Posteriormente, pasas tu clase personalizada al parámetro `schema_generator` del método `model_json_schema()`.

A continuación se ilustra cómo extender este comportamiento para eliminar automáticamente los títulos predeterminados (`title`) que Pydantic asigna por defecto a cada una de las propiedades de un modelo si el usuario no los especificó explícitamente:

```python
from typing import Any
from pydantic import BaseModel, Field
from pydantic.json_schema import GenerateJsonSchema, JsonSchemaValue
from pydantic_core import core_schema

class GeneradorSinTitulosPorDefecto(GenerateJsonSchema):
    def field_title_should_be_set(self, schema: core_schema.CoreSchema) -> bool:
        # Sobrescribir esta comprobación interna evita que Pydantic asigne
        # un título inferido automáticamente a partir del nombre del atributo.
        return False

class Item(BaseModel):
    sku: str
    nombre: str = Field(title="Nombre Oficial del Artículo") # Título explícito

# Generar el esquema inyectando la clase generadora modificada
esquema_limpio = Item.model_json_schema(schema_generator=GeneradorSinTitulosPorDefecto)

```

Al inspeccionar el diccionario de `esquema_limpio`, se constata que la propiedad `sku` carece por completo del campo `"title"`, mientras que la propiedad `nombre` retiene su valor sin alteraciones debido a que se configuró de forma explícita en su declaración:

```json
{
  "properties": {
    "sku": {
      "type": "string"
    },
    "nombre": {
      "title": "Nombre Oficial del Artículo",
      "type": "string"
    }
  },
  "required": [
    "sku",
    "nombre"
  ],
  "title": "Item",
  "type": "object"
}

```

Esta técnica de bajo nivel garantiza una flexibilidad total sin necesidad de parchear la biblioteca, permitiendo adaptar Pydantic a cualquier especificación técnica o herramienta propietaria de consumo de datos.

## 16.4. Soporte para OpenAPI

La especificación OpenAPI (anteriormente conocida como Swagger) es el estándar de la industria para describir y documentar APIs RESTful. Dado que OpenAPI utiliza una variante de JSON Schema para definir las estructuras de datos que se envían y reciben en los puntos de enlace (*endpoints*), la compatibilidad de Pydantic con este formato es uno de sus pilares más potentes en el desarrollo web moderno.

Aunque OpenAPI 3.1 ha alineado casi por completo su especificación con JSON Schema (adoptando formalmente el borrador **Draft 2020-12**), existen sutiles diferencias técnicas en la forma en que se estructuran las referencias internas y ciertos metadatos avanzados. Pydantic resuelve este problema integrando un soporte nativo que adapta de forma automática sus esquemas para que sean plenamente compatibles con los ecosistemas de herramientas basados en OpenAPI.

### Generación de esquemas optimizados para OpenAPI

Cuando extraes el esquema de tus modelos para integrarlo en la documentación de una API, el método `model_json_schema()` te permite especificar el dialecto exacto que deseas generar. Pasando la clase de configuración de OpenAPI al parámetro `schema_generator`, Pydantic se encarga de reestructurar las definiciones del esquema base.

El cambio principal radica en la ubicación de los esquemas reutilizables (modelos anidados). Mientras que JSON Schema puro agrupa estas estructuras bajo la clave `$defs`, la especificación OpenAPI requiere tradicionalmente que se organicen bajo la ruta de punteros `#/components/schemas`.

A continuación se muestra cómo indicarle a Pydantic que genere un esquema con la estructura oficial de componentes de OpenAPI:

```python
from pydantic import BaseModel
from pydantic.json_schema import OpenAPIJsonSchema

class Autor(BaseModel):
    nombre: str
    biografia: str

class Libro(BaseModel):
    titulo: str
    autor: Autor

# Generar el esquema adaptado estrictamente para OpenAPI
esquema_openapi = Libro.model_json_schema(schema_generator=OpenAPIJsonSchema)

import json
print(json.dumps(esquema_openapi, indent=2, ensure_ascii=False))

```

Al inspeccionar el resultado, se puede observar cómo Pydantic ha sustituido la raíz `$defs` por la nomenclatura oficial de OpenAPI, y ha ajustado las referencias `$ref` de las propiedades internas de forma automática:

```json
{
  "components": {
    "schemas": {
      "Autor": {
        "properties": {
          "nombre": { "title": "Nombre", "type": "string" },
          "biografia": { "title": "Biografia", "type": "string" }
        },
        "required": ["nombre", "biografia"],
        "title": "Autor",
        "type": "object"
      }
    }
  },
  "properties": {
    "titulo": { "title": "Titulo", "type": "string" },
    "autor": { "$ref": "#/components/schemas/Autor" }
  },
  "required": ["titulo", "autor"],
  "title": "Libro",
  "type": "object"
}

```

### Integración en Frameworks: El caso de FastAPI

En el desarrollo de aplicaciones reales, rara vez tendrás que llamar a `model_json_schema(schema_generator=OpenAPIJsonSchema)` de forma manual. Frameworks web modernos como FastAPI delegan por completo la validación de peticiones y respuestas en Pydantic.

Cuando creas una aplicación con FastAPI, el framework inspecciona los modelos de Pydantic que utilizas como parámetros de entrada o como tipos de retorno en tus funciones de ruta. En segundo plano, FastAPI recopila todos estos modelos, invoca la generación de esquemas bajo el dialecto de OpenAPI y ensambla el documento JSON de especificación global de la API de manera transparente.

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Articulo(BaseModel):
    id: int
    texto: str

@app.post("/articulos/", response_model=Articulo)
def crear_articulo(articulo: Articulo):
    # FastAPI usa Pydantic para validar la entrada y la salida
    return articulo

```

Gracias a este acoplamiento nativo, cuando accedes a la interfaz de documentación interactiva (como `/docs` o `/redoc`), los esquemas que visualizas reflejan con absoluta precisión todas las restricciones, descripciones y ejemplos que hayas configurado en tus clases de Pydantic utilizando `Field()` o `ConfigDict`.

## Resumen del capítulo

En este capítulo hemos explorado la profunda sinergia que existe entre Pydantic y los estándares de documentación estructurada de datos.

Comenzamos analizando el método central `model_json_schema()`, encargado de traducir nuestras clases de Python a diccionarios compatibles con JSON Schema Draft 2020-12, diferenciando además los esquemas según los modos de validación o serialización. Posteriormente, estudiamos cómo enriquecer estas definiciones a nivel individual mediante el uso de `Field()`, sus restricciones semánticas y la inyección de metadatos mediante `json_schema_extra`.

También abordamos la personalización a gran escala, aprendiendo a modificar la raíz del esquema mediante callbacks globales y extendiendo la clase `GenerateJsonSchema` para tomar el control absoluto sobre el motor de renderizado. Finalmente, vimos cómo Pydantic adapta sus esquemas para cumplir con los requerimientos de la especificación OpenAPI, sirviendo como el motor fundamental de generación de documentación interactiva que impulsa a frameworks web de alto rendimiento como FastAPI.
