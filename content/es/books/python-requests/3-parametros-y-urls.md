En este capítulo aprenderás a construir URLs dinámicas y precisas mediante el uso de parámetros de consulta (*query parameters*). En lugar de recurrir a la propensa a errores concatenación manual de cadenas, descubrirás cómo la biblioteca `requests` te permite estructurar tus búsquedas, filtros y paginaciones utilizando diccionarios y listas nativas de Python. Exploraremos cómo la biblioteca procesa internamente estas colecciones de datos, cómo se adapta a los diferentes estándares requeridos por las APIs modernas y de qué manera gestiona la codificación por porcentajes (*Percent-encoding*) de forma totalmente automática y transparente para garantizar peticiones web seguras.

## 3.1. Qué son los parámetros de consulta

Los parámetros de consulta, conocidos en inglés como **query parameters** o *query strings*, son un conjunto de pares clave-valor que se añaden al final de una URL para enviar información adicional al servidor de manera estructurada.

Su función principal es filtrar, ordenar o paginar los recursos que estás solicitando a través de una petición HTTP (habitualmente con el método `GET`). En lugar de modificar la ruta de acceso al recurso, alteran el comportamiento de la respuesta del servidor en función de las variables enviadas.

### Anatomía de una URL con parámetros de consulta

Para identificar dónde empiezan y cómo se estructuran estos parámetros dentro de una dirección web, se siguen reglas estandarizadas en la arquitectura HTTP:

* **El signo de interrogación (`?`):** Actúa como el delimitador que marca el final de la ruta del recurso y el inicio de la cadena de parámetros. Solo puede haber uno en la URL.
* **El signo de igualdad (`=`):** Separa el nombre del parámetro (la clave) de su contenido (el valor).
* **El símbolo ampersand (`&`):** Se utiliza como separador cuando se necesitan enviar múltiples parámetros en la misma solicitud.

A continuación, se detalla la estructura visual de una URL con múltiples parámetros de consulta:

```text
https://api.tienda.com/v1/productos?categoria=libros&orden=precio_asc&pagina=2
└─────────────┬──────────────────┘ └───────────────────────┬──────────────────────┘
        Ruta del recurso                         Parámetros de consulta
                                   (Clave: categoria ── Valor: libros)
                                   (Clave: orden     ── Valor: precio_asc)
                                   (Clave: pagina    ── Valor: 2)

```

### Características fundamentales

* **Visibilidad:** Los parámetros viajan expuestos directamente en la barra de direcciones del navegador o en la primera línea de la petición HTTP. Por este motivo, **nunca deben usarse para transmitir datos sensibles** como contraseñas, tokens de acceso o información médica personal, ya que las URLs suelen quedar registradas en los historiales de navegación y en los logs del servidor de forma automática.
* **Estructura plana:** Por defecto, la cadena de texto es plana. Las API modernas y las bibliotecas como `requests` interpretan esta estructura para mapearla a tipos de datos nativos como diccionarios u objetos en el código del servidor.
* **Límite de longitud:** Aunque la especificación HTTP no define un límite estricto, la mayoría de los servidores web y navegadores restringen la longitud total de una URL (incluyendo los parámetros) a un máximo que suele oscilar entre los 2048 y 8192 caracteres. Para enviar grandes volúmenes de datos, se utilizan otros mecanismos como el cuerpo de la petición (típico en métodos `POST`).

### Limitaciones de la construcción manual de URLs

Cuando trabajas en Python, podrías caer en la tentación de construir estas direcciones utilizando la concatenación de cadenas tradicionales o f-strings de la siguiente manera:

```python
# Ejemplo de lo que DEBES EVITAR en tu código
busqueda = "camisetas de algodón"
url = f"https://api.tienda.com/buscar?q={busqueda}&limite=10"

```

Este enfoque manual presenta graves inconvenientes:

1. **Falta de escalabilidad:** Si necesitas añadir condicionales o cambiar la cantidad de parámetros dinámicamente, el código se vuelve difícil de leer y mantener, obligándote a gestionar manualmente los símbolos `?` y `&`.
2. **Problemas de caracteres especiales:** Los espacios en blanco, las letras con tildes, la "ñ" o caracteres reservados de la propia URL (como el signo `+` o `=`) rompen la sintaxis si se insertan directamente, provocando errores en el servidor.

