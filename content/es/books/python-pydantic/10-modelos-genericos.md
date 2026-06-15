Este capítulo aborda la creación de estructuras reutilizables mediante el modelado genérico en Pydantic. Aprenderás a unificar la lógica de tus datos (como respuestas de API o paginaciones) sin duplicar código. Exploraremos la evolución del tipado en Python —desde las variables de tipo tradicionales hasta la sintaxis moderna de Python 3.12+— y cómo BaseModel intercepta estas abstracciones para generar esquemas dinámicos en tiempo de ejecución. También estudiaremos patrones avanzados de herencia genérica, la combinación de múltiples variables de tipo y las limitaciones técnicas esenciales que debes conocer para optimizar el rendimiento y el consumo de memoria en producción.

## 10.1. Tipos genéricos de Python

Para comprender cómo Pydantic implementa el modelado genérico, primero es indispensable dominar cómo el propio lenguaje Python gestiona la abstracción de tipos. Los tipos genéricos permiten parametrizar clases y funciones, lo que significa que una misma estructura puede adaptarse para trabajar con diferentes tipos de datos sin necesidad de duplicar el código.

Antes de la llegada de las herramientas de tipado estático, Python dependía exclusivamente del *duck typing* (tipado dinámico). Sin embargo, a partir de Python 3.5, el módulo nativo `typing` introdujo la capacidad de escribir código con anotaciones de tipo avanzadas, abriendo la puerta a los componentes genéricos a través de herramientas clave como `TypeVar` y `Generic`.

### Componentes fundamentales del tipado genérico

El ecosistema de tipado en Python se apoya en tres conceptos principales cuando se trata de abstracción:

1. **`TypeVar` (Variable de tipo):** Actúa como un marcador de posición (*placeholder*) que representa un tipo de dato no especificado en el momento de escribir el código. Se resuelve dinámicamente cuando se instancia o utiliza la estructura.
2. **`Generic` (Clase base genérica):** Es la clase de la que deben heredar nuestras estructuras personalizadas para indicar que aceptan uno o más parámetros de tipo (`TypeVar`).
3. **Parámetro de tipo vs. Tipo concreto:**

* Un tipo genérico es **unbound** (no enlazado) mientras use variables de tipo (ej. `Lista[T]`).
* Se convierte en un tipo **bound** (enlazado) o concreto cuando se le asigna un tipo real (ej. `Lista[int]`).

### Sintaxis tradicional (`typing.TypeVar`) frente a la sintaxis moderna (PEP 695)

Python ha evolucionado sustancialmente en la forma de declarar estos componentes. Dependiendo de la versión de Python que utilices en tu proyecto con Pydantic, te encontrarás con dos enfoques:

#### Enfoque Clásico (Python 3.5 a 3.11)

Se requiere la importación explícita de `TypeVar` y `Generic`. Las variables de tipo se tienen que inicializar de forma independiente antes de ser usadas en la clase.

```python
from typing import Generic, TypeVar

# Se define la variable de tipo (el string debe coincidir con el nombre de la variable)
T = TypeVar('T')

# Se aplica a una clase indicando que es genérica respecto a T
class ContenedorClasico(Generic[T]):
    def __init__(self, contenido: T):
        self.contenido = contenido

```

#### Enfoque Moderno (Python 3.12+ / PEP 695)

Python 3.12 eliminó la necesidad de declarar formalmente `TypeVar` y heredar de `Generic` para los casos de uso comunes. Ahora se utiliza una sintaxis nativa con corchetes directamente en la definición de la clase o función, lo que hace el código mucho más limpio y legible.

```python
# Sintaxis nativa en Python 3.12+: No requiere TypeVar ni Generic explícitos
class ContenedorModerno[T]:
    def __init__(self, contenido: T):
        self.contenido = contenido

```

### El flujo del tipado genérico en la ejecución

Para visualizar cómo interactúan estos componentes desde que se define la estructura abstracta hasta que se procesa un tipo de dato real en el sistema, podemos observar el siguiente esquema:

```text
[ Definición Abstracta ]
  class Contenedor[T] ------> T es un marcador (TypeVar)
                                  │
                                  ▼
[ Enlace de Tipo (Binding) ]      │
  Contenedor[int]     ------> Reemplaza T por 'int'
                                  │
                                  ▼
[ Instanciación ]                 │
  Contenedor(contenido=42) -> Pydantic validará que el valor sea un entero (int)

```

