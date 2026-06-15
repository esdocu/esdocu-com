Die Zugriffskontrolle ist die Säule der Sicherheit jedes Plugins. In diesem Kapitel werden wir das WordPress-System für Rollen und Capabilities (Berechtigungen) entschlüsseln und die Abhängigkeit von generischen Profilen hinter uns lassen, um eine rein auf atomaren Aktionen basierende Verwaltung einzuführen. Du lernst, deinen Code mithilfe von `current_user_can()` abzusichern, benutzerdefinierte Rollen zu registrieren, die an die Geschäftslogik deines Projekts angepasst sind, und eigene Berechtigungen mit chirurgischer Präzision zuzuweisen. Das Beherrschen dieser Hierarchie ist grundlegend, um sicherzustellen, dass jeder Benutzer nur mit den erlaubten Funktionen interagiert, und um zuverlässige und professionelle Erweiterungen zu erstellen.

## 12.1 Das Standard-Rollensystem

WordPress implementa un sistema de control de acceso basado en roles (RBAC - *Role-Based Access Control*) que se apoya fundamentalmente en dos conceptos interconectados: **Roles** (perfiles) y **Capabilities** (capacidades).

Um sichere und gut integrierte Plugins zu entwickeln, ist es zwingend erforderlich zu verstehen, dass eine **Rolle** nichts anderes als ein Label oder Container ist, der eine bestimmte Gruppe von **Capabilities** zusammenfasst. WordPress prüft nicht von Natur aus, welche Rolle ein Benutzer hat, um ihm eine Aktion zu erlauben, sondern verifiziert, ob der Benutzer die für die Ausführung erforderliche Capability besitzt.

### Die Standardrollen

Eine Standardinstallation von WordPress (Single Site) umfasst fünf Standardrollen. In Netzwerkinstallationen (Multisite) kommt eine sechste, hierarchisch übergeordnete Rolle hinzu. Im Folgenden wird die Standardstruktur von den höchsten zu den niedrigsten Rechten zusammen mit einigen ihrer charakteristischen Capabilities beschrieben:

1. **Super Admin (Nur Multisite):** Hat uneingeschränkten Zugriff auf die Verwaltung des Website-Netzwerks und überschreibt jede Capability-Prüfung.
2. **Administrator:** Besitzt alle Capabilities innerhalb einer einzelnen Website. Dies ist die einzige Standardrolle, die mit dem Erweiterungs-Ökosystem interagieren kann (`activate_plugins`, `install_themes`, `manage_options`).
3. **Editor (Redakteur):** Hat die volle Kontrolle über die Inhalte. Kann jede Art von Beitrag oder Seite erstellen, bearbeiten, veröffentlichen und löschen, unabhängig vom Autor (`edit_others_posts`, `publish_pages`, `moderate_comments`).
4. **Author (Autor):** Kann einzig und allein seine eigenen Inhalte verwalten. Hat die Fähigkeit, eigene Beiträge zu verfassen, Mediendateien hochzuladen und zu veröffentlichen (`publish_posts`, `upload_files`), hat aber keinen Zugriff auf Seiten.
5. **Contributor (Mitarbeiter):** Kann eigene Beiträge verfassen und verwalten, hat aber nicht das Recht, sie zu veröffentlichen (`edit_posts`, `delete_posts`). Seine Inhalte müssen von einem Editor oder Administrator überprüft werden. Kann auch keine Mediendateien hochladen.
6. **Subscriber (Abonnent):** Die einfachste Rolle. Hat nur die Fähigkeit, öffentliche Inhalte zu lesen und das eigene Benutzerprofil im Dashboard zu verwalten (`read`).

### Datenarchitektur: Wie Rollen gespeichert werden

Im Unterscheid zu anderen Content-Management-Systemen sind die Definitionen der Rollen und ihre zugehörigen Capabilities nicht für jede Ausführung in den PHP-Core-Dateien fest verdrahtet. Sie werden dauerhaft in der Datenbank gespeichert.

