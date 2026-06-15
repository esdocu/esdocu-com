Las funciones en Dart van más allá de agrupar bloques de código reutilizables. En este capítulo, descubrirás cómo transformar tus funciones en herramientas dinámicas mediante el control avanzado de argumentos y comportamientos.

Exploraremos los parámetros opcionales posicionales y los parámetros nombrados, fundamentales para estructurar firmas limpias y legibles. Además, nos adentraremos en el paradigma funcional aprendiendo a delegar lógica sobre la marcha con funciones anónimas o lambdas. Finalmente, consolidaremos estos conceptos dominando las funciones de orden superior, aquellas capaces de recibir y retornar otras funciones como si fuesen cualquier otro objeto de primera clase.

## 8.1 Parámetros opcionales

En Dart, las funciones son extremadamente flexibles a la hora de recibir información. Por defecto, cuando defines una función con una serie de parámetros, todos ellos se consideran **posicionales obligatorios**. Esto significa que quien invoque la función debe proveer exactamente la misma cantidad de argumentos y en el mismo orden en el que fueron declarados.

Sin embargo, existen escenarios donde ciertos datos no son estrictamente necesarios para que la función realice su trabajo. Para resolver esto sin necesidad de duplicar código o crear múltiples funciones, Dart introduce los **parámetros opcionales**.

En este apartado nos centraremos en los **parámetros opcionales posicionales**, los cuales permiten omitir argumentos al invocar una función, respetando estrictamente el orden en el que fueron definidos.

### Sintaxis básica

Para transformar parámetros obligatorios en opcionales posicionales, se deben envolver entre corchetes `[]` al final de la lista de parámetros de la función.

```dart
// Sintaxis general
void miFuncion(String obl1, [Tipo? opc1, Tipo? opc2]) {
  // Cuerpo de la función
}

```

> **Regla de oro:** Los parámetros opcionales siempre deben colocarse al final de la declaración de la función, justo después de todos los parámetros obligatorios.

### El impacto de Null Safety

Debido a que un parámetro opcional puede no recibir ningún valor durante la invocación, Dart necesita saber qué hacer con esa variable dentro del cuerpo de la función. Bajo el sistema de *Null Safety* (visto en el Capítulo 2), no podemos dejar un parámetro opcional con un tipo no nulo sin inicializar, ya que su valor por defecto sería `null`.

Para gestionar esto, tienes dos alternativas:

1. **Permitir valores nulos:** Declarar el tipo del parámetro como nulo añadiendo el operador `?`.
2. **Asignar un valor por defecto:** Utilizar el operador `=` para proveer un valor de respaldo en caso de que el argumento sea omitido.

### Parámetros opcionales con tipos nulos

Si decides que el parámetro acepte `null`, deberás gestionar manualmente dicha posibilidad dentro de la función utilizando estructuras condicionales.

```dart
void saludar(String nombre, [String? apellido]) {
  if (apellido != null) {
    print('Hola, $nombre $apellido.');
  } else {
    print('Hola, $nombre.');
  }
}

void main() {
  // Invocación con un solo argumento (opcional omitido)
  saludar('Carlos'); // Imprime: Hola, Carlos.

  // Invocación con ambos argumentos
  saludar('Carlos', 'Santana'); // Imprime: Hola, Carlos Santana.
}

```

### Parámetros opcionales con valores por defecto

La forma más limpia y común de trabajar con parámetros opcionales es asignándoles un valor predeterminado en la propia firma de la función. Esto evita tener que lidiar con tipos nulos (`?`) y reduce las comprobaciones repetitivas con `if`.

```dart
void configurarDispositivo(String nombre, [String sistemaOperativo = 'DartOS', int version = 1]) {
  print('Dispositivo: $nombre | SO: $sistemaOperativo | Versión: $version');
}

void main() {
  // Caso 1: Solo el parámetro obligatorio
  configurarDispositivo('Router-X'); 
  // Salida: Dispositivo: Router-X | SO: DartOS | Versión: 1

  // Caso 2: Modificando el primer parámetro opcional
  configurarDispositivo('Phone-Z', 'Android'); 
  // Salida: Dispositivo: Phone-Z | SO: Android | Versión: 1

  // Caso 3: Modificando ambos parámetros opcionales
  configurarDispositivo('Laptop-Y', 'Linux', 12); 
  // Salida: Dispositivo: Laptop-Y | Linux | Versión: 12
}

```

### Restricción del orden posicional

Es fundamental comprender que la opcionalidad está ligada estrictamente a la posición física de los argumentos. Si deseas enviar un valor para el segundo parámetro opcional, **estás obligado** a enviar también el primero.

El siguiente esquema en texto plano ilustra cómo se mapean los argumentos desde la invocación hacia la firma de la función:

```text
Firma de la función:  ( obligatorio, [ opcional1, opcional2 ] )
                             |             |          |
Invocación válida A:  (  "Router-X" )      |          |  <- Toma valores por defecto
                             |             |          |
Invocación válida B:  (   "Phone-Z",   "Android" )    |  <- Opcional2 toma valor por defecto
                             |             |          |
Invocación válida C:  (  "Laptop-Y",   "Linux",   12  )
                             |             |          |
Invocación INVÁLIDA:  (  "Laptop-Y",              12  )  <- Error: 12 se asigna a opcional1

```

Si intentas realizar una llamada como `configurarDispositivo('Laptop-Y', 12)`, el compilador de Dart arrojará un error de tipado. Dart interpretará que `12` corresponde al parámetro `sistemaOperativo` (que espera un `String`) debido a que ocupa la segunda posición.

Para casos donde requieras omitir el primer parámetro opcional pero especificar el segundo, los parámetros opcionales posicionales no son la herramienta adecuada; para ello, Dart ofrece los *parámetros nombrados*, que se analizarán en la siguiente sección.

## 8.2 Parámetros nombrados

A diferencia de los parámetros posicionales, donde el orden de los argumentos determina qué variable recibe cada valor, los **parámetros nombrados** permiten asociar explícitamente un argumento con su nombre correspondiente al invocar la función.

Esta característica es uno de los pilares decorativos y funcionales más importantes de Dart, ampliamente utilizada en frameworks como Flutter para la construcción de interfaces debido a la inmensa claridad que aporta al código.

### Sintaxis básica

Para declarar parámetros nombrados, se deben envolver entre llaves `{}` al final de la lista de parámetros de la función. Al igual que los parámetros opcionales posicionales, por defecto se consideran opcionales, lo que significa que el llamador puede omitirlos.

```dart
// Sintaxis general
void miFuncion(String obligatorio, {Tipo? parametro1, Tipo? parametro2}) {
  // Cuerpo de la función
}

```

Al invocar la función, el orden de los factores no altera el resultado. Es obligatorio anteponer el nombre del parámetro seguido de dos puntos `:` y el valor correspondiente.

```dart
void crearUsuario(String username, {String? email, int? edad}) {
  print('Usuario: $username | Email: $email | Edad: $edad');
}

void main() {
  // El orden de los parámetros nombrados no importa
  crearUsuario('gopher99', edad: 27, email: 'contacto@email.com');
  
  // Se pueden omitir libremente
  crearUsuario('dart_master', email: 'dev@dart.dev');
  crearUsuario('anonymous');
}

```

### Ventajas de los parámetros nombrados

El uso de esta sintaxis mitiga el problema de los "argumentos mágicos" o la confusión posicional cuando una función acepta múltiples valores del mismo tipo.

```text
Mapeo por Nombre (Parámetros Nombrados):

Invocación:      crearUsuario('admin', edad: 30, email: 'a@b.com')
                                        |         |
                                 +------+         +-------+
                                 |                        |
                                 v                        v
Firma de función: (String user, {String? email,     int? edad})

```

* **Legibilidad autodocumentada:** Al leer la invocación, queda inmediatamente claro qué significa cada valor (`edad: 30`) sin necesidad de inspeccionar la definición de la función.
* **Flexibilidad de omisión:** Puedes omitir cualquier parámetro intermedio sin romper la firma ni alterar el orden de los demás argumentos.

### Valores por defecto

Al ser opcionales, si no se envían, su valor por defecto bajo *Null Safety* será `null`. Para evitar trabajar con tipos anulables (`?`), se pueden definir valores predeterminados usando el operador `=`.

```dart
void configurarVentana({String titulo = 'Nueva pestaña', int ancho = 800, int alto = 600}) {
  print('Ventana: "$titulo" de ${ancho}x${alto}px');
}

void main() {
  // Omitimos los primeros dos parámetros y solo modificamos el alto
  configurarVentana(alto: 1080);
  // Salida: Ventana: "Nueva pestaña" de 800x1080px
}

```

### Parámetros nombrados obligatorios: la palabra clave `required`

Existen situaciones donde deseas la legibilidad y el orden flexible de los parámetros nombrados, pero necesitas garantizar que un dato se envíe de manera **obligatoria**.

Para resolver esto, Dart introduce el modificador `required`. Si un parámetro nombrado se marca con `required`, el compilador generará un error si el invocador intenta omitirlo.

```dart
// Al ser 'required', no necesitan ser anulables ni tener valor por defecto
void enviarMensaje({required String remitente, required String mensaje, String etiqueta = 'General'}) {
  print('[$etiqueta] De: $remitente -> Mensaje: $mensaje');
}

void main() {
  // Invocación válida
  enviarMensaje(mensaje: 'Hola mundo', remitente: 'Ana');

  // Error de compilación: Falta el parámetro obligatorio 'mensaje'
  // enviarMensaje(remitente: 'Ana'); 
}

```