### Restricciones y acotaciones (`bound` y `choices`)

No siempre queremos que un tipo genérico acepte absolutamente cualquier dato (como cadenas, booleanos, objetos complejos, etc.). `TypeVar` permite limitar el universo de tipos válidos mediante dos mecanismos:

* **Tipos permitidos específicos (*choices*):** Se restringe la variable de tipo a una lista cerrada de opciones exclusivas.
* **Límite superior (*bound*):** Se restringe la variable de tipo para que solo acepte una clase específica o cualquiera de sus subclases (herencia).

A continuación se muestra un bloque de código detallado que ejemplifica el uso de la sintaxis clásica y moderna, aplicando restricciones y demostrando cómo Python entiende estas asignaciones antes de que Pydantic las explote para la validación de esquemas:

```python
from typing import TypeVar, Generic
from pydantic import BaseModel

# ==========================================
# 1. EJEMPLO DE RESTRICCIÓN POR CHOICES (Opciones)
# ==========================================

# Sintaxis clásica (< Python 3.12)
# T_Num solo puede ser estrictamente int o float
T_Num = TypeVar('T_Num', int, float)

class CalculadorClasico(Generic[T_Num]):
    def __init__(self, valor: T_Num):
        self.valor = valor

# Sintaxis moderna (Python 3.12+)
class CalculadorModerno[T_Num: (int, float)]:
    def __init__(self, valor: T_Num):
        self.valor = valor


# ==========================================
# 2. EJEMPLO DE RESTRICCIÓN POR BOUND (Límite superior)
# ==========================================

class UsuarioBase(BaseModel):
    id: int
    rol: str

class Administrador(UsuarioBase):
    permisos: list[str]

# Sintaxis clásica: T_User debe ser UsuarioBase o cualquier subclase (como Administrador)
T_User = TypeVar('T_User', bound=UsuarioBase)

class RespuestaSistemaClasica(Generic[T_User]):
    def __init__(self, datos: T_User):
        self.datos = datos

# Sintaxis moderna (Python 3.12+): Se usa el operador ':' para indicar el bound
class RespuestaSistemaModerno[T_User: UsuarioBase]:
    def __init__(self, datos: T_User):
        self.datos = datos


# ==========================================
# 3. COMPROBACIÓN DE COMPORTAMIENTO
# ==========================================

# Tipado correcto: Administrador hereda de UsuarioBase
admin_instance = Administrador(id=1, rol="admin", permisos=["sudo"])
respuesta_valida = RespuestaSistemaModerno(datos=admin_instance) 

# Error de tipado estático (Mypy / Pyright advertirán esto):
# str no es una subclase ni cumple el bound de UsuarioBase
# respuesta_invalida = RespuestaSistemaModerno(datos="Texto Simple") 

```

Comprender estas mecánicas nativas de Python es el prerrequisito fundamental para el siguiente paso: analizar cómo Pydantic intercepta estas variables de tipo para generar esquemas de validación dinámicos y robustos en tiempo de ejecución.

## 10.2. Creación de GenericModel

En las versiones estables de Pydantic V2, la creación de modelos genéricos no requiere una clase base separada como ocurría en el pasado (donde se utilizaba `GenericModel`). En su lugar, el comportamiento genérico se integra directamente en la clase fundamental `BaseModel` combinándose con los estándares de tipado nativos de Python.

Cuando defines un `BaseModel` que hereda de una clase genérica o que incluye parámetros de tipo en su declaración, Pydantic detecta automáticamente estos marcadores de posición. A partir de ellos, es capaz de generar dinámicamente esquemas de validación específicos para cada tipo concreto con el que decidas instanciar el modelo.

### Estructura de un modelo genérico

Para declarar un modelo genérico en Pydantic, debes asociar la clase con una o más variables de tipo (`TypeVar`). El caso de uso más común en entornos de producción es la unificación de las respuestas de una API o las estructuras de paginación.

El siguiente diagrama en texto plano ilustra cómo un único modelo genérico actúa como una plantilla que se ramifica en múltiples estructuras de datos en tiempo de ejecución, dependiendo del tipo concreto que se le asigne:

```text
                  ┌──────────────────────────────┐
                  │   BaseModel Genérico:        │
                  │   Respuesta[T]               │
                  └──────────────┬───────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                                               ▼
┌─────────────────┐                             ┌─────────────────┐
│ Respuesta[int]  │                             │Respuesta[User]  │
├─────────────────┤                             ├─────────────────┤
│ data: int       │                             │ data: User      │
│ (Valida enteros)│                             │ (Valida objeto) │
└─────────────────┘                             └─────────────────┘

```

### Implementación práctica paso a paso

A continuación se detalla cómo implementar esta característica utilizando tanto la sintaxis clásica de Python como la sintaxis moderna basada en el PEP 695 (disponible a partir de Python 3.12).

#### Enfoque con Sintaxis Clásica (Python 3.9 a 3.11)

Este enfoque utiliza el módulo `typing` para declarar las variables de tipo y la clase base `Generic`.

```python
from typing import Generic, TypeVar, List
from pydantic import BaseModel

# Se definen las variables de tipo abstractas
T = TypeVar('T')

# El modelo hereda de BaseModel y de Generic[T] simultáneamente
class RespuestaAPI(BaseModel, Generic[T]):
    estado: str
    codigo: int
    datos: T
    errores: List[str] = []

```

#### Enfoque con Sintaxis Moderna (Python 3.12+)

A partir de Python 3.12, la declaración se simplifica drásticamente eliminando la necesidad de importar `Generic` o `TypeVar`. Las variables de tipo se declaran directamente entre corchetes junto al nombre de la clase.

```python
from pydantic import BaseModel

# Sintaxis nativa y limpia: Pydantic infiere la genericidad de forma automática
class RespuestaAPI[T](BaseModel):
    estado: str
    codigo: int
    datos: T
    errores: list[str] = []

```

### Inicialización y validación en tiempo de ejecución

Una de las grandes ventajas de Pydantic es que no solo proporciona soporte para que los analizadores estáticos (como Mypy o Pyright) comprendan el código, sino que también obliga a que se cumplan las reglas de tipado de forma estricta en tiempo de ejecución.

Cuando pasas un tipo concreto al modelo genérico (por ejemplo, `RespuestaAPI[Item]`), Pydantic crea internamente una subclase concreta y especializada para ese tipo.

El siguiente bloque de código demuestra cómo inicializar estos modelos, cómo reacciona Pydantic ante datos válidos y cómo se comporta el sistema de validación cuando los datos de entrada no coinciden con el tipo parametrizado:

```python
from pydantic import BaseModel, ValidationError

# 1. Definimos un modelo secundario que utilizaremos como tipo concreto
class Producto(BaseModel):
    id: int
    nombre: str
    precio: float

# 2. Definimos nuestro modelo genérico (usando sintaxis moderna de Python 3.12+)
class Contenedor[T](BaseModel):
    categoria: str
    elemento: T

# =====================================================================
# CASO 1: Validación exitosa con un tipo primitivo (int)
# =====================================================================
contenedor_int = Contenedor[int](categoria="Numeros", elemento=42)
print(contenedor_int.elemento)  # Salida: 42
print(type(contenedor_int.elemento))  # Salida: <class 'int'>


# =====================================================================
# CASO 2: Validación exitosa con un modelo complejo (Producto)
# =====================================================================
datos_producto = {"id": 101, "nombre": "Teclado Mecánico", "precio": 89.99}

# Al parametrizar con [Producto], Pydantic parsea el diccionario automáticamente
contenedor_producto = Contenedor[Producto](
    categoria="Periféricos", 
    elemento=datos_producto
)

print(contenedor_producto.elemento.nombre)  # Salida: Teclado Mecánico
print(isinstance(contenedor_producto.elemento, Producto))  # Salida: True


# =====================================================================
# CASO 3: Falla de validación en tiempo de ejecución
# =====================================================================
try:
    # Intentamos pasar una cadena de texto donde se espera una estructura de Producto
    Contenedor[Producto](
        categoria="Error", 
        elemento="Esto no es un producto válido"
    )
except ValidationError as e:
    # Pydantic detiene la ejecución y expone el error de tipado con precisión
    print(e.json(indent=2))
    """
    [
      {
        "type": "model_type",
        "loc": [
          "elemento"
        ],
        "msg": "Input should be a valid dictionary or instance of Producto",
        "input": "Esto no es un producto válido"
      }
    ]
    """

```

