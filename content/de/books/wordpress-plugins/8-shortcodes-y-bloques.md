Bei der Entwicklung von WordPress-Plugins ist es essenziell, dynamisch mit den Inhalten der Benutzer zu interagieren. Historisch gesehen wurde diese Flexibilität über die Shortcode API erreicht, indem komplexe Logik über vom Server verarbeitete Makros in eckigen Klammern injiziert wurde. Die Einführung des Gutenberg-Editors erzwang jedoch einen Paradigmenwechsel: den Übergang zu strukturierten visuellen Block-Oberflächen.

Dieses Kapitel zeichnet diese technische Entwicklung nach. Du lernst, klassische Shortcodes zu beherrschen, Attribute und Verschachtelungen sicher zu verwalten und schließlich den architektonischen Sprung zu wagen, um native dynamische Blöcke zu erstellen und zu integrieren.

## 8.1 Die Shortcode API im Detail

Die mit WordPress 2.5 eingeführte Shortcode API bietet einen robusten Mechanismus zum Erstellen von Makros innerhalb von benutzerverwalteten Inhalten. Obwohl sich das WordPress-Ökosystem in Richtung Gutenberg-Blöcke bewegt (wie wir später in diesem Kapitel sehen werden), bleiben Shortcodes aufgrund ihrer Einfachheit, Abwärtskompatibilität und Nützlichkeit in Bereichen, in denen der Block-Editor nicht verfügbar ist (wie veraltete Text-Widgets oder benutzerdefinierte Felder), ein grundlegendes Werkzeug.

Auf architektonischer Ebene ist ein Shortcode nichts anderes als ein Tag in eckigen Klammern (zum Beispiel `[mein_tag]`), das von der WordPress-Engine abgefangen und durch HTML-Code oder dynamischen Inhalt ersetzt wird, der von einer in PHP geschriebenen Callback-Funktion generiert wird.

### Die interne Mechanik: Reguläre Ausdrücke und der Filter `the_content`

Um die Shortcode API im Detail zu verstehen, ist es wichtig zu begreifen, wie WordPress diese Tags verarbeitet. Der WordPress-Core durchsucht die Datenbank beim Speichern eines Beitrags nicht nach Shortcodes. Die Verarbeitung erfolgt ausschließlich zur Laufzeit (Frontend), wenn der Inhalt für die Anzeige vorbereitet wird.

Der Verarbeitungsfluss folgt diesem Zyklus:

```text
+---------------------+
| Rohinhalt           | (Gespeichert in wp_posts, enthält '[mi_shortcode]')
+---------------------+
           |
           v
+---------------------+
| Filter: the_content | (Angewendet über apply_filters('the_content', $content))
+---------------------+
           |
           v
+---------------------+
| Interne Funktion    | (WP ruft do_shortcode($content) auf)
+---------------------+
           |
           v
+---------------------+
| Regex-Verarbeitung  | (get_shortcode_regex() sucht nach Treffern)
+---------------------+
           |
           v
+---------------------+
| Callback-Ausführung | (Die dem Shortcode zugeordnete Funktion wird aufgerufen)
+---------------------+
           |
           v
+---------------------+
| Gerenderter Inhalt  | (Die eckigen Klammern werden durch den Rückgabewert ersetzt)
+---------------------+

```

Die Funktion `do_shortcode()` ist der Hauptmotor. Sie verwendet einen hochkomplexen regulären Ausdruck (generiert von `get_shortcode_regex()`), um registrierte Tags zu identifizieren. Dabei werden solche ignoriert, die maskiert (z. B. `[[mi_shortcode]]`) oder in HTML-Tags wie `<pre>` oder `<code>` enthalten sind.

### Registrierung und die globale Variable `$shortcode_tags`

Wenn du einen Shortcode registrierst, fügt WordPress einfach ein neues Element zu einem globalen assoziativen Array namens `$shortcode_tags` hinzu. Die Registrierung erfolgt über die Funktion `add_shortcode()`.

