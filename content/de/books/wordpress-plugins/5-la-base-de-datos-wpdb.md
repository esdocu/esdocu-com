Obwohl WordPress robuste APIs wie CPTs und Metadaten bietet, gibt es Szenarien, in denen das Datenvolumen oder die relationale Komplexität eine direkte Interaktion mit der Datenbank erfordern. In diesem Kapitel werden wir entdecken, wie wir über die nativen Strukturen hinausgehen können. Du lernst, wie du die globale Klasse `$wpdb` verwendest, um Daten zu manipulieren, deine Abfragen mithilfe von Prepared Statements gegen SQL-Injektionen abzusichern und `dbDelta()` zu beherrschen, um benutzerdefinierte Tabellenschemata zu erstellen und zu aktualisieren. Dabei richten wir eine sichere Versionskontrolle ein, die auf maximale Performance deines Plugins optimiert ist.

## 5.1 Die globale Klasse $wpdb

Im Herzen der Interaktion zwischen WordPress und deiner Datenbank befindet sich die Klasse `wpdb`. Diese Klasse (in der Datei `wp-includes/wp-db.php`) fungiert als Abstraktionsebene über der Datenbank (in der Regel MySQL oder MariaDB). Ihr Hauptzweck besteht darin, eine standardisierte Reihe von Methoden bereitzustellen, um Daten abzufragen, einzufügen, zu aktualisieren und zu löschen, ohne direkt auf native PHP-Funktionen wie `mysqli_query()` oder `PDO` zurückgreifen zu müssen.

Um an einer beliebigen Stelle in deinem Plugin auf diese einzigartige Instanz zuzugreifen, musst du die globale Variable aufrufen:

```php
global $wpdb;

```

Auf der Architekturebene befindet sich die Klasse `$wpdb` zwischen der Logik deines Plugins und der Datenbank-Engine, was den Zugriff auf native und benutzerdefinierte Tabellen erleichtert:

```text
+---------------------+       +-----------------------+       +------------------------+
|   Dein Plugin (PHP) | ----> |  Globales $wpdb-Objekt| ----> |  Datenbank (MySQL)     |
|   (Geschäftslogik)  | <---- |  (Abstraktionsebene)  | <---- |  (Tabellen u. Einträge)|
+---------------------+       +-----------------------+       +------------------------+

```

### Schlüsseleigenschaften des $wpdb-Objekts

Beim Aufruf von `$wpdb` erhältst du Zugriff auf wichtige Eigenschaften, die Informationen über die Datenbank und den Status der zuletzt ausgeführten Abfrage offenlegen:

* **`$wpdb->prefix`**: Das Präfix der Datenbanktabellen (standardmäßig `wp_`). Es ist zwingend erforderlich, diese Eigenschaft zu verwenden, anstatt das Präfix beim Abfragen nativer oder benutzerdefinierter Tabellen fest im Code zu hinterlegen, um die Kompatibilität in jeder Installation zu gewährleisten.
* **`$wpdb->insert_id`**: Enthält die durch die zuletzt ausgeführte `INSERT`-Abfrage generierte ID.
* **`$wpdb->num_rows`**: Gibt die Anzahl der von der letzten Abfrage betroffenen oder zurückgegebenen Zeilen zurück.
* **`$wpdb->last_error`**: Speichert die Fehlermeldung der letzten fehlgeschlagenen Abfrage, was für das Debugging unerlässlich ist.
* **Native Tabellen**: WordPress ordnet alle seine nativen Tabellen als Eigenschaften zu (z. B. `$wpdb->posts`, `$wpdb->users`, `$wpdb->options`). Die Verwendung von `$wpdb->posts` ist gegenüber `{$wpdb->prefix}posts` zu bevorzugen.

### Methoden zum Lesen von Daten

Die Klasse bietet spezifische Methoden an, je nach der Struktur der erwarteten Rückgabedaten. Diese Granularität optimiert den Speicherbedarf und vereinfacht den Umgang mit den Ergebnissen in PHP.

#### 1. get_var()

Konzipiert für das Abrufen eines einzelnen Werts (einer bestimmten Zelle) aus der Datenbank. Wenn die Abfrage mehrere Zeilen oder Spalten zurückgibt, wird nur der Wert aus der ersten Spalte der ersten Zeile zurückgegeben.

