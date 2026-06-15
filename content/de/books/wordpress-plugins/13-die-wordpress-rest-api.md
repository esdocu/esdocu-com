Die REST-API hat WordPress von einem traditionellen CMS in ein leistungsstarkes *Headless*-CMS verwandelt. In diesem Kapitel lernst du, wie du dein Plugin über eine standardisierte, JSON-basierte Architektur mit externen Anwendungen verbindest. Wir werden die Schlüsselkonzepte und die fortgeschrittene Praxis untersuchen: Du wirst entdecken, wie du benutzerdefinierte Routen und Endpunkte registrierst, effiziente Callbacks strukturierst, die Argumentvalidierung nativ delegierst und strenge Zugriffs- und Berechtigungskontrollen einrichtest. Am Ende wirst du in der Lage sein, sichere, skalierbare und robuste Kommunikationsschnittstellen zu bauen, die die Grenzen deiner Entwicklung erweitern.

## 13.1 Schlüsselkonzepte der REST-API

Die WordPress-REST-API hat das CMS von einer traditionellen Seiten-Rendering-Plattform in ein robustes Anwendungs-Framework verwandelt. Im Gegensatz zu `admin-ajax.php` (das wir in Kapitel 9 untersucht haben), das hauptsächlich für die interne Kommunikation im Administrationsbereich oder für spezifische Frontend-Skripte entwickelt wurde, bietet die REST-API eine standardisierte, JSON-basierte und ressourcenorientierte Schnittstelle. Dies ermöglicht es jeder externen Anwendung – sei es eine SPA (Single Page Application) in React, eine native mobile App oder ein Synchronisationsskript in Node.js –, bidirektional mit der WordPress-Datenbank zu interagieren.

Um die Entwicklung von Integrationen mit der REST-API zu beherrschen, ist es unerlässlich, die Terminologie und die konzeptionelle Architektur zu verstehen, auf der ihre Infrastruktur aufbaut.

### Konzeptionelle Architektur der REST-API

Die Kommunikation über die REST-API ist *stateless* (zustandslos), was bedeutet, dass jede Anfrage alle Informationen enthalten muss, die der Server für ihre Verarbeitung benötigt, einschließlich der Authentifizierungsdaten.

Nachfolgend wird der Ablauf einer typischen Anfrage veranschaulicht:

```text
[Externer Client / Frontend (JS, Mobile App, Drittanbieter-Server)]
        │                                         ▲
        │ 1. HTTP-Anfrage                         │ 6. JSON-Antwort
        │    (GET, POST, PUT, DELETE)             │    (WP_REST_Response)
        ▼                                         │
┌─────────────────────────────────────────────────────────┐
│                    WP-Infrastruktur                     │
│                                                         │
│  [REST-Router (WP_REST_Server)]                         │
│        │                                                │
│        │ 2. Routen-Übereinstimmung / Namespace          │
│        ▼                                                │
│  [Route (z. B. /mi-plugin/v1/datos)]                    │
│        │                                                │
│        │ 3. Methoden-Identifikation                     │
│        ▼                                                │
│  [Spezifischer Endpunkt] ──────────┐                    │
│        │                           │ 4. Verifizierung   │
│        │ 5. Ausführung             ▼                    │
│        ▼                 [Berechtigungs-Callback]       │
│  [Haupt-Callback]          (permission_callback)        │
│        │                                                │
│        │ (Interaktion mit WP-Core, CPTs, $wpdb)         │
└────────┼────────────────────────────────────────────────┘
         ▼
[Datenbank]

```

### Vokabular und grundlegende Komponenten

Die WordPress-API erfindet das Rad nicht neu; sie implementiert die architektonischen REST-Standards. Sie verwendet jedoch eine spezifische Nomenklatur innerhalb ihrer PHP-Klassen, die du kennen musst.

#### 1. Routen (Routes)

Eine **Route** ist der „Name“ des URIs, mit dem du dich verbindest. Routen sind hierarchisch strukturiert und repräsentieren die Ressource, die abgefragt oder geändert wird.

