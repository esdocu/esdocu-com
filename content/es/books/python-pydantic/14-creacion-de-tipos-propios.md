Este capítulo aborda la extensión del sistema de tipado de Pydantic V2 para diseñar tipos de datos personalizados con lógica de validación incrustada. Se estudia el uso estratégico de `Annotated` para asociar metadatos y reutilizar restricciones de manera limpia y desacoplada de los modelos. Además, se profundiza en el desarrollo de clases a medida mediante la implementación de métodos como `__get_pydantic_core_schema__`, permitiendo interactuar directamente con el motor de validación en Rust (`pydantic-core`). Finalmente, se analiza la creación de tipos robustos adaptados para la persistencia de datos en ORMs y bases de datos como MongoDB.

## 14.1. Uso del módulo Annotated

El módulo `Annotated`, introducido en el módulo estándar `typing` de Python 3.9 (y disponible a través de `typing_extensions` para versiones anteriores), se ha convertido en una pieza fundamental de la arquitectura de Pydantic V2. Su propósito principal es permitir la asociación de metadatos específicos del contexto o de bibliotecas de terceros a un tipo de datos existente, sin alterar el comportamiento del tipado estático (*static type checking*).

En las secciones previas se analizó el uso de la función `Field()` para añadir restricciones y valores predeterminados dentro de un modelo heredado de `BaseModel`. Sin embargo, `Annotated` ofrece un enfoque radicalmente diferente y más potente: traslada la lógica de validación, documentación y metadatos **directamente al tipo de datos**, desvinculándola de la estructura rígida de un modelo de Pydantic.

### Estructura conceptual de Annotated

La sintaxis básica de `Annotated` recibe al menos dos argumentos: el tipo de datos base y uno o varios objetos de metadatos.

```text
+-------------------------------------------------------------+
|                       typing.Annotated                      |
|                                                             |
|   +---------------------+     +--------------------------+  |
|   |  1. Tipo base       |     |  2. Metadatos (Pydantic) |  |
|   |  (e.g., int, str)   |  ,  |  (e.g., Field(), Before) |  |
|   +---------------------+     +--------------------------+  |
+-------------------------------------------------------------+

```

Cuando Pydantic analiza una anotación de tipo que utiliza `Annotated`, inspecciona los metadatos suministrados en el segundo término en adelante. Si encuentra objetos reconocibles (como instancias de `FieldInfo` u otros objetos de validación de Pydantic), los asimila para configurar el esquema de validación principal del campo.

### Declaración y equivalencia con Field()

Para comprender la utilidad de `Annotated`, la siguiente tabla ilustra la equivalencia exacta entre la declaración tradicional dentro de un modelo y la declaración orientada a tipos mediante `Annotated`:

```text
Forma Tradicional (Enfoque en el Modelo)
----------------------------------------------------------------------
class Usuario(BaseModel):
    edad: int = Field(..., ge=18, le=99)

Forma Moderna (Enfoque en el Tipo con Annotated)
----------------------------------------------------------------------
EdadValida = Annotated[int, Field(ge=18, le=99)]

class Usuario(BaseModel):
    edad: EdadValida

```

Esta separación de responsabilidades aporta múltiples ventajas en el desarrollo de software con Pydantic:

1. **Reutilización de código**: Permite definir un tipo de datos con validaciones complejas una sola vez y reutilizarlo en múltiples modelos, parámetros de funciones (como en FastAPI) o estructuras de datos jerárquicas.
2. **Compatibilidad con herramientas de tipado**: Los analizadores estáticos como *mypy* o *pyright* ignoran por completo los metadatos adicionales y tratan la variable exclusivamente como el tipo base especificado.
3. **Limpieza visual**: Reduce la redundancia visual dentro de las clases de configuración de datos (`BaseModel`).

### Ejemplo práctico de implementación

A continuación, se presenta un caso de uso donde se construyen tipos personalizados reutilizables para un sistema de gestión de inventario. Se restringen cadenas de texto y valores numéricos utilizando `Annotated` junto con `Field`.