```php
global $wpdb;
$user_count = $wpdb->get_var( "SELECT COUNT(*) FROM {$wpdb->users}" );

```

#### 2. get_row()

Ruft eine komplette einzelne Zeile ab. Sie eignet sich hervorragend, wenn du nach einem bestimmten Datensatz basierend auf einer ID oder einer eindeutigen Bedingung suchst. Sie erlaubt die Angabe des Ausgabeformats: Objekt (Standard), assoziatives Array oder numerisches Array.

```php
global $wpdb;
// Gibt ein Objekt zurück
$post_destacado = $wpdb->get_row( "SELECT * FROM {$wpdb->posts} WHERE ID = 10" );
echo $post_destacado->post_title;

// Gibt ein assoziatives Array zurück (ARRAY_A)
$post_array = $wpdb->get_row( "SELECT * FROM {$wpdb->posts} WHERE ID = 10", ARRAY_A );
echo $post_array['post_title'];

```

#### 3. get_col()

Gibt eine einzelne Spalte mit Ergebnissen als eindimensionales Array zurück. Äußerst nützlich, um Listen mit IDs oder spezifischen Werten abzurufen.

```php
global $wpdb;
// Ruft alle IDs von veröffentlichten Beiträgen ab
$ids_publicados = $wpdb->get_col( "SELECT ID FROM {$wpdb->posts} WHERE post_status = 'publish'" );

```

#### 4. get_results()

Dies ist die vielseitigste Methode, um mehrere Zeilen an Ergebnissen abzurufen. Ähnlich wie `get_row()` erlaubt sie es, das Ausgabeformat zu definieren, wobei un Array von Objekten der Standardwert ist.

```php
global $wpdb;
$ultimos_posts = $wpdb->get_results( "SELECT ID, post_title FROM {$wpdb->posts} ORDER BY post_date DESC LIMIT 5" );

foreach ( $ultimos_posts as $post ) {
    echo "<li>{$post->post_title}</li>";
}

```

### Komfortmethoden zum Schreiben und Ändern

Für Einfüge-, Aktualisierungs- und Löschvorgänge stellt WordPress Hilfsmethoden bereit, die das Schreiben des SQL-Statements abstrahieren und — was noch wichtiger ist — die Bereinigung und Aufbereitung der Datentypen automatisch übernehmen.

| Methode | Beschreibung und empfohlene Verwendung |
| --- | --- |
| **`insert()`** | Fügt eine neue Zeile in eine Tabelle ein. Empfängt die Tabelle, ein assoziatives Array mit den Daten (`Spalte => Wert`) und optional die Datenformate (`%s` für String, `%d` für Integer, `%f` für Float). |
| **`update()`** | Aktualisiert bestehende Zeilen. Empfängt die Tabelle, die zu aktualisierenden Daten, ein Array mit den `WHERE`-Bedingungen und optional die Formate für die Daten und Bedingungen. |
| **`delete()`** | Löscht Zeilen, die mit bestimmten Bedingungen übereinstimmen. Empfängt die Tabelle, die Bedingungen in einem assoziativen Array und die Formate der Bedingungen. |

**Beispiel zur Verwendung von Komfortmethoden:**

```php
global $wpdb;
$tabla = $wpdb->prefix . 'mi_tabla_custom';

// Einfügen
$wpdb->insert(
    $tabla,
    array( 'columna_texto' => 'Valor', 'columna_numero' => 42 ),
    array( '%s', '%d' ) // Formate: string, integer
);

// Aktualisieren
$wpdb->update(
    $tabla,
    array( 'columna_texto' => 'Nuevo Valor' ), // Daten
    array( 'columna_numero' => 42 ),           // WHERE-Bedingung
    array( '%s' ),                             // Datenformat
    array( '%d' )                              // Bedingungsformat
);

// Löschen
$wpdb->delete(
    $tabla,
    array( 'columna_numero' => 42 ),
    array( '%d' )
);

```