Genauer gesagt wird das vollständige Rollenschema in der Tabelle `wp_options` (oder dem entsprechenden Präfix, das in Kapitel 5 konfiguriert wurde) unter dem Optionsschlüssel `wp_user_roles` gespeichert. Die Speicherung in der Datenbank ermöglicht es Plugins, diese Strukturen dauerhaft zu ändern (wie wir in Abschnitt 12.3 sehen werden).

Wenn einem Benutzer eine Rolle zugewiesen wird, geschieht dies nicht über eine separate Spalte in der Tabelle `wp_users`. Stattdessen wird sie in der Tabelle `wp_usermeta` unter dem Schlüssel `wp_capabilities` gespeichert. Der Wert ist ein serialisiertes Array, das in der Regel den Namen der Rolle als Schlüssel und einen booleschen Wert enthält.

```text
+-------------------------------------------------------------+
| Beziehungsdiagramm: Benutzer -> Rolle -> Capabilities        |
+-------------------------------------------------------------+

[ Tabelle wp_users ]      [ Tabelle wp_usermeta ]
+---------------+         +---------------------------------+
| ID: 5         | ======= | user_id: 5                      |
| user_login:   |         | meta_key: wp_capabilities       |
| jdoe          |         | meta_value: a:1:{s:6:"editor";  |
+---------------+         |                  b:1;}          |
                           +---------------------------------+
                                           |
                                           V
                          [ Tabelle wp_options ]
                          +---------------------------------+
                          | option_name: wp_user_roles      |
                          | option_value: (Array mit allen  |
                          | Capabilities der Rolle Editor:  |
                          | - edit_posts: true              |
                          | - publish_posts: true           |
                          | - edit_others_posts: true...)   |
                          +---------------------------------+

```

### Die globale Klasse `WP_Roles`

WordPress verwaltet dieses gesamte Ökosystem zur Laufzeit über die Klasse `WP_Roles`. Während des Core-Ladeflusses (siehe Kapitel 1) initialisiert WordPress die globale Variable `$wp_roles`.

Diese Instanz ist dafür verantwortlich, die Option `wp_user_roles` aus der Datenbank zu laden und die Methoden bereitzustellen, um damit zu interagieren. Obwohl du die Capabilities später mit Wrapper-Funktionen manipulieren wirst, ist es nützlich zu wissen, wie man das Standardsystem direkt über die Klassen-API inspiziert.

Der folgende Codeblock zeigt, wie du alle registrierten Rollen und deren zugehörige Capabilities mithilfe der Funktion `wp_roles()` abrufen und visualisieren kannst, die sicher auf der globalen Variable `$wp_roles` agiert:

```php
/**
 * Beispiel: Die Rollen und Capabilities des Systems inspizieren.
 * Dies ist nützlich für das Debugging und um die zugrunde liegende Struktur zu verstehen.
 */
function devplugin_inspect_default_roles() {
    // wp_roles() gibt die globale Instanz von WP_Roles zurück
    $roles_obj = wp_roles();
    
    // Das Array aller registrierten Rollen abrufen
    $all_roles = $roles_obj->roles;
    
    // Über die Rollen iterieren
    foreach ( $all_roles as $role_slug => $role_details ) {
        echo "<h3>Rolle: " . esc_html( $role_details['name'] ) . " (" . esc_html( $role_slug ) . ")</h3>";
        
        // $role_details['capabilities'] ist ein assoziatives Array
        echo "<ul>";
        foreach ( $role_details['capabilities'] as $cap => $granted ) {
            if ( $granted ) {
                echo "<li>" . esc_html( $cap ) . "</li>";
            }
        }
        echo "</ul>";
    }
}

```

