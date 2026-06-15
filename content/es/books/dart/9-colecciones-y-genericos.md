El desarrollo de aplicaciones modernas exige gestionar flujos complejos de datos de forma eficiente y segura. En este capítulo, dominarás las tres estructuras de almacenamiento fundamentales de Dart: las listas para colecciones ordenadas, los conjuntos (sets) para garantizar la unicidad de los elementos y los mapas para asociar datos mediante pares clave-valor.

Además, descubrirás el poder de los genéricos, una herramienta avanzada que te permitirá escribir código altamente reutilizable y flexible, manteniendo un control estricto sobre los tipos de datos para prevenir errores en tiempo de ejecución.

## 9.1 Listas y sus métodos

Una lista en Dart es una colección ordenada de elementos donde cada valor ocupa una posición específica indexada, comenzando desde el índice `0`. Representa lo que en otros lenguajes de programación se conoce comúnmente como un arreglo (*array*).

Las listas son dinámicas por defecto; esto significa que su tamaño puede crecer o contraerse en tiempo de ejecución a medida que se añaden o eliminan elementos.

### Estructura de indexación en memoria

Para comprender cómo se organiza una lista, observemos el siguiente esquema conceptual de una lista con cuatro elementos de tipo cadena de texto (`String`):

```text
Índice:        [0]          [1]          [2]          [3]
            +------------+------------+------------+------------+
Elementos:  |   "Dart"   |  "Flutter" |  "Kotlin"  |   "Java"   |
            +------------+------------+------------+------------+
Longitud (length): 4

```

### Declaración e inicialización

En Dart, las listas se definen utilizando corchetes `[]`. Aunque Dart puede inferir los tipos, es una buena práctica especificar el tipo de datos que contendrá la lista utilizando la sintaxis de genéricos `<Tipo>` para mantener la seguridad de tipos.

```dart
void main() {
  // Inferencia de tipos: Dart infiere que es una List<String>
  var lenguajes = ['Dart', 'Flutter', 'Kotlin'];

  // Declaración explícita con tipado estricto
  List<int> numeros primos = [2, 3, 5, 7, 11];

  // Lista vacía con tipo definido
  List<double> calificaciones = [];
}

```

### Métodos fundamentales para la manipulación de listas

La clase `List` en Dart provee un conjunto enriquecido de propiedades y métodos que permiten realizar operaciones complejas de forma nativa y eficiente.

#### 1. Agregar elementos

* `add(T value)`: Añade un único elemento al final de la lista.
* `addAll(Iterable<T> iterable)`: Agrega múltiples elementos de golpe al final de la lista.
* `insert(int index, T element)`: Inserta un elemento en una posición específica, desplazando los elementos restantes hacia la derecha.

```dart
void main() {
  List<String> framework = ['Angular'];

  framework.add('Vue');             // ['Angular', 'Vue']
  framework.addAll(['React', 'Nuxt']); // ['Angular', 'Vue', 'React', 'Nuxt']
  framework.insert(1, 'Svelte');    // ['Angular', 'Svelte', 'Vue', 'React', 'Nuxt']
}

```

#### 2. Eliminar elementos

* `remove(Object? value)`: Remueve la primera aparición del elemento especificado. Retorna `true` si lo encuentra y elimina.
* `removeAt(int index)`: Remueve el elemento en la posición dada y retorna dicho elemento.
* `removeLast()`: Elimina y retorna el último elemento de la lista.
* `clear()`: Borra todos los elementos de la lista, dejándola con un tamaño de 0.

```dart
void main() {
  List<int> digitos = [10, 20, 30, 40, 50];

  digitos.remove(20);     // [10, 30, 40, 50]
  digitos.removeAt(0);    // [30, 40, 50]
  digitos.removeLast();   // [30, 40]
  digitos.clear();        // []
}

```

#### 3. Propiedades de inspección y acceso

* `length`: Retorna el tamaño actual de la lista.
* `isEmpty` / `isNotEmpty`: Devuelven valores booleanos indicando si la lista carece de elementos o no.
* `first` / `last`: Permiten acceder directamente al primer y último elemento de la colección sin necesidad de usar índices manuales.

