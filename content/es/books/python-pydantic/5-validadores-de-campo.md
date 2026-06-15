Este capítulo aborda el control absoluto sobre los datos individuales de tus modelos mediante lógica personalizada. Aunque las restricciones nativas de Pydantic solucionan validaciones comunes, las reglas de negocio complejas exigen código a medida.

Aprenderás a dominar el decorador `@field_validator` para interceptar, transformar y verificar atributos de forma aislada. Descubriremos la diferencia crucial entre actuar antes del análisis de tipos (`mode='before'`) con datos crudos, o intervenir después del parseo (`mode='after'`) con la garantía de trabajar con objetos de Python totalmente tipados y saneados. Finalmente, optimizaremos tu código aplicando técnicas de reutilización avanzadas.

## 5.1. El decorador field_validator

El decorador `@field_validator` es la herramienta fundamental que ofrece Pydantic en su versión 2 para añadir lógica de validación personalizada a atributos específicos de un modelo. Mientras que las restricciones de `Field()` (vistas en el Capítulo 4) cubren reglas matemáticas o de longitud simples, `@field_validator` permite inyectar código Python arbitrario para evaluar la validez de un dato, conectarse con lógica de negocio compleja o transformar el valor de entrada.

### Sintaxis básica y funcionamiento

Para emplear este decorador, se debe importar desde el módulo `pydantic`. Se aplica sobre un método de clase (el cual actúa implícitamente como un método decorado con `@classmethod`) y requiere obligatoriamente el nombre del campo o campos que va a evaluar.

El método validador recibe dos argumentos principales:

1. `cls`: La referencia a la clase del modelo (no a la instancia, ya que la instancia aún no se ha creado).
2. `v`: El valor asignado al campo que se está validando en ese momento.

El flujo de ejecución de la validación sigue este orden lógico:

```text
[ Datos de Entrada ] 
         │
         ▼
[ Conversión de Tipos Básica ] (Ej: "123" -> 123)
         │
         ▼
[ @field_validator ] <─── Tu lógica personalizada se ejecuta aquí
         │
 ┌───────┴───────┐
 │               │
 ▼               ▼
[Éxito]       [Fallo] ──> Lanza ValueError / Pydantic genera ValidationError
 │
 ▼
[Atributo Asignado]

```

A continuación se muestra un ejemplo práctico donde se asegura que un campo de texto no contenga espacios en blanco innecesarios y cumpla con un criterio alfabético específico:

```python
from pydantic import BaseModel, field_validator

class RegistroUsuario(BaseModel):
    username: str
    codigo_empleado: str

    @field_validator('codigo_empleado')
    @classmethod
    def verificar_codigo_estructura(cls, v: str) -> str:
        # v contiene el valor del campo 'codigo_empleado'
        id_limpio = v.strip()
        
        if not id_limpio.startswith("EMP-"):
            raise ValueError("El código de empleado debe comenzar con el prefijo 'EMP-'")
            
        if not id_limpio[4:].isdigit():
            raise ValueError("La parte posterior al prefijo debe ser únicamente numérica")
            
        # Es obligatorio retornar el valor (modificado o no)
        return id_limpio

```

### Reglas críticas de implementación

Al escribir validadores de campo, se deben respetar de forma estricta las siguientes directrices estructurales de Pydantic:

* **Siempre retornar el valor:** Un `@field_validator` actua como un filtro o transformador. Si el valor es correcto, el método **debe** retornar `v` (o una versión modificada del mismo). Si se olvida la sentencia `return`, el campo pasará a valer `None`, estropeando la validación del tipo.
* **Uso obligatorio de `@classmethod`:** Aunque en versiones previas de Pydantic esto se gestionaba de forma interna, en Pydantic V2 se requiere explícitamente aplicar el decorador `@classmethod` inmediatamente debajo de `@field_validator`.
* **Excepciones nativas:** Para indicar que un valor no es válido, se debe lanzar un `ValueError` o un `AssertionError`. Pydantic interceptará automáticamente estas excepciones de Python y las empaquetará dentro de un `ValidationError` formal con un formato limpio para el usuario final.

### Validación de múltiples campos simultáneamente

El decorador no está limitado a un único atributo. Si varios campos de un modelo comparten exactamente la misma lógica de validación, se pueden pasar todos sus nombres como argumentos independientes al decorador.

