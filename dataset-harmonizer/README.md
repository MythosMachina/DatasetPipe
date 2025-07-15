# Dataset Harmonizer

This directory contains the initial structure for the Dataset Harmonizer proof of concept.

- **harmonizer/** – Python worker container and script
- **webserver/** – Node.js backend and simple orchestrator
- **uploads/** – Temporary file uploads
- **outputs/** – Harmonized datasets
- **logs/** – Processing logs

The orchestrator builds the worker image on startup and spawns a Docker container for each job. A small web UI provides a dark layout with orange accents and shows progress during processing.

## Harmonizer Script

``dataset_harmonizer.py`` provides a command line interface for dataset cleanup.
It performs an integrity check, optional resizing, padding and format
conversion.  Processed files are written to the target directory using a unified
naming scheme.

Example usage:

```bash
python dataset_harmonizer.py input_dir output_dir --dataset_name ds --output_format png --auto_resize --padding
```