```dart
void main() {
  List<String> tareas = ['Comprar pan', 'Estudiar Dart'];

  print(tareas.length);     // 2
  print(tareas.isEmpty);    // false
  print(tareas.first);      // 'Comprar pan'
  print(tareas.last);       // 'Estudiar Dart'
}

```

#### 4. Búsqueda y filtrado

* `indexOf(E element)`: Devuelve el índice de la primera coincidencia del elemento. Si no existe, retorna `-1`.
* `contains(Object? element)`: Determina mediante un booleano si el elemento está presente en la lista.
* `where((element) => bool)`: Filtra los elementos basándose en una condición condicional (predicado) y retorna un objeto iterable con los elementos que la cumplen.

```dart
void main() {
  List<int> puntuaciones = [85, 92, 78, 92, 60];

  print(puntuaciones.indexOf(92)); // 1
  print(puntuaciones.contains(100)); // false

  // Filtrar puntuaciones mayores o iguales a 80
  var aprobados = puntuaciones.where((nota) => nota >= 80);
  print(aprobados.toList()); // [85, 92, 92]
}

```

#### 5. Transformación y ordenamiento

* `map((element) => nuevoElemento)`: Transforma cada elemento de la lista aplicando una función y genera un nuevo iterable con los resultados.
* `sort()`: Ordena los elementos de la lista de manera interna (*in-place*). Puede recibir una función de comparación opcional.

```dart
void main() {
  List<int> base = [1, 2, 3, 4];
  
  // Elevar al cuadrado cada elemento
  var cuadrados = base.map((n) => n * n).toList();
  print(cuadrados); // [1, 4, 9, 16]

  // Ordenar una lista desordenada
  List<int> desordenada = [5, 1, 9, 3];
  desordenada.sort();
  print(desordenada); // [1, 3, 5, 9]
}

```

> **Nota de rendimiento:** Métodos como `where` y `map` devuelven objetos de tipo `Iterable`. Para volver a disponer de una estructura de tipo lista estricta con todas sus propiedades, se les debe concatenar el método `.toList()`.
>
## 9.2 Conjuntos (Sets)

Un conjunto o `Set` en Dart es una colección desordenada de elementos únicos. A diferencia de las listas, los conjuntos no permiten duplicados; si se intenta introducir un elemento que ya existe en la colección, Dart ignorará silenciosamente la adición.

Los conjuntos son la opción ideal cuando el orden de los elementos no es relevante, pero sí se necesita garantizar que cada dato aparezca una sola vez y se requiere verificar de manera eficiente si un elemento pertenece a la colección.

### Estructura en memoria: Lista vs. Conjunto

Para entender la diferencia de comportamiento, comparemos cómo manejan ambas estructuras el intento de almacenar elementos repetidos:

```text
List (Permite duplicados y mantiene el orden):
+------------+------------+------------+------------+
|    "A"     |    "B"     |    "A"     |    "C"     |
+------------+------------+------------+------------+

Set (Elementos únicos, sin orden posicional garantizado):
+------------+------------+------------+
|    "A"     |    "B"     |    "C"     |
+------------+------------+------------+

```

### Declaración e inicialización

Los conjuntos se definen utilizando llaves `{}`. Es sumamente importante especificar el tipo de dato con genéricos `<Tipo>` al declarar un conjunto vacío, ya que la sintaxis `{}` por sí sola se reserva por defecto para la creación de mapas (`Map`), los cuales estudiaremos en la siguiente sección.

```dart
void main() {
  // Inferencia de tipos con inicialización directa
  var herramientas = {'Martillo', 'Destornillador', 'Alicate'};

  // Declaración explícita de un Set de enteros
  Set<int> numerosUnicos = {1, 2, 3, 4, 5};

  // ERROR SINTÁCTICO COMÚN: Esto crea un Map, no un Set
  var mapaFalso = {}; 

  // Forma correcta de declarar un Set vacío
  Set<String> usuariosConectados = {};
  var correosValidos = <String>{};
}

```

### Métodos específicos para la manipulación de conjuntos

