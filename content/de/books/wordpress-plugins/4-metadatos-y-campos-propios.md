Die nativen Datenstrukturen von WordPress reichen oft nicht aus, um komplexe Anforderungen abzubilden. Dieses Kapitel befasst sich eingehend mit der Metadata API – der Engine, mit der du unbegrenzt spezifische Informationen mit Beiträgen, Benutzern und Taxonomie-Begriffen verknüpfen kannst, ohne die Datenbankstruktur zu verändern.

Du lernst, wie du benutzerdefinierte Metaboxen erstellst, um eine professionelle und maßgeschneiderte Administrationsoberfläche bereitzustellen. Wir werden den gesamten Lebenszyklus der Daten beherrschen: von der visuellen Darstellung bis hin zum Abfangen von Anfragen. Dabei wenden wir strenge Techniken zur Bereinigung (Sanitization), Validierung und sicheren Persistenz an, um wirklich robuste Plugins zu entwickeln.

## 4.1 Einführung in die Metadata API

Die Metadata API von WordPress ist un subsystem estandarizado (ein standardisiertes Subsystem), mit dem du zusätzliche Informationen (Metadaten) mit den Hauptobjekten des Ökosystems verknüpfen kannst. Wie wir im vorherigen Kapitel bei der Erstellung von Custom Post Types gesehen haben, ist die native Struktur der Tabelle `wp_posts` starr und für die Speicherung allgemeiner Daten (Titel, Inhalt, Datum, Autor) ausgelegt. Wenn wir spezifische Attribute unseres Geschäftsmodells speichern müssen (zum Beispiel den „Preis“ eines CPTs „Immobilie“ oder die „Rolle/Position“ eines Benutzers), greifen wir auf die Metadata API zurück.

Anstatt das Schema der Haupttabellen der Datenbank zu ändern (eine Praxis, von der in WordPress dringend abgeraten wird), verwendet die Metadata API ein Entity-Attribute-Value-Modell (EAV). Dies bietet uns absolute Flexibilität, um Datenstrukturen dynamisch zu skalieren.

### Speicherarchitektur

Die API verwaltet die Datenpersistenz mithilfe von vier spezifischen Tabellen in der Datenbank (auf die Klasse `$wpdb` werden wir in Kapitel 5 näher eingehen). Jeder Objekttyp hat seine eigene zugeordnete Metadaten-Tabelle und behält ein relationales „1:N“-Design (One-to-Many) bei:

```text
+----------------+       1:N       +-------------------+
|  HAUPTTABELLE  | <-------------+ | METADATEN-TABELLE |
+----------------+                 +-------------------+
| ID (PK)        |                 | meta_id (PK)      |
| ...            |                 | object_id (FK)    |
|                |                 | meta_key          |
|                |                 | meta_value        |
+----------------+                 +-------------------+

Im Core verfügbare Beziehungen:
wp_posts    -> wp_postmeta
wp_users    -> wp_usermeta
wp_terms    -> wp_termmeta
wp_comments -> wp_commentmeta

```

### CRUD-Operationen und Hauptfunktionen

Obwohl der WordPress-Core intern generische Funktionen wie `add_metadata()` oder `update_metadata()` verwendet, nutzen wir in der täglichen Plugin-Entwicklung spezifische Wrapper-Funktionen für jeden Objekttyp. Wir nehmen Beiträge (bzw. Posts, anwendbar auf jeden CPT) als Hauptreferenz, da sie den häufigsten Anwendungsfall darstellen.

#### 1. Erstellung (`add_post_meta`)

Fügt einem bestimmten Beitrag ein neues Schlüssel-Wert-Paar hinzu.

```php
add_post_meta( int $post_id, string $meta_key, mixed $meta_value, bool $unique = false );

```

Der vierte Parameter, `$unique`, ist entscheidend. Wenn er auf `true` gesetzt ist, schlägt die Funktion fehl, wenn dieser Schlüssel bereits für diesen bestimmten Beitrag existiert. Wenn er `false` ist (Standard), erlaubt WordPress das Speichern mehrerer Werte unter demselben Schlüssel.