```php
/**
 * Registriert den Shortcode [saludo_basico]
 */
function mi_plugin_registrar_shortcodes() {
    add_shortcode( 'saludo_basico', 'mi_plugin_renderizar_saludo' );
}
// Es wird empfohlen, Shortcodes im Hook 'init' zu registrieren
add_action( 'init', 'mi_plugin_registrar_shortcodes' );

```

Die API bietet auch Kontroll- und Wartungsfunktionen für dieses globale Array:

* `remove_shortcode( $tag )`: Entfernt einen bestimmten Shortcode.
* `remove_all_shortcodes()`: Leert das globale Array (nützlich für gründliche Bereinigungen oder Testumgebungen).
* `shortcode_exists( $tag )`: Prüft, ob ein Tag bereits registriert ist, um Namenskollisionen mit anderen Plugins zu vermeiden.

### Die Anatomie der Callback-Funktion

Die für die Verarbeitung des Shortcodes verantwortliche Callback-Funktion erhält immer drei Parameter vom WordPress-Core, unabhängig davon, ob der Benutzer sie verwendet hat oder nicht:

1. **`$atts` (array | string):** Ein assoziatives Array von Attributen, die vom Benutzer definiert wurden, oder ein leerer String, wenn keine definiert wurden. Wir werden uns im nächsten Abschnitt näher mit deren Bereinigung und Iteration befassen.
2. **`$content` (string | null):** Der Inhalt, der zwischen dem öffnenden und schließenden Tag eingeschlossen ist (wenn der Shortcode vom umschließenden Typ ist, z. B. `[tag]Inhalt[/tag]`). Bei selbstschließenden Shortcodes ist dies `null`.
3. **`$tag` (string):** Der Name des Shortcodes, der den Callback aufgerufen hat. Nützlich, wenn du dieselbe Callback-Funktion für mehrere ähnliche Shortcodes verwendest.

### Das absolute Gebot: Zurückgeben (return), niemals direkt ausgeben

Der häufigste und destruktivste Fehler bei der Entwicklung von Shortcodes ist die Verwendung direkter Ausgabeanweisungen wie `echo`, `print` oder `var_dump` innerhalb der Callback-Funktion.

Da Shortcodes mitten in der Ausführung des Filters `the_content` (oder über manuelle Aufrufe von `do_shortcode()`) verarbeitet werden, wird jede direkte Ausgabe vorzeitig im PHP-Ausführungsfluss ausgegeben. Dies führt dazu, dass der Inhalt des Shortcodes ganz oben auf der Seite oder außerhalb seines vorgesehenen HTML-Containers erscheint, was das Layout völlig zerstört.

Ein Shortcode-Callback **muss immer einen String zurückgeben (return)**.

**Falscher Weg (zerstört das Layout):**

```php
function mi_plugin_shortcode_incorrecto() {
    echo '<div class="alerta">Dies ist ein schwerer Fehler.</div>'; 
    // Fehlende return-Anweisung
}

```

**Richtiger Weg (einfache Verkettung):**

```php
function mi_plugin_shortcode_correcto() {
    return '<div class="alerta">Dieser Inhalt wird an der richtigen Stelle gerendert.</div>';
}

```

### Handhabung von komplexem HTML: Ausgabe-Pufferung (Output Buffering)

Das Verketten von Strings reicht für einfache Shortcodes aus, aber wenn komplexe HTML-Templates, Formulare oder Views gerendert werden müssen, die eine umfangreiche bedingte Logik erfordern, wird die String-Verkettung in PHP fehleranfällig und schwer zu warten.

Die standardmäßige und professionelle Lösung innerhalb der Shortcode API ist die Verwendung der PHP-Ausgabepuffer-Steuerungsfunktionen (`ob_start` und `ob_get_clean`).