> **Nota de diseño:** Un parámetro no puede ser `required` y tener un valor por defecto al mismo tiempo, ya que ambas propiedades se contradicen lógicamente.
>
## 8.3 Funciones anónimas o lambdas

En Dart, la mayoría de las funciones que definimos tienen un nombre asignado, como `main()`, `saludar()` o `crearUsuario()`. Sin embargo, existen situaciones donde necesitamos una función para un uso puntual y rápido, por lo que asignarle un identificador único resulta innecesario. A este tipo de funciones se les conoce como **funciones anónimas**, **lambdas** o *closures*.

Dado que en Dart las funciones son **objetos de primera clase** (es decir, se tratan como cualquier otro valor: pueden asignarse a variables, guardarse en listas o pasarse como argumentos), las funciones anónimas se vuelven indispensables para escribir código compacto y expresivo.

### Sintaxis general

Una función anónima prescinde de la palabra clave del tipo de retorno y del nombre de la función. Conserva únicamente la lista de parámetros entre paréntesis y el bloque de código entre llaves.

```dart
// Sintaxis con bloque de código
(parámetros) {
  // Cuerpo de la función
  return valor;
};

```

A continuación, vemos cómo definir una función anónima y asignarla directamente a una variable:

```dart
void main() {
  // Asignación de una función anónima a una variable
  var duplicar = (int numero) {
    return numero * 2;
  };

  print(duplicar(5)); // Imprime: 10
}

```

### Sintaxis de flecha (Arrow Syntax)

Cuando el cuerpo de una función anónima contiene **una sola línea de código o expresión** que devuelve un valor, la sintaxis se puede simplificar drásticamente utilizando el operador de flecha `=>` (conocido coloquialmente como *fat arrow*).

Esta estructura elimina de forma implícita las llaves `{}` y la palabra clave `return`.

```dart
// Sintaxis de flecha simplificada
(parámetros) => expresión;

```

Reescribiendo el ejemplo anterior con esta sintaxis, el código queda mucho más estilizado:

```dart
void main() {
  // El retorno es implícito tras el operador =>
  var duplicar = (int numero) => numero * 2;

  print(duplicar(10)); // Imprime: 20
}

```

### Uso práctico: Iteración de colecciones

Aunque profundizaremos en el manejo de colecciones en el Capítulo 9, es imposible hablar de funciones anónimas sin mostrar su uso más extendido en el ecosistema de Dart: el procesamiento de listas a través de métodos como `forEach` o `map`.

En estos escenarios, en lugar de declarar una función tradicional por fuera de la estructura, pasamos la lógica directamente "en línea".

```dart
void main() {
  var lenguajes = ['Dart', 'Kotlin', 'Swift'];

  // Pasando una función anónima tradicional a forEach
  lenguajes.forEach((item) {
    print('Lenguaje: $item');
  });

  // Usando sintaxis de flecha para una transformación limpia con map
  var mayusculas = lenguajes.map((item) => item.toUpperCase());
  print(mayusculas.toList()); // Imprime: [DART, KOTLIN, SWIFT]
}

```

```text
Flujo de datos en un método iterador:

[ 'Dart', 'Kotlin', 'Swift' ]  <- Colección original
      |         |         |
      v         v         v
  ( item ) => item.toUpperCase() <- La función anónima se ejecuta por cada elemento
      |         |         |
      v         v         v
[ 'DART', 'KOTLIN', 'SWIFT' ]  <- Nueva colección resultante

```

### Ámbito léxico y Clausuras (*Closures*)

Las funciones anónimas en Dart tienen una propiedad fundamental: son **clausuras** (*closures*). Esto significa que una función anónima puede "recordar" y acceder a las variables que fueron declaradas en el entorno (ámbito) donde fue creada, incluso si la función se ejecuta fuera de ese ámbito original.

```dart
Function crearSumador(int base) {
  // La función anónima de retorno "atrapa" la variable 'base'
  return (int numero) => base + numero;
}

void main() {
  // 'sumarDiez' guarda internamente el valor base = 10
  var sumarDiez = crearSumador(10);

  print(sumarDiez(5));  // Imprime: 15 (10 + 5)
  print(sumarDiez(23)); // Imprime: 33 (10 + 23)
}

```

## 8.4 Funciones de orden superior

Una **función de orden superior** (en inglés, *Higher-Order Function*) es aquella que cumple con al menos uno de los siguientes criterios: recibe una o más funciones como argumentos, o devuelve una función como resultado de su ejecución.

Esta capacidad es una consecuencia directa de que en Dart las funciones son **objetos de primera clase**. En lugar de tratar al código y a los datos como entidades completamente separadas, las funciones de orden superior nos permiten parametrizar el comportamiento mismo de nuestras aplicaciones, abstrayendo lógicas complejas en bloques reutilizables.