Diese Komfortmethoden sind der empfohlene Weg, um die Datenbank zu verändern, da sie SQL-Injektionen in den meisten einfachen Fällen verhindern. Für komplexere Abfragen (wie komplexe `JOINs` oder Lesemethoden wie `get_results()`, die dynamische Variablen erfordern) ist die Verwendung von Prepared Statements jedoch zwingend erforderlich. Dieses Thema wird im nächsten Abschnitt eingehend behandelt.

## 5.2 Sichere SQL-Abfragen mit prepare

Wenn du die im vorherigen Abschnitt beschriebenen Komfortmethoden (`insert`, `update`, `delete`) verwendest, kümmert sich WordPress automatisch um die Bereinigung und das Escaping der Daten. Wenn du jedoch komplexe Abfragen über direkte Methoden wie `get_results()`, `get_var()` oder die generische Methode `query()` ausführen musst, liegt die Verantwortung für die Sicherheit allein bei dir.

Die goldene Regel bei der WordPress-Entwicklung lautet: **Vertraue niemals Benutzereingaben und übergib Variablen niemals direkt an einen SQL-String**. Andernfalls öffnest du Tür und Tor für SQL-Injektionen (SQLi) — die kritischste Sicherheitslücke in Webanwendungen.

Um deine Abfragen abzusichern, bietet WordPress die Methode `$wpdb->prepare()`.

### Die Funktionsweise von prepare()

Im Gegensatz zu nativen Prepared Statements von Erweiterungen wie PDO (bei denen die Abfrage und die Daten separat an den MySQL-Server gesendet werden) arbeitet `$wpdb->prepare()` auf PHP-Ebene. Sie funktioniert ähnlich wie die PHP-Funktion `sprintf()`, indem sie einen String mit Platzhaltern (*placeholders*) entgegennimmt und diese durch Variablen ersetzt, fügt jedoch eine wesentliche Ebene hinzu: **Sie bereinigt, escapet und setzt die Werte automatisch in Anführungszeichen**.

```text
[SQL-Abfrage mit Platzhaltern] + [Dynamische Daten (unsicher)]
               |                               |
               +----------------+--------------+
                                |
                                v
                        $wpdb->prepare() 
                  (Bereinigt, escapet u. Anführungszeichen)
                                |
                                v
                  [100 % sicherer und fertiger SQL-String]
                                |
                                v
                $wpdb->get_results() / $wpdb->query()

```

### Unterstützte Platzhalter

`$wpdb->prepare()` unterstützt eine sterile Auswahl an Platzhaltern. Es ist wichtig, den passenden Platzhalter für den in der Datenbank erwarteten Datentyp zu verwenden:

* **`%s` (String):** Für Textzeichenketten, Datumsangaben, Uhrzeiten und alle Daten, die nicht strikt numerisch sind. **Wichtiger Hinweis:** `$wpdb->prepare()` fügt die einfachen Anführungszeichen automatisch hinzu. Du solltest in deiner Abfrage niemals `'%s'` schreiben.
* **`%d` (Decimal/Integer):** Für ganze Zahlen. Wenn du einen String oder eine Dezimalzahl übergibst, wird diese in eine Ganzzahl konvertiert.
* **`%f` (Float):** Für Dezimalzahlen.
* **`%i` (Bezeichner):** Eingeführt in WordPress 6.2. Dient dem dynamischen Escapen von Tabellen- oder Spaltennamen. Darf niemals für Datenwerte verwendet werden.

### Implementierungsbeispiele

#### 1. Das Antipattern (unsicher)

Interpoliere Variablen niemals direkt in den String, selbst wenn du glaubst, dass sie zuvor bereinigt wurden.

```php
global $wpdb;
// ❌ GEFAHR: Anfällig für SQL-Injektionen
$sql = "SELECT * FROM {$wpdb->users} WHERE user_login = '$username'";
$user = $wpdb->get_row( $sql );

```

#### 2. Der korrekte Weg

Nutze `$wpdb->prepare()`. Du kannst die Argumente sequenziell oder als Array übergeben.

```php
global $wpdb;
// ✅ Sicher: Argumente sequenziell übergeben
$sql = $wpdb->prepare( 
    "SELECT * FROM {$wpdb->users} WHERE user_login = %s AND user_status = %d", 
    $username, 
    0 
);
$user = $wpdb->get_row( $sql );

// ✅ Sicher: Ein Array von Argumenten übergeben (nützlich für dynamische Daten)
$args = array( $username, 0 );
$sql = $wpdb->prepare( 
    "SELECT * FROM {$wpdb->users} WHERE user_login = %s AND user_status = %d", 
    $args 
);
$user = $wpdb->get_row( $sql );

```