```php
function mi_plugin_shortcode_avanzado( $atts, $content = null ) {
    // 1. Pufferung starten
    ob_start(); 
    
    // Ab hier kann reines HTML verwendet oder Template-Dateien eingebunden werden
    ?>
    <div class="mi-plugin-contenedor">
        <h3>Systeminformationen</h3>
        <ul>
            <li>PHP-Version: <?php echo phpversion(); ?></li>
            <li>Verzeichnis: <?php echo plugin_dir_path( __FILE__ ); ?></li>
        </ul>
        <?php if ( current_user_can( 'manage_options' ) ) : ?>
            <p>Diese Nachricht ist nur für Administratoren sichtbar.</p>
        <?php endif; ?>
    </div>
    <?php
    // Für mehr Sauberkeit könnte ein Include verwendet werden:
    // include plugin_dir_path( __FILE__ ) . 'views/vista-shortcode.php';
    
    // 2. Pufferinhalt erfassen, leeren und zurückgeben
    return ob_get_clean(); 
}
add_shortcode( 'info_sistema', 'mi_plugin_shortcode_avanzado' );

```

Die Verwendung von `ob_start()` fängt jedes `echo` oder direkte HTML im Arbeitsspeicher ab, anstatt es an den Browser zu senden. `ob_get_clean()` gibt den erfassten Inhalt als einzelnen String zurück und schaltet den Puffer aus. Dies ermöglicht es, die Anforderung der Shortcode API zur Rückgabe des Ergebnisses zu erfüllen, während der Code lesbar bleibt und komplexe Ansichten mühelos integriert werden können.

## 8.2 Verschachtelte Shortcodes und Attribute

Die wahre Stärke der Shortcode API liegt in ihrer Fähigkeit, dynamische Parameter zu empfangen und Inhaltshierarchien zu verarbeiten. Ein statischer Shortcode, wie wir ihn im vorherigen Abschnitt gesehen haben, hat nur begrenzten Nutzen. Durch das Implementieren von Attributen und das Zulassen von Verschachtelungen verwandeln wir einfache Tags in komplexe und wiederverwendbare strukturelle Komponenten.

### Attributverwaltung: Die Funktion `shortcode_atts()`

Wenn ein Benutzer im Editor Parameter zu einem Shortcode hinzufügen (zum Beispiel `[boton color="rojo" url="https://beispiel.de"]`), WordPress diese Informationen über den ersten Parameter, der üblicherweise `$atts` genannt wird, an die Callback-Funktion übergibt.

Benutzer können jedoch Attribute weglassen, Tippfehler machen oder unerwünschte Parameter einschleusen. Um dies standardisiert und sicher zu handhaben, stellt WordPress die Funktion `shortcode_atts()` bereit.

Diese Funktion wirkt wie ein kombinierter Filter: Sie definiert Standardwerte, führt die vom Benutzer eingegebenen Attribute zusammen und verwirft alle Attribute, die in deinen Standardwerten nicht explizit definiert sind.

```php
/**
 * Button-Shortcode mit Attributen
 * Verwendung: [mi_boton url="https://wp.org" color="verde"]Klick hier[/mi_boton]
 */
function mi_plugin_shortcode_boton( $atts, $content = null ) {
    // 1. Standardattribute definieren und mit denen des Benutzers zusammenführen
    $atributos_limpios = shortcode_atts( 
        array(
            'url'   => '#',
            'color' => 'azul',
            'size'  => 'normal'
        ), 
        $atts, 
        'mi_boton' // Der dritte Parameter aktiviert den Filter 'shortcode_atts_mi_boton'
    );

    // 2. Daten vor der Ausgabe IMMER bereinigen und escapen
    $url_segura   = esc_url( $atributos_limpios['url'] );
    $color_seguro = sanitize_html_class( $atributos_limpios['color'] );
    $size_seguro  = sanitize_html_class( $atributos_limpios['size'] );
    
    // Wenn kein Inhalt vorhanden ist, weisen wir einen Standardtext zu
    $texto = $content ? esc_html( $content ) : __( 'Button', 'mi-plugin' );

    // 3. Formatiertes HTML zurückgeben
    return sprintf( 
        '<a href="%1$s" class="btn btn-%2$s btn-%3$s">%4$s</a>', 
        $url_segura, 
        $color_seguro, 
        $size_seguro, 
        $texto 
    );
}
add_shortcode( 'mi_boton', 'mi_plugin_shortcode_boton' );

```

