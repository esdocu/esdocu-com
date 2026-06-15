Sicherheit ist keine optionale Funktion, die man am Ende der Entwicklung einfach hinzufügt; sie ist das Fundament, auf dem jedes professionelle Plugin aufgebaut wird. In diesem Kapitel lernst du, wie du deinen Code gegen die kritischsten und häufigsten Schwachstellen des Web-Ökosystems absicherst.

Mit einer Zero-Trust-Mentalität untersuchen wir die unverzichtbaren Techniken, um eingehende Informationen durch Bereinigung (Sanitization) zu säubern, XSS-Angriffe durch spätes Escapen der Daten bei der Ausgabe zu neutralisieren und Website-übergreifende Anforderungsfälschungen (CSRF) mithilfe von Nonces zu blockieren. Am Ende wirst du genau die Werkzeuge haben, um robuste und sichere Lösungen zu entwickeln.

## 10.1 Zero-Trust-Prinzipien

In der Softwareentwicklung entstand das „Zero Trust“-Modell als Netzwerkarchitektur, die auf der Prämisse „Niemals vertrauen, immer überprüfen“ basiert. Übertragen auf die Entwicklung von WordPress-Plugins lässt sich dieses Paradigma in eine unumstößliche goldene Regel übersetzen: **Keine Daten sind standardmäßig sicher, unabhängig von ihrer Herkunft.**

Als Entwickler gerät man leicht in die Falle, Daten einfach deshalb zu vertrauen, weil sie von einem authentifizierten Benutzer, aus unserer eigenen Datenbank oder von der API eines bekannten Drittanbieters stammen. Im WordPress-Ökosystem is die Annahme, dass ein Administrator keinen Schadcode einschleust oder dass aus der Tabelle `wp_options` abgerufene Daten sicher direkt auf dem Bildschirm ausgegeben werden können, die Hauptursache für Schwachstellen wie XSS (Cross-Site Scripting) und SQL-Injektionen.

### Die Säulen von Zero Trust in WordPress

Um ein robustes Plugin zu bauen, musst du vier grundlegende Prinzipien verinnerlichen, die dich durch den Rest dieses Kapitels führen:

1. **Jede Eingabe ist böse (All Input is Evil):** Alle Daten, die aus superglobalen PHP-Variablen (`$_POST`, `$_GET`, `$_REQUEST`, `$_COOKIE`, `$_SERVER`), aus REST-API-Anfragen (Kapitel 13) oder aus Drittanbieter-Integrationen stammen, müssen als unmittelbare Bedrohung behandelt werden.
2. **Die Herkunft garantiert keine Integrität:** Selbst Daten, die aus der WordPress-eigenen Datenbank (`$wpdb`) ausgelesen werden, dürfen beim Ausgeben nicht als sicher angesehen werden. Wenn es einem Angreifer vor einem Monat gelungen ist, eine Validierung zu umgehen und ein bösartiges Skript einzufügen, führt das Vertrauen in diese Daten heute beim Rendern des Frontends zum Angriff (persistentes XSS).
3. **Prinzip der geringsten Rechte (PoLP):** Dein Code sollte nur die unbedingt notwendigen Berechtigungen ausführen und erteilen. Verlasse dich nicht darauf, dass die Benutzeroberfläche sensible Optionen für nicht autorisierte Benutzer ausblendet; überprüfe Berechtigungen immer auf Codeebene, bevor du eine Aktion verarbeitest.
4. **Defense in Depth (Mehrschichtige Verteidigung):** Verlasse dich nicht auf eine einzige Barriere. Validiere das Datenformat, bereinige die Daten vor dem Speichern, überprüfe die Absicht der Aktion (Nonces) und escape die Daten genau im Moment der Ausgabe.

### Diagramm des Zero-Trust-Datenflusses

Das folgende Schema veranschaulicht, wie Informationen unter Anwendung dieser Philosophie innerhalb deines Plugins fließen sollten, indem mehrere Kontrollpunkte eingerichtet werden:

