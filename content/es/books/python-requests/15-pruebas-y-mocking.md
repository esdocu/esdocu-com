Garantizar la estabilidad de una aplicación que consume APIs externas requiere probar su código sin depender de una conexión activa a internet. Las peticiones reales ralentizan los tests, introducen inestabilidad por cambios en el servidor y pueden corromper datos remotos.

Este capítulo introduce el concepto de mocking en HTTP, una técnica para interceptar solicitudes salientes y devolver respuestas simuladas controladas localmente. A través de herramientas clave como las bibliotecas `responses` y `requests-mock`, aprenderás a simular escenarios exitosos, códigos de error y fallos críticos de red (como timeouts o caídas de conexión) de forma rápida, segura y completamente offline.

## 15.1. Introducción al mocking en HTTP

Al desarrollar aplicaciones que interactúan con APIs externas mediante la biblioteca `requests`, las pruebas unitarias presentan un desafío evidente: la dependencia de una infraestructura de red externa. Si un servidor remoto está caído, responde con lentitud o introduce cambios inesperados en sus datos, tus pruebas fallarán por razones ajenas a la calidad de tu propio código.

El **mocking en HTTP** es una técnica de desarrollo que consiste en interceptar las peticiones de red salientes y sustituir las respuestas reales del servidor por respuestas simuladas ("mocks") controladas localmente.

En lugar de permitir que `requests` abra una conexión TCP real hacia internet, las herramientas de mocking interceptan la llamada en las capas internas de la biblioteca (generalmente a nivel de `urllib3` o del adaptador de transporte) y devuelven un objeto `Response` preconfigurado de forma inmediata.

```text
[ FLUJO DE PETICIÓN TRADICIONAL ]
Tu Código ---> requests ---> (Internet) ---> Servidor Real API
                                                  |
Tu Código <--- requests <--- (Internet) <--- Respuesta Real

[ FLUJO DE PETICIÓN CON MOCKING ]
Tu Código ---> requests ---> [ Interceptor de Mocking ] (Bloquea salida a Internet)
                                    |
Tu Código <--- requests <-----------+ (Devuelve respuesta simulada local)

```

### Por qué evitar las peticiones reales en las pruebas

Realizar peticiones HTTP reales a producción o entornos de prueba de terceros durante la ejecución de tests automatizados introduce múltiples problemas:

* **Determinismo y predictibilidad:** Las pruebas deben ser deterministas; bajo las mismas condiciones, siempre deben arrojar el mismo resultado. Las APIs reales cambian sus datos constantemente, lo que genera pruebas inestables (*flaky tests*).
* **Velocidad de ejecución:** Una suite de pruebas de calidad debe ejecutarse en pocos segundos. Las conexiones de red introducen latencias por resolución DNS, apretón de manos SSL (SSL handshake) y procesamiento del servidor que ralentizan drásticamente el proceso de integración continua.
* **Costes y límites de cuota (Rate Limiting):** Muchas APIs comerciales cobran por volumen de peticiones o bloquean temporalmente las direcciones IP que realizan solicitudes de manera repetitiva en intervalos cortos de tiempo.
* **Efectos secundarios destructivos:** Probar métodos que alteran el estado del servidor (como `POST`, `PUT` o `DELETE`) puede corromper datos de producción, duplicar registros o activar alertas y flujos de trabajo no deseados en sistemas externos.
* **Dificultad para simular escenarios extremos:** Es extremadamente complejo forzar a un servidor real a devolver un error interno `500 Oh No`, a corromper el formato de un JSON, o a tardar exactamente 30 segundos en responder para validar cómo reacciona tu código ante fallos de timeout.

### Mecanismos de Mocking en el ecosistema de Python

Dentro del ecosistema de pruebas de Python, existen diferentes aproximaciones para aislar las peticiones de `requests`:

1. **`unittest.mock.patch` (Librería estándar):** Permite reemplazar las funciones o métodos de `requests` (como `requests.get` o `requests.post`) con instancias de `Mock` o `MagicMock`. Aunque es útil para casos muy sencillos, requiere que configures manualmente todas las propiedades del objeto `Response` devuelto (`status_code`, `text`, `json`, etc.), lo que se vuelve tedioso y propenso a errores.
2. **Bibliotecas especializadas basadas en interceptores:** Herramientas como `responses` o `requests-mock`. Estas herramientas no alteran directamente las funciones de tu código, sino que se integran de forma limpia con los mecanismos internos de transporte de `requests`. Te permiten definir reglas semánticas del tipo: *"Cuando se intente acceder a la URL X mediante GET, responde con un código 200 y este JSON"*.