**Kritischer Sicherheitshinweis:** `shortcode_atts()` stellt sicher, dass nur die von dir definierten Schlüssel existieren, aber **bereinigt die Werte nicht**. Wenn ein Benutzer `url="javascript:alert('XSS')"` einfügt, lässt die Funktion dies durchgehen. Du musst die von `shortcode_atts()` zurückgegebenen Variablen immer unmittelbar vor der Ausgabe oder Integration in dein HTML escapen, wie im Beispiel mit `esc_url()` und `sanitize_html_class()` gezeigt.

### Verschachtelte Shortcodes (Nested Shortcodes)

Oft wirst du Layout-Container erstellen wollen, die andere Elemente umschließen. Zum Beispiel eine Spalten-Box, die Buttons enthält:

```text
[caja_destacada fondo="gris"]
    <h2>Bereichs-Titel</h2>
    [mi_boton url="/contacto"]Schreib uns[/mi_boton]
[/caja_destacada]

```

Wenn du den `$content` innerhalb der Funktion von `[caja_destacada]` standardmäßig extrahierst und zurückgibst, verarbeitet der WordPress-Core den internen Shortcode `[mi_boton]` **nicht**. Der Benutzer sieht den eckigen Klammertext eins zu eins auf dem Bildschirm.

Um die Rekursion zu aktivieren und zu ermöglichen, dass Kind-Shortcodes korrekt gerendert werden, musst du den Inhalt vor der Rückgabe durch die Funktion `do_shortcode()` leiten.

```php
/**
 * Container-Shortcode, der Verschachtelung unterstützt
 */
function mi_plugin_shortcode_caja( $atts, $content = null ) {
    $a = shortcode_atts( array(
        'fondo' => 'blanco'
    ), $atts, 'caja_destacada' );

    $clase_fondo = sanitize_html_class( $a['fondo'] );

    // Wir starten den Puffer für ein saubereres Markup
    ob_start();
    ?>
    <div class="mi-caja-wrapper fondo-<?php echo $clase_fondo; ?>">
        <div class="mi-caja-contenido">
            <?php 
            // Wir verarbeiten jeden internen Shortcode explizit
            echo do_shortcode( $content ); 
            ?>
        </div>
    </div>
    <?php
    return ob_get_clean();
}
add_shortcode( 'caja_destacada', 'mi_plugin_shortcode_caja' );

```

### Das Problem mit wpautop und der Formatierung von Shortcodes

Eine häufige Herausforderung bei der Arbeit mit verschachtellten Shortcodes ist die Funktion `wpautop()` von WordPress, die doppelte Zeilenumbrüche automatisch in `<p>`-Tags und einfache in `<br>`-Tags umwandelt.

Wenn der Benutzer die Shortcodes im Editor visuell durch Zeilenumbrüche trennt, um den Text übersichtlich zu halten, umschließt WordPress die Shortcodes oft mit leeren Absatz-Tags (z. B. `<p><div class="mi-caja-wrapper">...</div></p>`). Dies macht das HTML ungültig (ein `<div>`-Block darf nicht innerhalb eines `<p>` stehen) und zerstört die Layout-Abstände.

Um dies nativ abzumildern, versucht WordPress, umschließende Shortcodes zu bereinigen, was jedoch nicht immer perfekt gelingt. Wenn du `<p>`- oder `<br>`-Tags um die Ausgabe deiner Container-Shortcodes herum findest, kannst du eine Bereinigung innerhalb deines Callbacks mit `shortcode_unautop()` erzwingen:

```php
$contenido_limpio = shortcode_unautop( $content );
$contenido_procesado = do_shortcode( $contenido_limpio );

```

Diese Technik entfernt unerwünschte automatische Formatierungen, die die Struktur hierarchischer Block-Shortcodes stören.

## 8.3 Einführung in Gutenberg-Blöcke