La biblioteca `requests` resuelve por completo este problema abstrayendo la manipulación de cadenas mediante el uso de estructuras de datos limpias, garantizando que el formato final de la petición cumpla estrictamente con los estándares web sin que tengas que preocuparte por la sintaxis de la URL.

## 3.2. Envío de diccionarios en parámetros

La forma más eficiente, limpia y legible de enviar parámetros de consulta utilizando la biblioteca `requests` es mediante el uso de diccionarios de Python. En lugar de concatenar cadenas manualmente o preocuparte por la inserción de los símbolos `?` y `&`, puedes delegar la construcción de la URL por completo en la biblioteca.

Para lograr esto, el método `requests.get()` expone un argumento opcional llamado `params`. Al pasar un diccionario a este argumento, `requests` se encarga de descomponer los pares clave-valor, formatearlos correctamente y acoplarlos al final de la dirección web.

### Implementación básica

El siguiente bloque de código muestra cómo definir tus criterios de búsqueda en un diccionario estructurado y pasarlos a una petición:

```python
import requests

# 1. Definimos la URL base del recurso
url_base = "https://api.github.com/search/repositories"

# 2. Creamos el diccionario con los parámetros de consulta
parametros = {
    "q": "requests+language:python",
    "sort": "stars",
    "order": "desc"
}

# 3. Realizamos la petición GET pasando el diccionario al argumento 'params'
respuesta = requests.get(url_base, params=parametros)

# 4. Inspeccionamos la URL final que se envió al servidor
print(respuesta.url)

```

Al ejecutar el código anterior, el valor impreso en la consola será el siguiente:

```text
https://api.github.com/search/repositories?q=requests%2Blanguage%3Apython&sort=stars&order=desc

```

Como puedes observar, la biblioteca detectó automáticamente que se trataba de múltiples parámetros, insertó el signo `?` para iniciar la secuencia, unió las claves con sus respectivos valores mediante el signo `=` y separó cada par con el símbolo `&`.

### El flujo interno de `requests` con el argumento `params`

Cuando asignas un diccionario al parámetro `params`, la biblioteca ejecuta una secuencia de pasos internos antes de disparar la petición a la red:

```text
 Tu Diccionario Python
 { "q": "requests", "sort": "stars" }
                 │
                 ▼
 ┌────────────────────────────────────────┐
 │   Validación y lectura de elementos    │
 └────────────────────────────────────────┘
                 │
                 ▼
 ┌────────────────────────────────────────┐
 │ Codificación de caracteres especiales  │ -> (Ej: convierte espacios en %20 o +)
 └────────────────────────────────────────┘
                 │
                 ▼
 ┌────────────────────────────────────────┐
 │    Ensamblado final de la Query String │ -> (Une todo con '?' , '=' y '&')
 └────────────────────────────────────────┘
                 │
                 ▼
 URL resultante enviada al servidor

```

### Ventajas de utilizar diccionarios sobre la concatenación

* **Evita valores nulos erróneos:** Si una variable en tu código tiene el valor `None`, `requests` omitirá automáticamente esa clave en la URL final en lugar de enviar una cadena literal como `"?filtro=None"`, evitando comportamientos inesperados en el backend del servidor.
* **Dinamicidad:** Es sumamente sencillo modificar los parámetros de la petición en función de la lógica de tu aplicación utilizando los métodos nativos de los diccionarios, como agregar nuevos campos (`parametros['fecha'] = '2026-05-20'`) o eliminar filtros según las decisiones del usuario.
* **Valores numéricos y booleanos:** Aunque las URLs son compuestas estrictamente por texto, puedes incluir enteros, flotantes o booleanos en los valores de tu diccionario. La biblioteca se encargará de realizar la conversión a cadena de caracteres (`str`) de forma interna y transparente.

## 3.3. Manejo de listas como parámetros

En el desarrollo de software y el consumo de APIs, es muy común encontrarse con la necesidad de filtrar un recurso utilizando múltiples valores para una misma clave. Por ejemplo, es posible que quieras solicitar una lista de productos que pertenezcan a varias categorías simultáneamente, o buscar usuarios que tengan diferentes tipos de roles.

La biblioteca `requests` gestiona esta situación de forma nativa permitiéndote pasar listas de Python como valores dentro del diccionario de parámetros.

