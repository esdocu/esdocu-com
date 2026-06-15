WordPress wurde ursprünglich als Blogging-Plattform entwickelt, doch seine wahre Stärke als CMS liegt in seiner enormen Flexibilität. In diesem Kapitel lassen wir die Einschränkung hinter uns, ausschließlich „Beiträge“ oder „Seiten“ zu nutzen. Du lernst, wie du maßgeschneiderte Informationsarchitekturen durch die erweiterte Registrierung von Custom Post Types (CPTs) und benutzerdefinierten Taxonomien erstellst. Wir untersuchen, wie man die Administrationsoberfläche konfiguriert, eine korrekte semantische Internationalisierung sicherstellt und die Beziehung zwischen Entitäten beherrscht, um effiziente kombinierte Abfragen auszuführen. Es ist an der Zeit, deine Daten professionell und ohne Einschränkungen zu strukturieren.

## 3.1 Fortgeschrittene Registrierung von CPTs

Im Core von WordPress ist ein Custom Post Type (CPT) keine separate Datenbankstruktur; es handelt sich lediglich um eine Zeile in der Tabelle `wp_posts`, bei der die Spalte `post_type` einen vom Entwickler definierten Wert anstelle der Standardwerte (`post`, `page`, `attachment` etc.) aufweist. Die „Registrierung“ eines CPTs ist daher der Akt, die WordPress-API anzuweisen, wie sie mit diesem spezifischen Bezeichner interagieren, ihn routen, anzeigen und verwalten soll.

Die zentrale Funktion für diese Aufgabe lautet `register_post_type( $post_type, $args )`. Für eine professionelle Entwicklung geht die Konfiguration des Arrays `$args` jedoch weit über das bloße Sichtbarmachen im Admin-Bereich hinaus.

### Der richtige Hook: `init`

Die Registrierung eines CPTs sollte immer an die Action `init` angehängt werden. Eine zu frühe Registrierung (wie bei `plugins_loaded`) kann dazu führen, dass das URL-Rewriting fehlschlägt, und eine zu späte Registrierung (wie bei `wp_loaded`) bedeutet, dass der CPT nicht verfügbar ist, wenn andere Plugins oder der Core selbst versuchen, darauf zuzugreifen.

```php
/**
 * Handler-Klasse für die Registrierung des CPTs 'Buch'.
 */
class MiPlugin_CPT_Libro {

    const POST_TYPE = 'miplugin_libro';

    public function init() {
        add_action( 'init', [ $this, 'registrar_cpt' ] );
    }

    public function registrar_cpt() {
        // Hinweis: Die Interface-Argumente (Labels) werden in Sektion 3.2 behandelt
        $labels = [
            'name'          => __( 'Bücher', 'miplugin' ),
            'singular_name' => __( 'Buch', 'miplugin' ),
        ];

        $args = [
            'labels'              => $labels,
            'public'              => true,
            'publicly_queryable'  => true,
            'show_ui'             => true,
            'show_in_menu'        => true,
            'query_var'           => true,
            'rewrite'             => [ 'slug' => 'libros', 'with_front' => false ],
            'capability_type'     => 'post',
            'has_archive'         => true,
            'hierarchical'        => false,
            'menu_position'       => 20,
            'supports'            => [ 'title', 'editor', 'thumbnail', 'excerpt', 'revisions' ],
            'show_in_rest'        => true, // Aktiviert Gutenberg und die REST-API
        ];

        register_post_type( self::POST_TYPE, $args );
    }
}

$cpt_libro = new MiPlugin_CPT_Libro();
$cpt_libro->init();

```

### Das Array `$args` analysieren (Erweiterte Konfiguration)

Um die vollständige Kontrolle über das Verhalten des CPTs zu haben, ist es wichtig, die Kaskade von Vererbungen zu verstehen, die bestimmte boolesche Argumente erzeugen, und wie sie sich auf das WP-Ökosystem auswirken.

#### 1. Sichtbarkeit und Barrierefreiheit

Das Argument `public` ist eine Abkürzung. Wenn du es auf `true` setzt, setzt WordPress die folgenden Argumente automatisch auf `true` (sofern sie nicht explizit überschrieben werden):

* `exclude_from_search`: False (erscheint in den Suchergebnissen).
* `publicly_queryable`: True (ist über die URL erreichbar).
* `show_in_nav_menus`: True.
* `show_ui`: True.