Beispielsweise lautet die Route in der URL `https://deine-website.de/wp-json/wp/v2/posts/123` `/wp/v2/posts/123`. Routen geben nicht an, *welche* Aktion ausgeführt werden soll, sondern nur, *wo* sich die Ressource befindet.

#### 2. Endpunkte (Endpoints)

Ein **Endpunkt (Endpoint)** ist die Verbindung zwischen einer bestimmten Route und einer HTTP-Methode (GET, POST, PUT, DELETE). Eine einzelne Route kann mehrere Endpunkte haben.

Beispielsweise hat die Route `/wp/v2/posts` mindestens zwei Standard-Endpunkte:

* Einen `GET`-Endpunkt zum Auflisten von Beiträgen.
* Einen `POST`-Endpunkt zum Erstellen eines neuen Beitrags.

In deinem PHP-Code registrierst du Routen und definierst innerhalb dieser Konfiguration die Endpunkte, die sie unterstützen.

#### 3. Namespaces (Namensräume)

Der **Namespace** ist das erste Segment der Route (direkt nach dem Basis-Präfix `wp-json/`). Sein kritischer Zweck besteht darin, Namenskollisionen zwischen den Routen des WordPress-Cores (`wp/v2`), denen anderer Plugins und deinen eigenen zu verhindern.

Ein Namespace sollte immer dem Muster `vendor/version` folgen. Wenn du ein Plugin namens „Inventarsystem“ entwickelst, sollte dein Namespace nicht einfach `inventario` lauten, sondern `sistema-inventario/v1`.

```text
/wp-json/sistema-inventario/v1/productos/
|_______| |__________________| |________|
 Basis-URL      Namespace         Route

```

Die Versionierung (`v1`) ermöglicht es dir, in Zukunft eine `v2` deiner API mit drastischen strukturellen Änderungen zu veröffentlichen, ohne die Anwendungen der Clients zu beeinträchtigen, die weiterhin `v1` nutzen.

#### 4. Anfragen (Requests)

Wenn ein Aufruf an einen Endpunkt eingeht, verpackt WordPress alle Daten dieses Aufrufs (Header, URL-Parameter, JSON-Body) in eine Instanz der Klasse `WP_REST_Request`. Deine Callback-Funktion empfängt dieses Objekt, lo que centraliza y unifica la forma en que extraes variables, reemplazando el uso tradicional de súper globales en PHP como `$_GET` o `$_POST`.

#### 5. Antworten (Responses)

Analog zu den Anfragen muss alles, was dein Endpunkt zurückgibt, mithilfe der Klasse `WP_REST_Response` strukturiert werden. Obwohl WordPress Arrays oder einfache Zeichenketten automatisch in JSON konvertiert, gibt dir die Verwendung der Klasse `WP_REST_Response` die volle Kontrolle, um die HTTP-Statuscodes zu ändern (z. B. ein `201 Created` anstelle eines `200 OK` zurückzugeben) und benutzerdefinierte Header hinzuzufügen.

#### 6. Controller (Controllers)

Mit zunehmender Größe deines Plugins wird die Registrierung von Callbacks über anonyme oder prozedurale Funktionen unhaltbar. Der WordPress-Standard ist die Verwendung des Controller-Entwurfsmusters. Ein REST-API-Controller ist eine PHP-Klasse, die `WP_REST_Controller` erweitert und alle Routenregistrierungen, Validierungen und die Geschäftslogik für eine bestimmte Ressource gruppiert (z. B. `class Inventario_REST_Productos_Controller`).

#### 7. Schemata (Schemas)

Das **Schema** ist die formale Definition der Datenstruktur, die dein Endpunkt akzeptiert und zurückgibt. Basierend auf dem JSON-Schema-Standard teilt es WordPress – und jedem Client, der die API nutzt – mit, welche Felder existieren, welche Datentypen sie haben (String, Integer, Boolean) und was ihre Standardwerte sind. WordPress verwendet das Schema automatisch, um Anfragen zu bereinigen und zu validieren, bevor sie deinen Hauptcode erreichen, was den manuellen Aufwand zur Validierung von Variablen erheblich reduziert.

### Entdeckung (Discovery)

