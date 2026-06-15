El archivo `theme.json` representa el centro de control absoluto en el desarrollo moderno de Block Themes. Este documento sustituye gran parte de la lógica visual que tradicionalmente alojábamos en `functions.php` y en hojas de estilo fragmentadas. En este capítulo, descubriremos cómo gobernar el diseño general desde un único lugar. Aprenderás a definir variables globales, inyectar paletas de color y fuentes locales, y aplicar restricciones estratégicas en el editor para proteger la identidad visual de la marca, todo mientras WordPress automatiza la generación de un código CSS limpio, escalable y altamente optimizado.

## 14.1 Estructura del archivo theme.json

El archivo `theme.json` es el núcleo de configuración de un Block Theme y representa el cambio de paradigma más importante en el desarrollo moderno de WordPress. A diferencia del enfoque clásico donde las capacidades y estilos base se declaraban en `functions.php` (mediante `add_theme_support`) y en hojas de estilo distribuidas, `theme.json` centraliza el control de la interfaz y la generación de estilos globales en un único documento estructurado.

Para interactuar correctamente con este archivo, es fundamental comprender su esquema jerárquico. Todo el archivo es un único objeto JSON compuesto por nodos de primer nivel muy específicos, cada uno con una responsabilidad aislada.

### Árbol de Nodos Principales

La arquitectura de `theme.json` se puede visualizar mediante el siguiente diagrama de texto plano, que representa los nodos de configuración del nivel superior (raíz):

```text
theme.json
├── $schema          (Enlace al esquema de validación JSON)
├── version          (Versión de la API de WordPress)
├── settings         (Variables, preajustes y controles del editor)
├── styles           (Aplicación visual de los settings a la web)
├── customTemplates  (Registro de plantillas personalizadas en /templates)
├── templateParts    (Registro de áreas estructurales en /parts)
└── patterns         (Registro de patrones de bloques desde el repositorio)

```

### Definición de los Nodos Base

Cada clave de primer nivel cumple un rol estandarizado en la forma en que WordPress procesa el Block Theme.

| Nodo Principal | Tipo de Dato | Propósito y Comportamiento |
| --- | --- | --- |
| `$schema` | Cadena (URL) | Vincula el archivo con el esquema oficial de WordPress. Es vital para habilitar el autocompletado inteligente y la detección de errores de sintaxis en editores de código como VS Code. |
| `version` | Entero | Define cómo el core debe interpretar la estructura del objeto. Actualmente, la versión `2` es ampliamente compatible, pero la versión `3` (introducida en WP 6.6) es el estándar recomendado para temas nuevos. |
| `settings` | Objeto | Define *qué* está disponible. Aquí se declaran las paletas de colores, escalas tipográficas y qué herramientas de diseño (márgenes, padding, bordes) están habilitadas para el usuario final en el Editor del Sitio. |
| `styles` | Objeto | Define *cómo* se ve. Mapea las configuraciones definidas en `settings` directamente al frontend y al editor, generando el CSS global (`global-styles`) para la etiqueta `body` y para bloques específicos. |
| `customTemplates` | Arreglo de Objetos | Informa a WordPress sobre las plantillas de página personalizadas (archivos HTML en la carpeta `/templates`) para que el editor las muestre con el título y la descripción correctos en el selector de plantillas. |
| `templateParts` | Arreglo de Objetos | Identifica y categoriza los componentes estructurales (ubicados en `/parts`, como cabeceras y pies de página), definiendo a qué área semántica de la web pertenece cada archivo. |
| `patterns` | Arreglo de Cadenas | Enumera los *slugs* de los patrones de bloques alojados en el directorio oficial de WordPress que el tema necesita descargar y registrar automáticamente sin usar PHP. |

### Esqueleto Base en Código

Todo Block Theme funcional debería partir de una estructura mínima validada. El siguiente bloque de código muestra el esqueleto esencial de un archivo `theme.json` listo para ser expandido con configuraciones específicas:

```json
{
    "$schema": "https://schemas.wp.org/trunk/theme.json",
    "version": 3,
    "settings": {
        "appearanceTools": true,
        "color": {},
        "typography": {},
        "spacing": {},
        "blocks": {}
    },
    "styles": {
        "color": {},
        "typography": {},
        "spacing": {},
        "blocks": {}
    },
    "customTemplates": [],
    "templateParts": []
}

```