In fortgeschrittenen Architekturen ist es üblich, CPTs für den internen Gebrauch zu haben (z. B. zum Speichern von Logs oder komplexen Konfigurationen). Für einen „unsichtbaren“, aber über Code verwaltbaren CPT:

```php
'public'              => false,
'show_ui'             => false,
'publicly_queryable'  => false,
'exclude_from_search' => true,

```

#### 2. Unterstützung des modernen Editors (Gutenberg)

Das Argument `show_in_rest` hat einen Paradigmenwechsel eingeleitet. Ursprünglich dafür gedacht, den CPT in der REST-API bereitzustellen (die wir in Kapitel 13 besprechen), ist es in aktuellen WordPress-Versionen **der Hauptschalter für den Block-Editor**.

Wenn `show_in_rest` auf `false` gesetzt ist (Standard) oder weggelassen wird, verwendet der CPT den klassischen Editor (TinyMCE). Wenn es auf `true` gesetzt wird, lädt WordPress Gutenberg. Zudem kannst du den Basispfad der API mit `rest_base` und `rest_controller_class` anpassen, falls du die Logik der Endpunkte konfigurieren musst.

#### 3. Umschreibungs-Engine (Rewrite Rules)

Das Array `rewrite` steuert, wie die WP_Rewrite-API die URLs des CPTs verarbeitet.

* `slug`: Verwendet standardmäßig den Namen des CPTs, erlaubt aber die Definition einer benutzerfreundlichen URL (z. B. von `miplugin_libro` zu `libros`).
* `with_front`: Wenn deine allgemeine Permalink-Struktur eine Basis hat (wie `/blog/%postname%/`), führt die Einstellung `true` dazu, dass dein CPT unter `/blog/libros/mein-buch/` erreichbar ist. Die Einstellung `false` erzwingt `/libros/mein-buch/`, was in 90 % der Fälle bevorzugt wird.
* `pages`: Unterstützung für Paginierung innerhalb des CPTs.

*Wichtig:* Das Ändern des `slug` erfordert das Leeren der Rewrite Rules. Verwende `flush_rewrite_rules()` niemals innerhalb des Hooks `init` (das beeinträchtigt die Performance schwer). Dies sollte nur während der Aktivierungsroutine des Plugins geschehen (Kapitel 2.3).

#### 4. Array der Fähigkeiten (`supports`)

Definiert, welche Metaboxen und Core-Funktionen in der Bearbeitungsoberfläche geladen werden.

| Argument | Auswirkung auf Interface und Datenbank |
| --- | --- |
| title | Fügt das Titelfeld und die Spalte post_title hinzu. |
| editor | Lädt TinyMCE oder Gutenberg (je nach show_in_rest). |
| author | Metabox zur Zuweisung des post_author. |
| thumbnail | Unterstützung für post_thumbnail (Beitragsbild). |
| excerpt | Metabox für den Auszug (post_excerpt). |
| trackbacks | Unterstützung für Pingbacks und Trackbacks. |
| custom-fields | Lädt das native Interface für Custom Fields. |
| comments | Aktiviert die Diskussionsunterstützung (comment_status). |
| revisions | Aktiviert das Speichern von Revisionen (post_parent). |
| page-attributes | Metabox für Reihenfolge (menu_order) und Hierarchie. |
| post-formats | Unterstützung für Beitragsformate (Video, Aside, Galerie). |

Wenn du das Argument `supports` weglässt, weist WordPress standardmäßig `['title', 'editor']` zu. Wenn du `false` übergibst, bietet der CPT keine dieser nativen Funktionen, was nützlich ist, wenn du eine komplett eigene Bearbeitungsoberfläche auf Basis eigener Metaboxen erstellen möchtest (Kapitel 4).

## 3.2 Labels und Argumente der Benutzeroberfläche

Wenn ein Custom Post Type registriert wird, hängt die Benutzererfahrung (UX) im WordPress-Admin-Bereich vollständig von der semantischen Konfiguration seiner Labels und den Argumenten ab, die sein visuelles Verhalten definieren. Ein CPT mit schlecht konfigurierten Labels zeigt generische Texte an, die vom Inhaltstyp `post` ererbt wurden, was dem Plugin Professionalität nimmt und den Administrator verwirrt.

### Semantische Internationalisierung: Die Verwendung von `_x()`