Die Einführung von Gutenberg in WordPress 5.0 war der größte architektonische Wandel in der Geschichte der Plattform. Während klassische Shortcodes und Metaboxen fast ihre gesamte Logik an die Serverseite (PHP) delegieren, verlagert der Block-Editor die Verantwortung für die Benutzeroberfläche und die Inhaltserstellung auf die Clientseite (Browser) unter Verwendung von JavaScript und React.

Als PHP-Plugin-Entwickler erfordert der Sprung zu Gutenberg einen konzeptionellen Paradigmenwechsel. Wir fangen Inhalte nicht mehr kurz vor der Anzeige ab; stattdessen stellen wir interaktive Werkzeuge bereit, mit denen der Benutzer das Layout direkt im Editor aufbauen kann.

### Der Paradigmenwechsel: PHP vs. JavaScript (React)

Um Gutenberg zu verstehen, ist es wichtig zu analysieren, wie Informationen im Vergleich zur klassischen Shortcode API gespeichert und verarbeitet werden.

```text
+-------------------------------------------------------------------+
| TRADITIONELLES MODELL (Shortcodes)                                |
+-------------------------------------------------------------------+
| 1. Editor: Der Benutzer schreibt „[mi_plugin id='5']“.            |
| 2. DB (wp_posts): Das wörtliche Tag „[mi_plugin...]“ wird         |
|    gespeichert.                                                   |
| 3. Frontend: Bei jedem Besuch liest PHP den Beitrag, findet den   |
|    Shortcode, führt Abfragen aus und generiert HTML in Echtzeit.  |
+-------------------------------------------------------------------+

+-------------------------------------------------------------------+
| GUTENBERG-MODELL (Statische Blöcke)                               |
+-------------------------------------------------------------------+
| 1. Editor: Der Benutzer interagiert mit einer visuellen           |
|    Benutzeroberfläche (React).                                    |
| 2. DB (wp_posts): Das bereits strukturierte finale HTML wird      |
|    gespeichert, umschlossen von HTML-Kommentar-Begrenzern.        |
| 3. Frontend: Bei jedem Besuch gibt PHP einfach das bereits        |
|    generierte HTML aus. Keinerlei rechenintensive Verarbeitung.   |
+-------------------------------------------------------------------+

```

Wenn du die Datenbank eines mit Gutenberg erstellten Beitrags inspizierst, siehst du anstelle von Shortcodes eine Struktur, die auf HTML-Kommentaren basiert, die der WordPress-Core verwendet, um die Benutzeroberfläche im Editor zu rekonstruieren:

```html
<div class="alerta-bloque alerta-advertencia">
    <p>Dies ist der vom Benutzer geschriebene Inhalt.</p>
</div>

```

### Die Triade eines Blocks

Die moderne Blockentwicklung in WordPress standardisiert sich um drei grundlegende Elemente, die Konfiguration, Serverlogik und Benutzeroberfläche trennen:

1. **`block.json` (Metadaten):** Eine Konfigurationsdatei, die den Blocknamen, Attribute, Script-Abhängigkeiten und Stile definiert. Sie ist der aktuelle Goldstandard und erleichtert das effiziente Laden von Ressourcen.
2. **PHP-Registrierung:** Der Servercode, der dafür zuständig ist, die `block.json` zu lesen und WordPress mitzuteilen, dass der Block existiert, wodurch die erforderlichen Ressourcen automatisch geladen (enqueued) werden.
3. **JavaScript-Scripts (React):** Dateien, in denen die WordPress Block API verwendet werden (normalerweise unter dem globalen Objekt `wp` angesiedelt), um die Editor-Steuerelemente zu zeichnen (`edit`) und zu definieren, welches HTML in der Datenbank gespeichert wird (`save`).

### Der aktuelle Standard: Die Datei `block.json`

Bevor eine einzige Zeile PHP oder JavaScript geschrieben wird, beginnt ein professioneller Block mit der Definition seiner Identität und Datenstruktur in einer `block.json`-Datei. Dies zentralisiert die Informationen und ermöglicht es WordPress zu optimieren, welches CSS oder JS im Frontend geladen wird — und zwar nur dann, wenn der Block tatsächlich auf der Seite vorhanden ist.