Al igual que las listas, la clase `Set` implementa métodos para añadir, remover y buscar datos, pero optimizados para su naturaleza de unicidad.

#### 1. Añadir y eliminar elementos

* `add(T value)`: Intenta añadir un elemento al conjunto. Retorna `true` si el elemento fue añadido con éxito o `false` si ya existía.
* `addAll(Iterable<T> iterable)`: Añade múltiples elementos filtrando automáticamente aquellos que ya estén presentes.
* `remove(Object? value)`: Elimina el elemento especificado del conjunto.

```dart
void main() {
  Set<String> paises = {'México', 'Argentina'};

  print(paises.add('Chile'));     // true -> ['México', 'Argentina', 'Chile']
  print(paises.add('México'));    // false -> El conjunto permanece igual

  paises.addAll(['Perú', 'Chile', 'Colombia']); 
  // 'Chile' se ignora por duplicado. 'Perú' y 'Colombia' se agregan.

  paises.remove('Argentina');     // Remueve 'Argentina' del conjunto
}

```

#### 2. Operaciones de teoría de conjuntos

Una de las mayores ventajas de los `Set` en Dart es la capacidad de realizar operaciones matemáticas clásicas de conjuntos de forma nativa.

* `intersection(Set<Object?> other)`: Retorna un nuevo conjunto con los elementos que están presentes en ambos conjuntos.
* `union(Set<E> other)`: Combina los elementos de ambos conjuntos en uno nuevo, eliminando duplicados residuales.
* `difference(Set<Object?> other)`: Retorna un nuevo conjunto con los elementos del conjunto original que **no** están presentes en el conjunto pasado por parámetro.

```dart
void main() {
  var desarrolloWeb = {'HTML', 'CSS', 'JavaScript', 'TypeScript'};
  var desarrolloMovil = {'Dart', 'Flutter', 'JavaScript', 'Kotlin'};

  // 1. Intersección (¿Qué lenguajes comparten?)
  var comunes = desarrolloWeb.intersection(desarrolloMovil);
  print(comunes); // {'JavaScript'}

  // 2. Unión (¿Qué tecnologías cubren ambos campos?)
  var todas = desarrolloWeb.union(desarrolloMovil);
  print(todas); // {'HTML', 'CSS', 'JavaScript', 'TypeScript', 'Dart', 'Flutter', 'Kotlin'}

  // 3. Diferencia (¿Qué es exclusivo de Web?)
  var soloWeb = desarrolloWeb.difference(desarrolloMovil);
  print(soloWeb); // {'HTML', 'CSS', 'TypeScript'}
}

```

### Conversión entre Listas y Conjuntos

En el desarrollo de software es muy común recibir una lista con elementos duplicados y necesitar limpiarla. Dart facilita esta conversión gracias a las propiedades y constructores integrados.

* `toList()`: Convierte un conjunto en una lista.
* `toSet()`: Convierte una lista en un conjunto, eliminando instantáneamente cualquier duplicado en el proceso.

```dart
void main() {
  List<int> identificadores = [1, 2, 2, 3, 4, 4, 4, 5];

  // Eliminamos duplicados transformándola a Set
  Set<int> idUnicosSet = identificadores.toSet();
  print(idUnicosSet); // {1, 2, 3, 4, 5}

  // Si necesitamos volver a trabajar con una estructura de lista
  List<int> listaLimpia = idUnicosSet.toList();
  print(listaLimpia); // [1, 2, 3, 4, 5]
}

```

> **Nota de rendimiento:** Buscar un elemento en un `Set` usando el método `contains()` es significativamente más rápido que hacerlo en una `List` cuando el volumen de datos es muy alto. Mientras que la lista debe inspeccionar elemento por elemento (complejidad lineal), el conjunto utiliza una tabla de dispersión (*hash table*) para localizar el elemento de forma casi instantánea (complejidad constante).
>
## 9.3 Mapas (Diccionarios)

Un mapa o `Map` en Dart es una colección dinámica de pares clave-valor. Es lo que en otros lenguajes de programación se denomina comúnmente diccionario, objeto, mapa asociativo o arreglo asociativo.