### Comportamiento por defecto de `requests` con listas

Cuando una clave de tu diccionario contiene una lista, `requests` duplica la clave en la URL final para cada uno de los elementos presentes en dicha lista. Este es el comportamiento estándar más extendido en el diseño de APIs REST.

El siguiente ejemplo práctico demuestra cómo se procesa esta estructura:

```python
import requests

url_base = "https://api.tienda.com/v1/productos"

# Definimos un parámetro cuyo valor es una lista de Python
parametros = {
    "categoria": ["libros", "electronica", "juegos"],
    "disponible": "true"
}

respuesta = requests.get(url_base, params=parametros)

print(respuesta.url)

```

Al inspeccionar el resultado en la consola, verás cómo se ha construido la dirección:

```text
https://api.tienda.com/v1/productos?categoria=libros&categoria=electronica&categoria=juegos&disponible=true

```

Como puedes observar, la clave `categoria` se repite de manera consecutiva por cada elemento que añadiste a la lista original, manteniendo intactos los demás parámetros planos como `disponible`.

### Representaciones alternativas de listas en APIs

Aunque la duplicación de claves (`clave=valor1&clave=valor2`) es el estándar por defecto que genera `requests`, no todas las APIs backend están programadas para interpretar las listas de esta manera. Existen otras dos convenciones de diseño muy populares en la web:

1. **Separación por comas:** `?categoria=libros,electronica,juegos`
2. **Notación de corchetes explícitos:** `?categoria[]=libros&categoria[]=electronica`

Si la API con la que estás interactuando requiere alguno de estos formatos alternativos, pasar una lista directamente en el diccionario de `requests` no funcionará como esperas. A continuación, se detalla cómo abordar estas situaciones:

#### Solución para APIs que esperan separación por comas

Si el servidor requiere los elementos unidos por comas, la solución más limpia es transformar la lista en una sola cadena de texto utilizando el método `.join()` de Python antes de armar el diccionario:

```python
import requests

categorias = ["libros", "electronica", "juegos"]

parametros = {
    # Unimos los elementos de la lista con una coma
    "categoria": ",".join(categorias), 
    "disponible": "true"
}

respuesta = requests.get("https://api.tienda.com/v1/productos", params=parametros)
print(respuesta.url)
# Resultado: ...?categoria=libros,electronica,juegos&disponible=true

```

#### Solución para APIs que esperan corchetes (`[]`)

Si el backend está construido en frameworks que requieren corchetes para mapear arrays (común en entornos como PHP o Ruby on Rails), debes incluir los corchetes explícitamente en el nombre de la clave del diccionario:

```python
import requests

parametros = {
    # Añadimos los corchetes al nombre de la clave
    "categoria[]": ["libros", "electronica", "juegos"]
}

respuesta = requests.get("https://api.tienda.com/v1/productos", params=parametros)
print(respuesta.url)
# Resultado: ...?categoria%5B%5D=libros&categoria%5B%5D=electronica...
# Nota: %5B y %5D son la codificación web de los caracteres [ y ]

```

## 3.4. Codificación automática de URLs

La codificación de URLs, técnicamente conocida como *Percent-encoding* o codificación por porcentajes, es un mecanismo diseñado para mapear caracteres especiales dentro de una URL de forma que puedan ser transmitidos de manera segura a través de Internet bajo el protocolo HTTP.

Las URLs tienen un conjunto estrictamente limitado de caracteres permitidos (letras del alfabeto inglés, números y unos pocos símbolos sin reservar). Cualquier otro elemento, como un espacio en blanco, una letra con tilde, una "ñ" o caracteres con funciones sintácticas específicas dentro de la propia web (como `?`, `&` o `=`), debe convertirse a un formato seguro.

Una de las mayores ventajas de usar la biblioteca `requests` es que realiza esta codificación de forma **completamente automática y transparente** cuando utilizas el argumento `params`.

### El alfabeto de las URLs: Caracteres reservados y no reservados

Para entender por qué es necesaria la codificación, la especificación de Internet divide los caracteres en dos grandes grupos:

* **Caracteres no reservados:** Letras mayúsculas y minúsculas (`A-Z`, `a-z`), números (`0-9`), y los símbolos guion (`-`), punto (`.`), guion bajo (`_`) y tilde (`~`). Estos caracteres nunca se modifican.
* **Caracteres reservados:** Símbolos que tienen un significado especial en la estructura de la red (como `:`, `/`, `?`, `#`, `[`, `]`, `@`, `!`, `$`, `&`, `'`, `(`, `)`, `*`, `+`, `,`, `;`, `=`). Si se usan como datos comunes (por ejemplo, buscar el término "python+requests"), deben codificarse para no romper la sintaxis de la petición.

### ¿Cómo funciona la codificación por porcentajes?

Cuando `requests` encuentra un carácter que requiere codificación, lo convierte a su valor correspondiente en el mapa de caracteres de la web y lo antepone con el símbolo `%`.

A continuación, se presenta una tabla de equivalencias con los caracteres especiales más habituales que manejamos en el idioma español y en las búsquedas cotidianas:

| Carácter original | Significado / Uso común | Equivalente codificado |
| --- | --- | --- |
| *(Espacio)* | Separador de palabras | `%20` (o a veces `+`) |
| `á` / `ó` / `ñ` | Caracteres no ingleses (Unicode) | `%C3%A1` / `%C3%B3` / `%C3%B1` |
| `&` | Separador de parámetros | `%26` |
| `=` | Asignación de valor | `%3D` |
| `?` | Inicio de la query string | `%3F` |
| `/` | Separador de rutas | `%2F` |
| `:` | Separador de protocolo o puerto | `%3A` |

### Ejemplo práctico controlado

Si intentas enviar una consulta de búsqueda que incluya espacios, acentos, e incluso símbolos reservados simulando datos de usuario, verás cómo `requests` neutraliza cualquier posible fallo de sintaxis:

```python
import requests

url_base = "https://api.ejemplo.com/buscar"

# Parámetros con múltiples caracteres que requieren codificación
parametros_complejos = {
    "usuario": "Ibáñez Pérez",
    "filtro": "precio>=100&categoria=música"
}

respuesta = requests.get(url_base, params=parametros_complejos)

# Imprimimos la URL real generada por la biblioteca
print(respuesta.url)

```

La URL final que viajará hacia el servidor web se transformará automáticamente en la siguiente cadena segura:

```text
https://api.ejemplo.com/buscar?usuario=Ib%C3%A1%C3%B1ez+P%C3%A9rez&filtro=precio%3E%3D100%26categoria%3Dm%C3%BAsica

```

### Análisis del resultado codificado

* El espacio en blanco entre "Ibáñez" y "Pérez" fue sustituido por un símbolo `+` (una convención perfectamente válida y equivalente a `%20` en los parámetros de consulta).
* La `á` se transformó en `%C3%A1`, la `ñ` en `%C3%B1` y la `ú` en `%C3%BAsica`.
* Los caracteres `>=` y `&` que formaban parte del valor del filtro se convirtieron en `%3E%3D` y `%26` respectivamente. Esto es crucial: si el símbolo `&` no se hubiese codificado, el servidor del backend habría interpretado erróneamente que `categoria` era un parámetro nuevo en lugar de parte del texto de búsqueda original.

Al delegar esta tarea en `requests`, te aseguras de que tu aplicación sea robusta ante cualquier tipo de entrada de texto introducida por tus usuarios, eliminando por completo la posibilidad de generar URLs corruptas o malformadas.

## Resumen del capítulo

En este **Capítulo 3: Parámetros y URLs**, hemos aprendido a enviar información dinámica hacia los servidores mediante los parámetros de consulta (*query parameters*).

1. Comenzamos definiendo la estructura de estos parámetros, identificando el papel que juegan los delimitadores `?`, `=` y `&` dentro de cualquier URL estándar de Internet.
2. Aprendimos a sustituir la peligrosa y rígida concatenación manual de cadenas utilizando diccionarios de Python a través del argumento `params` en el método `requests.get()`.
3. Evaluamos cómo manejar colecciones de datos complejas mediante el uso de listas, comprendiendo el comportamiento por defecto de duplicación de claves y analizando cómo adaptarnos a backends con requisitos de diseño específicos (como la separación por comas o el uso de corchetes).
4. Finalmente, estudiamos la importancia de la codificación automática por porcentajes (*Percent-encoding*), confirmando cómo la biblioteca aísla y transforma de manera transparente los caracteres especiales, espacios y símbolos reservados para garantizar la integridad de las peticiones HTTP.
