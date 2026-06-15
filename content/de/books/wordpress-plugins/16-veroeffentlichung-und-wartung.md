Die Entwicklung eines robusten Plugins ist nur die halbe Miete; die wahre Feuerprobe besteht darin, es zu teilen und im globalen Ökosystem lebendig zu halten. In diesem abschließenden Kapitel verlassen wir die lokale Umgebung, um in den offiziellen Veröffentlichungsprozess im Repository von WordPress.org einzusteigen.

Du wirst lernen, die strengen Richtlinien des offiziellen Review-Teams zu meistern, eine `readme.txt`-Datei zu strukturieren, die dein Projekt korrekt positioniert, und Subversion (SVN) als finales Deployment-Werkzeug zu beherrschen. Schließlich widmen wir uns dem Lebenszyklus nach dem Release: semantische Versionierung, das Schreiben von Changelogs und Routinen zur Datenaktualisierung.

## 16.1 Richtlinien des Repositories

Die Veröffentlichung eines Plugins im offiziellen Repository von WordPress.org ist kein automatisches Recht; es ist ein Privileg, das an ein strenges Regelwerk geknüpft ist, welches vom Plugin-Review-Team gepflegt wird. Diese Richtlinien sollen die Sicherheit, die Privatsphäre und die Freiheit der Millionen von Benutzern gewährleisten, die dem WordPress-Ökosystem vertrauen.

Bevor du deinen Code paketierst oder deine Versionskontroll-Infrastruktur vorbereitest, ist es zwingend erforderlich, deine Entwicklung anhand dieser Richtlinien zu überprüfen. Ein Verstoß führt zur sofortigen Ablehnung im ersten Review-Prozess oder zum Ausschluss aus dem Repository, falls der Verstoß erst im Nachhinein entdeckt wird.

### 1. Lizenzierung und die GPL-Regel

Die tragende Säule des WordPress-Repositories ist die freie Software-Lizenz. Jeder auf WordPress.org gehostete Code muss diese Prämisse ausnahmslos erfüllen.

* **Strikte GPL-Kompatibilität:** Dein Plugin muss unter der GNU General Public License v2 (oder höher) oder einer damit kompatiblen Lizenz lizenziert sein.
* **Gültigkeit für Drittanbieter:** Diese Regel gilt nicht nur für deinen PHP-Code. **Jede Bibliothek, jedes Drittanbieter-Skript, jedes CSS-Framework oder sogar Multimedia-Ressourcen** (Bilder, Schriftarten), die im Plugin-Verzeichnis enthalten sind, müssen eine GPL-kompatible Lizenz haben. Du darfst keine proprietären oder urheberrechtlich eingeschränkten Abhängigkeiten einbinden.

### 2. Namensgebung und Markenrechte

Der Name deines Plugins ist seine Visitenkarte, aber das Review-Team ist äußerst streng bei der Namensgebung, um rechtliche Verwirrungen und Täuschungen der Benutzer zu vermeiden.

* **Einschränkung des Wortes „WordPress“:** Du darfst „WordPress“ nicht im Namen deines Plugins verwenden. Wenn du auf das CMS verweisen musst, solltest du „WP“ oder Formulierungen wie „Mein Plugin für WordPress“ verwenden. (Falsches Beispiel: *WordPress SEO Backup*; Richtiges Beispiel: *SEO Backup for WordPress* oder *WP SEO Backup*).
* **Marken von Drittanbietern:** Du darfst keine eingetragenen Markennamen (wie *Google, Twitter, WooCommerce*) verwenden, es sei denn, du besitzt die Rechte daran oder nutzt eine legitime Kompatibilitätsbezeichnung (z. B. *Addon for WooCommerce*, nicht *WooCommerce Addon*).
* **Verbot von Namensbesetzung (Squatting):** Du darfst keine leeren Plugin-Namen für die zukünftige Verwendung reservieren. Wenn das Plugin genehmigt wird, muss es funktionstüchtigen Code enthalten.

### 3. Datenschutz und externe Kommunikation (Phoning Home)

Das Repository schützt die Privatsphäre der Benutzer eifersüchtig. Unaufgeforderte Kommunikationen mit externen Servern gehören zu den Hauptursachen für Ablehnungen und Ausschlüsse.