Al dominar esta separación de conceptos (donde `settings` provee los datos y las reglas, y `styles` los aplica visualmente), se establece la base arquitectónica necesaria para comenzar a inyectar variables CSS, definir el diseño y configurar la experiencia del usuario, temas que se abordarán en detalle en las siguientes secciones.

## 14.2 Definición de paletas y fuentes

En la arquitectura de los Block Themes, la declaración de los fundamentos visuales de una marca se traslada por completo del archivo `functions.php` (donde tradicionalmente se usaba `add_theme_support`) al nodo `settings` del archivo `theme.json`. Al definir paletas de color y fuentes en este documento, WordPress se encarga automáticamente de generar las clases utilitarias y las variables CSS globales correspondientes, además de poblar los controles visuales en el Editor del Sitio.

### Configuración de la Paleta de Colores

El sistema de colores de WordPress permite registrar múltiples colores que estarán disponibles para textos, fondos y bordes. La definición se realiza dentro del nodo `settings.color.palette`.

Cada color registrado requiere tres propiedades fundamentales:

1. **`name`**: El nombre legible que verá el usuario en el editor (ej. "Azul Corporativo").
2. **`slug`**: El identificador único que WordPress usará para generar la variable CSS.
3. **`color`**: El valor hexadecimal, RGB, RGBA o HSL del color.

```json
{
  "version": 3,
  "settings": {
    "color": {
      "defaultPalette": false,
      "palette": [
        {
          "name": "Primario",
          "slug": "primario",
          "color": "#005b9f"
        },
        {
          "name": "Secundario",
          "slug": "secundario",
          "color": "#e0f2fe"
        }
      ]
    }
  }
}

```

**Generación automática de CSS:**
Por cada color declarado, el motor de WordPress inyecta en la etiqueta `<body>` (a través de la hoja de estilos en línea `global-styles`) las siguientes reglas, basadas en el `slug` proporcionado:

```text
Flujo de conversión de un color en theme.json:
Slug: "primario" -> Genera:
  ├─ Variable CSS: var(--wp--preset--color--primario)
  ├─ Clase para texto: .has-primario-color
  └─ Clase para fondo: .has-primario-background-color

```

*Nota:* Al establecer `"defaultPalette": false`, se elimina la paleta de colores genérica que WordPress incluye por defecto, obligando al usuario a utilizar únicamente los colores de la marca definidos en el tema.

### Tipografía y Fuentes Locales

La gestión de la tipografía en `theme.json` abarca tanto la declaración de las familias tipográficas como las escalas de tamaño. Un avance crucial en el ecosistema moderno es la capacidad de cargar fuentes locales (`.woff2`) directamente desde el JSON mediante la API `fontFace`, lo cual es vital para el rendimiento web y el cumplimiento estricto del RGPD (al evitar peticiones a servidores de terceros como Google Fonts).

La configuración se ubica en `settings.typography`.

#### 1. Familias Tipográficas (`fontFamilies`)

Permite declarar el nombre de la fuente y la ruta exacta a los archivos alojados dentro de la carpeta del tema.

```json
{
  "settings": {
    "typography": {
      "fontFamilies": [
        {
          "name": "Principal",
          "slug": "principal",
          "fontFamily": "\"Inter\", sans-serif",
          "fontFace": [
            {
              "fontFamily": "Inter",
              "fontWeight": "400",
              "fontStyle": "normal",
              "fontStretch": "normal",
              "src": ["file:./assets/fonts/inter-regular.woff2"]
            },
            {
              "fontFamily": "Inter",
              "fontWeight": "700",
              "fontStyle": "normal",
              "fontStretch": "normal",
              "src": ["file:./assets/fonts/inter-bold.woff2"]
            }
          ]
        }
      ]
    }
  }
}

```

Al igual que con los colores, el `slug` `"principal"` generará la variable CSS: `var(--wp--preset--font-family--principal)`. WordPress procesará el bloque `fontFace` y generará automáticamente la regla `@font-face` correspondiente en el CSS del frontend y del editor.

#### 2. Tamaños de Fuente (`fontSizes`)

Para mantener consistencia en el diseño, se debe establecer una escala tipográfica. Se recomienda utilizar unidades relativas (`rem`, `em`) o la función CSS `clamp()` para lograr tipografías fluidas que se adapten al tamaño de la pantalla (responsive typography).

