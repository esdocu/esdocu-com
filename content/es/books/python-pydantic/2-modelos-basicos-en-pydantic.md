Este capítulo aborda la estructura central de la biblioteca mediante el uso de `BaseModel`. Aprenderás a definir modelos robustos heredando de esta clase para activar el motor de validación y conversión automática de tipos. Exploraremos los mecanismos seguros de inicialización mediante argumentos clave y diccionarios, las vías eficientes de acceso y exportación de datos con `model_dump()`, y las implicaciones de la mutabilidad frente a la inmutabilidad de las instancias configuradas con `frozen=True`. Es la base práctica indispensable para estructurar cualquier flujo de datos en Pydantic.

## 2.1. Heredando de BaseModel

La piedra angular de cualquier desarrollo con Pydantic es la clase `BaseModel`. Todas las estructuras de datos que desees validar, tipar y estructurar en tus aplicaciones deben definirse como subclases de esta entidad. Al heredar de `BaseModel`, transformas una simple clase de Python cargada de anotaciones de tipo en un motor activo de validación y parsing (conversión de tipos).

A diferencia de las clases estándar de Python o los `dataclasses` nativos, `BaseModel` intercepta el proceso de instanciación para garantizar que los datos de entrada se ajusten con precisión a las reglas del modelo.

### Estructura fundamental de una subclase

Para comenzar, debes importar `BaseModel` desde el módulo principal de `pydantic`. Los atributos de la clase se definen utilizando la sintaxis de anotaciones de tipo estándar de Python (PEP 484).

```python
from pydantic import BaseModel

class Usuario(BaseModel):
    id: int
    nombre: str
    es_activo: bool

```

El flujo de herencia y el comportamiento del modelo se estructuran de la siguiente manera:

```text
+--------------------------------------------------+
|               pydantic.BaseModel                 |
|  (Proporciona métodos de validación, parsing,    |
|   serialización y gestión de metadatos)          |
+--------------------------------------------------+
                         ^
                         |  Hereda de
                         |
+--------------------------------------------------+
|                    Usuario                       |
|  - id: int                                       |
|  - nombre: str                                   |
|  - es_activo: bool                               |
+--------------------------------------------------+

```

### ¿Qué aporta la herencia de BaseModel?

Al heredar de `BaseModel`, tu clase adquiere capacidades automáticas que reducen drásticamente el código repetitivo (*boilerplate*):

* **Constructor automático:** No necesitas escribir un método `__init__`. La clase acepta argumentos nombrados (*keyword arguments*) correspondientes a los atributos definidos.
* **Garantía de Tipo mediante Parsing:** Pydantic no se limita a verificar pasivamente si un tipo es correcto; intenta convertir la entrada al tipo requerido si es seguro hacerlo (por ejemplo, pasará una cadena `"123"` al entero `123`).
* **Representación limpia:** Las instancias implementan automáticamente un método `__repr__` legible, ideal para depuración (por ejemplo: `Usuario(id=1, nombre='Ana', es_activo=True)`).
* **Métodos del ciclo de vida:** Proporciona la infraestructura interna necesaria para exportar, limpiar y analizar el estado del modelo, funciones que se detallarán en las secciones de inicialización y acceso a atributos.

### El rol de las anotaciones de tipo

Es mandatorio declarar el tipo de cada atributo. Si defines un atributo sin una anotación de tipo válida, Pydantic lo ignorará como campo del modelo, tratándolo simplemente como un atributo de clase estático de Python.

```python
class Producto(BaseModel):
    codigo: int         # Campo válido del modelo
    nombre: str         # Campo válido del modelo
    clasificacion = 10  # ¡Incorrecto! Pydantic lo ignora en la validación

```

> **Nota de diseño:** `BaseModel` está pensado específicamente para modelar estructuras de datos operacionales, mensajes de APIs, configuraciones o payloads. No debe confundirse con unORM (mapeador objeto-relacional) tradicional, aunque sirve perfectamente como capa de transferencia de datos frente a ellos.
>
## 2.2. Inicialización de modelos

Una vez definida una clase que hereda de `BaseModel`, el siguiente paso es crear instancias de ella. El proceso de inicialización en Pydantic difiere sustancialmente del de las clases tradicionales de Python, ya que la invocación del constructor activa de inmediato el motor de validación y conversión de datos (*parsing*).