* **Tracking standardmäßig verboten:** Dein Plugin darf ohne die **explizite, informierte und proaktive Zustimmung** (Opt-In) des Administrators keine Nutzungsdaten (Telemetrie), Serverinformationen oder Listen aktiver Plugins erfassen. Opt-Out (standardmäßig aktiviertes Tracking mit der Option, es zu deaktivieren) ist strengstens untersagt.
* **Abhängigkeiten von externen Diensten (SaaS):** Wenn dein Plugin als Brücke zu einem externen Dienst fungiert (z. B. einer Übersetzungs-API oder einem CRM), muss dies in der Beschreibung deutlich angegeben werden. Zudem muss jede Übertragung von Benutzerdaten an diese API mit Zustimmung des Benutzers und unter Einhaltung von Vorschriften wie der DSGVO (GDPR) erfolgen.
* **Herunterladen von Remote-Code:** Es ist strengstens verboten, nach der Aktivierung Code auszuführen oder ausführbare Dateien von Servern Dritter herunterzuladen. Jeder ausführbare PHP-/JS-Code muss im Plugin-Paket selbst auf den Servern von WordPress.org enthalten sein.

### 4. Codepraktiken und Benutzererfahrung

Obwohl bei der manuellen Überprüfung Sicherheitsstandards (wie in Kapitel 10 behandelt) bewertet werden, gibt es spezifische operative Richtlinien für das Repository:

* **Verbot von Code-Verschleierung:** Der gesamte Code muss für Menschen lesbar sein. Verschleierungswerkzeuge (Obfuscation) wie `eval()`, `base64_decode()`, die auf komplexe Logiken angewendet werden, oder Kompressoren, die eine Code-Auditierung verhindern, führen zur automatischen Ablehnung. Die Minifizierung von CSS- und JS-Dateien ist erlaubt, es wird jedoch empfohlen (und manchmal verlangt), die nicht-minifizierten Originaldateien bereitzustellen.
* **Hijacking der Benutzeroberfläche:** Dein Plugin darf die WordPress-Benutzeroberfläche nicht drastisch verändern. Dies schließt das Einfügen aufdringlicher Werbung in den Admin-Bereichen anderer Plugins, das Modifizieren von Core-Menüs zur erzwungenen Sichtbarkeit oder das Verhindern, dass der Benutzer Admin-Hinweise (Notices) ausblenden kann, ein.
* **Einschränkungen für „Pro“-Versionen:** Das WordPress.org-Repository ist für kostenlose Software gedacht. Wenn dein Plugin ein *Freemium*-Modell verwendet (eine kostenlose Version anbietet und eine externe Premium-Version verkauft), muss die im Repository gehostete kostenlose Version in sich funktionsfähig sein. Es darf sich nicht lediglich um eine „Werbeanzeige“ handeln, die eine Zahlung erfordert, um ihre versprochene Hauptfunktion auszuführen.

### Prüfungsablauf der Richtlinien

Nachfolgend wird der grundlegende Entscheidungsbaum veranschaulicht, den das automatisierte und manuelle Review-Team (Plugin Check) vor der Genehmigung einer Entwicklung anwendet:

```text
+-------------------------------------------------------------------+
|                   RICHTLINIEN-AUDIT (PRE-SVN)                     |
+-------------------------------------------------------------------+
                               |
                               v
               [ Entspricht der Code GPLv2+? ]
               / (Ja)                    (Nein) \
              v                                  v
 [ Sind die Abhängigkeiten ebenfalls GPL? ]     ( ABLEHNUNG: Ungültige Lizenz )
         / (Ja)       (Nein) \
        v                   v
        |           ( ABLEHNUNG: Bibliothekskonflikt )
        v
 [ Verletzt der Name Markenrechte o verwendet er „WordPress“? ]
         \ (Nein)     (Ja) /
          v               v
          |         ( ABLEHNUNG: Markenrechtsverletzung )
          v
 [ Führt es ausgehende Anrufe (Telemetrie) ohne Opt-In durch? ]
         \ (Nein)     (Ja) /
          v               v
          |         ( ABLEHNUNG: Datenschutzverletzung )
          v
 [ Enthält es verschleierten Code o lädt es Remote-Skripte herunter? ]
         \ (Nein)     (Ja) /
          v               v
          |         ( SPERRE: Kritisches Sicherheitsrisiko )
          v
 [ GENEHMIGUNG: Weiterleitung zum manuellen Sicherheitsreview und SVN-Erstellung ]

```