```json
{
  "settings": {
    "typography": {
      "fluid": true,
      "fontSizes": [
        {
          "name": "Pequeño",
          "slug": "pequeno",
          "size": "0.875rem"
        },
        {
          "name": "Base",
          "slug": "base",
          "size": "1rem"
        },
        {
          "name": "Grande",
          "slug": "grande",
          "size": "clamp(1.5rem, 4vw, 2.25rem)"
        }
      ]
    }
  }
}

```

Activar la propiedad `"fluid": true` a nivel de tipografía permite que WordPress calcule automáticamente tamaños fluidos (usando una fórmula matemática interna) para aquellos tamaños estáticos si no se define explícitamente una función `clamp()`, garantizando que la tipografía responda orgánicamente a los diferentes *breakpoints* del dispositivo.

## 14.3 Restricción de permisos del editor

El Editor del Sitio (Site Editor) proporciona, por defecto, una libertad creativa casi absoluta al usuario final. Sin embargo, en proyectos profesionales para clientes, esta libertad total suele traducirse en rupturas de la línea gráfica y pérdida de consistencia visual. Para evitarlo, `theme.json` actúa como un "cortafuegos" de diseño mediante la curaduría de la experiencia del editor (Curated Experience).

A través del nodo `settings`, es posible habilitar o deshabilitar paneles de herramientas, botones y campos de entrada en la interfaz de usuario del editor de bloques. Esto se logra asignando valores booleanos (`true` o `false`) a propiedades específicas.

### Propiedades de Restricción Comunes

La desactivación de herramientas personalizadas obliga al usuario a utilizar únicamente los valores predefinidos por el tema (las paletas y escalas declaradas en la sección anterior).

A continuación, se detalla una tabla con los ajustes más efectivos para restringir la interfaz gráfica:

| Propiedad en `theme.json` | Ubicación en `settings` | Efecto al configurar como `false` |
| --- | --- | --- |
| `customColor` | `color` | Oculta el selector hexadecimal/RGB. El usuario solo puede elegir colores de la paleta definida. |
| `customGradient` | `color` | Evita que el usuario cree degradados personalizados. |
| `customFontSize` | `typography` | Elimina el campo para ingresar píxeles o rems manualmente. Obliga a usar la escala (Pequeño, Base, Grande). |
| `customLineHeight` | `typography` | Oculta el control de altura de línea. |
| `customPadding` | `spacing` | Deshabilita los controles para añadir relleno interno personalizado. |
| `customMargin` | `spacing` | Deshabilita los controles para añadir márgenes externos personalizados. |

### Ámbito Global vs. Ámbito de Bloque

La arquitectura de `theme.json` funciona en cascada. Las restricciones pueden aplicarse a nivel global (afectando a todos los bloques) o de manera granular a nivel de bloque específico, sobrescribiendo la regla general.

El siguiente diagrama ilustra cómo funciona la cascada de permisos:

```text
Configuración Global (Desactiva colores personalizados para todo el sitio)
 └── Bloque Párrafo (Hereda la restricción global)
 └── Bloque Encabezado (Hereda la restricción global)
 └── Bloque Botón (Sobrescribe la regla: Activa colores personalizados solo aquí)

```

### Implementación en Código

Para aplicar esta lógica, se utiliza el nodo `blocks` dentro de `settings`, referenciando el espacio de nombres del bloque (por ejemplo, `core/button` o `core/paragraph`).

```json
{
  "version": 3,
  "settings": {
    "color": {
      "customColor": false,
      "customGradient": false
    },
    "typography": {
      "customFontSize": false,
      "dropCap": false
    },
    "blocks": {
      "core/button": {
        "color": {
          "customColor": true
        }
      },
      "core/heading": {
        "typography": {
          "customFontSize": true
        }
      }
    }
  }
}

```

**Análisis del comportamiento de este código:**

1. A nivel general, ningún bloque permitirá al usuario introducir colores personalizados o tamaños de fuente manuales; estarán limitados a hacer clic en los botones de la paleta o escala tipográfica del tema. También se desactiva la función de letra capital (`dropCap`) en toda la web.
2. Sin embargo, en el bloque de Botón (`core/button`), se reabre la posibilidad de usar el selector de color libre.
3. En el bloque de Encabezado (`core/heading`), se habilita de nuevo el campo para escribir tamaños de fuente personalizados.

Esta capacidad de anulación selectiva permite a los desarrolladores proteger la estructura base del diseño, cediendo flexibilidad de diseño única y exclusivamente en los componentes donde el usuario final realmente la necesita.

## 14.4 Generación automática de CSS