```text
+-------------------+        [1. Herkunft und Absicht prüfen]
| Herkunft der Daten|        (Nonces und Capabilities - Kap. 10.4 / 12)
| (Formular, API,   | -------------------------------------------------+
| URL, DB, etc.)    |                                                  |
+-------------------+                                                  v
                                                           [2. Format validieren]
                                                           (Ist es eine E-Mail? Ist es ein Int?)
                                                                       |
+-------------------+        [4. Escapen (Late Escaping)]              v
| Ausgabe/Bildschirm|        (Codeausführung verhindern)   [3. Bereinigen (Early Sanitize)]
| (HTML, JSON,      | <----------------------------------  (Tags oder Zeichen säubern)
| Attribute)        |                                                  |
+-------------------+                                                  v
                                                           +-------------------+
                                                           | Verarbeitung /    |
                                                           | Datenbank         |
                                                           | (wpdb->prepare)   |
                                                           +-------------------+

```

### Der Mentalitätsunterschied im Code

Schau dir an, wie sich die Struktur eines einfachen Codeblocks, der ein Formular verarbeitet, verändert, wenn wir die Zero-Trust-Mentalität anwenden.

**Traditioneller Ansatz (Anfällig und leichtgläubig):**

```php
// ANNAHME: Dass die Anfrage legitim ist.
// ANNAHME: Dass der Benutzer Berechtigungen hat, weil er das Formular gesehen hat.
// ANNAHME: Dass das Feld 'color_favorito' ein harmloser Text ist.

function procesar_color_usuario() {
    if ( isset( $_POST['color_favorito'] ) ) {
        $color = $_POST['color_favorito']; 
        $user_id = get_current_user_id();
        
        // Gefahr: Direktes Speichern einer Superglobalen
        update_user_meta( $user_id, 'color_preferido', $color );
        
        // Gefahr: Direkte Ausgabe ohne Escapen
        echo "<p>Deine gespeicherte Farbe ist: " . $color . "</p>"; 
    }
}
add_action( 'admin_init', 'procesar_color_usuario' );

```

**Zero-Trust-Ansatz:**

```php
function procesar_color_usuario_seguro() {
    // 1. Überprüfen, ob die erwarteten Daten tatsächlich gesendet wurden
    if ( ! isset( $_POST['color_favorito'] ) ) {
        return;
    }

    // 2. Absicht und Herkunft überprüfen (Nonces)
    if ( ! isset( $_POST['color_nonce'] ) || ! wp_verify_nonce( $_POST['color_nonce'], 'guardar_color' ) ) {
        wp_die( 'Nicht autorisierte Anfrage.' );
    }

    // 3. Berechtigungen überprüfen: Hat dieser Benutzer das Recht dazu?
    if ( ! current_user_can( 'edit_user', get_current_user_id() ) ) {
        wp_die( 'Du hast nicht genügend Berechtigungen.' );
    }

    // 4. Validieren und Bereinigen (Frühzeitige Bereinigung)
    // Wir vertrauen nicht darauf, was der Benutzer eingegeben hat, und erzwingen einen sicheren String.
    $color_seguro = sanitize_text_field( wp_unslash( $_POST['color_favorito'] ) );

    // 5. Speichern
    update_user_meta( get_current_user_id(), 'color_preferido', $color_seguro );

    // 6. Escapen (Spätes Escapen)
    // Wir vertrauen der Variable $color_seguro nicht, nur weil wir sie gerade bereinigt haben.
    // Die Regel lautet: Wenn es in HTML ausgegeben wird, wird es für HTML escaped.
    echo "<p>Deine gespeicherte Farbe ist: " . esc_html( $color_seguro ) . "</p>";
}
add_action( 'admin_init', 'procesar_color_usuario_seguro' );

```