Cada par consta de una **clave** (*key*) y un **valor** (*value*). Las claves dentro de un mapa deben ser estrictamente únicas, ya que actúan como el identificador para acceder a los datos. Los valores, por el contrario, pueden duplicarse cuantas veces sea necesario.

### Estructura de un mapa en memoria

A diferencia de las listas donde el acceso es numérico e indexado, en los mapas se utiliza la clave directa para extraer la información. Conceptualmente, se organiza de la siguiente manera:

```text
Clave (Única):       "id"          "nombre"          "rol"
                   +------------+-----------------+-----------------+
Valores (Datos):   |    1024    |     "Elena"     |   "Developer"   |
                   +------------+-----------------+-----------------+

```

### Declaración e inicialización

Los mapas utilizan llaves `{}` para agrupar sus elementos, separando la clave del valor mediante dos puntos `:` y cada par mediante comas. Al igual que con las colecciones anteriores, se recomienda encarecidamente utilizar genéricos `<TipoClave, TipoValor>` para dotar al mapa de seguridad de tipos.

```dart
void main() {
  // Inferencia de tipos: Dart infiere un Map<String, String>
  var capitales = {
    'Colombia': 'Bogotá',
    'España': 'Madrid',
    'Japón': 'Tokio',
  };

  // Declaración explícita con tipos mixtos
  Map<String, dynamic> usuario = {
    'username': 'coder99',
    'edad': 26,
    'estaActivo': true,
  };

  // Declaración de un mapa vacío
  Map<int, String> estudiantes = {};
  var productos = <String, double>{};
}

```

> **Nota sobre el tipo `dynamic`:** En el desarrollo de software (especialmente al consumir APIs en formato JSON), es muy habitual encontrar estructuras `Map<String, dynamic>`. Esto significa que las claves siempre serán cadenas de texto, pero los valores pueden ser números, booleanos, listas u otros mapas anidados.

### Métodos fundamentales para la manipulación de mapas

La clase `Map` provee operaciones fluidas para gestionar la información indexada por claves de forma eficiente.

#### 1. Lectura y escritura de elementos

El acceso y la modificación de un mapa se realiza mediante el operador de corchetes `[]`, utilizando la clave en lugar de un índice numérico.

```dart
void main() {
  Map<String, String> traducciones = {
    'hello': 'hola',
    'goodbye': 'adiós',
  };

  // 1. Lectura de un valor
  print(traducciones['hello']); // 'hola'

  // Si la clave no existe, Dart retorna null de forma segura
  print(traducciones['welcome']); // null

  // 2. Agregar o actualizar un par clave-valor
  traducciones['thank you'] = 'gracias'; // Añade una nueva clave
  traducciones['hello'] = 'hola mundo'; // Sobrescribe el valor existente
}

```

#### 2. Propiedades de inspección

* `keys`: Retorna un iterable con todas las claves del mapa.
* `values`: Retorna un iterable con todos los valores almacenados.
* `length`: Devuelve la cantidad de pares clave-valor presentes.
* `containsKey(Object? key)`: Evalúa si existe la clave especificada en el mapa.
* `containsValue(Object? value)`: Evalúa si existe el valor especificado en el mapa.

```dart
void main() {
  Map<String, int> inventario = {'manzanas': 10, 'peras': 5};

  print(inventario.keys.toList());   // ['manzanas', 'peras']
  print(inventario.values.toList()); // [10, 5]
  
  print(inventario.containsKey('peras'));    // true
  print(inventario.containsValue(100));     // false
}

```

#### 3. Eliminación y control de presencia

* `remove(Object? key)`: Elimina el par completo asociado a la clave provista y devuelve el valor que fue removido.
* `putIfAbsent(K key, V ifAbsent())`: Busca una clave; si existe, devuelve su valor actual, pero si no existe, ejecuta la función anónima para insertar el nuevo par de forma segura sin machacar datos previos.