**Beispiel für eine grundlegende `block.json`-Datei:**

```json
{
    "$schema": "https://schemas.wp.org/trunk/block.json",
    "apiVersion": 3,
    "name": "mi-plugin/saludo",
    "title": "Begrüßungs-Block",
    "category": "text",
    "icon": "smiley",
    "description": "Ein einfacher Block zur Anzeige einer Nachricht.",
    "attributes": {
        "mensaje": {
            "type": "string",
            "default": "Hallo Welt!"
        }
    },
    "textdomain": "mi-plugin",
    "editorScript": "file:./build/index.js",
    "editorStyle": "file:./build/index.css",
    "style": "file:./build/style-index.css"
}

```

* **`apiVersion: 3`**: Gibt an, dass der Block die neuesten Features der API verwendet (kompatibel mit Iframes im Editor und der globalen Style-Engine).
* **`attributes`**: Das Äquivalent zu den Shortcode-Attributen. Hier definierst du das Datenschema, das der Block verarbeitet (Strings, Booleans, Arrays).
* **`editorScript` / `style`**: WordPress liest diese Pfade und lädt die kompilierten Dateien automatisch, ohne dass du `wp_enqueue_script` oder `wp_enqueue_style` manuell aufrufen musst.

### Blockregistrierung über PHP

Mit der strukturierten `block.json`-Datei wird die Arbeit in PHP extrem minimalistisch. Du musst lediglich mit der Funktion `register_block_type()` auf den Ordner verweisen, der die JSON-Datei enthält.

```php
/**
 * Registriert den Block durch Einlesen der Metadaten aus block.json
 */
function mi_plugin_registrar_bloques() {
    // Der Pfad muss auf das VERZEICHNIS weisen, das die block.json enthält
    $directorio_bloque = plugin_dir_path( __FILE__ ) . 'src/bloque-saludo';
    
    register_block_type( $directorio_bloque );
}
// Der empfohlene Hook für Blöcke ist 'init'
add_action( 'init', 'mi_plugin_registrar_bloques' );

```

Im Gegensatz zur Shortcode API, bei der PHP die gesamte Renderarbeit über eine Callback-Funktion übernimmt, fungiert PHP bei einem standardmäßigen statischen Block (wie er in dieser anfänglichen Architektur definiert ist) nur als Brücke. Nach der Registrierung übernimmt die JavaScript-Laufzeitumgebung innerhalb des WordPress-Editors (`wp.blocks.registerBlockType`) die vollständige Kontrolle über das Erstellungs- und Interaktivitätserlebnis.

## 8.4 Dynamisch gerenderte Blöcke

Trotz des durch Gutenberg eingeführten Paradigmenwechsels hin zur Clientseite gibt es zahlreiche Szenarien, in denen das Rendern von statischem HTML und das Speichern in der Datenbank nicht praktikabel ist. Wenn dein Block Informationen anzeigen muss, die sich ständig ändern (wie die neuesten Beiträge, der Lagerbestand eines Produkts oder Daten basierend auf der Benutzersitzung), wird ein statischer Block im Moment des Speicherns veraltet sein.

Hier kommen dynamische Blöcke ins Spiel. Ein dynamischer Block ist der direkte geistige Nachfolger des Shortcodes: Er wird im Editor visuell in React konfiguriert, aber seine Darstellung im Frontend wird zur Laufzeit vollständig an PHP delegiert.

### Architektur eines dynamischen Blocks

Im Gegensatz zu einem statischen Block, der das gesamte HTML-Markup speichert, speichert ein dynamischer Block **ausschließlich die Attribute** (und den internen Inhalt, wenn es sich um einen Container-Block handelt) in der Datenbank.