```python
from typing import Annotated
from pydantic import BaseModel, Field, ValidationError

# Definición de tipos de datos reutilizables con metadatos de Pydantic
CodigoProducto = Annotated[
    str, 
    Field(min_length=5, max_length=10, pattern=r"^[A-Z]{2}-\d+$")
]
PrecioPositivo = Annotated[
    float, 
    Field(gt=0, description="El precio debe ser un número estrictamente positivo")
]
CantidadStock = Annotated[
    int, 
    Field(ge=0, le=10000)
]

# Uso de los tipos dentro de un modelo Pydantic
class ItemInventario(BaseModel):
    codigo: CodigoProducto
    precio: PrecioPositivo
    cantidad: CantidadStock

# --- Pruebas de Validación ---

# Caso 1: Datos válidos
try:
    item_valido = ItemInventario(codigo="PROD-101", precio=29.99, cantidad=150)
    print("Item creado con éxito:", item_valido.model_dump())
except ValidationError as e:
    print(e.json())

# Caso 2: Violación de las restricciones del tipo con Annotated
try:
    item_invalido = ItemInventario(
        codigo="prod-101",  # Error: No cumple con la expresión regular (letras minúsculas)
        precio=-5.0,        # Error: No es estrictamente mayor que 0
        cantidad=15000      # Error: Supera el límite máximo de 10000
    )
except ValidationError as e:
    print("\nErrores de validación capturados:")
    for error in e.errors():
        print(f" Campo: {error['loc'][0]} -> Mensaje: {error['msg']}")

```

### Comportamiento de los valores predeterminados (default)

Un aspecto técnico crítico al utilizar `Annotated` es el manejo de los valores por defecto. Aunque la función `Field()` permite pasar el argumento `default` o `default_factory`, **Pydantic no procesa los valores predeterminados si se colocan dentro del constructor de `Annotated`** cuando se usa asignación directa en el modelo.

El estándar de Python dicta que los valores por defecto de los atributos de una clase deben asignarse explícitamente mediante el operador `=`.

```python
# INCORRECTO: El valor por defecto dentro de Annotated no se aplicará automáticamente al inicializar
TipoConDefectoInutil = Annotated[str, Field(default="Valor por defecto")]

class ModeloIncorrecto(BaseModel):
    campo: TipoConDefectoInutil # Provocará un error de campo requerido al instanciar sin argumentos

# CORRECTO: El tipo define las restricciones; la asignación de clase define el valor por defecto
TextoRestringido = Annotated[str, Field(min_length=3)]

class ModeloCorrecto(BaseModel):
    campo: TextoRestringido = "ABC" # Funciona correctamente

```

### Integración de múltiples metadatos

`Annotated` no se limita a un único objeto de metadatos. Es viable encadenar múltiples especificaciones, e incluso combinar metadatos de Pydantic con metadatos de otras librerías de análisis o frameworks web. Pydantic aplanará e inspeccionará secuencialmente cada uno de los argumentos provistos para construir el validador final del campo.

```python
from pydantic import AfterValidator

def transformar_mayusculas(v: str) -> str:
    return v.upper()

# Combinación de restricciones de longitud y una función de transformación posterior
IdentificadorMayuscula = Annotated[
    str, 
    Field(min_length=4), 
    AfterValidator(transformar_mayusculas)
]

```

El uso extensivo de `Annotated` constituye la base conceptual para el diseño de tipos de datos sofisticados a medida, los cuales se profundizarán en las secciones siguientes a través del uso de protocolos de esquema avanzados y métodos nativos del núcleo de Pydantic.

## 14.2. Clases de tipo a medida

Aunque el módulo `Annotated` cubre la mayoría de los escenarios de validación comunes mediante la reutilización de `Field()`, existen situaciones donde la lógica de validación e inicialización de un tipo de datos es tan compleja que requiere el uso de una clase dedicada.

En Pydantic V2, cualquier clase de Python puede convertirse en un tipo de datos compatible y validable si implementa un protocolo específico que le indique a Pydantic cómo debe ser procesada durante la deserialización (validación) y la serialización (exportación).

### El Protocolo de Validación en Clases

Para que Pydantic reconozca una clase personalizada directamente como una anotación de tipo válida, la clase debe exponer métodos de clase dunder (*double underscore*) especiales que actúen como puntos de entrada para el motor de validación interno (`pydantic-core`).

