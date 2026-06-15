Das Erstellen einer Benutzeroberfläche im Administrationsbereich ist der sichtbarste Meilenstein bei der Entwicklung eines Plugins. In diesem Kapitel werden wir die strengen Standards des WordPress-Cores übernehmen, um professionelle Benutzererfahrungen zu gestalten. Wir lernen, Menüs und Submenüs über die native API zu registrieren und dabei eine korrekte Hierarchie sowie eine strikte, auf Berechtigungen (Capabilities) basierende Zugriffskontrolle sicherzustellen. Zudem werden wir das bedingte Laden (Enqueueing) von Scripts und Styles beherrschen, um die Gesamt-Performance des Backends zu schonen. Schließlich strukturieren wir unsere Views mithilfe der nativen CSS-Klassen des Cores, was eine konsistente, barrierefreie und anpassungsfähige User Experience (UX) garantiert.

## 7.1 Hauptmenüs hinzufügen

Das Administrations-Ökosystem von WordPress stellt einen spezifischen Initialisierungsfluss für die Benutzeroberfläche des Backends bereit. Das Einfügen eines Elements in die Wurzel des seitlichen Navigationsmenüs im Dashboard wird zentral über den Action-Hook `admin_menu` gesteuert. Während dieser Ausführungsphase instanziiert und befüllt WordPress die globalen Variablen `$menu` und `$submenu`, bei denen es sich um zweidimensionale Arrays handelt, die für die Strukturierung des internen Navigationsbaums zuständig sind.

Es wird davon abgeraten, diese Variablen direkt zu manipulieren, da dies die zukünftige Kompatibilität beeinträchtigt. Stattdessen stellt der Core die Administration Pages API bereit, deren Hauptkomponente für Hauptmenüs die Funktion `add_menu_page()` ist.

### Ausführungs- und Initialisierungsfluss

Das folgende Diagramm veranschaulicht den Lebenszyklus einer Anfrage im Backend und den genauen Zeitpunkt, an dem benutzerdefinierte Menüs registriert werden müssen:

```text
 Eingehende Anfrage an /wp-admin/
               |
               v
    [ plugins_loaded ]  --> Laden der Hauptdateien des Plugins
               |
               v
      [ init ]          --> Allgemeine Initialisierung von WordPress
               |
               v
    [ admin_menu ]       --> Ausführung von add_menu_page() und add_submenu_page()
               |
               v
  [ current_screen ]     --> Der Core ermittelt den aktuellen Admin-Bildschirm
               |
               v
   HTML-Rendering       --> Ausführung des dem Menü zugewiesenen Callbacks

```

Das Registrieren eines Menüs außerhalb des Hooks `admin_menu` (zum Beispiel in `init` oder `plugins_loaded`) führt zu Konsistenzproblemen. Dies hat zur Folge, dass die Berechtigungsprüfungen fehlschlagen oder das Menü nicht gerendert wird, da die globalen Strukturen zu diesem Zeitpunkt noch nicht initialisiert wurden.

### Anatomie von `add_menu_page()`

Die Funktion wird im Core von WordPress (`wp-admin/includes/plugin.php`) unter der folgenden Signatur definiert:

```php
function add_menu_page(
    string $page_title,
    string $menu_title,
    string $capability,
    string $menu_slug,
    callable $callback = '',
    string $icon_url = '',
    int|float $position = null
): string { ... }

```

#### Detaillierte Analyse der Parameter

1. **`$page_title` (string):** Der Text, der in das `<title>`-Tag des HTML-Dokuments eingefügt wird, wenn der Benutzer auf diese Administrationsseite navigiert. Dies ist entscheidend für die Barrierefreiheit und das interne SEO.
2. **`$menu_title` (string):** Der lesbare Text, der direkt im linken Navigationsmenü des WordPress-Dashboards angezeigt wird.
3. **`$capability` (string):** Die Berechtigung oder die Mindestrolle, die erforderlich ist, damit dieses Menü für einen Benutzer sichtbar und zugänglich ist. WordPress führt eine automatische Überprüfung mittels `current_user_can()` durch. Wenn der Benutzer diese Berechtigung nicht besitzt, wird das Menü automatisch ausgeblendet, und Versuche des direkten Zugriffs geben einen HTTP-Fehler 403 (Nicht autorisiert) zurück.
4. **`$menu_slug` (string):** Die eindeutige Kennung für dieses Menü. Es sollte ein bereinigter String sein (alphanumerische Zeichen, Bindestriche oder Unterstriche). Wenn kein `$callback`-Parameter angegeben ist, muss dieser Slug mit dem Namen einer PHP-Datei innerhalb des Plugins übereinstimmen. Eine saubere Architektur verlangt jedoch die Verwendung eines semantischen Slugs und die Handhabung des Renderings über einen expliziten Callback.
5. **`$callback` (callable):** Die Funktion oder Klassenmethode, die für das Rendern der HTML-Oberfläche der Administrationsseite zuständig ist.
6. **`$icon_url` (string):** Definiert das visuelle Erscheinungsbild des Menüsymbols. Unterstützt drei Varianten:

* Der Name einer Dashicons-Klasse (z. B. `'dashicons-admin-generic'`).
* Eine absolute URL zu einem Rasterbild oder einer SVG-Datei.
* Ein Base64-codierter String mit einem SVG-Datenschema (Data-URI), ideal zur Vermeidung zusätzlicher HTTP-Anfragen.

7. **`$position` (int|float):** Die numerische Reihenfolge, in der das Menü in der Seitenleiste erscheint. WordPress verwendet ein Sortiersystem, das auf Ganzzahlen von klein nach groß basiert.

#### Standard-Positionsdaten des Cores

Um Kollisionen mit nativen Elementen zu vermeiden, ist es unerlässlich, die numerische Verteilung des `$menu`-Arrays zu verstehen:

| Position | Natives Menüelement |
| --- | --- |
| **2** | Dashboard |
| **4** | *Erster Trenner der Leiste* |
| **5** | Beiträge (Posts) |
| **10** | Medien (Media) |
| **15** | Links (Links - Veraltet) |
| **20** | Seiten (Pages) |
| **25** | Kommentare (Comments) |
| **59** | *Zweiter Trenner der Leiste* |
| **60** | Design (Appearance) |
| **65** | Plugins |
| **70** | Benutzer (Users) |
| **75** | Werkzeuge (Tools) |
| **80** | Einstellungen (Settings) |
| **99** | *Dritter Trenner der Leiste* |

Wenn zwei Plugins ein Menü an genau derselben Position unter Verwendung von Ganzzahlwerten registrieren, überschreibt das zuletzt geladene Plugin das vorherige in der globalen Variable und blendet es im Panel aus. Um dieses Risiko zu minimieren, erlaubt die API die Verwendung von Dezimalzahlen (zum Beispiel `25.32`), was die Wahrscheinlichkeit einer Kollision drastisch verringert.

### Objektorientierte Implementierung unter strengen Standards

Im Folgenden wird eine robuste Implementierung unter Verwendung von striktem Typdesign (PHP 8.0+) und einer in einer Controller-Klasse gekapselten Struktur innerhalb der Plugin-Architektur beschrieben.

```php
<?php
declare(strict_types=1);

namespace CustomPlugin\Admin;

/**
 * Klasse zur Verwaltung des Hauptmenüs im Administrationsbereich.
 */
class AdminMenuController 
{
    /**
     * @var string Eindeutige Kennung des Menüs.
     */
    private const MENU_SLUG = 'custom-plugin-dashboard';

    /**
     * Initialisiert die WordPress-Hooks.
     */
    public function register(): void 
    {
        add_action('admin_menu', [$this, 'addMainMenuPage']);
    }

    /**
     * Registriert das Hauptmenü über die native API von WordPress.
     */
    public function addMainMenuPage(): void 
    {
        // Benutzerdefiniertes SVG-Icon zur Vermeidung von HTTP-Anfragen
        $customIcon = 'data:image/svg+xml;base64,' . base64_encode(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="%23a7aaad">' .
            '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd"/>' .
            '</svg>'
        );

        add_menu_page(
            __('Plugin-Dashboard', 'custom-plugin'),             // Page Title
            __('Mein Plugin', 'custom-plugin'),                  // Menu Title
            'manage_options',                                    // Erforderliche Capability
            self::MENU_SLUG,                                     // Menu Slug
            [$this, 'renderAdminPage'],                          // Render-Callback
            $customIcon,                                         // Icon-URL oder String
            26.5                                                 // Position (Direkt unter Kommentaren)
        );
    }

    /**
     * Callback, der für das Rendern der Benutzeroberfläche im Panel zuständig ist.
     * * Garantiert die strukturelle Sicherheit durch implizite Prüfung
     * der Capabilities vor jeder Datenausgabe.
     */
    public function renderAdminPage(): void 
    {
        // Zweifache passive Sicherheitsüberprüfung
        if (!current_user_can('manage_options')) {
            wp_die(__('Du hast nicht genügend Berechtigungen, um auf diese Seite zuzugreifen.', 'custom-plugin'), '', [
                'response' => 403
            ]);
        }

        ?>
        <div class="wrap">
            <h1><?php echo esc_html(__('Allgemeine Einstellungen meines Plugins', 'custom-plugin')); ?></h1>
            <div class="notice notice-info">
                <p><?php echo esc_html(__('Willkommen in der zentralen Konfigurationsumgebung.', 'custom-plugin')); ?></p>
            </div>
            <div class="card">
                <h2><?php echo esc_html(__('Systemstatus', 'custom-plugin')); ?></h2>
                <p><?php echo esc_html(__('Verwende die Tabs oben, wenn in den folgenden Abschnitten Submenüs konfiguriert werden.', 'custom-plugin')); ?></p>
            </div>
        </div>
        <?php
    }
}

```

