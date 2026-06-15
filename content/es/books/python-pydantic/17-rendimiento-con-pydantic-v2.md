Este capítulo analiza el salto evolutivo de Pydantic hacia la alta velocidad mediante su motor nativo en Rust, `pydantic-core`. A lo largo de las secciones, exploraremos los cimientos de esta arquitectura binaria, los mecanismos de comunicación con Python mediante PyO3 y la diferencia entre el procesamiento Laxo y Estricto de datos. Además, aprenderás a auditar y optimizar tus modelos utilizando herramientas avanzadas de perfilado como `VizTracer` y `py-spy`, concluyendo con una guía práctica y sistemática de migración para transformar tus proyectos de la V1 a la V2 de forma segura y eficiente.

## 17.1. Arquitectura en Rust

La transformación más radical de Pydantic en su transición de la versión 1 a la versión 2 fue la reescritura completa de su motor de ejecución. Mientras que la versión 1 realizaba todo el análisis, validación y serialización mediante lógica pura de Python, la versión 2 delega estas tareas críticas a una biblioteca nativa escrita en Rust denominada `pydantic-core`.

Python es un lenguaje interpretado con una sobrecarga significativa en la gestión de memoria, la evaluación de tipos en tiempo de ejecución y la ejecución de bucles. Al procesar millones de registros o estructuras de datos anidadas complejas, este comportamiento penaliza el rendimiento de las aplicaciones. Rust, al ser un lenguaje compilado de sistemas sin recolector de basura (garbage collector) y enfocado en la seguridad de memoria, permite procesar estructuras de datos binarias a velocidades cercanas al límite del hardware.

### La Separación de Responsabilidades: Python vs. Rust

En la arquitectura de Pydantic V2, existe una clara división del trabajo entre la capa orientada al desarrollador (Python) y la capa de cómputo de alto rendimiento (Rust):

```text
+-------------------------------------------------------------+
|                     CAPA DE PYTHON                          |
|                                                             |
|  - Definición de Modelos (BaseModel, Field)                 |
|  - Inferencia de Tipos y Type Hints (PEP 484)               |
|  - Metaprogramación (Metaclases) y Configuración            |
+-------------------------------------------------------------+
                              |
                              | Genera un Grafo de Esquemas
                              v
+-------------------------------------------------------------+
|                 CAPA DE RUST (pydantic-core)                |
|                                                             |
|  - Compilación del Grafo en Validadores Nativos             |
|  - Bucles de Validación en Código Máquina                   |
|  - Parsing Directo de JSON a Estructuras de Rust / Python   |
|  - Serialización de Alta Velocidad                          |
+-------------------------------------------------------------+

```

1. **Capa de Python (Frontend):** Actúa como la interfaz de usuario para el desarrollador. Se encarga de leer los *type hints*, procesar la metaprogramación de las clases al heredar de `BaseModel`, evaluar las configuraciones del modelo (`ConfigDict`) y estructurar los validadores personalizados (`@field_validator`).
2. **Capa de Rust (Backend / `pydantic-core`):** Una vez que la capa de Python ha analizado la estructura conceptual del modelo, traduce esta definición en un **Esquema de Núcleo** (*Core Schema*). Este esquema se transfiere a Rust, que compila una estructura de validadores e iteradores nativos optimizados en memoria.

### El Esquema de Núcleo (Core Schema)

El puente de comunicación entre Python y Rust es un diccionario estándar de Python que sigue una especificación estricta conocida como `CoreSchema`. El submódulo `pydantic_core.core_schema` expone las funciones factoría necesarias para construir estas definiciones.

Cuando defines un modelo en Python, Pydantic genera internamente un esquema como este:

```python
from pydantic_core import core_schema

# Representación conceptual de lo que Pydantic construye automáticamente
schema = core_schema.main_schema(
    typed_dict_schema=core_schema.typed_dict_schema(
        {
            "id": core_schema.typed_dict_field(core_schema.int_schema()),
            "username": core_schema.typed_dict_field(core_schema.str_schema()),
            "email": core_schema.typed_dict_field(core_schema.str_schema()),
        }
    )
)

```

Este diccionario describe un árbol de tipos. Rust recibe esta estructura a través de la API C de Python (`PyO3`) y construye un árbol equivalente de validadores en código compilado. A partir de ese momento, cualquier llamada a `model_validate()` o `model_validate_json()` esquiva los bucles de Python y ejecuta código Rust puro.