### Die Herausforderung bei LIKE-Klauseln

Ein sehr häufiger Fehler tritt bei der Verwendung von `LIKE`-Anweisungen für Suchen auf, da das Wildcard-Zeichen `%` mit la Syntax der Platzhalter von `prepare()` kollidiert.

Um dies zu lösen, stellt WordPress die Hilfsmethode `$wpdb->esc_like()` zur Verfügung. Diese Methode escapet gezielt Zeichen mit besonderer Bedeutung in SQL (`%` und `_`) innerhalb des Suchbegriffs, bevor du ihn an `prepare()` übergibst.

```php
global $wpdb;
$busqueda_usuario = 'admin';

// 1. Wir escapen die nativen SQL-Wildcards aus der Benutzereingabe
$termino_seguro = $wpdb->esc_like( $busqueda_usuario );

// 2. Wir fügen unsere Wildcards für die Suche hinzu
$termino_like = '%' . $termino_seguro . '%';

// 3. Wir bereiten die Abfrage vor
$sql = $wpdb->prepare(
    "SELECT post_title FROM {$wpdb->posts} WHERE post_title LIKE %s",
    $termino_like
);

$resultados = $wpdb->get_results( $sql );

```

### Verwendung von %i für dynamische Bezeichner

Vor WordPress 6.2 konntest du `prepare()` nicht für Tabellen- oder Spaltennamen nutzen, wenn diese von einer Variable abhingen. Du musstest auf die Funktion `sanitize_key()` und strikte Verkettung ausweichen. Mit dem Platzhalter `%i` ist dies nun deutlich eleganter gelöst:

```php
global $wpdb;
$columna_orden = 'post_date'; // Könnte aus einer GET-Anfrage stammen
$orden = 'DESC'; // ASC oder DESC

// Wir stellen sicher, dass die Sortierung gültig ist (prepare unterstützt kein ASC/DESC)
$orden = ( strtoupper( $orden ) === 'ASC' ) ? 'ASC' : 'DESC';

// Wir bereiten die Abfrage mit %i für den Spaltennamen vor
$sql = $wpdb->prepare(
    "SELECT ID, post_title FROM {$wpdb->posts} ORDER BY %i {$orden} LIMIT %d",
    $columna_orden,
    10
);

$resultados = $wpdb->get_results( $sql );

```

Durch die Beherrschung von `$wpdb->prepare()` stellst du sicher, dass jede komplexe Lese- oder Schreibinteraktion deines Plugins von Anfang an geschützt ist, und erfüllst damit die Sicherheitsstandards, die für das offizielle WordPress-Verzeichnis gefordert werden.

## 5.3 Erstellung von Tabellen mit dbDelta

Wenn Custom Post Types, Taxonomien oder die native Metadata-API von WordPress nicht ausreichen, um die Performance- oder Strukturanforderungen deines Plugins zu erfüllen, wird das Erstellen benutzerdefinierter Datenbanktabellen erforderlich. Um diese Aufgabe sicher und standardisiert durchzuführen, stellt WordPress die Funktion `dbDelta()` bereit.

Die in `wp-admin/includes/upgrade.php` angesiedelte Funktion `dbDelta()` prüft die aktuelle Datenbankstruktur, vergleicht sie mit der in deinem Code deklarierten Struktur und führt selektiv die erforderlichen Änderungen aus (z. B. das Hinzufügen neuer Spalten oder das Ändern von Datentypen), ohne vorhandene Daten zu beeinträchtigen oder zu löschen.

Der Arbeitsablauf der Funktion lässt sich wie folgt darstellen:

```text
       [Gewünschte SQL-Struktur]
                   |
                   v
          +-----------------+
          |    dbDelta()    | <--- [Liest reale DB-Struktur aus]
          +-----------------+
                   |
         Fehlt die Tabelle?
         /               \
      (Ja)               (Nein)
      /                     \
[CREATE TABLE]        [Vergleicht Spalten]
                             |
                      Gibt es Unterschiede?
                      /               \
                   (Ja)               (Nein)
                   /                     \
        [ALTER TABLE]               [Tut nichts]

```