Zu verstehen, dass Rollen veränderbar sind und in der Datenbank liegen, ist der erste lebenswichtige Schritt. Als Entwickler sollte dein Code fast nie fragen: „Ist der aktuelle Benutzer ein Autor?“. Wenn dein Plugin eine Funktionalität zum Exportieren eines PDFs hinzufügt, sollte deine Logik von den Standardrollen abstrahiert sein und auf Basis von Capabilities prüfen: „Hat der aktuelle Benutzer die Capability `exportar_pdfs`?“. Wenn du blind auf den Rollennamen vertraust, wird dein Plugin fehlschlagen oder unsicher werden, falls ein anderer Administrator beschließt, die Rolle „Autor“ von seiner Website zu entfernen, oder wenn ein anderes Plugin die Standardberechtigungen drastisch ändert.

## 12.2 Überprüfung von Capabilities

Wie im vorherigen Abschnitt festgestellt, lautet die goldene Regel für Sicherheit und Zugriffskontrolle in WordPress: **Überprüfe immer Capabilities, niemals Rollen**. Rollen können von anderen Plugins umbenannt, geändert oder gelöscht werden, aber die Capabilities repräsentieren die atomare Aktion, die dein Code gerade ausführen möchte.

WordPress bietet eine einfache, aber äußerst leistungsstarke API, um diese Überprüfungen an jedem Punkt der Ausführung deines Plugins durchzuführen.

### Die Hauptfunktion: `current_user_can()`

Das am häufigsten verwendete Werkzeug im Arsenal eines WordPress-Entwicklers ist `current_user_can()`. Diese Funktion prüft, ob der Benutzer der aktuellen Sitzung eine bestimmte Capability besitzt. Sie gibt einen booleschen Wert (`true` oder `false`) zurück.

Ihre Verwendung ist zwingend erforderlich, bevor sensible Daten verarbeitet, Optionsseiten gerendert oder kritische Routinen ausgeführt werden.

```php
/**
 * Beispiel: Die Ausführung einer kritischen Funktion schützen.
 */
function devplugin_borrar_datos_sensibles() {
    // Wir überprüfen, ob der Benutzer die erforderliche Zugriffsebene hat
    if ( ! current_user_can( 'manage_options' ) ) {
        // Wenn er die Capability nicht hat, stoppen wir die Ausführung und geben einen Fehler zurück
        wp_die( __( 'Du hast nicht genügend Berechtigungen, um diese Aktion auszuführen.', 'devplugin' ) );
    }

    // Logik zum Löschen der Daten...
}

```

Es ist wichtig, ein häufiges Anti-Pattern hervorzuheben: `current_user_can( 'administrator' )`. Obwohl WordPress aus Gründen der Abwärtskompatibilität erlaubt, den Namen einer Rolle an diese Funktion zu übergeben (und `true` gibt, wenn der Benutzer diese Rolle hat), **wird dringend davon abgeraten**. Es bricht die Abstraktion des Capability-Systems und macht dein Plugin inkompatibel mit benutzerdefinierten Rollenmanagern.

### Überprüfung bei bestimmten Benutzern: `user_can()`

Gelegentlich muss dein Plugin nicht den aktuell surfenden Benutzer bewerten, sondern einen bestimmten Benutzer aus der Datenbank (z. B. beim Rendern einer Benutzerliste, um einen „Bearbeiten“-Button nur neben denjenigen anzuzeigen, die bestimmte Rechte haben).

Für diese Fälle wird `user_can( $user, $capability )` verwendet, wobei `$user` eine numerische Benutzer-ID oder eine Instanz des Objekts `WP_User` sein kann.

```php
$user_id = 42;

if ( user_can( $user_id, 'publish_posts' ) ) {
    echo '<p>Der Benutzer 42 ist in der Lage, Inhalte zu veröffentlichen.</p>';
}

```

### Primitive Capabilities vs. Meta Capabilities

Um das Berechtigungssystem zu beherrschen, ist es entscheidend, den Unterschied zwischen zwei Arten von Capabilities zu verstehen, die WordPress intern verwaltet:

1. **Primitive Capabilities:** Dies sind die absoluten Berechtigungen, die einem Benutzer erteilt und in der Datenbank gespeichert werden. Zum Beispiel `edit_posts` (Beiträge bearbeiten), `manage_options` (Optionen verwalten) oder `upload_files` (Dateien hochladen). Sie sind generisch und kontextunabhängig.
2. **Meta Capabilities:** Dies sind bedingte Überprüfungen, die von einem bestimmten Objekt abhängen. Zum Beispiel `edit_post` (im Singular). Du kannst nicht einfach prüfen, ob un Benutzer `edit_post` hat; du musst angeben, *welchen* Beitrag er bearbeiten möchte, da der Benutzer zwar die Berechtigung haben könnte, seine eigenen Beiträge zu bearbeiten, nicht aber die eines anderen Autors.

Wenn du eine Meta Capability an `current_user_can()` übergibst, musst du die ID des Objekts als zweites Argument mitgeben.

```php
$post_id_a_editar = 150;

// Richtig: Bewertung einer Meta Capability mit ihrem Kontext (der ID des Beitrags)
if ( current_user_can( 'edit_post', $post_id_a_editar ) ) {
    // Der Benutzer kann den Beitrag 150 bearbeiten
}

```

#### Der Bewertungsfluss (Die Funktion `map_meta_cap`)

Wie weiß WordPress, ob `edit_post` für die ID 150 `true` oder `false` zurückgeben soll? Dies geschieht über einen Mapping- oder Übersetzungsprozess.

WordPress verwendet intern die Funktion `map_meta_cap()``, um eine „Meta Capability“ in eine oder mehrere „primitive Capabilities“ zu übersetzen, die für dieses spezifische Objekt erforderlich sind.

```text
+-----------------------------------------------------------------------+
| Bewertungsfluss einer Meta Capability                                 |
+-----------------------------------------------------------------------+

1. ANFRAGE: current_user_can( 'edit_post', 150 )
       |
       v
2. ÜBERSETZUNG: map_meta_cap() inspiziert den Beitrag 150.
       |
       +-- Wer ist der Autor des Beitrags 150? -> (z. B. Benutzer 5)
       |
       +-- Ist der aktuelle Benutzer der Benutzer 5?
       |      |
       |      +-- JA: Gibt primitives Erfordernis zurück -> ['edit_posts']
       |      |
       |      +-- NEIN: Gibt primitives Erfordernis zurück -> ['edit_others_posts']
       v
3. ENDGÜLTIGE BEWERTUNG: 
   Hat der aktuelle Benutzer die resultierende primitive Capability in 
   seinem in der Datenbank gespeicherten Array?
       |
       +-> Gibt TRUE oder FALSE zurück.

