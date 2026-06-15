Este capítulo aborda el diseño de estructuras de datos jerárquicas y complejas mediante la combinación de múltiples modelos en Pydantic V2. A lo largo de las siguientes secciones, aprenderás a estructurar relaciones robustas del tipo "tiene un" mediante la composición de modelos, a gestionar colecciones dinámicas y listas de submodelos con un rastreo milimétrico de errores, y a resolver conflictos de inicialización como las referencias circulares e indirectas. Finalmente, dominaremos las técnicas de actualización profunda para modificar atributos anidados de forma segura sin romper la integridad ni las reglas de validación en cascada de todo tu árbol de información.

## 9.1. Composición de modelos

La composición de modelos es una técnica de diseño de software en la que estructuras complejas se construyen combinando modelos más simples y especializados. En Pydantic, esto se traduce en la capacidad de utilizar un modelo derivado de `BaseModel` como el tipo de anotación de un atributo dentro de otro modelo.

A diferencia de la herencia de clases (donde un modelo hijo adquiere las propiedades de un padre), la composición establece una relación de tipo **"tiene un"** (*has-a*). Por ejemplo, un modelo `Usuario` *tiene una* `Dirección`.

### Concepto y Estructura Jerárquica

Cuando anidamos modelos, Pydantic no solo valida el modelo raíz, sino que propaga de forma automática el proceso de validación y parseo hacia abajo a lo largo de todo el árbol de datos. Si la estructura interna de un submódulo no cumple con sus restricciones, el error se propaga hacia el modelo superior con una ruta (*path*) clara de dónde ocurrió el fallo.

A continuación se muestra un diagrama en texto plano que ilustra la relación jerárquica de la composición:

```text
+-------------------------------------------------+
|                  Modelo: Factura                |
|  - id: int                                      |
|  - cliente: Cliente  =============> +-------------------------+
|  - total: float                     |     Modelo: Cliente     |
+-------------------------------------+  - nombre: str          |
                                      |  - email: str           |
                                      |  - direccion: Direccion | ====> +-----------------------+
                                      +-------------------------+       |   Modelo: Direccion   |
                                                                        |  - calle: str         |
                                                                        |  - ciudad: str        |
                                                                        +-----------------------+

```

### Implementación Práctica

Para componer modelos en Pydantic, primero se definen las estructuras de menor jerarquía (las hojas del árbol de datos) y posteriormente se usan como tipos en los modelos contenedores.

```python
from pydantic import BaseModel, EmailStr

# 1. Definimos los modelos de menor jerarquía
class Direccion(BaseModel):
    calle: str
    ciudad: str
    codigo_postal: str

class Cliente(BaseModel):
    nombre: str
    email: str

# 2. Componemos el modelo raíz utilizando los modelos anteriores
class OrdenCompra(BaseModel):
    id_orden: int
    cliente: Cliente
    direccion_envio: Direccion
    precio_total: float

```

### Validación y Ciclo de Vida en Modelos Compuestos

Cuando pasamos datos estructurados (como un diccionario anidado) al inicializar el modelo raíz, Pydantic realiza los siguientes pasos de manera secuencial:

1. Evalúa los campos del modelo raíz (`OrdenCompra`).
2. Al detectar que el campo `cliente` requiere el tipo `Cliente`, toma el sub-diccionario correspondiente y lo pasa al constructor de la clase `Cliente`.
3. Repite el proceso para `direccion_envio` con la clase `Direccion`.
4. Si todas las subtareas de validación son exitosas, las sub-instancias se asignan a los atributos del modelo contenedor.