Entdeckung (Discovery) ist der Mechanismus, durch den ein externer Client mit einer WordPress-Website interagieren und herausfinden kann, ob die REST-API aktiviert ist, was ihr Präfix ist (normalerweise `wp-json`, aber änderbar) und welche Routen verfügbar sind.

Wenn du eine `GET`-Anfrage an die Wurzel der API (`/wp-json/`) stellst, gibt WordPress ein umfangreiches JSON-Verzeichnis zurück, das alle registrierten Namespaces, Routen und Endpunkte auf dieser speziellen Website im Detail auflistet, zusammen mit den unterstützten Methoden und den Argumenten, die jeder akzeptiert. Diese Fähigkeit zur Selbstentdeckung ist entscheidend für automatisierte Tools und robuste Clients, die ihre Aktionen basierend auf den vom Server bereitgestellten Funktionen konfigurieren.

## 13.2 Registrierung von Routen und Endpunkten

Um die Logik oder die Daten deines Plugins über die REST-API bereitzustellen, ist es wichtig, die Routen und Endpunkte, die deine Anwendung unterstützen soll, explizit zu registrieren. WordPress bietet hierfür einen zentralisierten Mechanismus, der sicherstellt, dass deine Routen korrekt in den Hauptrouter integriert werden und im Entdeckungsindex der API erscheinen.

Jde Routenregistrierung muss zwingend an die Aktion `rest_api_init` angehängt werden. Der Versuch, Routen außerhalb dieses Hooks zu registrieren, führt zu einem stillen Fehlschlag oder zu PHP-Warnungen.

### Die Funktion `register_rest_route()`

Der Pfeiler dieser Architektur ist die Funktion `register_rest_route`. Ihre grundlegende Signatur sieht wie folgt aus:

```php
register_rest_route( 
    string $namespace, 
    string $route, 
    array $args = array(), 
    bool $override = false 
);

```

* **`$namespace`**: Das Präfix und die Version deines Plugins (z. B. `mi-plugin/v1`).
* **`$route`**: Die spezifische Ressource, die du bereitstellst (z. B. `/tareas`).
* **`$args`**: Ein assoziatives Array, das die HTTP-Methode, die Haupt-Callback-Funktion, die Berechtigungsvalidierungs-Funktion und die erwarteten Argumente definiert.
* **`$override`**: Ein optionaler boolescher Wert. Wenn `true`, überschreibt er eine bestehende Route, die genau denselben Namespace und dieselbe Route hat.

### Strukturierung von Endpunkten in einer Route

Es ist eine empfohlene und hocheffiziente Praxis, mehrere Endpunkte, die auf derselben Ressource (derselben Route) operieren, innerhalb eines einzigen Aufrufs von `register_rest_route` zu gruppieren.

Im Folgenden wird gezeigt, wie eine Route `/tareas` registriert wird, die sowohl eine Leseanfrage (`GET`) als auch eine Erstellungsanfrage (`POST`) unterstützt:

```php
add_action( 'rest_api_init', 'mi_plugin_registrar_rutas_tareas' );

function mi_plugin_registrar_rutas_tareas() {
    $namespace = 'mi-plugin/v1';
    $ruta      = '/tareas';

    register_rest_route( $namespace, $ruta, [
        // Endpunkt 1: Aufgaben auflisten (GET)
        [
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => 'mi_plugin_obtener_tareas',
            'permission_callback' => '__return_true', // Für alle geöffnet (wird in 13.4 vertieft)
        ],
        // Endpunkt 2: Neue Aufgabe erstellen (POST)
        [
            'methods'             => WP_REST_Server::CREATABLE,
            'callback'            => 'mi_plugin_crear_tarea',
            'permission_callback' => 'is_user_logged_in',
        ]
    ] );
}

```

**Verwendung von Server-Konstanten:**
Beachte die Verwendung von `WP_REST_Server::READABLE` und `WP_REST_Server::CREATABLE`. Obwohl du literale Strings wie `'GET'` oder `'POST'` verwenden könntest, bietet WordPress Konstanten innerhalb der Klasse `WP_REST_Server` an, die intern die Kompatibilität mit mehreren Methoden abdecken (z. B. bildet `READABLE` auf `GET, HEAD` ab). Ihre Verwendung ist der Standard in der professionellen Entwicklung.

