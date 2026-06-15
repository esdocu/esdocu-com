Este capítulo aborda la validación global dentro de Pydantic V2 mediante el decorador `@model_validator`. A diferencia de las reglas aplicadas a atributos individuales, aquí aprenderás a evaluar el modelo en su conjunto. Exploraremos el ciclo de vida de los datos dividiendo el proceso en dos fases críticas: el modo `before` (para interceptar y reestructurar diccionarios crudos de entrada) y el modo `after` (para operar sobre instancias ya formadas). Dominarás la implementación de validaciones cruzadas entre múltiples campos, la mutación o normalización de atributos en tiempo de ejecución y la gestión del flujo de datos para garantizar la consistencia total de tu lógica de negocio.

## 6.1. Decorador model_validator

Mientras que `@field_validator` se enfoca en inspeccionar y limpiar un único atributo de manera aislada, existen situaciones donde necesitas evaluar el objeto en su totalidad. El decorador `@model_validator` te permite interceptar el flujo de validación a nivel de modelo para analizar cómo interactúan los campos entre sí o para transformar la estructura completa de los datos de entrada.

### El flujo de datos en la validación de modelo

En Pydantic V2, `@model_validator` puede actuar en dos momentos radicalmente diferentes del ciclo de vida del modelo, definidos por el argumento obligatorio `mode`:

* **Mode "after" (`mode='after'`)**: El validador se ejecuta **después** de que Pydantic ha terminado de parsear y validar cada campo individual de acuerdo a sus tipos de datos y sus respectivos `@field_validator`. La función decorada recibe una instancia completamente formada del modelo.
* **Mode "before" (`mode='before'`)**: El validador se ejecuta **antes** de que Pydantic intente parsear cualquier dato. La función recibe el diccionario crudo (u objeto de entrada) tal como lo suministró el usuario.

El siguiente diagrama en texto plano ilustra la secuencia exacta en el modo por defecto (`mode='after'`):

```text
[ Datos de entrada (dict) ]
            │
            ▼
[ Validación de campos individuales ] ──► (Tipos, Field(), @field_validator)
            │
            ▼
[ Instancia del Modelo creada ]
            │
            ▼
┌───────────────────────────────────────┐
│     @model_validator(mode='after')    │  ◄── Tu lógica de negocio global
└───────────────────────────────────────┘
            │
            ▼
[ Objeto validado y definitivo ]

```

### Sintaxis básica en modo "after"

Por defecto, cuando utilizas `mode='after'`, la función que decoras debe ser un **método de instancia** (recibe `self`) y tiene la obligación estricta de **retornar `self`** (o una nueva instancia modificada del modelo).

Si la lógica detecta una inconsistencia, debe lanzar una excepción `ValueError` o `AssertionError`, la cual Pydantic atrapará de forma interna para convertirla en un error estructurado del tipo `ValidationError`.

```python
from pydantic import BaseModel, model_validator

class RegistroDescuento(BaseModel):
    precio_original: float
    precio_oferta: float

    @model_validator(mode='after')
    def verificar_coherencia_precios(self) -> 'RegistroDescuento':
        # En este punto, precio_original y precio_oferta ya son floats válidos
        if self.precio_oferta > self.precio_original:
            raise ValueError("El precio de oferta no puede ser mayor al precio original.")
        
        # Es obligatorio retornar self en el modo 'after'
        return self

```

### Comportamiento frente a fallos previos

Una característica crítica del modo `after` es su comportamiento resiliente: si la validación de los campos individuales falla (por ejemplo, si pasas una cadena de texto no convertible en el campo `precio_original`), **el validador de modelo no llegará a ejecutarse**. Pydantic detiene el flujo antes para evitar que trabajes con datos rotos o nulos dentro de `self`.

Examinemos qué ocurre al interactuar con el modelo anterior:

```python
# Caso 1: Los datos cumplen con los tipos pero fallan la lógica de negocio global
try:
    RegistroDescuento(precio_original=100.0, precio_oferta=150.0)
except Exception as e:
    print(e)
    """
    1 validation error for RegistroDescuento
      Value error, El precio de oferta no puede ser mayor al precio original. [type=value_error, input_value={'precio_original': 100.0, 'precio_oferta': 150.0}, input_type=dict]
    """

# Caso 2: Los datos de entrada no respetan los tipos base
try:
    RegistroDescuento(precio_original="No soy un número", precio_oferta=150.0)
except Exception as e:
    print(e)
    """
    1 validation error for RegistroDescuento
    precio_original
      Input should be a valid number, unable to parse string as a number [type=float_parsing, input_value='No soy un número', input_type=str]
    """

```