### El Grafo de Validadores en Rust

A nivel interno de Rust, `pydantic-core` organiza los validadores utilizando un patrón de diseño estructural basado en grafos. Cada tipo de dato (un entero, una cadena, una lista o un submodelo) se compila como un nodo que implementa el *trait* (interfaz) `Validator`.

Un *trait* en Rust define un comportamiento común. Para `pydantic-core`, la definición simplificada de este componente se asemeja a:

```rust
pub trait Validator: Send + Sync {
    fn validate<'py>(
        &self,
        py: Python<'py>,
        input: &'py pursues Input,
        extra: &Extra,
    ) -> ValResult<'py, PyObject>;
    
    fn validate_assignment<'py>(
        &self,
        py: Python<'py>,
        obj: &'py PyAny,
        field_name: &str,
        input: &'py pursues Input,
    ) -> ValResult<'py, PyObject>;
}

```

Cuando un modelo contiene campos anidados, el validador raíz delega el control secuencialmente a los validadores hijos directamente en Rust:

```text
[Validador de Modelo Root]
         |
         +--> [Validador de Entero (id)]
         |
         +--> [Validador de Cadena (username)]
         |
         +--> [Validador de Lista (tags)]
                       |
                       +--> [Validador de Cadena (elemento)]

```

Esta jerarquía en Rust elimina por completo la necesidad de realizar llamadas recursivas de funciones dentro del entorno de ejecución de Python, reduciendo drásticamente el espacio en la pila de llamadas (*stack*) y eliminando la degradación por cambio de contexto.

### Integración Binaria con PyO3

Para comunicar Rust y Python sin penalización de rendimiento, `pydantic-core` utiliza **PyO3**, una arquitectura de bindings de Rust para la API de C de Python. PyO3 permite:

* **Manipulación Directa de Punteros de Python (`PyObject`):** Rust puede inspeccionar objetos de Python, verificar si son instancias de ciertos tipos y extraer sus valores binarios nativos (por ejemplo, convertir un `PyLong` de Python a un `i64` de Rust) en nanosegundos.
* **Cero Copia en Operaciones de Lectura:** Cuando se pasa un diccionario de Python a Pydantic, Rust accede a las posiciones de memoria del diccionario original a través de punteros estables de la API de C, evitando duplicar los datos en el espacio de memoria de Rust de forma innecesaria.
* **Gestión Segura del GIL (Global Interpreter Lock):** Aunque Rust soporta concurrencia real y paralela en hilos nativos, al interactuar con objetos de Python debe respetar el GIL. `pydantic-core` minimiza el tiempo de retención del GIL liberándolo en tareas puras como el parsing inicial de texto JSON crudo.

### Procesamiento Directo de JSON

En Pydantic V1, el procesamiento de datos JSON requería dos pasos costosos:

1. Utilizar el módulo nativo `json` de Python o una librería externa (como `ujson` o `orjson`) para parsear la cadena de texto JSON y convertirla en diccionarios y listas de Python.
2. Pasar esos diccionarios y listas a través del motor de validación de Pydantic, creando nuevos objetos intermedios.

Pydantic V2 introduce un optimizador clave: **el método `model_validate_json()`**. Este método transfiere la cadena de texto cruda (o bytes) directamente a Rust.

```python
from pydantic import BaseModel

class Usuario(BaseModel):
    id: int
    username: str

# Flujo de Máximo Rendimiento: El texto va directo a Rust
usuario_instancia = Usuario.model_validate_json('{"id": 42, "username": "rust_fan"}')

```

Dentro de Rust, `pydantic-core` utiliza un parser JSON altamente optimizado basado en técnicas de vectorización. En lugar de instanciar diccionarios intermedios de Python, el parser de Rust analiza sintácticamente el JSON sobre la marcha y mapea las claves y valores directamente contra el grafo de validadores. Los objetos de Python solo se crean en memoria una vez que se ha comprobado que los datos son 100% válidos, disminuyendo la presión sobre el recolector de basura de Python y multiplicando la velocidad de procesamiento hasta por un factor de 10x o 20x en escenarios de APIs de alta carga.

## 17.2. Modo estricto vs laxo