### 5. Dokumentation und Ehrlichkeit

Das Repository verlangt Ehrlichkeit im internen Marketing. Praktiken des „SEO-Spamming“ (wie das übermäßige Wiederholen von Schlüsselwörtern in der Beschreibung) oder die Vergabe irrelevanter Tags zur Erhöhung der Sichtbarkeit werden bestraft. Das Review-Team kann deine *readme*-Datei ändern, missbräuchliche Such-Tags entfernen oder im Extremfall das Plugin vorübergehend sperren, bis du die irreführenden Werbetaktiken korrigierst.

## 16.2 Vorbereitung der readme-Datei

Die Datei `readme.txt` ist weit mehr als nur ein einfaches Textdokument für Entwickler; sie ist der motor, der die Präsentationsseite deines Plugins im offiziellen Verzeichnis von WordPress.org und die im Admin-Bereich der Benutzer angezeigten Informationen generiert.

WordPress verwendet einen strengen Parser, um diese Datei zu verarbeiten. Wenn die Syntax fehlerhaft ist oder Pflichtfelder fehlen, zeigt die Seite deines Plugins falsche Informationen oder Inkompatibilitätswarnungen an, oder sie wird gar nicht erst aktualisiert, was ihre Verbreitung drastisch beeinträchtigt.

### Struktur und grundlegende Syntax

Die Datei verwendet eine spezifische Markdown-Variante, die durch verschiedene Überschriftenebenen (`===`, `==`, `=`) strukturiert ist. Jedes professionelle Plugin sollte eine Basisvorlage enthalten, die die wesentlichen Metadaten, Abhängigkeiten und die Navigations-Tabs des Repositories abdeckt.

Nachfolgend wird der erforderliche Standardaufbau für die Datei `readme.txt` gezeigt:

```text
=== Genaue Bezeichnung deines Plugins ===
Contributors: dein_wp_benutzername, anderer_mitwirkender
Tags: sicherheit, firewall, login
Requires at least: 5.8
Tested up to: 6.4
Stable tag: 1.0.0
Requires PHP: 7.4
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Dies ist die Kurzbeschreibung. Sie darf maximal 150 Zeichen lang sein und ist das, was Benutzer in den Suchergebnissen in ihrem WordPress-Dashboard lesen.

== Description ==

Dies ist die ausführliche Beschreibung. Hier erklärst du, was dein Plugin tut, warum es nützlich ist und welche Funktionen herausstechen. Du kannst Markdown verwenden, um diesen Inhalt mit Listen, Fettschrift und Links zu strukturieren.

* Funktion 1
* Funktion 2

== Installation ==

1. Lade den Ordner `mein-plugin` in das Verzeichnis `/wp-content/plugins/` hoch.
2. Aktiviere das Plugin über das Menü 'Plugins' in WordPress.
3. Gehe zu 'Einstellungen > Mein Plugin', um es zu konfigurieren.

== Frequently Asked Questions ==

= Ist es multisite-kompatibel? =
Ja, das Plugin wurde in Multisite-Umgebungen getestet.

== Screenshots ==

1. Haupt-Konfigurations-Dashboard.
2. Ansicht des Widgets im Frontend.

== Changelog ==

= 1.0.0 =
* Initialer Release.

```

### Analyse der kritischen Metadaten

Der obere Bereich der Datei (der Header) steuert die Distributionslogik und die visuelle Sicherheit deines Plugins im Ökosystem. Fehler an dieser Stelle können dazu führen, dass WordPress dein Plugin als „inkompatibel“ mit neueren Versionen kennzeichnet.

