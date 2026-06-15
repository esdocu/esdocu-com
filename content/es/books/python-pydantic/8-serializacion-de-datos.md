Este capítulo aborda la transformación de modelos de Pydantic V2 en estructuras externas para el intercambio y almacenamiento de información. A través del motor de alto rendimiento en Rust, aprenderás a exportar datos de forma precisa hacia diccionarios nativos de Python y cadenas de texto en formato JSON. Descubrirás cómo controlar la salida mediante el filtrado dinámico o estático de atributos sensibles, el uso de alias de salida y la creación de serializadores a medida con el decorador `@field_serializer` para adaptar los flujos a cualquier regla de negocio.

## 8.1. Exportación a diccionarios

En Pydantic V2, la conversión de una instancia de modelo en un diccionario nativo de Python es un proceso optimizado que se realiza principalmente a través del método `model_dump()`. Este método sustituye al antiguo método `.dict()` de Pydantic V1, ofreciendo un rendimiento significativamente mayor gracias al motor interno escrito en Rust (`pydantic-core`).

Cuando exportas un modelo a un diccionario, Pydantic procesa cada atributo, ejecuta los serializadores correspondientes y genera una estructura de datos compuesta por tipos primitivos de Python (cadenas, enteros, flotantes, booleanos, listas, tuplas y diccionarios).

### El método `model_dump()`

La forma más directa de transformar un modelo es invocar `model_dump()` sin argumentos. Esto exportará todos los campos del modelo con sus valores actuales.

```python
from pydantic import BaseModel

class Usuario(BaseModel):
    id: int
    nombre: str
    activo: bool

# Instanciación del modelo
usuario = Usuario(id=101, nombre="Ana", activo=True)

# Exportación a diccionario
usuario_dict = usuario.model_dump()

print(usuario_dict)
# Resultado: {'id': 101, 'nombre': 'Ana', 'activo': True}
print(type(usuario_dict))
# Resultado: <class 'dict'>

```

### Flujo de serialización estándar

El siguiente diagrama en texto plano ilustra cómo viajan los datos desde la instancia del modelo de Pydantic hasta el diccionario final de Python:

```text
[ Instancia de BaseModel ]
           │
           │  .model_dump()
           ▼
[ pydantic-core (Rust) ] ──► Aplica filtros (mode, warnings, etc.)
           │
           ▼
[ Diccionario Nativo ] ──► { "campo": "valor_serializado" }

```

### Configuración del modo de volcado: `mode`

El método `model_dump()` acepta un parámetro clave llamado `mode`. Este parámetro determina el nivel de transformación que sufrirán los datos complejos (como objetos `datetime`, `UUID` o `Url`) durante la exportación. Sus dos opciones principales son:

1. **`mode='python'` (por defecto):** Conserva los objetos de Python en su tipo nativo siempre que sea posible. Por ejemplo, un objeto `datetime.date` se mantendrá como un objeto `date` dentro del diccionario resultante.
2. **`mode='json'`:** Convierte todos los campos a tipos de datos estrictamente compatibles con el estándar JSON. Los objetos `datetime` se transformarán en cadenas de texto ISO-8601, los `UUID` en cadenas, etc.

```python
from datetime import datetime
from pydantic import BaseModel

class Evento(BaseModel):
    nombre: str
    fecha_hora: datetime

evento = Evento(nombre="Conferencia Tech", fecha_hora=datetime(2026, 5, 21, 10, 0))

# Modo Python (por defecto)
dict_python = evento.model_dump(mode='python')
print(dict_python['fecha_hora'])
# Resultado: 2026-05-21 10:00:00 (Objeto datetime de Python)

# Modo JSON
dict_json = evento.model_dump(mode='json')
print(dict_json['fecha_hora'])
# Resultado: '2026-05-21T10:00:00' (Cadena de texto str)

```

### Conservación de alias de salida: `by_alias`

Si tu modelo define alias para los campos mediante el uso de `Field(serialization_alias=...)` o `Field(alias=...)`, puedes indicarle a Pydantic que utilice estos nombres alternativos como claves del diccionario en lugar de los nombres de las variables en Python. Esto se logra asignando `by_alias=True`.