El motor en Rust de Pydantic V2 introduce una de las características más potentes y solicitadas para el control de flujo de datos: la separación explícita entre el **Modo Laxo** (*Lax Mode*) y el **Modo Estricto** (*Strict Mode*). Esta distinción determina cómo reacciona la biblioteca cuando los tipos de los datos de entrada no coinciden exactamente con las anotaciones de tipo del modelo, pero pueden convertirse de forma lógica.

Por defecto, Pydantic opera en modo laxo para mantener la flexibilidad característica de Python, pero ofrece la posibilidad de activar el modo estricto a nivel global, por modelo, o incluso por operación individual.

### Modo Laxo (Lax Mode): Coerción Inteligente de Tipos

El modo laxo es el comportamiento estándar de Pydantic. En este modo, el motor de validación en Rust intenta realizar una **coerción de tipos** (*type coercion*) siempre que exista una conversión segura y lógica. El objetivo es facilitar la ingesta de datos provenientes de fuentes donde los tipos suelen perderse o transformarse, como formularios web, argumentos de línea de comandos o archivos de configuración.

Por ejemplo, si un campo está definido como `int`, el modo laxo aceptará una cadena de texto como `"42"` o un número de punto flotante como `42.0`, transformándolos automáticamente en el entero `42`.

A continuación se detalla una tabla con las coerciones más comunes que realiza el motor de Rust en modo laxo:

| Tipo Destino | Tipo de Entrada Aceptado | Resultado de la Coerción |
| --- | --- | --- |
| `int` | `str` (que contenga solo dígitos) \ `float` (con parte decimal cero) \ `bool` | `"100"` $\rightarrow$ `100` \ `50.0` $\rightarrow$ `50` \ `True` $\rightarrow$ `1`, `False` $\rightarrow$ `0` |
| `float` | `int` \ `str` (numérica válida) | `42` $\rightarrow$ `42.0` \ `"3.14"` $\rightarrow$ `3.14` |
| `bool` | `int` \ `str` (valores específicos) | `1` $\rightarrow$ `True`, `0` $\rightarrow$ `False` \ `"true"`, `"on"`, `"yes"` $\rightarrow$ `True` \ `"false"`, `"off"`, `"no"` $\rightarrow$ `False` |
| `str` | `int`, `float`, `decimal` | `123` $\rightarrow$ `"123"` \ `12.5` $\rightarrow$ `"12.5"` |
| `datetime` | `str` (formato ISO 8601) \ `int` / `float` (Timestamp) | `"2026-05-21"` $\rightarrow$ `datetime(...)` \ `1716250000` $\rightarrow$ `datetime(...)` |

### Modo Estricto (Strict Mode): Validación sin Concesiones

El modo estricto desactiva por completo la coerción de tipos. Bajo esta modalidad, Pydantic exige que el tipo del dato de entrada coincida **exactamente** con el tipo anotado en el modelo. Si un dato no corresponde exactamente, el motor de Rust detiene el análisis inmediatamente y genera un `ValidationError`.

Este modo es ideal para arquitecturas donde la integridad de los datos es crítica (por ejemplo, sistemas financieros o software científico) o en APIs internas donde los clientes tienen la obligación de enviar los tipos de datos correctos.

### Niveles de Configuración

Pydantic permite activar el modo estricto con diferentes niveles de granularidad, adaptándose a las necesidades específicas de cada sección del código.

#### 1. A nivel de Modelo Completo

Puedes usar la clase `ConfigDict` introducida en la versión 2 para que todas las instancias de un modelo específico apliquen la validación estricta de manera uniforme.

```python
from pydantic import BaseModel, ConfigDict, ValidationError

class Contrato(BaseModel):
    # Activación del modo estricto para todo el modelo
    model_config = ConfigDict(strict=True)
    
    id: int
    activo: bool

# Este bloque fallará en modo estricto
try:
    contrato = Contrato(id="101", activo="true")
except ValidationError as e:
    # Ambos campos fallan porque no coinciden con int y bool exactamente
    print(e)

```

#### 2. A nivel de Campo Individual

Si deseas mantener un modelo flexible pero necesitas que un campo crítico sea completamente estricto, puedes configurarlo directamente mediante la función `Field()`.