#### 2. Auslesen (`get_post_meta`)

Ruft den Wert eines Metadatums ab. Das ist die Funktion, die du im Frontend deines Plugins am häufigsten verwenden wirst.

```php
get_post_meta( int $post_id, string $meta_key = '', bool $single = false );

```

Der Parameter `$single` bestimmt die Struktur des Rückgabewerts und ist eine häufige Fehlerquelle:

* `$single = false` (Standard): Gibt ein indiziertes **Array** mit allen für diesen Schlüssel gefundenen Werten zurück. Ideal, wenn du beim Speichern mehrere Werte zugelassen hast.
* `$single = true`: Gibt einen **String** (oder den deserialisierten Originaldatentyp) mit dem ersten übereinstimmenden Wert zurück.

#### 3. Aktualisierung (`update_post_meta`)

Aktualisiert ein bestehendes Metatum.

```php
update_post_meta( int $post_id, string $meta_key, mixed $meta_value, mixed $prev_value = '' );

```

**Performance-Hinweis:** `update_post_meta()` ist extrem vielseitig. Wenn der Schlüssel noch nicht existiert, ruft die Funktion intern `add_post_meta()` auf. Gewöhne dir daher an, standardmäßig `update_post_meta` zum Speichern von Daten zu verwenden (es sei denn, du musst unbedingt mehrere identische Werte unter demselben Schlüssel registrieren), um dir vorherige Existenzprüfungen zu sparen.

#### 4. Löschen (`delete_post_meta`)

Entfernt einen Metadaten-Eintrag aus der Datenbank.

```php
delete_post_meta( int $post_id, string $meta_key, mixed $meta_value = '' );

```

Wenn du `$meta_value` weglässt, werden alle Einträge mit diesem `$meta_key` für den Beitrag gelöscht. Wenn du ihn angibst, wird nur der Eintrag gelöscht, der genau mit diesem Wert übereinstimmt.

### Versteckte Metadaten und Serialisierung

Es gibt zwei automatische Verhaltensweisen in der Metadata API, die du beherrschen musst, um dein Plugin sauber und effizient zu halten:

* **Automatische Serialisierung:** Du musst PHP-Arrays oder -Objekte vor dem Speichern nicht in JSON konvertieren. Wenn du ein Array an `$meta_value` übergibst, jagt WordPress es vor dem Einfügen in die Datenbank automatisch durch die PHP-Funktion `serialize()` und verwendet beim Auslesen mit `get_post_meta()` transparent wieder `unserialize()`.
* **Private Schlüssel (Versteckte Metadaten):** Standardmäßig zeigt WordPress die Metadaten von Beiträgen in der nativen Metabox „Benutzerdefinierte Felder“ auf dem Bearbeitungsbildschirm an. Um zu verhindern, dass Administratoren versehentlich interne Daten deines Plugins ändern, solltest du deinen Schlüsseln ein Unterstrich-Präfix (`_`) voranstellen.

```php
// Öffentliches Metadatum: Sichtbar in der nativen UI für benutzerdefinierte Felder
update_post_meta( $post_id, 'precio_inmueble', 250000 );

// Privates Metadatum: In der UI versteckt, exklusiv zur Steuerung deines Plugins
update_post_meta( $post_id, '_estado_sincronizacion', 'completado' );

```

Im nächsten Abschnitt werden wir diese Funktionen direkt in die Administrationsoberfläche integrieren, indem wir benutzerdefinierte Metaboxen erstellen. Dabei lassen wir die native, generische Oberfläche hinter uns und bieten stattdessen eine kontrollierte und für unser Plugin spezifische Benutzererfahrung.

## 4.2 Erstellung von Metaboxen im Admin-Bereich

Während die Metadata API die Datenzugriffsschicht zum Lesen und Schreiben von Informationen bereitstellt, bilden die *Metaboxen* (Meta-Boxen) die Präsentationsschicht. Es handelt sich um modulare Panels oder Module, die auf den Bearbeitungsbildschirmen für Inhalte (Beiträge, Seiten oder Custom Post Types) erscheinen und es Administratoren oder Redakteuren ermöglichen, diese Metadaten über eine strukturierte grafische Oberfläche einzugeben.