Pydantic ofrece múltiples mecanismos para instanciar un modelo, adaptándose tanto a la entrada de datos estructurados por código como a la recepción de payloads dinámicos (como diccionarios provenientes de solicitudes HTTP o archivos JSON).

### 1. Inicialización estándar mediante argumentos de palabra clave

El método principal para crear una instancia es pasar los datos como argumentos de palabra clave (*keyword arguments* o `kwargs`). Pydantic prohíbe explícitamente la inicialización mediante argumentos posicionales para evitar ambigüedades en estructuras con decenas de campos.

```python
from pydantic import BaseModel

class Empleado(BaseModel):
    id: int
    area: str
    sueldo: float

# Inicialización correcta utilizando kwargs
empleado_uno = Empleado(id=101, area="Sistemas", sueldo=2500.50)

# Esto lanzará un error TypeError (no valida argumentos posicionales)
# empleado_error = Empleado(101, "Sistemas", 2500.50)

```

### 2. Inicialización a partir de diccionarios (Desempaquetado)

Cuando los datos provienen de fuentes externas, lo común es que se encuentren estructurados en un diccionario. El modismo estándar de Python para resolver esto es el desempaquetado de diccionarios mediante el operador de doble asterisco (``).

```python
datos_api = {
    "id": 102,
    "area": "Recursos Humanos",
    "sueldo": "3100.00"  # Observa que es un string
}

# Desempaquetado de componentes en el constructor
empleado_dos = Empleado(**datos_api)
print(empleado_dos.sueldo)  # Imprime: 3100.0 (convertido exitosamente a float)

```

### 3. El método alternativo: `model_validate`

A partir de Pydantic V2, el framework introduce métodos de clase explícitos optimizados para la carga de datos externos. El más importante de ellos es `model_validate()`, el cual recibe directamente un diccionario u objeto compatible.

Este método es semánticamente más claro cuando se trabaja con payloads dinámicos, ya que evita la sobrecarga sintáctica del desempaquetado (``) y permite una ejecución interna ligeramente más directa en el núcleo de Rust (`pydantic-core`).

```python
datos_externos = {"id": 103, "area": "Finanzas", "sueldo": 4200.00}

# Instanciación limpia y explícita
empleado_tres = Empleado.model_validate(datos_externos)

```

El flujo interno que ocurre durante cualquiera de estos tres métodos de inicialización se resume en el siguiente diagrama:

```text
[ Datos de entrada: dict o kwargs ]
               |
               v
    +----------------------+
    | Ejecución del Filtro | <--- Verifica la presencia de campos obligatorios
    +----------------------+
               |
               v
    +----------------------+
    | Coerción de Tipos    | <--- Convierte ("3100.00" -> 3100.0) si es seguro
    +----------------------+
               |
      +--------+--------+
      |                 |
      v                 v
[¿Datos Válidos?]    [¿Datos Inválidos?]
      |                 |
      v                 v
(Crea Instancia)     (Lanza ValidationError)

```

### Comportamiento ante datos faltantes o inesperados

Durante la inicialización, Pydantic evalúa estrictamente la correspondencia de los campos:

* **Campos obligatorios ausentes:** Si un atributo no tiene un valor predeterminado asignado en la definición del modelo y se omite en la inicialización, Pydantic abortará la creación del objeto inmediatamente lanzando una excepción `ValidationError`.
* **Campos extra:** Por defecto, si se pasan argumentos adicionales que no fueron declarados en el modelo, Pydantic los ignorará silenciosamente para proteger la integridad de la instancia, almacenando únicamente los campos conocidos (este comportamiento se puede personalizar mediante la configuración global del modelo).

```python
# Intento de inicialización sin el campo obligatorio 'area' e incluyendo un campo extra 'edad'
# Esto lanzará un ValidationError debido a la ausencia de 'area'
try:
    empleado_incompleto = Empleado(id=104, sueldo=1800.00, edad=30)
except Exception as e:
    print(e)

```

## 2.3. Acceso a los atributos

Una vez que un modelo de Pydantic ha sido inicializado con éxito, sus datos quedan validados y estructurados en memoria. El acceso a estos atributos se realiza de manera nativa e intuitiva, pero Pydantic añade métodos especializados para inspeccionar y extraer la información en bloque.