```python
from pydantic import BaseModel, Field

class Cliente(BaseModel):
    id_interno: int = Field(serialization_alias="customerId")
    nombre_completo: str = Field(serialization_alias="fullName")

cliente = Cliente(id_interno=45, nombre_completo="Carlos Pérez")

# Sin usar alias (usa los nombres de variables de Python)
print(cliente.model_dump())
# Resultado: {'id_interno': 45, 'nombre_completo': 'Carlos Pérez'}

# Usando alias (ideal para preparar payloads externos)
print(cliente.model_dump(by_alias=True))
# Resultado: {'customerId': 45, 'fullName': 'Carlos Pérez'}

```

### Control de valores no asignados: `exclude_unset`

Por defecto, `model_dump()` exportará todos los campos definidos en el modelo, utilizando sus valores predeterminados si no se proporcionaron explícitamente durante la inicialización. Si deseas exportar **únicamente** los campos que el usuario proporcionó de forma expresa al crear la instancia, debes utilizar `exclude_unset=True`.

```python
from pydantic import BaseModel

class Configuracion(BaseModel):
    host: str = "localhost"
    puerto: int = 8080
    timeout: int = 30

# El usuario solo define el puerto de forma explícita
config = Configuracion(puerto=9000)

# Comportamiento por defecto (incluye todo)
print(config.model_dump())
# Resultado: {'host': 'localhost', 'puerto': 9000, 'timeout': 30}

# Excluyendo los campos no asignados por el usuario
print(config.model_dump(exclude_unset=True))
# Resultado: {'puerto': 9000}

```

### Control de valores por defecto y nulos: `exclude_defaults` y `exclude_none`

Pydantic ofrece dos filtros booleanos adicionales para refinar el contenido del diccionario de salida:

* **`exclude_defaults=True`:** Omite cualquier campo cuyo valor actual sea exactamente igual al valor predeterminado definido en la declaración del modelo.
* **`exclude_none=True`:** Elimina del diccionario resultante todas las claves cuyo valor sea `None`.

```python
from typing import Optional
from pydantic import BaseModel

class Producto(BaseModel):
    codigo: str
    precio: float = 0.0
    descripcion: Optional[str] = None

# Instancia donde 'precio' toma el valor por defecto y 'descripcion' es None
item = Producto(codigo="A-12")

# Excluyendo valores por defecto
print(item.model_dump(exclude_defaults=True))
# Resultado: {'codigo': 'A-12', 'descripcion': None}

# Excluyendo valores None
print(item.model_dump(exclude_none=True))
# Resultado: {'codigo': 'A-12', 'precio': 0.0}

# Combinando ambos filtros
print(item.model_dump(exclude_defaults=True, exclude_none=True))
# Resultado: {'codigo': 'A-12'}

```

## 8.2. Generación de cadenas JSON

Mientras que `model_dump()` exporta las instancias de tus modelos a estructuras de diccionarios de Python, el método `model_dump_json()` realiza la serialización directa de la instancia a una cadena de texto en formato JSON (`str`).

En Pydantic V2, este proceso es sumamente eficiente debido a que la conversión a JSON se ejecuta directamente en código nativo de Rust a través de `pydantic-core`. Esto evita el paso intermedio de construir un diccionario en Python y luego pasarlo por la biblioteca estándar `json.dumps()`, reduciendo drásticamente el consumo de memoria y los tiempos de CPU.

### El método `model_dump_json()`

La invocación básica de `model_dump_json()` genera una cadena de texto compacta que contiene la representación JSON serializada de todos los atributos del modelo.

```python
from pydantic import BaseModel

class Dispositivo(BaseModel):
    id: str
    voltaje: float
    en_linea: bool

equipo = Dispositivo(id="sensor-01", voltaje=5.12, en_linea=True)

# Exportación directa a cadena JSON
json_str = equipo.model_dump_json()

print(json_str)
# Resultado: {"id":"sensor-01","voltaje":5.12,"en_linea":true}
print(type(json_str))
# Resultado: <class 'str'>

```

### Arquitectura de serialización JSON

El siguiente diagrama muestra la diferencia de rutas entre la serialización tradicional utilizando diccionarios intermedios y la serialización directa nativa de Pydantic V2:

```text
Ruta clásica (Menos eficiente):
[Instancia BaseModel] ──► [Diccionario Python] ──► json.dumps() ──► [Cadena JSON]

Ruta nativa Pydantic V2 (Alta velocidad):
[Instancia BaseModel] ──► [pydantic-core (Rust)] ─────────────────► [Cadena JSON]

```