```python
from pydantic import BaseModel, Field, ValidationError

class Transaccion(BaseModel):
    referencia: str
    # Solo este campo se validará de forma estricta
    monto_centavos: int = Field(strict=True)

# Esto es válido porque 'referencia' permite coerción en modo laxo
# pero 'monto_centavos' lanzará error si se envía como float o string
try:
    t = Transaccion(referencia=12345, monto_centavos=500.0)
except ValidationError as e:
    print(e)  # Fallo en 'monto_centavos'

```

#### 3. En la Ejecución de la Validación

También puedes forzar el comportamiento estricto de forma dinámica en el momento preciso en que ejecutas la validación, pasando el argumento `strict` a los métodos del modelo. Esto permite reutilizar el mismo modelo en contextos laxos y estrictos.

```python
from pydantic import BaseModel

class Sensor(BaseModel):
    lectura: float

# Datos de entrada con un tipo que requiere coerción (int -> float)
datos_crudos = {"lectura": 24}

# Validación en Modo Laxo (Por defecto): Funciona correctamente
sensor_laxo = Sensor.model_validate(datos_crudos)
print(sensor_laxo.lectura)  # Salida: 24.0

# Validación en Modo Estricto en caliente: Lanza ValidationError
try:
    sensor_estricto = Sensor.model_validate(datos_crudos, strict=True)
except ValidationError as e:
    print("Fallo en modo estricto dinámico")

```

### Impacto en el Rendimiento del Motor Rust

Desde la perspectiva arquitectónica de `pydantic-core`, el modo estricto reduce la cantidad de bifurcaciones lógicas dentro de los nodos del grafo de validadores en Rust.

```text
[Entrada: "42"] ──> [Nodo Validador int en Rust]
                          │
                          ├──> ¿Modo Estricto? ──> SÍ ──> [Lanza ValidationError]
                          │
                          └──> ¿Modo Laxo? ─────> NO ──> [Intenta parsear string] ──> Éxito: 42

```

Al activar el modo estricto, Rust simplemente realiza una comprobación de tipo nativo mediante punteros de `PyO3`. Si el tipo coincide, el valor se procesa; si no, aborta inmediatamente. Al evitar los bloques de código dedicados a intentar convertir cadenas, booleanos o números flotantes a otros formatos, el modo estricto puede llegar a ser ligeramente más rápido que el modo laxo, optimizando aún más el tiempo de ejecución en entornos de alta exigencia.

## 17.3. Perfilado de validaciones

Con el motor de ejecución trasladado a la capa binaria de Rust, las herramientas tradicionales de perfilado de Python (como los módulos estándar `cProfile` o `profile`) se vuelven ciegas ante lo que sucede dentro de `pydantic-core`. Cuando ejecutamos un perfilador tradicional de Python sobre un proceso de validación complejo, este solo reporta una única llamada opaca a métodos como `model_validate()` o `model_validate_json()`, ocultando el tiempo invertido en cada nodo del grafo de validación.

Para solucionar este aislamiento y permitir una optimización precisa de los modelos en producción, Pydantic V2 introduce y expone mecanismos específicos para interceptar, inspeccionar y auditar las métricas internas de rendimiento de sus validadores en Rust.

### Comprensión del Grafo: `model_fields` y `__pydantic_validator__`

Antes de medir los tiempos de ejecución, es fundamental inspeccionar la estructura de los validadores que Rust ha compilado para un modelo. Cada clase que hereda de `BaseModel` almacena en su atributo `__pydantic_validator__` una instancia de la clase nativa `SchemaValidator` escrita en Rust.

A través de este objeto, podemos extraer la representación exacta del grafo de validación que se ejecuta a nivel binario:

```python
from pydantic import BaseModel

class DetallePedido(BaseModel):
    producto_id: int
    cantidad: int

class Pedido(BaseModel):
    pedido_id: str
    detalles: list[DetallePedido]

# Acceso a la representación del validador compilado en Rust
print(Pedido.__pydantic_validator__)

```

El método ejecutor de Rust procesa de forma iterativa y plana los elementos basándose en esta estructura, lo que nos permite mapear los cuellos de botella directamente a los campos correspondientes de Python.

### Perfilado con Métodos Nativos de Pydantic

Pydantic no incluye un temporizador de interfaz gráfica de forma interna, pero sus validadores exponen ganchos (*hooks*) de bajo nivel a los que se puede acceder en entornos de pruebas o mediante envoltorios (*wrappers*).

