# AGENTS.md – Dataset Harmonizer with Web Interface

## Goal

A flexible tool for harmonizing chaotic image datasets featuring:

* **CLI mode** for power users
* **Web interface** for convenient visual control

---

## Key Features

| Feature                    | Description                                                  |
| -------------------------- | ------------------------------------------------------------ |
| **Integrity check**        | Validate that images can be read                             |
| **Format harmonization**   | Convert images to a single format (e.g. PNG)                 |
| **Auto-resize (optional)** | Short edge resized to 512 px while maintaining aspect ratio  |
| **Padding (optional)**     | Produce square outputs                                       |
| **Unified naming**         | `datasetnameXXXX.format`                                     |
| **Error handling**         | No data loss, all errors logged                              |
| **Web interface**          | Upload, configuration, and progress display                  |

---

## Project Structure

```
dataset-harmonizer/
│
├── harmonizer/
│   └── dataset_harmonizer.py   # Python harmonizer
│
├── webserver/
│   ├── server.js               # Node.js web server
│   ├── routes/                 # API endpoints
│   └── public/                 # Frontend (HTML, CSS, JS)
│
├── uploads/                    # Temporary upload folder
├── outputs/                    # Harmonized datasets
├── logs/                       # Log files
└── README.md                   # Documentation
```

## Components

1. **Backend** – Node.js server on bare metal with API and user management
2. **Worker** – Python pipeline in Docker, spawned per session
3. **Frontend** – Web interface served from a Docker container
4. **Container orchestrator** – spawns and cleans up worker containers

---

## Deployment Architecture

* The **Node.js backend** runs directly on the host and manages user accounts.
* The **web server** and **frontend** live in a Docker container.
* At startup the orchestrator builds the required images from the provided Dockerfiles.
* Each job spawns a dedicated **worker container** using `docker compose` so that sessions remain isolated.
* A tracking mechanism records which session owns which container, allowing multiple users to run jobs in parallel.
* The orchestrator removes containers when processing completes.

---

## Parameters (CLI & Web)

| Name                | Type                      | Description                                   |
| ------------------- | ------------------------- | --------------------------------------------- |
| `input_dir`         | String                    | Input folder                                  |
| `output_dir`        | String                    | Target folder                                 |
| `dataset_name`      | String                    | Name prefix                                   |
| `output_format`     | String                    | Target format                                 |
| `image_size`        | Tuple[int, int], optional | Fixed size                                    |
| `auto_resize`       | Bool                      | Enable per-image resize                       |
| `target_short_side` | Int                       | Short side length (default: 512)              |
| `padding`           | Bool                      | Square padding                                |

---

## CLI Workflow

1. Run `dataset_harmonizer.py` with parameters.
2. Perform the integrity check.
3. Start processing:

   * Fixed resize **or**
   * Auto-resize while keeping aspect ratio
   * Optional padding
4. Show progress via `tqdm`.
5. Log errors to `logs/`.
6. Output a final report.

---

## Web Workflow

### Frontend (Browser)

* Drag & drop ZIP upload
* Configure parameters via form
* Progress display using WebSocket/SSE
* Show error logs and success report
* Download link for the resulting dataset

---

### Backend (Node.js)

0. **User management:**

   * Authenticate users and maintain sessions
1. **File upload:**

   * Accept ZIP archive
   * Unpack to `uploads/`
2. **API call:**

   * Pass parameters to the Python tool via `child_process.spawn`
3. **Live status:**

   * Send progress to the browser via WebSocket/SSE
4. **Provide results:**

   * Offer the harmonized dataset for download
   * Show and provide logs

---

## Technologies

| Area       | Tech                                                         |
| ---------- | ------------------------------------------------------------ |
| Harmonizer | Python 3.8+, Pillow, tqdm, argparse, logging                 |
| Web server | Node.js, Express, multer, WebSocket/SSE                      |
| Frontend   | HTML, CSS, JS (vanilla or lightweight React optional)        |

---

## Error Handling

* **Integrity errors:** `integrity_check_log.txt`
* **Processing errors:** `error_log.txt`
* **Web server errors:** Standard HTTP error handling with JSON response

---

## Compatibility

* **OS:** Windows, Linux, macOS
* **Browser:** Chrome, Firefox, Edge, Safari

---

## Additional Options

* **Dry-run mode**
* **Multi-threading** (can be added later)