### Kritische Sicherheits- und Architekturüberlegungen

* **Isolierung des Callbacks:** Führe niemals schwere Geschäftslogik, Datenbankänderungen oder Formularverarbeitung direkt innerhalb der Methode `$callback` ohne explizite Nonce-Überprüfung und vorherige Bereinigung aus. Der Callback sollte ausschließlich als Präsentationsschicht (View) behandelt werden.
* **Richtige Verwendung von Capabilities:** Vermeide es, Rollennamen (z. B. `'administrator'`) an den Parameter `$capability` zu übergeben. Das Framework erfordert abstrakte Fähigkeiten (`'manage_options'`, `'edit_posts'`, `'activate_plugins'`), um die Kompatibilität mit Plugins zur benutzerdefinierten Rollenverwaltung und Multisite-Architekturen sicherzustellen.
* **Internationalisierung (i18n):** Sowohl der Seitentitel als auch der Menütitel müssen durch die Lokalisierungsfunktionen (`__()` oder `_e()`) geleitet werden. Der Parameter `$menu_slug` darf jedoch niemals übersetzt werden, da er als statischer Bezeichner der URL-Route dient (`wp-admin/admin.php?page=custom-plugin-dashboard`). Wenn der Slug übersetzt wird, bricht das Routing ab, sobald sich die Sprache des Benutzerprofils ändert.

## 7.2 Erstellung von Submenüs

Sobald der Hauptankerpunkt im Administrationsbereich eingerichtet ist, ist es bei komplexen Plugins üblich, die Optionen zu verzweigen, um eine Überladung eines einzelnen Bildschirms zu vermeiden. WordPress verwaltet diese Hierarchie über die Funktion `add_submenu_page()`, die neue Oberflächen an ein bestehendes Elternmenü bindet — sei es ein natives Core-Menü oder ein von deinem Plugin erstelltes benutzerdefiniertes Menü.

### Hierarchie und Routing

Das Menü-Ökosystem von WordPress ist streng zweistufig. Es gibt keine native Unterstützung für Sub-Submenüs. Der interne Navigationsbaum wird aufgebaut, indem der Parameter `$menu_slug` eines Elternmenüs mit dem Parameter `$parent_slug` seiner Kind-Elemente verknüpft wird.

```text
  Navigationsbaum des Panels
                |
  [ Haupt-Elternmenü ] ---- Slug: 'custom-plugin-dashboard'
                |
                +-- [ Dashboard ]  <-- Kind-Slug stimmt mit Elternteil überein ('custom-plugin-dashboard')
                |
                +-- [ Einstellungen ]    <-- Slug: 'custom-plugin-settings'
                |
                +-- [ Lizenz ]   <-- Slug: 'custom-plugin-license'

```

### Anatomie von `add_submenu_page()`

Die Funktionssignatur führt wesentliche Unterschiede zur Erstellung von Hauptmenüs ein:

```php
function add_submenu_page(
    string $parent_slug,
    string $page_title,
    string $menu_title,
    string $capability,
    string $menu_slug,
    callable $callback = '',
    int|float $position = null
): string|false { ... }

```

Der kritische Parameter hier ist `$parent_slug`. Je nachdem, wo du das Submenü platzieren möchtest, ändert sich dieser Wert drastisch.

#### Verknüpfung mit nativen Menüs

Wenn dein Plugin einen einzigen Zweck hat oder kein eigenes Hauptmenü benötigt, is es eine hervorragende UX-Praxis, seine Einstellungen in bestehenden nativen Menüs zu verankern. WordPress stellt den Slug der internen Admin-PHP-Dateien als `$parent_slug` bereit, ebenso wie Wrapper-Funktionen zur Erleichterung des Prozesses:

| Ziel-Core-Menü | Wert von `$parent_slug` | Äquivalente Wrapper-Funktion |
| --- | --- | --- |
| **Einstellungen** | `options-general.php` | `add_options_page()` |
| **Werkzeuge** | `tools.php` | `add_management_page()` |
| **Design** | `themes.php` | `add_theme_page()` |
| **Plugins** | `plugins.php` | `add_plugins_page()` |
| **Benutzer** | `users.php` | `add_users_page()` |
| **Beiträge** | `edit.php` | `add_posts_page()` |
| **Seiten** | `edit.php?post_type=page` | `add_pages_page()` |
| **Custom Post Type** | `edit.php?post_type=mi_cpt` | N/A (`add_submenu_page` verwenden) |