```

Dieses Mapping-System ist extrem flexibel und wird bei der Entwicklung komplexer *Custom Post Types* (CPTs) intensiv genutzt. Wenn dein Plugin ein CPT namens `factura` (Rechnung) registriert, kannst du Meta Capabilities wie `edit_factura` und `read_factura` definieren und konfigurieren, wie sie auf die primitiven Berechtigungen abgebildet werden, was eine immense granulare Kontrolle ermöglicht.

### Strategische Überprüfungspunkte in einem Plugin

Bei der Entwicklung von Plugins finden Capability-Überprüfungen selten im luftleeren Raum statt. Es gibt architektonische Nadelöhre, an denen du diese Validierungen immer implementieren musst:

1. **Registrierung von Administrationsmenüs:** Funktionen wie `add_menu_page()` oder `add_submenu_page()` (behandelt in Kapitel 7) erfordern explizit eine Capability als Argument. WordPress blendet das Menü aus, wenn der Benutzer diese nicht besitzt.
2. **AJAX-Callbacks (Kapitel 9):** Die Hooks `wp_ajax_*` sind tote Winkel, wenn du sie nicht schützt. Selbst wenn du einen Button im Frontend oder im Adminbereich ausblendest, kann ein böswilliger Benutzer eine direkte POST-Anfrage an `admin-ajax.php` senden. Dein PHP-Callback muss in der ersten Zeile `current_user_can()` aufrufen.
3. **Endpunkte der REST-API (Kapitel 13):** Bei der Registrierung einer Route mit `register_rest_route()`, ist das Argument `permission_callback` der exakte und obligatorische Ort, um das Ergebnis einer Capability-Bewertung zurückzugeben.

Die konsistente Verwendung von `current_user_can()` stellt sicher, dass die Geschäftslogik deines Plugins die vom Website-Administrator konfigurierten Hierarchien und Berechtigungen hermetisch respektiert.

## 12.3 Erstellung benutzerdefinierter Rollen

Mit zunehmender Komplexität deiner Plugins passen die Standardrollen von WordPress wahrscheinlich nicht mehr zur Geschäftslogik deines Projekts. Wenn du ein Schulverwaltungs-Plugin entwickelst, kann es semantisch verwirrend und architektonisch einschränkend sein, einem Lehrer die Rolle „Autor“ oder einem Schüler die Rolle „Abonnent“ zuzuweisen.

Die Lösung besteht darin, benutzerdefinierte Rollen zu registrieren, die genaue Benutzerprofile für dein Ökosystem definieren.

### Die Funktion `add_role()`

WordPress stellt die Funktion `add_role()` bereit, um ein neues Profil in das System einzufügen. Ihre Signatur ist recht direkt und erfordert drei Parameter:

1. **`$role` (string):** Der interne Bezeichner oder *Slug* der Rolle (z. B. `gestor_eventos`). Muss Kleinbuchstaben und Unterstriche verwenden.
2. **`$display_name` (string):** Der für Menschen lesbare Name, der in der Administrations-Oberfläche angezeigt wird (z. B. „Event-Manager“). Sollte übersetzbar sein.
3. **`$capabilities` (array):** Ein assoziatives Array, bei dem die Schlüssel die Namen der Capabilities und die Werte Booleans sind (`true`, um die Fähigkeit zu gewähren, `false`, um sie explizit zu verweigern).

### Der häufigste Fehler: Der Ort der Ausführung

Wie wir in Abschnitt 12.1 gesehen haben, werden Rollen dauerhaft in der Datenbank (in der Tabelle `wp_options`) gespeichert. Dies führt zu einer wichtigen architektonischen Regel, die Anfänger von professionellen Entwicklern unterscheidet: **Du solltest eine Rolle niemals in Hooks registrieren, die bei jedem Seitenaufruf ausgeführt werden**, wie `init` oder `admin_init`.

Der Aufruf von `add_role()` bei jeder Anfrage zwingt WordPress dazu, die Datenbank unnötig zu aktualisieren, was die Leistung beeinträchtigt und zu Parallelitätsproblemen führen kann.

Der richtige Ort, um eine Rolle zu registrieren, ist die **Aktivierungsroutine** deines Plugins (behandelt in Kapitel 2). Auf diese Weise erfolgt das Schreiben in die Datenbank nur ein einziges Mal, wenn der Administrator die Erweiterung aktiviert.

```text
+-------------------------------------------------------------+
| Korrekter Lebenszyklus für die Erstellung einer Rolle       |
+-------------------------------------------------------------+

[ Administrator klickt auf „Plugin aktivieren“ ]
       |
       v
[ register_activation_hook ] 
       |
       v
[ Führt aus: add_role() ] ──> Schreibt in wp_options (EINMAL)
       |
       v
[ Plugin aktiv ] 
(Die Rolle existiert bereits in der DB, sie muss nicht in 'init' neu erstellt werden)

```

### Praktische Implementierung bei der Aktivierung

Sehen wir uns an, wie der Code strukturiert wird, um eine Rolle namens „Auditor“ zu erstellen, deren Zweck es ist, alle Inhalte lesen und auf das Dashboard zugreifen zu können, ohne jedoch irgendetwas ändern zu dürfen.

```php
/**
 * Aktivierungs-Callback des Plugins.
 */