* **Contributors:** Die Benutzernamen (WordPress.org-IDs) der Entwickler. Diese Personen erhalten Schreibzugriff auf das SVN-Repository (sofern der Hauptinhaber diesen gewährt) und werden öffentlich auf der Plugin-Seite aufgeführt.
* **Tags:** Die Keywords (durch Kommas getrennt), über die Benutzer dein Plugin finden. **Das strikte Limit liegt bei 5 Tags**. Wenn du mehr hinzufügst, ignoriert das Repository diese.
* **Requires at least / Requires PHP:** Legen die Mindestanforderungen des Systems fest. Wenn ein Benutzer versucht, dein Plugin mit einer niedrigeren als den hier angegebenen Versionen zu installieren, blockiert WordPress die Installation, um Fatal Errors (schwerwiegende Fehler) zu vermeiden.
* **Tested up to:** Dieses Feld solltest du bei jedem neuen Major-Release von WordPress gewissenhaft aktualisieren. Wenn es nicht mit der aktuellen Core-Version übereinstimmt, erscheint ein gefürchteter gelber Warnhinweis: *„Dieses Plugin wurde noch nicht mit deiner aktuellen WordPress-Version getestet“*.
* **Stable tag:** Gibt an, welche Version del Codes der Benutzer herunterladen soll. Wenn du das Tag `trunk` verwendest, laden Benutzer immer den zuletzt hochgeladenen Code herunter (nicht für Produktionsumgebungen empfohlen). Ideal ist es, auf eine spezifische Versionsnummer zu verweisen (z. B. `1.0.0`), die einem Tag-Ordner in deinem SVN-Repository entspricht.

### Mapping der Repository-Benutzeroberfläche

Um zu verstehen, wie der Parser von WordPress.org deinen Text in eine interaktive Webseite verwandelt, betrachte das folgende Rendering-Schema:

```text
+------------------------------------+       +---------------------------------------------+
| Abschnitte in readme.txt           |       | Benutzeroberfläche auf WordPress.org        |
+------------------------------------+       +---------------------------------------------+
| === Mein Plugin ===                | --->  | Haupttitel der Seite (H1).                  |
| Kurzbeschreibung (150 Zeichen).    | --->  | Untertitel unter H1 / Such-Snippet.         |
| Metadaten (Requires, Tested...).   | --->  | Rechte Seitenleiste (Meta-Informationen).   |
| == Description ==                  | --->  | Reiter „Details“ (Standardansicht).         |
| == Installation ==                 | --->  | Reiter „Installation“.                      |
| == FAQ ==                          | --->  | Reiter „Support“ oder FAQ-Bereich.          |
| == Screenshots ==                  | --->  | Reiter „Screenshots“ (*).                   |
| == Changelog ==                    | --->  | Reiter „Entwicklung“ (Changelog).           |
+------------------------------------+       +---------------------------------------------+

```

*(Hinweis zu Screenshots: Der in diesem Abschnitt der readme-Datei eingegebene Text dient als Bildunterschrift für die physischen Bilder, die du später in den Ordner `/assets/` deines SVN-Repositories hochlädst, benannt als `screenshot-1.png`, `screenshot-2.png` etc.)*

### Vorab-Validierung

Bevor du deinen Code zur offiziellen Überprüfung einreichst, ist es gängige Praxis, deine Datei durch den offiziellen Validator (`wordpress.org/plugins/developers/readme-validator/`) laufen zu lassen. Dieses Tool verarbeitet die Datei genauso wie das echte Repository, sodass du Formatierungsfehler in Markdown, falsch referenzierte stabile Tags oder unvollständige Lizenzinformationen erkennen kannst, bevor sie auf der öffentlichen Seite sichtbar werden.

## 16.3 Versionsverwaltung mit SVN

Obwohl sich Git als Branchenstandard für die Versionskontrolle etabliert hat, arbeitet die Repository-Infrastruktur von WordPress.org weiterhin mit **Subversion (SVN)**. Dies ist oft die größte Hürde für moderne Entwickler.

Es ist jedoch wichtig, ein zentrales Paradigma zu verstehen: **Du bist nicht verpflichtet, deine Entwicklung mit SVN durchzuführen**. Die empfohlene Praxis besteht darin, Git und GitHub/GitLab für deinen täglichen Workflow zu nutzen und SVN ausschließlich als **finalen Deployment-Mechanismus** zu behandeln.

### Die SVN-Verzeichnisstruktur

Sobald dein Plugin genehmigt wurde, WordPress.org generiert ein leeres SVN-Repository. Wenn du es auscheckst (clonst), findest du eine vordefinierte und unveränderliche Ordnerstruktur vor, die du strikt einhalten musst.

