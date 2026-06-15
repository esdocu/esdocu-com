Este capítulo aborda el gobierno operativo de las estructuras de datos en Pydantic V2 a través de `ConfigDict`. Configurar un modelo va más allá de definir sus variables; implica dictar las reglas globales que rigen su comportamiento. Aprenderás a transicionar hacia diccionarios tipados con validación estática, controlar de forma estricta los datos excedentes mediante políticas para campos extra, activar el modo estricto global para anular coerciones automáticas e integrar generadores de alias automáticos para unificar la convivencia entre el formato `snake_case` de Python y el estándar `camelCase` de sistemas externos.

## 12.1. La clase ConfigDict

En Pydantic V2, el comportamiento global de un modelo ya no se configura mediante una clase interna llamada `Config` (como se hacía en la V1). En su lugar, se utiliza **`ConfigDict`**, un diccionario tipado (`TypedDict`) que proporciona un control preciso, autocompletado en el editor de código y una sintaxis mucho más limpia y nativa de Python.

Al asignar un diccionario `ConfigDict` al atributo de clase especial `model_config`, le indicas a Pydantic cómo debe validar, serializar y comportarse la estructura completa.

### Sintaxis básica de `ConfigDict`

Para utilizarlo, simplemente se importa desde `pydantic` y se define a nivel de clase:

```python
from pydantic import BaseModel, ConfigDict

class Usuario(BaseModel):
    # Definición de la configuración global del modelo
    model_config = ConfigDict(
        title="Modelo de Usuario Principal",
        str_strip_whitespace=True,
        frozen=True
    )
    
    nombre: str
    email: str

```

### Parámetros más comunes de `ConfigDict`

Aunque este capítulo analizará en detalle varias de estas opciones en las secciones posteriores, a continuación se presenta una tabla de referencia con las configuraciones más utilizadas que ofrece `ConfigDict`:

| Parámetro | Tipo | Propósito |
| --- | --- | --- |
| `extra` | `ExtraValues` | Controla qué hacer con los campos no definidos en el modelo (`'ignore'`, `'allow'`, `'forbid'`). |
| `strict` | `bool` | Si es `True`, la validación no intentará forzar o convertir tipos (ej. no convertirá el string `"123"` en un entero `123`). |
| `frozen` | `bool` | Si es `True`, las instancias del modelo se vuelven inmutables tras su creación. |
| `str_strip_whitespace` | `bool` | Elimina automáticamente los espacios en blanco al inicio y al final de todas las cadenas de texto recibidas. |
| `str_to_lower` / `str_to_upper` | `bool` | Convierte automáticamente los textos a minúsculas o mayúsculas respectivamente. |
| `populate_by_name` | `bool` | Permite instanciar el modelo usando tanto el nombre real del atributo como su alias. |
| `alias_generator` | `Callable` | Una función para mapear automáticamente los nombres de los atributos (por ejemplo, pasar de `snake_case` a `camelCase`). |

### Flujo de configuración en el ciclo de vida del modelo

Cuando defines `model_config`, Pydantic lee estas directivas antes de compilar el esquema interno en Rust (`pydantic-core`). Esto significa que las reglas se aplican de manera uniforme tanto en la inicialización básica como en la carga desde JSON.

```text
[ Datos de entrada: "  Carlos  " ]
                │
                ▼
   ┌─────────────────────────┐
   │    Pydantic BaseModel   │
   │  ┌───────────────────┐  │
   │  │   ConfigDict()    │  │
   │  │ str_strip_whitespace││
   │  └─────────┬─────────┘  │
   └────────────┼────────────┘
                ▼
[ Instancia creada: nombre="Carlos" ]

```

### Ejemplo práctico: Limpieza y protección de datos

Veamos cómo `ConfigDict` puede transformar radicalmente la robustez de un modelo con apenas un par de líneas de configuración:

```python
from pydantic import BaseModel, ConfigDict, ValidationError

class Producto(BaseModel):
    model_config = ConfigDict(
        str_strip_whitespace=True,  # Limpia espacios molestos
        str_to_upper=True,          # Normaliza códigos a mayúsculas
        frozen=True                 # Protege el objeto contra modificaciones
    )
    
    codigo: str
    descripcion: str

# 1. Demostración de la transformación de strings
prod = Producto(codigo="  us-994  ", descripcion=" Teclado Mecánico ")
print(f"Código: '{prod.codigo}'")       # Salida: 'US-994'
print(f"Descripción: '{prod.descripcion}'") # Salida: 'Teclado Mecánico'

# 2. Demostración de la inmutabilidad (frozen)
try:
    prod.codigo = "ES-112"
) except ValidationError as e:
    print("Error: No puedes modificar un modelo congelado.")

```

### Ventajas clave frente al sistema anterior (V1)

1. **Soporte de Linters y Editores:** Al ser un `TypedDict`, IDEs como VS Code o PyCharm te avisarán de inmediato si escribes mal el nombre de una propiedad de configuración (por ejemplo, si escribes `forzen` en lugar de `frozen`).
2. **Herencia limpia:** Los modelos que heredan de otros combinan sus diccionarios de configuración de forma predecible, permitiendo sobrescribir solo las llaves necesarias.

## 12.2. Manejo de campos extra

Por defecto, cuando envías datos a un modelo de Pydantic que contienen atributos no definidos en la estructura de la clase, la biblioteca los ignora de manera silenciosa. Sin embargo, en muchas aplicaciones —como el diseño de APIs estrictas o el procesamiento de payloads de seguridad— es crucial tener un control absoluto sobre qué hacer con este excedente de información.

A través del parámetro `extra` de la clase `ConfigDict`, Pydantic ofrece tres políticas perfectamente diferenciadas para gestionar estos datos adicionales.

### Las tres políticas de `extra`

El parámetro `extra` acepta únicamente tres valores de tipo cadena de texto:

1. **`'ignore'` (Por defecto):** Los campos adicionales se descartan durante la validación y no forman parte del objeto final de ninguna manera.
2. **`'forbid'`:** La presencia de cualquier campo no declarado detiene el proceso de inmediato lanzando un error de validación (`ValidationError`).
3. **`'allow'`:** Los campos extra se validan de forma flexible, se guardan y se vuelven accesibles dentro del objeto de manera dinámica.

---

### Implementación práctica

A continuación, analizaremos cómo se comporta un mismo conjunto de datos bajo cada una de las tres configuraciones disponibles.

#### 1. Ignorar campos extra (`'ignore'`)

Este es el comportamiento estándar. Es sumamente útil si tu aplicación consume datos de un servicio externo que constantemente añade nuevas propiedades que a ti no te interesan.

```python
from pydantic import BaseModel, ConfigDict

class TarjetaLigera(BaseModel):
    model_config = ConfigDict(extra='ignore')  # Opcional, es el valor por defecto
    id: int
    titular: str

# Enviamos una propiedad que no existe: 'codigo_postal'
datos = {"id": 101, "titular": "Ana Silva", "codigo_postal": "28001"}
tarjeta = TarjetaLigera(**datos)

print(tarjeta.model_dump())
# Salida: {'id': 101, 'titular': 'Ana Silva'}
# 'codigo_postal' fue completamente omitido

```

#### 2. Prohibir campos extra (`'forbid'`)

Ideal para formularios de registro o endpoints de APIs donde un parámetro mal escrito (por ejemplo, `emial` en lugar de `email`) pasaría desapercibido si se ignorara, provocando un guardado de datos incompleto.

```python
from pydantic import BaseModel, ConfigDict, ValidationError

class RegistroUsuario(BaseModel):
    model_config = ConfigDict(extra='forbid')
    username: str
    email: str

try:
    # El usuario envía por error 'edad'
    Usuario = RegistroUsuario(username="lucas99", email="l@test.com", edad=25)
except ValidationError as e:
    print(e)
    """
    Salida del error:
    1 validation error for RegistroUsuario
    edad
      Extra inputs are not permitted [type=extra_forbidden, input_value=25, input_type=int]
    """

```

