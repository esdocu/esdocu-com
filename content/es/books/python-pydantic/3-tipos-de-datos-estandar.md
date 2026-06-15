Este capítulo examina cómo Pydantic aprovecha las anotaciones de tipo nativas de Python (`type hints`) para automatizar la validación y la coerción de datos. A lo largo de estas secciones, aprenderás el comportamiento del modo laxo frente a tipos primitivos como cadenas, enteros, flotantes y booleanos, así como la gestión avanzada de estructuras complejas: listas, tuplas, conjuntos y diccionarios tipados (`TypedDict`). Finalmente, dominarás el control de la ausencia de datos mediante tipos opcionales y la restricción estricta de valores mediante literales, garantizando la consistencia y robustez de tus modelos de datos.

## 3.1. Tipos primitivos en Python

Pydantic se basa en las anotaciones de tipo estándar de Python (`type hints`) para realizar una de sus funciones más potentes: la **coerción de tipos** (atribución o conversión automática de tipos). Cuando defines un campo en un modelo con un tipo primitivo, Pydantic no solo verifica que el dato de entrada sea de ese tipo, sino que intenta transformarlo de forma segura si es posible.

Por defecto, Pydantic opera en **modo laxo** (`lax mode`), lo que significa que prioriza la flexibilidad y la interpretación inteligente de los datos de entrada para ajustarlos al tipo primitivo declarado.

Los cuatro tipos primitivos principales que maneja Pydantic son:

* **`str`**: Cadenas de texto.
* **`int`**: Números enteros.
* **`float`**: Números de punto flotante.
* **`bool`**: Valores booleanos (verdadero/falso).

### Comportamiento de Coerción por Tipo

El siguiente flujo resume la estrategia que sigue Pydantic cuando recibe un dato para un tipo primitivo en modo laxo:

```text
[Dato de Entrada]
       │
       ├─► ¿Coincide exactamente con el tipo? ──► [Aceptado]
       │
       └─► ¿Se puede coercionar de forma segura?
                 │
                 ├─► Sí ──► [Convertido y Aceptado]
                 │
                 └─► No ──► [ValidationError]

```

#### 1. Cadenas de texto (`str`)

Pydantic acepta strings de forma directa. Si recibe valores numéricos (`int` o `float`), los coercionará automáticamente a su representación en cadena de texto. Sin embargo, no aceptará estructuras complejas como diccionarios o listas.

#### 2. Números enteros (`int`)

Acepta enteros directamente. Si se proporciona un `float`, Pydantic **truncará la parte decimal** (por ejemplo, `3.9` se convertirá en `3`). Si recibe un `str`, intentará parsearlo como entero si la cadena contiene una representación numérica válida (por ejemplo, `"42"` se convierte en `42`). Las cadenas con decimales (como `"3.14"`) causarán un error de validación al intentar convertirse en entero.

#### 3. Números de punto flotante (`float`)

Acepta enteros y flotantes. Las cadenas de texto que representen números (tanto enteros como decimales, por ejemplo `"12.34"` o `"5"`) se convertirán automáticamente a `float`.

#### 4. Valores booleanos (`bool`)

Es uno de los tipos más flexibles en modo laxo. Pydantic interpreta un amplio abanico de entradas para resolverlas como verdaderas o falsas:

* **Valores verdaderos (`True`)**: `True`, las cadenas `"true"`, `"t"`, `"yes"`, `"y"`, `"on"`, y el entero `1`.
* **Valores falsos (`False`)**: `False`, las cadenas `"false"`, `"f"`, `"no"`, `"n"`, `"off"`, el entero `0`, y el flotante `0.0`.

*(Nota: Las variaciones de mayúsculas y minúsculas en las cadenas mencionadas, como `"True"` o `"YES"`, también son válidas).*

---

### Ejemplo Práctico de Coerción

A continuación, se muestra cómo un único modelo de Pydantic procesa entradas de distintos tipos mediante la conversión automática:

```python
from pydantic import BaseModel, ValidationError

class PerfilUsuario(BaseModel):
    nombre: str
    edad: int
    saldo: float
    activo: bool

# Datos de entrada crudos con tipos "incorrectos" pero coercionables
datos_laxos = {
    "nombre": 12345,       # int -> se convertirá a str '12345'
    "edad": "28",          # str -> se convertirá a int 28
    "saldo": "1500.75",    # str -> se convertirá a float 1500.75
    "activo": "yes"        # str -> se convertirá a bool True
}

usuario = PerfilUsuario(**datos_laxos)

print("Instancia creada con éxito:")
print(f"nombre: {repr(usuario.nombre)} (tipo: {type(usuario.nombre).__name__})")
print(f"edad: {usuario.edad} (tipo: {type(usuario.edad).__name__})")
print(f"saldo: {usuario.saldo} (tipo: {type(usuario.saldo).__name__})")
print(f"activo: {usuario.activo} (tipo: {type(usuario.activo).__name__})")

```

Si ejecutas este código, la salida demostrará que todos los atributos se han transformado a sus tipos primitivos correctos sin lanzar ninguna excepción.

---

### Casos de Falla Comunes

La coerción tiene límites lógicos para evitar la corrupción o pérdida ambigua de información. El siguiente fragmento expone escenarios donde Pydantic detiene la ejecución y lanza un `ValidationError`:

```python
# 1. Intentar pasar un string no numérico a un entero
try:
    PerfilUsuario(nombre="Ana", edad="veintiocho", saldo=100.0, activo=True)
except ValidationError as e:
    print("Error en 'edad': No se puede convertir una palabra en número.")

# 2. Intentar pasar una cadena flotante a un entero directamente
try:
    PerfilUsuario(nombre="Ana", edad="28.5", saldo=100.0, activo=True)
except ValidationError as e:
    print("Error en 'edad': Cadenas con decimales no se coercionan a int.")

# 3. Intentar pasar un valor booleano ambiguo
try:
    PerfilUsuario(nombre="Ana", edad=28, saldo=100.0, activo="tal vez")
except ValidationError as e:
    print("Error en 'activo': 'tal vez' no es un booleano reconocible.")

```

### Introducción al Modo Estricto (`strict mode`)

Aunque el comportamiento por defecto es laxo, Pydantic permite activar el modo estricto, ya sea a nivel de campo o a nivel global del modelo (esto último se detalla más adelante en el capítulo 12).

En modo estricto, Pydantic **cancela la coerción de tipos** y exige que el valor de entrada coincida de manera exacta con el tipo primitivo anotado. El único comportamiento permisible en modo estricto es que un campo de tipo `float` acepte un valor de tipo `int` (por ejemplo, pasar `10` a un campo `float` dará como resultado `10.0`), ya que no existe riesgo de pérdida de precisión matemática. Cualquier otra conversión, como enviar `"28"` para un `int`, fallará de inmediato.

## 3.2. Listas, tuplas y conjuntos

Pydantic extiende su capacidad de validación y coerción hacia las estructuras de datos nativas de Python que actúan como contenedores de colecciones: **listas (`list`)**, **tuplas (`tuple`)** y **conjuntos (`set` o `frozenset`)**.

A partir de Python 3.9+, puedes tipar estas colecciones directamente utilizando los tipos integrados en minúsculas combinados con corchetes (por ejemplo, `list[int]`). Pydantic inspeccionará de forma recursiva cada elemento dentro del contenedor para asegurar que cumpla con el tipo primitivo o complejo especificado.

### Comportamiento de Coerción de Contenedores

Al igual que ocurre con los tipos primitivos individuales, Pydantic opera por defecto en modo laxo para las colecciones. Esto implica un doble proceso de adaptación:

1. **Coerción de la estructura:** Si pasas un tipo iterable que no coincide exactamente con el tipo de colección declarado, Pydantic intentará transformarlo al contenedor correcto. Por ejemplo, si un campo espera un `list` y recibe un `set` o una `tuple`, lo convertirá automáticamente en una lista.
2. **Coerción de los elementos:** Una vez garantizado el contenedor, Pydantic iterará sobre cada elemento interno aplicando las reglas de conversión explicadas en la sección anterior (por ejemplo, transformando el string `"123"` a un entero `123` si la definición es `list[int]`).

```text
[Datos de Entrada: ("1", 2, "3")] ──► ¿Es iterable? ──► Sí
         │
         ▼
[Aplicar conversión de contenedor] ──► Transformar Tuple a List ──► [ "1", 2, "3" ]
         │
         ▼
[Validar elementos uno a uno]      ──► Coercionar cada elemento  ──► [ 1, 2, 3 ]

```