```text
mi-plugin-repositorio/
├── assets/       # Banners, Header-Icons und Screenshots.
├── branches/     # Alternative Entwicklungszweige (in WP selten verwendet).
├── tags/         # Veröffentlichte und unveränderliche Versionen (z. B. 1.0.0, 1.1.0).
│   ├── 1.0.0/    # Exakte Kopie des Codes der Version 1.0.0.
│   └── 1.0.1/    # Exakte Kopie des Codes der Version 1.0.1.
└── trunk/        # Die aktive Codebasis. Äquivalent zu „main“ oder „master“ in Git.

```

* **`trunk/`**: Hier liegt der Code in der Entwicklung. Wenn du in deiner `readme.txt` `Stable tag: trunk` konfiguriert hast, laden Benutzer immer den Inhalt dieses Ordners herunter. **Dies wird nicht empfohlen**; `trunk` sollte ein Testbereich für die nächste Version sein.
* **`tags/`**: Dieses Verzeichnis ist heilig. Jeder Unterordner hier repräsentiert eine offizielle Version (Release). Wenn du in der readme `Stable tag: 1.0.0` konfigurierst, sucht WordPress nach dem Ordner `/tags/1.0.0/` und paketiert dessen Inhalt als ZIP-Datei, die Benutzer herunterladen. **Ändere niemals Code innerhalb eines bestehenden Tags**; bei Fehlern musst du eine neue Version herausbringen (z. B. 1.0.1).
* **`assets/`**: Beherbergt die visuellen Elemente für die Repository-Seite, getrennt vom Plugin-Code. Hier liegen Dateien mit strengen Bezeichnungen wie `icon-256x256.png` oder `banner-772x250.png`. Sie sind nicht in der vom Benutzer heruntergeladenen ZIP-Datei enthalten, was Speicherplatz spart.

### Manueller Workflow: Von Git zu SVN

Wenn du keine Automatisierungen verwendest, erfordert die Veröffentlichung einer neuen Version die manuelle Synchronisierung deines lokalen Codes mit dem SVN-Repository über die Befehlszeile.

Nachfolgend wird der vollständige Lebenszyklus eines initialen Releases (Version 1.0.0) veranschaulicht:

```bash
# 1. Lokales Auschecken (Klonen) deines neuen SVN-Repositories
svn co https://plugins.svn.wordpress.org/tu-plugin-slug mi-plugin-svn
cd mi-plugin-svn

# 2. Kopieren deines fertigen Codes (aus deinem Git-Repo) in den Ordner trunk
# (Stelle sicher, dass du den versteckten Ordner .git und Entwicklungsdateien NICHT mitkopierst)
cp -r /ruta/a/tu/git/* trunk/

# 3. SVN über die neuen Dateien informieren
svn add trunk/*

# 4. Senden (Commit) der Änderungen an den Server im Ordner trunk
svn ci -m "Lanzamiento inicial en trunk" --username tu_usuario_wp

# 5. Erstellen der stabilen Version durch Tagging (Kopieren von trunk nach tags)
svn cp https://plugins.svn.wordpress.org/tu-plugin-slug/trunk \
       https://plugins.svn.wordpress.org/tu-plugin-slug/tags/1.0.0 \
       -m "Etiquetando versión 1.0.0" --username tu_usuario_wp

```

\*Hinweis zu `svn cp`: Da die Kopie direkt über die Remote-URLs ausgeführt wird (wie in Schritt 5), findet die Operation direkt auf dem WordPress-Server statt. Dies geschieht augenblicklich und vermeidet das Herunterladen und erneute Hochladen des gesamten Codes.\*

### Mapping von Versionen und Synchronisierung

Das WordPress-Ökosystem vergleicht die Informationen aus mehreren Dateien, um zu ermitteln, ob Benutzer über ein Update benachrichtigt werden sollten. Damit eine neue Version korrekt erkannt und installiert wird, musst du sicherstellen, dass **drei Elemente perfekt übereinstimmen**:

```text
+-----------------------+     +-----------------------+     +-----------------------+
|  Hauptdatei des       |     |  readme.txt-Datei     |     |  SVN-Struktur         |
|  Plugins (.php)       |     |  in trunk/            |     |                       |
+-----------------------+     +-----------------------+     +-----------------------+
|                       |     |                       |     |                       |
| Plugin Name: Mi Plug  |     | === Mi Plug ===       |     | /trunk/               |
| Version: 1.1.0  <----(A)--->| Stable tag: 1.1.0 <--(B)--->| /tags/1.1.0/          |
|                       |     |                       |     |                       |
+-----------------------+     +-----------------------+     +-----------------------+

```