#### 3. Permitir y almacenar campos extra (`'allow'`)

Cuando necesitas flexibilidad absoluta. Los campos adicionales no solo se guardan en el objeto, sino que se vuelven atributos reales del mismo y se incluyen en las exportaciones a diccionarios o JSON.

```python
from pydantic import BaseModel, ConfigDict

class PluginDinamico(BaseModel):
    model_config = ConfigDict(extra='allow')
    nombre_plugin: str

# Añadimos configuraciones personalizadas sobre la marcha
plugin = PluginDinamico(nombre_plugin="Compresor", calidad="Alta", hilos=4)

print(plugin.nombre_plugin)  # Salida: Compresor
print(plugin.calidad)        # Salida: Alta (Atributo dinámico accesible)
print(plugin.model_dump())   # Salida: {'nombre_plugin': 'Compresor', 'calidad': 'Alta', 'hilos': 4}

```

---

### Recuperación de campos extra permitidos: `model_extra`

Cuando utilizas `extra='allow'`, Pydantic expone una propiedad especial en la instancia llamada `model_extra`. Esta propiedad es un diccionario que contiene de forma exclusiva los datos adicionales que fueron inyectados en el modelo, manteniéndolos separados de los campos oficiales de tu clase.

```python
# Continuando con el ejemplo de 'PluginDinamico'
print(plugin.model_fields.keys()) # Campos oficiales: dict_keys(['nombre_plugin'])
print(plugin.model_extra)         # Campos extra: {'calidad': 'Alta', 'hilos': 4}

```

Si el modelo está configurado en modo `'ignore'` o `'forbid'`, el valor de `model_extra` será siempre `None`.

```text
        [ Diccionario de Entrada ]
      {"id": 1, "nombre": "A", "color": "Rojo"}
                     │
                     ▼
         ┌───────────────────────┐
         │   ¿Cómo está configurado   │
         │     extra en el modelo?     │
         └───────────┬───────────┘
                     │
      ┌──────────────┼──────────────┐
      ▼              ▼              ▼
  ['ignore']     ['forbid']     ['allow']
      │              │              │
 Omitir 'color'   Lanzar     Guardar 'color'
  silenciosamente  ValidationError en .model_extra

```

> **Nota de rendimiento:** Configurar un modelo con `extra='allow'` obliga a Pydantic a reservar memoria adicional dinámicamente y realizar un seguimiento por separado de los atributos ajenos al esquema. Si el rendimiento puro y el uso de memoria son críticos para tu sistema, utiliza `'ignore'` (por defecto) o `'forbid'`.
>
## 12.3. Modo estricto global

Por defecto, Pydantic opera bajo un enfoque flexible o laxo (`lax mode`). Esto significa que si le envías un tipo de dato que no coincide exactamente con la anotación del campo, pero que puede convertirse de forma lógica y segura, Pydantic realizará la conversión automáticamente (por ejemplo, transformará el string `"42"` en el entero `42`, o el número `1` en el booleano `True`).

Sin embargo, hay escenarios críticos —como el desarrollo de APIs financieras, sistemas de alta precisión o pasarelas de pago— donde la coerción automática de tipos puede ocultar errores en los clientes emisores. Para solucionar esto, Pydantic V2 permite activar el **Modo Estricto Global** a través de `ConfigDict`.

### Activación del modo estricto

Para forzar a que todo el modelo exija coincidencias exactas de tipos, se debe asignar la propiedad `strict=True` dentro del `ConfigDict`:

```python
from pydantic import BaseModel, ConfigDict

class FacturaEstricta(BaseModel):
    model_config = ConfigDict(strict=True)
    
    id_transaccion: int
    monto: float
    activa: bool

```

---

### Comportamiento: Modo Laxo vs. Modo Estricto