El motor detrás de `theme.json` no es solo un sistema de configuración de la interfaz, sino un compilador dinámico de estilos. Cuando WordPress procesa este archivo, activa lo que se conoce como el sistema de **Global Styles** (Estilos Globales). Este motor lee los nodos `settings` y `styles` para generar automáticamente una hoja de estilos en línea que se inyecta tanto en el editor de bloques como en el `<head>` del frontend.

Este proceso elimina la necesidad de escribir y mantener cientos de líneas de código CSS repetitivo (clases utilitarias y variables) en tu archivo `style.css` tradicional.

### Nomenclatura de Variables y Clases

WordPress utiliza un sistema de prefijos estandarizado para transformar los valores declarados en `theme.json` en CSS válido y predecible. Esto asegura que no haya colisiones de nombres con otros plugins o estilos propios.

**1. CSS Custom Properties (Variables)**
Por cada ajuste definido en `settings`, WordPress crea variables globales ancladas a la pseudo-clase `:root` o `body`. El formato sigue este patrón:
`--wp--preset--[categoría]--[slug]`

**2. Clases Utilitarias**
Además de las variables, WordPress genera clases CSS listas para ser aplicadas al HTML de los bloques (por ejemplo, cuando un usuario selecciona un color de fondo en el editor). El formato es:
`.has-[slug]-[propiedad]`

### El proceso de compilación (JSON a CSS)

Para comprender cómo funciona el motor, observa la siguiente representación de cómo una simple declaración en JSON se compila en código CSS final.

```text
[theme.json] Declaración:
{
  "settings": {
    "color": {
      "palette": [
        { "slug": "resaltado", "color": "#ffaa00" }
      ]
    }
  }
}
      │
      ▼ Motor de Global Styles
      │
[CSS Generado] Inyectado en el <head> como <style id="global-styles-inline-css">:
body {
  --wp--preset--color--resaltado: #ffaa00;
}

.has-resaltado-color {
  color: var(--wp--preset--color--resaltado) !important;
}

.has-resaltado-background-color {
  background-color: var(--wp--preset--color--resaltado) !important;
}

.has-resaltado-border-color {
  border-color: var(--wp--preset--color--resaltado) !important;
}

```

*Nota:* El uso de `!important` por parte del core asegura que las utilitarias generadas por el editor prevalezcan sobre los estilos base del tema, garantizando que lo que el usuario configura en el panel se refleje exactamente en la web.

### Aplicación de Estilos a Elementos y Bloques

Mientras que `settings` genera las herramientas (variables y clases), el nodo `styles` es el responsable de aplicar esas herramientas directamente a las etiquetas HTML o a bloques específicos sin intervención del usuario.

Si deseas que todos los botones de tu sitio tengan esquinas redondeadas y un fondo con el color que definiste previamente, lo harías estructurando el nodo `styles.blocks`:

```json
{
  "version": 3,
  "settings": { ... },
  "styles": {
    "blocks": {
      "core/button": {
        "color": {
          "background": "var(--wp--preset--color--resaltado)",
          "text": "#ffffff"
        },
        "border": {
          "radius": "8px"
        }
      }
    }
  }
}

```

Esta configuración generará la siguiente regla CSS en el frontend, orientada específicamente a la clase que envuelve a los botones nativos de WordPress:

```css
.wp-block-button__link {
  background-color: var(--wp--preset--color--resaltado);
  color: #ffffff;
  border-radius: 8px;
}

```

La principal ventaja de este sistema de generación automática radica en el rendimiento y la consistencia. WordPress solo procesará e inyectará el CSS de los bloques y variables que realmente se estén utilizando en la vista actual, optimizando el peso de la página y asegurando que los estilos del editor y del frontend sean siempre idénticos.

## Resumen del capítulo

En este capítulo hemos explorado `theme.json` como el cerebro central de cualquier Block Theme moderno. Comenzamos analizando su estructura jerárquica de nodos y cómo separa la definición de herramientas (`settings`) de su aplicación visual (`styles`). Aprendimos a declarar nuestras propias paletas de color y fuentes locales para mantener la identidad gráfica de la marca, y vimos cómo utilizar la configuración por bloques para restringir permisos, creando una experiencia de edición segura que previene rupturas de diseño. Finalmente, desglosamos cómo WordPress traduce automáticamente todo este archivo en variables y clases CSS altamente optimizadas, transformando la manera en que estructuramos el desarrollo del frontend.