Durch die Übernahme von Zero Trust änderst du den Fokus von „Schutz vor bekannten Angriffen“ zu „Misstrauen gegenüber jeder nicht explizit validierten Operation“. Dies ist das Fundament, auf dem die technischen Funktionen zur Bereinigung und zum Escapen aufbauen, die wir in den folgenden Abschnitten untersuchen werden.

## 10.2 Bereinigungsfunktionen (Sanitization)

Die Bereinigung (Sanitization) is die erste aktive Verteidigungslinie bei der Datenverarbeitung. Ihr Ziel ist es, sicherzustellen, dass die empfangenen Informationen strikt dem erwarteten Format entsprechen, und jegliche bösartigen Zeichen, Tags oder Skripte zu entfernen, bevor die Daten verarbeitet, in der Datenbank gespeichert oder an eine externe API gesendet werden.

Wenn wir uns an das Zero-Trust-Diagramm aus dem vorherigen Abschnitt erinnern, findet die Bereinigung in der Phase der „Frühzeitigen Bereinigung“ (Early Sanitize) statt.

### Die wichtigsten Bereinigungsfunktionen in WordPress

WordPress bietet einen umfangreichen Katalog nativer Funktionen zur Bereinigung fast aller Datentypen. Die Verwendung der Core-Funktionen garantiert nicht nur Sicherheit, sondern stellt auch die Kompatibilität und Standardisierung innerhalb des Ökosystems sicher.

#### 1. Einfache Textzeichenketten

Die am häufigsten verwendete Funktion. `sanitize_text_field()` entfernt HTML-Tags, Zeilenumbrüche, Tabulatoren und zusätzliche Leerzeichen. Sie ist ideal für Namen, Titel und Textfelder eines Standardformulars.

```php
// Imaginärer bösartiger Input: "<script>alert('xss');</script> Hallo   Welt"
$texto_limpio = sanitize_text_field( $_POST['nombre_usuario'] );
// Ergebnis: "alert('xss'); Hallo Welt" (Die Script-Tags werden entfernt)

```

#### 2. Textbereiche (Mehrzeilig)

Im Gegensatz zur vorherigen Funktion bewahrt `sanitize_textarea_field()` Zeilenumbrüche (`\n`), was sie für Felder wie Biografien, Kommentare oder lange Beschreibungen, die in einer `<textarea>` eingegeben werden, zwingend erforderlich macht.

```php
$descripcion_limpia = sanitize_textarea_field( $_POST['descripcion_larga'] );

```

#### 3. E-Mail-Adressen

`sanitize_email()` entfernt Zeichen, die in einer E-Mail-Adresse gemäß den Internetstandards nicht zulässig sind. Es ist wichtig zu beachten, dass diese Funktion **nicht prüft**, ob die E-Mail-Adresse tatsächlich existiert oder gültig ist; sie bereinigt lediglich das strukturelle Format.

```php
$email_limpio = sanitize_email( $_POST['email_contacto'] );

```

#### 4. Ganzzahlen

Für Post-IDs, Mengen oder jeden Wert, der strikt numerisch sein muss.

* `absint()`: Garantiert eine absolute Ganzzahl (immer größer oder gleich null). Dies ist die bevorzugte Funktion zur Bereinigung von IDs.
* `intval()`: Konvertiert den Wert in eine Ganzzahl, erlaubt jedoch negative Zahlen.

```php
$post_id = absint( $_GET['post_id'] ); // Wenn "-5" oder "abc" empfangen wird, wird 5 bzw. 0 zurückgegeben.
$diferencia = intval( $_POST['variacion_stock'] ); // Erlaubt Werte wie -10.

```

#### 5. Keys (Schlüssel) und Slugs

`sanitize_key()` wandelt die gesamte Zeichenkette in Kleinbuchstaben um, ersetzt Leerzeichen durch Bindestriche und entfernt Sonderzeichen. Sie ist essenziell beim Speichern von Optionen in der Datenbank, beim Registrieren von Custom Post Types oder beim Definieren von *Meta Keys*.