### Reutilización de esquemas dinámicos

Al inspeccionar el esquema JSON generado por Pydantic a través del método `model_json_schema()`, se puede comprobar que `Contenedor[int]` y `Contenedor[Producto]` generan definiciones totalmente independientes y estructuradas en el output. Esto garantiza que herramientas de terceros o frameworks de construcción de APIs (como FastAPI) puedan mapear los contratos de datos de manera inequívoca y sin colisiones de nombres.

## 10.3. Herencia con genéricos

La combinación de herencia y tipos genéricos en Pydantic permite estructurar jerarquías de datos altamente reutilizables. Al heredar de un modelo genérico, puedes optar por mantener la flexibilidad de los parámetros de tipo para que las subclases sigan siendo genéricas, o bien cerrar la abstracción asignando tipos concretos que resuelvan las variables de tipo de la clase padre.

Pydantic maneja con precisión estas transiciones en tiempo de ejecución, asegurando que los esquemas de validación e incluso los validadores personalizados (`@field_validator`) se propaguen y adapten correctamente a lo largo de la cadena de herencia.

### Patrones de herencia genérica

Cuando trabajas con herencia y modelos genéricos, te enfrentarás principalmente a tres patrones de diseño:

```text
Patrón A: Extensión Genérica
[ Padre: Modelo[T] ] ───► [ Hijo: SubModelo[T] ] (Mantiene la variable de tipo abstracta)

Patrón B: Concreción Total
[ Padre: Modelo[T] ] ───► [ Hijo: ModeloConcreto ] (Reemplaza T por un tipo como 'int')

Patrón C: Genéricos Múltiples
[ Padre: Envoltorio[T] ] ───► [ Hijo: EnvoltorioAvanzado[T, U] ] (Añade nuevas variables)

```

1. **Mantener la genericidad (Patrón A):** La subclase hereda las variables de tipo del padre sin modificarlas, permitiendo que la especialización ocurra más tarde, en el momento de la instanciación.
2. **Fijar o concretar tipos (Patrón B):** La subclase resuelve formalmente la variable de tipo del padre pasándole un tipo de dato fijo (primitivo o un `BaseModel`). La subclase deja de ser genérica.
3. **Ampliar variables de tipo (Patrón C):** La subclase mantiene la variable de tipo del padre y añade sus propios parámetros genéricos adicionales, aumentando la flexibilidad de la estructura.

### Implementación de patrones con sintaxis clásica y moderna

A continuación se detalla cómo estructurar estos tres patrones de herencia utilizando tanto las convenciones clásicas de Python como la sintaxis moderna de Python 3.12+.

#### 1. Extensión Genérica (Mantener la variable de tipo)

La subclase sigue requiriendo ser parametrizada al usarse.

* **Sintaxis clásica (< Python 3.12):**

```python
from typing import Generic, TypeVar
from pydantic import BaseModel

T = TypeVar('T')

class ItemBase(BaseModel, Generic[T]):
    id: int
    datos: T

# Se deben pasar las variables tanto a BaseModel como a Generic
class ItemAuditable(ItemBase[T], Generic[T]):
    creado_por: str

```

* **Sintaxis moderna (Python 3.12+):**

```python
    from pydantic import BaseModel

    class ItemBase[T](BaseModel):
        id: int
        datos: T

    # Sintaxis limpia: se hereda pasando el parámetro directamente
    class ItemAuditable[T](ItemBase[T]):
        creado_por: str
    ```

#### 2. Concreción Total (Fijar un tipo de dato)
La subclase se transforma en un modelo estándar y corriente, por lo que no se le añaden corchetes al instanciarla.

*   **Sintaxis clásica (< Python 3.12):**
    
```python
    # Se pasa el tipo concreto 'str' directamente en la herencia
    class MensajeDeTexto(ItemBase[str]):
        leido: bool
    ```
*   **Sintaxis moderna (Python 3.12+):**
    
```python
    # El comportamiento es idéntico; se resuelve la T de la clase base con 'str'
    class MensajeDeTexto(ItemBase[str]):
        leido: bool
    ```

