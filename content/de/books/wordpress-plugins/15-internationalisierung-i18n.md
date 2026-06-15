Die Entwicklung eines professionellen Plugins endet nicht, wenn der Code in deiner Muttersprache funktioniert; die wahre globale Reichweite erfordert eine korrekte Internationalisierung (i18n). In diesem Kapitel wirst du deine Codebasis darauf vorbereiten, mithilfe der `gettext`-Engine von WordPress in jede beliebige Sprache lokalisiert zu werden.

Wir werden die essenziellen Wrapper-Funktionen, die dynamische Pluralbehandlung und die semantische Begriffsklärung durch Kontext untersuchen. Schließlich wirst du das effiziente Laden des Textdomains (*Text Domain*) und die automatisierte Extraktion von Zeichenketten via WP-CLI beherrschen, um die branchenüblichen POT-Vorlagendateien zu generieren.

## 15.1 Grundlegende Übersetzungsfunktionen

Die Internationalisierung (i18n) in WordPress basiert auf dem GNU-`gettext`-Lokalisierungssystem. Damit ein Plugin in eine beliebige Sprache übersetzt werden kann, müssen alle für den Endbenutzer oder den Administrator lesbaren statischen Textzeichenketten spezielle Wrapper-Funktionen (*wrapper functions*) durchlaufen. Diese Funktionen ermöglichen es der WordPress-Engine, die ursprüngliche Zeichenkette (normalerweise auf Englisch verfasst) abzufangen und das übersetzte Äquivalent basierend auf den aktiven Übersetzungsdateien zurückzugeben.

### Das Konzept des Textdomains

Bevor du eine Übersetzungsfunktion anwendest, ist es unerlässlich, das *Text Domain* (Textdomain) zu definieren. Dies ist ein eindeutiger Bezeichner, den WordPress verwendet, um Textzeichenketten den spezifischen Übersetzungsdateien deines Plugins zuzuordnen. So werden Kollisionen mit gleichnamigen Zeichenketten des Cores oder anderer Komponenten vermieden.

Als Entwicklungsstandard muss das *Text Domain* exakt mit dem Namen des Plugin-Ordners (dem *Slug*) übereinstimmen. Wenn sich dein Plugin beispielsweise in `wp-content/plugins/mi-gestor-avanzado/` befindet, lautet deine Textdomain `mi-gestor-avanzado`.

Nachfolgend wird der logische Fluss veranschaulicht, dem eine Textzeichenkette vom Quellcode bis zum Bildschirm des Benutzers folgt:

```text
[ Quellcode: __('Guardar', 'mi-gestor-avanzado') ]
                         │
                         ▼
        Existiert die .mo-Datei des Plugins?
                         │
         ┌───────────────┴───────────────┐
         ▼ JA                            ▼ NEIN
   Existiert die exakte Übersetzung?     │
         │                               │
   ┌─────┴─────┐                         │
   ▼ JA        ▼ NEIN                    │
[Übersetzt] [Original]              [Original]
   │           │                         │
   └───────────┼─────────────────────────┘
               ▼
      [ Rückgabe / Bildschirm-Rendering ]

```

### Die Basisfunktionen: `__()` und `_e()`

Die zwei elementaren Werkzeuge der i18n in WordPress sind `__()` und `_e()`. Beide haben dieselbe strukturelle Signatur, unterscheiden sich jedoch grundlegend in ihrem Ausgabeverhalten.

#### 1. Die Funktion `__()`

Gibt die übersetzte Zeichenkette zurück. Diese Funktion sollte verwendet werden, wenn der Text einer Variablen zugewiesen, als Argument an eine andere Funktion übergeben oder vor seiner Ausgabe verarbeitet werden soll.

#### 2. Die Funktion `_e()`

Gibt die übersetzte Zeichenkette direkt im Ausgabepuffer aus (`echo`). Es ist eine semantische Abkürzung für `echo __(...)`.

#### Implementierungsbeispiel im Plugin-Ökosystem