```python
# Datos de entrada en forma de diccionario anidado
datos_entrada = {
    "id_orden": 1054,
    "cliente": {
        "nombre": "Alejandra Gómez",
        "email": "alejandra@example.com"
    },
    "direccion_envio": {
        "calle": "Av. Corrientes 1234",
        "ciudad": "Buenos Aires",
        "codigo_postal": "C1043AAN"
    },
    "precio_total": 150.50
}

# Creación de la instancia
orden = OrdenCompra(**datos_entrada)

# Acceso a los datos compuestos
print(orden.cliente.nombre)          # Salida: Alejandra Gómez
print(orden.direccion_envio.ciudad)  # Salida: Buenos Aires

# Verificación de tipos de los submodelos
print(isinstance(orden.cliente, Cliente))                  # Salida: True
print(isinstance(orden.direccion_envio, Direccion))        # Salida: True

```

### Instanciación Directa de Submodelos

Pydantic también permite asignar directamente instancias ya creadas de los submodelos a los atributos del modelo contenedor durante la inicialización. Esto es útil cuando los submodelos se generan de forma independiente en la lógica de negocio.

```python
# Creación independiente de submodelos
cliente_frecuente = Cliente(nombre="Carlos Ruiz", email="carlos@example.com")
domicilio = Direccion(calle= "Calle Primaria 45", ciudad="Córdoba", codigo_postal="X5000")

# Instanciación por composición directa
nueva_orden = OrdenCompra(
    id_orden=1055,
    cliente=cliente_frecuente,
    direccion_envio=domicilio,
    precio_total=89.99
)

```

### Comportamiento ante Datos Inválidos

Si los datos de un submodelo no coinciden con las reglas definidas en su propia clase, Pydantic lanzará un único `ValidationError` que agrupa todos los fallos detectados en la jerarquía, indicando la ubicación exacta mediante una tupla en el parámetro `loc`.

Por ejemplo, si intentamos inicializar el modelo con un correo electrónico inválido en el cliente y omitimos el código postal en la dirección:

```python
from pydantic import ValidationError

datos_erroneos = {
    "id_orden": 1056,
    "cliente": {
        "nombre": "Carlos Ruiz",
        "email": "correo-invalido"  # Error de formato
    },
    "direccion_envio": {
        "calle": "Calle Primaria 45",
        "ciudad": "Córdoba"          # Falta codigo_postal
    },
    "precio_total": 89.99
}

try:
    OrdenCompra(**datos_erroneos)
except ValidationError as e:
    print(e.errors())

```

El método `.errors()` devolverá una estructura detallando que el error de validación ocurrió específicamente en `['cliente', 'email']` y en `['direccion_envio', 'codigo_postal']`, aislando la lógica de cada modelo pero centralizando el reporte del fallo.

## 9.2. Listas de submodelos

En el desarrollo de aplicaciones es habitual que una entidad contenga una colección de elementos secundarios. Por ejemplo, un carrito de compras contiene una lista de productos, o un post de un blog almacena una serie de comentarios. Pydantic gestiona estas colecciones mediante el uso de contenedores estándar de Python (como `list`, `set` o `tuple`) combinados con la composición de modelos.

Al definir un atributo como una lista de submodelos, Pydantic asume la responsabilidad de iterar sobre la estructura de entrada, aplicar las reglas de validación individuales a cada elemento y transformar los diccionarios anidados en instancias válidas del submodelo especificado.

### Definición y Tipado

Para declarar una lista de submodelos en Pydantic V2 se utiliza el tipo nativo `list` adjuntando el submodelo entre corchetes mediante la sintaxis de tipado estricto (*type hinting*).

A continuación se muestra un esquema conceptual de cómo se estructuran los datos y las instancias en memoria:

```text
[ Datos de Entrada (JSON / Dict) ]
{
  "id_carrito": 45,
  "items": [ {"articulo_id": 1, "cantidad": 2}, {"articulo_id": 2, "cantidad": 1} ]
}
                │
                ▼ Validado por Pydantic
[ Estructura de Instancias en Memoria ]
Carrito
 ├── id_carrito: 45
 └── items: list[ItemCarrito]
              ├── [0]: ItemCarrito(articulo_id=1, cantidad=2)
              └── [1]: ItemCarrito(articulo_id=2, cantidad=1)

```

### Implementación Práctica

