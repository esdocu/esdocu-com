Bei der professionellen Entwicklung von WordPress-Plugins ist die Leistungsoptimierung eine Pflicht. Wenn deine Projekte wachsen, komplexe Datenbankabfragen durchführen oder externe APIs anfragen, wird die Antwortzeit des Servers zu einem kritischen Faktor.

In diesem Kapitel werden wir das native Caching-Ökosystem entmystifizieren. Du lernst, zwischen Page-, Object- und Browser-Caching-Ebenen zu unterscheiden. Du wirst die Transients API beherrschen, um rechenintensive Ergebnisse temporär zu speichern, und du wirst entdecken, wie du präzise Invalidierungsstrategien über Code implementierst. Bereite dich darauf vor, die Effizienz deiner Entwicklungen auf die nächste Stufe zu heben.

## 11.1 Caching-Unterschiede in WP

Das WordPress-Ökosystem ist von Natur aus dynamisch: Jedes Mal, wenn ein Benutzer eine Seite anfordert, muss der Server den Core laden, Dutzende von Plugins ausführen, das aktive Theme interpretieren und mehrere Datenbankabfragen durchführen, um das endgültige HTML zusammenzustellen. Dieser Prozess ist zwar flexibel, aber sehr ressourcen- und zeitaufwändig. Um dies zu mindern, kommen mehrere Caching-Ebenen ins Spiel.

Als Plugin-Entwickler ist es fundamental zu verstehen, wo und wie jede Art von Cache arbeitet. Das Ignorieren dieser Ebenen ist eine der Hauptursachen für schwer auffindbare Bugs, wie z. B. Inhalte, die sich nicht aktualisieren, Sicherheits-Nonces, die vorzeitig ablaufen, oder Skripte, die veraltete Versionen laden.

### Architektur der Caching-Ebenen

Um den Ablauf einer Anfrage zu visualisieren und zu sehen, wo die einzelnen Caching-Ebenen ansetzen, betrachte das folgende Schema. Wenn eine Ebene erfolgreich ist (ein „Hit“), wird die Anfrage sofort zurückgegeben, wodurch verhindert wird, dass die darunter liegenden Ebenen ausgeführt werden.

```text
[Browser des Benutzers] 
      │
      ├─> 1. Browser-Cache / CDN (Statische Dateien)
      │
[Webserver]
      │
      ├─> 2. Page-Cache (Varnish, Nginx, Caching-Plugins)
      │      (Bei „Hit“ wird HTML zurückgegeben und WP wird NICHT ausgeführt)
      │
      v      (Bei „Miss“ startet WordPress)
[PHP / WordPress]
      │
      ├─> 3. Opcode-Cache (OPcache)
      │
      ├─> 4. Object-Cache (Memcached, Redis oder nativ flüchtig)
      │      (Vermeidet wiederholte schwere Berechnungen oder DB-Abfragen)
      │
      v
[MySQL/MariaDB-Datenbank]

```

### 1. Page-Cache (Page Caching)

Der Page-Cache speichert das Endergebnis der WordPress-Ausführung, also das statische HTML. Er kann vom Server verwaltet werden (wie Varnish oder FastCGI Cache) oder von WordPress-Plugins (wie WP Rocket oder W3 Total Cache).

* **Wie sich dies auf dein Plugin auswirkt:** Wenn die Seite im Cache liegt, **wird WordPress nicht geladen**. Es wird keine Datei deines Plugins ausgeführt, und Hooks wie `init`, `wp` oder `template_redirect` werden für diesen Besuch komplett ignoriert.
* **Entwicklungshinweise:** Wenn dein Plugin dynamische, benutzerbasierte Inhalte anzeigt (wie einen Echtzeit-Besucherzähler, einen Warenkorb oder eine personalisierte Begrüßung), zeigt der Page-Cache allen Benutzern denselben Inhalt an. Um dies zu lösen, musst du asynchrones Laden via AJAX (siehe Kapitel 9) oder die REST-API (siehe Kapitel 13) verwenden, um DOM-Fragmente zu aktualisieren, nachdem das statische HTML geladen wurde.