### Formateo visual: `indent`

Por defecto, la cadena JSON se genera en una sola línea sin espacios redundantes para minimizar el tamaño de transferencia de datos. Si necesitas que la salida sea legible para humanos (por ejemplo, para escribir archivos de configuración o imprimir en logs de depuración), puedes usar el parámetro `indent`. Este acepta un entero que define el número de espacios por nivel de anidamiento.

```python
from pydantic import BaseModel

class ConfigConexion(BaseModel):
    ip: str
    puerto: int

conexion = ConfigConexion(ip="192.168.1.50", puerto=3306)

# Aplicando indentación de 2 espacios
json_formateado = conexion.model_dump_json(indent=2)

print(json_formateado)
/* Resultado:
{
  "ip": "192.168.1.50",
  "puerto": 3306
}
*/

```

### Parámetros heredados de control de flujo

`model_dump_json()` comparte gran parte de la firma de argumentos de `model_dump()`. La lógica de filtrado opera exactamente igual, pero aplicando las restricciones directamente durante la codificación a texto:

* **`by_alias=True`:** Reemplaza las propiedades de Python por sus respectivos `serialization_alias` en las claves de la cadena JSON.
* **`exclude_unset=True`:** Omite del JSON final aquellos campos que no fueron inicializados explícitamente por el usuario.
* **`exclude_defaults=True`:** Excluye las propiedades cuyos valores coincidan con los asignados por defecto en el modelo.
* **`exclude_none=True`:** Remueve del JSON las propiedades que contengan el valor `null` de JavaScript/JSON (equivalente al `None` de Python).

```python
from typing import Optional
from pydantic import BaseModel, Field

class Tarea(BaseModel):
    titulo: str = Field(serialization_alias="taskTitle")
    prioridad: int = 1
    notas: Optional[str] = None

tarea = Tarea(titulo="Refactorizar módulos")

# Aplicando múltiples filtros simultáneamente para optimizar el payload
json_optimizado = tarea.model_dump_json(
    by_alias=True, 
    exclude_unset=True, 
    exclude_none=True
)

print(json_optimizado)
# Resultado: {"taskTitle":"Refactorizar módulos"}

```

> **Nota de compatibilidad:** A diferencia de `model_dump()`, el método `model_dump_json()` no posee un parámetro `mode`. Esto se debe a que su única finalidad es producir texto JSON legal, por lo que actúa implícitamente bajo el comportamiento equivalente a `mode='json'`, transformando automáticamente tipos complejos (como fechas o datos binarios) a sus representaciones válidas en formato de texto estándar.
>
## 8.3. Exclusión de atributos

Durante el proceso de serialización hacia diccionarios o cadenas JSON, es frecuente requerir que ciertos atributos sensibles o temporales no se incluyan en la estructura final de salida (como contraseñas, tokens de sesión o cálculos internos). Pydantic ofrece dos mecanismos principales para lograrlo: el filtrado dinámico en el momento del volcado utilizando los parámetros `include` y `exclude`, y la configuración estática a nivel de campo mediante el uso de la función `Field()`.

### Filtrado dinámico: Parámetros `include` y `exclude`

Tanto `model_dump()` como `model_dump_json()` aceptan los argumentos opcionales `include` y `exclude`. Estos parámetros esperan un conjunto (`set`) de cadenas de texto con los nombres de las propiedades que deseas aislar.

* **`include`:** Especifica de forma estricta los únicos campos que deben formar parte de la exportación. Cualquier atributo que no se liste aquí será omitido.
* **`exclude`:** Especifica los campos concretos que deben dejarse fuera del resultado. Todos los demás atributos que no estén en el conjunto se exportarán normalmente.

```python
from pydantic import BaseModel

class Empleado(BaseModel):
    id: int
    nombre: str
    salario: float
    rol: str

empleado = Empleado(id=501, nombre="Luis", salario=3500.0, rol="Developer")

# Usando 'include' para exportar únicamente el ID y el Nombre
print(empleado.model_dump(include={'id', 'nombre'}))
# Resultado: {'id': 501, 'nombre': 'Luis'}

# Usando 'exclude' para ocultar el salario por motivos de privacidad
print(empleado.model_dump(exclude={'salario'}))
# Resultado: {'id': 501, 'nombre': 'Luis', 'rol': 'Developer'}

```