### Comportamiento de validación en la jerarquía

Cuando Pydantic procesa una subclase concreta (como `MensajeDeTexto` o `ItemAuditable[int]`), analiza de forma recursiva los campos de toda la jerarquía de objetos y reasigna los tipos correspondientes en el motor de validación interno (`pydantic-core`).

El siguiente bloque de código demuestra cómo interactúan estos tres patrones en un caso práctico de validación de datos reales y cómo el sistema rechaza los tipos inconsistentes con la jerarquía declarada:

```python
from pydantic import BaseModel, ValidationError

# =====================================================================
# Definición de la jerarquía de modelos (Sintaxis moderna Python 3.12+)
# =====================================================================

class Respuesta[T](BaseModel):
    codigo: int
    resultado: T

# Patrón A: Subclase que mantiene la genericidad y añade un campo
class RespuestaPaginada[T](Respuesta[T]):
    total_paginas: int
    pagina_actual: int

# Patrón B: Subclase que concreta el tipo interno fijándolo a una lista de strings
class NotificacionErrores(Respuesta[list[str]]):
    urgente: bool


# =====================================================================
# Validación Práctica - Caso 1: Extensión Genérica con tipo concreto (int)
# =====================================================================
# Al instanciar pasamos [int], lo que obliga a que 'resultado' sea un entero
datos_paginados = {
    "codigo": 200,
    "resultado": 9942,  # Cumple con el tipo T (int)
    "total_paginas": 5,
    "pagina_actual": 1
}

api_paginada = RespuestaPaginada[int](**datos_paginados)
print(f"Resultado paginado: {api_paginada.resultado} (Tipo: {type(api_paginada.resultado)})")
# Salida: Resultado paginado: 9942 (Tipo: <class 'int'>)


# =====================================================================
# Validación Práctica - Caso 2: Concreción Total (Fijado a list[str])
# =====================================================================
# No requiere corchetes al instanciar porque ya no es genérica
datos_errores = {
    "codigo": 500,
    "resultado": ["Error de conexión", "Timeout en la base de datos"], # Cumple list[str]
    "urgente": True
}

api_errores = NotificacionErrores(**datos_errores)
print(f"Errores detectados: {len(api_errores.resultado)}")
# Salida: Errores detectados: 2


# =====================================================================
# Validación Práctica - Caso 3: Fallas detectadas por el esquema heredado
# =====================================================================
try:
    # Pasamos una cadena en vez de una lista de cadenas a NotificacionErrores
    NotificacionErrores(
        codigo=400,
        resultado="Esto romperá la validación porque no es una lista",
        urgente=False
    )
except ValidationError as e:
    print(e.json(indent=2))
    """
    [
      {
        "type": "list_type",
        "loc": [
          "resultado"
        ],
        "msg": "Input should be a valid list",
        "input": "Esto romperá la validación porque no es una lista"
      }
    ]
    """

```

### Resolución de campos y alias en la herencia

Es importante destacar que si la clase padre define configuraciones globales (a través de `model_config`) o alias en sus campos utilizando `Field()`, las subclases genéricas heredarán estas propiedades íntegramente. Si una subclase genérica anula un campo heredado redefiniendo su anotación de tipo, debe asegurarse de mantener la compatibilidad estructural para evitar conflictos en la generación del esquema OpenAPI o JSON Schema.

## 10.4. Limitaciones y advertencias

A pesar de la enorme potencia y flexibilidad que ofrece el modelado genérico en Pydantic V2, la combinación de tipado estático abstracto y validación estricta en tiempo de ejecución introduce ciertas limitaciones técnicas y desafíos de rendimiento. Conocer estas advertencias es fundamental para evitar comportamientos inesperados en entornos de producción, especialmente al trabajar con serialización, análisis estático de código o arquitecturas basadas en microservicios.

### 1. Duplicación de esquemas y consumo de memoria

Cada vez que parametrizas un modelo genérico con un tipo concreto nuevo (por ejemplo, `Respuesta[int]`, `Respuesta[str]`, `Respuesta[Usuario]`), Pydantic no se limita a reutilizar la misma clase en segundo plano. Para poder garantizar un rendimiento óptimo en la validación, el motor interno `pydantic-core` genera y compila una **subclase concreta única** y un esquema de validación independiente para cada combinación de tipos.

