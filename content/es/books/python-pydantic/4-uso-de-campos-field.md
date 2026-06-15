Este capítulo profundiza en la función `Field()`, la herramienta central de Pydantic para personalizar y refinar el comportamiento de los atributos de un modelo a nivel individual. A lo largo de las siguientes secciones, aprenderás a ir más allá del simple tipado estático de Python mediante la asignación segura de valores predeterminados estáticos y dinámicos (evitando el clásico problema de los mutables en memoria). También descubriremos cómo conectar tus modelos con sistemas externos mediante el uso estratégico de alias de entrada y salida, y cómo implementar restricciones matemáticas inmediatas para blindar la integridad de tus datos numéricos de forma puramente declarativa.

## 4.1. Introducción a Field()

En los capítulos anteriores hemos visto cómo la herencia de `BaseModel` nos permite declarar esquemas de datos robustos utilizando únicamente el tipado estándar de Python. Sin embargo, cuando las necesidades de nuestro software van más allá de comprobar si un dato es un entero o una cadena, necesitamos una herramienta que nos permita intervenir directamente sobre la definición y el comportamiento de cada variable individual. Aquí es donde entra en juego la función `Field()`.

La función `Field()` de Pydantic actúa como el centro de control para la personalización de atributos dentro de un modelo. Su propósito principal es asociar metadatos adicionales y aplicar comportamientos específicos a un campo, tales como modificar la documentación del esquema, alterar los nombres de entrada/salida o inyectar restricciones inmediatas sin necesidad de escribir validadores personalizados.

### ¿Por qué utilizar Field()?

Cuando definimos un atributo de manera estándar, el margen de configuración es limitado:

```python
from pydantic import BaseModel

class Usuario(BaseModel):
    id: int
    nombre: str

```

Con este enfoque, Pydantic solo sabe que `id` debe convertirse a un entero y `nombre` a una cadena de texto. Si quisiéramos añadir una descripción técnica para documentar nuestra API, o si necesitáramos que el `id` sea siempre un número positivo, la sintaxis nativa de Python no nos ofrece una solución limpia.

`Field()` expande la declaración del atributo al interceptar el proceso de análisis (parsing) y de generación de esquemas. El siguiente diagrama en texto plano ilustra cómo se posiciona `Field()` entre la definición de un atributo y el motor interno de validación de Pydantic:

```text
Definición del Atributo
   [ nombre: str ]
         │
         ▼
 ┌───────────────┐
 │    Field()    │ ◄─── Metadatos (Descripción, ejemplos, etc.)
 └───────┬───────┘ ◄─── Restricciones (Límites numéricos, longitud, etc.)
         │
         ▼
┌────────────────────────────────────────┐
│ Motor de Pydantic (pydantic-core)      │
│  1. Convierte y valida el tipo de dato │
│  2. Aplica las reglas de Field()       │
└────────────────────────────────────────┘

```

### Sintaxis Básica e Importación

Para utilizar `Field()`, debemos importarlo directamente desde el módulo principal de `pydantic`. La función se asigna como el valor predeterminado del atributo del modelo empleando el operador `=`.

Veamos un ejemplo práctico en el que introducimos metadatos informativos a un modelo de inventario. Estos metadatos no alteran la validación del tipo de dato en sí, pero enriquecen sustancialmente el esquema JSON generado por el modelo (concepto que se explorará a fondo en el Capítulo 16):

```python
from pydantic import BaseModel, Field

class Producto(BaseModel):
    # Usando Field() para añadir documentación básica
    codigo: str = Field(
        description="Código único de inventario del producto (SKU)"
    )
    precio: float = Field(
        description="Precio de venta al público en EUR",
        examples=[19.99, 145.50]
    )

# Creación de una instancia válida
item = Producto(codigo="TSHIRT-L-BLU", precio=24.95)
print(item)
# En el esquema generado, los metadatos estarán presentes de forma estructurada
print(item.model_json_schema())

```

### El rol de Field() frente a las anotaciones de tipo

Es muy importante entender que `Field()` **no reemplaza** a las anotaciones de tipo de Python; trabaja en conjunto con ellas. Pydantic utiliza un enfoque híbrido: la anotación de tipo (a la izquierda del signo `=`) define la estructura de datos primaria, mientras que `Field()` (a la derecha) refina las condiciones de contorno.