```php
<?php
/**
 * Beispiel für die korrekte Verwendung von __() und _e() innerhalb einer Metabox.
 */

// Verwendung von __() zur Übergabe der Zeichenkette als Argument an eine andere WordPress-Funktion
add_meta_box(
    'mga_render_metabox',
    __( 'Configuración Avanzada del Post', 'mi-gestor-avanzado' ), // Gibt den Text zurück
    'mga_callback_metabox',
    'post'
);

function mga_callback_metabox( $post ) {
    // Verwendung von _e() zum direkten Rendern von Text in der Admin-Oberfläche
    ?>
    <p>
        <label for="mga_field_custom">
            <?php _e( 'Introduce el identificador único:', 'mi-gestor-avanzado' ); // Gibt den Text aus ?>
        </label>
    </p>
    <?php
}

```

### Die goldene Regel der statischen Analyse

Der Prozess zur Generierung von Übersetzungskatalogen (POT-/PO-Dateien) basiert auf Werkzeugen zur **statischen Codeanalyse** (wie `xgettext` oder der WordPress-CLI). Diese Hilfsprogramme lesen die PHP-Dateien als Klartextzeichenketten und suchen nach Aufrufen von i18n-Funktionen; sie führen den PHP-Code nicht aus.

Daher ist es un kritischer Fehler, Variablen, Konstanten oder Funktionsaufrufe als Originaltext oder Textdomain innerhalb der Übersetzungsfunktionen zu übergeben.

#### Fehlerhafte vs. korrekte Codemuster

```php
<?php
// FALSCH: Der statische Parser kann den Wert der Variable nicht auswerten.
$mensaje = 'Operación completada con éxito.';
_e( $mensaje, 'mi-gestor-avanzado' );

// FALSCH: Konstanten sind weder für den Text noch für die Domain zulässig.
define( 'MGA_DOMAIN', 'mi-gestor-avanzado' );
_e( 'Guardar cambios', MGA_DOMAIN );

// RICHTIG: Beide Zeichenketten sind reine, feste Textliterale.
_e( 'Operación completada con éxito.', 'mi-gestor-avanzado' );

```

Wenn du Dynamik in den Texten benötigst (z. B. das Einfügen eines Benutzernamens oder eines Zählers), verknüpfe Variablen niemals direkt innerhalb oder außerhalb der Funktion. Um dieses Szenario internationalisierbar zu lösen, müssen die grundlegenden Übersetzungsfunktionen mit String-Formatierungsfunktionen wie `sprintf()` oder `printf()` kombiniert werden. Dies hält den Textblock für die Übersetzer intakt.

```php
<?php
/**
 * Korrekte dynamische Handhabung von Variablen in statischen Zeichenketten
 */

$usuario_activo = 'Alejandro';

// FALSCH (Bricht die grammatikalische Struktur in anderen Sprachen auf und fragmentiert die Übersetzung)
echo __( 'Bienvenido de nuevo, ', 'mi-gestor-avanzado' ) . $usuario_activo;

// RICHTIG (Hält die Zeichenkette durch die Verwendung eines Platzhalters einheitlich)
printf(
    /* translators: %s: Name des aktuellen Benutzers */
    __( 'Bienvenido de nuevo, %s.', 'mi-gestor-avanzado' ),
    $usuario_activo
);

```

\*Best-Practice-Hinweis:\* Der Inline-Kommentar `/* translators: ... */` unmittelbar vor der Funktion dient als unterstützende Metadaten. Die Extraktionswerkzeuge lesen diesen Kommentar und zeigen ihn dem Übersetzer in seiner Lokalisierungssoftware an, sodass er versteht, welche Informationen den Modifikator `%s` ersetzen werden.

## 15.2 Kontext und Pluralbildung

Die englische Sprache ist in ihren grammatikalischen Regeln vergleichsweise einfach und verfügt über eine große Anzahl homonymer Wörter (Begriffe, die gleich geschrieben werden, aber unterschiedliche Bedeutungen haben). Wenn wir ein Plugin in Sprachen mit komplexeren morphologischen Strukturen oder unterschiedlichen Deklinationsformen übersetzen, reichen die Basisfunktionen `__()` und `_e()` nicht aus. Um diese Szenarien zu lösen, bietet WordPress spezialisierte Funktionen an, die den Kontext von Wörtern und die dynamische Pluralbildung handhaben.