Los dos métodos fundamentales para la integración de clases personalizadas son:

* `__get_pydantic_core_schema__`: Define el esquema de validación y serialización del tipo utilizando las estructuras nativas de Rust. Es el método más potente y se detallará en profundidad en la siguiente sección (14.3).
* `__get_pydantic_bound_schema__`: Se utiliza en escenarios avanzados para resolver esquemas cuando el tipo depende de parámetros genéricos o configuraciones del modelo contenedor.

Sin embargo, para crear clases a medida sin lidiar directamente con los esquemas de bajo nivel de Rust, Pydantic proporciona un enfoque de alto nivel mucho más accesible mediante el uso de **clases validadoras envueltas en `Annotated`** o mediante la implementación de métodos mágicos estándar como `__get_validators__` (legado modificado en V2). El método recomendado en V2 para construir tipos basados en clases limpias es desacoplar la clase de negocio de la lógica de validación mediante decoradores de métodos o adaptadores de funciones.

### Anatomía de una Clase de Tipo a Medida

Cuando encapsulamos un tipo de datos en una clase, generalmente buscamos tres objetivos:

1. **Validación de entrada**: Asegurar que los datos crudos (cadenas, diccionarios, etc.) se puedan transformar de forma segura a nuestra clase.
2. **Inmutabilidad o Lógica de Negocio interna**: Que el objeto resultante exponga métodos y propiedades útiles y mantenga su estado íntegro.
3. **Serialización**: Definir cómo se transforma la instancia de nuestra clase de vuelta a un tipo primitivo (como un string o un JSON) cuando el modelo contenedor ejecuta `.model_dump()` o `.model_dump_json()`.

```text
Datos Crudos (str, int)  ---> [ __get_pydantic_core_schema__ ] ---> Instancia de Clase a Medida
Instancia de Clase       ---> [ Serializador Personalizado   ] ---> Tipo Primitivo (JSON/Dict)

```

### Ejemplo de Implementación: Un tipo a medida para Códigos IBAN

A continuación, se desarrolla una clase para gestionar y validar códigos IBAN (*International Bank Account Number*). Esta clase se encarga de limpiar los espacios en blanco, verificar la longitud mínima, validar el formato y transformar la entrada en un objeto de negocio estructurado.

```python
from typing import Any
from pydantic import BaseModel, ValidationError, GetCoreSchemaHandler
from pydantic_core import core_schema

class IBAN:
    """Clase de negocio que representa un código IBAN validado."""
    
    def __init__(self, codigo: str):
        self._codigo = codigo

    @property
    def codigo_limpio(self) -> str:
        return self._codigo.replace(" ", "")

    @property
    def codigo_formateado(self) -> str:
        # Agrupa el IBAN en bloques de 4 caracteres para su visualización
        c = self.codigo_limpio
        return " ".join(c[i:i+4] for i in range(0, len(c), 4))

    def __repr__(self) -> str:
        return f"IBAN('{self.codigo_limpio}')"

    def __eq__(self, otro: Any) -> bool:
        if not isinstance(otro, IBAN):
            return False
        return self.codigo_limpio == otro.codigo_limpio

    @classmethod
    def __get_pydantic_core_schema__(
        cls, 
        _source_type: Any, 
        _handler: GetCoreSchemaHandler
    ) -> core_schema.CoreSchema:
        """
        Define cómo Pydantic interactúa con esta clase.
        Construye un esquema que acepta un string, lo valida y lo transforma en una instancia de IBAN.
        """
        def validar_iban(valor: Any) -> IBAN:
            if not isinstance(valor, str):
                raise TypeError("El IBAN debe ser una cadena de texto")
            
            # Limpieza básica
            procesado = valor.strip().replace(" ", "").upper()
            
            # Validación de reglas de negocio
            if len(procesado) < 15 or len(procesado) > 34:
                raise ValueError("El IBAN debe tener una longitud de entre 15 y 34 caracteres")
            
            if not procesado[:2].isalpha():
                raise ValueError("El IBAN debe comenzar con dos letras correspondientes al código de país")
            
            if not procesado[2:].isalnum():
                raise ValueError("El IBAN solo puede contener caracteres alfanuméricos")
                
            return cls(procesado)

        # Retornamos un esquema de validación de cadena que se intercepta con nuestra función
        return core_schema.chain_schema([
            core_schema.str_schema(),  # Primero se asegura de que la entrada sea texto
            core_schema.no_info_plain_validator_function(validar_iban), # Luego lo procesa nuestra función
        ])


# --- Integración en un modelo Pydantic ---

class CuentaBancaria(BaseModel):
    titular: str
    cuenta_iban: IBAN

# --- Pruebas de Validación y Uso ---

# Caso 1: Inicialización con datos válidos (con espacios y minúsculas)
try:
    cuenta = CuentaBancaria(
        titular="Alejandro Silva",
        cuenta_iban=" es21 2100 0418 4512 3456 7890 "
    )
    print("Modelo creado exitosamente:")
    print(f"Instancia interna: {repr(cuenta.cuenta_iban)}")
    print(f"IBAN Formateado:   {cuenta.cuenta_iban.codigo_formateado}")
except ValidationError as e:
    print(e.json())

# Caso 2: Intento con datos inválidos (longitud incorrecta o caracteres prohibidos)
try:
    cuenta_invalida = CuentaBancaria(
        titular="María Gómez",
        cuenta_iban="ES21-INVALID-IBAN"
    )
except ValidationError as e:
    print("\nErrores de validación capturados:")
    for error in e.errors():
        print(f" Campo: {error['loc'][0]} -> Mensaje: {error['msg']}")

```

