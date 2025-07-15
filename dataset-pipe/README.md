# Dataset Pipe

This directory contains example Dockerfiles for each planned processing step. Each step runs in its own container.

```
frame-extraction/          # ffmpeg grabs frames from video
deduplication/             # remove near duplicates
filtering/                 # flatten folders and drop unwanted shots
upscaling-qc/              # upscale images and run quality checks
cropping/                  # crop faces using detection models
annotation/                # generate captions with WD14 tagger
character-classification/  # group images by character traits
packaging/                 # create final ZIP packages
```

Each folder includes a basic `Dockerfile` demonstrating the expected environment for that stage.