```dart
void main() {
  Map<String, String> configuracion = {'tema': 'oscuro', 'idioma': 'es'};

  configuracion.remove('idioma'); // Elimina 'idioma'
  
  // Intenta añadir 'fuente'. Como no existe, lo añade.
  configuracion.putIfAbsent('fuente', () => 'Ubuntu Mono');

  // Intenta añadir 'tema'. Como ya existe, no altera el valor 'oscuro'.
  configuracion.putIfAbsent('tema', () => 'claro'); 
}

```

#### 4. Iteración y transformaciones

* `forEach((key, value) => ...)`: Ejecuta una función sobre cada uno de los pares clave-valor del mapa.
* `map((key, value) => MapEntry(nuevaKey, nuevoValue))`: Transforma el mapa original en un nuevo mapa modificando sus claves, sus valores o ambos a través de objetos `MapEntry`.

```dart
void main() {
  Map<String, double> precios = {'café': 2.50, 'pastel': 4.00};

  // Iterar de forma limpia
  precios.forEach((producto, costo) {
    print('El producto $producto cuesta \$$costo');
  });

  // Aplicar un descuento del 10% a todos los productos del mapa
  var preciosConDescuento = precios.map((producto, costo) {
    return MapEntry(producto, costo * 0.9);
  });
  
  print(preciosConDescuento); // {'café': 2.25, 'pastel': 3.6}
}
```

## 9.4 Uso de genéricos

Los **genéricos** (representados sintácticamente mediante los corchetes angulares `<T>`) son una herramienta que permite parametrizar tipos en Dart. Gracias a ellos, es posible diseñar clases, interfaces, estructuras de datos y funciones que operan sobre diferentes tipos de datos sin perder la seguridad de tipos (*type safety*) y sin necesidad de duplicar código para cada tipo específico.

Aunque ya hemos utilizado genéricos de forma implícita al instanciar colecciones como `List<String>` o `Set<int>`, en esta sección comprenderemos a fondo cómo actúan a nivel de compilación y cómo crear nuestras propias estructuras genéricas.

### La necesidad de los genéricos: Seguridad vs. Reutilización

Antes de la existencia de los genéricos en la programación, para lograr que una colección o estructura almacenara cualquier tipo de dato, se debía recurrir al tipo base más abstracto (en el caso de Dart moderno, `Object` o `dynamic`). Sin embargo, esto introducía graves inconvenientes:

1. **Pérdida de control de tipos:** Se podían mezclar datos no deseados en una misma estructura de forma accidental.
2. **Casteo manual constante:** Al extraer la información, el compilador no conocía el tipo original, obligando al desarrollador a forzar la conversión (*casting*), lo que incrementaba el riesgo de errores en tiempo de ejecución.

Al parametrizar con genéricos, el desarrollador delega la definición exacta del tipo al momento de instanciar la estructura, manteniendo el código abstracto pero tipado con total firmeza.

### Clases genéricas personalizadas

Para entender cómo implementar genéricos, consideremos el diseño de una clase contenedora llamada `Caja`. Esta clase debe ser capaz de almacenar y despachar un objeto, independientemente de si se trata de un número, un texto o un objeto personalizado de nuestro dominio.

Por convención, se suelen utilizar letras mayúsculas únicas como marcadores de posición (*placeholders*) para los tipos:

* `T` para *Type* (Tipo general).
* `E` para *Element* (Muy usado en colecciones e iterables).
* `K` y `V` para *Key* y *Value* (Claves y valores en mapas).

```dart
// Definición de la clase con un parámetro de tipo genérico <T>
class Caja<T> {
  // El contenido de la caja será estrictamente del tipo T que se defina al instanciar
  T _contenido;

  Caja(this._contenido);

  T obtenerContenido() {
    return _contenido;
  }

  void guardarContenido(T nuevoContenido) {
    _contenido = nuevoContenido;
  }
}

void main() {
  // Creamos una instancia de Caja especializada en números enteros
  Caja<int> cajaFuerte = Caja<int>(42);
  print(cajaFuerte.obtenerContenido().isEven); // true (El compilador sabe que es un int)
  
  // Si intentamos guardar un String, el compilador arrojará un error de inmediato
  // cajaFuerte.guardarContenido("Texto prohibido"); // Error de compilación

  // Creamos otra instancia totalmente independiente especializada en texto
  Caja<String> cajaPostal = Caja<String>("Carta urgente");
  print(cajaPostal.obtenerContenido().toUpperCase()); // 'CARTA URGENTE'
}

```