A continuación se muestra un ejemplo conceptual de cómo el uso de mocks te permite probar la lógica de tu aplicación de forma segura. Imagina una función que procesa información climática y toma decisiones basadas en el código de estado:

```python
import requests

def obtener_temperatura_alerta(ciudad):
    """Obtiene la temperatura y lanza una alerta si supera los 40°C."""
    url = f"https://api.clima-ficticio.com/v1/actual?q={ciudad}"
    try:
        respuesta = requests.get(url, timeout=5)
        if respuesta.status_code == 200:
            datos = respuesta.json()
            temp = datos.get("temperatura", 0)
            if temp > 40:
                return "ALERTA_CALOR"
            return "NORMAL"
        elif respuesta.status_code == 404:
            return "CIUDAD_NO_ENCONTRADA"
        else:
            return "ERROR_SERVICIO"
    except requests.exceptions.Timeout:
        return "ERROR_TIMEOUT"

```

Sin mocking, probar los cuatro caminos posibles de ejecución (`NORMAL`, `ALERTA_CALOR`, `CIUDAD_NO_ENCONTRADA` y `ERROR_TIMEOUT`) dependería completamente del estado del servidor en la nube de `api.clima-ficticio.com`. Mediante el mocking HTTP (que detallaremos en las siguientes secciones con herramientas específicas), puedes forzar localmente cada escenario simulando con exactitud los bytes y comportamientos que `requests` procesaría en la vida real.

## 15.2. Uso de la biblioteca responses

La biblioteca `responses` es una de las herramientas más populares y recomendadas para hacer mocking de peticiones HTTP cuando utilizas `requests`. Su principal ventaja es que intercepta las peticiones directamente en el adaptador de transporte interno (`requests.adapters.HTTPAdapter`), lo que significa que tu código sigue llamando a `requests.get()` o `requests.post()` de manera completamente natural, pero la petición nunca sale a internet.

Para comenzar a utilizarla, primero debes asegurarte de tenerla instalada en tu entorno virtual:

```bash
pip install responses

```

### Configuración básica con el decorador `@responses.activate`

La forma más común y limpia de usar `responses` es mediante el decorador `@responses.activate`. Este decorador se coloca encima de tu función de prueba. Al hacerlo, `responses` interceptará automáticamente cualquier petición HTTP realizada dentro de ese bloque y, al finalizar la función, restaurará el comportamiento normal de `requests`.

Si tu código intenta realizar una petición a una URL que no ha sido previamente registrada en la configuración del mock, `responses` lanzará una excepción de tipo `ConnectionError`, protegiendo de forma efectiva tus pruebas contra llamadas accidentales a la red real.

El siguiente ejemplo muestra cómo configurar una simulación básica para una petición `GET` que devuelve un JSON:

```python
import requests
import responses

@responses.activate
def test_obtener_datos_usuario_exito():
    # 1. Registrar la URL simulada y definir su comportamiento
    responses.add(
        method=responses.GET,
        url="https://api.ejemplo.com/usuarios/1",
        json={"id": 1, "nombre": "Alicia", "rol": "admin"},
        status=200
    )

    # 2. Ejecutar el código que hace la petición HTTP
    respuesta = requests.get("https://api.ejemplo.com/usuarios/1")
    
    # 3. Verificar que la respuesta interceptada contiene los datos simulados
    assert respuesta.status_code == 200
    assert respuesta.json() == {"id": 1, "nombre": "Alicia", "rol": "admin"}

```

### Parámetros principales de `responses.add()`

El método `responses.add()` es el núcleo de la biblioteca y te permite moldear con precisión la respuesta que va a recibir tu aplicación. Los argumentos más utilizados son:

* **`method`**: El método HTTP que deseas interceptar (`responses.GET`, `responses.POST`, `responses.PUT`, `responses.DELETE`, etc.).
* **`url`**: La URL exacta (o una expresión regular) que disparará el mock.
* **`json`**: Un diccionario o lista de Python que se convertirá automáticamente en una cadena JSON y se enviará en el cuerpo de la respuesta.
* **`body`**: Utilizado para enviar contenido de texto plano o binario en lugar de JSON. Admite cadenas de texto (`str`) u objetos de bytes (`bytes`).
* **`status`**: El código de estado HTTP entero que debe devolver la respuesta (por defecto es `200`).
* **`headers`**: Un diccionario con las cabeceras HTTP que el servidor simulado adjuntará a la respuesta.

### Simulación de Cabeceras y Códigos de Error

No todas las pruebas evalúan caminos felices. Con `responses` puedes imitar con total fidelidad cabeceras personalizadas de respuesta o estados de error del servidor para garantizar que tus bloques `try/except` o tus validaciones de negocio respondan correctamente.

El siguiente ejemplo simula un escenario donde el recurso no existe (`404 Not Found`) e incluye cabeceras específicas en la respuesta del servidor:

```python
import requests
import responses

@responses.activate
def test_recurso_no_encontrado_con_cabeceras():
    # Configuramos un endpoint que simula un error 404
    responses.add(
        method=responses.GET,
        url="https://api.ejemplo.com/archivo.pdf",
        body="Archivo no encontrado en el servidor",
        status=404,
        headers={"Content-Type": "text/plain", "X-Custom-Header": "ErrorValidacion"}
    )

    respuesta = requests.get("https://api.ejemplo.com/archivo.pdf")

    # Validamos el comportamiento
    assert respuesta.status_code == 404
    assert respuesta.headers["X-Custom-Header"] == "ErrorValidacion"
    assert respuesta.text == "Archivo no encontrado en el servidor"

```

### Uso como Administrador de Contexto (Context Manager)

Si prefieres no decorar funciones enteras o solo necesitas activar el entorno de simulación en una sección muy específica de tu código, puedes usar `responses` como un administrador de contexto mediante la sentencia `with`. Esto es ideal para scripts interactivos o pruebas donde conviven llamadas reales y simuladas.

```python
import requests
import responses

def ejecutar_proceso():
    # Fuera del bloque 'with', requests funciona con normalidad (petición real)
    # requests.get("https://api.real.com")

    with responses.RequestsMock() as rsps:
        # Dentro del bloque, las peticiones están interceptadas
        rsps.add(
            method=responses.POST,
            url="https://api.ejemplo.com/crear",
            status=201
        )
        
        respuesta = requests.post("https://api.ejemplo.com/crear")
        print(f"Estado simulado dentro del contexto: {respuesta.status_code}")

    # Al salir del bloque, se restaura el comportamiento de red estándar

```

## 15.3. Integración con requests-mock

La biblioteca `requests-mock` es otra herramienta fundamental en el ecosistema de Python para simular interacciones de red. A diferencia de `responses`, que funciona registrando configuraciones de manera global o mediante decoradores específicos, `requests-mock` se enfoca en proporcionar un objeto simulado (un adaptador de transporte) que se inyecta directamente dentro de la suite de pruebas.

Es especialmente apreciada por su excelente integración con el framework de pruebas `pytest` mediante fixtures y por su flexibilidad para manejar patrones de URLs más avanzados.

Para comenzar a utilizarla, añádela a tu entorno de desarrollo:

```bash
pip install requests-mock

```

### El decorador `@requests_mock.Mocker()`

De manera similar a otras herramientas, puedes usar un decorador para envolver tus funciones de prueba. Cuando utilizas el decorador de `requests-mock`, la biblioteca pasa automáticamente un objeto simulado (convencionalmente llamado `m`) como primer argumento a tu función de prueba. A través de este objeto registrarás tus comportamientos esperados empleando el método `.get()`, `.post()`, `.put()`, etc.

```python
import requests
import requests_mock

@requests_mock.Mocker()
def test_consulta_perfil_usuario(m):
    # Registrar el endpoint simulado directamente en el objeto 'm'
    m.get(
        "https://api.servicio.com/v1/perfil", 
        json={"usuario": "carlos_dev", "activo": True},
        status_code=200
    )

    # El código ejecuta la petición apuntando a la infraestructura simulada
    respuesta = requests.get("https://api.servicio.com/v1/perfil")
    
    assert respuesta.status_code == 200
    assert respuesta.json()["usuario"] == "carlos_dev"

```