### 2. Object-Cache (Object Caching)

Im Gegensatz zum Page-Cache speichert der Object-Cache kein HTML, sondern Daten: Ergebnisse von Datenbankabfragen, komplexe Arrays oder Variablen, die einen hohen Verarbeitungsaufwand erfordern. WordPress verfügt über die interne Klasse `WP_Object_Cache`.

Es gibt zwei grundlegende Modalitäten, die du unterscheiden musst:

* **Nicht persistent (Standard):** WordPress speichert Objekte nur während des Lebenszyklus **einer einzigen Anfrage** im Arbeitsspeicher. Wenn du `get_post(10)` dreimal im selben Ladefluss aufrufst, fragt WordPress die Datenbank nur beim ersten Mal ab; die anderen beiden Male holt es die Daten aus dem RAM-Speicher dieser Anfrage. Am Ende des Ladevorgangs der Seite wird dieser Cache gelöscht.
* **Persistent:** Durch die Verwendung von *Drop-ins* (`object-cache.php`) und Technologien wie **Redis** oder **Memcached** übersteht der Object-Cache verschiedene Anfragen und unterschiedliche Benutzer.
* **Entwicklungshinweise:** Du solltest bei der Programmierung davon ausgehen, dass eine Produktionsumgebung einen persistenten Object-Cache verwendet. Wir werden in Abschnitt 11.4 näher darauf eingehen, wie man mit dieser API interagiert, aber das Schlüsselkonzept ist, dass du niemals davon ausgehen solltest, dass eine direkte Datenbankabfrage dir frische Daten liefert, wenn ein persistenter Cache dazwischengeschaltet ist.

### 3. Opcode-Cache (Opcode Caching)

PHP ist eine interpretierte Sprache. Bei jeder Anfrage muss der Quellcode im Klartext analysiert, in *Bytecode* (Opcode) kompiliert und dann ausgeführt werden. Der Opcode-Cache (wie **Zend OPcache**) speichert diesen vorkompilierten Code im gemeinsam genutzten Speicher des Servers.

* **Auswirkungen auf die Entwicklung:** Dies ist für dich als Entwickler in der Regel transparent. Der Code wird schneller ausgeführt. In sehr aggressiven Entwicklungsumgebungen kann es jedoch vorkommen, dass du Änderungen an einer `.php`-Datei nach dem Neuladen nicht sofort siehst, wenn OPcache nicht so konfiguriert ist, dass die Zeitstempel der Dateien rechtzeitig neu validiert werden.

### 4. Browser- und Edge-Cache (CDN)

Dieses Caching findet außerhalb des Hauptservers statt. Webbrowser und Content Delivery Networks (CDN) speichern statische Ressourcen wie Stylesheets (`.css`), Skripte (`.js`), Bilder und Schriftarten.

* **Wie sich dies auf dein Plugin auswirkt:** Wenn du dein Plugin aktualisierst und eine neue JavaScript-Datei hinzufügst, aber denselben Dateinamen beibehältst, ist es sehr wahrscheinlich, dass Benutzer weiterhin die alte Version ausführen, die in ihren Browsern gespeichert ist.
* **Entwicklungshinweise:** Um dies zu vermeiden, ist es zwingend erforderlich, den Parameter **version** in den Enqueue-Funktionen (behandelt in Kapitel 7) korrekt zu verwenden.

```php
// Falsche Praxis: keine Version oder Erzwingen der globalen WP-Version
wp_enqueue_script( 'mi-plugin-script', plugin_dir_url( __FILE__ ) . 'assets/app.js', array(), null );

// Richtige Praxis: Verwenden der Plugin-Version oder des filemtime der Datei
$version = filemtime( plugin_dir_path( __FILE__ ) . 'assets/app.js' );
wp_enqueue_script( 'mi-plugin-script', plugin_dir_url( __FILE__ ) . 'assets/app.js', array(), $version );

```

### Vergleichstabelle für Entwickler