```text
+-------------------------------------------------------------------+
| ABLAUF EINES DYNAMISCHEN BLOCKS                                   |
+-------------------------------------------------------------------+
| 1. EDITOR (React): Der Benutzer passt Optionen an (z. B. „Zeige   |
|    5 Beiträge“). Die `save`-Funktion in JS gibt `null` zurück.    |
|                                                                   |
| 2. DATENBANK (wp_posts): Ein minimalistischer Platzhalter wird    |
|    gespeichert:                                                   |
|                                                                   |
| 3. FRONTEND (PHP): Beim Laden der Seite liest WP den Platzhalter, |
|    extrahiert das JSON und übergibt es an deine Callback-         |
|    Funktion in PHP.                                               |
|                                                                   |
| 4. RENDERING: Dein PHP-Code fragt die DB ab und generiert in      |
|    genau diesem Moment das aktualisierte HTML.                    |
+-------------------------------------------------------------------+

```

### Konfiguration in `block.json`

Um einen dynamischen Block zu erstellen, bleibt die Datei `block.json` dein Ausgangspunkt. Der Hauptunterschied besteht darin, dass du in modernen Versionen der Block API (v3) direkt auf eine PHP-Datei verweisen kannst, die sich unter Verwendung der Eigenschaft `render` um das Rendering kümmert.

```json
{
    "$schema": "https://schemas.wp.org/trunk/block.json",
    "apiVersion": 3,
    "name": "mi-plugin/lista-dinamica",
    "title": "Dynamische Liste",
    "category": "widgets",
    "attributes": {
        "cantidad": {
            "type": "number",
            "default": 3
        },
        "categoria": {
            "type": "string",
            "default": "alle"
        }
    },
    "editorScript": "file:./build/index.js",
    "render": "file:./render.php"
}

```

Durch das Definieren von `"render": "file:./render.php"` lädt und bindet WordPress diese PHP-Datei automatisch im Frontend ein und übergibt ihr spezifische Variablen, ohne dass du den Callback manuell in deiner Hauptdatei des Plugins registrieren musst.

### Die Rendering-Datei (PHP-Callback)

Die in der `block.json` angegebene Datei `render.php` fungiert als Ausgabe-Template. WordPress stellt innerhalb dieser Datei automatisch drei Variablen zur Verfügung:

1. **`$attributes` (array):** Die vom Block definierten und gespeicherten Attribute.
2. **`$content` (string):** Der gespeicherte interne Inhalt (nützlich, wenn der Block verschachtelte Blöcke über `<InnerBlocks />` zulässt).
3. **`$block` (WP_Block):** Die vollständige Instanz des Blocks, nützlich für den Zugriff auf den globalen Kontext oder tiefergehende Daten.

Hier ist ein Beispiel dafür, wie die Datei `render.php` aussehen würde:

```php
<?php
/**
 * Rendering des Blocks mi-plugin/lista-dinamica
 * * @var array    $attributes Die Attribute des Blocks.
 * @var string   $content    Der interne Inhalt des Blocks.
 * @var WP_Block $block      Die Instanz des Blocks.
 */

// 1. Attribute extrahieren und absichern
$cantidad  = isset( $attributes['cantidad'] ) ? absint( $attributes['cantidad'] ) : 3;
$categoria = isset( $attributes['categoria'] ) ? sanitize_text_field( $attributes['categoria'] ) : 'alle';

// 2. Komplexe PHP-Logik (z. B. WP_Query)
$args = array(
    'post_type'      => 'post',
    'posts_per_page' => $cantidad,
);

if ( $categoria !== 'alle' ) {
    $args['category_name'] = $categoria;
}

$query = new WP_Query( $args );

// 3. Rendering (Die Datei fungiert in der modernen API als impliziter Puffer)
$wrapper_attributes = get_block_wrapper_attributes( array(
    'class' => 'mi-lista-dinamica-contenedor'
) );
?>

<div <?php echo $wrapper_attributes; ?>>
    <?php if ( $query->have_posts() ) : ?>
        <ul class="mi-lista-dinamica-items">
            <?php while ( $query->have_posts() ) : $query->the_post(); ?>
                <li>
                    <a href="<?php get_permalink(); ?>">
                        <?php the_title(); ?>
                    </a>
                </li>
            <?php endwhile; wp_reset_postdata(); ?>
        </ul>
    <?php else : ?>
        <p><?php esc_html_e( 'Keine Beiträge gefunden.', 'mi-plugin' ); ?></p>
    <?php endif; ?>
</div>

```