### Das Verhalten des „ersten Submenüs“

Wenn du ein Hauptmenü mit `add_menu_page()` registrierst, WordPress automatisch ein erstes untergeordnetes Submenü mit demselben Namen und Slug wie das Elternmenü erstellt. Wenn du möchtest, dass dieser erste Link als allgemeine Übersicht fungiert und einen anderen Titel im Submenü hat (zum Beispiel den Titel „Mein Plugin“ des Elternmenüs im Submenü in „Übersicht“ ändern), musst du ein explizites Submenü registrieren, bei dem `$parent_slug` und `$menu_slug` identisch mit dem Slug des Elternmenüs sind.

### Praktische objektorientierte Implementierung

Als Erweiterung der Architektur aus der vorherigen Lektion wird im Folgenden beschrieben, wie du mehrere Submenüs registrierst: eines, das an unser benutzerdefiniertes Menü gebunden ist, und ein anderes, das in das native Einstellungsmenü von WordPress eingefügt wird.

```php
<?php
declare(strict_types=1);

namespace CustomPlugin\Admin;

class AdminSubmenuController 
{
    private const PARENT_SLUG = 'custom-plugin-dashboard';

    public function register(): void 
    {
        // Hängt sich an admin_menu, genau wie das Hauptmenü.
        // Es wird empfohlen, eine höhere Priorität zu verwenden (z. B. 11), wenn das
        // Elternmenü im selben Hook mit Standardpriorität registriert wird.
        add_action('admin_menu', [$this, 'registerSubmenus'], 11);
    }

    public function registerSubmenus(): void 
    {
        // 1. Überschreiben des ersten automatischen Submenüs
        // Durch Verwendung desselben PARENT_SLUG als menu_slug definieren wir den Titel neu
        add_submenu_page(
            self::PARENT_SLUG,
            __('Plugin-Übersicht', 'custom-plugin'),
            __('Übersicht', 'custom-plugin'),
            'manage_options',
            self::PARENT_SLUG, // Stimmt mit dem Eltern-Slug überein
            [$this, 'renderDashboardView']
        );

        // 2. Hinzufügen eines zusätzlichen Submenüs zum benutzerdefinierten Menü
        add_submenu_page(
            self::PARENT_SLUG,
            __('Erweiterte Einstellungen', 'custom-plugin'),
            __('Erweitert', 'custom-plugin'),
            'manage_options',
            'custom-plugin-advanced',
            [$this, 'renderAdvancedView']
        );

        // 3. Einbinden eines Views in ein natives Menü (Einstellungen)
        add_options_page(
            __('Plugin-Integration', 'custom-plugin'),
            __('Mein Plugin (Core)', 'custom-plugin'),
            'manage_options',
            'custom-plugin-core-settings',
            [$this, 'renderCoreSettingsView']
        );
    }

    public function renderDashboardView(): void 
    {
        $this->enforceCapabilities();
        echo '<div class="wrap"><h1>' . esc_html(__('Übersicht', 'custom-plugin')) . '</h1></div>';
    }

    public function renderAdvancedView(): void 
    {
        $this->enforceCapabilities();
        echo '<div class="wrap"><h1>' . esc_html(__('Erweiterte Optionen', 'custom-plugin')) . '</h1></div>';
    }

    public function renderCoreSettingsView(): void 
    {
        $this->enforceCapabilities();
        echo '<div class="wrap"><h1>' . esc_html(__('Einstellungen im Core', 'custom-plugin')) . '</h1></div>';
    }

    /**
     * Hilfsmethode zur Zentralisierung der Sicherheitsüberprüfung.
     */
    private function enforceCapabilities(): void 
    {
        if (!current_user_can('manage_options')) {
            wp_die(__('Zugriff verweigert.', 'custom-plugin'), '', ['response' => 403]);
        }
    }
}

```

### Architekturmuster für versteckte Menüs

Bei der Entwicklung von Plugins besteht häufig die Notwendigkeit, Administrationsseiten zu erstellen, die nicht in der seitlichen Navigationsleiste aufgeführt werden sollen (z. B. ein temporärer Bildschirm zur Anzeige eines Fehlerprotokolls oder ein *Onboarding*-Prozess nach der Aktivierung).

Um eine Seite zu registrieren, ohne dass sie ein sichtbares Element im Menü erzeugt, wird ein API-„Trick“ angewendet, indem dem Parameter `$parent_slug` der Wert `null` übergeben wird:

```php
add_submenu_page(
    null, // Lässt das Einfügen in das visuelle Menü aus
    __('Willkommen beim Plugin', 'custom-plugin'),
    __('Willkommen', 'custom-plugin'),
    'manage_options',
    'custom-plugin-welcome',
    [$this, 'renderWelcomeScreen']
);

```

Die Seite ist voll funktionsfähig und sicher, kann aber nur durch direktes Aufrufen der entsprechenden URL aufgerufen werden: `wp-admin/admin.php?page=custom-plugin-welcome`.

## 7.3 Laden (Enqueueing) von Scripts und Styles

Das direkte Einfügen von `<script>`- oder `<link>`-Tags in den HTML-Code ist eine der schlechtesten Praktiken in der WordPress-Entwicklung. Dieser Ansatz zerstört die Modularität, verhindert eine zentralisierte Minifizierung, erzeugt Abhängigkeitskonflikte (z. B. das Laden mehrerer jQuery-Versionen) und umgeht die Caching-Mechanismen des Browsers.

Um dies zu lösen, implementiert WordPress die **Enqueue API**, ein Abhängigkeitsverwaltungssystem, das sicherstellt, dass Ressourcen (Assets) in der richtigen Reihenfolge, nur bei Bedarf und unter Berücksichtigung der im Cache gespeicherten Versionen geladen werden.

### Der Hook `admin_enqueue_scripts`

Im Administrationsbereich ist der Hook `admin_enqueue_scripts` für das Registrieren und Einreihen von Ressourcen zuständig. Im Gegensatz zu seinem Frontend-Pendant (`wp_enqueue_scripts`) übergibt dieser Hook einen äußerst wichtigen Parameter an die Callback-Funktion: das **`$hook_suffix`** (auch bekannt als `$hook` oder einfach der Bezeichner des aktuellen Bildschirms).

Das Laden der Skripte deines Plugins auf *allen* Seiten des Administrations-Dashboards (wie auf dem Beitrags-Bearbeitungsbildschirm oder in den allgemeinen Einstellungen) ist ein Verstoß gegen Performance und Sicherheit. Du musst das Laden deiner Ressourcen ausschließlich auf die Oberflächen beschränken, die dein Plugin generiert.

### Der bedingte Lade-Workflow

Das folgende Diagramm veranschaulicht den Validierungsprozess zum gezielten Laden von Ressourcen:

```text
    Anfrage an /wp-admin/admin.php?page=mi-plugin
                     |
        [ admin_enqueue_scripts ] ausgelöst
                     |
         Übergibt $hook_suffix (z. B. 'toplevel_page_mi-plugin')
                     |
            +-------------------+
            | Stimmt            |
            | $hook_suffix mit  | ---> NEIN ---> [ Laden abbrechen ] (Ende)
            | unserer Seite     |
            | überein?          |
            +-------------------+
                     |
                    JA
                     v
        1. wp_register_script() / wp_register_style()
        2. wp_localize_script() (Datenübergabe von PHP an JS)
        3. wp_enqueue_script()  / wp_enqueue_style()

```

### Hauptfunktionen der API

Die API trennt das „Registrieren“ konzeptionell vom „Laden“ (Enqueueing), obwohl beides gleichzeitig durchgeführt werden kann.

1. **`wp_register_style()` / `wp_register_script()`:** Weist WordPress auf die Existenz einer Datei, ihre Abhängigkeiten und ihre Version hin, fügt sie aber nicht in das HTML ein. Ideal für Ressourcen, die bei Bedarf über Shortcodes oder Blöcke geladen werden könnten.
2. **`wp_enqueue_style()` / `wp_enqueue_script()`:** Fügt die Ressource tatsächlich in den `<head>` oder direkt vor dem schließenden `<body>` ein. Wenn die Datei zuvor nicht registriert wurde, registriert und lädt diese Funktion sie in einem einzigen Schritt.

### Objektorientierte Implementierung: Erfassung des Suffix

Um bedingt zu laden, müssen wir die eindeutige Kennung kennen, die WordPress unserer Seite beim Erstellen zuweist. Funktionen wie `add_menu_page()` und `add_submenu_page()` erstellen nicht nur das Menü, sondern **geben einen String zurück**, der das `$hook_suffix` dieser Schnittstelle darstellt.

Das folgende Architekturmuster erfasst diesen String in einer Eigenschaft der Klasse, um ihn später bei der Validierung des Ladevorgangs zu verwenden:

```php
<?php
declare(strict_types=1);

namespace CustomPlugin\Admin;

class AdminAssetsController 
{
    private const MENU_SLUG = 'custom-plugin-dashboard';
    
    /**
     * @var string Speichert den eindeutigen Bezeichner der Plugin-Seite.
     */
    private string $pageHook = '';

    public function register(): void 
    {
        // 1. Menü registrieren
        add_action('admin_menu', [$this, 'addMainMenuPage']);
        
        // 2. Enqueue-Hook registrieren
        add_action('admin_enqueue_scripts', [$this, 'enqueueAdminAssets']);
    }

    public function addMainMenuPage(): void 
    {
        // Wir erfassen den von add_menu_page zurückgegebenen String
        $this->pageHook = add_menu_page(
            __('Dashboard', 'custom-plugin'),
            __('Mein Plugin', 'custom-plugin'),
            'manage_options',
            self::MENU_SLUG,
            [$this, 'renderAdminPage'],
            'dashicons-admin-generic',
            30
        );
    }

    /**
     * @param string $hook_suffix Der Bezeichner des aktuellen Bildschirms im Admin.
     */
    public function enqueueAdminAssets(string $hook_suffix): void 
    {
        // Guard-Validierung: Wenn wir uns nicht auf der Plugin-Seite befinden, brechen wir ab.
        if ($hook_suffix !== $this->pageHook) {
            return;
        }

        $plugin_url = plugin_dir_url(dirname(__FILE__, 2));
        $plugin_path = plugin_dir_path(dirname(__FILE__, 2));

        // Laden von Stylesheets (CSS)
        // filemtime() fungiert als automatischer Cache-Buster (Version = Änderungs-Timestamp)
        wp_enqueue_style(
            'custom-plugin-admin-css',
            $plugin_url . 'assets/css/admin-style.css',
            [], // Keine CSS-Abhängigkeiten
            (string) filemtime($plugin_path . 'assets/css/admin-style.css'),
            'all' // Media (all, screen, print)
        );

        // Laden von Skripten (JS)
        wp_enqueue_script(
            'custom-plugin-admin-js',
            $plugin_url . 'assets/js/admin-script.js',
            ['jquery'], // Hängt von jQuery ab (wird vor unserem Skript geladen)
            (string) filemtime($plugin_path . 'assets/js/admin-script.js'),
            true // true = in den Footer injizieren (vor </body>)
        );

        // Brücke PHP -> JavaScript
        $this->localizeScriptData();
    }

    /**
     * Injiziert dynamische PHP-Variablen in das globale JavaScript-Objekt.
     */
    private function localizeScriptData(): void 
    {
        wp_localize_script(
            'custom-plugin-admin-js', // Muss mit dem Handle des geladenen Skripts übereinstimmen
            'CustomPluginData',       // Name des globalen Objekts, das in JS existieren wird
            [
                'ajaxUrl'   => admin_url('admin-ajax.php'),
                'nonce'     => wp_create_nonce('custom_plugin_admin_action'),
                'i18n'      => [
                    'confirmDelete' => __('Bist du sicher, dass du diesen Eintrag löschen möchtest?', 'custom-plugin'),
                    'saveSuccess'   => __('Einstellungen erfolgreich gespeichert.', 'custom-plugin')
                ]
            ]
        );
    }

    public function renderAdminPage(): void 
    {
        // Render-Logik (View)
        echo '<div class="wrap"><h1>Panel</h1></div>';
    }
}

```

### Die Datenbrücke: `wp_localize_script()`

Wie in der Methode `$this->localizeScriptData()` zu sehen ist, externe JavaScript-Dateien statisch sind und PHP-Code nicht direkt interpretieren können. Um dynamische Routenkonfigurationen (wie die AJAX-URL), Sicherheits-Token (Nonces) oder übersetzbare Textzeichenfolgen zu übergeben, wird `wp_localize_script()` verwendet.

WordPress fügt einen eingebetteten `<script>`-Block direkt über deiner `admin-script.js`-Datei mit folgendem Ergebnis im HTML des Panels ein:

```html
<script type="text/javascript">
/* <![CDATA[ */
var CustomPluginData = {
    "ajaxUrl": "https://meinedomain.de/wp-admin/admin-ajax.php",
    "nonce": "a1b2c3d4e5",
    "i18n": {
        "confirmDelete": "Bist du sicher, dass du diesen Eintrag löschen möchtest?",
        "saveSuccess": "Einstellungen erfolgreich gespeichert."
    }
};
/* ]]> */
</script>
<script type="text/javascript" src="https://meinedomain.de/wp-content/plugins/mi-plugin/assets/js/admin-script.js?ver=1684501200" id="custom-plugin-admin-js-js"></script>

```

In deiner Datei `admin-script.js` ist das Objekt nun nativ zur sicheren Nutzung verfügbar:

```javascript
(function($) {
    'use strict';

    $(document).ready(function() {
        $('.delete-btn').on('click', function(e) {
            e.preventDefault();
            // Nutzung der aus PHP injizierten Übersetzungen
            if (confirm(CustomPluginData.i18n.confirmDelete)) {
                // Mit AJAX-Anfrage unter Verwendung von CustomPluginData.nonce fortfahren
            }
        });
    });

})(jQuery);

```

*(Hinweis: In WordPress 4.5+ wurde `wp_add_inline_script` eingeführt, was das Injizieren von komplexerem Inline-JavaScript ermöglicht, und in WP 5.0+ `wp_set_script_translations` für die Verwendung der Standard-JED/JSON-Lokalisierungssysteme von Gutenberg. `wp_localize_script` bleibt jedoch der schnellste, sicherste und abwärtskompatibelste Weg, um mehrdimensionale Konfigurations-Arrays vom Backend an das Frontend zu übertragen).*

## 7.4 Design mit nativen CSS-Klassen

Der größte Fehler beim Design von Administrations-Benutzeroberflächen für WordPress besteht darin, das Rad neu erfinden zu wollen. Ein professionelles Plugin sollte sich wie eine natürliche Erweiterung des Cores anfühlen, nicht wie eine mit Gewalt eingebettete Drittanbieter-Software.

WordPress bietet ein internes CSS-Framework (das automatisch über die Admin-Styles geladen wird), das aus Dutzenden von Hilfsklassen besteht. Die Verwendung dieser Klassen garantiert, dass deine Benutzeroberfläche die vom Benutzer in seinem Profil gewählten Farbschemata respektiert, die Barrierefreiheit (Kontrast und Tastaturnavigation) wahrt und sich automatisch an zukünftige Redesigns des Cores anpasst, ohne dass eine Wartung deinerseits erforderlich ist.

### Container und Basisstruktur

Der gesamte Inhalt einer Administrationsseite muss eingekapselt sein, um sich korrekt an der oberen Leiste und dem seitlichen Menü auszurichten.

* **`.wrap`**: Dies ist der obligatorische Hauptcontainer. Er liefert die notwendigen Abstände (Margin und Padding), um deinen Inhalt von den Rändern des Bildschirms zu trennen.
* **`.wp-heading-inline`**: Wird auf das `<h1>`-Tag angewendet. Ermöglicht es anderen Elementen (wie Aktionsbuttons), sich daneben auf derselben Zeile zu platzieren.
* **`.page-title-action`**: Konvertiert einen Standard-`<a>`-Link in einen Button, der direkt neben dem Haupttitel positioniert ist (ideal für Aktionen wie „Neu hinzufügen“).
* **`.wp-header-end`**: Wird auf ein `<hr>`-Tag angewendet. Fungiert als unsichtbarer Separator, der schwebende Elemente im Header bereinigt (Clearfix) und den Beginn des eigentlichen Inhalts markiert.

### Benachrichtigungssystem (Admin Notices)

Statusmeldungen sind wichtig, um den Benutzer über das Ergebnis einer Aktion (wie das Speichern von Einstellungen) zu informieren. Alle teilen sich eine Basisklasse und werden durch Statusklassen modifiziert.

```text
Struktur einer Benachrichtigung
+-------------------------------------------------------+
| [Rahmenfarbe] Beschreibende Nachricht für den Benutzer (X)|
+-------------------------------------------------------+

```

* **Basisklasse**: `.notice`
* **Statusmodifikatoren**:
  * `.notice-success` (Grüner Rand): Erfolgreiche Operationen.
  * `.notice-error` (Roter Rand): Fehler, ungültige Validierungen.
  * `.notice-warning` (Orangener Rand): Destruktive Aktionen oder ausstehende Updates.
  * `.notice-info` (Blauer Rand): Allgemeine Informationen oder Systemstatus.

* **Verhalten**: `.is-dismissible` injiziert automatisch über JavaScript einen Schließen-Button (X), damit der Benutzer den Hinweis schließen kann.

### Strukturierung von Formularen

Für die Entwicklung von Einstellungsseiten verwendet WordPress ein standardisiertes tabellarisches Layout.

* **`.form-table`**: Verwandelt ein `<table>`-Tag in ein responsives Raster, das sich perfekt für Konfigurationsformulare eignet, bei denen die linke Spalte die `<label>`-Tags und die rechte Spalte die Inputs enthält.
* **Klassen für Textfelder**: Regulieren die Breite der Inputs, um Konsistenz zu wahren.
  * `.regular-text`: Standardbreite (empfohlen für die meisten Felder).
  * `.small-text`: Für numerische Felder oder kurze Codes.
  * `.large-text`: Belegt 100 % der Breite des Containers.
  * `.code`: Ändert die Schriftart in Festbreitenschrift (ideal für URLs, Slugs oder Codefragmente).