### Funciones y métodos genéricos

No solo las clases pueden beneficiarse de los genéricos. Si necesitas escribir una función cuya lógica interna sea idéntica para múltiples tipos de datos, puedes declarar el parámetro de tipo justo antes de los parámetros de entrada de la función.

Consideremos una función utilitaria diseñada para extraer y retornar el último elemento de cualquier lista, sin importar qué almacene dicha lista:

```dart
// El marcador <T> indica que la función es genérica
T obtenerUltimoElemento<T>(List<T> lista) {
  if (lista.isEmpty) {
    throw ArgumentError('La lista no puede estar vacía');
  }
  return lista.last; // Retorna un elemento de tipo T
}

void main() {
  List<int> edades = [18, 25, 40, 65];
  List<String> nombres = ['Ana', 'Carlos', 'Beatriz'];

  // Dart infiere el tipo <int> automáticamente por el argumento provisto
  int ultimaEdad = obtenerUltimoElemento(edades); 
  
  // Dart infiere el tipo <String> automáticamente
  String ultimoNombre = obtenerUltimoElemento(nombres);

  print('Última edad: $ultimaEdad');     // 65
  print('Último nombre: $ultimoNombre'); // Beatriz
}

```

### Comportamiento en tiempo de ejecución (*Reified types*)

A diferencia de otros lenguajes como Java (donde los genéricos sufren de un proceso llamado *Type Erasure* y se eliminan en tiempo de ejecución), los tipos genéricos de Dart están **reificados** (*reified*). Esto significa que la información del tipo se conserva intacta durante la ejecución del programa.

Gracias a esto, es perfectamente válido y seguro realizar comprobaciones de tipo en caliente sobre las colecciones genéricas:

```dart
void main() {
  var nombres = <String>['Lucas', 'Sofía'];
  
  // Dart mantiene el registro del tipo real en tiempo de ejecución
  print(nombres is List<String>); // true
  print(nombres is List<int>);    // false
}
```

## 9.5 Restricciones genéricas

En la sección anterior aprendimos cómo los genéricos permiten que una clase o función opere sobre cualquier tipo de dato de forma completamente abstracta. Sin embargo, en escenarios reales de desarrollo, a menudo requerimos que esa abstracción tenga límites. No queremos permitir *cualquier* tipo de dato, sino solo aquellos que cumplan con ciertas características o posean determinados métodos.

Para solucionar esto, Dart ofrece las **restricciones genéricas**, un mecanismo que permite limitar los tipos de datos que pueden ser pasados como parámetros de tipo utilizando la palabra clave `extends`.

### Sintaxis de la restricción: El uso de `extends`

Al añadir `extends` dentro de los corchetes angulares (`<T ClaseBase extends>`), le estamos indicando al compilador que el tipo genérico `T` no puede ser un tipo completamente libre, sino que debe ser obligatoriamente `ClaseBase` o cualquiera de sus clases derivadas (subclases).

```dart
// Estructura conceptual de una restricción genérica
class Contenedor<T extends Numero> { ... }

```

### Implementación práctica de restricciones

Para comprender el valor de las restricciones genéricas, analicemos un escenario donde diseñamos un sistema de facturación o cálculo financiero. Necesitamos una clase encargada de empaquetar y procesar precios o medidas, pero queremos asegurar que los datos introducidos sean estrictamente numéricos para poder realizar operaciones matemáticas con ellos.

Si usáramos un genérico `<T>` sin restricciones, Dart no nos dejaría sumar ni multiplicar sus propiedades internas porque no podría garantizar que un desarrollador no intente pasar un tipo `String` o un booleano. Restringiendo el tipo a `num` (la clase base de `int` y `double`), habilitamos el acceso a sus operadores aritméticos.