A diferencia de los diccionarios, donde el acceso es mediante claves de texto, las instancias de `BaseModel` se comportan como objetos puros de Python con tipado estático reconocible por los entornos de desarrollo (IDEs).

### 1. Acceso mediante la notación de punto (Dot Notation)

La forma más directa y eficiente de acceder a los datos de una instancia es mediante la tradicional sintaxis de punto. Al usar este mecanismo, obtienes el beneficio completo del autocompletado y el análisis estático de tu editor de código.

```python
from pydantic import BaseModel

class Empresa(BaseModel):
    id: int
    razon_social: str
    clasificacion_fiscal: str

empresa = Empresa(id=501, razon_social="Tech Solutions S.A.", clasificacion_fiscal="Responsable Inscripto")

# Acceso directo a los atributos
print(empresa.id)            # Imprime: 501
print(empresa.razon_social)  # Imprime: Tech Solutions S.A.

```

### 2. Extracción completa en forma de Diccionario: `model_dump()`

En muchas ocasiones, especialmente al interactuar con bases de datos o frameworks web (como FastAPI), necesitarás transformar el modelo validado de vuelta a un tipo primitivo de Python. Para esto se utiliza el método `model_dump()`.

Este método analiza la instancia y genera un diccionario estándar de Python (`dict`), manteniendo los tipos de datos ya procesados.

```python
# Convierte la instancia en un diccionario tradicional
datos_dict = empresa.model_dump()

print(datos_dict)  
# Resultado: {'id': 501, 'razon_social': 'Tech Solutions S.A.', 'clasificacion_fiscal': 'Responsable Inscripto'}
print(datos_dict["razon_social"])  # Acceso clásico por clave

```

### 3. Recuperación en formato JSON string: `model_dump_json()`

Si tu objetivo es transmitir la información a través de una red o guardarla en un archivo, requerirás una cadena de texto en formato JSON. El método `model_dump_json()` serializa de forma optimizada el modelo directamente a un `str`.

```python
# Genera una cadena JSON válida
json_string = empresa.model_dump_json()

print(json_string)  
# Resultado: {"id":501,"razon_social":"Tech Solutions S.A.","clasificacion_fiscal":"Responsable Inscripto"}

```

### Comparativa de métodos de acceso y extracción

Para entender cuándo utilizar cada mecanismo, es útil observar cómo interactúa cada uno con la instancia del modelo:

```text
                  +-----------------------------------+
                  |      Instancia de Empresa         |
                  +-----------------------------------+
                     /              |              \
                    /               |               \
                   /                |                \
  [ Notación de punto ]       [ model_dump() ]     [ model_dump_json() ]
         |                          |                         |
         v                          v                         v
Atributo individual        Diccionario Python        Cadena de Texto JSON
  (empresa.id -> 501)       (tipo 'dict')             (tipo 'str')

```

### El diccionario interno: `__dict__` y `model_fields`

Si necesitas inspeccionar los datos directamente sin pasar por las funciones de serialización, puedes acceder al diccionario interno del objeto mediante la propiedad mágica `__dict__`. No obstante, para desarrollo general se prefiere el uso de `model_dump()` ya que este último garantiza el procesamiento correcto de submodelos anidados.

Por otro lado, si lo que necesitas inspeccionar no son los valores, sino los **metadatos** y las definiciones de los campos (los tipos declarados, restricciones, etc.), puedes utilizar la propiedad de clase `model_fields`.

```python
# Inspección de los campos definidos en el modelo (Metadatos)
print(Empresa.model_fields.keys())
# Resultado: dict_keys(['id', 'razon_social', 'clasificacion_fiscal'])

```

## 2.4. Mutabilidad de instancias

Por defecto, las instancias de un modelo que hereda de `BaseModel` son **mutables**. Esto significa que, una vez inicializado el modelo, es perfectamente posible modificar los valores de sus atributos utilizando la notación de punto, tal como se haría con cualquier objeto estándar de Python.

Sin embargo, esta mutabilidad por defecto introduce un comportamiento crítico que todo desarrollador debe conocer: **Pydantic no vuelve a ejecutar las validaciones automáticamente cuando cambias un atributo de manera directa**.

### Modificación directa y el riesgo de eludir la validación