### Pasar funciones como argumentos

El escenario más común para una función de orden superior es aceptar otra función para delegar en ella una toma de decisión o un cálculo específico.

Para definir formalmente qué tipo de función esperamos recibir, Dart nos permite modelar firmas de funciones utilizando la palabra clave `Function` o, de forma más precisa, mediante tipos de funciones con parámetros explícitos.

```dart
// 'operar' es una función de orden superior.
// Recibe dos números enteros y una función que define la operación a realizar.
void operar(int a, int b, int Function(int, int) operacion) {
  int resultado = operacion(a, b);
  print('El resultado de la operación es: $resultado');
}

int sumar(int x, int y) => x + y;

void main() {
  // Pasando una función nominal (declarada con nombre)
  operar(5, 3, sumar); // Imprime: El resultado de la operación es: 8

  // Pasando una función anónima en línea
  operar(10, 2, (x, y) => x * y); // Imprime: El resultado de la operación es: 20
}

```

> **Buenas prácticas:** Al declarar el parámetro que recibirá la función, prefiere la sintaxis estructurada `TipoRetorno Function(Parámetros)` en lugar de usar únicamente la palabra clave genérica `Function`. Esto le otorga al compilador la información necesaria para validar que la función provista cumpla estrictamente con el contrato requerido.

### Retornar funciones desde otras funciones

El segundo superpoder de las funciones de orden superior es la generación dinámica de lógica. Una función puede actuar como una "fábrica" de comportamientos personalizados, configurando y devolviendo una nueva función lista para ser ejecutada en otro momento.

```dart
// Función de orden superior que retorna otra función
String Function(String) crearPrefijo(String prefijo) {
  return (String texto) => '$prefijo $texto';
}

void main() {
  // Generamos funciones especializadas
  var formatearError = crearPrefijo('[ERROR]');
  var formatearInfo = crearPrefijo('[INFO]');

  // Uso de las funciones generadas
  print(formatearError('Conexión fallida al servidor')); 
  // Salida: [ERROR] Conexión fallida al servidor

  print(formatearInfo('Carga de datos completada'));   
  // Salida: [INFO] Carga de datos completada
}

```

### Visualización del flujo de control

El siguiente esquema en texto plano muestra cómo la función de orden superior actúa como una estructura contenedora que recibe dinámicamente un bloque de comportamiento externo para aplicarlo internamente:

```text
+-------------------------------------------------------------+
| FUNCION DE ORDEN SUPERIOR: operar(a, b, operacion)         |
|                                                             |
|  Datos de entrada: [ a = 5 ]   [ b = 3 ]                    |
|                         \         /                         |
|                          v       v                          |
|  Comportamiento inyectado: operacion(x, y)                  |
|  (Puede ser: sumar, multiplicar o una lambda en línea)      |
|                                                             |
|  Resultado interno del bloque -> Impresión en consola       |
+-------------------------------------------------------------+

```

### Aplicación práctica en el ecosistema de Dart

Las funciones de orden superior no son un concepto puramente teórico; constituyen la columna vertebral del procesamiento de colecciones de Dart. Métodos nativos de las listas como `.where()` (para filtrar datos) o `.map()` (para transformar datos) son, por definición, funciones de orden superior.

```dart
void main() {
  var calificaciones = [12, 45, 78, 90, 55, 60];

  // .where() es de orden superior: recibe una función que evalúa una condición booleana
  var aprobados = calificaciones.where((nota) => nota >= 60);

  print(aprobados.toList()); // Imprime: [78, 90, 60]
}

```

## Resumen del capítulo

En este capítulo hemos profundizado en la versatilidad y potencia que ofrecen las funciones en Dart, elevándolas de simples subrutinas a componentes de diseño de software avanzados:

* **Parámetros opcionales posicionales (8.1):** Aprendimos a flexibilizar nuestras funciones envolviendo parámetros entre `[]`, permitiendo omitir argumentos al final de la llamada y controlando su estado mediante valores por defecto o tipos anulables.
* **Parámetros nombrados (8.2):** Analizamos cómo mejorar drásticamente la legibilidad y legibilidad del código encerrando los parámetros entre `{}`. Esta aproximación nos libra de la dependencia del orden secuencial y añade rigurosidad gracias al modificador `required`.
* **Funciones anónimas o lambdas (8.3):** Descubrimos la conveniencia de escribir bloques de código sin nombre para ejecuciones eficientes y puntuales, utilizando la sintaxis condensada de flecha (`=>`) y aprovechando el concepto de clausura léxica.
* **Funciones de orden superior (8.4):** Consolidamos el hecho de que las funciones son ciudadanos de primera clase en Dart, explorando la inyección de comportamientos al pasar funciones como argumentos y la creación automatizada de lógica al retornarlas como resultados.