**Hinweis zu `get_block_wrapper_attributes()`:** Dies ist eine lebenswichtige Funktion in der modernen Blockentwicklung. Sie generiert automatisch die HTML-Attribute (wie `class`, `id`, `style`) und stellt sicher, dass jeder Stil, jede Ausrichtung oder jede benutzerdefinierte Klasse, die der Benutzer im Editor mithilfe der globalen Gutenberg-Tools angewendet hat, korrekt an das Frontend übertragen wird.

### Traditionelle Registrierung über `render_callback`

Wenn du die Eigenschaft `render` in der `block.json` nicht verwendest (z. B. wenn du es vorziehst, die Logik in einer PHP-Klasse zu zentralisieren, oder in einer Legacy-Umgebung arbeitest), kannst du die Callback-Funktion direkt bei der Blockregistrierung in PHP angeben:

```php
function mi_plugin_registrar_bloque_dinamico() {
    register_block_type(
        plugin_dir_path( __FILE__ ) . 'src/lista-dinamica',
        array(
            'render_callback' => 'mi_plugin_renderizar_lista_dinamica',
        )
    );
}
add_action( 'init', 'mi_plugin_registrar_bloque_dinamico' );

function mi_plugin_renderizar_lista_dinamica( $attributes, $content, $block ) {
    ob_start();
    // Rendering-Logik hier (ähnlich wie render.php)
    return ob_get_clean();
}

```

Wie bei Shortcodes gilt auch hier: Wenn du eine Funktion verwendest, die `render_callback` zugewiesen ist, **musst du das finale HTML immer zurückgeben** (normalerweise unter Verwendung des Ausgabepuffers) und darfst es niemals direkt ausgeben.

### Synchronisierung im Editor (`ServerSideRender`)

Eine häufige Herausforderung bei dynamischen Blöcken besteht darin, dass der Benutzer im Gutenberg-Editor sehen muss, wie das Endergebnis aussehen wird. Das Replizieren von WordPress-Datenbankabfragen in JavaScript (React) kann komplex und ineffizient sein.

Um dies zu lösen, das WordPress-Komponentenpaket (`@wordpress/server-side-render`) die Komponente `<ServerSideRender />` anbietet. Wenn du diese in der `edit`-Funktion deiner React-Skripte verwendest, führt WordPress im Hintergrund automatisch einen Aufruf der REST API aus, führt deinen PHP-Code aus `render.php` (oder `render_callback`) aus und zeichnet das resultierende HTML direkt im Editor. Dies garantiert, dass Backend und Frontend immer identisch sind, ohne dass die Logik dupliziert werden muss.

## Kapitelzusammenfassung

In diesem Kapitel haben wir die grundlegenden Werkzeuge zur Integration interaktiver und dynamischer Benutzeroberflächen in WordPress-Inhalte behandelt:

* **Shortcode API:** Wir haben die interne Funktionsweise basierend auf regulären Ausdrücken und dem Filter `the_content` verstanden. Wir haben die goldene Regel gelernt, den Inhalt immer unter Verwendung des Ausgabepuffers (`ob_start()`) zurückzugeben, anstatt ihn direkt auszugeben.
* **Attribute und Verschachtelung:** Wir haben gesehen, wie man `shortcode_atts()` verwendet, um Standardwerte sicher festzulegen, und wie man interne Shortcodes durch Aufrufe von `do_shortcode()` verarbeitet.
* **Einführung in Gutenberg:** Wir haben den Paradigmenwechsel zwischen der Ausführung auf dem Server (PHP) und dem Client (React) untersucht und die Triade des modernen Blocks kennengelernt, die auf dem Standard der Datei `block.json` basiert.
* **Dynamische Blöcke:** Wir haben gelernt, das Beste aus beiden Welten zu kombinieren, indem wir Oberflächen im Block-Editor konfigurieren, aber das Rendern zur Laufzeit an PHP-Code delegieren, um sich ständig ändernde Daten auf strukturierte und moderne Weise zu verwalten.