Zusammenfassend findest du hier eine Schnellreferenztabelle darüber, worauf du je nach der Ebene, auf der du arbeitest, achten musst:

| Caching-Ebene | Was gespeichert wird | Hauptrisiko für das Plugin | Typische Lösung |
| --- | --- | --- | --- |
| **Page** | Statisches HTML der gesamten URL | PHP-Logik wird ignoriert, veraltete Ansichten für Benutzer | AJAX/REST für dynamische Teile nutzen |
| **Object** | PHP-Daten und -Variablen | Lesen veralteter Daten in der DB | Korrekte Verwendung der Cache-Invalidierung |
| **Browser** | JS-, CSS-Dateien, Bilder | UI-Fehler durch alte JS/CSS-Dateien | Dynamische Versionierung in `wp_enqueue_*` |
| **Datenbank** | Rohe SQL-Abfragen (MySQL) | Selten problematisch, wenn du die WP-API nutzt | `$wpdb` korrekt verwenden |

## 11.2 Speichern mit Transients

Komplexe Datenbankabfragen und insbesondere Anfragen an APIs von Drittanbietern (wie das Verarbeiten eines externen Feeds oder das Abfragen eines Cloud-Dienstes) sind klassische Leistungsengpässe. Um dieses Problem zu mindern, bietet WordPress die **Transients API**, eine standardisierte Methode zur temporären Speicherung von Daten im Cache mit einer Ablaufzeit.

Im Wesentlichen ist ein *Transient* (flüchtiger Wert) einer Option sehr ähnlich, die über die Options-API gespeichert wird, aber mit einem entscheidenden Unterschied: **Er hat ein Ablaufdatum**.

### Wo werden Transients gespeichert?

Das Verhalten der Transients API is intelligent und passt sich der Serverumgebung an, in der dein Plugin installiert ist:

1. **Ohne persistenten Object-Cache:** Wenn der Server einfach konfiguriert ist, speichert WordPress die Transients direkt in der Tabelle `wp_options` der Datenbank. Es werden zwei Einträge pro Transient erstellt: einer für den Wert selbst und ein anderer für den Ablauf-Zeitstempel (Timestamp).
2. **Mit persistentem Object-Cache:** Wenn auf dem Server Redis oder Memcached (und das entsprechende *Drop-in* `object-cache.php`) konfiguriert ist, **rührt WordPress die Datenbank nicht an**. Es speichert die Transients direkt im ultraschnellen RAM-Speicher des Servers und delegiert die Verwaltung des Ablaufs an die Caching-Engine selbst.

### Die grösste Regel: Gehe niemals davon aus, dass das Transient existiert

Da Transients im RAM gespeichert und von Systemen wie Redis verwaltet werden können, **können sie vor ihrem Ablaufdatum verschwinden**. Wenn der Server Speicherplatz freigeben muss, entfernt er die ältesten Transients.

Daher darf dein Code niemals von der Existenz eines Transients abhängen, um zu funktionieren; er muss immer darauf vorbereitet sein, die Daten neu zu generieren, wenn die Abfrage des Transients `false` zurückgibt.

```text
Korrekter logischer Ablauf für ein Transient:

   Existiert das Transient im Cache?
                 │
           ┌─────┴─────┐
           │           │
        JA (Hit)    NEIN (Miss / Abgelaufen)
           │           │
           │           v
           │      1. Rechenintensive Aufgabe ausführen (DB-Abfrage / Externe API)
           │      2. Ergebnis mit set_transient() speichern
           │           │
           v           v
      [ Daten zur Verwendung zurückgeben ]

```

### Die wichtigsten API-Funktionen

Die API besteht im Wesentlichen aus drei unglaublich einfach zu verwendenden Funktionen.

#### 1. Ein Transient lesen: `get_transient()`

Erwartet den Namen des Transients und gibt dessen Wert zurück. Wenn das Transient nicht existiert oder bereits abgelaufen ist, gibt sie strikt den booleschen Wert `false` zurück.