Si omites la anotación de tipo al usar `Field()`, Python arrojará un error de sintaxis o Pydantic no podrá inicializar correctamente el validador, dado que el motor requiere obligatoriamente saber el tipo base para poder procesar la información.

```python
# FORMATO CORRECTO
nombre: str = Field(description="Nombre del usuario")

# FORMATO ERRÓNEO (Pydantic no sabrá cómo validar el tipo base)
nombre = Field(description="Nombre del usuario")

```

A lo largo de este capítulo profundizaremos en el amplio abanico de parámetros que acepta esta función. Aprenderemos a gestionar valores por defecto dinámicos, a mapear estructuras de datos externas mediante alias y a delimitar matemáticamente las variables numéricas, permitiendo que tus modelos se conviertan en la primera y más sólida línea de defensa de tu aplicación.

## 4.2. Valores predeterminados

Una de las tareas más comunes al diseñar modelos de datos es gestionar qué sucede cuando el usuario o un servicio externo no proporciona un dato específico. Pydantic maneja esto permitiendo definir valores predeterminados. Sin embargo, cuando usamos la función `Field()`, la asignación de estos valores adquiere una flexibilidad muy superior a la de la sintaxis estándar de Python, resolviendo además uno de los problemas más habituales y problemáticos del lenguaje: los valores predeterminados mutables.

### Valores predeterminados estáticos con Field()

En Python estándar, podemos asignar un valor predeterminado directamente con el operador `=`. Si decidimos usar `Field()`, el primer parámetro posicional de la función (o el parámetro nombrado `default`) se convierte en el valor por defecto estático.

Las dos formas siguientes de declarar un campo son completamente equivalentes para Pydantic en términos de asignación, aunque `Field()` abre la puerta a meter metadatos o restricciones adicionales:

```python
from pydantic import BaseModel, Field

class Configuracion(BaseModel):
    # Enfoque estándar de Python
    idioma: str = "es"
    
    # Enfoque usando Field
    modo_oscuro: bool = Field(default=True, description="Activa la interfaz oscura")

# Si no pasamos los datos, se usan los valores por defecto
config = Configuracion()
print(config.idioma)       # Salida: es
print(config.modo_oscuro)  # Salida: True

```

### El peligro de los mutables en Python y cómo lo soluciona Pydantic

En Python puro, usar un objeto mutable (como una lista o un diccionario) como valor predeterminado en una función o en una clase es una mala práctica muy conocida. Esto se debe a que el objeto mutable se crea **una sola vez** cuando el módulo se carga, y todas las instancias de la clase terminan compartiendo exactamente la misma lista en memoria. Si una instancia modifica la lista, se modifica para todas las demás.

Pydantic elimina por completo este dolor de cabeza. Cuando asignas una lista o un diccionario por defecto (ya sea de forma directa o a través de `Field(default=[])`), Pydantic realiza una **copia profunda (deep copy)** del valor cada vez que se crea una nueva instancia del modelo.

```python
from pydantic import BaseModel, Field

class Carrito(BaseModel):
    productos: list[str] = Field(default=[])

carrito_juan = Carrito()
carrito_maria = Carrito()

carrito_juan.productos.append("Libro")

# En Python puro esto afectaría a ambos, pero Pydantic los aísla correctamente:
print(carrito_juan.productos)   # Salida: ['Libro']
print(carrito_maria.productos)  # Salida: []

```

### Valores predeterminados dinámicos: `default_factory`

¿Qué pasa si queremos que el valor predeterminado no sea un dato fijo, sino algo que cambie dinámicamente cada vez que instanciamos el modelo? Por ejemplo, la fecha y hora exacta de registro, o un identificador único (UUID).

Para este escenario, `Field()` incluye el parámetro `default_factory`. Este parámetro acepta una función (o cualquier elemento ejecutable, conocido como *callable*) sin argumentos. Pydantic ejecutará esa función cada vez que se cree una instancia del modelo si el campo no ha sido provisto explícitamente.