Um das Array der Beschriftungen (`labels`) aufzubauen, reicht die Verwendung der Standard-Übersetzungsfunktion `__()` nicht aus. In vielen Sprachen betrifft die Geschlechtsbeugung sowohl Substantive als auch die zugehörigen Adjektive und Verben.

Zum Beispiel wird die Zeichenkette „Add New“ im Spanischen als „Añadir nuevo“ übersetzt, wenn der CPT ein „Buch“ ist, muss aber „Añadir nueva“ lauten, wenn der CPT eine „Rechnung“ ist. Um dies ohne Hardcodieren der Sprache zu lösen, bietet WordPress die Funktion `_x()`, die Übersetzern einen syntaktischen Kontext bereitstellt.

```php
$labels = [
    'name'                  => _x( 'Bücher', 'Post type general name', 'miplugin' ),
    'singular_name'         => _x( 'Buch', 'Post type singular name', 'miplugin' ),
    'menu_name'             => _x( 'Bücher', 'Admin Menu text', 'miplugin' ),
    'name_admin_bar'        => _x( 'Buch', 'Add New on Toolbar', 'miplugin' ),
    'add_new'               => _x( 'Neu hinzufügen', 'Libro', 'miplugin' ),
    'add_new_item'          => __( 'Neues Buch hinzufügen', 'miplugin' ),
    'new_item'              => __( 'Neues Buch', 'miplugin' ),
    'edit_item'             => __( 'Buch bearbeiten', 'miplugin' ),
    'view_item'             => __( 'Buch ansehen', 'miplugin' ),
    'all_items'             => __( 'Alle Bücher', 'miplugin' ),
    'search_items'          => __( 'Bücher suchen', 'miplugin' ),
    'parent_item_colon'     => __( 'Übergeordnete Bücher:', 'miplugin' ),
    'not_found'             => __( 'Keine Bücher gefunden.', 'miplugin' ),
    'not_found_in_trash'    => __( 'Keine Bücher im Papierkorb gefunden.', 'miplugin' ),
    'featured_image'        => _x( 'Buchcover', 'Overrides the “Featured Image” phrase', 'miplugin' ),
    'set_featured_image'    => _x( 'Cover festlegen', 'Overrides the “Set featured image” phrase', 'miplugin' ),
    'remove_featured_image' => _x( 'Cover entfernen', 'Overrides the “Remove featured image” phrase', 'miplugin' ),
    'use_featured_image'    => _x( 'Als Cover verwenden', 'Overrides the “Use as featured image” phrase', 'miplugin' ),
];

```

### Positionierung der Labels in der Admin-Oberfläche

Das folgende Schema veranschaulicht, wie die wichtigsten konfigurierten Labels im visuellen Lebenszyklus des WordPress-Admin-Bereichs abgebildet werden:

```text
+-------------------------------------------------------------------------+
| WP Admin Bar -> [+] Hinzufügen -> [name_admin_bar]                      |
+-------------------------------------------------------------------------+
| Seitenmenü (Sidebar)        | Arbeitsbereich / Inhaltsauflistung        |
|                             |                                           |
| -- [menu_name]              | Home > [name] > [all_items]               |
|    |-- [all_items]          |                                           |
|    |-- Neu hinzufügen       | [all_items]  [add_new] <-- Oberer Button  |
|                             |                                           |
|                             | +---------------------------------------+ |
|                             | | Suchfeld:   [search_items]            | |
|                             | +---------------------------------------+ |
|                             |                                           |
|                             | Wenn die Liste leer ist:                  |
|                             | "[not_found]"                             |
+-------------------------------------------------------------------------+

```

### Argumente zur UI-Steuerung

Über die Texte hinaus gibt es spezifische Argumente im `$args`-Array von `register_post_type()`, die die Erreichbarkeit und Positionierung des CPTs innerhalb des Admin-Bereichs bestimmen.

#### `menu_position` (Position im Seitenmenü)

Dieses Argument akzeptiert eine Ganzzahl, die die Reihenfolge des Erscheinens in der Seitenleiste bestimmt. Wenn es weggelassen wird, platziert WordPress es standardmäßig unterhalb der Kommentare (Position 25).

Die genauen Menüpositionen des Cores zu kennen, hilft visuelle Konflikte zu vermeiden:

* `5`: Unterhalb von Beiträgen (Posts).
* `10`: Unterhalb von Medien (Media).
* `15`: Unterhalb von Links.
* `20`: Unterhalb von Seiten (Pages).
* `25`: Unterhalb von Kommentaren.
* `60`: Unterhalb des ersten Menütrenners.
* `65`: Unterhalb von Plugins.
* `70`: Unterhalb von Benutzern.
* `75`: Unterhalb von Werkzeugen.
* `80`: Unterhalb von Einstellungen.
* `100`: Unterhalb des zweiten Menütrenners.

#### `menu_icon` (Visuelle Identität)

Um das Icon für das Seitenmenü zu definieren, gibt es zwei professionelle Wege:

1. **Dashicons:** Die native Icon-Schriftbibliothek von WordPress. Der Klassenname wird direkt übergeben (z. B. `'dashicons-book-alt'`).
2. **Eingebettetes SVG:** Für ein individuelles Branding kann ein String mit einem Base64-codierten SVG übergeben werden. Dies vermeidet zusätzliche HTTP-Anfragen und sorgt für Konsistenz, unabhängig vom ausgewählten Admin-Theme des Benutzers.

```php
'menu_icon' => 'data:image/svg+xml;base64,' . base64_encode( '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path fill="#black" d="M15 2h-8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-12c0-1.1-.9-2-2-2zm-1 5h-6v-1h6v1zm0 3h-6v-1h6v1zm0 3h-6v-1h6v1z"/></svg>' ),

```

#### `show_in_menu` (CPTs verlinken / verschachteln)

Dieser Parameter akzeptiert einen booleschen Wert oder einen String. Durch Übergabe eines Pfads zu einer `.php`-Datei des Admin-Bereichs kannst du deinen CPT in ein bestehendes Menü einordnen, statt einen Menüpunkt auf oberster Ebene zu erstellen.

* In Beiträge einbetten: `'show_in_menu' => 'edit.php'`
* In Einstellungen einbetten: `'show_in_menu' => 'options-general.php'`
* In ein eigenes, vom Plugin erstelltes Menü einbetten: `'show_in_menu' => 'mi_panel_de_control_slug'`

### Ändern des Platzhaltertexts im Titel

Standardmäßig zeigt das Texteingabefeld für den Titel des CPTs den generischen Text „Titel eingeben“ an. Das Ändern dieses Verhaltens erfolgt nicht über ein direktes Argument in `register_post_type()`, sondern durch Abfangen des Filters `enter_title_here`.

Es folgt ein Beispiel, wie man diese Logik sauber in die objektorientierte Struktur der CPT-Entwicklung einbindet:

```php
class MiPlugin_CPT_Libro {

    const POST_TYPE = 'miplugin_libro';

    public function init() {
        add_action( 'init', [ $this, 'registrar_cpt' ] );
        add_filter( 'enter_title_here', [ $this, 'modificar_placeholder_titulo' ] );
    }

    public function registrar_cpt() {
        // Registrierung des CPTs mit den zuvor erklärten Argumenten und Labels...
    }

    /**
     * Modifiziert den Platzhaltertext (placeholder) des Titels
     * nur dann, wenn wir den spezifischen CPT bearbeiten.
     *
     * @param string $title Aktueller Platzhaltertext.
     * @return string Modifizierter Text.
     */
    public function modificar_placeholder_titulo( $title ) {
        $screen = get_current_screen();

        if ( isset( $screen->post_type ) && self::POST_TYPE === $screen->post_type ) {
            return __( 'Gib den Buchtitel ein (z. B. Don Quijote)', 'miplugin' );
        }

        return $title;
    }
}

```

## 3.3 Registrierung eigener Taxonomien

Ebenso wie Custom Post Types die Inhaltstypen in WordPress erweitern, ermöglichen benutzerdefinierte Taxonomien das mehrdimensionale Strukturieren von Beziehungen und Kategorisierungen dieser Inhalte. Im WordPress-Core ist eine Taxonomie ein Klassifizierungssystem (wie die nativen Kategorien oder Schlagwörter), deren Begriffe in der Tabelle `wp_terms` gespeichert und über `wp_term_relationships` mit den Inhalten verknüpft werden.

Die für diesen Zweck vorgesehene Core-Funktion lautet `register_taxonomy( $taxonomy, $object_type, $args )`. Wie bei den CPTs erfordert eine fortgeschrittene Registrierung eine präzise Steuerung der Argumente und deren Ausführung zum richtigen Zeitpunkt im WordPress-Lebenszyklus.