1. **(A) Versionskonsistenz:** Die Angabe `Version` im Header deiner Haupt-PHP-Datei muss mit dem Eintrag in deiner `readme.txt` übereinstimmen.
2. **(B) Verzeichnisauflösung:** Das in deiner `readme.txt` (innerhalb von `/trunk`) angegebene `Stable tag` muss als gleichnamiger Ordner im Verzeichnis `/tags/` deines SVN existieren.

### Automatisierung: Continuous Deployment (CI/CD)

Die manuelle Handhabung von SVN ist anfällig für menschliche Fehler (Vergessen, die Version in einer Datei zu aktualisieren, oder Mitkopieren unerwünschter Entwicklungsdateien). In der modernen professionellen Entwicklung delegiert man diesen Prozess an Continuous-Integration-Pipelines.

Wenn du GitHub verwendest, ist die von der Community am häufigsten genutzte GitHub Action **`10up/action-wordpress-plugin-deploy`**. Durch die Konfiguration dieses Workflows reduziert sich dein Prozess auf das Erstellen eines „Releases“ auf GitHub. Die Action kümmert sich automatisch darum, die *Assets* zu kompilieren, Entwicklungsdateien (wie `node_modules` oder `tests/`) zu ignorieren, das SVN von WordPress.org auszuchecken, die Dateien nach `trunk` zu verschieben, das `tag` zu erstellen und den *Commit* durchzuführen. Die Komplexität von Subversion wird dadurch vollständig verborgen.

## 16.4 Updates und Changelogs

Die Veröffentlichung der Version 1.0.0 deines Plugins ist erst der Anfang des Software-Lebenszyklus. Das Plugin aktuell zu halten, Änderungen effektiv an die Benutzer zu kommunizieren und interne Datenmigrationen zu verwalten, sind kritische Aufgaben, um die Langlebigkeit deiner Entwicklung im Ökosystem sicherzustellen.

### Der Update-Mechanismus des Cores

Um den Update-Zyklus korrekt zu verwalten, ist es wichtig zu verstehen, wie WordPress feststellt, ob eine neue Version deines Plugins vorliegt. Dieser Prozess erfolgt nicht in Echtzeit, sondern wird vom System der geplanten Aufgaben (WP-Cron) im Zusammenspiel mit der API des offiziellen Repositories gesteuert.

```text
+----------------------+        +-----------------------------------+
|  WordPress des       |        |  API von WordPress.org            |
|  Benutzers (Lokal)   |        |  (api.wordpress.org/plugins/...)  |
+----------------------+        +-----------------------------------+
| 1. Löst WP-Cron aus  | -----> | 2. Sendet Array der aktiven       |
|    (Alle 12 Stunden) |        |    Plugins und deren installierte |
|                      |        |    Versionen.                     |
| 5. Zeigt Update-     | <----- | 4. Antwortet mit Metadaten der    |
|    „Bubble“ an       |        |    neuen Version und URL der .zip |
+----------------------+        +-----------------------------------+
                                  |
                                  | 3. Die API fragt dein Repository ab
                                  v
                        +-----------------------------------+
                        | SVN-Repository deines Plugins     |
                        | - Prüft /trunk/readme.txt         |
                        | - Liest das Feld „Stable tag“ aus |
                        +-----------------------------------+

```

Wenn du ein neues `Stable tag` in deiner `readme.txt` konfigurierst und das entsprechende Tag ins SVN hochlädst, benötigt die API von WordPress.org einige Minuten, um die Änderung zu verarbeiten. Ab diesem Moment erkennt jede WordPress-Installation, die ihre regelmäßige Überprüfung durchführt (oder ein Benutzer, der auf „Nach Updates suchen“ klickt), die neue Version.

### Semantische Versionierung (SemVer)

WordPress empfiehlt dringend die Einhaltung der Praktiken der **semantischen Versionierung** (Semantic Versioning). Die Versionsnummer sollte in drei durch Punkte getrennte Segmente gegliedert sein: `MAJOR.MINOR.PATCH` (z. B. `2.1.4`).