```python
from datetime import datetime, timezone
import uuid
from pydantic import BaseModel, Field

def generar_id_corto() -> str:
    return str(uuid.uuid4())[:8]

class RegistroEvento(BaseModel):
    # Se ejecuta generar_id_corto() en cada instancia
    id: str = Field(default_factory=generar_id_corto)
    
    # Se ejecuta datetime.now con zona horaria UTC en cada instancia
    creado_en: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

evento_uno = RegistroEvento()
import time; time.sleep(0.1) # Breve pausa para notar la diferencia de tiempo
evento_dos = RegistroEvento()

print(f"Evento 1: ID={evento_uno.id}, Hora={evento_uno.creado_en}")
print(f"Evento 2: ID={evento_dos.id}, Hora={evento_dos.creado_en}")
# Ambos eventos tienen identificadores únicos y marcas de tiempo distintas.

```

El flujo lógico que sigue Pydantic para determinar el valor final de un campo se puede resumir en el siguiente esquema:

```text
        ¿El usuario proporcionó el dato?
                 │
        ┌────────┴────────┐
     SÍ │                 │ NO
        ▼                 ▼
Usar valor del      ¿Tiene default_factory?
  usuario                 │
                 ┌────────┴────────┐
              SÍ │                 │ NO
                 ▼                 ▼
           Ejecutar la       ¿Tiene default?
             función               │
                        ┌──────────┴──────────┐
                     SÍ │                     │ NO
                        ▼                     ▼
                  Usar el valor         Lanzar error de
                     estático           validación (Requerido)

```

> **Regla de oro:** No puedes usar `default` y `default_factory` al mismo tiempo en el mismo `Field()`. Si intentas definir ambos parámetros para un solo atributo, Pydantic lanzará inmediatamente un error de configuración (`PydanticUserError`) al inicializar la clase.
>
## 4.3. Alias y validación de nombres

En el mundo del desarrollo de software, es sumamente común que los sistemas con los que interactúa nuestra aplicación utilicen convenciones de nombres diferentes a las de Python. Mientras que en Python la norma estricta es usar `snake_case` (palabras separadas por guiones bajos), muchas APIs externas, bases de datos o archivos de configuración emplean `camelCase` (primera letra minúscula y el resto de palabras iniciadas en mayúscula) o estructuran las propiedades de formas particulares.

La función `Field()` proporciona una solución limpia y transparente para este desacoplamiento mediante el uso de **alias**. Los alias nos permiten mapear un nombre de campo externo con un atributo interno de Python sin perder los beneficios del tipado ni romper las guías de estilo del lenguaje.

### Los tres tipos de alias en Field()

`Field()` nos ofrece tres parámetros específicos para gestionar los alias según nuestras necesidades de entrada y salida de datos:

1. `alias`: Define un nombre alternativo universal. Se utiliza tanto para leer el dato (deserialización) como para exportarlo (serialización).
2. `validation_alias`: Se aplica **únicamente** cuando estamos recibiendo y validando datos. Pydantic buscará este nombre en el diccionario o JSON de entrada.
3. `serialization_alias`: Se aplica **únicamente** cuando estamos exportando el modelo (por ejemplo, al convertirlo a un diccionario o JSON).

Veamos un ejemplo práctico donde consumimos datos de una API externa que usa `camelCase`, pero nosotros queremos exportar los datos internamente hacia otro servicio en un formato diferente:

```python
from pydantic import BaseModel, Field

class Empleado(BaseModel):
    # Usamos un alias único para entrada y salida
    id_empleado: int = Field(alias="employeeId")
    
    # Configuramos alias específicos e independientes para la entrada y la salida
    nombre_completo: str = Field(
        validation_alias="fullName",
        serialization_alias="full_name_out"
    )

# 1. Validación de entrada (Deserialización)
# Recibimos los datos con los nombres de la API externa
datos_externos = {
    "employeeId": 105,
    "fullName": "Alejandro Silva"
}

empleado = Empleado(**datos_externos)
print(empleado.id_empleado)     # Salida: 105 (Atributo nativo en Python)
print(empleado.nombre_completo) # Salida: Alejandro Silva

# 2. Exportación (Serialización)
# Al exportar, Pydantic respeta las reglas de salida configuradas
print(empleado.model_dump(by_alias=True))
# Salida: {'employeeId': 105, 'full_name_out': 'Alejandro Silva'}

```