### Der richtige Hook und die Ausführungsreihenfolge

Benutzerdefinierte Taxonomien müssen immer innerhalb des Hooks `init` registriert werden. Es ist technisch möglich und wird empfohlen, sowohl den CPT als auch die zugehörige Taxonomie innerhalb derselben Callback-Funktion zu registrieren, die an `init` angehängt ist, um den Code zusammenzuhalten.

```php
/**
 * Klasse zur Verwaltung der Registrierung der Taxonomie 'Genre'.
 */
class MiPlugin_Taxonomia_Genero {

    const TAXONOMY = 'miplugin_genero';
    const POST_TYPE = 'miplugin_libro'; // In 3.1 definierter assoziierter CPT

    public function init() {
        add_action( 'init', [ $this, 'registrar_taxonomia' ] );
    }

    public function registrar_taxonomia() {
        $labels = [
            'name'              => _x( 'Genres', 'taxonomy general name', 'miplugin' ),
            'singular_name'     => _x( 'Genre', 'taxonomy singular name', 'miplugin' ),
            'search_items'      => __( 'Genres suchen', 'miplugin' ),
            'all_items'         => __( 'Alle Genres', 'miplugin' ),
            'parent_item'       => __( 'Übergeordnetes Genre', 'miplugin' ),
            'parent_item_colon' => __( 'Übergeordnetes Genre:', 'miplugin' ),
            'edit_item'         => __( 'Genre bearbeiten', 'miplugin' ),
            'update_item'       => __( 'Genre aktualisieren', 'miplugin' ),
            'add_new_item'      => __( 'Neues Genre hinzufügen', 'miplugin' ),
            'new_item_name'     => __( 'Name des neuen Genres', 'miplugin' ),
            'menu_name'         => __( 'Genres', 'miplugin' ),
        ];

        $args = [
            'labels'            => $labels,
            'hierarchical'      => true, // Verhalten ähnlich wie Kategorien
            'public'            => true,
            'show_ui'           => true,
            'show_admin_column' => true, // Automatische Spalte im CPT-Listeneintrag
            'show_in_nav_menus' => true,
            'show_tagcloud'     => false,
            'rewrite'           => [ 'slug' => 'genero', 'with_front' => false ],
            'show_in_rest'      => true, // Erforderlich für Gutenberg
        ];

        register_taxonomy( self::TAXONOMY, [ self::POST_TYPE ], $args );
    }
}

$tax_genero = new MiPlugin_Taxonomia_Genero();
$tax_genero->init();

```

### Hierarchisch vs. Nicht hierarchisch: Das Argument `hierarchical`

Das Argument `hierarchical` bestimmt die strukturelle Funktionsweise und die Benutzeroberfläche der Taxonomie im Administrationsbereich:

* **`'hierarchical' => true` (Kategorie-Stil):** Ermittelt Vater-Kind-Beziehungen zwischen Begriffen. Im Inhaltseditor (Gutenberg oder klassisch) wird dies als Liste von Kontrollkästchen (Checkboxes) gerendert. Benutzer wählen bereits existierende Begriffe aus oder können direkt neue erstellen, ohne die Bearbeitungsansicht zu verlassen.
* **`'hierarchical' => false` (Schlagwort-Stil):** Erlaubt keine Vererbung oder übergeordneten Elemente. In der Oberfläche wird dies als Textfeld dargestellt, in das Begriffe kommagetrennt eingegeben werden können. Es bietet zudem eine Autovervollständigung auf Basis der am häufigsten genutzten Begriffe.

### Erweiterte Steuerungsargumente

Um die Integration der Taxonomie im Ökosystem der Website zu verfeinern, sollten folgende spezifische Parameter beherrscht werden:

#### `show_admin_column`

Wird dieses Argument auf `true` gesetzt, wird WordPress angewiesen, automatisch eine benutzerdefinierte Spalte in der Auflistungstabelle des zugewiesenen CPTs zu erstellen (in diesem Fall in der Ansicht `edit.php?post_type=miplugin_libro`). Dies spart dem Entwickler die Arbeit, manuell die Admin-Spaltenfilter abzufangen, um die zugewiesenen Begriffe für jeden Eintrag anzuzeigen.

#### `meta_box_cb`

