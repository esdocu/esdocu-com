Cuando trabajas con APIs y servidores web, no siempre recibirás respuestas ligeras o textos breves. Al enfrentarte a archivos de gran tamaño, videos o flujos continuos de datos, el comportamiento predeterminado de descargar todo el contenido directamente en la memoria RAM puede saturar tu aplicación y provocar fallos críticos del sistema.

Este capítulo aborda las técnicas de transmisión de datos (*streaming*) en la biblioteca `requests`. Aprenderás a configurar peticiones eficientes para recibir información bajo demanda, a procesar archivos de texto línea por línea y a descargar elementos binarios masivos en bloques optimizados, manteniendo un control total del flujo desde el cliente.

## 16.1. Habilitar peticiones en modo stream

Por defecto, cuando realizas una petición con la biblioteca `requests`, la respuesta del servidor se descarga inmediatamente en la memoria de tu equipo antes de que el código continúe con la siguiente línea. Si estás solicitando una página web ligera o una respuesta JSON pequeña, este comportamiento es ideal porque te permite acceder a los datos al instante.

Sin embargo, cuando intentas descargar un archivo de gran tamaño (como un vídeo de varios gigabytes o un conjunto de datos masivo), este comportamiento predeterminado obliga a `requests` a meter todo el archivo en la memoria RAM de golpe. Esto puede provocar un consumo excesivo de recursos o hacer que tu aplicación colapse debido a un error de falta de memoria (Out of Memory).

Para solucionar esto, `requests` ofrece el modo de transmisión o **streaming**. Al activar este modo, la biblioteca realiza la petición y descarga únicamente las cabeceras HTTP de la respuesta. La conexión permanece abierta y el cuerpo del mensaje se mantiene en el búfer de la red, esperando a que decidas cómo y cuándo procesar los datos.

```text
Modo Predeterminado:
[Servidor] === Todo el cuerpo de la respuesta ===> [Memoria RAM] ===> [Tu Código]

Modo Stream (stream=True):
[Servidor] === Solo Cabeceras ===> [Tu Código (Conexión abierta)]
                                         |
                                         v
                            (Pides datos bajo demanda)

```

### El parámetro `stream=True`

Para activar la transmisión de datos, debes pasar el parámetro opcional `stream=True` dentro de las funciones de petición como `requests.get()`, `requests.post()`, etc.

El siguiente bloque de código muestra cómo iniciar una petición en modo stream de manera correcta:

```python
import requests

url = "https://speed.hetzner.de/100MB.bin"

# Al usar stream=True, no se descarga el archivo completo todavía
response = requests.get(url, stream=True)

# Podemos verificar el estado y las cabeceras de inmediato
if response.status_code == 200:
    print("Conexión establecida con éxito.")
    print(f"Tipo de contenido: {response.headers.get('Content-Type')}")
    print(f"Tamaño esperado (bytes): {response.headers.get('Content-Length')}")
    
    # IMPORTANTE: Aquí debemos consumir el contenido de forma fragmentada
    # (Esto se detallará en las próximas secciones)
    
    # Cerramos la conexión manualmente si no usamos un gestor de contexto
    response.close()

```

### Importancia de liberar la conexión

Cuando usas `stream=True`, dejas la conexión de red abierta. Esto significa que estás reteniendo recursos tanto en tu máquina como en el servidor remoto. Si abres muchas peticiones en modo stream y no las cierras correctamente, agotarás los sockets disponibles y degradarás el rendimiento del sistema.

Existen dos formas seguras de garantizar que la conexión se cierre una vez que hayas terminado de procesar los datos:

1. **Llamar explícitamente a `response.close()`**: Como se mostró en el ejemplo anterior, esto cierra la conexión subyacente de `urllib3`.
2. **Utilizar un gestor de contexto (`with`)**: Esta es la práctica recomendada por la biblioteca. Al terminar el bloque `with`, `requests` se encarga de cerrar la conexión de red automáticamente, pase lo que pase dentro del código (incluso si ocurre una excepción).

```python
import requests

url = "https://speed.hetzner.de/100MB.bin"

# El bloque 'with' asegura el cierre de la conexión al finalizar
with requests.get(url, stream=True) as response:
    if response.status_code == 200:
        print("Conexión segura y eficiente.")
        # El procesamiento del flujo de datos se realiza dentro de este bloque
        
print("La conexión se ha cerrado automáticamente al salir del bloque 'with'.")

```