### Control de la Serialización en Clases a Medida

En el ejemplo anterior, si ejecutamos `cuenta.model_dump()`, Pydantic exportará el campo `cuenta_iban` como una instancia de la clase `IBAN`. Si intentamos exportarlo con `cuenta.model_dump_json()`, el serializador fallará debido a que por defecto no sabe cómo convertir un objeto `IBAN` en una cadena de texto nativa para JSON.

Para resolver esto, el esquema devuelto por `__get_pydantic_core_schema__` puede modificarse para incluir un esquema de serialización explícito mediante `core_schema.plain_serializer_function_ser_schema`.

```python
# Modificación interna del método en la clase IBAN para habilitar serialización:
@classmethod
def __get_pydantic_core_schema__(
    cls, 
    _source_type: Any, 
    _handler: GetCoreSchemaHandler
) -> core_schema.CoreSchema:
    
    def validar_iban(valor: Any) -> IBAN:
        # (Lógica de validación idéntica al ejemplo anterior)
        return cls(valor.strip().replace(" ", "").upper())

    return core_schema.json_or_python_schema(
        json_schema=core_schema.chain_schema([
            core_schema.str_schema(),
            core_schema.no_info_plain_validator_function(validar_iban),
        ]),
        python_schema=core_schema.chain_schema([
            core_schema.is_instance_schema(cls),
        ]),
        # Definición de cómo exportar este tipo a JSON/Diccionarios como un string plano
        serialization=core_schema.plain_serializer_function_ser_schema(
            lambda instancia: instancia.codigo_limpio
        )
    )

```

Gracias a este esquema dual, la clase a medida se comporta de manera transparente: se valida a partir de texto, opera internamente como un objeto rico en lógica y métodos, y se vuelve a serializar en texto plano de manera automática al integrarse con APIs o bases de datos.

## 14.3. El método get_core_schema

El método de clase `__get_pydantic_core_schema__` es el punto de entrada de más bajo nivel que ofrece Pydantic V2 para interactuar con su motor interno, `pydantic-core`. A diferencia de los validadores basados en decoradores o las restricciones simples de `Field()`, este método permite definir con total precisión matemática cómo se construye el árbol de validación y serialización en Rust para un tipo de datos determinado.

### Firmas y Parámetros Esenciales

Para implementar este método, la clase o el objeto que actúa como tipo personalizado debe exponer una función con la siguiente firma estructural:

```python
@classmethod
def __get_pydantic_core_schema__(
    cls,
    source_type: Any,
    handler: GetCoreSchemaHandler
) -> core_schema.CoreSchema:
    ...

```