Anstatt den Benutzer zu zwingen, die generische und fehleranfällige Box für native „Benutzerdefinierte Felder“ von WordPress zu verwenden, ermöglicht uns die Erstellung einer spezifischen Metabox das Design eines maßgeschneiderten Formulars. So kontrollieren wir die Benutzererfahrung und bereiten den Boden für eine strenge Datenvalidierung vor.

### Der Hook `add_meta_boxes`

Um unsere Oberfläche in den Bearbeitungsbildschirm einzubinden, stellt WordPress den Action-Hook `add_meta_boxes` bereit. Dieser Hook wird ausgelöst, wenn der Bearbeitungsbildschirm vorbereitet wird, kurz bevor die strukturellen Elemente gerendert werden.

```php
add_action( 'add_meta_boxes', 'mi_plugin_registrar_metaboxes' );

function mi_plugin_registrar_metaboxes() {
    // Hier rufen wir add_meta_box() auf
}

```

### Die Funktion `add_meta_box`

Innerhalb unseres Callbacks verwenden wir die Hauptfunktion dieser API, um unseren Container zu registrieren.

```php
add_meta_box(
    string $id,
    string $title,
    callable $callback,
    string|array|WP_Screen $screen = null,
    string $context = 'advanced',
    string $priority = 'default',
    array $callback_args = null
);

```

Analysieren wir die kritischen Parameter:

* **`$id`**: Eine eindeutige HTML-Kennung (Attribut `id`) für die Box.
* **`$title`**: Der sichtbare Titel, der im Header der Metabox erscheint.
* **`$callback`**: Die Funktion, die für die Ausgabe (per *echo*) des HTML-Inhalts der Metabox zuständig ist.
* **`$screen`**: Der Inhaltstyp, auf dem sie erscheinen soll. Dies kann ein String (z. B. `'post'`, `'page'`, `'mi_cpt'`) o ein Array mit mehreren Inhaltstypen sein.
* **`$context`**: Bestimmt die Position des Panels. Typische Werte sind `'normal'` (unter dem Editor), `'side'` (in der rechten Seitenleiste) und `'advanced'` (am Ende, ähnlich wie normal).
* **`$priority`**: Die hierarchische Reihenfolge innerhalb des Kontextes (`'high'`, `'core'`, `'default'`, `'low'`).

### Visuelle Aufteilung auf dem Bearbeitungsbildschirm

Um zu veranschaulichen, wie sich die Parameter `$context` und `$priority` auf das Rendering auswirken, siehst du hier die Struktur des Bearbeitungsbildschirms:

```text
+---------------------------------------------------------+
|                  BEITRAGSTITEL                          |
+---------------------------------------------------------+
|                                        |                |
|                                        |  KONTEXT:      |
|           EDITOR-BEREICH               |  'side'        |
|                                        |                |
|                                        | +------------+ |
|                                        | | Metabox 3  | |
+----------------------------------------+ +------------+ |
| KONTEXT: 'normal'                      | | Metabox 4  | |
| +------------------------------------+ | +------------+ |
| | Metabox 1 (Priority: high)         | |                |
| +------------------------------------+ |                |
+----------------------------------------+                |
| KONTEXT: 'advanced'                    |                |
| +------------------------------------+ |                |
| | Metabox 2 (Priority: default)      | |                |
| +------------------------------------+ |                |
+----------------------------------------+----------------+

```

### Rendern der Benutzeroberfläche (Der Callback)

Die in `add_meta_box` definierte `$callback`-Funktion erhält automatisch das aktuelle `WP_Post`-Objekt als Parameter übergeben. Das ist essenziell, da es uns ermöglicht, zuvor gespeicherte Metadaten (mithilfe von `get_post_meta()`) abzurufen, um die Formularfelder vorzubefüllen.