function devplugin_activacion_crear_roles() {
    // Wir definieren die initialen Capabilities der Rolle
    $capacidades_auditor = array(
        'read'         => true,  // Erlaubt den Zugriff auf das Dashboard
        'edit_posts'   => false, // Explizit verweigert
        'delete_posts' => false, // Explizit verweigert
    );

    // Wir registrieren die Rolle in der Datenbank
    add_role(
        'auditor_sistema',
        __( 'Auditor del Sistema', 'devplugin' ),
        $capacidades_auditor
    );
}
// Wir hängen die Funktion an die Aktivierung des Plugins an
register_activation_hook( __FILE__, 'devplugin_activacion_crear_roles' );

```

Wenn bei der Verwendung von `add_role()`, die Rolle bereits in der Datenbank existiert (z. B. wenn das Plugin deaktiviert und wieder aktiviert wurde und die Rolle nicht gelöscht wurde), schlägt die Funktion geräuschlos fehl und gibt `null` zurück. Dies verhindert das Überschreiben von Capabilities, die ein Administrator nachträglich geändert haben könnte.

### Eine bestehende Rolle klonen

In vielen Fällen möchtest du nicht Dutzende von primitiven Capabilities für eine Rolle, die fast identisch mit einer Standardrolle ist, von Grund auf neu schreiben. Du kannst die Funktion `get_role()` nutzen, um die Capabilities einer bestehenden Rolle zu extrahieren und sie als Basis zu verwenden.

```php
function devplugin_activacion_clonar_editor() {
    // Wir holen das Objekt der Rolle Editor
    $rol_editor = get_role( 'editor' );
    
    if ( null !== $rol_editor ) {
        // Wir klonen ihre Capabilities
        add_role(
            'editor_avanzado',
            __( 'Editor Avanzado', 'devplugin' ),
            $rol_editor->capabilities
        );
    }
}

```

### Bereinigung während der Deaktivierung oder Deinstallation

Die Datenbank sauber zu halten, ist ein Zeichen für professionellen Code. Wenn dein Plugin exklusive Rollen erstellt, ist es üblich, diese zu löschen, wenn das Plugin über `remove_role( $role )` deinstalliert wird.

Je nach Art deines Plugins kannst du dich entscheiden, die Rolle bei der Deaktivierung (Deaktivierungs-Hook) zu löschen oder sie aufzubewahren, bis der Benutzer das Plugin vollständig entfernt (Datei `uninstall.php`).

```php
/**
 * Deinstallations- oder Deaktivierungs-Callback.
 */
function devplugin_limpiar_roles() {
    // Löscht die Rolle aus der Datenbank
    remove_role( 'auditor_sistema' );
}
// In einem realen Szenario würde dies in register_deactivation_hook oder uninstall.php stehen

```

*Vorsichtshinweis:* Wenn du eine Rolle löschst, verlieren die Benutzer, denen sie zugewiesen war, nicht ihr Konto, stehen jedoch ohne gültige Rolle im System da (ihre vorherigen Capabilities verschwinden). Wenn dein Plugin Rollen bei der Deinstallation löscht, ist es eine gute Praxis, diese Benutzer vor der Ausführung von `remove_role()` einer Standardrolle wie `subscriber` (Abonnent) neu zuzuweisen.

## 12.4 Zuweisung eigener Berechtigungen

Das Erstellen benutzerdefinierter Rollen von Grund auf ist für geschlossene Architekturen nützlich, aber bei der großen Mehrheit der kommerziellen Plugins besteht das Ziel darin, sich in die bestehende Struktur zu integrieren. Wenn dein Plugin eine neue Optionsseite oder einen *Custom Post Type* (CPT) hinzufügt, ist es ideal, **eigene Capabilities** (z. B. `gestionar_ajustes_devplugin`, `edit_facturas`) zu definieren und sie selektiv den Standardrollen zuzuweisen, für die dies sinnvoll ist (wie dem Administrator und dem Editor).

### Injizieren von Capabilities in bestehende Rollen

Der Prozess zum Hinzufügen einer Capability zu einer bestehenden Rolle erfolgt über die Methode `add_cap()` der Klasse `WP_Role`.

Ebenso wie bei der Erstellung von Rollen (Abschnitt 12.3) verändert die Zuweisung von Capabilities das in der Tabelle `wp_options` gespeicherte serialisierte Array. Daher **darf diese Operation ausschließlich während der Aktivierungsroutine des Plugins ausgeführt werden**, niemals in Hooks mit kontinuierlicher Ausführung wie `init`.

Das folgende Codemuster veranschaulicht, wie man beim Aktivieren des Plugins eigene Berechtigungen in die Rollen Administrator und Editor injiziert:

```php
/**
 * Aktivierungs-Callback: Eigene Capabilities zuweisen.
 */