Para perfilar de manera programática dónde se ralentiza una validación (por ejemplo, si el retraso ocurre en una coerción de tipo de datos o en un validador personalizado), podemos construir un decorador de perfilado estructural aprovechando el método `model_fields` del modelo combinado con el paso de banderas de control:

```python
import time
from pydantic import BaseModel, ValidationError

class PerfiladorValidacion:
    def __init__(self, modelo: type[BaseModel]):
        self.modelo = modelo

    def medir_rendimiento(self, datos: dict, repeticiones: int = 10_000) -> float:
        """Mide el tiempo total de ejecución en Rust para un lote de validaciones."""
        inicio = time.perf_counter()
        for _ in range(repeticiones):
            try:
                self.modelo.model_validate(datos)
            except ValidationError:
                pass
        fin = time.perf_counter()
        return (fin - inicio) / repeticiones

# Definición de un modelo para pruebas de estrés
class SensorReport(BaseModel):
    sensor_id: int
    valores: list[float]

# Datos óptimos (coincidencia exacta de tipos)
datos_optimos = {"sensor_id": 101, "valores": [23.5, 24.1, 22.9, 25.0]}

# Datos subóptimos (requieren conversión de strings a floats en modo laxo)
datos_coercion = {"sensor_id": "101", "valores": ["23.5", "24.1", "22.9", "25.0"]}

perfilador = PerfiladorValidacion(SensorReport)

tiempo_optimo = perfilador.medir_rendimiento(datos_optimos)
tiempo_coercion = perfilador.medir_rendimiento(datos_coercion)

print(f"Tiempo medio (Óptimo):   {tiempo_optimo * 1e6:.2f} microsegundos")
print(f"Tiempo medio (Coerción): {tiempo_coercion * 1e6:.2f} microsegundos")

```

Este tipo de perfilado comparativo revela de inmediato el coste computacional exacto que supone para la capa de Rust tener que transformar cadenas de texto en números flotantes frente al procesamiento de tipos nativos limpios.

### Integración con Perfiladores a Nivel de Sistema (PySpy y VizTracer)

Cuando los modelos son altamente complejos (con múltiples niveles de anidamiento y cientos de campos), los scripts manuales de medición se quedan cortos. Para obtener una traza detallada del tiempo de CPU consumido dentro de las funciones de la extensión de C/Rust, es necesario recurrir a herramientas de perfilado que operen a nivel de pila binaria.

#### 1. VizTracer y VizPlugin-Pydantic

`VizTracer` es un perfilador de baja sobrecarga para Python que permite rastrear la ejecución de funciones de extensiones en C de manera detallada. Existe compatibilidad diseñada para registrar las transiciones entre la máquina virtual de Python y el entorno binario de `pydantic-core`.

Al ejecutar un script de Python bajo `VizTracer`, la herramienta genera un archivo JSON interactivo que puede abrirse en el navegador web para visualizar el árbol de llamadas. En la línea de comandos se ejecuta de la siguiente manera:

```bash
viztracer --log_extensions mi_script_pydantic.py

```

En el informe visual resultante, las funciones que pertenecen a `pydantic_core._pydantic_core` aparecen claramente identificadas, lo que permite confirmar de forma empírica si el cuello de botella se encuentra dentro del algoritmo de análisis de Rust o si está siendo causado por la ejecución de funciones de validación de negocio escritas en Python que son llamadas de vuelta por el motor (funciones decoradas con `@field_validator` o `@model_validator`).

#### 2. Py-Spy (Perfilado de Muestreo de Hilos de Rust)

`py-spy` es un perfilador de muestreo para programas en Python escrito también en Rust. Su principal ventaja es que puede leer la pila de llamadas de hilos nativos, lo que le permite desglosar qué funciones internas del código compilado de `pydantic-core` están consumiendo ciclos de CPU.

Para perfilar un proceso activo de Pydantic de alta carga y generar un gráfico de llamas (*Flame Graph*) que combine las pilas de llamadas de Python y Rust, se utiliza el siguiente comando en la terminal del sistema operativo:

```bash
py-spy record --native -o perfil_pydantic.svg -- python mi_script_pydantic.py

```

La bandera `--native` es el parámetro clave aquí: instruye a `py-spy` para que no se detenga en la frontera de la máquina virtual de Python, permitiéndole adentrarse en los símbolos compilados de la biblioteca compartida `.so` o `.pyd`.

### Diagnóstico de Cuellos de Botella Comunes