Im Folgenden implementieren wir eine Beispiel-Metabox für einen fiktiven Custom Post Type namens `inmueble` (Immobilie), um einen Preis zu erfassen:

```php
// 1. Registrierung der Metabox
add_action( 'add_meta_boxes', 'inmobiliaria_registrar_metabox_precio' );

function inmobiliaria_registrar_metabox_precio() {
    add_meta_box(
        'inmobiliaria_precio_box',           // Eindeutige ID
        'Finanzdaten der Immobilie',         // Sichtbarer Titel
        'inmobiliaria_render_metabox_precio',// Render-Callback
        'inmueble',                          // Screen (CPT)
        'side',                              // Kontext (Seitenleiste)
        'high'                               // Priorität
    );
}

// 2. Rendern des HTML
function inmobiliaria_render_metabox_precio( $post ) {
    // Vorhandenen Wert abrufen, falls vorhanden. Beachte das Präfix '_'
    $precio_actual = get_post_meta( $post->ID, '_inmueble_precio', true );
    
    // Nonce-Feld (Entscheidend für die Sicherheit, Details in Kap. 10)
    wp_nonce_field( 'guardar_precio_inmueble', 'inmueble_precio_nonce' );

    // HTML-Struktur rendern
    ?>
    <div class="inmobiliaria-metabox-wrapper">
        <label for="inmueble_precio_input">
            <strong>Verkaufspreis (USD):</strong>
        </label>
        <input 
            type="number" 
            id="inmueble_precio_input" 
            name="inmueble_precio" 
            value="<?php echo esc_attr( $precio_actual ); ?>" 
            class="widefat" 
            step="1000"
            style="margin-top: 8px;"
        />
        <p class="description">Gib den Wert ohne Kommas oder Symbole ein.</p>
    </div>
    <?php
}

```

Zu diesem Zeitpunkt haben wir unsere Schnittstelle erfolgreich in das WordPress-Admin-Panel eingebunden. Das `name`-Attribut unseres `<input>`-Felds ist bereit, die Informationen per HTTP-POST-Anfrage zu senden, wenn der Benutzer auf „Veröffentlichen“ oder „Aktualisieren“ klickt. Die Metabox allein ist jedoch rein visuell; sie speichert die Informationen nicht automatisch. Das Abfangen dieser Anfrage, die Überprüfung der Sicherheit und das Speichern der Daten ist der nächste Schritt im Lebenszyklus der Metadaten.

## 4.3 Speichern und Validieren von Feldern

Ein Formularfeld in einer Metabox anzuzeigen, ist nur die halbe Miete. Wenn ein Benutzer in WordPress auf den Button „Veröffentlichen“ oder „Aktualisieren“ klickt, werden alle Daten des Bearbeitungsbildschirms per HTTP-POST-Anfrage an den Server gesendet. WordPress speichert die manuell erstellten benutzerdefinierten Felder jedoch nicht automatisch, es sei denn, wir weisen das System explizit an, wie diese Informationen abgefangen, verarbeitet und gespeichert werden sollen.

Um dies zu erreichen, nutzen wir den Action-Hook `save_post`, der ausgelöst wird, sobald der WordPress-Core die Hauptdaten des Beitrags in der Datenbank eingefügt oder aktualisiert hat.

### Der sichere Speicher-Workflow

Bevor wir die Daten entgegennehmen und blind mit `update_post_meta()` in die Datenbank schreiben, müssen wir eine Reihe strenger Validierungen implementieren. Das Speichern von Metadaten ist eines der kritischsten Einfallstore für die Sicherheit eines Plugins.

Der Ausführungszyklus innerhalb unseres `save_post`-Hooks muss ausnahmslos dieser logischen Struktur folgen:

```text
[POST-Anfrage (Speichern/Aktualisieren)]
                 |
                 v
         (Hook: save_post)
                 |
  +--------------+--------------+
  | 1. Nonce-Überprüfung        | ---> [Ungültig / Fehlt] ---> Abbrechen
  +--------------+--------------+
                 | [Gültig]
  +--------------+--------------+
  | 2. Autosave ignorieren      | ---> [Ist Autosave] --------> Abbrechen
  +--------------+--------------+
                 | [Nein]
  +--------------+--------------+
  | 3. Berechtigungsprüfung     | ---> [Keine Berechtigung] --> Abbrechen
  +--------------+--------------+
                 | [Autorisiert]
  +--------------+--------------+
  | 4. Validierung / Bereinigung| (Bereinigung der $_POST-Daten)
  +--------------+--------------+
                 |
  +--------------+--------------+
  | 5. Persistenz (CRUD)        | (update_post_meta oder delete_post_meta)
  +--------------+--------------+

```

### 1. Der Hook `save_post`

Wir registrieren unsere Funktion, indem wir sie an den Hook anhängen. Es wird empfohlen, die spezifische Variante des Hooks für unseren Custom Post Type zu verwenden (`save_post_{post_type}`), um zu verhindern, dass unsere Logik unnötigerweise beim Speichern von Seiten oder regulären Beiträgen ausgeführt wird.

```php
// Am allgemeinen Speicher-Hook anhängen
add_action( 'save_post', 'inmobiliaria_guardar_metabox_precio' );

// Oder alternativ nur beim Speichern eines 'inmueble' ausführen (Empfohlen)
// add_action( 'save_post_inmueble', 'inmobiliaria_guardar_metabox_precio' );

```

### 2. Implementierung der Speicherroutine

Als Nächstes entwickeln wir die Funktion `inmobiliaria_guardar_metabox_precio()` unter Anwendung des im Diagramm beschriebenen Sicherheits-Workflows. Dabei greifen wir wieder auf das in Kapitel 4.2 erstellte Feld `inmueble_precio` zurück.

```php
function inmobiliaria_guardar_metabox_precio( $post_id ) {

    // 1. Nonce-Überprüfung
    // Überprüfen, ob unser Nonce-Feld gesendet wurde und ob es gültig ist.
    if ( ! isset( $_POST['inmueble_precio_nonce'] ) || 
         ! wp_verify_nonce( $_POST['inmueble_precio_nonce'], 'guardar_precio_inmueble' ) ) {
        return $post_id;
    }

    // 2. Autosave ignorieren
    // WordPress speichert Revisionen automatisch per AJAX. Wir wollen in diesen
    // unvollständigen Zyklen keine Metadaten validieren oder speichern.
    if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
        return $post_id;
    }

    // 3. Berechtigungsprüfung (Capabilities)
    // Hat dieser Benutzer die erforderliche Rolle, um diesen Inhalt zu bearbeiten?
    if ( isset( $_POST['post_type'] ) && 'page' === $_POST['post_type'] ) {
        if ( ! current_user_can( 'edit_page', $post_id ) ) {
            return $post_id;
        }
    } else {
        if ( ! current_user_can( 'edit_post', $post_id ) ) {
            return $post_id;
        }
    }

    /* --- AB HIER IST DIE AUSFÜHRUNG SICHER --- */

    // 4. Validierung und Bereinigung (Sanitization)
    // Vertraue $_POST niemals direkt. Kapitel 10 befasst sich eingehend mit Sicherheit,
    // aber hier wenden wir eine grundlegende Bereinigung basierend auf dem erwarteten Datentyp an.
    
    // Überprüfen, ob der Schlüssel im POST-Array existiert
    if ( isset( $_POST['inmueble_precio'] ) ) {
        
        // Bereinigen: Da wir eine Zahl (Preis) erwarten, erzwingen wir float oder int.
        // Wir könnten auch sanitize_text_field() verwenden, wenn es sich um Text handeln würde.
        $precio_sanitizado = floatval( $_POST['inmueble_precio'] );

        // Business-Validierung (Z. B. darf der Preis nicht negativ sein)
        if ( $precio_sanitizado < 0 ) {
            $precio_sanitizado = 0;
        }

        // 5. Persistenz
        // Metadaten aktualisieren. Wenn das Feld geleert wurde, ist es Best Practice, es zu löschen.
        if ( empty( $precio_sanitizado ) && $precio_sanitizado !== 0.0 ) {
            delete_post_meta( $post_id, '_inmueble_precio' );
        } else {
            update_post_meta( $post_id, '_inmueble_precio', $precio_sanitizado );
        }
    }
}

```