```php
// Input: "Meine Spezielle Option!"
$clave_limpia = sanitize_key( $_POST['nombre_opcion'] );
// Ergebnis: "meine_spezielle_option"

```

#### 6. Erlaubtes HTML (KSES)

Wenn du möchtest, dass der Benutzer legitimes HTML eingeben kann (wie bei der Verwendung eines WYSIWYG-Editors in deinem Plugin), kannst du `sanitize_text_field` nicht verwenden, da es die Formatierung zerstören würde. Hierfür nutzt WordPress seine KSES-Engine (*KSES Strips Evil Scripts*).

* `wp_kses_post()`: Erlaubt dasselbe HTML, das WordPress standardmäßig für den Inhalt von Beiträgen autorisiert (Absätze, Fettschrift, Links, Bilder).
* `wp_kses()`: Ermöglicht die Definition eines strikten Arrays der genauen Tags und Attribute, die du zulassen möchtest, was eine granulare Kontrolle bietet.

```php
// Beispiel für eine strikte und benutzerdefinierte Bereinigung
$html_permitido = array(
    'a' => array(
        'href'  => array(),
        'title' => array()
    ),
    'strong' => array(),
    'em'     => array()
);

$comentario_limpio = wp_kses( $_POST['comentario_html'], $html_permitido );

```

### Hilfsfunktion: wp_unslash()

Aus Gründen der historischen Kompatibilität fügt WordPress superglobalen Variablen (`$_POST`, `$_GET`, `$_REQUEST`, `$_COOKIE`) automatisch Backslashes hinzu, was eine veraltete PHP-Direktive namens *magic_quotes_gpc* nachahmt.

Bevor du Daten aus einer Superglobalen bereinigst, musst du **immer** diese Backslashes entfernen. Wenn du das nicht tust, riskierst du, dass maskierte Anführungszeichen (z. B. `\'`) buchstabengetreu in der Datenbank gespeichert werden oder die Zeichenkette während des Bereinigungsprozesses beschädigt wird.

**Das Standardmuster für die Bereinigung folgt immer dieser Struktur:**

```php
// 1. Das automatische Hinzufügen von Backslashes durch den WordPress-Core rückgängig machen
$dato_crudo = wp_unslash( $_POST['mi_campo'] );

// 2. Die entsprechende Bereinigungsfunktion anwenden
$dato_seguro = sanitize_text_field( $dato_crudo );

// Best Practice (Kompakte Version):
$dato_seguro = sanitize_text_field( wp_unslash( $_POST['mi_campo'] ) );

```

### Schnellreferenztabelle

| Erwarteter Datentyp | Empfohlene Funktion | Verhalten/Hinweise |
| --- | --- | --- |
| Einfacher Text (Input text) | `sanitize_text_field()` | Entfernt HTML-Tags und glättet Zeilenumbrüche. |
| Langer Text (Textarea) | `sanitize_textarea_field()` | Entfernt HTML-Tags, bewahrt aber Zeilenumbrüche. |
| E-Mail-Adresse | `sanitize_email()` | Bereinigt ungültige Zeichen für eine E-Mail. |
| Positive Zahl / ID | `absint()` | Konvertiert in eine absolute Ganzzahl (immer $\ge$ 0). |
| Generisches HTML | `wp_kses_post()` | Sicher für Rich-Content wie bei Beiträgen. |
| Keys/Schlüssel (Options/Meta) | `sanitize_key()` | Erzwingt Kleinbuchstaben, Unterstriche und entfernt Leerzeichen. |

Die Bereinigung stellt sicher, dass die Daten, die in deine Datenbank oder Geschäftslogik gelangen, vorhersehbar, sauber und sicher sind. Dies schützt jedoch nicht vor der Ausführung von Skripten, wenn dieselben Daten wieder auf dem Bildschirm des Benutzers ausgegeben werden. Diese lebenswichtige Aufgabe fällt dem Escapen von Daten zu.