---

### Tipado y Restricciones Específicas

#### 1. Listas (`list[...]`)

Representan secuencias mutables y ordenadas. Pydantic acepta cualquier iterable (excepto diccionarios y cadenas de texto directamente, para evitar la fragmentación accidental de caracteres) y genera una lista nativa de Python.

#### 2. Conjuntos (`set[...]` y `frozenset[...]`)

Representan colecciones de elementos únicos sin un orden específico. Si los datos de entrada contienen elementos duplicados, Pydantic los filtrará automáticamente para cumplir con las propiedades de un conjunto físico, reteniendo únicamente los valores únicos tras haber aplicado la coerción individual.

> **Nota sobre Mutabilidad:** Recuerda que un `set` es mutable, mientras que un `frozenset` es inmutable. Pydantic preservará esta distinción devolviendo el objeto nativo correspondiente según tu anotación.

#### 3. Tuplas (`tuple[...]`)

Las tuplas admiten dos variantes de tipado muy distintas en Python, y Pydantic las procesa siguiendo reglas rigurosas para cada caso:

* **Tuplas de tamaño variable (Homogéneas):** Se definen usando la elipsis (`...`). Por ejemplo, `tuple[int, ...]` le indica a Pydantic que la tupla puede recibir cualquier cantidad de elementos, pero todos deben poder convertirse a enteros.
* **Tuplas de tamaño fijo (Heterogéneas):** Se definen enumerando explícitamente el tipo de cada posición. Por ejemplo, `tuple[int, str, bool]` obliga a que la entrada tenga **exactamente tres elementos** y que el primero sea convertible a entero, el segundo a cadena y el tercero a booleano. Si la longitud no coincide, se arrojará un error de validación.

---

### Ejemplo Práctico de Colecciones

El siguiente script ilustra cómo interactúa Pydantic con las distintas colecciones, sus conversiones automáticas y las validaciones de posición en las tuplas estructurales:

```python
from pydantic import BaseModel, ValidationError

class ColeccionDatos(BaseModel):
    id_lista: list[int]
    etiquetas_unicas: set[str]
    coordenada_fija: tuple[float, float]
    historial_flexible: tuple[int, ...]

# Datos heterogéneos y laxos
datos_entrada = {
    # Se envía una tupla de strings numéricos; se convertirá en list[int]
    "id_lista": ("101", "102", "103"),
    
    # Se envía una lista con elementos duplicados; se convertirá en un set de elementos únicos
    "etiquetas_unicas": ["admin", "usuario", "admin", "moderador"],
    
    # Tupla de tamaño fijo: se envían enteros que pasarán a floats
    "coordenada_fija": (19, -43),
    
    # Tupla variable: cualquier longitud es válida mientras sean coercionables a int
    "historial_flexible": [1, "2", 3, "4", 5]
}

instancia = ColeccionDatos(**datos_entrada)

print("Estructuras procesadas:")
print(f"id_lista: {instancia.id_lista} (Tipo: {type(instancia.id_lista).__name__})")
print(f"etiquetas_unicas: {instancia.etiquetas_unicas} (Tipo: {type(instancia.etiquetas_unicas).__name__})")
print(f"coordenada_fija: {instancia.coordenada_fija} (Tipo: {type(instancia.coordenada_fija).__name__})")
print(f"historial_flexible: {instancia.historial_flexible} (Tipo: {type(instancia.historial_flexible).__name__})")

```

---

### Escenarios de Error Comunes

Las colecciones fallarán de forma inmediata si la estructura interna no se puede procesar o si el número de elementos de una tupla fija es incorrecto. El subproceso de validación detiene el ciclo y reporta exactamente el índice del elemento problemático:

```python
# 1. Error de longitud en tupla fija
try:
    ColeccionDatos(
        id_lista=[1], 
        etiquetas_unicas={"ok"}, 
        coordenada_fija=(12.5, 45.0, 88.1), # Tres elementos en lugar de dos
        historial_flexible=(1,)
    )
except ValidationError as e:
    print("Error: La tupla fija exige exactamente 2 elementos.")

# 2. Error de conversión en un índice interno de la lista
try:
    ColeccionDatos(
        id_lista=[10, "no_soy_un_numero", 30], # El segundo elemento fallará
        etiquetas_unicas={"ok"}, 
        coordenada_fija=(12.5, 45.0), 
        historial_flexible=(1,)
    )
except ValidationError as e:
    # Pydantic indicará en su reporte que el error está específicamente en 'id_lista -> 1'
    print("Error detectado en el índice específico de la lista.")

```

## 3.3. Diccionarios tipados

Pydantic ofrece un soporte nativo completo para validar estructuras basadas en diccionarios. En el ecosistema de Python, existen dos formas principales de abordar el tipado de mapas clave-valor: el tipo genérico estándar **`dict[K, V]`** y la clase especializada **`TypedDict`** (introducida en `typing`).

Mientras que `dict[K, V]` define un diccionario homogéneo donde todas las llaves tienen el mismo tipo y todos los valores comparten la misma naturaleza, `TypedDict` te permite estructurar diccionarios heterogéneos con llaves fijas y tipos específicos para cada una de ellas, actuando como un paso intermedio entre un diccionario convencional y un modelo completo de Pydantic.

### Validando Diccionarios Estándar (`dict[K, V]`)

Cuando declaras un campo utilizando `dict[Clave, Valor]`, Pydantic valida de forma independiente tanto las claves como los valores del mapa. Si el origen es un objeto JSON (donde las llaves son obligatoriamente cadenas de texto), Pydantic aplicará las reglas de coerción correspondientes sobre la clave para convertirla al tipo nativo deseado (por ejemplo, de `"101"` a `101` si se define `dict[int, str]`).

```python
from pydantic import BaseModel, ValidationError

class CatalogoProductos(BaseModel):
    # Claves enteras y valores en cadena de texto
    inventario: dict[int, str]

# Datos de entrada con llaves string que representan números
datos = {"inventario": {"1": "Teclado", "2": "Ratón"}}
catalogo = CatalogoProductos(**datos)

print(catalogo.inventario)  # Resultado: {1: 'Teclado', 2: 'Ratón'}

```

---

### Integración con `TypedDict`

A diferencia de `dict[K, V]`, un `TypedDict` restringe qué llaves exactas pueden existir y qué tipo de dato debe albergar cada una. Pydantic respeta esta firma, permitiéndote anidar diccionarios tipados dentro de tus modelos sin necesidad de transformar cada objeto intermedio en un `BaseModel` independiente.

Esto resulta muy útil cuando trabajas con código heredado (*legacy*) o APIs que devuelven estructuras JSON fijas y no deseas poblar tu arquitectura con excesivas clases de Pydantic.

```text
       [Diccionario de Entrada]
                  │
                  ▼ (Pydantic inspecciona la estructura)
   ┌──────────────────────────────────────────────┐
   │ ¿Contiene todas las llaves obligatorias?     │──► No ──► [ValidationError]
   └──────────────────────────────────────────────┘
                  │ Sí
                  ▼
   ┌──────────────────────────────────────────────┐
   │ ¿Los valores se pueden coercionar a los     │──► No ──► [ValidationError]
   │ tipos definidos en el TypedDict?             │
   └──────────────────────────────────────────────┘
                  │ Sí
                  ▼
         [Diccionario Validado]

```

#### Reglas de obligatoriedad en `TypedDict`

Por defecto en Python, todas las llaves definidas en un `TypedDict` son obligatorias a menos que se configure el parámetro `total=False` en la declaración de la clase, o se utilice el modificador `NotRequired` (disponible en `typing` o `typing_extensions`). Pydantic obedece de forma estricta esta especificación durante el proceso de análisis y parsing.

---

### Ejemplo Práctico con `TypedDict`

El siguiente ejemplo demuestra cómo declarar un `TypedDict`, incorporarle restricciones de opcionalidad mediante `NotRequired`, y utilizarlo como anotación de tipo dentro de un modelo principal de Pydantic:

```python
from typing import TypedDict
from typing_extensions import NotRequired  # Para compatibilidad en versiones previas a Python 3.11
from pydantic import BaseModel, ValidationError

# Definición de la estructura del diccionario tipado
class DimensionesMeta(TypedDict):
    ancho: float
    alto: float
    unidad: NotRequired[str]  # Esta llave puede ser omitida sin lanzar error

class ElementoGrafico(BaseModel):
    id: int
    propiedades: DimensionesMeta

# 1. Caso de éxito: Coerción interna y omisión de campo opcional
datos_validos = {
    "id": 42,
    "propiedades": {
        "ancho": "1920",  # Se coercionará a float 1920.0
        "alto": 1080      # Se coercionará a float 1080.0
        # 'unidad' se omite de forma válida
    }
}

grafico = ElementoGrafico(**datos_validos)
print("Estructura TypedDict validada:")
print(f"Propiedades: {grafico.propiedades} (Tipo: {type(grafico.propiedades).__name__})")

# 2. Caso de falla: Falta una llave obligatoria dentro del TypedDict
datos_invalidos = {
    "id": 43,
    "propiedades": {
        "ancho": 800.0
        # Falta la llave obligatoria 'alto'
    }
}

try:
    ElementoGrafico(**datos_invalidos)
except ValidationError as e:
    print("\nError de validación capturado:")
    # Pydantic apuntará la ruta exacta del error: propiedades -> alto
    print(e)

```

---

### Comportamiento frente a Llaves Extrañas

Si un diccionario de entrada incluye llaves adicionales que no están presentes en la definición del `TypedDict`, Pydantic adoptará un comportamiento conservador por defecto: **preservará e incluirá las llaves extra** en el diccionario final sin validarlas.

Este comportamiento difiere de cómo gestiona Pydantic los campos adicionales directamente introducidos en un `BaseModel` (donde las propiedades extra suelen descartarse de manera silenciosa por defecto). Si necesitas alterar esta directiva para rechazar o eliminar datos excedentes en diccionarios, requerirás la configuración explícita del modelo a través de `ModelConfig`, aspecto que se detalla exhaustivamente en la tercera parte de esta documentación.

## 3.4. Tipos Opcionales (Optional)

En el desarrollo de software, es sumamente común que ciertos datos sean desconocidos, no apliquen o simplemente no se proporcionen. En Python, la ausencia de un valor se representa mediante el objeto `None`. Para declarar que un campo puede aceptar un tipo específico o, en su defecto, el valor `None`, Pydantic se apoya en los estándares de tipado del lenguaje.

A partir de Python 3.10+, la forma nativa y recomendada de declarar un tipo opcional es utilizando el operador de unión **`|`** (por ejemplo, `str | None`). En versiones anteriores, se utiliza el modificador **`Optional[...]`** importado del módulo `typing` (por ejemplo, `Optional[str]`). Ambas sintaxis son idénticas ante los ojos de Pydantic.

### La Distinción Crítica: Opcional vs. Valor Predeterminado

Existe una confusión muy frecuente al empezar a utilizar Pydantic: asumir que declarar un campo como `Optional` lo convierte automáticamente en un campo *no obligatorio* al inicializar el modelo. **Esto es falso.**

* **Anotación de Tipo (`str | None`):** Define qué *clase de datos* se permiten dentro del campo una vez se crea el modelo. Le indica a Pydantic: *"Si me pasas un dato, puede ser un string o puede ser None"*.
* **Valor por Defecto (`= None`):** Define si el campo es *requerido* o no en el momento de la construcción. Le indica a Pydantic: *"Si no te pasan este parámetro, inicialízalo con este valor"*.

El siguiente diagrama ilustra la matriz de comportamiento resultante de combinar ambas propiedades:

```text
                          ¿Tiene valor por defecto? (= None)
                                 SÍ                  NO
                       ┌───────────────────┬───────────────────┐
                    SÍ │  Campo Opcional   │  Campo Obligatorio│
                       │ Permite 'None'    │ Permite 'None'    │
¿Tipo acepta None?     │ NO requiere llave │ REQUIERE llave    │
(ej. str | None)       ├───────────────────┼───────────────────┤
                    NO │ Campo NO Opcional │ Campo Obligatorio│
                       │ NO permite 'None' │ NO permite 'None' │
                       │ NO requiere llave │ REQUIERE llave    │
                       └───────────────────┴───────────────────┘

```

---

