# **AGENTS.md – Dataset Harmonizer mit Webinterface**

## **Ziel**

Ein flexibles Tool zur Harmonisierung chaotischer Bilddatensätze mit:

* **CLI-Modus** für Power-User
* **Webinterface** für komfortable visuelle Nutzung

---

## **Hauptfunktionen**

| Funktion                      | Beschreibung                                                       |
| ----------------------------- | ------------------------------------------------------------------ |
| **Integritätscheck**          | Prüft, ob Bilder lesbar sind                                       |
| **Format-Harmonisierung**     | Einheitliches Bildformat (z. B. PNG)                               |
| **Auto-Resize (optional)**    | Kürzere Seite wird auf 512px gesetzt, Aspect-Ratio bleibt erhalten |
| **Padding (optional)**        | Quadratische Ausgabe                                               |
| **Einheitliche Namensgebung** | `datasetnameXXXX.format`                                           |
| **Fehler-Handling**           | Kein Datenverlust, Fehler werden geloggt                           |
| **Web-Interface**             | Upload, Konfiguration, Fortschrittsanzeige                         |

---

## **Projektstruktur**

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

---

## **Parameter (CLI & Web)**

| Name                | Typ                        | Beschreibung                               |
| ------------------- | -------------------------- | ------------------------------------------ |
| `input_dir`         | String                     | Eingangsordner                             |
| `output_dir`        | String                     | Zielordner                                 |
| `dataset_name`      | String                     | Namenspräfix                               |
| `output_format`     | String                     | Ziel-Format                                |
| `image_size`        | Tuple\[int, int], optional | Feste Größe                                |
| `auto_resize`       | Bool                       | Aktiviert per-Bild Resize                  |
| `target_short_side` | Int                        | Kürze Seite auf diesen Wert (Default: 512) |
| `padding`           | Bool                       | Padding auf quadratisches Format           |

---

## **CLI Workflow**

1. Starte `dataset_harmonizer.py` mit Parametern.
2. Integritätscheck wird durchgeführt.
3. Verarbeitung beginnt:

   * Fester Resize **oder**
   * Auto-Resize mit Aspect-Ratio
   * Optional Padding
4. Fortschritt via `tqdm`
5. Fehler werden in `logs/` dokumentiert.
6. Abschlussbericht wird ausgegeben.

---

## **Web Workflow**

### **Frontend (Browser)**

* Drag & Drop ZIP Upload
* Parameter-Konfiguration per Formular
* Fortschrittsanzeige via WebSocket / SSE
* Anzeige von Fehlerlogs und Erfolgsbericht
* Download-Link für das Ergebnis-Dataset

---

### **Backend (Node.js)**

1. **Datei-Upload:**

   * ZIP wird angenommen
   * Entpacken nach `uploads/`
2. **API-Aufruf:**

   * Übergibt Parameter an Python-Tool via `child_process.spawn`
3. **Live-Status:**

   * Fortschritt via WebSocket / SSE an den Browser senden
4. **Ergebnisbereitstellung:**

   * Harmonisiertes Dataset als Download anbieten
   * Logs anzeigen & bereitstellen

---

## **Technologien**

| Bereich    | Tech                                                            |
| ---------- | --------------------------------------------------------------- |
| Harmonizer | Python 3.8+, Pillow, tqdm, argparse, logging                    |
| Webserver  | Node.js, Express, multer, WebSocket/SSE                         |
| Frontend   | HTML, CSS, JS (vanilla oder leichtgewichtig mit React optional) |

---

## **Fehlerhandling**

* **Integritätsfehler:** `integrity_check_log.txt`
* **Verarbeitungsfehler:** `error_log.txt`
* **Webserver-Fehler:** Standard HTTP Fehlerbehandlung mit JSON-Response

---

## **Kompatibilität**

* **OS:** Windows, Linux, MacOS
* **Browser:** Chrome, Firefox, Edge, Safari

---

## **Zusatzoptionen**

* **Dry-Run Modus**
* **Multi-Threading (optional später ergänzbar)**