### Überlegungen zu Validierung vs. Bereinigung (Sanitization)

Obwohl sie oft synonym verwendet werden, erfüllen sie in der Metadata API unterschiedliche Rollen:

* **Bereinigung / Sanitization (Säubern):** Verändert die Eingabedaten, um sie sicher zu machen. Im vorherigen Beispiel entfernt `floatval()` jegliche Code-Injektionen oder unerwünschten Text und hinterlässt nur eine Dezimalzahl. Andere nützliche Core-Funktionen sind `sanitize_text_field()`, `sanitize_email()` oder `wp_kses_post()`.
* **Validierung (Prüfen):** Evaluiert, ob die Daten deine Business-Regeln erfüllen, bevor sie gespeichert werden. In unserem Code ist die Prüfung, dass der Preis nicht kleiner als Null sein darf, eine Validierung. Wenn ein Wert die Validierung nicht besteht, kannst du dich dafür entscheiden, einen Standardwert zu speichern oder die Aktualisierung abzulehnen und Transients zu verwenden, um eine Fehlermeldung im Administrationsbereich anzuzeigen.

### Umgang mit Arrays in Metadaten

Wenn deine Metabox Mehrfachauswahlfelder verwendet (wie ein `<select multiple>` oder mehrere `<input type="checkbox">`), kommen die Daten in `$_POST` als Array an. Du musst dieses Array durchlaufen, um jedes Element einzeln zu bereinigung, bevor du es speicherst. `update_post_meta()` kann dieses bereinigte Array direkt als `$meta_value` empfangen (denke daran, dass WordPress es automatisch in der Datenbank serialisiert).

```php
// Schnelles Beispiel für die Bereinigung eines Arrays
if ( isset( $_POST['inmueble_caracteristicas'] ) && is_array( $_POST['inmueble_caracteristicas'] ) ) {
    $caracteristicas_limpias = array_map( 'sanitize_text_field', $_POST['inmueble_caracteristicas'] );
    update_post_meta( $post_id, '_inmueble_caracteristicas', $caracteristicas_limpias );
}

```

## 4.4 Metadaten von Benutzern und Begriffen (Terms)

In diesem Kapitel haben wir Beiträge und Custom Post Types als Hauptbeispiel zur Erklärung der Metadata API verwendet. Die wahre Stärke dieses Subsystems liegt jedoch in seiner Universalität. Dieselbe Architektur und dieselben Regeln für Persistenz, Serialisierung und Caching gelten für zwei weitere grundlegende WordPress-Objekte: Benutzer und Begriffe bzw. Terms (Kategorien, Schlagwörter und benutzerdefinierte Taxonomien).

Wenn du verstehst, wie du mit den Metadaten dieser Objekte interagierst, kannst du komplexe Benutzerprofile und informationsreiche Klassifizierungshierarchien aufbauen.

### Benutzermetadaten (User Meta)

Die Tabelle `wp_usermeta` speichert zusätzliche Informationen über registrierte Benutzer. Der WordPress-Core selbst nutzt sie intensiv, um Dashboard-Einstellungen, Fähigkeiten (Rollen) und Farben der Benutzeroberfläche zu speichern.

Die Wrapper-Funktionen folgen genau der gleichen Nomenklatur wie bei Beiträgen:

* `add_user_meta( $user_id, $meta_key, $meta_value, $unique )`
* `get_user_meta( $user_id, $meta_key, $single )`
* `update_user_meta( $user_id, $meta_key, $meta_value, $prev_value )`
* `delete_user_meta( $user_id, $meta_key, $meta_value )`

#### Benutzeroberfläche und Speichern in Benutzerprofilen