### Begriffsklärung mit Kontext: `_x()` und `_ex()`

Ein häufiges Problem bei der Internationalisierung tritt auf, wenn dasselbe englische Wort je nach seiner Funktion in der Benutzeroberfläche völlig unterschiedliche Übersetzungen erfordert. Das klassische Beispiel in WordPress ist das Wort „Post“. Es kann sich auf das Substantiv (ein Blogbeitrag) oder das Verb (die Aktion des Veröffentlichens) beziehen. Im Deutschen würde dies als „Beitrag“ bzw. „Veröffentlichen“ übersetzt.

Wenn wir einfach `__( 'Post', 'mi-gestor-avanzado' )` verwenden, sieht der Übersetzer die Zeichenkette isoliert und weiß nicht, welche Variante er wählen soll, was eine einzige Bedeutung für beide Stellen erzwingt.

Um diese Semantik bereitzustellen, verwenden wir `_x()` (gibt den Wert zurück) und `_ex()` (gibt ihn direkt aus). Ihre Signatur fügt einen zusätzlichen Parameter für den Kontext hinzu:

```php
function _x( $text, $context, $domain = 'default' )

```

#### Beispiel für die Verwendung von Kontext

```php
<?php
// Derselbe Originaltext, aber mit unterschiedlichen Kontexten, um den Übersetzer zu leiten
$boton_submit  = _x( 'Post', 'Aktion des Veröffentlichens im Formular', 'mi-gestor-avanzado' );
$titulo_columna = _x( 'Post', 'Substantiv, Tabellenspalte', 'mi-gestor-avanzado' );

// In der Ausgabe (HTML)
echo '<button type="submit">' . esc_html( $boton_submit ) . '</button>';

```

Der statische Parser generiert zwei verschiedene Einträge in der `.pot`-Datei, sodass das Übersetzungsteam separate Werte im Deutschen („Veröffentlichen“ und „Beitrag“) zuweisen kann, ohne dass es zu Kollisionen im Wörterbuch kommt.

### Dynamische Pluralbildung: `_n()`

Ein häufiger Fehler bei Entwicklern ist der Versuch, Plurale mit einer einfachen bedingten Struktur in PHP zu handhaben:

```php
// FALSCH: Gehe nicht davon aus, dass alle Sprachen nur zwei Formen haben (1 oder mehrere).
if ( $count === 1 ) {
    $mensaje = sprintf( __( 'Tienes %d mensaje nuevo.', 'mi-gestor-avanzado' ), $count );
} else {
    $mensaje = sprintf( __( 'Tienes %d mensajes nuevos.', 'mi-gestor-avanzado' ), $count );
}

```

Diese bedingte Logik scheitert auf globaler Ebene kläglich. Während das Englische, Spanische oder Deutsche zwei Pluralformen haben (Singular für 1, Plural für 0 oder mehr als 1), haben andere Sprachen drastisch unterschiedliche Regeln. Das Russische hat drei Pluralformen basierend auf der numerischen Endung, das Arabische hat bis zu sechs Formen und das Japanische unterscheidet überhaupt nicht zwischen Singular und Plural.

Um diese Komplexität an die `gettext`-Engine zu delegieren, verwenden wir die Funktion `_n()`, die eine Ganzzahl auswertet und basierend auf den grammatikalischen Regeln der Zielsprache bestimmt, welche Zeichenkette an den Übersetzer übergeben wird.

```php
function _n( $singular, $plural, $number, $domain = 'default' )

```

#### Beispiel für eine korrekte Implementierung

Ähnlich wie Zeichenketten mit dynamischen Variablen gibt die Funktion `_n()` die reine Textvorlage zurück, die von `printf()` oder `sprintf()` umschlossen werden muss, um den numerischen Wert einzufügen:

```php
<?php
$elementos_borrados = 4;

// RICHTIG: Die Entscheidung über die Pluralbildung an die i18n-Engine delegieren
$mensaje = sprintf(
    /* translators: %s: Anzahl der gelöschten Elemente */
    _n(
        'Se ha eliminado %s registro de la base de datos.', // Singular
        'Se han eliminado %s registros de la base de datos.', // Plural
        $elementos_borrados,                                  // Evaluator
        'mi-gestor-avanzado'                                  // Domain
    ),
    number_format_i18n( $elementos_borrados ) // Einzufügender Wert (entsprechend der Sprache formatiert)
);

echo esc_html( $mensaje );

```

\*Hinweis:\* Beachte die Verwendung von `number_format_i18n()`. Wenn Zahlen in die Benutzeroberfläche eingefügt werden, ist es eine gute Praxis, sie mit dieser nativen Funktion zu formatieren, da sie Tausender- und Dezimaltrennzeichen an die regionale Konfiguration der Website anpasst (z. B. `1,000.50` im Englischen vs. `1.000,50` im europäischen Spanisch oder Deutsch).

### Kombination von Kontext und Pluralbildung: `_nx()`

In komplexen Benutzeroberflächen benötigst du möglicherweise eine dynamische Pluralbildung für einen Begriff, der zudem mehrere Bedeutungen hat (was Kontext erfordert). Hierfür gibt es `_nx()`, die beide Konzepte verschmilzt:

```php
function _nx( $singular, $plural, $number, $context, $domain = 'default' )

```

#### Matrix der Internationalisierungsfunktionen

Das folgende Schema fasst die Verwendung der Basisfunktionen basierend auf den spezifischen Anforderungen des Textes zusammen:

```text
                      Benötigt Kontext zur Begriffsklärung?
                               NEIN                 JA
                        ┌───────────────┐   ┌───────────────┐
                     NEIN Rückgabe: __()│   │ Rückgabe: _x()│
  Hängt von einer       │ Ausgabe:  _e()│   │ Ausgabe: _ex()│
  dynamischen Zahl ab?  └───────────────┘   └───────────────┘
                        ┌───────────────┐   ┌───────────────┐
                     JA │ Rückgabe: _n()│   │ Rückgabe:_nx()│
                        │ Echo: (N/A) * │   │ Echo: (N/A) * │
                        └───────────────┘   └───────────────┘

```

\* Die Pluralisierungsfunktionen haben keine direkten Ausgabe-Varianten (wie z. B. `_ne()`, das nicht existiert), da sie von Natur aus fast immer in einem `printf()` verschachtelt sein müssen, um die tatsächliche Zahl einzufügen, die den Plural bestimmt hat.\*

## 15.3 Laden von Textdomains

Die Verwendung der in den vorherigen Abschnitten behandelten Internationalisierungsfunktionen (wie `__()` oder `_e()`) und die Definition einer Textdomain (*Text Domain*) ist nur die halbe Miete. Damit WordPress die übersetzten Zeichenketten zurückgeben kann, muss es wissen, in welchem physischen Verzeichnis sich die kompilierten Kataloge (die `.mo`-Dateien) befinden, die der aktiven Sprache der Website entsprechen.

Dieser Verknüpfungsprozess wird als „Laden der Textdomain“ bezeichnet und ist ein wesentlicher Konfigurationsschritt im Lebenszyklus eines Plugins.

### Die Funktion `load_plugin_textdomain()`

Die WordPress-API stellt die spezifische Funktion `load_plugin_textdomain()` bereit, um den Pfad zu registrieren, in dem sich deine Übersetzungen befinden.

```php
load_plugin_textdomain( $domain, $deprecated, $plugin_rel_path );

```

Ihre Parameter sind:

1. **`$domain`** *(string)*: Der eindeutige Bezeichner deines Plugins (derselbe, den du in allen Übersetzungsfunktionen und im Header unter `Text Domain` verwendest).
2. **`$deprecated`** *(false)*: Ein veraltetes Argument aus älteren WordPress-Versionen. Muss immer als `false` übergeben werden.
3. **`$plugin_rel_path`** *(string)*: Der relative Pfad vom Verzeichnis `wp-content/plugins` zum Übersetzungsordner deines Plugins.