*Sicherheitshinweis:* Da die Funktion bei einem Fehlschlag `false` zurückgibt, solltest du keine booleschen `false`-Werte in einem Transient speichern, da du sonst nicht unterscheiden kannst, ob der Wert tatsächlich `false` ist oder ob das Transient einfach abgelaufen ist. Wenn du boolesche Zustände speichern musst, verwende stattdessen Ganzzahlen (`1` o `0`).

#### 2. Ein Transient speichern: `set_transient()`

Speichert den Wert. Akzeptiert drei Parameter:

* `$transient` (string): Eindeutiger Name des Schlüssels (maximal 172 Zeichen). Es ist wichtig, eindeutige Präfixe zu verwenden, genau wie bei den Optionen.
* `$value` (mixed): Die zu speichernden Daten. Kann ein String, ein Array oder ein Objekt sein (WordPress kümmert sich automatisch um die Serialisierung).
* `$expiration` (int): Die Lebensdauer in **Sekunden**.

**Zeitkonstanten in WordPress:**
Um zu vermeiden, die Sekunden im Kopf berechnen zu müssen, und um deinen Code lesbarer zu machen, stellt WordPress globale Konstanten bereit, die du immer im Parameter `$expiration` verwenden solltest:

* `MINUTE_IN_SECONDS` (60)
* `HOUR_IN_SECONDS` (3600)
* `DAY_IN_SECONDS` (86400)
* `WEEK_IN_SECONDS` (604800)
* `MONTH_IN_SECONDS` (2592000)
* `YEAR_IN_SECONDS` (31536000)

#### 3. Ein Transient löschen: `delete_transient()`

Löscht das Transient manuell vor dem Ablauf. Nützlich, wenn du weißt, dass sich die ursprünglichen Daten geändert haben und du eine Aktualisierung erzwingen musst (z. B. beim Speichern eines Beitrags).

### Implementierung des Standardmusters

Die korrekte Verwendung von Transients erfordert das Zusammenfassen von Prüfung und Generierung in einem einzigen logischen Block. Unten wird das definitive Designmuster gezeigt, das du in deinen Plugins anwenden solltest:

```php
function mi_plugin_obtener_datos_complejos() {
    // 1. Wir definieren den Namen des Schlüssels (mit Präfix!)
    $transient_key = 'mi_plugin_usuarios_activos';

    // 2. Wir versuchen, die Daten zu holen
    $datos = get_transient( $transient_key );

    // 3. Wir überprüfen, ob es fehlgeschlagen ist (existiert nicht oder abgelaufen)
    if ( false === $datos ) {
        
        // 4. [RECHENINTENSIVE AUFGABE] Das Transient existiert nicht. Wir generieren die Daten.
        // Dies könnte ein WP_Query-Loop, eine mathematische Berechnung oder eine API-Abfrage sein.
        $datos = mi_plugin_consultar_api_externa_lenta();

        // 5. Wir speichern die neu generierten Daten. 
        // In diesem Beispiel speichern wir sie für 12 Stunden.
        set_transient( $transient_key, $datos, 12 * HOUR_IN_SECONDS );
    }

    // 6. Wir geben die Daten zurück, unabhängig davon, ob sie aus dem Transient stammen oder gerade neu generiert wurden.
    return $datos;
}

```

### Netzwerk-Transients (Multisite)

Wenn du für ein *Multisite*-Netzwerk (WPMU) entwickelst und möchtest, dass ein Transient für das gesamte Netzwerk verfügbar ist (und nicht nur für die spezifische Website innerhalb des Netzwerks, auf der es angefordert wurde), bietet WordPress eine variante der vorherigen Funktionen:

* `get_site_transient()`
* `set_site_transient()`
* `delete_site_transient()`

Diese Funktionen arbeiten exakt genauso, aber wenn kein Object-Cache konfiguriert ist, speichern sie die Daten in der Tabelle `wp_sitemeta` statt in `wp_options`.

## 11.3 Bereinigung und Invalidierung