### Die strengen Syntaxregeln von dbDelta()

Die Funktion `dbDelta()` reagiert äußerst empfindlich auf die Syntax des übergebenen SQL-Schemas. Wenn die Formatierungsregeln nicht strikt eingehalten werden, schlägt die Funktion stillschweigend fehl, erstellt die Tabelle nicht oder baut die Struktur bei jedem Aufruf neu auf, was die Performance erheblich beeinträchtigt.

Damit `dbDelta()` dein `CREATE TABLE`-Statement korrekt verarbeitet, musst du folgende Anforderungen erfüllen:

1. **Ein Element pro Zeile:** Jede Spaltendefinition und jede Indexdeklaration muss auf einer eigenen Zeile innerhalb des SQL-Blocks stehen.
2. **Zwei Leerzeichen bei PRIMARY KEY:** Zwischen den Schlüsselwörtern `PRIMARY KEY` und der Definition des Felds in Klammern müssen genau zwei Leerzeichen stehen: `PRIMARY KEY  (id)`. Ein einzelnes Leerzeichen führt zum Fehlschlagen des internen Parsers.
3. **Zwei Leerzeichen bei herkömmlichen Indizes:** Verwende bei der Deklaration eines gewöhnlichen Index das Schlüsselwort `KEY` statt `INDEX`, gefolgt von zwei Leerzeichen, dem Indexnamen, zwei weiteren Leerzeichen und der betroffenen Spalte: `KEY mi_indice  (columna)`.
4. **Kleingeschriebene Datentypen:** SQL-Datentypen (wie `int`, `bigint`, `varchar`, `text`, `datetime`) müssen strikt in Kleinbuchstaben geschrieben werden.
5. **Keine Backticks (Azent grave):** Verwende keine Backticks (```) zur Umschließung von Tabellen- oder Spaltennamen, wie es bei Exporten aus phpMyAdmin üblich ist.
6. **Explizite Längenangaben:** Gib siempre la longitud de los campos de texto ajustables, por ejemplo, `varchar(255)`.

### Praktische Implementierung bei der Plugin-Aktivierung

Der ideale Zeitpunkt zum Erstellen oder Aktualisieren des Datenbankschemas eines Plugins ist während seiner Aktivierungsroutine, unter Verwendung des Hooks `register_activation_hook()`.

Es folgt eine professionelle Implementierung, die die nativen Zeichensatz-Einstellungen des Systems mittels `$wpdb->get_charset_collate()` einbezieht, um die sprachliche Kompatibilität der gespeicherten Daten zu gewährleisten:

```php
<?php
/**
 * Führt die Erstellung oder Aktualisierung der benutzerdefinierten Tabelle aus.
 */
function un_plugin_crear_tabla_personalizada() {
    global $wpdb;

    // Definiert den Tabellennamen mit dem dynamischen Präfix
    $nombre_tabla = $wpdb->prefix . 'registro_envios';

    // Ruft die korrekte Zeichensatz-Kollation der Installation ab
    $charset_collate = $wpdb->get_charset_collate();

    // Aufbau des Schemas gemäß den strengen Regeln von dbDelta
    $sql = "CREATE TABLE $nombre_tabla (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        id_usuario bigint(20) NOT NULL,
        codigo_seguimiento varchar(100) NOT NULL,
        estado_envio varchar(50) DEFAULT 'pendiente' NOT NULL,
        fecha_creacion datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
        PRIMARY KEY  (id),
        KEY id_usuario  (id_usuario)
    ) $charset_collate;";

    // dbDelta wird im globalen WordPress-Umfeld standardmäßig nicht geladen
    require_once ABSPATH . 'wp-admin/includes/upgrade.php';

    // Führt die Abstraktion zur Schemaaktualisierung aus
    dbDelta( $sql );
}

// Verknüpft die Funktion mit dem Aktivierungs-Lifecycle des Plugins
register_activation_hook( __FILE__, 'un_plugin_crear_tabla_personalizada' );

