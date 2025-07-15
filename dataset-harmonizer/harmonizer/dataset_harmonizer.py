#!/usr/bin/env python3
"""Dataset Harmonizer worker.

This script performs basic dataset cleanup and conversion.  It can be run on its
own or inside the worker container defined in ``Dockerfile`` and
``worker-compose.yml``.
"""

import argparse
import logging
import os
from pathlib import Path

from PIL import Image, ImageOps
from tqdm import tqdm


def parse_args():
    parser = argparse.ArgumentParser(description="Harmonize image datasets")
    parser.add_argument("input_dir")
    parser.add_argument("output_dir")
    parser.add_argument("--dataset_name", default="dataset")
    parser.add_argument("--output_format", default="png")
    parser.add_argument("--image_size", type=int, nargs=2)
    parser.add_argument("--auto_resize", action="store_true")
    parser.add_argument("--target_short_side", type=int, default=512)
    parser.add_argument("--padding", action="store_true")
    return parser.parse_args()


def setup_logging():
    """Configure log output.

    When executed inside the Docker container the ``/logs`` directory is
    mounted.  If that directory does not exist we fall back to a ``logs``
    folder next to this script.
    """

    log_dir = Path("/logs")
    if not log_dir.exists():
        log_dir = Path(__file__).resolve().parent.parent / "logs"
    log_dir.mkdir(parents=True, exist_ok=True)
    logging.basicConfig(
        filename=str(log_dir / "harmonizer.log"),
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(message)s",
    )
    return log_dir


def main():
    args = parse_args()
    log_dir = setup_logging()

    input_path = Path(args.input_dir)
    output_path = Path(args.output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    images = sorted(
        [p for p in input_path.rglob("*") if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".bmp", ".gif", ".tiff", ".webp"}]
    )
    if not images:
        logging.warning("No images found in %s", input_path)
        return

    logging.info("Processing %d images from %s to %s", len(images), input_path, output_path)

    progress_env = os.getenv("PROGRESS")

    iterator = enumerate(images, start=1)
    if not progress_env:
        iterator = enumerate(tqdm(images, desc="harmonizing"), start=1)

    for idx, img_path in iterator:
        try:
            with Image.open(img_path) as im:
                im.load()

                if args.image_size:
                    im = im.resize(tuple(args.image_size), Image.LANCZOS)
                elif args.auto_resize:
                    w, h = im.size
                    short = min(w, h)
                    scale = args.target_short_side / float(short)
                    im = im.resize((int(w * scale), int(h * scale)), Image.LANCZOS)

                if args.padding:
                    max_side = max(im.size)
                    im = ImageOps.pad(im, (max_side, max_side), color=(0, 0, 0))

                out_name = f"{args.dataset_name}{idx:04d}.{args.output_format}"
                out_file = output_path / out_name
                im.convert("RGB").save(out_file, format=args.output_format.upper())
        except Exception as exc:  # pylint: disable=broad-except
            logging.error("Failed processing %s: %s", img_path, exc)

        if progress_env:
            print(f"PROGRESS {idx} {len(images)}", flush=True)

    logging.info("Finished processing %d images", len(images))
    print(f"Processed {len(images)} images. Logs at {log_dir}")


if __name__ == "__main__":
    main()