## 10.3 Escapen von Daten bei der Ausgabe

Wenn die Bereinigung (Abschnitt 10.2) der Schutz deiner Datenbank vor bösartigen eingehenden Daten ist, dann ist das **Escapen von Daten** das Schild, das die Benutzer (und ihre Browser) schützt, wenn dein Plugin Informationen auf dem Bildschirm ausgibt.

Das Escapen ist der Prozess zur Absicherung von Daten unmittelbar vor deren Darstellung im Frontend oder im Administrationsbereich. Dabei werden Sonderzeichen neutralisiert, die der Browser fälschlicherweise als ausführbaren Code (hauptsächlich HTML oder JavaScript) interpretieren könnte. Dies ist entscheidend, um Cross-Site Scripting (XSS) zu verhindern.

### Das Prinzip des „Late Escaping“ (Spätes Escapen)

In der WordPress-Entwicklung gibt es eine goldene Regel: **Escape so spät wie möglich**.

Du solltest Daten niemals vor dem Speichern in der Datenbank oder am Anfang einer Funktion escapen. Das Escapen muss genau in dem Moment erfolgen, in dem du `echo` oder `print` verwendest oder die Daten in einem View zurückgibst. Dies stellt sicher, dass der Ausgabekontext klar ist und dass die Daten in der Datenbank in ihrer reinen Form erhalten bleiben, sodass sie bei Bedarf in anderen Kontexten verwendet werden können (z. B. für den Versand an eine JSON-API anstatt zur Ausgabe in HTML).

### Die wichtigsten Escape-Funktionen

WordPress bietet spezifische Funktionen an, je nachdem, in welchem genauen Kontext die Daten in das HTML-Dokument eingefügt werden. Die Verwendung der falschen Funktion kann das Design zerstören oder eine Sicherheitslücke offenlassen.

#### 1. Generisches Escapen von Text: `esc_html()`

Dies wird in allen Situationen verwendet, in denen die Daten innerhalb eines standardmäßigen HTML-Tags (wie `<div>`, `<p>`, `<span>`, `<h1>` etc.) angezeigt werden. Diese Funktion konvertiert Sonderzeichen (wie `<` , `>`, `&`, `"`, `'`) in ihre entsprechenden HTML-Entities.

```php
$nombre_usuario = get_user_meta( $user_id, 'nombre_perfil', true );

// Gefahr: Der Benutzer könnte die Bereinigung umgangen haben.
// Sicher: Wir neutralisieren jeden XSS-Versuch bei der Ausgabe.
echo '<h3>Willkommen, ' . esc_html( $nombre_usuario ) . '</h3>';

```

#### 2. HTML-Attribute: `esc_attr()`

Wenn Daten **innerhalb eines Attributs** eines HTML-Tags (wie `value`, `class`, `id`, `title`, `placeholder`) ausgegeben werden sollen, musst du `esc_attr()` verwenden. Browser analysieren Attribute anders als Klartext. Diese Funktion stellt sicher, dass bösartige Anführungszeichen das Attribut nicht vorzeitig schließen und JavaScript-Events wie `onmouseover` oder `onclick` einschleusen.

```php
$clase_css = get_option( 'mi_plugin_color_clase' );
$valor_input = 'O\'Brian'; // Beispiel mit Anführungszeichen

// Korrekte Verwendung in Attributen
echo '<div class="' . esc_attr( $clase_css ) . '">';
echo '<input type="text" name="apellido" value="' . esc_attr( $valor_input ) . '" />';

```

#### 3. Links und URLs: `esc_url()`

Zwingend erforderlich für alle Daten, die innerhalb der Attribute `href` oder `src` ausgegeben werden. Neben der Kodierung von Sonderzeichen weist `esc_url()` gefährliche Protokolle (wie `javascript:` oder `vbscript:`) zurück und lässt nur sichere (wie `http`, `https`, `mailto`) zu.