```python
from pydantic import BaseModel, field_validator

class SensorIndustrial(BaseModel):
    temperatura_minima: float
    temperatura_maxima: float
    temperatura_critica: float

    @field_validator('temperatura_minima', 'temperatura_maxima', 'temperatura_critica')
    @classmethod
    def asegurar_valores_positivos(cls, v: float) -> float:
        if v < 0:
            raise ValueError("Las lecturas de temperatura de este sensor no pueden ser negativas")
        return v

```

### Comportamiento por defecto y el argumento mode

Por defecto, `@field_validator` se ejecuta en modo `after` (después). Esto significa que la función solo se llamará si el dato de entrada ya ha superado con éxito la conversión de tipos inicial de Pydantic. Por ejemplo, si el campo está definido como `int` y el usuario envía la cadena `"42"`, el validador recibirá el número entero `42`. Si el usuario envía la cadena `"hola"`, Pydantic fallará inmediatamente en la conversión inicial y el método decorado con `@field_validator` nunca llegará a ejecutarse.

Este comportamiento garantiza que la lógica personalizada trabaje siempre con datos limpios y del tipo correcto, evitando comprobaciones manuales redundantes dentro de la función.

## 5.2. Validación antes de parsear

Por defecto, los validadores de campo creados con `@field_validator` se ejecutan en el modo `after` (después de que Pydantic haya procesado, limpiado y convertido el tipo de dato de entrada). Sin embargo, existen situaciones donde necesitas interceptar los datos en su estado original y crudo, exactamente como llegaron al modelo, antes de que el motor de validación intente interpretarlos o aplicar conversiones automáticas. Para esto se utiliza el modo `before`.

### El argumento `mode='before'`

Para cambiar el momento de ejecución del validador, se debe pasar explícitamente el argumento `mode='before'` dentro del decorador `@field_validator`.

Cuando se configura de esta manera, la variable `v` que recibe el método no ha sufrido ninguna mutación por parte de Pydantic. Puede ser un diccionario, una cadena de texto, un número, un valor nulo (`None`) o cualquier tipo de dato que el usuario haya enviado al inicializar el modelo.

La principal diferencia en el flujo de ejecución se puede estructurar de la siguiente forma:

```text
          [ Datos de Entrada Crudos ]
                       │
                       ▼
           ┌───────────────────────┐
           │     mode='before'     │  <─── Tu validador intercepta el dato aquí
           └───────────────────────┘
                       │
                       ▼
         [ Conversión de Tipos Básica ] (Ej: "123" -> 123)
                       │
                       ▼
           ┌───────────────────────┐
           │  mode='after' (Def.)  │
           └───────────────────────┘
                       │
                       ▼
              [ Atributo Asignado ]

```

### Casos de uso comunes para la validación previa

La validación antes de parsear es una herramienta indispensable en los siguientes escenarios:

* **Normalización de formatos de entrada complejos:** Transformar estructuras alternativas (como texto separado por comas o JSON embebido en cadenas) en los tipos nativos que Pydantic espera (listas, diccionarios, etc.).
* **Limpieza drástica de datos dañados:** Manejar valores vacíos mal formateados procedentes de formularios web o bases de datos antiguas antes de que causen un error de tipo en el parseador de Pydantic.
* **Pre-procesamiento flexible:** Permitir que un campo acepte múltiples representaciones de datos de manera tolerante y unificar el formato antes de la validación estricta del tipo.

### Ejemplo práctico: Procesamiento de entradas flexibles

Imagina un modelo que registra transacciones y requiere una lista de identificadores numéricos. El origen de los datos puede enviar esta información como una lista real de enteros, o bien como una única cadena de texto con números separados por guiones debido a limitaciones de un sistema heredado.

Si no utilizáramos `mode='before'`, Pydantic lanzaría un error de validación inmediatamente al recibir una cadena de texto en un campo definido como una lista (`list[int]`). Interceptando el dato antes, podemos resolver este conflicto limpiamente:

```python
from pydantic import BaseModel, field_validator

class RegistroTransaccion(BaseModel):
    id_transaccion: int
    codigos_operacion: list[int]

    @field_validator('codigos_operacion', mode='before')
    @classmethod
    def parsear_y_limpiar_codigos(cls, v: any) -> any:
        # 1. Si la entrada es una cadena de texto, la transformamos en una lista
        if isinstance(v, str):
            # Eliminamos espacios y separamos por guiones
            v = v.strip()
            if not v:
                return []
            return [int(codigo.strip()) for codigo in v.split("-") if codigo.strip()]
        
        # 2. Si la entrada ya es una lista, la dejamos pasar para que Pydantic haga su trabajo
        return v

```