Al analizar los resultados del perfilado de modelos Pydantic, la pérdida de rendimiento suele concentrarse de forma sistemática en tres puntos específicos de la arquitectura:

1. **El coste de los Saltos de Frontera (Python $\rightarrow$ Rust $\rightarrow$ Python):** Cada vez que el motor de Rust encuentra un decorador `@field_validator`, se ve obligado a pausar su ejecución en código máquina, adquirir el control del entorno de ejecución de Python, invocar la función personalizada de Python y volver a capturar el resultado en Rust. Si un modelo procesa miles de registros y aplica validadores personalizados en bucles profundos, el perfilado mostrará un patrón "en sierra" que degrada la velocidad.
2. **Instanciación tardía de objetos pesados:** Si dentro de un validador personalizado se instancian expresiones regulares (`re.compile`) u objetos de conexión a bases de datos de manera local en lugar de reutilizarlos a nivel de módulo, el perfilador del sistema mostrará un consumo desproporcionado de tiempo en la asignación de memoria.
3. **Parsing de JSON duplicado:** El perfilado confirmará que llamar a `model_validate(json.loads(texto))` duplica el tiempo de procesamiento frente al uso directo de `model_validate_json(texto)`, ya que obliga al sistema a mapear la memoria dos veces.

## 17.4. Migración desde la V1

La introducción de `pydantic-core` y la reescritura del motor en Rust en Pydantic V2 supusieron cambios estructurales profundos. Aunque la API pública de la versión 2 mantiene una filosofía familiar, los métodos de validación, la gestión de configuraciones y el comportamiento de serialización se rediseñaron por completo para eliminar la sobrecarga de Python y permitir la optimización binaria.

Migrar código de la versión 1 a la versión 2 requiere sustituir los patrones heredados por los nuevos componentes nativos para evitar advertencias de depreciación (*DeprecationWarnings*) y asegurar el máximo aprovechamiento del motor de ejecución de Rust.

### Cambios Clave en la API de Modelos

La diferencia más visible al migrar un modelo se encuentra en los métodos utilizados para validar y exportar datos. En la versión 1, los nombres de los métodos poblaban el espacio de nombres del modelo de forma directa, lo que provocaba colisiones si un usuario definía un campo con un nombre como `json` o `schema`. En la versión 2, todos los métodos operativos se agrupan bajo el prefijo `model_`.

A continuación se presenta una tabla de equivalencias directas para la sustitución de métodos:

| Método en Pydantic V1 (Depreciado) | Equivalente en Pydantic V2 (Recomendado) |
| --- | --- |
| `Model.from_orm(obj)` | `Model.model_validate(obj, from_attributes=True)` |
| `Model.parse_obj(obj)` | `Model.model_validate(obj)` |
| `Model.parse_raw(texto)` | `Model.model_validate_json(texto)` |
| `Model.parse_file(ruta)` | Leer archivo manualmente + `Model.model_validate_json()` |
| `instancia.dict()` | `instancia.model_dump()` |
| `instancia.json()` | `instancia.model_dump_json()` |
| `instancia.schema()` | `instancia.model_json_schema()` |

### Rediseño de la Configuración del Modelo

En Pydantic V1, la configuración de un modelo se definía mediante una subclase interna llamada `Config`. En la versión 2, este patrón se descarta en favor de un diccionario con tipado estricto denominado `ConfigDict`. Esta transición agiliza la compilación del esquema conceptual que Python envía al motor de Rust.

```python
# ANTES: Patrón de Pydantic V1
from pydantic import BaseModel as BaseModelV1

class ModeloV1(BaseModelV1):
    nombre: str

    class Config:
        allow_population_by_field_name = True
        frozen = True

# AHORA: Patrón de Pydantic V2
from pydantic import BaseModel, ConfigDict

class ModeloV2(BaseModel):
    nombre: str

    # Configuración optimizada mediante ConfigDict
    model_config = ConfigDict(
        populate_by_name=True,
        frozen=True
    )

```

Además del cambio de sintaxis, muchos de los parámetros de configuración fueron renombrados para ganar claridad semántica:

* `allow_population_by_field_name` pasa a ser `populate_by_name`.
* `anystr_strip_whitespace` pasa a ser `str_strip_whitespace`.
* `validate_assignment` se mantiene igual, pero ahora se ejecuta directamente en las estructuras binarias de Rust a través del trait `Validator`.