> **Nota importante:** Al exportar el modelo mediante `model_dump()` o `model_dump_json()`, debes pasar obligatoriamente el argumento `by_alias=True` si deseas que los alias de salida se apliquen. De lo contrario, Pydantic usará por defecto los nombres de los atributos nativos de Python (`id_empleado`, `nombre_completo`).

### Validación de alias y nombres nativos

Por defecto, cuando asignas un `alias` o un `validation_alias` a un campo, Pydantic se vuelve estricto: **solo** aceptará el nombre del alias durante la inicialización del modelo y rechazará el nombre nativo de la variable de Python.

Si intentamos pasar el nombre nativo, el sistema lanzará un error de validación:

```python
from pydantic import BaseModel, Field, ValidationError

class Producto(BaseModel):
    codigo_barras: str = Field(alias="barCode")

# Esto lanzará un ValidationError porque busca 'barCode'
try:
    p = Producto(codigo_barras="74239487239")
)
except ValidationError as e:
    print(e)  # Muestra que el campo 'barCode' es requerido

```

Si necesitas que Pydantic sea flexible y acepte **tanto el alias externo como el nombre nativo** de Python durante la carga de datos, debes configurar el modelo utilizando `populate_by_name=True` dentro del diccionario de configuración general del modelo (`model_config`):

```python
from pydantic import BaseModel, Field, ConfigDict

class ProductoFlexible(BaseModel):
    # Permitimos que se use el nombre nativo si el alias no está presente
    model_config = ConfigDict(populate_by_name=True)
    
    codigo_barras: str = Field(alias="barCode")

# Ahora ambas formas de inicialización son totalmente válidas:
p1 = ProductoFlexible(barCode="12345")
p2 = ProductoFlexible(codigo_barras="12345")

print(p1.codigo_barras == p2.codigo_barras)  # Salida: True

```

### Prioridad en la resolución de alias

Cuando combinas varios tipos de alias en un mismo `Field()`, Pydantic sigue un orden jerárquico estricto para determinar qué nombre evaluar. El comportamiento se divide claramente entre la fase de lectura y la de escritura:

```text
FASE DE ENTRADA (Validación)
¿Existe validation_alias?
      ├── SÍ ──► Usa validation_alias
      └── NO ──► ¿Existe alias?
                       ├── SÍ ──► Usa alias
                       └── NO ──► Usa el nombre de la variable de Python

FASE DE SALIDA (Serialización con by_alias=True)
¿Existe serialization_alias?
      ├── SÍ ──► Usa serialization_alias
      └── NO ──► ¿Existe alias?
                       ├── SÍ ──► Usa alias
                       └── NO ──► Usa el nombre de la variable de Python

```

Comprender esta jerarquía evita comportamientos inesperados cuando construyes modelos de datos complejos que actúan como puentes de comunicación entre múltiples microservicios con tecnologías heterogéneas.

## 4.4. Restricciones numéricas

La última gran ventaja que exploraremos sobre `Field()` en este capítulo es su capacidad para aplicar restricciones matemáticas directamente en la declaración de los atributos. Cuando trabajamos con datos numéricos (como enteros o flotantes), a menudo no basta con asegurar que el dato sea un número; necesitamos garantizar que se encuentre dentro de un rango lógico de negocio.

En lugar de esperar a que los datos se procesen para ejecutar estructuras condicionales o validadores complejos, `Field()` expone un conjunto de argumentos específicos que actúan como compuertas matemáticas inmediatas durante la fase de análisis de datos.

### Parámetros de restricción matemática

Pydantic define cuatro parámetros fundamentales para controlar los límites de las variables numéricas:

* **`gt`** (*Greater Than*): Mayor que. El valor debe ser estrictamente superior al límite establecido ($x > \text{límite}$).
* **`ge`** (*Greater than or Equal to*): Mayor o igual que. El valor debe ser igual o superior al límite ($x \ge \text{límite}$).
* **`lt`** (*Less Than*): Menor que. El valor debe ser estrictamente inferior al límite ($x < \text{límite}$).
* **`le`** (*Less than or Equal to*): Menor o igual que. El valor debe ser igual o inferior al límite ($x \le \text{límite}$).

