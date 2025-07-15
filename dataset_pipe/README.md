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

## Python pipeline

The repository now contains a small Python implementation of the full dataset
pipeline under `pipeline/`.  The code was adapted from the
`DataSetKurator` project and provides step functions as well as a
`Pipeline` runner.  It mirrors the eight stages listed above and can be
used without Docker for quick experiments.

`python -m dataset_pipe.pipeline.run_pipeline` offers a small CLI wrapper that
prints progress messages when the `PROGRESS` environment variable is set.
You can process either a video or a folder of images:

```
python -m dataset_pipe.pipeline.run_pipeline --video input.mp4 output_dir
python -m dataset_pipe.pipeline.run_pipeline --images images/ output_dir
```

Example usage:

```python
from dataset_pipe.pipeline.pipeline_runner import Pipeline

pipe = Pipeline(
    input_dir=Path('input'),
    output_dir=Path('output'),
    work_dir=Path('work')
)
pipe.run(Path('video.mp4'))  # or pipe.run(None, images_dir=Path('images'))
```

See the individual modules under `pipeline/steps/` for details.