### Integración directa con pytest (Uso de Fixtures)

Si utilizas `pytest` como tu ejecutor de pruebas, no necesitas importar el decorador ni añadirlo encima de cada función. Al instalar `requests-mock`, la biblioteca registra una fixture global llamada `requests_mock`. Puedes solicitarla simplemente declarándola como un parámetro en tu función de test, lo que produce un código mucho más idiomático y compacto.

```python
import requests

def test_actualizacion_inventario(requests_mock):
    # 'requests_mock' es provisto de forma automática por pytest
    requests_mock.post(
        "https://api.servicio.com/v1/inventario",
        json={"estado": "actualizado"},
        status_code=202
    )

    respuesta = requests.post("https://api.servicio.com/v1/inventario", json={"item_id": 45})
    
    assert respuesta.status_code == 202
    assert respuesta.json() == {"estado": "actualizado"}

```

### Coincidencias parciales y comodines en URLs

Una de las características más potentes de `requests-mock` es su capacidad para capturar peticiones basándose en coincidencias parciales de texto o mediante comodines. Esto evita tener que registrar decenas de URLs idénticas cuando solo cambian pequeñas variables de consulta o IDs en las rutas.

* **`requests_mock.ANY`**: Actúa como un comodín absoluto para interceptar cualquier URL bajo un método determinado.
* **Comodines de ruta parcial**: Permite interceptar peticiones basándose en expresiones o coincidir solo con texto parcial si omites el host o usas expresiones regulares.

El siguiente ejemplo demuestra cómo capturar llamadas utilizando `requests_mock.ANY` y cómo manejar rutas dinámicas en las que el ID del recurso cambia en cada ejecución:

```python
import requests
import requests_mock

@requests_mock.Mocker()
def test_comportamiento_con_comodines(m):
    # Caso 1: Coincidir con cualquier petición GET a un dominio sin importar los parámetros
    m.get("https://api.servicio.com/v1/metricas?historico=true", text="metrica_antigua")
    
    # Caso 2: Usar requests_mock.ANY para interceptar CUALQUIER petición POST
    m.post(requests_mock.ANY, json={"confirmacion": "recibido"}, status_code=200)

    # Ejecución de llamadas
    respuesta_post = requests.post("https://un-dominio-cualquiera.org/procesar")
    
    assert respuesta_post.status_code == 200
    assert respuesta_post.json()["confirmacion"] == "recibido"

```

### Inspección de la petición recibida

Además de inyectar respuestas, `requests-mock` te permite realizar aserciones rigurosas sobre los datos que tu código envió al servidor simulado. El objeto inyectado guarda un historial de las peticiones que lo impactaron, accesibles mediante la propiedad `request_history`. Cada elemento de este historial expone propiedades detalladas de la solicitud original.

```python
import requests

def test_verificar_datos_enviados(requests_mock):
    mock_endpoint = requests_mock.post("https://api.ejemplo.com/auth", json={"token": "abc"})

    # Código de la aplicación que realiza la llamada
    requests.post("https://api.ejemplo.com/auth", json={"user": "admin", "pass": "secret"})

    # 1. Verificar si el endpoint fue llamado exactamente una vez
    assert mock_endpoint.called
    assert mock_endpoint.call_count == 1

    # 2. Inspeccionar detalladamente la última petición recibida
    ultima_peticion = mock_endpoint.last_request
    
    assert ultima_peticion.method == "POST"
    # El cuerpo de la petición se almacena como texto; lo decodificamos para validar su JSON
    assert ultima_peticion.json() == {"user": "admin", "pass": "secret"}

```

## 15.4. Simulación de errores de red

En entornos de producción, las peticiones HTTP no siempre fallan debido a códigos de estado de error (como un `404` o un `500`). En muchas ocasiones, los problemas ocurren antes de que el servidor pueda siquiera emitir una respuesta: la conexión se interrumpe abruptamente, el nombre de dominio no se resuelve, o el servidor tarda demasiado tiempo en responder y el cliente corta la comunicación.

Para construir aplicaciones resilientes, es fundamental probar cómo reacciona tu código ante estas fallas de bajo nivel. Tanto `responses` como `requests-mock` te permiten forzar excepciones de red nativas de `requests` de manera controlada, sin necesidad de desconectar tu equipo de internet.