* `WP_REST_Server::READABLE` (GET)
* `WP_REST_Server::CREATABLE` (POST)
* `WP_REST_Server::EDITABLE` (POST, PUT, PATCH)
* `WP_REST_Server::DELETABLE` (DELETE)
* `WP_REST_Server::ALLMETHODS` (GET, POST, PUT, PATCH, DELETE)

### Dynamische Routen mit regulären Ausdrücken

Oft musst du mit einer bestimmten Ressource interagieren, was die Übergabe eines dynamischen Identifikationsmerkmals in der URL selbst erfordert, wie z. B. `/mi-plugin/v1/tareas/123`.

WordPress verwendet PCRE-kompatible reguläre Ausdrücke (Perl Compatible Regular Expressions), um diese Variablen direkt aus der Route zu erfassen. Das Format der benannten Erfassung `(?P<nombre_variable>patron)` ist zwingend erforderlich, damit der Router den extrahierten Wert zuweist und ihn dir als nutzbaren Parameter übergibt.

```php
add_action( 'rest_api_init', 'mi_plugin_registrar_ruta_tarea_individual' );

function mi_plugin_registrar_ruta_tarea_individual() {
    // Der Ausdruck (?P<id>\d+) erfasst eine oder mehrere Ziffern und benennt sie als "id"
    $ruta_con_variable = '/tareas/(?P<id>\d+)';

    register_rest_route( 'mi-plugin/v1', $ruta_con_variable, [
        [
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => 'mi_plugin_obtener_tarea_por_id',
            'permission_callback' => '__return_true',
            'args'                => [
                'id' => [
                    'validate_callback' => function($param, $request, $key) {
                        return is_numeric( $param );
                    }
                ],
            ],
        ],
        [
            'methods'             => WP_REST_Server::EDITABLE,
            'callback'            => 'mi_plugin_actualizar_tarea',
            'permission_callback' => 'mi_plugin_verificar_permiso_edicion',
        ],
        [
            'methods'             => WP_REST_Server::DELETABLE,
            'callback'            => 'mi_plugin_borrar_tarea',
            'permission_callback' => 'mi_plugin_verificar_permiso_borrado',
        ]
    ] );
}

```

In diesem Szenario empfängt die Funktion `mi_plugin_obtener_tarea_por_id` bei einer `GET`-Anfrage eines Clients an `/mi-plugin/v1/tareas/45` ein `WP_REST_Request`-Objekt, das den Wert `45` enthält, auf den sauber über `$request['id']` zugegriffen werden kann.

Andere gebräuchliche Erfassungsmuster sind:

* Alphanumerisch (z. B. ein Slug): `(?P<slug>[a-zA-Z0-9-]+)`
* Beliebige Zeichenkette: `(?P<nombre>\w+)`

Das Array `args` (im vorherigen Beispiel kurz eingeführt) ermöglicht es, spezifische Validierungs- und Bereinigungsregeln pro Parameter zu definieren. Dies ist ein entscheidender Verteidigungsmechanismus der ersten Linie, den wir im nächsten Abschnitt ausführlich untersuchen werden.

## 13.3 Callbacks und Argumentvalidierung

In der Architektur der WordPress-REST-API ist die Ausführung eines Endpunkts kein einstufiger Prozess. Um die Sicherheit, Integrität und Vorhersehbarkeit von Daten zu gewährleisten, verarbeitet der Router jede Anfrage durch einen „Trichter“ von Callbacks, bevor er eine Interaktion mit der Datenbank oder der Hauptlogik deines Plugins zulässt.

Diesen Trichter zu verstehen und korrekt zu nutzen, unterscheidet eine fragile API von einer robusten und sicheren.

### Der Ausführungs-Trichter einer Anfrage

Wenn eine HTTP-Anfrage mit einem registrierten Endpunkt übereinstimmt, führt WordPress die zugehörigen Funktionen (Callbacks) in einer strengen Reihenfolge aus:

```text
[Eingehende HTTP-Anfrage mit Parametern]
                 │
                 ▼
 1. validate_callback()  <── Entsprechen die Daten dem erwarteten Format?
                 │           (z. B. Ist die ID eine Ganzzahl?)
                 │           [Bei Fehlschlag: Gibt 400 Bad Request zurück]
                 ▼
 2. sanitize_callback()  <── Bereinigt und transformiert die Daten.
                 │           (z. B. Entfernt bösartige HTML-Tags)
                 ▼
 3. permission_callback()<── Hat der aktuelle Benutzer Rechte?
                 │           (Wird in 13.4 eingehend analysiert)
                 │           [Bei Fehlschlag: Gibt 401 oder 403 zurück]
                 ▼
 4. Haupt-callback()     <── Geschäftslogik deines Plugins.
                 │           (Liest/schreibt in DB, verarbeitet Daten)
                 ▼
    [WP_REST_Response (JSON)]

```

### Definition von Argumenten (`args`)

Damit die Validierungs- und Bereinigungsphasen funktionieren, musst du deklarieren, welche Parameter dein Endpunkt erwartet. Dies geschieht im Array `args` bei der Registrierung der Route.

Jeder Parameter kann seine eigenen Regeln haben:

```php
'args' => [
    'email_cliente' => [
        'description'       => 'Die E-Mail-Adresse des Kunden.',
        'type'              => 'string',
        'format'            => 'email',
        'required'          => true,
        'default'           => '',
        'validate_callback' => 'rest_validate_request_arg',
        'sanitize_callback' => 'sanitize_email',
    ],
    'edad' => [
        'type'              => 'integer',
        'required'          => false,
        'minimum'           => 18,
        'validate_callback' => function( $param, $request, $key ) {
            return is_numeric( $param ) && $param >= 18;
        },
        'sanitize_callback' => 'absint',
    ]
]

```

#### Validierung vs. Bereinigung

Es ist wichtig, den architektonischen Unterschied zwischen diesen beiden Prozessen zu verstehen:

1. **Validierung (`validate_callback`)**: Ihre Aufgabe ist es, mit `true` oder `false` zu antworten. Sie prüft die Daten und fragt: *„Ist das das, was ich angefordert habe?“*. Wenn sie `false` zurückgibt, bricht WordPress die Anfrage sofort ab und gibt einen HTTP-400-Fehler zurück. Die Daten werden dabei nicht verändert.
2. **Bereinigung (`sanitize_callback`)**: Ihre Aufgabe ist es, bereinigte und sichere Daten zurückzugeben. Sie nimmt den validierten Wert und sagt: *„Ich werde dies vor der Verwendung säubern“*.

**Die Stärke von `rest_validate_request_arg`:**
Anstatt für jeden Parameter benutzerdefinierte Validierungsfunktionen zu schreiben, bietet WordPress die native Funktion `rest_validate_request_arg`. Wenn du sie als `validate_callback` verwendest, liest WordPress die in deinem Argument-Array definierten Eigenschaften wie `type`, `format`, `enum`, `minimum` etc. aus und validiert die Daten automatisch basierend auf dem JSON-Schema-Standard.

### Der Haupt-Callback

Wenn die Anfrage die Validierung, die Bereinigung und die Berechtigungsprüfung übersteht, erreicht sie schließlich deinen Haupt-Callback. Diese Funktion empfängt immer ein einziges Argument: eine Instanz der Klasse `WP_REST_Request`.

Das `WP_REST_Request`-Objekt vereinheitlicht alle Parameter, unabhängig davon, ob sie in der URL (Query-String), im Anfragekörper (JSON, FormData) oder in der Route selbst (Regex-Erfassungen) übergeben wurden.

#### Extracción de parámetros

Du solltest niemals `$_GET` o `$_POST` innerhalb eines REST-API-Callbacks verwenden. Nutze stattdessen die Methoden des Request-Objekts:

* `$request->get_param( 'nombre' )`: Gibt den Wert eines bestimmten bereits bereinigten Parameters zurück.
* `$request->get_params()`: Gibt ein assoziatives Array mit allen Parametern zurück.
* `$request->get_file( 'archivo' )`: Greift auf hochgeladene Dateien zu.
* `$request->get_header( 'x-mi-cabecera' )`: Ruft einen spezifischen HTTP-Header ab.