Um benutzerdefinierte Felder zum Profil-Bearbeitungsbildschirm (`profile.php` und `user-edit.php`) hinzuzufügen, nutzen wir nicht die Metabox-API. Stattdessen hängen wir uns an spezifische Action-Hooks, um tabellarisches HTML einzubinden und das Speichern abzufangen.

```php
// 1. Felder im Profil anzeigen (für den Benutzer selbst und für Administratoren)
add_action( 'show_user_profile', 'mi_plugin_campos_perfil' );
add_action( 'edit_user_profile', 'mi_plugin_campos_perfil' );

function mi_plugin_campos_perfil( $user ) {
    $cargo = get_user_meta( $user->ID, '_cargo_profesional', true );
    ?>
    <h3>Berufliche Informationen</h3>
    <table class="form-table">
        <tr>
            <th><label for="cargo_profesional">Position / Rolle</label></th>
            <td>
                <input type="text" name="cargo_profesional" id="cargo_profesional" value="<?php echo esc_attr( $cargo ); ?>" class="regular-text" />
                <span class="description">Z. B. Marketing-Direktor.</span>
            </td>
        </tr>
    </table>
    <?php
}

// 2. Profilfelder speichern
add_action( 'personal_options_update', 'mi_plugin_guardar_campos_perfil' );
add_action( 'edit_user_profile_update', 'mi_plugin_guardar_campos_perfil' );

function mi_plugin_guardar_campos_perfil( $user_id ) {
    // Berechtigungsprüfung
    if ( ! current_user_can( 'edit_user', $user_id ) ) {
        return false;
    }

    // Bereinigung und Speichern
    if ( isset( $_POST['cargo_profesional'] ) ) {
        $cargo_limpio = sanitize_text_field( $_POST['cargo_profesional'] );
        update_user_meta( $user_id, '_cargo_profesional', $cargo_limpio );
    }
}

```

### Metadaten von Begriffen (Term Meta)

Eingeführt mit WordPress 4.4, die Tabelle `wp_termmeta` löste eines der größten historischen Probleme des Ökosystems: das native Unvermögen, Kategorien oder Taxonomien Attribute hinzuzufügen. Zuvor mussten Entwickler auf suboptimale Lösungen ausweichen, wie das Speichern riesiger Arrays in der Tabelle `wp_options`.

Heute spiegelt die API perfekt die Struktur wider, die wir bereits kennen:

* `add_term_meta( $term_id, $meta_key, $meta_value, $unique )`
* `get_term_meta( $term_id, $meta_key, $single )`
* `update_term_meta( $term_id, $meta_key, $meta_value, $prev_value )`
* `delete_term_meta( $term_id, $meta_key, $meta_value )`

#### Visuelle Integration in Taxonomien

Im Gegensatz zu Beiträgen (die Metaboxen verwenden) und Benutzern (die eine einzige Profilseite nutzen), haben Taxonomien zwei verschiedene Bildschirme, auf denen wir unsere Felder einbinden müssen: den Bildschirm zur Schnellerstellung (in der Liste der Begriffe) und den individuellen Bearbeitungsbildschirm.

Die Hooks zum Einfügen sind dynamisch und basieren auf dem Namen der Taxonomie (z. B. `category`, `post_tag` oder deiner benutzerdefinierten Taxonomie wie `ubicacion`).