### Provocar excepciones con la biblioteca `responses`

Para simular una falla de red con `responses`, debes pasar una instancia de la excepción que deseas lanzar directamente en el argumento `body` del método `responses.add()`. En lugar de devolver un objeto de respuesta simulado, la biblioteca interceptará la petición y arrojará la excepción configurada de inmediato de cara a tu aplicación.

```python
import requests
import responses

@responses.activate
def test_simulacion_caida_red_con_responses():
    # Configuramos el mock para que lance un error de conexión estricto
    responses.add(
        method=responses.GET,
        url="https://api.critica.com/datos",
        body=requests.exceptions.ConnectionError("Fallo en la resolución DNS o caída de enlace")
    )

    # Validamos que nuestro código maneje correctamente la excepción esperada
    try:
        requests.get("https://api.critica.com/datos", timeout=5)
        assert False, "La petición debería haber fallado antes de esta línea"
    except requests.exceptions.ConnectionError as e:
        assert "Fallo en la resolución DNS" in str(e)

```

### Provocar excepciones con `requests-mock`

La biblioteca `requests-mock` expone una interfaz dedicada para este propósito mediante el parámetro `exc`. Al registrar un endpoint simulado, puedes asignarle directamente la clase o instancia de la excepción de `requests` que requieras validar.

```python
import requests

def test_simulacion_timeout_con_requestsmock(requests_mock):
    # Simulamos un escenario de Timeout de lectura/conexión
    requests_mock.get(
        "https://api.lenta.com/reporte",
        exc=requests.exceptions.Timeout("El servidor tardó demasiado en responder")
    )

    # Verificamos la captura del error dentro de la lógica del cliente
    try:
        requests.get("https://api.lenta.com/reporte")
        assert False, "Se esperaba una excepción de tipo Timeout"
    except requests.exceptions.Timeout as e:
        assert "tardó demasiado" in str(e)

```

### Flujo recomendado para pruebas de resiliencia

Al escribir código productivo, cada petición a una API externa debería estar envuelta en estructuras de control que reaccionen adecuadamente según el tipo de fallo de red. El siguiente bloque de código ilustra un caso de uso real donde se combinan los conceptos aprendidos para probar una función con reintentos mínimos o lógica de contingencia:

```python
import requests
import responses

def descargar_configuracion_segura():
    """Intenta descargar la configuración. Si hay error de red, usa valores locales."""
    url = "https://api.sistema.com/config"
    try:
        respuesta = requests.get(url, timeout=2)
        respuesta.raise_for_status()
        return respuesta.json()
    except (requests.exceptions.ConnectionError, requests.exceptions.Timeout):
        # Lógica de contingencia ante fallos críticos de infraestructura
        return {"modo": "mantenimiento_local", "cache": True}

@responses.activate
def test_contingencia_por_error_infraestructura():
    # Forzamos un error de timeout
    responses.add(
        method=responses.GET,
        url="https://api.sistema.com/config",
        body=requests.exceptions.Timeout("Read timeout")
    )

    # Comprobamos que la función no se rompe y activa el plan de contingencia
    resultado = descargar_configuracion_segura()
    assert resultado["modo"] == "mantenimiento_local"
    assert resultado["cache"] is True

```

## Resumen del capítulo

En este **Capítulo 15**, hemos explorado cómo aislar de forma completa nuestras aplicaciones de las dependencias de red externas mediante el mocking en HTTP.

Comenzamos analizando por qué realizar peticiones reales durante las fases de pruebas automatizadas atenta contra la velocidad, el determinismo y la seguridad de los datos. Posteriormente, profundizamos en el uso de la biblioteca `responses`, aprendiendo a interceptar llamadas `GET` y `POST` mediante decoradores y administradores de contexto. También descubrimos la versatilidad de `requests-mock`, su integración nativa con las fixtures de `pytest` y su facilidad para trabajar con comodines en URLs dinámicas. Finalmente, aprendimos a simular fallos críticos de infraestructura (como caídas de conexión y timeouts), dotando a nuestro software de la capacidad de probar flujos de resiliencia ante escenarios extremos del mundo real de forma controlada y offline.