```

### Überprüfung der Tabellenerstellung

Um zu validieren, ob `dbDelta()` die Operation korrekt abgeschlossen hat, kannst du das von der Funktion zurückgegebene Array prüfen oder unmittelbar nach dem Aufruf die Eigenschaft `$wpdb->last_error` auswerten:

```php
$resultado = dbDelta( $sql );

if ( ! empty( $wpdb->last_error ) ) {
    // Fehlerbehandlung oder Logging in Entwicklungsumgebungen
    error_log( 'Error en dbDelta: ' . $wpdb->last_error );
}

```

Der Rückgabewert von `dbDelta()` ist ein assoziatives Array, bei dem die Schlüssel die Tabellennamen sind und die Werte beschreibende Texte der durchgeführten Aktionen enthalten (z. B. `"Created table $nombre_tabla"` oder `"Added column $nombre_tabla.nueva_columna"`). Wenn die Datenbankstruktur bereits vollständig mit dem übergebenen SQL übereinstimmt, ist das zurückgegebene Array leer, was garantiert, dass keine unnötiger Ressourcen des MySQL-Servers verbraucht wurden.

## 5.4 Aktualisierung von Datenschemata

Mit der Weiterentwicklung deines Plugins und der Veröffentlichung neuer Versionen ist es sehr wahrscheinlich, dass die in früheren Versionen erstellten benutzerdefinierten Tabellen angepasst werden müssen: Hinzufügen einer neuen Spalte, Ändern des Datentyps eines bestehenden Felds oder Integrieren eines neuen Index zur Abfrageoptimierung.

Wie wir im vorherigen Abschnitt gesehen haben, es la función `dbDelta()` zerstörungsfrei. Sie ändert die bestehende Struktur, ohne Daten zu löschen. Dennoch ist das Ausführen von `dbDelta()` eine performanceintensive Operation. Wenn du diese Routine bei jedem Seitenaufruf oder bei jeder Initialisierung des Admin-Bereichs ausführst, wird die Antwortzeit von WordPress erheblich beeinträchtigt.

Die architektonische Standardlösung in WordPress besteht darin, ein **Versionskontrollsystem für die Datenbank** zu implementieren.

### Der versionsbasierte Aktualisierungsfluss

Das Grundprinzip besteht darin, die aktuelle Version des Datenbankschemas im Quellcode deines Plugins zu definieren und sie mit der in der Datenbank gespeicherten Version (über die Options-API) zu vergleichen. Nur wenn die Version im Code neuer ist als die in der Datenbank gespeicherte Version, wird die Update-Routine ausgelöst.

```text
[Plugin-Initialisierung] (Hook: plugins_loaded)
               |
               v
  plugin_db_version aus der DB abrufen
               |
               v
  Version im Code > Version in der DB?
           /               \
        (Ja)               (Nein)
        /                     \
[dbDelta() ausführen]   [Normale Ausführung fortsetzen]
        |               (Ohne Performance-Auswirkung)
[plugin_db_version in DB aktualisieren]

```

### Implementierung des Versionskontrollsystems

Um diese Logik umzusetzen, musst du eine globale Konstante (oder Klasseneigenschaft) definieren, die die Schemaversion angibt, sowie eine Überprüfungsroutine, die frühzeitig im WordPress-Lebenszyklus an den Hook `plugins_loaded` angehängt wird.

Es folgt eine professionelle Struktur zur Verwaltung dieses Prozesses:

```php
<?php
// 1. Definiert die aktuelle Datenbankversion im Code
define( 'MI_PLUGIN_DB_VERSION', '1.2.0' );

/**
 * Hauptfunktion für die Schemaaktualisierung.
 * Enthält die neueste SQL-Struktur.
 */
function mi_plugin_actualizar_esquema() {
    global $wpdb;
    $nombre_tabla = $wpdb->prefix . 'registro_envios';
    $charset_collate = $wpdb->get_charset_collate();

    // Neue SQL-Struktur (z. B. wir haben die Spalte 'notas_internas' hinzugefügt)
    $sql = "CREATE TABLE $nombre_tabla (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        id_usuario bigint(20) NOT NULL,
        codigo_seguimiento varchar(100) NOT NULL,
        estado_envio varchar(50) DEFAULT 'pendiente' NOT NULL,
        notas_internas text,
        fecha_creacion datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
        PRIMARY KEY  (id),
        KEY id_usuario  (id_usuario)
    ) $charset_collate;";

    require_once ABSPATH . 'wp-admin/includes/upgrade.php';
    dbDelta( $sql );

    // 2. Aktualisiert die Version in der Datenbank nach dem Ausführen von dbDelta
    update_option( 'mi_plugin_db_version', MI_PLUGIN_DB_VERSION );
}