Es gibt ein berühmtes Zitat in der Softwareentwicklung, das Phil Karlton zugeschrieben wird: *„Es gibt nur zwei schwierige Dinge in der Informatik: Cache-Invalidierung und das Benennen von Dingen“*. Bei der Entwicklung von WordPress-Plugins gewinnt diese Aussage eine absolute Bedeutung.

Deberías borrar este transient cada vez que un post se guarde, se actualice o se elimine.

Die aktive Invalidierung besteht darin, den Cache programmgesteuert genau in dem Moment zu leeren, in dem sich die zugrunde liegenden Daten ändern. Dies garantiert, dass die Benutzer immer frische Informationen sehen, ohne die Gesamtleistung zu beeinträchtigen.

### Eventbasierte Invalidierung (Hooks)

Die eventbasierte Architektur von WordPress macht die Cache-Invalidierung vorhersehbar. Du musst identifizieren, welche Aktionen (Actions) die von dir gecachten Daten verändern, und deine Bereinigungsfunktionen an diese spezifischen Punkte anhängen.

Angenommen, du hast ein Transient namens `mi_plugin_lista_posts_destacados`. Du solltest dieses Transient jedes Mal löschen, wenn ein Beitrag gespeichert, aktualisiert oder gelöscht wird.

```php
// Funktion zur Bereinigung der spezifischen Transients des Plugins
function mi_plugin_limpiar_cache_destacados( $post_id ) {
    // Unnötige Bereinigungen während des automatischen Speicherns vermeiden
    if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
        return;
    }

    // Das Transient löschen
    delete_transient( 'mi_plugin_lista_posts_destacados' );
}

// Die Bereinigung an Aktionen anhängen, die den Inhalt verändern
add_action( 'save_post', 'mi_plugin_limpiar_cache_destacados' );
add_action( 'deleted_post', 'mi_plugin_limpiar_cache_destacados' );

```

### Das Problem der Masseninvalidierung (und die Lösung der Versionierung)

Im Gegensatz zu SQL-Abfragen erlaubt die Transients-API das Löschen mehrerer Einträge mit Platzhaltern nicht (es gibt kein `delete_transient( 'mi_plugin_*' )`). Wenn dein Plugin Hunderte von dynamischen Transients generiert (z. B. `mi_plugin_usuario_1`, `mi_plugin_usuario_2` etc.), ist das Iterieren über all diese zum Löschen ineffizient und in Umgebungen mit persistentem Object-Cache oft unmöglich, ohne die genauen Schlüssel zu kennen.

Die professionelle Lösung für dieses Problem ist die **Cache-Versionierung**.

Anstatt Transients einzeln zu löschen, fügst du dem Namen des Transient-Schlüssels eine globale Versionsnummer hinzu. Wenn du alle Transients deines Plugins auf einmal invalidieren musst, erhöhst du einfach diese Versionsnummer. Die alten Transients werden verwaisen, und die Caching-Engine wird sie schließlich entfernen, wenn sie ablaufen oder Speicherplatz freigegeben werden muss.

```text
[Ablauf der Cache-Versionierung]

1. Globale Option in DB: 'mi_plugin_cache_version' = "v1"
2. Generierter Schlüssel: 'mi_plugin_datos_usuario_7_v1'
3. Der Administrator ändert eine globale Einstellung.
4. Das Plugin aktualisiert 'mi_plugin_cache_version' auf "v2".
5. Nächste Anfrage sucht nach: 'mi_plugin_datos_usuario_7_v2' -> (Miss!)
6. Der Cache wird mit den neuen Daten neu generiert.

```

**Implementierung im Code:**

```php
function mi_plugin_obtener_version_cache() {
    $version = get_option( 'mi_plugin_cache_version' );
    if ( ! $version ) {
        $version = time(); // Einen Timestamp als initiale Version verwenden
        update_option( 'mi_plugin_cache_version', $version );
    }
    return $version;
}

// Zur Verwendung beim Speichern/Lesen von Daten:
$clave = 'mis_datos_' . mi_plugin_obtener_version_cache();
set_transient( $clave, $datos, DAY_IN_SECONDS );

// Um den gesamten Cache des Plugins sofort zu invalidieren:
function mi_plugin_invalidar_toda_la_cache() {
    update_option( 'mi_plugin_cache_version', time() );
}

```