function devplugin_activacion_asignar_capacidades() {
    // 1. Capability dem Administrator zuweisen
    $rol_admin = get_role( 'administrator' );
    if ( $rol_admin ) {
        // Wir geben ihm die volle Kontrolle über das Plugin
        $rol_admin->add_cap( 'gestionar_ajustes_devplugin' );
        $rol_admin->add_cap( 'borrar_datos_devplugin' );
    }

    // 2. Eingeschränkte Capability dem Editor zuweisen
    $rol_editor = get_role( 'editor' );
    if ( $rol_editor ) {
        // Der Editor kann die Einstellungen verwalten, aber keine Massendaten löschen
        $rol_editor->add_cap( 'gestionar_ajustes_devplugin' );
    }
}
register_activation_hook( __FILE__, 'devplugin_activacion_asignar_capacidades' );

```

Es ist ein häufiger Fehler anzunehmen, dass die Rolle `administrator` magisch jede neue Capability erhält, die du dir ausdenkst. Wenn du `current_user_can('mi_capacidad_secreta')` verwendest und sie dem Administrator nicht explizit zugewiesen hast (oder sie auf eine native Capability wie `manage_options` abgebildet hast), wird selbst dem Administrator der Website der Zugriff verweigert.

### Bereinigung von Capabilities bei der Deinstallation

Ebenso wie es in deiner Verantwortung liegt, diese Capabilities hinzuzufügen, solltest du ein guter Bürger des Ökosystems sein und sie entfernen, wenn dein Plugin aus dem System gelöscht wird. Dies wird erreicht, indem du über die Rollen iterierst und die Schwestermethode `remove_cap()` verwendest.

```php
/**
 * Deinstallationsroutine (idealerweise in uninstall.php)
 */
function devplugin_desinstalacion_limpiar_capacidades() {
    $roles_a_limpiar = array( 'administrator', 'editor' );
    $capacidades_propias = array( 'gestionar_ajustes_devplugin', 'borrar_datos_devplugin' );

    foreach ( $roles_a_limpiar as $slug ) {
        $rol = get_role( $slug );
        if ( $rol ) {
            foreach ( $capacidades_propias as $cap ) {
                $rol->remove_cap( $cap );
            }
        }
    }
}

```

### Zuweisung von Berechtigungen an bestimmte Benutzer

Das System für Rollen und Capabilities in WordPress hat noch eine weitere Ebene Tiefe: Capabilities werden nicht nur Rollen zugewiesen, sondern können **direkt einem einzelnen Benutzer zugewiesen werden**.

Wenn wir einen Benutzer bewerten, baut WordPress seine Berechtigungen auf, indem es die Capabilities der Rolle(n), die er besitzt, mit den individuellen Capabilities zusammenführt, die ihm explizit in der Tabelle `wp_usermeta` zugewiesen wurden.

```text
+-----------------------------------------------------------------+
| Endgültige Auflösung der Capabilities eines Benutzers           |
+-----------------------------------------------------------------+

