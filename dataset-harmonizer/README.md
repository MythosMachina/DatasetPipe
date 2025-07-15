# Dataset Harmonizer

This directory contains the initial structure for the Dataset Harmonizer proof of concept.

- **harmonizer/** – Python worker container and script
- **webserver/** – Node.js backend and simple orchestrator
- **uploads/** – Temporary file uploads
- **outputs/** – Harmonized datasets
- **logs/** – Processing logs

The orchestrator builds the worker image on startup and spawns a Docker container for each job.