El siguiente ejemplo muestra la construcción de un sistema de facturación simplificado, donde un modelo raíz `Factura` contiene una lista de instancias del submodelo `LineaFactura`.

```python
from pydantic import BaseModel, Field

class LineaFactura(BaseModel):
    producto_id: int
    cantidad: int = Field(gt=0, description="La cantidad debe ser mayor a cero")
    precio_unitario: float = Field(gt=0.0)

class Factura(BaseModel):
    codigo: str
    items: list[LineaFactura]  # Definición de la lista de submodelos

```

Cuando pasamos un diccionario con una lista de sub-diccionarios, Pydantic inicializa cada componente del contenedor de forma automática:

```python
datos_entrada = {
    "codigo": "FAC-2026-001",
    "items": [
        {"producto_id": 101, "cantidad": 3, "precio_unitario": 15.50},
        {"producto_id": 102, "cantidad": 1, "precio_unitario": 42.00},
        {"producto_id": 103, "cantidad": 5, "precio_unitario": 2.25}
    ]
}

# Inicialización del modelo raíz
factura = Factura(**datos_entrada)

# Acceso y manipulación de la lista
print(f"Total de líneas: {len(factura.items)}")  # Salida: Total de líneas: 3
print(f"Primer producto ID: {factura.items[0].producto_id}")  # Salida: 101

# Los elementos de la lista son instancias reales del submodelo
print(isinstance(factura.items[1], LineaFactura))  # Salida: True

```

### Rastreabilidad de Errores en Colecciones

Una de las ventajas críticas de utilizar listas de submodelos en Pydantic es la precisión en el reporte de fallos. Si uno o varios elementos dentro de la lista contienen datos inválidos, el `ValidationError` resultante especificará con exactitud el índice del elemento corrupto dentro del arreglo.

Consideremos un caso donde el segundo elemento (índice `1`) viola la restricción de cantidad mínima y el tercer elemento (índice `2`) contiene un tipo de dato erróneo en el identificador del producto:

```python
from pydantic import ValidationError

datos_invalidos = {
    "codigo": "FAC-2026-002",
    "items": [
        {"producto_id": 201, "cantidad": 2, "precio_unitario": 10.0},
        {"producto_id": 202, "cantidad": 0, "precio_unitario": 5.0},   # Error: cantidad debe ser > 0
        {"producto_id": "abc", "cantidad": 1, "precio_unitario": 8.5}   # Error: id debe ser entero
    ]
}

try:
    Factura(**datos_invalidos)
except ValidationError as e:
    # Mostramos los errores estructurados
    for error in e.errors():
        print(f"Ruta: {error['loc']} | Mensaje: {error['msg']}")

```

La salida del script anterior detalla el camino exacto del error usando el índice de la lista en la tupla de localización (`loc`):

```text
Ruta: ('items', 1, 'cantidad') | Mensaje: Input should be greater than 0
Ruta: ('items', 2, 'producto_id') | Mensaje: Input should be a valid integer, unable to parse string as an integer

```

### Uso de Conjuntos (`set`) de Submodelos

Si necesitas garantizar que los elementos de la colección sean únicos y no se dupliquen dentro de la estructura, puedes sustituir el contenedor `list` por un `set`.

> **Nota técnica obligatoria:** Para que un submodelo pueda ser almacenado dentro de un conjunto (`set`), sus instancias deben ser inmutables o "hasheables". Por defecto, los modelos de Pydantic son mutables y no soportan esta operación. Debes activar la configuración `frozen=True` en el submodelo para habilitar esta característica.

```python
from pydantic import BaseModel, ConfigDict

class Etiqueta(BaseModel):
    model_config = ConfigDict(frozen=True)  # Hace que las instancias sean inmutables
    nombre: str
    color: str

class Articulo(BaseModel):
    titulo: str
    etiquetas: set[Etiqueta]  # Pydantic eliminará duplicados idénticos en la entrada

```

## 9.3. Referencias circulares