### Bereinigung des Page-Caches von Drittanbietern

Wenn dein Plugin die visuelle Oberfläche des Frontends verändert (z. B. ein globales Banner über deine Optionen aktualisiert), reicht das Löschen der *Transients* nicht aus, wenn die Website ein Page-Caching-Plugin (WP Rocket, W3 Total Cache, LiteSpeed etc.) verwendet, da diese statisches HTML ausgeben.

Gut programmierte Caching-Plugins hören auf Standard-Hooks wie `clean_post_cache` oder `save_post`, um Teile ihres eigenen Caches zu leeren. Wenn dein Plugin jedoch benutzerdefinierte Tabellen oder globale Einstellungen verwendet, die diese nativen Hooks nicht auslösen, musst du die Seitenbereinigung explizit aufrufen.

Um Best Practices einzuhalten, gehe niemals davon aus, dass ein Plugin eines Drittanbieters aktiv ist. Überprüfe, ob seine Purge-Funktion existiert, bevor du sie aufrufst:

```php
function mi_plugin_purgar_cache_pagina() {
    // WP Rocket
    if ( function_exists( 'rocket_clean_domain' ) ) {
        rocket_clean_domain();
    }
    
    // W3 Total Cache
    if ( function_exists( 'w3tc_flush_all' ) ) {
        w3tc_flush_all();
    }

    // LiteSpeed Cache
    if ( defined( 'LSCWP_V' ) || defined( 'LSCWP_DIR' ) ) {
        do_action( 'litespeed_purge_all' );
    }
}

```

### Die Gefahr von `wp_cache_flush()`

Bei der Arbeit mit dem Object-Cache (den wir im nächsten Abschnitt im Detail besprechen werden) gibt es eine zentrale Funktion namens `wp_cache_flush()`. Ihr Zweck ist es, den gesamten Speicher des Object-Caches zu leeren.

**Strikte Warnung:** Als Plugin-Entwickler solltest du **niemals `wp_cache_flush()` in einer Produktionsumgebung als Reaktion auf eine Benutzeraktion (wie das Speichern einer Einstellung) aufrufen.**

Dies löscht nicht nur den Cache deines Plugins, sondern den des gesamten WordPress-Cores, anderer Plugins und in schlecht konfigurierten Shared-Hosting-Servern (wo Redis/Memcached nicht nach Präfixen isoliert) möglicherweise auch den Cache anderer Websites, die auf demselben Server gehostet werden. Das Ergebnis ist ein massiver Anstieg der CPU-Last und der Datenbankabfragen (bekannt als *Cache Stampede* oder Cache-Ansturm), der den Server sofort lahmlegen kann. Verwende immer selektives Löschen oder die Versionierungstechnik.

## 11.4 Object Cache auf Codeebene

Die Object Cache API ist die interne Engine, die einen großen Teil der WordPress-Leistung stützt. Im Gegensatz zu *Transients*, die so konzipiert sind, dass sie standardmäßig bestehen bleiben (entweder in der Datenbank oder im Speicher), ist der native Object-Cache in seiner reinen Form ein **nicht persistentes** RAM-Speichersystem. Das bedeutet, dass die Daten nur während des Lebenszyklus der aktuellen HTTP-Anfrage existieren und sofort nach Beendigung der Ausführung des PHP-Skripts zerstört werden.

Wenn der Server jedoch über ein persistentes Caching-System (wie Redis oder Memcached) und dessen entsprechende *Drop-in*-Datei `object-cache.php` im Verzeichnis `/wp-content/` verfügt, speichern dieselben Funktionen dieser API die Daten automatisch dauerhaft zwischen den Anfragen. Dein Code als Plugin-Entwickler sollte so geschrieben werden, dass er davon ausgeht, dass sich die Umgebung ohne Vorankündigung von nicht persistent zu persistent ändern kann.