Adicionalmente, existe el parámetro **`multiple_of`**, que obliga a que el número sea un múltiplo exacto del valor indicado (es decir, que el residuo de la división sea cero).

### Implementación práctica de restricciones

Veamos cómo aplicar estas restricciones en un modelo que simula el indicador de control de un reactor industrial, donde la temperatura y la presión deben mantenerse bajo parámetros operacionales estrictos:

```python
from pydantic import BaseModel, Field, ValidationError

class ControlReactor(BaseModel):
    # La temperatura debe estar estrictamente entre 0 y 100 grados Celsius
    temperatura: float = Field(gt=0.0, lt=100.0)
    
    # La presión puede llegar exactamente a 50.0 (inclusive), pero no bajar de 10.0
    presion: float = Field(ge=10.0, le=50.0)
    
    # El conteo de ciclos de mantenimiento debe avanzar de 5 en 5
    ciclos: int = Field(default=0, ge=0, multiple_of=5)

# 1. Instancia con valores que cumplen todas las restricciones
try:
    reactor_ok = ControlReactor(temperatura=45.5, presion=10.0, ciclos=15)
    print("Reactor inicializado correctamente:", reactor_ok)
except ValidationError as e:
    print(e)

# 2. Instancia con valores fuera de rango
try:
    reactor_error = ControlReactor(temperatura=105.0, presion=9.9, ciclos=12)
except ValidationError as e:
    print("\nErrores de validación detectados:")
    print(e)

```

Al intentar ejecutar el segundo bloque, Pydantic detiene la inicialización y genera un `ValidationError` detallado que especifica qué límites matemáticos se han vulnerado:

```text
Errores de validación detectados:
3 validation errors for ControlReactor
temperatura
  Input should be less than 100 [type=less_than, input_value=105.0, input_type=float]
presion
  Input should be greater than or equal to 10 [type=greater_than_equal, input_value=9.9, input_type=float]
ciclos
  Input should be a multiple of 5 [type=multiple_of, input_value=12, input_type=int]

```

### Combinación de restricciones y coerción de tipos

Es crucial recordar que Pydantic ejecuta la **coerción de tipos** antes de evaluar las restricciones numéricas de `Field()`. Si pasas una cadena de texto como `"25.5"` a un campo definido como `float` con restricciones, Pydantic primero la transformará al número flotante `25.5` y posteriormente comprobará si cumple con los parámetros `gt`, `lt`, etc.

```text
Dato de Entrada ──► Coerción de Tipo ──► Evaluación de Restricciones ──► Instancia Válida
  (e.g., "45")         (e.g., 45)             (¿ge=10 y le=50?)

```

Si el dato no puede convertirse al tipo numérico base, el proceso fallará inmediatamente en la etapa de coerción, sin llegar a evaluar los límites matemáticos.

## Resumen del capítulo

En el **Capítulo 4: Uso de Campos (Field)**, hemos profundizado en la herramienta más potente de Pydantic para personalizar atributos a nivel individual:

* **Introducción a `Field()`:** Aprendimos que funciona como un contenedor de metadatos y restricciones que trabaja de la mano con las anotaciones de tipo de Python para robustecer los esquemas de datos.
* **Valores predeterminados:** Analizamos cómo Pydantic soluciona de forma nativa el problema de los objetos mutables compartidos en memoria mediante copias profundas automáticas, y cómo generar valores dinámicos en tiempo de ejecución utilizando `default_factory`.
* **Alias y validación de nombres:** Evaluamos las estrategias para desacoplar los nombres de variables internas en Python (`snake_case`) de los formatos de integración externos (`camelCase`) mediante el uso preciso de `alias`, `validation_alias` y `serialization_alias`.
* **Restricciones numéricas:** Validamos de forma directa rangos numéricos y multiplicidades mediante parámetros declarativos (`gt`, `ge`, `lt`, `le`, `multiple_of`), evitando la necesidad de escribir lógica de validación manual para reglas matemáticas básicas.