### Empfohlene Verzeichnisarchitektur

Der Community-Standard schreibt vor, dass Übersetzungsdateien in einem Unterverzeichnis namens `/languages` (oder alternativ `/lang`) im Stammordner des Plugins gespeichert werden sollten.

```text
wp-content/plugins/mi-gestor-avanzado/
├── mi-gestor-avanzado.php        (Hauptdatei)
├── readme.txt
├── includes/
└── languages/                    (Übersetzungsverzeichnis)
    ├── mi-gestor-avanzado.pot    (Basisvorlage)
    ├── mi-gestor-avanzado-es_ES.po (Spanische Übersetzung - editierbar)
    └── mi-gestor-avanzado-es_ES.mo (Spanische Übersetzung - kompiliert)

```

\*Hinweis zur Nomenklatur:\* Die `.mo`- und `.po`-Dateien müssen strikt dem Muster `domain-locale.mo` folgen. Für Deutsch (Deutschland) wäre dies beispielsweise `mi-gestor-avanzado-de_DE.mo` und für Französisch `mi-gestor-avanzado-fr_FR.mo`.

### Der korrekte Hook: `plugins_loaded`

Das Laden der Textdomain sollte nicht isoliert in der Hauptdatei des Plugins ausgeführt werden. Es muss zum exakten Zeitpunkt im WordPress-Ladezyklus eingehängt werden: wenn alle Plugins erkannt wurden, aber bevor die Benutzeroberfläche verarbeitet oder Header gesendet werden.

Der geeignete Hook hierfür ist **`plugins_loaded`**.

#### Beispiel für eine Standardimplementierung

Füge diesen Codeblock in deine Hauptdatei (oder in die Initialisierungsklasse deiner Architektur) ein:

```php
<?php
/**
 * Initialisiert das Laden der Plugin-Übersetzungen
 */
function mga_cargar_textdomain() {
    // Generiert den relativen Pfad dynamisch
    $ruta_relativa = dirname( plugin_basename( __FILE__ ) ) . '/languages';

    // Lädt die .mo-Dateien
    load_plugin_textdomain(
        'mi-gestor-avanzado', 
        false, 
        $ruta_relativa 
    );
}
// Hängt die Funktion zum optimalen Zeitpunkt ein
add_action( 'plugins_loaded', 'mga_cargar_textdomain' );

```

In diesem Snippet, `plugin_basename( __FILE__ )` ermittelt den Pfad der aktuellen Datei relativ zum Plugins-Verzeichnis (z. B. `mi-gestor-avanzado/mi-gestor-avanzado.php`), und `dirname()` extrahiert nur den Ordner (`mi-gestor-avanzado`). Durch das Anhängen von `/languages` konstruieren wir den exakten relativen Pfad, den die Funktion benötigt.

### JIT (Just-In-Time) und das offizielle Repository

Es ist wichtig zu verstehen, wie sich WordPress entwickelt hat. Seit Version 4.6 hat der Core *Just-In-Time*-Übersetzungen (JIT) eingeführt.

Wenn dein Plugin öffentlich ist und im offiziellen Repository auf WordPress.org gehostet wird, übersetzt es die Community über die kollaborative Plattform `translate.wordpress.org` (GlotPress). In diesem Szenario **lädt und installiert WordPress die Sprachpakete automatisch** im sicheren globalen Verzeichnis (`wp-content/languages/plugins/`) und lädt sie erst in den Speicher, wenn die erste Übersetzungsfunktion aufgerufen wird.

Wenn sich dein Plugin also im offiziellen Repository befindet, wird der Aufruf von `load_plugin_textdomain()` technisch redundant und optional. Es bleibt jedoch eine obligatorische Praxis, wenn:

1. Du ein **Premium- oder privates Plugin** entwickelst, das nicht im WP.org-Repository vorhanden ist.
2. Du **Standardübersetzungen** (Fallback) bereitstellen möchtest, die direkt in der `.zip`-Datei deines Plugins verpackt sind.
3. Du in einer lokalen Umgebung entwickelst und deine eigenen `.mo`-Dateien vor der Verteilung testen musst.