### Diferencias clave con field_validator

Para elegir la herramienta adecuada en el momento oportuno, considera las siguientes diferencias operativas:

| Característica | `@field_validator` | `@model_validator(mode='after')` |
| --- | --- | --- |
| **Ámbito** | Un campo específico (o un grupo selecto de campos). | El modelo completo de forma unificada. |
| **Fase de Ejecución** | Durante el procesamiento individual de cada atributo. | Al final de todo el flujo de validaciones estándar. |
| **Primer argumento** | Recibe el valor del campo a evaluar (`cls`, `value`). | Recibe la instancia completa del objeto (`self`). |
| **Retorno** | Debe retornar el valor procesado del campo. | Debe retornar la instancia `self`. |
| **Dependencia** | No puede asumir con certeza el estado de los demás campos. | Tiene acceso garantizado a todos los campos ya validados. |

## 6.2. Validaciones cruzadas

Las validaciones cruzadas (o *cross-field validations*) entran en juego cuando la validez de un dato depende estrictamente del valor de otro. Mientras que una regla de negocio simple puede verificar si una edad es mayor que cero, una validación cruzada evalúa si un rango o una combinación de condiciones tiene sentido lógico para el sistema.

El escenario ideal para implementar estas reglas es `@model_validator(mode='after')`, ya que nos garantiza que todos los tipos de datos individuales ya han sido purificados y convertidos de manera correcta.

### Escenarios comunes de validación cruzada

Existen tres patrones clásicos en el desarrollo de software donde las validaciones cruzadas son obligatorias:

1. **Rangos cronológicos o numéricos:** Verificar que un límite inferior no supere al límite superior (por ejemplo: `fecha_inicio` y `fecha_fin`, o `edad_minima` y `edad_maxima`).
2. **Campos condicionales mutuos:** Si el campo `A` está presente, el campo `B` también debe estarlo; o bien, la presencia de `A` excluye por completo la existencia de `B`.
3. **Consistencia de estados:** Validar que ciertas banderas lógicas correspondan con los valores numéricos del modelo (por ejemplo, si `requiere_envio` es `True`, la `direccion_entrega` no puede estar vacía).

### Ejemplo práctico: Gestión de reservas de hotel

Imagina un sistema de reservas donde un usuario selecciona una fecha de entrada, una fecha de salida y un cupón de descuento opcional. Para que la reserva sea consistente, debemos asegurar dos cosas:

* La salida debe ser posterior a la entrada.
* Si se aplica un cupón de tipo `"BIENVENIDA"`, el cliente debe ser categorizado como un usuario nuevo.

```python
from datetime import date
from typing import Optional
from pydantic import BaseModel, model_validator

class ReservaHotel(BaseModel):
    fecha_entrada: date
    fecha_salida: date
    es_cliente_nuevo: bool
    codigo_cupon: Optional[str] = None

    @model_validator(mode='after')
    def evaluar_reglas_consistencia(self) -> 'ReservaHotel':
        # 1. Validación de rango cronológico
        if self.fecha_salida <= self.fecha_entrada:
            raise ValueError(
                f"La fecha de salida ({self.fecha_salida}) "
                f"debe ser posterior a la de entrada ({self.fecha_entrada})."
            )
        
        # 2. Validación de campos condicionales mutuos
        if self.codigo_cupon == "BIENVENIDA" and not self.es_cliente_nuevo:
            raise ValueError(
                "El cupón 'BIENVENIDA' solo es válido para clientes nuevos."
            )
            
        return self

```

### Comportamiento en la captura de errores

Cuando lanzas un `ValueError` dentro de un `model_validator`, Pydantic no asocia el error a un campo específico en el JSON de salida, sino que lo asigna a la raíz global del objeto bajo la clave `__root__` o con el marcador global del modelo. Esto es semánticamente correcto, ya que el fallo no le pertenece a un solo atributo, sino a la combinación de ambos.