* **`cls`**: La clase que está definiendo el tipo a medida.
* **`source_type`**: El tipo de origen exacto que se ha anotado en el modelo. Esto es especialmente útil cuando una clase hereda de otra o cuando se trabaja con tipos genéricos paramétricos (por ejemplo, `MiTipo[int]`), permitiendo inspeccionar los argumentos de tipo pasados entre corchetes.
* **`handler`**: Una instancia de `GetCoreSchemaHandler`. Este objeto actúa como un puente hacia el sistema de generación de esquemas por defecto de Pydantic. Permite invocar `handler(source_type)` o `handler.generate_schema(source_type)` para obtener el esquema que Pydantic generaría de forma natural para ese tipo, dándonos la oportunidad de envolverlo, modificarlo o añadirle pre/post-validaciones.
* **`core_schema.CoreSchema`**: El tipo de retorno obligatorio. Consiste en un diccionario estructurado (un objeto fuertemente tipado en las definiciones internas de Pydantic) que Rust interpreta directamente para compilar el validador en memoria.

### El ecosistema de pydantic_core.core_schema

Para construir esquemas válidos, es indispensable importar el módulo `core_schema` de la biblioteca secundaria `pydantic_core`. Este módulo provee decenas de funciones factoría para modelar comportamientos. Los componentes clave del flujo son:

```text
                  +-----------------------------------+
                  |      core_schema.CoreSchema       |
                  +-----------------------------------+
                                    |
       +----------------------------+----------------------------+
       |                            |                            |
+--------------+             +--------------+             +--------------+
| Validation   |             | Conditionals |             | Serialization|
| (esquemas)   |             | (filtros)    |             | (exportación)|
+--------------+             +--------------+             +--------------+
| str_schema() |             | chain_schema |             | plain_serial |
| int_schema() |             | union_schema |             | izer_functia |
| typed_dict   |             | json_or_pyth |             | on_ser_schem |
| _schema()    |             | on_schema()  |             | a()          |
+--------------+             +--------------+             +--------------+

```

1. **Esquemas de Tipos Primitivos**: `str_schema()`, `int_schema()`, `float_schema()`, `bool_schema()`. Garantizan que el dato de entrada sea del tipo físico correspondiente y aplican coerciones si el modo no es estricto.
2. **Esquemas de Validación Personalizada**:

* `no_info_plain_validator_function(func)`: Invoca una función de Python pura que recibe únicamente el valor de entrada y devuelve el valor transformado o lanza una excepción (`ValueError`, `TypeError`).
* `with_info_plain_validator_function(func)`: Invoca una función que recibe el valor y un objeto `ValidationInfo`, el cual contiene metadatos adicionales del contexto de validación o la configuración del modelo.

1. **Esquemas Combinatorios**:

* `chain_schema([esquema_1, esquema_2])`: Pasa el resultado del primer esquema como entrada del segundo. Ideal para sanitizar el tipo primero (por ejemplo, asegurar que es un string) antes de procesarlo con lógica de negocio.
* `json_or_python_schema(json_schema, python_schema)`: Permite bifurcar la lógica de validación dependiendo de si los datos se están deserializando desde una cadena JSON pura (`model_validate_json`) o desde estructuras nativas de Python como diccionarios u objetos (`model_validate`).

### Ejemplo Práctico: Validador de Rangos IP CIDR con Esquema de Bajo Livelior

A continuación, se desarrolla un tipo de datos personalizado que valida bloques de red en formato CIDR (por ejemplo, `192.168.1.0/24`). El ejemplo demuestra cómo interceptar el esquema base de texto, inyectar una función de validación propia que use la biblioteca estándar `ipaddress`, y dotar al tipo de un esquema de serialización transparente.

