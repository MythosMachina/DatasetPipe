# Dataset Harmonizer POC

Die Dataset Harmonizer Proof-of-Concept (POC) demonstriert ein flexibles Tool, um chaotische Bilddatensätze zu bereinigen und für weitere Verarbeitung vorzubereiten. Das Projekt vereint eine bedienfreundliche Weboberfläche mit einem Kommandozeilen-Interface für Power-User.

## Funktionen

- **Integritätscheck** – überprüft, ob Bilder gelesen werden können
- **Format-Harmonisierung** – konvertiert alle Bilder in ein einheitliches Format (z. B. PNG)
- **Auto-Resize (optional)** – setzt die kürzere Seite jedes Bildes auf 512 px, behält das Seitenverhältnis bei
- **Padding (optional)** – erzeugt quadratische Ausgaben
- **Einheitliche Namensgebung** – speichert Dateien als `datasetnameXXXX.format`
- **Fehler-Handling** – loggt alle Probleme, ohne Daten zu verlieren
- **Web-Interface** – komfortabler Upload, Konfiguration und Fortschrittsanzeige

## Projektübersicht

```
dataset-harmonizer/
│
├── harmonizer/
│   └── dataset_harmonizer.py   # Python Harmonizer
│
├── webserver/
│   ├── server.js               # Node.js Webserver
│   ├── routes/                 # API Endpunkte
│   └── public/                 # Frontend (HTML, CSS, JS)
│
├── uploads/                    # Upload-Verzeichnis (temporär)
├── outputs/                    # Harmonisierte Datensätze
├── logs/                       # Log-Dateien
└── README.md                   # Dokumentation
```

## Parameter (CLI & Web)

| Name                | Typ                        | Beschreibung                     |
| ------------------- | -------------------------- | -------------------------------- |
| `input_dir`         | String                     | Eingangsordner                   |
| `output_dir`        | String                     | Zielordner                       |
| `dataset_name`      | String                     | Namenspräfix                    |
| `output_format`     | String                     | Ziel-Format                      |
| `image_size`        | Tuple[int, int], optional  | Feste Größe                    |
| `auto_resize`       | Bool                       | Aktiviert per-Bild Resize        |
| `target_short_side` | Int                        | Kürzere Seite (Standard 512)    |
| `padding`           | Bool                       | Quadratisches Padding            |

## CLI Workflow

1. Aufruf von `dataset_harmonizer.py` mit den gewünschten Parametern
2. Integritätscheck der Eingangsdaten
3. Verarbeitung (Resize, Auto-Resize, Padding)
4. Fortschritt via `tqdm`
5. Fehlerprotokolle werden unter `logs/` gespeichert
6. Abschlussbericht wird ausgegeben

## Web Workflow

**Frontend**

- Drag-&-Drop-Upload von ZIP-Dateien
- Formular zur Parameterkonfiguration
- Live-Fortschrittsanzeige über WebSocket oder Server-Sent Events (SSE)
- Anzeige von Fehlern und Erfolgsbericht
- Download-Link für das Ergebnis

**Backend (Node.js)**

1. Entgegennahme und Entpacken des ZIP-Uploads
2. Aufruf des Python-Harmonizers mit den angegebenen Parametern
3. Weitergabe des Fortschritts an den Browser
4. Bereitstellung des harmonisierten Datensatzes und der Protokolle

## Technologien

| Bereich    | Tech                        |
| ---------- | --------------------------- |
| Harmonizer | Python 3.8+, Pillow, tqdm   |
| Webserver  | Node.js, Express, multer    |
| Frontend   | HTML, CSS, JavaScript       |

## Fehlerbehandlung

- **Integritätsfehler**: `integrity_check_log.txt`
- **Verarbeitungsfehler**: `error_log.txt`
- **Webserver-Fehler**: HTTP-Statuscodes mit JSON-Antworten

## Kompatibilität

- **Betriebssysteme**: Windows, Linux, macOS
- **Browser**: Chrome, Firefox, Edge, Safari

## Zusatzoptionen

- **Dry-Run-Modus** – Testlauf ohne echte Verarbeitung
- **Multi-Threading** (geplant)