Veamos cómo se comporta el sistema ante entradas erróneas:

```python
# Error 1: Fechas invertidas
try:
    ReservaHotel(
        fecha_entrada=date(2026, 6, 15),
        fecha_salida=date(2026, 6, 10),
        es_cliente_nuevo=True
    )
except Exception as e:
    print(e)
    """
    1 validation error for ReservaHotel
      Value error, La fecha de salida (2026-06-10) debe ser posterior a la de entrada (2026-06-15). [type=value_error, input_value={'fecha_entrada': date(2026...nte_nuevo': True}, input_type=dict]
    """

# Error 2: Uso indebido del cupón por un cliente antiguo
try:
    ReservaHotel(
        fecha_entrada=date(2026, 6, 10),
        fecha_salida=date(2026, 6, 15),
        es_cliente_nuevo=False,
        codigo_cupon="BIENVENIDA"
    )
except Exception as e:
    print(e)
    """
    1 validation error for ReservaHotel
      Value error, El cupón 'BIENVENIDA' solo es válido para clientes nuevos. [type=value_error, input_value={'fecha_entrada': date(2026...NIDA'}, input_type=dict]
    """

```

### Validación cruzada con exclusión mutua (`XOR`)

Otro caso de uso indispensable es garantizar que el usuario envíe **exactamente una** de dos opciones posibles, pero nunca ambas a la vez ni ninguna en absoluto.

```python
class IdentificacionUsuario(BaseModel):
    dni: Optional[str] = None
    pasaporte: Optional[str] = None

    @model_validator(mode='after')
    def verificar_identificador_unico(self) -> 'IdentificacionUsuario':
        # Validación de exclusión mutua usando operadores lógicos
        if not self.dni and not self.pasaporte:
            raise ValueError("Debes proporcionar al menos un documento (dni o pasaporte).")
            
        if self.dni and self.pasaporte:
            raise ValueError("No puedes proporcionar dni y pasaporte simultáneamente. Elige uno.")
            
        return self

```

> **Buenas prácticas de diseño:** Mantén las validaciones de formato (expresiones regulares, longitudes mínimas) dentro de `@field_validator` o restricciones de `Field()`. Reserva el espacio de `@model_validator` exclusivamente para resolver la lógica de interacción que acabamos de estudiar en esta sección.
>
## 6.3. Modificación de datos

Además de inspeccionar y validar la información, el decorador `@model_validator` posee la capacidad de alterar los atributos de un modelo durante el proceso de inicialización. Esto es sumamente útil para normalizar campos en base a criterios globales, inyectar valores calculados dinámicamente o sanear cadenas de texto de manera uniforme.

Dependiendo de si utilizas el modo `before` o el modo `after`, la mecánica para modificar los datos cambia radicalmente debido al estado en el que se encuentra la información.

### Modificación en modo "after" (Instancia formada)

Cuando trabajas con `mode='after'`, el validador recibe la instancia física (`self`). Tienes la libertad de mutar directamente sus atributos antes de que el objeto sea devuelto al flujo del programa, siempre y cuando el modelo no esté configurado como congelado (`frozen=True`).

Un escenario típico es el cálculo automático de campos derivados o la sincronización forzada de estados internos.

```python
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, model_validator

class BitacoraEvento(BaseModel):
    evento: str
    fecha_creacion: Optional[datetime] = None
    urgente: bool = False

    @model_validator(mode='after')
    def normalizar_y_calcular_campos(self) -> 'BitacoraEvento':
        # 1. Mutación de un campo existente: Pasar el texto a mayúsculas
        self.evento = self.evento.strip().upper()
        
        # 2. Inyección dinámica: Si no se provee fecha, se asigna la actual
        if self.fecha_creacion is None:
            self.fecha_creacion = datetime.now()
            
        # 3. Lógica cruzada con alteración de datos: Escalar urgencia por palabra clave
        if "CRÍTICO" in self.evento or "ERROR" in self.evento:
            self.urgente = True
            
        return self

```

Si instanciamos este modelo omitiendo la fecha y pasando el evento en minúsculas, observamos cómo el objeto se autocompleta y sanea de forma automática:

```python
registro = BitacoraEvento(evento="  error de conexion en base de datos  ")

print(registro.evento)          # Salida: 'ERROR DE CONEXION EN BASE DE DATOS'
print(registro.fecha_creacion)  # Salida: 2026-05-21 02:18:01 (Fecha y hora actual)
print(registro.urgente)         # Salida: True (Forzado por la palabra 'ERROR')

```

### Modificación en modo "before" (Diccionario crudo)

El modo `after` funciona perfectamente para reescribir propiedades existentes, pero tiene una limitación: si el usuario introduce un dato con una estructura completamente ajena o si deseas añadir campos que el constructor original rechazaría por falta de coincidencia de tipos, necesitas interceptar el proceso **antes** de la creación de la instancia.

En `mode='before'`, la función actúa como un método de clase (`@classmethod`). Recibe un diccionario (o cualquier tipo de datos de entrada estructurado) y debe **retornar un nuevo diccionario** adaptado a lo que el modelo espera recibir.

```python
from pydantic import BaseModel, model_validator

class ConfiguracionSistema(BaseModel):
    url_host: str
    puerto: int
    modo_depuracion: bool

    @model_validator(mode='before')
    @classmethod
    def adaptar_datos_antiguos(cls, data: any) -> any:
        # Si recibimos un formato plano heredado (legacy), lo reestructuramos
        if isinstance(data, dict) and "direccion_antigua" in data:
            cadena_conexion = data.pop("direccion_antigua") # Ej: "localhost:8080"
            partes = cadena_conexion.split(":")
            
            # Reinyectamos los datos adaptados al formato del nuevo modelo
            data["url_host"] = partes[0]
            data["puerto"] = int(partes[1])
            data["modo_depuracion"] = data.get("debug", False)
            
        return data

```

Gracias a esta interceptación previa, el modelo es capaz de inicializarse sin problemas utilizando tanto la interfaz moderna como la estructura obsoleta:

```python
# Inicialización estándar
config_nueva = ConfiguracionSistema(url_host="api.com", puerto=443, modo_depuracion=True)

# Inicialización usando la estructura antigua gracias al validador 'before'
datos_legado = {
    "direccion_antigua": "127.0.0.1:9000",
    "debug": True
}
config_antigua = ConfiguracionSistema(**datos_legado)

print(config_antigua.url_host)  # Salida: '127.0.0.1'
print(config_antigua.puerto)    # Salida: 9000

```

### Comparativa de flujos de modificación

Para visualizar cuándo es más conveniente aplicar cada tipo de transformación, analiza el siguiente cuadro conceptual:

```text
[Datos Crudos del Usuario]
           │
           ├──► [ mode='before' ]: Ideal para cambiar la estructura del dict,
           │                       renombrar claves heredadas o parsear texto libre.
           ▼
[Validación de Tipos de Pydantic]
           │
           ├──► [ mode='after' ]: Ideal para estandarizar strings de campos válidos,
           │                      calcular totales y derivar banderas lógicas.
           ▼
[Instancia Definitiva Generada]

```

## 6.4. Validación en modo Before

El decorador `@model_validator(mode='before')` es la primera línea de defensa de Pydantic. A diferencia del modo `after`, que opera sobre una instancia estructurada y limpia, el modo `before` se ejecuta **antes de que ocurra cualquier proceso de tipado o validación interna**.

Esta herramienta intercepta los datos en su estado más primitivo (generalmente diccionarios, pero también objetos arbitrarios si se trabaja con el modo `from_attributes`), dándote el control absoluto para inspeccionar, reestructurar o rechazar la información antes de que Pydantic intente parsearla.

### Cuándo utilizar el modo Before

El uso de `mode='before'` es indispensable en escenarios de infraestructura y compatibilidad donde los datos de origen no se alinean con la arquitectura del modelo. Sus principales casos de uso son:

1. **Estandarización de payloads heterogéneos:** Cuando una API consume datos de múltiples clientes que envían la misma información estructurada de formas sutilmente distintas.
2. **Pre-validación estricta de estructura:** Validar la existencia de combinaciones de claves de forma previa a que Pydantic dispare múltiples errores individuales de tipo `missing`.
3. **Descompresión o deserialización personalizada:** Si los datos llegan empaquetados en una cadena codificada (como una firma JWT o un string separado por comas) y requieres expandirlos en un diccionario estructurado.