```php
$enlace_perfil = get_user_meta( $user_id, 'website_url', true );

// Einschleusung verhindert: Wenn der Link "javascript:alert(1);" war,
// wird esc_url() ihn bereinigen und unschädlich machen.
echo '<a href="' . esc_url( $enlace_perfil ) . '">Website besuchen</a>';

```

#### 4. Textbereiche: `esc_textarea()`

Speziell für die Ausgabe von Werten innerhalb eines `<textarea>`-Tags entwickelt. Im Gegensatz zu `esc_html` verarbeitet sie den mehrzeiligen Textkontext und die Entity-Codierung in diesem spezifischen Element korrekt.

```php
$biografia = get_user_meta( $user_id, 'bio_larga', true );

echo '<textarea name="bio">' . esc_textarea( $biografia ) . '</textarea>';

```

#### 5. Inline-JavaScript: `esc_js()`

Wenn du gezwungen bist, PHP-Daten direkt in einen `<script>`-Block oder ein Inline-JS-Event auszugeben, verwende diese Funktion. Sie codiert den Text so, dass er einer JavaScript-Variablen sicher zugewiesen werden kann, ohne die Skriptsyntax zu beschädigen. *(Hinweis: Die empfohlene Praxis ist die Verwendung von `wp_add_inline_script` o `wp_localize_script`, was in Kapitel 7 behandelt wurde).* 

```php
$mensaje = 'Vorgang erfolgreich abgeschlossen';

echo '<script>';
echo 'var mensajeSistema = "' . esc_js( $mensaje ) . '";';
echo 'console.log(mensajeSistema);';
echo '</script>';

```

### Escapen und Übersetzungen (i18n)

Häufig müssen Zeichenketten, die escaped werden müssen, auch übersetzbar sein (was wir in Kapitel 15 genauer untersuchen werden). Anstatt Funktionen wie `echo esc_html( __( 'Mensaje', 'textdomain' ) )` zu verschachteln, bietet WordPress kombinierte Funktionen an, um den Code zu vereinfachen:

* `esc_html_e( 'Zu übersetzender Text', 'textdomain' );` — Übersetzt, escaped für HTML und führt `echo` aus.
* `esc_html__( 'Zu übersetzender Text', 'textdomain' );` — Übersetzt, escaped für HTML und gibt die Zeichenkette zurück (`return`).
* `esc_attr_e( 'Attribut', 'textdomain' );` — Übersetzt, escaped für Attribute und führt `echo` aus.

### Ausgabe von komplexem HTML

Wenn dein Plugin einen großen Datenblock ausgeben muss, der HTML-Tags enthalten **muss** (z. B. den Inhalt eines Beitrags oder die Ausgabe eines WYSIWYG-Editors), hilft `esc_html` nicht weiter, da es die Tags in sichtbaren Text umwandeln würde (es würde buchstäblich `<strong>Text</strong>` auf dem Bildschirm ausgeben).

In diesen Ausgabefällen wird die KSES-Engine wiederverwendet, die wir bereits bei der Bereinigung kennengelernt haben:

```php
$contenido_guardado = get_option( 'mensaje_personalizado_admin' );

// Erlaubt sicheres HTML (Absätze, Fettschrift, Links), entfernt aber Skripte oder Iframes
echo wp_kses_post( $contenido_guardado );

```

Das Escapen von Daten darf niemals ein nachträglicher Gedanke sein. Die konsequente Anwendung des späten Escapens bei jedem `echo` stellt sicher, dass selbst dann, wenn sich bösartige Daten in deine Datenbank eingeschlichen haben sollten, diese völlig harmlos sind, sobald sie auf dem Bildschirm des Benutzers ausgegeben werden.

## 10.4 Nonces: CSRF-Prävention