### Comportamiento del validador ante tipos incorrectos

Es importante comprender que, al usar `mode='before'`, asumes la responsabilidad total sobre el tipo de dato inicial que contiene `v`. Dado que puede recibir absolutamente cualquier cosa, tu código debe estar preparado para validar la instancia (`isinstance`) o manejar excepciones internas de manera segura.

Si el valor retornado por tu validador `before` sigue sin coincidir con el tipo de dato declarado en el modelo, Pydantic continuará con su flujo normal e intentará realizar la conversión con el nuevo valor que le has entregado. Si aun así no es posible transformarlo, se lanzará el `ValidationError` correspondiente en la siguiente etapa del ciclo.

## 5.3. Validación después de parseo

El comportamiento predeterminado del decorador `@field_validator` ocurre en el modo `after` (después de). Aunque se puede explicitar mediante el argumento `mode='after'`, omitirlo produce exactamente el mismo resultado. En esta etapa del ciclo de vida del modelo, el motor de Pydantic ya ha realizado todo el trabajo pesado de análisis, limpieza y conversión de tipos (*parsing*).

### La garantía del dato saneado

La ventaja fundamental de trabajar en el modo `after` es la certeza absoluta sobre el tipo de dato que estás manipulando. A diferencia del modo `before` —donde la variable `v` puede contener cualquier estructura inesperada enviada por el cliente—, en la validación posterior tienes la garantía de que el valor ya se ha transformado al tipo estricto anotado en el modelo.

Si un campo está definido como `datetime`, tu validador recibirá un objeto `datetime` nativo de Python, sin importar si la entrada original era una cadena en formato ISO o un sello de tiempo (*timestamp*) numérico. Si la conversión inicial falla, Pydantic detiene el proceso inmediatamente y lanza un `ValidationError`, lo que significa que tu lógica personalizada solo se ejecutará si los datos de entrada son estructuralmente válidos.

```text
[ Entrada Cruda: "2026-05-21" ]
               │
               ▼
 [ Conversión Automática ]  ──(Fallo)──> [ ValidationError ]
               │
          (Éxito)
               ▼
[ Objeto Nativo: datetime(...) ]
               │
               ▼
   ┌───────────────────────┐
   │     mode='after'      │  <─── Tu lógica evalúa el objeto ya parseado
   └───────────────────────┘
               │
        (Retorna valor)
               ▼
      [ Atributo Guardado ]

```

### Casos de uso ideales para el modo After

Este modo es la opción idónea para aplicar reglas de negocio puras, restricciones lógicas avanzadas o comprobaciones de coherencia interna que van más allá de la estructura sintáctica del dato:

* **Validaciones matemáticas e intervalos dinámicos:** Verificar si un número es par, si se encuentra dentro de un rango dinámico no soportado por `Field()` o si cumple con una ecuación específica.
* **Verificaciones de dominio y lógica de negocio:** Validar si un correo electrónico pertenece a un dominio corporativo específico, o si una fecha introducida cae en un día laborable.
* **Normalización final:** Realizar ajustes estéticos menores en objetos ya tipados (como asegurar que un texto esté completamente en mayúsculas o que un número flotante se redondee a dos decimales).

### Ejemplo práctico: Reglas de negocio sobre tipos complejos

En el siguiente ejemplo, el modelo recibe una fecha de nacimiento en formato de texto. Pydantic la convierte automáticamente en un objeto `date` de Python. Una vez hecha la conversión, el validador `after` interviene para aplicar una regla de negocio estricta: el usuario debe ser mayor de edad para registrarse.

```python
from datetime import date
from pydantic import BaseModel, field_validator

class RegistroConductor(BaseModel):
    nombre: str
    fecha_nacimiento: date

    @field_validator('fecha_nacimiento', mode='after')
    @classmethod
    def verificar_mayoria_edad(cls, v: date) -> date:
        # v ya es un objeto nativo de tipo datetime.date gracias a Pydantic
        hoy = date.today()
        edad = hoy.year - v.year - ((hoy.month, hoy.day) < (v.month, v.day))
        
        if edad < 18:
            raise ValueError("El conductor debe ser mayor de edad (18 años o más).")
            
        # Retornamos el objeto date verificado
        return v

```