Una referencia circular ocurre cuando un modelo depende de sí mismo de manera directa o indirecta a través de una cadena de otros modelos. Este patrón es común al modelar estructuras de datos recursivas, como árboles, sistemas de archivos (donde una carpeta contiene subcarpetas) o redes sociales (donde un usuario tiene una lista de amigos que también son usuarios).

En Python estándar y en la validación de tipos estática, las referencias circulares provocan un problema de resolución: no se puede usar una clase como anotación de tipo si esa clase aún no ha terminado de definirse. Pydantic resuelve este conflicto combinando las referencias de cadenas de texto (*forward references*) y el uso de utilidades de tipado avanzadas.

### El problema de la definición previa

Si intentas definir un modelo que se referencia a sí mismo de forma directa, Python arrojará un error de nombre no definido (`NameError`) durante la interpretación del archivo:

```python
# Esto provocará un NameError en tiempo de ejecución estándar si no se maneja
class Nodo(BaseModel):
    valor: str
    hijos: list[Nodo]  # NameError: name 'Nodo' is not defined

```

### Resolución con `from __future__ import annotations`

La forma más limpia y recomendada en Pydantic V2 para resolver las referencias circulares y las autoreferencias es importar el comportamiento de anotaciones diferidas de Python. Al añadir `from __future__ import annotations` en la primera línea de tu archivo, Python almacena las anotaciones de tipo como cadenas de texto en lugar de evaluarlas inmediatamente. Pydantic se encarga posteriormente de resolver estas cadenas una vez que todas las clases han sido cargadas en el intérprete.

A continuación, se presenta un diagrama en texto plano que ilustra una estructura jerárquica autoreferencial (un árbol de nodos):

```text
               +-----------------------+
               |      Nodo Raíz        |
               |  - nombre: "Raíz"     |
               |  - hijos: list[Nodo]  |
               +-----------┬-----------+
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
+-----------------------+   +-----------------------+
|      Nodo Hijo 1      |   |      Nodo Hijo 2      |
|  - nombre: "Hijo A"   |   |  - nombre: "Hijo B"   |
|  - hijos: list[Nodo]  |   |  - hijos: list[Nodo]  |
+-----------------------+   +-----------┬-----------+
                                        │
                                        ▼
                            +-----------------------+
                            |     Nodo Nieto 2-1    |
                            |  - nombre: "Nieto C"  |
                            |  - hijos: list[Nodo]  |
                            +-----------------------+

```

### Implementación de Autoreferencias (Estructura de Árbol)

Aprovechando el aplazamiento de evaluación, podemos definir estructuras recursivas complejas de manera nativa. Es fundamental que el atributo recursivo permita la ausencia de más elementos (por ejemplo, una lista vacía o un tipo `None`) para evitar bucles infinitos de validación.

```python
from __future__ import annotations  # Debe ser la primera línea del módulo
from pydantic import BaseModel

class Nodo(BaseModel):
    nombre: str
    hijos: list[Nodo] = []  # Inicializa por defecto como lista vacía para romper la recursión

# Datos de entrada con un árbol de tres niveles de profundidad
datos_arbol = {
    "nombre": "Raíz",
    "hijos": [
        {
            "nombre": "Hijo A", 
            "hijos": []
        },
        {
            "nombre": "Hijo B",
            "hijos": [
                {
                    "nombre": "Nieto C", 
                    "hijos": []
                }
            ]
        }
    ]
}

# Pydantic valida recursivamente todo el árbol de datos
raiz = Nodo(**datos_arbol)

print(raiz.nombre)                           # Salida: Raíz
print(raiz.hijos[1].nombre)                  # Salida: Hijo B
print(raiz.hijos[1].hijos[0].nombre)         # Salida: Nieto C
print(isinstance(raiz.hijos[1].hijos[0], Nodo)) # Salida: True

```

### Referencias Circulares Indirectas (Dos o más modelos)