* **MAJOR (Hauptversion):** Tiefgreifende Änderungen in der Architektur, vollständige Redesigns der Benutzeroberfläche oder Brüche in der Abwärtskompatibilität (Breaking Changes). Benutzer sollten bei diesem Update vorsichtig sein.
* **MINOR (Nebenversion):** Neue Funktionen, Features oder Verbesserungen, die vollständig abwärtskompatibel mit der vorherigen Version sind.
* **PATCH (Fehlerbehebung):** Bugfixes, Sicherheitspatches oder kleinere Code-Refactorings, die die allgemeine Funktionalität nicht verändern.

Die Einhaltung dieser Logik schafft Vertrauen. Wenn ein Administrator ein Update von `1.2.3` auf `1.2.4` sieht, geht er davon aus, dass es sicher automatisch angewendet werden kann. Wenn er einen Sprung auf `2.0.0` sieht, weiß er, dass er das Update zuerst in einer *Staging*-Umgebung testen sollte.

### Die Kunst des Changelogs

Das Änderungsprotokoll (Changelog) ist das wichtigste Kommunikationsmittel zwischen dir und den Benutzern (oder Systemadministratoren). Ein gutes Changelog sollte ein ausgewogenes Verhältnis zwischen Fachsprache für Entwickler und klaren Vorteilen für den Endbenutzer bieten.

Innerhalb deiner Datei `readme.txt` sollte der Abschnitt `== Changelog ==` unter Verwendung der Versionsnummer als Überschrift der dritten Ebene (`= X.Y.Z =`) strukturiert werden.

**Empfohlene Formatierungspraktiken:**

```text
== Changelog ==

= 2.1.0 =
* Neu: Native Unterstützung für Gutenberg-Blöcke in CPTs.
* Verbessert: Leistung der SQL-Abfrage im Haupt-Dashboard (30 % Reduzierung der Ladezeit).
* Behoben: Fataler Fehler, der beim Speichern von Optionen ohne Administratorrechte auftrat.
* Entfernt: Veralteter Support für PHP 7.2.

= 2.0.1 =
* Behoben: Reflektierte XSS-Schwachstelle im Frontend-Suchfeld (Danke an @security_researcher).
* Patch: Kleinerer CSS-Fix für mobile Bildschirme.

```

\*Hinweis: WordPress.org verarbeitet und zeigt Aufzählungspunkte nur dann korrekt an, wenn sie mit einem Sternchen (`*`) beginnen. Das Klassifizieren jeder Zeile mit aktiven Begriffen (Neu, Verbessert, Behoben) erleichtert das schnelle Erfassen.\*

### Datenbankmigrationen bei Updates

Eine wiederkehrende Herausforderung bei komplexen Plugins besteht darin, die Aktualisierungen der Datenstruktur zu verwalten, wenn der Benutzer die physischen Dateien des Plugins aktualisiert. Das Überschreiben der `.php`-Dateien (was WordPress bei einem Update tut) ändert nicht automatisch benutzerdefinierte Tabellen oder Optionen in der Datenbank (`$wpdb`).

Du musst eine **stille Update-Routine** implementieren. Dies wird erreicht, indem die in der Datenbank installierte Version mit der im Code deklarierten Version verglichen wird.