```text
                  ┌──────────────────────┐
                  │    Respuesta[T]      │ (Plantilla abstracta)
                  └──────────┬───────────┘
                             │
       ┌─────────────────────┼─────────────────────┐
       ▼                     ▼                     ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│ Respuesta_int│      │ Respuesta_str│      │Respuesta_User│ (Clases reales en memoria)
└──────────────┘      └──────────────┘      └──────────────┘

```

> **Advertencia de rendimiento:** Si tu aplicación genera cientos de combinaciones de tipos dinámicos sobre la marcha (por ejemplo, parametrizando clases con tipos generados programáticamente), el consumo de memoria del proceso de Python aumentará progresivamente debido a la acumulación de esquemas residentes en la caché interna de Pydantic.

### 2. Limitaciones de resolución con Mypy y Pyright

Aunque Pydantic se alinea estrechamente con los estándares de tipado de Python (incluyendo el PEP 695), los analizadores estáticos de código como **Mypy** o **Pyright** a veces experimentan dificultades para inferir tipos en estructuras genéricas multinivel o profundamente anidadas.

* **Pérdida de información en la instanciación dinámica:** Si inicializas un modelo genérico utilizando diccionarios desempaquetados (como `Respuesta[T](datos)`) dentro de una función abstracta, el analizador estático puede marcar el tipo resultante como `Any` en lugar de resolver la variable de tipo específica.
* **Necesidad de plugins:** Para escenarios de herencia genérica compleja anteriores a Python 3.12, sigue siendo altamente recomendable activar el plugin oficial de Pydantic en la configuración de Mypy (`pydantic.mypy`) para evitar falsos positivos en la verificación de tipos.

### 3. Problemas con la serialización y nombres de modelos alternativos

Cuando serializas un modelo genérico en un esquema JSON (`model_json_schema()`), Pydantic necesita asignar un nombre único a cada subclase concreta generada. Por defecto, Pydantic intenta construir este nombre uniendo los términos (ej. `Respuesta_int_` o `Respuesta_Usuario_`).

Esto puede generar colisiones o nombres de esquemas excesivamente complejos si se da alguna de las siguientes condiciones:

* Utilizas tipos concretos con nombres idénticos pero definidos en diferentes módulos del proyecto.
* Creas funciones lambda o clases anidadas localmente para parametrizar tus modelos genéricos.

Si necesitas integrar estos modelos con herramientas como **FastAPI** o generadores de clientes OpenAPI, estos nombres generados dinámicamente pueden provocar inconsistencias en la documentación final si no se gestionan de forma explícita.

### 4. Incompatibilidad de validadores Before en tipos no enlazados

No es posible aplicar validadores en modo `before` (`@model_validator(mode='before')`) que dependan del tipo concreto final si dichos validadores se ejecutan antes de que Pydantic sepa con qué tipo se ha instanciado la clase. La lógica de negocio que inspeccione el valor de un campo genérico debe ejecutarse preferentemente en el modo `after`, cuando la variable de tipo ya se ha enlazado y transformado en el tipo concreto correspondiente.

## Resumen del capítulo

En este capítulo hemos explorado a fondo el soporte para **Modelos Genéricos** en Pydantic, una de las herramientas más robustas para eliminar la duplicación de código en la capa de datos de nuestras aplicaciones.

* **Tipos genéricos en Python:** Analizamos los fundamentos del tipado abstracto nativo de Python, contrastando el enfoque clásico basado en `TypeVar` y `Generic` con la sintaxis moderna introducida a partir de Python 3.12 (PEP 695).
* **Creación de modelos:** Aprendimos cómo los parámetros de tipo se integran directamente en `BaseModel` para actuar como plantillas capaces de generar esquemas de validación dinámicos en tiempo de ejecución.
* **Jerarquías y herencia:** Estudiamos los patrones de diseño para heredar de estructuras genéricas, ya sea manteniendo la abstracción abierta para futuras especializaciones o cerrándola mediante la asignación de tipos concretos fijos.
* **Restricciones técnicas:** Finalmente, revisamos las advertencias esenciales en torno al consumo de memoria por duplicación de esquemas y las limitaciones actuales en las herramientas de análisis estático.