### Exclusión en modelos anidados (Sintaxis de Diccionario)

Cuando trabajas con modelos complejos que contienen submodelos, un conjunto simple de cadenas solo aplicará al modelo raíz. Si necesitas filtrar propiedades dentro de un objeto anidado, debes pasar un diccionario al parámetro `include` o `exclude`. En este diccionario, las claves representan las propiedades del modelo superior y los valores definen los filtros para los submodelos (usando un `set` o un nuevo diccionario anidado).

```python
from pydantic import BaseModel

class Ubicacion(BaseModel):
    ciudad: str
    codigo_postal: str
    coordenadas_gps: str

class Empresa(BaseModel):
    razon_social: str
    nit: str
    sede: Ubicacion

empresa = Empresa(
    razon_social="Tech Solutions S.A.",
    nit="900-123-4",
    sede=Ubicacion(ciudad="Medellín", codigo_postal="05001", coordenadas_gps="6.24,-75.58")
)

# Excluir 'nit' de la raíz y 'coordenadas_gps' del submodelo 'sede'
filtro_exclusion = {
    'nit': True,
    'sede': {'coordenadas_gps'}
}

resultado = empresa.model_dump(exclude=filtro_exclusion)
print(resultado)
/* Resultado:
{
    'razon_social': 'Tech Solutions S.A.',
    'sede': {
        'ciudad': 'Medellín',
        'codigo_postal': '05001'
    }
}
*/

```

### Exclusión estática permanente con `Field()`

Si un atributo nunca debe ser expuesto durante la serialización, la mejor práctica consiste en definirlo directamente en el esquema del modelo utilizando la función `Field()` junto con el argumento `exclude=True`.

Al hacer esto, el campo participará con normalidad en las etapas de inicialización y validación de datos de entrada, pero se omitirá de forma automática y permanente en cualquier llamada a `model_dump()` o `model_dump_json()`, sin necesidad de pasar parámetros manuales en cada exportación.

```python
from pydantic import BaseModel, Field

class CuentaUsuario(BaseModel):
    username: str
    email: str
    password_hash: str = Field(exclude=True)  # Exclusión permanente

cuenta = CuentaUsuario(
    username="gopher99",
    email="gopher@example.com",
    password_hash="$2b$12$K7v19df8h23jldkS"
)

# La contraseña se omite automáticamente de la salida
print(cuenta.model_dump())
# Resultado: {'username': 'gopher99', 'email': 'gopher@example.com'}

print(cuenta.model_dump_json())
# Resultado: {"username":"gopher99","email":"gopher@example.com"}

```

El siguiente diagrama resume cómo interactúan los filtros dinámicos y estáticos durante el ciclo de vida de los datos al exportar un modelo:

```text
[ Datos de Entrada ] ──► Validar e Inicializar ──► [ Instancia del Modelo ]
                                                           │
                                                           │ .model_dump()
                                                           ▼
                                            ¿Tiene Field(exclude=True)?
                                             ├── SÍ ──► [ Omitir Campo ]
                                             └── NO
                                                  │
                                                  ▼
                                            ¿Está en set 'exclude' o fuera de 'include'?
                                             ├── SÍ ──► [ Omitir Campo ]
                                             └── NO
                                                  │
                                                  ▼
                                            [ Diccionario o JSON Final ]

```

## 8.4. Serializadores a medida

Pydantic permite modificar por completo la forma en que los campos de un modelo se transforman a diccionarios o cadenas JSON. Aunque la conversión por defecto cubre la mayoría de los escenarios, existen casos donde se requiere un control absoluto sobre la salida, como formatear una moneda, alterar la estructura de fechas o transformar objetos de librerías externas que Pydantic no reconoce de forma nativa.

Para definir esta lógica personalizada, Pydantic V2 introduce el decorador `field_serializer`.

### El decorador `field_serializer`

El decorador `@field_serializer` se aplica sobre métodos dentro del modelo para interceptar el proceso de volcado (`model_dump` y `model_dump_json`) de un campo específico. El método decorado recibe como primer argumento el valor actual del campo y debe retornar el dato ya transformado en su nuevo formato listo para la serialización.

