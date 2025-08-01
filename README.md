# Dataset Harmonizer POC

The Dataset Harmonizer proof of concept demonstrates a flexible tool for cleaning and preparing chaotic image datasets. It combines an intuitive web interface with a command line interface for power users.

## Features

- **Integrity check** – verifies that images can be read
- **Format harmonization** – converts all images to a single format (e.g. PNG)
- **Auto-resize (optional)** – scales the shortest side of each image to 512 px while preserving the aspect ratio
- **Padding (optional)** – creates square outputs
- **Unified naming** – files saved as `datasetnameXXXX.format`
- **Error handling** – logs issues without losing data
- **Web interface** – convenient upload, configuration and progress display

## Project Overview

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
├── uploads/                    # Temporary upload directory
├── outputs/                    # Harmonized datasets
├── logs/                       # Log files
└── README.md                   # Documentation
```

## Parameters (CLI & Web)

| Name                | Type                       | Description                                   |
| ------------------- | -------------------------- | --------------------------------------------- |
| `input_dir`         | String                     | Input directory                               |
| `output_dir`        | String                     | Target directory                              |
| `dataset_name`      | String                     | Name prefix                                   |
| `output_format`     | String                     | Output format                                 |
| `image_size`        | Tuple[int, int], optional  | Fixed size                                    |
| `auto_resize`       | Bool                       | Enable per-image resize                       |
| `target_short_side` | Int                        | Short side length (default 512)               |
| `padding`           | Bool                       | Add square padding                            |

## CLI Workflow

1. Run `dataset_harmonizer.py` with the desired parameters.
2. Perform an integrity check on the input data.
3. Process the images (resize, auto-resize, padding).
4. Display progress via `tqdm`.
5. Store logs under `logs/`.
6. Output a final report.

## Web Workflow

**Frontend**

- Dark theme with orange highlights for a modern look
- Drag-and-drop ZIP upload
- Parameter configuration form
- Live progress via WebSocket or Server-Sent Events (SSE)
- Display errors and success report
- Download link for the result

**Backend (Node.js)**

1. Receive and extract the ZIP upload.
2. Invoke the Python harmonizer with the chosen parameters.
3. Forward progress to the browser.
4. Provide the harmonized dataset and logs.

## User Data Flow

1. Uploaded files are extracted to `uploads/<userId>/`.
2. Users mark files for processing, creating `uploads/<userId>/<jobId>/` for each job.
3. The orchestrator launches a worker container named `<userId>_processing_<jobId>` and mounts:
   - `uploads/<userId>/<jobId>/` as input
   - `outputs/<userId>/<jobId>/` as output
   - `logs/<userId>/<jobId>/` for logs
4. The worker processes the images and writes to the output mount.
5. After completion the orchestrator stops and removes the container.

This mapping keeps jobs isolated so several users can work in parallel.

## Deployment

When the server boots, the orchestrator automatically builds the necessary Docker images from the provided `Dockerfile`. Worker containers are then launched on demand through `docker compose`. A session tracker maps containers to user sessions so that multiple jobs can run in parallel and each container can be cleaned up correctly once its job finishes.

## Technologies

| Area       | Tech                        |
| ---------- | --------------------------- |
| Harmonizer | Python 3.8+, Pillow, tqdm   |
| Web server | Node.js, Express, multer    |
| Frontend   | HTML, CSS, JavaScript       |

## Error Handling

- **Integrity errors:** `integrity_check_log.txt`
- **Processing errors:** `error_log.txt`
- **Web server errors:** HTTP status codes with JSON responses

## Compatibility

- **Operating systems:** Windows, Linux, macOS
- **Browser:** Chrome, Firefox, Edge, Safari

## Additional Options

- **Dry-run mode** – test run without modifying data
- **Multi-threading** (planned)

## Dataset Pipe Roadmap

Example Dockerfiles for each processing step are provided under `dataset-pipe/`:

1. Frame Extraction
2. Deduplication
3. Filtering
4. Upscaling & QC
5. Cropping
6. Annotation
7. Character Classification
8. Packaging