[ Capabilities der Rolle ]  +  [ Capabilities des Benutzers ] = [ Gesamtberechtigungen ]
(Generisch geerbt)             (Individuell zugewiesen)         (Bei Ausführung bewertet)

Praktisches Beispiel (Benutzer-ID: 15, Rolle: Abonnent):
[ read: true ]              +  [ upload_files: true ]         = [ read: true, upload_files: true ]

```

Dies ist extrem leistungsstark für außergewöhnliche Anwendungsfälle. Wenn du beispielsweise 100 Benutzer mit der Rolle „Autor“ hast, aber möchtest, dass nur einer von ihnen (weil er der hervorgehobene Autor des Monats ist) zusätzlich Beiträge ohne Überprüfung veröffentlichen kann (`publish_posts`), musst du keine neue Rolle namens „Hervorgehobener Autor“ erstellen. Du weist die Capability einfach diesem speziellen Benutzer über die Klasse `WP_User` zu.

```php
/**
 * Beispiel: Einem bestimmten Benutzer eine Sonderberechtigung erteilen.
 * Dies wird normalerweise als Reaktion auf ein Formular oder eine Aktion im Adminbereich ausgeführt.
 */
function devplugin_promocionar_usuario_especifico( $user_id ) {
    $usuario = new WP_User( $user_id );
    
    // Wir überprüfen, ob der Benutzer existiert
    if ( $usuario->exists() ) {
        // Wir erteilen ihm die Capability unabhängig von seiner Rolle
        $usuario->add_cap( 'publish_posts' );
    }
}

/**
 * Beispiel: Einem bestimmten Benutzer eine Sonderberechtigung entziehen.
 */
function devplugin_castigar_usuario_especifico( $user_id ) {
    $usuario = new WP_User( $user_id );
    
    if ( $usuario->exists() ) {
        // Man kann remove_cap verwenden, um individuelle Capabilities zu entfernen,
        // o false, um eine Capability, die seine Rolle ihm gibt, explizit zu verweigern.
        $usuario->add_cap( 'upload_files', false ); 
    }
}

```

Du wirst die Verwendung von `$usuario->add_cap( 'upload_files', false )` bemerken. Dies fügt die Capability in das Benutzerprofil ein, jedoch mit einem booleschen Falschwert. Bei der Konfliktlösung in WordPress **überschreibt eine auf Benutzerebene explizit verweigerte Capability immer dieselbe Capability, die auf Rollenebene gewährt wurde**. Dies ist der perfekte Weg, um einen Benutzer von einer bestimmten Aktion auszuschließen, ohne seine Hauptrolle zu ändern oder andere Benutzer derselben Stufe zu beeinträchtigen.

## Zusammenfassung des Kapitels

In diesem Kapitel haben wir das rollenbasierte Zugriffskontrollsystem (RBAC) von WordPress analysiert, ein grundlegendes Element zur Gewährleistung der betrieblichen und strukturellen Sicherheit deiner Plugins. Wir haben festgestellt, dass die unumstößliche Regel darin besteht, immer Capabilities (`current_user_can`) zu bewerten und sich niemals auf die Namen der Rollen zu verlassen. Wir haben verstanden, dass sowohl Rollen als auch die ihnen zugeordneten Capabilities in der Datenbank verbleiben, was uns dazu zwingt, mit ihnen über die Funktionen `add_role`, `remove_role`, `add_cap` und `remove_cap` ausschließlich während der Aktivierungs- und Deinstallationszyklen des Plugins zu interagieren. Schließlich haben wir gesehen, wie das System eine absolute Granularität ermöglicht, indem es erlaubt, benutzerdefinierte Capabilities in bestehende Rollen zu injizieren oder Ausnahmeberechtigungen auf der Ebene einzelner Benutzer zu erstellen, was die Erstellung hochgradig personalisierter und sicherer Workflows erleichtert.