```php
// Wir nehmen eine benutzerdefinierte Taxonomie namens 'ubicacion' (Ort/Standort) an

// 1. Feld im Erstellungsformular anzeigen (Neuen Standort hinzufügen)
add_action( 'ubicacion_add_form_fields', 'inmobiliaria_campo_color_ubicacion' );

function inmobiliaria_campo_color_ubicacion() {
    // Hier verwendet das HTML keine Tabellenstruktur
    ?>
    <div class="form-field">
        <label for="color_marcador">Farbe der Kartenmarkierung</label>
        <input type="text" name="color_marcador" id="color_marcador" value="" />
        <p>HEX-Code (z. B. #FF0000)</p>
    </div>
    <?php
}

// 2. Feld im Bearbeitungsformular anzeigen (Bestehenden Standort bearbeiten)
add_action( 'ubicacion_edit_form_fields', 'inmobiliaria_editar_color_ubicacion' );

function inmobiliaria_editar_color_ubicacion( $term ) {
    $color_actual = get_term_meta( $term->term_id, '_color_marcador', true );
    // Hier verwendet das HTML EINE Tabellenstruktur
    ?>
    <tr class="form-field">
        <th scope="row"><label for="color_marcador">Farbe der Markierung</label></th>
        <td>
            <input type="text" name="color_marcador" id="color_marcador" value="<?php echo esc_attr( $color_actual ); ?>" />
        </td>
    </tr>
    <?php
}

// 3. Metadatum speichern (Hook für Erstellung und Bearbeitung)
add_action( 'created_ubicacion', 'inmobiliaria_guardar_color_ubicacion' );
add_action( 'edited_ubicacion', 'inmobiliaria_guardar_color_ubicacion' );

function inmobiliaria_guardar_color_ubicacion( $term_id ) {
    if ( isset( $_POST['color_marcador'] ) ) {
        // Wir verwenden eine spezifische Bereinigungsfunktion für HEX-Farben
        $color_limpio = sanitize_hex_color( $_POST['color_marcador'] );
        update_term_meta( $term_id, '_color_marcador', $color_limpio );
    }
}

```

### Konzept-Zusammenfassung

Um zu veranschaulichen, wie der Core diese Metadatenabstraktion intern handhabt, siehst du hier, wie alle Wrapper-Funktionen letztlich dieselbe Low-Level-Logik des Cores aufrufen:

```text
[ Dein Plugin ]
     |
     +--> update_post_meta()  --+
     |                          |
     +--> update_user_meta()  --+--> update_metadata( $type, $id, $key, $value )
     |                          |             |
     +--> update_term_meta()  --+             v
                                     [ Objekt-Cache-Schicht ]
                                              |
                                              v
                                        [ Datenbank ]

```

Diese Architektur garantiert, dass die Leistung und die Sicherheit konsistent bleiben, unabhängig davon, welchem Objekttyp du benutzerdefinierte Attribute hinzufügst.

## Kapitelzusammenfassung

In diesem Kapitel haben wir uns eingehend mit der Metadata API befasst – dem System, das WordPress echte Datenflexibilität verleiht, ohne die Schemata der Hauptdatenbank zu verändern:

1. **Einführung in die Metadata API:** Wir haben das Entity-Attribute-Value-Modell (EAV) verstanden und gelernt, wie die CRUD-Funktionen (`add_`, `get_`, `update_`, `delete_`) automatisch mit die PHP-Serialisierung interagieren und Daten mithilfe von privaten Schlüsseln (mit Unterstrich) vor generischen Oberflächen verbergen.
2. **Erstellung von Metaboxen:** Wir haben uns von den nativen „Benutzerdefinierten Feldern“ verabschiedet, um maßgeschneiderte Schnittstellen mit `add_meta_box()` zu erstellen, indem wir spezifisches HTML in strategische Bereiche des Bearbeitungsbildschirms für jeden Inhaltstyp (Post Type) eingefügt haben.
3. **Speichern und Validieren:** Wir haben den kritischen Sicherheits-Workflow erstellt, der an den `save_post`-Hook gebunden ist. Dabei haben wir logische Prüfungen (Nonce-Überprüfung, Autosaves und Berechtigungen) implementiert, bevor wir mit der unerlässlichen Bereinigung und Speicherung der superglobalen Variable `$_POST` fortgefahren sind.
4. **Benutzer und Begriffe (Terms):** Wir haben unser Wissen über Beiträge hinaus erweitert und dieselbe Metadaten-Philosophie angewendet, um Benutzerprofile (`wp_usermeta`) und Taxonomiehierarchien (`wp_termmeta`) anzureichern, wobei wir die entsprechenden Profil- und Taxonomie-Action-Hooks zum Rendern und Speichern von Informationen verwendet haben.