### Grundlegende API-Funktionen

Auf Codeebene interagieren wir mit die API über vier Hauptfunktionen. Alle teilen eine hierarchische Struktur, die auf einem Schlüssel (`$key`) und einer Gruppe (`$group`) basiert.

#### 1. `wp_cache_set()` und `wp_cache_add()`

Beide Funktionen speichern Daten im Speicher, aber ihr Verhalten bei bereits vorhandenen Daten unterscheidet sich grundlegend:

* `wp_cache_set( $key, $value, $group = '', $expire = 0 )`: Speichert den Wert, unabhängig davon, ob der Schlüssel bereits existiert. Wenn er bereits vorhanden war, überschreibt sie den vorherigen Wert.
* `wp_cache_add( $key, $value, $group = '', $expire = 0 )`: Speichert den Wert nur dann, **wenn der Schlüssel zuvor nicht existiert**. Wenn der Schlüssel bereits vorhanden ist, gibt die Funktion `false` zurück und ändert nichts. Dies ist ideal, um Race Conditions (Wettlaufsituationen) zu vermeiden.

*Hinweis zu `$expire`:* Wird wie bei Transients in Sekunden gemessen. Wenn kein persistentes Caching-System von Drittanbietern verwendet wird, wird dieser Parameter vollständig ignoriert, da der Speicher am Ende der Anfrage geleert wird.

#### 2. `wp_cache_get()`

`wp_cache_get( $key, $group = '', $force = false, &$found = null )`: Ruft den unter diesem Schlüssel und dieser Gruppe gespeicherten Wert ab.

#### 3. `wp_cache_delete()`

`wp_cache_delete( $key, $group = '' )`: Löscht das Objekt sofort aus dem Speicher.

### Das Konzept der Cache-„Gruppen“

Der Parameter `$group` ermöglicht es dir, den Cache deines Plugins zu unterteilen. Dies verhindert Namenskollisionen mit dem WordPress-Core oder anderen Plugins. Anstatt einen kilometerlangen Schlüssel wie `mi_plugin_perfil_usuario_42` zu erstellen, kannst du es sauber strukturieren:

```php
// Schlüssel: 42, Gruppe: mi_plugin_usuarios
wp_cache_set( 42, $datos_usuario, 'mi_plugin_usuarios' );

```

Zudem nutzen einige persistente Caching-Engines wie Memcached oder Redis Gruppen, um eine selektive Invalidierung oder das Leeren einer ganzen Gruppe zu ermöglichen, was die Bereinigung massiv optimiert.

### Das strikte Überprüfungsmuster: Der Parameter `$found`

Ein kritischer und sehr häufiger Fehler bei fortgeschrittenen Entwicklern ist die Überprüfung der Existenz eines Objekts im Cache, indem direkt ausgewertet wird, ob das Ergebnis von `wp_cache_get()` gleich `false` ist:

```php
// FALSCHE PRAXIS
$resultado = wp_cache_get( 'estado_licencia', 'mi_plugin_grupo' );
if ( false === $resultado ) {
    // Ist der Cache abgelaufen oder ist der tatsächliche Status der Lizenz (bool) false?
}

```

Wenn das legitime Ergebnis einer rechenintensiven Datenbankabfrage oder API-Abfrage der boolesche Wert `false`, ein leerer String `""` o die Ganzzahl `0` ist, schlägt die traditionelle Überprüfung katastrophal fehl. Dies zwingt dein Plugin dazu, die rechenintensive Aufgabe bei jeder Anfrage zu wiederholen.

Um dies zu lösen, hat WordPress den vierten Parameter per Referenz namens `$found` eingeführt. Dieser Parameter wird auf `true` gesetzt, wenn der Schlüssel im Cache existiert (selbst wenn sein Wert `false` oder `null` ist), und auf `false`, wenn es sich tatsächlich um einen *Cache Miss* handelt.

### Professionelle Implementierung des Object-Caches