```python
from pydantic import BaseModel, field_serializer

class Factura(BaseModel):
    concepto: str
    total: float

    @field_serializer('total')
    def formatear_moneda(self, valor: float) -> str:
        # Modifica la salida para que siempre incluya el símbolo de divisa
        return f"${valor:,.2f}"

factura = Factura(concepto="Suscripción Cloud", total=1250.5)

# Al exportar, el campo 'total' ejecuta el serializador a medida
print(factura.model_dump())
# Resultado: {'concepto': 'Suscripción Cloud', 'total': '$1,250.50'}

```

### Configuración del comportamiento: El parámetro `mode`

Al igual que en la validación, el decorador `field_serializer` acepta un parámetro `mode` que define el comportamiento del flujo de exportación:

1. **`mode='plain'` (por defecto):** Reemplaza por completo el serializador interno de Pydantic. Tu función es la única responsable de transformar el valor desde su tipo original hasta el tipo primitivo final.
2. **`mode='wrap'`:** Envuelve el serializador por defecto de Pydantic. Tu función recibe el valor del campo y un objeto manejador (`SerializerFunctionWrapHandler`). Esto te permite dejar que Pydantic haga el trabajo duro inicial y luego modificar el resultado, o aplicar lógica condicional.

### Serialización condicional según el formato (Python vs JSON)

Una de las ventajas más potentes de `@field_serializer` es la capacidad de inspeccionar el contexto de la serialización mediante el uso del parámetro especial `FieldSerializationInfo`. Esto te permite devolver un tipo de dato diferente si el usuario ejecutó un volcado a un diccionario nativo (`model_dump()`) o a una cadena de texto (`model_dump_json()`).

El siguiente ejemplo muestra cómo conservar un tipo de dato estructurado en Python pero transformarlo a un formato plano y optimizado al generar un JSON:

```python
from pydantic import BaseModel, field_serializer, FieldSerializationInfo

class Inventario(BaseModel):
    producto: str
    etiquetas: set[str]

    @field_serializer('etiquetas')
    def serializar_etiquetas(self, valores: set[str], info: FieldSerializationInfo):
        # info.mode_is_json() devuelve True si se invocó .model_dump_json()
        if info.mode_is_json():
            # JSON no soporta sets; los exportamos como una cadena unida por comas
            return ",".join(sorted(valores))
        
        # Para model_dump(), convertimos el set a una lista estándar de Python
        return list(valores)

item = Inventario(producto="Teclado Mecánico", etiquetas={"tech", "hardware", "usb"})

# Volcado a diccionario (Estructura de datos nativa)
print(item.model_dump())
# Resultado: {'producto': 'Teclado Mecánico', 'etiquetas': ['hardware', 'tech', 'usb']}

# Volcado a cadena JSON (Texto plano optimizado)
print(item.model_dump_json())
# Resultado: {"producto":"Teclado Mecánico","etiquetas":"hardware,tech,usb"}

```

El flujo de decisiones dentro del serializador condicional se puede visualizar de la siguiente manera:

```text
                  [ Invocación de Serialización ]
                                 │
                     ¿Qué método se ejecutó?
                     ├── .model_dump() ──────► info.mode_is_json() -> False
                     └── .model_dump_json() ──► info.mode_is_json() -> True
                                 │
                                 ▼
                    [ Ejecución del Método ] ──► Aplica lógica según el modo
                                 │
                                 ▼
                     [ Resultado Formateado ]

```

## Resumen del capítulo

En este capítulo hemos explorado en profundidad las herramientas de **Serialización de Datos** que ofrece Pydantic V2 para la exportación de modelos:

* **Exportación a diccionarios (`8.1`):** Aprendimos a utilizar `model_dump()` para generar diccionarios tradicionales de Python, controlando la transformación de objetos complejos mediante el parámetro `mode` y gestionando claves alternativas con `by_alias`.
* **Generación de cadenas JSON (`8.2`):** Analizamos el método `model_dump_json()` y cómo su integración nativa con el motor en Rust evita pasos intermedios, agilizando la creación de cadenas de texto estructuradas de forma directa y eficiente.
* **Exclusión de atributos (`8.3`):** Revisamos los mecanismos para restringir datos salientes de manera dinámica en el momento del volcado mediante `include`/`exclude`, y de forma estática y permanente utilizando la propiedad `exclude=True` en la declaración de campos con `Field()`.
* **Serializadores a medida (`8.4`):** Estudiamos el uso del decorador `@field_serializer` para interceptar y reescribir los valores salientes, dándonos el poder de adaptar las respuestas según las necesidades del negocio o el formato final de exportación.