Cuando alteras el valor de un atributo en una instancia existente, Python realiza una asignación directa en memoria. El motor de validación de Pydantic no se dispara en ese instante, lo que puede dar lugar a que el modelo quede en un estado inconsistente con respecto a los tipos de datos declarados originalmente.

```python
from pydantic import BaseModel

class Sensor(BaseModel):
    id: int
    lectura: float

# Inicialización correcta (aquí sí opera la validación)
sensor_sala = Sensor(id=1, lectura=24.5)

# Modificación directa: Pydantic lo permite por defecto
sensor_sala.lectura = 26.8  

# ¡Peligro! Modificación con un tipo incorrecto
sensor_sala.lectura = "Crítico"  # No lanza ValidationError en tiempo de ejecución
print(sensor_sala.lectura)       # Imprime: "Crítico" (Se ha violado el tipo float)

```

### El remedio seguro: Creación por copia modificada con `model_copy`

Si tu flujo de trabajo requiere alterar datos pero necesitas garantizar la integridad del modelo y asegurar que las validaciones sigan vigentes, la práctica recomendada es tratar las instancias como inmutables y generar copias modificadas.

El método `model_copy()` te permite duplicar una instancia pasando el argumento `update`, el cual recibe un diccionario con los nuevos valores. Al procesar esta actualización, los nuevos datos son asimilados de forma controlada.

```python
sensor_base = Sensor(id=2, lectura=19.2)

# Crear una copia alterando únicamente el campo 'lectura'
sensor_actualizado = sensor_base.model_copy(update={"lectura": 21.0})

print(sensor_base.lectura)         # Mantiene su valor original: 19.2
print(sensor_actualizado.lectura)  # Contiene el nuevo valor: 21.0

```

### Forzar la inmutabilidad estricta (`frozen`)

En aplicaciones robustas (como arquitecturas de Domain-Driven Design o configuraciones globales), a menudo es deseable que los modelos sean completamente inmutables (objetos de solo lectura). Pydantic permite congelar un modelo configurando el parámetro `frozen=True` mediante el diccionario de configuración del modelo (`model_config`).

Al activar este modo, cualquier intento de modificar un atributo directamente después de la inicialización lanzará inmediatamente un error de tipo `ValidationError` (específicamente un error de tipo `frozen_instance`).

```python
from pydantic import ConfigDict

class ConfiguracionSistema(BaseModel):
    # Declaración de inmutabilidad para este modelo
    model_config = ConfigDict(frozen=True)
    
    entorno: str
    puerto: int

config = ConfiguracionSistema(entorno="produccion", puerto=8080)

# El siguiente intento de asignación fallará de inmediato:
# config.puerto = 9090  --> Lanza ValidationError: Instance is frozen

```

### Mutabilidad vs Inmutabilidad en Pydantic

El siguiente esquema compara el comportamiento del modelo según su configuración de mutabilidad ante un intento de cambio:

```text
                  ¿Se intenta modificar un atributo?
                                  |
                +-----------------+-----------------+
                |                                   |
         [ Modelo Mutable ]                [ Modelo Frozen ]
         (Config por defecto)               (frozen=True)
                |                                   |
                v                                   v
    Modificación permitida                ¡Operación Bloqueada!
    (Ojo: No se re-valida)               Lanza ValidationError

```

## Resumen del capítulo

En este **Capítulo 2: Modelos Básicos en Pydantic**, hemos explorado los fundamentos operativos para trabajar con la biblioteca a nivel estructural:

* **Heredando de BaseModel:** Aprendimos que la clase `BaseModel` es el núcleo que transforma clases ordinarias de Python en estructuras con capacidades automatizadas de parsing y validación mediante anotaciones de tipo.
* **Inicialización de modelos:** Estudiamos cómo instanciar modelos de manera segura mediante argumentos de palabra clave (*kwargs*), el desempaquetado de diccionarios y el uso explícito del método de clase `model_validate()`.
* **Acceso a los atributos:** Revisamos el uso de la notación de punto para el desarrollo del día a día, y los métodos esenciales `model_dump()` y `model_dump_json()` para exportar y serializar la información validada.
* **Mutabilidad de instancias:** Analizamos los riesgos de modificar directamente los atributos de un modelo mutable en memoria y cómo implementar la inmutabilidad absoluta a través de la configuración `frozen=True`.