Si el usuario enviara la cadena `"no-es-una-fecha"`, el programa nunca llegaría a ejecutar la función `verificar_mayoria_edad`, puesto que Pydantic detendría el proceso antes al no poder parsear el texto a un tipo `date`. Esto mantiene el código de tus validadores sumamente limpio, corto y libre de bloques `try/except` innecesarios.

## 5.4. Reutilización de validadores

A medida que los proyectos crecen, es muy común encontrarse con que la misma regla de validación personalizada debe aplicarse a diferentes campos repartidos en múltiples modelos. Escribir el mismo decorador `@field_validator` una y otra vez rompe el principio DRY (*Don't Repeat Yourself*) y dificulta el mantenimiento del código.

Pydantic V2 resuelve este problema permitiendo la creación de validadores externos reutilizables gracias a la función `field_validator` (utilizada como una función decoradora tradicional) o mediante la integración con el módulo `Annotated` de Python.

### Reutilización mediante herencia de validadores

Dado que los validadores de campo en Pydantic actúan como métodos de clase, cualquier modelo secundario que herede de un modelo base heredará también sus validadores automáticamente, siempre y cuando los nombres de los campos coincidan.

```python
from pydantic import BaseModel, field_validator

class ModeloConCodigo(BaseModel):
    codigo_sistema: str

    @field_validator('codigo_sistema')
    @classmethod
    def validar_formato_codigo(cls, v: str) -> str:
        if not v.isalnum():
            raise ValueError("El código debe ser estrictamente alfanumérico")
        return v

# Este modelo hijo aplica la validación de código_sistema automáticamente
class RegistroProducto(ModeloConCodigo):
    nombre_producto: str

```

### Reutilización con funciones compartidas

Si necesitas aplicar la misma lógica a campos que tienen nombres diferentes o que se encuentran en modelos completamente independientes que no comparten una jerarquía de herencia, puedes definir la función lógica de validación de manera externa y registrarla manualmente dentro de cada modelo utilizando el decorador.

```python
from pydantic import BaseModel, field_validator

# 1. Definimos la función lógica pura fuera de cualquier clase
def evaluar_no_vacio(cls, v: str) -> str:
    if not v.strip():
        raise ValueError("El campo no puede estar vacío ni contener solo espacios")
    return v.strip()

# 2. Asignamos la función a los modelos correspondientes
class PerfilUsuario(BaseModel):
    biografia: str
    sitio_web: str

    # Usamos el decorador y le pasamos la función externa directamente
    _validar_bio = field_validator('biografia')(classmethod(evaluar_no_vacio))
    _validar_web = field_validator('sitio_web')(classmethod(evaluar_no_vacio))

class Comentario(BaseModel):
    texto: str

    _validar_texto = field_validator('texto')(classmethod(evaluar_no_vacio))

```

> **Nota de diseño:** Al asignar la función manualmente en la clase, la convención es guardar el resultado en una variable privada con prefijo de guion bajo (como `_validar_texto`) para evitar que Pydantic la confunda con un campo del modelo.

## Resumen del capítulo

En este capítulo hemos profundizado en el control absoluto del flujo de datos dentro de los campos individuales de Pydantic utilizando **Validadores de Campo**.

* **El decorador `@field_validator`** nos permite inyectar funciones de clase para ejecutar lógica personalizada, interceptar valores y arrojar excepciones legibles (`ValueError`) que se transforman en errores estructurados de Pydantic.
* **El modo `before`** (`mode='before'`) intercepta los datos de entrada en su estado más crudo y original, convirtiéndose en la herramienta ideal para limpiar entradas deformadas o flexibilizar formatos complejos antes de que el motor intente analizarlos.
* **El modo `after`** (`mode='after'`), que actúa de forma predeterminada, nos ofrece la máxima seguridad en el tipado, garantizando que nuestra lógica personalizada solo se ejecute con objetos de Python completamente parseados, limpios y validados estructuralmente.
* **La reutilización** nos enseña que las funciones de validación pueden ser heredadas por modelos hijos o vinculadas manualmente a diferentes atributos independientes, reduciendo drásticamente la duplicación de código en entornos de producción.