### Reglas de implementación

Debido a que el modelo físico aún no existe en esta fase del ciclo de vida, las funciones decoradas con `mode='before'` deben seguir un protocolo estricto:

* **Métodos de clase:** Deben ser declarados obligatoriamente utilizando el decorador `@classmethod` de Python.
* **Primer argumento:** El primer parámetro convencional es `cls` (la clase del modelo), seguido por la variable que contiene los datos de entrada (comúnmente llamada `data` u `obj`).
* **Tipo de dato de entrada:** La firma del método debe asumir que `data` puede ser de tipo `Any`, ya que el usuario podría pasar por error una lista, una cadena o un entero en lugar de un diccionario.
* **Obligación de retorno:** Deben retornar el diccionario transformado o el objeto que Pydantic procesará a continuación.

```python
from typing import Any, Dict
from pydantic import BaseModel, model_validator

class TransaccionBancaria(BaseModel):
    monto: float
    divisa: str
    referencia: str

    @model_validator(mode='before')
    @classmethod
    def pre_procesar_y_validar_datos(cls, data: Any) -> Any:
        # Garantizar que los datos de entrada sean un diccionario estructurado
        if not isinstance(data, dict):
            raise ValueError("Los datos de entrada para la transacción deben ser un objeto válido.")

        # Manejo de formatos alternativos (Normalización)
        # Permite procesar un payload donde el monto viene como {'cantidad': 50, 'moneda': 'USD'}
        if "valores_monetarios" in data:
            valores = data.pop("valores_monetarios")
            if isinstance(valores, dict):
                data["monto"] = valores.get("cantidad")
                data["divisa"] = valores.get("moneda")

        # Validación estructural previa
        if not data.get("referencia"):
            raise ValueError("Toda transacción requiere un código de referencia obligatorio antes de procesarse.")

        return data

```

### Comportamiento del manejo de excepciones

A diferencia del modo `after` —donde los errores de formato individuales cancelan la ejecución del validador de modelo—, cualquier error lanzado dentro de un `model_validator(mode='before')` abortará el proceso de inmediato, impidiendo que Pydantic genere errores para los campos individuales.

```python
# Caso 1: Los datos no son un diccionario
try:
    TransaccionBancaria("No soy un diccionario")
except Exception as e:
    print(e)
    """
    1 validation error for TransaccionBancaria
      Value error, Los datos de entrada para la transacción deben ser un objeto válido. [type=value_error, input_value='No soy un diccionario', input_type=str]
    """

# Caso 2: Falta la referencia (Fallo estructural previo)
try:
    TransaccionBancaria(monto=150.50, divisa="EUR", referencia="")
except Exception as e:
    print(e)
    """
    1 validation error for TransaccionBancaria
      Value error, Toda transacción requiere un código de referencia obligatorio antes de procesarse. [type=value_error, input_value={'monto': 150.5, 'divisa': 'EUR', 'referencia': ''}, input_type=dict]
    """

```

## Resumen del capítulo

En este capítulo hemos profundizado en la validación global a nivel de modelo mediante el decorador `@model_validator`, dominando las herramientas necesarias para asegurar la consistencia total de la información en Pydantic V2.

* **Ciclo de vida y modos:** Aprendimos que la validación a nivel de modelo se divide en dos fases fundamentales: el modo `before` (ejecutado como método de clase sobre los datos crudos de entrada) y el modo `after` (ejecutado como método de instancia sobre los datos ya parseados).
* **Validaciones cruzadas:** Analizamos cómo comparar múltiples atributos de forma simultánea para implementar reglas de negocio complejas, tales como rangos numéricos/cronológicos consistentes y relaciones de exclusión mutua (`XOR`).
* **Mutación y normalización:** Descubrimos las técnicas para alterar la información en tránsito, ya sea reestructurando diccionarios antiguos en el bloque `before`, o limpiando y calculando campos derivados sobre `self` en el bloque `after`.
* **Gestión del flujo:** Comprendimos cómo interactúan estos validadores con el motor de Pydantic, reconociendo que el modo `after` protege la ejecución al no dispararse si existen fallas de tipado previas, mientras que el modo `before` intercepta de manera incondicional cualquier entrada al sistema.