### Ejemplo Práctico de Configuraciones Opcionales

El siguiente modelo de Pydantic demuestra de manera práctica los cuatro comportamientos de la matriz anterior, forzando los errores de validación para entender los límites de cada definición:

```python
from typing import Optional
from pydantic import BaseModel, ValidationError

class RegistroDispositivo(BaseModel):
    # Caso 1: Opcional verdadero (Sintaxis moderna)
    # No es obligatorio pasar la llave; si se pasa, acepta None o str.
    alias: str | None = None

    # Caso 2: Obligatorio pero acepta None (Sintaxis tradicional con Optional)
    # REQUIERE la llave en la entrada, aunque su valor explícito sea None.
    propietario: Optional[str]

    # Caso 3: Obligatorio estricto
    # REQUIERE la llave y jamás aceptará un valor None.
    direccion_ip: str

# 1. Ejecución Exitosa: Cumpliendo las exigencias de presencia y nulidad
datos_validos = {
    "propietario": None,         # Llave presente cumpliendo con 'Optional'
    "direccion_ip": "192.168.1.1" # Llave presente con tipo correcto
    # 'alias' se omite de forma segura; tomará el valor por defecto None
}

dispositivo = RegistroDispositivo(**datos_validos)
print("Dispositivo registrado con éxito:")
print(f" -> alias: {dispositivo.alias}")
print(f" -> propietario: {dispositivo.propietario}")
print(f" -> direccion_ip: {dispositivo.direccion_ip}\n")

# 2. Casos de Falla Comunes para comprender la diferencia

# Falla A: Omitir una llave obligatoria que acepta None ('propietario')
try:
    RegistroDispositivo(direccion_ip="10.0.0.5")
except ValidationError as e:
    print("Error Falla A (Llave ausente):")
    # Pydantic avisa: "Field required" para 'propietario'
    print(e.errors()[0]["msg"])

# Falla B: Pasar None a un campo obligatorio que NO acepta None ('direccion_ip')
try:
    RegistroDispositivo(propietario="Carlos", direccion_ip=None)
except ValidationError as e:
    print("\nError Falla B (Valor None no permitido):")
    # Pydantic avisa: "Input should be a valid string" para 'direccion_ip'
    print(e.errors()[0]["msg"])

```

---

### Comportamiento de Coerción con Tipos de Unión

Cuando utilizas una unión que incluye un tipo primitivo y `None` (como `int | None`), Pydantic aplica las reglas de la siguiente manera:

1. Si el valor de entrada es exactamente `None`, se asigna de inmediato sin alterar nada.
2. Si el valor es cualquier otra cosa (por ejemplo, el string `"100"`), Pydantic intentará realizar la coerción hacia el tipo primitivo indicado (transformándolo en el entero `100`).
3. Solo si la coerción hacia el tipo primitivo falla por completo (por ejemplo, enviando `"hola"` a un `int | None`), se disparará un `ValidationError`. El valor no se degradará a `None` de forma automática solo porque la conversión falló; Pydantic prefiere la seguridad y te notificará que el dato original no era válido.

## 3.5. Tipos literales (Literal)

El tipo **`Literal`** (importado del módulo estándar `typing`) te permite restringir el valor de un campo a una serie de opciones exactas y predefinidas. A diferencia de un tipo primitivo como `str`, que acepta cualquier cadena de texto, un campo anotado como `Literal["Lectura", "Escritura"]` solo aceptará de forma válida una de esas dos palabras exactas.

En el ecosistema de Pydantic, `Literal` es una herramienta fundamental para validar esquemas de datos rígidos, configurar enumeraciones rápidas sin necesidad de recurrir a la estructura formal de un `Enum` de Python, y actuar como el mecanismo clave para el **despacho discriminado de modelos** (identificar automáticamente qué submodelo usar basándose en el valor de una llave).

### Coerción y Rigidez en Tipos Literales

A diferencia del comportamiento altamente flexible que Pydantic muestra con los tipos primitivos (como transformar `"yes"` en `True`), con los tipos `Literal` se aplica una política de validación **mucho más estricta**, incluso operando en el modo laxo por defecto.

