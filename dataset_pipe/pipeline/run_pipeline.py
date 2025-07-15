#!/usr/bin/env python3
"""CLI entrypoint for the Dataset Pipe pipeline."""

from pathlib import Path
import argparse
from .pipeline_runner import Pipeline
from .logging_utils import rotate_log


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run the dataset pipeline")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--video", help="Input video file")
    group.add_argument("--images", help="Directory with input images")
    parser.add_argument("output", help="Output directory for results")
    parser.add_argument("--work", default="/tmp/work", help="Working directory")
    parser.add_argument("--trigger_word", default="name")
    parser.add_argument("--fps", type=int, default=1)
    parser.add_argument("--skip_deduplication", action="store_true")
    parser.add_argument("--skip_filtering", action="store_true")
    parser.add_argument("--skip_upscaling", action="store_true")
    parser.add_argument("--skip_cropping", action="store_true")
    parser.add_argument("--skip_annotation", action="store_true")
    parser.add_argument("--skip_classification", action="store_true")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    job_name = Path(args.output).name
    rotate_log(job_name)
    pipe = Pipeline(Path("."), Path(args.output), Path(args.work))
    pipe.run(
        Path(args.video) if args.video else None,
        images_dir=Path(args.images) if args.images else None,
        trigger_word=args.trigger_word,
        progress_cb=None,
        fps=args.fps,
        skip_deduplication=args.skip_deduplication,
        skip_filtering=args.skip_filtering,
        skip_upscaling=args.skip_upscaling,
        skip_cropping=args.skip_cropping,
        skip_annotation=args.skip_annotation,
        skip_classification=args.skip_classification,
    )


if __name__ == "__main__":
    main()

