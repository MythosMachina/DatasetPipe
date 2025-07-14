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