```dart
// Restringimos T para que solo acepte tipos numéricos (int, double)
class CalculadorDescuento<T extends num> {
  final T precioOriginal;
  final double porcentaje;

  CalculadorDescuento(this.precioOriginal, this.porcentaje);

  double obtenerPrecioFinal() {
    // Gracias a 'extends num', Dart sabe con certeza que precioOriginal 
    // tiene soporte nativo para operaciones matemáticas.
    double descuento = precioOriginal * (porcentaje / 100);
    return precioOriginal - descuento;
  }
}

void main() {
  // Uso válido con un entero (int)
  var calculoZapatos = CalculadorDescuento<int>(100, 15);
  print('Precio final: \$${calculoZapatos.obtenerPrecioFinal()}'); // 85.0

  // Uso válido con un decimal (double)
  var calculoSuscripcion = CalculadorDescuento<double>(29.99, 10);
  print('Precio final: \$${calculoSuscripcion.obtenerPrecioFinal()}'); // 26.991

  // ERROR DE COMPILACIÓN: String no extiende de 'num'
  // var calculoInvalido = CalculadorDescuento<String>("Cien", 15); 
}

```

### Restricciones basadas en clases personalizadas e interfaces

Las restricciones genéricas cobran aún más fuerza cuando se aplican a jerarquías de clases creadas por nosotros mismos dentro del dominio de la aplicación. Esto asegura que los objetos pasados a una estructura compartan un comportamiento específico (como un método común).

Consideremos un sistema donde diferentes entidades del negocio pueden convertirse a formato JSON para ser enviadas a un servidor web:

```dart
// Clase abstracta que actúa como contrato o interfaz
abstract class Serializable {
  Map<String, dynamic> toJson();
}

// Clase de negocio que implementa el contrato
class Usuario implements Serializable {
  final String nombre;
  final String email;

  Usuario(this.nombre, this.email);

  @override
  Map<String, dynamic> toJson() => {
    'nombre': nombre,
    'email': email,
  };
}

// Clase genérica restringida a objetos que sepan serializarse
class RepositorioApi<T extends Serializable> {
  void enviarServidor(T datos) {
    // Sabemos con total certeza que el método 'toJson' existe
    Map<String, dynamic> json = datos.toJson();
    print('Enviando datos al servidor: $json');
  }
}

void main() {
  var usuario = Usuario('Diana', 'diana@email.com');
  
  // Esto es perfectamente válido porque Usuario extiende/implementa Serializable
  var api = RepositorioApi<Usuario>();
  api.enviarServidor(usuario);
}

```

Si intentáramos instanciar `RepositorioApi<int>()` o pasarle cualquier otra clase que no implemente `Serializable`, el compilador detendría la ejecución inmediatamente, evitando errores accidentales en producción.

## Resumen del capítulo

En este **Capítulo 9: Colecciones y Genéricos**, hemos explorado las herramientas fundamentales que ofrece Dart para agrupar, organizar y manipular volúmenes de datos con la máxima eficiencia y seguridad.

* **Listas (`List`):** Aprendimos que representan colecciones ordenadas e indexadas por posición (comenzando desde el índice 0). Analizamos sus métodos clave para insertar, remover, buscar (`where`) y transformar datos (`map`).
* **Conjuntos (`Set`):** Descubrimos que son colecciones desordenadas diseñadas específicamente para almacenar elementos únicos. Estudiamos su alta eficiencia en búsquedas (`contains`) y cómo realizar operaciones matemáticas de conjuntos como uniones, intersecciones y diferencias.
* **Mapas (`Map`):** Comprendimos las estructuras basadas en pares clave-valor (diccionarios), donde las claves son estrictamente únicas y sirven como el índice de acceso directo a sus respectivos valores.
* **Genéricos y Restricciones (`<T> / <T ClaseBase extends>`):** Analizamos cómo parametrizar los tipos de datos en clases y funciones para reutilizar código sin sacrificar el tipado estricto. Finalmente, aprendimos a limitar esa flexibilidad mediante restricciones genéricas para garantizar que los tipos utilizados hereden comportamientos y propiedades específicas requeridas por nuestra lógica de negocio.