Erlaubt es, die Callback-Funktion komplett zu ändern, die für das Rendern des Taxonomie-Interfaces im Post-Bearbeitungsbildschirm zuständig ist. Übergibt man `false`, wird die native Metabox in der Seitenleiste komplett entfernt. Dies ist gängige Praxis, wenn das Plugin ein eigenes Interface zur Begriffsauswahl mittels JavaScript oder fortgeschrittenen Kontrollen in eigenen Metaboxes implementiert.

#### `rewrite` (Routing-Regeln)

Steuert wie bei den CPTs die Struktur der Permalinks für die Archivseiten der Taxonomie.

* `slug`: Definiert die Basis der URL (z. B. `meinedomain.com/genero/science-fiction/`).
* `hierarchical`: Wenn auf `true` gesetzt, spiegelt die URL die interne Struktur der Begriffe wider (z. B. `meinedomain.com/genero/roman/science-fiction/`).

### Die Gefahr von `register_taxonomy_for_object_type()`

Es gibt eine Core-Funktion namens `register_taxonomy_for_object_type()`. Ihre Verwendung is ein häufiger Fehler, wenn eigene Taxonomien für eigene CPTs registriert werden. Diese Funktion ist ausschließlich dafür gedacht, eine **bereits existierende** Taxonomie (wie die nativen Kategorien `category`) mit einem Inhaltstyp zu verknüpfen.

Für durch dein eigenes Plugin erstellte Taxonomien muss die Verknüpfung direkt durch Übergabe des CPT-Bezeichners im zweiten Parameter (dem Array `$object_type`) der Funktion `register_taxonomy()` deklariert werden, so wie es im Code der vorherigen Sektion gezeigt wurde (`[ self::POST_TYPE ]`).

### Speicherstruktur in der Datenbank

Das folgende Schema veranschaulicht, wie die nativen WordPress-Tabellen interagieren, wenn ein Begriff einer benutzerdefinierten Taxonomie registriert und zugewiesen wird:

```text
+-----------------------+      +---------------------------+
|       wp_terms        |      |    wp_term_taxonomy       |
+-----------------------+      +---------------------------+
| term_id: 12           | <--- | term_taxonomy_id: 14      |
| name: 'Science Fiction'|      | term_id: 12               |
| slug: 'science-fiction'|      | taxonomy: 'miplugin_genero'|
+-----------------------+      +---------------------------+
                                             |
                                             v
+-----------------------+      +---------------------------+
|       wp_posts        |      |   wp_term_relationships   |
+-----------------------+      +---------------------------+
| ID: 450               | <--- | object_id: 450            |
| post_title: 'Dune'    |      | term_taxonomy_id: 14      |
| post_type: 'miplugin_libro'  | term_order: 0             |
+-----------------------+      +---------------------------+

```

## 3.4 Beziehung zwischen CPTs und Taxonomien

Die wahre Stärke von Datenarchitekturen in WordPress zeigt sich, wenn Custom Post Types und Taxonomien zusammenarbeiten. Während der CPT das „Was“ definiert (das Inhaltsobjekt), definiert die Taxonomie das „Wie es gruppiert wird“. Diese n:m-Beziehung ermöglicht es, komplexe Abfragen zu erstellen und die Navigation der Website zu strukturieren.

### Kombinierte Abfragen mit `WP_Query` und `tax_query`

Um Inhalte aus einem CPT basierend auf Begriffen einer benutzerdefinierten Taxonomie abzurufen, bietet die Klasse `WP_Query` das Argument `tax_query`. Dieser Parameter erfordert ein mehrdimensionales Array, was bei Bedarf komplexe logische Verknüpfungen (AND, OR) zwischen mehreren Taxonomien ermöglicht.

Nachfolgend wird gezeigt, wie die letzten 10 Bücher abgerufen werden, die dem Genre „Science-Fiction“ angehören:

```php
$args = [
    'post_type'      => 'miplugin_libro',
    'posts_per_page' => 10,
    'post_status'    => 'publish',
    'tax_query'      => [
        [
            'taxonomy'         => 'miplugin_genero',
            'field'            => 'slug', // Kann 'term_id', 'name', 'slug' oder 'term_taxonomy_id' sein
            'terms'            => 'science-fiction',
            'include_children' => true,   // False, wenn nur der exakte Begriff ohne Kinder gewünscht ist
            'operator'         => 'IN',   // Operatoren: 'IN', 'NOT IN', 'AND', 'EXISTS', 'NOT EXISTS'
        ],
    ],
];

$libros_query = new WP_Query( $args );

if ( $libros_query->have_posts() ) {
    while ( $libros_query->have_posts() ) {
        $libros_query->the_post();
        // Rendering-Logik...
    }
    wp_reset_postdata();
}

```