#### Erstellung der Antwort

Dein Haupt-Callback muss immer eines von zwei Dingen zurückgeben:

1. Eine Instanz von `WP_REST_Response` (für Erfolge).
2. Eine Instanz von `WP_Error` (für kontrollierte Fehler).

```php
function mi_plugin_crear_cliente_callback( WP_REST_Request $request ) {
    // 1. Bereits validierte und bereinigte Daten abrufen
    $email = $request->get_param( 'email_cliente' );
    $edad  = $request->get_param( 'edad' );

    // 2. Geschäftslogik (z. B. prüfen, ob die E-Mail bereits existiert)
    if ( email_exists( $email ) ) {
        // Die Rückgabe eines WP_Error generiert automatisch eine JSON-Antwort
        // mit dem angegebenen HTTP-Code (409 Conflict).
        return new WP_Error( 
            'email_duplicado', 
            'Diese E-Mail-Adresse ist bereits im System registriert.', 
            [ 'status' => 409 ] 
        );
    }

    // (Simulation des Einfügens in die Datenbank)
    $nuevo_id = 154; 

    // 3. Die erfolgreiche Antwort vorbereiten
    $datos_respuesta = [
        'mensaje' => 'Kunde erfolgreich erstellt',
        'id'      => $nuevo_id,
        'email'   => $email
    ];

    // WP_REST_Response wird instanziiert, um den HTTP-Code zu steuern (201 Created)
    $response = new WP_REST_Response( $datos_respuesta, 201 );
    
    // Optional: HTTP-Header zur Antwort hinzufügen
    $response->header( 'X-Plugin-Version', '1.0.0' );

    return $response;
}

```

### Integration in die Routenregistrierung

Um das Gesamtbild zu sehen, zeigt der folgende Code, wie Registrierung, Argumente und Callbacks in einem professionellen Codeblock zusammengefügt werden:

```php
add_action( 'rest_api_init', function() {
    register_rest_route( 'mi-plugin/v1', '/clientes', [
        'methods'             => WP_REST_Server::CREATABLE,
        'callback'            => 'mi_plugin_crear_cliente_callback',
        'permission_callback' => '__return_true', // Noch abzusichern
        'args'                => [
            'email_cliente' => [
                'type'              => 'string',
                'format'            => 'email',
                'required'          => true,
                'validate_callback' => 'rest_validate_request_arg',
                'sanitize_callback' => 'sanitize_email',
            ],
            'nombre' => [
                'type'              => 'string',
                'required'          => true,
                'validate_callback' => 'rest_validate_request_arg',
                'sanitize_callback' => 'sanitize_text_field',
            ]
        ]
    ] );
});

```

Durch die Auslagerung der Validierung und Bereinigung in das Array von `args` bleibt der Haupt-Callback (`mi_plugin_crear_cliente_callback`) völlig frei von `if( isset(...) )`-Anweisungen oder Typprüfungen. Seine einzige Verantwortung besteht darin, die Geschäftslogik auszuführen, was dem Prinzip der Einzelverantwortung (Single Responsibility Principle) entspricht.

## 13.4 Berechtigungskontrolle in der API

In den vorherigen Abschnitten haben wir die Sicherheit vorübergehend zurückgestellt, indem wir dem Argument `permission_callback` die native Funktion `__return_true` zugewiesen haben. In einer Produktionsumgebung ist es eine kritische Schwachstelle, Endpunkte offen zu lassen, die Daten ändern oder sensible Informationen preisgeben.

Die WordPress-REST-API implementiert ein robustes System zur Trennung von Geschäftslogik und Autorisierungslogik, um sicherzustellen, dass nur Clients mit den richtigen Zugangsdaten und Capabilities eine Aktion ausführen können.

### Authentifizierung vs. Autorisierung

Bevor du Code schreibst, ist es wichtig, zwei Konzepte zu unterscheiden, die im Kontext von APIs oft verwechselt werden:

1. **Authentifizierung (Wer bist du?):** Dies ist der Mechanismus, mit dem WordPress den Benutzer identifiziert, der die Anfrage stellt. Für interne Anfragen (wie einen Gutenberg-Block) verwendet WordPress Session-Cookies zusammen mit einem API-*Nonce* (`wp_rest`). Für externe Clients werden Anwendungspasswörter (Application Passwords) verwendet, die in WordPress 5.6 eingeführt wurden, oder OAuth über zusätzliche Plugins.
2. **Autorisierung (Was darfst du tun?):** Sobald WordPress weiß, wer der Benutzer ist, muss es festlegen, ob er die Berechtigung hat, die angeforderte Aktion auszuführen. Dies wird über das System der Rollen und Capabilities (das wir in Kapitel 12 kennengelernt haben) gesteuert.

Der `permission_callback` kümmert sich ausschließlich um die **Autorisierung**. WordPress hat die Authentifizierung im Hintergrund bereits durchgeführt, bevor deine Funktion ausgeführt wird, und den aktuellen Benutzer initialisiert.

### Implementierung des `permission_callback`

Der Parameter `permission_callback` akzeptiert jede aufrufbare PHP-Funktion (Callable). Genau wie der Haupt-Callback und der Validierungs-Callback empfängt er das Objekt `WP_REST_Request` als Argument.

Es gibt drei Haupt-Rückgabeszenarien für diese Funktion:

* **Rückgabe von `true`:** Die Anfrage ist autorisiert und geht in die nächste Phase über (Haupt-Callback).
* **Rückgabe von `false`:** Die Anfrage wird abgelehnt. WordPress bricht die Ausführung ab und gibt einen generischen Fehler `401 Unauthorized` (wenn der Benutzer nicht eingeloggt ist) oder `403 Forbidden` (wenn er eingeloggt ist, aber keine Berechtigungen hat) zurück.
* **Rückgabe eines `WP_Error`:** Die Anfrage wird abgelehnt, aber du kannst eine benutzerdefinierte Fehlermeldung und einen spezifischen Statuscode an den Client senden, was die Entwicklererfahrung (Developer Experience oder DX) verbessert.

#### Praktisches Beispiel: Einschränkung durch Capabilities

Der sicherste und standardmäßigste Ansatz in WordPress besteht darin, `current_user_can()` innerhalb deines Berechtigungs-Callbacks zu verwenden.

```php
add_action( 'rest_api_init', function() {
    register_rest_route( 'mi-plugin/v1', '/configuracion', [
        [
            'methods'             => WP_REST_Server::EDITABLE, // POST, PUT, PATCH
            'callback'            => 'mi_plugin_actualizar_config_callback',
            'args'                => [ /* ... args ... */ ],
            'permission_callback' => 'mi_plugin_verificar_permisos_config',
        ]
    ] );
});

/**
 * Überprüft, ob der Benutzer die Berechtigung hat, die Einstellungen zu aktualisieren.
 *
 * @param WP_REST_Request $request Aktuelles Request-Objekt.
 * @return true|WP_Error
 */
function mi_plugin_verificar_permisos_config( WP_REST_Request $request ) {
    // 1. Wir überprüfen die native oder benutzerdefinierte Capability
    if ( ! current_user_can( 'manage_options' ) ) {
        
        // 2. Wir geben ein detailliertes WP_Error anstelle eines einfachen false zurück
        return new WP_Error(
            'rest_forbidden_context',
            __( 'Entschuldigung, du hast keine Berechtigungen, um die Einstellungen dieses Plugins zu ändern.', 'mi-plugin' ),
            [ 'status' => rest_authorization_required_code() ] 
        );
    }

    return true;
}

```

*Technischer Hinweis:* Die native Funktion `rest_authorization_required_code()` ist hier sehr nützlich; sie gibt `401` zurück, wenn der Benutzer ein anonymer Besucher ist, und `403`, wenn er ein authentifizierter Benutzer ist, dem jedoch die erforderlichen Rechte fehlen.

### Ressourcenbasierte Überprüfungen