```python
import ipaddress
from typing import Any
from pydantic import BaseModel, ValidationError, GetCoreSchemaHandler
from pydantic_core import core_schema

class BloqueCIDR:
    """Tipo a medida para almacenar y validar notaciones de red CIDR."""

    def __init__(self, red: ipaddress.IPv4Network):
        self.red = red

    def __repr__(self) -> str:
        return f"BloqueCIDR('{self.red}')"

    @classmethod
    def __get_pydantic_core_schema__(
        cls,
        source_type: Any,
        handler: GetCoreSchemaHandler
    ) -> core_schema.CoreSchema:
        """Construcción explícita del esquema del núcleo para Pydantic V2."""

        def validar_red(valor: Any) -> "BloqueCIDR":
            # Si ya es una instancia de BloqueCIDR, la pasamos directamente
            if isinstance(valor, cls):
                return valor
            
            # Si es un objeto de red de ipaddress, lo envolvemos
            if isinstance(valor, ipaddress.IPv4Network):
                return cls(valor)

            # Si es una cadena, intentamos parsearla con lógica estricta
            if isinstance(valor, str):
                try:
                    # strict=True fuerza a que la IP provista sea la dirección base de la red
                    red_objeto = ipaddress.IPv4Network(valor.strip(), strict=True)
                    return cls(red_objeto)
                except ValueError as err:
                    raise ValueError(f"Notación CIDR inválida para IPv4: {err}")
            
            raise TypeError("Se esperaba una cadena de texto o un objeto IPv4Network")

        # 1. Definimos el esquema de validación encadenado
        esquema_validacion = core_schema.chain_schema([
            # Asegura la entrada limpia y el esquema JSON acepta strings
            core_schema.str_schema(),
            # Ejecuta nuestra función validadora pura sin información extra
            core_schema.no_info_plain_validator_function(validar_red)
        ])

        # 2. Definimos el esquema de serialización
        # Determina qué se exporta al ejecutar .model_dump() o .model_dump_json()
        esquema_serializacion = core_schema.plain_serializer_function_ser_schema(
            lambda instancia: str(instancia.red),
            return_schema=core_schema.str_schema()
        )

        # 3. Ensamblamos todo usando json_or_python_schema para optimizar ambos flujos
        return core_schema.json_or_python_schema(
            json_schema=esquema_validacion,
            python_schema=core_schema.union_schema([
                core_schema.is_instance_schema(cls),
                esquema_validacion
            ]),
            serialization=esquema_serializacion
        )

# --- Modelo de Aplicación ---

class ConfiguracionRed(BaseModel):
    nombre_vlan: str
    subred: BloqueCIDR

# --- Pruebas Operacionales ---

# Caso 1: Datos en formato correcto
try:
    config = ConfiguracionRed(nombre_vlan="DMZ_Interna", subred="10.0.0.0/22")
    print("Configuración de red válida:")
    print(f" Atributo interno: {repr(config.subred)}")
    print(f" Serialización (dump): {config.model_dump()}")
    print(f" Serialización (JSON): {config.model_dump_json()}")
except ValidationError as e:
    print(e.json())

# Caso 2: Error de IP que no es la base de la red (strict=True)
try:
    # 192.168.1.5 es una IP de host, no la IP de red para un prefijo /24 (debería ser .0)
    config_err = ConfiguracionRed(nombre_vlan="Produccion", subred="192.168.1.5/24")
except ValidationError as e:
    print("\nError capturado (Restricción estricta de red):")
    for error in e.errors():
        print(f" Mensaje: {error['msg']}")

```

### Ventajas de operar en el nivel de Core Schema

Dominar el retorno de `core_schema` desbloquea capacidades avanzadas que están fuera del alcance de la API de alto nivel de Pydantic:

* **Rendimiento optimizado**: Al compilar las uniones (`union_schema`) e instancias directamente en las estructuras que consume la capa de Rust, se evitan saltos innecesarios entre el intérprete de Python y la memoria nativa, maximizando la velocidad en cargas de trabajo masivas.
* **Manipulación del Esquema JSON**: Permite alterar directamente cómo se representará el tipo en el esquema OpenAPI/JSON resultante sin necesidad de recurrir a decoradores externos como `@model_json_schema`. Esto consolida toda la definición del ciclo de vida del tipo dentro de su propia clase.

## 14.4. Tipos para bases de datos