Die Prioritätsreihenfolge des Cores bevorzugt immer Übersetzungen, die in `wp-content/languages/plugins/` abgelegt sind (von WP verwaltet), gegenüber denen im plugin-eigenen Verzeichnis `/languages/` (über Code geladen). Dies stellt sicher, dass die Benutzer immer die neuesten Sprach-Updates erhalten.

## 15.4 Generierung von POT-Dateien

Sobald der gesamte Quellcode des Plugins mit den Internationalisierungsfunktionen (`__()`, `_e()`, `_n()` etc.) ausgestattet wurde, besteht der nächste logische Schritt darin, all diese Zeichenketten zu extrahieren und in einem einheitlichen Katalog zusammenzuführen. Dieser Master-Katalog ist die **POT**-Datei (Portable Object Template).

Die POT-Datei contiene keine Übersetzungen; sie dient ausschließlich als Basisvorlage. Übersetzer (oder Werkzeuge wie Poedit und GlotPress) verwenden diese Datei, um die `.po`-Dateien (Portable Object, in denen die für Menschen lesbaren Übersetzungen gespeichert sind) und die `.mo`-Dateien (Machine Object, die von WordPress gelesenen kompilierten Binärdateien) zu generieren.

### Anatomie einer POT-Datei

Eine POT-Datei ist im Wesentlichen eine strukturierte Klartextdatei. Sie beginnt mit einem Metadaten-Header (Plugin-Informationen, Übersetzungsteam, Kodierung), gefolgt von einer Liste aller extrahierten Zeichenketten.

```text
# Metadaten-Header
msgid ""
msgstr ""
"Project-Id-Version: Mi Gestor Avanzado 1.0.0\n"
"Report-Msgid-Bugs-To: https://wordpress.org/support/plugin/mi-gestor-avanzado\n"
"POT-Creation-Date: 2023-10-25 10:00:00+00:00\n"
"MIME-Version: 1.0\n"
"Content-Type: text/plain; charset=UTF-8\n"
"Content-Transfer-Encoding: 8bit\n"

# Standard-Eintrag
#: includes/class-mga-admin.php:45
msgid "Configuración Avanzada del Post"
msgstr ""

# Eintrag mit Kontext
#: includes/class-mga-post-types.php:112
msgctxt "Acción de publicar en el formulario"
msgid "Post"
msgstr ""

# Eintrag mit Pluralbildung
#: includes/class-mga-database.php:88
msgid "Se ha eliminado %s registro de la base de datos."
msgid_plural "Se han eliminado %s registros de la base de datos."
msgstr[0] ""
msgstr[1] ""

```

\*Hinweis:\* Die Dateiverweise (`#: includes/...`) sind für Übersetzer von entscheidender Bedeutung, da sie es ihnen ermöglichen, die exakte Codezeile zu finden, wenn sie zusätzlichen Kontext zur Verwendung einer Zeichenkette in der Benutzeroberfläche benötigen.

### Professionelle Extraktion mit WP-CLI

Historisch gesehen waren Entwickler darauf angewiesen, komplexe Parser in Desktop-Tools wie Poedit zu konfigurieren, um nach WordPress-Funktionen zu suchen. Heutzutage ist der absolute Standard im professionellen Ökosystem die Verwendung von **WP-CLI** (die Befehlszeilenschnittstelle von WordPress), die einen nativen Befehl zum Analysieren von PHP-Code und zur Generierung von POT-Dateien mit absoluter Präzision enthält.

Der Basisbefehl lautet `wp i18n make-pot`.

#### Einfache Ausführung

Wenn du dich im Stammverzeichnis deines Plugins befindest, scannt die einfachste Ausführung den gesamten Ordner und generiert die Datei im Verzeichnis `/languages`:

```bash
wp i18n make-pot . languages/mi-gestor-avanzado.pot

```

#### Fortgeschrittene Ausführung (Ausschlüsse und Header)