### Evolución de los Validadores: De `root_validator` a `model_validator`

Los decoradores de validación sufrieron una reestructuración completa para ganar predictibilidad. Los antiguos decoradores `@validator` y `@root_validator` de la versión 1 realizaban una introspección compleja en tiempo de ejecución para adivinar cómo pasar los argumentos, lo que ralentizaba la inicialización del modelo.

En la versión 2, `@field_validator` reemplaza a `@validator`, y `@model_validator` reemplaza a `@root_validator`. Además, se introduce el concepto explícito de modo antes (`before`) y después (`after`), correlacionándose uno a uno con el flujo de procesamiento de nodos del motor de Rust.

```python
# ANTES: Validación de modelo completa en V1
from pydantic import root_validator

class RegistroV1(BaseModelV1):
    password: str
    confirmar_password: str

    @root_validator
    def verificar_claves(cls, values):
        pw = values.get("password")
        cpw = values.get("confirmar_password")
        if pw != cpw:
            raise ValueError("Las contraseñas no coinciden")
        return values

# AHORA: Validación de modelo completa en V2
from pydantic import BaseModel, model_validator

class RegistroV2(BaseModel):
    password: str
    confirmar_password: str

    # Se debe especificar explícitas veces el modo (por defecto 'after')
    @model_validator(mode="after")
    def verificar_claves(self):
        # En modo 'after', operamos directamente sobre 'self' (instancia limpia)
        if self.password != self.confirmar_password:
            raise ValueError("Las contraseñas no coinciden")
        return self

```

### Herramientas de Automatización: `pydantic-bump`

Para proyectos de gran envergadura donde la migración manual de cientos de modelos resulta inviable, el equipo de Pydantic desarrolló una herramienta de refactorización automática basada en AST (*Abstract Syntax Tree*) llamada `pydantic-bump`.

Esta herramienta analiza el código fuente de tu aplicación y reescribe de forma automática los métodos depreciados, las clases `Config` internas y la nomenclatura de los decoradores antiguos para adaptarlos a la sintaxis de la versión 2.

Para instalar y ejecutar el asistente de migración sobre un proyecto, se utiliza la interfaz de línea de comandos:

```bash
pip install pydantic-bump
pydantic-bump tu_directorio_de_codigo/

```

> **Aviso de seguridad:** Aunque `pydantic-bump` resuelve con éxito la mayor parte del trabajo repetitivo (como renombrar `.dict()` a `.model_dump()`), no puede inferir cambios de lógica complejos en validadores cruzados o comportamientos de coerción muy específicos del modo laxo. Es indispensable contar con una suite de pruebas automatizadas con buena cobertura para validar el comportamiento del sistema tras aplicar la herramienta.

## Resumen del capítulo

En este capítulo hemos explorado en profundidad el corazón tecnológico de Pydantic V2: su motor interno escrito en Rust (`pydantic-core`). Analizamos cómo la separación de responsabilidades entre la capa de interfaz de Python y el grafo de validadores nativos de Rust permite procesar datos a velocidades sin precedentes. Estudiamos las diferencias operativas e impactos en el rendimiento entre el Modo Laxo (que realiza coerción inteligente de tipos de datos) y el Modo Estricto (que restringe la entrada a coincidencias exactas). Asimismo, abordamos las metodologías y herramientas de sistema (como `VizTracer` y `py-spy`) necesarias para perfilar el rendimiento binario del motor. Finalmente, estructuramos una guía de migración con las equivalencias indispensables para trasladar aplicaciones construidas bajo los estándares de la versión 1 a la arquitectura optimizada de la versión 2.

## Conclusión: El Futuro del Modelado con Pydantic

Pydantic ha consolidado su posición como la piedra angular del desarrollo moderno en Python para la validación y serialización de datos. Gracias a su núcleo nativo en Rust, la brecha histórica entre la flexibilidad de un lenguaje dinámico y el rendimiento de un sistema de ejecución compilado se ha cerrado por completo.

Al dominar desde los fundamentos de `BaseModel` hasta el perfilado de bajo nivel y la arquitectura binaria, dispones de las herramientas necesarias para diseñar aplicaciones seguras, robustas y de alta velocidad. El ecosistema sigue evolucionando, pero los patrones de tipado estricto aprendidos en este libro te acompañarán en cualquier desafío de ingeniería de software.