### Comportamiento del acceso directo a atributos

Cuando `stream=True` está activo, debes evitar el acceso directo a las propiedades que leen todo el contenido de golpe, a menos que sea estrictamente necesario.

* Si accedes a `response.text` o `response.content`, `requests` se verá obligado a descargar inmediatamente todo el cuerpo restante en la memoria para poder entregártelo, anulando por completo los beneficios del modo stream.
* La forma correcta de interactuar con una petición en modo stream es utilizar métodos de iteración fragmentada (como `iter_content()` o `iter_lines()`), los cuales descargan y procesan los datos en pequeños paquetes lógicos.

## 16.2. Iteración sobre líneas de texto

Cuando trabajas con archivos de texto grandes que están estructurados línea por línea (como archivos de registro o logs, documentos CSV masivos o feeds de datos en formatos como JSON Lines), no es eficiente cargar todo el archivo en memoria. Una vez que has habilitado el modo de transmisión con `stream=True`, la biblioteca `requests` te permite procesar el flujo de datos leyendo una sola línea a la vez.

Para lograr esto de forma limpia y eficiente, el objeto `Response` proporciona el método `iter_lines()`.

### El método `iter_lines()`

El método `iter_lines()` es un generador que lee los datos que van llegando desde el servidor y se detiene cada vez que encuentra un carácter de salto de línea (como `\n` o `\r\n`). Al utilizarlo dentro de un ciclo `for`, puedes procesar cada línea de manera secuencial sin sobrecargar la memoria RAM de tu sistema.

```python
import requests

url = "https://example.com/logs/access.log"

with requests.get(url, stream=True) as response:
    if response.status_code == 200:
        # Iteramos sobre cada línea del flujo de datos
        for linea in response.iter_lines():
            if linea:
                # Nota: En este punto, 'linea' es un objeto de tipo bytes
                print(f"Línea procesada: {linea}")

```

> **Nota de seguridad:** En el ejemplo anterior, incluimos la condición `if linea:`. Esto es una buena práctica porque `iter_lines()` puede devolver líneas vacías si el servidor envía bytes de mantenimiento de actividad (*keep-alive*) para evitar que la conexión se cierre por inactividad.

### Decodificación de caracteres (Bytes vs. Strings)

Por defecto, los fragmentos de datos que obtienes al iterar con `iter_lines()` se devuelven como cadenas de bytes (`bytes`), no como texto tradicional (`str`). Si necesitas trabajar con el texto decodificado, tienes dos opciones:

1. **Decodificar manualmente:** Aplicar el método `.decode()` a cada línea utilizando la codificación adecuada (por lo general, `utf-8`).
2. **Utilizar el parámetro `decode_unicode=True`:** Si pasas este argumento al método, `requests` intentará identificar la codificación basándose en las cabeceras HTTP del servidor y te entregará cadenas de texto (`str`) listas para usar.

A continuación se muestra un ejemplo práctico configurando la decodificación automática y simulando el procesamiento de un archivo CSV de gran tamaño:

```python
import requests

url = "https://example.com/datos_masivos.csv"

with requests.get(url, stream=True) as response:
    # Solicitamos a requests que decodifique los bytes a texto (str)
    lineas_de_texto = response.iter_lines(decode_unicode=True)
    
    for linea in lineas_de_texto:
        if linea:
            # Separamos los campos de la línea de texto de forma segura
            columnas = linea.split(",")
            print(f"ID: {columnas[0]} | Registro: {columnas[1]}")

```

### El parámetro `chunk_size` en texto

El método `iter_lines()` acepta un parámetro opcional llamado `chunk_size`. Este parámetro determina la cantidad de bytes que `requests` lee e introduce en la memoria intermedia antes de buscar los saltos de línea.

Si no especificas un valor, la biblioteca asigna un tamaño predeterminado (normalmente 512 bytes). Modificar este valor altera la eficiencia de la lectura en redes de alta velocidad:

* **Valores más grandes (ej. 1024, 4096):** Reducen la cantidad de llamadas al sistema de red, lo que puede acelerar el procesamiento de archivos masivos.
* **Valores más pequeños:** Ofrecen una respuesta más inmediata si necesitas procesar la información en tiempo real conforme se va generando en el servidor.

```python
# Ejemplo especificando un búfer de 1 KB para la lectura de líneas
for linea in response.iter_lines(chunk_size=1024, decode_unicode=True):
    if linea:
        print(linea)

```

## 16.3. Descarga de archivos por bloques

Cuando el objetivo no es procesar texto línea por línea, sino descargar un archivo binario (como un instalador `.exe`, un archivo comprimido `.zip`, un PDF o un vídeo), el método `iter_lines()` no es adecuado. Los archivos binarios no se estructuran mediante saltos de línea y, de hecho, intentar interpretarlos así puede corromper los datos o generar fallos de codificación.

Para estos escenarios, la biblioteca `requests` proporciona el método `iter_content()`. Este método permite descargar el archivo por fragmentos o bloques de bytes (*chunks*) de un tamaño fijo que tú determinas.

### El método `iter_content()` y el control de memoria

Al combinar `stream=True` con `iter_content()`, puedes leer un bloque de datos de la red, escribirlo inmediatamente en el disco duro y liberar esa porción de la memoria RAM antes de solicitar el siguiente bloque. De este modo, el consumo de memoria de tu script permanece constante y mínimo (apenas unos cuantos kilobytes), sin importar si el archivo que estás descargando pesa 10 megabytes o 50 gigabytes.

```text
Flujo de descarga por bloques:
[Servidor] ---> [Búfer de red (chunk_size)] ---> [Escribir en Disco] ---> [Liberar RAM]

```

### Implementación práctica

El siguiente ejemplo muestra la estructura recomendada para descargar un archivo binario grande y guardarlo de forma segura en el almacenamiento local utilizando un gestor de contexto doble: uno para mantener la conexión de red y otro para la escritura del archivo en modo binario (`wb`).

```python
import requests

url = "https://speed.hetzner.de/100MB.bin"
archivo_destino = "archivo_100mb.bin"

# 1. Habilitamos el modo stream
with requests.get(url, stream=True) as response:
    response.raise_for_status() # Aseguramos que la petición fue exitosa
    
    # 2. Abrimos el archivo local en modo de escritura binaria ('wb')
    with open(archivo_destino, "wb") as archivo_local:
        
        # 3. Iteramos por bloques de 8192 bytes (8 KB)
        for bloque in response.iter_content(chunk_size=8192):
            # Filtrar bloques de mantenimiento de actividad (keep-alive)
            if bloque:
                archivo_local.write(bloque)

print("Descarga completada con éxito sin saturar la memoria RAM.")

```

### Configuración óptima de `chunk_size`

El parámetro `chunk_size` define el número de bytes que se guardarán en el búfer antes de ser procesados o guardados en el disco. La elección de este número influye directamente en el rendimiento de la descarga:

* **Valores muy bajos (ej. `chunk_size=1` o `128`):** Provocan que tu código realice demasiadas operaciones de lectura/escritura (I/O). Esto genera un cuello de botella en el procesador y ralentiza significativamente la descarga.
* **Valores muy altos (ej. `chunk_size=1048576` — 1 MB o más):** Consumen más memoria RAM de forma simultánea, restando efectividad al uso del modo stream.

Por lo general, se recomienda utilizar potencias de 2 que se alineen con los tamaños de bloque nativos de los sistemas operativos y los búferes de red. Los valores estándar más eficientes suelen oscilar entre **4096 bytes (4 KB)** y **16384 bytes (16 KB)**. Si el servidor remoto o tu conexión de red son excepcionalmente rápidos, configurarlo en **1048576 bytes (1 MB)** puede arañar algo de velocidad extra a costa de un consumo de memoria ligeramente superior.

## 16.4. Control del flujo del lado del cliente

El control del flujo del lado del cliente se refiere a la capacidad que tienes como desarrollador para decidir de forma dinámica cuándo leer datos del socket de red, a qué velocidad procesarlos o en qué momento interrumpir la descarga si se cumple una condición específica. Al combinar el parámetro `stream=True` con un consumo manual de los bytes, el cliente (tu script de Python) asume por completo el control de la conexión.