Cuando la referencia circular involucra a dos modelos diferentes (el modelo `A` tiene un atributo del tipo `B`, y el modelo `B` tiene un atributo del tipo `A`), la importación de `annotations` sigue siendo necesaria, pero además debemos asegurarnos de que Pydantic reconstruya el esquema interno una vez que ambos modelos coexistan en el espacio de nombres.

En Pydantic V2, el método `model_rebuild()` fuerza la actualización de las referencias internas del modelo que hayan quedado pendientes o declaradas como cadenas de texto.

```python
from __future__ import annotations
from pydantic import BaseModel

class Capitulo(BaseModel):
    titulo: str
    libro_perteneciente: Libro  # Referencia hacia un modelo no definido todavía

class Libro(BaseModel):
    titulo_libro: str
    capitulos: list[Capitulo]   # Referencia hacia un modelo ya definido

# Al terminar la definición de ambos modelos, es obligatorio reconstruir el esquema
# del modelo que fue definido primero para resolver la referencia hacia el segundo.
Capitulo.model_rebuild()

```

### Ejecución y validación cruzada

Una vez reconstruido el esquema con `model_rebuild()`, la validación de estructuras con dependencias circulares cruzadas funciona exactamente igual que cualquier otro modelo compuesto:

```python
datos_libro = {
    "titulo_libro": "Manual de Pydantic V2",
    "capitulos": [
        {"titulo": "Introducción", "libro_perteneciente": {"titulo_libro": "Referencia Cruzada Implícita", "capitulos": []}},
        {"titulo": "Modelos Anidados", "libro_perteneciente": {"titulo_libro": "Referencia Cruzada Implícita", "capitulos": []}}
    ]
}

libro_instancia = Libro(**datos_libro)
print(libro_instancia.capitulos[0].titulo) # Salida: Introducción
print(isinstance(libro_instancia.capitulos[0], Capitulo)) # Salida: True

```

> **Advertencia de rendimiento y diseño:** Aunque Pydantic soporta la validación de datos con referencias circulares e indirectas, se debe tener precaución al serializar estas instancias (usando `.model_dump()` o `.model_dump_json()`). Si los objetos en memoria apuntan físicamente entre sí en un bucle infinito real (instancias con referencias cíclicas de Python), los métodos de exportación por defecto podrían arrojar un error de desbordamiento de pila (*RecursionError*).
>
## 9.4. Actualización profunda

La actualización profunda (*deep update*) se refiere al proceso de modificar los valores de un modelo compuesto o anidado preservando las estructuras intermedias y los datos preexistentes que no se desean cambiar.

Cuando trabajamos con diccionarios estándar en Python, la operación `.update()` realiza una actualización superficial (*shallow update*). Si un diccionario contiene un sub-diccionario y se sobrescribe, todo el bloque interno se reemplaza por completo. Pydantic ofrece mecanismos integrados para modificar atributos en múltiples niveles de profundidad de forma segura, garantizando que todos los datos modificados vuelvan a pasar por el motor de validación.

### El problema de la actualización superficial

Para entender la necesidad de una actualización profunda, observemos cómo se comporta una asignación superficial o el reemplazo directo de un atributo compuesto:

```python
from pydantic import BaseModel

class ConfiguracionBD(BaseModel):
    host: str
    puerto: int
    timeout: int

class AppConfig(BaseModel):
    nombre_app: str
    base_datos: ConfiguracionBD

config = AppConfig(
    nombre_app="MiAPI", 
    base_datos={"host": "localhost", "puerto": 5432, "timeout": 30}
)

# INTENTO DE ACTUALIZACIÓN SUPERFICIAL:
# Si intentamos actualizar el timeout pasando un diccionario parcial, 
# Pydantic lanzará un ValidationError porque faltarán 'host' y 'puerto'.
try:
    config.base_datos = {"timeout": 60}
except Exception as e:
    print(type(e).__name__)  # ValidationError

```

### Estrategia recomendada en Pydantic V2: `.model_copy(update=...)`