Die letzte grundlegende Säule der Sicherheit in WordPress ist der Schutz vor Website-übergreifenden Anforderungsfälschungen, bekannt als CSRF (Cross-Site Request Forgery).

Ein CSRF-Angriff tritt auf, wenn ein böswilliger Akteur einen authentifizierten Benutzer (z. B. einen Administrator) dazu verleitet, eine unerwünschte Aktion ohne dessen Wissen auszuführen. Da der Administrator bereits eine aktive Sitzung und die entsprechenden Cookies in seinem Browser hat, verarbeitet WordPress die Anfrage im Glauben, sie sei legitim, wenn er auf einen schädlichen Link klickt.

### Was ist ein Nonce in WordPress?

Um dies zu verhindern, verwendet WordPress **Nonces** (*Number used ONCE*). Ein Nonce ist ein Sicherheitstoken, ein dynamisch generierter alphanumerischer Hash, der an URLs oder Formulare angehängt wird.

Im Gegensatz zur strengen kryptografischen Definition werden Nonces in WordPress **nicht nur ein einziges Mal verwendet**. Sie haben eine Standardlebensdauer von 24 Stunden und sind untrennbar verbunden mit:

1. Dem aktuellen Benutzer (seine ID und seine Sitzung).
2. Der spezifischen Aktion, die versucht wird auszuführen.
3. Dem Zeitraum, in dem es generiert wurde.

Wenn das gesendete Token nicht mit dem vom Server erwarteten übereinstimmt, wird die Anfrage sofort abgelehnt.

### Ablauf eines CSRF-Angriffs im Vergleich zum Schutz durch Nonces

```text
[ OHNE NONCES: Anfälliges Szenario ]
Angreifer -----> Erstellt URL: meine-website.de/wp-admin/admin.php?action=tabelle_loeschen
Angreifer -----> Sendet Trick-E-Mail an den Administrator („Schau dir dieses Foto an!“)
Administrator -> Klickt darauf, während er eingeloggt ist.
WordPress ----> Sieht das Admin-Cookie. Führt „tabelle_loeschen“ aus. Katastrophe!

[ MIT NONCES: Sicheres Szenario ]
Angreifer -----> Erstellt URL: meine-website.de/wp-admin/admin.php?action=tabelle_loeschen
Angreifer -----> Sendet Trick-E-Mail an den Administrator.
Administrator -> Klickt darauf, während er eingeloggt ist.
WordPress ----> Sucht nach dem Parameter $_GET['_wpnonce']. Existiert nicht oder ist ungültig.
WordPress ----> Anfrage abgelehnt („Link abgelaufen“). Sicheres System.

```

### Implementierung in deinem Plugin

Die implementierung von Nonces erfordert zwei untrennbare Schritte: das Generieren in der Benutzeroberfläche und das Verifizieren in der Verarbeitungslogik.

#### 1. Generierung des Nonces

Je nachdem, wie die Daten gesendet werden, verwendest du eine andere Funktion zur Erstellung des Tokens.

**In einem HTML-Formular:**
Verwende `wp_nonce_field()`. Diese Funktion gibt direkt zwei versteckte Felder (`<input type="hidden">`) aus: eines für das Nonce und eines für die Referer-URL.

```php
<form method="post" action="">
    <?php wp_nonce_field( 'borrar_registro_15', 'mi_plugin_nonce' ); ?>
    
    <input type="hidden" name="registro_id" value="15">
    <input type="submit" value="Eintrag löschen">
</form>

```

**In einer URL (Direkte Links):**
Verwende `wp_nonce_url()`. Diese Funktion fügt den Parameter `_wpnonce` an eine bestehende URL an.

```php
$url_borrar = admin_url( 'admin.php?page=mi-plugin&action=borrar&id=15' );
// Generiert: ...&action=borrar&id=15&_wpnonce=a1b2c3d4e5
$url_segura = wp_nonce_url( $url_borrar, 'borrar_registro_15' );

echo '<a href="' . esc_url( $url_segura ) . '">Löschen</a>';

```