```php
/**
 * Konstante mit der aktuellen Version des Plugin-Codes.
 */
define( 'MI_PLUGIN_VERSION', '2.1.0' );

/**
 * Hook, der bei jedem Laden von WordPress ausgelöst wird – ideal zum Überprüfen auf Updates.
 */
add_action( 'plugins_loaded', 'mi_plugin_comprobar_actualizacion' );

function mi_plugin_comprobar_actualizacion() {
    // Die in der Datenbank registrierte Version abrufen (standardmäßig '1.0.0', falls nicht vorhanden)
    $version_db = get_option( 'mi_plugin_version_db', '1.0.0' );

    // Wenn die Codeversion höher ist als die in der DB, müssen wir updaten
    if ( version_compare( $version_db, MI_PLUGIN_VERSION, '<' ) ) {
        mi_plugin_ejecutar_migraciones( $version_db );
        
        // Die Option in der Datenbank aktualisieren, um die Migration nicht zu wiederholen
        update_option( 'mi_plugin_version_db', MI_PLUGIN_VERSION );
    }
}

/**
 * Bedingte Migrationslogik.
 */
function mi_plugin_ejecutar_migraciones( $version_db ) {
    global $wpdb;

    // Wenn der Benutzer von einer Version vor 2.0.0 aktualisiert
    if ( version_compare( $version_db, '2.0.0', '<' ) ) {
        // Beispiel: Modifizieren einer in Kapitel 5 erstellten benutzerdefinierten Tabelle
        $tabla = $wpdb->prefix . 'mis_registros';
        $wpdb->query( "ALTER TABLE {$tabla} ADD COLUMN status VARCHAR(20) DEFAULT 'active';" );
    }

    // Wenn der Benutzer von einer Version vor 2.1.0 aktualisiert
    if ( version_compare( $version_db, '2.1.0', '<' ) ) {
        // Beispiel: Migrieren einer alten Einzeloption in ein neues Einstellungs-Array
        $vieja_opcion = get_option( 'mi_plugin_color_viejo' );
        if ( $vieja_opcion ) {
            $nueva_config = array( 'tema' => 'custom', 'color' => $vieja_opcion );
            update_option( 'mi_plugin_settings', $nueva_config );
            delete_option( 'mi_plugin_color_viejo' );
        }
    }
}

```

Dieses Muster stellt sicher, dass – unabhängig davon, ob ein Benutzer dein Plugin von der direkt vorherigen Version oder von einer Version vor zwei Jahren aktualisiert – die Datenmigrationen nacheinander ausgeführt werden und seine Installation perfekt mit der neuen Code-Architektur synchronisiert bleibt.

## Zusammenfassung des Kapitels

In diesem abschließenden Kapitel haben wir die wesentlichen Schritte für den Übergang einer privaten Entwicklung in das öffentliche Ökosystem von WordPress.org behandelt:

1. **Richtlinien des Repositories:** Wir haben die unumstößlichen Regeln des Review-Teams verstanden, insbesondere die absolute Notwendigkeit der Kompatibilität mit der GPLv2+-Lizenz, den Respekt vor Markenrechten und die strengen Datenschutzbestimmungen, die Telemetrie ohne Zustimmung oder verstecktes Tracking verbieten.
2. **Vorbereitung der readme-Datei:** Wir haben die erforderliche Markdown-Syntax zur Strukturierung der öffentlichen Plugin-Seite analysiert, mit besonderem Augenmerk auf kritische Metadaten wie `Tested up to`, `Requires PHP` und das `Stable tag`, die die Kompatibilität und Verfügbarkeit des Downloads festlegen.
3. **Versionsverwaltung mit SVN:** Wir haben Subversion (SVN) entmystifiziert und es als exklusives Deployment-Tool behandelt. Wir haben die unveränderliche Struktur der Verzeichnisse `/trunk`, `/tags` und `/assets` besprochen und die Wichtigkeit etabliert, die Versionskonstante in PHP mit dem stabilen Tag im SVN abzustimmen.
4. **Updates und Changelogs:** Schließlich haben wir den asynchronen Update-Fluss des WordPress-Cores untersucht. Wir haben gelernt, ein effektives *Changelog* zu strukturieren und eine PHP-Migrationsroutine mithilfe der Funktion `version_compare()` zu implementieren, um sicherzustellen, dass physische Code-Updates mit der korrekten Weiterentwicklung des Datenbank-Schemas einhergehen.

## Epilog: Die Zukunft deines Codes

Du bist am Ende dieser Reise angelangt. Jetzt besitzt du das technische Wissen, um vom einfachen Benutzer zum Lösungsarchitekten aufzusteigen, indem du Core-APIs, Sicherheit, Datenmanipulation und die offizielle Veröffentlichung beherrschst.

Das WordPress-Ökosystem ist dynamisch und erfordert kontinuierliches Lernen. Bleibe neugierig, überprüfe deine Entwicklungen anhand neuer Core-Versionen und zögere nicht, zur Open-Source-Community beizutragen. Mit diesen soliden Grundlagen hast du die Macht in der Hand, robuste Werkzeuge zu schaffen, die Tausende von Webprojekten weltweit unterstützen. Viel Erfolg bei deinen zukünftigen Entwicklungen!