Esto es útil para implementar límites de descarga (por ejemplo, dejar de descargar si el archivo supera cierto tamaño real), realizar pausas voluntarias para no saturar el ancho de banda, o cancelar la transferencia si los datos iniciales no cumplen con los requisitos de tu aplicación.

### Interrupción temprana de la descarga

En muchas ocasiones, el servidor no proporciona la cabecera `Content-Length` (el tamaño total del archivo). En lugar de arriesgarte a descargar un flujo infinito de datos o un archivo demasiado grande para el almacenamiento local, puedes evaluar el tamaño acumulado dentro del ciclo de lectura e interrumpir la transferencia con un comando `break`.

```python
import requests

url = "https://speed.hetzner.de/100MB.bin"
limite_maximo_bytes = 10 * 1024 * 1024  # Límite estricto de 10 MB
bytes_descargados = 0

with requests.get(url, stream=True) as response:
    response.raise_for_status()
    
    with open("descarga_parcial.bin", "wb") as archivo:
        for bloque in response.iter_content(chunk_size=4096):
            if bloque:
                archivo.write(bloque)
                bytes_descargados += len(bloque)
                
                # Control del lado del cliente: evaluamos y decidimos parar
                if bytes_descargados > limite_maximo_bytes:
                    print("Descarga interrumpida: Se ha alcanzado el límite de 10 MB.")
                    break

# Gracias al bloque 'with', la conexión se cierra de inmediato al salir

```

Al ejecutar el comando `break`, sales del ciclo de iteración. Como estás utilizando el gestor de contexto `with`, `requests` se encarga de cortar la comunicación con el servidor de manera limpia, evitando el desperdicio de transferencia de red para ambas partes.

### El peligro de dejar datos sin leer

Si decides no usar un gestor de contexto (`with`) y rompes el ciclo de lectura de forma prematura mediante un `break` o una excepción, el comportamiento de la biblioteca depende de cómo manejes el objeto de respuesta:

* Si simplemente dejas que la variable `response` salga de su ámbito de existencia o la destruyes, `requests` se verá obligado a descargar el resto del contenido del cuerpo de la respuesta de fondo de manera automática para poder liberar la conexión de red interna y devolverla al pool de conexiones.
* Si deseas cancelar la descarga de forma fulminante y descartar los bytes restantes sin descargarlos, debes llamar de inmediato al método `response.close()`.

## Resumen del capítulo

En este capítulo hemos aprendido a gestionar de manera eficiente el consumo de memoria RAM al interactuar con grandes volúmenes de datos utilizando la biblioteca `requests`:

* **Modo Stream:** Aprendimos que al configurar `stream=True`, `requests` pospone la descarga del cuerpo de la respuesta, manteniendo la conexión de red abierta para su consumo bajo demanda.
* **Procesamiento de Texto:** Estudiamos cómo utilizar el método `iter_lines()` para procesar flujos de datos masivos estructurados de forma textual (como archivos de log o CSV), leyendo y decodificando una única línea a la vez.
* **Descarga Binaria:** Analizamos el uso de `iter_content()` para segmentar descargas de archivos binarios grandes en bloques fijos de bytes (`chunk_size`), permitiendo guardarlos directamente en el disco duro con un impacto mínimo en la memoria del sistema.
* **Control del Cliente:** Finalmente, vimos cómo el cliente puede gobernar el flujo de la conexión, permitiendo la interrupción de descargas basadas en criterios lógicos personalizados antes de que se complete la transferencia total.

## Conclusión: El camino hacia la maestría en HTTP

¡Enhorabuena! Has recorrido un viaje completo desde la instalación básica de la biblioteca `requests` hasta el dominio de técnicas avanzadas como la transmisión de datos por bloques, la optimización de sesiones y la configuración de adaptadores de transporte personalizados.

A lo largo de este libro, has adquirido las habilidades necesarias para interactuar con APIs modernas de forma segura, eficiente y robusta. Ahora cuentas con el criterio para diseñar integraciones limpias, manejar errores de red con elegancia y proteger el rendimiento de tus aplicaciones frente a grandes volúmenes de datos. El ecosistema web evoluciona de forma constante, pero los fundamentos HTTP que has consolidado aquí te guiarán con éxito en cualquier proyecto de Python que decidas emprender.