La forma nativa, más segura y eficiente de aplicar actualizaciones profundas en Pydantic V2 es combinar el volcado de datos con el método `.model_copy()`, utilizando el argumento `update`. Este parámetro acepta un diccionario con las modificaciones que se desean inyectar al clonar el modelo.

Para estructuras con múltiples niveles de anidamiento, la estrategia consiste en extraer el submodelo actual, clonarlo aplicando la actualización superficial en su nivel, y luego clonar el modelo raíz inyectando el nuevo submodelo validado.

```python
# 1. Extraemos y copiamos el submodelo con sus cambios locales
submodelo_actualizado = config.base_datos.model_copy(update={"timeout": 60})

# 2. Copiamos el modelo raíz pasando el nuevo submodelo completamente estructurado
config_actualizada = config.model_copy(update={"base_datos": submodelo_actualizado})

print(config_actualizada.base_datos.timeout)  # Salida: 60
print(config_actualizada.base_datos.host)     # Salida: localhost (Se preservó el valor)

```

A continuación se muestra un diagrama de flujo en texto plano que ilustra el proceso de clonación y fusión de datos durante una actualización profunda guiada por restricciones:

```text
[ Modelo Original ] ──► ( Extraer submodelo ) ──► Submodelo original
                                                         │
                                                         ▼
[ Cambios (Dict)  ] ──────────────────────────► .model_copy(update=...)
                                                         │
                                                         ▼
[ Nuevo Modelo    ] ◄── .model_copy(update=...) ◄── Submodelo mutado y validado

```

### Mutación directa en entornos controlados

Si el modelo no está configurado como inmutable (`frozen=True`), se pueden realizar mutaciones directas sobre los atributos de los submodelos mediante la asignación estándar de Python. Pydantic validará el tipo de dato en el momento de la asignación si se tienen activos los validadores de asignación (*assignment validators*), manteniendo la integridad del árbol de información.

```python
# Modificación directa en el atributo del submodelo
config.base_datos.timeout = 90

print(config.base_datos.timeout)  # Salida: 90

```

### Re-validación completa post-actualización

Cuando se realizan actualizaciones a través de diccionarios externos arbitrarios o modificaciones directas, se puede forzar una validación de todo el modelo compuesto utilizando el método `model_validate()`. Esto asegura que las reglas transversales y validadores cruzados del modelo vuelvan a ejecutarse sobre la nueva estructura.

```python
# Exportamos los datos actuales a un diccionario ejecutable
datos_actuales = config.model_dump()

# Modificamos el diccionario de forma profunda usando lógica estándar de Python
datos_actuales["base_datos"]["timeout"] = 120

# Re-validamos por completo para obtener una instancia nueva e íntegra
nuevo_config = AppConfig.model_validate(datos_actuales)
print(nuevo_config.base_datos.timeout)  # Salida: 120

```

## Resumen del capítulo

En este capítulo hemos explorado la creación de estructuras de datos jerárquicas y complejas mediante la manipulación de **Modelos Anidados** en Pydantic V2:

* **Composición de modelos:** Aprendimos a estructurar relaciones del tipo "tiene un" utilizando un `BaseModel` como tipo de dato dentro de otros modelos, permitiendo que la validación se propague automáticamente en cascada.
* **Listas de submodelos:** Analizamos cómo manejar colecciones y arreglos de objetos (`list`, `set`), destacando la capacidad de Pydantic para reportar la ubicación exacta de los errores utilizando los índices de la lista en la tupla `loc`.
* **Referencias circulares:** Estudiamos las técnicas para implementar modelos autoreferenciales y dependencias cíclicas cruzadas usando `from __future__ import annotations` y el método `model_rebuild()` para resolver tipos diferidos en tiempo de ejecución.
* **Actualización profunda:** Evaluamos las diferencias entre la actualización superficial y profunda, dominando el uso de `.model_copy(update=...)` y la re-validación integral con `.model_validate()` para alterar datos en árboles complejos de forma segura.