Im Folgenden wird die genaue Struktur beschrieben, die du implementieren solltest, um kostenintensive Operationen mittels Object-Cache unter Verwendung des Parameters `$found` zu kapseln:

```php
function mi_plugin_obtener_metricas_avanzadas( $usuario_id ) {
    $cache_key   = 'metricas_' . $usuario_id;
    $cache_group = 'mi_plugin_informes';
    $found       = false; // Variable, die wir per Referenz übergeben werden

    // Wir versuchen, den Wert abzurufen und seine tatsächliche Existenz zu überprüfen
    $metricas = wp_cache_get( $cache_key, $cache_group, false, $found );

    // Wenn $found wahr ist, existiert der Cache (Hit). Wir geben ihn direkt zurück.
    if ( $found ) {
        return $metricas;
    }

    // Wenn wir hier ankommen, handelt es sich um einen Cache Miss. Wir führen die rechenintensive Logik aus.
    $metricas = mi_plugin_calculo_estructural_pesado( $usuario_id );

    // Wir speichern das Ergebnis im Object-Cache (läuft in 1 Stunde ab, wenn er persistent ist)
    wp_cache_set( $cache_key, $metricas, $cache_group, HOUR_IN_SECONDS );

    return $metricas;
}

```

### Wann man Transients vs. Object-Cache verwendet

Um die Leistungsarchitektur deines Plugins abzurunden, solltest du dir diese technische Unterscheidung merken:

```text
Müssen die Daten GARANTIERT zwischen den Anfragen überleben?
 ├── JA ──> Sind es benutzerspezifische oder dynamische Daten? ──> TRANSIENTS API
 └── NEIN ─> Werden sie nur während des aktuellen Ladevorgangs benötigt? ─> OBJECT CACHE API

```

* **Verwende Transients:** Wenn du eine externe API abfragst (wie Wetterdaten, Wechselkurse oder Remote-Lizenzvalidierung) und sicherstellen musst, dass die Daten garantiert über Stunden hinweg erhalten bleiben – selbst auf dem günstigsten Shared Hosting ohne Redis.
* **Verwende den Object-Cache:** Wenn du benutzerdefinierte SQL-Abfragen mit `$wpdb` im Code deines Plugins durchführst, die sich in derselben Anfrage mehrmals wiederholen können, oder um Datenstrukturen im Speicher abzurufen, die drastisch profitieren, wenn der Kunde eine Hochleistungsumgebung auf Basis von Redis/Memcached nutzt.

## Zusammenfassung des Kapitels

In diesem Kapitel haben wir die Optimierungs- und Leistungsverwaltungsebenen bei der professionellen Entwicklung von WordPress-Plugins gemeistert:

1. **Caching-Unterschiede in WP:** Wir haben gelernt, den Lebenszyklus einer HTTP-Anfrage abzubilden und zu verstehen, wie Page-Cache (der die Ausführung von PHP blockiert), Object-Cache (intern für Daten), OPcache (Skript-Vorkompilierung) und die Versionierung statischer Dateien im Browser zusammenwirken.
2. **Speichern mit Transients:** Wir haben die Transients API als Mechanismus zur aktiven temporären Persistenz untersucht, ihr adaptives Speichern (Tabelle `wp_options` oder RAM) verstanden und das korrekte Rettungsmuster bei einem *Cache Miss* gelernt.
3. **Bereinigung und Invalidierung:** Wir haben die Strategien zur Wahrung der Datenintegrität durch reaktive Bereinigung im Zusammenhang mit Hooks, die globalen Gefahren von `wp_cache_flush()` und die fortgeschrittene Technik der Cache-Schlüssel-Versionierung für sofortige Masseninvalidierungen analysiert.
4. **Object Cache auf Codeebene:** Wir haben die interne API `WP_Object_Cache`, die strategische Verwendung von Cache-Gruppen und das zwingende Entwicklungsmuster unter Verwendung des strikten Überprüfungsparameters `$found` per Referenz aufgeschlüsselt.