Para entender el impacto real de esta configuración, analicemos cómo reacciona Pydantic ante los mismos datos de entrada según el modo activo:

| Tipo Declarado | Dato de Entrada | Comportamiento en Modo Laxo (`strict=False`) | Comportamiento en Modo Estricto (`strict=True`) |
| --- | --- | --- | --- |
| `int` | `"100"` | **Pasa:** Se convierte al entero `100`. | **Falla:** Lanza `ValidationError`. |
| `float` | `5` | **Pasa:** Se convierte al flotante `5.0`. | **Pasa:** Pydantic permite enteros para campos `float` de forma segura. |
| `bool` | `"true"` / `1` | **Pasa:** Se convierten al booleano `True`. | **Falla:** Lanza `ValidationError` (solo acepta `True` o `False`). |
| `str` | `123` | **Pasa:** Se convierte a la cadena `"123"`. | **Falla:** Lanza `ValidationError`. |

---

### Ejemplo práctico: Validación sin concesiones

El siguiente código demuestra la diferencia de ejecución al intentar inicializar un modelo con tipos de datos que requieren conversión forzada:

```python
from pydantic import BaseModel, ConfigDict, ValidationError

# 1. Modelo Estándar (Laxo por defecto)
class PagoLaxo(BaseModel):
    cantidad: int
    aprobado: bool

pago_ok = PagoLaxo(cantidad="50", aprobado=1)
print(pago_ok.model_dump()) 
# Salida: {'cantidad': 50, 'aprobado': True} (Coerción exitosa)


# 2. Modelo Estricto
class PagoEstricto(BaseModel):
    model_config = ConfigDict(strict=True)
    cantidad: int
    aprobado: bool

try:
    pago_error = PagoEstricto(cantidad="50", aprobado=1)
except ValidationError as e:
    print(e)
    """
    Salida del error (Muestra ambos fallos de coincidencia de tipo):
    2 validation errors for PagoEstricto
    cantidad
      Input should be a valid integer [type=int_type, input_value='50', input_type=str]
    aprobado
      Input should be a valid boolean [type=bool_type, input_value=1, input_type=int]
    """

```

### ¿Cuándo usar el Modo Estricto Global?

```text
                    ¿Cuándo activar strict=True?
                                  │
         ┌────────────────────────┴────────────────────────┐
         ▼                                                 ▼
[ Usar Modo Estricto ]                            [ Usar Modo Laxo ]
• APIs internas controladas.                      • Integración con formularios web HTML
• Datos financieros o científicos donde           (que envían todo como string).
  un formato erróneo invalide el proceso.         • Consumo de APIs externas antiguas o 
• Cuando requieres control total del tipado.        cuyos tipos de datos fluctúan.

```

> **Estrategia de diseño:** Activar `strict=True` en el `ConfigDict` afecta a **todos** los campos del modelo. Si necesitas que solo un campo específico sea estricto mientras el resto conserva la flexibilidad del modo laxo, no uses el enfoque global; en su lugar, utiliza el módulo `Annotated` combinado con el operador `Field(strict=True)` en el atributo deseado.
>
## 12.4. Nombres en formato camelCase

En el ecosistema de desarrollo de software, es sumamente común encontrarse con un choque de convenciones de diseño. Mientras que Python utiliza de forma estandarizada el formato `snake_case` para nombrar variables y atributos (ej. `fecha_nacimiento`), plataformas como JavaScript, las API RESTful públicas y las bases de datos NoSQL prefieren mayoritariamente el formato `camelCase` (ej. `fechaNacimiento`).

Duplicar tus modelos o renombrar los atributos en Python rompiendo la guía de estilo PEP 8 no es una buena opción. Para solucionar esto, Pydantic permite automatizar la conversión bidireccional de nombres entre formatos mediante el uso de un **generador de alias** en la clase `ConfigDict`.

### Configuración con `alias_generator`