* **Sensibilidad a mayúsculas y minúsculas:** Las cadenas de texto se evalúan de forma exacta. Si defines `Literal["pendiente"]`, la entrada `"Pendiente"` o `"PENDIENTE"` fallará la validación.
* **Coerción inteligente limitada:** Pydantic no realizará transformaciones que alteren la naturaleza semántica del literal. Sin embargo, si el valor esperado es un número o un booleano (por ejemplo, `Literal[1, 2]`), e ingresas una cadena numéricamente equivalente como `"1"`, Pydantic aplicará la coerción básica del tipo primitivo antes de evaluar la coincidencia con las opciones del literal.

```text
       [Dato de Entrada]
               │
               ▼ (Pydantic evalúa las opciones)
  ┌─────────────────────────────────────────────────────────┐
  │ ¿Coincide exactamente con alguno de los valores del     │──► Sí ──► [Aceptado]
  │ bloque Literal[ opción_1, opción_2, ... ] ?             │
  └─────────────────────────────────────────────────────────┘
               │ No
               ▼
      [ValidationError]

```

---

### Ejemplo Práctico de Tipos Literales

El siguiente script ejemplifica cómo configurar opciones obligatorias mediante `Literal`, la rigidez de su validación ante variaciones de texto y el comportamiento de la coerción numérica:

```python
from typing import Literal
from pydantic import BaseModel, ValidationError

class ControlAcceso(BaseModel):
    # Restringido a tres cadenas de texto específicas
    rol: Literal["administrador", "editor", "lector"]
    
    # Restringido a opciones numéricas o booleanas exactas
    nivel_seguridad: Literal[1, 2, 3]

# 1. Caso de éxito: Coincidencia exacta y coerción permitida
datos_validos = {
    "rol": "editor",
    "nivel_seguridad": "2"  # El string "2" se coerciona al entero 2 y coincide con el Literal
}

acceso = ControlAcceso(**datos_validos)
print("Acceso configurado con éxito:")
print(f" -> Rol: {acceso.rol}")
print(f" -> Nivel: {acceso.nivel_seguridad}\n")

# 2. Casos de falla por incumplimiento del Literal

# Falla A: Error por capitalización (Mayúsculas/Minúsculas)
try:
    ControlAcceso(rol="Administrador", nivel_seguridad=1)
except ValidationError as e:
    print("Error Falla A (Capitalización):")
    # Pydantic informará: "Input should be 'administrador', 'editor' or 'lector'"
    print(e.errors()[0]["msg"])

# Falla B: Valor fuera de las opciones permitidas
try:
    ControlAcceso(rol="lector", nivel_seguridad=5)
except ValidationError as e:
    print("\nError Falla B (Valor inexistente):")
    # Pydantic informará: "Input should be 1, 2 or 3"
    print(e.errors()[0]["msg"])

```

## Resumen del Capítulo

En este **Capítulo 3: Tipos de Datos Estándar**, hemos explorado en profundidad la capacidad intrínseca de Pydantic para interpretar, transformar y validar la información entrante utilizando las anotaciones de tipo estándar de Python.

* **Tipos Primitivos:** Analizamos cómo funciona el **modo laxo** corporativo de Pydantic, aplicando reglas de coerción automática y segura sobre cadenas (`str`), enteros (`int`), flotantes (`float`) y booleanos (`bool`), estableciendo los límites lógicos para evitar la corrupción de datos.
* **Colecciones:** Estudiamos la validación recursiva en contenedores homogéneos y heterogéneos utilizando **listas, tuplas y conjuntos**, destacando el comportamiento estricto de posicionamiento y tamaño en las tuplas fijas.
* **Diccionarios Tipados:** Evaluamos el soporte para mapas clave-valor tradicionales mediante `dict[K, V]` y la compatibilidad avanzada con estructuras **`TypedDict`**, facilitando el modelado de datos sin necesidad de instanciar múltiples submodelos.
* **Tipos Opcionales:** Desmitificamos la confusión común entre la opcionalidad de tipo (`str | None`) y la obligatoriedad de presencia en la inicialización, comprendiendo el impacto de los valores predeterminados.
* **Tipos Literales:** Concluimos con el uso de `Literal` para restringir campos a conjuntos cerrados de valores exactos, sentando las bases para validaciones estrictas y flujos de control basados en etiquetas de datos fijas.
