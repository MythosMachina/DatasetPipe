#!/usr/bin/env python3
"""Build a consolidated changelog document from scattered changelog files."""
from __future__ import annotations

import argparse
from dataclasses import dataclass
from datetime import datetime
import re
from pathlib import Path
from typing import Iterable, List

DATE_PATTERN = re.compile(r"(?P<date>\d{4}[-/]\d{2}[-/]\d{2})")
LINE_START_PATTERN = re.compile(r"^[#\[*\d]")


@dataclass
class Entry:
    date: datetime
    date_label: str
    content: str
    source: Path

    @property
    def source_label(self) -> str:
        return str(self.source)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("CHANGELOG_CONSOLIDATED.md"),
        help="Path to the consolidated changelog document",
    )
    parser.add_argument(
        "--root",
        type=Path,
        default=Path("."),
        help="Repository root to scan for changelog files",
    )
    return parser.parse_args()


def discover_changelog_files(root: Path, output: Path) -> List[Path]:
    files: List[Path] = []
    for path in root.rglob("*"):
        if not path.is_file():
            continue
        name_lower = path.name.lower()
        if "changelog" not in name_lower:
            continue
        try:
            if path.resolve() == output.resolve():
                continue
        except FileNotFoundError:
            pass
        files.append(path)
    return sorted(files)


def parse_date(raw: str) -> datetime:
    if "/" in raw:
        return datetime.strptime(raw, "%Y/%m/%d")
    return datetime.strptime(raw, "%Y-%m-%d")


def iter_entries(path: Path) -> Iterable[Entry]:
    text = path.read_text(encoding="utf-8", errors="ignore")
    lines = text.splitlines()

    candidate_indices: List[tuple[int, str]] = []
    for idx, line in enumerate(lines):
        stripped = line.strip()
        if not stripped:
            continue
        if not LINE_START_PATTERN.match(stripped):
            continue
        date_match = DATE_PATTERN.search(stripped)
        if not date_match:
            continue
        raw_date = date_match.group("date")
        candidate_indices.append((idx, raw_date))

    for i, (start_idx, raw_date) in enumerate(candidate_indices):
        end_idx = candidate_indices[i + 1][0] if i + 1 < len(candidate_indices) else len(lines)
        entry_lines = lines[start_idx:end_idx]
        while entry_lines and not entry_lines[-1].strip():
            entry_lines.pop()
        if not entry_lines:
            continue
        normalised_date = raw_date.replace("/", "-")
        yield Entry(
            date=parse_date(raw_date),
            date_label=normalised_date,
            content="\n".join(entry_lines).rstrip(),
            source=path,
        )


def build_document(entries: Iterable[Entry], output: Path) -> None:
    sorted_entries = sorted(entries, key=lambda e: (e.date, e.source_label, e.content))
    lines = [
        "# Consolidated Changelog",
        "",
        "This document combines changelog entries discovered throughout the repository",
        "and orders them chronologically with the most recent updates listed last.",
        "",
    ]

    for entry in sorted_entries:
        lines.append(f"## {entry.date_label} — {entry.source_label}")
        lines.append("")
        lines.append("```markdown")
        lines.append(entry.content)
        lines.append("```")
        lines.append("")

    output.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    args = parse_args()
    files = discover_changelog_files(args.root, args.output)
    entries: List[Entry] = []
    for file_path in files:
        entries.extend(iter_entries(file_path))
    build_document(entries, args.output)


if __name__ == "__main__":
    main()
