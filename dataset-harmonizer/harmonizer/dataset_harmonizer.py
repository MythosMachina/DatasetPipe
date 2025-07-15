#!/usr/bin/env python3
"""Dataset Harmonizer worker.

Placeholder script that will handle dataset cleanup and conversion.
"""

import argparse


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


def main():
    args = parse_args()
    # TODO: implement harmonization logic
    print(f"Processing {args.input_dir} -> {args.output_dir}")


if __name__ == "__main__":
    main()