### Benutzeroberflächen-Komponenten: Buttons und Cards

* **Buttons**: WordPress vereinheitlicht das Design von Schaltflächen (sei es das `<button>`-Tag, `<input type="submit">` o `<a>`) über die Basisklasse `.button`.
  * `.button-primary`: Solider blauer Hintergrund. Verwende ihn nur für die Hauptaktion des Bildschirms (wie „Änderungen speichern“).
  * `.button-secondary` (oder nur `.button`): Hellgrauer Hintergrund. Für sekundäre Aktionen (Abbrechen, Vorschau).
  * `.button-large` / `.button-small`: Größenmodifikatoren.
  * `.button-link`: Text mit dem Aussehen eines reinen Links, aber dem Verhalten eines Buttons.

* **`.card`**: Erstellt eine weiße Box mit leichtem Schattenwurf, ideal für Zusammenfassungs-Dashboards oder zur Gruppierung von Informationen, die nicht zu einem Formular gehören.

### Vollständige Implementierung: Eine native Benutzeroberfläche

Der folgende HTML-Code veranschaulicht, wie diese Klassen kombiniert werden, um eine Einstellungsseite mit einem exakt dem Core entsprechenden Design zu erstellen, ohne eine einzige Zeile benutzerdefiniertes CSS schreiben zu müssen:

```html
<div class="wrap">
    <h1 class="wp-heading-inline">Plugin-Einstellungen</h1>
    <a href="#" class="page-title-action">Dokumentation</a>
    <hr class="wp-header-end">

    <div class="notice notice-success is-dismissible">
        <p><strong>Einstellungen gespeichert.</strong> Die Konfiguration wurde erfolgreich aktualisiert.</p>
    </div>

    <div class="card" style="max-width: 100%; margin-bottom: 20px;">
        <h2 class="title">API-Verbindungsstatus</h2>
        <p>Das System ist synchronisiert. Das letzte Update war vor 2 Stunden.</p>
    </div>

    <form method="post" action="options.php">
        <table class="form-table" role="presentation">
            <tbody>
                <tr>
                    <th scope="row">
                        <label for="api_key">API-Schlüssel</label>
                    </th>
                    <td>
                        <input name="api_key" type="text" id="api_key" value="ak_12345XYZ" class="regular-text code">
                        <p class="description">Gib den von deinem Anbieter bereitgestellten privaten Schlüssel ein.</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="items_per_page">Einträge pro Seite</label>
                    </th>
                    <td>
                        <input name="items_per_page" type="number" id="items_per_page" value="20" class="small-text">
                    </td>
                </tr>
                <tr>
                    <th scope="row">Debug-Modus</th>
                    <td>
                        <fieldset>
                            <legend class="screen-reader-text"><span>Debug-Modus</span></legend>
                            <label>
                                <input type="radio" name="debug_mode" value="1" checked="checked">
                                Aktiviert
                            </label><br>
                            <label>
                                <input type="radio" name="debug_mode" value="0">
                                Deaktiviert
                            </label>
                        </fieldset>
                    </td>
                </tr>
            </tbody>
        </table>

        <p class="submit">
            <input type="submit" name="submit" id="submit" class="button button-primary" value="Änderungen speichern">
            <button type="button" class="button button-secondary">Standardwerte wiederherstellen</button>
        </p>
    </form>
</div>

```

## Kapitelzusammenfassung

In diesem Kapitel haben wir das Fundament für die User Experience im Administrationsbereich gelegt. Wir haben untersucht, wie du über `add_menu_page()` mit dem internen Navigationsbaum interagierst, um einen zentralen Einstiegspunkt zu schaffen, und über `add_submenu_page()` die Optionen hierarchisch strukturierst — stets geschützt durch standardisierte Capabilities und Berechtigungen.

Wir haben uns mit der entscheidenden Bedeutung von Performance und Konfliktvermeidung durch den gezielten Einsatz der Enqueue API (`admin_enqueue_scripts`) befasst und sichergestellt, dass unsere statischen Ressourcen sowie dynamischen Übersetzungen mit `wp_localize_script()` ausschließlich auf unseren eigenen Bildschirmen geladen werden. Schließlich haben wir entdeckt, wie man HTML mithilfe nativer CSS-Klassen von WordPress strukturiert. Dies ermöglicht es uns, Benutzeroberflächen zu erstellen, die responsiv, barrierefrei und visuell konsistent mit der Umgebung sind, in der sie sich befinden, wodurch wir unsere technischen Schulden auf ein Minimum reduzieren.