Manchmal hängt die Berechtigung nicht von einem globalen Recht ab, sondern von der spezifischen Ressource, die manipuliert werden soll. Beispielsweise hat ein Benutzer mit der Rolle „Autor“ die Capability `edit_posts`, sollte aber über die API nur **seine eigenen Beiträge** bearbeiten oder löschen können, nicht die anderer.

In diesen Fällen musst du Parameter aus der Anfrage innerhalb des `permission_callback` extrahieren, um die Inhaberschaft zu validieren:

```php
function mi_plugin_verificar_borrado_tarea( WP_REST_Request $request ) {
    // Wir holen die ID aus der URL: /mi-plugin/v1/tareas/(?P<id>\d+)
    $tarea_id = (int) $request->get_param( 'id' );
    $tarea    = get_post( $tarea_id );

    if ( empty( $tarea ) || $tarea->post_type !== 'tarea' ) {
        return new WP_Error( 'tarea_no_encontrada', 'Die Aufgabe existiert nicht.', [ 'status' => 404 ] );
    }

    // Wir überprüfen, ob er der Autor der Aufgabe ist ODER ob er Administratorrechte besitzt
    $usuario_actual = get_current_user_id();
    
    if ( (int) $tarea->post_author !== $usuario_actual && ! current_user_can( 'edit_others_posts' ) ) {
        return new WP_Error( 'permiso_denegado', 'Du kannst die Aufgaben eines anderen Benutzers nicht löschen.', [ 'status' => 403 ] );
    }

    return true;
}

```

### Öffentliche Endpunkte und die Warnung `_doing_it_wrong`

Wenn du die Absicht hast, einen zu 100 % öffentlichen Endpunkt zu erstellen (z. B. einen Lese-Endpunkt zur Anzeige einer Liste von Geschäften auf einer Karte im Frontend), **solltest du niemals das Argument `permission_callback` weglassen**.

Seit WordPress-Version 5.5 funktioniert das System zwar, wenn du diesen Parameter weglässt, generiert jedoch einen `_doing_it_wrong`-Debugging-Hinweis in den Server-Logs. Dies wurde eingeführt, um Entwickler zu zwingen, sich explizit über das Öffnen eines Endpunkts zu äußern, damit sensible Routen nicht aus Vergesslichkeit ungeschützt bleiben.

Verwende für wirklich öffentliche Routen immer die native Funktion, die direkt einen positiven booleschen Wert zurückgibt:

```php
'permission_callback' => '__return_true',

```

## Zusammenfassung des Kapitels

In diesem Kapitel haben wir uns eingehend mit der Architektur und dem Ablauf der WP-REST-API befasst, einem grundlegendem Werkzeug zur Entkopplung des WordPress-Backends von modernen Client-Anwendungen.

1. **Schlüsselkonzepte:** Wir haben die standardisierte Nomenklatur gelernt: Routen, Endpunkte, Namespaces (`vendor/v1`) und den API-Entdeckungsmechanismus. Wir haben verstanden, dass jede Kommunikation ihre Daten in die Klassen `WP_REST_Request` und `WP_REST_Response` verpackt.
2. **Routenregistrierung:** Wir haben herausgefunden, dass `register_rest_route` die Erstellung von Ressourcen zentralisiert, die an den Hook `rest_api_init` gebunden sind, wobei lesbare Konstanten (`WP_REST_Server::READABLE`) und reguläre Ausdrücke zum Erfassen dynamischer URL-Variablen verwendet werden.
3. **Validierung und Callbacks:** Wir haben den „Ausführungstrichter“ aufgeschlüsselt. Die Auslagerung der Prüflogik mithilfe von JSON Schema im Array `args` (`validate_callback` und `sanitize_callback`) hält deine Hauptfunktion sauber und konzentriert sich ausschließlich auf die Geschäftslogik.
4. **Sicherheit und Berechtigungen:** Schließlich haben wir den `permission_callback` als Autorisierungsbarriere analysiert. Durch die Verwendung von `current_user_can()` oder die Überprüfung der Inhaberschaft der Ressource gegenüber `$request` stellen wir sicher, dass unsere bereitgestellten Endpunkte eine sichere Brücke zur Datenbank und kein Angriffsvektor sind.