El ecosistema de desarrollo en Python suele exigir que las estructuras de datos viajen a través de tres capas distintas: la base de datos (relacional o no relacional), los modelos de dominio o negocio (clases puras de Python) y la capa de transporte o API (modelos de Pydantic). Diseñar tipos de datos para bases de datos implica dotar a nuestros tipos personalizados de la capacidad de interactuar limpiamente con ORMs (*Object-Relational Mapping*) como SQLAlchemy, SQLModel o Tortoise ORM, así como con controladores de bases de datos NoSQL (como Motor para MongoDB).

Pydantic V2 facilita esta integración permitiendo que un tipo personalizado actúe como un puente bidireccional: es capaz de instanciarse a partir de tipos nativos de bases de datos (como objetos `ObjectId` de MongoDB o estructuras `JSONB` de PostgreSQL) y sabe cómo degradarse a formatos primitivos cuando la base de datos requiere persistir la información.

### El rol de la validación desde el ORM

Cuando un ORM recupera un registro de la base de datos, los datos no siempre vienen en formato de texto o JSON limpio; a menudo se presentan como objetos específicos del controlador de la base de datos. Nuestro tipo de Pydantic debe ser lo suficientemente flexible para aceptar:

1. **Entradas desde la API (Deserialización Externa)**: Habitualmente cadenas de texto, números o diccionarios crudos que provienen de un cliente HTTP.
2. **Entradas desde el ORM (Deserialización Interna)**: Objetos ya instanciados por el driver de la base de datos.

Para lograr esto de forma robusta, se utiliza `core_schema.json_or_python_schema` combinado con `core_schema.chain_schema`, asegurando que el flujo de Python acepte la instancia nativa directamente sin intentar aplicarle validaciones de texto redundantes.

### Ejemplo Práctico: Tipo personalizado para identificadores de MongoDB (ObjectId)

Un caso de uso clásico y crítico en el desarrollo de APIs es la gestión de los identificadores únicos de MongoDB, conocidos como `ObjectId`. Estos objetos no son cadenas de texto ordinarias, sino instancias de la clase `bson.ObjectId`.

El siguiente ejemplo demuestra cómo crear un tipo personalizado en Pydantic V2 que acepta tanto un `str` hexadecimal (desde la API) como un objeto `ObjectId` nativo (desde la base de datos), validando su estructura y permitiendo su serialización correcta de vuelta a texto plano en las respuestas JSON.