Pydantic V2 simplifica este proceso al incluir funciones de conversión listas para usar dentro del módulo `pydantic.alias_generators`. La función ideal para este caso es `to_camel`.

Al configurar `alias_generator=to_camel` y activar `populate_by_name=True`, logras dos cosas fundamentales:

1. **Serialización automática:** Cuando exportas el modelo a JSON o diccionario, Pydantic transformará tus campos `snake_case` a `camelCase`.
2. **Flexibilidad en la entrada:** El modelo podrá inicializarse indistintamente usando el nombre original en Python o su alias en formato camelCase.

---

### Ejemplo práctico de integración

El siguiente código muestra cómo configurar un modelo para interactuar perfectamente con un frontend o una API externa que envíe y reciba datos en formato `camelCase`:

```python
from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

class PerfilUsuario(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True  # Permite usar tanto 'primer_nombre' como 'primerNombre'
    )
    
    primer_nombre: str
    apellido_paterno: str
    correo_electronico: str

# 1. Recepción de datos externos en formato camelCase
datos_api = {
    "primerNombre": "Sofía",
    "apellidoPaterno": "Casas",
    "correoElectronico": "sofia@api.com"
}

usuario = PerfilUsuario(**datos_api)
print(usuario.primer_nombre)  # Salida: Sofía (Se mapeó correctamente en Python)

# 2. Recepción de datos locales en formato snake_case (gracias a populate_by_name)
usuario_local = PerfilUsuario(primer_nombre="Luis", apellido_paterno="Paz", correo_electronico="luis@test.com")

# 3. Exportación de datos de vuelta al frontend (usando los alias en camelCase)
print(usuario_local.model_dump(by_alias=True))
# Salida: {'primerNombre': 'Luis', 'apellidoPaterno': 'Paz', 'correoElectronico': 'luis@test.com'}

```

> **Atención al exportar:** Recuerda que para que Pydantic transforme las llaves de salida al formato del alias, debes pasar explícitamente el parámetro `by_alias=True` tanto en el método `model_dump()` como en `model_dump_json()`. Si no lo haces, Pydantic exportará las llaves con los nombres nativos de Python (`snake_case`).

---

### Mapeo bidireccional automatizado

```text
  Entrada (JSON/API)                     Modelo Python                     Salida (Frontend)
┌──────────────────────┐               ┌───────────────────┐               ┌──────────────────────┐
│  "primerNombre"      ├─► Validación ─►│ .primer_nombre    ├─► Serializar ─►│  "primerNombre"      │
│  "apellidoPaterno"   │               │ .apellido_paterno │   (by_alias)  │  "apellidoPaterno"   │
└──────────────────────┘               └───────────────────┘               └──────────────────────┘

```

## Resumen del capítulo

En este **Capítulo 12: Configuración de Modelos**, hemos explorado a fondo el uso de la clase **`ConfigDict`** como la herramienta centralizada de Pydantic V2 para gobernar las reglas operativas de nuestras estructuras de datos.

A lo largo de las lecciones, aprendimos a:

* **Adoptar `ConfigDict`:** Migrar del viejo enfoque de la clase interna de la V1 a un sistema basado en un diccionario tipado (`TypedDict`), ganando validación estática y autocompletado nativo en el entorno de desarrollo.
* **Gestionar el excedente de información:** Configurar la propiedad `extra` con sus políticas `'ignore'`, `'forbid'` y `'allow'`, permitiendo interceptar o almacenar de forma controlada parámetros inesperados del cliente mediante `model_extra`.
* **Garantizar la precisión del tipado:** Activar el modo estricto global (`strict=True`) para anular la coerción automática de tipos de datos, ideal para entornos críticos donde las conversiones laxas suponen un riesgo latente de negocio.
* **Resolver discrepancias de nomenclatura:** Conectar de manera transparente arquitecturas Pythonic con APIs externas implementando el generador automático de alias `to_camel`, asegurando la compatibilidad con el estándar `camelCase` sin comprometer la limpieza ni las guías de estilo de nuestro código base.