/**
 * Prüft, ob ein Datenbank-Update erforderlich ist.
 */
function mi_plugin_comprobar_actualizacion_db() {
    // Ruft die installierte Version ab (gibt false zurück, falls nicht vorhanden)
    $version_instalada = get_option( 'mi_plugin_db_version' );

    // 3. Vergleicht die Versionen
    if ( $version_instalada !== MI_PLUGIN_DB_VERSION ) {
        mi_plugin_actualizar_esquema();
    }
}

// 4. Hängt die Überprüfung an den Beginn des Plugin-Ladevorgangs an
add_action( 'plugins_loaded', 'mi_plugin_comprobar_actualizacion_db' );

```

### Umgang mit komplexen Updates (Migrationen)

Obwohl `dbDelta()` hervorragend für die Verwaltung von Spalten und Indizes geeignet ist, gibt es strukturelle Änderungen, die sie nicht automatisch lösen kann, wie:

* Umbenennen einer bestehenden Spalte.
* Löschen einer Spalte (Drop column).
* Migrieren oder Transformieren von Daten zwischen Tabellen.

Für diese Ausnahmefälle, in denen `dbDelta()` nicht ausreicht, muss deine Versionsprüfungsroutine direkte SQL-Statements mittels `$wpdb->query()` ausführen. Es ist wichtig, diese Operationen nach Versionen zu segmentieren, um sicherzustellen, dass un Benutzer, der von Version 1.0 auf 3.0 aktualisiert, alle Zwischenschritte nacheinander durchläuft:

```php
function mi_plugin_migraciones_especificas() {
    global $wpdb;
    $version_instalada = get_option( 'mi_plugin_db_version' );
    $nombre_tabla = $wpdb->prefix . 'registro_envios';

    // Falls die vorherige Version älter als 1.5.0 ist, eine veraltete Spalte löschen
    if ( version_compare( $version_instalada, '1.5.0', '<' ) ) {
        $wpdb->query( "ALTER TABLE $nombre_tabla DROP COLUMN columna_obsoleta" );
    }

    // Schließlich das Standard-Strukturschema aktualisieren
    mi_plugin_actualizar_esquema();
}

```

Die Implementierung dieses Musters stellt sicher, dass die Tabellen deines Plugins stets synchron mit der Codelogik bleiben, und zwar auf vorhersehbare, automatisierte Weise und unter Schonung der Serverressourcen auf Seiten des Benutzers.

## Zusammenfassung des Kapitels

In diesem Kapitel haben wir uns eingehend mit der Datenpersistenzschicht von WordPress befasst und die Werkzeuge beherrscht, die der Core zur Interaktion mit der Datenbank bietet, ohne die Sicherheit oder Stabilität der Plattform zu gefährden:

1. **Die Klasse `$wpdb`:** Wir haben verstanden, wie diese globale Instanz als Kommunikationsschnittstelle fungiert und effiziente Methoden (`get_var`, `get_results`, `insert`, `update`) zur Datenmanipulation bereitstellt.
2. **Sichere Abfragen:** Wir haben die strikte Verwendung von `$wpdb->prepare()` eingeführt, um alle dynamischen Variablen vor SQL-Injektionsangriffen zu bereinigen und zu schützen, einschließlich der Verwendung von `esc_like` und dynamischen Platzhaltern.
3. **Erstellung von Schemata:** Wir haben `dbDelta()` und seine strengen Syntaxregeln untersucht, um während der Plugin-Aktivierung benutzerdefinierte Tabellen zerstörungsfrei zu erstellen und bereitzustellen.
4. **Wartung und Versionskontrolle:** Wir haben eine auf `plugins_loaded` und der Options-API basierende Architektur etabliert, um Datenschemata bei jeder neuen Plugin-Version geräuschlos, sequenziell und auf Serverperformance optimiert zu aktualisieren.