In einer modernen Entwicklungsumgebung enthält dein Plugin wahrscheinlich Verzeichnisse, die nicht von der i18n-Engine gescannt werden sollten (z. B. Composer-Abhängigkeiten, Node-Pakete oder Unit-Tests). Das Scannen dieser Verzeichnisse verlangsamt nicht nur den Prozess, sondern verunreinigt deine POT-Datei mit Zeichenketten aus Bibliotheken von Drittanbietern.

Du kannst die Generierung mithilfe von Flags optimieren:

```bash
wp i18n make-pot . languages/mi-gestor-avanzado.pot \
    --slug="mi-gestor-avanzado" \
    --domain="mi-gestor-avanzado" \
    --exclude="vendor,node_modules,tests,.github" \
    --headers='{"Report-Msgid-Bugs-To":"https://github.com/dein-benutzername/mi-gestor-avanzado/issues"}'

```

* `--slug`: Definiert den Slug des Plugins.
* `--domain`: Zwingt den Extractor, nur Zeichenketten zu erfassen, die mit dieser Textdomain übereinstimmen, und ignoriert Tippfehler im Code, bei denen du die Domain vergessen haben könntest.
* `--exclude`: Eine kommagetrennte Liste der zu ignorierenden Verzeichnisse.
* `--headers`: Injiziert oder überschreibt JSON-Metadaten direkt im Header der POT-Datei.

### Automatisierungsalternativen

Obwohl die manuelle Ausführung des WP-CLI-Befehls effektiv ist, sollte die Generierung der POT-Datei in professionellen Architekturen Teil der Build-Pipeline (*build pipeline*) sein.

Wenn du Node.js verwendest, um deine Assets (CSS/JS) zu kompilieren, ist es Standardpraxis, den Aufruf von WP-CLI oder JavaScript-basierten Dienstprogrammen (wie `@wordpress/i18n` oder `gulp-wp-pot`-Tasks) in die Datei `package.json` aufzunehmen:

```json
{
  "scripts": {
    "build": "npm run build:css && npm run build:js && npm run makepot",
    "makepot": "wp i18n make-pot . languages/mi-gestor-avanzado.pot --exclude=node_modules,vendor,src"
  }
}

```

Indem du diesen Schritt in den Build-Skripten automatisierst, stellst du sicher, dass die POT-Datei bei jeder Paketierung einer neuen Version (*Release*) des Plugins neu generiert wird. Dies verhindert, dass Übersetzer mit veralteten Vorlagen arbeiten oder dass „verwaiste“ Zeichenketten in der Benutzeroberfläche erscheinen.

## Zusammenfassung des Kapitels

Die Internationalisierung (i18n) ist die Brücke, die es deinem Plugin ermöglicht, ein globales Publikum zu erreichen, ohne dass mehrere Codebasen erforderlich sind. In diesem Kapitel haben wir den vollständigen Lokalisierungs-Lebenszyklus in WordPress untersucht:

1. Wir begannen mit der Isolierung statischer Zeichenketten über die **grundlegenden Übersetzungsfunktionen** (`__()`, `_e()`) und haben verstanden, wie wichtig es ist, Variablen nicht dynamisch zu verketten, sondern Platzhalter zu verwenden (`sprintf()`).
2. Wir haben die semantische Präzision durch die Anwendung von **Kontext und dynamischer Pluralbildung** (`_x()`, `_n()`) erhöht und die komplexe grammatikalische Logik anderer Sprachen an die WordPress-Engine delegiert, anstatt Bedingungen in PHP zu verwenden.
3. Wir haben den Code mit den physischen Dateien verknüpft, indem wir **die Textdomain geladen** haben mit `load_plugin_textdomain()`. Dabei haben wir das *Just-In-Time*-Verhalten und die Verzeichnis-Prioritäten zwischen dem offiziellen Repository und den lokalen Übersetzungen verstanden.
4. Schließlich haben wir den Prozess durch die **Generierung von POT-Dateien** gefestigt, indem wir branchenübliche Tools wie WP-CLI verwendet haben, um saubere und für Übersetzer bereite Vorlagen zu erstellen.