### Abrufen von Begriffen aus einem CPT

Wenn du dich innerhalb des Loops befindest oder die ID eines bestimmten Beitrags hast, musst du häufig anzeigen, welchen Begriffen dieser zugeordnet ist. Für benutzerdefinierte Taxonomien sind Funktionen wie `the_category()` nutzlos. Du musst `get_the_terms()` verwenden.

```php
// Holt die dem aktuellen Beitrag zugeordneten Begriffe
$generos = get_the_terms( get_the_ID(), 'miplugin_genero' );

if ( ! is_wp_error( $generos ) && ! empty( $generos ) ) {
    $nombres_generos = wp_list_pluck( $generos, 'name' );
    echo 'Genres: ' . esc_html( implode( ', ', $nombres_generos ) );
}

```

### Erweiterte Integration im Administrationsbereich

Wenn du `'show_admin_column' => true` bei der Registrierung der Taxonomie definiert hast, zeigt WordPress die Begriffe in der CPT-Auflistungstabelle an. Bei Websites mit hohem Datenaufkommen müssen Administratoren jedoch in der Lage sein, die CPTs über ein Dropdown-Menü nach Taxonomie zu filtern.

WordPress erstellt diesen Dropdown-Filter für benutzerdefinierte Taxonomien nicht automatisch. Du musst ihn erstellen, indem du dich in die Action `restrict_manage_posts` einklinkst.

```php
class MiPlugin_Filtro_Taxonomia {

    const POST_TYPE = 'miplugin_libro';
    const TAXONOMY  = 'miplugin_genero';

    public function init() {
        add_action( 'restrict_manage_posts', [ $this, 'agregar_desplegable_filtro' ] );
    }

    public function agregar_desplegable_filtro( $post_type ) {
        // Nur in der Ansicht unseres CPTs ausführen
        if ( self::POST_TYPE !== $post_type ) {
            return;
        }

        $taxonomia = get_taxonomy( self::TAXONOMY );
        $term_slug = isset( $_GET[ self::TAXONOMY ] ) ? sanitize_text_field( wp_unslash( $_GET[ self::TAXONOMY ] ) ) : '';

        wp_dropdown_categories( [
            'show_option_all' => sprintf( __( 'Alle %s', 'miplugin' ), $taxonomia->label ),
            'taxonomy'        => self::TAXONOMY,
            'name'            => self::TAXONOMY,
            'orderby'         => 'name',
            'selected'        => $term_slug,
            'show_count'      => true,
            'hide_empty'      => true,
            'value_field'     => 'slug',
        ] );
    }
}

$filtro = new MiPlugin_Filtro_Taxonomia();
$filtro->init();

```

Der WordPress-Core fängt den von diesem Formular generierten GET-Parameter automatisch ab und modifiziert die Hauptabfrage (`WP_Query`) der Admin-Tabelle, wodurch die Ergebnisse ohne zusätzlichen Code unsererseits gefiltert werden.

## Zusammenfassung des Kapitels

In diesem Kapitel haben wir die Erstellung und Strukturierung von Datenmodellen über die WordPress-APIs behandelt. Wir haben gesehen, dass die Registrierung von Custom Post Types (`register_post_type`) und Taxonomien (`register_taxonomy`) sicher im Hook `init` erfolgen muss, unter besonderer Beachtung der Argumente, die Sichtbarkeit, die Unterstützung von Features wie Gutenberg (`show_in_rest`) und die URL-Umschreibungsregeln steuern.

Wir haben die Bedeutung der semantischen Internationalisierung (`_x()`) für den Aufbau professioneller Admin-Oberflächen analysiert. Schließlich haben wir untersucht, wie beide Entitäten verknüpft werden, indem wir komplexe bedingte Abfragen mit `WP_Query` ausgeführt und die Verwaltungserfahrung im Admin-Bereich durch benutzerdefinierte Filter verbessert haben. Diese strukturelle Basis ist unerlässlich, bevor wir zur Injektion granularer Daten auf Feldebene übergehen.