```python
from typing import Any
from bson import ObjectId  # Requiere la librería 'pymongo' o 'bson'
from pydantic import BaseModel, ValidationError, GetCoreSchemaHandler
from pydantic_core import core_schema

class PyObjectId:
    """Tipo a medida para integrarbson.ObjectId de MongoDB con Pydantic V2."""

    @classmethod
    def __get_pydantic_core_schema__(
        cls,
        _source_type: Any,
        _handler: GetCoreSchemaHandler
    ) -> core_schema.CoreSchema:
        """Define el esquema de validación y serialización en el motor de Rust."""

        def validar_object_id(valor: Any) -> ObjectId:
            if isinstance(valor, ObjectId):
                return valor
            if isinstance(valor, str):
                if ObjectId.is_valid(valor):
                    return ObjectId(valor)
                raise ValueError("La cadena provista no es un ObjectId de MongoDB válido")
            raise TypeError("Se esperaba un objeto ObjectId o una cadena hexadecimal de 24 caracteres")

        # Esquema que valida la entrada si viene como un string (ej. desde un JSON de la API)
        esquema_desde_string = core_schema.chain_schema([
            core_schema.str_schema(),
            core_schema.no_info_plain_validator_function(validar_object_id)
        ])

        return core_schema.json_or_python_schema(
            json_schema=esquema_desde_string,
            python_schema=core_schema.union_schema([
                # Si ya es un ObjectId nativo (desde la BD), lo valida instantáneamente
                core_schema.is_instance_schema(ObjectId),
                esquema_desde_string
            ]),
            # Define cómo se exporta el tipo hacia afuera (a la API o al guardar en JSON)
            serialization=core_schema.plain_serializer_function_ser_schema(
                lambda instancia: str(instancia),
                return_schema=core_schema.str_schema()
            )
        )

    @classmethod
    def __get_pydantic_json_schema__(
        cls, 
        _core_schema: core_schema.CoreSchema, 
        handler: Any
    ) -> dict[str, Any]:
        """Modifica el esquema JSON de OpenAPI para que documente el campo como un string."""
        json_schema = handler(_core_schema)
        json_schema.update(
            type="string",
            examples=["507f1f77bcf86cd799439011"],
            description="Identificador único ObjectId de MongoDB en formato hexadecimal de 24 caracteres"
        )
        return json_schema


# --- Modelos de la Aplicación ---

class DocumentoUsuario(BaseModel):
    # Activamos 'from_attributes' para que Pydantic pueda leer atributos de objetos ORM
    model_config = {"from_attributes": True}
    
    id: PyObjectId
    nombre: str
    correo: str

# --- Pruebas de Simulación de Flujos de Datos ---

# Simulación A: Datos que llegan desde una petición HTTP (API externa)
payload_api = {
    "id": "65fc3bd8f1dca23456789abc",
    "nombre": "Carlos Mendoza",
    "correo": "carlos@example.com"
}

try:
    usuario_api = DocumentoUsuario.model_validate(payload_api)
    print("Simulación API: Objeto validado con éxito desde JSON string.")
    print(f" Tipo interno del ID: {type(usuario_api.id)}")
    print(f" ID como objeto de negocio: {repr(usuario_api.id)}")
except ValidationError as e:
    print(e.json())

# Simulación B: Datos que simulan venir directamente del driver de la Base de Datos
class RegistroBD:
    """Clase dummy que simula un documento retornado por el driver de MongoDB"""
    def __init__(self):
        self.id = ObjectId("65fc3bd8f1dca23456789abc")  # Objeto nativo BSON
        self.nombre = "Carlos Mendoza"
        self.correo = "carlos@example.com"

registro_mongo = RegistroBD()

try:
    usuario_bd = DocumentoUsuario.model_validate(registro_mongo)
    print("\nSimulación Base de Datos: Objeto validado con éxito desde instancia nativa.")
    print(f" Tipo interno del ID: {type(usuario_bd.id)}")
    # Al serializar para responder al cliente HTTP, se transforma automáticamente a string
    print(f" Salida JSON para el cliente: {usuario_bd.model_dump_json(include={'id'})}")
except ValidationError as e:
    print(e.json())

```

### Integración con la generación automática de esquemas JSON

Como se observa en el método de clase `__get_pydantic_json_schema__`, Pydantic V2 permite separar por completo la lógica de validación en tiempo de ejecución de la lógica de documentación. Al interactuar con bases de datos, los tipos internos pueden ser complejos o binarios, pero la documentación generada (por ejemplo, para Swagger UI en FastAPI) debe seguir mostrando tipos limpios y estandarizados. Implementar este método asegura que las herramientas de generación automática de OpenAPI entiendan con precisión el formato de intercambio que requiere la aplicación.

## Resumen del capítulo

En este capítulo hemos explorado los mecanismos avanzados que ofrece Pydantic V2 para extender el sistema de tipado más allá de las fronteras de los tipos primitivos de Python.

Comenzamos analizando el módulo **`Annotated`**, el cual permite descentralizar la lógica de validación moviendo las restricciones directamente a las declaraciones de tipo, facilitando la reutilización del código y limpiando la estructura visual de los modelos. Avanzamos hacia la creación de **Clases de tipo a medida**, comprendiendo el protocolo técnico que permite convertir cualquier clase de negocio en un objeto directamente validable por Pydantic mediante la inyección de esquemas duales de serialización y deserialización.

Posteriormente, nos sumergimos en las profundidades del motor con el método **`__get_pydantic_core_schema__`**, donde aprendimos a construir árboles de validación utilizando las primitivas de bajo nivel de `pydantic_core` para maximizar el rendimiento computacional interactuando directamente con la capa de Rust. Finalmente, aplicamos estos conceptos al diseño de **Tipos para bases de datos**, resolviendo la problemática común de la gestión de tipos especiales como los `ObjectId` de MongoDB o estructuras complejas de ORMs, garantizando una comunicación fluida y transparente entre el almacenamiento de persistencia, el dominio de la aplicación y el cliente final de la API.