#### 2. Verifizierung des Nonces

Du solltest niemals eine Speicher-, Aktualisierungs- oder Löschaktion verarbeiten, ohne zuvor das Nonce verifiziert zu haben.

**Für generische Anfragen (Formulare oder URLs):**
Verwende `wp_verify_nonce()`. Es gibt `1` zurück (wenn es weniger als 12 Stunden alt ist), `2` (wenn es zwischen 12 und 24 Stunden alt ist) oder `false`, wenn es ungültig ist.

```php
function procesar_borrado() {
    // 1. Wir überprüfen, ob das Nonce gesendet wurde
    if ( ! isset( $_REQUEST['mi_plugin_nonce'] ) ) {
        wp_die( 'Anfrage abgelehnt: Sicherheitstoken fehlt.' );
    }

    // 2. Wir überprüfen die Gültigkeit des Nonces
    if ( ! wp_verify_nonce( $_REQUEST['mi_plugin_nonce'], 'borrar_registro_15' ) ) {
        wp_die( 'Anfrage abgelehnt: Token ungültig oder abgelaufen.' );
    }

    // 3. Mit der Bereinigung und Geschäftslogik fortfahren...
}

```

**Für den Administrationsbereich (Strikte Verifizierung):**
`check_admin_referer()` ist eine striktere Alternative zu `wp_verify_nonce`. Neben der Überprüfung des Nonces wird auch geprüft, ob die Anfrage von einer Administrationsseite deiner eigenen Website stammt. Schlägt dies fehl, wird die Ausführung sofort mit dem klassischen Bildschirm „Der Link ist abgelaufen“ abgebrochen.

```php
// Überprüft das Nonce $_POST['mi_plugin_nonce'] mit der Aktion 'borrar_registro_15'
check_admin_referer( 'borrar_registro_15', 'mi_plugin_nonce' );

// Wenn wir diese Zeile erreichen, ist die Anfrage sicher.

```

*(Hinweis: Für AJAX-Anfragen bietet der WordPress-Core die Funktion `check_ajax_referer()`, die in Kapitel 9 im Detail behandelt wurde).* 

Benenne deine Nonce-Aktionen immer so spezifisch wie möglich. Ein Nonce für `guardar_ajustes` ist akzeptabel, aber ein Nonce namens `borrar_registro_15` (wobei 15 eine dynamische ID ist) ist unendlich viel sicherer, da es gewährleistet, dass ein kompromittiertes Token nur diesen speziellen Datensatz betrifft und keinen anderen.

## Zusammenfassung des Kapitels

In diesem Kapitel haben wir uns mit der ganzheitlichen Sicherheit befasst, die keine oberflächliche Schicht ist, die man am Ende der Entwicklung hinzufügt, sondern eine ständige Arbeitsmethodik darstellt.

* Wir haben mit der Etablierung des **Zero-Trust-Prinzips** begonnen, unter der Annahme, dass jede Eingabe potenziell bösartig ist und die Herkunft der Daten keine Integrität garantiert.
* Wir haben gelernt, eingehende Daten mithilfe von Funktionen wie `sanitize_text_field()` und `absint()` zu **bereinigen**, um die Informationen vor der Verarbeitung zu säubern.
* Wir haben die kritische Bedeutung des **späten Escapens** (*Late Escaping*) mithilfe von Funktionen wie `esc_html()` und `esc_attr()` gesehen, um jegliche Versuche der Code-Einschleusung (XSS) genau im Moment der Bildschirmausgabe zu neutralisieren.
* Schließlich haben wir die **Absicht** des Benutzers durch die Implementierung von **Nonces** abgesichert, wodurch CSRF-Angriffe mittels temporärer Token blockiert werden, und verifiziert, dass jede zerstörerische oder ändernde Anfrage tatsächlich aus dem Administrationsbereich des aktiven Benutzers stammt.
